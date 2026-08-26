import React, {
  useMemo,
  useState,
} from "react";

import {
  FlatList,
  View,
} from "react-native";

import {
  ActivityIndicator,
  Button,
  Snackbar,
  Text,
  TextInput,
  TouchableRipple,
} from "react-native-paper";

import {
  useQuery,
} from "react-query";

import {
  useNavigation,
} from "@react-navigation/native";

import type {
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";

import {
  Colors,
  makeStyles,
  Metrics,
} from "../../theme";

import {
  principalServices,
} from "../../services";

import {
  RootStackParamList,
  RootStackScreenNames,
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

  updatedAt: string;
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

const PrincipalAdminsScreen = () => {

  const styles = useStyles();

  const navigation =
    useNavigation<NavigationProp>();


  /* ==========================================================
     SEARCH
  ========================================================== */

  const [search, setSearch] =
    useState("");


  /* ==========================================================
     SNACKBAR
  ========================================================== */

  const [
    showSnackbar,
    setShowSnackbar,
  ] = useState(false);

  const [
    snackbarText,
    setSnackbarText,
  ] = useState("");


  /* ==========================================================
     GET ADMINS
  ========================================================== */

  const {
    data,
    isLoading,
    isFetching,
    error,
  } = useQuery(
    [
      "principal-admins",
    ],
    principalServices.getAdmins
  );


  /* ==========================================================
     ADMINS
  ========================================================== */

  const admins: Admin[] =
    data?.admins ?? [];


  /* ==========================================================
     FILTER
  ========================================================== */

  const filteredAdmins =
    useMemo(() => {

      const value =
        search
          .trim()
          .toLowerCase();

      if (!value) {
        return admins;
      }

      return admins.filter(
        (admin) => {

          return (
            admin.name
              .toLowerCase()
              .includes(value) ||

            admin.email
              .toLowerCase()
              .includes(value) ||

            admin.phone
              ?.toLowerCase()
              .includes(value) ||

            admin.employeeId
              ?.toLowerCase()
              .includes(value) ||

            admin.designation
              ?.toLowerCase()
              .includes(value) ||

            admin.department
              ?.toLowerCase()
              .includes(value)
          );

        }
      );

    }, [
      admins,
      search,
    ]);


  /* ==========================================================
     LOADING
  ========================================================== */

  if (
    isLoading ||
    isFetching
  ) {

    return (
      <View
        style={
          styles.loader
        }
      >

        <ActivityIndicator
          size="large"
          color={
            Colors.brandPrimary
          }
        />

        <Text
          style={
            styles.loadingText
          }
        >
          Loading admins...
        </Text>

      </View>
    );
  }


  /* ==========================================================
     ERROR
  ========================================================== */

  if (error) {

    return (
      <View
        style={
          styles.errorContainer
        }
      >

        <Text
          style={
            styles.errorTitle
          }
        >
          Unable to load admins
        </Text>

        <Text
          style={
            styles.errorText
          }
        >
          Please try again later.
        </Text>

      </View>
    );
  }


  /* ==========================================================
     ADMIN ITEM
  ========================================================== */

  const renderAdmin = ({
    item,
  }: {
    item: Admin;
  }) => {

    return (
      <TouchableRipple
        style={
          styles.card
        }
        onPress={() => {

          navigation.navigate(
            RootStackScreenNames.PrincipalAdminDetails,
            {
              adminId:
                item.id,
            }
          );

        }}
        rippleColor={
          Colors.brandPrimaryBg
        }
      >

        <View>

          {/* ==================================================
              HEADER
          ================================================== */}

          <View
            style={
              styles.cardHeader
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
                {item.name
                  .charAt(0)
                  .toUpperCase()}
              </Text>

            </View>


            <View
              style={
                styles.cardHeaderContent
              }
            >

              <Text
                style={
                  styles.name
                }
              >
                {item.name}
              </Text>

              <Text
                style={
                  styles.email
                }
              >
                {item.email}
              </Text>

            </View>


            {/* =================================================
                STATUS
            ================================================= */}

            <View
              style={[
                styles.statusBadge,

                item.isActive
                  ? styles.activeBadge
                  : styles.inactiveBadge,
              ]}
            >

              <Text
                style={
                  styles.statusText
                }
              >
                {item.isActive
                  ? "ACTIVE"
                  : "INACTIVE"}
              </Text>

            </View>

          </View>


          {/* ==================================================
              DETAILS
          ================================================== */}

          {item.phone ? (

            <Text
              style={
                styles.detail
              }
            >
              Phone: {item.phone}
            </Text>

          ) : null}


          {item.designation ? (

            <Text
              style={
                styles.detail
              }
            >
              Designation:{" "}
              {item.designation}
            </Text>

          ) : null}


          {item.department ? (

            <Text
              style={
                styles.detail
              }
            >
              Department:{" "}
              {item.department}
            </Text>

          ) : null}


          {item.employeeId ? (

            <Text
              style={
                styles.detail
              }
            >
              Employee ID:{" "}
              {item.employeeId}
            </Text>

          ) : null}


          {/* ==================================================
              PASSWORD STATUS
          ================================================== */}

          {item.mustChangePassword ? (

            <View
              style={
                styles.passwordBadge
              }
            >

              <Text
                style={
                  styles.passwordBadgeText
                }
              >
                Password change required
              </Text>

            </View>

          ) : null}

        </View>

      </TouchableRipple>
    );
  };


  /* ==========================================================
     UI
  ========================================================== */

  return (
    <View
      style={
        styles.container
      }
    >

      {/* ======================================================
          HEADER
      ====================================================== */}

      <View
        style={
          styles.header
        }
      >

        <View
          style={
            styles.headerText
          }
        >

          <Text
            style={
              styles.title
            }
          >
            School Admins
          </Text>

          <Text
            style={
              styles.subtitle
            }
          >
            Manage administrators in your school
          </Text>

        </View>


        {/* ====================================================
            CREATE ADMIN
        ==================================================== */}

        <Button
          mode="contained"
          icon="plus"
          onPress={() => {

            navigation.navigate(
              RootStackScreenNames.PrincipalCreateAdmin
            );

          }}
          style={
            styles.createButton
          }
          contentStyle={
            styles.createButtonContent
          }
        >
          Create Admin
        </Button>

      </View>


      {/* ======================================================
          SEARCH
      ====================================================== */}

      <TextInput
        mode="outlined"
        label="Search admins"
        value={search}
        onChangeText={
          setSearch
        }
        autoCapitalize="none"
        autoCorrect={false}
        style={
          styles.search
        }
        left={
          <TextInput.Icon
            icon="magnify"
          />
        }
      />


      {/* ======================================================
          ADMIN COUNT
      ====================================================== */}

      <View
        style={
          styles.countContainer
        }
      >

        <Text
          style={
            styles.countText
          }
        >
          {filteredAdmins.length}{" "}
          {filteredAdmins.length === 1
            ? "admin"
            : "admins"}
        </Text>

      </View>


      {/* ======================================================
          LIST
      ====================================================== */}

      <FlatList
        data={
          filteredAdmins
        }
        renderItem={
          renderAdmin
        }
        keyExtractor={(
          item
        ) => item.id}
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.list
        }
        keyboardShouldPersistTaps="handled"

        ListEmptyComponent={

          <View
            style={
              styles.empty
            }
          >

            <View
              style={
                styles.emptyIcon
              }
            >

              <Text
                style={
                  styles.emptyIconText
                }
              >
                A
              </Text>

            </View>

            <Text
              style={
                styles.emptyTitle
              }
            >
              {search.trim()
                ? "No admins found"
                : "No admins available"}
            </Text>

            <Text
              style={
                styles.emptyText
              }
            >
              {search.trim()
                ? "Try a different search term."
                : "Create a school admin to manage your school."}
            </Text>


            {!search.trim() ? (

              <Button
                mode="contained"
                icon="plus"
                onPress={() => {

                  navigation.navigate(
                    RootStackScreenNames.PrincipalCreateAdmin
                  );

                }}
                style={
                  styles.emptyButton
                }
              >
                Create Admin
              </Button>

            ) : null}

          </View>

        }
      />


      {/* ======================================================
          SNACKBAR
      ====================================================== */}

      <Snackbar
        visible={
          showSnackbar
        }
        onDismiss={() => {

          setShowSnackbar(
            false
          );

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


/* ============================================================
   STYLES
============================================================ */

const useStyles =
  makeStyles(() => {

    return {

      container: {
        flex: 1,

        padding:
          Metrics.x4,
      },


      /* ======================================================
         HEADER
      ====================================================== */

      header: {
        flexDirection:
          "row",

        alignItems:
          "flex-start",

        justifyContent:
          "space-between",

        marginBottom:
          Metrics.x4,

        gap:
          Metrics.x3,
      },


      headerText: {
        flex: 1,
      },


      title: {
        fontSize: 28,

        fontWeight:
          "700",
      },


      subtitle: {
        fontSize: 15,

        color:
          Colors.subtext,

        marginTop:
          Metrics.x1,
      },


      createButton: {
        borderRadius:
          Metrics.x2,
      },


      createButtonContent: {
        paddingHorizontal:
          Metrics.x1,
      },


      /* ======================================================
         SEARCH
      ====================================================== */

      search: {
        marginBottom:
          Metrics.x2,
      },


      /* ======================================================
         COUNT
      ====================================================== */

      countContainer: {
        marginBottom:
          Metrics.x3,
      },


      countText: {
        fontSize: 13,

        color:
          Colors.subtext,

        fontWeight:
          "600",
      },


      /* ======================================================
         LIST
      ====================================================== */

      list: {
        paddingBottom:
          Metrics.x6,
      },


      /* ======================================================
         CARD
      ====================================================== */

      card: {
        padding:
          Metrics.x4,

        marginBottom:
          Metrics.x3,

        borderRadius:
          Metrics.x3,

        backgroundColor:
          Colors.brandPrimaryBg,
      },


      cardHeader: {
        flexDirection:
          "row",

        alignItems:
          "center",
      },


      cardHeaderContent: {
        flex: 1,

        marginLeft:
          Metrics.x3,
      },


      /* ======================================================
         AVATAR
      ====================================================== */

      avatar: {
        width: 48,

        height: 48,

        borderRadius: 24,

        alignItems:
          "center",

        justifyContent:
          "center",

        backgroundColor:
          Colors.background,
      },


      avatarText: {
        fontSize: 20,

        fontWeight:
          "800",
      },


      /* ======================================================
         TEXT
      ====================================================== */

      name: {
        fontSize: 17,

        fontWeight:
          "700",
      },


      email: {
        fontSize: 14,

        color:
          Colors.subtext,

        marginTop:
          Metrics.x1,
      },


      detail: {
        fontSize: 13,

        color:
          Colors.subtext,

        marginTop:
          Metrics.x1,
      },


      /* ======================================================
         STATUS
      ====================================================== */

      statusBadge: {
        paddingHorizontal:
          Metrics.x2,

        paddingVertical:
          Metrics.x1,

        borderRadius:
          20,
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

        fontWeight:
          "800",
      },


      /* ======================================================
         PASSWORD
      ====================================================== */

      passwordBadge: {
        alignSelf:
          "flex-start",

        marginTop:
          Metrics.x2,

        paddingHorizontal:
          Metrics.x2,

        paddingVertical:
          Metrics.x1,

        borderRadius:
          Metrics.x2,

        backgroundColor:
          Colors.warningBg,
      },


      passwordBadgeText: {
        fontSize: 11,

        fontWeight:
          "700",
      },


      /* ======================================================
         LOADING
      ====================================================== */

      loader: {
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

        fontSize: 14,
      },


      /* ======================================================
         ERROR
      ====================================================== */

      errorContainer: {
        flex: 1,

        alignItems:
          "center",

        justifyContent:
          "center",

        padding:
          Metrics.x4,
      },


      errorTitle: {
        fontSize: 18,

        fontWeight:
          "700",

        textAlign:
          "center",
      },


      errorText: {
        marginTop:
          Metrics.x2,

        color:
          Colors.subtext,

        textAlign:
          "center",
      },


      /* ======================================================
         EMPTY
      ====================================================== */

      empty: {
        alignItems:
          "center",

        paddingTop:
          Metrics.x6,

        paddingHorizontal:
          Metrics.x4,
      },


      emptyIcon: {
        width: 64,

        height: 64,

        borderRadius: 32,

        alignItems:
          "center",

        justifyContent:
          "center",

        backgroundColor:
          Colors.brandPrimaryBg,

        marginBottom:
          Metrics.x3,
      },


      emptyIconText: {
        fontSize: 28,

        fontWeight:
          "800",
      },


      emptyTitle: {
        fontSize: 17,

        fontWeight:
          "600",

        textAlign:
          "center",
      },


      emptyText: {
        fontSize: 14,

        color:
          Colors.subtext,

        textAlign:
          "center",

        marginTop:
          Metrics.x2,

        lineHeight: 20,
      },


      emptyButton: {
        marginTop:
          Metrics.x4,

        borderRadius:
          Metrics.x2,
      },

    };
  });


/* ============================================================
   EXPORT
============================================================ */

export {
  PrincipalAdminsScreen,
};