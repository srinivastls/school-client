import React from "react";
import { View, Text } from "react-native";

import { useUserStore } from "../../store";

const AdminDashboard = () => {
  const user = useUserStore(
    (state) => state.user
  );

  return (
    <View
      style={{
        flex: 1,
        padding: 20,
      }}
    >
      <Text
        style={{
          fontSize: 24,
          fontWeight: "700",
          marginBottom: 8,
        }}
      >
        Admin Dashboard
      </Text>

      <Text>
        Welcome, {user?.name}
      </Text>

      <Text
        style={{
          marginTop: 8,
        }}
      >
        School: {user?.schoolName}
      </Text>
    </View>
  );
};

export { AdminDashboard };