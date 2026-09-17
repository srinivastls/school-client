import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

import { teacherServices } from "../../services/teacherServices";
import type {
  TeacherStudentAttendanceHistoryResponse,
  TeacherStudentAttendanceHistoryItem,
} from "../../services/teacherServices";

type RouteParams = {
  studentId: string;
  sectionId: string;
  classId: string;
  classNumber?: string;
  sectionName?: string;
  studentName?: string;
};

const statusLabel = (
  status: TeacherStudentAttendanceHistoryItem["status"]
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

const statusIcon = (
  status: TeacherStudentAttendanceHistoryItem["status"]
) => {
  switch (status) {
    case "PRESENT":
      return "check-circle-outline";
    case "ABSENT":
      return "close-circle-outline";
    case "LATE":
      return "clock-alert-outline";
    case "HALF_DAY":
      return "clock-outline";
    case "HOLIDAY":
      return "calendar-remove-outline";
    default:
      return "help-circle-outline";
  }
};

const formatDate = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    weekday: "short",
  });
};

export default function TeacherStudentAttendanceHistoryScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  const {
    studentId,
    sectionId,
  } = route.params as RouteParams;

  const [data, setData] =
    useState<TeacherStudentAttendanceHistoryResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    try {
      setError(null);

      const response =
        await teacherServices.getStudentAttendanceHistory(
          studentId,
          sectionId
        );

      setData(response);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Unable to load attendance history."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [studentId, sectionId]);

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [loadHistory])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadHistory();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>
          Loading attendance history...
        </Text>
      </SafeAreaView>
    );
  }

  if (error || !data) {
    return (
      <SafeAreaView style={styles.center}>
        <MaterialCommunityIcons
          name="alert-circle-outline"
          size={48}
        />

        <Text style={styles.errorText}>
          {error || "Attendance history not found."}
        </Text>
      </SafeAreaView>
    );
  }

  const student = data.student;
  const summary = data.summary;

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <MaterialCommunityIcons
          name="arrow-left"
          size={26}
          onPress={() => navigation.goBack()}
        />

        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>
            Attendance History
          </Text>

          <Text style={styles.headerSubtitle}>
            {student.name}
          </Text>
        </View>
      </View>

      <FlatList
        data={data.attendance}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
        ListHeaderComponent={
          <>
            {/* STUDENT */}
            <View style={styles.studentCard}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {student.name
                    ?.charAt(0)
                    ?.toUpperCase() || "S"}
                </Text>
              </View>

              <View style={styles.studentInfo}>
                <Text style={styles.studentName}>
                  {student.name}
                </Text>

                <Text style={styles.studentMeta}>
                  Admission No: {student.admissionNo}
                </Text>

                {student.rollNumber && (
                  <Text style={styles.studentMeta}>
                    Roll No: {student.rollNumber}
                  </Text>
                )}
              </View>
            </View>

            {/* ACADEMIC YEAR */}
            <View style={styles.infoCard}>
              <Text style={styles.sectionTitle}>
                Academic Year
              </Text>

              <Text style={styles.academicYear}>
                {data.academicYear.name}
              </Text>

              <Text style={styles.sectionMeta}>
                Class {data.section.class.displayName} •
                Section {data.section.sectionName}
              </Text>
            </View>

            {/* SUMMARY */}
            <View style={styles.summaryCard}>
              <View style={styles.percentageCircle}>
                <Text style={styles.percentage}>
                  {summary.attendancePercentage}%
                </Text>

                <Text style={styles.percentageLabel}>
                  Attendance
                </Text>
              </View>

              <View style={styles.summaryGrid}>
                <SummaryItem
                  label="Present"
                  value={summary.present}
                />

                <SummaryItem
                  label="Absent"
                  value={summary.absent}
                />

                <SummaryItem
                  label="Late"
                  value={summary.late}
                />

                <SummaryItem
                  label="Half Day"
                  value={summary.halfDay}
                />
              </View>
            </View>

            <Text style={styles.historyTitle}>
              Attendance Records
            </Text>
          </>
        }
        renderItem={({ item }) => (
          <View style={styles.historyCard}>
            <View style={styles.historyIcon}>
              <MaterialCommunityIcons
                name={statusIcon(item.status)}
                size={24}
              />
            </View>

            <View style={styles.historyMain}>
              <Text style={styles.historyDate}>
                {formatDate(item.date)}
              </Text>

              <Text style={styles.historyStatus}>
                {statusLabel(item.status)}
              </Text>

              {item.remark ? (
                <View style={styles.remarkBox}>
                  <MaterialCommunityIcons
                    name="note-text-outline"
                    size={16}
                  />

                  <Text style={styles.remarkText}>
                    {item.remark}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialCommunityIcons
              name="calendar-blank-outline"
              size={44}
            />

            <Text style={styles.emptyTitle}>
              No attendance records
            </Text>

            <Text style={styles.emptyText}>
              Attendance records for this student will
              appear here.
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

function SummaryItem({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <View style={styles.summaryItem}>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
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
    color: "#64748B",
  },

  errorText: {
    marginTop: 12,
    textAlign: "center",
    color: "#DC2626",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },

  headerText: {
    marginLeft: 12,
  },

  headerTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "#0F172A",
  },

  headerSubtitle: {
    marginTop: 2,
    fontSize: 13,
    color: "#64748B",
  },

  listContent: {
    padding: 16,
    paddingBottom: 30,
  },

  studentCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },

  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E2E8F0",
  },

  avatarText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#334155",
  },

  studentInfo: {
    flex: 1,
    marginLeft: 14,
  },

  studentName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },

  studentMeta: {
    marginTop: 3,
    fontSize: 13,
    color: "#64748B",
  },

  infoCard: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 12,
    color: "#64748B",
    textTransform: "uppercase",
    fontWeight: "700",
  },

  academicYear: {
    marginTop: 5,
    fontSize: 17,
    fontWeight: "700",
    color: "#0F172A",
  },

  sectionMeta: {
    marginTop: 4,
    color: "#64748B",
    fontSize: 13,
  },

  summaryCard: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    flexDirection: "row",
  },

  percentageCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E2E8F0",
  },

  percentage: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
  },

  percentageLabel: {
    fontSize: 10,
    color: "#64748B",
    marginTop: 2,
  },

  summaryGrid: {
    flex: 1,
    marginLeft: 18,
    flexDirection: "row",
    flexWrap: "wrap",
  },

  summaryItem: {
    width: "50%",
    paddingVertical: 6,
  },

  summaryValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
  },

  summaryLabel: {
    fontSize: 12,
    color: "#64748B",
  },

  historyTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 10,
  },

  historyCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },

  historyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F5F9",
  },

  historyMain: {
    flex: 1,
    marginLeft: 12,
  },

  historyDate: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
  },

  historyStatus: {
    marginTop: 3,
    fontSize: 13,
    color: "#475569",
  },

  remarkBox: {
    flexDirection: "row",
    marginTop: 9,
    padding: 9,
    borderRadius: 8,
    backgroundColor: "#F8FAFC",
  },

  remarkText: {
    flex: 1,
    marginLeft: 7,
    fontSize: 13,
    color: "#475569",
    lineHeight: 18,
  },

  empty: {
    alignItems: "center",
    paddingVertical: 40,
  },

  emptyTitle: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "700",
    color: "#334155",
  },

  emptyText: {
    marginTop: 5,
    fontSize: 13,
    textAlign: "center",
    color: "#64748B",
  },
});