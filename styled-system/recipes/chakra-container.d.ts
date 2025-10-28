/* eslint-disable */
import type { ConditionalValue } from '../types/index';
import type { DistributiveOmit, Pretty } from '../types/system-types';

interface ChakraContainerVariant {
  centerContent: boolean
fluid: boolean
}

type ChakraContainerVariantMap = {
  [key in keyof ChakraContainerVariant]: Array<ChakraContainerVariant[key]>
}



export type ChakraContainerVariantProps = {
  [key in keyof ChakraContainerVariant]?: ConditionalValue<ChakraContainerVariant[key]> | undefined
}

export interface ChakraContainerRecipe {
  
  __type: ChakraContainerVariantProps
  (props?: ChakraContainerVariantProps): string
  raw: (props?: ChakraContainerVariantProps) => ChakraContainerVariantProps
  variantMap: ChakraContainerVariantMap
  variantKeys: Array<keyof ChakraContainerVariant>
  splitVariantProps<Props extends ChakraContainerVariantProps>(props: Props): [ChakraContainerVariantProps, Pretty<DistributiveOmit<Props, keyof ChakraContainerVariantProps>>]
  getVariantProps: (props?: ChakraContainerVariantProps) => ChakraContainerVariantProps
}


export declare const chakraContainer: ChakraContainerRecipe