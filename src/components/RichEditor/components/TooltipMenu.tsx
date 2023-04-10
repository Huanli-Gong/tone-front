import { MenuItem, } from "../styled"
import React from "react"
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';

export const TooltipMenu: React.FC<Record<string, any>> = (props) => {
    const { title, place, ...rest } = props

    const ref = React.useRef<any>()

    React.useEffect(() => {
        if (!title) return
        tippy(
            ref.current,
            {
                content: title,
                placement: place || "top",
            }
        )
    }, [title, place])


    return (
        <MenuItem
            ref={ref}
            {...rest}
        />
    )
}