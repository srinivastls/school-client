import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Modal,
} from "react-native";

import { useNavigation, useRoute } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import  {
    teacherServices,
  TeacherAttendanceStatus,
  TeacherSectionAttendanceStudent,
  TeacherSectionAttendanceResponse,
} from "../../services/teacherServices";


/* ============================================================
   TYPES
============================================================ */

type RouteParams = {
  sectionId: string;
  classId: string;
  classNumber?: string;
  sectionName?: string;
};


/* ============================================================
   HELPERS
============================================================ */

const pad = (value: number) =>
  String(value).padStart(2, "0");


const formatDateForApi = (
  date: Date
): string => {
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
  ].join("-");
};


const formatDisplayDate = (
  date: Date
): string => {
  return date.toLocaleDateString(
    "en-IN",
    {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};


const getStatusLabel = (
  status: TeacherAttendanceStatus
) => {
  switch (status) {
    case "PRESENT":
      return "Present";

    case "ABSENT":
      return "Absent";

    case "LATE":
      return "Late";

    case "HALF_DAY":
      return "Half Day";

    case "HOLIDAY":
      return "Holiday";

    default:
      return status;
  }
};


const getNextStatus = (
  current: TeacherAttendanceStatus
): TeacherAttendanceStatus => {

  switch (current) {
    case "PRESENT":
      return "ABSENT";

    case "ABSENT":
      return "LATE";

    case "LATE":
      return "HALF_DAY";

    case "HALF_DAY":
      return "PRESENT";

    case "HOLIDAY":
      return "PRESENT";

    default:
      return "PRESENT";
  }
};


/* ============================================================
   SCREEN
============================================================ */

const TeacherSectionAttendanceScreen =
  () => {

    const navigation =
      useNavigation<any>();

    const route =
      useRoute<any>();

    const {
      sectionId,
      classId,
      classNumber,
      sectionName,
    } =
      route.params as RouteParams;


    /* --------------------------------------------------------
       DATE
    -------------------------------------------------------- */

    const [selectedDate, setSelectedDate] =
      useState<Date>(new Date());


    /* --------------------------------------------------------
       DATA
    -------------------------------------------------------- */

    const [
      attendanceData,
      setAttendanceData,
    ] =
      useState<
        TeacherSectionAttendanceResponse | null
      >(null);


    /* --------------------------------------------------------
       LOCAL ATTENDANCE STATE
    -------------------------------------------------------- */

    const [
      attendanceMap,
      setAttendanceMap,
    ] =
      useState<
        Record<
          string,
          {
            status: TeacherAttendanceStatus;
            remark?: string | null;
          }
        >
      >({});


    /* --------------------------------------------------------
       UI STATE
    -------------------------------------------------------- */

    const [loading, setLoading] =
      useState(true);

    const [refreshing, setRefreshing] =
      useState(false);

    const [saving, setSaving] =
      useState(false);

    const [error, setError] =
      useState<string | null>(null);

    const [hasChanges, setHasChanges] =
      useState(false);

    const [remarkStudent, setRemarkStudent] =
      useState<TeacherSectionAttendanceStudent | null>(null);

    const [remarkText, setRemarkText] = useState("");


    /* ========================================================
       DATE STRING
    ======================================================== */

    const dateString = useMemo(
      () =>
        formatDateForApi(
          selectedDate
        ),
      [selectedDate]
    );


    /* ========================================================
       LOAD ATTENDANCE
    ======================================================== */

    const loadAttendance =
      useCallback(
        async (
          showLoader = true
        ) => {

          try {

            if (showLoader) {
              setLoading(true);
            }

            setError(null);

            const response =
              await teacherServices.getSectionAttendance(
                sectionId,
                dateString
              );

            setAttendanceData(
              response
            );


            /* ----------------------------------------------
               BUILD LOCAL MAP
            ---------------------------------------------- */

            const map: Record<
              string,
              {
                status: TeacherAttendanceStatus;
                remark?: string | null;
              }
            > = {};

            for (
              const student
              of response.students
            ) {

              map[student.id] = {
                status:
                  student.attendance
                    ?.status ??
                  "PRESENT",

                remark:
                  student.attendance
                    ?.remark ??
                  null,
              };
            }

            setAttendanceMap(
              map
            );

            setHasChanges(false);

          } catch (err: any) {

            console.error(
              "LOAD SECTION ATTENDANCE ERROR:",
              err
            );

            const message =
              err?.response?.data?.message ??
              err?.message ??
              "Failed to load attendance";

            setError(message);

          } finally {

            setLoading(false);
            setRefreshing(false);
          }
        },
        [
          sectionId,
          dateString,
        ]
      );


    /* ========================================================
       INITIAL LOAD
    ======================================================== */

    useEffect(() => {

      loadAttendance();

    }, [loadAttendance]);


    /* ========================================================
       CHANGE DATE
    ======================================================== */

    const changeDate = (
      direction: number
    ) => {

      if (hasChanges) {

        Alert.alert(
          "Unsaved Changes",
          "You have unsaved attendance changes. Change the date without saving?",
          [
            {
              text: "Cancel",
              style: "cancel",
            },
            {
              text: "Continue",
              style: "destructive",
              onPress: () => {

                const next =
                  new Date(
                    selectedDate
                  );

                next.setDate(
                  next.getDate() +
                    direction
                );

                setSelectedDate(
                  next
                );
              },
            },
          ]
        );

        return;
      }

      const next =
        new Date(
          selectedDate
        );

      next.setDate(
        next.getDate() +
          direction
      );

      setSelectedDate(
        next
      );
    };


    /* ========================================================
       UPDATE STATUS
    ======================================================== */

    const updateStatus = (
      studentId: string
    ) => {

      setAttendanceMap(
        previous => {

          const current =
            previous[
              studentId
            ]?.status ??
            "PRESENT";

          return {
            ...previous,

            [studentId]: {
              ...previous[
                studentId
              ],

              status:
                getNextStatus(
                  current
                ),
            },
          };
        }
      );

      setHasChanges(true);
    };


    /* ========================================================
       MARK ALL PRESENT
    ======================================================== */

    const markAllPresent = () => {

      if (
        !attendanceData ||
        attendanceData.students.length === 0
      ) {
        return;
      }

      setAttendanceMap(
        previous => {

          const updated = {
            ...previous,
          };

          for (
            const student
            of attendanceData.students
          ) {

            updated[
              student.id
            ] = {
              ...updated[
                student.id
              ],

              status:
                "PRESENT",
            };
          }

          return updated;
        }
      );

      setHasChanges(true);
    };


    /* ========================================================
       MARK ALL HOLIDAY
    ======================================================== */

    const markAllHoliday = () => {

      if (!attendanceData) {
        return;
      }

      Alert.alert(
        "Mark Holiday",
        "Mark all students as holiday for this date?",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Continue",
            onPress: () => {

              setAttendanceMap(
                previous => {

                  const updated = {
                    ...previous,
                  };

                  for (
                    const student
                    of attendanceData.students
                  ) {

                    updated[
                      student.id
                    ] = {
                      ...updated[
                        student.id
                      ],

                      status:
                        "HOLIDAY",
                    };
                  }

                  return updated;
                }
              );

              setHasChanges(true);
            },
          },
        ]
      );
    };


    /* ========================================================
       SUMMARY
    ======================================================== */

    const localSummary =
      useMemo(() => {

        const students =
          attendanceData?.students ??
          [];

        let present = 0;
        let absent = 0;
        let late = 0;
        let halfDay = 0;
        let holiday = 0;

        for (
          const student
          of students
        ) {

          const status =
            attendanceMap[
              student.id
            ]?.status;

          switch (status) {

            case "PRESENT":
              present++;
              break;

            case "ABSENT":
              absent++;
              break;

            case "LATE":
              late++;
              break;

            case "HALF_DAY":
              halfDay++;
              break;

            case "HOLIDAY":
              holiday++;
              break;
          }
        }

        return {
          total: students.length,
          present,
          absent,
          late,
          halfDay,
          holiday,
        };

      }, [
        attendanceData,
        attendanceMap,
      ]);


    /* ========================================================
       SAVE
    ======================================================== */

    const saveAttendance =
      async () => {

        if (!attendanceData) {
          return;
        }

        if (
          attendanceData.students.length ===
          0
        ) {
          return;
        }


        /* ----------------------------------------------------
           CHECK UNMARKED
        ---------------------------------------------------- */

        const unmarked =
          attendanceData.students.filter(
            student =>
              !attendanceMap[
                student.id
              ]
          );


        if (unmarked.length > 0) {

          Alert.alert(
            "Attendance Missing",
            `${unmarked.length} student(s) do not have an attendance status.`,
            [
              {
                text: "Cancel",
                style: "cancel",
              },
              {
                text: "Mark Present",
                onPress: () => {

                  setAttendanceMap(
                    previous => {

                      const updated = {
                        ...previous,
                      };

                      for (
                        const student
                        of unmarked
                      ) {

                        updated[
                          student.id
                        ] = {
                          status:
                            "PRESENT",
                          remark:
                            null,
                        };
                      }

                      return updated;
                    }
                  );

                  setHasChanges(true);
                },
              },
            ]
          );

          return;
        }


        try {

          setSaving(true);


          const payload =
            attendanceData.students.map(
              student => {

                const value =
                  attendanceMap[
                    student.id
                  ];

                return {
                  studentId:
                    student.id,

                  status:
                    value.status,

                  remark:
                    value.remark ??
                    null,
                };
              }
            );


          await teacherServices.saveSectionAttendance(
            sectionId,
            dateString,
            payload
          );


          setHasChanges(false);


          Alert.alert(
            "Attendance Saved",
            "Student attendance has been saved successfully."
          );


          await loadAttendance(
            false
          );

        } catch (err: any) {

          console.error(
            "SAVE ATTENDANCE ERROR:",
            err
          );

          const message =
            err?.response?.data?.message ??
            err?.message ??
            "Failed to save attendance";

          Alert.alert(
            "Save Failed",
            message
          );

        } finally {

          setSaving(false);
        }
      };


    /* ========================================================
       BACK
    ======================================================== */

    const handleBack = () => {

      if (hasChanges) {

        Alert.alert(
          "Unsaved Changes",
          "You have unsaved attendance changes. Leave without saving?",
          [
            {
              text: "Stay",
              style: "cancel",
            },
            {
              text: "Leave",
              style: "destructive",
              onPress: () =>
                navigation.goBack(),
            },
          ]
        );

        return;
      }

      navigation.goBack();
    };


    /* ========================================================
       STUDENT HISTORY
    ======================================================== */

    const openStudentHistory = (
      student: TeacherSectionAttendanceStudent
    ) => {
      if (hasChanges) {
        Alert.alert(
          "Unsaved Changes",
          "Please save attendance before opening student history."
        );
        return;
      }

      navigation.navigate(
        "TeacherStudentAttendanceHistory" as never,
        {
          studentId: student.id,
          sectionId,
          classId,
          classNumber,
          sectionName,
          studentName: student.name,
        } as never
      );
    };


    /* ========================================================
       REMARK EDITOR
    ======================================================== */

    const openRemarkEditor = (
      student: TeacherSectionAttendanceStudent
    ) => {
      setRemarkStudent(student);
      setRemarkText(attendanceMap[student.id]?.remark || "");
    };


    /* ========================================================
       STUDENT ROW
    ======================================================== */

    const renderStudent =
      ({
        item,
      }: {
        item:
          TeacherSectionAttendanceStudent;
      }) => {

        const status =
          attendanceMap[
            item.id
          ]?.status ??
          "PRESENT";


        return (
          <Pressable
            style={[
              styles.studentRow,
              status ===
                "ABSENT" &&
                styles.absentRow,
              status ===
                "LATE" &&
                styles.lateRow,
              status ===
                "HALF_DAY" &&
                styles.halfDayRow,
            ]}
            onPress={() => openStudentHistory(item)}
          >

            <View style={styles.rollBox}>
              <Text
                style={
                  styles.rollText
                }
              >
                {item.rollNumber ??
                  "-"}
              </Text>
            </View>


            <View
              style={
                styles.avatar
              }
            >
              <Text
                style={
                  styles.avatarText
                }
              >
                {item.name
                  ?.charAt(0)
                  ?.toUpperCase() ??
                  "S"}
              </Text>
            </View>


            <View
              style={
                styles.studentInfo
              }
            >

              <Text
                numberOfLines={1}
                style={
                  styles.studentName
                }
              >
                {item.name}
              </Text>

              <Text
                style={
                  styles.admissionNo
                }
              >
                {item.admissionNo}
              </Text>

            </View>


            <Pressable
              style={[
                styles.statusBadge,

                status ===
                  "PRESENT" &&
                  styles.presentBadge,

                status ===
                  "ABSENT" &&
                  styles.absentBadge,

                status ===
                  "LATE" &&
                  styles.lateBadge,

                status ===
                  "HALF_DAY" &&
                  styles.halfDayBadge,

                status ===
                  "HOLIDAY" &&
                  styles.holidayBadge,
              ]}
              onPress={(event) => {
                event.stopPropagation();
                updateStatus(item.id);
              }}
            >
              <Text
                style={
                  styles.statusText
                }
              >
                {getStatusLabel(
                  status
                )}
              </Text>
            </Pressable>

            <Pressable
              style={styles.remarkButton}
              onPress={(event) => {
                event.stopPropagation();
                openRemarkEditor(item);
              }}
            >
              <MaterialCommunityIcons
                name="note-edit-outline"
                size={20}
                color="#475569"
              />
            </Pressable>

          </Pressable>
        );
      };


    /* ========================================================
       LOADING
    ======================================================== */

    if (
      loading &&
      !attendanceData
    ) {

      return (
        <SafeAreaView
          style={
            styles.safeArea
          }
        >

          <View
            style={
              styles.center
            }
          >

            <ActivityIndicator
              size="large"
            />

            <Text
              style={
                styles.loadingText
              }
            >
              Loading attendance...
            </Text>

          </View>

        </SafeAreaView>
      );
    }


    /* ========================================================
       ERROR
    ======================================================== */

    if (
      error &&
      !attendanceData
    ) {

      return (
        <SafeAreaView
          style={
            styles.safeArea
          }
        >

          <View
            style={
              styles.center
            }
          >

            <MaterialCommunityIcons
              name="alert-circle-outline"
              size={48}
              style={
                styles.errorIcon
              }
            />

            <Text
              style={
                styles.errorTitle
              }
            >
              Unable to load attendance
            </Text>

            <Text
              style={
                styles.errorText
              }
            >
              {error}
            </Text>

            <Pressable
              style={
                styles.retryButton
              }
              onPress={() =>
                loadAttendance()
              }
            >
              <Text
                style={
                  styles.retryText
                }
              >
                Retry
              </Text>
            </Pressable>

          </View>

        </SafeAreaView>
      );
    }


    /* ========================================================
       MAIN UI
    ======================================================== */

    return (
      <SafeAreaView
        style={
          styles.safeArea
        }
      >

        {/* ==================================================
            HEADER
        ================================================== */}

        <View
          style={
            styles.header
          }
        >

          <Pressable
            style={
              styles.headerButton
            }
            onPress={
              handleBack
            }
          >

            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              style={
                styles.headerIcon
              }
            />

          </Pressable>


          <View
            style={
              styles.headerTitleContainer
            }
          >

            <Text
              style={
                styles.headerTitle
              }
              numberOfLines={1}
            >
              Student Attendance
            </Text>

            <Text
              style={
                styles.headerSubtitle
              }
              numberOfLines={1}
            >
              {attendanceData?.section
                ?.classDisplayName ??
                `Class ${classNumber ?? ""}`}
              {" • "}
              {attendanceData?.section
                ?.sectionName ??
                sectionName ??
                ""}
            </Text>

          </View>

        </View>


        {/* ==================================================
            DATE SELECTOR
        ================================================== */}

        <View
          style={
            styles.dateCard
          }
        >

          <Pressable
            style={
              styles.dateArrow
            }
            onPress={() =>
              changeDate(-1)
            }
          >

            <MaterialCommunityIcons
              name="chevron-left"
              size={28}
            />

          </Pressable>


          <View
            style={
              styles.dateCenter
            }
          >

            <Text
              style={
                styles.dateLabel
              }
            >
              ATTENDANCE DATE
            </Text>

            <Text
              style={
                styles.dateValue
              }
            >
              {formatDisplayDate(
                selectedDate
              )}
            </Text>

          </View>


          <Pressable
            style={
              styles.dateArrow
            }
            onPress={() =>
              changeDate(1)
            }
          >

            <MaterialCommunityIcons
              name="chevron-right"
              size={28}
            />

          </Pressable>

        </View>


        {/* ==================================================
            SUMMARY
        ================================================== */}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.summaryContainer
          }
        >

          <View
            style={
              styles.summaryCard
            }
          >
            <Text
              style={
                styles.summaryNumber
              }
            >
              {localSummary.total}
            </Text>

            <Text
              style={
                styles.summaryLabel
              }
            >
              Total
            </Text>
          </View>


          <View
            style={
              styles.summaryCard
            }
          >
            <Text
              style={
                styles.summaryNumber
              }
            >
              {localSummary.present}
            </Text>

            <Text
              style={
                styles.summaryLabel
              }
            >
              Present
            </Text>
          </View>


          <View
            style={
              styles.summaryCard
            }
          >
            <Text
              style={
                styles.summaryNumber
              }
            >
              {localSummary.absent}
            </Text>

            <Text
              style={
                styles.summaryLabel
              }
            >
              Absent
            </Text>
          </View>


          <View
            style={
              styles.summaryCard
            }
          >
            <Text
              style={
                styles.summaryNumber
              }
            >
              {localSummary.late}
            </Text>

            <Text
              style={
                styles.summaryLabel
              }
            >
              Late
            </Text>
          </View>


          <View
            style={
              styles.summaryCard
            }
          >
            <Text
              style={
                styles.summaryNumber
              }
            >
              {localSummary.halfDay}
            </Text>

            <Text
              style={
                styles.summaryLabel
              }
            >
              Half Day
            </Text>
          </View>

        </ScrollView>


        {/* ==================================================
            QUICK ACTIONS
        ================================================== */}

        <View
          style={
            styles.actionContainer
          }
        >

          <Pressable
            style={
              styles.markAllButton
            }
            onPress={
              markAllPresent
            }
          >

            <MaterialCommunityIcons
              name="check-all"
              size={20}
            />

            <Text
              style={
                styles.markAllText
              }
            >
              Mark All Present
            </Text>

          </Pressable>


          <Pressable
            style={
              styles.holidayButton
            }
            onPress={
              markAllHoliday
            }
          >

            <MaterialCommunityIcons
              name="calendar-remove"
              size={20}
            />

            <Text
              style={
                styles.holidayText
              }
            >
              Holiday
            </Text>

          </Pressable>

        </View>


        {/* ==================================================
            INSTRUCTION
        ================================================== */}

        <View
          style={
            styles.instruction
          }
        >

          <MaterialCommunityIcons
            name="gesture-tap"
            size={18}
          />

          <Text
            style={
              styles.instructionText
            }
          >
            Tap a student to change status
          </Text>

        </View>


        {/* ==================================================
            STUDENT LIST
        ================================================== */}

        <FlatList
          data={
            attendanceData?.students ??
            []
          }
          keyExtractor={
            item => item.id
          }
          renderItem={
            renderStudent
          }
          contentContainerStyle={
            styles.listContent
          }
          refreshControl={
            <RefreshControl
              refreshing={
                refreshing
              }
              onRefresh={
                async () => {

                  setRefreshing(
                    true
                  );

                  await loadAttendance(
                    false
                  );
                }
              }
            />
          }
          ListEmptyComponent={
            <View
              style={
                styles.empty
              }
            >

              <MaterialCommunityIcons
                name="account-child-outline"
                size={48}
              />

              <Text
                style={
                  styles.emptyTitle
                }
              >
                No students found
              </Text>

            </View>
          }
        />


        {/* ==================================================
            REMARK MODAL
        ================================================== */}

        <Modal
          visible={!!remarkStudent}
          transparent
          animationType="fade"
          onRequestClose={() => setRemarkStudent(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.remarkModal}>
              <Text style={styles.modalTitle}>
                Attendance Remark
              </Text>

              <Text style={styles.modalStudentName}>
                {remarkStudent?.name}
              </Text>

              <TextInput
                value={remarkText}
                onChangeText={setRemarkText}
                placeholder="Enter remark..."
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                style={styles.remarkInput}
              />

              <View style={styles.modalActions}>
                <Pressable
                  style={styles.cancelButton}
                  onPress={() => setRemarkStudent(null)}
                >
                  <Text style={styles.cancelButtonText}>
                    Cancel
                  </Text>
                </Pressable>

                <Pressable
                  style={styles.saveRemarkButton}
                  onPress={() => {
                    if (!remarkStudent) return;

                    setAttendanceMap((prev) => ({
                      ...prev,
                      [remarkStudent.id]: {
                        ...prev[remarkStudent.id],
                        status:
                          prev[remarkStudent.id]?.status ||
                          "PRESENT",
                        remark:
                          remarkText.trim() || null,
                      },
                    }));

                    setHasChanges(true);
                    setRemarkStudent(null);
                  }}
                >
                  <Text style={styles.saveRemarkButtonText}>
                    Save Remark
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>


        {/* ==================================================
            SAVE BUTTON
        ================================================== */}

        <View
          style={
            styles.bottomContainer
          }
        >

          <Pressable
            style={[
              styles.saveButton,

              saving &&
                styles.saveButtonDisabled,
            ]}
            disabled={
              saving
            }
            onPress={
              saveAttendance
            }
          >

            {saving ? (

              <ActivityIndicator
                size="small"
              />

            ) : (

              <MaterialCommunityIcons
                name="content-save-check-outline"
                size={22}
              />

            )}

            <Text
              style={
                styles.saveText
              }
            >
              {saving
                ? "Saving..."
                : hasChanges
                ? "Save Attendance"
                : "Attendance Saved"}
            </Text>

          </Pressable>

        </View>

      </SafeAreaView>
    );
  };


/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({

    safeArea: {
      flex: 1,
      backgroundColor: "#F7F8FA",
    },

    center: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
    },

    loadingText: {
      marginTop: 12,
      fontSize: 14,
    },

    errorIcon: {
      marginBottom: 12,
    },

    errorTitle: {
      fontSize: 18,
      fontWeight: "700",
      textAlign: "center",
    },

    errorText: {
      marginTop: 8,
      textAlign: "center",
      fontSize: 14,
      lineHeight: 20,
    },

    retryButton: {
      marginTop: 20,
      paddingHorizontal: 28,
      paddingVertical: 12,
      borderRadius: 10,
      backgroundColor: "#111827",
    },

    retryText: {
      color: "#FFFFFF",
      fontWeight: "700",
    },

    header: {
      height: 64,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      backgroundColor: "#FFFFFF",
      borderBottomWidth: 1,
      borderBottomColor: "#E5E7EB",
    },

    headerButton: {
      width: 44,
      height: 44,
      alignItems: "center",
      justifyContent: "center",
    },

    headerIcon: {
      color: "#111827",
    },

    headerTitleContainer: {
      flex: 1,
      marginLeft: 4,
    },

    headerTitle: {
      fontSize: 18,
      fontWeight: "800",
      color: "#111827",
    },

    headerSubtitle: {
      marginTop: 2,
      fontSize: 12,
      color: "#6B7280",
    },

    dateCard: {
      marginHorizontal: 16,
      marginTop: 14,
      borderRadius: 16,
      backgroundColor: "#FFFFFF",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 10,
      borderWidth: 1,
      borderColor: "#E5E7EB",
    },

    dateArrow: {
      width: 52,
      height: 56,
      alignItems: "center",
      justifyContent: "center",
    },

    dateCenter: {
      flex: 1,
      alignItems: "center",
    },

    dateLabel: {
      fontSize: 10,
      fontWeight: "700",
      letterSpacing: 1,
      color: "#9CA3AF",
    },

    dateValue: {
      marginTop: 3,
      fontSize: 17,
      fontWeight: "800",
      color: "#111827",
    },

    summaryContainer: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      gap: 8,
    },

    summaryCard: {
      minWidth: 76,
      paddingVertical: 9,
      paddingHorizontal: 10,
      borderRadius: 12,
      backgroundColor: "#FFFFFF",
      borderWidth: 1,
      borderColor: "#E5E7EB",
      alignItems: "center",
    },

    summaryNumber: {
      fontSize: 18,
      fontWeight: "800",
      color: "#111827",
    },

    summaryLabel: {
      marginTop: 2,
      fontSize: 10,
      color: "#6B7280",
    },

    actionContainer: {
      flexDirection: "row",
      paddingHorizontal: 16,
      gap: 10,
    },

    markAllButton: {
      flex: 1,
      minHeight: 46,
      borderRadius: 12,
      backgroundColor: "#DCFCE7",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 7,
    },

    markAllText: {
      fontSize: 13,
      fontWeight: "800",
      color: "#166534",
    },

    holidayButton: {
      minWidth: 105,
      minHeight: 46,
      borderRadius: 12,
      backgroundColor: "#F3F4F6",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 5,
    },

    holidayText: {
      fontSize: 13,
      fontWeight: "700",
      color: "#374151",
    },

    instruction: {
      marginHorizontal: 16,
      marginTop: 10,
      marginBottom: 2,
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },

    instructionText: {
      fontSize: 11,
      color: "#6B7280",
    },

    listContent: {
      paddingHorizontal: 16,
      paddingTop: 8,
      paddingBottom: 100,
    },

    studentRow: {
      minHeight: 68,
      marginBottom: 8,
      paddingHorizontal: 10,
      borderRadius: 14,
      backgroundColor: "#FFFFFF",
      borderWidth: 1,
      borderColor: "#E5E7EB",
      flexDirection: "row",
      alignItems: "center",
    },

    absentRow: {
      borderColor: "#FCA5A5",
    },

    lateRow: {
      borderColor: "#FCD34D",
    },

    halfDayRow: {
      borderColor: "#FDBA74",
    },

    rollBox: {
      width: 34,
      alignItems: "center",
    },

    rollText: {
      fontSize: 12,
      fontWeight: "800",
      color: "#6B7280",
    },

    avatar: {
      width: 42,
      height: 42,
      borderRadius: 21,
      marginHorizontal: 8,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#E5E7EB",
    },

    avatarText: {
      fontSize: 16,
      fontWeight: "800",
      color: "#374151",
    },

    studentInfo: {
      flex: 1,
      minWidth: 0,
    },

    studentName: {
      fontSize: 14,
      fontWeight: "800",
      color: "#111827",
    },

    admissionNo: {
      marginTop: 3,
      fontSize: 11,
      color: "#6B7280",
    },

    statusBadge: {
      minWidth: 72,
      paddingHorizontal: 7,
      paddingVertical: 7,
      borderRadius: 9,
      alignItems: "center",
      justifyContent: "center",
    },

    presentBadge: {
      backgroundColor: "#DCFCE7",
    },

    absentBadge: {
      backgroundColor: "#FEE2E2",
    },

    lateBadge: {
      backgroundColor: "#FEF3C7",
    },

    halfDayBadge: {
      backgroundColor: "#FFEDD5",
    },

    holidayBadge: {
      backgroundColor: "#E5E7EB",
    },

    statusText: {
      fontSize: 10,
      fontWeight: "800",
    },

    remarkButton: {
      width: 36,
      height: 36,
      marginLeft: 6,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 10,
    },

    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.45)",
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
    },

    remarkModal: {
      width: "100%",
      maxWidth: 420,
      borderRadius: 18,
      backgroundColor: "#FFFFFF",
      padding: 20,
    },

    modalTitle: {
      fontSize: 18,
      fontWeight: "800",
      color: "#111827",
    },

    modalStudentName: {
      marginTop: 5,
      fontSize: 13,
      color: "#6B7280",
    },

    remarkInput: {
      minHeight: 110,
      marginTop: 16,
      paddingHorizontal: 12,
      paddingVertical: 12,
      borderWidth: 1,
      borderColor: "#D1D5DB",
      borderRadius: 12,
      fontSize: 14,
      color: "#111827",
      backgroundColor: "#F9FAFB",
    },

    modalActions: {
      flexDirection: "row",
      justifyContent: "flex-end",
      gap: 10,
      marginTop: 16,
    },

    cancelButton: {
      minHeight: 44,
      paddingHorizontal: 16,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#F3F4F6",
    },

    cancelButtonText: {
      fontSize: 13,
      fontWeight: "700",
      color: "#374151",
    },

    saveRemarkButton: {
      minHeight: 44,
      paddingHorizontal: 16,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#111827",
    },

    saveRemarkButtonText: {
      fontSize: 13,
      fontWeight: "800",
      color: "#FFFFFF",
    },

    bottomContainer: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      paddingHorizontal: 16,
      paddingTop: 10,
      paddingBottom: 12,
      backgroundColor: "#FFFFFF",
      borderTopWidth: 1,
      borderTopColor: "#E5E7EB",
    },

    saveButton: {
      minHeight: 52,
      borderRadius: 14,
      backgroundColor: "#111827",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },

    saveButtonDisabled: {
      opacity: 0.6,
    },

    saveText: {
      color: "#FFFFFF",
      fontSize: 15,
      fontWeight: "800",
    },

    empty: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 60,
    },

    emptyTitle: {
      marginTop: 12,
      fontSize: 16,
      fontWeight: "700",
      color: "#6B7280",
    },

  });


export default TeacherSectionAttendanceScreen;