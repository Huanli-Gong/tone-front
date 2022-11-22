import React, { useEffect, useState } from 'react'
import styles from './style.less';
import _ from 'lodash'

import { Table } from 'antd';
import type { TableProps } from 'antd/lib/table';
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
	const [tableColumns, setTableColumns] = React.useState<any[]>(columns)

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

export default (props: any) => {
	const { styleObj, record, disabled, columnsInner, selectedSuiteKeys, setSelectedCaseKeysFn, selectedCaseObj } = props
	const [selectedKeys, setSelectedKeys] = useState<number[]>([])

	const rowSelectionCase = {
		selectedRowKeys: selectedKeys,
		onChange: (selectedRowKeys: any) => {
			setSelectedKeys(selectedRowKeys)
			setSelectedCaseKeysFn({ [record.id]: selectedRowKeys })
		},
		getCheckboxProps: (record: any) => ({
			disabled: selectedSuiteKeys.length > 0
		}),
	};

	useEffect(() => {
		if (selectedCaseObj[record.id] !== selectedKeys)
			setSelectedKeys(selectedCaseObj[record.id] || [])
	}, [selectedCaseObj])

	return (
		<ResizeColumnTable
			style={styleObj}
			// scroll={scroll}
			scroll={{ x: '100%' }}
			rowKey={record => record.id + ''}
			className={styles.conf_table}
			rowSelection={!disabled ? rowSelectionCase : undefined}
			columns={columnsInner}
			dataSource={record.test_case_list || []}
			pagination={false}
		/>
	)
}