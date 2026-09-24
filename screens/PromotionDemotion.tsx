import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { Button, Checkbox, TextInput } from "react-native-paper";
import { useQuery } from "react-query";

import { academicYearServices } from "../services/academicYearServices";
import { studentServices } from "../services/studentServices";
import { Colors, Metrics } from "../theme";

/* ============================================================
 * TYPES
 * ============================================================
 */

type AcademicYear = {
  id: string;
  name: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
};

type AcademicYearResponse = {
  id?: string;
  name?: string;
  academicYear?: AcademicYear;
  data?: AcademicYear;
};

type PromotionStatus =
  | "PROMOTED"
  | "DEMOTED"
  | "REPEATED"
  | "NOT_PROMOTED";

type Section = {
  id: string;
  sectionName: string;
};

type ClassDetails = {
  id: string;
  classNumber: string;
  displayName?: string;
  sections?: Section[];
};

type PromotionStudent = {
  id: string;
  admissionNo?: string;
  admissionNumber?: string;
  name: string;
  fatherName?: string;
  phone?: string;
  rollNumber?: string | number;

  currentClass?: {
    id?: string;
    classNumber?: string;
    displayName?: string;
  };

  currentSection?: {
    id?: string;
    sectionName?: string;
  };

  pendingAmount?: number;
  eligible?: boolean;
  eligibilityReason?: string;
};

type PromotionStudentsResponse = {
  sourceAcademicYear?: {
    id: string;
    name: string;
  };

  targetAcademicYear?: {
    id: string;
    name: string;
  };

  summary?: {
    totalStudents?: number;
    eligibleStudents?: number;
    ineligibleStudents?: number;
    total?: number;
    eligible?: number;
    notEligible?: number;
    alreadyProcessed?: number;
  };

  sourceClasses?: ClassDetails[];
  targetClasses?: ClassDetails[];
  students?: PromotionStudent[];
};

type BulkPromotionItem = {
  studentId: string;
  toClassId: string;
  toSectionId: string;
  status: PromotionStatus;
  remark?: string;
};

type BulkPromotionRequest = {
  fromAcademicYearId: string;
  toAcademicYearId: string;
  students: BulkPromotionItem[];
};

type PromotionDemotionProps = {
  sourceAcademicYearId?: string;
};

/* ============================================================
 * HELPERS
 * ============================================================
 */

const getAcademicYearFromResponse = (
  response?: AcademicYearResponse
): AcademicYear | undefined => {
  if (!response) {
    return undefined;
  }

  return (
    response.academicYear ??
    response.data ??
    (response.id
      ? {
          id: response.id,
          name: response.name ?? "",
        }
      : undefined)
  );
};

const getAcademicYearsFromResponse = (
  response: any
): AcademicYear[] => {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.academicYears)) {
    return response.academicYears;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  return [];
};

/* ============================================================
 * COMPONENT
 * ============================================================
 */

export const PromotionDemotion = ({
  sourceAcademicYearId: sourceAcademicYearIdProp,
}: PromotionDemotionProps) => {
  /* ----------------------------------------------------------
   * ACADEMIC YEAR STATE
   * ----------------------------------------------------------
   */

  const [targetAcademicYearId, setTargetAcademicYearId] =
    useState<string | null>(null);

  /* ----------------------------------------------------------
   * SOURCE CLASS / SECTION STATE
   * ----------------------------------------------------------
   */

  const [sourceClassId, setSourceClassId] = useState<string | null>(
    null
  );

  const [sourceSectionId, setSourceSectionId] = useState<
    string | null
  >(null);

  /* ----------------------------------------------------------
   * TARGET CLASS / SECTION STATE
   * ----------------------------------------------------------
   */

  const [targetClassId, setTargetClassId] = useState<string | null>(
    null
  );

  const [targetSectionId, setTargetSectionId] = useState<
    string | null
  >(null);

  /* ----------------------------------------------------------
   * OTHER STATE
   * ----------------------------------------------------------
   */

  const [selectedStudentIds, setSelectedStudentIds] = useState<
    string[]
  >([]);

  const [status, setStatus] =
    useState<PromotionStatus>("PROMOTED");

  const [remark, setRemark] = useState("");

  const [academicYearOpen, setAcademicYearOpen] = useState(false);
  const [sourceClassOpen, setSourceClassOpen] = useState(false);
  const [sourceSectionOpen, setSourceSectionOpen] = useState(false);
  const [targetClassOpen, setTargetClassOpen] = useState(false);
  const [targetSectionOpen, setTargetSectionOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ----------------------------------------------------------
   * CURRENT ACADEMIC YEAR
   * ----------------------------------------------------------
   */

  const {
    data: currentAcademicYearResponse,
    isLoading: isLoadingCurrentAcademicYear,
    isError: isCurrentAcademicYearError,
    refetch: refetchCurrentAcademicYear,
  } = useQuery<AcademicYearResponse>(
    ["current-academic-year"],
    () => academicYearServices.getCurrentAcademicYear(),
    {
      staleTime: 5 * 60 * 1000,
    }
  );

  const currentAcademicYear = useMemo(
    () => getAcademicYearFromResponse(currentAcademicYearResponse),
    [currentAcademicYearResponse]
  );

  const sourceAcademicYearId =
    sourceAcademicYearIdProp &&
    sourceAcademicYearIdProp !== "0"
      ? sourceAcademicYearIdProp
      : currentAcademicYear?.id;

  /* ----------------------------------------------------------
   * ALL ACADEMIC YEARS
   * ----------------------------------------------------------
   */

  const {
    data: academicYearsResponse,
    isLoading: isLoadingAcademicYears,
    isError: isAcademicYearsError,
    refetch: refetchAcademicYears,
  } = useQuery(
    ["academic-years"],
    () => academicYearServices.getAcademicYears(),
    {
      staleTime: 5 * 60 * 1000,
    }
  );

  const academicYears = useMemo(
    () => getAcademicYearsFromResponse(academicYearsResponse),
    [academicYearsResponse]
  );

  const targetAcademicYearItems = useMemo(() => {
    return academicYears
      .filter((year) => year.id !== sourceAcademicYearId)
      .map((year) => ({
        label: year.name,
        value: year.id,
      }));
  }, [academicYears, sourceAcademicYearId]);

  /* ----------------------------------------------------------
   * VALIDATION
   * ----------------------------------------------------------
   */

  const hasValidSourceAcademicYear =
    typeof sourceAcademicYearId === "string" &&
    sourceAcademicYearId.trim().length > 0 &&
    sourceAcademicYearId !== "0";

  const hasValidTargetAcademicYear =
    typeof targetAcademicYearId === "string" &&
    targetAcademicYearId.trim().length > 0 &&
    targetAcademicYearId !== "0";

  /* ----------------------------------------------------------
   * PROMOTION STUDENTS
   * ----------------------------------------------------------
   */

  const {
  data: promotionResponse,
  isLoading: isLoadingPromotionStudents,
  isFetching: isFetchingPromotionStudents,
  isError: isPromotionStudentsError,
  refetch: refetchPromotionStudents,
} = useQuery<PromotionStudentsResponse>(
  [
    "promotion-students",
    sourceAcademicYearId,
    targetAcademicYearId,
    sourceClassId,
  ],
  () => {
    if (
      !sourceAcademicYearId ||
      !targetAcademicYearId
    ) {
      return Promise.reject(
        new Error(
          "Source and target academic year IDs are required"
        )
      );
    }

    return studentServices.getPromotionStudents({
      sourceAcademicYearId,
      targetAcademicYearId,
      ...(sourceClassId
        ? {
            classId: sourceClassId,
          }
        : {}),
    });
  },
  {
    // Remove Boolean(sourceClassId)
    enabled:
      hasValidSourceAcademicYear &&
      hasValidTargetAcademicYear,
    staleTime: 0,
  }
);

  const students = promotionResponse?.students ?? [];

  const sourceClasses = promotionResponse?.sourceClasses ?? [];
  const targetClasses = promotionResponse?.targetClasses ?? [];

  /* ----------------------------------------------------------
   * SOURCE CLASS DROPDOWN
   * ----------------------------------------------------------
   */

  const sourceClassItems = useMemo(() => {
    return sourceClasses.map((classDetails) => ({
      label:
        classDetails.displayName ??
        `Class ${classDetails.classNumber}`,
      value: classDetails.id,
    }));
  }, [sourceClasses]);

  const selectedSourceClass = useMemo(() => {
    return sourceClasses.find(
      (classDetails) => classDetails.id === sourceClassId
    );
  }, [sourceClasses, sourceClassId]);

  const sourceSectionItems = useMemo(() => {
    return (
      selectedSourceClass?.sections?.map((section) => ({
        label: section.sectionName,
        value: section.id,
      })) ?? []
    );
  }, [selectedSourceClass]);

  /* ----------------------------------------------------------
   * TARGET CLASS DROPDOWN
   * ----------------------------------------------------------
   */

  const targetClassItems = useMemo(() => {
    return targetClasses.map((classDetails) => ({
      label:
        classDetails.displayName ??
        `Class ${classDetails.classNumber}`,
      value: classDetails.id,
    }));
  }, [targetClasses]);

  const selectedTargetClass = useMemo(() => {
    return targetClasses.find(
      (classDetails) => classDetails.id === targetClassId
    );
  }, [targetClasses, targetClassId]);

  const targetSectionItems = useMemo(() => {
    return (
      selectedTargetClass?.sections?.map((section) => ({
        label: section.sectionName,
        value: section.id,
      })) ?? []
    );
  }, [selectedTargetClass]);

  /* ----------------------------------------------------------
   * RESET DEPENDENT FIELDS
   * ----------------------------------------------------------
   */

  useEffect(() => {
    setSourceClassId(null);
    setSourceSectionId(null);
    setTargetClassId(null);
    setTargetSectionId(null);
    setSelectedStudentIds([]);
  }, [targetAcademicYearId]);

  useEffect(() => {
    setSourceSectionId(null);
    setSelectedStudentIds([]);
  }, [sourceClassId]);

  useEffect(() => {
    setTargetSectionId(null);
  }, [targetClassId]);

  /* ----------------------------------------------------------
   * FILTER STUDENTS BY SOURCE SECTION
   * ----------------------------------------------------------
   */

  const filteredStudents = useMemo(() => {
    if (!sourceSectionId) {
      return students;
    }

    return students.filter(
      (student) => student.currentSection?.id === sourceSectionId
    );
  }, [students, sourceSectionId]);

  /* ----------------------------------------------------------
   * SELECT STUDENTS
   * ----------------------------------------------------------
   */

  const allStudentsSelected =
    filteredStudents.length > 0 &&
    filteredStudents.every((student) =>
      selectedStudentIds.includes(student.id)
    );

  const toggleSelectAll = () => {
    if (allStudentsSelected) {
      setSelectedStudentIds((previousIds) =>
        previousIds.filter(
          (id) =>
            !filteredStudents.some((student) => student.id === id)
        )
      );

      return;
    }

    setSelectedStudentIds((previousIds) => {
      const newIds = filteredStudents
        .map((student) => student.id)
        .filter((id) => !previousIds.includes(id));

      return [...previousIds, ...newIds];
    });
  };

  const toggleStudent = (studentId: string) => {
    setSelectedStudentIds((previousIds) => {
      if (previousIds.includes(studentId)) {
        return previousIds.filter((id) => id !== studentId);
      }

      return [...previousIds, studentId];
    });
  };

  /* ----------------------------------------------------------
   * STATUS ITEMS
   * ----------------------------------------------------------
   */

  const statusItems = [
    {
      label: "Promoted",
      value: "PROMOTED",
    },
    {
      label: "Demoted",
      value: "DEMOTED",
    },
    {
      label: "Repeated",
      value: "REPEATED",
    },
    {
      label: "Not Promoted",
      value: "NOT_PROMOTED",
    },
  ];

  /* ----------------------------------------------------------
   * SUBMIT
   * ----------------------------------------------------------
   */

  const handleSubmit = async () => {
    if (!hasValidSourceAcademicYear) {
      Alert.alert(
        "Source academic year missing",
        "The current academic year could not be loaded."
      );
      return;
    }

    if (!hasValidTargetAcademicYear) {
      Alert.alert(
        "Select target academic year",
        "Please select a target academic year."
      );
      return;
    }

    if (!sourceClassId) {
      Alert.alert(
        "Select source class",
        "Please select the source class."
      );
      return;
    }

    if (!sourceSectionId) {
      Alert.alert(
        "Select source section",
        "Please select the source section."
      );
      return;
    }

    if (!targetClassId) {
      Alert.alert(
        "Select target class",
        "Please select the target class."
      );
      return;
    }



    if (!targetSectionId) {
      console.log(
        "Select target section",
        "Please select the target section."
      );
      return;
    }

    if (selectedStudentIds.length === 0) {
      Alert.alert(
        "Select students",
        "Please select at least one student."
      );
      return;
    }


    const payload: BulkPromotionRequest = {
      fromAcademicYearId: sourceAcademicYearId as string,
      toAcademicYearId: targetAcademicYearId as string,
      students: selectedStudentIds.map((studentId) => {
        const item: BulkPromotionItem = {
          studentId,
          toClassId: targetClassId,
          toSectionId: targetSectionId,
          status,
        };

        if (remark.trim()) {
          item.remark = remark.trim();
        }

        return item;
      }),
    };

    try {
      setIsSubmitting(true);

      const response =
        await studentServices.promoteDemoteBulk(payload);

      Alert.alert(
        "Success",
        response?.message ??
          `${selectedStudentIds.length} student(s) processed successfully.`
      );

      setSelectedStudentIds([]);
      setRemark("");

      await refetchPromotionStudents();
    } catch (error: any) {
      const message =
        error?.response?.data?.message ??
        error?.message ??
        "Unable to process students.";

      Alert.alert("Error", message);
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ----------------------------------------------------------
   * LOADING STATE
   * ----------------------------------------------------------
   */

  if (
    isLoadingCurrentAcademicYear &&
    !sourceAcademicYearIdProp
  ) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator
          size="large"
          color={Colors.brandPrimary}
        />

        <Text style={styles.infoText}>
          Loading current academic year...
        </Text>
      </View>
    );
  }



  /* ----------------------------------------------------------
   * RENDER
   * ----------------------------------------------------------
   */

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>
        Promotion / Demotion
      </Text>

      {/* SOURCE ACADEMIC YEAR */}

      <Text style={styles.label}>
        Source Academic Year
      </Text>

      <View style={styles.readOnlyField}>
        <Text style={styles.readOnlyText}>
          {currentAcademicYear?.name ??
            "Current academic year unavailable"}
        </Text>

        <Text style={styles.sourceIdText}>
          ID: {sourceAcademicYearId ?? "Not available"}
        </Text>
      </View>

      {isCurrentAcademicYearError && (
        <Text
          style={styles.errorText}
          onPress={() => refetchCurrentAcademicYear()}
        >
          Failed to load current academic year. Tap to retry.
        </Text>
      )}

      {!hasValidSourceAcademicYear && (
        <Text style={styles.errorText}>
          A valid source academic year is required.
        </Text>
      )}

      {/* TARGET ACADEMIC YEAR */}

      <Text style={styles.label}>
        Target Academic Year
      </Text>

      <DropDownPicker
        open={academicYearOpen}
        value={targetAcademicYearId}
        items={targetAcademicYearItems}
        setOpen={setAcademicYearOpen}
        setValue={setTargetAcademicYearId}
        setItems={() => undefined}
        placeholder={
          isLoadingAcademicYears
            ? "Loading academic years..."
            : "Select target academic year"
        }
        disabled={
          isLoadingAcademicYears ||
          targetAcademicYearItems.length === 0
        }
        loading={isLoadingAcademicYears}
        listMode="MODAL"
        modalTitle="Select target academic year"
        zIndex={5000}
        zIndexInverse={1000}
        style={styles.dropdown}
        dropDownContainerStyle={styles.dropdownContainer}
      />

      {isAcademicYearsError && (
        <Text
          style={styles.errorText}
          onPress={() => refetchAcademicYears()}
        >
          Failed to load academic years. Tap to retry.
        </Text>
      )}

      {hasValidTargetAcademicYear && (
        <>
          {/* SOURCE CLASS */}

          <Text style={styles.label}>
            Source Class
          </Text>

          <DropDownPicker
  open={sourceClassOpen}
  value={sourceClassId}
  items={sourceClassItems}
  setOpen={setSourceClassOpen}
  setValue={setSourceClassId}
  setItems={() => undefined}
  placeholder={
    isLoadingPromotionStudents || isFetchingPromotionStudents
      ? "Loading source classes..."
      : "Select source class"
  }
  disabled={
    !hasValidTargetAcademicYear ||
    isLoadingPromotionStudents ||
    isFetchingPromotionStudents
  }
  loading={
    isLoadingPromotionStudents ||
    isFetchingPromotionStudents
  }
  listMode="MODAL"
  modalTitle="Select source class"
  zIndex={4000}
  zIndexInverse={1000}
  style={styles.dropdown}
  dropDownContainerStyle={styles.dropdownContainer}
/>

          {/* SOURCE SECTION */}

          <Text style={styles.label}>
            Source Section
          </Text>

          <DropDownPicker
  open={sourceSectionOpen}
  value={sourceSectionId}
  items={sourceSectionItems}
  setOpen={setSourceSectionOpen}
  setValue={setSourceSectionId}
  setItems={() => undefined}
  placeholder="Select source section"
  disabled={
    !sourceClassId ||
    sourceSectionItems.length === 0
  }
  listMode="MODAL"
  modalTitle="Select source section"
  zIndex={3000}
  zIndexInverse={2000}
  style={styles.dropdown}
  dropDownContainerStyle={styles.dropdownContainer}
/>





          {/* TARGET CLASS */}

          <Text style={styles.label}>
            Target Class
          </Text>

          

          <DropDownPicker
            open={targetClassOpen}
            value={targetClassId}
            items={targetClassItems}
            setOpen={setTargetClassOpen}
            setValue={setTargetClassId}
            setItems={() => undefined}
            placeholder="Select target class"
            // disabled={
            //   isLoadingPromotionStudents ||
            //   isFetchingPromotionStudents ||
            //   targetClassItems.length === 0
            // }
            
            loading={
              isLoadingPromotionStudents ||
              isFetchingPromotionStudents
            }
            listMode="MODAL"
            modalTitle="Select target class"
            zIndex={2000}
            zIndexInverse={4000}
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropdownContainer}
          />

          {/* TARGET SECTION */}

          <Text style={styles.label}>
            Target Section
          </Text>

          <DropDownPicker
            open={targetSectionOpen}
            value={targetSectionId}
            items={targetSectionItems}
            setOpen={setTargetSectionOpen}
            setValue={setTargetSectionId}
            setItems={() => undefined}
            placeholder="Select target section"
            disabled={
              !targetClassId ||
              targetSectionItems.length === 0
            }
            listMode="MODAL"
            modalTitle="Select target section"
            zIndex={1000}
            zIndexInverse={5000}
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropdownContainer}
          />

          {/* STATUS */}

          <Text style={styles.label}>
            Promotion Status
          </Text>

          <DropDownPicker
            open={statusOpen}
            value={status}
            items={statusItems}
            setOpen={setStatusOpen}
            setValue={setStatus as any}
            setItems={() => undefined}
            placeholder="Select promotion status"
            listMode="MODAL"
            modalTitle="Select promotion status"
            zIndex={900}
            zIndexInverse={5000}
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropdownContainer}
          />

          {/* REMARK */}

          <Text style={styles.label}>
            Remark
          </Text>

          <TextInput
            mode="outlined"
            value={remark}
            onChangeText={setRemark}
            placeholder="Optional remark"
            multiline
            numberOfLines={3}
            style={styles.remarkInput}
          />

          {/* STUDENT LIST */}

          <View style={styles.studentHeader}>
            <Text style={styles.sectionTitle}>
              Students ({filteredStudents.length})
            </Text>

            <Button
              mode="outlined"
              compact
              onPress={toggleSelectAll}
              disabled={filteredStudents.length === 0}
            >
              {allStudentsSelected
                ? "Deselect All"
                : "Select All"}
            </Button>
          </View>

          {isLoadingPromotionStudents ||
          isFetchingPromotionStudents ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator
                color={Colors.brandPrimary}
              />

              <Text style={styles.infoText}>
                Loading students...
              </Text>
            </View>
          ) : isPromotionStudentsError ? (
            <Text
              style={styles.errorText}
              onPress={() => refetchPromotionStudents()}
            >
              Failed to load students. Tap to retry.
            </Text>
          ) : filteredStudents.length === 0 ? (
            <Text style={styles.infoText}>
              No students found for the selected source class
              and section.
            </Text>
          ) : (
            <View style={styles.studentsContainer}>
              {filteredStudents.map((student) => {
                const isSelected = selectedStudentIds.includes(
                  student.id
                );

                const admissionNumber =
                  student.admissionNo ??
                  student.admissionNumber ??
                  "N/A";

                const className =
                  student.currentClass?.displayName ??
                  student.currentClass?.classNumber ??
                  "N/A";

                const sectionName =
                  student.currentSection?.sectionName ??
                  "N/A";

                return (
                  <View
                    key={student.id}
                    style={[
                      styles.studentCard,
                      isSelected &&
                        styles.selectedStudentCard,
                    ]}
                  >
                    <Checkbox
                      status={
                        isSelected
                          ? "checked"
                          : "unchecked"
                      }
                      onPress={() =>
                        toggleStudent(student.id)
                      }
                      color={Colors.brandPrimary}
                    />

                    <View style={styles.studentDetails}>
                      <Text style={styles.studentName}>
                        {student.name}
                      </Text>

                      <Text style={styles.studentInfo}>
                        Admission No: {admissionNumber}
                      </Text>

                      <Text style={styles.studentInfo}>
                        Current Class: {className}
                      </Text>

                      <Text style={styles.studentInfo}>
                        Current Section: {sectionName}
                      </Text>

                      {student.fatherName && (
                        <Text style={styles.studentInfo}>
                          Father: {student.fatherName}
                        </Text>
                      )}

                      {typeof student.pendingAmount ===
                        "number" && (
                        <Text style={styles.studentInfo}>
                          Pending Amount:{" "}
                          {student.pendingAmount}
                        </Text>
                      )}

                      {student.eligible === false &&
                        student.eligibilityReason && (
                          <Text style={styles.warningText}>
                            {student.eligibilityReason}
                          </Text>
                        )}
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {/* SELECTION SUMMARY */}

          <View style={styles.selectionSummary}>
            <Text style={styles.summaryText}>
              Selected students:{" "}
              {selectedStudentIds.length}
            </Text>
          </View>

          {/* SUBMIT */}

          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={isSubmitting}
            disabled={
              isSubmitting ||
              selectedStudentIds.length === 0 ||
              !sourceClassId ||
              !sourceSectionId ||
              !targetClassId ||
              !targetSectionId
            }
            buttonColor={Colors.brandPrimary}
            style={styles.submitButton}
          >
            {isSubmitting
              ? "Processing..."
              : "Process Selected Students"}
          </Button>
        </>
      )}
    </ScrollView>
  );
};

/* ============================================================
 * STYLES
 * ============================================================
 */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  contentContainer: {
    padding: Metrics.x4,
    paddingBottom: Metrics.x8,
  },

  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Metrics.x4,
  },

  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Metrics.x4,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: Metrics.x4,
    color: "#222222",
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333333",
    marginTop: Metrics.x3,
    marginBottom: Metrics.x1,
  },

  readOnlyField: {
    minHeight: 50,
    justifyContent: "center",
    paddingHorizontal: Metrics.x3,
    borderWidth: 1,
    borderColor: "#D0D0D0",
    borderRadius: 6,
    backgroundColor: "#F3F3F3",
  },

  readOnlyText: {
    fontSize: 15,
    color: "#555555",
  },

  sourceIdText: {
    marginTop: 4,
    fontSize: 11,
    color: "#777777",
  },

  dropdown: {
    minHeight: 50,
    borderColor: "#D0D0D0",
  },

  dropdownContainer: {
    borderColor: "#D0D0D0",
  },

  remarkInput: {
    minHeight: 90,
    backgroundColor: "#FFFFFF",
  },

  studentHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: Metrics.x5,
    marginBottom: Metrics.x2,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#222222",
  },

  studentsContainer: {
    gap: Metrics.x2,
  },

  studentCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 8,
    padding: Metrics.x2,
    backgroundColor: "#FFFFFF",
  },

  selectedStudentCard: {
    borderColor: Colors.brandPrimary,
    backgroundColor: "#F4F8FF",
  },

  studentDetails: {
    flex: 1,
    paddingTop: Metrics.x1,
  },

  studentName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#222222",
    marginBottom: Metrics.x1,
  },

  studentInfo: {
    fontSize: 13,
    color: "#666666",
    marginBottom: 2,
  },

  warningText: {
    fontSize: 12,
    color: "#B26A00",
    marginTop: Metrics.x1,
  },

  selectionSummary: {
    marginTop: Metrics.x3,
    padding: Metrics.x3,
    borderRadius: 6,
    backgroundColor: "#F1F1F1",
  },

  summaryText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333333",
  },

  submitButton: {
    marginTop: Metrics.x4,
  },

  infoText: {
    marginTop: Metrics.x2,
    color: "#666666",
    textAlign: "center",
  },

  errorText: {
    marginTop: Metrics.x2,
    color: Colors.error,
  },
});

export default PromotionDemotion;