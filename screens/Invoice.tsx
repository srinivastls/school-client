import { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import React, { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Button, Card } from "react-native-paper";
import { Page } from "../components";
import { Colors, makeStyles, Metrics } from "../theme";

import {
  RootStackParamList,
  RootStackScreenNames,
} from "../types";
import { formatToIndianAmount } from "../utils";


const Invoice = ({
  route,
}: NativeStackScreenProps<
  RootStackParamList,
  RootStackScreenNames.Invoice
>) => {
  const styles = useStyles();

  const { transaction, student } = route.params;

  const [downloading, setDownloading] = useState(false);

  const {
    date,
    amount,
    pendingAmount,
    adminId,
    amountDetails,
  } = transaction;

  // ==========================================
  // STUDENT DETAILS
  // ==========================================

  const name = student?.name ?? "N/A";

  const admissionNo =
    student?.admissionNo ?? "N/A";

  const phoneNo =
    student?.phoneNo ?? "N/A";

  // ==========================================
  // CLASS DETAILS
  //
  // Supports both:
  // student.class
  // student.classNumber
  // ==========================================

  const studentClass =
    //student?.class ??
    student?.classNumber ??
    {};

  const className =
    typeof studentClass === "string"
      ? studentClass
      : studentClass?.classNumber ?? "N/A";

  // ==========================================
  // FEE DETAILS
  // ==========================================

  const tuitionFee = Number(
    studentClass?.tuitionFee ?? 0
  );

  const textBookFee = Number(
    studentClass?.textBookFee ?? 0
  );

  const noteBookFee = Number(
    studentClass?.noteBookFee ?? 0
  );

  // Diary comes from Class model
  const diaryAmount = Number(
      student?.diary?.amount ??
      0
  );

  // Tie comes directly from Student model
  const tieAmount = Number(
      student?.tie?.amount ??
      0
  );

  // Belt comes directly from Student model
  const beltAmount = Number(
      student?.belt?.amount ??
      0
  );

  // Arrears comes directly from Student model
  const arrearsAmount = Number(
      student?.arrears?.amount ??
      0
  );

  const otherFeeAmount =
    tieAmount +
    diaryAmount +
    beltAmount;

  const totalFee =
    tuitionFee +
    textBookFee +
    noteBookFee +
    tieAmount +
    diaryAmount +
    beltAmount;

  // ==========================================
  // COUPON
  // ==========================================

  const couponDiscount = Number(
      student?.couponCode?.discount ??
      0
  );

  // ==========================================
  // PAYMENT DETAILS
  // ==========================================

  const paidTie = Number(
    amountDetails?.tie ??
      0
  );

  const paidDiary = Number(
    amountDetails?.diary ??
      0
  );

  const paidBelt = Number(
    amountDetails?.belt ??
      0
  );

  const paidArrears = Number(
    amountDetails?.arrears ??
      0
  );

  const paidTuitionFee = Number(
    amountDetails?.tuitionFee ??
      0
  );

  const paidTextBookFee = Number(
    amountDetails?.textBookFee ??
      0
  );

  const paidNoteBookFee = Number(
    amountDetails?.noteBookFee ??
      0
  );

  const paidOther = Number(
    amountDetails?.other ?? 0
  );

  const paidAmount = Number(
    amount ?? 0
  );

  const remainingAmount = Number(
    pendingAmount ??
      student?.pendingAmount ??
      0
  );

  // ==========================================
  // HELPERS
  // ==========================================

  const money = (
    value: number | string
  ) => {
    return `₹${formatToIndianAmount(
      Number(value ?? 0)
    )}`;
  };

  const escapeHtml = (
    value: unknown
  ) => {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  // ==========================================
  // CREATE PDF HTML
  // ==========================================

  const createInvoiceHtml = () => {
    const feeRowsData = [
      ["Tuition Fee", tuitionFee],
      ["Textbook Fee", textBookFee],
      ["Notebook Fee", noteBookFee],
      ["Diary", diaryAmount],
      ["Tie", tieAmount],
      ["Belt", beltAmount],
      ["Arrears", arrearsAmount],
    ];

    const feeRows = feeRowsData
      .filter(([, value]) => Number(value) > 0)
      .map(
        ([label, value]) => `
          <tr>
            <td>${escapeHtml(label)}</td>

            <td class="amount">
              ${money(Number(value))}
            </td>
          </tr>
        `
      )
      .join("");

    const paymentRowsData = [
      ["Tuition Fee", paidTuitionFee],
      ["Textbook Fee", paidTextBookFee],
      ["Notebook Fee", paidNoteBookFee],
      ["Diary", paidDiary],
      ["Tie", paidTie],
      ["Belt", paidBelt],
      ["Arrears", paidArrears],
      ["Other", paidOther],
    ];

    const paymentRows = paymentRowsData
      .filter(([, value]) => Number(value) > 0)
      .map(
        ([label, value]) => `
          <tr>
            <td>${escapeHtml(label)}</td>

            <td class="amount">
              ${money(Number(value))}
            </td>
          </tr>
        `
      )
      .join("");

    return `
      <!DOCTYPE html>

      <html>
        <head>
          <meta charset="UTF-8" />

          <style>

            @page {
              size: A4;
              margin: 12mm;
            }

            * {
              box-sizing: border-box;
            }

            body {
              font-family: Arial, sans-serif;
              color: #222;
              font-size: 11px;
              margin: 0;
              padding: 0;
            }

            .header {
              text-align: center;
              border-bottom: 2px solid #222;
              padding-bottom: 10px;
              margin-bottom: 12px;
            }

            .school-name {
              font-size: 20px;
              font-weight: bold;
              margin-bottom: 4px;
            }

            .school-details {
              font-size: 10px;
              line-height: 1.5;
            }

            .invoice-title {
              text-align: center;
              font-size: 15px;
              font-weight: bold;
              margin: 15px 0;
            }

            .section-title {
              font-size: 13px;
              font-weight: bold;
              margin-top: 16px;
              margin-bottom: 6px;
              border-bottom: 1px solid #444;
              padding-bottom: 4px;
            }

            table {
              width: 100%;
              border-collapse: collapse;
            }

            th,
            td {
              border: 1px solid #ccc;
              padding: 7px;
            }

            th {
              background: #f2f2f2;
              font-weight: bold;
            }

            .amount {
              text-align: right;
              white-space: nowrap;
            }

            .summary {
              margin-top: 10px;
            }

            .summary-row {
              display: flex;
              justify-content: space-between;
              padding: 6px 0;
            }

            .total {
              border-top: 2px solid #222;
              padding-top: 9px;
              font-size: 13px;
              font-weight: bold;
            }

            .paid {
              font-size: 13px;
              font-weight: bold;
            }

            .pending {
              font-size: 13px;
              font-weight: bold;
            }

            .footer {
              margin-top: 25px;
              text-align: center;
              font-size: 9px;
              color: #666;
            }

          </style>
        </head>

        <body>

          <div class="header">

            <div class="school-name">
              OXFORD EMUP SCHOOL
            </div>

            <div class="school-details">
              Kothapeta, Nuzvid - 521201
              <br />

              Phone: 865 623 3675
            </div>

          </div>

          <div class="invoice-title">
            PAYMENT RECEIPT
          </div>

          <table>

            <tr>

              <td>
                <strong>Student Name</strong>
              </td>

              <td>
                ${escapeHtml(name)}
              </td>

              <td>
                <strong>Date</strong>
              </td>

              <td>
                ${escapeHtml(date ?? "")}
              </td>

            </tr>

            <tr>

              <td>
                <strong>Class</strong>
              </td>

              <td>
                ${escapeHtml(className)}
              </td>

              <td>
                <strong>Admission No.</strong>
              </td>

              <td>
                ${escapeHtml(admissionNo)}
              </td>

            </tr>

            <tr>

              <td>
                <strong>Phone</strong>
              </td>

              <td>
                ${escapeHtml(phoneNo)}
              </td>

              <td>
                <strong>Admin Code</strong>
              </td>

              <td>
                ${escapeHtml(adminId ?? "N/A")}
              </td>

            </tr>

          </table>

          <div class="section-title">
            Fee Details
          </div>

          <table>

            <thead>

              <tr>
                <th>Description</th>

                <th class="amount">
                  Amount
                </th>
              </tr>

            </thead>

            <tbody>

              ${
                feeRows ||
                `
                  <tr>
                    <td colspan="2">
                      Fee details not available
                    </td>
                  </tr>
                `
              }

            </tbody>

          </table>

          <div class="summary">

            <div class="summary-row total">

              <span>
                Total Fee
              </span>

              <span>
                ${money(totalFee)}
              </span>

            </div>

          </div>

          <div class="section-title">
            Current Payment Details
          </div>

          <table>

            <thead>

              <tr>

                <th>
                  Description
                </th>

                <th class="amount">
                  Paid
                </th>

              </tr>

            </thead>

            <tbody>

              ${
                paymentRows ||
                `
                  <tr>
                    <td colspan="2">
                      No individual payment details available
                    </td>
                  </tr>
                `
              }

            </tbody>

          </table>

          <div class="summary">

            <div class="summary-row paid">

              <span>
                Total Amount Paid
              </span>

              <span>
                ${money(paidAmount)}
              </span>

            </div>

            ${
              couponDiscount > 0
                ? `
                  <div class="summary-row">

                    <span>
                      Coupon Discount
                    </span>

                    <span>
                      ${money(couponDiscount)}
                    </span>

                  </div>
                `
                : ""
            }

            <div class="summary-row pending">

              <span>
                Pending Amount
              </span>

              <span>
                ${money(remainingAmount)}
              </span>

            </div>

          </div>

          <div class="footer">

            Please pay every month by 5th.

            <br />

            Thank you.

          </div>

        </body>
      </html>
    `;
  };

  // ==========================================
  // DOWNLOAD / SHARE PDF
  // ==========================================

  const downloadInvoice = async () => {
    try {
      setDownloading(true);

      const html = createInvoiceHtml();

      const { uri } =
        await Print.printToFileAsync({
          html,
        });

      const isAvailable =
        await Sharing.isAvailableAsync();

      if (isAvailable) {
        await Sharing.shareAsync(uri, {
          mimeType: "application/pdf",
          dialogTitle: `Invoice - ${admissionNo}`,
          UTI: "com.adobe.pdf",
        });
      } else {
        console.log(
          "PDF created at:",
          uri
        );
      }
    } catch (error) {
      console.error(
        "Error creating invoice:",
        error
      );
    } finally {
      setDownloading(false);
    }
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={
        styles.scrollContent
      }
    >
      <Page>
        <Card style={styles.card}>
          <Card.Content>

            <View style={styles.header}>

              <Text
                style={styles.schoolName}
              >
                OXFORD EMUP SCHOOL
              </Text>

              <Text
                style={styles.address}
              >
                Kothapeta, Nuzvid - 521201
              </Text>

              <Text
                style={styles.address}
              >
                Ph: 865 623 3675
              </Text>

            </View>

            <View
              style={styles.invoiceBadge}
            >
              <Text
                style={
                  styles.invoiceBadgeText
                }
              >
                PAYMENT RECEIPT
              </Text>
            </View>

            {/* STUDENT DETAILS */}

            <View style={styles.infoCard}>

              <View style={styles.infoRow}>

                <Text style={styles.label}>
                  Student
                </Text>

                <Text style={styles.value}>
                  {name}
                </Text>

              </View>

              <View style={styles.infoRow}>

                <Text style={styles.label}>
                  Class
                </Text>

                <Text style={styles.value}>
                  {className}
                </Text>

              </View>

              <View style={styles.infoRow}>

                <Text style={styles.label}>
                  Admission No.
                </Text>

                <Text style={styles.value}>
                  {admissionNo}
                </Text>

              </View>

              <View style={styles.infoRow}>

                <Text style={styles.label}>
                  Date
                </Text>

                <Text style={styles.value}>
                  {date ?? ""}
                </Text>

              </View>

            </View>

            {/* FEE SUMMARY */}

            <Text
              style={styles.sectionTitle}
            >
              Fee Summary
            </Text>

            <View style={styles.summaryBox}>

              <FeeRow
                label="Tuition Fee"
                amount={tuitionFee}
              />

              <FeeRow
                label="Textbook Fee"
                amount={textBookFee}
              />

              <FeeRow
                label="Notebook Fee"
                amount={noteBookFee}
              />

              <FeeRow
                label="Diary"
                amount={diaryAmount}
              />

              <FeeRow
                label="Tie"
                amount={tieAmount}
              />

              <FeeRow
                label="Belt"
                amount={beltAmount}
              />

              {arrearsAmount > 0 && (
                <FeeRow
                  label="Arrears"
                  amount={arrearsAmount}
                />
              )}

              <View style={styles.divider} />

              <View style={styles.summaryRow}>

                <Text
                  style={styles.totalLabel}
                >
                  Total Fee
                </Text>

                <Text
                  style={styles.totalValue}
                >
                  {money(totalFee)}
                </Text>

              </View>

            </View>

            {/* PAYMENT DETAILS */}

            <Text
              style={styles.sectionTitle}
            >
              Payment Details
            </Text>

            <View style={styles.summaryBox}>

              {paidTuitionFee > 0 && (
                <FeeRow
                  label="Tuition Fee"
                  amount={paidTuitionFee}
                />
              )}

              {paidTextBookFee > 0 && (
                <FeeRow
                  label="Textbook Fee"
                  amount={paidTextBookFee}
                />
              )}

              {paidNoteBookFee > 0 && (
                <FeeRow
                  label="Notebook Fee"
                  amount={paidNoteBookFee}
                />
              )}

              {paidDiary > 0 && (
                <FeeRow
                  label="Diary"
                  amount={paidDiary}
                />
              )}

              {paidTie > 0 && (
                <FeeRow
                  label="Tie"
                  amount={paidTie}
                />
              )}

              {paidBelt > 0 && (
                <FeeRow
                  label="Belt"
                  amount={paidBelt}
                />
              )}

              {paidArrears > 0 && (
                <FeeRow
                  label="Arrears"
                  amount={paidArrears}
                />
              )}

              {paidOther > 0 && (
                <FeeRow
                  label="Other"
                  amount={paidOther}
                />
              )}

              <View style={styles.divider} />

              <View style={styles.summaryRow}>

                <Text
                  style={styles.totalLabel}
                >
                  Amount Paid
                </Text>

                <Text
                  style={styles.totalValue}
                >
                  {money(paidAmount)}
                </Text>

              </View>

            </View>

            {/* PENDING */}

            <View
              style={styles.pendingCard}
            >

              <Text
                style={styles.paymentLabel}
              >
                Pending Amount
              </Text>

              <Text
                style={styles.pendingAmount}
              >
                {money(remainingAmount)}
              </Text>

            </View>

            {/* DOWNLOAD */}

            <Button
              mode="contained"
              onPress={downloadInvoice}
              disabled={downloading}
              style={styles.downloadButton}
              contentStyle={
                styles.downloadButtonContent
              }
            >
              {downloading
                ? "GENERATING PDF..."
                : "DOWNLOAD / SHARE INVOICE"}
            </Button>

            {downloading && (
              <ActivityIndicator
                style={styles.loader}
              />
            )}

            <Text style={styles.footer}>
              Please pay every month by 5th
            </Text>

          </Card.Content>
        </Card>
      </Page>
    </ScrollView>
  );
};

// ==========================================
// FEE ROW COMPONENT
// ==========================================

const FeeRow = ({
  label,
  amount,
}: {
  label: string;
  amount: number;
}) => {
  return (
    <View style={stylesForRow.row}>
      <Text style={stylesForRow.label}>
        {label}
      </Text>

      <Text>
        ₹{formatToIndianAmount(amount)}
      </Text>
    </View>
  );
};

const stylesForRow = makeStyles(() => ({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Metrics.x2,
  },

  label: {
    color: Colors.subtext,
  },
}))();

// ==========================================
// STYLES
// ==========================================

const useStyles = makeStyles(() => ({
  scrollContent: {
    paddingBottom: Metrics.x5,
  },

  card: {
    marginBottom: Metrics.x5,
  },

  header: {
    alignItems: "center",
    paddingVertical: Metrics.x3,
  },

  schoolName: {
    fontWeight: "bold",
    fontSize: 21,
    color: Colors.text,
  },

  address: {
    marginTop: Metrics.x1,
    color: Colors.subtext,
  },

  invoiceBadge: {
    alignSelf: "center",
    borderWidth: 1,
    borderColor: Colors.subtext,
    paddingHorizontal: Metrics.x4,
    paddingVertical: Metrics.x1,
    marginVertical: Metrics.x3,
  },

  invoiceBadgeText: {
    fontWeight: "bold",
    letterSpacing: 1,
  },

  infoCard: {
    marginBottom: Metrics.x4,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Metrics.x2,
  },

  label: {
    color: Colors.subtext,
  },

  value: {
    fontWeight: "bold",
    color: Colors.text,
    maxWidth: "60%",
    textAlign: "right",
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: Metrics.x2,
    marginTop: Metrics.x3,
  },

  summaryBox: {
    borderWidth: 1,
    borderColor: Colors.subtext,
    padding: Metrics.x3,
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Metrics.x2,
  },

  divider: {
    height: 1,
    backgroundColor: Colors.subtext,
    marginVertical: Metrics.x2,
  },

  totalLabel: {
    fontWeight: "bold",
    fontSize: 16,
  },

  totalValue: {
    fontWeight: "bold",
    fontSize: 18,
  },

  pendingCard: {
    borderWidth: 1,
    borderColor: Colors.errorBg,
    padding: Metrics.x3,
    marginTop: Metrics.x4,
    marginBottom: Metrics.x4,
  },

  paymentLabel: {
    color: Colors.subtext,
    marginBottom: Metrics.x1,
  },

  pendingAmount: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.error,
  },

  downloadButton: {
    marginTop: Metrics.x2,
  },

  downloadButtonContent: {
    height: 50,
  },

  loader: {
    marginTop: Metrics.x3,
  },

  footer: {
    textAlign: "center",
    color: Colors.subtext,
    marginTop: Metrics.x4,
    fontSize: 12,
  },
}));

export { Invoice };