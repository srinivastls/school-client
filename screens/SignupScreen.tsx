import React, { useEffect, useRef, useState } from "react";
import { Image, Keyboard, ScrollView, Text, View } from "react-native";
import { Colors, makeStyles, Metrics } from "../theme";
import { Checkbox, Snackbar, TextInput } from "react-native-paper";
import { Button } from "react-native-paper";
import { Roles, SignupRequest } from "../types";
import { usePasswordInput } from "../hooks";
import { userServices } from "../services";
import { Page } from "../components";
import { isEmailValid } from "../utils";
import { useQuery } from "react-query";

const SignupScreen = () => {
  const styles = useStyles();

  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const { iconProps, secureTextEntry } = usePasswordInput();

  const {
    password: confirmedPassword,
    onChangePassword: onChangeConfirmPassword,
    iconProps: confirmPasswordIconProps,
    secureTextEntry: conformPasswordSecureTextEntry,
  } = usePasswordInput();

  const signupRequestPayload = useRef<SignupRequest>({
    name: "",
    email: "",
    password: "",
    designation: "",
    adminId: "",
    roles: [Roles.admin],
  });

  const [showSnackBar, setShowSnackBar] = useState(false);
  const [snackBarText, setSnackBarText] = useState(
    "Something went wrong. Please try again later."
  );
  const [snackBarBg, setSnackBarBg] = useState(Colors.errorBg);

  const { data, isFetching, refetch, isError, error } = useQuery(
    ["signup"],
    () => userServices.signup(signupRequestPayload.current),
    { refetchOnWindowFocus: false, enabled: false, cacheTime: 0 }
  );

  useEffect(() => {
    if (isError) {
      setSnackBarBg(Colors.errorBg);
      setSnackBarText(
        //@ts-ignore
        error?.response?.data?.message ??
          "Something went wrong. Please try again later."
      );
      setShowSnackBar(true);
    } else if (data && !isFetching) {
      setSnackBarBg(Colors.successBg);
      setSnackBarText("Admin created successfully");
      setShowSnackBar(true);
    }
  }, [isError, data, isFetching, error]);

  const onPress = () => {
    if (isFetching) {
      return;
    }
    Keyboard.dismiss();
    const { name, email, password, designation, adminId } =
      signupRequestPayload.current;

    if (
      !name ||
      !email ||
      !password ||
      !confirmedPassword ||
      !designation ||
      !adminId
    ) {
      setSnackBarText("Please enter all fields");
      setSnackBarBg(Colors.errorBg);
      setShowSnackBar(true);
      return;
    } else if (!isEmailValid(email)) {
      setSnackBarText("Invalid Email ID");
      setSnackBarBg(Colors.errorBg);
      setShowSnackBar(true);
      return;
    } else if (password !== confirmedPassword) {
      setSnackBarText("Passwords do not match");
      setSnackBarBg(Colors.errorBg);
      setShowSnackBar(true);
      return;
    } else {
      refetch();
    }
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      automaticallyAdjustKeyboardInsets
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <Page>
        <TextInput
          mode="outlined"
          label="Name"
          onChangeText={(text) => {
            signupRequestPayload.current.name = text;
          }}
          style={styles.textInput}
          autoCapitalize="words"
        />
        <TextInput
          mode="outlined"
          label="Admin ID"
          onChangeText={(text) => {
            signupRequestPayload.current.adminId = text;
          }}
          style={styles.textInput}
          autoCapitalize="characters"
        />
        <TextInput
          mode="outlined"
          label="Designation"
          onChangeText={(text) => {
            signupRequestPayload.current.designation = text;
          }}
          style={styles.textInput}
          autoCapitalize="words"
        />
        <TextInput
          mode="outlined"
          label="Email ID"
          onChangeText={(text) => {
            signupRequestPayload.current.email = text.trim();
          }}
          style={styles.textInput}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          mode="outlined"
          label="Password"
          onChangeText={(text) => {
            signupRequestPayload.current.password = text;
          }}
          secureTextEntry={secureTextEntry}
          style={styles.textInput}
          right={<TextInput.Icon {...iconProps} />}
          autoCapitalize="none"
        />
        <TextInput
          mode="outlined"
          label="Confirm password"
          onChangeText={onChangeConfirmPassword}
          secureTextEntry={conformPasswordSecureTextEntry}
          style={styles.textInput}
          right={<TextInput.Icon {...confirmPasswordIconProps} />}
          autoCapitalize="none"
        />
        <View style={styles.checkboxContainer}>
          <Checkbox
            status={isSuperAdmin ? "checked" : "unchecked"}
            onPress={() => {
              setIsSuperAdmin((isSuperAdmin) => !isSuperAdmin);
            }}
          />
          <Text>Make admin Super Admin</Text>
        </View>
        <Button
          mode="contained"
          style={styles.button}
          onPress={onPress}
          loading={isFetching}
        >
          CREATE ADMIN
        </Button>
        {/* <Button
        mode="text"
        style={styles.button}
        onPress={() => {
          navigation.reset({
            index: 0,
            routes: [{ name: RootStackScreenNames.Login }],
          });
        }}
      >
        Login to existing account
      </Button> */}
        <Snackbar
          visible={showSnackBar}
          onDismiss={() => {
            setShowSnackBar(false);
          }}
          style={{ backgroundColor: snackBarBg }}
          duration={2000}
        >
          {snackBarText}
        </Snackbar>
      </Page>
    </ScrollView>
  );
};

const useStyles = makeStyles(() => {
  return {
    textInput: { marginTop: Metrics.x5 },
    button: { marginTop: Metrics.x6 },
    checkboxContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: Metrics.x5,
    },
  };
});

export { SignupScreen };
