import React, { useState } from "react";

import {
  FlatList,
  View,
  Text,
} from "react-native";

import {
  Snackbar,
  TextInput,
  TouchableRipple,
} from "react-native-paper";

import {
  Colors,
  makeStyles,
  Metrics,
} from "../../theme";

type Teacher = {
  id: string;
  name: string;
  email: string;
  designation?: string;
};

const PrincipalTeachersScreen = () => {
  const styles = useStyles();

  const [search, setSearch] = useState("");

  const [showSnackbar, setShowSnackbar] =
    useState(false);

  const [snackbarText, setSnackbarText] =
    useState("");

  /*
   * ============================================================
   * TEACHERS
   * ============================================================
   *
   * Backend teacher API will be connected here.
   *
   * Keeping this empty for now is intentional.
   * We should not create fake teacher data.
   */

  const teachers: Teacher[] = [];

  /*
   * ============================================================
   * SEARCH
   * ============================================================
   */

  const filteredTeachers =
    teachers.filter((teacher) => {
      const value =
        search.trim().toLowerCase();

      return (
        teacher.name
          .toLowerCase()
          .includes(value) ||
        teacher.email
          .toLowerCase()
          .includes(value)
      );
    });

  /*
   * ============================================================
   * TEACHER ITEM
   * ============================================================
   */

  const renderTeacher = ({
    item,
  }: {
    item: Teacher;
  }) => {
    return (
      <TouchableRipple
        style={styles.card}
        onPress={() => {
          setSnackbarText(
            `${item.name} selected`
          );

          setShowSnackbar(true);
        }}
        rippleColor={
          Colors.brandPrimaryBg
        }
      >
        <View>
          <Text style={styles.name}>
            {item.name}
          </Text>

          <Text style={styles.email}>
            {item.email}
          </Text>

          {item.designation ? (
            <Text style={styles.designation}>
              {item.designation}
            </Text>
          ) : null}
        </View>
      </TouchableRipple>
    );
  };

  /*
   * ============================================================
   * UI
   * ============================================================
   */

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Teachers
      </Text>

      <Text style={styles.subtitle}>
        Manage teachers in your school
      </Text>

      <TextInput
        mode="outlined"
        label="Search teachers"
        value={search}
        onChangeText={setSearch}
        autoCapitalize="none"
        autoCorrect={false}
        style={styles.search}
      />

      <FlatList
        data={filteredTeachers}
        renderItem={renderTeacher}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.list
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>
              No teachers available
            </Text>

            <Text style={styles.emptyText}>
              Teacher management will be
              connected to the backend next.
            </Text>
          </View>
        }
      />

      <Snackbar
        visible={showSnackbar}
        onDismiss={() => {
          setShowSnackbar(false);
        }}
        duration={2500}
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

    name: {
      fontSize: 17,
      fontWeight: "700",
    },

    email: {
      fontSize: 14,
      color: Colors.subtext,
      marginTop: Metrics.x1,
    },

    designation: {
      fontSize: 13,
      color: Colors.subtext,
      marginTop: Metrics.x1,
    },

    empty: {
      alignItems: "center",
      paddingTop: Metrics.x5,
    },

    emptyTitle: {
      fontSize: 17,
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

export { PrincipalTeachersScreen };