import { StyleSheet } from "react-native";

export const makeStyles =
  <
    S extends StyleSheet.NamedStyles<S> | StyleSheet.NamedStyles<any>,
    P extends any[]
  >(
    generateStyles: (...props: P) => S
  ) =>
  (...props: P): S => {
    const styles = generateStyles(...props);
    return StyleSheet.create(styles);
  };
