import { compact, getSlotCompoundVariant, memo, splitProps } from '../helpers.mjs';
import { createRecipe } from './create-recipe.mjs';

const cardDefaultVariants = {
  "variant": "outline",
  "size": "md"
}
const cardCompoundVariants = []

const cardSlotNames = [
  [
    "root",
    "chakra-card__root"
  ],
  [
    "header",
    "chakra-card__header"
  ],
  [
    "body",
    "chakra-card__body"
  ],
  [
    "footer",
    "chakra-card__footer"
  ],
  [
    "title",
    "chakra-card__title"
  ],
  [
    "description",
    "chakra-card__description"
  ]
]
const cardSlotFns = /* @__PURE__ */ cardSlotNames.map(([slotName, slotKey]) => [slotName, createRecipe(slotKey, cardDefaultVariants, getSlotCompoundVariant(cardCompoundVariants, slotName))])

const cardFn = memo((props = {}) => {
  return Object.fromEntries(cardSlotFns.map(([slotName, slotFn]) => [slotName, slotFn.recipeFn(props)]))
})

const cardVariantKeys = [
  "size",
  "variant"
]
const getVariantProps = (variants) => ({ ...cardDefaultVariants, ...compact(variants) })

export const card = /* @__PURE__ */ Object.assign(cardFn, {
  __recipe__: false,
  __name__: 'card',
  raw: (props) => props,
  classNameMap: {},
  variantKeys: cardVariantKeys,
  variantMap: {
  "size": [
    "sm",
    "md",
    "lg"
  ],
  "variant": [
    "elevated",
    "outline",
    "subtle"
  ]
},
  splitVariantProps(props) {
    return splitProps(props, cardVariantKeys)
  },
  getVariantProps
})