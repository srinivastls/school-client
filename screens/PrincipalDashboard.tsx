import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";


import React, { useState } from "react";

import {
  FlatList,
  View,
  Text,
} from "react-native";

import {
  Snackbar,
  TouchableRipple,
} from "react-native-paper";

import {
  RootStackParamList,
  RootStackScreenNames,
} from "../types";

import {
  Colors,
  makeStyles,
  Metrics,
} from "../theme";

import { useUserStore } from "../store";

type PrincipalTile = {
  title: string;
  subtitle: string;
  icon: string;
  onPress: () => void;
};

const PrincipalDashboard = () => {
  const styles = useStyles();

  const navigation =
    useNavigation<
      NativeStackNavigationProp<RootStackParamList>
    >();

  const user = useUserStore(
    (state) => state.user
  );

  const [showSnackbar, setShowSnackbar] =
    useState(false);

  const [snackbarText, setSnackbarText] =
    useState("");

  /*
   * ============================================================
   * AUTHORIZATION CHECK
   * ============================================================
   */

  if (!user) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>
          Session not found.
        </Text>
      </View>
    );
  }

  if (user.role !== "PRINCIPAL") {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>
          You are not authorized to access
          the Principal Dashboard.
        </Text>
      </View>
    );
  }

  /*
   * ============================================================
   * PLACEHOLDER ACTION
   * ============================================================
   */

  const comingSoon = (message: string) => {
    setSnackbarText(message);
    setShowSnackbar(true);
  };

  /*
   * ============================================================
   * PRINCIPAL TILES
   * ============================================================
   */

  const tiles: PrincipalTile[] = [
  // ============================================================
  // PEOPLE / USERS
  // ============================================================

  

  {
    title: "Students",
    subtitle: "View and manage students",
    icon: "🎓",
    onPress: () => {
      navigation.navigate(
        RootStackScreenNames.PrincipalStudents
      );
    },
  },

  {
    title: "Teachers",
    subtitle: "Manage school teachers",
    icon: "👨‍🏫",
    onPress: () => {
      navigation.navigate(
        RootStackScreenNames.PrincipalTeachers
      );
    },
  },

  {
    title: "Parents",
    subtitle: "Manage parent accounts",
    icon: "👨‍👩‍👧",
    onPress: () => {
      navigation.navigate(
        RootStackScreenNames.PrincipalParents
      );
    },
  },

  {
    title: "School Admins",
    subtitle: "Manage school administrators",
    icon: "👨‍💼",
    onPress: () => {
      navigation.navigate(
        RootStackScreenNames.AdminList
      );
    },
  },

  {
    title: "Create Admin",
    subtitle: "Create a school admin",
    icon: "➕",
    onPress: () => {
      navigation.navigate(
        RootStackScreenNames.Signup
      );
    },
  },

  // ============================================================
  // ACADEMICS
  // ============================================================

  {
  title: "Academics",
  subtitle: "School-wide academic reports",
  icon: "📚",
  onPress: () => {
    navigation.navigate(
      RootStackScreenNames.PrincipalAcademics
    );
  },
},

  {
    title: "Classes",
    subtitle: "View classes and students",
    icon: "🏫",
    onPress: () => {
      navigation.navigate(
        RootStackScreenNames.PrincipalClasses
      );
    },
  },

  {
    title: "Attendance",
    subtitle: "School-wide attendance reports",
    icon: "📅",
    onPress: () => {
      comingSoon(
        "Attendance reports coming next."
      );
    },
  },

  {
    title: "Mark Sheets",
    subtitle: "View academic performance",
    icon: "📝",
    onPress: () => {
      comingSoon(
        "Mark sheets coming next."
      );
    },
  },

  {
    title: "Results",
    subtitle: "Pass and fail statistics",
    icon: "📊",
    onPress: () => {
      comingSoon(
        "Result statistics coming next."
      );
    },
  },

  // ============================================================
  // FINANCE
  // ============================================================


  {
  title: "Finance",
  subtitle: "School-wide financial reports",
  icon: "💰",
  onPress: () => {
    navigation.navigate(
      RootStackScreenNames.PrincipalFinance
    );
  },
},

  {
    title: "Fee Collection",
    subtitle: "View school fee collection",
    icon: "💰",
    onPress: () => {
      comingSoon(
        "Fee collection reports coming next."
      );
    },
  },

  {
    title: "Pending Dues",
    subtitle: "View pending fee amounts",
    icon: "💳",
    onPress: () => {
      comingSoon(
        "Pending dues coming next."
      );
    },
  },

  {
    title: "Defaulters",
    subtitle: "View fee defaulter list",
    icon: "⚠️",
    onPress: () => {
      comingSoon(
        "Defaulter reports coming next."
      );
    },
  },

  {
    title: "Fee Waivers",
    subtitle: "Approve or reject waivers",
    icon: "✅",
    onPress: () => {
      comingSoon(
        "Fee waiver management coming next."
      );
    },
  },

  {
    title: "Coupons",
    subtitle: "Approve or reject coupons",
    icon: "🎟️",
    onPress: () => {
      comingSoon(
        "Coupon management coming next."
      );
    },
  },

  // ============================================================
  // COMPLAINTS
  // ============================================================

  {
    title: "Complaints",
    subtitle: "Manage parent complaints",
    icon: "📢",
    onPress: () => {
      comingSoon(
        "Complaint management coming next."
      );
    },
  },

  // ============================================================
  // SCHOOL CONFIGURATION
  // ============================================================

  {
    title: "School Settings",
    subtitle: "Configure school settings",
    icon: "⚙️",
    onPress: () => {
      comingSoon(
        "School settings coming next."
      );
    },
  },

  // ============================================================
  // AUDIT
  // ============================================================

  {
    title: "Audit Logs",
    subtitle: "View all user activities",
    icon: "🔍",
    onPress: () => {
      comingSoon(
        "Audit logs coming next."
      );
    },
  },

  // ============================================================
  // COMMUNICATION
  // ============================================================

  {
    title: "Announcements",
    subtitle: "Send school announcements",
    icon: "📣",
    onPress: () => {
      comingSoon(
        "Announcements coming next."
      );
    },
  },
];

  /*
   * ============================================================
   * TILE
   * ============================================================
   */

  const renderTile = ({
    item,
  }: {
    item: PrincipalTile;
  }) => {
    return (
      <TouchableRipple
        style={styles.tile}
        onPress={item.onPress}
        rippleColor={Colors.brandPrimaryBg}
      >
        <View>
          <Text style={styles.icon}>
            {item.icon}
          </Text>

          <Text style={styles.tileTitle}>
            {item.title}
          </Text>

          <Text style={styles.tileSubtitle}>
            {item.subtitle}
          </Text>
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

      {/* SCHOOL HEADER */}

      <View style={styles.header}>
        <Text style={styles.schoolName}>
          {user.schoolName}
        </Text>

        <Text style={styles.schoolCode}>
          {user.schoolCode}
        </Text>

        <Text style={styles.welcome}>
          Welcome, {user.name}
        </Text>

        <Text style={styles.role}>
          Principal
        </Text>
      </View>

      {/* DASHBOARD */}

      <FlatList
        data={tiles}
        renderItem={renderTile}
        keyExtractor={(item) => item.title}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
      />

      {/* SNACKBAR */}

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

    header: {
      marginBottom: Metrics.x4,
    },

    schoolName: {
      fontSize: 28,
      fontWeight: "700",
    },

    schoolCode: {
      fontSize: 14,
      marginTop: Metrics.x1,
      color: Colors.subtext,
    },

    welcome: {
      fontSize: 18,
      fontWeight: "600",
      marginTop: Metrics.x3,
    },

    role: {
      fontSize: 14,
      marginTop: Metrics.x1,
      color: Colors.subtext,
    },

    list: {
      paddingBottom: Metrics.x5,
    },

    tile: {
      flex: 1,
      minHeight: 145,
      margin: Metrics.x2,
      padding: Metrics.x4,
      borderRadius: Metrics.x3,
      backgroundColor:
        Colors.brandPrimaryBg,
      justifyContent: "center",
    },

    icon: {
      fontSize: 32,
      marginBottom: Metrics.x2,
    },

    tileTitle: {
      fontSize: 17,
      fontWeight: "700",
    },

    tileSubtitle: {
      fontSize: 13,
      color: Colors.subtext,
      marginTop: Metrics.x1,
    },

    center: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: Metrics.x5,
    },

    errorText: {
      color: Colors.error,
      textAlign: "center",
      fontSize: 16,
    },
  };
});

export { PrincipalDashboard };