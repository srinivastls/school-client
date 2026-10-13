import { RootStackScreenNames } from "../types";

export type CommonModuleKey =
  | "students"
  | "classes"
  | "finance"
  | "academics"
  | "people";

export type CommonModule = {
  key: CommonModuleKey;
  title: string;
  icon: string;
  screens: readonly RootStackScreenNames[];
};

export const CommonScreens = {
  students: RootStackScreenNames.Students,
  teachers: RootStackScreenNames.Teachers,
  parents: RootStackScreenNames.Parents,
  classes: RootStackScreenNames.Classes,
  classStudents: RootStackScreenNames.ClassStudents,
  classDetails: RootStackScreenNames.ClassDetails,
  classTeachers: RootStackScreenNames.ClassTeachers,
  classConfiguration: RootStackScreenNames.ClassConfiguration,
  academicYears: RootStackScreenNames.AcademicYears,
  academics: RootStackScreenNames.Academics,
  finance: RootStackScreenNames.Finance,
  feeCollection: RootStackScreenNames.FeeCollection,
  pendingDues: RootStackScreenNames.PendingDues,
  defaulters: RootStackScreenNames.Defaulters,
  attendance: RootStackScreenNames.Attendance,
  createTeacher: RootStackScreenNames.CreateTeacher,
} as const;

export const COMMON_MODULES: readonly CommonModule[] = [
  {
    key: "students",
    title: "Students",
    icon: "school",
    screens: [CommonScreens.students, CommonScreens.classStudents],
  },
  {
    key: "classes",
    title: "Classes",
    icon: "google-classroom",
    screens: [CommonScreens.classes, CommonScreens.classDetails, CommonScreens.classTeachers, CommonScreens.classConfiguration],
  },
  {
    key: "finance",
    title: "Finance",
    icon: "cash-multiple",
    screens: [CommonScreens.finance, CommonScreens.feeCollection, CommonScreens.pendingDues, CommonScreens.defaulters],
  },
  {
    key: "academics",
    title: "Academics",
    icon: "book-open-variant",
    screens: [CommonScreens.academics, CommonScreens.academicYears, CommonScreens.attendance],
  },
  {
    key: "people",
    title: "People",
    icon: "account-group-outline",
    screens: [CommonScreens.teachers, CommonScreens.parents, CommonScreens.createTeacher],
  },
];
