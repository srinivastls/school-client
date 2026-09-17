import React, {
  useMemo,
  useState,
} from "react";

import {
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";

import {
  Avatar,
  Button,
  Card,
  Chip,
  Divider,
  Searchbar,
  Snackbar,
  Text,
  TouchableRipple,
} from "react-native-paper";

import {
  useQuery,
} from "react-query";

import type {
  NativeStackScreenProps,
} from "@react-navigation/native-stack";

import {
  Page,
} from "../../components";

import {
  platformAdminServices,
} from "../../services/platformAdminServices";

import {
  Colors,
  Metrics,
} from "../../theme";

import {
  RootStackParamList,
  RootStackScreenNames,
} from "../../types";

type Principal = {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
};

type PlatformSchool = {
  id: string;
  code: string;
  name: string;
  board?: string | null;
  status: string;
  subscriptionPlan: string;
  principal?: Principal | null;
  counts: {
    students: number;
    staff: number;
    admins: number;
    teachers: number;
    parents: number;
  };
};

type PlatformSchoolsResponse = {
  schools: PlatformSchool[];
};

type Props =
  NativeStackScreenProps<
    RootStackParamList,
    RootStackScreenNames.PlatformSchools
  >;

const getStatusColors = (
  status: string
) => {
  switch (status.toUpperCase()) {
    case "ACTIVE":
      return {
        background: Colors.successBg,
        text: "#176B38",
      };

    case "ONBOARDING":
      return {
        background: Colors.warningBg,
        text: "#8A5A00",
      };

    case "SUSPENDED":
    case "EXPIRED":
      return {
        background: Colors.errorBg,
        text: Colors.error,
      };

    default:
      return {
        background: Colors.backgroundDisabled,
        text: Colors.subtext,
      };
  }
};

const PlatformSchoolsScreen = ({
  navigation,
}: Props) => {
  const [
    searchQuery,
    setSearchQuery,
  ] = useState("");

  const [
    snackbarVisible,
    setSnackbarVisible,
  ] = useState(false);

  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery<PlatformSchoolsResponse>(
    ["platform-schools"],
    platformAdminServices.getSchools,
    {
      retry: false,
      onError: () =>
        setSnackbarVisible(true),
    }
  );

  const schools =
    data?.schools ?? [];

  const filteredSchools =
    useMemo(() => {
      const query =
        searchQuery
          .trim()
          .toLowerCase();

      if (!query) {
        return schools;
      }

      return schools.filter(
        (school) =>
          school.name
            .toLowerCase()
            .includes(query) ||
          school.code
            .toLowerCase()
            .includes(query) ||
          school.principal
            ?.name
            ?.toLowerCase()
            .includes(query)
      );
    }, [
      schools,
      searchQuery,
    ]);

  const totalStudents =
    schools.reduce(
      (total, school) =>
        total + school.counts.students,
      0
    );

  const activeSchools =
    schools.filter(
      (school) =>
        school.status.toUpperCase() ===
        "ACTIVE"
    ).length;

  const renderSchool = ({
    item,
  }: {
    item: PlatformSchool;
  }) => {
    const status =
      getStatusColors(item.status);

    return (
      <TouchableRipple
        borderless
        onPress={() =>
          navigation.navigate(
            RootStackScreenNames.PlatformAdminSchoolDetails,
            {
              schoolId: item.id,
            }
          )
        }
        style={styles.cardTouchable}
      >
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Avatar.Icon
                icon="school-outline"
                size={44}
                style={styles.schoolIcon}
              />

              <View style={styles.schoolIdentity}>
                <Text
                  numberOfLines={1}
                  style={styles.schoolName}
                >
                  {item.name}
                </Text>

                <Text style={styles.schoolCode}>
                  {item.code}
                </Text>
              </View>

              <Chip
                compact
                style={{
                  backgroundColor:
                    status.background,
                }}
                textStyle={{
                  color: status.text,
                  fontSize: 11,
                  fontWeight: "800",
                }}
              >
                {item.status}
              </Chip>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.metrics}>
              <Metric
                label="Students"
                value={item.counts.students}
              />
              <Metric
                label="Teachers"
                value={item.counts.teachers}
              />
              <Metric
                label="Admins"
                value={item.counts.admins}
              />
            </View>

            <Divider style={styles.divider} />

            <View style={styles.footer}>
              <View style={styles.principal}>
                <Avatar.Icon
                  icon="account-tie-outline"
                  size={28}
                  style={styles.principalIcon}
                />
                <View style={styles.principalText}>
                  <Text style={styles.principalLabel}>
                    Principal
                  </Text>
                  <Text
                    numberOfLines={1}
                    style={styles.principalName}
                  >
                    {item.principal?.name ??
                      "Not assigned"}
                  </Text>
                </View>
              </View>

              <Text style={styles.openLabel}>
                Open ›
              </Text>
            </View>
          </Card.Content>
        </Card>
      </TouchableRipple>
    );
  };

  return (
    <Page style={styles.page}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>
            Schools
          </Text>

          <Text style={styles.subtitle}>
            Manage subscriptions, people, and
            school operations.
          </Text>
        </View>

    
      </View>

      <View style={styles.summaryRow}>
        <SummaryCard
          label="Total schools"
          value={schools.length}
          icon="school-outline"
        />
        <SummaryCard
          label="Active schools"
          value={activeSchools}
          icon="check-circle-outline"
        />
        <SummaryCard
          label="Students"
          value={totalStudents}
          icon="account-group-outline"
        />
      </View>

      <Searchbar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search by school, code, or principal"
        style={styles.search}
        inputStyle={styles.searchInput}
      />

      <FlatList
        data={filteredSchools}
        keyExtractor={(item) => item.id}
        renderItem={renderSchool}
        refreshing={isFetching}
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={refetch}
          />
        }
        contentContainerStyle={
          styles.list
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          isLoading
            ? null
            : (
              <View style={styles.empty}>
                <Avatar.Icon
                  icon="school-outline"
                  size={52}
                  style={styles.emptyIcon}
                />
                <Text style={styles.emptyTitle}>
                  No schools found
                </Text>
                <Text style={styles.emptyText}>
                  Create a school or adjust your
                  search to continue.
                </Text>
              </View>
            )
        }
      />

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() =>
          setSnackbarVisible(false)
        }
        action={{
          label: "Retry",
          onPress: () => refetch(),
        }}
        style={styles.snackbar}
      >
        {
          // @ts-ignore
          error?.response?.data?.message ??
            "Unable to load schools."
        }
      </Snackbar>
    </Page>
  );
};

const Metric = ({
  label,
  value,
}: {
  label: string;
  value: number;
}) => (
  <View style={styles.metric}>
    <Text style={styles.metricValue}>
      {value}
    </Text>
    <Text style={styles.metricLabel}>
      {label}
    </Text>
  </View>
);

const SummaryCard = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: string;
}) => (
  <Card style={styles.summaryCard}>
    <Card.Content style={styles.summaryContent}>
      <Avatar.Icon
        icon={icon}
        size={34}
        style={styles.summaryIcon}
      />
      <View>
        <Text style={styles.summaryValue}>
          {value}
        </Text>
        <Text style={styles.summaryLabel}>
          {label}
        </Text>
      </View>
    </Card.Content>
  </Card>
);

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#F6F7FB",
    paddingHorizontal: Metrics.x4,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: Metrics.x4,
    marginBottom: Metrics.x4,
  },

  headerText: {
    flex: 1,
    marginRight: Metrics.x3,
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#171717",
  },

  subtitle: {
    marginTop: Metrics.x1,
    fontSize: 13,
    lineHeight: 19,
    color: Colors.subtext,
  },

  addButton: {
    borderRadius: 10,
  },

  addButtonContent: {
    minHeight: 44,
  },

  summaryRow: {
    flexDirection: "row",
    gap: Metrics.x2,
    marginBottom: Metrics.x3,
  },

  summaryCard: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8E8EE",
  },

  summaryContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Metrics.x2,
  },

  summaryIcon: {
    backgroundColor: Colors.brandPrimaryBg,
    marginRight: Metrics.x2,
  },

  summaryValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#171717",
  },

  summaryLabel: {
    marginTop: 1,
    fontSize: 10,
    fontWeight: "600",
    color: Colors.subtext,
  },

  search: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8E8EE",
    marginBottom: Metrics.x3,
  },

  searchInput: {
    fontSize: 13,
  },

  list: {
    paddingBottom: Metrics.x6,
  },

  cardTouchable: {
    borderRadius: 16,
    marginBottom: Metrics.x3,
  },

  card: {
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8E8EE",
    elevation: 1,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  schoolIcon: {
    backgroundColor: Colors.brandPrimary,
    marginRight: Metrics.x2,
  },

  schoolIdentity: {
    flex: 1,
    minWidth: 0,
    marginRight: Metrics.x2,
  },

  schoolName: {
    fontSize: 17,
    fontWeight: "800",
    color: "#171717",
  },

  schoolCode: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: "700",
    color: Colors.subtext,
    letterSpacing: 0.4,
  },

  divider: {
    marginVertical: Metrics.x3,
  },

  metrics: {
    flexDirection: "row",
  },

  metric: {
    flex: 1,
    alignItems: "center",
  },

  metricValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#171717",
  },

  metricLabel: {
    marginTop: 2,
    fontSize: 11,
    color: Colors.subtext,
  },

  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  principal: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    minWidth: 0,
  },

  principalIcon: {
    backgroundColor: "#F1F2F7",
    marginRight: Metrics.x2,
  },

  principalText: {
    flex: 1,
    minWidth: 0,
  },

  principalLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.subtext,
    textTransform: "uppercase",
  },

  principalName: {
    marginTop: 1,
    fontSize: 13,
    fontWeight: "700",
    color: "#26262B",
  },

  openLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: Colors.brandPrimary,
  },

  empty: {
    alignItems: "center",
    paddingTop: Metrics.x6,
    paddingHorizontal: Metrics.x5,
  },

  emptyIcon: {
    backgroundColor: Colors.brandPrimaryBg,
  },

  emptyTitle: {
    marginTop: Metrics.x3,
    fontSize: 18,
    fontWeight: "800",
    color: "#171717",
  },

  emptyText: {
    marginTop: Metrics.x1,
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
    color: Colors.subtext,
  },

  snackbar: {
    backgroundColor: "#B42318",
  },
});

export {
  PlatformSchoolsScreen,
};
