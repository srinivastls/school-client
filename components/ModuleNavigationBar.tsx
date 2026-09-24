import React from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { Avatar, Divider, IconButton, Text, TouchableRipple } from "react-native-paper";
import type { NavigationContainerRef } from "@react-navigation/native";
import { Colors, Metrics } from "../theme";
import { RootStackParamList, RootStackScreenNames } from "../types";
import { CommonScreens } from "../navigation/modules";
import { useUserStore } from "../store";

type NavItem = {
  label: string;
  icon: string;
  screen: RootStackScreenNames;
};

const roleItems: Record<string, NavItem[]> = {
  PLATFORM_ADMIN: [
    { label: "Dashboard", icon: "view-dashboard-outline", screen: RootStackScreenNames.PlatformAdminDashboard },
    { label: "Schools", icon: "school-outline", screen: RootStackScreenNames.PlatformSchools },
    { label: "Add school", icon: "plus-circle-outline", screen: RootStackScreenNames.PlatformAdminCreateSchool },
  ],
  ADMIN: [
    { label: "Dashboard", icon: "view-dashboard-outline", screen: RootStackScreenNames.AdminDashboard },
    { label: "Students", icon: "school", screen: CommonScreens.students },
    { label: "Teachers", icon: "human-male-board", screen: CommonScreens.teachers },
    { label: "Parents", icon: "account-group-outline", screen: CommonScreens.parents },
    { label: "Classes", icon: "google-classroom", screen: CommonScreens.classes },
    { label: "Finance", icon: "cash-multiple", screen: CommonScreens.finance },
  ],
  PRINCIPAL: [
    { label: "Dashboard", icon: "view-dashboard-outline", screen: RootStackScreenNames.PrincipalDashboard },
    { label: "Students", icon: "school", screen: CommonScreens.students },
    { label: "Teachers", icon: "human-male-board", screen: CommonScreens.teachers },
    { label: "Parents", icon: "account-group-outline", screen: CommonScreens.parents },
    { label: "Classes", icon: "google-classroom", screen: CommonScreens.classes },
    { label: "Finance", icon: "cash-multiple", screen: CommonScreens.finance },
  ],
  TEACHER: [
    { label: "Dashboard", icon: "view-dashboard-outline", screen: RootStackScreenNames.TeacherDashboard },
    { label: "My classes", icon: "google-classroom", screen: RootStackScreenNames.TeacherMyClasses },
    { label: "Students", icon: "school", screen: RootStackScreenNames.TeacherMyStudents },
    { label: "Attendance", icon: "calendar-check-outline", screen: RootStackScreenNames.TeacherAttendance },
    { label: "Timetable", icon: "calendar-clock-outline", screen: RootStackScreenNames.TeacherTimetable },
    { label: "Leave", icon: "calendar-minus-outline", screen: RootStackScreenNames.TeacherLeave },
  ],
  PARENT: [
    { label: "Dashboard", icon: "view-dashboard-outline", screen: RootStackScreenNames.ParentDashboard },
  ],
};

const roleLabels: Record<string, string> = {
  ADMIN: "School Administrator",
  PRINCIPAL: "Principal Administration",
  TEACHER: "Teacher Portal",
  PARENT: "Parent Portal",
  PLATFORM_ADMIN: "Platform Administration",
};

const getInitials = (name?: string | null) =>
  name?.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "U";

type ModuleNavigationBarProps = {
  activeRoute?: string;
  navigationRef: NavigationContainerRef<RootStackParamList>;
};

export const ModuleNavigationBar = ({ activeRoute, navigationRef }: ModuleNavigationBarProps) => {
  const { width } = useWindowDimensions();
  const isCompact = width < 760;
  const user = useUserStore((state) => state.user);
  const logout = useUserStore((state) => state.logout);
  const [profileVisible, setProfileVisible] = React.useState(false);
  const [menuVisible, setMenuVisible] = React.useState(false);
  const role = user?.role ?? "";
  const items = roleItems[role] ?? [];
  const visibleItems = isCompact ? items.slice(0,1) : items;
  const hiddenItems =  [];
  const initials = getInitials(user?.name);

  if (!items.length || activeRoute === RootStackScreenNames.Login || activeRoute === RootStackScreenNames.SplashScreen || activeRoute === RootStackScreenNames.Home) return null;

  const navigateTo = (screen: RootStackScreenNames) => {
    setMenuVisible(false);
    if (activeRoute !== screen && navigationRef.isReady()) navigationRef.navigate(screen as never);
  };

  const handleLogout = () => {
    setProfileVisible(false);
    logout();
    navigationRef.resetRoot({ index: 0, routes: [{ name: RootStackScreenNames.Login }] });
  };

  return (
    <View style={[styles.wrapper, isCompact && styles.mobileWrapper]}>
      <View style={styles.bar}>
        <View style={styles.brand}>
          <Avatar.Icon size={36} icon="school" color="#FFFFFF" style={styles.brandIcon} />
          {!isCompact && (
            <View style={styles.brandText}>
              <Text style={styles.brandTitle} numberOfLines={1}>{user?.schoolName || "School Platform"}</Text>
              <Text style={styles.brandSubtitle} numberOfLines={1}>{roleLabels[role] || "School Workspace"}</Text>
            </View>
          )}
        </View>

        <View style={styles.links}>
          {visibleItems.map((item) => {
            const active = activeRoute === item.screen;
            return (
              <TouchableRipple
                key={item.screen}
                borderless
                onPress={() => navigateTo(item.screen)}
                style={[styles.link, active && styles.linkActive]}
              >
                <View style={styles.linkContent}>
                  <IconButton icon={item.icon} size={18} iconColor={active ? Colors.brandPrimary : Colors.subtext} style={styles.linkIcon} />
                  {!isCompact && <Text style={[styles.linkLabel, active && styles.linkLabelActive]}>{item.label}</Text>}
                </View>
              </TouchableRipple>
            );
          })}
          {/* {isCompact && hiddenItems.length > 0 && (
            <TouchableRipple borderless onPress={() => setMenuVisible(true)} style={[styles.link, styles.moreLink]}>
              <View style={styles.linkContent}>
                <IconButton icon="dots-horizontal" size={20} iconColor={Colors.subtext} style={styles.linkIcon} />
                <Text style={styles.linkLabel}>More</Text>
              </View>
            </TouchableRipple>
          )} */}
        </View>

        <TouchableRipple borderless onPress={() => setProfileVisible(true)} style={[styles.profileButton, profileVisible && styles.profileButtonActive]}>
          <View style={styles.profileContent}>
            <Avatar.Text size={34} label={initials} color="#FFFFFF" style={styles.profileAvatar} />
            {!isCompact && <Text style={styles.profileName} numberOfLines={1}>{user?.name || "Account"}</Text>}
            <IconButton icon="chevron-down" size={18} iconColor={Colors.subtext} style={styles.profileChevron} />
          </View>
        </TouchableRipple>
      </View>

      {/* <Modal visible={menuVisible} transparent animationType="fade" onRequestClose={() => setMenuVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setMenuVisible(false)}>
          <View style={styles.menu}>
            <Text style={styles.menuTitle}>Navigate to</Text>
            {hiddenItems.map((item) => (
              <TouchableOpacity key={item.screen} style={styles.menuItem} onPress={() => navigateTo(item.screen)}>
                <IconButton icon={item.icon} size={20} iconColor={Colors.brandPrimary} style={styles.menuIcon} />
                <Text style={styles.menuLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal> */}

      <Modal visible={profileVisible} transparent animationType="fade" onRequestClose={() => setProfileVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setProfileVisible(false)}>
          <View style={[styles.profileMenu, isCompact ? styles.profileMenuCompact : styles.profileMenuWide]}>
            <View style={styles.profileHeader}>
              <Avatar.Text size={46} label={initials} color="#FFFFFF" style={styles.profileAvatar} />
              <View style={styles.profileInfo}>
                <Text style={styles.profileMenuName} numberOfLines={1}>{user?.name || "Account"}</Text>
                <Text style={styles.profileEmail} numberOfLines={1}>{user?.email || ""}</Text>
                <Text style={styles.profileRole}>{roleLabels[role] || role}</Text>
              </View>
            </View>
            <Divider />
            <TouchableOpacity
  style={styles.profileAction}
  onPress={() => {
    setProfileVisible(false);

    if (navigationRef.isReady()) {
      navigationRef.navigate(
        RootStackScreenNames.ProfileScreen
      );
    }
  }}
>
  <IconButton
    icon="account-outline"
    size={20}
    iconColor={Colors.brandPrimary}
    style={styles.actionIcon}
  />

  <View>
    <Text style={styles.actionTitle}>
      Profile
    </Text>

    <Text style={styles.actionSubtitle}>
      Account details
    </Text>
  </View>
</TouchableOpacity>
            <TouchableOpacity style={[styles.profileAction, styles.logoutAction]} onPress={handleLogout}>
              <IconButton icon="logout" size={20} iconColor={Colors.error} style={styles.actionIcon} />
              <View><Text style={[styles.actionTitle, styles.logoutTitle]}>Logout</Text><Text style={styles.actionSubtitle}>Sign out of this account</Text></View>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { backgroundColor: "#FFFFFF", borderBottomWidth: 1, borderBottomColor: "#E8E8EE" },
  mobileWrapper: { backgroundColor: "#FFFFFF", borderBottomWidth: 1, borderBottomColor: "#E8E8EE", paddingHorizontal: Metrics.x2 ,paddingTop: 40},
  bar: { minHeight: 64, flexDirection: "row", alignItems: "center", paddingHorizontal: Metrics.x2, gap: Metrics.x2 },
  brand: { flexDirection: "row", alignItems: "center", minWidth: 0, flexShrink: 1 },
  brandIcon: { backgroundColor: Colors.brandPrimary },
  brandText: { marginLeft: Metrics.x1, maxWidth: 190 },
  brandTitle: { fontSize: 13, fontWeight: "800", color: Colors.text },
  brandSubtitle: { marginTop: 2, fontSize: 10, color: Colors.subtext },
  links: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 3, minWidth: 0 },
  link: { minHeight: 42, borderRadius: 10, paddingHorizontal: Metrics.x1 },
  linkActive: { backgroundColor: Colors.brandPrimaryBg },
  linkContent: { flexDirection: "row", alignItems: "center" },
  linkIcon: { margin: 0 },
  linkLabel: { marginRight: Metrics.x1, fontSize: 12, fontWeight: "700", color: Colors.subtext },
  linkLabelActive: { color: Colors.brandPrimary },
  moreLink: { backgroundColor: Colors.surface },
  profileButton: { borderRadius: 12, padding: 3, flexShrink: 0 },
  profileButtonActive: { backgroundColor: Colors.brandPrimaryBg },
  profileContent: { flexDirection: "row", alignItems: "center" },
  profileAvatar: { backgroundColor: Colors.brandPrimary },
  profileName: { maxWidth: 110, marginLeft: Metrics.x1, fontSize: 12, fontWeight: "700", color: Colors.text },
  profileChevron: { margin: 0 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.18)" },
  menu: { position: "absolute", top: 70, right: Metrics.x2, width: 230, paddingVertical: Metrics.x1, backgroundColor: "#FFFFFF", borderRadius: 14, elevation: 8, shadowColor: "#000", shadowOpacity: 0.16, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } },
  menuTitle: { paddingHorizontal: Metrics.x3, paddingVertical: Metrics.x2, fontSize: 12, fontWeight: "800", color: Colors.subtext, textTransform: "uppercase" },
  menuItem: { flexDirection: "row", alignItems: "center", paddingHorizontal: Metrics.x2, paddingVertical: Metrics.x1 },
  menuIcon: { margin: 0, marginRight: Metrics.x1 },
  menuLabel: { fontSize: 14, fontWeight: "700", color: Colors.text },
  profileMenu: { position: "absolute", top: 70, right: Metrics.x2, backgroundColor: "#FFFFFF", borderRadius: 14, paddingVertical: Metrics.x2, elevation: 8, shadowColor: "#000", shadowOpacity: 0.16, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } },
  profileMenuWide: { width: 310 },
  profileMenuCompact: { left: Metrics.x2, right: Metrics.x2 },
  profileHeader: { flexDirection: "row", alignItems: "center", paddingHorizontal: Metrics.x3, paddingVertical: Metrics.x2 },
  profileInfo: { flex: 1, marginLeft: Metrics.x2 },
  profileMenuName: { fontSize: 14, fontWeight: "800", color: Colors.text },
  profileEmail: { marginTop: 2, fontSize: 12, color: Colors.subtext },
  profileRole: { marginTop: 3, fontSize: 11, fontWeight: "700", color: Colors.brandPrimary },
  profileAction: { flexDirection: "row", alignItems: "center", paddingHorizontal: Metrics.x2, paddingVertical: Metrics.x2 },
  actionIcon: { margin: 0, marginRight: Metrics.x1 },
  actionTitle: { fontSize: 14, fontWeight: "700", color: Colors.text },
  actionSubtitle: { marginTop: 2, fontSize: 11, color: Colors.subtext },
  logoutAction: { marginTop: Metrics.x1 },
  logoutTitle: { color: Colors.error },
});
