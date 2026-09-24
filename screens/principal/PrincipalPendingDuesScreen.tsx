import React, {
  useCallback,
  useMemo,
  useState,
  useEffect,
} from "react";

import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  Button,
  Card,
  Divider,
  Snackbar,
  TouchableRipple,
} from "react-native-paper";

import DropDownPicker from "react-native-dropdown-picker";

import {
  StackActions,
  useNavigation,
} from "@react-navigation/native";

import {
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";

import * as Print from "expo-print";

import * as Sharing from "expo-sharing";

import * as FileSystem from "expo-file-system";

import * as XLSX from "xlsx";

import {
  ClassList,
} from "../../components";

import {
  reportServices,
  studentServices,
  PendingDuesResponse,
  PendingDuesStudent,
    PendingDuesClassSummary,
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

type PercentageOption = {
  label: string;
  value: string;
};

type ClassOption = {
  label: string;
  value: string;
};


/* ============================================================
   HELPERS
============================================================ */

const formatAmount = (
  value: number | string | null | undefined
) => {

  const number =
    Number(value ?? 0);

  if (
    !Number.isFinite(number)
  ) {
    return "₹0";
  }

  return `₹${number.toLocaleString(
    "en-IN"
  )}`;
};


const escapeHtml = (
  value: unknown
) => {

  return String(
    value ?? ""
  )
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );
};


const getClassName = (
  value: string
) => {

  if (
    !value
  ) {
    return "Unknown";
  }

  return value;
};




/* ============================================================
   SCREEN
============================================================ */

const PrincipalPendingDuesScreen =
  () => {

    const styles =
      useStyles();

    const navigation =
      useNavigation<
        NativeStackNavigationProp<RootStackParamList>
      >();


    /* ========================================================
       FILTERS
    ======================================================== */

    const [
      selectedClass,
      setSelectedClass,
    ] =
      useState<string>("ALL");


    const [
      selectedPercentage,
      setSelectedPercentage,
    ] =
      useState<string>("100");


    const [
      classDropdownOpen,
      setClassDropdownOpen,
    ] =
      useState(false);


    const [
      percentageDropdownOpen,
      setPercentageDropdownOpen,
    ] =
      useState(false);


    /* ========================================================
       REPORT
    ======================================================== */

    const [
      report,
      setReport,
    ] =
      useState<PendingDuesResponse | null>(
        null
      );


    const [
      loading,
      setLoading,
    ] =
      useState(false);

    const [
      fetchingStudent,
      setFetchingStudent,
    ] = useState(false);


    const [
      refreshing,
      setRefreshing,
    ] =
      useState(false);


    /* ========================================================
       EXPORT STATE
    ======================================================== */

    const [
      exporting,
      setExporting,
    ] =
      useState(false);


    /* ========================================================
       SNACKBAR
    ======================================================== */

    const [
      snackbarVisible,
      setSnackbarVisible,
    ] =
      useState(false);


    const [
      snackbarText,
      setSnackbarText,
    ] =
      useState("");


    const [
      snackbarColor,
      setSnackbarColor,
    ] =
      useState(
        "#252525"
      );


    /* ========================================================
       OPTIONS
    ======================================================== */

    

    const percentageOptions:
      PercentageOption[] =
      [
        {
          label: "30% Pending or More",
          value: "30",
        },

        {
          label: "50% Pending or More",
          value: "50",
        },

        {
          label: "80% Pending or More",
          value: "80",
        },

        {
          label: "100% Pending",
          value: "100",
        },
      ];
      


    /* ========================================================
       CLASS OPTIONS
       
       We derive available classes from the generated report.
       
       This means the first request can be ALL CLASSES.
    ======================================================== */


    const [classOptions, setClassOptions] =
  useState<ClassOption[]>([
    {
      label: "All Classes",
      value: "ALL",
    },
  ]);

  const updateClassOptions = (
  data: PendingDuesResponse
) => {
  const values =
    data.classSummary?.map((item) =>
      String(item.classNumber)
    ) ?? [];

  const unique = Array.from(
    new Set(values)
  );

  const options: ClassOption[] = [
    {
      label: "All Classes",
      value: "ALL",
    },
    ...unique.map((value) => ({
      label: `Class ${value}`,
      value,
    })),
  ];


  setClassOptions(options);
};


useEffect(() => {
  const loadInitialReport = async () => {
    try {
      setLoading(true);

      const data =
        await reportServices.getPendingDues({
          classNumber: undefined,
          perc: selectedPercentage,
        });

      setReport(data);

      updateClassOptions(data);

    } catch (error: any) {
      console.error(
        "INITIAL PENDING DUES ERROR:",
        error
      );

      showMessage(
        error?.response?.data?.message ??
          "Unable to load class options.",
        Colors.errorBg
      );
    } finally {
      setLoading(false);
    }
  };

  loadInitialReport();
}, []);


    /* ========================================================
       SNACKBAR
    ======================================================== */

    const showMessage = (
      message: string,
      color = "#252525"
    ) => {

      setSnackbarText(
        message
      );

      setSnackbarColor(
        color
      );

      setSnackbarVisible(
        true
      );

    };


    /* ========================================================
       GENERATE
    ======================================================== */

    const generateReport = async () => {
  if (loading) {
    return;
  }

  setLoading(true);

  try {
    const data =
      await reportServices.getPendingDues({
        classNumber:
          selectedClass === "ALL"
            ? undefined
            : selectedClass,
        perc: selectedPercentage,
      });

    setReport(data);

    updateClassOptions(data);

    if (!data.students.length) {
      showMessage(
        "No pending dues found.",
        Colors.errorBg
      );
    } else {
      showMessage(
        `${data.summary.totalStudents} students found.`,
        Colors.successBg
      );
    }
  } catch (error: any) {
    console.error(
      "PENDING DUES ERROR:",
      error
    );

    setReport(null);

    showMessage(
      error?.response?.data?.message ??
        "Unable to generate pending dues report.",
      Colors.errorBg
    );
  } finally {
    setLoading(false);
  }
};


    /* ========================================================
       REFRESH
    ======================================================== */

    const refreshReport = async () => {
  if (!report) {
    return;
  }

  setRefreshing(true);

  try {
    const data =
      await reportServices.getPendingDues({
        classNumber:
          selectedClass === "ALL"
            ? undefined
            : selectedClass,
        perc: selectedPercentage,
      });

    setReport(data);

    updateClassOptions(data);
  } catch (error: any) {
    showMessage(
      error?.response?.data?.message ??
        "Unable to refresh report.",
      Colors.errorBg
    );
  } finally {
    setRefreshing(false);
  }
};


    const openStudent = useCallback(
      async (admissionNo: string) => {
        if (fetchingStudent) return;
        setFetchingStudent(true);
        try {
          const student = await studentServices.getStudentById({
            admissionNo,
          });
          navigation.dispatch(
            StackActions.push(
              RootStackScreenNames.StudentDetails,
              { student: student as Student }
            )
          );
        } catch (error: any) {
          showMessage(
            error?.response?.data?.message ??
              "Unable to fetch student details",
            Colors.errorBg
          );
        } finally {
          setFetchingStudent(false);
        }
      },
      [fetchingStudent, navigation]
    );

    /* ========================================================
       FILTERED STUDENTS
    ======================================================== */

    const students =
      report?.students ??
      [];


    /* ========================================================
       CLASS GROUPING
    ======================================================== */

    const groupedStudents =
      useMemo(() => {

        const groups =
          new Map<
            string,
            PendingDuesStudent[]
          >();


        students.forEach(
          (student) => {

            const key =
              String(
                student.classNumber
              );


            if (
              !groups.has(key)
            ) {

              groups.set(
                key,
                []
              );

            }


            groups
              .get(key)!
              .push(
                student
              );

          }
        );


        return Array.from(
          groups.entries()
        );

      }, [students]);


    /* ========================================================
       HTML ROWS
    ======================================================== */

    const createStudentRows =
      (
        data: PendingDuesStudent[]
      ) => {

        return data
          .map(
            (student) => {

              return `
                <tr>
                  <td>${escapeHtml(
                    student.admissionNo
                  )}</td>

                  <td>${escapeHtml(
                    student.name
                  )}</td>

                  <td>${escapeHtml(
                    student.classNumber
                  )}</td>

                  <td>${escapeHtml(
                    student.sectionName
                  )}</td>

                  <td>
                    ${Number(
                      student.unpaidPercentage
                    ).toFixed(2)}%
                  </td>

                  <td>
                    ${formatAmount(
                      student.totalFee
                    )}
                  </td>

                  <td>
                    ${formatAmount(
                      student.pendingAmount
                    )}
                  </td>

                  <td>
                    ${formatAmount(
                      student.pendingTuitionFee
                    )}
                  </td>

                  <td>
                    ${formatAmount(
                      student.pendingTextbookFee
                    )}
                  </td>

                  <td>
                    ${formatAmount(
                      student.pendingNotebookFee
                    )}
                  </td>

                  <td>
                    ${formatAmount(
                      student.pendingDiaryAmount
                    )}
                  </td>

                  <td>
                    ${formatAmount(
                      student.tie.pendingAmount
                    )}
                  </td>

                  <td>
                    ${formatAmount(
                      student.belt.pendingAmount
                    )}
                  </td>

                  <td>
                    ${formatAmount(
                      student.arrears.pendingAmount
                    )}
                  </td>
                </tr>
              `;

            }
          )
          .join("");
      };


    /* ========================================================
       BUILD PDF HTML
    ======================================================== */

    const buildPdfHtml =
      () => {

        if (!report) {
          return "";
        }


        const generatedAt =
          new Date().toLocaleString(
            "en-IN"
          );


        const rows =
          createStudentRows(
            report.students
          );


        const classRows =
          report.classSummary
            .map(
              (item) => `
                <tr>
                  <td>
                    Class ${escapeHtml(
                      item.classNumber
                    )}
                  </td>

                  <td>
                    ${item.studentCount}
                  </td>

                  <td>
                    ${formatAmount(
                      item.pendingAmount
                    )}
                  </td>
                </tr>
              `
            )
            .join("");


        return `
<!DOCTYPE html>

<html>

<head>

<meta charset="utf-8" />

<title>Pending Dues Report</title>

<style>

@page {
  size: A4 landscape;
  margin: 20px;
}

body {
  font-family: Arial, sans-serif;
  color: #171717;
  margin: 0;
}

.header {
  border-bottom: 2px solid #333;
  padding-bottom: 12px;
  margin-bottom: 18px;
}

.title {
  font-size: 24px;
  font-weight: bold;
}

.subtitle {
  font-size: 13px;
  color: #666;
  margin-top: 5px;
}

.meta {
  margin-top: 10px;
  font-size: 11px;
  color: #555;
}

.summary {
  display: table;
  width: 100%;
  margin-bottom: 20px;
}

.summaryBox {
  display: table-cell;
  width: 25%;
  padding: 12px;
  border: 1px solid #ddd;
  background: #f7f8fc;
}

.summaryLabel {
  font-size: 10px;
  color: #666;
}

.summaryValue {
  font-size: 18px;
  font-weight: bold;
  margin-top: 5px;
}

h2 {
  font-size: 16px;
  margin-top: 20px;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

th {
  background: #eeeeee;
  font-size: 9px;
  padding: 7px;
  border: 1px solid #ccc;
  text-align: left;
}

td {
  font-size: 9px;
  padding: 6px;
  border: 1px solid #ddd;
}

.total {
  font-weight: bold;
}

.footer {
  margin-top: 25px;
  font-size: 9px;
  color: #777;
}

</style>

</head>

<body>

<div class="header">

  <div class="title">
    Pending Dues Report
  </div>

  <div class="subtitle">
    School Fee Pending Report
  </div>

  <div class="meta">
    Pending threshold:
    ${escapeHtml(
      selectedPercentage
    )}%
    &nbsp;&nbsp;|&nbsp;&nbsp;
    Class:
    ${
      selectedClass === "ALL"
        ? "All Classes"
        : `Class ${escapeHtml(
            selectedClass
          )}`
    }
    &nbsp;&nbsp;|&nbsp;&nbsp;
    Generated:
    ${generatedAt}
  </div>

</div>


<div class="summary">

  <div class="summaryBox">

    <div class="summaryLabel">
      Students
    </div>

    <div class="summaryValue">
      ${report.summary.totalStudents}
    </div>

  </div>


  <div class="summaryBox">

    <div class="summaryLabel">
      Classes
    </div>

    <div class="summaryValue">
      ${report.summary.totalClasses}
    </div>

  </div>


  <div class="summaryBox">

    <div class="summaryLabel">
      Total Payable
    </div>

    <div class="summaryValue">
      ${formatAmount(
        report.summary.totalPayableAmount
      )}
    </div>

  </div>


  <div class="summaryBox">

    <div class="summaryLabel">
      Total Pending
    </div>

    <div class="summaryValue">
      ${formatAmount(
        report.summary.totalPendingAmount
      )}
    </div>

  </div>

</div>


<h2>
  Class Summary
</h2>

<table>

<thead>

<tr>
  <th>Class</th>
  <th>Students</th>
  <th>Pending Amount</th>
</tr>

</thead>

<tbody>

${classRows}

</tbody>

</table>


<h2>
  Student Pending Dues
</h2>

<table>

<thead>

<tr>

<th>Admission No</th>
<th>Name</th>
<th>Class</th>
<th>Section</th>
<th>Pending %</th>
<th>Total Fee</th>
<th>Pending</th>
<th>Tuition</th>
<th>Textbook</th>
<th>Notebook</th>
<th>Diary</th>
<th>Tie</th>
<th>Belt</th>
<th>Arrears</th>

</tr>

</thead>

<tbody>

${rows}

</tbody>

</table>


<div class="footer">

  Generated by School Administration System.

</div>

</body>

</html>
        `;

      };


    /* ========================================================
       DOWNLOAD PDF
    ======================================================== */

    const downloadPdf =
      async () => {

        if (
          !report ||
          !report.students.length
        ) {

          showMessage(
            "Generate a report first.",
            Colors.errorBg
          );

          return;

        }


        try {

          setExporting(
            true
          );


          const html =
            buildPdfHtml();


          const result =
            await Print.printToFileAsync(
              {
                html,

                base64:
                  false,

              }
            );


          if (
            !result.uri
          ) {

            throw new Error(
              "PDF could not be created."
            );

          }


          if (
            await Sharing.isAvailableAsync()
          ) {

            await Sharing.shareAsync(
              result.uri,
              {
                mimeType:
                  "application/pdf",

                dialogTitle:
                  "Download Pending Dues PDF",

                UTI:
                  "com.adobe.pdf",
              }
            );

          } else {

            showMessage(
              "PDF created successfully.",
              Colors.successBg
            );

          }

        } catch (
          error: any
        ) {

          console.error(
            "PDF EXPORT ERROR:",
            error
          );

          showMessage(
            error?.message ??
              "Unable to create PDF.",
            Colors.errorBg
          );

        } finally {

          setExporting(
            false
          );

        }

      };


    /* ========================================================
       DOWNLOAD EXCEL
    ======================================================== */

    const downloadExcel =
      async () => {

        if (
          !report ||
          !report.students.length
        ) {

          showMessage(
            "Generate a report first.",
            Colors.errorBg
          );

          return;

        }


        try {

          setExporting(
            true
          );


          /* ==================================================
             STUDENT SHEET
          ================================================== */

          const studentRows =
            report.students.map(
              (student) => ({

                "Admission No":
                  student.admissionNo,

                "Student Name":
                  student.name,

                "Class":
                  student.classNumber,

                "Section":
                  student.sectionName,

                "Pending %":
                  Number(
                    student.unpaidPercentage
                  ).toFixed(2),

                "Total Fee":
                  Number(
                    student.totalFee
                  ),

                "Pending Amount":
                  Number(
                    student.pendingAmount
                  ),

                "Tuition Fee":
                  Number(
                    student.pendingTuitionFee
                  ),

                "Textbook":
                  Number(
                    student.pendingTextbookFee
                  ),

                "Notebook":
                  Number(
                    student.pendingNotebookFee
                  ),

                "Diary":
                  Number(
                    student.pendingDiaryAmount
                  ),

                "Tie":
                  Number(
                    student.tie.pendingAmount
                  ),

                "Belt":
                  Number(
                    student.belt.pendingAmount
                  ),

                "Arrears":
                  Number(
                    student.arrears.pendingAmount
                  ),

              })
            );


          const studentSheet =
            XLSX.utils.json_to_sheet(
              studentRows
            );


          /* ==================================================
             CLASS SUMMARY SHEET
          ================================================== */

          const classRows =
            report.classSummary.map(
              (item) => ({

                "Class":
                  item.classNumber,

                "Students":
                  item.studentCount,

                "Pending Amount":
                  Number(
                    item.pendingAmount
                  ),

              })
            );


          const classSheet =
            XLSX.utils.json_to_sheet(
              classRows
            );


          /* ==================================================
             SUMMARY SHEET
          ================================================== */

          const summarySheet =
            XLSX.utils.json_to_sheet(
              [
                {
                  "Report":
                    "Pending Dues",

                  "Percentage":
                    `${selectedPercentage}%`,

                  "Class":
                    selectedClass ===
                    "ALL"
                      ? "All Classes"
                      : selectedClass,

                  "Total Students":
                    report.summary
                      .totalStudents,

                  "Total Classes":
                    report.summary
                      .totalClasses,

                  "Total Payable":
                    report.summary
                      .totalPayableAmount,

                  "Total Pending":
                    report.summary
                      .totalPendingAmount,

                },
              ]
            );


          /* ==================================================
             WORKBOOK
          ================================================== */

          const workbook =
            XLSX.utils.book_new();


          XLSX.utils.book_append_sheet(
            workbook,
            summarySheet,
            "Summary"
          );


          XLSX.utils.book_append_sheet(
            workbook,
            classSheet,
            "Class Summary"
          );


          XLSX.utils.book_append_sheet(
            workbook,
            studentSheet,
            "Students"
          );


          /* ==================================================
             WRITE XLSX
          ================================================== */

          const base64 =
            XLSX.write(
              workbook,
              {
                type:
                  "base64",

                bookType:
                  "xlsx",
              }
            );


          const fileUri =
            `${FileSystem.cacheDirectory}pending-dues-${Date.now()}.xlsx`;


          await FileSystem.writeAsStringAsync(
            fileUri,
            base64,
            {
              encoding:
                FileSystem.EncodingType.Base64,
            }
          );


          /* ==================================================
             SHARE / DOWNLOAD
          ================================================== */

          if (
            await Sharing.isAvailableAsync()
          ) {

            await Sharing.shareAsync(
              fileUri,
              {
                mimeType:
                  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

                dialogTitle:
                  "Download Pending Dues Excel",

                UTI:
                  "com.microsoft.excel.xlsx",
              }
            );

          } else {

            showMessage(
              "Excel file created successfully.",
              Colors.successBg
            );

          }

        } catch (
          error: any
        ) {

          console.error(
            "EXCEL EXPORT ERROR:",
            error
          );

          showMessage(
            error?.message ??
              "Unable to create Excel file.",
            Colors.errorBg
          );

        } finally {

          setExporting(
            false
          );

        }

      };


    /* ========================================================
       PRINT
    ======================================================== */

    const printReport =
      async () => {

        if (
          !report ||
          !report.students.length
        ) {

          showMessage(
            "Generate a report first.",
            Colors.errorBg
          );

          return;

        }


        try {

          setExporting(
            true
          );


          const html =
            buildPdfHtml();


          await Print.printAsync(
            {
              html,
            }
          );

        } catch (
          error: any
        ) {

          console.error(
            "PRINT ERROR:",
            error
          );

          showMessage(
            error?.message ??
              "Unable to print report.",
            Colors.errorBg
          );

        } finally {

          setExporting(
            false
          );

        }

      };


    /* ========================================================
       STUDENT CARD
    ======================================================== */

    const renderStudent =
      (
        student: PendingDuesStudent
      ) => {

        return (

          <Card
            key={
              student.id
            }
            onPress={() => openStudent(student.admissionNo)}
            style={
              styles.studentCard
            }
          >

            <Card.Content>

              {/* ============================================
                  HEADER
              ============================================ */}

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
                    Admission No:{" "}
                    {
                      student.admissionNo
                    }
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
                    {Number(
                      student.unpaidPercentage
                    ).toFixed(0)}
                    %
                  </Text>

                </View>

              </View>


              {/* ============================================
                  CLASS
              ============================================ */}

              <View
                style={
                  styles.studentMeta
                }
              >

                <Text
                  style={
                    styles.metaText
                  }
                >
                  Class{" "}
                  {getClassName(
                    student.classNumber
                  )}
                </Text>

                <Text
                  style={
                    styles.metaText
                  }
                >
                  Section{" "}
                  {student.sectionName ||
                    "-"}
                </Text>

              </View>


              <Divider
                style={
                  styles.divider
                }
              />


              {/* ============================================
                  AMOUNTS
              ============================================ */}

              <View
                style={
                  styles.amountGrid
                }
              >

                <View
                  style={
                    styles.amountItem
                  }
                >

                  <Text
                    style={
                      styles.amountLabel
                    }
                  >
                    Total Fee
                  </Text>

                  <Text
                    style={
                      styles.amountValue
                    }
                  >
                    {formatAmount(
                      student.totalFee
                    )}
                  </Text>

                </View>


                <View
                  style={
                    styles.amountItem
                  }
                >

                  <Text
                    style={
                      styles.amountLabel
                    }
                  >
                    Pending
                  </Text>

                  <Text
                    style={
                      styles.pendingValue
                    }
                  >
                    {formatAmount(
                      student.pendingAmount
                    )}
                  </Text>

                </View>

              </View>


              {/* ============================================
                  FEE BREAKDOWN
              ============================================ */}

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
                  Pending Breakdown
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
                    Tie
                  </Text>

                  <Text
                    style={
                      styles.breakdownValue
                    }
                  >
                    {formatAmount(
                      student.tie.pendingAmount
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
                    Belt
                  </Text>

                  <Text
                    style={
                      styles.breakdownValue
                    }
                  >
                    {formatAmount(
                      student.belt.pendingAmount
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
                    Arrears
                  </Text>

                  <Text
                    style={
                      styles.breakdownValue
                    }
                  >
                    {formatAmount(
                      student.arrears.pendingAmount
                    )}
                  </Text>

                </View>

              </View>

            </Card.Content>

          </Card>

        );

      };


    /* ========================================================
       CLASS SECTION
    ======================================================== */

    const renderClassSection =
      (
        classNumber: string,
        classStudents:
          PendingDuesStudent[]
      ) => {

        const classPending =
          classStudents.reduce(
            (
              sum,
              student
            ) =>
              sum +
              Number(
                student.pendingAmount
              ),
            0
          );


        return (

          <View
            key={
              classNumber
            }
            style={
              styles.classSection
            }
          >

            {/* ==============================================
                CLASS HEADER
            ============================================== */}

            <View
              style={
                styles.classHeader
              }
            >

              <View>

                <Text
                  style={
                    styles.classTitle
                  }
                >
                  Class{" "}
                  {classNumber}
                </Text>

                <Text
                  style={
                    styles.classSubtitle
                  }
                >
                  {
                    classStudents.length
                  }{" "}
                  student
                  {
                    classStudents.length ===
                    1
                      ? ""
                      : "s"
                  }
                </Text>

              </View>


              <Text
                style={
                  styles.classPending
                }
              >
                {formatAmount(
                  classPending
                )}
              </Text>

            </View>


            {classStudents.map(
              renderStudent
            )}

          </View>

        );

      };


    /* ========================================================
       SUMMARY
    ======================================================== */

    const renderSummary =
      () => {

        if (!report) {
          return null;
        }


        return (

          <View
            style={
              styles.summaryGrid
            }
          >

            <View
              style={
                styles.summaryCard
              }
            >

              <Text
                style={
                  styles.summaryLabel
                }
              >
                Students
              </Text>

              <Text
                style={
                  styles.summaryValue
                }
              >
                {
                  report.summary
                    .totalStudents
                }
              </Text>

            </View>


            <View
              style={
                styles.summaryCard
              }
            >

              <Text
                style={
                  styles.summaryLabel
                }
              >
                Classes
              </Text>

              <Text
                style={
                  styles.summaryValue
                }
              >
                {
                  report.summary
                    .totalClasses
                }
              </Text>

            </View>


            <View
              style={
                styles.summaryCard
              }
            >

              <Text
                style={
                  styles.summaryLabel
                }
              >
                Payable
              </Text>

              <Text
                style={
                  styles.summaryValue
                }
              >
                {formatAmount(
                  report.summary
                    .totalPayableAmount
                )}
              </Text>

            </View>


            <View
              style={[
                styles.summaryCard,
                styles.summaryCardPending,
              ]}
            >

              <Text
                style={
                  styles.summaryLabel
                }
              >
                Pending
              </Text>

              <Text
                style={
                  styles.summaryPendingValue
                }
              >
                {formatAmount(
                  report.summary
                    .totalPendingAmount
                )}
              </Text>

            </View>

          </View>

        );

      };


    /* ========================================================
       EMPTY
    ======================================================== */

    const renderEmpty =
      () => {

        if (
          loading ||
          !report
        ) {
          return null;
        }


        if (
          report.students.length
        ) {
          return null;
        }


        return (

          <Card
            style={
              styles.emptyCard
            }
          >

            <Text
              style={
                styles.emptyTitle
              }
            >
              No Pending Dues
            </Text>

            <Text
              style={
                styles.emptyText
              }
            >
              No students match the
              selected pending percentage.
            </Text>

          </Card>

        );

      };


    /* ========================================================
       MAIN
    ======================================================== */

    return (

      <View
        style={
          styles.container
        }
      >

        <FlatList
          data={
            groupedStudents
          }

          keyExtractor={(
            [classNumber]
          ) =>
            classNumber
          }

          renderItem={({
            item,
          }) =>
            renderClassSection(
              item[0],
              item[1]
            )
          }

          ListHeaderComponent={

            <View>

              {/* ============================================
                  HEADER
              ============================================ */}

              <View
                style={
                  styles.header
                }
              >

                <Text
                  style={
                    styles.title
                  }
                >
                  Pending Dues
                </Text>

                <Text
                  style={
                    styles.subtitle
                  }
                >
                  View and manage students
                  with outstanding fees.
                </Text>

              </View>


              {/* ============================================
                  FILTER CARD
              ============================================ */}

              <Card
                style={
                  styles.filterCard
                }
              >

                <Card.Content>

                  <Text
                    style={
                      styles.sectionTitle
                    }
                  >
                    Report Filters
                  </Text>


                  {/* CLASS */}

                  <Text
                    style={
                      styles.fieldLabel
                    }
                  >
                    Class
                  </Text>


                  <DropDownPicker
  open={classDropdownOpen}
  value={selectedClass}
  items={classOptions}
  setOpen={setClassDropdownOpen}
  setValue={setSelectedClass}
  setItems={setClassOptions}
  placeholder="Select class"
  listMode="SCROLLVIEW"
  zIndex={2000}
  zIndexInverse={1000}
  style={styles.dropdown}
  dropDownContainerStyle={
    styles.dropdownContainer
  }
  textStyle={styles.dropdownText}
  placeholderStyle={
    styles.dropdownPlaceholder
  }
/>


                  <View style={styles.classListContainer}>
                    <ClassList
                      selectedClass={selectedClass === "ALL" ? null : selectedClass}
                      setSelectedClass={(value) =>
                        setSelectedClass(
                          (typeof value === "function" ? value(null) : value) ||
                            "ALL"
                        )
                      }
                      zIndex={1500}
                    />
                  </View>

                  <View
                    style={
                      styles.fieldSpacing
                    }
                  />


                  {/* PERCENTAGE */}

                  <Text
                    style={
                      styles.fieldLabel
                    }
                  >
                    Pending Percentage
                  </Text>


                  <DropDownPicker
                    open={
                      percentageDropdownOpen
                    }

                    value={
                      selectedPercentage
                    }

                    items={
                      percentageOptions
                    }

                    setOpen={
                      setPercentageDropdownOpen
                    }

                    setValue={
                      setSelectedPercentage
                    }

                    setItems={() => {}}

                    placeholder="Select percentage"

                    listMode="SCROLLVIEW"

                    zIndex={1000}

                    zIndexInverse={
                      2000
                    }

                    style={
                      styles.dropdown
                    }

                    dropDownContainerStyle={
                      styles.dropdownContainer
                    }

                    textStyle={
                      styles.dropdownText
                    }

                    placeholderStyle={
                      styles.dropdownPlaceholder
                    }

                  />


                  <Button
                    mode="contained"

                    onPress={
                      generateReport
                    }

                    loading={
                      loading
                    }

                    disabled={
                      loading
                    }

                    buttonColor={
                      Colors.brandPrimary
                    }

                    style={
                      styles.generateButton
                    }
                  >
                    Generate Report
                  </Button>

                </Card.Content>

              </Card>


              {/* ============================================
                  LOADING
              ============================================ */}

              {loading ? (

                <View
                  style={
                    styles.loadingContainer
                  }
                >

                  <ActivityIndicator
                    size="small"
                    color={
                      Colors.brandPrimary
                    }
                  />

                  <Text
                    style={
                      styles.loadingText
                    }
                  >
                    Generating report...
                  </Text>

                </View>

              ) : null}


              {/* ============================================
                  SUMMARY
              ============================================ */}

              {renderSummary()}


              {/* ============================================
                  EXPORT ACTIONS
              ============================================ */}

              {report &&
              report.students.length >
                0 ? (

                <Card
                  style={
                    styles.exportCard
                  }
                >

                  <Card.Content>

                    <Text
                      style={
                        styles.sectionTitle
                      }
                    >
                      Report Actions
                    </Text>

                    <Text
                      style={
                        styles.exportSubtitle
                      }
                    >
                      Export or print the
                      currently generated report.
                    </Text>


                    <View
                      style={
                        styles.actionRow
                      }
                    >

                      <TouchableRipple
                        style={
                          styles.actionButton
                        }

                        borderless

                        onPress={
                          downloadPdf
                        }

                        disabled={
                          exporting
                        }

                        rippleColor={
                          Colors.brandPrimaryBg
                        }
                      >

                        <View
                          style={
                            styles.actionInner
                          }
                        >

                          <Text
                            style={
                              styles.actionIcon
                            }
                          >
                            📄
                          </Text>

                          <Text
                            style={
                              styles.actionTitle
                            }
                          >
                            PDF
                          </Text>

                        </View>

                      </TouchableRipple>


                      <TouchableRipple
                        style={
                          styles.actionButton
                        }

                        borderless

                        onPress={
                          downloadExcel
                        }

                        disabled={
                          exporting
                        }

                        rippleColor={
                          Colors.brandPrimaryBg
                        }
                      >

                        <View
                          style={
                            styles.actionInner
                          }
                        >

                          <Text
                            style={
                              styles.actionIcon
                            }
                          >
                            📊
                          </Text>

                          <Text
                            style={
                              styles.actionTitle
                            }
                          >
                            Excel
                          </Text>

                        </View>

                      </TouchableRipple>


                      <TouchableRipple
                        style={
                          styles.actionButton
                        }

                        borderless

                        onPress={
                          printReport
                        }

                        disabled={
                          exporting
                        }

                        rippleColor={
                          Colors.brandPrimaryBg
                        }
                      >

                        <View
                          style={
                            styles.actionInner
                          }
                        >

                          <Text
                            style={
                              styles.actionIcon
                            }
                          >
                            🖨️
                          </Text>

                          <Text
                            style={
                              styles.actionTitle
                            }
                          >
                            Print
                          </Text>

                        </View>

                      </TouchableRipple>

                    </View>


                    {exporting ? (

                      <Text
                        style={
                          styles.exportingText
                        }
                      >
                        Preparing file...
                      </Text>

                    ) : null}

                  </Card.Content>

                </Card>

              ) : null}


              {/* ============================================
                  REPORT TITLE
              ============================================ */}

              {report &&
              report.students.length >
                0 ? (

                <View
                  style={
                    styles.resultsHeader
                  }
                >

                  <View>

                    <Text
                      style={
                        styles.resultsTitle
                      }
                    >
                      Pending Students
                    </Text>

                    <Text
                      style={
                        styles.resultsSubtitle
                      }
                    >
                      {
                        report.summary
                          .totalStudents
                      }{" "}
                      students found
                    </Text>

                  </View>


                  <TouchableOpacity
                    onPress={
                      refreshReport
                    }
                    disabled={
                      refreshing
                    }
                  >

                    <Text
                      style={
                        styles.refreshText
                      }
                    >
                      {refreshing
                        ? "Refreshing..."
                        : "Refresh"}
                    </Text>

                  </TouchableOpacity>

                </View>

              ) : null}

            </View>
          }

          ListFooterComponent={
            renderEmpty()
          }

          contentContainerStyle={
            styles.content
          }

          showsVerticalScrollIndicator={
            false
          }

          refreshControl={
            <RefreshControl
              refreshing={
                refreshing
              }
              onRefresh={
                refreshReport
              }
              tintColor={
                Colors.brandPrimary
              }
            />
          }

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

          duration={
            3000
          }

          style={{
            backgroundColor:
              snackbarColor,
          }}
        >
          {
            snackbarText
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
      paddingHorizontal:
        Metrics.x4,

      paddingTop:
        Metrics.x3,

      paddingBottom:
        Metrics.x8,
    },


    /* ========================================================
       HEADER
    ======================================================== */

    header: {
      marginBottom:
        Metrics.x4,
    },


    title: {
      fontSize:
        29,

      fontWeight:
        "800",

      color:
        "#171717",
    },


    subtitle: {
      fontSize:
        14,

      color:
        Colors.subtext,

      marginTop:
        Metrics.x1,

      lineHeight:
        20,
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

      elevation:
        1,
    },


    sectionTitle: {
      fontSize:
        17,

      fontWeight:
        "800",

      color:
        "#171717",

      marginBottom:
        Metrics.x1,
    },


    fieldLabel: {
      fontSize:
        12,

      fontWeight:
        "700",

      color:
        "#555",

      marginBottom:
        Metrics.x1,
    },


    fieldSpacing: {
      height:
        Metrics.x4,
    },

    classListContainer: {
      marginTop: Metrics.x2,
      marginBottom: Metrics.x2,
    },


    dropdown: {
      borderColor:
        "#E1E3E8",

      borderRadius:
        12,

      minHeight:
        50,

      backgroundColor:
        "#FFFFFF",
    },


    dropdownContainer: {
      borderColor:
        "#E1E3E8",

      borderRadius:
        12,

      backgroundColor:
        "#FFFFFF",
    },


    dropdownText: {
      fontSize:
        13,

      color:
        "#171717",
    },


    dropdownPlaceholder: {
      color:
        Colors.subtext,
    },


    generateButton: {
      marginTop:
        Metrics.x5,

      borderRadius:
        10,
    },


    /* ========================================================
       LOADING
    ======================================================== */

    loadingContainer: {
      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      paddingVertical:
        Metrics.x3,
    },


    loadingText: {
      marginLeft:
        Metrics.x2,

      fontSize:
        13,

      color:
        Colors.subtext,
    },


    /* ========================================================
       SUMMARY
    ======================================================== */

    summaryGrid: {
      flexDirection:
        "row",

      flexWrap:
        "wrap",

      justifyContent:
        "space-between",

      marginBottom:
        Metrics.x4,
    },


    summaryCard: {
      width:
        "48.5%",

      minHeight:
        105,

      padding:
        Metrics.x3,

      marginBottom:
        Metrics.x3,

      borderRadius:
        15,

      borderWidth:
        1,

      borderColor:
        "#ECEEF3",

      backgroundColor:
        "#FFFFFF",

      elevation:
        1,
    },


    summaryCardPending: {
      borderColor:
        "#F2D4D4",

      backgroundColor:
        "#FFF8F8",
    },


    summaryLabel: {
      fontSize:
        11,

      color:
        Colors.subtext,

      fontWeight:
        "600",
    },


    summaryValue: {
      fontSize:
        21,

      fontWeight:
        "800",

      color:
        "#171717",

      marginTop:
        Metrics.x2,
    },


    summaryPendingValue: {
      fontSize:
        20,

      fontWeight:
        "800",

      color:
        "#D64545",

      marginTop:
        Metrics.x2,
    },


    /* ========================================================
       EXPORT
    ======================================================== */

    exportCard: {
      marginBottom:
        Metrics.x5,

      borderRadius:
        16,

      backgroundColor:
        "#FFFFFF",

      elevation:
        1,
    },


    exportSubtitle: {
      fontSize:
        12,

      color:
        Colors.subtext,

      marginTop:
        3,

      marginBottom:
        Metrics.x3,
    },


    actionRow: {
      flexDirection:
        "row",

      gap:
        Metrics.x2,
    },


    actionButton: {
      flex:
        1,

      minHeight:
        76,

      borderRadius:
        13,

      borderWidth:
        1,

      borderColor:
        "#E3E5EA",

      overflow:
        "hidden",

      backgroundColor:
        "#FFFFFF",
    },


    actionInner: {
      flex:
        1,

      alignItems:
        "center",

      justifyContent:
        "center",
    },


    actionIcon: {
      fontSize:
        23,

      marginBottom:
        4,
    },


    actionTitle: {
      fontSize:
        12,

      fontWeight:
        "800",

      color:
        "#252525",
    },


    exportingText: {
      textAlign:
        "center",

      fontSize:
        11,

      color:
        Colors.subtext,

      marginTop:
        Metrics.x2,
    },


    /* ========================================================
       RESULTS
    ======================================================== */

    resultsHeader: {
      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      marginBottom:
        Metrics.x3,
    },


    resultsTitle: {
      fontSize:
        19,

      fontWeight:
        "800",

      color:
        "#171717",
    },


    resultsSubtitle: {
      fontSize:
        11,

      color:
        Colors.subtext,

      marginTop:
        2,
    },


    refreshText: {
      fontSize:
        12,

      fontWeight:
        "700",

      color:
        Colors.brandPrimary,
    },


    /* ========================================================
       CLASS
    ======================================================== */

    classSection: {
      marginBottom:
        Metrics.x4,
    },


    classHeader: {
      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      paddingHorizontal:
        Metrics.x1,

      marginBottom:
        Metrics.x2,
    },


    classTitle: {
      fontSize:
        18,

      fontWeight:
        "800",

      color:
        "#171717",
    },


    classSubtitle: {
      fontSize:
        11,

      color:
        Colors.subtext,

      marginTop:
        2,
    },


    classPending: {
      fontSize:
        15,

      fontWeight:
        "800",

      color:
        Colors.brandPrimary,
    },


    /* ========================================================
       STUDENT
    ======================================================== */

    studentCard: {
      marginBottom:
        Metrics.x3,

      borderRadius:
        16,

      backgroundColor:
        "#FFFFFF",

      elevation:
        1,
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
      flex:
        1,

      paddingRight:
        Metrics.x2,
    },


    studentName: {
      fontSize:
        16,

      fontWeight:
        "800",

      color:
        "#171717",
    },


    admissionNo: {
      fontSize:
        11,

      color:
        Colors.subtext,

      marginTop:
        3,
    },


    percentageBadge: {
      minWidth:
        50,

      paddingHorizontal:
        Metrics.x2,

      paddingVertical:
        Metrics.x1,

      borderRadius:
        20,

      backgroundColor:
        "#FFF0F0",

      alignItems:
        "center",
    },


    percentageText: {
      fontSize:
        12,

      fontWeight:
        "800",

      color:
        "#D64545",
    },


    studentMeta: {
      flexDirection:
        "row",

      marginTop:
        Metrics.x3,

      gap:
        Metrics.x4,
    },


    metaText: {
      fontSize:
        12,

      color:
        Colors.subtext,
    },


    divider: {
      marginVertical:
        Metrics.x3,
    },


    /* ========================================================
       AMOUNTS
    ======================================================== */

    amountGrid: {
      flexDirection:
        "row",

      gap:
        Metrics.x2,
    },


    amountItem: {
      flex:
        1,

      padding:
        Metrics.x2,

      borderRadius:
        12,

      backgroundColor:
        "#F7F8FC",
    },


    amountLabel: {
      fontSize:
        10,

      color:
        Colors.subtext,
    },


    amountValue: {
      fontSize:
        15,

      fontWeight:
        "800",

      color:
        "#171717",

      marginTop:
        3,
    },


    pendingValue: {
      fontSize:
        15,

      fontWeight:
        "800",

      color:
        "#D64545",

      marginTop:
        3,
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
        "#FAFAFB",
    },


    breakdownTitle: {
      fontSize:
        12,

      fontWeight:
        "800",

      color:
        "#252525",

      marginBottom:
        Metrics.x2,
    },


    breakdownRow: {
      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      paddingVertical:
        4,
    },


    breakdownLabel: {
      fontSize:
        11,

      color:
        Colors.subtext,
    },


    breakdownValue: {
      fontSize:
        11,

      fontWeight:
        "700",

      color:
        "#252525",
    },


    /* ========================================================
       EMPTY
    ======================================================== */

    emptyCard: {
      padding:
        Metrics.x5,

      borderRadius:
        16,

      alignItems:
        "center",

      backgroundColor:
        "#FFFFFF",
    },


    emptyTitle: {
      fontSize:
        18,

      fontWeight:
        "800",

      color:
        "#171717",
    },


    emptyText: {
      fontSize:
        13,

      color:
        Colors.subtext,

      marginTop:
        Metrics.x2,

      textAlign:
        "center",
    },

  }));


export {
  PrincipalPendingDuesScreen,
};