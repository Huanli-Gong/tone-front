import ResizeColumnTable from "@/components/ResizeTable"
import type { TableProps } from "antd"
import React from "react"

export const LOCALE_STATE_KEY_NAME = "umi_locale"

export const getStorageState = (tableName: string, title: string) => {
    const n = localStorage.getItem(tableName)
    const locale = localStorage.getItem(LOCALE_STATE_KEY_NAME) || "zh-CN"
    if (!n) return
    return JSON.parse(n)[`${locale}-${title}`]
}

export const setStorageState = (tableName: string, title: string, val: string) => {
    const n = localStorage.getItem(tableName)
    const locale = localStorage.getItem(LOCALE_STATE_KEY_NAME) || "zh-CN"
    const o = { [`${locale}-${title}`]: val }

    if (!n)
        localStorage.setItem(tableName, JSON.stringify(o))
    else
        localStorage.setItem(tableName, JSON.stringify(Object.assign(JSON.parse(n), o)))
}

/**
 * 
 * @param { string }    tableName 
 * @param { any[]  }    cols 
 * @param { any[]  }    refreshDeps 
 * @returns columns & setColumns
 */

type ResizeTableProps = {
    name: string;
    refreshDeps?: any[];
    onColumnsChange?: () => void;
    hasChange?: any;
} & TableProps<AnyType>

export const ResizeHooksTable: React.FC<ResizeTableProps> = (props) => {
    const { name, columns: cols, refreshDeps = [], onColumnsChange, ...rest } = props
    const [columns, setColumns] = React.useState<any[]>([])

    const getColumns = () => {
        return cols?.filter(Boolean).map((i: any) => {
            const { dataIndex, key, width } = i
            const k = dataIndex || key
            const w = getStorageState(name, k)
            if (!w && width) setStorageState(name, k, width)
            const rw = w ? w : width
            if (rw) i.width = rw
            return i
        }) || []
    }

    React.useEffect(() => {
        setColumns(getColumns())
    }, refreshDeps)

    return (
        <ResizeColumnTable
            name={name}
            columns={columns}
            setColumns={setColumns}
            size="small"
            onColumnsChange={() => {
                onColumnsChange?.()
                setColumns(getColumns())
            }}
            {...rest}
        />
    )
}