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

type PrincipalTile = {
  title: string;

  subtitle: string;

  icon: string;

  iconBackground: string;

  iconColor: string;

  section:
    | "People & Users"
    | "Academics"
    | "Finance"
    | "Administration"
    | "Communication";

  onPress: () => void;
};


/* ============================================================
   COMPONENT
============================================================ */

const PrincipalDashboard = () => {

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
      state =>
        state.user
    );

  const logout =
    useUserStore(
      state =>
        state.logout
    );


  /* ==========================================================
     LOCAL STATE
  ========================================================== */

  const [
    showSnackbar,
    setShowSnackbar,
  ] =
    useState(false);

  const [
    snackbarText,
    setSnackbarText,
  ] =
    useState("");

  const [
    profileMenuVisible,
    setProfileMenuVisible,
  ] =
    useState(false);


  /* ==========================================================
     AUTHORIZATION
  ========================================================== */

  if (!user) {

    return (
      <View
        style={
          styles.center
        }
      >
        <Text
          style={
            styles.errorText
          }
        >
          Session not found.
        </Text>
      </View>
    );

  }


  if (
    user.role !==
    "PRINCIPAL"
  ) {

    return (
      <View
        style={
          styles.center
        }
      >
        <Text
          style={
            styles.errorText
          }
        >
          You are not authorized to
          access the Principal Dashboard.
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

    setSnackbarText(
      message
    );

    setShowSnackbar(
      true
    );

  };


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
     PRINCIPAL TILES
  ========================================================== */

  const tiles: PrincipalTile[] = [

    /* ========================================================
       PEOPLE & USERS
    ======================================================== */

    {
      title: "Students",

      subtitle:
        "View and manage students",

      icon:
        "school-outline",

      iconBackground:
        "#EEF2FF",

      iconColor:
        "#4F46E5",

      section:
        "People & Users",

      onPress: () => {

        navigation.navigate(
          RootStackScreenNames.PrincipalStudents
        );

      },

    },


    {
      title: "Teachers",

      subtitle:
        "Manage school teachers",

      icon:
        "human-male-board",

      iconBackground:
        "#EFFAF5",

      iconColor:
        "#16834B",

      section:
        "People & Users",

      onPress: () => {

        navigation.navigate(
          RootStackScreenNames.PrincipalTeachers
        );

      },

    },


    {
      title: "Parents",

      subtitle:
        "Manage parent accounts",

      icon:
        "account-group",

      iconBackground:
        "#FFF5ED",

      iconColor:
        "#C55A11",

      section:
        "People & Users",

      onPress: () => {

        navigation.navigate(
          RootStackScreenNames.PrincipalParents
        );

      },

    },


    {
      title: "School Admins",

      subtitle:
        "Manage school administrators",

      icon:
        "account-cog",

      iconBackground:
        "#EEF6FF",

      iconColor:
        "#2775CA",

      section:
        "People & Users",

      onPress: () => {

        navigation.navigate(
          RootStackScreenNames.AdminList
        );

      },

    },


    /* ========================================================
       ACADEMICS
    ======================================================== */

    {
      title: "Academic Years",

      subtitle:
        "Create and manage academic years",

      icon:
        "calendar-school",

      iconBackground:
        "#F1EEFF",

      iconColor:
        "#6D4AFF",

      section:
        "Academics",

      onPress: () => {

        navigation.navigate(
          RootStackScreenNames.PrincipalAcademicYearManagement
        );

      },

    },


    {
      title: "Classes",

      subtitle:
        "Manage classes and class structure",

      icon:
        "google-classroom",

      iconBackground:
        "#EEF2FF",

      iconColor:
        "#4F46E5",

      section:
        "Academics",

      onPress: () => {

        navigation.navigate(
          RootStackScreenNames.PrincipalClasses
        );

      },

    },


    {
      title: "Sections",

      subtitle:
        "Manage sections for each class",

      icon:
        "view-grid-outline",

      iconBackground:
        "#EEF6FF",

      iconColor:
        "#2775CA",

      section:
        "Academics",

      onPress: () => {

        // navigation.navigate(
        //   RootStackScreenNames.PrincipalClassDetails
        // );

      },

    },


    {
      title: "Class Teachers",

      subtitle:
        "Assign teachers to class sections",

      icon:
        "account-tie",

      iconBackground:
        "#EFFAF5",

      iconColor:
        "#16834B",

      section:
        "Academics",

      onPress: () => {

        navigation.navigate(
          RootStackScreenNames.PrincipalClassTeachers,
        );

      },

    },


    {
      title: "Student Promotion",

      subtitle:
        "Promote students to the next academic year",

      icon:
        "account-arrow-up-outline",

      iconBackground:
        "#FFF5ED",

      iconColor:
        "#C55A11",

      section:
        "Academics",

      onPress: () => {

        // navigation.navigate(
        //   RootStackScreenNames.PromotionDemotion
        // );

      },

    },


    {
      title: "Academics",

      subtitle:
        "School-wide academic reports",

      icon:
        "book-open-page-variant",

      iconBackground:
        "#F1EEFF",

      iconColor:
        "#6D4AFF",

      section:
        "Academics",

      onPress: () => {

        navigation.navigate(
          RootStackScreenNames.PrincipalAcademics
        );

      },

    },


    /* ========================================================
       FINANCE
    ======================================================== */

    {
      title: "Finance",

      subtitle:
        "School-wide financial reports",

      icon:
        "cash-multiple",

      iconBackground:
        "#EAF8F0",

      iconColor:
        "#16834B",

      section:
        "Finance",

      onPress: () => {

        navigation.navigate(
          RootStackScreenNames.PrincipalFinance
        );

      },

    },


    {
      title: "Fee Collection",

      subtitle:
        "View school fee collection",

      icon:
        "cash-check",

      iconBackground:
        "#FFF6DF",

      iconColor:
        "#B7791F",

      section:
        "Finance",

      onPress: () => {

        navigation.navigate(
          RootStackScreenNames.PrincipalFeeCollection
        );

      },

    },


    /* ========================================================
       ADMINISTRATION
    ======================================================== */

    {
      title: "Complaints",

      subtitle:
        "Manage parent complaints",

      icon:
        "bullhorn-outline",

      iconBackground:
        "#FFF0F0",

      iconColor:
        "#D64545",

      section:
        "Administration",

      onPress: () => {

        comingSoon(
          "Complaint management coming next."
        );

      },

    },


    {
      title: "School Settings",

      subtitle:
        "Configure school settings",

      icon:
        "cog-outline",

      iconBackground:
        "#EEF6FF",

      iconColor:
        "#2775CA",

      section:
        "Administration",

      onPress: () => {

        comingSoon(
          "School settings coming next."
        );

      },

    },


    {
      title: "Audit Logs",

      subtitle:
        "View all user activities",

      icon:
        "shield-search-outline",

      iconBackground:
        "#F1EEFF",

      iconColor:
        "#6D4AFF",

      section:
        "Administration",

      onPress: () => {

        comingSoon(
          "Audit logs coming next."
        );

      },

    },


    /* ========================================================
       COMMUNICATION
    ======================================================== */

    {
      title: "Announcements",

      subtitle:
        "Send school announcements",

      icon:
        "bullhorn",

      iconBackground:
        "#FFF5ED",

      iconColor:
        "#C55A11",

      section:
        "Communication",

      onPress: () => {

        comingSoon(
          "Announcements coming next."
        );

      },

    },

  ];


  /* ==========================================================
     GROUP TILES
  ========================================================== */

  const groupedTiles =
    useMemo(() => {

      const sections = [

        "People & Users",

        "Academics",

        "Finance",

        "Administration",

        "Communication",

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

  const renderHeader =
    () => {

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
                  {
                    user.schoolName ||
                    "School Platform"
                  }
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
                  label={
                    getInitials(
                      user.name
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
                        user.name ||
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
                {getGreeting()}
                ,{" "}
                {getFirstName(
                  user.name
                )} 👋
              </Text>


              <Text
                style={
                  styles.pageTitle
                }
              >
                Principal Dashboard
              </Text>


              <Text
                style={
                  styles.pageSubtitle
                }
              >
                Manage your school,
                people, academics,
                finance and daily
                operations from one place.
              </Text>

            </View>

          </View>


          {/* ==================================================
              SCHOOL INFO HERO
          ================================================== */}

          <Card
            style={
              styles.schoolHero
            }
          >

            <Card.Content>

              <View
                style={
                  styles.schoolHeroRow
                }
              >

                <View
                  style={
                    styles.schoolHeroText
                  }
                >

                  <Text
                    style={
                      styles.schoolHeroEyebrow
                    }
                  >
                    SCHOOL OVERVIEW
                  </Text>


                  <Text
                    style={
                      styles.schoolHeroTitle
                    }
                    numberOfLines={2}
                  >
                    {
                      user.schoolName ||
                      "School"
                    }
                  </Text>


                  <Text
                    style={
                      styles.schoolHeroSubtitle
                    }
                  >
                    School Code:{" "}
                    {
                      user.schoolCode ||
                      "Not available"
                    }
                  </Text>

                </View>


                <View
                  style={
                    styles.schoolHeroIconContainer
                  }
                >

                  <Avatar.Icon
                    size={62}
                    icon="school-outline"
                    color="#FFFFFF"
                    style={
                      styles.schoolHeroIcon
                    }
                  />

                </View>

              </View>

            </Card.Content>

          </Card>

        </View>
      );

    };


  /* ==========================================================
     SECTION HEADER
  ========================================================== */

  const renderSectionHeading =
    (
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

  const renderTile =
    ({
      item,
    }: {
      item: PrincipalTile;
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
                  icon={item.icon}
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
     SECTION LIST
  ========================================================== */

  const renderSection =
    ({
      section,
      items,
    }: {
      section:
        PrincipalTile["section"];

      items:
        PrincipalTile[];
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
                  label={
                    getInitials(
                      user.name
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
                    {user.name}
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

                  comingSoon(
                    "Principal profile coming next."
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
        duration={
          2500
        }
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
   SECTION SUBTITLES
============================================================ */

const getSectionSubtitle = (
  section:
    PrincipalTile["section"]
) => {

  switch (section) {

    case "People & Users":

      return (
        "Manage students, teachers, parents and administrators."
      );


    case "Academics":

      return (
        "Manage academic years, classes, sections, teachers and student progression."
      );


    case "Finance":

      return (
        "Manage school finances and fee collection."
      );


    case "Administration":

      return (
        "Manage school operations, settings and activity."
      );


    case "Communication":

      return (
        "Keep your school community informed."
      );


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
    return "P";
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
    return "Principal";
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


  if (
    hour < 12
  ) {
    return "morning";
  }


  if (
    hour < 17
  ) {
    return "afternoon";
  }


  return "evening";

};


/* ============================================================
   STYLES
============================================================ */

const useStyles =
  makeStyles(() => {

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
         TOP NAVBAR
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
         DASHBOARD HEADING
      ====================================================== */

      dashboardHeading: {
        marginBottom:
          Metrics.x5,
      },


      greetingContainer: {
        flex: 1,
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
         SCHOOL HERO
      ====================================================== */

      schoolHero: {
        marginBottom:
          Metrics.x6,

        borderRadius: 18,

        backgroundColor:
          Colors.brandPrimary,

        elevation: 2,
      },


      schoolHeroRow: {
        flexDirection:
          "row",

        alignItems:
          "center",

        justifyContent:
          "space-between",
      },


      schoolHeroText: {
        flex: 1,

        paddingRight:
          Metrics.x3,
      },


      schoolHeroEyebrow: {
        fontSize: 10,

        fontWeight: "800",

        letterSpacing: 1,

        color:
          "rgba(255,255,255,0.72)",

        marginBottom:
          Metrics.x1,
      },


      schoolHeroTitle: {
        fontSize: 23,

        fontWeight: "800",

        color: "#FFFFFF",
      },


      schoolHeroSubtitle: {
        marginTop:
          Metrics.x1,

        fontSize: 13,

        color:
          "rgba(255,255,255,0.78)",
      },


      schoolHeroIconContainer: {
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


      schoolHeroIcon: {
        backgroundColor:
          "rgba(255,255,255,0.12)",
      },


      /* ======================================================
         SECTION
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
         TILES GRID
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

        color:
          "#9CA3AF",
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

        width:
          undefined,
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

  });


export {
  PrincipalDashboard,
};