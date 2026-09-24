import { StyleSheet } from "react-native";
import { Colors } from "../theme/colors";
import { Metrics } from "../theme/metrics";

const platformSchoolsStyles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#F6F7FB",
    paddingHorizontal: Metrics.x4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: Metrics.x4,
    marginBottom: Metrics.x4,
  },
  headerText: {
    flex: 1,
    marginRight: Metrics.x3,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#171717",
  },
  subtitle: {
    marginTop: Metrics.x1,
    fontSize: 13,
    lineHeight: 19,
    color: Colors.subtext,
  },
  addButton: {
    borderRadius: 10,
  },
  addButtonContent: {
    minHeight: 44,
  },
  summaryRow: {
    flexDirection: "row",
    gap: Metrics.x2,
    marginBottom: Metrics.x3,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8E8EE",
  },
  summaryContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Metrics.x2,
  },
  summaryIcon: {
    backgroundColor: Colors.brandPrimaryBg,
    marginRight: Metrics.x2,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#171717",
  },
  summaryLabel: {
    marginTop: 1,
    fontSize: 10,
    fontWeight: "600",
    color: Colors.subtext,
  },
  search: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8E8EE",
    marginBottom: Metrics.x3,
  },
  searchInput: {
    fontSize: 13,
  },
  list: {
    paddingBottom: Metrics.x6,
  },
  cardTouchable: {
    borderRadius: 16,
    marginBottom: Metrics.x3,
  },
  card: {
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8E8EE",
    elevation: 1,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  schoolIcon: {
    backgroundColor: Colors.brandPrimary,
    marginRight: Metrics.x2,
  },
  schoolIdentity: {
    flex: 1,
    minWidth: 0,
    marginRight: Metrics.x2,
  },
  schoolName: {
    fontSize: 17,
    fontWeight: "800",
    color: "#171717",
  },
  schoolCode: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: "700",
    color: Colors.subtext,
    letterSpacing: 0.4,
  },
  divider: {
    marginVertical: Metrics.x3,
  },
  metrics: {
    flexDirection: "row",
  },
  metric: {
    flex: 1,
    alignItems: "center",
  },
  metricValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#171717",
  },
  metricLabel: {
    marginTop: 2,
    fontSize: 11,
    color: Colors.subtext,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  principal: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    minWidth: 0,
  },
  principalIcon: {
    backgroundColor: "#F1F2F7",
    marginRight: Metrics.x2,
  },
  principalText: {
    flex: 1,
    minWidth: 0,
  },
  principalLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.subtext,
    textTransform: "uppercase",
  },
  principalName: {
    marginTop: 1,
    fontSize: 13,
    fontWeight: "700",
    color: "#26262B",
  },
  openLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: Colors.brandPrimary,
  },
  empty: {
    alignItems: "center",
    paddingTop: Metrics.x6,
    paddingHorizontal: Metrics.x5,
  },
  emptyIcon: {
    backgroundColor: Colors.brandPrimaryBg,
  },
  emptyTitle: {
    marginTop: Metrics.x3,
    fontSize: 18,
    fontWeight: "800",
    color: "#171717",
  },
  emptyText: {
    marginTop: Metrics.x1,
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
    color: Colors.subtext,
  },
  snackbar: {
    backgroundColor: "#B42318",
  },
});

export default platformSchoolsStyles;
