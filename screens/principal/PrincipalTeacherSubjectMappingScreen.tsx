import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert,Platform, FlatList, ScrollView, StyleSheet, Text, View } from "react-native";
import {
  ActivityIndicator,
  Appbar,
  Button,
  Card,
  Divider,
  IconButton,
  Menu,
  Searchbar,
  Snackbar,
  TextInput,
  useTheme,
} from "react-native-paper";
import { teacherSubjectMappingServices } from "../../services/teacherSubjectMappingServices";
import { useConfirm } from "../../components/ConfirmProvider";

type Option = { id: string; name: string; [key: string]: any };
type ClassOption = { id: string; classNumber?: string; displayName?: string; sections?: Option[]; subjects?: Option[] };
type Mapping = {
  id: string;
  teacherUserId?: string;
  subjectId?: string;
  sectionId?: string;
  academicYearId?: string;
  teacher?: { id?: string; name?: string; email?: string };
  subject?: { id?: string; name?: string; code?: string; class?: { displayName?: string; classNumber?: string } };
  section?: { id?: string; sectionName?: string; class?: { displayName?: string; classNumber?: string } };
  academicYear?: { id?: string; name?: string };
  [key: string]: any;
};

/**
 * Adapt the import/method names below to your existing service module if named differently.
 * Expected endpoints from your existing backend:
 * GET /teacher-subject/teachers
 * GET /teacher-subject/options?academicYearId=...
 * GET /teacher-subject?academicYearId=...
 * POST /teacher-subject
 * DELETE /teacher-subject/:mappingId
 */
const PrincipalTeacherSubjectMappingScreen = () => {
  const theme = useTheme();
  const [years, setYears] = useState<Option[]>([]);
  const [selectedYearId, setSelectedYearId] = useState("");
  const [teachers, setTeachers] = useState<Option[]>([]);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [mappings, setMappings] = useState<Mapping[]>([]);
  const [teacherId, setTeacherId] = useState("");
  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [search, setSearch] = useState("");
  const [teacherMenu, setTeacherMenu] = useState(false);
  const [classMenu, setClassMenu] = useState(false);
  const [sectionMenu, setSectionMenu] = useState(false);
  const [subjectMenu, setSubjectMenu] = useState(false);
  const [yearMenu, setYearMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState("");
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const notify = (message: string) => {
    setSnackbar(message);
    setSnackbarVisible(true);
  };

  // Load years/teachers. If your app has an academic-year service, replace this
  // endpoint with that service. The screen intentionally reports missing data clearly.
  const loadBaseOptions = useCallback(async () => {
    setLoading(true);
    try {
      const [teacherResponse, yearResponse] = await Promise.all([
        teacherSubjectMappingServices.getTeachersForMapping(),
        teacherSubjectMappingServices.getAcademicYears(),
      ]);
      setTeachers(teacherResponse ?? []);
      const loadedYears = yearResponse ?? [];
      setYears(loadedYears);
      const currentYear = loadedYears.find((year: any) => year.isCurrent) ?? loadedYears[0];
      if (currentYear) setSelectedYearId(currentYear.id);
    } catch (error: any) {
      console.error("Mapping options load failed:", error);
      notify(error?.response?.data?.message ?? "Could not load teachers or academic years. Check the service methods.");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadYearData = useCallback(async (yearId: string) => {
    if (!yearId) {
      setClasses([]);
      setMappings([]);
      return;
    }
    try {
      const [optionResponse, mappingResponse] = await Promise.all([
        teacherSubjectMappingServices.getSubjectsForMapping(yearId),
        teacherSubjectMappingServices.getMappings(yearId),
      ]);
      const loadedClasses = optionResponse.classes ?? optionResponse ?? [];
      setClasses(
        loadedClasses.map((item: any) => ({
          ...item,
          classNumber: item.classNumber == null ? undefined : String(item.classNumber),
        })),
      );
      setMappings(
        (mappingResponse ?? []).map((mapping): Mapping => ({
          ...mapping,
          subject: mapping.subject
            ? {
                ...mapping.subject,
                code: mapping.subject.code ?? undefined,
                class: mapping.subject.class
                  ? {
                      ...mapping.subject.class,
                      displayName: mapping.subject.class.displayName ?? undefined,
                      classNumber:
                        mapping.subject.class.classNumber == null
                          ? undefined
                          : String(mapping.subject.class.classNumber),
                    }
                  : undefined,
              }
            : undefined,
          section: mapping.section
            ? {
                ...mapping.section,
                sectionName: mapping.section.sectionName ?? undefined,
                class: mapping.section.class
                  ? {
                      ...mapping.section.class,
                      displayName: mapping.section.class.displayName ?? undefined,
                      classNumber:
                        mapping.section.class.classNumber == null
                          ? undefined
                          : String(mapping.section.class.classNumber),
                    }
                  : undefined,
              }
            : undefined,
        })),
      );
    } catch (error: any) {
      console.error("Mapping year data load failed:", error);
      notify(error?.response?.data?.message ?? "Could not load subjects and existing mappings.");
    }
  }, []);

  useEffect(() => {
    loadBaseOptions();
  }, [loadBaseOptions]);

  useEffect(() => {
    loadYearData(selectedYearId);
    setClassId("");
    setSectionId("");
    setSubjectId("");
  }, [selectedYearId, loadYearData]);

  const selectedTeacher = teachers.find((item) => item.id === teacherId);
  const selectedClass = classes.find((item) => item.id === classId);
  const sections = selectedClass?.sections ?? [];
  const selectedSection = sections.find((item) => item.id === sectionId);
  const subjects = selectedClass?.subjects ?? [];
  const selectedSubject = subjects.find((item) => item.id === subjectId);

  const filteredMappings = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return mappings;
    return mappings.filter((mapping) =>
      [
        mapping.teacher?.name,
        mapping.subject?.name,
        mapping.subject?.code,
        mapping.section?.sectionName,
        mapping.section?.class?.displayName,
        mapping.section?.class?.classNumber,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [mappings, search]);

  const createMapping = async () => {
    if (!selectedYearId || !teacherId || !classId || !sectionId || !subjectId) {
      notify("Select academic year, teacher, class, section, and subject.");
      return;
    }
    setSaving(true);
    try {
      await teacherSubjectMappingServices.assignTeacherSubject({
        teacherUserId: teacherId,
        subjectId,
        sectionId,
        academicYearId: selectedYearId,
      });
      notify("Teacher assigned to subject and section.");
      setTeacherId("");
      await loadYearData(selectedYearId);
    } catch (error: any) {
      notify(error?.response?.data?.message ?? "Could not save teacher-subject mapping.");
    } finally {
      setSaving(false);
    }
  };

  

const { confirm } = useConfirm();
const removeMapping = async (mapping: Mapping) => {
  const confirmed = await confirm({
    title: "Remove assignment",
    message: `Remove ${
      mapping.teacher?.name ?? "this teacher"
    } from ${
      mapping.subject?.name ?? "this subject"
    }?`,
    confirmText: "Remove",
    cancelText: "Cancel",
    destructive: true,
  });

  if (!confirmed) return;

  try {
    await teacherSubjectMappingServices.deleteMapping(
      mapping.id
    );

    setMappings((current) =>
      current.filter((item) => item.id !== mapping.id)
    );

    notify("Assignment removed.");
  } catch (error: any) {
    notify(
      error?.response?.data?.message ??
        "Could not remove assignment."
    );
  }
};



  const Picker = ({
    label,
    value,
    placeholder,
    visible,
    setVisible,
    options,
    onSelect,
  }: {
    label: string;
    value: string;
    placeholder: string;
    visible: boolean;
    setVisible: (value: boolean) => void;
    options: Option[];
    onSelect: (id: string) => void;
  }) => {
    const selected = options.find((item) => item.id === value);
    return (
      <View style={styles.pickerBlock}>
        <Text style={styles.label}>{label}</Text>
        <Menu
          visible={visible}
          onDismiss={() => setVisible(false)}
          anchor={
            <Button
              mode="outlined"
              icon="chevron-down"
              contentStyle={styles.pickerButtonContent}
              style={styles.pickerButton}
              onPress={() => setVisible(true)}
            >
              {selected?.name ?? placeholder}
            </Button>
          }
        >
          <ScrollView style={{ maxHeight: 280 }}>
            {options.map((option) => (
              <Menu.Item
                key={option.id}
                title={option.name}
                onPress={() => {
                  onSelect(option.id);
                  setVisible(false);
                }}
              />
            ))}
          </ScrollView>
        </Menu>
      </View>
    );
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header style={styles.appbar} mode="small">
        <Appbar.BackAction onPress={() => {}} />
        <Appbar.Content title="Teacher–Subject Mapping" subtitle="Academic setup" />
        <Appbar.Action icon="refresh" onPress={() => loadBaseOptions()} />
      </Appbar.Header>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
          <Text style={styles.muted}>Loading mapping options…</Text>
        </View>
      ) : (
        <FlatList
          data={filteredMappings}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            <View>
              <View style={styles.hero}>
                <Text style={styles.heroEyebrow}>ACADEMIC YEAR</Text>
                <Text style={styles.heroTitle}>Assign the right teacher</Text>
                <Text style={styles.heroSubtitle}>
                  Link an active teacher to a subject within a specific class section.
                </Text>
                <View style={styles.yearPicker}>
                  <Picker
                    label="Academic year"
                    value={selectedYearId}
                    placeholder="Select academic year"
                    visible={yearMenu}
                    setVisible={setYearMenu}
                    options={years.map((year) => ({ ...year, name: year.name }))}
                    onSelect={setSelectedYearId}
                  />
                </View>
              </View>

              <Card mode="outlined" style={styles.formCard}>
                <Card.Content>
                  <Text style={styles.cardTitle}>New assignment</Text>
                  <Text style={styles.cardSubtitle}>Choose all four items to create a mapping.</Text>
                  <Picker label="Teacher" value={teacherId} placeholder="Select teacher" visible={teacherMenu} setVisible={setTeacherMenu} options={teachers} onSelect={setTeacherId} />
                  <Picker label="Class" value={classId} placeholder="Select class" visible={classMenu} setVisible={setClassMenu} options={classes.map((item) => ({ id: item.id, name: item.displayName ?? item.classNumber ?? "Class" }))} onSelect={(id) => { setClassId(id); setSectionId(""); setSubjectId(""); }} />
                  <Picker label="Section" value={sectionId} placeholder="Select section" visible={sectionMenu} setVisible={setSectionMenu} options={sections.map((item) => ({ id: item.id, name: item.name ?? item.sectionName ?? "Section" }))} onSelect={(id) => { setSectionId(id); setSubjectId(""); }} />
                  <Picker label="Subject" value={subjectId} placeholder="Select subject" visible={subjectMenu} setVisible={setSubjectMenu} options={subjects.map((item) => ({ id: item.id, name: item.code ? `${item.name} (${item.code})` : item.name }))} onSelect={setSubjectId} />
                  {!!selectedTeacher && !!selectedClass && !!selectedSection && !!selectedSubject && (
                    <View style={styles.preview}>
                      <Text style={styles.previewTitle}>Assignment preview</Text>
                      <Text style={styles.previewText}>{selectedTeacher.name} · {selectedClass.displayName ?? selectedClass.classNumber} {selectedSection.sectionName ?? selectedSection.name} · {selectedSubject.name}</Text>
                    </View>
                  )}
                  <Button mode="contained" icon="account-check" onPress={createMapping} loading={saving} disabled={saving || !selectedYearId} style={styles.submitButton} contentStyle={{ height: 48 }}>
                    Save assignment
                  </Button>
                </Card.Content>
              </Card>

              <View style={styles.listHeading}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>Existing assignments</Text>
                  <Text style={styles.muted}>{mappings.length} assignments for this academic year</Text>
                </View>
              </View>
              <Searchbar placeholder="Search teacher, subject, class…" value={search} onChangeText={setSearch} style={styles.search} />
            </View>
          }
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          ListEmptyComponent={
            <Card mode="outlined" style={styles.emptyCard}>
              <Card.Content style={styles.emptyContent}>
                <Text style={{ fontSize: 30 }}>👩‍🏫</Text>
                <Text style={styles.emptyTitle}>No assignments found</Text>
                <Text style={styles.muted}>Create a new assignment above, or change your search.</Text>
              </Card.Content>
            </Card>
          }
          renderItem={({ item }) => (
            <Card mode="outlined" style={styles.mappingCard}>
              <Card.Content>
                <View style={styles.mappingRow}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{(item.teacher?.name ?? "T").slice(0, 1).toUpperCase()}</Text>
                  </View>
                  <View style={styles.mappingInfo}>
                    <Text style={styles.teacherName}>{item.teacher?.name ?? "Teacher"}</Text>
                    <Text style={styles.subjectName}>{item.subject?.name ?? "Subject"}{item.subject?.code ? ` · ${item.subject.code}` : ""}</Text>
                    <Text style={styles.mappingMeta}>
                      {(item.section?.class?.displayName ?? item.section?.class?.classNumber ?? "Class")} · {item.section?.sectionName ?? "Section"}
                    </Text>
                    {!!item.teacher?.email && <Text style={styles.mappingMeta}>{item.teacher.email}</Text>}
                  </View>
                  <IconButton icon="delete-outline" iconColor="#C24141" onPress={() => removeMapping(item)} accessibilityLabel="Remove assignment" />
                </View>
              </Card.Content>
            </Card>
          )}
        />
      )}
      <Snackbar visible={snackbarVisible} onDismiss={() => setSnackbarVisible(false)} duration={2800}>{snackbar}</Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1 },
  appbar: { backgroundColor: "#F7F8FC" },
  content: { padding: 16, paddingBottom: 30 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  muted: { color: "#777D8D", fontSize: 12, marginTop: 4 },
  hero: { backgroundColor: "#172554", borderRadius: 22, padding: 20, marginBottom: 16 },
  heroEyebrow: { color: "#BFD0FF", fontSize: 10, fontWeight: "900", letterSpacing: 1.2 },
  heroTitle: { color: "#FFFFFF", fontSize: 23, fontWeight: "900", marginTop: 8 },
  heroSubtitle: { color: "#DCE6FF", fontSize: 13, lineHeight: 19, marginTop: 6 },
  yearPicker: { marginTop: 16 },
  formCard: { backgroundColor: "#FFFFFF", borderColor: "#E8EAF0", borderRadius: 18, marginBottom: 22 },
  cardTitle: { color: "#171923", fontSize: 17, fontWeight: "900" },
  cardSubtitle: { color: "#777D8D", fontSize: 12, marginTop: 4, marginBottom: 10 },
  pickerBlock: { marginTop: 12 },
  label: { color: "#535A6B", fontSize: 12, fontWeight: "700", marginBottom: 6 },
  pickerButton: { borderRadius: 12, borderColor: "#D9DDE7", alignSelf: "stretch" },
  pickerButtonContent: { height: 44, flexDirection: "row-reverse", justifyContent: "space-between" },
  preview: { backgroundColor: "#EEF8F2", borderRadius: 12, padding: 12, marginTop: 16 },
  previewTitle: { color: "#187345", fontWeight: "900", fontSize: 12 },
  previewText: { color: "#345C47", fontSize: 12, marginTop: 4, lineHeight: 18 },
  submitButton: { marginTop: 18, borderRadius: 12 },
  listHeading: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  search: { backgroundColor: "#F0F2F7", borderRadius: 13, elevation: 0, marginBottom: 14 },
  mappingCard: { backgroundColor: "#FFFFFF", borderColor: "#E8EAF0", borderRadius: 16 },
  mappingRow: { flexDirection: "row", alignItems: "center" },
  avatar: { width: 44, height: 44, borderRadius: 14, backgroundColor: "#EEF2FF", alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 17, fontWeight: "900", color: "#3747A5" },
  mappingInfo: { flex: 1, marginLeft: 12 },
  teacherName: { color: "#171923", fontSize: 14, fontWeight: "900" },
  subjectName: { color: "#374151", fontSize: 12, fontWeight: "700", marginTop: 3 },
  mappingMeta: { color: "#777D8D", fontSize: 11, marginTop: 3 },
  emptyCard: { borderRadius: 16, backgroundColor: "#FFFFFF", borderColor: "#E8EAF0" },
  emptyContent: { alignItems: "center", paddingVertical: 24 },
  emptyTitle: { color: "#171923", fontSize: 15, fontWeight: "900", marginTop: 8 },
});

export default PrincipalTeacherSubjectMappingScreen;
