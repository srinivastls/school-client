import React, { useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import {
  ActivityIndicator,
  Avatar,
  Button,
  Card,
  Divider,
  IconButton,
  Searchbar,
  Snackbar,
} from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useMutation, useQuery, useQueryClient } from "react-query";

import { studentServices } from "../../services/studentServices";
import { sectionServices } from "../../services/sectionServices";
import { RootStackParamList, RootStackScreenNames } from "../../types";
import { useUserStore } from "../../store";
import { Colors, Metrics } from "../../theme";

type Navigation = NativeStackNavigationProp<RootStackParamList>;

type Props = {
  route: {
    params: {
      sectionId: string;
    };
  };
};

type Student = {
  id?: string;
  admissionNo: string;
  name: string;
};

type SectionTeacher = {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  employeeId?: string | null;
  designation?: string | null;
  role?: string;
};

type SectionResponse = {
  section?: {
    id: string;
    sectionName: string;
    classId: string;
    class?: {
      id: string;
      classNumber: string;
      displayName?: string;
      academicYearId?: string;
    };
    classTeacher?: SectionTeacher | null;
  };
  class?: {
    id: string;
    classNumber: string;
    displayName?: string;
    academicYearId?: string;
  };
  students?: Student[];
  totalStudents?: number;
};

type AvailableTeacher = {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  employeeId?: string | null;
  designation?: string | null;
  department?: string | null;
  role: string;
  assignedSections: number;
};

type AvailableTeachersResponse = {
  teachers: AvailableTeacher[];
};

const PrincipalClassStudentsScreen = ({ route }: Props) => {
  const navigation = useNavigation<Navigation>();
  const queryClient = useQueryClient();
  const { width } = useWindowDimensions();
  const user = useUserStore((state) => state.user);
  const logout = useUserStore((state) => state.logout);

  const { sectionId } = route.params;
  const isSmallScreen = width < 600;

  const [search, setSearch] = useState("");
  const [teacherModalVisible, setTeacherModalVisible] = useState(false);
  const [teacherSearch, setTeacherSearch] = useState("");
  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [snackbarText, setSnackbarText] = useState("");
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const showMessage = (message: string) => {
    setSnackbarText(message);
    setSnackbarVisible(true);
  };

  const sectionQuery = useQuery<SectionResponse>(
    ["principal-section-students", sectionId],
    () => sectionServices.getStudentsBySection(sectionId),
    {
      enabled: Boolean(sectionId),
      retry: 1,
    }
  );

  const classId = sectionQuery.data?.section?.classId ?? "";

  const classSectionsQuery = useQuery(
    ["principal-sections-by-class", classId],
    () => sectionServices.getSectionsByClass(classId),
    {
      enabled: Boolean(classId),
      retry: 1,
    }
  );

  const teachersQuery = useQuery<AvailableTeachersResponse>(
    ["available-class-teachers"],
    () => sectionServices.getAvailableClassTeachers(),
    {
      enabled: teacherModalVisible,
      retry: 1,
    }
  );

  const assignTeacherMutation = useMutation(
    (payload: { sectionId: string; teacherUserId: string }) =>
      sectionServices.assignClassTeacher(payload),
    {
      onSuccess: (response) => {
        setTeacherModalVisible(false);
        setSelectedTeacherId("");
        setTeacherSearch("");
        showMessage(response.message || "Class teacher assigned.");
        queryClient.invalidateQueries(["principal-section-students", sectionId]);
        queryClient.invalidateQueries(["principal-sections-by-class", classId]);
        queryClient.invalidateQueries(["available-class-teachers"]);
      },
      onError: (error: any) => {
        showMessage(
          error?.response?.data?.message ||
            "Unable to assign the class teacher."
        );
      },
    }
  );

  const removeTeacherMutation = useMutation(
    (payload: { sectionId: string }) =>
      sectionServices.removeClassTeacher(payload),
    {
      onSuccess: (response) => {
        showMessage(response.message || "Class teacher removed.");
        queryClient.invalidateQueries(["principal-section-students", sectionId]);
        queryClient.invalidateQueries(["principal-sections-by-class", classId]);
        queryClient.invalidateQueries(["available-class-teachers"]);
      },
      onError: (error: any) => {
        showMessage(
          error?.response?.data?.message ||
            "Unable to remove the class teacher."
        );
      },
    }
  );

  const section = sectionQuery.data?.section;
  const classDetails = section?.class ?? sectionQuery.data?.class;
  const students = sectionQuery.data?.students ?? [];
  const classNumber = classDetails?.classNumber ?? "Class";
  const sectionName = section?.sectionName ?? "Section";

  const assignedSection = useMemo(() => {
    const sections = classSectionsQuery.data?.sections ?? [];

    return sections.find(
      (item) => String(item.id) === String(sectionId)
    );
  }, [classSectionsQuery.data?.sections, sectionId]);

  const classTeacher =
    assignedSection?.classTeacher ?? section?.classTeacher ?? null;

  const filteredStudents = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return students;
    }

    return students.filter(
      (student) =>
        student.name?.toLowerCase().includes(value) ||
        student.admissionNo?.toLowerCase().includes(value)
    );
  }, [search, students]);

  const availableTeachers = useMemo(() => {
    const value = teacherSearch.trim().toLowerCase();
    const teachers = teachersQuery.data?.teachers ?? [];

    if (!value) {
      return teachers;
    }

    return teachers.filter((teacher) => {
      return (
        teacher.name?.toLowerCase().includes(value) ||
        teacher.email?.toLowerCase().includes(value) ||
        teacher.employeeId?.toLowerCase().includes(value) ||
        teacher.designation?.toLowerCase().includes(value)
      );
    });
  }, [teacherSearch, teachersQuery.data?.teachers]);

  const openTeacherModal = () => {
    setSelectedTeacherId(classTeacher?.id ?? "");
    setTeacherSearch("");
    setTeacherModalVisible(true);
  };

  const closeTeacherModal = () => {
    if (assignTeacherMutation.isLoading) {
      return;
    }

    setTeacherModalVisible(false);
    setTeacherSearch("");
    setSelectedTeacherId("");
  };

  const submitTeacherAssignment = () => {
    if (!selectedTeacherId) {
      showMessage("Please select a teacher.");
      return;
    }

    assignTeacherMutation.mutate({
      sectionId,
      teacherUserId: selectedTeacherId,
    });
  };

  const confirmRemoveTeacher = () => {
    if (!classTeacher?.id) {
      return;
    }

    removeTeacherMutation.mutate({ sectionId });
  };

  const openStudent = async (student: Student) => {
    try {
      const fullStudent = await studentServices.getStudentById({
        admissionNo: student.admissionNo,
      });

      navigation.navigate(RootStackScreenNames.StudentDetails, {
        student: fullStudent,
      } as never);
    } catch (error: any) {
      showMessage(
        error?.response?.data?.message ||
          "Unable to load student details."
      );
    }
  };

  const handleLogout = () => {
    logout();
    navigation.reset({
      index: 0,
      routes: [{ name: RootStackScreenNames.Login }],
    });
  };

  const renderStudent = ({ item }: { item: Student }) => (
    <Card style={styles.studentCard} mode="contained">
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => openStudent(item)}
        style={styles.studentRow}
      >
        <Avatar.Text
          size={42}
          label={getInitials(item.name)}
          style={styles.studentAvatar}
          color="#FFFFFF"
        />

        <View style={styles.studentInfo}>
          <Text style={styles.studentName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.studentAdmission}>
            Admission No. {item.admissionNo}
          </Text>
        </View>

        <IconButton
          icon="chevron-right"
          iconColor={Colors.subtext}
          size={22}
        />
      </TouchableOpacity>
    </Card>
  );

  if (!user) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Session not found.</Text>
      </View>
    );
  }

  if (user.role !== "PRINCIPAL" && user.role !== "ADMIN") {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>
          You are not authorized to access this screen.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.page}>
      <FlatList
        data={filteredStudents}
        renderItem={renderStudent}
        keyExtractor={(item) => item.admissionNo}
        showsVerticalScrollIndicator={false}
        refreshing={sectionQuery.isFetching}
        onRefresh={() => sectionQuery.refetch()}
        contentContainerStyle={[
          styles.listContent,
          { paddingHorizontal: isSmallScreen ? 16 : 28 },
        ]}
        ListHeaderComponent={
          <>
            <View style={styles.topBar}>
              <View style={styles.topBarLeft}>
                <IconButton
                  icon="arrow-left"
                  iconColor={Colors.brandPrimary}
                  onPress={() => navigation.goBack()}
                />
                <View>
                  <Text style={styles.pageEyebrow}>SECTION MANAGEMENT</Text>
                  <Text style={styles.pageTitle}>Students</Text>
                </View>
              </View>

              <IconButton
                icon="logout"
                iconColor={Colors.brandPrimary}
                onPress={handleLogout}
              />
            </View>

            <Card style={styles.heroCard} mode="contained">
              <Card.Content>
                <View style={styles.heroTopRow}>
                  <View style={styles.heroTitleArea}>
                    <Avatar.Icon
                      icon="google-classroom"
                      size={52}
                      color="#FFFFFF"
                      style={styles.heroIcon}
                    />
                    <View style={styles.heroTextArea}>
                      <Text style={styles.heroEyebrow}>SECTION OVERVIEW</Text>
                      <Text style={styles.heroTitle}>
                        {classNumber} • {sectionName}
                      </Text>
                      <Text style={styles.heroSubtitle}>
                        {students.length} enrolled student
                        {students.length === 1 ? "" : "s"}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.countBadge}>
                    <Text style={styles.countValue}>{students.length}</Text>
                    <Text style={styles.countLabel}>Students</Text>
                  </View>
                </View>
              </Card.Content>
            </Card>

            <Card style={styles.teacherCard} mode="contained">
              <Card.Content>
                <View style={styles.sectionHeadingRow}>
                  <View style={styles.headingIcon}>
                    <Text style={styles.headingIconText}>T</Text>
                  </View>
                  <View style={styles.headingTextArea}>
                    <Text style={styles.cardTitle}>Class Teacher</Text>
                    <Text style={styles.cardSubtitle}>
                      Manage the teacher assigned to this section.
                    </Text>
                  </View>
                </View>

                <Divider style={styles.divider} />

                {classTeacher ? (
                  <View style={styles.teacherDetailsRow}>
                    <Avatar.Text
                      size={48}
                      label={getInitials(classTeacher.name)}
                      style={styles.teacherAvatar}
                      color="#FFFFFF"
                    />
                    <View style={styles.teacherInfo}>
                      <Text style={styles.teacherName}>
                        {classTeacher.name}
                      </Text>
                      <Text style={styles.teacherMeta}>
                        {classTeacher.designation ||
                          classTeacher.role ||
                          "Class Teacher"}
                      </Text>
                      {!!classTeacher.employeeId && (
                        <Text style={styles.teacherMeta}>
                          Employee ID: {classTeacher.employeeId}
                        </Text>
                      )}
                      {!!classTeacher.email && (
                        <Text style={styles.teacherMeta}>
                          {classTeacher.email}
                        </Text>
                      )}
                    </View>
                    <View style={styles.assignedPill}>
                      <Text style={styles.assignedPillText}>Assigned</Text>
                    </View>
                  </View>
                ) : (
                  <View style={styles.unassignedBox}>
                    <Avatar.Icon
                      size={42}
                      icon="account-question-outline"
                      color={Colors.subtext}
                      style={styles.unassignedIcon}
                    />
                    <View style={styles.unassignedTextArea}>
                      <Text style={styles.unassignedTitle}>
                        No teacher assigned
                      </Text>
                      <Text style={styles.unassignedSubtitle}>
                        Assign a class teacher to this section.
                      </Text>
                    </View>
                  </View>
                )}

                <View style={styles.teacherActions}>
                  <Button
                    mode="contained"
                    icon={classTeacher ? "account-edit" : "account-plus"}
                    onPress={openTeacherModal}
                    buttonColor={Colors.brandPrimary}
                    style={styles.primaryAction}
                    contentStyle={styles.actionContent}
                    loading={assignTeacherMutation.isLoading}
                    disabled={assignTeacherMutation.isLoading}
                  >
                    {classTeacher ? "Change Teacher" : "Assign Teacher"}
                  </Button>

                  {classTeacher && (
                    <Button
                      mode="outlined"
                      icon="account-remove"
                      onPress={confirmRemoveTeacher}
                      textColor="#B42318"
                      style={styles.removeAction}
                      contentStyle={styles.actionContent}
                      loading={removeTeacherMutation.isLoading}
                      disabled={removeTeacherMutation.isLoading}
                    >
                      Remove
                    </Button>
                  )}
                </View>
              </Card.Content>
            </Card>

            <Card style={styles.searchCard} mode="contained">
              <Card.Content>
                <Text style={styles.cardTitle}>Find a Student</Text>
                <Text style={styles.cardSubtitle}>
                  Search by student name or admission number.
                </Text>
                <Searchbar
                  value={search}
                  onChangeText={setSearch}
                  placeholder="Search students..."
                  style={styles.searchbar}
                  inputStyle={styles.searchInput}
                  elevation={0}
                />
              </Card.Content>
            </Card>

            <View style={styles.studentsHeader}>
              <View>
                <Text style={styles.studentsTitle}>Students</Text>
                <Text style={styles.studentsSubtitle}>
                  Select a student to view their complete profile.
                </Text>
              </View>
              <View style={styles.studentCountPill}>
                <Text style={styles.studentCountPillText}>
                  {filteredStudents.length}
                </Text>
              </View>
            </View>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            {sectionQuery.isLoading ? (
              <ActivityIndicator color={Colors.brandPrimary} />
            ) : (
              <>
                <Avatar.Icon
                  size={54}
                  icon="account-search-outline"
                  color={Colors.subtext}
                  style={styles.emptyIcon}
                />
                <Text style={styles.emptyTitle}>No students found</Text>
                <Text style={styles.emptySubtitle}>
                  Try changing your search or refresh the section.
                </Text>
              </>
            )}
          </View>
        }
      />

      <Modal
        visible={teacherModalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeTeacherModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderText}>
                <Text style={styles.modalTitle}>Select Class Teacher</Text>
                <Text style={styles.modalSubtitle}>
                  Choose a teacher for {classNumber} • {sectionName}.
                </Text>
              </View>
              <IconButton
                icon="close"
                onPress={closeTeacherModal}
                disabled={assignTeacherMutation.isLoading}
              />
            </View>

            <Searchbar
              value={teacherSearch}
              onChangeText={setTeacherSearch}
              placeholder="Search teachers..."
              style={styles.teacherSearchbar}
              elevation={0}
            />

            {teachersQuery.isLoading ? (
              <View style={styles.modalLoading}>
                <ActivityIndicator color={Colors.brandPrimary} />
              </View>
            ) : (
              <FlatList
                data={availableTeachers}
                keyExtractor={(item) => item.id}
                style={styles.teacherList}
                keyboardShouldPersistTaps="handled"
                ListEmptyComponent={
                  <View style={styles.modalEmpty}>
                    <Text style={styles.emptyTitle}>
                      No teachers available
                    </Text>
                    <Text style={styles.emptySubtitle}>
                      Try another search term.
                    </Text>
                  </View>
                }
                renderItem={({ item }) => {
                  const selected = selectedTeacherId === item.id;

                  return (
                    <Pressable
                      onPress={() => setSelectedTeacherId(item.id)}
                      style={[
                        styles.teacherOption,
                        selected && styles.teacherOptionSelected,
                      ]}
                    >
                      <Avatar.Text
                        size={42}
                        label={getInitials(item.name)}
                        style={styles.teacherOptionAvatar}
                        color="#FFFFFF"
                      />
                      <View style={styles.teacherOptionInfo}>
                        <Text style={styles.teacherOptionName}>
                          {item.name}
                        </Text>
                        <Text style={styles.teacherOptionMeta}>
                          {item.designation || item.role}
                        </Text>
                        {!!item.employeeId && (
                          <Text style={styles.teacherOptionMeta}>
                            Employee ID: {item.employeeId}
                          </Text>
                        )}
                        <Text style={styles.teacherOptionMeta}>
                          Assigned sections: {item.assignedSections}
                        </Text>
                      </View>
                      <IconButton
                        icon={
                          selected
                            ? "radiobox-marked"
                            : "radiobox-blank"
                        }
                        iconColor={
                          selected
                            ? Colors.brandPrimary
                            : Colors.subtext
                        }
                      />
                    </Pressable>
                  );
                }}
              />
            )}

            <View style={styles.modalActions}>
              <Button
                mode="outlined"
                onPress={closeTeacherModal}
                disabled={assignTeacherMutation.isLoading}
                style={styles.modalCancelButton}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={submitTeacherAssignment}
                buttonColor={Colors.brandPrimary}
                disabled={
                  !selectedTeacherId ||
                  assignTeacherMutation.isLoading
                }
                loading={assignTeacherMutation.isLoading}
                style={styles.modalConfirmButton}
              >
                Save Teacher
              </Button>
            </View>
          </View>
        </View>
      </Modal>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3200}
      >
        {snackbarText}
      </Snackbar>
    </View>
  );
};

const getInitials = (name?: string | null) => {
  if (!name) {
    return "S";
  }

  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return (
    parts[0][0] + parts[parts.length - 1][0]
  ).toUpperCase();
};

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#F6F8FC",
  },
  listContent: {
    paddingTop: 12,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#F6F8FC",
  },
  errorText: {
    color: "#B42318",
    fontSize: 16,
    textAlign: "center",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  topBarLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  pageEyebrow: {
    color: Colors.subtext,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },
  pageTitle: {
    color: "#182230",
    fontSize: 25,
    fontWeight: "800",
    marginTop: 2,
  },
  heroCard: {
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    marginBottom: 14,
  },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  heroTitleArea: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  heroIcon: {
    backgroundColor: Colors.brandPrimary,
  },
  heroTextArea: {
    flex: 1,
    marginLeft: 12,
  },
  heroEyebrow: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
    color: Colors.subtext,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#182230",
    marginTop: 3,
  },
  heroSubtitle: {
    color: Colors.subtext,
    fontSize: 13,
    marginTop: 4,
  },
  countBadge: {
    minWidth: 70,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: "center",
    backgroundColor: "#EEF2FF",
  },
  countValue: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.brandPrimary,
  },
  countLabel: {
    fontSize: 10,
    color: Colors.subtext,
    fontWeight: "700",
    marginTop: 1,
  },
  teacherCard: {
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    marginBottom: 14,
  },
  sectionHeadingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  headingIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EEF2FF",
  },
  headingIconText: {
    color: Colors.brandPrimary,
    fontSize: 16,
    fontWeight: "800",
  },
  headingTextArea: {
    flex: 1,
    marginLeft: 10,
  },
  cardTitle: {
    color: "#182230",
    fontSize: 16,
    fontWeight: "800",
  },
  cardSubtitle: {
    color: Colors.subtext,
    fontSize: 12,
    marginTop: 3,
    lineHeight: 17,
  },
  divider: {
    marginVertical: 14,
    backgroundColor: "#E9EDF4",
  },
  teacherDetailsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  teacherAvatar: {
    backgroundColor: Colors.brandPrimary,
  },
  teacherInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  teacherName: {
    fontSize: 15,
    fontWeight: "800",
    color: "#182230",
  },
  teacherMeta: {
    color: Colors.subtext,
    fontSize: 12,
    marginTop: 3,
  },
  assignedPill: {
    backgroundColor: "#E8F7EE",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 20,
  },
  assignedPillText: {
    color: "#167647",
    fontSize: 10,
    fontWeight: "800",
  },
  unassignedBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 14,
    backgroundColor: "#F8FAFC",
  },
  unassignedIcon: {
    backgroundColor: "#E9EDF4",
  },
  unassignedTextArea: {
    flex: 1,
    marginLeft: 10,
  },
  unassignedTitle: {
    color: "#344054",
    fontSize: 14,
    fontWeight: "800",
  },
  unassignedSubtitle: {
    color: Colors.subtext,
    fontSize: 12,
    marginTop: 3,
  },
  teacherActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 16,
  },
  primaryAction: {
    flex: 1,
    borderRadius: 10,
  },
  removeAction: {
    borderColor: "#F0B8B2",
    borderRadius: 10,
  },
  actionContent: {
    minHeight: 42,
  },
  searchCard: {
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    marginBottom: 18,
  },
  searchbar: {
    marginTop: 14,
    borderRadius: 12,
    backgroundColor: "#F5F7FB",
  },
  searchInput: {
    fontSize: 14,
  },
  studentsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  studentsTitle: {
    color: "#182230",
    fontSize: 19,
    fontWeight: "800",
  },
  studentsSubtitle: {
    color: Colors.subtext,
    fontSize: 12,
    marginTop: 3,
  },
  studentCountPill: {
    minWidth: 34,
    height: 30,
    paddingHorizontal: 9,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E9EDFF",
  },
  studentCountPillText: {
    color: Colors.brandPrimary,
    fontSize: 12,
    fontWeight: "800",
  },
  studentCard: {
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    marginBottom: 10,
  },
  studentRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingLeft: 12,
  },
  studentAvatar: {
    backgroundColor: "#64748B",
  },
  studentInfo: {
    flex: 1,
    marginLeft: 12,
  },
  studentName: {
    color: "#182230",
    fontSize: 14,
    fontWeight: "800",
  },
  studentAdmission: {
    color: Colors.subtext,
    fontSize: 12,
    marginTop: 4,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 45,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    backgroundColor: "#E9EDF4",
  },
  emptyTitle: {
    color: "#344054",
    fontSize: 15,
    fontWeight: "800",
    marginTop: 12,
    textAlign: "center",
  },
  emptySubtitle: {
    color: Colors.subtext,
    fontSize: 12,
    marginTop: 5,
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(15, 23, 42, 0.42)",
  },
  modalCard: {
    maxHeight: "88%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: "#FFFFFF",
    padding: 18,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  modalHeaderText: {
    flex: 1,
    paddingTop: 5,
  },
  modalTitle: {
    color: "#182230",
    fontSize: 19,
    fontWeight: "800",
  },
  modalSubtitle: {
    color: Colors.subtext,
    fontSize: 12,
    marginTop: 5,
    lineHeight: 17,
  },
  teacherSearchbar: {
    marginTop: 12,
    borderRadius: 12,
    backgroundColor: "#F5F7FB",
  },
  teacherList: {
    marginTop: 12,
  },
  teacherOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E9EDF4",
  },
  teacherOptionSelected: {
    borderColor: Colors.brandPrimary,
    backgroundColor: "#F3F5FF",
  },
  teacherOptionAvatar: {
    backgroundColor: "#64748B",
  },
  teacherOptionInfo: {
    flex: 1,
    marginLeft: 10,
  },
  teacherOptionName: {
    color: "#182230",
    fontSize: 14,
    fontWeight: "800",
  },
  teacherOptionMeta: {
    color: Colors.subtext,
    fontSize: 11,
    marginTop: 3,
  },
  modalLoading: {
    paddingVertical: 45,
    alignItems: "center",
  },
  modalEmpty: {
    paddingVertical: 35,
    alignItems: "center",
  },
  modalActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  modalCancelButton: {
    flex: 1,
    borderRadius: 10,
  },
  modalConfirmButton: {
    flex: 1,
    borderRadius: 10,
  },
});

export { PrincipalClassStudentsScreen };
