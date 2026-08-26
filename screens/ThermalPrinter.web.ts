export type DiscoveredPrinter = {
  target: string;
  deviceName: string;
};

export const Printer = null;

export const usePrintersDiscovery = () => {
  return {
    start: async () => {},
    isDiscovering: false,
    printers: [] as DiscoveredPrinter[],
  };
};