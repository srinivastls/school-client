import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import {
  ActivityIndicator,
  Avatar,
  Button,
  Card,
  Divider,
  IconButton,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";

import {
  Profile,
  userServices,
} from "../services/authServices";

// ============================================================
// TYPES
// ============================================================

type ProfileScreenProps = {
  navigation: any;
};

// ============================================================
// SCREEN
// ============================================================

const ProfileScreen = ({
  navigation,
}: ProfileScreenProps) => {
  const theme = useTheme();

  const [profile, setProfile] =
    useState<Profile | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [editing, setEditing] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [name, setName] =
    useState("");

  const [phone, setPhone] =
    useState("");

  // ==========================================================
  // LOAD PROFILE
  // ==========================================================

  const loadProfile = useCallback(
    async () => {
      try {
        setLoading(true);

        const response =
          await userServices.getProfile();

        const userProfile =
          response.profile;

        setProfile(userProfile);

        setName(userProfile.name);

        setPhone(
          userProfile.phone || ""
        );
      } catch (error: any) {
        console.error(
          "Failed to load profile:",
          error
        );

        Alert.alert(
          "Unable to load",
          error?.response?.data?.message ||
            "Unable to load your profile."
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // ==========================================================
  // REFRESH PROFILE
  // ==========================================================

  const onRefresh = async () => {
    try {
      setRefreshing(true);

      const response =
        await userServices.getProfile();

      const userProfile =
        response.profile;

      setProfile(userProfile);

      if (!editing) {
        setName(userProfile.name);

        setPhone(
          userProfile.phone || ""
        );
      }
    } catch (error: any) {
      console.error(
        "Failed to refresh profile:",
        error
      );

      Alert.alert(
        "Refresh failed",
        error?.response?.data?.message ||
          "Unable to refresh your profile."
      );
    } finally {
      setRefreshing(false);
    }
  };

  // ==========================================================
  // START EDITING
  // ==========================================================

  const startEditing = () => {
    if (!profile) return;

    setName(profile.name);

    setPhone(
      profile.phone || ""
    );

    setEditing(true);
  };

  // ==========================================================
  // CANCEL EDITING
  // ==========================================================

  const cancelEditing = () => {
    if (!profile) return;

    setName(profile.name);

    setPhone(
      profile.phone || ""
    );

    setEditing(false);
  };

  // ==========================================================
  // SAVE PROFILE
  // ==========================================================

  const saveProfile = async () => {
    if (!name.trim()) {
      Alert.alert(
        "Name required",
        "Please enter your name."
      );

      return;
    }

    try {
      setSaving(true);

      const response =
        await userServices.updateProfile({
          name: name.trim(),
          phone: phone.trim() || null,
        });

      const updatedProfile =
        response.profile;

      setProfile(updatedProfile);

      setName(updatedProfile.name);

      setPhone(
        updatedProfile.phone || ""
      );

      setEditing(false);

      Alert.alert(
        "Profile updated",
        "Your profile has been updated successfully."
      );
    } catch (error: any) {
      console.error(
        "Failed to update profile:",
        error
      );

      Alert.alert(
        "Update failed",
        error?.response?.data?.message ||
          "Unable to update your profile."
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================================
  // LOADING STATE
  // ==========================================================

  if (loading && !profile) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
        />

        <Text style={styles.loadingText}>
          Loading profile...
        </Text>
      </View>
    );
  }

  // ==========================================================
  // ERROR STATE
  // ==========================================================

  if (!profile) {
    return (
      <View style={styles.center}>
        <Avatar.Icon
          size={64}
          icon="account-alert"
        />

        <Text
          variant="titleMedium"
          style={styles.errorTitle}
        >
          Profile unavailable
        </Text>

        <Button
          mode="contained"
          onPress={loadProfile}
          style={styles.retryButton}
        >
          Retry
        </Button>
      </View>
    );
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor:
            theme.colors.background,
        },
      ]}
    >
      {/* ================================================== */}
      {/* HEADER */}
      {/* ================================================== */}

      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          onPress={() => navigation.goBack()}
        />

        <Text
          variant="titleLarge"
          style={styles.headerTitle}
        >
          My Profile
        </Text>

        {!editing && (
          <IconButton
            icon="pencil"
            onPress={startEditing}
          />
        )}
      </View>

      {/* ================================================== */}
      {/* SCROLL VIEW */}
      {/* ================================================== */}

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
        contentContainerStyle={
          styles.content
        }
      >
        {/* ================================================== */}
        {/* PROFILE HERO */}
        {/* ================================================== */}

        <Card style={styles.heroCard}>
          <Card.Content>
            <View style={styles.hero}>
              {profile.profilePhotoUrl ? (
                <Image
                  source={{
                    uri: profile.profilePhotoUrl,
                  }}
                  style={styles.profileImage}
                />
              ) : (
                <Avatar.Text
                  size={94}
                  label={getInitials(
                    profile.name
                  )}
                />
              )}

              <Text
                variant="headlineSmall"
                style={styles.name}
              >
                {profile.name}
              </Text>

              <Text
                variant="bodyLarge"
                style={styles.designation}
              >
                {formatRole(profile.role)}
              </Text>

              {profile.designation && (
                <Text
                  variant="bodyMedium"
                  style={styles.department}
                >
                  {profile.designation}
                </Text>
              )}

              {profile.department && (
                <Text
                  variant="bodyMedium"
                  style={styles.department}
                >
                  {profile.department}
                </Text>
              )}

              <View
                style={[
                  styles.activeBadge,
                  {
                    backgroundColor:
                      profile.isActive
                        ? "#E8F5E9"
                        : "#FFEBEE",
                  },
                ]}
              >
                <View
                  style={[
                    styles.activeDot,
                    {
                      backgroundColor:
                        profile.isActive
                          ? "#2E7D32"
                          : "#C62828",
                    },
                  ]}
                />

                <Text
                  variant="labelMedium"
                  style={{
                    color: profile.isActive
                      ? "#2E7D32"
                      : "#C62828",
                  }}
                >
                  {profile.isActive
                    ? "Active"
                    : "Inactive"}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* ================================================== */}
        {/* PERSONAL INFORMATION */}
        {/* ================================================== */}

        <Card style={styles.card}>
          <Card.Content>
            <SectionHeader
              icon="account-edit"
              title="Personal Information"
            />

            <Divider
              style={styles.divider}
            />

            {editing ? (
              <>
                <TextInput
                  mode="outlined"
                  label="Full Name"
                  value={name}
                  onChangeText={setName}
                  style={styles.input}
                />

                <TextInput
                  mode="outlined"
                  label="Phone Number"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  style={styles.input}
                />
              </>
            ) : (
              <>
                <InfoRow
                  label="Full Name"
                  value={profile.name}
                  icon="account"
                />

                <InfoRow
                  label="Phone"
                  value={
                    profile.phone ||
                    "Not provided"
                  }
                  icon="phone"
                />
              </>
            )}
          </Card.Content>
        </Card>

        {/* ================================================== */}
        {/* ACCOUNT INFORMATION */}
        {/* ================================================== */}

        <Card style={styles.card}>
          <Card.Content>
            <SectionHeader
              icon="shield-account"
              title="Account Information"
            />

            <Divider
              style={styles.divider}
            />

            <InfoRow
              label="Email"
              value={profile.email}
              icon="email"
            />

            <InfoRow
              label="Role"
              value={formatRole(profile.role)}
              icon="account-badge"
            />

            <InfoRow
              label="User ID"
              value={profile.id}
              icon="identifier"
            />

            <InfoRow
              label="School ID"
              value={profile.schoolId}
              icon="school"
            />
          </Card.Content>
        </Card>

        {/* ================================================== */}
        {/* PROFESSIONAL INFORMATION */}
        {/* ================================================== */}

        {(profile.designation ||
          profile.department ||
          profile.employeeId) && (
          <Card style={styles.card}>
            <Card.Content>
              <SectionHeader
                icon="briefcase-account"
                title="Professional Information"
              />

              <Divider
                style={styles.divider}
              />

              {profile.designation && (
                <InfoRow
                  label="Designation"
                  value={profile.designation}
                  icon="account-tie"
                />
              )}

              {profile.department && (
                <InfoRow
                  label="Department"
                  value={profile.department}
                  icon="domain"
                />
              )}

              {profile.employeeId && (
                <InfoRow
                  label="Employee ID"
                  value={profile.employeeId}
                  icon="card-account-details"
                />
              )}
            </Card.Content>
          </Card>
        )}

        {/* ================================================== */}
        {/* ACCOUNT STATUS */}
        {/* ================================================== */}

        <Card style={styles.card}>
          <Card.Content>
            <SectionHeader
              icon="information"
              title="Account Status"
            />

            <Divider
              style={styles.divider}
            />

            <InfoRow
              label="Status"
              value={
                profile.isActive
                  ? "Active"
                  : "Inactive"
              }
              icon={
                profile.isActive
                  ? "check-circle"
                  : "close-circle"
              }
            />

            <InfoRow
              label="Last Login"
              value={
                profile.lastLogin
                  ? formatDateTime(
                      profile.lastLogin
                    )
                  : "Not available"
              }
              icon="login"
            />

            <InfoRow
              label="Member Since"
              value={formatDateTime(
                profile.createdAt
              )}
              icon="calendar-account"
            />

            <InfoRow
              label="Last Updated"
              value={formatDateTime(
                profile.updatedAt
              )}
              icon="update"
            />

            <InfoRow
              label="Password Change Required"
              value={
                profile.mustChangePassword
                  ? "Yes"
                  : "No"
              }
              icon="lock"
            />
          </Card.Content>
        </Card>

        {/* ================================================== */}
        {/* EDIT ACTIONS */}
        {/* ================================================== */}

        {editing && (
          <View style={styles.actions}>
            <Button
              mode="outlined"
              onPress={cancelEditing}
              disabled={saving}
              style={styles.actionButton}
            >
              Cancel
            </Button>

            <Button
              mode="contained"
              onPress={saveProfile}
              loading={saving}
              disabled={saving}
              style={styles.actionButton}
            >
              Save Changes
            </Button>
          </View>
        )}

        <View style={styles.bottomSpace} />
      </ScrollView>
    </View>
  );
};

// ============================================================
// SECTION HEADER
// ============================================================

const SectionHeader = ({
  icon,
  title,
}: {
  icon: string;
  title: string;
}) => {
  return (
    <View style={styles.sectionHeader}>
      <Avatar.Icon
        size={38}
        icon={icon}
      />

      <Text
        variant="titleMedium"
        style={styles.sectionTitle}
      >
        {title}
      </Text>
    </View>
  );
};

// ============================================================
// INFO ROW
// ============================================================

const InfoRow = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: string;
}) => {
  return (
    <View style={styles.infoRow}>
      <Avatar.Icon
        size={36}
        icon={icon}
      />

      <View style={styles.infoContent}>
        <Text
          variant="bodySmall"
          style={styles.infoLabel}
        >
          {label}
        </Text>

        <Text
          variant="bodyLarge"
          style={styles.infoValue}
        >
          {value}
        </Text>
      </View>
    </View>
  );
};

// ============================================================
// GET INITIALS
// ============================================================

const getInitials = (
  name: string
) => {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!parts.length) {
    return "U";
  }

  if (parts.length === 1) {
    return parts[0]
      .substring(0, 2)
      .toUpperCase();
  }

  return (
    parts[0][0] +
    parts[parts.length - 1][0]
  ).toUpperCase();
};

// ============================================================
// FORMAT ROLE
// ============================================================

const formatRole = (
  role: string
) => {
  if (!role) return "User";

  return role
    .toLowerCase()
    .split(/[_\s-]+/)
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1)
    )
    .join(" ");
};

// ============================================================
// FORMAT DATE
// ============================================================

const formatDateTime = (
  value: string
) => {
  const date = new Date(value);

  if (isNaN(date.getTime())) {
    return "Not available";
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};

// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },

  loadingText: {
    marginTop: 12,
  },

  errorTitle: {
    marginTop: 14,
    fontWeight: "700",
  },

  retryButton: {
    marginTop: 16,
  },

  header: {
    height: 62,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
  },

  headerTitle: {
    flex: 1,
    fontWeight: "700",
  },

  content: {
    paddingHorizontal: 14,
    paddingBottom: 30,
  },

  heroCard: {
    borderRadius: 20,
    marginBottom: 14,
  },

  hero: {
    alignItems: "center",
    paddingVertical: 12,
  },

  profileImage: {
    width: 94,
    height: 94,
    borderRadius: 47,
  },

  name: {
    fontWeight: "800",
    marginTop: 12,
    textAlign: "center",
  },

  designation: {
    marginTop: 4,
    textAlign: "center",
  },

  department: {
    marginTop: 2,
    textAlign: "center",
  },

  activeBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 6,
  },

  activeDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },

  card: {
    borderRadius: 16,
    marginBottom: 12,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  sectionTitle: {
    fontWeight: "700",
  },

  divider: {
    marginVertical: 14,
  },

  input: {
    marginBottom: 12,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  infoContent: {
    flex: 1,
    marginLeft: 10,
  },

  infoLabel: {
    opacity: 0.65,
  },

  infoValue: {
    marginTop: 2,
  },

  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },

  actionButton: {
    flex: 1,
    borderRadius: 10,
  },

  bottomSpace: {
    height: 20,
  },
});

export default ProfileScreen;