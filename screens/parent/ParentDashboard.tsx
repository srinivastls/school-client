import React from "react";

import {
  ActivityIndicator,
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
  useQuery,
} from "react-query";

import {
  useNavigation,
} from "@react-navigation/native";

import type {
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";

import {
  RootStackParamList,
  RootStackScreenNames,
} from "../../types";

import {
  Colors,
  Metrics,
} from "../../theme";

import {
  parentServices,
} from "../../services/parentServices";


/* ============================================================
   TYPES
============================================================ */

type Parent = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
};

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

type ParentDashboardResponse = {
  parent: Parent;

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
   COMPONENT
============================================================ */

const ParentDashboardScreen = () => {

  const navigation =
    useNavigation<NavigationProp>();


  /* ==========================================================
     GET PARENT DASHBOARD
  ========================================================== */

  const {
    data,
    isLoading,
    isFetching,
    error,
  } = useQuery<ParentDashboardResponse>(
    [
      "parent-dashboard",
    ],
    () =>
      parentServices.getDashboard(),
    {
      staleTime: 30 * 1000,
    }
  );


  /* ==========================================================
     LOADING
  ========================================================== */

  if (isLoading || isFetching) {

    return (
      <View
        style={
          styles.loadingContainer
        }
      >

        <View
          style={
            styles.loadingBrand
          }
        >

          <Avatar.Text
            size={54}
            label="P"
            style={
              styles.loadingLogo
            }
          />

        </View>

        <ActivityIndicator
          size="small"
          color={
            Colors.brandPrimary
          }
          style={
            styles.loadingSpinner
          }
        />

        <Text
          style={
            styles.loadingTitle
          }
        >
          Loading Parent Dashboard
        </Text>

        <Text
          style={
            styles.loadingSubtitle
          }
        >
          Fetching your children's information...
        </Text>

      </View>
    );
  }


  /* ==========================================================
     ERROR
  ========================================================== */

  if (
    error ||
    !data
  ) {

    return (
      <View
        style={
          styles.empty
        }
      >

        <View
          style={
            styles.emptyIconContainer
          }
        >

          <Avatar.Text
            size={58}
            label="!"
            style={
              styles.emptyIcon
            }
          />

        </View>

        <Text
          style={
            styles.emptyTitle
          }
        >
          Unable to load dashboard
        </Text>

        <Text
          style={
            styles.emptyText
          }
        >
          We couldn't load your parent
          dashboard. Please try again.
        </Text>

      </View>
    );
  }


  /* ==========================================================
     DATA
  ========================================================== */

  const parent =
    data.parent;

  const children =
    data.children ?? [];


  /* ==========================================================
     GREETING
  ========================================================== */

  const firstName =
    parent.name?.trim()
      ? parent.name
          .trim()
          .split(" ")[0]
      : "Parent";


  /* ==========================================================
     CHILD CARD
  ========================================================== */

  const renderChild = ({
    item,
  }: {
    item: ParentChild;
  }) => {

    return (
      <TouchableRipple
        style={
          styles.childTouchable
        }
        borderless
        rippleColor={
          Colors.brandPrimaryBg
        }
        onPress={() => {

          /*
           * We will connect this to the
           * Child Dashboard next.
           *
           * Keep the complete child object
           * available so future modules can
           * use the selected child.
           */

          navigation.navigate(
            RootStackScreenNames.ParentChildDetails,
            {
              child: item,
            } as any
          );
        }}
      >

        <Card
          style={
            styles.childCard
          }
        >

          <Card.Content>

            {/* =================================================
                CHILD HEADER
            ================================================= */}

            <View
              style={
                styles.childHeader
              }
            >

              <View
                style={
                  styles.childIdentity
                }
              >

                <Avatar.Text
                  size={52}
                  label={
                    item.name
                      .charAt(0)
                      .toUpperCase()
                  }
                  style={
                    styles.childAvatar
                  }
                />

                <View
                  style={
                    styles.childTitleContainer
                  }
                >

                  <Text
                    style={
                      styles.childName
                    }
                    numberOfLines={1}
                  >
                    {item.name}
                  </Text>

                  <Text
                    style={
                      styles.admissionNo
                    }
                  >
                    Admission No:{" "}
                    {item.admissionNo}
                  </Text>

                </View>

              </View>


              <View
                style={
                  styles.childArrowContainer
                }
              >

                <Text
                  style={
                    styles.childArrow
                  }
                >
                  →
                </Text>

              </View>

            </View>


            {/* =================================================
                CHILD DETAILS
            ================================================= */}

            <View
              style={
                styles.divider
              }
            />


            <View
              style={
                styles.childStatsRow
              }
            >

              <View
                style={
                  styles.childStat
                }
              >

                <Text
                  style={
                    styles.childStatLabel
                  }
                >
                  CLASS
                </Text>

                <Text
                  style={
                    styles.childStatValue
                  }
                >
                  {item.class.displayName}
                </Text>

              </View>


              <View
                style={
                  styles.childStat
                }
              >

                <Text
                  style={
                    styles.childStatLabel
                  }
                >
                  SECTION
                </Text>

                <Text
                  style={
                    styles.childStatValue
                  }
                >
                  {item.section.sectionName}
                </Text>

              </View>


              <View
                style={
                  styles.childStat
                }
              >

                <Text
                  style={
                    styles.childStatLabel
                  }
                >
                  RELATIONSHIP
                </Text>

                <Text
                  style={
                    styles.childStatValue
                  }
                >
                  {formatRelationship(
                    item.relationship
                  )}
                </Text>

              </View>

            </View>


            {/* =================================================
                STATUS
            ================================================= */}

            <View
              style={
                styles.childFooter
              }
            >

              <View
                style={[
                  styles.statusBadge,
                  getStatusStyle(
                    item.status
                  ),
                ]}
              >

                <View
                  style={[
                    styles.statusDot,
                    getStatusDotStyle(
                      item.status
                    ),
                  ]}
                />

                <Text
                  style={[
                    styles.statusText,
                    getStatusTextStyle(
                      item.status
                    ),
                  ]}
                >
                  {item.status}
                </Text>

              </View>


              <Text
                style={
                  styles.viewChildText
                }
              >
                View Child →
              </Text>

            </View>

          </Card.Content>

        </Card>

      </TouchableRipple>
    );
  };


  /* ==========================================================
     EMPTY CHILDREN
  ========================================================== */

  const renderEmptyChildren = () => {

    return (
      <View
        style={
          styles.emptyChildren
        }
      >

        <View
          style={
            styles.emptyIconContainer
          }
        >

          <Avatar.Text
            size={54}
            label="?"
            style={
              styles.emptyIcon
            }
          />

        </View>

        <Text
          style={
            styles.emptyTitle
          }
        >
          No children linked
        </Text>

        <Text
          style={
            styles.emptyText
          }
        >
          No student accounts are currently
          linked to your parent account.
        </Text>

      </View>
    );
  };


  /* ==========================================================
     UI
  ========================================================== */

  return (
    <View
      style={
        styles.page
      }
    >

      <FlatList
        data={children}
        renderItem={renderChild}
        keyExtractor={(item) =>
          item.id
        }
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
                styles.parentHeader
              }
            >

              <View
                style={
                  styles.parentBrand
                }
              >

                <Avatar.Text
                  size={46}
                  label={
                    firstName
                      .charAt(0)
                      .toUpperCase()
                  }
                  style={
                    styles.parentAvatar
                  }
                />

                <View
                  style={
                    styles.parentBrandText
                  }
                >

                  <Text
                    style={
                      styles.parentName
                    }
                    numberOfLines={1}
                  >
                    {parent.name ||
                      "Parent"}
                  </Text>

                  <Text
                    style={
                      styles.parentSubtitle
                    }
                  >
                    Parent Portal
                  </Text>

                </View>

              </View>

            </View>


            {/* =================================================
                DASHBOARD HEADING
            ================================================= */}

            <View
              style={
                styles.dashboardHeading
              }
            >

              <Text
                style={
                  styles.greeting
                }
              >
                Welcome back, {firstName}
              </Text>

              <Text
                style={
                  styles.pageTitle
                }
              >
                Parent Dashboard
              </Text>

              <Text
                style={
                  styles.pageSubtitle
                }
              >
                Stay updated with your
                children's academic journey,
                attendance and school
                information.
              </Text>

            </View>


            {/* =================================================
                CHILDREN SUMMARY
                SHOW ONLY WHEN MORE THAN ONE CHILD
            ================================================= */}

            {children.length > 1 && (
              <>

                <View
                  style={
                    styles.childrenHero
                  }
                >

                  <View
                    style={
                      styles.childrenHeroRow
                    }
                  >

                    <View
                      style={
                        styles.childrenHeroText
                      }
                    >

                      <Text
                        style={
                          styles.childrenEyebrow
                        }
                      >
                        YOUR CHILDREN
                      </Text>

                      <Text
                        style={
                          styles.childrenHeroTitle
                        }
                      >
                        Students linked to you
                      </Text>

                      <Text
                        style={
                          styles.childrenHeroValue
                        }
                      >
                        {children.length}
                      </Text>

                      <Text
                        style={
                          styles.childrenHeroSubtitle
                        }
                      >
                        {children.length} children connected
                      </Text>

                    </View>


                    <View
                      style={
                        styles.childrenHeroIconContainer
                      }
                    >

                      <Avatar.Text
                        size={64}
                        label="ST"
                        style={
                          styles.childrenHeroIcon
                        }
                      />

                    </View>

                  </View>

                </View>


                {/* =================================================
                    SECTION HEADING
                ================================================= */}

                <View
                  style={
                    styles.sectionHeading
                  }
                >

                  <Text
                    style={
                      styles.sectionMainTitle
                    }
                  >
                    My Children
                  </Text>

                  <Text
                    style={
                      styles.sectionSubtitle
                    }
                  >
                    Select a child to view
                    their information
                  </Text>

                </View>

              </>
            )}

          </>
        }


        ListEmptyComponent={renderEmptyChildren()}

ListFooterComponent={
  children.length > 1 ? (
    <View style={styles.footer}>
      <Text style={styles.footerText}>
        Select a child to continue
      </Text>
    </View>
  ) : null
}
      />

    </View>
  );
};


/* ============================================================
   HELPERS
============================================================ */

const formatRelationship = (
  relationship: ParentChild["relationship"]
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


const getStatusStyle = (
  status?: string
) => {

  switch (
    status?.toUpperCase()
  ) {

    case "ACTIVE":
      return styles.activeBadge;

    case "TRANSFERRED":
    case "GRADUATED":
      return styles.warningBadge;

    default:
      return styles.inactiveBadge;
  }
};


const getStatusDotStyle = (
  status?: string
) => {

  switch (
    status?.toUpperCase()
  ) {

    case "ACTIVE":
      return styles.activeDot;

    case "TRANSFERRED":
    case "GRADUATED":
      return styles.warningDot;

    default:
      return styles.inactiveDot;
  }
};


const getStatusTextStyle = (
  status?: string
) => {

  switch (
    status?.toUpperCase()
  ) {

    case "ACTIVE":
      return styles.activeBadgeText;

    case "TRANSFERRED":
    case "GRADUATED":
      return styles.warningBadgeText;

    default:
      return styles.inactiveBadgeText;
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
       PARENT HEADER
    ======================================================== */

    parentHeader: {
      minHeight: 72,
      paddingHorizontal:
        Metrics.x3,
      paddingVertical:
        Metrics.x2,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#E9EAF0",
      borderRadius: 16,
      marginBottom:
        Metrics.x4,
      elevation: 1,
    },

    parentBrand: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
      minWidth: 0,
    },

    parentAvatar: {
      backgroundColor:
        Colors.brandPrimary,
    },

    parentBrandText: {
      flex: 1,
      minWidth: 0,
      marginLeft:
        Metrics.x2,
    },

    parentName: {
      fontSize: 16,
      fontWeight: "800",
      color: "#171717",
    },

    parentSubtitle: {
      marginTop: 2,
      fontSize: 11,
      color:
        Colors.subtext,
    },


    /* ========================================================
       DASHBOARD HEADING
    ======================================================== */

    dashboardHeading: {
      paddingTop:
        Metrics.x1,
      paddingBottom:
        Metrics.x4,
    },

    greeting: {
      fontSize: 14,
      fontWeight: "700",
      color:
        Colors.brandPrimary,
      marginBottom:
        Metrics.x1,
    },

    pageTitle: {
      fontSize: 28,
      lineHeight: 34,
      fontWeight: "800",
      color: "#171717",
    },

    pageSubtitle: {
      marginTop:
        Metrics.x1,
      fontSize: 14,
      lineHeight: 21,
      color:
        Colors.subtext,
      maxWidth: 650,
    },


    /* ========================================================
       CHILDREN HERO
    ======================================================== */

    childrenHero: {
      marginTop:
        Metrics.x2,
      marginBottom:
        Metrics.x5,
      borderRadius: 18,
      backgroundColor:
        Colors.brandPrimary,
      elevation: 3,
      overflow: "hidden",
    },

    childrenHeroRow: {
      minHeight: 170,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
      paddingHorizontal:
        Metrics.x4,
    },

    childrenHeroText: {
      flex: 1,
    },

    childrenEyebrow: {
      fontSize: 10,
      fontWeight: "900",
      letterSpacing: 1.2,
      color:
        "rgba(255,255,255,0.72)",
    },

    childrenHeroTitle: {
      marginTop:
        Metrics.x1,
      fontSize: 17,
      fontWeight: "700",
      color: "#FFFFFF",
    },

    childrenHeroValue: {
      marginTop:
        Metrics.x1,
      fontSize: 39,
      lineHeight: 44,
      fontWeight: "900",
      color: "#FFFFFF",
    },

    childrenHeroSubtitle: {
      marginTop:
        Metrics.x1,
      fontSize: 12,
      color:
        "rgba(255,255,255,0.78)",
    },

    childrenHeroIconContainer: {
      marginLeft:
        Metrics.x3,
      padding:
        Metrics.x3,
      borderRadius: 40,
      backgroundColor:
        "rgba(255,255,255,0.12)",
    },

    childrenHeroIcon: {
      backgroundColor:
        "rgba(255,255,255,0.16)",
    },


    /* ========================================================
       SECTION HEADING
    ======================================================== */

    sectionHeading: {
      marginTop:
        Metrics.x2,
      marginBottom:
        Metrics.x3,
    },

    sectionMainTitle: {
      fontSize: 19,
      lineHeight: 24,
      fontWeight: "800",
      color: "#171717",
    },

    sectionSubtitle: {
      fontSize: 12,
      color:
        Colors.subtext,
      marginTop: 3,
    },


    /* ========================================================
       CHILD CARD
    ======================================================== */

    childTouchable: {
      width: "100%",
      marginBottom:
        Metrics.x3,
      borderRadius: 16,
      overflow: "hidden",
    },

    childCard: {
      borderRadius: 16,
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#E9EBF0",
      elevation: 1,
    },

    childHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
    },

    childIdentity: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
      minWidth: 0,
    },

    childAvatar: {
      backgroundColor:
        Colors.brandPrimary,
    },

    childTitleContainer: {
      flex: 1,
      minWidth: 0,
      marginLeft:
        Metrics.x3,
    },

    childName: {
      fontSize: 17,
      fontWeight: "800",
      color: "#171717",
    },

    admissionNo: {
      marginTop: 3,
      fontSize: 11,
      color:
        Colors.subtext,
      fontWeight: "700",
    },

    childArrowContainer: {
      marginLeft:
        Metrics.x2,
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: "center",
      justifyContent:
        "center",
      backgroundColor:
        Colors.brandPrimaryBg,
    },

    childArrow: {
      fontSize: 20,
      fontWeight: "800",
      color:
        Colors.brandPrimary,
    },


    /* ========================================================
       DIVIDER
    ======================================================== */

    divider: {
      marginVertical:
        Metrics.x3,
      height: 1,
      backgroundColor:
        "#ECEEF2",
    },


    /* ========================================================
       CHILD STATS
    ======================================================== */

    childStatsRow: {
      flexDirection: "row",
      justifyContent:
        "space-between",
    },

    childStat: {
      flex: 1,
      minWidth: 0,
      marginRight:
        Metrics.x2,
    },

    childStatLabel: {
      fontSize: 9,
      fontWeight: "800",
      letterSpacing: 0.6,
      color:
        Colors.subtext,
    },

    childStatValue: {
      marginTop: 4,
      fontSize: 14,
      fontWeight: "800",
      color: "#171717",
    },


    /* ========================================================
       CHILD FOOTER
    ======================================================== */

    childFooter: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
      marginTop:
        Metrics.x4,
      paddingTop:
        Metrics.x3,
      borderTopWidth: 1,
      borderTopColor:
        "#F0F1F4",
    },

    statusBadge: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal:
        Metrics.x2,
      paddingVertical:
        Metrics.x1,
      borderRadius: 20,
    },

    statusDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      marginRight: 5,
    },

    statusText: {
      fontSize: 9,
      fontWeight: "900",
      letterSpacing: 0.3,
    },

    activeBadge: {
      backgroundColor:
        "#E9F8EF",
    },

    activeDot: {
      backgroundColor:
        "#16834B",
    },

    activeBadgeText: {
      color: "#16834B",
    },

    warningBadge: {
      backgroundColor:
        "#FFF5DC",
    },

    warningDot: {
      backgroundColor:
        "#A86D12",
    },

    warningBadgeText: {
      color: "#A86D12",
    },

    inactiveBadge: {
      backgroundColor:
        "#FFF0F0",
    },

    inactiveDot: {
      backgroundColor:
        "#C93C3C",
    },

    inactiveBadgeText: {
      color: "#C93C3C",
    },

    viewChildText: {
      fontSize: 11,
      fontWeight: "800",
      color:
        Colors.brandPrimary,
    },


    /* ========================================================
       EMPTY CHILDREN
    ======================================================== */

    emptyChildren: {
      alignItems: "center",
      paddingVertical:
        Metrics.x8,
      paddingHorizontal:
        Metrics.x4,
    },

    empty: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical:
        Metrics.x8,
      paddingHorizontal:
        Metrics.x4,
    },

    emptyIconContainer: {
      padding:
        Metrics.x2,
      borderRadius: 42,
      backgroundColor:
        Colors.brandPrimaryBg,
    },

    emptyIcon: {
      backgroundColor:
        Colors.brandPrimaryBg,
    },

    emptyTitle: {
      fontSize: 18,
      fontWeight: "800",
      marginTop:
        Metrics.x3,
      color: "#171717",
    },

    emptyText: {
      color:
        Colors.subtext,
      marginTop:
        Metrics.x1,
      textAlign: "center",
      maxWidth: 340,
      fontSize: 12,
      lineHeight: 18,
    },


    /* ========================================================
       FOOTER
    ======================================================== */

    footer: {
      alignItems: "center",
      paddingTop:
        Metrics.x3,
      paddingBottom:
        Metrics.x4,
    },

    footerText: {
      fontSize: 11,
      color:
        Colors.subtext,
    },


    /* ========================================================
       LOADING
    ======================================================== */

    loadingContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal:
        Metrics.x4,
      backgroundColor:
        "#F7F8FC",
    },

    loadingBrand: {
      padding:
        Metrics.x2,
      borderRadius: 40,
      backgroundColor:
        Colors.brandPrimaryBg,
    },

    loadingLogo: {
      backgroundColor:
        Colors.brandPrimary,
    },

    loadingSpinner: {
      marginTop:
        Metrics.x4,
    },

    loadingTitle: {
      marginTop:
        Metrics.x3,
      fontSize: 17,
      fontWeight: "800",
      color: "#171717",
    },

    loadingSubtitle: {
      marginTop:
        Metrics.x1,
      fontSize: 12,
      color:
        Colors.subtext,
      textAlign: "center",
    },

  });


export {
  ParentDashboardScreen,
};