import React, { useEffect, useState } from "react";
import { View, Image, Text } from "react-native";
import { Colors, makeStyles, Metrics } from "../theme";
import { Snackbar, TextInput } from "react-native-paper";
import { Button } from "react-native-paper";
import {
  RootStackParamList,
  RootStackScreenNames,
  SigninRequest,
} from "../types";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { usePasswordInput } from "../hooks";
import { useQuery } from "react-query";
import { userServices } from "../services";
import { isEmailValid } from "../utils";

const LoginScreen = ({
  navigation,
}: {
  navigation: NativeStackNavigationProp<
    RootStackParamList,
    RootStackScreenNames.Login
  >;
}) => {
  const styles = useStyles();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showSnackBar, setShowSnackBar] = useState(false);
  const [snackBarText, setSnackBarText] = useState(
    "Something went wrong. Please try again later."
  );

  const { password, onChangePassword, iconProps, secureTextEntry } =
    usePasswordInput();

  const { data, isFetching, refetch, isError, error } = useQuery(
    ["user"],
    () =>
      userServices.signin({
        email,
        password,
      }),
    { refetchOnWindowFocus: false, enabled: false, cacheTime: 0 }
  );

  useEffect(() => {
    if (isError) {
      setSnackBarText(
        //@ts-ignore
        error?.response?.data?.message ??
          "Something went wrong. Please try again later."
      );
      setShowSnackBar(true);
    } else if (data && !isFetching) {
      navigation.reset({
        index: 0,
        routes: [{ name: RootStackScreenNames.Home }],
      });
    }
  }, [isError, data, isFetching, error]);

  const onPress = () => {
    if (isFetching) {
      return;
    }
    if (!isEmailValid(email)) {
      setEmailError("Invalid email");
    } else if (!password) {
      setPasswordError("Invalid password");
    } else {
      const signinPayload: SigninRequest = {
        email,
        password,
      };
      refetch();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={{
            uri: "https://thumbs.dreamstime.com/z/school-logo-graduation-icon-education-college-school-logo-school-logo-graduation-icon-education-college-school-logo-white-137290284.jpg",
          }}
          style={styles.logo}
        />
      </View>
      <TextInput
        mode="outlined"
        label="Email ID"
        onChangeText={(text) => {
          setEmail(text.trim());
          setEmailError("");
        }}
        style={!emailError ? styles.textInput : {}}
        error={!!emailError}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      {emailError && <Text style={styles.error}>{emailError}</Text>}

      <TextInput
        mode="outlined"
        label="Password"
        onChangeText={(text) => {
          onChangePassword(text);
          setPasswordError("");
        }}
        secureTextEntry={secureTextEntry}
        style={!passwordError ? styles.textInput : {}}
        right={<TextInput.Icon {...iconProps} />}
        error={!!passwordError}
        autoCapitalize="none"
      />
      {passwordError && <Text style={styles.error}>{passwordError}</Text>}

      <Button mode="contained" onPress={onPress} loading={isFetching}>
        Login
      </Button>
      <Snackbar
        visible={showSnackBar}
        onDismiss={() => {
          setShowSnackBar(false);
        }}
        style={styles.snackbar}
        duration={2500}
      >
        {snackBarText}
      </Snackbar>
      {/* <Button
        mode="text"
        style={styles.button}
        onPress={() => {
          navigation.navigate(RootStackScreenNames.Signup);
        }}
      >
        Create new account
      </Button> */}
    </View>
  );
};

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
    logo: { height: 100, width: 100, borderRadius: 75, resizeMode: "contain" },
    textInput: { marginBottom: Metrics.x5 },
    error: {
      color: Colors.error,
      marginBottom: Metrics.x5,
      marginTop: Metrics.x1,
    },
    snackbar: { backgroundColor: Colors.errorBg },
  };
});

export { LoginScreen };


// import React, { useState } from "react";
// import { View, Image, Text } from "react-native";
// import { Snackbar, TextInput, Button } from "react-native-paper";
// import { NativeStackNavigationProp } from "@react-navigation/native-stack";

// import { Colors, makeStyles, Metrics } from "../theme";
// import {
//   RootStackParamList,
//   RootStackScreenNames,
// } from "../types";
// import { usePasswordInput } from "../hooks";

// const LoginScreen = ({
//   navigation,
// }: {
//   navigation: NativeStackNavigationProp<
//     RootStackParamList,
//     RootStackScreenNames.Login
//   >;
// }) => {
//   const styles = useStyles();

//   const [email, setEmail] = useState("");
//   const [emailError, setEmailError] = useState("");
//   const [passwordError, setPasswordError] = useState("");
//   const [showSnackBar, setShowSnackBar] = useState(false);

//   const {
//     password,
//     onChangePassword,
//     iconProps,
//     secureTextEntry,
//   } = usePasswordInput();

//   const onPress = () => {
//     // Always navigate to Home
//     navigation.reset({
//       index: 0,
//       routes: [{ name: RootStackScreenNames.Home }],
//     });
//   };

//   return (
//     <View style={styles.container}>
//       <View style={styles.logoContainer}>
//         <Image
//           source={{
//             uri: "https://thumbs.dreamstime.com/z/school-logo-graduation-icon-education-college-school-logo-school-logo-graduation-icon-education-college-school-logo-white-137290284.jpg",
//           }}
//           style={styles.logo}
//         />
//       </View>

//       <TextInput
//         mode="outlined"
//         label="Email ID"
//         value={email}
//         onChangeText={(text) => {
//           setEmail(text.trim());
//           setEmailError("");
//         }}
//         style={!emailError ? styles.textInput : {}}
//         error={!!emailError}
//         autoCapitalize="none"
//         keyboardType="email-address"
//       />

//       {emailError && (
//         <Text style={styles.error}>{emailError}</Text>
//       )}

//       <TextInput
//         mode="outlined"
//         label="Password"
//         value={password}
//         onChangeText={(text) => {
//           onChangePassword(text);
//           setPasswordError("");
//         }}
//         secureTextEntry={secureTextEntry}
//         style={!passwordError ? styles.textInput : {}}
//         right={<TextInput.Icon {...iconProps} />}
//         error={!!passwordError}
//         autoCapitalize="none"
//       />

//       {passwordError && (
//         <Text style={styles.error}>{passwordError}</Text>
//       )}

//       <Button mode="contained" onPress={onPress}>
//         Login
//       </Button>

//       <Snackbar
//         visible={showSnackBar}
//         onDismiss={() => {
//           setShowSnackBar(false);
//         }}
//         style={styles.snackbar}
//         duration={2500}
//       >
//         Something went wrong. Please try again later.
//       </Snackbar>
//     </View>
//   );
// };

// const useStyles = makeStyles(() => {
//   return {
//     container: {
//       flex: 1,
//       margin: Metrics.x5,
//       justifyContent: "center",
//     },

//     logoContainer: {
//       width: "100%",
//       alignItems: "center",
//       marginBottom: Metrics.x3,
//     },

//     logo: {
//       height: 100,
//       width: 100,
//       borderRadius: 75,
//       resizeMode: "contain",
//     },

//     textInput: {
//       marginBottom: Metrics.x5,
//     },

//     error: {
//       color: Colors.error,
//       marginBottom: Metrics.x5,
//       marginTop: Metrics.x1,
//     },

//     snackbar: {
//       backgroundColor: Colors.errorBg,
//     },
//   };
// });

// export { LoginScreen };