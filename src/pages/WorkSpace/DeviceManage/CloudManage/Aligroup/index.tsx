import React, { useState, useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Button, Pagination, Space, Tag, Drawer, Row, Col, Form, Input, message, Table, Modal } from 'antd';
import styles from './style.less';
import { CaretRightFilled, CaretDownFilled, ExclamationCircleOutlined } from '@ant-design/icons';
import { querysCluster, addGroup, editGroup, delGroup } from '../service';
import { queryServerDel } from '../../GroupManage/services'
import GroupTree from './GroupTree';
import GroupMachine from './GroupMachine'
import SearchInput from '@/components/Public/SearchInput';
import SelectUser from '@/components/Public/SelectUser';
import SelectTags from '@/components/Public/SelectTags';
import Highlighter from 'react-highlight-words';
import Owner from '@/components/Owner/index';
import MachineTags from '@/components/MachineTags';
import { FilterFilled } from '@ant-design/icons';
import PopoverEllipsis from '@/components/Public/PopoverEllipsis';
import Log from '@/components/Public/Log';
import { useParams, useIntl, FormattedMessage, getLocale } from 'umi';
import { useClientSize } from '@/utils/hooks';
import { AccessTootip } from '@/utils/utils';
import { Access, useAccess } from 'umi'
import OverflowList from '@/components/TagOverflow/index'
// import PermissionTootip from '@/components/Public/Permission/index';
/**
 * 云上集群
 * 
 */
interface AligroupParams {
    refresh: boolean,
    page: number,
    pageSize: number,
    name: string,
    owner: any,
    tags: any,
    description: string,
}
const Aligroup: React.ForwardRefRenderFunction<any, any> = (props, ref) => {
    const { formatMessage } = useIntl()
    const enLocale = getLocale() === 'en-US'
    const { ws_id }: any = useParams()
    const [form] = Form.useForm();
    const access = useAccess();
    const aloneMachine = useRef<any>(null)
    const tree = useRef<any>(null)
    const outTable = useRef<any>(null)
    const [loading, setLoading] = useState<boolean>(false)
    const [data, setData] = useState<any>({ data: [] });
    const [params, setParams] = useState<AligroupParams>({
        refresh: true,
        page: 1,
        pageSize: 10,
        name: '',
        owner: '',
        tags: '',
        description: ''
    })
    const [ tagFlag, setTagFlag ] = useState({
        list: [],
        isQuery: '',
    })
    const [visible, setVisible] = useState<boolean>(false)
    const [outId, setOutId] = useState<number>()
    const [expandKey, setExpandKey] = useState<string[]>([])
    const top = 39, size = 41;
    const [deleteVisible, setDeleteVisible] = useState(false);
    const [deleteDefault, setDeleteDefault] = useState(false);
    const [deleteObj, setDeleteObj] = useState<any>({});
    const [autoFocus, setFocus] = useState<boolean>(true)
    const [operation, setOperation] = useState<string>('machine_cluster_aliyun')
    const logDrawer: any = useRef()
    const [validateResult, setValidateResult] = useState<any>({});

    const handleOpenLogDrawer = useCallback(
        (id, type) => {
            setOperation(type)
            logDrawer.current.show(id)
        },
        []
    )

    const handlePage = (page_num: number, page_size: any) => {
        setParams({ ...params, page: page_num, pageSize: page_size })
    }

    const getList = async (params: any = {}) => {
        setLoading(true)
        setData({ data: [] })
        const data: any = await querysCluster({ ...params })
        data && setData(data)
        setLoading(false)
    };


    const newGroup = () => {
        setOutId(undefined)
        setTagFlag({ ...tagFlag, isQuery: 'add', list: [] })
        setVisible(true)
        form.resetFields()
    }

    useEffect(() => {
        const { page, pageSize, name, owner, tags, description } = params;
        const obj = {
            ...params,
            cluster_type: 'aliyun',
            page_num: page,
            page_size: pageSize,
            name,
            owner,
            tags,
            description,
            ws_id
        }
        getList(obj)
    }, [params]);

    const { width: windowWidth } = useClientSize()

    const submit = async (param: any) => {
        if (outId) {
            let obj: any = {
                description: param.description || '',
                tags: param.tags,
                emp_id: param.emp_id,
                name: param.name,
                ws_id
            }
            const res = await editGroup(outId, obj) || {}
            if (res.code === 200) {
                // 成功
                setVisible(false)
                message.success(formatMessage({id: 'operation.success'}));
                setParams({ ...params, refresh: !params.refresh })
                return
            }
            // 失败
            setValidateResult({ ...res, error: true })
            return
        }

        let obj = { ...param, ws_id }
        obj.description = param.description || ''
        obj.ws_id = ws_id
        obj.cluster_type = 'aliyun'

        const res = await addGroup({ ...obj })
        if (res.code === 200) {
            // 成功
            setVisible(false)
            message.success(formatMessage({id: 'operation.success'}));
            setParams({ ...params, page: 1, refresh: !params.refresh })
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
        const list = row.tag_list.map((item:any) => item.id)
        setTagFlag({ ...tagFlag, isQuery: 'edit', list })
        row.tags = row.tag_list.map((item: any) => { return item.id })
        setOutId(row.id)
        setVisible(true)
        form.resetFields()
        setTimeout(function () {
            form.setFieldsValue({ ...row })
        }, 1)
    }
    const handleDelServer = async (row: any) => {
        setDeleteObj(row)
        const data = await queryServerDel({ server_id: row.id, run_mode: 'cluster', server_provider: 'aliyun' })
        if (data.data.length > 0) {
            setDeleteVisible(true)
        } else {
            setDeleteDefault(true)
        }
    }
    const removeGroup = async (id: number) => {
        let data = { ws_id: ws_id }
        await delGroup(id, data)
        message.success(formatMessage({id: 'operation.success'}));
        setDeleteVisible(false)
        setDeleteDefault(false)
        setParams({ ...params, refresh: !params.refresh })
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
        // setRefreshColumn(parentId)
        if (parentId && expandKey.indexOf(parentId + '') < 0) {
            const temp = expandKey.concat([parentId + ''])
            setExpandKey(temp)
        }
        tree.current && tree.current.reload('add', { parentRowId: parentId })
    }

    useImperativeHandle(ref, () => ({
        open: newGroup
    }), [])

    const inputFilterCommonFields = (dataIndex: string) => ({
        filterDropdown: ({ confirm }: any) => (
            <SearchInput
                confirm={confirm}
                onConfirm={(val: string) => setParams({ ...params, page: 1, [dataIndex]: val })}
            />
        ),
        onFilterDropdownVisibleChange: (visible: any) => {
            if (visible) {
                setFocus(!autoFocus)
            }
        },
        filterIcon: () => <FilterFilled style={{ color: params[dataIndex] ? '#1890ff' : undefined }} />,
    })

    const columns: any = [
        {
            title: <FormattedMessage id="device.cluster.name"/>,
            dataIndex: 'name',
            width: 150,
            ...inputFilterCommonFields("name"),
            render: (_: any, row: any) => <PopoverEllipsis title={row.name} width={120}>
                <Highlighter
                    highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                    searchWords={[params.name || '']}
                    autoEscape
                    textToHighlight={row.name.toString()}
                />
            </PopoverEllipsis>
        },
        {
            title: 'Owner',
            dataIndex: 'owner_name',
            width: 150,
            filterIcon: () => <FilterFilled style={{ color: params.owner ? '#1890ff' : undefined }} />,
            filterDropdown: ({ confirm }: any) => <SelectUser autoFocus={autoFocus} confirm={confirm} onConfirm={(val: number) => { setParams({ ...params, page: 1, owner: val }) }} />,
            onFilterDropdownVisibleChange: (visible: any) => {
                if (visible) {
                    setFocus(!autoFocus)
                }
            },
            render: (_: any, row: any) => <PopoverEllipsis title={row.owner_name} />
        },
        {
            title: <FormattedMessage id="device.tag"/>,
            dataIndex: 'tag_list',
            ellipsis: {
                showTitle: false
            },
            width: 250,
            filterIcon: () => <FilterFilled style={{ color: params.tags && params.tags.length > 0 ? '#1890ff' : undefined }} />,
            filterDropdown: ({ confirm }: any) =>
                <SelectTags
                    ws_id={ws_id}
                    run_mode={'cluster'}
                    autoFocus={autoFocus}
                    confirm={confirm}
                    onConfirm={(val: number) => { setParams({ ...params, page: 1, tags: val }) }} />,
            render: (_: any, row: any) => (
                <OverflowList list={
                    row.tag_list.map((item: any, index: number) => {
                        return <Tag color={item.tag_color} key={index}>{item.name}</Tag>
                    })
                } />
            )
        },
        {
            title: <FormattedMessage id="device.description"/>,
            dataIndex: 'description',
            width: 300,
            ...inputFilterCommonFields("description"),
            render: (_: any, row: any) => <PopoverEllipsis title={row.description} width={200} >
                <Highlighter
                    highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                    searchWords={[params.description || '']}
                    autoEscape
                    textToHighlight={row.description ? row.description.toString() : '-'}
                />
            </PopoverEllipsis>,
        },
        {
            title: <FormattedMessage id="Table.columns.operation"/>,
            valueType: 'option',
            dataIndex: 'id',
            width: 180,
            render: (_: any, row: any) => <Space>
                <Button type="link" style={{ padding: 0, height: 'auto' }} onClick={() => { addMachine(row.id) }}><FormattedMessage id="operation.add"/></Button>
                <Access
                    accessible={access.WsMemberOperateSelf(row.owner)}
                    fallback={
                        <Space>
                            <Button type="link" style={{ padding: 0, height: 'auto' }} onClick={() => AccessTootip()}><FormattedMessage id="operation.edit"/></Button>
                            <Button type="link" style={{ padding: 0, height: 'auto' }} onClick={() => AccessTootip()}><FormattedMessage id="operation.delete"/></Button>
                        </Space>
                    }
                >
                    <Space>
                        <Button type="link" style={{ padding: 0, height: 'auto' }} onClick={() => modifyGroup(row)}><FormattedMessage id="operation.edit"/></Button>
                        <Button type="link" style={{ padding: 0, height: 'auto' }} onClick={() => handleDelServer({ ...row })}><FormattedMessage id="operation.delete"/></Button>
                    </Space>
                </Access>
                <Button type="link" style={{ padding: 0, height: 'auto' }} onClick={() => handleOpenLogDrawer(row.id, 'machine_cluster_aliyun')}><FormattedMessage id="operation.log"/></Button>
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
                            width={windowWidth - 200 - 68}
                            cluster_id={record.id}
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
                   {formatMessage({id: 'pagination.total.strip'}, {data: data.total || 0 })}
                </div>
                <Pagination
                    className={data.total == 0 ? styles.hidden : ''}
                    showQuickJumper
                    showSizeChanger
                    size="small"
                    current={params.page}
                    defaultCurrent={1}
                    onChange={(page_num: number, page_size: any) => handlePage(page_num, page_size)}
                    onShowSizeChange={(page_num: number, page_size: any) => handlePage(page_num, page_size)}
                    total={data.total}
                />
            </Row>

            <Drawer
                maskClosable={false}
                keyboard={false}
                title={outId ? <FormattedMessage id="device.cluster.edit"/>: <FormattedMessage id="device.cluster.btn"/>}
                width={376}
                onClose={() => setVisible(false)}
                visible={visible}
                bodyStyle={{ paddingBottom: 80 }}
                footer={
                    <div style={{ textAlign: 'right', }}>
                        <Button onClick={() => setVisible(false)} style={{ marginRight: 8 }}>
                            <FormattedMessage id="device.cluster.btn"/>
                        </Button>
                        <Button type="primary" onClick={() => onSubmit()}>
                            {outId ? <FormattedMessage id="operation.update"/>: <FormattedMessage id="operation.ok"/>}
                        </Button>
                    </div>
                }
            >
                <Form
                    layout="vertical"
                    form={form}
                >
                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item label={<FormattedMessage id="device.cluster.name.s"/>}
                                name="name"
                                rules={[{ required: true, message: formatMessage({id: 'device.cluster.name.s.message'}) }]}
                                validateStatus={validateResult.error ? 'error' : undefined}
                                help={validateResult.msg === 'cluster existed' ? formatMessage({id: 'device.cluster.name.s.existed'}) : validateResult.msg}
                            >
                                <Input autoComplete="off" placeholder={formatMessage({id: 'please.enter'})} onChange={(e: any) => setValidateResult({})} />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Owner />
                        </Col>
                        <Col span={24}>
                            <MachineTags {...tagFlag}/>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                name="description"
                                label={<FormattedMessage id="device.description"/>}
                            >
                                <Input.TextArea rows={3} placeholder={formatMessage({id: 'please.enter'})} />
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
                title={<FormattedMessage id="delete.tips"/>}
                centered={true}
                visible={deleteVisible}
                //onOk={remOuter}
                onCancel={() => setDeleteVisible(false)}
                footer={[
                    <Button key="submit" onClick={() => removeGroup(deleteObj.id)}>
                        <FormattedMessage id="operation.confirm.delete"/>
                    </Button>,
                    <Button key="back" type="primary" onClick={() => setDeleteVisible(false)}>
                        <FormattedMessage id="operation.cancel"/>
                    </Button>
                ]}
                width={600}
                maskClosable={false}
            >
                <div style={{ color: 'red', marginBottom: 5 }}>
                    <ExclamationCircleOutlined style={{ marginRight: 4 }} />
                    <FormattedMessage id="device.cluster.delete.tips"/>
                </div>
                <div style={{ color: '#1890FF', cursor: 'pointer' }} onClick={handleDetail}><FormattedMessage id="view.quote.details"/></div>
            </Modal>
            <Modal
                title={<FormattedMessage id="delete.tips"/>}
                centered={true}
                visible={deleteDefault}
                onCancel={() => setDeleteDefault(false)}
                footer={[
                    <Button key="submit" onClick={() => removeGroup(deleteObj.id)}>
                        <FormattedMessage id="operation.confirm.delete"/>
                    </Button>,
                    <Button key="back" type="primary" onClick={() => setDeleteDefault(false)}>
                        <FormattedMessage id="operation.cancel"/>
                    </Button>
                ]}
                width={300}
            >
                <div style={{ color: 'red', marginBottom: 5 }}>
                    <ExclamationCircleOutlined style={{ marginRight: 4, verticalAlign: 'middle' }} />
                    <FormattedMessage id="delete.prompt"/>
                </div>
            </Modal>
        </div>
    )
}

export default forwardRef(Aligroup)