import React, { useState, useEffect, useRef, useMemo } from 'react'
import { Button, Table, Card, Switch, Space, Checkbox, Row } from 'antd';

import SettingDrawer from '@/pages/WorkSpace/TestJob/components/SuiteSelectDrawer'
import { CaretDownFilled, CaretRightFilled } from '@ant-design/icons'
import { useIntl, FormattedMessage, getLocale } from 'umi'
import styles from './style.less';

import columnsOutterFn from './columnsOutter'
import columnsInnerFn from './columnsInner'
import Tooltip from 'antd/es/tooltip'
import CaseTable from './CaseTable'
import _ from 'lodash'

export default (props: any) => {
	const {
		dataSource, onDataSourceChange, width, disabled, run_mode,
		contrl, control, server_type, test_type
	} = props
	const { formatMessage } = useIntl()
	const locale = getLocale() === 'en-US'

	const settingDrawerRef: any = useRef(null)
	const [hasCases, setHasCases] = useState(true)
	const [columnsOutter, setColumnsOutter] = useState<any>([])
	const [columnsInner, setColumnsInner] = useState<any>([])
	const [checked, setChecked] = useState<boolean>(false)
	const [selectedSuiteKeys, setSelectedSuiteKeys] = useState<any[]>([])
	const [selectedCaseKeys, setSelectedCaseKeys] = useState<any[]>([])
	const [selectedCaseObj, setSelectedCaseObj] = useState<any>({})

	const [caseKeyList, setCaseKeyList] = useState<any>([])
	const [caseKeyListObj, setCaseKeyListObj] = useState<any>({})
	const [indeterminateSuite, setIndeterminateSuite] = useState<boolean>(false)
	const [suiteAll, setSuiteAll] = useState<boolean>(false)

	const [expandedRowKeys, setExpandedRowKeys] = useState<any>([])
	const onSelectSuite = (e: any) => {
		const check = e.target.checked
		setSuiteAll(check)
		setCaseAll(false)
		setIndeterminateSuite(false)
		setSelectedCaseObj({})
		if (check) {
			const checkSuites = dataSource.map((i: any) => i.id + '')
			setSelectedSuiteKeys(checkSuites)
			setExpandedRowKeys(checkSuites)
		}
		else {
			setSelectedSuiteKeys([])
		}
	}

	const [indeterminateCase, setIndeterminateCase] = useState<boolean>(false)
	const [caseAll, setCaseAll] = useState<boolean>(false)

	const handleColumnsChange = () => {
		setColumnsOutter(
			columnsOutterFn({
				contrl,
				checked,
				onDataSourceChange,
				disabled,
				openSuite,
				dataSource,
				run_mode,
				width,
				formatMessage,
			})
		)

		setColumnsInner(
			columnsInnerFn({
				onDataSourceChange,
				dataSource,
				openCase,
				contrl,
				disabled,
				checked,
				run_mode,
				width: width - 14,
				formatMessage,
			})
		)
	}

	useEffect(() => {
		dataSource.map((item: any) => {
			if (item.isAdvancedConfig) {
				setChecked(true)
			}
		})
	}, [dataSource])

	useEffect(() => {
		handleColumnsChange()
	}, [checked, locale])

	const rowSelectionSuite = {
		selectedRowKeys: selectedSuiteKeys,
		onChange: (selectedRowKeys: any) => {
			setSelectedSuiteKeys(selectedRowKeys)
			setIndeterminateSuite(!!selectedRowKeys.length && selectedRowKeys.length < dataSource.length)
			setSuiteAll(selectedRowKeys.length == dataSource.length)
		},
		getCheckboxProps: (record: any) => ({
			disabled: selectedCaseKeys.length > 0
		}),
	};


	const setSelectedCaseKeysFn = (obj: any) => {
		let selectedCaseObjCopy = _.cloneDeep(selectedCaseObj) || {}
		selectedCaseObjCopy = { ...selectedCaseObjCopy, ...obj }
		setSelectedCaseObj(selectedCaseObjCopy)
	}
	useEffect(() => {
		let selectedRowKeys: number[] = []
		Object.values(selectedCaseObj).forEach((itemArr: any) => {
			selectedRowKeys = selectedRowKeys.concat(itemArr)
		})
		const len = caseKeyList.length
		setIndeterminateCase(!!selectedRowKeys.length && selectedRowKeys.length < len)
		setCaseAll(selectedRowKeys.length == len)
		setSelectedCaseKeys(selectedRowKeys)
	}, [selectedCaseObj])

	useEffect(() => {
		const newSelectCaseObj = {}
		Object.keys(selectedCaseObj).forEach((key: any) => {
			if (caseKeyListObj[key]) {
				const list = selectedCaseObj[key].filter(
					(item: any) => {
						if (caseKeyList.indexOf(item) > -1) return item
					}
				)
				newSelectCaseObj[key] = list
			}
		})
		setSelectedCaseObj(newSelectCaseObj)
	}, [caseKeyList])

	const onSelectCase = (e: any) => {
		const check = e.target.checked
		// setCaseAll(check)
		setSuiteAll(false)
		setSelectedSuiteKeys([])
		// setIndeterminateCase(false)
		if (check) {
			setSelectedCaseObj(caseKeyListObj)
			// dataSource.reduce(( i : any , p : any) => i.concat( p.test_case_list.map(( i : any ) => i.id + '')) , [])
			setExpandedRowKeys(dataSource.map((i: any) => i.id + ''))
		}
		else {
			setSelectedCaseObj({})
		}
	}

	const openSuite = (index: number, row: any) => settingDrawerRef.current?.show('suite', row)

	const openCase = (index: number, row: any) => settingDrawerRef.current?.show('case', row)

	const caseBentch = () => {
		let list: any = []
		dataSource.map((el: any) => {
			selectedCaseKeys.map((item: any) => {
				list = list.concat(el.test_case_list.filter((c: any) => c.id == item))
			})
		})
		settingDrawerRef.current?.show('case', list)
	}

	const suiteBentch = () => {
		let dataList: any = []
		dataSource.forEach((el: any, i: number) => {
			selectedSuiteKeys.map((item: any) => {
				if (el.id == item) dataList.push(el)
			})
		})
		settingDrawerRef.current?.show('suite', dataList)
	}

	useEffect(() => {
		handleColumnsChange()
		let caseKeysList: any = []
		let caseKeysListObj: any = {}
		dataSource.forEach(
			(item: any) => {
				caseKeysList = caseKeysList.concat(item.test_case_list.map((el: any) => el.id + ''))
				caseKeysListObj[item.id] = item.test_case_list.map((el: any) => el.id + '')
			}
		)
		setCaseKeyList(caseKeysList)
		setCaseKeyListObj(caseKeysListObj)
	}, [width, disabled, dataSource])

	const onChange = (checked: boolean) => {
		setChecked(checked)
	}

	const handleBatchSetting = () => {
		if (selectedSuiteKeys.length === 0 && selectedCaseKeys.length === 0) {
			setHasCases(false)
			return
		}

		if (selectedSuiteKeys.length > 0) suiteBentch()
		if (selectedCaseKeys.length > 0) caseBentch()

		return setHasCases(true)
	}

	const handleOnExpand = (expanded: any, record: any, e: any, onExpand: any) => {
		const id: any = record.id + ''
		if (expanded)
			setExpandedRowKeys(expandedRowKeys.filter((i: any) => i !== id))
		else
			setExpandedRowKeys(expandedRowKeys.concat([id]))
		onExpand(record, e)
	}

	const handleLeaveSettingBtn = () => {
		setHasCases(true)
	}

	const innerScrollX = useMemo(() => columnsInner.reduce((pre: any, cur: any) => pre += cur.width, 0), [columnsInner])

	const hanldeSettingOk = () => {
		setSelectedCaseObj({})
		setSelectedSuiteKeys([])
		setSuiteAll(false)
		setCaseAll(false)
		setIndeterminateSuite(false)
	}

	return (
		<div style={run_mode === 'standalone' ? { marginBottom: 10, position: 'relative' } : { position: 'relative' }}>
			<Row justify="space-between" align="middle">
				<span className={styles.title}>
					{
						run_mode === 'standalone' ?
							<FormattedMessage id="select.suite.standalone" /> :
							<FormattedMessage id="select.suite.cluster" />
					}
				</span>
				{
					(dataSource.length > 0 && !disabled) &&
					<Space style={{ height: '32px' }}>
						<span className={styles.title}>
							<FormattedMessage id="select.suite.advanced.config" />
						</span>
						<Switch size="small" onChange={onChange} />
					</Space>
				}
			</Row>
			{
				!disabled &&
				<Row justify="space-between" align="middle" className={styles.batch_setting_table_bar}>
					<Space>
						<Checkbox
							indeterminate={indeterminateSuite}
							checked={suiteAll}
							onChange={onSelectSuite}
							disabled={!checked}
						>
							<FormattedMessage id="select.suite.selectAll.suites" />
						</Checkbox>
						<Checkbox
							indeterminate={indeterminateCase}
							checked={caseAll}
							onChange={onSelectCase}
						>
							<FormattedMessage id="select.suite.selectAll.conf" />
						</Checkbox>
					</Space>
					<Tooltip
						title={
							<span
								onClick={() => setHasCases(true)}
								style={{ cursor: 'pointer' }}
							>
								<FormattedMessage id="select.suite.select.suite/conf" />
							</span>
						}
						visible={!hasCases}
					>
						<Button size="small" type="primary" onClick={handleBatchSetting} onMouseLeave={handleLeaveSettingBtn}>
							<FormattedMessage id="select.suite.batch.config" />
						</Button>
					</Tooltip>
				</Row>
			}
			<Card bodyStyle={{ width: '100%' }}>
				<Table
					rowClassName='outter'
					style={{ width: width - 2 }}
					rowSelection={checked ? rowSelectionSuite : undefined}
					showHeader={checked}
					columns={columnsOutter}
					pagination={false}
					className={styles.suite_table_loading}
					size="small"
					rowKey={record => record.id + ''}
					dataSource={dataSource}
					expandable={{
						expandedRowKeys,
						expandedRowRender: (record: any) => (
							<CaseTable
								styleObj={{ marginTop: 8, marginBottom: 8, width: width - 14 }}
								scroll={checked ? { x: innerScrollX } : undefined}
								record={record}
								disabled={disabled}
								selectedCaseObj={selectedCaseObj}
								columnsInner={columnsInner}
								setInnerColumns={setColumnsInner}
								selectedSuiteKeys={selectedSuiteKeys}
								setSelectedCaseKeysFn={setSelectedCaseKeysFn}
							/>
						),
						expandIcon: ({ expanded, onExpand, record }) => (
							expanded ?
								(<CaretDownFilled onClick={e => handleOnExpand(expanded, record, e, onExpand)} />) :
								(<CaretRightFilled onClick={e => handleOnExpand(expanded, record, e, onExpand)} />)
						)
					}}
				/>
			</Card>

			<SettingDrawer
				ref={settingDrawerRef}
				test_type={test_type}
				server_type={server_type}
				run_mode={run_mode}
				contrl={control}
				checked={checked}
				onDataSourceChange={onDataSourceChange}
				testSuiteData={dataSource}
				onOk={hanldeSettingOk}
			/>
		</div>
	)
}
