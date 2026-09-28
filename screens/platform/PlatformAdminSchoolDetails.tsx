import React, {
  useRef,
  useState,
} from "react";

import { platformSchoolStyles as styles} from "../../styles";

import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";

import {
  Avatar,
  Button,
  Card,
  Divider,
  IconButton,
  Snackbar,
} from "react-native-paper";

import {
  useQuery,
  useQueryClient,
} from "react-query";

import {
  RouteProp,
  useNavigation,
  useRoute,
} from "@react-navigation/native";

import type {
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";

import {
  RootStackParamList,
  RootStackScreenNames,
} from "../../types";

import {
  platformAdminServices,
} from "../../services/platformAdminServices";

import {
  Colors,
  Metrics,
} from "../../theme";


/* ============================================================
   TYPES
============================================================ */

type RouteProps = RouteProp<
  RootStackParamList,
  RootStackScreenNames.PlatformAdminSchoolDetails
>;


type NavigationProp =
  NativeStackNavigationProp<
    RootStackParamList
  >;


type Principal = {
  id: string;

  name: string;

  email: string;

  phone?: string | null;

  designation?: string | null;

  isActive: boolean;

  lastLogin?: string | null;
};


type SchoolCounts = {
  students: number;

  staff: number;

  admins: number;

  teachers: number;

  parents: number;
};


type School = {
  id: string;

  code: string;

  name: string;

  address?: string | null;

  contactEmail?: string | null;

  contactPhone?: string | null;

  board?: string | null;

  status: string;

  subscriptionPlan: string;

  subscriptionStartDate?: string | null;

  subscriptionExpiryDate?: string | null;

  createdAt: string;

  principal?: Principal | null;

  counts: SchoolCounts;
};


type AcademicYear = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
};

type SchoolResponse = {
  school: School & {
    academicYears?: AcademicYear[];
  };
};


/* ============================================================
   COMPONENT
============================================================ */

const PlatformAdminSchoolDetails = () => {

  const route =
    useRoute<RouteProps>();


  const navigation =
    useNavigation<NavigationProp>();


  const queryClient =
    useQueryClient();


  const {
    width,
  } = useWindowDimensions();


  const isMobile =
    width < 600;

  const isSmallMobile =
    width < 380;


  const {
    schoolId,
  } = route.params;


  /* ==========================================================
     STATE
  ========================================================== */

  const [
    updatingStatus,
    setUpdatingStatus,
  ] = useState(false);

  const [
    lifecycleBusy,
    setLifecycleBusy,
  ] = useState(false);

  const [
    deleteModalVisible,
    setDeleteModalVisible,
  ] = useState(false);

  const [
    deleteConfirmation,
    setDeleteConfirmation,
  ] = useState("");

  const [
    deleteExpectedText,
    setDeleteExpectedText,
  ] = useState("");

  const [
    deleteModalTitle,
    setDeleteModalTitle,
  ] = useState("Final Confirmation");

  const [
    deleteModalMessage,
    setDeleteModalMessage,
  ] = useState("");

  const deleteConfirmationRef =
    useRef("");

  const pendingDeleteRef =
    useRef<(() => Promise<void>) | null>(null);


  const [
    snackbarVisible,
    setSnackbarVisible,
  ] = useState(false);


  const [
    snackbarMessage,
    setSnackbarMessage,
  ] = useState("");


  const [
    snackbarType,
    setSnackbarType,
  ] = useState<
    "success" | "error"
  >("success");


  /* ==========================================================
     GET SCHOOL
  ========================================================== */

  const {
    data,

    isLoading,

    isFetching,

    error,

    refetch,

  } = useQuery<SchoolResponse>(
    [
      "platform-school",
      schoolId,
    ],

    () =>
      platformAdminServices.getSchoolById(
        schoolId
      ),

    {
      enabled:
        !!schoolId,
    }
  );


  /* ==========================================================
     MESSAGE
  ========================================================== */

  const showMessage = (
    message: unknown,
    type:
      | "success"
      | "error"
  ) => {
    let safeMessage = "Something went wrong.";

    if (typeof message === "string") {
      safeMessage = message;
    } else if (message && typeof message === "object") {
      const value = message as Record<string, unknown>;

      if (typeof value.message === "string") {
        safeMessage = value.message;
      } else if (typeof value.error === "string") {
        safeMessage = value.error;
      } else if (typeof value.detail === "string") {
        safeMessage = value.detail;
      } else {
        try {
          const serialized = JSON.stringify(message);
          if (serialized && serialized !== "{}") {
            safeMessage = serialized;
          }
        } catch {
          // Keep the fallback message.
        }
      }
    }

    setSnackbarMessage(safeMessage);
    setSnackbarType(type);
    setSnackbarVisible(true);
  };


  /* ==========================================================
     CREATE PRINCIPAL
  ========================================================== */

  const onCreatePrincipal =
    () => {

      if (!school) {
        return;
      }


      navigation.navigate(
        RootStackScreenNames.PlatformAdminCreatePrincipal,

        {
          schoolId:
            school.id,

          schoolName:
            school.name,

          schoolCode:
            school.code,
        }
      );
    };


  /* ==========================================================
     UPDATE STATUS
  ========================================================== */

  const updateStatus =
    async (
      newStatus:
        | "ACTIVE"
        | "SUSPENDED"
    ) => {

      if (
        updatingStatus ||
        !school
      ) {
        return;
      }


      setUpdatingStatus(
        true
      );


      try {

        const response =
          await platformAdminServices.updateSchoolStatus(
            school.id,
            newStatus
          );


        showMessage(

          typeof response?.message === "string"
            ? response.message
            : (
                newStatus === "ACTIVE"
                  ? "School reactivated successfully"
                  : "School suspended successfully"
              ),

          "success"
        );


        await refetch();


        await queryClient.invalidateQueries(
          [
            "platform-admin-dashboard",
          ]
        );


        await queryClient.invalidateQueries(
          [
            "platform-admin-schools",
          ]
        );


        await queryClient.invalidateQueries(
          [
            "platform-schools",
          ]
        );

      } catch (
        error: any
      ) {

        console.log(
          "UPDATE SCHOOL STATUS ERROR:",

          error?.response?.data ??
            error
        );


        showMessage(

          getErrorMessage(
              error,
              "Unable to update school status"
            ),

          "error"
        );

      } finally {

        setUpdatingStatus(
          false
        );
      }
    };


  /* ==========================================================
     SUSPEND CONFIRMATION
  ========================================================== */

  const confirmSuspend =
    () => {

      if (!school) {
        return;
      }


      Alert.alert(
        "Suspend School",

        `Are you sure you want to suspend ${school.name}?`,

        [
          {
            text:
              "Cancel",

            style:
              "cancel",
          },

          {
            text:
              "Suspend",

            style:
              "destructive",

            onPress:
              () =>
                updateStatus(
                  "SUSPENDED"
                ),
          },
        ]
      );
    };


  /* ==========================================================
     REACTIVATE CONFIRMATION
  ========================================================== */

  const confirmReactivate =
    () => {

      if (!school) {
        return;
      }


      Alert.alert(
        "Reactivate School",

        `Are you sure you want to reactivate ${school.name}?`,

        [
          {
            text:
              "Cancel",

            style:
              "cancel",
          },

          {
            text:
              "Reactivate",

            onPress:
              () =>
                updateStatus(
                  "ACTIVE"
                ),
          },
        ]
      );
    };


  const exportFullSchool = async () => {
    if (!school || lifecycleBusy) return;
    setLifecycleBusy(true);
    try {
      const result = await platformAdminServices.exportCompleteSchool(school.id);
      showMessage("Complete school backup created successfully", "success");
      if (result?.downloadUrl) {
        await Linking.openURL(result.downloadUrl);
      }
    } catch (error: any) {
      showMessage(getErrorMessage(
        error,
        "Unable to create school backup"
      ), "error");
    } finally {
      setLifecycleBusy(false);
    }
  };

  const exportYear = async (year: AcademicYear) => {
    if (!school || lifecycleBusy) return;
    setLifecycleBusy(true);
    try {
      const result = await platformAdminServices.exportAcademicYear(school.id, year.id);
      showMessage(`${year.name} backup created successfully`, "success");
      if (result?.downloadUrl) {
        await Linking.openURL(result.downloadUrl);
      }
    } catch (error: any) {
      showMessage(getErrorMessage(
        error,
        "Unable to export academic year"
      ), "error");
    } finally {
      setLifecycleBusy(false);
    }
  };

  const openDeleteConfirmation = (
    expectedText: string,
    title: string,
    message: string,
    action: () => Promise<void>
  ) => {
    deleteConfirmationRef.current = "";
    pendingDeleteRef.current = action;

    setDeleteConfirmation("");
    setDeleteExpectedText(expectedText);
    setDeleteModalTitle(title);
    setDeleteModalMessage(message);
    setDeleteModalVisible(true);
  };


  const closeDeleteConfirmation = () => {
    if (lifecycleBusy) {
      return;
    }

    deleteConfirmationRef.current = "";
    pendingDeleteRef.current = null;
    setDeleteConfirmation("");
    setDeleteModalVisible(false);
  };


  const submitDeleteConfirmation = async () => {
    if (lifecycleBusy) {
      return;
    }

    const confirmation =
      deleteConfirmationRef.current.trim();

    if (confirmation !== deleteExpectedText) {
      showMessage(
        `Please type exactly: ${deleteExpectedText}`,
        "error"
      );
      return;
    }

    const action = pendingDeleteRef.current;

    if (!action) {
      showMessage(
        "Delete action is no longer available. Please try again.",
        "error"
      );
      return;
    }

    try {
      await action();
    } catch (error: any) {
      showMessage(
        getErrorMessage(
          error,
          "Unable to complete delete operation"
        ),
        "error"
      );
    }
  };


  const confirmDeleteYear = async (year: AcademicYear) => {
    if (!school || lifecycleBusy) return;

    setLifecycleBusy(true);

    try {
      const preview =
        await platformAdminServices.getAcademicYearDeletionPreview(
          school.id,
          year.id
        );

      if (preview?.blockers?.length) {
        Alert.alert(
          "Cannot Delete Academic Year",
          preview.blockers.join("\n\n")
        );
        return;
      }

      Alert.alert(
        `Delete ${year.name}?`,
        `This will permanently delete the academic-year records listed in the preview.\n\nClasses: ${preview.counts.classes}\nSections: ${preview.counts.sections}\nEnrollments: ${preview.counts.enrollments}\nAttendance: ${preview.counts.attendance}\nExams: ${preview.counts.exams}\nID Cards: ${preview.counts.idCards}`,
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => {
              const expectedText =
                `DELETE ACADEMIC YEAR ${year.name}`;

              openDeleteConfirmation(
                expectedText,
                "Final Confirmation",
                `Type the following exactly to permanently delete ${year.name}:\n\n${expectedText}`,
                async () => {
                  if (!school) {
                    return;
                  }

                  setLifecycleBusy(true);

                  try {
                    await platformAdminServices.deleteAcademicYear(
                      school.id,
                      year.id,
                      deleteConfirmationRef.current.trim()
                    );

                    showMessage(
                      `${year.name} deleted successfully`,
                      "success"
                    );

                    deleteConfirmationRef.current = "";
                    pendingDeleteRef.current = null;
                    setDeleteConfirmation("");
                    setDeleteModalVisible(false);

                    await refetch();
                  } catch (error: any) {
                    showMessage(
                      getErrorMessage(
                        error,
                        "Unable to delete academic year"
                      ),
                      "error"
                    );
                  } finally {
                    setLifecycleBusy(false);
                  }
                }
              );
            },
          },
        ]
      );
    } catch (error: any) {
      showMessage(
        getErrorMessage(
          error,
          "Unable to check academic year deletion"
        ),
        "error"
      );
    } finally {
      setLifecycleBusy(false);
    }
  };


  const confirmArchive = () => {
    if (!school || lifecycleBusy) return;
    Alert.alert(
      "Archive School",
      `Archive ${school.name}? The data will remain intact and the school can be restored later.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Archive",
          style: "destructive",
          onPress: async () => {
            setLifecycleBusy(true);
            try {
              await platformAdminServices.archiveSchool(school.id);
              showMessage("School archived successfully", "success");
              await refetch();
              await queryClient.invalidateQueries(["platform-admin-schools"]);
              await queryClient.invalidateQueries(["platform-admin-dashboard"]);
            } catch (error: any) {
              showMessage(getErrorMessage(
        error,
        "Unable to archive school"
      ), "error");
            } finally {
              setLifecycleBusy(false);
            }
          },
        },
      ]
    );
  };

  const confirmRestore = async () => {
    if (!school || lifecycleBusy) return;
    setLifecycleBusy(true);
    try {
      await platformAdminServices.restoreSchool(school.id);
      showMessage("School restored to suspended status", "success");
      await refetch();
    } catch (error: any) {
      showMessage(getErrorMessage(
        error,
        "Unable to restore school"
      ), "error");
    } finally {
      setLifecycleBusy(false);
    }
  };

  const confirmPermanentDelete = () => {
    if (!school || lifecycleBusy) return;

    if (
      school.status !== "SUSPENDED" &&
      school.status !== "ARCHIVED"
    ) {
      showMessage(
        "School must be suspended or archived before permanent deletion",
        "error"
      );
      return;
    }

    const expectedText =
      `DELETE SCHOOL ${school.code}`;

    Alert.alert(
      "PERMANENT DELETE",
      `A complete backup will be created first.\n\nThis action cannot be undone.\n\nYou will need to type exactly:\n\n${expectedText}`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Continue",
          style: "destructive",
          onPress: () => {
            openDeleteConfirmation(
              expectedText,
              "Final Confirmation",
              `Type the following exactly to permanently delete ${school.name}:\n\n${expectedText}`,
              async () => {
                if (!school) {
                  return;
                }

                setLifecycleBusy(true);

                try {
                  const result =
                    await platformAdminServices.deleteSchool(
                      school.id,
                      deleteConfirmationRef.current.trim()
                    );

                  showMessage(
                    "School permanently deleted. Backup was created first.",
                    "success"
                  );

                  if (result?.backup?.operationId) {
                    console.log(
                      "School backup operation:",
                      result.backup.operationId
                    );
                  }

                  deleteConfirmationRef.current = "";
                  pendingDeleteRef.current = null;
                  setDeleteConfirmation("");
                  setDeleteModalVisible(false);

                  await queryClient.invalidateQueries([
                    "platform-admin-schools",
                  ]);

                  await queryClient.invalidateQueries([
                    "platform-admin-dashboard",
                  ]);

                  navigation.goBack();
                } catch (error: any) {
                  showMessage(
                    getErrorMessage(
                      error,
                      "Unable to delete school"
                    ),
                    "error"
                  );
                } finally {
                  setLifecycleBusy(false);
                }
              }
            );
          },
        },
      ]
    );
  };


  /* ==========================================================
     LOADING
  ========================================================== */

  if (
    isLoading ||
    isFetching
  ) {

    return (

      <View
        style={
          styles.loader
        }
      >

        <View
          style={
            styles.loaderIcon
          }
        >

          <ActivityIndicator
            size="large"

            color={
              Colors.brandPrimary
            }
          />

        </View>


        <Text
          style={
            styles.loadingTitle
          }
        >
          Loading school
        </Text>


        <Text
          style={
            styles.loadingText
          }
        >
          Fetching the latest school information...
        </Text>

      </View>
    );
  }


  /* ==========================================================
     ERROR
  ========================================================== */

  if (
    error ||
    !data?.school
  ) {

    return (

      <View
        style={
          styles.loader
        }
      >

        <View
          style={
            styles.errorIcon
          }
        >

          <Text
            style={
              styles.errorIconText
            }
          >
            !
          </Text>

        </View>


        <Text
          style={
            styles.errorTitle
          }
        >
          Unable to load school
        </Text>


        <Text
          style={
            styles.errorText
          }
        >
          We couldn't retrieve this school's
          information right now.
        </Text>


        <Button
          mode="contained"

          icon="refresh"

          onPress={
            () =>
              refetch()
          }

          style={
            styles.retryButton
          }
        >
          Try Again
        </Button>

      </View>
    );
  }


  /* ==========================================================
     SCHOOL
  ========================================================== */

  const school =
    data.school;


  const principal =
    school.principal;


  const counts =
    school.counts;

  const academicYears = school.academicYears ?? [];


  const isActive =
    school.status ===
    "ACTIVE";


  const isSuspended =
    school.status ===
    "SUSPENDED";


  const statusLabel =
    formatStatus(
      school.status
    );


  /* ==========================================================
     UI
  ========================================================== */

  return (

    <View
      style={
        styles.screen
      }
    >

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }

        contentContainerStyle={[
          styles.container,
          isMobile && styles.containerMobile,]
        }
      >

        {/* ====================================================
            PAGE HEADER
        ==================================================== */}

        <View
          style={
            styles.pageHeader
          }
        >

          <View
            style={
              styles.headerLeft
            }
          >

            <IconButton
              icon="arrow-left"

              size={22}

              iconColor="#171717"

              onPress={() =>
                navigation.goBack()
              }

              style={
                styles.backButton
              }
            />


            <View
              style={
                styles.breadcrumbContainer
              }
            >

              <Text
                style={
                  styles.breadcrumb
                }
              >
                Schools
              </Text>


              <Text
                style={
                  styles.breadcrumbSeparator
                }
              >
                /
              </Text>


              <Text
                style={
                  styles.breadcrumbCurrent
                }
                numberOfLines={1}
              >
                {school.name}
              </Text>

            </View>

          </View>


          <IconButton
            icon="refresh"

            size={21}

            iconColor={
              Colors.brandPrimary
            }

            disabled={
              isFetching ||
              updatingStatus
            }

            onPress={() =>
              refetch()
            }

            style={
              styles.headerRefresh
            }
          />

        </View>


        {/* ====================================================
            SCHOOL HERO
        ==================================================== */}

        <Card
          style={[
            styles.heroCard,
            isMobile && styles.heroCardMobile,
          ]}
        >

          <Card.Content
            style={[
              styles.heroContent,
              isMobile && styles.heroContentMobile,
            ]}
          >

            <View
              style={[
                styles.heroTop,
                isMobile && styles.heroTopMobile,
              ]}
            >

              <View
                style={[
                  styles.schoolIdentity,
                  isMobile && styles.schoolIdentityMobile,
                ]}
              >

                <View
                  style={[
                    styles.schoolAvatar,
                    isMobile && styles.schoolAvatarMobile,
                  ]}
                >

                  <Avatar.Icon
                    size={
                      isSmallMobile
                        ? 44
                        : isMobile
                          ? 50
                          : 64
                    }

                    icon="school"

                    color="#FFFFFF"

                    style={
                      styles.schoolAvatarIcon
                    }
                  />

                </View>


                <View
                  style={
                    styles.schoolIdentityText
                  }
                >

                  <Text
                    style={[
                      styles.schoolTitle,
                      isMobile && styles.schoolTitleMobile,
                    ]}

                    numberOfLines={2}
                  >
                    {
                      school.name
                    }
                  </Text>


                  <Text
                    style={
                      styles.schoolCode
                    }
                  >
                    {school.code}
                  </Text>


                  <View
                    style={[
                      styles.heroMeta,
                      isMobile && styles.heroMetaMobile,
                    ]}
                  >

                    <StatusBadge
                      status={
                        school.status
                      }
                    />


                    <View
                      style={
                        styles.planBadge
                      }
                    >

                      <Text
                        style={
                          styles.planBadgeText
                        }
                      >
                        {school.subscriptionPlan}
                      </Text>

                    </View>

                  </View>

                </View>

              </View>


              {/* =================================================
                  DESKTOP ACTION
              ================================================= */}

              {!isMobile && (

                <View
                  style={
                    styles.heroAction
                  }
                >

                  {
                    isActive && (

                      <Button
                        mode="outlined"

                        icon="pause-circle-outline"

                        textColor={
                          Colors.error
                        }

                        disabled={
                          updatingStatus
                        }

                        loading={
                          updatingStatus
                        }

                        onPress={
                          confirmSuspend
                        }

                        style={
                          styles.suspendButton
                        }
                      >
                        Suspend School
                      </Button>

                    )
                  }


                  {
                    isSuspended && (

                      <Button
                        mode="contained"

                        icon="play-circle-outline"

                        disabled={
                          updatingStatus
                        }

                        loading={
                          updatingStatus
                        }

                        onPress={
                          confirmReactivate
                        }

                        style={
                          styles.reactivateButton
                        }
                      >
                        Reactivate School
                      </Button>

                    )
                  }

                </View>

              )}

            </View>


            {/* =================================================
                MOBILE ACTION
            ================================================= */}

            {isMobile && (

              <View
                style={
                  styles.mobileHeroAction
                }
              >

                {
                  isActive && (

                    <Button
                      mode="outlined"

                      icon="pause-circle-outline"

                      textColor={
                        Colors.error
                      }

                      disabled={
                        updatingStatus
                      }

                      loading={
                        updatingStatus
                      }

                      onPress={
                        confirmSuspend
                      }

                      style={
                        styles.fullWidthAction
                      }
                    >
                      Suspend School
                    </Button>

                  )
                }


                {
                  isSuspended && (

                    <Button
                      mode="contained"

                      icon="play-circle-outline"

                      disabled={
                        updatingStatus
                      }

                      loading={
                        updatingStatus
                      }

                      onPress={
                        confirmReactivate
                      }

                      style={
                        styles.fullWidthAction
                      }
                    >
                      Reactivate School
                    </Button>

                  )
                }

              </View>

            )}

          </Card.Content>

        </Card>


        {/* ====================================================
            QUICK STATS
        ==================================================== */}

        <View
          style={
            styles.statsHeader
          }
        >

          <View>

            <Text
              style={
                styles.sectionTitle
              }
            >
              School Overview
            </Text>


            <Text
              style={
                styles.sectionSubtitle
              }
            >
              Current school population
            </Text>

          </View>

        </View>


        <View
          style={[
            styles.statsGrid,
            isMobile && styles.statsGridMobile,
          ]}
        >

          <StatCard
            icon="school-outline"
            label="Students"
            value={
              counts.students
            }
            compact={isMobile}
          />


          <StatCard
            icon="account-group"
            label="Staff"
            value={
              counts.staff
            }
            compact={isMobile}
          />


          <StatCard
            icon="account-cog"
            label="Admins"
            value={
              counts.admins
            }
            compact={isMobile}
          />


          <StatCard
            icon="account-tie"
            label="Teachers"
            value={
              counts.teachers
            }
            compact={isMobile}
          />


          <StatCard
            icon="account-heart"
            label="Parents"
            value={
              counts.parents
            }
            compact={isMobile}
          />

        </View>


        {/* ====================================================
            MAIN CONTENT
        ==================================================== */}

        <View
          style={[
            styles.contentGrid,

            isMobile &&
              styles.contentGridMobile,
          ]}
        >

          {/* ==================================================
              LEFT COLUMN
          ================================================== */}

          <View
            style={[
              styles.primaryColumn,
              isMobile && styles.primaryColumnMobile,
            ]}
          >

            {/* =================================================
                SCHOOL INFORMATION
            ================================================= */}

            <SectionCard
              title="School Information"
              subtitle="Basic details and contact information"
              icon="school-outline"
            >

              <InfoRow
                icon="school-outline"
                label="School Name"
                value={
                  school.name
                }
              />


              <InfoRow
                icon="identifier"
                label="School Code"
                value={
                  school.code
                }
              />


              <InfoRow
                icon="map-marker-outline"
                label="Address"
                value={
                  school.address ??
                  "Not provided"
                }
              />


              <InfoRow
                icon="email-outline"
                label="Contact Email"
                value={
                  school.contactEmail ??
                  "Not provided"
                }
              />


              <InfoRow
                icon="phone-outline"
                label="Contact Phone"
                value={
                  school.contactPhone ??
                  "Not provided"
                }
              />


              <InfoRow
                icon="certificate-outline"
                label="Board"
                value={
                  school.board ??
                  "Not specified"
                }
              />

            </SectionCard>


            {/* =================================================
                PRINCIPAL
            ================================================= */}

            <SectionCard
              title="Principal"
              subtitle="School administrator account"
              icon="account-tie-outline"
            >

              {principal ? (

                <>

                  <View
                    style={
                      styles.principalProfile
                    }
                  >

                    <Avatar.Text
                      size={56}

                      label={
                        getInitials(
                          principal.name
                        )
                      }

                      color="#FFFFFF"

                      style={
                        styles.principalAvatar
                      }
                    />


                    <View
                      style={
                        styles.principalProfileInfo
                      }
                    >

                      <Text
                        style={
                          styles.principalName
                        }
                      >
                        {
                          principal.name
                        }
                      </Text>


                      <Text
                        style={
                          styles.principalDesignation
                        }
                      >
                        {
                          principal.designation ??
                          "Principal"
                        }
                      </Text>


                      <View
                        style={
                          styles.activeIndicatorRow
                        }
                      >

                        <View
                          style={[
                            styles.activeDot,

                            {
                              backgroundColor:
                                principal.isActive
                                  ? "#2E7D32"
                                  : "#9E9E9E",
                            },
                          ]}
                        />


                        <Text
                          style={
                            styles.activeIndicatorText
                          }
                        >
                          {
                            principal.isActive
                              ? "Active account"
                              : "Inactive account"
                          }
                        </Text>

                      </View>

                    </View>

                  </View>


                  <Divider
                    style={
                      styles.innerDivider
                    }
                  />


                  <InfoRow
                    icon="email-outline"
                    label="Email"
                    value={
                      principal.email
                    }
                  />


                  <InfoRow
                    icon="phone-outline"
                    label="Phone"
                    value={
                      principal.phone ??
                      "Not provided"
                    }
                  />


                  <InfoRow
                    icon="login"
                    label="Last Login"
                    value={
                      formatDate(
                        principal.lastLogin
                      )
                    }
                  />

                </>

              ) : (

                <EmptyPrincipal
                  onCreate={
                    onCreatePrincipal
                  }
                />

              )}

            </SectionCard>

          </View>


          {/* ==================================================
              RIGHT COLUMN
          ================================================== */}

          <View
            style={[
              styles.secondaryColumn,
              isMobile && styles.secondaryColumnMobile,
            ]}
          >

            {/* =================================================
                ACTIONS
            ================================================= */}

            <SectionCard
              title="Quick Actions"
              subtitle="Manage this school"
              icon="flash-outline"
            >

              {!principal && (

                <Button
                  mode="contained"

                  icon="account-plus"

                  onPress={
                    onCreatePrincipal
                  }

                  style={
                    styles.createPrincipalAction
                  }

                  contentStyle={
                    styles.actionContent
                  }
                >
                  Create Principal
                </Button>

              )}


              {principal && (

                <View
                  style={
                    styles.actionInfo
                  }
                >

                  <View
                    style={
                      styles.actionInfoIcon
                    }
                  >

                    <Text
                      style={
                        styles.actionInfoIconText
                      }
                    >
                      ✓
                    </Text>

                  </View>


                  <View
                    style={
                      styles.actionInfoText
                    }
                  >

                    <Text
                      style={
                        styles.actionInfoTitle
                      }
                    >
                      Principal assigned
                    </Text>


                    <Text
                      style={
                        styles.actionInfoSubtitle
                      }
                    >
                      {
                        principal.name
                      }
                    </Text>

                  </View>

                </View>

              )}


              <Divider
                style={
                  styles.actionDivider
                }
              />


              <View
                style={
                  styles.statusActionInfo
                }
              >

                <View>

                  <Text
                    style={
                      styles.actionLabel
                    }
                  >
                    Current Status
                  </Text>


                  <Text
                    style={
                      styles.actionStatusValue
                    }
                  >
                    {
                      statusLabel
                    }
                  </Text>

                </View>


                <StatusBadge
                  status={
                    school.status
                  }
                />

              </View>

            </SectionCard>


            <SectionCard
              title="Data Management"
              subtitle="Backups, academic years and school lifecycle"
              icon="database-outline"
            >
              <Button
                mode="contained"
                icon="download"
                disabled={lifecycleBusy}
                loading={lifecycleBusy}
                onPress={exportFullSchool}
                style={styles.createPrincipalAction}
              >
                Download Complete Backup
              </Button>

              <Divider style={styles.actionDivider} />

              <Text style={styles.actionLabel}>Academic Years</Text>
              {academicYears.length === 0 ? (
                <Text style={styles.actionInfoSubtitle}>No academic years found.</Text>
              ) : (
                academicYears.map((year) => (
                  <View key={year.id} style={{ paddingVertical: 10 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.actionStatusValue}>{year.name}</Text>
                        <Text style={styles.actionInfoSubtitle}>{year.isCurrent ? "Current year — deletion disabled" : "Historical year"}</Text>
                      </View>
                      <Button mode="outlined" compact disabled={lifecycleBusy} onPress={() => exportYear(year)}>Export</Button>
                      {!year.isCurrent && (
                        <Button mode="text" compact textColor={Colors.error} disabled={lifecycleBusy} onPress={() => confirmDeleteYear(year)}>Delete</Button>
                      )}
                    </View>
                  </View>
                ))
              )}

              <Divider style={styles.actionDivider} />

              {school.status === "SUSPENDED" && (
                <Button mode="outlined" icon="archive" disabled={lifecycleBusy} onPress={confirmArchive} textColor={Colors.error}>
                  Archive School
                </Button>
              )}

              {school.status === "ARCHIVED" && (
                <Button mode="contained" icon="backup-restore" disabled={lifecycleBusy} onPress={confirmRestore}>
                  Restore School
                </Button>
              )}

              {(school.status === "SUSPENDED" || school.status === "ARCHIVED") && (
                <Button mode="text" icon="delete-forever" disabled={lifecycleBusy} onPress={confirmPermanentDelete} textColor={Colors.error}>
                  Permanently Delete School
                </Button>
              )}
            </SectionCard>

            {/* =================================================
                SUBSCRIPTION
            ================================================= */}

            <SectionCard
              title="Subscription"
              subtitle="Plan and billing period"
              icon="calendar-clock-outline"
            >

              <View
                style={
                  styles.subscriptionPlan
                }
              >

                <View
                  style={
                    styles.subscriptionIcon
                  }
                >

                  <Avatar.Icon
                    size={44}

                    icon="crown-outline"

                    color={
                      Colors.brandPrimary
                    }

                    style={
                      styles.subscriptionAvatar
                    }
                  />

                </View>


                <View
                  style={
                    styles.subscriptionInfo
                  }
                >

                  <Text
                    style={
                      styles.subscriptionPlanLabel
                    }
                  >
                    Current Plan
                  </Text>


                  <Text
                    style={
                      styles.subscriptionPlanName
                    }
                  >
                    {
                      school.subscriptionPlan
                    }
                  </Text>

                </View>

              </View>


              <Divider
                style={
                  styles.innerDivider
                }
              />


              <InfoRow
                icon="calendar-start"
                label="Start Date"
                value={
                  formatDate(
                    school.subscriptionStartDate
                  )
                }
              />


              <InfoRow
                icon="calendar-end"
                label="Expiry Date"
                value={
                  formatDate(
                    school.subscriptionExpiryDate
                  )
                }
              />

            </SectionCard>


            {/* =================================================
                RECORD
            ================================================= */}

            <SectionCard
              title="School Record"
              subtitle="System information"
              icon="file-document-outline"
            >

              <InfoRow
                icon="identifier"
                label="School ID"
                value={
                  school.id
                }
              />


              <InfoRow
                icon="calendar-plus"
                label="Created"
                value={
                  formatDate(
                    school.createdAt
                  )
                }
              />

            </SectionCard>

          </View>

        </View>

      </ScrollView>


      <Modal
        visible={deleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeDeleteConfirmation}
      >
        <View style={deleteModalStyles.overlay}>
          <View style={deleteModalStyles.container}>
            <Text style={deleteModalStyles.title}>
              {deleteModalTitle}
            </Text>

            <Text style={deleteModalStyles.message}>
              {deleteModalMessage}
            </Text>

            <TextInput
              value={deleteConfirmation}
              onChangeText={(text) => {
                setDeleteConfirmation(text);
                deleteConfirmationRef.current = text;
              }}
              placeholder={deleteExpectedText}
              autoCapitalize="characters"
              autoCorrect={false}
              editable={!lifecycleBusy}
              returnKeyType="done"
              onSubmitEditing={submitDeleteConfirmation}
              style={deleteModalStyles.input}
            />

            <View style={deleteModalStyles.actions}>
              <Button
                mode="text"
                disabled={lifecycleBusy}
                onPress={closeDeleteConfirmation}
              >
                Cancel
              </Button>

              <Button
                mode="contained"
                buttonColor={Colors.error}
                disabled={
                  lifecycleBusy ||
                  deleteConfirmation.trim() !==
                    deleteExpectedText
                }
                loading={lifecycleBusy}
                onPress={submitDeleteConfirmation}
              >
                Delete Permanently
              </Button>
            </View>
          </View>
        </View>
      </Modal>


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

        duration={3500}

        style={
          snackbarType ===
          "success"

            ? styles.successSnackbar

            : styles.errorSnackbar
        }
      >
        {String(snackbarMessage)}
      </Snackbar>

    </View>
  );
};


/* ============================================================
   SECTION CARD
============================================================ */

const SectionCard = ({
  title,
  subtitle,
  icon,
  children,
}: {
  title: string;

  subtitle: string;

  icon: string;

  children: React.ReactNode;
}) => {

  return (

    <Card
      style={
        styles.card
      }
    >

      <Card.Content
        style={styles.cardContent}
      >

        <View
          style={
            styles.cardHeader
          }
        >

          <View
            style={
              styles.cardHeaderIcon
            }
          >

            <Avatar.Icon
              size={36}

              icon={icon}

              style={
                styles.cardHeaderAvatar
              }
            />

          </View>


          <View
            style={
              styles.cardHeaderText
            }
          >

            <Text
              style={
                styles.cardTitle
              }
            >
              {title}
            </Text>


            <Text
              style={
                styles.cardSubtitle
              }
            >
              {subtitle}
            </Text>

          </View>

        </View>


        <Divider
          style={
            styles.cardDivider
          }
        />


        {children}

      </Card.Content>

    </Card>
  );
};


/* ============================================================
   INFO ROW
============================================================ */

const InfoRow = ({
  icon,
  label,
  value,
}: {
  icon: string;

  label: string;

  value: string;
}) => {

  return (

    <View
      style={
        styles.infoRow
      }
    >

      <View
        style={
          styles.infoIcon
        }
      >

        <Avatar.Icon
          size={30}

          icon={icon}

          style={
            styles.infoAvatar
          }
        />

      </View>


      <View
        style={
          styles.infoContent
        }
      >

        <Text
          style={
            styles.infoLabel
          }
        >
          {label}
        </Text>


        <Text
          style={
            styles.infoValue
          }
        >
          {value}
        </Text>

      </View>

    </View>
  );
};


/* ============================================================
   STAT CARD
============================================================ */

const StatCard = ({
  icon,
  label,
  value,
  compact = false,
}: {
  icon: string;

  label: string;

  value: number;

  compact?: boolean;
}) => {

  return (

    <Card
      style={[
        styles.statCard,
        compact && styles.statCardMobile,
      ]}
    >

      <Card.Content
        style={
          compact
            ? styles.statCardContentMobile
            : undefined
        }
      >

        <View
          style={
            styles.statCardTop
          }
        >

          <Avatar.Icon
            size={compact ? 34 : 42}

            icon={icon}

            style={
              styles.statAvatar
            }
          />


          <Text
            style={[
              styles.statValue,
              compact && styles.statValueMobile,
            ]}
          >
            {value}
          </Text>

        </View>


        <Text
          style={[
            styles.statLabel,
            compact && styles.statLabelMobile,
          ]}
        >
          {label}
        </Text>

      </Card.Content>

    </Card>
  );
};


/* ============================================================
   STATUS BADGE
============================================================ */

const StatusBadge = ({
  status,
}: {
  status: string;
}) => {

  return (

    <View
      style={[
        styles.statusBadge,

        getStatusStyle(
          status
        ),
      ]}
    >

      <View
        style={
          styles.statusDot
        }
      />


      <Text
        style={
          styles.statusBadgeText
        }
      >
        {
          formatStatus(
            status
          )
        }
      </Text>

    </View>
  );
};


/* ============================================================
   EMPTY PRINCIPAL
============================================================ */

const EmptyPrincipal = ({
  onCreate,
}: {
  onCreate: () => void;
}) => {

  return (

    <View
      style={
        styles.emptyPrincipal
      }
    >

      <View
        style={
          styles.emptyPrincipalIcon
        }
      >

        <Avatar.Icon
          size={46}

          icon="account-plus-outline"

          style={
            styles.emptyPrincipalAvatar
          }
        />

      </View>


      <Text
        style={
          styles.emptyPrincipalTitle
        }
      >
        No principal assigned
      </Text>


      <Text
        style={
          styles.emptyPrincipalText
        }
      >
        Create a principal account to give
        this school an administrator.
      </Text>


      <Button
        mode="contained"

        icon="account-plus"

        onPress={
          onCreate
        }

        style={
          styles.createPrincipalButton
        }
      >
        Create Principal
      </Button>

    </View>
  );
};


/* ============================================================
   HELPERS
============================================================ */

const getErrorMessage = (
  error: any,
  fallback: string
): string => {
  const message = error?.response?.data?.message;

  if (typeof message === "string") {
    return message;
  }

  if (message && typeof message === "object") {
    const value = message as Record<string, unknown>;

    if (typeof value.message === "string") {
      return value.message;
    }

    if (typeof value.error === "string") {
      return value.error;
    }

    if (typeof value.detail === "string") {
      return value.detail;
    }

    try {
      const serialized = JSON.stringify(message);
      if (serialized && serialized !== "{}") {
        return serialized;
      }
    } catch {
      // Fall through to the fallback.
    }
  }

  if (typeof error?.message === "string") {
    return error.message;
  }

  return fallback;
};


const getInitials = (
  name?: string | null
) => {

  if (!name) {
    return "PA";
  }


  const parts =
    name
      .trim()
      .split(
        /\s+/
      )
      .filter(Boolean);


  if (
    parts.length === 0
  ) {
    return "PA";
  }


  if (
    parts.length === 1
  ) {

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


const formatStatus = (
  status?: string
) => {

  if (!status) {
    return "Unknown";
  }


  return status
    .toLowerCase()
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase()
    );
};


const formatDate = (
  value?: string | null
) => {

  if (!value) {
    return "Not available";
  }


  const date =
    new Date(value);


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Not available";
  }


  return date.toLocaleDateString(
    "en-IN",
    {
      day:
        "2-digit",

      month:
        "short",

      year:
        "numeric",
    }
  );
};


const getStatusStyle = (
  status?: string
) => {

  switch (
    status?.toUpperCase()
  ) {

    case "ACTIVE":
      return styles.activeBadge;


    case "ONBOARDING":
      return styles.onboardingBadge;


    case "SUSPENDED":
      return styles.suspendedBadge;


    case "EXPIRED":
      return styles.expiredBadge;


    default:
      return styles.defaultBadge;
  }
};


/* ============================================================
   DELETE MODAL STYLES
============================================================ */

const deleteModalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  container: {
    width: "100%",
    maxWidth: 520,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    elevation: 8,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#171717",
    marginBottom: 12,
  },

  message: {
    fontSize: 14,
    lineHeight: 21,
    color: "#555555",
    marginBottom: 18,
  },

  input: {
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderRadius: 8,
    minHeight: 48,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: "#171717",
    backgroundColor: "#FFFFFF",
  },

  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 20,
    gap: 8,
  },
});


/* ============================================================
   STYLES
============================================================ */




export {
  PlatformAdminSchoolDetails,
};