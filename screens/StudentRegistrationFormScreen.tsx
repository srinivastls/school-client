import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  FlatList,
  StyleSheet,
  View,
  Text,
} from "react-native";

import {
  Button,
  TextInput,
  Snackbar,
  Menu,
} from "react-native-paper";

import type {
  NativeStackScreenProps,
} from "@react-navigation/native-stack";

import {
  Controller,
  useForm,
} from "react-hook-form";

import {
  useQuery,
  useQueryClient,
} from "react-query";

import {
  Page,
  SiblingFormType,
  SiblingsForm,
} from "../components";

import {
  Colors,
  Metrics,
} from "../theme";

import {
  CreateStudentFormFields,
  RootStackParamList,
  RootStackScreenNames,
} from "../types";

import {
  classServices,
} from "../services";

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


/* ============================================================================
   TYPES
============================================================================ */

type RegistrationSection = {
  id: string;
  sectionName: string;
};

type RegistrationClass = {
  id: string;
  classNumber: string;
  displayName: string;

  tuitionFee: string;
  textBookFee: string;
  noteBookFee: string;
  diaryFee: string;

  sections: RegistrationSection[];
};

type RegistrationAcademicYear = {
  id: string;
  name: string;

  startDate: string;
  endDate: string;

  isCurrent: boolean;

  classes: RegistrationClass[];
};

type RegistrationOptionsResponse = {
  academicYears: RegistrationAcademicYear[];
};

type ClassDetailsResponse = {
  data?: {
    tuitionFee?: string | number;
    textBookFee?: string | number;
    noteBookFee?: string | number;
    diaryFee?: string | number;
  };
};


/* ============================================================================
   SCREEN
============================================================================ */

const StudentRegistrationFormScreen = ({
  route,
  navigation,
}: NativeStackScreenProps<
  RootStackParamList,
  RootStackScreenNames.StudentRegistrationForm
>) => {

  /* ==========================================================================
     EDIT DATA
  ========================================================================== */

  const {
    preFetchedData,
  } = route.params ?? {};


  /* ==========================================================================
     QUERY CLIENT
  ========================================================================== */

  const queryClient = useQueryClient();


  /* ==========================================================================
     REGISTRATION OPTIONS
  ========================================================================== */

  const {
    data: registrationOptions,
    isLoading: loadingRegistrationOptions,
    isFetching: fetchingRegistrationOptions,
    error: registrationOptionsError,
  } = useQuery<RegistrationOptionsResponse>(
    ["student-registration-options"],
    () => studentServices.getRegistrationOptions(),
    {
      staleTime: 5 * 60 * 1000,
    }
  );


  const academicYears =
    registrationOptions?.academicYears ?? [];


  /* ==========================================================================
     SELECTED ACADEMIC YEAR
  ========================================================================== */

  const initialAcademicYearId =
    preFetchedData?.academicYearId ??
    academicYears.find(
      (year) => year.isCurrent
    )?.id ??
    academicYears[0]?.id ??
    null;


  const [
    selectedAcademicYearId,
    setSelectedAcademicYearId,
  ] = useState<string | null>(
    initialAcademicYearId
  );


  /* ==========================================================================
     SELECTED CLASS
  ========================================================================== */

  const [
    selectedClass,
    setSelectedClass,
  ] = useState<string | null>(
    preFetchedData?.classNumber?.classNumber ??
    null
  );


  /* ==========================================================================
     SELECTED SECTION
  ========================================================================== */

  const [
    selectedSectionName,
    setSelectedSectionName,
  ] = useState<string | null>(
    preFetchedData?.sectionName ??
    null
  );


  /* ==========================================================================
     SELECTED ACADEMIC YEAR OBJECT
  ========================================================================== */

  const selectedAcademicYear =
    academicYears.find(
      (year) =>
        year.id === selectedAcademicYearId
    );


  /* ==========================================================================
     AVAILABLE CLASSES
  ========================================================================== */

  const availableClasses =
    selectedAcademicYear?.classes ?? [];


  /* ==========================================================================
     SELECTED CLASS OBJECT
  ========================================================================== */

  const selectedClassDetails =
    availableClasses.find(
      (item) =>
        item.classNumber === selectedClass
    );


  /* ==========================================================================
     AVAILABLE SECTIONS
  ========================================================================== */

  const availableSections =
    selectedClassDetails?.sections ?? [];


  /* ==========================================================================
     CLASS DETAILS
  ========================================================================== */

  const {
    data: classDetails,
    refetch: refetchClassDetails,
    isFetching: fetchingClassDetails,
  } = useQuery<ClassDetailsResponse>(
    [
      "class-details",
      selectedAcademicYearId,
      selectedClass,
    ],
    () =>
      classServices.getClassDetails(
        selectedClass ?? ""
      ),
    {
      enabled: false,
    }
  );


  /* ==========================================================================
     SET DEFAULT ACADEMIC YEAR AFTER API LOAD
  ========================================================================== */

  useEffect(() => {

    if (
      selectedAcademicYearId ||
      academicYears.length === 0
    ) {
      return;
    }

    const currentYear =
      academicYears.find(
        (year) => year.isCurrent
      );

    setSelectedAcademicYearId(
      currentYear?.id ??
      academicYears[0]?.id ??
      null
    );

  }, [
    academicYears,
    selectedAcademicYearId,
  ]);


  /* ==========================================================================
     EDIT MODE — SET ACADEMIC YEAR
  ========================================================================== */

  useEffect(() => {

    if (
      !preFetchedData ||
      academicYears.length === 0
    ) {
      return;
    }

    if (
      preFetchedData.academicYearId
    ) {
      setSelectedAcademicYearId(
        preFetchedData.academicYearId
      );

      return;
    }

    /*
     * Backward compatibility:
     * If old student data doesn't contain
     * academicYearId, find the year from
     * the student's class.
     */

    const matchingYear =
      academicYears.find(
        (year) =>
          year.classes.some(
            (item) =>
              item.classNumber ===
              preFetchedData
                ?.classNumber
                ?.classNumber
          )
      );

    if (matchingYear) {
      setSelectedAcademicYearId(
        matchingYear.id
      );
    }

  }, [
    academicYears,
    preFetchedData,
  ]);


  /* ==========================================================================
     WHEN ACADEMIC YEAR CHANGES
  ========================================================================== */

  useEffect(() => {

    if (!selectedAcademicYearId) {
      setSelectedClass(null);
      setSelectedSectionName(null);
      return;
    }

    /*
     * In create mode, don't automatically
     * select an arbitrary class.
     *
     * User chooses the class.
     */

    if (!preFetchedData) {
      setSelectedClass(null);
      setSelectedSectionName(null);
      return;
    }

  }, [
    selectedAcademicYearId,
  ]);


  /* ==========================================================================
     WHEN CLASS CHANGES
  ========================================================================== */

  useEffect(() => {

    if (!selectedClass) {
      setSelectedSectionName(null);
      return;
    }

    /*
     * If current section doesn't exist
     * in the selected class, clear it.
     */

    const sectionExists =
      availableSections.some(
        (section) =>
          section.sectionName ===
          selectedSectionName
      );

    if (
      selectedSectionName &&
      !sectionExists
    ) {
      setSelectedSectionName(null);
    }

    refetchClassDetails();

  }, [
    selectedClass,
    selectedAcademicYearId,
    availableSections,
    selectedSectionName,
    refetchClassDetails,
  ]);


  /* ==========================================================================
     DEFAULT FORM VALUES
  ========================================================================== */

  const defaultValues:
    CreateStudentFormFields = {

    admissionNo:
      preFetchedData?.admissionNo ??
      "",

    name:
      preFetchedData?.name ??
      "",

    academicYearId:
      preFetchedData?.academicYearId ??
      "",

    sectionName:
      preFetchedData?.sectionName ??
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
      preFetchedData?.siblings ??
      [],

    classNumber:
      selectedClass ??
      "",

    tie:
      preFetchedData?.tie?.amount ??
      "0",

    diary:
      preFetchedData?.diary?.amount ??
      "0",

    belt:
      preFetchedData?.belt?.amount ??
      "0",

    arrears:
      preFetchedData?.arrears?.amount ??
      "0",

    couponCode:
      preFetchedData?.couponCode?.code ??
      "",
  };


  /* ==========================================================================
     FORM
  ========================================================================== */

  const {
    control,
    handleSubmit,
    formState: {
      errors,
    },
    setError,
  } = useForm<CreateStudentFormFields>({
    defaultValues,
  });


  /* ==========================================================================
     LOADING
  ========================================================================== */

  const [
    loading,
    setLoading,
  ] = useState(false);


  /* ==========================================================================
     SIBLINGS
  ========================================================================== */

  const siblingsRef =
    useRef<SiblingFormType[]>(
      preFetchedData?.siblings ??
      []
    );


  const [
    siblingsErrors,
    setSiblingsErrors,
  ] = useState<{
    index?: number;
    message?: string;
  }>();


  /* ==========================================================================
     SNACKBAR
  ========================================================================== */

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
    backgroundColor: string =
      Colors.successBg
  ) => {

    setSnackbarMessage(message);
    setSnackbarColor(backgroundColor);
    setSnackbarVisible(true);

  };


  /* ==========================================================================
     DROPDOWN MENU STATE
  ========================================================================== */

  const [
    academicYearMenuVisible,
    setAcademicYearMenuVisible,
  ] = useState(false);


  const [
    classMenuVisible,
    setClassMenuVisible,
  ] = useState(false);


  const [
    sectionMenuVisible,
    setSectionMenuVisible,
  ] = useState(false);


  /* ==========================================================================
     VALIDATION
  ========================================================================== */

  const validateData = (
    data: CreateStudentFormFields
  ) => {

    const {
      admissionNo,
      name,
      aadhaar,
      fatherName,
      dob,
      doj,
      phoneNo,
      tie,
      diary,
      belt,
      arrears,
    } = data;


    /* ------------------------------------------------------------------------
       ACADEMIC YEAR
    ------------------------------------------------------------------------ */

    if (!selectedAcademicYearId) {

      showSnackbar(
        "Please select an academic year.",
        Colors.errorBg
      );

      return false;
    }


    /* ------------------------------------------------------------------------
       CLASS
    ------------------------------------------------------------------------ */

    if (!selectedClass) {

      showSnackbar(
        "Please select a class.",
        Colors.errorBg
      );

      return false;
    }


    /* ------------------------------------------------------------------------
       SECTION
    ------------------------------------------------------------------------ */

    if (!selectedSectionName) {

      showSnackbar(
        "Please select a section.",
        Colors.errorBg
      );

      return false;
    }


    /* ------------------------------------------------------------------------
       ADMISSION NUMBER
    ------------------------------------------------------------------------ */

    if (
      !isNonEmptyAlphaNumerals(
        admissionNo
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


    /* ------------------------------------------------------------------------
       NAME
    ------------------------------------------------------------------------ */

    if (
      !isNonEmptyAlphabetsWithSpace(
        name
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


    /* ------------------------------------------------------------------------
       AADHAAR
    ------------------------------------------------------------------------ */

    if (
      !isAadhaarValid(aadhaar)
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


    /* ------------------------------------------------------------------------
       FATHER NAME
    ------------------------------------------------------------------------ */

    if (
      !isNonEmptyAlphabetsWithSpace(
        fatherName
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


    /* ------------------------------------------------------------------------
       DOB
    ------------------------------------------------------------------------ */

    if (!isValidDate(dob)) {

      setError(
        "dob",
        {
          message:
            "Invalid date",
        }
      );

      return false;
    }


    /* ------------------------------------------------------------------------
       DOJ
    ------------------------------------------------------------------------ */

    if (!isValidDate(doj)) {

      setError(
        "doj",
        {
          message:
            "Invalid date",
        }
      );

      return false;
    }


    /* ------------------------------------------------------------------------
       PHONE
    ------------------------------------------------------------------------ */

    if (
      !isValidPhoneNo(phoneNo)
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


    /* ------------------------------------------------------------------------
       FEES
    ------------------------------------------------------------------------ */

    const feeFields = [

      {
        name: "tie" as const,
        value: tie,
      },

      {
        name: "diary" as const,
        value: diary,
      },

      {
        name: "belt" as const,
        value: belt,
      },

      {
        name: "arrears" as const,
        value: arrears,
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


    /* ------------------------------------------------------------------------
       SIBLINGS
    ------------------------------------------------------------------------ */

    setSiblingsErrors(undefined);


    for (
      let i = 0;
      i < siblingsRef.current.length;
      i++
    ) {

      const sibling =
        siblingsRef.current[i];


      if (
        !sibling.admissionNo
      ) {

        setSiblingsErrors({

          index: i,

          message:
            "Invalid sibling details",

        });

        return false;
      }

    }


    return true;
  };


  /* ==========================================================================
     SUBMIT
  ========================================================================== */

  const onSubmit = async (
    data: CreateStudentFormFields
  ) => {

    const valid =
      validateData(data);


    if (!valid) {
      return;
    }


    setLoading(true);


    try {

      /* ======================================================================
         CREATE
      ====================================================================== */

      if (!preFetchedData) {

        await studentServices.createStudent({

          ...data,

          academicYearId:
            selectedAcademicYearId,

          classNumber:
            selectedClass,

          sectionName:
            selectedSectionName,

          siblings:
            siblingsRef.current,

        } as any);


        showSnackbar(
          "Student created successfully.",
          Colors.successBg
        );


        const fullStudent =
          await studentServices.getStudentById({
            admissionNo:
              data.admissionNo,
          });


        setTimeout(() => {

          navigation.navigate(
            RootStackScreenNames.StudentDetails,
            {
              student: fullStudent,
            }
          );

        }, 500);

      }


      /* ======================================================================
         EDIT
      ====================================================================== */

      else {

        await studentServices.editStudent({

          ...data,

          academicYearId:
            selectedAcademicYearId,

          classNumber:
            selectedClass,

          sectionName:
            selectedSectionName,

          siblings:
            siblingsRef.current,

          oldAdmissionNo:
            preFetchedData.admissionNo,

        } as any);


        showSnackbar(
          "Student details updated successfully.",
          Colors.successBg
        );

      }


      /* ======================================================================
         REFRESH CACHE
      ====================================================================== */

      await queryClient.refetchQueries(
        [
          "principal-class-student-counts",
        ]
      );


      await queryClient.refetchQueries(
        [
          "student",
          data.admissionNo,
        ]
      );


      await queryClient.refetchQueries(
        [
          "transactions",
        ]
      );


    } catch (err: any) {

      console.log(
        "STUDENT SAVE ERROR:",
        err?.response?.data ??
        err
      );


      showSnackbar(

        err?.response?.data?.message ??
        "Unable to save student. Please try again.",

        Colors.errorBg

      );

    } finally {

      setLoading(false);
    }

  };


  /* ==========================================================================
     ERROR
  ========================================================================== */

// React Native Paper Text expects renderable content.
// Normalize RHF's potentially-unknown error message before rendering.
const renderError = (
  message: unknown
) => {
  if (typeof message !== "string" || message.trim() === "") {
    return null;
  }

  return (
    <Text style={styles.error}>
      {message}
    </Text>
  );
};

  /* ==========================================================================
     DROPDOWN LABEL
  ========================================================================== */

  const selectedAcademicYearName =
    selectedAcademicYear?.name ??
    "Select Academic Year";


  const selectedClassLabel =
    selectedClassDetails
      ? (
        selectedClassDetails.displayName ||
        `Class ${selectedClassDetails.classNumber}`
      )
      : "Select Class";


  const selectedSectionLabel =
    selectedSectionName ??
    "Select Section";


  /* ==========================================================================
     FORM
  ========================================================================== */

  const renderForm = () => {

    return (

      <Page>

        {/* ================================================================
            HEADER
        ================================================================ */}

        <Text style={styles.title}>
          {preFetchedData
            ? "Edit Student"
            : "New Student Registration"}
        </Text>


        <Text style={styles.subtitle}>
          {preFetchedData
            ? "Update student information"
            : "Enter the student's details"}
        </Text>


        {/* ================================================================
            STUDENT INFORMATION
        ================================================================ */}

        <Text style={styles.sectionTitle}>
          Student Information
        </Text>


        <Controller
          control={control}
          name="admissionNo"
          render={({
            field: {
              onChange,
              value,
            },
          }) => (

            <TextInput
              label="Admission No."
              value={value}
              onChangeText={onChange}
              mode="outlined"
              autoCapitalize="characters"
              editable={
                !preFetchedData
              }
              error={
                !!errors.admissionNo
              }
              style={styles.input}
            />

          )}
        />


        {renderError(
          errors.admissionNo?.message
        )}


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
              onChangeText={onChange}
              mode="outlined"
              autoCapitalize="words"
              error={
                !!errors.name
              }
              style={styles.input}
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
              onChangeText={onChange}
              mode="outlined"
              keyboardType="numeric"
              maxLength={12}
              error={
                !!errors.aadhaar
              }
              style={styles.input}
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
              onChangeText={onChange}
              mode="outlined"
              autoCapitalize="words"
              error={
                !!errors.fatherName
              }
              style={styles.input}
            />

          )}
        />


        {renderError(
          errors.fatherName?.message
        )}


        {/* ================================================================
            DATES
        ================================================================ */}

        <Text style={styles.sectionTitle}>
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
              label="Date of Birth (DD/MM/YYYY)"
              value={value}
              onChangeText={onChange}
              mode="outlined"
              placeholder="DD/MM/YYYY"
              error={
                !!errors.dob
              }
              style={styles.input}
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
              label="Date of Joining (DD/MM/YYYY)"
              value={value}
              onChangeText={onChange}
              mode="outlined"
              placeholder="DD/MM/YYYY"
              error={
                !!errors.doj
              }
              style={styles.input}
            />

          )}
        />


        {renderError(
          errors.doj?.message
        )}


        {/* ================================================================
            CONTACT
        ================================================================ */}

        <Text style={styles.sectionTitle}>
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
              onChangeText={onChange}
              mode="outlined"
              keyboardType="phone-pad"
              maxLength={10}
              error={
                !!errors.phoneNo
              }
              style={styles.input}
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
              value={value ?? ""}
              onChangeText={onChange}
              mode="outlined"
              error={
                !!errors.tcNo
              }
              style={styles.input}
            />

          )}
        />


        {renderError(
          errors.tcNo?.message
        )}


        {/* ================================================================
            ACADEMIC YEAR
        ================================================================ */}

        <Text style={styles.sectionTitle}>
          Academic Details
        </Text>


        <Menu
          visible={
            academicYearMenuVisible
          }
          onDismiss={() =>
            setAcademicYearMenuVisible(false)
          }
          anchor={
            <Button
              mode="outlined"
              onPress={() =>
                setAcademicYearMenuVisible(true)
              }
              disabled={
                loadingRegistrationOptions ||
                loading ||
                preFetchedData != null
              }
              style={styles.dropdownButton}
              contentStyle={
                styles.dropdownContent
              }
            >
              {selectedAcademicYearName}
            </Button>
          }
        >

          {academicYears.map(
            (academicYear) => (

              <Menu.Item
                key={
                  academicYear.id
                }
                title={
                  academicYear.isCurrent
                    ? `${academicYear.name} (Current)`
                    : academicYear.name
                }
                onPress={() => {

                  setSelectedAcademicYearId(
                    academicYear.id
                  );

                  setSelectedClass(null);

                  setSelectedSectionName(null);

                  setAcademicYearMenuVisible(false);

                }}
              />

            )
          )}

        </Menu>


        {loadingRegistrationOptions && (

          <Text style={styles.helperText}>
            Loading academic years...
          </Text>

        )}


        {Boolean(registrationOptionsError) && (

          <Text style={styles.error}>
            Unable to load academic years.
          </Text>

        )}


        {/* ================================================================
            CLASS
        ================================================================ */}

        <Menu
          visible={
            classMenuVisible
          }
          onDismiss={() =>
            setClassMenuVisible(false)
          }
          anchor={
            <Button
              mode="outlined"
              onPress={() =>
                setClassMenuVisible(true)
              }
              disabled={
                !selectedAcademicYearId ||
                availableClasses.length === 0 ||
                loading
              }
              style={styles.dropdownButton}
              contentStyle={
                styles.dropdownContent
              }
            >
              {selectedClassLabel}
            </Button>
          }
        >

          {availableClasses.map(
            (classItem) => (

              <Menu.Item
                key={
                  classItem.id
                }
                title={
                  classItem.displayName ||
                  `Class ${classItem.classNumber}`
                }
                onPress={() => {

                  setSelectedClass(
                    classItem.classNumber
                  );

                  setSelectedSectionName(null);

                  setClassMenuVisible(false);

                }}
              />

            )
          )}

        </Menu>


        {selectedAcademicYearId &&
          availableClasses.length === 0 && (

            <Text style={styles.helperText}>
              No classes available for this academic year.
            </Text>

          )}


        {/* ================================================================
            SECTION
        ================================================================ */}

        <Menu
          visible={
            sectionMenuVisible
          }
          onDismiss={() =>
            setSectionMenuVisible(false)
          }
          anchor={
            <Button
              mode="outlined"
              onPress={() =>
                setSectionMenuVisible(true)
              }
              disabled={
                !selectedClass ||
                availableSections.length === 0 ||
                loading
              }
              style={styles.dropdownButton}
              contentStyle={
                styles.dropdownContent
              }
            >
              {selectedSectionLabel}
            </Button>
          }
        >

          {availableSections.map(
            (section) => (

              <Menu.Item
                key={
                  section.id
                }
                title={
                  section.sectionName
                }
                onPress={() => {

                  setSelectedSectionName(
                    section.sectionName
                  );

                  setSectionMenuVisible(false);

                }}
              />

            )
          )}

        </Menu>


        {selectedClass &&
          availableSections.length === 0 && (

            <Text style={styles.helperText}>
              No sections available for this class.
            </Text>

          )}


        {/* ================================================================
            CLASS FEES
        ================================================================ */}

        <View
          style={styles.feeContainer}
        >

          <Text style={styles.sectionTitle}>
            Class Fees
          </Text>


          <TextInput
            label="Tuition Fee"
            value={
              String(
                selectedClassDetails?.tuitionFee ??
                classDetails?.data?.tuitionFee ??
                ""
              )
            }
            mode="outlined"
            editable={false}
            style={styles.input}
          />


          <TextInput
            label="Textbook Fee"
            value={
              String(
                selectedClassDetails?.textBookFee ??
                classDetails?.data?.textBookFee ??
                ""
              )
            }
            mode="outlined"
            editable={false}
            style={styles.input}
          />


          <TextInput
            label="Notebook Fee"
            value={
              String(
                selectedClassDetails?.noteBookFee ??
                classDetails?.data?.noteBookFee ??
                ""
              )
            }
            mode="outlined"
            editable={false}
            style={styles.input}
          />


          <TextInput
            label="Diary Fee"
            value={
              String(
                selectedClassDetails?.diaryFee ?? ""
              )
            }
            mode="outlined"
            editable={false}
            style={styles.input}
          />

        </View>


        {/* ================================================================
            ADDITIONAL FEES
        ================================================================ */}

        <Text style={styles.sectionTitle}>
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
              onChangeText={onChange}
              mode="outlined"
              keyboardType="decimal-pad"
              error={
                !!errors.tie
              }
              style={styles.input}
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
              onChangeText={onChange}
              mode="outlined"
              keyboardType="decimal-pad"
              error={
                !!errors.diary
              }
              style={styles.input}
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
              onChangeText={onChange}
              mode="outlined"
              keyboardType="decimal-pad"
              error={
                !!errors.belt
              }
              style={styles.input}
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
              onChangeText={onChange}
              mode="outlined"
              keyboardType="decimal-pad"
              error={
                !!errors.arrears
              }
              style={styles.input}
            />

          )}
        />


        {renderError(
          errors.arrears?.message
        )}


        {/* ================================================================
            COUPON
        ================================================================ */}

        <Text style={styles.sectionTitle}>
          Coupon
        </Text>


        <Controller
          control={control}
          name="couponCode"
          render={({
            field: {
              onChange,
              value,
            },
          }) => (

            <TextInput
              label="Coupon Code (Optional)"
              value={value}
              onChangeText={onChange}
              mode="outlined"
              autoCapitalize="characters"
              editable={
                !preFetchedData
                  ?.couponCode?.code
              }
              error={
                !!errors.couponCode
              }
              style={styles.input}
            />

          )}
        />


        {renderError(
          errors.couponCode?.message
        )}


        {/* ================================================================
            SIBLINGS
        ================================================================ */}

        <Text style={styles.sectionTitle}>
          Siblings
        </Text>


        <SiblingsForm
          siblingsRef={siblingsRef}
          errors={siblingsErrors}
        />


        {/* ================================================================
            SUBMIT
        ================================================================ */}

        <Button
          mode="contained"
          loading={loading}
          disabled={
            loading ||
            loadingRegistrationOptions ||
            fetchingRegistrationOptions ||
            fetchingClassDetails
          }
          onPress={
            handleSubmit(onSubmit)
          }
          style={styles.submitButton}
          contentStyle={
            styles.submitContent
          }
        >
          {preFetchedData
            ? "UPDATE STUDENT"
            : "CREATE STUDENT"}
        </Button>


        <View
          style={styles.bottomSpace}
        />


        {/* ================================================================
            SNACKBAR
        ================================================================ */}

        <Snackbar
          visible={
            snackbarVisible
          }
          onDismiss={() =>
            setSnackbarVisible(false)
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
    );
  };


  /* ==========================================================================
     SCREEN
  ========================================================================== */

  return (

    <FlatList
      data={["form"]}
      renderItem={renderForm}
      keyExtractor={
        (item) => item
      }
      showsVerticalScrollIndicator={false}
      automaticallyAdjustKeyboardInsets
      keyboardShouldPersistTaps="handled"
    />

  );
};


/* ============================================================================
   STYLES
============================================================================ */

const styles = StyleSheet.create({

  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: Metrics.x1,
  },

  subtitle: {
    fontSize: 15,
    color: Colors.subtext,
    marginBottom: Metrics.x5,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: Metrics.x3,
    marginBottom: Metrics.x3,
  },

  input: {
    marginBottom: Metrics.x1,
  },

  dropdownButton: {
    marginBottom: Metrics.x2,
  },

  dropdownContent: {
    minHeight: 50,
    justifyContent: "center",
  },

  helperText: {
    fontSize: 13,
    color: Colors.subtext,
    marginBottom: Metrics.x2,
  },

  error: {
    color: Colors.error,
    fontSize: 13,
    marginBottom: Metrics.x2,
  },

  feeContainer: {
    marginTop: Metrics.x2,
  },

  submitButton: {
    marginTop: Metrics.x5,
  },

  submitContent: {
    minHeight: 50,
  },

  bottomSpace: {
    height: Metrics.x5,
  },

});


export {
  StudentRegistrationFormScreen,
};