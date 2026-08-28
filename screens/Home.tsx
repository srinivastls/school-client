import {
  createDrawerNavigator,
  DrawerContentComponentProps,
  DrawerContentScrollView,
  DrawerItemList,
  DrawerNavigationOptions,
} from "@react-navigation/drawer";
import React from "react";
import {
  Image,
  View,
  StatusBar,
  Linking,
  Text,
  TouchableOpacity,
} from "react-native";
import { Icon, IconProps } from "../components";
import { Colors, makeStyles, Metrics } from "../theme";
import { ClassFeeStructure } from "./ClassFeeStructure";
//import { Dashboard } from "./Dashboard";
import { PromotionDemotion } from "./PromotionDemotion";
import { Report } from "./Report";
import { RootStackScreenNames, Screen } from "../types";
import { StudentRegistration } from "./StudentRegistration";
import { useUserStore } from "../store";

export enum DrawerScreenNames {
  Dashboard = "Dashboard",
  ClassFeeStructure = "ClassFeeStructure",
  Report = "Report",
  StudentRegistration = "StudentRegistration",
  PromotionDemotion = "PromotionDemotion",
}

type DrawerParamList = {
  [DrawerScreenNames.Dashboard]: undefined;
  [DrawerScreenNames.ClassFeeStructure]: undefined;
  [DrawerScreenNames.Report]: undefined;
  [DrawerScreenNames.StudentRegistration]: undefined;
  [DrawerScreenNames.PromotionDemotion]: undefined;
};

type DrawerScreen = Screen<DrawerScreenNames, DrawerNavigationOptions>;

const renderDrawerIcon = (
  drawerProps: {
    color: string;
    size: number;
    focused: boolean;
  },
  iconProps: IconProps
) => {
  return (
    <Icon
      {...iconProps}
      color={drawerProps.focused ? Colors.brandSecondary : "black"}
    />
  );
};

const DrawerScreens: DrawerScreen[] = [
  // {
  //   name: DrawerScreenNames.Dashboard,
  //   //component: Dashboard,
  //   options: {
  //     title: "Dashboard",
  //     drawerLabel: "Dashboard",
  //     drawerIcon: (drawerProps) =>
  //       renderDrawerIcon(drawerProps, {
  //         name: "dashboard",
  //         size: "lg",
  //       }),
  //   },
  // },
  {
    name: DrawerScreenNames.ClassFeeStructure,
    component: ClassFeeStructure,
    options: {
      title: "Class Fee Structure",
      drawerLabel: "Class Fee Structure",
      drawerIcon: (drawerProps) =>
        renderDrawerIcon(drawerProps, {
          name: "book",
          size: "lg",
        }),
    },
  },
  {
    name: DrawerScreenNames.Report,
    component: Report,
    options: {
      title: "Report",
      drawerLabel: "Report",
      drawerIcon: (drawerProps) =>
        renderDrawerIcon(drawerProps, {
          iconPack: "MaterialCommunityIcons",
          name: "file-document",
          size: "lg",
        }),
    },
  },
  {
    name: DrawerScreenNames.StudentRegistration,
    component: StudentRegistration,
    options: {
      title: "Student Registration",
      drawerLabel: "Student Registration",
      drawerIcon: (drawerProps) =>
        renderDrawerIcon(drawerProps, {
          name: "person-add",
          size: "lg",
        }),
    },
  },
  {
    name: DrawerScreenNames.PromotionDemotion,
    component: PromotionDemotion,
    options: {
      title: "Promotion/Demotion",
      drawerLabel: "Promotion/Demotion",
      drawerIcon: (drawerProps) =>
        renderDrawerIcon(drawerProps, {
          iconPack: "MaterialCommunityIcons",
          name: "account-convert",
          size: "lg",
        }),
    },
  },
];

const Drawer = createDrawerNavigator<DrawerParamList>();

const renderScreen = (screen: DrawerScreen) => {
  return (
    <Drawer.Screen
      name={screen.name}
      component={screen.component}
      options={screen.options}
      key={screen.name}
    />
  );
};

const DrawerContent = (props: DrawerContentComponentProps) => {
  const styles = useStyles();
  const user = useUserStore.getState().user;
  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={styles.container}
    >
      <View style={styles.profileSectionConatiner}>
        <Image
          source={{
            uri: "https://thumbs.dreamstime.com/z/school-logo-graduation-icon-education-college-school-logo-school-logo-graduation-icon-education-college-school-logo-white-137290284.jpg",
          }}
          style={styles.logoContainer}
        />
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.role}>{user?.designation}</Text>
      </View>
      <DrawerItemList {...props} />
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.logoutContainer}
          onPress={() => {
            useUserStore.getState().logout();
            props.navigation.reset({
              index: 0,
              routes: [{ name: RootStackScreenNames.Login }],
            });
          }}
        >
          <Icon name="power-settings-new" size="md" />
          <Text style={styles.bottomText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </DrawerContentScrollView>
  );
};

const useStyles = makeStyles(() => {
  return {
    container: {
      marginTop: -12 - (StatusBar.currentHeight ?? Metrics.x5),
      flexGrow: 1,
    },
    profileSectionConatiner: {
      backgroundColor: Colors.brandSecondary,
      padding: Metrics.x4,
      paddingTop: (StatusBar?.currentHeight ?? Metrics.x5) + Metrics.x3,
    },
    logoContainer: {
      height: 60,
      width: 60,
      borderRadius: 30,
      resizeMode: "contain",
      marginBottom: Metrics.x2,
    },
    name: {
      color: "white",
      fontWeight: "bold",
    },
    role: {
      color: "white",
      fontSize: 12,
    },
    bottomContainer: {
      flex: 1,
      justifyContent: "flex-end",
      margin: Metrics.x4,
    },
    logoutContainer: {
      flexDirection: "row",
      width: "100%",
      justifyContent: "center",
      alignItems: "center",
    },
    bottomText: { marginHorizontal: Metrics.x1 },
  };
});

const Home = () => {
  return (
    <Drawer.Navigator
      initialRouteName={DrawerScreenNames.Dashboard}
      screenOptions={{
        headerStyle: { backgroundColor: Colors.brandPrimary },
        drawerActiveTintColor: Colors.brandSecondary,
        headerTintColor: "white",
        swipeEdgeWidth: 50,
        sceneContainerStyle: { backgroundColor: Colors.background },
      }}
      drawerContent={DrawerContent}
      id="Drawer"
    >
      {DrawerScreens.map(renderScreen)}
    </Drawer.Navigator>
  );
};

export { Home };
