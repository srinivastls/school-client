import React, {
  useMemo,
  useState,
} from "react";

import {
  FlatList,
  RefreshControl,
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
} from "../../theme";

import styles from "../../styles/platformSchools.styles";

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

export {
  PlatformSchoolsScreen,
};
