import { useState, useCallback, useRef, forwardRef, useImperativeHandle } from 'react'
import styles from './index.less'
import { useIntl, FormattedMessage, useParams } from 'umi'
import { Layout, Button, Space, Tag, message, Typography, Spin, Modal, Table } from 'antd'
import { deleteServerGroup, queryServerDel } from '../services'
import { CaretRightFilled, FilterFilled, ExclamationCircleOutlined } from '@ant-design/icons'
import { MembersFilter } from './Components/FilterDropdowns'
import CreateGroupServer from './Components/CreateGroupServer'
import AddClusterServer from './Components/addClusterServer'
import ClusterChildTable from './Components/ClusterChildTable'
import OperationLog from '@/components/Public/Log'
import SearchInput from '@/components/Public/SearchInput';
import SelectTags from '@/components/Public/SelectTags';
import CommonPagination from '@/components/CommonPagination'
import { usePageInit } from './hooks'
import { requestCodeMessage, AccessTootip, saveRefenerceData } from '@/utils/utils';
import { Access, useAccess } from 'umi';
import OverflowList from '@/components/TagOverflow/index'
import { ColumnEllipsisText } from '@/components/ColumnComponents'
import { v4 as uuid } from 'uuid'

import DelConfirmModal from "@/pages/WorkSpace/DeviceManage/components/DelConfirmModal"

/**
 * 内网集群
 */
const Cluster = (props: any, ref: any) => {
    const { formatMessage } = useIntl()
    const { ws_id } = useParams() as any
    const access = useAccess();
    const { loading, dataSource, params, setParams, setRefresh } = usePageInit()
    // 刷新子表格的标记
    const [syncServerLoading, setSyncServerLoading] = useState(false)

    const [refreshChild, setRefreshChild] = useState(null)

    const [deleteVisible, setDeleteVisible] = useState(false);
    const [deleteObj, setDeleteObj] = useState<any>({});
    const logDrawer: any = useRef()
    const createClusterRef: any = useRef(null)
    const addClusterServerRef: any = useRef(null)
    const delConfirm: any = useRef(null)

    useImperativeHandle(ref, () => ({
        open: createClusterRef.current.show
    }))

    const handleDelServer = async (row: any) => {
        setDeleteObj(row)
        const data = await queryServerDel({ server_id: row.id, run_mode: 'cluster', server_provider: 'aligroup' })
        if (data.data.length > 0) {
            setDeleteVisible(true)
        } else {
            delConfirm.current.show(row, `(${row.name})`)
        }
    }

    const defaultOption = (data: any) => {
        if (data.code === 200) {
            setRefresh(new Date().getTime())
            message.success(formatMessage({ id: 'operation.success' }))
            setDeleteVisible(false)
        }
        else
            requestCodeMessage(data.code, data.msg)
    }

    const handleOpenAddDrawer = (record: any) => {
        addClusterServerRef.current.show(record)
    }

    //编辑集群
    const handleUpdateServer = useCallback((record: any) => {
        createClusterRef.current.show(record)
    }, [])

    // 删除
    const handleDeleteServer = async (id: number) => {
        const data = await deleteServerGroup(id)
        defaultOption(data)
    }
    const handleDetail = async () => {
        const pk = await saveRefenerceData({ name: deleteObj.name, id: deleteObj.id })
        if (pk)
            window.open(`/ws/${ws_id}/refenerce/5/?pk=${pk}`)
        // window.open(`/ws/${ws_id}/refenerce/5/?name=${deleteObj.name}&id=${deleteObj.id}`)
    }
    const handleAddClusterServerFinish = (id: any) => {
        setRefreshChild(id)
    }

    const handleOpenLogDrawer = useCallback(
        (id) => {
            logDrawer.current.show(id)
        }, []
    )

    const handleSyncServer = useCallback(
        (key) => {
            setSyncServerLoading(key)
        }, []
    )

    const columns: any = [
        {
            title: <FormattedMessage id="device.cluster.name" />,
            dataIndex: 'name',
            render: (record: any) => (<Typography.Text ellipsis={{ tooltip: true }}>{record}</Typography.Text>),
            filterIcon: () => <FilterFilled style={{ color: params?.name ? '#1890ff' : undefined }} />,
            filterDropdown: ({ confirm }: any) => (
                <SearchInput confirm={confirm} onConfirm={(name: string) => setParams({ ...params, page_num: 1, name })} />
            )
        },
        {
            title: 'Owner',
            width: 150,
            dataIndex: 'owner_name',
            filterIcon: () => <FilterFilled style={{ color: params?.owner ? '#1890ff' : undefined }} />,
            filterDropdown: ({ confirm }: any) => (
                <MembersFilter confirm={confirm} onOk={(owner: any) => setParams({ ...params, page_num: 1, owner })} />
            )
        },
        {
            title: <FormattedMessage id="device.tag" />,
            dataIndex: 'tag_list',
            width: 240,
            render: (record: any) => (
                <OverflowList
                    list={
                        record.map((item: any) => {
                            return <Tag color={item.tag_color} key={uuid()}>{item.name}</Tag>
                        })
                    }
                />
            ),
            filterIcon: () => <FilterFilled style={{ color: params?.tags ? '#1890ff' : undefined }} />,
            filterDropdown: ({ confirm }: any) => (
                <SelectTags
                    ws_id={ws_id}
                    confirm={confirm}
                    onConfirm={(tags: any) => { setParams({ ...params, page_num: 1, tags }) }}
                />
            )
        },
        {
            title: <FormattedMessage id="device.description" />,
            width: 300,
            dataIndex: 'description',
            filterIcon: () => <FilterFilled style={{ color: params?.description ? '#1890ff' : undefined }} />,
            filterDropdown: ({ confirm }: any) => (
                <SearchInput confirm={confirm} onConfirm={(description: string) => setParams({ ...params, page_num: 1, description })} />
            ),
            render(_: any) {
                return <ColumnEllipsisText ellipsis={{ tooltip: true }} >{_}</ColumnEllipsisText>
            }
        },
        {
            title: <FormattedMessage id="Table.columns.operation" />,
            width: 190,
            render: (record: any, row: any) => (
                <Space>
                    <Button type="link" style={{ padding: 0 }} onClick={() => handleOpenAddDrawer(record)}><FormattedMessage id="operation.add" /></Button>
                    <Access
                        accessible={access.WsMemberOperateSelf(row.owner)}
                        fallback={
                            <Space>
                                <Button type="link" style={{ padding: 0 }} onClick={() => AccessTootip()}><FormattedMessage id="operation.edit" /></Button>
                                <Button type="link" style={{ padding: 0 }} onClick={() => AccessTootip()}><FormattedMessage id="operation.delete" /></Button>
                            </Space>
                        }
                    >
                        <Space>
                            <Button type="link" style={{ padding: 0 }} onClick={() => handleUpdateServer(record)}><FormattedMessage id="operation.edit" /></Button>
                            <Button type="link" style={{ padding: 0 }} onClick={() => handleDelServer({ ...row })}><FormattedMessage id="operation.delete" /></Button>
                        </Space>
                    </Access>
                    <Button type="link" style={{ padding: 0 }} onClick={() => handleOpenLogDrawer(record.id)}><FormattedMessage id="operation.log" /></Button>
                </Space>
            )
        }
    ]

    return (
        <Layout.Content className={styles.table}>
            <Spin spinning={syncServerLoading} tip={formatMessage({ id: 'device.Synchronizing' })}>
                <Table
                    style={{ width: '100%' }}
                    loading={loading}
                    rowKey="id"
                    columns={columns}
                    dataSource={dataSource?.data || []}
                    pagination={false}
                    scroll={{ y: innerHeight - 50 - 66 - 30 - 20 }}
                    size="small"
                    className={styles.pro_table_card}
                    expandable={{
                        expandedRowRender: (record: any) => (
                            <ClusterChildTable
                                key={record.id}
                                refreshChild={refreshChild}
                                {...record}
                                resetRefresh={setRefreshChild}
                                size={'small'}
                                onSyncServer={handleSyncServer}
                            />
                        ),
                        expandIcon: ({ expanded, onExpand, record }: any) => (
                            <CaretRightFilled
                                rotate={expanded ? 90 : 0}
                                style={{ cursor: 'pointer' }}
                                onClick={(e: any) => onExpand(record, e)}
                            />
                        ),
                    }}
                />
                <CommonPagination
                    pageSize={dataSource?.page_size}
                    currentPage={dataSource?.page_num}
                    total={dataSource?.total}
                    onPageChange={(page_num: number, page_size: number = 10) => {
                        setParams({ ...params, page_num, page_size })
                    }}
                />
            </Spin>
            <OperationLog ref={logDrawer} operation_object="machine_cluster_aligroup" />
            <CreateGroupServer
                run_environment="aligroup"
                run_mode="cluster"
                ref={createClusterRef}
                onFinish={() => {
                    setRefresh(new Date().getTime())
                }}
            />
            <AddClusterServer
                onFinish={handleAddClusterServerFinish}
                run_environment="aligroup"
                run_mode="cluster"
                ref={addClusterServerRef}
            />
            <Modal
                title={<FormattedMessage id="delete.tips" />}
                centered={true}
                open={deleteVisible}
                onCancel={() => setDeleteVisible(false)}
                footer={[
                    <Button key="submit" onClick={() => handleDeleteServer(deleteObj.id)}>
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
                <div style={{ color: '#1890FF', cursor: 'pointer' }} onClick={handleDetail}>
                    <FormattedMessage id="view.quote.details" />
                </div>
            </Modal>
            <DelConfirmModal
                ref={delConfirm}
                onOk={({ id }: any) => handleDeleteServer(id)}
            />
        </Layout.Content>
    )
}



export default forwardRef(Cluster)