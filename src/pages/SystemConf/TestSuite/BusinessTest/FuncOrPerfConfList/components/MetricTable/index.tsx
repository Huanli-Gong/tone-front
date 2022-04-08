import React, { useState, useEffect, useRef } from 'react';
import { Button, Space, message, Modal, Popconfirm } from 'antd';
import { metricList, addMetric, editMetric, delMetric, getDomain } from '@/pages/SystemConf/TestSuite/service';
import CommonTable from '@/components/Public/CommonTable';
import { ExclamationCircleOutlined } from '@ant-design/icons'
import DeleteMetricPopover from './DeleteMetricPopover'

import { useRequest } from 'umi'
import { requestCodeMessage } from '@/utils/utils';
import MetricEditDrawer from '../MetricEditDrawer'
import styles from '../../index.less';

const MetricTable: React.FC<any> = ({ id, innerKey, componentType }) => {
	const [page, setPage] = useState<number>(1)
	const [pageSize, setPageSize] = useState<number>(10)
	const [expandInnerList, setExpandInnerList] = useState<any>([])
	const [expandInnerLoading, setExpandInnerLoading] = useState<boolean>(true)
	const [objectId, setObjectId] = useState<number>()
	const [metricId, setMetricId] = useState<number>()
	const [refresh, setRefresh] = useState<boolean>(true)

	const metricEditer: any = useRef(null)

	const { data: domainList } = useRequest(
		getDomain,
		{ initialData: [] }
	)

	const getMetric = async (id: number, type: string) => {
		setExpandInnerList({ data: [] })
		setExpandInnerLoading(true)
		const params = { page_num: page, page_size: pageSize }
		params[type] = id
		const data = await metricList(params)
		setExpandInnerList(data)
		setExpandInnerLoading(false)
	}

	useEffect(() => {
		getMetric(id, innerKey == '1' ? 'case_id' : 'suite_id')
	}, [page, pageSize, refresh]);

	const editMetricRow = (id: number, row: any) => {
		setObjectId(id)
		domainList.forEach((item: any) => { if (item.name == row.domain) row.domain = item.id })
		setMetricId(row.id)
		metricEditer.current.show('编辑Metric', row)
	}

	const submitMetric = async (data: any) => {
		const params: any = {
			...data,
			...{
				object_id: objectId,
				object_type: innerKey == 1 ? 'case' : 'suite'
			}
		}

		innerKey == 1 ? metricSubmit(params) : doMetricModalFn(params)
	}

	const doMetricModalFn = (params: any) => {
		Modal.confirm({
			title: '否同步到该TestSuite下的所有TestConf?',
			icon: <ExclamationCircleOutlined />,
			okText: '是',
			cancelText: '否',
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
		const { object_type, object_id, name } = params

		const { code, msg } = innerKey == 1 ?
			await delMetric(params.id) :
			await delMetric(params.id, { is_sync, object_id, object_type, name })

		if (code === 200) {
			message.success('操作成功');
			setRefresh(!refresh)
		}
		else requestCodeMessage(code, msg)
	}

	const newMetric = (id: number) => {
		setObjectId(id)
		metricEditer.current.show('新增Metric')
	}

	const columns = [
		{ title: '指标', dataIndex: 'name', width: 300, fixed: 'left' },
		{ title: '​Avg阈值(%)', dataIndex: 'cmp_threshold', width: 130, render(_: any) { return _ ? Number(_).toFixed(2) : _ } },
		{ title: 'CV阈值(%)', dataIndex: 'cv_threshold', width: 130, render(_: any) { return _ ? Number(_).toFixed(2) : _ } },
		{ title: '期望方向', dataIndex: 'direction', width: 130 },
		{
			title: <div>操作<Button type='primary' onClick={() => newMetric(id)} style={{ marginLeft: 10 }}>新增</Button></div>,
			valueType: 'option',
			dataIndex: 'id',
			width: 180,
			fixed: 'right',
			render: (_: number, row: any) => (
				<Space>
					<Button type="link" style={{ padding: 0, height: 'auto' }} onClick={() => editMetricRow(id, { ...row })}>编辑</Button>
					{
						innerKey == 1 ?
							<Popconfirm title="确定要删除吗？"
								// placement="topRight"	
								okText="确定"
								cancelText="取消"
								onConfirm={() => remMetricRow(row)}
								overlayStyle={{ width: '224px' }}
							>
								<Button type="link" style={{ padding: 0, height: 'auto' }}>删除</Button>
							</Popconfirm> :
							<DeleteMetricPopover onOk={(is_sync: any) => remMetricRow(row, is_sync)} />
					}
				</Space>
			),
		},
	];

	const handlePage = (page_num: number, page_size: number) => {
		setPage(page_num)
		setPageSize(page_size)
	}

	return (
		<div className={styles.warp} key={id}>
			<CommonTable className={styles.FuncOrPerfConfList_root}
				columns={columns}
				scrollType={670}
				loading={expandInnerLoading}
				list={expandInnerList.data}
				page={expandInnerList.page_num}
				totalPage={expandInnerList.total_page}
				total={expandInnerList.total}
				pageSize={expandInnerList.page_size}
				handlePage={handlePage}
				paginationBottom={true}
			/>

			<MetricEditDrawer
				onOk={submitMetric}
				ref={metricEditer}
				parentId={id}
				componentType={componentType}
			/>
		</div>
	);
};

export default MetricTable;


