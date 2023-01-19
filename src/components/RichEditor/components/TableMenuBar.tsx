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

const TableFloatingMenuBar: React.FC<{ editor: Editor }> = (props) => {
    const { editor } = props

    return (
        < >
            <TooltipMenu
                title="合并单元格"
                onClick={() => editor.commands.mergeCells()}
            >
                <MergeCellOutlined />
            </TooltipMenu>
            <TooltipMenu
                title="拆分单元格"
                onClick={() => editor.commands.splitCell()}
            >
                <SplitCellOutlined />
            </TooltipMenu>
            <ToolbarWidget />
            <TooltipMenu
                title="向右插入1列"
                onClick={() => editor.commands.addColumnAfter()}
            >
                <AddColAfter />
            </TooltipMenu>
            <TooltipMenu
                title="向左插入1列"
                onClick={() => editor.commands.addColumnBefore()}
            >
                <AddColBefore />
            </TooltipMenu>
            <ToolbarWidget />
            <TooltipMenu
                title="向上插入1行"
                onClick={() => editor.commands.addRowAfter()}
            >
                <AddRowAfter />
            </TooltipMenu>
            <TooltipMenu
                title="向下插入1行"
                onClick={() => editor.commands.addRowBefore()}
            >
                <AddRowBefore />
            </TooltipMenu>
            <ToolbarWidget />
            <TooltipMenu
                title="删除列"
                onClick={() => editor.commands.deleteColumn()}
            >
                <DeleteCol />
            </TooltipMenu>
            <TooltipMenu
                title="删除行"
                onClick={() => editor.commands.deleteRow()}
            >
                <DeleteRow />
            </TooltipMenu>
            <ToolbarWidget />
            <TooltipMenu
                title="删除表格"
                onClick={() => editor.commands.deleteTable()}
            >
                <DeleteTable />
            </TooltipMenu>
        </>
    )
}

export default TableFloatingMenuBar