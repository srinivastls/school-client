import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useLayoutEffect } from "react";
import { Button } from "react-native-paper";
import { Page } from "../components";
import { makeStyles, Metrics } from "../theme";
import { RootStackParamList, RootStackScreenNames } from "../types";
import { isUserSuperAdmin } from "../utils";

const StudentRegistration = () => {
  const navigation: NativeStackNavigationProp<RootStackParamList> =
    useNavigation().getParent("RootStack");

  const styles = useStyles();
  return (
    <Page style={{ flex: 1, justifyContent: "center" }}>
      {isUserSuperAdmin() && (
        <Button
          onPress={() => {
            navigation?.navigate(
              RootStackScreenNames.OldStudentRegistrationFormScreen
            );
          }}
          mode="elevated"
          style={styles.marginBottomx5}
        >
          OLD STUDENT
        </Button>
      )}
      <Button
        onPress={() => {
          navigation?.navigate(RootStackScreenNames.StudentRegistrationForm);
        }}
        mode="elevated"
        style={styles.marginBottomx5}
      >
        NEW STUDENT
      </Button>
    </Page>
  );
};

const useStyles = makeStyles(() => ({
  marginBottomx5: { marginBottom: Metrics.x5 },
}));

export { StudentRegistration };
