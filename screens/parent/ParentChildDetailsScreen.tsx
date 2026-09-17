import React from "react";

import {
  FlatList,
  StyleSheet,
  View,
} from "react-native";

import {
  Avatar,
  Card,
  Text,
  TouchableRipple,
} from "react-native-paper";

import {
  useRoute,
  useNavigation,
} from "@react-navigation/native";

import type {
  RouteProp,
} from "@react-navigation/native";

import type {
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";

import {
  Colors,
  Metrics,
} from "../../theme";


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


type ParentChildDetailsParams = {
  child: ParentChild;
};


/* ============================================================
   NAVIGATION
============================================================ */

type RootStackParamList = {
  ParentChildDetails: ParentChildDetailsParams;
};


type NavigationProp =
  NativeStackNavigationProp<
    RootStackParamList
  >;


type RouteType =
  RouteProp<
    RootStackParamList,
    "ParentChildDetails"
  >;


/* ============================================================
   COMPONENT
============================================================ */

const ParentChildDetailsScreen =
  () => {

    const navigation =
      useNavigation<NavigationProp>();

    const route =
      useRoute<RouteType>();


    const child =
      route.params?.child;


    /* ========================================================
       SAFETY
    ======================================================== */

    if (!child) {

      return (
        <View
          style={
            styles.empty
          }
        >

          <Avatar.Text
            size={58}
            label="!"
            style={
              styles.emptyIcon
            }
          />

          <Text
            style={
              styles.emptyTitle
            }
          >
            Child information unavailable
          </Text>

          <Text
            style={
              styles.emptyText
            }
          >
            We couldn't load the selected
            student's information.
          </Text>

        </View>
      );
    }


    /* ========================================================
       INITIAL
    ======================================================== */

    const initial =
      child.name
        ?.charAt(0)
        ?.toUpperCase() || "S";


    /* ========================================================
       UI
    ======================================================== */

    return (
      <View
        style={
          styles.page
        }
      >

        <FlatList
          data={[]}
          renderItem={null}
          showsVerticalScrollIndicator={
            false
          }

          contentContainerStyle={
            styles.listContent
          }

          ListHeaderComponent={

            <>

              {/* =================================================
                  HEADER
              ================================================= */}

              <View
                style={
                  styles.header
                }
              >

                <TouchableRipple
                  onPress={() =>
                    navigation.goBack()
                  }
                  borderless
                  style={
                    styles.backButton
                  }
                >

                  <Text
                    style={
                      styles.backArrow
                    }
                  >
                    ←
                  </Text>

                </TouchableRipple>


                <View
                  style={
                    styles.headerTitleContainer
                  }
                >

                  <Text
                    style={
                      styles.headerTitle
                    }
                  >
                    Child Dashboard
                  </Text>

                  <Text
                    style={
                      styles.headerSubtitle
                    }
                  >
                    Student information
                  </Text>

                </View>

              </View>


              {/* =================================================
                  STUDENT HERO
              ================================================= */}

              <View
                style={
                  styles.studentHero
                }
              >

                <View
                  style={
                    styles.studentHeroRow
                  }
                >

                  <View
                    style={
                      styles.studentHeroText
                    }
                  >

                    <Text
                      style={
                        styles.studentEyebrow
                      }
                    >
                      STUDENT
                    </Text>

                    <Text
                      style={
                        styles.studentName
                      }
                      numberOfLines={1}
                    >
                      {child.name}
                    </Text>

                    <Text
                      style={
                        styles.studentAdmission
                      }
                    >
                      Admission No:{" "}
                      {child.admissionNo}
                    </Text>

                    <View
                      style={
                        styles.classBadge
                      }
                    >

                      <Text
                        style={
                          styles.classBadgeText
                        }
                      >
                        Class{" "}
                        {child.class.displayName}
                        {"  •  "}
                        Section{" "}
                        {child.section.sectionName}
                      </Text>

                    </View>

                  </View>


                  <View
                    style={
                      styles.studentAvatarContainer
                    }
                  >

                    <Avatar.Text
                      size={76}
                      label={initial}
                      style={
                        styles.studentAvatar
                      }
                    />

                  </View>

                </View>

              </View>


              {/* =================================================
                  BASIC INFORMATION
              ================================================= */}

              <View
                style={
                  styles.sectionHeading
                }
              >

                <Text
                  style={
                    styles.sectionTitle
                  }
                >
                  Student Information
                </Text>

                <Text
                  style={
                    styles.sectionSubtitle
                  }
                >
                  Basic details of your child
                </Text>

              </View>


              <Card
                style={
                  styles.infoCard
                }
              >

                <Card.Content>

                  <InfoRow
                    label="Student Name"
                    value={
                      child.name
                    }
                  />

                  <InfoRow
                    label="Admission Number"
                    value={
                      child.admissionNo
                    }
                  />

                  <InfoRow
                    label="Class"
                    value={
                      child.class.displayName
                    }
                  />

                  <InfoRow
                    label="Section"
                    value={
                      child.section.sectionName
                    }
                  />

                  <InfoRow
                    label="Relationship"
                    value={
                      formatRelationship(
                        child.relationship
                      )
                    }
                  />

                  <InfoRow
                    label="Status"
                    value={
                      child.status
                    }
                    last
                  />

                </Card.Content>

              </Card>


              {/* =================================================
                  QUICK ACTIONS
              ================================================= */}

              <View
                style={
                  styles.sectionHeading
                }
              >

                <Text
                  style={
                    styles.sectionTitle
                }
                >
                  Quick Access
                </Text>

                <Text
                  style={
                    styles.sectionSubtitle
                  }
                >
                  More student information
                  will appear here
                </Text>

              </View>


              <View
                style={
                  styles.quickGrid
                }
              >

                <QuickAction
                  icon="A"
                  title="Attendance"
                  subtitle="Coming soon"
                />

                <QuickAction
                  icon="₹"
                  title="Fees"
                  subtitle="Coming soon"
                />

                <QuickAction
                  icon="M"
                  title="Marks"
                  subtitle="Coming soon"
                />

                <QuickAction
                  icon="H"
                  title="Homework"
                  subtitle="Coming soon"
                />

              </View>


              {/* =================================================
                  CURRENT STATUS
              ================================================= */}

              <View
                style={
                  styles.statusCard
                }
              >

                <View
                  style={
                    styles.statusIconContainer
                  }
                >

                  <Text
                    style={
                      styles.statusIcon
                    }
                  >
                    ✓
                  </Text>

                </View>

                <View
                  style={
                    styles.statusTextContainer
                  }
                >

                  <Text
                    style={
                      styles.statusTitle
                    }
                  >
                    Student Account
                  </Text>

                  <Text
                    style={
                      styles.statusSubtitle
                    }
                  >
                    {child.name}'s school
                    account is currently{" "}
                    {child.status
                      ?.toLowerCase()}
                    .
                  </Text>

                </View>

              </View>

            </>
          }
        />

      </View>
    );
  };


/* ============================================================
   INFO ROW
============================================================ */

const InfoRow = ({
  label,
  value,
  last = false,
}: {
  label: string;
  value: string;
  last?: boolean;
}) => {

  return (
    <View
      style={[
        styles.infoRow,
        !last &&
          styles.infoRowBorder,
      ]}
    >

      <Text
        style={
          styles.infoLabel
        }
      >
        {label}
      </Text>

      <Text
        style={
          styles.infoValue
        }
        numberOfLines={1}
      >
        {value}
      </Text>

    </View>
  );
};


/* ============================================================
   QUICK ACTION
============================================================ */

const QuickAction = ({
  icon,
  title,
  subtitle,
}: {
  icon: string;
  title: string;
  subtitle: string;
}) => {

  return (
    <TouchableRipple
      style={
        styles.quickActionTouchable
      }
      borderless
    >

      <Card
        style={
          styles.quickActionCard
        }
      >

        <Card.Content>

          <Avatar.Text
            size={42}
            label={icon}
            style={
              styles.quickActionIcon
            }
          />

          <Text
            style={
              styles.quickActionTitle
            }
          >
            {title}
          </Text>

          <Text
            style={
              styles.quickActionSubtitle
            }
          >
            {subtitle}
          </Text>

        </Card.Content>

      </Card>

    </TouchableRipple>
  );
};


/* ============================================================
   RELATIONSHIP
============================================================ */

const formatRelationship = (
  relationship:
    | "FATHER"
    | "MOTHER"
    | "GUARDIAN"
) => {

  switch (
    relationship
  ) {

    case "FATHER":
      return "Father";

    case "MOTHER":
      return "Mother";

    case "GUARDIAN":
      return "Guardian";

    default:
      return "Parent";
  }
};


/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({

    /* ========================================================
       PAGE
    ======================================================== */

    page: {
      flex: 1,
      backgroundColor:
        "#F7F8FC",
    },

    listContent: {
      paddingTop: 45,
      paddingHorizontal:
        Metrics.x4,
      paddingBottom:
        Metrics.x8,
    },


    /* ========================================================
       HEADER
    ======================================================== */

    header: {
      minHeight: 64,
      flexDirection: "row",
      alignItems: "center",
      marginBottom:
        Metrics.x4,
    },

    backButton: {
      width: 42,
      height: 42,
      borderRadius: 21,
      alignItems: "center",
      justifyContent:
        "center",
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#E9EAF0",
    },

    backArrow: {
      fontSize: 22,
      fontWeight: "700",
      color: "#171717",
    },

    headerTitleContainer: {
      flex: 1,
      marginLeft:
        Metrics.x3,
    },

    headerTitle: {
      fontSize: 19,
      fontWeight: "800",
      color: "#171717",
    },

    headerSubtitle: {
      marginTop: 2,
      fontSize: 11,
      color:
        Colors.subtext,
    },


    /* ========================================================
       STUDENT HERO
    ======================================================== */

    studentHero: {
      marginBottom:
        Metrics.x5,
      borderRadius: 18,
      backgroundColor:
        Colors.brandPrimary,
      elevation: 3,
      overflow: "hidden",
    },

    studentHeroRow: {
      minHeight: 190,
      paddingHorizontal:
        Metrics.x4,
      paddingVertical:
        Metrics.x4,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
    },

    studentHeroText: {
      flex: 1,
      minWidth: 0,
    },

    studentEyebrow: {
      fontSize: 10,
      fontWeight: "900",
      letterSpacing: 1.2,
      color:
        "rgba(255,255,255,0.72)",
    },

    studentName: {
      marginTop:
        Metrics.x1,
      fontSize: 26,
      lineHeight: 32,
      fontWeight: "900",
      color: "#FFFFFF",
    },

    studentAdmission: {
      marginTop:
        Metrics.x1,
      fontSize: 12,
      color:
        "rgba(255,255,255,0.78)",
    },

    classBadge: {
      alignSelf: "flex-start",
      marginTop:
        Metrics.x3,
      paddingHorizontal:
        Metrics.x2,
      paddingVertical:
        Metrics.x1,
      borderRadius: 20,
      backgroundColor:
        "rgba(255,255,255,0.14)",
    },

    classBadgeText: {
      fontSize: 10,
      fontWeight: "800",
      color: "#FFFFFF",
    },

    studentAvatarContainer: {
      marginLeft:
        Metrics.x3,
      padding:
        Metrics.x2,
      borderRadius: 50,
      backgroundColor:
        "rgba(255,255,255,0.12)",
    },

    studentAvatar: {
      backgroundColor:
        "rgba(255,255,255,0.18)",
    },


    /* ========================================================
       SECTION
    ======================================================== */

    sectionHeading: {
      marginTop:
        Metrics.x2,
      marginBottom:
        Metrics.x3,
    },

    sectionTitle: {
      fontSize: 19,
      lineHeight: 24,
      fontWeight: "800",
      color: "#171717",
    },

    sectionSubtitle: {
      marginTop: 3,
      fontSize: 12,
      color:
        Colors.subtext,
    },


    /* ========================================================
       INFORMATION CARD
    ======================================================== */

    infoCard: {
      borderRadius: 16,
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#E9EBF0",
      elevation: 1,
    },

    infoRow: {
      minHeight: 54,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
    },

    infoRowBorder: {
      borderBottomWidth: 1,
      borderBottomColor:
        "#F0F1F4",
    },

    infoLabel: {
      fontSize: 11,
      fontWeight: "700",
      color:
        Colors.subtext,
    },

    infoValue: {
      maxWidth: "55%",
      fontSize: 13,
      fontWeight: "800",
      color: "#171717",
      textAlign: "right",
    },


    /* ========================================================
       QUICK ACTIONS
    ======================================================== */

    quickGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent:
        "space-between",
    },

    quickActionTouchable: {
      width: "48.5%",
      marginBottom:
        Metrics.x3,
      borderRadius: 14,
      overflow: "hidden",
    },

    quickActionCard: {
      borderRadius: 14,
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#E9EBF0",
      elevation: 1,
    },

    quickActionIcon: {
      backgroundColor:
        Colors.brandPrimaryBg,
    },

    quickActionTitle: {
      marginTop:
        Metrics.x2,
      fontSize: 14,
      fontWeight: "800",
      color: "#171717",
    },

    quickActionSubtitle: {
      marginTop: 3,
      fontSize: 10,
      color:
        Colors.subtext,
    },


    /* ========================================================
       STATUS
    ======================================================== */

    statusCard: {
      marginTop:
        Metrics.x2,
      padding:
        Metrics.x3,
      borderRadius: 16,
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#E9EBF0",
      flexDirection: "row",
      alignItems: "center",
      elevation: 1,
    },

    statusIconContainer: {
      width: 42,
      height: 42,
      borderRadius: 21,
      alignItems: "center",
      justifyContent:
        "center",
      backgroundColor:
        "#E9F8EF",
    },

    statusIcon: {
      fontSize: 20,
      fontWeight: "900",
      color: "#16834B",
    },

    statusTextContainer: {
      flex: 1,
      marginLeft:
        Metrics.x2,
    },

    statusTitle: {
      fontSize: 13,
      fontWeight: "800",
      color: "#171717",
    },

    statusSubtitle: {
      marginTop: 3,
      fontSize: 11,
      lineHeight: 17,
      color:
        Colors.subtext,
    },


    /* ========================================================
       EMPTY
    ======================================================== */

    empty: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal:
        Metrics.x4,
      backgroundColor:
        "#F7F8FC",
    },

    emptyIcon: {
      backgroundColor:
        Colors.brandPrimaryBg,
    },

    emptyTitle: {
      marginTop:
        Metrics.x3,
      fontSize: 18,
      fontWeight: "800",
      color: "#171717",
    },

    emptyText: {
      marginTop:
        Metrics.x1,
      textAlign: "center",
      maxWidth: 340,
      fontSize: 12,
      lineHeight: 18,
      color:
        Colors.subtext,
    },

  });


export {
  ParentChildDetailsScreen,
};