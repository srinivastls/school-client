import React from "react";
import { Text, View } from "react-native";
import { Card } from "react-native-paper";

import { makeStyles, Metrics } from "../theme";

import {
  Student,
  Transaction,
} from "../types";

import { formatToIndianAmount } from "../utils";
import { Icon } from "./icon";

const TransactionItem = ({
  txn,
  student,
  showStudentInfo,
}: {
  txn: Transaction;
  student: Student;
  showStudentInfo?: boolean;
}) => {
  const styles = useStyles();

  return (
    <Card style={styles.card}>
      <Card.Content>

        <View style={styles.titleRow}>
          <Text style={styles.date}>
            {txn.date}
          </Text>

          {student && (
            <Icon
              name="chevron-right"
              size="lg"
            />
          )}
        </View>

        <Text>
          Class {txn.classNumber}
        </Text>

        {showStudentInfo ? (
          <>
            <Text>
              {txn.student.name}
            </Text>

            <Text>
              {txn.student.admissionNo}
            </Text>
          </>
        ) : null}

        <Text>
          Amount:{" "}
          {formatToIndianAmount(
            +txn.amount
          )}
        </Text>

        <Text>
          Pending amount:{" "}
          {formatToIndianAmount(
            +txn.pendingAmount
          )}
        </Text>

      </Card.Content>
    </Card>
  );
};

const useStyles = makeStyles(() => ({
  card: {
    marginBottom: Metrics.x2,
    marginHorizontal: Metrics.x1,
  },

  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Metrics.x1,
  },

  date: {
    fontWeight: "bold",
  },

  txnId: {
    marginBottom: Metrics.x1,
  },
}));

export { TransactionItem };