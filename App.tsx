import { NavigationContainer } from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "react-query";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RootScreens } from "./navigation";
import { Screen, RootStackParamList, RootStackScreenNames } from "./types";
import {
  MD3LightTheme as DefaultTheme,
  Provider as PaperProvider,
} from "react-native-paper";
import { Colors } from "./theme";
import { ThemeProp } from "react-native-paper/lib/typescript/types";

const RootStack = createNativeStackNavigator<RootStackParamList>();

const renderScreen = (screen: Screen) => {
  return (
    <RootStack.Screen
      name={screen.name}
      component={screen.component}
      options={screen.options}
      key={screen.name}
    />
  );
};

const theme: ThemeProp = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.brandPrimary,
    secondary: Colors.brandSecondary,
    primaryContainer: Colors.brandPrimaryBg,
    background: Colors.background,
  },
};

const queryClient = new QueryClient();

export default function App() {
  return (
    <PaperProvider theme={theme}>
      <StatusBar style="auto" />
      <NavigationContainer>
        <QueryClientProvider client={queryClient}>
          <RootStack.Navigator
            initialRouteName={RootStackScreenNames.SplashScreen}
            screenOptions={{
              animation: "fade",
              headerStyle: { backgroundColor: Colors.brandPrimary },
              headerTintColor: "white",
              contentStyle: { backgroundColor: Colors.background },
            }}
            id="RootStack"
          >
            {RootScreens.map(renderScreen)}
          </RootStack.Navigator>
        </QueryClientProvider>
      </NavigationContainer>
    </PaperProvider>
  );
}
