import { compact, getSlotCompoundVariant, memo, splitProps } from '../helpers.mjs';
import { createRecipe } from './create-recipe.mjs';

const selectDefaultVariants = {
  "size": "md",
  "variant": "outline"
}
const selectCompoundVariants = []

const selectSlotNames = [
  [
    "label",
    "chakra-select__label"
  ],
  [
    "positioner",
    "chakra-select__positioner"
  ],
  [
    "trigger",
    "chakra-select__trigger"
  ],
  [
    "indicator",
    "chakra-select__indicator"
  ],
  [
    "clearTrigger",
    "chakra-select__clearTrigger"
  ],
  [
    "item",
    "chakra-select__item"
  ],
  [
    "itemText",
    "chakra-select__itemText"
  ],
  [
    "itemIndicator",
    "chakra-select__itemIndicator"
  ],
  [
    "itemGroup",
    "chakra-select__itemGroup"
  ],
  [
    "itemGroupLabel",
    "chakra-select__itemGroupLabel"
  ],
  [
    "list",
    "chakra-select__list"
  ],
  [
    "content",
    "chakra-select__content"
  ],
  [
    "root",
    "chakra-select__root"
  ],
  [
    "control",
    "chakra-select__control"
  ],
  [
    "valueText",
    "chakra-select__valueText"
  ],
  [
    "indicatorGroup",
    "chakra-select__indicatorGroup"
  ]
]
const selectSlotFns = /* @__PURE__ */ selectSlotNames.map(([slotName, slotKey]) => [slotName, createRecipe(slotKey, selectDefaultVariants, getSlotCompoundVariant(selectCompoundVariants, slotName))])

const selectFn = memo((props = {}) => {
  return Object.fromEntries(selectSlotFns.map(([slotName, slotFn]) => [slotName, slotFn.recipeFn(props)]))
})

const selectVariantKeys = [
  "variant",
  "size"
]
const getVariantProps = (variants) => ({ ...selectDefaultVariants, ...compact(variants) })

export const select = /* @__PURE__ */ Object.assign(selectFn, {
  __recipe__: false,
  __name__: 'select',
  raw: (props) => props,
  classNameMap: {},
  variantKeys: selectVariantKeys,
  variantMap: {
  "variant": [
    "outline",
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
    return splitProps(props, selectVariantKeys)
  },
  getVariantProps
})