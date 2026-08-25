import { StateStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const zustandStorage: StateStorage = {
  setItem: async (name, value) => {
    await AsyncStorage.setItem(name, value);
  },

  getItem: async (name) => {
    const value = await AsyncStorage.getItem(name);
    return value ?? null;
  },

  removeItem: async (name) => {
    await AsyncStorage.removeItem(name);
  },
};

