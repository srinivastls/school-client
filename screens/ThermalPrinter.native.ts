import {
  Printer,
  usePrintersDiscovery,
} from "react-native-esc-pos-printer";

export type DiscoveredPrinter = {
  target: string;
  deviceName: string;
};

export {
  Printer,
  usePrintersDiscovery,
};