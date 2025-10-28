import { compact, getSlotCompoundVariant, memo, splitProps } from '../helpers.mjs';
import { createRecipe } from './create-recipe.mjs';

const stepsDefaultVariants = {
  "size": "md",
  "variant": "solid",
  "orientation": "horizontal"
}
const stepsCompoundVariants = []

const stepsSlotNames = [
  [
    "root",
    "chakra-steps__root"
  ],
  [
    "list",
    "chakra-steps__list"
  ],
  [
    "item",
    "chakra-steps__item"
  ],
  [
    "trigger",
    "chakra-steps__trigger"
  ],
  [
    "indicator",
    "chakra-steps__indicator"
  ],
  [
    "separator",
    "chakra-steps__separator"
  ],
  [
    "content",
    "chakra-steps__content"
  ],
  [
    "title",
    "chakra-steps__title"
  ],
  [
    "description",
    "chakra-steps__description"
  ],
  [
    "nextTrigger",
    "chakra-steps__nextTrigger"
  ],
  [
    "prevTrigger",
    "chakra-steps__prevTrigger"
  ],
  [
    "progress",
    "chakra-steps__progress"
  ]
]
const stepsSlotFns = /* @__PURE__ */ stepsSlotNames.map(([slotName, slotKey]) => [slotName, createRecipe(slotKey, stepsDefaultVariants, getSlotCompoundVariant(stepsCompoundVariants, slotName))])

const stepsFn = memo((props = {}) => {
  return Object.fromEntries(stepsSlotFns.map(([slotName, slotFn]) => [slotName, slotFn.recipeFn(props)]))
})

const stepsVariantKeys = [
  "orientation",
  "variant",
  "size"
]
const getVariantProps = (variants) => ({ ...stepsDefaultVariants, ...compact(variants) })

export const steps = /* @__PURE__ */ Object.assign(stepsFn, {
  __recipe__: false,
  __name__: 'steps',
  raw: (props) => props,
  classNameMap: {},
  variantKeys: stepsVariantKeys,
  variantMap: {
  "orientation": [
    "vertical",
    "horizontal"
  ],
  "variant": [
    "solid",
    "subtle"
  ],
  "size": [
    "xs",
    "sm",
    "md",
    "lg"
  ]
},
  splitVariantProps(props) {
    return splitProps(props, stepsVariantKeys)
  },
  getVariantProps
})