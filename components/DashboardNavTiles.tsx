import { useNavigation } from "@react-navigation/native";

import React from "react";

import {
  Text,
  FlatList,
} from "react-native";

import {
  TouchableRipple,
} from "react-native-paper";

import {
  Colors,
  makeStyles,
  Metrics,
} from "../theme";

import {
  RootStackScreenNames,
} from "../types";

import {
  Icon,
  IconPackType,
  IconProps,
  IconSize,
} from "./icon";

import {
  useUserStore,
} from "../store";

/* ============================================================
   TILE TYPE
============================================================ */

type NavTileItem = {
  icon: IconProps;
  text: string;
  subText?: string;
  onPress?: () => void;
};

/* ============================================================
   TILE RENDERER
============================================================ */

const renderNavTile = ({
  item,
  index,
}: {
  item: NavTileItem;
  index: number;
}) => {
  const {
    icon,
    text,
    subText,
    onPress = () => {},
  } = item;

  const isSecondColItem =
    !!(index % 2);

  const isLastItem =
    index === totalTiles - 1;

  const addMarginRight =
    !isSecondColItem &&
    !isLastItem;

  const styles =
    useNavStyles(addMarginRight);

  return (
    <TouchableRipple
      style={styles.container}
      onPress={onPress}
    >
      <>
        <Icon {...icon} />

        <Text style={styles.text}>
          {text}
        </Text>

        {subText ? (
          <Text>
            {subText}
          </Text>
        ) : null}
      </>
    </TouchableRipple>
  );
};

/* ============================================================
   STYLES
============================================================ */

const useNavStyles = makeStyles(
  (addMarginRight: boolean) => ({
    container: {
      backgroundColor:
        Colors.brandPrimaryBg,

      borderRadius:
        Metrics.x3,

      flex: 1,

      alignItems: "center",

      marginBottom:
        Metrics.x4,

      padding:
        Metrics.x4,

      marginRight:
        addMarginRight
          ? Metrics.x3
          : 0,
    },

    text: {
      marginTop:
        Metrics.x2,
    },
  })
);

/* ============================================================
   TOTAL TILES
============================================================ */

let totalTiles = 0;

/* ============================================================
   DASHBOARD NAV TILES
============================================================ */

const DashboardNavTiles = ({
  classStudentsCounts = [],
}: {
  classStudentsCounts: {
    classNumber: string;
    count: string;
  }[];
}) => {
  /*
   * Get authenticated user from Zustand.
   *
   * New backend structure:
   *
   * user.role
   *
   * PRINCIPAL
   * ADMIN
   * TEACHER
   * PARENT
   */

  const user =
    useUserStore(
      (state) => state.user
    );

  const role =
    user?.role;

  /*
   * Root navigation.
   */

  // @ts-ignore
  const navigation =
    useNavigation().getParent();

  /* ==========================================================
     ROLE PERMISSIONS
  ========================================================== */

  const isPrincipal =
    role === "PRINCIPAL";

  const isAdmin =
    role === "ADMIN";

  const isTeacher =
    role === "TEACHER";

  const isParent =
    role === "PARENT";

  /*
   * Principal and Admin can manage
   * school administration.
   *
   * At the moment only Principal
   * should create Admin accounts.
   */

  const canCreateAdmin =
    isPrincipal;

  const canViewAdminList =
    isPrincipal;

  /*
   * These are retained as explicit
   * permissions so the dashboard
   * can easily evolve later.
   */

  const canViewClassData =
    isPrincipal ||
    isAdmin ||
    isTeacher;

  /*
   * Parent dashboard will eventually
   * use child/student-specific data.
   */

  const isParentDashboard =
    isParent;

  /* ==========================================================
     TILES
  ========================================================== */

  const tiles: NavTileItem[] = [];

  /* ----------------------------------------------------------
     PRINCIPAL
  ---------------------------------------------------------- */

  if (canCreateAdmin) {
    tiles.push({
      text: "Create admin",

      icon: {
        name:
          "admin-panel-settings",

        size: "lg",
      },

      onPress: () => {
        navigation?.navigate(
          RootStackScreenNames.Signup
        );
      },
    });
  }

  /* ----------------------------------------------------------
     ADMIN LIST
  ---------------------------------------------------------- */

  if (canViewAdminList) {
    tiles.push({
      text: "Admin list",

      icon: {
        name:
          "people-alt",

        size: "lg",
      },

      onPress: () => {
        navigation?.navigate(
          RootStackScreenNames.AdminList
        );
      },
    });
  }

  /* ----------------------------------------------------------
     CLASS DATA
  ---------------------------------------------------------- */

  if (canViewClassData) {
    classStudentsCounts.forEach(
      (countData) => {
        tiles.push({
          text:
            `Class ${countData.classNumber}`,

          subText:
            `${countData.count} student${
              +countData.count === 1
                ? ""
                : "s"
            }`,

          icon: {
            name:
              "graduation-cap",

            iconPack:
              "Entypo" as IconPackType,

            size:
              "lg" as IconSize,
          },
        });
      }
    );
  }

  /* ----------------------------------------------------------
     PARENT
  ---------------------------------------------------------- */

  /*
   * Don't show school-wide class
   * statistics to parents.
   *
   * Parent-specific tiles will be
   * added later.
   */

  if (isParentDashboard) {
    /*
     * Intentionally empty for now.
     *
     * Example future tiles:
     *
     * - My Child
     * - Attendance
     * - Fees
     * - Results
     * - Homework
     */
  }

  /* ==========================================================
     GRID
  ========================================================== */

  totalTiles =
    tiles.length;

  return (
    <FlatList
      data={tiles}

      renderItem={
        renderNavTile
      }

      numColumns={2}

      keyExtractor={(
        item
      ) =>
        item.text
      }

      contentContainerStyle={{
        flexGrow: 1,
      }}
    />
  );
};

export {
  DashboardNavTiles,
};