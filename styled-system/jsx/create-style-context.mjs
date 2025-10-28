import { cx, css, sva } from '../css/index.mjs';
import { styled } from './factory.mjs';
import { getDisplayName } from './factory-helper.mjs';
import { createComponent, mergeProps } from 'solid-js/web'
import { createContext, useContext, createMemo } from 'solid-js'

export function createStyleContext(recipe) {
  const StyleContext = createContext({})
  const isConfigRecipe = '__recipe__' in recipe
  const svaFn = isConfigRecipe ? recipe : sva(recipe.config)

  const getResolvedProps = (props, slotStyles) => {
    const { unstyled, ...restProps } = props
    if (unstyled) return restProps
    if (isConfigRecipe) {
      return { ...restProps, className: cx(slotStyles, restProps.className) }
    }
    return { ...slotStyles, ...restProps }
  }
  

  const withRootProvider = (Component, options) => {
    const WithRootProvider = (props) => {
      const finalProps = createMemo(() => {
        const [variantProps, restProps] = svaFn.splitVariantProps(props)
        
        const slotStyles = isConfigRecipe ? svaFn(variantProps) : svaFn.raw(variantProps)
        slotStyles._classNameMap = svaFn.classNameMap
        
        const mergedProps = options?.defaultProps ? mergeProps(options.defaultProps, restProps) : restProps
  
        return { mergedProps, slotStyles }
      })

      return createComponent(StyleContext.Provider, {
        value: finalProps().slotStyles,
        get children() {
          return createComponent(
            Component,
            mergeProps(finalProps().mergedProps, {
              get children() {
                return props.children
              },
            }),
          )
        },
      })
    }
    
    const componentName = getDisplayName(Component)
    WithRootProvider.displayName = `withRootProvider(${componentName})`
    
    return WithRootProvider
  }

  const withProvider = (Component, slot, options) => {
    const StyledComponent = styled(Component, {}, options)
    
    const WithProvider = (props) => {
      const finalProps = createMemo(() => {
        const [variantProps, restProps] = svaFn.splitVariantProps(props)

        const slotStyles = isConfigRecipe ? svaFn(variantProps) : svaFn.raw(variantProps)
        slotStyles._classNameMap = svaFn.classNameMap

        const propsWithClass = { ...restProps, class: restProps.class ?? options?.defaultProps?.class }
        const resolvedProps = getResolvedProps(propsWithClass, slotStyles[slot])
        resolvedProps.class = cx(resolvedProps.class, slotStyles._classNameMap[slot])
        
        return { slotStyles, resolvedProps }
      })

      return createComponent(StyleContext.Provider, {
        value: finalProps().slotStyles,
        get children() {
          return createComponent(
            StyledComponent,
            mergeProps(finalProps().resolvedProps, {
              get children() {
                return props.children
              },
            }),
          )
        },
      })
    }
    
    const componentName = getDisplayName(Component)
    WithProvider.displayName = `withProvider(${componentName})`
    
    return WithProvider
  }

  const withContext = (Component, slot, options) => {
    const StyledComponent = styled(Component, {}, options)
    
    const WithContext = (props) => {
      const slotStyles = useContext(StyleContext)
      const finalProps = createMemo(() => {
        const propsWithClass = { ...props, class: props.class ?? options?.defaultProps?.class }
        const resolvedProps = getResolvedProps(propsWithClass, slotStyles[slot])
        resolvedProps.class = cx(resolvedProps.class, slotStyles._classNameMap?.[slot])
        return resolvedProps
      })

      return createComponent(StyledComponent, finalProps())
    }
    
    const componentName = getDisplayName(Component)
    WithContext.displayName = `withContext(${componentName})`
    
    return WithContext
  }

  return {
    withRootProvider,
    withProvider,
    withContext,
  }
}