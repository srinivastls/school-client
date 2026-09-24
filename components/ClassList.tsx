import { useIsFocused } from "@react-navigation/native";
import React, { useEffect, useMemo, useState } from "react";
import { Text, View } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { ProgressBar } from "react-native-paper";
import { useQuery } from "react-query";

import { classServices } from "../services";
import { Colors, makeStyles } from "../theme";

type ClassValueMode = "number" | "id";

type ClassListProps = {
  setSelectedClass: React.Dispatch<
    React.SetStateAction<string | null>
  >;

  selectedClass: string | null;

  academicYearId?: string;

  placeholder?: string;

  zIndex?: number;

  /**
   * number:
   *   Returns classNumber, e.g. "6".
   *
   * id:
   *   Returns database class ID.
   */
  valueMode?: ClassValueMode;

  disabled?: boolean;
};

const ClassList = ({
  setSelectedClass,
  selectedClass,
  academicYearId,
  placeholder,
  zIndex,
  valueMode = "number",
  disabled = false,
}: ClassListProps) => {
  const [open, setOpen] = useState(false);

  const styles = useStyles();

  const focused = useIsFocused();

  const {
    data: response,
    isError,
    refetch,
    isFetching,
  } = useQuery(
    ["classList", academicYearId],
    () => {
      if (!academicYearId) {
        return Promise.reject(
          new Error("Academic year ID is required")
        );
      }

      return classServices.getAllClasses(academicYearId)();
    },
    {
      enabled: Boolean(academicYearId),
    }
  );

  const classes = response?.classes ?? [];

  useEffect(() => {
    if (focused && academicYearId) {
      refetch();
    }
  }, [focused, academicYearId, refetch]);

  const items = useMemo(() => {
    return classes
      .filter((classDetails) => {
        if (valueMode === "id") {
          return Boolean(classDetails.id);
        }

        return classDetails.classNumber !== undefined;
      })
      .map((classDetails) => ({
        label: `Class ${classDetails.classNumber}`,
        value:
          valueMode === "id"
            ? String(classDetails.id)
            : String(classDetails.classNumber),
      }));
  }, [classes, valueMode]);

  if (!academicYearId) {
    return (
      <Text style={styles.loadingText}>
        Loading academic year...
      </Text>
    );
  }

  if (isFetching) {
    return (
      <View>
        <Text style={styles.loadingText}>
          Fetching classes...
        </Text>

        <ProgressBar
          color={Colors.brandPrimary}
          indeterminate
        />
      </View>
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
        Failed to fetch classes.{" "}
        <Text style={styles.retry}>
          Retry
        </Text>
      </Text>
    );
  }

  if (items.length === 0) {
    return (
      <Text style={styles.loadingText}>
        No classes available.
      </Text>
    );
  }

  const zIndexProp = zIndex
    ? { zIndex }
    : {};

  return (
    <View style={styles.container}>
      <DropDownPicker
        placeholder={
          placeholder ?? "Select class"
        }
        open={open}
        value={selectedClass}
        items={items}
        setOpen={setOpen}
        setValue={setSelectedClass}
        listMode="MODAL"
        modalTitle={
          placeholder ?? "Select class"
        }
        disabled={disabled}
        {...zIndexProp}
      />
    </View>
  );
};

const useStyles = makeStyles(() => ({
  container: {
    width: "100%",
  },

  loadingText: {
    marginBottom: 4,
  },

  errorText: {
    color: Colors.error,
  },

  retry: {
    textDecorationLine: "underline",
  },
}));

export { ClassList };