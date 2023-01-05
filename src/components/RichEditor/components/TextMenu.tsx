import React from "react"
import cls from "classnames"

import { ReactComponent as RightOutline } from "../assets/right.svg"
import { ToolMenuList, ToolMenuItem, ToolMenuItemActive } from "../styled"
import DropdownMenu from "./DropdownMenu"

const titles = [
    [1, "H1"],
    [2, "H2"],
    [3, "H3"],
    [4, "H4"],
    [5, "H5"],
    [6, "H6"],
]

const TextMenu: React.FC<Record<string, any>> = ({ editor }) => {
    if (!editor) return <></>
    let title: any = "正文"

    for (const [k, t] of titles) {
        if (editor.isActive("heading", { level: k })) {
            title = t
            break;
        }
    }

    return (
        <DropdownMenu
            title="正文与标题"
            menu={
                <ToolMenuList >
                    <ToolMenuItem
                        onClick={() => editor.chain().focus().setParagraph().run()}
                        className={
                            cls(
                                editor.isActive('paragraph') && 'is-active'
                            )
                        }
                    >
                        <ToolMenuItemActive>
                            {editor.isActive("paragraph") && <RightOutline />}
                        </ToolMenuItemActive>
                        <span>正文</span>
                    </ToolMenuItem>
                    {
                        titles.map((i) => {
                            const [k, t] = i
                            return (
                                <ToolMenuItem
                                    key={k}
                                    onClick={() => editor.chain().focus().toggleHeading({ level: k }).run()}
                                    className={
                                        cls(
                                            editor.isActive('heading', { level: k }) && 'is-active'
                                        )
                                    }
                                >
                                    <ToolMenuItemActive>
                                        {editor.isActive('heading', { level: k }) && <RightOutline />}
                                    </ToolMenuItemActive>
                                    {
                                        React.createElement(`h${k}`, null, t)
                                    }
                                </ToolMenuItem>
                            )
                        })
                    }
                </ToolMenuList>
            }
        >
            {title}
        </DropdownMenu>
    )
}

export default TextMenu