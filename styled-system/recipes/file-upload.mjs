import { compact, getSlotCompoundVariant, memo, splitProps } from '../helpers.mjs';
import { createRecipe } from './create-recipe.mjs';

const fileUploadDefaultVariants = {}
const fileUploadCompoundVariants = []

const fileUploadSlotNames = [
  [
    "root",
    "chakra-file-upload__root"
  ],
  [
    "dropzone",
    "chakra-file-upload__dropzone"
  ],
  [
    "item",
    "chakra-file-upload__item"
  ],
  [
    "itemDeleteTrigger",
    "chakra-file-upload__itemDeleteTrigger"
  ],
  [
    "itemGroup",
    "chakra-file-upload__itemGroup"
  ],
  [
    "itemName",
    "chakra-file-upload__itemName"
  ],
  [
    "itemPreview",
    "chakra-file-upload__itemPreview"
  ],
  [
    "itemPreviewImage",
    "chakra-file-upload__itemPreviewImage"
  ],
  [
    "itemSizeText",
    "chakra-file-upload__itemSizeText"
  ],
  [
    "label",
    "chakra-file-upload__label"
  ],
  [
    "trigger",
    "chakra-file-upload__trigger"
  ],
  [
    "clearTrigger",
    "chakra-file-upload__clearTrigger"
  ],
  [
    "itemContent",
    "chakra-file-upload__itemContent"
  ],
  [
    "dropzoneContent",
    "chakra-file-upload__dropzoneContent"
  ],
  [
    "fileText",
    "chakra-file-upload__fileText"
  ]
]
const fileUploadSlotFns = /* @__PURE__ */ fileUploadSlotNames.map(([slotName, slotKey]) => [slotName, createRecipe(slotKey, fileUploadDefaultVariants, getSlotCompoundVariant(fileUploadCompoundVariants, slotName))])

const fileUploadFn = memo((props = {}) => {
  return Object.fromEntries(fileUploadSlotFns.map(([slotName, slotFn]) => [slotName, slotFn.recipeFn(props)]))
})

const fileUploadVariantKeys = []
const getVariantProps = (variants) => ({ ...fileUploadDefaultVariants, ...compact(variants) })

export const fileUpload = /* @__PURE__ */ Object.assign(fileUploadFn, {
  __recipe__: false,
  __name__: 'fileUpload',
  raw: (props) => props,
  classNameMap: {},
  variantKeys: fileUploadVariantKeys,
  variantMap: {},
  splitVariantProps(props) {
    return splitProps(props, fileUploadVariantKeys)
  },
  getVariantProps
})