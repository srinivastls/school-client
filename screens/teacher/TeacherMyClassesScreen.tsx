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
  TextInput,
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

type TeacherClass = {
  id: string;
  classNumber: string;
  displayName: string;

  sections: TeacherSection[];

  subjects: TeacherSubject[];

  totalStudents: number;
};


/* ============================================================
   COMPONENT
============================================================ */

const TeacherMyClassesScreen = () => {

  const styles = useStyles();

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
    classes,
    setClasses,
  ] = useState<TeacherClass[]>([]);

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
    summary,
    setSummary,
  ] = useState({
    totalClasses: 0,
    totalSections: 0,
    totalStudents: 0,
    totalSubjects: 0,
  });

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
    search,
    setSearch,
  ] = useState("");


  /* ==========================================================
     LOAD
  ========================================================== */

  const loadClasses = useCallback(
    async (
      showLoader = true
    ) => {

      try {

        if (showLoader) {
          setLoading(true);
        }

        setError(null);

        /*
         * Backend currently returns:
         *
         * {
         *   academicYear,
         *   summary,
         *   sections
         * }
         */

        const response =
          await teacherServices
            .getMyClasses();


        /* ----------------------------------------------------
           ACADEMIC YEAR
        ---------------------------------------------------- */

        setAcademicYear(
          response.academicYear ??
            null
        );


        /* ----------------------------------------------------
           SECTIONS
        ---------------------------------------------------- */

        const sections =
          response.sections ?? [];


        /* ----------------------------------------------------
           GROUP SECTIONS BY CLASS
        ---------------------------------------------------- */

        const classMap =
          new Map<
            string,
            TeacherClass
          >();


        sections.forEach(
          (section: TeacherSection) => {

            let classItem =
              classMap.get(
                section.classId
              );


            if (!classItem) {

              classItem = {
                id:
                  section.classId,

                classNumber:
                  section.classNumber,

                displayName:
                  section.classDisplayName,

                sections: [],

                subjects: [],

                totalStudents: 0,
              };

              classMap.set(
                section.classId,
                classItem
              );
            }


            /* ----------------------------------------------
               ADD SECTION
            ---------------------------------------------- */

            classItem.sections.push(
              section
            );


            /* ----------------------------------------------
               STUDENTS
            ---------------------------------------------- */

            classItem.totalStudents +=
              section.totalStudents;


            /* ----------------------------------------------
               ADD UNIQUE SUBJECTS
            ---------------------------------------------- */

            section.subjects.forEach(
              (subject) => {

                const exists =
                  classItem!.subjects.some(
                    (item) =>
                      item.id ===
                      subject.id
                  );

                if (!exists) {

                  classItem!.subjects.push(
                    subject
                  );

                }

              }
            );

          }
        );


        /* ----------------------------------------------------
           SORT CLASSES
        ---------------------------------------------------- */

        const groupedClasses =
          Array.from(
            classMap.values()
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


        /* ----------------------------------------------------
           SORT SECTIONS + SUBJECTS
        ---------------------------------------------------- */

        groupedClasses.forEach(
          (classItem) => {

            classItem.sections.sort(
              (a, b) =>
                a.sectionName.localeCompare(
                  b.sectionName
                )
            );

            classItem.subjects.sort(
              (a, b) =>
                a.name.localeCompare(
                  b.name
                )
            );

          }
        );


        setClasses(
          groupedClasses
        );


        /* ----------------------------------------------------
           SUMMARY
           
           Calculate from actual returned data.
        ---------------------------------------------------- */

        const totalSections =
          sections.length;

        const totalStudents =
          sections.reduce(
            (
              total,
              section
            ) =>
              total +
              section.totalStudents,
            0
          );

        const totalSubjects =
          new Set(
            sections.flatMap(
              (section) =>
                section.subjects.map(
                  (subject) =>
                    subject.id
                )
            )
          ).size;


        setSummary({
          totalClasses:
            groupedClasses.length,

          totalSections,

          totalStudents,

          totalSubjects,
        });

      } catch (err: any) {

        console.error(
          "GET TEACHER CLASSES ERROR:",
          err
        );

        setError(
          err?.response?.data?.message ??
            "Unable to load your classes."
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

    loadClasses();

  }, [
    loadClasses,
  ]);


  /* ==========================================================
     REFRESH
  ========================================================== */

  const handleRefresh =
    () => {

      setRefreshing(true);

      loadClasses(false);
    };


  /* ==========================================================
     FILTER
  ========================================================== */

  const filteredClasses =
    useMemo(() => {

      const query =
        search
          .trim()
          .toLowerCase();


      if (!query) {
        return classes;
      }


      return classes.filter(
        (item) => {

          const classText =
            `${item.classNumber} ${item.displayName}`
              .toLowerCase();


          const sectionText =
            item.sections
              .map(
                (section) =>
                  section.sectionName
              )
              .join(" ")
              .toLowerCase();


          const subjectText =
            item.subjects
              .map(
                (subject) =>
                  `${subject.name} ${
                    subject.code ?? ""
                  }`
              )
              .join(" ")
              .toLowerCase();


          return (
            classText.includes(
              query
            ) ||
            sectionText.includes(
              query
            ) ||
            subjectText.includes(
              query
            )
          );

        }
      );

    }, [
      classes,
      search,
    ]);


  /* ==========================================================
     OPEN CLASS
  ========================================================== */

  const openClass = (item: TeacherClass) => {
    /*
     * TeacherSectionDetails is a SECTION-level screen, so it always
     * needs a real sectionId. A class can contain multiple sections;
     * when the class card itself is pressed, open the first section.
     * Individual section chips below still open their own section.
     */
    const section = item.sections[0];

    if (!section) {
      return;
    }

    navigation.navigate(
      RootStackScreenNames.TeacherSectionDetails,
      {
        sectionId: section.sectionId,
        classId: section.classId,
        classNumber: section.classNumber,
        sectionName: section.sectionName,
      } as any
    );
  };


  /* ==========================================================
     HEADER
  ========================================================== */

  const renderHeader = () => {

    return (
      <View>

        {/* ==================================================
            TITLE
        ================================================== */}

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
            My Classes
          </Text>


          <Text
            style={
              styles.subtitle
            }
          >
            View the classes, sections and
            subjects assigned to you.
          </Text>

        </View>


        {/* ==================================================
            ACADEMIC YEAR
        ================================================== */}

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
                size={44}
                icon="school"
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
                  {academicYear?.name ??
                    "Loading..."}
                </Text>

              </View>

            </View>

          </Card.Content>

        </Card>


        {/* ==================================================
            SUMMARY
        ================================================== */}

        <View
          style={
            styles.summaryGrid
          }
        >

          <SummaryCard
            icon="google-classroom"
            title="Classes"
            value={
              summary.totalClasses
            }
            styles={styles}
          />


          <SummaryCard
            icon="view-grid-outline"
            title="Sections"
            value={
              summary.totalSections
            }
            styles={styles}
          />


          <SummaryCard
            icon="account-group"
            title="Students"
            value={
              summary.totalStudents
            }
            styles={styles}
          />


          <SummaryCard
            icon="book-open-variant"
            title="Subjects"
            value={
              summary.totalSubjects
            }
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

          <Avatar.Icon
            size={34}
            icon="magnify"
            color="#6B7280"
            style={
              styles.searchIcon
            }
          />


          <TextInput
            value={search}
            onChangeText={
              setSearch
            }
            placeholder={
              "Search classes, sections or subjects"
            }
            placeholderTextColor="#9CA3AF"
            style={
              styles.searchInput
            }
            returnKeyType="search"
            clearButtonMode="while-editing"
          />

        </View>

      </View>
    );
  };


  /* ==========================================================
     CLASS CARD
  ========================================================== */

  const renderClass = ({
    item,
  }: {
    item: TeacherClass;
  }) => {

    const classTeacherSections =
      item.sections.filter(
        (section) =>
          section.isClassTeacher
      );


    return (
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={() => {
          if (item.sections.length > 0) {
            openClass(item);
          }
        }}
        style={
          styles.classTouchable
        }
      >

        <Card
          style={[
            styles.classCard,

            isDesktop &&
              styles.classCardDesktop,
          ]}
        >

          <Card.Content>

            {/* =================================================
                TOP
            ================================================= */}

            <View
              style={
                styles.classTop
              }
            >

              <View
                style={
                  styles.classIconContainer
                }
              >

                <Avatar.Icon
                  size={50}
                  icon="google-classroom"
                  color={
                    Colors.brandPrimary
                  }
                  style={
                    styles.classIcon
                  }
                />

              </View>


              <View
                style={
                  styles.classTitleContainer
                }
              >

                <Text
                  style={
                    styles.classNumber
                  }
                >
                  Class{" "}
                  {item.classNumber}
                </Text>


                <Text
                  style={
                    styles.className
                  }
                  numberOfLines={1}
                >
                  {item.displayName}
                </Text>

              </View>


              <Text
                style={
                  styles.arrow
                }
              >
                →
              </Text>

            </View>


            <Divider
              style={
                styles.divider
              }
            />


            {/* =================================================
                SECTION HEADER
            ================================================= */}

            <View
              style={
                styles.sectionHeader
              }
            >

              <Text
                style={
                  styles.label
                }
              >
                SECTIONS
              </Text>


              {classTeacherSections.length >
              0 ? (
                <View
                  style={
                    styles.classTeacherBadge
                  }
                >
                  <Text
                    style={
                      styles.classTeacherBadgeText
                    }
                  >
                    👑 Class Teacher
                  </Text>
                </View>
              ) : null}

            </View>


            {/* =================================================
                SECTIONS
            ================================================= */}

            <View
              style={
                styles.sectionRow
              }
            >

              {item.sections.length ===
              0 ? (

                <Text
                  style={
                    styles.noData
                  }
                >
                  No sections assigned
                </Text>

              ) : (

                item.sections.map(
                  (section) => (

                    <TouchableOpacity
                      key={
                        section.sectionId
                      }
                      activeOpacity={0.75}
                      onPress={() => {
  navigation.navigate(
    RootStackScreenNames.TeacherSectionDetails,
    {
      sectionId: section.sectionId,
      classId: section.classId,
      classNumber: section.classNumber,
      sectionName: section.sectionName,
    }
  );
}}
                    >

                      <Chip
                        compact
                        style={[
                          styles.sectionChip,

                          section.isClassTeacher &&
                            styles.classTeacherChip,
                        ]}
                        textStyle={
                          styles.sectionChipText
                        }
                      >

                        {section.sectionName}
                        {" "}
                        ({section.totalStudents})

                      </Chip>

                    </TouchableOpacity>

                  )
                )

              )}

            </View>


            {/* =================================================
                SUBJECTS
            ================================================= */}

            <Text
              style={[
                styles.label,
                styles.subjectLabel,
              ]}
            >
              SUBJECTS
            </Text>


            <View
              style={
                styles.subjectRow
              }
            >

              {item.subjects.length ===
              0 ? (

                <Text
                  style={
                    styles.noData
                  }
                >
                  No subjects assigned
                </Text>

              ) : (

                item.subjects.map(
                  (subject) => (

                    <View
                      key={
                        subject.id
                      }
                      style={
                        styles.subjectItem
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

                  )
                )

              )}

            </View>


            {/* =================================================
                FOOTER
            ================================================= */}

            <View
              style={
                styles.cardFooter
              }
            >

              <Text
                style={
                  styles.studentCount
                }
              >
                👥{" "}
                {item.totalStudents}{" "}
                students
              </Text>


              <Text
                style={
                  styles.viewDetails
                }
              >
                View section details →
              </Text>

            </View>

          </Card.Content>

        </Card>

      </TouchableOpacity>
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
          Loading your classes...
        </Text>

      </View>
    );
  }


  /* ==========================================================
     ERROR
  ========================================================== */

  if (
    error &&
    classes.length === 0
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
          Unable to load classes
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
            loadClasses()
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
          filteredClasses
        }

        keyExtractor={
          (item) =>
            item.id
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
              size={62}
              icon="google-classroom"
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
              No classes found
            </Text>


            <Text
              style={
                styles.emptyText
              }
            >
              {search
                ? "No classes match your search."
                : "No classes have been assigned to you yet."}
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
  () => ({

    page: {
      flex: 1,
      backgroundColor:
        "#F7F8FC",
    },

    listContent: {
      paddingHorizontal:
        Metrics.x4,
      paddingTop:
        Metrics.x4,
      paddingBottom:
        Metrics.x8,
    },


    /* ========================================================
       HEADER
    ======================================================== */

    heading: {
      marginBottom:
        Metrics.x4,
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

    title: {
      fontSize: 30,
      fontWeight: "800",
      color: "#171717",
    },

    subtitle: {
      marginTop:
        Metrics.x1,
      fontSize: 14,
      lineHeight: 21,
      color:
        Colors.subtext,
      maxWidth: 700,
    },


    /* ========================================================
       YEAR
    ======================================================== */

    yearCard: {
      borderRadius: 16,
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#E9EAF0",
      marginBottom:
        Metrics.x3,
      elevation: 1,
    },

    yearRow: {
      flexDirection:
        "row",
      alignItems:
        "center",
    },

    yearIcon: {
      backgroundColor:
        "#EEF2FF",
    },

    yearText: {
      marginLeft:
        Metrics.x2,
    },

    yearLabel: {
      fontSize: 10,
      fontWeight: "800",
      letterSpacing: 1,
      color:
        Colors.subtext,
    },

    yearName: {
      fontSize: 17,
      fontWeight: "800",
      color: "#171717",
      marginTop: 2,
    },


    /* ========================================================
       SUMMARY
    ======================================================== */

    summaryGrid: {
      flexDirection:
        "row",
      flexWrap:
        "wrap",
      marginHorizontal:
        -Metrics.x1,
      marginBottom:
        Metrics.x4,
    },

    summaryCard: {
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

    summaryIcon: {
      backgroundColor:
        "#EEF2FF",
    },

    summaryValue: {
      fontSize: 23,
      fontWeight: "800",
      color: "#171717",
      marginTop:
        Metrics.x2,
    },

    summaryTitle: {
      fontSize: 12,
      color:
        Colors.subtext,
      marginTop: 2,
    },


    /* ========================================================
       SEARCH
    ======================================================== */

    searchContainer: {
      height: 52,
      borderRadius: 14,
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#E5E7EB",
      flexDirection:
        "row",
      alignItems:
        "center",
      paddingHorizontal:
        Metrics.x2,
      marginBottom:
        Metrics.x4,
    },

    searchIcon: {
      backgroundColor:
        "#F3F4F6",
    },

    searchInput: {
      flex: 1,
      marginLeft:
        Metrics.x2,
      fontSize: 13,
      color: "#171717",
      paddingVertical: 0,
    },


    /* ========================================================
       CLASS CARD
    ======================================================== */

    classTouchable: {
      marginBottom:
        Metrics.x3,
    },

    classCard: {
      borderRadius: 18,
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#E9EAF0",
      elevation: 1,
    },

    classCardDesktop: {
      maxWidth: 900,
    },

    classTop: {
      flexDirection:
        "row",
      alignItems:
        "center",
    },

    classIconContainer: {
      width: 54,
      height: 54,
      borderRadius: 16,
      alignItems:
        "center",
      justifyContent:
        "center",
      backgroundColor:
        "#EEF2FF",
    },

    classIcon: {
      backgroundColor:
        "transparent",
    },

    classTitleContainer: {
      flex: 1,
      marginLeft:
        Metrics.x2,
    },

    classNumber: {
      fontSize: 12,
      fontWeight: "700",
      color:
        Colors.brandPrimary,
    },

    className: {
      fontSize: 18,
      fontWeight: "800",
      color: "#171717",
      marginTop: 2,
    },

    arrow: {
      fontSize: 22,
      color: "#9CA3AF",
      marginLeft:
        Metrics.x2,
    },

    divider: {
      marginVertical:
        Metrics.x3,
    },


    /* ========================================================
       SECTION HEADER
    ======================================================== */

    sectionHeader: {
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-between",
      marginBottom:
        Metrics.x2,
    },

    label: {
      fontSize: 10,
      fontWeight: "800",
      letterSpacing: 0.8,
      color:
        Colors.subtext,
    },

    classTeacherBadge: {
      paddingHorizontal: 9,
      paddingVertical: 5,
      borderRadius: 8,
      backgroundColor:
        "#EAF8F0",
    },

    classTeacherBadgeText: {
      fontSize: 10,
      fontWeight: "700",
      color: "#287A4B",
    },


    /* ========================================================
       SECTIONS
    ======================================================== */

    sectionRow: {
      flexDirection:
        "row",
      flexWrap:
        "wrap",
      gap: 8,
    },

    sectionChip: {
      backgroundColor:
        "#F3F4F6",
    },

    classTeacherChip: {
      backgroundColor:
        "#EAF8F0",
    },

    sectionChipText: {
      fontSize: 11,
      color: "#374151",
    },


    /* ========================================================
       SUBJECTS
    ======================================================== */

    subjectLabel: {
      marginTop:
        Metrics.x4,
      marginBottom:
        Metrics.x2,
    },

    subjectRow: {
      flexDirection:
        "row",
      flexWrap:
        "wrap",
      gap: 8,
    },

    subjectItem: {
      paddingHorizontal:
        Metrics.x2,
      paddingVertical:
        Metrics.x1,
      borderRadius: 10,
      backgroundColor:
        "#F8F5FF",
      borderWidth: 1,
      borderColor:
        "#E8E0FF",
    },

    subjectName: {
      fontSize: 12,
      fontWeight: "700",
      color: "#4B3B7A",
    },

    subjectCode: {
      fontSize: 10,
      color:
        Colors.subtext,
      marginTop: 1,
    },

    noData: {
      fontSize: 12,
      color:
        Colors.subtext,
    },


    /* ========================================================
       FOOTER
    ======================================================== */

    cardFooter: {
      marginTop:
        Metrics.x4,
      paddingTop:
        Metrics.x3,
      borderTopWidth: 1,
      borderTopColor:
        "#F0F1F4",
      flexDirection:
        "row",
      justifyContent:
        "space-between",
      alignItems:
        "center",
    },

    studentCount: {
      fontSize: 12,
      color:
        Colors.subtext,
      fontWeight: "600",
    },

    viewDetails: {
      fontSize: 12,
      color:
        Colors.brandPrimary,
      fontWeight: "800",
    },


    /* ========================================================
       EMPTY
    ======================================================== */

    empty: {
      alignItems:
        "center",
      justifyContent:
        "center",
      paddingVertical:
        Metrics.x8,
    },

    emptyIcon: {
      backgroundColor:
        "#F3F4F6",
    },

    emptyTitle: {
      fontSize: 18,
      fontWeight: "800",
      color: "#171717",
      marginTop:
        Metrics.x3,
    },

    emptyText: {
      fontSize: 13,
      color:
        Colors.subtext,
      textAlign:
        "center",
      marginTop:
        Metrics.x1,
      maxWidth: 400,
    },


    /* ========================================================
       LOADING
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
      color: "#171717",
    },

    errorText: {
      marginTop:
        Metrics.x1,
      fontSize: 13,
      color:
        Colors.subtext,
      textAlign:
        "center",
      maxWidth: 400,
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
      color: "#FFFFFF",
      fontSize: 13,
      fontWeight: "800",
    },

  })
);


export {
  TeacherMyClassesScreen,
};