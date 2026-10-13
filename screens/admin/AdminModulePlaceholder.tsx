import React from "react";
import { SafeAreaView, ScrollView, Text, View } from "react-native";
import styles from "./admin.styles";

type AdminModulePlaceholderProps = {
  title: string;
  subtitle: string;
  items: string[];
};

export const AdminModulePlaceholder = ({
  title,
  subtitle,
  items,
}: AdminModulePlaceholderProps) => (
  <SafeAreaView style={styles.safe}>
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      {items.map((item) => (
        <View style={styles.card} key={item}>
          <Text style={styles.cardText}>{item}</Text>
        </View>
      ))}
    </ScrollView>
  </SafeAreaView>
);
