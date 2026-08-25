import { useNavigation } from "@react-navigation/native";
import {
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";

import React, {
  useState,
} from "react";

import {
  View,
} from "react-native";

import {
  Button,
  Snackbar,
  TextInput,
} from "react-native-paper";

import {
  Page,
} from "../components";

import {
  studentServices,
} from "../services/studentServices";

import {
  Colors,
  makeStyles,
  Metrics,
} from "../theme";

import {
  RootStackParamList,
  RootStackScreenNames,
  Student,
} from "../types";


const OldStudentRegistrationFormScreen =
  () => {

    const [
      admissionNo,
      setAdmissionNo,
    ] = useState("");


    const [
      showErrorSnackbar,
      setShowErrorSnackbar,
    ] = useState(false);


    const [
      snackbarText,
      setSnackbarText,
    ] = useState(
      "Something went wrong. Please try again later."
    );


    const [
      loading,
      setLoading,
    ] = useState(false);


    const styles = useStyles();


    const navigation =
  useNavigation<
    NativeStackNavigationProp<
      RootStackParamList
    >
  >();


    /* ============================================================
       ERROR
    ============================================================ */

    const showError = (
      message: string
    ) => {

      setSnackbarText(
        message
      );

      setShowErrorSnackbar(
        true
      );
    };


    /* ============================================================
       FIND STUDENT
    ============================================================ */

    const onPress = async () => {

      const trimmedAdmissionNo =
        admissionNo.trim();


      if (!trimmedAdmissionNo) {

        showError(
          "Please enter admission number"
        );

        return;
      }


      if (loading) {
        return;
      }


      setLoading(true);


      try {

        const student =
          await studentServices.getStudentById(
            {
              admissionNo:
                trimmedAdmissionNo,
            }
          );


        /*
         * --------------------------------------------------------
         * OPEN SEPARATE EDIT SCREEN
         * --------------------------------------------------------
         */

        navigation.navigate(
          RootStackScreenNames.EditStudent,
          {
            preFetchedData:
              student as Student,
          }
        );

      } catch (
        error: any
      ) {

        console.log(
          "GET STUDENT ERROR:",
          error?.response?.data ??
            error
        );


        showError(

          error?.response
            ?.data
            ?.message ??

            "Student not found. Please try again."

        );

      } finally {

        setLoading(false);
      }
    };


    /* ============================================================
       SCREEN
    ============================================================ */

    return (

      <Page>

        <TextInput
          label="Admission No."
          value={admissionNo}
          onChangeText={
            setAdmissionNo
          }
          mode="outlined"
          style={
            styles.marginBottomX4
          }
          autoCapitalize="characters"
          autoCorrect={false}
        />


        <View
          style={
            styles.marginBottomX4
          }
        />


        <Button
          mode="contained"
          loading={loading}
          disabled={loading}
          onPress={onPress}
        >
          Edit student details
        </Button>


        <Snackbar
          visible={
            showErrorSnackbar
          }
          onDismiss={() => {

            setShowErrorSnackbar(
              false
            );

          }}
          style={
            styles.snackbar
          }
          duration={3000}
        >
          {snackbarText}
        </Snackbar>

      </Page>
    );
  };


/* ================================================================
   STYLES
================================================================ */

const useStyles =
  makeStyles(() => ({

    marginBottomX4: {
      marginBottom:
        Metrics.x4,
    },

    snackbar: {
      backgroundColor:
        Colors.errorBg,
    },

  }));


export {
  OldStudentRegistrationFormScreen,
};