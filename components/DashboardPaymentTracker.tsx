import React from "react";
import { Text, View } from "react-native";

import { Colors, makeStyles, Metrics } from "../theme";
import { formatToIndianAmount } from "../utils";

const getSafeAmount = (value: unknown): number => {
  if (value === null || value === undefined) {
    return 0;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === "string") {
    const amount = Number(value);
    return Number.isFinite(amount) ? amount : 0;
  }

  if (typeof value === "object") {
    const data = value as any;

    // Handles different possible API response structures
    const amount =
      data.totalAmount ??
      data.total ??
      data.amount ??
      data.data?.totalAmount ??
      data.data?.total ??
      data.data?.amount ??
      data.result?.totalAmount ??
      data.result?.total ??
      0;

    const numericAmount = Number(amount);

    return Number.isFinite(numericAmount)
      ? numericAmount
      : 0;
  }

  return 0;
};

const PaymentTrackerItem = ({
  title,
  paid,
}: {
  title: string;
  paid?: unknown;
}) => {
  const styles = useTrackerItemStyles();

  const amount = getSafeAmount(paid);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      <Text style={styles.paid}>
        Rs. {formatToIndianAmount(amount)}
      </Text>
    </View>
  );
};

const useTrackerItemStyles = makeStyles(() => ({
  container: {
    backgroundColor: Colors.brandPrimaryBg,
    padding: Metrics.x4,
    marginBottom: Metrics.x4,
    borderRadius: Metrics.x3,
  },

  title: {
    marginBottom: Metrics.x3,
  },

  paid: {
    fontSize: 20,
    fontWeight: "bold",
  },

  total: {
    fontSize: 16,
    fontWeight: "500",
  },
}));

const DashboardPaymentTracker = ({
  dailyTotal,
  weeklyTotal,
  monthlyTotal,
}: {
  dailyTotal?: unknown;
  weeklyTotal?: unknown;
  monthlyTotal?: unknown;
}) => {
  return (
    <View>
      <PaymentTrackerItem
        title="Daily"
        paid={dailyTotal}
      />

      <PaymentTrackerItem
        title="Weekly"
        paid={weeklyTotal}
      />

      <PaymentTrackerItem
        title="Monthly"
        paid={monthlyTotal}
      />
    </View>
  );
};

export { DashboardPaymentTracker };