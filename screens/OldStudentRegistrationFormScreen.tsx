import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useState } from "react";
import { View } from "react-native";
import { Button, Snackbar, TextInput } from "react-native-paper";
import RNSnackbar from "react-native-snackbar";

import { ClassList, Page } from "../components";
import { studentServices } from "../services/studentServices";
import { Colors, makeStyles, Metrics } from "../theme";
import { RootStackParamList, RootStackScreenNames, Student } from "../types";

const OldStudentRegistrationFormScreen = () => {
  const [admissionNo, setAdmissionNo] = useState("");
  const [showErrorSnackbar, setShowErrorSnackbar] = useState(false);
  const [loading, setLoading] = useState(false);
  const styles = useStyles();
  const navigation: NativeStackNavigationProp<RootStackParamList> =
    //@ts-ignore
    useNavigation().getParent("RootStack");

  const onPress = async () => {
    if (!admissionNo) {
      setShowErrorSnackbar(true);
    }
    setLoading(true);
    try {
      const student = await studentServices.getStudentById({ admissionNo });
      navigation.navigate(RootStackScreenNames.StudentRegistrationForm, {
        preFetchedData: student as Student,
      });
    } catch (error) {
      RNSnackbar.show({
        text:
          //@ts-ignore
          error?.response?.data?.message ??
          "Something went wrong. Please try again later.",
        backgroundColor: Colors.errorBg,
        duration: RNSnackbar.LENGTH_LONG,
      });
    }
    setLoading(false);
  };

  return (
    <Page>
      <TextInput
        label="Admission No."
        value={admissionNo}
        onChangeText={(text) => setAdmissionNo(text)}
        mode="outlined"
        style={styles.marginBottomX4}
        autoCapitalize="characters"
      />

      <View style={styles.marginBottomX4} />
      <Button
        mode="contained"
        loading={loading}
        disabled={loading}
        onPress={onPress}
      >
        Edit student details
      </Button>
      <Snackbar
        visible={showErrorSnackbar}
        onDismiss={() => {
          setShowErrorSnackbar(false);
        }}
        style={styles.snackbar}
        duration={2000}
      >
        Please enter admission number
      </Snackbar>
    </Page>
  );
};

const useStyles = makeStyles(() => ({
  marginBottomX4: { marginBottom: Metrics.x4 },
  snackbar: {
    backgroundColor: Colors.errorBg,
  },
}));

export { OldStudentRegistrationFormScreen };
