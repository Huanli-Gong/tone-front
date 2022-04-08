import React, { useState, useEffect } from 'react';
import { querySuiteList } from '../../service';
import styles from '../../style.less';
import CommonTable from '@/components/Public/CommonTable';

const SuiteManagement: React.FC<any> = ({ id , innerKey , ws_id }) => {
	const [expandInnerList,setExpandInnerList] = useState<any>([])
	const [expandInnerLoading,setExpandInnerLoading] = useState<boolean>(true)
	
	const getMetric= async (id:number) =>{
		setExpandInnerList({data:[]})
		setExpandInnerLoading(true)
		console.log( innerKey )
		const params ={ ws_id , object_type : innerKey , object_id : id }
		const data = await querySuiteList(params)
		setExpandInnerList(data)
		setExpandInnerLoading(false)
	}

	useEffect(() => {
		getMetric( id )
	}, [ innerKey ]);

	const columns = [
        { title: '指标', dataIndex: 'name',width:200,fixed:'left'},
        { title: 'Avg阈值(%)', dataIndex: 'cmp_threshold',width:160, render(_: any) { return _ ? Number(_).toFixed(2) : _ }},
        { title: 'CV阈值(%)', dataIndex: 'cv_threshold',width:140, render(_: any) { return _ ? Number(_).toFixed(2) : _ }},
        { title: '期望方向', dataIndex: 'direction',width:140},
	];
	
	return (
		<div className={styles.warp} key={id}>
			<CommonTable
				columns={columns}
				scrollType = {640}
				loading={ expandInnerLoading }
				list={expandInnerList.data}
				showPagination={ false }
			/>
		</div>
	);
};

export default SuiteManagement;


