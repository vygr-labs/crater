import { compact, getSlotCompoundVariant, memo, splitProps } from '../helpers.mjs';
import { createRecipe } from './create-recipe.mjs';

const chakraSwitchDefaultVariants = {
  "variant": "solid",
  "size": "md"
}
const chakraSwitchCompoundVariants = []

const chakraSwitchSlotNames = [
  [
    "root",
    "chakra-switch__root"
  ],
  [
    "label",
    "chakra-switch__label"
  ],
  [
    "control",
    "chakra-switch__control"
  ],
  [
    "thumb",
    "chakra-switch__thumb"
  ],
  [
    "indicator",
    "chakra-switch__indicator"
  ]
]
const chakraSwitchSlotFns = /* @__PURE__ */ chakraSwitchSlotNames.map(([slotName, slotKey]) => [slotName, createRecipe(slotKey, chakraSwitchDefaultVariants, getSlotCompoundVariant(chakraSwitchCompoundVariants, slotName))])

const chakraSwitchFn = memo((props = {}) => {
  return Object.fromEntries(chakraSwitchSlotFns.map(([slotName, slotFn]) => [slotName, slotFn.recipeFn(props)]))
})

const chakraSwitchVariantKeys = [
  "variant",
  "size"
]
const getVariantProps = (variants) => ({ ...chakraSwitchDefaultVariants, ...compact(variants) })

export const chakraSwitch = /* @__PURE__ */ Object.assign(chakraSwitchFn, {
  __recipe__: false,
  __name__: 'chakraSwitch',
  raw: (props) => props,
  classNameMap: {},
  variantKeys: chakraSwitchVariantKeys,
  variantMap: {
  "variant": [
    "solid",
    "raised"
  ],
  "size": [
    "xs",
    "sm",
    "md",
    "lg"
  ]
},
  splitVariantProps(props) {
    return splitProps(props, chakraSwitchVariantKeys)
  },
  getVariantProps
})