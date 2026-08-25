import React, { useEffect, useState } from "react";

import {
  FlatList,
  View,
  Text,
} from "react-native";

import {
  ActivityIndicator,
  Button,
  Snackbar,
  TextInput,
  TouchableRipple,
} from "react-native-paper";

import { useQuery } from "react-query";

import {
  RootStackParamList,
  RootStackScreenNames,
} from "../../types";

import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { useNavigation } from "@react-navigation/native";

import { studentServices } from "../../services/studentServices";

import {
  Colors,
  makeStyles,
  Metrics,
} from "../../theme";

const PrincipalStudentsScreen = () => {
  const styles = useStyles();

  const navigation =
    useNavigation<
      NativeStackNavigationProp<RootStackParamList>
    >();

  const [search, setSearch] = useState("");

  const [showSnackbar, setShowSnackbar] =
    useState(false);

  const [snackbarText, setSnackbarText] =
    useState("");

  /*
   * ============================================================
   * CLASS / STUDENT COUNTS
   * ============================================================
   */

  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery(
    ["principal-class-student-counts"],
    studentServices.getClassStudentCounts
  );

  /*
   * ============================================================
   * ERROR HANDLING
   * ============================================================
   */

  useEffect(() => {
    if (error) {
      setSnackbarText(
        // @ts-ignore
        error?.response?.data?.message ??
          "Unable to load student information."
      );

      setShowSnackbar(true);
    }
  }, [error]);

  /*
   * ============================================================
   * CLASS DATA
   * ============================================================
   */

  const classData = data?.countData ?? [];

  /*
   * ============================================================
   * SEARCH
   * ============================================================
   */

  const searchValue =
    search.trim().toLowerCase();

  const filteredClasses =
    classData.filter((item) =>
      item.classNumber
        .toLowerCase()
        .includes(searchValue)
    );

  /*
   * ============================================================
   * REGISTER STUDENT
   * ============================================================
   */

  const openStudentRegistration = () => {
    navigation.navigate(
      RootStackScreenNames.StudentRegistration
    );
  };

  /*
   * ============================================================
   * CLASS ITEM
   * ============================================================
   */

  const renderClass = ({
    item,
  }: {
    item: {
      classNumber: string;
      count: string;
    };
  }) => {
    return (
      <TouchableRipple
        style={styles.card}
        onPress={() => {
          navigation.navigate(
            RootStackScreenNames.PrincipalClassStudents,
            {
              classNumber: item.classNumber,
            }
          );
        }}
        rippleColor={Colors.brandPrimaryBg}
      >
        <View style={styles.cardContent}>
          <View style={styles.classInfo}>
            <Text style={styles.classTitle}>
              Class {item.classNumber}
            </Text>

            <Text style={styles.studentCount}>
              {item.count} student
              {Number(item.count) === 1
                ? ""
                : "s"}
            </Text>
          </View>

          <Text style={styles.arrow}>
            ›
          </Text>
        </View>
      </TouchableRipple>
    );
  };

  /*
   * ============================================================
   * LOADING
   * ============================================================
   */

  if (isLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator
          size="large"
          color={Colors.brandPrimary}
        />

        <Text style={styles.loadingText}>
          Loading students...
        </Text>
      </View>
    );
  }

  /*
   * ============================================================
   * UI
   * ============================================================
   */

  return (
    <View style={styles.container}>
      {/* ======================================================
          HEADER
      ====================================================== */}

      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>
            Students
          </Text>

          <Text style={styles.subtitle}>
            Manage students across all classes
          </Text>
        </View>

        <Button
          mode="contained"
          icon="account-plus"
          onPress={openStudentRegistration}
          style={styles.registerButton}
          contentStyle={styles.registerButtonContent}
        >
          Register Student
        </Button>
      </View>

      {/* ======================================================
          SEARCH
      ====================================================== */}

      <TextInput
        mode="outlined"
        label="Search class"
        placeholder="Enter class number"
        value={search}
        onChangeText={setSearch}
        autoCapitalize="characters"
        autoCorrect={false}
        style={styles.search}
      />

      {/* ======================================================
          CLASS LIST
      ====================================================== */}

      {isFetching ? (
        <View style={styles.refreshLoader}>
          <ActivityIndicator
            size="small"
            color={Colors.brandPrimary}
          />
        </View>
      ) : (
        <FlatList
          data={filteredClasses}
          renderItem={renderClass}
          keyExtractor={(item) =>
            item.classNumber
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            styles.list
          }
          onRefresh={refetch}
          refreshing={isFetching}
          ListHeaderComponent={
            filteredClasses.length > 0 ? (
              <Text style={styles.sectionTitle}>
                Classes
              </Text>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>
                🎓
              </Text>

              <Text style={styles.emptyTitle}>
                No classes found
              </Text>

              <Text style={styles.emptyText}>
                Try a different class number.
              </Text>
            </View>
          }
        />
      )}

      {/* ======================================================
          SNACKBAR
      ====================================================== */}

      <Snackbar
        visible={showSnackbar}
        onDismiss={() => {
          setShowSnackbar(false);
        }}
        duration={2500}
        style={{
          backgroundColor: Colors.errorBg,
        }}
      >
        {snackbarText}
      </Snackbar>
    </View>
  );
};

/*
 * ==============================================================
 * STYLES
 * ==============================================================
 */

const useStyles = makeStyles(() => {
  return {
    container: {
      flex: 1,
      padding: Metrics.x4,
    },

    header: {
      marginBottom: Metrics.x4,
    },

    headerText: {
      marginBottom: Metrics.x3,
    },

    title: {
      fontSize: 28,
      fontWeight: "700",
    },

    subtitle: {
      fontSize: 15,
      color: Colors.subtext,
      marginTop: Metrics.x1,
    },

    registerButton: {
      borderRadius: Metrics.x3,
    },

    registerButtonContent: {
      minHeight: 48,
    },

    search: {
      marginBottom: Metrics.x3,
    },

    sectionTitle: {
      fontSize: 17,
      fontWeight: "700",
      marginBottom: Metrics.x3,
      marginTop: Metrics.x2,
    },

    list: {
      paddingBottom: Metrics.x5,
    },

    card: {
      marginBottom: Metrics.x3,
      borderRadius: Metrics.x3,
      backgroundColor:
        Colors.brandPrimaryBg,
      overflow: "hidden",
    },

    cardContent: {
      minHeight: 82,
      paddingHorizontal: Metrics.x4,
      paddingVertical: Metrics.x3,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },

    classInfo: {
      flex: 1,
    },

    classTitle: {
      fontSize: 18,
      fontWeight: "700",
    },

    studentCount: {
      fontSize: 14,
      color: Colors.subtext,
      marginTop: Metrics.x1,
    },

    arrow: {
      fontSize: 30,
      color: Colors.subtext,
      marginLeft: Metrics.x3,
    },

    loader: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },

    loadingText: {
      marginTop: Metrics.x3,
      color: Colors.subtext,
      fontSize: 15,
    },

    refreshLoader: {
      paddingVertical: Metrics.x2,
      alignItems: "center",
    },

    empty: {
      alignItems: "center",
      paddingTop: Metrics.x5 * 2,
    },

    emptyIcon: {
      fontSize: 48,
      marginBottom: Metrics.x3,
    },

    emptyTitle: {
      fontSize: 18,
      fontWeight: "700",
    },

    emptyText: {
      color: Colors.subtext,
      fontSize: 14,
      marginTop: Metrics.x2,
      textAlign: "center",
    },
  };
});

export { PrincipalStudentsScreen };