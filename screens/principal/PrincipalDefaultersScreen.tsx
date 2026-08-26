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

import {
  ClassList,
  Page,
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

type PendingDuesStudent = {
  id: string;

  admissionNo: string;

  name: string;

  phone?: string;

  classNumber?: string;

  sectionName?: string;

  pendingAmount: number;

  pendingTuitionFee: number;

  pendingTextbookFee: number;

  pendingNotebookFee: number;

  pendingDiaryAmount: number;

  tie: {
    pendingAmount: number;
  };

  belt: {
    pendingAmount: number;
  };

  arrears: {
    pendingAmount: number;
  };

  totalFee: number;

  unpaidPercentage: number;
};

type PendingDuesClassSummary = {
  classNumber: string;

  totalStudents: number;

  totalPendingAmount: number;
};

type PendingDuesResponse = {
  percentage: number;

  classNumber: string;

  totalStudents: number;

  totalPendingAmount: number;

  classSummary: PendingDuesClassSummary[];

  students: PendingDuesStudent[];
};

/* ============================================================
   SCREEN
============================================================ */

// const PrincipalDefaultersScreen = () => {
//   const styles = useStyles();

//   /* ==========================================================
//      NAVIGATION
//   ========================================================== */

//   const navigation =
//     useNavigation<
//       NativeStackNavigationProp<
//         RootStackParamList
//       >
//     >();

//   /* ==========================================================
//      CLASS
//   ========================================================== */

//   const [
//     selectedClass,
//     setSelectedClass,
//   ] =
//     useState<string | null>("ALL");

//   const [
//     classDropdownOpen,
//     setClassDropdownOpen,
//   ] =
//     useState(false);

//   /* ==========================================================
//      PERCENTAGE
//   ========================================================== */

//   const [
//     selectedPercentage,
//     setSelectedPercentage,
//   ] =
//     useState<string>("100");

//   const [
//     percentageDropdownOpen,
//     setPercentageDropdownOpen,
//   ] =
//     useState(false);

//   /* ==========================================================
//      RESULT
//   ========================================================== */

//   const [
//     report,
//     setReport,
//   ] =
//     useState<PendingDuesResponse | null>(
//       null
//     );

//   /* ==========================================================
//      LOADING
//   ========================================================== */

//   const [
//     loading,
//     setLoading,
//   ] =
//     useState(false);

//   /* ==========================================================
//      STUDENT LOADING
//   ========================================================== */

//   const [
//     fetchingStudent,
//     setFetchingStudent,
//   ] =
//     useState(false);

//   /* ==========================================================
//      SNACKBAR
//   ========================================================== */

//   const [
//     snackbarVisible,
//     setSnackbarVisible,
//   ] =
//     useState(false);

//   const [
//     snackbarMessage,
//     setSnackbarMessage,
//   ] =
//     useState("");

//   const [
//     snackbarColor,
//     setSnackbarColor,
//   ] =
//     useState(
//       Colors.errorBg
//     );

//   /* ==========================================================
//      PERCENTAGES
//   ========================================================== */

//   const percentages = [
//     {
//       label: "30% or more unpaid",
//       value: "30",
//     },

//     {
//       label: "50% or more unpaid",
//       value: "50",
//     },

//     {
//       label: "80% or more unpaid",
//       value: "80",
//     },

//     {
//       label: "100% unpaid",
//       value: "100",
//     },
//   ];

//   /* ==========================================================
//      SHOW SNACKBAR
//   ========================================================== */

//   const showSnackbar =
//     useCallback(
//       (
//         message: string,
//         backgroundColor: string =
//           Colors.errorBg
//       ) => {
//         setSnackbarMessage(
//           message
//         );

//         setSnackbarColor(
//           backgroundColor
//         );

//         setSnackbarVisible(
//           true
//         );
//       },
//       []
//     );

//   /* ==========================================================
//      GENERATE REPORT
//   ========================================================== */

// //   const generateReport =
// //     useCallback(async () => {
// //       if (loading) {
// //         return;
// //       }

// //       setLoading(true);

// //       try {
// //         const data =
// //           (await reportServices.getPendingDues(
// //             {
// //               classNumber:
// //                 selectedClass ===
// //                 "ALL"
// //                   ? undefined
// //                   : selectedClass ??
// //                     undefined,

// //               perc:
// //                 selectedPercentage,
// //             }
// //           )) as PendingDuesResponse;

// //         setReport(data);

// //         if (
// //           !data.students ||
// //           !data.students.length
// //         ) {
// //           showSnackbar(
// //             "No students found for the selected criteria",
// //             Colors.errorBg
// //           );
// //         }
// //       } catch (error: any) {
// //         console.error(
// //           "GET PENDING DUES ERROR:",
// //           error
// //         );

// //         setReport(null);

// //         showSnackbar(
// //           error?.response?.data
// //             ?.message ??
// //             "Unable to generate pending dues report",
// //           Colors.errorBg
// //         );
// //       } finally {
// //         setLoading(false);
// //       }
// //     }, [
// //       loading,
// //       selectedClass,
// //       selectedPercentage,
// //       showSnackbar,
// //     ]);

//   /* ==========================================================
//      REFRESH
//   ========================================================== */

//   const refresh =
//     useCallback(async () => {
//       if (!report) {
//         return;
//       }

//       setLoading(true);

//       try {
//         const data =
//           (await reportServices.getPendingDues(
//             {
//               classNumber:
//                 selectedClass ===
//                 "ALL"
//                   ? undefined
//                   : selectedClass ??
//                     undefined,

//               perc:
//                 selectedPercentage,
//             }
//           )) as PendingDuesResponse;

//         setReport(data);
//       } catch (error: any) {
//         showSnackbar(
//           error?.response?.data
//             ?.message ??
//             "Unable to refresh report"
//         );
//       } finally {
//         setLoading(false);
//       }
//     }, [
//       report,
//       selectedClass,
//       selectedPercentage,
//       showSnackbar,
//     ]);

//   /* ==========================================================
//      OPEN STUDENT
//   ========================================================== */

//   const openStudent =
//     useCallback(
//       async (
//         admissionNo: string
//       ) => {
//         if (fetchingStudent) {
//           return;
//         }

//         setFetchingStudent(true);

//         try {
//           const student =
//             await studentServices.getStudentById(
//               {
//                 admissionNo,
//               }
//             );

//           navigation.dispatch(
//             StackActions.push(
//               RootStackScreenNames.StudentDetails,
//               {
//                 student:
//                   student as Student,
//               }
//             )
//           );
//         } catch (error: any) {
//           console.error(
//             "GET STUDENT ERROR:",
//             error
//           );

//           showSnackbar(
//             error?.response?.data
//               ?.message ??
//               "Unable to fetch student details"
//           );
//         } finally {
//           setFetchingStudent(false);
//         }
//       },
//       [
//         fetchingStudent,
//         navigation,
//         showSnackbar,
//       ]
//     );

//   /* ==========================================================
//      FORMAT AMOUNT
//   ========================================================== */

//   const formatAmount =
//     useCallback(
//       (amount: number) => {
//         return `₹${Number(
//           amount || 0
//         ).toLocaleString(
//           "en-IN"
//         )}`;
//       },
//       []
//     );

//   /* ==========================================================
//      CLASS OPTIONS
//   ========================================================== */

//   /*
//    * We keep "ALL" manually.
//    *
//    * ClassList is still used below to obtain
//    * the school's class selection.
//    */

//   const percentageLabel =
//     useMemo(() => {
//       const item =
//         percentages.find(
//           (item) =>
//             item.value ===
//             selectedPercentage
//         );

//       return (
//         item?.label ??
//         "Select percentage"
//       );
//     }, [
//       selectedPercentage,
//     ]);

//   /* ==========================================================
//      STUDENT CARD
//   ========================================================== */

//   const renderStudent =
//     (
//       student: PendingDuesStudent
//     ) => {
//       return (
//         <Card
//           key={
//             student.admissionNo
//           }
//           style={
//             styles.studentCard
//           }
//           onPress={() =>
//             openStudent(
//               student.admissionNo
//             )
//           }
//         >
//           <Card.Content>

//             {/* ================================================
//                 HEADER
//             ================================================= */}

//             <View
//               style={
//                 styles.studentHeader
//               }
//             >
//               <View
//                 style={
//                   styles.studentInfo
//                 }
//               >
//                 <Text
//                   style={
//                     styles.studentName
//                   }
//                 >
//                   {student.name}
//                 </Text>

//                 <Text
//                   style={
//                     styles.admissionNo
//                   }
//                 >
//                   {student.admissionNo}
//                 </Text>
//               </View>

//               <View
//                 style={
//                   styles.percentageBadge
//                 }
//               >
//                 <Text
//                   style={
//                     styles.percentageText
//                   }
//                 >
//                   {student.unpaidPercentage.toFixed(
//                     0
//                   )}
//                   %
//                 </Text>
//               </View>
//             </View>

//             {/* ================================================
//                 CLASS / SECTION
//             ================================================= */}

//             <Text
//               style={
//                 styles.studentClass
//               }
//             >
//               Class{" "}
//               {student.classNumber ??
//                 "-"}
//               {"  •  "}
//               {student.sectionName ||
//                 "No Section"}
//             </Text>

//             <Divider
//               style={
//                 styles.divider
//               }
//             />

//             {/* ================================================
//                 PENDING
//             ================================================= */}

//             <View
//               style={
//                 styles.amountRow
//               }
//             >
//               <View>
//                 <Text
//                   style={
//                     styles.amountLabel
//                   }
//                 >
//                   Total Pending
//                 </Text>

//                 <Text
//                   style={
//                     styles.amountHint
//                   }
//                 >
//                   of{" "}
//                   {formatAmount(
//                     student.totalFee
//                   )}
//                 </Text>
//               </View>

//               <Text
//                 style={
//                   styles.pendingAmount
//                 }
//               >
//                 {formatAmount(
//                   student.pendingAmount
//                 )}
//               </Text>
//             </View>

//             {/* ================================================
//                 BREAKDOWN
//             ================================================= */}

//             <View
//               style={
//                 styles.breakdown
//               }
//             >
//               <Text
//                 style={
//                   styles.breakdownTitle
//                 }
//               >
//                 Pending breakdown
//               </Text>

//               <View
//                 style={
//                   styles.breakdownRow
//                 }
//               >
//                 <Text
//                   style={
//                     styles.breakdownLabel
//                   }
//                 >
//                   Tuition
//                 </Text>

//                 <Text
//                   style={
//                     styles.breakdownValue
//                   }
//                 >
//                   {formatAmount(
//                     student.pendingTuitionFee
//                   )}
//                 </Text>
//               </View>

//               <View
//                 style={
//                   styles.breakdownRow
//                 }
//               >
//                 <Text
//                   style={
//                     styles.breakdownLabel
//                   }
//                 >
//                   Textbook
//                 </Text>

//                 <Text
//                   style={
//                     styles.breakdownValue
//                   }
//                 >
//                   {formatAmount(
//                     student.pendingTextbookFee
//                   )}
//                 </Text>
//               </View>

//               <View
//                 style={
//                   styles.breakdownRow
//                 }
//               >
//                 <Text
//                   style={
//                     styles.breakdownLabel
//                   }
//                 >
//                   Notebook
//                 </Text>

//                 <Text
//                   style={
//                     styles.breakdownValue
//                   }
//                 >
//                   {formatAmount(
//                     student.pendingNotebookFee
//                   )}
//                 </Text>
//               </View>

//               <View
//                 style={
//                   styles.breakdownRow
//                 }
//               >
//                 <Text
//                   style={
//                     styles.breakdownLabel
//                   }
//                 >
//                   Diary
//                 </Text>

//                 <Text
//                   style={
//                     styles.breakdownValue
//                   }
//                 >
//                   {formatAmount(
//                     student.pendingDiaryAmount
//                   )}
//                 </Text>
//               </View>

//               <View
//                 style={
//                   styles.breakdownRow
//                 }
//               >
//                 <Text
//                   style={
//                     styles.breakdownLabel
//                   }
//                 >
//                   Tie / Belt / Arrears
//                 </Text>

//                 <Text
//                   style={
//                     styles.breakdownValue
//                   }
//                 >
//                   {formatAmount(
//                     Number(
//                       student.tie
//                         ?.pendingAmount ??
//                         0
//                     ) +
//                       Number(
//                         student.belt
//                           ?.pendingAmount ??
//                           0
//                       ) +
//                       Number(
//                         student.arrears
//                           ?.pendingAmount ??
//                           0
//                       )
//                   )}
//                 </Text>
//               </View>
//             </View>

//             {/* ================================================
//                 ACTION
//             ================================================= */}

//             <Text
//               style={
//                 styles.viewStudent
//               }
//             >
//               View Student Details →
//             </Text>

//           </Card.Content>
//         </Card>
//       );
//     };

//   /* ==========================================================
//      CLASS SUMMARY
//   ========================================================== */

//   const renderClassSummary =
//     (
//       item: PendingDuesClassSummary
//     ) => {
//       return (
//         <View
//           key={
//             item.classNumber
//           }
//           style={
//             styles.classSummary
//           }
//         >
//           <View
//             style={
//               styles.classSummaryInfo
//             }
//           >
//             <Text
//               style={
//                 styles.classSummaryTitle
//               }
//             >
//               Class{" "}
//               {item.classNumber}
//             </Text>

//             <Text
//               style={
//                 styles.classSummaryStudents
//               }
//             >
//               {item.totalStudents}{" "}
//               student
//               {item.totalStudents ===
//               1
//                 ? ""
//                 : "s"}
//             </Text>
//           </View>

//           <Text
//             style={
//               styles.classSummaryAmount
//             }
//           >
//             {formatAmount(
//               item.totalPendingAmount
//             )}
//           </Text>
//         </View>
//       );
//     };

//   /* ==========================================================
//      HEADER
//   ========================================================== */

//   const renderHeader =
//     () => {
//       return (
//         <>

//           {/* ==================================================
//               TITLE
//           ================================================== */}

//           <View
//             style={
//               styles.header
//             }
//           >
//             <Text
//               style={
//                 styles.title
//               }
//             >
//               Defaulters
//             </Text>

//             <Text
//               style={
//                 styles.subtitle
//               }
//             >
//               Students with outstanding
//               fee payments
//             </Text>
//           </View>

//           {/* ==================================================
//               FILTER CARD
//           ================================================== */}

//           <Card
//             style={
//               styles.filterCard
//             }
//           >
//             <Card.Content>

//               <Text
//                 style={
//                   styles.sectionTitle
//                 }
//               >
//                 Report Filters
//               </Text>

//               {/* ============================================
//                   CLASS
//               ============================================= */}

//               <Text
//                 style={
//                   styles.fieldLabel
//                 }
//               >
//                 Class
//               </Text>

//               <View
//                 style={
//                   styles.classPickerWrapper
//                 }
//               >

//                 <DropDownPicker
//                   open={
//                     classDropdownOpen
//                   }

//                   value={
//                     selectedClass
//                   }

//                   items={[
//                     {
//                       label:
//                         "All Classes",
//                       value:
//                         "ALL",
//                     },
//                   ]}

//                   setOpen={
//                     setClassDropdownOpen
//                   }

//                   setValue={
//                     setSelectedClass
//                   }

//                   placeholder="Select class"

//                   listMode="SCROLLVIEW"

//                   style={
//                     styles.dropdown
//                   }

//                   dropDownContainerStyle={
//                     styles.dropdownContainer
//                   }

//                   zIndex={3000}

//                   zIndexInverse={
//                     1000
//                   }

//                   onOpen={() =>
//                     setPercentageDropdownOpen(
//                       false
//                     )
//                   }
//                 />

//               </View>

//               {/* ============================================
//                   EXISTING CLASS LIST
//               ============================================= */}

//               <View
//                 style={
//                   styles.classListContainer
//                 }
//               >

//                 <ClassList
//                   selectedClass={
//                     selectedClass ===
//                     "ALL"
//                       ? null
//                       : selectedClass
//                   }

//                   setSelectedClass={(
//                     value
//                   ) => {

//                     if (
//                       value
//                     ) {
//                       setSelectedClass(
//                         value
//                       );
//                     } else {
//                       setSelectedClass(
//                         "ALL"
//                       );
//                     }

//                   }}

//                   zIndex={2000}
//                 />

//               </View>

//               {/* ============================================
//                   PERCENTAGE
//               ============================================= */}

//               <Text
//                 style={
//                   styles.fieldLabel
//                 }
//               >
//                 Pending Percentage
//               </Text>

//               <DropDownPicker
//                 open={
//                   percentageDropdownOpen
//                 }

//                 value={
//                   selectedPercentage
//                 }

//                 items={
//                   percentages
//                 }

//                 setOpen={
//                   setPercentageDropdownOpen
//                 }

//                 setValue={
//                   setSelectedPercentage
//                 }

//                 placeholder="Select percentage"

//                 listMode="SCROLLVIEW"

//                 style={
//                   styles.dropdown
//                 }

//                 dropDownContainerStyle={
//                   styles.dropdownContainer
//                 }

//                 zIndex={1000}

//                 zIndexInverse={
//                   3000
//                 }

//                 onOpen={() =>
//                   setClassDropdownOpen(
//                     false
//                   )
//                 }
//               />

//               {/* ============================================
//                   SELECTED FILTER
//               ============================================= */}

//               <View
//                 style={
//                   styles.filterSummary
//                 }
//               >
//                 <Text
//                   style={
//                     styles.filterSummaryText
//                   }
//                 >
//                   {selectedClass ===
//                   "ALL"
//                     ? "All Classes"
//                     : `Class ${selectedClass}`}
//                 </Text>

//                 <Text
//                   style={
//                     styles.filterSummaryText
//                   }
//                 >
//                   {percentageLabel}
//                 </Text>
//               </View>

//               {/* ============================================
//                   GENERATE
//               ============================================= */}

//               <Card
//                 style={
//                   styles.generateCard
//                 }
//                 onPress={
//                   generateReport
//                 }
//               >
//                 <Card.Content>
//                   <Text
//                     style={
//                       styles.generateText
//                     }
//                   >
//                     {loading
//                       ? "Generating..."
//                       : "GENERATE REPORT"}
//                   </Text>
//                 </Card.Content>
//               </Card>

//             </Card.Content>
//           </Card>

//           {/* ==================================================
//               RESULT SUMMARY
//           ================================================== */}

//           {report ? (
//             <>

//               <View
//                 style={
//                   styles.summaryHeader
//                 }
//               >
//                 <Text
//                   style={
//                     styles.sectionTitle
//                   }
//                 >
//                   Report Summary
//                 </Text>

//                 <Text
//                   style={
//                     styles.summaryFilter
//                   }
//                 >
//                   {report.percentage}%+
//                   unpaid
//                 </Text>
//               </View>

//               <View
//                 style={
//                   styles.summaryCards
//                 }
//               >

//                 <View
//                   style={
//                     styles.summaryCard
//                   }
//                 >
//                   <Text
//                     style={
//                       styles.summaryCardValue
//                     }
//                   >
//                     {
//                       report.totalStudents
//                     }
//                   </Text>

//                   <Text
//                     style={
//                       styles.summaryCardLabel
//                     }
//                   >
//                     Defaulters
//                   </Text>
//                 </View>

//                 <View
//                   style={
//                     styles.summaryCard
//                   }
//                 >
//                   <Text
//                     style={
//                       styles.summaryCardValue
//                     }
//                   >
//                     {formatAmount(
//                       report.totalPendingAmount
//                     )}
//                   </Text>

//                   <Text
//                     style={
//                       styles.summaryCardLabel
//                     }
//                   >
//                     Total Pending
//                   </Text>
//                 </View>

//               </View>

//               {/* ============================================
//                   CLASS SUMMARY
//               ============================================= */}

//               {report
//                 .classSummary
//                 ?.length ? (
//                 <Card
//                   style={
//                     styles.classSummaryCard
//                   }
//                 >
//                   <Card.Content>

//                     <Text
//                       style={
//                         styles.sectionTitle
//                       }
//                     >
//                       Class Summary
//                     </Text>

//                     {report.classSummary.map(
//                       renderClassSummary
//                     )}

//                   </Card.Content>
//                 </Card>
//               ) : null}

//               {/* ============================================
//                   STUDENTS
//               ============================================= */}

//               <View
//                 style={
//                   styles.studentsHeader
//                 }
//               >
//                 <Text
//                   style={
//                     styles.sectionTitle
//                   }
//                 >
//                   Defaulter Students
//                 </Text>

//                 <Text
//                   style={
//                     styles.studentCount
//                   }
//                 >
//                   {
//                     report.students
//                       ?.length ?? 0
//                   }{" "}
//                   students
//                 </Text>
//               </View>

//             </>
//           ) : null}

//         </>
//       );
//     };

//   /* ==========================================================
//      LIST
//   ========================================================== */

//   return (
//     <View
//       style={
//         styles.container
//       }
//     >

//       <FlatList
//         data={
//           report?.students ??
//           []
//         }

//         keyExtractor={(
//           item
//         ) =>
//           item.admissionNo
//         }

//         renderItem={({
//           item,
//         }) =>
//           renderStudent(
//             item
//           )
//         }

//         ListHeaderComponent={
//           renderHeader
//         }

//         ListEmptyComponent={
//           report &&
//           !loading ? (
//             <View
//               style={
//                 styles.empty
//               }
//             >
//               <Text
//                 style={
//                   styles.emptyIcon
//                 }
//               >
//                 ✓
//               </Text>

//               <Text
//                 style={
//                   styles.emptyTitle
//                 }
//               >
//                 No Defaulters
//               </Text>

//               <Text
//                 style={
//                   styles.emptyText
//                 }
//               >
//                 No students match the
//                 selected pending
//                 percentage.
//               </Text>
//             </View>
//           ) : null
//         }

//         refreshControl={
//           <RefreshControl
//             refreshing={
//               loading ||
//               fetchingStudent
//             }
//             onRefresh={
//               refresh
//             }
//           />
//         }

//         contentContainerStyle={
//           styles.content
//         }

//         showsVerticalScrollIndicator={
//           false
//         }

//         keyboardShouldPersistTaps="handled"
//       />

//       {/* ======================================================
//           SNACKBAR
//       ====================================================== */}

//       <Snackbar
//         visible={
//           snackbarVisible
//         }

//         onDismiss={() =>
//           setSnackbarVisible(
//             false
//           )
//         }

//         duration={3000}

//         style={{
//           backgroundColor:
//             snackbarColor,
//         }}
//       >
//         {
//           snackbarMessage
//         }
//       </Snackbar>

//     </View>
//   );
// };

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

    summaryCards: {
      flexDirection:
        "row",

      gap:
        Metrics.x3,

      marginBottom:
        Metrics.x4,
    },

    summaryCard: {
      flex: 1,

      minHeight: 92,

      padding:
        Metrics.x3,

      borderRadius:
        14,

      backgroundColor:
        "#FFFFFF",

      borderWidth:
        1,

      borderColor:
        "#ECEEF3",

      justifyContent:
        "center",
    },

    summaryCardValue: {
      fontSize: 20,

      fontWeight:
        "800",

      color:
        Colors.brandPrimary,
    },

    summaryCardLabel: {
      fontSize: 11,

      color:
        Colors.subtext,

      marginTop:
        Metrics.x1,
    },

    /* ========================================================
       CLASS SUMMARY
    ======================================================== */

    classSummaryCard: {
      marginBottom:
        Metrics.x4,

      borderRadius:
        16,

      backgroundColor:
        "#FFFFFF",
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

    classSummaryTitle: {
      fontSize: 14,

      fontWeight:
        "800",

      color:
        "#171717",
    },

    classSummaryStudents: {
      fontSize: 11,

      color:
        Colors.subtext,

      marginTop:
        3,
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
  //PrincipalDefaultersScreen,
};