import React, {
  useMemo,
  useState,
} from "react";

import {
  KeyboardAvoidingView,
  Platform as RNPlatform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import {
  Avatar,
  Button,
  Card,
  Divider,
  HelperText,
  Snackbar,
  Text,
  TextInput,
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
  Metrics,
} from "../../theme";

import {
  platformAdminServices,
} from "../../services/platformAdminServices";


/* ============================================================
   TYPES
============================================================ */

type NavigationProp =
  NativeStackNavigationProp<
    RootStackParamList
  >;


type FormErrors = {
  code?: string;

  name?: string;

  address?: string;

  contactEmail?: string;

  contactPhone?: string;

  board?: string;

  maxStudents?: string;

  maxStaffAccounts?: string;
};


/* ============================================================
   CONSTANTS
============================================================ */

const SUBSCRIPTION_PLANS = [
  {
    value: "FREE",
    title: "Free",
    description:
      "For smaller schools getting started.",
  },

  {
    value: "BASIC",
    title: "Basic",
    description:
      "For growing schools with more users.",
  },

  {
    value: "PREMIUM",
    title: "Premium",
    description:
      "For schools needing higher limits.",
  },
];


const MAX_SCHOOL_CODE_LENGTH = 20;

const MAX_SCHOOL_NAME_LENGTH = 120;

const MAX_ADDRESS_LENGTH = 300;

const MAX_BOARD_LENGTH = 80;

const MAX_PHONE_LENGTH = 15;

const MAX_STUDENTS = 100000;

const MAX_STAFF_ACCOUNTS = 10000;


/* ============================================================
   COMPONENT
============================================================ */

const CreateSchoolScreen = () => {

  const navigation =
    useNavigation<NavigationProp>();


  /* ==========================================================
     FORM STATE
  ========================================================== */

  const [
    code,
    setCode,
  ] = useState("");


  const [
    name,
    setName,
  ] = useState("");


  const [
    address,
    setAddress,
  ] = useState("");


  const [
    contactEmail,
    setContactEmail,
  ] = useState("");


  const [
    contactPhone,
    setContactPhone,
  ] = useState("");


  const [
    board,
    setBoard,
  ] = useState("");


  const [
    subscriptionPlan,
    setSubscriptionPlan,
  ] = useState("FREE");


  const [
    maxStudents,
    setMaxStudents,
  ] = useState("100");


  const [
    maxStaffAccounts,
    setMaxStaffAccounts,
  ] = useState("5");


  /* ==========================================================
     UI STATE
  ========================================================== */

  const [
    loading,
    setLoading,
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
    snackbarType,
    setSnackbarType,
  ] = useState<
    "success" | "error"
  >("error");


  const [
    errors,
    setErrors,
  ] = useState<FormErrors>({});


  /* ==========================================================
     HELPERS
  ========================================================== */

  const clearError = (
    field: keyof FormErrors
  ) => {

    setErrors(
      previous => {

        if (!previous[field]) {
          return previous;
        }

        const next = {
          ...previous,
        };

        delete next[field];

        return next;
      }
    );
  };


  const showMessage = (
    message: string,
    type: "success" | "error"
  ) => {

    setSnackbarMessage(
      message
    );

    setSnackbarType(
      type
    );

    setSnackbarVisible(
      true
    );
  };


  /* ==========================================================
     VALIDATION HELPERS
  ========================================================== */

  const validateEmail = (
    value: string
  ) => {

    if (!value.trim()) {
      return true;
    }

    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(
      value.trim()
    );
  };


  const validatePhone = (
    value: string
  ) => {

    if (!value.trim()) {
      return true;
    }

    const cleaned =
      value.replace(
        /[\s\-()+]/g,
        ""
      );

    return /^\d{7,15}$/.test(
      cleaned
    );
  };


  const validateCode = (
    value: string
  ) => {

    return /^[A-Z0-9][A-Z0-9_-]{2,19}$/.test(
      value.trim().toUpperCase()
    );
  };


  const validateInteger = (
    value: string
  ) => {

    if (!value.trim()) {
      return false;
    }

    if (!/^\d+$/.test(value.trim())) {
      return false;
    }

    const number =
      Number(value);

    return (
      Number.isSafeInteger(
        number
      ) &&
      number > 0
    );
  };


  /* ==========================================================
     FIELD VALIDATION
  ========================================================== */

  const validateField = (
    field: keyof FormErrors,
    value: string
  ) => {

    let message:
      | string
      | undefined;


    switch (field) {

      case "code":

        if (!value.trim()) {

          message =
            "School code is required.";

        } else if (
          value.trim().length < 3
        ) {

          message =
            "School code must contain at least 3 characters.";

        } else if (
          value.trim().length >
          MAX_SCHOOL_CODE_LENGTH
        ) {

          message =
            `School code cannot exceed ${MAX_SCHOOL_CODE_LENGTH} characters.`;

        } else if (
          !validateCode(value)
        ) {

          message =
            "Use only letters, numbers, hyphens, and underscores.";

        }

        break;


      case "name":

        if (!value.trim()) {

          message =
            "School name is required.";

        } else if (
          value.trim().length < 3
        ) {

          message =
            "School name must contain at least 3 characters.";

        } else if (
          value.trim().length >
          MAX_SCHOOL_NAME_LENGTH
        ) {

          message =
            `School name cannot exceed ${MAX_SCHOOL_NAME_LENGTH} characters.`;

        }

        break;


      case "address":

        if (
          value.trim().length >
          MAX_ADDRESS_LENGTH
        ) {

          message =
            `Address cannot exceed ${MAX_ADDRESS_LENGTH} characters.`;

        }

        break;


      case "contactEmail":

        if (
          value.trim() &&
          !validateEmail(value)
        ) {

          message =
            "Enter a valid email address.";

        }

        break;


      case "contactPhone":

        if (
          value.trim() &&
          !validatePhone(value)
        ) {

          message =
            "Enter a valid phone number.";

        }

        break;


      case "board":

        if (
          value.trim().length >
          MAX_BOARD_LENGTH
        ) {

          message =
            `Board name cannot exceed ${MAX_BOARD_LENGTH} characters.`;

        }

        break;


      case "maxStudents":

        if (!value.trim()) {

          message =
            "Maximum students is required.";

        } else if (
          !validateInteger(value)
        ) {

          message =
            "Enter a positive whole number.";

        } else if (
          Number(value) >
          MAX_STUDENTS
        ) {

          message =
            `Maximum allowed is ${MAX_STUDENTS.toLocaleString("en-IN")}.`;

        }

        break;


      case "maxStaffAccounts":

        if (!value.trim()) {

          message =
            "Maximum staff accounts is required.";

        } else if (
          !validateInteger(value)
        ) {

          message =
            "Enter a positive whole number.";

        } else if (
          Number(value) >
          MAX_STAFF_ACCOUNTS
        ) {

          message =
            `Maximum allowed is ${MAX_STAFF_ACCOUNTS.toLocaleString("en-IN")}.`;

        }

        break;

    }


    setErrors(
      previous => ({
        ...previous,

        [field]:
          message,
      })
    );


    return !message;
  };


  /* ==========================================================
     FULL VALIDATION
  ========================================================== */

  const validateForm = () => {

    const newErrors: FormErrors = {};


    /* CODE */

    const cleanCode =
      code.trim().toUpperCase();


    if (!cleanCode) {

      newErrors.code =
        "School code is required.";

    } else if (
      cleanCode.length < 3
    ) {

      newErrors.code =
        "School code must contain at least 3 characters.";

    } else if (
      cleanCode.length >
      MAX_SCHOOL_CODE_LENGTH
    ) {

      newErrors.code =
        `School code cannot exceed ${MAX_SCHOOL_CODE_LENGTH} characters.`;

    } else if (
      !validateCode(cleanCode)
    ) {

      newErrors.code =
        "Use only letters, numbers, hyphens, and underscores.";
    }


    /* NAME */

    const cleanName =
      name.trim();


    if (!cleanName) {

      newErrors.name =
        "School name is required.";

    } else if (
      cleanName.length < 3
    ) {

      newErrors.name =
        "School name must contain at least 3 characters.";

    } else if (
      cleanName.length >
      MAX_SCHOOL_NAME_LENGTH
    ) {

      newErrors.name =
        `School name cannot exceed ${MAX_SCHOOL_NAME_LENGTH} characters.`;
    }


    /* ADDRESS */

    if (
      address.trim().length >
      MAX_ADDRESS_LENGTH
    ) {

      newErrors.address =
        `Address cannot exceed ${MAX_ADDRESS_LENGTH} characters.`;
    }


    /* EMAIL */

    if (
      contactEmail.trim() &&
      !validateEmail(contactEmail)
    ) {

      newErrors.contactEmail =
        "Enter a valid email address.";
    }


    /* PHONE */

    if (
      contactPhone.trim() &&
      !validatePhone(contactPhone)
    ) {

      newErrors.contactPhone =
        "Enter a valid phone number.";
    }


    /* BOARD */

    if (
      board.trim().length >
      MAX_BOARD_LENGTH
    ) {

      newErrors.board =
        `Board name cannot exceed ${MAX_BOARD_LENGTH} characters.`;
    }


    /* STUDENTS */

    if (
      !validateInteger(
        maxStudents
      )
    ) {

      newErrors.maxStudents =
        "Enter a positive whole number.";

    } else if (
      Number(maxStudents) >
      MAX_STUDENTS
    ) {

      newErrors.maxStudents =
        `Maximum allowed is ${MAX_STUDENTS.toLocaleString("en-IN")}.`;
    }


    /* STAFF */

    if (
      !validateInteger(
        maxStaffAccounts
      )
    ) {

      newErrors.maxStaffAccounts =
        "Enter a positive whole number.";

    } else if (
      Number(maxStaffAccounts) >
      MAX_STAFF_ACCOUNTS
    ) {

      newErrors.maxStaffAccounts =
        `Maximum allowed is ${MAX_STAFF_ACCOUNTS.toLocaleString("en-IN")}.`;
    }


    /* CROSS FIELD VALIDATION */

    if (
      validateInteger(maxStudents) &&
      validateInteger(maxStaffAccounts) &&
      Number(maxStaffAccounts) >
        Number(maxStudents)
    ) {

      newErrors.maxStaffAccounts =
        "Staff account limit cannot exceed the student limit.";
    }


    setErrors(
      newErrors
    );


    return (
      Object.keys(
        newErrors
      ).length === 0
    );
  };


  /* ==========================================================
     FORM SUMMARY
  ========================================================== */

  const formReady =
    useMemo(
      () => {

        return (
          code.trim().length >= 3 &&
          name.trim().length >= 3 &&
          validateCode(code) &&
          validateInteger(maxStudents) &&
          validateInteger(maxStaffAccounts)
        );

      },
      [
        code,
        name,
        maxStudents,
        maxStaffAccounts,
      ]
    );


  /* ==========================================================
     CREATE SCHOOL
  ========================================================== */

  const onCreateSchool =
    async () => {

      if (loading) {
        return;
      }


      if (!validateForm()) {

        showMessage(
          "Please fix the highlighted fields.",
          "error"
        );

        return;
      }


      setLoading(
        true
      );


      try {

        const cleanCode =
          code
            .trim()
            .toUpperCase();


        const cleanName =
          name.trim();


        const response =
          await platformAdminServices.createSchool({

            code:
              cleanCode,

            name:
              cleanName,

            address:
              address.trim() ||
              undefined,

            contactEmail:
              contactEmail.trim() ||
              undefined,

            contactPhone:
              contactPhone.trim() ||
              undefined,

            board:
              board.trim() ||
              undefined,

            subscriptionPlan,

            maxStudents:
              Number(maxStudents),

            maxStaffAccounts:
              Number(maxStaffAccounts),
          });


        showMessage(
          response?.message ??
            "School created successfully.",
          "success"
        );


        if (
          response?.id
        ) {

          navigation.navigate(
            RootStackScreenNames.PlatformAdminCreatePrincipal,

            {
              schoolId:
                response.id,

              schoolName:
                cleanName,

              schoolCode:
                cleanCode,
            }
          );

        } else {

          navigation.navigate(
            RootStackScreenNames.PlatformAdminDashboard
          );
        }

      } catch (
        error: any
      ) {

        console.log(
          "CREATE SCHOOL ERROR:",
          error?.response?.data ??
            error
        );


        showMessage(

          error?.response?.data?.message ??
            "Unable to create school. Please try again.",

          "error"
        );

      } finally {

        setLoading(
          false
        );
      }
    };


  /* ==========================================================
     NUMERIC INPUT
  ========================================================== */

  const handleNumericChange = (
    value: string,
    setter: (
      value: string
    ) => void,
    field: keyof FormErrors
  ) => {

    /*
     * Keep only digits.
     *
     * This prevents:
     * - letters
     * - negative values
     * - decimal values
     * - spaces
     */

    const numeric =
      value.replace(
        /[^0-9]/g,
        ""
      );


    setter(
      numeric
    );


    clearError(
      field
    );
  };


  /* ==========================================================
     UI
  ========================================================== */

  return (

    <KeyboardAvoidingView
      style={
        styles.container
      }

      behavior={
        RNPlatform.OS === "ios"
          ? "padding"
          : undefined
      }
    >

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }

        keyboardShouldPersistTaps="handled"

        contentContainerStyle={
          styles.content
        }
      >

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
              styles.headerIcon
            }
          >

            <Avatar.Icon
              size={52}

              icon="school-outline"

              color="#FFFFFF"

              style={
                styles.headerAvatar
              }
            />

          </View>


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
              Create School
            </Text>


            <Text
              style={
                styles.subtitle
              }
            >
              Add a new school and configure
              its platform access.
            </Text>

          </View>

        </View>


        {/* ====================================================
            BASIC INFORMATION
        ==================================================== */}

        <FormSection
          icon="school-outline"

          title="Basic Information"

          subtitle="Tell us about the school."
        >

          <FieldLabel
            label="School Code"
            required
          />


          <TextInput
            mode="outlined"

            value={
              code
            }

            onChangeText={
              value => {

                const formatted =
                  value
                    .toUpperCase()
                    .replace(
                      /[^A-Z0-9_-]/g,
                      ""
                    )
                    .slice(
                      0,
                      MAX_SCHOOL_CODE_LENGTH
                    );


                setCode(
                  formatted
                );

                clearError(
                  "code"
                );
              }
            }

            onBlur={() =>
              validateField(
                "code",
                code
              )
            }

            autoCapitalize="characters"

            autoCorrect={false}

            error={
              !!errors.code
            }

            placeholder="OXFORD001"

            left={
              <TextInput.Icon
                icon="identifier"
              />
            }

            style={
              styles.input
            }

            disabled={
              loading
            }
          />


          <FieldFeedback
            error={
              errors.code
            }

            count={
              code.length
            }

            max={
              MAX_SCHOOL_CODE_LENGTH
            }
          />


          <FieldLabel
            label="School Name"
            required
          />


          <TextInput
            mode="outlined"

            value={
              name
            }

            onChangeText={
              value => {

                setName(
                  value.slice(
                    0,
                    MAX_SCHOOL_NAME_LENGTH
                  )
                );

                clearError(
                  "name"
                );
              }
            }

            onBlur={() =>
              validateField(
                "name",
                name
              )
            }

            error={
              !!errors.name
            }

            placeholder="Oxford International School"

            left={
              <TextInput.Icon
                icon="school"
              />
            }

            style={
              styles.input
            }

            disabled={
              loading
            }
          />


          <FieldFeedback
            error={
              errors.name
            }

            count={
              name.length
            }

            max={
              MAX_SCHOOL_NAME_LENGTH
            }
          />


          <FieldLabel
            label="Address"
          />


          <TextInput
            mode="outlined"

            value={
              address
            }

            onChangeText={
              value => {

                setAddress(
                  value.slice(
                    0,
                    MAX_ADDRESS_LENGTH
                  )
                );

                clearError(
                  "address"
                );
              }
            }

            onBlur={() =>
              validateField(
                "address",
                address
              )
            }

            error={
              !!errors.address
            }

            multiline

            numberOfLines={4}

            placeholder="Enter the complete school address"

            left={
              <TextInput.Icon
                icon="map-marker-outline"
              />
            }

            style={[
              styles.input,

              styles.multilineInput,
            ]}

            disabled={
              loading
            }
          />


          <FieldFeedback
            error={
              errors.address
            }

            count={
              address.length
            }

            max={
              MAX_ADDRESS_LENGTH
            }
          />


          <FieldLabel
            label="Board"
          />


          <TextInput
            mode="outlined"

            value={
              board
            }

            onChangeText={
              value => {

                setBoard(
                  value.slice(
                    0,
                    MAX_BOARD_LENGTH
                  )
                );

                clearError(
                  "board"
                );
              }
            }

            onBlur={() =>
              validateField(
                "board",
                board
              )
            }

            error={
              !!errors.board
            }

            placeholder="CBSE, ICSE, State Board..."

            left={
              <TextInput.Icon
                icon="certificate-outline"
              />
            }

            style={
              styles.input
            }

            disabled={
              loading
            }
          />


          <FieldFeedback
            error={
              errors.board
            }

            count={
              board.length
            }

            max={
              MAX_BOARD_LENGTH
            }
          />

        </FormSection>


        {/* ====================================================
            CONTACT
        ==================================================== */}

        <FormSection
          icon="contacts-outline"

          title="Contact Information"

          subtitle="Optional contact details for the school."
        >

          <FieldLabel
            label="Contact Email"
          />


          <TextInput
            mode="outlined"

            value={
              contactEmail
            }

            onChangeText={
              value => {

                setContactEmail(
                  value
                );

                clearError(
                  "contactEmail"
                );
              }
            }

            onBlur={() =>
              validateField(
                "contactEmail",
                contactEmail
              )
            }

            keyboardType="email-address"

            autoCapitalize="none"

            autoCorrect={false}

            error={
              !!errors.contactEmail
            }

            placeholder="admin@school.com"

            left={
              <TextInput.Icon
                icon="email-outline"
              />
            }

            style={
              styles.input
            }

            disabled={
              loading
            }
          />


          <FieldFeedback
            error={
              errors.contactEmail
            }
          />


          <FieldLabel
            label="Contact Phone"
          />


          <TextInput
            mode="outlined"

            value={
              contactPhone
            }

            onChangeText={
              value => {

                const formatted =
                  value
                    .replace(
                      /[^0-9+()\-\s]/g,
                      ""
                    )
                    .slice(
                      0,
                      MAX_PHONE_LENGTH + 4
                    );


                setContactPhone(
                  formatted
                );

                clearError(
                  "contactPhone"
                );
              }
            }

            onBlur={() =>
              validateField(
                "contactPhone",
                contactPhone
              )
            }

            keyboardType="phone-pad"

            error={
              !!errors.contactPhone
            }

            placeholder="+91 9876543210"

            left={
              <TextInput.Icon
                icon="phone-outline"
              />
            }

            style={
              styles.input
            }

            disabled={
              loading
            }
          />


          <FieldFeedback
            error={
              errors.contactPhone
            }

            helper={
              !errors.contactPhone
                ? "7–15 digits are supported."
                : undefined
            }
          />

        </FormSection>


        {/* ====================================================
            SUBSCRIPTION
        ==================================================== */}

        <FormSection
          icon="crown-outline"

          title="Subscription"

          subtitle="Choose the school's platform plan."
        >

          <View
            style={
              styles.planList
            }
          >

            {
              SUBSCRIPTION_PLANS.map(
                plan => {

                  const selected =
                    subscriptionPlan ===
                    plan.value;


                  return (

                    <PlanCard
                      key={
                        plan.value
                      }

                      title={
                        plan.title
                      }

                      description={
                        plan.description
                      }

                      selected={
                        selected
                      }

                      onPress={() =>
                        setSubscriptionPlan(
                          plan.value
                        )
                      }

                      disabled={
                        loading
                      }
                    />

                  );
                }
              )
            }

          </View>

        </FormSection>


        {/* ====================================================
            LIMITS
        ==================================================== */}

        <FormSection
          icon="tune-variant"

          title="Account Limits"

          subtitle="Set the initial capacity for this school."
        >

          <View
            style={
              styles.limitRow
            }
          >

            <View
              style={
                styles.limitColumn
              }
            >

              <FieldLabel
                label="Maximum Students"
                required
              />


              <TextInput
                mode="outlined"

                value={
                  maxStudents
                }

                onChangeText={
                  value =>
                    handleNumericChange(
                      value,
                      setMaxStudents,
                      "maxStudents"
                    )
                }

                onBlur={() =>
                  validateField(
                    "maxStudents",
                    maxStudents
                  )
                }

                keyboardType="number-pad"

                error={
                  !!errors.maxStudents
                }

                left={
                  <TextInput.Icon
                    icon="school-outline"
                  />
                }

                style={
                  styles.input
                }

                disabled={
                  loading
                }
              />


              <FieldFeedback
                error={
                  errors.maxStudents
                }

                helper={
                  !errors.maxStudents
                    ? `Up to ${MAX_STUDENTS.toLocaleString("en-IN")}`
                    : undefined
                }
              />

            </View>


            <View
              style={
                styles.limitColumn
              }
            >

              <FieldLabel
                label="Maximum Staff"
                required
              />


              <TextInput
                mode="outlined"

                value={
                  maxStaffAccounts
                }

                onChangeText={
                  value =>
                    handleNumericChange(
                      value,
                      setMaxStaffAccounts,
                      "maxStaffAccounts"
                    )
                }

                onBlur={() =>
                  validateField(
                    "maxStaffAccounts",
                    maxStaffAccounts
                  )
                }

                keyboardType="number-pad"

                error={
                  !!errors.maxStaffAccounts
                }

                left={
                  <TextInput.Icon
                    icon="account-group-outline"
                  />
                }

                style={
                  styles.input
                }

                disabled={
                  loading
                }
              />


              <FieldFeedback
                error={
                  errors.maxStaffAccounts
                }

                helper={
                  !errors.maxStaffAccounts
                    ? `Up to ${MAX_STAFF_ACCOUNTS.toLocaleString("en-IN")}`
                    : undefined
                }
              />

            </View>

          </View>

        </FormSection>


        {/* ====================================================
            REVIEW
        ==================================================== */}

        <Card
          style={
            styles.reviewCard
          }
        >

          <Card.Content>

            <View
              style={
                styles.reviewHeader
              }
            >

              <Avatar.Icon
                size={38}

                icon="clipboard-check-outline"

                style={
                  styles.reviewAvatar
                }
              />


              <View
                style={
                  styles.reviewHeaderText
                }
              >

                <Text
                  style={
                    styles.reviewTitle
                  }
                >
                  Review
                </Text>


                <Text
                  style={
                    styles.reviewSubtitle
                  }
                >
                  Check the configuration before
                  creating the school.
                </Text>

              </View>

            </View>


            <Divider
              style={
                styles.reviewDivider
              }
            />


            <ReviewRow
              label="School"
              value={
                name.trim() ||
                "Not entered"
              }
            />


            <ReviewRow
              label="Code"
              value={
                code.trim() ||
                "Not entered"
              }
            />


            <ReviewRow
              label="Plan"
              value={
                subscriptionPlan
              }
            />


            <ReviewRow
              label="Students"
              value={
                Number(maxStudents || 0)
                  .toLocaleString("en-IN")
              }
            />


            <ReviewRow
              label="Staff"
              value={
                Number(
                  maxStaffAccounts || 0
                ).toLocaleString("en-IN")
              }
            />

          </Card.Content>

        </Card>


        {/* ====================================================
            ACTIONS
        ==================================================== */}

        <View
          style={
            styles.actions
          }
        >

          <Button
            mode="contained"

            icon="school-outline"

            onPress={
              onCreateSchool
            }

            loading={
              loading
            }

            disabled={
              loading
            }

            style={
              styles.createButton
            }

            contentStyle={
              styles.createButtonContent
            }

            labelStyle={
              styles.createButtonLabel
            }
          >
            Create School
          </Button>


          <Button
            mode="text"

            disabled={
              loading
            }

            onPress={() =>
              navigation.goBack()
            }

            style={
              styles.cancelButton
            }
          >
            Cancel
          </Button>

        </View>


        {!formReady && (
          <Text
            style={
              styles.formHint
            }
          >
            Complete the required fields to
            create the school.
          </Text>
        )}

      </ScrollView>


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

        duration={
          snackbarType ===
          "error"
            ? 3500
            : 2500
        }

        style={
          snackbarType ===
          "success"

            ? styles.successSnackbar

            : styles.errorSnackbar
        }
      >

        {snackbarMessage}

      </Snackbar>

    </KeyboardAvoidingView>
  );
};


/* ============================================================
   FORM SECTION
============================================================ */

const FormSection = ({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: string;

  title: string;

  subtitle: string;

  children: React.ReactNode;
}) => {

  return (

    <Card
      style={
        styles.sectionCard
      }
    >

      <Card.Content>

        <View
          style={
            styles.sectionHeader
          }
        >

          <Avatar.Icon
            size={42}

            icon={icon}

            style={
              styles.sectionAvatar
            }
          />


          <View
            style={
              styles.sectionHeaderText
            }
          >

            <Text
              style={
                styles.sectionTitle
              }
            >
              {title}
            </Text>


            <Text
              style={
                styles.sectionSubtitle
              }
            >
              {subtitle}
            </Text>

          </View>

        </View>


        <Divider
          style={
            styles.sectionDivider
          }
        />


        {children}

      </Card.Content>

    </Card>
  );
};


/* ============================================================
   FIELD LABEL
============================================================ */

const FieldLabel = ({
  label,
  required = false,
}: {
  label: string;

  required?: boolean;
}) => {

  return (

    <Text
      style={
        styles.fieldLabel
      }
    >

      {label}

      {required && (
        <Text
          style={
            styles.required
          }
        >
          {" "}*
        </Text>
      )}

    </Text>
  );
};


/* ============================================================
   FIELD FEEDBACK
============================================================ */

const FieldFeedback = ({
  error,
  helper,
  count,
  max,
}: {
  error?: string;

  helper?: string;

  count?: number;

  max?: number;
}) => {

  if (
    !error &&
    !helper &&
    count === undefined
  ) {
    return null;
  }


  return (

    <View
      style={
        styles.feedbackRow
      }
    >

      <View
        style={
          styles.feedbackText
        }
      >

        {!!error && (

          <HelperText
            type="error"
            visible
            style={
              styles.helperText
            }
          >
            {error}
          </HelperText>

        )}


        {!error &&
          !!helper && (

            <HelperText
              type="info"
              visible
              style={
                styles.helperText
              }
            >
              {helper}
            </HelperText>

          )}

      </View>


      {count !== undefined &&
        max !== undefined && (

          <Text
            style={[
              styles.characterCount,

              count >= max &&
                styles.characterCountWarning,
            ]}
          >
            {count}/{max}
          </Text>

        )}

    </View>
  );
};


/* ============================================================
   PLAN CARD
============================================================ */

const PlanCard = ({
  title,
  description,
  selected,
  onPress,
  disabled,
}: {
  title: string;

  description: string;

  selected: boolean;

  onPress: () => void;

  disabled: boolean;
}) => {

  return (

    <Button
      mode={
        selected
          ? "contained"
          : "outlined"
      }

      onPress={
        onPress
      }

      disabled={
        disabled
      }

      style={[
        styles.planCard,

        selected &&
          styles.planCardSelected,
      ]}

      contentStyle={
        styles.planCardContent
      }

      labelStyle={
        styles.planCardLabel
      }

      icon={
        selected
          ? "check-circle"
          : "circle-outline"
      }
    >

      {title}

    </Button>
  );
};


/* ============================================================
   REVIEW ROW
============================================================ */

const ReviewRow = ({
  label,
  value,
}: {
  label: string;

  value: string;
}) => {

  return (

    <View
      style={
        styles.reviewRow
      }
    >

      <Text
        style={
          styles.reviewLabel
        }
      >
        {label}
      </Text>


      <Text
        style={
          styles.reviewValue
        }

        numberOfLines={1}
      >
        {value}
      </Text>

    </View>
  );
};


/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({

    /* ========================================================
       PAGE
    ======================================================== */

    container: {
      flex: 1,

      backgroundColor:
        "#F6F7FB",
    },


    content: {
      width:
        "100%",

      maxWidth:
        1000,

      alignSelf:
        "center",

      paddingHorizontal:
        Metrics.x4,

      paddingTop:
        Metrics.x4,

      paddingBottom:
        Metrics.x7,
    },


    /* ========================================================
       HEADER
    ======================================================== */

    header: {
      flexDirection:
        "row",

      alignItems:
        "center",

      marginBottom:
        Metrics.x5,
    },


    headerIcon: {
      marginRight:
        Metrics.x3,
    },


    headerAvatar: {
      backgroundColor:
        Colors.brandPrimary,
    },


    headerText: {
      flex:
        1,

      minWidth:
        0,
    },


    title: {
      fontSize:
        28,

      fontWeight:
        "800",

      color:
        "#171717",
    },


    subtitle: {
      marginTop:
        Metrics.x1,

      fontSize:
        14,

      lineHeight:
        20,

      color:
        Colors.subtext,
    },


    /* ========================================================
       FORM CARD
    ======================================================== */

    sectionCard: {
      marginBottom:
        Metrics.x4,

      borderRadius:
        17,

      backgroundColor:
        "#FFFFFF",

      borderWidth:
        1,

      borderColor:
        "#E9E9EF",

      elevation:
        1,
    },


    sectionHeader: {
      flexDirection:
        "row",

      alignItems:
        "center",
    },


    sectionAvatar: {
      backgroundColor:
        Colors.brandPrimaryBg,

      marginRight:
        Metrics.x2,
    },


    sectionHeaderText: {
      flex:
        1,
    },


    sectionTitle: {
      fontSize:
        18,

      fontWeight:
        "800",

      color:
        "#171717",
    },


    sectionSubtitle: {
      marginTop:
        2,

      fontSize:
        12,

      color:
        Colors.subtext,
    },


    sectionDivider: {
      marginVertical:
        Metrics.x4,
    },


    /* ========================================================
       FIELDS
    ======================================================== */

    fieldLabel: {
      fontSize:
        12,

      fontWeight:
        "700",

      color:
        "#44444A",

      marginBottom:
        Metrics.x1,

      textTransform:
        "uppercase",

      letterSpacing:
        0.35,
    },


    required: {
      color:
        Colors.error,
    },


    input: {
      backgroundColor:
        "#FFFFFF",

      marginBottom:
        Metrics.x1,
    },


    multilineInput: {
      minHeight:
        110,

      textAlignVertical:
        "top",
    },


    feedbackRow: {
      minHeight:
        20,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      marginBottom:
        Metrics.x2,
    },


    feedbackText: {
      flex:
        1,
    },


    helperText: {
      paddingHorizontal:
        0,

      marginTop:
        -2,

      marginBottom:
        -2,
    },


    characterCount: {
      fontSize:
        10,

      color:
        "#9A9AA2",

      marginLeft:
        Metrics.x2,
    },


    characterCountWarning: {
      color:
        Colors.error,

      fontWeight:
        "700",
    },


    /* ========================================================
       PLANS
    ======================================================== */

    planList: {
      gap:
        Metrics.x2,
    },


    planCard: {
      borderRadius:
        12,

      marginBottom:
        Metrics.x2,

      borderColor:
        "#DCDCE4",
    },


    planCardSelected: {
      borderColor:
        Colors.brandPrimary,
    },


    planCardContent: {
      minHeight:
        50,

      justifyContent:
        "flex-start",
    },


    planCardLabel: {
      fontWeight:
        "800",

      fontSize:
        13,
    },


    /* ========================================================
       LIMITS
    ======================================================== */

    limitRow: {
      flexDirection:
        "row",

      gap:
        Metrics.x3,
    },


    limitColumn: {
      flex:
        1,

      minWidth:
        0,
    },


    /* ========================================================
       REVIEW
    ======================================================== */

    reviewCard: {
      marginBottom:
        Metrics.x4,

      borderRadius:
        17,

      backgroundColor:
        "#F0EEFF",

      borderWidth:
        1,

      borderColor:
        "#DDD9FF",

      elevation:
        0,
    },


    reviewHeader: {
      flexDirection:
        "row",

      alignItems:
        "center",
    },


    reviewAvatar: {
      backgroundColor:
        Colors.brandPrimary,

      marginRight:
        Metrics.x2,
    },


    reviewHeaderText: {
      flex:
        1,
    },


    reviewTitle: {
      fontSize:
        17,

      fontWeight:
        "800",

      color:
        "#171717",
    },


    reviewSubtitle: {
      fontSize:
        12,

      color:
        Colors.subtext,

      marginTop:
        2,
    },


    reviewDivider: {
      marginVertical:
        Metrics.x3,
    },


    reviewRow: {
      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      paddingVertical:
        Metrics.x1,
    },


    reviewLabel: {
      fontSize:
        12,

      color:
        Colors.subtext,

      fontWeight:
        "600",
    },


    reviewValue: {
      flex:
        1,

      textAlign:
        "right",

      marginLeft:
        Metrics.x3,

      fontSize:
        13,

      fontWeight:
        "800",

      color:
        "#171717",
    },


    /* ========================================================
       ACTIONS
    ======================================================== */

    actions: {
      marginTop:
        Metrics.x1,
    },


    createButton: {
      borderRadius:
        24,

      backgroundColor:
        Colors.brandPrimary,
    },


    createButtonContent: {
      minHeight:
        52,
    },


    createButtonLabel: {
      fontSize:
        14,

      fontWeight:
        "800",
    },


    cancelButton: {
      marginTop:
        Metrics.x1,

      borderRadius:
        22,
    },


    formHint: {
      textAlign:
        "center",

      fontSize:
        11,

      color:
        Colors.subtext,

      marginTop:
        Metrics.x2,
    },


    /* ========================================================
       SNACKBAR
    ======================================================== */

    successSnackbar: {
      backgroundColor:
        "#256B3A",

      borderRadius:
        10,
    },


    errorSnackbar: {
      backgroundColor:
        "#B42318",

      borderRadius:
        10,
    },

  });


export {
  CreateSchoolScreen,
};