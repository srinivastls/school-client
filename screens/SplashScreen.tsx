import React, { useEffect } from "react";
import {
  ActivityIndicator,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  NativeStackScreenProps,
} from "@react-navigation/native-stack";

import {
  useUserStore,
} from "../store";

import {
  RootStackParamList,
  RootStackScreenNames,
} from "../types";

import {
  Colors,
} from "../theme";


type Props = NativeStackScreenProps<
  RootStackParamList,
  RootStackScreenNames.SplashScreen
>;


const SplashScreen = ({
  navigation,
}: Props) => {

  const user = useUserStore(
    (state) => state.user
  );

  const accessToken = useUserStore(
    (state) => state.accessToken
  );

  const hasHydrated = useUserStore(
    (state) => state.hasHydrated
  );


  useEffect(() => {

    const checkStorage = async () => {

      try {

        const raw =
          await AsyncStorage.getItem(
            "userStore"
          );

        

        

        

      } catch (error) {

        console.error(
          "SPLASH STORAGE ERROR:",
          error
        );

      }

    };

    checkStorage();

  }, [
    hasHydrated,
    user,
    accessToken,
  ]);


  useEffect(() => {

    if (!hasHydrated) {
      return;
    }


    if (
      user &&
      accessToken
    ) {

      console.log(
        "🔥 SPLASH → HOME"
      );

      navigation.reset({

        index: 0,

        routes: [
          {
            name:
              RootStackScreenNames.Home,
          },
        ],

      });

      return;
    }


    console.log(
      "🔥 SPLASH → LOGIN"
    );

    navigation.reset({

      index: 0,

      routes: [
        {
          name:
            RootStackScreenNames.Login,
        },
      ],

    });

  }, [
    hasHydrated,
    user,
    accessToken,
    navigation,
  ]);


  return (

    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor:
          Colors.background,
      }}
    >

      <ActivityIndicator
        size="large"
        color={
          Colors.brandPrimary
        }
      />

    </View>

  );
};


export {
  SplashScreen,
};