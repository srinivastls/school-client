import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { FlatList, Text } from "react-native";
import { Button, Card, Paragraph } from "react-native-paper";
import { useQuery } from "react-query";
import { Icon, Page } from "../components";
import { getAllUsers, userServices } from "../services";
import { Colors, Metrics } from "../theme";
import { Admin, RootStackParamList } from "../types";
import { GetAllUsersResponse } from "../types/userApiTypes";
import Snackbar from "react-native-snackbar";
import { isUserSuperAdmin } from "../utils";

const keyExtractor = (admin: Admin) => admin.adminId;

const AdminListScreen = () => {
  const { data, isLoading, isError, isFetching, refetch } =
    useQuery<GetAllUsersResponse>(["allUsers"], getAllUsers);

  const AdminCard = ({ admin }: { admin: Admin }) => {
    const navigation: NativeStackNavigationProp<RootStackParamList> =
      //@ts-ignore
      useNavigation().getParent("RootStack");

    const [deleting, setDeleting] = useState(false);

    const onDelete = async () => {
      setDeleting(true);
      try {
        await userServices.deleteUser({ email });
        await refetch();
        Snackbar.show({
          text: "Admin deleted successfully",
          backgroundColor: Colors.successBg,
          duration: Snackbar.LENGTH_SHORT,
        });
      } catch (err) {
        Snackbar.show({
          text:
            //@ts-ignore
            err?.response?.data?.message ??
            "Something went wrong. Please try again later.",
          backgroundColor: Colors.errorBg,
          duration: Snackbar.LENGTH_LONG,
        });
      }
      setDeleting(false);
    };

    const { name, designation, adminId, email } = admin;
    return (
      <Card style={{ marginBottom: Metrics.x4, marginHorizontal: Metrics.x1 }}>
        <Card.Content>
          <Text style={{ fontWeight: "bold", fontSize: 20 }}>{name}</Text>
          <Paragraph>Designation: {designation}</Paragraph>
          <Paragraph>ID: {adminId}</Paragraph>
          <Paragraph>Email: {email}</Paragraph>
        </Card.Content>
        <Card.Actions>
          {!isUserSuperAdmin(admin) ? (
            <Button
              mode="contained-tonal"
              onPress={onDelete}
              loading={deleting}
            >
              <Icon name="delete-outline" size="lg" />
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

  const renderAdmin = ({ item }: { item: Admin }) => {
    return <AdminCard admin={item} />;
  };

  return (
    <Page isLoading={isLoading} isError={isError} onRetry={refetch}>
      <FlatList
        data={data?.users ?? []}
        keyExtractor={keyExtractor}
        renderItem={renderAdmin}
        showsVerticalScrollIndicator={false}
        refreshing={isFetching}
        onRefresh={refetch}
      />
    </Page>
  );
};

export { AdminListScreen };
