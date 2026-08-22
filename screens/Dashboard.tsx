import { useNavigation } from "@react-navigation/native";
import dayjs from "dayjs";
import React, { useEffect, useRef, useState } from "react";
import { FlatList, TextInput as RNTextInput } from "react-native";
import { ProgressBar, TextInput } from "react-native-paper";
import Snackbar from "react-native-snackbar";
import { useQuery } from "react-query";
import {
  DashboardNavTiles,
  DashboardPaymentTracker,
  Page,
} from "../components";
import { txnServices } from "../services";
import { studentServices } from "../services/studentServices";
import { Colors, Metrics } from "../theme";
import { RootStackScreenNames } from "../types";
import { getDateRangeFromStartOf, isUserSuperAdmin } from "../utils";

const Searchbar = () => {
  const navigation = useNavigation();
  const [query, setQuery] = useState("");
  const ref = useRef<RNTextInput>(null);

  const onSubmit = () => {
    if (!query) {
      return;
    }
    refetch();
  };

  const { data, isFetching, isError, refetch, error, isFetched } = useQuery(
    ["student", query],
    () => studentServices.getStudentById({ admissionNo: query }),
    {
      enabled: false,
      cacheTime: 0,
    }
  );
  useEffect(() => {
    if (!isError && data && !isFetching) {
      //@ts-ignore
      navigation.navigate(RootStackScreenNames.StudentDetails, {
        student: data,
      });
    }
  }, [data, isError, isFetching]);

  useEffect(() => {
    if (isFetched && isError) {
      Snackbar.show({
        text:
          //@ts-ignore
          error?.response?.data?.message ??
          "Something went wrong. Please try again later.",
        backgroundColor: Colors.errorBg,
        duration: Snackbar.LENGTH_LONG,
      });
    }
  }, [isError, isFetched]);

  return (
    <>
      <TextInput
        ref={ref}
        mode="outlined"
        placeholder={"Search by Admission No."}
        placeholderTextColor={Colors.subtext}
        value={query}
        onChangeText={(text) => {
          setQuery(text);
        }}
        right={
          <TextInput.Icon
            icon="account-search"
            onPress={() => {
              ref.current?.blur();
              onSubmit();
            }}
          />
        }
        onSubmitEditing={(e) => {
          ref.current?.blur();
          onSubmit();
        }}
        autoCapitalize="characters"
        style={!isFetching ? { marginBottom: Metrics.x4 } : {}}
      ></TextInput>
      {isFetching ? (
        <ProgressBar
          color={Colors.brandPrimary}
          indeterminate
          style={{ marginBottom: Metrics.x4, borderRadius: 2 }}
        />
      ) : null}
    </>
  );
};

export { Searchbar };

//should use render method and flatlist since we should not nest flatlist inside scrollview
const Dashboard = () => {
  const {
    data: classStudentCounts,
    isLoading: cscLoading,
    isFetching: cscFetching,
    error: cscError,
    refetch: cscRefetch,
  } = useQuery(["classStudentCounts"], studentServices.getClassStudentCounts);

  const {
    data: dailyTotal,
    isFetching: dailyTotalFetching,
    isLoading: dailyTotalLoading,
    error: dailyTotalError,
    refetch: dailyTotalRefetch,
  } = useQuery(
    ["dailyTotal"],
    () =>
      txnServices.getTotalTxnAmount({ dates: [dayjs().format("DD/MM/YYYY")] }),
    { enabled: false }
  );

  const {
    data: weeklyTotal,
    isFetching: weeklyTotalFetching,
    isLoading: weeklyTotalLoading,
    error: weeklyTotalError,
    refetch: weeklyTotalRefetch,
  } = useQuery(
    ["weeklyTotal"],
    () =>
      txnServices.getTotalTxnAmount({ dates: getDateRangeFromStartOf("week") }),
    { enabled: false }
  );

  const {
    data: monthlyTotal,
    isFetching: monthlyTotalFetching,
    isLoading: monthlyTotalLoading,
    error: monthlyTotalError,
    refetch: monthlyTotalRefetch,
  } = useQuery(
    ["monthlyTotal"],
    () =>
      txnServices.getTotalTxnAmount({
        dates: getDateRangeFromStartOf("month"),
      }),
    { enabled: false }
  );

  const fetchTotals = () => {
    if (isUserSuperAdmin()) {
      dailyTotalRefetch();
      weeklyTotalRefetch();
      monthlyTotalRefetch();
    }
  };

  useEffect(fetchTotals, []);

  useEffect(() => {
    const error =
      cscError ??
      dailyTotalError ??
      weeklyTotalError ??
      monthlyTotalError ??
      undefined;
    if (error) {
      Snackbar.show({
        text:
          //@ts-ignore
          error?.response?.data?.message ??
          "Something went wrong in fetching class details",
        backgroundColor: Colors.errorBg,
        duration: Snackbar.LENGTH_LONG,
      });
    }
  }, [cscError, dailyTotalError, weeklyTotalError, monthlyTotalError]);

  const renderDashboard = ({ item }: any) => {
    return (
      <Page
        isLoading={
          cscLoading ||
          dailyTotalLoading ||
          weeklyTotalLoading ||
          monthlyTotalLoading
        }
      >
        <Searchbar />
        {isUserSuperAdmin() ? (
          <DashboardPaymentTracker
            dailyTotal={dailyTotal}
            weeklyTotal={weeklyTotal}
            monthlyTotal={monthlyTotal}
          />
        ) : null}
        <DashboardNavTiles
          classStudentsCounts={classStudentCounts?.countData ?? []}
        />
      </Page>
    );
  };

  const refreshing =
    cscFetching ||
    dailyTotalFetching ||
    weeklyTotalFetching ||
    monthlyTotalFetching;

  return (
    <FlatList
      showsVerticalScrollIndicator={false}
      data={["dummy"]}
      renderItem={renderDashboard}
      refreshing={refreshing}
      onRefresh={() => {
        cscRefetch();
        fetchTotals();
      }}
    />
  );
};

export { Dashboard };
