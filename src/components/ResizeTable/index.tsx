import { Table } from 'antd';
import type { TableProps } from 'antd/lib/table';
import React from 'react';
import { Resizable } from 'react-resizable';
import 'react-resizable/css/styles.css'
import styled from 'styled-components'
import { useSize } from "ahooks"

const ResizeTableWrapper = styled.div`
    position: relative;
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
    z-index: 9999;
`

type ResizeProps = {
    resize?: boolean;
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
    const { width, ...restProps } = props;
    // if (!width) return <th {...restProps} />;
    return (
        <StyledResizeable
            width={!width ? 90 : width}
            height={0}
            draggableOpts={{ enableUserSelectHack: false }}
            {...restProps}
        >
            <th {...restProps} />
        </StyledResizeable>
    );
}

const ResizeColumnTable: React.FC<TableProps<any> & Record<string, any>> = (props) => {
    const { columns = [], setColumns, ...rest } = props

    const [end, setEnd] = React.useState(0)
    const [start, setStart] = React.useState(0)
    const [borderShow, setBorderShow] = React.useState(false)

    const ref = React.useRef<HTMLDivElement>(null)

    const size = useSize(ref)

    const handleResizeStart = (index: number) => (e: any, { size }: any) => {
        if (!columns[index].ellipsis) return

        const { clientX } = e
        const drageX = clientX - (ref.current as any)?.getBoundingClientRect().x
        setStart(drageX)
        setEnd(drageX)
        setBorderShow(true)
    }

    const handleResizeMove = (index: number) => (e: any) => {
        const { clientX } = e
        const drageX = clientX - (ref.current as any)?.getBoundingClientRect().x

        setEnd(drageX)
    }

    const handleResizeStop = (index: number) => (e: any, { size }: any) => {
        const { clientX } = e
        const drageX = clientX - (ref.current as any)?.getBoundingClientRect().x

        const nextColumns = [...columns];

        if (nextColumns[index].ellipsis) {
            nextColumns[index] = {
                ...nextColumns[index],
                width: size.width += drageX - start,
            }
            setColumns(nextColumns)
        }

        setEnd(0)
        setStart(0)
        setBorderShow(false)
    }

    return (
        <ResizeTableWrapper ref={ref} className="resize-table-wrapper">
            <Table
                {...rest}
                components={{
                    header: {
                        cell: ResizeableTitle,
                    },
                }}
                columns={
                    columns.filter(Boolean).map((col: any, index: any) => ({
                        ...col,
                        onHeaderCell: (column: any) => ({
                            resize: !!col.ellipsis,
                            width: column.width,
                            onResizeStart: handleResizeStart(index),
                            onResize: handleResizeMove(index),
                            onResizeStop: handleResizeStop(index),
                        }),
                    }))
                }
            />
            {
                // borderShow &&
                <ResizeBorder
                    height={size?.height}
                    left={end || start}
                />
            }
        </ResizeTableWrapper>
    )
}

export default ResizeColumnTable