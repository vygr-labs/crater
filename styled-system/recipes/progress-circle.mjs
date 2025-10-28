import { compact, getSlotCompoundVariant, memo, splitProps } from '../helpers.mjs';
import { createRecipe } from './create-recipe.mjs';

const progressCircleDefaultVariants = {
  "size": "md"
}
const progressCircleCompoundVariants = []

const progressCircleSlotNames = [
  [
    "root",
    "chakra-progress-circle__root"
  ],
  [
    "label",
    "chakra-progress-circle__label"
  ],
  [
    "track",
    "chakra-progress-circle__track"
  ],
  [
    "range",
    "chakra-progress-circle__range"
  ],
  [
    "valueText",
    "chakra-progress-circle__valueText"
  ],
  [
    "view",
    "chakra-progress-circle__view"
  ],
  [
    "circle",
    "chakra-progress-circle__circle"
  ],
  [
    "circleTrack",
    "chakra-progress-circle__circleTrack"
  ],
  [
    "circleRange",
    "chakra-progress-circle__circleRange"
  ]
]
const progressCircleSlotFns = /* @__PURE__ */ progressCircleSlotNames.map(([slotName, slotKey]) => [slotName, createRecipe(slotKey, progressCircleDefaultVariants, getSlotCompoundVariant(progressCircleCompoundVariants, slotName))])

const progressCircleFn = memo((props = {}) => {
  return Object.fromEntries(progressCircleSlotFns.map(([slotName, slotFn]) => [slotName, slotFn.recipeFn(props)]))
})

const progressCircleVariantKeys = [
  "size"
]
const getVariantProps = (variants) => ({ ...progressCircleDefaultVariants, ...compact(variants) })

export const progressCircle = /* @__PURE__ */ Object.assign(progressCircleFn, {
  __recipe__: false,
  __name__: 'progressCircle',
  raw: (props) => props,
  classNameMap: {},
  variantKeys: progressCircleVariantKeys,
  variantMap: {
  "size": [
    "xs",
    "sm",
    "md",
    "lg",
    "xl"
  ]
},
  splitVariantProps(props) {
    return splitProps(props, progressCircleVariantKeys)
  },
  getVariantProps
})