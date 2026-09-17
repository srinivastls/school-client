import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";

import {
  ActivityIndicator,
  Button,
  Card,
  Chip,
  Dialog,
  Divider,
  IconButton,
  Portal,
  SegmentedButtons,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";

import DateTimePicker from "@react-native-community/datetimepicker";

import {
  teacherServices,
  TeacherLeaveRequest,
  TeacherLeaveType,
} from "../../services/teacherServices";

const LEAVE_TYPES: {
  value: TeacherLeaveType;
  label: string;
  description: string;
}[] = [
  {
    value: "CL",
    label: "Casual Leave",
    description: "CL",
  },
  {
    value: "SL",
    label: "Sick Leave",
    description: "SL",
  },
  {
    value: "EL",
    label: "Earned Leave",
    description: "EL",
  },
  {
    value: "LWP",
    label: "Leave Without Pay",
    description: "LWP",
  },
];

type Filter =
  | "ALL"
  | "PENDING"
  | "APPROVED"
  | "REJECTED";

const TeacherLeaveScreen = ({
  navigation,
}: any) => {
  const theme = useTheme();

  const [requests, setRequests] =
    useState<TeacherLeaveRequest[]>([]);

  const [summary, setSummary] =
    useState({
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
    });

  const [filter, setFilter] =
    useState<Filter>("ALL");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] =
    useState(false);

  const [dialogVisible, setDialogVisible] =
    useState(false);

  const [leaveType, setLeaveType] =
    useState<TeacherLeaveType>("CL");

  const [fromDate, setFromDate] =
    useState<Date>(new Date());

  const [toDate, setToDate] =
    useState<Date>(new Date());

  const [reason, setReason] =
    useState("");

  const [datePicker, setDatePicker] =
    useState<"FROM" | "TO" | null>(null);

  const [submitting, setSubmitting] =
    useState(false);

  const loadLeaves = useCallback(
    async () => {
      try {
        setLoading(true);

        const status =
          filter === "ALL"
            ? undefined
            : filter;

        const response =
          await teacherServices.getMyLeaves(
            status as any
          );

        setRequests(response.requests);
        setSummary(response.summary);
      } catch (error: any) {
        Alert.alert(
          "Unable to load",
          error?.response?.data?.message ||
            "Unable to load leave requests."
        );
      } finally {
        setLoading(false);
      }
    },
    [filter]
  );

  useEffect(() => {
    loadLeaves();
  }, [loadLeaves]);

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await loadLeaves();
    } finally {
      setRefreshing(false);
    }
  };

  const submitLeave = async () => {
    if (!reason.trim()) {
      Alert.alert(
        "Reason required",
        "Please enter the reason for your leave."
      );
      return;
    }

    if (toDate < fromDate) {
      Alert.alert(
        "Invalid dates",
        "To date cannot be before from date."
      );
      return;
    }

    try {
      setSubmitting(true);

      await teacherServices.applyLeave({
        fromDate: formatApiDate(fromDate),
        toDate: formatApiDate(toDate),
        leaveType,
        reason: reason.trim(),
      });

      setDialogVisible(false);

      setReason("");
      setLeaveType("CL");

      const today = new Date();

      setFromDate(today);
      setToDate(today);

      Alert.alert(
        "Submitted",
        "Your leave request has been submitted successfully."
      );

      await loadLeaves();
    } catch (error: any) {
      Alert.alert(
        "Unable to submit",
        error?.response?.data?.message ||
          "Unable to submit leave request."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const cancelRequest = (
    request: TeacherLeaveRequest
  ) => {
    Alert.alert(
      "Cancel leave?",
      "This pending leave request will be cancelled.",
      [
        {
          text: "Keep",
          style: "cancel",
        },
        {
          text: "Cancel Leave",
          style: "destructive",
          onPress: async () => {
            try {
              await teacherServices.cancelLeave(
                request.id
              );

              await loadLeaves();

              Alert.alert(
                "Cancelled",
                "Leave request cancelled successfully."
              );
            } catch (error: any) {
              Alert.alert(
                "Unable to cancel",
                error?.response?.data?.message ||
                  "Unable to cancel leave request."
              );
            }
          },
        },
      ]
    );
  };

  if (loading && requests.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />

        <Text style={styles.loadingText}>
          Loading leave requests...
        </Text>
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

        <View style={styles.headerText}>
          <Text
            variant="titleLarge"
            style={styles.title}
          >
            Leave Management
          </Text>

          <Text
            variant="bodySmall"
            style={{
              color:
                theme.colors.onSurfaceVariant,
            }}
          >
            Apply and track your leave
          </Text>
        </View>
      </View>

      <FlatList
        data={requests}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <>
            {/* Apply button */}
            <Button
              mode="contained"
              icon="calendar-plus"
              onPress={() =>
                setDialogVisible(true)
              }
              style={styles.applyButton}
              contentStyle={
                styles.applyButtonContent
              }
            >
              Apply for Leave
            </Button>

            {/* Summary */}
            <View style={styles.summaryRow}>
              <Summary
                label="Total"
                value={summary.total}
              />

              <Summary
                label="Pending"
                value={summary.pending}
              />

              <Summary
                label="Approved"
                value={summary.approved}
              />

              <Summary
                label="Rejected"
                value={summary.rejected}
              />
            </View>

            {/* Filter */}
            <SegmentedButtons
              value={filter}
              onValueChange={(value) =>
                setFilter(value as Filter)
              }
              buttons={[
                {
                  value: "ALL",
                  label: "All",
                },
                {
                  value: "PENDING",
                  label: "Pending",
                },
                {
                  value: "APPROVED",
                  label: "Approved",
                },
                {
                  value: "REJECTED",
                  label: "Rejected",
                },
              ]}
              style={styles.filters}
            />

            <Text
              variant="titleMedium"
              style={styles.historyTitle}
            >
              Leave History
            </Text>
          </>
        }
        renderItem={({ item }) => (
          <LeaveCard
            request={item}
            onCancel={() =>
              cancelRequest(item)
            }
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text
              variant="titleMedium"
              style={styles.emptyTitle}
            >
              No leave requests
            </Text>

            <Text
              variant="bodyMedium"
              style={styles.emptyText}
            >
              You don't have any{" "}
              {filter === "ALL"
                ? ""
                : filter.toLowerCase()}{" "}
              leave requests.
            </Text>
          </View>
        }
      />

      {/* Apply dialog */}
      <Portal>
        <Dialog
          visible={dialogVisible}
          onDismiss={() =>
            !submitting &&
            setDialogVisible(false)
          }
        >
          <Dialog.Title>
            Apply for Leave
          </Dialog.Title>

          <Dialog.ScrollArea>
            <View style={styles.dialogContent}>
              <Text
                variant="labelLarge"
                style={styles.fieldLabel}
              >
                Leave Type
              </Text>

              <View
                style={styles.leaveTypes}
              >
                {LEAVE_TYPES.map((type) => (
                  <Chip
                    key={type.value}
                    selected={
                      leaveType === type.value
                    }
                    onPress={() =>
                      setLeaveType(
                        type.value
                      )
                    }
                    icon={
                      leaveType ===
                      type.value
                        ? "check"
                        : undefined
                    }
                    style={styles.leaveChip}
                  >
                    {type.label}
                  </Chip>
                ))}
              </View>

              <Text
                variant="labelLarge"
                style={styles.fieldLabel}
              >
                From Date
              </Text>

              <Button
                mode="outlined"
                icon="calendar"
                onPress={() =>
                  setDatePicker("FROM")
                }
                style={styles.dateButton}
              >
                {formatDisplayDate(
                  fromDate
                )}
              </Button>

              <Text
                variant="labelLarge"
                style={styles.fieldLabel}
              >
                To Date
              </Text>

              <Button
                mode="outlined"
                icon="calendar"
                onPress={() =>
                  setDatePicker("TO")
                }
                style={styles.dateButton}
              >
                {formatDisplayDate(
                  toDate
                )}
              </Button>

              <Text
                variant="labelLarge"
                style={styles.fieldLabel}
              >
                Reason
              </Text>

              <TextInput
                mode="outlined"
                placeholder="Enter reason"
                value={reason}
                onChangeText={setReason}
                multiline
                numberOfLines={4}
                maxLength={1000}
              />

              <Text
                variant="bodySmall"
                style={styles.characterCount}
              >
                {reason.length}/1000
              </Text>
            </View>
          </Dialog.ScrollArea>

          <Dialog.Actions>
            <Button
              disabled={submitting}
              onPress={() =>
                setDialogVisible(false)
              }
            >
              Cancel
            </Button>

            <Button
              loading={submitting}
              disabled={submitting}
              onPress={submitLeave}
            >
              Submit
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Date picker */}
      {datePicker && (
        <DateTimePicker
          value={
            datePicker === "FROM"
              ? fromDate
              : toDate
          }
          mode="date"
          onChange={(_, date) => {
            setDatePicker(null);

            if (!date) return;

            if (datePicker === "FROM") {
              setFromDate(date);

              if (date > toDate) {
                setToDate(date);
              }
            } else {
              setToDate(date);
            }
          }}
        />
      )}
    </View>
  );
};

/* -------------------------------------------------- */

const LeaveCard = ({
  request,
  onCancel,
}: {
  request: TeacherLeaveRequest;
  onCancel: () => void;
}) => {
  return (
    <Card style={styles.leaveCard}>
      <Card.Content>
        <View style={styles.leaveHeader}>
          <View style={styles.leaveTitle}>
            <Text
              variant="titleMedium"
              style={styles.typeTitle}
            >
              {getLeaveTypeLabel(
                request.leaveType
              )}
            </Text>

            <Text
              variant="bodySmall"
              style={styles.dateText}
            >
              {formatDisplayDate(
                new Date(request.fromDate)
              )}{" "}
              →{" "}
              {formatDisplayDate(
                new Date(request.toDate)
              )}
            </Text>
          </View>

          <LeaveStatus
            status={request.status}
          />
        </View>

        <Divider style={styles.divider} />

        <Text
          variant="bodyMedium"
          style={styles.reason}
        >
          {request.reason}
        </Text>

        <Text
          variant="bodySmall"
          style={styles.applied}
        >
          Applied{" "}
          {formatDisplayDate(
            new Date(request.appliedAt)
          )}
        </Text>

        {request.approvedByUser && (
          <Text
            variant="bodySmall"
            style={styles.approvedBy}
          >
            Processed by{" "}
            {request.approvedByUser.name}
          </Text>
        )}

        {request.status === "PENDING" && (
          <Button
            mode="text"
            icon="close"
            onPress={onCancel}
            style={styles.cancelButton}
          >
            Cancel Request
          </Button>
        )}
      </Card.Content>
    </Card>
  );
};

const LeaveStatus = ({
  status,
}: {
  status:
    | "PENDING"
    | "APPROVED"
    | "REJECTED";
}) => {
  if (status === "APPROVED") {
    return (
      <Chip icon="check-circle">
        Approved
      </Chip>
    );
  }

  if (status === "REJECTED") {
    return (
      <Chip icon="close-circle">
        Rejected
      </Chip>
    );
  }

  return (
    <Chip icon="clock-outline">
      Pending
    </Chip>
  );
};

const Summary = ({
  label,
  value,
}: {
  label: string;
  value: number;
}) => {
  return (
    <Card style={styles.summaryCard}>
      <Card.Content>
        <Text
          variant="titleLarge"
          style={styles.summaryValue}
        >
          {value}
        </Text>

        <Text
          variant="bodySmall"
          style={styles.summaryLabel}
        >
          {label}
        </Text>
      </Card.Content>
    </Card>
  );
};

/* -------------------------------------------------- */

const getLeaveTypeLabel = (
  type: TeacherLeaveType
) => {
  switch (type) {
    case "CL":
      return "Casual Leave";

    case "SL":
      return "Sick Leave";

    case "EL":
      return "Earned Leave";

    case "LWP":
      return "Leave Without Pay";

    default:
      return type;
  }
};

const formatApiDate = (date: Date) => {
  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
};

const formatDisplayDate = (date: Date) => {
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

/* -------------------------------------------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    marginTop: 12,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingTop: 6,
    paddingBottom: 8,
  },

  headerText: {
    flex: 1,
  },

  title: {
    fontWeight: "700",
  },

  content: {
    paddingHorizontal: 14,
    paddingBottom: 30,
  },

  applyButton: {
    borderRadius: 12,
    marginBottom: 14,
  },

  applyButtonContent: {
    height: 48,
  },

  summaryRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },

  summaryCard: {
    flex: 1,
    borderRadius: 12,
  },

  summaryValue: {
    fontWeight: "800",
  },

  summaryLabel: {
    marginTop: 2,
  },

  filters: {
    marginBottom: 18,
  },

  historyTitle: {
    fontWeight: "700",
    marginBottom: 10,
  },

  leaveCard: {
    borderRadius: 14,
    marginBottom: 10,
  },

  leaveHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  leaveTitle: {
    flex: 1,
  },

  typeTitle: {
    fontWeight: "700",
  },

  dateText: {
    marginTop: 4,
  },

  divider: {
    marginVertical: 12,
  },

  reason: {
    lineHeight: 21,
  },

  applied: {
    marginTop: 10,
  },

  approvedBy: {
    marginTop: 4,
  },

  cancelButton: {
    alignSelf: "flex-start",
    marginTop: 6,
  },

  empty: {
    alignItems: "center",
    paddingVertical: 45,
  },

  emptyTitle: {
    fontWeight: "700",
  },

  emptyText: {
    marginTop: 6,
    textAlign: "center",
  },

  dialogContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  fieldLabel: {
    marginTop: 12,
    marginBottom: 7,
  },

  leaveTypes: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  leaveChip: {
    marginBottom: 4,
  },

  dateButton: {
    borderRadius: 10,
  },

  characterCount: {
    alignSelf: "flex-end",
    marginTop: 4,
  },
});

export default TeacherLeaveScreen;