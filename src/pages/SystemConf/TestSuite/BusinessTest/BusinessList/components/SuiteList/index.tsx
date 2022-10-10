import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { Popover, Tooltip, Space, message, Button, Modal, Affix, Row, Checkbox, Typography, Popconfirm } from 'antd';
import { FilterFilled, CaretRightFilled, CaretDownFilled, ExclamationCircleOutlined } from '@ant-design/icons';
import ButtonEllipsis from '@/components/Public/ButtonEllipsis';
import CommonTable from '@/components/Public/CommonTable';
import PopoverEllipsis from '@/components/Public/PopoverEllipsis';
import { test_type_enum, runList } from '@/utils/utils'
import ConfList from '../ConfList';
import AddSuiteDrawer from './AddSuiteDrawer';
// import CaseTable from '../../../../BasicTest/components/CaseTable';
import FuncOrPerfConfList from '../../../FuncOrPerfConfList';
import { querySuiteList, getDomain, syncSuite, delSuite, queryDelSuiteAll, deleteBusinessSuiteAll } from '../../../../service';
import { deleteJob, queryConfirm } from '@/pages/WorkSpace/JobTypeManage/services';
import styles from './index.less';

/**
 * @module 业务测试
 * @description suite级列表
 */
export default forwardRef(({ business_id, rowSelectionCallback = () => { }, restId, restFlag, deleteAllId }: any, ref: any) => {
	const [loading, setLoading] = useState<any>(false)
	const [data, setData] = useState<any>({ data: [], total: 0, page_num: 1, page_size: 10 })
	// 复选行
	const [selectedRow, setSelectedRow] = useState<any>([])
	const [selectedRowKeys, setSelectedRowKeys] = useState<any[]>([])
	// 展开的行id
	const [expandKeys, setExpandKeys] = useState<string[]>([])
	// 领域数据
	const [domainList, setDomainList] = useState<string[]>([])
	const addSuiteDrawer: any = useRef(null)
	const caseTable: any = useRef(null)
	const confTable: any = useRef(null)
	// 删除提示对话框
	const [deleteState, setDeleteState] = useState<any>({ visible: false, result: '', action: '' }) // action:单个/批量删除
	const [deleteRow, setDeleteRow] = useState<any>({})
	const [deleteLoading, setDeleteLoading] = useState<boolean>(false)

	// 1.请求列表数据
	const getTableData = async (query: any) => {
		setLoading(true)
		try {
			const res: any = await querySuiteList({ business_id, ...query });
			const { code, msg } = res || {}
			if (code === 200) {
				setData(res)
			} else {
				message.error(msg || '请求数据失败');
			}
			setLoading(false)
		} catch (e) {
			setLoading(false)
		}
	}
	// 2.请求领域数据
	const getDomainList = async () => {
		try {
			const { code, data = [], msg }: any = await getDomain(null) || {};
			if (code === 200) {
				setDomainList(data)
			} else {
				message.error(msg || '请求数据失败');
			}
		} catch (e) {
			console.log(e)
		}
	}
	// 3.同步
	const getSyncSuite = async (id: any) => {
		setLoading(true)
		try {
			const { code, msg }: any = await syncSuite(id) || {};
			if (code === 200) {
				message.success('同步成功');
				getTableData({ page_num: data.page_num, page_size: data.page_size })
				// case2.展开并刷新conf列表
				if (expandKeys.includes(id)) {
					// 刷新conf列表
					caseTable.current?.refresh({ refreshId: id })
				} else {
					const ids = expandKeys.concat([id])
					setExpandKeys(ids)
				}

			} else {
				message.error(msg || '同步失败');
			}
			setLoading(false)
		} catch (e) {
			setLoading(false)
		}
	}
	// 4.单个删除
	const getDelSuite = async () => {
		setDeleteLoading(true)
		try {
			const { code, msg }: any = await delSuite(deleteRow.id) || {};
			if (code === 200) {
				message.success('删除成功');
				// *判断单个删除行时，对批量选中行的影响
				if (selectedRowKeys.includes(deleteRow.id)) {
					const tempKeys = selectedRowKeys.filter((item) => item !== deleteRow.id)
					const tempRows = selectedRow.filter((item: any) => item.id !== deleteRow.id)
					setSelectedRowKeys(tempKeys)
					setSelectedRow(tempRows)
					// 回调父级重置状态
					if (tempKeys.length) {
						rowSelectionCallback({ business_id, selectedRowKeys: tempKeys })
					} else {
						rowSelectionCallback({})
					}
				}
				onCancel()
				getTableData({ page_num: data.page_num, page_size: data.page_size })
			} else {
				message.error(msg || '删除失败');
			}
			setDeleteLoading(false)
		} catch (e) {
			console.log(e)
			setDeleteLoading(false)
		}
	}
	// 5.批量删除
	const getDelSuiteAll = async () => {
		if (selectedRowKeys.length) {
			setLoading(true)
			try {
				const res = await deleteBusinessSuiteAll({ id_list: selectedRowKeys.join() }) || {}
				if (res.code === 200) {
					message.success('批量删除成功');
					// case1.初始化状态&&关闭对话框
					setSelectedRow([])
					setSelectedRowKeys([])
					onCancel()
					// case2.刷新表格数据
					getTableData({ page_num: 1, page_size: data.page_size })
					// case3.回调父级重置状态
					rowSelectionCallback({})
				} else {
					message.error(res.msg || '批量删除失败');
				}
				setLoading(false)
			} catch (e) {
				setLoading(false)
			}
		}
	}
	// 6.查看引用详情
	const handleDetail = () => {
		const type = deleteState.action
		let newData: any = []
		selectedRow.map((item: any) => newData.push(item.name))
		if (type === 'multiple') {
			window.open(`/refenerce/conf/?name=${newData.join(',')}&id=${selectedRowKeys.join(',')}`)
		} else if (type === 'single') {
			window.open(`/refenerce/suite/?name=${deleteRow.name}&id=${deleteRow.id}`)
		}
	}

	// 打开对话框
	const onOk = (data: any, record: any, action: any) => {
		// 删除查询：200表示有引用，201表示可以直接删除
		if (data.code === 200) {
			setDeleteState({ visible: true, result: 200, action })
		} else if (data.code === 201) {
			setDeleteState({ visible: true, result: 201, action })
		}
		setDeleteRow(record)
	}

	// 关闭对话框
	const onCancel = () => {
		setDeleteState({ visible: false, result: '', action: '' });
		setDeleteRow({});
	}
	// 确定删除
	const onSubmit = () => {
		if (deleteState.action === 'single') {
			getDelSuite();
		} else if (deleteState.action === 'multiple') {
			getDelSuiteAll();
		}
	}

	useEffect(() => {
		getTableData({ page_num: 1, page_size: data.page_size })
		getDomainList()
	}, []);

	useEffect(() => {
		// 取消表格的选中状态
		if (restId && business_id === restId) {
			setSelectedRow([]);
			setSelectedRowKeys([]);
		}
	}, [restId, restFlag]);

	useEffect(() => {
		if (business_id === deleteAllId && deleteAllId) {
			// 批量删除查询
			queryDeleteAll();
		}
	}, [deleteAllId]);

	useImperativeHandle(
		ref,
		() => ({
			refresh: ({ refreshId }: any) => {
				// 刷新列表
				if (business_id === refreshId && data?.data?.length === 0) {
					getTableData({ page_num: 1, page_size: data.page_size })
					getDomainList()
				}
			},
		})
	)

	/************新增|编辑 start ********************/
	const handelAddOrEdit = ({ type, record = {} }: any) => {
		if (type === 'add') {
			addSuiteDrawer.current?.show('新增Test Suite', { business_id, ...record })
		} else if (type === 'edit') {
			const row = {
				...record,
				is_default: record.is_default ? 1 : 0,
				certificated: record.certificated ? 1 : 0,
			}
			addSuiteDrawer.current?.show('编辑Test Suite', { business_id, ...row })
		}
	}
	const handelCallback = () => {
		getTableData({ page_num: 1, page_size: data.page_size })
	}
	/************新增|编辑 end ********************/

	// 单个删除前查询
	const queryDeleteSingle = async ({ record = {} }: any) => {
		try {
			const data = await queryConfirm({ flag: 'pass', suite_id: record.id }) || {}
			if (data.code) {
				onOk(data, record, 'single')
			}
		} catch (e) {
			console.log(e)
		}
	}
	// 批量删除前查询
	const queryDeleteAll = async () => {
		try {
			const data = await queryDelSuiteAll({ flag: 'pass', suite_id_list: selectedRowKeys.join() }) || {}
			if (data.code) {
				onOk(data, {}, 'multiple')
			}
		} catch (e) {
			console.log(e)
		}
	}

	let columns: any = [
		{
			title: 'Test Suite',
			dataIndex: 'name',
			fixed: 'left',
			width: 120,
			render: (text: any) => <PopoverEllipsis title={text} />,
		},
		{
			title: '领域',
			dataIndex: 'domain_name_list',
			width: 100,
			render: (text: any) => <PopoverEllipsis title={text || '-'} />
		},
		{
			title: '测试类型',
			dataIndex: 'test_type',
			onCell: () => ({ style: { maxWidth: 100 } }),
			render: (text: any) => {
				return <>
					{test_type_enum.map((item: any) => {
						return item.value === text ? <span key={item.value}>{item.name || '-'}</span> : null
					})
					}
				</>
			},
		},

		{
			title: '默认用例',
			dataIndex: 'is_default',
			render: (text: any) => {
				return <span>{text ? '是' : '否'}</span>
			}
		},
		{
			title: '是否认证',
			dataIndex: 'certificated',
			onCell: () => ({ style: { maxWidth: 100 } }),
			render: (text: any) => {
				return <span>{text ? '是' : '否'}</span>
			}
		},
		{
			title: '运行模式',
			dataIndex: 'run_mode',
			onCell: () => ({ style: { maxWidth: 100 } }),
			render: (text: any) => {
				return <>
					{runList.map((item: any) => {
						return item.id === text ? <span key={item.id}>{item.name || '-'}</span> : null
					})
					}
				</>
			}
		},
		{
			title: '创建时间',
			dataIndex: 'gmt_created',
			width: 170,
			render: (text: any) => {
				return <PopoverEllipsis title={text || '-'} />
			}
		},
		{
			title: '说明',
			dataIndex: 'doc',
			width: 150,
			// onCell: () => ({ style: { maxWidth: 150 } }),
			render: (text: any) => <div>{text ? <ButtonEllipsis title={text} width={150} isCode={true}>
				<span>{null}</span></ButtonEllipsis> : '-'}</div>,
		},
		{
			title: '备注',
			dataIndex: 'description',
			onCell: () => ({ style: { maxWidth: 150 } }),
			render: (text: any) => <PopoverEllipsis title={text} />,
		},
		{
			title: (<div>操作<Button type="primary" onClick={() => handelAddOrEdit({ type: 'add' })} style={{ marginLeft: 8 }}>新增</Button></div>),
			width: 150,
			fixed: 'right',
			render: (text: any, record: any) => {
				return (
					<div>
						<Space>
							{(record.test_type === 'business') ? (
								<span>&emsp;&emsp;</span>
							) : (
								<a><span onClick={() => getSyncSuite(record.id)}>同步</span></a>
							)}
							<a><span onClick={() => handelAddOrEdit({ type: 'edit', record })}>编辑</span></a>
							<a><span onClick={() => queryDeleteSingle({ record })}>删除</span></a>
						</Space>
					</div>
				)
			},
		}
	];

	const onChange = (page: number, pageSize: number) => {
		getTableData({ page_num: page, page_size: pageSize })
	}

	const rowSelection = {
		selectedRowKeys,
		onChange: (selectedRowKeys: any[], selectedRows: any) => {
			setSelectedRow(selectedRows)
			setSelectedRowKeys(selectedRowKeys)
			// 数据回传父级
			rowSelectionCallback({ business_id, selectedRowKeys })
		}
	}

	let list = data.data, total = data.total, pageNum = data.page_num, pageSize = data.page_size
	return (
		<div>
			<CommonTable className={styles.suitList_root}
				columns={columns}
				list={list}
				loading={loading}
				page={pageNum}
				pageSize={pageSize}
				total={total}
				handlePage={onChange}
				rowSelection={rowSelection}
				expandable={{
					expandedRowRender: (record: any) => {
						// 根据"测试类型"区分不同的conf列表
						const { test_type } = record
						 
						if (test_type === 'functional' || test_type === 'performance') {
							// 功能测试、性能测试的conf列表
							return <FuncOrPerfConfList id={record.id} type={test_type} domainList={domainList} ref={caseTable} />
						} else if (test_type === 'business') {
							// 业务测试的conf列表
							return <ConfList suite_id={record.id} {...record} domainList={domainList} ref={confTable} />
						}
						return <div>{null}</div>
					},
					onExpand: (_: any, record: any) => {
						if (_) {
							setExpandKeys([record.id])
							// 刷新conf列表
							confTable.current?.refresh({ refreshId: record.id })
						} else {
							setExpandKeys([])
						}
					},
					expandedRowKeys: expandKeys,
					expandIcon: ({ expanded, onExpand, record }: any) =>
						expanded ? (<CaretDownFilled onClick={e => onExpand(record, e)} />) :
							(<CaretRightFilled onClick={e => onExpand(record, e)} />)
				}}
				// scrollType={1250}
				scroll={{ x: 1250 }}
				paginationBottom={true}
			/>
			<Modal title="删除提示"
				centered={true}
				okText="删除"
				cancelText="取消"
				visible={deleteState.visible}
				onCancel={onCancel}
				width={['', 201].includes(deleteState.result) ? 300 : 600}
				maskClosable={false}
				footer={[
					<Button key="submit" onClick={onSubmit} loading={deleteLoading}>
						确定删除
					</Button>,
					<Button key="back" type="primary" onClick={onCancel}>
						取消
					</Button>
				]}
			>
				<>
					{/** 200表示有引用；201表示可以直接删除。 */}
					{['', 201].includes(deleteState.result) ? (
						<div style={{ color: 'red', marginBottom: 5 }}>
							<ExclamationCircleOutlined style={{ marginRight: 4, verticalAlign: 'middle' }} />
							确定要删除吗？
						</div>
					) : (
						<>
							<div style={{ color: 'red', marginBottom: 5 }}>
								<ExclamationCircleOutlined style={{ marginRight: 4 }} />
								{`${deleteState.action === 'single' ? `该Suite(${deleteRow.name})` : `有Suite`}已被Worksapce引用，删除后将影响以下Workspace的Test Suite管理列表，以及应用该Suite的Job、模板、计划，请谨慎删除！！`}
							</div>
							<div style={{ color: 'rgba(0,0,0,0.45)', marginBottom: 5 }}>
								删除suite影响范围：运行中的job、测试模板、对比分析报告
							</div>
							<div style={{ color: '#1890FF', cursor: 'pointer' }} onClick={handleDetail}>查看引用详情</div>
						</>
					)}
				</>
			</Modal>

			<AddSuiteDrawer ref={addSuiteDrawer} callback={handelCallback} domainList={domainList} />
		</div>
	)
});
