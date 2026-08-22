import React, { useState } from "react";
import { Card, Paragraph, ProgressBar } from "react-native-paper";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { Page } from "../components";
import { Colors, makeStyles, Metrics } from "../theme";
import { useQuery } from "react-query";
import { couponServices } from "../services";
import { Coupon, CouponStatus, RootStackScreenNames } from "../types";
import { formatToIndianAmount, isUserSuperAdmin } from "../utils";
import { studentServices } from "../services/studentServices";
import Snackbar from "react-native-snackbar";
import { useNavigation } from "@react-navigation/native";

const keyExtractor = (coupon: Coupon) => coupon.code;

const CouponCard = ({ item }: { item: Coupon }) => {
  const navigation = useNavigation();

  const [loading, setLoading] = useState(false);
  const fetchStudent = async () => {
    setLoading(true);
    try {
      const studentDetails = await studentServices.getStudentByCoupon({
        code: item.code,
      });
      //@ts-ignore
      navigation.navigate(RootStackScreenNames.StudentDetails, {
        student: studentDetails,
      });
    } catch (error) {
      Snackbar.show({
        text:
          //@ts-ignore
          error?.response?.data?.message ??
          "Something went wrong. Please try again later.",
        backgroundColor: Colors.errorBg,
        duration: Snackbar.LENGTH_LONG,
      });
    }
    setLoading(false);
  };

  const styles = useStyles();
  const { createdAt, code, status, classNumber, discount } = item;

  return (
    <View style={styles.cardContainer}>
      <Card>
        <Card.Content>
          <View style={styles.topRow}>
            <Text style={styles.createdAt}>{createdAt}</Text>
            <Text
              style={[
                styles.status,
                status === CouponStatus.ACTIVE
                  ? { color: Colors.success, fontWeight: "500" }
                  : {},
              ]}
            >
              {status}
            </Text>
          </View>
          <Paragraph>Class {classNumber}</Paragraph>
          <Paragraph>
            Discount amount: {formatToIndianAmount(+discount)}
          </Paragraph>
          <View style={styles.couponContainer}>
            <Text style={styles.coupon} selectable>
              {code}
            </Text>
            {isUserSuperAdmin() && status === CouponStatus.APPLIED ? (
              <TouchableOpacity onPress={fetchStudent}>
                <Text style={styles.student}>Student details</Text>
              </TouchableOpacity>
            ) : (
              <Text />
            )}
            {/** hack to overcome 100% width */}
          </View>
          {loading ? (
            <ProgressBar style={styles.progressBar} indeterminate />
          ) : null}
        </Card.Content>
      </Card>
    </View>
  );
};

const CouponListScreen = () => {
  const { data, isLoading, isFetching, isError, refetch } = useQuery(
    "coupons",
    couponServices.getAllCoupons
  );

  const styles = useStyles();
  const renderCouponCard = ({ item }: { item: Coupon }) => {
    return <CouponCard item={item} />;
  };

  return (
    <Page isLoading={isLoading} isError={isError} onRetry={refetch}>
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
  cardContainer: { marginBottom: Metrics.x4, marginHorizontal: 2 },
  topRow: { flexDirection: "row", justifyContent: "space-between" },
  createdAt: { fontWeight: "600" },
  className: { marginVertical: Metrics.x2 },
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
  progressBar: { marginTop: Metrics.x2, marginBottom: -10 },
}));

export { CouponListScreen };
