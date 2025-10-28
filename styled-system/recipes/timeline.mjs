import { compact, getSlotCompoundVariant, memo, splitProps } from '../helpers.mjs';
import { createRecipe } from './create-recipe.mjs';

const timelineDefaultVariants = {
  "size": "md",
  "variant": "solid",
  "showLastSeparator": false
}
const timelineCompoundVariants = []

const timelineSlotNames = [
  [
    "root",
    "chakra-timeline__root"
  ],
  [
    "item",
    "chakra-timeline__item"
  ],
  [
    "content",
    "chakra-timeline__content"
  ],
  [
    "separator",
    "chakra-timeline__separator"
  ],
  [
    "indicator",
    "chakra-timeline__indicator"
  ],
  [
    "connector",
    "chakra-timeline__connector"
  ],
  [
    "title",
    "chakra-timeline__title"
  ],
  [
    "description",
    "chakra-timeline__description"
  ]
]
const timelineSlotFns = /* @__PURE__ */ timelineSlotNames.map(([slotName, slotKey]) => [slotName, createRecipe(slotKey, timelineDefaultVariants, getSlotCompoundVariant(timelineCompoundVariants, slotName))])

const timelineFn = memo((props = {}) => {
  return Object.fromEntries(timelineSlotFns.map(([slotName, slotFn]) => [slotName, slotFn.recipeFn(props)]))
})

const timelineVariantKeys = [
  "variant",
  "showLastSeparator",
  "size"
]
const getVariantProps = (variants) => ({ ...timelineDefaultVariants, ...compact(variants) })

export const timeline = /* @__PURE__ */ Object.assign(timelineFn, {
  __recipe__: false,
  __name__: 'timeline',
  raw: (props) => props,
  classNameMap: {},
  variantKeys: timelineVariantKeys,
  variantMap: {
  "variant": [
    "subtle",
    "solid",
    "outline",
    "plain"
  ],
  "showLastSeparator": [
    "true",
    "false"
  ],
  "size": [
    "sm",
    "md",
    "lg",
    "xl"
  ]
},
  splitVariantProps(props) {
    return splitProps(props, timelineVariantKeys)
  },
  getVariantProps
})