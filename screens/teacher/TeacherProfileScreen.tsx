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
  teacherServices,
  TeacherProfile,
} from "../../services/teacherServices";

const TeacherProfileScreen = ({
  navigation,
}: any) => {
  const theme = useTheme();

  const [profile, setProfile] =
    useState<TeacherProfile | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [editing, setEditing] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const loadProfile = useCallback(
    async () => {
      try {
        setLoading(true);

        const response =
          await teacherServices.getMyProfile();

        setProfile(response.teacher);

        setName(response.teacher.name);
        setPhone(
          response.teacher.phone || ""
        );
      } catch (error: any) {
        console.error(
          "Failed to load teacher profile:",
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

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const onRefresh = async () => {
    try {
      setRefreshing(true);

      const response =
        await teacherServices.getMyProfile();

      setProfile(response.teacher);

      if (!editing) {
        setName(response.teacher.name);
        setPhone(
          response.teacher.phone || ""
        );
      }
    } finally {
      setRefreshing(false);
    }
  };

  const startEditing = () => {
    if (!profile) return;

    setName(profile.name);
    setPhone(profile.phone || "");
    setEditing(true);
  };

  const cancelEditing = () => {
    if (!profile) return;

    setName(profile.name);
    setPhone(profile.phone || "");
    setEditing(false);
  };

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
        await teacherServices.updateMyProfile({
          name: name.trim(),
          phone: phone.trim() || null,
        });

      setProfile(response.teacher);

      setName(response.teacher.name);
      setPhone(
        response.teacher.phone || ""
      );

      setEditing(false);

      Alert.alert(
        "Profile updated",
        "Your profile has been updated successfully."
      );
    } catch (error: any) {
      console.error(
        "Failed to update teacher profile:",
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

  if (loading && !profile) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />

        <Text style={styles.loadingText}>
          Loading profile...
        </Text>
      </View>
    );
  }

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
      {/* Header */}
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
        {/* Profile Hero */}
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
                {profile.designation ||
                  "Teacher"}
              </Text>

              {profile.department && (
                <Text
                  variant="bodyMedium"
                  style={styles.department}
                >
                  {profile.department}
                </Text>
              )}

              <View
                style={styles.activeBadge}
              >
                <View
                  style={styles.activeDot}
                />

                <Text variant="labelMedium">
                  {profile.isActive
                    ? "Active"
                    : "Inactive"}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Editable information */}
        <Card style={styles.card}>
          <Card.Content>
            <View
              style={styles.sectionHeader}
            >
              <Avatar.Icon
                size={38}
                icon="account-edit"
              />

              <Text
                variant="titleMedium"
                style={styles.sectionTitle}
              >
                Personal Information
              </Text>
            </View>

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

        {/* Account information */}
        <Card style={styles.card}>
          <Card.Content>
            <View
              style={styles.sectionHeader}
            >
              <Avatar.Icon
                size={38}
                icon="shield-account"
              />

              <Text
                variant="titleMedium"
                style={styles.sectionTitle}
              >
                Account Information
              </Text>
            </View>

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
              value={profile.role}
              icon="account-badge"
            />

            <InfoRow
              label="Employee ID"
              value={
                profile.employeeId ||
                "Not assigned"
              }
              icon="badge-account"
            />
          </Card.Content>
        </Card>

        {/* Employment */}
        <Card style={styles.card}>
          <Card.Content>
            <View
              style={styles.sectionHeader}
            >
              <Avatar.Icon
                size={38}
                icon="briefcase-account"
              />

              <Text
                variant="titleMedium"
                style={styles.sectionTitle}
              >
                Employment Information
              </Text>
            </View>

            <Divider
              style={styles.divider}
            />

            <InfoRow
              label="Designation"
              value={
                profile.designation ||
                "Not assigned"
              }
              icon="account-tie"
            />

            <InfoRow
              label="Department"
              value={
                profile.department ||
                "Not assigned"
              }
              icon="domain"
            />

            <InfoRow
              label="Employee ID"
              value={
                profile.employeeId ||
                "Not assigned"
              }
              icon="card-account-details"
            />
          </Card.Content>
        </Card>

        {/* Account status */}
        <Card style={styles.card}>
          <Card.Content>
            <View
              style={styles.sectionHeader}
            >
              <Avatar.Icon
                size={38}
                icon="information"
              />

              <Text
                variant="titleMedium"
                style={styles.sectionTitle}
              >
                Account Status
              </Text>
            </View>

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
          </Card.Content>
        </Card>

        {/* Edit actions */}
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

/* -------------------------------------------------- */

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

const getInitials = (name: string) => {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!parts.length) {
    return "T";
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

const formatDateTime = (
  value: string
) => {
  const date = new Date(value);

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};

/* -------------------------------------------------- */

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

export default TeacherProfileScreen;