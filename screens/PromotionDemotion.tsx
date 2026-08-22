import React, { useState } from "react";
import { Text, View } from "react-native";
import { Button, Snackbar } from "react-native-paper";
import { ClassList, Page } from "../components";
import { Colors, makeStyles, Metrics } from "../theme";
import RNSnackbar from "react-native-snackbar";
import { studentServices } from "../services/studentServices";
import { useQueryClient } from "react-query";

const PromotionDemotion = () => {
  const [fromClass, setFromClass] = useState<string | null>(null);
  const [toClass, setToClass] = useState<string | null>(null);
  const styles = useStyles();
  const [showSuccessSnackbar, setShowSuccessSnackbar] = useState(false);
  const [updating, setUpdating] = useState(false);
  const queryClient = useQueryClient();

  const onPress = async () => {
    if (updating || !fromClass || !toClass) {
      return;
    }
    try {
      await studentServices.promoteDemote({ fromClass, toClass });
      setShowSuccessSnackbar(true);
      queryClient.refetchQueries(["classStudentCounts"]);
    } catch (err) {
      try {
        RNSnackbar.show({
          text:
            //@ts-ignore
            err?.response?.data?.message ??
            "Something went wrong. Please try again later.",
          backgroundColor: Colors.errorBg,
          duration: RNSnackbar.LENGTH_LONG,
        });
      } catch (_err) {
        RNSnackbar.show({
          text: "Something went wrong. Please try again later.",
          backgroundColor: Colors.errorBg,
          duration: RNSnackbar.LENGTH_LONG,
        });
      }
    }
  };

  return (
    <Page>
      <Text style={styles.label}>From</Text>
      <ClassList
        selectedClass={fromClass}
        setSelectedClass={setFromClass}
        zIndex={10000}
      />
      <View style={styles.gap} />
      <Text style={styles.label}>To</Text>
      <ClassList selectedClass={toClass} setSelectedClass={setToClass} />
      <View style={styles.gap} />
      <Button
        mode="contained"
        onPress={onPress}
        loading={updating}
        disabled={updating}
      >
        Update
      </Button>
      <Snackbar
        visible={showSuccessSnackbar}
        onDismiss={() => {
          setShowSuccessSnackbar(false);
        }}
        style={styles.snackbar}
        duration={2000}
      >
        Updated details successfully!
      </Snackbar>
    </Page>
  );
};

const useStyles = makeStyles(() => ({
  label: {
    marginBottom: Metrics.x1,
  },
  gap: { height: Metrics.x5 },
  snackbar: { backgroundColor: Colors.successBg },
}));

export { PromotionDemotion };
