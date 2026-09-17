import React, {
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
  Avatar,
  Card,
  Divider,
  IconButton,
  Snackbar,
} from "react-native-paper";

import {
  useNavigation,
} from "@react-navigation/native";

import type {
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";

import {
  RootStackParamList,
  RootStackScreenNames,
} from "../../types";

import {
  Colors,
  makeStyles,
  Metrics,
} from "../../theme";

import {
  useUserStore,
} from "../../store";

/* ============================================================
   TYPES
============================================================ */

type TeacherTile = {
  title: string;
  subtitle: string;
  icon: string;
  iconBackground: string;
  iconColor: string;
  section:
    | "Teaching"
    | "Academic Work"
    | "School";
  onPress: () => void;
};

/* ============================================================
   COMPONENT
============================================================ */

const TeacherDashboard = () => {

  const styles = useStyles();

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

  const user =
    useUserStore(
      state => state.user
    );

  const logout =
    useUserStore(
      state => state.logout
    );

  /* ==========================================================
     LOCAL STATE
  ========================================================== */

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

        <Text style={styles.errorText}>
          Session not found.
        </Text>

      </View>
    );

  }

  if (user.role !== "TEACHER") {

    return (
      <View style={styles.center}>

        <Text style={styles.errorText}>
          You are not authorized to access
          the Teacher Dashboard.
        </Text>

      </View>
    );

  }

  /* ==========================================================
     HELPERS
  ========================================================== */

  const comingSoon = (
    message: string
  ) => {

    setSnackbarText(message);
    setShowSnackbar(true);

  };

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

  /* ==========================================================
     TEACHER TILES
  ========================================================== */

  const tiles: TeacherTile[] = [

    /* ========================================================
       TEACHING
    ======================================================== */

    {
      title: "My Classes",

      subtitle:
        "View your assigned classes and sections.",

      icon:
        "google-classroom",

      iconBackground:
        "#EEF2FF",

      iconColor:
        "#4F46E5",

      section:
        "Teaching",

      onPress: () => {
  navigation.navigate(
    RootStackScreenNames.TeacherMyClasses
  );
}

    },

    {
      title: "My Students",

      subtitle:
        "View students from your assigned classes.",

      icon:
        "account-group",

      iconBackground:
        "#EFFAF5",

      iconColor:
        "#16834B",

      section:
        "Teaching",

      onPress: () => {

        navigation.navigate(
  RootStackScreenNames.TeacherMyStudents
);

      },

    },

    {
      title: "Attendance",

      subtitle:
        "Take and view attendance for your classes.",

      icon:
        "calendar-check",

      iconBackground:
        "#FFF6DF",

      iconColor:
        "#B7791F",

      section:
        "Teaching",

      onPress: () => {

        navigation.navigate(RootStackScreenNames.TeacherAttendance);

      },

    },

    /* ========================================================
       ACADEMIC WORK
    ======================================================== */

    {
      title: "Assignments",

      subtitle:
        "Create and manage assignments.",

      icon:
        "clipboard-text-outline",

      iconBackground:
        "#F1EEFF",

      iconColor:
        "#6D4AFF",

      section:
        "Academic Work",

      onPress: () => {

        comingSoon(
          "Assignments module coming next."
        );

      },

    },

    {
      title: "Exams & Marks",

      subtitle:
        "Enter and manage examination marks.",

      icon:
        "file-document-edit-outline",

      iconBackground:
        "#EEF6FF",

      iconColor:
        "#2775CA",

      section:
        "Academic Work",

      onPress: () => {

        navigation.navigate(RootStackScreenNames.TeacherMarksEntry);

      },

    },

    {
      title: "Timetable",

      subtitle:
        "View your teaching timetable.",

      icon:
        "timetable",

      iconBackground:
        "#FFF5ED",

      iconColor:
        "#C55A11",

      section:
        "Academic Work",

      onPress: () => {

        navigation.navigate(RootStackScreenNames.TeacherTimetable);

      },

    },

    /* ========================================================
       SCHOOL
    ======================================================== */

    {
      title: "My Attendance",

      subtitle:
        "View your attendance records.",

      icon:
        "message-text-outline",

      iconBackground:
        "#FFF0F0",

      iconColor:
        "#D64545",

      section:
        "School",

      onPress: () => {

       navigation.navigate(RootStackScreenNames.TeacherMyAttendance);

      },

    },

    {
      title: "My Profile",

      subtitle:
        "View your teacher profile.",

      icon:
        "account-circle-outline",

      iconBackground:
        "#EEF2FF",

      iconColor:
        "#4F46E5",

      section:
        "School",

      onPress: () => {

        navigation.navigate(RootStackScreenNames.TeacherProfile);

      },

    },

    {
      title: "My Leaves",
      subtitle: "View your leave requests.",
      icon: "calendar-clock-outline",
      iconBackground: "#F0F0F0",
      iconColor: "#666666",
      section: "School",
      onPress: () => {
        navigation.navigate(RootStackScreenNames.TeacherLeave);
      },
    }

  ];

  /* ==========================================================
     GROUP TILES
  ========================================================== */

  const groupedTiles =
    useMemo(() => {

      const sections = [

        "Teaching",
        "Academic Work",
        "School",

      ] as const;

      return sections.map(
        section => ({

          section,

          items:
            tiles.filter(
              tile =>
                tile.section ===
                section
            ),

        })
      );

    }, []);

  /* ==========================================================
     HEADER
  ========================================================== */

  const renderHeader = () => {

    return (
      <View>

        {/* ==================================================
            TOP NAVBAR
        ================================================== */}

        <View
          style={[
            styles.platformHeader,

            isDesktop &&
              styles.platformHeaderDesktop,
          ]}
        >

          {/* BRAND */}

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
              icon="school"
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
                numberOfLines={1}
              >
                {user.schoolName ||
                  "School Platform"}
              </Text>

              <Text
                style={
                  styles.platformSubtitle
                }
              >
                Teacher Portal
              </Text>

            </View>

          </View>

          {/* ACTIONS */}

          <View
            style={
              styles.platformActions
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

                comingSoon(
                  "Dashboard refresh will be available when reports are connected."
                );

              }}
              style={
                styles.refreshButton
              }
            />

            {/* PROFILE */}

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
                    {user.name ||
                      "Teacher"}
                  </Text>

                  <Text
                    style={
                      styles.profileRole
                    }
                  >
                    Teacher
                  </Text>

                </View>

              ) : null}

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

        {/* ==================================================
            GREETING
        ================================================== */}

        <View
          style={
            styles.dashboardHeading
          }
        >

          <Text
            style={
              styles.greeting
            }
          >
            Good {getGreeting()},{" "}
            {getFirstName(
              user.name
            )} 👋
          </Text>

          <Text
            style={
              styles.pageTitle
            }
          >
            Teacher Dashboard
          </Text>

          <Text
            style={
              styles.pageSubtitle
            }
          >
            Manage your classes, students,
            attendance, assignments and
            academic work from one place.
          </Text>

        </View>

        {/* ==================================================
            TEACHER HERO
        ================================================== */}

        <Card
          style={
            styles.teacherHero
          }
        >

          <Card.Content>

            <View
              style={
                styles.teacherHeroRow
              }
            >

              <View
                style={
                  styles.teacherHeroText
                }
              >

                <Text
                  style={
                    styles.teacherHeroEyebrow
                  }
                >
                  TEACHER PORTAL
                </Text>

                <Text
                  style={
                    styles.teacherHeroTitle
                  }
                  numberOfLines={2}
                >
                  Welcome,{" "}
                  {user.name ||
                    "Teacher"}
                </Text>

                <Text
                  style={
                    styles.teacherHeroSubtitle
                  }
                >
                  {user.designation ||
                    "Teacher"}
                  {user.id
                    ? ` • ${user.id}`
                    : ""}
                </Text>

              </View>

              <View
                style={
                  styles.teacherHeroIconContainer
                }
              >

                <Avatar.Icon
                  size={62}
                  icon="human-male-board"
                  color="#FFFFFF"
                  style={
                    styles.teacherHeroIcon
                  }
                />

              </View>

            </View>

          </Card.Content>

        </Card>

        {/* ==================================================
            QUICK STATS
        ================================================== */}

        <View
          style={
            styles.statsRow
          }
        >

          <StatCard
            title="My Classes"
            value="—"
            icon="google-classroom"
            styles={styles}
          />

          <StatCard
            title="Students"
            value="—"
            icon="account-group"
            styles={styles}
          />

          <StatCard
            title="Subjects"
            value="—"
            icon="book-open-variant"
            styles={styles}
          />

          <StatCard
            title="Attendance"
            value="—"
            icon="calendar-check"
            styles={styles}
          />

        </View>

      </View>
    );

  };

  /* ==========================================================
     SECTION HEADER
  ========================================================== */

  const renderSectionHeading = (
    title: string,
    subtitle: string
  ) => {

    return (
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

  };

  /* ==========================================================
     TILE
  ========================================================== */

  const renderTile = ({
    item,
  }: {
    item: TeacherTile;
  }) => {

    return (
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={
          item.onPress
        }
        style={[
          styles.tileTouchable,

          isDesktop &&
            styles.tileTouchableDesktop,
        ]}
      >

        <Card
          style={
            styles.tile
          }
        >

          <Card.Content>

            <View
              style={
                styles.tileTop
              }
            >

              <Avatar.Icon
                size={48}
                icon={
                  item.icon
                }
                color={
                  item.iconColor
                }
                style={[
                  styles.tileIcon,

                  {
                    backgroundColor:
                      item.iconBackground,
                  },
                ]}
              />

              <Text
                style={
                  styles.tileArrow
                }
              >
                →
              </Text>

            </View>

            <Text
              style={
                styles.tileTitle
              }
              numberOfLines={1}
            >
              {item.title}
            </Text>

            <Text
              style={
                styles.tileSubtitle
              }
              numberOfLines={2}
            >
              {item.subtitle}
            </Text>

          </Card.Content>

        </Card>

      </TouchableOpacity>
    );

  };

  /* ==========================================================
     SECTION
  ========================================================== */

  const renderSection = ({
    section,
    items,
  }: {
    section:
      TeacherTile["section"];

    items:
      TeacherTile[];
  }) => {

    return (
      <View
        style={
          styles.sectionContainer
        }
      >

        {renderSectionHeading(
          section,
          getSectionSubtitle(
            section
          )
        )}

        <View
          style={[
            styles.tilesGrid,

            isSmallScreen &&
              styles.tilesGridMobile,
          ]}
        >

          {items.map(
            item => (

              <View
                key={
                  item.title
                }
                style={[
                  styles.tileWrapper,

                  !isSmallScreen &&
                    styles.tileWrapperDesktop,
                ]}
              >

                {renderTile({
                  item,
                })}

              </View>

            )
          )}

        </View>

      </View>
    );

  };

  /* ==========================================================
     PROFILE DROPDOWN
  ========================================================== */

  const renderProfileDropdown =
    () => {

      if (
        !profileMenuVisible
      ) {
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

                isSmallScreen
                  ? styles.profileDropdownMobile
                  : styles.profileDropdownDesktop,
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
                    {user.name}
                  </Text>

                  <Text
                    style={
                      styles.dropdownUserEmail
                    }
                    numberOfLines={1}
                  >
                    {user.email ||
                      ""}
                  </Text>

                  <Text
                    style={
                      styles.dropdownUserRole
                    }
                  >
                    Teacher
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

                  navigation.navigate(RootStackScreenNames.TeacherProfile);

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
                    View your teacher profile
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
          groupedTiles
        }
        keyExtractor={
          item =>
            item.section
        }
        renderItem={({
          item,
        }) =>
          renderSection(
            item
          )
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
        duration={2500}
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
   STAT CARD
============================================================ */

const StatCard = ({
  title,
  value,
  icon,
  styles,
}: {
  title: string;
  value: string;
  icon: string;
  styles: any;
}) => {

  return (
    <Card
      style={
        styles.statCard
      }
    >

      <Card.Content>

        <View
          style={
            styles.statCardRow
          }
        >

          <Avatar.Icon
            size={36}
            icon={icon}
            color={
              Colors.brandPrimary
            }
            style={
              styles.statIcon
            }
          />

          <View
            style={
              styles.statTextContainer
            }
          >

            <Text
              style={
                styles.statValue
              }
            >
              {value}
            </Text>

            <Text
              style={
                styles.statTitle
              }
            >
              {title}
            </Text>

          </View>

        </View>

      </Card.Content>

    </Card>
  );

};

/* ============================================================
   SECTION SUBTITLES
============================================================ */

const getSectionSubtitle = (
  section:
    | "Teaching"
    | "Academic Work"
    | "School"
) => {

  switch (section) {

    case "Teaching":
      return "Access your assigned classes, students and attendance.";

    case "Academic Work":
      return "Manage assignments, examinations and your timetable.";

    case "School":
      return "Stay connected with parents and manage your profile.";

    default:
      return "";

  }

};

/* ============================================================
   INITIALS
============================================================ */

const getInitials = (
  name?: string | null
) => {

  if (!name) {
    return "T";
  }

  const parts =
    name
      .trim()
      .split(/\s+/)
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

/* ============================================================
   FIRST NAME
============================================================ */

const getFirstName = (
  name?: string | null
) => {

  if (!name) {
    return "Teacher";
  }

  return name
    .trim()
    .split(/\s+/)[0];

};

/* ============================================================
   GREETING
============================================================ */

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
          Metrics.x4,

        paddingBottom:
          Metrics.x8,
      },

      /* ======================================================
         NAVBAR
      ====================================================== */

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
          Metrics.x5,

        elevation: 1,

      },

      platformHeaderDesktop: {
        minHeight: 76,
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

        fontWeight: "800",

        color: "#171717",

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

      /* ======================================================
         PROFILE BUTTON
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

        maxWidth: 150,

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
         HEADING
      ====================================================== */

      dashboardHeading: {

        marginBottom:
          Metrics.x5,

      },

      greeting: {

        fontSize: 14,

        color:
          Colors.subtext,

        fontWeight: "600",

        marginBottom:
          Metrics.x1,

      },

      pageTitle: {

        fontSize: 30,

        fontWeight: "800",

        color: "#171717",

      },

      pageSubtitle: {

        marginTop:
          Metrics.x1,

        fontSize: 14,

        lineHeight: 21,

        color:
          Colors.subtext,

        maxWidth: 700,

      },

      /* ======================================================
         HERO
      ====================================================== */

      teacherHero: {

        marginBottom:
          Metrics.x4,

        borderRadius: 18,

        backgroundColor:
          Colors.brandPrimary,

        elevation: 2,

      },

      teacherHeroRow: {

        flexDirection:
          "row",

        alignItems:
          "center",

        justifyContent:
          "space-between",

      },

      teacherHeroText: {

        flex: 1,

        paddingRight:
          Metrics.x3,

      },

      teacherHeroEyebrow: {

        fontSize: 10,

        fontWeight: "800",

        letterSpacing: 1,

        color:
          "rgba(255,255,255,0.72)",

        marginBottom:
          Metrics.x1,

      },

      teacherHeroTitle: {

        fontSize: 23,

        fontWeight: "800",

        color: "#FFFFFF",

      },

      teacherHeroSubtitle: {

        marginTop:
          Metrics.x1,

        fontSize: 13,

        color:
          "rgba(255,255,255,0.78)",

      },

      teacherHeroIconContainer: {

        width: 72,

        height: 72,

        borderRadius: 20,

        alignItems:
          "center",

        justifyContent:
          "center",

        backgroundColor:
          "rgba(255,255,255,0.14)",

      },

      teacherHeroIcon: {

        backgroundColor:
          "rgba(255,255,255,0.12)",

      },

      /* ======================================================
         STATS
      ====================================================== */

      statsRow: {

        flexDirection:
          "row",

        flexWrap:
          "wrap",

        marginHorizontal:
          -Metrics.x1,

        marginBottom:
          Metrics.x5,

      },

      statCard: {

        flex: 1,

        minWidth: 180,

        marginHorizontal:
          Metrics.x1,

        marginBottom:
          Metrics.x2,

        borderRadius: 16,

        backgroundColor:
          "#FFFFFF",

        borderWidth: 1,

        borderColor:
          "#E9EAF0",

        elevation: 1,

      },

      statCardRow: {

        flexDirection:
          "row",

        alignItems:
          "center",

      },

      statIcon: {

        backgroundColor:
          "#EEF2FF",

      },

      statTextContainer: {

        marginLeft:
          Metrics.x2,

      },

      statValue: {

        fontSize: 21,

        fontWeight: "800",

        color: "#171717",

      },

      statTitle: {

        fontSize: 11,

        color:
          Colors.subtext,

        marginTop: 1,

      },

      /* ======================================================
         SECTIONS
      ====================================================== */

      sectionContainer: {

        marginBottom:
          Metrics.x4,

      },

      sectionHeading: {

        marginBottom:
          Metrics.x3,

        paddingHorizontal:
          Metrics.x1,

      },

      sectionMainTitle: {

        fontSize: 20,

        fontWeight: "800",

        color: "#171717",

      },

      sectionSubtitle: {

        fontSize: 13,

        color:
          Colors.subtext,

        marginTop: 3,

        lineHeight: 19,

      },

      /* ======================================================
         GRID
      ====================================================== */

      tilesGrid: {

        flexDirection:
          "row",

        flexWrap:
          "wrap",

        marginHorizontal:
          -Metrics.x2,

      },

      tilesGridMobile: {

        flexDirection:
          "column",

      },

      tileWrapper: {

        width: "100%",

      },

      tileWrapperDesktop: {

        width: "50%",

      },

      tileTouchable: {

        flex: 1,

        margin:
          Metrics.x2,

      },

      tileTouchableDesktop: {

        flex: 1,

      },

      tile: {

        minHeight: 160,

        backgroundColor:
          "#FFFFFF",

        borderRadius: 18,

        borderWidth: 1,

        borderColor:
          "#E9EAF0",

        elevation: 1,

      },

      tileTop: {

        flexDirection:
          "row",

        alignItems:
          "center",

        justifyContent:
          "space-between",

        marginBottom:
          Metrics.x3,

      },

      tileIcon: {

        margin: 0,

      },

      tileArrow: {

        fontSize: 22,

        color: "#9CA3AF",

      },

      tileTitle: {

        fontSize: 17,

        fontWeight: "800",

        color: "#171717",

      },

      tileSubtitle: {

        fontSize: 13,

        lineHeight: 19,

        color:
          Colors.subtext,

        marginTop:
          Metrics.x1,

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

        position:
          "absolute",

        top: 82,

        right:
          Metrics.x4,

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

        left:
          Metrics.x3,

        right:
          Metrics.x3,

        width: undefined,

      },

      profileDropdownDesktop: {},

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

        color:
          "#D64545",

      },

      logoutTitle: {

        color:
          "#D64545",

      },

      /* ======================================================
         SNACKBAR
      ====================================================== */

      snackbar: {

        backgroundColor:
          Colors.errorBg,

      },

      /* ======================================================
         AUTH
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

export {
  TeacherDashboard,
};