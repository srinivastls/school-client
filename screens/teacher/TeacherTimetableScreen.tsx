import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import {
  ActivityIndicator,
  Avatar,
  Card,
  Chip,
  IconButton,
  Text,
  useTheme,
} from "react-native-paper";

import {
  teacherServices,
  TeacherTimetableDay,
  TeacherTimetableDayData,
  TeacherTimetableEntry,
  TeacherTimetableResponse,
} from "../../services/teacherServices";

const DAYS: TeacherTimetableDay[] = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

const TeacherTimetableScreen = ({
  navigation,
}: any) => {
  const theme = useTheme();

  const [data, setData] =
    useState<TeacherTimetableResponse | null>(
      null
    );

  const [selectedDay, setSelectedDay] =
    useState<TeacherTimetableDay>(
      getTodayDay()
    );

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const loadTimetable = useCallback(
    async () => {
      try {
        setLoading(true);

        const response =
          await teacherServices.getMyTimetable();

        setData(response);

        /*
         * Start on today's day when available.
         */
        if (response.today) {
          setSelectedDay(response.today);
        }
      } catch (error: any) {
        console.error(
          "Failed to load teacher timetable:",
          error
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    loadTimetable();
  }, [loadTimetable]);

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await loadTimetable();
    } finally {
      setRefreshing(false);
    }
  };

  const selectedDayData =
    useMemo<TeacherTimetableDayData | null>(
      () => {
        if (!data) return null;

        return (
          data.timetable.find(
            (item) =>
              item.day === selectedDay
          ) || null
        );
      },
      [data, selectedDay]
    );

  const entries =
    selectedDayData?.entries || [];

  if (loading && !data) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />

        <Text style={styles.loadingText}>
          Loading timetable...
        </Text>
      </View>
    );
  }

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
          onPress={() =>
            navigation.goBack()
          }
        />

        <View style={styles.headerContent}>
          <Text
            variant="titleLarge"
            style={styles.headerTitle}
          >
            My Timetable
          </Text>

          <Text
            variant="bodySmall"
            style={{
              color:
                theme.colors
                  .onSurfaceVariant,
            }}
          >
            {data?.academicYear?.name ||
              "Current Academic Year"}
          </Text>
        </View>

        <IconButton
          icon="refresh"
          onPress={onRefresh}
        />
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Weekly day selector */}
        <Card style={styles.dayCard}>
          <Card.Content>
            <Text
              variant="titleMedium"
              style={styles.dayTitle}
            >
              Weekly Schedule
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={
                false
              }
              contentContainerStyle={
                styles.daysContainer
              }
            >
              {DAYS.map((day) => {
                const dayData =
                  data?.timetable.find(
                    (item) =>
                      item.day === day
                  );

                const isSelected =
                  selectedDay === day;

                const isToday =
                  data?.today === day;

                return (
                  <View
                    key={day}
                    style={styles.dayWrapper}
                  >
                    <Chip
                      selected={
                        isSelected
                      }
                      onPress={() =>
                        setSelectedDay(day)
                      }
                      style={
                        styles.dayChip
                      }
                    >
                      {getShortDay(day)}
                    </Chip>

                    {isToday && (
                      <Text
                        variant="labelSmall"
                        style={
                          styles.todayLabel
                        }
                      >
                        TODAY
                      </Text>
                    )}

                    {!isToday &&
                      dayData &&
                      dayData.entries
                        .length > 0 && (
                        <Text
                          variant="labelSmall"
                          style={
                            styles.periodCount
                          }
                        >
                          {
                            dayData
                              .entries
                              .length
                          }{" "}
                          periods
                        </Text>
                      )}
                  </View>
                );
              })}
            </ScrollView>
          </Card.Content>
        </Card>

        {/* Selected day */}
        <View style={styles.selectedDayHeader}>
          <View>
            <Text
              variant="headlineSmall"
              style={styles.selectedDayTitle}
            >
              {getFullDay(selectedDay)}
            </Text>

            <Text
              variant="bodyMedium"
              style={{
                color:
                  theme.colors
                    .onSurfaceVariant,
              }}
            >
              {entries.length === 0
                ? "No classes scheduled"
                : `${entries.length} ${
                    entries.length ===
                    1
                      ? "period"
                      : "periods"
                  } scheduled`}
            </Text>
          </View>

          {data?.today ===
            selectedDay && (
            <Chip icon="calendar-today">
              Today
            </Chip>
          )}
        </View>

        {/* Schedule */}
        {entries.length > 0 ? (
          <View style={styles.schedule}>
            {entries.map((entry) => (
              <TimetableCard
                key={entry.id}
                entry={entry}
              />
            ))}
          </View>
        ) : (
          <Card style={styles.emptyCard}>
            <Card.Content
              style={styles.emptyContent}
            >
              <Avatar.Icon
                size={62}
                icon="calendar-blank"
              />

              <Text
                variant="titleMedium"
                style={styles.emptyTitle}
              >
                No classes scheduled
              </Text>

              <Text
                variant="bodyMedium"
                style={styles.emptyText}
              >
                There are no timetable
                entries for{" "}
                {getFullDay(selectedDay)}.
              </Text>
            </Card.Content>
          </Card>
        )}

        {/* Weekly summary */}
        <Card style={styles.summaryCard}>
          <Card.Content>
            <Text
              variant="titleMedium"
              style={styles.summaryTitle}
            >
              Weekly Summary
            </Text>

            <View style={styles.summaryRow}>
              <SummaryItem
                icon="calendar-week"
                value={
                  data?.totalPeriods || 0
                }
                label="Total Periods"
              />

              <SummaryItem
                icon="school"
                value={
                  data?.timetable.filter(
                    (day) =>
                      day.entries.length >
                      0
                  ).length || 0
                }
                label="Teaching Days"
              />
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
};

/* -------------------------------------------------- */

const TimetableCard = ({
  entry,
}: {
  entry: TeacherTimetableEntry;
}) => {
  return (
    <Card style={styles.timetableCard}>
      <Card.Content>
        <View style={styles.timetableRow}>
          {/* Period number */}
          <View style={styles.periodContainer}>
            <Text
              variant="labelSmall"
              style={styles.periodLabel}
            >
              PERIOD
            </Text>

            <Text
              variant="headlineSmall"
              style={styles.periodNumber}
            >
              {entry.periodNumber}
            </Text>
          </View>

          <View style={styles.verticalLine} />

          {/* Time */}
          <View style={styles.timeContainer}>
            <Text
              variant="titleSmall"
              style={styles.timeText}
            >
              {entry.startTime}
            </Text>

            <Text
              variant="bodySmall"
              style={styles.timeSeparator}
            >
              to
            </Text>

            <Text
              variant="titleSmall"
              style={styles.timeText}
            >
              {entry.endTime}
            </Text>
          </View>

          {/* Details */}
          <View style={styles.details}>
            <Text
              variant="titleMedium"
              style={styles.subject}
              numberOfLines={1}
            >
              {entry.subject.name}
            </Text>

            {entry.subject.code && (
              <Text
                variant="bodySmall"
                style={styles.subjectCode}
              >
                {entry.subject.code}
              </Text>
            )}

            <View
              style={styles.classRow}
            >
              <Chip
                compact
                icon="school"
              >
                {entry.class.displayName ||
                  `Class ${entry.class.classNumber}`}
              </Chip>

              <Chip
                compact
                icon="account-group"
              >
                {entry.section.sectionName}
              </Chip>
            </View>
          </View>
        </View>
      </Card.Content>
    </Card>
  );
};

/* -------------------------------------------------- */

const SummaryItem = ({
  icon,
  value,
  label,
}: {
  icon: string;
  value: number;
  label: string;
}) => {
  return (
    <View style={styles.summaryItem}>
      <Avatar.Icon
        size={42}
        icon={icon}
      />

      <View style={styles.summaryItemText}>
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
      </View>
    </View>
  );
};

/* -------------------------------------------------- */

const getTodayDay =
  (): TeacherTimetableDay => {
    const day = new Date().getDay();

    return DAYS[
      day === 0 ? 6 : day - 1
    ];
  };

const getShortDay = (
  day: TeacherTimetableDay
) => {
  switch (day) {
    case "MONDAY":
      return "MON";

    case "TUESDAY":
      return "TUE";

    case "WEDNESDAY":
      return "WED";

    case "THURSDAY":
      return "THU";

    case "FRIDAY":
      return "FRI";

    case "SATURDAY":
      return "SAT";

    case "SUNDAY":
      return "SUN";
  }
};

const getFullDay = (
  day: TeacherTimetableDay
) => {
  return (
    day.charAt(0) +
    day
      .slice(1)
      .toLowerCase()
  );
};

/* -------------------------------------------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    marginTop: 12,
  },

  header: {
    height: 64,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
  },

  headerContent: {
    flex: 1,
  },

  headerTitle: {
    fontWeight: "700",
  },

  content: {
    paddingHorizontal: 14,
    paddingBottom: 30,
  },

  dayCard: {
    borderRadius: 16,
    marginBottom: 18,
  },

  dayTitle: {
    fontWeight: "700",
    marginBottom: 12,
  },

  daysContainer: {
    gap: 8,
    paddingBottom: 2,
  },

  dayWrapper: {
    alignItems: "center",
  },

  dayChip: {
    minWidth: 62,
  },

  todayLabel: {
    marginTop: 3,
  },

  periodCount: {
    marginTop: 3,
    opacity: 0.6,
  },

  selectedDayHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  selectedDayTitle: {
    fontWeight: "800",
  },

  schedule: {
    gap: 10,
  },

  timetableCard: {
    borderRadius: 16,
  },

  timetableRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  periodContainer: {
    width: 52,
    alignItems: "center",
  },

  periodLabel: {
    opacity: 0.6,
    fontSize: 8,
  },

  periodNumber: {
    fontWeight: "800",
    marginTop: 2,
  },

  verticalLine: {
    width: 1,
    height: 58,
    marginHorizontal: 10,
    opacity: 0.2,
  },

  timeContainer: {
    width: 72,
    alignItems: "center",
  },

  timeText: {
    fontWeight: "700",
  },

  timeSeparator: {
    opacity: 0.6,
    marginVertical: 2,
  },

  details: {
    flex: 1,
    marginLeft: 8,
  },

  subject: {
    fontWeight: "800",
  },

  subjectCode: {
    opacity: 0.6,
    marginTop: 2,
  },

  classRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 8,
    flexWrap: "wrap",
  },

  emptyCard: {
    borderRadius: 16,
  },

  emptyContent: {
    alignItems: "center",
    paddingVertical: 36,
  },

  emptyTitle: {
    marginTop: 12,
    fontWeight: "700",
  },

  emptyText: {
    marginTop: 6,
    textAlign: "center",
  },

  summaryCard: {
    borderRadius: 16,
    marginTop: 18,
  },

  summaryTitle: {
    fontWeight: "700",
    marginBottom: 14,
  },

  summaryRow: {
    flexDirection: "row",
    gap: 30,
  },

  summaryItem: {
    flexDirection: "row",
    alignItems: "center",
  },

  summaryItemText: {
    marginLeft: 10,
  },

  summaryValue: {
    fontWeight: "800",
  },

  summaryLabel: {
    opacity: 0.65,
  },
});

export default TeacherTimetableScreen;