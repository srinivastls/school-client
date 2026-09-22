import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Colors, Metrics, Typography } from "../../theme";

export type AdminFeatureCardProps = {
  title: string;
  description: string;
  icon: string;
  accentColor?: string;
  onPress: () => void;
};

export const AdminFeatureCard = ({
  title,
  description,
  icon,
  accentColor = Colors.brandPrimary,
  onPress,
}: AdminFeatureCardProps) => (
  <Pressable
    accessibilityRole="button"
    accessibilityLabel={title}
    onPress={onPress}
    style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
  >
    <View style={[styles.iconContainer, { backgroundColor: `${accentColor}14` }]}>
      <Text style={[styles.icon, { color: accentColor }]}>{icon}</Text>
    </View>
    <View style={styles.content}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
    <Text style={styles.chevron}>›</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  card: {
    minHeight: 108,
    flexDirection: "row",
    alignItems: "center",
    padding: Metrics.x4,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
    marginBottom: Metrics.x3,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  cardPressed: { opacity: 0.72, transform: [{ scale: 0.99 }] },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Metrics.x3,
  },
  icon: { fontSize: 26, fontWeight: "700" },
  content: { flex: 1, paddingRight: Metrics.x2 },
  title: { ...Typography.cardTitle, color: Colors.text },
  description: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: Metrics.x1,
  },
  chevron: { fontSize: 30, color: Colors.subtext, fontWeight: "300" },
});
