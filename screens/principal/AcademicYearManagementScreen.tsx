import React, {
  useCallback,
  useMemo,
  useState,
} from "react";

import {
  FlatList,
  RefreshControl,
  Text,
  View,
} from "react-native";

import {
  Button,
  Card,
  Divider,
  Modal,
  Portal,
  Snackbar,
  TextInput,
  TouchableRipple,
} from "react-native-paper";

import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "react-query";

import { useNavigation } from "@react-navigation/native";

import {
  academicYearServices,
} from "../../services";

import {
  Colors,
  makeStyles,
  Metrics,
} from "../../theme";

dayjs.extend(customParseFormat);

/* ============================================================
   TYPES
============================================================ */

type AcademicYear = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type AcademicYearsResponse = {
  academicYears: AcademicYear[];
};

type CreateAcademicYearPayload = {
  name: string;
  startDate: string;
  endDate: string;
  isCurrent?: boolean;
};

type PopulateAcademicYearPayload = {
  sourceAcademicYearId: string;
  targetAcademicYearId: string;
};

type PopulateAcademicYearResponse = {
  message: string;

  sourceAcademicYear: {
    id: string;
    name: string;
  };

  targetAcademicYear: {
    id: string;
    name: string;
  };

  summary: {
    classesCreated: number;
    sectionsCreated: number;
    subjectsCreated: number;
  };
};

/* ============================================================
   SCREEN
============================================================ */

const AcademicYearManagementScreen = () => {
  const styles = useStyles();

  const navigation = useNavigation<any>();

  const queryClient = useQueryClient();

  /* ==========================================================
     CREATE MODAL
  ========================================================== */

  const [
    createModalVisible,
    setCreateModalVisible,
  ] = useState(false);

  const [
    yearName,
    setYearName,
  ] = useState("");

  const [
    startDate,
    setStartDate,
  ] = useState("");

  const [
    endDate,
    setEndDate,
  ] = useState("");

  const [
    setAsCurrent,
    setSetAsCurrent,
  ] = useState(false);

  /* ==========================================================
     POPULATE MODAL
  ========================================================== */

  const [
    populateModalVisible,
    setPopulateModalVisible,
  ] = useState(false);

  const [
    populateSourceYearId,
    setPopulateSourceYearId,
  ] = useState<string | null>(null);

  const [
    populateTargetYearId,
    setPopulateTargetYearId,
  ] = useState<string | null>(null);

  /* ==========================================================
     SELECTED YEAR
  ========================================================== */

  const [
    selectedYearId,
    setSelectedYearId,
  ] = useState<string | null>(null);

  /* ==========================================================
     SNACKBAR
  ========================================================== */

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

  const showSnackbar =
    useCallback(
      (
        message: string,
        color: string = Colors.errorBg
      ) => {
        setSnackbarMessage(message);
        setSnackbarColor(color);
        setSnackbarVisible(true);
      },
      []
    );

  /* ==========================================================
     GET ACADEMIC YEARS
  ========================================================== */

  const academicYearsQuery =
    useQuery<AcademicYearsResponse>(
      ["academic-years"],
      () =>
        academicYearServices
          .getAcademicYears() as
          Promise<AcademicYearsResponse>,
      {
        onSuccess: response => {
          const years =
            response?.academicYears ?? [];

          /*
           * Select current academic year
           * automatically on first load.
           */
          if (!selectedYearId) {
            const currentYear =
              years.find(
                year => year.isCurrent
              );

            if (currentYear) {
              setSelectedYearId(
                currentYear.id
              );
            } else if (years.length > 0) {
              setSelectedYearId(
                years[0].id
              );
            }
          }
        },
      }
    );

  const academicYears =
    academicYearsQuery.data
      ?.academicYears ?? [];

  /* ==========================================================
     CURRENT YEAR
  ========================================================== */

  const currentAcademicYear =
    useMemo(
      () =>
        academicYears.find(
          year => year.isCurrent
        ) ?? null,
      [academicYears]
    );

  /* ==========================================================
     SELECTED YEAR
  ========================================================== */

  const selectedAcademicYear =
    useMemo(
      () =>
        academicYears.find(
          year =>
            year.id ===
            selectedYearId
        ) ?? null,
      [
        academicYears,
        selectedYearId,
      ]
    );

  /* ==========================================================
     CREATE MUTATION
  ========================================================== */

  const createMutation =
    useMutation(
      (
        payload: CreateAcademicYearPayload
      ) =>
        academicYearServices
          .createAcademicYear(
            payload
          ),
      {
        onSuccess: response => {
          setCreateModalVisible(
            false
          );

          resetCreateForm();

          queryClient.invalidateQueries(
            ["academic-years"]
          );

          queryClient.invalidateQueries(
            ["current-academic-year"]
          );

          showSnackbar(
            response?.message ??
              "Academic year created successfully",
            Colors.successBg
          );
        },

        onError: (error: any) => {
          showSnackbar(
            error?.response?.data
              ?.message ??
              error?.message ??
              "Unable to create academic year",
            Colors.errorBg
          );
        },
      }
    );

  /* ==========================================================
     SET CURRENT MUTATION
  ========================================================== */

  const setCurrentMutation =
    useMutation(
      (
        academicYearId: string
      ) =>
        academicYearServices
          .setCurrentAcademicYear(
            academicYearId
          ),
      {
        onSuccess: response => {
          queryClient.invalidateQueries(
            ["academic-years"]
          );

          queryClient.invalidateQueries(
            ["current-academic-year"]
          );

          showSnackbar(
            response?.message ??
              "Current academic year updated successfully",
            Colors.successBg
          );
        },

        onError: (error: any) => {
          showSnackbar(
            error?.response?.data
              ?.message ??
              error?.message ??
              "Unable to change current academic year",
            Colors.errorBg
          );
        },
      }
    );

  /* ==========================================================
     POPULATE MUTATION
  ========================================================== */

  const populateMutation =
    useMutation(
      (
        payload: PopulateAcademicYearPayload
      ) =>
        academicYearServices
          .populateAcademicYear(
            payload
          ) as Promise<PopulateAcademicYearResponse>,
      {
        onSuccess: response => {
          setPopulateModalVisible(
            false
          );

          setPopulateSourceYearId(
            null
          );

          setPopulateTargetYearId(
            null
          );

          /*
           * Refresh academic years.
           *
           * Classes are managed from the
           * selected academic year screen.
           */
          queryClient.invalidateQueries(
            ["academic-years"]
          );

          const summary =
            response?.summary;

          showSnackbar(
            `Populated successfully: ${
              summary?.classesCreated ?? 0
            } classes, ${
              summary?.sectionsCreated ?? 0
            } sections, ${
              summary?.subjectsCreated ?? 0
            } subjects`,
            Colors.successBg
          );
        },

        onError: (error: any) => {
          showSnackbar(
            error?.response?.data
              ?.message ??
              error?.message ??
              "Unable to populate academic year",
            Colors.errorBg
          );
        },
      }
    );

  /* ==========================================================
     RESET CREATE FORM
  ========================================================== */

  const resetCreateForm =
    () => {
      setYearName("");
      setStartDate("");
      setEndDate("");
      setSetAsCurrent(false);
    };

  /* ==========================================================
     OPEN CREATE
  ========================================================== */

  const openCreateModal =
    () => {
      resetCreateForm();
      setCreateModalVisible(true);
    };

  /* ==========================================================
     CLOSE CREATE
  ========================================================== */

  const closeCreateModal =
    () => {
      if (
        createMutation.isLoading
      ) {
        return;
      }

      setCreateModalVisible(false);
      resetCreateForm();
    };

  /* ==========================================================
     DATE VALIDATION
  ========================================================== */

  const isValidDate =
    (
      value: string
    ) => {
      return dayjs(
        value,
        "DD/MM/YYYY",
        true
      ).isValid();
    };

  /* ==========================================================
     CREATE YEAR
  ========================================================== */

  const handleCreateYear =
    async () => {
      const name =
        yearName.trim();

      const start =
        startDate.trim();

      const end =
        endDate.trim();

      if (!name) {
        showSnackbar(
          "Academic year name is required"
        );
        return;
      }

      if (!isValidDate(start)) {
        showSnackbar(
          "Enter a valid start date in DD/MM/YYYY format"
        );
        return;
      }

      if (!isValidDate(end)) {
        showSnackbar(
          "Enter a valid end date in DD/MM/YYYY format"
        );
        return;
      }

      const parsedStart =
        dayjs(
          start,
          "DD/MM/YYYY",
          true
        );

      const parsedEnd =
        dayjs(
          end,
          "DD/MM/YYYY",
          true
        );

      if (
        !parsedEnd.isAfter(
          parsedStart
        )
      ) {
        showSnackbar(
          "End date must be after start date"
        );
        return;
      }

      await createMutation.mutateAsync(
        {
          name,
          startDate: start,
          endDate: end,
          isCurrent:
            setAsCurrent,
        }
      );
    };

  /* ==========================================================
     SET CURRENT
  ========================================================== */

  const handleSetCurrent =
    (
      year: AcademicYear
    ) => {
      if (year.isCurrent) {
        return;
      }

      setCurrentMutation.mutate(
        year.id
      );
    };

  /* ==========================================================
     FORMAT DATE
  ========================================================== */

  const formatDate =
    (
      value: string
    ) => {
      const parsed =
        dayjs(value);

      if (!parsed.isValid()) {
        return value;
      }

      return parsed.format(
        "DD MMM YYYY"
      );
    };

  /* ==========================================================
     OPEN POPULATE
  ========================================================== */

  const openPopulateModal =
    () => {
      /*
       * We need at least two academic years.
       */
      if (
        academicYears.length < 2
      ) {
        showSnackbar(
          "Create at least two academic years before populating"
        );
        return;
      }

      /*
       * Prefer the currently selected
       * year as target.
       */
      const target =
        selectedAcademicYear ??
        academicYears[0];

      /*
       * Choose another year as source.
       */
      const source =
        academicYears.find(
          year =>
            year.id !==
            target.id
        );

      setPopulateTargetYearId(
        target?.id ?? null
      );

      setPopulateSourceYearId(
        source?.id ?? null
      );

      setPopulateModalVisible(
        true
      );
    };

  /* ==========================================================
     CLOSE POPULATE
  ========================================================== */

  const closePopulateModal =
    () => {
      if (
        populateMutation.isLoading
      ) {
        return;
      }

      setPopulateModalVisible(
        false
      );

      setPopulateSourceYearId(
        null
      );

      setPopulateTargetYearId(
        null
      );
    };

  /* ==========================================================
     SOURCE YEARS
  ========================================================== */

  const sourceYears =
    useMemo(
      () =>
        academicYears.filter(
          year =>
            year.id !==
            populateTargetYearId
        ),
      [
        academicYears,
        populateTargetYearId,
      ]
    );

  /* ==========================================================
     TARGET YEARS
  ========================================================== */

  const targetYears =
    useMemo(
      () =>
        academicYears.filter(
          year =>
            year.id !==
            populateSourceYearId
        ),
      [
        academicYears,
        populateSourceYearId,
      ]
    );

  /* ==========================================================
     HANDLE POPULATE
  ========================================================== */

  const handlePopulate =
    () => {
      if (
        !populateSourceYearId
      ) {
        showSnackbar(
          "Please select source academic year"
        );
        return;
      }

      if (
        !populateTargetYearId
      ) {
        showSnackbar(
          "Please select target academic year"
        );
        return;
      }

      if (
        populateSourceYearId ===
        populateTargetYearId
      ) {
        showSnackbar(
          "Source and target academic years cannot be the same"
        );
        return;
      }

      populateMutation.mutate(
        {
          sourceAcademicYearId:
            populateSourceYearId,

          targetAcademicYearId:
            populateTargetYearId,
        }
      );
    };

  /* ==========================================================
     NAVIGATE TO CLASS MANAGEMENT
  ========================================================== */

  const handleManageClasses =
    (
      academicYearId: string
    ) => {
      navigation.navigate(
        "ClassManagement",
        {
          academicYearId,
        }
      );
    };

  /* ==========================================================
     RENDER CURRENT YEAR
  ========================================================== */

  const renderCurrentYear =
    () => {
      if (!currentAcademicYear) {
        return (
          <Card
            style={
              styles.emptyCurrentCard
            }
          >
            <Card.Content>
              <Text
                style={
                  styles.emptyTitle
                }
              >
                No Current Academic Year
              </Text>

              <Text
                style={
                  styles.emptyText
                }
              >
                Create an academic year
                and set it as current.
              </Text>
            </Card.Content>
          </Card>
        );
      }

      return (
        <Card
          style={
            styles.currentCard
          }
        >
          <Card.Content>
            <View
              style={
                styles.currentTop
              }
            >
              <View
                style={
                  styles.currentIcon
                }
              >
                <Text
                  style={
                    styles.currentIconText
                  }
                >
                  AY
                </Text>
              </View>

              <View
                style={
                  styles.currentInfo
                }
              >
                <Text
                  style={
                    styles.currentLabel
                  }
                >
                  CURRENT ACADEMIC YEAR
                </Text>

                <Text
                  style={
                    styles.currentName
                  }
                >
                  {
                    currentAcademicYear.name
                  }
                </Text>
              </View>

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
            </View>

            <Divider
              style={
                styles.currentDivider
              }
            />

            <View
              style={
                styles.currentDates
              }
            >
              <View>
                <Text
                  style={
                    styles.dateCaption
                  }
                >
                  START DATE
                </Text>

                <Text
                  style={
                    styles.dateText
                  }
                >
                  {formatDate(
                    currentAcademicYear.startDate
                  )}
                </Text>
              </View>

              <View
                style={
                  styles.dateArrowContainer
                }
              >
                <Text
                  style={
                    styles.dateArrow
                  }
                >
                  →
                </Text>
              </View>

              <View>
                <Text
                  style={
                    styles.dateCaption
                  }
                >
                  END DATE
                </Text>

                <Text
                  style={
                    styles.dateText
                  }
                >
                  {formatDate(
                    currentAcademicYear.endDate
                  )}
                </Text>
              </View>
            </View>

            <Button
              mode="contained"
              icon="school"
              onPress={() =>
                handleManageClasses(
                  currentAcademicYear.id
                )
              }
              buttonColor={
                Colors.brandPrimary
              }
              style={
                styles.currentManageButton
              }
            >
              Manage Current Classes
            </Button>
          </Card.Content>
        </Card>
      );
    };

  /* ==========================================================
     RENDER YEAR
  ========================================================== */

  const renderAcademicYear =
    ({
      item,
    }: {
      item: AcademicYear;
    }) => {
      const selected =
        item.id ===
        selectedYearId;

      return (
        <TouchableRipple
          onPress={() =>
            setSelectedYearId(
              item.id
            )
          }
          borderless
          style={[
            styles.yearTouchable,
            selected &&
              styles.yearTouchableSelected,
          ]}
        >
          <Card
            style={[
              styles.yearCard,
              selected &&
                styles.yearCardSelected,
            ]}
          >
            <Card.Content>
              <View
                style={
                  styles.yearHeader
                }
              >
                <View
                  style={
                    styles.yearInfo
                  }
                >
                  <View
                    style={
                      styles.yearNameRow
                    }
                  >
                    <Text
                      style={
                        styles.yearName
                      }
                    >
                      {item.name}
                    </Text>

                    {item.isCurrent ? (
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
                  </View>

                  <Text
                    style={
                      styles.yearDates
                    }
                  >
                    {formatDate(
                      item.startDate
                    )}
                    {"  →  "}
                    {formatDate(
                      item.endDate
                    )}
                  </Text>
                </View>

                {selected ? (
                  <View
                    style={
                      styles.selectedIndicator
                    }
                  >
                    <Text
                      style={
                        styles.selectedIndicatorText
                      }
                    >
                      ✓
                    </Text>
                  </View>
                ) : null}
              </View>

              <Divider
                style={
                  styles.yearDivider
                }
              />

              <View
                style={
                  styles.yearActions
                }
              >
                {!item.isCurrent ? (
                  <Button
                    mode="outlined"
                    compact
                    onPress={() =>
                      handleSetCurrent(
                        item
                      )
                    }
                    loading={
                      setCurrentMutation.isLoading &&
                      setCurrentMutation.variables ===
                        item.id
                    }
                    disabled={
                      setCurrentMutation.isLoading
                    }
                    textColor={
                      Colors.brandPrimary
                    }
                    style={
                      styles.actionButton
                    }
                  >
                    Set Current
                  </Button>
                ) : (
                  <View
                    style={
                      styles.currentActionPlaceholder
                    }
                  >
                    <Text
                      style={
                        styles.currentActionText
                      }
                    >
                      Active academic year
                    </Text>
                  </View>
                )}

                <Button
                  mode="contained"
                  compact
                  onPress={() =>
                    handleManageClasses(
                      item.id
                    )
                  }
                  buttonColor={
                    Colors.brandPrimary
                  }
                  style={
                    styles.actionButton
                  }
                >
                  Manage Classes
                </Button>
              </View>
            </Card.Content>
          </Card>
        </TouchableRipple>
      );
    };

  /* ==========================================================
     HEADER
  ========================================================== */

  const renderHeader =
    () => {
      return (
        <View>
          {/* ====================================================
              PAGE HEADER
          ==================================================== */}

          <View
            style={
              styles.header
            }
          >
            <View
              style={
                styles.headerText
              }
            >
              <Text
                style={
                  styles.title
                }
              >
                Academic Years
              </Text>

              <Text
                style={
                  styles.subtitle
                }
              >
                Manage academic sessions
                for your school
              </Text>
            </View>

            <Button
              mode="contained"
              icon="plus"
              onPress={
                openCreateModal
              }
              buttonColor={
                Colors.brandPrimary
              }
              contentStyle={
                styles.createButtonContent
              }
              labelStyle={
                styles.createButtonLabel
              }
            >
              Create Year
            </Button>
          </View>

          {/* ====================================================
              CURRENT YEAR
          ==================================================== */}

          <View
            style={
              styles.section
            }
          >
            <Text
              style={
                styles.sectionHeading
              }
            >
              Current Academic Year
            </Text>

            {renderCurrentYear()}
          </View>

          {/* ====================================================
              SELECTED YEAR
          ==================================================== */}

          {selectedAcademicYear ? (
            <Card
              style={
                styles.selectedYearCard
              }
            >
              <Card.Content>
                <Text
                  style={
                    styles.selectedYearCaption
                  }
                >
                  SELECTED FOR MANAGEMENT
                </Text>

                <Text
                  style={
                    styles.selectedYearName
                  }
                >
                  {
                    selectedAcademicYear.name
                  }
                </Text>

                <Text
                  style={
                    styles.selectedYearDescription
                  }
                >
                  Manage classes, sections,
                  subjects and class teachers
                  for this academic year.
                </Text>

                <View
                  style={
                    styles.selectedButtonRow
                  }
                >
                  <Button
                    mode="contained"
                    icon="school"
                    onPress={() =>
                      handleManageClasses(
                        selectedAcademicYear.id
                      )
                    }
                    buttonColor={
                      Colors.brandPrimary
                    }
                    style={
                      styles.manageSelectedButton
                    }
                  >
                    Manage Classes
                  </Button>

                  <Button
                    mode="outlined"
                    icon="content-copy"
                    onPress={
                      openPopulateModal
                    }
                    textColor={
                      Colors.brandPrimary
                    }
                    style={
                      styles.populateSelectedButton
                    }
                  >
                    Populate
                  </Button>
                </View>
              </Card.Content>
            </Card>
          ) : null}

          {/* ====================================================
              ALL YEARS
          ==================================================== */}

          <View
            style={
              styles.listTitleContainer
            }
          >
            <View>
              <Text
                style={
                  styles.listTitle
                }
              >
                All Academic Years
              </Text>

              <Text
                style={
                  styles.listSubtitle
                }
              >
                {academicYears.length} academic year
                {academicYears.length === 1
                  ? ""
                  : "s"}
              </Text>
            </View>

            {academicYears.length >= 2 ? (
              <Button
                mode="outlined"
                compact
                icon="content-copy"
                onPress={
                  openPopulateModal
                }
                textColor={
                  Colors.brandPrimary
                }
                style={
                  styles.populateHeaderButton
                }
              >
                Populate
              </Button>
            ) : null}
          </View>
        </View>
      );
    };

  /* ==========================================================
     EMPTY
  ========================================================== */

  const renderEmpty =
    () => {
      if (
        academicYearsQuery.isFetching
      ) {
        return null;
      }

      return (
        <Card
          style={
            styles.emptyListCard
          }
        >
          <Card.Content>
            <Text
              style={
                styles.emptyListTitle
              }
            >
              No academic years
            </Text>

            <Text
              style={
                styles.emptyListText
              }
            >
              Create your school's first
              academic year to continue.
            </Text>

            <Button
              mode="contained"
              onPress={
                openCreateModal
              }
              buttonColor={
                Colors.brandPrimary
              }
              style={
                styles.emptyButton
              }
            >
              Create Academic Year
            </Button>
          </Card.Content>
        </Card>
      );
    };

  /* ==========================================================
     ACADEMIC YEAR OPTION
  ========================================================== */

  const renderYearOption =
    (
      year: AcademicYear,
      selected: boolean,
      onPress: () => void
    ) => {
      return (
        <TouchableRipple
          onPress={onPress}
          borderless
          style={
            styles.yearOptionTouchable
          }
        >
          <View
            style={[
              styles.yearOption,
              selected &&
                styles.yearOptionSelected,
            ]}
          >
            <View
              style={
                styles.yearOptionRadio
              }
            >
              {selected ? (
                <View
                  style={
                    styles.yearOptionRadioInner
                  }
                />
              ) : null}
            </View>

            <View
              style={
                styles.yearOptionInfo
              }
            >
              <Text
                style={
                  styles.yearOptionName
                }
              >
                {year.name}
              </Text>

              <Text
                style={
                  styles.yearOptionDates
                }
              >
                {formatDate(
                  year.startDate
                )}
                {" → "}
                {formatDate(
                  year.endDate
                )}
              </Text>
            </View>

            {year.isCurrent ? (
              <View
                style={
                  styles.optionCurrentBadge
                }
              >
                <Text
                  style={
                    styles.optionCurrentBadgeText
                  }
                >
                  CURRENT
                </Text>
              </View>
            ) : null}
          </View>
        </TouchableRipple>
      );
    };

  /* ==========================================================
     RETURN
  ========================================================== */

  return (
    <View
      style={
        styles.container
      }
    >
      <FlatList
        data={
          academicYears
        }
        keyExtractor={
          item => item.id
        }
        renderItem={
          renderAcademicYear
        }
        ListHeaderComponent={
          renderHeader
        }
        ListEmptyComponent={
          renderEmpty
        }
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.content
        }
        refreshControl={
          <RefreshControl
            refreshing={
              academicYearsQuery
                .isFetching
            }
            onRefresh={() =>
              academicYearsQuery
                .refetch()
            }
          />
        }
      />

      {/* ======================================================
          CREATE MODAL
      ====================================================== */}

      <Portal>
        <Modal
          visible={
            createModalVisible
          }
          onDismiss={
            closeCreateModal
          }
          contentContainerStyle={
            styles.modal
          }
        >
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
                Create Academic Year
              </Text>

              <Text
                style={
                  styles.modalSubtitle
                }
              >
                Add a new academic session
              </Text>
            </View>

            <TouchableRipple
              onPress={
                closeCreateModal
              }
              borderless
              style={
                styles.closeButton
              }
            >
              <Text
                style={
                  styles.closeButtonText
                }
              >
                ×
              </Text>
            </TouchableRipple>
          </View>

          <Divider
            style={
              styles.modalDivider
            }
          />

          {/* NAME */}

          <Text
            style={
              styles.inputLabel
            }
          >
            Academic Year Name
          </Text>

          <TextInput
            mode="outlined"
            placeholder="Example: 2027-28"
            value={
              yearName
            }
            onChangeText={
              setYearName
            }
            autoCapitalize="none"
            style={
              styles.input
            }
            disabled={
              createMutation.isLoading
            }
          />

          {/* START DATE */}

          <Text
            style={
              styles.inputLabel
            }
          >
            Start Date
          </Text>

          <TextInput
            mode="outlined"
            placeholder="DD/MM/YYYY"
            value={
              startDate
            }
            onChangeText={
              setStartDate
            }
            keyboardType="numbers-and-punctuation"
            maxLength={10}
            style={
              styles.input
            }
            disabled={
              createMutation.isLoading
            }
          />

          {/* END DATE */}

          <Text
            style={
              styles.inputLabel
            }
          >
            End Date
          </Text>

          <TextInput
            mode="outlined"
            placeholder="DD/MM/YYYY"
            value={
              endDate
            }
            onChangeText={
              setEndDate
            }
            keyboardType="numbers-and-punctuation"
            maxLength={10}
            style={
              styles.input
            }
            disabled={
              createMutation.isLoading
            }
          />

          {/* CURRENT */}

          <TouchableRipple
            onPress={() =>
              setSetAsCurrent(
                value => !value
              )
            }
            borderless
            style={
              styles.currentOption
            }
          >
            <View
              style={
                styles.currentOptionRow
              }
            >
              <View
                style={[
                  styles.checkbox,
                  setAsCurrent &&
                    styles.checkboxSelected,
                ]}
              >
                {setAsCurrent ? (
                  <Text
                    style={
                      styles.checkboxText
                    }
                  >
                    ✓
                  </Text>
                ) : null}
              </View>

              <View
                style={
                  styles.currentOptionText
                }
              >
                <Text
                  style={
                    styles.currentOptionTitle
                  }
                >
                  Set as current academic year
                </Text>

                <Text
                  style={
                    styles.currentOptionSubtitle
                  }
                >
                  This will replace the
                  existing current year.
                </Text>
              </View>
            </View>
          </TouchableRipple>

          {/* ACTIONS */}

          <View
            style={
              styles.modalActions
            }
          >
            <Button
              mode="outlined"
              onPress={
                closeCreateModal
              }
              disabled={
                createMutation.isLoading
              }
              style={
                styles.modalActionButton
              }
            >
              Cancel
            </Button>

            <Button
              mode="contained"
              onPress={
                handleCreateYear
              }
              loading={
                createMutation.isLoading
              }
              disabled={
                createMutation.isLoading
              }
              buttonColor={
                Colors.brandPrimary
              }
              style={
                styles.modalActionButton
              }
            >
              Create Year
            </Button>
          </View>
        </Modal>
      </Portal>

      {/* ======================================================
          POPULATE MODAL
      ====================================================== */}

      <Portal>
        <Modal
          visible={
            populateModalVisible
          }
          onDismiss={
            closePopulateModal
          }
          contentContainerStyle={
            styles.populateModal
          }
        >
          <View
            style={
              styles.modalHeader
            }
          >
            <View
              style={
                styles.modalHeaderText
              }
            >
              <Text
                style={
                  styles.modalTitle
                }
              >
                Populate Academic Year
              </Text>

              <Text
                style={
                  styles.modalSubtitle
                }
              >
                Copy classes, sections and
                subjects to another year.
              </Text>
            </View>

            <TouchableRipple
              onPress={
                closePopulateModal
              }
              borderless
              style={
                styles.closeButton
              }
            >
              <Text
                style={
                  styles.closeButtonText
                }
              >
                ×
              </Text>
            </TouchableRipple>
          </View>

          <Divider
            style={
              styles.modalDivider
            }
          />

          {/* ==================================================
              SOURCE
          ================================================== */}

          <Text
            style={
              styles.inputLabel
            }
          >
            SOURCE ACADEMIC YEAR
          </Text>

          <Text
            style={
              styles.helperText
            }
          >
            Classes, sections and subjects
            will be copied from this year.
          </Text>

          <View
            style={
              styles.yearOptionsContainer
            }
          >
            {sourceYears.map(
              year =>
                renderYearOption(
                  year,
                  year.id ===
                    populateSourceYearId,
                  () =>
                    setPopulateSourceYearId(
                      year.id
                    )
                )
            )}
          </View>

          {/* ==================================================
              TARGET
          ================================================== */}

          <Text
            style={
              styles.inputLabel
            }
          >
            TARGET ACADEMIC YEAR
          </Text>

          <Text
            style={
              styles.helperText
            }
          >
            New classes, sections and
            subjects will be created here.
          </Text>

          <View
            style={
              styles.yearOptionsContainer
            }
          >
            {targetYears.map(
              year =>
                renderYearOption(
                  year,
                  year.id ===
                    populateTargetYearId,
                  () =>
                    setPopulateTargetYearId(
                      year.id
                    )
                )
            )}
          </View>

          {/* ==================================================
              WARNING
          ================================================== */}

          <View
            style={
              styles.populateWarning
            }
          >
            <Text
              style={
                styles.populateWarningTitle
              }
            >
              Important
            </Text>

            <Text
              style={
                styles.populateWarningText
              }
            >
              Existing target classes are not
              overwritten. The backend will reject
              the operation if target classes already
              exist.
            </Text>
          </View>

          {/* ==================================================
              ACTIONS
          ================================================== */}

          <View
            style={
              styles.modalActions
            }
          >
            <Button
              mode="outlined"
              onPress={
                closePopulateModal
              }
              disabled={
                populateMutation.isLoading
              }
              style={
                styles.modalActionButton
              }
            >
              Cancel
            </Button>

            <Button
              mode="contained"
              icon="content-copy"
              onPress={
                handlePopulate
              }
              loading={
                populateMutation.isLoading
              }
              disabled={
                populateMutation.isLoading ||
                !populateSourceYearId ||
                !populateTargetYearId
              }
              buttonColor={
                Colors.brandPrimary
              }
              style={
                styles.modalActionButton
              }
            >
              Populate Year
            </Button>
          </View>
        </Modal>
      </Portal>

      {/* ======================================================
          SNACKBAR
      ====================================================== */}

      <Snackbar
        visible={
          snackbarVisible
        }
        onDismiss={() =>
          setSnackbarVisible(
            false
          )
        }
        duration={4000}
        style={[
          styles.snackbar,
          {
            backgroundColor:
              snackbarColor,
          },
        ]}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
};

/* ============================================================
   STYLES
============================================================ */

const useStyles =
  makeStyles(() => ({
    /* ========================================================
       CONTAINER
    ======================================================== */

    container: {
      flex: 1,
      backgroundColor:
        "#F7F8FC",
    },

    content: {
      padding:
        Metrics.x4,

      paddingBottom:
        Metrics.x8,
    },

    /* ========================================================
       HEADER
    ======================================================== */

    header: {
      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      marginBottom:
        Metrics.x5,
    },

    headerText: {
      flex: 1,
      marginRight:
        Metrics.x3,
    },

    title: {
      fontSize: 28,
      fontWeight: "800",
      color: "#171717",
    },

    subtitle: {
      fontSize: 13,
      color:
        Colors.subtext,

      marginTop:
        Metrics.x1,
    },

    createButtonContent: {
      minHeight: 42,
    },

    createButtonLabel: {
      fontSize: 11,
      fontWeight: "800",
    },

    /* ========================================================
       SECTION
    ======================================================== */

    section: {
      marginBottom:
        Metrics.x4,
    },

    sectionHeading: {
      fontSize: 13,
      fontWeight: "800",
      color:
        Colors.subtext,

      textTransform:
        "uppercase",

      letterSpacing: 0.7,

      marginBottom:
        Metrics.x2,
    },

    /* ========================================================
       CURRENT YEAR
    ======================================================== */

    currentCard: {
      backgroundColor:
        "#FFFFFF",

      borderRadius: 17,

      borderWidth: 1,

      borderColor:
        "#E6E8EF",

      elevation: 2,
    },

    currentTop: {
      flexDirection:
        "row",

      alignItems:
        "center",
    },

    currentIcon: {
      width: 48,
      height: 48,

      borderRadius: 13,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        Colors.brandPrimaryBg,

      marginRight:
        Metrics.x3,
    },

    currentIconText: {
      fontSize: 13,
      fontWeight: "900",

      color:
        Colors.brandPrimary,
    },

    currentInfo: {
      flex: 1,
    },

    currentLabel: {
      fontSize: 9,
      fontWeight: "800",

      color:
        Colors.subtext,

      letterSpacing: 0.7,
    },

    currentName: {
      fontSize: 23,
      fontWeight: "900",

      color: "#171717",

      marginTop: 2,
    },

    currentBadge: {
      paddingHorizontal:
        Metrics.x2,

      paddingVertical:
        Metrics.x1,

      borderRadius: 8,

      backgroundColor:
        Colors.brandPrimaryBg,
    },

    currentBadgeText: {
      fontSize: 9,
      fontWeight: "900",

      color:
        Colors.brandPrimary,
    },

    currentDivider: {
      marginVertical:
        Metrics.x3,
    },

    currentDates: {
      flexDirection:
        "row",

      alignItems:
        "center",
    },

    dateCaption: {
      fontSize: 8,
      fontWeight: "800",

      color:
        Colors.subtext,

      letterSpacing: 0.5,
    },

    dateText: {
      fontSize: 13,
      fontWeight: "700",

      color: "#171717",

      marginTop: 3,
    },

    dateArrowContainer: {
      paddingHorizontal:
        Metrics.x4,
    },

    dateArrow: {
      fontSize: 18,

      color:
        Colors.brandPrimary,

      fontWeight: "800",
    },

    currentManageButton: {
      marginTop:
        Metrics.x4,

      borderRadius: 9,
    },

    /* ========================================================
       EMPTY CURRENT
    ======================================================== */

    emptyCurrentCard: {
      backgroundColor:
        "#FFFFFF",

      borderRadius: 16,

      borderWidth: 1,

      borderColor:
        "#E6E8EF",
    },

    emptyTitle: {
      fontSize: 16,
      fontWeight: "800",

      color: "#171717",
    },

    emptyText: {
      fontSize: 12,

      color:
        Colors.subtext,

      marginTop:
        Metrics.x1,
    },

    /* ========================================================
       SELECTED YEAR
    ======================================================== */

    selectedYearCard: {
      marginBottom:
        Metrics.x5,

      backgroundColor:
        Colors.brandPrimaryBg,

      borderRadius: 16,

      borderWidth: 1,

      borderColor:
        Colors.brandPrimary,
    },

    selectedYearCaption: {
      fontSize: 9,

      fontWeight: "900",

      letterSpacing: 0.7,

      color:
        Colors.brandPrimary,
    },

    selectedYearName: {
      fontSize: 23,

      fontWeight: "900",

      color: "#171717",

      marginTop: 2,
    },

    selectedYearDescription: {
      fontSize: 11,

      lineHeight: 17,

      color:
        Colors.subtext,

      marginTop:
        Metrics.x1,
    },

    selectedButtonRow: {
      flexDirection:
        "row",

      alignItems:
        "center",

      marginTop:
        Metrics.x3,

      gap:
        Metrics.x2,
    },

    manageSelectedButton: {
      flex: 1,
      borderRadius: 9,
    },

    populateSelectedButton: {
      borderRadius: 9,
    },

    /* ========================================================
       LIST
    ======================================================== */

    listTitleContainer: {
      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      marginBottom:
        Metrics.x3,
    },

    listTitle: {
      fontSize: 19,

      fontWeight: "900",

      color: "#171717",
    },

    listSubtitle: {
      fontSize: 11,

      color:
        Colors.subtext,

      marginTop: 2,
    },

    populateHeaderButton: {
      borderRadius: 8,
    },

    /* ========================================================
       YEAR CARD
    ======================================================== */

    yearTouchable: {
      borderRadius: 16,

      marginBottom:
        Metrics.x3,
    },

    yearTouchableSelected: {
      borderRadius: 16,
    },

    yearCard: {
      backgroundColor:
        "#FFFFFF",

      borderRadius: 16,

      borderWidth: 1,

      borderColor:
        "#E7E9EF",

      elevation: 1,
    },

    yearCardSelected: {
      borderColor:
        Colors.brandPrimary,

      borderWidth: 1.5,
    },

    yearHeader: {
      flexDirection:
        "row",

      alignItems:
        "center",
    },

    yearInfo: {
      flex: 1,
    },

    yearNameRow: {
      flexDirection:
        "row",

      alignItems:
        "center",
    },

    yearName: {
      fontSize: 18,

      fontWeight: "900",

      color: "#171717",
    },

    smallCurrentBadge: {
      marginLeft:
        Metrics.x2,

      paddingHorizontal:
        Metrics.x2,

      paddingVertical: 3,

      borderRadius: 6,

      backgroundColor:
        Colors.brandPrimaryBg,
    },

    smallCurrentBadgeText: {
      fontSize: 8,

      fontWeight: "900",

      color:
        Colors.brandPrimary,
    },

    yearDates: {
      fontSize: 11,

      color:
        Colors.subtext,

      marginTop:
        Metrics.x1,
    },

    selectedIndicator: {
      width: 28,
      height: 28,

      borderRadius: 9,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        Colors.brandPrimaryBg,
    },

    selectedIndicatorText: {
      fontSize: 15,

      fontWeight: "900",

      color:
        Colors.brandPrimary,
    },

    yearDivider: {
      marginVertical:
        Metrics.x3,
    },

    yearActions: {
      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "flex-end",

      gap:
        Metrics.x2,
    },

    actionButton: {
      borderRadius: 8,
    },

    currentActionPlaceholder: {
      flex: 1,
    },

    currentActionText: {
      fontSize: 10,

      color:
        Colors.subtext,

      fontWeight: "600",
    },

    /* ========================================================
       EMPTY LIST
    ======================================================== */

    emptyListCard: {
      backgroundColor:
        "#FFFFFF",

      borderRadius: 16,

      borderWidth: 1,

      borderColor:
        "#E7E9EF",
    },

    emptyListTitle: {
      fontSize: 17,

      fontWeight: "800",

      color: "#171717",
    },

    emptyListText: {
      fontSize: 12,

      color:
        Colors.subtext,

      marginTop:
        Metrics.x1,

      lineHeight: 18,
    },

    emptyButton: {
      marginTop:
        Metrics.x3,
    },

    /* ========================================================
       CREATE MODAL
    ======================================================== */

    modal: {
      marginHorizontal:
        Metrics.x4,

      padding:
        Metrics.x4,

      borderRadius: 18,

      backgroundColor:
        "#FFFFFF",
    },

    modalHeader: {
      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",
    },

    modalHeaderText: {
      flex: 1,
    },

    modalTitle: {
      fontSize: 20,

      fontWeight: "900",

      color: "#171717",
    },

    modalSubtitle: {
      fontSize: 11,

      color:
        Colors.subtext,

      marginTop: 2,
    },

    closeButton: {
      width: 34,
      height: 34,

      borderRadius: 10,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        "#F5F6F8",
    },

    closeButtonText: {
      fontSize: 25,

      lineHeight: 27,

      color:
        Colors.subtext,
    },

    modalDivider: {
      marginVertical:
        Metrics.x3,
    },

    inputLabel: {
      fontSize: 11,

      fontWeight: "800",

      color: "#171717",

      marginBottom:
        Metrics.x1,

      marginTop:
        Metrics.x2,
    },

    input: {
      backgroundColor:
        "#FFFFFF",
    },

    /* ========================================================
       CURRENT OPTION
    ======================================================== */

    currentOption: {
      marginTop:
        Metrics.x4,

      padding:
        Metrics.x2,

      borderRadius: 10,

      backgroundColor:
        "#F8F9FB",
    },

    currentOptionRow: {
      flexDirection:
        "row",

      alignItems:
        "center",
    },

    checkbox: {
      width: 23,
      height: 23,

      borderRadius: 6,

      borderWidth: 1.5,

      borderColor:
        "#C9CCD5",

      alignItems:
        "center",

      justifyContent:
        "center",

      marginRight:
        Metrics.x2,
    },

    checkboxSelected: {
      backgroundColor:
        Colors.brandPrimary,

      borderColor:
        Colors.brandPrimary,
    },

    checkboxText: {
      color: "#FFFFFF",

      fontSize: 14,

      fontWeight: "900",
    },

    currentOptionText: {
      flex: 1,
    },

    currentOptionTitle: {
      fontSize: 11,

      fontWeight: "800",

      color: "#171717",
    },

    currentOptionSubtitle: {
      fontSize: 9,

      color:
        Colors.subtext,

      marginTop: 2,
    },

    /* ========================================================
       POPULATE MODAL
    ======================================================== */

    populateModal: {
      marginHorizontal:
        Metrics.x3,

      maxHeight: "90%",

      padding:
        Metrics.x4,

      borderRadius: 18,

      backgroundColor:
        "#FFFFFF",
    },

    helperText: {
      fontSize: 10,

      lineHeight: 15,

      color:
        Colors.subtext,

      marginBottom:
        Metrics.x2,
    },

    yearOptionsContainer: {
      maxHeight: 150,

      borderWidth: 1,

      borderColor:
        "#E5E7ED",

      borderRadius: 12,

      overflow: "hidden",
    },

    yearOptionTouchable: {
      borderRadius: 10,
    },

    yearOption: {
      flexDirection:
        "row",

      alignItems:
        "center",

      paddingHorizontal:
        Metrics.x2,

      paddingVertical:
        Metrics.x2,

      backgroundColor:
        "#FFFFFF",
    },

    yearOptionSelected: {
      backgroundColor:
        Colors.brandPrimaryBg,
    },

    yearOptionRadio: {
      width: 20,
      height: 20,

      borderRadius: 10,

      borderWidth: 1.5,

      borderColor:
        "#BFC3CD",

      alignItems:
        "center",

      justifyContent:
        "center",

      marginRight:
        Metrics.x2,
    },

    yearOptionRadioInner: {
      width: 10,
      height: 10,

      borderRadius: 5,

      backgroundColor:
        Colors.brandPrimary,
    },

    yearOptionInfo: {
      flex: 1,
    },

    yearOptionName: {
      fontSize: 12,

      fontWeight: "800",

      color: "#171717",
    },

    yearOptionDates: {
      fontSize: 9,

      color:
        Colors.subtext,

      marginTop: 2,
    },

    optionCurrentBadge: {
      paddingHorizontal:
        Metrics.x1,

      paddingVertical: 3,

      borderRadius: 5,

      backgroundColor:
        Colors.brandPrimaryBg,
    },

    optionCurrentBadgeText: {
      fontSize: 7,

      fontWeight: "900",

      color:
        Colors.brandPrimary,
    },

    populateWarning: {
      marginTop:
        Metrics.x3,

      padding:
        Metrics.x2,

      borderRadius: 10,

      backgroundColor:
        "#FFF8E7",

      borderWidth: 1,

      borderColor:
        "#F0D58A",
    },

    populateWarningTitle: {
      fontSize: 10,

      fontWeight: "900",

      color: "#8A6500",
    },

    populateWarningText: {
      fontSize: 9,

      lineHeight: 14,

      color: "#765D18",

      marginTop: 2,
    },

    /* ========================================================
       MODAL ACTIONS
    ======================================================== */

    modalActions: {
      flexDirection:
        "row",

      justifyContent:
        "flex-end",

      gap:
        Metrics.x2,

      marginTop:
        Metrics.x5,
    },

    modalActionButton: {
      borderRadius: 9,
    },

    /* ========================================================
       SNACKBAR
    ======================================================== */

    snackbar: {
      borderRadius: 10,
    },
  }));

/* ============================================================
   EXPORT
============================================================ */

export {
  AcademicYearManagementScreen,
};