import { compact, getSlotCompoundVariant, memo, splitProps } from '../helpers.mjs';
import { createRecipe } from './create-recipe.mjs';

const drawerDefaultVariants = {
  "size": "xs",
  "placement": "end"
}
const drawerCompoundVariants = []

const drawerSlotNames = [
  [
    "trigger",
    "chakra-drawer__trigger"
  ],
  [
    "backdrop",
    "chakra-drawer__backdrop"
  ],
  [
    "positioner",
    "chakra-drawer__positioner"
  ],
  [
    "content",
    "chakra-drawer__content"
  ],
  [
    "title",
    "chakra-drawer__title"
  ],
  [
    "description",
    "chakra-drawer__description"
  ],
  [
    "closeTrigger",
    "chakra-drawer__closeTrigger"
  ],
  [
    "header",
    "chakra-drawer__header"
  ],
  [
    "body",
    "chakra-drawer__body"
  ],
  [
    "footer",
    "chakra-drawer__footer"
  ],
  [
    "backdrop",
    "chakra-drawer__backdrop"
  ]
]
const drawerSlotFns = /* @__PURE__ */ drawerSlotNames.map(([slotName, slotKey]) => [slotName, createRecipe(slotKey, drawerDefaultVariants, getSlotCompoundVariant(drawerCompoundVariants, slotName))])

const drawerFn = memo((props = {}) => {
  return Object.fromEntries(drawerSlotFns.map(([slotName, slotFn]) => [slotName, slotFn.recipeFn(props)]))
})

const drawerVariantKeys = [
  "size",
  "placement",
  "contained"
]
const getVariantProps = (variants) => ({ ...drawerDefaultVariants, ...compact(variants) })

export const drawer = /* @__PURE__ */ Object.assign(drawerFn, {
  __recipe__: false,
  __name__: 'drawer',
  raw: (props) => props,
  classNameMap: {},
  variantKeys: drawerVariantKeys,
  variantMap: {
  "size": [
    "xs",
    "sm",
    "md",
    "lg",
    "xl",
    "full"
  ],
  "placement": [
    "start",
    "end",
    "top",
    "bottom"
  ],
  "contained": [
    "true"
  ]
},
  splitVariantProps(props) {
    return splitProps(props, drawerVariantKeys)
  },
  getVariantProps
})