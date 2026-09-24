import React, {
  useCallback,
  useMemo,
  useState,
} from "react";

import {
  FlatList,
  RefreshControl,
  Text,
  View,
  Platform,
} from "react-native";

import {
  Card,
  Divider,
  Snackbar,
} from "react-native-paper";

import {
  StackActions,
  useNavigation,
} from "@react-navigation/native";

import {
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";

import DropDownPicker from "react-native-dropdown-picker";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as Print from "expo-print";

import {
  ClassList,
} from "../../components";

import {
  reportServices,
  studentServices,
} from "../../services";

import {
  Colors,
  makeStyles,
  Metrics,
} from "../../theme";

import {
  RootStackParamList,
  RootStackScreenNames,
  Student,
} from "../../types";

/* ============================================================
   TYPES
============================================================ */

interface PendingDuesStudent {
  id: string;
  admissionNo: string;
  name: string;
  phone?: string;
  classNumber?: string;
  sectionName?: string;

  totalFee: number;
  unpaidPercentage: number;
  pendingAmount: number;

  pendingTuitionFee: number;
  pendingTextbookFee: number;
  pendingNotebookFee: number;
  pendingDiaryAmount: number;

  tie: {
    amount: number;
    pendingAmount: number;
  };

  belt: {
    amount: number;
    pendingAmount: number;
  };

  arrears: {
    amount: number;
    pendingAmount: number;
  };
}

interface PendingDuesSummary {
  totalStudents: number;
  totalPendingAmount: number;
  totalPayableAmount: number;
  totalClasses: number;
}

interface PendingDuesClassSummary {
  classNumber: string;
  studentCount: number;
  pendingAmount: number;
}

interface PendingDuesResponse {
  filters: {
    classNumber: string | null;
    percentage: number;
  };

  summary: PendingDuesSummary;

  classSummary: PendingDuesClassSummary[];

  students: PendingDuesStudent[];
}

// type PendingDuesClassSummary = {
//   classNumber: string;
//   totalStudents: number;

//   totalFeeAmount: number;
//   totalPaidAmount: number;
//   totalPendingAmount: number;

//   pendingTuitionFee: number;
//   pendingTextbookFee: number;
//   pendingNotebookFee: number;
//   pendingDiaryAmount: number;
//   pendingOtherAmount: number;
// };

// type PendingDuesResponse = {
//   percentage: number;

//   classNumber: string;

//   totalStudents: number;

//   totalPendingAmount: number;

//   classSummary: PendingDuesClassSummary[];

//   students: PendingDuesStudent[];
// };

type ClassOption = {
  label: string;

  value: string;
};

type ClassSummary = {
  classNumber: string;
  totalStudents: number;

  totalFeeAmount: number;
  totalPaidAmount: number;
  totalPendingAmount: number;

  pendingTuitionFee: number;
  pendingTextbookFee: number;
  pendingNotebookFee: number;
  pendingDiaryAmount: number;
  pendingOtherAmount: number;
};

/* ============================================================
   SCREEN
============================================================ */

const PrincipalDefaultersScreen = () => {
  const styles = useStyles();

  /* ==========================================================
     NAVIGATION
  ========================================================== */

  const navigation =
    useNavigation<
      NativeStackNavigationProp<
        RootStackParamList
      >
    >();

  /* ==========================================================
     CLASS
  ========================================================== */

  const [
    selectedClass,
    setSelectedClass,
  ] =
    useState<string | null>("ALL");

  const [
    classDropdownOpen,
    setClassDropdownOpen,
  ] =
    useState(false);

  /* ==========================================================
     PERCENTAGE
  ========================================================== */

  const [
    selectedPercentage,
    setSelectedPercentage,
  ] =
    useState<string>("100");

  const [
    percentageDropdownOpen,
    setPercentageDropdownOpen,
  ] =
    useState(false);

  /* ==========================================================
     RESULT
  ========================================================== */

  const [
    report,
    setReport,
  ] =
    useState<PendingDuesResponse | null>(
      null
    );

  /* ==========================================================
     LOADING
  ========================================================== */

  const [
    loading,
    setLoading,
  ] =
    useState(false);

  /* ==========================================================
     STUDENT LOADING
  ========================================================== */

  const [
    fetchingStudent,
    setFetchingStudent,
  ] =
    useState(false);

  /* ==========================================================
     SNACKBAR
  ========================================================== */

  const [
    snackbarVisible,
    setSnackbarVisible,
  ] =
    useState(false);

  const [
    snackbarMessage,
    setSnackbarMessage,
  ] =
    useState("");

  const [
    snackbarColor,
    setSnackbarColor,
  ] =
    useState(
      Colors.errorBg
    );

  /* ==========================================================
     PERCENTAGES
  ========================================================== */

  const percentages = [
    {
      label: "30% or more unpaid",
      value: "30",
    },

    {
      label: "50% or more unpaid",
      value: "50",
    },

    {
      label: "80% or more unpaid",
      value: "80",
    },

    {
      label: "100% unpaid",
      value: "100",
    },
  ];

  /* ==========================================================
     SHOW SNACKBAR
  ========================================================== */

  const showSnackbar =
    useCallback(
      (
        message: string,
        backgroundColor: string =
          Colors.errorBg
      ) => {
        setSnackbarMessage(
          message
        );

        setSnackbarColor(
          backgroundColor
        );

        setSnackbarVisible(
          true
        );
      },
      []
    );

  /* ==========================================================
     GENERATE REPORT
  ========================================================== */

  const generateReport =
    useCallback(async () => {
      if (loading) {
        return;
      }

      setLoading(true);

      try {
        const data =
          (await reportServices.getPendingDues(
            {
              classNumber:
                selectedClass ===
                "ALL"
                  ? undefined
                  : selectedClass ??
                    undefined,

              perc:
                selectedPercentage,
            }
          )) as unknown as PendingDuesResponse;



        setReport(data);

        if (
          !data.students ||
          !data.students.length
        ) {
          showSnackbar(
            "No students found for the selected criteria",
            Colors.errorBg
          );
        }
      } catch (error: any) {
        console.error(
          "GET PENDING DUES ERROR:",
          error
        );

        setReport(null);

        showSnackbar(
          error?.response?.data
            ?.message ??
            "Unable to generate pending dues report",
          Colors.errorBg
        );
      } finally {
        setLoading(false);
      }
    }, [
      loading,
      selectedClass,
      selectedPercentage,
      showSnackbar,
    ]);

  /* ==========================================================
     REFRESH
  ========================================================== */

  const refresh =
    useCallback(async () => {
      if (!report) {
        return;
      }

      setLoading(true);

      try {
        const data =
          (await reportServices.getPendingDues(
            {
              classNumber:
                selectedClass ===
                "ALL"
                  ? undefined
                  : selectedClass ??
                    undefined,

              perc:
                selectedPercentage,
            }
          )) as unknown as PendingDuesResponse;

        setReport(data);
      } catch (error: any) {
        showSnackbar(
          error?.response?.data
            ?.message ??
            "Unable to refresh report"
        );
      } finally {
        setLoading(false);
      }
    }, [
      report,
      selectedClass,
      selectedPercentage,
      showSnackbar,
    ]);

  /* ==========================================================
     OPEN STUDENT
  ========================================================== */

  const openStudent =
    useCallback(
      async (
        admissionNo: string
      ) => {
        if (fetchingStudent) {
          return;
        }

        setFetchingStudent(true);

        try {
          const student =
            await studentServices.getStudentById(
              {
                admissionNo,
              }
            );

          navigation.dispatch(
            StackActions.push(
              RootStackScreenNames.StudentDetails,
              {
                student:
                  student as Student,
              }
            )
          );
        } catch (error: any) {
          console.error(
            "GET STUDENT ERROR:",
            error
          );

          showSnackbar(
            error?.response?.data
              ?.message ??
              "Unable to fetch student details"
          );
        } finally {
          setFetchingStudent(false);
        }
      },
      [
        fetchingStudent,
        navigation,
        showSnackbar,
      ]
    );

  /* ==========================================================
     FORMAT AMOUNT
  ========================================================== */

  const formatAmount =
    useCallback(
      (amount: number | null | undefined) => {
        return `₹${Number(
          amount || 0
        ).toLocaleString(
          "en-IN"
        )}`;
      },
      []
    );

  /* ==========================================================
     CLASS OPTIONS
  ========================================================== */

  /*
   * We keep "ALL" manually.
   *
   * ClassList is still used below to obtain
   * the school's class selection.
   */

  const percentageLabel =
    useMemo(() => {
      const item =
        percentages.find(
          (item) =>
            item.value ===
            selectedPercentage
        );

      return (
        item?.label ??
        "Select percentage"
      );
    }, [
      selectedPercentage,
    ]);


  /* ==========================================================
     EXPORT HELPERS
  ========================================================== */

  const csvCell = (value: unknown) => {
    const text = value === null || value === undefined ? "" : String(value);
    return `"${text.replace(/"/g, '""')}"`;
  };

  const exportReportAsExcel = useCallback(async () => {
    if (!report?.students?.length) {
      showSnackbar("Generate a report before exporting");
      return;
    }

    try {
      const headers = [
        "Student Name",
        "Phone Number",
        "Admission No",
        "Class",
        "Section",
        "Total Fee",
        "Unpaid Percentage",
        "Pending Amount",
        "Pending Tuition",
        "Pending Textbook",
        "Pending Notebook",
        "Pending Diary",
        "Pending Tie",
        "Pending Belt",
        "Pending Arrears",
      ];

      const rows = report.students.map((student) => [
        student.name,
        student.phone ?? "",
        student.admissionNo,
        student.classNumber ?? "",
        student.sectionName ?? "",
        student.totalFee,
        student.unpaidPercentage,
        student.pendingAmount,
        student.pendingTuitionFee,
        student.pendingTextbookFee,
        student.pendingNotebookFee,
        student.pendingDiaryAmount,
        student.tie?.pendingAmount ?? 0,
        student.belt?.pendingAmount ?? 0,
        student.arrears?.pendingAmount ?? 0,
      ]);

      const csv = [
        headers,
        ...rows,
      ]
        .map((row) => row.map(csvCell).join(","))
        .join("\n");

      if (Platform.OS === "web") {
        // Browsers cannot use expo-file-system.writeAsStringAsync.
        const blob = new Blob(["\uFEFF", csv], {
          type: "text/csv;charset=utf-8;",
        });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = `defaulters_${selectedClass ?? "all"}.csv`;
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        URL.revokeObjectURL(url);
        showSnackbar("CSV downloaded successfully");
        return;
      }

      const fileUri = `${FileSystem.cacheDirectory}defaulters_${selectedClass ?? "all"}.csv`;
      await FileSystem.writeAsStringAsync(fileUri, csv, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: "text/csv",
          dialogTitle: "Export defaulters report",
          UTI: "public.comma-separated-values-text",
        });
      } else {
        showSnackbar("CSV created, but sharing is unavailable");
      }
    } catch (error) {
      console.error("EXPORT CSV ERROR:", error);
      showSnackbar("Unable to export Excel-compatible CSV");
    }
  }, [report, selectedClass, showSnackbar]);

  const exportReportAsPdf = useCallback(async () => {
    if (!report?.students?.length) {
      showSnackbar("Generate a report before exporting");
      return;
    }

    try {
      const rows = report.students
        .map(
          (student) => `
            <tr>
              <td>${student.name ?? ""}</td>
              <td>${student.phone ?? ""}</td>
              <td>${student.admissionNo ?? ""}</td>
              <td>${student.classNumber ?? ""}</td>
              <td>${student.sectionName ?? ""}</td>
              <td>${student.totalFee ?? 0}</td>
              <td>${student.unpaidPercentage ?? 0}%</td>
              <td>${student.pendingAmount ?? 0}</td>
            </tr>
          `
        )
        .join("");

      const html = `
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <style>
              body { font-family: Arial, sans-serif; padding: 18px; }
              h1 { font-size: 20px; }
              p { font-size: 11px; }
              table { width: 100%; border-collapse: collapse; font-size: 9px; }
              th, td { border: 1px solid #777; padding: 5px; text-align: left; }
              th { background: #eeeeee; }
            </style>
          </head>
          <body>
            <h1>Defaulters Report</h1>
            <p>Class: ${selectedClass === "ALL" ? "All Classes" : selectedClass ?? "All Classes"}</p>
            <p>Pending percentage: ${selectedPercentage}% or more</p>
            <p>Total students: ${report.summary?.totalStudents ?? 0} | Total pending: ${report.summary?.totalPendingAmount ?? 0}</p>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Admission No</th>
                  <th>Class</th>
                  <th>Section</th>
                  <th>Total Fee</th>
                  <th>Unpaid %</th>
                  <th>Pending</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
          </body>
        </html>
      `;

      if (Platform.OS === "web") {
        // Expo Print on web may print the current React page instead of the
        // HTML passed to printAsync. Open the report in a separate window
        // so only the generated report is printed.
        const printWindow = window.open(
          "",
          "_blank",
          "width=1200,height=800"
        );

        if (!printWindow) {
          showSnackbar("Please allow pop-ups to print the report");
          return;
        }

        printWindow.document.open();
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.focus();

        // Wait for the report document to render before opening print.
        window.setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 300);

        return;
      }

      const result = await Print.printToFileAsync({ html });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(result.uri, {
          mimeType: "application/pdf",
          dialogTitle: "Export defaulters PDF",
          UTI: "com.adobe.pdf",
        });
      } else {
        showSnackbar("PDF created, but sharing is unavailable");
      }
    } catch (error) {
      console.error("EXPORT PDF ERROR:", error);
      showSnackbar("Unable to export PDF");
    }
  }, [
    report,
    selectedClass,
    selectedPercentage,
    showSnackbar,
  ]);

  /* ==========================================================
     STUDENT CARD
  ========================================================== */

  const renderStudent =
    (
      student: PendingDuesStudent
    ) => {
      return (
        <Card
          key={
            student.admissionNo
          }
          style={
            styles.studentCard
          }
          onPress={() =>
            openStudent(
              student.admissionNo
            )
          }
        >
          <Card.Content>

            {/* ================================================
                HEADER
            ================================================= */}

            <View
              style={
                styles.studentHeader
              }
            >
              <View
                style={
                  styles.studentInfo
                }
              >
                <Text
                  style={
                    styles.studentName
                  }
                >
                  {student.name}
                </Text>

                <Text
                  style={
                    styles.admissionNo
                  }
                >
                  {student.admissionNo}
                </Text>
              </View>

              <View
                style={
                  styles.percentageBadge
                }
              >
                <Text
                  style={
                    styles.percentageText
                  }
                >
                  {student.unpaidPercentage.toFixed(
                    0
                  )}
                  %
                </Text>
              </View>
            </View>

            {/* ================================================
                CLASS / SECTION
            ================================================= */}

            <Text
              style={
                styles.studentClass
              }
            >
              Class{" "}
              {student.classNumber ??
                "-"}
              {"  •  "}
              {student.sectionName ||
                "No Section"}
            </Text>

            <Divider
              style={
                styles.divider
              }
            />

            {/* ================================================
                PENDING
            ================================================= */}

            <View
              style={
                styles.amountRow
              }
            >
              <View>
                <Text
                  style={
                    styles.amountLabel
                  }
                >
                  Total Pending
                </Text>

                <Text
                  style={
                    styles.amountHint
                  }
                >
                  of{" "}
                  {formatAmount(
                    student.totalFee
                  )}
                </Text>
              </View>

              <Text
                style={
                  styles.pendingAmount
                }
              >
                {formatAmount(
                  student.pendingAmount
                )}
              </Text>
            </View>

            {/* ================================================
                BREAKDOWN
            ================================================= */}

            <View
              style={
                styles.breakdown
              }
            >
              <Text
                style={
                  styles.breakdownTitle
                }
              >
                Pending breakdown
              </Text>

              <View
                style={
                  styles.breakdownRow
                }
              >
                <Text
                  style={
                    styles.breakdownLabel
                  }
                >
                  Tuition
                </Text>

                <Text
                  style={
                    styles.breakdownValue
                  }
                >
                  {formatAmount(
                    student.pendingTuitionFee
                  )}
                </Text>
              </View>

              <View
                style={
                  styles.breakdownRow
                }
              >
                <Text
                  style={
                    styles.breakdownLabel
                  }
                >
                  Textbook
                </Text>

                <Text
                  style={
                    styles.breakdownValue
                  }
                >
                  {formatAmount(
                    student.pendingTextbookFee
                  )}
                </Text>
              </View>

              <View
                style={
                  styles.breakdownRow
                }
              >
                <Text
                  style={
                    styles.breakdownLabel
                  }
                >
                  Notebook
                </Text>

                <Text
                  style={
                    styles.breakdownValue
                  }
                >
                  {formatAmount(
                    student.pendingNotebookFee
                  )}
                </Text>
              </View>

              <View
                style={
                  styles.breakdownRow
                }
              >
                <Text
                  style={
                    styles.breakdownLabel
                  }
                >
                  Diary
                </Text>

                <Text
                  style={
                    styles.breakdownValue
                  }
                >
                  {formatAmount(
                    student.pendingDiaryAmount
                  )}
                </Text>
              </View>

              <View
                style={
                  styles.breakdownRow
                }
              >
                <Text
                  style={
                    styles.breakdownLabel
                  }
                >
                  Tie / Belt / Arrears
                </Text>

                <Text
                  style={
                    styles.breakdownValue
                  }
                >
                  {formatAmount(
                    Number(
                      student.tie
                        ?.pendingAmount ??
                        0
                    ) +
                      Number(
                        student.belt
                          ?.pendingAmount ??
                          0
                      ) +
                      Number(
                        student.arrears
                          ?.pendingAmount ??
                          0
                      )
                  )}
                </Text>
              </View>
            </View>

            {/* ================================================
                ACTION
            ================================================= */}

            <Text
              style={
                styles.viewStudent
              }
            >
              View Student Details →
            </Text>

          </Card.Content>
        </Card>
      );
    };

  /* ==========================================================
     CLASS SUMMARY
  ========================================================== */

  const renderClassSummary = ({
  item,
}: {
  item: PendingDuesClassSummary;
}) => {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.classNumber}>
        Class {item.classNumber}
      </Text>

      <Text style={styles.studentCount}>
        {item.studentCount}
      </Text>

      <Text style={styles.pendingAmount}>
        {formatAmount(item.pendingAmount)}
      </Text>
    </View>
  );
};


  /* ==========================================================
     HEADER
  ========================================================== */

  const renderHeader = () => (
    <>
      <View style={styles.header}>
        <Text style={styles.title}>Defaulters</Text>
        <Text style={styles.subtitle}>
          Students with outstanding fee payments
        </Text>
      </View>

      <Card style={styles.filterCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Report Filters</Text>

          <Text style={styles.fieldLabel}>Class</Text>
          <View style={styles.classPickerWrapper}>
            <DropDownPicker
              open={classDropdownOpen}
              value={selectedClass}
              items={[
                { label: "All Classes", value: "ALL" },
                ...(report?.classSummary ?? []).map((item) => ({
                  label: `Class ${item.classNumber}`,
                  value: String(item.classNumber),
                })),
              ]}
              setOpen={setClassDropdownOpen}
              setValue={setSelectedClass}
              placeholder="Select class"
              listMode="SCROLLVIEW"
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownContainer}
              zIndex={3000}
              zIndexInverse={1000}
              onOpen={() => setPercentageDropdownOpen(false)}
            />
          </View>

          <View style={styles.classListContainer}>
            <ClassList
              selectedClass={selectedClass === "ALL" ? null : selectedClass}
              setSelectedClass={(value) =>
                setSelectedClass(value || "ALL")
              }
              zIndex={2000}
            />
          </View>

          <Text style={styles.fieldLabel}>Pending Percentage</Text>
          <DropDownPicker
            open={percentageDropdownOpen}
            value={selectedPercentage}
            items={percentages}
            setOpen={setPercentageDropdownOpen}
            setValue={setSelectedPercentage}
            placeholder="Select percentage"
            listMode="SCROLLVIEW"
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropdownContainer}
            zIndex={1000}
            zIndexInverse={3000}
            onOpen={() => setClassDropdownOpen(false)}
          />

          <View style={styles.filterSummary}>
            <Text style={styles.filterSummaryText}>
              {selectedClass === "ALL" ? "All Classes" : `Class ${selectedClass}`}
            </Text>
            <Text style={styles.filterSummaryText}>{percentageLabel}</Text>
          </View>

          <Card style={styles.generateCard} onPress={generateReport}>
            <Card.Content>
              <Text style={styles.generateText}>
                {loading ? "Generating..." : "GENERATE REPORT"}
              </Text>
            </Card.Content>
          </Card>
        </Card.Content>
      </Card>

      {report && (
        <>
          <View style={styles.summaryCards}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryCardLabel}>Total Students</Text>
              <Text style={styles.summaryCardValue}>
                {report.summary?.totalStudents ?? 0}
              </Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryCardLabel}>Total Pending Amount</Text>
              <Text style={styles.summaryCardValue}>
                {formatAmount(report.summary?.totalPendingAmount)}
              </Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryCardLabel}>Total Classes</Text>
              <Text style={styles.summaryCardValue}>
                {report.summary?.totalClasses ?? 0}
              </Text>
            </View>
          </View>

          <Card style={styles.exportCard}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Download Report</Text>
              <Text style={styles.exportHint}>
                Includes student name, phone number, admission number, class,
                section, total fee and pending fee details.
              </Text>
              <Card style={styles.exportButton} onPress={exportReportAsExcel}>
                <Card.Content>
                  <Text style={styles.exportButtonText}>
                    DOWNLOAD EXCEL (CSV)
                  </Text>
                </Card.Content>
              </Card>
              <Card style={styles.exportButton} onPress={exportReportAsPdf}>
                <Card.Content>
                  <Text style={styles.exportButtonText}>
                    DOWNLOAD PDF
                  </Text>
                </Card.Content>
              </Card>
            </Card.Content>
          </Card>

          <Card style={styles.classSummaryCard}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Class-wise Summary</Text>
              {(report.classSummary ?? []).map((item) => (
                <View key={item.classNumber} style={styles.summaryRow}>
                  <Text style={styles.classNumber}>
                    Class {item.classNumber}
                  </Text>
                  <Text style={styles.studentCount}>{item.studentCount}</Text>
                  <Text style={styles.pendingAmount}>
                    {formatAmount(item.pendingAmount)}
                  </Text>
                </View>
              ))}
            </Card.Content>
          </Card>
        </>
      )}
    </>
  );

  /* ==========================================================
     LIST
  ========================================================== */

  return (
    <View
      style={
        styles.container
      }
    >

      <FlatList
        data={
          report?.students ??
          []
        }

        keyExtractor={(
          item
        ) =>
          item.admissionNo
        }

        renderItem={({
          item,
        }) =>
          renderStudent(
            item
          )
        }

        ListHeaderComponent={
          renderHeader
        }

        ListEmptyComponent={
          report &&
          !loading ? (
            <View
              style={
                styles.empty
              }
            >
              <Text
                style={
                  styles.emptyIcon
                }
              >
                ✓
              </Text>

              <Text
                style={
                  styles.emptyTitle
                }
              >
                No Defaulters
              </Text>

              <Text
                style={
                  styles.emptyText
                }
              >
                No students match the
                selected pending
                percentage.
              </Text>
            </View>
          ) : null
        }

        refreshControl={
          <RefreshControl
            refreshing={
              loading ||
              fetchingStudent
            }
            onRefresh={
              refresh
            }
          />
        }

        contentContainerStyle={
          styles.content
        }

        showsVerticalScrollIndicator={
          false
        }

        keyboardShouldPersistTaps="handled"
      />

      

      {/* ======================================================
          SNACKBAR
      ====================================================== */}

      <Snackbar
        visible={
          snackbarVisible
        }

        onDismiss={() =>
          setSnackbarVisible(
            false
          )
        }

        duration={3000}

        style={{
          backgroundColor:
            snackbarColor,
        }}
      >
        {
          snackbarMessage
        }
      </Snackbar>

    </View>
  );
};

/* ============================================================
   STYLES
============================================================ */

const useStyles =
  makeStyles(() => ({
    /* ========================================================
       CONTAINER
    ======================================================== */

    container: {
      flex: 1,

      backgroundColor:
        "#F7F8FC",
    },

    content: {
      padding:
        Metrics.x4,

      paddingBottom:
        Metrics.x6,

      flexGrow: 1,
    },

    /* ========================================================
       HEADER
    ======================================================== */

    header: {
      marginBottom:
        Metrics.x4,
    },

    title: {
      fontSize: 28,

      fontWeight:
        "800",

      color:
        "#171717",
    },

    subtitle: {
      fontSize: 13,

      color:
        Colors.subtext,

      marginTop:
        Metrics.x1,

      lineHeight: 19,
    },

    /* ========================================================
       FILTER
    ======================================================== */

    filterCard: {
      marginBottom:
        Metrics.x4,

      borderRadius:
        16,

      backgroundColor:
        "#FFFFFF",
    },

    sectionTitle: {
      fontSize: 17,

      fontWeight:
        "800",

      color:
        "#171717",

      marginBottom:
        Metrics.x3,
    },

    fieldLabel: {
      fontSize: 12,

      fontWeight:
        "700",

      color:
        "#454545",

      marginBottom:
        Metrics.x1,
    },

    classPickerWrapper: {
      marginBottom:
        Metrics.x3,

      zIndex: 3000,
    },

    classListContainer: {
      marginBottom:
        Metrics.x4,

      zIndex: 2000,
    },

    dropdown: {
      minHeight: 50,

      borderColor:
        "#E1E3E8",

      backgroundColor:
        "#FFFFFF",

      borderRadius:
        12,
    },

    dropdownContainer: {
      borderColor:
        "#E1E3E8",

      borderRadius:
        12,
    },

    filterSummary: {
      marginTop:
        Metrics.x3,

      padding:
        Metrics.x3,

      borderRadius:
        12,

      backgroundColor:
        Colors.brandPrimaryBg,

      flexDirection:
        "row",

      justifyContent:
        "space-between",

      alignItems:
        "center",
    },

    filterSummaryText: {
      fontSize: 12,

      fontWeight:
        "700",

      color:
        Colors.brandPrimary,
    },

    generateCard: {
      marginTop:
        Metrics.x4,

      borderRadius:
        12,

      backgroundColor:
        Colors.brandPrimary,
    },

    generateText: {
      textAlign:
        "center",

      fontSize: 14,

      fontWeight:
        "800",

      color:
        "#FFFFFF",
    },

    /* ========================================================
       SUMMARY
    ======================================================== */

    summaryCards: {
      gap: Metrics.x2,
      marginBottom: Metrics.x3,
    },

    summaryCard: {
      backgroundColor: "#FFFFFF",
      borderRadius: 12,
      padding: Metrics.x3,
      marginBottom: Metrics.x2,
    },

    summaryCardLabel: {
      fontSize: 12,
      color: Colors.subtext,
      fontWeight: "700",
    },

    summaryCardValue: {
      fontSize: 22,
      color: "#171717",
      fontWeight: "800",
      marginTop: Metrics.x1,
    },

    exportCard: {
      marginBottom: Metrics.x3,
      borderRadius: 12,
      backgroundColor: "#FFFFFF",
    },

    exportHint: {
      fontSize: 12,
      color: Colors.subtext,
      marginBottom: Metrics.x2,
    },

    exportButton: {
      marginTop: Metrics.x2,
      borderRadius: 10,
      backgroundColor: Colors.brandPrimary,
    },

    exportButtonText: {
      color: "#FFFFFF",
      textAlign: "center",
      fontWeight: "800",
      fontSize: 12,
    },

    classSummaryCard: {
      marginBottom: Metrics.x3,
      borderRadius: 12,
      backgroundColor: "#FFFFFF",
    },

    summaryHeader: {
      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      marginBottom:
        Metrics.x3,
    },

    summaryFilter: {
      fontSize: 11,

      fontWeight:
        "700",

      color:
        Colors.brandPrimary,

      backgroundColor:
        Colors.brandPrimaryBg,

      paddingHorizontal:
        Metrics.x2,

      paddingVertical:
        Metrics.x1,

      borderRadius:
        8,
    },

    

    

    /* ========================================================
       CLASS SUMMARY
    ======================================================== */

    

    classNumber: {
      fontSize: 13,
      fontWeight: "700",
      color: "#252525",
      flex: 1,
    },

    summaryRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  paddingVertical: 6,
},

paidAmount: {
  fontSize: 14,
  fontWeight: "700",
  color: "#16803C",
},

classSummaryTitle: {
  fontSize: 17,
  fontWeight: "800",
  color: "#171717",
  marginBottom: 4,
},

classSummaryStudents: {
  fontSize: 12,
  color: Colors.subtext,
  marginBottom: Metrics.x3,
},

    classSummary: {
      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      paddingVertical:
        Metrics.x3,

      borderBottomWidth:
        1,

      borderBottomColor:
        "#ECEEF3",
    },

    classSummaryInfo: {
      flex: 1,
    },

    

    classSummaryAmount: {
      fontSize: 14,

      fontWeight:
        "800",

      color:
        Colors.brandPrimary,
    },

    /* ========================================================
       STUDENTS
    ======================================================== */

    studentsHeader: {
      flexDirection:
        "row",

      justifyContent:
        "space-between",

      alignItems:
        "center",

      marginBottom:
        Metrics.x3,
    },

    studentCount: {
      fontSize: 11,

      color:
        Colors.subtext,
    },

    studentCard: {
      marginBottom:
        Metrics.x3,

      borderRadius:
        16,

      backgroundColor:
        "#FFFFFF",
    },

    studentHeader: {
      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",
    },

    studentInfo: {
      flex: 1,
    },

    studentName: {
      fontSize: 17,

      fontWeight:
        "800",

      color:
        "#171717",
    },

    admissionNo: {
      fontSize: 11,

      color:
        Colors.subtext,

      marginTop:
        3,

      fontWeight:
        "600",
    },

    percentageBadge: {
      minWidth: 48,

      paddingHorizontal:
        Metrics.x2,

      paddingVertical:
        Metrics.x1,

      borderRadius:
        10,

      alignItems:
        "center",

      backgroundColor:
        Colors.brandPrimaryBg,
    },

    percentageText: {
      fontSize: 12,

      fontWeight:
        "800",

      color:
        Colors.brandPrimary,
    },

    studentClass: {
      fontSize: 11,

      color:
        Colors.subtext,

      marginTop:
        Metrics.x2,
    },

    divider: {
      marginVertical:
        Metrics.x3,
    },

    /* ========================================================
       AMOUNT
    ======================================================== */

    amountRow: {
      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",
    },

    amountLabel: {
      fontSize: 13,

      fontWeight:
        "700",

      color:
        "#252525",
    },

    amountHint: {
      fontSize: 10,

      color:
        Colors.subtext,

      marginTop:
        3,
    },

    pendingAmount: {
      fontSize: 20,

      fontWeight:
        "800",

      color:
        Colors.brandPrimary,
    },

    /* ========================================================
       BREAKDOWN
    ======================================================== */

    breakdown: {
      marginTop:
        Metrics.x3,

      padding:
        Metrics.x3,

      borderRadius:
        12,

      backgroundColor:
        "#F7F8FC",
    },

    breakdownTitle: {
      fontSize: 11,

      fontWeight:
        "800",

      color:
        "#454545",

      marginBottom:
        Metrics.x2,
    },

    breakdownRow: {
      flexDirection:
        "row",

      justifyContent:
        "space-between",

      alignItems:
        "center",

      paddingVertical:
        4,
    },

    breakdownLabel: {
      fontSize: 11,

      color:
        Colors.subtext,
    },

    breakdownValue: {
      fontSize: 11,

      fontWeight:
        "700",

      color:
        "#252525",
    },

    viewStudent: {
      marginTop:
        Metrics.x3,

      fontSize: 12,

      fontWeight:
        "800",

      color:
        Colors.brandPrimary,

      textAlign:
        "right",
    },

    /* ========================================================
       EMPTY
    ======================================================== */

    empty: {
      alignItems:
        "center",

      justifyContent:
        "center",

      paddingVertical:
        Metrics.x6,
    },

    emptyIcon: {
      width: 54,

      height: 54,

      borderRadius: 27,

      textAlign:
        "center",

      textAlignVertical:
        "center",

      backgroundColor:
        Colors.brandPrimaryBg,

      color:
        Colors.brandPrimary,

      fontSize: 28,

      fontWeight:
        "800",

      overflow:
        "hidden",

      marginBottom:
        Metrics.x3,
    },

    emptyTitle: {
      fontSize: 17,

      fontWeight:
        "800",

      color:
        "#171717",
    },

    emptyText: {
      fontSize: 12,

      color:
        Colors.subtext,

      textAlign:
        "center",

      marginTop:
        Metrics.x1,

      maxWidth: 280,

      lineHeight: 18,
    },
  }));

export {
  PrincipalDefaultersScreen,
};