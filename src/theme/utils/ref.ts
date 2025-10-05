import type { JSXElement } from "solid-js"

export function getElementRef(el: JSXElement) {
  // const version = React.version
  // if (!isString(version)) return (el as any)?.ref
  // if (version.startsWith("18.")) return (el as any)?.ref
  return (el as any)?.props?.ref
}
