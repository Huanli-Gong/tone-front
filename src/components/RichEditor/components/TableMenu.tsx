import React from "react"
import { ReactComponent as TalbeOutlet } from "../assets/table/table.svg"
import { TooltipMenu } from "./TooltipMenu"
import styled from "styled-components"
import { v4 as uuid } from "uuid"
import type { Editor } from "@tiptap/react"
import { useClickAway } from "ahooks"
import cls from "classnames"

type CellProps = {
    bg: boolean;
}

type InsertTableOptions = {
    rows: number;
    cols: number
}

const TableBox = styled.div`
    position: relative;
`

const TableCell = styled.div.attrs(props => ({
    style: {
        background: props.bg ? "#a5f3fc" : undefined
    }
})) <CellProps>`
    width: 18px;
    height: 18px;
    border: 1px solid #eeee;
`

const TableInsertBox = styled.div`
    position: absolute;
    right: 0;
    bottom: 0;
    background-color: #fff;
    width: 124px;
    box-shadow: 0 8px 16px 4px rgb(0 0 0 / 4%);
    border-radius: 8px;
    transform: translate(80%, 100%);
    z-index: 99;
    padding: 8px;
    display: flex;
    flex-direction: column;
`

const TableRow = styled.div`
    display: flex;
    flex-direction: row;
`

const BOX_SOURCE = new Array(5).fill("").map(() => new Array(6).fill("").map((x, i) => i))
const DEFAULT_INSERT_TABLE_ROWS_COLS = { rows: 3, cols: 3 }

const TableMenu: React.FC<{ editor: Editor }> = ({ editor }) => {
    const [show, setShow] = React.useState(false)
    const dom = React.useRef<HTMLDivElement>(null)

    const [hoverKey, setHoverKey] = React.useState<InsertTableOptions>(DEFAULT_INSERT_TABLE_ROWS_COLS)
    const handleClickIcon = () => {
        setShow(true)
    }

    useClickAway(() => {
        setShow(false)
    }, dom)

    const handleMouseMove = (evt: React.MouseEvent<HTMLDivElement>) => {
        const { target } = evt
        setHoverKey({
            cols: + target.getAttribute("data-index"),
            rows: + target.parentNode?.getAttribute("data-index")
        })
    }

    const handleInsertTable = ({ rows, cols }: InsertTableOptions) => {
        setHoverKey(DEFAULT_INSERT_TABLE_ROWS_COLS)
        editor?.commands.insertTable({ rows, cols })
    }

    const { rows, cols } = hoverKey

    return (
        <TableBox ref={dom}>
            <TooltipMenu
                title={"表格"}
                onClick={handleClickIcon}
                className={
                    cls(
                        editor.isActive('table') && "is-active"
                    )
                }
            >
                <TalbeOutlet />
            </TooltipMenu>
            {
                show &&
                <TableInsertBox>
                    {
                        BOX_SOURCE.map((row: any, idx: any) => (
                            <TableRow
                                key={uuid()}
                                data-index={idx}
                            >
                                {
                                    row.map((col: any) => (
                                        <TableCell
                                            bg={hoverKey.rows >= idx && hoverKey.cols >= col}
                                            data-index={col}
                                            key={uuid()}
                                            onMouseEnter={handleMouseMove}
                                            onClick={() => handleInsertTable({ rows: idx + 1, cols: col + 1 })}
                                        />
                                    ))
                                }
                            </TableRow>
                        ))
                    }
                    <span>{rows + 1} * {cols + 1}</span>
                </TableInsertBox>
            }
        </TableBox>
    )
}

export default TableMenu