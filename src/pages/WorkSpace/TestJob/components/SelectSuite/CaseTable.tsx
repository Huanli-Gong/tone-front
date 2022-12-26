import React, { useEffect, useState } from 'react'
import styles from './style.less';
import _ from 'lodash'
import ResizeColumnTable from "@/components/ResizeTable"

export default (props: any) => {
	const { styleObj, record, disabled, columnsInner, setInnerColumns, selectedSuiteKeys, setSelectedCaseKeysFn, selectedCaseObj } = props
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
			setColumns={setInnerColumns}
			dataSource={record.test_case_list || []}
			pagination={false}
		/>
	)
}