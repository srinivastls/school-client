import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useMemo, useRef, useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Button, Card, Divider, Snackbar } from "react-native-paper";
import { Colors, makeStyles, Metrics } from "../theme";
import { RootStackParamList, RootStackScreenNames } from "../types";
import { formatToIndianAmount } from "../utils";

/* ============================================================
   TYPES
============================================================ */
type InvoiceTransaction = {
  id: string;
  amount: string | number;
  paymentMode?: string;
  date: string;
  pendingAmount: string | number;
  transactionId?: string;
  receiptNumber?: string;
  recordedByUserId?: string;
  classNumber?: string;
  amountDetails?: {
    tie?: string | number;
    diary?: string | number;
    belt?: string | number;
    arrears?: string | number;
    tuitionFee?: string | number;
    textBookFee?: string | number;
    noteBookFee?: string | number;
    other?: string | number;
  };
};

type InvoiceStudent = {
  id?: string;
  name?: string;
  admissionNo?: string;
  phone?: string;
  classNumber?: string;
  sectionName?: string;
  pendingAmount?: string | number;
};

/* ============================================================
   SCHOOL CONFIG
============================================================ */
const SCHOOL = {
  name: "OXFORD EMUP SCHOOL",
  address: "Kothapeta, Nuzvid - 521201",
  phone: "865 623 3675",
  footer: "Please pay every month by 5th.",
};

/* ============================================================
   HELPERS
============================================================ */
const money = (v: string | number) =>
  `₹${formatToIndianAmount(Number(v ?? 0))}`;

const safe = (v: unknown) => String(v ?? "N/A");

/* ============================================================
   HTML RECEIPT BUILDER
   Produces a fully self-contained HTML string that renders
   correctly when opened in a browser and printed to PDF.
============================================================ */
function buildReceiptHtml(params: {
  name: string;
  admissionNo: string;
  phoneNo: string;
  studentClass: string | number;
  sectionName: string;
  date: string;
  paymentMode: string;
  transactionId: string;
  receiptNumber: string;
  recordedBy: string;
  paidAmount: number;
  remainingAmount: number;
  rows: { label: string; amount: number }[];
  format: "a4" | "thermal";
}) {
  const { format } = params;
  const th = format === "thermal";

  const rowsHtml = params.rows
    .map(
      (r) => `
      <tr>
        <td style="padding:${th?"4px 6px":"8px 10px"};border:1px solid #e2e8f0;font-size:${th?"11px":"13px"};">${r.label}</td>
        <td style="padding:${th?"4px 6px":"8px 10px"};border:1px solid #e2e8f0;text-align:right;font-size:${th?"11px":"13px"};">${money(r.amount)}</td>
      </tr>`
    )
    .join("");

  const pageW = th ? "80mm" : "210mm";
  const pageM = th ? "4mm" : "15mm";
  const bodyW = th ? "72mm" : "180mm";

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>Receipt</title>
<style>
  @page { size: ${pageW} auto; margin: ${pageM}; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: Arial, Helvetica, sans-serif;
    font-size: ${th ? "11px" : "13px"};
    color: #1a1a1a;
    background: #fff;
    width: ${bodyW};
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .wrap { width: 100%; padding: 0; }

  /* HEADER */
  .hdr { text-align:center; border-bottom: 2px solid #1a1a1a; padding-bottom: ${th?"6px":"12px"}; margin-bottom:${th?"8px":"14px"}; }
  .school { font-size:${th?"16px":"22px"}; font-weight:900; letter-spacing:0.5px; }
  .addr { font-size:${th?"9px":"11px"}; color:#555; margin-top:3px; line-height:1.5; }

  /* BADGE */
  .badge { text-align:center; margin:${th?"6px 0":"10px 0"}; }
  .badge span {
    display:inline-block;
    background:#f0f4ff; color:#1e40af;
    font-size:${th?"10px":"12px"}; font-weight:800; letter-spacing:1px;
    padding:${th?"3px 10px":"5px 18px"}; border-radius:20px;
  }
  .rno { text-align:center; font-size:${th?"9px":"11px"}; color:#666; margin-bottom:${th?"8px":"14px"}; }

  /* SECTION TITLE */
  .stitle {
    font-size:${th?"10px":"12px"}; font-weight:800; color:#374151;
    border-bottom:1px solid #d1d5db; padding-bottom:4px;
    margin-bottom:${th?"6px":"10px"}; margin-top:${th?"8px":"14px"};
    text-transform:uppercase; letter-spacing:0.5px;
  }

  /* INFO GRID */
  .grid { width:100%; border-collapse:collapse; margin-bottom:${th?"6px":"10px"}; }
  .grid td { padding:${th?"3px 6px":"6px 10px"}; border:1px solid #e2e8f0; font-size:${th?"10px":"12px"}; vertical-align:top; }
  .grid .lbl { font-weight:700; background:#f8fafc; width:${th?"38%":"30%"}; color:#374151; }

  /* PAYMENT TABLE */
  .ptbl { width:100%; border-collapse:collapse; }
  .ptbl th {
    padding:${th?"4px 6px":"7px 10px"}; background:#f8fafc;
    border:1px solid #e2e8f0; font-size:${th?"10px":"12px"};
    font-weight:700; color:#374151;
  }
  .ptbl th:last-child { text-align:right; }

  /* TOTAL ROW */
  .tot td {
    padding:${th?"5px 6px":"9px 10px"}; font-size:${th?"12px":"15px"};
    font-weight:900; border-top:2px solid #1a1a1a; border-bottom:1px solid #e2e8f0;
    border-left:1px solid #e2e8f0; border-right:1px solid #e2e8f0;
  }
  .tot td:last-child { text-align:right; color:#1e40af; }

  /* PENDING BOX */
  .pend {
    display:flex; justify-content:space-between; align-items:center;
    margin-top:${th?"8px":"14px"}; padding:${th?"8px":"14px"};
    background:#fff7f7; border:1px solid #fecaca; border-radius:8px;
  }
  .pend-lbl { font-size:${th?"10px":"13px"}; font-weight:800; color:#1a1a1a; }
  .pend-sub { font-size:${th?"8px":"10px"}; color:#888; margin-top:2px; }
  .pend-amt { font-size:${th?"14px":"22px"}; font-weight:900; color:#dc2626; }

  /* SIGNATURE */
  .sig { display:${th?"none":"flex"}; justify-content:space-between; margin-top:30px; }
  .sig-box { text-align:center; border-top:1px solid #555; padding-top:10px; font-size:10px; color:#555; width:30%; }

  /* FOOTER */
  .ftr { margin-top:${th?"8px":"14px"}; padding-top:${th?"6px":"10px"}; border-top:1px solid #e2e8f0; text-align:center; font-size:${th?"8px":"10px"}; color:#888; }

  @media print {
    html, body { margin:0; padding:0; }
    .no-print { display:none !important; }
  }
</style>
</head>
<body>
<div class="wrap">

  <div class="hdr">
    <div class="school">${SCHOOL.name}</div>
    <div class="addr">${SCHOOL.address}<br/>Ph: ${SCHOOL.phone}</div>
  </div>

  <div class="badge"><span>PAYMENT RECEIPT</span></div>
  <div class="rno">Receipt No: <strong>${safe(params.receiptNumber)}</strong> &nbsp;|&nbsp; Date: <strong>${safe(params.date)}</strong></div>

  <div class="stitle">Student Details</div>
  <table class="grid">
    <tr><td class="lbl">Student Name</td><td>${safe(params.name)}</td></tr>
    <tr><td class="lbl">Admission No.</td><td>${safe(params.admissionNo)}</td></tr>
    <tr><td class="lbl">Class / Section</td><td>${safe(params.studentClass)} / ${safe(params.sectionName)}</td></tr>
    <tr><td class="lbl">Phone</td><td>${safe(params.phoneNo)}</td></tr>
    <tr><td class="lbl">Payment Mode</td><td>${safe(params.paymentMode)}</td></tr>
  </table>

  <div class="stitle">Payment Details</div>
  <table class="ptbl">
    <thead><tr><th style="text-align:left;">Description</th><th>Amount</th></tr></thead>
    <tbody>
      ${rowsHtml}
      <tr class="tot"><td>TOTAL PAID</td><td>${money(params.paidAmount)}</td></tr>
    </tbody>
  </table>

  <div class="pend">
    <div>
      <div class="pend-lbl">Remaining Pending</div>
      <div class="pend-sub">Outstanding after this payment</div>
    </div>
    <div class="pend-amt">${money(params.remainingAmount)}</div>
  </div>

  <div class="stitle">Transaction Info</div>
  <table class="grid">
    <tr><td class="lbl">Transaction ID</td><td>${safe(params.transactionId)}</td></tr>
    <tr><td class="lbl">Recorded By</td><td>${safe(params.recordedBy)}</td></tr>
  </table>

  <div class="sig">
    <div class="sig-box">Parent / Student</div>
    <div class="sig-box">Authorized Signature</div>
    <div class="sig-box">School Seal</div>
  </div>

  <div class="ftr">${SCHOOL.footer}<br/>Thank you for your payment.</div>

</div>
</body>
</html>`;
}

/* ============================================================
   OPEN-IN-BROWSER PRINT  (works on ALL platforms)
   Opens the HTML in a new tab/window — user clicks Ctrl+P
   or File → Print → Save as PDF.
============================================================ */
function printViaWebWindow(html: string) {
  const win = window.open("", "_blank");
  if (!win) {
    alert("Pop-up blocked. Please allow pop-ups for this site.");
    return;
  }
  win.document.open();
  win.document.write(html);
  win.document.close();
  // Trigger print dialog automatically after content loads
  win.onload = () => win.print();
}

/* ============================================================
   DOWNLOAD AS HTML FILE  (open in browser → print to PDF)
   This is the most reliable cross-platform approach.
============================================================ */
function downloadHtmlFile(html: string, filename: string) {
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* ============================================================
   INFO ROW
============================================================ */
function InfoRow({ label, value }: { label: string; value: string | number | undefined }) {
  const s = rowStyles();
  return (
    <View style={s.row}>
      <Text style={s.label}>{label}</Text>
      <Text style={s.value}>{value ?? "N/A"}</Text>
    </View>
  );
}

/* ============================================================
   FEE ROW
============================================================ */
function FeeRow({ label, amount }: { label: string; amount: number }): JSX.Element {
  const s = rowStyles();
  return (
    <View style={s.row}>
      <Text style={s.label}>{label}</Text>
      <Text style={s.value}>₹{formatToIndianAmount(amount)}</Text>
    </View>
  );
}

function rowStyles() {
  return StyleSheet.create({
    row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6 },
    label: { fontSize: 13, color: "#6B7280", fontWeight: "600" },
    value: { fontSize: 13, fontWeight: "700", color: "#111827", textAlign: "right", flex: 1, marginLeft: 12 },
  });
}

/* ============================================================
   SCREEN
============================================================ */
const Invoice = ({
  route,
}: NativeStackScreenProps<RootStackParamList, RootStackScreenNames.Invoice>) => {
  const styles = useStyles();

  /* ---- ROUTE DATA ---- */
  const { transaction, student } = route.params as unknown as {
    transaction: InvoiceTransaction;
    student: InvoiceStudent;
  };

  /* ---- SNACKBAR ---- */
  const [snackMsg, setSnackMsg] = useState("");
  const [snackVisible, setSnackVisible] = useState(false);
  const showMsg = (m: string) => { setSnackMsg(m); setSnackVisible(true); };

  /* ---- LOADING ---- */
  const [busyA4, setBusyA4] = useState(false);
  const [busyThermal, setBusyThermal] = useState(false);

  /* ---- FIELDS ---- */
  const {
    date, amount, pendingAmount, paymentMode,
    transactionId, receiptNumber, recordedByUserId,
    classNumber, amountDetails,
  } = transaction;

  const name         = student?.name         ?? "N/A";
  const admissionNo  = student?.admissionNo  ?? "N/A";
  const phoneNo      = student?.phone        ?? "N/A";
  const studentClass = classNumber ?? student?.classNumber ?? "N/A";
  const sectionName  = student?.sectionName  ?? "N/A";

  const paidTuitionFee  = Number(amountDetails?.tuitionFee  ?? 0);
  const paidTextBookFee = Number(amountDetails?.textBookFee ?? 0);
  const paidNoteBookFee = Number(amountDetails?.noteBookFee ?? 0);
  const paidDiary       = Number(amountDetails?.diary       ?? 0);
  const paidTie         = Number(amountDetails?.tie         ?? 0);
  const paidBelt        = Number(amountDetails?.belt        ?? 0);
  const paidArrears     = Number(amountDetails?.arrears     ?? 0);
  const paidOther       = Number(amountDetails?.other       ?? 0);
  const paidAmount      = Number(amount       ?? 0);
  const remainingAmount = Number(pendingAmount ?? student?.pendingAmount ?? 0);

  const paymentRows = useMemo(
    () =>
      [
        { label: "Tuition Fee",  amount: paidTuitionFee  },
        { label: "Textbook Fee", amount: paidTextBookFee },
        { label: "Notebook Fee", amount: paidNoteBookFee },
        { label: "Diary",        amount: paidDiary       },
        { label: "Tie",          amount: paidTie         },
        { label: "Belt",         amount: paidBelt        },
        { label: "Arrears",      amount: paidArrears     },
        { label: "Other",        amount: paidOther       },
      ].filter((r) => r.amount > 0),
    [paidTuitionFee, paidTextBookFee, paidNoteBookFee, paidDiary, paidTie, paidBelt, paidArrears, paidOther]
  );

  /* ---- SHARED PARAMS ---- */
  const receiptParams = {
    name, admissionNo, phoneNo,
    studentClass, sectionName,
    date:          safe(date),
    paymentMode:   safe(paymentMode),
    transactionId: safe(transactionId),
    receiptNumber: safe(receiptNumber),
    recordedBy:    safe(recordedByUserId),
    paidAmount, remainingAmount,
    rows: paymentRows,
  };

  /* ---- ACTIONS ---- */
  const handleA4 = () => {
    setBusyA4(true);
    try {
      const html = buildReceiptHtml({ ...receiptParams, format: "a4" });
      if (Platform.OS === "web") {
        // Download HTML → open in browser → Ctrl+P → Save as PDF
        downloadHtmlFile(html, `receipt-${receiptNumber ?? admissionNo}.html`);
        showMsg("File downloaded! Open it in your browser and press Ctrl+P to save as PDF.");
      } else {
        // On native (Android/iOS), open print dialog
        printViaWebWindow(html);
      }
    } catch (e) {
      console.error("A4 error", e);
      showMsg("Failed to generate receipt.");
    } finally {
      setBusyA4(false);
    }
  };

  const handlePrint = () => {
    try {
      const html = buildReceiptHtml({ ...receiptParams, format: "a4" });
      printViaWebWindow(html);
    } catch (e) {
      showMsg("Failed to open print dialog.");
    }
  };

  const handleThermal = () => {
    setBusyThermal(true);
    try {
      const html = buildReceiptHtml({ ...receiptParams, format: "thermal" });
      if (Platform.OS === "web") {
        downloadHtmlFile(html, `receipt-thermal-${receiptNumber ?? admissionNo}.html`);
        showMsg("Thermal receipt downloaded! Open in browser and Ctrl+P to print.");
      } else {
        printViaWebWindow(html);
      }
    } catch (e) {
      showMsg("Failed to generate thermal receipt.");
    } finally {
      setBusyThermal(false);
    }
  };

  /* ---- RENDER ---- */
  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* HEADER CARD */}
        <Card style={styles.card}>
          <Card.Content style={styles.headerContent}>
            <View style={styles.logo}><Text style={styles.logoText}>₹</Text></View>
            <Text style={styles.schoolName}>{SCHOOL.name}</Text>
            <Text style={styles.addr}>{SCHOOL.address}</Text>
            <Text style={styles.addr}>Ph: {SCHOOL.phone}</Text>
            <View style={styles.badge}><Text style={styles.badgeText}>PAYMENT RECEIPT</Text></View>
            <Text style={styles.rno}>
              Receipt No. <Text style={styles.rnoBold}>{receiptNumber ?? "N/A"}</Text>
            </Text>
          </Card.Content>
        </Card>

        {/* STUDENT */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Student Details</Text>
            <InfoRow label="Student"       value={name}        />
            <InfoRow label="Admission No." value={admissionNo} />
            <InfoRow label="Class"         value={studentClass}/>
            <InfoRow label="Section"       value={sectionName} />
            <InfoRow label="Phone"         value={phoneNo}     />
          </Card.Content>
        </Card>

        {/* PAYMENT */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Payment Details</Text>
            {paymentRows.map((r) => <FeeRow key={r.label} label={r.label} amount={r.amount} />)}
            <Divider style={{ marginVertical: 10 }} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Paid</Text>
              <Text style={styles.totalAmt}>{money(paidAmount)}</Text>
            </View>
          </Card.Content>
        </Card>

        {/* PENDING */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.pendingBox}>
              <View>
                <Text style={styles.pendingLabel}>Remaining Pending</Text>
                <Text style={styles.pendingSub}>Outstanding after this payment</Text>
              </View>
              <Text style={styles.pendingAmt}>{money(remainingAmount)}</Text>
            </View>
          </Card.Content>
        </Card>

        {/* TRANSACTION */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Transaction Info</Text>
            <InfoRow label="Date"           value={date}                     />
            <InfoRow label="Payment Mode"   value={paymentMode ?? "N/A"}     />
            <InfoRow label="Transaction ID" value={transactionId ?? "N/A"}   />
            <InfoRow label="Recorded By"    value={recordedByUserId ?? "N/A"}/>
          </Card.Content>
        </Card>

        {/* ACTIONS */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Receipt Actions</Text>

            <Button
              mode="contained"
              icon="file-download"
              onPress={handleA4}
              loading={busyA4}
              disabled={busyA4}
              buttonColor={Colors.brandPrimary}
              style={styles.btn}
              contentStyle={styles.btnContent}
            >
              {busyA4 ? "GENERATING…" : "DOWNLOAD A4 RECEIPT"}
            </Button>

            <Button
              mode="outlined"
              icon="printer"
              onPress={handlePrint}
              textColor={Colors.brandPrimary}
              style={styles.btn}
              contentStyle={styles.btnContent}
            >
              PRINT RECEIPT
            </Button>

            <Button
              mode="outlined"
              icon="receipt"
              onPress={handleThermal}
              loading={busyThermal}
              disabled={busyThermal}
              textColor={Colors.brandPrimary}
              style={styles.btn}
              contentStyle={styles.btnContent}
            >
              {busyThermal ? "GENERATING…" : "DOWNLOAD THERMAL (80mm)"}
            </Button>
          </Card.Content>
        </Card>

        <View style={styles.footer}>
          <Text style={styles.footerText}>{SCHOOL.footer}</Text>
          <Text style={styles.footerText}>Thank you for your payment.</Text>
        </View>
      </ScrollView>

      <Snackbar
        visible={snackVisible}
        onDismiss={() => setSnackVisible(false)}
        duration={4000}
        style={styles.snack}
      >
        {snackMsg}
      </Snackbar>
    </View>
  );
};

/* ============================================================
   STYLES
============================================================ */
const useStyles = makeStyles(() => ({
  container:    { flex: 1, backgroundColor: "#F3F4F8" },
  scroll:       { padding: 16, paddingBottom: 40 },
  card:         { marginBottom: 12, borderRadius: 16, backgroundColor: "#fff", overflow: "hidden" },
  headerContent:{ alignItems: "center", paddingVertical: 20 },
  logo:         { width: 52, height: 52, borderRadius: 16, backgroundColor: Colors.brandPrimaryBg, alignItems: "center", justifyContent: "center", marginBottom: 10 },
  logoText:     { fontSize: 26, fontWeight: "900", color: Colors.brandPrimary },
  schoolName:   { fontSize: 20, fontWeight: "900", color: "#111827", textAlign: "center" },
  addr:         { fontSize: 11, color: "#6B7280", marginTop: 3, textAlign: "center" },
  badge:        { marginTop: 12, paddingHorizontal: 18, paddingVertical: 6, borderRadius: 20, backgroundColor: Colors.brandPrimaryBg },
  badgeText:    { fontSize: 12, fontWeight: "900", letterSpacing: 1, color: Colors.brandPrimary },
  rno:          { marginTop: 6, fontSize: 11, color: "#6B7280" },
  rnoBold:      { fontWeight: "800", color: "#111827" },
  sectionTitle: { fontSize: 13, fontWeight: "800", color: "#374151", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10, paddingBottom: 6, borderBottomWidth: 1, borderBottomColor: "#E5E7EB" },
  totalRow:     { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  totalLabel:   { fontSize: 15, fontWeight: "900", color: "#111827" },
  totalAmt:     { fontSize: 20, fontWeight: "900", color: Colors.brandPrimary },
  pendingBox:   { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 14, borderRadius: 12, backgroundColor: "#FFF7F7", borderWidth: 1, borderColor: "#FECACA" },
  pendingLabel: { fontSize: 14, fontWeight: "800", color: "#111827" },
  pendingSub:   { fontSize: 10, color: "#9CA3AF", marginTop: 2 },
  pendingAmt:   { fontSize: 22, fontWeight: "900", color: "#DC2626" },
  btn:          { marginTop: 10, borderRadius: 12 },
  btnContent:   { height: 50 },
  footer:       { alignItems: "center", marginTop: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: "#E5E7EB" },
  footerText:   { fontSize: 10, color: "#9CA3AF", marginTop: 2, textAlign: "center" },
  snack:        { backgroundColor: "#1F2937", borderRadius: 10 },
}));

export { Invoice };