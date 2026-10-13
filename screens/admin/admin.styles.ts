import { StyleSheet } from "react-native";
import { Colors } from "../../theme";

const adminStyles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: Colors.text,
  },
  subtitle: {
    marginTop: 5,
    marginBottom: 20,
    color: Colors.textSecondary,
  },
  card: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  cardText: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.text,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 20,
  },
  metricCard: {
    width: "47%",
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 14,
  },
  label: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  value: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.brandPrimary,
    marginTop: 8,
  },
  section: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.text,
    marginTop: 26,
    marginBottom: 10,
  },
  item: {
    padding: 15,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    marginBottom: 8,
  },
  itemText: {
    fontWeight: "700",
    color: Colors.text,
  },
  note: {
    marginTop: 16,
    color: Colors.textSecondary,
    fontSize: 12,
  },
  studentContent: {
    padding: 16,
    paddingBottom: 40,
  },
  studentTitle: {
    fontSize: 25,
    fontWeight: "800",
    color: Colors.text,
  },
  studentSubtitle: {
    marginTop: 5,
    marginBottom: 18,
    color: Colors.textSecondary,
  },
  studentRow: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingVertical: 12,
  },
  studentKey: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: "800",
  },
  studentValue: {
    marginTop: 4,
    color: Colors.text,
    fontSize: 14,
  },
  loader: {
    flex: 1,
  },
  error: {
    color: Colors.error,
    marginBottom: 12,
  },
  empty: {
    padding: 16,
    color: Colors.textSecondary,
  },
  studentField: {
    marginBottom: 12,
  },
  studentLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: Colors.textSecondary,
    marginBottom: 6,
    textTransform: "capitalize",
  },
  studentInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    color: Colors.text,
  },
  locked: {
    backgroundColor: Colors.surface,
  },
  saveButton: {
    marginTop: 12,
    backgroundColor: Colors.brandPrimary,
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  saveText: {
    color: Colors.textOnPrimary,
    fontWeight: "800",
  },
  registrationContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  registrationTitle: {
    fontSize: 27,
    fontWeight: "800",
    color: Colors.text,
  },
  registrationSubtitle: {
    marginTop: 5,
    marginBottom: 20,
    color: Colors.subtext,
  },
  registrationField: {
    marginBottom: 14,
  },
  registrationLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 7,
  },
  registrationInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 11,
    paddingHorizontal: 13,
    paddingVertical: 12,
    color: Colors.text,
  },
  optionWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  option: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 9,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  optionSelected: {
    backgroundColor: Colors.brandPrimary,
    borderColor: Colors.brandPrimary,
  },
  optionText: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: "600",
  },
  optionTextSelected: {
    color: Colors.textOnPrimary,
  },
  helper: {
    color: Colors.subtext,
    fontSize: 12,
  },
  submitButton: {
    backgroundColor: Colors.brandPrimary,
    borderRadius: 12,
    alignItems: "center",
    paddingVertical: 14,
    marginTop: 10,
  },
  submitText: {
    color: Colors.textOnPrimary,
    fontWeight: "800",
    fontSize: 15,
  },
});

export default adminStyles;
