import React, { useState } from "react";

import {
  Card,
  Paragraph,
  ProgressBar,
  Snackbar,
} from "react-native-paper";

import {
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Page } from "../components";

import {
  Colors,
  makeStyles,
  Metrics,
} from "../theme";

import { useQuery } from "react-query";
import {isAdmin} from "../utils";

import { couponServices } from "../services";

import {
  Coupon,
  CouponStatus,
  RootStackParamList,
  RootStackScreenNames,
} from "../types";

import {
  formatToIndianAmount,
} from "../utils";

import { studentServices } from "../services/studentServices";

import { useNavigation } from "@react-navigation/native";

import { NativeStackNavigationProp } from "@react-navigation/native-stack";

const keyExtractor = (coupon: Coupon) => coupon.code;

const CouponCard = ({ item }: { item: Coupon }) => {
  const navigation =
    useNavigation<
      NativeStackNavigationProp<RootStackParamList>
    >();

  const styles = useStyles();

  const [loading, setLoading] = useState(false);

  const [showSnackbar, setShowSnackbar] =
    useState(false);

  const [snackbarText, setSnackbarText] =
    useState("");

  const fetchStudent = async () => {
    if (loading) {
      return;
    }

    setLoading(true);
    setShowSnackbar(false);

    try {
      const studentDetails =
        await studentServices.getStudentByCoupon({
          code: item.code,
        });

      navigation.navigate(
        RootStackScreenNames.StudentDetails,
        {
          // @ts-ignore
          student: studentDetails,
        }
      );
    } catch (error) {
      setSnackbarText(
        // @ts-ignore
        error?.response?.data?.message ??
          "Something went wrong. Please try again later."
      );

      setShowSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  const {
    createdAt,
    code,
    status,
    classNumber,
    discount,
  } = item;

  return (
    <View style={styles.cardContainer}>
      <Card>
        <Card.Content>
          <View style={styles.topRow}>
            <Text style={styles.createdAt}>
              {createdAt}
            </Text>

            <Text
              style={[
                styles.status,
                status === CouponStatus.ACTIVE
                  ? {
                      color: Colors.success,
                      fontWeight: "500",
                    }
                  : {},
              ]}
            >
              {status}
            </Text>
          </View>

          <Paragraph>
            Class {classNumber}
          </Paragraph>

          <Paragraph>
            Discount amount:{" "}
            {formatToIndianAmount(+discount)}
          </Paragraph>

          <View style={styles.couponContainer}>
            <Text
              style={styles.coupon}
              selectable
            >
              {code}
            </Text>

            {isAdmin() &&
            status === CouponStatus.APPLIED ? (
              <TouchableOpacity
                onPress={fetchStudent}
                disabled={loading}
              >
                <Text style={styles.student}>
                  Student details
                </Text>
              </TouchableOpacity>
            ) : (
              <Text />
            )}
          </View>

          {loading ? (
            <ProgressBar
              style={styles.progressBar}
              indeterminate
            />
          ) : null}

          <Snackbar
            visible={showSnackbar}
            onDismiss={() => {
              setShowSnackbar(false);
            }}
            duration={3000}
            style={styles.snackbar}
          >
            {snackbarText}
          </Snackbar>
        </Card.Content>
      </Card>
    </View>
  );
};

const CouponListScreen = () => {
  const {
    data,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useQuery(
    "coupons",
    couponServices.getAllCoupons
  );

  const renderCouponCard = ({
    item,
  }: {
    item: Coupon;
  }) => {
    return <CouponCard item={item} />;
  };

  return (
    <Page
      isLoading={isLoading}
      isError={isError}
      onRetry={refetch}
    >
      <FlatList
        data={data?.coupons ?? []}
        keyExtractor={keyExtractor}
        renderItem={renderCouponCard}
        showsVerticalScrollIndicator={false}
        onRefresh={refetch}
        refreshing={isFetching}
      />
    </Page>
  );
};

const useStyles = makeStyles(() => ({
  cardContainer: {
    marginBottom: Metrics.x4,
    marginHorizontal: 2,
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  createdAt: {
    fontWeight: "600",
  },

  className: {
    marginVertical: Metrics.x2,
  },

  couponContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  coupon: {
    marginTop: Metrics.x2,
    paddingHorizontal: Metrics.x2,
    paddingVertical: Metrics.x1,
    backgroundColor: Colors.brandPrimaryBg,
    borderRadius: 16,
  },

  status: {
    color: Colors.subtext,
  },

  student: {
    marginTop: Metrics.x2,
    paddingVertical: Metrics.x1,
    textDecorationLine: "underline",
    fontSize: 12,
  },

  progressBar: {
    marginTop: Metrics.x2,
    marginBottom: -10,
  },

  snackbar: {
    backgroundColor: Colors.errorBg,
  },
}));

export { CouponListScreen };