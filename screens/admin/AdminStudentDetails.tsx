import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList, RootStackScreenNames } from "../../types";
import { Colors } from "../../theme";
import { studentServices } from "../../services/studentServices";

type Props = NativeStackScreenProps<
  RootStackParamList,
  RootStackScreenNames.AdminStudentDetails
>;

const unwrap = (response: any): any =>
  response?.data?.student ??
  response?.data?.data ??
  response?.student ??
  response?.data ??
  response;

export const AdminStudentDetails = ({ route }: Props) => {
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    studentServices
      .getStudentById({ admissionNo: route.params.admissionNo } as any)
      .then((response) => {
        if (active) setStudent(unwrap(response));
      })
      .catch((requestError: any) => {
        if (active) {
          setError(
            requestError?.response?.data?.message ??
              requestError?.message ??
              "Unable to load student.",
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [route.params.admissionNo]);

  if (loading) {
    return <ActivityIndicator style={styles.loader} color={Colors.brandPrimary} />;
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.error}>{error}</Text>
      </SafeAreaView>
    );
  }

  if (!student) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.empty}>No student details available.</Text>
      </SafeAreaView>
    );
  }

  const entries = Object.entries(student).filter(
    ([, item]) => typeof item !== "object" && item !== null,
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Student Details</Text>
        <Text style={styles.subtitle}>{route.params.admissionNo}</Text>

        {entries.map(([key, item]) => (
          <View style={styles.row} key={key}>
            <Text style={styles.key}>{key}</Text>
            <Text style={styles.value}>{String(item)}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 25, fontWeight: "800", color: Colors.text },
  subtitle: { marginTop: 5, marginBottom: 18, color: Colors.textSecondary },
  row: { borderBottomWidth: 1, borderBottomColor: Colors.border, paddingVertical: 12 },
  key: { fontSize: 12, color: Colors.textSecondary, fontWeight: "800" },
  value: { marginTop: 4, color: Colors.text, fontSize: 14 },
  loader: { flex: 1 },
  error: { color: Colors.error, padding: 16 },
  empty: { padding: 16, color: Colors.textSecondary },
});
