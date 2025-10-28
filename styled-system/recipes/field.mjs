import { compact, getSlotCompoundVariant, memo, splitProps } from '../helpers.mjs';
import { createRecipe } from './create-recipe.mjs';

const fieldDefaultVariants = {
  "orientation": "vertical"
}
const fieldCompoundVariants = []

const fieldSlotNames = [
  [
    "root",
    "chakra-field__root"
  ],
  [
    "errorText",
    "chakra-field__errorText"
  ],
  [
    "helperText",
    "chakra-field__helperText"
  ],
  [
    "input",
    "chakra-field__input"
  ],
  [
    "label",
    "chakra-field__label"
  ],
  [
    "select",
    "chakra-field__select"
  ],
  [
    "textarea",
    "chakra-field__textarea"
  ],
  [
    "requiredIndicator",
    "chakra-field__requiredIndicator"
  ],
  [
    "requiredIndicator",
    "chakra-field__requiredIndicator"
  ]
]
const fieldSlotFns = /* @__PURE__ */ fieldSlotNames.map(([slotName, slotKey]) => [slotName, createRecipe(slotKey, fieldDefaultVariants, getSlotCompoundVariant(fieldCompoundVariants, slotName))])

const fieldFn = memo((props = {}) => {
  return Object.fromEntries(fieldSlotFns.map(([slotName, slotFn]) => [slotName, slotFn.recipeFn(props)]))
})

const fieldVariantKeys = [
  "orientation"
]
const getVariantProps = (variants) => ({ ...fieldDefaultVariants, ...compact(variants) })

export const field = /* @__PURE__ */ Object.assign(fieldFn, {
  __recipe__: false,
  __name__: 'field',
  raw: (props) => props,
  classNameMap: {},
  variantKeys: fieldVariantKeys,
  variantMap: {
  "orientation": [
    "vertical",
    "horizontal"
  ]
},
  splitVariantProps(props) {
    return splitProps(props, fieldVariantKeys)
  },
  getVariantProps
})