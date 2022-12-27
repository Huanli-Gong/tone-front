


import React from "react"

import { useClickAway } from "ahooks"
import { ToolMenu, ToolMenuWrapper } from "../styled"

import { ReactComponent as DownOutline } from "../assets/down.svg"
import ReactTooltip from "react-tooltip"

const DorpdownMenu: React.FC<Record<string, any>> = ({ menu, children, title }) => {
    const [open, setOpen] = React.useState(false)
    const dom = React.useRef<HTMLSpanElement>(null)

    useClickAway(() => {
        setOpen(false)
    }, dom)

    return (
        <ToolMenu ref={dom} onClick={() => setOpen(p => !p)}>
            <ToolMenuWrapper data-tip={title}>
                {children}
                <DownOutline />
            </ToolMenuWrapper>
            <ReactTooltip place="bottom" data-type="dark" />
            {
                open &&
                menu
            }
        </ToolMenu>
    )
}

export default DorpdownMenu