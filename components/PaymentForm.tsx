import React from "react";
import { TextInput } from "react-native-paper";
import { View } from "react-native";

import { makeStyles, Metrics } from "../theme";
import { AmountDetails, Student } from "../types";

const PaymentForm = React.memo(
  ({
    onChange,
    student,
  }: {
    onChange: (
      updatedDetail: Partial<AmountDetails>
    ) => void;
    student: Student;
  }) => {
    const styles = useStyles();

    return (
      <>
        {/* Diary */}
        <View style={styles.rowContainer}>
          <TextInput
            label="Diary"
            mode="outlined"
            style={styles.rowItemLeft}
            keyboardType="numeric"
            onChangeText={(text) => {
              onChange({
                diary: text || "0",
              });
            }}
          />

          <TextInput
            label="Pending"
            mode="outlined"
            editable={false}
            style={styles.rowItemRight}
            value={String(
              student.diary.pendingAmount ?? "0"
            )}
          />
        </View>

        {/* Tie */}
        <View style={styles.rowContainer}>
          <TextInput
            label="Tie"
            mode="outlined"
            style={styles.rowItemLeft}
            keyboardType="numeric"
            onChangeText={(text) => {
              onChange({
                tie: text || "0",
              });
            }}
          />

          <TextInput
            label="Pending"
            mode="outlined"
            editable={false}
            style={styles.rowItemRight}
            value={String(
              student.tie.pendingAmount ?? "0"
            )}
          />
        </View>

        {/* Belt */}
        <View style={styles.rowContainer}>
          <TextInput
            label="Belt"
            mode="outlined"
            style={styles.rowItemLeft}
            keyboardType="numeric"
            onChangeText={(text) => {
              onChange({
                belt: text || "0",
              });
            }}
          />

          <TextInput
            label="Pending"
            mode="outlined"
            editable={false}
            style={styles.rowItemRight}
            value={String(
              student.belt.pendingAmount ?? "0"
            )}
          />
        </View>

        {/* Arrears */}
        <View style={styles.rowContainer}>
          <TextInput
            label="Arrears"
            mode="outlined"
            style={styles.rowItemLeft}
            keyboardType="numeric"
            onChangeText={(text) => {
              onChange({
                arrears: text || "0",
              });
            }}
          />

          <TextInput
            label="Pending"
            mode="outlined"
            editable={false}
            style={styles.rowItemRight}
            value={String(
              student.arrears.pendingAmount ?? "0"
            )}
          />
        </View>

        {/* Tuition */}
        <View style={styles.rowContainer}>
          <TextInput
            label="Tuition Fee"
            mode="outlined"
            style={styles.rowItemLeft}
            keyboardType="numeric"
            onChangeText={(text) => {
              onChange({
                tuitionFee: text || "0",
              });
            }}
          />

          <TextInput
            label="Pending"
            mode="outlined"
            editable={false}
            style={styles.rowItemRight}
            value={String(
              student.pendingTuitionFee ?? "0"
            )}
          />
        </View>

        {/* Textbook */}
        <View style={styles.rowContainer}>
          <TextInput
            label="Textbook Fee"
            mode="outlined"
            style={styles.rowItemLeft}
            keyboardType="numeric"
            onChangeText={(text) => {
              onChange({
                textBookFee: text || "0",
              });
            }}
          />

          <TextInput
            label="Pending"
            mode="outlined"
            editable={false}
            style={styles.rowItemRight}
            value={String(
              student.pendingTextbookFee ?? "0"
            )}
          />
        </View>

        {/* Notebook */}
        <View style={styles.rowContainer}>
          <TextInput
            label="Notebook Fee"
            mode="outlined"
            style={styles.rowItemLeft}
            keyboardType="numeric"
            onChangeText={(text) => {
              onChange({
                noteBookFee: text || "0",
              });
            }}
          />

          <TextInput
            label="Pending"
            mode="outlined"
            editable={false}
            style={styles.rowItemRight}
            value={String(
              student.pendingNotebookFee ?? "0"
            )}
          />
        </View>

        {/* Other */}
        <TextInput
          label="Other"
          mode="outlined"
          style={styles.marginBottomX5}
          keyboardType="numeric"
          onChangeText={(text) => {
            onChange({
              other: text || "0",
            });
          }}
        />
      </>
    );
  }
);

const useStyles = makeStyles(() => ({
  marginBottomX5: {
    marginBottom: Metrics.x5,
  },

  rowContainer: {
    flexDirection: "row",
    marginBottom: Metrics.x5,
  },

  rowItemLeft: {
    flex: 2,
    marginRight: Metrics.x2,
  },

  rowItemRight: {
    flex: 1,
  },
}));

export { PaymentForm };