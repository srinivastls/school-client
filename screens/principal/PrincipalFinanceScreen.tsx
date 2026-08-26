import React, { useEffect, useMemo, useState } from "react";

import {
  FlatList,
  Text,
  View,
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
  txnServices,
} from "../../services";

import {
  getDateRangeFromStartOf,
} from "../../utils";

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

type CollectionCard = {
  id: string;
  title: string;
  amount: number;
  subtitle: string;
  icon: string;
};

type FinanceReport = {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  message: string;
};


/* ============================================================
   HELPERS
============================================================ */

const toAmount = (
  value: unknown
): number => {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return 0;
  }

  return amount;
};


const formatAmount = (
  value: unknown
): string => {
  return `₹${toAmount(value).toLocaleString(
    "en-IN"
  )}`;
};


/* ============================================================
   SCREEN
============================================================ */

const PrincipalFinanceScreen = () => {

  const styles = useStyles();

  /* ==========================================================
     NAVIGATION
  ========================================================== */

  const navigation =
    useNavigation<
      NativeStackNavigationProp<
        RootStackParamList
      >
    >();


  /* ==========================================================
     USER
  ========================================================== */

  const user = useUserStore(
    (state) => state.user
  );


  /* ==========================================================
     SNACKBAR
  ========================================================== */

  const [
    snackbarVisible,
    setSnackbarVisible,
  ] = useState(false);

  const [
    snackbarMessage,
    setSnackbarMessage,
  ] = useState("");


  const showSnackbar = (
    message: string
  ) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };


  /* ==========================================================
     DAILY COLLECTION
  ========================================================== */

  const {
    data: dailyResponse,
    isLoading: dailyLoading,
    isFetching: dailyFetching,
    error: dailyError,
    refetch: refetchDaily,
  } = useQuery(
    [
      "principal-finance-daily",
    ],

    () =>
      txnServices.getTotalTxnAmount({
        dates: [
          dayjs().format(
            "DD/MM/YYYY"
          ),
        ],
      }),

    {
      staleTime: 60 * 1000,
    }
  );


  /* ==========================================================
     WEEKLY COLLECTION
  ========================================================== */

  const {
    data: weeklyResponse,
    isLoading: weeklyLoading,
    isFetching: weeklyFetching,
    error: weeklyError,
    refetch: refetchWeekly,
  } = useQuery(
    [
      "principal-finance-weekly",
    ],

    () =>
      txnServices.getTotalTxnAmount({
        dates:
          getDateRangeFromStartOf(
            "week"
          ),
      }),

    {
      staleTime: 60 * 1000,
    }
  );


  /* ==========================================================
     MONTHLY COLLECTION
  ========================================================== */

  const {
    data: monthlyResponse,
    isLoading: monthlyLoading,
    isFetching: monthlyFetching,
    error: monthlyError,
    refetch: refetchMonthly,
  } = useQuery(
    [
      "principal-finance-monthly",
    ],

    () =>
      txnServices.getTotalTxnAmount({
        dates:
          getDateRangeFromStartOf(
            "month"
          ),
      }),

    {
      staleTime: 60 * 1000,
    }
  );


  /* ==========================================================
     NORMALIZE API RESPONSE
     
     Your backend returns:
     
     {
       total,
       walletTotal
     }
  ========================================================== */

  const dailyTotal = toAmount(
    (dailyResponse as unknown as {
      total?: unknown;
    } | undefined)?.total
  );

  const dailyWalletTotal = toAmount(
    (dailyResponse as unknown as {
      walletTotal?: unknown;
    } | undefined)?.walletTotal
  );


  const weeklyTotal = toAmount(
    (weeklyResponse as unknown as {
      total?: unknown;
    } | undefined)?.total
  );

  const weeklyWalletTotal = toAmount(
    (weeklyResponse as unknown as {
      walletTotal?: unknown;
    } | undefined)?.walletTotal
  );


  const monthlyTotal = toAmount(
    (monthlyResponse as unknown as {
      total?: unknown;
    } | undefined)?.total
  );

  const monthlyWalletTotal = toAmount(
    (monthlyResponse as unknown as {
      walletTotal?: unknown;
    } | undefined)?.walletTotal
  );


  /* ==========================================================
     ERROR HANDLING
  ========================================================== */

  useEffect(() => {

    const error =
      dailyError ??
      weeklyError ??
      monthlyError;

    if (!error) {
      return;
    }

    const message =
      // @ts-ignore
      error?.response?.data?.message ??
      "Unable to load financial data.";

    showSnackbar(message);

  }, [
    dailyError,
    weeklyError,
    monthlyError,
  ]);


  /* ==========================================================
     LOADING
  ========================================================== */

  const loading =
    dailyLoading ||
    weeklyLoading ||
    monthlyLoading;


  const refreshing =
    dailyFetching ||
    weeklyFetching ||
    monthlyFetching;


  /* ==========================================================
     REFRESH
  ========================================================== */

  const refresh = () => {

    refetchDaily();
    refetchWeekly();
    refetchMonthly();

  };


  /* ==========================================================
     COLLECTION CARDS
  ========================================================== */

  const collectionCards =
    useMemo<CollectionCard[]>(
      () => [

        {
          id: "daily",

          title:
            "Today's Collection",

          amount:
            dailyTotal,

          subtitle:
            dayjs().format(
              "DD MMM YYYY"
            ),

          icon:
            "💰",
        },

        {
          id: "weekly",

          title:
            "Weekly Collection",

          amount:
            weeklyTotal,

          subtitle:
            "Current week",

          icon:
            "📈",
        },

        {
          id: "monthly",

          title:
            "Monthly Collection",

          amount:
            monthlyTotal,

          subtitle:
            dayjs().format(
              "MMMM YYYY"
            ),

          icon:
            "📊",
        },

        {
          id: "wallet",

          title:
            "Wallet Collection",

          amount:
            monthlyWalletTotal,

          subtitle:
            "This month",

          icon:
            "👛",
        },

      ],
      [
        dailyTotal,
        weeklyTotal,
        monthlyTotal,
        monthlyWalletTotal,
      ]
    );


  /* ==========================================================
     REPORTS
  ========================================================== */

  const reports =
    useMemo<FinanceReport[]>(
      () => [

        {
          id: "pending-dues",

          title:
            "Pending Dues",

          subtitle:
            "View students with outstanding fees",

          icon:
            "💳",

          message:
            "Pending dues report is the next Finance module.",
        },

        {
          id: "defaulters",

          title:
            "Defaulters",

          subtitle:
            "View students with unpaid fees",

          icon:
            "⚠️",

          message:
            "Defaulter report is coming next.",
        },

        {
          id: "fee-waivers",

          title:
            "Fee Waivers",

          subtitle:
            "Review and manage fee waivers",

          icon:
            "✅",

          message:
            "Fee waiver management is coming next.",
        },

        {
          id: "coupons",

          title:
            "Coupons",

          subtitle:
            "Review school fee coupons",

          icon:
            "🎟️",

          message:
            "Coupon management is coming next.",
        },

      ],
      []
    );


  /* ==========================================================
     OPEN DASHBOARD
  ========================================================== */

  const openDashboard = () => {

    navigation.navigate(
      RootStackScreenNames.PrincipalDashboard
    );

  };


  /* ==========================================================
     OPEN REPORT
  ========================================================== */

  const openReport = (
    report: FinanceReport
  ) => {

    /*
     * Pending Dues, Defaulters,
     * Fee Waivers and Coupons
     * will be connected one by one.
     *
     * We intentionally don't navigate
     * to non-existing screens.
     */

    // add navigation pending due

    if (report.id === "pending-dues") {
      navigation.navigate(
        RootStackScreenNames.PrincipalPendingDues
      );
      return;
    }

    if (
      report.id === "defaulters"
    ) {
      navigation.navigate(
        RootStackScreenNames.PrincipalDefaulterStudents
      );
      return;
    }

    showSnackbar(
      report.message
    );

  };


  /* ==========================================================
     RENDER COLLECTION CARD
  ========================================================== */

  const renderCollectionCard = ({
    item,
  }: {
    item: CollectionCard;
  }) => {

    return (

      <TouchableRipple
        borderless
        rippleColor={
          Colors.brandPrimaryBg
        }
        style={
          styles.collectionCardWrapper
        }
        onPress={() => {

          if (
            item.id === "daily"
          ) {
            showSnackbar(
              `Today's collection: ${formatAmount(
                dailyTotal
              )}`
            );

            return;
          }

          if (
            item.id === "weekly"
          ) {
            showSnackbar(
              `Weekly collection: ${formatAmount(
                weeklyTotal
              )}`
            );

            return;
          }

          if (
            item.id === "monthly"
          ) {
            showSnackbar(
              `Monthly collection: ${formatAmount(
                monthlyTotal
              )}`
            );

            return;
          }

          if (
            item.id === "wallet"
          ) {
            showSnackbar(
              `Wallet collection this month: ${formatAmount(
                monthlyWalletTotal
              )}`
            );
          }

        }}
      >

        <View
          style={
            styles.collectionCard
          }
        >

          {/* ICON */}

          <View
            style={
              styles.collectionIconContainer
            }
          >

            <Text
              style={
                styles.collectionIcon
              }
            >
              {item.icon}
            </Text>

          </View>


          {/* TITLE */}

          <Text
            style={
              styles.collectionTitle
            }
            numberOfLines={2}
          >
            {item.title}
          </Text>


          {/* AMOUNT */}

          <Text
            style={
              styles.collectionAmount
            }
          >
            {formatAmount(
              item.amount
            )}
          </Text>


          {/* SUBTITLE */}

          <Text
            style={
              styles.collectionSubtitle
            }
          >
            {item.subtitle}
          </Text>

        </View>

      </TouchableRipple>

    );

  };


  /* ==========================================================
     RENDER REPORT
  ========================================================== */

  const renderReport = (
    report: FinanceReport
  ) => {

    return (

      <TouchableRipple
        key={report.id}
        borderless
        rippleColor={
          Colors.brandPrimaryBg
        }
        style={
          styles.reportWrapper
        }
        onPress={() =>
          openReport(report)
        }
      >

        <View
          style={
            styles.reportCard
          }
        >

          {/* ICON */}

          <View
            style={
              styles.reportIconContainer
            }
          >

            <Text
              style={
                styles.reportIcon
              }
            >
              {report.icon}
            </Text>

          </View>


          {/* TEXT */}

          <View
            style={
              styles.reportInfo
            }
          >

            <Text
              style={
                styles.reportTitle
              }
            >
              {report.title}
            </Text>

            <Text
              style={
                styles.reportSubtitle
              }
            >
              {report.subtitle}
            </Text>

          </View>


          {/* ARROW */}

          <Text
            style={
              styles.reportArrow
            }
          >
            →
          </Text>

        </View>

      </TouchableRipple>

    );

  };


  /* ==========================================================
     HEADER
  ========================================================== */

  const renderHeader = () => {

    return (

      <View>

        {/* ======================================================
            TOP NAVIGATION
        ====================================================== */}

        <View
          style={
            styles.topNavigation
          }
        >

          <View
            style={
              styles.topNavigationLeft
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


            <Avatar.Icon
              size={38}
              icon="cash-multiple"
              color={
                Colors.brandPrimary
              }
              style={
                styles.navAvatar
              }
            />


            <View
              style={
                styles.navTextContainer
              }
            >

              <Text
                style={
                  styles.navTitle
                }
              >
                Finance
              </Text>

              <Text
                style={
                  styles.navSubtitle
                }
              >
                Financial Management
              </Text>

            </View>

          </View>


          <IconButton
            icon="view-dashboard-outline"
            size={22}
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

        </View>


        {/* ======================================================
            SCHOOL HEADER
        ====================================================== */}

        <View
          style={
            styles.schoolHeader
          }
        >

          <Text
            style={
              styles.schoolName
            }
            numberOfLines={2}
          >
            {user?.schoolName ??
              "School"}
          </Text>


          {!!user?.schoolCode && (

            <View
              style={
                styles.schoolCodeBadge
              }
            >

              <Text
                style={
                  styles.schoolCodeText
                }
              >
                {user.schoolCode}
              </Text>

            </View>

          )}


          <Text
            style={
              styles.welcomeText
            }
          >
            Welcome,{" "}
            {user?.name ??
              "Principal"} 👋
          </Text>


          <Text
            style={
              styles.roleText
            }
          >
            Principal Administration
          </Text>

        </View>


        {/* ======================================================
            PAGE TITLE
        ====================================================== */}

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
            Finance Overview
          </Text>


          <Text
            style={
              styles.pageSubtitle
            }
          >
            Monitor school-wide collections
            and financial activity.
          </Text>

        </View>


        {/* ======================================================
            LOADING
        ====================================================== */}

        {loading && (

          <ProgressBar
            indeterminate
            color={
              Colors.brandPrimary
            }
            style={
              styles.progressBar
            }
          />

        )}


        {/* ======================================================
            MAIN SUMMARY
        ====================================================== */}

        <View
          style={
            styles.summaryCard
          }
        >

          <View
            style={
              styles.summaryIconContainer
            }
          >

            <Text
              style={
                styles.summaryIcon
              }
            >
              💰
            </Text>

          </View>


          <View
            style={
              styles.summaryMain
            }
          >

            <Text
              style={
                styles.summaryAmount
              }
            >
              {formatAmount(
                monthlyTotal
              )}
            </Text>

            <Text
              style={
                styles.summaryLabel
              }
            >
              Total Collection This Month
            </Text>

          </View>


          <View
            style={
              styles.summarySide
            }
          >

            <Text
              style={
                styles.summarySideAmount
              }
            >
              {formatAmount(
                monthlyWalletTotal
              )}
            </Text>

            <Text
              style={
                styles.summarySideLabel
              }
            >
              Wallet
            </Text>

          </View>

        </View>


        {/* ======================================================
            COLLECTIONS HEADER
        ====================================================== */}

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
            Collections
          </Text>

          <Text
            style={
              styles.sectionSubtitle
            }
          >
            Current collection performance
          </Text>

        </View>

      </View>

    );

  };


  /* ==========================================================
     FOOTER
  ========================================================== */

  const renderFooter = () => {

    return (

      <View
        style={
          styles.reportsSection
        }
      >

        <Text
          style={
            styles.sectionTitle
          }
        >
          Financial Reports
        </Text>


        <Text
          style={
            styles.sectionSubtitle
          }
        >
          Review and manage school
          financial information.
        </Text>


        {reports.map(
          renderReport
        )}

      </View>

    );

  };


  /* ==========================================================
     MAIN UI
  ========================================================== */

  return (

    <View
      style={
        styles.container
      }
    >

      <FlatList
        data={
          collectionCards
        }

        renderItem={
          renderCollectionCard
        }

        keyExtractor={
          (item) => item.id
        }

        numColumns={2}

        columnWrapperStyle={
          styles.columnWrapper
        }

        ListHeaderComponent={
          renderHeader
        }

        ListFooterComponent={
          renderFooter
        }

        refreshing={
          refreshing
        }

        onRefresh={
          refresh
        }

        showsVerticalScrollIndicator={
          false
        }

        contentContainerStyle={
          styles.listContent
        }
      />


      {/* ========================================================
          SNACKBAR
      ======================================================== */}

      <Snackbar
        visible={
          snackbarVisible
        }
        onDismiss={() =>
          setSnackbarVisible(false)
        }
        duration={3000}
        style={
          styles.snackbar
        }
      >
        {snackbarMessage}
      </Snackbar>

    </View>

  );

};


/* ============================================================
   STYLES
============================================================ */

const useStyles = makeStyles(() => ({

  /* ==========================================================
     CONTAINER
  ========================================================== */

  container: {
    flex: 1,

    backgroundColor:
      "#F7F8FC",
  },


  listContent: {
    paddingHorizontal:
      Metrics.x4,

    paddingTop:
      Metrics.x3,

    paddingBottom:
      Metrics.x8,
  },


  columnWrapper: {
    justifyContent:
      "space-between",
  },


  /* ==========================================================
     TOP NAVIGATION
  ========================================================== */

  topNavigation: {
    minHeight: 62,

    flexDirection:
      "row",

    alignItems:
      "center",

    justifyContent:
      "space-between",

    paddingHorizontal:
      Metrics.x2,

    marginBottom:
      Metrics.x4,

    backgroundColor:
      "#FFFFFF",

    borderRadius:
      16,

    borderWidth:
      1,

    borderColor:
      "#E8EAF0",

    elevation: 1,
  },


  topNavigationLeft: {
    flexDirection:
      "row",

    alignItems:
      "center",

    flex: 1,
  },


  navIcon: {
    margin: 0,
  },


  navAvatar: {
    backgroundColor:
      Colors.brandPrimaryBg,

    marginLeft:
      Metrics.x1,
  },


  navTextContainer: {
    marginLeft:
      Metrics.x2,
  },


  navTitle: {
    fontSize: 16,

    fontWeight:
      "800",

    color:
      "#171717",
  },


  navSubtitle: {
    fontSize: 10,

    color:
      Colors.subtext,

    marginTop: 2,
  },


  /* ==========================================================
     SCHOOL HEADER
  ========================================================== */

  schoolHeader: {
    marginBottom:
      Metrics.x5,
  },


  schoolName: {
    fontSize: 25,

    fontWeight:
      "800",

    color:
      "#171717",
  },


  schoolCodeBadge: {
    alignSelf:
      "flex-start",

    paddingHorizontal:
      Metrics.x2,

    paddingVertical:
      Metrics.x1,

    marginTop:
      Metrics.x2,

    borderRadius: 8,

    backgroundColor:
      Colors.brandPrimaryBg,
  },


  schoolCodeText: {
    fontSize: 11,

    fontWeight:
      "700",

    color:
      Colors.brandPrimary,
  },


  welcomeText: {
    marginTop:
      Metrics.x3,

    fontSize: 15,

    fontWeight:
      "700",

    color:
      "#252525",
  },


  roleText: {
    marginTop:
      Metrics.x1,

    fontSize: 12,

    color:
      Colors.subtext,
  },


  /* ==========================================================
     PAGE HEADER
  ========================================================== */

  pageHeader: {
    marginBottom:
      Metrics.x4,
  },


  pageTitle: {
    fontSize: 28,

    fontWeight:
      "800",

    color:
      "#171717",
  },


  pageSubtitle: {
    marginTop:
      Metrics.x1,

    fontSize: 13,

    lineHeight: 19,

    color:
      Colors.subtext,
  },


  progressBar: {
    marginBottom:
      Metrics.x4,

    borderRadius: 4,
  },


  /* ==========================================================
     SUMMARY
  ========================================================== */

  summaryCard: {
    minHeight: 105,

    flexDirection:
      "row",

    alignItems:
      "center",

    padding:
      Metrics.x3,

    marginBottom:
      Metrics.x5,

    backgroundColor:
      "#FFFFFF",

    borderRadius:
      16,

    borderWidth:
      1,

    borderColor:
      "#E8EAF0",

    elevation: 1,
  },


  summaryIconContainer: {
    width: 54,

    height: 54,

    borderRadius: 16,

    alignItems:
      "center",

    justifyContent:
      "center",

    backgroundColor:
      Colors.brandPrimaryBg,
  },


  summaryIcon: {
    fontSize: 26,
  },


  summaryMain: {
    flex: 1,

    marginLeft:
      Metrics.x3,
  },


  summaryAmount: {
    fontSize: 22,

    fontWeight:
      "800",

    color:
      "#171717",
  },


  summaryLabel: {
    fontSize: 11,

    color:
      Colors.subtext,

    marginTop: 3,
  },


  summarySide: {
    alignItems:
      "flex-end",

    paddingLeft:
      Metrics.x3,

    borderLeftWidth: 1,

    borderLeftColor:
      "#ECEEF3",
  },


  summarySideAmount: {
    fontSize: 15,

    fontWeight:
      "800",

    color:
      Colors.brandPrimary,
  },


  summarySideLabel: {
    fontSize: 10,

    color:
      Colors.subtext,

    marginTop: 2,
  },


  /* ==========================================================
     SECTION
  ========================================================== */

  sectionHeader: {
    marginBottom:
      Metrics.x3,
  },


  sectionTitle: {
    fontSize: 19,

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
     COLLECTION CARDS
  ========================================================== */

  collectionCardWrapper: {
    width: "48.5%",

    marginBottom:
      Metrics.x3,

    borderRadius: 16,

    overflow: "hidden",
  },


  collectionCard: {
    minHeight: 178,

    padding:
      Metrics.x3,

    backgroundColor:
      "#FFFFFF",

    borderRadius: 16,

    borderWidth: 1,

    borderColor:
      "#E8EAF0",

    elevation: 1,
  },


  collectionIconContainer: {
    width: 48,

    height: 48,

    borderRadius: 14,

    alignItems:
      "center",

    justifyContent:
      "center",

    backgroundColor:
      Colors.brandPrimaryBg,

    marginBottom:
      Metrics.x3,
  },


  collectionIcon: {
    fontSize: 23,
  },


  collectionTitle: {
    fontSize: 13,

    fontWeight:
      "700",

    color:
      "#252525",

    minHeight: 36,
  },


  collectionAmount: {
    marginTop:
      Metrics.x2,

    fontSize: 21,

    fontWeight:
      "800",

    color:
      "#171717",
  },


  collectionSubtitle: {
    marginTop:
      Metrics.x1,

    fontSize: 10,

    color:
      Colors.subtext,
  },


  /* ==========================================================
     REPORTS
  ========================================================== */

  reportsSection: {
    marginTop:
      Metrics.x5,

    paddingBottom:
      Metrics.x4,
  },


  reportWrapper: {
    marginBottom:
      Metrics.x3,

    borderRadius: 15,

    overflow: "hidden",
  },


  reportCard: {
    minHeight: 78,

    flexDirection:
      "row",

    alignItems:
      "center",

    padding:
      Metrics.x3,

    backgroundColor:
      "#FFFFFF",

    borderRadius: 15,

    borderWidth: 1,

    borderColor:
      "#E8EAF0",

    elevation: 1,
  },


  reportIconContainer: {
    width: 46,

    height: 46,

    borderRadius: 14,

    alignItems:
      "center",

    justifyContent:
      "center",

    backgroundColor:
      Colors.brandPrimaryBg,

    marginRight:
      Metrics.x3,
  },


  reportIcon: {
    fontSize: 21,
  },


  reportInfo: {
    flex: 1,
  },


  reportTitle: {
    fontSize: 15,

    fontWeight:
      "800",

    color:
      "#171717",
  },


  reportSubtitle: {
    fontSize: 11,

    lineHeight: 16,

    color:
      Colors.subtext,

    marginTop:
      Metrics.x1,
  },


  reportArrow: {
    fontSize: 21,

    fontWeight:
      "800",

    color:
      Colors.brandPrimary,

    marginLeft:
      Metrics.x2,
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
  PrincipalFinanceScreen,
};