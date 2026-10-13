import React from "react";
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList, RootStackScreenNames } from "../../types";
import { CommonScreens } from "../../navigation/modules";
import { Colors, Metrics, Typography } from "../../theme";
import { AdminFeatureCard } from "./AdminFeatureCard";

type Props = NativeStackScreenProps<
  RootStackParamList,
  RootStackScreenNames.AdminFeatureMenu
>;

type FeatureDefinition = {
  title: string;
  description: string;
  icon: string;
  accentColor: string;
  route: RootStackScreenNames;
};

const FEATURES: FeatureDefinition[] = [
  {
    title: "Student Administration",
    description: "Manage students, admissions, classes and sections.",
    icon: "♙",
    accentColor: "#6622E3",
    route: CommonScreens.students,
  },
  {
    title: "Finance Management",
    description: "Review collections, dues, transactions and payments.",
    icon: "₹",
    accentColor: "#16803C",
    route: CommonScreens.finance,
  },
  {
    title: "Staff Administration",
    description: "Manage teachers, staff profiles and leave operations.",
    icon: "♟",
    accentColor: "#2563EB",
    route: CommonScreens.teachers,
  },
  {
    title: "Attendance & Calendar",
    description: "Review attendance and manage academic dates.",
    icon: "▣",
    accentColor: "#C26A09",
    route: CommonScreens.attendance,
  },
  {
    title: "Parents & Families",
    description: "Review parent records and family contact information.",
    icon: "✉",
    accentColor: "#A21CAF",
    route: CommonScreens.parents,
  },
  {
    title: "Academic Years",
    description: "Manage academic years and school progression.",
    icon: "⚙",
    accentColor: "#475569",
    route: CommonScreens.academicYears,
  },
  {
    title: "Reports & Exports",
    description: "Generate operational reports and export data.",
    icon: "▤",
    accentColor: "#0F766E",
    route: CommonScreens.academics,
  },
  {
    title: "Classes & Sections",
    description: "Manage classes, sections and class-level students.",
    icon: "▦",
    accentColor: "#7C3AED",
    route: CommonScreens.classes,
  },
  {
    title: "Class Configuration",
    description: "Configure class structures and academic sections.",
    icon: "⚙",
    accentColor: "#4338CA",
    route: CommonScreens.classConfiguration,
  },
  {
    title: "Class Teachers",
    description: "Review and assign teachers to school sections.",
    icon: "◉",
    accentColor: "#B45309",
    route: CommonScreens.classTeachers,
  },
  {
    title: "Fee Collection",
    description: "Collect fees and issue payment receipts.",
    icon: "▤",
    accentColor: "#15803D",
    route: CommonScreens.feeCollection,
  },
  {
    title: "Pending Dues",
    description: "Review outstanding balances and follow up on dues.",
    icon: "!",
    accentColor: "#C2410C",
    route: CommonScreens.pendingDues,
  },
  {
    title: "Defaulters",
    description: "Review students with unpaid fee balances.",
    icon: "$",
    accentColor: "#BE123C",
    route: CommonScreens.defaulters,
  },
  {
    title: "Create Teacher",
    description: "Add teacher accounts and staff credentials.",
    icon: "+",
    accentColor: "#1D4ED8",
    route: CommonScreens.createTeacher,
  },
];

export const AdminFeatureMenu = ({ navigation }: Props) => (
  <SafeAreaView style={styles.safeArea}>
    <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.eyebrow}>SCHOOL ADMINISTRATION</Text>
          <Text style={styles.title}>Admin Workspace</Text>
          <Text style={styles.subtitle}>
            Manage your school operations from one place.
          </Text>
        </View>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>A</Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <View style={styles.infoDot} />
        <View style={styles.infoTextContainer}>
          <Text style={styles.infoTitle}>Administration tools</Text>
          <Text style={styles.infoDescription}>
            Select a module to continue. Each module will contain its own
            workflows, filters and actions.
          </Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Management modules</Text>
      {FEATURES.map((feature) => (
        <AdminFeatureCard
          key={feature.route}
          title={feature.title}
          description={feature.description}
          icon={feature.icon}
          accentColor={feature.accentColor}
          onPress={() => navigation.navigate(feature.route as never)}
        />
      ))}
    </ScrollView>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  scrollContent: {
    paddingHorizontal: Metrics.x4,
    paddingTop: Metrics.x4,
    paddingBottom: Metrics.x8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Metrics.x5,
  },
  headerTextContainer: { flex: 1, paddingRight: Metrics.x3 },
  eyebrow: {
    ...Typography.fieldLabel,
    color: Colors.brandPrimary,
    marginBottom: Metrics.x1,
  },
  title: { ...Typography.pageTitle, color: Colors.text },
  subtitle: {
    ...Typography.pageSubtitle,
    color: Colors.textSecondary,
    marginTop: Metrics.x1,
  },
  headerBadge: {
    width: 56,
    height: 56,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.brandPrimaryBg,
  },
  headerBadgeText: { ...Typography.sectionTitle, color: Colors.brandPrimary },
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: Metrics.x4,
    borderRadius: 16,
    backgroundColor: Colors.brandPrimaryBg,
    marginBottom: Metrics.x6,
  },
  infoDot: {
    width: 8,
    height: 8,
    borderRadius: 8,
    backgroundColor: Colors.brandPrimary,
    marginTop: 6,
    marginRight: Metrics.x2,
  },
  infoTextContainer: { flex: 1 },
  infoTitle: {
    ...Typography.cardTitle,
    fontSize: 15,
    lineHeight: 20,
    color: Colors.brandPrimary,
  },
  infoDescription: {
    ...Typography.bodySmall,
    color: Colors.brandSecondary,
    marginTop: Metrics.x1,
  },
  sectionTitle: {
    ...Typography.sectionTitle,
    color: Colors.text,
    marginBottom: Metrics.x3,
  },
});
