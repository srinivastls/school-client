import React, {
  useState,
} from "react";

import {
  Alert,
  FlatList,
  View,
  Text,
  TouchableOpacity,
} from "react-native";

import {
  Avatar,
  IconButton,
  Snackbar,
  TouchableRipple,
} from "react-native-paper";

import {
  useNavigation,
} from "@react-navigation/native";

import {
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


/* ============================================================================
   TYPES
============================================================================ */

type AcademicTile = {
  title: string;
  subtitle: string;
  icon: string;
  accent: string;
  onPress: () => void;
};


/* ============================================================================
   SCREEN
============================================================================ */

const PrincipalAcademicsScreen = () => {

  const styles = useStyles();


  /* ==========================================================================
     NAVIGATION
  ========================================================================== */

  const navigation =
    useNavigation<
      NativeStackNavigationProp<
        RootStackParamList
      >
    >();


  /* ==========================================================================
     USER
  ========================================================================== */

  const user = useUserStore(
    (state) => state.user
  );

  const logout = useUserStore(
    (state) => state.logout
  );


  /* ==========================================================================
     SNACKBAR
  ========================================================================== */

  const [
    showSnackbar,
    setShowSnackbar,
  ] = useState(false);

  const [
    snackbarText,
    setSnackbarText,
  ] = useState("");


  /* ==========================================================================
     PLACEHOLDER
  ========================================================================== */

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


  /* ==========================================================================
     LOGOUT
  ========================================================================== */

  const handleLogout = () => {

    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },

        {
          text: "Logout",
          style: "destructive",

          onPress: async () => {

            try {

              await logout();

              navigation.reset({
                index: 0,

                routes: [
                  {
                    name:
                      RootStackScreenNames.Login,
                  },
                ],
              });

            } catch (error) {

              console.error(
                "LOGOUT ERROR:",
                error
              );

              setSnackbarText(
                "Unable to logout."
              );

              setShowSnackbar(
                true
              );

            }

          },
        },
      ]
    );

  };


  /* ==========================================================================
     DASHBOARD
  ========================================================================== */

  const openDashboard = () => {

    navigation.navigate(
      RootStackScreenNames.PrincipalDashboard
    );

  };


  /* ==========================================================================
     ACADEMIC MODULES
  ========================================================================== */

  const tiles: AcademicTile[] = [

    {
      title: "Attendance",

      subtitle:
        "View class-wise attendance summary",

      icon: "📅",

      accent:
        "#EEF2FF",

      onPress: () => {

        navigation.navigate(
          RootStackScreenNames.PrincipalAttendanceDashboard
        );

      },
    },


    {
      title: "Mark Sheets",

      subtitle:
        "View student academic performance",

      icon: "📝",

      accent:
        "#EEF8F2",

      onPress: () => {

        comingSoon(
          "Mark sheets coming next."
        );

      },
    },


    {
      title: "Results",

      subtitle:
        "View examination results",

      icon: "📊",

      accent:
        "#FFF7E8",

      onPress: () => {

        comingSoon(
          "Results dashboard coming next."
        );

      },
    },


    {
      title: "Pass / Fail",

      subtitle:
        "View pass and fail statistics",

      icon: "📈",

      accent:
        "#F3EEFF",

      onPress: () => {

        comingSoon(
          "Pass/fail statistics coming next."
        );

      },
    },


    {
      title: "Class Performance",

      subtitle:
        "Compare academic performance by class",

      icon: "🏫",

      accent:
        "#EAF7F8",

      onPress: () => {

        comingSoon(
          "Class performance coming next."
        );

      },
    },


    {
      title: "Academic Reports",

      subtitle:
        "View consolidated academic reports",

      icon: "📚",

      accent:
        "#FFF0F0",

      onPress: () => {

        comingSoon(
          "Academic reports coming next."
        );

      },
    },

  ];


  /* ==========================================================================
     TILE
  ========================================================================== */

  const renderTile = ({
    item,
  }: {
    item: AcademicTile;
  }) => {

    return (

      <TouchableRipple
        style={styles.tileWrapper}
        onPress={item.onPress}
        rippleColor={
          Colors.brandPrimaryBg
        }
        borderless
      >

        <View
          style={styles.tile}
        >

          {/* ================================================================
              TILE HEADER
          ================================================================ */}

          <View
            style={
              styles.tileTop
            }
          >

            <View
              style={[
                styles.tileIconContainer,
                {
                  backgroundColor:
                    item.accent,
                },
              ]}
            >

              <Text
                style={styles.icon}
              >
                {item.icon}
              </Text>

            </View>


            <Text
              style={
                styles.tileArrow
              }
            >
              →
            </Text>

          </View>


          {/* ================================================================
              TILE CONTENT
          ================================================================ */}

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
          >
            {item.subtitle}
          </Text>


          {/* ================================================================
              FOOTER
          ================================================================ */}

          <View
            style={
              styles.tileFooter
            }
          >

            <Text
              style={
                styles.openModule
              }
            >
              Open module
            </Text>

            <Text
              style={
                styles.openArrow
              }
            >
              →
            </Text>

          </View>

        </View>

      </TouchableRipple>

    );

  };


  /* ==========================================================================
     UI
  ========================================================================== */

  return (

    <View
      style={styles.container}
    >

      <FlatList
        data={tiles}
        renderItem={renderTile}
        keyExtractor={(item) =>
          item.title
        }
        numColumns={2}
        showsVerticalScrollIndicator={
          false
        }

        contentContainerStyle={
          styles.list
        }

        columnWrapperStyle={
          styles.columnWrapper
        }

        ListHeaderComponent={

          <View>

            {/* ================================================================
                PLATFORM HEADER
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
                  size={44}
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
                  >
                    {user?.schoolName ??
                      "School"}
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

                <IconButton
                  icon="view-dashboard-outline"
                  size={21}
                  iconColor={
                    Colors.brandPrimary
                  }
                  onPress={
                    openDashboard
                  }
                  style={
                    styles.navIcon
                  }
                />


                <IconButton
                  icon="logout"
                  size={21}
                  iconColor={
                    "#D64545"
                  }
                  onPress={
                    handleLogout
                  }
                  style={
                    styles.navIcon
                  }
                />

              </View>

            </View>


            {/* ================================================================
                GREETING
            ================================================================ */}

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
                Welcome,{" "}
                {user?.name ??
                  "Principal"} 👋
              </Text>


              <Text
                style={
                  styles.pageTitle
                }
              >
                Academic Dashboard
              </Text>


              <Text
                style={
                  styles.pageSubtitle
                }
              >
                School-wide academic overview
                and performance insights.
              </Text>

            </View>


            {/* ================================================================
                SCHOOL INFO CARD
            ================================================================ */}

            <View
              style={
                styles.schoolInfoCard
              }
            >

              <View
                style={
                  styles.schoolInfoLeft
                }
              >

                <Avatar.Icon
                  size={42}
                  icon="school-outline"
                  color={
                    Colors.brandPrimary
                  }
                  style={
                    styles.schoolInfoIcon
                  }
                />


                <View
                  style={
                    styles.schoolInfoText
                  }
                >

                  <Text
                    style={
                      styles.schoolInfoName
                    }
                    numberOfLines={1}
                  >
                    {user?.schoolName ??
                      "School"}
                  </Text>


                  {!!user?.schoolCode && (

                    <Text
                      style={
                        styles.schoolInfoCode
                      }
                    >
                      School Code:{" "}
                      {user.schoolCode}
                    </Text>

                  )}

                </View>

              </View>


              <View
                style={
                  styles.principalBadge
                }
              >

                <Text
                  style={
                    styles.principalBadgeText
                  }
                >
                  PRINCIPAL
                </Text>

              </View>

            </View>


            {/* ================================================================
                SECTION HEADING
            ================================================================ */}

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
                Academic Modules
              </Text>


              <Text
                style={
                  styles.sectionSubtitle
                }
              >
                Access academic reports and
                performance tools.
              </Text>

            </View>

          </View>
        }
      />


      {/* =========================================================================
          SNACKBAR
      ========================================================================= */}

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


/* ============================================================================
   STYLES
============================================================================ */

const useStyles = makeStyles(() => {

  return {

    /* ========================================================================
       CONTAINER
    ======================================================================== */

    container: {
      flex: 1,

      backgroundColor:
        "#F7F8FC",
    },


    /* ========================================================================
       LIST
    ======================================================================== */

    list: {
      paddingHorizontal:
        Metrics.x4,

      paddingTop:
        Metrics.x4,

      paddingBottom:
        Metrics.x8,
    },


    columnWrapper: {
      justifyContent:
        "space-between",
    },


    /* ========================================================================
       PLATFORM HEADER
    ======================================================================== */

    platformHeader: {
      display: "none",
      minHeight: 68,

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
      fontSize: 15,

      fontWeight:
        "800",

      color:
        "#171717",
    },


    platformSubtitle: {
      marginTop: 2,

      fontSize: 10,

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


    navIcon: {
      margin: 0,
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
       SCHOOL INFO
    ======================================================================== */

    schoolInfoCard: {
      minHeight: 76,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      padding:
        Metrics.x3,

      marginBottom:
        Metrics.x4,

      borderRadius:
        14,

      backgroundColor:
        "#FFFFFF",

      borderWidth: 1,

      borderColor:
        "#ECEEF3",

      elevation: 1,
    },


    schoolInfoLeft: {
      flexDirection:
        "row",

      alignItems:
        "center",

      flex: 1,

      minWidth: 0,
    },


    schoolInfoIcon: {
      backgroundColor:
        Colors.brandPrimaryBg,
    },


    schoolInfoText: {
      marginLeft:
        Metrics.x2,

      flex: 1,

      minWidth: 0,
    },


    schoolInfoName: {
      fontSize: 14,

      fontWeight:
        "800",

      color:
        "#171717",
    },


    schoolInfoCode: {
      marginTop: 3,

      fontSize: 10,

      color:
        Colors.subtext,
    },


    principalBadge: {
      paddingHorizontal:
        Metrics.x2,

      paddingVertical: 6,

      borderRadius: 8,

      backgroundColor:
        "#EEF8F2",
    },


    principalBadgeText: {
      fontSize: 8,

      fontWeight:
        "900",

      letterSpacing:
        0.5,

      color:
        "#16834B",
    },


    /* ========================================================================
       SECTION HEADING
    ======================================================================== */

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

      marginTop: 3,
    },


    /* ========================================================================
       TILE WRAPPER
    ======================================================================== */

    tileWrapper: {
      width:
        "48.5%",

      marginBottom:
        Metrics.x3,

      borderRadius:
        14,

      overflow:
        "hidden",
    },


    /* ========================================================================
       TILE
    ======================================================================== */

    tile: {
      minHeight:
        190,

      padding:
        Metrics.x3,

      borderRadius:
        14,

      backgroundColor:
        "#FFFFFF",

      borderWidth: 1,

      borderColor:
        "#ECEEF3",

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


    tileIconContainer: {
      width: 48,

      height: 48,

      borderRadius: 14,

      alignItems:
        "center",

      justifyContent:
        "center",
    },


    icon: {
      fontSize: 25,
    },


    tileArrow: {
      fontSize: 20,

      fontWeight:
        "700",

      color:
        Colors.subtext,
    },


    tileTitle: {
      fontSize: 15,

      fontWeight:
        "800",

      color:
        "#171717",
    },


    tileSubtitle: {
      fontSize: 11,

      lineHeight: 17,

      color:
        Colors.subtext,

      marginTop:
        Metrics.x1,

      minHeight: 34,
    },


    /* ========================================================================
       TILE FOOTER
    ======================================================================== */

    tileFooter: {
      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      marginTop:
        Metrics.x3,

      paddingTop:
        Metrics.x2,

      borderTopWidth: 1,

      borderTopColor:
        "#F0F1F4",
    },


    openModule: {
      fontSize: 10,

      fontWeight:
        "800",

      color:
        Colors.brandPrimary,
    },


    openArrow: {
      fontSize: 15,

      fontWeight:
        "800",

      color:
        Colors.brandPrimary,
    },


    /* ========================================================================
       SNACKBAR
    ======================================================================== */

    snackbar: {
      backgroundColor:
        "#252525",

      borderRadius:
        10,
    },

  };

});


export {
  PrincipalAcademicsScreen,
};