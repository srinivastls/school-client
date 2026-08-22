import { useIsFocused } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { Text } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { ProgressBar } from "react-native-paper";
import { useQuery } from "react-query";
import { classServices } from "../services";
import { Colors, makeStyles, Metrics } from "../theme";

const ClassList = ({
  setSelectedClass,
  selectedClass,
  placeholder,
  zIndex,
}: {
  setSelectedClass: React.Dispatch<React.SetStateAction<string | null>>;
  selectedClass: string | null;
  placeholder?: string;
  zIndex?: number;
}) => {
  const [open, setOpen] = useState(false);
  const {
    data: response,
    isError,
    refetch,
    isFetching,
  } = useQuery("classList", classServices.getAllClasses, { enabled: false });
  const classes = response?.data?.classes;
  const styles = useStyles();

  const focused = useIsFocused();
  useEffect(() => {
    if (focused) {
      refetch();
    }
  }, [focused]);

  if (isFetching) {
    return (
      <>
        <Text style={styles.loadingText}>Fetching classes ...</Text>
        <ProgressBar color={Colors.brandPrimary} indeterminate />
      </>
    );
  }

  if (isError) {
    return (
      <Text
        style={styles.errorText}
        onPress={() => {
          refetch();
        }}
      >
        Failed to fetch classes. <Text style={styles.retry}>Retry</Text>
      </Text>
    );
  }

  if (!classes) {
    return null;
  }

  const zIndexProp = zIndex ? { zIndex } : {};
  const items = classes.map((classDetails) => ({
    label: `Class ${classDetails.classNumber}`,
    value: `${classDetails.classNumber}`,
  }));

  return (
    <>
      <DropDownPicker
        placeholder={placeholder ?? "Select class"}
        open={open}
        value={selectedClass}
        items={items}
        setOpen={setOpen}
        setValue={setSelectedClass}
        maxHeight={42 * items.length}
        {...zIndexProp}
      />
    </>
  );
};

const useStyles = makeStyles(() => ({
  loadingText: { marginBottom: Metrics.x1 },
  errorText: { color: Colors.error },
  retry: { textDecorationLine: "underline" },
}));

export { ClassList };
