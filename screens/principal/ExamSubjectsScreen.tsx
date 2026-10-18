import React, { useCallback, useEffect, useMemo, useState } from "react";
import {  FlatList, ScrollView, StyleSheet, View } from "react-native";
import { ActivityIndicator, Button, Card, Dialog, Divider, HelperText, IconButton, Menu, Portal, Snackbar, Text, TextInput } from "react-native-paper";
import { ExamSubjectClassOption, ExamSubjectPayload, ExamSubjectRecord, ExamSubjectSubjectOption, principalExamSubjectServices } from "../../services/principalExamSubjectServices";
import { principalSubjectServices } from "../../services/principalSubjectServices";
import { useRoute } from "@react-navigation/native";
import {useConfirm} from "../../components/ConfirmProvider";

export default function ExamSubjectsScreen() {
  const route = useRoute<any>();
  const academicYearId: string | undefined = route.params?.academicYearId;
  const [exams, setExams] = useState<any[]>([]);
  const [yearName, setYearName] = useState("");
  const [classes, setClasses] = useState<ExamSubjectClassOption[]>([]);
  const [subjects, setSubjects] = useState<ExamSubjectSubjectOption[]>([]);
  const [rows, setRows] = useState<ExamSubjectRecord[]>([]);
  const [examId, setExamId] = useState("");
  const [classId, setClassId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialog, setDialog] = useState(false);
  const [examMenu, setExamMenu] = useState(false);
  const [classMenu, setClassMenu] = useState(false);
  const [formExamId, setFormExamId] = useState("");
  const [formClassId, setFormClassId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [maxMarks, setMaxMarks] = useState("100");
  const [passingMarks, setPassingMarks] = useState("35");
  const [weightage, setWeightage] = useState("");
  const [editing, setEditing] = useState<ExamSubjectRecord | null>(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const {showAlert,confirm} = useConfirm();

  const loadBase = useCallback(async () => {
    if (!academicYearId) { setLoading(false); setError("No academic year was provided."); return; }
    setLoading(true); setError("");
    try {
      const [opts, classOpts] = await Promise.all([
        principalExamSubjectServices.getOptions(academicYearId),
        principalSubjectServices.getClasses(academicYearId),
      ]);
      setYearName(opts.academicYear?.name ?? "");
      setExams(opts.exams ?? []);
      setClasses(classOpts as ExamSubjectClassOption[]);
      setExamId((old) => opts.exams.some((e: any) => e.id === old) ? old : (opts.exams[0]?.id ?? ""));
      setClassId((old) => classOpts.some((c: any) => c.id === old) ? old : (classOpts[0]?.id ?? ""));
    } catch (e: any) { setError(e?.response?.data?.message ?? e?.message ?? "Unable to load options."); }
    finally { setLoading(false); }
  }, [academicYearId]);

  const loadRows = useCallback(async () => {
    if (!academicYearId) return;
    try {
      const params: { academicYearId: string; examId?: string; classId?: string } = { academicYearId };
      if (examId) params.examId = examId;
      if (classId) params.classId = classId;
      const [assignments, subjectRows] = await Promise.all([
        principalExamSubjectServices.getExamSubjects(params),
        classId ? principalSubjectServices.getSubjects({ academicYearId, classId }) : principalSubjectServices.getSubjects({ academicYearId }),
      ]);
      setRows(assignments);
      setSubjects((subjectRows ?? []) as ExamSubjectSubjectOption[]);
    } catch (e: any) { setError(e?.response?.data?.message ?? e?.message ?? "Unable to load assignments."); }
  }, [academicYearId, examId, classId]);

  useEffect(() => { void loadBase(); }, [loadBase]);
  useEffect(() => { void loadRows(); }, [loadRows]);

  const visibleRows = useMemo(() => rows.filter((r) =>
    `${r.subject?.name ?? ""} ${r.subject?.code ?? ""} ${r.class?.displayName ?? ""} ${r.exam?.name ?? ""}`.toLowerCase().includes(search.toLowerCase().trim())
  ), [rows, search]);
  const formSubjects = subjects.filter((s) => s.classId === formClassId);

  const openCreate = () => {
    setEditing(null); setFormExamId(examId || exams[0]?.id || ""); setFormClassId(classId || classes[0]?.id || "");
    setSubjectId(""); setMaxMarks("100"); setPassingMarks("35"); setWeightage(""); setError(""); setDialog(true);
  };
  const openEdit = (r: ExamSubjectRecord) => {
    setEditing(r); setFormExamId(r.examId); setFormClassId(r.classId); setSubjectId(r.subjectId);
    setMaxMarks(String(r.maxMarks)); setPassingMarks(String(r.passingMarks)); setWeightage(r.weightage == null ? "" : String(r.weightage));
    setError(""); setDialog(true);
  };
  const save = async () => {
    const max = Number(maxMarks), passing = Number(passingMarks);
    const weight = weightage.trim() ? Number(weightage) : null;
    if (!formExamId || !formClassId || !subjectId) return setError("Select an exam, class, and subject.");
    if (!Number.isFinite(max) || max <= 0) return setError("Maximum marks must be greater than zero.");
    if (!Number.isFinite(passing) || passing < 0 || passing > max) return setError("Passing marks must be between zero and maximum marks.");
    if (weight !== null && (!Number.isFinite(weight) || weight < 0)) return setError("Weightage must be non-negative or blank.");
    const payload: ExamSubjectPayload = { examId: formExamId, classId: formClassId, subjectId, maxMarks: max, passingMarks: passing, weightage: weight };
    setSaving(true); setError("");
    try {
      if (editing) { await principalExamSubjectServices.updateExamSubject(editing.id, payload); setNotice("Assignment updated."); }
      else { await principalExamSubjectServices.createExamSubject(payload); setNotice("Subject assigned to exam."); }
      setDialog(false); await loadRows();
    } catch (e: any) { setError(e?.response?.data?.message ?? e?.message ?? "Unable to save assignment."); }
    finally { setSaving(false); }
  };
  
const remove = async (r: ExamSubjectRecord) => {
  const confirmed = await confirm({
    title: "Remove subject?",
    message: `Remove ${
      r.subject?.name ?? "this subject"
    } from ${
      r.exam?.name ?? "this exam"
    }?`,
    confirmText: "Remove",
    cancelText: "Cancel",
    destructive: true,
  });

  if (!confirmed) return;

  try {
    await principalExamSubjectServices.deleteExamSubject(r.id);

    setNotice("Assignment removed.");

    await loadRows();
  } catch (e: any) {
    setError(
      e?.response?.data?.message ??
        e?.message ??
        "Unable to remove assignment."
    );
  }
};


  const renderRow = ({ item }: { item: ExamSubjectRecord }) => (
    <Card mode="outlined" style={styles.card}><Card.Content>
      <View style={styles.row}>
        <View style={styles.flex}>
          <Text variant="titleMedium">{item.subject?.name ?? "Subject"}</Text>
          <Text variant="bodySmall" style={styles.muted}>{item.subject?.code ? `${item.subject.code} · ` : ""}{item.class?.displayName} · {item.exam?.name}</Text>
        </View>
        <IconButton icon="pencil-outline" onPress={() => openEdit(item)} />
        <IconButton icon="delete-outline" onPress={() => remove(item)} />
      </View>
      <Divider style={styles.divider} />
      <View style={styles.row}>
        <Text>Maximum: {item.maxMarks}</Text><Text>Passing: {item.passingMarks}</Text><Text>Weightage: {item.weightage ?? "—"}</Text>
      </View>
    </Card.Content></Card>
  );

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" /><Text>Loading exam subjects…</Text></View>;

  return <View style={styles.container}>
    <View style={styles.header}><View style={styles.flex}><Text variant="headlineSmall">Exam Subjects</Text><Text style={styles.muted}>{yearName}</Text></View><Button mode="contained" icon="plus" onPress={openCreate} disabled={!exams.length || !classes.length}>Assign</Button></View>
    <Menu visible={examMenu} onDismiss={() => setExamMenu(false)} anchor={<Button mode="outlined" style={styles.selector} onPress={() => setExamMenu(true)}>{exams.find(e => e.id === examId)?.name ?? "Select exam"}</Button>}>
      {exams.map(e => <Menu.Item key={e.id} title={`${e.name} · Term ${e.termNumber}`} onPress={() => { setExamId(e.id); setExamMenu(false); }} />)}
    </Menu>
    <Menu visible={classMenu} onDismiss={() => setClassMenu(false)} anchor={<Button mode="outlined" style={styles.selector} onPress={() => setClassMenu(true)}>{classes.find(c => c.id === classId)?.displayName ?? "Select class"}</Button>}>
      {classes.map(c => <Menu.Item key={c.id} title={c.displayName} onPress={() => { setClassId(c.id); setClassMenu(false); }} />)}
    </Menu>
    <TextInput mode="outlined" label="Search assignments" value={search} onChangeText={setSearch} left={<TextInput.Icon icon="magnify" />} style={styles.search} />
    {!!error && !dialog && <HelperText type="error" visible>{error}</HelperText>}
    <FlatList data={visibleRows} keyExtractor={r => r.id} renderItem={renderRow} onRefresh={() => { void loadRows(); }} refreshing={false}
      contentContainerStyle={visibleRows.length ? styles.list : styles.empty}
      ListEmptyComponent={<View style={styles.center}><Text variant="titleMedium">No assignments found</Text><Text style={styles.muted}>Choose an exam and class, then assign a subject.</Text></View>} />
    <Portal><Dialog visible={dialog} onDismiss={() => !saving && setDialog(false)} style={styles.dialog}>
      <Dialog.Title>{editing ? "Edit exam subject" : "Assign subject"}</Dialog.Title>
      <Dialog.ScrollArea style={styles.scroll}><ScrollView keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Exam</Text><ScrollView horizontal contentContainerStyle={styles.chips}>{exams.map(e => <Button key={e.id} compact mode={formExamId === e.id ? "contained" : "outlined"} onPress={() => setFormExamId(e.id)}>{e.name}</Button>)}</ScrollView>
        <Text style={styles.label}>Class</Text><ScrollView horizontal contentContainerStyle={styles.chips}>{classes.map(c => <Button key={c.id} compact mode={formClassId === c.id ? "contained" : "outlined"} onPress={() => { setFormClassId(c.id); setSubjectId(""); }}>{c.displayName}</Button>)}</ScrollView>
        <Text style={styles.label}>Subject</Text><ScrollView horizontal contentContainerStyle={styles.chips}>{formSubjects.map(s => <Button key={s.id} compact mode={subjectId === s.id ? "contained" : "outlined"} onPress={() => setSubjectId(s.id)}>{s.name}</Button>)}</ScrollView>
        {!formSubjects.length && <HelperText type="info">No subjects found for this class. Add subjects first.</HelperText>}
        <TextInput mode="outlined" label="Maximum marks" value={maxMarks} onChangeText={setMaxMarks} keyboardType="decimal-pad" style={styles.field} />
        <TextInput mode="outlined" label="Passing marks" value={passingMarks} onChangeText={setPassingMarks} keyboardType="decimal-pad" style={styles.field} />
        <TextInput mode="outlined" label="Weightage (optional)" value={weightage} onChangeText={setWeightage} keyboardType="decimal-pad" style={styles.field} />
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
