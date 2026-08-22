import React, { useEffect, useRef, useState } from "react";
import {
  FlatList,
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Button, TextInput } from "react-native-paper";
import { ClassList, Page, SiblingFormType, SiblingsForm } from "../components";
import { Colors, Metrics } from "../theme";
import {
  CreateStudentFormFields,
  CreateStudentRequest,
  RootStackParamList,
  RootStackScreenNames,
} from "../types";
import { useQuery, useQueryClient } from "react-query";
import { classServices } from "../services";
import Snackbar from "react-native-snackbar";
import { studentServices } from "../services/studentServices";
import { Controller, useForm } from "react-hook-form";
import {
  isAadhaarValid,
  isNonEmptyAlphabetsWithSpace,
  isNonEmptyAlphaNumerals,
  isNonEmptyDecimalNumber,
  isValidDate,
  isValidPhoneNo,
} from "../utils";

const StudentRegistrationFormScreen = ({
  route,
}: NativeStackScreenProps<
  RootStackParamList,
  RootStackScreenNames.StudentRegistrationForm
>) => {
  const { preFetchedData } = route.params ?? {};
  const [selectedClass, setSelectedClass] = useState<string | null>(
    preFetchedData?.classNumber?.classNumber ?? null
  );

  const { data: classDetails, refetch } = useQuery(
    [selectedClass],
    () => classServices.getClassDetails(selectedClass ?? ""),
    { enabled: false }
  );

  useEffect(() => {
    if (selectedClass) {
      refetch();
      setDefaultValues((defaultValues) => ({
        ...defaultValues,
        classNumber: selectedClass,
      }));
    }
  }, [selectedClass]);

  const [loading, setLoading] = useState(false);

  const [defaultValues, setDefaultValues] = useState<
    Omit<CreateStudentFormFields, "classNumber">
  >({
    admissionNo: "",
    name: "",
    aadhaar: "",
    fatherName: "",
    dob: "",
    doj: "",
    phoneNo: "",
    tcNo: "",
    siblings: [],
    ...preFetchedData,
    tie: preFetchedData?.tie?.amount ?? "0",
    diary: preFetchedData?.diary?.amount ?? "0",
    belt: preFetchedData?.belt?.amount ?? "0",
    arrears: preFetchedData?.arrears?.amount ?? "0",
    couponCode: preFetchedData?.couponCode?.code ?? "",
  });

  const siblingsRef = useRef<SiblingFormType[]>(defaultValues.siblings);
  const [siblingsErrors, setSiblingsErrors] = useState<{
    index?: number;
    message?: string;
  }>();

  const {
    control,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<CreateStudentFormFields>({ defaultValues });

  const validateData = (data: CreateStudentFormFields) => {
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
    if (!isNonEmptyAlphaNumerals(admissionNo)) {
      setError("admissionNo", { message: "Invalid admission number" });
      return;
    }
    if (!isNonEmptyAlphabetsWithSpace(name)) {
      setError("name", { message: "Invalid name" });
      return;
    }
    if (!isAadhaarValid(aadhaar)) {
      setError("aadhaar", { message: "Invalid Aadhaar" });
      return;
    }
    if (!isNonEmptyAlphabetsWithSpace(fatherName)) {
      setError("fatherName", { message: "Invalid father name" });
      return;
    }
    if (!isValidDate(dob)) {
      setError("dob", { message: "Invalid date" });
      return;
    }
    if (!isValidDate(doj)) {
      setError("doj", { message: "Invalid date" });
      return;
    }
    if (!isValidPhoneNo(phoneNo)) {
      setError("phoneNo", { message: "Invalid phone number" });
      return;
    }

    if (!isNonEmptyDecimalNumber(tie)) {
      setError("tie", { message: "Invalid amount" });
      return;
    }
    if (!isNonEmptyDecimalNumber(diary)) {
      setError("diary", { message: "Invalid amount" });
      return;
    }
    if (!isNonEmptyDecimalNumber(belt)) {
      setError("belt", { message: "Invalid amount" });
      return;
    }
    if (!isNonEmptyDecimalNumber(arrears)) {
      setError("arrears", { message: "Invalid amount" });
      return;
    }

    for (let i = 0; i < siblingsRef.current.length; ++i) {
      const sibling = siblingsRef.current[i];
      if (!sibling.admissionNo) {
        setSiblingsErrors({ index: i, message: "Invalid sibling details" });
        return;
      }
    }
    return true;
  };

  const queryClient = useQueryClient();

  const onSubmit = async (
    data: Omit<CreateStudentFormFields, "classNumber">
  ) => {
    const isValid = validateData({ ...data, classNumber: selectedClass ?? "" });
    if (!isValid) {
      return;
    }
    setLoading(true);
    try {
      preFetchedData
        ? await studentServices.editStudent({
            ...data,
            //@ts-ignore
            siblings: siblingsRef.current,
            classNumber: selectedClass ?? "",
            oldAdmissionNo: preFetchedData.admissionNo ?? "",
          })
        : await studentServices.createStudent({
            ...data,
            //@ts-ignore
            siblings: siblingsRef.current,
            classNumber: selectedClass ?? "",
          });
      queryClient.refetchQueries(["student" + data.admissionNo]);
      queryClient.refetchQueries(["transactions"]);
      Snackbar.show({
        text: preFetchedData
          ? "Student details edited successfully"
          : "Student created successfully",
        backgroundColor: Colors.successBg,
        duration: Snackbar.LENGTH_SHORT,
      });
    } catch (err) {
      Snackbar.show({
        text:
          //@ts-ignore
          err?.response?.data?.message ??
          "Something went wrong. Please try again later.",
        backgroundColor: Colors.errorBg,
        duration: Snackbar.LENGTH_LONG,
      });
    }
    setLoading(false);
  };

  const renderItem = (item: any) => {
    return (
      <Page>
        <Controller
          control={control}
          rules={{}}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="Admission No."
              onChangeText={onChange}
              mode="outlined"
              //
              autoCapitalize="characters"
              value={value}
              error={!!errors.admissionNo?.message}
            />
          )}
          name="admissionNo"
        />
        <Text style={styles.error}>{errors.admissionNo?.message ?? ""}</Text>

        <Controller
          control={control}
          rules={{}}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="Student name"
              onChangeText={onChange}
              mode="outlined"
              //
              autoCapitalize="words"
              value={value}
              error={!!errors.name?.message}
            />
          )}
          name="name"
        />
        <Text style={styles.error}>{errors.name?.message ?? ""}</Text>

        <Controller
          control={control}
          rules={{}}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="Aadhaar number"
              value={value}
              onChangeText={onChange}
              mode="outlined"
              keyboardType="numeric"
              error={!!errors.aadhaar?.message}
            />
          )}
          name="aadhaar"
        />
        <Text style={styles.error}>{errors.aadhaar?.message ?? ""}</Text>

        <Controller
          control={control}
          rules={{}}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="Father name"
              value={value}
              onChangeText={onChange}
              mode="outlined"
              error={!!errors.fatherName?.message}
            />
          )}
          name="fatherName"
        />
        <Text style={styles.error}>{errors.fatherName?.message ?? ""}</Text>

        <Controller
          control={control}
          rules={{}}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="Date of birth (DD/MM/YYYY)"
              value={value}
              onChangeText={onChange}
              mode="outlined"
              error={!!errors.dob?.message}
            />
          )}
          name="dob"
        />
        <Text style={styles.error}>{errors.dob?.message ?? ""}</Text>

        <Controller
          control={control}
          rules={{}}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="Date of joining (DD/MM/YYYY)"
              value={value}
              onChangeText={onChange}
              mode="outlined"
              error={!!errors.doj?.message}
            />
          )}
          name="doj"
        />
        <Text style={styles.error}>{errors.doj?.message ?? ""}</Text>

        <Controller
          control={control}
          rules={{}}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="Phone number"
              value={value}
              onChangeText={onChange}
              mode="outlined"
              keyboardType="numeric"
              error={!!errors.phoneNo?.message}
            />
          )}
          name="phoneNo"
        />
        <Text style={styles.error}>{errors.phoneNo?.message ?? ""}</Text>

        <ClassList
          selectedClass={selectedClass}
          setSelectedClass={setSelectedClass}
        />
        <View style={styles.marginBottomX3} />

        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {
            Snackbar.show({
              text: "Cannot edit class details. They are fetched from the selected class",
              duration: Snackbar.LENGTH_LONG,
              backgroundColor: Colors.warningBg,
              textColor: "black",
            });
          }}
        >
          <>
            <TextInput
              label="Tuition fee"
              value={classDetails?.data?.tuitionFee}
              mode="outlined"
              editable={false}
              keyboardType="numeric"
              style={styles.marginBottomX4}
            />
            <TextInput
              label="Textook amount"
              value={classDetails?.data?.textBookFee}
              mode="outlined"
              editable={false}
              style={styles.marginBottomX4}
            />
            <TextInput
              label="Notebook amount"
              value={classDetails?.data?.noteBookFee}
              mode="outlined"
              editable={false}
              style={styles.marginBottomX4}
            />
          </>
        </TouchableOpacity>

        <Controller
          control={control}
          rules={{}}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="Tie"
              value={value}
              onChangeText={onChange}
              mode="outlined"
              keyboardType="numeric"
              error={!!errors.tie?.message}
            />
          )}
          name="tie"
        />
        <Text style={styles.error}>{errors.tie?.message ?? ""}</Text>

        <Controller
          control={control}
          rules={{}}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="Diary"
              value={value}
              onChangeText={onChange}
              mode="outlined"
              keyboardType="numeric"
              error={!!errors.diary?.message}
            />
          )}
          name="diary"
        />
        <Text style={styles.error}>{errors.diary?.message ?? ""}</Text>

        <Controller
          control={control}
          rules={{}}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="Belt"
              value={value}
              onChangeText={onChange}
              mode="outlined"
              keyboardType="numeric"
              error={!!errors.belt?.message}
            />
          )}
          name="belt"
        />
        <Text style={styles.error}>{errors.belt?.message ?? ""}</Text>

        <Controller
          control={control}
          rules={{}}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="Coupon code"
              value={value}
              onChangeText={onChange}
              mode="outlined"
              editable={!!!preFetchedData?.couponCode?.code} //it is not editable if coupon was already applied
              autoCapitalize="characters"
              error={!!errors.couponCode?.message}
            />
          )}
          name="couponCode"
        />
        <Text style={styles.error}>{errors.couponCode?.message ?? ""}</Text>

        <Controller
          control={control}
          rules={{}}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="Arrears (last year balance)"
              value={value}
              onChangeText={onChange}
              mode="outlined"
              keyboardType="numeric"
              error={!!errors.arrears?.message}
            />
          )}
          name="arrears"
        />
        <Text style={styles.error}>{errors.arrears?.message ?? ""}</Text>

        <Controller
          control={control}
          rules={{}}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="TC No. (optional)"
              value={value ?? ""}
              onChangeText={onChange}
              mode="outlined"
              error={!!errors.tcNo?.message}
            />
          )}
          name="tcNo"
        />
        <Text style={styles.error}>{errors.tcNo?.message ?? ""}</Text>

        <SiblingsForm siblingsRef={siblingsRef} errors={siblingsErrors} />

        <Button
          mode="contained"
          loading={loading}
          disabled={loading}
          onPress={handleSubmit(onSubmit)}
        >
          {preFetchedData ? "EDIT STUDENT DETAILS" : "CREATE STUDENT ACCOUNT"}
        </Button>
      </Page>
    );
  };

  return (
    <FlatList
      data={["dummy"]}
      renderItem={renderItem}
      showsVerticalScrollIndicator={false}
      automaticallyAdjustKeyboardInsets
      keyboardShouldPersistTaps="handled"
    ></FlatList>
  );
};

const styles = StyleSheet.create({
  marginBottomX4: { marginBottom: Metrics.x4 },
  marginBottomX3: { marginBottom: Metrics.x3 },
  error: {
    color: Colors.error,
  },
});

export { StudentRegistrationFormScreen };
