/* eslint-disable @typescript-eslint/no-unused-expressions */
import { Table } from 'antd';
import type { TableProps } from 'antd/lib/table';
import React from 'react';
import { Resizable } from 'react-resizable';
import 'react-resizable/css/styles.css'
import styled from 'styled-components'
import { useSize } from "ahooks"
import { setStorageState } from '@/utils/table.hooks';

const ResizeTableWrapper = styled.div`
    position: relative;
    width: 100%;
`

type BorderPosition = {
    left: number;
    height?: number;
}

const ResizeBorder = styled.div.attrs((props: BorderPosition) => ({
    style: {
        left: props.left,
        height: props?.height
    },
})) <BorderPosition>`
    width: 0px;
    position: absolute;
    left: 0;
    top: 0;
    border-left: 1px dashed #d9d9d9;
    z-index: 99;
`

type ResizeProps = {
    resize?: number;
}

const StyledResizeable = styled(Resizable) <ResizeProps>`
    user-select: none;
    &::before {
        position: absolute;
        top: 50%;
        right: 0;
        width: 1px;
        height: 1.6em;
        background-color: rgba(0,0,0,.06);
        transform: translateY(-50%);
        transition: background-color .3s;
        content: "";
    }
    
    &:last-child::before {
        display: none;
    }

    .react-resizable {
        position: relative;
        background-clip: padding-box;
    }
    
    .react-resizable-handle {
        position: absolute;
        width: 10px;
        height: 100%;
        bottom: 0;
        right: -5px;
        cursor: ${({ resize }) => resize ? "col-resize" : "default"};
        background-image:none;
        z-index: 1;
    }
`

const ResizeableTitle = (props: any) => {
    const { width, onResizeStart, onResize, onResizeStop, resize, ...restProps } = props;
    return (
        <StyledResizeable
            width={!width ? 100 : width}
            height={0}
            draggableOpts={{ enableUserSelectHack: false }}
            onResizeStart={onResizeStart}
            onResize={onResize}
            onResizeStop={onResizeStop}
            resize={resize ? 1 : 0}
            {...restProps}
        >
            <th {...restProps} />
        </StyledResizeable>
    );
}

const ResizeColumnTable: React.FC<TableProps<any> & Record<string, any>> = (props) => {
    const { columns = [], name, onColumnsChange, ...rest } = props

    const [end, setEnd] = React.useState(0)
    const [start, setStart] = React.useState(0)
    const [borderShow, setBorderShow] = React.useState(false)

    const ref = React.useRef<HTMLDivElement>(null)
    // const tb = React.useRef<HTMLTableElement>(null)

    const size = useSize(ref)

    const handleResizeStart = (index: number) => (e: any, { }: any) => {
        if (!columns[index].ellipsis) return

        const { clientX } = e
        const drageX = clientX - (ref.current as any)?.getBoundingClientRect().x
        setStart(drageX)
        setEnd(drageX)
        setBorderShow(true)
    }

    const handleResizeMove = () => (e: any) => {
        const { clientX } = e
        const drageX = clientX - (ref.current as any)?.getBoundingClientRect().x

        setEnd(drageX)
    }

    const handleResizeStop = (index: number) => (e: any, { size: $size }: any) => {
        const { clientX } = e
        const drageX = clientX - (ref.current as any)?.getBoundingClientRect().x

        const nextColumns = [...columns];

        if (nextColumns[index].ellipsis) {
            const w = $size.width += drageX - start
            const { dataIndex, key }: any = nextColumns[index]
            /* 计算小于20px操作不生效 */
            if (w > 20) {
                nextColumns[index] = {
                    ...nextColumns[index],
                    width: w,
                }
                name && setStorageState(name, dataIndex || key, w)
                onColumnsChange?.()
            }
        }

        setEnd(0)
        setStart(0)
        setBorderShow(false)
    }

    const scrollX = React.useMemo(() => columns.reduce((p: any, c: any) => {
        // eslint-disable-next-line no-param-reassign
        if (c.width) return p += c?.width
        return p
    }, 0), [columns])

    return (
        <ResizeTableWrapper ref={ref} className="resize-table-wrapper">
            <Table
                {...rest}
                components={{
                    header: {
                        cell: ResizeableTitle,
                    },
                }}
                scroll={props?.scroll || { x: scrollX || size?.width }}
                columns={
                    columns.filter(Boolean).map((col: any, index: any) => ({
                        ...col,
                        onHeaderCell: (column: any) => ({
                            resize: !!col.ellipsis,
                            width: column.width,
                            onResizeStart: handleResizeStart(index),
                            onResize: handleResizeMove(),
                            onResizeStop: handleResizeStop(index),
                        }),
                    }))
                }
            />
            {
                borderShow &&
                <ResizeBorder
                    height={size?.height}
                    left={end || start}
                />
            }
        </ResizeTableWrapper>
    )
}

export default ResizeColumnTable