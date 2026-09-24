import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  ActivityIndicator,
  Button,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import { adminServices } from "../../services/adminServices";
import { RootStackScreenNames } from "../../types";
import { DashboardModuleCard } from "./DashboardModuleCard";
import { CommonScreens } from "../../navigation/modules";

type DashboardData = Awaited<
  ReturnType<typeof adminServices.getDashboard>
>["data"];

const formatCurrency = (amount: number | null): string => {
  if (amount === null || amount === undefined) {
    return "Not available";
  }

  return `₹${amount.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
};

const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

/**
 * Converts unknown API/runtime errors into a safe string for React Native Text.
 * This prevents errors such as Prisma/Axios objects from being rendered directly.
 */
const getErrorMessage = (error: unknown): string => {
  if (typeof error === "string") {
    return error;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === "object" && error !== null) {
    const errorObject = error as {
      response?: {
        data?: {
          message?: unknown;
        };
      };
      message?: unknown;
      code?: unknown;
    };

    const apiMessage = errorObject.response?.data?.message;

    if (typeof apiMessage === "string") {
      return apiMessage;
    }

    if (typeof errorObject.message === "string") {
      return errorObject.message;
    }

    if (typeof errorObject.code === "string") {
      return `Request failed with error code: ${errorObject.code}`;
    }
  }

  return "Unable to load admin dashboard.";
};

type SummaryCardProps = {
  title: string;
  value: string;
  subtitle?: string;
  icon: string;
  variant?: "primary" | "success" | "warning" | "danger" | "neutral";
};

const SummaryCard = ({
  title,
  value,
  subtitle,
  icon,
  variant = "primary",
}: SummaryCardProps) => {
  return (
    <View
      style={[
        styles.summaryCard,
        styles[`card_${variant}`],
      ]}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardIcon}>{icon}</Text>

        <Text style={styles.cardTitle}>
          {title}
        </Text>
      </View>

      <Text style={styles.cardValue}>
        {value}
      </Text>

      {subtitle ? (
        <Text style={styles.cardSubtitle}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
};

type AttendanceRowProps = {
  label: string;
  value: number;
  color: string;
};

const AttendanceRow = ({
  label,
  value,
  color,
}: AttendanceRowProps) => {
  return (
    <View style={styles.attendanceRow}>
      <View style={styles.attendanceLabelContainer}>
        <View
          style={[
            styles.attendanceDot,
            { backgroundColor: color },
          ]}
        />

        <Text style={styles.attendanceLabel}>
          {label}
        </Text>
      </View>

      <Text style={styles.attendanceValue}>
        {value}
      </Text>
    </View>
  );
};


type DashboardModule = {
  title: string;
  icon: string;
  accentColor: string;
  route: RootStackScreenNames;
};

const DASHBOARD_MODULES: DashboardModule[] = [

  {
    title: "Fee Collection",
    icon: "▤",
    accentColor: "#15803D",
    route: CommonScreens.feeCollection,
  },

  {
    title: "Academics",
    icon: "▤",
    accentColor: "#0F766E",
    route: CommonScreens.academics,
  },
  {
    title: "Students",
    icon: "♙",
    accentColor: "#6622E3",
    route: CommonScreens.students,
  },
  {
    title: "Add Student",
    icon: "+",
    accentColor: "#1D4ED8",
    route: RootStackScreenNames.StudentRegistrationForm,
  },
  {
    title: "Teachers",
    icon: "♟",
    accentColor: "#2563EB",
    route: CommonScreens.teachers,
  },
  {
    title: "Add Teacher",
    icon: "+",
    accentColor: "#1D4ED8",
    route: CommonScreens.createTeacher,
  },
  {
    title: "Teacher Attendance",
    icon: "▣",
    accentColor: "#C26A09",
    route: RootStackScreenNames.AdminTeacherAttendance,
  },
  {
    title: "Leave Approvals",
    icon: "📝",
    accentColor: "#1D4ED8",
    route: RootStackScreenNames.AdminLeaveApprovals,
  },
  {
    title: "Class Teachers",
    icon: "◉",
    accentColor: "#B45309",
    route: CommonScreens.classTeachers,
  },
  
  {
    title: "Section Management",
    icon: "⚙",
    accentColor: "#B45309",
    route: RootStackScreenNames.SectionManagement,
  },
  {
    title: "Finance",
    icon: "₹",
    accentColor: "#16803C",
    route: CommonScreens.finance,
  },
  
  {
    title: "Attendance",
    icon: "▣",
    accentColor: "#C26A09",
    route: CommonScreens.attendance,
  },
  {
    title: "Parents",
    icon: "✉",
    accentColor: "#A21CAF",
    route: CommonScreens.parents,
  },
  {
    title: "Academic Years",
    icon: "⚙",
    accentColor: "#475569",
    route: CommonScreens.academicYears,
  },
  {
    title: "Classes",
    icon: "▦",
    accentColor: "#7C3AED",
    route: CommonScreens.classes,
  },
  {
    title: "Class Configuration",
    icon: "⚙",
    accentColor: "#4338CA",
    route: CommonScreens.classConfiguration,
  },
  
  {
    title: "Pending Dues",
    icon: "!",
    accentColor: "#C2410C",
    route: CommonScreens.pendingDues,
  },
  {
    title: "Defaulters",
    icon: "$",
    accentColor: "#BE123C",
    route: CommonScreens.defaulters,
  },
  
];

const AdminDashboard = () => {
  const navigation = useNavigation<any>();
  const [dashboard, setDashboard] =
    useState<DashboardData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const loadDashboard = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setErrorMessage(null);

        const response =
          await adminServices.getDashboard();

        setDashboard(response.data);
      } catch (error: unknown) {
        console.error("Dashboard error:", error);
        setErrorMessage(getErrorMessage(error));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  if (loading && !dashboard) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator
          size="large"
          color="#2563EB"
        />

        <Text style={styles.loadingText}>
          Loading admin dashboard...
        </Text>
      </SafeAreaView>
    );
  }

  if (errorMessage && !dashboard) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Text style={styles.errorIcon}>
          ⚠️
        </Text>

        <Text style={styles.errorTitle}>
          Unable to load dashboard
        </Text>

        <Text style={styles.errorMessage}>
          {errorMessage}
        </Text>

        <Text
          style={styles.retryText}
          onPress={() => loadDashboard()}
        >
          Tap here to retry
        </Text>
      </SafeAreaView>
    );
  }

  if (!dashboard) {
    return null;
  }

  const {
    financial,
    students,
    teachers,
    operations,
    academicYear,
  } = dashboard;

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top"]}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadDashboard(true)}
            colors={["#2563EB"]}
            tintColor="#2563EB"
          />
        }
      >

        

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>
              SCHOOL ADMINISTRATION
            </Text>

            <Text style={styles.pageTitle}>
              Admin Dashboard
            </Text>

            <Text style={styles.pageSubtitle}>
              Finance and daily operations
            </Text>
          </View>

          <View style={styles.headerIcon}>
            <Text style={styles.headerIconText}>
              ▦
            </Text>
          </View>
        </View>

        {/* Academic Year */}
        {/* <View style={styles.academicYearCard}>
          <View>
            <Text style={styles.academicYearLabel}>
              CURRENT ACADEMIC YEAR
            </Text>

            <Text style={styles.academicYearName}>
              {academicYear?.name ?? "Not configured"}
            </Text>
          </View>

          <Text style={styles.academicYearIcon}>
            🏫
          </Text>
        </View> */}

        


        {/* Finance Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Financial Overview
          </Text>

          <Text style={styles.sectionSubtitle}>
            Collection summary
          </Text>
        </View>

        <View style={styles.grid}>
          <SummaryCard
            title="Today's Collection"
            value={formatCurrency(
              financial.todayCollection
            )}
            subtitle="Today"
            icon="₹"
            variant="success"
          />

          <SummaryCard
            title="Weekly Collection"
            value={formatCurrency(
              financial.weeklyCollection
            )}
            subtitle="Monday to today"
            icon="↗"
            variant="primary"
          />

          <SummaryCard
            title="Monthly Collection"
            value={formatCurrency(
              financial.monthlyCollection
            )}
            subtitle="Current month"
            icon="▤"
            variant="primary"
          />

          <SummaryCard
            title="Pending Fees"
            value={
              financial.pendingFees === null
                ? "Not configured"
                : formatCurrency(
                    financial.pendingFees
                  )
            }
            subtitle={
              financial.pendingFees === null
                ? "Fee ledger required"
                : "Outstanding amount"
            }
            icon="!"
            variant="warning"
          />
        </View>

        {/* School Statistics */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            School Statistics
          </Text>

          <Text style={styles.sectionSubtitle}>
            Current school overview
          </Text>
        </View>

        <View style={styles.grid}>
          <SummaryCard
            title="Students"
            value={students.total.toLocaleString("en-IN")}
            subtitle="Active enrollments"
            icon="👨‍🎓"
            variant="primary"
          />

          <SummaryCard
            title="Teachers"
            value={teachers.total.toLocaleString("en-IN")}
            subtitle="Active teachers"
            icon="👨‍🏫"
            variant="primary"
          />
        </View>

        {/* Teacher Attendance */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Teacher Attendance
          </Text>

          <Text style={styles.sectionSubtitle}>
            Today's attendance status
          </Text>
        </View>

        <View style={styles.attendanceCard}>
          <AttendanceRow
            label="Present"
            value={teachers.presentToday}
            color="#16A34A"
          />

          <AttendanceRow
            label="Absent"
            value={teachers.absentToday}
            color="#DC2626"
          />

          <AttendanceRow
            label="Half Day"
            value={teachers.halfDayToday}
            color="#D97706"
          />

          <AttendanceRow
            label="On Leave"
            value={teachers.onLeaveToday}
            color="#7C3AED"
          />
        </View>
        {/* Management Modules */}
<View style={styles.modulesSection}>
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>
      Management Modules
    </Text>

    <Text style={styles.sectionSubtitle}>
      Quick access to school administration
    </Text>
  </View>

  <View style={styles.modulesGrid}>
    {DASHBOARD_MODULES.map((module) => (
      <DashboardModuleCard
        key={module.title}
        title={module.title}
        icon={module.icon}
        accentColor={module.accentColor}
        onPress={() =>
          navigation.navigate(module.route as never)
        }
      />
    ))}
  </View>
</View>

        {/* Operations */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Pending Operations
          </Text>

          <Text style={styles.sectionSubtitle}>
            Items requiring administrative attention
          </Text>
        </View>

        

        <View style={styles.operationCard}>
          <View style={styles.operationIconContainer}>
            <Text style={styles.operationIcon}>
              📝
            </Text>
          </View>

          <View style={styles.operationContent}>
            <Text style={styles.operationTitle}>
              Leave Approvals
            </Text>

            <Text style={styles.operationSubtitle}>
              Teacher leave requests awaiting review
            </Text>
          </View>

          <View style={styles.pendingBadge}>
            <Text style={styles.pendingBadgeText}>
              {operations.pendingLeaveApprovals}
            </Text>
          </View>
        </View>

        {/* Dashboard Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Last updated automatically when the dashboard loads
          </Text>

          <Text style={styles.footerDate}>
            {formatDate(dashboard.generatedAt)}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({

  
modulesSection: {
  marginBottom: 26,
},

modulesGrid: {
  flexDirection: "row",
  flexWrap: "wrap",
  justifyContent: "space-between",
},
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  container: {
    flex: 1,
  },

  contentContainer: {
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 40,
  },

  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 28,
    backgroundColor: "#F8FAFC",
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#64748B",
  },

  errorIcon: {
    fontSize: 36,
    marginBottom: 12,
  },

  errorTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "center",
  },

  errorMessage: {
    marginTop: 8,
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
  },

  retryText: {
    marginTop: 20,
    fontSize: 15,
    fontWeight: "700",
    color: "#2563EB",
  },

  workspaceButtonContainer: {
    marginBottom: 20,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#DBEAFE",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  eyebrow: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.2,
    color: "#64748B",
    marginBottom: 6,
  },

  pageTitle: {
    fontSize: 27,
    fontWeight: "800",
    color: "#0F172A",
  },

  pageSubtitle: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 5,
  },

  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#DBEAFE",
  },

  headerIconText: {
    fontSize: 25,
    color: "#2563EB",
    fontWeight: "700",
  },

  academicYearCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 18,
    borderRadius: 18,
    backgroundColor: "#1D4ED8",
    marginBottom: 26,
  },

  academicYearLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
    color: "#BFDBFE",
  },

  academicYearName: {
    marginTop: 6,
    fontSize: 21,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  academicYearIcon: {
    fontSize: 30,
  },

  sectionHeader: {
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
  },

  sectionSubtitle: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 4,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  summaryCard: {
    width: "48.2%",
    minHeight: 142,
    borderRadius: 17,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
  },

  card_primary: {
    backgroundColor: "#FFFFFF",
  },

  card_success: {
    backgroundColor: "#F0FDF4",
    borderColor: "#BBF7D0",
  },

  card_warning: {
    backgroundColor: "#FFFBEB",
    borderColor: "#FDE68A",
  },

  card_danger: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
  },

  card_neutral: {
    backgroundColor: "#F8FAFC",
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  cardIcon: {
    fontSize: 17,
    marginRight: 7,
  },

  cardTitle: {
    flex: 1,
    fontSize: 11,
    fontWeight: "700",
    color: "#64748B",
  },

  cardValue: {
    marginTop: 17,
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
  },

  cardSubtitle: {
    marginTop: 8,
    fontSize: 10,
    color: "#64748B",
  },

  attendanceCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    paddingHorizontal: 17,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 26,
  },

  attendanceRow: {
    minHeight: 49,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },

  attendanceLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  attendanceDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    marginRight: 10,
  },

  attendanceLabel: {
    fontSize: 14,
    color: "#334155",
    fontWeight: "500",
  },

  attendanceValue: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },

  operationCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
    marginBottom: 20,
  },

  operationIconContainer: {
    width: 45,
    height: 45,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEF3C7",
  },

  operationIcon: {
    fontSize: 21,
  },

  operationContent: {
    flex: 1,
    marginLeft: 12,
  },

  operationTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
  },

  operationSubtitle: {
    marginTop: 4,
    fontSize: 11,
    color: "#64748B",
  },

  pendingBadge: {
    minWidth: 32,
    height: 32,
    paddingHorizontal: 8,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEE2E2",
  },

  pendingBadgeText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#B91C1C",
  },

  footer: {
    alignItems: "center",
    paddingTop: 10,
  },

  footerText: {
    fontSize: 10,
    color: "#94A3B8",
    textAlign: "center",
  },

  footerDate: {
    marginTop: 5,
    fontSize: 11,
    color: "#64748B",
    fontWeight: "600",
  },
});

export { AdminDashboard };