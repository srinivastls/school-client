import dayjs from "dayjs";

import React, { useEffect, useState } from "react";

import {
  FlatList,
  View,
  Text,
  Keyboard,
} from "react-native";

import {
  Button,
  Snackbar,
  TextInput,
} from "react-native-paper";

import {
  ClassList,
  MonthDropdown,
  Page,
  TransactionItem,
} from "../components";

import { reportServices } from "../services";

import {
  Colors,
  makeStyles,
  Metrics,
} from "../theme";

import {
  GetMonthOrDateReportRequest,
  Transaction,
} from "../types";

const renderTransaction = (txn: Transaction) => {
  return (
    <TransactionItem
      txn={txn}
      key={txn.id}
      student={txn.student}
      showStudentInfo
    />
  );
};

const MonthOrDateFeeHistory = () => {
  const styles = useStyles();

  const [selectedClass, setSelectedClass] =
    useState<string | null>(null);

  const [selectedMonth, setSelectedMonth] =
    useState<string | null>(null);

  const [date, setDate] = useState("");

  const [txns, setTxns] = useState<Transaction[]>([]);

  const [fetchingTxns, setFetchingTxns] =
    useState(false);

  // Snackbar state
  const [snackbarVisible, setSnackbarVisible] =
    useState(false);

  const [snackbarText, setSnackbarText] =
    useState("");

  const showSnackbar = (message: string) => {
    setSnackbarText(message);
    setSnackbarVisible(true);
  };

  useEffect(() => {
    if (selectedMonth) {
      setDate("");
    }
  }, [selectedMonth]);

  const onPress = async () => {
    Keyboard.dismiss();

    if (!selectedClass || (!selectedMonth && !date)) {
      showSnackbar("Please select all fields");
      return;
    }

    if (selectedMonth && date) {
      showSnackbar(
        "Choose only one of month and date"
      );
      return;
    }

    let payload: GetMonthOrDateReportRequest;

    if (selectedMonth) {
      payload = {
        classNumber: selectedClass,
        year: dayjs().year().toString(),
        month: selectedMonth,
      };
    } else {
      payload = {
        classNumber: selectedClass,
        year: dayjs().year().toString(),
        date,
      };
    }

    setFetchingTxns(true);

    try {
      const txns =
        await reportServices.getMonthOrDateReport(
          payload
        );

      if (txns.length) {
        setTxns(txns);
      } else {
        setTxns([]);

        showSnackbar("No transactions exist");
      }
    } catch (error) {
      showSnackbar(
        // @ts-ignore
        error?.response?.data?.message ??
          "Something went wrong in fetching transactions"
      );
    } finally {
      setFetchingTxns(false);
    }
  };

  const renderItem = () => {
    return (
      <>
        <ClassList
          selectedClass={selectedClass}
          setSelectedClass={setSelectedClass}
          zIndex={10000}
        />

        <View style={styles.marginBottomX5} />

        <MonthDropdown
          setSelectedMonth={setSelectedMonth}
          selectedMonth={selectedMonth}
        />

        <View style={styles.marginBottomX5} />

        <Text style={{ textAlign: "center" }}>
          OR
        </Text>

        <TextInput
          label="Date (DD/MM/YYYY)"
          value={date}
          onChangeText={(text) => {
            setSelectedMonth((selectedMonth) =>
              text ? null : selectedMonth
            );

            setDate(text);
          }}
          mode="outlined"
        />

        <View style={styles.marginBottomX5} />

        <Button
          mode="contained"
          onPress={onPress}
          loading={fetchingTxns}
          disabled={fetchingTxns}
        >
          Generate
        </Button>

        <View style={styles.marginBottomX5} />

        {txns.map(renderTransaction)}
      </>
    );
  };

  return (
    <>
      <Page>
        <FlatList
          data={["dummy"]}
          renderItem={renderItem}
          contentContainerStyle={{
            flexGrow: 1,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />
      </Page>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => {
          setSnackbarVisible(false);
        }}
        duration={3000}
        style={styles.snackbar}
      >
        {snackbarText}
      </Snackbar>
    </>
  );
};

const useStyles = makeStyles(() => ({
  marginBottomX5: {
    marginBottom: Metrics.x5,
  },

  snackbar: {
    backgroundColor: Colors.errorBg,
  },
}));

export { MonthOrDateFeeHistory };