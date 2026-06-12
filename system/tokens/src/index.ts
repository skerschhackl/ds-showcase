import tokens from "./tokens.json";

export const typographySizes = tokens.typography.size;
export const typographyLineHeights = tokens.typography.lineHeight;
export const typographyWeights = tokens.typography.weight;

export type TypographySize = keyof typeof typographySizes;
export type TypographyLineHeight = keyof typeof typographyLineHeights;
export type TypographyWeight = keyof typeof typographyWeights;

export default tokens;
