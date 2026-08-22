import {
  RouteProp,
  StackActions,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { RefreshControl, ScrollView, Text, View } from "react-native";
import Snackbar from "react-native-snackbar";
import { useQuery } from "react-query";
import { Page, StudentDetailsCard, TransactionItem } from "../components";
import { txnServices } from "../services";
import { studentServices } from "../services/studentServices";
import { Colors, makeStyles, Metrics } from "../theme";
import {
  GetStudentResponse,
  RootStackParamList,
  RootStackScreenNames,
  Student,
  Transaction,
} from "../types";

const StudentDetails = () => {
  const route =
    useRoute<
      RouteProp<RootStackParamList, RootStackScreenNames.StudentDetails>
    >();
  const { student } = route.params;

  const { data, error, refetch, isFetching } = useQuery(
    ["transactions", student.admissionNo],
    () => txnServices.getStudentTxns({ admissionNo: student.admissionNo })
  );

  const {
    data: studentFromQuery,
    isFetching: fetchingStudent,
    refetch: refetchStudent,
    isError: studentFetchError,
  } = useQuery(
    ["student" + student.admissionNo],
    () => studentServices.getStudentById({ admissionNo: student.admissionNo }),
    { enabled: false, cacheTime: 0 }
  );

  const renderTransaction = (txn: Transaction) => {
    return <TransactionItem txn={txn} key={txn.id} student={student} />;
  };

  const styles = useStyles();
  const navigation = useNavigation();

  const [fetchingSibling, setFetchingSibling] = useState(false);
  const onSiblingPress = async (admissionNo: string) => {
    setFetchingSibling(true);
    try {
      const sibling = await studentServices.getStudentById({ admissionNo });
      navigation.dispatch(
        StackActions.push(RootStackScreenNames.StudentDetails, {
          student: sibling,
        })
      );
    } catch (error) {
      Snackbar.show({
        text:
          //@ts-ignore
          error?.response?.data?.message ??
          "Something went wrong in fetching transactions",
        backgroundColor: Colors.errorBg,
        duration: Snackbar.LENGTH_LONG,
      });
    }
    setFetchingSibling(false);
  };

  useEffect(() => {
    if (error) {
      Snackbar.show({
        text:
          //@ts-ignore
          error?.response?.data?.message ??
          "Something went wrong in fetching transactions",
        backgroundColor: Colors.errorBg,
        duration: Snackbar.LENGTH_LONG,
      });
    }
  }, [error]);

  const onRefresh = () => {
    refetch();
    refetchStudent();
  };

  const isStudentFromQueryOfTypeStudent = (
    studentFromQuery: GetStudentResponse
  ): studentFromQuery is Student => {
    return !!student.admissionNo;
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          onRefresh={onRefresh}
          refreshing={isFetching || fetchingStudent || fetchingSibling}
        />
      }
    >
      <Page>
        <StudentDetailsCard
          student={
            !studentFetchError &&
            studentFromQuery &&
            isStudentFromQueryOfTypeStudent(studentFromQuery)
              ? studentFromQuery
              : student
          }
          onSiblingPress={onSiblingPress}
        />
        <View style={styles.marginBottomX5} />
        {data?.length ? (
          <>
            <Text>Transactions</Text>
            <View style={styles.marginBottomX5} />
            {data.map(renderTransaction)}
          </>
        ) : null}
      </Page>
    </ScrollView>
  );
};

const useStyles = makeStyles(() => ({
  marginBottomX5: { marginBottom: Metrics.x5 },
}));

export { StudentDetails };
