import { StackActions, useNavigation } from "@react-navigation/native";

import React, { useState } from "react";

import {
  FlatList,
  RefreshControl,
  Text,
  View,
} from "react-native";

import DropDownPicker from "react-native-dropdown-picker";

import {
  Button,
  Card,
  Snackbar,
} from "react-native-paper";

import { ClassList, Page } from "../components";

import {
  reportServices,
  studentServices,
} from "../services";

import {
  Colors,
  makeStyles,
  Metrics,
} from "../theme";

import {
  RootStackScreenNames,
  Student,
} from "../types";

const PercentageUnpaidFeeScreen = () => {
  const [selectedClass, setSelectedClass] =
    useState<string | null>(null);

  const percentages = [
    { label: "30%", value: "30" },
    { label: "50%", value: "50" },
    { label: "80%", value: "80" },
    { label: "100%", value: "100" },
  ];

  const [selectedPercentage, setSelectedPercentage] =
    useState<string | null>(null);

  const [percentageDdOpen, setPercentageDdOpen] =
    useState(false);

  const styles = useStyles();

  const [students, setStudents] = useState<
    { admissionNo: string; name: string }[]
  >([]);

  const navigation = useNavigation();

  const [fetchingStudent, setFetchingStudent] =
    useState(false);

  // Snackbar state
  const [snackbarVisible, setSnackbarVisible] =
    useState(false);

  const [snackbarMessage, setSnackbarMessage] =
    useState("");

  const [snackbarColor, setSnackbarColor] =
    useState(Colors.errorBg);

  const showSnackbar = (
    message: string,
    backgroundColor: string = Colors.errorBg
  ) => {
    setSnackbarMessage(message);
    setSnackbarColor(backgroundColor);
    setSnackbarVisible(true);
  };

  const onStudentPress = async (admissionNo: string) => {
    if (fetchingStudent) {
      return;
    }

    setFetchingStudent(true);

    try {
      const student =
        await studentServices.getStudentById({
          admissionNo,
        });

      navigation.dispatch(
        StackActions.push(
          RootStackScreenNames.StudentDetails,
          {
            student,
          }
        )
      );
    } catch (error) {
      showSnackbar(
        // @ts-ignore
        error?.response?.data?.message ??
          "Something went wrong in fetching transactions",
        Colors.errorBg
      );
    }

    setFetchingStudent(false);
  };

  const renderUnpaidStudent = (
    student: Pick<Student, "name" | "admissionNo">
  ) => {
    return (
      <Card
        style={styles.card}
        key={student.admissionNo}
        onPress={() => {
          onStudentPress(student.admissionNo);
        }}
      >
        <Card.Content>
          <Text style={styles.name}>
            {student.name}
          </Text>

          <Text style={styles.admissionNo}>
            {student.admissionNo}
          </Text>
        </Card.Content>
      </Card>
    );
  };

  const onPress = async () => {
    if (!selectedPercentage || !selectedClass) {
      showSnackbar(
        "Please select all fields",
        Colors.errorBg
      );
      return;
    }

    try {
      const students =
        await reportServices.getPercUnpaidStudents({
          classNumber: selectedClass,
          perc: selectedPercentage,
        });

      if (students.length) {
        setStudents(students);
      } else {
        setStudents([]);

        showSnackbar(
          "No students exist for this percentage",
          Colors.errorBg
        );
      }
    } catch (error) {
      showSnackbar(
        // @ts-ignore
        error?.response?.data?.message ??
          "Something went wrong. Please try again later.",
        Colors.errorBg
      );
    }
  };

  const renderItem = () => {
    return (
      <>
        <ClassList
          selectedClass={selectedClass}
          setSelectedClass={setSelectedClass}
          zIndex={10000}
        />

        <View style={styles.marginBottomX5} />

        <DropDownPicker
          placeholder="Percentage"
          open={percentageDdOpen}
          value={selectedPercentage}
          items={percentages}
          setOpen={setPercentageDdOpen}
          setValue={setSelectedPercentage}
          style={{
            backgroundColor: Colors.background,
          }}
        />

        <View style={styles.marginBottomX5} />

        <Button
          mode="contained"
          onPress={onPress}
        >
          Generate
        </Button>

        <View style={styles.marginBottomX5} />

        {students.map(renderUnpaidStudent)}
      </>
    );
  };

  return (
    <Page>
      <FlatList
        data={["dummy"]}
        renderItem={renderItem}
        contentContainerStyle={{
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={fetchingStudent}
          />
        }
      />

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => {
          setSnackbarVisible(false);
        }}
        duration={3000}
        style={{
          backgroundColor: snackbarColor,
        }}
      >
        {snackbarMessage}
      </Snackbar>
    </Page>
  );
};

const useStyles = makeStyles(() => ({
  marginBottomX5: {
    marginBottom: Metrics.x5,
  },

  card: {
    marginBottom: Metrics.x2,
    marginHorizontal: 2,
  },

  name: {
    fontSize: 18,
    marginBottom: Metrics.x1,
  },

  admissionNo: {
    fontWeight: "bold",
    color: Colors.subtext,
  },
}));

export { PercentageUnpaidFeeScreen };