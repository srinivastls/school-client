import dayjs from "dayjs";

export const isEmailValid = (email: string) => {
  return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email);
};

export const isNonEmptyAlphabets = (data: string) => {
  return /^[a-zA-Z]+$/.test(data);
};

export const isNonEmptyNumerals = (data: string) => {
  return /^\d+$/.test(data);
};

export const isNonEmptyDecimalNumber = (data: string) => {
  return /^\d+(.\d+)?$/.test(data);
};

export const isNonEmptyAlphaNumerals = (data: string) => {
  return /^\w+$/.test(data);
};

export const isNonEmptyAlphabetsWithSpace = (data: string) => {
  return /^[a-zA-Z ]+$/.test(data);
};

export const isAadhaarValid = (data: string) => {
  return isNonEmptyNumerals(data) && data.length === 12;
};

export const isValidDate = (data: string) => {
  return /^(0?[1-9]|[12][0-9]|3[01])[\/\-](0?[1-9]|1[012])[\/\-]\d{4}$/.test(
    data
  );
};

export const isValidPhoneNo = (data: string) => {
  return /^\d{10}$/.test(data);
};
