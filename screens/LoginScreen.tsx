import React, { useState } from "react";

import {
  View,
  Image,
  Text,
} from "react-native";

import {
  Colors,
  makeStyles,
  Metrics,
} from "../theme";

import {
  Snackbar,
  TextInput,
  Button,
} from "react-native-paper";

import {
  RootStackParamList,
  RootStackScreenNames,
  SigninRequest,
} from "../types";

import {
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";

import { usePasswordInput } from "../hooks";

import { useMutation } from "react-query";

import { userServices } from "../services";

import { isEmailValid } from "../utils";

import { useUserStore } from "../store";


/* ============================================================================
   NAVIGATION TYPE
============================================================================ */

type LoginNavigationProp =
  NativeStackNavigationProp<
    RootStackParamList,
    RootStackScreenNames.Login
  >;


/* ============================================================================
   SCREEN
============================================================================ */

const LoginScreen = ({
  navigation,
}: {
  navigation: LoginNavigationProp;
}) => {

  const styles = useStyles();


  /* ==========================================================================
     STORE
  ========================================================================== */

  const setUserDetailsFromResponse =
    useUserStore(
      (state) =>
        state.setUserDetailsFromResponse
    );


  /* ==========================================================================
     FORM STATE
  ========================================================================== */

  const [schoolCode, setSchoolCode] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [emailError, setEmailError] =
    useState("");

  const [schoolCodeError, setSchoolCodeError] =
    useState("");

  const [passwordError, setPasswordError] =
    useState("");


  /* ==========================================================================
     SNACKBAR
  ========================================================================== */

  const [showSnackBar, setShowSnackBar] =
    useState(false);

  const [snackBarText, setSnackBarText] =
    useState(
      "Something went wrong. Please try again later."
    );


  /* ==========================================================================
     PASSWORD
  ========================================================================== */

  const {
    password,
    onChangePassword,
    iconProps,
    secureTextEntry,
  } = usePasswordInput();


  /* ==========================================================================
     LOGIN MUTATION
  ========================================================================== */

  const {
    mutate: login,
    isLoading,
  } = useMutation(
    async () => {


      /*
       * IMPORTANT:
       *
       * If schoolCode is empty, send an object
       * without schoolCode.
       *
       * This allows the backend to recognize
       * this as a platform login.
       */

      const request: SigninRequest =
        schoolCode.trim()
          ? ({
              schoolCode:
                schoolCode.trim().toUpperCase(),

              identifier:
                email.trim(),

              password,
            } as SigninRequest)
          : ({
              email:
                email.trim(),

              password,
            } as SigninRequest);


      console.log(
        "🔥 LOGIN REQUEST:",
        {
          ...request,
          password: "***",
        }
      );


      const result =
        await userServices.signin(
          request
        );


      console.log(
        "🔥 SIGNIN SERVICE RESULT:",
        result
      );


      return result;
    },
    {

      /* ======================================================================
         SUCCESS
      ====================================================================== */

      onSuccess: (data) => {

        console.log(
          "🔥 LOGIN SUCCESS:",
          data
        );


        /* --------------------------------------------------------------------
           CHECK RESPONSE
        -------------------------------------------------------------------- */

        if (!data) {

          console.error(
            "❌ LOGIN DATA IS UNDEFINED"
          );

          setSnackBarText(
            "Login response is empty"
          );

          setShowSnackBar(true);

          return;
        }

        const role =
          (data as typeof data & { role?: string }).role;


        /* --------------------------------------------------------------------
           CHECK ACCESS TOKEN
        -------------------------------------------------------------------- */

        if (!data.accessToken) {

          console.error(
            "❌ ACCESS TOKEN MISSING"
          );

          setSnackBarText(
            "Invalid login response: access token missing"
          );

          setShowSnackBar(true);

          return;
        }


        /* --------------------------------------------------------------------
           CHECK ROLE
        -------------------------------------------------------------------- */

        const validRoles = [
          "PLATFORM_ADMIN",
          "PRINCIPAL",
          "ADMIN",
          "TEACHER",
          "PARENT",
        ];


        if (
          !role ||
          !validRoles.includes(role)
        ) {

          console.error(
            "❌ INVALID ROLE:",
            role
          );

          setSnackBarText(
            `Invalid user role: ${
              role ?? "missing"
            }`
          );

          setShowSnackBar(true);

          return;
        }


        /* --------------------------------------------------------------------
           SAVE USER
        -------------------------------------------------------------------- */

        setUserDetailsFromResponse(
          data as unknown as Parameters<
            typeof setUserDetailsFromResponse
          >[0]
        );


        console.log(
          "🔥 USER SAVED SUCCESSFULLY"
        );


        /* --------------------------------------------------------------------
           NAVIGATE HOME
        -------------------------------------------------------------------- */

        console.log(
          "🔥 NAVIGATING TO HOME"
        );


        navigation.replace(
          RootStackScreenNames.Home
        );
      },


      /* ======================================================================
         ERROR
      ====================================================================== */

      onError: (error: any) => {

        console.log(
          "================================="
        );

        console.log(
          "🔥 LOGIN API ERROR"
        );

        console.log(
          "STATUS:",
          error?.response?.status
        );

        console.log(
          "ERROR:",
          error?.response?.data
        );

        console.log(
          "================================="
        );


        const status =
          error?.response?.status;


        const serverMessage =
          error?.response?.data?.message;


        /* ====================================================================
           PLATFORM LOGIN FAILED
           
           No school code was entered.
           
           This means:
           - User attempted platform login
           - Backend rejected the credentials
           - Ask user to enter school code
           
           This is especially useful when the same email
           could belong to a school user.
        ==================================================================== */

        if (
          !schoolCode.trim()
        ) {

          /*
           * Don't immediately say "invalid credentials".
           *
           * Give the user the option to try school login.
           */

          setSchoolCodeError(
            "If this is a school account, enter the school code."
          );


          setSnackBarText(
            serverMessage ??
              "Platform login failed. If you are a school user, enter your school code and try again."
          );


          setShowSnackBar(true);

          return;
        }


        /* ====================================================================
           SCHOOL LOGIN FAILED
        ==================================================================== */

        setSnackBarText(
          serverMessage ??
            (
              status === 401
                ? "Invalid school code, email, or password."
                : "Unable to login. Please check your details and try again."
            )
        );


        setShowSnackBar(true);
      },
    }
  );


  /* ==========================================================================
     LOGIN BUTTON
  ========================================================================== */

  const onPress = () => {

  console.log(
    "🔥 LOGIN BUTTON PRESSED"
  );


  if (isLoading) {

    console.log(
      "🔥 LOGIN ALREADY IN PROGRESS"
    );

    return;
  }


  let hasError = false;


  /* ------------------------------------------------------------------------
     CLEAR PREVIOUS ERRORS
  ------------------------------------------------------------------------ */

  setSchoolCodeError("");
  setEmailError("");


  /* ------------------------------------------------------------------------
     DETERMINE LOGIN TYPE

     School code present:
       → SCHOOL LOGIN
       → Email OR mobile number allowed

     School code empty:
       → PLATFORM LOGIN
       → Email required
  ------------------------------------------------------------------------ */

  const isSchoolLogin =
    !!schoolCode.trim();


  console.log(
    "🔥 LOGIN TYPE:",
    isSchoolLogin
      ? "SCHOOL"
      : "PLATFORM"
  );


  /* ------------------------------------------------------------------------
     IDENTIFIER VALIDATION
  ------------------------------------------------------------------------ */

  const identifier =
    email.trim();


  if (!identifier) {

    setEmailError(
      isSchoolLogin
        ? "Email or mobile number is required"
        : "Email is required"
    );

    hasError = true;

  } else if (!isSchoolLogin) {

    /*
     * --------------------------------------------------------
     * PLATFORM LOGIN
     *
     * Platform admin uses email only.
     * --------------------------------------------------------
     */

    if (
      !isEmailValid(identifier)
    ) {

      setEmailError(
        "Invalid email"
      );

      hasError = true;
    }

  } else {

    /*
     * --------------------------------------------------------
     * SCHOOL LOGIN
     *
     * Accept:
     *
     *   principal@email.com
     *
     * OR
     *
     *   9876543210
     *
     * --------------------------------------------------------
     */

    const isEmail =
      isEmailValid(identifier);


    const normalizedPhone =
      identifier.replace(
        /\D/g,
        ""
      );


    const isMobile =
      normalizedPhone.length === 10;


    if (
      !isEmail &&
      !isMobile
    ) {

      setEmailError(
        "Enter a valid email or 10-digit mobile number"
      );

      hasError = true;
    }
  }


  /* ------------------------------------------------------------------------
     PASSWORD
  ------------------------------------------------------------------------ */

  if (!password) {

    setPasswordError(
      "Password is required"
    );

    hasError = true;

  } else {

    setPasswordError("");
  }


  /* ------------------------------------------------------------------------
     VALIDATION FAILED
  ------------------------------------------------------------------------ */

  if (hasError) {

    console.log(
      "🔥 LOGIN VALIDATION FAILED"
    );

    return;
  }


  /* ------------------------------------------------------------------------
     LOGIN
  ------------------------------------------------------------------------ */

  console.log(
    "🔥 LOGIN VALIDATION PASSED"
  );

  console.log(
    "🔥 LOGIN TYPE:",
    isSchoolLogin
      ? "SCHOOL"
      : "PLATFORM"
  );


  login();
};


  /* ==========================================================================
     UI
  ========================================================================== */

  return (

    <View
      style={styles.container}
    >

      {/* ====================================================================
          LOGO
      ==================================================================== */}

      <View
        style={styles.logoContainer}
      >

        <Image
          source={{
            uri:
              "https://thumbs.dreamstime.com/z/school-logo-graduation-icon-education-college-school-logo-school-logo-graduation-icon-education-college-school-logo-white-137290284.jpg",
          }}
          style={styles.logo}
        />

      </View>


      {/* ====================================================================
          SCHOOL CODE
      ==================================================================== */}

      <TextInput
        mode="outlined"
        label="School Code (Optional)"
        value={schoolCode}
        onChangeText={(text) => {

          setSchoolCode(
            text
              .trim()
              .toUpperCase()
          );

          setSchoolCodeError("");

        }}
        error={
          !!schoolCodeError
        }
        style={
          !schoolCodeError
            ? styles.textInput
            : undefined
        }
        autoCapitalize="characters"
        autoCorrect={false}
      />


      {schoolCodeError ? (

        <Text
          style={styles.error}
        >
          {schoolCodeError}
        </Text>

      ) : null}


      {/* ====================================================================
          EMAIL
      ==================================================================== */}

      <TextInput
        mode="outlined"
        label="Email ID"
        value={email}
        onChangeText={(text) => {

          setEmail(
            text.trim()
          );

          setEmailError("");

        }}
        error={
          !!emailError
        }
        style={
          !emailError
            ? styles.textInput
            : undefined
        }
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
      />


      {emailError ? (

        <Text
          style={styles.error}
        >
          {emailError}
        </Text>

      ) : null}


      {/* ====================================================================
          PASSWORD
      ==================================================================== */}

      <TextInput
        mode="outlined"
        label="Password"
        value={password}
        onChangeText={(text) => {

          onChangePassword(text);

          setPasswordError("");

        }}
        secureTextEntry={
          secureTextEntry
        }
        error={
          !!passwordError
        }
        style={
          !passwordError
            ? styles.textInput
            : undefined
        }
        right={
          <TextInput.Icon
            {...iconProps}
          />
        }
        autoCapitalize="none"
        autoCorrect={false}
      />


      {passwordError ? (

        <Text
          style={styles.error}
        >
          {passwordError}
        </Text>

      ) : null}


      {/* ====================================================================
          LOGIN
      ==================================================================== */}

      <Button
        mode="contained"
        onPress={onPress}
        loading={isLoading}
        disabled={isLoading}
      >
        Login
      </Button>


      {/* ====================================================================
          LOGIN TYPE HELPER
      ==================================================================== */}

      <Text
        style={styles.loginHint}
      >
        {schoolCode.trim()
          ? "School account login"
          : "Platform account login"}
      </Text>


      {/* ====================================================================
          ERROR
      ==================================================================== */}

      <Snackbar
        visible={
          showSnackBar
        }
        onDismiss={() => {
          setShowSnackBar(
            false
          );
        }}
        style={
          styles.snackbar
        }
        duration={2500}
      >
        {snackBarText}
      </Snackbar>

    </View>
  );
};


/* ============================================================================
   STYLES
============================================================================ */

const useStyles = makeStyles(() => {

  return {

    container: {
      flex: 1,
      margin: Metrics.x5,
      justifyContent: "center",
    },

    logoContainer: {
      width: "100%",
      alignItems: "center",
      marginBottom: Metrics.x3,
    },

    logo: {
      height: 100,
      width: 100,
      borderRadius: 75,
      resizeMode: "contain",
    },

    textInput: {
      marginBottom: Metrics.x5,
    },

    error: {
      color: Colors.error,
      marginBottom: Metrics.x5,
      marginTop: Metrics.x1,
    },

    loginHint: {
      textAlign: "center",
      marginTop: Metrics.x2,
      color: Colors.subtext,
      fontSize: 13,
    },

    snackbar: {
      backgroundColor:
        Colors.errorBg,
    },

  };
});


export {
  LoginScreen,
};