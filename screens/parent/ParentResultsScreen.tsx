import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, View } from "react-native";
import { ActivityIndicator, Avatar, Card, Chip, Divider, Menu, Button, Text, useTheme } from "react-native-paper";
import { useConfirm } from "../../components/ConfirmProvider";
import { parentResultsServices } from "../../services/parentResultsServices";

type Child = {
  id: string; name: string; admissionNo: string; rollNumber?: string | null; photoUrl?: string | null;
  class?: { displayName?: string; classNumber?: string }; section?: { sectionName?: string };
};
type SubjectResult = {
  examSubjectId: string; subject: { id: string; name: string; code: string }; maxMarks: number; passingMarks: number;
  marksObtained: number | null; isAbsent: boolean; isFinalized: boolean; status: string;
};
type ExamResult = {
  id: string; name: string; type: string; termNumber: number; startDate: string; endDate: string;
  subjects: SubjectResult[];
  summary: { totalObtained: number | null; totalMax: number; percentage: number | null; result: string };
};

export default function ParentResultsScreen() {
  const theme = useTheme();
  const { showAlert } = useConfirm();
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChildId, setSelectedChildId] = useState("");
  const [childMenuVisible, setChildMenuVisible] = useState(false);
  const [results, setResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedExamId, setSelectedExamId] = useState("");
  const [examMenuVisible, setExamMenuVisible] = useState(false);

  const selectedChild = useMemo(() => children.find((child) => child.id === selectedChildId), [children, selectedChildId]);
  const selectedExam = useMemo(() => results.find((exam) => exam.id === selectedExamId), [results, selectedExamId]);

  const loadChildren = useCallback(async () => {
    const data = await parentResultsServices.getChildren();
    setChildren(data);
    setSelectedChildId((current) => data.some((item: Child) => item.id === current) ? current : data[0]?.id ?? "");
  }, []);

  const loadResults = useCallback(async () => {
    if (!selectedChildId) { setResults([]); setSelectedExamId(""); return; }
    const data = await parentResultsServices.getStudentResults(selectedChildId);
    const nextResults: ExamResult[] = data?.results ?? [];
    setResults(nextResults);
    setSelectedExamId((current) => nextResults.some((item) => item.id === current) ? current : nextResults[0]?.id ?? "");
  }, [selectedChildId]);

  useEffect(() => {
    (async () => {
      try { setLoading(true); await loadChildren(); }
      catch (error: any) { showAlert("Unable to load", error?.response?.data?.message || "Unable to load linked students."); }
      finally { setLoading(false); }
    })();
  }, [loadChildren, showAlert]);

  useEffect(() => {
    if (!selectedChildId) return;
    loadResults().catch((error: any) => showAlert("Unable to load results", error?.response?.data?.message || "Unable to load published results."));
  }, [selectedChildId, loadResults, showAlert]);

  const onRefresh = async () => {
    try { setRefreshing(true); await loadChildren(); if (selectedChildId) await loadResults(); }
    catch (error: any) { showAlert("Refresh failed", error?.response?.data?.message || "Unable to refresh results."); }
    finally { setRefreshing(false); }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" /><Text style={styles.loading}>Loading results...</Text></View>;

  return <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
    <FlatList
      data={selectedExam?.subjects ?? []}
      keyExtractor={(item) => item.examSubjectId}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      contentContainerStyle={styles.content}
      ListHeaderComponent={<>
        <Text variant="headlineSmall" style={styles.title}>Academic Results</Text>
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 14 }}>Published exam marks for your linked child accounts.</Text>
        <Card style={styles.card}><Card.Content>
          <Text variant="titleMedium" style={styles.label}>Student</Text>
          <Menu visible={childMenuVisible} onDismiss={() => setChildMenuVisible(false)} anchor={<Button mode="outlined" icon="account-child" onPress={() => setChildMenuVisible(true)} disabled={!children.length}>{selectedChild ? `${selectedChild.name} · ${selectedChild.admissionNo}` : "No linked students"}</Button>}>
            {children.map((child) => <Menu.Item key={child.id} title={`${child.name} · ${child.admissionNo}`} onPress={() => { setSelectedChildId(child.id); setChildMenuVisible(false); }} />)}
          </Menu>
          {selectedChild && <Text variant="bodySmall" style={styles.meta}>{selectedChild.class?.displayName || `Class ${selectedChild.class?.classNumber ?? ""}`} {selectedChild.section?.sectionName ? `• ${selectedChild.section.sectionName}` : ""}{selectedChild.rollNumber ? ` • Roll ${selectedChild.rollNumber}` : ""}</Text>}
          <Divider style={styles.divider} />
          <Text variant="titleMedium" style={styles.label}>Published exam</Text>
          <Menu visible={examMenuVisible} onDismiss={() => setExamMenuVisible(false)} anchor={<Button mode="outlined" icon="clipboard-text" onPress={() => setExamMenuVisible(true)} disabled={!results.length}>{selectedExam ? selectedExam.name : "No published results"}</Button>}>
            {results.map((exam) => <Menu.Item key={exam.id} title={`${exam.name} · Term ${exam.termNumber}`} onPress={() => { setSelectedExamId(exam.id); setExamMenuVisible(false); }} />)}
          </Menu>
        </Card.Content></Card>
        {selectedExam && <Card style={styles.card}><Card.Content>
          <Text variant="titleLarge" style={styles.examTitle}>{selectedExam.name}</Text>
          <Text variant="bodySmall" style={styles.meta}>{selectedExam.type.replaceAll("_", " ")} · Term {selectedExam.termNumber}</Text>
          <View style={styles.summaryRow}>
            <View><Text variant="labelMedium">Total</Text><Text variant="titleMedium">{selectedExam.summary.totalObtained == null ? "Pending" : `${selectedExam.summary.totalObtained} / ${selectedExam.summary.totalMax}`}</Text></View>
            <View><Text variant="labelMedium">Percentage</Text><Text variant="titleMedium">{selectedExam.summary.percentage == null ? "—" : `${selectedExam.summary.percentage}%`}</Text></View>
            <Chip icon={selectedExam.summary.result === "PASS" ? "check-circle" : selectedExam.summary.result === "FAIL" ? "close-circle" : "clock-outline"}>{selectedExam.summary.result}</Chip>
          </View>
        </Card.Content></Card>}
        {!results.length && <Card style={styles.card}><Card.Content><Text variant="titleMedium">No published results yet</Text><Text variant="bodyMedium" style={styles.meta}>Your school has not published results for this student's class, or there are no results available yet.</Text></Card.Content></Card>}
        {selectedExam && <Text variant="titleMedium" style={styles.sectionTitle}>Subject-wise marks</Text>}
      </>}
      renderItem={({ item }) => <Card style={styles.subjectCard}><Card.Content>
        <View style={styles.subjectRow}><View style={styles.subjectInfo}><Text variant="titleMedium">{item.subject.name}</Text><Text variant="bodySmall" style={styles.meta}>{item.subject.code || "Subject"} · Pass mark {item.passingMarks}</Text></View>
        <View style={styles.score}><Text variant="titleMedium">{item.status === "NOT_AVAILABLE" ? "—" : item.isAbsent ? "AB" : `${item.marksObtained ?? "—"} / ${item.maxMarks}`}</Text><Chip compact>{item.status.replaceAll("_", " ")}</Chip></View></View>
      </Card.Content></Card>}
      ListEmptyComponent={selectedExam ? <Text style={styles.empty}>No subject marks available for this exam.</Text> : null}
    />
  </View>;
}

const styles = StyleSheet.create({
  container: { flex: 1 }, content: { padding: 16, paddingBottom: 32 }, center: { flex: 1, alignItems: "center", justifyContent: "center" }, loading: { marginTop: 10 },
  title: { fontWeight: "700", marginBottom: 4 }, card: { marginBottom: 12, borderRadius: 14 }, label: { fontWeight: "700", marginBottom: 8 }, meta: { marginTop: 6, opacity: 0.72 }, divider: { marginVertical: 14 },
  examTitle: { fontWeight: "700" }, summaryRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: 16 }, sectionTitle: { fontWeight: "700", marginVertical: 8 }, subjectCard: { marginBottom: 10, borderRadius: 12 }, subjectRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 }, subjectInfo: { flex: 1 }, score: { alignItems: "flex-end", gap: 6 }, empty: { textAlign: "center", paddingVertical: 24, opacity: 0.7 },
});
