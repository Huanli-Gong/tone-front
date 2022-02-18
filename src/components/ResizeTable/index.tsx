import { Table } from 'antd';
import type { TableProps } from 'antd/lib/table';
import React from 'react';
import { Resizable } from 'react-resizable';
import 'react-resizable/css/styles.css'
import styled from 'styled-components'

const StyledResizeable = styled(Resizable)`
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
        cursor: col-resize;
        background-image:none;
        z-index: 1;
    }
`

const ResizeableTitle = (props: any) => {
    const { onResize, width, ...restProps } = props;
    // if (!width) return <th {...restProps} />;

    return (
        <StyledResizeable
            width={!width ? 90 : width}
            height={0}
            onResize={onResize}
            draggableOpts={{ enableUserSelectHack: false }}
        >
            <th {...restProps} />
        </StyledResizeable>
    );
}

const ResizeColumnTable: React.FC<TableProps<any>> = (props) => {
    const { columns = [], ...rest } = props
    const [tableColumns, setTableColumns] = React.useState<any[]>([])

    React.useEffect(() => {
        setTableColumns(columns)
    }, [columns])

    const handleResize = (index: number) => (e: any, { size }: any) => {
        const nextColumns = [...tableColumns];
        if (nextColumns[index].ellipsis) {
            nextColumns[index] = {
                ...nextColumns[index],
                width: size.width,
            }
            setTableColumns(nextColumns)
        }
    }

    return (
        <Table
            {...rest}
            components={{
                header: {
                    cell: ResizeableTitle,
                },
            }}
            columns={
                tableColumns.map((col: any, index: any) => ({
                    ...col,
                    onHeaderCell: (column: any) => ({
                        width: column.width,
                        onResize: handleResize(index),
                    }),
                }))
            }
        />
    )
}

export default ResizeColumnTable