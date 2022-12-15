import React from "react";
import DorpdownMenu from "./DropdownMenu";
import cls from "classnames"
import { Editor } from "@tiptap/react";
import { ToolMenuList, ToolMenuItem } from "../styled"

import { ReactComponent as Horizontal } from "../assets/horizontal.svg"
import { ReactComponent as HardBreak } from "../assets/hard-break.svg"
import { ReactComponent as Subscript } from "../assets/subscript.svg"
import { ReactComponent as Superscript } from "../assets/superscript.svg"
import { ReactComponent as Code } from "../assets/code.svg"
import { ReactComponent as BlockCode } from "../assets/block-code.svg"

const More: React.FC<{ editor: Editor }> = ({ editor }) => {
    if (!editor) return <></>
    return (
        <DorpdownMenu
            title="更多样式"
            menu={
                <ToolMenuList>
                    <ToolMenuItem
                        onClick={() => editor.chain().focus().toggleCode().run()}
                        className={
                            cls(
                                editor.isActive('code') && 'is-active',
                                !editor.can().chain().focus().toggleCode().run() && "disabled"
                            )
                        }
                    >
                        <Code />
                        <span>代码段</span>
                    </ToolMenuItem>

                    <ToolMenuItem
                        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                        className={
                            cls(
                                editor.isActive('codeBlock') && 'is-active'
                            )
                        }
                    >
                        <BlockCode />
                        <span>代码块</span>
                    </ToolMenuItem>
                    <ToolMenuItem
                        onClick={() => editor.chain().focus().toggleSuperscript().run()}
                        className={
                            cls(
                                editor.isActive('superscript') && 'is-active'
                            )
                        }
                    >
                        <Superscript />
                        <span>下标</span>
                    </ToolMenuItem>
                    <ToolMenuItem
                        onClick={() => editor.chain().focus().toggleSubscript().run()}
                        className={
                            cls(
                                editor.isActive('subscript') && 'is-active'
                            )
                        }
                    >
                        <Subscript />
                        <span>上标</span>
                    </ToolMenuItem>
                    <ToolMenuItem
                        onClick={() => editor.chain().focus().setHorizontalRule().run()}
                    >
                        <Horizontal />
                        <span>插入分割线</span>
                    </ToolMenuItem>

                    <ToolMenuItem
                        onClick={() => editor.chain().focus().setHardBreak().run()}
                    >
                        <HardBreak />
                        <span>换行</span>
                    </ToolMenuItem>
                </ToolMenuList>
            }
        >
            更多
        </DorpdownMenu>
    )
}

export default More