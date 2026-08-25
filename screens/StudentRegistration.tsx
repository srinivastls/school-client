import { useNavigation } from "@react-navigation/native";
import type {
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";

import React from "react";

import {
  Button,
  Text,
} from "react-native-paper";

import {
  Page,
} from "../components";

import {
  makeStyles,
  Metrics,
} from "../theme";

import {
  RootStackParamList,
  RootStackScreenNames,
} from "../types";

const StudentRegistration = () => {
  const navigation =
    useNavigation<
      NativeStackNavigationProp<RootStackParamList>
    >();

  const styles = useStyles();

  /* ==========================================================================
     NEW STUDENT
  ========================================================================== */

  const openNewStudentRegistration = () => {
    navigation.navigate(
      RootStackScreenNames.StudentRegistrationForm
    );
  };

  /* ==========================================================================
     OLD STUDENT
     
     Keep this only if the existing old-student
     registration flow is still required.
  ========================================================================== */

  const openOldStudentRegistration = () => {
    navigation.navigate(
      RootStackScreenNames.OldStudentRegistrationFormScreen
    );
  };

  /* ==========================================================================
     UI
  ========================================================================== */

  return (
    <Page style={styles.container}>

      <Text style={styles.title}>
        Student Registration
      </Text>

      <Text style={styles.subtitle}>
        Register a student in your school
      </Text>

      {/* ====================================================================
          NEW STUDENT
      ==================================================================== */}

      <Button
        mode="contained"
        icon="account-plus"
        onPress={
          openNewStudentRegistration
        }
        style={styles.button}
        contentStyle={
          styles.buttonContent
        }
      >
        NEW STUDENT
      </Button>

      <Text style={styles.description}>
        Register a student who is joining
        the school for the first time.
      </Text>

      {/* ====================================================================
          OLD STUDENT
      ==================================================================== */}

      <Button
        mode="outlined"
        icon="account-convert"
        onPress={
          openOldStudentRegistration
        }
        style={styles.button}
        contentStyle={
          styles.buttonContent
        }
      >
        OLD STUDENT
      </Button>

      <Text style={styles.description}>
        Register an existing student using
        the previous student registration
        process.
      </Text>

    </Page>
  );
};

/* ============================================================================
   STYLES
============================================================================ */

const useStyles = makeStyles(() => {
  return {

    container: {
      flex: 1,
      justifyContent: "center",
      paddingHorizontal: Metrics.x4,
    },

    title: {
      fontSize: 28,
      fontWeight: "700",
      textAlign: "center",
      marginBottom: Metrics.x1,
    },

    subtitle: {
      fontSize: 15,
      color: "#777",
      textAlign: "center",
      marginBottom: Metrics.x5,
    },

    button: {
      marginBottom: Metrics.x2,
      borderRadius: Metrics.x2,
    },

    buttonContent: {
      minHeight: 52,
    },

    description: {
      fontSize: 13,
      color: "#777",
      textAlign: "center",
      marginBottom: Metrics.x5,
      paddingHorizontal: Metrics.x3,
    },

  };
});

export { StudentRegistration };