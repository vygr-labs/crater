import { compact, getSlotCompoundVariant, memo, splitProps } from '../helpers.mjs';
import { createRecipe } from './create-recipe.mjs';

const numberInputDefaultVariants = {
  "size": "md",
  "variant": "outline"
}
const numberInputCompoundVariants = []

const numberInputSlotNames = [
  [
    "root",
    "chakra-number-input__root"
  ],
  [
    "label",
    "chakra-number-input__label"
  ],
  [
    "input",
    "chakra-number-input__input"
  ],
  [
    "control",
    "chakra-number-input__control"
  ],
  [
    "valueText",
    "chakra-number-input__valueText"
  ],
  [
    "incrementTrigger",
    "chakra-number-input__incrementTrigger"
  ],
  [
    "decrementTrigger",
    "chakra-number-input__decrementTrigger"
  ],
  [
    "scrubber",
    "chakra-number-input__scrubber"
  ]
]
const numberInputSlotFns = /* @__PURE__ */ numberInputSlotNames.map(([slotName, slotKey]) => [slotName, createRecipe(slotKey, numberInputDefaultVariants, getSlotCompoundVariant(numberInputCompoundVariants, slotName))])

const numberInputFn = memo((props = {}) => {
  return Object.fromEntries(numberInputSlotFns.map(([slotName, slotFn]) => [slotName, slotFn.recipeFn(props)]))
})

const numberInputVariantKeys = [
  "size",
  "variant"
]
const getVariantProps = (variants) => ({ ...numberInputDefaultVariants, ...compact(variants) })

export const numberInput = /* @__PURE__ */ Object.assign(numberInputFn, {
  __recipe__: false,
  __name__: 'numberInput',
  raw: (props) => props,
  classNameMap: {},
  variantKeys: numberInputVariantKeys,
  variantMap: {
  "size": [
    "xs",
    "sm",
    "md",
    "lg"
  ],
  "variant": [
    "outline",
    "subtle",
    "flushed"
  ]
},
  splitVariantProps(props) {
    return splitProps(props, numberInputVariantKeys)
  },
  getVariantProps
})