// import React, {
//   useEffect,
//   useMemo,
//   useState,
// } from "react";

// import {
//   FlatList,
//   Modal,
//   Pressable,
//   Text,
//   TouchableOpacity,
//   useWindowDimensions,
//   View,
// } from "react-native";

// import {
//   ActivityIndicator,
//   Avatar,
//   Button,
//   Card,
//   Divider,
//   IconButton,
//   Snackbar,
//   TextInput,
// } from "react-native-paper";

// import {
//   NativeStackNavigationProp,
// } from "@react-navigation/native-stack";

// import {
//   useQuery,
// } from "react-query";

// import {
//   useNavigation,
// } from "@react-navigation/native";

// import {
//   studentServices,
// } from "../../services/studentServices";

// import {
//   Colors,
//   makeStyles,
//   Metrics,
// } from "../../theme";

// import {
//   RootStackParamList,
//   RootStackScreenNames,
// } from "../../types";

// import {
//   useUserStore,
// } from "../../store";


// /* ============================================================
//    TYPES
// ============================================================ */

// type PrincipalClassStudentsScreenProps = {
//   route: {
//     params: {
//       classNumber: string;
//     };
//   };
// };

// type StudentListItem = {
//   admissionNo: string;
//   name: string;
// };


// /* ============================================================
//    SCREEN
// ============================================================ */

// const PrincipalClassStudentsScreen = ({
//   route,
// }: PrincipalClassStudentsScreenProps) => {
//   const styles = useStyles();

//   const navigation =
//     useNavigation<
//       NativeStackNavigationProp<
//         RootStackParamList
//       >
//     >();

//   const { width } =
//     useWindowDimensions();

//   /* ==========================================================
//      RESPONSIVE
//   ========================================================== */

//   const isSmallScreen =
//     width < 600;

//   const isTablet =
//     width >= 600 &&
//     width < 1024;

//   const horizontalPadding =
//     isSmallScreen
//       ? Metrics.x3
//       : isTablet
//         ? Metrics.x4
//         : Metrics.x6;


//   /* ==========================================================
//      ROUTE
//   ========================================================== */

//   const {
//     classNumber,
//   } = route.params;


//   /* ==========================================================
//      USER
//   ========================================================== */

//   const user =
//     useUserStore(
//       (state) => state.user
//     );

//   const logout =
//     useUserStore(
//       (state) => state.logout
//     );


//   /* ==========================================================
//      STATE
//   ========================================================== */

//   const [
//     search,
//     setSearch,
//   ] = useState("");

//   const [
//     showSnackbar,
//     setShowSnackbar,
//   ] = useState(false);

//   const [
//     snackbarText,
//     setSnackbarText,
//   ] = useState("");

//   const [
//     profileMenuVisible,
//     setProfileMenuVisible,
//   ] = useState(false);

//   const [
//     openingStudent,
//     setOpeningStudent,
//   ] = useState<string | null>(
//     null
//   );


//   /* ==========================================================
//      AUTHORIZATION
//   ========================================================== */

//   if (!user) {
//     return (
//       <View style={styles.center}>
//         <Text
//           style={styles.errorText}
//         >
//           Session not found.
//         </Text>
//       </View>
//     );
//   }

//   if (user.role !== "PRINCIPAL") {
//     return (
//       <View style={styles.center}>
//         <Text
//           style={styles.errorText}
//         >
//           You are not authorized to
//           access this screen.
//         </Text>
//       </View>
//     );
//   }


//   /* ==========================================================
//      API
//   ========================================================== */

//   const {
//     data,
//     isLoading,
//     isFetching,
//     isError,
//     error,
//     refetch,
//   } = useQuery(
//     [
//       "principal-class-students",
//       classNumber,
//     ],
//     () =>
//       studentServices
//         .getStudentsByClass({
//           classNumber,
//         }),
//     {
//       enabled:
//         !!classNumber,
//       retry: 1,
//     }
//   );


//   /* ==========================================================
//      ERROR
//   ========================================================== */

//   useEffect(() => {
//     if (!isError) {
//       return;
//     }

//     const message =
//       // @ts-ignore
//       error?.response?.data?.message ??
//       "Unable to load students.";

//     setSnackbarText(message);
//     setShowSnackbar(true);
//   }, [
//     isError,
//     error,
//   ]);


//   /* ==========================================================
//      STUDENTS
//   ========================================================== */

//   const students: StudentListItem[] =
//     data?.students ?? [];


//   /* ==========================================================
//      SEARCH
//   ========================================================== */

//   const searchValue =
//     search
//       .trim()
//       .toLowerCase();

//   const filteredStudents =
//     useMemo(() => {
//       if (!searchValue) {
//         return students;
//       }

//       return students.filter(
//         (student) =>
//           student.name
//             ?.toLowerCase()
//             .includes(
//               searchValue
//             ) ||
//           student.admissionNo
//             ?.toLowerCase()
//             .includes(
//               searchValue
//             )
//       );
//     }, [
//       students,
//       searchValue,
//     ]);


//   /* ==========================================================
//      LOGOUT
//   ========================================================== */

//   const handleLogout = () => {
//     setProfileMenuVisible(
//       false
//     );

//     logout();

//     navigation.reset({
//       index: 0,
//       routes: [
//         {
//           name:
//             RootStackScreenNames.Login,
//         },
//       ],
//     });
//   };


//   /* ==========================================================
//      BACK
//   ========================================================== */

//   const goBackToClasses = () => {
//     navigation.goBack();
//   };


//   /* ==========================================================
//      DASHBOARD
//   ========================================================== */

//   const goToDashboard = () => {
//     navigation.navigate(
//       RootStackScreenNames.PrincipalDashboard
//     );
//   };


//   /* ==========================================================
//      OPEN STUDENT
//   ========================================================== */

//   const openStudent = async (
//     student: StudentListItem
//   ) => {
//     try {
//       setOpeningStudent(
//         student.admissionNo
//       );

//       const fullStudent =
//         await studentServices
//           .getStudentById({
//             admissionNo:
//               student.admissionNo,
//           });

//       navigation.navigate(
//         RootStackScreenNames.StudentDetails,
//         {
//           student:
//             fullStudent,
//         }
//       );
//     } catch (err: any) {
//       console.error(
//         "STUDENT DETAILS ERROR:",
//         err
//       );

//       setSnackbarText(
//         err?.response?.data
//           ?.message ??
//           "Unable to load student details."
//       );

//       setShowSnackbar(true);
//     } finally {
//       setOpeningStudent(null);
//     }
//   };


//   /* ==========================================================
//      NAVBAR
//   ========================================================== */

//   const renderNavbar = () => {
//     return (
//       <View
//         style={styles.navbar}
//       >

//         {/* LEFT */}

//         <View
//           style={styles.navbarLeft}
//         >

//           <TouchableOpacity
//             activeOpacity={0.8}
//             onPress={
//               goBackToClasses
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


//   /* ==========================================================
//      PROFILE DROPDOWN
//   ========================================================== */

//   const renderProfileDropdown =
//     () => {
//       if (!profileMenuVisible) {
//         return null;
//       }

//       return (
//         <Modal
//           visible={
//             profileMenuVisible
//           }
//           transparent
//           animationType="fade"
//           statusBarTranslucent
//           onRequestClose={() => {
//             setProfileMenuVisible(
//               false
//             );
//           }}
//         >

//           <Pressable
//             style={
//               styles.modalOverlay
//             }
//             onPress={() => {
//               setProfileMenuVisible(
//                 false
//               );
//             }}
//           >

//             <View
//               style={[
//                 styles.profileDropdown,
//                 isSmallScreen &&
//                   styles.profileDropdownMobile,
//               ]}
//             >

//               {/* PROFILE HEADER */}

//               <View
//                 style={
//                   styles.dropdownProfileHeader
//                 }
//               >

//                 <Avatar.Text
//                   size={46}
//                   label={getInitials(
//                     user.name
//                   )}
//                   color="#FFFFFF"
//                   style={
//                     styles.dropdownAvatar
//                   }
//                 />

//                 <View
//                   style={
//                     styles.dropdownUserInfo
//                   }
//                 >

//                   <Text
//                     style={
//                       styles.dropdownUserName
//                     }
//                     numberOfLines={1}
//                   >
//                     {user.name ||
//                       "Principal"}
//                   </Text>

//                   <Text
//                     style={
//                       styles.dropdownUserEmail
//                     }
//                     numberOfLines={1}
//                   >
//                     {user.email || ""}
//                   </Text>

//                   <Text
//                     style={
//                       styles.dropdownUserRole
//                     }
//                   >
//                     Principal
//                   </Text>

//                 </View>

//               </View>

//               <Divider
//                 style={
//                   styles.dropdownDivider
//                 }
//               />

//               {/* PROFILE */}

//               <TouchableOpacity
//                 activeOpacity={0.7}
//                 style={
//                   styles.dropdownItem
//                 }
//                 onPress={() => {
//                   setProfileMenuVisible(
//                     false
//                   );

//                   setSnackbarText(
//                     "Principal profile coming next."
//                   );

//                   setShowSnackbar(
//                     true
//                   );
//                 }}
//               >

//                 <View
//                   style={
//                     styles.dropdownIconContainer
//                   }
//                 >
//                   <Text
//                     style={
//                       styles.dropdownIcon
//                     }
//                   >
//                     👤
//                   </Text>
//                 </View>

//                 <View
//                   style={
//                     styles.dropdownItemTextContainer
//                   }
//                 >

//                   <Text
//                     style={
//                       styles.dropdownItemTitle
//                     }
//                   >
//                     Profile
//                   </Text>

//                   <Text
//                     style={
//                       styles.dropdownItemSubtitle
//                     }
//                   >
//                     View your principal profile
//                   </Text>

//                 </View>

//               </TouchableOpacity>


//               {/* LOGOUT */}

//               <TouchableOpacity
//                 activeOpacity={0.7}
//                 style={[
//                   styles.dropdownItem,
//                   styles.logoutItem,
//                 ]}
//                 onPress={
//                   handleLogout
//                 }
//               >

//                 <View
//                   style={[
//                     styles.dropdownIconContainer,
//                     styles.logoutIconContainer,
//                   ]}
//                 >

//                   <Text
//                     style={[
//                       styles.dropdownIcon,
//                       styles.logoutIcon,
//                     ]}
//                   >
//                     ↪
//                   </Text>

//                 </View>

//                 <View
//                   style={
//                     styles.dropdownItemTextContainer
//                   }
//                 >

//                   <Text
//                     style={[
//                       styles.dropdownItemTitle,
//                       styles.logoutTitle,
//                     ]}
//                   >
//                     Logout
//                   </Text>

//                   <Text
//                     style={
//                       styles.dropdownItemSubtitle
//                     }
//                   >
//                     Sign out of this account
//                   </Text>

//                 </View>

//               </TouchableOpacity>

//             </View>

//           </Pressable>

//         </Modal>
//       );
//     };


//   /* ==========================================================
//      PAGE HEADER
//   ========================================================== */

//   const renderPageHeader =
//     () => {
//       return (
//         <View
//           style={
//             styles.pageHeader
//           }
//         >

//           <View
//             style={
//               styles.pageHeaderTop
//             }
//           >

//             <View
//               style={
//                 styles.pageHeaderText
//               }
//             >

//               <Text
//                 style={
//                   styles.eyebrow
//                 }
//               >
//                 STUDENTS
//               </Text>

//               <Text
//                 style={
//                   styles.pageTitle
//                 }
//               >
//                 Class{" "}
//                 {classNumber}
//               </Text>

//               <Text
//                 style={
//                   styles.pageSubtitle
//                 }
//               >
//                 View and manage all students
//                 enrolled in this class.
//               </Text>

//             </View>

//             <Button
//               mode="outlined"
//               icon="arrow-left"
//               onPress={
//                 goBackToClasses
//               }
//               style={
//                 styles.backToClassesButton
//               }
//               contentStyle={
//                 styles.backToClassesContent
//               }
//             >
//               {!isSmallScreen
//                 ? "All Classes"
//                 : "Back"}
//             </Button>

//           </View>

//         </View>
//       );
//     };


//   /* ==========================================================
//      CLASS HERO
//   ========================================================== */

//   const renderClassHero =
//     () => {
//       return (
//         <Card
//           style={
//             styles.classHero
//           }
//         >

//           <Card.Content>

//             <View
//               style={
//                 styles.classHeroRow
//               }
//             >

//               <View
//                 style={
//                   styles.classHeroLeft
//                 }
//               >

//                 <Avatar.Icon
//                   size={60}
//                   icon="google-classroom"
//                   color="#FFFFFF"
//                   style={
//                     styles.classHeroIcon
//                   }
//                 />

//                 <View
//                   style={
//                     styles.classHeroInfo
//                   }
//                 >

//                   <Text
//                     style={
//                       styles.classHeroEyebrow
//                     }
//                   >
//                     CLASS OVERVIEW
//                   </Text>

//                   <Text
//                     style={
//                       styles.classHeroTitle
//                     }
//                   >
//                     Class{" "}
//                     {classNumber}
//                   </Text>

//                   <Text
//                     style={
//                       styles.classHeroSubtitle
//                     }
//                   >
//                     {formatNumber(
//                       students.length
//                     )}{" "}
//                     enrolled student
//                     {students.length ===
//                     1
//                       ? ""
//                       : "s"}
//                   </Text>

//                 </View>

//               </View>

//               <View
//                 style={
//                   styles.classHeroBadge
//                 }
//               >

//                 <Text
//                   style={
//                     styles.classHeroBadgeValue
//                   }
//                 >
//                   {students.length}
//                 </Text>

//                 <Text
//                   style={
//                     styles.classHeroBadgeLabel
//                   }
//                 >
//                   Students
//                 </Text>

//               </View>

//             </View>

//           </Card.Content>

//         </Card>
//       );
//     };


//   /* ==========================================================
//      SEARCH
//   ========================================================== */

//   const renderSearch =
//     () => {
//       return (
//         <Card
//           style={
//             styles.searchCard
//           }
//         >

//           <Card.Content>

//             <View
//               style={
//                 styles.searchHeader
//               }
//             >

//               <View
//                 style={
//                   styles.searchHeaderText
//                 }
//               >

//                 <Text
//                   style={
//                     styles.searchTitle
//                   }
//                 >
//                   Find a Student
//                 </Text>

//                 <Text
//                   style={
//                     styles.searchSubtitle
//                   }
//                 >
//                   Search by name or admission
//                   number.
//                 </Text>

//               </View>

//               {search.length >
//                 0 && (
//                 <TouchableOpacity
//                   activeOpacity={0.7}
//                   onPress={() =>
//                     setSearch("")
//                   }
//                 >
//                   <Text
//                     style={
//                       styles.clearSearch
//                     }
//                   >
//                     Clear
//                   </Text>
//                 </TouchableOpacity>
//               )}

//             </View>

//             <TextInput
//               mode="outlined"
//               label="Search student"
//               placeholder="Name or admission number"
//               value={search}
//               onChangeText={
//                 setSearch
//               }
//               autoCapitalize="none"
//               autoCorrect={false}
//               left={
//                 <TextInput.Icon
//                   icon="magnify"
//                 />
//               }
//               style={
//                 styles.searchInput
//               }
//               outlineStyle={
//                 styles.searchOutline
//               }
//             />

//           </Card.Content>

//         </Card>
//       );
//     };


//   /* ==========================================================
//      STUDENT ITEM
//   ========================================================== */

//   const renderStudent = ({
//     item,
//   }: {
//     item: StudentListItem;
//   }) => {
//     const initials =
//       getInitials(
//         item.name
//       );

//     const isOpening =
//       openingStudent ===
//       item.admissionNo;

//     return (
//       <TouchableOpacity
//         activeOpacity={0.88}
//         onPress={() => {
//           if (!isOpening) {
//             openStudent(item);
//           }
//         }}
//         style={
//           styles.studentTouchable
//         }
//       >

//         <Card
//           style={
//             styles.studentCard
//           }
//         >

//           <Card.Content>

//             <View
//               style={
//                 styles.studentRow
//               }
//             >

//               {/* AVATAR */}

//               <Avatar.Text
//                 size={52}
//                 label={initials}
//                 color="#4F46E5"
//                 style={
//                   styles.studentAvatar
//                 }
//               />


//               {/* INFO */}

//               <View
//                 style={
//                   styles.studentInfo
//                 }
//               >

//                 <Text
//                   style={
//                     styles.studentName
//                   }
//                   numberOfLines={1}
//                 >
//                   {item.name}
//                 </Text>

//                 <View
//                   style={
//                     styles.admissionRow
//                   }
//                 >

//                   <Text
//                     style={
//                       styles.admissionLabel
//                     }
//                   >
//                     Admission No.
//                   </Text>

//                   <Text
//                     style={
//                       styles.admissionValue
//                     }
//                   >
//                     {item.admissionNo}
//                   </Text>

//                 </View>

//               </View>


//               {/* ACTION */}

//               <View
//                 style={
//                   styles.studentAction
//                 }
//               >

//                 {isOpening ? (
//                   <ActivityIndicator
//                     size="small"
//                     color={
//                       Colors.brandPrimary
//                     }
//                   />
//                 ) : (
//                   <View
//                     style={
//                       styles.studentArrowContainer
//                     }
//                   >

//                     <Text
//                       style={
//                         styles.studentArrow
//                       }
//                     >
//                       →
//                     </Text>

//                   </View>
//                 )}

//               </View>

//             </View>

//           </Card.Content>

//         </Card>

//       </TouchableOpacity>
//     );
//   };


//   /* ==========================================================
//      EMPTY
//   ========================================================== */

//   const renderEmpty =
//     () => {
//       return (
//         <View
//           style={
//             styles.empty
//           }
//         >

//           <Avatar.Icon
//             size={70}
//             icon={
//               searchValue
//                 ? "magnify"
//                 : "account-school-outline"
//             }
//             color="#4F46E5"
//             style={
//               styles.emptyIcon
//             }
//           />

//           <Text
//             style={
//               styles.emptyTitle
//             }
//           >
//             {isError
//               ? "Unable to load students"
//               : searchValue
//                 ? "No matching students"
//                 : "No students found"}
//           </Text>

//           <Text
//             style={
//               styles.emptyText
//             }
//           >
//             {isError
//               ? "Please try refreshing the page."
//               : searchValue
//                 ? "Try searching with a different name or admission number."
//                 : `No students are currently enrolled in Class ${classNumber}.`}
//           </Text>

//           {isError ? (
//             <Button
//               mode="outlined"
//               icon="refresh"
//               onPress={
//                 refetch
//               }
//               style={
//                 styles.emptyButton
//               }
//             >
//               Try Again
//             </Button>
//           ) : searchValue ? (
//             <Button
//               mode="outlined"
//               onPress={() =>
//                 setSearch("")
//               }
//               style={
//                 styles.emptyButton
//               }
//             >
//               Clear Search
//             </Button>
//           ) : null}

//         </View>
//       );
//     };


//   /* ==========================================================
//      LOADING
//   ========================================================== */

//   if (isLoading) {
//     return (
//       <View
//         style={
//           styles.page
//         }
//       >

//         <View
//           style={[
//             styles.loadingScreen,
//             {
//               paddingHorizontal:
//                 horizontalPadding,
//             },
//           ]}
//         >

//           {renderNavbar()}

//           <View
//             style={
//               styles.loaderContent
//             }
//           >

//             <Avatar.Icon
//               size={68}
//               icon="account-school-outline"
//               color={
//                 Colors.brandPrimary
//               }
//               style={
//                 styles.loadingIcon
//               }
//             />

//             <ActivityIndicator
//               size="large"
//               color={
//                 Colors.brandPrimary
//               }
//               style={
//                 styles.loader
//               }
//             />

//             <Text
//               style={
//                 styles.loadingTitle
//               }
//             >
//               Loading students...
//             </Text>

//             <Text
//               style={
//                 styles.loadingText
//               }
//             >
//               Fetching students for
//               Class{" "}
//               {classNumber}.
//             </Text>

//           </View>

//         </View>

//         {renderProfileDropdown()}

//       </View>
//     );
//   }


//   /* ==========================================================
//      MAIN UI
//   ========================================================== */

//   return (
//     <View
//       style={
//         styles.page
//       }
//     >

//       <FlatList
//         data={
//           filteredStudents
//         }
//         renderItem={
//           renderStudent
//         }
//         keyExtractor={(item) =>
//           item.admissionNo
//         }
//         showsVerticalScrollIndicator={
//           false
//         }
//         contentContainerStyle={[
//           styles.listContent,
//           {
//             paddingHorizontal:
//               horizontalPadding,
//           },
//         ]}
//         ListHeaderComponent={
//           <>
//             {renderNavbar()}
//             {renderPageHeader()}
//             {renderClassHero()}
//             {renderSearch()}

//             {filteredStudents.length >
//               0 && (
//               <View
//                 style={
//                   styles.studentsHeader
//                 }
//               >

//                 <View>
//                   <Text
//                     style={
//                       styles.studentsTitle
//                     }
//                   >
//                     Students
//                   </Text>

//                   <Text
//                     style={
//                       styles.studentsSubtitle
//                     }
//                   >
//                     Select a student to view
//                     their complete profile.
//                   </Text>
//                 </View>

//                 <View
//                   style={
//                     styles.studentsCountBadge
//                   }
//                 >

//                   <Text
//                     style={
//                       styles.studentsCountText
//                     }
//                   >
//                     {
//                       filteredStudents.length
//                     }
//                   </Text>

//                 </View>

//               </View>
//             )}
//           </>
//         }
//         ListEmptyComponent={
//           renderEmpty()
//         }
//         refreshing={
//           isFetching
//         }
//         onRefresh={
//           refetch
//         }
//       />

//       {renderProfileDropdown()}

//       <Snackbar
//         visible={
//           showSnackbar
//         }
//         onDismiss={() => {
//           setShowSnackbar(
//             false
//           );
//         }}
//         duration={3000}
//         style={
//           styles.snackbar
//         }
//       >
//         {snackbarText}
//       </Snackbar>

//     </View>
//   );
// };


// /* ============================================================
//    INITIALS
// ============================================================ */

// const getInitials = (
//   name?: string | null
// ) => {
//   if (!name) {
//     return "S";
//   }

//   const parts =
//     name
//       .trim()
//       .split(/\s+/)
//       .filter(Boolean);

//   if (parts.length === 1) {
//     return parts[0]
//       .slice(0, 2)
//       .toUpperCase();
//   }

//   return (
//     parts[0][0] +
//     parts[
//       parts.length - 1
//     ][0]
//   ).toUpperCase();
// };


// /* ============================================================
//    NUMBER FORMAT
// ============================================================ */

// const formatNumber = (
//   value: number
// ) => {
//   return new Intl.NumberFormat(
//     "en-IN"
//   ).format(value);
// };


// /* ============================================================
//    STYLES
// ============================================================ */

// const useStyles = makeStyles(
//   () => {
//     return {

//       /* ======================================================
//          PAGE
//       ====================================================== */

//       page: {
//         flex: 1,

//         backgroundColor:
//           "#F7F8FC",
//       },

//       listContent: {
//         paddingTop:
//           Metrics.x3,

//         paddingBottom:
//           Metrics.x8,
//       },


//       /* ======================================================
//          NAVBAR
//       ====================================================== */

//       navbar: {
//         minHeight: 72,

//         paddingHorizontal:
//           Metrics.x3,

//         paddingVertical:
//           Metrics.x2,

//         flexDirection:
//           "row",

//         alignItems:
//           "center",

//         justifyContent:
//           "space-between",

//         backgroundColor:
//           "#FFFFFF",

//         borderWidth: 1,

//         borderColor:
//           "#E9EAF0",

//         borderRadius: 16,

//         marginBottom:
//           Metrics.x5,

//         elevation: 1,
//       },

//       navbarLeft: {
//         flexDirection:
//           "row",

//         alignItems:
//           "center",

//         flex: 1,

//         minWidth: 0,
//       },

//       backButton: {
//         width: 38,

//         height: 38,

//         borderRadius: 12,

//         alignItems:
//           "center",

//         justifyContent:
//           "center",

//         backgroundColor:
//           "#F3F4F6",

//         marginRight:
//           Metrics.x2,
//       },

//       backIcon: {
//         fontSize: 28,

//         lineHeight: 30,

//         color:
//           Colors.subtext,
//       },

//       navbarLogo: {
//         backgroundColor:
//           Colors.brandPrimary,

//         marginRight:
//           Metrics.x2,
//       },

//       navbarBrand: {
//         flex: 1,

//         minWidth: 0,
//       },

//       navbarSchoolName: {
//         fontSize: 15,

//         fontWeight: "800",

//         color: "#171717",
//       },

//       navbarSubtitle: {
//         fontSize: 11,

//         color:
//           Colors.subtext,

//         marginTop: 2,
//       },

//       navbarRight: {
//         flexDirection:
//           "row",

//         alignItems:
//           "center",

//         marginLeft:
//           Metrics.x2,
//       },

//       refreshButton: {
//         margin: 0,

//         marginRight:
//           Metrics.x1,
//       },


//       /* ======================================================
//          PROFILE
//       ====================================================== */

//       profileButton: {
//         flexDirection:
//           "row",

//         alignItems:
//           "center",

//         paddingVertical:
//           Metrics.x1,

//         paddingHorizontal:
//           Metrics.x1,

//         borderRadius: 24,
//       },

//       profileButtonActive: {
//         backgroundColor:
//           "#F4F5F9",
//       },

//       profileAvatar: {
//         backgroundColor:
//           Colors.brandPrimary,
//       },

//       profileDetails: {
//         marginLeft:
//           Metrics.x2,

//         maxWidth: 145,
//       },

//       profileName: {
//         fontSize: 13,

//         fontWeight: "700",

//         color: "#171717",
//       },

//       profileRole: {
//         fontSize: 11,

//         color:
//           Colors.subtext,

//         marginTop: 1,
//       },

//       profileArrow: {
//         fontSize: 17,

//         color:
//           Colors.subtext,

//         marginLeft:
//           Metrics.x1,
//       },


//       /* ======================================================
//          PAGE HEADER
//       ====================================================== */

//       pageHeader: {
//         marginBottom:
//           Metrics.x5,
//       },

//       pageHeaderTop: {
//         flexDirection:
//           "row",

//         alignItems:
//           "flex-start",

//         justifyContent:
//           "space-between",
//       },

//       pageHeaderText: {
//         flex: 1,

//         paddingRight:
//           Metrics.x3,
//       },

//       eyebrow: {
//         fontSize: 10,

//         fontWeight: "800",

//         letterSpacing: 1,

//         color:
//           Colors.brandPrimary,

//         marginBottom:
//           Metrics.x1,
//       },

//       pageTitle: {
//         fontSize: 30,

//         fontWeight: "800",

//         color: "#171717",
//       },

//       pageSubtitle: {
//         fontSize: 14,

//         lineHeight: 21,

//         color:
//           Colors.subtext,

//         marginTop:
//           Metrics.x1,

//         maxWidth: 650,
//       },

//       backToClassesButton: {
//         borderRadius: 12,
//       },

//       backToClassesContent: {
//         minHeight: 44,
//       },


//       /* ======================================================
//          CLASS HERO
//       ====================================================== */

//       classHero: {
//         backgroundColor:
//           Colors.brandPrimary,

//         borderRadius: 18,

//         marginBottom:
//           Metrics.x5,

//         elevation: 2,
//       },

//       classHeroRow: {
//         flexDirection:
//           "row",

//         alignItems:
//           "center",

//         justifyContent:
//           "space-between",
//       },

//       classHeroLeft: {
//         flexDirection:
//           "row",

//         alignItems:
//           "center",

//         flex: 1,
//       },

//       classHeroIcon: {
//         backgroundColor:
//           "rgba(255,255,255,0.14)",

//         marginRight:
//           Metrics.x3,
//       },

//       classHeroInfo: {
//         flex: 1,
//       },

//       classHeroEyebrow: {
//         fontSize: 10,

//         fontWeight: "800",

//         letterSpacing: 1,

//         color:
//           "rgba(255,255,255,0.72)",

//         marginBottom: 2,
//       },

//       classHeroTitle: {
//         fontSize: 23,

//         fontWeight: "800",

//         color: "#FFFFFF",
//       },

//       classHeroSubtitle: {
//         fontSize: 13,

//         color:
//           "rgba(255,255,255,0.78)",

//         marginTop: 2,
//       },

//       classHeroBadge: {
//         minWidth: 70,

//         paddingVertical:
//           Metrics.x2,

//         paddingHorizontal:
//           Metrics.x2,

//         borderRadius: 14,

//         alignItems:
//           "center",

//         justifyContent:
//           "center",

//         backgroundColor:
//           "rgba(255,255,255,0.14)",
//       },

//       classHeroBadgeValue: {
//         fontSize: 22,

//         fontWeight: "800",

//         color: "#FFFFFF",
//       },

//       classHeroBadgeLabel: {
//         fontSize: 10,

//         color:
//           "rgba(255,255,255,0.75)",

//         marginTop: 1,
//       },


//       /* ======================================================
//          SEARCH
//       ====================================================== */

//       searchCard: {
//         backgroundColor:
//           "#FFFFFF",

//         borderRadius: 18,

//         borderWidth: 1,

//         borderColor:
//           "#E9EAF0",

//         elevation: 1,

//         marginBottom:
//           Metrics.x5,
//       },

//       searchHeader: {
//         flexDirection:
//           "row",

//         alignItems:
//           "center",

//         justifyContent:
//           "space-between",

//         marginBottom:
//           Metrics.x3,
//       },

//       searchHeaderText: {
//         flex: 1,
//       },

//       searchTitle: {
//         fontSize: 17,

//         fontWeight: "800",

//         color: "#171717",
//       },

//       searchSubtitle: {
//         fontSize: 12,

//         color:
//           Colors.subtext,

//         marginTop: 2,
//       },

//       clearSearch: {
//         fontSize: 13,

//         fontWeight: "700",

//         color:
//           Colors.brandPrimary,
//       },

//       searchInput: {
//         backgroundColor:
//           "#FFFFFF",
//       },

//       searchOutline: {
//         borderRadius: 12,
//       },


//       /* ======================================================
//          STUDENTS HEADER
//       ====================================================== */

//       studentsHeader: {
//         flexDirection:
//           "row",

//         alignItems:
//           "center",

//         justifyContent:
//           "space-between",

//         marginBottom:
//           Metrics.x3,
//       },

//       studentsTitle: {
//         fontSize: 20,

//         fontWeight: "800",

//         color: "#171717",
//       },

//       studentsSubtitle: {
//         fontSize: 12,

//         color:
//           Colors.subtext,

//         marginTop: 2,
//       },

//       studentsCountBadge: {
//         minWidth: 38,

//         height: 36,

//         paddingHorizontal:
//           Metrics.x2,

//         borderRadius: 12,

//         alignItems:
//           "center",

//         justifyContent:
//           "center",

//         backgroundColor:
//           "#EEF2FF",
//       },

//       studentsCountText: {
//         fontSize: 13,

//         fontWeight: "800",

//         color: "#4F46E5",
//       },


//       /* ======================================================
//          STUDENT CARD
//       ====================================================== */

//       studentTouchable: {
//         marginBottom:
//           Metrics.x3,
//       },

//       studentCard: {
//         backgroundColor:
//           "#FFFFFF",

//         borderRadius: 18,

//         borderWidth: 1,

//         borderColor:
//           "#E9EAF0",

//         elevation: 1,
//       },

//       studentRow: {
//         minHeight: 72,

//         flexDirection:
//           "row",

//         alignItems:
//           "center",
//       },

//       studentAvatar: {
//         backgroundColor:
//           "#EEF2FF",

//         marginRight:
//           Metrics.x3,
//       },

//       studentInfo: {
//         flex: 1,

//         minWidth: 0,
//       },

//       studentName: {
//         fontSize: 17,

//         fontWeight: "800",

//         color: "#171717",
//       },

//       admissionRow: {
//         flexDirection:
//           "row",

//         alignItems:
//           "center",

//         flexWrap:
//           "wrap",

//         marginTop:
//           Metrics.x1,
//       },

//       admissionLabel: {
//         fontSize: 12,

//         color:
//           Colors.subtext,

//         marginRight:
//           Metrics.x1,
//       },

//       admissionValue: {
//         fontSize: 12,

//         fontWeight: "700",

//         color: "#4B5563",
//       },

//       studentAction: {
//         marginLeft:
//           Metrics.x2,
//       },

//       studentArrowContainer: {
//         width: 38,

//         height: 38,

//         borderRadius: 12,

//         alignItems:
//           "center",

//         justifyContent:
//           "center",

//         backgroundColor:
//           "#F3F4F6",
//       },

//       studentArrow: {
//         fontSize: 20,

//         color:
//           Colors.subtext,
//       },


//       /* ======================================================
//          EMPTY
//       ====================================================== */

//       empty: {
//         alignItems:
//           "center",

//         justifyContent:
//           "center",

//         paddingTop:
//           Metrics.x8,

//         paddingBottom:
//           Metrics.x8,

//         paddingHorizontal:
//           Metrics.x5,
//       },

//       emptyIcon: {
//         backgroundColor:
//           "#EEF2FF",

//         marginBottom:
//           Metrics.x3,
//       },

//       emptyTitle: {
//         fontSize: 18,

//         fontWeight: "800",

//         color: "#171717",

//         textAlign:
//           "center",
//       },

//       emptyText: {
//         fontSize: 13,

//         lineHeight: 19,

//         color:
//           Colors.subtext,

//         textAlign:
//           "center",

//         marginTop:
//           Metrics.x1,

//         maxWidth: 360,
//       },

//       emptyButton: {
//         marginTop:
//           Metrics.x3,

//         borderRadius: 12,
//       },


//       /* ======================================================
//          LOADING
//       ====================================================== */

//       loadingScreen: {
//         flex: 1,

//         paddingTop:
//           Metrics.x3,
//       },

//       loaderContent: {
//         flex: 1,

//         alignItems:
//           "center",

//         justifyContent:
//           "center",

//         paddingBottom:
//           Metrics.x8,
//       },

//       loadingIcon: {
//         backgroundColor:
//           "#EEF2FF",

//         marginBottom:
//           Metrics.x3,
//       },

//       loader: {
//         marginBottom:
//           Metrics.x2,
//       },

//       loadingTitle: {
//         fontSize: 17,

//         fontWeight: "800",

//         color: "#171717",
//       },

//       loadingText: {
//         fontSize: 13,

//         color:
//           Colors.subtext,

//         marginTop:
//           Metrics.x1,

//         textAlign:
//           "center",
//       },


//       /* ======================================================
//          PROFILE DROPDOWN
//       ====================================================== */

//       modalOverlay: {
//         flex: 1,

//         backgroundColor:
//           "rgba(0,0,0,0.08)",
//       },

//       profileDropdown: {
//         position: "absolute",

//         top: 82,

//         right: Metrics.x4,

//         width: 310,

//         backgroundColor:
//           "#FFFFFF",

//         borderRadius: 18,

//         borderWidth: 1,

//         borderColor:
//           "#E5E7EB",

//         padding:
//           Metrics.x2,

//         elevation: 8,
//       },

//       profileDropdownMobile: {
//         left: Metrics.x3,

//         right: Metrics.x3,

//         width: undefined,
//       },

//       dropdownProfileHeader: {
//         flexDirection:
//           "row",

//         alignItems:
//           "center",

//         padding:
//           Metrics.x2,
//       },

//       dropdownAvatar: {
//         backgroundColor:
//           Colors.brandPrimary,
//       },

//       dropdownUserInfo: {
//         flex: 1,

//         marginLeft:
//           Metrics.x2,
//       },

//       dropdownUserName: {
//         fontSize: 15,

//         fontWeight: "800",

//         color: "#171717",
//       },

//       dropdownUserEmail: {
//         fontSize: 12,

//         color:
//           Colors.subtext,

//         marginTop: 2,
//       },

//       dropdownUserRole: {
//         fontSize: 11,

//         color:
//           Colors.brandPrimary,

//         fontWeight: "700",

//         marginTop: 3,
//       },

//       dropdownDivider: {
//         marginVertical:
//           Metrics.x1,
//       },

//       dropdownItem: {
//         flexDirection:
//           "row",

//         alignItems:
//           "center",

//         paddingVertical:
//           Metrics.x2,

//         paddingHorizontal:
//           Metrics.x1,

//         borderRadius: 12,
//       },

//       dropdownIconContainer: {
//         width: 40,

//         height: 40,

//         borderRadius: 12,

//         alignItems:
//           "center",

//         justifyContent:
//           "center",

//         backgroundColor:
//           "#F3F4F6",
//       },

//       dropdownIcon: {
//         fontSize: 18,
//       },

//       dropdownItemTextContainer: {
//         flex: 1,

//         marginLeft:
//           Metrics.x2,
//       },

//       dropdownItemTitle: {
//         fontSize: 14,

//         fontWeight: "700",

//         color: "#171717",
//       },

//       dropdownItemSubtitle: {
//         fontSize: 11,

//         color:
//           Colors.subtext,

//         marginTop: 2,
//       },

//       logoutItem: {
//         marginTop:
//           Metrics.x1,

//         backgroundColor:
//           "#FFF5F5",
//       },

//       logoutIconContainer: {
//         backgroundColor:
//           "#FDECEC",
//       },

//       logoutIcon: {
//         color: "#D64545",
//       },

//       logoutTitle: {
//         color: "#D64545",
//       },


//       /* ======================================================
//          SNACKBAR
//       ====================================================== */

//       snackbar: {
//         backgroundColor:
//           Colors.errorBg,
//       },


//       /* ======================================================
//          AUTH ERROR
//       ====================================================== */

//       center: {
//         flex: 1,

//         justifyContent:
//           "center",

//         alignItems:
//           "center",

//         padding:
//           Metrics.x5,

//         backgroundColor:
//           "#F7F8FC",
//       },

//       errorText: {
//         color:
//           Colors.error,

//         textAlign:
//           "center",

//         fontSize: 16,
//       },
//     };
//   }
// );


// /* ============================================================
//    EXPORT
// ============================================================ */

// export {
//   PrincipalClassStudentsScreen,
// };


import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FlatList,
  Modal,
  Pressable,
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
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";

import {
  useQuery,
} from "react-query";

import {
  useNavigation,
} from "@react-navigation/native";

import {
  studentServices,
} from "../../services/studentServices";

import {
  sectionServices,
} from "../../services/sectionServices";

import {
  Colors,
  makeStyles,
  Metrics,
} from "../../theme";

import {
  RootStackParamList,
  RootStackScreenNames,
} from "../../types";

import {
  useUserStore,
} from "../../store";


/* ============================================================
   TYPES
============================================================ */

import type { NativeStackScreenProps } from "@react-navigation/native-stack";

type PrincipalClassStudentsScreenProps =
  NativeStackScreenProps<
    RootStackParamList,
    RootStackScreenNames.PrincipalClassStudents
  >;


type StudentListItem = {
  id?: string;
  admissionNo: string;
  name: string;
};


type SectionStudentsResponse = {
  section?: {
    id: string;
    sectionName: string;
    classId: string;
    class?: {
      id: string;
      classNumber: string;
      displayName?: string;
      academicYearId?: string;
    };
  };

  class?: {
    id: string;
    classNumber: string;
    displayName?: string;
    academicYearId?: string;
  };

  students?: StudentListItem[];

  totalStudents?: number;
};


/* ============================================================
   SCREEN
============================================================ */

const PrincipalClassStudentsScreen = ({
  route,
}: PrincipalClassStudentsScreenProps) => {

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
     RESPONSIVE
  ========================================================== */

  const { width } =
    useWindowDimensions();


  const isSmallScreen =
    width < 600;


  const isTablet =
    width >= 600 &&
    width < 1024;


  const horizontalPadding =
    isSmallScreen
      ? Metrics.x3
      : isTablet
        ? Metrics.x4
        : Metrics.x6;


  /* ==========================================================
     ROUTE
  ========================================================== */

  const { Section } = route.params;


  /* ==========================================================
     USER
  ========================================================== */

  const user =
    useUserStore(
      (state) => state.user
    );


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


  const [
    openingStudent,
    setOpeningStudent,
  ] = useState<string | null>(
    null
  );


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


  if (user.role !== "PRINCIPAL") {

    return (
      <View style={styles.center}>

        <Text
          style={styles.errorText}
        >
          You are not authorized to
          access this screen.
        </Text>

      </View>
    );

  }


  /* ==========================================================
     API
  ========================================================== */

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery<
    SectionStudentsResponse
  >(
    [
      "principal-section-students",
      Section,
    ],

    () =>
      sectionServices
        .getStudentsBySection(
          Section
        ),

    {
      enabled:
        !!Section,

      retry: 1,
    }
  );


  /* ==========================================================
     ERROR
  ========================================================== */

  useEffect(() => {

    if (!isError) {
      return;
    }


    const message =
      // @ts-ignore
      error?.response?.data?.message ??
      "Unable to load students.";


    setSnackbarText(message);

    setShowSnackbar(true);

  }, [
    isError,
    error,
  ]);


  /* ==========================================================
     SECTION INFORMATION
  ========================================================== */

  const section =
    data?.section;


  const classDetails =
    section?.class ??
    data?.class;


  const classNumber =
    classDetails?.classNumber ??
    "Class";


  const sectionName =
    section?.sectionName ??
    "";


  /* ==========================================================
     STUDENTS
  ========================================================== */

  const students: StudentListItem[] =
    data?.students ?? [];


  /* ==========================================================
     SEARCH
  ========================================================== */

  const searchValue =
    search
      .trim()
      .toLowerCase();


  const filteredStudents =
    useMemo(() => {

      if (!searchValue) {
        return students;
      }


      return students.filter(
        (student) =>
          student.name
            ?.toLowerCase()
            .includes(
              searchValue
            ) ||

          student.admissionNo
            ?.toLowerCase()
            .includes(
              searchValue
            )
      );

    }, [
      students,
      searchValue,
    ]);


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
     BACK
  ========================================================== */

  const goBackToSection = () => {

    navigation.goBack();

  };


  /* ==========================================================
     DASHBOARD
  ========================================================== */

  const goToDashboard = () => {

    navigation.navigate(
      RootStackScreenNames.PrincipalDashboard
    );

  };


  /* ==========================================================
     OPEN STUDENT
  ========================================================== */

  const openStudent = async (
    student: StudentListItem
  ) => {

    try {

      setOpeningStudent(
        student.admissionNo
      );


      const fullStudent =
        await studentServices
          .getStudentById({
            admissionNo:
              student.admissionNo,
          });


      navigation.navigate(
        RootStackScreenNames.StudentDetails,
        {
          student:
            fullStudent,
        }
      );

    } catch (err: any) {

      console.error(
        "STUDENT DETAILS ERROR:",
        err
      );


      setSnackbarText(
        err?.response?.data
          ?.message ??
        "Unable to load student details."
      );


      setShowSnackbar(true);

    } finally {

      setOpeningStudent(null);

    }

  };


  /* ==========================================================
     NAVBAR
  ========================================================== */

  const renderNavbar = () => {

    return (
      <View
        style={styles.navbar}
      >

        {/* LEFT */}

        <View
          style={styles.navbarLeft}
        >

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={
              goBackToSection
            }
            style={
              styles.backButton
            }
          >

            <Text
              style={
                styles.backIcon
              }
            >
              ‹
            </Text>

          </TouchableOpacity>


          <Avatar.Icon
            size={
              isSmallScreen
                ? 42
                : 46
            }
            icon="school"
            color="#FFFFFF"
            style={
              styles.navbarLogo
            }
          />


          <View
            style={
              styles.navbarBrand
            }
          >

            <Text
              style={
                styles.navbarSchoolName
              }
              numberOfLines={1}
            >
              {user.schoolName ||
                "School Platform"}
            </Text>


            <Text
              style={
                styles.navbarSubtitle
              }
            >
              Principal Administration
            </Text>

          </View>

        </View>


        {/* RIGHT */}

        <View
          style={
            styles.navbarRight
          }
        >

          <IconButton
            icon="refresh"
            size={
              isSmallScreen
                ? 20
                : 22
            }
            iconColor={
              Colors.brandPrimary
            }
            onPress={() => {
              refetch();
            }}
            style={
              styles.refreshButton
            }
          />


          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              setProfileMenuVisible(
                true
              );
            }}
            style={[
              styles.profileButton,
              profileMenuVisible &&
                styles.profileButtonActive,
            ]}
          >

            <Avatar.Text
              size={
                isSmallScreen
                  ? 38
                  : 42
              }
              label={getInitials(
                user.name
              )}
              color="#FFFFFF"
              style={
                styles.profileAvatar
              }
            />


            {!isSmallScreen && (
              <View
                style={
                  styles.profileDetails
                }
              >

                <Text
                  style={
                    styles.profileName
                  }
                  numberOfLines={1}
                >
                  {user.name ||
                    "Principal"}
                </Text>


                <Text
                  style={
                    styles.profileRole
                  }
                >
                  Principal
                </Text>

              </View>
            )}


            <Text
              style={
                styles.profileArrow
              }
            >
              {profileMenuVisible
                ? "⌃"
                : "⌄"}
            </Text>

          </TouchableOpacity>

        </View>

      </View>
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
              styles.pageHeaderTop
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
                STUDENTS
              </Text>


              <Text
                style={
                  styles.pageTitle
                }
              >
                Class{" "}
                {classNumber}
                {" • "}
                Section{" "}
                {sectionName}
              </Text>


              <Text
                style={
                  styles.pageSubtitle
                }
              >
                View all students enrolled
                in this section.
              </Text>

            </View>


            <Button
              mode="outlined"
              icon="arrow-left"
              onPress={
                goBackToSection
              }
              style={
                styles.backToClassesButton
              }
              contentStyle={
                styles.backToClassesContent
              }
            >
              {!isSmallScreen
                ? "Back"
                : "Back"}
            </Button>

          </View>

        </View>
      );

    };


  /* ==========================================================
     CLASS HERO
  ========================================================== */

  const renderClassHero =
    () => {

      return (
        <Card
          style={
            styles.classHero
          }
        >

          <Card.Content>

            <View
              style={
                styles.classHeroRow
              }
            >

              <View
                style={
                  styles.classHeroLeft
                }
              >

                <Avatar.Icon
                  size={60}
                  icon="google-classroom"
                  color="#FFFFFF"
                  style={
                    styles.classHeroIcon
                  }
                />


                <View
                  style={
                    styles.classHeroInfo
                  }
                >

                  <Text
                    style={
                      styles.classHeroEyebrow
                    }
                  >
                    SECTION OVERVIEW
                  </Text>


                  <Text
                    style={
                      styles.classHeroTitle
                    }
                  >
                    Class{" "}
                    {classNumber}
                    {" • "}
                    Section{" "}
                    {sectionName}
                  </Text>


                  <Text
                    style={
                      styles.classHeroSubtitle
                    }
                  >
                    {formatNumber(
                      students.length
                    )}{" "}
                    enrolled student
                    {students.length === 1
                      ? ""
                      : "s"}
                  </Text>

                </View>

              </View>


              <View
                style={
                  styles.classHeroBadge
                }
              >

                <Text
                  style={
                    styles.classHeroBadgeValue
                  }
                >
                  {students.length}
                </Text>


                <Text
                  style={
                    styles.classHeroBadgeLabel
                  }
                >
                  Students
                </Text>

              </View>

            </View>

          </Card.Content>

        </Card>
      );

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
                  Search by name or admission
                  number.
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
              placeholder="Name or admission number"
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
    item: StudentListItem;
  }) => {

    const initials =
      getInitials(
        item.name
      );


    const isOpening =
      openingStudent ===
      item.admissionNo;


    return (
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={() => {

          if (!isOpening) {
            openStudent(item);
          }

        }}
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
                styles.studentRow
              }
            >

              {/* AVATAR */}

              <Avatar.Text
                size={52}
                label={initials}
                color="#4F46E5"
                style={
                  styles.studentAvatar
                }
              />


              {/* INFO */}

              <View
                style={
                  styles.studentInfo
                }
              >

                <Text
                  style={
                    styles.studentName
                  }
                  numberOfLines={1}
                >
                  {item.name}
                </Text>


                <View
                  style={
                    styles.admissionRow
                  }
                >

                  <Text
                    style={
                      styles.admissionLabel
                    }
                  >
                    Admission No.
                  </Text>


                  <Text
                    style={
                      styles.admissionValue
                    }
                  >
                    {item.admissionNo}
                  </Text>

                </View>

              </View>


              {/* ACTION */}

              <View
                style={
                  styles.studentAction
                }
              >

                {isOpening ? (

                  <ActivityIndicator
                    size="small"
                    color={
                      Colors.brandPrimary
                    }
                  />

                ) : (

                  <View
                    style={
                      styles.studentArrowContainer
                    }
                  >

                    <Text
                      style={
                        styles.studentArrow
                      }
                    >
                      →
                    </Text>

                  </View>

                )}

              </View>

            </View>

          </Card.Content>

        </Card>

      </TouchableOpacity>
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

          <Avatar.Icon
            size={70}
            icon={
              searchValue
                ? "magnify"
                : "account-school-outline"
            }
            color="#4F46E5"
            style={
              styles.emptyIcon
            }
          />


          <Text
            style={
              styles.emptyTitle
            }
          >
            {isError
              ? "Unable to load students"
              : searchValue
                ? "No matching students"
                : "No students found"}
          </Text>


          <Text
            style={
              styles.emptyText
            }
          >
            {isError
              ? "Please try refreshing the page."
              : searchValue
                ? "Try searching with a different name or admission number."
                : `No students are currently enrolled in Class ${classNumber} - Section ${sectionName}.`}
          </Text>


          {isError ? (

            <Button
              mode="outlined"
              icon="refresh"
              onPress={
                refetch
              }
              style={
                styles.emptyButton
              }
            >
              Try Again
            </Button>

          ) : searchValue ? (

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

          ) : null}

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

          {renderNavbar()}


          <View
            style={
              styles.loaderContent
            }
          >

            <Avatar.Icon
              size={68}
              icon="account-school-outline"
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
              Fetching students for
              {" "}
              Class{" "}
              {classNumber}
              {" • "}
              Section{" "}
              {sectionName}.
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
        keyExtractor={(item) =>
          item.admissionNo
        }
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

            {renderNavbar()}

            {renderPageHeader()}

            {renderClassHero()}

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
                    Select a student to view
                    their complete profile.
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
                    {
                      filteredStudents.length
                    }
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
    return "S";
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
        backgroundColor:
          "#F7F8FC",
      },


      listContent: {
        paddingTop:
          Metrics.x3,

        paddingBottom:
          Metrics.x8,
      },


      /* ======================================================
         NAVBAR
      ====================================================== */

      navbar: {
        minHeight: 72,

        paddingHorizontal:
          Metrics.x3,

        paddingVertical:
          Metrics.x2,

        flexDirection:
          "row",

        alignItems:
          "center",

        justifyContent:
          "space-between",

        backgroundColor:
          "#FFFFFF",

        borderWidth: 1,

        borderColor:
          "#E9EAF0",

        borderRadius: 16,

        marginBottom:
          Metrics.x5,

        elevation: 1,
      },


      navbarLeft: {
        flexDirection:
          "row",

        alignItems:
          "center",

        flex: 1,

        minWidth: 0,
      },


      backButton: {
        width: 38,

        height: 38,

        borderRadius: 12,

        alignItems:
          "center",

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
        marginBottom:
          Metrics.x5,
      },


      pageHeaderTop: {
        flexDirection:
          "row",

        alignItems:
          "flex-start",

        justifyContent:
          "space-between",
      },


      pageHeaderText: {
        flex: 1,

        paddingRight:
          Metrics.x3,
      },


      eyebrow: {
        fontSize: 10,

        fontWeight: "800",

        letterSpacing: 1,

        color:
          Colors.brandPrimary,

        marginBottom:
          Metrics.x1,
      },


      pageTitle: {
        fontSize: 30,

        fontWeight: "800",

        color: "#171717",
      },


      pageSubtitle: {
        fontSize: 14,

        lineHeight: 21,

        color:
          Colors.subtext,

        marginTop:
          Metrics.x1,

        maxWidth: 650,
      },


      backToClassesButton: {
        borderRadius: 12,
      },


      backToClassesContent: {
        minHeight: 44,
      },


      /* ======================================================
         CLASS HERO
      ====================================================== */

      classHero: {
        backgroundColor:
          Colors.brandPrimary,

        borderRadius: 18,

        marginBottom:
          Metrics.x5,

        elevation: 2,
      },


      classHeroRow: {
        flexDirection:
          "row",

        alignItems:
          "center",

        justifyContent:
          "space-between",
      },


      classHeroLeft: {
        flexDirection:
          "row",

        alignItems:
          "center",

        flex: 1,
      },


      classHeroIcon: {
        backgroundColor:
          "rgba(255,255,255,0.14)",

        marginRight:
          Metrics.x3,
      },


      classHeroInfo: {
        flex: 1,
      },


      classHeroEyebrow: {
        fontSize: 10,

        fontWeight: "800",

        letterSpacing: 1,

        color:
          "rgba(255,255,255,0.72)",

        marginBottom: 2,
      },


      classHeroTitle: {
        fontSize: 23,

        fontWeight: "800",

        color: "#FFFFFF",
      },


      classHeroSubtitle: {
        fontSize: 13,

        color:
          "rgba(255,255,255,0.78)",

        marginTop: 2,
      },


      classHeroBadge: {
        minWidth: 70,

        paddingVertical:
          Metrics.x2,

        paddingHorizontal:
          Metrics.x2,

        borderRadius: 14,

        alignItems:
          "center",

        justifyContent:
          "center",

        backgroundColor:
          "rgba(255,255,255,0.14)",
      },


      classHeroBadgeValue: {
        fontSize: 22,

        fontWeight: "800",

        color: "#FFFFFF",
      },


      classHeroBadgeLabel: {
        fontSize: 10,

        color:
          "rgba(255,255,255,0.75)",

        marginTop: 1,
      },


      /* ======================================================
         SEARCH
      ====================================================== */

      searchCard: {
        backgroundColor:
          "#FFFFFF",

        borderRadius: 18,

        borderWidth: 1,

        borderColor:
          "#E9EAF0",

        elevation: 1,

        marginBottom:
          Metrics.x5,
      },


      searchHeader: {
        flexDirection:
          "row",

        alignItems:
          "center",

        justifyContent:
          "space-between",

        marginBottom:
          Metrics.x3,
      },


      searchHeaderText: {
        flex: 1,
      },


      searchTitle: {
        fontSize: 17,

        fontWeight: "800",

        color: "#171717",
      },


      searchSubtitle: {
        fontSize: 12,

        color:
          Colors.subtext,

        marginTop: 2,
      },


      clearSearch: {
        fontSize: 13,

        fontWeight: "700",

        color:
          Colors.brandPrimary,
      },


      searchInput: {
        backgroundColor:
          "#FFFFFF",
      },


      searchOutline: {
        borderRadius: 12,
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
        minWidth: 38,

        height: 36,

        paddingHorizontal:
          Metrics.x2,

        borderRadius: 12,

        alignItems:
          "center",

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
        marginBottom:
          Metrics.x3,
      },


      studentCard: {
        backgroundColor:
          "#FFFFFF",

        borderRadius: 18,

        borderWidth: 1,

        borderColor:
          "#E9EAF0",

        elevation: 1,
      },


      studentRow: {
        minHeight: 72,

        flexDirection:
          "row",

        alignItems:
          "center",
      },


      studentAvatar: {
        backgroundColor:
          "#EEF2FF",

        marginRight:
          Metrics.x3,
      },


      studentInfo: {
        flex: 1,

        minWidth: 0,
      },


      studentName: {
        fontSize: 17,

        fontWeight: "800",

        color: "#171717",
      },


      admissionRow: {
        flexDirection:
          "row",

        alignItems:
          "center",

        flexWrap:
          "wrap",

        marginTop:
          Metrics.x1,
      },


      admissionLabel: {
        fontSize: 12,

        color:
          Colors.subtext,

        marginRight:
          Metrics.x1,
      },


      admissionValue: {
        fontSize: 12,

        fontWeight: "700",

        color: "#4B5563",
      },


      studentAction: {
        marginLeft:
          Metrics.x2,
      },


      studentArrowContainer: {
        width: 38,

        height: 38,

        borderRadius: 12,

        alignItems:
          "center",

        justifyContent:
          "center",

        backgroundColor:
          "#F3F4F6",
      },


      studentArrow: {
        fontSize: 20,

        color:
          Colors.subtext,
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


      emptyIcon: {
        backgroundColor:
          "#EEF2FF",

        marginBottom:
          Metrics.x3,
      },


      emptyTitle: {
        fontSize: 18,

        fontWeight: "800",

        color: "#171717",

        textAlign:
          "center",
      },


      emptyText: {
        fontSize: 13,

        lineHeight: 19,

        color:
          Colors.subtext,

        textAlign:
          "center",

        marginTop:
          Metrics.x1,

        maxWidth: 360,
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
         PROFILE DROPDOWN
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

        alignItems:
          "center",

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


      /* ======================================================
         SNACKBAR
      ====================================================== */

      snackbar: {
        backgroundColor:
          Colors.errorBg,
      },


      /* ======================================================
         AUTH ERROR
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
  PrincipalClassStudentsScreen,
};