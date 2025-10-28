import { compact, getSlotCompoundVariant, memo, splitProps } from '../helpers.mjs';
import { createRecipe } from './create-recipe.mjs';

const emptyStateDefaultVariants = {
  "size": "md"
}
const emptyStateCompoundVariants = []

const emptyStateSlotNames = [
  [
    "root",
    "chakra-empty-state__root"
  ],
  [
    "content",
    "chakra-empty-state__content"
  ],
  [
    "indicator",
    "chakra-empty-state__indicator"
  ],
  [
    "title",
    "chakra-empty-state__title"
  ],
  [
    "description",
    "chakra-empty-state__description"
  ]
]
const emptyStateSlotFns = /* @__PURE__ */ emptyStateSlotNames.map(([slotName, slotKey]) => [slotName, createRecipe(slotKey, emptyStateDefaultVariants, getSlotCompoundVariant(emptyStateCompoundVariants, slotName))])

const emptyStateFn = memo((props = {}) => {
  return Object.fromEntries(emptyStateSlotFns.map(([slotName, slotFn]) => [slotName, slotFn.recipeFn(props)]))
})

const emptyStateVariantKeys = [
  "size"
]
const getVariantProps = (variants) => ({ ...emptyStateDefaultVariants, ...compact(variants) })

export const emptyState = /* @__PURE__ */ Object.assign(emptyStateFn, {
  __recipe__: false,
  __name__: 'emptyState',
  raw: (props) => props,
  classNameMap: {},
  variantKeys: emptyStateVariantKeys,
  variantMap: {
  "size": [
    "sm",
    "md",
    "lg"
  ]
},
  splitVariantProps(props) {
    return splitProps(props, emptyStateVariantKeys)
  },
  getVariantProps
})