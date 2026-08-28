import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { classServices } from "../../services/classServices";
import { academicYearServices } from "../../services/academicYearServices";

/* ============================================================
   TYPES
============================================================ */

type AcademicYear = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
};

type ClassItem = {
  id: string;
  classNumber: string;
  displayName: string;
  tuitionFee: string;
  textBookFee: string;
  noteBookFee: string;
  diaryFee: string;
  academicYearId: string;
  academicYear?: string;
  isCompleted: boolean;
};

/* ============================================================
   HELPERS
============================================================ */

const formatDate = (value: string) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getTotalFee = (item: ClassItem) => {
  return (
    Number(item.tuitionFee || 0) +
    Number(item.textBookFee || 0) +
    Number(item.noteBookFee || 0) +
    Number(item.diaryFee || 0)
  );
};

/* ============================================================
   COMPONENT
============================================================ */

const ClassManagementScreen = () => {
  /* ----------------------------------------------------------
     STATE
  ---------------------------------------------------------- */

  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [selectedAcademicYearId, setSelectedAcademicYearId] =
    useState("");

  const [classes, setClasses] = useState<ClassItem[]>([]);

  const [loadingYears, setLoadingYears] = useState(true);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [showYearSelector, setShowYearSelector] = useState(false);
  const [showClassModal, setShowClassModal] = useState(false);

  const [editingClass, setEditingClass] =
    useState<ClassItem | null>(null);

  const [saving, setSaving] = useState(false);

  /* ----------------------------------------------------------
     FORM
  ---------------------------------------------------------- */

  const [classNumber, setClassNumber] = useState("");
  const [displayName, setDisplayName] = useState("");

  const [tuitionFee, setTuitionFee] = useState("");
  const [textBookFee, setTextBookFee] = useState("");
  const [noteBookFee, setNoteBookFee] = useState("");
  const [diaryFee, setDiaryFee] = useState("");

  /* ==========================================================
     LOAD ACADEMIC YEARS
  ========================================================== */

  const loadAcademicYears = async () => {
    try {
      setLoadingYears(true);

      const response =
        await academicYearServices.getAcademicYears();

      const years = response.academicYears ?? [];

      setAcademicYears(years);

      /*
       * Prefer current academic year.
       */

      const currentYear =
        years.find(
          (year: AcademicYear) => year.isCurrent
        );

      if (currentYear) {
        setSelectedAcademicYearId(currentYear.id);
      } else if (years.length > 0) {
        setSelectedAcademicYearId(years[0].id);
      }
    } catch (error: any) {
      Alert.alert(
        "Error",
        error?.response?.data?.message ??
          "Unable to load academic years"
      );
    } finally {
      setLoadingYears(false);
    }
  };

  /* ==========================================================
     LOAD CLASSES
  ========================================================== */

  const loadClasses = async () => {
    if (!selectedAcademicYearId) {
      setClasses([]);
      return;
    }

    try {
      setLoadingClasses(true);

      const response =
        await classServices.getClassesByAcademicYear(
          selectedAcademicYearId
        );

      const normalizedClasses =
        (response.classes ?? []).map((cls: any) => ({
          id: cls.id ?? "",
          classNumber: String(cls.classNumber ?? ""),
          displayName:
            cls.displayName ?? cls.classNumber ?? "",
          tuitionFee: String(cls.tuitionFee ?? ""),
          textBookFee: String(cls.textBookFee ?? ""),
          noteBookFee: String(cls.noteBookFee ?? ""),
          diaryFee: String(cls.diaryFee ?? ""),
          academicYearId:
            cls.academicYearId ?? selectedAcademicYearId,
          academicYear: cls.academicYear,
          isCompleted: Boolean(cls.isCompleted),
        }));

      setClasses(normalizedClasses as ClassItem[]);
    } catch (error: any) {
      Alert.alert(
        "Error",
        error?.response?.data?.message ??
          "Unable to load classes"
      );
    } finally {
      setLoadingClasses(false);
    }
  };

  /* ==========================================================
     INITIAL LOAD
  ========================================================== */

  useEffect(() => {
    loadAcademicYears();
  }, []);

  /* ==========================================================
     YEAR CHANGE
  ========================================================== */

  useEffect(() => {
    if (selectedAcademicYearId) {
      loadClasses();
    }
  }, [selectedAcademicYearId]);

  /* ==========================================================
     SELECTED YEAR
  ========================================================== */

  const selectedYear = useMemo(
    () =>
      academicYears.find(
        year =>
          year.id === selectedAcademicYearId
      ),
    [
      academicYears,
      selectedAcademicYearId,
    ]
  );

  /* ==========================================================
     REFRESH
  ========================================================== */

  const onRefresh = async () => {
    try {
      setRefreshing(true);

      await Promise.all([
        loadAcademicYears(),
        loadClasses(),
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  /* ==========================================================
     OPEN CREATE
  ========================================================== */

  const openCreateModal = () => {
    setEditingClass(null);

    setClassNumber("");
    setDisplayName("");
    setTuitionFee("");
    setTextBookFee("");
    setNoteBookFee("");
    setDiaryFee("");

    setShowClassModal(true);
  };

  /* ==========================================================
     OPEN EDIT
  ========================================================== */

  const openEditModal = (item: ClassItem) => {
    setEditingClass(item);

    setClassNumber(item.classNumber);
    setDisplayName(item.displayName);

    setTuitionFee(
      String(item.tuitionFee ?? "")
    );

    setTextBookFee(
      String(item.textBookFee ?? "")
    );

    setNoteBookFee(
      String(item.noteBookFee ?? "")
    );

    setDiaryFee(
      String(item.diaryFee ?? "")
    );

    setShowClassModal(true);
  };

  /* ==========================================================
     VALIDATE FORM
  ========================================================== */

  const validateForm = () => {
    if (!selectedAcademicYearId) {
      Alert.alert(
        "Academic Year",
        "Please select an academic year."
      );
      return false;
    }

    if (!classNumber.trim()) {
      Alert.alert(
        "Class Number",
        "Please enter class number."
      );
      return false;
    }

    if (!tuitionFee.trim()) {
      Alert.alert(
        "Tuition Fee",
        "Please enter tuition fee."
      );
      return false;
    }

    if (!textBookFee.trim()) {
      Alert.alert(
        "Text Book Fee",
        "Please enter text book fee."
      );
      return false;
    }

    if (!noteBookFee.trim()) {
      Alert.alert(
        "Note Book Fee",
        "Please enter note book fee."
      );
      return false;
    }

    if (!diaryFee.trim()) {
      Alert.alert(
        "Diary Fee",
        "Please enter diary fee."
      );
      return false;
    }

    const fees = [
      tuitionFee,
      textBookFee,
      noteBookFee,
      diaryFee,
    ];

    for (const fee of fees) {
      if (
        !Number.isFinite(
          Number(fee)
        ) ||
        Number(fee) < 0
      ) {
        Alert.alert(
          "Invalid Fee",
          "All fees must be valid non-negative numbers."
        );
        return false;
      }
    }

    return true;
  };

  /* ==========================================================
     CREATE / UPDATE
  ========================================================== */

  const saveClass = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);

      if (editingClass) {
        await classServices.editClassDetails({
          classNumber:
            editingClass.classNumber,

          displayName:
            displayName.trim(),

          tuitionFee:
            tuitionFee.trim(),

          textBookFee:
            textBookFee.trim(),

          noteBookFee:
            noteBookFee.trim(),

          diaryFee:
            diaryFee.trim(),

          academicYearId:
            selectedAcademicYearId,
        } as any);

        Alert.alert(
          "Success",
          "Class updated successfully."
        );
      } else {
        await classServices.createClass({
          classNumber:
            classNumber.trim(),

          displayName:
            displayName.trim() ||
            classNumber.trim(),

          tuitionFee:
            tuitionFee.trim(),

          textBookFee:
            textBookFee.trim(),

          noteBookFee:
            noteBookFee.trim(),

          diaryFee:
            diaryFee.trim(),

          academicYearId:
            selectedAcademicYearId,
        } as any);

        Alert.alert(
          "Success",
          "Class created successfully."
        );
      }

      setShowClassModal(false);

      await loadClasses();
    } catch (error: any) {
      Alert.alert(
        "Unable to save",
        error?.response?.data?.message ??
          "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  };

  /* ==========================================================
     DELETE
  ========================================================== */

  const confirmDelete = (item: ClassItem) => {
    Alert.alert(
      "Delete Class",
      `Delete Class ${item.displayName}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () =>
            deleteClass(item),
        },
      ]
    );
  };

  const deleteClass = async (
    item: ClassItem
  ) => {
    try {
      setLoadingClasses(true);

      await classServices.deleteClass({
        classNumber:
          item.classNumber,

        academicYearId:
          item.academicYearId,
      } as any);

      Alert.alert(
        "Deleted",
        "Class deleted successfully."
      );

      await loadClasses();
    } catch (error: any) {
      Alert.alert(
        "Unable to delete",
        error?.response?.data?.message ??
          "Class could not be deleted."
      );
    } finally {
      setLoadingClasses(false);
    }
  };

  /* ==========================================================
     CLASS CARD
  ========================================================== */

  const renderClass = ({
    item,
  }: {
    item: ClassItem;
  }) => {
    const totalFee =
      getTotalFee(item);

    return (
      <View style={styles.card}>

        {/* HEADER */}

        <View style={styles.cardHeader}>
          <View style={styles.classBadge}>
            <Text style={styles.classBadgeText}>
              {item.classNumber}
            </Text>
          </View>

          <View style={styles.classTitleContainer}>
            <Text style={styles.classTitle}>
              {item.displayName}
            </Text>

            <Text style={styles.classSubtitle}>
              Class {item.classNumber}
            </Text>
          </View>

          {item.isCompleted && (
            <View style={styles.completedBadge}>
              <Text style={styles.completedText}>
                Completed
              </Text>
            </View>
          )}
        </View>

        {/* FEES */}

        <View style={styles.feeGrid}>

          <FeeItem
            title="Tuition"
            value={item.tuitionFee}
          />

          <FeeItem
            title="Text Book"
            value={item.textBookFee}
          />

          <FeeItem
            title="Note Book"
            value={item.noteBookFee}
          />

          <FeeItem
            title="Diary"
            value={item.diaryFee}
          />

        </View>

        {/* TOTAL */}

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>
            Total Annual Fee
          </Text>

          <Text style={styles.totalValue}>
            ₹ {totalFee.toLocaleString("en-IN")}
          </Text>
        </View>

        {/* ACTIONS */}

        <View style={styles.actions}>

          <Pressable
            style={[
              styles.actionButton,
              styles.editButton,
            ]}
            onPress={() =>
              openEditModal(item)
            }
          >
            <Text style={styles.editButtonText}>
              Edit
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.actionButton,
              styles.deleteButton,
            ]}
            onPress={() =>
              confirmDelete(item)
            }
          >
            <Text style={styles.deleteButtonText}>
              Delete
            </Text>
          </Pressable>

        </View>

      </View>
    );
  };

  /* ==========================================================
     LOADING
  ========================================================== */

  if (loadingYears) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>
            Loading academic years...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  /* ==========================================================
     SCREEN
  ========================================================== */

  return (
    <SafeAreaView style={styles.container}>

      {/* ======================================================
          HEADER
      ====================================================== */}

      <View style={styles.header}>

        <View>
          <Text style={styles.headerTitle}>
            Class Management
          </Text>

          <Text style={styles.headerSubtitle}>
            Manage classes and annual fees
          </Text>
        </View>

        <Pressable
          style={styles.addButton}
          onPress={openCreateModal}
        >
          <Text style={styles.addButtonText}>
            + Add Class
          </Text>
        </Pressable>

      </View>

      {/* ======================================================
          ACADEMIC YEAR SELECTOR
      ====================================================== */}

      <Pressable
        style={styles.yearSelector}
        onPress={() =>
          setShowYearSelector(true)
        }
      >

        <View>
          <Text style={styles.selectorLabel}>
            Academic Year
          </Text>

          <Text style={styles.selectorValue}>
            {selectedYear?.name ??
              "Select academic year"}
          </Text>
        </View>

        <Text style={styles.chevron}>
          ▼
        </Text>

      </Pressable>

      {/* ======================================================
          SUMMARY
      ====================================================== */}

      <View style={styles.summary}>

        <SummaryItem
          label="Classes"
          value={classes.length}
        />

        <SummaryItem
          label="Academic Year"
          value={
            selectedYear?.name ?? "-"
          }
        />

      </View>

      {/* ======================================================
          CLASS LIST
      ====================================================== */}

      {loadingClasses ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" />

          <Text style={styles.loadingText}>
            Loading classes...
          </Text>
        </View>
      ) : (
        <FlatList
          data={classes}
          keyExtractor={item =>
            item.id
          }
          renderItem={renderClass}
          contentContainerStyle={
            classes.length === 0
              ? styles.emptyContainer
              : styles.list
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          }
          ListEmptyComponent={
            <View style={styles.empty}>

              <Text style={styles.emptyIcon}>
                📚
              </Text>

              <Text style={styles.emptyTitle}>
                No Classes
              </Text>

              <Text style={styles.emptyText}>
                No classes have been created
                for this academic year.
              </Text>

              <Pressable
                style={styles.emptyButton}
                onPress={openCreateModal}
              >
                <Text style={styles.emptyButtonText}>
                  + Create First Class
                </Text>
              </Pressable>

            </View>
          }
        />
      )}

      {/* ======================================================
          YEAR MODAL
      ====================================================== */}

      <Modal
        visible={showYearSelector}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setShowYearSelector(false)
        }
      >

        <Pressable
          style={styles.modalOverlay}
          onPress={() =>
            setShowYearSelector(false)
          }
        >

          <Pressable
            style={styles.yearModal}
            onPress={e =>
              e.stopPropagation()
            }
          >

            <Text style={styles.modalTitle}>
              Select Academic Year
            </Text>

            <ScrollView>

              {academicYears.map(
                year => (
                  <Pressable
                    key={year.id}
                    style={[
                      styles.yearOption,
                      year.id ===
                        selectedAcademicYearId &&
                        styles.selectedYearOption,
                    ]}
                    onPress={() => {
                      setSelectedAcademicYearId(
                        year.id
                      );

                      setShowYearSelector(
                        false
                      );
                    }}
                  >

                    <View
                      style={
                        styles.yearOptionContent
                      }
                    >

                      <Text
                        style={[
                          styles.yearOptionName,
                          year.id ===
                            selectedAcademicYearId &&
                            styles.selectedYearText,
                        ]}
                      >
                        {year.name}
                      </Text>

                      <Text
                        style={
                          styles.yearOptionDates
                        }
                      >
                        {formatDate(
                          year.startDate
                        )}{" "}
                        -{" "}
                        {formatDate(
                          year.endDate
                        )}
                      </Text>

                    </View>

                    {year.isCurrent && (
                      <View
                        style={
                          styles.currentBadge
                        }
                      >
                        <Text
                          style={
                            styles.currentBadgeText
                          }
                        >
                          CURRENT
                        </Text>
                      </View>
                    )}

                  </Pressable>
                )
              )}

            </ScrollView>

          </Pressable>

        </Pressable>

      </Modal>

      {/* ======================================================
          CREATE / EDIT MODAL
      ====================================================== */}

      <Modal
        visible={showClassModal}
        transparent
        animationType="slide"
        onRequestClose={() =>
          setShowClassModal(false)
        }
      >

        <View style={styles.modalOverlay}>

          <View style={styles.classModal}>

            <View style={styles.modalHeader}>

              <View>
                <Text style={styles.modalTitle}>
                  {editingClass
                    ? "Edit Class"
                    : "Create Class"}
                </Text>

                <Text
                  style={
                    styles.modalSubtitle
                  }
                >
                  {selectedYear?.name}
                </Text>
              </View>

              <Pressable
                onPress={() =>
                  setShowClassModal(false)
                }
              >
                <Text style={styles.closeButton}>
                  ✕
                </Text>
              </Pressable>

            </View>

            <ScrollView
              showsVerticalScrollIndicator={
                false
              }
            >

              {/* CLASS NUMBER */}

              <Input
                label="Class Number"
                value={classNumber}
                onChangeText={
                  setClassNumber
                }
                placeholder="e.g. 1"
                keyboardType="default"
                editable={
                  !Boolean(editingClass)
                }
              />

              {/* DISPLAY NAME */}

              <Input
                label="Display Name"
                value={displayName}
                onChangeText={
                  setDisplayName
                }
                placeholder="e.g. Class 1"
              />

              <Text style={styles.sectionLabel}>
                Annual Fees
              </Text>

              {/* TUITION */}

              <Input
                label="Tuition Fee"
                value={tuitionFee}
                onChangeText={
                  setTuitionFee
                }
                placeholder="0"
                keyboardType="decimal-pad"
              />

              {/* TEXT BOOK */}

              <Input
                label="Text Book Fee"
                value={textBookFee}
                onChangeText={
                  setTextBookFee
                }
                placeholder="0"
                keyboardType="decimal-pad"
              />

              {/* NOTE BOOK */}

              <Input
                label="Note Book Fee"
                value={noteBookFee}
                onChangeText={
                  setNoteBookFee
                }
                placeholder="0"
                keyboardType="decimal-pad"
              />

              {/* DIARY */}

              <Input
                label="Diary Fee"
                value={diaryFee}
                onChangeText={
                  setDiaryFee
                }
                placeholder="0"
                keyboardType="decimal-pad"
              />

              {/* TOTAL */}

              <View style={styles.formTotal}>

                <Text
                  style={
                    styles.formTotalLabel
                  }
                >
                  Total Annual Fee
                </Text>

                <Text
                  style={
                    styles.formTotalValue
                  }
                >
                  ₹{" "}
                  {(
                    Number(
                      tuitionFee || 0
                    ) +
                    Number(
                      textBookFee || 0
                    ) +
                    Number(
                      noteBookFee || 0
                    ) +
                    Number(
                      diaryFee || 0
                    )
                  ).toLocaleString("en-IN")}
                </Text>

              </View>

              {/* SAVE */}

              <Pressable
                style={[
                  styles.saveButton,
                  saving &&
                    styles.disabledButton,
                ]}
                disabled={saving}
                onPress={saveClass}
              >

                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text
                    style={
                      styles.saveButtonText
                    }
                  >
                    {editingClass
                      ? "Update Class"
                      : "Create Class"}
                  </Text>
                )}

              </Pressable>

            </ScrollView>

          </View>

        </View>

      </Modal>

    </SafeAreaView>
  );
};

/* ============================================================
   SMALL COMPONENTS
============================================================ */

const FeeItem = ({
  title,
  value,
}: {
  title: string;
  value: string;
}) => (
  <View style={styles.feeItem}>
    <Text style={styles.feeTitle}>
      {title}
    </Text>

    <Text style={styles.feeValue}>
      ₹ {Number(value || 0).toLocaleString("en-IN")}
    </Text>
  </View>
);

const SummaryItem = ({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) => (
  <View style={styles.summaryItem}>
    <Text style={styles.summaryLabel}>
      {label}
    </Text>

    <Text style={styles.summaryValue}>
      {value}
    </Text>
  </View>
);

const Input = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  editable = true,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  keyboardType?: any;
  editable?: boolean;
}) => (
  <View style={styles.inputContainer}>

    <Text style={styles.inputLabel}>
      {label}
    </Text>

    <TextInput
      style={[
        styles.input,
        !editable &&
          styles.disabledInput,
      ]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      keyboardType={keyboardType}
      editable={editable}
      placeholderTextColor="#94a3b8"
    />

  </View>
);

/* ============================================================
   STYLES
============================================================ */

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#0f172a",
  },

  headerSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: "#64748b",
  },

  addButton: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 10,
  },

  addButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },

  yearSelector: {
    marginHorizontal: 20,
    padding: 15,
    borderRadius: 14,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  selectorLabel: {
    fontSize: 11,
    color: "#64748b",
    textTransform: "uppercase",
    fontWeight: "700",
  },

  selectorValue: {
    marginTop: 4,
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
  },

  chevron: {
    color: "#64748b",
    fontSize: 12,
  },

  summary: {
    marginHorizontal: 20,
    marginVertical: 14,
    padding: 16,
    borderRadius: 14,
    backgroundColor: "#0f172a",
    flexDirection: "row",
  },

  summaryItem: {
    flex: 1,
  },

  summaryLabel: {
    color: "#94a3b8",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
  },

  summaryValue: {
    marginTop: 4,
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
  },

  list: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  classBadge: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#dbeafe",
    alignItems: "center",
    justifyContent: "center",
  },

  classBadgeText: {
    color: "#1d4ed8",
    fontSize: 18,
    fontWeight: "800",
  },

  classTitleContainer: {
    flex: 1,
    marginLeft: 12,
  },

  classTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0f172a",
  },

  classSubtitle: {
    marginTop: 3,
    fontSize: 12,
    color: "#64748b",
  },

  completedBadge: {
    backgroundColor: "#dcfce7",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },

  completedText: {
    color: "#15803d",
    fontSize: 10,
    fontWeight: "800",
  },

  feeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 18,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#f1f5f9",
    paddingVertical: 12,
  },

  feeItem: {
    width: "50%",
    paddingVertical: 5,
  },

  feeTitle: {
    fontSize: 11,
    color: "#64748b",
  },

  feeValue: {
    marginTop: 3,
    fontSize: 13,
    fontWeight: "700",
    color: "#334155",
  },

  totalRow: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  totalLabel: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "600",
  },

  totalValue: {
    fontSize: 16,
    color: "#0f172a",
    fontWeight: "800",
  },

  actions: {
    flexDirection: "row",
    marginTop: 14,
    gap: 10,
  },

  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 9,
    alignItems: "center",
  },

  editButton: {
    backgroundColor: "#eff6ff",
  },

  editButtonText: {
    color: "#2563eb",
    fontWeight: "700",
  },

  deleteButton: {
    backgroundColor: "#fef2f2",
  },

  deleteButtonText: {
    color: "#dc2626",
    fontWeight: "700",
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    marginTop: 10,
    color: "#64748b",
  },

  emptyContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },

  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyIcon: {
    fontSize: 48,
  },

  emptyTitle: {
    marginTop: 12,
    fontSize: 20,
    fontWeight: "800",
    color: "#0f172a",
  },

  emptyText: {
    marginTop: 6,
    textAlign: "center",
    color: "#64748b",
    lineHeight: 20,
  },

  emptyButton: {
    marginTop: 18,
    backgroundColor: "#2563eb",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 10,
  },

  emptyButtonText: {
    color: "#fff",
    fontWeight: "700",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.5)",
    justifyContent: "center",
    padding: 20,
  },

  yearModal: {
    maxHeight: "75%",
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 20,
  },

  classModal: {
    maxHeight: "92%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0f172a",
  },

  modalSubtitle: {
    marginTop: 4,
    color: "#64748b",
    fontSize: 12,
  },

  closeButton: {
    fontSize: 20,
    color: "#64748b",
  },

  yearOption: {
    padding: 15,
    borderRadius: 12,
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
  },

  selectedYearOption: {
    backgroundColor: "#eff6ff",
  },

  yearOptionContent: {
    flex: 1,
  },

  yearOptionName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#334155",
  },

  selectedYearText: {
    color: "#2563eb",
  },

  yearOptionDates: {
    marginTop: 4,
    fontSize: 11,
    color: "#64748b",
  },

  currentBadge: {
    backgroundColor: "#dcfce7",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 7,
  },

  currentBadgeText: {
    color: "#15803d",
    fontSize: 9,
    fontWeight: "800",
  },

  inputContainer: {
    marginBottom: 15,
  },

  inputLabel: {
    marginBottom: 6,
    fontSize: 12,
    color: "#334155",
    fontWeight: "700",
  },

  input: {
    height: 46,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    paddingHorizontal: 13,
    fontSize: 14,
    color: "#0f172a",
    backgroundColor: "#fff",
  },

  disabledInput: {
    backgroundColor: "#f1f5f9",
    color: "#64748b",
  },

  sectionLabel: {
    marginTop: 5,
    marginBottom: 12,
    fontSize: 14,
    fontWeight: "800",
    color: "#0f172a",
  },

  formTotal: {
    marginTop: 3,
    marginBottom: 18,
    padding: 15,
    borderRadius: 12,
    backgroundColor: "#f8fafc",
    flexDirection: "row",
    justifyContent: "space-between",
  },

  formTotalLabel: {
    color: "#64748b",
    fontWeight: "600",
  },

  formTotalValue: {
    color: "#0f172a",
    fontWeight: "800",
  },

  saveButton: {
    minHeight: 48,
    borderRadius: 11,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  disabledButton: {
    opacity: 0.6,
  },

  saveButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
  },

});

export default ClassManagementScreen;