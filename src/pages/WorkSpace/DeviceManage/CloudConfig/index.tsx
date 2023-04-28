/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-shadow */
import React, { useState, useEffect, useRef } from 'react';
import { Form, Button, Space, Tabs, message, Popconfirm, Pagination, Table, Row } from 'antd';
import { FilterFilled, QuestionCircleOutlined } from '@ant-design/icons';
import type { TableColumnProps } from "antd"
import { deleteCloudImage, queryCloudImage, deleteCloudAk, queryCloudAk } from './service';
import styles from './style.less';
import { history, useIntl, FormattedMessage, getLocale } from 'umi'

import SearchInput from '@/components/Public/SearchInput'
import Highlighter from 'react-highlight-words'

import _ from 'lodash'
import AddAkDrawer from './components/DomianConf/AddAk'
import AddImageDrawer from './components/DomianConf/AddImage'
import { UserSearchColumnFilterTitle, CheckboxColumnFilterTitle } from './components/DomianConf/index'
import SelectRadio from '@/components/Public/SelectRadio';
import { TabCard } from '@/components/UpgradeUI';
import { requestCodeMessage } from '@/utils/utils';
import { ColumnEllipsisText } from '@/components/ColumnComponents';

const CloudConfig: React.FC<any> = (props) => {
	const { formatMessage } = useIntl()
	const enLocale = getLocale() === 'en-US'
	const { ws_id } = props.match.params
	const testType = props.location.query.test_type || 'ak'
	const { TabPane } = Tabs;
	const [data, setData] = useState<any>([]);
	const [key, setKey] = useState<string>(testType)
	const [loading, setLoading] = useState<boolean>(true)
	const [form] = Form.useForm()
	const addScript: any = useRef(null)
	const addImage: any = useRef(null)
	const [autoFocus, setFocus] = useState(true)

	const defaultParmasAk = {
		name: '',
		access_id: '',
		access_key: '',
		provider: '',
		enable: '',
		gmt_created: '',
		gmt_modified: '',
		creator: '',
		update_user: '',
		page_num: 1,
		page_size: 10,
		ws_id,
		key: testType
	}
	const defaultParmasImage = {
		image_name: '',
		image_id: '',
		image_version: '',
		platform: '',
		region: '',
		ak_name: '',
		provider: '',
		gmt_created: '',
		gmt_modified: '',
		creator: '',
		update_user: '',
		page_num: 1,
		page_size: 10,
		ws_id,
		key: testType
	}
	const defaultParmas = key === 'ak' ? defaultParmasAk : defaultParmasImage

	const [fetchParams, setFetchParams] = useState<any>(defaultParmas)
	const getList = async (params: any = defaultParmas) => {
		setLoading(true)
		setData({ data: [] })
		const data: any = key === 'ak' ? await queryCloudAk({ ...params }) : await queryCloudImage({ ...params })
		setData(data)
		setLoading(false)
	};

	useEffect(() => {
		getList(fetchParams)
	}, [fetchParams]);

	const handlePage = (page_num: number, page_size: any) => {
		setFetchParams({ ...fetchParams, page_num, page_size })
	}

	const handleTab = (key: string) => {
		setKey(key)
		history.push(`${location.pathname}?test_type=${key}`)
		if (key === 'ak') {
			setFetchParams({ ...defaultParmasAk, key })
			return
		}
		setFetchParams({ ...defaultParmasImage, key })

	}
	const setPageFn = () => {
		setFetchParams({ ...fetchParams, page_num: 1 })
	}

	const handleDelete = function* (record: any = {}): any {
		key === 'ak' ?
			yield deleteCloudAk({ id_list: [record.id], ws_id }) :
			yield deleteCloudImage({ id_list: [record.id], ws_id })
	}
	const defaultOption = (code: number, msg: string) => {
		if (code === 200) {
			message.success(formatMessage({ id: 'operation.success' }))
			const page_num = Math.ceil((data.total - 1) / fetchParams.page_size) || 1
			let index = fetchParams.page_num
			if (fetchParams.page_num > page_num) {
				index = page_num
			}
			setFetchParams({ ...fetchParams, page_num: index })

		}
		else {
			requestCodeMessage(code, msg)
		}
	}

	const providerList = [
		{ id: 'aliyun_ecs', name: formatMessage({ id: 'device.aliyun_ecs' }) },
		{ id: 'aliyun_eci', name: formatMessage({ id: 'device.aliyun_eci' }) },
	]
	const defaultList = [
		{ id: 1, name: formatMessage({ id: 'operation.yes' }) },
		{ id: 0, name: formatMessage({ id: 'operation.no' }) }
	]
	const styleObj = {
		container: 180,
		button_width: 90
	}

	const columnsAk: any = [
		{
			title: 'AK Name',
			dataIndex: 'name',
			fixed: 'left',
			width: 150,
			ellipsis: {
				showTitle: false
			},
			filterDropdown: ({ confirm }: any) => <SearchInput
				confirm={confirm}
				autoFocus={autoFocus}
				styleObj={styleObj}
				onConfirm={(val: any) => { setFetchParams({ ...fetchParams, name: val }) }}
				currentBaseline={{ server_provider: ws_id, test_type: key, id: 'name' }}
				placeholder={formatMessage({ id: 'device.ak.name.placeholder' })}
			/>,
			onFilterDropdownVisibleChange: (visible: any) => {
				if (visible) {
					setFocus(!autoFocus)
				}
			},
			filterIcon: () => <FilterFilled style={{ color: fetchParams.name ? '#1890ff' : undefined }} />,
			render: (_: any, row: any) => {
				return (
					<ColumnEllipsisText ellipsis={{ tooltip: row.name }} >
						<Highlighter
							highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
							searchWords={[fetchParams.name || '']}
							autoEscape
							textToHighlight={row && row.name}
						/>
					</ColumnEllipsisText>
				)
			}
		},
		{
			title: 'Access ID',
			// width : 175,
			dataIndex: 'access_id',
			width: 120,
			ellipsis: {
				showTitle: false
			},
			filterDropdown: ({ confirm }: any) => <SearchInput
				confirm={confirm}
				autoFocus={autoFocus}
				styleObj={styleObj}
				onConfirm={(val: any) => { setFetchParams({ ...fetchParams, access_id: val }) }}
				currentBaseline={{ server_provider: ws_id, test_type: key, id: 'access_id' }}
				placeholder={formatMessage({ id: 'device.access_id.placeholder' })}
			/>,
			onFilterDropdownVisibleChange: (visible: any) => {
				if (visible) {
					setFocus(!autoFocus)
				}
			},
			filterIcon: () => <FilterFilled style={{ color: fetchParams.access_id ? '#1890ff' : undefined }} />,
			render: (_: any, row: any) => {
				return (
					<ColumnEllipsisText ellipsis={{ tooltip: row.access_id }} >
						<Highlighter
							highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
							searchWords={[fetchParams.access_id || '']}
							autoEscape
							textToHighlight={row.access_id}
						/>
					</ColumnEllipsisText>
				)
			}
		},
		{
			title: 'Access Key',
			width: 120,
			dataIndex: 'access_key',
			ellipsis: {
				showTitle: false
			},
			filterDropdown: ({ confirm }: any) => <SearchInput
				confirm={confirm}
				autoFocus={autoFocus}
				styleObj={styleObj}
				onConfirm={(val: any) => { setFetchParams({ ...fetchParams, access_key: val }) }}
				currentBaseline={{ server_provider: ws_id, test_type: key, id: 'access_key' }}
				placeholder={formatMessage({ id: 'device.access_key.placeholder' })}
			/>,
			onFilterDropdownVisibleChange: (visible: any) => {
				if (visible) {
					setFocus(!autoFocus)
				}
			},
			filterIcon: () => <FilterFilled style={{ color: fetchParams.access_key ? '#1890ff' : undefined }} />,
			render: (_: any, row: any) => {
				return (
					<ColumnEllipsisText ellipsis={{ tooltip: row.access_key }} >
						<Highlighter
							highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
							searchWords={[fetchParams.access_key || '']}
							autoEscape
							textToHighlight={row.access_key}
						/>
					</ColumnEllipsisText>
				)
			}
		},
		{
			title: <FormattedMessage id="device.vm_quota" />,
			dataIndex: "vm_quota",
			width: 120,
		},
		BUILD_APP_ENV && {
			title: <FormattedMessage id="device.resource_group_id" />,
			width: enLocale ? 160 : 120,
			dataIndex: 'resource_group_id',
			ellipsis: {
				showTitle: false
			},
			filterDropdown: ({ confirm }: any) => <SearchInput
				confirm={confirm}
				autoFocus={autoFocus}
				styleObj={styleObj}
				onConfirm={(val: any) => { setFetchParams({ ...fetchParams, resource_group_id: val }) }}
				currentBaseline={{ server_provider: ws_id, test_type: key, id: 'resource_group_id' }}
				placeholder={formatMessage({ id: 'device.resource_group_id.placeholder' })}
			/>,
			onFilterDropdownVisibleChange: (visible: any) => {
				if (visible) {
					setFocus(!autoFocus)
				}
			},
			filterIcon: () => <FilterFilled style={{ color: fetchParams.resource_group_id ? '#1890ff' : undefined }} />,
			render: (_: any, row: any) => {
				return (
					<ColumnEllipsisText ellipsis={{ tooltip: row.resource_group_id }} >
						<Highlighter
							highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
							searchWords={[fetchParams.resource_group_id || '']}
							autoEscape
							textToHighlight={row.resource_group_id || "-"}
						/>
					</ColumnEllipsisText>
				)
			}
		},
		{
			title: () => (
				<CheckboxColumnFilterTitle
					title={formatMessage({ id: 'device.cloud.service.provider' })}
					params={fetchParams}
					setParams={setFetchParams}
					name={'provider'}
					configType={key}
					list={providerList}
				/>
			),
			width: enLocale ? 180 : 100,
			dataIndex: 'provider',
			ellipsis: true,
		},
		{
			title: <FormattedMessage id="device.enable" />,
			width: 100,
			dataIndex: 'enable',
			ellipsis: true,
			render: (_: any, row: any) => ['是', true].includes(row.enable) ? <FormattedMessage id="operation.yes" /> : <FormattedMessage id="operation.no" />,
			filterIcon: () => <FilterFilled style={{ color: fetchParams.enable ? '#1890ff' : undefined }} />,
			filterDropdown: ({ confirm }: any) => <SelectRadio
				list={defaultList}
				confirm={confirm}
				onConfirm={(val: any) => {
					let value = undefined
					if (val === 1) value = 'True'
					if (val === 0) value = 'False'
					setFetchParams({ ...fetchParams, enable: value })
				}} />,
		},
		{
			title: <FormattedMessage id="device.gmt_created" />,
			width: 170,
			dataIndex: 'gmt_created',
			ellipsis: true,
			sorter: true,
		},
		{
			title: <FormattedMessage id="device.gmt_modified" />,
			width: 170,
			dataIndex: 'gmt_modified',
			ellipsis: true,
			sorter: true

		},
		{
			title: () => (
				<UserSearchColumnFilterTitle
					title={formatMessage({ id: 'device.creator' })}
					params={fetchParams}
					setParams={setFetchParams}
					name={'creator'}
				/>
			),
			width: 120,
			dataIndex: 'creator',
			ellipsis: true,
		},
		{
			title: () => (
				<UserSearchColumnFilterTitle
					title={formatMessage({ id: 'device.update_user' })}
					params={fetchParams}
					setParams={setFetchParams}
					name={'update_user'}
				/>
			),
			width: 120,
			dataIndex: 'update_user',
			ellipsis: true,
			render(_: any) {
				return _ || "-"
			}
		},
		{
			title: <FormattedMessage id="device.description" />,
			dataIndex: 'description',
			ellipsis: true,
			// fixed: 'right',
			width: 100,
			render(_: any) {
				return _ || "-"
			}
		},
		{
			title: <FormattedMessage id="Table.columns.operation" />,
			key: 'ak_conf',
			fixed: 'right',
			width: 90,
			render: (text: any, record: any) => {
				return (
					<Space size='small'>
						<span className={styles.fail_detail_operation} onClick={() => key === 'ak' ? hanldeEdit(record) : hanldeEditImage(record)}>
							<FormattedMessage id="operation.edit" />
						</span>
						<Form
							form={form}
							layout="vertical"
						/*hideRequiredMark*/
						>
							<Popconfirm
								title={<FormattedMessage id="delete.prompt" />}
								onConfirm={() => {
									const generObj = handleDelete(record);
									const excuteResult: any = generObj.next();
									excuteResult.value.then((result: any) => {
										const { code, msg } = result;
										defaultOption(code, msg);
									})
								}}
								okText={<FormattedMessage id="operation.confirm" />}
								cancelText={<FormattedMessage id="operation.cancel" />}
								// scroll={{ x: 400 }}
								icon={<QuestionCircleOutlined style={{ color: 'red' }} />}>
								<span className={styles.fail_detail_operation}><FormattedMessage id="operation.delete" /></span>
							</Popconfirm>
						</Form>
					</Space>
				)
			}
		}
	].filter(Boolean);

	const columnsImage: TableColumnProps<any>[] = [
		{
			title: 'Image Name',
			width: 150,
			fixed: 'left',
			dataIndex: 'image_name',
			ellipsis: true,
			filterDropdown: ({ confirm }: any) => <SearchInput
				confirm={confirm}
				autoFocus={autoFocus}
				styleObj={{ container: 200, button_width: 100 }}
				onConfirm={(val: any) => { setFetchParams({ ...fetchParams, image_name: val }) }}
				currentBaseline={{ server_provider: ws_id, test_type: key, id: 'image_name' }}
				placeholder={formatMessage({ id: 'device.search.image.name' })}
			/>,
			onFilterDropdownVisibleChange: (visible: any) => {
				if (visible) {
					setFocus(!autoFocus)
				}
			},
			filterIcon: () => <FilterFilled style={{ color: fetchParams.image_name ? '#1890ff' : undefined }} />,
			render: (_: any, row: any) => {
				return (
					<ColumnEllipsisText ellipsis={{ tooltip: row.image_name }} >
						<Highlighter
							highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
							searchWords={[fetchParams.image_name || '']}
							autoEscape
							textToHighlight={row && row.image_name}
						/>
					</ColumnEllipsisText>
				)
			}
		},
		{
			title: 'Image ID',
			width: 120,
			dataIndex: 'image_id',
			ellipsis: true,
			filterDropdown: ({ confirm }: any) => <SearchInput
				confirm={confirm}
				autoFocus={autoFocus}
				styleObj={styleObj}
				onConfirm={(val: any) => { setFetchParams({ ...fetchParams, image_id: val }) }}
				currentBaseline={{ server_provider: ws_id, test_type: key, id: 'image_id' }}
				placeholder={formatMessage({ id: 'device.search.image.id' })}
			/>,
			onFilterDropdownVisibleChange: (visible: any) => {
				if (visible) {
					setFocus(!autoFocus)
				}
			},
			filterIcon: () => <FilterFilled style={{ color: fetchParams.image_id ? '#1890ff' : undefined }} />,
			render: (_: any, row: any) => {
				return (
					<ColumnEllipsisText ellipsis={{ tooltip: row.image_id }} >
						<Highlighter
							highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
							searchWords={[fetchParams.image_id || '']}
							autoEscape
							textToHighlight={row && row.image_id}
						/>
					</ColumnEllipsisText>
				)
			}
		},
		{
			title: 'Image Version',
			width: 120,
			dataIndex: 'image_version',
			ellipsis: true,
			filterDropdown: ({ confirm }: any) => <SearchInput
				confirm={confirm}
				autoFocus={autoFocus}
				styleObj={{ container: 200, button_width: 100 }}
				onConfirm={(val: any) => { setFetchParams({ ...fetchParams, image_version: val }) }}
				currentBaseline={{ server_provider: ws_id, test_type: key, id: 'image_version' }}
				placeholder={formatMessage({ id: 'device.search.image.version' })}
			/>,
			onFilterDropdownVisibleChange: (visible: any) => {
				if (visible) {
					setFocus(!autoFocus)
				}
			},
			filterIcon: () => <FilterFilled style={{ color: fetchParams.image_version ? '#1890ff' : undefined }} />,
			render: (_: any, row: any) => {
				return (
					<ColumnEllipsisText ellipsis={{ tooltip: row.image_version }} >
						<Highlighter
							highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
							searchWords={[fetchParams.image_version || '']}
							autoEscape
							textToHighlight={row && row.image_version}
						/>
					</ColumnEllipsisText>
				)
			}
		},
		{
			title: 'Image Group',
			width: 100,
			dataIndex: 'platform',
			ellipsis: true,
			filterDropdown: ({ confirm }: any) => <SearchInput
				confirm={confirm}
				autoFocus={autoFocus}
				styleObj={styleObj}
				onConfirm={(val: any) => { setFetchParams({ ...fetchParams, platform: val }) }}
				currentBaseline={{ server_provider: ws_id, test_type: key, id: 'platform' }}
				placeholder={formatMessage({ id: 'device.search.image.group' })}
			/>,
			onFilterDropdownVisibleChange: (visible: any) => {
				if (visible) {
					setFocus(!autoFocus)
				}
			},
			filterIcon: () => <FilterFilled style={{ color: fetchParams.platform ? '#1890ff' : undefined }} />,
			render: (_: any, row: any) => {
				return (
					<ColumnEllipsisText ellipsis={{ tooltip: row.platform }} >
						<Highlighter
							highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
							searchWords={[fetchParams.platform || '']}
							autoEscape
							textToHighlight={row && row.platform}
						/>
					</ColumnEllipsisText>
				)
			}
		},
		{
			title: 'Region',
			width: 100,
			dataIndex: 'region',
			ellipsis: true,
			filterDropdown: ({ confirm }: any) => <SearchInput
				confirm={confirm}
				autoFocus={autoFocus}
				styleObj={styleObj}
				onConfirm={(val: any) => { setFetchParams({ ...fetchParams, region: val }) }}
				currentBaseline={{ server_provider: ws_id, test_type: key, id: 'region' }}
				placeholder={formatMessage({ id: 'device.search.region' })}
			/>,
			onFilterDropdownVisibleChange: (visible: any) => {
				if (visible) {
					setFocus(!autoFocus)
				}
			},
			filterIcon: () => <FilterFilled style={{ color: fetchParams.region ? '#1890ff' : undefined }} />,
			render: (_: any, row: any) => {
				return (
					<ColumnEllipsisText ellipsis={{ tooltip: row.region }} >
						<Highlighter
							highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
							searchWords={[fetchParams.region || '']}
							autoEscape
							textToHighlight={row && row.region}
						/>
					</ColumnEllipsisText >
				)
			}
		},
		{
			title: () => (
				<UserSearchColumnFilterTitle
					title="Ak Name"
					params={fetchParams}
					setParams={setFetchParams}
					name={'ak_name'}
					ws_id={ws_id}
				/>
			),
			width: 150,
			dataIndex: 'ak_name',
			ellipsis: true,
		},
		{
			title: () => (
				<CheckboxColumnFilterTitle
					title={formatMessage({ id: 'device.cloud.service.provider' })}
					params={fetchParams}
					setParams={setFetchParams}
					name={'provider'}
					configType={key}
					list={providerList}
				/>
			),
			width: enLocale ? 180 : 100,
			dataIndex: 'provider',
			ellipsis: true,
		},
		{
			title: <FormattedMessage id="device.gmt_created" />,
			width: 180,
			dataIndex: 'gmt_created',
			ellipsis: true,
			sorter: true
		},
		{
			title: <FormattedMessage id="device.gmt_modified" />,
			width: 180,
			dataIndex: 'gmt_modified',
			ellipsis: true,
			sorter: true
		},
		{
			title: () => (
				<UserSearchColumnFilterTitle
					title={formatMessage({ id: 'device.creator' })}
					params={fetchParams}
					setParams={setFetchParams}
					name={'creator'}
				/>
			),
			width: 120,
			dataIndex: 'creator',
			ellipsis: true,

		},
		{
			title: () => (
				<UserSearchColumnFilterTitle
					title={formatMessage({ id: 'device.update_user' })}
					params={fetchParams}
					setParams={setFetchParams}
					name={'update_user'}
				/>
			),
			width: 120,
			dataIndex: 'update_user',
			ellipsis: true,
			render(_) {
				return _ || "-"
			}
		},
		{
			title: <FormattedMessage id="Table.columns.operation" />,
			key: 'image_conf',
			fixed: 'right',
			width: 100,
			render: (text: string, record: any) => {
				return (
					<Space size='small'>
						<span className={styles.fail_detail_operation} onClick={() => key === 'ak' ? hanldeEdit(record) : hanldeEditImage(record)}><FormattedMessage id="operation.edit" /></span>
						{/* 删除的弹框 */}
						<Form
							form={form}
							layout="vertical"
						/*hideRequiredMark*/
						>
							<Popconfirm
								title={<FormattedMessage id="delete.prompt" />}
								onConfirm={() => {
									const generObj = handleDelete(record);
									const excuteResult: any = generObj.next();
									excuteResult.value.then((result: any) => {
										const { code, msg } = result;
										defaultOption(code, msg);
									})
								}}
								okText={<FormattedMessage id="operation.ok" />}
								cancelText={<FormattedMessage id="operation.cancel" />}
								icon={<QuestionCircleOutlined style={{ color: 'red' }} />}>
								<span className={styles.fail_detail_operation}><FormattedMessage id="operation.delete" /></span>
							</Popconfirm>
						</Form>
					</Space>
				)
			}
		}
	]

	const handleAddAk = () => {
		addScript.current?.show('new')
	}
	const hanldeEdit = (record: any) => {
		const enableCopy = _.cloneDeep(record);
		enableCopy.enable = enableCopy.enable === '是' || enableCopy.enable === true
		addScript.current?.show('edit', enableCopy)
	}

	const handleAddImage = () => {
		addImage.current?.show('new')
	}
	const hanldeEditImage = (record: any) => {
		addImage.current?.show('edit', record)
	}

	let dataTable = _.isArray(data.data) ? _.cloneDeep(data.data) : []
	if (key === 'ak') {
		dataTable = dataTable.map((item: any) => {
			if (item.enable) {
				item.enable = '是'
				return item
			}
			item.enable = '否'
			return item
		})
	}

	return (
		<TabCard
			title={
				<Tabs activeKey={key} onChange={handleTab}  >
					<TabPane
						tab={<FormattedMessage id="device.ak.config" />}
						key="ak"
					/>
					<TabPane
						tab={<FormattedMessage id="device.image.config" />}
						key="image"
					/>
				</Tabs>
			}
			extra={
				<Button key="3" type="primary" onClick={key === 'ak' ? handleAddAk : handleAddImage}>
					{key === 'ak' ? <FormattedMessage id="device.new.ak" /> : <FormattedMessage id="device.new.image" />}
				</Button>
			}
		>
			<Table
				loading={loading}
				size={'small'}
				scroll={{ x: 1920 }}
				onChange={(pagination: any, filters: any, sorter: any) => {
					switch (sorter.order) {
						case undefined:
							if (sorter.field === 'gmt_created') setFetchParams({ ...fetchParams, gmt_created: undefined })
							if (sorter.field === 'gmt_modified') setFetchParams({ ...fetchParams, gmt_modified: undefined })
							break;
						case 'descend':
							if (sorter.field === 'gmt_created') setFetchParams({ ...fetchParams, gmt_created: '-gmt_created' })
							if (sorter.field === 'gmt_modified') setFetchParams({ ...fetchParams, gmt_modified: '-gmt_modified' })
							break;
						case 'ascend':
							if (sorter.field === 'gmt_created') setFetchParams({ ...fetchParams, gmt_created: '+gmt_created' })
							if (sorter.field === 'gmt_modified') setFetchParams({ ...fetchParams, gmt_modified: '+gmt_modified' })
							break;
						default:
							break;
					}
				}}
				columns={key === 'ak' ? columnsAk : columnsImage}
				dataSource={dataTable}
				rowKey={record => record.id + ''}
				pagination={false}
			/>
			<Row justify="space-between" style={{ padding: '16px 20px 0px' }}>
				{
					data.total > 1 &&
					<>
						<div>
							{formatMessage({ id: 'pagination.total.strip' }, { data: data.total || 0 })}
						</div>
						<Pagination
							// className={totalPaginationClass(data.total)}
							size="small"
							showQuickJumper
							showSizeChanger
							current={fetchParams.page_num}
							defaultCurrent={1}
							onChange={(page_num: number, page_size: any) => handlePage(page_num, page_size)}
							onShowSizeChange={(page_num: number, page_size: any) => handlePage(page_num, page_size)}
							total={data.total}
						/>
					</>
				}
			</Row>

			{key === 'ak' && <AddAkDrawer ref={addScript} onOk={setPageFn} />}
			{key === 'image' && <AddImageDrawer ref={addImage} onOk={setPageFn} />}
		</TabCard>
	);
};

export default CloudConfig;