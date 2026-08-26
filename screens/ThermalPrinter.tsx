export type DiscoveredPrinter = {
  target: string;
  deviceName: string;
};

export { Printer, usePrintersDiscovery } from "./ThermalPrinter.native";