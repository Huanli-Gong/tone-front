/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import React, { useState, useEffect, useRef, useCallback, forwardRef } from 'react';
import { Button, Space, Tag, Row, Form, message, Table, Modal, Tabs } from 'antd';
import styles from './style.less';
import { CaretRightFilled, CaretDownFilled, ExclamationCircleOutlined } from '@ant-design/icons';
import { querysCluster, delGroup } from '../service';
import { queryServerDel } from '../../GroupManage/services'
import GroupTree from './GroupTree';
import GroupMachine from '../AddMachinePubilc/index'
import SearchInput from '@/components/Public/SearchInput';
import SelectUser from '@/components/Public/SelectUser';
import SelectTags from '@/components/Public/SelectTags';
import Highlighter from 'react-highlight-words';
import AddCluster from './AddGroup'
import { FilterFilled } from '@ant-design/icons';
import { useParams, useIntl, FormattedMessage, useLocation, history, getLocale } from 'umi';
import { useClientSize } from '@/utils/hooks';
import { AccessTootip, handlePageNum, requestCodeMessage, saveRefenerceData, useStateRef } from '@/utils/utils';
import { Access, useAccess } from 'umi'
import SelectRadio from '@/components/Public/SelectRadio';
import Log from '@/components/Public/Log';
import OverflowList from '@/components/TagOverflow/index';
import CommonPagination from '@/components/CommonPagination';
import { ColumnEllipsisText } from '@/components/ColumnComponents';
import { v4 as uuid } from 'uuid';
import DelConfirmModal from '../../components/DelConfirmModal';
import { stringify } from 'querystring';

/**
 * 云上集群
 * 
 */
interface AligroupParams {
    refresh?: boolean,
    page_num?: number,
    page_size?: number,
    name?: string,
    is_temporary?: boolean,
    owner?: any,
    tags?: any,
    description?: string,
    is_instance?: number,
}

const Aligroup: React.ForwardRefRenderFunction<any, any> = (props) => {
    const { tab } = props
    const { query } = useLocation() as any
    const { formatMessage } = useIntl()
    const enLocale = getLocale() === 'en-US'
    const { ws_id }: any = useParams()
    const [form] = Form.useForm();
    const access = useAccess();
    const aloneMachine = useRef<any>(null)
    const tree = useRef<any>(null)
    const outTable = useRef<any>(null)
    const [isInstance, setIsInstance] = useState<number>(Object.prototype.toString.call(query?.is_instance) === "[object String]" ? + query?.is_instance : 0)
    const [loading, setLoading] = useState<boolean>(false)
    const [source, setSource] = useState<any>({});
    const DEFAULT_PARAM = {
        t: tab,
        refresh: true,
        page_num: 1,
        page_size: 10,
        name: '',
        owner: '',
        tags: '',
        description: '',
        cluster_type: 'aliyun',
        ws_id
    }
    const [params, setParams] = useState<AligroupParams>({ ...DEFAULT_PARAM, ...query })
    const [tagFlag, setTagFlag] = useState({ list: [], isQuery: '' })
    const [outParam, setOutParam] = useState<any>({})
    const [expandKey, setExpandKey] = useState<string[]>([])
    const top = 39, size = 41;
    const [deleteVisible, setDeleteVisible] = useState(false);
    const [deleteObj, setDeleteObj] = useState<any>({});
    const [autoFocus, setFocus] = useState<boolean>(true)
    const logDrawer: any = useRef()
    const delConfirm: any = useRef()

    const pageCurrent = useStateRef(params)
    const handleOpenLogDrawer = useCallback((id) => {
        logDrawer.current.show(id)
    }, [])

    const getList = async ($params: any = {}) => {
        setLoading(true)
        const data: any = await querysCluster({ ...$params })
        if (data.code === 200) {
            history.replace(`/ws/${ws_id}/device/cloud?${stringify({ ...$params, is_instance: $params.is_instance ? 1 : 0 })}`)
            console.log('data:', data)
            data && setSource(data)
        }
        setLoading(false)
    };
    const totalCurrent = useStateRef(source)
    const newGroup = () => {
        setOutParam({})
        setTagFlag({ ...tagFlag, isQuery: 'add', list: [] })
        form.resetFields()
    }

    useEffect(() => {
        getList({ ...params, is_instance: + isInstance })
    }, [params, isInstance]);

    const { width: windowWidth } = useClientSize()

    const modifyGroup = (row: any) => {
        const list = row.tag_list.map((item: any) => item.id)
        setTagFlag({ ...tagFlag, isQuery: 'edit', list })
        setOutParam({ ...row })
    }

    const handleDelServer = async (row: any) => {
        setDeleteObj(row)
        const data = await queryServerDel({ server_id: row.id, run_mode: 'cluster', server_provider: 'aliyun' })
        if (data.data.length > 0) {
            setDeleteVisible(true)
        } else {
            delConfirm.current?.show(row, `(${row.name})`)
        }
    }

    const removeGroup = async (id: number) => {
        const $data = { ws_id }
        const { page_size } = pageCurrent.current
        const { code, msg } = await delGroup(id, $data)
        if (code === 200) {
            message.success(formatMessage({ id: 'operation.success' }));
            setDeleteVisible(false)
            setParams({ ...params, page_num: handlePageNum(pageCurrent, totalCurrent), page_size })
        } else {
            requestCodeMessage(code, msg)
        }
    }

    const handleExpand = async (_: boolean, record: any) => {
        const currentId = record.id + ''
        const expandKeyList = _ ? expandKey.concat([currentId]) : expandKey.filter((item) => item !== currentId)
        setExpandKey(expandKeyList)
    }

    // 添加
    const addMachine = (id: number) => {
        aloneMachine.current?.newMachine(id)
    }
    
    const handleDetail = async () => {
        const pk = await saveRefenerceData({ name: deleteObj.name, id: deleteObj.id })
        if (pk)
            window.open(`/ws/${ws_id}/refenerce/7/?pk=${pk}`)
        // window.open(`/ws/${ws_id}/refenerce/7/?name=${deleteObj.name}&id=${deleteObj.id}`)
    }
    // 添加成功回调
    const successCallback = (info: any) => {
        const { parentId } = info
        console.log(info)
        // setRefreshColumn(parentId)
        if (parentId && expandKey.indexOf(parentId + '') < 0) {
            const temp = expandKey.concat([parentId + ''])
            setExpandKey(temp)
        }
        tree.current && tree.current.reload('add', { parentRowId: parentId })
    }

    const inputFilterCommonFields = (dataIndex: string) => ({
        filterDropdown: ({ confirm }: any) => (
            <SearchInput
                confirm={confirm}
                onConfirm={(val: string) => setParams({ ...params, page_num: 1, [dataIndex]: val })}
            />
        ),
        onFilterDropdownVisibleChange: (visible: any) => {
            if (visible) {
                setFocus(!autoFocus)
            }
        },
        filterIcon: () => <FilterFilled style={{ color: (params as any)[dataIndex] ? '#1890ff' : undefined }} />,
    })

    const radioFilterCommonFields = (dataIndex: string, list: any[]) => ({
        filterIcon: () => <FilterFilled style={{ color: params.hasOwnProperty(dataIndex) ? '#1890ff' : undefined }} />,
        filterDropdown: ({ confirm }: any) => (
            <SelectRadio
                list={list}
                value={params[dataIndex]}
                confirm={confirm}
                onConfirm={(val: any) => setParams({ ...params, [dataIndex]: val, page_num: 1 })}
            />
        ),
    })

    const columns: any = [
        {
            title: <FormattedMessage id="device.cluster.name" />,
            dataIndex: 'name',
            width: 150,
            ...inputFilterCommonFields("name"),
            render: (_: any, row: any) => (
                <ColumnEllipsisText ellipsis={{ tooltip: row.name }} >
                    <Highlighter
                        highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                        searchWords={[params.name || '']}
                        autoEscape
                        textToHighlight={row.name.toString()}
                    />
                </ColumnEllipsisText>
            )
        },
        {
            title: <FormattedMessage id="device.cluster/temporary.cluster" />,
            ...radioFilterCommonFields("is_temporary", [
                { id: false, name: formatMessage({ id: 'cluster' }) },
                { id: true, name: formatMessage({ id: 'device.temporary.cluster' }) },
            ]),
            dataIndex: 'is_temporary',
            width: enLocale ? 170 : 150,
            ellipsis: {
                showTitle: false
            },
            render: (_: any, row: any) => {
                const text = _ ? formatMessage({ id: 'device.temporary.cluster' }): formatMessage({ id: 'cluster' })
                return <span>{row.hasOwnProperty('is_temporary') ? text: '-'}</span>
            }
        },
        {
            title: 'Owner',
            dataIndex: 'owner_name',
            width: 150,
            filterIcon: () => <FilterFilled style={{ color: params.owner ? '#1890ff' : undefined }} />,
            filterDropdown: ({ confirm }: any) => <SelectUser autoFocus={autoFocus} confirm={confirm} onConfirm={(val: number) => { setParams({ ...params, page_num: 1, owner: val }) }} />,
            onFilterDropdownVisibleChange: (visible: any) => {
                if (visible) {
                    setFocus(!autoFocus)
                }
            },
            render: (_: any, row: any) => <ColumnEllipsisText ellipsis={{ tooltip: true }} >{row.owner_name}</ColumnEllipsisText>
        },
        {
            title: <FormattedMessage id="device.tag" />,
            dataIndex: 'tag_list',
            ellipsis: {
                showTitle: false
            },
            width: 240,
            filterIcon: () => <FilterFilled style={{ color: params.tags && params.tags.length > 0 ? '#1890ff' : undefined }} />,
            filterDropdown: ({ confirm }: any) => (
                <SelectTags
                    ws_id={ws_id}
                    run_mode={'cluster'}
                    autoFocus={autoFocus}
                    confirm={confirm}
                    onConfirm={(val: number) => { setParams({ ...params, page_num: 1, tags: val }) }}
                />
            ),
            render: (_: any, row: any) => (
                <OverflowList list={
                    row.tag_list.map((item: any) => {
                        return <Tag color={item.tag_color} key={uuid()}>{item.name}</Tag>
                    })
                } />
            )
        },
        {
            title: <FormattedMessage id="device.description" />,
            dataIndex: 'description',
            width: 300,
            ...inputFilterCommonFields("description"),
            render: (_: any, row: any) => (
                <ColumnEllipsisText ellipsis={{ tooltip: row.description }} >
                    <Highlighter
                        highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                        searchWords={[params.description || '']}
                        autoEscape
                        textToHighlight={row.description ? row.description.toString() : '-'}
                    />
                </ColumnEllipsisText>
            ),
        },
        {
            title: <FormattedMessage id="Table.columns.operation" />,
            valueType: 'option',
            dataIndex: 'id',
            width: 180,
            render: (_: any, row: any) => <Space>
                <Button type="link" style={{ padding: 0, height: 'auto' }} onClick={() => { addMachine(row.id) }}><FormattedMessage id="operation.add" /></Button>
                <Access
                    accessible={access.WsMemberOperateSelf(row.owner)}
                    fallback={
                        <Space>
                            <Button type="link" style={{ padding: 0, height: 'auto' }} onClick={() => AccessTootip()}><FormattedMessage id="operation.edit" /></Button>
                            <Button type="link" style={{ padding: 0, height: 'auto' }} onClick={() => AccessTootip()}><FormattedMessage id="operation.delete" /></Button>
                        </Space>
                    }
                >
                    <Space>
                        <Button type="link" style={{ padding: 0, height: 'auto' }} onClick={() => modifyGroup(row)}><FormattedMessage id="operation.edit" /></Button>
                        <Button type="link" style={{ padding: 0, height: 'auto' }} onClick={() => handleDelServer(row)}><FormattedMessage id="operation.delete" /></Button>
                    </Space>
                </Access>
                <Button type="link" style={{ padding: 0, height: 'auto' }} onClick={() => handleOpenLogDrawer(row.id)}><FormattedMessage id="operation.log" /></Button>
            </Space>,
        },
    ];

    const tabRadioChange = (val: any) => {
        setIsInstance(val)
        setParams(DEFAULT_PARAM)
        history.replace(`/ws/${ws_id}/device/cloud?${stringify({ ...query, isInstance: val })}`)
    }

    const $insdance = + isInstance

    return (
        <div className={styles.warp}>
            <Tabs
                type="card"
                onTabClick={tabRadioChange}
                activeKey={isInstance + ""}
                tabBarExtraContent={
                    <Button type="primary" onClick={newGroup}>
                        {!$insdance
                            ? <FormattedMessage id="device.add.cluster.config" />
                            : <FormattedMessage id="device.add.cluster.instance" />}
                    </Button>
                }
            >
                <Tabs.TabPane tab={<FormattedMessage id="device.cluster.config" />} key={0} />
                <Tabs.TabPane tab={<FormattedMessage id="device.cluster.instance" />} key={1} />
            </Tabs>
            <Table
                size={'small'}
                loading={loading}
                columns={columns}
                dataSource={source.data}
                rowKey={record => record.id + ''}
                pagination={false}
                expandable={{
                    expandedRowRender: (record) => (
                        <GroupTree
                            onRef={tree}
                            size={size}
                            top={top}
                            is_instance={$insdance}
                            width={windowWidth - 200 - 68}
                            cluster_id={record.id}
                        />
                    ),
                    onExpand: (_, record) => {
                        handleExpand(_, record)
                    },
                    expandedRowKeys: expandKey,
                    expandIcon: ({ expanded, onExpand, record }) =>
                        expanded ? (<CaretDownFilled onClick={e => onExpand(record, e)} />) :
                            (<CaretRightFilled onClick={e => onExpand(record, e)} />)
                }}
            />

            <Row justify="space-between" style={{ padding: '16px 20px 0' }} ref={outTable}>
                <CommonPagination
                    total={source.total}
                    pageSize={params?.page_size as any}
                    currentPage={params?.page_num as any}
                    onPageChange={
                        (page_num: any, page_size: any) => {
                            setParams({ ...params, page_num, page_size })
                        }
                    }
                />
            </Row>
            {/* 添加集群配置 集群实例 */}
            <AddCluster outParam={outParam} tagFlag={tagFlag} is_instance={$insdance} params={params} setParams={setParams} />
            {/** 云上集群 - 操作日志 */}
            <Log ref={logDrawer} operation_object={'machine_cluster_aliyun'} />
            {/** 云上集群 - 添加 */}
            <GroupMachine onRef={aloneMachine} is_instance={$insdance} onSuccess={successCallback} type='cluster' />
            <Modal
                title={<FormattedMessage id="delete.tips" />}
                centered={true}
                open={deleteVisible}
                //onOk={remOuter}
                onCancel={() => setDeleteVisible(false)}
                footer={[
                    <Button key="submit" onClick={() => removeGroup(deleteObj.id)}>
                        <FormattedMessage id="operation.confirm.delete" />
                    </Button>,
                    <Button key="back" type="primary" onClick={() => setDeleteVisible(false)}>
                        <FormattedMessage id="operation.cancel" />
                    </Button>
                ]}
                width={600}
                maskClosable={false}
            >
                <div style={{ color: 'red', marginBottom: 5 }}>
                    <ExclamationCircleOutlined style={{ marginRight: 4 }} />
                    <FormattedMessage id="device.cluster.delete.tips" />
                </div>
                <div style={{ color: '#1890FF', cursor: 'pointer' }} onClick={handleDetail}><FormattedMessage id="view.quote.details" /></div>
            </Modal>
            <DelConfirmModal
                ref={delConfirm}
                onOk={({ id }: any) => removeGroup(id)}
            />
        </div>
    )
}

export default forwardRef(Aligroup)