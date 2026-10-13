import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ScrollView,
  View,
  Text,
} from "react-native";

import {
  Button,
  Card,
  Divider,
  Snackbar,
  TextInput,
  TouchableRipple,
} from "react-native-paper";

import {
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";

import {
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";

import dayjs from "dayjs";

import {
  useMutation,
  useQueryClient,
} from "react-query";

import {
  Colors,
  makeStyles,
  Metrics,
} from "../../theme";

import {
  financeServices,
  txnServices,
} from "../../services";

import {
  PaymentMode,
  RecordTxnRequest,
  RootStackParamList,
  RootStackScreenNames,
} from "../../types";


/* ============================================================
   TYPES
============================================================ */

type FeeKey =
  | "tuitionFee"
  | "textBookFee"
  | "noteBookFee"
  | "diary"
  | "tie"
  | "belt"
  | "arrears";

type FeeComponent = {
  key: FeeKey;
  label: string;
  pendingAmount: number;
  payingAmount: number;
};

type PayingAmountMap =
  Record<FeeKey, number>;

type StudentClass = {
  id?: string;
  classNumber?: number | string;
  displayName?: string;
};

type StudentSection = {
  id?: string;
  name?: string;
  displayName?: string;
};

type Student = {
  name?: string;

  admissionNo: string;

  classNumber:
    | StudentClass
    | number
    | string
    | null
    | undefined;

  sectionName:
    | StudentSection
    | string
    | null
    | undefined;

  pendingAmount?: number;

  pendingTuitionFee?: number;

  pendingTextbookFee?: number;

  pendingNotebookFee?: number;

  pendingDiaryAmount?: number;

  tie?: {
    pendingAmount?: number;
  };

  diary?: {
    pendingAmount?: number;
  };

  belt?: {
    pendingAmount?: number;
  };

  arrears?: {
    pendingAmount?: number;
  };
};


/* ============================================================
   HELPERS
============================================================ */

const getClassDisplayName = (
  value: Student["classNumber"]
): string => {

  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  if (
    typeof value === "string" ||
    typeof value === "number"
  ) {
    return String(value);
  }

  return (
    value.displayName ??
    value.classNumber?.toString() ??
    ""
  );
};


const getSectionDisplayName = (
  value: Student["sectionName"]
): string => {

  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  if (
    typeof value === "string"
  ) {
    return value;
  }

  return (
    value.displayName ??
    value.name ??
    ""
  );
};


const formatAmount = (
  value: number
) => {

  return Number(
    value || 0
  ).toLocaleString(
    "en-IN"
  );
};


/* ============================================================
   SCREEN
============================================================ */

const PrincipalCollectFeeScreen =
  () => {

    const styles =
      useStyles();


    /* ========================================================
       NAVIGATION
    ======================================================== */

    const navigation =
      useNavigation<
        NativeStackNavigationProp<
          RootStackParamList
        >
      >();

    const route = useRoute<RouteProp<
      RootStackParamList,
      RootStackScreenNames.PrincipalFeeCollection
    >>();


    /* ========================================================
       QUERY CLIENT
    ======================================================== */

    const queryClient =
      useQueryClient();


    /* ========================================================
       SEARCH
    ======================================================== */

    const [
      admissionNo,
      setAdmissionNo,
    ] = useState("");

    const [
      studentFound,
      setStudentFound,
    ] = useState(false);


    /* ========================================================
       STUDENT
    ======================================================== */

    const [
      student,
      setStudent,
    ] =
      useState<Student | null>(
        null
      );


    /* ========================================================
       FEES
    ======================================================== */

    const [
      fees,
      setFees,
    ] =
      useState<FeeComponent[]>(
        []
      );


    /* ========================================================
       PAYMENT MODE
    ======================================================== */

    const [
      paymentMode,
      setPaymentMode,
    ] =
      useState<PaymentMode>(
        PaymentMode.cash
      );


    /* ========================================================
       WALLET TRANSACTION ID
    ======================================================== */

    const [
      transactionId,
      setTransactionId,
    ] = useState("");


    /* ========================================================
       RECORDING
    ======================================================== */

    const [
      recording,
      setRecording,
    ] = useState(false);


    /* ========================================================
       SNACKBAR
    ======================================================== */

    const [
      showSnackbar,
      setShowSnackbar,
    ] = useState(false);


    const [
      snackbarText,
      setSnackbarText,
    ] = useState("");


    /* ========================================================
       TOTAL PAYMENT
    ======================================================== */

    const totalAmount =
      useMemo(() => {

        return fees.reduce(
          (
            total,
            fee
          ) =>
            total +
            Number(
              fee.payingAmount ||
                0
            ),
          0
        );

      }, [fees]);


    /* ========================================================
       PAYING AMOUNTS
    ======================================================== */

    const payingAmount =
      useMemo<
        PayingAmountMap
      >(() => {

        const amounts:
          PayingAmountMap = {

          tuitionFee: 0,

          textBookFee: 0,

          noteBookFee: 0,

          diary: 0,

          tie: 0,

          belt: 0,

          arrears: 0,

        };


        fees.forEach(
          (fee) => {

            amounts[
              fee.key
            ] =
              Number(
                fee.payingAmount ||
                  0
              );

          }
        );


        return amounts;

      }, [fees]);


    /* ========================================================
       SEARCH STUDENT
    ======================================================== */

    const searchStudentMutation =
      useMutation<
        Student,
        Error,
        string
      >(

        (value: string) =>

          financeServices
            .getStudentForFeeCollection(
              value
            ) as Promise<Student>,

        {

          onSuccess: (
            data: Student
          ) => {




            setStudent(
              data
            );


            setStudentFound(
              true
            );


            setTransactionId(
              ""
            );


            setPaymentMode(
              PaymentMode.cash
            );


            setFees([

              {
                key:
                  "tuitionFee",

                label:
                  "Tuition Fee",

                pendingAmount:
                  Number(
                    data.pendingTuitionFee ||
                      0
                  ),

                payingAmount:
                  0,
              },


              {
                key:
                  "textBookFee",

                label:
                  "Textbook",

                pendingAmount:
                  Number(
                    data.pendingTextbookFee ||
                      0
                  ),

                payingAmount:
                  0,
              },


              {
                key:
                  "noteBookFee",

                label:
                  "Notebook",

                pendingAmount:
                  Number(
                    data.pendingNotebookFee ||
                      0
                  ),

                payingAmount:
                  0,
              },


              {
                key:
                  "diary",

                label:
                  "Diary",

                pendingAmount:
                  Number(
                    data.pendingDiaryAmount ??
                      data.diary
                        ?.pendingAmount ??
                      0
                  ),

                payingAmount:
                  0,
              },


              {
                key:
                  "tie",

                label:
                  "Tie",

                pendingAmount:
                  Number(
                    data.tie
                      ?.pendingAmount ||
                      0
                  ),

                payingAmount:
                  0,
              },


              {
                key:
                  "belt",

                label:
                  "Belt",

                pendingAmount:
                  Number(
                    data.belt
                      ?.pendingAmount ||
                      0
                  ),

                payingAmount:
                  0,
              },


              {
                key:
                  "arrears",

                label:
                  "Arrears",

                pendingAmount:
                  Number(
                    data.arrears
                      ?.pendingAmount ||
                      0
                  ),

                payingAmount:
                  0,
              },

            ]);

          },


          onError: (
            error: any
          ) => {

            console.error(
              "SEARCH STUDENT ERROR:",
              error
            );


            setStudent(
              null
            );


            setStudentFound(
              false
            );


            setFees(
              []
            );


            setSnackbarText(
              error
                ?.response
                ?.data
                ?.message ??
              "Student not found"
            );


            setShowSnackbar(
              true
            );

          },

        }
      );

    useEffect(() => {
      const initialAdmissionNo = route.params?.admissionNo?.trim();
      if (initialAdmissionNo) {
        setAdmissionNo(initialAdmissionNo);
        searchStudentMutation.mutate(initialAdmissionNo);
      }
    }, [route.params?.admissionNo]);


    /* ========================================================
       SEARCH
    ======================================================== */

    const searchStudent =
      () => {

        const value =
          admissionNo.trim();


        if (!value) {

          setSnackbarText(
            "Enter admission number"
          );

          setShowSnackbar(
            true
          );

          return;
        }


        searchStudentMutation.mutate(
          value
        );

      };


    /* ========================================================
       UPDATE FEE
    ======================================================== */

    const updateFee = (
      key: FeeKey,
      value: string
    ) => {

      /*
       * Allow the user to clear
       * the input.
       */

      if (
        value.trim() === ""
      ) {

        setFees(
          (current) =>
            current.map(
              (fee) => {

                if (
                  fee.key !== key
                ) {
                  return fee;
                }

                return {
                  ...fee,
                  payingAmount: 0,
                };

              }
            )
        );

        return;
      }


      const numericValue =
        Number(value);


      /*
       * Reject invalid input.
       */

      if (
        !Number.isFinite(
          numericValue
        )
      ) {
        return;
      }


      /*
       * Prevent negative values.
       */

      const safeValue =
        Math.max(
          0,
          numericValue
        );


      setFees(
        (current) =>
          current.map(
            (fee) => {

              if (
                fee.key !== key
              ) {
                return fee;
              }


              return {

                ...fee,

                payingAmount:
                  Math.min(
                    safeValue,
                    fee.pendingAmount
                  ),

              };

            }
          )
      );

    };


    /* ========================================================
       PAYMENT MODE
    ======================================================== */

    const renderPaymentMode =
      (
        mode: PaymentMode,
        label: string
      ) => {

        const selected =
          paymentMode === mode;


        return (

          <TouchableRipple
            style={[
              styles.paymentMode,

              selected &&
                styles.paymentModeSelected,
            ]}
            onPress={() =>
              setPaymentMode(
                mode
              )
            }
            rippleColor={
              Colors.brandPrimaryBg
            }
          >

            <Text
              style={[
                styles.paymentModeText,

                selected &&
                  styles.paymentModeTextSelected,
              ]}
            >
              {label}
            </Text>

          </TouchableRipple>

        );

      };


    /* ========================================================
       RECORD PAYMENT
    ======================================================== */

    const recordPayment =
      async () => {

        /* ----------------------------------------------------
           STUDENT
        ---------------------------------------------------- */

        if (!student) {

          setSnackbarText(
            "Please select a student first"
          );

          setShowSnackbar(
            true
          );

          return;
        }


        /* ----------------------------------------------------
           PAYMENT
        ---------------------------------------------------- */

        if (
          totalAmount <= 0
        ) {

          setSnackbarText(
            "Please enter an amount to pay"
          );

          setShowSnackbar(
            true
          );

          return;
        }


        /* ----------------------------------------------------
           PAYMENT MODE
        ---------------------------------------------------- */

        if (!paymentMode) {

          setSnackbarText(
            "Please select payment mode"
          );

          setShowSnackbar(
            true
          );

          return;
        }


        /* ----------------------------------------------------
           WALLET TRANSACTION ID
        ---------------------------------------------------- */

        if (
          paymentMode ===
            PaymentMode.wallet
        ) {

          if (
            !transactionId.trim()
          ) {

            setSnackbarText(
              "Wallet transaction ID is required"
            );

            setShowSnackbar(
              true
            );

            return;
          }

        }


        /* ----------------------------------------------------
           RECORDING
        ---------------------------------------------------- */

        if (recording) {
          return;
        }


        /* ----------------------------------------------------
           COMPONENT VALUES
        ---------------------------------------------------- */

        const tuitionFee =
          Number(
            payingAmount.tuitionFee ||
              0
          );


        const textBookFee =
          Number(
            payingAmount.textBookFee ||
              0
          );


        const noteBookFee =
          Number(
            payingAmount.noteBookFee ||
              0
          );


        const diary =
          Number(
            payingAmount.diary ||
              0
          );


        const tie =
          Number(
            payingAmount.tie ||
              0
          );


        const belt =
          Number(
            payingAmount.belt ||
              0
          );


        const arrears =
          Number(
            payingAmount.arrears ||
              0
          );


        const allAmounts = [

          tuitionFee,

          textBookFee,

          noteBookFee,

          diary,

          tie,

          belt,

          arrears,

          totalAmount,

        ];


        /* ----------------------------------------------------
           NUMERIC VALIDATION
        ---------------------------------------------------- */

        if (
          allAmounts.some(
            (value) =>
              !Number.isFinite(
                value
              )
          )
        ) {

          setSnackbarText(
            "Please enter valid amounts"
          );

          setShowSnackbar(
            true
          );

          return;
        }


        /* ----------------------------------------------------
           NEGATIVE VALIDATION
        ---------------------------------------------------- */

        if (
          allAmounts.some(
            (value) =>
              value < 0
          )
        ) {

          setSnackbarText(
            "Amounts cannot be negative"
          );

          setShowSnackbar(
            true
          );

          return;
        }


        /* ----------------------------------------------------
           PENDING VALIDATION
        ---------------------------------------------------- */

        const pendingAmount =
          Number(
            student.pendingAmount ||
              0
          );


        if (
          tuitionFee >
            Number(
              student.pendingTuitionFee ||
                0
            ) ||

          textBookFee >
            Number(
              student.pendingTextbookFee ||
                0
            ) ||

          noteBookFee >
            Number(
              student.pendingNotebookFee ||
                0
            ) ||

          diary >
            Number(
              student.pendingDiaryAmount ??
                student.diary
                  ?.pendingAmount ??
                0
            ) ||

          tie >
            Number(
              student.tie
                ?.pendingAmount ||
                0
            ) ||

          belt >
            Number(
              student.belt
                ?.pendingAmount ||
                0
            ) ||

          arrears >
            Number(
              student.arrears
                ?.pendingAmount ||
                0
            ) ||

          totalAmount >
            pendingAmount
        ) {

          setSnackbarText(
            "Amount cannot be greater than pending amount"
          );

          setShowSnackbar(
            true
          );

          return;
        }


        /* ----------------------------------------------------
           COMPONENT TOTAL
        ---------------------------------------------------- */

        const componentTotal =
          tuitionFee +
          textBookFee +
          noteBookFee +
          diary +
          tie +
          belt +
          arrears;


        /* ----------------------------------------------------
           TOTAL MATCH
        ---------------------------------------------------- */

        if (
          Math.abs(
            componentTotal -
              totalAmount
          ) > 0.001
        ) {

          setSnackbarText(
            "Amount does not match payment details"
          );

          setShowSnackbar(
            true
          );

          return;
        }


        /* ----------------------------------------------------
           PAYLOAD
        ---------------------------------------------------- */

        const payload:
          RecordTxnRequest = {

          paymentMode:
            String(
              paymentMode
            ).toUpperCase() as RecordTxnRequest["paymentMode"],

          amount:
            totalAmount,

          amountDetails: {

            tuitionFee:
              tuitionFee,

            textBookFee:
              textBookFee,

            noteBookFee:
              noteBookFee,

            diary:
              diary,

            tie:
              tie,

            belt:
              belt,

            arrears:
              arrears,

          },

          date:
            dayjs().format(
              "DD/MM/YYYY"
            ),

          studentAdmissionNo:
            student.admissionNo,

          ...(paymentMode ===
            PaymentMode.wallet
            ? {
                transactionId:
                  transactionId.trim(),
              }
            : {}),

        };


        /* ----------------------------------------------------
           START
        ---------------------------------------------------- */

        setRecording(
          true
        );


        try {

          /* --------------------------------------------------
             RECORD
          -------------------------------------------------- */

          const result =
            await txnServices.recordTxn(
              payload
            );




          /* --------------------------------------------------
             REFRESH EXISTING DATA
          -------------------------------------------------- */

          await queryClient.refetchQueries(
            [
              "transactions",
            ]
          );


          await queryClient.refetchQueries(
            [
              "student" +
                student.admissionNo,
            ]
          );


          await queryClient.refetchQueries(
            [
              "dailyTotal",
            ]
          );


          await queryClient.refetchQueries(
            [
              "weeklyTotal",
            ]
          );


          await queryClient.refetchQueries(
            [
              "monthlyTotal",
            ]
          );


          /*
           * Principal student / finance
           * queries may use different keys.
           *
           * Invalidate rather than depending
           * on one exact key.
           */

          await queryClient.invalidateQueries(
            [
              "principal-student",
            ]
          );


          await queryClient.invalidateQueries(
            [
              "principal-finance-daily",
            ]
          );


          await queryClient.invalidateQueries(
            [
              "principal-finance-weekly",
            ]
          );


          await queryClient.invalidateQueries(
            [
              "principal-finance-monthly",
            ]
          );


          /* --------------------------------------------------
             OPEN INVOICE
          -------------------------------------------------- */

          navigation.replace(
            RootStackScreenNames.Invoice,
            {
              student: student as any,
              transaction:
                result as any,
            }
          );

        } catch (
          error: any
        ) {

          console.error(
            "RECORD PAYMENT ERROR:",
            error
          );


          const message =
            error
              ?.response
              ?.data
              ?.message ??
            error?.message ??
            "Failed to record payment";


          setSnackbarText(
            message
          );


          setShowSnackbar(
            true
          );

        } finally {

          setRecording(
            false
          );

        }

      };


    /* ========================================================
       UI
    ======================================================== */

    return (

      <View
        style={
          styles.container
        }
      >

        <ScrollView
          showsVerticalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.content
          }
        >

          {/* ==================================================
              HEADER
          ================================================== */}

          <View
            style={
              styles.header
            }
          >

            <Text
              style={
                styles.title
              }
            >
              Collect Fee
            </Text>


            <Text
              style={
                styles.subtitle
              }
            >
              Record a student fee payment
            </Text>

          </View>


          {/* ==================================================
              SEARCH
          ================================================== */}

          <Card
            style={
              styles.card
            }
          >

            <Card.Content>

              <Text
                style={
                  styles.sectionTitle
                }
              >
                Find Student
              </Text>


              <TextInput
                mode="outlined"
                label="Admission Number"
                value={
                  admissionNo
                }
                onChangeText={
                  setAdmissionNo
                }
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="numeric"
                style={
                  styles.input
                }
                onSubmitEditing={
                  searchStudent
                }
              />


              <Button
                mode="contained"
                loading={
                  searchStudentMutation.isLoading
                }
                disabled={
                  searchStudentMutation.isLoading
                }
                onPress={
                  searchStudent
                }
                buttonColor={
                  Colors.brandPrimary
                }
              >
                Search Student
              </Button>

            </Card.Content>

          </Card>


          {/* ==================================================
              STUDENT
          ================================================== */}

          {
            studentFound &&
            student ? (

              <Card
                style={
                  styles.card
                }
              >

                <Card.Content>

                  <Text
                    style={
                      styles.sectionTitle
                    }
                  >
                    Student
                  </Text>


                  <Text
                    style={
                      styles.studentName
                    }
                  >
                    {student.name ??
                      ""}
                  </Text>


                  <Text
                    style={
                      styles.detail
                    }
                  >
                    Admission No:{" "}
                    {
                      student.admissionNo
                    }
                  </Text>


                  <Text
                    style={
                      styles.detail
                    }
                  >
                    Class:{" "}
                    {
                      getClassDisplayName(
                        student.classNumber
                      )
                    }
                  </Text>


                  <Text
                    style={
                      styles.detail
                    }
                  >
                    Section:{" "}
                    {
                      getSectionDisplayName(
                        student.sectionName
                      )
                    }
                  </Text>


                  <Divider
                    style={
                      styles.divider
                    }
                  />


                  <View
                    style={
                      styles.pendingBox
                    }
                  >

                    <Text
                      style={
                        styles.pendingLabel
                      }
                    >
                      Total Pending
                    </Text>


                    <Text
                      style={
                        styles.pendingAmount
                      }
                    >
                      ₹
                      {
                        formatAmount(
                          Number(
                            student.pendingAmount ||
                              0
                          )
                        )
                      }
                    </Text>

                  </View>

                </Card.Content>

              </Card>

            ) : null
          }


          {/* ==================================================
              FEES
          ================================================== */}

          {
            studentFound ? (

              <Card
                style={
                  styles.card
                }
              >

                <Card.Content>

                  <Text
                    style={
                      styles.sectionTitle
                    }
                  >
                    Fee Details
                  </Text>


                  {
                    fees.map(
                      (fee) => (

                        <View
                          key={
                            fee.key
                          }
                          style={
                            styles.feeRow
                          }
                        >

                          <View
                            style={
                              styles.feeInfo
                            }
                          >

                            <Text
                              style={
                                styles.feeLabel
                              }
                            >
                              {
                                fee.label
                              }
                            </Text>


                            <Text
                              style={
                                styles.feePending
                              }
                            >
                              Pending: ₹
                              {
                                formatAmount(
                                  fee.pendingAmount
                                )
                              }
                            </Text>

                          </View>


                          <TextInput
                            mode="outlined"
                            label="Pay"
                            value={
                              fee.payingAmount >
                              0
                                ? String(
                                    fee.payingAmount
                                  )
                                : ""
                            }
                            onChangeText={(
                              value
                            ) =>
                              updateFee(
                                fee.key,
                                value
                              )
                            }
                            keyboardType="decimal-pad"
                            style={
                              styles.feeInput
                            }
                          />

                        </View>

                      )
                    )
                  }


                  <Divider
                    style={
                      styles.divider
                    }
                  />


                  <View
                    style={
                      styles.totalRow
                    }
                  >

                    <Text
                      style={
                        styles.totalLabel
                      }
                    >
                      Total Payment
                    </Text>


                    <Text
                      style={
                        styles.totalAmount
                      }
                    >
                      ₹
                      {
                        formatAmount(
                          totalAmount
                        )
                      }
                    </Text>

                  </View>

                </Card.Content>

              </Card>

            ) : null
          }


          {/* ==================================================
              PAYMENT METHOD
          ================================================== */}

          {
            studentFound ? (

              <Card
                style={
                  styles.card
                }
              >

                <Card.Content>

                  <Text
                    style={
                      styles.sectionTitle
                    }
                  >
                    Payment Method
                  </Text>


                  <View
                    style={
                      styles.paymentModes
                    }
                  >

                    {
                      renderPaymentMode(
                        PaymentMode.cash,
                        "Cash"
                      )
                    }


                    {
                      renderPaymentMode(
                        PaymentMode.wallet,
                        "Wallet"
                      )
                    }

                  </View>


                  {
                    paymentMode ===
                      PaymentMode.wallet ? (

                      <TextInput
                        mode="outlined"
                        label="Wallet Transaction ID"
                        value={
                          transactionId
                        }
                        onChangeText={
                          setTransactionId
                        }
                        autoCapitalize="none"
                        autoCorrect={false}
                        style={
                          styles.input
                        }
                      />

                    ) : null
                  }


                  <Button
                    mode="contained"
                    loading={
                      recording
                    }
                    disabled={
                      recording ||
                      totalAmount <=
                        0
                    }
                    onPress={
                      recordPayment
                    }
                    buttonColor={
                      Colors.brandPrimary
                    }
                    style={
                      styles.recordButton
                    }
                  >
                    Record Payment
                  </Button>

                </Card.Content>

              </Card>

            ) : null
          }

        </ScrollView>


        {/* ====================================================
            SNACKBAR
        ==================================================== */}

        <Snackbar
          visible={
            showSnackbar
          }
          onDismiss={() =>
            setShowSnackbar(
              false
            )
          }
          duration={
            3000
          }
          style={
            styles.snackbar
          }
        >
          {
            snackbarText
          }
        </Snackbar>

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


    content: {
      padding:
        Metrics.x4,

      paddingBottom:
        Metrics.x8,
    },


    header: {
      marginBottom:
        Metrics.x4,
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
      fontSize:
        14,

      color:
        Colors.subtext,

      marginTop:
        Metrics.x1,
    },


    card: {
      marginBottom:
        Metrics.x4,

      borderRadius:
        16,

      backgroundColor:
        "#FFFFFF",
    },


    sectionTitle: {
      fontSize:
        17,

      fontWeight:
        "800",

      color:
        "#171717",

      marginBottom:
        Metrics.x3,
    },


    input: {
      marginBottom:
        Metrics.x3,

      backgroundColor:
        "#FFFFFF",
    },


    studentName: {
      fontSize:
        20,

      fontWeight:
        "800",

      color:
        "#171717",
    },


    detail: {
      fontSize:
        13,

      color:
        Colors.subtext,

      marginTop:
        Metrics.x1,
    },


    divider: {
      marginVertical:
        Metrics.x3,
    },


    pendingBox: {
      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      padding:
        Metrics.x3,

      borderRadius:
        12,

      backgroundColor:
        Colors.brandPrimaryBg,
    },


    pendingLabel: {
      fontSize:
        14,

      fontWeight:
        "700",
    },


    pendingAmount: {
      fontSize:
        20,

      fontWeight:
        "800",

      color:
        Colors.brandPrimary,
    },


    feeRow: {
      flexDirection:
        "row",

      alignItems:
        "center",

      marginBottom:
        Metrics.x3,
    },


    feeInfo: {
      flex: 1,

      marginRight:
        Metrics.x2,
    },


    feeLabel: {
      fontSize:
        14,

      fontWeight:
        "700",

      color:
        "#171717",
    },


    feePending: {
      fontSize:
        11,

      color:
        Colors.subtext,

      marginTop:
        3,
    },


    feeInput: {
      width:
        105,

      height:
        48,

      backgroundColor:
        "#FFFFFF",
    },


    totalRow: {
      flexDirection:
        "row",

      justifyContent:
        "space-between",

      alignItems:
        "center",
    },


    totalLabel: {
      fontSize:
        16,

      fontWeight:
        "800",
    },


    totalAmount: {
      fontSize:
        22,

      fontWeight:
        "800",

      color:
        Colors.brandPrimary,
    },


    paymentModes: {
      flexDirection:
        "row",

      gap:
        Metrics.x2,

      marginBottom:
        Metrics.x3,
    },


    paymentMode: {
      flex: 1,

      minHeight:
        48,

      borderRadius:
        12,

      borderWidth:
        1,

      borderColor:
        "#E1E3E8",

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        "#FFFFFF",
    },


    paymentModeSelected: {
      backgroundColor:
        Colors.brandPrimaryBg,

      borderColor:
        Colors.brandPrimary,
    },


    paymentModeText: {
      fontSize:
        13,

      fontWeight:
        "700",

      color:
        Colors.subtext,
    },


    paymentModeTextSelected: {
      color:
        Colors.brandPrimary,
    },


    recordButton: {
      marginTop:
        Metrics.x2,
    },


    snackbar: {
      backgroundColor:
        "#252525",
    },

  }));


export {
  PrincipalCollectFeeScreen,
};