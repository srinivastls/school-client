import React from "react";

import {
  NavigationContainer,
} from "@react-navigation/native";

import {
  QueryClient,
  QueryClientProvider,
} from "react-query";

import { StatusBar } from "expo-status-bar";

import {
  createNativeStackNavigator,
} from "@react-navigation/native-stack";

import {
  MD3LightTheme as DefaultTheme,
  Provider as PaperProvider,
} from "react-native-paper";

import {
  ThemeProp,
} from "react-native-paper/lib/typescript/types";

import {
  Colors,
} from "./theme";

import {
  RootStackParamList,
  RootStackScreenNames,
} from "./types";

import { LoginScreen } from "./screens/LoginScreen";
import { HomeScreen } from "./screens/HomeScreen";
import { SplashScreen } from "./screens/SplashScreen";

import { StudentDetails } from "./screens/StudentDetails";
import { StudentRegistration } from "./screens/StudentRegistration";
import { AdminDashboard } from "./screens/dashboards/AdminDashboard";
import { TeacherDashboard } from "./screens/dashboards/TeacherDashboard";
import { ParentDashboard } from "./screens/dashboards/ParentDashboard";
import { PlatformSchoolsScreen } from "./screens/platform/PlatformSchoolsScreen";
import { PlatformAdminDashboard } from "./screens/platform/PlatformAdminDashboard";
import {CreateSchoolScreen} from "./screens/platform/CreateSchoolScreen";
import {CreatePrincipalScreen} from "./screens/platform/CreatePrincipalScreen";
import {
  PrincipalStudentsScreen,
} from "./screens/dashboards/PrincipalStudentsScreen";

import {
  PlatformAdminSchoolDetails,
} from "./screens/platform/PlatformAdminSchoolDetails";
import {
  PrincipalTeachersScreen,
} from "./screens/dashboards/PrincipalTeachersScreen";

import {
  PrincipalParentsScreen,
} from "./screens/dashboards/PrincipalParentsScreen";

import {
  PrincipalClassesScreen,
} from "./screens/dashboards/PrincipalClassesScreen";

import {
  PrincipalClassStudentsScreen,
} from "./screens/dashboards/PrincipalClassStudentsScreen";

import {
  PrincipalFinanceScreen,
} from "./screens/dashboards/PrincipalFinanceScreen";

import {
  PrincipalAcademicsScreen,
} from "./screens/dashboards/PrincipalAcademicsScreen";

import {StudentRegistrationFormScreen} from "./screens/StudentRegistrationFormScreen";
import {EditStudentScreen} from "./screens/EditStudentScreen";
import {OldStudentRegistrationFormScreen} from "./screens/OldStudentRegistrationFormScreen";
const RootStack =
  createNativeStackNavigator<RootStackParamList>();

const queryClient = new QueryClient();

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

export default function App() {
  console.log(
    "🔥 APP: PrincipalFinance route registered"
  );

  return (
    <PaperProvider theme={theme}>

      <StatusBar style="auto" />

      <QueryClientProvider client={queryClient}>

        <NavigationContainer>

          <RootStack.Navigator
            initialRouteName={
              RootStackScreenNames.SplashScreen
            }
            screenOptions={{
              animation: "fade",

              headerStyle: {
                backgroundColor:
                  Colors.brandPrimary,
              },

              headerTintColor: "white",

              contentStyle: {
                backgroundColor:
                  Colors.background,
              },
            }}
          >

            {/* AUTH */}

            <RootStack.Screen
              name={RootStackScreenNames.Login}
              component={LoginScreen}
              options={{
                headerShown: false,
              }}
            />

            {/* <RootStack.Screen
              name={RootStackScreenNames.Signup}
              component={SignupScreen}
              options={{
                headerTitle: "Create Admin",
              }}
            /> */}

            {/* SPLASH */}

            <RootStack.Screen
              name={RootStackScreenNames.SplashScreen}
              component={SplashScreen}
              options={{
                headerShown: false,
              }}
            />

            {/* HOME */}

            <RootStack.Screen
              name={RootStackScreenNames.Home}
              component={HomeScreen}
              options={{
                headerShown: false,
              }}
            />

            {/* PRINCIPAL ROUTES */}

            <RootStack.Screen
              name={
                RootStackScreenNames.PrincipalStudents
              }
              component={PrincipalStudentsScreen}
              options={{
                headerTitle: "Students",
              }}
            />

            <RootStack.Screen
              name={
                RootStackScreenNames.PrincipalTeachers
              }
              component={PrincipalTeachersScreen}
              options={{
                headerTitle: "Teachers",
              }}
            />

            <RootStack.Screen
              name={
                RootStackScreenNames.PrincipalParents
              }
              component={PrincipalParentsScreen}
              options={{
                headerTitle: "Parents",
              }}
            />

            <RootStack.Screen
              name={
                RootStackScreenNames.PrincipalClasses
              }
              component={PrincipalClassesScreen}
              options={{
                headerTitle: "Classes",
              }}
            />

            <RootStack.Screen
              name={
                RootStackScreenNames.PrincipalClassStudents
              }
              component={PrincipalClassStudentsScreen}
              options={{
                headerTitle: "Class Students",
              }}
            />

            {/* ⭐ FINANCE ⭐ */}

            <RootStack.Screen
              name={
                RootStackScreenNames.PrincipalFinance
              }
              component={PrincipalFinanceScreen}
              options={{
                headerTitle: "Finance Dashboard",
              }}
            />

            {/* ⭐ ACADEMICS ⭐ */}

            <RootStack.Screen
              name={
                RootStackScreenNames.PrincipalAcademics
              }
              component={PrincipalAcademicsScreen}
              options={{
                headerTitle: "Academics Dashboard",
              }}
            />

            <RootStack.Screen
              name={RootStackScreenNames.StudentDetails}
              component={StudentDetails}
            />

            <RootStack.Screen
              name={
                RootStackScreenNames.StudentRegistration
              }
              component={StudentRegistration}
            />

            <RootStack.Screen
              name={
                RootStackScreenNames.StudentRegistrationForm
              }
              component={StudentRegistrationFormScreen}
            />

            <RootStack.Screen
              name={
                RootStackScreenNames.OldStudentRegistrationFormScreen
              }
              component={OldStudentRegistrationFormScreen}
            />


            <RootStack.Screen
              name={
                RootStackScreenNames.EditStudent
              }
              component={EditStudentScreen}
            />

            <RootStack.Screen
              name={
                RootStackScreenNames.PlatformAdminDashboard
              }
              component={
                PlatformAdminDashboard
              }
              options={{
    headerShown: false,
  }}
            />

            <RootStack.Screen
              name={
                RootStackScreenNames.PlatformSchools
              }
              component={
                PlatformSchoolsScreen
              }
              options={{
    headerShown: false,
  }}

            />

            <RootStack.Screen
              name={
                RootStackScreenNames.PlatformAdminCreateSchool
              }
              component={
                CreateSchoolScreen
              }
  //             options={{
  //   headerShown: false,
  // }}
            />

            <RootStack.Screen
              name={
                RootStackScreenNames.AdminDashboard
              }
              component={
                AdminDashboard
              }
              options={{
    headerShown: false,
  }}
            />

            <RootStack.Screen
              name={
                RootStackScreenNames.TeacherDashboard
              }
              component={
                TeacherDashboard
              }
            />

            <RootStack.Screen
              name={
                RootStackScreenNames.ParentDashboard
              }
              component={
                ParentDashboard
              }
            />

            <RootStack.Screen
              name={
                RootStackScreenNames.PlatformAdminSchoolDetails
              }
              component={
                PlatformAdminSchoolDetails
              }
              options={{
    headerShown: false,
  }}
            />

            <RootStack.Screen
            name={
              RootStackScreenNames.PlatformAdminCreatePrincipal
            }
            component={
              CreatePrincipalScreen
            }
            options={{
              headerTitle: "Create Principal",headerShown: false,
            }}
            />

                  
          </RootStack.Navigator>

        </NavigationContainer>

      </QueryClientProvider>

    </PaperProvider>
  );
}