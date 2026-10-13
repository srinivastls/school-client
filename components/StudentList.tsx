import React, { useMemo, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Checkbox } from "react-native-paper";

import { Colors, Metrics } from "../theme";

export type Student = {
  id: string;
  name: string;
  admissionNumber?: string;
  fatherName?: string;
  phone?: string;
  rollNumber?: number | string;
  pendingAmount?: number;
  eligible?: boolean;
  eligibilityReason?: string;
};

type StudentListProps = {
  students: Student[];
  loading?: boolean;
  selectedStudentIds: string[];
  setSelectedStudentIds: React.Dispatch<
    React.SetStateAction<string[]>
  >;
};

const StudentList = ({
  students,
  loading = false,
  selectedStudentIds,
  setSelectedStudentIds,
}: StudentListProps) => {
  const [expanded, setExpanded] = useState(true);

  const selectedSet = useMemo(
    () => new Set(selectedStudentIds),
    [selectedStudentIds]
  );

  const allSelected =
    students.length > 0 &&
    students.every((student) =>
      selectedSet.has(student.id)
    );

  const selectedCount = students.filter((student) =>
    selectedSet.has(student.id)
  ).length;

  const toggleStudent = (studentId: string) => {
    setSelectedStudentIds((previous) => {
      if (previous.includes(studentId)) {
        return previous.filter((id) => id !== studentId);
      }

      return [...previous, studentId];
    });
  };

  const selectAll = () => {
    setSelectedStudentIds((previous) => {
      const nextIds = new Set(previous);

      students.forEach((student) => {
        nextIds.add(student.id);
      });

      return Array.from(nextIds);
    });
  };

  const deselectVisibleStudents = () => {
    const visibleIds = new Set(
      students.map((student) => student.id)
    );

    setSelectedStudentIds((previous) =>
      previous.filter((id) => !visibleIds.has(id))
    );
  };

  const toggleSelectAll = () => {
    if (allSelected) {
      deselectVisibleStudents();
    } else {
      selectAll();
    }
  };

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.header}
        onPress={() =>
          setExpanded((previous) => !previous)
        }
      >
        <View style={styles.headerText}>
          <Text style={styles.title}>
            Students
          </Text>

          <Text style={styles.subtitle}>
            {loading
              ? "Loading students..."
              : `${students.length} students · ${selectedCount} selected`}
          </Text>
        </View>

        <Text style={styles.arrow}>
          {expanded ? "▲" : "▼"}
        </Text>
      </Pressable>

      {expanded && (
        <View style={styles.content}>
          {loading ? (
            <Text style={styles.emptyText}>
              Loading students...
            </Text>
          ) : students.length === 0 ? (
            <Text style={styles.emptyText}>
              No students found.
            </Text>
          ) : (
            <>
              <View style={styles.selectionHeader}>
                <Text style={styles.selectionCount}>
                  {selectedCount} / {students.length} selected
                </Text>

                <Pressable
                  onPress={toggleSelectAll}
                >
                  <Text style={styles.selectAll}>
                    {allSelected
                      ? "Deselect All"
                      : "Select All"}
                  </Text>
                </Pressable>
              </View>

              {students.map((student) => {
                const checked = selectedSet.has(student.id);

                return (
                  <Pressable
                    key={student.id}
                    style={styles.studentRow}
                    onPress={() =>
                      toggleStudent(student.id)
                    }
                  >
                    <Checkbox
                      status={
                        checked
                          ? "checked"
                          : "unchecked"
                      }
                      onPress={() =>
                        toggleStudent(student.id)
                      }
                    />

                    <View style={styles.studentInfo}>
                      <Text style={styles.studentName}>
                        {student.name}
                      </Text>

                      {student.admissionNumber ? (
                        <Text
                          style={styles.secondaryText}
                        >
                          Admission No:{" "}
                          {student.admissionNumber}
                        </Text>
                      ) : null}

                      {student.fatherName ? (
                        <Text
                          style={styles.secondaryText}
                        >
                          Father: {student.fatherName}
                        </Text>
                      ) : null}

                      {student.rollNumber !== undefined &&
                      student.rollNumber !== null ? (
                        <Text
                          style={styles.secondaryText}
                        >
                          Roll No: {student.rollNumber}
                        </Text>
                      ) : null}

                      {student.pendingAmount !== undefined ? (
                        <Text
                          style={[
                            styles.secondaryText,
                            student.pendingAmount > 0
                              ? styles.pendingText
                              : styles.eligibleText,
                          ]}
                        >
                          Pending Amount:{" "}
                          {student.pendingAmount}
                        </Text>
                      ) : null}

                      {student.eligible !== undefined ? (
                        <Text
                          style={[
                            styles.eligibilityText,
                            student.eligible
                              ? styles.eligibleText
                              : styles.pendingText,
                          ]}
                        >
                          {student.eligible
                            ? "Eligible"
                            : "Not eligible"}
                        </Text>
                      ) : null}
                    </View>
                  </Pressable>
                );
              })}

              <View style={styles.footer}>
                <Text style={styles.footerText}>
                  {selectedCount} student
                  {selectedCount === 1 ? "" : "s"} selected
                </Text>

                <Pressable
                  onPress={deselectVisibleStudents}
                >
                  <Text style={styles.deselect}>
                    Deselect All
                  </Text>
                </Pressable>
              </View>
            </>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: Metrics.x3,
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 10,
    overflow: "hidden",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Metrics.x4,
  },

  headerText: {
    flex: 1,
  },

  title: {
    fontSize: 16,
    fontWeight: "700",
  },

  subtitle: {
    fontSize: 12,
    color: Colors.subtext,
    marginTop: 4,
  },

  arrow: {
    fontSize: 14,
    marginLeft: Metrics.x2,
  },

  content: {
    paddingHorizontal: Metrics.x3,
    paddingBottom: Metrics.x2,
  },

  selectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Metrics.x3,
  },

  selectionCount: {
    fontSize: 12,
    color: Colors.subtext,
  },

  selectAll: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.brandPrimary,
  },

  studentRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: Metrics.x3,
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
  },

  studentInfo: {
    flex: 1,
    marginLeft: Metrics.x1,
  },

  studentName: {
    fontSize: 14,
    fontWeight: "600",
  },

  secondaryText: {
    fontSize: 12,
    color: Colors.subtext,
    marginTop: 3,
  },

  eligibilityText: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 3,
  },

  pendingText: {
    color: Colors.error,
  },

  eligibleText: {
    color: "#238636",
  },

  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Metrics.x3,
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
  },

  footerText: {
    fontSize: 12,
    color: Colors.subtext,
  },

  deselect: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.error,
  },

  emptyText: {
    paddingVertical: Metrics.x4,
    fontSize: 13,
    color: Colors.subtext,
    textAlign: "center",
  },
});

export { StudentList };