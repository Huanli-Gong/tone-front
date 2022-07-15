import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button, Space, Tag, message, Popconfirm, Pagination, Spin, Tooltip, Table, Row } from 'antd';
import { tagList, delSuite } from './service';
import styles from './style.less';
import SearchInput from '@/components/Public/SearchInput';
import Log from '@/components/Public/Log';
import PopoverEllipsis from '@/components/Public/PopoverEllipsis';
import { FilterFilled, ExclamationCircleOutlined } from '@ant-design/icons';
import { SingleTabCard } from '@/components/UpgradeUI';
import PermissionTootip from '@/components/Public/Permission';
import { useDetectZoom } from '@/utils/hooks';
import { useParams } from 'umi'
import AddModel from './components/AddModel'
import { Access, useAccess } from 'umi'

const SuiteManagement: React.FC<any> = props => {
	const { ws_id } = useParams() as any
	const access = useAccess();
	const ratio = useDetectZoom()
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
		message.success('操作成功');
		setRefresh(!refresh)
	}

	const columns: any[] = [
		{
			title: '标签名称',
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
				<Tooltip title={row.name}>
					<Tag color={row.tag_color}>
						{
							row.name.toString().length > 10 ?
								row.name.toString().substr(0, 10).concat('...') :
								row.name.toString()
						}
					</Tag>
				</Tooltip>
			)
		},
		{
			title: '备注',
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
				<PopoverEllipsis title={row.description} width={100 * ratio} />
			)
		},
		{
			title: '创建人',
			dataIndex: 'create_user',
			width: 90,
			ellipsis: {
				showTitle: false
			},
			render(_: string, row: any) {
				return (
					<PopoverEllipsis width={90} title={_ || '-'} />
				)
			}
		},
		{
			title: '修改人',
			dataIndex: 'update_user',
			ellipsis: {
				showTitle: false
			},
			width: 90,
			render(_: string, row: any) {
				return (
					<PopoverEllipsis width={90} title={_ || '-'} />
				)
			}
		},
		{
			title: '创建时间',
			dataIndex: 'gmt_created',
			width: 200,
			render: (_: string, row: any) => row.create_user !== '系统预设' && <PopoverEllipsis width={200 * ratio} title={row.gmt_created} />
		},
		{
			title: '修改时间',
			dataIndex: 'gmt_modified',
			width: 200,
			render: (_: string, row: any) => row.create_user !== '系统预设' && <PopoverEllipsis width={200 * ratio} title={row.gmt_modified} />
		},
		{
			title: '操作',
			valueType: 'option',
			dataIndex: 'id',
			width: 150,
			render: (_: string, row: any) =>
				row.create_user !== '系统预设' &&
				<Space>
					<Access accessible={access.WsMemberOperateSelf()}>
						<Space>
							<Button type="link" style={{ padding: 0, height: 'auto' }} onClick={() => editOuter(row)}>编辑</Button>
							<Popconfirm
								title={<div style={{ color: 'red' }}>删除调度标签后，机器池、Job、测试模板所配置的当前标签均不再生效，请谨慎删除！！</div>}
								placement="topRight"
								okText="取消"
								cancelText="确定删除"
								onCancel={() => remOuter(row)}
								icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
								overlayStyle={{ width: '300px' }}
							>
								<Button type="link" style={{ padding: 0, height: 'auto' }}>删除</Button>
							</Popconfirm>
						</Space>
					</Access>
					<PermissionTootip>
						<Button type="link" disabled={true} style={{ padding: 0, height: 'auto' }} onClick={() => handleOpenLogDrawer(row.id)}>日志</Button>
					</PermissionTootip>
				</Space>,
		},
	];

	return (
		<SingleTabCard
			title="调度标签"
			extra={
				<Access accessible={access.WsMemberOperateSelf()}>
					<Button key="3" type="primary" onClick={newSuite}> 创建标签 </Button>
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
					<div className={!dataSource?.total ? styles.hidden : ''} >
						共{dataSource?.total || 0}条
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