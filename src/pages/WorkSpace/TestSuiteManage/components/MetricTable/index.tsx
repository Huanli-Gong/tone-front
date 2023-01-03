import React, { useState, useEffect } from 'react';
import { useIntl } from 'umi'
import { querySuiteList } from '../../service';
import styles from '../../style.less';
import CommonTable from '@/components/Public/CommonTable';

const SuiteManagement: React.FC<any> = ({ id, innerKey, ws_id }) => {
	const { formatMessage } = useIntl()
	const [expandInnerList, setExpandInnerList] = useState<any>([])
	const [expandInnerLoading, setExpandInnerLoading] = useState<boolean>(true)

	const getMetric = async (id: number) => {
		setExpandInnerList({ data: [] })
		setExpandInnerLoading(true)
		const params = { ws_id, object_type: innerKey, object_id: id }
		const data = await querySuiteList(params)
		setExpandInnerList(data)
		setExpandInnerLoading(false)
	}

	useEffect(() => {
		getMetric(id)
	}, [innerKey]);

	const [columns, setColumns] = React.useState([
		{ title: formatMessage({ id: 'suite.indicators' }), dataIndex: 'name', width: 200, fixed: 'left' },
		{ title: formatMessage({ id: 'suite.cmp_threshold' }), dataIndex: 'cmp_threshold', width: 160, render(_: any) { return _ ? Number(_).toFixed(2) : _ } },
		{ title: formatMessage({ id: 'suite.cv_threshold' }), dataIndex: 'cv_threshold', width: 140, render(_: any) { return _ ? Number(_).toFixed(2) : _ } },
		{ title: formatMessage({ id: 'suite.direction' }), dataIndex: 'direction', width: 140 },
	]);

	return (
		<div className={styles.warp} key={id}>
			<CommonTable
				columns={columns as any}
				setColumns={setColumns}
				// scrollType = {640}
				loading={expandInnerLoading}
				dataSource={expandInnerList.data}
				showPagination={false}
				scroll={{ x: 640 }}
			/>
		</div>
	);
};

export default SuiteManagement;


