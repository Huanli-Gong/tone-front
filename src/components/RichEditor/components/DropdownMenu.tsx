


import React from "react"

import { useClickAway } from "ahooks"
import { ToolMenu, ToolMenuWrapper } from "../styled"

import { ReactComponent as DownOutline } from "../assets/down.svg"
import { Tooltip } from "react-tooltip"
import 'react-tooltip/dist/react-tooltip.css'
import { v4 as uuid } from "uuid"

const DorpdownMenu: React.FC<Record<string, any>> = ({ menu, children, title }) => {
    const [open, setOpen] = React.useState(false)
    const dom = React.useRef<HTMLSpanElement>(null)

    useClickAway(() => {
        setOpen(false)
    }, dom)

    const anchorId = uuid()
    return (
        <ToolMenu
            ref={dom}
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
        >
            <ToolMenuWrapper id={anchorId} data-tip={title}>
                {children}
                <DownOutline />
            </ToolMenuWrapper>
            <Tooltip anchorId={anchorId} place="top" data-type="dark" content={title} />
            {
                open &&
                menu
            }
        </ToolMenu>
    )
}

export default DorpdownMenu