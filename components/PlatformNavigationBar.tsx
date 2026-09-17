import React from "react";

import {
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";

import {
  Avatar,
  IconButton,
  Menu,
  Text,
  TouchableRipple,
} from "react-native-paper";

import {
  useNavigation,
  useRoute,
} from "@react-navigation/native";

import type {
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";

import {
  RootStackParamList,
  RootStackScreenNames,
} from "../types";

import {
  Colors,
  Metrics,
} from "../theme";

import {
  useUserStore,
} from "../store";

type Navigation =
  NativeStackNavigationProp<
    RootStackParamList
  >;

type NavigationItem = {
  label: string;
  icon: string;
  screen:
    | RootStackScreenNames.PlatformAdminDashboard
    | RootStackScreenNames.PlatformSchools
    | RootStackScreenNames.PlatformAdminCreateSchool;
};

const items: NavigationItem[] = [
  {
    label: "Dashboard",
    icon: "view-dashboard-outline",
    screen:
      RootStackScreenNames.PlatformAdminDashboard,
  },
  {
    label: "Schools",
    icon: "school-outline",
    screen:
      RootStackScreenNames.PlatformSchools,
  },
  {
    label: "Add school",
    icon: "plus-circle-outline",
    screen:
      RootStackScreenNames.PlatformAdminCreateSchool,
  },
];

const PlatformNavigationBar = () => {
  const {
    width,
  } = useWindowDimensions();

  const isCompact =
    width < 720;

  const navigation =
    useNavigation<Navigation>();

  const route = useRoute();

  const [
    profileMenuVisible,
    setProfileMenuVisible,
  ] = React.useState(false);

  const user =
    useUserStore(
      (state) => state.user
    );

  const logout =
    useUserStore(
      (state) => state.logout
    );

  const initials =
    user?.name
      ?.split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((name) => name[0])
      .join("")
      .toUpperCase() ??
    "PA";

  const navigateTo = (
    screen: NavigationItem["screen"]
  ) => {
    if (route.name === screen) {
      return;
    }

    navigation.navigate(screen);
  };

  const handleLogout = () => {
    setProfileMenuVisible(false);

    logout();

    navigation.reset({
      index: 0,
      routes: [
        {
          name:
            RootStackScreenNames.Login,
        },
      ],
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.brand}>
        <IconButton
          icon="city-variant-outline"
          size={20}
          iconColor={Colors.brandPrimary}
          style={styles.brandIcon}
        />

        {!isCompact && (
          <Text style={styles.brandText}>
            Platform
          </Text>
        )}
      </View>

      <View style={styles.actions}>
        {items.map((item) => {
          const active =
            route.name === item.screen;

          return (
            <TouchableRipple
              key={item.screen}
              borderless
              onPress={() =>
                navigateTo(item.screen)
              }
              style={[
                styles.item,
                active && styles.itemActive,
              ]}
            >
              <View style={styles.itemContent}>
                <IconButton
                  icon={item.icon}
                  size={18}
                  iconColor={
                    active
                      ? Colors.brandPrimary
                      : Colors.subtext
                  }
                  style={styles.itemIcon}
                />

                {!isCompact && (
                  <Text
                    style={[
                      styles.itemLabel,
                      active &&
                        styles.itemLabelActive,
                    ]}
                  >
                    {item.label}
                  </Text>
                )}
              </View>
            </TouchableRipple>
          );
        })}

        <Menu
          visible={profileMenuVisible}
          onDismiss={() =>
            setProfileMenuVisible(false)
          }
          anchor={
            <TouchableRipple
              borderless
              onPress={() =>
                setProfileMenuVisible(true)
              }
              style={styles.profileButton}
            >
              <View style={styles.profileContent}>
                <Avatar.Text
                  label={initials}
                  size={32}
                  style={styles.profileAvatar}
                />

                {!isCompact && (
                  <Text
                    numberOfLines={1}
                    style={styles.profileName}
                  >
                    {user?.name ??
                      "Platform Admin"}
                  </Text>
                )}

                <IconButton
                  icon="chevron-down"
                  size={18}
                  iconColor={Colors.subtext}
                  style={styles.profileChevron}
                />
              </View>
            </TouchableRipple>
          }
        >
          <Menu.Item
            leadingIcon="account-circle-outline"
            title="Platform administrator"
            disabled
          />
          <Menu.Item
            leadingIcon="logout"
            title="Sign out"
            onPress={handleLogout}
          />
        </Menu>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Metrics.x3,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E8E8EE",
  },

  brand: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: Metrics.x2,
  },

  brandIcon: {
    margin: 0,
  },

  brandText: {
    fontSize: 15,
    fontWeight: "800",
    color: Colors.brandPrimary,
  },

  actions: {
    flexDirection: "row",
    alignItems: "center",
  },

  profileButton: {
    marginLeft: Metrics.x2,
    borderRadius: 12,
  },

  profileContent: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Metrics.x1,
  },

  profileAvatar: {
    backgroundColor: Colors.brandPrimary,
  },

  profileName: {
    maxWidth: 132,
    marginLeft: Metrics.x1,
    fontSize: 12,
    fontWeight: "800",
    color: "#25252A",
  },

  profileChevron: {
    margin: 0,
  },

  item: {
    borderRadius: 10,
    marginLeft: 2,
  },

  itemActive: {
    backgroundColor: Colors.brandPrimaryBg,
  },

  itemContent: {
    minHeight: 40,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Metrics.x1,
  },

  itemIcon: {
    margin: 0,
  },

  itemLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.subtext,
    marginRight: Metrics.x1,
  },

  itemLabelActive: {
    color: Colors.brandPrimary,
  },
});

export {
  PlatformNavigationBar,
};
