import type { TextStyle } from "react-native";

/**
 * Single typography scale for the Platform Admin application.
 *
 * Font family:
 * - Set APP_FONT_FAMILY to the actual bundled font family used by the app.
 * - If you are using Inter, use "Inter".
 */
const APP_FONT_FAMILY = "Inter";

const base = {
  fontFamily: APP_FONT_FAMILY,
} satisfies TextStyle;

export const Typography = {
  pageTitle: {
    ...base,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "800",
  } satisfies TextStyle,

  pageSubtitle: {
    ...base,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "400",
  } satisfies TextStyle,

  sectionTitle: {
    ...base,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "800",
  } satisfies TextStyle,

  sectionSubtitle: {
    ...base,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "400",
  } satisfies TextStyle,

  body: {
    ...base,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "400",
  } satisfies TextStyle,

  bodySmall: {
    ...base,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "400",
  } satisfies TextStyle,

  statValue: {
    ...base,
    fontSize: 32,
    lineHeight: 40,
    fontWeight: "800",
  } satisfies TextStyle,

  statLabel: {
    ...base,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "400",
  } satisfies TextStyle,

  cardTitle: {
    ...base,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "800",
  } satisfies TextStyle,

  fieldLabel: {
    ...base,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700",
    letterSpacing: 0.35,
    textTransform: "uppercase",
  } satisfies TextStyle,

  input: {
    ...base,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "400",
  } satisfies TextStyle,

  label: {
    ...base,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
  } satisfies TextStyle,

  value: {
    ...base,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "800",
  } satisfies TextStyle,

  button: {
    ...base,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "800",
  } satisfies TextStyle,

  caption: {
    ...base,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "400",
  } satisfies TextStyle,

  helper: {
    ...base,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "400",
  } satisfies TextStyle,

  micro: {
    ...base,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "400",
  } satisfies TextStyle,
} as const;
