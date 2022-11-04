import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { Popover, Tooltip, Space, message, Popconfirm, Modal, Button, Checkbox, Typography, Spin } from 'antd';
import { FilterFilled, CaretRightFilled, CaretDownFilled, ExclamationCircleOutlined } from '@ant-design/icons';
import { useIntl, FormattedMessage, useModel } from 'umi';
import moment from 'moment';
import CommonTable from '@/components/Public/CommonTable';
import PopoverEllipsis from '@/components/Public/PopoverEllipsis';
import SelectDrop from '@/components/Public//SelectDrop';
import SearchInput from '@/components/Public/SearchInput';
import SuiteList from './components/SuiteList';
import { queryBusinessList, deleteBusiness } from '../../service';
import styles from './index.less';
import { AddBusinessDrawer } from '@/pages/SystemConf/TestSuite/BusinessTest';
import { TestContext } from '../../Provider'
import { useClientSize } from '@/utils/hooks';

/**
 * 系统级-业务测试
 */
export default forwardRef(( props : any, ref: any) => {
	const { formatMessage } = useIntl()
	const [loading, setLoading] = useState<any>(true)
	const [data, setData] = useState<any>({ data: [], total: 0, page_num: 1 })
	const [pageSize, setPageSize] = useState<number>(10);
	// 展开的行id
	const [expandKeys, setExpandKeys] = useState<string[]>([])
	const [filterQuery, setFilterQuery] = useState<any>({})
	const [autoFocus, setFocus] = useState<boolean>(true)
	const [service_name, setServiceName] = useState<string>('')
	const [creator, setCreator] = useState<number>()
	// 删除
	const [deleteVisible, setDeleteVisible] = useState<boolean>(false)
	const [deleteRow, setDeleteRow] = useState<any>({})
	const suiteTable: any = useRef(null)
	// 批量操作
	const [selectedSuites, setSelectedSuites] = useState<any>({ businessId: '', selectedSuiteKeys: [] })
	const [restId, setRestId] = useState<any>('')
	const [restFlag, setRestFlag] = useState<any>(false) // 重置上一个子表格的选中状态。
	const [deleteAllId, setDeleteAllId] = useState<any>('') // 状态。

	const AddTestDrawer = useRef<any>()
	// 1.请求数据
	const getTableData = async (query: any) => {
		setLoading(true)
		try {
			const res: any = await queryBusinessList({ ...filterQuery, ...query }) || {};
			const { code, msg } = res
			if (code === 200) {
				setData(res)
			} else {
				message.error(msg || formatMessage({id: 'request.failed'}) );
			}
			setLoading(false)
		} catch (e) {
			setLoading(false)
		}
	}

	useEffect(() => {
		const query = { page_num: 1, page_size: pageSize, name: service_name, creator }
		setFilterQuery(query)
		getTableData(query)
	}, [service_name, creator]);

	// 刷新列表
	useImperativeHandle(
		ref,
		() => ({
			refresh: () => {
				if (service_name || creator) {
					// case1.通过重置查询条件触发，刷新列表。
					setServiceName('')
					setCreator(undefined)
				} else {
					// case2.刷新列表。
					getTableData({ page_num: 1, page_size: pageSize })
				}
			},
			openCreateDrawer: AddTestDrawer.current.show
		})
	)

	// 确定删除
	const handelDelete = async (record: any) => {
		setLoading(true)
		onCancel()
		try {
			const { code, msg }: any = await deleteBusiness(record) || {};
			if (code === 200) {
				message.success(formatMessage({id: 'request.delete.success'}) );
				getTableData(filterQuery)
			} else {
				message.error(msg || formatMessage({id: 'request.delete.failed'}) );
			}
			setLoading(false)
		} catch (e) {
			setLoading(false)
		}
	}
	// 打开对话框
	const onOk = (record: any) => {
		setDeleteVisible(true);
		setDeleteRow(record);
	}
	// 关闭对话框
	const onCancel = () => {
		setDeleteVisible(false);
		setDeleteRow({});
	}

	let columns: any = [
		{
			title: <FormattedMessage id="TestSuite.business.name"/>,
			dataIndex: 'name',
			fixed: 'left',
			width: 'auto',
			filterIcon: () => <FilterFilled style={{ color: service_name ? '#1890ff' : undefined }} />,
			filterDropdown: ({ confirm }: any) => <SearchInput confirm={confirm} autoFocus={autoFocus} onConfirm={(val: string) => { setServiceName(val) }} />,
			onFilterDropdownVisibleChange: (visible: any) => {
				if (visible) {
					setFocus(!autoFocus)
				}
			},
			render: (text: any) => {
				return <PopoverEllipsis title={text} width={260} />
			},
		},
		{
			title: <FormattedMessage id="TestSuite.gmt_created"/>,
			dataIndex: 'gmt_created',
			onCell: () => ({ style: { minWidth: 170 } }),
			render: (text: any) => {
				return <PopoverEllipsis title={text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '-'} width={170} />
			}
		},
		{
			title: <FormattedMessage id="TestSuite.gmt_modified"/>,
			dataIndex: 'gmt_modified',
			onCell: () => ({ style: { minWidth: 170 } }),
			render: (text: any) => {
				return <PopoverEllipsis title={text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '-'} width={170} />
			}
		},
		{
			title: <FormattedMessage id="TestSuite.creator_name"/>,
			dataIndex: 'creator_name',
			onCell: () => ({ style: { minWidth: 150 } }),
			filterIcon: () => <FilterFilled style={{ color: creator ? '#1890ff' : undefined }} />,
			filterDropdown: ({ confirm }: any) => <SelectDrop confirm={confirm} onConfirm={(val: number) => { setCreator(val) }} />,
			onFilterDropdownVisibleChange: (visible: any) => {
				if (visible) {
					setFocus(!autoFocus)
				}
			},
			render: (text: any) => {
				return <PopoverEllipsis title={text} width={150} />
			}
		},
		{
			title: <FormattedMessage id="TestSuite.description"/>,
			dataIndex: 'description',
			render: (text: any) => {
				return <PopoverEllipsis title={text} width={200} />
			}
		},
		{
			title: <FormattedMessage id="Table.columns.operation"/>,
			width: 150,
			align: 'center',
			fixed: 'right',
			render: (text: any, record: any) => {
				return (
					<Space>
						<a><span onClick={() => AddTestDrawer.current.show(record)}><FormattedMessage id="operation.edit"/></span></a>
						<a><span onClick={() => onOk(record)}><FormattedMessage id="operation.delete"/></span></a>
					</Space>
				)
			},
		}
	];

	const onChange = (page: number, pageSize: number) => {
		getTableData({ page_num: page, page_size: pageSize })
	}

	// 批量选择操作
	const rowSelectionCallback = (info: any) => {
		const { business_id, selectedRowKeys = [] } = info
		if (business_id && selectedRowKeys.length) {
			if (business_id !== selectedSuites.businessId) {
				// 重置上一个子表格的选中状态
				setRestId(selectedSuites.businessId)
				setRestFlag(!restFlag)
			}
			setSelectedSuites({ businessId: business_id, selectedSuiteKeys: selectedRowKeys })
		} else {
			setSelectedSuites({ businessId: '', selectedSuiteKeys: [] })
		}
	}
	// 批量取消操作suite列表
	const onCancelRowSelection = () => {
		// 重置子表格的选中状态
		setRestId(selectedSuites.businessId)
		setRestFlag(!restFlag)
		setSelectedSuites({ businessId: '', selectedSuiteKeys: [] })
	}
	// 批量删除
	const deleteAll = () => {
		setDeleteAllId(selectedSuites.businessId)
	}

	// 监听当前页面宽度尺寸变化
	const { width: layoutWidth } = useClientSize()

	let list = data.data, total = data.total, pageNum = data.page_num
	return (
		<TestContext.Provider
			value={{
				selectedRowKeys: [],
				selectedRow: [],
			}}
		>
			<div className={styles.business_root}>
				<CommonTable
					className={styles.businessList}
					columns={columns}
					list={list}
					scroll={{ x: '100%' }}
					// loading={true}
					loading={loading}
					page={pageNum}
					pageSize={pageSize}
					total={total}
					handlePage={onChange}
					// rowSelection={rowSelection}
					expandable={{
						expandedRowRender: (record: any) => {
							return <SuiteList business_id={record.id} ref={suiteTable} rowSelectionCallback={rowSelectionCallback}
								restId={restId} restFlag={restFlag} deleteAllId={deleteAllId} />
						},
						onExpand: (_: any, record: any) => {
							if (_) {
								setExpandKeys([record.id]);
								// 刷新suite列表
								suiteTable.current?.refresh({ refreshId: record.id })
							} else {
								setExpandKeys([])
							}
						},
						expandedRowKeys: expandKeys,
						expandIcon: ({ expanded, onExpand, record }: any) =>
							expanded ? (<CaretDownFilled onClick={e => onExpand(record, e)} />) :
								(<CaretRightFilled onClick={e => onExpand(record, e)} />)
					}}
				/>

				<Modal title={<FormattedMessage id="delete.tips"/>}
					centered={true}
					okText={<FormattedMessage id="operation.delete"/>}
					cancelText={<FormattedMessage id="operation.cancel"/>}
					visible={deleteVisible}
					onCancel={onCancel}
					width={300}
					maskClosable={false}
					footer={[
						<Button key="submit" onClick={() => handelDelete(deleteRow)}>
							<FormattedMessage id="operation.confirm.delete"/>
						</Button>,
						<Button key="back" type="primary" onClick={onCancel}>
							<FormattedMessage id="operation.cancel"/>
						</Button>
					]}
				>
					<div style={{ color: 'red', marginBottom: 5 }}>
						<ExclamationCircleOutlined style={{ marginRight: 4, verticalAlign: 'middle' }} />
						<FormattedMessage id="delete.prompt"/>
					</div>
				</Modal>

				{/** 批量操作 */}
				{selectedSuites.selectedSuiteKeys?.length > 0 &&
					<div className={styles.deleteAll} style={{ width: (layoutWidth - 199 - 88) }}>
						<Space>
							<Checkbox indeterminate={true} />
							<Typography.Text>
							    {formatMessage({id: 'selected.item'}, {data: selectedSuites.selectedSuiteKeys?.length})}
							</Typography.Text>
							<Button type="link" onClick={onCancelRowSelection}><FormattedMessage id="operation.cancel"/></Button>
						</Space>
						<Space>
							<Button onClick={deleteAll}><FormattedMessage id="operation.batch.delete"/></Button>
						</Space>
					</div>
				}

				<AddBusinessDrawer ref={AddTestDrawer} callback={getTableData} />
			</div>
		</TestContext.Provider>
	)

});
