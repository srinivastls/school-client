import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  Avatar,
  Button,
  Card,
  Divider,
  IconButton,
  Snackbar,
  TextInput,
} from "react-native-paper";

import {
  FlatList,
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

import {
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";

import {
  useNavigation,
} from "@react-navigation/native";

import {
  useQuery,
  useMutation,
} from "react-query";

import {
  classServices,
} from "../../services/classServices";

import {
  sectionServices,
  Section,
  GetSectionsByClassResponse,
} from "../../services/sectionServices";

import {
  Colors,
  makeStyles,
  Metrics,
} from "../../theme";

import {
  RootStackParamList,
  RootStackScreenNames,
} from "../../types";

import {
  useUserStore,
} from "../../store";

/* ============================================================
   TYPES
============================================================ */

type PrincipalClassDetailsScreenProps = {
  route: {
    params: {
      classNumber: string;
      academicYearId?: string;
    };
  };
};

type ClassDetails = {
  id: string;
  classNumber: string;
  displayName?: string;
  academicYearId?: string;
  className?: string;

  tuitionFee?: string | number | null;
  textBookFee?: string | number | null;
  noteBookFee?: string | number | null;
  diaryFee?: string | number | null;

  isCompleted?: boolean;
};

/* ============================================================
   SCREEN
============================================================ */

const PrincipalClassDetailsScreen = ({
  route,
}: PrincipalClassDetailsScreenProps) => {
  const styles = useStyles();

  const navigation =
    useNavigation<
      NativeStackNavigationProp<RootStackParamList>
    >();

  /* ==========================================================
     RESPONSIVE
  ========================================================== */

  const { width } =
    useWindowDimensions();

  const isSmallScreen =
    width < 600;

  const isTablet =
    width >= 600 &&
    width < 1024;

  const horizontalPadding =
    isSmallScreen
      ? Metrics.x3
      : isTablet
        ? Metrics.x4
        : Metrics.x6;

  /* ==========================================================
     ROUTE
  ========================================================== */

  const {
    classNumber,
    academicYearId,
  } = route.params;

  /* ==========================================================
     USER
  ========================================================== */

  const user =
    useUserStore(
      state => state.user
    )!;

  const logout =
    useUserStore(
      state => state.logout
    );

  /* ==========================================================
     STATE
  ========================================================== */

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    profileMenuVisible,
    setProfileMenuVisible,
  ] = useState(false);

  const [
    showSnackbar,
    setShowSnackbar,
  ] = useState(false);

  const [
    snackbarText,
    setSnackbarText,
  ] = useState("");


  /* ==========================================================
   CREATE SECTION STATE
========================================================== */

const [
  createSectionVisible,
  setCreateSectionVisible,
] = useState(false);

const [
  sectionNameInput,
  setSectionNameInput,
] = useState("");

const [
  createSectionError,
  setCreateSectionError,
] = useState("");

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

  if (user.role !== "PRINCIPAL" && user.role !== "ADMIN") {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>
          You are not authorized to access this screen.
        </Text>
      </View>
    );
  }

  /* ==========================================================
   CREATE SECTION MUTATION
========================================================== */

const createSectionMutation =
  useMutation(
    (payload: {
      classId: string;
      sectionName: string;
    }) =>
      sectionServices.createSection(payload),

    {
      onSuccess: (response) => {
        setCreateSectionVisible(false);
        setSectionNameInput("");
        setCreateSectionError("");

        setSnackbarText(
          response.message ||
            "Section created successfully."
        );

        setShowSnackbar(true);

        // Refresh sections list
        void refetchSections();
      },

      onError: (error: any) => {
        const message =
          error?.response?.data?.message ??
          "Unable to create section.";

        setCreateSectionError(
          String(message)
        );
      },
    }
  );


  /* ==========================================================
   CREATE SECTION HANDLER
========================================================== */

const handleCreateSection = () => {
  const trimmedName =
    sectionNameInput.trim();

  if (!classDetails?.id) {
    setCreateSectionError(
      "Class information is not available."
    );

    return;
  }

  if (!trimmedName) {
    setCreateSectionError(
      "Please enter a section name."
    );

    return;
  }

  if (trimmedName.length > 50) {
    setCreateSectionError(
      "Section name cannot exceed 50 characters."
    );

    return;
  }

  setCreateSectionError("");

  createSectionMutation.mutate({
    classId: classDetails.id,
    sectionName: trimmedName,
  });
};

  /* ==========================================================
     CLASS API
     
     IMPORTANT:
     classServices.getClassDetails() returns Class directly.
     It does NOT return { class: ... }.
  ========================================================== */

  const {
    data: classDetails,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery<ClassDetails>(
    [
      "principal-class-details",
      classNumber,
      academicYearId,
    ],

    async () => {
      const response =
        await classServices.getClassDetails(
          classNumber,
          academicYearId
        );

      return response as ClassDetails;
    },

    {
      enabled: Boolean(classNumber),
      retry: 1,
    }
  );

  /* ==========================================================
     SECTIONS API

     IMPORTANT:
     getSectionsByClass() returns:

     {
       class: {...},
       sections: [...]
     }
  ========================================================== */

  const {
    data: sectionData,
    isLoading: sectionsLoading,
    isFetching: sectionsFetching,
    refetch: refetchSections,
  } = useQuery<GetSectionsByClassResponse>(
    [
      "principal-class-sections",
      classDetails?.id,
    ],

    async () => {
      if (!classDetails?.id) {
        return {
          class: {
            id: "",
            classNumber: "",
            displayName: "",
            academicYearId: "",
          },

          sections: [],
        };
      }

      return sectionServices.getSectionsByClass(
        classDetails.id
      );
    },

    {
      enabled: Boolean(classDetails?.id),
      retry: 1,
    }
  );


  /* ==========================================================
   CREATE SECTION MODAL
========================================================== */

const renderCreateSectionModal = () => {
  return (
    <Modal
      visible={createSectionVisible}
      transparent
      animationType="fade"
      onRequestClose={() => {
        if (!createSectionMutation.isLoading) {
          setCreateSectionVisible(false);
          setCreateSectionError("");
        }
      }}
    >
      <View style={styles.createModalOverlay}>
        <View style={styles.createModalContainer}>

          {/* HEADER */}

          <View style={styles.createModalHeader}>
            <View style={styles.createModalHeaderText}>

              <Text style={styles.createModalTitle}>
                Create Section
              </Text>

              <Text style={styles.createModalSubtitle}>
                Add a new section to{" "}
                {String(
                  classDetails?.displayName ||
                    `Class ${classNumber}`
                )}
              </Text>

            </View>

            <IconButton
              icon="close"
              size={22}
              onPress={() => {
                if (
                  !createSectionMutation.isLoading
                ) {
                  setCreateSectionVisible(false);
                  setCreateSectionError("");
                }
              }}
              disabled={
                createSectionMutation.isLoading
              }
            />
          </View>

          {/* INPUT */}

          <TextInput
            mode="outlined"
            label="Section Name"
            placeholder="Enter section name (e.g. A)"
            value={sectionNameInput}
            onChangeText={(value) => {
              setSectionNameInput(value);

              if (createSectionError) {
                setCreateSectionError("");
              }
            }}
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={50}
            disabled={
              createSectionMutation.isLoading
            }
            style={styles.createSectionInput}
            outlineStyle={
              styles.createSectionInputOutline
            }
          />

          {/* ERROR */}

          {Boolean(createSectionError) && (
            <Text style={styles.createSectionError}>
              {createSectionError}
            </Text>
          )}

          {/* BUTTONS */}

          <View style={styles.createModalActions}>

            <Button
              mode="outlined"
              onPress={() => {
                setCreateSectionVisible(false);
                setCreateSectionError("");
              }}
              disabled={
                createSectionMutation.isLoading
              }
              style={styles.createCancelButton}
            >
              Cancel
            </Button>

            <Button
              mode="contained"
              onPress={handleCreateSection}
              loading={
                createSectionMutation.isLoading
              }
              disabled={
                createSectionMutation.isLoading
              }
              style={styles.createSubmitButton}
            >
              Create
            </Button>

          </View>

        </View>
      </View>
    </Modal>
  );
};

  /* ==========================================================
     SECTIONS
  ========================================================== */

  const sections: Section[] =
    sectionData?.sections ?? [];

  /* ==========================================================
     ERROR
  ========================================================== */

  useEffect(() => {
    if (!isError) {
      return;
    }

    const message =
      (error as any)?.response?.data?.message ??
      "Unable to load class details.";

    setSnackbarText(
      String(message)
    );

    setShowSnackbar(true);
  }, [
    isError,
    error,
  ]);

  /* ==========================================================
     SEARCH
  ========================================================== */

  const searchValue =
    search
      .trim()
      .toLowerCase();

  const filteredSections =
    useMemo(() => {
      if (!searchValue) {
        return sections;
      }

      return sections.filter(
        section =>
          section.sectionName
            ?.toLowerCase()
            .includes(searchValue) ||

          section.classTeacher?.name
            ?.toLowerCase()
            .includes(searchValue)
      );
    }, [
      sections,
      searchValue,
    ]);

  /* ==========================================================
     SUMMARY
  ========================================================== */

  const totalStudents =
    sections.reduce(
      (total, section) =>
        total +
        Number(
          section.totalStudents ?? 0
        ),
      0
    );

  const assignedTeachers =
    sections.filter(
      section =>
        Boolean(section.classTeacher)
    ).length;

  /* ==========================================================
     LOGOUT
  ========================================================== */

  const handleLogout = () => {
    setProfileMenuVisible(false);

    logout();

    navigation.reset({
      index: 0,

      routes: [
        {
          name:
            RootStackScreenNames.Login,
        },
      ],
    });
  };

  /* ==========================================================
     BACK
  ========================================================== */

  const goBack = () => {
    navigation.goBack();
  };

  /* ==========================================================
     REFRESH
  ========================================================== */

  const handleRefresh = () => {
    void refetch();
    void refetchSections();
  };

  /* ==========================================================
     OPEN SECTION STUDENTS
  ========================================================== */

  const openSectionStudents = (
    sectionId: string
  ) => {
    navigation.navigate(
      RootStackScreenNames.PrincipalClassStudents,
      {
        sectionId: sectionId,
      }
    );
  };

  /* ==========================================================
     NAVBAR
  ========================================================== */

  const renderNavbar = () => {
    return null;
    return (
      <View style={styles.navbar}>

        {/* LEFT */}

        <View style={styles.navbarLeft}>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={goBack}
            style={styles.backButton}
          >
            <Text style={styles.backIcon}>
              ‹
            </Text>
          </TouchableOpacity>

          <Avatar.Icon
            size={
              isSmallScreen
                ? 42
                : 46
            }
            icon="school"
            color="#FFFFFF"
            style={styles.navbarLogo}
          />

          <View style={styles.navbarBrand}>

            <Text
              style={
                styles.navbarSchoolName
              }
              numberOfLines={1}
            >
              {String(
                user.schoolName ||
                "School Platform"
              )}
            </Text>

            <Text
              style={
                styles.navbarSubtitle
              }
            >
              Principal Administration
            </Text>

          </View>

        </View>

        {/* RIGHT */}

        <View style={styles.navbarRight}>

          <IconButton
            icon="refresh"
            size={
              isSmallScreen
                ? 20
                : 22
            }
            iconColor={
              Colors.brandPrimary
            }
            onPress={handleRefresh}
            style={styles.refreshButton}
          />

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() =>
              setProfileMenuVisible(true)
            }
            style={[
              styles.profileButton,
              profileMenuVisible &&
                styles.profileButtonActive,
            ]}
          >

            <Avatar.Text
              size={
                isSmallScreen
                  ? 38
                  : 42
              }
              label={getInitials(
                user.name
              )}
              color="#FFFFFF"
              style={
                styles.profileAvatar
              }
            />

            {!isSmallScreen && (
              <View
                style={
                  styles.profileDetails
                }
              >

                <Text
                  style={
                    styles.profileName
                  }
                  numberOfLines={1}
                >
                  {String(
                    user.name ||
                    "Principal"
                  )}
                </Text>

                <Text
                  style={
                    styles.profileRole
                  }
                >
                  Principal
                </Text>

              </View>
            )}

            <Text
              style={
                styles.profileArrow
              }
            >
              {profileMenuVisible
                ? "⌃"
                : "⌄"}
            </Text>

          </TouchableOpacity>

        </View>

      </View>
    );
  };

  /* ==========================================================
     PROFILE DROPDOWN
  ========================================================== */

  const renderProfileDropdown = () => {
    if (!profileMenuVisible) {
      return null;
    }

    return (
      <Modal
        visible={profileMenuVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() =>
          setProfileMenuVisible(false)
        }
      >

        <Pressable
          style={
            styles.modalOverlay
          }
          onPress={() =>
            setProfileMenuVisible(false)
          }
        >

          <View
            style={[
              styles.profileDropdown,
              isSmallScreen &&
                styles.profileDropdownMobile,
            ]}
          >

            <View
              style={
                styles.dropdownProfileHeader
              }
            >

              <Avatar.Text
                size={46}
                label={getInitials(
                  user.name
                )}
                color="#FFFFFF"
                style={
                  styles.dropdownAvatar
                }
              />

              <View
                style={
                  styles.dropdownUserInfo
                }
              >

                <Text
                  style={
                    styles.dropdownUserName
                  }
                  numberOfLines={1}
                >
                  {String(
                    user.name ||
                    "Principal"
                  )}
                </Text>

                <Text
                  style={
                    styles.dropdownUserEmail
                  }
                  numberOfLines={1}
                >
                  {String(
                    user.email || ""
                  )}
                </Text>

                <Text
                  style={
                    styles.dropdownUserRole
                  }
                >
                  Principal
                </Text>

              </View>

            </View>

            <Divider
              style={
                styles.dropdownDivider
              }
            />

            <TouchableOpacity
              activeOpacity={0.7}
              style={
                styles.dropdownItem
              }
              onPress={() => {
                setProfileMenuVisible(false);

                setSnackbarText(
                  "Principal profile coming next."
                );

                setShowSnackbar(true);
              }}
            >

              <View
                style={
                  styles.dropdownIconContainer
                }
              >
                <Text
                  style={
                    styles.dropdownIcon
                  }
                >
                  👤
                </Text>
              </View>

              <View
                style={
                  styles.dropdownItemTextContainer
                }
              >

                <Text
                  style={
                    styles.dropdownItemTitle
                  }
                >
                  Profile
                </Text>

                <Text
                  style={
                    styles.dropdownItemSubtitle
                  }
                >
                  View your principal profile
                </Text>

              </View>

            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              style={[
                styles.dropdownItem,
                styles.logoutItem,
              ]}
              onPress={handleLogout}
            >

              <View
                style={[
                  styles.dropdownIconContainer,
                  styles.logoutIconContainer,
                ]}
              >
                <Text
                  style={[
                    styles.dropdownIcon,
                    styles.logoutIcon,
                  ]}
                >
                  ↪
                </Text>
              </View>

              <View
                style={
                  styles.dropdownItemTextContainer
                }
              >

                <Text
                  style={[
                    styles.dropdownItemTitle,
                    styles.logoutTitle,
                  ]}
                >
                  Logout
                </Text>

                <Text
                  style={
                    styles.dropdownItemSubtitle
                  }
                >
                  Sign out of this account
                </Text>

              </View>

            </TouchableOpacity>

          </View>

        </Pressable>

      </Modal>
    );
  };

  /* ==========================================================
     PAGE HEADER
  ========================================================== */

  const renderPageHeader = () => {
    return (
      <View
        style={styles.pageHeader}
      >

        <View
          style={styles.pageHeaderTop}
        >

          <View
            style={styles.pageHeaderText}
          >

            <Text
              style={styles.eyebrow}
            >
              CLASS MANAGEMENT
            </Text>

            <Text
              style={styles.pageTitle}
            >
              Class{" "}
              {String(
                classDetails?.classNumber ??
                classNumber
              )}
            </Text>

            <Text
              style={styles.pageSubtitle}
            >
              {String(
                classDetails?.displayName ||
                `Manage Class ${classNumber}`
              )}

              {academicYearId
                ? " • Academic Year"
                : ""}
            </Text>

          </View>

          <Button
            mode="outlined"
            icon="arrow-left"
            onPress={goBack}
            style={
              styles.backToClassesButton
            }
            contentStyle={
              styles.backToClassesContent
            }
          >
            Back
          </Button>

        </View>

      </View>
    );
  };

  /* ==========================================================
     CLASS HERO
  ========================================================== */

  const renderClassHero = () => {
    return (
      <Card
        style={styles.classHero}
      >

        <Card.Content>

          <View
            style={styles.classHeroRow}
          >

            <View
              style={styles.classHeroLeft}
            >

              <Avatar.Icon
                size={60}
                icon="google-classroom"
                color="#FFFFFF"
                style={
                  styles.classHeroIcon
                }
              />

              <View
                style={styles.classHeroInfo}
              >

                <Text
                  style={
                    styles.classHeroEyebrow
                  }
                >
                  CLASS OVERVIEW
                </Text>

                <Text
                  style={
                    styles.classHeroTitle
                  }
                >
                  {String(
                    classDetails?.displayName ||
                    `Class ${classNumber}`
                  )}
                </Text>

                <Text
                  style={
                    styles.classHeroSubtitle
                  }
                >
                  {sections.length}{" "}
                  {sections.length === 1
                    ? "section"
                    : "sections"}
                  {" • "}
                  {totalStudents} students
                </Text>

              </View>

            </View>

            <View
              style={
                styles.classHeroStats
              }
            >

              <View
                style={
                  styles.classHeroBadge
                }
              >

                <Text
                  style={
                    styles.classHeroBadgeValue
                  }
                >
                  {sections.length}
                </Text>

                <Text
                  style={
                    styles.classHeroBadgeLabel
                  }
                >
                  Sections
                </Text>

              </View>

              <View
                style={
                  styles.classHeroBadge
                }
              >

                <Text
                  style={
                    styles.classHeroBadgeValue
                  }
                >
                  {totalStudents}
                </Text>

                <Text
                  style={
                    styles.classHeroBadgeLabel
                  }
                >
                  Students
                </Text>

              </View>

            </View>

          </View>

        </Card.Content>

      </Card>
    );
  };

  /* ==========================================================
     FEES
  ========================================================== */

  const renderFees = () => {
    return (
      <Card
        style={styles.infoCard}
      >

        <Card.Content>

          <Text
            style={styles.cardTitle}
          >
            Fee Structure
          </Text>

          <Text
            style={styles.cardSubtitle}
          >
            Current fee configuration for this class.
          </Text>

          <View
            style={styles.feeGrid}
          >

            {renderFee(
              "Tuition Fee",
              classDetails?.tuitionFee
            )}

            {renderFee(
              "Textbook Fee",
              classDetails?.textBookFee
            )}

            {renderFee(
              "Notebook Fee",
              classDetails?.noteBookFee
            )}

            {renderFee(
              "Diary Fee",
              classDetails?.diaryFee
            )}

          </View>

        </Card.Content>

      </Card>
    );
  };

  /* ==========================================================
     SECTION HEADER
  ========================================================== */

  /* ==========================================================
   SECTION HEADER
========================================================== */

const renderSectionHeader = () => {
  return (
    <View style={styles.sectionHeader}>

      <View style={styles.sectionHeaderText}>

        <Text style={styles.sectionTitle}>
          Sections
        </Text>

        <Text style={styles.sectionSubtitle}>
          Select a section to view its students
          and class teacher.
        </Text>

      </View>

      <View style={styles.sectionHeaderRight}>

        <View style={styles.sectionCountBadge}>
          <Text style={styles.sectionCountText}>
            {sections.length}
          </Text>
        </View>

        <Button
          mode="contained"
          icon="plus"
          compact
          onPress={() => {
            setSectionNameInput("");
            setCreateSectionError("");
            setCreateSectionVisible(true);
          }}
          style={styles.createSectionButton}
          contentStyle={
            styles.createSectionButtonContent
          }
        >
          Create
        </Button>

      </View>

    </View>
  );
};

  /* ==========================================================
     SEARCH
  ========================================================== */

  const renderSearch = () => {
    return (
      <Card
        style={styles.searchCard}
      >

        <Card.Content>

          <View
            style={styles.searchHeader}
          >

            <View
              style={styles.searchHeaderText}
            >

              <Text
                style={styles.searchTitle}
              >
                Find a Section
              </Text>

              <Text
                style={styles.searchSubtitle}
              >
                Search by section or class teacher.
              </Text>

            </View>

            {search.length > 0 && (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() =>
                  setSearch("")
                }
              >

                <Text
                  style={
                    styles.clearSearch
                  }
                >
                  Clear
                </Text>

              </TouchableOpacity>
            )}

          </View>

          <TextInput
            mode="outlined"
            label="Search section"
            placeholder="Section name or teacher"
            value={search}
            onChangeText={setSearch}
            autoCapitalize="none"
            autoCorrect={false}
            left={
              <TextInput.Icon
                icon="magnify"
              />
            }
            style={
              styles.searchInput
            }
            outlineStyle={
              styles.searchOutline
            }
          />

        </Card.Content>

      </Card>
    );
  };

  /* ==========================================================
     SECTION ITEM
  ========================================================== */

  const renderSection = ({
    item,
  }: {
    item: Section;
  }) => {
    return (
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={() =>
          openSectionStudents(
            item.id
          )
        }
        style={
          styles.sectionTouchable
        }
      >

        <Card
          style={styles.sectionCard}
        >

          <Card.Content>

            <View
              style={styles.sectionRow}
            >

              <Avatar.Text
                size={54}
                label={
                  item.sectionName
                    ?.slice(0, 2)
                    .toUpperCase() ||
                  "S"
                }
                color="#4F46E5"
                style={
                  styles.sectionAvatar
                }
              />

              <View
                style={styles.sectionInfo}
              >

                <Text
                  style={styles.sectionName}
                  numberOfLines={1}
                >
                  Section{" "}
                  {String(
                    item.sectionName
                  )}
                </Text>

                <View
                  style={
                    styles.teacherRow
                  }
                >

                  <Text
                    style={
                      styles.teacherLabel
                    }
                  >
                    Class Teacher
                  </Text>

                  <Text
                    style={
                      styles.teacherValue
                    }
                    numberOfLines={1}
                  >
                    {String(
                      item.classTeacher?.name ||
                      "Not assigned"
                    )}
                  </Text>

                </View>

                <View
                  style={
                    styles.studentCountRow
                  }
                >

                  <Text
                    style={
                      styles.studentCountIcon
                    }
                  >
                    👥
                  </Text>

                  <Text
                    style={
                      styles.studentCountText
                    }
                  >
                    {Number(
                      item.totalStudents ?? 0
                    )}{" "}
                    {item.totalStudents === 1
                      ? "student"
                      : "students"}
                  </Text>

                </View>

              </View>

              <View
                style={styles.sectionRight}
              >

                <View
                  style={[
                    styles.teacherStatus,
                    item.classTeacher
                      ? styles.teacherAssigned
                      : styles.teacherUnassigned,
                  ]}
                >

                  <Text
                    style={[
                      styles.teacherStatusText,
                      item.classTeacher
                        ? styles.teacherAssignedText
                        : styles.teacherUnassignedText,
                    ]}
                  >
                    {item.classTeacher
                      ? "Assigned"
                      : "Unassigned"}
                  </Text>

                </View>

                <View
                  style={
                    styles.sectionArrow
                  }
                >

                  <Text
                    style={
                      styles.sectionArrowText
                    }
                  >
                    →
                  </Text>

                </View>

              </View>

            </View>

          </Card.Content>

        </Card>

      </TouchableOpacity>
    );
  };

  /* ==========================================================
     EMPTY
  ========================================================== */

  const renderEmpty = () => {
    if (
      sectionsLoading ||
      sectionsFetching
    ) {
      return (
        <View
          style={styles.empty}
        >

          <ActivityIndicator
            size="large"
            color={
              Colors.brandPrimary
            }
          />

          <Text
            style={styles.emptyTitle}
          >
            Loading sections...
          </Text>

        </View>
      );
    }

    return (
      <View
        style={styles.empty}
      >

        <Avatar.Icon
          size={70}
          icon={
            searchValue
              ? "magnify"
              : "google-classroom"
          }
          color="#4F46E5"
          style={styles.emptyIcon}
        />

        <Text
          style={styles.emptyTitle}
        >
          {searchValue
            ? "No matching sections"
            : "No sections found"}
        </Text>

        <Text
          style={styles.emptyText}
        >
          {searchValue
            ? "Try searching with a different section name or teacher."
            : `No sections are currently configured for Class ${classNumber}.`}
        </Text>

        {searchValue && (
          <Button
            mode="outlined"
            onPress={() =>
              setSearch("")
            }
            style={
              styles.emptyButton
            }
          >
            Clear Search
          </Button>
        )}

      </View>
    );
  };

  /* ==========================================================
     LOADING CLASS
  ========================================================== */

  if (isLoading) {
    return (
      <View style={styles.page}>

        <View
          style={[
            styles.loadingScreen,
            {
              paddingHorizontal:
                horizontalPadding,
            },
          ]}
        >


          <View
            style={styles.loaderContent}
          >

            <Avatar.Icon
              size={68}
              icon="google-classroom"
              color={
                Colors.brandPrimary
              }
              style={
                styles.loadingIcon
              }
            />

            <ActivityIndicator
              size="large"
              color={
                Colors.brandPrimary
              }
              style={styles.loader}
            />

            <Text
              style={styles.loadingTitle}
            >
              Loading class...
            </Text>

            <Text
              style={styles.loadingText}
            >
              Fetching Class{" "}
              {String(classNumber)}{" "}
              details.
            </Text>

          </View>

        </View>

        {renderProfileDropdown()}

      </View>
    );
  }

  /* ==========================================================
     MAIN UI
  ========================================================== */

    return (
  <View style={styles.page}>

    <FlatList
      data={filteredSections}
      renderItem={renderSection}
      keyExtractor={item => item.id}
      showsVerticalScrollIndicator={false}

      contentContainerStyle={[
        styles.listContent,
        {
          paddingHorizontal:
            horizontalPadding,
        },
      ]}

      ListHeaderComponent={
        <>
          {renderPageHeader()}
          {renderClassHero()}
          {renderFees()}
          {renderSearch()}
          {renderSectionHeader()}
        </>
      }

      ListEmptyComponent={renderEmpty}

      refreshing={
        isFetching ||
        sectionsFetching
      }

      onRefresh={handleRefresh}
    />

    {renderProfileDropdown()}

    {renderCreateSectionModal()}

    <Snackbar
      visible={showSnackbar}
      onDismiss={() =>
        setShowSnackbar(false)
      }
      duration={3000}
      style={styles.snackbar}
    >
      {String(snackbarText)}
    </Snackbar>

  </View>
);
};

/* ============================================================
   FEE
============================================================ */

const renderFee = (
  label: string,
  value?: string | number | null
) => {
  const displayValue =
    value === undefined ||
    value === null ||
    value === ""
      ? "—"
      : `₹${formatNumber(
          Number(value)
        )}`;

  return (
    <View
      style={feeStyles.item}
    >

      <Text
        style={feeStyles.label}
      >
        {label}
      </Text>

      <Text
        style={feeStyles.value}
      >
        {displayValue}
      </Text>

    </View>
  );
};

/* ============================================================
   INITIALS
============================================================ */

const getInitials = (
  name?: string | null
) => {
  if (!name) {
    return "P";
  }

  const parts =
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean);

  if (parts.length === 1) {
    return parts[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return (
    parts[0][0] +
    parts[parts.length - 1][0]
  ).toUpperCase();
};

/* ============================================================
   NUMBER FORMAT
============================================================ */

const formatNumber = (
  value: number
) => {
  if (
    Number.isNaN(value) ||
    !Number.isFinite(value)
  ) {
    return "0";
  }

  return new Intl.NumberFormat(
    "en-IN"
  ).format(value);
};

/* ============================================================
   FEE STYLES
============================================================ */

const feeStyles = {
  item: {
    flex: 1,
    minWidth: 130,
    padding: 12,
    backgroundColor: "#F8F9FC",
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },

  label: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "600" as const,
  },

  value: {
    fontSize: 16,
    color: "#171717",
    fontWeight: "800" as const,
    marginTop: 5,
  },
};

/* ============================================================
   STYLES
============================================================ */

const useStyles = makeStyles(
  () => ({

    page: {
      flex: 1,
      backgroundColor: "#F7F8FC",
    },

    listContent: {
      paddingTop: Metrics.x3,
      paddingBottom: Metrics.x8,
    },

    /* ======================================================
       NAVBAR
    ====================================================== */

    navbar: {
      minHeight: 72,
      paddingHorizontal: Metrics.x3,
      paddingVertical: Metrics.x2,
      flexDirection: "row" as const,
      alignItems: "center" as const,
      justifyContent:
        "space-between" as const,
      backgroundColor: "#FFFFFF",
      borderWidth: 1,
      borderColor: "#E9EAF0",
      borderRadius: 16,
      marginBottom: Metrics.x5,
      elevation: 1,
    },

    navbarLeft: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      flex: 1,
      minWidth: 0,
    },

    sectionHeaderRight: {
  flexDirection: "row" as const,
  alignItems: "center" as const,
  gap: Metrics.x2,
},

createSectionButton: {
  borderRadius: 12,
},

createSectionButtonContent: {
  minHeight: 40,
},


/* ======================================================
   CREATE SECTION MODAL
====================================================== */

createModalOverlay: {
  flex: 1,
  backgroundColor: "rgba(0,0,0,0.45)",
  justifyContent: "center" as const,
  alignItems: "center" as const,
  paddingHorizontal: Metrics.x4,
},

createModalContainer: {
  width: "100%",
  maxWidth: 480,
  backgroundColor: "#FFFFFF",
  borderRadius: 20,
  padding: Metrics.x4,
  elevation: 8,
},

createModalHeader: {
  flexDirection: "row" as const,
  alignItems: "flex-start" as const,
  justifyContent: "space-between" as const,
  marginBottom: Metrics.x3,
},

createModalHeaderText: {
  flex: 1,
  paddingTop: Metrics.x1,
},

createModalTitle: {
  fontSize: 20,
  fontWeight: "800" as const,
  color: "#171717",
},

createModalSubtitle: {
  fontSize: 13,
  lineHeight: 19,
  color: Colors.subtext,
  marginTop: Metrics.x1,
},

createSectionInput: {
  backgroundColor: "#FFFFFF",
},

createSectionInputOutline: {
  borderRadius: 12,
},

createSectionError: {
  fontSize: 12,
  lineHeight: 18,
  color: Colors.error,
  marginTop: Metrics.x2,
},

createModalActions: {
  flexDirection: "row" as const,
  justifyContent: "flex-end" as const,
  alignItems: "center" as const,
  gap: Metrics.x2,
  marginTop: Metrics.x4,
},

createCancelButton: {
  borderRadius: 12,
},

createSubmitButton: {
  borderRadius: 12,
},

    backButton: {
      width: 38,
      height: 38,
      borderRadius: 12,
      alignItems: "center" as const,
      justifyContent: "center" as const,
      backgroundColor: "#F3F4F6",
      marginRight: Metrics.x2,
    },

    backIcon: {
      fontSize: 28,
      lineHeight: 30,
      color: Colors.subtext,
    },

    navbarLogo: {
      backgroundColor:
        Colors.brandPrimary,
      marginRight: Metrics.x2,
    },

    navbarBrand: {
      flex: 1,
      minWidth: 0,
    },

    navbarSchoolName: {
      fontSize: 15,
      fontWeight: "800" as const,
      color: "#171717",
    },

    navbarSubtitle: {
      fontSize: 11,
      color: Colors.subtext,
      marginTop: 2,
    },

    navbarRight: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      marginLeft: Metrics.x2,
    },

    refreshButton: {
      margin: 0,
      marginRight: Metrics.x1,
    },

    /* ======================================================
       PROFILE
    ====================================================== */

    profileButton: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      paddingVertical: Metrics.x1,
      paddingHorizontal: Metrics.x1,
      borderRadius: 24,
    },

    profileButtonActive: {
      backgroundColor: "#F4F5F9",
    },

    profileAvatar: {
      backgroundColor:
        Colors.brandPrimary,
    },

    profileDetails: {
      marginLeft: Metrics.x2,
      maxWidth: 145,
    },

    profileName: {
      fontSize: 13,
      fontWeight: "700" as const,
      color: "#171717",
    },

    profileRole: {
      fontSize: 11,
      color: Colors.subtext,
      marginTop: 1,
    },

    profileArrow: {
      fontSize: 17,
      color: Colors.subtext,
      marginLeft: Metrics.x1,
    },

    /* ======================================================
       PAGE HEADER
    ====================================================== */

    pageHeader: {
      marginBottom: Metrics.x5,
    },

    pageHeaderTop: {
      flexDirection: "row" as const,
      alignItems: "flex-start" as const,
      justifyContent:
        "space-between" as const,
    },

    pageHeaderText: {
      flex: 1,
      paddingRight: Metrics.x3,
    },

    eyebrow: {
      fontSize: 10,
      fontWeight: "800" as const,
      letterSpacing: 1,
      color: Colors.brandPrimary,
      marginBottom: Metrics.x1,
    },

    pageTitle: {
      fontSize: 30,
      fontWeight: "800" as const,
      color: "#171717",
    },

    pageSubtitle: {
      fontSize: 14,
      lineHeight: 21,
      color: Colors.subtext,
      marginTop: Metrics.x1,
      maxWidth: 650,
    },

    backToClassesButton: {
      borderRadius: 12,
    },

    backToClassesContent: {
      minHeight: 44,
    },

    /* ======================================================
       CLASS HERO
    ====================================================== */

    classHero: {
      backgroundColor:
        Colors.brandPrimary,
      borderRadius: 18,
      marginBottom: Metrics.x4,
      elevation: 2,
    },

    classHeroRow: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      justifyContent:
        "space-between" as const,
    },

    classHeroLeft: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      flex: 1,
    },

    classHeroIcon: {
      backgroundColor:
        "rgba(255,255,255,0.14)",
      marginRight: Metrics.x3,
    },

    classHeroInfo: {
      flex: 1,
    },

    classHeroEyebrow: {
      fontSize: 10,
      fontWeight: "800" as const,
      letterSpacing: 1,
      color:
        "rgba(255,255,255,0.72)",
      marginBottom: 2,
    },

    classHeroTitle: {
      fontSize: 23,
      fontWeight: "800" as const,
      color: "#FFFFFF",
    },

    classHeroSubtitle: {
      fontSize: 13,
      color:
        "rgba(255,255,255,0.78)",
      marginTop: 2,
    },

    classHeroStats: {
      flexDirection: "row" as const,
      gap: 8,
    },

    classHeroBadge: {
      minWidth: 70,
      paddingVertical: Metrics.x2,
      paddingHorizontal: Metrics.x2,
      borderRadius: 14,
      alignItems: "center" as const,
      justifyContent: "center" as const,
      backgroundColor:
        "rgba(255,255,255,0.14)",
    },

    classHeroBadgeValue: {
      fontSize: 22,
      fontWeight: "800" as const,
      color: "#FFFFFF",
    },

    classHeroBadgeLabel: {
      fontSize: 10,
      color:
        "rgba(255,255,255,0.75)",
      marginTop: 1,
    },

    /* ======================================================
       INFO CARD
    ====================================================== */

    infoCard: {
      backgroundColor: "#FFFFFF",
      borderRadius: 18,
      borderWidth: 1,
      borderColor: "#E9EAF0",
      elevation: 1,
      marginBottom: Metrics.x4,
    },

    cardTitle: {
      fontSize: 17,
      fontWeight: "800" as const,
      color: "#171717",
    },

    cardSubtitle: {
      fontSize: 12,
      color: Colors.subtext,
      marginTop: 2,
      marginBottom: Metrics.x3,
    },

    feeGrid: {
      flexDirection: "row" as const,
      flexWrap: "wrap" as const,
    },

    /* ======================================================
       SEARCH
    ====================================================== */

    searchCard: {
      backgroundColor: "#FFFFFF",
      borderRadius: 18,
      borderWidth: 1,
      borderColor: "#E9EAF0",
      elevation: 1,
      marginBottom: Metrics.x5,
    },

    searchHeader: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      justifyContent:
        "space-between" as const,
      marginBottom: Metrics.x3,
    },

    searchHeaderText: {
      flex: 1,
    },

    searchTitle: {
      fontSize: 17,
      fontWeight: "800" as const,
      color: "#171717",
    },

    searchSubtitle: {
      fontSize: 12,
      color: Colors.subtext,
      marginTop: 2,
    },

    clearSearch: {
      fontSize: 13,
      fontWeight: "700" as const,
      color: Colors.brandPrimary,
    },

    searchInput: {
      backgroundColor: "#FFFFFF",
    },

    searchOutline: {
      borderRadius: 12,
    },

    /* ======================================================
       SECTIONS HEADER
    ====================================================== */

    sectionHeader: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      justifyContent:
        "space-between" as const,
      marginBottom: Metrics.x3,
    },

    sectionHeaderText: {
      flex: 1,
    },

    sectionTitle: {
      fontSize: 20,
      fontWeight: "800" as const,
      color: "#171717",
    },

    sectionSubtitle: {
      fontSize: 12,
      color: Colors.subtext,
      marginTop: 2,
    },

    sectionCountBadge: {
      minWidth: 38,
      height: 36,
      paddingHorizontal: Metrics.x2,
      borderRadius: 12,
      alignItems: "center" as const,
      justifyContent: "center" as const,
      backgroundColor: "#EEF2FF",
    },

    sectionCountText: {
      fontSize: 13,
      fontWeight: "800" as const,
      color: "#4F46E5",
    },

    /* ======================================================
       SECTION CARD
    ====================================================== */

    sectionTouchable: {
      marginBottom: Metrics.x3,
    },

    sectionCard: {
      backgroundColor: "#FFFFFF",
      borderRadius: 18,
      borderWidth: 1,
      borderColor: "#E9EAF0",
      elevation: 1,
    },

    sectionRow: {
      minHeight: 86,
      flexDirection: "row" as const,
      alignItems: "center" as const,
    },

    sectionAvatar: {
      backgroundColor: "#EEF2FF",
      marginRight: Metrics.x3,
    },

    sectionInfo: {
      flex: 1,
      minWidth: 0,
    },

    sectionName: {
      fontSize: 17,
      fontWeight: "800" as const,
      color: "#171717",
    },

    teacherRow: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      marginTop: Metrics.x1,
    },

    teacherLabel: {
      fontSize: 11,
      color: Colors.subtext,
      marginRight: Metrics.x1,
    },

    teacherValue: {
      fontSize: 12,
      fontWeight: "700" as const,
      color: "#4B5563",
      flexShrink: 1,
    },

    studentCountRow: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      marginTop: 4,
    },

    studentCountIcon: {
      fontSize: 12,
      marginRight: 4,
    },

    studentCountText: {
      fontSize: 11,
      color: Colors.subtext,
    },

    sectionRight: {
      marginLeft: Metrics.x2,
      alignItems: "flex-end" as const,
    },

    teacherStatus: {
      paddingHorizontal: 9,
      paddingVertical: 5,
      borderRadius: 20,
      marginBottom: 7,
    },

    teacherAssigned: {
      backgroundColor: "#ECFDF3",
    },

    teacherUnassigned: {
      backgroundColor: "#FFF7ED",
    },

    teacherStatusText: {
      fontSize: 10,
      fontWeight: "800" as const,
    },

    teacherAssignedText: {
      color: "#16803C",
    },

    teacherUnassignedText: {
      color: "#C2410C",
    },

    sectionArrow: {
      width: 36,
      height: 36,
      borderRadius: 11,
      alignItems: "center" as const,
      justifyContent: "center" as const,
      backgroundColor: "#F3F4F6",
    },

    sectionArrowText: {
      fontSize: 19,
      color: Colors.subtext,
    },

    /* ======================================================
       EMPTY
    ====================================================== */

    empty: {
      alignItems: "center" as const,
      justifyContent: "center" as const,
      paddingTop: Metrics.x8,
      paddingBottom: Metrics.x8,
      paddingHorizontal: Metrics.x5,
    },

    emptyIcon: {
      backgroundColor: "#EEF2FF",
      marginBottom: Metrics.x3,
    },

    emptyTitle: {
      fontSize: 18,
      fontWeight: "800" as const,
      color: "#171717",
      textAlign: "center" as const,
    },

    emptyText: {
      fontSize: 13,
      lineHeight: 19,
      color: Colors.subtext,
      textAlign: "center" as const,
      marginTop: Metrics.x1,
      maxWidth: 380,
    },

    emptyButton: {
      marginTop: Metrics.x3,
      borderRadius: 12,
    },

    /* ======================================================
       LOADING
    ====================================================== */

    loadingScreen: {
      flex: 1,
      paddingTop: Metrics.x3,
    },

    loaderContent: {
      flex: 1,
      alignItems: "center" as const,
      justifyContent: "center" as const,
      paddingBottom: Metrics.x8,
    },

    loadingIcon: {
      backgroundColor: "#EEF2FF",
      marginBottom: Metrics.x3,
    },

    loader: {
      marginBottom: Metrics.x2,
    },

    loadingTitle: {
      fontSize: 17,
      fontWeight: "800" as const,
      color: "#171717",
    },

    loadingText: {
      fontSize: 13,
      color: Colors.subtext,
      marginTop: Metrics.x1,
      textAlign: "center" as const,
    },

    /* ======================================================
       PROFILE DROPDOWN
    ====================================================== */

    modalOverlay: {
      flex: 1,
      backgroundColor:
        "rgba(0,0,0,0.08)",
    },

    profileDropdown: {
      position: "absolute" as const,
      top: 82,
      right: Metrics.x4,
      width: 310,
      backgroundColor: "#FFFFFF",
      borderRadius: 18,
      borderWidth: 1,
      borderColor: "#E5E7EB",
      padding: Metrics.x2,
      elevation: 8,
    },

    profileDropdownMobile: {
      left: Metrics.x3,
      right: Metrics.x3,
      width: undefined,
    },

    dropdownProfileHeader: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      padding: Metrics.x2,
    },

    dropdownAvatar: {
      backgroundColor:
        Colors.brandPrimary,
    },

    dropdownUserInfo: {
      flex: 1,
      marginLeft: Metrics.x2,
    },

    dropdownUserName: {
      fontSize: 15,
      fontWeight: "800" as const,
      color: "#171717",
    },

    dropdownUserEmail: {
      fontSize: 12,
      color: Colors.subtext,
      marginTop: 2,
    },

    dropdownUserRole: {
      fontSize: 11,
      color: Colors.brandPrimary,
      fontWeight: "700" as const,
      marginTop: 3,
    },

    dropdownDivider: {
      marginVertical: Metrics.x1,
    },

    dropdownItem: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      paddingVertical: Metrics.x2,
      paddingHorizontal: Metrics.x1,
      borderRadius: 12,
    },

    dropdownIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: "center" as const,
      justifyContent: "center" as const,
      backgroundColor: "#F3F4F6",
    },

    dropdownIcon: {
      fontSize: 18,
    },

    dropdownItemTextContainer: {
      flex: 1,
      marginLeft: Metrics.x2,
    },

    dropdownItemTitle: {
      fontSize: 14,
      fontWeight: "700" as const,
      color: "#171717",
    },

    dropdownItemSubtitle: {
      fontSize: 11,
      color: Colors.subtext,
      marginTop: 2,
    },

    logoutItem: {
      marginTop: Metrics.x1,
      backgroundColor: "#FFF5F5",
    },

    logoutIconContainer: {
      backgroundColor: "#FDECEC",
    },

    logoutIcon: {
      color: "#D64545",
    },

    logoutTitle: {
      color: "#D64545",
    },

    /* ======================================================
       SNACKBAR
    ====================================================== */

    snackbar: {
      backgroundColor:
        Colors.errorBg,
    },

    /* ======================================================
       CENTER
    ====================================================== */

    center: {
      flex: 1,
      justifyContent: "center" as const,
      alignItems: "center" as const,
      padding: Metrics.x5,
      backgroundColor: "#F7F8FC",
    },

    errorText: {
      color: Colors.error,
      textAlign: "center" as const,
      fontSize: 16,
    },

  })
);

/* ============================================================
   EXPORT
============================================================ */

export {
  PrincipalClassDetailsScreen,
};