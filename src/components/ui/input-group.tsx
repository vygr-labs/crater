import type { JSXElement } from "solid-js"
import { Dynamic } from "solid-js/web";
import { Box, type BoxProps, type HTMLStyledProps } from "styled-system/jsx"
import { styled } from "styled-system/jsx";

type InputElementProps = HTMLStyledProps<"div">;

export interface InputGroupProps extends BoxProps {
  startElementProps?: InputElementProps
  endElementProps?: InputElementProps
  startElement?: JSXElement
  endElement?: JSXElement
  children: JSXElement
  startOffset?: InputElementProps["paddingStart"]
  endOffset?: InputElementProps["paddingEnd"]
}

const InputElement = (props: HTMLStyledProps<"div">) => <styled.div {...props} />

export const InputGroup = (props: InputGroupProps) => {
    const {
      startElement,
      startElementProps,
      endElement,
      endElementProps,
      children,
      startOffset = "6px",
      endOffset = "6px",
      ...rest
    } = props

    return (
      <Box ref={props.ref} {...rest}>
        {startElement && (
          <InputElement pointerEvents="none" {...startElementProps}>
            {startElement}
          </InputElement>
        )}
        <Dynamic component={children} ps={startElement && `calc(var(--input-height) - ${startOffset})`} pe={endElement && `calc(var(--input-height) - ${endOffset})`} />
        {/* {React.cloneElement(children, {
          ...(startElement && {
            ps: `calc(var(--input-height) - ${startOffset})`,
          }),
          ...(endElement && { pe: `calc(var(--input-height) - ${endOffset})` }),
          ...children.props,
        })} */}
        {endElement && (
          <InputElement placement="end" {...endElementProps}>
            {endElement}
          </InputElement>
        )}
      </Box>
    )
  }
