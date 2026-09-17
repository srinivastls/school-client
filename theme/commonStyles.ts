// src/theme/commonStyles.ts

import { StyleSheet } from "react-native";
import { Colors } from "./colors";
import { Metrics } from "./metrics";
import { Typography } from "./typography";

export const CommonStyles = StyleSheet.create({

  // =========================
  // SCREEN
  // =========================

  screen: {
    flex: 1,
    backgroundColor: "#F6F7FB",
  },

  content: {
    width: "100%",
    maxWidth: 1400,
    alignSelf: "center",
    paddingHorizontal: Metrics.x4,
    paddingTop: Metrics.x4,
    paddingBottom: Metrics.x7,
  },

  // =========================
  // HEADINGS
  // =========================

  pageTitle: {
    ...Typography.pageTitle,
    color: "#171717",
  },

  pageSubtitle: {
    ...Typography.pageSubtitle,
    color: Colors.subtext,
    marginTop: Metrics.x1,
  },

  sectionTitle: {
    ...Typography.sectionTitle,
    color: "#171717",
  },

  sectionSubtitle: {
    ...Typography.sectionSubtitle,
    color: Colors.subtext,
    marginTop: 2,
  },

  // =========================
  // TEXT
  // =========================

  body: {
    ...Typography.body,
    color: "#171717",
  },

  bodySmall: {
    ...Typography.bodySmall,
    color: Colors.subtext,
  },

  label: {
    ...Typography.label,
    color: "#44444A",
  },

  caption: {
    ...Typography.caption,
    color: Colors.subtext,
  },

  // =========================
  // CARDS
  // =========================

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E8E8EE",
    elevation: 1,
  },

  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "#E9E9EF",
    elevation: 1,
    marginBottom: Metrics.x4,
  },

  // =========================
  // STATISTICS
  // =========================

  statValue: {
    ...Typography.statValue,
    color: "#171717",
  },

  statLabel: {
    ...Typography.statLabel,
    color: Colors.subtext,
  },

  // =========================
  // INPUTS
  // =========================

  input: {
    backgroundColor: "#FFFFFF",
    marginBottom: Metrics.x1,
  },

  fieldLabel: {
    ...Typography.label,
    color: "#44444A",
    marginBottom: Metrics.x1,
    textTransform: "uppercase",
    letterSpacing: 0.35,
  },

  // =========================
  // BUTTONS
  // =========================

  primaryButton: {
    borderRadius: 12,
  },

  primaryButtonContent: {
    minHeight: 42,
    paddingHorizontal: 14,
  },

  // =========================
  // DIVIDER
  // =========================

  divider: {
    marginVertical: Metrics.x3,
  },
});