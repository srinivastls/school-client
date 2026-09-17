import React, {
  useCallback,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  Avatar,
  Card,
  Chip,
} from "react-native-paper";

import {
  useFocusEffect,
  useNavigation,
} from "@react-navigation/native";

import type {
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";

import {
  RootStackParamList,
  RootStackScreenNames,
} from "../../types";

import {
  teacherServices,
  TeacherMyStudent,
  TeacherMyStudentsResponse,
} from "../../services/teacherServices";


type FilterSection = {
  sectionId: string;
  sectionName: string;
  classId: string;
  classNumber: string;
  classDisplayName: string;
  totalStudents: number;
};


const TeacherMyStudentsScreen =
  () => {

    const navigation =
      useNavigation<
        NativeStackNavigationProp<
          RootStackParamList
        >
      >();

    const [
      data,
      setData,
    ] =
      useState<TeacherMyStudentsResponse | null>(
        null
      );

    const [
      loading,
      setLoading,
    ] = useState(true);

    const [
      refreshing,
      setRefreshing,
    ] = useState(false);

    const [
      error,
      setError,
    ] =
      useState<string | null>(null);

    const [
      search,
      setSearch,
    ] = useState("");

    const [
      classFilter,
      setClassFilter,
    ] = useState<string | null>(null);

    const [
      sectionFilter,
      setSectionFilter,
    ] = useState<string | null>(null);


    /* ========================================================
       LOAD
    ======================================================== */

    const loadStudents =
      useCallback(
        async (
          showLoader = true
        ) => {

          try {

            if (showLoader) {
              setLoading(true);
            }

            setError(null);

            const response =
              await teacherServices
                .getMyStudents();

            setData(response);

          } catch (err: any) {

            console.error(
              "MY STUDENTS ERROR:",
              err
            );

            setError(
              err?.response?.data?.message ??
              "Unable to load students."
            );

          } finally {

            setLoading(false);
            setRefreshing(false);

          }

        },
        []
      );


    useFocusEffect(
      useCallback(() => {
        loadStudents();
      }, [loadStudents])
    );


    /* ========================================================
       UNIQUE CLASSES
    ======================================================== */

    const classes = useMemo(() => {

      if (!data) {
        return [];
      }

      const map =
        new Map<
          string,
          {
            id: string;
            classNumber: string;
            displayName: string;
          }
        >();

      data.sections.forEach(
        (section) => {

          if (!map.has(section.classId)) {

            map.set(
              section.classId,
              {
                id: section.classId,
                classNumber:
                  section.classNumber,
                displayName:
                  section.classDisplayName,
              }
            );

          }

        }
      );

      return Array.from(
        map.values()
      ).sort(
        (a, b) =>
          a.classNumber.localeCompare(
            b.classNumber,
            undefined,
            {
              numeric: true,
            }
          )
      );

    }, [data]);


    /* ========================================================
       SECTIONS FOR SELECTED CLASS
    ======================================================== */

    const visibleSections =
      useMemo(() => {

        if (!data) {
          return [];
        }

        if (!classFilter) {
          return data.sections;
        }

        return data.sections.filter(
          (section) =>
            section.classId ===
            classFilter
        );

      }, [
        data,
        classFilter,
      ]);


    /* ========================================================
       FILTER STUDENTS
    ======================================================== */

    const filteredStudents =
      useMemo(() => {

        if (!data) {
          return [];
        }

        const query =
          search
            .trim()
            .toLowerCase();

        return data.students.filter(
          (student) => {

            const matchesSearch =
              !query ||
              student.name
                .toLowerCase()
                .includes(query) ||
              student.admissionNo
                .toLowerCase()
                .includes(query) ||
              (
                student.rollNumber ??
                ""
              )
                .toLowerCase()
                .includes(query) ||
              (
                student.fatherName ??
                ""
              )
                .toLowerCase()
                .includes(query);

            const matchesClass =
              !classFilter ||
              student.classId ===
                classFilter;

            const matchesSection =
              !sectionFilter ||
              student.sectionId ===
                sectionFilter;

            return (
              matchesSearch &&
              matchesClass &&
              matchesSection
            );

          }
        );

      }, [
        data,
        search,
        classFilter,
        sectionFilter,
      ]);


    /* ========================================================
       FILTER HELPERS
    ======================================================== */

    const clearFilters = () => {
      setSearch("");
      setClassFilter(null);
      setSectionFilter(null);
    };


    const handleClassFilter = (
      classId: string
    ) => {

      if (classFilter === classId) {

        setClassFilter(null);
        setSectionFilter(null);

      } else {

        setClassFilter(classId);
        setSectionFilter(null);

      }

    };


    const handleSectionFilter = (
      sectionId: string
    ) => {

      setSectionFilter(
        sectionFilter === sectionId
          ? null
          : sectionId
      );

    };


    /* ========================================================
       STUDENT PRESS
    ======================================================== */

    const openAttendanceHistory = (
      student: TeacherMyStudent
    ) => {

      navigation.navigate(
        RootStackScreenNames.TeacherStudentAttendanceHistory,
        {
          studentId: student.id,
          sectionId: student.sectionId,
          classId: student.classId,
          classNumber:
            student.classNumber,
          sectionName:
            student.sectionName,
          studentName:
            student.name,
        }
      );

    };


    /* ========================================================
       REFRESH
    ======================================================== */

    const handleRefresh = () => {

      setRefreshing(true);

      loadStudents(false);

    };


    /* ========================================================
       LOADING
    ======================================================== */

    if (loading) {

      return (
        <SafeAreaView
          style={styles.center}
        >
          <ActivityIndicator
            size="large"
          />

          <Text
            style={styles.loadingText}
          >
            Loading students...
          </Text>
        </SafeAreaView>
      );

    }


    /* ========================================================
       ERROR
    ======================================================== */

    if (error && !data) {

      return (
        <SafeAreaView
          style={styles.center}
        >
          <Text
            style={styles.errorTitle}
          >
            Unable to load students
          </Text>

          <Text
            style={styles.errorText}
          >
            {error}
          </Text>
        </SafeAreaView>
      );

    }


    return (
      <SafeAreaView
        style={styles.container}
      >

        {/* ==================================================
            HEADER
        ================================================== */}

        <View
          style={styles.header}
        >

          <View>
            <Text
              style={styles.headerTitle}
            >
              My Students
            </Text>

            <Text
              style={styles.headerSubtitle}
            >
              {data?.academicYear.name}
            </Text>
          </View>

        </View>


        <FlatList
          data={filteredStudents}
          keyExtractor={(item) =>
            item.enrollmentId
          }

          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={
                handleRefresh
              }
            />
          }

          contentContainerStyle={
            styles.listContent
          }


          /* ==================================================
             HEADER CONTENT
          ================================================== */

          ListHeaderComponent={
            <>

              {/* SUMMARY */}

              <View
                style={styles.summaryRow}
              >

                <SummaryCard
                  value={
                    data?.summary
                      .totalStudents ?? 0
                  }
                  label="Students"
                />

                <SummaryCard
                  value={
                    data?.summary
                      .totalClasses ?? 0
                  }
                  label="Classes"
                />

                <SummaryCard
                  value={
                    data?.summary
                      .totalSections ?? 0
                  }
                  label="Sections"
                />

              </View>


              {/* SEARCH */}

              <TextInput
                value={search}
                onChangeText={
                  setSearch
                }
                placeholder={
                  "Search name, admission no, roll no or father name"
                }
                placeholderTextColor={
                  "#94A3B8"
                }
                style={
                  styles.searchInput
                }
              />


              {/* CLASS FILTER */}

              <Text
                style={
                  styles.filterTitle
                }
              >
                Classes
              </Text>

              <FlatList
                horizontal
                data={classes}
                keyExtractor={
                  (item) =>
                    item.id
                }
                showsHorizontalScrollIndicator={
                  false
                }
                contentContainerStyle={
                  styles.chipList
                }
                renderItem={({
                  item,
                }) => (
                  <Chip
                    selected={
                      classFilter ===
                      item.id
                    }
                    onPress={() =>
                      handleClassFilter(
                        item.id
                      )
                    }
                    style={
                      styles.filterChip
                    }
                  >
                    {item.displayName}
                  </Chip>
                )}
              />


              {/* SECTION FILTER */}

              {classFilter && (
                <>
                  <Text
                    style={
                      styles.filterTitle
                    }
                  >
                    Sections
                  </Text>

                  <FlatList
                    horizontal
                    data={
                      visibleSections
                    }
                    keyExtractor={
                      (item) =>
                        item.sectionId
                    }
                    showsHorizontalScrollIndicator={
                      false
                    }
                    contentContainerStyle={
                      styles.chipList
                    }
                    renderItem={({
                      item,
                    }) => (
                      <Chip
                        selected={
                          sectionFilter ===
                          item.sectionId
                        }
                        onPress={() =>
                          handleSectionFilter(
                            item.sectionId
                          )
                        }
                        style={
                          styles.filterChip
                        }
                      >
                        Section{" "}
                        {item.sectionName}
                      </Chip>
                    )}
                  />
                </>
              )}


              {/* CLEAR */}

              {(search ||
                classFilter ||
                sectionFilter) ? (
                <Text
                  onPress={
                    clearFilters
                  }
                  style={
                    styles.clearFilters
                  }
                >
                  Clear filters
                </Text>
              ) : null}


              <View
                style={
                  styles.resultHeader
                }
              >
                <Text
                  style={
                    styles.resultTitle
                  }
                >
                  Students
                </Text>

                <Text
                  style={
                    styles.resultCount
                  }
                >
                  {filteredStudents.length}
                </Text>
              </View>

            </>
          }


          /* ==================================================
             STUDENT ROW
          ================================================== */

          renderItem={({
            item,
          }) => (

            <Card
              style={
                styles.studentCard
              }
              onPress={() =>
                openAttendanceHistory(
                  item
                )
              }
            >

              <View
                style={
                  styles.studentRow
                }
              >

                {item.photoUrl ? (

                  <Avatar.Image
                    size={50}
                    source={{
                      uri:
                        item.photoUrl,
                    }}
                  />

                ) : (

                  <Avatar.Text
                    size={50}
                    label={
                      item.name
                        .slice(0, 1)
                        .toUpperCase()
                    }
                  />

                )}


                <View
                  style={
                    styles.studentInfo
                  }
                >

                  <Text
                    style={
                      styles.studentName
                    }
                  >
                    {item.name}
                  </Text>

                  <Text
                    style={
                      styles.studentMeta
                    }
                  >
                    Admission:{" "}
                    {item.admissionNo}
                  </Text>

                  <Text
                    style={
                      styles.studentMeta
                    }
                  >
                    {item.classDisplayName}
                    {" • "}
                    Section{" "}
                    {item.sectionName}
                  </Text>

                  {item.rollNumber ? (
                    <Text
                      style={
                        styles.studentMeta
                      }
                    >
                      Roll No:{" "}
                      {item.rollNumber}
                    </Text>
                  ) : null}

                  {item.fatherName ? (
                    <Text
                      style={
                        styles.studentMeta
                      }
                    >
                      Father:{" "}
                      {item.fatherName}
                    </Text>
                  ) : null}

                </View>

              </View>

            </Card>

          )}


          /* ==================================================
             EMPTY
          ================================================== */

          ListEmptyComponent={
            <View
              style={
                styles.empty
              }
            >

              <Text
                style={
                  styles.emptyTitle
                }
              >
                No students found
              </Text>

              <Text
                style={
                  styles.emptyText
                }
              >
                Try changing the search
                or filters.
              </Text>

            </View>
          }

        />

      </SafeAreaView>
    );
  };


/* ============================================================
   SUMMARY CARD
============================================================ */

const SummaryCard = ({
  value,
  label,
}: {
  value: number;
  label: string;
}) => (

  <View
    style={
      styles.summaryCard
    }
  >
    <Text
      style={
        styles.summaryValue
      }
    >
      {value}
    </Text>

    <Text
      style={
        styles.summaryLabel
      }
    >
      {label}
    </Text>
  </View>

);


/* ============================================================
   STYLES
============================================================ */

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },

  loadingText: {
    marginTop: 12,
    color: "#64748B",
  },

  errorTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },

  errorText: {
    marginTop: 8,
    color: "#DC2626",
    textAlign: "center",
  },

  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0F172A",
  },

  headerSubtitle: {
    marginTop: 3,
    color: "#64748B",
    fontSize: 14,
  },

  listContent: {
    padding: 16,
    paddingBottom: 30,
  },

  summaryRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },

  summaryCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },

  summaryValue: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
  },

  summaryLabel: {
    marginTop: 3,
    fontSize: 12,
    color: "#64748B",
  },

  searchInput: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: "#0F172A",
    marginBottom: 16,
  },

  filterTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 8,
  },

  chipList: {
    paddingBottom: 12,
    gap: 8,
  },

  filterChip: {
    marginRight: 4,
  },

  clearFilters: {
    color: "#4F46E5",
    fontWeight: "700",
    marginBottom: 12,
  },

  resultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  resultTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
  },

  resultCount: {
    fontSize: 14,
    fontWeight: "700",
    color: "#64748B",
  },

  studentCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    marginBottom: 10,
  },

  studentRow: {
    flexDirection: "row",
    padding: 14,
    alignItems: "center",
  },

  studentInfo: {
    flex: 1,
    marginLeft: 13,
  },

  studentName: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },

  studentMeta: {
    marginTop: 3,
    fontSize: 12,
    color: "#64748B",
  },

  empty: {
    alignItems: "center",
    paddingVertical: 50,
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#334155",
  },

  emptyText: {
    marginTop: 6,
    color: "#64748B",
  },

});


export default TeacherMyStudentsScreen;