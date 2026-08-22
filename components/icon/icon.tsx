import React from "react";
import { Image } from "react-native";

import AntDesign from "react-native-vector-icons/AntDesign";
import Entypo from "react-native-vector-icons/Entypo";
import EvilIcons from "react-native-vector-icons/EvilIcons";
import Feather from "react-native-vector-icons/Feather";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import Fontisto from "react-native-vector-icons/Fontisto";
import Foundation from "react-native-vector-icons/Foundation";
import { IconProps as RNVIconProps } from "react-native-vector-icons/Icon";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Octicons from "react-native-vector-icons/Octicons";
import SimpleLineIcons from "react-native-vector-icons/SimpleLineIcons";
import Zocial from "react-native-vector-icons/Zocial";

import { IconPackType, IconSize } from "./iconTypes";

const sizeMap = {
  xsm: 12, // 13 x 13 -> extra small
  sm: 14,
  md: 18,
  lg: 24,
  xlg: 32,
  xxlg: 42, // 40 X 40 -> largest
};

const iconPacks = {
  AntDesign,
  Entypo,
  EvilIcons,
  Feather,
  FontAwesome,
  FontAwesome5,
  Fontisto,
  Foundation,
  Ionicons,
  MaterialIcons,
  MaterialCommunityIcons,
  Octicons,
  Zocial,
  SimpleLineIcons,
};

export interface IconProps extends Omit<RNVIconProps, "size"> {
  iconPack?: IconPackType;
  size?: IconSize | number;
}

const Icon = (props: IconProps) => {
  const { iconPack, size, ...iconProps } = props;
  const IconComponent = iconPack ? iconPacks[iconPack] : MaterialIcons;
  const sizeVal = typeof size === "string" ? sizeMap[size] : size;
  return <IconComponent {...iconProps} size={sizeVal} />;
};

export default React.memo(Icon);
