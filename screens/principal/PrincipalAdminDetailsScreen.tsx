import React from "react";

import {
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import {
  ActivityIndicator,
  Button,
  Card,
  Chip,
  Divider,
  Snackbar,
  Text,
} from "react-native-paper";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "react-query";

import {
  useNavigation,
  useRoute,
} from "@react-navigation/native";

import type {
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";

import {
  principalServices,
} from "../../services";

import {
  Colors,
  Metrics,
} from "../../theme";

import {
  RootStackParamList,
} from "../../types";


/* ============================================================
   TYPES
============================================================ */

type Admin = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  designation?: string | null;
  department?: string | null;
  employeeId?: string | null;
  profilePhotoUrl?: string | null;
  isActive: boolean;
  mustChangePassword: boolean;
  lastLogin?: string | null;
  createdAt: string;
  updatedAt?: string | null;
};


/* ============================================================
   NAVIGATION
============================================================ */

type NavigationProp =
  NativeStackNavigationProp<
    RootStackParamList
  >;


/* ============================================================
   SCREEN
============================================================ */

const PrincipalAdminDetailsScreen =
  () => {

    const navigation =
      useNavigation<NavigationProp>();

    const route =
      useRoute<any>();

    const queryClient =
      useQueryClient();

    const adminId =
      route.params?.adminId;


    /* ========================================================
       SNACKBAR
    ======================================================== */

    const [
      snackbarVisible,
      setSnackbarVisible,
    ] = React.useState(false);

    const [
      snackbarMessage,
      setSnackbarMessage,
    ] = React.useState("");


    const showMessage = (
      message: string
    ) => {

      setSnackbarMessage(
        message
      );

      setSnackbarVisible(
        true
      );
    };


    /* ========================================================
       ADMINS
    ======================================================== */

    const {
      data,
      isLoading,
      error,
    } = useQuery(
      [
        "principal-admins",
      ],
      principalServices.getAdmins
    );


    const admins: Admin[] =
      data?.admins ?? [];


    const admin =
      admins.find(
        (item) =>
          item.id === adminId
      );


    /* ========================================================
       STATUS MUTATION
    ======================================================== */

    const statusMutation =
      useMutation(
        ({
          userId,
          isActive,
        }: {
          userId: string;
          isActive: boolean;
        }) =>
          principalServices.updateAdminStatus(
            userId,
            isActive
          ),

        {
          onSuccess: (
            response
          ) => {

            showMessage(
              response?.message ??
                "Admin status updated successfully"
            );

            queryClient.invalidateQueries(
              [
                "principal-admins",
              ]
            );
          },

          onError: (
            error: any
          ) => {

            showMessage(
              error?.response?.data?.message ??
                "Unable to update admin status"
            );
          },
        }
      );


    /* ========================================================
       LOADING
    ======================================================== */

    if (isLoading) {

      return (
        <View
          style={
            styles.center
          }
        >

          <ActivityIndicator
            size="large"
          />

          <Text
            style={
              styles.loadingText
            }
          >
            Loading admin details...
          </Text>

        </View>
      );
    }


    /* ========================================================
       ERROR
    ======================================================== */

    if (error || !admin) {

      return (
        <View
          style={
            styles.center
          }
        >

          <Text
            style={
              styles.errorTitle
            }
          >
            Admin not found
          </Text>

          <Text
            style={
              styles.errorText
            }
          >
            Unable to load the selected administrator.
          </Text>

          <Button
            mode="outlined"
            onPress={() =>
              navigation.goBack()
            }
            style={
              styles.backButton
            }
          >
            Go Back
          </Button>

        </View>
      );
    }


    /* ========================================================
       STATUS
    ======================================================== */

    const statusText =
      admin.isActive
        ? "Active"
        : "Inactive";


    const passwordStatus =
      admin.mustChangePassword
        ? "Password change required"
        : "Password updated";


    /* ========================================================
       FORMAT DATE
    ======================================================== */

    const formatDate = (
      value?: string | null
    ) => {

      if (!value) {
        return "Never";
      }

      return new Date(
        value
      ).toLocaleString();
    };


    /* ========================================================
       STATUS ACTION
    ======================================================== */

    const toggleStatus =
      () => {

        statusMutation.mutate({
          userId:
            admin.id,

          isActive:
            !admin.isActive,
        });
      };


    /* ========================================================
       UI
    ======================================================== */

    return (
      <View
        style={
          styles.screen
        }
      >

        <ScrollView
          showsVerticalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.container
          }
        >

          {/* ==================================================
              HEADER
          ================================================== */}

          <View
            style={
              styles.header
            }
          >

            <Text
              style={
                styles.title
              }
            >
              Admin Details
            </Text>

            <Text
              style={
                styles.subtitle
              }
            >
              View administrator account information
            </Text>

          </View>


          {/* ==================================================
              PROFILE
          ================================================== */}

          <Card
            style={
              styles.card
            }
          >

            <Card.Content>

              <View
                style={
                  styles.profileHeader
                }
              >

                <View
                  style={
                    styles.avatar
                  }
                >

                  <Text
                    style={
                      styles.avatarText
                    }
                  >
                    {admin.name
                      ?.charAt(0)
                      .toUpperCase()}
                  </Text>

                </View>


                <View
                  style={
                    styles.profileInfo
                  }
                >

                  <Text
                    style={
                      styles.name
                    }
                  >
                    {admin.name}
                  </Text>

                  <Text
                    style={
                      styles.designation
                    }
                  >
                    {admin.designation ??
                      "School Admin"}
                  </Text>

                </View>


                <Chip
                  mode="flat"
                  style={
                    admin.isActive
                      ? styles.activeChip
                      : styles.inactiveChip
                  }
                  textStyle={
                    admin.isActive
                      ? styles.activeChipText
                      : styles.inactiveChipText
                  }
                >
                  {statusText}
                </Chip>

              </View>

            </Card.Content>

          </Card>


          {/* ==================================================
              CONTACT INFORMATION
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
                Contact Information
              </Text>


              <DetailRow
                label="Email"
                value={
                  admin.email
                }
              />


              <Divider
                style={
                  styles.divider
                }
              />


              <DetailRow
                label="Phone"
                value={
                  admin.phone ||
                  "Not provided"
                }
              />

            </Card.Content>

          </Card>


          {/* ==================================================
              EMPLOYMENT INFORMATION
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
                Employment Information
              </Text>


              <DetailRow
                label="Designation"
                value={
                  admin.designation ||
                  "School Admin"
                }
              />


              <Divider
                style={
                  styles.divider
                }
              />


              <DetailRow
                label="Department"
                value={
                  admin.department ||
                  "Not provided"
                }
              />


              <Divider
                style={
                  styles.divider
                }
              />


              <DetailRow
                label="Employee ID"
                value={
                  admin.employeeId ||
                  "Not provided"
                }
              />

            </Card.Content>

          </Card>


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


              <DetailRow
                label="Account Status"
                value={
                  statusText
                }
              />


              <Divider
                style={
                  styles.divider
                }
              />


              <DetailRow
                label="Password Status"
                value={
                  passwordStatus
                }
              />


              <Divider
                style={
                  styles.divider
                }
              />


              <DetailRow
                label="Last Login"
                value={
                  formatDate(
                    admin.lastLogin
                  )
                }
              />


              <Divider
                style={
                  styles.divider
                }
              />


              <DetailRow
                label="Created"
                value={
                  formatDate(
                    admin.createdAt
                  )
                }
              />

            </Card.Content>

          </Card>


          {/* ==================================================
              ACTIONS
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
                Account Actions
              </Text>


              <Text
                style={
                  styles.actionDescription
                }
              >
                {admin.isActive
                  ? "Deactivate this admin account to prevent the administrator from signing in."
                  : "Activate this admin account to allow the administrator to sign in again."}
              </Text>


              <Button
                mode={
                  admin.isActive
                    ? "outlined"
                    : "contained"
                }
                icon={
                  admin.isActive
                    ? "account-off"
                    : "account-check"
                }
                onPress={
                  toggleStatus
                }
                loading={
                  statusMutation.isLoading
                }
                disabled={
                  statusMutation.isLoading
                }
                style={
                  styles.statusButton
                }
              >
                {admin.isActive
                  ? "Deactivate Admin"
                  : "Activate Admin"}
              </Button>

            </Card.Content>

          </Card>


          {/* ==================================================
              BACK
          ================================================== */}

          <Button
            mode="text"
            onPress={() =>
              navigation.goBack()
            }
            style={
              styles.backButton
            }
          >
            Back to Admins
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
          duration={2500}
          style={{
            backgroundColor:
              Colors.brandPrimary,
          }}
        >
          {snackbarMessage}
        </Snackbar>

      </View>
    );
  };


/* ============================================================
   DETAIL ROW
============================================================ */

const DetailRow = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => {

  return (
    <View
      style={
        styles.detailRow
      }
    >

      <Text
        style={
          styles.detailLabel
        }
      >
        {label}
      </Text>

      <Text
        style={
          styles.detailValue
        }
      >
        {value}
      </Text>

    </View>
  );
};


/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({

    screen: {
      flex: 1,
    },

    container: {
      padding:
        Metrics.x4,

      paddingBottom:
        Metrics.x6,
    },

    center: {
      flex: 1,

      alignItems:
        "center",

      justifyContent:
        "center",

      padding:
        Metrics.x4,
    },

    loadingText: {
      marginTop:
        Metrics.x3,

      color:
        Colors.subtext,
    },

    errorTitle: {
      fontSize: 20,

      fontWeight:
        "800",
    },

    errorText: {
      fontSize: 14,

      color:
        Colors.subtext,

      marginTop:
        Metrics.x2,

      textAlign:
        "center",
    },

    header: {
      marginBottom:
        Metrics.x4,
    },

    title: {
      fontSize: 28,

      fontWeight:
        "800",
    },

    subtitle: {
      fontSize: 15,

      color:
        Colors.subtext,

      marginTop:
        Metrics.x1,
    },

    card: {
      marginBottom:
        Metrics.x4,

      borderRadius:
        Metrics.x3,
    },

    profileHeader: {
      flexDirection:
        "row",

      alignItems:
        "center",
    },

    avatar: {
      width: 58,

      height: 58,

      borderRadius: 29,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        Colors.brandPrimaryBg,
    },

    avatarText: {
      fontSize: 24,

      fontWeight:
        "800",
    },

    profileInfo: {
      flex: 1,

      marginLeft:
        Metrics.x3,
    },

    name: {
      fontSize: 20,

      fontWeight:
        "800",
    },

    designation: {
      fontSize: 14,

      color:
        Colors.subtext,

      marginTop:
        Metrics.x1,
    },

    activeChip: {
      backgroundColor:
        Colors.successBg,
    },

    inactiveChip: {
      backgroundColor:
        Colors.errorBg,
    },

    activeChipText: {
      color:
        Colors.success,
    },

    inactiveChipText: {
      color:
        Colors.error,
    },

    sectionTitle: {
      fontSize: 18,

      fontWeight:
        "800",

      marginBottom:
        Metrics.x3,
    },

    detailRow: {
      paddingVertical:
        Metrics.x2,
    },

    detailLabel: {
      fontSize: 12,

      color:
        Colors.subtext,

      marginBottom:
        Metrics.x1,
    },

    detailValue: {
      fontSize: 15,

      fontWeight:
        "600",
    },

    divider: {
      marginVertical:
        Metrics.x1,
    },

    actionDescription: {
      fontSize: 14,

      color:
        Colors.subtext,

      lineHeight: 20,

      marginBottom:
        Metrics.x3,
    },

    statusButton: {
      borderRadius:
        Metrics.x2,
    },

    backButton: {
      marginTop:
        Metrics.x1,
    },

  });


export {
  PrincipalAdminDetailsScreen,
};