import React, { useState, useEffect, useRef } from 'react';
import { Button, Space, message, Modal, Popconfirm, Row, Typography } from 'antd';
import { metricList, addMetric, editMetric, delMetric, getDomain } from '../../../service';
import styles from '../../style.less';
import CommonTable from '@/components/Public/CommonTable';
import { ExclamationCircleOutlined } from '@ant-design/icons'
import DeleteMetricPopover from './DeleteMetricPopover'
import MetricEditDrawer from '../MetricEditDrawer'
import { useRequest, useIntl, FormattedMessage } from 'umi'
import { requestCodeMessage } from '@/utils/utils';
import { TestContext } from '../../../Provider'

const MetricTable: React.FC<AnyType> = (props) => {
	const { id: object_id, innerKey, componentType } = props
	const { formatMessage } = useIntl()

	const { setMetricDelInfo, metricDelInfo, selectedRowKeys } = React.useContext(TestContext)

	const [page, setPage] = useState<number>(1)
	const [pageSize, setPageSize] = useState<number>(10)
	const [expandInnerList, setExpandInnerList] = useState<any>([])
	const [expandInnerLoading, setExpandInnerLoading] = useState<boolean>(true)
	const [metricId, setMetricId] = useState<number>()
	const [refresh, setRefresh] = useState<boolean>(true)

	const metricEditer: any = useRef(null)

	const { data: domainList } = useRequest(
		getDomain,
		{ initialData: [] }
	)

	const getMetric = async (type: string) => {
		setExpandInnerList({ data: [] })
		setExpandInnerLoading(true)
		const params = { page_num: page, page_size: pageSize }
		params[type] = object_id
		const data = await metricList(params)
		setExpandInnerList(data)
		setExpandInnerLoading(false)
	}

	useEffect(() => {
		getMetric(innerKey === '1' ? 'case_id' : 'suite_id')
	}, [page, pageSize, refresh]);

	const editMetricRow = (row: any) => {
		domainList.forEach((item: any) => { if (item.name == row.domain) row.domain = item.id })
		setMetricId(row.id)
		metricEditer.current.show('edit', row)
	}

	const submitMetric = async (data: any) => {
		const params: any = {
			...data,
			...{
				object_id,
				object_type: innerKey === '1' ? 'case' : 'suite'
			}
		}

		innerKey === '1' ? metricSubmit(params) : doMetricModalFn(params)
	}

	const doMetricModalFn = (params: any) => {
		const title = formatMessage({ id: "TestSuite.is_synchronize.all.conf" })
		const okText = formatMessage({ id: "operation.yes" })
		const cancelText = formatMessage({ id: "operation.no" })
		Modal.confirm({
			title,
			icon: <ExclamationCircleOutlined />,
			okText,
			cancelText,
			maskClosable: false,
			onOk() {
				metricSubmit({ ...params, is_sync: 1 })
			},
			onCancel() {
				metricSubmit({ ...params, is_sync: 0 })
			},
		});
	}

	const metricSubmit = async (params: any) => {
		const { code, msg } = metricId ? await editMetric(metricId, params) : await addMetric(params)
		if (code === 200) {
			metricEditer.current.hide()
			setRefresh(!refresh)
		}
		else {
			requestCodeMessage(code, msg)
		}
	}

	const remMetricRow = async (params: any, is_sync?: any) => {
		const { object_type, name } = params

		const { code, msg } = innerKey === '1' ?
			await delMetric(params.id) :
			await delMetric(params.id, { is_sync, object_id, object_type, name })

		if (code === 200) {
			message.success(formatMessage({ id: 'operation.success' }));
			setRefresh(!refresh)
		}
		else requestCodeMessage(code, msg)
	}

	const newMetric = () => {
		setMetricId(undefined)
		metricEditer.current.show('new')
	}

	const DeleteMetricBtn: React.FC<any> = ({ row }) => {
		if (innerKey === '1')
			return (
				<Popconfirm
					title={<FormattedMessage id="delete.prompt" />}
					okText={<FormattedMessage id="operation.ok" />}
					cancelText={<FormattedMessage id="operation.cancel" />}
					onConfirm={() => remMetricRow(row)}
					overlayStyle={{ width: '224px' }}
				>
					<Button type="link" style={{ padding: 0, height: 'auto' }}>
						<FormattedMessage id={"operation.delete"} />
					</Button>
				</Popconfirm>
			)
		return (
			<DeleteMetricPopover
				onOk={(is_sync: any) => remMetricRow(row, is_sync)}
			/>
		)
	}

	const columns = [
		// { title: 'Metric', dataIndex: 'name'},
		{ title: <FormattedMessage id="TestSuite.conf.metric" />, dataIndex: 'name', width: 300, fixed: 'left' },
		{ title: <FormattedMessage id="TestSuite.cmp_threshold" />, dataIndex: 'cmp_threshold', width: 130, render(_: any) { return _ ? Number(_).toFixed(2) : _ } },
		{ title: <FormattedMessage id="TestSuite.cv_threshold" />, dataIndex: 'cv_threshold', width: 130, render(_: any) { return _ ? Number(_).toFixed(2) : _ } },
		{ title: <FormattedMessage id="TestSuite.direction" />, dataIndex: 'direction', width: 130 },
		{
			title: (
				<Row style={{ width: "100%" }} >
					<FormattedMessage id="Table.columns.operation" />
					<Button type='primary' size="small" onClick={() => newMetric()}>
						<FormattedMessage id="operation.new" />
					</Button>
				</Row>
			),
			valueType: 'option',
			dataIndex: 'id',
			width: 140,
			fixed: 'right',
			render: (_: number, row: any) => (
				<Space>
					<Typography.Link
						onClick={() => editMetricRow(row)}
					>
						<FormattedMessage id="operation.edit" />
					</Typography.Link>
					<DeleteMetricBtn row={row} />
				</Space>
			),
		},
	];

	const handlePage = (page_num: number, page_size: number) => {
		setPage(page_num)
		setPageSize(page_size)
	}

	const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
		setMetricDelInfo({
			innerKey,
			object_id,
			selectedRowKeys: newSelectedRowKeys,
			refresh: () => getMetric(innerKey === '1' ? 'case_id' : 'suite_id')
		})
	};

	const rowSelection = {
		selectedRowKeys: metricDelInfo?.selectedRowKeys,
		getCheckboxProps: (record: AnyType) => ({
			disabled: !!selectedRowKeys?.length, // Column configuration not to be checked
		}),
		onChange: onSelectChange,
	};

	return (
		<div className={styles.warp} key={object_id}>
			<CommonTable
				columns={columns as any}
				// scrollType={670}
				scroll={{ x: 670 }}
				rowKey="id"
				name="sys-suite-manage-basic-metric"
				loading={expandInnerLoading}
				dataSource={expandInnerList.data}
				rowSelection={rowSelection}
				page={expandInnerList.page_num}
				totalPage={expandInnerList.total_page}
				total={expandInnerList.total}
				pageSize={expandInnerList.page_size}
				handlePage={handlePage}
			/>
			<MetricEditDrawer
				onOk={submitMetric}
				ref={metricEditer}
				parentId={object_id}
				componentType={componentType}
			/>
		</div>
	);
};

export default MetricTable;


