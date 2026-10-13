import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Colors } from "../theme";

export function Field({ label, value, onChangeText, placeholder }: any) {
  return <View style={styles.field}><Text style={styles.label}>{label}</Text><TextInput value={value} onChangeText={onChangeText} placeholder={placeholder || label} placeholderTextColor={Colors.textSecondary} style={styles.input}/></View>;
}
export function Button({ title, onPress, disabled=false, secondary=false }: any) {
  return <Pressable disabled={disabled} onPress={onPress} style={[styles.button, secondary && styles.secondary, disabled && styles.disabled]}><Text style={[styles.buttonText, secondary && styles.secondaryText]}>{title}</Text></Pressable>;
}
export function State({ loading, error, retry, children }: any) {
  if (loading) return <ActivityIndicator style={styles.loader} color={Colors.brandPrimary}/>;
  if (error) return <View style={styles.state}><Text style={styles.error}>{error}</Text><Button title="Retry" onPress={retry}/></View>;
  return children;
}
export const styles=StyleSheet.create({loader:{flex:1},state:{padding:24,alignItems:"center",gap:12},error:{color:Colors.error,textAlign:"center"},field:{marginBottom:12},label:{fontSize:12,fontWeight:"800",color:Colors.textSecondary,marginBottom:6},input:{borderWidth:1,borderColor:Colors.border,borderRadius:10,padding:12,color:Colors.text},button:{backgroundColor:Colors.brandPrimary,borderRadius:10,padding:12,alignItems:"center",marginTop:8},secondary:{backgroundColor:Colors.surface,borderWidth:1,borderColor:Colors.border},buttonText:{color:Colors.textOnPrimary,fontWeight:"800"},secondaryText:{color:Colors.text},disabled:{opacity:.5}});
