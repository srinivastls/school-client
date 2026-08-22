import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import dayjs from "dayjs";
import React, { useCallback, useRef, useState } from "react";
import { FlatList, View, Text } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { Button } from "react-native-paper";
import Snackbar from "react-native-snackbar";
import { useQueryClient } from "react-query";

import { Page, PaymentForm } from "../components";
import { txnServices } from "../services";
import { useUserStore } from "../store";
import { Colors, makeStyles, Metrics } from "../theme";

import {
  PaymentMode,
  RecordTxnRequest,
  RootStackParamList,
  RootStackScreenNames,
} from "../types";

import { formatToIndianAmount } from "../utils";

const Payment = () => {
  const route =
    useRoute<
      RouteProp<RootStackParamList, RootStackScreenNames.Payment>
    >();

  const { student } = route.params;

  const navigation = useNavigation();

  const styles = useStyles();

  const paymentModes = [
    { label: "Cash", value: PaymentMode.cash },
    { label: "Wallet", value: PaymentMode.wallet },
  ];

  const [selectedPaymentMode, setSelectedPaymentMode] =
    useState<PaymentMode | null>(null);

  const [modeDdOpen, setModeDdOpen] = useState(false);

  const [loading, setLoading] = useState(false);

  const adminId = useUserStore((state) => state.user?.adminId);

  const queryClient = useQueryClient();

  // Safely handle missing fee objects
  const tiePendingAmount = Number(student.tie?.pendingAmount ?? 0);

  const diaryPendingAmount = Number(
    student.diary?.pendingAmount ?? 0
  );

  const beltPendingAmount = Number(
    student.belt?.pendingAmount ?? 0
  );

  const arrearsPendingAmount = Number(
    student.arrears?.pendingAmount ?? 0
  );

  const tuitionPendingAmount = Number(
    student.pendingTuitionFee ?? 0
  );

  const textbookPendingAmount = Number(
    student.pendingTextbookFee ?? 0
  );

  const notebookPendingAmount = Number(
    student.pendingNotebookFee ?? 0
  );

  const totalPendingAmount = Number(
    student.pendingAmount ?? 0
  );

  const amountDetails = useRef<RecordTxnRequest["amountDetails"]>({
    tie: "0",
    diary: "0",
    belt: "0",
    arrears: "0",
    textBookFee: "0",
    noteBookFee: "0",
    tuitionFee: "0",
    other: "0",
  });

  const [totalAmount, setTotalAmount] = useState(0);

  const [isTotalAmountNaN, setIsTotalAmountNaN] =
    useState(false);

  const updateTotal = () => {
    const {
      tie,
      diary,
      belt,
      arrears,
      textBookFee,
      noteBookFee,
      tuitionFee,
      other,
    } = amountDetails.current;

    const total =
      Number(tie || 0) +
      Number(diary || 0) +
      Number(belt || 0) +
      Number(arrears || 0) +
      Number(textBookFee || 0) +
      Number(noteBookFee || 0) +
      Number(tuitionFee || 0) +
      Number(other || 0);

    const isTotalNaN = Number.isNaN(total);

    setIsTotalAmountNaN(isTotalNaN);
    setTotalAmount(isTotalNaN ? 0 : total);
  };

  const onChange = useCallback(
    (updatedDetail: Partial<RecordTxnRequest["amountDetails"]>) => {
      amountDetails.current = {
        ...amountDetails.current,
        ...updatedDetail,
      };

      updateTotal();
    },
    []
  );

  const onPress = async () => {
    if (loading) {
      return;
    }

    if (!selectedPaymentMode) {
      Snackbar.show({
        text: "Please select payment mode",
        backgroundColor: Colors.errorBg,
        duration: Snackbar.LENGTH_SHORT,
      });

      return;
    }

    if (!totalAmount || totalAmount <= 0) {
      Snackbar.show({
        text: "Please enter some amount",
        backgroundColor: Colors.errorBg,
        duration: Snackbar.LENGTH_SHORT,
      });

      return;
    }

    const enteredTieAmount = Number(
      amountDetails.current.tie ?? 0
    );

    const enteredDiaryAmount = Number(
      amountDetails.current.diary ?? 0
    );

    const enteredBeltAmount = Number(
      amountDetails.current.belt ?? 0
    );

    const enteredArrearsAmount = Number(
      amountDetails.current.arrears ?? 0
    );

    const enteredTuitionAmount = Number(
      amountDetails.current.tuitionFee ?? 0
    );

    const enteredTextbookAmount = Number(
      amountDetails.current.textBookFee ?? 0
    );

    const enteredNotebookAmount = Number(
      amountDetails.current.noteBookFee ?? 0
    );

    if (
      enteredTieAmount > tiePendingAmount ||
      enteredDiaryAmount > diaryPendingAmount ||
      enteredBeltAmount > beltPendingAmount ||
      enteredArrearsAmount > arrearsPendingAmount ||
      enteredTuitionAmount > tuitionPendingAmount ||
      enteredTextbookAmount > textbookPendingAmount ||
      enteredNotebookAmount > notebookPendingAmount ||
      totalAmount > totalPendingAmount
    ) {
      Snackbar.show({
        text: "Amount cannot be greater than pending amount",
        backgroundColor: Colors.errorBg,
        duration: Snackbar.LENGTH_SHORT,
      });

      return;
    }

    const payload: RecordTxnRequest = {
      paymentMode: selectedPaymentMode,
      amount: `${totalAmount}`,
      amountDetails: amountDetails.current,
      date: dayjs().format("DD/MM/YYYY"),
      studentAdmissionNo: student.admissionNo,
      adminId: adminId ?? "",
    };

    setLoading(true);

    try {
      const txn = await txnServices.recordTxn(payload);

      Snackbar.show({
        text: "Payment recorded successfully",
        backgroundColor: Colors.successBg,
        duration: Snackbar.LENGTH_SHORT,
      });

      navigation.replace(RootStackScreenNames.Invoice, {
        student,
        transaction: txn,
      });

      queryClient.refetchQueries(["transactions"]);

      queryClient.refetchQueries([
        "student" + student.admissionNo,
      ]);

      queryClient.refetchQueries(["dailyTotal"]);
      queryClient.refetchQueries(["weeklyTotal"]);
      queryClient.refetchQueries(["monthlyTotal"]);
    } catch (error) {
      Snackbar.show({
        text:
          // @ts-ignore
          error?.response?.data?.message ??
          "Something went wrong. Please try again later.",
        backgroundColor: Colors.errorBg,
        duration: Snackbar.LENGTH_LONG,
      });
    } finally {
      setLoading(false);
    }
  };

  const renderItem = () => {
    return (
      <Page>
        <Text style={styles.totalPending}>
          Total pending:{" "}
          {formatToIndianAmount(totalPendingAmount)}
        </Text>

        <DropDownPicker
          placeholder="Select payment mode"
          items={paymentModes}
          value={selectedPaymentMode}
          setValue={setSelectedPaymentMode}
          open={modeDdOpen}
          setOpen={setModeDdOpen}
        />

        <View style={styles.marginBottomX5} />

        <PaymentForm
          onChange={onChange}
          student={student}
        />

        {!isTotalAmountNaN ? (
          <Text style={styles.total}>
            Total amount:{" "}
            <Text style={styles.totalAmount}>
              {formatToIndianAmount(totalAmount)}
            </Text>
          </Text>
        ) : (
          <Text style={[styles.total, styles.nanTotal]}>
            Please enter valid amounts
          </Text>
        )}

        <Button
          mode="contained"
          onPress={onPress}
          loading={loading}
          disabled={
            loading ||
            isTotalAmountNaN ||
            !totalAmount ||
            totalAmount <= 0
          }
        >
          UPDATE
        </Button>
      </Page>
    );
  };

  return (
    <FlatList
      data={["dummy"]}
      renderItem={renderItem}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ flexGrow: 1 }}
      automaticallyAdjustKeyboardInsets
    />
  );
};

const useStyles = makeStyles(() => ({
  marginBottomX5: {
    marginBottom: Metrics.x5,
  },

  total: {
    marginBottom: Metrics.x5,
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 16,
  },

  totalAmount: {
    fontSize: 20,
  },

  nanTotal: {
    color: Colors.error,
  },

  totalPending: {
    textAlign: "right",
    marginBottom: Metrics.x4,
    fontWeight: "bold",
    fontSize: 15,
  },
}));

export { Payment };