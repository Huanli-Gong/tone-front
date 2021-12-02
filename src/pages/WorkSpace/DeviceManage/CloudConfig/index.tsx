import React, { useState, useEffect, useRef } from 'react';
import { Form, Button, Space, Tabs, message, Popconfirm, Pagination, Popover, Table, Row } from 'antd';
import { FilterFilled, QuestionCircleOutlined } from '@ant-design/icons';
import { deleteCloudImage, queryCloudImage, deleteCloudAk, queryCloudAk } from './service';
import styles from './style.less';
import { history } from 'umi'

import SearchInput from '@/components/Public/SearchInput'
import PopoverEllipsis from '@/components/Public/PopoverEllipsis'
import Highlighter from 'react-highlight-words'

import _ from 'lodash'
import AddAkDrawer from './components/DomianConf/AddAk'
import AddImageDrawer from './components/DomianConf/AddImage'
import { UserSearchColumnFilterTitle, CheckboxColumnFilterTitle } from './components/DomianConf/index'
import SelectRadio from '@/components/Public/SelectRadio';
import { TabCard } from '@/components/UpgradeUI';
import { requestCodeMessage } from '@/utils/utils';

const CloudConfig: React.FC<any> = (props) => {
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
		getList(defaultParmas)
	}, []);

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

	const handleDelete = function* (record: any = {}) {
		key === 'ak' ?
			yield deleteCloudAk({ id_list: [record.id], ws_id }) :
			yield deleteCloudImage({ id_list: [record.id], ws_id })
	}
	const defaultOption = (code: number, msg: string) => {
		if (code === 200) {
			message.success('操作成功')
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

	const providerList = [{ id: 'aliyun_ecs', name: '阿里云ECS' }, { id: 'aliyun_eci', name: '阿里云ECI' }]
	const defaultList = [{ id: 1, name: '是' }, { id: 0, name: '否' }]
	const styleObj = {
		container: 180,
		button_width: 90
	}
	
	const plusMessage = (str:string,frontLen:number,endLen:number) => {
		if(str){
			let len = str.length - frontLen - endLen;
			let xing = '';
			for (var i=0;i<len;i++) {
				xing+='*';
			}
			return str.substring(0,frontLen) + xing + str.substring(str.length - endLen);
		}
		return '';
	}

	const columnsAk: any = [
		{
			title: 'AkName',
			dataIndex: 'name',
			fixed: 'left',
			width: 150,
			ellipsis: true,
			filterDropdown: ({ confirm }: any) => <SearchInput
				confirm={confirm}
				autoFocus={autoFocus}
				styleObj={styleObj}
				onConfirm={(val: any) => { setFetchParams({ ...fetchParams, name: val }) }}
				currentBaseline={{ server_provider: ws_id, test_type: key, id: 'name' }}
				placeholder="支持搜索akName"
			/>,
			onFilterDropdownVisibleChange: (visible: any) => {
				if (visible) {
					setFocus(!autoFocus)
				}
			},
			filterIcon: () => <FilterFilled style={{ color: fetchParams.name ? '#1890ff' : undefined }} />,
			render: (_, row: any) => {
				return (
					<PopoverEllipsis title={row.name} >
						<Highlighter
							highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
							searchWords={[fetchParams.name || '']}
							autoEscape
							textToHighlight={row && row.name}
						/>
					</PopoverEllipsis>
				)
			}
		},
		{
			title: 'AccessID',
			// width : 175,
			dataIndex: 'access_id',
			width: 120,
			ellipsis: true,
			filterDropdown: ({ confirm }: any) => <SearchInput
				confirm={confirm}
				autoFocus={autoFocus}
				styleObj={styleObj}
				onConfirm={(val: any) => { setFetchParams({ ...fetchParams, access_id: val }) }}
				currentBaseline={{ server_provider: ws_id, test_type: key, id: 'access_id' }}
				placeholder="支持搜索accessID"
			/>,
			onFilterDropdownVisibleChange: (visible: any) => {
				if (visible) {
					setFocus(!autoFocus)
				}
			},
			filterIcon: () => <FilterFilled style={{ color: fetchParams.access_id ? '#1890ff' : undefined }} />,
			render: (_, row: any) => {
				return (
					<PopoverEllipsis title={plusMessage(row.access_id,6,6)} >
						<Highlighter
							highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
							searchWords={[fetchParams.access_id || '']}
							autoEscape
							textToHighlight={plusMessage(row.access_id,6,6)}
						/>
					</PopoverEllipsis>
				)
			}
		},
		{
			title: 'AccessKEY',
			width: 120,
			dataIndex: 'access_key',
			ellipsis: true,
			filterDropdown: ({ confirm }: any) => <SearchInput
				confirm={confirm}
				autoFocus={autoFocus}
				styleObj={styleObj}
				onConfirm={(val: any) => { setFetchParams({ ...fetchParams, access_key: val }) }}
				currentBaseline={{ server_provider: ws_id, test_type: key, id: 'access_key' }}
				placeholder="支持搜索accessKEY"
			/>,
			onFilterDropdownVisibleChange: (visible: any) => {
				if (visible) {
					setFocus(!autoFocus)
				}
			},
			filterIcon: () => <FilterFilled style={{ color: fetchParams.access_key ? '#1890ff' : undefined }} />,
			render: (_, row: any) => {
				return (
					<PopoverEllipsis title={plusMessage(row.access_key,6,6)} >
						<Highlighter
							highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
							searchWords={[fetchParams.access_key || '']}
							autoEscape
							textToHighlight={plusMessage(row.access_key,6,6)}
						/>
					</PopoverEllipsis>
				)
			}
		},
		{
            title: '资源组ID',
            width: 120,
            dataIndex: 'resource_group_id',
            ellipsis: true,
            filterDropdown: ({ confirm }: any) => <SearchInput
                confirm={confirm}
                autoFocus={autoFocus}
                styleObj={styleObj}
                onConfirm={(val: any) => { setFetchParams({ ...fetchParams, resource_group_id: val }) }}
                currentBaseline={{ server_provider: ws_id, test_type: key, id: 'resource_group_id' }}
                placeholder="支持搜索资源组ID"
            />,
            onFilterDropdownVisibleChange: (visible: any) => {
                if (visible) {
                    setFocus(!autoFocus)
                }
            },
            filterIcon: () => <FilterFilled style={{ color: fetchParams.resource_group_id ? '#1890ff' : undefined }} />,
            render: (_, row: any) => {
                return (
                    <PopoverEllipsis title={plusMessage(row.resource_group_id,6,6)} >
                        <Highlighter
                            highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                            searchWords={[fetchParams.resource_group_id || '']}
                            autoEscape
                            textToHighlight={plusMessage(row.resource_group_id,6,6)}
                        />
                    </PopoverEllipsis>
                )
            }
        },
		{
			title: () => (
				<CheckboxColumnFilterTitle
					title="云服务商"
					params={fetchParams}
					setParams={setFetchParams}
					name={'provider'}
					configType={key}
					list={providerList}
				/>
			),
			width: 100,
			dataIndex: 'provider',
			ellipsis: true,
		},
		{
			title: '是否启用',
			width: 100,
			dataIndex: 'enable',
			ellipsis: true,
			render: (_, row) => row.enable,
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
			title: '创建时间',
			width: 180,
			dataIndex: 'gmt_created',
			ellipsis: true,
			sorter: true,
		},
		{
			title: '修改时间',
			width: 180,
			dataIndex: 'gmt_modified',
			ellipsis: true,
			sorter: true

		},
		{
			title: () => (
				<UserSearchColumnFilterTitle
					title="创建者"
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
					title="修改者"
					params={fetchParams}
					setParams={setFetchParams}
					name={'update_user'}
				/>
			),
			width: 120,
			dataIndex: 'update_user',
			ellipsis: true,
		},
		{
			title: '描述',
			dataIndex: 'description',
			ellipsis: true,
			// fixed: 'right',
			width: 100,
		},
		{
			title: '操作',
			key: 'ak_conf',
			fixed: 'right',
			width: 90,
			render: (text, record) => {
				return (
					<Space size='small'>
						<span className={styles.fail_detail_operation} onClick={() => key === 'ak' ? hanldeEdit(record) : hanldeEditImage(record)}>编辑</span>
						<Form
							form={form}
							layout="vertical"
						/*hideRequiredMark*/
						>
							<Popconfirm
								title="你确定要删除吗？"
								onConfirm={() => {
									const generObj = handleDelete(record);
									const excuteResult: any = generObj.next();
									excuteResult.value.then((result: any) => {
										const { code, msg } = result;
										defaultOption(code, msg);
									})
								}}
								okText="确认"
								cancelText="取消"
								// scroll={{ x: 400 }}
								icon={<QuestionCircleOutlined style={{ color: 'red' }} />}>
								<span className={styles.fail_detail_operation}>删除</span>
							</Popconfirm>
						</Form>
					</Space>
				)
			}
		}
	]
	const columnsImage: any = [
		{
			title: 'ImageName',
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
				placeholder="支持搜索imageName"
			/>,
			onFilterDropdownVisibleChange: (visible: any) => {
				if (visible) {
					setFocus(!autoFocus)
				}
			},
			filterIcon: () => <FilterFilled style={{ color: fetchParams.image_name ? '#1890ff' : undefined }} />,
			render: (_, row: any) => {
				return (
					<PopoverEllipsis title={row.image_name} >
						<Highlighter
							highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
							searchWords={[fetchParams.image_name || '']}
							autoEscape
							textToHighlight={row && row.image_name}
						/>
					</PopoverEllipsis>
				)
			}
		},
		{
			title: 'ImageID',
			width: 120,
			dataIndex: 'image_id',
			ellipsis: true,
			filterDropdown: ({ confirm }: any) => <SearchInput
				confirm={confirm}
				autoFocus={autoFocus}
				styleObj={styleObj}
				onConfirm={(val: any) => { setFetchParams({ ...fetchParams, image_id: val }) }}
				currentBaseline={{ server_provider: ws_id, test_type: key, id: 'image_id' }}
				placeholder="支持搜索imageID"
			/>,
			onFilterDropdownVisibleChange: (visible: any) => {
				if (visible) {
					setFocus(!autoFocus)
				}
			},
			filterIcon: () => <FilterFilled style={{ color: fetchParams.image_id ? '#1890ff' : undefined }} />,
			render: (_, row: any) => {
				return (
					<PopoverEllipsis title={row.image_id} >
						<Highlighter
							highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
							searchWords={[fetchParams.image_id || '']}
							autoEscape
							textToHighlight={row && row.image_id}
						/>
					</PopoverEllipsis>
				)
			}
		},
		{
			title: 'ImageVersion',
			width: 120,
			dataIndex: 'image_version',
			ellipsis: true,
			filterDropdown: ({ confirm }: any) => <SearchInput
				confirm={confirm}
				autoFocus={autoFocus}
				styleObj={{ container: 200, button_width: 100 }}
				onConfirm={(val: any) => { setFetchParams({ ...fetchParams, image_version: val }) }}
				currentBaseline={{ server_provider: ws_id, test_type: key, id: 'image_version' }}
				placeholder="支持搜索imageVersion"
			/>,
			onFilterDropdownVisibleChange: (visible: any) => {
				if (visible) {
					setFocus(!autoFocus)
				}
			},
			filterIcon: () => <FilterFilled style={{ color: fetchParams.image_version ? '#1890ff' : undefined }} />,
			render: (_, row: any) => {
				return (
					<PopoverEllipsis title={row.image_version} >
						<Highlighter
							highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
							searchWords={[fetchParams.image_version || '']}
							autoEscape
							textToHighlight={row && row.image_version}
						/>
					</PopoverEllipsis>
				)
			}
		},
		{
			title: 'ImageGroup',
			width: 100,
			dataIndex: 'platform',
			ellipsis: true,
			filterDropdown: ({ confirm }: any) => <SearchInput
				confirm={confirm}
				autoFocus={autoFocus}
				styleObj={styleObj}
				onConfirm={(val: any) => { setFetchParams({ ...fetchParams, platform: val }) }}
				currentBaseline={{ server_provider: ws_id, test_type: key, id: 'platform' }}
				placeholder="支持搜索ImageGroup"
			/>,
			onFilterDropdownVisibleChange: (visible: any) => {
				if (visible) {
					setFocus(!autoFocus)
				}
			},
			filterIcon: () => <FilterFilled style={{ color: fetchParams.platform ? '#1890ff' : undefined }} />,
			render: (_, row: any) => {
				return (
					<PopoverEllipsis title={row.platform} >
						<Highlighter
							highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
							searchWords={[fetchParams.platform || '']}
							autoEscape
							textToHighlight={row && row.platform}
						/>
					</PopoverEllipsis>
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
				placeholder="支持搜索region"
			/>,
			onFilterDropdownVisibleChange: (visible: any) => {
				if (visible) {
					setFocus(!autoFocus)
				}
			},
			filterIcon: () => <FilterFilled style={{ color: fetchParams.region ? '#1890ff' : undefined }} />,
			render: (_, row: any) => {
				return (
					<PopoverEllipsis title={row.region} >
						<Highlighter
							highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
							searchWords={[fetchParams.region || '']}
							autoEscape
							textToHighlight={row && row.region}
						/>
					</PopoverEllipsis>
				)
			}
		},
		{
			title: () => (
				<UserSearchColumnFilterTitle
					title="AkName"
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
					title="云服务商"
					params={fetchParams}
					setParams={setFetchParams}
					name={'provider'}
					configType={key}
					list={providerList}
				/>
			),
			width: 100,
			dataIndex: 'provider',
			ellipsis: true,
		},
		{
			title: '创建时间',
			width: 180,
			dataIndex: 'gmt_created',
			ellipsis: true,
			sorter: true
		},
		{
			title: '修改时间',
			width: 180,
			dataIndex: 'gmt_modified',
			ellipsis: true,
			sorter: true
		},
		{
			title: () => (
				<UserSearchColumnFilterTitle
					title="创建者"
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
					title="修改者"
					params={fetchParams}
					setParams={setFetchParams}
					name={'update_user'}
				/>
			),
			width: 120,
			dataIndex: 'update_user',
			ellipsis: true,
		},
		{
			title: '操作',
			key: 'image_conf',
			fixed: 'right',
			width: 100,
			render: (text, record) => {
				return (
					<Space size='small'>
						<span className={styles.fail_detail_operation} onClick={() => key === 'ak' ? hanldeEdit(record) : hanldeEditImage(record)}>编辑</span>
						{/* 删除的弹框 */}
						<Form
							form={form}
							layout="vertical"
						/*hideRequiredMark*/
						>
							<Popconfirm
								title="你确定要删除吗？"
								onConfirm={() => {
									const generObj = handleDelete(record);
									const excuteResult: any = generObj.next();
									excuteResult.value.then((result: any) => {
										const { code, msg } = result;
										defaultOption(code, msg);
									})
								}}
								okText="确认"
								cancelText="取消"
								icon={<QuestionCircleOutlined style={{ color: 'red' }} />}>
								<span className={styles.fail_detail_operation}>删除</span>
							</Popconfirm>
						</Form>
					</Space>
				)
			}
		}
	]

	const handleAddAk = () => {
		addScript.current?.show('新建ak')
	}
	const hanldeEdit = (record: any) => {
		const enableCopy = _.cloneDeep(record);
		enableCopy.enable = enableCopy.enable === '是' || enableCopy.enable === true
		addScript.current?.show('编辑ak', enableCopy)
	}

	const handleAddImage = () => {
		addImage.current?.show('新建image')
	}
	const hanldeEditImage = (record: any) => {
		addImage.current?.show('编辑image', record)
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
						tab="ak配置"
						key="ak"
					/>
					<TabPane
						tab="镜像配置"
						key="image"
					/>
				</Tabs>
			}
			extra={
				<Button key="3" type="primary" onClick={key === 'ak' ? handleAddAk : handleAddImage}> {key === 'ak' ? '新建ak' : '新建image'}</Button>
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
							共{data.total || 0}条
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

			{key === 'ak' && <AddAkDrawer ref={addScript} setPage={setPageFn} onOk={getList} ws_id={ws_id} />}
			{key === 'image' && <AddImageDrawer ref={addImage} setPage={setPageFn} onOk={getList} ws_id={ws_id} />}
		</TabCard>
	);
};

export default CloudConfig;