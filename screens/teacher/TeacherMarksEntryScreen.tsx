import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";
import {
  ActivityIndicator,
  Avatar,
  Button,
  Card,
  Chip,
  Divider,
  IconButton,
  Menu,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";

import { teacherServices } from "../../services/teacherServices";

import { NativeStackScreenProps } from "@react-navigation/native-stack";

type RootStackParamList = {
  TeacherMarksEntry: undefined;
};

type Props = NativeStackScreenProps<
  RootStackParamList,
  "TeacherMarksEntry"
>;

type MarksOptionsResponse = Awaited<
  ReturnType<typeof teacherServices.getTeacherMarksOptions>
>;

type MarksEntryResponse = Awaited<
  ReturnType<typeof teacherServices.getTeacherMarksEntry>
>;

type StudentMark = {
  studentId: string;
  enrollmentId: string;
  admissionNo: string;
  name: string;
  fatherName?: string | null;
  photoUrl?: string | null;
  rollNumber?: string | null;
  marksObtained: number | null;
  isAbsent: boolean;
  isFinalized: boolean;
};

type MarkValue = {
  value: string;
  absent: boolean;
};

const TeacherMarksEntryScreen = ({ navigation }: Props) => {
  const theme = useTheme();

  const [options, setOptions] =
    useState<MarksOptionsResponse | null>(null);

  const [entryData, setEntryData] =
    useState<MarksEntryResponse | null>(null);

  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedSectionId, setSelectedSectionId] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedExamId, setSelectedExamId] = useState("");

  const [classMenuVisible, setClassMenuVisible] = useState(false);
  const [sectionMenuVisible, setSectionMenuVisible] = useState(false);
  const [subjectMenuVisible, setSubjectMenuVisible] = useState(false);
  const [examMenuVisible, setExamMenuVisible] = useState(false);

  const [marks, setMarks] = useState<Record<string, MarkValue>>({});

  const [loadingOptions, setLoadingOptions] = useState(true);
  const [loadingEntry, setLoadingEntry] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [hasChanges, setHasChanges] = useState(false);

  const [search, setSearch] = useState("");

  /**
   * Load classes / sections / subjects / exams
   */
  const loadOptions = useCallback(async () => {
    try {
      setLoadingOptions(true);

      const response = await teacherServices.getTeacherMarksOptions();

      setOptions(response);

      /*
       * Automatically select first available class.
       */
      if (response.classes?.length > 0) {
        setSelectedClassId((current) =>
          current || response.classes[0].id
        );
      }
    } catch (error: any) {
      console.error("Failed to load marks options:", error);

      Alert.alert(
        "Unable to load",
        error?.response?.data?.message ||
          "Unable to load marks entry options."
      );
    } finally {
      setLoadingOptions(false);
    }
  }, []);

  useEffect(() => {
    loadOptions();
  }, [loadOptions]);

  /**
   * Classes available to this teacher.
   */
  const classes = useMemo(() => {
    return options?.classes || [];
  }, [options]);

  const selectedClass = useMemo(() => {
    return classes.find(
      (item: any) => item.classId === selectedClassId
    );
  }, [classes, selectedClassId]);

  /**
   * Sections for selected class.
   */
  const sections = useMemo(() => {
    return selectedClass?.sections || [];
  }, [selectedClass]);

  /**
   * Subjects for selected section.
   *
   * Backend may expose subjects at section/class level.
   * We use the subjects supplied by the selected class first,
   * then fall back to selected section.
   */
  const subjects = useMemo(() => {
    const section: any = sections.find(
      (item: any) => item.sectionId === selectedSectionId
    );

    if (section?.subjects?.length) {
      return section.subjects;
    }

    if ((selectedClass as any)?.subjects?.length) {
      return (selectedClass as any).subjects;
    }

    return [];
  }, [sections, selectedSectionId, selectedClass]);

  /**
   * Exams applicable to selected class.
   */
  const exams = useMemo(() => {
    const selected: any = selectedClass;

    if (selected?.exams?.length) {
      return selected.exams;
    }

    return options?.exams || [];
  }, [selectedClass, options]);

  /**
   * When class changes, reset dependent selections.
   */
  useEffect(() => {
    if (!selectedClassId) return;

    const classSections = selectedClass?.sections || [];

    if (
      selectedSectionId &&
      !classSections.some(
        (section: any) =>
          section.sectionId === selectedSectionId
      )
    ) {
      setSelectedSectionId("");
      setSelectedSubjectId("");
    }
  }, [selectedClassId, selectedClass, selectedSectionId]);

  /**
   * Automatically select section if there is only one.
   */
  useEffect(() => {
    if (
      sections.length === 1 &&
      !selectedSectionId
    ) {
      setSelectedSectionId(sections[0].id);
    }
  }, [sections, selectedSectionId]);

  /**
   * Reset subject when section changes.
   */
  useEffect(() => {
    if (!selectedSectionId) {
      setSelectedSubjectId("");
      return;
    }

    if (
      selectedSubjectId &&
      !subjects.some(
        (subject: any) =>
          subject.subjectId === selectedSubjectId ||
          subject.id === selectedSubjectId
      )
    ) {
      setSelectedSubjectId("");
    }
  }, [
    selectedSectionId,
    subjects,
    selectedSubjectId,
  ]);

  /**
   * Load students once all four selections are available.
   */
  const loadEntry = useCallback(async () => {
    if (
      !selectedClassId ||
      !selectedSectionId ||
      !selectedSubjectId ||
      !selectedExamId
    ) {
      setEntryData(null);
      setMarks({});
      return;
    }

    try {
      setLoadingEntry(true);
      setHasChanges(false);

      const response = await teacherServices.getTeacherMarksEntry(
        selectedSectionId,
        selectedSubjectId,
        selectedExamId
      );

      setEntryData(response);

      const initialMarks: Record<string, MarkValue> = {};

      response.students.forEach((student: any) => {
        initialMarks[student.studentId] = {
          value:
            student.marksObtained === null ||
            student.marksObtained === undefined
              ? ""
              : String(student.marksObtained),
          absent: Boolean(student.isAbsent),
        };
      });

      setMarks(initialMarks);
    } catch (error: any) {
      console.error("Failed to load marks entry:", error);

      setEntryData(null);

      Alert.alert(
        "Unable to load",
        error?.response?.data?.message ||
          "Unable to load students for marks entry."
      );
    } finally {
      setLoadingEntry(false);
    }
  }, [
    selectedClassId,
    selectedSectionId,
    selectedSubjectId,
    selectedExamId,
  ]);

  useEffect(() => {
    loadEntry();
  }, [loadEntry]);

  /**
   * Refresh.
   */
  const onRefresh = async () => {
    setRefreshing(true);

    try {
      await loadOptions();

      if (
        selectedClassId &&
        selectedSectionId &&
        selectedSubjectId &&
        selectedExamId
      ) {
        await loadEntry();
      }
    } finally {
      setRefreshing(false);
    }
  };

  /**
   * Update mark.
   */
  const updateMark = (
    studentId: string,
    value: string
  ) => {
    /*
     * Only numbers and one decimal point.
     */
    const cleaned = value.replace(/[^0-9.]/g, "");

    const parts = cleaned.split(".");

    let finalValue = cleaned;

    if (parts.length > 2) {
      finalValue = `${parts[0]}.${parts.slice(1).join("")}`;
    }

    setMarks((previous) => ({
      ...previous,
      [studentId]: {
        value: finalValue,
        absent: false,
      },
    }));

    setHasChanges(true);
  };

  /**
   * Toggle absent.
   */
  const toggleAbsent = (studentId: string) => {
    setMarks((previous) => {
      const current = previous[studentId];

      const absent = !current?.absent;

      return {
        ...previous,
        [studentId]: {
          value: absent ? "0" : "",
          absent,
        },
      };
    });

    setHasChanges(true);
  };

  /**
   * Mark every student absent.
   */
  const markAllAbsent = () => {
    if (!entryData?.students?.length) return;

    Alert.alert(
      "Mark all absent?",
      "This will mark every student as absent.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Continue",
          style: "destructive",
          onPress: () => {
            const updated: Record<string, MarkValue> = {};

            entryData.students.forEach((student: any) => {
              updated[student.studentId] = {
                value: "0",
                absent: true,
              };
            });

            setMarks(updated);
            setHasChanges(true);
          },
        },
      ]
    );
  };

  /**
   * Clear all marks.
   */
  const clearAllMarks = () => {
    if (!entryData?.students?.length) return;

    Alert.alert(
      "Clear marks?",
      "All entered marks will be cleared.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => {
            const updated: Record<string, MarkValue> = {};

            entryData.students.forEach((student: any) => {
              updated[student.studentId] = {
                value: "",
                absent: false,
              };
            });

            setMarks(updated);
            setHasChanges(true);
          },
        },
      ]
    );
  };

  /**
   * Validate marks before saving.
   */
  const validateMarks = (): boolean => {
    if (!entryData) return false;

    const maxMarks = entryData.examSubject.maxMarks;

    for (const student of entryData.students as any[]) {
      const current = marks[student.studentId];

      if (!current) {
        Alert.alert(
          "Missing marks",
          `Please enter marks for ${student.name}.`
        );
        return false;
      }

      if (current.absent) {
        continue;
      }

      if (current.value.trim() === "") {
        Alert.alert(
          "Missing marks",
          `Please enter marks for ${student.name} or mark the student absent.`
        );
        return false;
      }

      const numeric = Number(current.value);

      if (!Number.isFinite(numeric)) {
        Alert.alert(
          "Invalid marks",
          `Invalid marks entered for ${student.name}.`
        );
        return false;
      }

      if (numeric < 0 || numeric > maxMarks) {
        Alert.alert(
          "Invalid marks",
          `${student.name}: marks must be between 0 and ${maxMarks}.`
        );
        return false;
      }
    }

    return true;
  };

  /**
   * Save draft.
   */
  const saveDraft = async () => {
    if (!entryData || !validateMarks()) return;

    try {
      setSaving(true);

      const payload = entryData.students.map((student: any) => {
        const current = marks[student.studentId];

        return {
          studentId: student.studentId,
          marksObtained: current.absent
            ? 0
            : Number(current.value),
          isAbsent: current.absent,
        };
      });

      await teacherServices.saveTeacherMarks({
        sectionId: selectedSectionId,
        subjectId: selectedSubjectId,
        examId: selectedExamId,
        finalize: false,
        marks: payload,
      });

      setHasChanges(false);

      Alert.alert(
        "Saved",
        "Marks have been saved as draft."
      );

      await loadEntry();
    } catch (error: any) {
      console.error("Save draft error:", error);

      Alert.alert(
        "Save failed",
        error?.response?.data?.message ||
          "Unable to save marks."
      );
    } finally {
      setSaving(false);
    }
  };

  /**
   * Finalize marks.
   */
  const finalizeMarks = async () => {
    if (!entryData || !validateMarks()) return;

    const alreadyFinalized = entryData.students.some(
      (student: any) => student.isFinalized
    );

    if (alreadyFinalized) {
      Alert.alert(
        "Already finalized",
        "Some marks in this entry are already finalized and cannot be changed."
      );
      return;
    }

    Alert.alert(
      "Finalize marks?",
      "Once finalized, these marks cannot be edited.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Finalize",
          onPress: async () => {
            try {
              setSaving(true);

              const payload =
                entryData.students.map((student: any) => {
                  const current =
                    marks[student.studentId];

                  return {
                    studentId: student.studentId,
                    marksObtained: current.absent
                      ? 0
                      : Number(current.value),
                    isAbsent: current.absent,
                  };
                });

              await teacherServices.saveTeacherMarks({
                sectionId: selectedSectionId,
                subjectId: selectedSubjectId,
                examId: selectedExamId,
                finalize: true,
                marks: payload,
              });

              setHasChanges(false);

              Alert.alert(
                "Finalized",
                "Marks have been finalized successfully."
              );

              await loadEntry();
            } catch (error: any) {
              console.error(
                "Finalize marks error:",
                error
              );

              Alert.alert(
                "Finalize failed",
                error?.response?.data?.message ||
                  "Unable to finalize marks."
              );
            } finally {
              setSaving(false);
            }
          },
        },
      ]
    );
  };

  /**
   * Search students.
   */
  const filteredStudents = useMemo(() => {
    if (!entryData?.students) return [];

    const query = search.trim().toLowerCase();

    if (!query) {
      return entryData.students;
    }

    return entryData.students.filter((student: any) => {
      return [
        student.name,
        student.admissionNo,
        student.rollNumber,
        student.fatherName,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value)
            .toLowerCase()
            .includes(query)
        );
    });
  }, [entryData, search]);

  /**
   * Statistics.
   */
  const statistics = useMemo(() => {
    if (!entryData?.students) {
      return {
        total: 0,
        entered: 0,
        absent: 0,
        remaining: 0,
        average: 0,
      };
    }

    let entered = 0;
    let absent = 0;
    let totalMarks = 0;

    entryData.students.forEach((student: any) => {
      const current = marks[student.studentId];

      if (!current || current.value === "") {
        return;
      }

      entered++;

      if (current.absent) {
        absent++;
      } else {
        totalMarks += Number(current.value) || 0;
      }
    });

    const total = entryData.students.length;

    return {
      total,
      entered,
      absent,
      remaining: total - entered,
      average:
        entered - absent > 0
          ? totalMarks / (entered - absent)
          : 0,
    };
  }, [entryData, marks]);

  /**
   * Labels.
   */
  const selectedSection = sections.find(
    (section: any) =>
      section.sectionId === selectedSectionId
  );

  const selectedSubject = subjects.find(
    (subject: any) =>
      (subject.subjectId || subject.id) ===
      selectedSubjectId
  );

  const selectedExam = exams.find(
    (exam: any) => exam.examId === selectedExamId
  );

  if (loadingOptions) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>
          Loading marks entry...
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
            style={styles.headerTitle}
          >
            Marks Entry
          </Text>

          <Text
            variant="bodySmall"
            style={{
              color: theme.colors.onSurfaceVariant,
            }}
          >
            {options?.academicYear?.name ||
              "Current Academic Year"}
          </Text>
        </View>
      </View>

      <FlatList
        data={filteredStudents}
        keyExtractor={(item: any) =>
          item.studentId
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <>
            {/* Selection card */}
            <Card style={styles.card}>
              <Card.Content>
                <Text
                  variant="titleMedium"
                  style={styles.sectionTitle}
                >
                  Select Exam & Class
                </Text>

                {/* Class */}
                <Menu
                  visible={classMenuVisible}
                  onDismiss={() =>
                    setClassMenuVisible(false)
                  }
                  anchor={
                    <Button
                      mode="outlined"
                      icon="school"
                      onPress={() =>
                        setClassMenuVisible(true)
                      }
                      contentStyle={
                        styles.selectorContent
                      }
                      style={styles.selector}
                    >
                      {selectedClass
                        ? selectedClass.displayName ||
                          `Class ${selectedClass.classNumber}`
                        : "Select Class"}
                    </Button>
                  }
                >
                  {classes.map((item: any) => (
                    <Menu.Item
                      key={item.classId}
                      title={
                        item.displayName ||
                        `Class ${item.classNumber}`
                      }
                      onPress={() => {
                        setSelectedClassId(
                          item.classId
                        );
                        setSelectedSectionId("");
                        setSelectedSubjectId("");
                        setSelectedExamId("");
                        setClassMenuVisible(false);
                      }}
                    />
                  ))}
                </Menu>

                {/* Section */}
                <Menu
                  visible={sectionMenuVisible}
                  onDismiss={() =>
                    setSectionMenuVisible(false)
                  }
                  anchor={
                    <Button
                      mode="outlined"
                      icon="account-group"
                      disabled={!selectedClassId}
                      onPress={() =>
                        setSectionMenuVisible(true)
                      }
                      contentStyle={
                        styles.selectorContent
                      }
                      style={styles.selector}
                    >
                      {selectedSection
                        ? selectedSection.sectionName
                        : "Select Section"}
                    </Button>
                  }
                >
                  {sections.map((item: any) => (
                    <Menu.Item
                      key={item.sectionId}
                      title={item.sectionName}
                      onPress={() => {
                        setSelectedSectionId(
                          item.sectionId
                        );
                        setSelectedSubjectId("");
                        setSectionMenuVisible(false);
                      }}
                    />
                  ))}
                </Menu>

                {/* Subject */}
                <Menu
                  visible={subjectMenuVisible}
                  onDismiss={() =>
                    setSubjectMenuVisible(false)
                  }
                  anchor={
                    <Button
                      mode="outlined"
                      icon="book-open-variant"
                      disabled={!selectedSectionId}
                      onPress={() =>
                        setSubjectMenuVisible(true)
                      }
                      contentStyle={
                        styles.selectorContent
                      }
                      style={styles.selector}
                    >
                      {selectedSubject
                        ? selectedSubject.name
                        : "Select Subject"}
                    </Button>
                  }
                >
                  {subjects.map((item: any) => (
                    <Menu.Item
                      key={
                        item.subjectId || item.id
                      }
                      title={item.name}
                      onPress={() => {
                        setSelectedSubjectId(
                          item.subjectId || item.id
                        );
                        setSubjectMenuVisible(false);
                      }}
                    />
                  ))}
                </Menu>

                {/* Exam */}
                <Menu
                  visible={examMenuVisible}
                  onDismiss={() =>
                    setExamMenuVisible(false)
                  }
                  anchor={
                    <Button
                      mode="outlined"
                      icon="clipboard-text"
                      disabled={!selectedClassId}
                      onPress={() =>
                        setExamMenuVisible(true)
                      }
                      contentStyle={
                        styles.selectorContent
                      }
                      style={styles.selector}
                    >
                      {selectedExam
                        ? selectedExam.name
                        : "Select Exam"}
                    </Button>
                  }
                >
                  {exams.map((item: any) => (
                    <Menu.Item
                      key={item.examId || item.id}
                      title={item.name}
                      onPress={() => {
                        setSelectedExamId(
                          item.examId || item.id
                        );
                        setExamMenuVisible(false);
                      }}
                    />
                  ))}
                </Menu>
              </Card.Content>
            </Card>

            {/* Loading entry */}
            {loadingEntry && (
              <View style={styles.entryLoading}>
                <ActivityIndicator />
                <Text>
                  Loading students...
                </Text>
              </View>
            )}

            {/* Exam information */}
            {entryData && !loadingEntry && (
              <>
                <Card style={styles.card}>
                  <Card.Content>
                    <View
                      style={styles.examHeader}
                    >
                      <View style={{ flex: 1 }}>
                        <Text
                          variant="titleMedium"
                          style={styles.examName}
                        >
                          {entryData.exam.name}
                        </Text>

                        <Text
                          variant="bodyMedium"
                          style={styles.examSub}
                        >
                          {entryData.section.class.displayName ||
                            `Class ${entryData.section.class.classNumber}`}{" "}
                          •{" "}
                          {entryData.section.sectionName}
                        </Text>

                        <Text
                          variant="bodyMedium"
                          style={styles.examSub}
                        >
                          {entryData.subject.name}
                        </Text>
                      </View>

                      <Chip icon="check-decagram">
                        Max{" "}
                        {entryData.examSubject.maxMarks}
                      </Chip>
                    </View>

                    <Divider
                      style={styles.divider}
                    />

                    <View style={styles.statsRow}>
                      <Stat
                        label="Students"
                        value={statistics.total}
                      />

                      <Stat
                        label="Entered"
                        value={statistics.entered}
                      />

                      <Stat
                        label="Remaining"
                        value={statistics.remaining}
                      />

                      <Stat
                        label="Absent"
                        value={statistics.absent}
                      />
                    </View>
                  </Card.Content>
                </Card>

                {/* Search */}
                <TextInput
                  mode="outlined"
                  placeholder="Search student..."
                  value={search}
                  onChangeText={setSearch}
                  left={
                    <TextInput.Icon icon="magnify" />
                  }
                  right={
                    search ? (
                      <TextInput.Icon
                        icon="close"
                        onPress={() => setSearch("")}
                      />
                    ) : undefined
                  }
                  style={styles.search}
                />

                {/* Quick actions */}
                <View style={styles.quickActions}>
                  <Button
                    mode="outlined"
                    icon="account-cancel"
                    onPress={markAllAbsent}
                  >
                    Mark All Absent
                  </Button>

                  <Button
                    mode="outlined"
                    icon="eraser"
                    onPress={clearAllMarks}
                  >
                    Clear
                  </Button>
                </View>

                {entryData.students.some(
                  (student: any) =>
                    student.isFinalized
                ) && (
                  <Card style={styles.warningCard}>
                    <Card.Content>
                      <View
                        style={styles.warningRow}
                      >
                        <IconButton
                          icon="lock"
                          size={20}
                        />

                        <Text style={styles.warningText}>
                          Some marks have already been
                          finalized and cannot be edited.
                        </Text>
                      </View>
                    </Card.Content>
                  </Card>
                )}
              </>
            )}

            {!loadingEntry &&
              !entryData &&
              selectedClassId &&
              selectedSectionId &&
              selectedSubjectId &&
              selectedExamId && (
                <Card style={styles.emptyCard}>
                  <Card.Content>
                    <Text
                      variant="titleMedium"
                      style={styles.emptyTitle}
                    >
                      No marks data
                    </Text>

                    <Text
                      variant="bodyMedium"
                      style={styles.emptyText}
                    >
                      Unable to load students for the
                      selected combination.
                    </Text>

                    <Button
                      mode="contained"
                      onPress={loadEntry}
                      style={styles.retryButton}
                    >
                      Retry
                    </Button>
                  </Card.Content>
                </Card>
              )}
          </>
        }
        renderItem={({ item }) => {
          const student = item as any;

          const current = marks[
            student.studentId
          ] || {
            value: "",
            absent: false,
          };

          const finalized =
            Boolean(student.isFinalized);

          return (
            <Card style={styles.studentCard}>
              <Card.Content>
                <View style={styles.studentRow}>
                  {/* Student avatar */}
                  {student.photoUrl ? (
                    <Avatar.Image
                      size={46}
                      source={{
                        uri: student.photoUrl,
                      }}
                    />
                  ) : (
                    <Avatar.Text
                      size={46}
                      label={getInitials(
                        student.name
                      )}
                    />
                  )}

                  {/* Student information */}
                  <View
                    style={styles.studentInfo}
                  >
                    <Text
                      variant="titleSmall"
                      numberOfLines={1}
                    >
                      {student.name}
                    </Text>

                    <Text
                      variant="bodySmall"
                      style={{
                        color:
                          theme.colors
                            .onSurfaceVariant,
                      }}
                    >
                      {student.admissionNo}
                      {student.rollNumber
                        ? ` • Roll ${student.rollNumber}`
                        : ""}
                    </Text>

                    {student.fatherName && (
                      <Text
                        variant="bodySmall"
                        numberOfLines={1}
                        style={{
                          color:
                            theme.colors
                              .onSurfaceVariant,
                        }}
                      >
                        Father:{" "}
                        {student.fatherName}
                      </Text>
                    )}
                  </View>

                  {/* Absent */}
                  <Chip
                    compact
                    icon={
                      current.absent
                        ? "account-cancel"
                        : "account-check"
                    }
                    selected={current.absent}
                    disabled={finalized}
                    onPress={() =>
                      toggleAbsent(
                        student.studentId
                      )
                    }
                    style={
                      current.absent
                        ? styles.absentChip
                        : styles.presentChip
                    }
                  >
                    {current.absent
                      ? "AB"
                      : "Present"}
                  </Chip>
                </View>

                <View style={styles.markRow}>
                  <Text
                    variant="bodyMedium"
                    style={styles.markLabel}
                  >
                    Marks
                  </Text>

                  <TextInput
                    mode="outlined"
                    value={
                      current.absent
                        ? "0"
                        : current.value
                    }
                    onChangeText={(value) =>
                      updateMark(
                        student.studentId,
                        value
                      )
                    }
                    keyboardType="decimal-pad"
                    disabled={
                      finalized ||
                      current.absent
                    }
                    placeholder={`0 - ${entryData?.examSubject.maxMarks ?? ""}`}
                    style={styles.markInput}
                    dense
                  />

                  <Text
                    variant="bodySmall"
                    style={styles.maxText}
                  >
                    /{" "}
                    {entryData?.examSubject.maxMarks}
                  </Text>

                  {finalized && (
                    <Chip
                      compact
                      icon="lock"
                    >
                      Final
                    </Chip>
                  )}
                </View>
              </Card.Content>
            </Card>
          );
        }}
        ListEmptyComponent={
          !loadingEntry &&
          entryData &&
          selectedClassId &&
          selectedSectionId &&
          selectedSubjectId &&
          selectedExamId ? (
            <View style={styles.noStudents}>
              <Avatar.Icon
                size={64}
                icon="account-search"
              />

              <Text
                variant="titleMedium"
                style={styles.noStudentsTitle}
              >
                No students found
              </Text>

              <Text
                variant="bodyMedium"
                style={styles.noStudentsText}
              >
                Try changing the search text.
              </Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          entryData ? (
            <View style={styles.footer}>
              <Button
                mode="outlined"
                icon="content-save-outline"
                loading={saving}
                disabled={
                  saving ||
                  !hasChanges ||
                  entryData.students.some(
                    (student: any) =>
                      student.isFinalized
                  )
                }
                onPress={saveDraft}
                style={styles.footerButton}
              >
                Save Draft
              </Button>

              <Button
                mode="contained"
                icon="check-circle"
                loading={saving}
                disabled={
                  saving ||
                  entryData.students.some(
                    (student: any) =>
                      student.isFinalized
                  )
                }
                onPress={finalizeMarks}
                style={styles.footerButton}
              >
                Finalize
              </Button>
            </View>
          ) : null
        }
      />
    </View>
  );
};

/**
 * Small statistics component.
 */
const Stat = ({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) => {
  return (
    <View style={styles.stat}>
      <Text
        variant="titleMedium"
        style={styles.statValue}
      >
        {value}
      </Text>

      <Text
        variant="bodySmall"
        style={styles.statLabel}
      >
        {label}
      </Text>
    </View>
  );
};

const getInitials = (name?: string) => {
  if (!name) return "?";

  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 1) {
    return parts[0]
      .substring(0, 2)
      .toUpperCase();
  }

  return (
    parts[0][0] +
    parts[parts.length - 1][0]
  ).toUpperCase();
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },

  loadingText: {
    marginTop: 8,
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
    marginLeft: 2,
  },

  headerTitle: {
    fontWeight: "700",
  },

  content: {
    paddingHorizontal: 14,
    paddingBottom: 40,
  },

  card: {
    marginBottom: 12,
    borderRadius: 16,
  },

  sectionTitle: {
    fontWeight: "700",
    marginBottom: 12,
  },

  selector: {
    marginBottom: 10,
    borderRadius: 10,
  },

  selectorContent: {
    justifyContent: "flex-start",
  },

  entryLoading: {
    paddingVertical: 24,
    alignItems: "center",
    gap: 10,
  },

  examHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  examName: {
    fontWeight: "700",
  },

  examSub: {
    marginTop: 3,
  },

  divider: {
    marginVertical: 14,
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  stat: {
    alignItems: "center",
    minWidth: 65,
  },

  statValue: {
    fontWeight: "700",
  },

  statLabel: {
    marginTop: 2,
  },

  search: {
    marginBottom: 10,
  },

  quickActions: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },

  warningCard: {
    marginBottom: 12,
    borderRadius: 14,
  },

  warningRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  warningText: {
    flex: 1,
  },

  studentCard: {
    marginBottom: 10,
    borderRadius: 14,
  },

  studentRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  studentInfo: {
    flex: 1,
    marginLeft: 10,
    marginRight: 8,
  },

  absentChip: {
    minWidth: 52,
  },

  presentChip: {
    minWidth: 70,
  },

  markRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },

  markLabel: {
    width: 55,
    fontWeight: "600",
  },

  markInput: {
    width: 100,
    height: 44,
    textAlign: "center",
  },

  maxText: {
    marginLeft: 6,
    marginRight: 10,
  },

  emptyCard: {
    marginTop: 12,
    borderRadius: 16,
  },

  emptyTitle: {
    fontWeight: "700",
  },

  emptyText: {
    marginTop: 6,
  },

  retryButton: {
    marginTop: 14,
  },

  noStudents: {
    alignItems: "center",
    paddingVertical: 40,
  },

  noStudentsTitle: {
    marginTop: 12,
    fontWeight: "700",
  },

  noStudentsText: {
    marginTop: 5,
  },

  footer: {
    flexDirection: "row",
    gap: 10,
    paddingTop: 14,
    paddingBottom: 20,
  },

  footerButton: {
    flex: 1,
    borderRadius: 10,
  },
});

export default TeacherMarksEntryScreen;