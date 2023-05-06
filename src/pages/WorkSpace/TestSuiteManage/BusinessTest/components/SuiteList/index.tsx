/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { useState } from 'react';
import { Tooltip, Drawer, Table } from 'antd';
import { CaretRightFilled, CaretDownFilled, QuestionCircleOutlined } from '@ant-design/icons';
import { useIntl, FormattedMessage } from 'umi';
import CodeViewer from '@/components/CodeViewer'
import ButtonEllipsis from '@/components/Public/ButtonEllipsis';
import { suiteChange } from '@/components/Public/TestSuite';
import { test_type_enum, runList } from '@/utils/utils'
import ConfList from '../ConfList';
import styles from './index.less';
import { ColumnEllipsisText } from '@/components/ColumnComponents';

/**
 * @module 业务测试
 * @description suite级列表
 */
const List = ({ dataSource }: any) => {
	const { formatMessage } = useIntl()
	const [loading, setLoading] = useState<any>(false)
	// 复选行
	// 展开的行id
	const [expandKeys, setExpandKeys] = useState<string[]>([])
	const [domainList, setDomainList] = useState<string[]>([])
	// 预览doc
	const [showDoc, setShowDoc] = useState<any>({ visible: false, doc: '' })

	const columns: any = [
		{
			title: 'Test Suite',
			dataIndex: 'name',
			fixed: 'left',
			width: 120,
			render: (text: any) => {
				return <ColumnEllipsisText ellipsis={{ tooltip: true }} width={120} >{text}</ColumnEllipsisText>
			},
		},
		{
			title: <FormattedMessage id="suite.run_mode" />,
			dataIndex: 'run_mode',
			width: 100,
			render: (text: any) => runList.map((item: any) => {
				return item.id === text ? <span key={item.id}>{formatMessage({ id: item.id }) || '-'}</span> : null
			}),
		},
		{
			title: <FormattedMessage id="suite.domain" />,
			dataIndex: 'domain_name_list',
			width: 100,
			render: (text: any) => {
				return <ColumnEllipsisText ellipsis={{ tooltip: true }} >{text || '-'}</ColumnEllipsisText>
			}
		},
		{
			title: <FormattedMessage id="suite.test_type" />,
			dataIndex: 'test_type',
			width: 100,
			render: (text: any) => test_type_enum.map((item: any) => {
				return item.value === text ? <span key={item.value}>{formatMessage({ id: item.value }) || '-'}</span> : null
			})
		},
		{
			title: <><FormattedMessage id="suite.view_type" /> <Tooltip title={
				<div>
					<div><FormattedMessage id="suite.view_type.type1" /></div>
					<div><FormattedMessage id="suite.view_type.type2" /></div>
					<div><FormattedMessage id="suite.view_type.type3" /></div>
				</div>
			} placement="bottomLeft"><QuestionCircleOutlined /></Tooltip></>,
			dataIndex: 'view_type',
			width: 120,
			ellipsis: true,
			render: (_: any, record: any) => suiteChange(_, record),
		},
		{
			title: <FormattedMessage id="suite.description" />,
			dataIndex: 'doc',
			width: 150,
			render: (text: any) => <div>{text ?
				<ButtonEllipsis title={text} width={100}
					isCode={true}
					onClick={() => {
						setShowDoc({ visible: true, doc: text })
					}}
				/> : '-'}</div>,
		},
		{
			title: <FormattedMessage id="suite.remarks" />,
			dataIndex: 'description',
			className: 'no_padding_head',
			width: 100,
			ellipsis: {
				shwoTitle: false,
			},
			render: (_: any, record: any) => {
				return (
					<ColumnEllipsisText ellipsis={{ tooltip: true }} >{record.description}</ColumnEllipsisText>
				)
			}
		},
		{
			title: 'Owner',
			width: 120,
			dataIndex: 'owner_name',
		},
		{
			title: <FormattedMessage id="suite.gmt_created" />,
			dataIndex: 'gmt_created',
			width: 170,
			render: (text: any) => {
				return <ColumnEllipsisText ellipsis={{ tooltip: true }} >{text || '-'}</ColumnEllipsisText>
			}
		},
	];

	return (
		<>
			<Table
				className={styles.suitList_root}
				size='small'
				loading={loading}
				rowKey={(record) => record.id}
				columns={columns}
				dataSource={dataSource}
				expandable={{
					expandedRowKeys: expandKeys,
					expandedRowRender: (record: any) => {
						// 根据"测试类型"区分不同的conf列表
						const { test_type, test_case_list } = record
						return <ConfList suite_id={record.id} type={test_type} {...record} domainList={domainList} dataSource={test_case_list} />
					},
					onExpand: (_: any, record: any) => {
						_ ? setExpandKeys([record.id]) : setExpandKeys([])
					},
					expandIcon: ({ expanded, onExpand, record }: any) =>
						expanded ? (<CaretDownFilled onClick={e => onExpand(record, e)} />) :
							(<CaretRightFilled onClick={e => onExpand(record, e)} />)
				}}
				scroll={{ x: 'auto' }}
				pagination={false}
			/>

			<Drawer
				maskClosable // ={false}
				keyboard={false}
				width={376}
				title={<FormattedMessage id="suite.description.details" />}
				onClose={() => setShowDoc({ visible: false, doc: '' })}
				visible={showDoc.visible}
			>
				<CodeViewer code={showDoc.doc} />
			</Drawer>
		</>
	)
};

export default List;
