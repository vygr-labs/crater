import { compact, getSlotCompoundVariant, memo, splitProps } from '../helpers.mjs';
import { createRecipe } from './create-recipe.mjs';

const popoverDefaultVariants = {
  "size": "md"
}
const popoverCompoundVariants = []

const popoverSlotNames = [
  [
    "arrow",
    "chakra-popover__arrow"
  ],
  [
    "arrowTip",
    "chakra-popover__arrowTip"
  ],
  [
    "anchor",
    "chakra-popover__anchor"
  ],
  [
    "trigger",
    "chakra-popover__trigger"
  ],
  [
    "indicator",
    "chakra-popover__indicator"
  ],
  [
    "positioner",
    "chakra-popover__positioner"
  ],
  [
    "content",
    "chakra-popover__content"
  ],
  [
    "title",
    "chakra-popover__title"
  ],
  [
    "description",
    "chakra-popover__description"
  ],
  [
    "closeTrigger",
    "chakra-popover__closeTrigger"
  ],
  [
    "header",
    "chakra-popover__header"
  ],
  [
    "body",
    "chakra-popover__body"
  ],
  [
    "footer",
    "chakra-popover__footer"
  ]
]
const popoverSlotFns = /* @__PURE__ */ popoverSlotNames.map(([slotName, slotKey]) => [slotName, createRecipe(slotKey, popoverDefaultVariants, getSlotCompoundVariant(popoverCompoundVariants, slotName))])

const popoverFn = memo((props = {}) => {
  return Object.fromEntries(popoverSlotFns.map(([slotName, slotFn]) => [slotName, slotFn.recipeFn(props)]))
})

const popoverVariantKeys = [
  "size"
]
const getVariantProps = (variants) => ({ ...popoverDefaultVariants, ...compact(variants) })

export const popover = /* @__PURE__ */ Object.assign(popoverFn, {
  __recipe__: false,
  __name__: 'popover',
  raw: (props) => props,
  classNameMap: {},
  variantKeys: popoverVariantKeys,
  variantMap: {
  "size": [
    "xs",
    "sm",
    "md",
    "lg"
  ]
},
  splitVariantProps(props) {
    return splitProps(props, popoverVariantKeys)
  },
  getVariantProps
})