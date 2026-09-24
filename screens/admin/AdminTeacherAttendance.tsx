import dayjs from "dayjs";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  RefreshControl,
  StyleSheet,
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

import { useMutation } from "react-query";

import { adminAttendanceLeaveServices } from "../../services";

/* ============================================================
   TYPES
============================================================ */

type TeacherAttendanceStatus =
  | "PRESENT"
  | "ABSENT"
  | "HALF_DAY"
  | "ON_LEAVE";

type TeacherAttendance = {
  id?: string;
  status: TeacherAttendanceStatus;
  leaveType?: string | null;
  remark?: string | null;
};

type Teacher = {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  employeeId?: string | null;
  designation?: string | null;
  department?: string | null;
  attendance?: TeacherAttendance | null;
};

type AttendanceState = {
  status: TeacherAttendanceStatus;
  leaveType: string;
  remark: string;
};

/* ============================================================
   CONSTANTS
============================================================ */

const COLORS = {
  primary: "#2563EB",
  primaryLight: "#EFF6FF",
  success: "#15803D",
  successLight: "#F0FDF4",
  danger: "#DC2626",
  dangerLight: "#FEF2F2",
  warning: "#B45309",
  warningLight: "#FFFBEB",
  purple: "#7C3AED",
  purpleLight: "#F5F3FF",
  text: "#111827",
  secondaryText: "#6B7280",
  border: "#E5E7EB",
  background: "#F8FAFC",
  white: "#FFFFFF",
  error: "#B91C1C",
};

/* ============================================================
   HELPERS
============================================================ */

const getErrorMessage = (
  error: any,
  fallback: string
): string => {
  const responseMessage =
    error?.response?.data?.message;

  if (typeof responseMessage === "string") {
    return responseMessage;
  }

  if (
    responseMessage &&
    typeof responseMessage === "object"
  ) {
    if (typeof responseMessage.message === "string") {
      return responseMessage.message;
    }

    if (typeof responseMessage.error === "string") {
      return responseMessage.error;
    }

    return JSON.stringify(responseMessage);
  }

  if (typeof error?.message === "string") {
    return error.message;
  }

  return fallback;
};

/* ============================================================
   SCREEN
============================================================ */

const AdminTeacherAttendance = () => {
  const [selectedDate, setSelectedDate] = useState(
    dayjs().format("DD/MM/YYYY")
  );

  const [teachers, setTeachers] = useState<Teacher[]>([]);

  const [attendance, setAttendance] = useState<
    Record<string, AttendanceState>
  >({});

  const [expandedRemarkTeacher, setExpandedRemarkTeacher] =
    useState<string | null>(null);

  const [loading, setLoading] = useState(false);

  const [refreshing, setRefreshing] = useState(false);

  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const [snackbarMessage, setSnackbarMessage] = useState("");

  const [snackbarColor, setSnackbarColor] = useState(
    COLORS.dangerLight
  );

  /* ==========================================================
     SNACKBAR
  ========================================================== */

  const showSnackbar = useCallback(
    (
      message: string,
      color: string = COLORS.dangerLight
    ) => {
      setSnackbarMessage(message);
      setSnackbarColor(color);
      setSnackbarVisible(true);
    },
    []
  );

  /* ==========================================================
     LOAD TEACHERS
  ========================================================== */

  const loadTeachers = useCallback(
    async (isRefresh = false) => {
      Keyboard.dismiss();

      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const response =
          await adminAttendanceLeaveServices.getTeachersForAttendance({
            date: selectedDate,
          });

        const loadedTeachers: Teacher[] = Array.isArray(response)
          ? response
          : response?.teachers ?? [];

        setTeachers(loadedTeachers);

        const initialAttendance: Record<
          string,
          AttendanceState
        > = {};

        loadedTeachers.forEach((teacher) => {
          const existingAttendance = teacher.attendance;

          initialAttendance[teacher.id] = {
            status:
              existingAttendance?.status ?? "PRESENT",

            leaveType:
              existingAttendance?.leaveType ?? "",

            remark:
              existingAttendance?.remark ?? "",
          };
        });

        setAttendance(initialAttendance);
        setExpandedRemarkTeacher(null);
      } catch (error: any) {
        console.error(
          "LOAD TEACHER ATTENDANCE ERROR:",
          error
        );

        setTeachers([]);
        setAttendance({});

        showSnackbar(
          getErrorMessage(
            error,
            "Unable to load teachers"
          )
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [selectedDate, showSnackbar]
  );

  /* ==========================================================
     INITIAL LOAD AND DATE CHANGE
  ========================================================== */

  useEffect(() => {
    loadTeachers();
  }, [loadTeachers]);

  /* ==========================================================
     MARK ATTENDANCE MUTATION
  ========================================================== */

  const markAttendanceMutation = useMutation(
    (
      payload: Parameters<
        typeof adminAttendanceLeaveServices.bulkMarkTeacherAttendance
      >[0]
    ) =>
      adminAttendanceLeaveServices.bulkMarkTeacherAttendance(payload)
  );

  /* ==========================================================
     UPDATE STATUS
  ========================================================== */

  const updateStatus = (
    teacherId: string,
    status: TeacherAttendanceStatus
  ) => {
    setAttendance((current) => ({
      ...current,

      [teacherId]: {
        status,

        leaveType:
          current[teacherId]?.leaveType ?? "",

        remark:
          current[teacherId]?.remark ?? "",
      },
    }));
  };

  /* ==========================================================
     UPDATE LEAVE TYPE
  ========================================================== */

  const updateLeaveType = (
    teacherId: string,
    leaveType: string
  ) => {
    setAttendance((current) => ({
      ...current,

      [teacherId]: {
        status:
          current[teacherId]?.status ?? "PRESENT",

        leaveType,

        remark:
          current[teacherId]?.remark ?? "",
      },
    }));
  };

  /* ==========================================================
     UPDATE REMARK
  ========================================================== */

  const updateRemark = (
    teacherId: string,
    remark: string
  ) => {
    setAttendance((current) => ({
      ...current,

      [teacherId]: {
        status:
          current[teacherId]?.status ?? "PRESENT",

        leaveType:
          current[teacherId]?.leaveType ?? "",

        remark,
      },
    }));
  };

  /* ==========================================================
     MARK ALL PRESENT
  ========================================================== */

  const markAllPresent = () => {
    const updatedAttendance: Record<
      string,
      AttendanceState
    > = {};

    teachers.forEach((teacher) => {
      updatedAttendance[teacher.id] = {
        status: "PRESENT",

        leaveType:
          attendance[teacher.id]?.leaveType ?? "",

        remark:
          attendance[teacher.id]?.remark ?? "",
      };
    });

    setAttendance(updatedAttendance);

    showSnackbar(
      "All teachers marked present",
      COLORS.successLight
    );
  };

  /* ==========================================================
     SUMMARY
  ========================================================== */

  const summary = useMemo(() => {
    let present = 0;
    let absent = 0;
    let halfDay = 0;
    let onLeave = 0;

    teachers.forEach((teacher) => {
      const status =
        attendance[teacher.id]?.status ?? "PRESENT";

      switch (status) {
        case "PRESENT":
          present++;
          break;

        case "ABSENT":
          absent++;
          break;

        case "HALF_DAY":
          halfDay++;
          break;

        case "ON_LEAVE":
          onLeave++;
          break;
      }
    });

    return {
      total: teachers.length,
      present,
      absent,
      halfDay,
      onLeave,
      marked: teachers.length,
    };
  }, [teachers, attendance]);

  const attendancePercentage = useMemo(() => {
    if (!teachers.length) {
      return 0;
    }

    return Math.round(
      (summary.present / teachers.length) * 100
    );
  }, [summary.present, teachers.length]);

  /* ==========================================================
     SUBMIT ATTENDANCE
  ========================================================== */

  const submitAttendance = async () => {
    Keyboard.dismiss();

    if (markAttendanceMutation.isLoading) {
      return;
    }

    if (!teachers.length) {
      showSnackbar("No teachers found");
      return;
    }

    const teachersOnLeaveWithoutType = teachers.filter(
      (teacher) => {
        const teacherAttendance =
          attendance[teacher.id];

        return (
          teacherAttendance?.status === "ON_LEAVE" &&
          !teacherAttendance.leaveType.trim()
        );
      }
    );

    if (teachersOnLeaveWithoutType.length > 0) {
      showSnackbar(
        "Please enter the leave type for every teacher on leave"
      );

      return;
    }

    const payload = {
      date: selectedDate,

      records: teachers.map((teacher) => {
        const teacherAttendance =
          attendance[teacher.id];

        const status =
          teacherAttendance?.status ?? "PRESENT";

        return {
          teacherId: teacher.id,

          status,

          leaveType:
            status === "ON_LEAVE"
              ? ((teacherAttendance?.leaveType.trim() ||
                  undefined) as
                  | "CL"
                  | "SL"
                  | "EL"
                  | "LWP"
                  | undefined)
              : undefined,

          remarks:
            teacherAttendance?.remark.trim() ||
            undefined,
        };
      }),
    };

    try {
      await markAttendanceMutation.mutateAsync(
        payload
      );

      showSnackbar(
        "Teacher attendance saved successfully",
        COLORS.successLight
      );

      await loadTeachers();
    } catch (error: any) {
      console.error(
        "MARK TEACHER ATTENDANCE ERROR:",
        error
      );

      showSnackbar(
        getErrorMessage(
          error,
          "Unable to save teacher attendance"
        )
      );
    }
  };

  /* ==========================================================
     CHANGE DATE
  ========================================================== */

  const changeDate = (amount: number) => {
    const current = dayjs(
      selectedDate,
      "DD/MM/YYYY",
      true
    );

    if (!current.isValid()) {
      return;
    }

    const nextDate = current
      .add(amount, "day")
      .format("DD/MM/YYYY");

    setSelectedDate(nextDate);
    setTeachers([]);
    setAttendance({});
    setExpandedRemarkTeacher(null);
  };

  /* ==========================================================
     STATUS BUTTON
  ========================================================== */

  const renderStatus = (
    teacherId: string,
    status: TeacherAttendanceStatus,
    label: string
  ) => {
    const selected =
      attendance[teacherId]?.status === status;

    return (
      <TouchableRipple
        onPress={() => updateStatus(teacherId, status)}
        borderless
        style={[
          styles.statusButton,
          selected && styles.statusButtonSelected,
        ]}
        rippleColor={COLORS.primaryLight}
      >
        <Text
          style={[
            styles.statusText,
            selected && styles.statusTextSelected,
          ]}
        >
          {label}
        </Text>
      </TouchableRipple>
    );
  };

  /* ==========================================================
     TEACHER ITEM
  ========================================================== */

  const renderTeacher = ({
    item,
    index,
  }: {
    item: Teacher;
    index: number;
  }) => {
    const teacherAttendance = attendance[item.id];

    const status =
      teacherAttendance?.status ?? "PRESENT";

    const remarkOpen =
      expandedRemarkTeacher === item.id;

    return (
      <Card style={styles.teacherCard}>
        <Card.Content>
          <View style={styles.teacherHeader}>
            <View style={styles.serial}>
              <Text style={styles.serialText}>
                {index + 1}
              </Text>
            </View>

            <View style={styles.teacherInfo}>
              <Text style={styles.teacherName}>
                {item.name}
              </Text>

              {!!item.employeeId && (
                <Text style={styles.teacherDetails}>
                  Employee ID: {item.employeeId}
                </Text>
              )}

              {!!item.designation && (
                <Text style={styles.teacherDetails}>
                  Designation: {item.designation}
                </Text>
              )}

              {!!item.department && (
                <Text style={styles.teacherDetails}>
                  Department: {item.department}
                </Text>
              )}

              {!!item.email && (
                <Text style={styles.teacherDetails}>
                  {item.email}
                </Text>
              )}

              {!!item.phone && (
                <Text style={styles.teacherDetails}>
                  {item.phone}
                </Text>
              )}
            </View>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.statusContainer}>
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
              "HALF_DAY",
              "Half Day"
            )}

            {renderStatus(
              item.id,
              "ON_LEAVE",
              "On Leave"
            )}
          </View>

          {status === "ON_LEAVE" && (
            <TextInput
              mode="outlined"
              label="Leave type *"
              placeholder="Enter leave type"
              value={teacherAttendance?.leaveType ?? ""}
              onChangeText={(value) =>
                updateLeaveType(item.id, value)
              }
              style={styles.leaveInput}
              dense
            />
          )}

          <TouchableRipple
            onPress={() =>
              setExpandedRemarkTeacher(
                remarkOpen ? null : item.id
              )
            }
            borderless
            style={styles.remarkToggle}
          >
            <Text style={styles.remarkToggleText}>
              {remarkOpen
                ? "Hide remark"
                : "Add remark"}
            </Text>
          </TouchableRipple>

          {remarkOpen && (
            <TextInput
              mode="outlined"
              label="Remark"
              placeholder="Enter remark"
              value={teacherAttendance?.remark ?? ""}
              onChangeText={(value) =>
                updateRemark(item.id, value)
              }
              multiline
              numberOfLines={3}
              style={styles.remarkInput}
            />
          )}
        </Card.Content>
      </Card>
    );
  };

  /* ==========================================================
     HEADER
  ========================================================== */

  const renderHeader = () => {
    return (
      <View>
        <View style={styles.header}>
          <Text style={styles.title}>
            Teacher Attendance
          </Text>

          <Text style={styles.subtitle}>
            Manage daily attendance for all teachers
          </Text>
        </View>

        <Card style={styles.dateCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>
              Attendance Date
            </Text>

            <View style={styles.dateRow}>
              <TouchableRipple
                onPress={() => changeDate(-1)}
                style={styles.dateButton}
                borderless
              >
                <Text style={styles.dateButtonText}>
                  {"‹"}
                </Text>
              </TouchableRipple>

              <View style={styles.dateCenter}>
                <Text style={styles.dateText}>
                  {dayjs(
                    selectedDate,
                    "DD/MM/YYYY"
                  ).format("DD MMM YYYY")}
                </Text>

                <Text style={styles.dateSubText}>
                  {dayjs(
                    selectedDate,
                    "DD/MM/YYYY"
                  ).format("dddd")}
                </Text>
              </View>

              <TouchableRipple
                onPress={() => changeDate(1)}
                style={styles.dateButton}
                borderless
              >
                <Text style={styles.dateButtonText}>
                  {"›"}
                </Text>
              </TouchableRipple>
            </View>

            <Button
              mode="outlined"
              compact
              onPress={() => {
                const today = dayjs().format(
                  "DD/MM/YYYY"
                );

                setSelectedDate(today);
              }}
              style={styles.todayButton}
            >
              Today
            </Button>
          </Card.Content>
        </Card>

        <Card style={styles.summaryCard}>
          <Card.Content>
            <View style={styles.summaryHeader}>
              <View>
                <Text style={styles.sectionTitle}>
                  Attendance Summary
                </Text>

                <Text style={styles.summarySubText}>
                  {summary.marked} of {summary.total}{" "}
                  teachers marked
                </Text>
              </View>

              <Text style={styles.percentage}>
                {attendancePercentage}%
              </Text>
            </View>

            <View style={styles.summaryGrid}>
              <View
                style={[
                  styles.summaryItem,
                  {
                    backgroundColor:
                      COLORS.successLight,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.summaryNumber,
                    { color: COLORS.success },
                  ]}
                >
                  {summary.present}
                </Text>

                <Text style={styles.summaryLabel}>
                  Present
                </Text>
              </View>

              <View
                style={[
                  styles.summaryItem,
                  {
                    backgroundColor:
                      COLORS.dangerLight,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.summaryNumber,
                    { color: COLORS.danger },
                  ]}
                >
                  {summary.absent}
                </Text>

                <Text style={styles.summaryLabel}>
                  Absent
                </Text>
              </View>

              <View
                style={[
                  styles.summaryItem,
                  {
                    backgroundColor:
                      COLORS.warningLight,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.summaryNumber,
                    { color: COLORS.warning },
                  ]}
                >
                  {summary.halfDay}
                </Text>

                <Text style={styles.summaryLabel}>
                  Half Day
                </Text>
              </View>

              <View
                style={[
                  styles.summaryItem,
                  {
                    backgroundColor:
                      COLORS.purpleLight,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.summaryNumber,
                    { color: COLORS.purple },
                  ]}
                >
                  {summary.onLeave}
                </Text>

                <Text style={styles.summaryLabel}>
                  On Leave
                </Text>
              </View>
            </View>

            <Button
              mode="outlined"
              onPress={markAllPresent}
              disabled={!teachers.length}
              style={styles.markAllButton}
            >
              Mark All Present
            </Button>
          </Card.Content>
        </Card>

        <Text style={styles.listTitle}>
          Teachers ({teachers.length})
        </Text>
      </View>
    );
  };

  /* ==========================================================
     EMPTY STATE
  ========================================================== */

  const renderEmpty = () => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator
            size="large"
            color={COLORS.primary}
          />

          <Text style={styles.emptyText}>
            Loading teachers...
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          No teachers found for this date.
        </Text>
      </View>
    );
  };

  /* ==========================================================
     FOOTER
  ========================================================== */

  const renderFooter = () => {
    if (!teachers.length) {
      return null;
    }

    return (
      <View style={styles.footer}>
        <Button
          mode="contained"
          onPress={submitAttendance}
          loading={markAttendanceMutation.isLoading}
          disabled={markAttendanceMutation.isLoading}
          buttonColor={COLORS.primary}
          contentStyle={styles.saveButtonContent}
          style={styles.saveButton}
        >
          SAVE ATTENDANCE
        </Button>
      </View>
    );
  };

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <View style={styles.container}>
      <FlatList
        data={teachers}
        keyExtractor={(item) => item.id}
        renderItem={renderTeacher}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadTeachers(true)}
            colors={[COLORS.primary]}
          />
        }
      />

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={[
          styles.snackbar,
          {
            backgroundColor: snackbarColor,
          },
        ]}
      >
        <Text style={styles.snackbarText}>
          {snackbarMessage}
        </Text>
      </Snackbar>
    </View>
  );
};

/* ============================================================
   STYLES
============================================================ */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  listContent: {
    padding: 16,
    paddingBottom: 32,
  },

  header: {
    marginBottom: 16,
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.text,
  },

  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: COLORS.secondaryText,
  },

  dateCard: {
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    elevation: 2,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
  },

  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 18,
  },

  dateButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
    backgroundColor: COLORS.primaryLight,
  },

  dateButtonText: {
    fontSize: 30,
    lineHeight: 32,
    color: COLORS.primary,
  },

  dateCenter: {
    alignItems: "center",
    justifyContent: "center",
  },

  dateText: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
  },

  dateSubText: {
    marginTop: 4,
    fontSize: 13,
    color: COLORS.secondaryText,
  },

  todayButton: {
    marginTop: 16,
    borderColor: COLORS.primary,
  },

  summaryCard: {
    marginBottom: 18,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    elevation: 2,
  },

  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  summarySubText: {
    marginTop: 4,
    fontSize: 12,
    color: COLORS.secondaryText,
  },

  percentage: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.primary,
  },

  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 16,
  },

  summaryItem: {
    flex: 1,
    minWidth: "22%",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
  },

  summaryNumber: {
    fontSize: 20,
    fontWeight: "700",
  },

  summaryLabel: {
    marginTop: 4,
    fontSize: 11,
    color: COLORS.secondaryText,
  },

  markAllButton: {
    marginTop: 16,
    borderColor: COLORS.primary,
  },

  listTitle: {
    marginBottom: 12,
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
  },

  teacherCard: {
    marginBottom: 14,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    elevation: 2,
  },

  teacherHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  serial: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 17,
    backgroundColor: COLORS.primaryLight,
  },

  serialText: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.primary,
  },

  teacherInfo: {
    flex: 1,
    marginLeft: 12,
  },

  teacherName: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
  },

  teacherDetails: {
    marginTop: 3,
    fontSize: 12,
    color: COLORS.secondaryText,
  },

  divider: {
    marginVertical: 14,
    backgroundColor: COLORS.border,
  },

  statusContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  statusButton: {
    minWidth: "22%",
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },

  statusButtonSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },

  statusText: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.secondaryText,
  },

  statusTextSelected: {
    color: COLORS.white,
  },

  leaveInput: {
    marginTop: 14,
    backgroundColor: COLORS.white,
  },

  remarkToggle: {
    marginTop: 14,
    paddingVertical: 8,
  },

  remarkToggleText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.primary,
  },

  remarkInput: {
    marginTop: 8,
    backgroundColor: COLORS.white,
  },

  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
  },

  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.secondaryText,
    textAlign: "center",
  },

  footer: {
    marginTop: 8,
    marginBottom: 12,
  },

  saveButton: {
    borderRadius: 8,
  },

  saveButtonContent: {
    height: 48,
  },

  snackbar: {
    margin: 16,
    borderRadius: 8,
  },

  snackbarText: {
    color: COLORS.text,
  },
});

export default AdminTeacherAttendance;