export interface Variant {
  sex: string;
  lifeStage: string;
  value: string;
}

export interface FeatureVariants {
  reference: string;
  variants: Variant[];
} 