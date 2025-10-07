import { Show, type JSXElement } from "solid-js"
import * as ArkField from "./styled/field"

export interface FieldProps extends Omit<ArkField.RootProps, "label"> {
    label?: JSXElement
    helperText?: JSXElement
    errorText?: JSXElement
    optionalText?: JSXElement
}

export const Field = (props: FieldProps) => {
        const { label, children, helperText, errorText, optionalText, ...rest } =
            props
        return (
            <ArkField.Root ref={props.ref} {...rest}>
                <Show when={props.label}>
                    <ArkField.Label>
                        {props.label}
                        {/* <ArkField.RequiredIndicator fallback={optionalText} /> */}
                    </ArkField.Label>
                </Show>
                {children}
                <Show when={helperText}>
                    <ArkField.HelperText>{helperText}</ArkField.HelperText>
                </Show>
                <Show when={errorText}>
                    <ArkField.ErrorText>{errorText}</ArkField.ErrorText>
                </Show>
            </ArkField.Root>
        )
    }
