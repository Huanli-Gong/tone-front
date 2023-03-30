import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button, Space, Tag, message, Popconfirm, Pagination, Spin, Tooltip, Table, Row, Typography } from 'antd';
import { tagList, delSuite } from './service';
import styles from './style.less';
import SearchInput from '@/components/Public/SearchInput';
import Log from '@/components/Public/Log';
import { FilterFilled, ExclamationCircleOutlined } from '@ant-design/icons';
import { SingleTabCard } from '@/components/UpgradeUI';
import { useParams, useIntl, FormattedMessage } from 'umi'
import AddModel from './components/AddModel'
import { Access, useAccess } from 'umi'
import { ColumnEllipsisText } from '@/components/ColumnComponents';

const ResizeTag: React.FC = ({ name, tag_color }) => {

	const ref = React.useRef<any>()
	const [realWidth, setRealWidth] = React.useState<any>();

	React.useEffect(() => {
		const { offsetParent } = ref.current
		if (!offsetParent) return
		const resizeObserver = new ResizeObserver((entries) => {
			for (const entry of entries) {
				if (entry.contentRect) {
					const { width } = entry.contentRect
					setRealWidth(width)
				}
			}
		});
		resizeObserver.observe(offsetParent);
		return () => {
			resizeObserver.unobserve(offsetParent)
		}
	}, [])

	return (
		<div ref={ref} >
			<Tag color={tag_color} style={{ marginRight: 0 }}>
				<Typography.Text
					ellipsis={{
						tooltip: name,
					}}
					style={{ maxWidth: realWidth - 20, color: tag_color && "#fff" }}
				>
					{name}
				</Typography.Text>
			</Tag>
		</div>
	)
}

const SuiteManagement: React.FC<any> = props => {
	const { formatMessage } = useIntl()
	const { ws_id } = useParams() as any
	const access = useAccess();
	const [dataSource, setDataSource] = useState<any>({});
	const [name, setName] = useState<string>();
	const [description, setDescription] = useState<string>();
	const [autoFocus, setFocus] = useState<boolean>(true)
	const [page, setPage] = useState<number>(1)
	const [pageSize, setPageSize] = useState<number>(10)
	const [refresh, setRefresh] = useState<boolean>(true)
	const [loading, setLoading] = useState<boolean>(true)

	const addModelRef: any = useRef()
	// const [environment, setEnvironment] = useState<string>()
	const getList = async (params: any = {}) => {
		setLoading(true)
		const data: any = await tagList({ ...params })
		data && setDataSource(data.code !== 200 ? {} : data)
		setLoading(false)
	};
	//run_mode: mode, run_environment: environment, 
	// mode, environment, 
	useEffect(() => {
		const params = { ws_id: ws_id, name: name, description: description, page_num: page, page_size: pageSize }
		getList(params)
	}, [name, description, page, pageSize, refresh]);

	const handlePage = (page_num: number, page_size: any) => {
		setPage(page_num)
		setPageSize(page_size)
	}
	// const [pid, setPid] = useState<number>(0)
	const logDrawer: any = useRef()
	const handleOpenLogDrawer = useCallback(
		(id) => {
			logDrawer.current.show(id)
		}, []
	)

	const newSuite = () => {
		addModelRef.current?.show()
	}

	const handleModalOk = () => {
		setRefresh(!refresh)
	}

	const editOuter = (row: any) => {
		addModelRef.current?.show(row)
	}

	const remOuter = async (params: any) => {
		await delSuite(params.id, ws_id)
		message.success(formatMessage({ id: 'operation.success' }));
		setRefresh(!refresh)
	}

	const columns: any[] = [
		{
			title: <FormattedMessage id="device.tag.name" />,
			dataIndex: 'name',
			width: 170,
			filterDropdown: ({ confirm }: any) => <SearchInput confirm={confirm} autoFocus={autoFocus} onConfirm={(val: string) => { setPage(1), setName(val) }} />,
			onFilterDropdownVisibleChange: (visible: any) => {
				if (visible) {
					setFocus(!autoFocus)
				}
			},
			filterIcon: () => <FilterFilled style={{ color: name ? '#1890ff' : undefined }} />,
			render: (_: string, row: any) => (
				<ResizeTag {...row} />
			)
			/* 
						<Tooltip title={row.name}>
								<Tag color={row.tag_color}>
									{
										row.name.toString().length > 10 ?
											row.name.toString().substr(0, 10).concat('...') :
											row.name.toString()
									}
								</Tag>
							</Tooltip> */
		},
		{
			title: <FormattedMessage id="device.description" />,
			dataIndex: 'description',
			width: 100,
			filterIcon: () => <FilterFilled style={{ color: description ? '#1890ff' : undefined }} />,
			filterDropdown: ({ confirm }: any) => <SearchInput confirm={confirm} autoFocus={autoFocus} onConfirm={(val: string) => { setPage(1), setDescription(val) }} />,
			onFilterDropdownVisibleChange: (visible: any) => {
				if (visible) {
					setFocus(!autoFocus)
				}
			},
			render: (_: string, row: any) => (
				<ColumnEllipsisText ellipsis={{ tooltip: true }} >{row.description}</ColumnEllipsisText>
			)
		},
		{
			title: <FormattedMessage id="device.create_user" />,
			dataIndex: 'create_user',
			width: 90,
			ellipsis: {
				showTitle: false
			},
			render(_: string, row: any) {
				return (
					<ColumnEllipsisText ellipsis={{ tooltip: true }}  >{_ || '-'}</ColumnEllipsisText>
				)
			}
		},
		{
			title: <FormattedMessage id="device.update_user" />,
			dataIndex: 'update_user',
			ellipsis: {
				showTitle: false
			},
			width: 90,
			render(_: string, row: any) {
				return (
					<ColumnEllipsisText ellipsis={{ tooltip: true }} >{_ || '-'}</ColumnEllipsisText>
				)
			}
		},
		{
			title: <FormattedMessage id="device.gmt_created" />,
			dataIndex: 'gmt_created',
			width: 200,
			render: (_: string, row: any) => {
				if (row.create_user !== '系统预设') return <ColumnEllipsisText ellipsis={{ tooltip: true }} >{row.gmt_created}</ColumnEllipsisText>
				return "-"
			}
		},
		{
			title: <FormattedMessage id="device.gmt_modified" />,
			dataIndex: 'gmt_modified',
			width: 200,
			render: (_: string, row: any) => {
				if (row.create_user !== '系统预设') return <ColumnEllipsisText ellipsis={{ tooltip: true }} >{row.gmt_modified}</ColumnEllipsisText>
				return "-"
			}
		},
		{
			title: <FormattedMessage id="Table.columns.operation" />,
			valueType: 'option',
			dataIndex: 'id',
			width: 150,
			render: (_: string, row: any) =>
				row.create_user !== '系统预设' &&
				<Space>
					<Access accessible={access.WsMemberOperateSelf()}>
						<Space>
							<Button type="link" style={{ padding: 0, height: 'auto' }} onClick={() => editOuter(row)}><FormattedMessage id="operation.edit" /></Button>
							<Popconfirm
								title={<div style={{ color: 'red' }}><FormattedMessage id="device.tag.delete.tips" /></div>}
								placement="topRight"
								okText={<FormattedMessage id="operation.cancel" />}
								cancelText={<FormattedMessage id="operation.confirm.delete" />}
								onCancel={() => remOuter(row)}
								icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
								overlayStyle={{ width: '300px' }}
							>
								<Button type="link" style={{ padding: 0, height: 'auto' }}><FormattedMessage id="operation.delete" /></Button>
							</Popconfirm>
						</Space>
					</Access>
					<Button type="link" style={{ padding: 0, height: 'auto' }} onClick={() => handleOpenLogDrawer(row.id)}><FormattedMessage id="operation.log" /></Button>
				</Space>,
		},
	];

	return (
		<SingleTabCard
			title={<FormattedMessage id="device.dispatch.tag" />}
			extra={
				<Access accessible={access.WsMemberOperateSelf()}>
					<Button key="3" type="primary" onClick={newSuite}> <FormattedMessage id="device.create.tag" /> </Button>
				</Access>
			}
		>
			<Spin spinning={loading}>
				<Table
					size={'small'}
					className={styles.pro_table_card}
					columns={columns}
					dataSource={dataSource?.data || []}
					rowKey={'id'}
					pagination={false}
				/>
				<Row justify="space-between" style={{ padding: '16px 20px 0' }}>
					<div className={!dataSource?.total ? styles.hidden : ''}>
						{formatMessage({ id: 'pagination.total.strip' }, { data: dataSource?.total || 0 })}
					</div>
					<Pagination
						size="small"
						className={!dataSource?.total ? styles.hidden : ''}
						showQuickJumper
						showSizeChanger
						current={page}
						defaultCurrent={1}
						onChange={(page_num: number, page_size: any) => handlePage(page_num, page_size)}
						onShowSizeChange={(page_num: number, page_size: any) => handlePage(page_num, page_size)}
						total={dataSource?.total || 0}
					/>
				</Row>
			</Spin>

			<Log ref={logDrawer} operation_object="machine_server_tag" />
			<AddModel ref={addModelRef} callback={handleModalOk} />
		</SingleTabCard>
	);
};

export default SuiteManagement;