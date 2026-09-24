import React, {
  useState,
} from "react";

import {
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import {
  Button,
  Card,
  HelperText,
  Snackbar,
  Text,
  TextInput,
} from "react-native-paper";

import {
  useMutation,
  useQueryClient,
} from "react-query";

import {
  useNavigation,
} from "@react-navigation/native";

import type {
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";

import {
  principalServices,
} from "../../services";

import {
  Colors,
  Metrics,
} from "../../theme";
import { principalCreateAdminStyles as styles } from "../../styles/principal.styles";

import {
  RootStackParamList,
} from "../../types";


/* ============================================================
   NAVIGATION
============================================================ */

type NavigationProp =
  NativeStackNavigationProp<
    RootStackParamList
  >;


/* ============================================================
   SCREEN
============================================================ */

const PrincipalCreateAdminScreen = () => {

  const navigation =
    useNavigation<NavigationProp>();

  const queryClient =
    useQueryClient();


  /* ==========================================================
     FORM
  ========================================================== */

  const [
    name,
    setName,
  ] = useState("");

  const [
    email,
    setEmail,
  ] = useState("");

  const [
    phone,
    setPhone,
  ] = useState("");

  const [
    designation,
    setDesignation,
  ] = useState("");

  const [
    department,
    setDepartment,
  ] = useState("");

  const [
    employeeId,
    setEmployeeId,
  ] = useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");


  /* ==========================================================
     PASSWORD VISIBILITY
  ========================================================== */

  const [
    passwordVisible,
    setPasswordVisible,
  ] = useState(false);

  const [
    confirmPasswordVisible,
    setConfirmPasswordVisible,
  ] = useState(false);


  /* ==========================================================
     ERRORS
  ========================================================== */

  const [
    nameError,
    setNameError,
  ] = useState("");

  const [
    emailError,
    setEmailError,
  ] = useState("");

  const [
    phoneError,
    setPhoneError,
  ] = useState("");

  const [
    passwordError,
    setPasswordError,
  ] = useState("");

  const [
    confirmPasswordError,
    setConfirmPasswordError,
  ] = useState("");


  /* ==========================================================
     SNACKBAR
  ========================================================== */

  const [
    snackbarVisible,
    setSnackbarVisible,
  ] = useState(false);

  const [
    snackbarMessage,
    setSnackbarMessage,
  ] = useState("");


  /* ==========================================================
     MESSAGE
  ========================================================== */

  const showMessage = (
    message: string
  ) => {

    setSnackbarMessage(
      message
    );

    setSnackbarVisible(
      true
    );
  };


  /* ==========================================================
     CREATE ADMIN
  ========================================================== */

  const createAdminMutation =
    useMutation(
      (
        payload: {
          name: string;
          email: string;
          password: string;
          phone?: string;
          designation?: string;
          department?: string;
          employeeId?: string;
        }
      ) =>
        principalServices.createAdmin(
          payload
        ),

      {
        onSuccess: (
          data
        ) => {

          showMessage(
            data?.message ??
              "School admin created successfully"
          );


          queryClient.invalidateQueries(
            [
              "principal-admins",
            ]
          );


          setTimeout(() => {

            navigation.goBack();

          }, 1000);
        },

        onError: (
          error: any
        ) => {

          showMessage(
            error?.response?.data?.message ??
              "Unable to create school admin"
          );

        },
      }
    );


  /* ==========================================================
     VALIDATION
  ========================================================== */

  const validate = () => {

    let valid = true;


    /* --------------------------------------------------------
       NAME
    -------------------------------------------------------- */

    if (!name.trim()) {

      setNameError(
        "Name is required"
      );

      valid = false;

    } else {

      setNameError("");

    }


    /* --------------------------------------------------------
       EMAIL
    -------------------------------------------------------- */

    if (!email.trim()) {

      setEmailError(
        "Email is required"
      );

      valid = false;

    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email.trim()
      )
    ) {

      setEmailError(
        "Invalid email"
      );

      valid = false;

    } else {

      setEmailError("");

    }


    /* --------------------------------------------------------
       PHONE
    -------------------------------------------------------- */

    if (phone.trim()) {

      const normalizedPhone =
        phone.replace(
          /\D/g,
          ""
        );

      if (
        normalizedPhone.length !== 10
      ) {

        setPhoneError(
          "Enter a valid 10-digit mobile number"
        );

        valid = false;

      } else {

        setPhoneError("");

      }

    } else {

      setPhoneError("");

    }


    /* --------------------------------------------------------
       PASSWORD
    -------------------------------------------------------- */

    if (!password) {

      setPasswordError(
        "Password is required"
      );

      valid = false;

    } else if (
      password.length < 8
    ) {

      setPasswordError(
        "Password must be at least 8 characters"
      );

      valid = false;

    } else {

      setPasswordError("");

    }


    /* --------------------------------------------------------
       CONFIRM PASSWORD
    -------------------------------------------------------- */

    if (!confirmPassword) {

      setConfirmPasswordError(
        "Please confirm the password"
      );

      valid = false;

    } else if (
      password !==
      confirmPassword
    ) {

      setConfirmPasswordError(
        "Passwords do not match"
      );

      valid = false;

    } else {

      setConfirmPasswordError("");

    }


    return valid;
  };


  /* ==========================================================
     SUBMIT
  ========================================================== */

  const handleCreateAdmin =
    () => {

      if (
        createAdminMutation.isLoading
      ) {
        return;
      }


      if (!validate()) {
        return;
      }


      createAdminMutation.mutate({

        name:
          name.trim(),

        email:
          email.trim().toLowerCase(),

        password,

        phone:
          phone.trim()
            ? phone
                .replace(
                  /\D/g,
                  ""
                )
            : undefined,

        designation:
          designation.trim()
            ? designation.trim()
            : undefined,

        department:
          department.trim()
            ? department.trim()
            : undefined,

        employeeId:
          employeeId.trim()
            ? employeeId.trim()
            : undefined,

      });

    };


  /* ==========================================================
     UI
  ========================================================== */

  return (
    <View
      style={
        styles.screen
      }
    >

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={
          styles.container
        }
      >

        {/* ====================================================
            HEADER
        ==================================================== */}

        <View
          style={
            styles.header
          }
        >

          <Text
            style={
              styles.title
            }
          >
            Create School Admin
          </Text>

          <Text
            style={
              styles.subtitle
            }
          >
            Create an administrator account for your school
          </Text>

        </View>


        {/* ====================================================
            ACCOUNT INFORMATION
        ==================================================== */}

        <Card
          style={
            styles.card
          }
        >

          <Card.Content>

            <Text
              style={
                styles.sectionTitle
              }
            >
              Account Information
            </Text>


            {/* NAME */}

            <TextInput
              mode="outlined"
              label="Full Name"
              value={name}
              onChangeText={(
                value
              ) => {

                setName(
                  value
                );

                if (
                  nameError
                ) {
                  setNameError(
                    ""
                  );
                }

              }}
              autoCapitalize="words"
              style={
                styles.input
              }
              disabled={
                createAdminMutation.isLoading
              }
            />

            {nameError ? (

              <HelperText
                type="error"
                visible
              >
                {nameError}
              </HelperText>

            ) : null}


            {/* EMAIL */}

            <TextInput
              mode="outlined"
              label="Email"
              value={email}
              onChangeText={(
                value
              ) => {

                setEmail(
                  value
                );

                if (
                  emailError
                ) {
                  setEmailError(
                    ""
                  );
                }

              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              style={
                styles.input
              }
              disabled={
                createAdminMutation.isLoading
              }
            />

            {emailError ? (

              <HelperText
                type="error"
                visible
              >
                {emailError}
              </HelperText>

            ) : null}


            {/* PHONE */}

            <TextInput
              mode="outlined"
              label="Mobile Number"
              value={phone}
              onChangeText={(
                value
              ) => {

                setPhone(
                  value
                );

                if (
                  phoneError
                ) {
                  setPhoneError(
                    ""
                  );
                }

              }}
              keyboardType="phone-pad"
              maxLength={10}
              style={
                styles.input
              }
              disabled={
                createAdminMutation.isLoading
              }
            />

            {phoneError ? (

              <HelperText
                type="error"
                visible
              >
                {phoneError}
              </HelperText>

            ) : null}

          </Card.Content>

        </Card>


        {/* ====================================================
            EMPLOYMENT INFORMATION
        ==================================================== */}

        <Card
          style={
            styles.card
          }
        >

          <Card.Content>

            <Text
              style={
                styles.sectionTitle
              }
            >
              Employment Information
            </Text>


            {/* DESIGNATION */}

            <TextInput
              mode="outlined"
              label="Designation"
              value={designation}
              onChangeText={
                setDesignation
              }
              placeholder="School Admin"
              autoCapitalize="words"
              style={
                styles.input
              }
              disabled={
                createAdminMutation.isLoading
              }
            />


            {/* DEPARTMENT */}

            <TextInput
              mode="outlined"
              label="Department"
              value={department}
              onChangeText={
                setDepartment
              }
              placeholder="Administration"
              autoCapitalize="words"
              style={
                styles.input
              }
              disabled={
                createAdminMutation.isLoading
              }
            />


            {/* EMPLOYEE ID */}

            <TextInput
              mode="outlined"
              label="Employee ID"
              value={employeeId}
              onChangeText={
                setEmployeeId
              }
              autoCapitalize="characters"
              autoCorrect={false}
              style={
                styles.input
              }
              disabled={
                createAdminMutation.isLoading
              }
            />

          </Card.Content>

        </Card>


        {/* ====================================================
            PASSWORD
        ==================================================== */}

        <Card
          style={
            styles.card
          }
        >

          <Card.Content>

            <Text
              style={
                styles.sectionTitle
              }
            >
              Login Password
            </Text>


            <Text
              style={
                styles.passwordInfo
              }
            >
              This password will be used by the admin
              to sign in for the first time.
            </Text>


            {/* PASSWORD */}

            <TextInput
              mode="outlined"
              label="Password"
              value={password}
              onChangeText={(
                value
              ) => {

                setPassword(
                  value
                );

                if (
                  passwordError
                ) {
                  setPasswordError(
                    ""
                  );
                }

              }}
              secureTextEntry={
                !passwordVisible
              }
              right={
                <TextInput.Icon
                  icon={
                    passwordVisible
                      ? "eye-off"
                      : "eye"
                  }
                  onPress={() =>
                    setPasswordVisible(
                      !passwordVisible
                    )
                  }
                />
              }
              style={
                styles.input
              }
              disabled={
                createAdminMutation.isLoading
              }
            />

            {passwordError ? (

              <HelperText
                type="error"
                visible
              >
                {passwordError}
              </HelperText>

            ) : null}


            {/* CONFIRM PASSWORD */}

            <TextInput
              mode="outlined"
              label="Confirm Password"
              value={
                confirmPassword
              }
              onChangeText={(
                value
              ) => {

                setConfirmPassword(
                  value
                );

                if (
                  confirmPasswordError
                ) {
                  setConfirmPasswordError(
                    ""
                  );
                }

              }}
              secureTextEntry={
                !confirmPasswordVisible
              }
              right={
                <TextInput.Icon
                  icon={
                    confirmPasswordVisible
                      ? "eye-off"
                      : "eye"
                  }
                  onPress={() =>
                    setConfirmPasswordVisible(
                      !confirmPasswordVisible
                    )
                  }
                />
              }
              style={
                styles.input
              }
              disabled={
                createAdminMutation.isLoading
              }
            />

            {confirmPasswordError ? (

              <HelperText
                type="error"
                visible
              >
                {confirmPasswordError}
              </HelperText>

            ) : null}

          </Card.Content>

        </Card>


        {/* ====================================================
            ACTIONS
        ==================================================== */}

        <View
          style={
            styles.actions
          }
        >

          <Button
            mode="outlined"
            onPress={() =>
              navigation.goBack()
            }
            style={
              styles.cancelButton
            }
            disabled={
              createAdminMutation.isLoading
            }
          >
            Cancel
          </Button>


          <Button
            mode="contained"
            onPress={
              handleCreateAdmin
            }
            style={
              styles.createButton
            }
            loading={
              createAdminMutation.isLoading
            }
            disabled={
              createAdminMutation.isLoading
            }
          >
            Create Admin
          </Button>

        </View>


        {/* ====================================================
            NOTE
        ==================================================== */}

        <View
          style={
            styles.note
          }
        >

          <Text
            style={
              styles.noteText
            }
          >
            The admin will be required to change the
            password after the first login.
          </Text>

        </View>

      </ScrollView>


      {/* ======================================================
          SNACKBAR
      ====================================================== */}

      <Snackbar
        visible={
          snackbarVisible
        }
        onDismiss={() =>
          setSnackbarVisible(
            false
          )
        }
        duration={2500}
        style={{
          backgroundColor:
            Colors.brandPrimary,
        }}
      >
        {snackbarMessage}
      </Snackbar>

    </View>
  );
};


/* ============================================================
   STYLES
============================================================ */

export {
  PrincipalCreateAdminScreen,
};