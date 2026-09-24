import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Avatar,
  Button,
  Card,
  Chip,
  Divider,
  IconButton,
  Modal,
  Portal,
  Searchbar,
  Snackbar,
  Text,
  TextInput,
} from "react-native-paper";
import {
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  View,
  Alert,
} from "react-native";
import { useMutation, useQuery } from "react-query";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { classServices } from "../services/classServices";
import { academicYearServices } from "../services/academicYearServices";
import {
  sectionServices,
  Section,
  GetClassTeacherAssignmentsResponse,
} from "../services/sectionServices";
import { RootStackParamList, RootStackScreenNames } from "../types";

type AcademicYear = {
  id: string;
  name: string;
  isCurrent?: boolean;
  startDate?: string;
  endDate?: string;
};

type SchoolClass = {
  id: string;
  classNumber: string;
  displayName?: string;
  academicYearId?: string;
};

type AvailableTeacher = {
  id: string;
  name: string;
  email?: string;
  employeeId?: string;
};

type ManagedSection = Section & {
  class?: {
    id: string;
    classNumber: string;
    displayName?: string;
    academicYearId?: string;
  };
};

const getErrorMessage = (error: any, fallback: string) =>
  error?.response?.data?.message ?? error?.message ?? fallback;

const normalizeYears = (response: any): AcademicYear[] => {
  const values =
    response?.academicYears ??
    response?.years ??
    response?.data ??
    (Array.isArray(response) ? response : []);

  return Array.isArray(values)
    ? values.map((item: any) => ({
        id: String(item.id),
        name: String(item.name ?? item.displayName ?? item.title ?? item.id),
        isCurrent: Boolean(item.isCurrent),
        startDate: item.startDate,
        endDate: item.endDate,
      }))
    : [];
};

const normalizeClasses = (response: any): SchoolClass[] => {
  const values =
    response?.classes ??
    response?.data ??
    (Array.isArray(response) ? response : []);

  return Array.isArray(values)
    ? values.map((item: any) => ({
        id: String(item.id),
        classNumber: String(item.classNumber ?? ""),
        displayName: item.displayName,
        academicYearId: item.academicYearId,
      }))
    : [];
};

const SectionManagementScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [selectedYearId, setSelectedYearId] = useState("");
  const [search, setSearch] = useState("");
  const [createVisible, setCreateVisible] = useState(false);
  const [copyVisible, setCopyVisible] = useState(false);
  const [yearPickerVisible, setYearPickerVisible] = useState(false);
  const [sourcePickerVisible, setSourcePickerVisible] = useState(false);
  const [classPickerVisible, setClassPickerVisible] = useState(false);
  const [sourceYearId, setSourceYearId] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");
  const [sectionName, setSectionName] = useState("");
  const [formError, setFormError] = useState("");
  const [snackbar, setSnackbar] = useState("");
  const [teacherModalVisible, setTeacherModalVisible] = useState(false);
  const [selectedSection, setSelectedSection] = useState<ManagedSection | null>(null);
  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [teacherSearch, setTeacherSearch] = useState("");

  const yearsQuery = useQuery(
    ["section-management-years"],
    () => academicYearServices.getAcademicYears(),
    {
      retry: 1,
      onSuccess: (response: any) => {
        const years = normalizeYears(response);
        if (!selectedYearId && years.length) {
          setSelectedYearId(
            years.find((year) => year.isCurrent)?.id ?? years[0].id
          );
        }
      },
    }
  );

  const years = useMemo(
    () => normalizeYears(yearsQuery.data),
    [yearsQuery.data]
  );

  const selectedYear = years.find((year) => year.id === selectedYearId);

  const classesQuery = useQuery(
    ["section-management-classes", selectedYearId],
    () => classServices.getClassesByAcademicYear(selectedYearId),
    { enabled: Boolean(selectedYearId), retry: 1 }
  );

  const classes = useMemo(
    () => normalizeClasses(classesQuery.data),
    [classesQuery.data]
  );

  const sectionsQuery = useQuery<GetClassTeacherAssignmentsResponse>(
    ["section-management-sections", selectedYearId],
    () => sectionServices.getClassTeacherAssignments(selectedYearId),
    { enabled: Boolean(selectedYearId), retry: 1 }
  );

  const sections: ManagedSection[] =
    (sectionsQuery.data?.sections as ManagedSection[]) ?? [];

  const sectionIds = useMemo(
    () => sections.map((section) => String(section.id)),
    [sections]
  );

  const [deleteTarget, setDeleteTarget] =
  useState<ManagedSection | null>(null);

const [removeTarget, setRemoveTarget] =
  useState<ManagedSection | null>(null);

  const studentCountsQuery = useQuery<Record<string, number>>(
    ["section-management-student-counts", selectedYearId, sectionIds],
    async () => {
      const entries = await Promise.all(
        sectionIds.map(async (sectionId) => {
          try {
            const response = await sectionServices.getStudentsBySection(sectionId);
            const count = Array.isArray(response?.students)
              ? response.students.length
              : Number(response?.totalStudents ?? 0);

            return [sectionId, count] as const;
          } catch {
            const section = sections.find(
              (item) => String(item.id) === sectionId
            );

            return [sectionId, Number(section?.totalStudents ?? 0)] as const;
          }
        })
      );

      return entries.reduce<Record<string, number>>((result, [id, count]) => {
        result[id] = count;
        return result;
      }, {});
    },
    {
      enabled: Boolean(selectedYearId) && sectionIds.length > 0,
      retry: 1,
    }
  );

  const getStudentCount = (section: ManagedSection) =>
    studentCountsQuery.data?.[String(section.id)] ??
    Number(section.totalStudents ?? 0);

  const filteredSections = useMemo(() => {
    const value = search.trim().toLowerCase();
    if (!value) return sections;

    return sections.filter((section) => {
      const classNumber = section.class?.classNumber?.toLowerCase() ?? "";
      const displayName = section.class?.displayName?.toLowerCase() ?? "";
      const sectionNameValue = section.sectionName?.toLowerCase() ?? "";
      const teacher = section.classTeacher?.name?.toLowerCase() ?? "";

      return (
        classNumber.includes(value) ||
        displayName.includes(value) ||
        sectionNameValue.includes(value) ||
        teacher.includes(value)
      );
    });
  }, [sections, search]);

  const assignedCount = sections.filter((item) => !!item.classTeacher).length;
  const studentCount = sections.reduce(
    (sum, item) => sum + getStudentCount(item),
    0
  );

  const teachersQuery = useQuery(
    ["section-management-available-teachers", selectedYearId],
    () => sectionServices.getAvailableClassTeachers(),
    { enabled: teacherModalVisible && Boolean(selectedYearId), retry: 1 }
  );

  const availableTeachers: AvailableTeacher[] = useMemo(() => {
    const response: any = teachersQuery.data;
    const values =
      response?.teachers ??
      response?.availableTeachers ??
      response?.data ??
      (Array.isArray(response) ? response : []);

    return Array.isArray(values)
      ? values.map((teacher: any) => ({
          id: String(teacher.id ?? teacher.teacherId ?? teacher.userId),
          name: String(
            teacher.name ??
              teacher.fullName ??
              teacher.teacherName ??
              "Unnamed teacher"
          ),
          email: teacher.email,
          employeeId: teacher.employeeId,
        }))
      : [];
  }, [teachersQuery.data]);

  const filteredTeachers = useMemo(() => {
    const value = teacherSearch.trim().toLowerCase();
    if (!value) return availableTeachers;

    return availableTeachers.filter(
      (teacher) =>
        teacher.name.toLowerCase().includes(value) ||
        teacher.email?.toLowerCase().includes(value) ||
        teacher.employeeId?.toLowerCase().includes(value)
    );
  }, [availableTeachers, teacherSearch]);

  const openTeacherModal = (section: ManagedSection) => {
    setSelectedSection(section);
    setSelectedTeacherId(
      String(
        (section.classTeacher as any)?.teacherId ??
          (section.classTeacher as any)?.id ??
          ""
      )
    );
    setTeacherSearch("");
    setFormError("");
    setTeacherModalVisible(true);
  };

  const closeTeacherModal = () => {
    if (!assignTeacherMutation.isLoading && !removeTeacherMutation.isLoading && !deleteSectionMutation.isLoading) {
      setTeacherModalVisible(false);
      setSelectedSection(null);
      setSelectedTeacherId("");
      setTeacherSearch("");
      setFormError("");
    }
  };

  const assignTeacherMutation = useMutation(
    (payload: { sectionId: string; teacherUserId: string }) =>
      (sectionServices.assignClassTeacher as any)(payload),
    {
      onSuccess: (response: any) => {
        setSnackbar(response?.message ?? "Class teacher assigned successfully.");
        closeTeacherModal();
        sectionsQuery.refetch();
        studentCountsQuery.refetch();
      },
      onError: (error) => {
        const message = getErrorMessage(
          error,
          "Unable to assign class teacher."
        );
        setFormError(message);
        setSnackbar(message);
      },
    }
  );

  const removeTeacherMutation = useMutation(
    (payload: { sectionId: string }) =>
      (sectionServices.removeClassTeacher as any)(payload),
    {
      onSuccess: (response: any) => {
        setSnackbar(response?.message ?? "Class teacher removed successfully.");
        closeTeacherModal();
        sectionsQuery.refetch();
        studentCountsQuery.refetch();
      },
      onError: (error) => {
        const message = getErrorMessage(
          error,
          "Unable to remove class teacher."
        );
        setFormError(message);
        setSnackbar(message);
      },
    }
  );

  const deleteSectionMutation = useMutation(
    (sectionId: string) => sectionServices.deleteSection(sectionId),
    {
      onSuccess: (response: any) => {
        setSnackbar(response?.message ?? "Section deleted successfully.");
        sectionsQuery.refetch();
        studentCountsQuery.refetch();
      },
      onError: (error) => {
        const message = getErrorMessage(error, "Unable to delete section.");
        setFormError(message);
        setSnackbar(message);
      },
    }
  );

  // const confirmDeleteSection = (section: ManagedSection) => {
  //   Alert.alert(
  //     "Delete section",
  //     `Are you sure you want to permanently delete ${section.sectionName}? This action cannot be undone.`,
  //     [
  //       { text: "Cancel", style: "cancel" },
  //       {
  //         text: "Delete",
  //         style: "destructive",
  //         onPress: () => deleteSectionMutation.mutate(String(section.id)),
  //       },
  //     ]
  //   );
  // };
  
  const confirmDeleteSection = (section: ManagedSection) => {
  setDeleteTarget(section);
};
  
  const submitTeacherAssignment = () => {
    if (!selectedSection?.id) return;

    if (!selectedTeacherId) {
      setFormError("Select a teacher.");
      return;
    }

    assignTeacherMutation.mutate({
      sectionId: String(selectedSection.id),
      teacherUserId: selectedTeacherId,
    });
  };

  const confirmRemoveTeacher = () => {
    if (!selectedSection?.id) return;

    Alert.alert(
      "Remove class teacher",
      "Are you sure you want to remove the current class teacher?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () =>
            removeTeacherMutation.mutate({
              sectionId: String(selectedSection.id),
            }),
        },
      ]
    );
  };

  const createMutation = useMutation(
    (payload: { classId: string; sectionName: string }) =>
      sectionServices.createSection(payload),
    {
      onSuccess: (response) => {
        setCreateVisible(false);
        setSectionName("");
        setSelectedClassId("");
        setFormError("");
        setSnackbar(response.message ?? "Section created successfully.");
        sectionsQuery.refetch();
      },
      onError: (error) =>
        setFormError(getErrorMessage(error, "Unable to create section.")),
    }
  );

  const copyMutation = useMutation(
    (payload: { fromAcademicYearId: string; toAcademicYearId: string }) =>
      sectionServices.copySectionsToAcademicYear(payload),
    {
      onSuccess: (response) => {
        setCopyVisible(false);
        setSourceYearId("");
        setFormError("");
        setSnackbar(
          `${response.message ?? "Sections copied."} Created: ${
            response.createdCount
          }, skipped: ${response.skippedCount}.`
        );
        sectionsQuery.refetch();
      },
      onError: (error) =>
        setFormError(getErrorMessage(error, "Unable to copy sections.")),
    }
  );

  const openCreate = () => {
    setFormError("");
    setSectionName("");
    setSelectedClassId("");
    setCreateVisible(true);
  };

  const confirmRemoveTeacherFor = (section: ManagedSection) => {
  setRemoveTarget(section);
};

  const submitCreate = () => {
    const name = sectionName.trim();

    if (!selectedClassId) {
      setFormError("Select a class.");
      return;
    }

    if (!name) {
      setFormError("Enter a section name.");
      return;
    }

    if (name.length > 50) {
      setFormError("Section name cannot exceed 50 characters.");
      return;
    }

    const duplicate = sections.some(
      (item) =>
        item.classId === selectedClassId &&
        item.sectionName.trim().toLowerCase() === name.toLowerCase()
    );

    if (duplicate) {
      setFormError("This section already exists for the selected class.");
      return;
    }

    createMutation.mutate({ classId: selectedClassId, sectionName: name });
  };

  const submitCopy = () => {
    if (!sourceYearId) {
      setFormError("Select a source academic year.");
      return;
    }

    if (!selectedYearId || sourceYearId === selectedYearId) {
      setFormError("Source and target academic years must be different.");
      return;
    }

    Alert.alert(
      "Copy sections",
      `Copy sections from ${
        years.find((year) => year.id === sourceYearId)?.name ?? "source year"
      } to ${selectedYear?.name ?? "target year"}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Copy",
          onPress: () => {
            setFormError("");
            copyMutation.mutate({
              fromAcademicYearId: sourceYearId,
              toAcademicYearId: selectedYearId,
            });
          },
        },
      ]
    );
  };

  const selectedClass = classes.find((item) => item.id === selectedClassId);

  if (yearsQuery.isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.muted}>Loading academic years...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredSections}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={sectionsQuery.isFetching || classesQuery.isFetching}
            onRefresh={() => {
              sectionsQuery.refetch();
              classesQuery.refetch();
              studentCountsQuery.refetch();
            }}
          />
        }
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View>
            <View style={styles.headerRow}>
              <View style={styles.headerText}>
                <Text style={styles.title}>Section Management</Text>
                <Text style={styles.muted}>
                  Manage sections for each academic year.
                </Text>
              </View>
              <IconButton
                icon="refresh"
                onPress={() => {
                  sectionsQuery.refetch();
                  classesQuery.refetch();
                }}
              />
            </View>

            <Text style={styles.label}>Academic year</Text>
            <TouchableOpacity
              style={styles.selector}
              onPress={() => setYearPickerVisible(true)}
            >
              <Text style={styles.selectorText}>
                {selectedYear?.name ?? "Select academic year"}
              </Text>
              <IconButton icon="chevron-down" size={20} />
            </TouchableOpacity>

            <View style={styles.actionsRow}>
              <Button
                mode="contained"
                icon="plus"
                onPress={openCreate}
                style={styles.actionButton}
              >
                Create section
              </Button>
              <Button
                mode="outlined"
                icon="content-copy"
                onPress={() => {
                  setFormError("");
                  setCopyVisible(true);
                }}
                style={styles.actionButton}
              >
                Copy
              </Button>
            </View>

            <View style={styles.statsRow}>
              <Card style={styles.statCard}>
                <Card.Content>
                  <Text style={styles.statValue}>{sections.length}</Text>
                  <Text style={styles.statLabel}>Sections</Text>
                </Card.Content>
              </Card>
              <Card style={styles.statCard}>
                <Card.Content>
                  <Text style={styles.statValue}>{assignedCount}</Text>
                  <Text style={styles.statLabel}>Assigned</Text>
                </Card.Content>
              </Card>
              <Card style={styles.statCard}>
                <Card.Content>
                  <Text style={styles.statValue}>{studentCount}</Text>
                  <Text style={styles.statLabel}>Students</Text>
                </Card.Content>
              </Card>
            </View>

            <Searchbar
              placeholder="Search class, section, or teacher"
              value={search}
              onChangeText={setSearch}
              style={styles.search}
            />

            {sectionsQuery.isError && (
              <Card style={styles.errorCard}>
                <Card.Content>
                  <Text style={styles.errorText}>
                    {getErrorMessage(
                      sectionsQuery.error,
                      "Unable to load sections."
                    )}
                  </Text>
                  <Button onPress={() => sectionsQuery.refetch()}>
                    Retry
                  </Button>
                </Card.Content>
              </Card>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <Card style={styles.sectionCard}>
            <Card.Content>
              <View style={styles.sectionRow}>
                <Avatar.Text
                  size={48}
                  label={item.sectionName.slice(0, 2).toUpperCase()}
                />

                <View style={styles.sectionDetails}>
                  <Text style={styles.sectionTitle}>
                    {item.class?.displayName ??
                      `Class ${item.class?.classNumber ?? ""}`}{" "}
                    - {item.sectionName}
                  </Text>

                  <Text style={styles.muted}>
                    Students: {getStudentCount(item)}
                  </Text>

                  <View style={styles.teacherSummary}>
                    <Avatar.Icon
                      size={30}
                      icon={item.classTeacher ? "account-check" : "account-plus"}
                      color={item.classTeacher ? "#15803D" : "#B45309"}
                      style={{
                        backgroundColor: item.classTeacher ? "#DCFCE7" : "#FEF3C7",
                      }}
                    />
                    <View style={styles.teacherSummaryText}>
                      <Text style={styles.teacherLabel}>Class teacher</Text>
                      <Text style={styles.teacherName}>
                        {item.classTeacher?.name ?? "Not assigned"}
                      </Text>
                    </View>
                  </View>
                </View>

                <Chip
                  compact
                  mode="outlined"
                  textStyle={{
                    color: item.classTeacher ? "#15803D" : "#B45309",
                  }}
                >
                  {item.classTeacher ? "Assigned" : "Unassigned"}
                </Chip>
              </View>

              <Divider style={styles.cardDivider} />

              <View style={styles.cardActions}>
                <Button
                  mode={item.classTeacher ? "outlined" : "contained"}
                  icon={item.classTeacher ? "account-edit" : "account-plus"}
                  onPress={() => openTeacherModal(item)}
                  compact
                >
                  {item.classTeacher ? "Change teacher" : "Assign teacher"}
                </Button>

                {/* {item.classTeacher && (
                  <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel={`Remove class teacher from ${item.sectionName}`}
                    activeOpacity={0.7}
                    disabled={
                      removeTeacherMutation.isLoading ||
                      assignTeacherMutation.isLoading
                    }
                    onPress={() => confirmRemoveTeacherFor(item)}
                    style={[
                      styles.removeButton,
                      (removeTeacherMutation.isLoading ||
                        assignTeacherMutation.isLoading) &&
                        styles.disabledAction,
                    ]}
                  >
                    <Text style={styles.removeButtonIcon}>✕</Text>
                    <Text style={styles.removeButtonText}>Remove</Text>
                  </TouchableOpacity>
                )} */}

                {item.classTeacher && (
  <Pressable
    accessibilityRole="button"
    accessibilityLabel={`Remove class teacher from ${item.sectionName}`}
    disabled={
      removeTeacherMutation.isLoading ||
      assignTeacherMutation.isLoading
    }
    onPress={() => confirmRemoveTeacherFor(item)}
    style={({ pressed }) => [
      styles.removeButton,
      pressed && styles.pressedButton,
      (removeTeacherMutation.isLoading ||
        assignTeacherMutation.isLoading) &&
        styles.disabledAction,
    ]}
  >
    <Text style={styles.removeButtonIcon}>✕</Text>
    <Text style={styles.removeButtonText}>Remove</Text>
  </Pressable>
)}

                <Button
                  mode="text"
                  icon="account-group"
                  onPress={() =>
                    navigation.navigate(
                      RootStackScreenNames.PrincipalClassStudents,
                      { sectionId: String(item.id) }
                    )
                  }
                  compact
                >
                  Students
                </Button>

                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel={`Delete section ${item.sectionName}`}
                  activeOpacity={0.7}
                  disabled={
                    deleteSectionMutation.isLoading ||
                    removeTeacherMutation.isLoading ||
                    assignTeacherMutation.isLoading
                  }
                  onPress={() => confirmDeleteSection(item)}
                  style={[
                    styles.deleteButton,
                    deleteSectionMutation.isLoading && styles.disabledAction,
                  ]}
                >
                  <Text style={styles.deleteButtonIcon}>✕</Text>
                  <Text style={styles.deleteButtonText}>Delete section</Text>
                </TouchableOpacity>
              </View>
            </Card.Content>
          </Card>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            {sectionsQuery.isFetching ? (
              <ActivityIndicator />
            ) : (
              <Text style={styles.muted}>
                No sections found for this academic year.
              </Text>
            )}
          </View>
        }
      />

      <Portal>
        <Modal
          visible={yearPickerVisible}
          onDismiss={() => setYearPickerVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <Text style={styles.modalTitle}>Select academic year</Text>
          <ScrollView>
            {years.map((year) => (
              <TouchableOpacity
                key={year.id}
                style={styles.option}
                onPress={() => {
                  setSelectedYearId(year.id);
                  setYearPickerVisible(false);
                  setSearch("");
                }}
              >
                <Text style={styles.optionText}>{year.name}</Text>
                {year.isCurrent && <Chip compact>Current</Chip>}
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Button onPress={() => setYearPickerVisible(false)}>Close</Button>
        </Modal>

        <Modal
          visible={createVisible}
          onDismiss={() => !createMutation.isLoading && setCreateVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <Text style={styles.modalTitle}>Create section</Text>
          <Text style={styles.muted}>
            Academic year: {selectedYear?.name ?? "Not selected"}
          </Text>

          <Text style={styles.label}>Class</Text>
          <TouchableOpacity
            style={styles.selector}
            onPress={() => setClassPickerVisible((value) => !value)}
          >
            <Text style={styles.selectorText}>
              {selectedClass?.displayName ??
                (selectedClass
                  ? `Class ${selectedClass.classNumber}`
                  : "Select class")}
            </Text>
            <IconButton icon="chevron-down" size={20} />
          </TouchableOpacity>

          {classPickerVisible && (
            <View style={styles.dropdown}>
              <ScrollView style={styles.dropdownScroll}>
                {classes.map((schoolClass) => (
                  <TouchableOpacity
                    key={schoolClass.id}
                    style={styles.option}
                    onPress={() => {
                      setSelectedClassId(schoolClass.id);
                      setClassPickerVisible(false);
                    }}
                  >
                    <Text style={styles.optionText}>
                      {schoolClass.displayName ??
                        `Class ${schoolClass.classNumber}`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          <TextInput
            mode="outlined"
            label="Section name"
            placeholder="Example: A"
            value={sectionName}
            onChangeText={setSectionName}
            maxLength={50}
            style={styles.input}
          />

          {!!formError && <Text style={styles.errorText}>{formError}</Text>}

          <View style={styles.modalActions}>
            <Button
              onPress={() => setCreateVisible(false)}
              disabled={createMutation.isLoading}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={submitCreate}
              loading={createMutation.isLoading}
              disabled={createMutation.isLoading}
            >
              Create
            </Button>
          </View>
        </Modal>

        <Modal
          visible={copyVisible}
          onDismiss={() => !copyMutation.isLoading && setCopyVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <Text style={styles.modalTitle}>Copy sections</Text>
          <Text style={styles.muted}>
            Target academic year: {selectedYear?.name ?? "Not selected"}
          </Text>

          <Text style={styles.label}>Source academic year</Text>
          <TouchableOpacity
            style={styles.selector}
            onPress={() => setSourcePickerVisible((value) => !value)}
          >
            <Text style={styles.selectorText}>
              {years.find((year) => year.id === sourceYearId)?.name ??
                "Select source year"}
            </Text>
            <IconButton icon="chevron-down" size={20} />
          </TouchableOpacity>

          {sourcePickerVisible && (
            <View style={styles.dropdown}>
              <ScrollView style={styles.dropdownScroll}>
                {years
                  .filter((year) => year.id !== selectedYearId)
                  .map((year) => (
                    <TouchableOpacity
                      key={year.id}
                      style={styles.option}
                      onPress={() => {
                        setSourceYearId(year.id);
                        setSourcePickerVisible(false);
                      }}
                    >
                      <Text style={styles.optionText}>{year.name}</Text>
                    </TouchableOpacity>
                  ))}
              </ScrollView>
            </View>
          )}

          {!!formError && <Text style={styles.errorText}>{formError}</Text>}

          <View style={styles.modalActions}>
            <Button
              onPress={() => setCopyVisible(false)}
              disabled={copyMutation.isLoading}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={submitCopy}
              loading={copyMutation.isLoading}
              disabled={copyMutation.isLoading}
            >
              Copy sections
            </Button>
          </View>
        </Modal>

        <Modal
          visible={teacherModalVisible}
          onDismiss={closeTeacherModal}
          contentContainerStyle={styles.modal}
        >
          <Text style={styles.modalTitle}>
            {selectedSection?.classTeacher ? "Change class teacher" : "Assign class teacher"}
          </Text>

          <Text style={styles.muted}>
            {selectedSection?.class?.displayName ??
              `Class ${selectedSection?.class?.classNumber ?? ""}`}{" "}
            - {selectedSection?.sectionName ?? ""}
          </Text>

          <Searchbar
            placeholder="Search teachers"
            value={teacherSearch}
            onChangeText={setTeacherSearch}
            style={styles.teacherSearch}
          />

          {teachersQuery.isLoading ? (
            <View style={styles.teacherLoading}>
              <ActivityIndicator />
              <Text style={styles.muted}>Loading available teachers...</Text>
            </View>
          ) : (
            <ScrollView style={styles.teacherList}>
              {filteredTeachers.map((teacher) => (
                <TouchableOpacity
                  key={teacher.id}
                  style={[
                    styles.teacherOption,
                    selectedTeacherId === teacher.id && styles.teacherOptionSelected,
                  ]}
                  onPress={() => setSelectedTeacherId(teacher.id)}
                >
                  <Avatar.Text
                    size={40}
                    label={teacher.name.slice(0, 2).toUpperCase()}
                  />
                  <View style={styles.teacherOptionText}>
                    <Text style={styles.teacherOptionName}>{teacher.name}</Text>
                    {!!teacher.employeeId && (
                      <Text style={styles.muted}>{teacher.employeeId}</Text>
                    )}
                    {!!teacher.email && (
                      <Text style={styles.muted}>{teacher.email}</Text>
                    )}
                  </View>
                  {selectedTeacherId === teacher.id && (
                    <IconButton icon="check-circle" iconColor="#16A34A" />
                  )}
                </TouchableOpacity>
              ))}

              {!filteredTeachers.length && (
                <Text style={styles.muted}>No available teachers found.</Text>
              )}
            </ScrollView>
          )}

          {!!formError && <Text style={styles.errorText}>{formError}</Text>}

          <View style={styles.modalActions}>
            {selectedSection?.classTeacher && (
              <Button
                mode="text"
                textColor="#B42318"
                onPress={confirmRemoveTeacher}
                disabled={removeTeacherMutation.isLoading || assignTeacherMutation.isLoading}
              >
                Remove
              </Button>
            )}

            <Button
              onPress={closeTeacherModal}
              disabled={removeTeacherMutation.isLoading || assignTeacherMutation.isLoading}
            >
              Cancel
            </Button>

            <Button
              mode="contained"
              onPress={submitTeacherAssignment}
              loading={assignTeacherMutation.isLoading}
              disabled={assignTeacherMutation.isLoading || removeTeacherMutation.isLoading}
            >
              Save
            </Button>
          </View>
        </Modal>
      </Portal>

      <Modal
        visible={!!removeTarget || !!deleteTarget}
        onDismiss={() => {
          setRemoveTarget(null);
          setDeleteTarget(null);
        }}
>
  <View style={styles.confirmOverlay}>
    <View style={styles.confirmCard}>
      <Text style={styles.confirmTitle}>
        {deleteTarget
          ? "Delete section"
          : "Remove class teacher"}
      </Text>

      <Text style={styles.confirmMessage}>
        {deleteTarget
          ? `Are you sure you want to permanently delete ${deleteTarget.sectionName}? This action cannot be undone.`
          : `Are you sure you want to remove the class teacher from ${removeTarget?.sectionName}?`}
      </Text>

      <View style={styles.confirmActions}>
        <Pressable
          style={styles.cancelButton}
          onPress={() => {
            setRemoveTarget(null);
            setDeleteTarget(null);
          }}
        >
          <Text style={styles.cancelButtonText}>
            Cancel
          </Text>
        </Pressable>

        <Pressable
          style={styles.confirmDeleteButton}
          disabled={
            deleteSectionMutation.isLoading ||
            removeTeacherMutation.isLoading
          }
          onPress={() => {
            if (deleteTarget) {
              deleteSectionMutation.mutate(
                String(deleteTarget.id)
              );
            }

            if (removeTarget) {
              removeTeacherMutation.mutate({
                sectionId: String(removeTarget.id),
              });
            }

            setRemoveTarget(null);
            setDeleteTarget(null);
          }}
        >
          <Text style={styles.confirmDeleteButtonText}>
            {deleteTarget ? "Delete" : "Remove"}
          </Text>
        </Pressable>
      </View>
    </View>
  </View>
</Modal>

      <Snackbar
        visible={Boolean(snackbar)}
        onDismiss={() => setSnackbar("")}
        duration={3500}
      >
        {snackbar}
      </Snackbar>
    </View>

    
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8FA",
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#172033",
  },
  muted: {
    color: "#687386",
    marginTop: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#344054",
    marginTop: 16,
    marginBottom: 6,
  },
  selector: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: "#D0D5DD",
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: 14,
  },
  selectorText: {
    flex: 1,
    color: "#1D2939",
    fontSize: 15,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
  },
  statsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  statValue: {
    fontSize: 21,
    fontWeight: "700",
    color: "#172033",
  },
  statLabel: {
    fontSize: 12,
    color: "#687386",
    marginTop: 3,
  },
  search: {
    marginTop: 16,
    marginBottom: 12,
  },
  sectionCard: {
    marginBottom: 10,
    backgroundColor: "#FFFFFF",
  },
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionDetails: {
    flex: 1,
    marginLeft: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#172033",
  },
  teacherSummary: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  teacherSummaryText: {
    flex: 1,
    marginLeft: 8,
  },
  teacherLabel: {
    fontSize: 11,
    color: "#687386",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  teacherName: {
    fontSize: 14,
    color: "#172033",
    fontWeight: "600",
    marginTop: 2,
  },
  cardDivider: {
    marginTop: 14,
    marginBottom: 10,
  },
  cardActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    flexWrap: "wrap",
    gap: 4,
  },
  removeButton: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 40,
    paddingRight: 8,
    borderRadius: 8,
  },
  removeButtonIcon: {
    color: "#B42318",
    fontSize: 17,
    fontWeight: "800",
    marginRight: 5,
  },
  removeButtonText: {
    color: "#B42318",
    fontSize: 14,
    fontWeight: "700",
  },
  disabledAction: {
    opacity: 0.45,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 40,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  deleteButtonIcon: {
    color: "#B42318",
    fontSize: 17,
    fontWeight: "800",
    marginRight: 5,
  },
  deleteButtonText: {
    color: "#B42318",
    fontSize: 14,
    fontWeight: "700",
  },
  teacherSearch: {
    marginTop: 16,
    marginBottom: 8,
  },
  teacherList: {
    maxHeight: 300,
  },
  teacherLoading: {
    alignItems: "center",
    padding: 24,
  },
  teacherOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
    marginBottom: 6,
    backgroundColor: "#F8FAFC",
  },
  teacherOptionSelected: {
    backgroundColor: "#EEF2FF",
    borderWidth: 1,
    borderColor: "#818CF8",
  },
  teacherOptionText: {
    flex: 1,
    marginLeft: 10,
  },
  teacherOptionName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#172033",
  },
  empty: {
    alignItems: "center",
    padding: 32,
  },
  errorCard: {
    marginTop: 12,
    backgroundColor: "#FFF1F2",
  },
  errorText: {
    color: "#B42318",
    marginTop: 8,
    marginBottom: 8,
  },
  modal: {
    backgroundColor: "#FFFFFF",
    margin: 20,
    borderRadius: 14,
    padding: 20,
    maxHeight: "85%",
  },
  confirmOverlay: {
  flex: 1,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  justifyContent: "center",
  alignItems: "center",
  padding: 20,
},

confirmCard: {
  width: "100%",
  maxWidth: 420,
  backgroundColor: "#FFFFFF",
  borderRadius: 12,
  padding: 24,
  elevation: 6,
  shadowColor: "#000",
  shadowOpacity: 0.2,
  shadowRadius: 8,
  shadowOffset: {
    width: 0,
    height: 3,
  },
},

confirmTitle: {
  fontSize: 20,
  fontWeight: "700",
  color: "#1F2937",
  marginBottom: 12,
},

confirmMessage: {
  fontSize: 15,
  lineHeight: 22,
  color: "#4B5563",
  marginBottom: 24,
},

confirmActions: {
  flexDirection: "row",
  justifyContent: "flex-end",
  alignItems: "center",
  gap: 12,
},

cancelButton: {
  paddingVertical: 10,
  paddingHorizontal: 16,
  borderRadius: 8,
  backgroundColor: "#E5E7EB",
},

cancelButtonText: {
  color: "#374151",
  fontSize: 14,
  fontWeight: "600",
},

confirmDeleteButton: {
  paddingVertical: 10,
  paddingHorizontal: 18,
  borderRadius: 8,
  backgroundColor: "#DC2626",
},

confirmDeleteButtonText: {
  color: "#FFFFFF",
  fontSize: 14,
  fontWeight: "600",
},
  modalTitle: {
    fontSize: 21,
    fontWeight: "700",
    color: "#172033",
    marginBottom: 8,
  },
  input: {
    marginTop: 16,
    backgroundColor: "#FFFFFF",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 8,
    marginTop: 20,
  },
  option: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E4E7EC",
  },
  optionText: {
    fontSize: 15,
    color: "#1D2939",
  },
  dropdown: {
    borderWidth: 1,
    borderColor: "#D0D5DD",
    borderRadius: 8,
    marginTop: 6,
    backgroundColor: "#FFFFFF",
  },
  dropdownScroll: {
    maxHeight: 220,
  },
  pressedButton: {
  opacity: 0.65,
},
});

export default SectionManagementScreen;
