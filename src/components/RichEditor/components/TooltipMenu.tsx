import { MenuItem, } from "../styled"
import React from "react"
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css'
import { v4 as uuid } from "uuid"

export const TooltipMenu: React.FC<Record<string, any>> = (props) => {
    const { title, place, ...rest } = props

    const anchorId = uuid()

    return (
        <>
            <MenuItem id={anchorId} {...rest} />
            <Tooltip place={place || "top"} anchorId={anchorId} data-type="dark" content={title} />
        </>
    )
}