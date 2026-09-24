import { StyleSheet } from "react-native";
import { Colors } from "../theme/colors";
import { Metrics } from "../theme/metrics";

export const principalCreateAdminStyles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  container: {
    padding: Metrics.x4,
    paddingBottom: Metrics.x6,
  },
  header: {
    marginBottom: Metrics.x4,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
  },
  subtitle: {
    fontSize: 15,
    color: Colors.subtext,
    marginTop: Metrics.x1,
    lineHeight: 21,
  },
  card: {
    marginBottom: Metrics.x4,
    borderRadius: Metrics.x3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: Metrics.x3,
  },
  input: {
    marginBottom: Metrics.x1,
  },
  passwordInfo: {
    fontSize: 13,
    color: Colors.subtext,
    lineHeight: 19,
    marginBottom: Metrics.x3,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: Metrics.x3,
    marginTop: Metrics.x1,
  },
  cancelButton: {
    borderRadius: Metrics.x2,
  },
  createButton: {
    borderRadius: Metrics.x2,
  },
  note: {
    marginTop: Metrics.x4,
    padding: Metrics.x3,
    borderRadius: Metrics.x2,
    backgroundColor: Colors.brandPrimaryBg,
  },
  noteText: {
    fontSize: 13,
    color: Colors.subtext,
    textAlign: "center",
    lineHeight: 19,
  },
});

export const principalCreateTeacherStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Metrics.x4,
    paddingBottom: Metrics.x6,
  },
  header: {
    marginBottom: Metrics.x5,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
  },
  subtitle: {
    marginTop: Metrics.x1,
    color: Colors.subtext,
    fontSize: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: Metrics.x3,
    marginBottom: Metrics.x3,
  },
  input: {
    marginBottom: Metrics.x2,
  },
  error: {
    color: Colors.error,
    fontSize: 12,
    marginTop: -Metrics.x1,
    marginBottom: Metrics.x2,
  },
  createButton: {
    marginTop: Metrics.x5,
    borderRadius: Metrics.x2,
  },
  createButtonContent: {
    paddingVertical: Metrics.x1,
  },
});

export const principalAdminDetailsStyles = StyleSheet.create({
  screen: { flex: 1 },
  container: { padding: Metrics.x4, paddingBottom: Metrics.x6 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: Metrics.x4 },
  loadingText: { marginTop: Metrics.x3, color: Colors.subtext },
  errorTitle: { fontSize: 20, fontWeight: "800" },
  errorText: { fontSize: 14, color: Colors.subtext, marginTop: Metrics.x2, textAlign: "center" },
  header: { marginBottom: Metrics.x4 },
  title: { fontSize: 28, fontWeight: "800" },
  subtitle: { fontSize: 15, color: Colors.subtext, marginTop: Metrics.x1 },
  card: { marginBottom: Metrics.x4, borderRadius: Metrics.x3 },
  profileHeader: { flexDirection: "row", alignItems: "center" },
  avatar: { width: 58, height: 58, borderRadius: 29, alignItems: "center", justifyContent: "center", backgroundColor: Colors.brandPrimaryBg },
  avatarText: { fontSize: 24, fontWeight: "800" },
  profileInfo: { flex: 1, marginLeft: Metrics.x3 },
  name: { fontSize: 20, fontWeight: "800" },
  designation: { fontSize: 14, color: Colors.subtext, marginTop: Metrics.x1 },
  activeChip: { backgroundColor: Colors.successBg },
  inactiveChip: { backgroundColor: Colors.errorBg },
  activeChipText: { color: Colors.success },
  inactiveChipText: { color: Colors.error },
  sectionTitle: { fontSize: 18, fontWeight: "800", marginBottom: Metrics.x3 },
  detailRow: { paddingVertical: Metrics.x2 },
  detailLabel: { fontSize: 12, color: Colors.subtext, marginBottom: Metrics.x1 },
  detailValue: { fontSize: 15, fontWeight: "600" },
  divider: { marginVertical: Metrics.x1 },
  actionDescription: { fontSize: 14, color: Colors.subtext, lineHeight: 20, marginBottom: Metrics.x3 },
  statusButton: { borderRadius: Metrics.x2 },
  backButton: { marginTop: Metrics.x1 },
});

export const principalParentDetailsStyles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Metrics.x4, paddingBottom: Metrics.x6 },
  header: { alignItems: "center", marginBottom: Metrics.x5 },
  avatar: { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center", backgroundColor: Colors.brandPrimaryBg, marginBottom: Metrics.x3 },
  avatarText: { fontSize: 32, fontWeight: "800" },
  name: { fontSize: 26, fontWeight: "800", textAlign: "center" },
  designation: { fontSize: 15, color: Colors.subtext, marginTop: Metrics.x1 },
  statusBadge: { marginTop: Metrics.x2, paddingHorizontal: Metrics.x3, paddingVertical: Metrics.x1, borderRadius: 20 },
  activeBadge: { backgroundColor: Colors.successBg },
  inactiveBadge: { backgroundColor: Colors.errorBg },
  statusText: { color: "#fff", fontSize: 11, fontWeight: "800" },
  card: { marginBottom: Metrics.x4, borderRadius: Metrics.x3 },
  sectionTitle: { fontSize: 18, fontWeight: "800", marginBottom: Metrics.x3 },
  infoRow: { minHeight: 50, paddingVertical: Metrics.x2, justifyContent: "center" },
  infoRowBorder: { borderBottomWidth: 1, borderBottomColor: "#EEEEEE" },
  infoLabel: { fontSize: 12, color: Colors.subtext, marginBottom: Metrics.x1 },
  infoValue: { fontSize: 15, fontWeight: "600" },
  childCard: { padding: Metrics.x3, borderRadius: Metrics.x3, backgroundColor: Colors.brandPrimaryBg },
  childCardSpacing: { marginBottom: Metrics.x3 },
  childHeader: { flexDirection: "row", alignItems: "center" },
  childAvatar: { width: 46, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center", backgroundColor: Colors.brandPrimary },
  childAvatarText: { color: "#FFFFFF", fontSize: 19, fontWeight: "800" },
  childMain: { flex: 1, marginLeft: Metrics.x3 },
  childName: { fontSize: 17, fontWeight: "800" },
  childAdmission: { fontSize: 12, color: Colors.subtext, marginTop: Metrics.x1 },
  childStatusBadge: { paddingHorizontal: Metrics.x2, paddingVertical: Metrics.x1, borderRadius: 15, backgroundColor: Colors.successBg },
  childStatusText: { fontSize: 9, fontWeight: "800", color: "#FFFFFF" },
  childDetails: { marginTop: Metrics.x2, paddingTop: Metrics.x1, borderTopWidth: 1, borderTopColor: "rgba(0,0,0,0.06)" },
  emptyChildren: { paddingVertical: Metrics.x3 },
  muted: { color: Colors.subtext, fontSize: 14 },
  disableButton: { borderRadius: Metrics.x2, borderColor: Colors.errorBg, marginTop: Metrics.x2 },
  enableButton: { borderRadius: Metrics.x2, marginTop: Metrics.x2 },
  actionButtonContent: { paddingVertical: Metrics.x1 },
});

export const principalTeacherDetailsStyles = StyleSheet.create({
  screen: { flex: 1 },
  container: { padding: Metrics.x4, paddingBottom: Metrics.x6 },
  header: { alignItems: "center", marginBottom: Metrics.x5 },
  avatar: { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center", backgroundColor: Colors.brandPrimaryBg, marginBottom: Metrics.x3 },
  avatarText: { fontSize: 32, fontWeight: "800" },
  name: { fontSize: 26, fontWeight: "800", textAlign: "center" },
  designation: { fontSize: 15, color: Colors.subtext, marginTop: Metrics.x1 },
  statusBadge: { marginTop: Metrics.x2, paddingHorizontal: Metrics.x3, paddingVertical: Metrics.x1, borderRadius: 20 },
  activeBadge: { backgroundColor: Colors.successBg },
  inactiveBadge: { backgroundColor: Colors.errorBg },
  statusText: { color: "#fff", fontSize: 11, fontWeight: "800" },
  card: { marginBottom: Metrics.x4, borderRadius: Metrics.x3 },
  sectionTitle: { fontSize: 18, fontWeight: "800", marginBottom: Metrics.x3 },
  infoRow: { paddingVertical: Metrics.x2 },
  infoLabel: { fontSize: 12, color: Colors.subtext, marginBottom: Metrics.x1 },
  infoValue: { fontSize: 16, fontWeight: "600" },
  actionDescription: { fontSize: 14, lineHeight: 20, color: Colors.subtext, marginBottom: Metrics.x3 },
  actionButton: { borderRadius: Metrics.x2 },
  actionButtonContent: { paddingVertical: Metrics.x1 },
});
