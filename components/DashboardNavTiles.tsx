import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { Text, FlatList } from "react-native";
import { TouchableRipple } from "react-native-paper";

import { Colors, makeStyles, Metrics } from "../theme";
import { RootStackScreenNames } from "../types";
import { Icon, IconPackType, IconProps, IconSize } from "./icon";
import Snackbar from "react-native-snackbar";
import { isUserSuperAdmin } from "../utils";

type NavTileItem = {
  icon: IconProps;
  text: string;
  subText?: string;
  isRestricted?: boolean;
  onPress?: () => void;
};

const renderNavTile = ({
  item,
  index,
}: {
  item: NavTileItem;
  index: number;
}) => {
  const { icon, text, subText, onPress = () => {}, isRestricted } = item;
  const isSecondColItem = !!(index % 2);
  const isLastItem = index === totalTiles - 1;
  const addMarginRight = !isSecondColItem && !isLastItem;
  const styles = useNavStyles(addMarginRight, !!isRestricted);

  if (isRestricted) {
    return null;
  }

  // const onTilePress = isRestricted
  //   ? () => {
  //       Snackbar.show({
  //         text: "Contact your Super Admin to create admin",
  //         duration: Snackbar.LENGTH_LONG,
  //       });
  //     }
  //   : onPress;

  return (
    <TouchableRipple style={styles.container} onPress={onPress}>
      <>
        <Icon {...icon} />
        <Text style={styles.text}>{text}</Text>
        {subText && <Text>{subText}</Text>}
      </>
    </TouchableRipple>
  );
};

const useNavStyles = makeStyles(
  (addMarginRight: boolean, isRestricted: boolean) => ({
    container: {
      backgroundColor: isRestricted
        ? Colors.backgroundDisabled
        : Colors.brandPrimaryBg,
      opacity: isRestricted ? 0.5 : 1,
      borderRadius: Metrics.x3,
      flex: 1,
      alignItems: "center",
      marginBottom: Metrics.x4,
      padding: Metrics.x4,
      marginRight: addMarginRight ? Metrics.x3 : 0,
    },
    text: { marginTop: Metrics.x2 },
  })
);

var totalTiles = 0;

const DashboardNavTiles = ({
  classStudentsCounts = [],
}: {
  classStudentsCounts: { classNumber: string; count: string }[];
}) => {
  //@ts-ignore
  const navigation = useNavigation().getParent("RootStack");
  const isRestricted = !isUserSuperAdmin();

  const tiles: NavTileItem[] = [
    {
      text: "Create coupon",
      onPress: () => {
        navigation?.navigate(RootStackScreenNames.CreateCoupon);
      },
      icon: {
        name: "tag-multiple",
        iconPack: "MaterialCommunityIcons",
        size: "lg",
      },
      isRestricted,
    },
    {
      text: "Create admin",
      icon: {
        name: "admin-panel-settings",
        size: "lg",
      },
      onPress: () => {
        navigation?.navigate(RootStackScreenNames.Signup);
      },
      isRestricted,
    },
    {
      text: "Coupon list",
      icon: {
        name: "list-alt",
        size: "lg",
      },
      onPress: () => {
        navigation?.navigate(RootStackScreenNames.CouponList);
      },
    },

    {
      text: "Admin list",
      onPress: () => {
        navigation?.navigate(RootStackScreenNames.AdminList);
      },
      icon: {
        name: "people-alt",
        size: "lg",
      },
      isRestricted,
    },
    ...classStudentsCounts?.map((countData) => ({
      text: `Class ${countData.classNumber}`,
      subText: `${countData.count} student${+countData.count === 1 ? "" : "s"}`,
      icon: {
        name: "graduation-cap",
        iconPack: "Entypo" as IconPackType,
        size: "lg" as IconSize,
      },
    })),
  ];

  const visibleTiles = tiles.filter((tile) => !tile.isRestricted);
  totalTiles = visibleTiles.length;

  return (
    <FlatList
      data={visibleTiles}
      renderItem={renderNavTile}
      numColumns={2}
      keyExtractor={(item) => item.text}
      contentContainerStyle={{ flexGrow: 1 }}
    />
  );
};

export { DashboardNavTiles };
