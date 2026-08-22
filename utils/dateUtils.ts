import dayjs from "dayjs";

export const getDateRange = (
  numberOfdays: number,
  format: string = "DD/MM/YYYY"
) => {
  const currDate = dayjs();
  let date = currDate.subtract(numberOfdays, "days");
  const range = [];
  while (date.isBefore(currDate)) {
    date = date.add(1, "day");
    range.push(date.format(format));
  }
  return range;
};

export const getDateRangeFromStartOf = (startOf: "week" | "month") => {
  const currDate = dayjs();
  const firstDayOfMonth = dayjs().startOf(startOf);
  const diff = currDate.diff(firstDayOfMonth, "days");
  return getDateRange(diff + 1);
};
