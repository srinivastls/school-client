import React, { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { ActivityIndicator, Button, Card, Chip, Divider, Menu, ProgressBar, Text, useTheme } from "react-native-paper";
import { useConfirm } from "../../components/ConfirmProvider";
import analyticsServices, { AnalyticsOptions, ReportCardAnalytics } from "../../services/principalReportCardAnalyticsServices";
import { useRoute } from "@react-navigation/native";

export default function PrincipalReportCardAnalyticsScreen() {
  const route = useRoute<any>();
  const academicYearId = route.params?.academicYearId;
  const theme = useTheme();
  const { showAlert } = useConfirm();
  const [options, setOptions] = useState<AnalyticsOptions | null>(null);
  const [analytics, setAnalytics] = useState<ReportCardAnalytics | null>(null);
  const [examId, setExamId] = useState("");
  const [classId, setClassId] = useState("");
  const [examMenu, setExamMenu] = useState(false);
  const [classMenu, setClassMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadOptions = useCallback(async () => {
    try {
      const data = await analyticsServices.getOptions(academicYearId);
      setOptions(data);
      setExamId(old => data.exams.some(e => e.id === old) ? old : data.exams[0]?.id ?? "");
      setClassId(old => data.classes.some(c => c.id === old) ? old : data.classes[0]?.id ?? "");
    } catch (e: any) {
      showAlert("Unable to load analytics", e?.response?.data?.message ?? "Could not load exam and class options.");
    }
  }, [academicYearId, showAlert]);

  useEffect(() => { let active = true; setLoading(true); analyticsServices.getOptions(academicYearId).then(data => { if (!active) return; setOptions(data); setExamId(old => data.exams.some(e => e.id === old) ? old : data.exams[0]?.id ?? ""); setClassId(old => data.classes.some(c => c.id === old) ? old : data.classes[0]?.id ?? ""); }).catch((e: any) => { if (active) showAlert("Unable to load analytics", e?.response?.data?.message ?? "Could not load exam and class options."); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, [academicYearId]);

  const selectedExam = useMemo(() => options?.exams.find(e => e.id === examId), [options, examId]);
  const availableClasses = useMemo(() => { const ids = new Set(selectedExam?.examSubjects.map(s => s.classId) ?? []); return (options?.classes ?? []).filter(c => ids.has(c.id)); }, [options, selectedExam]);
  useEffect(() => { if (availableClasses.length && !availableClasses.some(c => c.id === classId)) setClassId(availableClasses[0].id); else if (!availableClasses.length) setClassId(""); }, [examId, availableClasses]);

  const loadAnalytics = useCallback(async () => {
    if (!academicYearId || !examId || !classId) { setAnalytics(null); return; }
    try { setAnalytics(await analyticsServices.getAnalytics(academicYearId, examId, classId)); }
    catch (e: any) { setAnalytics(null); showAlert("Unable to load analytics", e?.response?.data?.message ?? "Could not load performance analytics."); }
  }, [academicYearId, examId, classId, showAlert]);
  useEffect(() => { void loadAnalytics(); }, [loadAnalytics]);
  const onRefresh = async () => { setRefreshing(true); try { await loadOptions(); await loadAnalytics(); } finally { setRefreshing(false); } };
  const metric = (label: string, value: string | number, hint?: string) => <View style={styles.metric} key={label}><Text variant="bodySmall" style={styles.muted}>{label}</Text><Text variant="headlineSmall" style={styles.metricValue}>{value}</Text>{hint ? <Text variant="bodySmall" style={styles.muted}>{hint}</Text> : null}</View>;

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" /><Text>Loading report-card analytics…</Text></View>;
  return <ScrollView style={[styles.root, { backgroundColor: theme.colors.background }]} contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
    <Text variant="headlineSmall" style={styles.title}>Report Card Analytics</Text>
    <Text variant="bodyMedium" style={styles.muted}>{options?.academicYear.name ?? "Selected academic year"}</Text>
    <Card style={styles.card}><Card.Content>
      <Text variant="titleMedium" style={styles.label}>Exam</Text>
      <Menu visible={examMenu} onDismiss={() => setExamMenu(false)} anchor={<Button mode="outlined" icon="clipboard-text" onPress={() => setExamMenu(true)}>{selectedExam?.name ?? "Select exam"}</Button>}>{(options?.exams ?? []).map(e => <Menu.Item key={e.id} title={`${e.name} · Term ${e.termNumber}`} onPress={() => { setExamId(e.id); setExamMenu(false); }} />)}</Menu>
      <Text variant="titleMedium" style={styles.label}>Class</Text>
      <Menu visible={classMenu} onDismiss={() => setClassMenu(false)} anchor={<Button mode="outlined" icon="school" disabled={!availableClasses.length} onPress={() => setClassMenu(true)}>{options?.classes.find(c => c.id === classId)?.displayName ?? "Select class"}</Button>}>{availableClasses.map(c => <Menu.Item key={c.id} title={c.displayName || `Class ${c.classNumber}`} onPress={() => { setClassId(c.id); setClassMenu(false); }} />)}</Menu>
      <Text variant="bodySmall" style={styles.muted}>Analytics are calculated from the selected exam's marks. Pending or unfinalized marks are excluded from completed-result metrics.</Text>
    </Card.Content></Card>
    {!analytics ? <Card style={styles.card}><Card.Content><Text>No analytics available. Choose an exam and class with configured exam subjects.</Text></Card.Content></Card> : <>
      <View style={styles.metricsGrid}>
        {metric("Active students", analytics.summary.activeStudents)}
        {metric("Completed", analytics.summary.completed, `${analytics.summary.pending} pending`)}
        {metric("Pass percentage", analytics.summary.passPercentage === null ? "—" : `${analytics.summary.passPercentage}%`)}
        {metric("Class average", analytics.summary.averagePercentage === null ? "—" : `${analytics.summary.averagePercentage}%`)}
      </View>
      <Card style={styles.card}><Card.Content>
        <Text variant="titleLarge" style={styles.sectionTitle}>Overall result</Text>
        <View style={styles.resultRow}><Chip icon="check-circle">Passed: {analytics.summary.passed}</Chip><Chip icon="close-circle">Failed: {analytics.summary.failed}</Chip><Chip icon="clock-outline">Pending: {analytics.summary.pending}</Chip></View>
        <Text variant="bodySmall" style={styles.muted}>Pass rate among completed report cards</Text><ProgressBar progress={analytics.summary.passPercentage === null ? 0 : analytics.summary.passPercentage / 100} style={styles.progress} />
      </Card.Content></Card>
      <Card style={styles.card}><Card.Content>
        <Text variant="titleLarge" style={styles.sectionTitle}>Grade distribution</Text>
        {analytics.gradeDistribution.map(item => <View key={item.grade} style={styles.gradeRow}><Text style={styles.gradeLabel}>{item.grade}</Text><View style={styles.gradeBarWrap}><ProgressBar progress={analytics.summary.completed ? item.count / analytics.summary.completed : 0} style={styles.gradeBar} /><Text variant="bodySmall" style={styles.muted}>{item.count}</Text></View></View>)}
        <Text variant="bodySmall" style={styles.muted}>Uses the module's current default grade thresholds. School-configurable grading scales are not part of the current schema.</Text>
      </Card.Content></Card>
      <Card style={styles.card}><Card.Content>
        <Text variant="titleLarge" style={styles.sectionTitle}>Subject performance</Text>
        {analytics.subjectAnalytics.map((s, index) => <View key={s.subject.id} style={styles.subjectBlock}><View style={styles.subjectHead}><View style={{ flex: 1 }}><Text variant="titleMedium">{s.subject.name}</Text><Text variant="bodySmall" style={styles.muted}>{s.subject.code} · Max {s.maxMarks} · Pass mark {s.passingMarks}</Text></View><Chip>{s.passPercentage === null ? "No data" : `${s.passPercentage}% pass`}</Chip></View><View style={styles.subjectStats}><Text variant="bodySmall">Average: {s.averageMarks === null ? "—" : `${s.averageMarks}/${s.maxMarks}`}</Text><Text variant="bodySmall">High: {s.highestMarks ?? "—"}</Text><Text variant="bodySmall">Low: {s.lowestMarks ?? "—"}</Text></View><ProgressBar progress={s.averagePercentage === null ? 0 : Math.max(0, Math.min(1, s.averagePercentage / 100))} style={styles.progress} /><Text variant="bodySmall" style={styles.muted}>Finalized: {s.studentsWithFinalizedMarks} · Passed: {s.passCount} · Failed: {s.failCount}</Text>{index < analytics.subjectAnalytics.length - 1 ? <Divider style={{ marginTop: 14 }} /> : null}</View>)}
      </Card.Content></Card>
      <Card style={styles.card}><Card.Content>
        <Text variant="titleLarge" style={styles.sectionTitle}>Top performers</Text>
        {analytics.topStudents.length ? analytics.topStudents.map(s => <View key={s.studentId} style={styles.topRow}><Chip>{`#${s.rank}`}</Chip><View style={{ flex: 1 }}><Text variant="titleSmall">{s.studentName}</Text><Text variant="bodySmall" style={styles.muted}>Total: {s.totalObtained}/{s.totalMax}</Text></View><Text variant="titleMedium">{s.percentage}%</Text></View>) : <Text style={styles.muted}>No completed report cards to rank yet.</Text>}
        <Text variant="bodySmall" style={styles.muted}>Rankings include only students with complete finalized marks for the selected exam.</Text>
      </Card.Content></Card>
    </>}
  </ScrollView>;
}
const styles = StyleSheet.create({ root: { flex: 1 }, content: { padding: 14, paddingBottom: 36 }, center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 }, title: { fontWeight: "700" }, muted: { opacity: 0.7, marginTop: 4 }, card: { marginTop: 12, borderRadius: 14 }, label: { fontWeight: "600", marginTop: 8, marginBottom: 6 }, sectionTitle: { fontWeight: "700", marginBottom: 12 }, metricsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 12 }, metric: { width: "48%", flexGrow: 1, minWidth: 140, padding: 14, borderRadius: 12, backgroundColor: "rgba(127,127,127,0.10)" }, metricValue: { fontWeight: "700", marginTop: 4 }, resultRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 }, progress: { height: 8, borderRadius: 8, marginVertical: 10 }, gradeRow: { flexDirection: "row", alignItems: "center", marginVertical: 7 }, gradeLabel: { width: 36, fontWeight: "700" }, gradeBarWrap: { flex: 1, flexDirection: "row", alignItems: "center", gap: 12 }, gradeBar: { flex: 1, height: 10, borderRadius: 8 }, subjectBlock: { paddingVertical: 8 }, subjectHead: { flexDirection: "row", alignItems: "center", gap: 8 }, subjectStats: { flexDirection: "row", justifyContent: "space-between", flexWrap: "wrap", marginTop: 8 }, topRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10 } });
