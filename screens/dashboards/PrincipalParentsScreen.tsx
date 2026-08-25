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

type Parent = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  studentName?: string;
};

const PrincipalParentsScreen = () => {
  const styles = useStyles();

  const [search, setSearch] = useState("");

  const [showSnackbar, setShowSnackbar] =
    useState(false);

  const [snackbarText, setSnackbarText] =
    useState("");

  /*
   * ============================================================
   * PARENTS
   * ============================================================
   *
   * Connect the backend API here later.
   */

  const parents: Parent[] = [];

  /*
   * ============================================================
   * SEARCH
   * ============================================================
   */

  const filteredParents =
    parents.filter((parent) => {
      const value =
        search.trim().toLowerCase();

      return (
        parent.name
          .toLowerCase()
          .includes(value) ||
        parent.email
          .toLowerCase()
          .includes(value) ||
        parent.phone
          ?.toLowerCase()
          .includes(value) ||
        parent.studentName
          ?.toLowerCase()
          .includes(value)
      );
    });

  /*
   * ============================================================
   * PARENT ITEM
   * ============================================================
   */

  const renderParent = ({
    item,
  }: {
    item: Parent;
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

          {item.phone ? (
            <Text style={styles.detail}>
              Phone: {item.phone}
            </Text>
          ) : null}

          {item.studentName ? (
            <Text style={styles.detail}>
              Student: {item.studentName}
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
        Parents
      </Text>

      <Text style={styles.subtitle}>
        Manage parents in your school
      </Text>

      <TextInput
        mode="outlined"
        label="Search parents"
        value={search}
        onChangeText={setSearch}
        autoCapitalize="none"
        autoCorrect={false}
        style={styles.search}
      />

      <FlatList
        data={filteredParents}
        renderItem={renderParent}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.list
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>
              No parents available
            </Text>

            <Text style={styles.emptyText}>
              Parent management will be
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

    detail: {
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

export { PrincipalParentsScreen };