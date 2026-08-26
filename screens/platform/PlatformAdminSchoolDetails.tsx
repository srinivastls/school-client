import React, {
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
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


type SchoolResponse = {
  school: School;
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
    message: string,

    type:
      | "success"
      | "error"
  ) => {

    setSnackbarMessage(
      message
    );

    setSnackbarType(
      type
    );

    setSnackbarVisible(
      true
    );
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

          response?.message ??
            (
              newStatus ===
              "ACTIVE"

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

          error?.response?.data?.message ??
            "Unable to update school status",

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
        {
          snackbarMessage
        }
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
   STYLES
============================================================ */

const styles =
  StyleSheet.create({

    /* ========================================================
       SCREEN
    ======================================================== */

    screen: {
      flex: 1,

      backgroundColor:
        "#F6F7FB",
    },


    container: {
      width:
        "100%",

      maxWidth:
        1400,

      alignSelf:
        "center",

      paddingHorizontal:
        Metrics.x4,

      paddingTop:
        Metrics.x2,

      paddingBottom:
        Metrics.x6,
    },


    containerMobile: {
      paddingHorizontal: 12,
      paddingTop: 40,
      paddingBottom: 24,
    },


    /* ========================================================
       LOADING
    ======================================================== */

    loader: {
      flex: 1,

      alignItems:
        "center",

      justifyContent:
        "center",

      padding:
        Metrics.x5,

      backgroundColor:
        "#F6F7FB",
    },


    loaderIcon: {
      width:
        72,

      height:
        72,

      borderRadius:
        36,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        Colors.brandPrimaryBg,

      marginBottom:
        Metrics.x3,
    },


    loadingTitle: {
      fontSize:
        18,

      fontWeight:
        "800",

      color:
        "#171717",
    },


    loadingText: {
      marginTop:
        Metrics.x1,

      color:
        Colors.subtext,

      fontSize:
        13,

      textAlign:
        "center",
    },


    /* ========================================================
       ERROR
    ======================================================== */

    errorIcon: {
      width:
        64,

      height:
        64,

      borderRadius:
        32,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        Colors.errorBg,

      marginBottom:
        Metrics.x3,
    },


    errorIconText: {
      fontSize:
        30,

      fontWeight:
        "800",

      color:
        Colors.error,
    },


    errorTitle: {
      fontSize:
        18,

      fontWeight:
        "800",

      textAlign:
        "center",

      color:
        "#171717",
    },


    errorText: {
      marginTop:
        Metrics.x2,

      color:
        Colors.subtext,

      textAlign:
        "center",

      maxWidth:
        330,

      lineHeight:
        20,
    },


    retryButton: {
      marginTop:
        Metrics.x4,

      borderRadius:
        22,
    },


    /* ========================================================
       PAGE HEADER
    ======================================================== */

    pageHeader: {
      minHeight:
        54,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      marginBottom:
        Metrics.x3,
    },


    headerLeft: {
      flexDirection:
        "row",

      alignItems:
        "center",

      flex: 1,

      minWidth:
        0,
    },


    backButton: {
      margin:
        0,

      marginRight:
        Metrics.x1,
    },


    breadcrumbContainer: {
      flexDirection:
        "row",

      alignItems:
        "center",

      flex: 1,

      minWidth:
        0,
    },


    breadcrumb: {
      fontSize:
        13,

      color:
        Colors.subtext,

      fontWeight:
        "600",
    },


    breadcrumbSeparator: {
      marginHorizontal:
        Metrics.x1,

      color:
        "#B1B1B8",

      fontSize:
        14,
    },


    breadcrumbCurrent: {
      fontSize:
        13,

      fontWeight:
        "700",

      color:
        "#171717",

      flexShrink:
        1,
    },


    headerRefresh: {
      margin:
        0,
    },


    pageHeaderMobile: {
      minHeight: 44,
      marginBottom: 10,
    },


    heroCardMobile: {
      borderRadius: 14,
      marginBottom: 18,
    },

    heroContentMobile: {
      paddingHorizontal: 14,
      paddingVertical: 14,
    },

    heroTopMobile: {
      flexDirection: "column",
      alignItems: "stretch",
    },

    schoolIdentityMobile: {
      alignItems: "flex-start",
    },

    schoolAvatarMobile: {
      width: 50,
      height: 50,
      borderRadius: 14,
      marginRight: 12,
    },

    schoolTitleMobile: {
      fontSize: 20,
      lineHeight: 25,
    },

    heroMetaMobile: {
      marginTop: 8,
      gap: 6,
    },

    /* ========================================================
       HERO
    ======================================================== */

    heroCard: {
      borderRadius:
        18,

      backgroundColor:
        "#FFFFFF",

      marginBottom:
        Metrics.x5,

      elevation:
        2,

      borderWidth:
        1,

      borderColor:
        "#EBEBF0",
    },


    heroContent: {
      padding:
        Metrics.x4,
    },


    heroTop: {
      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",
    },


    schoolIdentity: {
      flexDirection:
        "row",

      alignItems:
        "center",

      flex: 1,

      minWidth:
        0,
    },


    schoolAvatar: {
      width:
        68,

      height:
        68,

      borderRadius:
        18,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        Colors.brandPrimaryBg,

      marginRight:
        Metrics.x3,
    },


    schoolAvatarIcon: {
      backgroundColor:
        Colors.brandPrimary,

      borderRadius:
        16,
    },


    schoolIdentityText: {
      flex: 1,

      minWidth:
        0,
    },


    schoolTitle: {
      fontSize:
        25,

      fontWeight:
        "800",

      color:
        "#171717",

      lineHeight:
        31,
    },


    schoolCode: {
      marginTop:
        4,

      fontSize:
        13,

      fontWeight:
        "700",

      color:
        Colors.subtext,

      letterSpacing:
        0.4,
    },


    heroMeta: {
      flexDirection:
        "row",

      alignItems:
        "center",

      flexWrap:
        "wrap",

      marginTop:
        Metrics.x2,

      gap:
        Metrics.x2,
    },


    heroAction: {
      marginLeft:
        Metrics.x3,
    },


    suspendButton: {
      borderRadius:
        22,

      borderWidth:
        1.2,

      borderColor:
        Colors.error,
    },


    reactivateButton: {
      borderRadius:
        22,
    },


    mobileHeroAction: {
      marginTop: 12,

      paddingTop: 12,

      borderTopWidth:
        1,

      borderTopColor:
        "#EEEEF2",
    },


    fullWidthAction: {
      borderRadius: 12,
      minHeight: 46,
    },


    /* ========================================================
       STATUS
    ======================================================== */

    statusBadge: {
      flexDirection:
        "row",

      alignItems:
        "center",

      alignSelf:
        "flex-start",

      paddingHorizontal:
        Metrics.x2,

      paddingVertical:
        6,

      borderRadius:
        20,
    },


    statusDot: {
      width:
        7,

      height:
        7,

      borderRadius:
        4,

      backgroundColor:
        "#555555",

      marginRight:
        6,
    },


    statusBadgeText: {
      fontSize:
        11,

      fontWeight:
        "800",

      color:
        "#303030",
    },


    activeBadge: {
      backgroundColor:
        Colors.successBg,
    },


    onboardingBadge: {
      backgroundColor:
        Colors.warningBg,
    },


    suspendedBadge: {
      backgroundColor:
        Colors.errorBg,
    },


    expiredBadge: {
      backgroundColor:
        Colors.errorBg,
    },


    defaultBadge: {
      backgroundColor:
        Colors.brandPrimaryBg,
    },


    planBadge: {
      paddingHorizontal:
        Metrics.x2,

      paddingVertical:
        6,

      borderRadius:
        20,

      backgroundColor:
        "#F0EDFF",
    },


    planBadgeText: {
      fontSize:
        11,

      fontWeight:
        "800",

      color:
        Colors.brandPrimary,
    },


    /* ========================================================
       STATS HEADER
    ======================================================== */

    statsHeader: {
      marginBottom:
        Metrics.x3,
    },


    sectionTitle: {
      fontSize:
        19,

      fontWeight:
        "800",

      color:
        "#171717",
    },


    sectionSubtitle: {
      fontSize:
        13,

      color:
        Colors.subtext,

      marginTop:
        3,
    },


    /* ========================================================
       STATS
    ======================================================== */

    statsGrid: {
      flexDirection:
        "row",

      flexWrap:
        "wrap",

      gap:
        Metrics.x3,

      marginBottom:
        Metrics.x5,
    },


    statCard: {
      flexGrow:
        1,

      flexBasis:
        150,

      minWidth:
        140,

      borderRadius:
        15,

      backgroundColor:
        "#FFFFFF",

      elevation:
        1,

      borderWidth:
        1,

      borderColor:
        "#ECECF1",
    },


    statCardTop: {
      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",
    },


    statAvatar: {
      backgroundColor:
        Colors.brandPrimaryBg,
    },


    statValue: {
      fontSize:
        27,

      fontWeight:
        "800",

      color:
        "#171717",
    },


    statValueMobile: {
      fontSize: 22,
    },

    statLabel: {
      marginTop:
        Metrics.x2,

      fontSize:
        13,

      fontWeight:
        "600",

      color:
        Colors.subtext,
    },


    statsGridMobile: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      marginBottom: 18,
    },

    statCardMobile: {
      width: "48%",
      flexGrow: 0,
      flexBasis: "48%",
      minWidth: 0,
      borderRadius: 12,
      marginBottom: 8,
    },

    statCardContentMobile: {
      paddingHorizontal: 12,
      paddingVertical: 12,
    },

    statLabelMobile: {
      marginTop: 6,
      fontSize: 12,
    },


    /* ========================================================
       CONTENT GRID
    ======================================================== */

    contentGrid: {
      flexDirection:
        "row",

      alignItems:
        "flex-start",

      gap:
        Metrics.x4,
    },


    contentGridMobile: {
      flexDirection:
        "column",

      gap:
        0,
    },


    primaryColumn: {
      flex:
        1,

      minWidth:
        0,
    },


    secondaryColumn: {
      width:
        390,

      maxWidth:
        "38%",
    },


    primaryColumnMobile: {
      width: "100%",
      flex: 1,
    },

    secondaryColumnMobile: {
      width: "100%",
      maxWidth: "100%",
      flex: 1,
    },

    /* ========================================================
       CARD
    ======================================================== */

    cardContent: {
      paddingHorizontal: 16,
      paddingVertical: 16,
    },

    card: {
      borderRadius:
        17,

      backgroundColor:
        "#FFFFFF",

      marginBottom:
        Metrics.x4,

      elevation:
        1,

      borderWidth:
        1,

      borderColor:
        "#ECECF1",
    },


    cardHeader: {
      flexDirection:
        "row",

      alignItems:
        "center",
    },


    cardHeaderIcon: {
      marginRight:
        Metrics.x2,
    },


    cardHeaderAvatar: {
      backgroundColor:
        Colors.brandPrimaryBg,
    },


    cardHeaderText: {
      flex:
        1,

      minWidth:
        0,
    },


    cardTitle: {
      fontSize:
        17,

      fontWeight:
        "800",

      color:
        "#171717",
    },


    cardSubtitle: {
      fontSize:
        12,

      color:
        Colors.subtext,

      marginTop:
        2,
    },


    cardDivider: {
      marginVertical:
        Metrics.x3,
    },


    /* ========================================================
       INFO
    ======================================================== */

    infoRow: {
      flexDirection:
        "row",

      alignItems:
        "flex-start",

      paddingVertical:
        Metrics.x2,
    },


    infoIcon: {
      marginRight:
        Metrics.x2,
    },


    infoAvatar: {
      backgroundColor:
        "#F3F3F7",
    },


    infoContent: {
      flex:
        1,

      minWidth:
        0,
    },


    infoLabel: {
      fontSize:
        11,

      fontWeight:
        "600",

      color:
        Colors.subtext,

      marginBottom:
        3,

      textTransform:
        "uppercase",

      letterSpacing:
        0.4,
    },


    infoValue: {
      fontSize:
        14,

      lineHeight:
        20,

      fontWeight:
        "600",

      color:
        "#242424",
    },


    innerDivider: {
      marginVertical:
        Metrics.x2,
    },


    /* ========================================================
       PRINCIPAL
    ======================================================== */

    principalProfile: {
      flexDirection:
        "row",

      alignItems:
        "center",

      paddingVertical:
        Metrics.x2,
    },


    principalAvatar: {
      backgroundColor:
        Colors.brandPrimary,
    },


    principalProfileInfo: {
      flex:
        1,

      marginLeft:
        Metrics.x2,

      minWidth:
        0,
    },


    principalName: {
      fontSize:
        17,

      fontWeight:
        "800",

      color:
        "#171717",
    },


    principalDesignation: {
      fontSize:
        13,

      color:
        Colors.subtext,

      marginTop:
        2,
    },


    activeIndicatorRow: {
      flexDirection:
        "row",

      alignItems:
        "center",

      marginTop:
        Metrics.x1,
    },


    activeDot: {
      width:
        7,

      height:
        7,

      borderRadius:
        4,

      marginRight:
        6,
    },


    activeIndicatorText: {
      fontSize:
        11,

      color:
        Colors.subtext,

      fontWeight:
        "600",
    },


    /* ========================================================
       EMPTY PRINCIPAL
    ======================================================== */

    emptyPrincipal: {
      alignItems:
        "center",

      paddingVertical:
        Metrics.x3,

      paddingHorizontal:
        Metrics.x2,
    },


    emptyPrincipalIcon: {
      width:
        64,

      height:
        64,

      borderRadius:
        32,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        Colors.brandPrimaryBg,

      marginBottom:
        Metrics.x2,
    },


    emptyPrincipalAvatar: {
      backgroundColor:
        Colors.brandPrimaryBg,
    },


    emptyPrincipalTitle: {
      fontSize:
        16,

      fontWeight:
        "800",

      color:
        "#171717",
    },


    emptyPrincipalText: {
      fontSize:
        13,

      color:
        Colors.subtext,

      textAlign:
        "center",

      lineHeight:
        19,

      marginTop:
        Metrics.x1,

      maxWidth:
        330,
    },


    createPrincipalButton: {
      marginTop:
        Metrics.x3,

      borderRadius:
        22,
    },


    /* ========================================================
       QUICK ACTIONS
    ======================================================== */

    createPrincipalAction: {
      borderRadius:
        22,
    },


    actionContent: {
      minHeight:
        44,
    },


    actionInfo: {
      flexDirection:
        "row",

      alignItems:
        "center",

      padding:
        Metrics.x2,

      borderRadius:
        12,

      backgroundColor:
        Colors.successBg,
    },


    actionInfoIcon: {
      width:
        34,

      height:
        34,

      borderRadius:
        17,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        "#FFFFFF",
    },


    actionInfoIconText: {
      fontSize:
        18,

      fontWeight:
        "800",

      color:
        "#2E7D32",
    },


    actionInfoText: {
      marginLeft:
        Metrics.x2,

      flex:
        1,
    },


    actionInfoTitle: {
      fontSize:
        13,

      fontWeight:
        "800",

      color:
        "#1E1E1E",
    },


    actionInfoSubtitle: {
      fontSize:
        12,

      color:
        Colors.subtext,

      marginTop:
        2,
    },


    actionDivider: {
      marginVertical:
        Metrics.x3,
    },


    statusActionInfo: {
      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",
    },


    actionLabel: {
      fontSize:
        11,

      color:
        Colors.subtext,

      textTransform:
        "uppercase",

      fontWeight:
        "700",

      letterSpacing:
        0.4,
    },


    actionStatusValue: {
      fontSize:
        14,

      fontWeight:
        "800",

      color:
        "#171717",

      marginTop:
        3,
    },


    /* ========================================================
       SUBSCRIPTION
    ======================================================== */

    subscriptionPlan: {
      flexDirection:
        "row",

      alignItems:
        "center",

      paddingVertical:
        Metrics.x1,
    },


    subscriptionIcon: {
      marginRight:
        Metrics.x2,
    },


    subscriptionAvatar: {
      backgroundColor:
        Colors.brandPrimaryBg,
    },


    subscriptionInfo: {
      flex:
        1,
    },


    subscriptionPlanLabel: {
      fontSize:
        11,

      color:
        Colors.subtext,

      fontWeight:
        "600",

      textTransform:
        "uppercase",
    },


    subscriptionPlanName: {
      fontSize:
        18,

      fontWeight:
        "800",

      color:
        Colors.brandPrimary,

      marginTop:
        2,
    },


    /* ========================================================
       SNACKBAR
    ======================================================== */

    successSnackbar: {
      backgroundColor:
        "#256B3A",

      borderRadius:
        10,
    },


    errorSnackbar: {
      backgroundColor:
        "#B42318",

      borderRadius:
        10,
    },

  });


export {
  PlatformAdminSchoolDetails,
};