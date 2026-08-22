import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { Text } from "react-native";
import { Button, Snackbar, TextInput } from "react-native-paper";
import { ClassList, Page } from "../components";
import { couponServices } from "../services";
import { Colors, makeStyles, Metrics } from "../theme";
import { RootStackScreenNames } from "../types";

function generateCoupon(length = 6) {
  var result = "";
  var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

const CreateCouponScreen = () => {
  const [coupon, setCoupon] = useState("");
  const [discAmount, setDiscAmount] = useState("");
  const [classError, setClassError] = useState("");
  const [discAmountError, setDiscAmountError] = useState("");
  const [couponError, setCouponError] = useState("");
  const [showSnackBar, setShowSnackBar] = useState(false);
  const [snackBarText, setSnackBarText] = useState(
    "Something went wrong. please try again later"
  );
  const [snackBarBg, setSnackBarBg] = useState(Colors.errorBg);
  const [saving, setSaving] = useState(false);
  const navigation = useNavigation();

  const validateClass = () => {
    let isValid = true;
    if (!selectedClass) {
      setClassError("Please select a class");
      isValid = false;
    }

    if (isValid) {
      setClassError("");
    }
    return isValid;
  };

  const validateDiscAmount = (discAmountInput = discAmount) => {
    let isValid = true;
    if (!discAmountInput || !/^[0-9]+(.)?[0-9]*$/.test(discAmountInput)) {
      setDiscAmountError("Invalid discount amount");
      isValid = false;
    }

    if (isValid) {
      setDiscAmountError("");
    }
    return isValid;
  };

  const validateCoupon = (couponInput = coupon) => {
    let isValid = true;
    if (!couponInput) {
      setCouponError("Invalid coupon code");
      isValid = false;
    }

    if (isValid) {
      setCouponError("");
    }
    return isValid;
  };

  const validateForm = () => {
    return validateClass() && validateDiscAmount() && validateCoupon();
  };

  const onSave = async () => {
    const isValid = validateForm();
    if (isValid) {
      setSaving(true);
      try {
        await couponServices.createCoupon({
          code: coupon,
          discount: discAmount,
          classNumber: selectedClass ?? "",
        });
        setSnackBarText("Coupon created successfully");
        setSnackBarBg(Colors.successBg);
        setShowSnackBar(true);
      } catch (err) {
        setSnackBarText(
          //@ts-ignore
          err?.response?.data?.message ??
            "Something went wrong. Please try again later."
        );
        setSnackBarBg(Colors.errorBg);
        setShowSnackBar(true);
      }
      setSaving(false);
    }
  };

  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const styles = useStyles();
  return (
    <Page>
      <ClassList
        selectedClass={selectedClass}
        setSelectedClass={setSelectedClass}
      />
      {classError && <Text style={styles.error}>{classError}</Text>}

      <TextInput
        label={"Discount amount"}
        mode="outlined"
        keyboardType="numeric"
        value={discAmount}
        onChangeText={(text) => {
          setDiscAmount(text);
          validateDiscAmount(text);
        }}
        error={!!discAmountError}
        style={[
          !discAmountError ? styles.marginBottom5 : {},
          !classError ? styles.marginTopx5 : {},
        ]}
      />
      {discAmountError && <Text style={styles.error}>{discAmountError}</Text>}

      <TextInput
        label={"Coupon code"}
        mode="outlined"
        value={coupon}
        autoCapitalize="characters"
        style={!couponError ? styles.marginBottom5 : {}}
        editable={false}
        error={!!couponError}
      />
      {couponError && <Text style={styles.error}>{couponError}</Text>}

      <Button
        mode="outlined"
        style={styles.marginBottom5}
        onPress={() => {
          setCoupon(generateCoupon());
          setCouponError("");
        }}
      >
        Generate coupon
      </Button>
      <Button
        mode="contained"
        onPress={onSave}
        loading={saving}
        disabled={saving}
      >
        Save coupon
      </Button>
      <Button
        style={styles.marginTopx5}
        onPress={() => {
          //@ts-ignore
          navigation.navigate(RootStackScreenNames.CouponList);
        }}
      >
        All coupons
      </Button>
      <Snackbar
        visible={showSnackBar}
        onDismiss={() => {
          setShowSnackBar(false);
        }}
        style={{ backgroundColor: snackBarBg }}
        duration={2000}
      >
        {snackBarText}
      </Snackbar>
    </Page>
  );
};

const useStyles = makeStyles(() => ({
  marginBottom5: {
    marginBottom: Metrics.x5,
  },
  marginTopx5: {
    marginTop: Metrics.x5,
  },
  error: {
    color: Colors.error,
    marginBottom: Metrics.x5,
  },
}));

export { CreateCouponScreen };
