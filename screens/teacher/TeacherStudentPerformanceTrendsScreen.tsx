import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { teacherStudentPerformanceTrendServices } from "../../services/teacherStudentPerformanceTrendServices";
import { exportPerformanceTrends } from "../../services/performanceTrendExports";
import { useRoute } from "@react-navigation/native";
type AnyRecord = Record<string, any>;


export default function TeacherStudentPerformanceTrendsScreen() {
  const route = useRoute<any>();
  const academicYearId = route.params?.academicYearId;
  const [options, setOptions] = useState<AnyRecord>({ classes: [], exams: [] });
  const [classId, setClassId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [data, setData] = useState<AnyRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);

  const loadOptions = useCallback(async () => {
    if (!academicYearId) return;
    try {
      setError("");
      const result = await teacherStudentPerformanceTrendServices.getOptions(academicYearId);
      setOptions(result);
      setClassId((current: string) => result.classes.some((c: AnyRecord) => c.id === current) ? current : result.classes[0]?.id ?? "");
    } catch (e: any) { setError(e?.response?.data?.message ?? "Could not load academic-year options."); }
  }, [academicYearId]);

  const loadTrends = useCallback(async () => {
    if (!academicYearId || !classId) { setData(null); return; }
    setLoading(true); setError("");
    try {
      const result = await teacherStudentPerformanceTrendServices.getTrends({ academicYearId, classId, ...(studentId ? { studentId } : {}) });
      setData(result);
    } catch (e: any) { setData(null); setError(e?.response?.data?.message ?? "Could not load performance trends."); }
    finally { setLoading(false); }
  }, [academicYearId, classId, studentId]);

  useEffect(() => { loadOptions(); }, [loadOptions]);
  useEffect(() => { setStudentId(""); }, [classId]);
  useEffect(() => { loadTrends(); }, [loadTrends]);

  const maxAvg = useMemo(() => Math.max(100, ...(data?.examTrends ?? []).map((e: AnyRecord) => e.classAverage ?? 0)), [data]);
  const chosenClass = options.classes.find((c: AnyRecord) => c.id === classId);
  const doExport = async (format: "pdf" | "csv" | "excel") => {
    if (!data) return;
    setExporting(true);
    try { await exportPerformanceTrends(format, data, chosenClass?.displayName ?? chosenClass?.classNumber ?? "Selected class"); }
    catch (e: any) { setError(e?.message ?? "Could not export trends."); }
    finally { setExporting(false); }
  };

  return <ScrollView style={styles.page} contentContainerStyle={styles.content}>
    <Text style={styles.title}>My Class Performance Trends</Text>
    <Text style={styles.subtitle}>Review trends only for classes and sections assigned to you as class teacher.</Text>
    <View style={styles.panel}>
      <Text style={styles.label}>Class</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {options.classes.map((item: AnyRecord) => <Pressable key={item.id} onPress={() => setClassId(item.id)} style={[styles.chip, classId === item.id && styles.chipActive]}><Text style={[styles.chipText, classId === item.id && styles.chipTextActive]}>{item.displayName || item.classNumber}</Text></Pressable>)}
      </ScrollView>
      {!!data?.students?.length && <>
        <Text style={[styles.label, { marginTop: 16 }]}>Student (optional)</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          <Pressable onPress={() => setStudentId("")} style={[styles.chip, !studentId && styles.chipActive]}><Text style={[styles.chipText, !studentId && styles.chipTextActive]}>Whole class</Text></Pressable>
          {data.students.map((item: AnyRecord) => <Pressable key={item.id} onPress={() => setStudentId(item.id)} style={[styles.chip, studentId === item.id && styles.chipActive]}><Text style={[styles.chipText, studentId === item.id && styles.chipTextActive]}>{item.name}</Text></Pressable>)}
        </ScrollView>
      </>}
      <Pressable style={styles.refresh} onPress={loadTrends}><Text style={styles.refreshText}>Refresh trends</Text></Pressable>
      <Text style={[styles.label, { marginTop: 14 }]}>Export analytics</Text>
      <View style={styles.exportRow}>
        {([ ["pdf", "Export PDF"], ["csv", "Export CSV"], ["excel", "Export Excel"] ] as const).map(([format, label]) => <Pressable key={format} disabled={exporting || !data} onPress={() => doExport(format)} style={[styles.exportButton, (exporting || !data) && { opacity: 0.5 }]}><Text style={styles.exportText}>{exporting ? "Preparing…" : label}</Text></Pressable>)}
      </View>
    </View>
    {!!error && <Text style={styles.error}>{error}</Text>}
    {loading ? <ActivityIndicator size="large" style={{ marginTop: 30 }} /> : !data ? <Text style={styles.empty}>Select a class to view trends.</Text> : <>
      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}><Text style={styles.summaryValue}>{data.examTrends.length}</Text><Text style={styles.summaryLabel}>Published exams</Text></View>
        <View style={styles.summaryCard}><Text style={styles.summaryValue}>{data.studentCount}</Text><Text style={styles.summaryLabel}>Active students</Text></View>
      </View>
      <View style={styles.panel}>
        <Text style={styles.sectionTitle}>{studentId ? `${data.student?.name ?? "Student"}: exam trend` : `${chosenClass?.displayName ?? "Class"}: average trend`}</Text>
        {(studentId ? (data.studentTrend ?? []).map((p: AnyRecord) => ({ ...p, value: p.percentage })) : data.examTrends.map((p: AnyRecord) => ({ ...p, value: p.classAverage }))).map((point: AnyRecord, index: number) => <View key={point.examId} style={styles.trendRow}>
          <View style={styles.trendHeading}><Text style={styles.examName}>{point.examName}</Text><Text style={styles.percent}>{point.value === null || point.value === undefined ? "Pending" : `${point.value}%`}</Text></View>
          <View style={styles.track}><View style={[styles.fill, { width: `${Math.max(0, Math.min(100, point.value ?? 0))}%` }]} /></View>
          <Text style={styles.muted}>Term {point.termNumber}{point.result ? ` · ${point.result}` : ""}</Text>
        </View>)}
        {!data.examTrends.length && <Text style={styles.empty}>No published exams with subjects were found for this class.</Text>}
      </View>
      {!studentId && <View style={styles.panel}>
        <Text style={styles.sectionTitle}>Subject averages across exams</Text>
        {data.subjectTrends.map((subject: AnyRecord) => <View key={subject.subjectId} style={styles.subjectBlock}>
          <Text style={styles.subjectName}>{subject.subjectName}</Text>
          {subject.points.map((p: AnyRecord, i: number) => <View key={`${subject.subjectId}-${i}`} style={styles.subjectPoint}><Text style={styles.muted} numberOfLines={1}>{p.examName}</Text><Text style={styles.percent}>{p.percentage === null ? "—" : `${p.percentage}%`}</Text></View>)}
        </View>)}
        {!data.subjectTrends.length && <Text style={styles.empty}>No subject data available.</Text>}
      </View>}
      {studentId && <View style={styles.panel}>
        <Text style={styles.sectionTitle}>Subject-wise results by exam</Text>
        {(data.studentTrend ?? []).map((exam: AnyRecord) => <View key={exam.examId} style={styles.subjectBlock}><Text style={styles.examName}>{exam.examName}</Text>{exam.subjects.map((subject: AnyRecord) => <View key={subject.subjectId} style={styles.subjectPoint}><Text style={styles.muted}>{subject.subjectName}</Text><Text style={styles.percent}>{!subject.complete ? "Pending" : subject.isAbsent ? "AB" : `${subject.obtained}/${subject.maxMarks}`}</Text></View>)}</View>)}
      </View>}
    </>}
    <Text style={styles.footnote}>Only published exams are included. Student percentages appear only when all configured subjects have finalized marks. Grade thresholds are not applied in this trends view.</Text>
  </ScrollView>;
}

const styles = StyleSheet.create({ page: { flex: 1, backgroundColor: "#F4F6FA" }, content: { padding: 16, paddingBottom: 32 }, title: { fontSize: 24, fontWeight: "800", color: "#172033" }, subtitle: { fontSize: 13, color: "#647084", marginTop: 6, marginBottom: 16 }, panel: { backgroundColor: "#FFFFFF", borderRadius: 14, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: "#E5E9F0" }, label: { fontSize: 13, fontWeight: "700", color: "#465166", marginBottom: 8 }, chips: { gap: 8, paddingVertical: 2 }, chip: { borderRadius: 20, borderWidth: 1, borderColor: "#D9DFE9", paddingVertical: 8, paddingHorizontal: 13, backgroundColor: "#FFFFFF" }, chipActive: { backgroundColor: "#1F4E8C", borderColor: "#1F4E8C" }, chipText: { color: "#344054", fontSize: 12, fontWeight: "600" }, chipTextActive: { color: "#FFFFFF" }, refresh: { alignSelf: "flex-start", marginTop: 14, backgroundColor: "#EAF1FB", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 9 }, refreshText: { color: "#1F4E8C", fontWeight: "700", fontSize: 12 }, exportRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 }, exportButton: { borderRadius: 8, paddingHorizontal: 11, paddingVertical: 10, backgroundColor: "#E8F5EE", borderWidth: 1, borderColor: "#B7E0C8" }, exportText: { color: "#17663A", fontWeight: "800", fontSize: 12 }, error: { color: "#B42318", padding: 12, backgroundColor: "#FEE4E2", borderRadius: 8, marginBottom: 12 }, empty: { color: "#667085", textAlign: "center", padding: 20 }, summaryRow: { flexDirection: "row", gap: 12, marginBottom: 14 }, summaryCard: { flex: 1, backgroundColor: "#FFFFFF", borderRadius: 12, padding: 15, borderWidth: 1, borderColor: "#E5E9F0" }, summaryValue: { color: "#172033", fontSize: 24, fontWeight: "800" }, summaryLabel: { color: "#667085", fontSize: 12, marginTop: 4 }, sectionTitle: { fontSize: 16, fontWeight: "800", color: "#172033", marginBottom: 14 }, trendRow: { marginBottom: 18 }, trendHeading: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }, examName: { fontSize: 13, fontWeight: "700", color: "#344054", flex: 1 }, percent: { fontSize: 13, fontWeight: "800", color: "#1F4E8C", marginLeft: 8 }, track: { height: 9, borderRadius: 8, backgroundColor: "#E8ECF3", overflow: "hidden" }, fill: { height: 9, borderRadius: 8, backgroundColor: "#3478C8" }, muted: { color: "#7A8496", fontSize: 11, marginTop: 5 }, subjectBlock: { paddingVertical: 10, borderTopWidth: 1, borderTopColor: "#EEF0F4" }, subjectName: { fontSize: 14, color: "#172033", fontWeight: "800", marginBottom: 6 }, subjectPoint: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 4 }, footnote: { color: "#7A8496", fontSize: 11, lineHeight: 16, paddingHorizontal: 2, marginTop: 2 } });
