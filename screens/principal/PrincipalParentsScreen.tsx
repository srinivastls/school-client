import React, { useState } from "react";

import {
  FlatList,
  View,
  Text,
} from "react-native";

import {
  TextInput,
  TouchableRipple,
} from "react-native-paper";

import {
  useNavigation,
} from "@react-navigation/native";

import type {
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";

import {
  Colors,
  makeStyles,
  Metrics,
} from "../../theme";

import {
  principalServices,
} from "../../services";

import {
  useQuery,
} from "react-query";

import {
  RootStackParamList,
  RootStackScreenNames,
} from "../../types";


/* ============================================================
   TYPES
============================================================ */

type ParentChild = {
  id: string;

  admissionNo: string;

  name: string;

  phone?: string | null;

  status: string;

  relationship:
    | "FATHER"
    | "MOTHER"
    | "GUARDIAN";

  isPrimary: boolean;

  class: {
    id: string;
    classNumber: string;
    displayName: string;
  };

  section: {
    id: string;
    sectionName: string;
  };
};


type Parent = {
  id: string;

  name: string;

  email: string;

  phone?: string | null;

  isActive: boolean;

  mustChangePassword: boolean;

  lastLogin?: string | null;

  createdAt: string;

  updatedAt: string;

  children: ParentChild[];
};


/* ============================================================
   NAVIGATION
============================================================ */

type NavigationProp =
  NativeStackNavigationProp<
    RootStackParamList
  >;


/* ============================================================
   SCREEN
============================================================ */

const PrincipalParentsScreen =
  () => {

    const styles =
      useStyles();

    const navigation =
      useNavigation<NavigationProp>();


    const [
      search,
      setSearch,
    ] = useState("");


    /* ========================================================
       GET PARENTS
    ======================================================== */

    const {
      data,
      isLoading,
      error,
    } = useQuery(
      [
        "principal-parents",
      ],
      principalServices.getParents
    );


    const parents: Parent[] =
      data?.parents ?? [];


    /* ========================================================
       SEARCH
    ======================================================== */

    const filteredParents =
      parents.filter(
        (
          parent: Parent
        ) => {

          const value =
            search
              .trim()
              .toLowerCase();

          return (

            parent.name
              ?.toLowerCase()
              .includes(value) ||

            parent.email
              ?.toLowerCase()
              .includes(value) ||

            parent.phone
              ?.toLowerCase()
              .includes(value) ||

            parent.children?.some(
              (child) =>
                child.name
                  ?.toLowerCase()
                  .includes(value) ||

                child.admissionNo
                  ?.toLowerCase()
                  .includes(value)
            )

          );
        }
      );


    /* ========================================================
       PARENT ITEM
    ======================================================== */

    const renderParent = ({
      item,
    }: {
      item: Parent;
    }) => {

      const children =
        item.children ?? [];


      return (

        <TouchableRipple

          style={
            styles.card
          }

          onPress={() => {

            navigation.navigate(
              RootStackScreenNames.PrincipalParentDetails,
              {
                parent: item,
              }
            );

          }}

          rippleColor={
            Colors.brandPrimaryBg
          }
        >

          <View>

            {/* ==================================================
                PARENT NAME
            ================================================== */}

            <Text
              style={
                styles.name
              }
            >
              {item.name ||
                "Parent"}
            </Text>


            {/* ==================================================
                EMAIL
            ================================================== */}

            <Text
              style={
                styles.email
              }
            >
              {item.email}
            </Text>


            {/* ==================================================
                PHONE
            ================================================== */}

            {item.phone ? (

              <Text
                style={
                  styles.detail
                }
              >
                Phone:{" "}
                {item.phone}
              </Text>

            ) : null}


            {/* ==================================================
                CHILDREN
            ================================================== */}

            {children.length >
            0 ? (

              <View
                style={
                  styles.childrenContainer
                }
              >

                <Text
                  style={
                    styles.childrenLabel
                  }
                >
                  Children
                </Text>


                {children.map(
                  (
                    child
                  ) => (

                    <Text
                      key={
                        child.id
                      }

                      style={
                        styles.child
                      }
                    >
                      •{" "}
                      {child.name}
                      {" — "}
                      Class{" "}
                      {
                        child
                          .class
                          .displayName
                      }{" "}
                      -{" "}
                      {
                        child
                          .section
                          .sectionName
                      }
                    </Text>

                  )
                )}

              </View>

            ) : (

              <Text
                style={
                  styles.detail
                }
              >
                No students linked
              </Text>

            )}


            {/* ==================================================
                STATUS
            ================================================== */}

            <View
              style={[
                styles.statusBadge,

                item.isActive
                  ? styles.activeBadge
                  : styles.inactiveBadge,
              ]}
            >

              <Text
                style={
                  styles.statusText
                }
              >
                {item.isActive
                  ? "ACTIVE"
                  : "INACTIVE"}
              </Text>

            </View>

          </View>

        </TouchableRipple>
      );
    };


    /* ========================================================
       LOADING
    ======================================================== */

    if (isLoading) {

      return (

        <View
          style={
            styles.center
          }
        >

          <Text
            style={
              styles.emptyTitle
            }
          >
            Loading parents...
          </Text>

        </View>
      );
    }


    /* ========================================================
       ERROR
    ======================================================== */

    if (error) {

      return (

        <View
          style={
            styles.center
          }
        >

          <Text
            style={
              styles.emptyTitle
            }
          >
            Unable to load parents
          </Text>


          <Text
            style={
              styles.emptyText
            }
          >
            Please try again later.
          </Text>

        </View>
      );
    }


    /* ========================================================
       UI
    ======================================================== */

    return (

      <View
        style={
          styles.container
        }
      >

        {/* ==================================================
            HEADER
        ================================================== */}

        <Text
          style={
            styles.title
          }
        >
          Parents
        </Text>


        <Text
          style={
            styles.subtitle
          }
        >
          Manage parents in your school
        </Text>


        {/* ==================================================
            SEARCH
        ================================================== */}

        <TextInput
          mode="outlined"

          label="Search parents"

          value={
            search
          }

          onChangeText={
            setSearch
          }

          autoCapitalize="none"

          autoCorrect={
            false
          }

          style={
            styles.search
          }
        />


        {/* ==================================================
            LIST
        ================================================== */}

        <FlatList

          data={
            filteredParents
          }

          renderItem={
            renderParent
          }

          keyExtractor={
            (item) =>
              item.id
          }

          showsVerticalScrollIndicator={
            false
          }

          contentContainerStyle={
            styles.list
          }

          ListEmptyComponent={

            <View
              style={
                styles.empty
              }
            >

              <Text
                style={
                  styles.emptyTitle
                }
              >
                {search.trim()
                  ? "No matching parents"
                  : "No parents available"}
              </Text>


              <Text
                style={
                  styles.emptyText
                }
              >
                {search.trim()
                  ? "Try another name, phone number, email or student."
                  : "Parent accounts will appear here when students are registered."}
              </Text>

            </View>
          }

        />

      </View>
    );
  };


/* ============================================================
   STYLES
============================================================ */

const useStyles =
  makeStyles(() => {

    return {

      container: {
        flex: 1,

        padding:
          Metrics.x4,
      },


      center: {
        flex: 1,

        alignItems:
          "center",

        justifyContent:
          "center",

        padding:
          Metrics.x4,
      },


      title: {
        fontSize: 28,

        fontWeight:
          "700",
      },


      subtitle: {
        fontSize: 15,

        color:
          Colors.subtext,

        marginTop:
          Metrics.x1,

        marginBottom:
          Metrics.x4,
      },


      search: {
        marginBottom:
          Metrics.x4,
      },


      list: {
        paddingBottom:
          Metrics.x5,
      },


      /* ======================================================
         CARD
      ====================================================== */

      card: {
        padding:
          Metrics.x4,

        marginBottom:
          Metrics.x3,

        borderRadius:
          Metrics.x3,

        backgroundColor:
          Colors.brandPrimaryBg,
      },


      name: {
        fontSize: 17,

        fontWeight:
          "700",
      },


      email: {
        fontSize: 14,

        color:
          Colors.subtext,

        marginTop:
          Metrics.x1,
      },


      detail: {
        fontSize: 13,

        color:
          Colors.subtext,

        marginTop:
          Metrics.x1,
      },


      /* ======================================================
         CHILDREN
      ====================================================== */

      childrenContainer: {
        marginTop:
          Metrics.x3,

        paddingTop:
          Metrics.x2,

        borderTopWidth:
          1,

        borderTopColor:
          "rgba(0,0,0,0.08)",
      },


      childrenLabel: {
        fontSize: 12,

        fontWeight:
          "700",

        color:
          Colors.subtext,

        marginBottom:
          Metrics.x1,
      },


      child: {
        fontSize: 13,

        marginTop:
          Metrics.x1,

        fontWeight:
          "500",
      },


      /* ======================================================
         STATUS
      ====================================================== */

      statusBadge: {
        alignSelf:
          "flex-start",

        marginTop:
          Metrics.x3,

        paddingHorizontal:
          Metrics.x2,

        paddingVertical:
          Metrics.x1,

        borderRadius:
          15,
      },


      activeBadge: {
        backgroundColor:
          Colors.successBg,
      },


      inactiveBadge: {
        backgroundColor:
          Colors.errorBg,
      },


      statusText: {
        color:
          "#FFFFFF",

        fontSize: 10,

        fontWeight:
          "800",
      },


      /* ======================================================
         EMPTY
      ====================================================== */

      empty: {
        alignItems:
          "center",

        paddingTop:
          Metrics.x5,

        paddingHorizontal:
          Metrics.x4,
      },


      emptyTitle: {
        fontSize: 17,

        fontWeight:
          "600",

        textAlign:
          "center",
      },


      emptyText: {
        fontSize: 14,

        color:
          Colors.subtext,

        textAlign:
          "center",

        marginTop:
          Metrics.x2,
      },

    };
  });


export {
  PrincipalParentsScreen,
};