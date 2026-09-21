import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

import {
  Avatar,
  Card,
  Chip,
  Divider,
} from "react-native-paper";


import { StyleSheet } from "react-native";

import {
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
  Colors,
  makeStyles,
  Metrics,
} from "../../theme";

import {
  teacherServices,
  TeacherAssignedSection,
} from "../../services/teacherServices";


/* ============================================================
   TYPES
============================================================ */

type ClassGroup = {
  classId: string;
  classNumber: string;
  classDisplayName: string;
  sections: TeacherAssignedSection[];
};


/* ============================================================
   SCREEN
============================================================ */

const TeacherAttendanceScreen = () => {
  const styles = useStyles(StyleSheet);

  const navigation =
    useNavigation<
      NativeStackNavigationProp<
        RootStackParamList
      >
    >();

  const { width } =
    useWindowDimensions();

  const isDesktop =
    width >= 1024;


  /* ==========================================================
     STATE
  ========================================================== */

  const [
    sections,
    setSections,
  ] = useState<
    TeacherAssignedSection[]
  >([]);

  const [
    academicYear,
    setAcademicYear,
  ] = useState<{
    id: string;
    name: string;
    startDate?: string;
    endDate?: string;
  } | null>(null);

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
  ] = useState<string | null>(null);

  const [
    selectedClassId,
    setSelectedClassId,
  ] = useState<string | null>(null);


  /* ==========================================================
     LOAD
  ========================================================== */

  const loadSections = useCallback(
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
            .getAssignedSections();

        setSections(
          response.sections ?? []
        );

        setAcademicYear(
          response.academicYear ?? null
        );

      } catch (err: any) {
        console.error(
          "GET TEACHER ATTENDANCE SECTIONS ERROR:",
          err
        );

        setError(
          err?.response?.data?.message ??
            "Unable to load your assigned sections."
        );

      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );


  /* ==========================================================
     INITIAL LOAD
  ========================================================== */

  useEffect(() => {
    loadSections();
  }, [
    loadSections,
  ]);


  /* ==========================================================
     GROUP BY CLASS
  ========================================================== */

  const classGroups =
    useMemo<ClassGroup[]>(() => {

      const map =
        new Map<string, ClassGroup>();

      sections.forEach(
        (section) => {

          let group =
            map.get(
              section.classId
            );

          if (!group) {

            group = {
              classId:
                section.classId,

              classNumber:
                section.classNumber,

              classDisplayName:
                section.classDisplayName,

              sections: [],
            };

            map.set(
              section.classId,
              group
            );
          }

          group.sections.push(
            section
          );
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

    }, [
      sections,
    ]);


  /* ==========================================================
     SELECTED CLASS
  ========================================================== */

  const visibleGroups =
    useMemo(() => {

      if (!selectedClassId) {
        return classGroups;
      }

      return classGroups.filter(
        group =>
          group.classId ===
          selectedClassId
      );

    }, [
      classGroups,
      selectedClassId,
    ]);


  /* ==========================================================
     REFRESH
  ========================================================== */

  const handleRefresh =
    () => {

      setRefreshing(true);

      loadSections(false);
    };


  /* ==========================================================
     OPEN ATTENDANCE
  ========================================================== */

  const openAttendance = (
    section: TeacherAssignedSection
  ) => {

    navigation.navigate(
      RootStackScreenNames.TeacherSectionAttendance,
      {
        sectionId:
          section.sectionId,

        classId:
          section.classId,

        classNumber:
          section.classNumber,

        sectionName:
          section.sectionName,
      }
    );
  };


  /* ==========================================================
     HEADER
  ========================================================== */

  const renderHeader = () => {

    return (
      <View>

        {/* ----------------------------------------------------
            TITLE
        ---------------------------------------------------- */}

        <View
          style={
            styles.heading
          }
        >

          <Text
            style={
              styles.eyebrow
            }
          >
            TEACHING
          </Text>

          <Text
            style={
              styles.title
            }
          >
            Attendance
          </Text>

          <Text
            style={
              styles.subtitle
            }
          >
            Mark and view attendance
            for your assigned classes.
          </Text>

        </View>


        {/* ----------------------------------------------------
            ACADEMIC YEAR
        ---------------------------------------------------- */}

        <Card
          style={
            styles.yearCard
          }
        >

          <Card.Content>

            <View
              style={
                styles.yearRow
              }
            >

              <Avatar.Icon
                size={46}
                icon="calendar-school"
                color={
                  Colors.brandPrimary
                }
                style={
                  styles.yearIcon
                }
              />

              <View
                style={
                  styles.yearText
                }
              >

                <Text
                  style={
                    styles.yearLabel
                  }
                >
                  ACADEMIC YEAR
                </Text>

                <Text
                  style={
                    styles.yearName
                  }
                >
                  {
                    academicYear?.name ??
                    "Loading..."
                  }
                </Text>

              </View>

            </View>

          </Card.Content>

        </Card>


        {/* ----------------------------------------------------
            SUMMARY
        ---------------------------------------------------- */}

        <View
          style={
            styles.summaryGrid
          }
        >

          <SummaryCard
            icon="google-classroom"
            title="Classes"
            value={
              classGroups.length
            }
            styles={styles}
          />

          <SummaryCard
            icon="view-grid-outline"
            title="Sections"
            value={
              sections.length
            }
            styles={styles}
          />

          <SummaryCard
            icon="account-group"
            title="Students"
            value={
              sections.reduce(
                (
                  total,
                  section
                ) =>
                  total +
                  (
                    section.totalStudents ??
                    0
                  ),
                0
              )
            }
            styles={styles}
          />

        </View>


        {/* ----------------------------------------------------
            CLASS FILTER
        ---------------------------------------------------- */}

        {classGroups.length > 1 ? (

          <View
            style={
              styles.filterContainer
            }
          >

            <Text
              style={
                styles.filterLabel
              }
            >
              FILTER BY CLASS
            </Text>

            <View
              style={
                styles.filterRow
              }
            >

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() =>
                  setSelectedClassId(
                    null
                  )
                }
              >

                <Chip
                  compact
                  selected={
                    selectedClassId ===
                    null
                  }
                  icon={
                    selectedClassId ===
                    null
                      ? "check"
                      : undefined
                  }
                  style={[
                    styles.filterChip,
                    selectedClassId ===
                      null &&
                      styles.filterChipSelected,
                  ]}
                  textStyle={
                    styles.filterChipText
                  }
                >
                  All Classes
                </Chip>

              </TouchableOpacity>


              {classGroups.map(
                (group) => (

                  <TouchableOpacity
                    key={
                      group.classId
                    }
                    activeOpacity={0.8}
                    onPress={() =>
                      setSelectedClassId(
                        group.classId
                      )
                    }
                  >

                    <Chip
                      compact
                      selected={
                        selectedClassId ===
                        group.classId
                      }
                      icon={
                        selectedClassId ===
                        group.classId
                          ? "check"
                          : undefined
                      }
                      style={[
                        styles.filterChip,
                        selectedClassId ===
                          group.classId &&
                          styles.filterChipSelected,
                      ]}
                      textStyle={
                        styles.filterChipText
                      }
                    >
                      Class{" "}
                      {group.classNumber}
                    </Chip>

                  </TouchableOpacity>

                )
              )}

            </View>

          </View>

        ) : null}

      </View>
    );
  };


  /* ==========================================================
     CLASS GROUP
  ========================================================== */

  const renderClass = ({
    item,
  }: {
    item: ClassGroup;
  }) => {

    return (
      <Card
        style={[
          styles.classCard,
          isDesktop &&
            styles.classCardDesktop,
        ]}
      >

        <Card.Content>

          {/* --------------------------------------------------
              CLASS HEADER
          -------------------------------------------------- */}

          <View
            style={
              styles.classHeader
            }
          >

            <Avatar.Icon
              size={48}
              icon="google-classroom"
              color={
                Colors.brandPrimary
              }
              style={
                styles.classIcon
              }
            />

            <View
              style={
                styles.classTitle
              }
            >

              <Text
                style={
                  styles.classNumber
                }
              >
                CLASS{" "}
                {item.classNumber}
              </Text>

              <Text
                style={
                  styles.className
                }
                numberOfLines={1}
              >
                {
                  item.classDisplayName
                }
              </Text>

            </View>

            <Text
              style={
                styles.sectionCount
              }
            >
              {item.sections.length}{" "}
              {item.sections.length === 1
                ? "Section"
                : "Sections"}
            </Text>

          </View>


          <Divider
            style={
              styles.divider
            }
          />


          {/* --------------------------------------------------
              SECTIONS
          -------------------------------------------------- */}

          <Text
            style={
              styles.sectionLabel
            }
          >
            SELECT SECTION
          </Text>


          <View
            style={
              styles.sectionList
            }
          >

            {item.sections
              .sort(
                (a, b) =>
                  a.sectionName.localeCompare(
                    b.sectionName
                  )
              )
              .map(
                (section) => (

                  <TouchableOpacity
                    key={
                      section.sectionId
                    }
                    activeOpacity={0.86}
                    onPress={() =>
                      openAttendance(
                        section
                      )
                    }
                    style={
                      styles.sectionTouchable
                    }
                  >

                    <View
                      style={
                        styles.sectionRow
                      }
                    >

                      <View
                        style={
                          styles.sectionIcon
                        }
                      >

                        <Avatar.Icon
                          size={40}
                          icon="account-group"
                          color={
                            Colors.brandPrimary
                          }
                          style={
                            styles.sectionAvatar
                          }
                        />

                      </View>


                      <View
                        style={
                          styles.sectionInfo
                        }
                      >

                        <View
                          style={
                            styles.sectionTitleRow
                          }
                        >

                          <Text
                            style={
                              styles.sectionName
                            }
                          >
                            Section{" "}
                            {
                              section.sectionName
                            }
                          </Text>

                          {section.isClassTeacher ? (

                            <Chip
                              compact
                              icon="crown"
                              style={
                                styles.classTeacherChip
                              }
                              textStyle={
                                styles.classTeacherText
                              }
                            >
                              Class Teacher
                            </Chip>

                          ) : null}

                        </View>


                        <Text
                          style={
                            styles.sectionMeta
                          }
                        >
                          {
                            section.totalStudents ??
                            0
                          }{" "}
                          students
                        </Text>


                        {section.subjects?.length ? (

                          <Text
                            style={
                              styles.subjectText
                            }
                            numberOfLines={1}
                          >
                            {
                              section.subjects
                                .map(
                                  subject =>
                                    subject.name
                                )
                                .join(
                                  " • "
                                )
                            }
                          </Text>

                        ) : null}

                      </View>


                      <View
                        style={
                          styles.arrowContainer
                        }
                      >

                        <Text
                          style={
                            styles.arrow
                          }
                        >
                          →
                        </Text>

                      </View>

                    </View>

                  </TouchableOpacity>

                )
              )}

          </View>

        </Card.Content>

      </Card>
    );
  };


  /* ==========================================================
     LOADING
  ========================================================== */

  if (loading) {

    return (
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
          Loading your sections...
        </Text>

      </View>
    );
  }


  /* ==========================================================
     ERROR
  ========================================================== */

  if (
    error &&
    sections.length === 0
  ) {

    return (
      <View
        style={
          styles.center
        }
      >

        <Avatar.Icon
          size={64}
          icon="alert-circle-outline"
          color={
            Colors.error
          }
          style={
            styles.errorIcon
          }
        />

        <Text
          style={
            styles.errorTitle
          }
        >
          Unable to load attendance
        </Text>

        <Text
          style={
            styles.errorText
          }
        >
          {error}
        </Text>

        <TouchableOpacity
          activeOpacity={0.8}
          style={
            styles.retryButton
          }
          onPress={() =>
            loadSections()
          }
        >

          <Text
            style={
              styles.retryText
            }
          >
            Try Again
          </Text>

        </TouchableOpacity>

      </View>
    );
  }


  /* ==========================================================
     MAIN
  ========================================================== */

  return (
    <View
      style={
        styles.page
      }
    >

      <FlatList
        data={
          visibleGroups
        }
        keyExtractor={
          item =>
            item.classId
        }
        renderItem={
          renderClass
        }
        ListHeaderComponent={
          renderHeader
        }

        ListEmptyComponent={

          <View
            style={
              styles.empty
            }
          >

            <Avatar.Icon
              size={64}
              icon="calendar-remove"
              color="#9CA3AF"
              style={
                styles.emptyIcon
              }
            />

            <Text
              style={
                styles.emptyTitle
              }
            >
              No sections assigned
            </Text>

            <Text
              style={
                styles.emptyText
              }
            >
              You don't have any active
              class or section assignments
              for the current academic year.
            </Text>

          </View>

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

        contentContainerStyle={
          styles.listContent
        }
      />

    </View>
  );
};


/* ============================================================
   SUMMARY CARD
============================================================ */

const SummaryCard = ({
  icon,
  title,
  value,
  styles,
}: {
  icon: string;
  title: string;
  value: number;
  styles: any;
}) => {

  return (
    <Card
      style={
        styles.summaryCard
      }
    >

      <Card.Content>

        <Avatar.Icon
          size={36}
          icon={icon}
          color={
            Colors.brandPrimary
          }
          style={
            styles.summaryIcon
          }
        />

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

      </Card.Content>

    </Card>
  );
};


/* ============================================================
   STYLES
============================================================ */

const useStyles = makeStyles(
  (theme: any) => ({

    page: {
      flex: 1,
      backgroundColor:
        "#F7F8FC",
    },

    listContent: {
      padding: Metrics.x3,
      paddingBottom:
        Metrics.x1 * 2,
    },


    /* --------------------------------------------------------
       HEADER
    -------------------------------------------------------- */

    heading: {
      marginBottom:
        Metrics.x1 * 2,
    },

    eyebrow: {
      fontSize: 12,
      fontWeight: "800",
      letterSpacing: 1.2,
      color:
        Colors.brandPrimary,
      marginBottom: 4,
    },

    title: {
      fontSize: 30,
      fontWeight: "800",
      color: "#18181B",
    },

    subtitle: {
      marginTop: 5,
      fontSize: 15,
      lineHeight: 22,
      color: "#7B8190",
    },


    /* --------------------------------------------------------
       YEAR
    -------------------------------------------------------- */

    yearCard: {
      marginBottom:
        Metrics.x1 * 2,
      borderRadius: 18,
      backgroundColor:
        "#FFFFFF",
      elevation: 2,
    },

    yearRow: {
      flexDirection: "row",
      alignItems: "center",
    },

    yearIcon: {
      backgroundColor:
        "#EEF2FF",
    },

    yearText: {
      marginLeft:
        Metrics.x1 * 2,
    },

    yearLabel: {
      fontSize: 11,
      fontWeight: "800",
      letterSpacing: 0.8,
      color: "#8B91A0",
    },

    yearName: {
      marginTop: 3,
      fontSize: 18,
      fontWeight: "800",
      color: "#202124",
    },


    /* --------------------------------------------------------
       SUMMARY
    -------------------------------------------------------- */

    summaryGrid: {
      flexDirection: "row",
      gap: 10,
      marginBottom:
        Metrics.x1 * 2,
    },

    summaryCard: {
      flex: 1,
      borderRadius: 16,
      backgroundColor:
        "#FFFFFF",
      elevation: 1,
    },

    summaryIcon: {
      backgroundColor:
        "#EEF2FF",
    },

    summaryValue: {
      marginTop: 8,
      fontSize: 24,
      fontWeight: "800",
      color: "#18181B",
    },

    summaryTitle: {
      marginTop: 2,
      fontSize: 12,
      color: "#858B99",
    },


    /* --------------------------------------------------------
       FILTER
    -------------------------------------------------------- */

    filterContainer: {
      marginBottom:
        Metrics.x1 * 2,
    },

    filterLabel: {
      fontSize: 11,
      fontWeight: "800",
      letterSpacing: 0.8,
      color: "#8B91A0",
      marginBottom: 8,
    },

    filterRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },

    filterChip: {
      backgroundColor:
        "#FFFFFF",
    },

    filterChipSelected: {
      backgroundColor:
        "#EDE9FE",
    },

    filterChipText: {
      color:
        Colors.brandPrimary,
      fontWeight: "700",
    },


    /* --------------------------------------------------------
       CLASS CARD
    -------------------------------------------------------- */

    classCard: {
      marginBottom:
        Metrics.x1 * 2,
      borderRadius: 20,
      backgroundColor:
        "#FFFFFF",
      elevation: 2,
    },

    classCardDesktop: {
      maxWidth: 1100,
      alignSelf: "center",
      width: "100%",
    },

    classHeader: {
      flexDirection: "row",
      alignItems: "center",
    },

    classIcon: {
      backgroundColor:
        "#EEF2FF",
    },

    classTitle: {
      flex: 1,
      marginLeft:
        Metrics.x1 * 2,
    },

    classNumber: {
      fontSize: 11,
      fontWeight: "800",
      letterSpacing: 0.8,
      color:
        Colors.brandPrimary,
    },

    className: {
      marginTop: 3,
      fontSize: 18,
      fontWeight: "800",
      color: "#202124",
    },

    sectionCount: {
      fontSize: 12,
      fontWeight: "700",
      color: "#8B91A0",
    },

    divider: {
      marginVertical:
        Metrics.x1 * 2,
    },


    /* --------------------------------------------------------
       SECTIONS
    -------------------------------------------------------- */

    sectionLabel: {
      fontSize: 11,
      fontWeight: "800",
      letterSpacing: 0.8,
      color: "#8B91A0",
      marginBottom: 8,
    },

    sectionList: {
      gap: 8,
    },

    sectionTouchable: {
      borderRadius: 16,
      backgroundColor:
        "#F8F9FD",
      borderWidth: 1,
      borderColor:
        "#ECEEF5",
    },

    sectionRow: {
      minHeight: 78,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      paddingVertical: 10,
    },

    sectionIcon: {
      marginRight: 10,
    },

    sectionAvatar: {
      backgroundColor:
        "#EEF2FF",
    },

    sectionInfo: {
      flex: 1,
    },

    sectionTitleRow: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 6,
    },

    sectionName: {
      fontSize: 16,
      fontWeight: "800",
      color: "#24262B",
    },

    sectionMeta: {
      marginTop: 3,
      fontSize: 13,
      color: "#727887",
    },

    subjectText: {
      marginTop: 3,
      fontSize: 11,
      color: "#9A9FAC",
    },

    classTeacherChip: {
      height: 25,
      backgroundColor:
        "#FFF4D8",
    },

    classTeacherText: {
      fontSize: 10,
      fontWeight: "700",
      color: "#A66A00",
    },

    arrowContainer: {
      marginLeft: 8,
    },

    arrow: {
      fontSize: 24,
      color: "#9AA1B0",
    },


    /* --------------------------------------------------------
       LOADING / ERROR
    -------------------------------------------------------- */

    center: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 30,
      backgroundColor:
        "#F7F8FC",
    },

    loadingText: {
      marginTop: 12,
      fontSize: 14,
      color: "#7B8190",
    },

    errorIcon: {
      backgroundColor:
        "#FEECEC",
    },

    errorTitle: {
      marginTop: 14,
      fontSize: 18,
      fontWeight: "800",
      color: "#202124",
      textAlign: "center",
    },

    errorText: {
      marginTop: 6,
      fontSize: 14,
      color: "#7B8190",
      textAlign: "center",
    },

    retryButton: {
      marginTop: 18,
      paddingHorizontal: 22,
      paddingVertical: 11,
      borderRadius: 10,
      backgroundColor:
        Colors.brandPrimary,
    },

    retryText: {
      color: "#FFFFFF",
      fontWeight: "800",
    },


    /* --------------------------------------------------------
       EMPTY
    -------------------------------------------------------- */

    empty: {
      alignItems: "center",
      paddingVertical: 70,
      paddingHorizontal: 30,
    },

    emptyIcon: {
      backgroundColor:
        "#EEF0F4",
    },

    emptyTitle: {
      marginTop: 14,
      fontSize: 18,
      fontWeight: "800",
      color: "#202124",
    },

    emptyText: {
      marginTop: 6,
      fontSize: 14,
      lineHeight: 21,
      color: "#858B99",
      textAlign: "center",
    },

  })
);


export default TeacherAttendanceScreen;