import React from "react";
import { View } from "react-native";
import { makeStyles, Metrics } from "../../theme";
import { Icon } from "../icon";

const HeaderLeftDefault = () => {
  const styles = useStyles();
  return (
    <View style={styles.container}>
      <Icon name="arrow-back" size="lg" />
    </View>
  );
};

const useStyles = makeStyles(() => {
  return {
    container: {
      padding: Metrics.x4,
      alignItems: "center",
      justifyContent: "center",
    },
  };
});

export { HeaderLeftDefault };
