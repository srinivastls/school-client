import React, { useEffect, useState } from "react";

import { Text, View } from "react-native";

import {
  Button,
  Dialog,
  Portal,
  Snackbar,
} from "react-native-paper";

import { ClassList } from "../components";

import {
  Colors,
  makeStyles,
  Metrics,
} from "../theme";

import { studentServices } from "../services/studentServices";

import { useQuery, useQueryClient } from "react-query";

type SnackbarType = "success" | "error";

const PromotionDemotion = () => {
  const styles = useStyles();

  const queryClient = useQueryClient();

  const [fromClass, setFromClass] =
    useState<string | null>(null);

  const [toClass, setToClass] =
    useState<string | null>(null);

  const [showConfirmDialog, setShowConfirmDialog] =
    useState(false);

  const [updating, setUpdating] =
    useState(false);

  const [showSnackbar, setShowSnackbar] =
    useState(false);

  const [snackbarText, setSnackbarText] =
    useState("");

  const [snackbarType, setSnackbarType] =
    useState<SnackbarType>("success");

  /*
   * ============================================================
   * CLASS / STUDENT COUNTS
   * ============================================================
   *
   * We already have this API.
   *
   * It gives:
   *
   * [
   *   {
   *     classNumber: "10",
   *     count: "32"
   *   }
   * ]
   *
   * We use it only to show how many students are
   * going to be moved.
   *
   * ============================================================
   */

  const {
    data: classCountsData,
    isFetching: loadingCounts,
  } = useQuery(
    ["principal-class-student-counts"],
    studentServices.getClassStudentCounts
  );

  /*
   * ============================================================
   * SELECTED CLASS COUNT
   * ============================================================
   */

  const fromClassCount =
    classCountsData?.countData?.find(
      (item) =>
        item.classNumber === fromClass
    )?.count ?? "0";

  /*
   * ============================================================
   * VALIDATION
   * ============================================================
   */

  const sameClass =
    !!fromClass &&
    !!toClass &&
    fromClass === toClass;

  const canUpdate =
    !!fromClass &&
    !!toClass &&
    !sameClass &&
    !updating &&
    Number(fromClassCount) > 0;

  /*
   * ============================================================
   * SNACKBAR
   * ============================================================
   */

  const showMessage = (
    message: string,
    type: SnackbarType
  ) => {
    setSnackbarText(message);
    setSnackbarType(type);
    setShowSnackbar(true);
  };

  /*
   * ============================================================
   * CLASS CHANGE
   * ============================================================
   */

  useEffect(() => {
    if (fromClass && toClass === fromClass) {
      setToClass(null);
    }
  }, [fromClass]);

  /*
   * ============================================================
   * UPDATE
   * ============================================================
   */

  const onPressUpdate = () => {
    if (!fromClass || !toClass) {
      showMessage(
        "Please select both classes.",
        "error"
      );
      return;
    }

    if (sameClass) {
      showMessage(
        "From and To classes cannot be the same.",
        "error"
      );
      return;
    }

    if (Number(fromClassCount) === 0) {
      showMessage(
        `There are no students in Class ${fromClass}.`,
        "error"
      );
      return;
    }

    setShowConfirmDialog(true);
  };

  /*
   * ============================================================
   * CONFIRM MOVEMENT
   * ============================================================
   */

  const confirmMovement = async () => {
    if (
      updating ||
      !fromClass ||
      !toClass
    ) {
      return;
    }

    setShowConfirmDialog(false);

    setUpdating(true);

    try {
      await studentServices.promoteDemote({
        fromClass,
        toClass,
      });

      /*
       * Refresh Principal student counts.
       */

      await queryClient.refetchQueries([
        "principal-class-student-counts",
      ]);

      /*
       * Also refresh other possible class-count
       * consumers in the existing application.
       */

      await queryClient.refetchQueries([
        "classStudentCounts",
      ]);

      /*
       * Refresh any cached student details.
       */

      await queryClient.invalidateQueries([
        "student",
      ]);

      showMessage(
        `Successfully moved ${fromClassCount} student${
          Number(fromClassCount) === 1
            ? ""
            : "s"
        } from Class ${fromClass} to Class ${toClass}.`,
        "success"
      );

      /*
       * Clear selections after successful movement.
       */

      setFromClass(null);
      setToClass(null);
    } catch (err) {
      const error = err as any;

      const message =
        error?.response?.data?.message ??
        "Unable to move students. Please try again.";

      showMessage(
        message,
        "error"
      );
    } finally {
      setUpdating(false);
    }
  };

  /*
   * ============================================================
   * UI
   * ============================================================
   */

  return (
    <>
      <View style={styles.container}>

        {/* ----------------------------------------------------
            HEADER
        ----------------------------------------------------- */}

        <Text style={styles.title}>
          Promotion / Demotion
        </Text>

        <Text style={styles.subtitle}>
          Move all students from one class to another class.
        </Text>

        {/* ----------------------------------------------------
            FROM CLASS
        ----------------------------------------------------- */}

        <Text style={styles.label}>
          From Class
        </Text>

        <ClassList
          selectedClass={fromClass}
          setSelectedClass={setFromClass}
          zIndex={10000}
        />

        {/* ----------------------------------------------------
            STUDENT COUNT
        ----------------------------------------------------- */}

        {fromClass && (
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>
              Students to move
            </Text>

            <Text style={styles.infoValue}>
              {loadingCounts
                ? "Loading..."
                : fromClassCount}
            </Text>

            <Text style={styles.infoDescription}>
              Students currently in Class{" "}
              {fromClass}
            </Text>
          </View>
        )}

        <View style={styles.gap} />

        {/* ----------------------------------------------------
            TO CLASS
        ----------------------------------------------------- */}

        <Text style={styles.label}>
          To Class
        </Text>

        <ClassList
          selectedClass={toClass}
          setSelectedClass={setToClass}
        />

        {/* ----------------------------------------------------
            SAME CLASS WARNING
        ----------------------------------------------------- */}

        {sameClass && (
          <Text style={styles.warningText}>
            From Class and To Class must be different.
          </Text>
        )}

        {/* ----------------------------------------------------
            TARGET CLASS WARNING
        ----------------------------------------------------- */}

        {toClass && (
          <Text style={styles.helperText}>
            The target class must not already contain
            students. The server will reject the movement
            if it does.
          </Text>
        )}

        <View style={styles.gap} />

        {/* ----------------------------------------------------
            SUMMARY
        ----------------------------------------------------- */}

        {fromClass &&
          toClass &&
          !sameClass && (
            <View style={styles.summaryCard}>

              <Text style={styles.summaryTitle}>
                Movement Summary
              </Text>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>
                  From
                </Text>

                <Text style={styles.summaryValue}>
                  Class {fromClass}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>
                  To
                </Text>

                <Text style={styles.summaryValue}>
                  Class {toClass}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>
                  Students
                </Text>

                <Text style={styles.summaryValue}>
                  {fromClassCount}
                </Text>
              </View>
            </View>
          )}

        <View style={styles.gap} />

        {/* ----------------------------------------------------
            UPDATE BUTTON
        ----------------------------------------------------- */}

        <Button
          mode="contained"
          onPress={onPressUpdate}
          loading={updating}
          disabled={!canUpdate}
          contentStyle={styles.buttonContent}
        >
          {updating
            ? "Updating..."
            : "UPDATE CLASS"}
        </Button>

        {/* ----------------------------------------------------
            INFORMATION
        ----------------------------------------------------- */}

        <Text style={styles.note}>
          Note: Promotion/Demotion moves all students in the
          selected source class.
        </Text>

      </View>

      {/* ======================================================
          CONFIRMATION DIALOG
      ======================================================= */}

      <Portal>
        <Dialog
          visible={showConfirmDialog}
          onDismiss={() => {
            if (!updating) {
              setShowConfirmDialog(false);
            }
          }}
        >
          <Dialog.Title>
            Confirm Class Movement
          </Dialog.Title>

          <Dialog.Content>

            <Text style={styles.dialogText}>
              You are about to move{" "}
              <Text style={styles.bold}>
                {fromClassCount} student
                {Number(fromClassCount) === 1
                  ? ""
                  : "s"}
              </Text>{" "}
              from{" "}
              <Text style={styles.bold}>
                Class {fromClass}
              </Text>{" "}
              to{" "}
              <Text style={styles.bold}>
                Class {toClass}
              </Text>
              .
            </Text>

            <View style={styles.dialogWarning}>
              <Text style={styles.dialogWarningText}>
                ⚠️ This action will update the class and
                applicable fee information for all students
                being moved.
              </Text>
            </View>

            <Text style={styles.dialogText}>
              This operation cannot be performed if the
              target class already contains students.
            </Text>

          </Dialog.Content>

          <Dialog.Actions>

            <Button
              onPress={() => {
                setShowConfirmDialog(false);
              }}
              disabled={updating}
            >
              Cancel
            </Button>

            <Button
              mode="contained"
              onPress={confirmMovement}
              loading={updating}
              disabled={updating}
            >
              Confirm
            </Button>

          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* ======================================================
          SNACKBAR
      ======================================================= */}

      <Snackbar
        visible={showSnackbar}
        onDismiss={() => {
          setShowSnackbar(false);
        }}
        duration={3500}
        style={
          snackbarType === "success"
            ? styles.successSnackbar
            : styles.errorSnackbar
        }
      >
        {snackbarText}
      </Snackbar>
    </>
  );
};

const useStyles = makeStyles(() => ({
  container: {
    flex: 1,
    padding: Metrics.x4,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: Metrics.x1,
  },

  subtitle: {
    fontSize: 15,
    color: Colors.subtext,
    marginBottom: Metrics.x5,
  },

  label: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: Metrics.x2,
  },

  gap: {
    height: Metrics.x5,
  },

  infoCard: {
    marginTop: Metrics.x4,
    padding: Metrics.x4,
    borderRadius: Metrics.x3,
    backgroundColor: Colors.brandPrimaryBg,
  },

  infoLabel: {
    fontSize: 13,
    color: Colors.subtext,
  },

  infoValue: {
    fontSize: 28,
    fontWeight: "700",
    marginTop: Metrics.x1,
  },

  infoDescription: {
    fontSize: 13,
    color: Colors.subtext,
    marginTop: Metrics.x1,
  },

  warningText: {
    color: Colors.error,
    fontSize: 13,
    marginTop: Metrics.x2,
  },

  helperText: {
    color: Colors.subtext,
    fontSize: 12,
    lineHeight: 18,
    marginTop: Metrics.x2,
  },

  summaryCard: {
    padding: Metrics.x4,
    borderRadius: Metrics.x3,
    backgroundColor: Colors.brandPrimaryBg,
  },

  summaryTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: Metrics.x3,
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: Metrics.x2,
  },

  summaryLabel: {
    fontSize: 14,
    color: Colors.subtext,
  },

  summaryValue: {
    fontSize: 14,
    fontWeight: "700",
  },

  buttonContent: {
    paddingVertical: Metrics.x1,
  },

  note: {
    fontSize: 12,
    color: Colors.subtext,
    textAlign: "center",
    marginTop: Metrics.x3,
    lineHeight: 18,
  },

  dialogText: {
    fontSize: 15,
    lineHeight: 22,
  },

  bold: {
    fontWeight: "700",
  },

  dialogWarning: {
    marginTop: Metrics.x4,
    marginBottom: Metrics.x4,
    padding: Metrics.x3,
    borderRadius: Metrics.x2,
    backgroundColor: Colors.brandPrimaryBg,
  },

  dialogWarningText: {
    fontSize: 13,
    lineHeight: 19,
  },

  successSnackbar: {
    backgroundColor: Colors.successBg,
  },

  errorSnackbar: {
    backgroundColor: Colors.errorBg,
  },
}));

export { PromotionDemotion };