/* eslint-disable */
import type { ConditionalValue } from '../types/index';
import type { DistributiveOmit, Pretty } from '../types/system-types';

interface ChakraSwitchVariant {
  /**
 * @default "solid"
 */
variant: "solid" | "raised"
/**
 * @default "md"
 */
size: "xs" | "sm" | "md" | "lg"
}

type ChakraSwitchVariantMap = {
  [key in keyof ChakraSwitchVariant]: Array<ChakraSwitchVariant[key]>
}

type ChakraSwitchSlot = "root" | "label" | "control" | "thumb" | "indicator"

export type ChakraSwitchVariantProps = {
  [key in keyof ChakraSwitchVariant]?: ConditionalValue<ChakraSwitchVariant[key]> | undefined
}

export interface ChakraSwitchRecipe {
  __slot: ChakraSwitchSlot
  __type: ChakraSwitchVariantProps
  (props?: ChakraSwitchVariantProps): Pretty<Record<ChakraSwitchSlot, string>>
  raw: (props?: ChakraSwitchVariantProps) => ChakraSwitchVariantProps
  variantMap: ChakraSwitchVariantMap
  variantKeys: Array<keyof ChakraSwitchVariant>
  splitVariantProps<Props extends ChakraSwitchVariantProps>(props: Props): [ChakraSwitchVariantProps, Pretty<DistributiveOmit<Props, keyof ChakraSwitchVariantProps>>]
  getVariantProps: (props?: ChakraSwitchVariantProps) => ChakraSwitchVariantProps
}


export declare const chakraSwitch: ChakraSwitchRecipe