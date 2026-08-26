import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
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
  Dialog,
  Divider,
  IconButton,
  Portal,
  Snackbar,
  TextInput,
} from "react-native-paper";

import {
  RouteProp,
  StackActions,
  useNavigation,
  useRoute,
} from "@react-navigation/native";

import {
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";

import {
  useQuery,
} from "react-query";

import {
  Page,
  TransactionItem,
} from "../components";

import {
  txnServices,
} from "../services";

import {
  studentServices,
} from "../services/studentServices";

import {
  Colors,
  makeStyles,
  Metrics,
} from "../theme";

import {
  GetStudentResponse,
  RootStackParamList,
  RootStackScreenNames,
  Student,
  Transaction,
} from "../types";

import {
  useUserStore,
} from "../store";


/* ============================================================================
   STUDENT DETAILS
============================================================================ */

const StudentDetails = () => {
  const styles = useStyles();

  const route =
    useRoute<
      RouteProp<
        RootStackParamList,
        RootStackScreenNames.StudentDetails
      >
    >();

  const navigation =
    useNavigation<
      NativeStackNavigationProp<
        RootStackParamList
      >
    >();

  const { width } =
    useWindowDimensions();

  /* ==========================================================================
     RESPONSIVE
  ========================================================================== */

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


  /* ==========================================================================
     USER
  ========================================================================== */

  const user =
    useUserStore(
      (state) => state.user
    );

  const logout =
    useUserStore(
      (state) => state.logout
    );


  /* ==========================================================================
     ROUTE
  ========================================================================== */

  const { student } =
    route.params;


  /* ==========================================================================
     STATE
  ========================================================================== */

  const [
    fetchingSibling,
    setFetchingSibling,
  ] = useState(false);

  const [
    snackbarVisible,
    setSnackbarVisible,
  ] = useState(false);

  const [
    snackbarMessage,
    setSnackbarMessage,
  ] = useState("");

  const [
    snackbarColor,
    setSnackbarColor,
  ] = useState(
    Colors.errorBg
  );

  const [
    showDeleteDialog,
    setShowDeleteDialog,
  ] = useState(false);

  const [
    deleting,
    setDeleting,
  ] = useState(false);

  const [
    profileMenuVisible,
    setProfileMenuVisible,
  ] = useState(false);


  /* ==========================================================================
     SNACKBAR
  ========================================================================== */

  const showSnackbar = (
    message: string,
    backgroundColor: string =
      Colors.errorBg
  ) => {
    setSnackbarMessage(
      message
    );

    setSnackbarColor(
      backgroundColor
    );

    setSnackbarVisible(
      true
    );
  };


  /* ==========================================================================
     STUDENT API
  ========================================================================== */

  const {
    data: studentFromQuery,
    isFetching:
      fetchingStudent,
    refetch:
      refetchStudent,
    isError:
      studentFetchError,
    error:
      studentError,
  } =
    useQuery<GetStudentResponse>(
      [
        "student-details",
        student.admissionNo,
      ],
      () =>
        studentServices
          .getStudentById({
            admissionNo:
              student.admissionNo,
          }),
      {
        enabled: true,

        cacheTime: 0,

        refetchOnWindowFocus:
          false,
      }
    );


  /* ==========================================================================
     TRANSACTIONS API
  ========================================================================== */

  const {
    data: transactions,
    error:
      transactionError,
    refetch:
      refetchTransactions,
    isFetching:
      fetchingTransactions,
  } =
    useQuery<Transaction[]>(
      [
        "student-transactions",
        student.admissionNo,
      ],
      () =>
        txnServices
          .getStudentTxns({
            admissionNo:
              student.admissionNo,
          }),
      {
        refetchOnWindowFocus:
          false,
      }
    );


  /* ==========================================================================
     CURRENT STUDENT
  ========================================================================== */

  const currentStudent: Student =
    !studentFetchError &&
    studentFromQuery &&
    "admissionNo" in
      studentFromQuery
      ? (studentFromQuery as Student)
      : student;


  /* ==========================================================================
     CLASS NUMBER
  ========================================================================== */

  const classNumber =
    typeof currentStudent.classNumber ===
    "object"
      ? currentStudent.classNumber
          ?.classNumber
      : currentStudent.classNumber;


  /* ==========================================================================
     ERROR HANDLING
  ========================================================================== */

  useEffect(() => {
    const error =
      studentError ??
      transactionError;

    if (!error) {
      return;
    }

    showSnackbar(
      // @ts-ignore
      error?.response?.data?.message ??
        "Unable to load student details."
    );
  }, [
    studentError,
    transactionError,
  ]);


  /* ==========================================================================
     SIBLING
  ========================================================================== */

  const onSiblingPress = async (
    admissionNo: string
  ) => {
    if (fetchingSibling) {
      return;
    }

    setFetchingSibling(true);

    try {
      const sibling =
        await studentServices
          .getStudentById({
            admissionNo,
          });

      navigation.dispatch(
        StackActions.push(
          RootStackScreenNames.StudentDetails,
          {
            student:
              sibling,
          }
        )
      );
    } catch (error) {
      showSnackbar(
        // @ts-ignore
        error?.response?.data?.message ??
          "Unable to load sibling details."
      );
    } finally {
      setFetchingSibling(false);
    }
  };


  /* ==========================================================================
     REFRESH
  ========================================================================== */

  const onRefresh = () => {
    refetchStudent();
    refetchTransactions();
  };


  /* ==========================================================================
     EDIT STUDENT
  ========================================================================== */

  const onEditStudent = () => {
    navigation.navigate(
      RootStackScreenNames.EditStudent,
      {
        preFetchedData:
          currentStudent,
      }
    );
  };


  /* ==========================================================================
     DELETE STUDENT
  ========================================================================== */

  const handleDeleteStudent =
    async () => {
      setDeleting(true);

      try {
        showSnackbar(
          "Delete Student API is not implemented yet."
        );

        setShowDeleteDialog(
          false
        );
      } finally {
        setDeleting(false);
      }
    };


  /* ==========================================================================
     LOGOUT
  ========================================================================== */

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


  /* ==========================================================================
     NAVIGATION
  ========================================================================== */

  const goToDashboard = () => {
    navigation.navigate(
      RootStackScreenNames.PrincipalDashboard
    );
  };

  const gotoInvoice = (
    transaction: Transaction
  ) => {
    navigation.navigate(
      RootStackScreenNames.Invoice,
      {
        student:
          currentStudent,
        transaction,
      }
    );
  };


  /* ==========================================================================
     TRANSACTION
  ========================================================================== */

  const renderTransaction = (
    transaction: Transaction
  ) => {
    return (
      <Pressable
        key={transaction.id}
        style={
          styles.transactionContainer
        }
        onPress={() => gotoInvoice(transaction)}
      >
        <TransactionItem
          txn={transaction}
          student={
            currentStudent
          }
        />
      </Pressable>
    );
  };


  /* ==========================================================================
     FEE ROW
  ========================================================================== */

  const renderFeeRow = (
    label: string,
    amount?: string
  ) => {
    return (
      <View
        style={styles.feeRow}
      >
        <Text
          style={styles.feeLabel}
        >
          {label}
        </Text>

        <Text
          style={styles.feeAmount}
        >
          ₹{amount ?? "0"}
        </Text>
      </View>
    );
  };


  /* ==========================================================================
     FEE VALUES
  ========================================================================== */

  const feeRows = useMemo(
    () => [
      {
        label: "Tuition Fee",
        amount:
          currentStudent
            .pendingTuitionFee,
      },
      {
        label: "Textbook Fee",
        amount:
          currentStudent
            .pendingTextbookFee,
      },
      {
        label: "Notebook Fee",
        amount:
          currentStudent
            .pendingNotebookFee,
      },
      {
        label: "Diary",
        amount:
          // @ts-ignore
          currentStudent.diary
            .pendingAmount,
      },
      {
        label: "Tie",
        amount:
          currentStudent.tie
            ?.pendingAmount,
      },
      {
        label: "Belt",
        amount:
          currentStudent.belt
            ?.pendingAmount,
      },
      {
        label: "Arrears",
        amount:
          currentStudent.arrears
            ?.pendingAmount,
      },
    ],
    [currentStudent]
  );


  /* ==========================================================================
     PROFILE DROPDOWN
  ========================================================================== */

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

              <View
                style={
                  styles.dropdownProfileHeader
                }
              >

                <Avatar.Text
                  size={46}
                  label={getInitials(
                    user?.name
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
                    {user?.name ||
                      "Principal"}
                  </Text>

                  <Text
                    style={
                      styles.dropdownUserEmail
                    }
                    numberOfLines={1}
                  >
                    {user?.email || ""}
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
                  setProfileMenuVisible(
                    false
                  );

                  showSnackbar(
                    "Principal profile coming next."
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


  /* ==========================================================================
     NAVBAR
  ========================================================================== */

  const renderNavbar =
    () => {
      return (
        <View
          style={styles.navbar}
        >

          <View
            style={
              styles.navbarLeft
            }
          >

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() =>
                navigation.goBack()
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

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={
                goToDashboard
              }
              style={
                styles.schoolBrand
              }
            >

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
                  {user?.schoolName ||
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

            </TouchableOpacity>

          </View>


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
              onPress={
                onRefresh
              }
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
                  user?.name
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
                    {user?.name ||
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


  /* ==========================================================================
     STUDENT HERO
  ========================================================================== */

  const renderStudentHero =
    () => {
      return (
        <Card
          style={
            styles.studentHero
          }
        >
          <Card.Content>

            <View
              style={
                styles.studentHeroRow
              }
            >

              <Avatar.Text
                size={
                  isSmallScreen
                    ? 64
                    : 76
                }
                label={getInitials(
                  currentStudent.name
                )}
                color="#4F46E5"
                style={
                  styles.studentHeroAvatar
                }
              />

              <View
                style={
                  styles.studentHeroInfo
                }
              >

                <Text
                  style={
                    styles.heroEyebrow
                  }
                >
                  STUDENT PROFILE
                </Text>

                <Text
                  style={
                    styles.heroStudentName
                  }
                  numberOfLines={2}
                >
                  {currentStudent.name}
                </Text>

                <Text
                  style={
                    styles.heroAdmission
                  }
                >
                  Admission No.{" "}
                  {currentStudent.admissionNo}
                </Text>

                <View
                  style={
                    styles.heroMetaRow
                  }
                >

                  <View
                    style={
                      styles.heroMetaBadge
                    }
                  >

                    <Text
                      style={
                        styles.heroMetaBadgeText
                      }
                    >
                      Class {classNumber ||
                        "-"}
                    </Text>

                  </View>

                  <View
                    style={
                      styles.heroMetaBadge
                    }
                  >

                    <Text
                      style={
                        styles.heroMetaBadgeText
                      }
                    >
                      Student
                    </Text>

                  </View>

                </View>

              </View>

            </View>

          </Card.Content>
        </Card>
      );
    };


  /* ==========================================================================
     ACTIONS
  ========================================================================== */

  const renderActions =
    () => {
      return (
        <Card
          style={
            styles.actionCard
          }
        >

          <Card.Content>

            <Text
              style={
                styles.cardSectionTitle
              }
            >
              Student Actions
            </Text>

            <View
              style={
                styles.actionsRow
              }
            >

              <Button
                mode="contained"
                icon="pencil"
                onPress={
                  onEditStudent
                }
                style={
                  styles.actionButton
                }
                contentStyle={
                  styles.actionButtonContent
                }
              >
                Edit Student
              </Button>

              <Button
                mode="outlined"
                icon="delete"
                onPress={() => {
                  setShowDeleteDialog(
                    true
                  );
                }}
                textColor={
                  Colors.error
                }
                style={[
                  styles.actionButton,
                  styles.deleteButton,
                ]}
                contentStyle={
                  styles.actionButtonContent
                }
              >
                Delete Student
              </Button>

            </View>

          </Card.Content>

        </Card>
      );
    };


  /* ==========================================================================
     INFORMATION
  ========================================================================== */

  const renderInformation =
    () => {
      return (
        <Card
          style={
            styles.contentCard
          }
        >

          <Card.Content>

            <Text
              style={
                styles.cardSectionTitle
              }
            >
              Student Information
            </Text>

            {renderInfoRow(
              "Father Name",
              currentStudent.fatherName ||
                "-"
            )}

            <Divider />

            {renderInfoRow(
              "Date of Birth",
              currentStudent.dob ||
                "-"
            )}

            <Divider />

            {renderInfoRow(
              "Date of Joining",
              currentStudent.doj ||
                "-"
            )}

            <Divider />

            {renderInfoRow(
              "Phone",
              // @ts-ignore
              currentStudent.phone ??
                currentStudent.phoneNo ??
                "-"
            )}

            <Divider />

            {renderInfoRow(
              "Aadhaar",
              currentStudent.aadhaar ||
                "-"
            )}

          </Card.Content>

        </Card>
      );
    };


  /* ==========================================================================
     FEE SUMMARY
  ========================================================================== */

  const renderFeeSummary =
    () => {
      return (
        <View>

          <Card
            style={
              styles.contentCard
            }
          >

            <Card.Content>

              <View
                style={
                  styles.feeHeader
                }
              >

                <View>

                  <Text
                    style={
                      styles.cardSectionTitle
                    }
                  >
                    Fee Summary
                  </Text>

                  <Text
                    style={
                      styles.cardSectionSubtitle
                    }
                  >
                    Outstanding fees for this
                    student.
                  </Text>

                </View>

                <View
                  style={
                    styles.feeIcon
                  }
                >
                  <Text
                    style={
                      styles.feeIconText
                    }
                  >
                    ₹
                  </Text>
                </View>

              </View>

              {feeRows.map(
                (fee, index) => (
                  <React.Fragment
                    key={fee.label}
                  >

                    {index > 0 && (
                      <Divider />
                    )}

                    {renderFeeRow(
                      fee.label,
                      fee.amount
                    )}

                  </React.Fragment>
                )
              )}

            </Card.Content>

          </Card>

          <View
            style={
              styles.pendingCard
            }
          >

            <View
              style={
                styles.pendingLeft
              }
            >

              <Text
                style={
                  styles.pendingLabel
                }
              >
                Total Pending Amount
              </Text>

              <Text
                style={
                  styles.pendingSubtext
                }
              >
                Outstanding balance
              </Text>

            </View>

            <Text
              style={
                styles.pendingAmount
              }
            >
              ₹
              {currentStudent.pendingAmount ||
                "0"}
            </Text>

          </View>

        </View>
      );
    };


  /* ==========================================================================
     COUPON
  ========================================================================== */

  const renderCoupon =
    () => {
      if (
        !currentStudent.couponCode
      ) {
        return null;
      }

      const coupon =
        typeof currentStudent.couponCode ===
        "string"
          ? currentStudent.couponCode
          : // @ts-ignore
            currentStudent.couponCode
              ?.code;

      return (
        <Card
          style={
            styles.contentCard
          }
        >

          <Card.Content>

            <View
              style={
                styles.couponHeader
              }
            >

              <View
                style={
                  styles.couponIcon
                }
              >
                <Text
                  style={
                    styles.couponIconText
                  }
                >
                  %
                </Text>
              </View>

              <View
                style={
                  styles.couponHeaderText
                }
              >

                <Text
                  style={
                    styles.cardSectionTitle
                  }
                >
                  Coupon
                </Text>

                <Text
                  style={
                    styles.cardSectionSubtitle
                  }
                >
                  Applied discount coupon
                </Text>

              </View>

            </View>

            <View
              style={
                styles.couponCodeContainer
              }
            >

              <Text
                style={
                  styles.couponLabel
                }
              >
                Applied Coupon
              </Text>

              <Text
                style={
                  styles.couponCode
                }
              >
                {coupon || "-"}
              </Text>

            </View>

          </Card.Content>

        </Card>
      );
    };


  /* ==========================================================================
     SIBLINGS
  ========================================================================== */

  const renderSiblings =
    () => {
      if (
        !currentStudent.siblings
          ?.length
      ) {
        return null;
      }

      return (
        <Card
          style={
            styles.contentCard
          }
        >

          <Card.Content>

            <Text
              style={
                styles.cardSectionTitle
              }
            >
              Siblings
            </Text>

            <Text
              style={
                styles.cardSectionSubtitle
              }
            >
              Other students linked to this
              family.
            </Text>

            <View
              style={
                styles.siblingsContainer
              }
            >

              {currentStudent.siblings.map(
                (sibling) => (
                  <TouchableOpacity
                    key={
                      sibling.admissionNo
                    }
                    activeOpacity={0.8}
                    disabled={
                      fetchingSibling
                    }
                    onPress={() =>
                      onSiblingPress(
                        sibling.admissionNo
                      )
                    }
                    style={
                      styles.siblingCard
                    }
                  >

                    <Avatar.Text
                      size={44}
                      label={getInitials(
                        sibling.name
                      )}
                      color="#4F46E5"
                      style={
                        styles.siblingAvatar
                      }
                    />

                    <View
                      style={
                        styles.siblingInfo
                      }
                    >

                      <Text
                        style={
                          styles.siblingName
                        }
                        numberOfLines={1}
                      >
                        {sibling.name}
                      </Text>

                      <Text
                        style={
                          styles.siblingAdmission
                        }
                      >
                        {sibling.admissionNo}
                      </Text>

                    </View>

                    <Text
                      style={
                        styles.siblingArrow
                      }
                    >
                      →
                    </Text>

                  </TouchableOpacity>
                )
              )}

            </View>

          </Card.Content>

        </Card>
      );
    };


  /* ==========================================================================
     TRANSACTIONS
  ========================================================================== */

  const renderTransactions =
    () => {
      return (
        <Card
          style={
            styles.contentCard
          }
        >

          <Card.Content>

            <View
              style={
                styles.transactionsHeader
              }
            >

              <View>

                <Text
                  style={
                    styles.cardSectionTitle
                  }
                >
                  Transactions
                </Text>

                <Text
                  style={
                    styles.cardSectionSubtitle
                  }
                >
                  Payment history for this
                  student.
                </Text>

              </View>

              <View
                style={
                  styles.transactionCount
                }
              >

                <Text
                  style={
                    styles.transactionCountText
                  }
                >
                  {transactions?.length ||
                    0}
                </Text>

              </View>

            </View>

            {fetchingTransactions ? (

              <View
                style={
                  styles.loading
                }
              >
                <ActivityIndicator
                  size="small"
                  color={
                    Colors.brandPrimary
                  }
                />
              </View>

            ) : transactions?.length ? (

              transactions.map(
                renderTransaction
              )

            ) : (

              <View
                style={
                  styles.emptyTransaction
                }
              >

                <Text
                  style={
                    styles.emptyIcon
                  }
                >
                  💳
                </Text>

                <Text
                  style={
                    styles.emptyTitle
                  }
                >
                  No Transactions
                </Text>

                <Text
                  style={
                    styles.emptyText
                  }
                >
                  No payment transactions
                  found for this student.
                </Text>

              </View>

            )}

          </Card.Content>

        </Card>
      );
    };


  /* ==========================================================================
     LOADING
  ========================================================================== */

  const initialLoading =
    fetchingStudent &&
    !studentFromQuery;


  /* ==========================================================================
     USER AUTH CHECK
  ========================================================================== */

  if (!user) {
    return (
      <View
        style={styles.center}
      >
        <Text
          style={styles.errorText}
        >
          Session not found.
        </Text>
      </View>
    );
  }


  /* ==========================================================================
     MAIN UI
  ========================================================================== */

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
            onRefresh={
              onRefresh
            }
            refreshing={
              fetchingStudent ||
              fetchingTransactions ||
              fetchingSibling
            }
            tintColor={
              Colors.brandPrimary
            }
          />
        }
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingHorizontal:
              horizontalPadding,
          },
        ]}
      >

        {/* ================================================================
            NAVBAR
        ================================================================ */}

        {renderNavbar()}


        {/* ================================================================
            PAGE TITLE
        ================================================================ */}

        <View
          style={
            styles.pageHeading
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
            Student Details
          </Text>

          <Text
            style={
              styles.pageSubtitle
            }
          >
            View student information,
            fees, family details and
            payment history.
          </Text>

        </View>


        {/* ================================================================
            STUDENT HERO
        ================================================================ */}

        {renderStudentHero()}


        {/* ================================================================
            ACTIONS
        ================================================================ */}

        {renderActions()}


        {/* ================================================================
            CONTENT GRID
        ================================================================ */}

        <View
          style={
            styles.contentGrid
          }
        >

          {/* LEFT COLUMN */}

          <View
            style={
              styles.leftColumn
            }
          >

            <View
              style={
                styles.section
              }
            >

              <Text
                style={
                  styles.sectionTitle
                }
              >
                Personal Information
              </Text>

              {renderInformation()}

            </View>


            <View
              style={
                styles.section
              }
            >

              <Text
                style={
                  styles.sectionTitle
                }
              >
                Financial Information
              </Text>

              {renderFeeSummary()}

            </View>


            <View
              style={
                styles.section
              }
            >
              {renderCoupon()}
            </View>

          </View>


          {/* RIGHT COLUMN */}

          <View
            style={
              styles.rightColumn
            }
          >

            <View
              style={
                styles.section
              }
            >
              {renderSiblings()}
            </View>

            <View
              style={
                styles.section
              }
            >
              {renderTransactions()}
            </View>

          </View>

        </View>


        {/* ================================================================
            MOBILE TRANSACTION / EXTRA SPACING
        ================================================================ */}

        {initialLoading && (
          <View
            style={
              styles.loadingOverlayContent
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
              Loading student details...
            </Text>

          </View>
        )}

      </ScrollView>


      {/* ================================================================
          PROFILE DROPDOWN
      ================================================================ */}

      {renderProfileDropdown()}


      {/* ================================================================
          DELETE DIALOG
      ================================================================ */}

      <Portal>

        <Dialog
          visible={
            showDeleteDialog
          }
          onDismiss={() => {
            if (!deleting) {
              setShowDeleteDialog(
                false
              );
            }
          }}
        >

          <Dialog.Title>
            Delete Student
          </Dialog.Title>

          <Dialog.Content>

            <Text
              style={
                styles.dialogText
              }
            >
              Are you sure you want to
              delete{" "}
              <Text
                style={
                  styles.dialogBold
                }
              >
                {currentStudent.name}
              </Text>
              ?
            </Text>

            <Text
              style={
                styles.dialogAdmission
              }
            >
              Admission No.{" "}
              {currentStudent.admissionNo}
            </Text>

            <Text
              style={
                styles.dialogWarning
              }
            >
              This action cannot be undone.
            </Text>

          </Dialog.Content>

          <Dialog.Actions>

            <Button
              disabled={
                deleting
              }
              onPress={() => {
                setShowDeleteDialog(
                  false
                );
              }}
            >
              Cancel
            </Button>

            <Button
              loading={
                deleting
              }
              disabled={
                deleting
              }
              textColor={
                Colors.error
              }
              onPress={
                handleDeleteStudent
              }
            >
              Delete
            </Button>

          </Dialog.Actions>

        </Dialog>

      </Portal>


      {/* ================================================================
          SNACKBAR
      ================================================================ */}

      <Snackbar
        visible={
          snackbarVisible
        }
        onDismiss={() =>
          setSnackbarVisible(
            false
          )
        }
        duration={3000}
        style={{
          backgroundColor:
            snackbarColor,
        }}
      >
        {snackbarMessage}
      </Snackbar>

    </View>
  );
};


/* ============================================================================
   INFO ROW
============================================================================ */

const renderInfoRow = (
  label: string,
  value: string
) => {
  return (
    <View
      style={{
        minHeight: 54,
        flexDirection:
          "row",
        alignItems:
          "center",
        justifyContent:
          "space-between",
      }}
    >

      <Text
        style={{
          flex: 1,
          fontSize: 13,
          color:
            Colors.subtext,
        }}
      >
        {label}
      </Text>

      <Text
        style={{
          flex: 1,
          fontSize: 14,
          fontWeight: "600",
          textAlign: "right",
        }}
      >
        {value}
      </Text>

    </View>
  );
};


/* ============================================================================
   INITIALS
============================================================================ */

const getInitials = (
  name?: string | null
) => {
  if (!name) {
    return "S";
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


/* ============================================================================
   STYLES
============================================================================ */

const useStyles = makeStyles(() => {
  return {

    /* ========================================================================
       PAGE
    ======================================================================== */

    page: {
      flex: 1,
      backgroundColor:
        "#F7F8FC",
    },

    scrollContent: {
      paddingTop:
        Metrics.x3,

      paddingBottom:
        Metrics.x8,
    },


    /* ========================================================================
       NAVBAR
    ======================================================================== */

    navbar: {
      minHeight: 72,

      paddingHorizontal:
        Metrics.x3,

      paddingVertical:
        Metrics.x2,

      flexDirection:
        "row",

      alignItems:
        "center",

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

    schoolBrand: {
      flexDirection:
        "row",

      alignItems:
        "center",

      flex: 1,

      minWidth: 0,
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


    /* ========================================================================
       PROFILE
    ======================================================================== */

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


    /* ========================================================================
       PAGE HEADING
    ======================================================================== */

    pageHeading: {
      marginBottom:
        Metrics.x5,
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

      maxWidth: 700,
    },


    /* ========================================================================
       STUDENT HERO
    ======================================================================== */

    studentHero: {
      backgroundColor:
        "#FFFFFF",

      borderRadius: 20,

      borderWidth: 1,

      borderColor:
        "#E9EAF0",

      elevation: 1,

      marginBottom:
        Metrics.x4,
    },

    studentHeroRow: {
      flexDirection:
        "row",

      alignItems:
        "center",
    },

    studentHeroAvatar: {
      backgroundColor:
        "#EEF2FF",

      marginRight:
        Metrics.x4,
    },

    studentHeroInfo: {
      flex: 1,

      minWidth: 0,
    },

    heroEyebrow: {
      fontSize: 10,

      fontWeight: "800",

      letterSpacing: 1,

      color:
        Colors.brandPrimary,

      marginBottom: 3,
    },

    heroStudentName: {
      fontSize: 24,

      fontWeight: "800",

      color: "#171717",
    },

    heroAdmission: {
      fontSize: 13,

      color:
        Colors.subtext,

      marginTop:
        Metrics.x1,
    },

    heroMetaRow: {
      flexDirection:
        "row",

      alignItems:
        "center",

      marginTop:
        Metrics.x2,
    },

    heroMetaBadge: {
      paddingHorizontal:
        Metrics.x2,

      paddingVertical:
        Metrics.x1,

      borderRadius: 9,

      backgroundColor:
        "#F3F4F6",

      marginRight:
        Metrics.x2,
    },

    heroMetaBadgeText: {
      fontSize: 11,

      fontWeight: "700",

      color: "#374151",
    },


    /* ========================================================================
       ACTIONS
    ======================================================================== */

    actionCard: {
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

    cardSectionTitle: {
      fontSize: 17,

      fontWeight: "800",

      color: "#171717",
    },

    cardSectionSubtitle: {
      fontSize: 12,

      color:
        Colors.subtext,

      marginTop: 2,

      marginBottom:
        Metrics.x3,
    },

    actionsRow: {
      flexDirection:
        "row",

      alignItems:
        "center",

      flexWrap:
        "wrap",
    },

    actionButton: {
      borderRadius: 12,

      marginRight:
        Metrics.x2,

      marginBottom:
        Metrics.x1,
    },

    actionButtonContent: {
      minHeight: 46,
    },

    deleteButton: {
      borderColor:
        Colors.error,
    },


    /* ========================================================================
       CONTENT GRID
    ======================================================================== */

    contentGrid: {
      flexDirection:
        "row",

      alignItems:
        "flex-start",

      marginHorizontal:
        -Metrics.x2,
    },

    leftColumn: {
      flex: 1,

      marginHorizontal:
        Metrics.x2,

      minWidth: 0,
    },

    rightColumn: {
      flex: 1,

      marginHorizontal:
        Metrics.x2,

      minWidth: 0,
    },

    section: {
      marginBottom:
        Metrics.x5,
    },

    sectionTitle: {
      fontSize: 19,

      fontWeight: "800",

      color: "#171717",

      marginBottom:
        Metrics.x3,
    },

    contentCard: {
      backgroundColor:
        "#FFFFFF",

      borderRadius: 18,

      borderWidth: 1,

      borderColor:
        "#E9EAF0",

      elevation: 1,
    },


    /* ========================================================================
       FEES
    ======================================================================== */

    feeHeader: {
      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      marginBottom:
        Metrics.x2,
    },

    feeIcon: {
      width: 42,

      height: 42,

      borderRadius: 12,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        "#EEF2FF",
    },

    feeIconText: {
      fontSize: 19,

      fontWeight: "800",

      color:
        "#4F46E5",
    },

    feeRow: {
      minHeight: 48,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",
    },

    feeLabel: {
      fontSize: 13,

      color:
        Colors.subtext,
    },

    feeAmount: {
      fontSize: 14,

      fontWeight: "700",

      color: "#171717",
    },

    pendingCard: {
      marginTop:
        Metrics.x3,

      padding:
        Metrics.x4,

      borderRadius: 16,

      backgroundColor:
        "#FFF5F5",

      borderWidth: 1,

      borderColor:
        "#F6D6D6",

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",
    },

    pendingLeft: {
      flex: 1,
    },

    pendingLabel: {
      fontSize: 14,

      fontWeight: "800",

      color: "#171717",
    },

    pendingSubtext: {
      fontSize: 11,

      color:
        Colors.subtext,

      marginTop: 2,
    },

    pendingAmount: {
      fontSize: 21,

      fontWeight: "800",

      color:
        Colors.error,

      marginLeft:
        Metrics.x2,
    },


    /* ========================================================================
       COUPON
    ======================================================================== */

    couponHeader: {
      flexDirection:
        "row",

      alignItems:
        "center",

      marginBottom:
        Metrics.x3,
    },

    couponIcon: {
      width: 42,

      height: 42,

      borderRadius: 12,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        "#EFFAF5",

      marginRight:
        Metrics.x2,
    },

    couponIconText: {
      fontSize: 19,

      fontWeight: "800",

      color:
        "#16834B",
    },

    couponHeaderText: {
      flex: 1,
    },

    couponCodeContainer: {
      padding:
        Metrics.x3,

      borderRadius: 12,

      backgroundColor:
        "#F7F8FC",
    },

    couponLabel: {
      fontSize: 11,

      color:
        Colors.subtext,
    },

    couponCode: {
      fontSize: 17,

      fontWeight: "800",

      color:
        "#16834B",

      marginTop:
        Metrics.x1,
    },


    /* ========================================================================
       SIBLINGS
    ======================================================================== */

    siblingsContainer: {
      marginTop:
        Metrics.x1,
    },

    siblingCard: {
      flexDirection:
        "row",

      alignItems:
        "center",

      padding:
        Metrics.x3,

      borderRadius: 14,

      backgroundColor:
        "#F7F8FC",

      marginBottom:
        Metrics.x2,
    },

    siblingAvatar: {
      backgroundColor:
        "#EEF2FF",
    },

    siblingInfo: {
      flex: 1,

      marginLeft:
        Metrics.x2,

      minWidth: 0,
    },

    siblingName: {
      fontSize: 14,

      fontWeight: "800",

      color: "#171717",
    },

    siblingAdmission: {
      fontSize: 11,

      color:
        Colors.subtext,

      marginTop: 2,
    },

    siblingArrow: {
      fontSize: 20,

      color:
        Colors.subtext,

      marginLeft:
        Metrics.x2,
    },


    /* ========================================================================
       TRANSACTIONS
    ======================================================================== */

    transactionsHeader: {
      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      marginBottom:
        Metrics.x3,
    },

    transactionCount: {
      minWidth: 36,

      height: 34,

      paddingHorizontal:
        Metrics.x2,

      borderRadius: 10,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        "#EEF2FF",
    },

    transactionCountText: {
      fontSize: 12,

      fontWeight: "800",

      color:
        "#4F46E5",
    },

    transactionContainer: {
      marginBottom:
        Metrics.x3,
    },

    emptyTransaction: {
      alignItems:
        "center",

      paddingVertical:
        Metrics.x5,
    },

    emptyIcon: {
      fontSize: 38,
    },

    emptyTitle: {
      fontSize: 16,

      fontWeight: "800",

      color: "#171717",

      marginTop:
        Metrics.x2,
    },

    emptyText: {
      fontSize: 12,

      color:
        Colors.subtext,

      textAlign:
        "center",

      marginTop:
        Metrics.x1,
    },


    /* ========================================================================
       LOADING
    ======================================================================== */

    loading: {
      paddingVertical:
        Metrics.x5,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    loadingOverlayContent: {
      paddingVertical:
        Metrics.x5,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    loadingText: {
      marginTop:
        Metrics.x2,

      fontSize: 13,

      color:
        Colors.subtext,
    },


    /* ========================================================================
       PROFILE DROPDOWN
    ======================================================================== */

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


    /* ========================================================================
       DELETE DIALOG
    ======================================================================== */

    dialogText: {
      fontSize: 14,

      color: "#374151",

      lineHeight: 21,
    },

    dialogBold: {
      fontWeight: "800",

      color: "#171717",
    },

    dialogAdmission: {
      fontSize: 12,

      color:
        Colors.subtext,

      marginTop:
        Metrics.x2,
    },

    dialogWarning: {
      fontSize: 12,

      color:
        Colors.error,

      marginTop:
        Metrics.x2,
    },


    /* ========================================================================
       AUTH
    ======================================================================== */

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

    errorText: {
      color:
        Colors.error,

      fontSize: 16,

      textAlign:
        "center",
    },
  };
});


/* ============================================================================
   EXPORT
============================================================================ */

export {
  StudentDetails,
};