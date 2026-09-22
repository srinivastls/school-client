import React from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { Colors } from "../../theme";

export const AdminStaffManagement = () => {
  const items=["Staff directory","Teacher attendance","Leave approvals","Role and permission management","Staff onboarding","Staff reports"];
  return <SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.content}><Text style={styles.title}>Staff Administration</Text><Text style={styles.subtitle}>Manage teachers, employees, roles and attendance</Text>{items.map(item=><View style={styles.card} key={item}><Text style={styles.cardText}>{item}</Text></View>)}</ScrollView></SafeAreaView>;
}
const styles=StyleSheet.create({safe:{flex:1,backgroundColor:Colors.background},content:{padding:16},title:{fontSize:26,fontWeight:"800",color:Colors.text},subtitle:{marginTop:5,marginBottom:20,color:Colors.textSecondary},card:{borderWidth:1,borderColor:Colors.border,borderRadius:12,padding:16,marginBottom:10},cardText:{fontSize:15,fontWeight:"700",color:Colors.text}});
