import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import dayjs from "dayjs";
import React, { useEffect, useRef, useState } from "react";

import {
  FlatList,
  TextInput as RNTextInput,
} from "react-native";

import {
  ProgressBar,
  Snackbar,
  TextInput,
} from "react-native-paper";

import { useQuery } from "react-query";

import {
  DashboardNavTiles,
  Page,
} from "../components";

import { txnServices } from "../services";
import { studentServices } from "../services/studentServices";

import { Colors, Metrics } from "../theme";

import {
  GetStudentResponse,
  RootStackParamList,
  RootStackScreenNames,
  Student,
} from "../types";

import {
  getDateRangeFromStartOf,
} from "../utils";

/* ============================================================================
   TYPE GUARD
============================================================================ */

const isStudent = (
  data: GetStudentResponse
): data is Student => {
  return (
    !!data &&
    "admissionNo" in data &&
    "name" in data
  );
};

/* ============================================================================
   SEARCH BAR
============================================================================ */

const Searchbar = () => {
  const navigation =
    useNavigation<
      NativeStackNavigationProp<RootStackParamList>
    >();

  const [query, setQuery] = useState("");

  const ref =
    useRef<RNTextInput>(null);

  const [showSnackbar, setShowSnackbar] =
    useState(false);

  const [snackbarText, setSnackbarText] =
    useState("");

  const {
    data,
    isFetching,
    isError,
    refetch,
    error,
    isFetched,
  } = useQuery<GetStudentResponse>(
    ["student", query],
    () =>
      studentServices.getStudentById({
        admissionNo: query.trim(),
      }),
    {
      enabled: false,
      cacheTime: 0,
    }
  );

  /* --------------------------------------------------------------------------
     SEARCH
  -------------------------------------------------------------------------- */

  const onSubmit = () => {
    if (!query.trim()) {
      return;
    }

    setShowSnackbar(false);

    refetch();
  };

  /* --------------------------------------------------------------------------
     SEARCH SUCCESS
  -------------------------------------------------------------------------- */

  useEffect(() => {
    if (
      !isError &&
      data &&
      !isFetching &&
      isStudent(data)
    ) {
      navigation.navigate(
        RootStackScreenNames.StudentDetails,
        {
          student: data,
        }
      );
    }
  }, [
    data,
    isError,
    isFetching,
    navigation,
  ]);

  /* --------------------------------------------------------------------------
     SEARCH ERROR
  -------------------------------------------------------------------------- */

  useEffect(() => {
    if (isFetched && isError) {
      setSnackbarText(
        // @ts-ignore
        error?.response?.data?.message ??
          "Something went wrong. Please try again."
      );

      setShowSnackbar(true);
    }
  }, [
    isError,
    isFetched,
    error,
  ]);

  return (
    <>
      <TextInput
        ref={ref}
        mode="outlined"
        placeholder="Search by Admission No."
        placeholderTextColor={Colors.subtext}
        value={query}
        onChangeText={setQuery}
        right={
          <TextInput.Icon
            icon="account-search"
            onPress={() => {
              ref.current?.blur();
              onSubmit();
            }}
          />
        }
        onSubmitEditing={() => {
          ref.current?.blur();
          onSubmit();
        }}
        autoCapitalize="characters"
        autoCorrect={false}
        style={
          !isFetching
            ? {
                marginBottom: Metrics.x4,
              }
            : undefined
        }
      />

      {isFetching ? (
        <ProgressBar
          color={Colors.brandPrimary}
          indeterminate
          style={{
            marginBottom: Metrics.x4,
            borderRadius: 2,
          }}
        />
      ) : null}

      <Snackbar
        visible={showSnackbar}
        onDismiss={() => {
          setShowSnackbar(false);
        }}
        duration={3000}
        style={{
          backgroundColor: Colors.errorBg,
        }}
      >
        {snackbarText}
      </Snackbar>
    </>
  );
};

/* ============================================================================
   DASHBOARD
============================================================================ */

const Dashboard = () => {
  /* ==========================================================================
     CLASS / STUDENT COUNTS
  ========================================================================== */

  const {
    data: classStudentCounts,
    isLoading: cscLoading,
    isFetching: cscFetching,
    error: cscError,
    refetch: cscRefetch,
  } = useQuery(
    ["classStudentCounts"],
    studentServices.getClassStudentCounts
  );

  /* ==========================================================================
     DAILY TOTAL
  ========================================================================== */

  const {
    data: dailyTotal,
    isFetching: dailyTotalFetching,
    isLoading: dailyTotalLoading,
    error: dailyTotalError,
    refetch: dailyTotalRefetch,
  } = useQuery(
    ["dailyTotal"],
    () =>
      txnServices.getTotalTxnAmount({
        dates: [
          dayjs().format("DD/MM/YYYY"),
        ],
      }),
    {
      enabled: false,
    }
  );

  /* ==========================================================================
     WEEKLY TOTAL
  ========================================================================== */

  const {
    data: weeklyTotal,
    isFetching: weeklyTotalFetching,
    isLoading: weeklyTotalLoading,
    error: weeklyTotalError,
    refetch: weeklyTotalRefetch,
  } = useQuery(
    ["weeklyTotal"],
    () =>
      txnServices.getTotalTxnAmount({
        dates:
          getDateRangeFromStartOf("week"),
      }),
    {
      enabled: false,
    }
  );

  /* ==========================================================================
     MONTHLY TOTAL
  ========================================================================== */

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
        dates:
          getDateRangeFromStartOf("month"),
      }),
    {
      enabled: false,
    }
  );

  /* ==========================================================================
     DASHBOARD SNACKBAR
  ========================================================================== */

  const [showSnackbar, setShowSnackbar] =
    useState(false);

  const [snackbarText, setSnackbarText] =
    useState("");

  /* ==========================================================================
     FETCH DASHBOARD TOTALS
     
     IMPORTANT:
     
     Do NOT check isUserSuperAdmin() here.
     
     Authentication is now handled by the JWT:
     
       JWT
        ↓
       schoolId
        ↓
       backend
        ↓
       current school's data
     
     Principal/Admin can therefore load these totals.
  ========================================================================== */

  const fetchTotals = () => {
    dailyTotalRefetch();
    weeklyTotalRefetch();
    monthlyTotalRefetch();
  };

  /* ==========================================================================
     FETCH TOTALS WHEN DASHBOARD LOADS
  ========================================================================== */

  useEffect(() => {
    fetchTotals();
  }, []);

  /* ==========================================================================
     DASHBOARD QUERY ERRORS
  ========================================================================== */

  useEffect(() => {
    const error =
      cscError ??
      dailyTotalError ??
      weeklyTotalError ??
      monthlyTotalError;

    if (error) {
      setSnackbarText(
        // @ts-ignore
        error?.response?.data?.message ??
          "Something went wrong in fetching dashboard details"
      );

      setShowSnackbar(true);
    }
  }, [
    cscError,
    dailyTotalError,
    weeklyTotalError,
    monthlyTotalError,
  ]);

  /* ==========================================================================
     DASHBOARD CONTENT
  ========================================================================== */

  const renderDashboard = ({
    item,
  }: {
    item: string;
  }) => {
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

        {/*
          Payment tracker can be enabled later.

          The API calls are still retained above so
          existing dashboard functionality is preserved.
        */}

        {/*
        <DashboardPaymentTracker
          dailyTotal={dailyTotal}
          weeklyTotal={weeklyTotal}
          monthlyTotal={monthlyTotal}
        />
        */}

        <DashboardNavTiles
          classStudentsCounts={
            classStudentCounts?.countData ?? []
          }
        />
      </Page>
    );
  };

  /* ==========================================================================
     REFRESHING STATE
  ========================================================================== */

  const refreshing =
    cscFetching ||
    dailyTotalFetching ||
    weeklyTotalFetching ||
    monthlyTotalFetching;

  /* ==========================================================================
     RENDER
  ========================================================================== */

  return (
    <>
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
    </>
  );
};

export { Dashboard };