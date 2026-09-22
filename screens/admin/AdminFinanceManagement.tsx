import React from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { Colors } from "../../theme";

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
    <View style={styles.grid}>{metrics.map(([label, value]) => <View style={styles.card} key={label}><Text style={styles.label}>{label}</Text><Text style={styles.value}>{value}</Text></View>)}</View>
    <Text style={styles.section}>Planned finance operations</Text>
    {["Fee collection and receipts", "Pending fee tracking", "Defaulter list", "Payment history", "Fee configuration", "Export financial reports"].map(item => <View style={styles.item} key={item}><Text style={styles.itemText}>{item}</Text></View>)}
    <Text style={styles.note}>Connect these cards to the finance service endpoints when their contracts are available.</Text>
  </ScrollView></SafeAreaView>;
}
const styles = StyleSheet.create({safe:{flex:1,backgroundColor:Colors.background},content:{padding:16},title:{fontSize:26,fontWeight:"800",color:Colors.text},subtitle:{marginTop:5,color:Colors.textSecondary},grid:{flexDirection:"row",flexWrap:"wrap",gap:10,marginTop:20},card:{width:"47%",borderWidth:1,borderColor:Colors.border,borderRadius:12,padding:14},label:{fontSize:12,color:Colors.textSecondary},value:{fontSize:22,fontWeight:"800",color:Colors.brandPrimary,marginTop:8},section:{fontSize:18,fontWeight:"800",color:Colors.text,marginTop:26,marginBottom:10},item:{padding:15,borderWidth:1,borderColor:Colors.border,borderRadius:10,marginBottom:8},itemText:{fontWeight:"700",color:Colors.text},note:{marginTop:16,color:Colors.textSecondary,fontSize:12}});
