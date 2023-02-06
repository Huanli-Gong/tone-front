import cls from "classnames"
import React from "react"
import { ToolBar, ToolbarWidget } from "./styled"
import { TooltipMenu } from "./components/TooltipMenu"

import { ReactComponent as Blod } from "./assets/blod.svg"
import { ReactComponent as Italic } from "./assets/italic.svg"
import { ReactComponent as Strike } from "./assets/strike.svg"
import { ReactComponent as Underline } from "./assets/underline.svg"
import { ReactComponent as BulletList } from "./assets/bullet-list.svg"
import { ReactComponent as OrderedList } from "./assets/ordered-list.svg"
import { ReactComponent as Redo } from "./assets/redo.svg"
import { ReactComponent as Undo } from "./assets/undo.svg"
import { ReactComponent as ClearMarks } from "./assets/clear-marks.svg"
import { ReactComponent as Unlink } from "./assets/unlink.svg"

import TextMenu from "./components/TextMenu"
import TextColor from "./components/TextColor"
import TextAlign from "./components/TextAlign"
import TextSize from "./components/TextSize"
import TextHighlight from "./components/TextHighlight"
import ImageMenu from "./components/Image"
import LinkMenu from "./components/LinkMenu"
import MoreMenus from "./components/More"
import TableMenu from "./components/TableInsertMenu"
import TableFloatingMenuBar from './components/TableMenuBar'
import Emoji from "./components/Emoji"

const MenuBar: React.FC<Record<string, any>> = ({ editor }) => {

    if (!editor) {
        return null
    }

    return (
        <ToolBar>
            {
                editor.isActive("table") ?
                    <TableFloatingMenuBar
                        editor={editor}
                    /> :
                    <>
                        <TooltipMenu
                            title={"撤销"}
                            onClick={() => editor.chain().focus().undo().run()}
                            className={
                                cls(
                                    !editor.can().chain().focus().undo().run() && "disabled"
                                )
                            }
                        >
                            <Undo />
                        </TooltipMenu>
                        <TooltipMenu
                            title={"重做"}
                            onClick={() => editor.chain().focus().redo().run()}
                            className={
                                cls(
                                    !editor.can().chain().focus().redo().run() && "disabled"
                                )
                            }
                        >
                            <Redo />
                        </TooltipMenu>
                        <TooltipMenu
                            title={"清除标记"}
                            onClick={() => editor.chain().focus().unsetAllMarks().run()}
                        >
                            <ClearMarks />
                        </TooltipMenu>
                        <ToolbarWidget />
                        <TextMenu editor={editor} />
                        <TextSize editor={editor} />

                        <TooltipMenu
                            title={"加粗"}
                            onClick={() => editor.chain().focus().toggleBold().run()}
                            className={
                                cls(
                                    editor.isActive('bold') && 'is-active',
                                    !editor.can().chain().focus().toggleBold().run() && "disabled"
                                )
                            }
                        >
                            <Blod />
                        </TooltipMenu>
                        <TooltipMenu
                            title={"斜体"}
                            onClick={() => editor.chain().focus().toggleItalic().run()}
                            className={
                                cls(
                                    editor.isActive('italic') && 'is-active',
                                    !editor.can().chain().focus().toggleItalic().run() && "disabled"
                                )
                            }
                        >
                            <Italic />
                        </TooltipMenu>
                        <TooltipMenu
                            title={"下划线"}
                            onClick={() => editor.commands.toggleUnderline()}
                            className={
                                cls(
                                    editor.isActive('underline') && "is-active",
                                    !editor.can().chain().focus().toggleUnderline().run() && "disabled"
                                )
                            }
                        >
                            <Underline />
                        </TooltipMenu>
                        <TooltipMenu
                            title={"删除线"}
                            onClick={() => editor.chain().focus().toggleStrike().run()}
                            className={
                                cls(
                                    editor.isActive('strike') && 'is-active',
                                    !editor.can().chain().focus().toggleStrike().run()
                                )
                            }
                        >
                            <Strike />
                        </TooltipMenu>

                        <ToolbarWidget />

                        <TextColor editor={editor} />
                        <TextHighlight editor={editor} />
                        <TextAlign editor={editor} />

                        <TooltipMenu
                            title={"无序列表"}
                            onClick={() => editor.chain().focus().toggleBulletList().run()}
                            className={
                                cls(
                                    editor.isActive('bulletList') && 'is-active'
                                )
                            }
                        >
                            <BulletList />
                        </TooltipMenu>
                        <TooltipMenu
                            title={"有序列表"}
                            onClick={() => editor.chain().focus().toggleOrderedList().run()}
                            className={
                                cls(
                                    editor.isActive('orderedList') && 'is-active'
                                )
                            }
                        >
                            <OrderedList />
                        </TooltipMenu>
                        <ToolbarWidget />

                        <ImageMenu editor={editor} />
                        <LinkMenu editor={editor} />
                        <TooltipMenu
                            title="取消链接"
                            onClick={() => editor.chain().focus().unsetLink().run()}
                            className={
                                cls(
                                    editor.isActive('link') && "is-active"
                                )
                            }
                        >
                            <Unlink />
                        </TooltipMenu>
                        <ToolbarWidget />
                        <TableMenu editor={editor} />
                        <Emoji editor={editor} />
                        <MoreMenus editor={editor} />
                    </>
            }
        </ToolBar>
    )
}

export default MenuBar