import React, {
  useEffect,
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
  principalServices,
} from "../../services/principalServices";
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

type Student = {
  id?: string | number;
  _id?: string;
  name?: string;
  studentName?: string;

  admissionNo?: string;
  admissionNumber?: string;

  classNumber?: string;
  class?: string;
  className?: string;
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
      "principal-all-students",
    ],
    principalServices.getStudents
  );


  /* ==========================================================
     ERROR
  ========================================================== */

  useEffect(() => {
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
     STUDENT DATA
  ========================================================== */

  const students =
    useMemo(() => {
      /*
       * Supports these common API shapes:
       *
       * {
       *   students: [...]
       * }
       *
       * {
       *   data: [...]
       * }
       *
       * [...]
       */

      if (Array.isArray(data)) {
        return data as Student[];
      }

      if (
        Array.isArray(
          data?.students
        )
      ) {
        return data.students as Student[];
      }

      if (
        Array.isArray(
          data?.data
        )
      ) {
        return data.data as Student[];
      }

      return [];
    }, [data]);


  /* ==========================================================
     SEARCH
  ========================================================== */

  const searchValue =
    search
      .trim()
      .toLowerCase();

  const filteredStudents =
    useMemo(() => {
      if (!searchValue) {
        return students;
      }

      return students.filter(
        (student) => {
          const studentName =
            (
              student.name ??
              student.studentName ??
              ""
            )
              .toString()
              .toLowerCase();

          const admissionNo =
            (
              student.admissionNo ??
              student.admissionNumber ??
              ""
            )
              .toString()
              .toLowerCase();

          return (
            studentName.includes(
              searchValue
            ) ||
            admissionNo.includes(
              searchValue
            )
          );
        }
      );
    }, [
      students,
      searchValue,
    ]);


  /* ==========================================================
     TOTAL STUDENTS
  ========================================================== */

  const totalStudents =
    students.length;


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
              Manage all students
              across your school.
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
     SUMMARY
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


          {/* CURRENT RESULTS */}

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
                  icon="account-search-outline"
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
                {formatNumber(
                  filteredStudents.length
                )}
              </Text>

              <Text
                style={
                  styles.summaryLabel
                }
              >
                Matching Students
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
                  Find a Student
                </Text>

                <Text
                  style={
                    styles.searchSubtitle
                  }
                >
                  Search by student name
                  or admission number
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
              label="Search student"
              placeholder="Enter name or admission number"
              value={search}
              onChangeText={
                setSearch
              }
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
     STUDENT ITEM
  ========================================================== */

  const renderStudent = ({
    item,
  }: {
    item: Student;
  }) => {

    const studentName =
      item.name ??
      item.studentName ??
      "Unnamed Student";

    const admissionNo =
      item.admissionNo ??
      item.admissionNumber ??
      "N/A";

    const className =
      item.classNumber ??
      item.className ??
      item.class ??
      "";

    return (
      <TouchableOpacity
        activeOpacity={0.88}
        style={
          styles.studentTouchable
        }
        onPress={() => {
          /*
           * Add student details navigation
           * here if you have a student-details
           * route.
           */
        }}
      >

        <Card
          style={
            styles.studentCard
          }
        >

          <Card.Content>

            <View
              style={
                styles.studentCardRow
              }
            >

              {/* AVATAR */}

              <Avatar.Text
                size={50}
                label={getInitials(
                  studentName
                )}
                color="#FFFFFF"
                style={
                  styles.studentAvatar
                }
              />


              {/* INFO */}

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
                  {studentName}
                </Text>

                <Text
                  style={
                    styles.studentAdmission
                  }
                  numberOfLines={1}
                >
                  Admission No:{" "}
                  {admissionNo}
                </Text>

                {className ? (
                  <Text
                    style={
                      styles.studentClass
                    }
                    numberOfLines={1}
                  >
                    Class: {className}
                  </Text>
                ) : null}

              </View>


              {/* RIGHT */}

              <View
                style={
                  styles.studentRight
                }
              >

                <View
                  style={
                    styles.admissionBadge
                  }
                >

                  <Text
                    style={
                      styles.admissionBadgeText
                    }
                  >
                    {admissionNo}
                  </Text>

                </View>

                <Text
                  style={
                    styles.studentArrow
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
                  : "account-group-outline"
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
              ? "No matching students"
              : "No students found"}
          </Text>

          <Text
            style={
              styles.emptyText
            }
          >
            {searchValue
              ? "Try a different student name or admission number."
              : "There are currently no student records available."}
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
              icon="account-group-outline"
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
              Fetching all student
              information for your school.
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
          filteredStudents
        }

        renderItem={
          renderStudent
        }

        keyExtractor={(
          item,
          index
        ) =>
          String(
            item.id ??
            item._id ??
            item.admissionNo ??
            item.admissionNumber ??
            index
          )
        }

        /*
         * Render around 15 items initially
         * and process additional items in
         * batches of 15.
         */
        initialNumToRender={15}
        maxToRenderPerBatch={15}
        windowSize={5}

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

            {filteredStudents.length >
              0 && (
              <View
                style={
                  styles.studentsHeader
                }
              >

                <View>

                  <Text
                    style={
                      styles.studentsTitle
                    }
                  >
                    Students
                  </Text>

                  <Text
                    style={
                      styles.studentsSubtitle
                    }
                  >
                    Showing students from
                    your school.
                  </Text>

                </View>

                <View
                  style={
                    styles.studentsCountBadge
                  }
                >

                  <Text
                    style={
                      styles.studentsCountText
                    }
                  >
                    {filteredStudents.length}
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
    return "ST";
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

        alignItems: "center",

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
         STUDENTS HEADER
      ====================================================== */

      studentsHeader: {
        flexDirection:
          "row",

        alignItems:
          "center",

        justifyContent:
          "space-between",

        marginBottom:
          Metrics.x3,
      },

      studentsTitle: {
        fontSize: 20,

        fontWeight: "800",

        color: "#171717",
      },

      studentsSubtitle: {
        fontSize: 12,

        color:
          Colors.subtext,

        marginTop: 2,
      },

      studentsCountBadge: {
        minWidth: 36,

        height: 36,

        paddingHorizontal:
          Metrics.x2,

        borderRadius: 12,

        alignItems: "center",

        justifyContent:
          "center",

        backgroundColor:
          "#EEF2FF",
      },

      studentsCountText: {
        fontSize: 13,

        fontWeight: "800",

        color: "#4F46E5",
      },


      /* ======================================================
         STUDENT CARD
      ====================================================== */

      studentTouchable: {
        marginBottom:
          Metrics.x3,
      },

      studentCard: {
        backgroundColor:
          "#FFFFFF",

        borderRadius: 18,

        borderWidth: 1,

        borderColor:
          "#E9EAF0",

        elevation: 1,
      },

      studentCardRow: {
        flexDirection:
          "row",

        alignItems:
          "center",

        minHeight: 78,
      },

      studentAvatar: {
        backgroundColor:
          Colors.brandPrimary,

        marginRight:
          Metrics.x3,
      },

      studentInfo: {
        flex: 1,

        minWidth: 0,
      },

      studentName: {
        fontSize: 17,

        fontWeight: "800",

        color: "#171717",
      },

      studentAdmission: {
        fontSize: 13,

        color:
          Colors.subtext,

        marginTop:
          Metrics.x1,
      },

      studentClass: {
        fontSize: 12,

        color:
          Colors.subtext,

        marginTop: 3,
      },

      studentRight: {
        flexDirection:
          "row",

        alignItems:
          "center",

        marginLeft:
          Metrics.x2,
      },

      admissionBadge: {
        maxWidth: 110,

        minHeight: 32,

        paddingHorizontal:
          Metrics.x2,

        borderRadius: 10,

        alignItems: "center",

        justifyContent:
          "center",

        backgroundColor:
          "#F3F4F6",
      },

      admissionBadgeText: {
        fontSize: 11,

        fontWeight: "800",

        color: "#374151",
      },

      studentArrow: {
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

        alignItems: "center",

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