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
  RootStackScreenNames.AdminStudentRegistration
>;

type Option = { label: string; value: string };

type FormState = {
  admissionNo: string;
  name: string;
  aadhaar: string;
  fatherName: string;
  dob: string;
  doj: string;
  phoneNo: string;
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

const initialForm: FormState = {
  admissionNo: "",
  name: "",
  aadhaar: "",
  fatherName: "",
  dob: "",
  doj: "",
  phoneNo: "",
  academicYearId: "",
  classNumber: "",
  sectionName: "",
  tie: "0",
  belt: "0",
  arrears: "0",
  diary: "0",
  couponCode: "",
  tcNo: "",
  parentRelationship: "FATHER",
};

const getRoot = (response: any) => response?.data ?? response ?? {};

const getArray = (root: any, keys: string[]) => {
  for (const key of keys) {
    if (Array.isArray(root?.[key])) return root[key];
  }
  return [];
};

const toOption = (item: any, type: "year" | "class" | "section"): Option | null => {
  if (typeof item === "string" || typeof item === "number") {
    return { label: String(item), value: String(item) };
  }

  if (!item || typeof item !== "object") return null;

  const value =
    type === "year"
      ? item.id ?? item.academicYearId ?? item.value
      : type === "class"
        ? item.classNumber ?? item.classNo ?? item.value ?? item.id
        : item.sectionName ?? item.name ?? item.value ?? item.id;

  const label =
    type === "year"
      ? item.name ?? item.academicYearName ?? item.label ?? value
      : type === "class"
        ? item.displayName ?? item.className ?? item.name ?? value
        : item.sectionName ?? item.name ?? item.label ?? value;

  return value == null ? null : { label: String(label ?? value), value: String(value) };
};

const normalizeOptions = (response: any) => {
  const root = getRoot(response);

  return {
    years: getArray(root, ["academicYears", "academicYearOptions", "years"])
      .map((item) => toOption(item, "year"))
      .filter(Boolean) as Option[],
    classes: getArray(root, ["classes", "classOptions", "classNumbers"])
      .map((item) => toOption(item, "class"))
      .filter(Boolean) as Option[],
    sections: getArray(root, ["sections", "sectionOptions"])
      .map((item) => toOption(item, "section"))
      .filter(Boolean) as Option[],
  };
};

export  const AdminStudentRegistration = ({ navigation }: Props) => {
  const [form, setForm] = useState<FormState>(initialForm);
  const [years, setYears] = useState<Option[]>([]);
  const [classes, setClasses] = useState<Option[]>([]);
  const [sections, setSections] = useState<Option[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const update = (key: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const response = await studentServices.getRegistrationOptions();
        const options = normalizeOptions(response);

        setYears(options.years);
        setClasses(options.classes);
        setSections(options.sections);

        setForm((current) => ({
          ...current,
          academicYearId:
            current.academicYearId || (options.years.length === 1 ? options.years[0].value : ""),
          classNumber:
            current.classNumber || (options.classes.length === 1 ? options.classes[0].value : ""),
          sectionName:
            current.sectionName || (options.sections.length === 1 ? options.sections[0].value : ""),
        }));
      } catch (requestError: any) {
        setError(
          requestError?.response?.data?.message ??
            requestError?.message ??
            "Unable to load registration options."
        );
      } finally {
        setLoadingOptions(false);
      }
    };

    loadOptions();
  }, []);

  const submit = async () => {
    const required: Array<keyof FormState> = [
      "admissionNo",
      "name",
      "fatherName",
      "dob",
      "doj",
      "phoneNo",
      "academicYearId",
      "classNumber",
      "sectionName",
    ];

    if (required.some((key) => !form[key].trim())) {
      Alert.alert("Missing details", "Complete all required fields.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await studentServices.createStudent({
        ...form,
        tie: Number(form.tie) || 0,
        belt: Number(form.belt) || 0,
        arrears: Number(form.arrears) || 0,
        diary: Number(form.diary) || 0,
        siblings: [],
      } as any);

      Alert.alert("Success", "Student created successfully.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (requestError: any) {
      setError(
        requestError?.response?.data?.message ??
          requestError?.message ??
          "Unable to create student."
      );
    } finally {
      setSaving(false);
    }
  };

  const renderOptions = (
    label: string,
    options: Option[],
    value: string,
    onChange: (value: string) => void
  ) => (
    <View style={styles.registrationField}>
      <Text style={styles.registrationLabel}>{label}</Text>
      {options.length ? (
        <View style={styles.optionWrap}>
          {options.map((option) => (
            <Pressable
              key={option.value}
              onPress={() => onChange(option.value)}
              style={[styles.option, value === option.value && styles.optionSelected]}
            >
              <Text style={[styles.optionText, value === option.value && styles.optionTextSelected]}>
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : (
        <Text style={styles.helper}>No options returned; use the text field below.</Text>
      )}
    </View>
  );

  const renderInput = (key: keyof FormState, label: string, placeholder?: string) => (
    <View style={styles.registrationField} key={key}>
      <Text style={styles.registrationLabel}>{label}</Text>
      <TextInput
        value={form[key]}
        onChangeText={(value) => update(key, value)}
        placeholder={placeholder ?? label}
        placeholderTextColor={Colors.subtext}
        style={styles.registrationInput}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.registrationContainer}>
        <Text style={styles.registrationTitle}>Add Student</Text>
        <Text style={styles.registrationSubtitle}>Create a student record from the admin portal.</Text>

        {!!error && <Text style={styles.error}>{error}</Text>}

        {loadingOptions ? (
          <ActivityIndicator color={Colors.brandPrimary} />
        ) : (
          <>
            {renderOptions("Academic year", years, form.academicYearId, (value) =>
              update("academicYearId", value)
            )}
            {renderOptions("Class", classes, form.classNumber, (value) =>
              update("classNumber", value)
            )}
            {renderOptions("Section", sections, form.sectionName, (value) =>
              update("sectionName", value)
            )}
          </>
        )}

        {renderInput("admissionNo", "Admission number")}
        {renderInput("name", "Student name")}
        {renderInput("aadhaar", "Aadhaar")}
        {renderInput("fatherName", "Parent / father name")}
        {renderInput("dob", "Date of birth", "YYYY-MM-DD")}
        {renderInput("doj", "Date of joining", "YYYY-MM-DD")}
        {renderInput("phoneNo", "Parent phone number")}
        {renderInput("tie", "Tie amount")}
        {renderInput("belt", "Belt amount")}
        {renderInput("arrears", "Arrears amount")}
        {renderInput("diary", "Diary amount")}
        {renderInput("couponCode", "Coupon code")}
        {renderInput("tcNo", "Transfer certificate number")}
        {renderInput("parentRelationship", "Parent relationship")}

        <Pressable style={styles.submitButton} onPress={submit} disabled={saving}>
          {saving ? (
            <ActivityIndicator color={Colors.textOnPrimary} />
          ) : (
            <Text style={styles.submitText}>Create student</Text>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

