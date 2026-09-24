import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList, RootStackScreenNames } from "../../types";
import { Colors } from "../../theme";
import { studentServices } from "../../services/studentServices";
import styles from "./admin.styles";

type Props = NativeStackScreenProps<
  RootStackParamList,
  RootStackScreenNames.AdminStudentEdit
>;

type FormState = {
  admissionNo: string;
  name: string;
  aadhaar: string;
  fatherName: string;
  dob: string;
  doj: string;
  phoneNo: string;
  parentName: string;
  academicYearId: string;
  classNumber: string;
  sectionName: string;
  tie: string;
  belt: string;
  arrears: string;
  diary: string;
  couponCode: string;
  tcNo: string;
  parentRelationship: string;
};

const emptyForm: FormState = {
  admissionNo: "",
  name: "",
  aadhaar: "",
  fatherName: "",
  dob: "",
  doj: "",
  phoneNo: "",
  parentName: "",
  academicYearId: "",
  classNumber: "",
  sectionName: "",
  tie: "0",
  belt: "0",
  arrears: "0",
  diary: "0",
  couponCode: "",
  tcNo: "",
  parentRelationship: "",
};

const unwrap = (response: any): any =>
  response?.data?.student ??
  response?.data?.data ??
  response?.student ??
  response?.data ??
  response;

const value = (item: any, ...keys: string[]) => {
  for (const key of keys) {
    if (item?.[key] !== undefined && item?.[key] !== null) return String(item[key]);
  }
  return "";
};

export const AdminStudentEdit = ({ route, navigation }: Props) => {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const update = (key: keyof FormState, text: string) =>
    setForm((previous) => ({ ...previous, [key]: text }));

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const response = await studentServices.getStudentById({
          admissionNo: route.params.admissionNo,
        } as any);

        const student = unwrap(response);

        if (!active) return;

        setForm({
          admissionNo: value(student, "admissionNo", "admissionNumber") || route.params.admissionNo,
          name: value(student, "name", "studentName"),
          aadhaar: value(student, "aadhaar", "aadhar"),
          fatherName: value(student, "fatherName"),
          dob: value(student, "dob", "dateOfBirth"),
          doj: value(student, "doj", "dateOfJoining"),
          phoneNo: value(student, "phoneNo", "phone"),
          parentName: value(student, "parentName"),
          academicYearId: value(student, "academicYearId", "academicYear?.id"),
          classNumber: value(student, "classNumber", "class?.classNumber"),
          sectionName: value(student, "sectionName", "section?.name"),
          tie: value(student, "tie") || "0",
          belt: value(student, "belt") || "0",
          arrears: value(student, "arrears") || "0",
          diary: value(student, "diary") || "0",
          couponCode: value(student, "couponCode"),
          tcNo: value(student, "tcNo"),
          parentRelationship: value(student, "parentRelationship"),
        });
      } catch (requestError: any) {
        setError(
          requestError?.response?.data?.message ??
            requestError?.message ??
            "Unable to load student details.",
        );
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [route.params.admissionNo]);

  const save = async () => {
    if (!form.name.trim() || !form.admissionNo.trim()) {
      Alert.alert("Validation", "Admission number and student name are required.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await studentServices.editStudent({
        ...form,
        oldAdmissionNo: route.params.admissionNo,
        tie: Number(form.tie || 0),
        belt: Number(form.belt || 0),
        arrears: Number(form.arrears || 0),
        diary: Number(form.diary || 0),
        siblings: [],
      } as any);

      Alert.alert("Updated", "Student details updated successfully.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (requestError: any) {
      setError(
        requestError?.response?.data?.message ??
          requestError?.message ??
          "Unable to update student.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <ActivityIndicator style={styles.loader} color={Colors.brandPrimary} />;
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.studentContent}>
        <Text style={styles.studentTitle}>Edit Student</Text>
        <Text style={styles.studentSubtitle}>Admission number: {route.params.admissionNo}</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {Object.keys(form).map((key) => {
          const field = key as keyof FormState;
          const locked = field === "admissionNo";

          return (
            <View key={field} style={styles.studentField}>
              <Text style={styles.studentLabel}>{field}</Text>
              <TextInput
                value={form[field]}
                onChangeText={(text) => update(field, text)}
                editable={!locked}
                placeholder={`Enter ${field}`}
                placeholderTextColor={Colors.textSecondary}
                style={[styles.studentInput, locked && styles.locked]}
              />
            </View>
          );
        })}

        <Pressable style={styles.saveButton} onPress={save} disabled={saving}>
          {saving ? (
            <ActivityIndicator color={Colors.textOnPrimary} />
          ) : (
            <Text style={styles.saveText}>Save Changes</Text>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

