import { compact, getSlotCompoundVariant, memo, splitProps } from '../helpers.mjs';
import { createRecipe } from './create-recipe.mjs';

const accordionDefaultVariants = {
  "size": "md",
  "variant": "outline"
}
const accordionCompoundVariants = []

const accordionSlotNames = [
  [
    "root",
    "chakra-accordion__root"
  ],
  [
    "item",
    "chakra-accordion__item"
  ],
  [
    "itemTrigger",
    "chakra-accordion__itemTrigger"
  ],
  [
    "itemContent",
    "chakra-accordion__itemContent"
  ],
  [
    "itemIndicator",
    "chakra-accordion__itemIndicator"
  ],
  [
    "itemBody",
    "chakra-accordion__itemBody"
  ]
]
const accordionSlotFns = /* @__PURE__ */ accordionSlotNames.map(([slotName, slotKey]) => [slotName, createRecipe(slotKey, accordionDefaultVariants, getSlotCompoundVariant(accordionCompoundVariants, slotName))])

const accordionFn = memo((props = {}) => {
  return Object.fromEntries(accordionSlotFns.map(([slotName, slotFn]) => [slotName, slotFn.recipeFn(props)]))
})

const accordionVariantKeys = [
  "variant",
  "size"
]
const getVariantProps = (variants) => ({ ...accordionDefaultVariants, ...compact(variants) })

export const accordion = /* @__PURE__ */ Object.assign(accordionFn, {
  __recipe__: false,
  __name__: 'accordion',
  raw: (props) => props,
  classNameMap: {},
  variantKeys: accordionVariantKeys,
  variantMap: {
  "variant": [
    "outline",
    "subtle",
    "enclosed",
    "plain"
  ],
  "size": [
    "sm",
    "md",
    "lg"
  ]
},
  splitVariantProps(props) {
    return splitProps(props, accordionVariantKeys)
  },
  getVariantProps
})