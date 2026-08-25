import { useNavigation } from "@react-navigation/native";
import React from "react";
import { Text, View } from "react-native";
import { Button } from "react-native-paper";
import { Page } from "../components";
import { makeStyles, Metrics } from "../theme";
import { RootStackScreenNames } from "../types";
import { isAdmin } from "../utils";
//import { isUserSuperAdmin } from "../utils";

const Report = () => {
  const styles = useStyles();
  const navigation = useNavigation();
  return (
    <Page style={styles.container}>
      <Button
        mode="elevated"
        onPress={() => {
          //navigation.navigate(RootStackScreenNames.PercentageUnpaidFee);
        }}
        style={styles.marginBottomX5}
      >
        PERCENTAGE
      </Button>
      {isAdmin() ? (
        <Button
          mode="elevated"
          onPress={() => {
            // empty
            // navigation.navigate(RootStackScreenNames.MonthOrDateFeeHistory);
          }}
          style={styles.marginBottomX5}
        >
          MONTH OR DATE
        </Button>
      ) : null}
      <Button
        mode="elevated"
        onPress={() => {
          //navigation.navigate(RootStackScreenNames.StudentFeeHistory);
        }}
        style={styles.marginBottomX5}
      >
        STUDENT REG. NO.
      </Button>
    </Page>
  );
};

const useStyles = makeStyles(() => ({
  container: {
    justifyContent: "center",
  },
  marginBottomX5: { marginBottom: Metrics.x5 },
}));

export { Report };
