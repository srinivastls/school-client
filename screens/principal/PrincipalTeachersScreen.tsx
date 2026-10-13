import React, { useEffect, useMemo, useState } from "react";


import { useNavigation } from "@react-navigation/native";
import type {
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";

import {
  RootStackParamList,
  RootStackScreenNames,
} from "../../types";

import {
  ActivityIndicator,
  FlatList,
  View,
  Text,
} from "react-native";

import {
  Snackbar,
  TextInput,
  TouchableRipple,
} from "react-native-paper";

import { useQuery } from "react-query";

import {
  Colors,
  makeStyles,
  Metrics,
} from "../../theme";

import { principalServices } from "../../services/principalServices";

type Teacher = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  designation?: string | null;
  department?: string | null;
  employeeId?: string | null;
  profilePhotoUrl?: string | null;
  isActive: boolean;
  mustChangePassword?: boolean;
  lastLogin?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

type GetTeachersResponse = {
  teachers: Teacher[];
};

const PrincipalTeachersScreen = () => {
  const navigation =
  useNavigation<
    NativeStackNavigationProp<RootStackParamList>
  >();
  const styles = useStyles();

  

  const [search, setSearch] = useState("");

  const [showSnackbar, setShowSnackbar] =
    useState(false);

  const [snackbarText, setSnackbarText] =
    useState("");

  /* ============================================================
     GET TEACHERS
  ============================================================ */

  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery<GetTeachersResponse>(
    ["principal-teachers"],
    principalServices.getTeachers
  );

  /* ============================================================
     ERROR
  ============================================================ */

  useEffect(() => {
    if (error) {
      setSnackbarText(
        // @ts-ignore
        error?.response?.data?.message ??
          "Unable to load teachers."
      );

      setShowSnackbar(true);
    }
  }, [error]);

  /* ============================================================
     TEACHERS
  ============================================================ */

  const teachers = data?.teachers ?? [];

  

  /* ============================================================
     SEARCH
  ============================================================ */

  const filteredTeachers = useMemo(() => {
    const value =
      search.trim().toLowerCase();

    if (!value) {
      return teachers;
    }

    return teachers.filter((teacher) => {
      return (
        teacher.name
          .toLowerCase()
          .includes(value) ||
        teacher.email
          .toLowerCase()
          .includes(value) ||
        teacher.employeeId
          ?.toLowerCase()
          .includes(value) ||
        teacher.department
          ?.toLowerCase()
          .includes(value)
      );
    });
  }, [teachers, search]);

  /* ============================================================
     TEACHER ITEM
  ============================================================ */

  const renderTeacher = ({
    item,
  }: {
    item: Teacher;
  }) => {
    return (
      <TouchableRipple
        style={styles.card}
        onPress={() => {
  navigation.navigate(
    RootStackScreenNames.PrincipalTeacherDetails,
    {
      teacher: item,
    }
  );
}}
        rippleColor={
          Colors.brandPrimaryBg
        }
      >
        <View>
          <View style={styles.topRow}>
            <View style={styles.nameContainer}>
              <Text style={styles.name}>
                {item.name}
              </Text>

              {item.employeeId ? (
                <Text style={styles.employeeId}>
                  ID: {item.employeeId}
                </Text>
              ) : null}
            </View>

            <View
              style={[
                styles.statusBadge,
                item.isActive
                  ? styles.activeBadge
                  : styles.inactiveBadge,
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  item.isActive
                    ? styles.activeText
                    : styles.inactiveText,
                ]}
              >
                {item.isActive
                  ? "Active"
                  : "Inactive"}
              </Text>
            </View>
          </View>

          <Text style={styles.email}>
            {item.email}
          </Text>

          {item.phone ? (
            <Text style={styles.detail}>
              {item.phone}
            </Text>
          ) : null}

          {item.designation ? (
            <Text style={styles.designation}>
              {item.designation}
            </Text>
          ) : null}

          {item.department ? (
            <Text style={styles.detail}>
              Department: {item.department}
            </Text>
          ) : null}
        </View>
      </TouchableRipple>
    );
  };

  /* ============================================================
     LOADING
  ============================================================ */

  if (isLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator
          size="large"
          color={Colors.brandPrimary}
        />

        <Text style={styles.loadingText}>
          Loading teachers...
        </Text>
      </View>
    );
  }

  /* ============================================================
     UI
  ============================================================ */

  return (
    <View style={styles.container}>
      <View style={styles.header}>
  <View style={styles.headerTextContainer}>
    <Text style={styles.eyebrow}>
      SCHOOL MANAGEMENT
    </Text>

    <Text style={styles.title}>
      Teachers
    </Text>

    <Text style={styles.subtitle}>
      Manage and view all teachers in your school
    </Text>
  </View>

  <TouchableRipple
    style={styles.createButton}
    onPress={() =>
      navigation.navigate(
        RootStackScreenNames.PrincipalCreateTeacher
      )
    }
    rippleColor={Colors.brandPrimaryBg}
  >
    <Text style={styles.createButtonText}>
      + Create Teacher
    </Text>
  </TouchableRipple>
</View>


      <TextInput
  mode="outlined"
  label="Search teachers"
  placeholder="Name, email, employee ID..."
  value={search}
  onChangeText={setSearch}
  autoCapitalize="none"
  autoCorrect={false}
  style={styles.search}
  outlineStyle={styles.searchOutline}
  left={<TextInput.Icon icon="magnify" />}
  right={
    isFetching ? (
      <TextInput.Icon icon="loading" />
    ) : search.trim() ? (
      <TextInput.Icon
        icon="close"
        onPress={() => setSearch("")}
      />
    ) : undefined
  }
/>


      <FlatList
        data={filteredTeachers}
        renderItem={renderTeacher}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.list
        }
        refreshing={isFetching}
        onRefresh={refetch}
        ListHeaderComponent={
          teachers.length > 0 ? (
            <Text style={styles.count}>
              {filteredTeachers.length} of{" "}
              {teachers.length} teachers
            </Text>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>
              {search.trim()
                ? "No teachers found"
                : "No teachers available"}
            </Text>

            <Text style={styles.emptyText}>
              {search.trim()
                ? "Try a different search."
                : "No teacher accounts have been created yet."}
            </Text>
          </View>
        }
      />

      <Snackbar
        visible={showSnackbar}
        onDismiss={() =>
          setShowSnackbar(false)
        }
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

/* ============================================================
   STYLES
============================================================ */

const useStyles = makeStyles(() => {
  return {
    container: {
      flex: 1,
      paddingHorizontal: Metrics.x4,
      paddingTop: Metrics.x4,
      backgroundColor: "#F5F7FB",
    },

    // HEADER
    header: {
      marginBottom: Metrics.x5,
    },

    headerTextContainer: {
      marginBottom: Metrics.x3,
    },

    eyebrow: {
      fontSize: 11,
      fontWeight: "800",
      letterSpacing: 1.2,
      color: Colors.brandPrimary,
      marginBottom: Metrics.x1,
    },

    title: {
      fontSize: 30,
      lineHeight: 36,
      fontWeight: "800",
      color: "#111827",
    },

    subtitle: {
      fontSize: 14,
      lineHeight: 21,
      color: "#6B7280",
      marginTop: Metrics.x1,
    },

    // CREATE BUTTON
    createButton: {
      minHeight: 46,
      paddingHorizontal: Metrics.x4,
      paddingVertical: Metrics.x3,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: Colors.brandPrimary,
      elevation: 0,
    },

    createButtonText: {
      color: Colors.textOnPrimary ?? "#FFFFFF",
      fontSize: 13,
      fontWeight: "800",
      letterSpacing: 0.2,
      textAlign: "center",
    },

    // SEARCH
    search: {
      marginBottom: Metrics.x4,
      backgroundColor: "#FFFFFF",
      fontSize: 14,
    },

    // LIST
    list: {
      paddingBottom: Metrics.x8,
    },

    count: {
      fontSize: 12,
      fontWeight: "600",
      color: "#6B7280",
      marginBottom: Metrics.x3,
    },
    searchOutline: {
  borderRadius: 12,
  borderWidth: 1,
  borderColor: "#DDE2EC",
},

    // TEACHER CARD
    card: {
      padding: Metrics.x4,
      marginBottom: Metrics.x3,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: "#E8EBF2",
      backgroundColor: "#FFFFFF",
      elevation: 0,
    },

    topRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
    },

    nameContainer: {
      flex: 1,
      minWidth: 0,
      marginRight: Metrics.x2,
    },

    name: {
      fontSize: 16,
      lineHeight: 21,
      fontWeight: "800",
      color: "#111827",
    },

    employeeId: {
      fontSize: 12,
      fontWeight: "500",
      color: "#6B7280",
      marginTop: Metrics.x1,
    },

    email: {
      fontSize: 13,
      lineHeight: 19,
      color: "#4B5563",
      marginTop: Metrics.x3,
    },

    detail: {
      fontSize: 12,
      lineHeight: 18,
      color: "#6B7280",
      marginTop: Metrics.x1,
    },

    designation: {
      fontSize: 13,
      fontWeight: "700",
      color: "#374151",
      marginTop: Metrics.x2,
    },

    // STATUS BADGES
    statusBadge: {
      minHeight: 27,
      paddingHorizontal: Metrics.x2,
      paddingVertical: Metrics.x1,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
    },

    activeBadge: {
      backgroundColor: "#DCFCE7",
    },

    inactiveBadge: {
      backgroundColor: "#FEE2E2",
    },

    statusText: {
      fontSize: 10,
      fontWeight: "800",
      letterSpacing: 0.3,
    },

    activeText: {
      color: "#15803D",
    },

    inactiveText: {
      color: "#B91C1C",
    },

    // LOADING
    loader: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#F5F7FB",
    },

    loadingText: {
      marginTop: Metrics.x3,
      fontSize: 13,
      color: "#6B7280",
    },

    // EMPTY STATE
    empty: {
      alignItems: "center",
      paddingHorizontal: Metrics.x4,
      paddingTop: Metrics.x8,
    },

    emptyTitle: {
      fontSize: 17,
      fontWeight: "800",
      color: "#111827",
    },

    emptyText: {
      fontSize: 13,
      lineHeight: 20,
      color: "#6B7280",
      textAlign: "center",
      marginTop: Metrics.x2,
    },
  };
});

export { PrincipalTeachersScreen };