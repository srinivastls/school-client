export type Admin = {
  name: string;
  designation: string;
  adminId: string;
  email: string;
  roles: Roles[];
};

export enum Roles {
  admin = "admin",
  superadmin = "superadmin",
}

export type Class = {
  classNumber: string;
  tuitionFee: string;
  textBookFee: string;
  noteBookFee: string;
  year: string;
};

export enum CouponStatus {
  ACTIVE = "ACTIVE",
  APPLIED = "APPLIED",
}

export type Coupon = {
  code: string;
  classNumber: string;
  discount: string;
  status: CouponStatus;
  createdAt: string;
};

export type Sibling = {
  admissionNo: string;
  name: string;
};
export type Student = {
  admissionNo: string;
  name: string;
  aadhaar: string;
  fatherName: string;
  dob: string;
  doj: string;
  phoneNo: string;
  classNumber: Class;
  tie: { amount: string; pendingAmount: string };
  diary: { amount: string; pendingAmount: string };
  belt: { amount: string; pendingAmount: string };
  arrears: { amount: string; pendingAmount: string };
  pendingAmount: string;
  pendingTuitionFee: string;
  pendingTextbookFee: string;
  pendingNotebookFee: string;
  couponCode?: Coupon;
  tcNo?: string;
  siblings: Sibling[];
};

export enum PaymentMode {
  cash = "cash",
  wallet = "wallet",
}

export type AmountDetails = {
  tie: string;
  diary: string;
  belt: string;
  arrears: string;
} & Pick<Class, "tuitionFee" | "textBookFee" | "noteBookFee"> & {
    other: string;
  };
export type Transaction = {
  id: string;
  date: string;
  student: Student;
  adminId: string;
  amount: string;
  amountDetails: AmountDetails;
  pendingAmount: string;
  paymentMode: PaymentMode;
  classNumber: string;
};
