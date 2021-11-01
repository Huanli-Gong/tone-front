import React, { useState, useEffect, useRef, useMemo } from 'react'
import { Button, Table, Card, Switch, Space, Checkbox, Row } from 'antd';

import SettingDrawer from '@/pages/WorkSpace/TestJob/components/SuiteSelectDrawer'
import { CaretDownFilled, CaretRightFilled } from '@ant-design/icons'
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

	const settingDrawerRef: any = useRef(null)

	const [hasCases, setHasCases] = useState(true)

	const [columnsOutter, setColumnsOutter] = useState<any>([])
	const [columnsInner, setColumnsInner] = useState<any>([])

	const [checked, setChecked] = useState<boolean>(false)
	const [selectedSuiteKeys, setSelectedSuiteKeys] = useState<any[]>([])
	const [selectedCaseKeys, setSelectedCaseKeys] = useState<any[]>([])
	const [selectedCaseObj,setSelectedCaseObj] = useState<any>({})

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
			})
		)
	}

	useEffect(() => {
		handleColumnsChange()
	}, [checked])

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


	const setSelectedCaseKeysFn = (obj:any) => {
		let selectedCaseObjCopy = _.cloneDeep(selectedCaseObj) || {}
		selectedCaseObjCopy = { ...selectedCaseObjCopy, ...obj }
		setSelectedCaseObj(selectedCaseObjCopy)
	}
	useEffect(()=>{
		let selectedRowKeys:number[] = []
		Object.values(selectedCaseObj).forEach((itemArr:any) =>{
			selectedRowKeys = selectedRowKeys.concat(itemArr)
		})
		const len = caseKeyList.length
		setIndeterminateCase(!!selectedRowKeys.length && selectedRowKeys.length < len)
		setCaseAll(selectedRowKeys.length == len)
		setSelectedCaseKeys(selectedRowKeys)
	},[selectedCaseObj])

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
		settingDrawerRef.current?.show('case',list)
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
		let caseKeysListObj:any = {}
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
				<span className={styles.title}>{run_mode === 'standalone' ? "单机测试" : '集群测试'}</span>
				{
					(dataSource.length > 0 && !disabled) &&
					<Space style={{ height: '32px' }}>
						<span className={styles.title}>高级配置</span>
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
							全选Suite
						</Checkbox>
						<Checkbox
							indeterminate={indeterminateCase}
							checked={caseAll}
							onChange={onSelectCase}
						>
							全选Conf
						</Checkbox>
					</Space>
					<Tooltip
						title={
							<span
								onClick={() => setHasCases(true)}
								style={{ cursor: 'pointer' }}
							>
								请选择Suite/Conf
							</span>
						}
						visible={!hasCases}
					>
						<Button size="small" type="primary" onClick={handleBatchSetting} onMouseLeave={handleLeaveSettingBtn}>
							批量配置
						</Button>
					</Tooltip>
				</Row>
			}
			<Card bodyStyle={{ width }}>
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
				onDataSourceChange={ onDataSourceChange }
				testSuiteData={ dataSource }
				onOk={ hanldeSettingOk }
			/>
		</div>
	)
}

// {/* <SuiteDrawer
// onRef={suiteConfig}
// submitSuite={submitSuite}
// contrl={control}
// server_type={server_type}
// test_type={test_type}
// run_mode={run_mode}
// /> */}
//dataSource.reduce(( i : any , p : any) => i.concat( p.test_case_list.map(( i : any ) => i.id + '')) , [])
//

// {/* suite select */}
// {
// 	selectSuiteShow &&
// 	<Affix offsetTop={50}>
// 		<Row
// 			justify="space-between"
// 			className={styles.batch}
// 		>
// 			<Space>
// 				<Checkbox indeterminate={indeterminateSuite} checked={suiteAll} onClick={onSelectSuite} />全选Suite
// 				<Typography.Text>已选Test Suite {selectedSuiteKeys.length}</Typography.Text>
// 				<Button type="link" onClick={() => { setSelectedSuiteKeys([]), setSelectSuiteShow(false) }}>取消</Button>
// 			</Space>
// 			<Space>
// 				<Button type="primary" size="small" onClick={suiteBentch}>批量编辑</Button>
// 			</Space>
// 		</Row>
// 	</Affix>
// }
// {/* case select */}
// {
// 	selectCaseShow &&
// 	<Affix offsetTop={50}>
// 		<Row
// 			justify="space-between"
// 			className={styles.batch}
// 		>
// 			<Space>
// 				<Checkbox indeterminate={ indeterminateCase } checked={ caseAll } onChange={ onSelectCase } />全选Conf
// 				<Typography.Text>已选Test Conf { selectedCaseKeys.length }</Typography.Text>
// 				<Button type="link" onClick={() => { setSelectedCaseKeys([]), setSelectCaseShow(false) }}>取消</Button>
// 			</Space>
// 			<Space>
// 				<Button type="primary" size="small" onClick={caseBentch}>批量编辑</Button>
// 			</Space>
// 		</Row>
// 	</Affix>
// }



// const submitCase = (row: any, bentch: boolean) => {
// 	let suiteConfigList: any = []
// 	dataSource.forEach((el: any) => {
// 		let test_case_list: any = []
// 		el.test_case_list.forEach((item: any) => {
// 			if (bentch && selectedCaseKeys.indexOf(item.id + '') > -1) {
// 				const params: any = { ...item, title: item.name, name: item.name, id: item.id }
// 				const {
// 					ip, priority, need_reboot, cleanup_info, setup_info,
// 					console: Console, monitor, custom_ip, custom_channel,
// 					repeat, server_object_id, server_tag_id, is_instance
// 				} = row

// 				if (priority) params.priority = priority
// 				if (need_reboot) params.priority = need_reboot
// 				if (cleanup_info) params.cleanup_info = cleanup_info
// 				if (setup_info) params.setup_info = setup_info
// 				if (Console) params.console = Console
// 				if (monitor) params.monitor = monitor
// 				if (repeat) params.repeat = repeat

// 				if (ip) {
// 					params.ip = ip
// 					params.server_tag_id = server_tag_id
// 					params.custom_channel = custom_channel
// 					params.custom_ip = custom_ip
// 					params.customer_server = {
// 						custom_ip,
// 						custom_channel
// 					}
// 					params.server_object_id = server_object_id
// 					params.is_instance = is_instance
// 				}

// 				return test_case_list.push(params)
// 			}
// 			if (!bentch && (row.id == item.id)) {
// 				const { server_object_id, server_tag_id, custom_ip, custom_channel, ip } = row
// 				const params = { ...item, ...row }
// 				params.ip = ip
// 				params.server_tag_id = server_tag_id
// 				params.custom_channel = custom_channel
// 				params.custom_ip = custom_ip
// 				params.customer_server = {
// 					custom_ip,
// 					custom_channel
// 				}
// 				params.server_object_id = server_object_id
// 				return test_case_list.push(params)
// 			}
// 			test_case_list.push(item)
// 		})
// 		if (test_case_list.length > 0) {
// 			suiteConfigList.push({
// 				...el,
// 				test_case_list
// 			})
// 		}
// 		else suiteConfigList.push(el)
// 	})
// 	onDataSourceChange(suiteConfigList, run_mode)
// 	bentch && setSelectedCaseKeys([])
// }

// const submitSuite = (selectedDatas: any, values: any, serverItem: any, onOk: any) => {
// 	const batch = _.isArray(selectedDatas)
// 	let list: any = dataSource

// 	if (batch) {
// 		const {
// 			priority, need_reboot, cleanup_info, setup_info, console: Console, monitor,
// 			server_object_id, repeat, custom_ip, server_tag_id, custom_channel
// 		} = values
// 		list = dataSource.map(
// 			(item: any) => {
// 				const idx = selectedDatas.findIndex((i: any) => i.id == item.id)
// 				if (idx > -1) {
// 					if (priority) item.priority = priority
// 					if (need_reboot) item.need_reboot = need_reboot
// 					if (cleanup_info) item.cleanup_info = cleanup_info
// 					if (setup_info) item.setup_info = setup_info
// 					if (Console) item.console = Console
// 					if (monitor) item.monitor = monitor

// 					if (serverItem) {
// 						const { serverObjectType, serverType, is_instance } = serverItem
// 						item.test_case_list = item.test_case_list.map(
// 							(ctx: any) => {
// 								if (repeat) ctx.repeat = repeat

// 								if (serverItem.ip || serverItem.tags) {
// 									ctx.custom_channel = custom_channel
// 									ctx.custom_ip = custom_ip
// 									ctx.server_tag_id = server_tag_id
// 									ctx.server_object_id = server_object_id
// 									ctx.customer_server = {
// 										custom_ip,
// 										custom_channel
// 									}
// 								}

// 								if (serverType === 1) {
// 									if (serverObjectType === 1) {
// 										ctx.ip = '随机'
// 										ctx.custom_channel = undefined
// 										ctx.custom_ip = undefined
// 										ctx.server_tag_id = undefined
// 										ctx.server_object_id = undefined
// 										ctx.customer_server = {
// 											custom_ip: undefined,
// 											custom_channel: undefined
// 										}
// 									}
// 									if (serverObjectType === 2 || serverObjectType > 3) {
// 										ctx.ip = serverItem.ip
// 										ctx.custom_channel = undefined
// 										ctx.custom_ip = undefined
// 										ctx.server_tag_id = undefined
// 										ctx.server_object_id = server_object_id
// 										ctx.customer_server = {
// 											custom_ip: undefined,
// 											custom_channel: undefined
// 										}
// 										ctx.is_instance = is_instance
// 									}
// 									if (serverObjectType === 3) {
// 										ctx.ip = serverItem.tags
// 										ctx.custom_channel = undefined
// 										ctx.custom_ip = undefined
// 										ctx.server_tag_id = server_tag_id
// 										ctx.server_object_id = undefined
// 										ctx.customer_server = {
// 											custom_ip: undefined,
// 											custom_channel: undefined
// 										}
// 									}
// 								}

// 								if (serverItem.serverType === 2) {
// 									if (custom_channel && custom_ip) {
// 										ctx.ip = custom_ip
// 										ctx.custom_channel = custom_channel
// 										ctx.custom_ip = custom_ip
// 										ctx.server_tag_id = undefined
// 										ctx.server_object_id = undefined
// 										ctx.customer_server = {
// 											custom_ip,
// 											custom_channel
// 										}
// 									}
// 								}

// 								return ctx
// 							}
// 						)
// 					}
// 				}
// 				return item
// 			}
// 		)
// 	}
// 	else {
// 		const idx = dataSource.findIndex((i: any) => i.id == selectedDatas.id)
// 		if (idx > -1)
// 			list[idx] = { ...dataSource[idx], ...values }
// 	}
// 	onDataSourceChange(list, run_mode)
// 	setSelectedSuiteKeys([])
// 	setSuiteAll(false)
// 	setIndeterminateSuite(false)
// 	onOk()
// }

// import SuiteDrawer from './SuiteDrawer'
// const suiteConfig: any = useRef(null)