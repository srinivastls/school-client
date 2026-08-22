import { useNavigation } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { Button, Snackbar, TextInput } from "react-native-paper";
import { Page } from "../components";
import { classServices } from "../services";
import { Colors, makeStyles, Metrics } from "../theme";
import { Class, RootStackParamList, RootStackScreenNames } from "../types";

const ClassFeeFormScreen = ({
  route,
}: NativeStackScreenProps<
  RootStackParamList,
  RootStackScreenNames.ClassFeeForm
>) => {
  const navigation = useNavigation();

  const { preFetchedClass } = route.params ?? {};

  const [payload, setPayload] = useState<Class>({
    classNumber: "",
    textBookFee: "",
    noteBookFee: "",
    tuitionFee: "",
    year: new Date().getFullYear().toString(),
    ...(preFetchedClass ?? {}),
  });

  const styles = useStyles();

  useEffect(() => {
    if (!preFetchedClass) {
      navigation.setOptions({ headerTitle: "Create New Class" });
    } else {
      navigation.setOptions({ headerTitle: "Edit Class" });
    }
  }, [preFetchedClass]);

  const [loading, setLoading] = useState(false);
  const [showSnackBar, setShowSnackBar] = useState(false);
  const [snackBarText, setSnackBarText] = useState(
    "Something went wrong. Please try again later."
  );
  const [snackBarBg, setSnackBarBg] = useState(Colors.errorBg);

  const onPress = async () => {
    const { classNumber, tuitionFee, textBookFee, noteBookFee, year } = payload;
    if (!classNumber || !tuitionFee || !textBookFee || !noteBookFee || !year) {
      setSnackBarText("Please enter all fields");
      setSnackBarBg(Colors.errorBg);
      setShowSnackBar(true);
      return;
    }

    setLoading(true);

    try {
      preFetchedClass
        ? await classServices.editClassDetails(payload)
        : await classServices.createClass(payload);
      setSnackBarText(
        preFetchedClass
          ? "Edited class details successfully"
          : "Class created successfully"
      );
      setSnackBarBg(Colors.successBg);
      setShowSnackBar(true);
    } catch (error) {
      const errorMessage =
        //@ts-ignore
        error?.response?.data?.message ??
        "Something went wrong. Please try again later.";
      setSnackBarText(errorMessage);
      setSnackBarBg(Colors.errorBg);
      setShowSnackBar(true);
    }

    setLoading(false);
  };

  return (
    <Page>
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

      {!preFetchedClass ? (
        <TextInput
          label="Year"
          value={payload.year}
          onChangeText={(text) => {
            setPayload((payload) => {
              let year = payload.year;
              if (/^[0-9]*$/.test(text) && text.length <= 4) {
                year = text;
              }
              return { ...payload, year };
            });
          }}
          mode="outlined"
          style={styles.marginBottomX4}
          keyboardType="numeric"
        />
      ) : null}
      <View style={styles.marginBottomX4} />

      <Button
        mode="contained"
        onPress={onPress}
        loading={loading}
        disabled={loading}
      >
        SAVE
      </Button>
      <Snackbar
        visible={showSnackBar}
        onDismiss={() => {
          setShowSnackBar(false);
        }}
        style={{ backgroundColor: snackBarBg }}
        duration={2000}
      >
        {snackBarText}
      </Snackbar>
    </Page>
  );
};

const useStyles = makeStyles(() => ({
  marginBottomX4: { marginBottom: Metrics.x4 },
}));

export { ClassFeeFormScreen };
