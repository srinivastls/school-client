import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { useNavigation } from "@react-navigation/native";

import React, { useState } from "react";

import { FlatList, Text } from "react-native";

import {
  Button,
  Card,
  Paragraph,
  Snackbar,
} from "react-native-paper";

import { useQuery } from "react-query";

import { Icon, Page } from "../components";

import {  userServices } from "../services";

import { Colors, Metrics } from "../theme";

import {
  RootStackParamList,
} from "../types";
import { isAdmin } from "../utils";
import { GetAllUsersResponse } from "../types/userApiTypes";


//const keyExtractor = (admin: Admin) => admin.adminId;

const AdminListScreen = () => {
  const {
    data,
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useQuery<GetAllUsersResponse>(
    ["allUsers"],
    //getAllUsers
  );

  // Snackbar state
  const [showSnackBar, setShowSnackBar] =
    useState(false);

  const [snackBarText, setSnackBarText] =
    useState("");

  const showSnackbar = (message: string) => {
    setSnackBarText(message);
    setShowSnackBar(true);
  };

  const AdminCard = ({ admin }: { admin: any }) => {
    const navigation: NativeStackNavigationProp<RootStackParamList> =
      // @ts-ignore
      useNavigation().getParent("RootStack");

    const [deleting, setDeleting] = useState(false);

    const onDelete = async () => {
      if (deleting) {
        return;
      }

      setDeleting(true);

      try {
        await userServices.deleteUser({
          email: admin.email,
        });

        await refetch();

        showSnackbar("Deleted successfully");
      } catch (err) {
        showSnackbar(
          // @ts-ignore
          err?.response?.data?.message ??
            "Something went wrong. Please try again later."
        );
      } finally {
        setDeleting(false);
      }
    };

    const {
      name,
      designation,
      adminId,
      email,
    } = admin;

    return (
      <Card
        style={{
          marginBottom: Metrics.x4,
          marginHorizontal: Metrics.x1,
        }}
      >
        <Card.Content>
          <Text
            style={{
              fontWeight: "bold",
              fontSize: 20,
            }}
          >
            {name}
          </Text>

          <Paragraph>
            Designation: {designation}
          </Paragraph>

          <Paragraph>
            ID: {adminId}
          </Paragraph>

          <Paragraph>
            Email: {email}
          </Paragraph>
        </Card.Content>

        <Card.Actions>
          {!isAdmin(admin) ? (
            <Button
              mode="contained-tonal"
              onPress={onDelete}
              loading={deleting}
              disabled={deleting}
            >
              <Icon
                name="delete-outline"
                size="lg"
              />
            </Button>
          ) : (
            <Button mode="text">
              <Text>SUPERADMIN</Text>
            </Button>
          )}
        </Card.Actions>
      </Card>
    );
  };

  const renderAdmin = ({
    item,
  }: {
    item: any;
  }) => {
    return <AdminCard admin={item} />;
  };

  return (
    <>
      <Page
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
      >
        <FlatList
          data={data?.users ?? []}
          //keyExtractor={keyExtractor}
          renderItem={renderAdmin}
          showsVerticalScrollIndicator={false}
          refreshing={isFetching}
          onRefresh={refetch}
        />
      </Page>

      <Snackbar
        visible={showSnackBar}
        onDismiss={() => {
          setShowSnackBar(false);
        }}
        duration={3000}
        style={{
          backgroundColor: Colors.errorBg,
        }}
      >
        {snackBarText}
      </Snackbar>
    </>
  );
};

export { AdminListScreen };