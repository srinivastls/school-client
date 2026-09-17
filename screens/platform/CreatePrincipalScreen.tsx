import React, {
  useMemo,
  useState,
} from "react";

import {createPrincipalStyles as styles} from "../../styles";

import {
  KeyboardAvoidingView,
  Platform,
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
  IconButton,
  Snackbar,
  Text,
  TextInput,
} from "react-native-paper";

import {
  RouteProp,
  useNavigation,
  useRoute,
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

import {
  useQueryClient,
} from "react-query";


/* ============================================================
   TYPES
============================================================ */

type ScreenRouteProp = RouteProp<
  RootStackParamList,
  RootStackScreenNames.PlatformAdminCreatePrincipal
>;


type NavigationProp =
  NativeStackNavigationProp<
    RootStackParamList
  >;


type FormErrors = {
  name?: string;
  email?: string;
  password?: string;
  phone?: string;
  designation?: string;
};


/* ============================================================
   CONSTANTS
============================================================ */

const MAX_NAME_LENGTH = 100;

const MAX_EMAIL_LENGTH = 150;

const MAX_PASSWORD_LENGTH = 64;

const MAX_PHONE_LENGTH = 15;

const MAX_DESIGNATION_LENGTH = 60;


/* ============================================================
   COMPONENT
============================================================ */

const CreatePrincipalScreen = () => {

  const navigation =
    useNavigation<NavigationProp>();

  const route =
    useRoute<ScreenRouteProp>();

  const {
    schoolId,
    schoolCode,
    schoolName,
  } = route.params;

  const queryClient =
    useQueryClient();


  /* ==========================================================
     FORM STATE
  ========================================================== */

  const [
    name,
    setName,
  ] = useState("");


  const [
    email,
    setEmail,
  ] = useState("");


  const [
    password,
    setPassword,
  ] = useState("");


  const [
    phone,
    setPhone,
  ] = useState("");


  const [
    designation,
    setDesignation,
  ] = useState("Principal");


  /* ==========================================================
     UI STATE
  ========================================================== */

  const [
    loading,
    setLoading,
  ] = useState(false);


  const [
    passwordVisible,
    setPasswordVisible,
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
     MESSAGE
  ========================================================== */

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
     ERROR HELPERS
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


  /* ==========================================================
     VALIDATION HELPERS
  ========================================================== */

  const isValidEmail = (
    value: string
  ) => {

    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(
      value.trim()
    );
  };


  const isValidPhone = (
    value: string
  ) => {

    if (!value.trim()) {
      return true;
    }

    const digits =
      value.replace(
        /\D/g,
        ""
      );

    return (
      digits.length >= 7 &&
      digits.length <= 15
    );
  };


  const getPasswordStrength = (
    value: string
  ) => {

    if (!value) {
      return {
        label: "Not set",
        score: 0,
      };
    }


    let score = 0;


    if (value.length >= 8) {
      score++;
    }

    if (/[A-Z]/.test(value)) {
      score++;
    }

    if (/[a-z]/.test(value)) {
      score++;
    }

    if (/\d/.test(value)) {
      score++;
    }

    if (
      /[^A-Za-z0-9]/.test(value)
    ) {
      score++;
    }


    if (score <= 2) {

      return {
        label: "Weak",
        score,
      };

    }


    if (score <= 3) {

      return {
        label: "Good",
        score,
      };

    }


    return {
      label: "Strong",
      score,
    };
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

      case "name":

        if (!value.trim()) {

          message =
            "Principal name is required.";

        } else if (
          value.trim().length < 3
        ) {

          message =
            "Name must contain at least 3 characters.";

        } else if (
          value.trim().length >
          MAX_NAME_LENGTH
        ) {

          message =
            `Name cannot exceed ${MAX_NAME_LENGTH} characters.`;

        }

        break;


      case "email":

        if (!value.trim()) {

          message =
            "Login email is required.";

        } else if (
          value.trim().length >
          MAX_EMAIL_LENGTH
        ) {

          message =
            `Email cannot exceed ${MAX_EMAIL_LENGTH} characters.`;

        } else if (
          !isValidEmail(value)
        ) {

          message =
            "Enter a valid email address.";

        }

        break;


      case "password":

        if (!value) {

          message =
            "Initial password is required.";

        } else if (
          value.length < 8
        ) {

          message =
            "Password must contain at least 8 characters.";

        } else if (
          value.length >
          MAX_PASSWORD_LENGTH
        ) {

          message =
            `Password cannot exceed ${MAX_PASSWORD_LENGTH} characters.`;

        }

        break;


      case "phone":

        if (
          value.trim() &&
          !isValidPhone(value)
        ) {

          message =
            "Enter a valid phone number with 7–15 digits.";

        }

        break;


      case "designation":

        if (!value.trim()) {

          message =
            "Designation is required.";

        } else if (
          value.trim().length < 2
        ) {

          message =
            "Designation is too short.";

        } else if (
          value.trim().length >
          MAX_DESIGNATION_LENGTH
        ) {

          message =
            `Designation cannot exceed ${MAX_DESIGNATION_LENGTH} characters.`;

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

  const validate = () => {

    const newErrors: FormErrors = {};


    const cleanName =
      name.trim();

    const cleanEmail =
      email.trim();


    /* NAME */

    if (!cleanName) {

      newErrors.name =
        "Principal name is required.";

    } else if (
      cleanName.length < 3
    ) {

      newErrors.name =
        "Name must contain at least 3 characters.";

    } else if (
      cleanName.length >
      MAX_NAME_LENGTH
    ) {

      newErrors.name =
        `Name cannot exceed ${MAX_NAME_LENGTH} characters.`;
    }


    /* EMAIL */

    if (!cleanEmail) {

      newErrors.email =
        "Login email is required.";

    } else if (
      cleanEmail.length >
      MAX_EMAIL_LENGTH
    ) {

      newErrors.email =
        `Email cannot exceed ${MAX_EMAIL_LENGTH} characters.`;

    } else if (
      !isValidEmail(cleanEmail)
    ) {

      newErrors.email =
        "Enter a valid email address.";
    }


    /* PASSWORD */

    if (!password) {

      newErrors.password =
        "Initial password is required.";

    } else if (
      password.length < 8
    ) {

      newErrors.password =
        "Password must contain at least 8 characters.";

    } else if (
      password.length >
      MAX_PASSWORD_LENGTH
    ) {

      newErrors.password =
        `Password cannot exceed ${MAX_PASSWORD_LENGTH} characters.`;
    }


    /* PHONE */

    if (
      phone.trim() &&
      !isValidPhone(phone)
    ) {

      newErrors.phone =
        "Enter a valid phone number with 7–15 digits.";
    }


    /* DESIGNATION */

    if (!designation.trim()) {

      newErrors.designation =
        "Designation is required.";

    } else if (
      designation.trim().length < 2
    ) {

      newErrors.designation =
        "Designation is too short.";

    } else if (
      designation.trim().length >
      MAX_DESIGNATION_LENGTH
    ) {

      newErrors.designation =
        `Designation cannot exceed ${MAX_DESIGNATION_LENGTH} characters.`;
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
     PASSWORD
  ========================================================== */

  const passwordStrength =
    useMemo(
      () =>
        getPasswordStrength(
          password
        ),
      [password]
    );


  /* ==========================================================
     FORM READY
  ========================================================== */

  const formReady =
    useMemo(
      () => {

        return (
          name.trim().length >= 3 &&
          isValidEmail(email) &&
          password.length >= 8 &&
          designation.trim().length >= 2 &&
          !phone.trim() ||
          (
            name.trim().length >= 3 &&
            isValidEmail(email) &&
            password.length >= 8 &&
            designation.trim().length >= 2 &&
            isValidPhone(phone)
          )
        );

      },
      [
        name,
        email,
        password,
        designation,
        phone,
      ]
    );


  /* ==========================================================
     CREATE PRINCIPAL
  ========================================================== */

  const onCreatePrincipal =
    async () => {

      if (loading) {
        return;
      }


      if (!validate()) {

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

        const response =
          await platformAdminServices.createPrincipal(
            schoolId,
            {
              name:
                name.trim(),

              email:
                email
                  .trim()
                  .toLowerCase(),

              password,

              designation:
                designation.trim() ||
                "Principal",

              phone:
                phone.trim() ||
                undefined,
            }
          );


        /* ------------------------------------------------------
           REFRESH DASHBOARD DATA
        ------------------------------------------------------ */

        await queryClient.invalidateQueries(
          [
            "platform-admin-dashboard",
          ]
        );


        await queryClient.invalidateQueries(
          [
            "platform-admin-schools",
          ]
        );


        await queryClient.invalidateQueries(
          [
            "platform-school",
            schoolId,
          ]
        );


        showMessage(
          response?.message ??
            "Principal created successfully.",
          "success"
        );


        /* ------------------------------------------------------
           NAVIGATE AFTER SUCCESS
        ------------------------------------------------------ */

        setTimeout(
          () => {

            navigation.reset({

              index: 0,

              routes: [
                {
                  name:
                    RootStackScreenNames.PlatformAdminDashboard,
                },
              ],

            });

          },
          1200
        );

      } catch (
        error: any
      ) {

        console.log(
          "CREATE PRINCIPAL ERROR:",
          error?.response?.data ??
            error
        );


        showMessage(
          error?.response?.data?.message ??
            "Unable to create principal. Please try again.",
          "error"
        );

      } finally {

        setLoading(
          false
        );
      }
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
        Platform.OS === "ios"
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
            HEADER
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

              icon="account-tie"

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
              Create Principal
            </Text>


            <Text
              style={
                styles.subtitle
              }
            >
              Set up the administrator account
              for this school.
            </Text>

          </View>

        </View>


        {/* ====================================================
            SCHOOL CONTEXT
        ==================================================== */}

        <Card
          style={
            styles.schoolCard
          }
        >

          <Card.Content>

            <View
              style={
                styles.schoolCardHeader
              }
            >

              <Avatar.Icon
                size={44}

                icon="school"

                style={
                  styles.schoolAvatar
                }
              />


              <View
                style={
                  styles.schoolInfo
                }
              >

                <Text
                  style={
                    styles.schoolLabel
                  }
                >
                  CREATING ACCOUNT FOR
                </Text>


                <Text
                  style={
                    styles.schoolName
                  }

                  numberOfLines={2}
                >
                  {schoolName}
                </Text>


                <View
                  style={
                    styles.schoolCodeBadge
                  }
                >

                  <Text
                    style={
                      styles.schoolCode
                    }
                  >
                    {schoolCode}
                  </Text>

                </View>

              </View>

            </View>

          </Card.Content>

        </Card>


        {/* ====================================================
            ACCOUNT DETAILS
        ==================================================== */}

        <Card
          style={
            styles.sectionCard
          }
        >

          <Card.Content>

            <SectionHeader
              icon="account-edit-outline"

              title="Account Details"

              subtitle="Information used by the principal."
            />


            <Divider
              style={
                styles.divider
              }
            />


            {/* NAME */}

            <FieldLabel
              label="Full Name"
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
                      MAX_NAME_LENGTH
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

              autoCapitalize="words"

              autoCorrect={false}

              error={
                !!errors.name
              }

              placeholder="e.g. Rahul Sharma"

              left={
                <TextInput.Icon
                  icon="account-outline"
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
                MAX_NAME_LENGTH
              }
            />


            {/* EMAIL */}

            <FieldLabel
              label="Login Email"
              required
            />


            <TextInput
              mode="outlined"

              value={
                email
              }

              onChangeText={
                value => {

                  setEmail(
                    value
                      .toLowerCase()
                      .slice(
                        0,
                        MAX_EMAIL_LENGTH
                      )
                  );

                  clearError(
                    "email"
                  );
                }
              }

              onBlur={() =>
                validateField(
                  "email",
                  email
                )
              }

              keyboardType="email-address"

              autoCapitalize="none"

              autoCorrect={false}

              autoComplete="email"

              error={
                !!errors.email
              }

              placeholder="principal@school.com"

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
                errors.email
              }

              helper={
                !errors.email
                  ? "This will be used to sign in."
                  : undefined
              }
            />


            {/* PHONE */}

            <FieldLabel
              label="Phone"
            />


            <TextInput
              mode="outlined"

              value={
                phone
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


                  setPhone(
                    formatted
                  );

                  clearError(
                    "phone"
                  );
                }
              }

              onBlur={() =>
                validateField(
                  "phone",
                  phone
                )
              }

              keyboardType="phone-pad"

              error={
                !!errors.phone
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
                errors.phone
              }

              helper={
                !errors.phone
                  ? "Optional. Enter 7–15 digits."
                  : undefined
              }
            />


            {/* DESIGNATION */}

            <FieldLabel
              label="Designation"
              required
            />


            <TextInput
              mode="outlined"

              value={
                designation
              }

              onChangeText={
                value => {

                  setDesignation(
                    value.slice(
                      0,
                      MAX_DESIGNATION_LENGTH
                    )
                  );

                  clearError(
                    "designation"
                  );
                }
              }

              onBlur={() =>
                validateField(
                  "designation",
                  designation
                )
              }

              error={
                !!errors.designation
              }

              placeholder="Principal"

              left={
                <TextInput.Icon
                  icon="badge-account-outline"
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
                errors.designation
              }

              count={
                designation.length
              }

              max={
                MAX_DESIGNATION_LENGTH
              }
            />

          </Card.Content>

        </Card>


        {/* ====================================================
            SECURITY
        ==================================================== */}

        <Card
          style={
            styles.sectionCard
          }
        >

          <Card.Content>

            <SectionHeader
              icon="shield-lock-outline"

              title="Login Security"

              subtitle="Set the initial password for the account."
            />


            <Divider
              style={
                styles.divider
              }
            />


            <FieldLabel
              label="Initial Password"
              required
            />


            <TextInput
              mode="outlined"

              value={
                password
              }

              onChangeText={
                value => {

                  setPassword(
                    value.slice(
                      0,
                      MAX_PASSWORD_LENGTH
                    )
                  );

                  clearError(
                    "password"
                  );
                }
              }

              onBlur={() =>
                validateField(
                  "password",
                  password
                )
              }

              secureTextEntry={
                !passwordVisible
              }

              autoCapitalize="none"

              autoCorrect={false}

              error={
                !!errors.password
              }

              placeholder="Enter initial password"

              left={
                <TextInput.Icon
                  icon="lock-outline"
                />
              }

              right={
                <TextInput.Icon
                  icon={
                    passwordVisible
                      ? "eye-off-outline"
                      : "eye-outline"
                  }

                  onPress={() =>
                    setPasswordVisible(
                      previous =>
                        !previous
                    )
                  }
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
                errors.password
              }
            />


            {/* PASSWORD STRENGTH */}

            {!!password && (

              <View
                style={
                  styles.passwordStrength
                }
              >

                <View
                  style={
                    styles.passwordStrengthHeader
                  }
                >

                  <Text
                    style={
                      styles.passwordStrengthLabel
                    }
                  >
                    Password strength
                  </Text>


                  <Text
                    style={
                      styles.passwordStrengthValue
                    }
                  >
                    {
                      passwordStrength.label
                    }
                  </Text>

                </View>


                <View
                  style={
                    styles.strengthTrack
                  }
                >

                  {[1, 2, 3, 4, 5].map(
                    level => (

                      <View
                        key={
                          level
                        }

                        style={[
                          styles.strengthSegment,

                          level <=
                            passwordStrength.score &&
                            styles.strengthSegmentActive,
                        ]}
                      />

                    )
                  )}

                </View>


                <Text
                  style={
                    styles.passwordHint
                  }
                >
                  Use at least 8 characters.
                  A combination of uppercase,
                  lowercase, numbers and symbols
                  makes the password stronger.
                </Text>

              </View>

            )}

          </Card.Content>

        </Card>


        {/* ====================================================
            REVIEW
        ==================================================== */}

        <Card
          style={
            styles.reviewCard
          }
        >

          <Card.Content>

            <SectionHeader
              icon="clipboard-check-outline"

              title="Account Summary"

              subtitle="Review the account before creating it."
            />


            <Divider
              style={
                styles.divider
              }
            />


            <ReviewRow
              label="School"
              value={
                schoolName
              }
            />


            <ReviewRow
              label="Principal"
              value={
                name.trim() ||
                "Not entered"
              }
            />


            <ReviewRow
              label="Email"
              value={
                email.trim() ||
                "Not entered"
              }
            />


            <ReviewRow
              label="Designation"
              value={
                designation.trim() ||
                "Not entered"
              }
            />


            <ReviewRow
              label="Phone"
              value={
                phone.trim() ||
                "Not provided"
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

            icon="account-plus"

            loading={
              loading
            }

            disabled={
              loading
            }

            onPress={
              onCreatePrincipal
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
            Create Principal
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
              styles.backButton
            }
          >
            Back
          </Button>

        </View>


        {!formReady && (
          <Text
            style={
              styles.formHint
            }
          >
            Complete the required fields before
            creating the principal account.
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
   SECTION HEADER
============================================================ */

const SectionHeader = ({
  icon,
  title,
  subtitle,
}: {
  icon: string;

  title: string;

  subtitle: string;
}) => {

  return (

    <View
      style={
        styles.sectionHeader
      }
    >

      <Avatar.Icon
        size={42}

        icon={
          icon
        }

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


export {
  CreatePrincipalScreen,
};