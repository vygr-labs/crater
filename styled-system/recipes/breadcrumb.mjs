import { compact, getSlotCompoundVariant, memo, splitProps } from '../helpers.mjs';
import { createRecipe } from './create-recipe.mjs';

const breadcrumbDefaultVariants = {
  "variant": "plain",
  "size": "md"
}
const breadcrumbCompoundVariants = []

const breadcrumbSlotNames = [
  [
    "link",
    "chakra-breadcrumb__link"
  ],
  [
    "currentLink",
    "chakra-breadcrumb__currentLink"
  ],
  [
    "item",
    "chakra-breadcrumb__item"
  ],
  [
    "list",
    "chakra-breadcrumb__list"
  ],
  [
    "root",
    "chakra-breadcrumb__root"
  ],
  [
    "ellipsis",
    "chakra-breadcrumb__ellipsis"
  ],
  [
    "separator",
    "chakra-breadcrumb__separator"
  ]
]
const breadcrumbSlotFns = /* @__PURE__ */ breadcrumbSlotNames.map(([slotName, slotKey]) => [slotName, createRecipe(slotKey, breadcrumbDefaultVariants, getSlotCompoundVariant(breadcrumbCompoundVariants, slotName))])

const breadcrumbFn = memo((props = {}) => {
  return Object.fromEntries(breadcrumbSlotFns.map(([slotName, slotFn]) => [slotName, slotFn.recipeFn(props)]))
})

const breadcrumbVariantKeys = [
  "variant",
  "size"
]
const getVariantProps = (variants) => ({ ...breadcrumbDefaultVariants, ...compact(variants) })

export const breadcrumb = /* @__PURE__ */ Object.assign(breadcrumbFn, {
  __recipe__: false,
  __name__: 'breadcrumb',
  raw: (props) => props,
  classNameMap: {},
  variantKeys: breadcrumbVariantKeys,
  variantMap: {
  "variant": [
    "underline",
    "plain"
  ],
  "size": [
    "sm",
    "md",
    "lg"
  ]
},
  splitVariantProps(props) {
    return splitProps(props, breadcrumbVariantKeys)
  },
  getVariantProps
})