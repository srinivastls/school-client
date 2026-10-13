import React, {
  useState,
} from "react";

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
  useNavigation,
  useRoute,
} from "@react-navigation/native";

import type {
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";

import {
  RootStackParamList,
  RootStackScreenNames,
} from "../../types";

import {
  Colors,
  Metrics,
} from "../../theme";

import {
  principalServices,
} from "../../services/principalServices";

import {
  useQueryClient,
} from "react-query";


/* ============================================================
   TYPES
============================================================ */

type ParentChild = {
  id: string;

  admissionNo: string;

  name: string;

  status: string;

  relationship:
    | "FATHER"
    | "MOTHER"
    | "GUARDIAN";

  isPrimary: boolean;

  class: {
    id: string;
    classNumber: string;
    displayName: string;
  };

  section: {
    id: string;
    sectionName: string;
  };
};


type Parent = {
  id: string;

  name: string;

  email: string;

  phone?: string | null;

  isActive: boolean;

  mustChangePassword: boolean;

  lastLogin?: string | null;

  createdAt: string;

  updatedAt: string;

  children: ParentChild[];
};


/* ============================================================
   ROUTE
============================================================ */

type RouteProps =
  RouteProp<
    RootStackParamList,
    RootStackScreenNames.PrincipalParentDetails
  >;


/* ============================================================
   COMPONENT
============================================================ */

const PrincipalParentDetailsScreen =
  () => {

    const route =
      useRoute<RouteProps>();

    const navigation =
      useNavigation<
        NativeStackNavigationProp<
          RootStackParamList
        >
      >();

    const queryClient =
      useQueryClient();


    const {
      parent,
    } = route.params;


    /* ========================================================
       STATE
    ======================================================== */

    const [
      loading,
      setLoading,
    ] = useState(false);

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


    /* ========================================================
       MESSAGE
    ======================================================== */

    const showMessage = (
      message: string,
      type: "success" | "error"
    ) => {

      setSnackbarMessage(
        message
      );

      setSnackbarType(
        type
      );

      setSnackbarVisible(
        true
      );
    };


    /* ========================================================
       TOGGLE PARENT STATUS
    ======================================================== */

    const onToggleStatus =
      async () => {

        if (loading) {
          return;
        }

        setLoading(true);

        try {

          /*
           * Parent status API should follow
           * the same pattern as teacher status.
           *
           * If your backend route is:
           *
           * PATCH /auth/parent/:id/status
           *
           * this service method will be used.
           */

          const response =
            await principalServices
              .updateParentStatus(
                parent.id,
                !parent.isActive
              );


          showMessage(
            response?.message ??
              "Parent account updated successfully",
            "success"
          );


          queryClient.invalidateQueries(
            [
              "principal-parents",
            ]
          );

          /*
           * Return to parent list after
           * successful update.
           */

          setTimeout(() => {

            navigation.goBack();

          }, 600);

        } catch (
          error: any
        ) {

          console.log(
            "UPDATE PARENT STATUS ERROR:",
            error?.response?.data ??
              error
          );

          showMessage(
            error?.response?.data?.message ??
              "Unable to update parent account",
            "error"
          );

        } finally {

          setLoading(false);

        }
      };


    /* ========================================================
       INITIAL
    ======================================================== */

    const initial =
      parent.name
        ?.trim()
        ?.charAt(0)
        ?.toUpperCase() ||
      "P";


    /* ========================================================
       UI
    ======================================================== */

    return (

      <View
        style={
          styles.container
        }
      >

        <ScrollView
          showsVerticalScrollIndicator={
            false
          }

          contentContainerStyle={
            styles.content
          }
        >

          {/* ==================================================
              HEADER
          ================================================== */}

          {/* ==================================================
    MODERN PROFILE HEADER
================================================== */}

<View style={styles.header}>
  <View style={styles.avatar}>
    <Text style={styles.avatarText}>
      {initial}
    </Text>
  </View>

  <Text style={styles.name}>
    {parent.name || "Parent"}
  </Text>

  <Text style={styles.designation}>
    Parent Account
  </Text>

  <View
    style={[
      styles.statusBadge,
      parent.isActive
        ? styles.activeBadge
        : styles.inactiveBadge,
    ]}
  >
    <View
      style={[
        styles.statusDot,
        parent.isActive
          ? styles.activeDot
          : styles.inactiveDot,
      ]}
    />

    <Text
      style={[
        styles.statusText,
        parent.isActive
          ? styles.activeText
          : styles.inactiveText,
      ]}
    >
      {parent.isActive ? "Active" : "Inactive"}
    </Text>
  </View>
</View>


          {/* ==================================================
              ACCOUNT INFORMATION
          ================================================== */}

          <Card
            style={
              styles.card
            }
          >

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
                value={
                  parent.name ||
                  "Not provided"
                }
              />


              <InfoRow
                label="Email"
                value={
                  parent.email
                }
              />


              <InfoRow
                label="Phone"
                value={
                  parent.phone ??
                  "Not provided"
                }
              />


              <InfoRow
                label="Account Status"
                value={
                  parent.isActive
                    ? "Active"
                    : "Inactive"
                }
              />


              <InfoRow
                label="Password Status"
                value={
                  parent.mustChangePassword
                    ? "Password change required"
                    : "Normal"
                }
              />

            </Card.Content>

          </Card>


          {/* ==================================================
              CHILDREN
          ================================================== */}

          <Card
            style={
              styles.card
            }
          >

            <Card.Content>

              <Text
                style={
                  styles.sectionTitle
                }
              >
                Children
              </Text>


              {parent.children.length ===
              0 ? (

                <View
                  style={
                    styles.emptyChildren
                  }
                >

                  <Text
                    style={
                      styles.muted
                    }
                  >
                    No students linked to this
                    parent account.
                  </Text>

                </View>

              ) : (

                parent.children.map(
                  (
                    child,
                    index
                  ) => (

                    <View
  key={child.id}
  style={[
    styles.childCard,
    index !== parent.children.length - 1 &&
      styles.childCardSpacing,
  ]}
>
  <View style={styles.childHeader}>
    <View style={styles.childAvatar}>
      <Text style={styles.childAvatarText}>
        {child.name.charAt(0).toUpperCase()}
      </Text>
    </View>

    <View style={styles.childMain}>
      <Text style={styles.childName}>
        {child.name}
      </Text>

      <Text style={styles.childAdmission}>
        Admission No: {child.admissionNo}
      </Text>
    </View>

    <View style={styles.childStatusBadge}>
      <Text style={styles.childStatusText}>
        {child.status}
      </Text>
    </View>
  </View>

  <View style={styles.childDetails}>
    <InfoRow
      label="Class"
      value={child.class.displayName}
    />

    <InfoRow
      label="Section"
      value={child.section.sectionName}
    />

    <InfoRow
      label="Relationship"
      value={formatRelationship(child.relationship)}
    />

    <InfoRow
      label="Primary"
      value={child.isPrimary ? "Yes" : "No"}
      last
    />
  </View>
</View>

                  )
                )

              )}

            </Card.Content>

          </Card>


          {/* ==================================================
              LOGIN INFORMATION
          ================================================== */}

          <Card
            style={
              styles.card
            }
          >

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
                value={
                  formatDate(
                    parent.lastLogin
                  )
                }
              />


              <InfoRow
                label="Account Created"
                value={
                  formatDate(
                    parent.createdAt
                  )
                }
              />


              <InfoRow
                label="Last Updated"
                value={
                  formatDate(
                    parent.updatedAt
                  )
                }
                last
              />

            </Card.Content>

          </Card>


          {/* ==================================================
              ACTION
          ================================================== */}

          <Button
  mode={parent.isActive ? "outlined" : "contained"}
  loading={loading}
  disabled={loading}
  onPress={onToggleStatus}
  style={
    parent.isActive
      ? styles.disableButton
      : styles.enableButton
  }
  contentStyle={styles.actionButtonContent}
  textColor={
    parent.isActive
      ? "#DC2626"
      : "#FFFFFF"
  }
>
  {parent.isActive
    ? "DEACTIVATE PARENT"
    : "ACTIVATE PARENT"}
</Button>


          <Button
            mode="text"
            disabled={
              loading
            }

            onPress={() =>
              navigation.goBack()
            }
          >
            BACK
          </Button>

        </ScrollView>


        {/* ====================================================
            SNACKBAR
        ==================================================== */}

        <Snackbar
          visible={
            snackbarVisible
          }

          onDismiss={() =>
            setSnackbarVisible(
              false
            )
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
          {
            snackbarMessage
          }
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
  last = false,
}: {
  label: string;
  value: string;
  last?: boolean;
}) => {

  return (

    <View
      style={[
        styles.infoRow,

        !last &&
          styles.infoRowBorder,
      ]}
    >

      <Text
        style={
          styles.infoLabel
        }
      >
        {label}
      </Text>


      <Text
        style={
          styles.infoValue
        }
      >
        {value}
      </Text>

    </View>
  );
};


/* ============================================================
   RELATIONSHIP
============================================================ */

const formatRelationship = (
  relationship:
    | "FATHER"
    | "MOTHER"
    | "GUARDIAN"
) => {

  switch (
    relationship
  ) {

    case "FATHER":
      return "Father";

    case "MOTHER":
      return "Mother";

    case "GUARDIAN":
      return "Guardian";

    default:
      return "Parent";
  }
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
  container: {
    flex: 1,
    backgroundColor: "#F5F7FB",
  },

  content: {
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
    borderWidth: 4,
    borderColor: "#FFFFFF",
    marginBottom: Metrics.x3,
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
    fontSize: 27,
    lineHeight: 35,
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

  /* ========================================================
     STATUS
  ======================================================== */

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
    minHeight: 50,
    paddingVertical: Metrics.x3,
    justifyContent: "center",
  },

  infoRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#EEF1F5",
  },

  infoLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    color: Colors.subtext,
    marginBottom: Metrics.x1,
    textTransform: "uppercase",
  },

  infoValue: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "600",
    color: "#263247",
  },

  /* ========================================================
     CHILDREN
  ======================================================== */

  childCard: {
    padding: Metrics.x3,
    borderRadius: 16,
    backgroundColor: "#F7F9FC",
    borderWidth: 1,
    borderColor: "#E8ECF3",
  },

  childCardSpacing: {
    marginBottom: Metrics.x3,
  },

  childHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  childAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.brandPrimary,
  },

  childAvatarText: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "800",
  },

  childMain: {
    flex: 1,
    marginLeft: Metrics.x3,
    paddingRight: Metrics.x2,
  },

  childName: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "800",
    color: "#172033",
  },

  childAdmission: {
    fontSize: 12,
    lineHeight: 18,
    color: Colors.subtext,
    marginTop: Metrics.x1,
  },

  childStatusBadge: {
    paddingHorizontal: Metrics.x2,
    paddingVertical: Metrics.x1,
    borderRadius: 15,
    backgroundColor: "#DCFCE7",
  },

  childStatusText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#15803D",
  },

  childDetails: {
    marginTop: Metrics.x3,
    paddingTop: Metrics.x2,
    borderTopWidth: 1,
    borderTopColor: "#E8ECF3",
  },

  emptyChildren: {
    paddingVertical: Metrics.x3,
  },

  muted: {
    color: Colors.subtext,
    fontSize: 14,
    lineHeight: 21,
  },

  /* ========================================================
     ACTIONS
  ======================================================== */

  disableButton: {
    marginTop: Metrics.x2,
    borderRadius: 12,
    borderColor: "#DC2626",
  },

  enableButton: {
    marginTop: Metrics.x2,
    borderRadius: 12,
    backgroundColor: Colors.brandPrimary,
  },

  actionButtonContent: {
    minHeight: 46,
    paddingVertical: Metrics.x1,
  },
});


export {
  PrincipalParentDetailsScreen,
};