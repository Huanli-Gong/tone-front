import React, { useState, useEffect } from 'react';
import { Button, Tabs, Pagination, Drawer, Tooltip, Row, Table, Typography, Spin } from 'antd';
import { CaretRightFilled, CaretDownFilled, QuestionCircleOutlined } from '@ant-design/icons';
import { querySuiteList, queryDomains } from './service';
import { history, useIntl, FormattedMessage, getLocale } from 'umi'
import { suiteChange } from '@/components/Public/TestSuite/index.js';
import PopoverEllipsis from '@/components/Public/PopoverEllipsis';
import styles from './style.less';
import CaseTable from './components/CaseTable';
import BusinessTest from './BusinessTest';
import ButtonEllipsis from '@/components/Public/ButtonEllipsis';
import { runList } from '@/utils/utils';
import { SearchColumnFilterTitle, CheckboxColumnFilterTitle, UserSearchColumnFilterTitle } from './components'
import CodeViewer from '@/components/CodeViewer'
import { TabCard } from '@/components/UpgradeUI';
import { Access, useAccess } from 'umi'

const SuiteManagement: React.FC<any> = (props) => {
	const { formatMessage } = useIntl()
	const enLocale = getLocale() === 'en-US'
	const { ws_id } = props.match.params
	const access = useAccess();
	const testType = props.location.query.test_type || 'functional'
	const { TabPane } = Tabs;
	const [data, setData] = useState<any>([]);
	const [refresh, setRefresh] = useState<boolean>(true)
	const [fetchParams, setFetchParams] = useState<any>({
		name: '',
		domain: '',
		run_mode: '',
		owner: '',
		order: '',
		page_num: 1,
		page_size: 10,
		test_type: testType
	})

	const [loading, setLoading] = useState<boolean>(true)
	const [expandKey, setExpandKey] = useState<string[]>([])
	const [filterRefresh, setFilterRefresh] = useState(false)
	const [show, setShow] = useState<boolean>(false)
	const [des, setDes] = useState<string>('')

	const [domainList, setDomainList] = useState<any>([])
	// const domainList = [{ id: 1, name: "内存" }, { id: 2, name: "调度" }, { id: 3, name: "cpu" }, { id: 4, name: "文件系统" }, { id: 5, name: "IO子系统" }, { id: 6, name: "网络" }, { id: 7, name: "Pounch" }, { id: 8, name: "其他" }]

	const getDomains = async () => {
		const { data: domains } = await queryDomains()
		setDomainList(domains)
	}

	useEffect(() => {
		getDomains()
	}, [])

	const getList = async (params: any = {}) => {
		setLoading(true)
		setData({ data: [] })
		const data: any = await querySuiteList({ ...params, ws_id })
		setData(data)
		setLoading(false)
	};

	useEffect(() => {
		getList(fetchParams)
		setExpandKey([])
	}, [fetchParams, refresh])

	const handlePage = (page_num: number, page_size: any) => {
		setFetchParams({
			...fetchParams,
			page_num,
			page_size
		})
	}
	const view_type_content = (
		<div>
			<div><FormattedMessage id="suite.view_type.type1"/></div>
			<div><FormattedMessage id="suite.view_type.type2"/></div>
			<div><FormattedMessage id="suite.view_type.type3"/></div>
		</div>
	)
	const handleTab = (test_type: string) => {
		if (['functional', 'performance'].includes(test_type)) {
			setExpandKey([])
			setFilterRefresh(!filterRefresh)
			setFetchParams({
				test_type,
				name: '',
				domain: '',
				owner: '',
				order: '',
				run_mode: '',
				page_num: 1,
				page_size: 10
			})
		}
		history.push(`${location.pathname}?test_type=${test_type}`)
	}

	const columns: any = [
		{
			title: () => (
				<SearchColumnFilterTitle
					title="Test Suite"
					params={fetchParams}
					setParams={setFetchParams}
					name={'name'}
				/>
			),
			className: 'no_padding_head',
			dataIndex: 'name',
			ellipsis: true,
		},
		{
			title: () => (
				<CheckboxColumnFilterTitle
					title={formatMessage({id: 'suite.run_mode'}) }
					params={fetchParams}
					setParams={setFetchParams}
					name={'run_mode'}
					list={runList.map((item)=> ({...item, name: formatMessage({id: item.id}) }) ) }
				/>
			),
			width: 120,
			className: 'no_padding_head',
			dataIndex: 'run_mode',
			render: (_: any) => _ === 'standalone' ? <FormattedMessage id="standalone" />: <FormattedMessage id="cluster" />,
		},
		{
			title: () => (
				<CheckboxColumnFilterTitle
					title={formatMessage({id: 'suite.domain'}) }
					params={fetchParams}
					setParams={setFetchParams}
					name={'domain'}
					list={domainList}
				/>
			),
			width: 90,
			ellipsis: {
                shwoTitle: false,
            },
			render: (_: any) => _ ? <Tooltip placement={'bottomLeft'} title={_}><Typography.Text style={{ width: 85 }} ellipsis>{_ || '-'}</Typography.Text></Tooltip> : '-',
			className: 'no_padding_head',
			dataIndex: 'domain_name_list',
		},
		{
			title: testType === 'functional' ? <></> : <><FormattedMessage id="suite.view_type" /> <Tooltip title={view_type_content} placement="bottomLeft"><QuestionCircleOutlined /></Tooltip></>,
			dataIndex: 'view_type',
			width: testType === 'functional' ? 0 : 120,
			ellipsis: true,
			render: (_: any, record: any) => testType === 'functional' ? <></> : suiteChange(_, record),
		},
		{
			title: <FormattedMessage id="suite.description" />,
			dataIndex: 'doc',
			className: 'no_padding_head',
			width: 190,
			render: (_: any, row: any) => (
				<div >
					<ButtonEllipsis
						title={row.doc}
						isCode={true}
						onClick={() => {
							setShow(true)
							setDes(row.doc)
						}}
					/>
				</div>
			)
		},
		{
			title: <FormattedMessage id="suite.remarks" />,
			dataIndex: 'description',
			className: 'no_padding_head',
			width: 100,
			ellipsis: {
                shwoTitle: false,
            },
			render: (_:any, row:any) => {
				return (
					<PopoverEllipsis title={row.description} width={100} />
				)
			}
		},
		{
			title: () => (
				<UserSearchColumnFilterTitle
					title="Owner"
					params={fetchParams}
					setParams={setFetchParams}
					name={'owner'}
				/>
			),
			width: 120,
			className: 'no_padding_head',
			dataIndex: 'owner_name',
		},
		{
			title: <FormattedMessage id="suite.gmt_created" />,
			dataIndex: 'gmt_created',
			className: 'no_padding_head',
			sorter: true,
			ellipsis: true,
		},
	]

	const onExpand = async (record: any) => {
		setExpandKey([record.id + ''])
	}

	return (
		<TabCard
			title={
				<Tabs defaultActiveKey={testType} onChange={handleTab}>
					<TabPane
						tab={<FormattedMessage id="functional.test"/>}
						key="functional"
					/>
					<TabPane
						tab={<FormattedMessage id="performance.test"/>}
						key="performance"
					/>
					{
						!BUILD_APP_ENV && 
						<TabPane
							tab={<FormattedMessage id="business.test"/>}
							key="business"
						/>
					}
				</Tabs>
			}
			extra={
				<Access accessible={access.WsMemberOperateSelf()}>
					<Button type="primary" key="createSuite" 
						onClick={() => {
							if (['functional', 'performance', 'business'].includes(fetchParams.test_type)) {
								// history.push(`/test_suite/new?ws=${ws_id}&test_type=${fetchParams.test_type}`)
								history.push(`/ws/${ws_id}/new_suite/${fetchParams.test_type}`)
							}
							// else if (fetchParams.test_type === 'business') {
							//   history.push(`/test_suite/add_business?ws=${ws_id}&test_type=${fetchParams.test_type}`)
							// }
						}}>
						<FormattedMessage id="test.suite.manage" />
					</Button>
				</Access>
			}
		>

			{
				['functional', 'performance'].includes(fetchParams.test_type) &&
				(
					<Spin spinning={loading}>
						<Table
							className={styles.table_style}
							size={'small'}
							onChange={(pagination: any, filters: any, sorter: any) => {
								switch (sorter.order) {
									case undefined:
										setFetchParams({ ...fetchParams, order: undefined })
										break;
									case 'descend':
										setFetchParams({ ...fetchParams, order: '-gmt_created' })
										break;
									case 'ascend':
										setFetchParams({ ...fetchParams, order: 'gmt_created' })
										break;
									default:
										break;
								}
							}}
							columns={columns}
							dataSource={data.data}
							rowKey={record => record.id + ''}
							expandable={{
								expandedRowRender: (record) => (
									<CaseTable
										domains={domainList}
										record={record.test_case_list}
										id={record.id}
										type={fetchParams.test_type}
										ws_id={ws_id}
									/>
								),
								onExpand: (_, record) => _ ? onExpand(record) : setExpandKey([]),
								expandedRowKeys: expandKey,
								expandIcon: ({ expanded, onExpand, record }) =>
									expanded ? (<CaretDownFilled onClick={e => onExpand(record, e)} />) :
										(<CaretRightFilled onClick={e => onExpand(record, e)} />)
							}}
							pagination={false}
						/>
						<Row justify="space-between" style={{ padding: '16px 20px 0' }}>
							<div>
								{formatMessage({id: 'pagination.total.strip'}, {data: data.total || 0 })}
							</div>
							<Pagination
								className={data.total == 0 ? styles.hidden : ''}
								showQuickJumper
								showSizeChanger
								current={fetchParams.page_num}
								defaultCurrent={1}
								//hideOnSinglePage={true}
								onChange={(page_num: number, page_size: any) => handlePage(page_num, page_size)}
								onShowSizeChange={(page_num: number, page_size: any) => handlePage(page_num, page_size)}
								total={data.total}
							/>
						</Row>
					</Spin>
				)}
			{fetchParams.test_type === 'business' && (
				<BusinessTest ws_id={ws_id} />
			)}

			<Drawer
				maskClosable={false}
				keyboard={false}
				width={376}
				title={<FormattedMessage id="suite.description.details" />}
				onClose={() => setShow(false)}
				visible={show}
			>
				<CodeViewer code={des} />
			</Drawer>
		</TabCard>
	);
};

export default SuiteManagement;


