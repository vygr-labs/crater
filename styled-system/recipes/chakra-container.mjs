import { memo, splitProps } from '../helpers.mjs';
import { createRecipe, mergeRecipes } from './create-recipe.mjs';

const chakraContainerFn = /* @__PURE__ */ createRecipe('chakra-container', {}, [])

const chakraContainerVariantMap = {
  "centerContent": [
    "true"
  ],
  "fluid": [
    "true"
  ]
}

const chakraContainerVariantKeys = Object.keys(chakraContainerVariantMap)

export const chakraContainer = /* @__PURE__ */ Object.assign(memo(chakraContainerFn.recipeFn), {
  __recipe__: true,
  __name__: 'chakraContainer',
  __getCompoundVariantCss__: chakraContainerFn.__getCompoundVariantCss__,
  raw: (props) => props,
  variantKeys: chakraContainerVariantKeys,
  variantMap: chakraContainerVariantMap,
  merge(recipe) {
    return mergeRecipes(this, recipe)
  },
  splitVariantProps(props) {
    return splitProps(props, chakraContainerVariantKeys)
  },
  getVariantProps: chakraContainerFn.getVariantProps,
})