import React, { useState } from "react";

import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import {
  Button,
  Snackbar,
  Text,
  TextInput,
} from "react-native-paper";

import { useNavigation } from "@react-navigation/native";

import type {
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";

import {
  RootStackParamList,
  RootStackScreenNames,
} from "../../types";

import {
  Colors,
  Metrics,
} from "../../theme";

import {
  principalServices,
} from "../../services/principalServices";
import { principalCreateTeacherStyles as styles } from "../../styles/principal.styles";

const PrincipalCreateTeacherScreen = () => {
  const navigation =
    useNavigation<
      NativeStackNavigationProp<RootStackParamList>
    >();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [designation, setDesignation] =
    useState("Teacher");
  const [department, setDepartment] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [snackbarVisible, setSnackbarVisible] =
    useState(false);

  const [snackbarMessage, setSnackbarMessage] =
    useState("");

  const [snackbarType, setSnackbarType] =
    useState<"success" | "error">("error");

  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
  }>({});

  /* ============================================================
     MESSAGE
  ============================================================ */

  const showMessage = (
    message: string,
    type: "success" | "error"
  ) => {
    setSnackbarMessage(message);
    setSnackbarType(type);
    setSnackbarVisible(true);
  };

  /* ============================================================
     VALIDATION
  ============================================================ */

  const validate = () => {
    const newErrors: typeof errors = {};

    if (!name.trim()) {
      newErrors.name =
        "Teacher name is required";
    }

    if (!email.trim()) {
      newErrors.email =
        "Email is required";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email.trim()
      )
    ) {
      newErrors.email =
        "Enter a valid email address";
    }

    if (!password) {
      newErrors.password =
        "Initial password is required";
    } else if (password.length < 8) {
      newErrors.password =
        "Password must contain at least 8 characters";
    }

    setErrors(newErrors);

    return (
      Object.keys(newErrors).length === 0
    );
  };

  /* ============================================================
     CREATE TEACHER
  ============================================================ */

  const onCreateTeacher = async () => {
    if (loading) {
      return;
    }

    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      const response =
        await principalServices.createTeacher({
          name: name.trim(),

          email:
            email.trim().toLowerCase(),

          password,

          phone:
            phone.trim() || undefined,

          employeeId:
            employeeId.trim() || undefined,

          designation:
            designation.trim() ||
            "Teacher",

          department:
            department.trim() || undefined,
        });

      showMessage(
        response?.message ??
          "Teacher created successfully",
        "success"
      );

      setTimeout(() => {
        navigation.goBack();
      }, 700);
    } catch (error: any) {
      console.log(
        "CREATE TEACHER ERROR:",
        error?.response?.data ??
          error
      );

      showMessage(
        error?.response?.data?.message ??
          "Unable to create teacher",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  /* ============================================================
     UI
  ============================================================ */

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : undefined
      }
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={
          styles.content
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>
            Create Teacher
          </Text>

          <Text style={styles.subtitle}>
            Create a teacher login account
          </Text>
        </View>

        {/* ====================================================
            BASIC DETAILS
        ==================================================== */}

        <Text style={styles.sectionTitle}>
          Teacher Details
        </Text>

        <TextInput
          mode="outlined"
          label="Teacher Name"
          value={name}
          onChangeText={(value) => {
            setName(value);

            if (errors.name) {
              setErrors((previous) => ({
                ...previous,
                name: undefined,
              }));
            }
          }}
          error={!!errors.name}
          style={styles.input}
        />

        {!!errors.name && (
          <Text style={styles.error}>
            {errors.name}
          </Text>
        )}

        <TextInput
          mode="outlined"
          label="Login Email"
          value={email}
          onChangeText={(value) => {
            setEmail(value);

            if (errors.email) {
              setErrors((previous) => ({
                ...previous,
                email: undefined,
              }));
            }
          }}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          error={!!errors.email}
          style={styles.input}
        />

        {!!errors.email && (
          <Text style={styles.error}>
            {errors.email}
          </Text>
        )}

        <TextInput
          mode="outlined"
          label="Initial Password"
          value={password}
          onChangeText={(value) => {
            setPassword(value);

            if (errors.password) {
              setErrors((previous) => ({
                ...previous,
                password: undefined,
              }));
            }
          }}
          secureTextEntry
          error={!!errors.password}
          style={styles.input}
        />

        {!!errors.password && (
          <Text style={styles.error}>
            {errors.password}
          </Text>
        )}

        <TextInput
          mode="outlined"
          label="Phone"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          style={styles.input}
        />

        {/* ====================================================
            EMPLOYMENT
        ==================================================== */}

        <Text style={styles.sectionTitle}>
          Employment Information
        </Text>

        <TextInput
          mode="outlined"
          label="Employee ID"
          value={employeeId}
          onChangeText={setEmployeeId}
          autoCapitalize="characters"
          style={styles.input}
        />

        <TextInput
          mode="outlined"
          label="Designation"
          value={designation}
          onChangeText={setDesignation}
          style={styles.input}
        />

        <TextInput
          mode="outlined"
          label="Department"
          value={department}
          onChangeText={setDepartment}
          style={styles.input}
        />

        {/* ====================================================
            ACTION
        ==================================================== */}

        <Button
          mode="contained"
          loading={loading}
          disabled={loading}
          onPress={onCreateTeacher}
          style={styles.createButton}
          contentStyle={
            styles.createButtonContent
          }
        >
          CREATE TEACHER
        </Button>

        <Button
          mode="text"
          disabled={loading}
          onPress={() =>
            navigation.goBack()
          }
        >
          CANCEL
        </Button>
      </ScrollView>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() =>
          setSnackbarVisible(false)
        }
        duration={3000}
        style={{
          backgroundColor:
            snackbarType === "success"
              ? Colors.successBg
              : Colors.errorBg,
        }}
      >
        {snackbarMessage}
      </Snackbar>
    </KeyboardAvoidingView>
  );
};

/* ============================================================
   STYLES
============================================================ */

export {
  PrincipalCreateTeacherScreen,
};