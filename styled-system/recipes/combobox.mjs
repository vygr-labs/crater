import { compact, getSlotCompoundVariant, memo, splitProps } from '../helpers.mjs';
import { createRecipe } from './create-recipe.mjs';

const comboboxDefaultVariants = {
  "size": "md",
  "variant": "outline"
}
const comboboxCompoundVariants = []

const comboboxSlotNames = [
  [
    "root",
    "chakra-combobox__root"
  ],
  [
    "clearTrigger",
    "chakra-combobox__clearTrigger"
  ],
  [
    "content",
    "chakra-combobox__content"
  ],
  [
    "control",
    "chakra-combobox__control"
  ],
  [
    "input",
    "chakra-combobox__input"
  ],
  [
    "item",
    "chakra-combobox__item"
  ],
  [
    "itemGroup",
    "chakra-combobox__itemGroup"
  ],
  [
    "itemGroupLabel",
    "chakra-combobox__itemGroupLabel"
  ],
  [
    "itemIndicator",
    "chakra-combobox__itemIndicator"
  ],
  [
    "itemText",
    "chakra-combobox__itemText"
  ],
  [
    "label",
    "chakra-combobox__label"
  ],
  [
    "list",
    "chakra-combobox__list"
  ],
  [
    "positioner",
    "chakra-combobox__positioner"
  ],
  [
    "trigger",
    "chakra-combobox__trigger"
  ],
  [
    "empty",
    "chakra-combobox__empty"
  ],
  [
    "indicatorGroup",
    "chakra-combobox__indicatorGroup"
  ],
  [
    "empty",
    "chakra-combobox__empty"
  ]
]
const comboboxSlotFns = /* @__PURE__ */ comboboxSlotNames.map(([slotName, slotKey]) => [slotName, createRecipe(slotKey, comboboxDefaultVariants, getSlotCompoundVariant(comboboxCompoundVariants, slotName))])

const comboboxFn = memo((props = {}) => {
  return Object.fromEntries(comboboxSlotFns.map(([slotName, slotFn]) => [slotName, slotFn.recipeFn(props)]))
})

const comboboxVariantKeys = [
  "variant",
  "size"
]
const getVariantProps = (variants) => ({ ...comboboxDefaultVariants, ...compact(variants) })

export const combobox = /* @__PURE__ */ Object.assign(comboboxFn, {
  __recipe__: false,
  __name__: 'combobox',
  raw: (props) => props,
  classNameMap: {},
  variantKeys: comboboxVariantKeys,
  variantMap: {
  "variant": [
    "outline",
    "subtle",
    "flushed"
  ],
  "size": [
    "xs",
    "sm",
    "md",
    "lg"
  ]
},
  splitVariantProps(props) {
    return splitProps(props, comboboxVariantKeys)
  },
  getVariantProps
})