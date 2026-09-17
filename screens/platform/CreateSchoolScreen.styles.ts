import { StyleSheet } from "react-native";

import { Colors } from "../../theme/colors";
import { Metrics } from "../../theme/metrics";

/* ============================================================
   CREATE SCHOOL STYLES
   Matches the visual language used by the dashboard:
   - soft page background
   - white cards with subtle borders
   - compact typography
   - rounded controls
   - brand-primary accents
============================================================ */

const styles = StyleSheet.create({
  /* ========================================================
     PAGE
  ======================================================== */

  container: {
    flex: 1,
    backgroundColor: "#F7F8FC",
  },

  content: {
    width: "100%",
    maxWidth: 1000,
    alignSelf: "center",
    paddingHorizontal: Metrics.x4,
    paddingTop: 45,
    paddingBottom: Metrics.x8,
  },

  /* ========================================================
     HEADER
  ======================================================== */

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Metrics.x5,
  },

  headerIcon: {
    marginRight: Metrics.x3,
  },

  headerAvatar: {
    backgroundColor: Colors.brandPrimary,
  },

  headerText: {
    flex: 1,
    minWidth: 0,
  },

  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "800",
    color: "#171717",
  },

  subtitle: {
    marginTop: Metrics.x1,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.subtext,
  },

  /* ========================================================
     FORM CARD
  ======================================================== */

  sectionCard: {
    marginBottom: Metrics.x4,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E9EBF0",
    elevation: 1,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  sectionAvatar: {
    backgroundColor: Colors.brandPrimaryBg,
    marginRight: Metrics.x2,
  },

  sectionHeaderText: {
    flex: 1,
    minWidth: 0,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#171717",
  },

  sectionSubtitle: {
    marginTop: 3,
    fontSize: 12,
    color: Colors.subtext,
  },

  sectionDivider: {
    marginVertical: Metrics.x4,
  },

  /* ========================================================
     FIELDS
  ======================================================== */

  fieldLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#44444A",
    marginBottom: Metrics.x1,
    textTransform: "uppercase",
    letterSpacing: 0.35,
  },

  required: {
    color: Colors.error,
  },

  input: {
    backgroundColor: "#FFFFFF",
    marginBottom: Metrics.x1,
  },

  multilineInput: {
    minHeight: 110,
    textAlignVertical: "top",
  },

  feedbackRow: {
    minHeight: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Metrics.x2,
  },

  feedbackText: {
    flex: 1,
    minWidth: 0,
  },

  helperText: {
    paddingHorizontal: 0,
    marginTop: -2,
    marginBottom: -2,
  },

  characterCount: {
    marginLeft: Metrics.x2,
    fontSize: 10,
    color: "#9A9AA2",
  },

  characterCountWarning: {
    color: Colors.error,
    fontWeight: "800",
  },

  /* ========================================================
     PLANS
  ======================================================== */

  planList: {
    gap: Metrics.x2,
  },

  planCard: {
    marginBottom: Metrics.x1,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderColor: "#E4E6EC",
  },

  planCardSelected: {
    backgroundColor: Colors.brandPrimary,
    borderColor: Colors.brandPrimary,
  },

  planCardContent: {
    minHeight: 48,
    paddingHorizontal: Metrics.x2,
    justifyContent: "flex-start",
  },

  planCardLabel: {
    fontSize: 11,
    fontWeight: "800",
  },

  /* ========================================================
     LIMITS
  ======================================================== */

  limitRow: {
    flexDirection: "row",
    gap: Metrics.x3,
  },

  limitColumn: {
    flex: 1,
    minWidth: 0,
  },

  /* ========================================================
     REVIEW
  ======================================================== */

  reviewCard: {
    marginBottom: Metrics.x4,
    borderRadius: 16,
    backgroundColor: "#F0EEFF",
    borderWidth: 1,
    borderColor: "#DDD9FF",
    elevation: 0,
  },

  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  reviewAvatar: {
    backgroundColor: Colors.brandPrimary,
    marginRight: Metrics.x2,
  },

  reviewHeaderText: {
    flex: 1,
    minWidth: 0,
  },

  reviewTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#171717",
  },

  reviewSubtitle: {
    marginTop: 2,
    fontSize: 11,
    color: Colors.subtext,
  },

  reviewDivider: {
    marginVertical: Metrics.x3,
  },

  reviewRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Metrics.x1,
  },

  reviewLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.subtext,
  },

  reviewValue: {
    flex: 1,
    marginLeft: Metrics.x3,
    textAlign: "right",
    fontSize: 13,
    fontWeight: "700",
    color: "#171717",
  },

  /* ========================================================
     ACTIONS
  ======================================================== */

  actions: {
    marginTop: Metrics.x1,
  },

  createButton: {
    borderRadius: 24,
    backgroundColor: Colors.brandPrimary,
  },

  createButtonContent: {
    minHeight: 52,
  },

  createButtonLabel: {
    fontSize: 12,
    fontWeight: "800",
  },

  cancelButton: {
    marginTop: Metrics.x1,
    borderRadius: 22,
  },

  formHint: {
    marginTop: Metrics.x2,
    textAlign: "center",
    fontSize: 11,
    color: Colors.subtext,
  },

  /* ========================================================
     SNACKBAR
  ======================================================== */

  successSnackbar: {
    backgroundColor: "#256B3A",
    borderRadius: 10,
  },

  errorSnackbar: {
    backgroundColor: "#B42318",
    borderRadius: 10,
  },
});

export { styles };