import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  Button,
  Snackbar,
  TextInput,
} from "react-native-paper";

import {
  useQuery,
  useQueryClient,
} from "react-query";

import {
  Controller,
  useForm,
} from "react-hook-form";

import type {
  NativeStackScreenProps,
} from "@react-navigation/native-stack";

import {
  RootStackParamList,
  RootStackScreenNames,
  Student,
  CreateStudentFormFields,
} from "../types";

import {
  Page,
} from "../components";

import {
  Colors,
  Metrics,
} from "../theme";

import {
  studentServices,
} from "../services/studentServices";

import {
  isAadhaarValid,
  isNonEmptyAlphabetsWithSpace,
  isNonEmptyAlphaNumerals,
  isNonEmptyDecimalNumber,
  isValidDate,
  isValidPhoneNo,
} from "../utils";


/* ============================================================
   PROPS
============================================================ */

type Props =
  NativeStackScreenProps<
    RootStackParamList,
    RootStackScreenNames.EditStudent
  >;


/* ============================================================
   LOCAL TYPES
============================================================ */

type AcademicYearOption = {
  id: string;
  name: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
};

type ClassOption = {
  id: string;
  academicYearId?: string;
  classNumber: string;
  displayName?: string;
};

type SectionOption = {
  id: string;
  classId: string;
  sectionName: string;
};


/* ============================================================
   SCREEN
============================================================ */

const EditStudentScreen = ({
  route,
  navigation,
}: Props) => {

  const preFetchedData =
    route.params?.preFetchedData as Student;


  /* ============================================================
     QUERY CLIENT
  ============================================================ */

  const queryClient =
    useQueryClient();


  /* ============================================================
     REGISTRATION OPTIONS
  ============================================================ */

  const {
    data: registrationOptions,
    isLoading:
      loadingRegistrationOptions,
    isError:
      registrationOptionsError,
    refetch:
      refetchRegistrationOptions,
  } = useQuery(
    [
      "student-registration-options",
    ],
    studentServices.getRegistrationOptions,
    {
      staleTime:
        5 * 60 * 1000,

      cacheTime:
        10 * 60 * 1000,
    }
  );


  /* ============================================================
     INITIAL VALUES FROM STUDENT
  ============================================================ */

  const initialAcademicYearId =
    preFetchedData?.academicYearId ??
    "";

  const initialClassNumber =
    preFetchedData?.classNumber
      ?.classNumber != null
      ? String(
          preFetchedData.classNumber
            .classNumber
        )
      : "";

  const initialSectionName =
    preFetchedData?.sectionName ??
    "";


  /* ============================================================
     SELECTED ACADEMIC YEAR
  ============================================================ */

  const [
    selectedAcademicYear,
    setSelectedAcademicYear,
  ] = useState<string>(
    initialAcademicYearId
  );


  /* ============================================================
     SELECTED CLASS
  ============================================================ */

  const [
    selectedClass,
    setSelectedClass,
  ] = useState<string>(
    initialClassNumber
  );


  /* ============================================================
     SELECTED SECTION
  ============================================================ */

  const [
    selectedSection,
    setSelectedSection,
  ] = useState<string>(
    initialSectionName
  );


  /* ============================================================
     FORM
  ============================================================ */

  const {
    control,
    handleSubmit,
    formState: {
      errors,
    },
    setError,
  } =
    useForm<CreateStudentFormFields>({
      defaultValues: {

        admissionNo:
          preFetchedData?.admissionNo ??
          "",

        name:
          preFetchedData?.name ??
          "",

        aadhaar:
          preFetchedData?.aadhaar ??
          "",

        fatherName:
          preFetchedData?.fatherName ??
          "",

  

        dob:
          preFetchedData?.dob ??
          "",

        doj:
          preFetchedData?.doj ??
          "",

        phoneNo:
          preFetchedData?.phoneNo ??
          "",

        tcNo:
          preFetchedData?.tcNo ??
          "",

        siblings:
          Array.isArray(
            preFetchedData?.siblings
          )
            ? preFetchedData.siblings
            : [],

        academicYearId:
          initialAcademicYearId,

        classNumber:
          initialClassNumber,

        sectionName:
          initialSectionName,

        tie:
          preFetchedData?.tie
            ?.amount ??
          "0",

        diary:
          preFetchedData?.diary
            ?.amount ??
          "0",

        belt:
          preFetchedData?.belt
            ?.amount ??
          "0",

        arrears:
          preFetchedData?.arrears
            ?.amount ??
          "0",

        /*
         * IMPORTANT:
         *
         * We deliberately do NOT preload the old coupon
         * into the edit form.
         *
         * An already-applied coupon must not be reapplied
         * every time the student is edited.
         */
        couponCode:
          "",
      },
    });


  /* ============================================================
     LOADING
  ============================================================ */

  const [
    loading,
    setLoading,
  ] = useState(false);


  /* ============================================================
     SNACKBAR
  ============================================================ */

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
    Colors.successBg
  );


  const showSnackbar = (
    message: string,
    backgroundColor: string
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


  /* ============================================================
     NORMALIZE ACADEMIC YEARS
  ============================================================ */

  const availableAcademicYears =
    useMemo<AcademicYearOption[]>(() => {

      if (!registrationOptions) {
        return [];
      }

      return Array.isArray(
        registrationOptions.academicYears
      )
        ? registrationOptions.academicYears
        : [];

    }, [
      registrationOptions,
    ]);


  /* ============================================================
     NORMALIZE CLASSES
  ============================================================ */

  const availableClasses =
    useMemo<ClassOption[]>(() => {

      if (!registrationOptions) {
        return [];
      }

      /*
       * Expected backend format:
       *
       * {
       *   academicYears: [],
       *   classes: [],
       *   sections: []
       * }
       */

      if (
        Array.isArray(
          registrationOptions.classes
        )
      ) {

        return registrationOptions.classes.map(
          (item: any) => ({
            id:
              String(item.id),

            academicYearId:
              item.academicYearId
                ? String(
                    item.academicYearId
                  )
                : undefined,

            classNumber:
              String(
                item.classNumber
              ),

            displayName:
              item.displayName ??
              String(
                item.classNumber
              ),
          })
        );
      }


      /*
       * Fallback if backend nests classes
       * inside academicYears.
       */

      const result: ClassOption[] = [];

      for (
        const year of
          availableAcademicYears
      ) {

        const classes =
          (year as any).classes;

        if (
          !Array.isArray(classes)
        ) {
          continue;
        }

        for (
          const item of classes
        ) {

          result.push({
            id:
              String(item.id),

            academicYearId:
              String(year.id),

            classNumber:
              String(
                item.classNumber
              ),

            displayName:
              item.displayName ??
              String(
                item.classNumber
              ),
          });
        }
      }

      return result;

    }, [
      registrationOptions,
      availableAcademicYears,
    ]);


  /* ============================================================
     CLASSES FOR SELECTED ACADEMIC YEAR
  ============================================================ */

  const classesForSelectedYear =
    useMemo(() => {

      if (
        !selectedAcademicYear
      ) {
        return [];
      }

      return availableClasses.filter(
        (item) => {

          /*
           * Some APIs may omit academicYearId
           * because classes are already nested.
           *
           * In that case, retain the class if
           * it belongs to the selected year
           * through the nested structure.
           */

          if (
            item.academicYearId
          ) {

            return (
              String(
                item.academicYearId
              ) ===
              String(
                selectedAcademicYear
              )
            );
          }

          return false;
        }
      );

    }, [
      availableClasses,
      selectedAcademicYear,
    ]);


  /* ============================================================
     SELECTED CLASS DETAILS
  ============================================================ */

  const selectedClassDetails =
    useMemo(() => {

      return classesForSelectedYear.find(
        (item) =>
          String(
            item.classNumber
          ) ===
          String(
            selectedClass
          )
      );

    }, [
      classesForSelectedYear,
      selectedClass,
    ]);


  /* ============================================================
     NORMALIZE SECTIONS
  ============================================================ */

  const availableSections =
    useMemo<SectionOption[]>(() => {

      if (!registrationOptions) {
        return [];
      }

      /*
       * Flat backend response:
       *
       * sections: [
       *   {
       *     id,
       *     classId,
       *     sectionName
       *   }
       * ]
       */

      if (
        Array.isArray(
          registrationOptions.sections
        )
      ) {

        return registrationOptions.sections.map(
          (item: any) => ({
            id:
              String(item.id),

            classId:
              String(item.classId),

            sectionName:
              String(
                item.sectionName
              ),
          })
        );
      }


      /*
       * Fallback for nested classes.
       */

      if (
        selectedClassDetails &&
        Array.isArray(
          (selectedClassDetails as any)
            .sections
        )
      ) {

        return (
          (selectedClassDetails as any)
            .sections
        ).map(
          (item: any) => ({
            id:
              String(item.id),

            classId:
              String(
                selectedClassDetails.id
              ),

            sectionName:
              String(
                item.sectionName
              ),
          })
        );
      }

      return [];

    }, [
      registrationOptions,
      selectedClassDetails,
    ]);


  /* ============================================================
     KEEP EXISTING CLASS/SECTION AFTER OPTIONS LOAD
  ============================================================ */

  useEffect(() => {

    if (
      !registrationOptions
    ) {
      return;
    }

    /*
     * Do not overwrite the values supplied
     * by GET /student/get.
     *
     * They are authoritative for this student.
     */

    if (
      initialAcademicYearId &&
      !selectedAcademicYear
    ) {

      setSelectedAcademicYear(
        initialAcademicYearId
      );
    }

    if (
      initialClassNumber &&
      !selectedClass
    ) {

      setSelectedClass(
        initialClassNumber
      );
    }

    if (
      initialSectionName &&
      !selectedSection
    ) {

      setSelectedSection(
        initialSectionName
      );
    }

  }, [
    registrationOptions,
    initialAcademicYearId,
    initialClassNumber,
    initialSectionName,
    selectedAcademicYear,
    selectedClass,
    selectedSection,
  ]);


  /* ============================================================
     DEBUG
  ============================================================ */

  useEffect(() => {

    console.log(
      "========== EDIT STUDENT =========="
    );

    console.log(
      "STUDENT:",
      JSON.stringify(
        preFetchedData,
        null,
        2
      )
    );

    console.log(
      "REGISTRATION OPTIONS:",
      JSON.stringify(
        registrationOptions,
        null,
        2
      )
    );

    console.log(
      "SELECTED ACADEMIC YEAR:",
      selectedAcademicYear
    );

    console.log(
      "SELECTED CLASS:",
      selectedClass
    );

    console.log(
      "SELECTED SECTION:",
      selectedSection
    );

    console.log(
      "AVAILABLE CLASSES:",
      classesForSelectedYear
    );

    console.log(
      "AVAILABLE SECTIONS:",
      availableSections
    );

  }, [
    preFetchedData,
    registrationOptions,
    selectedAcademicYear,
    selectedClass,
    selectedSection,
    classesForSelectedYear,
    availableSections,
  ]);


  /* ============================================================
     VALIDATION
  ============================================================ */

  const validateData = (
    data: CreateStudentFormFields
  ) => {

    if (
      !selectedAcademicYear
    ) {

      showSnackbar(
        "Please select an academic year.",
        Colors.errorBg
      );

      return false;
    }


    if (!selectedClass) {

      showSnackbar(
        "Please select a class.",
        Colors.errorBg
      );

      return false;
    }


    if (!selectedSection) {

      showSnackbar(
        "Please select a section.",
        Colors.errorBg
      );

      return false;
    }


    if (
      !isNonEmptyAlphaNumerals(
        data.admissionNo
      )
    ) {

      setError(
        "admissionNo",
        {
          message:
            "Invalid admission number",
        }
      );

      return false;
    }


    if (
      !isNonEmptyAlphabetsWithSpace(
        data.name
      )
    ) {

      setError(
        "name",
        {
          message:
            "Invalid student name",
        }
      );

      return false;
    }


    if (
      !isAadhaarValid(
        data.aadhaar
      )
    ) {

      setError(
        "aadhaar",
        {
          message:
            "Invalid Aadhaar number",
        }
      );

      return false;
    }


    if (
      !isNonEmptyAlphabetsWithSpace(
        data.fatherName
      )
    ) {

      setError(
        "fatherName",
        {
          message:
            "Invalid father name",
        }
      );

      return false;
    }


    if (
      !isValidDate(
        data.dob
      )
    ) {

      setError(
        "dob",
        {
          message:
            "Invalid date",
        }
      );

      return false;
    }


    if (
      !isValidDate(
        data.doj
      )
    ) {

      setError(
        "doj",
        {
          message:
            "Invalid date",
        }
      );

      return false;
    }


    if (
      !isValidPhoneNo(
        data.phoneNo
      )
    ) {

      setError(
        "phoneNo",
        {
          message:
            "Invalid phone number",
        }
      );

      return false;
    }


    const feeFields = [
      {
        name: "tie" as const,
        value: data.tie,
      },
      {
        name: "diary" as const,
        value: data.diary,
      },
      {
        name: "belt" as const,
        value: data.belt,
      },
      {
        name: "arrears" as const,
        value: data.arrears,
      },
    ];


    for (
      const field of feeFields
    ) {

      if (
        !isNonEmptyDecimalNumber(
          field.value
        )
      ) {

        setError(
          field.name,
          {
            message:
              "Invalid amount",
          }
        );

        return false;
      }
    }


    return true;
  };


  /* ============================================================
     SUBMIT
  ============================================================ */

  const onSubmit = async (
    data: CreateStudentFormFields
  ) => {

    if (
      !validateData(data)
    ) {
      return;
    }


    if (loading) {
      return;
    }


    setLoading(true);


    try {

      const siblings =
        Array.isArray(
          data.siblings
        )
          ? data.siblings
          : [];


      /*
       * IMPORTANT
       *
       * Do NOT send the old coupon code.
       *
       * The student's existing coupon is already
       * applied in the database.
       *
       * Sending it again causes:
       *
       * "Coupon is not active"
       */

      const editPayload = {

        admissionNo:
          data.admissionNo,

        oldAdmissionNo:
          preFetchedData.admissionNo,

        name:
          data.name,

        aadhaar:
          data.aadhaar,

        fatherName:
          data.fatherName,

        dob:
          data.dob,

        doj:
          data.doj,

        phoneNo:
          data.phoneNo,

        academicYearId:
          selectedAcademicYear,

        classNumber:
          selectedClass,

        sectionName:
          selectedSection,

        tie:
          data.tie,

        belt:
          data.belt,

        arrears:
          data.arrears,

        diary:
          data.diary,

        /*
         * REQUIRED BY MIDDLEWARE
         */
        siblings,

        /*
         * Do NOT include couponCode here.
         */

        tcNo:
          data.tcNo?.trim()
            ? data.tcNo.trim()
            : undefined,
      };


      console.log(
        "EDIT STUDENT PAYLOAD:",
        JSON.stringify(
          editPayload,
          null,
          2
        )
      );


      await studentServices.editStudent(
        editPayload as any
      );


      /* ========================================================
         REFRESH
      ======================================================== */

      await queryClient.refetchQueries(
        [
          "student",
          preFetchedData.admissionNo,
        ]
      );


      await queryClient.refetchQueries(
        [
          "principal-class-student-counts",
        ]
      );


      await queryClient.refetchQueries(
        [
          "student-registration-options",
        ]
      );


      /* ========================================================
         SUCCESS
      ======================================================== */

      showSnackbar(
        "Student details updated successfully.",
        Colors.successBg
      );


      /*
       * Give Snackbar a moment to render,
       * then go to Student Details.
       */

      const updatedStudent =
  await studentServices.getStudentById({
    admissionNo: data.admissionNo,
  });

navigation.navigate(
  RootStackScreenNames.StudentDetails,
  {
    student: updatedStudent,
  }
);

    } catch (
      err: any
    ) {

      console.log(
        "EDIT STUDENT ERROR:",
        err?.response?.data ??
          err
      );


      showSnackbar(
        err?.response?.data?.message ??
          "Unable to update student.",
        Colors.errorBg
      );

    } finally {

      setLoading(false);
    }
  };


  /* ============================================================
     ERROR
  ============================================================ */

  const renderError = (
    message?: string
  ) => {

    if (!message) {
      return null;
    }

    return (
      <Text
        style={styles.error}
      >
        {message}
      </Text>
    );
  };


  /* ============================================================
     RENDER
  ============================================================ */

  return (

    <FlatList
      data={["form"]}
      keyExtractor={
        (item) => item
      }
      showsVerticalScrollIndicator={
        false
      }
      keyboardShouldPersistTaps="handled"
      renderItem={() => (

        <Page>

          {/* ==================================================
              HEADER
          ================================================== */}

          <Text
            style={styles.title}
          >
            Edit Student
          </Text>

          <Text
            style={styles.subtitle}
          >
            Update student information
          </Text>


          {/* ==================================================
              ACADEMIC YEAR
          ================================================== */}

          <Text
            style={styles.sectionTitle}
          >
            Academic Year
          </Text>


          {loadingRegistrationOptions ? (

            <Text
              style={
                styles.helperText
              }
            >
              Loading academic years...
            </Text>

          ) : registrationOptionsError ? (

            <View>

              <Text
                style={
                  styles.helperText
                }
              >
                Unable to load academic years.
              </Text>

              <Button
                mode="outlined"
                onPress={() =>
                  refetchRegistrationOptions()
                }
              >
                RETRY
              </Button>

            </View>

          ) : availableAcademicYears.length === 0 ? (

            <Text
              style={
                styles.helperText
              }
            >
              No academic years available.
            </Text>

          ) : (

            <FlatList
              horizontal
              data={
                availableAcademicYears
              }
              keyExtractor={
                (item) =>
                  String(item.id)
              }
              showsHorizontalScrollIndicator={
                false
              }
              renderItem={({
                item,
              }) => {

                const selected =
                  String(
                    selectedAcademicYear
                  ) ===
                  String(
                    item.id
                  );

                return (
                  <Button
                    mode={
                      selected
                        ? "contained"
                        : "outlined"
                    }
                    onPress={() => {

                      if (
                        String(
                          item.id
                        ) ===
                        String(
                          selectedAcademicYear
                        )
                      ) {
                        return;
                      }

                      setSelectedAcademicYear(
                        String(
                          item.id
                        )
                      );

                      /*
                       * Changing academic year
                       * means class and section
                       * must be selected again.
                       */
                      setSelectedClass(
                        ""
                      );

                      setSelectedSection(
                        ""
                      );
                    }}
                    style={
                      styles.optionButton
                    }
                  >
                    {item.name}
                  </Button>
                );
              }}
            />

          )}


          {/* ==================================================
              CLASS
          ================================================== */}

          <Text
            style={styles.sectionTitle}
          >
            Class
          </Text>


          {!selectedAcademicYear ? (

            <Text
              style={
                styles.helperText
              }
            >
              Select academic year first.
            </Text>

          ) : classesForSelectedYear.length === 0 ? (

            <Text
              style={
                styles.helperText
              }
            >
              No classes available for this academic year.
            </Text>

          ) : (

            <FlatList
              horizontal
              data={
                classesForSelectedYear
              }
              keyExtractor={
                (item) =>
                  String(item.id)
              }
              showsHorizontalScrollIndicator={
                false
              }
              renderItem={({
                item,
              }) => {

                const classValue =
                  String(
                    item.classNumber
                  );

                const selected =
                  String(
                    selectedClass
                  ) ===
                  classValue;

                return (
                  <Button
                    mode={
                      selected
                        ? "contained"
                        : "outlined"
                    }
                    onPress={() => {

                      setSelectedClass(
                        classValue
                      );

                      /*
                       * Changing class resets section.
                       */
                      setSelectedSection(
                        ""
                      );
                    }}
                    style={
                      styles.optionButton
                    }
                  >
                    {item.displayName ??
                      item.classNumber}
                  </Button>
                );
              }}
            />

          )}


          {/* ==================================================
              SECTION
          ================================================== */}

          <Text
            style={styles.sectionTitle}
          >
            Section
          </Text>


          {!selectedClass ? (

            <Text
              style={
                styles.helperText
              }
            >
              Select class first.
            </Text>

          ) : availableSections.length === 0 ? (

            <Text
              style={
                styles.helperText
              }
            >
              No sections available for this class.
            </Text>

          ) : (

            <FlatList
              horizontal
              data={
                availableSections
              }
              keyExtractor={
                (item) =>
                  String(item.id)
              }
              showsHorizontalScrollIndicator={
                false
              }
              renderItem={({
                item,
              }) => {

                const selected =
                  String(
                    selectedSection
                  ) ===
                  String(
                    item.sectionName
                  );

                return (
                  <Button
                    mode={
                      selected
                        ? "contained"
                        : "outlined"
                    }
                    onPress={() =>
                      setSelectedSection(
                        String(
                          item.sectionName
                        )
                      )
                    }
                    style={
                      styles.optionButton
                    }
                  >
                    {item.sectionName}
                  </Button>
                );
              }}
            />

          )}


          {/* ==================================================
              STUDENT INFORMATION
          ================================================== */}

          <Text
            style={styles.sectionTitle}
          >
            Student Information
          </Text>


          <Controller
            control={control}
            name="admissionNo"
            render={({
              field: {
                value,
              },
            }) => (

              <TextInput
                label="Admission No."
                value={value}
                mode="outlined"
                editable={false}
                style={
                  styles.input
                }
              />

            )}
          />


          <Controller
            control={control}
            name="name"
            render={({
              field: {
                onChange,
                value,
              },
            }) => (

              <TextInput
                label="Student Name"
                value={value}
                onChangeText={
                  onChange
                }
                mode="outlined"
                error={
                  !!errors.name
                }
                style={
                  styles.input
                }
              />

            )}
          />

          {renderError(
            errors.name?.message
          )}


          <Controller
            control={control}
            name="aadhaar"
            render={({
              field: {
                onChange,
                value,
              },
            }) => (

              <TextInput
                label="Aadhaar Number"
                value={value}
                onChangeText={
                  onChange
                }
                mode="outlined"
                keyboardType="numeric"
                maxLength={12}
                error={
                  !!errors.aadhaar
                }
                style={
                  styles.input
                }
              />

            )}
          />

          {renderError(
            errors.aadhaar?.message
          )}


          <Controller
            control={control}
            name="fatherName"
            render={({
              field: {
                onChange,
                value,
              },
            }) => (

              <TextInput
                label="Father Name"
                value={value}
                onChangeText={
                  onChange
                }
                mode="outlined"
                error={
                  !!errors.fatherName
                }
                style={
                  styles.input
                }
              />

            )}
          />

          {renderError(
            errors.fatherName?.message
          )}


          {/* <Controller
            control={control}
            name="motherName"
            render={({
              field: {
                onChange,
                value,
              },
            }) => (

              <TextInput
                label="Mother Name"
                value={value}
                onChangeText={
                  onChange
                }
                mode="outlined"
                style={
                  styles.input
                }
              />

            )}
          /> */}


          {/* ==================================================
              DATES
          ================================================== */}

          <Text
            style={styles.sectionTitle}
          >
            Dates
          </Text>


          <Controller
            control={control}
            name="dob"
            render={({
              field: {
                onChange,
                value,
              },
            }) => (

              <TextInput
                label="Date of Birth"
                value={value}
                onChangeText={
                  onChange
                }
                mode="outlined"
                placeholder="DD/MM/YYYY"
                error={
                  !!errors.dob
                }
                style={
                  styles.input
                }
              />

            )}
          />

          {renderError(
            errors.dob?.message
          )}


          <Controller
            control={control}
            name="doj"
            render={({
              field: {
                onChange,
                value,
              },
            }) => (

              <TextInput
                label="Date of Joining"
                value={value}
                onChangeText={
                  onChange
                }
                mode="outlined"
                placeholder="DD/MM/YYYY"
                error={
                  !!errors.doj
                }
                style={
                  styles.input
                }
              />

            )}
          />

          {renderError(
            errors.doj?.message
          )}


          {/* ==================================================
              CONTACT
          ================================================== */}

          <Text
            style={styles.sectionTitle}
          >
            Contact
          </Text>


          <Controller
            control={control}
            name="phoneNo"
            render={({
              field: {
                onChange,
                value,
              },
            }) => (

              <TextInput
                label="Phone Number"
                value={value}
                onChangeText={
                  onChange
                }
                mode="outlined"
                keyboardType="phone-pad"
                maxLength={10}
                error={
                  !!errors.phoneNo
                }
                style={
                  styles.input
                }
              />

            )}
          />

          {renderError(
            errors.phoneNo?.message
          )}


          <Controller
            control={control}
            name="tcNo"
            render={({
              field: {
                onChange,
                value,
              },
            }) => (

              <TextInput
                label="TC No. (Optional)"
                value={
                  value ?? ""
                }
                onChangeText={
                  onChange
                }
                mode="outlined"
                style={
                  styles.input
                }
              />

            )}
          />


          {/* ==================================================
              ADDITIONAL FEES
          ================================================== */}

          <Text
            style={styles.sectionTitle}
          >
            Additional Fees
          </Text>


          <Controller
            control={control}
            name="tie"
            render={({
              field: {
                onChange,
                value,
              },
            }) => (

              <TextInput
                label="Tie"
                value={value}
                onChangeText={
                  onChange
                }
                mode="outlined"
                keyboardType="decimal-pad"
                error={
                  !!errors.tie
                }
                style={
                  styles.input
                }
              />

            )}
          />

          {renderError(
            errors.tie?.message
          )}


          <Controller
            control={control}
            name="diary"
            render={({
              field: {
                onChange,
                value,
              },
            }) => (

              <TextInput
                label="Diary"
                value={value}
                onChangeText={
                  onChange
                }
                mode="outlined"
                keyboardType="decimal-pad"
                error={
                  !!errors.diary
                }
                style={
                  styles.input
                }
              />

            )}
          />

          {renderError(
            errors.diary?.message
          )}


          <Controller
            control={control}
            name="belt"
            render={({
              field: {
                onChange,
                value,
              },
            }) => (

              <TextInput
                label="Belt"
                value={value}
                onChangeText={
                  onChange
                }
                mode="outlined"
                keyboardType="decimal-pad"
                error={
                  !!errors.belt
                }
                style={
                  styles.input
                }
              />

            )}
          />

          {renderError(
            errors.belt?.message
          )}


          <Controller
            control={control}
            name="arrears"
            render={({
              field: {
                onChange,
                value,
              },
            }) => (

              <TextInput
                label="Arrears / Previous Balance"
                value={value}
                onChangeText={
                  onChange
                }
                mode="outlined"
                keyboardType="decimal-pad"
                error={
                  !!errors.arrears
                }
                style={
                  styles.input
                }
              />

            )}
          />

          {renderError(
            errors.arrears?.message
          )}


          {/* ==================================================
              COUPON INFORMATION
          ================================================== */}

          <Text
            style={styles.sectionTitle}
          >
            Coupon
          </Text>

          <Text
            style={styles.couponInfo}
          >
            Existing applied coupons are not
            changed during a normal student edit.
          </Text>


          {/* ==================================================
              UPDATE
          ================================================== */}

          <Button
            mode="contained"
            loading={
              loading ||
              loadingRegistrationOptions
            }
            disabled={
              loading ||
              loadingRegistrationOptions
            }
            onPress={
              handleSubmit(
                onSubmit
              )
            }
            style={
              styles.submitButton
            }
            contentStyle={
              styles.submitContent
            }
          >
            UPDATE STUDENT
          </Button>


          <View
            style={
              styles.bottomSpace
            }
          />


          {/* ==================================================
              SNACKBAR
          ================================================== */}

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

        </Page>
      )}
    />
  );
};


/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({

    title: {
      fontSize: 28,
      fontWeight: "700",
      marginBottom:
        Metrics.x1,
    },

    subtitle: {
      fontSize: 15,
      color:
        Colors.subtext,
      marginBottom:
        Metrics.x5,
    },

    sectionTitle: {
      fontSize: 18,
      fontWeight: "700",
      marginTop:
        Metrics.x3,
      marginBottom:
        Metrics.x3,
    },

    input: {
      marginBottom:
        Metrics.x1,
    },

    error: {
      color:
        Colors.error,
      fontSize: 13,
      marginBottom:
        Metrics.x2,
    },

    helperText: {
      color:
        Colors.subtext,
      fontSize: 14,
      marginBottom:
        Metrics.x2,
    },

    couponInfo: {
      color:
        Colors.subtext,
      fontSize: 14,
      lineHeight: 20,
      marginBottom:
        Metrics.x2,
    },

    optionButton: {
      marginRight:
        Metrics.x2,
      marginBottom:
        Metrics.x2,
    },

    submitButton: {
      marginTop:
        Metrics.x5,
    },

    submitContent: {
      minHeight: 50,
    },

    bottomSpace: {
      height:
        Metrics.x5,
    },
  });


export {
  EditStudentScreen,
};