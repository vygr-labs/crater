import { compact, getSlotCompoundVariant, memo, splitProps } from '../helpers.mjs';
import { createRecipe } from './create-recipe.mjs';

const ratingGroupDefaultVariants = {
  "size": "md"
}
const ratingGroupCompoundVariants = []

const ratingGroupSlotNames = [
  [
    "root",
    "chakra-rating-group__root"
  ],
  [
    "label",
    "chakra-rating-group__label"
  ],
  [
    "item",
    "chakra-rating-group__item"
  ],
  [
    "control",
    "chakra-rating-group__control"
  ],
  [
    "itemIndicator",
    "chakra-rating-group__itemIndicator"
  ]
]
const ratingGroupSlotFns = /* @__PURE__ */ ratingGroupSlotNames.map(([slotName, slotKey]) => [slotName, createRecipe(slotKey, ratingGroupDefaultVariants, getSlotCompoundVariant(ratingGroupCompoundVariants, slotName))])

const ratingGroupFn = memo((props = {}) => {
  return Object.fromEntries(ratingGroupSlotFns.map(([slotName, slotFn]) => [slotName, slotFn.recipeFn(props)]))
})

const ratingGroupVariantKeys = [
  "size"
]
const getVariantProps = (variants) => ({ ...ratingGroupDefaultVariants, ...compact(variants) })

export const ratingGroup = /* @__PURE__ */ Object.assign(ratingGroupFn, {
  __recipe__: false,
  __name__: 'ratingGroup',
  raw: (props) => props,
  classNameMap: {},
  variantKeys: ratingGroupVariantKeys,
  variantMap: {
  "size": [
    "xs",
    "sm",
    "md",
    "lg"
  ]
},
  splitVariantProps(props) {
    return splitProps(props, ratingGroupVariantKeys)
  },
  getVariantProps
})