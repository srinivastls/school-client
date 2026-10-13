
import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

type DashboardModuleCardProps = {
  title: string;
  icon: string;
  accentColor: string;
  onPress: () => void;
};

export const DashboardModuleCard = ({
  title,
  icon,
  accentColor,
  onPress,
}: DashboardModuleCardProps) => {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: `${accentColor}15` },
        ]}
      >
        <Text style={[styles.icon, { color: accentColor }]}>
          {icon}
        </Text>
      </View>

      <Text style={styles.title} numberOfLines={2}>
        {title}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    width: "31.5%",
    minHeight: 116,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingVertical: 14,
    paddingHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.97 }],
  },

  iconContainer: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 9,
  },

  icon: {
    fontSize: 23,
    fontWeight: "700",
  },

  title: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "700",
    color: "#334155",
    textAlign: "center",
  },
});