import { Toaster } from "@ark-ui/solid"
import { Toast } from "../ui/toast"
import { Dynamic } from "solid-js/web"
import { TbAlertCircle, TbAlertCircleFilled, TbCircleCheckFilled, TbInfoCircleFilled, TbX } from "solid-icons/tb"
import { VsLoading } from "solid-icons/vs"
import { toaster } from "~/utils"
import { css } from "styled-system/css"

export default function RenderToaster() {

    const getIcon = (type: string | undefined) => {
    switch (type) {
      case 'loading':
        return VsLoading
      case 'success':
        return TbCircleCheckFilled
      case 'error':
        return TbAlertCircleFilled
      default:
        return TbInfoCircleFilled
    }
  }

    return (
        <Toaster toaster={toaster} class={css({ w: "full" })}>
        {(toast) => {
          const icon = () => getIcon(toast().type)
          return (
            <Toast.Root>
              <div style={{ display: 'flex', 'align-items': 'flex-start', gap: '12px' }}>
                <Dynamic
                  component={icon()}
                  style={toast().type === 'loading' ? { animation: 'spin 1s linear infinite' } : {}}
                />
                <div style={{ flex: 1 }}>
                  <Toast.Title>{toast().title}</Toast.Title>
                  <Toast.Description>{toast().description}</Toast.Description>
                </div>
                <Toast.CloseTrigger>
                  <TbX />
                </Toast.CloseTrigger>
              </div>
            </Toast.Root>
          )
        }}
      </Toaster>

    )
}