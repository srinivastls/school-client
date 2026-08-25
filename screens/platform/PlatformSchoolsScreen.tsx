import React, { useEffect, useState } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";
import {
  ActivityIndicator,
  Card,
  Chip,
  Divider,
  Snackbar,
  Text,
} from "react-native-paper";
import { useQuery } from "react-query";

import { Page } from "../../components";
import { api } from "../../services/client";
import {
  Colors,
  Metrics,
} from "../../theme";

type Principal = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  designation?: string | null;
  isActive: boolean;
  lastLogin?: string | null;
};

type SchoolCounts = {
  students: number;
  staff: number;
  admins: number;
  teachers: number;
  parents: number;
};

type PlatformSchool = {
  id: string;
  code: string;
  name: string;
  address?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  board?: string | null;
  status: string;
  subscriptionPlan: string;
  subscriptionStartDate?: string | null;
  subscriptionExpiryDate?: string | null;
  createdAt: string;
  principal: Principal | null;
  counts: SchoolCounts;
};

type PlatformSchoolsResponse = {
  schools: PlatformSchool[];
};

const getPlatformSchools = async () => {
  const { data } =
    await api.get<PlatformSchoolsResponse>(
      "/platform/schools"
    );

  return data;
};

const PlatformSchoolsScreen = () => {
  const [snackbarVisible, setSnackbarVisible] =
    useState(false);

  const [snackbarMessage, setSnackbarMessage] =
    useState("");

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery(
    ["platform-schools"],
    getPlatformSchools,
    {
      retry: false,
    }
  );

  useEffect(() => {
    if (isError) {
      setSnackbarMessage(
        // @ts-ignore
        error?.response?.data?.message ??
          "Unable to load schools."
      );

      setSnackbarVisible(true);
    }
  }, [isError, error]);

  const schools =
    data?.schools ?? [];

  const totalStudents =
    schools.reduce(
      (total, school) =>
        total + school.counts.students,
      0
    );

  const totalStaff =
    schools.reduce(
      (total, school) =>
        total + school.counts.staff,
      0
    );

  const renderSchool = ({
    item,
  }: {
    item: PlatformSchool;
  }) => {
    const isActive =
      item.status === "ACTIVE";

    return (
      <Card style={styles.card}>
        <Card.Content>
          {/* ============================================
              HEADER
          ============================================ */}

          <View style={styles.headerRow}>
            <View style={styles.schoolTitleContainer}>
              <Text style={styles.schoolName}>
                {item.name}
              </Text>

              <Text style={styles.schoolCode}>
                {item.code}
              </Text>
            </View>

            <Chip
              compact
              style={
                isActive
                  ? styles.activeChip
                  : styles.inactiveChip
              }
              textStyle={styles.chipText}
            >
              {item.status}
            </Chip>
          </View>

          <Divider
            style={styles.divider}
          />

          {/* ============================================
              COUNTS
          ============================================ */}

          <View style={styles.countRow}>
            <View style={styles.countBox}>
              <Text style={styles.countValue}>
                {item.counts.students}
              </Text>

              <Text style={styles.countLabel}>
                Students
              </Text>
            </View>

            <View style={styles.countBox}>
              <Text style={styles.countValue}>
                {item.counts.teachers}
              </Text>

              <Text style={styles.countLabel}>
                Teachers
              </Text>
            </View>

            <View style={styles.countBox}>
              <Text style={styles.countValue}>
                {item.counts.admins}
              </Text>

              <Text style={styles.countLabel}>
                Admins
              </Text>
            </View>

            <View style={styles.countBox}>
              <Text style={styles.countValue}>
                {item.counts.parents}
              </Text>

              <Text style={styles.countLabel}>
                Parents
              </Text>
            </View>
          </View>

          <Divider
            style={styles.divider}
          />

          {/* ============================================
              PRINCIPAL
          ============================================ */}

          <Text style={styles.sectionTitle}>
            Principal
          </Text>

          {item.principal ? (
            <View style={styles.principalBox}>
              <Text style={styles.principalName}>
                {item.principal.name}
              </Text>

              <Text style={styles.principalDetail}>
                {item.principal.email}
              </Text>

              {item.principal.phone ? (
                <Text
                  style={
                    styles.principalDetail
                  }
                >
                  {item.principal.phone}
                </Text>
              ) : null}

              {item.principal
                .designation ? (
                <Text
                  style={
                    styles.principalDetail
                  }
                >
                  {item.principal.designation}
                </Text>
              ) : null}
            </View>
          ) : (
            <Text style={styles.noPrincipal}>
              No principal assigned
            </Text>
          )}

          {/* ============================================
              SCHOOL DETAILS
          ============================================ */}

          <Divider
            style={styles.divider}
          />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>
              Subscription
            </Text>

            <Text style={styles.detailValue}>
              {item.subscriptionPlan}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>
              Total Staff
            </Text>

            <Text style={styles.detailValue}>
              {item.counts.staff}
            </Text>
          </View>

          {item.board ? (
            <View style={styles.detailRow}>
              <Text
                style={styles.detailLabel}
              >
                Board
              </Text>

              <Text
                style={styles.detailValue}
              >
                {item.board}
              </Text>
            </View>
          ) : null}
        </Card.Content>
      </Card>
    );
  };

  return (
    <Page style={styles.page}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>
          Schools
        </Text>

        <Text style={styles.subtitle}>
          Manage and monitor all schools
        </Text>
      </View>

      {/* ================================================
          SUMMARY
      ================================================ */}

      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>
            {schools.length}
          </Text>

          <Text style={styles.summaryLabel}>
            Schools
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>
            {totalStudents}
          </Text>

          <Text style={styles.summaryLabel}>
            Students
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>
            {totalStaff}
          </Text>

          <Text style={styles.summaryLabel}>
            Staff
          </Text>
        </View>
      </View>

      {/* ================================================
          LOADING
      ================================================ */}

      {isLoading ? (
        <View style={styles.loader}>
          <ActivityIndicator
            size="large"
            color={
              Colors.brandPrimary
            }
          />
        </View>
      ) : (
        <FlatList
          data={schools}
          renderItem={renderSchool}
          keyExtractor={(item) =>
            item.id
          }
          showsVerticalScrollIndicator={
            false
          }
          refreshControl={
            <RefreshControl
              refreshing={isFetching}
              onRefresh={refetch}
            />
          }
          contentContainerStyle={
            styles.list
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text
                style={styles.emptyTitle}
              >
                No schools found
              </Text>

              <Text
                style={styles.emptyText}
              >
                Schools created by the
                platform administrator will
                appear here.
              </Text>
            </View>
          }
        />
      )}

      {/* ================================================
          SNACKBAR
      ================================================ */}

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() =>
          setSnackbarVisible(false)
        }
        duration={3000}
        style={{
          backgroundColor:
            Colors.errorBg,
        }}
      >
        {snackbarMessage}
      </Snackbar>
    </Page>
  );
};

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },

  titleContainer: {
    marginBottom: Metrics.x4,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
  },

  subtitle: {
    fontSize: 15,
    color: Colors.subtext,
    marginTop: Metrics.x1,
  },

  summaryRow: {
    flexDirection: "row",
    marginBottom: Metrics.x4,
  },

  summaryCard: {
    flex: 1,
    paddingVertical: Metrics.x3,
    paddingHorizontal: Metrics.x2,
    marginRight: Metrics.x2,
    borderRadius: Metrics.x3,
    backgroundColor:
      Colors.brandPrimaryBg,
    alignItems: "center",
  },

  summaryValue: {
    fontSize: 22,
    fontWeight: "700",
  },

  summaryLabel: {
    fontSize: 12,
    color: Colors.subtext,
    marginTop: Metrics.x1,
  },

  list: {
    paddingBottom: Metrics.x5,
  },

  card: {
    marginBottom: Metrics.x3,
    borderRadius: Metrics.x3,
    backgroundColor:
      Colors.brandPrimaryBg,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent:
      "space-between",
  },

  schoolTitleContainer: {
    flex: 1,
    marginRight: Metrics.x2,
  },

  schoolName: {
    fontSize: 19,
    fontWeight: "700",
  },

  schoolCode: {
    fontSize: 13,
    color: Colors.subtext,
    marginTop: Metrics.x1,
  },

  activeChip: {
    backgroundColor:
      Colors.successBg,
  },

  inactiveChip: {
    backgroundColor:
      Colors.errorBg,
  },

  chipText: {
    fontSize: 11,
  },

  divider: {
    marginVertical: Metrics.x3,
  },

  countRow: {
    flexDirection: "row",
  },

  countBox: {
    flex: 1,
    alignItems: "center",
  },

  countValue: {
    fontSize: 18,
    fontWeight: "700",
  },

  countLabel: {
    fontSize: 11,
    color: Colors.subtext,
    marginTop: Metrics.x1,
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: Metrics.x2,
  },

  principalBox: {
    padding: Metrics.x3,
    borderRadius: Metrics.x2,
    backgroundColor:
      Colors.backgroundDisabled,
  },

  principalName: {
    fontSize: 16,
    fontWeight: "700",
  },

  principalDetail: {
    fontSize: 13,
    color: Colors.subtext,
    marginTop: Metrics.x1,
  },

  noPrincipal: {
    fontSize: 13,
    color: Colors.subtext,
  },

  detailRow: {
    flexDirection: "row",
    justifyContent:
      "space-between",
    marginBottom: Metrics.x2,
  },

  detailLabel: {
    fontSize: 13,
    color: Colors.subtext,
  },

  detailValue: {
    fontSize: 13,
    fontWeight: "600",
  },

  loader: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  empty: {
    alignItems: "center",
    paddingTop: Metrics.x5,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
  },

  emptyText: {
    fontSize: 14,
    color: Colors.subtext,
    textAlign: "center",
    marginTop: Metrics.x2,
  },
});

export {
  PlatformSchoolsScreen,
};