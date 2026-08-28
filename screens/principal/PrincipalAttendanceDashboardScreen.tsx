import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FlatList,
  View,
  Text,
} from "react-native";

import {
  Avatar,
  IconButton,
  ProgressBar,
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
  useQuery,
} from "react-query";

import dayjs from "dayjs";

import {
  attendanceServices,
} from "../../services";

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

type SummaryCard = {
  title: string;
  value: string;
  subtitle: string;
  icon: string;
};


/* ============================================================
   SCREEN
============================================================ */

const PrincipalAttendanceDashboardScreen =
  () => {

    const styles =
      useStyles();


    /* ========================================================
       NAVIGATION
    ======================================================== */

    const navigation =
      useNavigation<
        NativeStackNavigationProp<
          RootStackParamList
        >
      >();


    /* ========================================================
       USER
    ======================================================== */

    const user =
      useUserStore(
        state => state.user
      );


    /* ========================================================
       DATE
    ======================================================== */

    const [
      selectedDate,
      setSelectedDate,
    ] = useState(
      dayjs().format(
        "DD/MM/YYYY"
      )
    );


    /* ========================================================
       SNACKBAR
    ======================================================== */

    const [
      showSnackbar,
      setShowSnackbar,
    ] = useState(false);

    const [
      snackbarText,
      setSnackbarText,
    ] = useState("");


    /* ========================================================
       QUERY
    ======================================================== */

    const {
      data,
      isLoading,
      isFetching,
      error,
      refetch,
    } =
      useQuery(
        [
          "attendance-dashboard",
          selectedDate,
        ],

        () =>
          attendanceServices
            .getAttendanceDashboard(
              selectedDate
            ),

        {
          staleTime:
            30 * 1000,
        }
      );


    /* ========================================================
       ERROR
    ======================================================== */

    useEffect(() => {

      if (!error) {
        return;
      }

      const message =
        (
          error as any
        )?.response?.data
          ?.message ??
        (
          error as any
        )?.message ??
        "Unable to load attendance dashboard.";

      setSnackbarText(
        message
      );

      setShowSnackbar(
        true
      );

    }, [error]);


    /* ========================================================
       DATE NAVIGATION
    ======================================================== */

    const changeDate = (
      amount: number
    ) => {

      const current =
        dayjs(
          selectedDate,
          "DD/MM/YYYY"
        );

      const next =
        current.add(
          amount,
          "day"
        );

      setSelectedDate(
        next.format(
          "DD/MM/YYYY"
        )
      );

    };


    /* ========================================================
       TODAY
    ======================================================== */

    const isToday =
      selectedDate ===
      dayjs().format(
        "DD/MM/YYYY"
      );


    /* ========================================================
       FORMAT %
    ======================================================== */

    const formatPercentage =
      (
        value?: number
      ) => {

        return `${Number(
          value ?? 0
        ).toFixed(1)}%`;

      };


    /* ========================================================
       STUDENT CARDS
    ======================================================== */

    const studentCards =
      useMemo<
        SummaryCard[]
      >(() => {

        const summary =
          data?.students.summary;

        return [

          {
            title:
              "Present",

            value:
              String(
                summary?.present ??
                0
              ),

            subtitle:
              "Students present",

            icon:
              "✅",
          },

          {
            title:
              "Absent",

            value:
              String(
                summary?.absent ??
                0
              ),

            subtitle:
              "Students absent",

            icon:
              "❌",
          },

          {
            title:
              "Late",

            value:
              String(
                summary?.late ??
                0
              ),

            subtitle:
              "Late arrivals",

            icon:
              "⏰",
          },

          {
            title:
              "Half Day",

            value:
              String(
                summary?.halfDay ??
                0
              ),

            subtitle:
              "Half day",

            icon:
              "◐",
          },

        ];

      }, [data]);


    /* ========================================================
       RENDER SUMMARY CARD
    ======================================================== */

    const renderSummaryCard =
      ({
        item,
      }: {
        item: SummaryCard;
      }) => {

        return (

          <View
            style={
              styles.summaryCardWrapper
            }
          >

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
                  {item.icon}
                </Text>

              </View>


              <Text
                style={
                  styles.summaryCardTitle
                }
              >
                {item.title}
              </Text>


              <Text
                style={
                  styles.summaryCardValue
                }
              >
                {item.value}
              </Text>


              <Text
                style={
                  styles.summaryCardSubtitle
                }
              >
                {item.subtitle}
              </Text>

            </View>

          </View>

        );

      };


    /* ========================================================
       REFRESH
    ======================================================== */

    const refreshing =
      isFetching;


    /* ========================================================
       RENDER
    ======================================================== */

    return (

      <View
        style={
          styles.container
        }
      >

        <FlatList
          data={
            studentCards
          }

          renderItem={
            renderSummaryCard
          }

          keyExtractor={
            item =>
              item.title
          }

          numColumns={2}

          columnWrapperStyle={
            styles.columnWrapper
          }

          showsVerticalScrollIndicator={
            false
          }

          refreshing={
            refreshing
          }

          onRefresh={
            () => refetch()
          }

          contentContainerStyle={
            styles.list
          }


          /* ====================================================
             HEADER
          ==================================================== */

          ListHeaderComponent={

            <View>

              {/* ==================================================
                 TOP NAV
              ================================================== */}

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

                    <Avatar.Icon
                      size={36}
                      icon="calendar-check"
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
                      Attendance
                    </Text>

                  </View>

                </View>


                <IconButton
                  icon="refresh"
                  size={21}
                  iconColor={
                    Colors.brandPrimary
                  }
                  onPress={
                    () => refetch()
                  }
                  style={
                    styles.navIcon
                  }
                />

              </View>


              {/* ==================================================
                 SCHOOL
              ================================================== */}

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
                  {
                    user?.schoolName ??
                    "School"
                  }
                </Text>


                {!!user?.schoolCode && (

                  <Text
                    style={
                      styles.schoolCode
                    }
                  >
                    {
                      user.schoolCode
                    }
                  </Text>

                )}


                <Text
                  style={
                    styles.welcome
                  }
                >
                  Welcome,{" "}
                  {
                    user?.name ??
                    "Principal"
                  } 👋
                </Text>


                <Text
                  style={
                    styles.role
                  }
                >
                  Principal Administration
                </Text>

              </View>


              {/* ==================================================
                 PAGE HEADER
              ================================================== */}

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
                  Attendance
                </Text>


                <Text
                  style={
                    styles.pageSubtitle
                  }
                >
                  School-wide attendance
                  overview
                </Text>

              </View>


              {/* ==================================================
                 DATE SELECTOR
              ================================================== */}

              <View
                style={
                  styles.dateCard
                }
              >

                <IconButton
                  icon="chevron-left"
                  size={24}
                  iconColor={
                    Colors.brandPrimary
                  }
                  onPress={() =>
                    changeDate(-1)
                  }
                  style={
                    styles.dateButton
                  }
                />


                <View
                  style={
                    styles.dateInfo
                  }
                >

                  <Text
                    style={
                      styles.dateLabel
                    }
                  >
                    ATTENDANCE DATE
                  </Text>


                  <Text
                    style={
                      styles.dateValue
                    }
                  >
                    {
                      dayjs(
                        selectedDate,
                        "DD/MM/YYYY"
                      ).format(
                        "DD MMM YYYY"
                      )
                    }
                  </Text>


                  {isToday ? (

                    <Text
                      style={
                        styles.todayText
                      }
                    >
                      Today
                    </Text>

                  ) : null}

                </View>


                <IconButton
                  icon="chevron-right"
                  size={24}
                  iconColor={
                    Colors.brandPrimary
                  }
                  onPress={() =>
                    changeDate(1)
                  }
                  style={
                    styles.dateButton
                  }
                />

              </View>


              {/* ==================================================
                 LOADING
              ================================================== */}

              {isLoading ? (

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


              {/* ==================================================
                 STUDENT OVERVIEW
              ================================================== */}

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
                  Student Attendance
                </Text>


                <Text
                  style={
                    styles.sectionSubtitle
                  }
                >
                  Daily student attendance
                  summary
                </Text>

              </View>


              {/* ==================================================
                 ATTENDANCE RATE
              ================================================== */}

              <View
                style={
                  styles.rateCard
                }
              >

                <View
                  style={
                    styles.rateIcon
                  }
                >

                  <Text
                    style={
                      styles.rateIconText
                    }
                  >
                    📊
                  </Text>

                </View>


                <View
                  style={
                    styles.rateInfo
                  }
                >

                  <Text
                    style={
                      styles.rateValue
                    }
                  >
                    {
                      formatPercentage(
                        data
                          ?.students
                          .attendancePercentage
                      )
                    }
                  </Text>


                  <Text
                    style={
                      styles.rateLabel
                    }
                  >
                    Overall Attendance
                  </Text>

                </View>


                <View
                  style={
                    styles.rateRight
                  }
                >

                  <Text
                    style={
                      styles.rateRightValue
                    }
                  >
                    {
                      data
                        ?.students
                        .summary
                        .marked ??
                      0
                    }
                    /
                    {
                      data
                        ?.students
                        .summary
                        .total ??
                      0
                    }
                  </Text>


                  <Text
                    style={
                      styles.rateRightLabel
                    }
                  >
                    Marked
                  </Text>

                </View>

              </View>


              {/* ==================================================
                 UNMARKED WARNING
              ================================================== */}

              {
                (
                  data
                    ?.students
                    .summary
                    .unmarked ??
                  0
                ) > 0 ? (

                  <View
                    style={
                      styles.warningCard
                    }
                  >

                    <Text
                      style={
                        styles.warningIcon
                      }
                    >
                      ⚠️
                    </Text>


                    <View
                      style={
                        styles.warningInfo
                      }
                    >

                      <Text
                        style={
                          styles.warningTitle
                        }
                      >
                        Attendance not fully marked
                      </Text>


                      <Text
                        style={
                          styles.warningSubtitle
                        }
                      >
                        {
                          data
                            ?.students
                            .summary
                            .unmarked ??
                          0
                        } students have no attendance
                        record for this date.
                      </Text>

                    </View>

                  </View>

                ) : null
              }


              {/* ==================================================
                 TEACHER SECTION
              ================================================== */}

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
                  Teacher Attendance
                </Text>


                <Text
                  style={
                    styles.sectionSubtitle
                  }
                >
                  Staff attendance summary
                </Text>

              </View>


              <View
                style={
                  styles.teacherCard
                }
              >

                <View
                  style={
                    styles.teacherStat
                  }
                >

                  <Text
                    style={
                      styles.teacherIcon
                    }
                  >
                    👨‍🏫
                  </Text>


                  <Text
                    style={
                      styles.teacherValue
                    }
                  >
                    {
                      data
                        ?.teachers
                        .summary
                        .present ??
                      0
                    }
                  </Text>


                  <Text
                    style={
                      styles.teacherLabel
                    }
                  >
                    Present
                  </Text>

                </View>


                <View
                  style={
                    styles.teacherDivider
                  }
                />


                <View
                  style={
                    styles.teacherStat
                  }
                >

                  <Text
                    style={
                      styles.teacherIcon
                    }
                  >
                    ❌
                  </Text>


                  <Text
                    style={
                      styles.teacherValue
                    }
                  >
                    {
                      data
                        ?.teachers
                        .summary
                        .absent ??
                      0
                    }
                  </Text>


                  <Text
                    style={
                      styles.teacherLabel
                    }
                  >
                    Absent
                  </Text>

                </View>


                <View
                  style={
                    styles.teacherDivider
                  }
                />


                <View
                  style={
                    styles.teacherStat
                  }
                >

                  <Text
                    style={
                      styles.teacherIcon
                    }
                  >
                    🏖️
                  </Text>


                  <Text
                    style={
                      styles.teacherValue
                    }
                  >
                    {
                      data
                        ?.teachers
                        .summary
                        .onLeave ??
                      0
                    }
                  </Text>


                  <Text
                    style={
                      styles.teacherLabel
                    }
                  >
                    Leave
                  </Text>

                </View>

              </View>


              <View
                style={
                  styles.teacherRate
                }
              >

                <Text
                  style={
                    styles.teacherRateLabel
                  }
                >
                  Teacher attendance rate
                </Text>


                <Text
                  style={
                    styles.teacherRateValue
                  }
                >
                  {
                    formatPercentage(
                      data
                        ?.teachers
                        .attendancePercentage
                    )
                  }
                </Text>

              </View>


              {/* ==================================================
                 CLASS SECTION
              ================================================== */}

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
                  Class-wise Attendance
                </Text>


                <Text
                  style={
                    styles.sectionSubtitle
                  }
                >
                  Attendance percentage by
                  class
                </Text>

              </View>

            </View>
          }


          /* ======================================================
             FOOTER
          ====================================================== */

          ListFooterComponent={

            <View
              style={
                styles.footer
              }
            >

              <Text
                style={
                  styles.sectionTitle
                }
              >
                Section-wise Attendance
              </Text>


              <Text
                style={
                  styles.sectionSubtitle
                }
              >
                Detailed section breakdown
              </Text>


              {
                data?.students
                  .sectionWise
                  .map(
                    section => (

                      <View
                        key={
                          section.sectionId
                        }
                        style={
                          styles.sectionCard
                        }
                      >

                        <View
                          style={
                            styles.sectionCardTop
                          }
                        >

                          <View
                            style={
                              styles.sectionNameBox
                            }
                          >

                            <Text
                              style={
                                styles.sectionClass
                              }
                            >
                              {
                                section
                                  .classDisplayName
                              }
                            </Text>


                            <Text
                              style={
                                styles.sectionName
                              }
                            >
                              Section{" "}
                              {
                                section.sectionName
                              }
                            </Text>

                          </View>


                          <Text
                            style={
                              styles.sectionPercentage
                            }
                          >
                            {
                              formatPercentage(
                                section
                                  .attendancePercentage
                              )
                            }
                          </Text>

                        </View>


                        <View
                          style={
                            styles.sectionStats
                          }
                        >

                          <Text
                            style={
                              styles.sectionStat
                            }
                          >
                            ✅{" "}
                            {
                              section.present
                            }
                          </Text>


                          <Text
                            style={
                              styles.sectionStat
                            }
                          >
                            ❌{" "}
                            {
                              section.absent
                            }
                          </Text>


                          <Text
                            style={
                              styles.sectionStat
                            }
                          >
                            ⏰{" "}
                            {
                              section.late
                            }
                          </Text>


                          <Text
                            style={
                              styles.sectionStat
                            }
                          >
                            👥{" "}
                            {
                              section.totalStudents
                            }
                          </Text>

                        </View>

                      </View>

                    )
                  )
              }


              {/* ==================================================
                 CLASS CARDS
              ================================================== */}

              {
                data?.students
                  .classWise
                  .map(
                    item => (

                      <TouchableRipple
                        key={
                          item.classId
                        }

                        borderless

                        style={
                          styles.classWrapper
                        }

                        rippleColor={
                          Colors.brandPrimaryBg
                        }

                        onPress={() => {}}
                      >

                        <View
                          style={
                            styles.classCard
                          }
                        >

                          <View
                            style={
                              styles.classLeft
                            }
                          >

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
                                🏫
                              </Text>

                            </View>


                            <View
                              style={
                                styles.classInfo
                              }
                            >

                              <Text
                                style={
                                  styles.className
                                }
                              >
                                {
                                  item.displayName
                                }
                              </Text>


                              <Text
                                style={
                                  styles.classDetails
                                }
                              >
                                Present{" "}
                                {
                                  item.present
                                }
                                {"  "}·{"  "}
                                Absent{" "}
                                {
                                  item.absent
                                }
                              </Text>

                            </View>

                          </View>


                          <View
                            style={
                              styles.classRight
                            }
                          >

                            <Text
                              style={
                                styles.classPercentage
                              }
                            >
                              {
                                formatPercentage(
                                  item
                                    .attendancePercentage
                                )
                              }
                            </Text>


                            <Text
                              style={
                                styles.classMarked
                              }
                            >
                              {
                                item.marked
                              }
                              /
                              {
                                item.totalStudents
                              }
                            </Text>

                          </View>

                        </View>

                      </TouchableRipple>

                    )
                  )
              }

            </View>
          }

        />


        {/* ======================================================
           SNACKBAR
        ====================================================== */}

        <Snackbar
          visible={
            showSnackbar
          }

          onDismiss={() =>
            setShowSnackbar(
              false
            )
          }

          duration={3000}

          style={
            styles.snackbar
          }
        >
          {
            snackbarText
          }
        </Snackbar>

      </View>

    );

  };


/* ============================================================
   STYLES
============================================================ */

const useStyles =
  makeStyles(() => ({

    /* ==========================================================
       CONTAINER
    ========================================================== */

    container: {
      flex: 1,
      backgroundColor:
        "#F7F8FC",
    },


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


    /* ==========================================================
       TOP NAV
    ========================================================== */

    topNav: {
      minHeight: 58,

      marginBottom:
        Metrics.x3,

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

      borderWidth:
        1,

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


    navIcon: {
      margin: 0,
    },


    /* ==========================================================
       SCHOOL
    ========================================================== */

    schoolHeader: {
      paddingTop:
        Metrics.x2,

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


    /* ==========================================================
       PAGE HEADER
    ========================================================== */

    pageHeader: {
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

      lineHeight: 19,
    },


    /* ==========================================================
       DATE
    ========================================================== */

    dateCard: {
      minHeight: 76,

      marginBottom:
        Metrics.x4,

      flexDirection:
        "row",

      alignItems:
        "center",

      backgroundColor:
        "#FFFFFF",

      borderRadius: 15,

      borderWidth: 1,

      borderColor:
        "#ECEEF3",

      elevation: 1,
    },


    dateButton: {
      margin: 0,
    },


    dateInfo: {
      flex: 1,

      alignItems:
        "center",

      justifyContent:
        "center",
    },


    dateLabel: {
      fontSize: 9,

      fontWeight:
        "800",

      color:
        Colors.subtext,

      letterSpacing: 0.7,
    },


    dateValue: {
      fontSize: 18,

      fontWeight:
        "800",

      color:
        "#171717",

      marginTop: 2,
    },


    todayText: {
      fontSize: 10,

      fontWeight:
        "700",

      color:
        Colors.brandPrimary,

      marginTop: 2,
    },


    progress: {
      marginBottom:
        Metrics.x3,

      borderRadius: 3,
    },


    /* ==========================================================
       SECTION
    ========================================================== */

    sectionHeader: {
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

      marginBottom:
        Metrics.x3,
    },


    /* ==========================================================
       SUMMARY CARDS
    ========================================================== */

    summaryCardWrapper: {
      width:
        "48.5%",

      marginBottom:
        Metrics.x3,

      borderRadius: 14,

      overflow:
        "hidden",
    },


    summaryCard: {
      minHeight: 155,

      padding:
        Metrics.x3,

      backgroundColor:
        "#FFFFFF",

      borderRadius: 14,

      borderWidth: 1,

      borderColor:
        "#ECEEF3",

      elevation: 1,
    },


    summaryIcon: {
      width: 42,

      height: 42,

      borderRadius: 13,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        Colors.brandPrimaryBg,

      marginBottom:
        Metrics.x2,
    },


    summaryIconText: {
      fontSize: 21,
    },


    summaryCardTitle: {
      fontSize: 12,

      fontWeight:
        "700",

      color:
        "#252525",
    },


    summaryCardValue: {
      fontSize: 25,

      fontWeight:
        "800",

      color:
        "#171717",

      marginTop:
        Metrics.x1,
    },


    summaryCardSubtitle: {
      fontSize: 10,

      color:
        Colors.subtext,

      marginTop: 2,
    },


    /* ==========================================================
       RATE
    ========================================================== */

    rateCard: {
      minHeight: 88,

      marginBottom:
        Metrics.x3,

      padding:
        Metrics.x3,

      flexDirection:
        "row",

      alignItems:
        "center",

      backgroundColor:
        "#FFFFFF",

      borderRadius: 14,

      borderWidth: 1,

      borderColor:
        "#ECEEF3",

      elevation: 1,
    },


    rateIcon: {
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


    rateIconText: {
      fontSize: 23,
    },


    rateInfo: {
      flex: 1,

      marginLeft:
        Metrics.x3,
    },


    rateValue: {
      fontSize: 22,

      fontWeight:
        "800",

      color:
        Colors.brandPrimary,
    },


    rateLabel: {
      fontSize: 11,

      color:
        Colors.subtext,

      marginTop: 2,
    },


    rateRight: {
      alignItems:
        "flex-end",
    },


    rateRightValue: {
      fontSize: 16,

      fontWeight:
        "800",

      color:
        "#171717",
    },


    rateRightLabel: {
      fontSize: 10,

      color:
        Colors.subtext,

      marginTop: 2,
    },


    /* ==========================================================
       WARNING
    ========================================================== */

    warningCard: {
      flexDirection:
        "row",

      alignItems:
        "center",

      padding:
        Metrics.x3,

      marginBottom:
        Metrics.x4,

      backgroundColor:
        "#FFF8E7",

      borderRadius: 14,

      borderWidth: 1,

      borderColor:
        "#F4E2A9",
    },


    warningIcon: {
      fontSize: 23,

      marginRight:
        Metrics.x3,
    },


    warningInfo: {
      flex: 1,
    },


    warningTitle: {
      fontSize: 13,

      fontWeight:
        "800",

      color:
        "#6D5200",
    },


    warningSubtitle: {
      fontSize: 11,

      color:
        "#7B6A35",

      marginTop: 3,

      lineHeight: 16,
    },


    /* ==========================================================
       TEACHER
    ========================================================== */

    teacherCard: {
      minHeight: 105,

      padding:
        Metrics.x3,

      flexDirection:
        "row",

      alignItems:
        "center",

      backgroundColor:
        "#FFFFFF",

      borderRadius: 14,

      borderWidth: 1,

      borderColor:
        "#ECEEF3",

      elevation: 1,
    },


    teacherStat: {
      flex: 1,

      alignItems:
        "center",
    },


    teacherIcon: {
      fontSize: 20,

      marginBottom: 2,
    },


    teacherValue: {
      fontSize: 20,

      fontWeight:
        "800",

      color:
        "#171717",
    },


    teacherLabel: {
      fontSize: 10,

      color:
        Colors.subtext,

      marginTop: 2,
    },


    teacherDivider: {
      width: 1,

      height: 50,

      backgroundColor:
        "#ECEEF3",
    },


    teacherRate: {
      minHeight: 52,

      marginTop:
        Metrics.x3,

      marginBottom:
        Metrics.x4,

      paddingHorizontal:
        Metrics.x3,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      backgroundColor:
        Colors.brandPrimaryBg,

      borderRadius: 12,
    },


    teacherRateLabel: {
      fontSize: 12,

      fontWeight:
        "700",

      color:
        "#252525",
    },


    teacherRateValue: {
      fontSize: 17,

      fontWeight:
        "800",

      color:
        Colors.brandPrimary,
    },


    /* ==========================================================
       CLASS
    ========================================================== */

    classWrapper: {
      marginBottom:
        Metrics.x3,

      borderRadius: 14,

      overflow:
        "hidden",
    },


    classCard: {
      minHeight: 76,

      padding:
        Metrics.x3,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      backgroundColor:
        "#FFFFFF",

      borderRadius: 14,

      borderWidth: 1,

      borderColor:
        "#ECEEF3",

      elevation: 1,
    },


    classLeft: {
      flexDirection:
        "row",

      alignItems:
        "center",

      flex: 1,
    },


    classIcon: {
      width: 43,

      height: 43,

      borderRadius: 13,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        Colors.brandPrimaryBg,

      marginRight:
        Metrics.x3,
    },


    classIconText: {
      fontSize: 20,
    },


    classInfo: {
      flex: 1,
    },


    className: {
      fontSize: 14,

      fontWeight:
        "800",

      color:
        "#171717",
    },


    classDetails: {
      fontSize: 10,

      color:
        Colors.subtext,

      marginTop: 3,
    },


    classRight: {
      alignItems:
        "flex-end",

      marginLeft:
        Metrics.x2,
    },


    classPercentage: {
      fontSize: 17,

      fontWeight:
        "800",

      color:
        Colors.brandPrimary,
    },


    classMarked: {
      fontSize: 10,

      color:
        Colors.subtext,

      marginTop: 2,
    },


    /* ==========================================================
       SECTION
    ========================================================== */

    footer: {
      marginTop:
        Metrics.x2,
    },


    sectionCard: {
      marginBottom:
        Metrics.x3,

      padding:
        Metrics.x3,

      backgroundColor:
        "#FFFFFF",

      borderRadius: 14,

      borderWidth: 1,

      borderColor:
        "#ECEEF3",

      elevation: 1,
    },


    sectionCardTop: {
      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",
    },


    sectionNameBox: {
      flex: 1,
    },


    sectionClass: {
      fontSize: 13,

      fontWeight:
        "700",

      color:
        Colors.subtext,
    },


    sectionName: {
      fontSize: 16,

      fontWeight:
        "800",

      color:
        "#171717",

      marginTop: 2,
    },


    sectionPercentage: {
      fontSize: 18,

      fontWeight:
        "800",

      color:
        Colors.brandPrimary,
    },


    sectionStats: {
      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      marginTop:
        Metrics.x3,

      paddingTop:
        Metrics.x3,

      borderTopWidth: 1,

      borderTopColor:
        "#ECEEF3",
    },


    sectionStat: {
      fontSize: 11,

      color:
        Colors.subtext,

      fontWeight:
        "700",
    },


    /* ==========================================================
       SNACKBAR
    ========================================================== */

    snackbar: {
      backgroundColor:
        "#252525",

      borderRadius: 10,
    },

  }));


export {
  PrincipalAttendanceDashboardScreen,
};