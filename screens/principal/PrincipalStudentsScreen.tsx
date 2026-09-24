import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

import {
  ActivityIndicator,
  Avatar,
  Button,
  Card,
  Divider,
  IconButton,
  Snackbar,
  TextInput,
} from "react-native-paper";

import {
  useQuery,
} from "react-query";

import {
  RootStackParamList,
  RootStackScreenNames,
  Class,
  Coupon,
} from "../../types";

import {
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";

import {
  useNavigation,
} from "@react-navigation/native";

import {
  studentServices,
} from "../../services/studentServices";
import {
  principalServices,
} from "../../services/principalServices";
import {
  Colors,
  makeStyles,
  Metrics,
} from "../../theme";

import {
  useUserStore,
} from "../../store";

import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import * as XLSX from "xlsx";

/* ============================================================
   TYPES
============================================================ */

type Student = {
  id?: string | number;
  _id?: string;
  name: string;
  studentName?: string;

  admissionNo: string;
  admissionNumber?: string;

  classNumber: Class;
  class?: string;
  className?: string;
  aadhaar: string;
  fatherName: string;
  dob: string;
  doj: string;
  academicYearId: string;
  sectionName: string;
  phoneNo: string;
  tie: {amount: string; pendingAmount: string};
  diary: {amount: string; pendingAmount: string};
  belt: {amount: string; pendingAmount: string};
  arrears: {amount: string; pendingAmount: string};
  pendingAmount: string;
  siblings: [];
  pendingTuitionFee: string;
  pendingTextbookFee: string;
  pendingNotebookFee: string;
  couponCode: Coupon;
  tcNo: string;

};


type ExportRow = {
  "Student ID": string;
  "Student Name": string;
  "Admission No": string;
  "Class": string;
  "Section": string;
  "Father Name": string;
  "Date of Birth": string;
  "Date of Joining": string;
  "Academic Year ID": string;
  "Phone No": string;
  "Aadhaar": string;
  "Tie Amount": string;
  "Tie Pending Amount": string;
  "Diary Amount": string;
  "Diary Pending Amount": string;
  "Belt Amount": string;
  "Belt Pending Amount": string;
  "Arrears Amount": string;
  "Arrears Pending Amount": string;
  "Pending Tuition Fee": string;
  "Pending Textbook Fee": string;
  "Pending Notebook Fee": string;
  "Pending Amount": string;
  "Coupon Code": string;
  "TC No": string;
  "Siblings": string;
};

const asText = (value: unknown): string => {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
};

const getStudentClass = (student: Student): string => {
  const rawClass: any = student.classNumber as any;

  if (rawClass !== null && rawClass !== undefined) {
    if (
      typeof rawClass === "string" ||
      typeof rawClass === "number"
    ) {
      return String(rawClass);
    }

    if (typeof rawClass === "object") {
      const nestedValue =
        rawClass.classNumber ??
        rawClass.className ??
        rawClass.name ??
        rawClass.value ??
        rawClass.id ??
        rawClass._id;

      if (
        nestedValue &&
        typeof nestedValue === "object"
      ) {
        return asText(
          nestedValue.classNumber ??
            nestedValue.className ??
            nestedValue.name ??
            nestedValue.value ??
            nestedValue.id ??
            nestedValue._id
        );
      }

      if (
        nestedValue !== null &&
        nestedValue !== undefined
      ) {
        return String(nestedValue);
      }
    }
  }

  return asText(
    student.className ??
      student.class ??
      ""
  );
};

const getExportRows = (
  studentsToExport: Student[]
): ExportRow[] => {
  return studentsToExport.map((student) => ({
    "Student ID": asText(student.id ?? student._id),
    "Student Name": asText(
      student.name ??
        student.studentName ??
        ""
    ),
    "Admission No": asText(
      student.admissionNo ??
        student.admissionNumber ??
        ""
    ),
    Class: getStudentClass(student),
    Section: asText(student.sectionName),
    "Father Name": asText(student.fatherName),
    "Date of Birth": asText(student.dob),
    "Date of Joining": asText(student.doj),
    "Academic Year ID": asText(student.academicYearId),
    "Phone No": asText(student.phoneNo),
    Aadhaar: asText(student.aadhaar),
    "Tie Amount": asText(student.tie?.amount),
    "Tie Pending Amount": asText(
      student.tie?.pendingAmount
    ),
    "Diary Amount": asText(student.diary?.amount),
    "Diary Pending Amount": asText(
      student.diary?.pendingAmount
    ),
    "Belt Amount": asText(student.belt?.amount),
    "Belt Pending Amount": asText(
      student.belt?.pendingAmount
    ),
    "Arrears Amount": asText(student.arrears?.amount),
    "Arrears Pending Amount": asText(
      student.arrears?.pendingAmount
    ),
    "Pending Tuition Fee": asText(
      student.pendingTuitionFee
    ),
    "Pending Textbook Fee": asText(
      student.pendingTextbookFee
    ),
    "Pending Notebook Fee": asText(
      student.pendingNotebookFee
    ),
    "Pending Amount": asText(student.pendingAmount),
    "Coupon Code": asText(student.couponCode),
    "TC No": asText(student.tcNo),
    Siblings: asText(student.siblings),
    "Complete Record": asText(student),
  }));
};

const escapeHtml = (value: unknown): string =>
  asText(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const buildStudentReportHtml = (
  rows: ExportRow[],
  selectedClass: string
): string => {
  const columns = Object.keys(
    rows[0] ?? {
      "Student ID": "",
      "Student Name": "",
      "Admission No": "",
      Class: "",
      Section: "",
      "Father Name": "",
      "Date of Birth": "",
      "Date of Joining": "",
      "Academic Year ID": "",
      "Phone No": "",
      Aadhaar: "",
      "Tie Amount": "",
      "Tie Pending Amount": "",
      "Diary Amount": "",
      "Diary Pending Amount": "",
      "Belt Amount": "",
      "Belt Pending Amount": "",
      "Arrears Amount": "",
      "Arrears Pending Amount": "",
      "Pending Tuition Fee": "",
      "Pending Textbook Fee": "",
      "Pending Notebook Fee": "",
      "Pending Amount": "",
      "Coupon Code": "",
      "TC No": "",
      Siblings: "",
      "Complete Record": "",
    }
  );

  const headerHtml = columns
    .map((column) => `<th>${escapeHtml(column)}</th>`)
    .join("");

  const bodyHtml = rows.length
    ? rows
        .map(
          (row) =>
            `<tr>${columns
              .map(
                (column) =>
                  `<td>${escapeHtml(
                    row[column as keyof ExportRow]
                  )}</td>`
              )
              .join("")}</tr>`
        )
        .join("")
    : `<tr><td colspan="${columns.length}">No students found.</td></tr>`;

  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          @page {
            size: A4 landscape;
            margin: 12mm;
          }
          body {
            font-family: Arial, sans-serif;
            color: #111827;
            font-size: 9px;
          }
          h1 {
            font-size: 16px;
            margin: 0 0 4px;
          }
          p {
            margin: 0 0 12px;
            color: #4b5563;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            table-layout: auto;
          }
          th, td {
            border: 1px solid #d1d5db;
            padding: 4px;
            text-align: left;
            vertical-align: top;
            word-break: break-word;
          }
          th {
            background: #eef2ff;
            font-weight: bold;
          }
          tr {
            page-break-inside: avoid;
          }
        </style>
      </head>
      <body>
        <h1>Student Report</h1>
        <p>
          Class: ${escapeHtml(selectedClass === "ALL" ? "All Classes" : selectedClass)}
          | Students: ${rows.length}
        </p>
        <table>
          <thead><tr>${headerHtml}</tr></thead>
          <tbody>${bodyHtml}</tbody>
        </table>
      </body>
    </html>
  `;
};

/* ============================================================
   SCREEN
============================================================ */

const PrincipalStudentsScreen = () => {
  const styles = useStyles();

  const navigation =
    useNavigation<
      NativeStackNavigationProp<
        RootStackParamList
      >
    >();

  const { width } =
    useWindowDimensions();


  /* ==========================================================
     RESPONSIVE
  ========================================================== */

  const isSmallScreen =
    width < 600;

  const isTablet =
    width >= 600 &&
    width < 1024;

  const isDesktop =
    width >= 1024;

  const horizontalPadding =
    isSmallScreen
      ? Metrics.x3
      : isTablet
        ? Metrics.x4
        : Metrics.x6;


  /* ==========================================================
     USER
  ========================================================== */

  const user =
    useUserStore(
      (state) => state.user
    )!;

  const logout =
    useUserStore(
      (state) => state.logout
    );


  /* ==========================================================
     STATE
  ========================================================== */

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    selectedClass,
    setSelectedClass,
  ] = useState("ALL");

  const [
    showSnackbar,
    setShowSnackbar,
  ] = useState(false);

  const [
    snackbarText,
    setSnackbarText,
  ] = useState("");

  const [
    profileMenuVisible,
    setProfileMenuVisible,
  ] = useState(false);


  /* ==========================================================
     AUTHORIZATION
  ========================================================== */

  if (!user) {
    return (
      <View style={styles.center}>
        <Text
          style={styles.errorText}
        >
          Session not found.
        </Text>
      </View>
    );
  }

  if (user.role !== "PRINCIPAL" && user.role !== "ADMIN") {
    return (
      <View style={styles.center}>
        <Text
          style={styles.errorText}
        >
          You are not authorized to
          access the Principal Students
          screen.
        </Text>
      </View>
    );
  }


  /* ==========================================================
     QUERY
  ========================================================== */

  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery(
    [
      "principal-all-students",
    ],
    principalServices.getStudents
  );


  /* ==========================================================
     ERROR
  ========================================================== */

  useEffect(() => {
    if (!error) {
      return;
    }

    setSnackbarText(
      // @ts-ignore
      error?.response?.data?.message ??
        "Unable to load student information."
    );

    setShowSnackbar(true);
  }, [error]);


  /* ==========================================================
     STUDENT DATA
  ========================================================== */

  const students =
    useMemo(() => {
      /*
       * Supports these common API shapes:
       *
       * {
       *   students: [...]
       * }
       *
       * {
       *   data: [...]
       * }
       *
       * [...]
       */

      if (Array.isArray(data)) {
        return data as Student[];
      }

      if (
        Array.isArray(
          data?.students
        )
      ) {
        return data.students as Student[];
      }

      if (
        Array.isArray(
          data?.data
        )
      ) {
        return data.data as Student[];
      }

      return [];
    }, [data]);


  /* ==========================================================
     SEARCH
  ========================================================== */

  const searchValue =
    search
      .trim()
      .toLowerCase();

  const availableClasses = useMemo(() => {
    const classSet = new Set(
      students
        .map((student) => getStudentClass(student).trim())
        .filter(Boolean)
    );

    return Array.from(classSet).sort((a, b) =>
      a.localeCompare(b, undefined, {
        numeric: true,
        sensitivity: "base",
      })
    );
  }, [students]);

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const studentName = asText(
        student.name ??
          student.studentName ??
          ""
      ).toLowerCase();

      const admissionNo = asText(
        student.admissionNo ??
          student.admissionNumber ??
          ""
      ).toLowerCase();

      const className = getStudentClass(student);

      const matchesSearch =
        !searchValue ||
        studentName.includes(searchValue) ||
        admissionNo.includes(searchValue);

      const matchesClass =
        selectedClass === "ALL" ||
        className === selectedClass;

      return matchesSearch && matchesClass;
    });
  }, [
    students,
    searchValue,
    selectedClass,
  ]);

  /* ==========================================================
     TOTAL STUDENTS
  ========================================================== */

  const totalStudents =
    students.length;


  /* ==========================================================
     LOGOUT
  ========================================================== */

  const handleLogout = () => {
    setProfileMenuVisible(
      false
    );

    logout();

    navigation.reset({
      index: 0,
      routes: [
        {
          name:
            RootStackScreenNames.Login,
        },
      ],
    });
  };


  /* ==========================================================
     BACK TO DASHBOARD
  ========================================================== */

  const goToDashboard = () => {
    navigation.navigate(
      RootStackScreenNames.PrincipalDashboard
    );
  };


  /* ==========================================================
     REGISTER STUDENT
  ========================================================== */

  const openStudentRegistration =
    () => {
      navigation.navigate(
        RootStackScreenNames.StudentRegistrationForm
      );
    };


  /* ==========================================================
     PROFILE DROPDOWN
  ========================================================== */

  const renderProfileDropdown =
    () => {
      if (!profileMenuVisible) {
        return null;
      }

      return (
        <Modal
          visible={
            profileMenuVisible
          }
          transparent
          animationType="fade"
          statusBarTranslucent
          onRequestClose={() => {
            setProfileMenuVisible(
              false
            );
          }}
        >
          <Pressable
            style={
              styles.modalOverlay
            }
            onPress={() => {
              setProfileMenuVisible(
                false
              );
            }}
          >
            <View
              style={[
                styles.profileDropdown,
                isSmallScreen &&
                  styles.profileDropdownMobile,
              ]}
            >

              {/* PROFILE HEADER */}

              <View
                style={
                  styles.dropdownProfileHeader
                }
              >

                <Avatar.Text
                  size={46}
                  label={getInitials(
                    user.name
                  )}
                  color="#FFFFFF"
                  style={
                    styles.dropdownAvatar
                  }
                />

                <View
                  style={
                    styles.dropdownUserInfo
                  }
                >

                  <Text
                    style={
                      styles.dropdownUserName
                    }
                    numberOfLines={1}
                  >
                    {user.name ||
                      "Principal"}
                  </Text>

                  <Text
                    style={
                      styles.dropdownUserEmail
                    }
                    numberOfLines={1}
                  >
                    {user.email || ""}
                  </Text>

                  <Text
                    style={
                      styles.dropdownUserRole
                    }
                  >
                    Principal
                  </Text>

                </View>

              </View>

              <Divider
                style={
                  styles.dropdownDivider
                }
              />


              {/* PROFILE */}

              <TouchableOpacity
                activeOpacity={0.7}
                style={
                  styles.dropdownItem
                }
                onPress={() => {
                  setProfileMenuVisible(
                    false
                  );

                  setSnackbarText(
                    "Principal profile coming next."
                  );

                  setShowSnackbar(
                    true
                  );
                }}
              >

                <View
                  style={
                    styles.dropdownIconContainer
                  }
                >
                  <Text
                    style={
                      styles.dropdownIcon
                    }
                  >
                    👤
                  </Text>
                </View>

                <View
                  style={
                    styles.dropdownItemTextContainer
                  }
                >

                  <Text
                    style={
                      styles.dropdownItemTitle
                    }
                  >
                    Profile
                  </Text>

                  <Text
                    style={
                      styles.dropdownItemSubtitle
                    }
                  >
                    View your principal profile
                  </Text>

                </View>

              </TouchableOpacity>


              {/* LOGOUT */}

              <TouchableOpacity
                activeOpacity={0.7}
                style={[
                  styles.dropdownItem,
                  styles.logoutItem,
                ]}
                onPress={
                  handleLogout
                }
              >

                <View
                  style={[
                    styles.dropdownIconContainer,
                    styles.logoutIconContainer,
                  ]}
                >

                  <Text
                    style={[
                      styles.dropdownIcon,
                      styles.logoutIcon,
                    ]}
                  >
                    ↪
                  </Text>

                </View>

                <View
                  style={
                    styles.dropdownItemTextContainer
                  }
                >

                  <Text
                    style={[
                      styles.dropdownItemTitle,
                      styles.logoutTitle,
                    ]}
                  >
                    Logout
                  </Text>

                  <Text
                    style={
                      styles.dropdownItemSubtitle
                    }
                  >
                    Sign out of this account
                  </Text>

                </View>

              </TouchableOpacity>

            </View>
          </Pressable>
        </Modal>
      );
    };


  /* ==========================================================
     NAVBAR
  ========================================================== */

  // const renderNavbar =
  //   () => {
  //     return null;
  //     return (
  //       <View
  //         style={
  //           styles.navbar
  //         }
  //       >

  //         {/* LEFT */}

  //         <View
  //           style={
  //             styles.navbarLeft
  //           }
  //         >

  //           <TouchableOpacity
  //             activeOpacity={0.8}
  //             onPress={
  //               goToDashboard
  //             }
  //             style={
  //               styles.backButton
  //             }
  //           >

  //             <Text
  //               style={
  //                 styles.backIcon
  //               }
  //             >
  //               ‹
  //             </Text>

  //           </TouchableOpacity>

  //           <Avatar.Icon
  //             size={
  //               isSmallScreen
  //                 ? 42
  //                 : 46
  //             }
  //             icon="school"
  //             color="#FFFFFF"
  //             style={
  //               styles.navbarLogo
  //             }
  //           />

  //           <View
  //             style={
  //               styles.navbarBrand
  //             }
  //           >

  //             <Text
  //               style={
  //                 styles.navbarSchoolName
  //               }
  //               numberOfLines={1}
  //             >
  //               {user.schoolName ||
  //                 "School Platform"}
  //             </Text>

  //             <Text
  //               style={
  //                 styles.navbarSubtitle
  //               }
  //             >
  //               Principal Administration
  //             </Text>

  //           </View>

  //         </View>


  //         {/* RIGHT */}

  //         <View
  //           style={
  //             styles.navbarRight
  //           }
  //         >

  //           <IconButton
  //             icon="refresh"
  //             size={
  //               isSmallScreen
  //                 ? 20
  //                 : 22
  //             }
  //             iconColor={
  //               Colors.brandPrimary
  //             }
  //             onPress={() => {
  //               refetch();
  //             }}
  //             style={
  //               styles.refreshButton
  //             }
  //           />

  //           <TouchableOpacity
  //             activeOpacity={0.8}
  //             onPress={() => {
  //               setProfileMenuVisible(
  //                 true
  //               );
  //             }}
  //             style={[
  //               styles.profileButton,
  //               profileMenuVisible &&
  //                 styles.profileButtonActive,
  //             ]}
  //           >

  //             <Avatar.Text
  //               size={
  //                 isSmallScreen
  //                   ? 38
  //                   : 42
  //               }
  //               label={getInitials(
  //                 user.name
  //               )}
  //               color="#FFFFFF"
  //               style={
  //                 styles.profileAvatar
  //               }
  //             />

  //             {!isSmallScreen && (
  //               <View
  //                 style={
  //                   styles.profileDetails
  //                 }
  //               >

  //                 <Text
  //                   style={
  //                     styles.profileName
  //                   }
  //                   numberOfLines={1}
  //                 >
  //                   {user.name ||
  //                     "Principal"}
  //                 </Text>

  //                 <Text
  //                   style={
  //                     styles.profileRole
  //                   }
  //                 >
  //                   Principal
  //                 </Text>

  //               </View>
  //             )}

  //             <Text
  //               style={
  //                 styles.profileArrow
  //               }
  //             >
  //               {profileMenuVisible
  //                 ? "⌃"
  //                 : "⌄"}
  //             </Text>

  //           </TouchableOpacity>

  //         </View>

  //       </View>
  //     );
  //   };


  /* ==========================================================
     PAGE HEADER
  ========================================================== */

  const renderPageHeader =
    () => {
      return (
        <View
          style={
            styles.pageHeader
          }
        >

          <View
            style={
              styles.pageHeaderText
            }
          >

            <Text
              style={
                styles.eyebrow
              }
            >
              PEOPLE & USERS
            </Text>

            <Text
              style={
                styles.pageTitle
              }
            >
              Students
            </Text>

            <Text
              style={
                styles.pageSubtitle
              }
            >
              Manage all students
              across your school.
            </Text>

          </View>

          <Button
            mode="contained"
            icon="account-plus"
            onPress={
              openStudentRegistration
            }
            style={
              styles.registerButton
            }
            contentStyle={
              styles.registerButtonContent
            }
          >
            Register Student
          </Button>

        </View>
      );
    };


  /* ==========================================================
     SUMMARY
  ========================================================== */

  const renderSummary =
    () => {
      return (
        <View
          style={[
            styles.summaryGrid,
            isSmallScreen &&
              styles.summaryGridMobile,
          ]}
        >

          {/* TOTAL STUDENTS */}

          <Card
            style={
              styles.summaryCard
            }
          >

            <Card.Content>

              <View
                style={
                  styles.summaryTop
                }
              >

                <Avatar.Icon
                  size={44}
                  icon="account-group-outline"
                  color="#4F46E5"
                  style={[
                    styles.summaryIcon,
                    {
                      backgroundColor:
                        "#EEF2FF",
                    },
                  ]}
                />

              </View>

              <Text
                style={
                  styles.summaryValue
                }
              >
                {formatNumber(
                  totalStudents
                )}
              </Text>

              <Text
                style={
                  styles.summaryLabel
                }
              >
                Total Students
              </Text>

            </Card.Content>

          </Card>


          {/* CURRENT RESULTS */}

          <Card
            style={
              styles.summaryCard
            }
          >

            <Card.Content>

              <View
                style={
                  styles.summaryTop
                }
              >

                <Avatar.Icon
                  size={44}
                  icon="account-search-outline"
                  color="#16834B"
                  style={[
                    styles.summaryIcon,
                    {
                      backgroundColor:
                        "#EFFAF5",
                    },
                  ]}
                />

              </View>

              <Text
                style={
                  styles.summaryValue
                }
              >
                {formatNumber(
                  filteredStudents.length
                )}
              </Text>

              <Text
                style={
                  styles.summaryLabel
                }
              >
                Matching Students
              </Text>

            </Card.Content>

          </Card>


          {/* SCHOOL CODE */}

          <Card
            style={
              styles.summaryCard
            }
          >

            <Card.Content>

              <View
                style={
                  styles.summaryTop
                }
              >

                <Avatar.Icon
                  size={44}
                  icon="identifier"
                  color="#C55A11"
                  style={[
                    styles.summaryIcon,
                    {
                      backgroundColor:
                        "#FFF5ED",
                    },
                  ]}
                />

              </View>

              <Text
                style={
                  styles.summaryCode
                }
                numberOfLines={1}
              >
                {user.schoolCode ||
                  "N/A"}
              </Text>

              <Text
                style={
                  styles.summaryLabel
                }
              >
                School Code
              </Text>

            </Card.Content>

          </Card>

        </View>
      );
    };


  const exportRows = useMemo(
    () => getExportRows(filteredStudents),
    [filteredStudents]
  );

  const exportToExcel = async () => {
    try {
      const worksheet =
        XLSX.utils.json_to_sheet(exportRows);
      const workbook =
        XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "Students"
      );

      const base64 = XLSX.write(workbook, {
        type: "base64",
        bookType: "xlsx",
      });

      const fileUri = `${FileSystem.cacheDirectory}students-${Date.now()}.xlsx`;

      await FileSystem.writeAsStringAsync(
        fileUri,
        base64,
        {
          encoding:
            FileSystem.EncodingType.Base64,
        }
      );

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          dialogTitle: "Export student Excel file",
          UTI:
            "com.microsoft.excel.xlsx",
        });
      } else {
        setSnackbarText(
          "Excel file created, but sharing is not available on this device."
        );
        setShowSnackbar(true);
      }
    } catch (exportError) {
      console.error("Excel export failed:", exportError);
      setSnackbarText(
        "Unable to export the student Excel file."
      );
      setShowSnackbar(true);
    }
  };

  const exportToPDF = async () => {
    try {
      const html = buildStudentReportHtml(
        exportRows,
        selectedClass
      );

      const { uri } =
        await Print.printToFileAsync({
          html,
          margins: {
            top: 24,
            bottom: 24,
            left: 24,
            right: 24,
          },
        });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: "application/pdf",
          dialogTitle: "Export student PDF file",
          UTI: "com.adobe.pdf",
        });
      } else {
        setSnackbarText(
          "PDF file created, but sharing is not available on this device."
        );
        setShowSnackbar(true);
      }
    } catch (exportError) {
      console.error("PDF export failed:", exportError);
      setSnackbarText(
        "Unable to export the student PDF file."
      );
      setShowSnackbar(true);
    }
  };

  const printStudents = async () => {
    try {
      const html = buildStudentReportHtml(
        exportRows,
        selectedClass
      );

      await Print.printAsync({ html });
    } catch (printError) {
      console.error("Printing failed:", printError);
      setSnackbarText(
        "Unable to print the student report."
      );
      setShowSnackbar(true);
    }
  };

  /* ==========================================================
     SEARCH
  ========================================================== */

  const renderSearch =
    () => {
      return (
        <Card
          style={
            styles.searchCard
          }
        >

          <Card.Content>

            <View
              style={
                styles.searchHeader
              }
            >

              <View
                style={
                  styles.searchHeaderText
                }
              >

                <Text
                  style={
                    styles.searchTitle
                  }
                >
                  Find a Student
                </Text>

                <Text
                  style={
                    styles.searchSubtitle
                  }
                >
                  Search by student name
                  or admission number
                </Text>

              </View>

              {search.length > 0 && (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() =>
                    setSearch("")
                  }
                >
                  <Text
                    style={
                      styles.clearSearch
                    }
                  >
                    Clear
                  </Text>
                </TouchableOpacity>
              )}

            </View>

            <TextInput
              mode="outlined"
              label="Search student"
              placeholder="Enter name or admission number"
              value={search}
              onChangeText={
                setSearch
              }
              autoCapitalize="none"
              autoCorrect={false}
              left={
                <TextInput.Icon
                  icon="magnify"
                />
              }
              style={
                styles.searchInput
              }
              outlineStyle={
                styles.searchOutline
              }
            />

            <Text style={styles.filterLabel}>
              Filter by class
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.classChipsContent}
              style={styles.classChipsScroll}
            >
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setSelectedClass("ALL")}
                style={[
                  styles.classChip,
                  selectedClass === "ALL" &&
                    styles.classChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.classChipText,
                    selectedClass === "ALL" &&
                      styles.classChipTextActive,
                  ]}
                >
                  All Classes
                </Text>
              </TouchableOpacity>

              {availableClasses.map((className) => (
                <TouchableOpacity
                  key={className}
                  activeOpacity={0.8}
                  onPress={() => setSelectedClass(className)}
                  style={[
                    styles.classChip,
                    selectedClass === className &&
                      styles.classChipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.classChipText,
                      selectedClass === className &&
                        styles.classChipTextActive,
                    ]}
                  >
                    {`Class ${className}`}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.exportButtonsRow}>
              <Button
                mode="outlined"
                icon="file-pdf-box"
                onPress={exportToPDF}
                style={styles.exportButton}
                compact
              >
                PDF
              </Button>

              <Button
                mode="outlined"
                icon="file-excel"
                onPress={exportToExcel}
                style={styles.exportButton}
                compact
              >
                Excel
              </Button>

              <Button
                mode="outlined"
                icon="printer"
                onPress={printStudents}
                style={styles.exportButton}
                compact
              >
                Print
              </Button>
            </View>

            <Text style={styles.exportSummary}>
              Exporting {filteredStudents.length} student(s)
              {selectedClass === "ALL"
                ? ""
                : ` from class ${selectedClass}`}
            </Text>

          </Card.Content>

        </Card>
      );
    };


  /* ==========================================================
     STUDENT ITEM
  ========================================================== */

  const renderStudent = ({
    item,
  }: {
    item: Student;
  }) => {

    const studentName =
      item.name ??
      item.studentName ??
      "Unnamed Student";

    const admissionNo =
      item.admissionNo ??
      item.admissionNumber ??
      "N/A";

    const className = getStudentClass(item);

    return (
      <View
        style={
          styles.studentTouchable
        }
      >

        <Card
          style={
            styles.studentCard
          }
        >

          <Card.Content>

            <View
              style={
                styles.studentCardRow
              }
            >

              {/* AVATAR */}

              <Avatar.Text
                size={50}
                label={getInitials(
                  studentName
                )}
                color="#FFFFFF"
                style={
                  styles.studentAvatar
                }
              />


              {/* INFO */}

              <Pressable
                style={
                  styles.studentInfo
                }
                onPress={() => {
                  navigation.navigate(RootStackScreenNames.StudentDetails, { student: item });
                }}
              >

                <Text
                  style={
                    styles.studentName
                  }
                  numberOfLines={1}
                >
                  {studentName}
                </Text>

                <Text
                  style={
                    styles.studentAdmission
                  }
                  numberOfLines={1}
                >
                  Admission No:{" "}
                  {admissionNo}
                </Text>

                {className ? (
                  <Text
                    style={
                      styles.studentClass
                    }
                    numberOfLines={1}
                  >
                    Class: {className}
                  </Text>
                ) : null}

              </Pressable>


              {/* RIGHT */}

              <View
                style={
                  styles.studentRight
                }
              >

                <View
                  style={
                    styles.admissionBadge
                  }
                >

                  <Text
                    style={
                      styles.admissionBadgeText
                    }
                  >
                    {admissionNo}
                  </Text>

                </View>

                <Pressable
                  style={styles.studentAction}
                  onPress={() => navigation.navigate(RootStackScreenNames.StudentDetails, { student: item })}
                >
                  <Text style={styles.studentActionText}>View</Text>
                </Pressable>

                <Pressable
                  style={[styles.studentAction, styles.collectFeeAction]}
                  onPress={() => navigation.navigate(RootStackScreenNames.PrincipalFeeCollection, { admissionNo })}
                >
                  <Text style={styles.collectFeeText}>Collect Fee</Text>
                </Pressable>

              </View>

            </View>

          </Card.Content>

        </Card>

      </View>
    );
  };


  /* ==========================================================
     EMPTY
  ========================================================== */

  const renderEmpty =
    () => {
      return (
        <View
          style={
            styles.empty
          }
        >

          <View
            style={
              styles.emptyIconContainer
            }
          >

            <Avatar.Icon
              size={64}
              icon={
                searchValue
                  ? "magnify"
                  : "account-group-outline"
              }
              color="#4F46E5"
              style={
                styles.emptyIcon
              }
            />

          </View>

          <Text
            style={
              styles.emptyTitle
            }
          >
            {searchValue
              ? "No matching students"
              : "No students found"}
          </Text>

          <Text
            style={
              styles.emptyText
            }
          >
            {searchValue
              ? "Try a different student name or admission number."
              : "There are currently no student records available."}
          </Text>

          {searchValue && (
            <Button
              mode="outlined"
              onPress={() =>
                setSearch("")
              }
              style={
                styles.emptyButton
              }
            >
              Clear Search
            </Button>
          )}

        </View>
      );
    };


  /* ==========================================================
     LOADING
  ========================================================== */

  if (isLoading) {
    return (
      <View
        style={
          styles.page
        }
      >

        <View
          style={[
            styles.loadingScreen,
            {
              paddingHorizontal:
                horizontalPadding,
            },
          ]}
        >


          <View
            style={
              styles.loaderContent
            }
          >

            <Avatar.Icon
              size={64}
              icon="account-group-outline"
              color={
                Colors.brandPrimary
              }
              style={
                styles.loadingIcon
              }
            />

            <ActivityIndicator
              size="large"
              color={
                Colors.brandPrimary
              }
              style={
                styles.loader
              }
            />

            <Text
              style={
                styles.loadingTitle
              }
            >
              Loading students...
            </Text>

            <Text
              style={
                styles.loadingText
              }
            >
              Fetching all student
              information for your school.
            </Text>

          </View>

        </View>

        {renderProfileDropdown()}

      </View>
    );
  }


  /* ==========================================================
     MAIN UI
  ========================================================== */

  return (
    <View
      style={
        styles.page
      }
    >

      <FlatList
        data={
          filteredStudents
        }

        renderItem={
          renderStudent
        }

        keyExtractor={(
          item,
          index
        ) =>
          String(
            item.id ??
            item._id ??
            item.admissionNo ??
            item.admissionNumber ??
            index
          )
        }

        /*
         * Render around 15 items initially
         * and process additional items in
         * batches of 15.
         */
        initialNumToRender={15}
        maxToRenderPerBatch={15}
        windowSize={5}

        showsVerticalScrollIndicator={
          false
        }

        contentContainerStyle={[
          styles.listContent,
          {
            paddingHorizontal:
              horizontalPadding,
          },
        ]}

        ListHeaderComponent={
          <>
            {renderPageHeader()}
            {renderSummary()}
            {renderSearch()}

            {filteredStudents.length >
              0 && (
              <View
                style={
                  styles.studentsHeader
                }
              >

                <View>

                  <Text
                    style={
                      styles.studentsTitle
                    }
                  >
                    Students
                  </Text>

                  <Text
                    style={
                      styles.studentsSubtitle
                    }
                  >
                    Showing students from
                    your school.
                  </Text>

                </View>

                <View
                  style={
                    styles.studentsCountBadge
                  }
                >

                  <Text
                    style={
                      styles.studentsCountText
                    }
                  >
                    {filteredStudents.length}
                  </Text>

                </View>

              </View>
            )}
          </>
        }

        ListEmptyComponent={
          renderEmpty()
        }

        refreshing={
          isFetching
        }

        onRefresh={
          refetch
        }
      />

      {renderProfileDropdown()}

      <Snackbar
        visible={
          showSnackbar
        }
        onDismiss={() => {
          setShowSnackbar(
            false
          );
        }}
        duration={3000}
        style={
          styles.snackbar
        }
      >
        {snackbarText}
      </Snackbar>

    </View>
  );
};


/* ============================================================
   INITIALS
============================================================ */

const getInitials = (
  name?: string | null
) => {
  if (!name) {
    return "ST";
  }

  const parts =
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean);

  if (parts.length === 1) {
    return parts[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return (
    parts[0][0] +
    parts[
      parts.length - 1
    ][0]
  ).toUpperCase();
};


/* ============================================================
   NUMBER FORMAT
============================================================ */

const formatNumber = (
  value: number
) => {
  return new Intl.NumberFormat(
    "en-IN"
  ).format(value);
};


/* ============================================================
   STYLES
============================================================ */

const useStyles = makeStyles(
  () => {
    return {

      /* ======================================================
         PAGE
      ====================================================== */

      
page: {
  flex: 1,
  backgroundColor: "#F5F7FB",
},

listContent: {
  paddingTop: Metrics.x3,
  paddingBottom: Metrics.x8,
},


      /* ======================================================
         NAVBAR
      ====================================================== */

      

      

      backButton: {
        width: 38,

        height: 38,

        borderRadius: 12,

        alignItems: "center",

        justifyContent:
          "center",

        backgroundColor:
          "#F3F4F6",

        marginRight:
          Metrics.x2,
      },

      backIcon: {
        fontSize: 28,

        lineHeight: 30,

        color:
          Colors.subtext,
      },

      navbarLogo: {
        backgroundColor:
          Colors.brandPrimary,

        marginRight:
          Metrics.x2,
      },

      navbarBrand: {
        flex: 1,

        minWidth: 0,
      },

      navbarSchoolName: {
        fontSize: 15,

        fontWeight: "800",

        color: "#171717",
      },

      navbarSubtitle: {
        fontSize: 11,

        color:
          Colors.subtext,

        marginTop: 2,
      },

      navbarRight: {
        flexDirection:
          "row",

        alignItems:
          "center",

        marginLeft:
          Metrics.x2,
      },

      refreshButton: {
        margin: 0,

        marginRight:
          Metrics.x1,
      },


      /* ======================================================
         PROFILE
      ====================================================== */

      profileButton: {
        flexDirection:
          "row",

        alignItems:
          "center",

        paddingVertical:
          Metrics.x1,

        paddingHorizontal:
          Metrics.x1,

        borderRadius: 24,
      },

      profileButtonActive: {
        backgroundColor:
          "#F4F5F9",
      },

      profileAvatar: {
        backgroundColor:
          Colors.brandPrimary,
      },

      profileDetails: {
        marginLeft:
          Metrics.x2,

        maxWidth: 145,
      },

      profileName: {
        fontSize: 13,

        fontWeight: "700",

        color: "#171717",
      },

      profileRole: {
        fontSize: 11,

        color:
          Colors.subtext,

        marginTop: 1,
      },

      profileArrow: {
        fontSize: 17,

        color:
          Colors.subtext,

        marginLeft:
          Metrics.x1,
      },


      /* ======================================================
         PAGE HEADER
      ====================================================== */

      
pageHeader: {
  marginBottom: Metrics.x5,
},

pageHeaderText: {
  marginBottom: Metrics.x3,
},

eyebrow: {
  fontSize: 11,
  fontWeight: "800",
  letterSpacing: 1.2,
  color: Colors.brandPrimary,
  marginBottom: Metrics.x1,
},

pageTitle: {
  fontSize: 30,
  lineHeight: 36,
  fontWeight: "800",
  color: "#111827",
},

pageSubtitle: {
  fontSize: 14,
  lineHeight: 21,
  color: "#6B7280",
  marginTop: Metrics.x1,
  maxWidth: 650,
},

registerButton: {
  borderRadius: 12,
  backgroundColor: Colors.brandPrimary,
},

registerButtonContent: {
  minHeight: 46,
  paddingHorizontal: Metrics.x2,
},


      /* ======================================================
         SUMMARY
      ====================================================== */

      
summaryGrid: {
  flexDirection: "row",
  marginHorizontal: -Metrics.x1,
  marginBottom: Metrics.x5,
},

summaryGridMobile: {
  flexDirection: "row",
  width: "100%",
},

summaryCard: {
  flex: 1,
  marginHorizontal: Metrics.x1,
  marginBottom: Metrics.x2,
  backgroundColor: "#FFFFFF",
  borderRadius: 16,
  borderWidth: 1,
  borderColor: "#E8EBF2",
  elevation: 0,
  shadowColor: "#111827",
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.04,
  shadowRadius: 8,
},

summaryTop: {
  marginBottom: Metrics.x2,
},

summaryIcon: {
  margin: 0,
},

summaryValue: {
  fontSize: 26,
  lineHeight: 32,
  fontWeight: "800",
  color: "#111827",
},

summaryCode: {
  fontSize: 20,
  fontWeight: "800",
  color: "#111827",
  marginTop: 5,
},

summaryLabel: {
  fontSize: 12,
  fontWeight: "500",
  color: "#6B7280",
  marginTop: 4,
},


      /* ======================================================
         SEARCH
      ====================================================== */

      
searchCard: {
  backgroundColor: "#FFFFFF",
  borderRadius: 16,
  borderWidth: 1,
  borderColor: "#E8EBF2",
  elevation: 0,
  marginBottom: Metrics.x5,
},

searchHeader: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: Metrics.x3,
},

searchHeaderText: {
  flex: 1,
},

searchTitle: {
  fontSize: 17,
  fontWeight: "800",
  color: "#111827",
},

searchSubtitle: {
  fontSize: 12,
  color: "#6B7280",
  marginTop: 3,
},

clearSearch: {
  fontSize: 13,
  fontWeight: "700",
  color: Colors.brandPrimary,
},

searchInput: {
  backgroundColor: "#FAFBFD",
  fontSize: 14,
},

searchOutline: {
  borderRadius: 12,
  borderWidth: 1,
  borderColor: "#DDE2EC",
},


      /* ======================================================
         STUDENTS HEADER
      ====================================================== */

      studentsHeader: {
        flexDirection:
          "row",

        alignItems:
          "center",

        justifyContent:
          "space-between",

        marginBottom:
          Metrics.x3,
      },

      studentsTitle: {
        fontSize: 20,

        fontWeight: "800",

        color: "#171717",
      },

      studentsSubtitle: {
        fontSize: 12,

        color:
          Colors.subtext,

        marginTop: 2,
      },

      studentsCountBadge: {
        minWidth: 36,

        height: 36,

        paddingHorizontal:
          Metrics.x2,

        borderRadius: 12,

        alignItems: "center",

        justifyContent:
          "center",

        backgroundColor:
          "#EEF2FF",
      },

      studentsCountText: {
        fontSize: 13,

        fontWeight: "800",

        color: "#4F46E5",
      },


      /* ======================================================
         STUDENT CARD
      ====================================================== */

      
studentTouchable: {
  marginBottom: Metrics.x3,
},

studentCard: {
  backgroundColor: "#FFFFFF",
  borderRadius: 16,
  borderWidth: 1,
  borderColor: "#E8EBF2",
  elevation: 0,
  shadowColor: "#111827",
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.035,
  shadowRadius: 8,
},

studentCardRow: {
  flexDirection: "row",
  alignItems: "center",
  minHeight: 78,
},

studentAvatar: {
  backgroundColor: Colors.brandPrimary,
  marginRight: Metrics.x3,
},

studentInfo: {
  flex: 1,
  minWidth: 0,
},

studentName: {
  fontSize: 16,
  lineHeight: 21,
  fontWeight: "800",
  color: "#111827",
},

studentAdmission: {
  fontSize: 12,
  color: "#6B7280",
  marginTop: Metrics.x1,
},

studentClass: {
  fontSize: 12,
  color: "#6B7280",
  marginTop: 3,
},

studentRight: {
  alignItems: "flex-end",
  marginLeft: Metrics.x2,
},

admissionBadge: {
  maxWidth: 110,
  minHeight: 28,
  paddingHorizontal: Metrics.x2,
  borderRadius: 8,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "#F3F4F6",
},

admissionBadgeText: {
  fontSize: 10,
  fontWeight: "800",
  color: "#4B5563",
},

studentAction: {
  minHeight: 34,
  paddingHorizontal: Metrics.x2,
  borderRadius: 9,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "#EEF2FF",
  marginTop: Metrics.x1,
},

studentActionText: {
  color: Colors.brandPrimary,
  fontSize: 11,
  fontWeight: "800",
},

collectFeeAction: {
  backgroundColor: Colors.brandPrimary,
},

collectFeeText: {
  color: Colors.textOnPrimary,
  fontSize: 11,
  fontWeight: "800",
},

      
      studentArrow: {
        fontSize: 22,

        color:
          Colors.subtext,

        marginLeft:
          Metrics.x2,
      },


      /* ======================================================
         EMPTY
      ====================================================== */

      empty: {
        alignItems:
          "center",

        justifyContent:
          "center",

        paddingTop:
          Metrics.x8,

        paddingBottom:
          Metrics.x8,

        paddingHorizontal:
          Metrics.x5,
      },

      emptyIconContainer: {
        marginBottom:
          Metrics.x3,
      },

      emptyIcon: {
        backgroundColor:
          "#EEF2FF",
      },

      emptyTitle: {
        fontSize: 18,

        fontWeight: "800",

        color: "#171717",

        textAlign:
          "center",
      },

      emptyText: {
        color:
          Colors.subtext,

        fontSize: 13,

        lineHeight: 19,

        marginTop:
          Metrics.x1,

        textAlign:
          "center",

        maxWidth: 350,
      },

      emptyButton: {
        marginTop:
          Metrics.x3,

        borderRadius: 12,
      },


      /* ======================================================
         LOADING
      ====================================================== */

      loadingScreen: {
        flex: 1,

        paddingTop:
          Metrics.x3,
      },

      loaderContent: {
        flex: 1,

        alignItems:
          "center",

        justifyContent:
          "center",

        paddingBottom:
          Metrics.x8,
      },

      loadingIcon: {
        backgroundColor:
          "#EEF2FF",

        marginBottom:
          Metrics.x3,
      },

      loader: {
        marginBottom:
          Metrics.x2,
      },

      loadingTitle: {
        fontSize: 17,

        fontWeight: "800",

        color: "#171717",
      },

      loadingText: {
        fontSize: 13,

        color:
          Colors.subtext,

        marginTop:
          Metrics.x1,

        textAlign:
          "center",
      },


      /* ======================================================
         PROFILE MODAL
      ====================================================== */

      modalOverlay: {
        flex: 1,

        backgroundColor:
          "rgba(0,0,0,0.08)",
      },

      profileDropdown: {
        position: "absolute",

        top: 82,

        right: Metrics.x4,

        width: 310,

        backgroundColor:
          "#FFFFFF",

        borderRadius: 18,

        borderWidth: 1,

        borderColor:
          "#E5E7EB",

        padding:
          Metrics.x2,

        elevation: 8,
      },

      profileDropdownMobile: {
        left: Metrics.x3,

        right: Metrics.x3,

        width: undefined,
      },

      dropdownProfileHeader: {
        flexDirection:
          "row",

        alignItems:
          "center",

        padding:
          Metrics.x2,
      },

      dropdownAvatar: {
        backgroundColor:
          Colors.brandPrimary,
      },

      dropdownUserInfo: {
        flex: 1,

        marginLeft:
          Metrics.x2,
      },

      dropdownUserName: {
        fontSize: 15,

        fontWeight: "800",

        color: "#171717",
      },

      dropdownUserEmail: {
        fontSize: 12,

        color:
          Colors.subtext,

        marginTop: 2,
      },

      dropdownUserRole: {
        fontSize: 11,

        color:
          Colors.brandPrimary,

        fontWeight: "700",

        marginTop: 3,
      },

      dropdownDivider: {
        marginVertical:
          Metrics.x1,
      },

      dropdownItem: {
        flexDirection:
          "row",

        alignItems:
          "center",

        paddingVertical:
          Metrics.x2,

        paddingHorizontal:
          Metrics.x1,

        borderRadius: 12,
      },

      dropdownIconContainer: {
        width: 40,

        height: 40,

        borderRadius: 12,

        alignItems: "center",

        justifyContent:
          "center",

        backgroundColor:
          "#F3F4F6",
      },

      dropdownIcon: {
        fontSize: 18,
      },

      dropdownItemTextContainer: {
        flex: 1,

        marginLeft:
          Metrics.x2,
      },

      dropdownItemTitle: {
        fontSize: 14,

        fontWeight: "700",

        color: "#171717",
      },

      dropdownItemSubtitle: {
        fontSize: 11,

        color:
          Colors.subtext,

        marginTop: 2,
      },

      logoutItem: {
        marginTop:
          Metrics.x1,

        backgroundColor:
          "#FFF5F5",
      },

      logoutIconContainer: {
        backgroundColor:
          "#FDECEC",
      },

      logoutIcon: {
        color: "#D64545",
      },

      logoutTitle: {
        color: "#D64545",
      },


      filterLabel: {
        marginTop: Metrics.x3,
        marginBottom: Metrics.x1,
        color: Colors.text,
        fontSize: 13,
        fontWeight: "600",
      },

      classChipsScroll: {
        marginTop: Metrics.x1,
      },

      classChipsContent: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: Metrics.x1,
        paddingRight: Metrics.x2,
      },

      classChip: {
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 18,
        paddingHorizontal: Metrics.x3,
        paddingVertical: Metrics.x2,
        marginRight: Metrics.x2,
        backgroundColor: Colors.surface,
      },

      classChipActive: {
        borderColor: Colors.brandPrimary,
        backgroundColor: Colors.brandPrimary,
      },

      classChipText: {
        color: Colors.text,
        fontSize: 12,
        fontWeight: "600",
      },

      classChipTextActive: {
        color: "#FFFFFF",
      },

      exportButtonsRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        alignItems: "center",
        marginTop: Metrics.x2,
        gap: Metrics.x2,
      },

      exportButton: {
        marginTop: Metrics.x1,
      },

      exportSummary: {
        marginTop: Metrics.x2,
        color: Colors.subtext,
        fontSize: 12,
      },

      /* ======================================================
         SNACKBAR
      ====================================================== */

      snackbar: {
        backgroundColor:
          Colors.errorBg,
      },


      /* ======================================================
         ERROR
      ====================================================== */

      center: {
        flex: 1,

        justifyContent:
          "center",

        alignItems:
          "center",

        padding:
          Metrics.x5,

        backgroundColor:
          "#F7F8FC",
      },

      errorText: {
        color:
          Colors.error,

        textAlign:
          "center",

        fontSize: 16,
      },
    };
  }
);


/* ============================================================
   EXPORT
============================================================ */

export {
  PrincipalStudentsScreen,
};