import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button, Space, Drawer, Form, Tag, Input, message, Popconfirm, Pagination, Spin, Tooltip, Table, Row } from 'antd';
import { tagList, addTag, editTag, delSuite } from './service';
import styles from './style.less';
import ColorPicker from './components/ColorPicker';
import Highlighter from 'react-highlight-words';
import SearchInput from '@/components/Public/SearchInput';
import Log from '@/components/Public/Log';
import PopoverEllipsis from '@/components/Public/PopoverEllipsis';
import { FilterFilled, ExclamationCircleOutlined } from '@ant-design/icons';
import { SingleTabCard } from '@/components/UpgradeUI';
import PermissionTootip from '@/components/Public/Permission/index';
const SuiteManagement: React.FC<any> = props => {
	const { ws_id } = props.match.params
	const [formSuite] = Form.useForm();

	const [data, setData] = useState<any>([]);
	const [name, setName] = useState<string>();
	const [description, setDescription] = useState<string>();
	const [autoFocus, setFocus] = useState<boolean>(true)
	// const [mode, setMode] = useState<string>();
	const [page, setPage] = useState<number>(1)
	const [pageSize, setPageSize] = useState<number>(10)
	const [refresh, setRefresh] = useState<boolean>(true)
	const [loading, setLoading] = useState<boolean>(true)
	// const [environment, setEnvironment] = useState<string>()
	const [visible, setVisible] = useState<boolean>(false)
	const [fetching, setFetching] = useState<boolean>(false)
	const [outId, setOutId] = useState<number>()
	const [ratio, setRatio] = useState<number>(1)
	const [msg, setMsg] = useState<string>()
	const [validateStatus, setValidateStatus] = useState<string>()
	const getList = async (params: any = {}) => {
		setLoading(true)
		setData({ data: [] })
		const data: any = await tagList({ ...params })
		data && setData(data)
		setLoading(false)
	};
	const detectZoom = () => {
		var ratio: number = 0,
			screen: any = window.screen,
			ua: any = navigator.userAgent.toLowerCase();

		if (window.devicePixelRatio !== undefined) {
			ratio = window.devicePixelRatio;
		}
		else if (~ua.indexOf('msie')) {
			if (screen.deviceXDPI && screen.logicalXDPI) {
				ratio = screen.deviceXDPI / screen.logicalXDPI;
			}
		}
		else if (window.outerWidth !== undefined && window.innerWidth !== undefined) {
			ratio = window.outerWidth / window.innerWidth;
		}

		if (ratio) {
			ratio = 1.5 / ratio
		}
		console.log(ratio)
		setRatio(ratio)
	}
	useEffect(() => {
		detectZoom()
		window.addEventListener('resize', detectZoom);
		return () => {
			window.removeEventListener('resize', detectZoom);
		}
	}, []);
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
	const editOuter = (row: any) => {
		formSuite.resetFields()
		setValidateStatus('success')
		setMsg('仅允许包含字母、数字、下划线、中划线、点')
		setVisible(true)
		setOutId(row.id)
		setTimeout(function () {
			formSuite.setFieldsValue(row)
		}, 1)
	}
	const submitSuite = async (data: any) => {
		if (fetching) {
			return
		}
		setFetching(true)
		data.name = data.name && data.name.replace(/\s+/g, "")
		data.description = (data.description && data.description.replace(/\s+/g, "")) || ''
		const params = { ...data }
		params.ws_id = ws_id
		setValidateStatus('validating')
		setMsg('')
		const res: any = outId ? await editTag(outId, params) : await addTag(params)
		if (res.code == 201) {
			setTimeout(function () {
				setFetching(false)
			}, 1)
			setValidateStatus('error')
			setMsg(res.msg)
			return
		}
		setValidateStatus('success')
		setMsg('')
		await setVisible(false)
		setTimeout(function () {
			setFetching(false)
		}, 1)
		message.success('操作成功');
		outId ? setRefresh(!refresh) : page == 1 ? setRefresh(!refresh) : setPage(1)
	}

	const newSuite = () => {
		setOutId(undefined)
		setVisible(true)
		formSuite.resetFields()
		setValidateStatus('')
		setMsg('仅允许包含字母、数字、下划线、中划线、点')
	}

	const onSuiteSubmit = () => {
		formSuite.validateFields().then(val => {
			const reg = new RegExp(/^[A-Za-z0-9\._-]*$/g);
			if (!val.name || val.name.replace(/\s+/g, "") == '') {
				setValidateStatus('error')
				setMsg('请输入')
				return
			} else if (!reg.test(val.name) || val.name.length > 32) {
				setValidateStatus('error')
				setMsg('仅允许包含字母、数字、下划线、中划线、点，最长32个字符')
				return
			}
			submitSuite(val)
		}).catch(err => {
			if (!err.values.name || err.values.name.replace(/\s+/g, "") == '') {
				setValidateStatus('error')
				setMsg('请输入')
			}
		})
	}

	const remOuter = async (params: any) => {
		let outId = params.id
		let data = ws_id
		await delSuite(outId, data)
		message.success('操作成功');
		setRefresh(!refresh)
	}

	const columns: any = [
		{
			title: '标签名称',
			dataIndex: 'name',
			width: 170,
			filterDropdown: ({ confirm }: any) => <SearchInput confirm={confirm} autoFocus={autoFocus} onConfirm={(val: string) => { setPage(1), setName(val) }} />,
			onFilterDropdownVisibleChange: visible => {
				if (visible) {
					setFocus(!autoFocus)
				}
			},
			filterIcon: () => <FilterFilled style={{ color: name ? '#1890ff' : undefined }} />,
			render: (_, row) => (
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
			onFilterDropdownVisibleChange: visible => {
				if (visible) {
					setFocus(!autoFocus)
				}
			},
			render: (_, row) => <PopoverEllipsis title={row.description} width={150 * ratio}>
				<Highlighter
					highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
					searchWords={[description || '']}
					autoEscape
					textToHighlight={row.description ? row.description.toString() : '-'}
				/>
			</PopoverEllipsis>
		},
		{
			title: '创建人',
			dataIndex: 'create_user',
			width: 90,
		},
		{
			title: '修改人',
			dataIndex: 'update_user',
			width: 90,
		},
		{
			title: '创建时间',
			dataIndex: 'gmt_created',
			width: 200,
			render: (_, row) => row.create_user !== '系统预设' && <PopoverEllipsis width={200 * ratio} title={row.gmt_created} />
		},
		{
			title: '修改时间',
			dataIndex: 'gmt_modified',
			width: 200,
			render: (_, row) => row.create_user !== '系统预设' && <PopoverEllipsis width={200 * ratio} title={row.gmt_modified} />
		},
		{
			title: '操作',
			valueType: 'option',
			dataIndex: 'id',
			width: 150,
			render: (_, row) =>
				row.create_user !== '系统预设' && <Space>
					<Button type="link" style={{ padding: 0, height: 'auto' }} onClick={() => editOuter({ ...row })}>编辑</Button>
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
					<PermissionTootip>
						<Button type="link" disabled={true} style={{ padding: 0, height: 'auto' }} onClick={() => handleOpenLogDrawer(row.id)}>日志</Button>
					</PermissionTootip>
				</Space>,
		},
	];
	return (
		<SingleTabCard title="调度标签"
			extra={
				<Button key="3" type="primary" onClick={newSuite}> 创建标签 </Button>
			}
		>
			<Spin spinning={loading}>
				<Table
					size={'small'}
					className={styles.pro_table_card}
					columns={columns}
					dataSource={data.data}
					rowKey={record => record.id + ''}
					pagination={false}
				/>
				<Row justify="space-between" style={{ padding: '16px 20px 0' }}>
					<div className={data.total == 0 ? styles.hidden : ''} >
						共{data.total}条
					</div>
					<Pagination
						size="small"
						className={data.total == 0 ? styles.hidden : ''}
						showQuickJumper
						showSizeChanger
						current={page}
						defaultCurrent={1}
						onChange={(page_num: number, page_size: any) => handlePage(page_num, page_size)}
						onShowSizeChange={(page_num: number, page_size: any) => handlePage(page_num, page_size)}
						total={data.total}
					/>
				</Row>
			</Spin>

			<Log ref={logDrawer} operation_object="machine_server_tag" />
			<Drawer
				maskClosable={false}
				keyboard={false}
				title={(outId ? '编辑' : "创建") + "标签"}
				width={376}
				onClose={() => setVisible(false)}
				visible={visible}
				bodyStyle={{ paddingBottom: 80 }}
				footer={
					<div
						style={{
							textAlign: 'right',
						}}
					>
						<Button onClick={() => setVisible(false)} style={{ marginRight: 8 }}>
							取消
						</Button>
						<Button onClick={onSuiteSubmit} type="primary" htmlType="submit" >
							{outId ? '更新' : '确定'}
						</Button>
					</div>
				}
			>
				<Spin spinning={validateStatus === 'validating'}>
					<Form
						layout="vertical"
						form={formSuite}
						initialValues={{
							tag_color: 'rgb(255,157,78,1)'
						}}
					/*hideRequiredMark*/
					>
						<Form.Item
							name="tag_color"
							label="标签颜色"
							rules={[{ required: true, message: '请选择' }]}
						>
							<ColorPicker />
						</Form.Item>
						<Form.Item
							name="name"
							label="标签名称"
							validateStatus={validateStatus}
							help={msg}
							rules={[{ required: true, min: 1 }]}
						>
							<Input
								placeholder="请输入"
								autoComplete="off"
								onChange={(e) => {
									if (!e.target.value.replace(/\s+/g, "")) {
										setValidateStatus('error')
										setMsg('请输入')
										return
									}
									setMsg(undefined)
									setValidateStatus('')
								}}
							/>
						</Form.Item>
						{/* {!outId &&
							<Form.Item
								name="run_environment"
								label="运行环境"
								rules={[{ required: true, message: '请选择' }]}
							>
								<Select placeholder="请选择">
									{
										modeList.map((item: any, index: number) => {
											return <Option value={item.id} key={item.id}>{item.name}</Option>
										})
									}
								</Select>
							</Form.Item>
						}
						{!outId &&
							<Form.Item
								name="run_mode"
								label="运行模式"
								rules={[{ required: true, message: '请选择' }]}
							>
								<Select placeholder="请选择">
									{
										runList.map((item: any, index: number) => {
											return <Option value={item.id} key={item.id}>{item.name}</Option>
										})
									}
								</Select>
							</Form.Item>
						} */}
						<Form.Item
							name="description"
							label="备注"
						>
							<Input.TextArea rows={3} placeholder="请输入备注信息" />
						</Form.Item>
					</Form>
				</Spin>
			</Drawer>
		</SingleTabCard>
	);
};

export default SuiteManagement;



				// <PopoverEllipsis title={row.name} width={130 * ratio}>
				// 	<Tag color={row.tag_color}>
				// 		{/* <Highlighter
				// 			highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
				// 			searchWords={[name || '']}
				// 			autoEscape
				// 			textToHighlight={
				// 				row.name.toString()
				// 			}
				// 		/> */}
				// 		{ row.name.toString().length > 10 ? 
				// 					row.name.toString().substr( 0 , 10 ).concat('...') :row.name.toString() }
				// 		{/* {row.name.toString().length > 10 ? 
				// 					row.name.toString().substr( 0 , 10 ).concat('...') : } */}
				// 	</Tag>
				// </PopoverEllipsis>