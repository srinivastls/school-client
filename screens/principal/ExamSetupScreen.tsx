import React, { useCallback, useEffect, useMemo, useState } from "react";
import {FlatList, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View,
} from "react-native";
import {
  ActivityIndicator, Button, Card, Chip, Dialog, Divider, HelperText, IconButton,
  Menu, Portal, SegmentedButtons, Snackbar, Text, TextInput,
} from "react-native-paper";
import { useConfirm } from "../../components/ConfirmProvider";
import {
  ExamRecord, principalExamServices,
} from "../../services/principalExamServices";

import { useRoute } from "@react-navigation/native";

const dateOnly = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 10);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

const isDate = (value: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  !Number.isNaN(Date.parse(`${value}T00:00:00`));


export default function ExamSetupScreen() {
  const route = useRoute<any>();
  const academicYearId = route.params?.academicYearId ?? "";
  const [exams, setExams] = useState<ExamRecord[]>([]);
  const [examTypes, setExamTypes] = useState<string[]>([]);
  const [academicYearName, setAcademicYearName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [typeMenuVisible, setTypeMenuVisible] = useState(false);
  const [editing, setEditing] = useState<ExamRecord | null>(null);
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [termNumber, setTermNumber] = useState("1");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [search, setSearch] = useState("");
  const [publishedFilter, setPublishedFilter] = useState("all");
  const [error, setError] = useState("");
  const [snackbar, setSnackbar] = useState("");
  const { confirm } = useConfirm();

  const load = useCallback(async () => {
    if (!academicYearId) {
      setLoading(false);
      setError("No academic year was provided to Exam Setup.");
      setExams([]);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const [options, rows] = await Promise.all([
        principalExamServices.getOptions(academicYearId),
        principalExamServices.getExams(academicYearId),
      ]);
      setAcademicYearName(options.academicYear?.name ?? "");
      setExamTypes(options.examTypes);
      setExams(rows);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? e?.message ?? "Unable to load exams.");
    } finally {
      setLoading(false);
    }
  }, [academicYearId]);

  useEffect(() => { void load(); }, [load]);

  const visibleExams = useMemo(() => exams.filter((exam) => {
    const matchesSearch = `${exam.name} ${exam.type} ${exam.termNumber}`
      .toLowerCase().includes(search.trim().toLowerCase());
    const matchesPublished = publishedFilter === "all" ||
      (publishedFilter === "published" ? exam.isPublished : !exam.isPublished);
    return matchesSearch && matchesPublished;
  }), [exams, search, publishedFilter]);

  const resetForm = () => {
    setEditing(null);
    setName("");
    setType(examTypes[0] ?? "");
    setTermNumber("1");
    setStartDate("");
    setEndDate("");
    setError("");
  };

  const openCreate = () => {
    resetForm();
    setDialogVisible(true);
  };

  const openEdit = (exam: ExamRecord) => {
    setEditing(exam);
    setName(exam.name);
    setType(exam.type);
    setTermNumber(String(exam.termNumber));
    setStartDate(dateOnly(exam.startDate));
    setEndDate(dateOnly(exam.endDate));
    setError("");
    setDialogVisible(true);
  };

  const validate = () => {
    if (!name.trim()) return "Enter an exam name.";
    if (!type) return "Select an exam type.";
    if (!Number.isInteger(Number(termNumber)) || Number(termNumber) < 1)
      return "Term number must be a positive whole number.";
    if (!isDate(startDate)) return "Enter the start date as YYYY-MM-DD.";
    if (!isDate(endDate)) return "Enter the end date as YYYY-MM-DD.";
    if (startDate > endDate) return "End date must be on or after start date.";
    return "";
  };

  const save = async () => {
    const validationError = validate();
    if (validationError) { setError(validationError); return; }
    if (!academicYearId) {
      setError("No academic year was provided to Exam Setup.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = {
        name: name.trim(),
        type,
        termNumber: Number(termNumber),
        startDate: new Date(`${startDate}T00:00:00`).toISOString(),
        endDate: new Date(`${endDate}T23:59:59`).toISOString(),
      };
      if (editing) {
        await principalExamServices.updateExam(editing.id, payload);
        setSnackbar("Exam updated.");
      } else {
        await principalExamServices.createExam({ ...payload, academicYearId });
        setSnackbar("Exam created.");
      }
      setDialogVisible(false);
      resetForm();
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? e?.message ?? "Unable to save exam.");
    } finally {
      setSaving(false);
    }
  };

  
const togglePublished = async (exam: ExamRecord) => {
  const next = !exam.isPublished;

  const confirmed = await confirm({
    title: next ? "Publish exam?" : "Unpublish exam?",
    message: next
      ? "This will mark the exam as published."
      : "This will mark the exam as unpublished.",
    confirmText: next ? "Publish" : "Unpublish",
    cancelText: "Cancel",
    destructive: false,
  });

  if (!confirmed) return;

  try {
    await principalExamServices.setPublished(exam.id, next);

    setSnackbar(next ? "Exam published." : "Exam unpublished.");

    await load();
  } catch (e: any) {
    setError(
      e?.response?.data?.message ??
        e?.message ??
        "Unable to change publication status."
    );
  }
};

const confirmDelete = async (exam: ExamRecord) => {
  const confirmed = await confirm({
    title: "Delete exam?",
    message: `Delete "${exam.name}"? Related subjects, timetable entries, and marks may be deleted according to your database cascade rules.`,
    confirmText: "Delete",
    cancelText: "Cancel",
    destructive: true,
  });

  if (!confirmed) return;

  try {
    await principalExamServices.deleteExam(exam.id);

    setSnackbar("Exam deleted.");

    await load();
  } catch (e: any) {
    setError(
      e?.response?.data?.message ??
        e?.message ??
        "Unable to delete exam."
    );
  }
};


  const renderExam = ({ item }: { item: ExamRecord }) => (
    <Card style={styles.card} mode="outlined">
      <Card.Content>
        <View style={styles.cardHeader}>
          <View style={styles.flex}>
            <Text variant="titleMedium">{item.name}</Text>
            <Text variant="bodySmall" style={styles.muted}>
              {item.type} · Term {item.termNumber}
            </Text>
          </View>
          <Chip compact icon={item.isPublished ? "check-circle" : "clock-outline"}>
            {item.isPublished ? "Published" : "Draft"}
          </Chip>
        </View>
        <Text variant="bodyMedium" style={styles.dates}>
          {dateOnly(item.startDate)}  →  {dateOnly(item.endDate)}
        </Text>
        <Divider style={styles.divider} />
        <View style={styles.actions}>
          <Button compact icon="pencil" onPress={() => openEdit(item)}>Edit</Button>
          <Button compact icon={item.isPublished ? "eye-off" : "publish"} onPress={() => togglePublished(item)}>
            {item.isPublished ? "Unpublish" : "Publish"}
          </Button>
          <IconButton icon="delete-outline" accessibilityLabel={`Delete ${item.name}`} onPress={() => confirmDelete(item)} />
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.heading}>
        <View style={styles.flex}>
          <Text variant="headlineSmall">Exam Setup</Text>
          <Text variant="bodyMedium" style={styles.muted}>
            {academicYearName || "Selected academic year"}
          </Text>
        </View>
        <Button mode="contained" icon="plus" onPress={openCreate} disabled={!academicYearId}>
          New exam
        </Button>
      </View>

      <TextInput
        mode="outlined"
        label="Search exams"
        value={search}
        onChangeText={setSearch}
        left={<TextInput.Icon icon="magnify" />}
        style={styles.search}
      />
      <SegmentedButtons
        value={publishedFilter}
        onValueChange={setPublishedFilter}
        buttons={[
          { value: "all", label: "All" },
          { value: "draft", label: "Drafts" },
          { value: "published", label: "Published" },
        ]}
        style={styles.filters}
      />

      {!!error && !dialogVisible && <HelperText type="error" visible>{error}</HelperText>}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
          <Text style={styles.muted}>Loading exams…</Text>
        </View>
      ) : (
        <FlatList
          data={visibleExams}
          keyExtractor={(item) => item.id}
          renderItem={renderExam}
          contentContainerStyle={visibleExams.length ? styles.list : styles.emptyList}
          refreshing={loading}
          onRefresh={() => { void load(); }}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text variant="titleMedium">No exams found</Text>
              <Text style={styles.muted}>Create an exam for this academic year to get started.</Text>
            </View>
          }
        />
      )}

      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => !saving && setDialogVisible(false)} style={styles.dialog}>
          <Dialog.Title>{editing ? "Edit exam" : "Create exam"}</Dialog.Title>
          <Dialog.ScrollArea style={styles.scrollArea}>
            <ScrollView keyboardShouldPersistTaps="handled">
              <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
                <TextInput mode="outlined" label="Exam name" value={name} onChangeText={setName} style={styles.field} />
                <Menu
                  visible={typeMenuVisible}
                  onDismiss={() => setTypeMenuVisible(false)}
                  anchor={
                    <Button mode="outlined" onPress={() => setTypeMenuVisible(true)} style={styles.field}>
                      {type || "Select exam type"}
                    </Button>
                  }
                >
                  {examTypes.map((value) => (
                    <Menu.Item key={value} title={value} onPress={() => { setType(value); setTypeMenuVisible(false); }} />
                  ))}
                </Menu>
                {examTypes.length === 0 && (
                  <HelperText type="error">No exam types were returned. Check the generated Prisma ExamType enum and backend build.</HelperText>
                )}
                <TextInput
                  mode="outlined" label="Term number" value={termNumber}
                  onChangeText={setTermNumber} keyboardType="number-pad" style={styles.field}
                />
                <TextInput
                  mode="outlined" label="Start date (YYYY-MM-DD)" value={startDate}
                  onChangeText={setStartDate} placeholder="2026-11-01" style={styles.field}
                />
                <TextInput
                  mode="outlined" label="End date (YYYY-MM-DD)" value={endDate}
                  onChangeText={setEndDate} placeholder="2026-11-10" style={styles.field}
                />
                <Text variant="bodySmall" style={styles.muted}>
                  The selected academic year is used automatically.
                </Text>
              </KeyboardAvoidingView>
            </ScrollView>
          </Dialog.ScrollArea>
          {!!error && <HelperText type="error" visible>{error}</HelperText>}
          <Dialog.Actions>
            <Button onPress={() => { setDialogVisible(false); setError(""); }} disabled={saving}>Cancel</Button>
            <Button mode="contained" onPress={() => { void save(); }} loading={saving} disabled={saving}>
              {editing ? "Save changes" : "Create exam"}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      <Snackbar visible={!!snackbar} onDismiss={() => setSnackbar("")} duration={2500}>
        {snackbar}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  heading: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 14 },
  flex: { flex: 1 },
  muted: { opacity: 0.7, marginTop: 3 },
  search: { marginBottom: 10 },
  filters: { marginBottom: 10 },
  list: { paddingBottom: 24 },
  emptyList: { flexGrow: 1, justifyContent: "center", paddingBottom: 32 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8, padding: 24 },
  card: { marginBottom: 10 },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  dates: { marginTop: 12 },
  divider: { marginTop: 12 },
  actions: { flexDirection: "row", justifyContent: "flex-end", alignItems: "center", flexWrap: "wrap", marginTop: 6 },
  dialog: { maxHeight: "90%" },
  scrollArea: { paddingHorizontal: 0 },
  field: { marginHorizontal: 16, marginBottom: 12 },
});
