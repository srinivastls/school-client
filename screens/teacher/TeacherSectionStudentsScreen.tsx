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
  useRoute,
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
  teacherServices,
  TeacherSectionStudent,
    TeacherSectionStudentsResponse,
} from "../../services/teacherServices";


type RouteParams = {
  sectionId: string;
  classId: string;
  classNumber?: string;
  sectionName?: string;
};


const TeacherSectionStudentsScreen =
  () => {

    const styles = useStyles();

    const navigation =
      useNavigation<
        NativeStackNavigationProp<
          RootStackParamList
        >
      >();

    const route =
      useRoute<any>();

    const {
      sectionId,
      classId,
      classNumber,
      sectionName,
    } =
      route.params as RouteParams;

    const { width } =
      useWindowDimensions();

    const isDesktop =
      width >= 1024;


    /* ========================================================
       STATE
    ======================================================== */

    const [
      students,
      setStudents,
    ] =
      useState<
        TeacherSectionStudent[]
      >([]);

    const [
      section,
      setSection,
    ] =
      useState<
        TeacherSectionStudentsResponse["section"]
        | null
      >(null);

    const [
      academicYear,
      setAcademicYear,
    ] =
      useState<
        TeacherSectionStudentsResponse["academicYear"]
        | null
      >(null);

    const [
      loading,
      setLoading,
    ] =
      useState(true);

    const [
      refreshing,
      setRefreshing,
    ] =
      useState(false);

    const [
      error,
      setError,
    ] =
      useState<string | null>(null);

    const [
      search,
      setSearch,
    ] =
      useState("");


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
                .getSectionStudents(
                  sectionId
                );

            setStudents(
              response.students ?? []
            );

            setSection(
              response.section ?? null
            );

            setAcademicYear(
              response.academicYear ??
                null
            );

          } catch (err: any) {

            console.error(
              "GET SECTION STUDENTS ERROR:",
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
        [sectionId]
      );


    /* ========================================================
       INITIAL LOAD
    ======================================================== */

    useEffect(() => {
      loadStudents();
    }, [loadStudents]);


    /* ========================================================
       REFRESH
    ======================================================== */

    const handleRefresh =
      () => {

        setRefreshing(true);

        loadStudents(false);

      };


    /* ========================================================
       SEARCH
    ======================================================== */

    const filteredStudents =
      useMemo(() => {

        const query =
          search
            .trim()
            .toLowerCase();

        if (!query) {
          return students;
        }

        return students.filter(
          (student) => {

            return (
              student.name
                ?.toLowerCase()
                .includes(query) ||

              student.admissionNo
                ?.toLowerCase()
                .includes(query) ||

              student.rollNumber
                ?.toLowerCase()
                .includes(query) ||

              student.fatherName
                ?.toLowerCase()
                .includes(query)
            );

          }
        );

      }, [
        students,
        search,
      ]);


    /* ========================================================
       STUDENT CARD
    ======================================================== */

    const renderStudent =
      ({
        item,
        index,
      }: {
        item: TeacherSectionStudent;
        index: number;
      }) => {

        const initials =
          item.name
            ?.trim()
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map(
              (part) =>
                part[0]
                  ?.toUpperCase()
            )
            .join("") || "?";


        return (
          <Card
            style={[
              styles.studentCard,
              isDesktop &&
                styles.studentCardDesktop,
            ]}
          >

            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => {
                /*
                 * Student Details will be
                 * connected in the next step.
                 */
              }}
            >

              <View
                style={
                  styles.studentRow
                }
              >

                {/* ------------------------------------------
                    ROLL NUMBER
                ------------------------------------------ */}

                <View
                  style={
                    styles.rollContainer
                  }
                >
                  <Text
                    style={
                      styles.rollText
                    }
                  >
                    {item.rollNumber ??
                      String(index + 1)}
                  </Text>
                </View>


                {/* ------------------------------------------
                    PHOTO
                ------------------------------------------ */}

                {item.photoUrl ? (

                  <Avatar.Image
                    size={46}
                    source={{
                      uri:
                        item.photoUrl,
                    }}
                  />

                ) : (

                  <Avatar.Text
                    size={46}
                    label={initials}
                    style={
                      styles.avatar
                    }
                  />

                )}


                {/* ------------------------------------------
                    STUDENT DETAILS
                ------------------------------------------ */}

                <View
                  style={
                    styles.studentInfo
                  }
                >

                  <Text
                    style={
                      styles.studentName
                    }
                    numberOfLines={1}
                  >
                    {item.name}
                  </Text>

                  <Text
                    style={
                      styles.admissionText
                    }
                  >
                    Admission No:{" "}
                    {item.admissionNo}
                  </Text>

                  {!!item.fatherName && (

                    <Text
                      style={
                        styles.parentText
                      }
                      numberOfLines={1}
                    >
                      Father:{" "}
                      {item.fatherName}
                    </Text>

                  )}

                </View>


                {/* ------------------------------------------
                    GENDER
                ------------------------------------------ */}

                {item.gender && (

                  <Chip
                    compact
                    style={
                      styles.genderChip
                    }
                    textStyle={
                      styles.genderText
                    }
                  >
                    {item.gender}
                  </Chip>

                )}

              </View>

            </TouchableOpacity>

          </Card>
        );
      };


    /* ========================================================
       HEADER
    ======================================================== */

    const ListHeader =
      () => (

        <View>

          {/* ----------------------------------------------
              HERO
          ---------------------------------------------- */}

          <Card
            style={
              styles.heroCard
            }
          >

            <View
              style={
                styles.heroContent
              }
            >

              <View>

                <Text
                  style={
                    styles.eyebrow
                  }
                >
                  STUDENTS
                </Text>

                <Text
                  style={
                    styles.heroTitle
                  }
                >
                  {section
                    ?.classDisplayName ??
                    `Class ${classNumber ?? ""}`}
                </Text>

                <Text
                  style={
                    styles.heroSection
                  }
                >
                  Section{" "}
                  {section
                    ?.sectionName ??
                    sectionName ??
                    "-"}
                </Text>

              </View>

              <View
                style={
                  styles.countBox
                }
              >

                <Text
                  style={
                    styles.countNumber
                  }
                >
                  {students.length}
                </Text>

                <Text
                  style={
                    styles.countLabel
                  }
                >
                  Students
                </Text>

              </View>

            </View>

          </Card>


          {/* ----------------------------------------------
              ACADEMIC YEAR
          ---------------------------------------------- */}

          {academicYear && (

            <View
              style={
                styles.yearRow
              }
            >

              <Text
                style={
                  styles.yearLabel
                }
              >
                Academic Year
              </Text>

              <Chip
                compact
                style={
                  styles.yearChip
                }
              >
                {academicYear.name}
              </Chip>

              {section?.isClassTeacher && (

                <Chip
                  compact
                  icon="account-tie"
                  style={
                    styles.teacherChip
                  }
                >
                  Class Teacher
                </Chip>

              )}

            </View>

          )}


          {/* ----------------------------------------------
              SEARCH
          ---------------------------------------------- */}

          <View
            style={
              styles.searchContainer
            }
          >

            <TextInput
              value={search}
              onChangeText={
                setSearch
              }
              placeholder={
                "Search by name, admission no. or roll no."
              }
              placeholderTextColor={
                Colors.subtext
              }
              style={
                styles.searchInput
              }
            />

          </View>


          {/* ----------------------------------------------
              SUMMARY
          ---------------------------------------------- */}

          <View
            style={
              styles.summaryRow
            }
          >

            <Text
              style={
                styles.summaryText
              }
            >
              {filteredStudents.length}{" "}
              student
              {filteredStudents.length !==
              1
                ? "s"
                : ""}
            </Text>

            {search.trim() !== "" && (

              <Text
                style={
                  styles.filteredText
                }
              >
                filtered
              </Text>

            )}

          </View>

        </View>
      );


    /* ========================================================
       LOADING
    ======================================================== */

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
            Loading students...
          </Text>

        </View>
      );

    }


    /* ========================================================
       ERROR
    ======================================================== */

    if (error) {

      return (
        <View
          style={
            styles.center
          }
        >

          <Text
            style={
              styles.errorTitle
            }
          >
            Unable to load students
          </Text>

          <Text
            style={
              styles.errorText
            }
          >
            {error}
          </Text>

          <TouchableOpacity
            style={
              styles.retryButton
            }
            onPress={() =>
              loadStudents()
            }
          >
            <Text
              style={
                styles.retryText
              }
            >
              Retry
            </Text>
          </TouchableOpacity>

        </View>
      );

    }


    /* ========================================================
       MAIN
    ======================================================== */

    return (

      <View
        style={
          styles.container
        }
      >

        <View
          style={
            styles.topBar
          }
        >

          <TouchableOpacity
            onPress={() =>
              navigation.goBack()
            }
            style={
              styles.backButton
            }
          >

            <Text
              style={
                styles.backText
              }
            >
              ‹
            </Text>

          </TouchableOpacity>

          <Text
            style={
              styles.topBarTitle
            }
          >
            Section Students
          </Text>

        </View>


        <FlatList
          data={
            filteredStudents
          }

          keyExtractor={(
            item
          ) =>
            item.id
          }

          renderItem={
            renderStudent
          }

          ListHeaderComponent={
            ListHeader
          }

          contentContainerStyle={
            styles.listContent
          }

          refreshControl={
            <RefreshControl
              refreshing={
                refreshing
              }
              onRefresh={
                handleRefresh
              }
            />
          }

          ListEmptyComponent={

            <View
              style={
                styles.empty
              }
            >

              <Text
                style={
                  styles.emptyIcon
                }
              >
                👨‍🎓
              </Text>

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
                {search.trim()
                  ? "No students match your search."
                  : "There are no students enrolled in this section."}
              </Text>

            </View>

          }
        />

      </View>

    );
  };


/* ============================================================
   STYLES
============================================================ */

const useStyles =
  makeStyles(() => ({

    container: {
      flex: 1,
      backgroundColor:
        "#F7F8FC",
    },

    topBar: {
      height: 64,
      paddingHorizontal:
        Metrics.x4,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor:
        "#FFFFFF",
      borderBottomWidth: 1,
      borderBottomColor:
        "#ECEEF2",
    },

    backButton: {
      width: 42,
      height: 42,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      marginRight:
        Metrics.x2,
    },

    backText: {
      fontSize: 34,
      lineHeight: 36,
      color: "#222222",
    },

    topBarTitle: {
      fontSize: 18,
      fontWeight: "800",
      color: "#171717",
    },

    listContent: {
      padding:
        Metrics.x4,
      paddingBottom:
        Metrics.x8,
      maxWidth: 1200,
      alignSelf: "center",
      width: "100%",
    },

    heroCard: {
      borderRadius: 18,
      marginBottom:
        Metrics.x3,
      backgroundColor:
        "#FFFFFF",
      elevation: 1,
    },

    heroContent: {
      padding:
        Metrics.x5,
      flexDirection: "row",
      justifyContent:
        "space-between",
      alignItems: "center",
    },

    eyebrow: {
      fontSize: 11,
      fontWeight: "900",
      letterSpacing: 1.2,
      color:
        Colors.brandPrimary,
    },

    heroTitle: {
      marginTop:
        Metrics.x1,
      fontSize: 25,
      fontWeight: "900",
      color: "#171717",
    },

    heroSection: {
      marginTop:
        Metrics.x1,
      fontSize: 14,
      color:
        Colors.subtext,
      fontWeight: "600",
    },

    countBox: {
      minWidth: 90,
      paddingVertical:
        Metrics.x3,
      paddingHorizontal:
        Metrics.x4,
      borderRadius: 16,
      alignItems: "center",
      backgroundColor:
        "#F1F5FF",
    },

    countNumber: {
      fontSize: 25,
      fontWeight: "900",
      color:
        Colors.brandPrimary,
    },

    countLabel: {
      marginTop:
        2,
      fontSize: 11,
      fontWeight: "700",
      color:
        Colors.subtext,
    },

    yearRow: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 8,
      marginBottom:
        Metrics.x3,
    },

    yearLabel: {
      fontSize: 13,
      color:
        Colors.subtext,
      fontWeight: "600",
    },

    yearChip: {
      backgroundColor:
        "#FFFFFF",
    },

    teacherChip: {
      backgroundColor:
        "#EAF7EF",
    },

    searchContainer: {
      backgroundColor:
        "#FFFFFF",
      borderRadius: 14,
      borderWidth: 1,
      borderColor:
        "#E1E4EA",
      marginBottom:
        Metrics.x3,
    },

    searchInput: {
      minHeight: 48,
      paddingHorizontal:
        Metrics.x4,
      fontSize: 14,
      color: "#171717",
    },

    summaryRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom:
        Metrics.x3,
    },

    summaryText: {
      fontSize: 13,
      fontWeight: "800",
      color: "#333333",
    },

    filteredText: {
      marginLeft:
        Metrics.x2,
      fontSize: 12,
      color:
        Colors.subtext,
    },

    studentCard: {
      marginBottom:
        Metrics.x2,
      borderRadius: 14,
      backgroundColor:
        "#FFFFFF",
      elevation: 1,
    },

    studentCardDesktop: {
      maxWidth: 900,
      alignSelf: "center",
      width: "100%",
    },

    studentRow: {
      minHeight: 78,
      padding:
        Metrics.x3,
      flexDirection: "row",
      alignItems: "center",
    },

    rollContainer: {
      width: 38,
      alignItems: "center",
    },

    rollText: {
      fontSize: 12,
      fontWeight: "800",
      color:
        Colors.subtext,
    },

    avatar: {
      backgroundColor:
        "#E8ECF7",
    },

    studentInfo: {
      flex: 1,
      marginLeft:
        Metrics.x3,
      marginRight:
        Metrics.x2,
    },

    studentName: {
      fontSize: 15,
      fontWeight: "800",
      color: "#171717",
    },

    admissionText: {
      marginTop: 3,
      fontSize: 11,
      color:
        Colors.subtext,
      fontWeight: "600",
    },

    parentText: {
      marginTop: 3,
      fontSize: 11,
      color:
        Colors.subtext,
    },

    genderChip: {
      backgroundColor:
        "#F3F4F6",
    },

    genderText: {
      fontSize: 10,
      fontWeight: "700",
    },

    empty: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical:
        Metrics.x8,
    },

    emptyIcon: {
      fontSize: 40,
    },

    emptyTitle: {
      marginTop:
        Metrics.x3,
      fontSize: 18,
      fontWeight: "800",
      color: "#171717",
    },

    emptyText: {
      marginTop:
        Metrics.x1,
      maxWidth: 400,
      textAlign: "center",
      fontSize: 13,
      color:
        Colors.subtext,
    },

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

    errorTitle: {
      fontSize: 18,
      fontWeight: "800",
      color: "#171717",
    },

    errorText: {
      marginTop:
        Metrics.x2,
      maxWidth: 400,
      textAlign: "center",
      fontSize: 13,
      color:
        Colors.subtext,
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

  }));


export {
  TeacherSectionStudentsScreen,
};