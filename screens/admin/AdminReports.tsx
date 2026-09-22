import React from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { Colors } from "../../theme";

export const AdminReports = () => {
  const items=["Student report","Fee collection report","Pending fee report","Attendance report","Staff report","Academic performance report","CSV/PDF export history"];
  return <SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.content}><Text style={styles.title}>Reports & Exports</Text><Text style={styles.subtitle}>Generate operational and academic reports</Text>{items.map(item=><View style={styles.card} key={item}><Text style={styles.cardText}>{item}</Text></View>)}</ScrollView></SafeAreaView>;
}
const styles=StyleSheet.create({safe:{flex:1,backgroundColor:Colors.background},content:{padding:16},title:{fontSize:26,fontWeight:"800",color:Colors.text},subtitle:{marginTop:5,marginBottom:20,color:Colors.textSecondary},card:{borderWidth:1,borderColor:Colors.border,borderRadius:12,padding:16,marginBottom:10},cardText:{fontSize:15,fontWeight:"700",color:Colors.text}});
