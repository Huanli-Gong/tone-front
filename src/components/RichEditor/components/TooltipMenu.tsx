import { MenuItem, } from "../styled"
import React from "react"
import ReactTooltip from "react-tooltip"

export const TooltipMenu: React.FC<Record<string, any>> = (props) => {
    const { title } = props
    const setting = {
        ...props,
        "data-tip": title,
    }
    return (
        <>
            <MenuItem  {...setting} />
            <ReactTooltip place="bottom" data-type="dark" />
        </>
    )
}