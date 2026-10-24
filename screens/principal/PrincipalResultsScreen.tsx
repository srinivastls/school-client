import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, View } from "react-native";
import { ActivityIndicator, Button, Card, Chip, Divider, Menu, Text, useTheme } from "react-native-paper";
import { useConfirm } from "../../components/ConfirmProvider";
import { principalResultsServices, PrincipalResultsExam } from "../../services/principalResultsServices";
import { useRoute } from "@react-navigation/native";
type ResultStudent = { id: string; name: string; admissionNo: string; rollNumber?: string | null; totalObtained: number; totalMax: number; percentage: number | null; result: string; subjects: Record<string, { marksObtained: number | null; isAbsent: boolean; isFinalized: boolean }> };
type ResultClass = { id: string; classNumber: string; displayName: string; subjects: Array<{ examSubjectId: string; subject: { id: string; name: string; code: string }; maxMarks: number; passingMarks: number }>; students: ResultStudent[] };

export default function PrincipalResultsScreen() {
  const route = useRoute<any>();
    const academicYearId: string | undefined = route.params?.academicYearId;
  const theme = useTheme();
  const { showAlert, confirm } = useConfirm();
  const [exams, setExams] = useState<PrincipalResultsExam[]>([]);
  const [selectedExamId, setSelectedExamId] = useState("");
  const [examMenuVisible, setExamMenuVisible] = useState(false);
  const [classFilterId, setClassFilterId] = useState("ALL");
  const [classMenuVisible, setClassMenuVisible] = useState(false);
  const [report, setReport] = useState<{ exam: any; classes: ResultClass[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const selectedExam = useMemo(() => exams.find((exam) => exam.id === selectedExamId), [exams, selectedExamId]);
  const classOptions = useMemo(() => report?.classes ?? [], [report]);
  const visibleClasses = useMemo(() => classFilterId === "ALL" ? classOptions : classOptions.filter((item) => item.id === classFilterId), [classOptions, classFilterId]);

  const loadExams = useCallback(async () => {
    if (!academicYearId) { setExams([]); setLoading(false); return; }
    const data = await principalResultsServices.getOptions(academicYearId);
    setExams(data);
    setSelectedExamId((current) => data.some((item) => item.id === current) ? current : data[0]?.id ?? "");
  }, [academicYearId]);

  const loadReport = useCallback(async () => {
    if (!academicYearId || !selectedExamId) { setReport(null); return; }
    const data = await principalResultsServices.getExamResults(academicYearId, selectedExamId);
    setReport(data);
    setClassFilterId("ALL");
  }, [academicYearId, selectedExamId]);

  useEffect(() => {
    (async () => { try { setLoading(true); await loadExams(); } catch (error: any) { showAlert("Unable to load", error?.response?.data?.message || "Unable to load exams."); } finally { setLoading(false); } })();
  }, [loadExams, showAlert]);
  useEffect(() => { if (selectedExamId) loadReport().catch((error: any) => showAlert("Unable to load results", error?.response?.data?.message || "Unable to load the exam report.")); }, [selectedExamId, loadReport, showAlert]);

  const refresh = async () => { try { setRefreshing(true); await loadExams(); if (selectedExamId) await loadReport(); } catch (error: any) { showAlert("Refresh failed", error?.response?.data?.message || "Unable to refresh results."); } finally { setRefreshing(false); } };

  const togglePublish = async () => {
    if (!selectedExam || !academicYearId) return;
    const next = !selectedExam.isPublished;
    const ok = await confirm({ title: next ? "Publish results?" : "Unpublish results?", message: next ? "Parents linked to students in this exam will be able to view finalized marks." : "Parents will no longer be able to view this exam's results until republished.", confirmText: next ? "Publish" : "Unpublish", cancelText: "Cancel", destructive: !next });
    if (!ok) return;
    try { setPublishing(true); await principalResultsServices.setPublished(academicYearId, selectedExam.id, next); await loadExams(); await loadReport(); showAlert(next ? "Results published" : "Results unpublished", next ? "Finalized results are now visible to linked parent accounts." : "Results are hidden from parent accounts."); }
    catch (error: any) { showAlert("Publication failed", error?.response?.data?.message || "Unable to change result publication status."); }
    finally { setPublishing(false); }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" /><Text style={styles.loading}>Loading result management...</Text></View>;

  return <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
    <FlatList
      data={visibleClasses}
      keyExtractor={(item) => item.id}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
      contentContainerStyle={styles.content}
      ListHeaderComponent={<>
        <Text variant="headlineSmall" style={styles.title}>Result Management</Text>
        <Text variant="bodyMedium" style={styles.subTitle}>Review finalized marks and control parent visibility.</Text>
        <Card style={styles.card}><Card.Content>
          <Text variant="titleMedium" style={styles.label}>Exam</Text>
          <Menu visible={examMenuVisible} onDismiss={() => setExamMenuVisible(false)} anchor={<Button mode="outlined" icon="clipboard-text" onPress={() => setExamMenuVisible(true)} disabled={!exams.length}>{selectedExam?.name ?? "No exams found"}</Button>}>
            {exams.map((exam) => <Menu.Item key={exam.id} title={`${exam.name} · Term ${exam.termNumber}`} onPress={() => { setSelectedExamId(exam.id); setExamMenuVisible(false); }} />)}
          </Menu>
          {selectedExam && <>
            <View style={styles.statusRow}><Chip icon={selectedExam.isPublished ? "eye-check" : "eye-off"}>{selectedExam.isPublished ? "Published to parents" : "Hidden from parents"}</Chip><Chip>{selectedExam.pendingMarksCount} draft marks</Chip></View>
            <Text variant="bodySmall" style={styles.meta}>{selectedExam.classCount} classes · {selectedExam.subjectAssignmentCount} class-subject assignments · {selectedExam.finalizedMarksCount}/{selectedExam.totalMarksRecords} mark records finalized</Text>
            <Button mode={selectedExam.isPublished ? "outlined" : "contained"} icon={selectedExam.isPublished ? "eye-off" : "publish"} loading={publishing} disabled={publishing} onPress={togglePublish} style={styles.publishButton}>{selectedExam.isPublished ? "Unpublish Results" : "Publish Results to Parents"}</Button>
          </>}
        </Card.Content></Card>
        {report && <Card style={styles.card}><Card.Content>
          <Text variant="titleMedium" style={styles.label}>Class filter</Text>
          <Menu visible={classMenuVisible} onDismiss={() => setClassMenuVisible(false)} anchor={<Button mode="outlined" icon="filter-variant" onPress={() => setClassMenuVisible(true)}>{classFilterId === "ALL" ? "All classes" : classOptions.find((item) => item.id === classFilterId)?.displayName ?? "Select class"}</Button>}>
            <Menu.Item title="All classes" onPress={() => { setClassFilterId("ALL"); setClassMenuVisible(false); }} />
            {classOptions.map((item) => <Menu.Item key={item.id} title={item.displayName || `Class ${item.classNumber}`} onPress={() => { setClassFilterId(item.id); setClassMenuVisible(false); }} />)}
          </Menu>
        </Card.Content></Card>}
        {!exams.length && <Card style={styles.card}><Card.Content><Text>No exams found for this academic year.</Text></Card.Content></Card>}
      </>}
      renderItem={({ item }) => <Card style={styles.card}><Card.Content>
        <Text variant="titleLarge" style={styles.classTitle}>{item.displayName || `Class ${item.classNumber}`}</Text>
        <Text variant="bodySmall" style={styles.meta}>{item.students.length} students · {item.subjects.length} subjects assigned</Text>
        <Divider style={styles.divider} />
        {item.students.map((student) => <View key={student.id} style={styles.studentRow}>
          <View style={styles.studentInfo}><Text variant="titleSmall">{student.name}</Text><Text variant="bodySmall" style={styles.meta}>{student.admissionNo}{student.rollNumber ? ` · Roll ${student.rollNumber}` : ""}</Text></View>
          <View style={styles.studentScore}><Text variant="titleSmall">{student.percentage == null ? "Pending" : `${student.percentage}%`}</Text><Text variant="bodySmall">{student.totalObtained} / {student.totalMax}</Text><Chip compact>{student.result}</Chip></View>
        </View>)}
        {!item.students.length && <Text style={styles.meta}>No marks have been entered for this class yet.</Text>}
      </Card.Content></Card>}
      ListEmptyComponent={selectedExam ? <Text style={styles.empty}>No class results available for this exam.</Text> : null}
    />
  </View>;
}

const styles = StyleSheet.create({ container: { flex: 1 }, content: { padding: 16, paddingBottom: 32 }, center: { flex: 1, justifyContent: "center", alignItems: "center" }, loading: { marginTop: 10 }, title: { fontWeight: "700" }, subTitle: { marginTop: 4, marginBottom: 14, opacity: 0.72 }, card: { marginBottom: 12, borderRadius: 14 }, label: { fontWeight: "700", marginBottom: 8 }, statusRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 14 }, meta: { marginTop: 6, opacity: 0.72 }, publishButton: { marginTop: 14 }, classTitle: { fontWeight: "700" }, divider: { marginVertical: 10 }, studentRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10, paddingVertical: 10 }, studentInfo: { flex: 1 }, studentScore: { alignItems: "flex-end", gap: 4 }, empty: { textAlign: "center", paddingVertical: 24, opacity: 0.7 } });
