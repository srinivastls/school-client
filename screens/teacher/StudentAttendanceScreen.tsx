import dayjs from "dayjs";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FlatList,
  Keyboard,
  RefreshControl,
  Text,
  View,
} from "react-native";

import {
  Button,
  Card,
  Divider,
  Snackbar,
  TextInput,
  TouchableRipple,
} from "react-native-paper";

import DropDownPicker from "react-native-dropdown-picker";

import {
  useMutation,
  useQuery,
} from "react-query";

import {
  academicYearServices,
  attendanceServices,
  StudentAttendanceStatus,
} from "../../services";

import {
  ClassList,
  Page,
} from "../../components";

import {
  Colors,
  makeStyles,
  Metrics,
} from "../../theme";

/* ============================================================
   TYPES
============================================================ */

type AcademicYear = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
};

type Student = {
  id: string;

  admissionNo: string;

  name: string;

  rollNumber?: string | null;

  classId: string;

  sectionId: string;

  attendance?: {
    id?: string;

    status: StudentAttendanceStatus;

    remark?: string | null;
  } | null;
};

type AttendanceState = {
  status: StudentAttendanceStatus;

  remark: string;
};

type SectionItem = {
  label: string;
  value: string;
};

/* ============================================================
   HELPERS
============================================================ */

const getErrorMessage = (
  error: any,
  fallback: string
): string => {
  return (
    error?.response?.data?.message ??
    error?.message ??
    fallback
  );
};

/* ============================================================
   SCREEN
============================================================ */

const StudentAttendanceScreen = () => {
  const styles = useStyles();

  /* ==========================================================
     DATE
  ========================================================== */

  const [
    selectedDate,
    setSelectedDate,
  ] = useState(
    dayjs().format("DD/MM/YYYY")
  );

  /* ==========================================================
     CLASS
  ========================================================== */

  const [
    selectedClass,
    setSelectedClass,
  ] = useState<string | null>(null);

  /* ==========================================================
     SECTION
  ========================================================== */

  const [
    selectedSection,
    setSelectedSection,
  ] = useState<string | null>(null);

  const [
    sectionDdOpen,
    setSectionDdOpen,
  ] = useState(false);

  const [
    sections,
    setSections,
  ] = useState<SectionItem[]>([]);

  /* ==========================================================
     ACADEMIC YEAR
  ========================================================== */

  const [
    academicYear,
    setAcademicYear,
  ] = useState<AcademicYear | null>(
    null
  );

  const [
    academicYearLoading,
    setAcademicYearLoading,
  ] = useState(true);

  /* ==========================================================
     STUDENTS
  ========================================================== */

  const [
    students,
    setStudents,
  ] = useState<Student[]>([]);

  /* ==========================================================
     ATTENDANCE
  ========================================================== */

  const [
    attendance,
    setAttendance,
  ] = useState<
    Record<
      string,
      AttendanceState
    >
  >({});

  /* ==========================================================
     REMARK
  ========================================================== */

  const [
    expandedRemarkStudent,
    setExpandedRemarkStudent,
  ] = useState<string | null>(
    null
  );

  /* ==========================================================
     SNACKBAR
  ========================================================== */

  const [
    snackbarVisible,
    setSnackbarVisible,
  ] = useState(false);

  const [
    snackbarMessage,
    setSnackbarMessage,
  ] = useState("");

  const [
    snackbarColor,
    setSnackbarColor,
  ] = useState(
    Colors.errorBg
  );

  const showSnackbar =
    useCallback(
      (
        message: string,
        color: string = Colors.errorBg
      ) => {
        setSnackbarMessage(
          message
        );

        setSnackbarColor(
          color
        );

        setSnackbarVisible(
          true
        );
      },
      []
    );

  /* ==========================================================
     LOAD CURRENT ACADEMIC YEAR
  ========================================================== */

  useEffect(() => {
    let mounted = true;

    const loadAcademicYear =
      async () => {
        try {
          setAcademicYearLoading(
            true
          );

          const response =
            await academicYearServices
              .getAcademicYears();

          if (!mounted) {
            return;
          }

          const years =
            response?.academicYears ??
            [];

          if (!years.length) {
            showSnackbar(
              "No academic years found"
            );

            return;
          }

          const currentYear =
            years.find(
              (
                year: AcademicYear
              ) =>
                year.isCurrent
            );

          if (!currentYear) {
            showSnackbar(
              "Current academic year not found"
            );

            return;
          }

          setAcademicYear(
            currentYear
          );
        } catch (error: any) {
          console.error(
            "LOAD ACADEMIC YEAR ERROR:",
            error
          );

          if (mounted) {
            showSnackbar(
              getErrorMessage(
                error,
                "Unable to load academic year"
              )
            );
          }
        } finally {
          if (mounted) {
            setAcademicYearLoading(
              false
            );
          }
        }
      };

    loadAcademicYear();

    return () => {
      mounted = false;
    };
  }, [showSnackbar]);

  /* ==========================================================
     LOAD STUDENTS
  ========================================================== */

  const studentsQuery =
    useQuery(
      [
        "student-attendance",
        selectedClass,
        selectedSection,
        academicYear?.id,
        selectedDate,
      ],

      () =>
        attendanceServices
          .getStudentsForAttendance({
            classId:
              selectedClass!,
            sectionId:
              selectedSection!,
            academicYearId:
              academicYear!.id,
            date:
              selectedDate,
          }),

      {
        enabled: false,

        onSuccess: (
          response
        ) => {
          const loadedStudents =
            response?.students ??
            [];

          setStudents(
            loadedStudents
          );

          const initialAttendance:
            Record<
              string,
              AttendanceState
            > = {};

          loadedStudents.forEach(
            student => {
              initialAttendance[
                student.id
              ] = {
                status:
                  student
                    .attendance
                    ?.status ??
                  "PRESENT",

                remark:
                  student
                    .attendance
                    ?.remark ??
                  "",
              };
            }
          );

          setAttendance(
            initialAttendance
          );

          setExpandedRemarkStudent(
            null
          );
        },

        onError: (
          error: any
        ) => {
          setStudents([]);

          setAttendance({});

          showSnackbar(
            getErrorMessage(
              error,
              "Unable to load students"
            )
          );
        },
      }
    );

  /* ==========================================================
     LOAD STUDENTS BUTTON
  ========================================================== */

  const loadStudents =
    useCallback(() => {
      Keyboard.dismiss();

      if (!academicYear?.id) {
        showSnackbar(
          "Academic year is not available"
        );

        return;
      }

      if (!selectedClass) {
        showSnackbar(
          "Please select a class"
        );

        return;
      }

      if (!selectedSection) {
        showSnackbar(
          "Please select a section"
        );

        return;
      }

      studentsQuery.refetch();
    }, [
      academicYear?.id,
      selectedClass,
      selectedSection,
      studentsQuery,
      showSnackbar,
    ]);

  /* ==========================================================
     MARK MUTATION
  ========================================================== */

  const markAttendanceMutation =
    useMutation(
      (
        payload: Parameters<
          typeof attendanceServices.markStudentAttendance
        >[0]
      ) =>
        attendanceServices
          .markStudentAttendance(
            payload
          )
    );

  /* ==========================================================
     UPDATE STATUS
  ========================================================== */

  const updateStatus = (
    studentId: string,
    status: StudentAttendanceStatus
  ) => {
    setAttendance(
      current => ({
        ...current,

        [studentId]: {
          status,

          remark:
            current[
              studentId
            ]?.remark ??
            "",
        },
      })
    );
  };

  /* ==========================================================
     UPDATE REMARK
  ========================================================== */

  const updateRemark = (
    studentId: string,
    remark: string
  ) => {
    setAttendance(
      current => ({
        ...current,

        [studentId]: {
          status:
            current[
              studentId
            ]?.status ??
            "PRESENT",

          remark,
        },
      })
    );
  };

  /* ==========================================================
     MARK ALL PRESENT
  ========================================================== */

  const markAllPresent =
    () => {
      const updated:
        Record<
          string,
          AttendanceState
        > = {};

      students.forEach(
        student => {
          updated[
            student.id
          ] = {
            status:
              "PRESENT",

            remark:
              attendance[
                student.id
              ]?.remark ??
              "",
          };
        }
      );

      setAttendance(
        updated
      );

      showSnackbar(
        "All students marked present",
        Colors.successBg
      );
    };

  /* ==========================================================
     SUMMARY
  ========================================================== */

  const summary =
    useMemo(() => {
      let present = 0;

      let absent = 0;

      let late = 0;

      let halfDay = 0;

      let holiday = 0;

      students.forEach(
        student => {
          const status =
            attendance[
              student.id
            ]?.status ??
            "PRESENT";

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
      );

      return {
        total:
          students.length,

        present,

        absent,

        late,

        halfDay,

        holiday,

        marked:
          students.length,
      };
    }, [
      students,
      attendance,
    ]);

  /* ==========================================================
     ATTENDANCE PERCENTAGE
  ========================================================== */

  const attendancePercentage =
    useMemo(() => {
      if (!students.length) {
        return 0;
      }

      return (
        (summary.present /
          students.length) *
        100
      );
    }, [
      students.length,
      summary.present,
    ]);

  /* ==========================================================
     SUBMIT
  ========================================================== */

  const submitAttendance =
    async () => {
      Keyboard.dismiss();

      if (
        markAttendanceMutation
          .isLoading
      ) {
        return;
      }

      if (!academicYear?.id) {
        showSnackbar(
          "Academic year is not available"
        );

        return;
      }

      if (!selectedClass) {
        showSnackbar(
          "Please select a class"
        );

        return;
      }

      if (!selectedSection) {
        showSnackbar(
          "Please select a section"
        );

        return;
      }

      if (!students.length) {
        showSnackbar(
          "No students found"
        );

        return;
      }

      const payload = {
        classId:
          selectedClass,

        sectionId:
          selectedSection,

        academicYearId:
          academicYear.id,

        date:
          selectedDate,

        attendance:
          students.map(
            student => ({
              studentId:
                student.id,

              status:
                attendance[
                  student.id
                ]?.status ??
                "PRESENT",

              remark:
                attendance[
                  student.id
                ]?.remark?.trim() ||
                undefined,
            })
          ),
      };

      try {
        await markAttendanceMutation
          .mutateAsync(
            payload
          );

        showSnackbar(
          "Student attendance saved successfully",
          Colors.successBg
        );

        await studentsQuery.refetch();
      } catch (error: any) {
        console.error(
          "MARK STUDENT ATTENDANCE ERROR:",
          error
        );

        showSnackbar(
          getErrorMessage(
            error,
            "Unable to mark attendance"
          )
        );
      }
    };

  /* ==========================================================
     CHANGE DATE
  ========================================================== */

  const changeDate = (
    amount: number
  ) => {
    const current =
      dayjs(
        selectedDate,
        "DD/MM/YYYY",
        true
      );

    if (!current.isValid()) {
      return;
    }

    setSelectedDate(
      current
        .add(
          amount,
          "day"
        )
        .format(
          "DD/MM/YYYY"
        )
    );

    /*
     * Clear old students because
     * attendance belongs to the new date.
     */

    setStudents([]);

    setAttendance({});

    setExpandedRemarkStudent(
      null
    );
  };

  /* ==========================================================
     STATUS BUTTON
  ========================================================== */

  const renderStatus =
    (
      studentId: string,
      status: StudentAttendanceStatus,
      label: string
    ) => {
      const selected =
        attendance[
          studentId
        ]?.status ===
        status;

      return (
        <TouchableRipple
          onPress={() =>
            updateStatus(
              studentId,
              status
            )
          }
          borderless
          style={[
            styles.statusButton,

            selected &&
              styles.statusButtonSelected,
          ]}
          rippleColor={
            Colors.brandPrimaryBg
          }
        >
          <Text
            style={[
              styles.statusText,

              selected &&
                styles.statusTextSelected,
            ]}
          >
            {label}
          </Text>
        </TouchableRipple>
      );
    };

  /* ==========================================================
     STUDENT ITEM
  ========================================================== */

  const renderStudent =
    ({
      item,
      index,
    }: {
      item: Student;
      index: number;
    }) => {
      const studentAttendance =
        attendance[
          item.id
        ];

      const status =
        studentAttendance
          ?.status ??
        "PRESENT";

      const remarkOpen =
        expandedRemarkStudent ===
        item.id;

      return (
        <Card
          style={
            styles.studentCard
          }
        >
          <Card.Content>
            <View
              style={
                styles.studentHeader
              }
            >
              <View
                style={
                  styles.serial
                }
              >
                <Text
                  style={
                    styles.serialText
                  }
                >
                  {index + 1}
                </Text>
              </View>

              <View
                style={
                  styles.studentInfo
                }
              >
                <Text
                  style={
                    styles.studentName
                  }
                >
                  {item.name}
                </Text>

                <Text
                  style={
                    styles.studentDetails
                  }
                >
                  Admission No:{" "}
                  {item.admissionNo}

                  {item.rollNumber
                    ? `  •  Roll No: ${item.rollNumber}`
                    : ""}
                </Text>
              </View>
            </View>

            <Divider
              style={
                styles.divider
              }
            />

            <View
              style={
                styles.statusContainer
              }
            >
              {renderStatus(
                item.id,
                "PRESENT",
                "Present"
              )}

              {renderStatus(
                item.id,
                "ABSENT",
                "Absent"
              )}

              {renderStatus(
                item.id,
                "LATE",
                "Late"
              )}

              {renderStatus(
                item.id,
                "HALF_DAY",
                "Half Day"
              )}
            </View>

            <TouchableRipple
              onPress={() =>
                setExpandedRemarkStudent(
                  remarkOpen
                    ? null
                    : item.id
                )
              }
              borderless
              style={
                styles.remarkToggle
              }
            >
              <Text
                style={
                  styles.remarkToggleText
                }
              >
                {remarkOpen
                  ? "Hide remark"
                  : "Add remark"}
              </Text>
            </TouchableRipple>

            {remarkOpen ? (
              <TextInput
                mode="outlined"
                label="Remark"
                value={
                  studentAttendance
                    ?.remark ??
                  ""
                }
                onChangeText={value =>
                  updateRemark(
                    item.id,
                    value
                  )
                }
                multiline
                numberOfLines={2}
                style={
                  styles.remarkInput
                }
              />
            ) : null}

            <View
              style={
                styles.currentStatus
              }
            >
              <Text
                style={
                  styles.currentStatusLabel
                }
              >
                Current Status
              </Text>

              <Text
                style={
                  styles.currentStatusValue
                }
              >
                {status.replace(
                  "_",
                  " "
                )}
              </Text>
            </View>
          </Card.Content>
        </Card>
      );
    };

  /* ==========================================================
     HEADER
  ========================================================== */

  const renderHeader =
    () => {
      return (
        <View>
          {/* ==================================================
              TITLE
          ================================================== */}

          <View
            style={
              styles.header
            }
          >
            <Text
              style={
                styles.title
              }
            >
              Student Attendance
            </Text>

            <Text
              style={
                styles.subtitle
              }
            >
              Mark daily attendance
              for students
            </Text>
          </View>

          {/* ==================================================
              ACADEMIC YEAR
          ================================================== */}

          <Card
            style={
              styles.academicYearCard
            }
          >
            <Card.Content>
              <Text
                style={
                  styles.academicYearLabel
                }
              >
                ACADEMIC YEAR
              </Text>

              {academicYearLoading ? (
                <Text
                  style={
                    styles.loadingText
                  }
                >
                  Loading academic year...
                </Text>
              ) : (
                <Text
                  style={
                    styles.academicYearName
                  }
                >
                  {academicYear?.name ??
                    "Not available"}
                </Text>
              )}
            </Card.Content>
          </Card>

          {/* ==================================================
              DATE
          ================================================== */}

          <View
            style={
              styles.dateCard
            }
          >
            <TouchableRipple
              onPress={() =>
                changeDate(-1)
              }
              borderless
              style={
                styles.dateArrow
              }
            >
              <Text
                style={
                  styles.dateArrowText
                }
              >
                ‹
              </Text>
            </TouchableRipple>

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
                {dayjs(
                  selectedDate,
                  "DD/MM/YYYY"
                ).format(
                  "DD MMM YYYY"
                )}
              </Text>

              {selectedDate ===
              dayjs().format(
                "DD/MM/YYYY"
              ) ? (
                <Text
                  style={
                    styles.today
                  }
                >
                  Today
                </Text>
              ) : null}
            </View>

            <TouchableRipple
              onPress={() =>
                changeDate(1)
              }
              borderless
              style={
                styles.dateArrow
              }
            >
              <Text
                style={
                  styles.dateArrowText
                }
              >
                ›
              </Text>
            </TouchableRipple>
          </View>

          {/* ==================================================
              FILTER
          ================================================== */}

          <Card
            style={
              styles.filterCard
            }
          >
            <Card.Content>
              <Text
                style={
                  styles.sectionTitle
                }
              >
                Select Class
              </Text>

              <ClassList
                selectedClass={
                  selectedClass
                }
                setSelectedClass={value => {
                  setSelectedClass(
                    value
                  );

                  setSelectedSection(
                    null
                  );

                  setSections([]);

                  setStudents([]);

                  setAttendance({});
                }}
                zIndex={10000}
              />

              <View
                style={
                  styles.spacing
                }
              />

              <Text
                style={
                  styles.sectionTitle
                }
              >
                Select Section
              </Text>

              <DropDownPicker
                placeholder="Select section"
                open={
                  sectionDdOpen
                }
                value={
                  selectedSection
                }
                items={
                  sections
                }
                setOpen={
                  setSectionDdOpen
                }
                setValue={
                  setSelectedSection
                }
                setItems={
                  setSections
                }
                disabled={
                  !selectedClass
                }
                zIndex={9000}
                zIndexInverse={1000}
              />

              <View
                style={
                  styles.spacing
                }
              />

              <Button
                mode="contained"
                onPress={
                  loadStudents
                }
                loading={
                  studentsQuery.isFetching
                }
                disabled={
                  studentsQuery.isFetching ||
                  academicYearLoading ||
                  !academicYear ||
                  !selectedClass ||
                  !selectedSection
                }
                buttonColor={
                  Colors.brandPrimary
                }
              >
                LOAD STUDENTS
              </Button>
            </Card.Content>
          </Card>

          {/* ==================================================
              SUMMARY
          ================================================== */}

          {students.length > 0 ? (
            <>
              <View
                style={
                  styles.summaryCard
                }
              >
                <View
                  style={
                    styles.summaryHeader
                  }
                >
                  <View>
                    <Text
                      style={
                        styles.summaryTitle
                      }
                    >
                      Attendance Summary
                    </Text>

                    <Text
                      style={
                        styles.summarySubtitle
                      }
                    >
                      {
                        summary.total
                      }{" "}
                      students
                    </Text>
                  </View>

                  <TouchableRipple
                    onPress={
                      markAllPresent
                    }
                    borderless
                    style={
                      styles.markAll
                    }
                  >
                    <Text
                      style={
                        styles.markAllText
                      }
                    >
                      MARK ALL PRESENT
                    </Text>
                  </TouchableRipple>
                </View>

                <View
                  style={
                    styles.summaryStats
                  }
                >
                  <View
                    style={
                      styles.summaryStat
                    }
                  >
                    <Text
                      style={
                        styles.summaryValue
                      }
                    >
                      {
                        summary.present
                      }
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
                      styles.summaryStat
                    }
                  >
                    <Text
                      style={
                        styles.summaryValue
                      }
                    >
                      {
                        summary.absent
                      }
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
                      styles.summaryStat
                    }
                  >
                    <Text
                      style={
                        styles.summaryValue
                      }
                    >
                      {
                        summary.late
                      }
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
                      styles.summaryStat
                    }
                  >
                    <Text
                      style={
                        styles.summaryValue
                      }
                    >
                      {
                        summary.halfDay
                      }
                    </Text>

                    <Text
                      style={
                        styles.summaryLabel
                      }
                    >
                      Half Day
                    </Text>
                  </View>
                </View>

                <Divider
                  style={
                    styles.summaryDivider
                  }
                />

                <View
                  style={
                    styles.percentageRow
                  }
                >
                  <Text
                    style={
                      styles.percentageLabel
                    }
                  >
                    Present Percentage
                  </Text>

                  <Text
                    style={
                      styles.percentageValue
                    }
                  >
                    {attendancePercentage.toFixed(
                      1
                    )}
                    %
                  </Text>
                </View>
              </View>

              <View
                style={
                  styles.listHeader
                }
              >
                <Text
                  style={
                    styles.listTitle
                  }
                >
                  Students
                </Text>

                <Text
                  style={
                    styles.listCount
                  }
                >
                  {students.length}{" "}
                  students
                </Text>
              </View>
            </>
          ) : null}

          {/* ==================================================
              EMPTY
          ================================================== */}

          {!studentsQuery.isFetching &&
          selectedSection &&
          students.length === 0 ? (
            <View
              style={
                styles.emptyCard
              }
            >
              <Text
                style={
                  styles.emptyTitle
                }
              >
                No students found
              </Text>

              <Text
                style={
                  styles.emptyText
                }
              >
                There are no students
                available for the
                selected section.
              </Text>
            </View>
          ) : null}
        </View>
      );
    };

  /* ==========================================================
     FOOTER
  ========================================================== */

  const renderFooter =
    () => {
      if (!students.length) {
        return null;
      }

      return (
        <View
          style={
            styles.footer
          }
        >
          <Button
            mode="contained"
            onPress={
              submitAttendance
            }
            loading={
              markAttendanceMutation.isLoading
            }
            disabled={
              markAttendanceMutation.isLoading
            }
            buttonColor={
              Colors.brandPrimary
            }
            contentStyle={
              styles.submitButtonContent
            }
          >
            SAVE ATTENDANCE
          </Button>
        </View>
      );
    };

  /* ==========================================================
     RETURN
  ========================================================== */

  return (
    <View
      style={
        styles.container
      }
    >
      <FlatList
        data={students}
        keyExtractor={item =>
          item.id
        }
        renderItem={
          renderStudent
        }
        ListHeaderComponent={
          renderHeader
        }
        ListFooterComponent={
          renderFooter
        }
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.content
        }
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={
              studentsQuery.isFetching
            }
            onRefresh={() => {
              if (
                selectedClass &&
                selectedSection &&
                academicYear
              ) {
                studentsQuery.refetch();
              }
            }}
          />
        }
      />

      {/* ======================================================
          SNACKBAR
      ====================================================== */}

      <Snackbar
        visible={
          snackbarVisible
        }
        onDismiss={() =>
          setSnackbarVisible(
            false
          )
        }
        duration={3000}
        style={[
          styles.snackbar,
          {
            backgroundColor:
              snackbarColor,
          },
        ]}
      >
        {
          snackbarMessage
        }
      </Snackbar>
    </View>
  );
};

/* ============================================================
   STYLES
============================================================ */

const useStyles =
  makeStyles(() => ({
    container: {
      flex: 1,
      backgroundColor:
        "#F7F8FC",
    },

    content: {
      padding:
        Metrics.x4,
      paddingBottom:
        Metrics.x6,
    },

    /* ========================================================
       HEADER
    ======================================================== */

    header: {
      marginBottom:
        Metrics.x4,
    },

    title: {
      fontSize: 28,
      fontWeight: "800",
      color: "#171717",
    },

    subtitle: {
      fontSize: 13,
      color: Colors.subtext,
      marginTop:
        Metrics.x1,
    },

    /* ========================================================
       ACADEMIC YEAR
    ======================================================== */

    academicYearCard: {
      marginBottom:
        Metrics.x4,
      backgroundColor:
        "#FFFFFF",
      borderRadius: 15,
      borderWidth: 1,
      borderColor:
        "#E8EAF0",
    },

    academicYearLabel: {
      fontSize: 9,
      fontWeight: "800",
      letterSpacing: 0.8,
      color: Colors.subtext,
    },

    academicYearName: {
      fontSize: 18,
      fontWeight: "800",
      color: "#171717",
      marginTop: 4,
    },

    loadingText: {
      fontSize: 13,
      color: Colors.subtext,
      marginTop: 4,
    },

    /* ========================================================
       DATE
    ======================================================== */

    dateCard: {
      minHeight: 78,
      marginBottom:
        Metrics.x4,
      flexDirection:
        "row",
      alignItems:
        "center",
      backgroundColor:
        "#FFFFFF",
      borderRadius: 15,
      borderWidth: 1,
      borderColor:
        "#E8EAF0",
      elevation: 1,
    },

    dateArrow: {
      width: 52,
      height: 70,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    dateArrowText: {
      fontSize: 38,
      lineHeight: 42,
      color:
        Colors.brandPrimary,
    },

    dateCenter: {
      flex: 1,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    dateLabel: {
      fontSize: 9,
      fontWeight: "800",
      letterSpacing: 0.8,
      color: Colors.subtext,
    },

    dateValue: {
      fontSize: 18,
      fontWeight: "800",
      color: "#171717",
      marginTop: 2,
    },

    today: {
      fontSize: 10,
      fontWeight: "700",
      color:
        Colors.brandPrimary,
      marginTop: 2,
    },

    /* ========================================================
       FILTER
    ======================================================== */

    filterCard: {
      marginBottom:
        Metrics.x4,
      backgroundColor:
        "#FFFFFF",
      borderRadius: 16,
    },

    sectionTitle: {
      fontSize: 13,
      fontWeight: "800",
      color: "#171717",
      marginBottom:
        Metrics.x2,
    },

    spacing: {
      height:
        Metrics.x4,
    },

    /* ========================================================
       SUMMARY
    ======================================================== */

    summaryCard: {
      marginBottom:
        Metrics.x4,
      padding:
        Metrics.x3,
      backgroundColor:
        "#FFFFFF",
      borderRadius: 16,
      borderWidth: 1,
      borderColor:
        "#ECEEF3",
      elevation: 1,
    },

    summaryHeader: {
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-between",
      marginBottom:
        Metrics.x3,
    },

    summaryTitle: {
      fontSize: 16,
      fontWeight: "800",
      color: "#171717",
    },

    summarySubtitle: {
      fontSize: 11,
      color: Colors.subtext,
      marginTop: 2,
    },

    markAll: {
      paddingHorizontal:
        Metrics.x2,
      paddingVertical:
        Metrics.x2,
      borderRadius: 9,
      backgroundColor:
        Colors.brandPrimaryBg,
    },

    markAllText: {
      fontSize: 9,
      fontWeight: "800",
      color:
        Colors.brandPrimary,
    },

    summaryStats: {
      flexDirection:
        "row",
      justifyContent:
        "space-between",
    },

    summaryStat: {
      flex: 1,
      alignItems:
        "center",
      paddingVertical:
        Metrics.x2,
      borderRightWidth: 1,
      borderRightColor:
        "#ECEEF3",
    },

    summaryValue: {
      fontSize: 20,
      fontWeight: "800",
      color: "#171717",
    },

    summaryLabel: {
      fontSize: 10,
      color: Colors.subtext,
      marginTop: 2,
    },

    summaryDivider: {
      marginVertical:
        Metrics.x3,
    },

    percentageRow: {
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-between",
    },

    percentageLabel: {
      fontSize: 12,
      fontWeight: "700",
      color: Colors.subtext,
    },

    percentageValue: {
      fontSize: 18,
      fontWeight: "800",
      color:
        Colors.brandPrimary,
    },

    /* ========================================================
       LIST
    ======================================================== */

    listHeader: {
      flexDirection:
        "row",
      justifyContent:
        "space-between",
      alignItems:
        "center",
      marginBottom:
        Metrics.x3,
    },

    listTitle: {
      fontSize: 18,
      fontWeight: "800",
      color: "#171717",
    },

    listCount: {
      fontSize: 11,
      color: Colors.subtext,
    },

    /* ========================================================
       STUDENT
    ======================================================== */

    studentCard: {
      marginBottom:
        Metrics.x3,
      backgroundColor:
        "#FFFFFF",
      borderRadius: 15,
      elevation: 1,
    },

    studentHeader: {
      flexDirection:
        "row",
      alignItems:
        "center",
    },

    serial: {
      width: 34,
      height: 34,
      borderRadius: 10,
      alignItems:
        "center",
      justifyContent:
        "center",
      backgroundColor:
        Colors.brandPrimaryBg,
      marginRight:
        Metrics.x3,
    },

    serialText: {
      fontSize: 12,
      fontWeight: "800",
      color:
        Colors.brandPrimary,
    },

    studentInfo: {
      flex: 1,
    },

    studentName: {
      fontSize: 15,
      fontWeight: "800",
      color: "#171717",
    },

    studentDetails: {
      fontSize: 10,
      color: Colors.subtext,
      marginTop: 3,
    },

    divider: {
      marginVertical:
        Metrics.x3,
    },

    /* ========================================================
       STATUS
    ======================================================== */

    statusContainer: {
      flexDirection:
        "row",
      gap: Metrics.x1,
    },

    statusButton: {
      flex: 1,
      minHeight: 42,
      borderRadius: 9,
      alignItems:
        "center",
      justifyContent:
        "center",
      backgroundColor:
        "#F5F6F8",
      borderWidth: 1,
      borderColor:
        "#E5E7EB",
    },

    statusButtonSelected: {
      backgroundColor:
        Colors.brandPrimaryBg,
      borderColor:
        Colors.brandPrimary,
    },

    statusText: {
      fontSize: 10,
      fontWeight: "700",
      color: Colors.subtext,
    },

    statusTextSelected: {
      color:
        Colors.brandPrimary,
      fontWeight: "800",
    },

    /* ========================================================
       REMARK
    ======================================================== */

    remarkToggle: {
      alignSelf:
        "flex-start",
      marginTop:
        Metrics.x2,
      paddingVertical:
        Metrics.x1,
    },

    remarkToggleText: {
      fontSize: 11,
      fontWeight: "700",
      color:
        Colors.brandPrimary,
    },

    remarkInput: {
      marginTop:
        Metrics.x1,
      backgroundColor:
        "#FFFFFF",
    },

    /* ========================================================
       CURRENT STATUS
    ======================================================== */

    currentStatus: {
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-between",
      marginTop:
        Metrics.x3,
      padding:
        Metrics.x2,
      borderRadius: 9,
      backgroundColor:
        "#F8F9FB",
    },

    currentStatusLabel: {
      fontSize: 10,
      color: Colors.subtext,
    },

    currentStatusValue: {
      fontSize: 10,
      fontWeight: "800",
      color: "#171717",
    },

    /* ========================================================
       EMPTY
    ======================================================== */

    emptyCard: {
      padding:
        Metrics.x5,
      borderRadius: 15,
      backgroundColor:
        "#FFFFFF",
      alignItems:
        "center",
      marginBottom:
        Metrics.x4,
    },

    emptyTitle: {
      fontSize: 16,
      fontWeight: "800",
      color: "#171717",
    },

    emptyText: {
      fontSize: 12,
      color: Colors.subtext,
      textAlign:
        "center",
      marginTop:
        Metrics.x2,
    },

    /* ========================================================
       FOOTER
    ======================================================== */

    footer: {
      marginTop:
        Metrics.x2,
      paddingBottom:
        Metrics.x4,
    },

    submitButtonContent: {
      minHeight: 50,
    },

    /* ========================================================
       SNACKBAR
    ======================================================== */

    snackbar: {
      borderRadius: 10,
    },
  }));

export {
  StudentAttendanceScreen,
};