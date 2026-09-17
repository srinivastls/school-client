import { StyleSheet } from "react-native";
import { Colors } from "../theme/colors";
import { Metrics } from "../theme/metrics";

const createPrincipalStyles =
  StyleSheet.create({

    /* ========================================================
       PAGE
    ======================================================== */

    container: {
      flex: 1,

      backgroundColor:
        "#F6F7FB",
    },


    content: {
      width:
        "100%",

      maxWidth:
        900,

      alignSelf:
        "center",

      paddingHorizontal:
        Metrics.x4,

      paddingTop:
        Metrics.x4,

      paddingBottom:
        Metrics.x7,
    },


    /* ========================================================
       HEADER
    ======================================================== */

    header: {
      flexDirection:
        "row",

      alignItems:
        "center",

      marginBottom:
        Metrics.x5,
    },


    headerIcon: {
      marginRight:
        Metrics.x3,
    },


    headerAvatar: {
      backgroundColor:
        Colors.brandPrimary,
    },


    headerText: {
      flex:
        1,

      minWidth:
        0,
    },


    title: {
      fontSize:
        28,

      fontWeight:
        "800",

      color:
        "#171717",
    },


    subtitle: {
      marginTop:
        Metrics.x1,

      fontSize:
        14,

      lineHeight:
        20,

      color:
        Colors.subtext,
    },


    /* ========================================================
       SCHOOL
    ======================================================== */

    schoolCard: {
      marginBottom:
        Metrics.x4,

      borderRadius:
        17,

      backgroundColor:
        Colors.brandPrimaryBg,

      borderWidth:
        1,

      borderColor:
        "#DDD9FF",

      elevation:
        0,
    },


    schoolCardHeader: {
      flexDirection:
        "row",

      alignItems:
        "center",
    },


    schoolAvatar: {
      backgroundColor:
        Colors.brandPrimary,

      marginRight:
        Metrics.x3,
    },


    schoolInfo: {
      flex:
        1,

      minWidth:
        0,
    },


    schoolLabel: {
      fontSize:
        10,

      fontWeight:
        "800",

      letterSpacing:
        0.7,

      color:
        Colors.subtext,
    },


    schoolName: {
      marginTop:
        3,

      fontSize:
        19,

      fontWeight:
        "800",

      color:
        "#171717",
    },


    schoolCodeBadge: {
      alignSelf:
        "flex-start",

      marginTop:
        Metrics.x1,

      paddingHorizontal:
        Metrics.x2,

      paddingVertical:
        4,

      borderRadius:
        12,

      backgroundColor:
        "#FFFFFF",
    },


    schoolCode: {
      fontSize:
        11,

      fontWeight:
        "800",

      color:
        Colors.brandPrimary,
    },


    /* ========================================================
       SECTION CARD
    ======================================================== */

    sectionCard: {
      marginBottom:
        Metrics.x4,

      borderRadius:
        17,

      backgroundColor:
        "#FFFFFF",

      borderWidth:
        1,

      borderColor:
        "#E8E8EE",

      elevation:
        1,
    },


    sectionHeader: {
      flexDirection:
        "row",

      alignItems:
        "center",
    },


    sectionAvatar: {
      backgroundColor:
        Colors.brandPrimaryBg,

      marginRight:
        Metrics.x2,
    },


    sectionHeaderText: {
      flex:
        1,

      minWidth:
        0,
    },


    sectionTitle: {
      fontSize:
        18,

      fontWeight:
        "800",

      color:
        "#171717",
    },


    sectionSubtitle: {
      marginTop:
        2,

      fontSize:
        12,

      lineHeight:
        17,

      color:
        Colors.subtext,
    },


    divider: {
      marginVertical:
        Metrics.x4,
    },


    /* ========================================================
       FIELDS
    ======================================================== */

    fieldLabel: {
      fontSize:
        12,

      fontWeight:
        "700",

      letterSpacing:
        0.35,

      textTransform:
        "uppercase",

      color:
        "#44444A",

      marginBottom:
        Metrics.x1,
    },


    required: {
      color:
        Colors.error,
    },


    input: {
      backgroundColor:
        "#FFFFFF",

      marginBottom:
        Metrics.x1,
    },


    feedbackRow: {
      minHeight:
        20,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      marginBottom:
        Metrics.x2,
    },


    feedbackText: {
      flex:
        1,
    },


    helperText: {
      paddingHorizontal:
        0,

      marginTop:
        -2,

      marginBottom:
        -2,
    },


    characterCount: {
      fontSize:
        10,

      color:
        "#9999A1",

      marginLeft:
        Metrics.x2,
    },


    characterCountWarning: {
      color:
        Colors.error,

      fontWeight:
        "700",
    },


    /* ========================================================
       PASSWORD
    ======================================================== */

    passwordStrength: {
      marginTop:
        Metrics.x1,

      marginBottom:
        Metrics.x2,

      padding:
        Metrics.x3,

      borderRadius:
        12,

      backgroundColor:
        "#F7F7FA",
    },


    passwordStrengthHeader: {
      flexDirection:
        "row",

      justifyContent:
        "space-between",

      alignItems:
        "center",
    },


    passwordStrengthLabel: {
      fontSize:
        12,

      fontWeight:
        "700",

      color:
        "#55555D",
    },


    passwordStrengthValue: {
      fontSize:
        12,

      fontWeight:
        "800",

      color:
        "#171717",
    },


    strengthTrack: {
      flexDirection:
        "row",

      gap:
        4,

      marginTop:
        Metrics.x2,
    },


    strengthSegment: {
      flex:
        1,

      height:
        5,

      borderRadius:
        5,

      backgroundColor:
        "#DDDEE5",
    },


    strengthSegmentActive: {
      backgroundColor:
        Colors.brandPrimary,
    },


    passwordHint: {
      marginTop:
        Metrics.x2,

      fontSize:
        11,

      lineHeight:
        16,

      color:
        Colors.subtext,
    },


    /* ========================================================
       REVIEW
    ======================================================== */

    reviewCard: {
      marginBottom:
        Metrics.x4,

      borderRadius:
        17,

      backgroundColor:
        "#F0EEFF",

      borderWidth:
        1,

      borderColor:
        "#DDD9FF",

      elevation:
        0,
    },


    reviewRow: {
      flexDirection:
        "row",

      justifyContent:
        "space-between",

      alignItems:
        "center",

      paddingVertical:
        Metrics.x1,
    },


    reviewLabel: {
      fontSize:
        12,

      fontWeight:
        "600",

      color:
        Colors.subtext,
    },


    reviewValue: {
      flex:
        1,

      marginLeft:
        Metrics.x3,

      textAlign:
        "right",

      fontSize:
        13,

      fontWeight:
        "800",

      color:
        "#171717",
    },


    /* ========================================================
       ACTIONS
    ======================================================== */

    actions: {
      marginTop:
        Metrics.x1,
    },


    createButton: {
      borderRadius:
        25,

      backgroundColor:
        Colors.brandPrimary,
    },


    createButtonContent: {
      minHeight:
        52,
    },


    createButtonLabel: {
      fontSize:
        14,

      fontWeight:
        "800",
    },


    backButton: {
      marginTop:
        Metrics.x1,

      borderRadius:
        22,
    },


    formHint: {
      marginTop:
        Metrics.x2,

      textAlign:
        "center",

      fontSize:
        11,

      color:
        Colors.subtext,
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


export default createPrincipalStyles;