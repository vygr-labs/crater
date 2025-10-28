import { compact, getSlotCompoundVariant, memo, splitProps } from '../helpers.mjs';
import { createRecipe } from './create-recipe.mjs';

const listboxDefaultVariants = {
  "variant": "subtle"
}
const listboxCompoundVariants = []

const listboxSlotNames = [
  [
    "label",
    "chakra-listbox__label"
  ],
  [
    "input",
    "chakra-listbox__input"
  ],
  [
    "item",
    "chakra-listbox__item"
  ],
  [
    "itemText",
    "chakra-listbox__itemText"
  ],
  [
    "itemIndicator",
    "chakra-listbox__itemIndicator"
  ],
  [
    "itemGroup",
    "chakra-listbox__itemGroup"
  ],
  [
    "itemGroupLabel",
    "chakra-listbox__itemGroupLabel"
  ],
  [
    "content",
    "chakra-listbox__content"
  ],
  [
    "root",
    "chakra-listbox__root"
  ],
  [
    "valueText",
    "chakra-listbox__valueText"
  ],
  [
    "empty",
    "chakra-listbox__empty"
  ]
]
const listboxSlotFns = /* @__PURE__ */ listboxSlotNames.map(([slotName, slotKey]) => [slotName, createRecipe(slotKey, listboxDefaultVariants, getSlotCompoundVariant(listboxCompoundVariants, slotName))])

const listboxFn = memo((props = {}) => {
  return Object.fromEntries(listboxSlotFns.map(([slotName, slotFn]) => [slotName, slotFn.recipeFn(props)]))
})

const listboxVariantKeys = [
  "variant"
]
const getVariantProps = (variants) => ({ ...listboxDefaultVariants, ...compact(variants) })

export const listbox = /* @__PURE__ */ Object.assign(listboxFn, {
  __recipe__: false,
  __name__: 'listbox',
  raw: (props) => props,
  classNameMap: {},
  variantKeys: listboxVariantKeys,
  variantMap: {
  "variant": [
    "subtle",
    "solid",
    "plain"
  ]
},
  splitVariantProps(props) {
    return splitProps(props, listboxVariantKeys)
  },
  getVariantProps
})