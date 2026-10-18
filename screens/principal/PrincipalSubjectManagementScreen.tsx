import React, { useCallback, useEffect, useMemo, useState } from "react";
import {  FlatList, ScrollView, StyleSheet, Text, View } from "react-native";
import {
  ActivityIndicator,
  Appbar,
  Button,
  Card,
  Checkbox,
  Divider,
  IconButton,
  Modal,
  Portal,
  Searchbar,
  Snackbar,
  TextInput,
  useTheme,
} from "react-native-paper";
import { useConfirm } from "../../components/ConfirmProvider";
import { useRoute } from "@react-navigation/native";
import principalSubjectServices, {
  SubjectClassOption,
  SubjectRecord,
} from "../../services/principalSubjectServices";



export const PrincipalSubjectManagementScreen = () => {
  const theme = useTheme();
  const route = useRoute<any>();
  const academicYearId: string | undefined = route.params?.academicYearId;
  const [classes, setClasses] = useState<SubjectClassOption[]>([]);
  const [subjects, setSubjects] = useState<SubjectRecord[]>([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [isOptional, setIsOptional] = useState(false);
  const [snackbar, setSnackbar] = useState("");
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const { confirm } = useConfirm();

  
  const notify = (message: string) => {
    setSnackbar(message);
    setSnackbarVisible(true);
  };

  const loadData = useCallback(async () => {
    if (!academicYearId) {
      setClasses([]);
      setSubjects([]);
      return;
    }
    setLoading(true);
    try {
      const [classRows, subjectRows] = await Promise.all([
        principalSubjectServices.getClasses(academicYearId),
        principalSubjectServices.getSubjects({ academicYearId }),
      ]);
      setClasses(classRows);
      setSubjects(subjectRows);
      setSelectedClassId((current) =>
        classRows.some((item) => item.id === current) ? current : (classRows[0]?.id ?? ""),
      );
    } catch (error: any) {
      notify(error?.response?.data?.message ?? "Could not load subjects. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [academicYearId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const selectedClass = classes.find((item) => item.id === selectedClassId);
  const filteredSubjects = useMemo(
    () =>
      subjects.filter(
        (item) =>
          item.classId === selectedClassId &&
          `${item.name} ${item.code}`.toLowerCase().includes(search.toLowerCase()),
      ),
    [subjects, selectedClassId, search],
  );

  const openCreate = () => {
    if (!selectedClassId) {
      notify("Select a class first.");
      return;
    }
    setEditingId(null);
    setName("");
    setCode("");
    setIsOptional(false);
    setModalVisible(true);
  };

  const openEdit = (subject: SubjectRecord) => {
    setEditingId(subject.id);
    setName(subject.name);
    setCode(subject.code);
    setIsOptional(subject.isOptional);
    setModalVisible(true);
  };

  const saveSubject = async () => {
    const cleanName = name.trim();
    const cleanCode = code.trim().toUpperCase();
    if (!selectedClassId) return notify("Select a class first.");
    if (!cleanName || !cleanCode) return notify("Enter both subject name and code.");

    const duplicate = subjects.some(
      (item) =>
        item.classId === selectedClassId &&
        item.code.toLowerCase() === cleanCode.toLowerCase() &&
        item.id !== editingId,
    );
    if (duplicate) return notify("This subject code already exists for the selected class.");

    setSaving(true);
    try {
      const payload = { classId: selectedClassId, name: cleanName, code: cleanCode, isOptional };
      if (editingId) {
        await principalSubjectServices.updateSubject(editingId, payload);
        notify("Subject updated successfully.");
      } else {
        await principalSubjectServices.createSubject(payload);
        notify("Subject added successfully.");
      }
      setModalVisible(false);
      await loadData();
    } catch (error: any) {
      notify(error?.response?.data?.message ?? "Could not save subject. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  
const deleteSubject = async (subject: SubjectRecord) => {
  const confirmed = await confirm({
    title: "Delete subject",
    message: `Delete ${subject.name} (${subject.code})? This may be blocked if the subject is already used by exams, timetables, or teacher mappings.`,
    confirmText: "Delete",
    cancelText: "Cancel",
    destructive: true,
  });

  if (!confirmed) return;

  try {
    await principalSubjectServices.deleteSubject(subject.id);
    notify("Subject deleted successfully.");
    await loadData();
  } catch (error: any) {
    notify(
      error?.response?.data?.message ??
        "Could not delete subject. It may be in use."
    );
  }
};


  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header mode="small" elevated={false} style={styles.appbar}>
        <Appbar.Content title="Subject Management" subtitle="Academic setup" />
        <Appbar.Action icon="refresh" onPress={() => void loadData()} disabled={loading} />
        <Appbar.Action icon="plus" onPress={openCreate} />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.hero}>
          <View style={styles.heroIcon}><Text style={styles.heroEmoji}>📚</Text></View>
          <Text style={styles.heroTitle}>Manage class subjects</Text>
          <Text style={styles.heroSubtitle}>
            Subjects load from your API. Add, edit, and delete actions are saved to the database.
          </Text>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>{filteredSubjects.length}</Text>
              <Text style={styles.statLabel}>Subjects shown</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statNumber}>{filteredSubjects.filter((s) => s.isOptional).length}</Text>
              <Text style={styles.statLabel}>Optional</Text>
            </View>
          </View>
        </View>

        {!academicYearId ? (
          <Card mode="outlined" style={styles.emptyCard}>
            <Card.Content>
              <Text style={styles.emptyTitle}>Academic year required</Text>
              <Text style={styles.mutedText}>Pass the selected academicYearId to this screen from your existing academic-year flow.</Text>
            </Card.Content>
          </Card>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Select class</Text>
            {loading && classes.length === 0 ? (
              <ActivityIndicator style={{ margin: 18 }} />
            ) : classes.length === 0 ? (
              <Text style={styles.mutedText}>No classes found for this academic year.</Text>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.classChips}>
                {classes.map((item) => {
                  const active = item.id === selectedClassId;
                  return (
                    <Button
                      key={item.id}
                      mode={active ? "contained" : "outlined"}
                      compact
                      onPress={() => setSelectedClassId(item.id)}
                      style={styles.classChip}
                    >
                      {item.displayName || `Class ${item.classNumber}`}
                    </Button>
                  );
                })}
              </ScrollView>
            )}

            <View style={styles.listHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.sectionTitle}>{selectedClass?.displayName || (selectedClass ? `Class ${selectedClass.classNumber}` : "Subjects")}</Text>
                <Text style={styles.mutedText}>Database subject catalogue</Text>
              </View>
              <Button mode="contained" icon="plus" onPress={openCreate} compact disabled={!selectedClassId}>
                Add
              </Button>
            </View>

            <Searchbar
              placeholder="Search by subject or code"
              value={search}
              onChangeText={setSearch}
              style={styles.search}
              inputStyle={styles.searchInput}
            />

            {loading ? <ActivityIndicator style={{ marginVertical: 18 }} /> : null}

            {!loading && filteredSubjects.length === 0 ? (
              <Card style={styles.emptyCard} mode="outlined">
                <Card.Content style={styles.emptyContent}>
                  <Text style={styles.emptyEmoji}>📘</Text>
                  <Text style={styles.emptyTitle}>No subjects found</Text>
                  <Text style={styles.mutedText}>Add a subject for the selected class to get started.</Text>
                  <Button mode="contained" icon="plus" onPress={openCreate} style={styles.emptyButton} disabled={!selectedClassId}>
                    Add subject
                  </Button>
                </Card.Content>
              </Card>
            ) : (
              <FlatList
                data={filteredSubjects}
                scrollEnabled={false}
                keyExtractor={(item) => item.id}
                ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
                renderItem={({ item, index }) => (
                  <Card mode="outlined" style={styles.subjectCard}>
                    <Card.Content>
                      <View style={styles.subjectRow}>
                        <View style={[styles.subjectBadge, { backgroundColor: index % 2 ? "#EEF8F2" : "#EEF2FF" }]}>
                          <Text style={styles.subjectBadgeText}>{item.code.slice(0, 3)}</Text>
                        </View>
                        <View style={styles.subjectInfo}>
                          <Text style={styles.subjectName}>{item.name}</Text>
                          <Text style={styles.subjectCode}>Code: {item.code}</Text>
                          <View style={item.isOptional ? styles.optionalTag : styles.requiredTag}>
                            <Text style={item.isOptional ? styles.optionalTagText : styles.requiredTagText}>
                              {item.isOptional ? "OPTIONAL SUBJECT" : "CORE SUBJECT"}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.actions}>
                          <IconButton icon="pencil-outline" size={20} onPress={() => openEdit(item)} accessibilityLabel={`Edit ${item.name}`} />
                          <IconButton icon="delete-outline" size={20} iconColor="#C24141" onPress={() => deleteSubject(item)} accessibilityLabel={`Delete ${item.name}`} />
                        </View>
                      </View>
                    </Card.Content>
                  </Card>
                )}
              />
            )}
          </>
        )}
      </ScrollView>

      <Portal>
        <Modal visible={modalVisible} onDismiss={() => !saving && setModalVisible(false)} contentContainerStyle={styles.modal}>
          <Text style={styles.modalTitle}>{editingId ? "Edit subject" : "Add subject"}</Text>
          <Text style={styles.modalSubtitle}>{selectedClass?.displayName || (selectedClass ? `Class ${selectedClass.classNumber}` : "Selected class")}</Text>
          <TextInput label="Subject name" value={name} onChangeText={setName} mode="outlined" autoCapitalize="words" style={styles.field} />
          <TextInput label="Subject code" value={code} onChangeText={setCode} mode="outlined" autoCapitalize="characters" style={styles.field} />
          <View style={styles.checkboxRow}>
            <Checkbox status={isOptional ? "checked" : "unchecked"} onPress={() => setIsOptional((current) => !current)} />
            <View style={{ flex: 1 }}>
              <Text style={styles.checkboxTitle}>Optional subject</Text>
              <Text style={styles.mutedText}>Mark this if students may choose this subject.</Text>
            </View>
          </View>
          <Divider style={{ marginVertical: 16 }} />
          <View style={styles.modalActions}>
            <Button onPress={() => setModalVisible(false)} disabled={saving}>Cancel</Button>
            <Button mode="contained" onPress={() => void saveSubject()} loading={saving} disabled={saving}>
              {editingId ? "Save changes" : "Add subject"}
            </Button>
          </View>
        </Modal>
      </Portal>

      <Snackbar visible={snackbarVisible} onDismiss={() => setSnackbarVisible(false)} duration={3000}>
        {snackbar}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1 },
  appbar: { backgroundColor: "#F7F8FC" },
  content: { padding: 16, paddingBottom: 32 },
  hero: { backgroundColor: "#172554", borderRadius: 22, padding: 20, marginBottom: 22 },
  heroIcon: { width: 54, height: 54, borderRadius: 16, backgroundColor: "#FFFFFF20", alignItems: "center", justifyContent: "center", marginBottom: 14 },
  heroEmoji: { fontSize: 28 },
  heroTitle: { color: "#FFFFFF", fontSize: 23, fontWeight: "800" },
  heroSubtitle: { color: "#DCE6FF", fontSize: 13, lineHeight: 19, marginTop: 7 },
  statsRow: { flexDirection: "row", alignItems: "center", marginTop: 20 },
  stat: { flex: 1 },
  statNumber: { color: "#FFFFFF", fontSize: 23, fontWeight: "800" },
  statLabel: { color: "#DCE6FF", fontSize: 11, marginTop: 2 },
  statDivider: { height: 36, width: 1, backgroundColor: "#FFFFFF45", marginHorizontal: 18 },
  sectionTitle: { fontSize: 17, fontWeight: "800", color: "#181B25" },
  classChips: { paddingVertical: 12, paddingRight: 6 },
  classChip: { marginRight: 8, borderRadius: 12 },
  listHeader: { flexDirection: "row", alignItems: "center", marginTop: 12, marginBottom: 12 },
  mutedText: { color: "#737887", fontSize: 12, marginTop: 3 },
  search: { borderRadius: 13, backgroundColor: "#F0F2F7", marginBottom: 14, elevation: 0 },
  searchInput: { fontSize: 13 },
  subjectCard: { backgroundColor: "#FFFFFF", borderColor: "#E8EAF0", borderRadius: 16 },
  subjectRow: { flexDirection: "row", alignItems: "center" },
  subjectBadge: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  subjectBadgeText: { color: "#273B87", fontSize: 13, fontWeight: "900" },
  subjectInfo: { flex: 1, marginLeft: 12, minWidth: 0 },
  subjectName: { fontSize: 15, fontWeight: "800", color: "#171923" },
  subjectCode: { fontSize: 12, color: "#737887", marginTop: 3 },
  optionalTag: { alignSelf: "flex-start", backgroundColor: "#FFF4DB", paddingHorizontal: 7, paddingVertical: 4, borderRadius: 6, marginTop: 7 },
  optionalTagText: { color: "#946200", fontSize: 9, fontWeight: "900" },
  requiredTag: { alignSelf: "flex-start", backgroundColor: "#E8F7EE", paddingHorizontal: 7, paddingVertical: 4, borderRadius: 6, marginTop: 7 },
  requiredTagText: { color: "#187345", fontSize: 9, fontWeight: "900" },
  actions: { flexDirection: "row", marginLeft: 2 },
  emptyCard: { borderRadius: 16, backgroundColor: "#FFFFFF", borderColor: "#E8EAF0" },
  emptyContent: { alignItems: "center", paddingVertical: 26 },
  emptyEmoji: { fontSize: 34, marginBottom: 8 },
  emptyTitle: { fontSize: 16, fontWeight: "800", color: "#171923" },
  emptyButton: { marginTop: 14 },
  modal: { backgroundColor: "#FFFFFF", margin: 20, padding: 20, borderRadius: 20 },
  modalTitle: { fontSize: 21, fontWeight: "800", color: "#171923" },
  modalSubtitle: { color: "#737887", fontSize: 13, marginTop: 4, marginBottom: 18 },
  field: { marginBottom: 12, backgroundColor: "#FFFFFF" },
  checkboxRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  checkboxTitle: { fontSize: 14, fontWeight: "700", color: "#171923" },
  modalActions: { flexDirection: "row", justifyContent: "flex-end", alignItems: "center" },
});

export default PrincipalSubjectManagementScreen;
