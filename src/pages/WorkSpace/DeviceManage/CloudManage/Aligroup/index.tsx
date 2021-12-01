import React, { useState, useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Button, Pagination, Popconfirm, Space, Tag, Drawer, Row, Col, Form, Input, Select, Spin, Empty, message, Table, Modal } from 'antd';
import styles from './style.less';
import { CaretRightFilled, CaretDownFilled,ExclamationCircleOutlined } from '@ant-design/icons';
import { querysCluster, queryTag, queryMember, addGroup, editGroup, delGroup } from '../service';
import { queryServerDel } from '../../GroupManage/services'
import GroupTree from './GroupTree';
import GroupMachine from './GroupMachine'
import SearchInput from '@/components/Public/SearchInput';
import SelectUser from '@/components/Public/SelectUser';
import SelectTags from '@/components/Public/SelectTags';
import Highlighter from 'react-highlight-words';
import Owner from '@/components/Owner/index';
import { FilterFilled } from '@ant-design/icons';
import PopoverEllipsis from '@/components/Public/PopoverEllipsis';
import Log from '@/components/Public/Log';
import { useParams } from 'umi';
import { resizeClientSize } from '@/utils/hooks';
// import PermissionTootip from '@/components/Public/Permission/index';
/**
 * 云上集群
 * 
 */
const Aligroup: React.FC<any> = (props, ref) => {
    const { ws_id }: any = useParams()
    const [form] = Form.useForm();

    const aloneMachine = useRef<any>(null)
    const tree = useRef<any>(null)
    const outTable = useRef<any>(null)
    const [loading, setLoading] = useState<boolean>(false)
    const [data, setData] = useState<any>({ data: [] });
    const [refresh, setRefresh] = useState<boolean>(true)
    const [page, setPage] = useState<number>(1)
    const [pageSize, setPageSize] = useState<number>(10)
    const [visible, setVisible] = useState<boolean>(false)
    const [tagList, setTagList] = useState<any>([])
    const [keyword, setKeyword] = useState<string>()
    const [tagWord, setTagword] = useState<string>()
    const [user, setUser] = useState<any>([])
    const [outId, setOutId] = useState<number>()
    const [fetching, setFetching] = useState<boolean>(true)

    const [expandKey, setExpandKey] = useState<string[]>([])
    // const [key, setKey] = useState<number>() 
    const [name, setName] = useState<string>()
    const [owner, setOwner] = useState<any>();
    const [tags, setTags] = useState<any>();
    const [description, setDescription] = useState<string>();
    const top = 39, size = 41;
    const [deleteVisible, setDeleteVisible] = useState(false);
    const [deleteDefault, setDeleteDefault] = useState(false);
    const [deleteObj, setDeleteObj] = useState<any>({});
    const [autoFocus, setFocus] = useState<boolean>(true)
    const { Option } = Select;
    const [operation, setOperation] = useState<string>('machine_cluster_aliyun')
    const logDrawer: any = useRef()
    //
    const [validateResult, setValidateResult] = useState<any>({});
    const [refreshColumn, setRefreshColumn] = useState<any>(null) // 当前操作的行。

    // 
    const handleOpenLogDrawer = useCallback(
        (id, type) => {
            setOperation(type)
            logDrawer.current.show( id )
        },
        []
    )

    const handlePage = (page_num: number, page_size: any) => {
        setPage(page_num)
        setPageSize(page_size)
    }
    const getServerTagList = async (word?: string) => {
        const param = word && word.replace(/\s*/g, "")
        if (tagWord && tagWord == param) return
        setTagword(param)
        setFetching(true)
        const { data } = await queryTag({ name: param, ws_id }) //run_mode: 'cluster', run_environment: 'aliyun', 
        setTagList(data || [])
        setFetching(false)
    }
    const getList = async (params: any = {}) => {
        setLoading(true)
        setData({ data: [] })
        const data: any = await querysCluster({ ...params })
        data && setData(data)
        setLoading(false)
    };
    const handleSearch = async (word?: string) => {
        const param = word && word.replace(/\s*/g, "")
        if (keyword && keyword == param) return
        setKeyword(param)
        setFetching(true)
        let { data } = await queryMember({ keyword: param,/* scope:'aligroup'  */ })
        setUser(data || [])
        setFetching(false)
    }
    const tagRender = (props: any) => {
        const { label, closable, onClose } = props;
        const { color, children } = label.props || {}
        return (
            <Tag color={color} closable={closable} onClose={onClose} style={{ marginRight: 3 }}>
                {children}
            </Tag>
        )
    }
    const newGroup = () => {
        setOutId(undefined)
        //handleSearch()
        getServerTagList()
        setVisible(true)
        form.resetFields()
    }

    useEffect(() => {
        const params = {
            cluster_type: 'aliyun',
            page_num: page,
            page_size: pageSize,
            name: name, owner: owner, tags: tags, description: description, ws_id
        }
        getList(params)
    }, [refresh, page, pageSize, name, owner, tags, description]);

    const { windowWidth } = resizeClientSize()

    const submit = async (params: any) => {
        if (outId) {
            let param: any = {
                description: params.description || '',
                tags: params.tags,
                emp_id: params.emp_id,
                name: params.name,
                ws_id
            }
            const res = await editGroup(outId, param) || {}
            if (res.code === 200) {
                // 成功
                setVisible(false)
                message.success('操作成功');
                setRefresh(!refresh)
                return
            }
            // 失败
            setValidateResult({ ...res, error: true })
            return
        }

        let param = { ...params, ws_id }
        param.description = params.description || ''
        param.ws_id = ws_id
        param.cluster_type = 'aliyun'

        const res = await addGroup({ ...param })
        if (res.code === 200) {
            // 成功
            setVisible(false)
            message.success('操作成功');
            setPage(1)
            setRefresh(!refresh)
            return
        }
        // 失败
        setValidateResult({ ...res, error: true })
    }

    const onSubmit = () => {
        // 云上: cluster_type字段传"aliyun"
        form.validateFields().then(val => submit(val))
    }

    const modifyGroup = (row: any) => {
        setUser([{ id: row.owner, last_name: row.owner_name }])
        getServerTagList()
        row.tags = row.tag_list.map((item: any) => { return item.id })
        setOutId(row.id)
        setVisible(true)
        form.resetFields()
        setTimeout(function () {
            form.setFieldsValue({ ...row })
        }, 1)
    }
    const handleDelServer = async(row:any) => {
        setDeleteObj(row)
        const data = await queryServerDel({ server_id:row.id, run_mode:'cluster',server_provider:'aliyun' })
        if( data.data.length > 0 ) {
            setDeleteVisible(true)
        }else{
            setDeleteDefault(true)
        }
    }
    const removeGroup = async (id: number) => {
        let data = { ws_id: ws_id }
        await delGroup(id, data)
        message.success('操作成功');
        setDeleteVisible(false)
        setDeleteDefault(false)
        setRefresh(!refresh)
    }
    const onExpand = async (_: boolean, record: any) => {
        const currentId = record.id + ''
        const expandKeyList = _ ? expandKey.concat([currentId]) : expandKey.filter((item) => item !== currentId)
        setExpandKey(expandKeyList)
    }

    // 添加
    const addMachine = (id: number) => {
        aloneMachine.current && aloneMachine.current.newMachine(id)
    }
    const handleDetail = () => {
		window.open(`/ws/${ws_id}/refenerce/7/?name=${deleteObj.name}&id=${deleteObj.id}`)
	}
    // 添加成功回调
    const successCallback = (info: any) => {
        const { parentId } = info
        setRefreshColumn(parentId)
        if (parentId && expandKey.indexOf(parentId + '') < 0) {
            const temp = expandKey.concat([parentId + ''])
            setExpandKey(temp)
        }
        tree.current && tree.current.reload('add', { parentRowId: parentId })
    }

    useImperativeHandle(ref, () => ({
        open: newGroup
    }), [])

    const columns: any = [
        {
            title: '集群名',
            dataIndex: 'name',
            width: 150,
            filterDropdown: ({ confirm }: any) => <SearchInput confirm={confirm} autoFocus={autoFocus} onConfirm={(val: string) => { setPage(1), setName(val) }} />,
            onFilterDropdownVisibleChange: ( visible : any ) => {
                if (visible) {
                    setFocus(!autoFocus)
                }
            },
            filterIcon: () => <FilterFilled style={{ color: name ? '#1890ff' : undefined }} />,
            render: (_:any, row: any) => <PopoverEllipsis title={row.name} width={120}>
                <Highlighter
                    highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                    searchWords={[name || '']}
                    autoEscape
                    textToHighlight={row.name.toString()}
                />
            </PopoverEllipsis>
        },
        {
            title: 'Owner',
            dataIndex: 'owner_name',
            width: 150,
            filterIcon: () => <FilterFilled style={{ color: owner ? '#1890ff' : undefined }} />,
            filterDropdown: ({ confirm }: any) => <SelectUser autoFocus={autoFocus} confirm={confirm} onConfirm={(val: number) => { setPage(1), setOwner(val) }} />,
            onFilterDropdownVisibleChange: ( visible : any ) => {
                if (visible) {
                    setFocus(!autoFocus)
                }
            },
            render: (_:any, row: any) => <PopoverEllipsis title={row.owner_name} />
        },
        {
            title: '标签',
            dataIndex: 'tag_list',
            width: 250,
            filterIcon: () => <FilterFilled style={{ color: tags && tags.length > 0 ? '#1890ff' : undefined }} />,
            filterDropdown: ({ confirm }: any) => <SelectTags run_mode={'cluster'} autoFocus={autoFocus} confirm={confirm} onConfirm={(val: number) => { setPage(1), setTags(val) }} />,
            render: (_:any, row: any) => <div>
                {
                    row.tag_list.map((item: any, index: number) => {
                        return <Tag color={item.tag_color} key={index}>{item.name}</Tag>
                    })
                }
                {
                    row.tag_list.length == 0 ? '-' : ''
                }
            </div>
        },
        {
            title: '备注',
            dataIndex: 'description',
            width: 300,
            filterIcon: () => <FilterFilled style={{ color: description ? '#1890ff' : undefined }} />,
            filterDropdown: ({ confirm }: any) => <SearchInput confirm={confirm} autoFocus={autoFocus} onConfirm={(val: string) => { setPage(1), setDescription(val) }} />,
            onFilterDropdownVisibleChange: ( visible : any ) => {
                if (visible) {
                    setFocus(!autoFocus)
                }
            },
            render: (_:any, row: any) => <PopoverEllipsis title={row.description} width={200} >
                <Highlighter
                    highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                    searchWords={[description || '']}
                    autoEscape
                    textToHighlight={row.description ? row.description.toString() : '-'}
                />
            </PopoverEllipsis>,
        },
        {
            title: '操作',
            valueType: 'option',
            dataIndex: 'id',
            width: 180,
            render: (_:any, row:any) => <Space>
                <Button type="link" style={{ padding: 0, height: 'auto' }} onClick={() => { addMachine(row.id) }}>添加</Button>
                <Button type="link" style={{ padding: 0, height: 'auto' }} onClick={() => modifyGroup(row)}>编辑</Button>
                    {/* <Popconfirm title="确定要删除吗？"
                        placement="topRight"
                        okText="确定"
                        cancelText="取消"
                        onConfirm={() => { removeGroup(row.id) }}
                        overlayStyle={{ width: '224px' }}
                    >
                        <Button type="link" style={{ padding: 0, height: 'auto' }}>删除</Button>
                    </Popconfirm> */}
                <Button type="link" style={{ padding: 0, height: 'auto' }} onClick={()=>handleDelServer({ ...row })}>删除</Button>
                <Button type="link" style={{ padding: 0, height: 'auto' }} onClick={() => handleOpenLogDrawer(row.id, 'machine_cluster_aliyun')}>日志</Button>
                {/* <PermissionTootip>
                    <Button type="link" disabled={true} style={{ padding: 0, height: 'auto' }} onClick={() => handleOpenLogDrawer(row.id, 'machine_cluster_aliyun')}>日志</Button>
                </PermissionTootip> */}
            </Space>,
        },
    ];

    return (
        <div className={styles.warp}>
            <Table
                size={'small'}
                loading={loading}
                columns={columns}
                dataSource={data.data}
                rowKey={record => record.id + ''}
                pagination={false}
                expandable={{
                    expandedRowRender: (record) => (
                        <GroupTree
                            onRef={tree}
                            handleOpenLogDrawer={handleOpenLogDrawer}
                            size={size}
                            top={top}
                            width={windowWidth - 200 - 68 }
                            cluster_id={record.id}
                            refreshId={refreshColumn}
                            resetRefreshId={setRefreshColumn}
                        />
                    ),
                    onExpand: (_, record) => {
                        onExpand(_, record)
                        // const expandKeyList = _ ? expandKey.concat([record.id]) :  expandKey.filter((item) => item !== record.id)
                    },
                    expandedRowKeys: expandKey,
                    expandIcon: ({ expanded, onExpand, record }) =>
                        expanded ? (<CaretDownFilled onClick={e => onExpand(record, e)} />) :
                            (<CaretRightFilled onClick={e => onExpand(record, e)} />)
                }}
            />

            <Row justify="space-between" style={{ padding: '16px 20px 0' }} ref={outTable}>
                <div className={data.total == 0 ? styles.hidden : ''} >
                    共{data.total || 0}条
				</div>
                <Pagination
                    className={data.total == 0 ? styles.hidden : ''}
                    showQuickJumper
                    showSizeChanger
                    size="small"
                    current={page}
                    defaultCurrent={1}
                    onChange={(page_num: number, page_size: any) => handlePage(page_num, page_size)}
                    onShowSizeChange={(page_num: number, page_size: any) => handlePage(page_num, page_size)}
                    total={data.total}
                />
            </Row>

            <Drawer
                maskClosable={false}
                keyboard={false}
                title={outId ? "编辑集群" : "创建集群"}
                width={376}
                onClose={() => setVisible(false)}
                visible={visible}
                bodyStyle={{ paddingBottom: 80 }}
                footer={
                    <div style={{ textAlign: 'right', }}>
                        <Button onClick={() => setVisible(false)} style={{ marginRight: 8 }}>
                            取消
                        </Button>
                        <Button type="primary" onClick={() => onSubmit()} >
                            {outId ? '更新' : '确定'}
                        </Button>
                    </div>
                }
            >
                <Form 
                    layout="vertical" 
                    form={form} 
                    /*hideRequiredMark*/
                >
                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item label="集群名称"
                                name="name"
                                rules={[{ required: true, message: '请输入集群名称' }]}
                                validateStatus={validateResult.error ? 'error' : undefined }
                                help={validateResult.msg === 'cluster existed' ? '集群名称已存在' : validateResult.msg}
                            >
                                <Input autoComplete="off" placeholder="请输入" onChange={(e: any) => setValidateResult({})} />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Owner />
                            {/* <Form.Item
                                name="owner"
                                label="Owner"
                                rules={[{ required: true, message: '请选择' }]}
                            >
                                <Select
                                    allowClear
                                    notFoundContent={fetching ? <Spin size="small" /> : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
                                    filterOption={false}
                                    placeholder="请选择"
                                    onSearch={handleSearch}
                                    style={{ width: '100%' }}
                                    showArrow={false}
                                    showSearch
                                >
                                    {
                                        user.map((item: any) => {
                                            return <Option value={item.id} key={item.id}>{item.last_name}</Option>
                                        })
                                    }
                                </Select>
                            </Form.Item> */}
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                name="tags"
                                label="标签"
                            >
                                <Select
                                    mode="multiple"
                                    allowClear
                                    notFoundContent={fetching ? <Spin size="small" /> : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
                                    filterOption={false}
                                    placeholder="请选择"
                                    onSearch={getServerTagList}
                                    style={{ width: '100%' }}
                                    showArrow={false}
                                    showSearch
                                    tagRender={tagRender}
                                >
                                    {
                                        tagList.map(
                                            (item: any) => (
                                                <Option key={item.id} value={item.id}>
                                                    <Tag color={item.tag_color} key={item.id}>{item.name}</Tag>
                                                </Option>
                                            )
                                        )
                                    }
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                name="description"
                                label="备注"
                            >
                                <Input.TextArea rows={3} placeholder="请输入" />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Drawer>

            {/** 云上集群 - 操作日志 */}
            <Log ref={logDrawer} operation_object={operation} />
            {/** 云上集群 - 添加 */}
            <GroupMachine onRef={aloneMachine} run_mode={'standalone'} ws_id={ws_id} onSuccess={successCallback} />
            <Modal
				title="删除提示"
				centered={true}
				visible={deleteVisible}
				//onOk={remOuter}
				onCancel={() => setDeleteVisible(false)}
				footer={[
					<Button key="submit" onClick={()=>removeGroup(deleteObj.id)}>
						确定删除
					</Button>,
					<Button key="back" type="primary"  onClick={() => setDeleteVisible(false)}>
						取消
					</Button>
				]}
				width={600}
				maskClosable={false}
			>
				<div style={{ color:'red',marginBottom: 5 }}> 
					<ExclamationCircleOutlined style={{ marginRight: 4 	}}/>
					已有模板配置了该集群，删除机器后对应的测试机配置会自动改为随机，请谨慎删除！！
				</div>
				<div style={{ color:'#1890FF',cursor:'pointer' }} onClick={handleDetail}>查看引用详情</div>
			</Modal>
			<Modal
				title="删除提示"
				centered={true}
				visible={deleteDefault}
				onCancel={() => setDeleteDefault(false)}
				footer={[
					<Button key="submit" onClick={()=>removeGroup(deleteObj.id)}>
						确定删除
					</Button>,
					<Button key="back" type="primary"  onClick={() => setDeleteDefault(false)}>
						取消
					</Button>
				]}
				width={300}
			>
				<div style={{ color:'red',marginBottom: 5 }}> 
					<ExclamationCircleOutlined style={{ marginRight: 4, verticalAlign:'middle' 	}}/>
					确定要删除吗？
				</div>
			</Modal>
        </div>
    )
}

export default forwardRef(Aligroup)