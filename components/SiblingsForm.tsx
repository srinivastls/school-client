import React, { MutableRefObject, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Button, TextInput } from "react-native-paper";
import { Colors, Metrics } from "../theme";
import { Sibling } from "../types";
import { Icon } from "./icon";

export type SiblingFormType = Omit<Sibling, "name">;

type Props = {
  siblingsRef: MutableRefObject<SiblingFormType[]>;
  errors?: { index?: number; message?: string };
};

const SiblingsForm = ({ siblingsRef, errors }: Props) => {
  const [siblings, setSiblings] = useState<SiblingFormType[]>(
    siblingsRef.current ?? []
  );

  const addSibling = () => {
    setSiblings((siblings) => {
      const newList = [...siblings, { admissionNo: "" }];
      siblingsRef.current = newList;
      return newList;
    });
  };

  const deleteSibling = () => {
    setSiblings((siblings) => {
      const newList = [...siblings.slice(0, -1)];
      siblingsRef.current = newList;
      return newList;
    });
  };

  const onChange = (
    updatedDetails: Partial<SiblingFormType>,
    index: number
  ) => {
    const oldDetails = siblings[index];
    siblingsRef.current[index] = {
      ...siblingsRef.current[index],
      ...updatedDetails,
    };
  };

  return (
    <>
      {siblings.length === 0 ? (
        <Button mode="text" style={styles.addSiblingText} onPress={addSibling}>
          <Text>Add sibling</Text>
        </Button>
      ) : null}

      {siblings.map((sibling, index) => {
        return (
          <View key={index}>
            <View style={styles.siblingContainer}>
              <TextInput
                label="Sibling admn. no."
                defaultValue={siblingsRef.current[index].admissionNo ?? ""}
                onChangeText={(text) => {
                  onChange({ admissionNo: text }, index);
                }}
                mode="outlined"
                error={errors?.index === index}
                key={"admissionNo." + index + sibling.admissionNo}
                style={{ ...styles.siblingInput }}
                autoCapitalize="characters"
              />
            </View>

            <Text style={styles.error}>
              {errors?.index === index ? errors?.message : ""}
            </Text>
          </View>
        );
      })}

      {siblings.length ? (
        <View style={styles.siblingsIconContainer}>
          <Button
            onPress={addSibling}
            mode="contained-tonal"
            style={styles.siblingIcon}
          >
            <Icon name="add" size="lg" />
          </Button>
          <Button
            onPress={deleteSibling}
            mode="contained-tonal"
            style={styles.siblingIcon}
          >
            <Icon name="delete-outline" size="lg" />
          </Button>
        </View>
      ) : null}
    </>
  );
};

const styles = StyleSheet.create({
  error: {
    color: Colors.error,
  },
  siblingContainer: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
  },
  siblingInput: {
    flex: 1,
  },
  addSiblingText: { marginBottom: Metrics.x3 },
  siblingIcon: {
    marginBottom: Metrics.x5,
  },
  siblingsIconContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    marginTop: 2,
  },
});

export { SiblingsForm };
