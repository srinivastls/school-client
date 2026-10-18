import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useConfirm } from "../../components/ConfirmProvider";
import {
  ActivityIndicator,
  Button,
  Card,
  Chip,
  Divider,
  IconButton,
  Menu,
  Modal,
  Searchbar,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import { useRoute } from "@react-navigation/native";
import principalTimetableServices, {
  TimetableClassOption,
  TimetableDay,
  TimetableEntry,
  TimetableEntryPayload,
  TimetableOptionsResponse,
  TimetableTeacherOption,
} from "../../services/principalTimetableServices";

const DAYS: { label: string; value: TimetableDay }[] = [
  { label: "Mon", value: "MONDAY" },
  { label: "Tue", value: "TUESDAY" },
  { label: "Wed", value: "WEDNESDAY" },
  { label: "Thu", value: "THURSDAY" },
  { label: "Fri", value: "FRIDAY" },
  { label: "Sat", value: "SATURDAY" },
  { label: "Sun", value: "SUNDAY" },
];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

const getMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Something went wrong. Please try again.";

export default function PrincipalTimetableManagementScreen() {
  const theme = useTheme();
  const route = useRoute<any>();
  const academicYearId: string | undefined = route.params?.academicYearId;

  const [options, setOptions] = useState<TimetableOptionsResponse | null>(null);
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedSectionId, setSelectedSectionId] = useState("");
  const [selectedDay, setSelectedDay] = useState<TimetableDay>("MONDAY");
  const [search, setSearch] = useState("");
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [loadingEntries, setLoadingEntries] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState("");

  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formDay, setFormDay] = useState<TimetableDay>("MONDAY");
  const [formPeriod, setFormPeriod] = useState("1");
  const [formSubjectId, setFormSubjectId] = useState("");
  const [formTeacherId, setFormTeacherId] = useState("");
  const [formStart, setFormStart] = useState("08:00");
  const [formEnd, setFormEnd] = useState("08:45");

  const [yearMenu, setYearMenu] = useState(false);
  const [classMenu, setClassMenu] = useState(false);
  const [sectionMenu, setSectionMenu] = useState(false);
  const [subjectMenu, setSubjectMenu] = useState(false);
  const [teacherMenu, setTeacherMenu] = useState(false);
  const [periodMenu, setPeriodMenu] = useState(false);

  const classes = options?.classes ?? [];
  const teachers = options?.teachers ?? [];
  const mappings = options?.mappings ?? [];
  const selectedClass: TimetableClassOption | undefined = classes.find((item) => item.id === selectedClassId);
  const sections = selectedClass?.sections ?? [];
  const selectedSection = sections.find((item) => item.id === selectedSectionId);
  const subjects = selectedClass?.subjects ?? [];

  const {showAlert, confirm } = useConfirm();

  const eligibleTeachers = useMemo(() => {
    if (!formSubjectId || !selectedSectionId) return [];
    const ids = new Set(
      mappings
        .filter((mapping) => mapping.subjectId === formSubjectId && mapping.sectionId === selectedSectionId)
        .map((mapping) => mapping.teacherUserId)
    );
    return teachers.filter((teacher) => ids.has(teacher.id));
  }, [mappings, formSubjectId, selectedSectionId, teachers]);

  const subjectLabel = useCallback((id: string) => {
    for (const cls of classes) {
      const subject = cls.subjects.find((item) => item.id === id);
      if (subject) return subject.name;
    }
    return "Subject";
  }, [classes]);

  const teacherLabel = useCallback((id: string) => {
    return teachers.find((item) => item.id === id)?.name ?? "Teacher";
  }, [teachers]);

  const loadOptions = useCallback(async () => {
    if (!academicYearId) {
      setLoadError("Academic year ID was not passed to this screen. Open it from the Academics dashboard with an academicYearId route parameter.");
      setLoadingOptions(false);
      return;
    }
    setLoadingOptions(true);
    setLoadError("");
    try {
      const data = await principalTimetableServices.getTimetableOptions(academicYearId);
      setOptions(data);
      setSelectedClassId((current) =>
        data.classes.some((item) => item.id === current) ? current : data.classes[0]?.id ?? ""
      );
    } catch (error) {
      setLoadError(getMessage(error));
    } finally {
      setLoadingOptions(false);
    }
  }, [academicYearId]);

  useEffect(() => {
    void loadOptions();
  }, [loadOptions]);

  useEffect(() => {
    const nextSections = classes.find((item) => item.id === selectedClassId)?.sections ?? [];
    setSelectedSectionId((current) =>
      nextSections.some((item) => item.id === current) ? current : nextSections[0]?.id ?? ""
    );
  }, [classes, selectedClassId]);

  const loadEntries = useCallback(async () => {
    if (!academicYearId || !options) return;
    setLoadingEntries(true);
    try {
      const data = await principalTimetableServices.getTimetable(academicYearId, {
        classId: selectedClassId || undefined,
        sectionId: selectedSectionId || undefined,
      });
      setEntries(data.entries);
    } catch (error) {
      showAlert("Unable to load timetable", getMessage(error));
    } finally {
      setLoadingEntries(false);
    }
  }, [academicYearId, options, selectedClassId, selectedSectionId]);

  useEffect(() => {
    void loadEntries();
  }, [loadEntries]);

  const visibleEntries = useMemo(() => {
    const query = search.trim().toLowerCase();
    return entries
      .filter((entry) =>
        entry.classId === selectedClassId &&
        entry.sectionId === selectedSectionId &&
        entry.dayOfWeek === selectedDay
      )
      .filter((entry) => !query ||
        entry.subject.name.toLowerCase().includes(query) ||
        entry.teacher.name.toLowerCase().includes(query) ||
        String(entry.periodNumber).includes(query)
      )
      .sort((a, b) => a.periodNumber - b.periodNumber);
  }, [entries, selectedClassId, selectedSectionId, selectedDay, search]);

  const openCreateModal = () => {
    if (!selectedClassId || !selectedSectionId) {
      showAlert("Choose a class and section", "Select a class and section before adding a period.");
      return;
    }
    setEditingId(null);
    setFormDay(selectedDay);
    setFormPeriod("1");
    setFormSubjectId(subjects[0]?.id ?? "");
    setFormTeacherId("");
    setFormStart("08:00");
    setFormEnd("08:45");
    setModalVisible(true);
  };

  const openEditModal = (entry: TimetableEntry) => {
    setEditingId(entry.id);
    setFormDay(entry.dayOfWeek);
    setFormPeriod(String(entry.periodNumber));
    setFormSubjectId(entry.subjectId);
    setFormTeacherId(entry.teacherUserId);
    setFormStart(entry.startTime);
    setFormEnd(entry.endTime);
    setModalVisible(true);
  };

  const saveEntry = async () => {
    if (!academicYearId || !selectedClassId || !selectedSectionId ||
        !formSubjectId || !formTeacherId || !formStart.trim() || !formEnd.trim()) {
      showAlert("Missing details", "Choose a subject and assigned teacher, and enter start/end times.");
      return;
    }
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(formStart) ||
        !/^([01]\d|2[0-3]):[0-5]\d$/.test(formEnd) || formStart >= formEnd) {
      showAlert("Invalid time", "Use valid 24-hour times, such as 08:00, and ensure the end time is later.");
      return;
    }
    const payload: TimetableEntryPayload = {
      academicYearId,
      classId: selectedClassId,
      sectionId: selectedSectionId,
      subjectId: formSubjectId,
      teacherUserId: formTeacherId,
      dayOfWeek: formDay,
      periodNumber: Number(formPeriod),
      startTime: formStart,
      endTime: formEnd,
    };
    setSaving(true);
    try {
      if (editingId) {
        await principalTimetableServices.updateEntry(editingId, payload);
      } else {
        await principalTimetableServices.createEntry(payload);
      }
      setSelectedDay(formDay);
      setModalVisible(false);
      await loadEntries();
      showAlert("Saved", editingId ? "Timetable period updated." : "Timetable period created.");
    } catch (error) {
      showAlert("Unable to save period", getMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const deleteEntry = (entry: TimetableEntry) => {
    confirm({
      title: "Delete timetable period?",
      message: `${entry.subject.name} · Period ${entry.periodNumber}`,
      confirmText: "Delete",
      cancelText: "Cancel",
      destructive: true,
    }).then((confirmed) => {
      if (confirmed) {
        deleteEntryConfirmed(entry);
      }
    });
  };

  const deleteEntryConfirmed = async (entry: TimetableEntry) => {
    try {
      await principalTimetableServices.deleteEntry(entry.id);
      await loadEntries();
    } catch (error) {
      showAlert("Unable to delete period", getMessage(error));
    }
  };

  const changeClass = (classId: string) => {
    setSelectedClassId(classId);
    const nextClass = classes.find((item) => item.id === classId);
    setSelectedSectionId(nextClass?.sections[0]?.id ?? "");
    setFormSubjectId("");
    setFormTeacherId("");
  };

  const changeSubject = (subjectId: string) => {
    setFormSubjectId(subjectId);
    const possible = mappings.filter((mapping) => mapping.subjectId === subjectId && mapping.sectionId === selectedSectionId);
    setFormTeacherId(possible[0]?.teacherUserId ?? "");
  };

  if (loadingOptions) {
    return <View style={[styles.center, { backgroundColor: theme.colors.background }]}><ActivityIndicator size="large" /><Text style={styles.statusText}>Loading timetable options…</Text></View>;
  }

  if (loadError) {
    return (
      <View style={[styles.center, styles.padded, { backgroundColor: theme.colors.background }]}>
        <Text variant="titleMedium">Timetable could not be loaded</Text>
        <Text style={styles.statusText}>{loadError}</Text>
        <Button mode="contained" onPress={() => void loadOptions()}>Retry</Button>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.screen, { backgroundColor: theme.colors.background }]} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text variant="headlineSmall" style={styles.title}>Timetable Management</Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            Manage class periods, subjects, and teacher assignments.
          </Text>
        </View>
        <IconButton icon="calendar-clock" size={28} mode="contained-tonal" onPress={openCreateModal} />
      </View>

      <Card style={styles.filterCard}>
        <Card.Content>
          <Text variant="titleSmall" style={styles.fieldLabel}>Academic year</Text>
          <Button mode="outlined" icon="calendar">
            {options?.academicYear.name ?? "Academic year"}
          </Button>
          <View style={styles.filterRow}>
            <View style={styles.filterHalf}>
              <Text variant="titleSmall" style={styles.fieldLabel}>Class</Text>
              <Menu visible={classMenu} onDismiss={() => setClassMenu(false)}
                anchor={<Button mode="outlined" onPress={() => setClassMenu(true)}>{selectedClass?.displayName ?? "Select class"}</Button>}>
                {classes.map((item) => <Menu.Item key={item.id} title={item.displayName} onPress={() => { changeClass(item.id); setClassMenu(false); }} />)}
              </Menu>
            </View>
            <View style={styles.filterHalf}>
              <Text variant="titleSmall" style={styles.fieldLabel}>Section</Text>
              <Menu visible={sectionMenu} onDismiss={() => setSectionMenu(false)}
                anchor={<Button mode="outlined" disabled={!sections.length} onPress={() => setSectionMenu(true)}>{selectedSection?.sectionName ?? "Select section"}</Button>}>
                {sections.map((item) => <Menu.Item key={item.id} title={item.sectionName} onPress={() => { setSelectedSectionId(item.id); setSectionMenu(false); }} />)}
              </Menu>
            </View>
          </View>
        </Card.Content>
      </Card>

      <View style={styles.dayRow}>
        {DAYS.map((day) => <Chip key={day.value} selected={selectedDay === day.value} onPress={() => setSelectedDay(day.value)} compact style={styles.dayChip}>{day.label}</Chip>)}
      </View>

      <Searchbar placeholder="Search subject, teacher, or period" value={search} onChangeText={setSearch} style={styles.search} />

      <View style={styles.sectionHeader}>
        <View>
          <Text variant="titleLarge" style={styles.sectionTitle}>{selectedDay.charAt(0) + selectedDay.slice(1).toLowerCase()} timetable</Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            {selectedClass?.displayName ?? "No class"} · Section {selectedSection?.sectionName ?? "-"} · {visibleEntries.length} periods
          </Text>
        </View>
        <Button mode="contained" icon="plus" onPress={openCreateModal} disabled={!selectedClass || !selectedSection}>Add period</Button>
      </View>

      {loadingEntries ? <ActivityIndicator style={styles.loading} /> : visibleEntries.length === 0 ? (
        <Card mode="outlined" style={styles.emptyCard}>
          <Card.Content style={styles.emptyContent}>
            <Text variant="titleMedium">No periods found</Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: "center" }}>
              There are no timetable entries for this day and section yet.
            </Text>
            <Button mode="contained-tonal" icon="plus" onPress={openCreateModal} disabled={!selectedClass || !selectedSection}>Add first period</Button>
          </Card.Content>
        </Card>
      ) : visibleEntries.map((entry) => (
        <Card key={entry.id} mode="elevated" style={styles.periodCard}>
          <Card.Content>
            <View style={styles.periodRow}>
              <View style={[styles.periodNumber, { backgroundColor: theme.colors.secondaryContainer }]}>
                <Text variant="labelLarge">P{entry.periodNumber}</Text>
              </View>
              <View style={styles.periodDetails}>
                <Text variant="titleMedium">{entry.subject.name}</Text>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>{entry.teacher.name}</Text>
                <Text variant="labelMedium" style={{ color: theme.colors.primary, marginTop: 4 }}>{entry.startTime} – {entry.endTime}</Text>
              </View>
              <View style={styles.actions}>
                <IconButton icon="pencil-outline" size={20} onPress={() => openEditModal(entry)} accessibilityLabel="Edit period" />
                <IconButton icon="delete-outline" size={20} onPress={() => deleteEntry(entry)} accessibilityLabel="Delete period" />
              </View>
            </View>
          </Card.Content>
        </Card>
      ))}

      <Modal visible={modalVisible} onDismiss={() => !saving && setModalVisible(false)} contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.surface }]}>
        <ScrollView keyboardShouldPersistTaps="handled">
          <View style={styles.modalHeader}>
            <Text variant="titleLarge">{editingId ? "Edit period" : "Add timetable period"}</Text>
            <IconButton icon="close" disabled={saving} onPress={() => setModalVisible(false)} />
          </View>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 12 }}>
            {selectedClass?.displayName} · Section {selectedSection?.sectionName} · {options?.academicYear.name}
          </Text>

          <Text variant="titleSmall" style={styles.fieldLabel}>Day</Text>
          <View style={styles.dayRow}>
            {DAYS.map((day) => <Chip key={day.value} selected={formDay === day.value} onPress={() => setFormDay(day.value)} compact style={styles.dayChip}>{day.label}</Chip>)}
          </View>

          <Text variant="titleSmall" style={styles.fieldLabel}>Period number</Text>
          <Menu visible={periodMenu} onDismiss={() => setPeriodMenu(false)}
            anchor={<Button mode="outlined" onPress={() => setPeriodMenu(true)}>Period {formPeriod}</Button>}>
            {PERIODS.map((period) => <Menu.Item key={period} title={`Period ${period}`} onPress={() => { setFormPeriod(String(period)); setPeriodMenu(false); }} />)}
          </Menu>

          <Text variant="titleSmall" style={styles.fieldLabel}>Subject</Text>
          <Menu visible={subjectMenu} onDismiss={() => setSubjectMenu(false)}
            anchor={<Button mode="outlined" icon="book-open-variant" onPress={() => setSubjectMenu(true)}>{subjects.find((item) => item.id === formSubjectId)?.name ?? "Choose subject"}</Button>}>
            {subjects.map((subject) => <Menu.Item key={subject.id} title={`${subject.name}${subject.code ? ` (${subject.code})` : ""}`} onPress={() => { changeSubject(subject.id); setSubjectMenu(false); }} />)}
          </Menu>

          <Text variant="titleSmall" style={styles.fieldLabel}>Assigned teacher</Text>
          <Menu visible={teacherMenu} onDismiss={() => setTeacherMenu(false)}
            anchor={<Button mode="outlined" icon="account-tie" onPress={() => setTeacherMenu(true)}>{eligibleTeachers.find((item) => item.id === formTeacherId)?.name ?? "Choose assigned teacher"}</Button>}>
            {eligibleTeachers.map((teacher) => <Menu.Item key={teacher.id} title={teacher.name} onPress={() => { setFormTeacherId(teacher.id); setTeacherMenu(false); }} />)}
          </Menu>
          {formSubjectId && eligibleTeachers.length === 0 && (
            <Text variant="bodySmall" style={styles.warningText}>No teacher-subject mapping exists for this subject and section in the selected academic year. Create that mapping first.</Text>
          )}

          <View style={styles.filterRow}>
            <View style={styles.filterHalf}>
              <Text variant="titleSmall" style={styles.fieldLabel}>Start time (24h)</Text>
              <TextInput mode="outlined" value={formStart} onChangeText={setFormStart} placeholder="08:00" />
            </View>
            <View style={styles.filterHalf}>
              <Text variant="titleSmall" style={styles.fieldLabel}>End time (24h)</Text>
              <TextInput mode="outlined" value={formEnd} onChangeText={setFormEnd} placeholder="08:45" />
            </View>
          </View>

          <Divider style={styles.modalDivider} />
          <View style={styles.modalActions}>
            <Button mode="outlined" disabled={saving} onPress={() => setModalVisible(false)}>Cancel</Button>
            <Button mode="contained" icon="content-save" loading={saving} disabled={saving || !eligibleTeachers.some((teacher) => teacher.id === formTeacherId)} onPress={() => void saveEntry()}>
              Save period
            </Button>
          </View>
        </ScrollView>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 16, paddingBottom: 32, gap: 14 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  padded: { padding: 24 },
  statusText: { textAlign: "center", marginVertical: 8 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  headerText: { flex: 1, gap: 4 },
  title: { fontWeight: "700" },
  filterCard: { borderRadius: 16 },
  fieldLabel: { marginBottom: 6, marginTop: 8, fontWeight: "600" },
  filterRow: { flexDirection: "row", gap: 10, marginTop: 8 },
  filterHalf: { flex: 1, minWidth: 0 },
  dayRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, alignItems: "center" },
  dayChip: { marginBottom: 2 },
  search: { borderRadius: 12 },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" },
  sectionTitle: { fontWeight: "700" },
  loading: { marginVertical: 20 },
  emptyCard: { borderRadius: 16 },
  emptyContent: { alignItems: "center", gap: 12, paddingVertical: 24 },
  periodCard: { borderRadius: 14 },
  periodRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  periodNumber: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  periodDetails: { flex: 1, minWidth: 0 },
  actions: { flexDirection: "row", alignItems: "center" },
  modal: { margin: 16, padding: 18, borderRadius: 18, maxHeight: "90%" },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  modalDivider: { marginVertical: 16 },
  modalActions: { flexDirection: "row", justifyContent: "flex-end", gap: 8, marginBottom: 4 },
  warningText: { marginTop: 8, color: "#B45309" },
});
