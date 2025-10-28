import { compact, getSlotCompoundVariant, memo, splitProps } from '../helpers.mjs';
import { createRecipe } from './create-recipe.mjs';

const checkboxDefaultVariants = {
  "variant": "solid",
  "size": "md"
}
const checkboxCompoundVariants = []

const checkboxSlotNames = [
  [
    "root",
    "chakra-checkbox__root"
  ],
  [
    "label",
    "chakra-checkbox__label"
  ],
  [
    "control",
    "chakra-checkbox__control"
  ],
  [
    "indicator",
    "chakra-checkbox__indicator"
  ],
  [
    "group",
    "chakra-checkbox__group"
  ]
]
const checkboxSlotFns = /* @__PURE__ */ checkboxSlotNames.map(([slotName, slotKey]) => [slotName, createRecipe(slotKey, checkboxDefaultVariants, getSlotCompoundVariant(checkboxCompoundVariants, slotName))])

const checkboxFn = memo((props = {}) => {
  return Object.fromEntries(checkboxSlotFns.map(([slotName, slotFn]) => [slotName, slotFn.recipeFn(props)]))
})

const checkboxVariantKeys = [
  "size",
  "variant"
]
const getVariantProps = (variants) => ({ ...checkboxDefaultVariants, ...compact(variants) })

export const checkbox = /* @__PURE__ */ Object.assign(checkboxFn, {
  __recipe__: false,
  __name__: 'checkbox',
  raw: (props) => props,
  classNameMap: {},
  variantKeys: checkboxVariantKeys,
  variantMap: {
  "size": [
    "xs",
    "sm",
    "md",
    "lg"
  ],
  "variant": [
    "outline",
    "solid",
    "subtle"
  ]
},
  splitVariantProps(props) {
    return splitProps(props, checkboxVariantKeys)
  },
  getVariantProps
})