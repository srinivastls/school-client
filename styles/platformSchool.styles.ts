import { StyleSheet } from "react-native";
import { Colors } from "../theme/colors";
import { Metrics } from "../theme/metrics";

const platformSchoolStyles =
  StyleSheet.create({

    /* ========================================================
       SCREEN
    ======================================================== */

    screen: {
      flex: 1,

      backgroundColor:
        "#F6F7FB",
    },


    container: {
      width:
        "100%",

      maxWidth:
        1400,

      alignSelf:
        "center",

      paddingHorizontal:
        Metrics.x4,

      paddingTop:
        Metrics.x2,

      paddingBottom:
        Metrics.x6,
    },


    containerMobile: {
      paddingHorizontal: 12,
      paddingTop: 40,
      paddingBottom: 24,
    },


    /* ========================================================
       LOADING
    ======================================================== */

    loader: {
      flex: 1,

      alignItems:
        "center",

      justifyContent:
        "center",

      padding:
        Metrics.x5,

      backgroundColor:
        "#F6F7FB",
    },


    loaderIcon: {
      width:
        72,

      height:
        72,

      borderRadius:
        36,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        Colors.brandPrimaryBg,

      marginBottom:
        Metrics.x3,
    },


    loadingTitle: {
      fontSize:
        18,

      fontWeight:
        "800",

      color:
        "#171717",
    },


    loadingText: {
      marginTop:
        Metrics.x1,

      color:
        Colors.subtext,

      fontSize:
        13,

      textAlign:
        "center",
    },


    /* ========================================================
       ERROR
    ======================================================== */

    errorIcon: {
      width:
        64,

      height:
        64,

      borderRadius:
        32,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        Colors.errorBg,

      marginBottom:
        Metrics.x3,
    },


    errorIconText: {
      fontSize:
        30,

      fontWeight:
        "800",

      color:
        Colors.error,
    },


    errorTitle: {
      fontSize:
        18,

      fontWeight:
        "800",

      textAlign:
        "center",

      color:
        "#171717",
    },


    errorText: {
      marginTop:
        Metrics.x2,

      color:
        Colors.subtext,

      textAlign:
        "center",

      maxWidth:
        330,

      lineHeight:
        20,
    },


    retryButton: {
      marginTop:
        Metrics.x4,

      borderRadius:
        22,
    },


    /* ========================================================
       PAGE HEADER
    ======================================================== */

    pageHeader: {
      minHeight:
        54,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      marginBottom:
        Metrics.x3,
    },


    headerLeft: {
      flexDirection:
        "row",

      alignItems:
        "center",

      flex: 1,

      minWidth:
        0,
    },


    backButton: {
      margin:
        0,

      marginRight:
        Metrics.x1,
    },


    breadcrumbContainer: {
      flexDirection:
        "row",

      alignItems:
        "center",

      flex: 1,

      minWidth:
        0,
    },


    breadcrumb: {
      fontSize:
        13,

      color:
        Colors.subtext,

      fontWeight:
        "600",
    },


    breadcrumbSeparator: {
      marginHorizontal:
        Metrics.x1,

      color:
        "#B1B1B8",

      fontSize:
        14,
    },


    breadcrumbCurrent: {
      fontSize:
        13,

      fontWeight:
        "700",

      color:
        "#171717",

      flexShrink:
        1,
    },


    headerRefresh: {
      margin:
        0,
    },


    pageHeaderMobile: {
      minHeight: 44,
      marginBottom: 10,
    },


    heroCardMobile: {
      borderRadius: 14,
      marginBottom: 18,
    },

    heroContentMobile: {
      paddingHorizontal: 14,
      paddingVertical: 14,
    },

    heroTopMobile: {
      flexDirection: "column",
      alignItems: "stretch",
    },

    schoolIdentityMobile: {
      alignItems: "flex-start",
    },

    schoolAvatarMobile: {
      width: 50,
      height: 50,
      borderRadius: 14,
      marginRight: 12,
    },

    schoolTitleMobile: {
      fontSize: 20,
      lineHeight: 25,
    },

    heroMetaMobile: {
      marginTop: 8,
      gap: 6,
    },

    /* ========================================================
       HERO
    ======================================================== */

    heroCard: {
      borderRadius:
        18,

      backgroundColor:
        "#FFFFFF",

      marginBottom:
        Metrics.x5,

      elevation:
        2,

      borderWidth:
        1,

      borderColor:
        "#EBEBF0",
    },


    heroContent: {
      padding:
        Metrics.x4,
    },


    heroTop: {
      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",
    },


    schoolIdentity: {
      flexDirection:
        "row",

      alignItems:
        "center",

      flex: 1,

      minWidth:
        0,
    },


    schoolAvatar: {
      width:
        68,

      height:
        68,

      borderRadius:
        18,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        Colors.brandPrimaryBg,

      marginRight:
        Metrics.x3,
    },


    schoolAvatarIcon: {
      backgroundColor:
        Colors.brandPrimary,

      borderRadius:
        16,
    },


    schoolIdentityText: {
      flex: 1,

      minWidth:
        0,
    },


    schoolTitle: {
      fontSize:
        25,

      fontWeight:
        "800",

      color:
        "#171717",

      lineHeight:
        31,
    },


    schoolCode: {
      marginTop:
        4,

      fontSize:
        13,

      fontWeight:
        "700",

      color:
        Colors.subtext,

      letterSpacing:
        0.4,
    },


    heroMeta: {
      flexDirection:
        "row",

      alignItems:
        "center",

      flexWrap:
        "wrap",

      marginTop:
        Metrics.x2,

      gap:
        Metrics.x2,
    },


    heroAction: {
      marginLeft:
        Metrics.x3,
    },


    suspendButton: {
      borderRadius:
        22,

      borderWidth:
        1.2,

      borderColor:
        Colors.error,
    },


    reactivateButton: {
      borderRadius:
        22,
    },


    mobileHeroAction: {
      marginTop: 12,

      paddingTop: 12,

      borderTopWidth:
        1,

      borderTopColor:
        "#EEEEF2",
    },


    fullWidthAction: {
      borderRadius: 12,
      minHeight: 46,
    },


    /* ========================================================
       STATUS
    ======================================================== */

    statusBadge: {
      flexDirection:
        "row",

      alignItems:
        "center",

      alignSelf:
        "flex-start",

      paddingHorizontal:
        Metrics.x2,

      paddingVertical:
        6,

      borderRadius:
        20,
    },


    statusDot: {
      width:
        7,

      height:
        7,

      borderRadius:
        4,

      backgroundColor:
        "#555555",

      marginRight:
        6,
    },


    statusBadgeText: {
      fontSize:
        11,

      fontWeight:
        "800",

      color:
        "#303030",
    },


    activeBadge: {
      backgroundColor:
        Colors.successBg,
    },


    onboardingBadge: {
      backgroundColor:
        Colors.warningBg,
    },


    suspendedBadge: {
      backgroundColor:
        Colors.errorBg,
    },


    expiredBadge: {
      backgroundColor:
        Colors.errorBg,
    },


    defaultBadge: {
      backgroundColor:
        Colors.brandPrimaryBg,
    },


    planBadge: {
      paddingHorizontal:
        Metrics.x2,

      paddingVertical:
        6,

      borderRadius:
        20,

      backgroundColor:
        "#F0EDFF",
    },


    planBadgeText: {
      fontSize:
        11,

      fontWeight:
        "800",

      color:
        Colors.brandPrimary,
    },


    /* ========================================================
       STATS HEADER
    ======================================================== */

    statsHeader: {
      marginBottom:
        Metrics.x3,
    },


    sectionTitle: {
      fontSize:
        19,

      fontWeight:
        "800",

      color:
        "#171717",
    },


    sectionSubtitle: {
      fontSize:
        13,

      color:
        Colors.subtext,

      marginTop:
        3,
    },


    /* ========================================================
       STATS
    ======================================================== */

    statsGrid: {
      flexDirection:
        "row",

      flexWrap:
        "wrap",

      gap:
        Metrics.x3,

      marginBottom:
        Metrics.x5,
    },


    statCard: {
      flexGrow:
        1,

      flexBasis:
        150,

      minWidth:
        140,

      borderRadius:
        15,

      backgroundColor:
        "#FFFFFF",

      elevation:
        1,

      borderWidth:
        1,

      borderColor:
        "#ECECF1",
    },


    statCardTop: {
      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",
    },


    statAvatar: {
      backgroundColor:
        Colors.brandPrimaryBg,
    },


    statValue: {
      fontSize:
        27,

      fontWeight:
        "800",

      color:
        "#171717",
    },


    statValueMobile: {
      fontSize: 22,
    },

    statLabel: {
      marginTop:
        Metrics.x2,

      fontSize:
        13,

      fontWeight:
        "600",

      color:
        Colors.subtext,
    },


    statsGridMobile: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      marginBottom: 18,
    },

    statCardMobile: {
      width: "48%",
      flexGrow: 0,
      flexBasis: "48%",
      minWidth: 0,
      borderRadius: 12,
      marginBottom: 8,
    },

    statCardContentMobile: {
      paddingHorizontal: 12,
      paddingVertical: 12,
    },

    statLabelMobile: {
      marginTop: 6,
      fontSize: 12,
    },


    /* ========================================================
       CONTENT GRID
    ======================================================== */

    contentGrid: {
      flexDirection:
        "row",

      alignItems:
        "flex-start",

      gap:
        Metrics.x4,
    },


    contentGridMobile: {
      flexDirection:
        "column",

      gap:
        0,
    },


    primaryColumn: {
      flex:
        1,

      minWidth:
        0,
    },


    secondaryColumn: {
      width:
        390,

      maxWidth:
        "38%",
    },


    primaryColumnMobile: {
      width: "100%",
      flex: 1,
    },

    secondaryColumnMobile: {
      width: "100%",
      maxWidth: "100%",
      flex: 1,
    },

    /* ========================================================
       CARD
    ======================================================== */

    cardContent: {
      paddingHorizontal: 16,
      paddingVertical: 16,
    },

    card: {
      borderRadius:
        17,

      backgroundColor:
        "#FFFFFF",

      marginBottom:
        Metrics.x4,

      elevation:
        1,

      borderWidth:
        1,

      borderColor:
        "#ECECF1",
    },


    cardHeader: {
      flexDirection:
        "row",

      alignItems:
        "center",
    },


    cardHeaderIcon: {
      marginRight:
        Metrics.x2,
    },


    cardHeaderAvatar: {
      backgroundColor:
        Colors.brandPrimaryBg,
    },


    cardHeaderText: {
      flex:
        1,

      minWidth:
        0,
    },


    cardTitle: {
      fontSize:
        17,

      fontWeight:
        "800",

      color:
        "#171717",
    },


    cardSubtitle: {
      fontSize:
        12,

      color:
        Colors.subtext,

      marginTop:
        2,
    },


    cardDivider: {
      marginVertical:
        Metrics.x3,
    },


    /* ========================================================
       INFO
    ======================================================== */

    infoRow: {
      flexDirection:
        "row",

      alignItems:
        "flex-start",

      paddingVertical:
        Metrics.x2,
    },


    infoIcon: {
      marginRight:
        Metrics.x2,
    },


    infoAvatar: {
      backgroundColor:
        "#F3F3F7",
    },


    infoContent: {
      flex:
        1,

      minWidth:
        0,
    },


    infoLabel: {
      fontSize:
        11,

      fontWeight:
        "600",

      color:
        Colors.subtext,

      marginBottom:
        3,

      textTransform:
        "uppercase",

      letterSpacing:
        0.4,
    },


    infoValue: {
      fontSize:
        14,

      lineHeight:
        20,

      fontWeight:
        "600",

      color:
        "#242424",
    },


    innerDivider: {
      marginVertical:
        Metrics.x2,
    },


    /* ========================================================
       PRINCIPAL
    ======================================================== */

    principalProfile: {
      flexDirection:
        "row",

      alignItems:
        "center",

      paddingVertical:
        Metrics.x2,
    },


    principalAvatar: {
      backgroundColor:
        Colors.brandPrimary,
    },


    principalProfileInfo: {
      flex:
        1,

      marginLeft:
        Metrics.x2,

      minWidth:
        0,
    },


    principalName: {
      fontSize:
        17,

      fontWeight:
        "800",

      color:
        "#171717",
    },


    principalDesignation: {
      fontSize:
        13,

      color:
        Colors.subtext,

      marginTop:
        2,
    },


    activeIndicatorRow: {
      flexDirection:
        "row",

      alignItems:
        "center",

      marginTop:
        Metrics.x1,
    },


    activeDot: {
      width:
        7,

      height:
        7,

      borderRadius:
        4,

      marginRight:
        6,
    },


    activeIndicatorText: {
      fontSize:
        11,

      color:
        Colors.subtext,

      fontWeight:
        "600",
    },


    /* ========================================================
       EMPTY PRINCIPAL
    ======================================================== */

    emptyPrincipal: {
      alignItems:
        "center",

      paddingVertical:
        Metrics.x3,

      paddingHorizontal:
        Metrics.x2,
    },


    emptyPrincipalIcon: {
      width:
        64,

      height:
        64,

      borderRadius:
        32,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        Colors.brandPrimaryBg,

      marginBottom:
        Metrics.x2,
    },


    emptyPrincipalAvatar: {
      backgroundColor:
        Colors.brandPrimaryBg,
    },


    emptyPrincipalTitle: {
      fontSize:
        16,

      fontWeight:
        "800",

      color:
        "#171717",
    },


    emptyPrincipalText: {
      fontSize:
        13,

      color:
        Colors.subtext,

      textAlign:
        "center",

      lineHeight:
        19,

      marginTop:
        Metrics.x1,

      maxWidth:
        330,
    },


    createPrincipalButton: {
      marginTop:
        Metrics.x3,

      borderRadius:
        22,
    },


    /* ========================================================
       QUICK ACTIONS
    ======================================================== */

    createPrincipalAction: {
      borderRadius:
        22,
    },


    actionContent: {
      minHeight:
        44,
    },


    actionInfo: {
      flexDirection:
        "row",

      alignItems:
        "center",

      padding:
        Metrics.x2,

      borderRadius:
        12,

      backgroundColor:
        Colors.successBg,
    },


    actionInfoIcon: {
      width:
        34,

      height:
        34,

      borderRadius:
        17,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        "#FFFFFF",
    },


    actionInfoIconText: {
      fontSize:
        18,

      fontWeight:
        "800",

      color:
        "#2E7D32",
    },


    actionInfoText: {
      marginLeft:
        Metrics.x2,

      flex:
        1,
    },


    actionInfoTitle: {
      fontSize:
        13,

      fontWeight:
        "800",

      color:
        "#1E1E1E",
    },


    actionInfoSubtitle: {
      fontSize:
        12,

      color:
        Colors.subtext,

      marginTop:
        2,
    },


    actionDivider: {
      marginVertical:
        Metrics.x3,
    },


    statusActionInfo: {
      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",
    },


    actionLabel: {
      fontSize:
        11,

      color:
        Colors.subtext,

      textTransform:
        "uppercase",

      fontWeight:
        "700",

      letterSpacing:
        0.4,
    },


    actionStatusValue: {
      fontSize:
        14,

      fontWeight:
        "800",

      color:
        "#171717",

      marginTop:
        3,
    },


    /* ========================================================
       SUBSCRIPTION
    ======================================================== */

    subscriptionPlan: {
      flexDirection:
        "row",

      alignItems:
        "center",

      paddingVertical:
        Metrics.x1,
    },


    subscriptionIcon: {
      marginRight:
        Metrics.x2,
    },


    subscriptionAvatar: {
      backgroundColor:
        Colors.brandPrimaryBg,
    },


    subscriptionInfo: {
      flex:
        1,
    },


    subscriptionPlanLabel: {
      fontSize:
        11,

      color:
        Colors.subtext,

      fontWeight:
        "600",

      textTransform:
        "uppercase",
    },


    subscriptionPlanName: {
      fontSize:
        18,

      fontWeight:
        "800",

      color:
        Colors.brandPrimary,

      marginTop:
        2,
    },


    /* ========================================================
       SNACKBAR
    ======================================================== */

    successSnackbar: {
      backgroundColor:
        "#256B3A",

      borderRadius:
        10,
    },


    errorSnackbar: {
      backgroundColor:
        "#B42318",

      borderRadius:
        10,
    },

  });


export default platformSchoolStyles;