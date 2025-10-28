import { compact, getSlotCompoundVariant, memo, splitProps } from '../helpers.mjs';
import { createRecipe } from './create-recipe.mjs';

const tableDefaultVariants = {
  "variant": "line",
  "size": "md"
}
const tableCompoundVariants = []

const tableSlotNames = [
  [
    "root",
    "chakra-table__root"
  ],
  [
    "header",
    "chakra-table__header"
  ],
  [
    "body",
    "chakra-table__body"
  ],
  [
    "row",
    "chakra-table__row"
  ],
  [
    "columnHeader",
    "chakra-table__columnHeader"
  ],
  [
    "cell",
    "chakra-table__cell"
  ],
  [
    "footer",
    "chakra-table__footer"
  ],
  [
    "caption",
    "chakra-table__caption"
  ]
]
const tableSlotFns = /* @__PURE__ */ tableSlotNames.map(([slotName, slotKey]) => [slotName, createRecipe(slotKey, tableDefaultVariants, getSlotCompoundVariant(tableCompoundVariants, slotName))])

const tableFn = memo((props = {}) => {
  return Object.fromEntries(tableSlotFns.map(([slotName, slotFn]) => [slotName, slotFn.recipeFn(props)]))
})

const tableVariantKeys = [
  "interactive",
  "stickyHeader",
  "striped",
  "showColumnBorder",
  "variant",
  "size"
]
const getVariantProps = (variants) => ({ ...tableDefaultVariants, ...compact(variants) })

export const table = /* @__PURE__ */ Object.assign(tableFn, {
  __recipe__: false,
  __name__: 'table',
  raw: (props) => props,
  classNameMap: {},
  variantKeys: tableVariantKeys,
  variantMap: {
  "interactive": [
    "true"
  ],
  "stickyHeader": [
    "true"
  ],
  "striped": [
    "true"
  ],
  "showColumnBorder": [
    "true"
  ],
  "variant": [
    "line",
    "outline"
  ],
  "size": [
    "sm",
    "md",
    "lg"
  ]
},
  splitVariantProps(props) {
    return splitProps(props, tableVariantKeys)
  },
  getVariantProps
})