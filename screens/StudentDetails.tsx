import {
  RouteProp,
  StackActions,
  useNavigation,
  useRoute,
} from "@react-navigation/native";

import React, { useEffect, useState } from "react";

import {
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";

import {
  ActivityIndicator,
  Button,
  Dialog,
  Divider,
  Portal,
  Snackbar,
} from "react-native-paper";

import { useQuery } from "react-query";

import {
  Page,
  TransactionItem,
} from "../components";

import { txnServices } from "../services";
import { studentServices } from "../services/studentServices";

import {
  Colors,
  makeStyles,
  Metrics,
} from "../theme";

import {
  GetStudentResponse,
  RootStackParamList,
  RootStackScreenNames,
  Student,
  Transaction,
} from "../types";

/* ============================================================================
   STUDENT DETAILS
============================================================================ */

const StudentDetails = () => {
  const styles = useStyles();

  const route =
    useRoute<
      RouteProp<
        RootStackParamList,
        RootStackScreenNames.StudentDetails
      >
    >();

  const navigation =
    useNavigation<
      any
    >();

  const { student } = route.params;

  /* ==========================================================================
     STATE
  ========================================================================== */

  const [fetchingSibling, setFetchingSibling] =
    useState(false);

  const [snackbarVisible, setSnackbarVisible] =
    useState(false);

  const [snackbarMessage, setSnackbarMessage] =
    useState("");

  const [snackbarColor, setSnackbarColor] =
    useState(Colors.errorBg);

  const [showDeleteDialog, setShowDeleteDialog] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  /* ==========================================================================
     SNACKBAR
  ========================================================================== */

  const showSnackbar = (
    message: string,
    backgroundColor: string = Colors.errorBg
  ) => {
    setSnackbarMessage(message);
    setSnackbarColor(backgroundColor);
    setSnackbarVisible(true);
  };

  /* ==========================================================================
     STUDENT API
  ========================================================================== */

  const {
    data: studentFromQuery,
    isFetching: fetchingStudent,
    refetch: refetchStudent,
    isError: studentFetchError,
    error: studentError,
  } = useQuery<GetStudentResponse>(
    ["student-details", student.admissionNo],
    () =>
      studentServices.getStudentById({
        admissionNo:
          student.admissionNo,
      }),
    {
      enabled: true,
      cacheTime: 0,
      refetchOnWindowFocus: false,
    }
  );

  /* ==========================================================================
     TRANSACTIONS API
  ========================================================================== */

  const {
    data: transactions,
    error: transactionError,
    refetch: refetchTransactions,
    isFetching: fetchingTransactions,
  } = useQuery<Transaction[]>(
    [
      "student-transactions",
      student.admissionNo,
    ],
    () =>
      txnServices.getStudentTxns({
        admissionNo:
          student.admissionNo,
      }),
    {
      refetchOnWindowFocus: false,
    }
  );

  /* ==========================================================================
     CURRENT STUDENT
  ========================================================================== */

  const currentStudent: Student =
    !studentFetchError &&
    studentFromQuery &&
    "admissionNo" in studentFromQuery
      ? (studentFromQuery as Student)
      : student;

  /* ==========================================================================
     ERROR HANDLING
  ========================================================================== */

  useEffect(() => {
    const error =
      studentError ??
      transactionError;

    if (error) {
      showSnackbar(
        // @ts-ignore
        error?.response?.data?.message ??
          "Unable to load student details."
      );
    }
  }, [
    studentError,
    transactionError,
  ]);

  /* ==========================================================================
     SIBLING
  ========================================================================== */

  const onSiblingPress = async (
    admissionNo: string
  ) => {
    if (fetchingSibling) {
      return;
    }

    setFetchingSibling(true);

    try {
      const sibling =
        await studentServices.getStudentById({
          admissionNo,
        });

      navigation.dispatch(
        StackActions.push(
          RootStackScreenNames.StudentDetails,
          {
            student: sibling,
          }
        )
      );
    } catch (error) {
      showSnackbar(
        // @ts-ignore
        error?.response?.data?.message ??
          "Unable to load sibling details."
      );
    } finally {
      setFetchingSibling(false);
    }
  };

  /* ==========================================================================
     REFRESH
  ========================================================================== */

  const onRefresh = () => {
    refetchStudent();
    refetchTransactions();
  };

  /* ==========================================================================
     EDIT STUDENT
  ========================================================================== */

  const onEditStudent = () => {
  navigation.navigate(
    RootStackScreenNames.EditStudent,
    {
      preFetchedData: currentStudent,
    }
  );
};

  /* ==========================================================================
     DELETE STUDENT
     
     IMPORTANT:
     
     Backend currently does NOT have:
     
       POST /api/student/delete
     
     Therefore we don't make a fake API request.
  ========================================================================== */

  const handleDeleteStudent = async () => {
    setDeleting(true);

    try {
      showSnackbar(
        "Delete Student API is not implemented yet."
      );

      setShowDeleteDialog(false);
    } finally {
      setDeleting(false);
    }
  };

  /* ==========================================================================
     TRANSACTION
  ========================================================================== */

  const renderTransaction = (
    transaction: Transaction
  ) => {
    return (
      <View
        key={transaction.id}
        style={
          styles.transactionContainer
        }
      >
        <TransactionItem
          txn={transaction}
          student={currentStudent}
        />
      </View>
    );
  };

  /* ==========================================================================
     FEE ROW
  ========================================================================== */

  const renderFeeRow = (
    label: string,
    amount?: string
  ) => {
    return (
      <View style={styles.feeRow}>

        <Text style={styles.feeLabel}>
          {label}
        </Text>

        <Text style={styles.feeAmount}>
          ₹{amount ?? "0"}
        </Text>

      </View>
    );
  };

  /* ==========================================================================
     LOADING
  ========================================================================== */

  const initialLoading =
    fetchingStudent &&
    !studentFromQuery;

  /* ==========================================================================
     UI
  ========================================================================== */

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          onRefresh={onRefresh}
          refreshing={
            fetchingStudent ||
            fetchingTransactions ||
            fetchingSibling
          }
        />
      }
    >

      <Page>

        {/* ================================================================
            HEADER
        ================================================================ */}

        <View style={styles.pageHeader}>

          <View style={styles.avatar}>

            <Text style={styles.avatarText}>
              {currentStudent.name
                ?.charAt(0)
                ?.toUpperCase()}
            </Text>

          </View>

          <View style={styles.headerInfo}>

            <Text style={styles.studentName}>
              {currentStudent.name}
            </Text>

            <Text style={styles.admissionNo}>
              Admission No:{" "}
              {currentStudent.admissionNo}
            </Text>

            <Text style={styles.classText}>
              Class{" "}
              {typeof currentStudent.classNumber ===
              "object"
                ? currentStudent.classNumber
                    ?.classNumber
                : currentStudent.classNumber}
            </Text>

          </View>

        </View>

        {/* ================================================================
            ACTIONS
        ================================================================ */}

        <View style={styles.section}>

          <Text style={styles.sectionTitle}>
            Student Actions
          </Text>

          <View style={styles.actionsCard}>

            <Button
              mode="contained"
              icon="pencil"
              onPress={onEditStudent}
              style={styles.actionButton}
            >
              Edit Student
            </Button>

            <Button
              mode="outlined"
              icon="delete"
              onPress={() => {
                setShowDeleteDialog(true);
              }}
              textColor={Colors.error}
              style={styles.actionButton}
            >
              Delete Student
            </Button>

          </View>

        </View>

        {/* ================================================================
            STUDENT INFORMATION
        ================================================================ */}

        <View style={styles.section}>

          <Text style={styles.sectionTitle}>
            Student Information
          </Text>

          <View style={styles.card}>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>
                Father Name
              </Text>

              <Text style={styles.infoValue}>
                {currentStudent.fatherName ||
                  "-"}
              </Text>
            </View>

            <Divider />

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>
                Date of Birth
              </Text>

              <Text style={styles.infoValue}>
                {currentStudent.dob || "-"}
              </Text>
            </View>

            <Divider />

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>
                Date of Joining
              </Text>

              <Text style={styles.infoValue}>
                {currentStudent.doj || "-"}
              </Text>
            </View>

            <Divider />

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>
                Phone
              </Text>

              <Text style={styles.infoValue}>
                {
                  // @ts-ignore
                  currentStudent.phone ??
                  currentStudent.phoneNo ??
                  "-"
                }
              </Text>
            </View>

            <Divider />

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>
                Aadhaar
              </Text>

              <Text style={styles.infoValue}>
                {currentStudent.aadhaar ||
                  "-"}
              </Text>
            </View>

          </View>

        </View>

        {/* ================================================================
            FEE SUMMARY
        ================================================================ */}

        <View style={styles.section}>

          <Text style={styles.sectionTitle}>
            Fee Summary
          </Text>

          <View style={styles.card}>

            {renderFeeRow(
              "Tuition Fee",
              currentStudent.pendingTuitionFee
            )}

            <Divider />

            {renderFeeRow(
              "Textbook Fee",
              currentStudent.pendingTextbookFee
            )}

            <Divider />

            {renderFeeRow(
              "Notebook Fee",
              currentStudent.pendingNotebookFee
            )}

            <Divider />

            {renderFeeRow(
              "Diary",
              // @ts-ignore
              currentStudent.pendingDiaryAmount
            )}

            <Divider />

            {renderFeeRow(
              "Tie",
              currentStudent.tie
                ?.pendingAmount
            )}

            <Divider />

            {renderFeeRow(
              "Belt",
              currentStudent.belt
                ?.pendingAmount
            )}

            <Divider />

            {renderFeeRow(
              "Arrears",
              currentStudent.arrears
                ?.pendingAmount
            )}

          </View>

          <View style={styles.pendingCard}>

            <Text style={styles.pendingLabel}>
              Total Pending Amount
            </Text>

            <Text style={styles.pendingAmount}>
              ₹{currentStudent.pendingAmount}
            </Text>

          </View>

        </View>

        {/* ================================================================
            COUPON
        ================================================================ */}

        {currentStudent.couponCode ? (

          <View style={styles.section}>

            <Text style={styles.sectionTitle}>
              Coupon
            </Text>

            <View style={styles.couponCard}>

              <Text style={styles.couponLabel}>
                Applied Coupon
              </Text>

              <Text style={styles.couponCode}>
                {typeof currentStudent.couponCode ===
                "string"
                  ? currentStudent.couponCode
                  : // @ts-ignore
                    currentStudent.couponCode?.code}
              </Text>

            </View>

          </View>

        ) : null}

        {/* ================================================================
            SIBLINGS
        ================================================================ */}

        {currentStudent.siblings?.length ? (

          <View style={styles.section}>

            <Text style={styles.sectionTitle}>
              Siblings
            </Text>

            {currentStudent.siblings.map(
              (sibling) => (

                <Button
                  key={sibling.admissionNo}
                  mode="outlined"
                  icon="account"
                  onPress={() =>
                    onSiblingPress(
                      sibling.admissionNo
                    )
                  }
                  style={styles.siblingButton}
                  contentStyle={
                    styles.siblingButtonContent
                  }
                >
                  {sibling.name}{" "}
                  ({sibling.admissionNo})
                </Button>

              )
            )}

          </View>

        ) : null}

        {/* ================================================================
            TRANSACTIONS
        ================================================================ */}

        <View style={styles.section}>

          <Text style={styles.sectionTitle}>
            Transactions
          </Text>

          {fetchingTransactions ? (

            <View style={styles.loading}>
              <ActivityIndicator
                size="large"
                color={
                  Colors.brandPrimary
                }
              />
            </View>

          ) : transactions?.length ? (

            transactions.map(
              renderTransaction
            )

          ) : (

            <View style={styles.emptyCard}>

              <Text style={styles.emptyIcon}>
                💳
              </Text>

              <Text style={styles.emptyTitle}>
                No Transactions
              </Text>

              <Text style={styles.emptyText}>
                No payment transactions found
                for this student.
              </Text>

            </View>

          )}

        </View>

        {/* ================================================================
            INITIAL LOADING
        ================================================================ */}

        {initialLoading ? (

          <View style={styles.loading}>

            <ActivityIndicator
              size="large"
              color={
                Colors.brandPrimary
              }
            />

          </View>

        ) : null}

        {/* ================================================================
            DELETE CONFIRMATION
        ================================================================ */}

        <Portal>

          <Dialog
            visible={showDeleteDialog}
            onDismiss={() => {
              if (!deleting) {
                setShowDeleteDialog(false);
              }
            }}
          >

            <Dialog.Title>
              Delete Student
            </Dialog.Title>

            <Dialog.Content>

              <Text>
                Are you sure you want to
                delete{" "}
                <Text
                  style={{
                    fontWeight: "700",
                  }}
                >
                  {currentStudent.name}
                </Text>
                ?
              </Text>

              <Text
                style={{
                  marginTop: Metrics.x2,
                  color: Colors.subtext,
                }}
              >
                Admission No:{" "}
                {currentStudent.admissionNo}
              </Text>

              <Text
                style={{
                  marginTop: Metrics.x2,
                  color: Colors.error,
                }}
              >
                This action cannot be undone.
              </Text>

            </Dialog.Content>

            <Dialog.Actions>

              <Button
                disabled={deleting}
                onPress={() => {
                  setShowDeleteDialog(
                    false
                  );
                }}
              >
                Cancel
              </Button>

              <Button
                loading={deleting}
                disabled={deleting}
                textColor={Colors.error}
                onPress={
                  handleDeleteStudent
                }
              >
                Delete
              </Button>

            </Dialog.Actions>

          </Dialog>

        </Portal>

        {/* ================================================================
            SNACKBAR
        ================================================================ */}

        <Snackbar
          visible={snackbarVisible}
          onDismiss={() =>
            setSnackbarVisible(false)
          }
          duration={3000}
          style={{
            backgroundColor:
              snackbarColor,
          }}
        >
          {snackbarMessage}
        </Snackbar>

      </Page>

    </ScrollView>
  );
};

/* ============================================================================
   STYLES
============================================================================ */

const useStyles = makeStyles(() => {
  return {

    /* ------------------------------------------------------------------------
       HEADER
    ------------------------------------------------------------------------ */

    pageHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: Metrics.x5,
    },

    avatar: {
      width: 64,
      height: 64,
      borderRadius: 32,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        Colors.brandPrimaryBg,
    },

    avatarText: {
      fontSize: 26,
      fontWeight: "700",
    },

    headerInfo: {
      flex: 1,
      marginLeft: Metrics.x3,
    },

    studentName: {
      fontSize: 24,
      fontWeight: "700",
    },

    admissionNo: {
      fontSize: 14,
      color: Colors.subtext,
      marginTop: Metrics.x1,
    },

    classText: {
      fontSize: 14,
      color: Colors.subtext,
      marginTop: Metrics.x1,
    },

    /* ------------------------------------------------------------------------
       SECTION
    ------------------------------------------------------------------------ */

    section: {
      marginBottom: Metrics.x5,
    },

    sectionTitle: {
      fontSize: 19,
      fontWeight: "700",
      marginBottom: Metrics.x3,
    },

    /* ------------------------------------------------------------------------
       ACTIONS
    ------------------------------------------------------------------------ */

    actionsCard: {
      padding: Metrics.x4,
      borderRadius: Metrics.x3,
      backgroundColor:
        Colors.brandPrimaryBg,
    },

    actionButton: {
      marginBottom: Metrics.x3,
    },

    /* ------------------------------------------------------------------------
       CARD
    ------------------------------------------------------------------------ */

    card: {
      borderRadius: Metrics.x3,
      backgroundColor:
        Colors.brandPrimaryBg,
      paddingHorizontal: Metrics.x4,
    },

    /* ------------------------------------------------------------------------
       INFORMATION
    ------------------------------------------------------------------------ */

    infoRow: {
      minHeight: 52,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
    },

    infoLabel: {
      flex: 1,
      fontSize: 14,
      color: Colors.subtext,
    },

    infoValue: {
      flex: 1,
      fontSize: 15,
      fontWeight: "600",
      textAlign: "right",
    },

    /* ------------------------------------------------------------------------
       FEES
    ------------------------------------------------------------------------ */

    feeRow: {
      minHeight: 48,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
    },

    feeLabel: {
      fontSize: 14,
      color: Colors.subtext,
    },

    feeAmount: {
      fontSize: 15,
      fontWeight: "600",
    },

    pendingCard: {
      marginTop: Metrics.x3,
      padding: Metrics.x4,
      borderRadius: Metrics.x3,
      backgroundColor:
        Colors.errorBg,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
    },

    pendingLabel: {
      flex: 1,
      fontSize: 15,
      fontWeight: "600",
    },

    pendingAmount: {
      fontSize: 22,
      fontWeight: "800",
      color: Colors.error,
    },

    /* ------------------------------------------------------------------------
       COUPON
    ------------------------------------------------------------------------ */

    couponCard: {
      padding: Metrics.x4,
      borderRadius: Metrics.x3,
      backgroundColor:
        Colors.brandPrimaryBg,
    },

    couponLabel: {
      fontSize: 13,
      color: Colors.subtext,
    },

    couponCode: {
      fontSize: 18,
      fontWeight: "700",
      marginTop: Metrics.x1,
    },

    /* ------------------------------------------------------------------------
       SIBLINGS
    ------------------------------------------------------------------------ */

    siblingButton: {
      marginBottom: Metrics.x2,
    },

    siblingButtonContent: {
      minHeight: 48,
    },

    /* ------------------------------------------------------------------------
       TRANSACTIONS
    ------------------------------------------------------------------------ */

    transactionContainer: {
      marginBottom: Metrics.x3,
    },

    /* ------------------------------------------------------------------------
       EMPTY
    ------------------------------------------------------------------------ */

    emptyCard: {
      alignItems: "center",
      paddingVertical: Metrics.x5,
    },

    emptyIcon: {
      fontSize: 40,
    },

    emptyTitle: {
      fontSize: 17,
      fontWeight: "700",
      marginTop: Metrics.x2,
    },

    emptyText: {
      fontSize: 14,
      color: Colors.subtext,
      textAlign: "center",
      marginTop: Metrics.x1,
    },

    /* ------------------------------------------------------------------------
       LOADING
    ------------------------------------------------------------------------ */

    loading: {
      paddingVertical: Metrics.x5,
      alignItems: "center",
      justifyContent: "center",
    },
  };
});

export { StudentDetails };