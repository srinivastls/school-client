import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import * as XLSX from "xlsx";

type AnyRecord = Record<string, any>;
type ExportFormat = "pdf" | "csv" | "excel";

const safe = (value: unknown) => String(value ?? "").replace(/[&<>\"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));
const csvCell = (value: unknown) => `"${String(value ?? "").replace(/"/g, '""')}"`;

function buildRows(data: AnyRecord, classLabel: string) {
  const summary = [["Class", classLabel], ["Exam", "Term", "Class Average (%)", "Completed Students", "Total Students"]];
  (data.examTrends ?? []).forEach((e: AnyRecord) => summary.push([e.examName, `Term ${e.termNumber}`, e.classAverage ?? "Pending", e.completedStudents, e.totalStudents] as any));
  const subjects = [["Exam", "Subject", "Average (%)", "Finalized Students"]];
  (data.examTrends ?? []).forEach((e: AnyRecord) => (e.subjectAverages ?? []).forEach((s: AnyRecord) => subjects.push([e.examName, s.subjectName, s.averagePercentage ?? "Pending", s.finalizedCount] as any)));
  const students = [["Exam", "Student", "Status", "Marks Obtained", "Maximum Marks", "Percentage"]];
  (data.examTrends ?? []).forEach((e: AnyRecord) => (e.students ?? []).forEach((s: AnyRecord) => students.push([e.examName, s.studentName, s.result, s.totalObtained ?? "", s.totalMax, s.percentage ?? ""] as any)));
  const studentResults = [["Exam", "Student", "Subject", "Obtained", "Maximum", "Passing Marks", "Status"]];
  (data.examTrends ?? []).forEach((e: AnyRecord) => (e.students ?? []).forEach((s: AnyRecord) => (s.subjectRows ?? []).forEach((r: AnyRecord) => studentResults.push([e.examName, s.studentName, r.subjectName, r.isAbsent ? "AB" : r.obtained ?? "Pending", r.maxMarks, r.passingMarks, !r.complete ? "PENDING" : r.isAbsent ? "ABSENT" : (r.obtained ?? 0) >= r.passingMarks ? "PASS" : "FAIL"] as any))));
  return { summary, subjects, students, studentResults };
}

export async function exportPerformanceTrends(format: ExportFormat, data: AnyRecord, classLabel: string) {
  if (!data) throw new Error("Load performance trends before exporting.");
  const sheets = buildRows(data, classLabel || "Selected class");
  const fileBase = `performance_trends_${new Date().toISOString().slice(0, 10)}`;
  if (format === "pdf") {
    const table = (title: string, rows: any[][]) => `<h2>${safe(title)}</h2><table><thead><tr>${rows[0].map((v: any) => `<th>${safe(v)}</th>`).join("")}</tr></thead><tbody>${rows.slice(1).map((row: any[]) => `<tr>${row.map(v => `<td>${safe(v)}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
    const html = `<!doctype html><html><head><meta charset="utf-8"/><style>body{font-family:Arial,sans-serif;color:#172033;padding:22px}h1{font-size:22px}h2{font-size:15px;margin-top:22px}p{color:#667085}table{width:100%;border-collapse:collapse;font-size:9px;margin-top:8px}th,td{border:1px solid #d0d5dd;padding:6px;text-align:left}th{background:#eef2f7}tr{page-break-inside:avoid}</style></head><body><h1>Student Performance Trends</h1><p>Class: ${safe(classLabel)} · Generated: ${safe(new Date().toLocaleString())}</p>${table("Exam Summary", sheets.summary.slice(1))}${table("Subject Averages", sheets.subjects)}${table("Student Results", sheets.students)}${table("Subject-wise Results", sheets.studentResults)}</body></html>`;
    const result = await Print.printToFileAsync({ html });
    if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(result.uri, { mimeType: "application/pdf", dialogTitle: "Share performance trends PDF" });
    return result.uri;
  }
  if (format === "csv") {
    const sections = ["EXAM SUMMARY", ...sheets.summary.map(r => r.map(csvCell).join(",")), "", "SUBJECT AVERAGES", ...sheets.subjects.map(r => r.map(csvCell).join(",")), "", "STUDENT RESULTS", ...sheets.students.map(r => r.map(csvCell).join(",")), "", "SUBJECT-WISE RESULTS", ...sheets.studentResults.map(r => r.map(csvCell).join(","))];
    const uri = `${FileSystem.cacheDirectory}${fileBase}.csv`;
    await FileSystem.writeAsStringAsync(uri, "\uFEFF" + sections.join("\r\n"), { encoding: FileSystem.EncodingType.UTF8 });
    if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri, { mimeType: "text/csv", dialogTitle: "Share performance trends CSV" });
    return uri;
  }
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(sheets.summary), "Exam Summary");
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(sheets.subjects), "Subject Averages");
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(sheets.students), "Student Results");
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(sheets.studentResults), "Subject Results");
  const base64 = XLSX.write(workbook, { type: "base64", bookType: "xlsx" });
  const uri = `${FileSystem.cacheDirectory}${fileBase}.xlsx`;
  await FileSystem.writeAsStringAsync(uri, base64, { encoding: FileSystem.EncodingType.Base64 });
  if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri, { mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", dialogTitle: "Share performance trends Excel workbook" });
  return uri;
}
