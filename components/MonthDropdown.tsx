import React, { useState } from "react";
import DropDownPicker from "react-native-dropdown-picker";
import { Colors } from "../theme";

const months = [
  { label: "Jan", value: "1" },
  { label: "Feb", value: "2" },
  { label: "Mar", value: "3" },
  { label: "Apr", value: "4" },
  { label: "May", value: "5" },
  { label: "Jun", value: "6" },
  { label: "Jul", value: "7" },
  { label: "Aug", value: "8" },
  { label: "Sep", value: "9" },
  { label: "Oct", value: "10" },
  { label: "Nov", value: "11" },
  { label: "Dec", value: "12" },
];

type Props = {
  setSelectedMonth: React.Dispatch<React.SetStateAction<string | null>>;
  selectedMonth: string | null;
  placeholder?: string;
  zIndex?: number;
};

const MonthDropdown = ({
  setSelectedMonth,
  selectedMonth,
  placeholder,
  zIndex,
}: Props) => {
  const [open, setOpen] = useState(false);
  const zIndexProp = zIndex ? { zIndex } : {};

  return (
    <DropDownPicker
      placeholder={placeholder ?? "Month"}
      open={open}
      value={selectedMonth}
      items={months}
      setOpen={setOpen}
      setValue={setSelectedMonth}
      maxHeight={42 * 12}
      {...zIndexProp}
    />
  );
};

export { MonthDropdown };
