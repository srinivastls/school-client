import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, ScrollView, StyleSheet, View } from "react-native";
import { ActivityIndicator, Button, Card, Dialog, Divider, HelperText, IconButton, Menu, Portal, Snackbar, Text, TextInput } from "react-native-paper";
import { ExamTimetableClassOption, ExamTimetableEntry, ExamTimetablePayload, ExamTimetableSubjectOption, principalExamTimetableServices } from "../../services/principalExamTimetableServices";
import { principalSubjectServices } from "../../services/principalSubjectServices";
import { useRoute } from "@react-navigation/native";
import { useConfirm } from "../../components/ConfirmProvider";
const dateOnly = (value?: string) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value.slice(0, 10);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const validDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00`));
const validTime = (value: string) => !value || /^([01]\d|2[0-3]):[0-5]\d$/.test(value);

export default function ExamTimetableScreen() {
  const route = useRoute<any>();
  const academicYearId: string | undefined = route.params?.academicYearId;
  if (!academicYearId) return <View style={styles.center}><Text>No academic year was provided.</Text></View>;
  const [yearName, setYearName] = useState("");
  const [exams, setExams] = useState<any[]>([]);
  const [classes, setClasses] = useState<ExamTimetableClassOption[]>([]);
  const [subjects, setSubjects] = useState<ExamTimetableSubjectOption[]>([]);
  const [entries, setEntries] = useState<ExamTimetableEntry[]>([]);
  const [examId, setExamId] = useState("");
  const [classId, setClassId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialog, setDialog] = useState(false);
  const [examMenu, setExamMenu] = useState(false);
  const [classMenu, setClassMenu] = useState(false);
  const [editing, setEditing] = useState<ExamTimetableEntry | null>(null);
  const [formExamId, setFormExamId] = useState("");
  const [formClassId, setFormClassId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [examDate, setExamDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const { showAlert, confirm } = useConfirm();

  const loadBase = useCallback(async () => {
    if (!academicYearId) { setLoading(false); setError("No academic year was provided."); return; }
    setLoading(true); setError("");
    try {
      const [opts, classOpts] = await Promise.all([
        principalExamTimetableServices.getOptions(academicYearId),
        principalSubjectServices.getClasses(academicYearId),
      ]);
      setYearName(opts.academicYear?.name ?? "");
      setExams(opts.exams ?? []);
      setClasses(classOpts as ExamTimetableClassOption[]);
      setExamId(old => opts.exams.some((e: any) => e.id === old) ? old : opts.exams[0]?.id ?? "");
      setClassId(old => classOpts.some((c: any) => c.id === old) ? old : classOpts[0]?.id ?? "");
    } catch (e: any) { setError(e?.response?.data?.message ?? e?.message ?? "Unable to load timetable options."); }
    finally { setLoading(false); }
  }, [academicYearId]);

  const loadEntries = useCallback(async () => {
    if (!academicYearId) return;
    try {
      const params: { academicYearId: string; examId?: string; classId?: string } = { academicYearId };
      if (examId) params.examId = examId;
      if (classId) params.classId = classId;
      const [rows, subjectRows] = await Promise.all([
        principalExamTimetableServices.getEntries(params),
        classId ? principalSubjectServices.getSubjects({ academicYearId, classId }) : principalSubjectServices.getSubjects({ academicYearId }),
      ]);
      setEntries(rows);
      setSubjects((subjectRows ?? []) as ExamTimetableSubjectOption[]);
    } catch (e: any) { setError(e?.response?.data?.message ?? e?.message ?? "Unable to load timetable entries."); }
  }, [academicYearId, examId, classId]);

  useEffect(() => { void loadBase(); }, [loadBase]);
  useEffect(() => { void loadEntries(); }, [loadEntries]);

  const visibleEntries = useMemo(() => entries.filter(e =>
    `${e.subject?.name ?? ""} ${e.subject?.code ?? ""} ${e.class?.displayName ?? ""} ${e.exam?.name ?? ""} ${dateOnly(e.examDate)}`
      .toLowerCase().includes(search.trim().toLowerCase())
  ), [entries, search]);
  const formSubjects = subjects.filter(s => s.classId === formClassId);

  const openCreate = () => {
    setEditing(null); setFormExamId(examId || exams[0]?.id || ""); setFormClassId(classId || classes[0]?.id || "");
    setSubjectId(""); setExamDate(""); setStartTime(""); setEndTime(""); setError(""); setDialog(true);
  };
  const openEdit = (e: ExamTimetableEntry) => {
    setEditing(e); setFormExamId(e.examId); setFormClassId(e.classId); setSubjectId(e.subjectId);
    setExamDate(dateOnly(e.examDate)); setStartTime(e.startTime ?? ""); setEndTime(e.endTime ?? ""); setError(""); setDialog(true);
  };
  const save = async () => {
    if (!formExamId || !formClassId || !subjectId) return setError("Select an exam, class, and subject.");
    if (!validDate(examDate)) return setError("Enter the exam date as YYYY-MM-DD.");
    if (!validTime(startTime) || !validTime(endTime)) return setError("Times must use 24-hour HH:mm format.");
    if (startTime && endTime && startTime >= endTime) return setError("End time must be later than start time.");
    const payload: ExamTimetablePayload = {
      examId: formExamId, classId: formClassId, subjectId,
      examDate: new Date(`${examDate}T12:00:00`).toISOString(),
      startTime: startTime || null, endTime: endTime || null,
    };
    setSaving(true); setError("");
    try {
      if (editing) { await principalExamTimetableServices.updateEntry(editing.id, payload); setNotice("Timetable entry updated."); }
      else { await principalExamTimetableServices.createEntry(payload); setNotice("Timetable entry created."); }
      setDialog(false); await loadEntries();
    } catch (e: any) { setError(e?.response?.data?.message ?? e?.message ?? "Unable to save timetable entry."); }
    finally { setSaving(false); }
  };
  
const remove = async (entry: ExamTimetableEntry) => {
  const confirmed = await confirm({
    title: "Delete timetable entry?",
    message: `Remove ${
      entry.subject?.name ?? "this subject"
    } on ${dateOnly(entry.examDate)}?`,
    confirmText: "Delete",
    cancelText: "Cancel",
    destructive: true,
  });

  if (!confirmed) return;

  try {
    await principalExamTimetableServices.deleteEntry(entry.id);

    setNotice("Timetable entry deleted.");

    await loadEntries();
  } catch (e: any) {
    setError(
      e?.response?.data?.message ??
        e?.message ??
        "Unable to delete entry."
    );
  }
};


  const renderEntry = ({ item }: { item: ExamTimetableEntry }) => (
    <Card mode="outlined" style={styles.card}><Card.Content>
      <View style={styles.row}>
        <View style={styles.flex}>
          <Text variant="titleMedium">{item.subject?.name ?? "Subject"}</Text>
          <Text variant="bodySmall" style={styles.muted}>{item.exam?.name} · {item.class?.displayName}</Text>
        </View>
        <IconButton icon="pencil-outline" onPress={() => openEdit(item)} />
        <IconButton icon="delete-outline" onPress={() => remove(item)} />
      </View>
      <Divider style={styles.divider} />
      <Text>📅 {dateOnly(item.examDate)}</Text>
      <Text>🕒 {item.startTime && item.endTime ? `${item.startTime} – ${item.endTime}` : item.startTime || item.endTime || "Time not set"}</Text>
    </Card.Content></Card>
  );

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" /><Text>Loading exam timetable…</Text></View>;

  return <View style={styles.container}>
    <View style={styles.header}><View style={styles.flex}><Text variant="headlineSmall">Exam Timetable</Text><Text style={styles.muted}>{yearName}</Text></View><Button mode="contained" icon="plus" onPress={openCreate} disabled={!exams.length || !classes.length}>Schedule</Button></View>
    <Menu visible={examMenu} onDismiss={() => setExamMenu(false)} anchor={<Button mode="outlined" style={styles.selector} onPress={() => setExamMenu(true)}>{exams.find(e => e.id === examId)?.name ?? "Select exam"}</Button>}>
      {exams.map(e => <Menu.Item key={e.id} title={`${e.name} · Term ${e.termNumber}`} onPress={() => { setExamId(e.id); setExamMenu(false); }} />)}
    </Menu>
    <Menu visible={classMenu} onDismiss={() => setClassMenu(false)} anchor={<Button mode="outlined" style={styles.selector} onPress={() => setClassMenu(true)}>{classes.find(c => c.id === classId)?.displayName ?? "Select class"}</Button>}>
      {classes.map(c => <Menu.Item key={c.id} title={c.displayName} onPress={() => { setClassId(c.id); setClassMenu(false); }} />)}
    </Menu>
    <TextInput mode="outlined" label="Search timetable" value={search} onChangeText={setSearch} left={<TextInput.Icon icon="magnify" />} style={styles.search} />
    {!!error && !dialog && <HelperText type="error" visible>{error}</HelperText>}
    <FlatList data={visibleEntries} keyExtractor={e => e.id} renderItem={renderEntry} onRefresh={() => { void loadEntries(); }} refreshing={false}
      contentContainerStyle={visibleEntries.length ? styles.list : styles.empty}
      ListEmptyComponent={<View style={styles.center}><Text variant="titleMedium">No timetable entries</Text><Text style={styles.muted}>Schedule subjects for the selected exam and class.</Text></View>} />
    <Portal><Dialog visible={dialog} onDismiss={() => !saving && setDialog(false)} style={styles.dialog}>
      <Dialog.Title>{editing ? "Edit timetable entry" : "Schedule exam subject"}</Dialog.Title>
      <Dialog.ScrollArea style={styles.scroll}><ScrollView keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Exam</Text><ScrollView horizontal contentContainerStyle={styles.chips}>{exams.map(e => <Button key={e.id} compact mode={formExamId === e.id ? "contained" : "outlined"} onPress={() => setFormExamId(e.id)}>{e.name}</Button>)}</ScrollView>
        <Text style={styles.label}>Class</Text><ScrollView horizontal contentContainerStyle={styles.chips}>{classes.map(c => <Button key={c.id} compact mode={formClassId === c.id ? "contained" : "outlined"} onPress={() => { setFormClassId(c.id); setSubjectId(""); }}>{c.displayName}</Button>)}</ScrollView>
        <Text style={styles.label}>Subject</Text><ScrollView horizontal contentContainerStyle={styles.chips}>{formSubjects.map(s => <Button key={s.id} compact mode={subjectId === s.id ? "contained" : "outlined"} onPress={() => setSubjectId(s.id)}>{s.name}</Button>)}</ScrollView>
        {!formSubjects.length && <HelperText type="info">No subjects found for this class. Add subjects first.</HelperText>}
        <TextInput mode="outlined" label="Exam date (YYYY-MM-DD)" value={examDate} onChangeText={setExamDate} placeholder="2026-11-05" style={styles.field} />
        <TextInput mode="outlined" label="Start time (HH:mm, optional)" value={startTime} onChangeText={setStartTime} placeholder="09:00" style={styles.field} />
        <TextInput mode="outlined" label="End time (HH:mm, optional)" value={endTime} onChangeText={setEndTime} placeholder="12:00" style={styles.field} />
      </ScrollView></Dialog.ScrollArea>
      {!!error && <HelperText type="error" visible>{error}</HelperText>}
      <Dialog.Actions><Button onPress={() => { setDialog(false); setError(""); }} disabled={saving}>Cancel</Button><Button mode="contained" onPress={() => { void save(); }} loading={saving} disabled={saving}>Save</Button></Dialog.Actions>
    </Dialog></Portal>
    <Snackbar visible={!!notice} onDismiss={() => setNotice("")}>{notice}</Snackbar>
  </View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 }, header: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
  flex: { flex: 1 }, muted: { opacity: 0.7, marginTop: 3 }, selector: { marginBottom: 8, alignSelf: "stretch" },
  search: { marginBottom: 8 }, card: { marginBottom: 10 }, row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  divider: { marginVertical: 10 }, list: { paddingBottom: 24 }, empty: { flexGrow: 1, justifyContent: "center" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24, gap: 8 }, dialog: { maxHeight: "92%" },
  scroll: { paddingHorizontal: 0 }, label: { marginHorizontal: 16, marginTop: 12, marginBottom: 8 }, chips: { paddingHorizontal: 16, gap: 8, paddingBottom: 8 },
  field: { marginHorizontal: 16, marginTop: 10 },
});
