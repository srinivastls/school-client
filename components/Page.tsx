import React, { ReactNode } from "react";
import { Platform, Text, View, ViewStyle } from "react-native";
import { makeStyles, Metrics } from "../theme";
import LottieView from "lottie-react-native";
import { Button } from "react-native-paper";

const Loader = () => {
  const styles = useStyles();

  // Lottie is not required on web.
  if (Platform.OS === "web") {
    return (
      <View style={styles.lottieContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.lottieContainer}>
      <LottieView
        source={require("../assets/bookLoader.json")}
        autoPlay
        loop
        style={styles.lottie}
      />
    </View>
  );
};

const Error = ({ onRetry }: { onRetry?: () => void }) => {
  const styles = useStyles();

  return (
    <View style={styles.lottieContainer}>
      {Platform.OS === "web" ? (
        <Text style={styles.errorText}>Something went wrong</Text>
      ) : (
        <LottieView
          source={require("../assets/error.json")}
          autoPlay
          loop
          style={styles.lottie}
        />
      )}

      {onRetry && (
        <Button mode="contained" onPress={onRetry}>
          TRY AGAIN
        </Button>
      )}
    </View>
  );
};

const Page = ({
  style = {},
  children,
  isError,
  isLoading,
  onRetry,
}: {
  style?: ViewStyle;
  children: ReactNode;
  isError?: boolean;
  isLoading?: boolean;
  onRetry?: () => void;
}) => {
  const styles = useStyles();

  return (
    <View style={[styles.container, style]}>
      {isLoading ? (
        <Loader />
      ) : isError ? (
        <Error onRetry={onRetry} />
      ) : (
        children
      )}
    </View>
  );
};

const useStyles = makeStyles(() => ({
  container: {
    flex: 1,
    margin: Metrics.x4,
  },

  lottieContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  lottie: {
    height: 200,
    width: 200,
  },

  errorText: {
    marginTop: -Metrics.x5,
    marginBottom: Metrics.x5,
  },
}));

export { Page };