import React, { useMemo, useState } from "react";
import {  FlatList, Text, View } from "react-native";
import { Avatar, IconButton, Snackbar, TouchableRipple } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList, RootStackScreenNames } from "../../types";
import { Colors, makeStyles, Metrics } from "../../theme";
import { useUserStore } from "../../store";
import { useConfirm } from "../../components/ConfirmProvider";
import { academicYearServices } from "../../services/academicYearServices";

type AcademicTile = {
  title: string; subtitle: string; icon: string; accent: string;
  route?: string; onPress?: () => void;
};

const PrincipalAcademicsScreen = () => {
  const styles = useStyles();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const user = useUserStore((state) => state.user);
  const logout = useUserStore((state) => state.logout);
  const [snackbarText, setSnackbarText] = useState("");
  const [showSnackbar, setShowSnackbar] = useState(false);
  const notify = (message: string) => { setSnackbarText(message); setShowSnackbar(true); };

  const { confirm } = useConfirm();
const handleLogout = async () => {
  const confirmed = await confirm({
    title: "Logout",
    message: "Are you sure you want to logout?",
    confirmText: "Logout",
    cancelText: "Cancel",
    destructive: true,
  });

  if (!confirmed) return;

  try {
    await logout();

    navigation.reset({
      index: 0,
      routes: [{ name: RootStackScreenNames.Login }],
    });
  } catch (error) {
    console.error("LOGOUT ERROR:", error);
    notify("Unable to logout. Please try again.");
  }
};


  const tiles: AcademicTile[] = useMemo(() => [
    { title: "Subject Management", subtitle: "Create and manage subjects for each class", icon: "📚", accent: "#EEF2FF", route: "PrincipalSubjectManagement" },
    { title: "Teacher–Subject Mapping", subtitle: "Assign teachers to subjects and sections", icon: "👩‍🏫", accent: "#EEF8F2", route: "PrincipalTeacherSubjectMapping" },
    { title: "Timetable Management", subtitle: "Create and update weekly class timetables", icon: "🗓️", accent: "#FFF7E8", route: "PrincipalTimetableManagement" },
    { title: "Attendance", subtitle: "View class-wise attendance summary", icon: "📅", accent: "#EEF2FF", onPress: () => navigation.navigate(RootStackScreenNames.PrincipalAttendanceDashboard) },
    { title: "Examination Setup", subtitle: "Create and manage exams for each academic year", icon: "📝", accent: "#F3EEFF", route: "PrincipalExamSetup" },
    { title: "Exam Subjects", subtitle: "Manage subjects for each exam and class", icon: "📖", accent: "#EAF7F8", route: "PrincipalExamSubjects" },
    { title: "Exam Timetable", subtitle: "Create and manage exam timetables", icon: "⏰", accent: "#FFF0F0", route: "PrincipalExamTimetable" },
    { title: "Mark Sheets", subtitle: "View student academic performance", icon: "📝", accent: "#EEF8F2", route: "PrincipalReportCards" },
    { title: "Results", subtitle: "View examination results", icon: "📊", accent: "#FFF7E8", route: "PrincipalResults" },
    { title: "Pass / Fail", subtitle: "View pass and fail statistics", icon: "📈", accent: "#F3EEFF", onPress: () => notify("Pass/fail statistics are not connected yet.") },
    { title: "Class Performance", subtitle: "Compare performance across classes", icon: "🏫", accent: "#EAF7F8", route: "PrincipalStudentPerformanceTrends" },
    { title: "Academic Reports", subtitle: "View consolidated academic reports", icon: "📖", accent: "#FFF0F0", route: "PrincipalReportCardAnalytics" },
  ], [navigation]);

  
const openTile = async (item: AcademicTile) => {
  if (item.onPress) {
    item.onPress();
    return;
  }

  if (item.route === "PrincipalSubjectManagement") {
    try {
      const currentAcademicYearId =
        await academicYearServices.getCurrentAcademicYear();

      if (!currentAcademicYearId) {
        notify("No current academic year found.");
        return;
      }

      navigation.navigate({
        name: "PrincipalSubjectManagement",
        params: { academicYearId: currentAcademicYearId.id },
      } as never);
    } catch (error) {
      console.error("Failed to get current academic year:", error);
      notify("Unable to load the current academic year.");
    }

    return;
  }

  if (item.route === "PrincipalTimetableManagement") {
    try {
      const currentAcademicYearId =
        await academicYearServices.getCurrentAcademicYear();

      if (!currentAcademicYearId) {
        notify("No current academic year found.");
        return;
      }

      navigation.navigate({
        name: "PrincipalTimetableManagement",
        params: { academicYearId: currentAcademicYearId.id },
      } as never);
    } catch (error) {
      console.error("Failed to get current academic year:", error);
      notify("Unable to load the current academic year.");
    }

    return;
  }

  if (item.route === "PrincipalReportCards") {
    try {
      const currentAcademicYearId =
        await academicYearServices.getCurrentAcademicYear();

      if (!currentAcademicYearId) {
        notify("No current academic year found.");
        return;
      }

      navigation.navigate({
        name: "PrincipalReportCards",
        params: { academicYearId: currentAcademicYearId.id },
      } as never);
    } catch (error) {
      console.error("Failed to get current academic year:", error);
      notify("Unable to load the current academic year.");
    }

    return;
  }

  if (item.route === "PrincipalReportCardAnalytics") {
    try {
      const currentAcademicYearId =
        await academicYearServices.getCurrentAcademicYear();

      if (!currentAcademicYearId) {
        notify("No current academic year found.");
        return;
      }

      navigation.navigate({
        name: "PrincipalReportCardAnalytics",
        params: { academicYearId: currentAcademicYearId.id },
      } as never);
    } catch (error) {
      console.error("Failed to get current academic year:", error);
      notify("Unable to load the current academic year.");
    }

    return;
  }

  if (item.route === "PrincipalStudentPerformanceTrends") {
    try {
      const currentAcademicYearId =
        await academicYearServices.getCurrentAcademicYear();

      if (!currentAcademicYearId) {
        notify("No current academic year found.");
        return;
      }

      navigation.navigate({
        name: "PrincipalStudentPerformanceTrends",
        params: { academicYearId: currentAcademicYearId.id },
      } as never);
    } catch (error) {
      console.error("Failed to get current academic year:", error);
      notify("Unable to load the current academic year.");
    }

    return;
  }

  if (item.route === "PrincipalExamTimetable") {
    try {
      const currentAcademicYearId =
        await academicYearServices.getCurrentAcademicYear();

      if (!currentAcademicYearId) {
        notify("No current academic year found.");
        return;
      }

      navigation.navigate({
        name: "PrincipalExamTimetable",
        params: { academicYearId: currentAcademicYearId.id },
      } as never);
    } catch (error) {
      console.error("Failed to get current academic year:", error);
      notify("Unable to load the current academic year.");
    }

    return;
  }

  if (item.route === "PrincipalResults") {
    try {
      const currentAcademicYearId =
        await academicYearServices.getCurrentAcademicYear();

      if (!currentAcademicYearId) {
        notify("No current academic year found.");
        return;
      }

      navigation.navigate({
        name: "PrincipalResults",
        params: { academicYearId: currentAcademicYearId.id },
      } as never);
    } catch (error) {
      console.error("Failed to get current academic year:", error);
      notify("Unable to load the current academic year.");
    }

    return;
  }

if (item.route === "PrincipalExamSetup") {
  try {
    const currentAcademicYearId =
      await academicYearServices.getCurrentAcademicYear();

    if (!currentAcademicYearId?.id) {
      notify("No current academic year found.");
      return;
    }

    navigation.navigate({
      name: "PrincipalExamSetup",
      params: { academicYearId: currentAcademicYearId.id },
    } as never);
  } catch (error) {
    console.error("Failed to get current academic year:", error);
    notify("Unable to load the current academic year.");
  }

  return;
}

if (item.route === "PrincipalExamSubjects") {
  try {
    const currentAcademicYearId =
      await academicYearServices.getCurrentAcademicYear();

    if (!currentAcademicYearId?.id) {
      notify("No current academic year found.");
      return;
    }

    navigation.navigate({
      name: "PrincipalExamSubjects",
      params: { academicYearId: currentAcademicYearId.id },
    } as never);
  } catch (error) {
    console.error("Failed to get current academic year:", error);
    notify("Unable to load the current academic year.");
  }

  return;
}

  if (item.route) {
    navigation.navigate(item.route as never);
  }
};


  return <View style={styles.container}>
    <FlatList
      data={tiles} keyExtractor={(item) => item.title} numColumns={2}
      columnWrapperStyle={styles.columnWrapper} contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => <View style={styles.tileWrapper}>
        <TouchableRipple style={styles.tileRipple} onPress={() => openTile(item)} rippleColor={Colors.brandPrimaryBg}>
          <View style={styles.tile}>
            <View style={styles.tileTop}>
              <View style={[styles.tileIconContainer, { backgroundColor: item.accent }]}><Text style={styles.icon}>{item.icon}</Text></View>
              <Text style={styles.tileArrow}>›</Text>
            </View>
            <Text style={styles.tileTitle}>{item.title}</Text>
            <Text style={styles.tileSubtitle}>{item.subtitle}</Text>
            <View style={styles.tileFooter}><Text style={styles.openModule}>Open module</Text><Text style={styles.openArrow}>→</Text></View>
          </View>
        </TouchableRipple>
      </View>}
      ListHeaderComponent={<View>
        <View style={styles.platformHeader}>
          <View style={styles.platformBrand}>
            <Avatar.Icon size={44} icon="school" color="#FFFFFF" style={styles.platformLogo} />
            <View style={styles.platformBrandText}>
              <Text style={styles.platformName} numberOfLines={1}>{user?.schoolName ?? "School"}</Text>
              <Text style={styles.platformSubtitle}>Principal Administration</Text>
            </View>
          </View>
          <View style={styles.platformActions}>
            <IconButton icon="view-dashboard-outline" size={21} iconColor={Colors.brandPrimary} onPress={() => navigation.navigate(RootStackScreenNames.PrincipalDashboard)} style={styles.navIcon} />
            <IconButton icon="logout" size={21} iconColor="#D64545" onPress={handleLogout} style={styles.navIcon} />
          </View>
        </View>
        <View style={styles.dashboardHeading}>
          <Text style={styles.greeting}>Welcome, {user?.name ?? "Principal"} 👋</Text>
          <Text style={styles.pageTitle}>Academic Dashboard</Text>
          <Text style={styles.pageSubtitle}>Manage subjects, teacher assignments, timetables, and school academic performance.</Text>
        </View>
        <View style={styles.schoolInfoCard}>
          <View style={styles.schoolInfoLeft}>
            <Avatar.Icon size={42} icon="school-outline" color={Colors.brandPrimary} style={styles.schoolInfoIcon} />
            <View style={styles.schoolInfoText}>
              <Text style={styles.schoolInfoName} numberOfLines={1}>{user?.schoolName ?? "School"}</Text>
              {!!user?.schoolCode && <Text style={styles.schoolInfoCode}>School Code: {user.schoolCode}</Text>}
            </View>
          </View>
          <View style={styles.principalBadge}><Text style={styles.principalBadgeText}>PRINCIPAL</Text></View>
        </View>
        <View style={styles.sectionHeading}>
          <Text style={styles.sectionMainTitle}>Academic Modules</Text>
          <Text style={styles.sectionSubtitle}>Start with subjects, teacher assignments, and the timetable.</Text>
        </View>
      </View>}
    />
    <Snackbar visible={showSnackbar} onDismiss={() => setShowSnackbar(false)} duration={2500} style={styles.snackbar}>{snackbarText}</Snackbar>
  </View>;
};

const useStyles = makeStyles(() => ({
  container: { flex: 1, backgroundColor: "#F7F8FC" },
  list: { paddingHorizontal: Metrics.x4, paddingTop: Metrics.x4, paddingBottom: Metrics.x8 },
  columnWrapper: { justifyContent: "space-between" },
  platformHeader: { minHeight: 68, paddingHorizontal: Metrics.x3, paddingVertical: Metrics.x2, flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E9EAF0", borderRadius: 16, marginBottom: Metrics.x4, elevation: 1 },
  platformBrand: { flexDirection: "row", alignItems: "center", flex: 1, minWidth: 0 },
  platformLogo: { backgroundColor: Colors.brandPrimary, marginRight: Metrics.x2 },
  platformBrandText: { flex: 1, minWidth: 0 },
  platformName: { fontSize: 15, fontWeight: "800", color: "#171717" },
  platformSubtitle: { marginTop: 2, fontSize: 10, color: Colors.subtext },
  platformActions: { flexDirection: "row", alignItems: "center", marginLeft: Metrics.x2 },
  navIcon: { margin: 0 },
  dashboardHeading: { paddingTop: Metrics.x1, paddingBottom: Metrics.x4 },
  greeting: { fontSize: 14, fontWeight: "700", color: Colors.brandPrimary, marginBottom: Metrics.x1 },
  pageTitle: { fontSize: 28, lineHeight: 34, fontWeight: "800", color: "#171717" },
  pageSubtitle: { marginTop: Metrics.x1, fontSize: 14, lineHeight: 21, color: Colors.subtext, maxWidth: 650 },
  schoolInfoCard: { minHeight: 76, flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: Metrics.x3, marginBottom: Metrics.x4, borderRadius: 14, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#ECEEF3", elevation: 1 },
  schoolInfoLeft: { flexDirection: "row", alignItems: "center", flex: 1, minWidth: 0 },
  schoolInfoIcon: { backgroundColor: Colors.brandPrimaryBg },
  schoolInfoText: { marginLeft: Metrics.x2, flex: 1, minWidth: 0 },
  schoolInfoName: { fontSize: 14, fontWeight: "800", color: "#171717" },
  schoolInfoCode: { marginTop: 3, fontSize: 10, color: Colors.subtext },
  principalBadge: { paddingHorizontal: Metrics.x2, paddingVertical: 6, borderRadius: 8, backgroundColor: "#EEF8F2" },
  principalBadgeText: { fontSize: 8, fontWeight: "900", letterSpacing: 0.5, color: "#16834B" },
  sectionHeading: { marginTop: Metrics.x2, marginBottom: Metrics.x3 },
  sectionMainTitle: { fontSize: 19, lineHeight: 24, fontWeight: "800", color: "#171717" },
  sectionSubtitle: { fontSize: 12, color: Colors.subtext, marginTop: 3 },
  tileWrapper: { width: "48.5%", marginBottom: Metrics.x3, borderRadius: 14, overflow: "hidden" },
  tileRipple: { flex: 1 },
  tile: { minHeight: 190, padding: Metrics.x3, borderRadius: 14, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#ECEEF3", elevation: 1 },
  tileTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: Metrics.x3 },
  tileIconContainer: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  icon: { fontSize: 25 }, tileArrow: { fontSize: 25, fontWeight: "700", color: Colors.subtext },
  tileTitle: { fontSize: 15, lineHeight: 20, fontWeight: "800", color: "#171717" },
  tileSubtitle: { fontSize: 11, lineHeight: 17, color: Colors.subtext, marginTop: Metrics.x1, minHeight: 34 },
  tileFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: Metrics.x3, paddingTop: Metrics.x2, borderTopWidth: 1, borderTopColor: "#F0F1F4" },
  openModule: { fontSize: 10, fontWeight: "800", color: Colors.brandPrimary },
  openArrow: { fontSize: 15, fontWeight: "800", color: Colors.brandPrimary },
  snackbar: { backgroundColor: "#252525", borderRadius: 10 },
}));

export { PrincipalAcademicsScreen };
