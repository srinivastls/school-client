import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
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
  useNavigation,
} from "@react-navigation/native";

import type {
  NativeStackScreenProps,
} from "@react-navigation/native-stack";

import {
  useQuery,
  useQueryClient,
} from "react-query";

import {
  Controller,
  useForm,
} from "react-hook-form";

import {
  RootStackParamList,
  RootStackScreenNames,
  Student,
  CreateStudentFormFields,
} from "../types";

import {
  Colors,
  makeStyles,
  Metrics,
} from "../theme";

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
   PROPS
============================================================================ */

type Props =
  NativeStackScreenProps<
    RootStackParamList,
    RootStackScreenNames.EditStudent
  >;


/* ============================================================================
   TYPES
============================================================================ */

type AcademicYearOption = {
  id: string;
  name: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
};

type ClassOption = {
  id: string;
  academicYearId?: string;
  classNumber: string;
  displayName?: string;
};

type SectionOption = {
  id: string;
  classId: string;
  sectionName: string;
};


/* ============================================================================
   INITIALS
============================================================================ */

const getInitials = (
  name?: string | null
) => {
  if (!name) {
    return "P";
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


/* ============================================================================
   SCREEN
============================================================================ */

const EditStudentScreen = ({
  route,
  navigation,
}: Props) => {

  const styles = useStyles();

  const {
    width,
  } = useWindowDimensions();

  const user =
    useUserStore(
      (state) => state.user
    );

  const logout =
    useUserStore(
      (state) => state.logout
    );


  /* ==========================================================================
     RESPONSIVE
  ========================================================================== */

  const isMobile =
    width < 700;

  const isTablet =
    width >= 700 &&
    width < 1100;

  const horizontalPadding =
    isMobile
      ? Metrics.x3
      : isTablet
        ? Metrics.x4
        : Metrics.x6;


  /* ==========================================================================
     STUDENT
  ========================================================================== */

  const preFetchedData =
    route.params
      ?.preFetchedData as Student;


  /* ==========================================================================
     QUERY CLIENT
  ========================================================================== */

  const queryClient =
    useQueryClient();


  /* ==========================================================================
     UI STATE
  ========================================================================== */

  const [
    profileMenuVisible,
    setProfileMenuVisible,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(false);

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


  /* ==========================================================================
     REGISTRATION OPTIONS
  ========================================================================== */

  const {
    data: registrationOptions,
    isLoading:
      loadingRegistrationOptions,
    isError:
      registrationOptionsError,
    refetch:
      refetchRegistrationOptions,
  } = useQuery(
    [
      "student-registration-options",
    ],
    studentServices
      .getRegistrationOptions,
    {
      staleTime:
        5 * 60 * 1000,

      cacheTime:
        10 * 60 * 1000,
    }
  );


  /* ==========================================================================
     INITIAL VALUES
  ========================================================================== */

  const initialAcademicYearId =
    preFetchedData?.academicYearId ??
    "";

  const initialClassNumber =
    preFetchedData
      ?.classNumber
      ?.classNumber != null
      ? String(
          preFetchedData
            .classNumber
            .classNumber
        )
      : "";

  const initialSectionName =
    preFetchedData?.sectionName ??
    "";


  /* ==========================================================================
     SELECTED VALUES
  ========================================================================== */

  const [
    selectedAcademicYear,
    setSelectedAcademicYear,
  ] = useState<string>(
    initialAcademicYearId
  );

  const [
    selectedClass,
    setSelectedClass,
  ] = useState<string>(
    initialClassNumber
  );

  const [
    selectedSection,
    setSelectedSection,
  ] = useState<string>(
    initialSectionName
  );


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
    useForm<CreateStudentFormFields>({
      defaultValues: {

        admissionNo:
          preFetchedData
            ?.admissionNo ??
          "",

        name:
          preFetchedData?.name ??
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
          preFetchedData?.dob ??
          "",

        doj:
          preFetchedData?.doj ??
          "",

        phoneNo:
          preFetchedData
            ?.phoneNo ??
          "",

        tcNo:
          preFetchedData?.tcNo ??
          "",

        siblings:
          Array.isArray(
            preFetchedData?.siblings
          )
            ? preFetchedData.siblings
            : [],

        academicYearId:
          initialAcademicYearId,

        classNumber:
          initialClassNumber,

        sectionName:
          initialSectionName,

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
          "",
      },
    });


  /* ==========================================================================
     SNACKBAR
  ========================================================================== */

  const showSnackbar = (
    message: string,
    backgroundColor: string
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
  };


  /* ==========================================================================
     NORMALIZE ACADEMIC YEARS
  ========================================================================== */

  const availableAcademicYears =
    useMemo<
      AcademicYearOption[]
    >(() => {

      if (!registrationOptions) {
        return [];
      }

      return Array.isArray(
        registrationOptions
          .academicYears
      )
        ? registrationOptions
            .academicYears
        : [];

    }, [
      registrationOptions,
    ]);


  /* ==========================================================================
     NORMALIZE CLASSES
  ========================================================================== */

  const availableClasses =
    useMemo<
      ClassOption[]
    >(() => {

      if (!registrationOptions) {
        return [];
      }

      if (
        Array.isArray(
          registrationOptions
            .classes
        )
      ) {

        return registrationOptions
          .classes
          .map(
            (item: any) => ({
              id:
                String(item.id),

              academicYearId:
                item.academicYearId
                  ? String(
                      item.academicYearId
                    )
                  : undefined,

              classNumber:
                String(
                  item.classNumber
                ),

              displayName:
                item.displayName ??
                String(
                  item.classNumber
                ),
            })
          );
      }

      const result:
        ClassOption[] = [];

      for (
        const year of
          availableAcademicYears
      ) {

        const classes =
          (year as any)
            .classes;

        if (
          !Array.isArray(
            classes
          )
        ) {
          continue;
        }

        for (
          const item of
            classes
        ) {

          result.push({
            id:
              String(item.id),

            academicYearId:
              String(year.id),

            classNumber:
              String(
                item.classNumber
              ),

            displayName:
              item.displayName ??
              String(
                item.classNumber
              ),
          });
        }
      }

      return result;

    }, [
      registrationOptions,
      availableAcademicYears,
    ]);


  /* ==========================================================================
     CLASSES FOR YEAR
  ========================================================================== */

  const classesForSelectedYear =
    useMemo(() => {

      if (
        !selectedAcademicYear
      ) {
        return [];
      }

      return availableClasses
        .filter(
          (item) => {

            if (
              item.academicYearId
            ) {

              return (
                String(
                  item.academicYearId
                ) ===
                String(
                  selectedAcademicYear
                )
              );
            }

            return false;
          }
        );

    }, [
      availableClasses,
      selectedAcademicYear,
    ]);


  /* ==========================================================================
     SELECTED CLASS
  ========================================================================== */

  const selectedClassDetails =
    useMemo(() => {

      return classesForSelectedYear
        .find(
          (item) =>
            String(
              item.classNumber
            ) ===
            String(
              selectedClass
            )
        );

    }, [
      classesForSelectedYear,
      selectedClass,
    ]);


  /* ==========================================================================
     NORMALIZE SECTIONS
  ========================================================================== */

  const availableSections =
    useMemo<
      SectionOption[]
    >(() => {

      if (!registrationOptions) {
        return [];
      }

      if (
        Array.isArray(
          registrationOptions
            .sections
        )
      ) {

        return registrationOptions
          .sections
          .map(
            (item: any) => ({
              id:
                String(item.id),

              classId:
                String(item.classId),

              sectionName:
                String(
                  item.sectionName
                ),
            })
          );
      }

      if (
        selectedClassDetails &&
        Array.isArray(
          (selectedClassDetails as any)
            .sections
        )
      ) {

        return (
          (
            selectedClassDetails as any
          ).sections
        ).map(
          (item: any) => ({
            id:
              String(item.id),

            classId:
              String(
                selectedClassDetails.id
              ),

            sectionName:
              String(
                item.sectionName
              ),
          })
        );
      }

      return [];

    }, [
      registrationOptions,
      selectedClassDetails,
    ]);


  /* ==========================================================================
     KEEP INITIAL VALUES
  ========================================================================== */

  useEffect(() => {

    if (
      !registrationOptions
    ) {
      return;
    }

    if (
      initialAcademicYearId &&
      !selectedAcademicYear
    ) {
      setSelectedAcademicYear(
        initialAcademicYearId
      );
    }

    if (
      initialClassNumber &&
      !selectedClass
    ) {
      setSelectedClass(
        initialClassNumber
      );
    }

    if (
      initialSectionName &&
      !selectedSection
    ) {
      setSelectedSection(
        initialSectionName
      );
    }

  }, [
    registrationOptions,
    initialAcademicYearId,
    initialClassNumber,
    initialSectionName,
    selectedAcademicYear,
    selectedClass,
    selectedSection,
  ]);


  /* ==========================================================================
     VALIDATION
  ========================================================================== */

  const validateData = (
    data: CreateStudentFormFields
  ) => {

    if (
      !selectedAcademicYear
    ) {

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

    if (!selectedSection) {

      showSnackbar(
        "Please select a section.",
        Colors.errorBg
      );

      return false;
    }

    if (
      !isNonEmptyAlphaNumerals(
        data.admissionNo
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
        data.name
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
      !isAadhaarValid(
        data.aadhaar
      )
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
        data.fatherName
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

    if (
      !isValidDate(data.dob)
    ) {

      setError(
        "dob",
        {
          message:
            "Invalid date",
        }
      );

      return false;
    }

    if (
      !isValidDate(data.doj)
    ) {

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
      !isValidPhoneNo(
        data.phoneNo
      )
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

    const feeFields = [
      {
        name: "tie" as const,
        value: data.tie,
      },
      {
        name: "diary" as const,
        value: data.diary,
      },
      {
        name: "belt" as const,
        value: data.belt,
      },
      {
        name: "arrears" as const,
        value: data.arrears,
      },
    ];

    for (
      const field of
        feeFields
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

    return true;
  };


  /* ==========================================================================
     SUBMIT
  ========================================================================== */

  const onSubmit = async (
    data: CreateStudentFormFields
  ) => {

    if (
      !validateData(data)
    ) {
      return;
    }

    if (loading) {
      return;
    }

    setLoading(true);

    try {

      const siblings =
        Array.isArray(
          data.siblings
        )
          ? data.siblings
          : [];

      const editPayload = {

        admissionNo:
          data.admissionNo,

        oldAdmissionNo:
          preFetchedData
            .admissionNo,

        name:
          data.name,

        aadhaar:
          data.aadhaar,

        fatherName:
          data.fatherName,

        dob:
          data.dob,

        doj:
          data.doj,

        phoneNo:
          data.phoneNo,

        academicYearId:
          selectedAcademicYear,

        classNumber:
          selectedClass,

        sectionName:
          selectedSection,

        tie:
          data.tie,

        belt:
          data.belt,

        arrears:
          data.arrears,

        diary:
          data.diary,

        siblings,

        tcNo:
          data.tcNo?.trim()
            ? data.tcNo.trim()
            : undefined,
      };


      await studentServices
        .editStudent(
          editPayload as any
        );


      /* ========================================================
         REFRESH CACHED DATA
      ======================================================== */

      await queryClient.refetchQueries(
        [
          "student",
          preFetchedData
            .admissionNo,
        ]
      );

      await queryClient.refetchQueries(
        [
          "principal-class-student-counts",
        ]
      );

      await queryClient.refetchQueries(
        [
          "student-registration-options",
        ]
      );


      /* ========================================================
         GET UPDATED STUDENT
      ======================================================== */

      const updatedStudent =
        await studentServices
          .getStudentById({
            admissionNo:
              data.admissionNo,
          });


      showSnackbar(
        "Student details updated successfully.",
        Colors.successBg
      );


      /* ========================================================
         NAVIGATE
      ======================================================== */

      navigation.navigate(
        RootStackScreenNames.StudentDetails,
        {
          student:
            updatedStudent,
        }
      );

    } catch (
      err: any
    ) {

      console.log(
        "EDIT STUDENT ERROR:",
        err?.response?.data ??
          err
      );

      showSnackbar(
        err?.response?.data
          ?.message ??
          "Unable to update student.",
        Colors.errorBg
      );

    } finally {

      setLoading(false);
    }
  };


  /* ==========================================================================
     LOGOUT
  ========================================================================== */

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


  /* ==========================================================================
     ERROR
  ========================================================================== */

  const renderError = (
    message?: string
  ) => {

    if (!message) {
      return null;
    }

    return (
      <Text
        style={styles.error}
      >
        {message}
      </Text>
    );
  };


  /* ==========================================================================
     OPTION BUTTON
  ========================================================================== */

  const renderOption = (
    label: string,
    selected: boolean,
    onPress: () => void
  ) => {

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        style={[
          styles.option,
          selected &&
            styles.optionSelected,
        ]}
      >

        {selected && (
          <Text
            style={
              styles.optionCheck
            }
          >
            ✓
          </Text>
        )}

        <Text
          style={[
            styles.optionText,
            selected &&
              styles.optionTextSelected,
          ]}
        >
          {label}
        </Text>

      </TouchableOpacity>
    );
  };


  /* ==========================================================================
     PROFILE MENU
  ========================================================================== */

  const renderProfileMenu =
    () => {

      if (
        !profileMenuVisible
      ) {
        return null;
      }

      return (
        <View
          style={
            styles.profileMenu
          }
        >

          <View
            style={
              styles.profileMenuHeader
            }
          >

            <Avatar.Text
              size={44}
              label={getInitials(
                user?.name
              )}
              style={
                styles.profileAvatar
              }
              color="#FFFFFF"
            />

            <View
              style={
                styles.profileMenuInfo
              }
            >

              <Text
                style={
                  styles.profileMenuName
                }
                numberOfLines={1}
              >
                {user?.name ||
                  "Principal"}
              </Text>

              <Text
                style={
                  styles.profileMenuEmail
                }
                numberOfLines={1}
              >
                {user?.email || ""}
              </Text>

              <Text
                style={
                  styles.profileMenuRole
                }
              >
                Principal
              </Text>

            </View>

          </View>

          <Divider
            style={
              styles.profileDivider
            }
          />

          <TouchableOpacity
            activeOpacity={0.8}
            style={
              styles.profileMenuItem
            }
            onPress={() => {

              setProfileMenuVisible(
                false
              );

              showSnackbar(
                "Profile settings coming next.",
                Colors.successBg
              );
            }}
          >

            <Text
              style={
                styles.profileMenuIcon
              }
            >
              👤
            </Text>

            <View
              style={
                styles.profileMenuItemText
              }
            >

              <Text
                style={
                  styles.profileMenuItemTitle
                }
              >
                Profile
              </Text>

              <Text
                style={
                  styles.profileMenuItemSubtitle
                }
              >
                View principal profile
              </Text>

            </View>

          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            style={[
              styles.profileMenuItem,
              styles.logoutItem,
            ]}
            onPress={
              handleLogout
            }
          >

            <Text
              style={[
                styles.profileMenuIcon,
                styles.logoutIcon,
              ]}
            >
              ↪
            </Text>

            <View
              style={
                styles.profileMenuItemText
              }
            >

              <Text
                style={[
                  styles.profileMenuItemTitle,
                  styles.logoutText,
                ]}
              >
                Logout
              </Text>

              <Text
                style={
                  styles.profileMenuItemSubtitle
                }
              >
                Sign out of this account
              </Text>

            </View>

          </TouchableOpacity>

        </View>
      );
    };


  /* ==========================================================================
     NAVBAR
  ========================================================================== */

  const renderNavbar =
    () => {

      return (
        <View
          style={
            styles.navbar
          }
        >

          <View
            style={
              styles.navbarLeft
            }
          >

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() =>
                navigation.goBack()
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


            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() =>
                navigation.navigate(
                  RootStackScreenNames.PrincipalDashboard
                )
              }
              style={
                styles.brand
              }
            >

              <Avatar.Icon
                size={
                  isMobile
                    ? 40
                    : 44
                }
                icon="school"
                color="#FFFFFF"
                style={
                  styles.brandIcon
                }
              />

              <View
                style={
                  styles.brandText
                }
              >

                <Text
                  style={
                    styles.schoolName
                  }
                  numberOfLines={1}
                >
                  {user?.schoolName ||
                    "School Platform"}
                </Text>

                <Text
                  style={
                    styles.schoolSubtitle
                  }
                >
                  Principal Administration
                </Text>

              </View>

            </TouchableOpacity>

          </View>


          <View
            style={
              styles.navbarRight
            }
          >

            <IconButton
              icon="refresh"
              iconColor={
                Colors.brandPrimary
              }
              size={21}
              onPress={() =>
                refetchRegistrationOptions()
              }
              style={
                styles.refreshButton
              }
            />

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() =>
                setProfileMenuVisible(
                  (value) =>
                    !value
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
                  isMobile
                    ? 36
                    : 40
                }
                label={getInitials(
                  user?.name
                )}
                style={
                  styles.profileAvatar
                }
                color="#FFFFFF"
              />

              {!isMobile && (
                <View
                  style={
                    styles.profileButtonInfo
                  }
                >

                  <Text
                    style={
                      styles.profileButtonName
                    }
                    numberOfLines={1}
                  >
                    {user?.name ||
                      "Principal"}
                  </Text>

                  <Text
                    style={
                      styles.profileButtonRole
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


  /* ==========================================================================
     STUDENT SUMMARY
  ========================================================================== */

  const renderStudentSummary =
    () => {

      const classNumber =
        typeof preFetchedData
          ?.classNumber ===
        "object"
          ? preFetchedData
              .classNumber
              ?.classNumber
          : preFetchedData
              ?.classNumber;

      return (
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

              <Avatar.Text
                size={
                  isMobile
                    ? 60
                    : 72
                }
                label={getInitials(
                  preFetchedData
                    ?.name
                )}
                color="#4F46E5"
                style={
                  styles.studentAvatar
                }
              />

              <View
                style={
                  styles.studentSummary
                }
              >

                <Text
                  style={
                    styles.studentEyebrow
                  }
                >
                  EDITING STUDENT
                </Text>

                <Text
                  style={
                    styles.studentName
                  }
                >
                  {preFetchedData
                    ?.name}
                </Text>

                <Text
                  style={
                    styles.studentAdmission
                  }
                >
                  Admission No.{" "}
                  {
                    preFetchedData
                      ?.admissionNo
                  }
                </Text>

                <View
                  style={
                    styles.studentBadges
                  }
                >

                  <View
                    style={
                      styles.badge
                    }
                  >

                    <Text
                      style={
                        styles.badgeText
                      }
                    >
                      Class{" "}
                      {classNumber ||
                        "-"}
                    </Text>

                  </View>

                  <View
                    style={
                      styles.badge
                    }
                  >

                    <Text
                      style={
                        styles.badgeText
                      }
                    >
                      Section{" "}
                      {
                        preFetchedData
                          ?.sectionName ||
                        "-"
                      }
                    </Text>

                  </View>

                </View>

              </View>

            </View>

          </Card.Content>

        </Card>
      );
    };


  /* ==========================================================================
     MAIN
  ========================================================================== */

  return (
    <View
      style={
        styles.container
      }
    >

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingHorizontal:
              horizontalPadding,
          },
        ]}
      >

        {/* ================================================================
            NAVBAR
        ================================================================ */}

        {renderNavbar()}


        {/* ================================================================
            PAGE HEADER
        ================================================================ */}

        <View
          style={
            styles.pageHeader
          }
        >

          <Text
            style={
              styles.eyebrow
            }
          >
            PEOPLE / STUDENTS
          </Text>

          <Text
            style={
              styles.title
            }
          >
            Edit Student
          </Text>

          <Text
            style={
              styles.subtitle
            }
          >
            Update student information,
            academic placement, contact
            details and fee settings.
          </Text>

        </View>


        {/* ================================================================
            STUDENT SUMMARY
        ================================================================ */}

        {renderStudentSummary()}


        {/* ================================================================
            ACADEMIC INFORMATION
        ================================================================ */}

        <View
          style={
            styles.section
          }
        >

          <Text
            style={
              styles.sectionTitle
            }
          >
            Academic Information
          </Text>

          <Card
            style={
              styles.card
            }
          >

            <Card.Content>

              <Text
                style={
                  styles.fieldLabel
                }
              >
                Academic Year
              </Text>

              {loadingRegistrationOptions ? (

                <View
                  style={
                    styles.loadingRow
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
                      styles.helperText
                    }
                  >
                    Loading academic years...
                  </Text>

                </View>

              ) : registrationOptionsError ? (

                <View>

                  <Text
                    style={
                      styles.helperText
                    }
                  >
                    Unable to load academic years.
                  </Text>

                  <Button
                    mode="outlined"
                    onPress={() =>
                      refetchRegistrationOptions()
                    }
                    style={
                      styles.retryButton
                    }
                  >
                    RETRY
                  </Button>

                </View>

              ) : (

                <View
                  style={
                    styles.optionsWrap
                  }
                >

                  {availableAcademicYears.map(
                    (item) =>
                      renderOption(
                        item.name,
                        String(
                          selectedAcademicYear
                        ) ===
                          String(
                            item.id
                          ),
                        () => {

                          if (
                            String(
                              item.id
                            ) ===
                            String(
                              selectedAcademicYear
                            )
                          ) {
                            return;
                          }

                          setSelectedAcademicYear(
                            String(
                              item.id
                            )
                          );

                          setSelectedClass(
                            ""
                          );

                          setSelectedSection(
                            ""
                          );
                        }
                      )
                  )}

                </View>

              )}


              <Text
                style={
                  styles.fieldLabelSpacing
                }
              >
                Class
              </Text>

              {!selectedAcademicYear ? (

                <Text
                  style={
                    styles.helperText
                  }
                >
                  Select an academic year first.
                </Text>

              ) : classesForSelectedYear.length ===
                0 ? (

                <Text
                  style={
                    styles.helperText
                  }
                >
                  No classes available for this academic year.
                </Text>

              ) : (

                <View
                  style={
                    styles.optionsWrap
                  }
                >

                  {classesForSelectedYear.map(
                    (item) =>
                      renderOption(
                        item.displayName ??
                          item.classNumber,
                        String(
                          selectedClass
                        ) ===
                          String(
                            item.classNumber
                          ),
                        () => {

                          setSelectedClass(
                            String(
                              item.classNumber
                            )
                          );

                          setSelectedSection(
                            ""
                          );
                        }
                      )
                  )}

                </View>

              )}


              <Text
                style={
                  styles.fieldLabelSpacing
                }
              >
                Section
              </Text>

              {!selectedClass ? (

                <Text
                  style={
                    styles.helperText
                  }
                >
                  Select a class first.
                </Text>

              ) : availableSections.length ===
                0 ? (

                <Text
                  style={
                    styles.helperText
                  }
                >
                  No sections available for this class.
                </Text>

              ) : (

                <View
                  style={
                    styles.optionsWrap
                  }
                >

                  {availableSections.map(
                    (item) =>
                      renderOption(
                        item.sectionName,
                        String(
                          selectedSection
                        ) ===
                          String(
                            item.sectionName
                          ),
                        () =>
                          setSelectedSection(
                            String(
                              item.sectionName
                            )
                          )
                      )
                  )}

                </View>

              )}

            </Card.Content>

          </Card>

        </View>


        {/* ================================================================
            BASIC INFORMATION
        ================================================================ */}

        <View
          style={
            styles.section
          }
        >

          <Text
            style={
              styles.sectionTitle
            }
          >
            Student Information
          </Text>

          <Card
            style={
              styles.card
            }
          >

            <Card.Content>

              <View
                style={
                  isMobile
                    ? styles.singleColumn
                    : styles.formGrid
                }
              >

                <View
                  style={
                    styles.formField
                  }
                >

                  <Controller
                    control={control}
                    name="admissionNo"
                    render={({
                      field: {
                        value,
                      },
                    }) => (
                      <TextInput
                        label="Admission No."
                        value={
                          value
                        }
                        mode="outlined"
                        editable={
                          false
                        }
                        style={
                          styles.input
                        }
                      />
                    )}
                  />

                  {renderError(
                    errors
                      .admissionNo
                      ?.message
                  )}

                </View>


                <View
                  style={
                    styles.formField
                  }
                >

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
                        value={
                          value
                        }
                        onChangeText={
                          onChange
                        }
                        mode="outlined"
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
                    errors.name
                      ?.message
                  )}

                </View>


                <View
                  style={
                    styles.formField
                  }
                >

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
                        value={
                          value
                        }
                        onChangeText={
                          onChange
                        }
                        mode="outlined"
                        keyboardType="numeric"
                        maxLength={
                          12
                        }
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

                </View>


                <View
                  style={
                    styles.formField
                  }
                >

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
                        value={
                          value
                        }
                        onChangeText={
                          onChange
                        }
                        mode="outlined"
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
                    errors
                      .fatherName
                      ?.message
                  )}

                </View>

              </View>

            </Card.Content>

          </Card>

        </View>


        {/* ================================================================
            DATES / CONTACT
        ================================================================ */}

        <View
          style={
            styles.section
          }
        >

          <Text
            style={
              styles.sectionTitle
            }
          >
            Dates & Contact
          </Text>

          <Card
            style={
              styles.card
            }
          >

            <Card.Content>

              <View
                style={
                  isMobile
                    ? styles.singleColumn
                    : styles.formGrid
                }
              >

                <View
                  style={
                    styles.formField
                  }>

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
                        label="Date of Birth"
                        value={
                          value
                        }
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
                    errors.dob
                      ?.message
                  )}

                </View>


                <View
                  style={
                    styles.formField
                  }>

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
                        label="Date of Joining"
                        value={
                          value
                        }
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
                    errors.doj
                      ?.message
                  )}

                </View>


                <View
                  style={
                    styles.formField
                  }>

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
                        value={
                          value
                        }
                        onChangeText={
                          onChange
                        }
                        mode="outlined"
                        keyboardType="phone-pad"
                        maxLength={
                          10
                        }
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

                </View>


                <View
                  style={
                    styles.formField
                  }>

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
                          value ??
                          ""
                        }
                        onChangeText={
                          onChange
                        }
                        mode="outlined"
                        style={
                          styles.input
                        }
                      />
                    )}
                  />

                </View>

              </View>

            </Card.Content>

          </Card>

        </View>


        {/* ================================================================
            FEES
        ================================================================ */}

        <View
          style={
            styles.section
          }
        >

          <Text
            style={
              styles.sectionTitle
            }
          >
            Additional Fees
          </Text>

          <Card
            style={
              styles.card
            }
          >

            <Card.Content>

              <View
                style={
                  isMobile
                    ? styles.singleColumn
                    : styles.formGrid
                }
              >

                {[
                  {
                    name:
                      "tie" as const,
                    label:
                      "Tie",
                  },
                  {
                    name:
                      "diary" as const,
                    label:
                      "Diary",
                  },
                  {
                    name:
                      "belt" as const,
                    label:
                      "Belt",
                  },
                  {
                    name:
                      "arrears" as const,
                    label:
                      "Arrears / Previous Balance",
                  },
                ].map(
                  (field) => (

                    <View
                      key={
                        field.name
                      }
                      style={
                        styles.formField
                      }
                    >

                      <Controller
                        control={
                          control
                        }
                        name={
                          field.name
                        }
                        render={({
                          field: {
                            onChange,
                            value,
                          },
                        }) => (
                          <TextInput
                            label={
                              field.label
                            }
                            value={
                              value
                            }
                            onChangeText={
                              onChange
                            }
                            mode="outlined"
                            keyboardType="decimal-pad"
                            error={
                              !!errors[
                                field.name
                              ]
                            }
                            left={
                              <TextInput.Icon
                                icon="currency-inr"
                              />
                            }
                            style={
                              styles.input
                            }
                          />
                        )}
                      />

                      {renderError(
                        errors[
                          field.name
                        ]?.message
                      )}

                    </View>

                  )
                )}

              </View>

            </Card.Content>

          </Card>

        </View>


        {/* ================================================================
            COUPON
        ================================================================ */}

        <View
          style={
            styles.section
          }
        >

          <Text
            style={
              styles.sectionTitle
            }
          >
            Coupon
          </Text>

          <Card
            style={
              styles.couponCard
            }
          >

            <Card.Content>

              <View
                style={
                  styles.couponRow
                }
              >

                <View
                  style={
                    styles.couponIcon
                  }
                >

                  <Text
                    style={
                      styles.couponIconText
                    }
                  >
                    %
                  </Text>

                </View>

                <View
                  style={
                    styles.couponText
                  }
                >

                  <Text
                    style={
                      styles.couponTitle
                    }
                  >
                    Existing Coupon
                  </Text>

                  <Text
                    style={
                      styles.couponDescription
                    }
                  >
                    Existing applied coupons are
                    preserved and are not reapplied
                    when editing this student.
                  </Text>

                </View>

              </View>

            </Card.Content>

          </Card>

        </View>


        {/* ================================================================
            UPDATE
        ================================================================ */}

        <Card
          style={
            styles.updateCard
          }
        >

          <Card.Content>

            <View
              style={
                isMobile
                  ? styles.updateMobile
                  : styles.updateRow
              }
            >

              <View
                style={
                  styles.updateText
                }
              >

                <Text
                  style={
                    styles.updateTitle
                  }
                >
                  Ready to save changes?
                </Text>

                <Text
                  style={
                    styles.updateSubtitle
                  }
                >
                  Review the information above before
                  updating the student record.
                </Text>

              </View>

              <Button
                mode="contained"
                icon="content-save"
                loading={
                  loading ||
                  loadingRegistrationOptions
                }
                disabled={
                  loading ||
                  loadingRegistrationOptions
                }
                onPress={
                  handleSubmit(
                    onSubmit
                  )
                }
                style={
                  styles.submitButton
                }
                contentStyle={
                  styles.submitContent
                }
              >
                UPDATE STUDENT
              </Button>

            </View>

          </Card.Content>

        </Card>


        <View
          style={
            styles.bottomSpace
          }
        />

      </ScrollView>


      {/* ================================================================
          PROFILE MENU
      ================================================================ */}

      {profileMenuVisible && (
        <>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() =>
              setProfileMenuVisible(
                false
              )
            }
            style={
              styles.profileOverlay
            }
          />

          {renderProfileMenu()}
        </>
      )}


      {/* ================================================================
          SNACKBAR
      ================================================================ */}

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
        {snackbarMessage}
      </Snackbar>

    </View>
  );
};


/* ============================================================================
   STYLES
============================================================================ */

const useStyles = makeStyles(
  () => {

    return {

      /* ======================================================================
         PAGE
      ====================================================================== */

      container: {
        flex: 1,

        backgroundColor:
          "#F7F8FC",
      },

      scrollContent: {
        paddingTop:
          Metrics.x3,

        paddingBottom:
          Metrics.x8,
      },


      /* ======================================================================
         NAVBAR
      ====================================================================== */

      navbar: {
        minHeight: 70,

        flexDirection:
          "row",

        alignItems:
          "center",

        justifyContent:
          "space-between",

        paddingHorizontal:
          Metrics.x3,

        paddingVertical:
          Metrics.x2,

        backgroundColor:
          "#FFFFFF",

        borderRadius: 16,

        borderWidth: 1,

        borderColor:
          "#E7E8EE",

        elevation: 1,

        marginBottom:
          Metrics.x5,
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

        backgroundColor:
          "#F3F4F6",

        alignItems:
          "center",

        justifyContent:
          "center",

        marginRight:
          Metrics.x2,
      },

      backIcon: {
        fontSize: 29,

        lineHeight: 30,

        color:
          Colors.subtext,
      },

      brand: {
        flexDirection:
          "row",

        alignItems:
          "center",

        flex: 1,

        minWidth: 0,
      },

      brandIcon: {
        backgroundColor:
          Colors.brandPrimary,

        marginRight:
          Metrics.x2,
      },

      brandText: {
        flex: 1,

        minWidth: 0,
      },

      schoolName: {
        fontSize: 15,

        fontWeight: "800",

        color:
          "#171717",
      },

      schoolSubtitle: {
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


      /* ======================================================================
         PROFILE
      ====================================================================== */

      profileButton: {
        flexDirection:
          "row",

        alignItems:
          "center",

        padding:
          Metrics.x1,

        borderRadius: 24,
      },

      profileButtonActive: {
        backgroundColor:
          "#F3F4F6",
      },

      profileAvatar: {
        backgroundColor:
          Colors.brandPrimary,
      },

      profileButtonInfo: {
        marginLeft:
          Metrics.x2,

        maxWidth: 130,
      },

      profileButtonName: {
        fontSize: 13,

        fontWeight: "700",

        color:
          "#171717",
      },

      profileButtonRole: {
        fontSize: 11,

        color:
          Colors.subtext,

        marginTop: 1,
      },

      profileArrow: {
        fontSize: 16,

        color:
          Colors.subtext,

        marginLeft:
          Metrics.x1,
      },

      profileOverlay: {
        position: "absolute",

        top: 0,

        left: 0,

        right: 0,

        bottom: 0,

        backgroundColor:
          "transparent",
      },

      profileMenu: {
        position: "absolute",

        top: 78,

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

        elevation: 10,

        zIndex: 100,
      },

      profileMenuHeader: {
        flexDirection:
          "row",

        alignItems:
          "center",

        padding:
          Metrics.x2,
      },

      profileMenuInfo: {
        flex: 1,

        marginLeft:
          Metrics.x2,

        minWidth: 0,
      },

      profileMenuName: {
        fontSize: 15,

        fontWeight: "800",

        color:
          "#171717",
      },

      profileMenuEmail: {
        fontSize: 11,

        color:
          Colors.subtext,

        marginTop: 2,
      },

      profileMenuRole: {
        fontSize: 11,

        fontWeight: "700",

        color:
          Colors.brandPrimary,

        marginTop: 3,
      },

      profileDivider: {
        marginVertical:
          Metrics.x1,
      },

      profileMenuItem: {
        flexDirection:
          "row",

        alignItems:
          "center",

        padding:
          Metrics.x2,

        borderRadius: 12,
      },

      profileMenuIcon: {
        fontSize: 19,

        width: 40,

        height: 40,

        textAlign:
          "center",

        textAlignVertical:
          "center",

        backgroundColor:
          "#F3F4F6",

        borderRadius: 12,

        overflow: "hidden",
      },

      profileMenuItemText: {
        flex: 1,

        marginLeft:
          Metrics.x2,
      },

      profileMenuItemTitle: {
        fontSize: 14,

        fontWeight: "700",

        color:
          "#171717",
      },

      profileMenuItemSubtitle: {
        fontSize: 11,

        color:
          Colors.subtext,

        marginTop: 2,
      },

      logoutItem: {
        backgroundColor:
          "#FFF5F5",

        marginTop:
          Metrics.x1,
      },

      logoutIcon: {
        color:
          Colors.error,

        backgroundColor:
          "#FDECEC",
      },

      logoutText: {
        color:
          Colors.error,
      },


      /* ======================================================================
         HEADER
      ====================================================================== */

      pageHeader: {
        marginBottom:
          Metrics.x5,
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

      title: {
        fontSize: 30,

        fontWeight: "800",

        color:
          "#171717",
      },

      subtitle: {
        fontSize: 14,

        lineHeight: 21,

        color:
          Colors.subtext,

        marginTop:
          Metrics.x1,

        maxWidth: 700,
      },


      /* ======================================================================
         STUDENT SUMMARY
      ====================================================================== */

      studentCard: {
        backgroundColor:
          "#FFFFFF",

        borderRadius: 20,

        borderWidth: 1,

        borderColor:
          "#E7E8EE",

        elevation: 1,

        marginBottom:
          Metrics.x5,
      },

      studentCardRow: {
        flexDirection:
          "row",

        alignItems:
          "center",
      },

      studentAvatar: {
        backgroundColor:
          "#EEF2FF",

        marginRight:
          Metrics.x4,
      },

      studentSummary: {
        flex: 1,

        minWidth: 0,
      },

      studentEyebrow: {
        fontSize: 10,

        fontWeight: "800",

        letterSpacing: 1,

        color:
          Colors.brandPrimary,
      },

      studentName: {
        fontSize: 23,

        fontWeight: "800",

        color:
          "#171717",

        marginTop: 2,
      },

      studentAdmission: {
        fontSize: 13,

        color:
          Colors.subtext,

        marginTop:
          Metrics.x1,
      },

      studentBadges: {
        flexDirection:
          "row",

        alignItems:
          "center",

        flexWrap:
          "wrap",

        marginTop:
          Metrics.x2,
      },

      badge: {
        backgroundColor:
          "#F3F4F6",

        paddingHorizontal:
          Metrics.x2,

        paddingVertical:
          Metrics.x1,

        borderRadius: 9,

        marginRight:
          Metrics.x2,

        marginBottom:
          Metrics.x1,
      },

      badgeText: {
        fontSize: 11,

        fontWeight: "700",

        color:
          "#374151",
      },


      /* ======================================================================
         SECTIONS
      ====================================================================== */

      section: {
        marginBottom:
          Metrics.x5,
      },

      sectionTitle: {
        fontSize: 19,

        fontWeight: "800",

        color:
          "#171717",

        marginBottom:
          Metrics.x3,
      },

      card: {
        backgroundColor:
          "#FFFFFF",

        borderRadius: 18,

        borderWidth: 1,

        borderColor:
          "#E7E8EE",

        elevation: 1,
      },


      /* ======================================================================
         FORM
      ====================================================================== */

      fieldLabel: {
        fontSize: 13,

        fontWeight: "700",

        color:
          "#374151",

        marginBottom:
          Metrics.x2,
      },

      fieldLabelSpacing: {
        fontSize: 13,

        fontWeight: "700",

        color:
          "#374151",

        marginTop:
          Metrics.x4,

        marginBottom:
          Metrics.x2,
      },

      optionsWrap: {
        flexDirection:
          "row",

        flexWrap:
          "wrap",
      },

      option: {
        minHeight: 42,

        paddingHorizontal:
          Metrics.x3,

        paddingVertical:
          Metrics.x2,

        borderRadius: 12,

        borderWidth: 1,

        borderColor:
          "#D9DCE4",

        backgroundColor:
          "#FFFFFF",

        flexDirection:
          "row",

        alignItems:
          "center",

        justifyContent:
          "center",

        marginRight:
          Metrics.x2,

        marginBottom:
          Metrics.x2,
      },

      optionSelected: {
        backgroundColor:
          Colors.brandPrimary,

        borderColor:
          Colors.brandPrimary,
      },

      optionCheck: {
        fontSize: 13,

        fontWeight: "800",

        color:
          "#FFFFFF",

        marginRight:
          Metrics.x1,
      },

      optionText: {
        fontSize: 13,

        fontWeight: "600",

        color:
          "#374151",
      },

      optionTextSelected: {
        color:
          "#FFFFFF",

        fontWeight:
          "800",
      },

      formGrid: {
        flexDirection:
          "row",

        flexWrap:
          "wrap",

        marginHorizontal:
          -Metrics.x2,
      },

      singleColumn: {
        flexDirection:
          "column",
      },

      formField: {
        width: "50%",

        paddingHorizontal:
          Metrics.x2,

        marginBottom:
          Metrics.x2,
      },

      input: {
        backgroundColor:
          "#FFFFFF",
      },

      error: {
        color:
          Colors.error,

        fontSize: 12,

        marginTop: 2,

        marginBottom:
          Metrics.x1,
      },

      helperText: {
        fontSize: 13,

        color:
          Colors.subtext,

        marginBottom:
          Metrics.x2,
      },

      loadingRow: {
        flexDirection:
          "row",

        alignItems:
          "center",

        paddingVertical:
          Metrics.x2,
      },

      retryButton: {
        alignSelf:
          "flex-start",

        borderRadius: 10,
      },


      /* ======================================================================
         COUPON
      ====================================================================== */

      couponCard: {
        backgroundColor:
          "#FFFFFF",

        borderRadius: 18,

        borderWidth: 1,

        borderColor:
          "#E7E8EE",

        elevation: 1,
      },

      couponRow: {
        flexDirection:
          "row",

        alignItems:
          "center",
      },

      couponIcon: {
        width: 46,

        height: 46,

        borderRadius: 13,

        backgroundColor:
          "#EFFAF5",

        alignItems:
          "center",

        justifyContent:
          "center",

        marginRight:
          Metrics.x3,
      },

      couponIconText: {
        fontSize: 20,

        fontWeight: "800",

        color:
          "#16834B",
      },

      couponText: {
        flex: 1,
      },

      couponTitle: {
        fontSize: 15,

        fontWeight: "800",

        color:
          "#171717",
      },

      couponDescription: {
        fontSize: 12,

        lineHeight: 18,

        color:
          Colors.subtext,

        marginTop:
          Metrics.x1,
      },


      /* ======================================================================
         UPDATE
      ====================================================================== */

      updateCard: {
        backgroundColor:
          "#FFFFFF",

        borderRadius: 18,

        borderWidth: 1,

        borderColor:
          "#E7E8EE",

        elevation: 1,
      },

      updateRow: {
        flexDirection:
          "row",

        alignItems:
          "center",

        justifyContent:
          "space-between",
      },

      updateMobile: {
        flexDirection:
          "column",

        alignItems:
          "stretch",
      },

      updateText: {
        flex: 1,

        marginRight:
          Metrics.x4,
      },

      updateTitle: {
        fontSize: 16,

        fontWeight: "800",

        color:
          "#171717",
      },

      updateSubtitle: {
        fontSize: 12,

        lineHeight: 18,

        color:
          Colors.subtext,

        marginTop:
          Metrics.x1,
      },

      submitButton: {
        borderRadius: 12,

        marginTop: 0,
      },

      submitContent: {
        minHeight: 48,

        paddingHorizontal:
          Metrics.x3,
      },

      bottomSpace: {
        height:
          Metrics.x5,
      },
    };
  }
);

export {
  EditStudentScreen,
};