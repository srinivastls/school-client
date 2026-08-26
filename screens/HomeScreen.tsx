import React, { useEffect } from "react";

import {
  View,
  Text,
  ActivityIndicator,
} from "react-native";

import type {
  NativeStackScreenProps,
} from "@react-navigation/native-stack";

import {
  useUserStore,
} from "../store";

import {
  RootStackParamList,
  RootStackScreenNames,
} from "../types";


/* ============================================================================
   TYPES
============================================================================ */

type HomeScreenProps =
  NativeStackScreenProps<
    RootStackParamList,
    RootStackScreenNames.Home
  >;


/* ============================================================================
   SCREEN
============================================================================ */

const HomeScreen = ({
  navigation,
}: HomeScreenProps) => {

  const user =
    useUserStore(
      (state) => state.user
    );

  /* ==========================================================================
     ROUTE USER TO DASHBOARD
  ========================================================================== */

  useEffect(() => {

    if (!user) {
      return;
    }


    switch (user.role) {

      case "PLATFORM_ADMIN":

        navigation.replace(
          RootStackScreenNames.PlatformAdminDashboard
        );

        break;


      case "PRINCIPAL":

        navigation.replace(
          RootStackScreenNames.PrincipalDashboard
        );

        break;


      case "ADMIN":

        navigation.replace(
          RootStackScreenNames.AdminDashboard
        );

        break;


      case "TEACHER":

        navigation.replace(
          RootStackScreenNames.TeacherDashboard
        );

        break;


      case "PARENT":

        navigation.replace(
          RootStackScreenNames.ParentDashboard
        );

        break;


      default:

        console.error(
          "❌ INVALID USER ROLE:",
          user.role
        );

        break;
    }

  }, [
    user,
    navigation,
  ]);


  /* ==========================================================================
     NO SESSION
  ========================================================================== */

  if (!user) {

    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
      >

        <Text>
          Session not found
        </Text>

      </View>
    );
  }


  /* ==========================================================================
     INVALID ROLE
  ========================================================================== */

  const validRoles = [
    "PLATFORM_ADMIN",
    "PRINCIPAL",
    "ADMIN",
    "TEACHER",
    "PARENT",
  ];


  if (
    !validRoles.includes(
      user.role
    )
  ) {

    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
      >

        <Text>
          Invalid user role:{" "}
          {String(user.role)}
        </Text>

      </View>
    );
  }


  /* ==========================================================================
     ROUTING LOADING
  ========================================================================== */

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
      }}
    >

      <ActivityIndicator />

      <Text
        style={{
          marginTop: 12,
        }}
      >
        Loading dashboard...
      </Text>

    </View>
  );
};


export {
  HomeScreen,
};