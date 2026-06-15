import tokens from "./tokens.json";

export const typographySizes = tokens.typography.size;
export const typographyLineHeights = tokens.typography.lineHeight;
export const typographyWeights = tokens.typography.weight;
export const colorRoles = {
  bg: tokens.color.bg,
  text: tokens.color.textSemantic,
  border: tokens.color.borderSemantic,
  action: tokens.color.action,
  accent: tokens.color.accentSemantic,
  status: tokens.color.status
} as const;

export type TypographySize = keyof typeof typographySizes;
export type TypographyLineHeight = keyof typeof typographyLineHeights;
export type TypographyWeight = keyof typeof typographyWeights;
export type ColorRoles = typeof colorRoles;

export default tokens;
