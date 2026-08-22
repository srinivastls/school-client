import { Student } from "../types";

export const getTotalFee = (student: Student) => {
  const tuitionFee = Number(
    student.classNumber?.tuitionFee ?? 0
  );

  const textBookFee = Number(
    student.classNumber?.textBookFee ?? 0
  );

  const noteBookFee = Number(
    student.classNumber?.noteBookFee ?? 0
  );

  const tieAmount = Number(student.tie?.amount ?? 0);

  const diaryAmount = Number(student.diary?.amount ?? 0);

  const beltAmount = Number(student.belt?.amount ?? 0);

  return (
    tuitionFee +
    textBookFee +
    noteBookFee +
    tieAmount +
    diaryAmount +
    beltAmount
  );
};