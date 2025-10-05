import { comboboxAnatomy as arkComboboxAnatomy } from "@ark-ui/solid/anatomy"
import { accordionAnatomy as arkAccordionAnatomy } from "@ark-ui/solid/anatomy"
import { createAnatomy } from "@ark-ui/solid/anatomy"
import { clipboardAnatomy as arkClipboardAnatomy } from "@ark-ui/solid/anatomy"
import { colorPickerAnatomy as arkColorPickerAnatomy } from "@ark-ui/solid/anatomy"
import { dialogAnatomy as arkDialogAnatomy } from "@ark-ui/solid/anatomy"
import { editableAnatomy as arkEditableAnatomy } from "@ark-ui/solid/anatomy"
import { fieldAnatomy as arkFieldAnatomy } from "@ark-ui/solid/anatomy"
import { fieldsetAnatomy as arkFieldsetAnatomy } from "@ark-ui/solid/anatomy"
import { fileUploadAnatomy as arkFileUploadAnatomy } from "@ark-ui/solid/anatomy"
import { listboxAnatomy as arkListboxAnatomy } from "@ark-ui/solid/anatomy"
import { menuAnatomy as arkMenuAnatomy } from "@ark-ui/solid/anatomy"
import { popoverAnatomy as arkPopoverAnatomy } from "@ark-ui/solid/anatomy"
import { radioGroupAnatomy as arkRadioGroupAnatomy } from "@ark-ui/solid/anatomy"
import { ratingGroupAnatomy as arkRatingGroupAnatomy } from "@ark-ui/solid/anatomy"
import { selectAnatomy as arkSelectAnatomy } from "@ark-ui/solid/anatomy"
import { sliderAnatomy as arkSliderAnatomy } from "@ark-ui/solid/anatomy"
import { switchAnatomy as arkSwitchAnatomy } from "@ark-ui/solid/anatomy"

export const accordionAnatomy = arkAccordionAnatomy.extendWith("itemBody")

export const actionBarAnatomy = createAnatomy("action-bar").parts(
  "positioner",
  "content",
  "separator",
  "selectionTrigger",
  "closeTrigger",
)

export const alertAnatomy = createAnatomy("alert").parts(
  "title",
  "description",
  "root",
  "indicator",
  "content",
)

export const breadcrumbAnatomy = createAnatomy("breadcrumb").parts(
  "link",
  "currentLink",
  "item",
  "list",
  "root",
  "ellipsis",
  "separator",
)

export const blockquoteAnatomy = createAnatomy("blockquote").parts(
  "root",
  "icon",
  "content",
  "caption",
)

export const cardAnatomy = createAnatomy("card").parts(
  "root",
  "header",
  "body",
  "footer",
  "title",
  "description",
)

export const checkboxCardAnatomy = createAnatomy("checkbox-card", [
  "root",
  "control",
  "label",
  "description",
  "addon",
  "indicator",
  "content",
])

export const dataListAnatomy = createAnatomy("data-list").parts(
  "root",
  "item",
  "itemLabel",
  "itemValue",
)

export const dialogAnatomy = arkDialogAnatomy.extendWith(
  "header",
  "body",
  "footer",
  "backdrop",
)

export const drawerAnatomy = arkDialogAnatomy.extendWith(
  "header",
  "body",
  "footer",
  "backdrop",
)

export const editableAnatomy = arkEditableAnatomy.extendWith("textarea")

export const emptyStateAnatomy = createAnatomy("empty-state", [
  "root",
  "content",
  "indicator",
  "title",
  "description",
])

export const fieldAnatomy = arkFieldAnatomy.extendWith("requiredIndicator")

export const fieldsetAnatomy = arkFieldsetAnatomy.extendWith("content")

export const fileUploadAnatomy = arkFileUploadAnatomy.extendWith(
  "itemContent",
  "dropzoneContent",
  "fileText",
)

export const listAnatomy = createAnatomy("list").parts(
  "root",
  "item",
  "indicator",
)

export const menuAnatomy = arkMenuAnatomy.extendWith("itemCommand")

export const nativeSelectAnatomy = createAnatomy("select").parts(
  "root",
  "field",
  "indicator",
)

export const popoverAnatomy = arkPopoverAnatomy.extendWith(
  "header",
  "body",
  "footer",
)

export const radioGroupAnatomy = arkRadioGroupAnatomy.extendWith(
  "itemAddon",
  "itemIndicator",
)

export const radioCardAnatomy = radioGroupAnatomy.extendWith(
  "itemContent",
  "itemDescription",
)

export const ratingGroupAnatomy =
  arkRatingGroupAnatomy.extendWith("itemIndicator")

export const selectAnatomy = arkSelectAnatomy.extendWith("indicatorGroup")

export const comboboxAnatomy = arkComboboxAnatomy.extendWith(
  "indicatorGroup",
  "empty",
)

export const sliderAnatomy = arkSliderAnatomy.extendWith("markerIndicator")

export const statAnatomy = createAnatomy("stat").parts(
  "root",
  "label",
  "helpText",
  "valueText",
  "valueUnit",
  "indicator",
)

export const statusAnatomy = createAnatomy("status").parts("root", "indicator")

export const stepsAnatomy = createAnatomy("steps", [
  "root",
  "list",
  "item",
  "trigger",
  "indicator",
  "separator",
  "content",
  "title",
  "description",
  "nextTrigger",
  "prevTrigger",
  "progress",
])

export const switchAnatomy = arkSwitchAnatomy.extendWith("indicator")

export const tableAnatomy = createAnatomy("table").parts(
  "root",
  "header",
  "body",
  "row",
  "columnHeader",
  "cell",
  "footer",
  "caption",
)

export const toastAnatomy = createAnatomy("toast").parts(
  "root",
  "title",
  "description",
  "indicator",
  "closeTrigger",
  "actionTrigger",
)

export const tabsAnatomy = createAnatomy("tabs").parts(
  "root",
  "trigger",
  "list",
  "content",
  "contentGroup",
  "indicator",
)

export const tagAnatomy = createAnatomy("tag").parts(
  "root",
  "label",
  "closeTrigger",
  "startElement",
  "endElement",
)

export const timelineAnatomy = createAnatomy("timeline").parts(
  "root",
  "item",
  "content",
  "separator",
  "indicator",
  "connector",
  "title",
  "description",
)

export const colorPickerAnatomy =
  arkColorPickerAnatomy.extendWith("channelText")

export const codeBlockAnatomy = createAnatomy("code-block", [
  "root",
  "content",
  "title",
  "header",
  "footer",
  "control",
  "overlay",
  "code",
  "codeText",
  "copyTrigger",
  "copyIndicator",
  "collapseTrigger",
  "collapseIndicator",
  "collapseText",
])

export { treeViewAnatomy } from "@ark-ui/solid/anatomy"
export { avatarAnatomy } from "@ark-ui/solid/anatomy"
export { checkboxAnatomy } from "@ark-ui/solid/anatomy"
export { collapsibleAnatomy } from "@ark-ui/solid/anatomy"
export { hoverCardAnatomy } from "@ark-ui/solid/anatomy"
export { numberInputAnatomy } from "@ark-ui/solid/anatomy"
export { pinInputAnatomy } from "@ark-ui/solid/anatomy"
export { progressAnatomy } from "@ark-ui/solid/anatomy"
export { qrCodeAnatomy } from "@ark-ui/solid/anatomy"
export { scrollAreaAnatomy } from "@ark-ui/solid/anatomy"
export { segmentGroupAnatomy } from "@ark-ui/solid/anatomy"
export { tooltipAnatomy } from "@ark-ui/solid/anatomy"

export const clipboardAnatomy = arkClipboardAnatomy.extendWith("valueText")
export const listboxAnatomy = arkListboxAnatomy