import React, { useState } from "react";

import {
  View,
} from "react-native";

import {
  NavigationContainer,
  createNavigationContainerRef,
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

import { ModuleNavigationBar } from "./components/ModuleNavigationBar";

import {
  RootStackParamList,
  RootStackScreenNames,
} from "./types";

import { LoginScreen } from "./screens/LoginScreen";
import { HomeScreen } from "./screens/HomeScreen";
import { SplashScreen } from "./screens/SplashScreen";

import { AdminFeatureMenu } from "./screens/admin/AdminFeatureMenuScreen";
import { AdminStudentManagement } from "./screens/admin/AdminStudentManagement";
import { AdminStudentRegistration } from "./screens/admin/AdminStudentRegistration";
import { AdminStudentEdit } from "./screens/admin/AdminStudentEdit";
import { AdminStudentDetails } from "./screens/admin/AdminStudentDetails";

import { AdminFinanceManagement } from "./screens/admin/AdminFinanceManagement";
import { AdminStaffManagement } from "./screens/admin/AdminStaffManagement";
import { AdminAttendanceCalendar } from "./screens/admin/AdminAttendanceCalendar";
import { AdminCommunication } from "./screens/admin/AdminCommunication";
import { AdminSchoolSettings } from "./screens/admin/AdminSchoolSettings";
import { AdminReports } from "./screens/admin/AdminReports";

import { StudentDetails } from "./screens/StudentDetails";
import { StudentRegistration } from "./screens/StudentRegistration";
import { AdminDashboard } from "./screens/admin/AdminDashboard";
import { TeacherDashboard } from "./screens/teacher/TeacherDashboard";
import { ParentDashboardScreen } from "./screens/parent/ParentDashboard";
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
import ProfileScreen from "./screens/ProfileScreen";
import {
  PrincipalAcademicsScreen,
} from "./screens/principal/PrincipalAcademicsScreen";

import {PrincipalDashboard} from "./screens/principal/PrincipalDashboard";

import {StudentRegistrationFormScreen} from "./screens/StudentRegistrationFormScreen";
import {EditStudentScreen} from "./screens/EditStudentScreen";
import {OldStudentRegistrationFormScreen} from "./screens/OldStudentRegistrationFormScreen";
import { PrincipalCreateTeacherScreen } from "./screens/principal/PrincipalCreateTeacherScreen";
import { PrincipalTeacherDetailsScreen } from "./screens/principal/PrincipalTeacherDetailsScreen";
import { ParentChildDetailsScreen } from "./screens/parent/ParentChildDetailsScreen";
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
import {TeacherMyClassesScreen} from "./screens/teacher/TeacherMyClassesScreen";
import { TeacherSectionDetailsScreen } from "./screens/teacher/TeacherSectionDetailsScreen";
import { TeacherSectionStudentsScreen } from "./screens/teacher/TeacherSectionStudentsScreen";
import TeacherSectionAttendanceScreen from "./screens/teacher/TeacherSectionAttendanceScreen";
import TeacherStudentAttendanceHistoryScreen from "./screens/teacher/TeacherStudentAttendanceHistoryScreen";
import TeacherMyStudentsScreen from "./screens/teacher/TeacherMyStudentsScreen";
import TeacherMarksEntryScreen from "./screens/teacher/TeacherMarksEntryScreen";
import TeacherMyAttendanceScreen from "./screens/teacher/TeacherMyAttendanceScreen";
import TeacherLeaveScreen from "./screens/teacher/TeacherLeaveScreen";
import TeacherProfileScreen from "./screens/teacher/TeacherProfileScreen";
import TeacherTimetableScreen from "./screens/teacher/TeacherTimetableScreen";
import TeacherAttendanceScreen from "./screens/teacher/TeacherAttendanceScreen";
import { PrincipalDefaultersScreen } from "./screens/principal/PrincipalDefaultersScreen";
import AdminLeaveApprovals from "./screens/admin/AdminLeaveApprovals";
import AdminTeacherAttendance from "./screens/admin/AdminTeacherAttendance";
import { PromotionDemotion } from "./screens";
import SectionManagementScreen from "./screens/SectionManagementScreen";
const RootStack =
  createNativeStackNavigator<RootStackParamList>();

const queryClient = new QueryClient();

const navigationRef = createNavigationContainerRef<RootStackParamList>();

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
  const [activeRoute, setActiveRoute] = useState<string>(RootStackScreenNames.SplashScreen);


  return (
    <PaperProvider theme={theme}>

      <StatusBar style="auto" />

      <QueryClientProvider client={queryClient}>

        <NavigationContainer
          ref={navigationRef}
          onReady={() => setActiveRoute(navigationRef.getCurrentRoute()?.name ?? RootStackScreenNames.SplashScreen)}
          onStateChange={() => setActiveRoute(navigationRef.getCurrentRoute()?.name ?? RootStackScreenNames.SplashScreen)}
        >

          <View style={{ flex: 1 }}>
            <ModuleNavigationBar activeRoute={activeRoute} navigationRef={navigationRef} />

          <RootStack.Navigator
            initialRouteName={
              RootStackScreenNames.SplashScreen
            }
            screenOptions={{
              animation: "fade",
              headerShown: false,

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

            <RootStack.Screen
              name={RootStackScreenNames.PromotionDemotion}
              component={
                PromotionDemotion
              }
              options={{
                headerTitle: "Promotion/Demotion",
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
  name={RootStackScreenNames.TeacherMyClasses}
  component={TeacherMyClassesScreen}
/>

<RootStack.Screen
  name={RootStackScreenNames.TeacherSectionDetails}
  component={TeacherSectionDetailsScreen}
/>

<RootStack.Screen
  name={RootStackScreenNames.TeacherSectionStudents}
  component={
    TeacherSectionStudentsScreen
  }
/>

<RootStack.Screen
  name={RootStackScreenNames.TeacherSectionAttendance}
  component={
    TeacherSectionAttendanceScreen
  }
/>

<RootStack.Screen
  name={RootStackScreenNames.TeacherStudentAttendanceHistory}
  component={TeacherStudentAttendanceHistoryScreen}
/>

<RootStack.Screen
  name={RootStackScreenNames.TeacherMyStudents}
  component={TeacherMyStudentsScreen}
/>

<RootStack.Screen
  name={RootStackScreenNames.TeacherMarksEntry}
  component={TeacherMarksEntryScreen}
/>

<RootStack.Screen
  name={RootStackScreenNames.TeacherMyAttendance}
  component={TeacherMyAttendanceScreen}
  options={{
    headerShown: false,
  }}
/>

<RootStack.Screen
  name={RootStackScreenNames.TeacherLeave}
  component={TeacherLeaveScreen}
  options={{
    headerShown: false,
  }}
/>


<RootStack.Screen
  name={RootStackScreenNames.TeacherProfile}
  component={TeacherProfileScreen}
  options={{
    headerShown: false,
  }}
/>

<RootStack.Screen
  name={RootStackScreenNames.TeacherTimetable}
  component={TeacherTimetableScreen}
  options={{
    headerShown: false,
  }}
/>

<RootStack.Screen
name={RootStackScreenNames.TeacherAttendance}
  component={TeacherAttendanceScreen}
/>

<RootStack.Screen
  name={RootStackScreenNames.AdminTeacherAttendance}
  component={AdminTeacherAttendance}
/>

<RootStack.Screen
  name={RootStackScreenNames.AdminLeaveApprovals}
  component={AdminLeaveApprovals}
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
             name={ RootStackScreenNames.ProfileScreen}
             component={ProfileScreen}
             options={{
               headerShown: false,
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

            <RootStack.Screen
              name={
                RootStackScreenNames.SectionManagement
              }
              component={SectionManagementScreen}
              options={{
                headerTitle: "Section Management",
              }}
            />

            <RootStack.Screen
  name={RootStackScreenNames.AdminFeatureMenu}
  component={AdminFeatureMenu}
  options={{
    headerShown: false,
  }}
/>

<RootStack.Screen
  name={RootStackScreenNames.AdminStudentDetails}
  component={AdminStudentDetails}
  options={{
    headerShown: false,
  }}
/>

<RootStack.Screen
  name={RootStackScreenNames.AdminStudentEdit}
  component={AdminStudentEdit}
  options={{
    headerShown: false,
  }}
/>

<RootStack.Screen
  name={RootStackScreenNames.AdminStudentManagement}
  component={AdminStudentManagement}
  options={{
    headerShown: false,
  }}
/>

<RootStack.Screen
  name={RootStackScreenNames.AdminFinanceManagement}
  component={AdminFinanceManagement}
  options={{
    headerShown: false,
  }}
/>

<RootStack.Screen
  name={RootStackScreenNames.AdminStaffManagement}
  component={AdminStaffManagement}
  options={{
    headerShown: false,
  }}
/>

<RootStack.Screen
  name={RootStackScreenNames.AdminAttendanceCalendar}
  component={AdminAttendanceCalendar}
  options={{
    headerShown: false,
  }}
/>

<RootStack.Screen
  name={RootStackScreenNames.AdminCommunication}
  component={AdminCommunication}
  options={{
    headerShown: false,
  }}
/>

<RootStack.Screen
  name={RootStackScreenNames.AdminSchoolSettings}
  component={AdminSchoolSettings}
  options={{
    headerShown: false,
  }}
/>

<RootStack.Screen
  name={RootStackScreenNames.AdminReports}
  component={AdminReports}
  options={{
    headerShown: false,
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
    RootStackScreenNames.AdminStudentRegistration
  }
  component={
    AdminStudentRegistration
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
    PrincipalDefaultersScreen
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

          </View>

        </NavigationContainer>

      </QueryClientProvider>

    </PaperProvider>
  );
}
