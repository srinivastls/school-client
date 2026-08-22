import { useNavigation } from "@react-navigation/native";
import React from "react";
import { Text, View } from "react-native";
import { Button, Card } from "react-native-paper";

import { Colors, makeStyles, Metrics } from "../theme";
import { RootStackScreenNames, Student } from "../types";
import { formatToIndianAmount } from "../utils";
import { getTotalFee } from "../utils/studentUtils";
import { Icon } from "./icon";

const useStyles = makeStyles(() => ({
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Metrics.x1,
  },

  name: {
    fontWeight: "bold",
  },

  text: {
    marginBottom: Metrics.x1,
    color: Colors.subtext,
  },

  value: {
    color: Colors.text,
  },

  sibling: {
    textDecorationLine: "underline",
  },
}));

const StudentDetailsCard = ({
  student,
  onSiblingPress,
}: {
  student: Student;
  onSiblingPress: (admissionNumber: string) => void;
}) => {
  const styles = useStyles();
  const navigation = useNavigation();

  const {
    name,
    admissionNo,
    phoneNo,
    fatherName,
    siblings = [],
    pendingAmount,
  } = student;

  const totalFee = Number(getTotalFee(student) ?? 0);

  // Prevents crash if arrears is undefined
  const arrearsAmount = Number(student.arrears?.amount ?? 0);

  // Prevents NaN if pendingAmount is undefined/null
  const safePendingAmount = Number(pendingAmount ?? 0);

  // Prevents crash if couponCode is undefined
  const discountAmount = Number(student.couponCode?.discount ?? 0);

  const paidAmount =
    totalFee +
    arrearsAmount -
    safePendingAmount -
    discountAmount;

  return (
    <Card>
      <Card.Content>
        {/* Header */}
        <View style={styles.titleRow}>
          <Text style={styles.name}>{name ?? "N/A"}</Text>

          <Icon
            name="edit"
            size="lg"
            onPress={() => {
              navigation.navigate(
                RootStackScreenNames.StudentRegistrationForm,
                {
                  preFetchedData: student,
                }
              );
            }}
          />
        </View>

        {/* Student details */}
        <Text style={styles.text}>
          Class:{" "}
          <Text style={styles.value}>
            {student.classNumber?.classNumber ?? "N/A"}
          </Text>
        </Text>

        <Text style={styles.text}>
          Admission no.:{" "}
          <Text style={styles.value}>
            {admissionNo ?? "N/A"}
          </Text>
        </Text>

        <Text style={styles.text}>
          Phone no.:{" "}
          <Text style={styles.value}>
            {phoneNo ?? "N/A"}
          </Text>
        </Text>

        <Text style={styles.text}>
          Father:{" "}
          <Text style={styles.value}>
            {fatherName ?? "N/A"}
          </Text>
        </Text>

        {/* Siblings */}
        {siblings.length > 0 && (
          <View>
            <Text style={styles.text}>Siblings:</Text>

            {siblings.map((sibling) => (
              <Text
                key={sibling.admissionNo}
                style={[styles.text, styles.sibling]}
                onPress={() => {
                  onSiblingPress(sibling.admissionNo);
                }}
              >
                {sibling.name} ({sibling.admissionNo})
              </Text>
            ))}
          </View>
        )}

        {/* Fee details */}
        <Text style={styles.text}>
          Total fee:{" "}
          <Text style={styles.value}>
            {formatToIndianAmount(totalFee)}
          </Text>
        </Text>

        <Text style={styles.text}>
          Arrears:{" "}
          <Text style={styles.value}>
            {formatToIndianAmount(arrearsAmount)}
          </Text>
        </Text>

        {student.couponCode?.discount != null && (
          <Text style={styles.text}>
            Discount amount:{" "}
            <Text style={styles.value}>
              {formatToIndianAmount(discountAmount)}
            </Text>
          </Text>
        )}

        <Text style={styles.text}>
          Paid:{" "}
          <Text style={styles.value}>
            {formatToIndianAmount(paidAmount)}
          </Text>
        </Text>

        <Text style={styles.text}>
          Pending amount:{" "}
          <Text style={styles.value}>
            {formatToIndianAmount(safePendingAmount)}
          </Text>
        </Text>

        {student.couponCode?.code && (
          <Text style={styles.text}>
            Coupon code:{" "}
            <Text style={styles.value}>
              {student.couponCode.code}
            </Text>
          </Text>
        )}

        {/* Payment button */}
        <Button
          mode="contained"
          onPress={() => {
            navigation.navigate(
              RootStackScreenNames.Payment,
              { student }
            );
          }}
          style={{ marginTop: Metrics.x4 }}
        >
          PAYMENT
        </Button>
      </Card.Content>
    </Card>
  );
};

export { StudentDetailsCard };