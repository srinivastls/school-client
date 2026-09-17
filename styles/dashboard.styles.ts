import { StyleSheet } from "react-native";
import { Colors } from "../theme/colors";
import { Metrics } from "../theme/metrics";

const dashboardStyles =
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
      paddingTop:45,

      paddingBottom:
        Metrics.x8,
    },


    /* ========================================================
       PLATFORM HEADER
    ======================================================== */

    platformHeader: {
      display: "none",
      minHeight: 72,

      paddingHorizontal:
        Metrics.x3,

      paddingVertical:
        Metrics.x2,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      backgroundColor:
        "#FFFFFF",

      borderWidth:
        1,

      borderColor:
        "#E9EAF0",

      borderRadius:
        16,

      marginBottom:
        Metrics.x4,

      elevation: 1,
    },


    platformBrand: {
      flexDirection:
        "row",

      alignItems:
        "center",

      flex: 1,

      minWidth: 0,
    },


    platformLogo: {
      backgroundColor:
        Colors.brandPrimary,

      marginRight:
        Metrics.x2,
    },


    platformBrandText: {
      flex: 1,

      minWidth: 0,
    },


    platformName: {
      fontSize: 16,

      fontWeight:
        "800",

      color:
        "#171717",
    },


    platformSubtitle: {
      marginTop: 2,

      fontSize: 11,

      color:
        Colors.subtext,
    },


    platformActions: {
      flexDirection:
        "row",

      alignItems:
        "center",

      marginLeft:
        Metrics.x2,
    },


    refreshButton: {
      margin: 0,

      marginRight:
        Metrics.x1,
    },


    profileButton: {
      flexDirection:
        "row",

      alignItems:
        "center",

      paddingVertical:
        Metrics.x1,

      paddingHorizontal:
        Metrics.x1,

      borderRadius:
        24,
    },


    profileAvatar: {
      backgroundColor:
        Colors.brandPrimary,
    },


    profileDetails: {
      marginLeft:
        Metrics.x2,

      width: 140,

      minWidth: 0,
    },


    profileName: {
      fontSize: 13,

      fontWeight:
        "700",

      color:
        "#171717",
    },


    profileRole: {
      marginTop: 1,

      fontSize: 10,

      color:
        Colors.subtext,
    },


    profileArrow: {
      marginLeft:
        Metrics.x1,

      fontSize: 17,

      fontWeight:
        "700",

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


    greetingContainer: {
      flex: 1,
    },


    greeting: {
      fontSize: 14,

      fontWeight:
        "700",

      color:
        Colors.brandPrimary,

      marginBottom:
        Metrics.x1,
    },


    pageTitle: {
      fontSize: 28,

      lineHeight: 34,

      fontWeight:
        "800",

      color:
        "#171717",
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


    quickActions: {
      marginTop:
        Metrics.x3,

      alignSelf:
        "flex-start",
    },

    addSchoolButtonContent: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
},

addSchoolPlus: {
  fontSize: 20,
  fontWeight: "500",
  lineHeight: 20,
  marginRight: 8,
},

addSchoolText: {
  fontSize: 13,
  fontWeight: "800",
},


    primaryAction: {
  borderRadius: 12,
},

primaryActionContent: {
  minHeight: 42,
  paddingHorizontal: 14,
},

primaryActionLabel: {
  margin: 0,
  padding: 0,
},


    /* ========================================================
       SECTION HEADINGS
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

      fontWeight:
        "800",

      color:
        "#171717",
    },


    sectionSubtitle: {
      fontSize: 12,

      color:
        Colors.subtext,

      marginTop:
        3,
    },


    /* ========================================================
       GRID
    ======================================================== */

    grid: {
      flexDirection:
        "row",

      flexWrap:
        "wrap",

      justifyContent:
        "space-between",

      marginBottom:
        Metrics.x3,
    },


    /* ========================================================
       STAT CARD
    ======================================================== */

    statCard: {
      marginBottom:
        Metrics.x3,

      borderRadius:
        14,

      backgroundColor:
        "#FFFFFF",

      borderWidth:
        1,

      borderColor:
        "#ECEEF3",

      elevation: 1,
    },


    statCardTop: {
      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",
    },


    statIcon: {
      elevation: 0,
    },


    statTrend: {
      paddingHorizontal:
        Metrics.x1,

      paddingVertical:
        4,

      borderRadius:
        8,

      backgroundColor:
        "#EEF8F2",
    },


    statTrendText: {
      fontSize: 9,

      fontWeight:
        "800",

      color:
        "#16834B",
    },


    statValue: {
      fontSize: 27,

      lineHeight: 32,

      fontWeight:
        "800",

      marginTop:
        Metrics.x3,

      color:
        "#171717",
    },


    statTitle: {
      marginTop:
        3,

      fontSize: 12,

      color:
        Colors.subtext,

      fontWeight:
        "600",
    },


    /* ========================================================
       STUDENTS HERO
    ======================================================== */

    studentsHero: {
      marginTop:
        Metrics.x2,

      marginBottom:
        Metrics.x5,

      borderRadius:
        18,

      backgroundColor:
        Colors.brandPrimary,

      elevation: 3,

      overflow: "hidden",
    },


    studentsHeroRow: {
      minHeight: 170,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",
    },


    studentsHeroText: {
      flex: 1,
    },


    studentsEyebrow: {
      fontSize: 10,

      fontWeight:
        "900",

      letterSpacing:
        1.2,

      color:
        "rgba(255,255,255,0.72)",
    },


    studentsHeroTitle: {
      marginTop:
        Metrics.x1,

      fontSize: 17,

      fontWeight:
        "700",

      color:
        "#FFFFFF",
    },


    studentsHeroValue: {
      marginTop:
        Metrics.x1,

      fontSize: 39,

      lineHeight: 44,

      fontWeight:
        "900",

      color:
        "#FFFFFF",
    },


    studentsHeroSubtitle: {
      marginTop:
        Metrics.x1,

      fontSize: 12,

      color:
        "rgba(255,255,255,0.78)",
    },


    studentsHeroIconContainer: {
      marginLeft:
        Metrics.x3,

      padding:
        Metrics.x3,

      borderRadius:
        40,

      backgroundColor:
        "rgba(255,255,255,0.12)",
    },


    studentsHeroIcon: {
      backgroundColor:
        "rgba(255,255,255,0.16)",
    },


    /* ========================================================
       ATTENTION
    ======================================================== */

    attentionSection: {
      marginBottom:
        Metrics.x5,

      paddingVertical:
        Metrics.x3,

      backgroundColor:
        "#FFF9F1",

      borderWidth:
        1,

      borderColor:
        "#F6E6C8",

      borderRadius:
        16,
    },


    attentionHeader: {
      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      paddingHorizontal:
        Metrics.x3,

      marginBottom:
        Metrics.x3,
    },


    attentionTitleContainer: {
      flexDirection:
        "row",

      alignItems:
        "center",
    },


    primaryNavigation: {
      flexDirection:
        "row",

      alignItems:
        "center",

      marginRight:
        Metrics.x2,
    },


    navigationItem: {
      minHeight:
        38,

      flexDirection:
        "row",

      alignItems:
        "center",

      paddingHorizontal:
        Metrics.x1,

      borderRadius:
        10,
    },


    navigationIcon: {
      margin:
        0,
    },


    navigationLabel: {
      marginRight:
        Metrics.x1,

      fontSize:
        12,

      fontWeight:
        "700",

      color:
        Colors.subtext,
    },


    attentionIcon: {
      width: 36,

      height: 36,

      borderRadius: 18,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        "#FDE9C8",

      marginRight:
        Metrics.x2,
    },


    attentionIconText: {
      fontSize: 17,

      fontWeight:
        "900",

      color:
        "#B7791F",
    },


    attentionTitle: {
      fontSize: 15,

      fontWeight:
        "800",

      color:
        "#292929",
    },


    attentionSubtitle: {
      marginTop: 2,

      fontSize: 11,

      color:
        "#806B4D",
    },


    attentionCount: {
      minWidth: 30,

      height: 30,

      borderRadius: 15,

      textAlign:
        "center",

      textAlignVertical:
        "center",

      paddingTop: 5,

      fontSize: 12,

      fontWeight:
        "900",

      color:
        "#B7791F",

      backgroundColor:
        "#FDE9C8",
    },


    attentionList: {
      paddingHorizontal:
        Metrics.x3,
    },


    attentionCard: {
      width: 190,

      padding:
        Metrics.x3,

      marginRight:
        Metrics.x2,

      borderRadius:
        14,

      backgroundColor:
        "#FFFFFF",

      borderWidth:
        1,

      borderColor:
        "#F1E3CC",

      elevation: 1,
    },


    attentionCardTop: {
      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      marginBottom:
        Metrics.x2,
    },


    attentionSchoolIcon: {
      backgroundColor:
        "#FFF0D7",
    },


    attentionArrow: {
      fontSize: 18,

      color:
        Colors.subtext,
    },


    attentionSchoolName: {
      fontSize: 13,

      fontWeight:
        "800",

      color:
        "#222222",
    },


    attentionReason: {
      marginTop:
        5,

      fontSize: 11,

      fontWeight:
        "600",

      color:
        "#B7791F",
    },

    modalOverlay: {
          flex: 1,
    
          backgroundColor:
            "rgba(0, 0, 0, 0.10)",
    
          alignItems:
            "flex-end",
    
          justifyContent:
            "flex-start",
    
          paddingTop:
            76,
    
          paddingRight:
            Metrics.x3,
        },
    
    
        profileDropdown: {
          backgroundColor:
            "#FFFFFF",
    
          borderRadius:
            16,
    
          paddingVertical:
            Metrics.x2,
    
          width:
            310,
    
          maxWidth:
            340,
    
          overflow:
            "hidden",
    
          elevation:
            12,
    
          shadowColor:
            "#000000",
    
          shadowOffset: {
            width: 0,
    
            height: 6,
          },
    
          shadowOpacity:
            0.18,
    
          shadowRadius:
            14,
        },
    
    
        profileDropdownDesktop: {
          marginRight:
            Metrics.x2,
        },
    
    
        profileDropdownMobile: {
          width:
            "92%",
    
          maxWidth:
            400,
    
          marginRight:
            "4%",
        },
    
    
        /* ========================================================
           DROPDOWN PROFILE HEADER
        ======================================================== */
    
        dropdownProfileHeader: {
          flexDirection:
            "row",
    
          alignItems:
            "center",
    
          paddingHorizontal:
            Metrics.x3,
    
          paddingVertical:
            Metrics.x2,
        },
    
    
        dropdownAvatar: {
          backgroundColor:
            Colors.brandPrimary,
        },
    
    
        dropdownUserInfo: {
          flex: 1,
    
          marginLeft:
            Metrics.x2,
    
          minWidth:
            0,
        },
    
    
        dropdownUserName: {
          fontSize: 15,
    
          fontWeight:
            "800",
    
          color:
            "#171717",
        },
    
    
        dropdownUserEmail: {
          fontSize: 12,
    
          color:
            Colors.subtext,
    
          marginTop:
            2,
        },
    
    
        dropdownUserRole: {
          fontSize: 10,
    
          fontWeight:
            "700",
    
          color:
            Colors.brandPrimary,
    
          marginTop:
            3,
        },
    
    
        dropdownDivider: {
          marginVertical:
            Metrics.x1,
        },
    
    
        /* ========================================================
           DROPDOWN ITEMS
        ======================================================== */
    
        dropdownItem: {
          flexDirection:
            "row",
    
          alignItems:
            "center",
    
          paddingHorizontal:
            Metrics.x3,
    
          paddingVertical:
            Metrics.x2,
    
          marginHorizontal:
            Metrics.x1,
    
          borderRadius:
            Metrics.x2,
        },
    
    
        dropdownItemTextContainer: {
          flex: 1,
    
          marginLeft:
            Metrics.x2,
        },
    
    
        dropdownIconContainer: {
          width:
            38,
    
          height:
            38,
    
          borderRadius:
            19,
    
          alignItems:
            "center",
    
          justifyContent:
            "center",
    
          backgroundColor:
            Colors.brandPrimaryBg,
        },
    
    
        dropdownIcon: {
          fontSize: 18,
        },
    
    
        dropdownItemTitle: {
          fontSize: 14,
    
          fontWeight:
            "700",
    
          color:
            "#171717",
        },
    
    
        dropdownItemSubtitle: {
          fontSize: 11,
    
          color:
            Colors.subtext,
    
          marginTop:
            2,
        },
    
    
        /* ========================================================
           LOGOUT
        ======================================================== */
    
        logoutItem: {
          marginTop:
            Metrics.x1,
    
          backgroundColor:
            "#FFF7F7",
        },
    
    
        logoutItemDisabled: {
          opacity:
            0.65,
        },
    
    
        logoutIconContainer: {
          backgroundColor:
            Colors.errorBg,
        },
    
    
        logoutIcon: {
          color:
            "#D32F2F",
    
          fontWeight:
            "800",
        },
    
    
        logoutTitle: {
          color:
            "#D32F2F",
        },


    /* ========================================================
       SCHOOLS
    ======================================================== */

    schoolSectionHeader: {
      flexDirection:
        "row",

      alignItems:
        "flex-end",

      justifyContent:
        "space-between",

      marginTop:
        Metrics.x2,

      marginBottom:
        Metrics.x3,
    },


    schoolSectionText: {
      flex: 1,

      minWidth: 0,

      marginRight:
        Metrics.x2,
    },


    schoolSectionSubtitle: {
      fontSize: 12,

      color:
        Colors.subtext,

      marginTop: 3,
    },


    schoolCountText: {
      fontSize: 11,

      fontWeight:
        "700",

      color:
        Colors.subtext,
    },


    /* ========================================================
       SEARCH
    ======================================================== */

    searchBar: {
      height: 48,

      borderRadius:
        12,

      backgroundColor:
        "#FFFFFF",

      borderWidth:
        1,

      borderColor:
        "#E7E9EF",

      marginBottom:
        Metrics.x3,
    },


    searchInput: {
      fontSize: 13,
    },


    /* ========================================================
       FILTERS
    ======================================================== */

    filtersRow: {
      flexDirection:
        "row",

      alignItems:
        "center",

      marginBottom:
        Metrics.x4,
    },


    filterScrollContent: {
      alignItems:
        "center",

      paddingRight:
        Metrics.x2,
    },


    filterChip: {
      paddingHorizontal:
        Metrics.x3,

      paddingVertical:
        Metrics.x2,

      borderRadius:
        20,

      marginRight:
        Metrics.x1,

      backgroundColor:
        "#FFFFFF",

      borderWidth:
        1,

      borderColor:
        "#E4E6EC",
    },


    filterChipActive: {
      backgroundColor:
        Colors.brandPrimary,

      borderColor:
        Colors.brandPrimary,
    },


    filterChipText: {
      fontSize: 11,

      fontWeight:
        "700",

      color:
        Colors.subtext,
    },


    filterChipTextActive: {
      color:
        "#FFFFFF",
    },


    sortButton: {
      borderRadius:
        10,

      borderColor:
        "#DCDFE7",

      backgroundColor:
        "#FFFFFF",
    },


    sortButtonContent: {
      minHeight: 38,

      paddingHorizontal:
        2,
    },


    sortButtonLabel: {
      fontSize: 10,

      fontWeight:
        "800",
    },


    /* ========================================================
       SCHOOL CARD
    ======================================================== */

    schoolTouchable: {
      width:
        "100%",
    },


    schoolCard: {
      marginBottom:
        Metrics.x3,

      borderRadius:
        16,

      backgroundColor:
        "#FFFFFF",

      borderWidth:
        1,

      borderColor:
        "#E9EBF0",

      elevation: 1,
    },


    schoolCardDesktop: {
      borderRadius:
        18,
    },


    schoolHeader: {
      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",
    },


    schoolTitleContainer: {
      flexDirection:
        "row",

      alignItems:
        "center",

      flex: 1,

      minWidth: 0,
    },


    schoolIcon: {
      backgroundColor:
        Colors.brandPrimary,
    },


    schoolTitleText: {
      marginLeft:
        Metrics.x3,

      flex: 1,

      minWidth: 0,
    },


    schoolName: {
      fontSize: 17,

      fontWeight:
        "800",

      color:
        "#171717",
    },


    schoolCode: {
      marginTop:
        3,

      fontSize: 11,

      color:
        Colors.subtext,

      fontWeight:
        "700",

      letterSpacing:
        0.4,
    },


    schoolHeaderRight: {
      marginLeft:
        Metrics.x2,
    },


    statusBadge: {
      flexDirection:
        "row",

      alignItems:
        "center",

      paddingHorizontal:
        Metrics.x2,

      paddingVertical:
        Metrics.x1,

      borderRadius:
        20,
    },


    statusDot: {
      width: 6,

      height: 6,

      borderRadius: 3,

      marginRight:
        5,
    },


    statusText: {
      fontSize: 9,

      fontWeight:
        "900",

      letterSpacing:
        0.3,
    },


    activeBadge: {
      backgroundColor:
        "#E9F8EF",
    },


    activeBadgeText: {
      color:
        "#16834B",
    },


    onboardingBadge: {
      backgroundColor:
        "#FFF5DC",
    },


    onboardingBadgeText: {
      color:
        "#A86D12",
    },


    suspendedBadge: {
      backgroundColor:
        "#FFF0F0",
    },


    suspendedBadgeText: {
      color:
        "#C93C3C",
    },


    expiredBadge: {
      backgroundColor:
        "#FDECEC",
    },


    expiredBadgeText: {
      color:
        "#A9271C",
    },


    defaultBadge: {
      backgroundColor:
        "#F0F1F5",
    },


    defaultBadgeText: {
      color:
        "#666A73",
    },


    divider: {
      marginVertical:
        Metrics.x3,

      backgroundColor:
        "#ECEEF2",
    },


    /* ========================================================
       EXPIRY WARNING
    ======================================================== */

    expiryWarning: {
      flexDirection:
        "row",

      alignItems:
        "center",

      marginTop:
        Metrics.x3,

      paddingHorizontal:
        Metrics.x2,

      paddingVertical:
        Metrics.x2,

      borderRadius:
        9,

      backgroundColor:
        "#FFF7E7",
    },


    expiryWarningAmber: {
      backgroundColor:
        "#FFF7E7",
    },


    expiryWarningRed: {
      backgroundColor:
        "#FFF0F0",
    },


    expiryWarningIcon: {
      marginRight:
        Metrics.x1,

      fontSize: 13,

      fontWeight:
        "900",
    },


    expiryWarningText: {
      fontSize: 11,

      fontWeight:
        "700",

      color:
        "#A56B12",
    },


    /* ========================================================
       SCHOOL STATS
    ======================================================== */

    schoolStatsRow: {
      flexDirection:
        "row",

      justifyContent:
        "space-between",
    },


    schoolStat: {
      alignItems:
        "center",

      flex: 1,
    },


    schoolStatIcon: {
      backgroundColor:
        "#F2F3F7",

      marginBottom:
        Metrics.x1,
    },


    schoolStatValue: {
      fontSize: 17,

      fontWeight:
        "800",

      color:
        "#171717",
    },


    schoolStatLabel: {
      fontSize: 9,

      color:
        Colors.subtext,

      marginTop:
        2,

      fontWeight:
        "600",
    },


    /* ========================================================
       PRINCIPAL
    ======================================================== */

    principalContainer: {
      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",
    },


    principalInfo: {
      flex: 1,

      minWidth: 0,

      marginRight:
        Metrics.x2,
    },


    sectionLabel: {
      fontSize: 9,

      fontWeight:
        "800",

      letterSpacing:
        0.8,

      color:
        Colors.subtext,
    },


    principalName: {
      fontSize: 14,

      fontWeight:
        "800",

      marginTop:
        4,

      color:
        "#171717",
    },


    principalEmail: {
      fontSize: 11,

      color:
        Colors.subtext,

      marginTop:
        3,
    },


    planContainer: {
      alignItems:
        "flex-end",

      maxWidth: 150,
    },


    planBadge: {
      paddingHorizontal:
        Metrics.x2,

      paddingVertical:
        Metrics.x1,

      borderRadius:
        20,

      backgroundColor:
        Colors.brandPrimaryBg,
    },


    planText: {
      fontSize: 9,

      fontWeight:
        "900",

      color:
        "#242424",

      textTransform:
        "uppercase",
    },


    expiryDate: {
      marginTop:
        4,

      fontSize: 9,

      color:
        Colors.subtext,
    },


    /* ========================================================
       SCHOOL FOOTER
    ======================================================== */

    schoolFooter: {
      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      marginTop:
        Metrics.x4,

      paddingTop:
        Metrics.x3,

      borderTopWidth:
        1,

      borderTopColor:
        "#F0F1F4",
    },


    createdText: {
      fontSize: 10,

      color:
        Colors.subtext,
    },


    viewSchool: {
      flexDirection:
        "row",

      alignItems:
        "center",
    },


    viewSchoolText: {
      fontSize: 11,

      fontWeight:
        "800",

      color:
        Colors.brandPrimary,
    },


    viewSchoolArrow: {
      marginLeft:
        5,

      fontSize: 16,

      fontWeight:
        "800",

      color:
        Colors.brandPrimary,
    },


    /* ========================================================
       LOADING
    ======================================================== */

    loadingContainer: {
      flex: 1,

      alignItems:
        "center",

      justifyContent:
        "center",

      paddingHorizontal:
        Metrics.x4,
    },


    loadingBrand: {
      padding:
        Metrics.x2,

      borderRadius:
        40,

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

      fontWeight:
        "800",

      color:
        "#171717",
    },


    loadingSubtitle: {
      marginTop:
        Metrics.x1,

      fontSize: 12,

      color:
        Colors.subtext,
    },


    /* ========================================================
       EMPTY
    ======================================================== */

    empty: {
      alignItems:
        "center",

      paddingVertical:
        Metrics.x8,

      paddingHorizontal:
        Metrics.x4,
    },


    emptyIconContainer: {
      padding:
        Metrics.x2,

      borderRadius:
        42,

      backgroundColor:
        Colors.brandPrimaryBg,
    },


    emptyIcon: {
      backgroundColor:
        Colors.brandPrimaryBg,
    },


    emptyTitle: {
      fontSize: 18,

      fontWeight:
        "800",

      marginTop:
        Metrics.x3,

      color:
        "#171717",
    },


    emptyText: {
      color:
        Colors.subtext,

      marginTop:
        Metrics.x1,

      textAlign:
        "center",

      maxWidth: 340,

      fontSize: 12,

      lineHeight: 18,
    },


    emptyButton: {
      marginTop:
        Metrics.x4,

      borderRadius:
        12,
    },
    profileButtonActive: {
          backgroundColor:
            Colors.brandPrimaryBg,
        },


    /* ========================================================
       SNACKBAR
    ======================================================== */

    snackbar: {
      backgroundColor:
        "#252525",

      borderRadius:
        10,
    },

  });

export default dashboardStyles;