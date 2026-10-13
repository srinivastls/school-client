import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList, RootStackScreenNames } from "../../types";
import { Colors } from "../../theme";
import { studentServices } from "../../services/studentServices";
import styles from "./admin.styles";

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
      <ScrollView contentContainerStyle={styles.studentContent}>
        <Text style={styles.studentTitle}>Student Details</Text>
        <Text style={styles.studentSubtitle}>{route.params.admissionNo}</Text>

        {entries.map(([key, item]) => (
          <View style={styles.studentRow} key={key}>
            <Text style={styles.studentKey}>{key}</Text>
            <Text style={styles.studentValue}>{String(item)}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

