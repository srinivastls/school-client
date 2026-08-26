import React, {
  useMemo,
  useState,
} from "react";

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
  useQuery,
} from "react-query";

import {
  RootStackParamList,
  RootStackScreenNames,
} from "../../types";

import {
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";

import {
  useNavigation,
} from "@react-navigation/native";

import {
  studentServices,
} from "../../services/studentServices";

import {
  Colors,
  makeStyles,
  Metrics,
} from "../../theme";

import {
  useUserStore,
} from "../../store";


/* ============================================================
   TYPES
============================================================ */

type ClassData = {
  classNumber: string;
  count: string;
};


/* ============================================================
   SCREEN
============================================================ */

const PrincipalStudentsScreen = () => {
  const styles = useStyles();

  const navigation =
    useNavigation<
      NativeStackNavigationProp<
        RootStackParamList
      >
    >();

  const { width } =
    useWindowDimensions();

  /* ==========================================================
     RESPONSIVE
  ========================================================== */

  const isSmallScreen =
    width < 600;

  const isTablet =
    width >= 600 &&
    width < 1024;

  const isDesktop =
    width >= 1024;

  const horizontalPadding =
    isSmallScreen
      ? Metrics.x3
      : isTablet
        ? Metrics.x4
        : Metrics.x6;


  /* ==========================================================
     USER
  ========================================================== */

  const user =
    useUserStore(
      (state) => state.user
    );

  const logout =
    useUserStore(
      (state) => state.logout
    );


  /* ==========================================================
     STATE
  ========================================================== */

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    showSnackbar,
    setShowSnackbar,
  ] = useState(false);

  const [
    snackbarText,
    setSnackbarText,
  ] = useState("");

  const [
    profileMenuVisible,
    setProfileMenuVisible,
  ] = useState(false);


  /* ==========================================================
     AUTHORIZATION
  ========================================================== */

  if (!user) {
    return (
      <View style={styles.center}>
        <Text
          style={styles.errorText}
        >
          Session not found.
        </Text>
      </View>
    );
  }

  if (user.role !== "PRINCIPAL") {
    return (
      <View style={styles.center}>
        <Text
          style={styles.errorText}
        >
          You are not authorized to
          access the Principal Students
          screen.
        </Text>
      </View>
    );
  }


  /* ==========================================================
     QUERY
  ========================================================== */

  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery(
    [
      "principal-class-student-counts",
    ],
    studentServices
      .getClassStudentCounts
  );


  /* ==========================================================
     ERROR
  ========================================================== */

  React.useEffect(() => {
    if (!error) {
      return;
    }

    setSnackbarText(
      // @ts-ignore
      error?.response?.data?.message ??
        "Unable to load student information."
    );

    setShowSnackbar(true);
  }, [error]);


  /* ==========================================================
     CLASS DATA
  ========================================================== */

  const classData =
    (data?.countData ??
      []) as ClassData[];


  /* ==========================================================
     SEARCH
  ========================================================== */

  const searchValue =
    search
      .trim()
      .toLowerCase();

  const filteredClasses =
    useMemo(() => {
      if (!searchValue) {
        return classData;
      }

      return classData.filter(
        (item) =>
          item.classNumber
            .toLowerCase()
            .includes(
              searchValue
            )
      );
    }, [
      classData,
      searchValue,
    ]);


  /* ==========================================================
     TOTAL STUDENTS
  ========================================================== */

  const totalStudents =
    useMemo(() => {
      return classData.reduce(
        (total, item) =>
          total +
          Number(item.count || 0),
        0
      );
    }, [classData]);


  /* ==========================================================
     LOGOUT
  ========================================================== */

  const handleLogout = () => {
    setProfileMenuVisible(
      false
    );

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
     BACK TO DASHBOARD
  ========================================================== */

  const goToDashboard = () => {
    navigation.navigate(
      RootStackScreenNames.PrincipalDashboard
    );
  };


  /* ==========================================================
     REGISTER STUDENT
  ========================================================== */

  const openStudentRegistration =
    () => {
      navigation.navigate(
        RootStackScreenNames.StudentRegistrationForm
      );
    };


  /* ==========================================================
     PROFILE DROPDOWN
  ========================================================== */

  const renderProfileDropdown =
    () => {
      if (!profileMenuVisible) {
        return null;
      }

      return (
        <Modal
          visible={
            profileMenuVisible
          }
          transparent
          animationType="fade"
          statusBarTranslucent
          onRequestClose={() => {
            setProfileMenuVisible(
              false
            );
          }}
        >
          <Pressable
            style={
              styles.modalOverlay
            }
            onPress={() => {
              setProfileMenuVisible(
                false
              );
            }}
          >
            <View
              style={[
                styles.profileDropdown,
                isSmallScreen &&
                  styles.profileDropdownMobile,
              ]}
            >

              {/* PROFILE HEADER */}

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
                    {user.name ||
                      "Principal"}
                  </Text>

                  <Text
                    style={
                      styles.dropdownUserEmail
                    }
                    numberOfLines={1}
                  >
                    {user.email || ""}
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

              {/* PROFILE */}

              <TouchableOpacity
                activeOpacity={0.7}
                style={
                  styles.dropdownItem
                }
                onPress={() => {
                  setProfileMenuVisible(
                    false
                  );

                  setSnackbarText(
                    "Principal profile coming next."
                  );

                  setShowSnackbar(
                    true
                  );
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


              {/* LOGOUT */}

              <TouchableOpacity
                activeOpacity={0.7}
                style={[
                  styles.dropdownItem,
                  styles.logoutItem,
                ]}
                onPress={
                  handleLogout
                }
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
     NAVBAR
  ========================================================== */

  const renderNavbar =
    () => {
      return (
        <View
          style={
            styles.navbar
          }
        >

          {/* LEFT */}

          <View
            style={
              styles.navbarLeft
            }
          >

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={
                goToDashboard
              }
              style={
                styles.backButton
              }
            >

              <Text
                style={
                  styles.backIcon
                }
              >
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
              style={
                styles.navbarLogo
              }
            />

            <View
              style={
                styles.navbarBrand
              }
            >

              <Text
                style={
                  styles.navbarSchoolName
                }
                numberOfLines={1}
              >
                {user.schoolName ||
                  "School Platform"}
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

          <View
            style={
              styles.navbarRight
            }
          >

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
              onPress={() => {
                refetch();
              }}
              style={
                styles.refreshButton
              }
            />

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                setProfileMenuVisible(
                  true
                );
              }}
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
                    {user.name ||
                      "Principal"}
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
     PAGE HEADER
  ========================================================== */

  const renderPageHeader =
    () => {
      return (
        <View
          style={
            styles.pageHeader
          }
        >

          <View
            style={
              styles.pageHeaderText
            }
          >

            <Text
              style={
                styles.eyebrow
              }
            >
              PEOPLE & USERS
            </Text>

            <Text
              style={
                styles.pageTitle
              }
            >
              Students
            </Text>

            <Text
              style={
                styles.pageSubtitle
              }
            >
              Manage students across all
              classes in your school.
            </Text>

          </View>

          <Button
            mode="contained"
            icon="account-plus"
            onPress={
              openStudentRegistration
            }
            style={
              styles.registerButton
            }
            contentStyle={
              styles.registerButtonContent
            }
          >
            Register Student
          </Button>

        </View>
      );
    };


  /* ==========================================================
     SUMMARY CARDS
  ========================================================== */

  const renderSummary =
    () => {
      return (
        <View
          style={[
            styles.summaryGrid,
            isSmallScreen &&
              styles.summaryGridMobile,
          ]}
        >

          {/* TOTAL STUDENTS */}

          <Card
            style={
              styles.summaryCard
            }
          >

            <Card.Content>

              <View
                style={
                  styles.summaryTop
                }
              >

                <Avatar.Icon
                  size={44}
                  icon="account-group-outline"
                  color="#4F46E5"
                  style={[
                    styles.summaryIcon,
                    {
                      backgroundColor:
                        "#EEF2FF",
                    },
                  ]}
                />

              </View>

              <Text
                style={
                  styles.summaryValue
                }
              >
                {formatNumber(
                  totalStudents
                )}
              </Text>

              <Text
                style={
                  styles.summaryLabel
                }
              >
                Total Students
              </Text>

            </Card.Content>

          </Card>


          {/* CLASSES */}

          <Card
            style={
              styles.summaryCard
            }
          >

            <Card.Content>

              <View
                style={
                  styles.summaryTop
                }
              >

                <Avatar.Icon
                  size={44}
                  icon="google-classroom"
                  color="#16834B"
                  style={[
                    styles.summaryIcon,
                    {
                      backgroundColor:
                        "#EFFAF5",
                    },
                  ]}
                />

              </View>

              <Text
                style={
                  styles.summaryValue
                }
              >
                {classData.length}
              </Text>

              <Text
                style={
                  styles.summaryLabel
                }
              >
                Classes
              </Text>

            </Card.Content>

          </Card>


          {/* SCHOOL CODE */}

          <Card
            style={
              styles.summaryCard
            }
          >

            <Card.Content>

              <View
                style={
                  styles.summaryTop
                }
              >

                <Avatar.Icon
                  size={44}
                  icon="identifier"
                  color="#C55A11"
                  style={[
                    styles.summaryIcon,
                    {
                      backgroundColor:
                        "#FFF5ED",
                    },
                  ]}
                />

              </View>

              <Text
                style={
                  styles.summaryCode
                }
                numberOfLines={1}
              >
                {user.schoolCode ||
                  "N/A"}
              </Text>

              <Text
                style={
                  styles.summaryLabel
                }
              >
                School Code
              </Text>

            </Card.Content>

          </Card>

        </View>
      );
    };


  /* ==========================================================
     SEARCH
  ========================================================== */

  const renderSearch =
    () => {
      return (
        <Card
          style={
            styles.searchCard
          }
        >

          <Card.Content>

            <View
              style={
                styles.searchHeader
              }
            >

              <View
                style={
                  styles.searchHeaderText
                }
              >

                <Text
                  style={
                    styles.searchTitle
                  }
                >
                  Find a Class
                </Text>

                <Text
                  style={
                    styles.searchSubtitle
                  }
                >
                  Search by class number
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
              label="Search class"
              placeholder="Enter class number"
              value={search}
              onChangeText={
                setSearch
              }
              autoCapitalize="characters"
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
     CLASS ITEM
  ========================================================== */

  const renderClass = ({
    item,
  }: {
    item: ClassData;
  }) => {
    const studentCount =
      Number(
        item.count || 0
      );

    return (
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={() => {
          navigation.navigate(
            RootStackScreenNames.PrincipalClassStudents,
            {
              classNumber:
                item.classNumber,
            }
          );
        }}
        style={
          styles.classTouchable
        }
      >

        <Card
          style={
            styles.classCard
          }
        >

          <Card.Content>

            <View
              style={
                styles.classCardRow
              }
            >

              {/* ICON */}

              <Avatar.Icon
                size={50}
                icon="google-classroom"
                color="#4F46E5"
                style={
                  styles.classIcon
                }
              />


              {/* INFO */}

              <View
                style={
                  styles.classInfo
                }
              >

                <Text
                  style={
                    styles.classTitle
                  }
                >
                  Class{" "}
                  {item.classNumber}
                </Text>

                <Text
                  style={
                    styles.classSubtitle
                  }
                >
                  {formatNumber(
                    studentCount
                  )}{" "}
                  student
                  {studentCount === 1
                    ? ""
                    : "s"}
                </Text>

              </View>


              {/* RIGHT */}

              <View
                style={
                  styles.classRight
                }
              >

                <View
                  style={
                    styles.studentBadge
                  }
                >

                  <Text
                    style={
                      styles.studentBadgeText
                    }
                  >
                    {studentCount}
                  </Text>

                </View>

                <Text
                  style={
                    styles.classArrow
                  }
                >
                  →
                </Text>

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

  const renderEmpty =
    () => {
      return (
        <View
          style={
            styles.empty
          }
        >

          <View
            style={
              styles.emptyIconContainer
            }
          >

            <Avatar.Icon
              size={64}
              icon={
                searchValue
                  ? "magnify"
                  : "school-outline"
              }
              color="#4F46E5"
              style={
                styles.emptyIcon
              }
            />

          </View>

          <Text
            style={
              styles.emptyTitle
            }
          >
            {searchValue
              ? "No matching classes"
              : "No classes found"}
          </Text>

          <Text
            style={
              styles.emptyText
            }
          >
            {searchValue
              ? "Try a different class number."
              : "There are currently no class records available."}
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
     LOADING
  ========================================================== */

  if (isLoading) {
    return (
      <View
        style={
          styles.page
        }
      >

        <View
          style={[
            styles.loadingScreen,
            {
              paddingHorizontal:
                horizontalPadding,
            },
          ]}
        >

          {renderNavbar()}

          <View
            style={
              styles.loaderContent
            }
          >

            <Avatar.Icon
              size={64}
              icon="school-outline"
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
              style={
                styles.loader
              }
            />

            <Text
              style={
                styles.loadingTitle
              }
            >
              Loading students...
            </Text>

            <Text
              style={
                styles.loadingText
              }
            >
              Fetching student information
              for your school.
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
    <View
      style={
        styles.page
      }
    >

      <FlatList
        data={
          filteredClasses
        }
        renderItem={
          renderClass
        }
        keyExtractor={(item) =>
          item.classNumber
        }
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={[
          styles.listContent,
          {
            paddingHorizontal:
              horizontalPadding,
          },
        ]}
        ListHeaderComponent={
          <>
            {renderNavbar()}
            {renderPageHeader()}
            {renderSummary()}
            {renderSearch()}

            {filteredClasses.length >
              0 && (
              <View
                style={
                  styles.classesHeader
                }
              >

                <View>
                  <Text
                    style={
                      styles.classesTitle
                    }
                  >
                    Classes
                  </Text>

                  <Text
                    style={
                      styles.classesSubtitle
                    }
                  >
                    Select a class to view
                    its students.
                  </Text>
                </View>

                <View
                  style={
                    styles.classesCountBadge
                  }
                >

                  <Text
                    style={
                      styles.classesCountText
                    }
                  >
                    {filteredClasses.length}
                  </Text>

                </View>

              </View>
            )}
          </>
        }
        ListEmptyComponent={
          renderEmpty()
        }
        refreshing={
          isFetching
        }
        onRefresh={
          refetch
        }
      />

      {renderProfileDropdown()}

      <Snackbar
        visible={
          showSnackbar
        }
        onDismiss={() => {
          setShowSnackbar(
            false
          );
        }}
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
    parts[
      parts.length - 1
    ][0]
  ).toUpperCase();
};


/* ============================================================
   NUMBER FORMAT
============================================================ */

const formatNumber = (
  value: number
) => {
  return new Intl.NumberFormat(
    "en-IN"
  ).format(value);
};


/* ============================================================
   STYLES
============================================================ */

const useStyles = makeStyles(
  () => {
    return {

      /* ======================================================
         PAGE
      ====================================================== */

      page: {
        flex: 1,
        backgroundColor:
          "#F7F8FC",
      },

      listContent: {
        paddingTop:
          Metrics.x3,

        paddingBottom:
          Metrics.x8,
      },


      /* ======================================================
         NAVBAR
      ====================================================== */

      navbar: {
        minHeight: 72,

        paddingHorizontal:
          Metrics.x3,

        paddingVertical:
          Metrics.x2,

        flexDirection: "row",

        alignItems: "center",

        justifyContent:
          "space-between",

        backgroundColor:
          "#FFFFFF",

        borderWidth: 1,

        borderColor:
          "#E9EAF0",

        borderRadius: 16,

        marginBottom:
          Metrics.x5,

        elevation: 1,
      },

      navbarLeft: {
        flexDirection:
          "row",

        alignItems:
          "center",

        flex: 1,

        minWidth: 0,
      },

      backButton: {
        width: 38,

        height: 38,

        borderRadius: 12,

        alignItems:
          "center",

        justifyContent:
          "center",

        backgroundColor:
          "#F3F4F6",

        marginRight:
          Metrics.x2,
      },

      backIcon: {
        fontSize: 28,

        lineHeight: 30,

        color:
          Colors.subtext,
      },

      navbarLogo: {
        backgroundColor:
          Colors.brandPrimary,

        marginRight:
          Metrics.x2,
      },

      navbarBrand: {
        flex: 1,

        minWidth: 0,
      },

      navbarSchoolName: {
        fontSize: 15,

        fontWeight: "800",

        color: "#171717",
      },

      navbarSubtitle: {
        fontSize: 11,

        color:
          Colors.subtext,

        marginTop: 2,
      },

      navbarRight: {
        flexDirection:
          "row",

        alignItems:
          "center",

        marginLeft:
          Metrics.x2,
      },

      refreshButton: {
        margin: 0,

        marginRight:
          Metrics.x1,
      },


      /* ======================================================
         PROFILE
      ====================================================== */

      profileButton: {
        flexDirection:
          "row",

        alignItems:
          "center",

        paddingVertical:
          Metrics.x1,

        paddingHorizontal:
          Metrics.x1,

        borderRadius: 24,
      },

      profileButtonActive: {
        backgroundColor:
          "#F4F5F9",
      },

      profileAvatar: {
        backgroundColor:
          Colors.brandPrimary,
      },

      profileDetails: {
        marginLeft:
          Metrics.x2,

        maxWidth: 145,
      },

      profileName: {
        fontSize: 13,

        fontWeight: "700",

        color: "#171717",
      },

      profileRole: {
        fontSize: 11,

        color:
          Colors.subtext,

        marginTop: 1,
      },

      profileArrow: {
        fontSize: 17,

        color:
          Colors.subtext,

        marginLeft:
          Metrics.x1,
      },


      /* ======================================================
         PAGE HEADER
      ====================================================== */

      pageHeader: {
        marginBottom:
          Metrics.x5,
      },

      pageHeaderText: {
        marginBottom:
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

      pageTitle: {
        fontSize: 30,

        fontWeight: "800",

        color: "#171717",
      },

      pageSubtitle: {
        fontSize: 14,

        lineHeight: 21,

        color:
          Colors.subtext,

        marginTop:
          Metrics.x1,

        maxWidth: 650,
      },

      registerButton: {
        borderRadius: 14,
      },

      registerButtonContent: {
        minHeight: 48,
      },


      /* ======================================================
         SUMMARY
      ====================================================== */

      summaryGrid: {
        flexDirection:
          "row",

        marginHorizontal:
          -Metrics.x2,

        marginBottom:
          Metrics.x5,
      },

      summaryGridMobile: {
        flexDirection:
          "column",
      },

      summaryCard: {
        flex: 1,

        marginHorizontal:
          Metrics.x2,

        marginBottom:
          Metrics.x2,

        backgroundColor:
          "#FFFFFF",

        borderRadius: 18,

        borderWidth: 1,

        borderColor:
          "#E9EAF0",

        elevation: 1,
      },

      summaryTop: {
        marginBottom:
          Metrics.x2,
      },

      summaryIcon: {
        margin: 0,
      },

      summaryValue: {
        fontSize: 25,

        fontWeight: "800",

        color: "#171717",
      },

      summaryCode: {
        fontSize: 20,

        fontWeight: "800",

        color: "#171717",

        marginTop: 5,
      },

      summaryLabel: {
        fontSize: 12,

        color:
          Colors.subtext,

        marginTop: 3,
      },


      /* ======================================================
         SEARCH
      ====================================================== */

      searchCard: {
        backgroundColor:
          "#FFFFFF",

        borderRadius: 18,

        borderWidth: 1,

        borderColor:
          "#E9EAF0",

        elevation: 1,

        marginBottom:
          Metrics.x5,
      },

      searchHeader: {
        flexDirection:
          "row",

        alignItems:
          "center",

        justifyContent:
          "space-between",

        marginBottom:
          Metrics.x3,
      },

      searchHeaderText: {
        flex: 1,
      },

      searchTitle: {
        fontSize: 17,

        fontWeight: "800",

        color: "#171717",
      },

      searchSubtitle: {
        fontSize: 12,

        color:
          Colors.subtext,

        marginTop: 2,
      },

      clearSearch: {
        fontSize: 13,

        fontWeight: "700",

        color:
          Colors.brandPrimary,
      },

      searchInput: {
        backgroundColor:
          "#FFFFFF",
      },

      searchOutline: {
        borderRadius: 12,
      },


      /* ======================================================
         CLASSES HEADER
      ====================================================== */

      classesHeader: {
        flexDirection:
          "row",

        alignItems:
          "center",

        justifyContent:
          "space-between",

        marginBottom:
          Metrics.x3,
      },

      classesTitle: {
        fontSize: 20,

        fontWeight: "800",

        color: "#171717",
      },

      classesSubtitle: {
        fontSize: 12,

        color:
          Colors.subtext,

        marginTop: 2,
      },

      classesCountBadge: {
        minWidth: 36,

        height: 36,

        paddingHorizontal:
          Metrics.x2,

        borderRadius: 12,

        alignItems:
          "center",

        justifyContent:
          "center",

        backgroundColor:
          "#EEF2FF",
      },

      classesCountText: {
        fontSize: 13,

        fontWeight: "800",

        color:
          "#4F46E5",
      },


      /* ======================================================
         CLASS CARD
      ====================================================== */

      classTouchable: {
        marginBottom:
          Metrics.x3,
      },

      classCard: {
        backgroundColor:
          "#FFFFFF",

        borderRadius: 18,

        borderWidth: 1,

        borderColor:
          "#E9EAF0",

        elevation: 1,
      },

      classCardRow: {
        flexDirection:
          "row",

        alignItems:
          "center",

        minHeight: 78,
      },

      classIcon: {
        backgroundColor:
          "#EEF2FF",

        marginRight:
          Metrics.x3,
      },

      classInfo: {
        flex: 1,

        minWidth: 0,
      },

      classTitle: {
        fontSize: 17,

        fontWeight: "800",

        color: "#171717",
      },

      classSubtitle: {
        fontSize: 13,

        color:
          Colors.subtext,

        marginTop:
          Metrics.x1,
      },

      classRight: {
        flexDirection:
          "row",

        alignItems:
          "center",

        marginLeft:
          Metrics.x2,
      },

      studentBadge: {
        minWidth: 42,

        height: 32,

        paddingHorizontal:
          Metrics.x2,

        borderRadius: 10,

        alignItems:
          "center",

        justifyContent:
          "center",

        backgroundColor:
          "#F3F4F6",
      },

      studentBadgeText: {
        fontSize: 12,

        fontWeight: "800",

        color: "#374151",
      },

      classArrow: {
        fontSize: 22,

        color:
          Colors.subtext,

        marginLeft:
          Metrics.x2,
      },


      /* ======================================================
         EMPTY
      ====================================================== */

      empty: {
        alignItems:
          "center",

        justifyContent:
          "center",

        paddingTop:
          Metrics.x8,

        paddingBottom:
          Metrics.x8,

        paddingHorizontal:
          Metrics.x5,
      },

      emptyIconContainer: {
        marginBottom:
          Metrics.x3,
      },

      emptyIcon: {
        backgroundColor:
          "#EEF2FF",
      },

      emptyTitle: {
        fontSize: 18,

        fontWeight: "800",

        color: "#171717",

        textAlign:
          "center",
      },

      emptyText: {
        color:
          Colors.subtext,

        fontSize: 13,

        lineHeight: 19,

        marginTop:
          Metrics.x1,

        textAlign:
          "center",

        maxWidth: 350,
      },

      emptyButton: {
        marginTop:
          Metrics.x3,

        borderRadius: 12,
      },


      /* ======================================================
         LOADING
      ====================================================== */

      loadingScreen: {
        flex: 1,

        paddingTop:
          Metrics.x3,
      },

      loaderContent: {
        flex: 1,

        alignItems:
          "center",

        justifyContent:
          "center",

        paddingBottom:
          Metrics.x8,
      },

      loadingIcon: {
        backgroundColor:
          "#EEF2FF",

        marginBottom:
          Metrics.x3,
      },

      loader: {
        marginBottom:
          Metrics.x2,
      },

      loadingTitle: {
        fontSize: 17,

        fontWeight: "800",

        color: "#171717",
      },

      loadingText: {
        fontSize: 13,

        color:
          Colors.subtext,

        marginTop:
          Metrics.x1,

        textAlign:
          "center",
      },


      /* ======================================================
         PROFILE MODAL
      ====================================================== */

      modalOverlay: {
        flex: 1,

        backgroundColor:
          "rgba(0,0,0,0.08)",
      },

      profileDropdown: {
        position: "absolute",

        top: 82,

        right: Metrics.x4,

        width: 310,

        backgroundColor:
          "#FFFFFF",

        borderRadius: 18,

        borderWidth: 1,

        borderColor:
          "#E5E7EB",

        padding:
          Metrics.x2,

        elevation: 8,
      },

      profileDropdownMobile: {
        left: Metrics.x3,

        right: Metrics.x3,

        width: undefined,
      },

      dropdownProfileHeader: {
        flexDirection:
          "row",

        alignItems:
          "center",

        padding:
          Metrics.x2,
      },

      dropdownAvatar: {
        backgroundColor:
          Colors.brandPrimary,
      },

      dropdownUserInfo: {
        flex: 1,

        marginLeft:
          Metrics.x2,
      },

      dropdownUserName: {
        fontSize: 15,

        fontWeight: "800",

        color: "#171717",
      },

      dropdownUserEmail: {
        fontSize: 12,

        color:
          Colors.subtext,

        marginTop: 2,
      },

      dropdownUserRole: {
        fontSize: 11,

        color:
          Colors.brandPrimary,

        fontWeight: "700",

        marginTop: 3,
      },

      dropdownDivider: {
        marginVertical:
          Metrics.x1,
      },

      dropdownItem: {
        flexDirection:
          "row",

        alignItems:
          "center",

        paddingVertical:
          Metrics.x2,

        paddingHorizontal:
          Metrics.x1,

        borderRadius: 12,
      },

      dropdownIconContainer: {
        width: 40,

        height: 40,

        borderRadius: 12,

        alignItems:
          "center",

        justifyContent:
          "center",

        backgroundColor:
          "#F3F4F6",
      },

      dropdownIcon: {
        fontSize: 18,
      },

      dropdownItemTextContainer: {
        flex: 1,

        marginLeft:
          Metrics.x2,
      },

      dropdownItemTitle: {
        fontSize: 14,

        fontWeight: "700",

        color: "#171717",
      },

      dropdownItemSubtitle: {
        fontSize: 11,

        color:
          Colors.subtext,

        marginTop: 2,
      },

      logoutItem: {
        marginTop:
          Metrics.x1,

        backgroundColor:
          "#FFF5F5",
      },

      logoutIconContainer: {
        backgroundColor:
          "#FDECEC",
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
         ERROR
      ====================================================== */

      center: {
        flex: 1,

        justifyContent:
          "center",

        alignItems:
          "center",

        padding:
          Metrics.x5,

        backgroundColor:
          "#F7F8FC",
      },

      errorText: {
        color:
          Colors.error,

        textAlign:
          "center",

        fontSize: 16,
      },
    };
  }
);


/* ============================================================
   EXPORT
============================================================ */

export {
  PrincipalStudentsScreen,
};