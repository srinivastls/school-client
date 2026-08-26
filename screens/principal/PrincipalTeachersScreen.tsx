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
                  ? "ACTIVE"
                  : "INACTIVE"}
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
      <Text style={styles.title}>
        Teachers
      </Text>

      <Text style={styles.subtitle}>
        Manage teachers in your school
      </Text>

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
    + CREATE TEACHER
  </Text>
</TouchableRipple>

      <TextInput
        mode="outlined"
        label="Search teachers"
        value={search}
        onChangeText={setSearch}
        autoCapitalize="none"
        autoCorrect={false}
        style={styles.search}
        right={
          isFetching ? (
            <TextInput.Icon
              icon="loading"
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
      marginBottom: Metrics.x3,
    },

    count: {
      fontSize: 13,
      color: Colors.subtext,
      marginBottom: Metrics.x3,
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

    topRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
    },

    nameContainer: {
      flex: 1,
      marginRight: Metrics.x2,
    },

    name: {
      fontSize: 17,
      fontWeight: "700",
    },

    employeeId: {
      fontSize: 12,
      color: Colors.subtext,
      marginTop: Metrics.x1,
    },

    email: {
      fontSize: 14,
      color: Colors.subtext,
      marginTop: Metrics.x2,
    },

    detail: {
      fontSize: 13,
      color: Colors.subtext,
      marginTop: Metrics.x1,
    },

    designation: {
      fontSize: 13,
      fontWeight: "600",
      marginTop: Metrics.x2,
    },

    statusBadge: {
      paddingHorizontal: Metrics.x2,
      paddingVertical: Metrics.x1,
      borderRadius: 20,
    },

    activeBadge: {
      backgroundColor:
        Colors.successBg,
    },

    inactiveBadge: {
      backgroundColor:
        Colors.errorBg,
    },

    statusText: {
      fontSize: 10,
      fontWeight: "800",
    },

    activeText: {
      color: "#ffffff",
    },

    inactiveText: {
      color: "#ffffff",
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

    createButton: {
  paddingVertical: Metrics.x3,
  paddingHorizontal: Metrics.x4,
  borderRadius: Metrics.x2,
  backgroundColor: Colors.brandPrimary,
  marginBottom: Metrics.x4,
},

createButtonText: {
  color: "#fff",
  fontSize: 15,
  fontWeight: "700",
  textAlign: "center",
},
  };
});

export { PrincipalTeachersScreen };