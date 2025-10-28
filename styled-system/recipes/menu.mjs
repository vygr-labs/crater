import { compact, getSlotCompoundVariant, memo, splitProps } from '../helpers.mjs';
import { createRecipe } from './create-recipe.mjs';

const menuDefaultVariants = {
  "size": "md",
  "variant": "subtle"
}
const menuCompoundVariants = []

const menuSlotNames = [
  [
    "arrow",
    "chakra-menu__arrow"
  ],
  [
    "arrowTip",
    "chakra-menu__arrowTip"
  ],
  [
    "content",
    "chakra-menu__content"
  ],
  [
    "contextTrigger",
    "chakra-menu__contextTrigger"
  ],
  [
    "indicator",
    "chakra-menu__indicator"
  ],
  [
    "item",
    "chakra-menu__item"
  ],
  [
    "itemGroup",
    "chakra-menu__itemGroup"
  ],
  [
    "itemGroupLabel",
    "chakra-menu__itemGroupLabel"
  ],
  [
    "itemIndicator",
    "chakra-menu__itemIndicator"
  ],
  [
    "itemText",
    "chakra-menu__itemText"
  ],
  [
    "positioner",
    "chakra-menu__positioner"
  ],
  [
    "separator",
    "chakra-menu__separator"
  ],
  [
    "trigger",
    "chakra-menu__trigger"
  ],
  [
    "triggerItem",
    "chakra-menu__triggerItem"
  ],
  [
    "itemCommand",
    "chakra-menu__itemCommand"
  ]
]
const menuSlotFns = /* @__PURE__ */ menuSlotNames.map(([slotName, slotKey]) => [slotName, createRecipe(slotKey, menuDefaultVariants, getSlotCompoundVariant(menuCompoundVariants, slotName))])

const menuFn = memo((props = {}) => {
  return Object.fromEntries(menuSlotFns.map(([slotName, slotFn]) => [slotName, slotFn.recipeFn(props)]))
})

const menuVariantKeys = [
  "variant",
  "size"
]
const getVariantProps = (variants) => ({ ...menuDefaultVariants, ...compact(variants) })

export const menu = /* @__PURE__ */ Object.assign(menuFn, {
  __recipe__: false,
  __name__: 'menu',
  raw: (props) => props,
  classNameMap: {},
  variantKeys: menuVariantKeys,
  variantMap: {
  "variant": [
    "subtle",
    "solid"
  ],
  "size": [
    "sm",
    "md"
  ]
},
  splitVariantProps(props) {
    return splitProps(props, menuVariantKeys)
  },
  getVariantProps
})