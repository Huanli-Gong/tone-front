import React from "react"
import cls from "classnames"

import { ReactComponent as RightOutline } from "../assets/right.svg"
import { ToolMenuList, ToolMenuItem, ToolMenuItemActive } from "../styled"
import { DEFAULT_FONT_SIZES } from "../utils"
import DropdownMenu from "./DropdownMenu"

const TextSize: React.FC<Record<string, any>> = ({ editor }) => {
    if (!editor) return <></>
    let size = "14"

    for (const x of DEFAULT_FONT_SIZES) {
        if (editor.isActive("textStyle", { fontSize: `${x}px` })) {
            size = x
            break;
        }
    }

    return (
        <DropdownMenu
            title="字号调整"
            menu={
                <ToolMenuList >
                    {
                        DEFAULT_FONT_SIZES.map((i: string) => (
                            <ToolMenuItem
                                key={i}
                                onClick={() => editor.chain().focus().setFontSize(`${i}px`).run()}
                                className={
                                    cls(
                                        editor.isActive('paragraph') && 'is-active'
                                    )
                                }
                            >
                                <ToolMenuItemActive>
                                    {editor.isActive("textStyle", { fontSize: `${i}px` }) && <RightOutline />}
                                </ToolMenuItemActive>
                                <span >{`${i}px`}</span>
                            </ToolMenuItem>
                        ))
                    }
                </ToolMenuList>
            }
        >
            <span>{size}px</span>
        </DropdownMenu>
    )
}

export default TextSize