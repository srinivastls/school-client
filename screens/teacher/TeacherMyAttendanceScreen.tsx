import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";

import {
  ActivityIndicator,
  Avatar,
  Card,
  Chip,
  IconButton,
  ProgressBar,
  Text,
  useTheme,
} from "react-native-paper";


import {
  teacherServices,
  TeacherMyAttendanceRecord,
  TeacherMyAttendanceResponse,
} from "../../services/teacherServices";

import { NativeStackScreenProps } from "@react-navigation/native-stack";

type RootStackParamList = {
  TeacherMyAttendance: undefined;
};

type Props = NativeStackScreenProps<
  RootStackParamList,
  "TeacherMyAttendance"
>;

const TeacherMyAttendanceScreen= ({ navigation }: Props) => {
  
  const theme = useTheme();

  const [data, setData] =
    useState<TeacherMyAttendanceResponse | null>(
      null
    );

  const [todayAttendance, setTodayAttendance] =
    useState<{
      marked: boolean;
      attendance: TeacherMyAttendanceRecord | null;
    } | null>(null);

  const [selectedMonth, setSelectedMonth] =
    useState(getCurrentMonth());

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] =
    useState(false);

  const loadAttendance = useCallback(
    async (month: string) => {
      try {
        setLoading(true);

        const [history, today] =
          await Promise.all([
            teacherServices.getMyAttendance(month),
            teacherServices.getMyAttendanceToday(),
          ]);

        setData(history);
        setTodayAttendance(today);
      } catch (error) {
        console.error(
          "Failed to load teacher attendance:",
          error
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    loadAttendance(selectedMonth);
  }, [selectedMonth, loadAttendance]);

  const onRefresh = async () => {
    try {
      setRefreshing(true);

      const [history, today] =
        await Promise.all([
          teacherServices.getMyAttendance(
            selectedMonth
          ),
          teacherServices.getMyAttendanceToday(),
        ]);

      setData(history);
      setTodayAttendance(today);
    } finally {
      setRefreshing(false);
    }
  };

  const changeMonth = (offset: number) => {
    const [year, month] =
      selectedMonth.split("-").map(Number);

    const date = new Date(
      year,
      month - 1 + offset,
      1
    );

    const next =
      `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

    setSelectedMonth(next);
  };

  const monthTitle = useMemo(() => {
    const [year, month] =
      selectedMonth.split("-").map(Number);

    return new Date(
      year,
      month - 1,
      1
    ).toLocaleDateString("en-IN", {
      month: "long",
      year: "numeric",
    });
  }, [selectedMonth]);

  if (loading && !data) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />

        <Text style={styles.loadingText}>
          Loading your attendance...
        </Text>
      </View>
    );
  }

  const summary = data?.summary;

  const percentage =
    summary?.attendancePercentage || 0;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor:
            theme.colors.background,
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          onPress={() => navigation.goBack()}
        />

        <View style={styles.headerContent}>
          <Text
            variant="titleLarge"
            style={styles.title}
          >
            My Attendance
          </Text>

          <Text
            variant="bodySmall"
            style={{
              color:
                theme.colors.onSurfaceVariant,
            }}
          >
            {data?.academicYear?.name ||
              "Current Academic Year"}
          </Text>
        </View>
      </View>

      <FlatList
        data={data?.attendance || []}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
        contentContainerStyle={
          styles.content
        }
        ListHeaderComponent={
          <>
            {/* Today's status */}
            <Card style={styles.todayCard}>
              <Card.Content>
                <View
                  style={styles.todayHeader}
                >
                  <View
                    style={styles.todayIcon}
                  >
                    <Avatar.Icon
                      size={46}
                      icon={
                        todayAttendance?.marked
                          ? "calendar-check"
                          : "calendar-question"
                      }
                    />
                  </View>

                  <View
                    style={
                      styles.todayContent
                    }
                  >
                    <Text
                      variant="titleMedium"
                      style={styles.todayTitle}
                    >
                      Today's Attendance
                    </Text>

                    <Text
                      variant="bodySmall"
                      style={{
                        color:
                          theme.colors
                            .onSurfaceVariant,
                      }}
                    >
                      {formatDisplayDate(
                        todayAttendance?.attendance
                          ?.date
                      )}
                    </Text>
                  </View>

                  {todayAttendance?.marked ? (
                    <StatusChip
                      status={
                        todayAttendance
                          .attendance
                          ?.status
                      }
                    />
                  ) : (
                    <Chip icon="clock-alert">
                      Not Marked
                    </Chip>
                  )}
                </View>

                {todayAttendance?.attendance
                  ?.remark && (
                  <Text
                    variant="bodySmall"
                    style={styles.remark}
                  >
                    Remark:{" "}
                    {
                      todayAttendance
                        .attendance.remark
                    }
                  </Text>
                )}
              </Card.Content>
            </Card>

            {/* Month selector */}
            <Card style={styles.monthCard}>
              <Card.Content>
                <View
                  style={
                    styles.monthSelector
                  }
                >
                  <IconButton
                    icon="chevron-left"
                    onPress={() =>
                      changeMonth(-1)
                    }
                  />

                  <View
                    style={
                      styles.monthCenter
                    }
                  >
                    <Text
                      variant="titleMedium"
                      style={
                        styles.monthTitle
                      }
                    >
                      {monthTitle}
                    </Text>

                    <Text
                      variant="bodySmall"
                      style={{
                        color:
                          theme.colors
                            .onSurfaceVariant,
                      }}
                    >
                      Monthly attendance
                    </Text>
                  </View>

                  <IconButton
                    icon="chevron-right"
                    onPress={() =>
                      changeMonth(1)
                    }
                  />
                </View>
              </Card.Content>
            </Card>

            {/* Percentage */}
            <Card style={styles.percentageCard}>
              <Card.Content>
                <View
                  style={
                    styles.percentageHeader
                  }
                >
                  <View>
                    <Text
                      variant="bodyMedium"
                    >
                      Attendance Percentage
                    </Text>

                    <Text
                      variant="headlineMedium"
                      style={
                        styles.percentage
                      }
                    >
                      {percentage.toFixed(1)}%
                    </Text>
                  </View>

                  <Avatar.Icon
                    size={58}
                    icon="chart-donut"
                  />
                </View>

                <ProgressBar
                  progress={
                    Math.min(
                      Math.max(
                        percentage / 100,
                        0
                      ),
                      1
                    )
                  }
                  style={styles.progress}
                />
              </Card.Content>
            </Card>

            {/* Summary */}
            <View style={styles.summaryGrid}>
              <SummaryCard
                label="Present"
                value={
                  summary?.present || 0
                }
                icon="account-check"
              />

              <SummaryCard
                label="Absent"
                value={
                  summary?.absent || 0
                }
                icon="account-cancel"
              />

              <SummaryCard
                label="Half Day"
                value={
                  summary?.halfDay || 0
                }
                icon="clock-outline"
              />

              <SummaryCard
                label="On Leave"
                value={
                  summary?.onLeave || 0
                }
                icon="calendar-remove"
              />
            </View>

            <Text
              variant="titleMedium"
              style={styles.historyTitle}
            >
              Attendance History
            </Text>
          </>
        }
        renderItem={({ item }) => (
          <AttendanceRow
            item={item}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Avatar.Icon
              size={64}
              icon="calendar-blank"
            />

            <Text
              variant="titleMedium"
              style={styles.emptyTitle}
            >
              No attendance records
            </Text>

            <Text
              variant="bodyMedium"
              style={styles.emptyText}
            >
              No attendance has been recorded
              for {monthTitle}.
            </Text>
          </View>
        }
      />
    </View>
  );
};

/* -------------------------------------------------- */
/* Components */
/* -------------------------------------------------- */

const SummaryCard = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: string;
}) => {
  return (
    <Card style={styles.summaryCard}>
      <Card.Content>
        <Avatar.Icon
          size={36}
          icon={icon}
        />

        <Text
          variant="titleLarge"
          style={styles.summaryValue}
        >
          {value}
        </Text>

        <Text
          variant="bodySmall"
          style={styles.summaryLabel}
        >
          {label}
        </Text>
      </Card.Content>
    </Card>
  );
};

const StatusChip = ({
  status,
}: {
  status?:
    | "PRESENT"
    | "ABSENT"
    | "HALF_DAY"
    | "ON_LEAVE";
}) => {
  switch (status) {
    case "PRESENT":
      return (
        <Chip icon="check-circle">
          Present
        </Chip>
      );

    case "ABSENT":
      return (
        <Chip icon="close-circle">
          Absent
        </Chip>
      );

    case "HALF_DAY":
      return (
        <Chip icon="clock-outline">
          Half Day
        </Chip>
      );

    case "ON_LEAVE":
      return (
        <Chip icon="calendar-remove">
          On Leave
        </Chip>
      );

    default:
      return (
        <Chip icon="help-circle">
          Unknown
        </Chip>
      );
  }
};

const AttendanceRow = ({
  item,
}: {
  item: TeacherMyAttendanceRecord;
}) => {
  return (
    <Card style={styles.historyCard}>
      <Card.Content>
        <View style={styles.historyRow}>
          <Avatar.Icon
            size={44}
            icon={getStatusIcon(item.status)}
          />

          <View
            style={styles.historyInfo}
          >
            <Text
              variant="titleSmall"
              style={styles.historyDate}
            >
              {formatDisplayDate(
                item.date
              )}
            </Text>

            {item.remark && (
              <Text
                variant="bodySmall"
                numberOfLines={1}
                style={styles.historyRemark}
              >
                {item.remark}
              </Text>
            )}
          </View>

          <StatusChip
            status={item.status}
          />
        </View>
      </Card.Content>
    </Card>
  );
};

/* -------------------------------------------------- */
/* Helpers */
/* -------------------------------------------------- */

const getCurrentMonth = () => {
  const date = new Date();

  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}`;
};

const formatDisplayDate = (
  value?: string
) => {
  if (!value) {
    return "Today";
  }

  const date = new Date(value);

  return date.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getStatusIcon = (
  status: TeacherMyAttendanceRecord["status"]
) => {
  switch (status) {
    case "PRESENT":
      return "check-circle";

    case "ABSENT":
      return "close-circle";

    case "HALF_DAY":
      return "clock-outline";

    case "ON_LEAVE":
      return "calendar-remove";

    default:
      return "help-circle";
  }
};

/* -------------------------------------------------- */
/* Styles */
/* -------------------------------------------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    marginTop: 12,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingTop: 6,
    paddingBottom: 8,
  },

  headerContent: {
    flex: 1,
  },

  title: {
    fontWeight: "700",
  },

  content: {
    paddingHorizontal: 14,
    paddingBottom: 30,
  },

  todayCard: {
    borderRadius: 16,
    marginBottom: 12,
  },

  todayHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  todayIcon: {
    marginRight: 10,
  },

  todayContent: {
    flex: 1,
  },

  todayTitle: {
    fontWeight: "700",
  },

  remark: {
    marginTop: 12,
  },

  monthCard: {
    borderRadius: 16,
    marginBottom: 12,
  },

  monthSelector: {
    flexDirection: "row",
    alignItems: "center",
  },

  monthCenter: {
    flex: 1,
    alignItems: "center",
  },

  monthTitle: {
    fontWeight: "700",
  },

  percentageCard: {
    borderRadius: 16,
    marginBottom: 12,
  },

  percentageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  percentage: {
    fontWeight: "800",
    marginTop: 4,
  },

  progress: {
    height: 8,
    borderRadius: 8,
    marginTop: 16,
  },

  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },

  summaryCard: {
    width: "48%",
    borderRadius: 14,
  },

  summaryValue: {
    fontWeight: "800",
    marginTop: 8,
  },

  summaryLabel: {
    marginTop: 2,
  },

  historyTitle: {
    fontWeight: "700",
    marginBottom: 10,
  },

  historyCard: {
    borderRadius: 14,
    marginBottom: 9,
  },

  historyRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  historyInfo: {
    flex: 1,
    marginLeft: 10,
    marginRight: 8,
  },

  historyDate: {
    fontWeight: "600",
  },

  historyRemark: {
    marginTop: 3,
  },

  empty: {
    alignItems: "center",
    paddingVertical: 45,
  },

  emptyTitle: {
    marginTop: 12,
    fontWeight: "700",
  },

  emptyText: {
    marginTop: 6,
    textAlign: "center",
  },
});

export default TeacherMyAttendanceScreen;