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
import { ResizeHooksTable } from '@/utils/table.hooks';

type TagValueProps = {
	name: string;
	tag_color: string;
}

const ResizeTag: React.FC<TagValueProps> = ({ name, tag_color }) => {
	const ref = React.useRef<any>()
	const textRef = React.useRef<any>()
	const [realWidth, setRealWidth] = React.useState<any>();
	const [open, setOpen] = React.useState(false)
	const [show, setShow] = React.useState(false)

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

	React.useEffect(() => {
		if (!textRef.current) return
		const { scrollWidth, clientWidth } = textRef.current
		setShow(clientWidth < scrollWidth)
	}, [realWidth])

	const handleMouseOver = () => {
		if (show) setOpen(true)
	}

	const handleMouseLeave = () => {
		setOpen(false)
	}

	return (
		<div
			ref={ref}
			onMouseOver={handleMouseOver}
			onMouseLeave={handleMouseLeave}
		>
			<Tooltip
				title={name}
				open={open}
			>
				<Tag color={tag_color} style={{ marginRight: 0 }}>
					<Typography.Text
						ref={textRef}
						ellipsis
						style={{ maxWidth: realWidth - 20, color: tag_color && "#fff" }}
					>
						{name}
					</Typography.Text>
				</Tag>
			</Tooltip>
		</div>
	)
}

const SuiteManagement: React.FC<any> = () => {
	const { formatMessage } = useIntl()
	const { ws_id } = useParams() as any
	const access = useAccess();

	const DEFAULT_LIST_PARAMS_VALUE = {
		ws_id,
		page_num: 1,
		page_size: 10,
	}
	const [dataSource, setDataSource] = useState<any>({});
	const [listParams, setListParams] = React.useState<any>(DEFAULT_LIST_PARAMS_VALUE)
	const [focus, setFocus] = React.useState(false)
	const [refresh, setRefresh] = useState<boolean>(true)
	const [loading, setLoading] = useState<boolean>(true)

	const addModelRef: any = useRef()
	// const [environment, setEnvironment] = useState<string>()
	const getList = async (params: any = listParams) => {
		setLoading(true)
		const data: any = await tagList({ ...params })
		data && setDataSource(data.code !== 200 ? {} : data)
		setLoading(false)
	};
	//run_mode: mode, run_environment: environment, 
	// mode, environment, 
	useEffect(() => {
		getList()
	}, [listParams, refresh]);

	const handlePage = (page_num: number, page_size: any) => {
		setListParams((p: any) => ({ ...p, page_num, page_size }))
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
			filterDropdown: ({ confirm }: any) => (
				<SearchInput
					confirm={confirm}
					autoFocus={focus}
					onConfirm={(val: string) => setListParams((p: any) => ({ ...p, page_num: 1, name: val }))}
				/>
			),
			ellipsis: {
				showTitle: false,
			},
			onFilterDropdownVisibleChange: (visible: any) => {
				if (visible) {
					setFocus(!focus)
				}
			},
			filterIcon: () => <FilterFilled style={{ color: listParams?.name ? '#1890ff' : undefined }} />,
			render: (_: string, row: any) => (
				<ResizeTag {...row} />
			)
		},
		{
			title: <FormattedMessage id="device.description" />,
			dataIndex: 'description',
			width: 100,
			filterIcon: () => <FilterFilled style={{ color: listParams?.description ? '#1890ff' : undefined }} />,
			filterDropdown: ({ confirm }: any) => (
				<SearchInput
					confirm={confirm}
					autoFocus={focus}
					onConfirm={(val: string) => setListParams((p: any) => ({ ...p, page_num: 1, description: val }))}
				/>
			),
			onFilterDropdownVisibleChange: (visible: any) => {
				if (visible) {
					setFocus(!focus)
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
			render(_: string) {
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
			render(_: string) {
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
				if (row.create_user !== '系统预设')
					return <ColumnEllipsisText ellipsis={{ tooltip: true }} >{row.gmt_created}</ColumnEllipsisText>
				return "-"
			}
		},
		{
			title: <FormattedMessage id="device.gmt_modified" />,
			dataIndex: 'gmt_modified',
			width: 200,
			render: (_: string, row: any) => {
				if (row.create_user !== '系统预设')
					return <ColumnEllipsisText ellipsis={{ tooltip: true }} >{row.gmt_modified}</ColumnEllipsisText>
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
				<ResizeHooksTable
					name="ws-device-dispatch-list"
					refreshDeps={[dataSource, listParams]}
					loading={loading}
					scroll={{ x: '100%' }}
					size={'small'}
					className={styles.pro_table_card}
					columns={columns}
					dataSource={dataSource?.data || []}
					pagination={false}
					rowKey={'id'}
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
						current={listParams.page_num}
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