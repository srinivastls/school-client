import React, { useEffect, useState } from "react";
import {
  Button,
  Paragraph,
  Title,
  FAB,
  Snackbar,
  ProgressBar,
} from "react-native-paper";
import { ClassList, Icon, Page } from "../components";
import { Colors, makeStyles, Metrics } from "../theme";
import { Card } from "react-native-paper";
import { formatToIndianAmount, isUserSuperAdmin } from "../utils";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Class, RootStackParamList, RootStackScreenNames } from "../types";
import { classServices } from "../services";
import RNSnackbar from "react-native-snackbar";
import { useQueryClient } from "react-query";

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

  const onPress = async () => {
    if (!selectedClass) {
      return;
    }
    setShowSnackBar(false);
    setFetchingDetails(true);
    try {
      const res = await classServices.getClassDetails(selectedClass);
      setClassDetails(res.data);
    } catch (error) {
      setSnackBarText(
        //@ts-ignore
        error?.response?.data?.message ??
          "Something went wrong. Please try again later."
      );
      setShowSnackBar(true);
    }
    setFetchingDetails(false);
  };

  const userIsSuperAdmin = isUserSuperAdmin();

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
      await classServices.deleteClass({ classNumber: selectedClass ?? "" });
      queryClient.refetchQueries(["classList"]);
      setSelectedClass(null);
      RNSnackbar.show({
        text: "Deleted class successfully",
        backgroundColor: Colors.successBg,
        duration: RNSnackbar.LENGTH_SHORT,
      });
    } catch (error) {
      RNSnackbar.show({
        text:
          //@ts-ignore
          error?.response?.data?.message ??
          "Something went wrong. Please try again later.",
        backgroundColor: Colors.errorBg,
        duration: RNSnackbar.LENGTH_LONG,
      });
    }
    setDeletingClass(false);
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
            {userIsSuperAdmin ? (
              <>
                <Button mode="text" onPress={onDelete}>
                  <Icon name="delete-outline" size="lg" />
                </Button>
                <Button
                  mode="contained-tonal"
                  onPress={() => {
                    navigation.navigate(RootStackScreenNames.ClassFeeForm, {
                      preFetchedClass: classDetails,
                    });
                    setClassDetails(null);
                  }}
                >
                  <Icon name="edit" size="md" />
                </Button>
              </>
            ) : null}
          </Card.Actions>
          {deletingClass && (
            <ProgressBar indeterminate style={styles.progressBar} />
          )}
        </Card>
      )}
      {userIsSuperAdmin ? (
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
        style={styles.snackBar}
        duration={2000}
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
  snackBar: { backgroundColor: Colors.errorBg },
  progressBar: { borderRadius: 2 },
}));

export { ClassFeeStructure };
