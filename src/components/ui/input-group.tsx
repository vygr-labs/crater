import { children, mergeProps, Show, splitProps, type JSXElement } from "solid-js"
import { Box, type BoxProps, type HTMLStyledProps } from "styled-system/jsx"
import { styled } from "styled-system/jsx";

type InputElementProps = HTMLStyledProps<"div">;

export interface InputGroupProps extends BoxProps {
  startElementProps?: InputElementProps
  endElementProps?: InputElementProps
  startElement?: () => JSXElement
  endElement?: () => JSXElement
  children: JSXElement
  startOffset?: InputElementProps["paddingStart"]
  endOffset?: InputElementProps["paddingEnd"]
}

const InputElement = (props: HTMLStyledProps<"div">) => <styled.div {...props} />

export const InputGroup = (_props: InputGroupProps) => {
  const props = mergeProps({startOffset: "6px",
      endOffset: "6px"}, _props)
    const [
      split,
      rest
    ] = splitProps(props, [
      "startElement",
      "startElementProps",
      "endElement",
      "endElementProps",
      "children",
      "startOffset",
      "endOffset"
    ])
    // const resolvedStartElement = children(() => split.startElement);
    // const resolvedEndElement = children(() => split.endElement);


    return (
      <Box ref={props.ref} display="flex" justifyContent="flex-start" alignItems="center" {...rest}>
        <Show when={split.startElement}>
          <Box pointerEvents="none" {...split.startElementProps}>
            {split.startElement?.()}
          </Box>
        </Show>
        <Box w="full" ps={split.startElement ? `calc(var(--input-height) - ${split.startOffset})` : ""} pe={split.endElement ? `calc(var(--input-height) - ${split.endOffset})` : ""}>
          {split.children}
        </Box>
        {/* <Dynamic component={split.children} ps={split.startElement && `calc(var(--input-height) - ${split.startOffset})`} pe={split.endElement && `calc(var(--input-height) - ${split.endOffset})`} /> */}
        {/* {React.cloneElement(children, {
          ...(startElement && {
            ps: `calc(var(--input-height) - ${startOffset})`,
          }),
          ...(endElement && { pe: `calc(var(--input-height) - ${endOffset})` }),
          ...children.props,
        })} */}
        <Show when={split.endElement}>
          <Box placement="end" {...split.endElementProps}>
            {split.endElement?.()}
          </Box>
        </Show>
      </Box>
    )
  }
