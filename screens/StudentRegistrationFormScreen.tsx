import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

import {
  Avatar,
  Button,
  Divider,
  IconButton,
  Menu,
  Snackbar,
  TextInput,
} from "react-native-paper";

import type {
  NativeStackScreenProps,
} from "@react-navigation/native-stack";

import {
  Controller,
  useForm,
} from "react-hook-form";

import {
  useQuery,
  useQueryClient,
} from "react-query";

import {
  Page,
  SiblingFormType,
  SiblingsForm,
} from "../components";

import {
  Colors,
  Metrics,
} from "../theme";

import {
  CreateStudentFormFields,
  RootStackParamList,
  RootStackScreenNames,
} from "../types";

import {
  classServices,
} from "../services";

import {
  studentServices,
} from "../services/studentServices";

import {
  isAadhaarValid,
  isNonEmptyAlphabetsWithSpace,
  isNonEmptyAlphaNumerals,
  isNonEmptyDecimalNumber,
  isValidDate,
  isValidPhoneNo,
} from "../utils";

import {
  useUserStore,
} from "../store";


/* ============================================================================
   TYPES
============================================================================ */

type RegistrationSection = {
  id: string;
  sectionName: string;
};

type RegistrationClass = {
  id: string;
  classNumber: string;
  displayName: string;

  tuitionFee: string;
  textBookFee: string;
  noteBookFee: string;
  diaryFee: string;

  sections: RegistrationSection[];
};

type RegistrationAcademicYear = {
  id: string;
  name: string;

  startDate: string;
  endDate: string;

  isCurrent: boolean;

  classes: RegistrationClass[];
};

type RegistrationOptionsResponse = {
  academicYears: RegistrationAcademicYear[];
};

type ClassDetailsResponse = {
  data?: {
    tuitionFee?: string | number;
    textBookFee?: string | number;
    noteBookFee?: string | number;
    diaryFee?: string | number;
  };
};


/* ============================================================================
   PROPS
============================================================================ */

type Props =
  NativeStackScreenProps<
    RootStackParamList,
    RootStackScreenNames.StudentRegistrationForm
  >;


/* ============================================================================
   HELPERS
============================================================================ */

const getInitials = (
  name?: string | null
) => {
  if (!name) {
    return "PA";
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
    parts[parts.length - 1][0]
  ).toUpperCase();
};


const getFirstName = (
  name?: string | null
) => {
  if (!name) {
    return "Principal";
  }

  return name
    .trim()
    .split(/\s+/)[0];
};


const getGreeting = () => {
  const hour =
    new Date().getHours();

  if (hour < 12) {
    return "morning";
  }

  if (hour < 17) {
    return "afternoon";
  }

  return "evening";
};


/* ============================================================================
   SCREEN
============================================================================ */

// const StudentRegistrationFormScreen = ({
//   route,
//   navigation,
// }: Props) => {

//   /* ==========================================================================
//      RESPONSIVE
//   ========================================================================== */

//   const {
//     width,
//   } = useWindowDimensions();

//   const isSmallScreen =
//     width < 600;

//   const isTablet =
//     width >= 600 &&
//     width < 1024;

//   const isDesktop =
//     width >= 1024;


//   const horizontalPadding =
//     isSmallScreen
//       ? Metrics.x3
//       : isTablet
//         ? Metrics.x4
//         : Metrics.x6;


//   /* ==========================================================================
//      EDIT DATA
//   ========================================================================== */

//   const {
//     preFetchedData,
//   } = route.params ?? {};


//   /* ==========================================================================
//      USER STORE
//   ========================================================================== */

//   const logout =
//     useUserStore(
//       (state) =>
//         state.logout
//     );

//   const user =
//     useUserStore(
//       (state) =>
//         state.user
//     );


//   /* ==========================================================================
//      QUERY CLIENT
//   ========================================================================== */

//   const queryClient =
//     useQueryClient();


//   /* ==========================================================================
//      PROFILE MENU
//   ========================================================================== */

//   const [
//     profileMenuVisible,
//     setProfileMenuVisible,
//   ] = useState(false);


//   /* ==========================================================================
//      REGISTRATION OPTIONS
//   ========================================================================== */

//   const {
//     data: registrationOptions,
//     isLoading:
//       loadingRegistrationOptions,
//     isFetching:
//       fetchingRegistrationOptions,
//     error:
//       registrationOptionsError,
//   } = useQuery<RegistrationOptionsResponse>(
//     ["student-registration-options"],
//     () =>
//       studentServices
//         .getRegistrationOptions(),
//     {
//       staleTime:
//         5 * 60 * 1000,
//     }
//   );


//   const academicYears =
//     registrationOptions
//       ?.academicYears ?? [];


//   /* ==========================================================================
//      SELECTED ACADEMIC YEAR
//   ========================================================================== */

//   const initialAcademicYearId =
//     preFetchedData?.academicYearId ??
//     academicYears.find(
//       (year) =>
//         year.isCurrent
//     )?.id ??
//     academicYears[0]?.id ??
//     null;


//   const [
//     selectedAcademicYearId,
//     setSelectedAcademicYearId,
//   ] = useState<string | null>(
//     initialAcademicYearId
//   );


//   /* ==========================================================================
//      SELECTED CLASS
//   ========================================================================== */

//   const [
//     selectedClass,
//     setSelectedClass,
//   ] = useState<string | null>(
//     preFetchedData
//       ?.classNumber
//       ?.classNumber ??
//     null
//   );


//   /* ==========================================================================
//      SELECTED SECTION
//   ========================================================================== */

//   const [
//     selectedSectionName,
//     setSelectedSectionName,
//   ] = useState<string | null>(
//     preFetchedData
//       ?.sectionName ??
//     null
//   );


//   /* ==========================================================================
//      SELECTED YEAR OBJECT
//   ========================================================================== */

//   const selectedAcademicYear =
//     academicYears.find(
//       (year) =>
//         year.id ===
//         selectedAcademicYearId
//     );


//   /* ==========================================================================
//      AVAILABLE CLASSES
//   ========================================================================== */

//   const availableClasses =
//     selectedAcademicYear
//       ?.classes ?? [];


//   /* ==========================================================================
//      SELECTED CLASS OBJECT
//   ========================================================================== */

//   const selectedClassDetails =
//     availableClasses.find(
//       (item) =>
//         item.classNumber ===
//         selectedClass
//     );


//   /* ==========================================================================
//      AVAILABLE SECTIONS
//   ========================================================================== */

//   const availableSections =
//     selectedClassDetails
//       ?.sections ?? [];


//   /* ==========================================================================
//      CLASS DETAILS
//   ========================================================================== */

//   const {
//     data: classDetails,
//     refetch:
//       refetchClassDetails,
//     isFetching:
//       fetchingClassDetails,
//   } = useQuery<ClassDetailsResponse>(
//     [
//       "class-details",
//       selectedAcademicYearId,
//       selectedClass,
//     ],
//     () =>
//       classServices.getClassDetails(
//         selectedClass ?? ""
//       ),
//     {
//       enabled: false,
//     }
//   );


//   /* ==========================================================================
//      SET DEFAULT YEAR
//   ========================================================================== */

//   useEffect(() => {

//     if (
//       selectedAcademicYearId ||
//       academicYears.length === 0
//     ) {
//       return;
//     }

//     const currentYear =
//       academicYears.find(
//         (year) =>
//           year.isCurrent
//       );

//     setSelectedAcademicYearId(
//       currentYear?.id ??
//       academicYears[0]?.id ??
//       null
//     );

//   }, [
//     academicYears,
//     selectedAcademicYearId,
//   ]);


//   /* ==========================================================================
//      EDIT MODE YEAR
//   ========================================================================== */

//   useEffect(() => {

//     if (
//       !preFetchedData ||
//       academicYears.length === 0
//     ) {
//       return;
//     }

//     if (
//       preFetchedData
//         .academicYearId
//     ) {

//       setSelectedAcademicYearId(
//         preFetchedData
//           .academicYearId
//       );

//       return;
//     }

//     const matchingYear =
//       academicYears.find(
//         (year) =>
//           year.classes.some(
//             (item) =>
//               item.classNumber ===
//               preFetchedData
//                 ?.classNumber
//                 ?.classNumber
//           )
//       );

//     if (matchingYear) {

//       setSelectedAcademicYearId(
//         matchingYear.id
//       );

//     }

//   }, [
//     academicYears,
//     preFetchedData,
//   ]);


//   /* ==========================================================================
//      WHEN CLASS CHANGES
//   ========================================================================== */

//   useEffect(() => {

//     if (!selectedClass) {

//       setSelectedSectionName(
//         null
//       );

//       return;
//     }

//     const sectionExists =
//       availableSections.some(
//         (section) =>
//           section.sectionName ===
//           selectedSectionName
//       );

//     if (
//       selectedSectionName &&
//       !sectionExists
//     ) {

//       setSelectedSectionName(
//         null
//       );

//     }

//     refetchClassDetails();

//   }, [
//     selectedClass,
//     selectedAcademicYearId,
//     availableSections,
//     selectedSectionName,
//     refetchClassDetails,
//   ]);


//   /* ==========================================================================
//      DEFAULT FORM VALUES
//   ========================================================================== */

//   const defaultValues:
//     CreateStudentFormFields = {

//     admissionNo:
//       preFetchedData
//         ?.admissionNo ??
//       "",

//     name:
//       preFetchedData
//         ?.name ??
//       "",

//     academicYearId:
//       preFetchedData
//         ?.academicYearId ??
//       "",

//     sectionName:
//       preFetchedData
//         ?.sectionName ??
//       "",

//     aadhaar:
//       preFetchedData
//         ?.aadhaar ??
//       "",

//     fatherName:
//       preFetchedData
//         ?.fatherName ??
//       "",

//     dob:
//       preFetchedData
//         ?.dob ??
//       "",

//     doj:
//       preFetchedData
//         ?.doj ??
//       "",

//     phoneNo:
//       preFetchedData
//         ?.phoneNo ??
//       "",

//     tcNo:
//       preFetchedData
//         ?.tcNo ??
//       "",

//     siblings:
//       preFetchedData
//         ?.siblings ??
//       [],

//     classNumber:
//       selectedClass ??
//       "",

//     tie:
//       preFetchedData
//         ?.tie
//         ?.amount ??
//       "0",

//     diary:
//       preFetchedData
//         ?.diary
//         ?.amount ??
//       "0",

//     belt:
//       preFetchedData
//         ?.belt
//         ?.amount ??
//       "0",

//     arrears:
//       preFetchedData
//         ?.arrears
//         ?.amount ??
//       "0",

//     couponCode:
//       preFetchedData
//         ?.couponCode
//         ?.code ??
//       "",
//   };


//   /* ==========================================================================
//      FORM
//   ========================================================================== */

//   const {
//     control,
//     handleSubmit,
//     formState: {
//       errors,
//     },
//     setError,
//   } =
//     useForm<CreateStudentFormFields>({
//       defaultValues,
//     });


//   /* ==========================================================================
//      LOADING
//   ========================================================================== */

//   const [
//     loading,
//     setLoading,
//   ] = useState(false);


//   /* ==========================================================================
//      SIBLINGS
//   ========================================================================== */

//   const siblingsRef =
//     useRef<SiblingFormType[]>(
//       preFetchedData
//         ?.siblings ??
//       []
//     );


//   const [
//     siblingsErrors,
//     setSiblingsErrors,
//   ] = useState<{
//     index?: number;
//     message?: string;
//   }>();


//   /* ==========================================================================
//      SNACKBAR
//   ========================================================================== */

//   const [
//     snackbarVisible,
//     setSnackbarVisible,
//   ] = useState(false);


//   const [
//     snackbarMessage,
//     setSnackbarMessage,
//   ] = useState("");


//   const [
//     snackbarColor,
//     setSnackbarColor,
//   ] = useState(
//     Colors.successBg
//   );


//   const showSnackbar = (
//     message: string,
//     backgroundColor: string =
//       Colors.successBg
//   ) => {

//     setSnackbarMessage(message);
//     setSnackbarColor(
//       backgroundColor
//     );
//     setSnackbarVisible(true);

//   };


//   /* ==========================================================================
//      DROPDOWN STATE
//   ========================================================================== */

//   const [
//     academicYearMenuVisible,
//     setAcademicYearMenuVisible,
//   ] = useState(false);


//   const [
//     classMenuVisible,
//     setClassMenuVisible,
//   ] = useState(false);


//   const [
//     sectionMenuVisible,
//     setSectionMenuVisible,
//   ] = useState(false);


//   /* ==========================================================================
//      LOGOUT
//   ========================================================================== */

//   const handleLogout = () => {

//     setProfileMenuVisible(false);

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


//   /* ==========================================================================
//      VALIDATION
//   ========================================================================== */

//   const validateData = (
//     data: CreateStudentFormFields
//   ) => {

//     const {
//       admissionNo,
//       name,
//       aadhaar,
//       fatherName,
//       dob,
//       doj,
//       phoneNo,
//       tie,
//       diary,
//       belt,
//       arrears,
//     } = data;


//     if (!selectedAcademicYearId) {

//       showSnackbar(
//         "Please select an academic year.",
//         Colors.errorBg
//       );

//       return false;
//     }


//     if (!selectedClass) {

//       showSnackbar(
//         "Please select a class.",
//         Colors.errorBg
//       );

//       return false;
//     }


//     if (!selectedSectionName) {

//       showSnackbar(
//         "Please select a section.",
//         Colors.errorBg
//       );

//       return false;
//     }


//     if (
//       !isNonEmptyAlphaNumerals(
//         admissionNo
//       )
//     ) {

//       setError(
//         "admissionNo",
//         {
//           message:
//             "Invalid admission number",
//         }
//       );

//       return false;
//     }


//     if (
//       !isNonEmptyAlphabetsWithSpace(
//         name
//       )
//     ) {

//       setError(
//         "name",
//         {
//           message:
//             "Invalid student name",
//         }
//       );

//       return false;
//     }


//     if (
//       !isAadhaarValid(aadhaar)
//     ) {

//       setError(
//         "aadhaar",
//         {
//           message:
//             "Invalid Aadhaar number",
//         }
//       );

//       return false;
//     }


//     if (
//       !isNonEmptyAlphabetsWithSpace(
//         fatherName
//       )
//     ) {

//       setError(
//         "fatherName",
//         {
//           message:
//             "Invalid father name",
//         }
//       );

//       return false;
//     }


//     if (!isValidDate(dob)) {

//       setError(
//         "dob",
//         {
//           message:
//             "Invalid date",
//         }
//       );

//       return false;
//     }


//     if (!isValidDate(doj)) {

//       setError(
//         "doj",
//         {
//           message:
//             "Invalid date",
//         }
//       );

//       return false;
//     }


//     if (
//       !isValidPhoneNo(phoneNo)
//     ) {

//       setError(
//         "phoneNo",
//         {
//           message:
//             "Invalid phone number",
//         }
//       );

//       return false;
//     }


//     const feeFields = [
//       {
//         name: "tie" as const,
//         value: tie,
//       },
//       {
//         name: "diary" as const,
//         value: diary,
//       },
//       {
//         name: "belt" as const,
//         value: belt,
//       },
//       {
//         name: "arrears" as const,
//         value: arrears,
//       },
//     ];


//     for (
//       const field of feeFields
//     ) {

//       if (
//         !isNonEmptyDecimalNumber(
//           field.value
//         )
//       ) {

//         setError(
//           field.name,
//           {
//             message:
//               "Invalid amount",
//           }
//         );

//         return false;
//       }

//     }


//     setSiblingsErrors(
//       undefined
//     );


//     for (
//       let i = 0;
//       i <
//       siblingsRef.current.length;
//       i++
//     ) {

//       const sibling =
//         siblingsRef.current[i];

//       if (
//         !sibling.admissionNo
//       ) {

//         setSiblingsErrors({
//           index: i,
//           message:
//             "Invalid sibling details",
//         });

//         return false;
//       }

//     }


//     return true;
//   };


//   /* ==========================================================================
//      SUBMIT
//   ========================================================================== */

//   const onSubmit = async (
//     data: CreateStudentFormFields
//   ) => {

//     const valid =
//       validateData(data);

//     if (!valid) {
//       return;
//     }

//     setLoading(true);

//     try {

//       /* ======================================================================
//          CREATE
//       ====================================================================== */

//       if (!preFetchedData) {

//         await studentServices
//           .createStudent({

//             ...data,

//             academicYearId:
//               selectedAcademicYearId,

//             classNumber:
//               selectedClass,

//             sectionName:
//               selectedSectionName,

//             siblings:
//               siblingsRef.current,

//           } as any);


//         showSnackbar(
//           "Student created successfully.",
//           Colors.successBg
//         );


//         const fullStudent =
//           await studentServices
//             .getStudentById({
//               admissionNo:
//                 data.admissionNo,
//             });


//         setTimeout(() => {

//           navigation.navigate(
//             RootStackScreenNames.StudentDetails,
//             {
//               student:
//                 fullStudent,
//             }
//           );

//         }, 500);

//       }


//       /* ======================================================================
//          EDIT
//       ====================================================================== */

//       else {

//         await studentServices
//           .editStudent({

//             ...data,

//             academicYearId:
//               selectedAcademicYearId,

//             classNumber:
//               selectedClass,

//             sectionName:
//               selectedSectionName,

//             siblings:
//               siblingsRef.current,

//             oldAdmissionNo:
//               preFetchedData
//                 .admissionNo,

//           } as any);


//         showSnackbar(
//           "Student details updated successfully.",
//           Colors.successBg
//         );

//       }


//       /* ======================================================================
//          REFRESH CACHE
//       ====================================================================== */

//       await queryClient.refetchQueries([
//         "principal-class-student-counts",
//       ]);

//       await queryClient.refetchQueries([
//         "student",
//         data.admissionNo,
//       ]);

//       await queryClient.refetchQueries([
//         "transactions",
//       ]);

//     } catch (err: any) {

//       console.log(
//         "STUDENT SAVE ERROR:",
//         err?.response?.data ??
//         err
//       );


//       showSnackbar(
//         err?.response?.data?.message ??
//           "Unable to save student. Please try again.",
//         Colors.errorBg
//       );

//     } finally {

//       setLoading(false);

//     }

//   };


//   /* ==========================================================================
//      ERROR
//   ========================================================================== */

//   const renderError = (
//     message: unknown
//   ) => {

//     if (
//       typeof message !==
//         "string" ||
//       message.trim() === ""
//     ) {
//       return null;
//     }

//     return (
//       <Text style={styles.error}>
//         {message}
//       </Text>
//     );

//   };


//   /* ==========================================================================
//      LABELS
//   ========================================================================== */

//   const selectedAcademicYearName =
//     selectedAcademicYear?.name ??
//     "Select Academic Year";


//   const selectedClassLabel =
//     selectedClassDetails
//       ? (
//         selectedClassDetails
//           .displayName ||
//         `Class ${
//           selectedClassDetails
//             .classNumber
//         }`
//       )
//       : "Select Class";


//   const selectedSectionLabel =
//     selectedSectionName ??
//     "Select Section";


//   /* ==========================================================================
//      PROFILE DROPDOWN
//   ========================================================================== */

//   const renderProfileDropdown = () => {

//     if (!profileMenuVisible) {
//       return null;
//     }

//     return (

//       <Modal
//         visible={
//           profileMenuVisible
//         }
//         transparent
//         animationType="fade"
//         statusBarTranslucent
//         onRequestClose={() =>
//           setProfileMenuVisible(false)
//         }
//       >

//         <Pressable
//           style={styles.modalOverlay}
//           onPress={() =>
//             setProfileMenuVisible(false)
//           }
//         >

//           <View
//             style={[
//               styles.profileDropdown,
//               isSmallScreen
//                 ? styles.profileDropdownMobile
//                 : styles.profileDropdownDesktop,
//             ]}
//           >

//             <View
//               style={
//                 styles.dropdownProfileHeader
//               }
//             >

//               <Avatar.Text
//                 size={46}
//                 label={
//                   getInitials(
//                     user?.name
//                   )
//                 }
//                 color="#FFFFFF"
//                 style={
//                   styles.dropdownAvatar
//                 }
//               />

//               <View
//                 style={
//                   styles.dropdownUserInfo
//                 }
//               >

//                 <Text
//                   style={
//                     styles.dropdownUserName
//                   }
//                   numberOfLines={1}
//                 >
//                   {
//                     user?.name ??
//                     "Principal"
//                   }
//                 </Text>

//                 <Text
//                   style={
//                     styles.dropdownUserEmail
//                   }
//                   numberOfLines={1}
//                 >
//                   {
//                     user?.email ??
//                     "Principal"
//                   }
//                 </Text>

//                 <Text
//                   style={
//                     styles.dropdownUserRole
//                   }
//                 >
//                   Principal
//                 </Text>

//               </View>

//             </View>


//             <Divider
//               style={
//                 styles.dropdownDivider
//               }
//             />


//             <TouchableOpacity
//               activeOpacity={0.7}
//               style={
//                 styles.dropdownItem
//               }
//               onPress={() =>
//                 setProfileMenuVisible(
//                   false
//                 )
//               }
//             >

//               <View
//                 style={
//                   styles.dropdownIconContainer
//                 }
//               >
//                 <Text
//                   style={
//                     styles.dropdownIcon
//                   }
//                 >
//                   👤
//                 </Text>
//               </View>

//               <View
//                 style={
//                   styles.dropdownItemTextContainer
//                 }
//               >

//                 <Text
//                   style={
//                     styles.dropdownItemTitle
//                   }
//                 >
//                   Profile
//                 </Text>

//                 <Text
//                   style={
//                     styles.dropdownItemSubtitle
//                   }
//                 >
//                   View principal profile
//                 </Text>

//               </View>

//             </TouchableOpacity>


//             <TouchableOpacity
//               activeOpacity={0.7}
//               style={[
//                 styles.dropdownItem,
//                 styles.logoutItem,
//               ]}
//               onPress={
//                 handleLogout
//               }
//             >

//               <View
//                 style={[
//                   styles.dropdownIconContainer,
//                   styles.logoutIconContainer,
//                 ]}
//               >

//                 <Text
//                   style={[
//                     styles.dropdownIcon,
//                     styles.logoutIcon,
//                   ]}
//                 >
//                   ↪
//                 </Text>

//               </View>

//               <View
//                 style={
//                   styles.dropdownItemTextContainer
//                 }
//               >

//                 <Text
//                   style={[
//                     styles.dropdownItemTitle,
//                     styles.logoutTitle,
//                   ]}
//                 >
//                   Logout
//                 </Text>

//                 <Text
//                   style={
//                     styles.dropdownItemSubtitle
//                   }
//                 >
//                   Sign out of this account
//                 </Text>

//               </View>

//             </TouchableOpacity>

//           </View>

//         </Pressable>

//       </Modal>

//     );
//   };


//   /* ==========================================================================
//      HEADER / NAVBAR
//   ========================================================================== */

//   const renderNavbar = () => {

//     return (

//       <View>

//         {/* ================================================================
//             TOP NAVBAR
//         ================================================================ */}

//         <View
//           style={
//             styles.platformHeader
//           }
//         >

//           <View
//             style={
//               styles.platformBrand
//             }
//           >

//             <Avatar.Icon
//               size={
//                 isSmallScreen
//                   ? 42
//                   : 48
//               }
//               icon="shield-check"
//               color="#FFFFFF"
//               style={
//                 styles.platformLogo
//               }
//             />


//             <View
//               style={
//                 styles.platformBrandText
//               }
//             >

//               <Text
//                 style={
//                   styles.platformName
//                 }
//               >
//                 School Platform
//               </Text>

//               <Text
//                 style={
//                   styles.platformSubtitle
//                 }
//               >
//                 Principal Administration
//               </Text>

//             </View>

//           </View>


//           <View
//             style={
//               styles.platformActions
//             }
//           >

//             <TouchableOpacity
//               activeOpacity={0.8}
//               onPress={() =>
//                 setProfileMenuVisible(
//                   true
//                 )
//               }
//               style={[
//                 styles.profileButton,
//                 profileMenuVisible &&
//                   styles.profileButtonActive,
//               ]}
//             >

//               <Avatar.Text
//                 size={
//                   isSmallScreen
//                     ? 38
//                     : 42
//                 }
//                 label={
//                   getInitials(
//                     user?.name
//                   )
//                 }
//                 color="#FFFFFF"
//                 style={
//                   styles.profileAvatar
//                 }
//               />


//               {!isSmallScreen ? (

//                 <View
//                   style={
//                     styles.profileDetails
//                   }
//                 >

//                   <Text
//                     style={
//                       styles.profileName
//                     }
//                     numberOfLines={1}
//                   >
//                     {
//                       user?.name ??
//                       "Principal"
//                     }
//                   </Text>

//                   <Text
//                     style={
//                       styles.profileRole
//                     }
//                   >
//                     Principal
//                   </Text>

//                 </View>

//               ) : null}


//               <Text
//                 style={
//                   styles.profileArrow
//                 }
//               >
//                 {
//                   profileMenuVisible
//                     ? "⌃"
//                     : "⌄"
//                 }
//               </Text>

//             </TouchableOpacity>

//           </View>

//         </View>


//         {/* ================================================================
//             PAGE HEADING
//         ================================================================ */}

//         <View
//           style={
//             styles.dashboardHeading
//           }
//         >

//           <View
//             style={
//               styles.greetingContainer
//             }
//           >

//             <Text
//               style={
//                 styles.greeting
//               }
//             >
//               Good{" "}
//               {getGreeting()}
//               ,{" "}
//               {getFirstName(
//                 user?.name
//               )} 👋
//             </Text>


//             <Text
//               style={
//                 styles.pageTitle
//               }
//             >
//               {
//                 preFetchedData
//                   ? "Edit Student"
//                   : "Student Registration"
//               }
//             </Text>


//             <Text
//               style={
//                 styles.pageSubtitle
//               }
//             >
//               {
//                 preFetchedData
//                   ? "Update student information, academic details and fee information."
//                   : "Register a new student with personal, academic and fee information."
//               }
//             </Text>

//           </View>

//         </View>

//       </View>

//     );
//   };


//   /* ==========================================================================
//      FORM
//   ========================================================================== */

//   const renderForm = () => {

//     return (

//       <View>

//         {renderNavbar()}


//         {/* ================================================================
//             STUDENT INFORMATION
//         ================================================================ */}

//         <View
//           style={
//             styles.formCard
//           }
//         >

//           <Text
//             style={
//               styles.sectionTitle
//             }
//           >
//             Student Information
//           </Text>


//           <Controller
//             control={control}
//             name="admissionNo"
//             render={({
//               field: {
//                 onChange,
//                 value,
//               },
//             }) => (

//               <TextInput
//                 label="Admission No."
//                 value={value}
//                 onChangeText={
//                   onChange
//                 }
//                 mode="outlined"
//                 autoCapitalize="characters"
//                 editable={
//                   !preFetchedData
//                 }
//                 error={
//                   !!errors.admissionNo
//                 }
//                 style={
//                   styles.input
//                 }
//               />

//             )}
//           />


//           {renderError(
//             errors.admissionNo
//               ?.message
//           )}


//           <Controller
//             control={control}
//             name="name"
//             render={({
//               field: {
//                 onChange,
//                 value,
//               },
//             }) => (

//               <TextInput
//                 label="Student Name"
//                 value={value}
//                 onChangeText={
//                   onChange
//                 }
//                 mode="outlined"
//                 autoCapitalize="words"
//                 error={
//                   !!errors.name
//                 }
//                 style={
//                   styles.input
//                 }
//               />

//             )}
//           />


//           {renderError(
//             errors.name?.message
//           )}


//           <Controller
//             control={control}
//             name="aadhaar"
//             render={({
//               field: {
//                 onChange,
//                 value,
//               },
//             }) => (

//               <TextInput
//                 label="Aadhaar Number"
//                 value={value}
//                 onChangeText={
//                   onChange
//                 }
//                 mode="outlined"
//                 keyboardType="numeric"
//                 maxLength={12}
//                 error={
//                   !!errors.aadhaar
//                 }
//                 style={
//                   styles.input
//                 }
//               />

//             )}
//           />


//           {renderError(
//             errors.aadhaar
//               ?.message
//           )}


//           <Controller
//             control={control}
//             name="fatherName"
//             render={({
//               field: {
//                 onChange,
//                 value,
//               },
//             }) => (

//               <TextInput
//                 label="Father Name"
//                 value={value}
//                 onChangeText={
//                   onChange
//                 }
//                 mode="outlined"
//                 autoCapitalize="words"
//                 error={
//                   !!errors.fatherName
//                 }
//                 style={
//                   styles.input
//                 }
//               />

//             )}
//           />


//           {renderError(
//             errors.fatherName
//               ?.message
//           )}

//         </View>


//         {/* ================================================================
//             DATES
//         ================================================================ */}

//         <View
//           style={
//             styles.formCard
//           }
//         >

//           <Text
//             style={
//               styles.sectionTitle
//             }
//           >
//             Dates
//           </Text>


//           <Controller
//             control={control}
//             name="dob"
//             render={({
//               field: {
//                 onChange,
//                 value,
//               },
//             }) => (

//               <TextInput
//                 label="Date of Birth (DD/MM/YYYY)"
//                 value={value}
//                 onChangeText={
//                   onChange
//                 }
//                 mode="outlined"
//                 placeholder="DD/MM/YYYY"
//                 error={
//                   !!errors.dob
//                 }
//                 style={
//                   styles.input
//                 }
//               />

//             )}
//           />


//           {renderError(
//             errors.dob?.message
//           )}


//           <Controller
//             control={control}
//             name="doj"
//             render={({
//               field: {
//                 onChange,
//                 value,
//               },
//             }) => (

//               <TextInput
//                 label="Date of Joining (DD/MM/YYYY)"
//                 value={value}
//                 onChangeText={
//                   onChange
//                 }
//                 mode="outlined"
//                 placeholder="DD/MM/YYYY"
//                 error={
//                   !!errors.doj
//                 }
//                 style={
//                   styles.input
//                 }
//               />

//             )}
//           />


//           {renderError(
//             errors.doj?.message
//           )}

//         </View>


//         {/* ================================================================
//             CONTACT
//         ================================================================ */}

//         <View
//           style={
//             styles.formCard
//           }
//         >

//           <Text
//             style={
//               styles.sectionTitle
//             }
//           >
//             Contact
//           </Text>


//           <Controller
//             control={control}
//             name="phoneNo"
//             render={({
//               field: {
//                 onChange,
//                 value,
//               },
//             }) => (

//               <TextInput
//                 label="Phone Number"
//                 value={value}
//                 onChangeText={
//                   onChange
//                 }
//                 mode="outlined"
//                 keyboardType="phone-pad"
//                 maxLength={10}
//                 error={
//                   !!errors.phoneNo
//                 }
//                 style={
//                   styles.input
//                 }
//               />

//             )}
//           />


//           {renderError(
//             errors.phoneNo
//               ?.message
//           )}


//           <Controller
//             control={control}
//             name="tcNo"
//             render={({
//               field: {
//                 onChange,
//                 value,
//               },
//             }) => (

//               <TextInput
//                 label="TC No. (Optional)"
//                 value={
//                   value ?? ""
//                 }
//                 onChangeText={
//                   onChange
//                 }
//                 mode="outlined"
//                 error={
//                   !!errors.tcNo
//                 }
//                 style={
//                   styles.input
//                 }
//               />

//             )}
//           />


//           {renderError(
//             errors.tcNo?.message
//           )}

//         </View>


//         {/* ================================================================
//             ACADEMIC DETAILS
//         ================================================================ */}

//         <View
//           style={
//             styles.formCard
//           }
//         >

//           <Text
//             style={
//               styles.sectionTitle
//             }
//           >
//             Academic Details
//           </Text>


//           {/* ============================================================
//               ACADEMIC YEAR
//           ============================================================ */}

//           <Menu
//             visible={
//               academicYearMenuVisible
//             }
//             onDismiss={() =>
//               setAcademicYearMenuVisible(
//                 false
//               )
//             }
//             anchor={

//               <Button
//                 mode="outlined"
//                 onPress={() =>
//                   setAcademicYearMenuVisible(
//                     true
//                   )
//                 }
//                 disabled={
//                   loadingRegistrationOptions ||
//                   loading ||
//                   preFetchedData != null
//                 }
//                 style={
//                   styles.dropdownButton
//                 }
//                 contentStyle={
//                   styles.dropdownContent
//                 }
//               >
//                 {
//                   selectedAcademicYearName
//                 }
//               </Button>

//             }
//           >

//             {academicYears.map(
//               (academicYear) => (

//                 <Menu.Item
//                   key={
//                     academicYear.id
//                   }
//                   title={
//                     academicYear.isCurrent
//                       ? `${academicYear.name} (Current)`
//                       : academicYear.name
//                   }
//                   onPress={() => {

//                     setSelectedAcademicYearId(
//                       academicYear.id
//                     );

//                     setSelectedClass(
//                       null
//                     );

//                     setSelectedSectionName(
//                       null
//                     );

//                     setAcademicYearMenuVisible(
//                       false
//                     );

//                   }}
//                 />

//               )
//             )}

//           </Menu>


//           {loadingRegistrationOptions && (

//             <Text
//               style={
//                 styles.helperText
//               }
//             >
//               Loading academic years...
//             </Text>

//           )}


//           {Boolean(
//             registrationOptionsError
//           ) && (

//             <Text
//               style={
//                 styles.error
//               }
//             >
//               Unable to load academic years.
//             </Text>

//           )}


//           {/* ============================================================
//               CLASS
//           ============================================================ */}

//           <Menu
//             visible={
//               classMenuVisible
//             }
//             onDismiss={() =>
//               setClassMenuVisible(
//                 false
//               )
//             }
//             anchor={

//               <Button
//                 mode="outlined"
//                 onPress={() =>
//                   setClassMenuVisible(
//                     true
//                   )
//                 }
//                 disabled={
//                   !selectedAcademicYearId ||
//                   availableClasses.length ===
//                     0 ||
//                   loading
//                 }
//                 style={
//                   styles.dropdownButton
//                 }
//                 contentStyle={
//                   styles.dropdownContent
//                 }
//               >
//                 {
//                   selectedClassLabel
//                 }
//               </Button>

//             }
//           >

//             {availableClasses.map(
//               (classItem) => (

//                 <Menu.Item
//                   key={
//                     classItem.id
//                   }
//                   title={
//                     classItem.displayName ||
//                     `Class ${classItem.classNumber}`
//                   }
//                   onPress={() => {

//                     setSelectedClass(
//                       classItem.classNumber
//                     );

//                     setSelectedSectionName(
//                       null
//                     );

//                     setClassMenuVisible(
//                       false
//                     );

//                   }}
//                 />

//               )
//             )}

//           </Menu>


//           {selectedAcademicYearId &&
//             availableClasses.length ===
//               0 && (

//               <Text
//                 style={
//                   styles.helperText
//                 }
//               >
//                 No classes available for this academic year.
//               </Text>

//             )}


//           {/* ============================================================
//               SECTION
//           ============================================================ */}

//           <Menu
//             visible={
//               sectionMenuVisible
//             }
//             onDismiss={() =>
//               setSectionMenuVisible(
//                 false
//               )
//             }
//             anchor={

//               <Button
//                 mode="outlined"
//                 onPress={() =>
//                   setSectionMenuVisible(
//                     true
//                   )
//                 }
//                 disabled={
//                   !selectedClass ||
//                   availableSections.length ===
//                     0 ||
//                   loading
//                 }
//                 style={
//                   styles.dropdownButton
//                 }
//                 contentStyle={
//                   styles.dropdownContent
//                 }
//               >
//                 {
//                   selectedSectionLabel
//                 }
//               </Button>

//             }
//           >

//             {availableSections.map(
//               (section) => (

//                 <Menu.Item
//                   key={
//                     section.id
//                   }
//                   title={
//                     section.sectionName
//                   }
//                   onPress={() => {

//                     setSelectedSectionName(
//                       section.sectionName
//                     );

//                     setSectionMenuVisible(
//                       false
//                     );

//                   }}
//                 />

//               )
//             )}

//           </Menu>


//           {selectedClass &&
//             availableSections.length ===
//               0 && (

//               <Text
//                 style={
//                   styles.helperText
//                 }
//               >
//                 No sections available for this class.
//               </Text>

//             )}

//         </View>


//         {/* ================================================================
//             CLASS FEES
//         ================================================================ */}

//         <View
//           style={
//             styles.formCard
//           }
//         >

//           <Text
//             style={
//               styles.sectionTitle
//             }
//           >
//             Class Fees
//           </Text>


//           <TextInput
//             label="Tuition Fee"
//             value={
//               String(
//                 selectedClassDetails
//                   ?.tuitionFee ??
//                 classDetails
//                   ?.data
//                   ?.tuitionFee ??
//                 ""
//               )
//             }
//             mode="outlined"
//             editable={false}
//             style={
//               styles.input
//             }
//           />


//           <TextInput
//             label="Textbook Fee"
//             value={
//               String(
//                 selectedClassDetails
//                   ?.textBookFee ??
//                 classDetails
//                   ?.data
//                   ?.textBookFee ??
//                 ""
//               )
//             }
//             mode="outlined"
//             editable={false}
//             style={
//               styles.input
//             }
//           />


//           <TextInput
//             label="Notebook Fee"
//             value={
//               String(
//                 selectedClassDetails
//                   ?.noteBookFee ??
//                 classDetails
//                   ?.data
//                   ?.noteBookFee ??
//                 ""
//               )
//             }
//             mode="outlined"
//             editable={false}
//             style={
//               styles.input
//             }
//           />


//           <TextInput
//             label="Diary Fee"
//             value={
//               String(
//                 selectedClassDetails
//                   ?.diaryFee ??
//                 ""
//               )
//             }
//             mode="outlined"
//             editable={false}
//             style={
//               styles.input
//             }
//           />

//         </View>


//         {/* ================================================================
//             ADDITIONAL FEES
//         ================================================================ */}

//         <View
//           style={
//             styles.formCard
//           }
//         >

//           <Text
//             style={
//               styles.sectionTitle
//             }
//           >
//             Additional Fees
//           </Text>


//           <Controller
//             control={control}
//             name="tie"
//             render={({
//               field: {
//                 onChange,
//                 value,
//               },
//             }) => (

//               <TextInput
//                 label="Tie"
//                 value={value}
//                 onChangeText={
//                   onChange
//                 }
//                 mode="outlined"
//                 keyboardType="decimal-pad"
//                 error={
//                   !!errors.tie
//                 }
//                 style={
//                   styles.input
//                 }
//               />

//             )}
//           />


//           {renderError(
//             errors.tie?.message
//           )}


//           <Controller
//             control={control}
//             name="diary"
//             render={({
//               field: {
//                 onChange,
//                 value,
//               },
//             }) => (

//               <TextInput
//                 label="Diary"
//                 value={value}
//                 onChangeText={
//                   onChange
//                 }
//                 mode="outlined"
//                 keyboardType="decimal-pad"
//                 error={
//                   !!errors.diary
//                 }
//                 style={
//                   styles.input
//                 }
//               />

//             )}
//           />


//           {renderError(
//             errors.diary?.message
//           )}


//           <Controller
//             control={control}
//             name="belt"
//             render={({
//               field: {
//                 onChange,
//                 value,
//               },
//             }) => (

//               <TextInput
//                 label="Belt"
//                 value={value}
//                 onChangeText={
//                   onChange
//                 }
//                 mode="outlined"
//                 keyboardType="decimal-pad"
//                 error={
//                   !!errors.belt
//                 }
//                 style={
//                   styles.input
//                 }
//               />

//             )}
//           />


//           {renderError(
//             errors.belt?.message
//           )}


//           <Controller
//             control={control}
//             name="arrears"
//             render={({
//               field: {
//                 onChange,
//                 value,
//               },
//             }) => (

//               <TextInput
//                 label="Arrears / Previous Balance"
//                 value={value}
//                 onChangeText={
//                   onChange
//                 }
//                 mode="outlined"
//                 keyboardType="decimal-pad"
//                 error={
//                   !!errors.arrears
//                 }
//                 style={
//                   styles.input
//                 }
//               />

//             )}
//           />


//           {renderError(
//             errors.arrears
//               ?.message
//           )}

//         </View>


//         {/* ================================================================
//             COUPON
//         ================================================================ */}

//         <View
//           style={
//             styles.formCard
//           }
//         >

//           <Text
//             style={
//               styles.sectionTitle
//             }
//           >
//             Coupon
//           </Text>


//           <Controller
//             control={control}
//             name="couponCode"
//             render={({
//               field: {
//                 onChange,
//                 value,
//               },
//             }) => (

//               <TextInput
//                 label="Coupon Code (Optional)"
//                 value={value}
//                 onChangeText={
//                   onChange
//                 }
//                 mode="outlined"
//                 autoCapitalize="characters"
//                 editable={
//                   !preFetchedData
//                     ?.couponCode
//                     ?.code
//                 }
//                 error={
//                   !!errors.couponCode
//                 }
//                 style={
//                   styles.input
//                 }
//               />

//             )}
//           />


//           {renderError(
//             errors.couponCode
//               ?.message
//           )}

//         </View>


//         {/* ================================================================
//             SIBLINGS
//         ================================================================ */}

//         <View
//           style={
//             styles.formCard
//           }
//         >

//           <Text
//             style={
//               styles.sectionTitle
//             }
//           >
//             Siblings
//           </Text>


//           <SiblingsForm
//             siblingsRef={
//               siblingsRef
//             }
//             errors={
//               siblingsErrors
//             }
//           />

//         </View>


//         {/* ================================================================
//             SUBMIT
//         ================================================================ */}

//         <Button
//           mode="contained"
//           loading={loading}
//           disabled={
//             loading ||
//             loadingRegistrationOptions ||
//             fetchingRegistrationOptions ||
//             fetchingClassDetails
//           }
//           onPress={
//             handleSubmit(onSubmit)
//           }
//           style={
//             styles.submitButton
//           }
//           contentStyle={
//             styles.submitContent
//           }
//           labelStyle={
//             styles.submitLabel
//           }
//         >
//           {
//             preFetchedData
//               ? "UPDATE STUDENT"
//               : "CREATE STUDENT"
//           }
//         </Button>


//         <View
//           style={
//             styles.bottomSpace
//           }
//         />

//       </View>

//     );

//   };


//   /* ==========================================================================
//      MAIN UI
//   ========================================================================== */

//   return (

//     <Page
//       style={
//         styles.page
//       }
//     >

//       <FlatList
//         data={["form"]}
//         renderItem={
//           renderForm
//         }
//         keyExtractor={
//           (item) =>
//             item
//         }
//         showsVerticalScrollIndicator={
//           false
//         }
//         automaticallyAdjustKeyboardInsets
//         keyboardShouldPersistTaps="handled"
//         contentContainerStyle={[
//           styles.listContent,
//           {
//             paddingHorizontal:
//               horizontalPadding,
//           },
//         ]}
//       />


//       {renderProfileDropdown()}


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
//         style={[
//           styles.snackbar,
//           {
//             backgroundColor:
//               snackbarColor,
//           },
//         ]}
//       >
//         {
//           snackbarMessage
//         }
//       </Snackbar>

//     </Page>

//   );

// };

const StudentRegistrationFormScreen = ({
  route,
  navigation,
}: Props) => {


  /* ==========================================================================
     RESPONSIVE
  ========================================================================== */

  const {
    width,
  } = useWindowDimensions();

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


  /* ==========================================================================
     EDIT DATA
  ========================================================================== */

  const {
    preFetchedData,
  } = route.params ?? {};


  /* ==========================================================================
     USER STORE
  ========================================================================== */

  const logout =
    useUserStore(
      (state) =>
        state.logout
    );

  const user =
    useUserStore(
      (state) =>
        state.user
    );


  /* ==========================================================================
     QUERY CLIENT
  ========================================================================== */

  const queryClient =
    useQueryClient();


  /* ==========================================================================
     PROFILE MENU
  ========================================================================== */

  const [
    profileMenuVisible,
    setProfileMenuVisible,
  ] = useState(false);


  /* ==========================================================================
     PARENT RELATIONSHIP
  ========================================================================== */

  type ParentRelationship =
    | "FATHER"
    | "MOTHER"
    | "GUARDIAN";

  type StudentRegistrationFormFields =
    CreateStudentFormFields & {
      parentRelationship:
        ParentRelationship;
    };


  /* ==========================================================================
     REGISTRATION OPTIONS
  ========================================================================== */

  const {
    data: registrationOptions,
    isLoading:
      loadingRegistrationOptions,
    isFetching:
      fetchingRegistrationOptions,
    error:
      registrationOptionsError,
  } = useQuery<RegistrationOptionsResponse>(
    ["student-registration-options"],
    () =>
      studentServices
        .getRegistrationOptions(),
    {
      staleTime:
        5 * 60 * 1000,
    }
  );


  const academicYears =
    registrationOptions
      ?.academicYears ?? [];


  /* ==========================================================================
     SELECTED ACADEMIC YEAR
  ========================================================================== */

  const initialAcademicYearId =
    preFetchedData?.academicYearId ??
    academicYears.find(
      (year) =>
        year.isCurrent
    )?.id ??
    academicYears[0]?.id ??
    null;


  const [
    selectedAcademicYearId,
    setSelectedAcademicYearId,
  ] = useState<string | null>(
    initialAcademicYearId
  );


  /* ==========================================================================
     SELECTED CLASS
  ========================================================================== */

  const [
    selectedClass,
    setSelectedClass,
  ] = useState<string | null>(
    preFetchedData
      ?.classNumber
      ?.classNumber ??
    null
  );


  /* ==========================================================================
     SELECTED SECTION
  ========================================================================== */

  const [
    selectedSectionName,
    setSelectedSectionName,
  ] = useState<string | null>(
    preFetchedData
      ?.sectionName ??
    null
  );


  /* ==========================================================================
     SELECTED YEAR OBJECT
  ========================================================================== */

  const selectedAcademicYear =
    academicYears.find(
      (year) =>
        year.id ===
        selectedAcademicYearId
    );


  /* ==========================================================================
     AVAILABLE CLASSES
  ========================================================================== */

  const availableClasses =
    selectedAcademicYear
      ?.classes ?? [];


  /* ==========================================================================
     SELECTED CLASS OBJECT
  ========================================================================== */

  const selectedClassDetails =
    availableClasses.find(
      (item) =>
        item.classNumber ===
        selectedClass
    );


  /* ==========================================================================
     AVAILABLE SECTIONS
  ========================================================================== */

  const availableSections =
    selectedClassDetails
      ?.sections ?? [];


  /* ==========================================================================
     CLASS DETAILS
  ========================================================================== */

  const {
    data: classDetails,
    refetch:
      refetchClassDetails,
    isFetching:
      fetchingClassDetails,
  } = useQuery<ClassDetailsResponse>(
    [
      "class-details",
      selectedAcademicYearId,
      selectedClass,
    ],
    () =>
      classServices.getClassDetails(
        selectedClass ?? ""
      ),
    {
      enabled: false,
    }
  );


  /* ==========================================================================
     SET DEFAULT YEAR
  ========================================================================== */

  useEffect(() => {

    if (
      selectedAcademicYearId ||
      academicYears.length === 0
    ) {
      return;
    }

    const currentYear =
      academicYears.find(
        (year) =>
          year.isCurrent
      );

    setSelectedAcademicYearId(
      currentYear?.id ??
      academicYears[0]?.id ??
      null
    );

  }, [
    academicYears,
    selectedAcademicYearId,
  ]);


  /* ==========================================================================
     EDIT MODE YEAR
  ========================================================================== */

  useEffect(() => {

    if (
      !preFetchedData ||
      academicYears.length === 0
    ) {
      return;
    }

    if (
      preFetchedData
        .academicYearId
    ) {

      setSelectedAcademicYearId(
        preFetchedData
          .academicYearId
      );

      return;
    }

    const matchingYear =
      academicYears.find(
        (year) =>
          year.classes.some(
            (item) =>
              item.classNumber ===
              preFetchedData
                ?.classNumber
                ?.classNumber
          )
      );

    if (matchingYear) {

      setSelectedAcademicYearId(
        matchingYear.id
      );

    }

  }, [
    academicYears,
    preFetchedData,
  ]);


  /* ==========================================================================
     WHEN CLASS CHANGES
  ========================================================================== */

  useEffect(() => {

    if (!selectedClass) {

      setSelectedSectionName(
        null
      );

      return;
    }

    const sectionExists =
      availableSections.some(
        (section) =>
          section.sectionName ===
          selectedSectionName
      );

    if (
      selectedSectionName &&
      !sectionExists
    ) {

      setSelectedSectionName(
        null
      );

    }

    refetchClassDetails();

  }, [
    selectedClass,
    selectedAcademicYearId,
    availableSections,
    selectedSectionName,
    refetchClassDetails,
  ]);


  /* ==========================================================================
     DEFAULT FORM VALUES
  ========================================================================== */

  const defaultValues:
    StudentRegistrationFormFields = {


    admissionNo:
      preFetchedData
        ?.admissionNo ??
      "",

    name:
      preFetchedData
        ?.name ??
      "",

    academicYearId:
      preFetchedData
        ?.academicYearId ??
      "",

    sectionName:
      preFetchedData
        ?.sectionName ??
      "",

    aadhaar:
      preFetchedData
        ?.aadhaar ??
      "",

    fatherName:
      preFetchedData
        ?.fatherName ??
      "",

    dob:
      preFetchedData
        ?.dob ??
      "",

    doj:
      preFetchedData
        ?.doj ??
      "",

    phoneNo:
      preFetchedData
        ?.phoneNo ??
      "",

    tcNo:
      preFetchedData
        ?.tcNo ??
      "",

    siblings:
      preFetchedData
        ?.siblings ??
      [],

    classNumber:
      selectedClass ??
      "",

    tie:
      preFetchedData
        ?.tie
        ?.amount ??
      "0",

    diary:
      preFetchedData
        ?.diary
        ?.amount ??
      "0",

    belt:
      preFetchedData
        ?.belt
        ?.amount ??
      "0",

    arrears:
      preFetchedData
        ?.arrears
        ?.amount ??
      "0",

    couponCode:
      preFetchedData
        ?.couponCode
        ?.code ??
      "",


    parentRelationship:
      (preFetchedData as Partial<StudentRegistrationFormFields>)
        ?.parentRelationship ??
      "FATHER",
  };


  /* ==========================================================================
     FORM
  ========================================================================== */

  const {
    control,
    handleSubmit,
    formState: {
      errors,
    },
    setError,
  } =
    useForm<StudentRegistrationFormFields>({
      defaultValues,
    });


  /* ==========================================================================
     LOADING
  ========================================================================== */

  const [
    loading,
    setLoading,
  ] = useState(false);


  /* ==========================================================================
     SIBLINGS
  ========================================================================== */

  const siblingsRef =
    useRef<SiblingFormType[]>(
      preFetchedData
        ?.siblings ??
      []
    );


  const [
    siblingsErrors,
    setSiblingsErrors,
  ] = useState<{
    index?: number;
    message?: string;
  }>();


  /* ==========================================================================
     SNACKBAR
  ========================================================================== */

  const [
    snackbarVisible,
    setSnackbarVisible,
  ] = useState(false);


  const [
    snackbarMessage,
    setSnackbarMessage,
  ] = useState("");


  const [
    snackbarColor,
    setSnackbarColor,
  ] = useState(
    Colors.successBg
  );


  const showSnackbar = (
    message: string,
    backgroundColor: string =
      Colors.successBg
  ) => {

    setSnackbarMessage(message);

    setSnackbarColor(
      backgroundColor
    );

    setSnackbarVisible(true);

  };


  /* ==========================================================================
     DROPDOWN STATE
  ========================================================================== */

  const [
    academicYearMenuVisible,
    setAcademicYearMenuVisible,
  ] = useState(false);


  const [
    classMenuVisible,
    setClassMenuVisible,
  ] = useState(false);


  const [
    sectionMenuVisible,
    setSectionMenuVisible,
  ] = useState(false);


  /* ============================================================
     PARENT RELATIONSHIP MENU
  ============================================================ */

  const [
    parentRelationshipMenuVisible,
    setParentRelationshipMenuVisible,
  ] = useState(false);


  /* ==========================================================================
     LOGOUT
  ========================================================================== */

  const handleLogout = () => {

    setProfileMenuVisible(false);

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


  /* ==========================================================================
     VALIDATION
  ========================================================================== */

  const validateData = (
    data: StudentRegistrationFormFields
  ) => {

    const {
      admissionNo,
      name,
      aadhaar,
      fatherName,
      dob,
      doj,
      phoneNo,
      tie,
      diary,
      belt,
      arrears,
      parentRelationship,
    } = data;


    if (!selectedAcademicYearId) {

      showSnackbar(
        "Please select an academic year.",
        Colors.errorBg
      );

      return false;
    }


    if (!selectedClass) {

      showSnackbar(
        "Please select a class.",
        Colors.errorBg
      );

      return false;
    }


    if (!selectedSectionName) {

      showSnackbar(
        "Please select a section.",
        Colors.errorBg
      );

      return false;
    }


    if (
      !isNonEmptyAlphaNumerals(
        admissionNo
      )
    ) {

      setError(
        "admissionNo",
        {
          message:
            "Invalid admission number",
        }
      );

      return false;
    }


    if (
      !isNonEmptyAlphabetsWithSpace(
        name
      )
    ) {

      setError(
        "name",
        {
          message:
            "Invalid student name",
        }
      );

      return false;
    }


    if (
      !isAadhaarValid(aadhaar)
    ) {

      setError(
        "aadhaar",
        {
          message:
            "Invalid Aadhaar number",
        }
      );

      return false;
    }


    if (
      !isNonEmptyAlphabetsWithSpace(
        fatherName
      )
    ) {

      setError(
        "fatherName",
        {
          message:
            "Invalid father name",
        }
      );

      return false;
    }


    if (!isValidDate(dob)) {

      setError(
        "dob",
        {
          message:
            "Invalid date",
        }
      );

      return false;
    }


    if (!isValidDate(doj)) {

      setError(
        "doj",
        {
          message:
            "Invalid date",
        }
      );

      return false;
    }


    if (
      !isValidPhoneNo(phoneNo)
    ) {

      setError(
        "phoneNo",
        {
          message:
            "Invalid phone number",
        }
      );

      return false;
    }


    /* ============================================================
       PARENT RELATIONSHIP
    ============================================================ */

    if (
      ![
        "FATHER",
        "MOTHER",
        "GUARDIAN",
      ].includes(
        parentRelationship
      )
    ) {

      setError(
        "parentRelationship",
        {
          message:
            "Please select a valid parent relationship",
        }
      );

      return false;
    }


    const feeFields = [
      {
        name: "tie" as const,
        value: tie,
      },
      {
        name: "diary" as const,
        value: diary,
      },
      {
        name: "belt" as const,
        value: belt,
      },
      {
        name: "arrears" as const,
        value: arrears,
      },
    ];


    for (
      const field of feeFields
    ) {

      if (
        !isNonEmptyDecimalNumber(
          field.value
        )
      ) {

        setError(
          field.name,
          {
            message:
              "Invalid amount",
          }
        );

        return false;
      }

    }


    setSiblingsErrors(
      undefined
    );


    for (
      let i = 0;
      i <
      siblingsRef.current.length;
      i++
    ) {

      const sibling =
        siblingsRef.current[i];

      if (
        !sibling.admissionNo
      ) {

        setSiblingsErrors({
          index: i,
          message:
            "Invalid sibling details",
        });

        return false;
      }

    }


    return true;
  };


  /* ==========================================================================
     SUBMIT
  ========================================================================== */

  const onSubmit = async (
    data: StudentRegistrationFormFields
  ) => {

    const valid =
      validateData(data);

    if (!valid) {
      return;
    }

    setLoading(true);

    try {

      /* ======================================================================
         CREATE
      ====================================================================== */

      if (!preFetchedData) {

        await studentServices
          .createStudent({

            ...data,

            schoolID: user?.schoolId,

            academicYearId:
              selectedAcademicYearId,

            classNumber:
              selectedClass,

            sectionName:
              selectedSectionName,

            siblings:
              siblingsRef.current,

            

          } as any);


        showSnackbar(
          "Student created successfully.",
          Colors.successBg
        );


        const fullStudent =
          await studentServices
            .getStudentById({
              admissionNo:
                data.admissionNo,
            });


        setTimeout(() => {

          navigation.navigate(
            RootStackScreenNames.StudentDetails,
            {
              student:
                fullStudent,
            }
          );

        }, 500);

      }


      /* ======================================================================
         EDIT
      ====================================================================== */

      else {

        await studentServices
          .editStudent({

            ...data,

            academicYearId:
              selectedAcademicYearId,

            classNumber:
              selectedClass,

            sectionName:
              selectedSectionName,

            siblings:
              siblingsRef.current,

            oldAdmissionNo:
              preFetchedData
                .admissionNo,

          } as any);


        showSnackbar(
          "Student details updated successfully.",
          Colors.successBg
        );

      }


      /* ======================================================================
         REFRESH CACHE
      ====================================================================== */

      await queryClient.refetchQueries([
        "principal-class-student-counts",
      ]);


      await queryClient.refetchQueries([
        "student",
        data.admissionNo,
      ]);


      await queryClient.refetchQueries([
        "transactions",
      ]);


    } catch (err: any) {

      console.log(
        "STUDENT SAVE ERROR:",
        err?.response?.data ??
        err
      );


      showSnackbar(
        err?.response?.data?.message ??
          "Unable to save student. Please try again.",
        Colors.errorBg
      );

    } finally {

      setLoading(false);

    }

  };


  /* ==========================================================================
     ERROR
  ========================================================================== */

  const renderError = (
    message: unknown
  ) => {

    if (
      typeof message !==
        "string" ||
      message.trim() === ""
    ) {
      return null;
    }

    return (
      <Text
        style={
          styles.error
        }
      >
        {message}
      </Text>
    );

  };


  /* ==========================================================================
     LABELS
  ========================================================================== */

  const selectedAcademicYearName =
    selectedAcademicYear?.name ??
    "Select Academic Year";


  const selectedClassLabel =
    selectedClassDetails
      ? (
          selectedClassDetails
            .displayName ||
          `Class ${
            selectedClassDetails
              .classNumber
          }`
        )
      : "Select Class";


  const selectedSectionLabel =
    selectedSectionName ??
    "Select Section";






  /* ==========================================================================
     PROFILE DROPDOWN
  ========================================================================== */

  const renderProfileDropdown = () => {

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
        onRequestClose={() =>
          setProfileMenuVisible(false)
        }
      >

        <Pressable
          style={
            styles.modalOverlay
          }
          onPress={() =>
            setProfileMenuVisible(false)
          }
        >

          <View
            style={[
              styles.profileDropdown,
              isSmallScreen
                ? styles.profileDropdownMobile
                : styles.profileDropdownDesktop,
            ]}
          >

            <View
              style={
                styles.dropdownProfileHeader
              }
            >

              <Avatar.Text
                size={46}
                label={
                  getInitials(
                    user?.name
                  )
                }
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
                  {
                    user?.name ??
                    "Principal"
                  }
                </Text>

                <Text
                  style={
                    styles.dropdownUserEmail
                  }
                  numberOfLines={1}
                >
                  {
                    user?.email ??
                    "Principal"
                  }
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


            <TouchableOpacity
              activeOpacity={0.7}
              style={
                styles.dropdownItem
              }
              onPress={() =>
                setProfileMenuVisible(
                  false
                )
              }
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
                  View principal profile
                </Text>

              </View>

            </TouchableOpacity>


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


  /* ==========================================================================
     HEADER / NAVBAR
  ========================================================================== */

  const renderNavbar = () => {

    return (

      <View>

        {/* ================================================================
            TOP NAVBAR
        ================================================================ */}

        <View
          style={
            styles.platformHeader
          }
        >

          <View
            style={
              styles.platformBrand
            }
          >

            <Avatar.Icon
              size={
                isSmallScreen
                  ? 42
                  : 48
              }
              icon="shield-check"
              color="#FFFFFF"
              style={
                styles.platformLogo
              }
            />


            <View
              style={
                styles.platformBrandText
              }
            >

              <Text
                style={
                  styles.platformName
                }
              >
                School Platform
              </Text>

              <Text
                style={
                  styles.platformSubtitle
                }
              >
                Principal Administration
              </Text>

            </View>

          </View>


          <View
            style={
              styles.platformActions
            }
          >

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() =>
                setProfileMenuVisible(
                  true
                )
              }
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
                label={
                  getInitials(
                    user?.name
                  )
                }
                color="#FFFFFF"
                style={
                  styles.profileAvatar
                }
              />


              {!isSmallScreen ? (

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
                    {
                      user?.name ??
                      "Principal"
                    }
                  </Text>

                  <Text
                    style={
                      styles.profileRole
                    }
                  >
                    Principal
                  </Text>

                </View>

              ) : null}


              <Text
                style={
                  styles.profileArrow
                }
              >
                {
                  profileMenuVisible
                    ? "⌃"
                    : "⌄"
                }
              </Text>

            </TouchableOpacity>

          </View>

        </View>


        {/* ================================================================
            PAGE HEADING
        ================================================================ */}

        <View
          style={
            styles.dashboardHeading
          }
        >

          <View
            style={
              styles.greetingContainer
            }
          >

            <Text
              style={
                styles.greeting
              }
            >
              Good{" "}
              {getGreeting()}
              ,{" "}
              {getFirstName(
                user?.name
              )} 👋
            </Text>


            <Text
              style={
                styles.pageTitle
              }
            >
              {
                preFetchedData
                  ? "Edit Student"
                  : "Student Registration"
              }
            </Text>


            <Text
              style={
                styles.pageSubtitle
              }
            >
              {
                preFetchedData
                  ? "Update student information, academic details and fee information."
                  : "Register a new student with personal, academic and fee information."
              }
            </Text>

          </View>

        </View>

      </View>

    );
  };


  /* ==========================================================================
     FORM
  ========================================================================== */

  const renderForm = () => {

    return (

      <View>

        {renderNavbar()}


        {/* ================================================================
            STUDENT INFORMATION
        ================================================================ */}

        <View
          style={
            styles.formCard
          }
        >

          <Text
            style={
              styles.sectionTitle
            }
          >
            Student Information
          </Text>


          <Controller
            control={control}
            name="admissionNo"
            render={({
              field: {
                onChange,
                value,
              },
            }) => (

              <TextInput
                label="Admission No."
                value={value}
                onChangeText={
                  onChange
                }
                mode="outlined"
                autoCapitalize="characters"
                editable={
                  !preFetchedData
                }
                error={
                  !!errors.admissionNo
                }
                style={
                  styles.input
                }
              />

            )}
          />


          {renderError(
            errors.admissionNo
              ?.message
          )}


          <Controller
            control={control}
            name="name"
            render={({
              field: {
                onChange,
                value,
              },
            }) => (

              <TextInput
                label="Student Name"
                value={value}
                onChangeText={
                  onChange
                }
                mode="outlined"
                autoCapitalize="words"
                error={
                  !!errors.name
                }
                style={
                  styles.input
                }
              />

            )}
          />


          {renderError(
            errors.name?.message
          )}


          <Controller
            control={control}
            name="aadhaar"
            render={({
              field: {
                onChange,
                value,
              },
            }) => (

              <TextInput
                label="Aadhaar Number"
                value={value}
                onChangeText={
                  onChange
                }
                mode="outlined"
                keyboardType="numeric"
                maxLength={12}
                error={
                  !!errors.aadhaar
                }
                style={
                  styles.input
                }
              />

            )}
          />


          {renderError(
            errors.aadhaar
              ?.message
          )}


          <Controller
            control={control}
            name="fatherName"
            render={({
              field: {
                onChange,
                value,
              },
            }) => (

              <TextInput
                label="Father Name"
                value={value}
                onChangeText={
                  onChange
                }
                mode="outlined"
                autoCapitalize="words"
                error={
                  !!errors.fatherName
                }
                style={
                  styles.input
                }
              />

            )}
          />


          {renderError(
            errors.fatherName
              ?.message
          )}

        </View>


        {/* ================================================================
            DATES
        ================================================================ */}

        <View
          style={
            styles.formCard
          }
        >

          <Text
            style={
              styles.sectionTitle
            }
          >
            Dates
          </Text>


          <Controller
            control={control}
            name="dob"
            render={({
              field: {
                onChange,
                value,
              },
            }) => (

              <TextInput
                label="Date of Birth (DD/MM/YYYY)"
                value={value}
                onChangeText={
                  onChange
                }
                mode="outlined"
                placeholder="DD/MM/YYYY"
                error={
                  !!errors.dob
                }
                style={
                  styles.input
                }
              />

            )}
          />


          {renderError(
            errors.dob?.message
          )}


          <Controller
            control={control}
            name="doj"
            render={({
              field: {
                onChange,
                value,
              },
            }) => (

              <TextInput
                label="Date of Joining (DD/MM/YYYY)"
                value={value}
                onChangeText={
                  onChange
                }
                mode="outlined"
                placeholder="DD/MM/YYYY"
                error={
                  !!errors.doj
                }
                style={
                  styles.input
                }
              />

            )}
          />


          {renderError(
            errors.doj?.message
          )}

        </View>


        {/* ================================================================
            CONTACT
        ================================================================ */}

        <View
          style={
            styles.formCard
          }
        >

          <Text
            style={
              styles.sectionTitle
            }
          >
            Contact
          </Text>


          <Controller
            control={control}
            name="phoneNo"
            render={({
              field: {
                onChange,
                value,
              },
            }) => (

              <TextInput
                label="Phone Number"
                value={value}
                onChangeText={
                  onChange
                }
                mode="outlined"
                keyboardType="phone-pad"
                maxLength={10}
                error={
                  !!errors.phoneNo
                }
                style={
                  styles.input
                }
              />

            )}
          />


          {renderError(
            errors.phoneNo
              ?.message
          )}


          <Controller
            control={control}
            name="tcNo"
            render={({
              field: {
                onChange,
                value,
              },
            }) => (

              <TextInput
                label="TC No. (Optional)"
                value={
                  value ?? ""
                }
                onChangeText={
                  onChange
                }
                mode="outlined"
                error={
                  !!errors.tcNo
                }
                style={
                  styles.input
                }
              />

            )}
          />


          {renderError(
            errors.tcNo?.message
          )}

        </View>


        {/* ================================================================
            PARENT / GUARDIAN
        ================================================================ */}

        <View
          style={
            styles.formCard
          }
        >

          <Text
            style={
              styles.sectionTitle
            }
          >
            Parent / Guardian
          </Text>


          <Controller
            control={control}
            name="parentRelationship"
            render={({
              field: {
                onChange,
                value,
              },
            }) => (

              <Menu
                visible={
                  parentRelationshipMenuVisible
                }

                onDismiss={() =>
                  setParentRelationshipMenuVisible(
                    false
                  )
                }

                anchor={

                  <Button
                    mode="outlined"

                    onPress={() =>
                      setParentRelationshipMenuVisible(
                        true
                      )
                    }

                    disabled={
                      loading
                    }

                    style={
                      styles.dropdownButton
                    }

                    contentStyle={
                      styles.dropdownContent
                    }
                  >

                    {
                      value ===
                      "FATHER"
                        ? "Father"
                        : value ===
                          "MOTHER"
                          ? "Mother"
                          : "Guardian"
                    }

                  </Button>

                }
              >

                <Menu.Item
                  title="Father"
                  onPress={() => {

                    onChange(
                      "FATHER"
                    );

                    setParentRelationshipMenuVisible(
                      false
                    );

                  }}
                />

                <Menu.Item
                  title="Mother"
                  onPress={() => {

                    onChange(
                      "MOTHER"
                    );

                    setParentRelationshipMenuVisible(
                      false
                    );

                  }}
                />

                <Menu.Item
                  title="Guardian"
                  onPress={() => {

                    onChange(
                      "GUARDIAN"
                    );

                    setParentRelationshipMenuVisible(
                      false
                    );

                  }}
                />

              </Menu>

            )}
          />


          <Text
            style={
              styles.helperText
            }
          >
            Select the parent or guardian relationship
          </Text>


          {renderError(
            errors.parentRelationship
              ?.message
          )}

        </View>


        {/* ================================================================
            ACADEMIC DETAILS
        ================================================================ */}

        <View
          style={
            styles.formCard
          }
        >

          <Text
            style={
              styles.sectionTitle
            }
          >
            Academic Details
          </Text>


          {/* ============================================================
              ACADEMIC YEAR
          ============================================================ */}

          <Menu
            visible={
              academicYearMenuVisible
            }
            onDismiss={() =>
              setAcademicYearMenuVisible(
                false
              )
            }
            anchor={

              <Button
                mode="outlined"
                onPress={() =>
                  setAcademicYearMenuVisible(
                    true
                  )
                }
                disabled={
                  loadingRegistrationOptions ||
                  loading ||
                  preFetchedData != null
                }
                style={
                  styles.dropdownButton
                }
                contentStyle={
                  styles.dropdownContent
                }
              >
                {
                  selectedAcademicYearName
                }
              </Button>

            }
          >

            {academicYears.map(
              (academicYear) => (

                <Menu.Item
                  key={
                    academicYear.id
                  }
                  title={
                    academicYear.isCurrent
                      ? `${academicYear.name} (Current)`
                      : academicYear.name
                  }
                  onPress={() => {

                    setSelectedAcademicYearId(
                      academicYear.id
                    );

                    setSelectedClass(
                      null
                    );

                    setSelectedSectionName(
                      null
                    );

                    setAcademicYearMenuVisible(
                      false
                    );

                  }}
                />

              )
            )}

          </Menu>


          {loadingRegistrationOptions && (

            <Text
              style={
                styles.helperText
              }
            >
              Loading academic years...
            </Text>

          )}


          {Boolean(
            registrationOptionsError
          ) && (

            <Text
              style={
                styles.error
              }
            >
              Unable to load academic years.
            </Text>

          )}


          {/* ============================================================
              CLASS
          ============================================================ */}

          <Menu
            visible={
              classMenuVisible
            }
            onDismiss={() =>
              setClassMenuVisible(
                false
              )
            }
            anchor={

              <Button
                mode="outlined"
                onPress={() =>
                  setClassMenuVisible(
                    true
                  )
                }
                disabled={
                  !selectedAcademicYearId ||
                  availableClasses.length ===
                    0 ||
                  loading
                }
                style={
                  styles.dropdownButton
                }
                contentStyle={
                  styles.dropdownContent
                }
              >
                {
                  selectedClassLabel
                }
              </Button>

            }
          >

            {availableClasses.map(
              (classItem) => (

                <Menu.Item
                  key={
                    classItem.id
                  }
                  title={
                    classItem.displayName ||
                    `Class ${classItem.classNumber}`
                  }
                  onPress={() => {

                    setSelectedClass(
                      classItem.classNumber
                    );

                    setSelectedSectionName(
                      null
                    );

                    setClassMenuVisible(
                      false
                    );

                  }}
                />

              )
            )}

          </Menu>


          {selectedAcademicYearId &&
            availableClasses.length ===
              0 && (

              <Text
                style={
                  styles.helperText
                }
              >
                No classes available for this academic year.
              </Text>

            )}


          {/* ============================================================
              SECTION
          ============================================================ */}

          <Menu
            visible={
              sectionMenuVisible
            }
            onDismiss={() =>
              setSectionMenuVisible(
                false
              )
            }
            anchor={

              <Button
                mode="outlined"
                onPress={() =>
                  setSectionMenuVisible(
                    true
                  )
                }
                disabled={
                  !selectedClass ||
                  availableSections.length ===
                    0 ||
                  loading
                }
                style={
                  styles.dropdownButton
                }
                contentStyle={
                  styles.dropdownContent
                }
              >
                {
                  selectedSectionLabel
                }
              </Button>

            }
          >

            {availableSections.map(
              (section) => (

                <Menu.Item
                  key={
                    section.id
                  }
                  title={
                    section.sectionName
                  }
                  onPress={() => {

                    setSelectedSectionName(
                      section.sectionName
                    );

                    setSectionMenuVisible(
                      false
                    );

                  }}
                />

              )
            )}

          </Menu>


          {selectedClass &&
            availableSections.length ===
              0 && (

              <Text
                style={
                  styles.helperText
                }
              >
                No sections available for this class.
              </Text>

            )}

        </View>


        {/* ================================================================
            CLASS FEES
        ================================================================ */}

        <View
          style={
            styles.formCard
          }
        >

          <Text
            style={
              styles.sectionTitle
            }
          >
            Class Fees
          </Text>


          <TextInput
            label="Tuition Fee"
            value={
              String(
                selectedClassDetails
                  ?.tuitionFee ??
                classDetails
                  ?.data
                  ?.tuitionFee ??
                ""
              )
            }
            mode="outlined"
            editable={false}
            style={
              styles.input
            }
          />


          <TextInput
            label="Textbook Fee"
            value={
              String(
                selectedClassDetails
                  ?.textBookFee ??
                classDetails
                  ?.data
                  ?.textBookFee ??
                ""
              )
            }
            mode="outlined"
            editable={false}
            style={
              styles.input
            }
          />


          <TextInput
            label="Notebook Fee"
            value={
              String(
                selectedClassDetails
                  ?.noteBookFee ??
                classDetails
                  ?.data
                  ?.noteBookFee ??
                ""
              )
            }
            mode="outlined"
            editable={false}
            style={
              styles.input
            }
          />


          <TextInput
            label="Diary Fee"
            value={
              String(
                selectedClassDetails
                  ?.diaryFee ??
                ""
              )
            }
            mode="outlined"
            editable={false}
            style={
              styles.input
            }
          />

        </View>


        {/* ================================================================
            ADDITIONAL FEES
        ================================================================ */}

        <View
          style={
            styles.formCard
          }
        >

          <Text
            style={
              styles.sectionTitle
            }
          >
            Additional Fees
          </Text>


          <Controller
            control={control}
            name="tie"
            render={({
              field: {
                onChange,
                value,
              },
            }) => (

              <TextInput
                label="Tie"
                value={value}
                onChangeText={
                  onChange
                }
                mode="outlined"
                keyboardType="decimal-pad"
                error={
                  !!errors.tie
                }
                style={
                  styles.input
                }
              />

            )}
          />


          {renderError(
            errors.tie?.message
          )}


          <Controller
            control={control}
            name="diary"
            render={({
              field: {
                onChange,
                value,
              },
            }) => (

              <TextInput
                label="Diary"
                value={value}
                onChangeText={
                  onChange
                }
                mode="outlined"
                keyboardType="decimal-pad"
                error={
                  !!errors.diary
                }
                style={
                  styles.input
                }
              />

            )}
          />


          {renderError(
            errors.diary?.message
          )}


          <Controller
            control={control}
            name="belt"
            render={({
              field: {
                onChange,
                value,
              },
            }) => (

              <TextInput
                label="Belt"
                value={value}
                onChangeText={
                  onChange
                }
                mode="outlined"
                keyboardType="decimal-pad"
                error={
                  !!errors.belt
                }
                style={
                  styles.input
                }
              />

            )}
          />


          {renderError(
            errors.belt?.message
          )}


          <Controller
            control={control}
            name="arrears"
            render={({
              field: {
                onChange,
                value,
              },
            }) => (

              <TextInput
                label="Arrears / Previous Balance"
                value={value}
                onChangeText={
                  onChange
                }
                mode="outlined"
                keyboardType="decimal-pad"
                error={
                  !!errors.arrears
                }
                style={
                  styles.input
                }
              />

            )}
          />


          {renderError(
            errors.arrears
              ?.message
          )}

        </View>


        {/* ================================================================
            COUPON
        ================================================================ */}

        <View
          style={
            styles.formCard
          }
        >

          <Text
            style={
              styles.sectionTitle
            }
          >
            Coupon
          </Text>


          <Controller
            control={control}
            name="couponCode"
            render={({
              field: {
                onChange,
                value,
              },
            }) => (

              <TextInput
                label="Coupon Code (Optional)"
                value={value}
                onChangeText={
                  onChange
                }
                mode="outlined"
                autoCapitalize="characters"
                editable={
                  !preFetchedData
                    ?.couponCode
                    ?.code
                }
                error={
                  !!errors.couponCode
                }
                style={
                  styles.input
                }
              />

            )}
          />


          {renderError(
            errors.couponCode
              ?.message
          )}

        </View>


        {/* ================================================================
            SIBLINGS
        ================================================================ */}

        <View
          style={
            styles.formCard
          }
        >

          <Text
            style={
              styles.sectionTitle
            }
          >
            Siblings
          </Text>


          <SiblingsForm
            siblingsRef={
              siblingsRef
            }
            errors={
              siblingsErrors
            }
          />

        </View>


        {/* ================================================================
            SUBMIT
        ================================================================ */}

        <Button
          mode="contained"
          loading={loading}
          disabled={
            loading ||
            loadingRegistrationOptions ||
            fetchingRegistrationOptions ||
            fetchingClassDetails
          }
          onPress={
            handleSubmit(onSubmit)
          }
          style={
            styles.submitButton
          }
          contentStyle={
            styles.submitContent
          }
          labelStyle={
            styles.submitLabel
          }
        >
          {
            preFetchedData
              ? "UPDATE STUDENT"
              : "CREATE STUDENT"
          }
        </Button>


        <View
          style={
            styles.bottomSpace
          }
        />

      </View>

    );

  };


  /* ==========================================================================
     MAIN UI
  ========================================================================== */

  return (

    <Page
      style={
        styles.page
      }
    >

      <FlatList
        data={["form"]}
        renderItem={
          renderForm
        }
        keyExtractor={
          (item) =>
            item
        }
        showsVerticalScrollIndicator={
          false
        }
        automaticallyAdjustKeyboardInsets
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.listContent,
          {
            paddingHorizontal:
              horizontalPadding,
          },
        ]}
      />


      {renderProfileDropdown()}


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
        style={[
          styles.snackbar,
          {
            backgroundColor:
              snackbarColor,
          },
        ]}
      >
        {
          snackbarMessage
        }
      </Snackbar>

    </Page>

  );

};
/* ============================================================================
   STYLES
============================================================================ */

const styles =
  StyleSheet.create({

    /* ========================================================================
       PAGE
    ======================================================================== */

    page: {
      flex: 1,
      backgroundColor:
        "#F7F8FC",
    },


    listContent: {
      paddingTop: 24,
      paddingBottom:
        Metrics.x8,
    },


    /* ========================================================================
       PLATFORM NAVBAR
    ======================================================================== */

    platformHeader: {
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
        Metrics.x4,

      elevation: 1,
    },


    platformBrand: {
      flexDirection:
        "row",

      alignItems:
        "center",

      flex: 1,

      minWidth: 0,
    },


    platformLogo: {
      backgroundColor:
        Colors.brandPrimary,

      marginRight:
        Metrics.x2,
    },


    platformBrandText: {
      flex: 1,

      minWidth: 0,
    },


    platformName: {
      fontSize: 16,

      fontWeight:
        "800",

      color:
        "#171717",
    },


    platformSubtitle: {
      marginTop: 2,

      fontSize: 11,

      color:
        Colors.subtext,
    },


    platformActions: {
      flexDirection:
        "row",

      alignItems:
        "center",

      marginLeft:
        Metrics.x2,
    },


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
        "#F4F5F8",
    },


    profileAvatar: {
      backgroundColor:
        Colors.brandPrimary,
    },


    profileDetails: {
      marginLeft:
        Metrics.x2,

      width: 140,

      minWidth: 0,
    },


    profileName: {
      fontSize: 13,

      fontWeight:
        "700",

      color:
        "#171717",
    },


    profileRole: {
      marginTop: 1,

      fontSize: 10,

      color:
        Colors.subtext,
    },


    profileArrow: {
      marginLeft:
        Metrics.x1,

      fontSize: 17,

      fontWeight:
        "700",

      color:
        Colors.subtext,
    },


    /* ========================================================================
       DASHBOARD HEADING
    ======================================================================== */

    dashboardHeading: {
      paddingTop:
        Metrics.x1,

      paddingBottom:
        Metrics.x4,
    },


    greetingContainer: {
      flex: 1,
    },


    greeting: {
      fontSize: 14,

      fontWeight:
        "700",

      color:
        Colors.brandPrimary,

      marginBottom:
        Metrics.x1,
    },


    pageTitle: {
      fontSize: 28,

      lineHeight: 34,

      fontWeight:
        "800",

      color:
        "#171717",
    },


    pageSubtitle: {
      marginTop:
        Metrics.x1,

      fontSize: 14,

      lineHeight: 21,

      color:
        Colors.subtext,

      maxWidth: 650,
    },


    /* ========================================================================
       FORM CARD
    ======================================================================== */

    formCard: {
      backgroundColor:
        "#FFFFFF",

      borderWidth: 1,

      borderColor:
        "#ECEEF3",

      borderRadius: 14,

      padding:
        Metrics.x4,

      marginBottom:
        Metrics.x3,

      elevation: 1,
    },


    sectionTitle: {
      fontSize: 19,

      lineHeight: 24,

      fontWeight:
        "800",

      color:
        "#171717",

      marginBottom:
        Metrics.x3,
    },


    input: {
      marginBottom:
        Metrics.x1,
      backgroundColor:
        "#FFFFFF",
    },


    /* ========================================================================
       DROPDOWNS
    ======================================================================== */

    dropdownButton: {
      borderRadius: 10,

      marginBottom:
        Metrics.x2,
    },


    dropdownContent: {
      minHeight: 50,

      justifyContent:
        "center",
    },


    helperText: {
      fontSize: 12,

      lineHeight: 18,

      color:
        Colors.subtext,

      marginBottom:
        Metrics.x2,
    },


    error: {
      color:
        Colors.error,

      fontSize: 12,

      lineHeight: 18,

      marginBottom:
        Metrics.x2,
    },


    /* ========================================================================
       SUBMIT
    ======================================================================== */

    submitButton: {
      borderRadius: 12,

      marginTop:
        Metrics.x2,
    },


    submitContent: {
      minHeight: 50,

      paddingHorizontal:
        Metrics.x4,
    },


    submitLabel: {
      fontSize: 13,

      fontWeight:
        "800",
    },


    bottomSpace: {
      height:
        Metrics.x5,
    },


    /* ========================================================================
       PROFILE MODAL
    ======================================================================== */

    modalOverlay: {
      flex: 1,

      backgroundColor:
        "rgba(0,0,0,0.12)",

      justifyContent:
        "flex-start",

      alignItems:
        "flex-end",

      paddingTop: 82,

      paddingRight:
        Metrics.x3,
    },


    profileDropdown: {
      width: 310,

      backgroundColor:
        "#FFFFFF",

      borderRadius: 16,

      borderWidth: 1,

      borderColor:
        "#E9EAF0",

      padding:
        Metrics.x3,

      elevation: 8,

      shadowOpacity: 0.12,

      shadowRadius: 12,

      shadowOffset: {
        width: 0,
        height: 6,
      },
    },


    profileDropdownMobile: {
      width:
        "calc(100% - 24px)" as any,
    },


    profileDropdownDesktop: {
      maxWidth: 340,
    },


    dropdownProfileHeader: {
      flexDirection:
        "row",

      alignItems:
        "center",
    },


    dropdownAvatar: {
      backgroundColor:
        Colors.brandPrimary,
    },


    dropdownUserInfo: {
      flex: 1,

      marginLeft:
        Metrics.x2,

      minWidth: 0,
    },


    dropdownUserName: {
      fontSize: 15,

      fontWeight:
        "800",

      color:
        "#171717",
    },


    dropdownUserEmail: {
      marginTop: 2,

      fontSize: 11,

      color:
        Colors.subtext,
    },


    dropdownUserRole: {
      marginTop: 3,

      fontSize: 11,

      fontWeight:
        "700",

      color:
        Colors.brandPrimary,
    },


    dropdownDivider: {
      marginVertical:
        Metrics.x3,
    },


    dropdownItem: {
      flexDirection:
        "row",

      alignItems:
        "center",

      paddingVertical:
        Metrics.x2,

      borderRadius: 12,
    },


    logoutItem: {
      marginTop:
        Metrics.x1,
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
        "#F4F5F8",
    },


    logoutIconContainer: {
      backgroundColor:
        "#FFF0F0",
    },


    dropdownIcon: {
      fontSize: 19,
    },


    logoutIcon: {
      color:
        "#D64545",
    },


    dropdownItemTextContainer: {
      flex: 1,

      marginLeft:
        Metrics.x2,
    },


    dropdownItemTitle: {
      fontSize: 14,

      fontWeight:
        "700",

      color:
        "#171717",
    },


    logoutTitle: {
      color:
        "#D64545",
    },


    dropdownItemSubtitle: {
      marginTop: 2,

      fontSize: 11,

      color:
        Colors.subtext,
    },


    /* ========================================================================
       SNACKBAR
    ======================================================================== */

    snackbar: {
      marginHorizontal:
        Metrics.x3,

      marginBottom:
        Metrics.x2,
    },

  });


export {
  StudentRegistrationFormScreen,
};