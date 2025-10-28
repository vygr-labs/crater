import { compact, getSlotCompoundVariant, memo, splitProps } from '../helpers.mjs';
import { createRecipe } from './create-recipe.mjs';

const sliderDefaultVariants = {
  "size": "md",
  "variant": "outline",
  "orientation": "horizontal"
}
const sliderCompoundVariants = []

const sliderSlotNames = [
  [
    "root",
    "chakra-slider__root"
  ],
  [
    "label",
    "chakra-slider__label"
  ],
  [
    "thumb",
    "chakra-slider__thumb"
  ],
  [
    "valueText",
    "chakra-slider__valueText"
  ],
  [
    "track",
    "chakra-slider__track"
  ],
  [
    "range",
    "chakra-slider__range"
  ],
  [
    "control",
    "chakra-slider__control"
  ],
  [
    "markerGroup",
    "chakra-slider__markerGroup"
  ],
  [
    "marker",
    "chakra-slider__marker"
  ],
  [
    "draggingIndicator",
    "chakra-slider__draggingIndicator"
  ],
  [
    "markerIndicator",
    "chakra-slider__markerIndicator"
  ]
]
const sliderSlotFns = /* @__PURE__ */ sliderSlotNames.map(([slotName, slotKey]) => [slotName, createRecipe(slotKey, sliderDefaultVariants, getSlotCompoundVariant(sliderCompoundVariants, slotName))])

const sliderFn = memo((props = {}) => {
  return Object.fromEntries(sliderSlotFns.map(([slotName, slotFn]) => [slotName, slotFn.recipeFn(props)]))
})

const sliderVariantKeys = [
  "size",
  "variant",
  "orientation"
]
const getVariantProps = (variants) => ({ ...sliderDefaultVariants, ...compact(variants) })

export const slider = /* @__PURE__ */ Object.assign(sliderFn, {
  __recipe__: false,
  __name__: 'slider',
  raw: (props) => props,
  classNameMap: {},
  variantKeys: sliderVariantKeys,
  variantMap: {
  "size": [
    "sm",
    "md",
    "lg"
  ],
  "variant": [
    "outline",
    "solid"
  ],
  "orientation": [
    "vertical",
    "horizontal"
  ]
},
  splitVariantProps(props) {
    return splitProps(props, sliderVariantKeys)
  },
  getVariantProps
})