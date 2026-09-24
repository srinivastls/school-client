import React from "react";
import { SafeAreaView, ScrollView, Text, View } from "react-native";
import styles from "./admin.styles";

const metrics = [
  ["Today Collection", "₹0"],
  ["Weekly Collection", "₹0"],
  ["Monthly Collection", "₹0"],
  ["Pending Fees", "₹0"],
  ["Defaulters", "0"],
];

export const AdminFinanceManagement = () => {
  return <SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.content}>
    <Text style={styles.title}>Finance Management</Text>
    <Text style={styles.subtitle}>Collections, pending fees, payments and financial reports</Text>
    <View style={styles.grid}>{metrics.map(([label, value]) => <View style={styles.metricCard} key={label}><Text style={styles.label}>{label}</Text><Text style={styles.value}>{value}</Text></View>)}</View>
    <Text style={styles.section}>Planned finance operations</Text>
    {["Fee collection and receipts", "Pending fee tracking", "Defaulter list", "Payment history", "Fee configuration", "Export financial reports"].map(item => <View style={styles.item} key={item}><Text style={styles.itemText}>{item}</Text></View>)}
    <Text style={styles.note}>Connect these cards to the finance service endpoints when their contracts are available.</Text>
  </ScrollView></SafeAreaView>;
}
