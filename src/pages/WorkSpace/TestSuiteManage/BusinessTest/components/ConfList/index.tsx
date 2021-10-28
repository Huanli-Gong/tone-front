import React, { useState, useEffect, useRef } from 'react';
import { Drawer, Popover, Tooltip, Space, message } from 'antd';
import { FilterFilled } from '@ant-design/icons';
import moment from 'moment';
import CodeViewer from '@/components/CodeViewer'
import ButtonEllipsis from '@/components/Public/ButtonEllipsis';
import CommonTable from '@/components/Public/CommonTable';
import PopoverEllipsis from '@/components/Public/PopoverEllipsis';
import styles from './index.less';

/**
 * @module 业务测试
 * @description conf级列表
 */
const List = ({ suite_id, type, dataSource }:any) => {
  const [loading, setLoading] = useState<any>(false)
  const [data, setData] = useState<any>({ data: [], total: 0, page_num: 1, page_size: 10 })
	// 预览doc
	const [showDoc, setShowDoc] = useState<any>({ visible: false, doc:''})

	// 1.业务测试
	let columnsBusiness: any = [
		{
			title: 'Test Conf',
			dataIndex: 'name',
			fixed: 'left',
			width: 150,
      render: (text:any) => {
				return <PopoverEllipsis title={text} width={150} />
			},
		},
		{
			title: '领域',
			dataIndex: 'domain_name_list',
			width: 100,
			render: (text:any) => <PopoverEllipsis title={text} width={100} />
		},
		{
			title: '运行时长(s)',
			dataIndex: 'timeout',
			width: 120,
			// onCell: () => ({ style: { maxWidth: 130 } }),
			render: (text:any) => <span>{text || '-'}</span>,
		},
	];
	
	if (!['functional', 'performance'].includes(type)) {
    columnsBusiness =   columnsBusiness.concat([{
				title: 'CI类型',
				dataIndex: 'ci_type',
				width: 120,
				render: (text:any) => {
					return <PopoverEllipsis title={text} width={120} />
				}
			}])
  }
  columnsBusiness =   columnsBusiness.concat([{
			title: '创建时间',
			dataIndex: 'gmt_created',
			width: 170,
			render: (text:any) => {
				return <PopoverEllipsis title={text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '-'} width={170} />
			}
		},
		{
			title: '说明',
			dataIndex: 'doc',
			width: 200,
			render: (text:any) => <div>{text ? 
				<ButtonEllipsis title={text} width={150} 
				  isCode={true}
					onClick={()=> {
						setShowDoc({ visible: true, doc: text})
					}}
				/> : '-'}</div>,
		},
	]);

	return (
		<div>
			<CommonTable className={styles.confList_root}
				columns={columnsBusiness}
				list={dataSource}
				loading={loading}
				// page={pageNum}
				// pageSize={pageSize}
				// total={total}
				// handlePage={onChange}
			/>
      <Drawer
				maskClosable
				keyboard={false}
				width={376}
				title="说明详情"
				onClose={() => setShowDoc({ visible: false, doc: ''}) }
				visible={showDoc.visible}
			>
				<CodeViewer code={showDoc.doc} />
			</Drawer>
		</div>
  )
};

export default List;
