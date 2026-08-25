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
} from "../../types";

import {
  Colors,
  makeStyles,
  Metrics,
} from "../../theme";

type AcademicTile = {
  title: string;
  subtitle: string;
  icon: string;
  onPress: () => void;
};

const PrincipalAcademicsScreen = () => {
  const styles = useStyles();

  const navigation =
    useNavigation<
      NativeStackNavigationProp<RootStackParamList>
    >();

  const [showSnackbar, setShowSnackbar] =
    useState(false);

  const [snackbarText, setSnackbarText] =
    useState("");

  /*
   * ============================================================
   * PLACEHOLDER
   * ============================================================
   *
   * These modules will be connected to the actual academic APIs
   * when those APIs are available.
   */

  const comingSoon = (message: string) => {
    setSnackbarText(message);
    setShowSnackbar(true);
  };

  /*
   * ============================================================
   * ACADEMIC MODULES
   * ============================================================
   */

  const tiles: AcademicTile[] = [
    {
      title: "Attendance",
      subtitle:
        "View class-wise attendance summary",
      icon: "📅",
      onPress: () => {
        comingSoon(
          "Attendance reports coming next."
        );
      },
    },

    {
      title: "Mark Sheets",
      subtitle:
        "View student academic performance",
      icon: "📝",
      onPress: () => {
        comingSoon(
          "Mark sheets coming next."
        );
      },
    },

    {
      title: "Results",
      subtitle:
        "View examination results",
      icon: "📊",
      onPress: () => {
        comingSoon(
          "Results dashboard coming next."
        );
      },
    },

    {
      title: "Pass / Fail",
      subtitle:
        "View pass and fail statistics",
      icon: "📈",
      onPress: () => {
        comingSoon(
          "Pass/fail statistics coming next."
        );
      },
    },

    {
      title: "Class Performance",
      subtitle:
        "Compare academic performance by class",
      icon: "🏫",
      onPress: () => {
        comingSoon(
          "Class performance coming next."
        );
      },
    },

    {
      title: "Academic Reports",
      subtitle:
        "View consolidated academic reports",
      icon: "📚",
      onPress: () => {
        comingSoon(
          "Academic reports coming next."
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
    item: AcademicTile;
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
      <View style={styles.header}>
        <Text style={styles.title}>
          Academic Dashboard
        </Text>

        <Text style={styles.subtitle}>
          School-wide academic overview
        </Text>
      </View>

      <FlatList
        data={tiles}
        renderItem={renderTile}
        keyExtractor={(item) =>
          item.title
        }
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.list
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

    header: {
      marginBottom: Metrics.x4,
    },

    title: {
      fontSize: 28,
      fontWeight: "700",
    },

    subtitle: {
      fontSize: 15,
      color: Colors.subtext,
      marginTop: Metrics.x1,
    },

    list: {
      paddingBottom: Metrics.x5,
    },

    tile: {
      flex: 1,
      minHeight: 150,
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
  };
});

export { PrincipalAcademicsScreen };