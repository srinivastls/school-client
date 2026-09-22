import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList, RootStackScreenNames } from "../../types";
import { Colors } from "../../theme";
import { studentServices } from "../../services/studentServices";

type Props = NativeStackScreenProps<
  RootStackParamList,
  RootStackScreenNames.AdminStudentManagement
>;

type StudentRecord = {
  id: string;
  admissionNo: string;
  name: string;
  className: string;
  section: string;
  status: string;
  raw: any;
};

const FILTERS = ["ALL", "ACTIVE", "INACTIVE", "PENDING"];

const asArray = (value: any): any[] => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.data?.students)) return value.data.students;
  if (Array.isArray(value?.students)) return value.students;
  if (Array.isArray(value?.data?.data)) return value.data.data;
  return [];
};

const normalize = (item: any, index: number): StudentRecord => ({
  id: String(
    item?.id ??
      item?.studentId ??
      item?.admissionNo ??
      item?.admissionNumber ??
      `student-${index}`,
  ),
  admissionNo: String(
    item?.admissionNo ?? item?.admissionNumber ?? item?.admission_id ?? "—",
  ),
  name: String(item?.name ?? item?.studentName ?? "Unnamed student"),
  className: String(
    item?.classNumber ??
      item?.class?.classNumber ??
      item?.class?.displayName ??
      item?.className ??
      "—",
  ),
  section: String(
    item?.sectionName ?? item?.section?.sectionName ?? item?.section?.name ?? "—",
  ),
  status: String(item?.status ?? item?.studentStatus ?? "ACTIVE").toUpperCase(),
  raw: item,
});

export const AdminStudentManagement = ({ navigation }: Props) => {
  const [academicYearId, setAcademicYearId] = useState("");
  const [classNumber, setClassNumber] = useState("");
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadStudents = useCallback(async () => {
    if (!classNumber.trim()) {
      Alert.alert("Class required", "Enter a class number before loading students.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await studentServices.getStudentsByClass({
        classNumber: classNumber.trim(),
        ...(academicYearId.trim() ? { academicYearId: academicYearId.trim() } : {}),
      });

      setStudents(asArray(response).map(normalize));
    } catch (requestError: any) {
      const message =
        requestError?.response?.data?.message ??
        requestError?.message ??
        "Unable to load students.";
      setError(message);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, [academicYearId, classNumber]);

  const visibleStudents = useMemo(() => {
    const query = search.trim().toLowerCase();

    return students.filter((student) => {
      const matchesSearch =
        !query ||
        student.name.toLowerCase().includes(query) ||
        student.admissionNo.toLowerCase().includes(query);

      const matchesFilter =
        filter === "ALL" ||
        (filter === "ACTIVE" && student.status === "ACTIVE") ||
        (filter === "INACTIVE" && student.status === "INACTIVE") ||
        (filter === "PENDING" && student.status === "PENDING");

      return matchesSearch && matchesFilter;
    });
  }, [filter, search, students]);

  useEffect(() => {
    setStudents([]);
  }, [classNumber, academicYearId]);

  const renderStudent = ({ item }: { item: StudentRecord }) => (
    <View style={styles.studentCard}>
      <View style={styles.studentMain}>
        <Text style={styles.studentName}>{item.name}</Text>
        <Text style={styles.meta}>Admission: {item.admissionNo}</Text>
        <Text style={styles.meta}>
          Class {item.className} · Section {item.section}
        </Text>
        <Text style={styles.status}>{item.status}</Text>
      </View>

      <View style={styles.actions}>
        <Pressable
          style={styles.secondaryButton}
          onPress={() =>
            navigation.navigate(RootStackScreenNames.AdminStudentDetails, {
              admissionNo: item.admissionNo,
            })
          }
        >
          <Text style={styles.secondaryButtonText}>View</Text>
        </Pressable>

        <Pressable
          style={styles.primaryButton}
          onPress={() =>
            navigation.navigate(RootStackScreenNames.AdminStudentEdit, {
              admissionNo: item.admissionNo,
            })
          }
        >
          <Text style={styles.primaryButtonText}>Edit</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Student Administration</Text>
          <Text style={styles.subtitle}>Manage student records and enrollment data</Text>
        </View>
        <Pressable
          style={styles.addButton}
          onPress={() => navigation.navigate(RootStackScreenNames.StudentRegistration)}
        >
          <Text style={styles.addButtonText}>+ Add</Text>
        </Pressable>
      </View>

      <View style={styles.controls}>
        <TextInput
          value={academicYearId}
          onChangeText={setAcademicYearId}
          placeholder="Academic year ID (optional)"
          placeholderTextColor={Colors.textSecondary}
          style={styles.input}
        />
        <View style={styles.row}>
          <TextInput
            value={classNumber}
            onChangeText={setClassNumber}
            placeholder="Class number"
            placeholderTextColor={Colors.textSecondary}
            style={[styles.input, styles.flexInput]}
          />
          <Pressable style={styles.loadButton} onPress={loadStudents}>
            <Text style={styles.loadButtonText}>Load</Text>
          </Pressable>
        </View>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search by name or admission number"
          placeholderTextColor={Colors.textSecondary}
          style={styles.input}
        />
      </View>

      <View style={styles.filterRow}>
        {FILTERS.map((value) => (
          <Pressable
            key={value}
            onPress={() => setFilter(value)}
            style={[styles.filterChip, filter === value && styles.filterChipActive]}
          >
            <Text
              style={[
                styles.filterText,
                filter === value && styles.filterTextActive,
              ]}
            >
              {value}
            </Text>
          </Pressable>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator style={styles.loader} color={Colors.brandPrimary} />
      ) : error ? (
        <View style={styles.empty}>
          <Text style={styles.error}>{error}</Text>
          <Pressable style={styles.loadButton} onPress={loadStudents}>
            <Text style={styles.loadButtonText}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={visibleStudents}
          keyExtractor={(item) => item.id}
          renderItem={renderStudent}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <Text style={styles.count}>
              Showing {visibleStudents.length} of {students.length} students
            </Text>
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No students found</Text>
              <Text style={styles.emptyText}>
                Enter a class number and load students from the server.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background, padding: 16 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12 },
  title: { fontSize: 24, fontWeight: "800", color: Colors.text },
  subtitle: { marginTop: 4, color: Colors.textSecondary, fontSize: 13 },
  addButton: { backgroundColor: Colors.brandPrimary, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },
  addButtonText: { color: Colors.textOnPrimary, fontWeight: "800" },
  controls: { marginTop: 18, gap: 10 },
  row: { flexDirection: "row", gap: 8 },
  flexInput: { flex: 1 },
  input: { borderWidth: 1, borderColor: Colors.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 11, color: Colors.text, backgroundColor: Colors.background },
  loadButton: { backgroundColor: Colors.brandPrimary, borderRadius: 10, paddingHorizontal: 18, justifyContent: "center", alignItems: "center" },
  loadButtonText: { color: Colors.textOnPrimary, fontWeight: "800" },
  filterRow: { flexDirection: "row", gap: 8, marginVertical: 14, flexWrap: "wrap" },
  filterChip: { borderWidth: 1, borderColor: Colors.border, borderRadius: 20, paddingHorizontal: 13, paddingVertical: 8 },
  filterChipActive: { backgroundColor: Colors.brandPrimary, borderColor: Colors.brandPrimary },
  filterText: { color: Colors.textSecondary, fontWeight: "700", fontSize: 12 },
  filterTextActive: { color: Colors.textOnPrimary },
  count: { color: Colors.textSecondary, marginBottom: 10, fontSize: 12 },
  list: { paddingBottom: 30 },
  studentCard: { borderWidth: 1, borderColor: Colors.border, borderRadius: 14, padding: 14, marginBottom: 10, flexDirection: "row", gap: 10 },
  studentMain: { flex: 1 },
  studentName: { fontSize: 16, fontWeight: "800", color: Colors.text },
  meta: { marginTop: 4, color: Colors.textSecondary, fontSize: 12 },
  status: { marginTop: 8, color: Colors.brandPrimary, fontSize: 11, fontWeight: "800" },
  actions: { justifyContent: "center", gap: 8 },
  primaryButton: { backgroundColor: Colors.brandPrimary, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  primaryButtonText: { color: Colors.textOnPrimary, fontWeight: "800", fontSize: 12 },
  secondaryButton: { borderWidth: 1, borderColor: Colors.border, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  secondaryButtonText: { color: Colors.text, fontWeight: "800", fontSize: 12 },
  loader: { marginTop: 40 },
  empty: { alignItems: "center", justifyContent: "center", padding: 30, gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: "800", color: Colors.text },
  emptyText: { color: Colors.textSecondary, textAlign: "center" },
  error: { color: Colors.error, textAlign: "center" },
});
