


import React from "react"

import { useClickAway } from "ahooks"
import { ToolMenu, ToolMenuWrapper } from "../styled"

import { ReactComponent as DownOutline } from "../assets/down.svg"
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';

const DorpdownMenu: React.FC<Record<string, any>> = ({ menu, children, title }) => {
    const [open, setOpen] = React.useState(false)
    const dom = React.useRef<HTMLDivElement>(null)

    useClickAway(() => {
        setOpen(false)
    }, dom)

    React.useEffect(() => {
        if (!title) return
        if (!dom.current) return
        tippy(dom.current, {
            content: title,
        })
    }, [title])

    return (
        <ToolMenu
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
        >
            <ToolMenuWrapper
                ref={dom}
            >
                {children}
                <DownOutline />
            </ToolMenuWrapper>
            {
                open &&
                menu
            }
        </ToolMenu>
    )
}

export default DorpdownMenu