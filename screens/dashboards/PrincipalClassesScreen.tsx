import React from "react";

import {
  FlatList,
  View,
  Text,
} from "react-native";

import {
  ProgressBar,
  Snackbar,
  TouchableRipple,
} from "react-native-paper";


import { useNavigation } from "@react-navigation/native";

import {
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";

import {
  RootStackParamList,
  RootStackScreenNames,
} from "../../types";

import { useQuery } from "react-query";

import { studentServices } from "../../services/studentServices";

import {
  Colors,
  makeStyles,
  Metrics,
} from "../../theme";

type ClassCount = {
  classNumber: string;
  count: string;
};

const PrincipalClassesScreen = () => {
  const styles = useStyles();
  const navigation =
    useNavigation<
      NativeStackNavigationProp<
        RootStackParamList,
        RootStackScreenNames.PrincipalClassStudents
      >
    >();

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery(
    ["principal-class-student-counts"],
    studentServices.getClassStudentCounts
  );

  const classCounts: ClassCount[] =
    data?.countData ?? [];

  const renderClass = ({
    item,
  }: {
    item: ClassCount;
  }) => {
    const studentCount = Number(item.count);

    return (
      <TouchableRipple
        style={styles.card}
        rippleColor={Colors.brandPrimaryBg}
        onPress={() => {
           navigation.navigate(
    RootStackScreenNames.PrincipalClassStudents,
    {
      classNumber: item.classNumber,
    }
  );
        }}
      >
        <View style={styles.cardContent}>
          <View style={styles.classIcon}>
            <Text style={styles.classIconText}>
              🎓
            </Text>
          </View>

          <View style={styles.classInfo}>
            <Text style={styles.classTitle}>
              Class {item.classNumber}
            </Text>

            <Text style={styles.studentCount}>
              {studentCount} student
              {studentCount === 1 ? "" : "s"}
            </Text>
          </View>
        </View>
      </TouchableRipple>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ProgressBar
          indeterminate
          color={Colors.brandPrimary}
          style={styles.progress}
        />

        <Text style={styles.loadingText}>
          Loading classes...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Classes
      </Text>

      <Text style={styles.subtitle}>
        View classes and student counts
      </Text>

      {isFetching ? (
        <ProgressBar
          indeterminate
          color={Colors.brandPrimary}
          style={styles.progress}
        />
      ) : null}

      <FlatList
        data={classCounts}
        renderItem={renderClass}
        keyExtractor={(item) =>
          item.classNumber
        }
        numColumns={2}
        columnWrapperStyle={
          styles.columnWrapper
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.list
        }
        refreshing={isFetching}
        onRefresh={refetch}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>
              No classes found
            </Text>

            <Text style={styles.emptyText}>
              There are no class records
              available for this school.
            </Text>
          </View>
        }
      />

      <Snackbar
        visible={isError}
        onDismiss={() => {}}
        duration={3000}
        style={{
          backgroundColor:
            Colors.errorBg,
        }}
      >
        {
          // @ts-ignore
          error?.response?.data?.message ??
            "Unable to load classes"
        }
      </Snackbar>
    </View>
  );
};

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
      fontSize: 15,
      color: Colors.subtext,
      marginTop: Metrics.x1,
      marginBottom: Metrics.x4,
    },

    progress: {
      marginBottom: Metrics.x3,
      borderRadius: 2,
    },

    list: {
      paddingBottom: Metrics.x5,
    },

    columnWrapper: {
      gap: Metrics.x3,
    },

    card: {
      flex: 1,
      minHeight: 140,
      marginBottom: Metrics.x3,
      borderRadius: Metrics.x3,
      backgroundColor:
        Colors.brandPrimaryBg,
    },

    cardContent: {
      flex: 1,
      padding: Metrics.x4,
      justifyContent: "center",
      alignItems: "center",
    },

    classIcon: {
      width: 55,
      height: 55,
      borderRadius: 30,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: Metrics.x2,
      backgroundColor:
        Colors.backgroundDisabled,
    },

    classIconText: {
      fontSize: 27,
    },

    classInfo: {
      alignItems: "center",
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

    center: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: Metrics.x5,
    },

    loadingText: {
      marginTop: Metrics.x3,
      color: Colors.subtext,
    },

    empty: {
      alignItems: "center",
      paddingTop: Metrics.x5,
    },

    emptyTitle: {
      fontSize: 18,
      fontWeight: "600",
    },

    emptyText: {
      fontSize: 14,
      color: Colors.subtext,
      textAlign: "center",
      marginTop: Metrics.x2,
    },
  };
});

export { PrincipalClassesScreen };