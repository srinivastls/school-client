import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
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

import {
  useNavigation,
  useRoute,
} from "@react-navigation/native";

import type {
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";

import type {
  RouteProp,
} from "@react-navigation/native";

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
} from "../../services/teacherServices";

/* ============================================================
   TYPES
============================================================ */

type TeacherSubject = {
  id: string;
  name: string;
  code?: string | null;
  isOptional?: boolean;
};

type TeacherSection = {
  sectionId: string;
  sectionName: string;

  classId: string;
  classNumber: string;
  classDisplayName: string;

  academicYearId: string;
  academicYearName: string;

  totalStudents: number;

  isClassTeacher: boolean;

  subjects: TeacherSubject[];
};

type TeacherMyClassesResponse = {
  academicYear?: {
    id: string;
    name: string;
    startDate?: string;
    endDate?: string;
  } | null;

  sections?: TeacherSection[];

  summary?: {
    totalClasses?: number;
    totalSections: number;
    totalStudents: number;
    totalSubjects: number;
  };
};

/* ============================================================
   ROUTE TYPES
============================================================ */

type SectionDetailsRouteProp = RouteProp<
  RootStackParamList,
  RootStackScreenNames.TeacherSectionDetails
>;

/* ============================================================
   COMPONENT
============================================================ */

const TeacherSectionDetailsScreen = () => {
  const styles = useStyles();

  const navigation =
    useNavigation<
      NativeStackNavigationProp<
        RootStackParamList
      >
    >();

  const route =
    useRoute<SectionDetailsRouteProp>();

  const {
    sectionId,
    classId,
    classNumber,
    sectionName,
  } = route.params;

  const { width } =
    useWindowDimensions();

  const isDesktop =
    width >= 1024;

  /* ==========================================================
     STATE
  ========================================================== */

  const [
    section,
    setSection,
  ] = useState<TeacherSection | null>(null);

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

  /* ==========================================================
     VALIDATE PARAMS
  ========================================================== */

  const validParams =
    Boolean(
      sectionId &&
      classId
    );

  /* ==========================================================
     LOAD SECTION
  ========================================================== */

  const loadSection = useCallback(
    async (
      showLoader = true
    ) => {
      if (!validParams) {
        setError(
          "Section information is missing."
        );

        setLoading(false);
        setRefreshing(false);

        return;
      }

      try {
        if (showLoader) {
          setLoading(true);
        }

        setError(null);

        const response =
          (await teacherServices.getMyClasses()) as TeacherMyClassesResponse;

        const sections =
          response.sections ?? [];

        const foundSection =
          sections.find(
            (item) =>
              item.sectionId === sectionId &&
              item.classId === classId
          );

        if (!foundSection) {
          setSection(null);

          setError(
            "This section is not assigned to you or is no longer available."
          );

          return;
        }

        setSection(
          foundSection
        );

        setAcademicYear(
          response.academicYear ??
            null
        );

      } catch (err: any) {
        console.error(
          "GET TEACHER SECTION DETAILS ERROR:",
          err?.response?.data ??
            err
        );

        setError(
          err?.response?.data?.message ??
            "Unable to load section details."
        );

      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [
      sectionId,
      classId,
      validParams,
    ]
  );

  /* ==========================================================
     INITIAL LOAD
  ========================================================== */

  useEffect(() => {
    loadSection();

  }, [
    loadSection,
  ]);

  /* ==========================================================
     REFRESH
  ========================================================== */

  const handleRefresh =
    () => {
      setRefreshing(true);

      loadSection(false);
    };

  /* ==========================================================
     DERIVED VALUES
  ========================================================== */

  const subjects =
    useMemo(
      () =>
        [...(
          section?.subjects ??
          []
        )].sort(
          (a, b) =>
            a.name.localeCompare(
              b.name
            )
        ),
      [
        section,
      ]
    );

  /* ==========================================================
     STUDENTS
  ========================================================== */

  const openStudents =
    () => {
      if (!section) {
        return;
      }

      navigation.navigate(
        RootStackScreenNames.TeacherSectionStudents,
        {
          sectionId:
            section.sectionId,

          classId:
            section.classId,

          classNumber:
            section.classNumber,

          sectionName:
            section.sectionName,
        } as any
      );
    };

  /* ==========================================================
     ATTENDANCE
  ========================================================== */

  const openAttendance =
    () => {
      if (!section) {
        return;
      }

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
        } as any
      );
    };

  /* ==========================================================
     SUBJECTS
  ========================================================== */

  const openSubjects =
    () => {
      if (!section) {
        return;
      }

      /*
       * Subject-management screen will be
       * connected later.
       *
       * For now we intentionally don't
       * navigate to a non-existing route.
       */
    };

  /* ==========================================================
     TIMETABLE
  ========================================================== */

  const openTimetable =
    () => {
      if (!section) {
        return;
      }

      /*
       * Timetable screen will be connected
       * after the teacher timetable module
       * is implemented.
       */
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
          Loading section...
        </Text>
      </View>
    );
  }

  /* ==========================================================
     ERROR
  ========================================================== */

  if (
    error ||
    !section
  ) {
    return (
      <View
        style={
          styles.center
        }
      >
        <Avatar.Icon
          size={68}
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
          Unable to load section
        </Text>

        <Text
          style={
            styles.errorText
          }
        >
          {error ??
            "Section details could not be found."}
        </Text>

        <TouchableOpacity
          activeOpacity={0.8}
          style={
            styles.retryButton
          }
          onPress={() =>
            loadSection()
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
      <ScrollView
        showsVerticalScrollIndicator={
          false
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
        contentContainerStyle={[
          styles.content,
          isDesktop &&
            styles.contentDesktop,
        ]}
      >

        {/* ====================================================
            BACK
        ==================================================== */}

        <TouchableOpacity
          activeOpacity={0.7}
          style={
            styles.backButton
          }
          onPress={() =>
            navigation.goBack()
          }
        >
          <Text
            style={
              styles.backArrow
            }
          >
            ←
          </Text>

          <Text
            style={
              styles.backText
            }
          >
            My Classes
          </Text>
        </TouchableOpacity>


        {/* ====================================================
            HERO
        ==================================================== */}

        <Card
          style={
            styles.heroCard
          }
        >
          <Card.Content>

            <View
              style={
                styles.heroTop
              }
            >

              <View
                style={
                  styles.heroIconContainer
                }
              >
                <Avatar.Icon
                  size={58}
                  icon="google-classroom"
                  color={
                    Colors.brandPrimary
                  }
                  style={
                    styles.heroIcon
                  }
                />
              </View>

              <View
                style={
                  styles.heroText
                }
              >

                <Text
                  style={
                    styles.eyebrow
                  }
                >
                  CLASS SECTION
                </Text>

                <Text
                  style={
                    styles.heroTitle
                  }
                >
                  Class{" "}
                  {section.classNumber}
                  {" • "}
                  {section.sectionName}
                </Text>

                <Text
                  style={
                    styles.heroSubtitle
                  }
                  numberOfLines={2}
                >
                  {section.classDisplayName}
                </Text>

              </View>

            </View>


            <Divider
              style={
                styles.heroDivider
              }
            />


            <View
              style={
                styles.heroBottom
              }
            >

              <View
                style={
                  styles.yearInfo
                }
              >
                <Text
                  style={
                    styles.smallLabel
                  }
                >
                  ACADEMIC YEAR
                </Text>

                <Text
                  style={
                    styles.yearText
                  }
                >
                  {academicYear?.name ??
                    section.academicYearName}
                </Text>
              </View>


              {section.isClassTeacher ? (
                <Chip
                  compact
                  icon="account-star"
                  style={
                    styles.classTeacherChip
                  }
                  textStyle={
                    styles.classTeacherChipText
                  }
                >
                  Class Teacher
                </Chip>
              ) : null}

            </View>

          </Card.Content>
        </Card>


        {/* ====================================================
            STATS
        ==================================================== */}

        <View
          style={
            styles.statsGrid
          }
        >

          <StatCard
            icon="account-group"
            value={
              section.totalStudents
            }
            label="Students"
            styles={styles}
          />

          <StatCard
            icon="book-open-variant"
            value={
              subjects.length
            }
            label="Subjects"
            styles={styles}
          />

          <StatCard
            icon={
              section.isClassTeacher
                ? "account-star"
                : "account-check"
            }
            value={
              section.isClassTeacher
                ? "Yes"
                : "No"
            }
            label="Class Teacher"
            styles={styles}
          />

        </View>


        {/* ====================================================
            QUICK ACTIONS
        ==================================================== */}

        <Text
          style={
            styles.sectionLabel
          }
        >
          QUICK ACTIONS
        </Text>

        <View
          style={
            styles.actionGrid
          }
        >

          <ActionCard
            icon="account-group"
            title="Students"
            subtitle={
              `${section.totalStudents} students`
            }
            onPress={
              openStudents
            }
            styles={styles}
          />


          <ActionCard
            icon="calendar-check"
            title="Attendance"
            subtitle="Mark & view attendance"
            onPress={
              openAttendance
            }
            styles={styles}
          />


          <ActionCard
            icon="book-open-variant"
            title="Subjects"
            subtitle={
              `${subjects.length} assigned`
            }
            onPress={
              openSubjects
            }
            styles={styles}
          />


          <ActionCard
            icon="calendar-clock"
            title="Timetable"
            subtitle="View class timetable"
            onPress={
              openTimetable
            }
            styles={styles}
          />

        </View>


        {/* ====================================================
            SUBJECTS
        ==================================================== */}

        <Text
          style={
            styles.sectionLabel
          }
        >
          YOUR SUBJECTS
        </Text>

        <Card
          style={
            styles.card
          }
        >
          <Card.Content>

            {subjects.length === 0 ? (

              <View
                style={
                  styles.noData
                }
              >
                <Avatar.Icon
                  size={44}
                  icon="book-off-outline"
                  color="#9CA3AF"
                  style={
                    styles.noDataIcon
                  }
                />

                <Text
                  style={
                    styles.noDataTitle
                  }
                >
                  No subjects assigned
                </Text>

                <Text
                  style={
                    styles.noDataText
                  }
                >
                  No teaching subjects are
                  currently assigned to this
                  section.
                </Text>
              </View>

            ) : (

              <View
                style={
                  styles.subjectList
                }
              >
                {subjects.map(
                  (
                    subject,
                    index
                  ) => (

                    <View
                      key={
                        subject.id
                      }
                    >

                      {index > 0 ? (
                        <Divider
                          style={
                            styles.subjectDivider
                          }
                        />
                      ) : null}

                      <View
                        style={
                          styles.subjectRow
                        }
                      >

                        <Avatar.Icon
                          size={42}
                          icon="book-open-page-variant"
                          color={
                            Colors.brandPrimary
                          }
                          style={
                            styles.subjectIcon
                          }
                        />

                        <View
                          style={
                            styles.subjectInfo
                          }
                        >
                          <Text
                            style={
                              styles.subjectName
                            }
                            numberOfLines={1}
                          >
                            {subject.name}
                          </Text>

                          {subject.code ? (
                            <Text
                              style={
                                styles.subjectCode
                              }
                            >
                              {subject.code}
                            </Text>
                          ) : null}
                        </View>

                        {subject.isOptional ? (
                          <Chip
                            compact
                            style={
                              styles.optionalChip
                            }
                            textStyle={
                              styles.optionalText
                            }
                          >
                            Optional
                          </Chip>
                        ) : null}

                      </View>

                    </View>

                  )
                )}
              </View>

            )}

          </Card.Content>
        </Card>


        {/* ====================================================
            SECTION INFORMATION
        ==================================================== */}

        <Text
          style={
            styles.sectionLabel
          }
        >
          SECTION INFORMATION
        </Text>

        <Card
          style={
            styles.card
          }
        >
          <Card.Content>

            <InfoRow
              icon="google-classroom"
              label="Class"
              value={
                `${section.classNumber} • ${section.classDisplayName}`
              }
              styles={styles}
            />

            <Divider
              style={
                styles.infoDivider
              }
            />

            <InfoRow
              icon="view-grid-outline"
              label="Section"
              value={
                section.sectionName
              }
              styles={styles}
            />

            <Divider
              style={
                styles.infoDivider
              }
            />

            <InfoRow
              icon="account-group"
              label="Students"
              value={
                String(
                  section.totalStudents
                )
              }
              styles={styles}
            />

            <Divider
              style={
                styles.infoDivider
              }
            />

            <InfoRow
              icon="calendar-school"
              label="Academic Year"
              value={
                academicYear?.name ??
                section.academicYearName
              }
              styles={styles}
            />

            <Divider
              style={
                styles.infoDivider
              }
            />

            <InfoRow
              icon="account-star"
              label="Class Teacher"
              value={
                section.isClassTeacher
                  ? "You"
                  : "Not assigned as class teacher"
              }
              styles={styles}
            />

          </Card.Content>
        </Card>

      </ScrollView>
    </View>
  );
};


/* ============================================================
   STAT CARD
============================================================ */

const StatCard = ({
  icon,
  value,
  label,
  styles,
}: {
  icon: string;
  value: number | string;
  label: string;
  styles: any;
}) => {
  return (
    <Card
      style={
        styles.statCard
      }
    >
      <Card.Content>

        <Avatar.Icon
          size={38}
          icon={icon}
          color={
            Colors.brandPrimary
          }
          style={
            styles.statIcon
          }
        />

        <Text
          style={
            styles.statValue
          }
        >
          {value}
        </Text>

        <Text
          style={
            styles.statLabel
          }
        >
          {label}
        </Text>

      </Card.Content>
    </Card>
  );
};


/* ============================================================
   ACTION CARD
============================================================ */

const ActionCard = ({
  icon,
  title,
  subtitle,
  onPress,
  styles,
}: {
  icon: string;
  title: string;
  subtitle: string;
  onPress: () => void;
  styles: any;
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.82}
      onPress={
        onPress
      }
      style={
        styles.actionTouchable
      }
    >
      <Card
        style={
          styles.actionCard
        }
      >
        <Card.Content>

          <View
            style={
              styles.actionTop
            }
          >

            <Avatar.Icon
              size={42}
              icon={icon}
              color={
                Colors.brandPrimary
              }
              style={
                styles.actionIcon
              }
            />

            <Text
              style={
                styles.actionArrow
              }
            >
              →
            </Text>

          </View>

          <Text
            style={
              styles.actionTitle
            }
          >
            {title}
          </Text>

          <Text
            style={
              styles.actionSubtitle
            }
            numberOfLines={2}
          >
            {subtitle}
          </Text>

        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
};


/* ============================================================
   INFO ROW
============================================================ */

const InfoRow = ({
  icon,
  label,
  value,
  styles,
}: {
  icon: string;
  label: string;
  value: string;
  styles: any;
}) => {
  return (
    <View
      style={
        styles.infoRow
      }
    >

      <Avatar.Icon
        size={38}
        icon={icon}
        color={
          Colors.brandPrimary
        }
        style={
          styles.infoIcon
        }
      />

      <View
        style={
          styles.infoText
        }
      >

        <Text
          style={
            styles.infoLabel
          }
        >
          {label}
        </Text>

        <Text
          style={
            styles.infoValue
          }
          numberOfLines={2}
        >
          {value}
        </Text>

      </View>

    </View>
  );
};


/* ============================================================
   STYLES
============================================================ */

const useStyles = makeStyles(
  () => ({

    page: {
      flex: 1,
      backgroundColor:
        "#F7F8FC",
    },

    content: {
      paddingHorizontal:
        Metrics.x4,
      paddingTop:
        Metrics.x3,
      paddingBottom:
        Metrics.x8,
    },

    contentDesktop: {
      maxWidth: 1100,
      width: "100%",
      alignSelf: "center",
    },

    /* ========================================================
       BACK
    ======================================================== */

    backButton: {
      flexDirection:
        "row",
      alignItems:
        "center",
      marginBottom:
        Metrics.x3,
    },

    backArrow: {
      fontSize: 24,
      color:
        Colors.brandPrimary,
      marginRight:
        Metrics.x1,
    },

    backText: {
      fontSize: 13,
      fontWeight: "700",
      color:
        Colors.brandPrimary,
    },

    /* ========================================================
       HERO
    ======================================================== */

    heroCard: {
      borderRadius: 20,
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#E9EAF0",
      elevation: 2,
    },

    heroTop: {
      flexDirection:
        "row",
      alignItems:
        "center",
    },

    heroIconContainer: {
      width: 70,
      height: 70,
      borderRadius: 20,
      alignItems:
        "center",
      justifyContent:
        "center",
      backgroundColor:
        "#EEF2FF",
    },

    heroIcon: {
      backgroundColor:
        "transparent",
    },

    heroText: {
      flex: 1,
      marginLeft:
        Metrics.x3,
    },

    eyebrow: {
      fontSize: 10,
      fontWeight: "800",
      letterSpacing: 1,
      color:
        Colors.brandPrimary,
      marginBottom:
        Metrics.x1,
    },

    heroTitle: {
      fontSize: 23,
      fontWeight: "800",
      color:
        "#171717",
    },

    heroSubtitle: {
      fontSize: 14,
      color:
        Colors.subtext,
      marginTop:
        3,
    },

    heroDivider: {
      marginVertical:
        Metrics.x3,
    },

    heroBottom: {
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-between",
      gap: 10,
    },

    yearInfo: {
      flex: 1,
    },

    smallLabel: {
      fontSize: 9,
      fontWeight: "800",
      letterSpacing: 0.8,
      color:
        Colors.subtext,
    },

    yearText: {
      fontSize: 14,
      fontWeight: "700",
      color:
        "#171717",
      marginTop: 3,
    },

    classTeacherChip: {
      backgroundColor:
        "#EAF8F0",
    },

    classTeacherChipText: {
      color:
        "#287A4B",
      fontSize: 11,
      fontWeight: "700",
    },

    /* ========================================================
       STATS
    ======================================================== */

    statsGrid: {
      flexDirection:
        "row",
      flexWrap:
        "wrap",
      marginHorizontal:
        -Metrics.x1,
      marginTop:
        Metrics.x3,
    },

    statCard: {
      flex: 1,
      minWidth: 150,
      marginHorizontal:
        Metrics.x1,
      marginBottom:
        Metrics.x2,
      borderRadius: 16,
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#E9EAF0",
      elevation: 1,
    },

    statIcon: {
      backgroundColor:
        "#EEF2FF",
    },

    statValue: {
      fontSize: 23,
      fontWeight: "800",
      color:
        "#171717",
      marginTop:
        Metrics.x2,
    },

    statLabel: {
      fontSize: 11,
      color:
        Colors.subtext,
      marginTop: 2,
    },

    /* ========================================================
       SECTION LABEL
    ======================================================== */

    sectionLabel: {
      fontSize: 10,
      fontWeight: "800",
      letterSpacing: 0.9,
      color:
        Colors.subtext,
      marginTop:
        Metrics.x4,
      marginBottom:
        Metrics.x2,
    },

    /* ========================================================
       ACTIONS
    ======================================================== */

    actionGrid: {
      flexDirection:
        "row",
      flexWrap:
        "wrap",
      marginHorizontal:
        -Metrics.x1,
    },

    actionTouchable: {
      width: "50%",
      paddingHorizontal:
        Metrics.x1,
      marginBottom:
        Metrics.x2,
    },

    actionCard: {
      borderRadius: 16,
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#E9EAF0",
      elevation: 1,
    },

    actionTop: {
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-between",
    },

    actionIcon: {
      backgroundColor:
        "#EEF2FF",
    },

    actionArrow: {
      fontSize: 20,
      color:
        "#9CA3AF",
    },

    actionTitle: {
      fontSize: 15,
      fontWeight: "800",
      color:
        "#171717",
      marginTop:
        Metrics.x2,
    },

    actionSubtitle: {
      fontSize: 11,
      color:
        Colors.subtext,
      marginTop: 3,
    },

    /* ========================================================
       CARD
    ======================================================== */

    card: {
      borderRadius: 16,
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#E9EAF0",
      elevation: 1,
    },

    /* ========================================================
       SUBJECTS
    ======================================================== */

    subjectList: {
      width: "100%",
    },

    subjectRow: {
      flexDirection:
        "row",
      alignItems:
        "center",
      minHeight: 58,
    },

    subjectIcon: {
      backgroundColor:
        "#EEF2FF",
    },

    subjectInfo: {
      flex: 1,
      marginLeft:
        Metrics.x2,
    },

    subjectName: {
      fontSize: 14,
      fontWeight: "700",
      color:
        "#171717",
    },

    subjectCode: {
      fontSize: 11,
      color:
        Colors.subtext,
      marginTop: 2,
    },

    subjectDivider: {
      marginVertical:
        Metrics.x2,
    },

    optionalChip: {
      backgroundColor:
        "#FFF7E8",
    },

    optionalText: {
      fontSize: 9,
      color:
        "#8A5A00",
      fontWeight: "700",
    },

    /* ========================================================
       NO DATA
    ======================================================== */

    noData: {
      alignItems:
        "center",
      paddingVertical:
        Metrics.x5,
    },

    noDataIcon: {
      backgroundColor:
        "#F3F4F6",
    },

    noDataTitle: {
      fontSize: 15,
      fontWeight: "800",
      color:
        "#171717",
      marginTop:
        Metrics.x2,
    },

    noDataText: {
      fontSize: 12,
      color:
        Colors.subtext,
      textAlign:
        "center",
      marginTop:
        Metrics.x1,
      maxWidth: 420,
    },

    /* ========================================================
       INFO
    ======================================================== */

    infoRow: {
      flexDirection:
        "row",
      alignItems:
        "center",
      minHeight: 55,
    },

    infoIcon: {
      backgroundColor:
        "#EEF2FF",
    },

    infoText: {
      flex: 1,
      marginLeft:
        Metrics.x2,
    },

    infoLabel: {
      fontSize: 10,
      fontWeight: "700",
      color:
        Colors.subtext,
    },

    infoValue: {
      fontSize: 13,
      fontWeight: "700",
      color:
        "#171717",
      marginTop: 3,
    },

    infoDivider: {
      marginVertical:
        Metrics.x1,
    },

    /* ========================================================
       CENTER
    ======================================================== */

    center: {
      flex: 1,
      alignItems:
        "center",
      justifyContent:
        "center",
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

    /* ========================================================
       ERROR
    ======================================================== */

    errorIcon: {
      backgroundColor:
        "#FFF0F0",
    },

    errorTitle: {
      marginTop:
        Metrics.x3,
      fontSize: 18,
      fontWeight: "800",
      color:
        "#171717",
    },

    errorText: {
      marginTop:
        Metrics.x1,
      fontSize: 13,
      color:
        Colors.subtext,
      textAlign:
        "center",
      maxWidth: 430,
    },

    retryButton: {
      marginTop:
        Metrics.x4,
      paddingHorizontal:
        Metrics.x5,
      paddingVertical:
        Metrics.x2,
      borderRadius: 12,
      backgroundColor:
        Colors.brandPrimary,
    },

    retryText: {
      color:
        "#FFFFFF",
      fontSize: 13,
      fontWeight: "800",
    },

  })
);


/* ============================================================
   EXPORT
============================================================ */

export {
  TeacherSectionDetailsScreen,
};