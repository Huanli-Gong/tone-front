import React from "react"
import cls from "classnames"

import { ReactComponent as RightOutline } from "../assets/right.svg"
import { ToolMenuList, ToolMenuItem, ToolMenuItemActive } from "../styled"
import { DEFAULT_FONT_FAMILY } from "../utils"
import DropdownMenu from "./DropdownMenu"

const FontFamily: React.FC<Record<string, any>> = ({ editor }) => {
    if (!editor) return <></>
    let family: any = DEFAULT_FONT_FAMILY[0]

    for (const font of DEFAULT_FONT_FAMILY) {
        if (editor.isActive("textStyle", { fontFamily: font })) {
            family = font
            break;
        }
    }

    return (
        <DropdownMenu
            title="字体调整"
            menu={
                <ToolMenuList >
                    {
                        DEFAULT_FONT_FAMILY.map((i: string) => (
                            <ToolMenuItem
                                key={i}
                                onClick={() => editor.chain().focus().setFontFamily(i).run()}
                                className={
                                    cls(
                                        editor.isActive('textStyle', { fontFamily: i }) && 'is-active'
                                    )
                                }
                            >
                                <ToolMenuItemActive>
                                    {editor.isActive('textStyle', { fontFamily: i }) && <RightOutline />}
                                </ToolMenuItemActive>
                                <span style={{ fontFamily: i }}>{i}</span>
                            </ToolMenuItem>
                        ))
                    }
                </ToolMenuList>
            }
        >
            <span style={{ fontFamily: family }}>字体</span>
        </DropdownMenu>
    )
}

export default FontFamily