import React, { useCallback, useEffect, useMemo, useState } from "react";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Platform,RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { ActivityIndicator, Button, Card, Chip, Divider, Menu, Text, useTheme } from "react-native-paper";
import { useConfirm } from "../../components/ConfirmProvider";
import principalReportCardServices, { ReportCardOptions, ReportCardPreview } from "../../services/principalReportCardServices";
import { useRoute } from "@react-navigation/native";

export default function PrincipalReportCardsScreen() {
    const route = useRoute<any>();
    const academicYearId = route.params?.academicYearId;
 const theme = useTheme(); const { showAlert, confirm } = useConfirm();
 const [options,setOptions] = useState<ReportCardOptions|null>(null); const [preview,setPreview] = useState<ReportCardPreview|null>(null);
 const [examId,setExamId] = useState(""); const [classId,setClassId] = useState(""); const [examMenu,setExamMenu] = useState(false); const [classMenu,setClassMenu] = useState(false); const [loading,setLoading] = useState(true); const [busy,setBusy] = useState(false); const [refreshing,setRefreshing] = useState(false);
 const loadOptions = useCallback(async()=>{ try { setLoading(true); const data=await principalReportCardServices.getOptions(academicYearId); setOptions(data); setExamId(old=>data.exams.some(e=>e.id===old)?old:(data.exams[0]?.id??"")); setClassId(old=>data.classes.some(c=>c.id===old)?old:(data.classes[0]?.id??"")); } catch(e:any){ showAlert("Unable to load",e?.response?.data?.message??"Could not load report-card options."); } finally {setLoading(false);} },[academicYearId]);
 useEffect(()=>{ void loadOptions(); },[loadOptions]);
 const selectedExam=useMemo(()=>options?.exams.find(e=>e.id===examId),[options,examId]);
 const availableClasses=useMemo(()=>{const ids=new Set(selectedExam?.examSubjects.map(s=>s.classId)??[]);return (options?.classes??[]).filter(c=>ids.has(c.id));},[options,selectedExam]);
 useEffect(()=>{ if(availableClasses.length && !availableClasses.some(c=>c.id===classId)) setClassId(availableClasses[0].id); else if(!availableClasses.length) setClassId(""); },[examId,availableClasses]);
 const loadPreview=useCallback(async()=>{ if(!academicYearId||!examId||!classId){setPreview(null);return;} try {setBusy(true);setPreview(await principalReportCardServices.getPreview(academicYearId,examId,classId));}catch(e:any){setPreview(null);showAlert("Unable to load report cards",e?.response?.data?.message??"Could not load report-card preview.");}finally{setBusy(false);}},[academicYearId,examId,classId]);
 useEffect(()=>{void loadPreview();},[loadPreview]);
 const onRefresh=async()=>{setRefreshing(true);try{await loadOptions();}finally{setRefreshing(false);}};
 const exportPdf=async()=>{
  if(!preview) return;
  const completeCards=preview.reportCards.filter(card=>card.allFinalized);
  if(!completeCards.length){showAlert("No completed report cards","Finalize all marks for at least one student before exporting report cards.");return;}
  const esc=(value:any)=>String(value??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;").replace(/'/g,"&#39;");
  const logo=preview.school.logoUrl?`<img class="logo" src="${esc(preview.school.logoUrl)}" />`:"";
  const pages=completeCards.map(card=>`<section class="page">
   <header>${logo}<div class="school"><h1>${esc(preview.school.name)}</h1><div>${esc(preview.school.address||"")}</div><div>${esc(preview.school.contactPhone||"")}</div><div>${esc(preview.school.board||"")}</div></div></header>
   <h2>STUDENT REPORT CARD</h2><div class="exam">${esc(preview.exam.name)} · ${esc(preview.academicYear.name)}</div>
   <table class="details"><tr><td><b>Student</b>: ${esc(card.student.name)}</td><td><b>Admission No.</b>: ${esc(card.student.admissionNo)}</td></tr><tr><td><b>Class</b>: ${esc(preview.class.displayName||preview.class.classNumber)}</td><td><b>Section</b>: ${esc(card.student.section.sectionName)}</td></tr><tr><td><b>Roll No.</b>: ${esc(card.student.rollNumber||"—")}</td><td><b>Father's Name</b>: ${esc(card.student.fatherName)}</td></tr></table>
   <table class="marks"><thead><tr><th>#</th><th>Subject</th><th>Max Marks</th><th>Pass Marks</th><th>Marks Obtained</th><th>Status</th></tr></thead><tbody>${card.subjects.map((sub:any,i:number)=>`<tr><td>${i+1}</td><td>${esc(sub.subject.name)}</td><td>${sub.maxMarks}</td><td>${sub.passingMarks}</td><td>${sub.isAbsent?"AB":sub.marksObtained}</td><td>${sub.passed?"PASS":"FAIL"}</td></tr>`).join("")}<tr class="total"><td colspan="2">TOTAL</td><td>${card.totalMax}</td><td>—</td><td>${card.totalObtained}</td><td>${esc(card.result)}</td></tr></tbody></table>
   <div class="summary"><div><span>Percentage</span><b>${card.percentage}%</b></div><div><span>Grade</span><b>${esc(card.grade||"—")}</b></div><div><span>Class Rank</span><b>${esc(card.rank??"—")}</b></div><div><span>Result</span><b>${esc(card.result)}</b></div></div>
   <p class="note">AB indicates absent. This report reflects finalized marks for the selected examination.</p><footer><span>Class Teacher Signature</span><span>Principal Signature</span></footer>
  </section>`).join("");
  const html=`<!doctype html><html><head><meta charset="utf-8"><style>
  @page{size:A4;margin:15mm}*{box-sizing:border-box}body{font-family:Arial,sans-serif;color:#172033;font-size:11px}.page{page-break-after:always;break-after:page}.page:last-child{page-break-after:auto;break-after:auto}header{display:flex;align-items:center;gap:14px;border-bottom:2px solid #263b65;padding-bottom:12px}.logo{width:64px;height:64px;object-fit:contain}.school{flex:1;text-align:center}.school h1{font-size:21px;margin:0 0 5px}.school div{margin-top:3px;color:#4b5563}h2{text-align:center;font-size:17px;letter-spacing:1px;margin:18px 0 4px}.exam{text-align:center;font-size:12px;margin-bottom:18px;color:#374151}.details,.marks{width:100%;border-collapse:collapse;margin:12px 0 18px}.details td{padding:8px;border:1px solid #d5dbe5;width:50%}.marks th,.marks td{border:1px solid #aeb8c8;padding:8px;text-align:left}.marks th{background:#eaf0fa}.marks td:nth-child(1),.marks td:nth-child(n+3){text-align:center}.total{font-weight:bold;background:#f4f6fa}.summary{display:flex;gap:10px;margin-top:18px}.summary div{flex:1;border:1px solid #d5dbe5;padding:12px;text-align:center}.summary span,.summary b{display:block}.summary span{color:#596579;margin-bottom:6px}.summary b{font-size:17px}.note{margin-top:22px;color:#596579}footer{display:flex;justify-content:space-between;margin-top:70px}footer span{width:35%;border-top:1px solid #6b7280;text-align:center;padding-top:7px}
  </style></head><body>${pages}</body></html>`;
  
try {
  setBusy(true);

  if (Platform.OS === "web") {
    // Browser: render the report HTML and let the user
    // print it or save it as a PDF.
    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      throw new Error(
        "Please allow pop-ups to export the report cards."
      );
    }

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();

    // Give the browser time to render the report.
    printWindow.onload = () => {
      printWindow.print();
    };

    return;
  }

  // Android / iOS: retain the existing native PDF flow.
  const file = await Print.printToFileAsync({ html });

  if (!file?.uri) {
    throw new Error("PDF generation did not return a file URI.");
  }

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(file.uri, {
      mimeType: "application/pdf",
      dialogTitle: "Share report cards",
      UTI: "com.adobe.pdf",
    });
  } else {
    await Print.printAsync({ html });
  }
} catch (e: any) {
  showAlert(
    "PDF export failed",
    e?.message ?? "Could not create report-card PDF."
  );
} finally {
  setBusy(false);
}
};
 const togglePublish=async()=>{if(!preview)return;const next=!preview.exam.isPublished;const ok=await confirm({title:next?"Publish report cards?":"Unpublish report cards?",message:next?"Parents will be able to view these results after publication.":"Parents will no longer be able to view these results.",confirmText:next?"Publish":"Unpublish",cancelText:"Cancel",destructive:!next});if(!ok)return;try{setBusy(true);await principalReportCardServices.publish(preview.exam.id,academicYearId,next);showAlert("Updated",next?"Report cards published.":"Report cards unpublished.");await loadPreview();}catch(e:any){showAlert("Update failed",e?.response?.data?.message??"Could not update publication status.");}finally{setBusy(false);}};
 if(loading)return <View style={styles.center}><ActivityIndicator size="large"/><Text>Loading report cards…</Text></View>;
 return <ScrollView style={[styles.root,{backgroundColor:theme.colors.background}]} contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}/> }>
  <Text variant="headlineSmall" style={styles.title}>Report Card Management</Text><Text variant="bodyMedium" style={styles.muted}>{options?.academicYear.name??"Selected academic year"}</Text>
  <Card style={styles.card}><Card.Content>
   <Text variant="titleMedium" style={styles.label}>Exam</Text><Menu visible={examMenu} onDismiss={()=>setExamMenu(false)} anchor={<Button mode="outlined" icon="clipboard-text" onPress={()=>setExamMenu(true)}>{selectedExam?.name??"Select exam"}</Button>}>{(options?.exams??[]).map(e=><Menu.Item key={e.id} title={`${e.name}${e.isPublished?" · Published":""}`} onPress={()=>{setExamId(e.id);setExamMenu(false);}}/>)}</Menu>
   <Text variant="titleMedium" style={styles.label}>Class</Text><Menu visible={classMenu} onDismiss={()=>setClassMenu(false)} anchor={<Button mode="outlined" icon="school" disabled={!availableClasses.length} onPress={()=>setClassMenu(true)}>{options?.classes.find(c=>c.id===classId)?.displayName??"Select class"}</Button>}>{availableClasses.map(c=><Menu.Item key={c.id} title={c.displayName||`Class ${c.classNumber}`} onPress={()=>{setClassId(c.id);setClassMenu(false);}}/>)}</Menu>
   <View style={styles.row}><Chip>Students {preview?.summary.students??0}</Chip><Chip>Complete {preview?.summary.complete??0}</Chip><Chip>Pending {preview?.summary.pending??0}</Chip></View>
   <Button mode="outlined" icon="file-pdf-box" loading={busy} disabled={!preview||busy||preview.summary.complete===0} onPress={exportPdf} style={{marginBottom:10}}>Export completed report cards (PDF)</Button>
   <Button mode="contained" icon={preview?.exam.isPublished?"eye-off":"publish"} loading={busy} disabled={!preview||busy} onPress={togglePublish}>{preview?.exam.isPublished?"Unpublish report cards":"Publish report cards"}</Button>
   <Text variant="bodySmall" style={styles.note}>Publishing uses the existing Exam.isPublished field, which also controls result visibility in the current schema.</Text>
  </Card.Content></Card>
  {busy&&!preview?<ActivityIndicator style={{margin:20}}/>:null}
  {preview?.reportCards.map(card=><Card key={card.student.id} style={styles.card}><Card.Content>
   <View style={styles.studentHead}><View style={{flex:1}}><Text variant="titleMedium">{card.student.name}</Text><Text variant="bodySmall" style={styles.muted}>Admission: {card.student.admissionNo} · Roll: {card.student.rollNumber??"—"} · Section: {card.student.section.sectionName}</Text><Text variant="bodySmall" style={styles.muted}>Father: {card.student.fatherName}</Text></View><Chip>{card.result}</Chip></View><Divider style={{marginVertical:10}}/>
   {card.subjects.map(s=><View key={s.subject.id} style={styles.subjectRow}><View style={{flex:1}}><Text>{s.subject.name}</Text><Text variant="bodySmall" style={styles.muted}>Pass: {s.passingMarks} · Max: {s.maxMarks}{s.isAbsent?" · Absent":""}</Text></View><Text variant="titleSmall">{s.marksObtained===null?"Pending":`${s.marksObtained} / ${s.maxMarks}`}</Text></View>)}
   <Divider style={{marginVertical:10}}/><View style={styles.row}><Text>Total: {card.totalObtained}/{card.totalMax}</Text><Text>{card.allFinalized?`${card.percentage}% · Grade ${card.grade}`:"Marks pending"}</Text><Text>Rank: {card.rank??"—"}</Text></View>
  </Card.Content></Card>)}
  {preview?.reportCards.length===0?<Text style={styles.empty}>No active students found for this class.</Text>:null}
  <Text variant="bodySmall" style={styles.note}>PDF export includes completed report cards for the selected class and exam. Attendance is omitted because the current report-card data flow does not include attendance summaries.</Text>
 </ScrollView>;
}
const styles=StyleSheet.create({root:{flex:1},content:{padding:14,paddingBottom:36},center:{flex:1,alignItems:"center",justifyContent:"center",gap:12},title:{fontWeight:"700"},muted:{opacity:.7,marginTop:4},card:{marginTop:12,borderRadius:14},label:{fontWeight:"600",marginTop:8,marginBottom:6},row:{flexDirection:"row",flexWrap:"wrap",justifyContent:"space-between",gap:8,marginVertical:12},note:{opacity:.7,marginTop:12},studentHead:{flexDirection:"row",alignItems:"center",gap:10},subjectRow:{flexDirection:"row",alignItems:"center",paddingVertical:7,borderBottomWidth:StyleSheet.hairlineWidth,borderBottomColor:"#888"},empty:{textAlign:"center",marginTop:20}});
