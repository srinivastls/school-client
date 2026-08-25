import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type DimensionValue,
  useWindowDimensions,
} from "react-native";

import {
  ActivityIndicator,
  Avatar,
  Button,
  Card,
  Divider,
  IconButton,
  Menu,
  Searchbar,
  Snackbar,
} from "react-native-paper";

import { useQuery } from "react-query";

import type {
  NativeStackScreenProps,
} from "@react-navigation/native-stack";

import { Page } from "../../components";

import {
  Colors,
  Metrics,
} from "../../theme";

import {
  RootStackParamList,
  RootStackScreenNames,
} from "../../types";

import {
  platformAdminServices,
} from "../../services/platformAdminServices";

import { useUserStore } from "../../store";


/* ============================================================
   TYPES
============================================================ */

type PlatformStats = {
  schools: {
    total: number;
    active: number;
    onboarding: number;
    suspended: number;
    expired: number;
  };

  users: {
    principals: number;
    admins: number;
    teachers: number;
    parents: number;
  };

  students: {
    total: number;
  };
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

  principal?: {
    id: string;

    name: string;

    email: string;

    phone?: string | null;

    designation?: string | null;

    isActive: boolean;

    lastLogin?: string | null;
  } | null;

  counts: {
    students: number;
    staff: number;
    admins: number;
    teachers: number;
    parents: number;
  };
};


type SchoolsResponse = {
  schools: School[];
};


type SortOption =
  | "name"
  | "students"
  | "recent"
  | "expiry";


type StatusFilter =
  | "ALL"
  | "ACTIVE"
  | "ONBOARDING"
  | "SUSPENDED"
  | "EXPIRED";


/* ============================================================
   NAVIGATION PROPS
============================================================ */

type Props =
  NativeStackScreenProps<
    RootStackParamList,
    RootStackScreenNames.PlatformAdminDashboard
  >;


/* ============================================================
   CONSTANTS
============================================================ */

const STATUS_FILTERS: {
  label: string;
  value: StatusFilter;
}[] = [
  {
    label: "All",
    value: "ALL",
  },
  {
    label: "Active",
    value: "ACTIVE",
  },
  {
    label: "Onboarding",
    value: "ONBOARDING",
  },
  {
    label: "Suspended",
    value: "SUSPENDED",
  },
  {
    label: "Expired",
    value: "EXPIRED",
  },
];


const SORT_OPTIONS: {
  label: string;
  value: SortOption;
}[] = [
  {
    label: "Name",
    value: "name",
  },
  {
    label: "Students",
    value: "students",
  },
  {
    label: "Recently Added",
    value: "recent",
  },
  {
    label: "Expiry Date",
    value: "expiry",
  },
];


/* ============================================================
   HELPERS
============================================================ */

const getStatusStyle = (
  status: string
) => {
  switch (status) {
    case "ACTIVE":
      return {
        container: styles.activeBadge,
        text: styles.activeBadgeText,
      };

    case "ONBOARDING":
      return {
        container: styles.onboardingBadge,
        text: styles.onboardingBadgeText,
      };

    case "SUSPENDED":
      return {
        container: styles.suspendedBadge,
        text: styles.suspendedBadgeText,
      };

    case "EXPIRED":
      return {
        container: styles.expiredBadge,
        text: styles.expiredBadgeText,
      };

    default:
      return {
        container: styles.defaultBadge,
        text: styles.defaultBadgeText,
      };
  }
};


const formatDate = (
  date?: string | null
) => {
  if (!date) {
    return null;
  }

  const parsed =
    new Date(date);

  if (
    Number.isNaN(
      parsed.getTime()
    )
  ) {
    return null;
  }

  return parsed.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};


const getDaysUntilExpiry = (
  date?: string | null
) => {
  if (!date) {
    return null;
  }

  const expiry =
    new Date(date);

  if (
    Number.isNaN(
      expiry.getTime()
    )
  ) {
    return null;
  }

  const today =
    new Date();

  today.setHours(
    0,
    0,
    0,
    0
  );

  expiry.setHours(
    0,
    0,
    0,
    0
  );

  return Math.ceil(
    (
      expiry.getTime() -
      today.getTime()
    ) /
      (1000 * 60 * 60 * 24)
  );
};


const getExpiryInfo = (
  school: School
) => {
  const days =
    getDaysUntilExpiry(
      school.subscriptionExpiryDate
    );

  if (days === null) {
    return null;
  }

  if (days < 0) {
    return {
      label: "Subscription expired",
      type: "expired" as const,
    };
  }

  if (days === 0) {
    return {
      label: "Expires today",
      type: "danger" as const,
    };
  }

  if (days <= 30) {
    return {
      label: `Expires in ${days} ${
        days === 1
          ? "day"
          : "days"
      }`,
      type: "warning" as const,
    };
  }

  return null;
};


/* ============================================================
   COMPONENT
============================================================ */

const PlatformAdminDashboard = ({
  navigation,
}: Props) => {

  /* ==========================================================
     RESPONSIVE
  ========================================================== */

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


  /* ==========================================================
     STORE
  ========================================================== */

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


  /* ==========================================================
     LOCAL STATE
  ========================================================== */

  const [
    refreshing,
    setRefreshing,
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
    profileMenuVisible,
    setProfileMenuVisible,
  ] = useState(false);


  const [
    searchQuery,
    setSearchQuery,
  ] = useState("");


  const [
    statusFilter,
    setStatusFilter,
  ] = useState<StatusFilter>(
    "ALL"
  );


  const [
    sortOption,
    setSortOption,
  ] = useState<SortOption>(
    "name"
  );

  const [
      loggingOut,
      setLoggingOut,
    ] = useState(false);


  const [
    sortMenuVisible,
    setSortMenuVisible,
  ] = useState(false);


  /* ==========================================================
     STATISTICS
  ========================================================== */

  const {
    data: stats,

    isLoading:
      statsLoading,

    isFetching:
      statsFetching,

    error:
      statsError,

    refetch:
      refetchStats,

  } = useQuery<PlatformStats>(
    [
      "platformAdminStats",
    ],

    platformAdminServices
      .getDashboard
  );


  /* ==========================================================
     SCHOOLS
  ========================================================== */

  const {
    data: schoolsData,

    isLoading:
      schoolsLoading,

    isFetching:
      schoolsFetching,

    error:
      schoolsError,

    refetch:
      refetchSchools,

  } = useQuery<SchoolsResponse>(
    [
      "platformAdminSchools",
    ],

    platformAdminServices
      .getSchools
  );


  /* ==========================================================
     ERROR HANDLING
  ========================================================== */

  useEffect(() => {

    const error =
      statsError ||
      schoolsError;

    if (!error) {
      return;
    }

    // @ts-ignore
    const message =
      "Unable to load platform information.";

    setSnackbarMessage(
      message
    );

    setSnackbarVisible(
      true
    );

  }, [
    statsError,
    schoolsError,
  ]);


  /* ==========================================================
     REFRESH
  ========================================================== */

  const onRefresh =
    useCallback(
      async () => {

        setRefreshing(
          true
        );

        try {

          await Promise.all([
            refetchStats(),
            refetchSchools(),
          ]);

        } catch (error) {

          console.log(
            "Platform refresh error:",
            error
          );

        } finally {

          setRefreshing(
            false
          );

        }
      },
      [
        refetchStats,
        refetchSchools,
      ]
    );


  /* ==========================================================
     LOGOUT
  ========================================================== */

  const handleLogout =
    () => {

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
     SCHOOL FILTERING / SORTING
  ========================================================== */

  const filteredSchools =
    useMemo(() => {

      const schools =
        schoolsData
          ?.schools ??
        [];

      const query =
        searchQuery
          .trim()
          .toLowerCase();


      const filtered =
        schools.filter(
          (school) => {

            const status =
              school.status
                ?.toUpperCase();


            const matchesStatus =
              statusFilter === "ALL" ||
              status ===
                statusFilter;


            const matchesSearch =
              !query ||
              school.name
                ?.toLowerCase()
                .includes(query) ||
              school.code
                ?.toLowerCase()
                .includes(query) ||
              school.principal
                ?.name
                ?.toLowerCase()
                .includes(query);


            return (
              matchesStatus &&
              matchesSearch
            );
          }
        );


      return [
        ...filtered,
      ].sort(
        (
          first,
          second
        ) => {

          switch (
            sortOption
          ) {

            case "students":
              return (
                second.counts
                  .students -
                first.counts
                  .students
              );


            case "recent":
              return (
                new Date(
                  second.createdAt
                ).getTime() -
                new Date(
                  first.createdAt
                ).getTime()
              );


            case "expiry": {
              const firstDate =
                first
                  .subscriptionExpiryDate
                  ? new Date(
                      first.subscriptionExpiryDate
                    ).getTime()
                  : Infinity;

              const secondDate =
                second
                  .subscriptionExpiryDate
                  ? new Date(
                      second.subscriptionExpiryDate
                    ).getTime()
                  : Infinity;

              return (
                firstDate -
                secondDate
              );
            }


            case "name":
            default:
              return first.name
                .localeCompare(
                  second.name
                );
          }
        }
      );

    }, [
      schoolsData,
      searchQuery,
      statusFilter,
      sortOption,
    ]);


  /* ==========================================================
     NEEDS ATTENTION
  ========================================================== */

  const attentionSchools =
    useMemo(() => {

      const schools =
        schoolsData
          ?.schools ??
        [];

      return schools.filter(
        (school) => {

          const status =
            school.status
              ?.toUpperCase();

          const expiry =
            getExpiryInfo(
              school
            );

          return (
            status === "SUSPENDED" ||
            status === "EXPIRED" ||
            status === "ONBOARDING" ||
            expiry !== null
          );
        }
      );

    }, [
      schoolsData,
    ]);


  /* ==========================================================
     LOADING
  ========================================================== */

  const initialLoading =
    statsLoading ||
    schoolsLoading;


  const fetching =
    statsFetching ||
    schoolsFetching;


  /* ==========================================================
     STAT CARD WIDTH
  ========================================================== */

  const statCardWidth =
    isSmallScreen
      ? "48.5%"
      : "23.5%";


  /* ==========================================================
     SCHOOL CARD
  ========================================================== */

  const renderSchool = ({
    item,
  }: {
    item: School;
  }) => {

    const status =
      item.status
        ?.toUpperCase();

    const statusStyle =
      getStatusStyle(
        status
      );

    const expiryInfo =
      getExpiryInfo(
        item
      );


    return (

      <TouchableOpacity
        activeOpacity={0.88}

        onPress={() => {

          navigation.navigate(
            RootStackScreenNames.PlatformAdminSchoolDetails,
            {
              schoolId:
                item.id,
            }
          );

        }}

        style={
          styles.schoolTouchable
        }
      >

        <Card
          style={[
            styles.schoolCard,

            isDesktop &&
              styles.schoolCardDesktop,
          ]}
        >

          <Card.Content>

            {/* ==================================================
                HEADER
            ================================================== */}

            <View
              style={
                styles.schoolHeader
              }
            >

              <View
                style={
                  styles.schoolTitleContainer
                }
              >

                <Avatar.Icon
                  size={
                    isSmallScreen
                      ? 44
                      : 48
                  }

                  icon="school"

                  style={
                    styles.schoolIcon
                  }
                />


                <View
                  style={
                    styles.schoolTitleText
                  }
                >

                  <Text
                    style={
                      styles.schoolName
                    }

                    numberOfLines={1}
                  >
                    {
                      item.name
                    }
                  </Text>


                  <Text
                    style={
                      styles.schoolCode
                    }
                  >
                    {item.code}
                  </Text>

                </View>

              </View>


              <View
                style={
                  styles.schoolHeaderRight
                }
              >

                <View
                  style={[
                    styles.statusBadge,
                    statusStyle.container,
                  ]}
                >

                  <View
                    style={[
                      styles.statusDot,
                    ]}
                  />


                  <Text
                    style={[
                      styles.statusText,
                      statusStyle.text,
                    ]}
                  >
                    {status}
                  </Text>

                </View>

              </View>

            </View>


            {/* ==================================================
                EXPIRY WARNING
            ================================================== */}

            {expiryInfo ? (

              <View
                style={[
                  styles.expiryWarning,

                  expiryInfo.type ===
                    "warning" &&
                    styles.expiryWarningAmber,

                  (
                    expiryInfo.type ===
                      "danger" ||
                    expiryInfo.type ===
                      "expired"
                  ) &&
                    styles.expiryWarningRed,
                ]}
              >

                <Text
                  style={
                    styles.expiryWarningIcon
                  }
                >
                  ⚠
                </Text>


                <Text
                  style={
                    styles.expiryWarningText
                  }
                >
                  {
                    expiryInfo.label
                  }
                </Text>

              </View>

            ) : null}


            <Divider
              style={
                styles.divider
              }
            />


            {/* ==================================================
                SCHOOL METRICS
            ================================================== */}

            <View
              style={
                styles.schoolStatsRow
              }
            >

              <SchoolStat
                label="Students"
                value={
                  item.counts
                    .students
                }
                icon="school-outline"
              />


              <SchoolStat
                label="Staff"
                value={
                  item.counts
                    .staff
                }
                icon="briefcase-account"
              />


              <SchoolStat
                label="Admins"
                value={
                  item.counts
                    .admins
                }
                icon="account-cog"
              />


              <SchoolStat
                label="Teachers"
                value={
                  item.counts
                    .teachers
                }
                icon="human-male-board"
              />

            </View>


            <Divider
              style={
                styles.divider
              }
            />


            {/* ==================================================
                PRINCIPAL
            ================================================== */}

            <View
              style={
                styles.principalContainer
              }
            >

              <View
                style={
                  styles.principalInfo
                }
              >

                <Text
                  style={
                    styles.sectionLabel
                  }
                >
                  PRINCIPAL
                </Text>


                <Text
                  style={
                    styles.principalName
                  }

                  numberOfLines={1}
                >
                  {
                    item.principal
                      ?.name ??
                    "Not assigned"
                  }
                </Text>


                {item.principal
                  ?.email ? (

                  <Text
                    style={
                      styles.principalEmail
                    }

                    numberOfLines={1}
                  >
                    {
                      item
                        .principal
                        .email
                    }
                  </Text>

                ) : null}

              </View>


              <View
                style={
                  styles.planContainer
                }
              >

                <View
                  style={
                    styles.planBadge
                  }
                >

                  <Text
                    style={
                      styles.planText
                    }
                  >
                    {
                      item.subscriptionPlan
                    }
                  </Text>

                </View>


                {item.subscriptionExpiryDate ? (

                  <Text
                    style={
                      styles.expiryDate
                    }
                  >
                    Until{" "}
                    {
                      formatDate(
                        item.subscriptionExpiryDate
                      )
                    }
                  </Text>

                ) : null}

              </View>

            </View>


            {/* ==================================================
                FOOTER
            ================================================== */}

            <View
              style={
                styles.schoolFooter
              }
            >

              <Text
                style={
                  styles.createdText
                }
              >
                Added{" "}
                {
                  formatDate(
                    item.createdAt
                  ) ??
                  "Recently"
                }
              </Text>


              <View
                style={
                  styles.viewSchool
                }
              >

                <Text
                  style={
                    styles.viewSchoolText
                  }
                >
                  View School
                </Text>


                <Text
                  style={
                    styles.viewSchoolArrow
                  }
                >
                  →
                </Text>

              </View>

            </View>

          </Card.Content>

        </Card>

      </TouchableOpacity>
    );
  };


  /* ==========================================================
     HEADER
  ========================================================== */

  const renderHeader =
    () => {

      return (

        <View>

          {/* ==================================================
              TOP BAR
          ================================================== */}

          <View
            style={[
              styles.platformHeader,

              {
                marginHorizontal:
                  isDesktop
                    ? 0
                    : 0,
              },
            ]}
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
                  Platform Administration
                </Text>

              </View>

            </View>


            <View
              style={
                styles.platformActions
              }
            >

              <IconButton
                icon={
                  fetching
                    ? "loading"
                    : "refresh"
                }

                size={
                  isSmallScreen
                    ? 20
                    : 22
                }

                iconColor={
                  Colors.brandPrimary
                }

                onPress={
                  onRefresh
                }

                disabled={
                  refreshing ||
                  fetching
                }

                style={
                  styles.refreshButton
                }
              />


              <TouchableOpacity
  activeOpacity={0.8}
  onPress={() => {
    setProfileMenuVisible(true);
  }}
  style={[
    styles.profileButton,
    profileMenuVisible && styles.profileButtonActive,
  ]}
>
  <Avatar.Text
    size={isSmallScreen ? 38 : 42}
    label={getInitials(user?.name)}
    color="#FFFFFF"
    style={styles.profileAvatar}
  />

  {!isSmallScreen ? (
    <View style={styles.profileDetails}>
      <Text
        style={styles.profileName}
        numberOfLines={1}
      >
        {user?.name ?? "Platform Administrator"}
      </Text>

      <Text style={styles.profileRole}>
        Platform Admin
      </Text>
    </View>
  ) : null}

  <Text style={styles.profileArrow}>
    {profileMenuVisible ? "⌃" : "⌄"}
  </Text>
</TouchableOpacity>

            </View>

          </View>


          {/* ==================================================
              GREETING
          ================================================== */}

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
                {
                  getGreeting()
                }
                ,{" "}
                {
                  getFirstName(
                    user?.name
                  )
                } 👋
              </Text>


              <Text
                style={
                  styles.pageTitle
                }
              >
                Platform overview
              </Text>


              <Text
                style={
                  styles.pageSubtitle
                }
              >
                Monitor schools, users and
                platform activity from one place.
              </Text>

            </View>


            <View
              style={
                styles.quickActions
              }
            >

              <Button
                mode="contained"

                icon="plus"

                compact

                onPress={() => {

                  navigation.navigate(
                    RootStackScreenNames.PlatformAdminCreateSchool
                  );

                }}

                style={
                  styles.primaryAction
                }

                contentStyle={
                  styles.primaryActionContent
                }

                labelStyle={
                  styles.primaryActionLabel
                }
              >
                Add School
              </Button>

            </View>

          </View>


          {/* ==================================================
              KEY METRICS
          ================================================== */}

          <SectionHeading
            title="Key Metrics"
            subtitle="A quick view of your platform"
          />


          <View
            style={
              styles.grid
            }
          >

            <StatCard
              title="Total Schools"

              value={
                stats?.schools
                  .total ??
                0
              }

              icon="school"

              iconBackground="#EEF2FF"

              iconColor="#4F46E5"

              width={
                statCardWidth
              }
            />


            <StatCard
              title="Active Schools"

              value={
                stats?.schools
                  .active ??
                0
              }

              icon="check-circle"

              iconBackground="#EAF8F0"

              iconColor="#16834B"

              width={
                statCardWidth
              }

              trend={
                stats?.schools
                  .total
                  ? `${Math.round(
                      (
                        (
                          stats.schools.active /
                          stats.schools.total
                        ) *
                        100
                      )
                    )}% active`
                  : undefined
              }
            />


            <StatCard
              title="Onboarding"

              value={
                stats?.schools
                  .onboarding ??
                0
              }

              icon="progress-clock"

              iconBackground="#FFF6DF"

              iconColor="#B7791F"

              width={
                statCardWidth
              }
            />


            <StatCard
              title="Suspended"

              value={
                stats?.schools
                  .suspended ??
                0
              }

              icon="pause-circle"

              iconBackground="#FFF0F0"

              iconColor="#D64545"

              width={
                statCardWidth
              }
            />


            <StatCard
              title="Expired"

              value={
                stats?.schools
                  .expired ??
                0
              }

              icon="alert-circle"

              iconBackground="#FFF0F0"

              iconColor="#B42318"

              width={
                statCardWidth
              }
            />

          </View>


          {/* ==================================================
              USERS
          ================================================== */}

          <SectionHeading
            title="Platform Users"
            subtitle="Users across all schools"
          />


          <View
            style={
              styles.grid
            }
          >

            <StatCard
              title="Principals"

              value={
                stats?.users
                  .principals ??
                0
              }

              icon="account-tie"

              iconBackground="#F1EEFF"

              iconColor="#6D4AFF"

              width={
                statCardWidth
              }
            />


            <StatCard
              title="Admins"

              value={
                stats?.users
                  .admins ??
                0
              }

              icon="account-cog"

              iconBackground="#EEF6FF"

              iconColor="#2775CA"

              width={
                statCardWidth
              }
            />


            <StatCard
              title="Teachers"

              value={
                stats?.users
                  .teachers ??
                0
              }

              icon="human-male-board"

              iconBackground="#EFFAF5"

              iconColor="#16834B"

              width={
                statCardWidth
              }
            />


            <StatCard
              title="Parents"

              value={
                stats?.users
                  .parents ??
                0
              }

              icon="account-group"

              iconBackground="#FFF5ED"

              iconColor="#C55A11"

              width={
                statCardWidth
              }
            />

          </View>


          {/* ==================================================
              STUDENTS HERO
          ================================================== */}

          <Card
            style={
              styles.studentsHero
            }
          >

            <Card.Content>

              <View
                style={
                  styles.studentsHeroRow
                }
              >

                <View
                  style={
                    styles.studentsHeroText
                  }
                >

                  <Text
                    style={
                      styles.studentsEyebrow
                    }
                  >
                    PLATFORM-WIDE
                  </Text>


                  <Text
                    style={
                      styles.studentsHeroTitle
                    }
                  >
                    Total Students
                  </Text>


                  <Text
                    style={
                      styles.studentsHeroValue
                    }
                  >
                    {
                      formatNumber(
                        stats?.students
                          .total ??
                        0
                      )
                    }
                  </Text>


                  <Text
                    style={
                      styles.studentsHeroSubtitle
                    }
                  >
                    Students across{" "}
                    {
                      stats?.schools
                        .total ??
                      0
                    } schools
                  </Text>

                </View>


                <View
                  style={
                    styles.studentsHeroIconContainer
                  }
                >

                  <Avatar.Icon
                    size={64}

                    icon="school-outline"

                    color="#FFFFFF"

                    style={
                      styles.studentsHeroIcon
                    }
                  />

                </View>

              </View>

            </Card.Content>

          </Card>


          {/* ==================================================
              NEEDS ATTENTION
          ================================================== */}

          {attentionSchools.length > 0 ? (

            <View
              style={
                styles.attentionSection
              }
            >

              <View
                style={
                  styles.attentionHeader
                }
              >

                <View
                  style={
                    styles.attentionTitleContainer
                  }
                >

                  <View
                    style={
                      styles.attentionIcon
                    }
                  >
                    <Text
                      style={
                        styles.attentionIconText
                      }
                    >
                      !
                    </Text>
                  </View>


                  <View>

                    <Text
                      style={
                        styles.attentionTitle
                      }
                    >
                      Needs Attention
                    </Text>


                    <Text
                      style={
                        styles.attentionSubtitle
                      }
                    >
                      Schools that may require action
                    </Text>

                  </View>

                </View>


                <Text
                  style={
                    styles.attentionCount
                  }
                >
                  {
                    attentionSchools.length
                  }
                </Text>

              </View>


              <ScrollView
                horizontal

                showsHorizontalScrollIndicator={
                  false
                }

                contentContainerStyle={
                  styles.attentionList
                }
              >

                {attentionSchools
                  .slice(0, 8)
                  .map(
                    (
                      school
                    ) => {

                      const expiry =
                        getExpiryInfo(
                          school
                        );

                      const status =
                        school.status
                          ?.toUpperCase();

                      return (

                        <TouchableOpacity
                          key={
                            school.id
                          }

                          activeOpacity={
                            0.8
                          }

                          onPress={() => {

                            navigation.navigate(
                              RootStackScreenNames.PlatformAdminSchoolDetails,
                              {
                                schoolId:
                                  school.id,
                              }
                            );

                          }}

                          style={
                            styles.attentionCard
                          }
                        >

                          <View
                            style={
                              styles.attentionCardTop
                            }
                          >

                            <Avatar.Icon
                              size={34}

                              icon="school"

                              style={
                                styles.attentionSchoolIcon
                              }
                            />


                            <Text
                              style={
                                styles.attentionArrow
                              }
                            >
                              →
                            </Text>

                          </View>


                          <Text
                            style={
                              styles.attentionSchoolName
                            }

                            numberOfLines={1}
                          >
                            {
                              school.name
                            }
                          </Text>


                          <Text
                            style={
                              styles.attentionReason
                            }

                            numberOfLines={1}
                          >
                            {
                              expiry?.label ??
                              formatStatus(
                                status
                              )
                            }
                          </Text>

                        </TouchableOpacity>

                      );

                    }
                  )}

              </ScrollView>

            </View>

          ) : null}


          {/* ==================================================
              SCHOOLS HEADER
          ================================================== */}

          <View
            style={
              styles.schoolSectionHeader
            }
          >

            <View
              style={
                styles.schoolSectionText
              }
            >

              <Text
                style={
                  styles.sectionMainTitle
                }
              >
                Schools
              </Text>


              <Text
                style={
                  styles.schoolSectionSubtitle
                }
              >
                Manage and monitor every school
              </Text>

            </View>


            <Text
              style={
                styles.schoolCountText
              }
            >
              {
                filteredSchools.length
              }{" "}
              {
                filteredSchools.length ===
                1
                  ? "school"
                  : "schools"
              }
            </Text>

          </View>


          {/* ==================================================
              SEARCH
          ================================================== */}

          <Searchbar
            placeholder="Search by school, code or principal..."

            value={
              searchQuery
            }

            onChangeText={
              setSearchQuery
            }

            style={
              styles.searchBar
            }

            inputStyle={
              styles.searchInput
            }

            iconColor={
              Colors.subtext
            }

            elevation={0}
          />


          {/* ==================================================
              FILTERS
          ================================================== */}

          <View
            style={
              styles.filtersRow
            }
          >

            <ScrollView
              horizontal

              showsHorizontalScrollIndicator={
                false
              }

              contentContainerStyle={
                styles.filterScrollContent
              }
            >

              {STATUS_FILTERS.map(
                (
                  filter
                ) => {

                  const active =
                    statusFilter ===
                    filter.value;

                  return (

                    <TouchableOpacity
                      key={
                        filter.value
                      }

                      activeOpacity={
                        0.8
                      }

                      onPress={() =>
                        setStatusFilter(
                          filter.value
                        )
                      }

                      style={[
                        styles.filterChip,

                        active &&
                          styles.filterChipActive,
                      ]}
                    >

                      <Text
                        style={[
                          styles.filterChipText,

                          active &&
                            styles.filterChipTextActive,
                        ]}
                      >
                        {
                          filter.label
                        }
                      </Text>

                    </TouchableOpacity>

                  );

                }
              )}

            </ScrollView>


            <Menu
              visible={
                sortMenuVisible
              }

              onDismiss={() =>
                setSortMenuVisible(
                  false
                )
              }

              anchor={

                <Button
                  mode="outlined"

                  compact

                  icon="sort"

                  onPress={() =>
                    setSortMenuVisible(
                      true
                    )
                  }

                  style={
                    styles.sortButton
                  }

                  contentStyle={
                    styles.sortButtonContent
                  }

                  labelStyle={
                    styles.sortButtonLabel
                  }
                >
                  Sort
                </Button>
              }
            >

              {SORT_OPTIONS.map(
                (
                  option
                ) => (

                  <Menu.Item
                    key={
                      option.value
                    }

                    title={
                      option.label
                    }

                    trailingIcon={
                      sortOption ===
                      option.value
                        ? "check"
                        : undefined
                    }

                    onPress={() => {

                      setSortOption(
                        option.value
                      );

                      setSortMenuVisible(
                        false
                      );

                    }}
                  />

                )
              )}

            </Menu>

          </View>

        </View>
      );
    };
const renderProfileDropdown = () => {
  if (!profileMenuVisible) {
    return null;
  }

  return (
    <Modal
      visible={profileMenuVisible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => {
        setProfileMenuVisible(false);
      }}
    >
      <Pressable
        style={styles.modalOverlay}
        onPress={() => {
          setProfileMenuVisible(false);
        }}
      >
        <View
          style={[
            styles.profileDropdown,
            isSmallScreen
              ? styles.profileDropdownMobile
              : styles.profileDropdownDesktop,
          ]}
        >
          <View style={styles.dropdownProfileHeader}>
            <Avatar.Text
              size={46}
              label={getInitials(user?.name)}
              color="#FFFFFF"
              style={styles.dropdownAvatar}
            />

            <View style={styles.dropdownUserInfo}>
              <Text
                style={styles.dropdownUserName}
                numberOfLines={1}
              >
                {user?.name ?? "Platform Administrator"}
              </Text>

              <Text
                style={styles.dropdownUserEmail}
                numberOfLines={1}
              >
                {user?.email ?? "Platform Administrator"}
              </Text>

              <Text style={styles.dropdownUserRole}>
                Platform Administrator
              </Text>
            </View>
          </View>

          <Divider style={styles.dropdownDivider} />

          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.dropdownItem}
            onPress={() => {
              setProfileMenuVisible(false);
            }}
          >
            <View style={styles.dropdownIconContainer}>
              <Text style={styles.dropdownIcon}>
                👤
              </Text>
            </View>

            <View style={styles.dropdownItemTextContainer}>
              <Text style={styles.dropdownItemTitle}>
                Profile
              </Text>

              <Text style={styles.dropdownItemSubtitle}>
                View administrator profile
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            style={[
              styles.dropdownItem,
              styles.logoutItem,
            ]}
            onPress={handleLogout}
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

            <View style={styles.dropdownItemTextContainer}>
              <Text
                style={[
                  styles.dropdownItemTitle,
                  styles.logoutTitle,
                ]}
              >
                Logout
              </Text>

              <Text style={styles.dropdownItemSubtitle}>
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
     MAIN UI
  ========================================================== */

  return (

    <Page
      style={
        styles.page
      }
    >

      {initialLoading ? (

        <LoadingState
          isSmallScreen={
            isSmallScreen
          }
        />

      ) : (

        <FlatList

          data={
            filteredSchools
          }

          renderItem={
            renderSchool
          }

          keyExtractor={
            (item) =>
              item.id
          }

          ListHeaderComponent={
            renderHeader
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

          refreshControl={

            <RefreshControl

              refreshing={
                refreshing ||
                fetching
              }

              onRefresh={
                onRefresh
              }

              tintColor={
                Colors.brandPrimary
              }

            />

          }

          ListEmptyComponent={

            <EmptySchools
              hasSearch={
                Boolean(
                  searchQuery
                    .trim()
                )
              }

              onClear={() => {

                setSearchQuery(
                  ""
                );

                setStatusFilter(
                  "ALL"
                );

              }}

              onCreate={() => {

                navigation.navigate(
                  RootStackScreenNames.PlatformAdminCreateSchool
                );

              }}
            />

          }

        />

      )}

      {
        renderProfileDropdown()
      }

      {/* ======================================================
          ERROR SNACKBAR
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
          styles.snackbar
        }

        action={{
          label: "Retry",

          onPress:
            onRefresh,
        }}
      >
        {
          snackbarMessage
        }
      </Snackbar>

    </Page>
  );
};


/* ============================================================
   SECTION HEADING
============================================================ */

const SectionHeading = ({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) => (

  <View
    style={
      styles.sectionHeading
    }
  >

    <Text
      style={
        styles.sectionMainTitle
      }
    >
      {title}
    </Text>


    <Text
      style={
        styles.sectionSubtitle
      }
    >
      {subtitle}
    </Text>

  </View>
);


/* ============================================================
   STAT CARD
============================================================ */

type StatCardProps = {
  title: string;
  value: number;
  icon: string;
  iconBackground: string;
  iconColor: string;
  width: DimensionValue;
  trend?: string;
};


const StatCard = ({
  title,
  value,
  icon,
  iconBackground,
  iconColor,
  width,
  trend,
}: StatCardProps) => (

  <Card
    style={[
      styles.statCard,
      {
        width,
      },
    ]}
  >

    <Card.Content>

      <View
        style={
          styles.statCardTop
        }
      >

        <Avatar.Icon
          size={42}

          icon={icon}

          color={iconColor}

          style={[
            styles.statIcon,
            {
              backgroundColor:
                iconBackground,
            },
          ]}
        />


        {trend ? (

          <View
            style={
              styles.statTrend
            }
          >

            <Text
              style={
                styles.statTrendText
              }
            >
              {trend}
            </Text>

          </View>

        ) : null}

      </View>


      <Text
        style={
          styles.statValue
        }
      >
        {
          formatNumber(
            value
          )
        }
      </Text>


      <Text
        style={
          styles.statTitle
        }
      >
        {title}
      </Text>

    </Card.Content>

  </Card>
);


/* ============================================================
   SCHOOL STAT
============================================================ */

const SchoolStat = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: string;
}) => (

  <View
    style={
      styles.schoolStat
    }
  >

    <Avatar.Icon
      size={28}

      icon={icon}

      color={
        Colors.brandPrimary
      }

      style={
        styles.schoolStatIcon
      }
    />


    <Text
      style={
        styles.schoolStatValue
      }
    >
      {
        formatNumber(
          value
        )
      }
    </Text>


    <Text
      style={
        styles.schoolStatLabel
      }
    >
      {label}
    </Text>

  </View>
);


/* ============================================================
   LOADING
============================================================ */

const LoadingState = ({
  isSmallScreen,
}: {
  isSmallScreen: boolean;
}) => (

  <View
    style={
      styles.loadingContainer
    }
  >

    <View
      style={
        styles.loadingBrand
      }
    >

      <Avatar.Icon
        size={
          isSmallScreen
            ? 56
            : 64
        }

        icon="shield-check"

        color="#FFFFFF"

        style={
          styles.loadingLogo
        }
      />

    </View>


    <ActivityIndicator
      size="small"
      color={
        Colors.brandPrimary
      }

      style={
        styles.loadingSpinner
      }
    />


    <Text
      style={
        styles.loadingTitle
      }
    >
      Preparing your dashboard
    </Text>


    <Text
      style={
        styles.loadingSubtitle
      }
    >
      Loading platform information...
    </Text>

  </View>
);


/* ============================================================
   EMPTY STATE
============================================================ */

const EmptySchools = ({
  hasSearch,
  onClear,
  onCreate,
}: {
  hasSearch: boolean;
  onClear: () => void;
  onCreate: () => void;
}) => (

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
        size={62}

        icon={
          hasSearch
            ? "magnify"
            : "school-outline"
        }

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
      {
        hasSearch
          ? "No matching schools"
          : "No schools yet"
      }
    </Text>


    <Text
      style={
        styles.emptyText
      }
    >
      {
        hasSearch
          ? "Try a different school name, code or filter."
          : "Create your first school to start building your platform."
      }
    </Text>


    {hasSearch ? (

      <Button
        mode="outlined"

        onPress={
          onClear
        }

        style={
          styles.emptyButton
        }
      >
        Clear Filters
      </Button>

    ) : (

      <Button
        mode="contained"

        icon="plus"

        onPress={
          onCreate
        }

        style={
          styles.emptyButton
        }
      >
        Create School
      </Button>

    )}

  </View>
);


/* ============================================================
   UTILITY FUNCTIONS
============================================================ */

const formatNumber = (
  value: number
) =>
  new Intl.NumberFormat(
    "en-IN"
  ).format(
    value
  );


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


const getFirstName = (
  name?: string | null
) => {

  if (!name) {
    return "Administrator";
  }

  return name
    .trim()
    .split(
      /\s+/
    )[0];
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


const formatStatus = (
  status?: string
) => {

  if (!status) {
    return "Requires attention";
  }

  switch (status) {

    case "SUSPENDED":
      return "School suspended";

    case "EXPIRED":
      return "Subscription expired";

    case "ONBOARDING":
      return "Onboarding in progress";

    default:
      return "Requires attention";
  }
};


/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({

    /* ========================================================
       PAGE
    ======================================================== */

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


    /* ========================================================
       PLATFORM HEADER
    ======================================================== */

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

      borderWidth:
        1,

      borderColor:
        "#E9EAF0",

      borderRadius:
        16,

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


    refreshButton: {
      margin: 0,

      marginRight:
        Metrics.x1,
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

      borderRadius:
        24,
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


    /* ========================================================
       DASHBOARD HEADING
    ======================================================== */

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


    quickActions: {
      marginTop:
        Metrics.x3,

      alignSelf:
        "flex-start",
    },


    primaryAction: {
      borderRadius:
        12,
    },


    primaryActionContent: {
      minHeight:
        42,

      paddingHorizontal:
        Metrics.x2,
    },


    primaryActionLabel: {
      fontSize: 12,

      fontWeight:
        "800",
    },


    /* ========================================================
       SECTION HEADINGS
    ======================================================== */

    sectionHeading: {
      marginTop:
        Metrics.x2,

      marginBottom:
        Metrics.x3,
    },


    sectionMainTitle: {
      fontSize: 19,

      lineHeight: 24,

      fontWeight:
        "800",

      color:
        "#171717",
    },


    sectionSubtitle: {
      fontSize: 12,

      color:
        Colors.subtext,

      marginTop:
        3,
    },


    /* ========================================================
       GRID
    ======================================================== */

    grid: {
      flexDirection:
        "row",

      flexWrap:
        "wrap",

      justifyContent:
        "space-between",

      marginBottom:
        Metrics.x3,
    },


    /* ========================================================
       STAT CARD
    ======================================================== */

    statCard: {
      marginBottom:
        Metrics.x3,

      borderRadius:
        14,

      backgroundColor:
        "#FFFFFF",

      borderWidth:
        1,

      borderColor:
        "#ECEEF3",

      elevation: 1,
    },


    statCardTop: {
      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",
    },


    statIcon: {
      elevation: 0,
    },


    statTrend: {
      paddingHorizontal:
        Metrics.x1,

      paddingVertical:
        4,

      borderRadius:
        8,

      backgroundColor:
        "#EEF8F2",
    },


    statTrendText: {
      fontSize: 9,

      fontWeight:
        "800",

      color:
        "#16834B",
    },


    statValue: {
      fontSize: 27,

      lineHeight: 32,

      fontWeight:
        "800",

      marginTop:
        Metrics.x3,

      color:
        "#171717",
    },


    statTitle: {
      marginTop:
        3,

      fontSize: 12,

      color:
        Colors.subtext,

      fontWeight:
        "600",
    },


    /* ========================================================
       STUDENTS HERO
    ======================================================== */

    studentsHero: {
      marginTop:
        Metrics.x2,

      marginBottom:
        Metrics.x5,

      borderRadius:
        18,

      backgroundColor:
        Colors.brandPrimary,

      elevation: 3,

      overflow: "hidden",
    },


    studentsHeroRow: {
      minHeight: 170,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",
    },


    studentsHeroText: {
      flex: 1,
    },


    studentsEyebrow: {
      fontSize: 10,

      fontWeight:
        "900",

      letterSpacing:
        1.2,

      color:
        "rgba(255,255,255,0.72)",
    },


    studentsHeroTitle: {
      marginTop:
        Metrics.x1,

      fontSize: 17,

      fontWeight:
        "700",

      color:
        "#FFFFFF",
    },


    studentsHeroValue: {
      marginTop:
        Metrics.x1,

      fontSize: 39,

      lineHeight: 44,

      fontWeight:
        "900",

      color:
        "#FFFFFF",
    },


    studentsHeroSubtitle: {
      marginTop:
        Metrics.x1,

      fontSize: 12,

      color:
        "rgba(255,255,255,0.78)",
    },


    studentsHeroIconContainer: {
      marginLeft:
        Metrics.x3,

      padding:
        Metrics.x3,

      borderRadius:
        40,

      backgroundColor:
        "rgba(255,255,255,0.12)",
    },


    studentsHeroIcon: {
      backgroundColor:
        "rgba(255,255,255,0.16)",
    },


    /* ========================================================
       ATTENTION
    ======================================================== */

    attentionSection: {
      marginBottom:
        Metrics.x5,

      paddingVertical:
        Metrics.x3,

      backgroundColor:
        "#FFF9F1",

      borderWidth:
        1,

      borderColor:
        "#F6E6C8",

      borderRadius:
        16,
    },


    attentionHeader: {
      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      paddingHorizontal:
        Metrics.x3,

      marginBottom:
        Metrics.x3,
    },


    attentionTitleContainer: {
      flexDirection:
        "row",

      alignItems:
        "center",
    },


    attentionIcon: {
      width: 36,

      height: 36,

      borderRadius: 18,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        "#FDE9C8",

      marginRight:
        Metrics.x2,
    },


    attentionIconText: {
      fontSize: 17,

      fontWeight:
        "900",

      color:
        "#B7791F",
    },


    attentionTitle: {
      fontSize: 15,

      fontWeight:
        "800",

      color:
        "#292929",
    },


    attentionSubtitle: {
      marginTop: 2,

      fontSize: 11,

      color:
        "#806B4D",
    },


    attentionCount: {
      minWidth: 30,

      height: 30,

      borderRadius: 15,

      textAlign:
        "center",

      textAlignVertical:
        "center",

      paddingTop: 5,

      fontSize: 12,

      fontWeight:
        "900",

      color:
        "#B7791F",

      backgroundColor:
        "#FDE9C8",
    },


    attentionList: {
      paddingHorizontal:
        Metrics.x3,
    },


    attentionCard: {
      width: 190,

      padding:
        Metrics.x3,

      marginRight:
        Metrics.x2,

      borderRadius:
        14,

      backgroundColor:
        "#FFFFFF",

      borderWidth:
        1,

      borderColor:
        "#F1E3CC",

      elevation: 1,
    },


    attentionCardTop: {
      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      marginBottom:
        Metrics.x2,
    },


    attentionSchoolIcon: {
      backgroundColor:
        "#FFF0D7",
    },


    attentionArrow: {
      fontSize: 18,

      color:
        Colors.subtext,
    },


    attentionSchoolName: {
      fontSize: 13,

      fontWeight:
        "800",

      color:
        "#222222",
    },


    attentionReason: {
      marginTop:
        5,

      fontSize: 11,

      fontWeight:
        "600",

      color:
        "#B7791F",
    },

    modalOverlay: {
          flex: 1,
    
          backgroundColor:
            "rgba(0, 0, 0, 0.10)",
    
          alignItems:
            "flex-end",
    
          justifyContent:
            "flex-start",
    
          paddingTop:
            76,
    
          paddingRight:
            Metrics.x3,
        },
    
    
        profileDropdown: {
          backgroundColor:
            "#FFFFFF",
    
          borderRadius:
            16,
    
          paddingVertical:
            Metrics.x2,
    
          width:
            310,
    
          maxWidth:
            340,
    
          overflow:
            "hidden",
    
          elevation:
            12,
    
          shadowColor:
            "#000000",
    
          shadowOffset: {
            width: 0,
    
            height: 6,
          },
    
          shadowOpacity:
            0.18,
    
          shadowRadius:
            14,
        },
    
    
        profileDropdownDesktop: {
          marginRight:
            Metrics.x2,
        },
    
    
        profileDropdownMobile: {
          width:
            "92%",
    
          maxWidth:
            400,
    
          marginRight:
            "4%",
        },
    
    
        /* ========================================================
           DROPDOWN PROFILE HEADER
        ======================================================== */
    
        dropdownProfileHeader: {
          flexDirection:
            "row",
    
          alignItems:
            "center",
    
          paddingHorizontal:
            Metrics.x3,
    
          paddingVertical:
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
    
          minWidth:
            0,
        },
    
    
        dropdownUserName: {
          fontSize: 15,
    
          fontWeight:
            "800",
    
          color:
            "#171717",
        },
    
    
        dropdownUserEmail: {
          fontSize: 12,
    
          color:
            Colors.subtext,
    
          marginTop:
            2,
        },
    
    
        dropdownUserRole: {
          fontSize: 10,
    
          fontWeight:
            "700",
    
          color:
            Colors.brandPrimary,
    
          marginTop:
            3,
        },
    
    
        dropdownDivider: {
          marginVertical:
            Metrics.x1,
        },
    
    
        /* ========================================================
           DROPDOWN ITEMS
        ======================================================== */
    
        dropdownItem: {
          flexDirection:
            "row",
    
          alignItems:
            "center",
    
          paddingHorizontal:
            Metrics.x3,
    
          paddingVertical:
            Metrics.x2,
    
          marginHorizontal:
            Metrics.x1,
    
          borderRadius:
            Metrics.x2,
        },
    
    
        dropdownItemTextContainer: {
          flex: 1,
    
          marginLeft:
            Metrics.x2,
        },
    
    
        dropdownIconContainer: {
          width:
            38,
    
          height:
            38,
    
          borderRadius:
            19,
    
          alignItems:
            "center",
    
          justifyContent:
            "center",
    
          backgroundColor:
            Colors.brandPrimaryBg,
        },
    
    
        dropdownIcon: {
          fontSize: 18,
        },
    
    
        dropdownItemTitle: {
          fontSize: 14,
    
          fontWeight:
            "700",
    
          color:
            "#171717",
        },
    
    
        dropdownItemSubtitle: {
          fontSize: 11,
    
          color:
            Colors.subtext,
    
          marginTop:
            2,
        },
    
    
        /* ========================================================
           LOGOUT
        ======================================================== */
    
        logoutItem: {
          marginTop:
            Metrics.x1,
    
          backgroundColor:
            "#FFF7F7",
        },
    
    
        logoutItemDisabled: {
          opacity:
            0.65,
        },
    
    
        logoutIconContainer: {
          backgroundColor:
            Colors.errorBg,
        },
    
    
        logoutIcon: {
          color:
            "#D32F2F",
    
          fontWeight:
            "800",
        },
    
    
        logoutTitle: {
          color:
            "#D32F2F",
        },


    /* ========================================================
       SCHOOLS
    ======================================================== */

    schoolSectionHeader: {
      flexDirection:
        "row",

      alignItems:
        "flex-end",

      justifyContent:
        "space-between",

      marginTop:
        Metrics.x2,

      marginBottom:
        Metrics.x3,
    },


    schoolSectionText: {
      flex: 1,

      minWidth: 0,

      marginRight:
        Metrics.x2,
    },


    schoolSectionSubtitle: {
      fontSize: 12,

      color:
        Colors.subtext,

      marginTop: 3,
    },


    schoolCountText: {
      fontSize: 11,

      fontWeight:
        "700",

      color:
        Colors.subtext,
    },


    /* ========================================================
       SEARCH
    ======================================================== */

    searchBar: {
      height: 48,

      borderRadius:
        12,

      backgroundColor:
        "#FFFFFF",

      borderWidth:
        1,

      borderColor:
        "#E7E9EF",

      marginBottom:
        Metrics.x3,
    },


    searchInput: {
      fontSize: 13,
    },


    /* ========================================================
       FILTERS
    ======================================================== */

    filtersRow: {
      flexDirection:
        "row",

      alignItems:
        "center",

      marginBottom:
        Metrics.x4,
    },


    filterScrollContent: {
      alignItems:
        "center",

      paddingRight:
        Metrics.x2,
    },


    filterChip: {
      paddingHorizontal:
        Metrics.x3,

      paddingVertical:
        Metrics.x2,

      borderRadius:
        20,

      marginRight:
        Metrics.x1,

      backgroundColor:
        "#FFFFFF",

      borderWidth:
        1,

      borderColor:
        "#E4E6EC",
    },


    filterChipActive: {
      backgroundColor:
        Colors.brandPrimary,

      borderColor:
        Colors.brandPrimary,
    },


    filterChipText: {
      fontSize: 11,

      fontWeight:
        "700",

      color:
        Colors.subtext,
    },


    filterChipTextActive: {
      color:
        "#FFFFFF",
    },


    sortButton: {
      borderRadius:
        10,

      borderColor:
        "#DCDFE7",

      backgroundColor:
        "#FFFFFF",
    },


    sortButtonContent: {
      minHeight: 38,

      paddingHorizontal:
        2,
    },


    sortButtonLabel: {
      fontSize: 10,

      fontWeight:
        "800",
    },


    /* ========================================================
       SCHOOL CARD
    ======================================================== */

    schoolTouchable: {
      width:
        "100%",
    },


    schoolCard: {
      marginBottom:
        Metrics.x3,

      borderRadius:
        16,

      backgroundColor:
        "#FFFFFF",

      borderWidth:
        1,

      borderColor:
        "#E9EBF0",

      elevation: 1,
    },


    schoolCardDesktop: {
      borderRadius:
        18,
    },


    schoolHeader: {
      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",
    },


    schoolTitleContainer: {
      flexDirection:
        "row",

      alignItems:
        "center",

      flex: 1,

      minWidth: 0,
    },


    schoolIcon: {
      backgroundColor:
        Colors.brandPrimary,
    },


    schoolTitleText: {
      marginLeft:
        Metrics.x3,

      flex: 1,

      minWidth: 0,
    },


    schoolName: {
      fontSize: 17,

      fontWeight:
        "800",

      color:
        "#171717",
    },


    schoolCode: {
      marginTop:
        3,

      fontSize: 11,

      color:
        Colors.subtext,

      fontWeight:
        "700",

      letterSpacing:
        0.4,
    },


    schoolHeaderRight: {
      marginLeft:
        Metrics.x2,
    },


    statusBadge: {
      flexDirection:
        "row",

      alignItems:
        "center",

      paddingHorizontal:
        Metrics.x2,

      paddingVertical:
        Metrics.x1,

      borderRadius:
        20,
    },


    statusDot: {
      width: 6,

      height: 6,

      borderRadius: 3,

      marginRight:
        5,
    },


    statusText: {
      fontSize: 9,

      fontWeight:
        "900",

      letterSpacing:
        0.3,
    },


    activeBadge: {
      backgroundColor:
        "#E9F8EF",
    },


    activeBadgeText: {
      color:
        "#16834B",
    },


    onboardingBadge: {
      backgroundColor:
        "#FFF5DC",
    },


    onboardingBadgeText: {
      color:
        "#A86D12",
    },


    suspendedBadge: {
      backgroundColor:
        "#FFF0F0",
    },


    suspendedBadgeText: {
      color:
        "#C93C3C",
    },


    expiredBadge: {
      backgroundColor:
        "#FDECEC",
    },


    expiredBadgeText: {
      color:
        "#A9271C",
    },


    defaultBadge: {
      backgroundColor:
        "#F0F1F5",
    },


    defaultBadgeText: {
      color:
        "#666A73",
    },


    divider: {
      marginVertical:
        Metrics.x3,

      backgroundColor:
        "#ECEEF2",
    },


    /* ========================================================
       EXPIRY WARNING
    ======================================================== */

    expiryWarning: {
      flexDirection:
        "row",

      alignItems:
        "center",

      marginTop:
        Metrics.x3,

      paddingHorizontal:
        Metrics.x2,

      paddingVertical:
        Metrics.x2,

      borderRadius:
        9,

      backgroundColor:
        "#FFF7E7",
    },


    expiryWarningAmber: {
      backgroundColor:
        "#FFF7E7",
    },


    expiryWarningRed: {
      backgroundColor:
        "#FFF0F0",
    },


    expiryWarningIcon: {
      marginRight:
        Metrics.x1,

      fontSize: 13,

      fontWeight:
        "900",
    },


    expiryWarningText: {
      fontSize: 11,

      fontWeight:
        "700",

      color:
        "#A56B12",
    },


    /* ========================================================
       SCHOOL STATS
    ======================================================== */

    schoolStatsRow: {
      flexDirection:
        "row",

      justifyContent:
        "space-between",
    },


    schoolStat: {
      alignItems:
        "center",

      flex: 1,
    },


    schoolStatIcon: {
      backgroundColor:
        "#F2F3F7",

      marginBottom:
        Metrics.x1,
    },


    schoolStatValue: {
      fontSize: 17,

      fontWeight:
        "800",

      color:
        "#171717",
    },


    schoolStatLabel: {
      fontSize: 9,

      color:
        Colors.subtext,

      marginTop:
        2,

      fontWeight:
        "600",
    },


    /* ========================================================
       PRINCIPAL
    ======================================================== */

    principalContainer: {
      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",
    },


    principalInfo: {
      flex: 1,

      minWidth: 0,

      marginRight:
        Metrics.x2,
    },


    sectionLabel: {
      fontSize: 9,

      fontWeight:
        "800",

      letterSpacing:
        0.8,

      color:
        Colors.subtext,
    },


    principalName: {
      fontSize: 14,

      fontWeight:
        "800",

      marginTop:
        4,

      color:
        "#171717",
    },


    principalEmail: {
      fontSize: 11,

      color:
        Colors.subtext,

      marginTop:
        3,
    },


    planContainer: {
      alignItems:
        "flex-end",

      maxWidth: 150,
    },


    planBadge: {
      paddingHorizontal:
        Metrics.x2,

      paddingVertical:
        Metrics.x1,

      borderRadius:
        20,

      backgroundColor:
        Colors.brandPrimaryBg,
    },


    planText: {
      fontSize: 9,

      fontWeight:
        "900",

      color:
        "#242424",

      textTransform:
        "uppercase",
    },


    expiryDate: {
      marginTop:
        4,

      fontSize: 9,

      color:
        Colors.subtext,
    },


    /* ========================================================
       SCHOOL FOOTER
    ======================================================== */

    schoolFooter: {
      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      marginTop:
        Metrics.x4,

      paddingTop:
        Metrics.x3,

      borderTopWidth:
        1,

      borderTopColor:
        "#F0F1F4",
    },


    createdText: {
      fontSize: 10,

      color:
        Colors.subtext,
    },


    viewSchool: {
      flexDirection:
        "row",

      alignItems:
        "center",
    },


    viewSchoolText: {
      fontSize: 11,

      fontWeight:
        "800",

      color:
        Colors.brandPrimary,
    },


    viewSchoolArrow: {
      marginLeft:
        5,

      fontSize: 16,

      fontWeight:
        "800",

      color:
        Colors.brandPrimary,
    },


    /* ========================================================
       LOADING
    ======================================================== */

    loadingContainer: {
      flex: 1,

      alignItems:
        "center",

      justifyContent:
        "center",

      paddingHorizontal:
        Metrics.x4,
    },


    loadingBrand: {
      padding:
        Metrics.x2,

      borderRadius:
        40,

      backgroundColor:
        Colors.brandPrimaryBg,
    },


    loadingLogo: {
      backgroundColor:
        Colors.brandPrimary,
    },


    loadingSpinner: {
      marginTop:
        Metrics.x4,
    },


    loadingTitle: {
      marginTop:
        Metrics.x3,

      fontSize: 17,

      fontWeight:
        "800",

      color:
        "#171717",
    },


    loadingSubtitle: {
      marginTop:
        Metrics.x1,

      fontSize: 12,

      color:
        Colors.subtext,
    },


    /* ========================================================
       EMPTY
    ======================================================== */

    empty: {
      alignItems:
        "center",

      paddingVertical:
        Metrics.x8,

      paddingHorizontal:
        Metrics.x4,
    },


    emptyIconContainer: {
      padding:
        Metrics.x2,

      borderRadius:
        42,

      backgroundColor:
        Colors.brandPrimaryBg,
    },


    emptyIcon: {
      backgroundColor:
        Colors.brandPrimaryBg,
    },


    emptyTitle: {
      fontSize: 18,

      fontWeight:
        "800",

      marginTop:
        Metrics.x3,

      color:
        "#171717",
    },


    emptyText: {
      color:
        Colors.subtext,

      marginTop:
        Metrics.x1,

      textAlign:
        "center",

      maxWidth: 340,

      fontSize: 12,

      lineHeight: 18,
    },


    emptyButton: {
      marginTop:
        Metrics.x4,

      borderRadius:
        12,
    },
    profileButtonActive: {
          backgroundColor:
            Colors.brandPrimaryBg,
        },


    /* ========================================================
       SNACKBAR
    ======================================================== */

    snackbar: {
      backgroundColor:
        "#252525",

      borderRadius:
        10,
    },

  });


export {
  PlatformAdminDashboard,
};