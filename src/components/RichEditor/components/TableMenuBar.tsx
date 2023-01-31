import type { Editor } from "@tiptap/react"
import React from "react"
import { TooltipMenu } from "./TooltipMenu"
import { ToolbarWidget } from "../styled"

import { ReactComponent as MergeCellOutlined } from "../assets/table/merge-cell.svg"
import { ReactComponent as SplitCellOutlined } from "../assets/table/split-cell.svg"
import { ReactComponent as AddColAfter } from "../assets/table/add-col-after.svg"
import { ReactComponent as AddColBefore } from "../assets/table/add-col-before.svg"
import { ReactComponent as AddRowAfter } from "../assets/table/add-row-after.svg"
import { ReactComponent as AddRowBefore } from "../assets/table/add-row-before.svg"
import { ReactComponent as DeleteCol } from "../assets/table/delete-col.svg"
import { ReactComponent as DeleteRow } from "../assets/table/delete-row.svg"
import { ReactComponent as DeleteTable } from "../assets/table/delete-table.svg"
// import { ReactComponent as AddHeadColumn } from "../assets/table/add-head-column.svg"
// import { ReactComponent as DeleteHeadColumn } from "../assets/table/delete-head-column.svg"

import TextColor from "./TextColor"
import TextHighlight from "./TextHighlight"
import TextAlign from "./TextAlign"

const TableFloatingMenuBar: React.FC<{ editor: Editor }> = (props) => {
    const { editor } = props

    return (
        < >
            <TooltipMenu
                title="合并单元格"
                onClick={() => editor.chain().focus().mergeCells().run()}
            >
                <MergeCellOutlined />
            </TooltipMenu>
            <TooltipMenu
                title="拆分单元格"
                onClick={() => editor.chain().focus().splitCell().run()}
            >
                <SplitCellOutlined />
            </TooltipMenu>

            <ToolbarWidget />

            <TooltipMenu
                title="向右插入1列"
                onClick={() => editor.chain().focus().addColumnAfter().run()}
            >
                <AddColAfter />
            </TooltipMenu>
            <TooltipMenu
                title="向左插入1列"
                onClick={() => editor.chain().focus().addColumnBefore().run()}
            >
                <AddColBefore />
            </TooltipMenu>

            <ToolbarWidget />

            <TooltipMenu
                title="向上插入1行"
                onClick={() => editor.chain().focus().addRowBefore().run()}
            >
                <AddRowAfter />
            </TooltipMenu>
            <TooltipMenu
                title="向下插入1行"
                onClick={() => editor.chain().focus().addRowAfter().run()}
            >
                <AddRowBefore />
            </TooltipMenu>

            <ToolbarWidget />

            <TooltipMenu
                title="删除列"
                onClick={() => editor.chain().focus().deleteColumn().run()}
            >
                <DeleteCol />
            </TooltipMenu>
            <TooltipMenu
                title="删除行"
                onClick={() => editor.chain().focus().deleteRow().run()}
            >
                <DeleteRow />
            </TooltipMenu>

            <ToolbarWidget />

            <TextColor editor={editor} />
            <TextHighlight editor={editor} />
            <TextAlign editor={editor} />
            
            <ToolbarWidget />
            {/* <TooltipMenu
                title="设为表头"
                onClick={() => editor.chain().focus().toggleHeaderRow().run()}
            >
                <AddHeadColumn />
            </TooltipMenu>
            <TooltipMenu
                title="取消表头"
                onClick={() => editor.chain().focus().toggleHeaderRow().run()}
            >
                <DeleteHeadColumn />
            </TooltipMenu>

            <ToolbarWidget /> */}

            <TooltipMenu
                title="删除表格"
                onClick={() => editor.chain().focus().deleteTable().run()}
            >
                <DeleteTable />
            </TooltipMenu>
        </>
    )
}

export default TableFloatingMenuBar