import React, { useState } from "react";

import {
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import {
  Button,
  Card,
  Snackbar,
  Text,
} from "react-native-paper";

import {
  RouteProp,
  useRoute,
} from "@react-navigation/native";

import {
  useQueryClient,
} from "react-query";

import {
  RootStackParamList,
  RootStackScreenNames,
} from "../../types";

import {
  userServices,
} from "../../services/authServices";

import {
  Colors,
  Metrics,
} from "../../theme";

/* ============================================================
   ROUTE
============================================================ */

type RouteProps = RouteProp<
  RootStackParamList,
  RootStackScreenNames.PrincipalTeacherDetails
>;

/* ============================================================
   TEACHER TYPE
============================================================ */

type Teacher = {
  id: string;

  name: string;

  email: string;

  phone?: string | null;

  designation?: string | null;

  department?: string | null;

  employeeId?: string | null;

  isActive: boolean;

  mustChangePassword: boolean;

  lastLogin?: string | null;

  createdAt?: string | null;

  updatedAt?: string | null;
};

/* ============================================================
   SCREEN
============================================================ */

const PrincipalTeacherDetailsScreen = () => {
  /* ==========================================================
     ROUTE
  ========================================================== */

  const route = useRoute<RouteProps>();

  const {
    teacher,
  } = route.params as {
    teacher: Teacher;
  };

  /* ==========================================================
     QUERY CLIENT
  ========================================================== */

  const queryClient =
    useQueryClient();

  /* ==========================================================
     STATE
  ========================================================== */

  const [loading, setLoading] =
    useState(false);

  const [
    snackbarVisible,
    setSnackbarVisible,
  ] = useState(false);

  const [
    snackbarMessage,
    setSnackbarMessage,
  ] = useState("");

  const [
    snackbarType,
    setSnackbarType,
  ] = useState<
    "success" | "error"
  >("success");

  /* ==========================================================
     MESSAGE
  ========================================================== */

  const showMessage = (
    message: string,
    type: "success" | "error"
  ) => {
    setSnackbarMessage(message);

    setSnackbarType(type);

    setSnackbarVisible(true);
  };

  /* ==========================================================
     TOGGLE TEACHER STATUS
  ========================================================== */

  const onToggleStatus = async () => {
    if (loading) {
      return;
    }

    setLoading(true);

    try {
      const response =
        await userServices.updateTeacherStatus(
          teacher.id,
          !teacher.isActive
        );

      showMessage(
        response?.message ??
          (
            teacher.isActive
              ? "Teacher account deactivated successfully"
              : "Teacher account activated successfully"
          ),
        "success"
      );

      /*
       * Refresh teacher list.
       */
      queryClient.invalidateQueries([
        "principal-teachers",
      ]);

      /*
       * Refresh teacher details if the
       * details screen uses a query later.
       */
      queryClient.invalidateQueries([
        "principal-teacher",
        teacher.id,
      ]);
    } catch (error: any) {
      console.log(
        "UPDATE TEACHER STATUS ERROR:",
        error?.response?.data ??
          error
      );

      showMessage(
        error?.response?.data?.message ??
          "Unable to update teacher account",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  /* ==========================================================
     UI
  ========================================================== */

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.container
        }
      >
        {/* ====================================================
            HEADER
        ==================================================== */}

        {/* ====================================================
    MODERN PROFILE HEADER
==================================================== */}

<View style={styles.header}>
  <View style={styles.avatar}>
    <Text style={styles.avatarText}>
      {teacher.name.charAt(0).toUpperCase()}
    </Text>
  </View>

  <Text style={styles.name}>{teacher.name}</Text>

  <Text style={styles.designation}>
    {teacher.designation ?? "Teacher"}
  </Text>

  <View
    style={[
      styles.statusBadge,
      teacher.isActive
        ? styles.activeBadge
        : styles.inactiveBadge,
    ]}
  >
    <View
      style={[
        styles.statusDot,
        teacher.isActive
          ? styles.activeDot
          : styles.inactiveDot,
      ]}
    />

    <Text
      style={[
        styles.statusText,
        teacher.isActive
          ? styles.activeText
          : styles.inactiveText,
      ]}
    >
      {teacher.isActive ? "Active" : "Inactive"}
    </Text>
  </View>
</View>

        {/* ====================================================
            ACCOUNT INFORMATION
        ==================================================== */}

        <Card style={styles.card}>
          <Card.Content>
            <Text
              style={
                styles.sectionTitle
              }
            >
              Account Information
            </Text>

            <InfoRow
              label="Name"
              value={teacher.name}
            />

            <InfoRow
              label="Email"
              value={teacher.email}
            />

            <InfoRow
              label="Phone"
              value={
                teacher.phone ??
                "Not provided"
              }
            />

            <InfoRow
              label="Account Status"
              value={
                teacher.isActive
                  ? "Active"
                  : "Inactive"
              }
            />

            <InfoRow
              label="Password Status"
              value={
                teacher.mustChangePassword
                  ? "Password change required"
                  : "Normal"
              }
            />
          </Card.Content>
        </Card>

        {/* ====================================================
            EMPLOYMENT INFORMATION
        ==================================================== */}

        <Card style={styles.card}>
          <Card.Content>
            <Text
              style={
                styles.sectionTitle
              }
            >
              Employment Information
            </Text>

            <InfoRow
              label="Employee ID"
              value={
                teacher.employeeId ??
                "Not provided"
              }
            />

            <InfoRow
              label="Designation"
              value={
                teacher.designation ??
                "Teacher"
              }
            />

            <InfoRow
              label="Department"
              value={
                teacher.department ??
                "Not assigned"
              }
            />
          </Card.Content>
        </Card>

        {/* ====================================================
            LOGIN INFORMATION
        ==================================================== */}

        <Card style={styles.card}>
          <Card.Content>
            <Text
              style={
                styles.sectionTitle
              }
            >
              Login Information
            </Text>

            <InfoRow
              label="Last Login"
              value={formatDate(
                teacher.lastLogin
              )}
            />

            <InfoRow
              label="Account Created"
              value={formatDate(
                teacher.createdAt
              )}
            />

            <InfoRow
              label="Last Updated"
              value={formatDate(
                teacher.updatedAt
              )}
            />
          </Card.Content>
        </Card>

        {/* ====================================================
            ACCOUNT ACTIONS
        ==================================================== */}

        <Card style={styles.card}>
          <Card.Content>
            <Text
              style={
                styles.sectionTitle
              }
            >
              Account Actions
            </Text>

            <Text
              style={
                styles.actionDescription
              }
            >
              {teacher.isActive
                ? "Deactivate this teacher's login account. The teacher will no longer be able to sign in."
                : "Activate this teacher's login account and allow the teacher to sign in again."}
            </Text>

            <Button
  mode={teacher.isActive ? "outlined" : "contained"}
  loading={loading}
  disabled={loading}
  onPress={onToggleStatus}
  style={[
    styles.actionButton,
    !teacher.isActive && {
      backgroundColor: Colors.brandPrimary,
    },
  ]}
  contentStyle={styles.actionButtonContent}
  textColor={
    teacher.isActive
      ? Colors.error
      : "#FFFFFF"
  }
>
  {teacher.isActive
    ? "DEACTIVATE TEACHER"
    : "ACTIVATE TEACHER"}
</Button>
          </Card.Content>
        </Card>

        {/* ====================================================
            TEACHER ID
        ==================================================== */}

        <Card style={styles.card}>
          <Card.Content>
            <Text
              style={
                styles.sectionTitle
              }
            >
              Account Record
            </Text>

            <InfoRow
              label="Teacher ID"
              value={teacher.id}
            />
          </Card.Content>
        </Card>
      </ScrollView>

      {/* ======================================================
          SNACKBAR
      ====================================================== */}

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() =>
          setSnackbarVisible(false)
        }
        duration={3000}
        style={{
          backgroundColor:
            snackbarType ===
            "success"
              ? Colors.successBg
              : Colors.errorBg,
        }}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
};

/* ============================================================
   INFO ROW
============================================================ */

const InfoRow = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>

      <Text
        style={styles.infoValue}
        selectable
      >
        {value}
      </Text>
    </View>
  );
};

/* ============================================================
   DATE
============================================================ */

const formatDate = (
  value?: string | null
) => {
  if (!value) {
    return "Not available";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Not available";
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};

/* ============================================================
   STYLES
============================================================ */

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F5F7FB",
  },

  container: {
    paddingHorizontal: Metrics.x4,
    paddingTop: Metrics.x4,
    paddingBottom: Metrics.x8,
  },

  /* ========================================================
     PROFILE HEADER
  ======================================================== */

  header: {
    alignItems: "center",
    paddingVertical: Metrics.x4,
    marginBottom: Metrics.x4,
  },

  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.brandPrimaryBg,
    marginBottom: Metrics.x3,
    borderWidth: 4,
    borderColor: "#FFFFFF",
    elevation: 3,
    shadowColor: "#000000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  avatarText: {
    fontSize: 34,
    fontWeight: "800",
    color: Colors.brandPrimary,
  },

  name: {
    fontSize: 26,
    lineHeight: 34,
    fontWeight: "800",
    color: "#172033",
    textAlign: "center",
  },

  designation: {
    fontSize: 14,
    color: Colors.subtext,
    marginTop: Metrics.x1,
    textAlign: "center",
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Metrics.x3,
    paddingVertical: Metrics.x2,
    borderRadius: 24,
    marginTop: Metrics.x3,
  },

  activeBadge: {
    backgroundColor: "#DCFCE7",
  },

  inactiveBadge: {
    backgroundColor: "#FEE2E2",
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: Metrics.x2,
  },

  activeDot: {
    backgroundColor: "#16A34A",
  },

  inactiveDot: {
    backgroundColor: "#DC2626",
  },

  statusText: {
    fontSize: 12,
    fontWeight: "700",
  },

  activeText: {
    color: "#15803D",
  },

  inactiveText: {
    color: "#B91C1C",
  },

  /* ========================================================
     CARDS
  ======================================================== */

  card: {
    marginBottom: Metrics.x4,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8ECF3",
    elevation: 0,
    shadowColor: "#000000",
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  sectionTitle: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: "800",
    color: "#172033",
    marginBottom: Metrics.x3,
  },

  /* ========================================================
     INFORMATION ROWS
  ======================================================== */

  infoRow: {
    paddingVertical: Metrics.x3,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F2F6",
  },

  infoLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.subtext,
    marginBottom: Metrics.x1,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },

  infoValue: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "600",
    color: "#263247",
  },

  /* ========================================================
     ACCOUNT ACTIONS
  ======================================================== */

  actionDescription: {
    fontSize: 14,
    lineHeight: 21,
    color: Colors.subtext,
    marginBottom: Metrics.x4,
  },

  actionButton: {
    borderRadius: 12,
    borderWidth: 1,
  },

  actionButtonContent: {
    minHeight: 46,
    paddingVertical: Metrics.x1,
  },
});

export {
  PrincipalTeacherDetailsScreen,
};