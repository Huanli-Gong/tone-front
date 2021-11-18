import React, { useState, useEffect, useRef } from 'react';
import { Form, Button, Space, Tabs, Drawer, message, Popconfirm, Pagination, Modal, Tooltip, Row, Alert, Table, Spin } from 'antd';
import { CaretRightFilled, CaretDownFilled, FilterFilled, EditOutlined, QuestionCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { suiteList, addSuite, editSuite, delSuite, syncSuite, getDomain, deleteDomains, manual, lastSync } from './service';
import ButtonEllipsis from '@/components/Public/ButtonEllipsis';
import PopoverEllipsis from '@/components/Public/PopoverEllipsis';
import Highlighter from 'react-highlight-words';
import { suiteChange } from '@/components/Public/TestSuite/index.js';
import styles from './style.less';
import CaseTable from './components/CaseTable';
import SelectCheck from '@/components/Public//SelectCheck';
import SearchInput from '@/components/Public/SearchInput';
import SelectDrop from '@/components/Public//SelectDrop';
import SelectRadio from '@/components/Public/SelectRadio';
import { history } from 'umi'
import SuiteEditer from './components/SuiteEditer'
import DesFastEditDrawer from './components/DesFastEditDrawer'
import BatchDelete from './BatchDelete';
import { TestContext } from './Provider'
import ConfEditDrawer from './components/CaseTable/ConfEditDrawer'

import _ from 'lodash'
import AddScripotDrawer from './components/DomianConf/AddScript'
import { AddBusinessDrawer, BusinessList } from './components/BusinessTest'
import { TabCard } from '@/components/UpgradeUI';
import { editBentch, editCase, addCase, openSuite } from '@/pages/SystemConf/SuiteMangement/service'
import { deleteJob, queryConfirm } from '@/pages/WorkSpace/JobTypeManage/services';
import { requestCodeMessage } from '@/utils/utils';

let timeout: any = null;
let timer: any = null;
const SuiteManagement: React.FC<any> = (props) => {
	const testType = props.location.query.test_type || 'functional'
	const { TabPane } = Tabs;
	const [data, setData] = useState<any>([]);
	const [name, setName] = useState<string>()
	const [time, setTime] = useState<string>()
	const [domain, setDomain] = useState<string>();
	const [mode, setMode] = useState<string>();
	const [owner, setOwner] = useState<number>();
	const [is_default, setIs_default] = useState<number>();
	const [certificated, setCertificated] = useState<number>();
	const [page, setPage] = useState<number>(1)
	const [pageSize, setPageSize] = useState<number>(10)
	const [refresh, setRefresh] = useState<boolean>(true)
	const [key, setKey] = useState<string>(testType)
	const [loading, setLoading] = useState<boolean>(true)
	const [sync, setSync] = useState<boolean>(false)
	const [expandKey, setExpandKey] = useState<string[]>([])
	const [autoFocus, setFocus] = useState<boolean>(true)
	const [deleteVisible, setDeleteVisible] = useState(false);
	const [deleteDefault, setDeleteDefault] = useState(false)
	const [deleteObj, setDeleteObj] = useState<any>({});
	const [selectedRowKeys, setSelectedRowKeys] = useState<any[]>([])
	const [selectedRow, setSelectedRow] = useState<any>([])
	const [confRefresh, setConfRefresh] = useState<boolean>(true)
	const runList = [{ id: 'standalone', name: '单机' }, { id: 'cluster', name: '集群' }]
	const defaultList = [{ id: 1, name: '是' }, { id: 0, name: '否' }]

	const confDrawer: any = useRef(null)

	const suiteEditDrawer: any = useRef(null)
	const edscFastEditer: any = useRef(null)
	const [domainList, setDomainList] = useState<any>([])
	const [form] = Form.useForm()
	const addScript: any = useRef(null)
	const addBusiness: any = useRef(null)
	const businessList: any = useRef(null)
	const [domainListInfo, setDomainListInfo] = useState<any>({ domainTotal: 0, domainTotalPage: 1 })

	const defaultDomainParmas = {
		name: undefined,
		creator: undefined,
		update_user: undefined,
		gmt_created: undefined,
		gmt_modified: undefined
	}

	const [domainUpdateParmas, setDomainUpdateParmas] = useState<any>(defaultDomainParmas)

	console.log(domainUpdateParmas)
	const getList = async (params: any = {}) => {
		setLoading(true)
		setData({ data: [] })
		const data: any = await suiteList({ ...params })
		setData(data)
		handleLastSync()
		setLoading(false)
	};

	const debounced = (fn: any, wait: any) => {
		if (timeout !== null) clearTimeout(timeout);  //清除这个定时器
		timeout = setTimeout(_.partial(fn, 1, pageSize), wait);
	}

	const debouncedList = (fn: any, wait: any) => {
		if (timer !== null) clearTimeout(timer);  //清除这个定时器
		timer = setTimeout(_.partial(fn, {
			test_type: key,
			name,
			run_mode: mode,
			is_default,
			domain,
			owner,
			certificated,
			page_num: page,
			page_size: pageSize
		}), wait);
	}

	const submitCase = async (data: any, bentch: boolean) => {
		const { test_suite_id, id } = data
		const param = { ...data }
		if (bentch) {
			const params = { ...param, ...{ case_id_list: selectedRowKeys.join(',') } }
			await editBentch(params)
			setSelectedRowKeys([])
		}
		else {
			let content = param.var
			if (Object.prototype.toString.call(param.var) === '[object String]') {
				try {
					let valid = JSON.parse(content)
					if (Object.prototype.toString.call(valid) === '[object Array]') {
						let len = valid.length
						for (var i = 0; i < len; i++) {
							if (!(Object.prototype.toString.call(valid[i]) === '[object Object]')) {
								message.error('变量数据格式错误');
								return
							}
						}
					} else {
						message.error('变量数据格式错误');
						return
					}
				} catch (e) {
					message.error('变量数据格式错误');
					return
				}
			}
			else {
				let arr: any = []
				content.map((item: any) => {
					if (item.name) {
						arr.push(item)
					}
				})
				content = JSON.stringify(arr)
			}
			param.var = content
			// ...{ test_suite_id }
			const params = { ...param, ...{ test_suite_id } }
			const { code, msg } = id ? await editCase(id, params) : await addCase(params)
			if (code == 201) {
				message.error('Test Suite名称重复');
				return
			}
			if (code == 202) {
				message.error(msg);
				return
			}
		}

		confDrawer.current.hide()
		message.success('操作成功');
		setConfRefresh(!confRefresh)
		// setRefresh(!refresh)
	}

	const getDomainList = async (page = 1, pageSize = 10) => {
		if (key === 'domainconf') setLoading(true)
		const params = key === 'domainconf' ? { page_num: page, page_size: pageSize, ...domainUpdateParmas } : ''
		let { data, total, total_page } = await getDomain(params)

		setDomainList(data || [])
		setDomainListInfo({ domainTotal: total, domainTotalPage: total_page })
		if (key === 'domainconf') setLoading(false)
	}

	useEffect(() => {
		if (key !== 'business' && key !== 'domainconf') {
			debounced(getDomainList, 200)
		}
	}, [domainUpdateParmas, key]);

	useEffect(() => {
		if (key !== 'domainconf' && key !== 'business') {
			debouncedList(getList, 200)
			setExpandKey([])
		}
	}, [key, name, mode, domain, owner, is_default, page, pageSize, refresh, certificated]);

	useEffect(() => {
		return () => {
			clearTimeout(timeout)
			clearTimeout(timer)
		}
	}, [])

	const handlePage = (page_num: number, page_size: any) => {
		setPage(page_num)
		setPageSize(page_size)
		if (key === 'domainconf') {
			getDomainList(page_num, page_size)
		}
	}

	const editOuter = (row: any) => {
		row.direction == '上升' ? row.domain = 'increase' : 'decline'
		row.is_default = row.is_default ? 1 : 0
		row.test_type = key
		const arr = row.domain_id_list === '' ? [] : row.domain_id_list.split(',')
		let newArr = [];
		for (var i = 0; i < arr.length; i++) {
			newArr.push(Number.parseInt(arr[i]));
		}
		row.domain_list_str = newArr
		domainList.forEach((item: any) => { if (item.name == row.domain) row.domain = item.id })
		suiteEditDrawer.current.show('编辑Test Suite', row)
	}

	const onDesSubmit = async ({ doc, id }: any) => {
		await editSuite(id, { doc })
		message.success('操作成功');
		edscFastEditer.current.hide()
		page == 1 ? setRefresh(!refresh) : setPage(1)
	}

	const submitSuite = async (data: any, editId: any) => {
		const params = { ...data }
		const { code, msg } = editId ? await editSuite(editId, params) : await addSuite(params)
		if (code !== 200) {
			requestCodeMessage(code, msg);
			return
		}
		suiteEditDrawer.current.hide()
		message.success('操作成功');
		setKey(data.test_type)
		editId ? setRefresh(!refresh) : page == 1 ? setRefresh(!refresh) : setPage(1)
	}

	const handleTab = (key: string) => {
		setKey(key)
		if (key === 'business') {
			// 只改变地址，不刷新页面
			window.history.pushState({}, '', `${location.pathname}?test_type=${key}`);
		} else {
			history.push(`${location.pathname}?test_type=${key}`)
			setLoading(true)
			setPage(1)
			setPageSize(10)
			setExpandKey([])
			setName(undefined)
			setDomain(undefined)
			setMode(undefined)
			setLoading(false)
		}
	}

	const deleteOuter = async (row: any) => {
		const data = await queryConfirm({ flag: 'pass', suite_id: row.id })
		if (data.code === 200) setDeleteVisible(true)
		else setDeleteDefault(true)
		setDeleteObj(row)
	}

	const newSuite = () => {
		suiteEditDrawer.current.show('新建Test Suite', key)
	}
	const handleDetail = () => {
		window.open(`/refenerce/suite/?name=${deleteObj.name}&id=${deleteObj.id}`)
	}
	const remOuter = async () => {
		setDeleteVisible(false)
		setDeleteDefault(false)
		await delSuite(deleteObj.id)
		message.success('操作成功');
		setRefresh(!refresh)
	}

	const synchro = async (row: any) => {
		setSync(true)
		const hide = message.loading({ content: '同步中', duration: 0 })
		const { code } = await syncSuite(row.id)
		hide()
		if (code != 200) {
			message.warning('同步失败');
		} else {
			message.success('同步成功');
		}
		setSync(false)
		setRefresh(!refresh)
	}

	const view_type_content = (
		<div>
			<div>Type1：所有指标拆分展示</div>
			<div>Type2：多Conf同指标合并</div>
			<div>Type3：单Conf多指标合并</div>
		</div>
	)

	const cerContent = (
		<div>
			Is Certificated ：Certificated用例才能同步到Testfarm
		</div>
	)

	const columns: any = [
		{
			title: 'Test Suite',
			dataIndex: 'name',
			width: 300,
			fixed: 'left',
			ellipsis: true,
			filterDropdown: ({ confirm }: any) => <SearchInput confirm={confirm} autoFocus={autoFocus} onConfirm={(val: string) => { setPage(1), setName(val) }} />,
			onFilterDropdownVisibleChange: (visible: any) => {
				if (visible) {
					setFocus(!autoFocus)
				}
			},
			filterIcon: () => <FilterFilled style={{ color: name ? '#1890ff' : undefined }} />,
			render: (_: any, row: any) => (
				<PopoverEllipsis title={row.name} >
					<Highlighter
						highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
						searchWords={[name || '']}
						autoEscape
						textToHighlight={row.name.toString()}
					/>
				</PopoverEllipsis>
			)
		},
		{
			title: '运行模式',
			dataIndex: 'run_mode',
			render: (_: any) => _ === 'standalone' ? "单机" : '集群',
			width: 100,
			filterIcon: () => <FilterFilled style={{ color: mode ? '#1890ff' : undefined }} />,
			filterDropdown: ({ confirm }: any) => (
				<SelectCheck
					list={runList}
					confirm={confirm}
					onConfirm={
						(val: any) => { setPage(1), setMode(val) }
					}
				/>
			),
		},
		{
			title: '领域',
			dataIndex: 'domain_name_list',
			width: 90,
			ellipsis: true,
			filterIcon: () => <FilterFilled style={{ color: domain ? '#1890ff' : undefined }} />,
			filterDropdown: ({ confirm }: any) => (
				<SelectCheck
					list={domainList}
					confirm={confirm}
					onConfirm={(val: any) => { setPage(1), setDomain(val) }}
				/>
			),
		},
		{
			title: key == 'functional' ? <></> : <>视图类型 <Tooltip title={view_type_content} placement="bottomLeft"><QuestionCircleOutlined /></Tooltip></>,
			dataIndex: 'view_type',
			render: (_: any, record: any) => key == 'functional' ? <></> : suiteChange(_, record),
			width: key == 'functional' ? 0 : 120,
			ellipsis: true,
		},
		{
			title: '说明',
			dataIndex: 'doc',
			width: 130,
			ellipsis: true,
			render: (_: any, row: any) => (
				<div>
					<ButtonEllipsis title={row.doc} width={95} isCode={true}>
						<EditOutlined
							className={styles.edit}
							onClick={() => {
								edscFastEditer.current.show(row)
							}}
						/>
					</ButtonEllipsis>
				</div>
			)
		},
		{
			title: '默认用例',
			width: 110,
			render: (_: any, row: any) => row.is_default === 1 ? '是' : '否',
			filterIcon: () => <FilterFilled style={{ color: is_default === 1 ? '#1890ff' : undefined }} />,
			filterDropdown: ({ confirm }: any) => (
				<SelectRadio list={defaultList} confirm={confirm} onConfirm={(val: any) => { setPage(1), setIs_default(val) }} />
			),
		},
		{
			title: <>是否认证 <Tooltip title={cerContent} placement="bottomLeft"><QuestionCircleOutlined /></Tooltip></>,
			width: 120,
			render: (_: any, row: any) => row.certificated ? '是' : '否',
			filterIcon: () => <FilterFilled style={{ color: certificated === 1 ? '#1890ff' : undefined }} />,
			filterDropdown: ({ confirm }: any) => (
				<SelectRadio list={defaultList} confirm={confirm} onConfirm={(val: any) => { setPage(1), setCertificated(val) }} />
			),
		},
		{
			title: 'Owner',
			dataIndex: 'owner_name',
			width: 80,
			ellipsis:true,
			filterIcon: () => <FilterFilled style={{ color: owner ? '#1890ff' : undefined }} />,
			filterDropdown: ({ confirm }: any) => {
				<SelectDrop confirm={confirm} onConfirm={(val: number) => { setPage(1), setOwner(val) }} />
			},
		},
		{
			title: '备注',
			dataIndex: 'description',
			width: 100,
			ellipsis: true,
		},
		{
			title: '创建时间',
			dataIndex: 'gmt_created',
			width: 200,
			sorter: true,
			render: (_: any, row: any) => <PopoverEllipsis title={row.gmt_created} />
		},
		{
			title: '修改时间',
			dataIndex: 'gmt_modified',
			sorter: true,
			width: 200,
			render: (_: any, row: any) => <PopoverEllipsis title={row.gmt_modified} />
		},
		{
			title: '操作',
			valueType: 'option',
			dataIndex: 'id',
			width: '140px',
			fixed: 'right',
			render: (_: any, row: any) =>
				<Space>
					<Button type="link" style={{ padding: 0, height: 'auto' }} onClick={() => synchro({ ...row })}>同步</Button>
					<Button type="link" style={{ padding: 0, height: 'auto' }} onClick={() => editOuter({ ...row })}>编辑</Button>
					<Button type="link" style={{ padding: 0, height: 'auto' }} onClick={() => deleteOuter({ ...row })}>删除</Button>
				</Space>,
		},
	];

	const onExpand = async (record: any) => {
		setExpandKey([record.id + ''])
	}

	const upExpand = () => {
		setExpandKey([])
		setSelectedRowKeys([])
	}

	const handleSynchronous = async () => {
		const data = await manual()
		if (data.code === 200) {
			message.success('同步命令开始执行成功')
		} else if (data.code === 201) {
			message.warning(data.msg)
		} else {
			message.error(data.msg)
		}
	}

	const handleLastSync = async () => {
		const data = await lastSync()
		data.code === 200 ?
			setTime(data.data) :
			message.error(data.msg)
	}

	const handleDelete = function* (record: any = {}) {
		yield deleteDomains({ id_list: [record.id] });
	}

	const defaultOption = (code: number, msg: string) => {
		if (code === 200) {
			message.success('操作成功')
			const pageNum = Math.ceil((domainListInfo.domainTotal - 1) / pageSize) || 1
			let index = page
			if (page > pageNum) {
				index = pageNum
			}
			setPage(index)
			getDomainList(index, pageSize)
		}
		else {
			requestCodeMessage(code, msg)
		}
	}

	const totalTotal = (total: any) => {
		return total || 0
	}

	const totalPaginationClass = (total: any) => {
		return !total || total <= 0 ? styles.hidden : ''
	}

	const columnsDomain: any = [
		{
			title: '领域名称',
			width: 300,
			fixed: 'left',
			dataIndex: 'name',
			ellipsis: true,
			filterDropdown: ({ confirm }: any) => (
				<SearchInput
					confirm={confirm}
					autoFocus={autoFocus}
					onConfirm={(val: string) => {
						setPage(1)
						setDomainUpdateParmas({ ...domainUpdateParmas, name: val })
					}}
				/>
			),
			onFilterDropdownVisibleChange: (visible: any) => {
				if (visible) {
					setFocus(!autoFocus)
				}
			},
			filterIcon: () => <FilterFilled style={{ color: domainUpdateParmas.name ? '#1890ff' : undefined }} />,
			render: (_: any, row: any) => (
				<PopoverEllipsis title={row.name} >
					<Highlighter
						highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
						searchWords={[domainUpdateParmas.name || '']}
						autoEscape
						textToHighlight={row.name.toString()}
					/>
				</PopoverEllipsis>
			)
		},
		{
			title: '创建时间',
			width: 170,
			dataIndex: 'gmt_created',
			sorter: true,
			render: (_: any, row: any) => <PopoverEllipsis title={row.gmt_created} />
		},
		{
			title: '修改时间',
			width: 170,
			dataIndex: 'gmt_modified',
			sorter: true,
			render: (_: any, row: any) => <PopoverEllipsis title={row.gmt_modified} />
		},
		{
			title: '创建者',
			width: 100,
			dataIndex: 'creator',
			filterIcon: () => <FilterFilled style={{ color: domainUpdateParmas.creator ? '#1890ff' : undefined }} />,
			filterDropdown: ({ confirm }: any) => <SelectDrop confirm={confirm} onConfirm={(val: any) => { setPage(1), setDomainUpdateParmas({ ...domainUpdateParmas, creator: val }) }} />,
		},
		{
			title: '修改者',
			width: 100,
			dataIndex: 'update_user',
			filterIcon: () => <FilterFilled style={{ color: domainUpdateParmas.update_user ? '#1890ff' : undefined }} />,
			filterDropdown: ({ confirm }: any) => <SelectDrop confirm={confirm} onConfirm={(val: any) => { setPage(1), setDomainUpdateParmas({ ...domainUpdateParmas, update_user: val }) }} />,

		},
		{
			title: '描述',
			dataIndex: 'description',
			ellipsis: true,
		},
		{
			title: '操作',
			key: 'domain_conf',
			width: 130,
			fixed: 'right',
			render: (text: any, record: any) => {
				return (
					<Space size='small'>
						<span className={styles.fail_detail_operation} onClick={() => hanldeEdit(record)}>编辑</span>

						{/* 删除的弹框 */}
						<Form
							form={form}
							layout="vertical"
						/*hideRequiredMark*/
						>
							<Popconfirm
								title={<div style={{ color: 'red' }}>删除会使关联了该领域的Suite/Conf<br />失去该领域配置，请谨慎删除！！</div>}
								onCancel={() => {
									const generObj = handleDelete(record);
									const excuteResult: any = generObj.next();
									excuteResult.value.then((result: any) => {
										const { code, msg } = result;
										defaultOption(code, msg);
									})
								}}
								okText="取消"
								cancelText="确定删除"
								icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}>
								<span className={styles.fail_detail_operation}>删除</span>
							</Popconfirm>
						</Form>
					</Space>
				)
			}
		}
	]

	const handleAddScript = () => {
		addScript.current?.show('新建领域')
	}
	const hanldeEdit = (record: any) => {
		addScript.current?.show('编辑领域', record)
	}

	/**
	 * @author jpt
	 * @description 业务测试
	 **/
	const handleAddBusiness = () => {
		addBusiness.current?.show('新建业务测试')
	}
	const addClick = () => {
		if (key === 'business') {
			handleAddBusiness()
		} else if (key === 'domainconf') {
			handleAddScript()
		} else {
			newSuite()
		}
	}
	const businessCallback = ({ type, record }: any) => {
		if (type === 'edit') {
			addBusiness.current?.show('编辑业务测试', record)
		}
	}

	// 刷新business列表
	const refreshCallback = (info: any) => {
		businessList.current?.refresh(info)
	}

	return (
		<TestContext.Provider
			value={{
				selectedRowKeys,
				selectedRow,
				domainList,
				key,
				confDrawerShow: confDrawer.current?.show,
				confRefresh,
				setConfRefresh,
				setSelectedRowKeys,
				setSelectedRow,
			}}
		>
			<TabCard
				title={
					<Tabs activeKey={key} onChange={handleTab}  >
						<TabPane
							tab="功能测试"
							key="functional"
						/>
						<TabPane
							tab="性能测试"
							key="performance"
						/>
						{/* <TabPane
							tab="业务测试"
							key="business"
						/> */}
						<TabPane
							tab="领域配置"
							key="domainconf"
						/>
					</Tabs>
				}
				extra={
					<Button key="3" type="primary" onClick={addClick} >
						新增
					</Button>
				}
				className={styles.warp}
			>
				{['functional', 'performance'].includes(key) &&
					<Alert type="success"
						showIcon
						style={{ marginBottom: 16, height: 32 }}
						message={<span className={styles.synchronousTime}>缓存周期5分钟，上次缓存tone用例时间：{time}</span>}
						action={<span className={styles.synchronous} onClick={handleSynchronous}>同步</span>}
					/>
				}

				{key == 'business' ? (
					<BusinessList ref={businessList} callback={businessCallback} />
				) : (
					<Spin spinning={loading}>
						<Table
							size={'small'}
							onChange={
								(pagination: any, filters: any, sorter: any) => {
									const { order, field } = sorter;
									switch (order) {
										case undefined:
											if (field === 'gmt_created') return setDomainUpdateParmas({ ...domainUpdateParmas, gmt_created: undefined })
											if (field === 'gmt_modified') return setDomainUpdateParmas({ ...domainUpdateParmas, gmt_modified: undefined })
										case 'descend':
											if (field === 'gmt_created') return setDomainUpdateParmas({ ...domainUpdateParmas, gmt_created: '-gmt_created' })
											if (field === 'gmt_modified') return setDomainUpdateParmas({ ...domainUpdateParmas, gmt_modified: '-gmt_modified' })
											break;
										case 'ascend':
											if (field === 'gmt_created') return setDomainUpdateParmas({ ...domainUpdateParmas, gmt_created: '+gmt_created' })
											if (field === 'gmt_modified') return setDomainUpdateParmas({ ...domainUpdateParmas, gmt_modified: '+gmt_modified' })
											break;
										default:
											break;
									}
								}
							}
							columns={key === 'domainconf' ? columnsDomain : columns}
							dataSource={key === 'domainconf' ? domainList : data.data}
							rowKey={record => record.id + ''}
							pagination={false}
							expandable={
								key === 'domainconf' ? {} :
									{
										expandedRowRender: (record) => <CaseTable id={record.id} type={key} />,
										onExpand: (_, record) => {
											_ ? onExpand(record) : setExpandKey([])
										},
										expandedRowClassName: () => 'case_expand_row',
										expandedRowKeys: expandKey,
										expandIcon: ({ expanded, onExpand, record }) =>
											expanded ? (<CaretDownFilled onClick={e => onExpand(record, e)} />) :
												(<CaretRightFilled onClick={e => onExpand(record, e)} />)
									}
							}
							scroll={{ x: 1470 }}
						/>
						{
							selectedRowKeys.length > 0 && <BatchDelete />
						}
						<Row justify="space-between" style={{ padding: '16px 20px 0' }}>
							<div>
								共{totalTotal(key === 'domainconf' ? domainListInfo.domainTotal : data.total)}条
							</div>
							<Pagination
								className={totalPaginationClass(key === 'domainconf' ? domainListInfo.domainTotal : data.total)}
								showQuickJumper
								showSizeChanger
								size="small"
								current={page}
								defaultCurrent={1}
								onChange={(page_num: number, page_size: any) => handlePage(page_num, page_size)}
								onShowSizeChange={(page_num: number, page_size: any) => handlePage(page_num, page_size)}
								total={key === 'domainconf' ? domainListInfo.domainTotal : data.total}
							/>
						</Row>
					</Spin>
				)}

				<Drawer
					visible={sync}
					width={0}
					getContainer={false}
				/>
				<SuiteEditer test_type={testType} ref={suiteEditDrawer} onOk={submitSuite} domainList={domainList}
				/>
				<DesFastEditDrawer
					ref={edscFastEditer}
					onOk={onDesSubmit}
				/>
				<Modal
					title="删除提示"
					centered={true}
					className={styles.modalChange}
					visible={deleteVisible}
					//onOk={remOuter}
					onCancel={() => setDeleteVisible(false)}
					footer={[
						<Button key="submit" onClick={remOuter}>
							确定删除
						</Button>,
						<Button key="back" type="primary" onClick={() => setDeleteVisible(false)}>
							取消
						</Button>
					]}
					width={600}
					maskClosable={false}
				>
					<div style={{ color: 'red', marginBottom: 5 }}>
						<ExclamationCircleOutlined style={{ marginRight: 4 }} />
						该Suite({deleteObj.name})已被Worksapce引用，删除后将影响以下Workspace的Test Suite管理列表，以及应用该Suite的Job、模板、计划，请谨慎删除！！
					</div>
					<div style={{ color: 'rgba(0,0,0,0.45)', marginBottom: 5 }}>
						删除suite影响范围：运行中的job、测试模板、对比分析报告
					</div>
					<div style={{ color: '#1890FF', cursor: 'pointer' }} onClick={handleDetail}>查看引用详情</div>
				</Modal>
				<Modal
					title="删除提示"
					centered={true}
					className={styles.modalChange}
					visible={deleteDefault}
					onCancel={() => setDeleteDefault(false)}
					footer={[
						<Button key="submit" onClick={remOuter}>
							确定删除
						</Button>,
						<Button key="back" type="primary" onClick={() => setDeleteDefault(false)}>
							取消
						</Button>
					]}
					width={300}
				>
					<div style={{ color: 'red', marginBottom: 5 }}>
						<ExclamationCircleOutlined style={{ marginRight: 4, verticalAlign: 'middle' }} />
						确定要删除吗？
					</div>
				</Modal>
				{key === 'domainconf' && <AddScripotDrawer ref={addScript} setPage={setPage} onOk={getDomainList} />}

				{/** 新增业务测试 */}
				<AddBusinessDrawer ref={addBusiness} callback={refreshCallback} />
			</TabCard>
			<ConfEditDrawer ref={confDrawer} onOk={submitCase} />
		</TestContext.Provider>
	);
};

export default SuiteManagement;
