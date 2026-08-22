import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useEffect } from "react";
import { useUserStore } from "../store";
import { RootStackParamList, RootStackScreenNames } from "../types";

const SplashScreen = ({
  navigation,
}: {
  navigation: NativeStackNavigationProp<
    RootStackParamList,
    RootStackScreenNames.SplashScreen
  >;
}) => {
  let userLoggedIn = false;
  const { user, accessToken, accessTokenTTL, accessTokenFetchedAt } =
    useUserStore.getState();

  useEffect(() => {
    if (user && accessToken && accessTokenTTL && accessTokenFetchedAt) {
      const accessTokenExpired =
        Date.now() - accessTokenFetchedAt > accessTokenTTL - 3600; //1 hour less just to be safe
      userLoggedIn = !accessTokenExpired;
    }

    if (userLoggedIn) {
      navigation.reset({
        index: 0,
        routes: [{ name: RootStackScreenNames.Home }],
      });
    } else {
      navigation.reset({
        index: 0,
        routes: [{ name: RootStackScreenNames.Login }],
      });
    }
  }, []);

  return <></>;
};

export { SplashScreen };
