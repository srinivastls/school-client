import React, { useEffect, useState } from "react";

import {
  FlatList,
  View,
  Text,
} from "react-native";

import {
  ProgressBar,
  Snackbar,
  TouchableRipple,
} from "react-native-paper";

import { useQuery } from "react-query";

import dayjs from "dayjs";

import { txnServices } from "../../services";

import {
  getDateRangeFromStartOf,
} from "../../utils";

import {
  Colors,
  makeStyles,
  Metrics,
} from "../../theme";

type FinanceCard = {
  title: string;
  value: string;
  subtitle: string;
  icon: string;
};

const PrincipalFinanceScreen = () => {
  const styles = useStyles();

  const [showSnackbar, setShowSnackbar] =
    useState(false);

  const [snackbarText, setSnackbarText] =
    useState("");

  /*
   * ============================================================
   * DAILY COLLECTION
   * ============================================================
   */

  const {
    data: dailyTotal,
    isLoading: dailyLoading,
    isFetching: dailyFetching,
    error: dailyError,
    refetch: dailyRefetch,
  } = useQuery(
    ["principal-finance-daily"],
    () =>
      txnServices.getTotalTxnAmount({
        dates: [
          dayjs().format("DD/MM/YYYY"),
        ],
      })
  );

  /*
   * ============================================================
   * WEEKLY COLLECTION
   * ============================================================
   */

  const {
    data: weeklyTotal,
    isLoading: weeklyLoading,
    isFetching: weeklyFetching,
    error: weeklyError,
    refetch: weeklyRefetch,
  } = useQuery(
    ["principal-finance-weekly"],
    () =>
      txnServices.getTotalTxnAmount({
        dates:
          getDateRangeFromStartOf("week"),
      })
  );

  /*
   * ============================================================
   * MONTHLY COLLECTION
   * ============================================================
   */

  const {
    data: monthlyTotal,
    isLoading: monthlyLoading,
    isFetching: monthlyFetching,
    error: monthlyError,
    refetch: monthlyRefetch,
  } = useQuery(
    ["principal-finance-monthly"],
    () =>
      txnServices.getTotalTxnAmount({
        dates:
          getDateRangeFromStartOf("month"),
      })
  );

  /*
   * ============================================================
   * ERROR HANDLING
   * ============================================================
   */

  useEffect(() => {
    const error =
      dailyError ??
      weeklyError ??
      monthlyError;

    if (error) {
      setSnackbarText(
        // @ts-ignore
        error?.response?.data?.message ??
          "Unable to load financial data"
      );

      setShowSnackbar(true);
    }
  }, [
    dailyError,
    weeklyError,
    monthlyError,
  ]);

  /*
   * ============================================================
   * VALUE FORMATTER
   * ============================================================
   */

  const formatAmount = (
    value: unknown
  ) => {
    if (
      value === null ||
      value === undefined
    ) {
      return "₹0";
    }

    const number = Number(value);

    if (Number.isNaN(number)) {
      return `₹${value}`;
    }

    return `₹${number.toLocaleString(
      "en-IN"
    )}`;
  };

  /*
   * ============================================================
   * FINANCE CARDS
   * ============================================================
   *
   * We are using only APIs that already exist.
   *
   * Pending dues / defaulters will be
   * connected when their backend APIs
   * are available.
   */

  const cards: FinanceCard[] = [
    {
      title: "Today's Collection",
      value: formatAmount(
        dailyTotal
      ),
      subtitle: dayjs().format(
        "DD MMM YYYY"
      ),
      icon: "💰",
    },

    {
      title: "Weekly Collection",
      value: formatAmount(
        weeklyTotal
      ),
      subtitle: "Current week",
      icon: "📈",
    },

    {
      title: "Monthly Collection",
      value: formatAmount(
        monthlyTotal
      ),
      subtitle: dayjs().format(
        "MMMM YYYY"
      ),
      icon: "📊",
    },
  ];

  /*
   * ============================================================
   * CARD
   * ============================================================
   */

  const renderCard = ({
    item,
  }: {
    item: FinanceCard;
  }) => {
    return (
      <TouchableRipple
        style={styles.card}
        rippleColor={
          Colors.brandPrimaryBg
        }
        onPress={() => {}}
      >
        <View>
          <Text style={styles.cardIcon}>
            {item.icon}
          </Text>

          <Text style={styles.cardTitle}>
            {item.title}
          </Text>

          <Text style={styles.amount}>
            {item.value}
          </Text>

          <Text style={styles.cardSubtitle}>
            {item.subtitle}
          </Text>
        </View>
      </TouchableRipple>
    );
  };

  /*
   * ============================================================
   * REFRESH
   * ============================================================
   */

  const refreshing =
    dailyFetching ||
    weeklyFetching ||
    monthlyFetching;

  const refresh = () => {
    dailyRefetch();
    weeklyRefetch();
    monthlyRefetch();
  };

  /*
   * ============================================================
   * LOADING
   * ============================================================
   */

  const loading =
    dailyLoading ||
    weeklyLoading ||
    monthlyLoading;

  /*
   * ============================================================
   * UI
   * ============================================================
   */

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Finance
      </Text>

      <Text style={styles.subtitle}>
        School-wide financial overview
      </Text>

      {loading ? (
        <ProgressBar
          indeterminate
          color={Colors.brandPrimary}
          style={styles.progress}
        />
      ) : null}

      <FlatList
        data={cards}
        renderItem={renderCard}
        keyExtractor={(item) =>
          item.title
        }
        numColumns={2}
        columnWrapperStyle={
          styles.columnWrapper
        }
        refreshing={refreshing}
        onRefresh={refresh}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.list
        }
      />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Financial Reports
        </Text>

        <TouchableRipple
          style={styles.report}
          onPress={() => {
            setSnackbarText(
              "Pending dues report coming next."
            );

            setShowSnackbar(true);
          }}
        >
          <View>
            <Text style={styles.reportTitle}>
              💳 Pending Dues
            </Text>

            <Text style={styles.reportSubtitle}>
              View students with outstanding
              fees
            </Text>
          </View>
        </TouchableRipple>

        <TouchableRipple
          style={styles.report}
          onPress={() => {
            setSnackbarText(
              "Defaulter report coming next."
            );

            setShowSnackbar(true);
          }}
        >
          <View>
            <Text style={styles.reportTitle}>
              ⚠️ Defaulters
            </Text>

            <Text style={styles.reportSubtitle}>
              View fee defaulter list
            </Text>
          </View>
        </TouchableRipple>

        <TouchableRipple
          style={styles.report}
          onPress={() => {
            setSnackbarText(
              "Fee waiver management coming next."
            );

            setShowSnackbar(true);
          }}
        >
          <View>
            <Text style={styles.reportTitle}>
              ✅ Fee Waivers
            </Text>

            <Text style={styles.reportSubtitle}>
              Approve or reject fee waivers
            </Text>
          </View>
        </TouchableRipple>

        <TouchableRipple
          style={styles.report}
          onPress={() => {
            setSnackbarText(
              "Coupon management coming next."
            );

            setShowSnackbar(true);
          }}
        >
          <View>
            <Text style={styles.reportTitle}>
              🎟️ Coupons
            </Text>

            <Text style={styles.reportSubtitle}>
              Approve or reject coupon creation
            </Text>
          </View>
        </TouchableRipple>
      </View>

      <Snackbar
        visible={showSnackbar}
        onDismiss={() => {
          setShowSnackbar(false);
        }}
        duration={3000}
        style={{
          backgroundColor:
            Colors.errorBg,
        }}
      >
        {snackbarText}
      </Snackbar>
    </View>
  );
};

/*
 * ==============================================================
 * STYLES
 * ==============================================================
 */

const useStyles = makeStyles(() => {
  return {
    container: {
      flex: 1,
      padding: Metrics.x4,
    },

    title: {
      fontSize: 28,
      fontWeight: "700",
    },

    subtitle: {
      fontSize: 15,
      color: Colors.subtext,
      marginTop: Metrics.x1,
      marginBottom: Metrics.x4,
    },

    progress: {
      marginBottom: Metrics.x3,
      borderRadius: 2,
    },

    list: {
      paddingBottom: Metrics.x3,
    },

    columnWrapper: {
      gap: Metrics.x3,
    },

    card: {
      flex: 1,
      minHeight: 155,
      marginBottom: Metrics.x3,
      borderRadius: Metrics.x3,
      padding: Metrics.x4,
      backgroundColor:
        Colors.brandPrimaryBg,
    },

    cardIcon: {
      fontSize: 28,
      marginBottom: Metrics.x2,
    },

    cardTitle: {
      fontSize: 15,
      fontWeight: "600",
    },

    amount: {
      fontSize: 23,
      fontWeight: "700",
      marginTop: Metrics.x2,
    },

    cardSubtitle: {
      fontSize: 12,
      color: Colors.subtext,
      marginTop: Metrics.x1,
    },

    section: {
      marginTop: Metrics.x3,
    },

    sectionTitle: {
      fontSize: 20,
      fontWeight: "700",
      marginBottom: Metrics.x3,
    },

    report: {
      padding: Metrics.x4,
      borderRadius: Metrics.x3,
      backgroundColor:
        Colors.brandPrimaryBg,
      marginBottom: Metrics.x3,
    },

    reportTitle: {
      fontSize: 16,
      fontWeight: "700",
    },

    reportSubtitle: {
      fontSize: 13,
      color: Colors.subtext,
      marginTop: Metrics.x1,
    },
  };
});

export { PrincipalFinanceScreen };