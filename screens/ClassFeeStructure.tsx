import React, { useEffect, useState } from "react";

import {
  Button,
  Paragraph,
  Title,
  FAB,
  Snackbar,
  ProgressBar,
  Card,
} from "react-native-paper";

import { ClassList, Icon, Page } from "../components";
import { Colors, makeStyles, Metrics } from "../theme";
import { formatToIndianAmount } from "../utils";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Class, RootStackParamList, RootStackScreenNames } from "../types";
import { classServices } from "../services";
import { useQueryClient } from "react-query";

import { isAdmin } from "../utils";

const ClassFeeStructure = () => {
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [classDetails, setClassDetails] = useState<Class | null>(null);

  const styles = useStyles();

  const navigation: NativeStackNavigationProp<RootStackParamList> =
    //@ts-ignore
    useNavigation().getParent("RootStack");

  const [fetchingDetails, setFetchingDetails] = useState(false);

  const [showSnackBar, setShowSnackBar] = useState(false);

  const [snackBarText, setSnackBarText] = useState(
    "Something went wrong. Please try again later."
  );

  const [snackBarType, setSnackBarType] =
    useState<"success" | "error">("error");

  const onPress = async () => {
    if (!selectedClass) {
      return;
    }

    setShowSnackBar(false);
    setFetchingDetails(true);

    try {
      const res = await classServices.getClassDetails(selectedClass);

      setClassDetails(res);
    } catch (error) {
      setSnackBarText(
        //@ts-ignore
        error?.response?.data?.message ??
          "Something went wrong. Please try again later."
      );

      setSnackBarType("error");
      setShowSnackBar(true);
    } finally {
      setFetchingDetails(false);
    }
  };



  useEffect(() => {
    setClassDetails(null);
  }, [selectedClass]);

  const [deletingClass, setDeletingClass] = useState(false);

  const queryClient = useQueryClient();

  const onDelete = async () => {
    if (deletingClass) {
      return;
    }

    setDeletingClass(true);

    try {
      await classServices.deleteClass({
        classNumber: selectedClass ?? "",
      });

      queryClient.refetchQueries(["classList"]);

      setSelectedClass(null);
      setClassDetails(null);

      setSnackBarText("Deleted class successfully");
      setSnackBarType("success");
      setShowSnackBar(true);
    } catch (error) {
      setSnackBarText(
        //@ts-ignore
        error?.response?.data?.message ??
          "Something went wrong. Please try again later."
      );

      setSnackBarType("error");
      setShowSnackBar(true);
    } finally {
      setDeletingClass(false);
    }
  };

  return (
    <Page>
      <ClassList
        setSelectedClass={setSelectedClass}
        selectedClass={selectedClass}
      />

      <Button
        mode="contained"
        style={styles.button}
        onPress={onPress}
        loading={fetchingDetails}
        disabled={fetchingDetails}
      >
        Get fee structure
      </Button>

      {classDetails && (
        <Card>
          <Card.Content>
            <Title style={{ fontWeight: "bold" }}>
              Class {classDetails.classNumber} - Rs.{" "}
              {formatToIndianAmount(
                +classDetails.tuitionFee +
                  +classDetails.textBookFee +
                  +classDetails.noteBookFee
              )}
            </Title>

            <Paragraph>
              Tuition fee: {formatToIndianAmount(+classDetails.tuitionFee)}
            </Paragraph>

            <Paragraph>
              Textbook fee: {formatToIndianAmount(+classDetails.textBookFee)}
            </Paragraph>

            <Paragraph>
              Notebook fee: {formatToIndianAmount(+classDetails.noteBookFee)}
            </Paragraph>
          </Card.Content>

          <Card.Actions>
            {isAdmin() ? (
              <>
                <Button mode="text" onPress={onDelete}>
                  <Icon name="delete-outline" size="lg" />
                </Button>

                <Button
                  mode="contained-tonal"
                  onPress={() => {
                    navigation.navigate(
                      RootStackScreenNames.ClassFeeForm,
                      {
                        preFetchedClass: classDetails,
                      }
                    );

                    setClassDetails(null);
                  }}
                >
                  <Icon name="edit" size="md" />
                </Button>
              </>
            ) : null}
          </Card.Actions>

          {deletingClass && (
            <ProgressBar
              indeterminate
              style={styles.progressBar}
            />
          )}
        </Card>
      )}

      {isAdmin() ? (
        <FAB
          icon="plus"
          style={styles.fab}
          onPress={() => {
            navigation.navigate(RootStackScreenNames.ClassFeeForm);
          }}
        />
      ) : null}

      <Snackbar
        visible={showSnackBar}
        onDismiss={() => {
          setShowSnackBar(false);
        }}
        duration={2000}
        style={{
          backgroundColor:
            snackBarType === "success"
              ? Colors.successBg
              : Colors.errorBg,
        }}
      >
        {snackBarText}
      </Snackbar>
    </Page>
  );
};

const useStyles = makeStyles(() => ({
  button: {
    marginVertical: Metrics.x4,
  },

  fab: {
    position: "absolute",
    bottom: Metrics.x4,
    right: Metrics.x4,
  },

  progressBar: {
    borderRadius: 2,
  },
}));

export { ClassFeeStructure };