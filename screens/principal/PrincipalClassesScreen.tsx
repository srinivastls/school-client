import React from "react";

import {
  FlatList,
  View,
  Text,
} from "react-native";

import {
  ProgressBar,
  Snackbar,
  TouchableRipple,
  IconButton,
  Avatar,
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
  useQuery,
} from "react-query";

import {
  studentServices,
} from "../../services/studentServices";

import {
  Colors,
  makeStyles,
  Metrics,
} from "../../theme";

import {
  useUserStore,
} from "../../store";

import {
  academicYearServices,
} from "../../services/academicYearServices";
/* ============================================================================
   TYPES
============================================================================ */

type ClassCount = {
  classNumber: string;
  count: string;
};


/* ============================================================================
   SCREEN
============================================================================ */

const PrincipalClassesScreen = () => {

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


  const {
  data: academicYear,
  isLoading: isAcademicYearLoading,
  isError: isAcademicYearError,
} = useQuery(
  [
    "current-academic-year",
  ],
  () =>
    academicYearServices.getCurrentAcademicYear()
);
  const academicYearId =
  academicYear?.id;

  console.log(
    "ACADEMIC YEAR ID:",
    academicYearId
  );


  /* ==========================================================================
     API
  ========================================================================== */

  

  const {
  data,
  isLoading,
  isFetching,
  isError,
  error,
  refetch,
} = useQuery(
  [
    "principal-class-student-counts",
    academicYearId,
  ],
  () =>
    studentServices.getClassStudentCounts(
      academicYearId as string
    ),
  {
    enabled: Boolean(academicYearId),
  }
);


  /* ==========================================================================
     CLASS COUNTS
  ========================================================================== */

  const classCounts: ClassCount[] =
    data?.countData ?? [];


  /* ==========================================================================
     OPEN CLASS
  ========================================================================== */

  const openClass = (
    classNumber: string
  ) => {

    navigation.navigate(
      RootStackScreenNames.PrincipalClassDetails,
      {
        classNumber: classNumber,
      }
    );

  };


  /* ==========================================================================
     RENDER CLASS
  ========================================================================== */

  const renderClass = ({
    item,
  }: {
    item: ClassCount;
  }) => {

    const studentCount =
      Number(item.count);


    return (

      <TouchableRipple
        style={
          styles.classCardWrapper
        }
        rippleColor={
          Colors.brandPrimaryBg
        }
        borderless
        onPress={() => {

          openClass(
            item.classNumber
          );

        }}
      >

        <View
          style={
            styles.classCard
          }
        >

          {/* ================================================================
              ICON
          ================================================================ */}

          <View
            style={
              styles.classIcon
            }
          >

            <Text
              style={
                styles.classIconText
              }
            >
              🎓
            </Text>

          </View>


          {/* ================================================================
              CLASS INFO
          ================================================================ */}

          <Text
            style={
              styles.classTitle
            }
          >
            Class {item.classNumber}
          </Text>


          <Text
            style={
              styles.studentCount
            }
          >
            {studentCount} student
            {studentCount === 1
              ? ""
              : "s"}
          </Text>


          {/* ================================================================
              FOOTER
          ================================================================ */}

          <View
            style={
              styles.cardFooter
            }
          >

            <Text
              style={
                styles.viewText
              }
            >
              View students
            </Text>

            <Text
              style={
                styles.arrow
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
     INITIAL LOADING
  ========================================================================== */

  if (isLoading) {

    return (

      <View
        style={
          styles.container
        }
      >

        {/* ================================================================
            NAVIGATION BAR
        ================================================================ */}

        <View
          style={
            styles.topNav
          }
        >

          <View
            style={
              styles.topNavLeft
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
                styles.navIcon
              }
            />


            <View
              style={
                styles.navBrand
              }
            >

              <Text
                style={
                  styles.navTitle
                }
              >
                Classes
              </Text>

            </View>

          </View>


          <View
            style={
              styles.topNavRight
            }
          >

            <IconButton
              icon="view-dashboard-outline"
              size={21}
              iconColor={
                Colors.brandPrimary
              }
              onPress={() =>
                navigation.navigate(
                  RootStackScreenNames.PrincipalDashboard
                )
              }
              style={
                styles.navIcon
              }
            />

          </View>

        </View>


        <View
          style={
            styles.center
          }
        >

          <ProgressBar
            indeterminate
            color={
              Colors.brandPrimary
            }
            style={
              styles.progress
            }
          />

          <Text
            style={
              styles.loadingText
            }
          >
            Loading classes...
          </Text>

        </View>

      </View>

    );

  }


  /* ==========================================================================
     UI
  ========================================================================== */

  return (

    <View
      style={
        styles.container
      }
    >

      <FlatList
        data={
          classCounts
        }

        renderItem={
          renderClass
        }

        keyExtractor={(item) =>
          item.classNumber
        }

        numColumns={2}

        columnWrapperStyle={
          styles.columnWrapper
        }

        showsVerticalScrollIndicator={
          false
        }

        contentContainerStyle={
          styles.list
        }

        refreshing={
          isFetching
        }

        onRefresh={
          refetch
        }

        /* ================================================================
           HEADER
        ================================================================ */

        ListHeaderComponent={

          <View>

            {/* ============================================================
                TOP NAVIGATION
            ============================================================ */}

            <View
              style={
                styles.topNav
              }
            >

              {/* ==========================================================
                  LEFT
              ========================================================== */}

              <View
                style={
                  styles.topNavLeft
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
                    styles.navIcon
                  }
                />


                <View
                  style={
                    styles.navBrand
                  }
                >

                  <Avatar.Icon
                    size={36}
                    icon="google-classroom"
                    color={
                      Colors.brandPrimary
                    }
                    style={
                      styles.navAvatar
                    }
                  />


                  <Text
                    style={
                      styles.navTitle
                    }
                  >
                    Classes
                  </Text>

                </View>

              </View>


              {/* ==========================================================
                  RIGHT
              ========================================================== */}

              <View
                style={
                  styles.topNavRight
                }
              >

                <IconButton
                  icon="view-dashboard-outline"
                  size={21}
                  iconColor={
                    Colors.brandPrimary
                  }
                  onPress={() =>
                    navigation.navigate(
                      RootStackScreenNames.PrincipalDashboard
                    )
                  }
                  style={
                    styles.navIcon
                  }
                />

              </View>

            </View>


            {/* ============================================================
                SCHOOL / PRINCIPAL HEADER
            ============================================================ */}

            <View
              style={
                styles.schoolHeader
              }
            >

              <Text
                style={
                  styles.schoolName
                }
                numberOfLines={1}
              >
                {user?.schoolName ??
                  "School"}
              </Text>


              {!!user?.schoolCode && (

                <Text
                  style={
                    styles.schoolCode
                  }
                >
                  {user.schoolCode}
                </Text>

              )}


              <Text
                style={
                  styles.welcome
                }
              >
                Welcome,{" "}
                {user?.name ??
                  "Principal"} 👋
              </Text>


              <Text
                style={
                  styles.role
                }
              >
                Principal Administration
              </Text>

            </View>


            {/* ============================================================
                PAGE HEADER
            ============================================================ */}

            <View
              style={
                styles.pageHeader
              }
            >

              <Text
                style={
                  styles.pageTitle
                }
              >
                Classes
              </Text>


              <Text
                style={
                  styles.pageSubtitle
                }
              >
                View classes and student
                counts
              </Text>

            </View>


            {/* ============================================================
                SUMMARY CARD
            ============================================================ */}

            <View
              style={
                styles.summaryCard
              }
            >

              <View
                style={
                  styles.summaryIcon
                }
              >

                <Text
                  style={
                    styles.summaryIconText
                  }
                >
                  🏫
                </Text>

              </View>


              <View
                style={
                  styles.summaryInfo
                }
              >

                <Text
                  style={
                    styles.summaryValue
                  }
                >
                  {classCounts.length}
                </Text>


                <Text
                  style={
                    styles.summaryLabel
                  }
                >
                  Active Classes
                </Text>

              </View>


              <View
                style={
                  styles.summaryDivider
                }
              />


              <View
                style={
                  styles.summaryInfo
                }
              >

                <Text
                  style={
                    styles.summaryValue
                  }
                >
                  {classCounts.reduce(
                    (
                      total,
                      item
                    ) =>
                      total +
                      Number(
                        item.count
                      ),
                    0
                  )}
                </Text>


                <Text
                  style={
                    styles.summaryLabel
                  }
                >
                  Total Students
                </Text>

              </View>

            </View>


            {/* ============================================================
                SECTION TITLE
            ============================================================ */}

            <View
              style={
                styles.sectionHeader
              }
            >

              <Text
                style={
                  styles.sectionTitle
                }
              >
                All Classes
              </Text>


              <Text
                style={
                  styles.sectionSubtitle
                }
              >
                Select a class to view its
                students.
              </Text>

            </View>


            {/* ============================================================
                FETCHING BAR
            ============================================================ */}

            {isFetching ? (

              <ProgressBar
                indeterminate
                color={
                  Colors.brandPrimary
                }
                style={
                  styles.progress
                }
              />

            ) : null}

          </View>
        }


        /* ================================================================
           EMPTY
        ================================================================ */

        ListEmptyComponent={

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

              <Text
                style={
                  styles.emptyIcon
                }
              >
                🏫
              </Text>

            </View>


            <Text
              style={
                styles.emptyTitle
              }
            >
              No classes found
            </Text>


            <Text
              style={
                styles.emptyText
              }
            >
              There are no class records
              available for this school.
            </Text>

          </View>
        }

      />


      {/* =========================================================================
          ERROR
      ========================================================================= */}

      <Snackbar
        visible={
          isError
        }
        onDismiss={() => {}}
        duration={3000}
        style={
          styles.snackbar
        }
      >
        {
          // @ts-ignore
          error?.response?.data?.message ??
            "Unable to load classes"
        }
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
        Metrics.x3,

      paddingBottom:
        Metrics.x6,
    },


    columnWrapper: {
      justifyContent:
        "space-between",
    },


    /* ========================================================================
       TOP NAVIGATION
    ======================================================================== */

    topNav: {
      minHeight: 58,

      marginHorizontal:
        Metrics.x4,

      marginTop:
        Metrics.x3,

      marginBottom:
        Metrics.x2,

      paddingHorizontal:
        Metrics.x2,

      paddingVertical:
        Metrics.x1,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      backgroundColor:
        "#FFFFFF",

      borderRadius:
        15,

      borderWidth: 1,

      borderColor:
        "#E9EAF0",

      elevation: 1,
    },


    topNavLeft: {
      flexDirection:
        "row",

      alignItems:
        "center",

      flex: 1,
    },


    navBrand: {
      flexDirection:
        "row",

      alignItems:
        "center",

      marginLeft:
        Metrics.x1,
    },


    navAvatar: {
      backgroundColor:
        Colors.brandPrimaryBg,

      marginRight:
        Metrics.x2,
    },


    navTitle: {
      fontSize: 16,

      fontWeight:
        "800",

      color:
        "#171717",
    },


    topNavRight: {
      flexDirection:
        "row",

      alignItems:
        "center",
    },


    navIcon: {
      margin: 0,
    },


    /* ========================================================================
       SCHOOL HEADER
    ======================================================================== */

    schoolHeader: {
      marginHorizontal:
        Metrics.x4,

      paddingTop:
        Metrics.x3,

      paddingBottom:
        Metrics.x4,
    },


    schoolName: {
      fontSize: 25,

      fontWeight:
        "800",

      color:
        "#171717",
    },


    schoolCode: {
      fontSize: 12,

      color:
        Colors.subtext,

      marginTop:
        Metrics.x1,
    },


    welcome: {
      fontSize: 16,

      fontWeight:
        "700",

      color:
        "#252525",

      marginTop:
        Metrics.x3,
    },


    role: {
      fontSize: 12,

      color:
        Colors.subtext,

      marginTop:
        Metrics.x1,
    },


    /* ========================================================================
       PAGE HEADER
    ======================================================================== */

    pageHeader: {
      marginHorizontal:
        Metrics.x4,

      marginBottom:
        Metrics.x3,
    },


    pageTitle: {
      fontSize: 27,

      fontWeight:
        "800",

      color:
        "#171717",
    },


    pageSubtitle: {
      fontSize: 13,

      color:
        Colors.subtext,

      marginTop:
        Metrics.x1,

      lineHeight:
        19,
    },


    /* ========================================================================
       SUMMARY CARD
    ======================================================================== */

    summaryCard: {
      marginHorizontal:
        Metrics.x4,

      marginBottom:
        Metrics.x4,

      minHeight: 86,

      padding:
        Metrics.x3,

      flexDirection:
        "row",

      alignItems:
        "center",

      backgroundColor:
        "#FFFFFF",

      borderRadius:
        14,

      borderWidth: 1,

      borderColor:
        "#ECEEF3",

      elevation: 1,
    },


    summaryIcon: {
      width: 48,

      height: 48,

      borderRadius: 14,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        Colors.brandPrimaryBg,
    },


    summaryIconText: {
      fontSize: 24,
    },


    summaryInfo: {
      flex: 1,

      alignItems:
        "center",

      justifyContent:
        "center",
    },


    summaryValue: {
      fontSize: 21,

      fontWeight:
        "800",

      color:
        "#171717",
    },


    summaryLabel: {
      fontSize: 10,

      color:
        Colors.subtext,

      marginTop: 2,
    },


    summaryDivider: {
      width: 1,

      height: 42,

      backgroundColor:
        "#ECEEF3",
    },


    /* ========================================================================
       SECTION
    ======================================================================== */

    sectionHeader: {
      marginHorizontal:
        Metrics.x4,

      marginBottom:
        Metrics.x3,
    },


    sectionTitle: {
      fontSize: 18,

      fontWeight:
        "800",

      color:
        "#171717",
    },


    sectionSubtitle: {
      fontSize: 11,

      color:
        Colors.subtext,

      marginTop: 3,
    },


    /* ========================================================================
       PROGRESS
    ======================================================================== */

    progress: {
      marginHorizontal:
        Metrics.x4,

      marginBottom:
        Metrics.x3,

      borderRadius: 3,
    },


    /* ========================================================================
       CLASS CARD
    ======================================================================== */

    classCardWrapper: {
      width:
        "48.5%",

      marginBottom:
        Metrics.x3,

      borderRadius:
        14,

      overflow:
        "hidden",
    },


    classCard: {
      minHeight:
        178,

      padding:
        Metrics.x3,

      backgroundColor:
        "#FFFFFF",

      borderRadius:
        14,

      borderWidth:
        1,

      borderColor:
        "#ECEEF3",

      elevation:
        1,
    },


    classIcon: {
      width: 50,

      height: 50,

      borderRadius: 15,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        Colors.brandPrimaryBg,

      marginBottom:
        Metrics.x3,
    },


    classIconText: {
      fontSize: 25,
    },


    classTitle: {
      fontSize: 17,

      fontWeight:
        "800",

      color:
        "#171717",
    },


    studentCount: {
      fontSize: 12,

      color:
        Colors.subtext,

      marginTop:
        Metrics.x1,
    },


    /* ========================================================================
       CARD FOOTER
    ======================================================================== */

    cardFooter: {
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

      borderTopWidth:
        1,

      borderTopColor:
        "#F0F1F4",
    },


    viewText: {
      fontSize: 10,

      fontWeight:
        "800",

      color:
        Colors.brandPrimary,
    },


    arrow: {
      fontSize: 16,

      fontWeight:
        "800",

      color:
        Colors.brandPrimary,
    },


    /* ========================================================================
       LOADING
    ======================================================================== */

    center: {
      flex: 1,

      justifyContent:
        "center",

      alignItems:
        "center",

      padding:
        Metrics.x5,
    },


    loadingText: {
      marginTop:
        Metrics.x3,

      color:
        Colors.subtext,
    },


    /* ========================================================================
       EMPTY
    ======================================================================== */

    empty: {
      alignItems:
        "center",

      paddingTop:
        Metrics.x6,

      paddingHorizontal:
        Metrics.x5,
    },


    emptyIconContainer: {
      width: 64,

      height: 64,

      borderRadius: 20,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        "#FFFFFF",

      borderWidth: 1,

      borderColor:
        "#ECEEF3",

      marginBottom:
        Metrics.x3,
    },


    emptyIcon: {
      fontSize: 30,
    },


    emptyTitle: {
      fontSize: 18,

      fontWeight:
        "800",

      color:
        "#171717",
    },


    emptyText: {
      fontSize: 13,

      color:
        Colors.subtext,

      textAlign:
        "center",

      marginTop:
        Metrics.x2,

      lineHeight:
        19,
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
  PrincipalClassesScreen,
};