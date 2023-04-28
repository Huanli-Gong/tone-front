/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from 'react';
import { Drawer } from 'antd';
import { FormattedMessage } from 'umi';
import moment from 'moment';
import CodeViewer from '@/components/CodeViewer'
import ButtonEllipsis from '@/components/Public/ButtonEllipsis';
import CommonTable from '@/components/Public/CommonTable';
import styles from './index.less';
import { ColumnEllipsisText } from '@/components/ColumnComponents';

/**
 * @module 业务测试
 * @description conf级列表
 */
const List = ({ suite_id, type, dataSource }: any) => {
	// 预览doc
	const [showDoc, setShowDoc] = useState<any>({ visible: false, doc: '' })

	// 1.业务测试
	const columns = [
		{
			title: 'Test Conf',
			dataIndex: 'name',
			fixed: 'left',
			width: 150,
			render: (text: any) => {
				return <ColumnEllipsisText ellipsis={{ tooltip: true }} >{text}</ColumnEllipsisText>
			},
		},
		{
			title: <FormattedMessage id="suite.domain" />,
			dataIndex: 'domain_name_list',
			width: 100,
			render: (text: any) => <ColumnEllipsisText ellipsis={{ tooltip: true }} >{text}</ColumnEllipsisText>
		},
		{
			title: <FormattedMessage id="suite.timeout" />,
			dataIndex: 'timeout',
			width: 120,
			// onCell: () => ({ style: { maxWidth: 130 } }),
			render: (text: any) => <span>{text || '-'}</span>,
		},
		!['functional', 'performance'].includes(type) &&
		{
			title: <FormattedMessage id="suite.ci_type" />,
			dataIndex: 'ci_type',
			width: 120,
			render: (text: any) => {
				return <ColumnEllipsisText ellipsis={{ tooltip: true }} >{text}</ColumnEllipsisText>
			}
		},
		{
			title: <FormattedMessage id="suite.gmt_created" />,
			dataIndex: 'gmt_created',
			width: 170,
			render: (text: any) => {
				return <ColumnEllipsisText ellipsis={{ tooltip: true }} >{text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '-'}</ColumnEllipsisText>
			}
		},
		{
			title: <FormattedMessage id="suite.description" />,
			dataIndex: 'doc',
			width: 200,
			render: (text: any) => (
				text ?
					<ButtonEllipsis title={text} width={150}
						isCode={true}
						onClick={() => {
							setShowDoc({ visible: true, doc: text })
						}}
					/> : '-'
			)
		},
	]

	return (
		<div>
			<CommonTable
				className={styles.confList_root}
				columns={columns as any}
				name="ws-suite-manage-buiness-conf"
				dataSource={dataSource}
			/>
			<Drawer
				maskClosable
				keyboard={false}
				width={376}
				title={<FormattedMessage id="suite.description.details" />}
				onClose={() => setShowDoc({ visible: false, doc: '' })}
				visible={showDoc.visible}
			>
				<CodeViewer code={showDoc.doc} />
			</Drawer>
		</div>
	)
};

export default List;
