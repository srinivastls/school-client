import React from "react";

import {
  View,
} from "react-native";

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
  PlatformNavigationBar,
} from "./components";

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
import { TeacherDashboard } from "./screens/teacher/TeacherDashboard";
import { ParentDashboardScreen } from "./screens/dashboards/ParentDashboard";
import { PlatformSchoolsScreen } from "./screens/platform/PlatformSchoolsScreen";
import { PlatformAdminDashboard } from "./screens/platform/PlatformAdminDashboard";
import {CreateSchoolScreen} from "./screens/platform/CreateSchoolScreen";
import {CreatePrincipalScreen} from "./screens/platform/CreatePrincipalScreen";
//import {PrincipalDefaultersScreen} from "./screens/principal/PrincipalDefaultersScreen";
import {
  PrincipalStudentsScreen,
} from "./screens/principal/PrincipalStudentsScreen";

import {
  PlatformAdminSchoolDetails,
} from "./screens/platform/PlatformAdminSchoolDetails";
import {
  PrincipalTeachersScreen,
} from "./screens/principal/PrincipalTeachersScreen";

import {
  PrincipalParentsScreen,
} from "./screens/principal/PrincipalParentsScreen";

import {
  PrincipalClassesScreen,
} from "./screens/principal/PrincipalClassesScreen";

import {
  PrincipalClassStudentsScreen,
} from "./screens/principal/PrincipalClassStudentsScreen";

import {
  PrincipalFinanceScreen,
} from "./screens/principal/PrincipalFinanceScreen";

import {
  PrincipalAcademicsScreen,
} from "./screens/principal/PrincipalAcademicsScreen";

import {PrincipalDashboard} from "./screens/principal/PrincipalDashboard";

import {StudentRegistrationFormScreen} from "./screens/StudentRegistrationFormScreen";
import {EditStudentScreen} from "./screens/EditStudentScreen";
import {OldStudentRegistrationFormScreen} from "./screens/OldStudentRegistrationFormScreen";
import { PrincipalCreateTeacherScreen } from "./screens/principal/PrincipalCreateTeacherScreen";
import { PrincipalTeacherDetailsScreen } from "./screens/principal/PrincipalTeacherDetailsScreen";
import { ParentChildDetailsScreen } from "./screens/dashboards/ParentChildDetailsScreen";
import { PrincipalParentDetailsScreen } from "./screens/principal/PrincipalParentDetailsScreen";
import { PrincipalCreateAdminScreen } from "./screens/principal/PrincipalCreateAdminScreen";
import { PrincipalAdminsScreen } from "./screens/principal/PrincipalAdminsScreen";
import { PrincipalAdminDetailsScreen } from "./screens/principal/AdminDetailsScreen";
import { PrincipalCollectFeeScreen } from "./screens/principal/PrincipalCollectFeeScreen";
import { Invoice } from "./screens/Invoice";
import { PrincipalPendingDuesScreen } from "./screens/principal/PrincipalPendingDuesScreen";
import { PrincipalAttendanceDashboardScreen } from "./screens/principal/PrincipalAttendanceDashboardScreen";
import { PrincipalClassDetailsScreen } from "./screens/principal/ClassDetailsScreen";
import { AcademicYearManagementScreen } from "./screens/principal/AcademicYearManagementScreen";
import ClassManagementScreen from "./screens/principal/ClassManagementScreen";
import { PrincipalClassTeachersScreen } from "./screens/principal/PrincipalClassTeachersScreen";
const RootStack =
  createNativeStackNavigator<RootStackParamList>();

const queryClient = new QueryClient();

const withPlatformNavigation = (
  Screen: React.ComponentType<any>
) => {
  const PlatformScreen = (
    props: any
  ) => (
    <View style={{ flex: 1 }}>
      <PlatformNavigationBar />

      <Screen {...props} />
    </View>
  );

  return PlatformScreen;
};

const PlatformAdminDashboardScreen =
  withPlatformNavigation(
    PlatformAdminDashboard
  );

const PlatformSchoolsNavigationScreen =
  withPlatformNavigation(
    PlatformSchoolsScreen
  );

const PlatformSchoolDetailsNavigationScreen =
  withPlatformNavigation(
    PlatformAdminSchoolDetails
  );

const CreateSchoolNavigationScreen =
  withPlatformNavigation(
    CreateSchoolScreen
  );

const CreatePrincipalNavigationScreen =
  withPlatformNavigation(
    CreatePrincipalScreen
  );

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

            <RootStack.Screen
              name={
                RootStackScreenNames.PrincipalClassDetails
              }
              component={PrincipalClassDetailsScreen}
              options={{
                headerTitle: "Class Details",
              }}
            />

            <RootStack.Screen
              name={
                RootStackScreenNames.PrincipalAcademicYearManagement
              }
              component={AcademicYearManagementScreen}
              options={{
                headerTitle: "Academic Year Management",
              }}
            />

            <RootStack.Screen
              name={
                RootStackScreenNames.ClassManagement
              }
              component={ClassManagementScreen}
              options={{
                headerTitle: "Class Management",
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
                RootStackScreenNames.PrincipalClassTeachers
              }
              component={PrincipalClassTeachersScreen}
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
                PlatformAdminDashboardScreen
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
                PlatformSchoolsNavigationScreen
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
                CreateSchoolNavigationScreen
              }
              options={{
                headerShown: false,
              }}
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
                ParentDashboardScreen
              }
            />

            <RootStack.Screen
              name={
                RootStackScreenNames.PlatformAdminSchoolDetails
              }
              component={
                PlatformSchoolDetailsNavigationScreen
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
                CreatePrincipalNavigationScreen
            }
            options={{
              headerTitle: "Create Principal",headerShown: false,
            }}
            />

          <RootStack.Screen
            name={
              RootStackScreenNames.PrincipalDashboard
            }
            component={
              PrincipalDashboard
            }
            options={{
              headerTitle: "Principal Dashboard",headerShown: false,
            }}
          />

          <RootStack.Screen
            name={
              RootStackScreenNames.PrincipalParentDetails
            }
            component={
              PrincipalParentDetailsScreen
            }
            options={{
              headerTitle: "Principal Academics",headerShown: false,
            }}
          />

          <RootStack.Screen
  name={
    RootStackScreenNames.PrincipalCreateTeacher
  }
  component={
    PrincipalCreateTeacherScreen
  }
/>

        <RootStack.Screen
  name={
    RootStackScreenNames.PrincipalTeacherDetails
  }
  component={PrincipalTeacherDetailsScreen}
/>
        <RootStack.Screen
  name={
    RootStackScreenNames.ParentChildDetails
  }
  component={
    ParentChildDetailsScreen
  }
/>

        <RootStack.Screen
  name={
    RootStackScreenNames.PrincipalCreateAdmin
  }
  component={
    PrincipalCreateAdminScreen
  }
/>

  <RootStack.Screen
  name={
    RootStackScreenNames.PrincipalAdminDetails
  }
  component={
    PrincipalAdminDetailsScreen
  }
/>

<RootStack.Screen
  name={
    RootStackScreenNames.AdminList
  }
  component={
    PrincipalAdminsScreen
  }
/>
        <RootStack.Screen
  name={
    RootStackScreenNames.PrincipalFeeCollection
  }
  component={
    PrincipalCollectFeeScreen
  }
/>

  <RootStack.Screen
  name={
    RootStackScreenNames.Invoice
  }
  component={
    Invoice
  }
/>

    <RootStack.Screen
  name={
    RootStackScreenNames.PrincipalPendingDues
  }
  component={
    PrincipalPendingDuesScreen
  }
/>

    <RootStack.Screen
  name={
    RootStackScreenNames.PrincipalDefaulterStudents
  }
  component={
    PrincipalPendingDuesScreen
  }
/>

    <RootStack.Screen
  name={
    RootStackScreenNames.PrincipalAttendanceDashboard
  }
  component={
    PrincipalAttendanceDashboardScreen
  }
/>



          </RootStack.Navigator>

        </NavigationContainer>

      </QueryClientProvider>

    </PaperProvider>
  );
}
