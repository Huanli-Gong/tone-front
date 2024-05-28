/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef, useMemo } from 'react'
import { Button, Table, Card, Switch, Space, Checkbox, Row, Tag, Tooltip } from 'antd';

import SettingDrawer from '@/pages/WorkSpace/TestJob/components/SuiteSelectDrawer'
import { CaretDownFilled, CaretRightFilled, MinusCircleOutlined } from '@ant-design/icons'
import { useIntl, FormattedMessage } from 'umi'
import styles from './style.less';

import CaseTable from './CaseTable'
import lodash from 'lodash'
import { isNull } from 'lodash'
import { v4 as uuid } from "uuid"
import { ColumnEllipsisText } from '@/components/ColumnComponents';

const optionWidth = 100;

const TestJobSuiteTable: React.FC<Record<string, any>> = (props) => {
	const {
		dataSource, onDataSourceChange, width, disabled, run_mode,
		contrl, control, server_type, test_type
	} = props
	const { formatMessage } = useIntl()

	const settingDrawerRef: any = useRef(null)
	const [hasCases, setHasCases] = useState(true)

	const [checked, setChecked] = useState<boolean>(true)
	const [selectedSuiteKeys, setSelectedSuiteKeys] = useState<any[]>([])
	const [selectedCaseKeys, setSelectedCaseKeys] = useState<any[]>([])
	const [selectedCaseObj, setSelectedCaseObj] = useState<any>({})

	const [caseKeyList, setCaseKeyList] = useState<any>([])
	const [caseKeyListObj, setCaseKeyListObj] = useState<any>({})
	const [indeterminateSuite, setIndeterminateSuite] = useState<boolean>(false)
	const [suiteAll, setSuiteAll] = useState<boolean>(false)

	const [expandedRowKeys, setExpandedRowKeys] = useState<any>([])
	const [caseAll, setCaseAll] = useState<boolean>(false)
	const [indeterminateCase, setIndeterminateCase] = useState<boolean>(false)

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

	const onRemoveSuite = (key: string) => {
		onDataSourceChange(
			dataSource.filter((item: any) => item.id !== key),
			run_mode
		)
	}

	const onRemove = (key: string) => {
		const list = dataSource.filter(
			(item: any) => {
				const test_case_list = item.test_case_list.filter(
					(el: any) => {
						if (key !== el.id) return el
					}
				)
				if (test_case_list.length > 0) {
					const obj = item
					obj.test_case_list = test_case_list
					return obj
				}
			}
		)
		onDataSourceChange(list, run_mode)
	}

	const openSuite = (index: number, row: any) => settingDrawerRef.current?.show('suite', row)

	const openCase = (index: number, row: any) => settingDrawerRef.current?.show('case', row)

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const columnsInner = [
		{
			title: 'Test Conf',
			dataIndex: 'title',
			width: 200,
			ellipsis: {
				shwoTitle: false,
			},
			fixed: 'left',
			render: (_: any) => (
				<ColumnEllipsisText ellipsis={{ tooltip: true }}>
					{_ || '-'}
				</ColumnEllipsisText>
			),
		},
		{
			title: <FormattedMessage id="select.suite.the.server" />,
			ellipsis: {
				shwoTitle: false,
			},
			key: "server",
			width: 150,
			render: (_: any, row: any) => {
				const random = formatMessage({ id: "select.suite.random" })
				const { server_tag_id, ip: $ip, customer_server, } = row
				if (server_tag_id && server_tag_id.length > 0) {
					const tagList = $ip ? $ip.split(',').map((t: any) => <Tag key={t}>{t}</Tag>) : random
					return (
						<ColumnEllipsisText ellipsis={{ tooltip: true }}>
							{tagList}
						</ColumnEllipsisText>
					)
				}

				if (isNull($ip) && customer_server && JSON.stringify(customer_server) !== '{}') {
					return (
						<ColumnEllipsisText ellipsis={{ tooltip: true }}>
							{customer_server?.custom_ip || ''}
						</ColumnEllipsisText>
					)
				}

				const text = $ip && !['随机'].includes($ip) ? $ip : random
				return <ColumnEllipsisText ellipsis={{ tooltip: true }}>{text || "-"}</ColumnEllipsisText>
			},
		},
		{
			title: <FormattedMessage id="select.suite.table.timeout" />,
			dataIndex: 'timeout',
			width: 130,
		},
		{
			title: 'Repeat',
			dataIndex: 'repeat',
			width: 80,
		},
		(checked && 'reboot' in contrl) &&
		{
			title: <FormattedMessage id="select.suite.restart" />,
			dataIndex: 'reboot',
			// className: styles.action,
			render: (_: any, row: any) => formatMessage({ id: `operation.${row.need_reboot ? "yes" : "no"}` }),
			width: 80,
		},
		(checked && 'script' in contrl) &&
		{
			title: <FormattedMessage id="select.suite.script" />,
			width: 100,
			dataIndex: 'script',
			// className: styles.var,
			render: (_: any, row: any) => {
				const beforeStart = formatMessage({ id: 'select.suite.before.restart' })
				const afterStart = formatMessage({ id: 'select.suite.after.restart' })
				return row.setup_info || row.cleanup_info ?
					<ColumnEllipsisText ellipsis={{ tooltip: true }}>
						{`${beforeStart}:${row.setup_info || '-'}，${afterStart}:${row.cleanup_info || '-'}`}
					</ColumnEllipsisText> : "-"
			}
		},
		/* 
		(checked && 'monitor' in contrl) &&
		{
			title: <FormattedMessage id="select.suite.monitor" />,
			dataIndex: 'monitor',
			render: (_: any, row: any) => row.console === undefined ? '-' : formatMessage({ id: `operation.${row.console ? "yes" : "no"}` }),
			width: 100,
		},
		 */
		(checked && 'variable' in contrl) &&
		{
			title: <FormattedMessage id="select.suite.variable" />,
			dataIndex: 'variable',
			width: 150,
			render: (_: number, row: any) => {
				if (row.env_info && row.env_info.length > 0) {
					const str = row.env_info.map((item: any) => {
						return item.name ? `${item.name || ''}=${item.val || ''};` : '-'
					})
					return (
						<ColumnEllipsisText ellipsis={{ tooltip: true }} >{str}</ColumnEllipsisText>
					)
				}
				return '-'
			},
		},
		{
			title: <FormattedMessage id="select.suite.priority" />,
			dataIndex: 'priority',
			width: 80,
		},
		{
			title: <FormattedMessage id="Table.columns.operation" />,
			dataIndex: 'operation',
			width: optionWidth,
			fixed: 'right',
			render: (_: any, row: any, index: number) => (
				!disabled &&
				<>
					<Button
						type="link"
						style={{ padding: 0, height: 'auto' }}
						onClick={() => openCase(index, row)}
					>
						<FormattedMessage id="select.suite.config" />
					</Button>
					<MinusCircleOutlined
						className={styles.remove}
						onClick={() => onRemove(row.id)}
					/>
				</>
			)
		}
	]

	const columnsOutter = [
		{
			title: 'Test Suite',
			dataIndex: 'title',
			fixed: "left",
			ellipsis: {
				shwoTitle: false,
			},
			render: (_: any) => (
				<ColumnEllipsisText ellipsis={{ tooltip: true }}>
					{_ || '-'}
				</ColumnEllipsisText>
			),
		},
		(checked && 'reboot' in contrl) &&
		{
			title: formatMessage({ id: 'select.suite.restart' }),
			dataIndex: 'reboot',
			width: 80,
			render: (_: any, row: any) => formatMessage({ id: `operation.${row.need_reboot ? "yes" : "no"}` }),
		},
		(checked && 'script' in contrl) &&
		{
			title: formatMessage({ id: 'select.suite.script' }),
			dataIndex: 'script',
			width: 150,
			render: (_: any, { setup_info, cleanup_info }: any) => {
				const beforeStart = formatMessage({ id: 'select.suite.before.restart' })
				const afterStart = formatMessage({ id: 'select.suite.after.restart' })
				return setup_info || cleanup_info ?
					<ColumnEllipsisText ellipsis={{ tooltip: true }}>
						{`${beforeStart}:${setup_info || '-'}，${afterStart}:${cleanup_info || '-'}`}
					</ColumnEllipsisText> : "-"
			}
		},
		/* 
		(checked && 'monitor' in contrl) &&
		{
			title: formatMessage({ id: 'select.suite.monitor' }),
			dataIndex: 'monitor',
			width: 80,
			render: (_: any, { console: Console }: any) => (
				Console === undefined ? '-' : formatMessage({ id: `operation.${Console ? "yes" : "no"}` })
			),
		},
		 */
		checked &&
		{
			title: formatMessage({ id: 'select.suite.priority' }),
			width: 80,
			dataIndex: 'priority',
		},
		{
			title: formatMessage({ id: 'Table.columns.operation' }),
			width: optionWidth,
			dataIndex: 'operation',
			fixed: 'right',
			render: (_: any, row: any, index: number) => (
				!disabled &&
				<>
					{
						(checked) &&
						<Button
							type="link"
							style={{ padding: 0, height: 'auto' }}
							onClick={() => openSuite(index, row)}
						>
							<FormattedMessage id="select.suite.config" />
						</Button>
					}
					<MinusCircleOutlined
						className={styles.remove}
						style={
							checked ?
								{ marginTop: 6, padding: 0 } :
								{ margin: 0, paddingRight: 6, width: 60, textAlign: 'right' }
						}
						onClick={() => onRemoveSuite(row.id)}
					/>
				</>
			),
		}
	]

	useEffect(() => {
		dataSource.map((item: any) => {
			if (item.isAdvancedConfig) {
				setChecked(true)
			}
		})
	}, [dataSource])

	const rowSelectionSuite = {
		selectedRowKeys: selectedSuiteKeys,
		onChange: (selectedRowKeys: any) => {
			setSelectedSuiteKeys(selectedRowKeys)
			setIndeterminateSuite(!!selectedRowKeys.length && selectedRowKeys.length < dataSource.length)
			setSuiteAll(selectedRowKeys.length == dataSource.length)
		},
		getCheckboxProps: () => ({
			disabled: selectedCaseKeys.length > 0
		}),
	};

	const setSelectedCaseKeysFn = (obj: any) => {
		let selectedCaseObjCopy = lodash.cloneDeep(selectedCaseObj) || {}
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
		const newSelectCaseObj: any = {}
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
		const dataList: any = []
		dataSource.forEach((el: any) => {
			selectedSuiteKeys.map((item: any) => {
				if (el.id == item) dataList.push(el)
			})
		})
		settingDrawerRef.current?.show('suite', dataList)
	}

	useEffect(() => {
		let caseKeysList: any = []
		const caseKeysListObj: any = {}
		dataSource.forEach(
			(item: any) => {
				caseKeysList = caseKeysList.concat(item.test_case_list.map((el: any) => el.id + ''))
				caseKeysListObj[item.id] = item.test_case_list.map((el: any) => el.id + '')
			}
		)
		setCaseKeyList(caseKeysList)
		setCaseKeyListObj(caseKeysListObj)
	}, [width, disabled, dataSource])

	const onChange = ($checked: boolean) => {
		setChecked($checked)
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

	const innerScrollX = useMemo(() => columnsInner.reduce((xp: any, cur: any) => xp + cur?.width as number, 0), [columnsInner])

	const hanldeSettingOk = () => {
		setSelectedCaseObj({})
		setSelectedSuiteKeys([])
		setSuiteAll(false)
		setCaseAll(false)
		setIndeterminateSuite(false)
	}

	const [columnsChange, setColumnsChange] = React.useState(uuid())

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
						<Switch size="small" checked={checked} onChange={onChange} />
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
						open={!hasCases}
					>
						<Button size="small" type="primary" onClick={handleBatchSetting} onMouseLeave={handleLeaveSettingBtn}>
							<FormattedMessage id="select.suite.batch.config" />
						</Button>
					</Tooltip>
				</Row>
			}
			<Card bodyStyle={{ width: '100%' }}>
				<Table
					style={{ width: width - 2 }}
					// refreshDeps={[contrl, checked]}
					rowSelection={checked ? rowSelectionSuite : undefined}
					showHeader={checked}
					columns={columnsOutter.filter(Boolean) as any}
					pagination={false}
					className={styles.suite_table_loading}
					scroll={checked ? { x: innerScrollX } : undefined}
					size="small"
					rowKey={record => record.id + ''}
					dataSource={dataSource}
					rowClassName={(_, index) => index % 2 === 0 ? "outter outter-odd" : "outter outter-even"}
					expandable={{
						expandedRowKeys,
						columnWidth: 22,
						expandedRowRender: (record: any) => (
							<CaseTable
								styleObj={{ width: width - 14 }}
								scroll={checked ? { x: innerScrollX } : undefined}
								record={record}
								refreshDeps={[checked, contrl, disabled, columnsChange, dataSource]}
								disabled={disabled}
								selectedCaseObj={selectedCaseObj}
								columnsInner={columnsInner.filter(Boolean)}
								checked={checked}
								contrl={contrl}
								columnsChange={columnsChange}
								onColumnsChange={() => setColumnsChange(uuid())}
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

export default TestJobSuiteTable
