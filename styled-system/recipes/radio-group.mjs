import { compact, getSlotCompoundVariant, memo, splitProps } from '../helpers.mjs';
import { createRecipe } from './create-recipe.mjs';

const radioGroupDefaultVariants = {
  "size": "md",
  "variant": "solid"
}
const radioGroupCompoundVariants = []

const radioGroupSlotNames = [
  [
    "root",
    "chakra-radio-group__root"
  ],
  [
    "label",
    "chakra-radio-group__label"
  ],
  [
    "item",
    "chakra-radio-group__item"
  ],
  [
    "itemText",
    "chakra-radio-group__itemText"
  ],
  [
    "itemControl",
    "chakra-radio-group__itemControl"
  ],
  [
    "indicator",
    "chakra-radio-group__indicator"
  ],
  [
    "itemAddon",
    "chakra-radio-group__itemAddon"
  ],
  [
    "itemIndicator",
    "chakra-radio-group__itemIndicator"
  ]
]
const radioGroupSlotFns = /* @__PURE__ */ radioGroupSlotNames.map(([slotName, slotKey]) => [slotName, createRecipe(slotKey, radioGroupDefaultVariants, getSlotCompoundVariant(radioGroupCompoundVariants, slotName))])

const radioGroupFn = memo((props = {}) => {
  return Object.fromEntries(radioGroupSlotFns.map(([slotName, slotFn]) => [slotName, slotFn.recipeFn(props)]))
})

const radioGroupVariantKeys = [
  "variant",
  "size"
]
const getVariantProps = (variants) => ({ ...radioGroupDefaultVariants, ...compact(variants) })

export const radioGroup = /* @__PURE__ */ Object.assign(radioGroupFn, {
  __recipe__: false,
  __name__: 'radioGroup',
  raw: (props) => props,
  classNameMap: {},
  variantKeys: radioGroupVariantKeys,
  variantMap: {
  "variant": [
    "outline",
    "subtle",
    "solid"
  ],
  "size": [
    "xs",
    "sm",
    "md",
    "lg"
  ]
},
  splitVariantProps(props) {
    return splitProps(props, radioGroupVariantKeys)
  },
  getVariantProps
})