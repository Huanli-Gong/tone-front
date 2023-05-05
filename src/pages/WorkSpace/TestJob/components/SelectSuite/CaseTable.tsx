/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react'
import styles from './style.less';
import { ResizeHooksTable } from '@/utils/table.hooks';

export default (props: any) => {
	const {
		styleObj, record, disabled,
		columnsInner, selectedSuiteKeys, setSelectedCaseKeysFn,
		selectedCaseObj,
		onColumnsChange, columnsChange, refreshDeps
	} = props
	const [selectedKeys, setSelectedKeys] = useState<number[]>([])

	const rowSelectionCase = {
		selectedRowKeys: selectedKeys,
		onChange: (selectedRowKeys: any) => {
			setSelectedKeys(selectedRowKeys)
			setSelectedCaseKeysFn({ [record.id]: selectedRowKeys })
		},
		getCheckboxProps: () => ({
			disabled: selectedSuiteKeys.length > 0
		}),
	};

	useEffect(() => {
		if (selectedCaseObj[record.id] !== selectedKeys)
			setSelectedKeys(selectedCaseObj[record.id] || [])
	}, [selectedCaseObj])

	return (
		<ResizeHooksTable
			style={styleObj}
			hasChange={columnsChange}
			rowKey={$record => $record.id + ''}
			refreshDeps={refreshDeps}
			className={styles.conf_table}
			rowSelection={!disabled ? rowSelectionCase : undefined}
			columns={columnsInner}
			onColumnsChange={onColumnsChange}
			rowClassName={(_, index) => index % 2 === 0 ? "inner-odd" : "inner-even"}
			name="ws-test-job-suite-inner"
			dataSource={record.test_case_list || []}
			pagination={false}
		/>
	)
}