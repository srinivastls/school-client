import React from "react";

import {
  Modal,
  Pressable,
  Platform,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

import {
  Avatar,
  Divider,
  IconButton,
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
        {user?.name ?? "Platform Admin"}
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

{profileMenuVisible && (
  <Modal
    visible={profileMenuVisible}
    transparent
    animationType="fade"
    statusBarTranslucent
    onRequestClose={() => {
      setProfileMenuVisible(false);
    }}
  >
    <Pressable
      style={styles.modalOverlay}
      onPress={() => {
        setProfileMenuVisible(false);
      }}
    >
      <View
        style={[
          styles.profileDropdown,
          isCompact
            ? styles.profileDropdownMobile
            : styles.profileDropdownDesktop,
        ]}
      >
        <View style={styles.dropdownProfileHeader}>
          <Avatar.Text
            size={46}
            label={initials}
            color="#FFFFFF"
            style={styles.dropdownAvatar}
          />

          <View style={styles.dropdownUserInfo}>
            <Text
              style={styles.dropdownUserName}
              numberOfLines={1}
            >
              {user?.name ?? "Platform Administrator"}
            </Text>

            <Text
              style={styles.dropdownUserEmail}
              numberOfLines={1}
            >
              {user?.email ?? "Platform Administrator"}
            </Text>

            <Text style={styles.dropdownUserRole}>
              Platform Administrator
            </Text>
          </View>
        </View>

        <Divider style={styles.dropdownDivider} />

        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.dropdownItem}
          onPress={() => {
            setProfileMenuVisible(false);
          }}
        >
          <View style={styles.dropdownIconContainer}>
            <Text style={styles.dropdownIcon}>
              👤
            </Text>
          </View>

          <View style={styles.dropdownItemTextContainer}>
            <Text style={styles.dropdownItemTitle}>
              Profile
            </Text>

            <Text style={styles.dropdownItemSubtitle}>
              View administrator profile
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          style={[
            styles.dropdownItem,
            styles.logoutItem,
          ]}
          onPress={handleLogout}
        >
          <View
            style={[
              styles.dropdownIconContainer,
              styles.logoutIconContainer,
            ]}
          >
            <Text
              style={[
                styles.dropdownIcon,
                styles.logoutIcon,
              ]}
            >
              ↪
            </Text>
          </View>

          <View style={styles.dropdownItemTextContainer}>
            <Text
              style={[
                styles.dropdownItemTitle,
                styles.logoutTitle,
              ]}
            >
              Logout
            </Text>

            <Text style={styles.dropdownItemSubtitle}>
              Sign out of this account
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </Pressable>
  </Modal>
)}
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
    marginTop: Platform.OS === "web" ? 0 : 50,
  },
modalOverlay: {
  flex: 1,
  backgroundColor: "rgba(0, 0, 0, 0.15)",
},

profileDropdown: {
  position: "absolute",
  backgroundColor: "#FFFFFF",
  borderRadius: 14,
  paddingVertical: Metrics.x2,
  elevation: 8,
  shadowColor: "#000000",
  shadowOffset: {
    width: 0,
    height: 4,
  },
  shadowOpacity: 0.15,
  shadowRadius: 12,
},

profileDropdownDesktop: {
  top: 68,
  right: Metrics.x3,
  width: 310,
},

profileDropdownMobile: {
  top: 64,
  left: Metrics.x2,
  right: Metrics.x2,
},

dropdownProfileHeader: {
  flexDirection: "row",
  alignItems: "center",
  paddingHorizontal: Metrics.x3,
  paddingVertical: Metrics.x2,
},

dropdownAvatar: {
  backgroundColor: Colors.brandPrimary,
},

dropdownUserInfo: {
  flex: 1,
  marginLeft: Metrics.x2,
},

dropdownUserName: {
  fontSize: 14,
  fontWeight: "800",
  color: "#25252A",
},

dropdownUserEmail: {
  marginTop: 2,
  fontSize: 12,
  color: Colors.subtext,
},

dropdownUserRole: {
  marginTop: 3,
  fontSize: 11,
  fontWeight: "700",
  color: Colors.brandPrimary,
},

dropdownDivider: {
  marginVertical: Metrics.x1,
},

dropdownItem: {
  flexDirection: "row",
  alignItems: "center",
  paddingHorizontal: Metrics.x3,
  paddingVertical: Metrics.x2,
},

dropdownIconContainer: {
  width: 38,
  height: 38,
  borderRadius: 10,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: Colors.brandPrimaryBg,
},

dropdownIcon: {
  fontSize: 18,
},

dropdownItemTextContainer: {
  flex: 1,
  marginLeft: Metrics.x2,
},

dropdownItemTitle: {
  fontSize: 13,
  fontWeight: "800",
  color: "#25252A",
},

dropdownItemSubtitle: {
  marginTop: 2,
  fontSize: 11,
  color: Colors.subtext,
},

logoutItem: {
  marginTop: Metrics.x1,
},

logoutIconContainer: {
  backgroundColor: "#FDECEC",
},

logoutIcon: {
  color: "#D64545",
},

logoutTitle: {
  color: "#D64545",
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
