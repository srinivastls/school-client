import React, {
  useEffect,
  useState,
} from "react";

import {
  FlatList,
  View,
  Text,
} from "react-native";

import {
  ActivityIndicator,
  Snackbar,
  TextInput,
  TouchableRipple,
} from "react-native-paper";

import {
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";

import { useQuery } from "react-query";

import { useNavigation } from "@react-navigation/native";

import { studentServices } from "../../services/studentServices";

import {
  Colors,
  makeStyles,
  Metrics,
} from "../../theme";

import {
  RootStackParamList,
  RootStackScreenNames,
} from "../../types";

/* ============================================================
   TYPES
============================================================ */

type PrincipalClassStudentsScreenProps = {
  route: {
    params: {
      classNumber: string;
    };
  };
};

type StudentListItem = {
  admissionNo: string;
  name: string;
};

/* ============================================================
   SCREEN
============================================================ */

const PrincipalClassStudentsScreen = ({
  route,
}: PrincipalClassStudentsScreenProps) => {
  const styles = useStyles();

  const navigation =
    useNavigation<
      NativeStackNavigationProp<RootStackParamList>
    >();

  const { classNumber } = route.params;

  const [search, setSearch] =
    useState("");

  const [showSnackbar, setShowSnackbar] =
    useState(false);

  const [snackbarText, setSnackbarText] =
    useState("");

  /* ==========================================================
     API
  ========================================================== */

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery(
    [
      "principal-class-students",
      classNumber,
    ],
    () =>
      studentServices.getStudentsByClass({
        classNumber,
      }),
    {
      enabled: !!classNumber,
      retry: 1,
    }
  );

  /* ==========================================================
     DEBUG
  ========================================================== */

  useEffect(() => {
    console.log(
      "================================="
    );

    console.log(
      "PRINCIPAL CLASS:",
      classNumber
    );

    console.log(
      "CLASS STUDENTS RESPONSE:",
      data
    );

    console.log(
      "CLASS STUDENTS:",
      data?.students
    );

    console.log(
      "CLASS STUDENTS ERROR:",
      error
    );

    console.log(
      "================================="
    );
  }, [
    data,
    error,
    classNumber,
  ]);

  /* ==========================================================
     ERROR
  ========================================================== */

  useEffect(() => {
    if (!isError) {
      return;
    }

    const message =
      // @ts-ignore
      error?.response?.data?.message ??
      "Unable to load students.";

    setSnackbarText(message);
    setShowSnackbar(true);
  }, [
    isError,
    error,
  ]);

  /* ==========================================================
     STUDENTS
  ========================================================== */

  const students: StudentListItem[] =
    data?.students ?? [];

  /* ==========================================================
     SEARCH
  ========================================================== */

  const searchValue =
    search.trim().toLowerCase();

  const filteredStudents =
    students.filter((student) => {
      if (!searchValue) {
        return true;
      }

      return (
        student.name
          ?.toLowerCase()
          .includes(searchValue) ||
        student.admissionNo
          ?.toLowerCase()
          .includes(searchValue)
      );
    });

  /* ==========================================================
     OPEN STUDENT
  ========================================================== */

  const openStudent = async (
    student: StudentListItem
  ) => {
    try {
      /*
       * Fetch the complete student record.
       *
       * The class API intentionally returns only
       * admission number and name.
       */

      const fullStudent =
        await studentServices.getStudentById({
          admissionNo:
            student.admissionNo,
        });

      navigation.navigate(
        RootStackScreenNames.StudentDetails,
        {
          student: fullStudent,
        }
      );
    } catch (err: any) {
      console.error(
        "STUDENT DETAILS ERROR:",
        err
      );

      setSnackbarText(
        err?.response?.data?.message ??
          "Unable to load student details."
      );

      setShowSnackbar(true);
    }
  };

  /* ==========================================================
     STUDENT ITEM
  ========================================================== */

  const renderStudent = ({
    item,
  }: {
    item: StudentListItem;
  }) => {
    return (
      <TouchableRipple
        style={styles.card}
        rippleColor={
          Colors.brandPrimaryBg
        }
        onPress={() => {
          openStudent(item);
        }}
      >
        <View style={styles.row}>

          <View style={styles.avatar}>
            <Text
              style={styles.avatarText}
            >
              {item.name
                ?.charAt(0)
                .toUpperCase()}
            </Text>
          </View>

          <View style={styles.info}>

            <Text style={styles.name}>
              {item.name}
            </Text>

            <Text
              style={styles.admission}
            >
              Admission No:{" "}
              {item.admissionNo}
            </Text>

          </View>

        </View>
      </TouchableRipple>
    );
  };

  /* ==========================================================
     UI
  ========================================================== */

  return (
    <View style={styles.container}>

      <Text style={styles.title}>
        Class {classNumber}
      </Text>

      <Text style={styles.subtitle}>
        Students
      </Text>

      <TextInput
        mode="outlined"
        label="Search student"
        placeholder="Name or admission number"
        value={search}
        onChangeText={setSearch}
        autoCapitalize="none"
        autoCorrect={false}
        style={styles.search}
      />

      {isLoading || isFetching ? (
        <View style={styles.loader}>

          <ActivityIndicator
            size="large"
            color={
              Colors.brandPrimary
            }
          />

          <Text
            style={styles.loadingText}
          >
            Loading students...
          </Text>

        </View>
      ) : (

        <FlatList
          data={filteredStudents}
          renderItem={renderStudent}
          keyExtractor={(item) =>
            item.admissionNo
          }
          showsVerticalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.list
          }
          ListEmptyComponent={
            <View style={styles.empty}>

              <Text
                style={styles.emptyIcon}
              >
                🎓
              </Text>

              <Text
                style={styles.emptyTitle}
              >
                {isError
                  ? "Unable to load students"
                  : "No students found"}
              </Text>

              <Text
                style={styles.emptyText}
              >
                {isError
                  ? "Please try again."
                  : `No students found for Class ${classNumber}.`}
              </Text>

            </View>
          }
        />

      )}

      <Snackbar
        visible={showSnackbar}
        onDismiss={() => {
          setShowSnackbar(false);
        }}
        duration={3000}
        style={{
          backgroundColor:
            Colors.errorBg,
        }}
      >
        {snackbarText}
      </Snackbar>

    </View>
  );
};

/* ============================================================
   STYLES
============================================================ */

const useStyles = makeStyles(() => {
  return {

    container: {
      flex: 1,
      padding: Metrics.x4,
    },

    title: {
      fontSize: 28,
      fontWeight: "700",
    },

    subtitle: {
      fontSize: 16,
      color: Colors.subtext,
      marginTop: Metrics.x1,
      marginBottom: Metrics.x4,
    },

    search: {
      marginBottom: Metrics.x4,
    },

    list: {
      paddingBottom: Metrics.x5,
    },

    card: {
      padding: Metrics.x4,
      marginBottom: Metrics.x3,
      borderRadius: Metrics.x3,
      backgroundColor:
        Colors.brandPrimaryBg,
    },

    row: {
      flexDirection: "row",
      alignItems: "center",
    },

    avatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        Colors.backgroundDisabled,
    },

    avatarText: {
      fontSize: 20,
      fontWeight: "700",
    },

    info: {
      flex: 1,
      marginLeft: Metrics.x3,
    },

    name: {
      fontSize: 17,
      fontWeight: "700",
    },

    admission: {
      fontSize: 13,
      color: Colors.subtext,
      marginTop: Metrics.x1,
    },

    loader: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },

    loadingText: {
      marginTop: Metrics.x3,
      color: Colors.subtext,
    },

    empty: {
      alignItems: "center",
      paddingTop: Metrics.x5,
    },

    emptyIcon: {
      fontSize: 40,
    },

    emptyTitle: {
      fontSize: 18,
      fontWeight: "600",
      marginTop: Metrics.x2,
    },

    emptyText: {
      fontSize: 14,
      color: Colors.subtext,
      textAlign: "center",
      marginTop: Metrics.x2,
    },

  };
});

export {
  PrincipalClassStudentsScreen,
};