import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import { FlatList, View, Text, Keyboard } from "react-native";
import { Button, TextInput } from "react-native-paper";
import Snackbar from "react-native-snackbar";
import { ClassList, MonthDropdown, Page, TransactionItem } from "../components";
import { reportServices } from "../services";
import { Colors, makeStyles, Metrics } from "../theme";
import { GetMonthOrDateReportRequest, Transaction } from "../types";

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
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [date, setDate] = useState("");
  const [txns, setTxns] = useState<Transaction[]>([]);
  const [fetchingTxns, setFetchingTxns] = useState(false);

  useEffect(() => {
    if (selectedMonth) {
      setDate("");
    }
  }, [selectedMonth]);

  const onPress = async () => {
    Keyboard.dismiss();
    if (!selectedClass || (!selectedMonth && !date)) {
      Snackbar.show({
        text: "Please select all fields",
        backgroundColor: Colors.errorBg,
        duration: Snackbar.LENGTH_SHORT,
      });
      return;
    }

    if (selectedMonth && date) {
      Snackbar.show({
        text: "Choose only one of month and date",
        backgroundColor: Colors.errorBg,
        duration: Snackbar.LENGTH_SHORT,
      });
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
      const txns = await reportServices.getMonthOrDateReport(payload);
      if (txns.length) {
        setTxns(txns);
      } else {
        setTxns([]);
        Snackbar.show({
          text: "No transactions exist",
          backgroundColor: Colors.errorBg,
          duration: Snackbar.LENGTH_LONG,
        });
      }
    } catch (error) {
      Snackbar.show({
        text:
          //@ts-ignore
          error?.response?.data?.message ??
          "Something went wrong in fetching transactions",
        backgroundColor: Colors.errorBg,
        duration: Snackbar.LENGTH_LONG,
      });
    }
    setFetchingTxns(false);
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

        <Text style={{ textAlign: "center" }}>OR</Text>

        <TextInput
          label={"Date (DD/MM/YYYY)"}
          value={date}
          onChangeText={(text) => {
            setSelectedMonth((selectedMonth) => (text ? null : selectedMonth));
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
    <Page>
      <FlatList
        data={["dummy"]}
        renderItem={renderItem}
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      />
    </Page>
  );
};

const useStyles = makeStyles(() => ({
  marginBottomX5: { marginBottom: Metrics.x5 },
}));

export { MonthOrDateFeeHistory };
