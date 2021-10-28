import { Table } from 'antd';
import { TableProps } from 'antd/lib/table';
import React, { useState, memo, useEffect, useMemo } from 'react';
import { Resizable } from 'react-resizable';
import 'react-resizable/css/styles.css'

import styled from 'styled-components'

const StyledResizeable = styled(Resizable)`
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

const ResizeColumnTable : React.FC<TableProps<any>>= (props) => {

    const { columns = [], dataSource = [], ...rest } = props
    const [tableColumns, setTableColumns] = useState<any>([])

    useEffect(() => {
        setTableColumns(columns)
    }, [columns])

    const handleResize = (index: number) => (e: any, { size }: any) => {
        const nextColumns = [...tableColumns];
        if(nextColumns[index].ellipsis){
            nextColumns[index] = {
                ...nextColumns[index],
                width: size.width,
            }
        }
        setTableColumns(nextColumns)
    }

    const resultColumns = useMemo(
        () => tableColumns.map((col: any, index: any) => ({
            ...col,
            onHeaderCell: (column: any) => ({
                width: column.width,
                onResize: handleResize(index),
            }),
        })), [tableColumns]
    )

    return (
        <Table
            {...rest}
            bordered
            components={{
                header: {
                    cell: ResizeableTitle,
                },
            }}
            columns={resultColumns}
            dataSource={dataSource}
        />
    )
}

export default memo(ResizeColumnTable)