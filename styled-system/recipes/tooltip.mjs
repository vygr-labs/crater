import { compact, getSlotCompoundVariant, memo, splitProps } from '../helpers.mjs';
import { createRecipe } from './create-recipe.mjs';

const tooltipDefaultVariants = {}
const tooltipCompoundVariants = []

const tooltipSlotNames = [
  [
    "trigger",
    "chakra-tooltip__trigger"
  ],
  [
    "arrow",
    "chakra-tooltip__arrow"
  ],
  [
    "arrowTip",
    "chakra-tooltip__arrowTip"
  ],
  [
    "positioner",
    "chakra-tooltip__positioner"
  ],
  [
    "content",
    "chakra-tooltip__content"
  ]
]
const tooltipSlotFns = /* @__PURE__ */ tooltipSlotNames.map(([slotName, slotKey]) => [slotName, createRecipe(slotKey, tooltipDefaultVariants, getSlotCompoundVariant(tooltipCompoundVariants, slotName))])

const tooltipFn = memo((props = {}) => {
  return Object.fromEntries(tooltipSlotFns.map(([slotName, slotFn]) => [slotName, slotFn.recipeFn(props)]))
})

const tooltipVariantKeys = []
const getVariantProps = (variants) => ({ ...tooltipDefaultVariants, ...compact(variants) })

export const tooltip = /* @__PURE__ */ Object.assign(tooltipFn, {
  __recipe__: false,
  __name__: 'tooltip',
  raw: (props) => props,
  classNameMap: {},
  variantKeys: tooltipVariantKeys,
  variantMap: {},
  splitVariantProps(props) {
    return splitProps(props, tooltipVariantKeys)
  },
  getVariantProps
})