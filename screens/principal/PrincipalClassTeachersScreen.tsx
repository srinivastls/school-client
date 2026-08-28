import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

import {
  Avatar,
  Card,
  Divider,
  IconButton,
  Snackbar,
} from "react-native-paper";

import {
  useNavigation,
} from "@react-navigation/native";

import type {
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";

import {
  RootStackParamList,
} from "../../types";

import {
  Colors,
  makeStyles,
  Metrics,
} from "../../theme";

import {
  useUserStore,
} from "../../store";

import {
  academicYearServices,
} from "../../services/academicYearServices";

import {
  sectionServices,
  AvailableClassTeacher,
  Section,
} from "../../services/sectionServices";


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

type AcademicYearResponse = {
  academicYears: AcademicYear[];
};

type AssignmentResponse = {
  totalSections: number;
  assigned: number;
  unassigned: number;
  sections: Array<
    Section & {
      class: {
        id: string;
        classNumber: string;
        displayName: string;
        academicYearId: string;
      };
    }
  >;
};


/* ============================================================
   COMPONENT
============================================================ */

const PrincipalClassTeachersScreen = () => {

  const styles = useStyles();

  const navigation =
    useNavigation<
      NativeStackNavigationProp<RootStackParamList>
    >();

  const { width } =
    useWindowDimensions();

  const isSmallScreen =
    width < 600;

  const isTablet =
    width >= 600 && width < 1024;

  const isDesktop =
    width >= 1024;


  /* ==========================================================
     STORE
  ========================================================== */

  const user =
    useUserStore(
      state => state.user
    );


  /* ==========================================================
     STATE
  ========================================================== */

  const [
    academicYears,
    setAcademicYears,
  ] = useState<AcademicYear[]>([]);

  const [
    selectedAcademicYearId,
    setSelectedAcademicYearId,
  ] = useState("");

  const [
    assignments,
    setAssignments,
  ] = useState<
    AssignmentResponse["sections"]
  >([]);

  const [
    teachers,
    setTeachers,
  ] = useState<
    AvailableClassTeacher[]
  >([]);

  const [
    loadingYears,
    setLoadingYears,
  ] = useState(true);

  const [
    loadingAssignments,
    setLoadingAssignments,
  ] = useState(false);

  const [
    loadingTeachers,
    setLoadingTeachers,
  ] = useState(false);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    filter,
    setFilter,
  ] = useState<
    "ALL" | "ASSIGNED" | "UNASSIGNED"
  >("ALL");

  const [
    teacherModalVisible,
    setTeacherModalVisible,
  ] = useState(false);

  const [
    selectedSection,
    setSelectedSection,
  ] = useState<
    AssignmentResponse["sections"][number] |
    null
  >(null);

  const [
    teacherSearch,
    setTeacherSearch,
  ] = useState("");

  const [
    selectedTeacherId,
    setSelectedTeacherId,
  ] = useState("");

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    snackbarVisible,
    setSnackbarVisible,
  ] = useState(false);

  const [
    snackbarText,
    setSnackbarText,
  ] = useState("");

  const [
    showYearDropdown,
    setShowYearDropdown,
  ] = useState(false);


  /* ==========================================================
     AUTHORIZATION
  ========================================================== */

  if (!user) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>
          Session not found.
        </Text>
      </View>
    );
  }

  if (user.role !== "PRINCIPAL") {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>
          You are not authorized to access
          Class Teachers.
        </Text>
      </View>
    );
  }


  /* ==========================================================
     SNACKBAR
  ========================================================== */

  const showMessage = (
    message: string
  ) => {

    setSnackbarText(message);
    setSnackbarVisible(true);

  };


  /* ==========================================================
     LOAD ACADEMIC YEARS
  ========================================================== */

  const loadAcademicYears =
    useCallback(async () => {

      try {

        setLoadingYears(true);

        const response =
          await academicYearServices
            .getAcademicYears();

        const data =
          response as AcademicYearResponse;

        const years =
          data.academicYears ?? [];

        setAcademicYears(years);

        if (
          years.length > 0 &&
          !selectedAcademicYearId
        ) {

          const current =
            years.find(
              year =>
                year.isCurrent
            );

          setSelectedAcademicYearId(
            current?.id ??
            years[0].id
          );

        }

      } catch (error: any) {

        console.error(
          "LOAD ACADEMIC YEARS ERROR",
          error
        );

        showMessage(
          error?.response?.data?.message ??
          "Unable to load academic years"
        );

      } finally {

        setLoadingYears(false);

      }

    }, [
      selectedAcademicYearId,
    ]);


  /* ==========================================================
     LOAD ASSIGNMENTS
  ========================================================== */

  const loadAssignments =
    useCallback(async () => {

      if (
        !selectedAcademicYearId
      ) {
        return;
      }

      try {

        setLoadingAssignments(true);

        /*
         * The backend class-teacher
         * endpoint requires:
         *
         * ?academicYearId=...
         *
         * Your current sectionServices does
         * not yet expose this method.
         *
         * Therefore this screen expects
         * getClassTeacherAssignments()
         * to be added to sectionServices.
         */

        const service =
          sectionServices as typeof sectionServices & {
            getClassTeacherAssignments: (
              academicYearId: string
            ) => Promise<AssignmentResponse>;
          };

        const response =
          await service
            .getClassTeacherAssignments(
              selectedAcademicYearId
            );

        setAssignments(
          response.sections ?? []
        );

      } catch (error: any) {

        console.error(
          "LOAD CLASS TEACHER ASSIGNMENTS ERROR",
          error
        );

        showMessage(
          error?.response?.data?.message ??
          "Unable to load class teacher assignments"
        );

        setAssignments([]);

      } finally {

        setLoadingAssignments(false);

      }

    }, [
      selectedAcademicYearId,
    ]);


  /* ==========================================================
     LOAD TEACHERS
  ========================================================== */

  const loadTeachers =
    useCallback(async () => {

      try {

        setLoadingTeachers(true);

        const response =
          await sectionServices
            .getAvailableClassTeachers();

        setTeachers(
          response.teachers ?? []
        );

      } catch (error: any) {

        console.error(
          "LOAD AVAILABLE TEACHERS ERROR",
          error
        );

        showMessage(
          error?.response?.data?.message ??
          "Unable to load teachers"
        );

      } finally {

        setLoadingTeachers(false);

      }

    }, []);


  /* ==========================================================
     INITIAL LOAD
  ========================================================== */

  useEffect(() => {

    loadAcademicYears();

  }, [
    loadAcademicYears,
  ]);


  useEffect(() => {

    if (
      selectedAcademicYearId
    ) {

      loadAssignments();
      loadTeachers();

    }

  }, [
    selectedAcademicYearId,
    loadAssignments,
    loadTeachers,
  ]);


  /* ==========================================================
     REFRESH
  ========================================================== */

  const handleRefresh =
    async () => {

      setRefreshing(true);

      try {

        await Promise.all([
          loadAssignments(),
          loadTeachers(),
        ]);

      } finally {

        setRefreshing(false);

      }

    };


  /* ==========================================================
     SUMMARY
  ========================================================== */

  const totalSections =
    assignments.length;

  const assignedSections =
    assignments.filter(
      section =>
        Boolean(
          section.classTeacher
        )
    ).length;

  const unassignedSections =
    totalSections -
    assignedSections;


  /* ==========================================================
     FILTER
  ========================================================== */

  const filteredAssignments =
    useMemo(() => {

      const query =
        search
          .trim()
          .toLowerCase();

      return assignments.filter(
        section => {

          const isAssigned =
            Boolean(
              section.classTeacher
            );

          if (
            filter === "ASSIGNED" &&
            !isAssigned
          ) {
            return false;
          }

          if (
            filter === "UNASSIGNED" &&
            isAssigned
          ) {
            return false;
          }

          if (!query) {
            return true;
          }

          const values = [
            section.class.classNumber,
            section.class.displayName,
            section.sectionName,
            section.classTeacher?.name,
            section.classTeacher?.employeeId,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return values.includes(query);

        }
      );

    }, [
      assignments,
      search,
      filter,
    ]);


  /* ==========================================================
     FILTER TEACHERS
  ========================================================== */

  const filteredTeachers =
    useMemo(() => {

      const query =
        teacherSearch
          .trim()
          .toLowerCase();

      return teachers.filter(
        teacher => {

          if (!query) {
            return true;
          }

          const values = [
            teacher.name,
            teacher.email,
            teacher.employeeId,
            teacher.designation,
            teacher.department,
            teacher.role,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return values.includes(query);

        }
      );

    }, [
      teachers,
      teacherSearch,
    ]);


  /* ==========================================================
     OPEN ASSIGN MODAL
  ========================================================== */

  const openTeacherModal = (
    section: AssignmentResponse["sections"][number]
  ) => {

    setSelectedSection(section);

    setSelectedTeacherId(
      section.classTeacher?.id ?? ""
    );

    setTeacherSearch("");

    setTeacherModalVisible(true);

  };


  /* ==========================================================
     CLOSE MODAL
  ========================================================== */

  const closeTeacherModal = () => {

    if (saving) {
      return;
    }

    setTeacherModalVisible(false);

    setSelectedSection(null);

    setSelectedTeacherId("");

  };


  /* ==========================================================
     ASSIGN TEACHER
  ========================================================== */

  const handleAssignTeacher =
    async () => {

      if (!selectedSection) {
        return;
      }

      if (!selectedTeacherId) {

        showMessage(
          "Please select a teacher"
        );

        return;

      }

      try {

        setSaving(true);

        await sectionServices
          .assignClassTeacher({

            sectionId:
              selectedSection.id,

            teacherUserId:
              selectedTeacherId,

          });

        closeTeacherModal();

        showMessage(
          selectedSection.classTeacher
            ? "Class teacher changed successfully"
            : "Class teacher assigned successfully"
        );

        await Promise.all([
          loadAssignments(),
          loadTeachers(),
        ]);

      } catch (error: any) {

        console.error(
          "ASSIGN CLASS TEACHER ERROR",
          error
        );

        showMessage(
          error?.response?.data?.message ??
          "Unable to assign class teacher"
        );

      } finally {

        setSaving(false);

      }

    };


  /* ==========================================================
     REMOVE TEACHER
  ========================================================== */

  const handleRemoveTeacher = (
    section: AssignmentResponse["sections"][number]
  ) => {

    if (!section.classTeacher) {
      return;
    }

    Alert.alert(
      "Remove Class Teacher",
      `Remove ${section.classTeacher.name} as class teacher for Class ${section.class.classNumber} - ${section.sectionName}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Remove",
          style: "destructive",

          onPress: async () => {

            try {

              setSaving(true);

              await sectionServices
                .removeClassTeacher({

                  sectionId:
                    section.id,

                });

              showMessage(
                "Class teacher removed successfully"
              );

              await Promise.all([
                loadAssignments(),
                loadTeachers(),
              ]);

            } catch (error: any) {

              console.error(
                "REMOVE CLASS TEACHER ERROR",
                error
              );

              showMessage(
                error?.response?.data?.message ??
                "Unable to remove class teacher"
              );

            } finally {

              setSaving(false);

            }

          },
        },
      ]
    );

  };


  /* ==========================================================
     HEADER
  ========================================================== */

  const renderHeader = () => {

    const selectedYear =
      academicYears.find(
        year =>
          year.id ===
          selectedAcademicYearId
      );

    return (
      <View>

        {/* ==================================================
            TOP BAR
        ================================================== */}

        <View
          style={styles.topBar}
        >

          <View
            style={styles.topBarLeft}
          >

            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() =>
                navigation.goBack()
              }
              style={
                styles.backButton
              }
            >
              <Text
                style={
                  styles.backButtonText
                }
              >
                ←
              </Text>
            </TouchableOpacity>

            <View
              style={
                styles.titleContainer
              }
            >

              <Text
                style={
                  styles.screenTitle
                }
              >
                Class Teachers
              </Text>

              <Text
                style={
                  styles.screenSubtitle
                }
              >
                Assign and manage class teachers
              </Text>

            </View>

          </View>

          <IconButton
            icon="refresh"
            iconColor={
              Colors.brandPrimary
            }
            onPress={
              handleRefresh
            }
          />

        </View>


        {/* ==================================================
            ACADEMIC YEAR
        ================================================== */}

        <View
          style={
            styles.yearSection
          }
        >

          <Text
            style={
              styles.label
            }
          >
            Academic Year
          </Text>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() =>
              setShowYearDropdown(
                value => !value
              )
            }
            style={
              styles.yearSelector
            }
          >

            <View
              style={
                styles.yearSelectorText
              }
            >

              <Text
                style={
                  styles.yearName
                }
              >
                {selectedYear?.name ??
                  "Select academic year"}
              </Text>

              {selectedYear?.isCurrent ? (
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
              ) : null}

            </View>

            <Text
              style={
                styles.chevron
              }
            >
              {showYearDropdown
                ? "⌃"
                : "⌄"}
            </Text>

          </TouchableOpacity>


          {showYearDropdown ? (
            <View
              style={
                styles.yearDropdown
              }
            >

              {academicYears.map(
                year => {

                  const selected =
                    year.id ===
                    selectedAcademicYearId;

                  return (
                    <TouchableOpacity
                      key={year.id}
                      activeOpacity={0.7}
                      onPress={() => {

                        setSelectedAcademicYearId(
                          year.id
                        );

                        setShowYearDropdown(
                          false
                        );

                      }}
                      style={[
                        styles.yearOption,
                        selected &&
                          styles.yearOptionSelected,
                      ]}
                    >

                      <View
                        style={
                          styles.yearOptionText
                        }
                      >

                        <Text
                          style={[
                            styles.yearOptionName,
                            selected &&
                              styles.yearOptionNameSelected,
                          ]}
                        >
                          {year.name}
                        </Text>

                        <Text
                          style={
                            styles.yearDates
                          }
                        >
                          {formatDate(
                            year.startDate
                          )}{" "}
                          –{" "}
                          {formatDate(
                            year.endDate
                          )}
                        </Text>

                      </View>

                      {year.isCurrent ? (
                        <View
                          style={
                            styles.smallCurrentBadge
                          }
                        >
                          <Text
                            style={
                              styles.smallCurrentBadgeText
                            }
                          >
                            CURRENT
                          </Text>
                        </View>
                      ) : null}

                    </TouchableOpacity>
                  );

                }
              )}

            </View>
          ) : null}

        </View>


        {/* ==================================================
            SUMMARY
        ================================================== */}

        <View
          style={[
            styles.summaryGrid,
            isSmallScreen &&
              styles.summaryGridMobile,
          ]}
        >

          <SummaryCard
            title="Total Sections"
            value={totalSections}
            icon="view-grid-outline"
            iconBackground="#EEF2FF"
            iconColor="#4F46E5"
            styles={styles}
          />

          <SummaryCard
            title="Assigned"
            value={assignedSections}
            icon="account-check-outline"
            iconBackground="#EAF8F0"
            iconColor="#16834B"
            styles={styles}
          />

          <SummaryCard
            title="Unassigned"
            value={unassignedSections}
            icon="account-alert-outline"
            iconBackground="#FFF5ED"
            iconColor="#C55A11"
            styles={styles}
          />

        </View>


        {/* ==================================================
            SEARCH
        ================================================== */}

        <View
          style={
            styles.searchContainer
          }
        >

          <Text
            style={
              styles.searchIcon
            }
          >
            🔍
          </Text>

          <TextInput
            value={search}
            onChangeText={
              setSearch
            }
            placeholder="Search class, section or teacher..."
            placeholderTextColor="#9CA3AF"
            style={
              styles.searchInput
            }
            autoCapitalize="none"
          />

          {search.length > 0 ? (
            <IconButton
              icon="close-circle"
              size={20}
              iconColor="#9CA3AF"
              onPress={() =>
                setSearch("")
              }
            />
          ) : null}

        </View>


        {/* ==================================================
            FILTERS
        ================================================== */}

        <View
          style={
            styles.filterRow
          }
        >

          <FilterButton
            title="All"
            active={
              filter === "ALL"
            }
            count={
              totalSections
            }
            onPress={() =>
              setFilter("ALL")
            }
            styles={styles}
          />

          <FilterButton
            title="Assigned"
            active={
              filter === "ASSIGNED"
            }
            count={
              assignedSections
            }
            onPress={() =>
              setFilter("ASSIGNED")
            }
            styles={styles}
          />

          <FilterButton
            title="Unassigned"
            active={
              filter === "UNASSIGNED"
            }
            count={
              unassignedSections
            }
            onPress={() =>
              setFilter("UNASSIGNED")
            }
            styles={styles}
          />

        </View>


        {/* ==================================================
            SECTION TITLE
        ================================================== */}

        <View
          style={
            styles.listHeading
          }
        >

          <View>

            <Text
              style={
                styles.listTitle
              }
            >
              Class & Section Assignments
            </Text>

            <Text
              style={
                styles.listSubtitle
              }
            >
              {filteredAssignments.length}{" "}
              section
              {filteredAssignments.length === 1
                ? ""
                : "s"} displayed
            </Text>

          </View>

        </View>

      </View>
    );
  };


  /* ==========================================================
     SECTION CARD
  ========================================================== */

  const renderSection = ({
    item,
  }: {
    item:
      AssignmentResponse["sections"][number];
  }) => {

    const teacher =
      item.classTeacher;

    return (
      <Card
        style={[
          styles.sectionCard,
          isDesktop &&
            styles.sectionCardDesktop,
        ]}
      >

        <Card.Content>

          <View
            style={
              styles.sectionCardTop
            }
          >

            {/* CLASS */}

            <View
              style={
                styles.classIdentity
              }
            >

              <View
                style={
                  styles.classBadge
                }
              >

                <Text
                  style={
                    styles.classBadgeText
                  }
                >
                  {item.class.classNumber}
                </Text>

              </View>

              <View
                style={
                  styles.classIdentityText
                }
              >

                <Text
                  style={
                    styles.className
                  }
                >
                  {item.class.displayName}
                </Text>

                <Text
                  style={
                    styles.sectionName
                  }
                >
                  Section {item.sectionName}
                </Text>

              </View>

            </View>


            {/* STATUS */}

            <View
              style={[
                styles.statusBadge,
                teacher
                  ? styles.assignedBadge
                  : styles.unassignedBadge,
              ]}
            >

              <View
                style={[
                  styles.statusDot,
                  teacher
                    ? styles.assignedDot
                    : styles.unassignedDot,
                ]}
              />

              <Text
                style={[
                  styles.statusText,
                  teacher
                    ? styles.assignedText
                    : styles.unassignedText,
                ]}
              >
                {teacher
                  ? "Assigned"
                  : "Unassigned"}
              </Text>

            </View>

          </View>


          <Divider
            style={
              styles.cardDivider
            }
          />


          {/* TEACHER */}

          <View
            style={
              styles.teacherRow
            }
          >

            <View
              style={
                styles.teacherInfo
              }
            >

              {teacher ? (

                <>

                  <Avatar.Text
                    size={46}
                    label={getInitials(
                      teacher.name
                    )}
                    color="#FFFFFF"
                    style={
                      styles.teacherAvatar
                    }
                  />

                  <View
                    style={
                      styles.teacherDetails
                    }
                  >

                    <Text
                      style={
                        styles.teacherLabel
                      }
                    >
                      CLASS TEACHER
                    </Text>

                    <Text
                      style={
                        styles.teacherName
                      }
                      numberOfLines={1}
                    >
                      {teacher.name}
                    </Text>

                    <Text
                      style={
                        styles.teacherMeta
                      }
                      numberOfLines={1}
                    >
                      {teacher.designation ||
                        teacher.role ||
                        "Teacher"}
                      {teacher.employeeId
                        ? ` • ${teacher.employeeId}`
                        : ""}
                    </Text>

                  </View>

                </>

              ) : (

                <>

                  <View
                    style={
                      styles.emptyTeacherAvatar
                    }
                  >
                    <Text
                      style={
                        styles.emptyTeacherIcon
                      }
                    >
                      ?
                    </Text>
                  </View>

                  <View
                    style={
                      styles.teacherDetails
                    }
                  >

                    <Text
                      style={
                        styles.teacherLabel
                      }
                    >
                      CLASS TEACHER
                    </Text>

                    <Text
                      style={
                        styles.noTeacher
                      }
                    >
                      No teacher assigned
                    </Text>

                    <Text
                      style={
                        styles.teacherMeta
                      }
                    >
                      Assign a teacher to this section
                    </Text>

                  </View>

                </>

              )}

            </View>


            {/* ACTIONS */}

            <View
              style={
                styles.actionRow
              }
            >

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() =>
                  openTeacherModal(item)
                }
                style={
                  styles.assignButton
                }
              >

                <Text
                  style={
                    styles.assignButtonText
                  }
                >
                  {teacher
                    ? "Change"
                    : "Assign"}
                </Text>

              </TouchableOpacity>

              {teacher ? (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() =>
                    handleRemoveTeacher(
                      item
                    )
                  }
                  style={
                    styles.removeButton
                  }
                >

                  <Text
                    style={
                      styles.removeButtonText
                    }
                  >
                    Remove
                  </Text>

                </TouchableOpacity>
              ) : null}

            </View>

          </View>


          {/* STUDENTS */}

          <View
            style={
              styles.studentInfo
            }
          >

            <Text
              style={
                styles.studentIcon
              }
            >
              👥
            </Text>

            <Text
              style={
                styles.studentCount
              }
            >
              {item.totalStudents ??
                0}{" "}
              students
            </Text>

          </View>

        </Card.Content>

      </Card>
    );
  };


  /* ==========================================================
     TEACHER MODAL
  ========================================================== */

  const renderTeacherModal = () => {

    if (!selectedSection) {
      return null;
    }

    return (
      <Modal
        visible={
          teacherModalVisible
        }
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={
          closeTeacherModal
        }
      >

        <View
          style={
            styles.modalBackdrop
          }
        >

          <View
            style={[
              styles.teacherModal,
              isSmallScreen &&
                styles.teacherModalMobile,
              isDesktop &&
                styles.teacherModalDesktop,
            ]}
          >

            {/* HEADER */}

            <View
              style={
                styles.modalHeader
              }
            >

              <View>

                <Text
                  style={
                    styles.modalTitle
                  }
                >
                  {selectedSection.classTeacher
                    ? "Change Class Teacher"
                    : "Assign Class Teacher"}
                </Text>

                <Text
                  style={
                    styles.modalSubtitle
                  }
                >
                  Class{" "}
                  {selectedSection.class.classNumber}
                  {" - "}
                  Section{" "}
                  {selectedSection.sectionName}
                </Text>

              </View>

              <IconButton
                icon="close"
                onPress={
                  closeTeacherModal
                }
                disabled={saving}
              />

            </View>


            <Divider />


            {/* SEARCH */}

            <View
              style={
                styles.teacherSearchContainer
              }
            >

              <Text
                style={
                  styles.searchIcon
                }
              >
                🔍
              </Text>

              <TextInput
                value={
                  teacherSearch
                }
                onChangeText={
                  setTeacherSearch
                }
                placeholder="Search teachers..."
                placeholderTextColor="#9CA3AF"
                style={
                  styles.teacherSearchInput
                }
              />

            </View>


            {/* TEACHERS */}

            {loadingTeachers ? (

              <View
                style={
                  styles.modalLoading
                }
              >
                <ActivityIndicator
                  color={
                    Colors.brandPrimary
                  }
                />

                <Text
                  style={
                    styles.loadingText
                  }
                >
                  Loading teachers...
                </Text>
              </View>

            ) : (

              <FlatList
                data={
                  filteredTeachers
                }
                keyExtractor={
                  teacher =>
                    teacher.id
                }
                style={
                  styles.teacherList
                }
                keyboardShouldPersistTaps="handled"
                renderItem={({
                  item: teacher,
                }) => {

                  const selected =
                    selectedTeacherId ===
                    teacher.id;

                  const currentlyAssignedElsewhere =
                    teacher.assignedSections > 0 &&
                    teacher.id !==
                      selectedSection
                        .classTeacher?.id;

                  return (
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => {

                        /*
                         * The backend enforces
                         * one class-teacher
                         * assignment per
                         * academic year.
                         *
                         * We still allow selecting
                         * the teacher so the backend
                         * can return the exact
                         * conflict message.
                         */

                        setSelectedTeacherId(
                          teacher.id
                        );

                      }}
                      style={[
                        styles.teacherOption,
                        selected &&
                          styles.teacherOptionSelected,
                      ]}
                    >

                      <Avatar.Text
                        size={42}
                        label={getInitials(
                          teacher.name
                        )}
                        color="#FFFFFF"
                        style={
                          styles.teacherOptionAvatar
                        }
                      />

                      <View
                        style={
                          styles.teacherOptionInfo
                        }
                      >

                        <Text
                          style={
                            styles.teacherOptionName
                          }
                          numberOfLines={1}
                        >
                          {teacher.name}
                        </Text>

                        <Text
                          style={
                            styles.teacherOptionMeta
                          }
                          numberOfLines={1}
                        >
                          {teacher.designation ||
                            teacher.role}
                          {teacher.employeeId
                            ? ` • ${teacher.employeeId}`
                            : ""}
                        </Text>

                        <Text
                          style={[
                            styles.teacherAssignmentInfo,
                            currentlyAssignedElsewhere &&
                              styles.teacherAssignmentWarning,
                          ]}
                        >
                          {currentlyAssignedElsewhere
                            ? `Already assigned to ${teacher.assignedSections} section${teacher.assignedSections === 1 ? "" : "s"}`
                            : teacher.assignedSections > 0
                              ? "Current class teacher"
                              : "Available"}
                        </Text>

                      </View>

                      <View
                        style={[
                          styles.selectionCircle,
                          selected &&
                            styles.selectionCircleSelected,
                        ]}
                      >

                        {selected ? (
                          <Text
                            style={
                              styles.checkmark
                            }
                          >
                            ✓
                          </Text>
                        ) : null}

                      </View>

                    </TouchableOpacity>
                  );

                }}
                ListEmptyComponent={
                  <View
                    style={
                      styles.emptyModal
                    }
                  >

                    <Text
                      style={
                        styles.emptyModalTitle
                      }
                    >
                      No teachers found
                    </Text>

                    <Text
                      style={
                        styles.emptyModalText
                      }
                    >
                      Try another search.
                    </Text>

                  </View>
                }
              />

            )}


            {/* FOOTER */}

            <View
              style={
                styles.modalFooter
              }
            >

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={
                  closeTeacherModal
                }
                disabled={saving}
                style={
                  styles.cancelButton
                }
              >

                <Text
                  style={
                    styles.cancelButtonText
                  }
                >
                  Cancel
                </Text>

              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={
                  handleAssignTeacher
                }
                disabled={
                  saving ||
                  !selectedTeacherId
                }
                style={[
                  styles.saveButton,
                  (
                    saving ||
                    !selectedTeacherId
                  ) &&
                    styles.saveButtonDisabled,
                ]}
              >

                {saving ? (
                  <ActivityIndicator
                    size="small"
                    color="#FFFFFF"
                  />
                ) : (
                  <Text
                    style={
                      styles.saveButtonText
                    }
                  >
                    {selectedSection.classTeacher
                      ? "Change Teacher"
                      : "Assign Teacher"}
                  </Text>
                )}

              </TouchableOpacity>

            </View>

          </View>

        </View>

      </Modal>
    );
  };


  /* ==========================================================
     MAIN
  ========================================================== */

  return (
    <View
      style={
        styles.page
      }
    >

      {loadingYears ? (

        <View
          style={
            styles.center
          }
        >

          <ActivityIndicator
            size="large"
            color={
              Colors.brandPrimary
            }
          />

          <Text
            style={
              styles.loadingText
            }
          >
            Loading academic years...
          </Text>

        </View>

      ) : (

        <FlatList
          data={
            filteredAssignments
          }
          keyExtractor={
            item =>
              item.id
          }
          renderItem={
            renderSection
          }
          ListHeaderComponent={
            renderHeader
          }
          refreshControl={
            <RefreshControl
              refreshing={
                refreshing
              }
              onRefresh={
                handleRefresh
              }
              tintColor={
                Colors.brandPrimary
              }
            />
          }
          showsVerticalScrollIndicator={
            false
          }
          contentContainerStyle={[
            styles.listContent,
            isDesktop &&
              styles.listContentDesktop,
          ]}
          ListEmptyComponent={
            loadingAssignments ? (
              <View
                style={
                  styles.emptyState
                }
              >

                <ActivityIndicator
                  size="large"
                  color={
                    Colors.brandPrimary
                  }
                />

                <Text
                  style={
                    styles.emptyStateTitle
                  }
                >
                  Loading assignments...
                </Text>

              </View>
            ) : (
              <View
                style={
                  styles.emptyState
                }
              >

                <View
                  style={
                    styles.emptyStateIcon
                  }
                >
                  <Text
                    style={
                      styles.emptyStateIconText
                    }
                  >
                    📚
                  </Text>
                </View>

                <Text
                  style={
                    styles.emptyStateTitle
                  }
                >
                  No sections found
                </Text>

                <Text
                  style={
                    styles.emptyStateText
                  }
                >
                  There are no sections matching
                  the selected filters for this
                  academic year.
                </Text>

              </View>
            )
          }
        />

      )}

      {renderTeacherModal()}

      <Snackbar
        visible={
          snackbarVisible
        }
        onDismiss={() =>
          setSnackbarVisible(false)
        }
        duration={3000}
        style={
          styles.snackbar
        }
      >
        {snackbarText}
      </Snackbar>

    </View>
  );
};


/* ============================================================
   SUMMARY CARD
============================================================ */

const SummaryCard = ({
  title,
  value,
  icon,
  iconBackground,
  iconColor,
  styles,
}: any) => {

  return (
    <Card
      style={
        styles.summaryCard
      }
    >

      <Card.Content>

        <View
          style={
            styles.summaryCardRow
          }
        >

          <Avatar.Icon
            size={44}
            icon={icon}
            color={iconColor}
            style={[
              styles.summaryIcon,
              {
                backgroundColor:
                  iconBackground,
              },
            ]}
          />

          <View
            style={
              styles.summaryText
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
                styles.summaryTitle
              }
            >
              {title}
            </Text>

          </View>

        </View>

      </Card.Content>

    </Card>
  );
};


/* ============================================================
   FILTER BUTTON
============================================================ */

const FilterButton = ({
  title,
  active,
  count,
  onPress,
  styles,
}: any) => {

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.filterButton,
        active &&
          styles.filterButtonActive,
      ]}
    >

      <Text
        style={[
          styles.filterButtonText,
          active &&
            styles.filterButtonTextActive,
        ]}
      >
        {title}
      </Text>

      <View
        style={[
          styles.filterCount,
          active &&
            styles.filterCountActive,
        ]}
      >

        <Text
          style={[
            styles.filterCountText,
            active &&
              styles.filterCountTextActive,
          ]}
        >
          {count}
        </Text>

      </View>

    </TouchableOpacity>
  );
};


/* ============================================================
   HELPERS
============================================================ */

const getInitials = (
  name?: string | null
) => {

  if (!name) {
    return "T";
  }

  const parts =
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean);

  if (
    parts.length === 1
  ) {

    return parts[0]
      .slice(0, 2)
      .toUpperCase();

  }

  return (
    parts[0][0] +
    parts[parts.length - 1][0]
  ).toUpperCase();
};


const formatDate = (
  value?: string
) => {

  if (!value) {
    return "";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  return `${String(
    date.getDate()
  ).padStart(2, "0")}/${String(
    date.getMonth() + 1
  ).padStart(2, "0")}/${date.getFullYear()}`;

};


/* ============================================================
   STYLES
============================================================ */

const useStyles =
  makeStyles(() => ({

    /* ========================================================
       PAGE
    ======================================================== */

    page: {
      flex: 1,
      backgroundColor:
        "#F7F8FC",
    },

    listContent: {
      paddingHorizontal:
        Metrics.x3,

      paddingTop:
        Metrics.x3,

      paddingBottom:
        Metrics.x8,
    },

    listContentDesktop: {
      maxWidth: 1200,
      alignSelf: "center",
      width: "100%",
    },

    /* ========================================================
       CENTER
    ======================================================== */

    center: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding:
        Metrics.x5,
      backgroundColor:
        "#F7F8FC",
    },

    loadingText: {
      marginTop:
        Metrics.x2,
      fontSize: 13,
      color:
        Colors.subtext,
    },

    errorText: {
      color:
        Colors.error,
      textAlign: "center",
      fontSize: 16,
    },

    /* ========================================================
       TOP BAR
    ======================================================== */

    topBar: {
      minHeight: 68,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
      marginBottom:
        Metrics.x3,
    },

    topBarLeft: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },

    backButton: {
      width: 42,
      height: 42,
      borderRadius: 13,
      backgroundColor:
        "#FFFFFF",
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor:
        "#E7E8EE",
      marginRight:
        Metrics.x2,
    },

    backButtonText: {
      fontSize: 24,
      color:
        "#444444",
      marginTop: -2,
    },

    titleContainer: {
      flex: 1,
    },

    screenTitle: {
      fontSize: 26,
      fontWeight: "800",
      color:
        "#171717",
    },

    screenSubtitle: {
      fontSize: 13,
      color:
        Colors.subtext,
      marginTop: 3,
    },

    /* ========================================================
       YEAR
    ======================================================== */

    yearSection: {
      marginBottom:
        Metrics.x4,
      position: "relative",
      zIndex: 20,
    },

    label: {
      fontSize: 12,
      fontWeight: "700",
      color:
        "#555B66",
      marginBottom:
        Metrics.x1,
    },

    yearSelector: {
      minHeight: 54,
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#E3E5EA",
      borderRadius: 14,
      paddingHorizontal:
        Metrics.x3,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
    },

    yearSelectorText: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },

    yearName: {
      fontSize: 14,
      fontWeight: "700",
      color:
        "#171717",
    },

    currentBadge: {
      marginLeft:
        Metrics.x2,
      backgroundColor:
        "#EAF8F0",
      borderRadius: 7,
      paddingHorizontal: 7,
      paddingVertical: 3,
    },

    currentBadgeText: {
      fontSize: 9,
      fontWeight: "800",
      color:
        "#16834B",
      letterSpacing: 0.5,
    },

    chevron: {
      fontSize: 18,
      color:
        "#737780",
    },

    yearDropdown: {
      position: "absolute",
      left: 0,
      right: 0,
      top: 78,
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#E3E5EA",
      borderRadius: 14,
      elevation: 8,
      padding:
        Metrics.x1,
      zIndex: 30,
    },

    yearOption: {
      minHeight: 58,
      paddingHorizontal:
        Metrics.x2,
      borderRadius: 10,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
    },

    yearOptionSelected: {
      backgroundColor:
        "#F3F4FF",
    },

    yearOptionText: {
      flex: 1,
    },

    yearOptionName: {
      fontSize: 14,
      fontWeight: "700",
      color:
        "#333333",
    },

    yearOptionNameSelected: {
      color:
        Colors.brandPrimary,
    },

    yearDates: {
      fontSize: 11,
      color:
        Colors.subtext,
      marginTop: 2,
    },

    smallCurrentBadge: {
      backgroundColor:
        "#EAF8F0",
      paddingHorizontal: 7,
      paddingVertical: 4,
      borderRadius: 6,
    },

    smallCurrentBadgeText: {
      fontSize: 8,
      fontWeight: "800",
      color:
        "#16834B",
    },

    /* ========================================================
       SUMMARY
    ======================================================== */

    summaryGrid: {
      flexDirection: "row",
      marginHorizontal:
        -Metrics.x1,
      marginBottom:
        Metrics.x4,
    },

    summaryGridMobile: {
      flexDirection: "column",
    },

    summaryCard: {
      flex: 1,
      marginHorizontal:
        Metrics.x1,
      marginBottom: Metrics.x2,
      backgroundColor:
        "#FFFFFF",
      borderRadius: 16,
      borderWidth: 1,
      borderColor:
        "#E7E8EE",
      elevation: 1,
    },

    summaryCardRow: {
      flexDirection: "row",
      alignItems: "center",
    },

    summaryIcon: {
      margin: 0,
    },

    summaryText: {
      marginLeft:
        Metrics.x2,
    },

    summaryValue: {
      fontSize: 24,
      fontWeight: "800",
      color:
        "#171717",
    },

    summaryTitle: {
      fontSize: 11,
      color:
        Colors.subtext,
      marginTop: 1,
    },

    /* ========================================================
       SEARCH
    ======================================================== */

    searchContainer: {
      minHeight: 52,
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#E3E5EA",
      borderRadius: 14,
      flexDirection: "row",
      alignItems: "center",
      paddingLeft:
        Metrics.x2,
      marginBottom:
        Metrics.x2,
    },

    searchIcon: {
      fontSize: 15,
    },

    searchInput: {
      flex: 1,
      height: 50,
      fontSize: 13,
      color:
        "#171717",
      paddingHorizontal:
        Metrics.x2,
    },

    /* ========================================================
       FILTERS
    ======================================================== */

    filterRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginBottom:
        Metrics.x4,
    },

    filterButton: {
      flexDirection: "row",
      alignItems: "center",
      minHeight: 38,
      paddingHorizontal:
        Metrics.x2,
      borderRadius: 20,
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#E2E4EA",
      marginRight:
        Metrics.x2,
      marginBottom:
        Metrics.x1,
    },

    filterButtonActive: {
      backgroundColor:
        Colors.brandPrimary,
      borderColor:
        Colors.brandPrimary,
    },

    filterButtonText: {
      fontSize: 12,
      fontWeight: "700",
      color:
        "#60646D",
    },

    filterButtonTextActive: {
      color:
        "#FFFFFF",
    },

    filterCount: {
      marginLeft:
        Metrics.x1,
      minWidth: 22,
      height: 22,
      borderRadius: 11,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        "#F1F2F5",
    },

    filterCountActive: {
      backgroundColor:
        "rgba(255,255,255,0.20)",
    },

    filterCountText: {
      fontSize: 10,
      fontWeight: "800",
      color:
        "#60646D",
    },

    filterCountTextActive: {
      color:
        "#FFFFFF",
    },

    /* ========================================================
       LIST HEADING
    ======================================================== */

    listHeading: {
      marginBottom:
        Metrics.x2,
    },

    listTitle: {
      fontSize: 18,
      fontWeight: "800",
      color:
        "#171717",
    },

    listSubtitle: {
      fontSize: 12,
      color:
        Colors.subtext,
      marginTop: 3,
    },

    /* ========================================================
       SECTION CARD
    ======================================================== */

    sectionCard: {
      marginBottom:
        Metrics.x3,
      borderRadius: 18,
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#E7E8EE",
      elevation: 1,
    },

    sectionCardDesktop: {
      borderRadius: 20,
    },

    sectionCardTop: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
    },

    classIdentity: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },

    classBadge: {
      width: 50,
      height: 50,
      borderRadius: 15,
      backgroundColor:
        "#EEF2FF",
      alignItems: "center",
      justifyContent: "center",
    },

    classBadgeText: {
      fontSize: 16,
      fontWeight: "800",
      color:
        "#4F46E5",
    },

    classIdentityText: {
      marginLeft:
        Metrics.x2,
      flex: 1,
    },

    className: {
      fontSize: 16,
      fontWeight: "800",
      color:
        "#171717",
    },

    sectionName: {
      fontSize: 12,
      color:
        Colors.subtext,
      marginTop: 2,
    },

    statusBadge: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 9,
      paddingVertical: 6,
      borderRadius: 10,
    },

    assignedBadge: {
      backgroundColor:
        "#EAF8F0",
    },

    unassignedBadge: {
      backgroundColor:
        "#FFF5ED",
    },

    statusDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
      marginRight: 5,
    },

    assignedDot: {
      backgroundColor:
        "#16834B",
    },

    unassignedDot: {
      backgroundColor:
        "#C55A11",
    },

    statusText: {
      fontSize: 10,
      fontWeight: "800",
    },

    assignedText: {
      color:
        "#16834B",
    },

    unassignedText: {
      color:
        "#C55A11",
    },

    cardDivider: {
      marginVertical:
        Metrics.x3,
    },

    /* ========================================================
       TEACHER
    ======================================================== */

    teacherRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
    },

    teacherInfo: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
      minWidth: 0,
    },

    teacherAvatar: {
      backgroundColor:
        Colors.brandPrimary,
    },

    emptyTeacherAvatar: {
      width: 46,
      height: 46,
      borderRadius: 14,
      backgroundColor:
        "#F1F2F5",
      alignItems: "center",
      justifyContent: "center",
    },

    emptyTeacherIcon: {
      fontSize: 18,
      fontWeight: "800",
      color:
        "#9CA3AF",
    },

    teacherDetails: {
      flex: 1,
      marginLeft:
        Metrics.x2,
      minWidth: 0,
    },

    teacherLabel: {
      fontSize: 9,
      fontWeight: "800",
      letterSpacing: 0.7,
      color:
        "#9CA3AF",
      marginBottom: 2,
    },

    teacherName: {
      fontSize: 14,
      fontWeight: "800",
      color:
        "#171717",
    },

    noTeacher: {
      fontSize: 14,
      fontWeight: "700",
      color:
        "#60646D",
    },

    teacherMeta: {
      fontSize: 11,
      color:
        Colors.subtext,
      marginTop: 2,
    },

    actionRow: {
      flexDirection: "row",
      alignItems: "center",
      marginLeft:
        Metrics.x2,
    },

    assignButton: {
      minHeight: 38,
      paddingHorizontal:
        Metrics.x3,
      borderRadius: 10,
      backgroundColor:
        Colors.brandPrimary,
      alignItems: "center",
      justifyContent: "center",
    },

    assignButtonText: {
      color: "#FFFFFF",
      fontSize: 12,
      fontWeight: "800",
    },

    removeButton: {
      minHeight: 38,
      paddingHorizontal:
        Metrics.x2,
      marginLeft:
        Metrics.x1,
      borderRadius: 10,
      backgroundColor:
        "#FFF1F1",
      alignItems: "center",
      justifyContent: "center",
    },

    removeButtonText: {
      color:
        "#D64545",
      fontSize: 12,
      fontWeight: "700",
    },

    studentInfo: {
      marginTop:
        Metrics.x3,
      alignSelf: "flex-start",
      flexDirection: "row",
      alignItems: "center",
      backgroundColor:
        "#F7F8FA",
      paddingHorizontal:
        Metrics.x2,
      paddingVertical: 6,
      borderRadius: 9,
    },

    studentIcon: {
      fontSize: 12,
    },

    studentCount: {
      fontSize: 11,
      fontWeight: "600",
      color:
        "#60646D",
      marginLeft: 5,
    },

    /* ========================================================
       MODAL
    ======================================================== */

    modalBackdrop: {
      flex: 1,
      backgroundColor:
        "rgba(0,0,0,0.40)",
      alignItems: "center",
      justifyContent: "center",
      padding:
        Metrics.x3,
    },

    teacherModal: {
      width: "100%",
      maxWidth: 520,
      maxHeight: "88%",
      backgroundColor:
        "#FFFFFF",
      borderRadius: 20,
      overflow: "hidden",
      elevation: 10,
    },

    teacherModalMobile: {
      maxWidth: "100%",
    },

    teacherModalDesktop: {
      maxWidth: 560,
    },

    modalHeader: {
      minHeight: 76,
      paddingHorizontal:
        Metrics.x3,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
    },

    modalTitle: {
      fontSize: 18,
      fontWeight: "800",
      color:
        "#171717",
    },

    modalSubtitle: {
      fontSize: 12,
      color:
        Colors.subtext,
      marginTop: 3,
    },

    teacherSearchContainer: {
      margin:
        Metrics.x3,
      minHeight: 48,
      borderWidth: 1,
      borderColor:
        "#E2E4EA",
      borderRadius: 12,
      flexDirection: "row",
      alignItems: "center",
      paddingLeft:
        Metrics.x2,
    },

    teacherSearchInput: {
      flex: 1,
      height: 46,
      fontSize: 13,
      color:
        "#171717",
      paddingHorizontal:
        Metrics.x2,
    },

    teacherList: {
      paddingHorizontal:
        Metrics.x3,
    },

    teacherOption: {
      minHeight: 72,
      borderRadius: 13,
      paddingHorizontal:
        Metrics.x2,
      marginBottom:
        Metrics.x1,
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor:
        "#ECEDEF",
    },

    teacherOptionSelected: {
      borderColor:
        Colors.brandPrimary,
      backgroundColor:
        "#F4F5FF",
    },

    teacherOptionAvatar: {
      backgroundColor:
        Colors.brandPrimary,
    },

    teacherOptionInfo: {
      flex: 1,
      marginLeft:
        Metrics.x2,
      minWidth: 0,
    },

    teacherOptionName: {
      fontSize: 13,
      fontWeight: "800",
      color:
        "#171717",
    },

    teacherOptionMeta: {
      fontSize: 10,
      color:
        Colors.subtext,
      marginTop: 2,
    },

    teacherAssignmentInfo: {
      fontSize: 10,
      fontWeight: "600",
      color:
        "#16834B",
      marginTop: 3,
    },

    teacherAssignmentWarning: {
      color:
        "#C55A11",
    },

    selectionCircle: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 1.5,
      borderColor:
        "#D4D6DC",
      alignItems: "center",
      justifyContent: "center",
      marginLeft:
        Metrics.x2,
    },

    selectionCircleSelected: {
      borderColor:
        Colors.brandPrimary,
      backgroundColor:
        Colors.brandPrimary,
    },

    checkmark: {
      color:
        "#FFFFFF",
      fontSize: 12,
      fontWeight: "800",
    },

    modalLoading: {
      minHeight: 220,
      alignItems: "center",
      justifyContent: "center",
    },

    emptyModal: {
      minHeight: 180,
      alignItems: "center",
      justifyContent: "center",
    },

    emptyModalTitle: {
      fontSize: 15,
      fontWeight: "800",
      color:
        "#333333",
    },

    emptyModalText: {
      fontSize: 12,
      color:
        Colors.subtext,
      marginTop: 4,
    },

    modalFooter: {
      padding:
        Metrics.x3,
      flexDirection: "row",
      justifyContent:
        "flex-end",
      borderTopWidth: 1,
      borderTopColor:
        "#ECEDEF",
    },

    cancelButton: {
      minHeight: 44,
      paddingHorizontal:
        Metrics.x3,
      borderRadius: 11,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        "#F1F2F5",
      marginRight:
        Metrics.x2,
    },

    cancelButtonText: {
      fontSize: 12,
      fontWeight: "700",
      color:
        "#555B66",
    },

    saveButton: {
      minHeight: 44,
      minWidth: 145,
      paddingHorizontal:
        Metrics.x3,
      borderRadius: 11,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        Colors.brandPrimary,
    },

    saveButtonDisabled: {
      opacity: 0.55,
    },

    saveButtonText: {
      color:
        "#FFFFFF",
      fontSize: 12,
      fontWeight: "800",
    },

    /* ========================================================
       EMPTY
    ======================================================== */

    emptyState: {
      paddingVertical:
        Metrics.x8,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal:
        Metrics.x5,
    },

    emptyStateIcon: {
      width: 68,
      height: 68,
      borderRadius: 20,
      backgroundColor:
        "#EEF2FF",
      alignItems: "center",
      justifyContent: "center",
      marginBottom:
        Metrics.x3,
    },

    emptyStateIconText: {
      fontSize: 28,
    },

    emptyStateTitle: {
      fontSize: 17,
      fontWeight: "800",
      color:
        "#171717",
      textAlign: "center",
    },

    emptyStateText: {
      maxWidth: 450,
      fontSize: 12,
      lineHeight: 18,
      color:
        Colors.subtext,
      textAlign: "center",
      marginTop:
        Metrics.x1,
    },

    /* ========================================================
       SNACKBAR
    ======================================================== */

    snackbar: {
      backgroundColor:
        Colors.errorBg,
    },

  }));


export {
  PrincipalClassTeachersScreen,
};