import React, { useState, useEffect, useRef } from 'react';
import { VariableSizeGrid as Grid } from 'react-window';
import ResizeObserver from 'rc-resize-observer';
import classNames from 'classnames';
import { Table } from 'antd';

export default function VirtualTable(props: Parameters<typeof Table>[0]) {
    const { columns, scroll, rowClassName } = props;
    const [tableWidth, setTableWidth] = useState<any>(0);

    const widthColumnCount = columns!.filter(({ width }) => !width).length;
    const widthWidthCount = columns?.reduce((p: any, c: any) => p += c.width || 0, 0)
    const averageWidth = Math.floor((tableWidth - widthWidthCount) / widthColumnCount)
    
    const mergedColumns = columns!.map((column: any) => {
        if (column.width) return column;
        return {
            ...column,
            width: averageWidth,
        };
    });

    const gridRef = useRef<any>();
    const [connectObject] = useState<any>(() => {
        const obj = {};
        Object.defineProperty(obj, 'scrollLeft', {
            get: () => null,
            set: (scrollLeft: number) => {
                if (gridRef.current) {
                    gridRef.current.scrollTo({ scrollLeft });
                }
            },
        });

        return obj;
    });

    const resetVirtualGrid = () => {
        gridRef.current.resetAfterIndices({
            columnIndex: 0,
            shouldForceUpdate: true,
        });
    };

    useEffect(() => resetVirtualGrid, [tableWidth]);

    const renderVirtualList = (rawData: object[], { scrollbarSize, ref, onScroll }: any) => {

        ref.current = connectObject;
        const totalHeight = rawData.length * 39;

        return (
            <Grid
                ref={gridRef}
                className="virtual-grid"
                columnCount={mergedColumns.length}
                columnWidth={(index: number) => {
                    const { width } = mergedColumns[index];
                    return totalHeight > scroll!.y! && index === mergedColumns.length - 1
                        ? (width as number) - scrollbarSize - 1
                        : (width as number);
                }}
                height={scroll!.y as number}
                rowCount={rawData.length}
                rowHeight={() => 39}
                width={tableWidth}
                onScroll={({ scrollLeft }: { scrollLeft: number }) => {
                    onScroll({ scrollLeft });
                }}
            >
                {({
                    columnIndex,
                    rowIndex,
                    style,
                }: {
                    columnIndex: number;
                    rowIndex: number;
                    style: React.CSSProperties;
                }) => {
                    const { dataIndex, render }: any = mergedColumns[columnIndex]


                    return (
                            <div
                                className={classNames('virtual-table-cell', {
                                    'virtual-table-cell-last': columnIndex === mergedColumns.length - 1,
                                }, rowClassName)}
                                style={{ display: 'flex', alignItems: 'center', padding: '0 8px', ...style }}
                            >
                                {
                                    typeof render === 'function' ?
                                        render(dataIndex ? rawData[rowIndex][dataIndex] : rawData[rowIndex], rawData[rowIndex], rowIndex) :
                                        (rawData[rowIndex] as any)[(mergedColumns as any)[columnIndex].dataIndex]
                                }
                            </div>
                        )
                }}
            </Grid>
        );
    };

    return (
        <ResizeObserver
            onResize={({ width }) => {
                setTableWidth(width);
            }}
        >
            <Table
                {...props}
                className={classNames('virtual-table', props.className)}
                columns={mergedColumns}
                pagination={false}
                components={{
                    body: renderVirtualList,
                }}
            />
        </ResizeObserver>
    );
}