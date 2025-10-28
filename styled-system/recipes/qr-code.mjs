import { compact, getSlotCompoundVariant, memo, splitProps } from '../helpers.mjs';
import { createRecipe } from './create-recipe.mjs';

const qrCodeDefaultVariants = {
  "size": "md"
}
const qrCodeCompoundVariants = []

const qrCodeSlotNames = [
  [
    "root",
    "chakra-qr-code__root"
  ],
  [
    "frame",
    "chakra-qr-code__frame"
  ],
  [
    "pattern",
    "chakra-qr-code__pattern"
  ],
  [
    "overlay",
    "chakra-qr-code__overlay"
  ],
  [
    "downloadTrigger",
    "chakra-qr-code__downloadTrigger"
  ]
]
const qrCodeSlotFns = /* @__PURE__ */ qrCodeSlotNames.map(([slotName, slotKey]) => [slotName, createRecipe(slotKey, qrCodeDefaultVariants, getSlotCompoundVariant(qrCodeCompoundVariants, slotName))])

const qrCodeFn = memo((props = {}) => {
  return Object.fromEntries(qrCodeSlotFns.map(([slotName, slotFn]) => [slotName, slotFn.recipeFn(props)]))
})

const qrCodeVariantKeys = [
  "size"
]
const getVariantProps = (variants) => ({ ...qrCodeDefaultVariants, ...compact(variants) })

export const qrCode = /* @__PURE__ */ Object.assign(qrCodeFn, {
  __recipe__: false,
  __name__: 'qrCode',
  raw: (props) => props,
  classNameMap: {},
  variantKeys: qrCodeVariantKeys,
  variantMap: {
  "size": [
    "2xs",
    "xs",
    "sm",
    "md",
    "lg",
    "xl",
    "2xl",
    "full"
  ]
},
  splitVariantProps(props) {
    return splitProps(props, qrCodeVariantKeys)
  },
  getVariantProps
})