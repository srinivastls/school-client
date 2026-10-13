import React, { useState } from "react";

import {
  FlatList,
  View,
  Text,
} from "react-native";

import {
  TextInput,
  TouchableRipple,
} from "react-native-paper";

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
  useQuery,
} from "react-query";

import {
  RootStackParamList,
  RootStackScreenNames,
} from "../../types";


/* ============================================================
   TYPES
============================================================ */

type ParentChild = {
  id: string;

  admissionNo: string;

  name: string;

  phone?: string | null;

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
   NAVIGATION
============================================================ */

type NavigationProp =
  NativeStackNavigationProp<
    RootStackParamList
  >;


/* ============================================================
   SCREEN
============================================================ */

const PrincipalParentsScreen =
  () => {

    const styles =
      useStyles();

    const navigation =
      useNavigation<NavigationProp>();


    const [
      search,
      setSearch,
    ] = useState("");


    /* ========================================================
       GET PARENTS
    ======================================================== */

    const {
      data,
      isLoading,
      error,
    } = useQuery(
      [
        "principal-parents",
      ],
      principalServices.getParents
    );


    const parents: Parent[] =
      data?.parents ?? [];


    /* ========================================================
       SEARCH
    ======================================================== */

    const filteredParents =
      parents.filter(
        (
          parent: Parent
        ) => {

          const value =
            search
              .trim()
              .toLowerCase();

          return (

            parent.name
              ?.toLowerCase()
              .includes(value) ||

            parent.email
              ?.toLowerCase()
              .includes(value) ||

            parent.phone
              ?.toLowerCase()
              .includes(value) ||

            parent.children?.some(
              (child) =>
                child.name
                  ?.toLowerCase()
                  .includes(value) ||

                child.admissionNo
                  ?.toLowerCase()
                  .includes(value)
            )

          );
        }
      );


    /* ========================================================
       PARENT ITEM
    ======================================================== */

    const renderParent = ({
      item,
    }: {
      item: Parent;
    }) => {

      const children =
        item.children ?? [];


      return (

        <TouchableRipple
  style={styles.card}
  onPress={() => {
    navigation.navigate(
      RootStackScreenNames.PrincipalParentDetails,
      {
        parent: item,
      }
    );
  }}
  rippleColor={Colors.brandPrimaryBg}
>
  <View>
    {/* ==================================================
        PARENT HEADER
    ================================================== */}

    <View style={styles.parentHeader}>
      <View style={styles.parentAvatar}>
        <Text style={styles.parentAvatarText}>
          {item.name?.charAt(0).toUpperCase() || "P"}
        </Text>
      </View>

      <View style={styles.parentHeading}>
        <Text style={styles.name}>
          {item.name || "Parent"}
        </Text>

        <Text style={styles.email}>
          {item.email}
        </Text>
      </View>

      <View
        style={[
          styles.statusBadge,
          item.isActive
            ? styles.activeBadge
            : styles.inactiveBadge,
        ]}
      >
        <View
          style={[
            styles.statusDot,
            item.isActive
              ? styles.activeDot
              : styles.inactiveDot,
          ]}
        />

        <Text
          style={[
            styles.statusText,
            item.isActive
              ? styles.activeText
              : styles.inactiveText,
          ]}
        >
          {item.isActive ? "Active" : "Inactive"}
        </Text>
      </View>
    </View>

    {/* ==================================================
        CONTACT DETAILS
    ================================================== */}

    {item.phone ? (
      <Text style={styles.detail}>
        Phone: {item.phone}
      </Text>
    ) : null}

    {/* ==================================================
        CHILDREN
    ================================================== */}

    {children.length > 0 ? (
      <View style={styles.childrenContainer}>
        <Text style={styles.childrenLabel}>
          LINKED STUDENTS ({children.length})
        </Text>

        {children.map((child) => (
          <View
            key={child.id}
            style={styles.childRow}
          >
            <View style={styles.childBullet} />

            <Text style={styles.child}>
              {child.name}
              {"  •  "}
              {child.class.displayName}
              {" - "}
              {child.section.sectionName}
            </Text>
          </View>
        ))}
      </View>
    ) : (
      <Text style={styles.detail}>
        No students linked
      </Text>
    )}

    {/* ==================================================
        NAVIGATION HINT
    ================================================== */}

    <View style={styles.cardFooter}>
      <Text style={styles.viewDetails}>
        View parent details
      </Text>

      <Text style={styles.arrow}>
        →
      </Text>
    </View>
  </View>
</TouchableRipple>
      );
    };


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

          <Text
            style={
              styles.emptyTitle
            }
          >
            Loading parents...
          </Text>

        </View>
      );
    }


    /* ========================================================
       ERROR
    ======================================================== */

    if (error) {

      return (

        <View
          style={
            styles.center
          }
        >

          <Text
            style={
              styles.emptyTitle
            }
          >
            Unable to load parents
          </Text>


          <Text
            style={
              styles.emptyText
            }
          >
            Please try again later.
          </Text>

        </View>
      );
    }


    /* ========================================================
       UI
    ======================================================== */

    return (

      <View
        style={
          styles.container
        }
      >

        {/* ==================================================
            HEADER
        ================================================== */}

        {/* ==================================================
    MODERN HEADER
================================================== */}

<View style={styles.header}>
  <View style={styles.headerTextContainer}>
    <Text style={styles.eyebrow}>
      SCHOOL MANAGEMENT
    </Text>

    <Text style={styles.title}>
      Parents
    </Text>

    <Text style={styles.subtitle}>
      Manage parent accounts and linked students
    </Text>
  </View>

  <View style={styles.countBadge}>
    <Text style={styles.countText}>
      {filteredParents.length} Parents
    </Text>
  </View>
</View>


        {/* ==================================================
            SEARCH
        ================================================== */}

        {/* ==================================================
    SEARCH
================================================== */}

<TextInput
  mode="outlined"
  placeholder="Search parents, email, phone or student"
  value={search}
  onChangeText={setSearch}
  autoCapitalize="none"
  autoCorrect={false}
  style={styles.search}
  outlineStyle={styles.searchOutline}
  left={
    <TextInput.Icon icon="magnify" />
  }
  right={
    search.length > 0 ? (
      <TextInput.Icon
        icon="close"
        onPress={() => setSearch("")}
      />
    ) : null
  }
/>


        {/* ==================================================
            LIST
        ================================================== */}

        <FlatList

          data={
            filteredParents
          }

          renderItem={
            renderParent
          }

          keyExtractor={
            (item) =>
              item.id
          }

          showsVerticalScrollIndicator={
            false
          }

          contentContainerStyle={
            styles.list
          }

          ListEmptyComponent={

            <View
              style={
                styles.empty
              }
            >

              <Text
                style={
                  styles.emptyTitle
                }
              >
                {search.trim()
                  ? "No matching parents"
                  : "No parents available"}
              </Text>


              <Text
                style={
                  styles.emptyText
                }
              >
                {search.trim()
                  ? "Try another name, phone number, email or student."
                  : "Parent accounts will appear here when students are registered."}
              </Text>

            </View>
          }

        />

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

    /* ======================================================
       HEADER
    ====================================================== */

    header: {
      marginBottom: Metrics.x4,
    },

    headerTextContainer: {
      flex: 1,
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
      lineHeight: 38,
      fontWeight: "800",
      color: "#172033",
    },

    subtitle: {
      fontSize: 14,
      lineHeight: 21,
      color: Colors.subtext,
      marginTop: Metrics.x1,
    },

    countBadge: {
      alignSelf: "flex-start",
      marginTop: Metrics.x3,
      paddingHorizontal: Metrics.x3,
      paddingVertical: Metrics.x2,
      borderRadius: 20,
      backgroundColor: Colors.brandPrimaryBg,
    },

    countText: {
      fontSize: 12,
      fontWeight: "700",
      color: Colors.brandPrimary,
    },

    /* ======================================================
       SEARCH
    ====================================================== */

    search: {
      marginBottom: Metrics.x4,
      backgroundColor: "#FFFFFF",
      fontSize: 14,
    },

    searchOutline: {
      borderRadius: 14,
      borderColor: "#DDE2EC",
      borderWidth: 1,
    },

    /* ======================================================
       LIST
    ====================================================== */

    list: {
      paddingBottom: Metrics.x6,
    },

    /* ======================================================
       PARENT CARD
    ====================================================== */

    card: {
      padding: Metrics.x4,
      marginBottom: Metrics.x3,
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

    parentHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
    },

    parentAvatar: {
      width: 46,
      height: 46,
      borderRadius: 23,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: Colors.brandPrimaryBg,
      marginRight: Metrics.x3,
    },

    parentAvatarText: {
      fontSize: 18,
      fontWeight: "800",
      color: Colors.brandPrimary,
    },

    parentHeading: {
      flex: 1,
      paddingRight: Metrics.x2,
    },

    name: {
      fontSize: 16,
      lineHeight: 22,
      fontWeight: "800",
      color: "#172033",
    },

    email: {
      fontSize: 12,
      lineHeight: 18,
      color: Colors.subtext,
      marginTop: Metrics.x1,
    },

    detail: {
      fontSize: 13,
      lineHeight: 19,
      color: Colors.subtext,
      marginTop: Metrics.x3,
    },

    /* ======================================================
       STATUS
    ====================================================== */

    statusBadge: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: Metrics.x2,
      paddingVertical: Metrics.x1,
      borderRadius: 20,
    },

    activeBadge: {
      backgroundColor: "#DCFCE7",
    },

    inactiveBadge: {
      backgroundColor: "#FEE2E2",
    },

    statusDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      marginRight: 5,
    },

    activeDot: {
      backgroundColor: "#16A34A",
    },

    inactiveDot: {
      backgroundColor: "#DC2626",
    },

    statusText: {
      fontSize: 10,
      fontWeight: "800",
    },

    activeText: {
      color: "#15803D",
    },

    inactiveText: {
      color: "#B91C1C",
    },

    /* ======================================================
       CHILDREN
    ====================================================== */

    childrenContainer: {
      marginTop: Metrics.x4,
      paddingTop: Metrics.x3,
      borderTopWidth: 1,
      borderTopColor: "#EEF1F5",
    },

    childrenLabel: {
      fontSize: 10,
      fontWeight: "800",
      letterSpacing: 0.7,
      color: Colors.subtext,
      marginBottom: Metrics.x2,
    },

    childRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginTop: Metrics.x1,
    },

    childBullet: {
      width: 5,
      height: 5,
      borderRadius: 3,
      backgroundColor: Colors.brandPrimary,
      marginTop: 7,
      marginRight: Metrics.x2,
    },

    child: {
      flex: 1,
      fontSize: 13,
      lineHeight: 20,
      fontWeight: "500",
      color: "#334155",
    },

    /* ======================================================
       CARD FOOTER
    ====================================================== */

    cardFooter: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: Metrics.x4,
      paddingTop: Metrics.x3,
      borderTopWidth: 1,
      borderTopColor: "#EEF1F5",
    },

    viewDetails: {
      fontSize: 12,
      fontWeight: "700",
      color: Colors.brandPrimary,
    },

    arrow: {
      fontSize: 20,
      fontWeight: "600",
      color: Colors.brandPrimary,
    },

    /* ======================================================
       LOADING AND EMPTY STATES
    ====================================================== */

    center: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: Metrics.x4,
      backgroundColor: "#F5F7FB",
    },

    empty: {
      alignItems: "center",
      paddingTop: Metrics.x6,
      paddingHorizontal: Metrics.x4,
    },

    emptyTitle: {
      fontSize: 17,
      lineHeight: 24,
      fontWeight: "700",
      color: "#172033",
      textAlign: "center",
    },

    emptyText: {
      fontSize: 14,
      lineHeight: 21,
      color: Colors.subtext,
      textAlign: "center",
      marginTop: Metrics.x2,
    },
  };
});


export {
  PrincipalParentsScreen,
};