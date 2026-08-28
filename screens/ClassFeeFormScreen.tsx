import { useNavigation } from "@react-navigation/native";

import { NativeStackScreenProps } from "@react-navigation/native-stack";

import React, { useEffect, useState } from "react";

import { View } from "react-native";

import { Button, Snackbar, TextInput } from "react-native-paper";

import { Page } from "../components";

import { classServices } from "../services";

import { Colors, makeStyles, Metrics } from "../theme";

import {
  Class,
  RootStackParamList,
  RootStackScreenNames,
} from "../types";

const ClassFeeFormScreen = ({
  route,
}: NativeStackScreenProps<
  RootStackParamList,
  RootStackScreenNames.ClassFeeForm
>) => {

  const navigation = useNavigation();

  const { preFetchedClass } = route.params ?? {};


  /* ==========================================================================
     PAYLOAD
  ========================================================================== */

  const [payload, setPayload] = useState<Class>({
    id: preFetchedClass?.id ?? "",
    classNumber: "",
    textBookFee: "",
    noteBookFee: "",
    tuitionFee: "",
    year: new Date().getFullYear().toString(),
    ...(preFetchedClass ?? {}),
  });


  const styles = useStyles();


  /* ==========================================================================
     HEADER
  ========================================================================== */

  useEffect(() => {

    if (!preFetchedClass) {

      navigation.setOptions({
        headerTitle: "Create New Class",
      });

    } else {

      navigation.setOptions({
        headerTitle: "Edit Class",
      });

    }

  }, [preFetchedClass, navigation]);


  /* ==========================================================================
     LOADING
  ========================================================================== */

  const [loading, setLoading] = useState(false);


  /* ==========================================================================
     SNACKBAR
  ========================================================================== */

  const [showSnackBar, setShowSnackBar] = useState(false);

  const [snackBarText, setSnackBarText] = useState(
    "Something went wrong. Please try again later."
  );

  const [snackBarBg, setSnackBarBg] = useState(
    Colors.errorBg
  );


  /* ==========================================================================
     SUBMIT
  ========================================================================== */

  const onPress = async () => {

    const {
      classNumber,
      tuitionFee,
      textBookFee,
      noteBookFee,
      year,
    } = payload;


    if (
      !classNumber ||
      !tuitionFee ||
      !textBookFee ||
      !noteBookFee ||
      !year
    ) {

      setSnackBarText(
        "Please enter all fields"
      );

      setSnackBarBg(
        Colors.errorBg
      );

      setShowSnackBar(true);

      return;
    }


    setLoading(true);


    try {

      if (preFetchedClass) {

        await classServices.editClassDetails(
          payload
        );

      } else {

        await classServices.createClass(
          payload
        );

      }


      setSnackBarText(
        preFetchedClass
          ? "Edited class details successfully"
          : "Class created successfully"
      );

      setSnackBarBg(
        Colors.successBg
      );

      setShowSnackBar(true);

    } catch (error: any) {

      const errorMessage =
        error?.response?.data?.message ??
        "Something went wrong. Please try again later.";

      setSnackBarText(
        errorMessage
      );

      setSnackBarBg(
        Colors.errorBg
      );

      setShowSnackBar(true);

    } finally {

      setLoading(false);

    }

  };


  /* ==========================================================================
     UI
  ========================================================================== */

  return (

    <Page>

      {/* ======================================================================
          CLASS NUMBER
      ====================================================================== */}

      <TextInput
        label="Class number"
        value={payload.classNumber}
        onChangeText={(text) =>
          setPayload((payload) => ({
            ...payload,
            classNumber: text,
          }))
        }
        mode="outlined"
        style={styles.marginBottomX4}
        keyboardType="numeric"
      />


      {/* ======================================================================
          TUITION FEE
      ====================================================================== */}

      <TextInput
        label="Tuition fee"
        value={payload.tuitionFee}
        onChangeText={(text) =>
          setPayload((payload) => ({
            ...payload,
            tuitionFee: text,
          }))
        }
        mode="outlined"
        style={styles.marginBottomX4}
        keyboardType="numeric"
      />


      {/* ======================================================================
          TEXTBOOK FEE
      ====================================================================== */}

      <TextInput
        label="Textbook amount"
        value={payload.textBookFee}
        onChangeText={(text) =>
          setPayload((payload) => ({
            ...payload,
            textBookFee: text,
          }))
        }
        mode="outlined"
        style={styles.marginBottomX4}
        keyboardType="numeric"
      />


      {/* ======================================================================
          NOTEBOOK FEE
      ====================================================================== */}

      <TextInput
        label="Notebook amount"
        value={payload.noteBookFee}
        onChangeText={(text) =>
          setPayload((payload) => ({
            ...payload,
            noteBookFee: text,
          }))
        }
        mode="outlined"
        style={styles.marginBottomX4}
        keyboardType="numeric"
      />


      {/* ======================================================================
          YEAR
      ====================================================================== */}

      {!preFetchedClass ? (

        <TextInput
          label="Year"
          value={payload.year}
          onChangeText={(text) => {

            if (
              /^[0-9]*$/.test(text) &&
              text.length <= 4
            ) {

              setPayload((payload) => ({
                ...payload,
                year: text,
              }));

            }

          }}
          mode="outlined"
          style={styles.marginBottomX4}
          keyboardType="numeric"
        />

      ) : null}


      {/* ======================================================================
          SAVE BUTTON
      ====================================================================== */}

      <View style={styles.marginBottomX4} />


      <Button
        mode="contained"
        onPress={onPress}
        loading={loading}
        disabled={loading}
      >
        SAVE
      </Button>


      {/* ======================================================================
          SNACKBAR
      ====================================================================== */}

      <Snackbar
        visible={showSnackBar}
        onDismiss={() => {
          setShowSnackBar(false);
        }}
        style={{
          backgroundColor: snackBarBg,
        }}
        duration={2000}
      >
        {snackBarText}
      </Snackbar>

    </Page>

  );

};


/* ============================================================================
   STYLES
============================================================================ */

const useStyles = makeStyles(() => ({

  marginBottomX4: {
    marginBottom: Metrics.x4,
  },

}));


export { ClassFeeFormScreen };