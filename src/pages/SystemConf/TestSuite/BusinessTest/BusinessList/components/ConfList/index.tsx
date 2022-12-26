import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { Popover, Tooltip, Space, message, Button, Popconfirm, Modal, Checkbox, Typography } from 'antd';
import { FilterFilled, ExclamationCircleOutlined } from '@ant-design/icons';
import { useIntl, FormattedMessage } from 'umi'
import moment from 'moment';
import CommonTable from '@/components/Public/CommonTable';
import PopoverEllipsis from '@/components/Public/PopoverEllipsis';
import AddConfDrawer from './AddConfDrawer';
import { delCase, queryConf, delBentch } from '../../../../service';
import { queryConfirm } from '@/pages/WorkSpace/JobTypeManage/services';
import styles from './index.less';

/**
 * @module 业务测试
 * @description conf级列表
 */
export default forwardRef(({ suite_id, test_type, domainList, }: any, ref: any) => {
	const { formatMessage } = useIntl()
	const [loading, setLoading] = useState<any>(false)
	const [data, setData] = useState<any>({ data: [], total: 0, page_num: 1, page_size: 10 })
	// 复选行
	const [selectedRow, setSelectedRow] = useState<any>([])
	const [selectedRowKeys, setSelectedRowKeys] = useState<any[]>([])
	const addConfDrawer: any = useRef(null)
	// 删除
	const [deleteState, setDeleteState] = useState<any>({ visible: false, success: '', action: '' }) // action:单个/批量删除
	const [deleteRow, setDeleteRow] = useState<any>({})
	const [deleteLoading, setDeleteLoading] = useState<boolean>(false)

	// 1.请求列表数据
	const getTableData = async (query: any) => {
		setLoading(true)
		try {
			const res: any = await queryConf({ suite_id, ...query });
			const { code, msg } = res || {}
			if (code === 200) {
				setData(res)
			} else {
				message.error(msg || formatMessage({ id: 'request.failed' }));
			}
			setLoading(false)
		} catch (e) {
			setLoading(false)
		}
	}
	// 2.单个删除
	const submitDelConf = async () => {
		setDeleteLoading(true)
		try {
			const { code, msg }: any = await delCase(deleteRow.id) || {};
			if (code === 200) {
				message.success(formatMessage({ id: 'request.delete.success' }));
				// *判断单个删除行时，对批量选中行的影响
				if (selectedRowKeys.includes(deleteRow.id)) {
					const tempKeys = selectedRowKeys.filter((item) => item !== deleteRow.id)
					const tempRows = selectedRow.filter((item: any) => item.id !== deleteRow.id)
					setSelectedRowKeys(tempKeys)
					setSelectedRow(tempRows)
				}
				onCancel()
				getTableData({ page_num: data.page_num, page_size: data.page_size })
			} else {
				message.error(msg || formatMessage({ id: 'request.delete.failed' }));
			}
			setDeleteLoading(false)
		} catch (e) {
			console.log(e)
			setDeleteLoading(false)
		}
	}
	// 3.批量删除
	const deleteAll = async () => {
		const { code, msg } = await delBentch({ id_list: selectedRowKeys.join() }) || {}
		if (code === 200) {
			// 初始化状态&&关闭对话框
			setSelectedRow([])
			setSelectedRowKeys([])
			onCancel()
			// 刷新表格数据
			getTableData({ page_num: 1, page_size: data.page_size })
		} else {
			message.error(msg || formatMessage({ id: 'operation.batch.delete.failed' }));
		}
	}
	// 4.查看引用
	const handleDetail = () => {
		const type = deleteState.action

		let newData: any = []
		selectedRow.map((item: any) => newData.push(item.name))
		if (type == 'multiple') {
			window.open(`/refenerce/conf/?name=${newData.join(',')}&id=${selectedRowKeys.join(',')}`)
		} else {
			window.open(`/refenerce/conf/?name=${deleteRow.name}&id=${deleteRow.id}`)
		}
	}

	useEffect(() => {
		getTableData({ page_num: 1, page_size: data.page_size })
	}, []);

	// 刷新列表
	useImperativeHandle(
		ref,
		() => ({
			refresh: ({ refreshId }: any) => {
				// console.log('refreshId:', refreshId)
				if (suite_id === refreshId && data?.data?.length === 0) {
					getTableData({ page_num: 1, page_size: data.page_size })
				}
			}
		})
	)

	// 打开对话框
	const onOk = (data: any, record: any, action: any) => {
		// 删除查询：201表示可以直接删除，200表示有引用
		if (data.code === 200) {
			setDeleteState({ visible: true, success: 200, action })
		} else if (data.code === 201) {
			setDeleteState({ visible: true, success: 201, action })
		}
		setDeleteRow(record)
	}
	// 关闭对话框
	const onCancel = () => {
		setDeleteState({ visible: false, success: '', action: '' });
		setDeleteRow({});
	}
	// 确定删除
	const onSubmit = () => {
		if (deleteState.action === 'single') {
			submitDelConf();
		} else if (deleteState.action === 'multiple') {
			deleteAll();
		}
	}

	const handelAddOrEdit = ({ type, record = {} }: any) => {
		if (type === 'add') {
			addConfDrawer.current?.show('new', { ...record })
		} else if (type === 'edit') {
			addConfDrawer.current?.show('edit', { ...record })
		}
	}
	const handelCallback = (info: any) => {
		if (info.type === 'editAll') {
			setSelectedRow([])
			setSelectedRowKeys([])
		}
		getTableData({ page_num: 1, page_size: data.page_size })
	}

	// 单个删除前查询
	const queryDeleteSingle = async ({ record = {} }: any) => {
		try {
			const data = await queryConfirm({ flag: 'pass', case_id_list: record.id }) || {}
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
			const data = await queryConfirm({ flag: 'pass', case_id_list: selectedRowKeys.join() }) || {}
			if (data.code) {
				onOk(data, {}, 'multiple')
			}
		} catch (e) {
			console.log(e)
		}
	}

	// 批量编辑
	const editAll = () => {
		addConfDrawer.current.show('batch.edit', { editAll: true })
	}

	// 1.业务测试
	const [columns, setColumns] = React.useState([
		{
			title: 'Test Conf',
			dataIndex: 'name',
			fixed: 'left',
			width: 150,
			render: (text: any) => <PopoverEllipsis title={text} />,
		},
		{
			title: <FormattedMessage id="TestSuite.domain" />,
			dataIndex: 'domain_name_list',
			width: 100,
			render: (text: any) => <PopoverEllipsis title={text} />
		},
		{
			title: <FormattedMessage id="TestSuite.timeout" />,
			dataIndex: 'timeout',
			width: 150,
			// onCell: () => ({ style: { maxWidth: 130 } }),
			render: (text: any) => <span>{text || '-'}</span>,
		},
		{
			title: <FormattedMessage id="TestSuite.default.repeat" />,
			dataIndex: 'repeat',
			width: 110,
			render: (text: any) => <span>{text || '-'}</span>,
		},
		{
			title: <FormattedMessage id="TestSuite.ci_type" />,
			dataIndex: 'ci_type',
			width: 110,
			render: (text: any) => {
				return <PopoverEllipsis title={text} />
			}
		},
		{
			title: <FormattedMessage id="TestSuite.gmt_created" />,
			dataIndex: 'gmt_created',
			width: 170,
			render: (text: any) => {
				return <PopoverEllipsis title={text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '-'} width={170} />
			}
		},
		{
			title: <FormattedMessage id="TestSuite.desc" />,
			dataIndex: 'description',
			width: 200,
			render: (text: any) => <PopoverEllipsis title={text} />,
		},
		{
			title: (
				<Space>
					<FormattedMessage id="Table.columns.operation" />
					<Button type="primary" onClick={() => handelAddOrEdit({ type: 'add' })}>
						<FormattedMessage id="operation.new" />
					</Button>
				</Space>
			),
			width: 150,
			fixed: 'right',
			render: (text: any, record: any) => {
				return (<div>
					<Space>
						<a><span onClick={() => handelAddOrEdit({ type: 'edit', record })}><FormattedMessage id="operation.edit" /></span></a>
						<a><span onClick={() => queryDeleteSingle({ record })}><FormattedMessage id="operation.delete" /></span></a>
					</Space>
				</div>
				)
			},
		}
	]);

	const onChange = (page: number, pageSize: number) => {
		getTableData({ page_num: page, page_size: pageSize })
	}
	const rowSelection = {
		selectedRowKeys,
		onChange: (selectedRowKeys: any[], selectedRows: any) => {
			setSelectedRow(selectedRows)
			setSelectedRowKeys(selectedRowKeys)
		}
	}

	let list = data.data, total = data.total, pageNum = data.page_num, pageSize = data.page_size
	return (
		<div>
			<CommonTable className={styles.confList_root}
				columns={columns}
				setColumns={setColumns}
				dataSource={list}
				loading={loading}
				page={pageNum}
				pageSize={pageSize}
				total={total}
				handlePage={onChange}
				rowSelection={rowSelection}
				// scrollType={1100}
				scroll={{ x: 1100 }}
				paginationBottom={true}
			/>
			<Modal title={<FormattedMessage id="delete.tips" />}
				centered={true}
				okText={<FormattedMessage id="operation.delete" />}
				cancelText={<FormattedMessage id="operation.cancel" />}
				visible={deleteState.visible}
				onCancel={onCancel}
				width={['', 201].includes(deleteState.success) ? 300 : 600}
				maskClosable={false}
				footer={[
					<Button key="submit" onClick={onSubmit} loading={deleteLoading}>
						<FormattedMessage id="operation.confirm.delete" />
					</Button>,
					<Button key="back" type="primary" onClick={onCancel}>
						<FormattedMessage id="operation.cancel" />
					</Button>
				]}
			>
				<>
					{/** 200表示有引用; 201表示可以直接删除 */}
					{['', 201].includes(deleteState.success) ? (
						<div style={{ color: 'red', marginBottom: 5 }}>
							<ExclamationCircleOutlined style={{ marginRight: 4, verticalAlign: 'middle' }} />
							<FormattedMessage id="delete.prompt" />
						</div>
					) : (
						<div>
							<div style={{ color: 'red', marginBottom: 5 }}>
								<ExclamationCircleOutlined style={{ marginRight: 4 }} />
								{deleteState.action === 'single' ?
									formatMessage({ id: 'TestSuite.conf.name.delete.warning' }, { data: deleteRow.name })
									:
									formatMessage({ id: 'TestSuite.have.conf.delete.warning' })
								}
							</div>
							<div style={{ color: 'rgba(0,0,0,0.45)', marginBottom: 5 }}>
								<FormattedMessage id="TestSuite.conf.delete.range" />
							</div>
							<div style={{ color: '#1890FF', cursor: 'pointer' }} onClick={handleDetail}><FormattedMessage id="view.reference.details" /></div>
						</div>
					)}
				</>
			</Modal>

			{selectedRowKeys.length > 0 &&
				<div className={styles.deleteAll}>
					<Space>
						<Checkbox indeterminate={true} />
						<Typography.Text>
							{formatMessage({ id: 'selected.item' }, { data: selectedRowKeys?.length })}
						</Typography.Text>
						<Button type="link" onClick={() => { setSelectedRow([]); setSelectedRowKeys([]) }}><FormattedMessage id="operation.cancel" /></Button>
					</Space>
					<Space>
						<Button onClick={queryDeleteAll}><FormattedMessage id="operation.batch.delete" /></Button>
						<Button type="primary" onClick={editAll}><FormattedMessage id="operation.batch.edit" /></Button>
					</Space>
				</div>
			}

			<AddConfDrawer ref={addConfDrawer} callback={handelCallback}
				test_suite_id={suite_id}
				test_type={test_type}
				domainList={domainList}
				confIds={selectedRowKeys}
			/>
		</div>
	)
});
