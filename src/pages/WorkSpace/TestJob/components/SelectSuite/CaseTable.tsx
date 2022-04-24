import React, { useEffect, useState } from 'react'
import styles from './style.less';
import ResizeTable from '@/components/ResizeTable'
import _ from 'lodash'

export default (props: any) => {
	const {styleObj,scroll,record,disabled,columnsInner,selectedSuiteKeys,setSelectedCaseKeysFn,selectedCaseObj} = props
	const [selectedKeys,setSelectedKeys] = useState<number[]>([])
	const rowSelectionCase = {
		selectedRowKeys: selectedKeys,
		onChange: (selectedRowKeys: any) => {
			setSelectedKeys(selectedRowKeys)
			setSelectedCaseKeysFn({[record.id]: selectedRowKeys})
		},
		getCheckboxProps: (record: any) => ({
			disabled: selectedSuiteKeys.length > 0
		}),
	};
	useEffect(()=>{
		if(selectedCaseObj[record.id] !== selectedKeys) setSelectedKeys(selectedCaseObj[record.id] || [])
	},[selectedCaseObj])
	return (
		<ResizeTable
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