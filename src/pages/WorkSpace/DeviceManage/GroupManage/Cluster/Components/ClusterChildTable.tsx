/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useCallback, useRef } from 'react'
import { useIntl, FormattedMessage, getLocale } from 'umi'
import { Space, message, Popconfirm, Typography } from 'antd'
import { CheckCircleOutlined, CheckCircleFilled } from '@ant-design/icons'
import { updateTestServer, deleteClusterServer, queryClusterServer, updateClusterServer, stateRefresh } from '../../services'
import DeviceDetail from '../../Components/DeviceDetail'
import { StateBadge } from '../../Components'
import ClusterEditServer from './ClusterEditServer'
import OperationLog from '@/components/Public/Log'
import styles from './index.less'
import { requestCodeMessage, AccessTootip } from '@/utils/utils';
import ServerLink from '@/components/MachineWebLink/index';
import treeSvg from '@/assets/svg/tree.svg'
import { Access, useAccess, useParams } from 'umi'
import { ResizeHooksTable } from '@/utils/table.hooks'
import { ColumnEllipsisText } from '@/components/ColumnComponents'

export default (props: any) => {
    const { formatMessage } = useIntl()
    const enLocale = getLocale() === 'en-US'
    const { ws_id } = useParams() as any
    const access = useAccess();
    const [loading, setLoading] = useState(true)
    const [dataSource, setDataSoure] = useState<any>([])
    const [refrush, setRefrush] = useState<any>()
    const [tree, setTree] = useState({ first: 46.6, next: 49 })

    const background = `url(${treeSvg}) no-repeat center center / 100% 100%`
    const firstBackground = `url(${treeSvg}) no-repeat center center / 98% 100%`
    const logDrawer: any = useRef()
    const detailsDrawerRef: any = useRef()

    const editServerRef: any = useRef()

    const handleOpenEditDrawer = useCallback(
        (record: any) => {
            editServerRef.current.show(record)
        }, []
    )

    // 请求页面数据
    const getClusterServer = async () => {
        setLoading(true)
        const { data } = await queryClusterServer(props.id)
        setDataSoure(data)
        setLoading(false)
    }

    const handleRefresh = async (row: any) => {
        const { code, msg } = await stateRefresh({ server_id: row.server_id, server_provider: 'aligroup' })
        if (code === 200) {
            message.success(formatMessage({ id: 'device.synchronization.state.success' }))
            setRefrush(new Date().getTime())
        }
        else requestCodeMessage(code, msg)
    }

    const handleOpenLogDrawer = useCallback(
        (id) => {
            logDrawer.current.show(id)
        }, []
    )

    const defaultFetchOption = (ret: any) => {
        if (ret.code === 200) {
            setRefrush(new Date().getTime())
            message.success(formatMessage({ id: 'operation.success' }))
        }
        else requestCodeMessage(ret.code, ret.msg)
    }

    const handleUpdateServer = useCallback(
        async (id: number) => {
            props.onSyncServer(true)
            const data = await updateTestServer(id)
            defaultFetchOption(data)
            props.onSyncServer(false)
        }, []
    )

    // 删除
    const handleDeleteServer = async (id: number) => {
        const data = await deleteClusterServer(id, { ws_id })
        defaultFetchOption(data)
    }

    const handleEditOk = useCallback(
        async () => {
            getClusterServer()
        }, []
    )

    useEffect(() => {
        if (props.size === 'middle')
            setTree({ first: 46.6, next: 49 })
        else if (props.size === 'small')
            setTree({ first: 39, next: 41 })
        else if (props.size === 'large')
            setTree({ first: 54.6, next: 57 })
    }, [props.size])

    // 切换
    const handleSetDefault = async (row: any, fieldName: string) => {
        const { test_server, ...rest } = row
        const baseParams = { ...rest, ...test_server }
        const query = fieldName === 'role' ? { ...baseParams, role: 'local' } : { ...baseParams, baseline_server: 1 }
        const res = await updateClusterServer(row.id, query);
        if (res.code === 200) {
            message.success(formatMessage({ id: 'operation.success' }));
            getClusterServer()
        } else {
            requestCodeMessage(res.code, res.msg)
        }
    }

    const columns: any = [
        {
            title: 'IP',
            width: 170,
            fixed: 'left',//TreeIcon
            key: "ip",
            render: (record: any) => (
                <ServerLink
                    exists
                    provider={"aligroup"}
                    val={record.test_server.ip}
                />
            )
        },
        {
            title: 'SN',
            width: 150,
            ellipsis: {
                showTitle: false
            },
            key: "sn",
            render: (record: any) => (
                <ServerLink
                    exists
                    provider={"aligroup"}
                    val={record.test_server.sn}
                />
            )
        },
        BUILD_APP_ENV &&
        {
            title: 'TSN',
            width: 150,
            ellipsis: {
                showTitle: false
            },
            key: 'tsn',
            render: (record: any) => <ColumnEllipsisText ellipsis={{ tooltip: true }} >{record.test_server.tsn}</ColumnEllipsisText>
        },
        !BUILD_APP_ENV &&
        {
            title: <FormattedMessage id="device.machine.name" />,
            width: 150,
            ellipsis: {
                showTitle: false
            },
            key: "machine",
            render: (record: any) => (
                <ColumnEllipsisText ellipsis={{ tooltip: true }} >
                    {<Typography.Link>{record.test_server.name}</Typography.Link>}
                </ColumnEllipsisText>
            )
        },
        {
            title: <FormattedMessage id="device.private_ip.s" />,
            width: 160,
            key: "private_ip",
            render: (record: any) => record.test_server.private_ip || '-'
        },
        !BUILD_APP_ENV &&
        {
            width: 100,
            title: <FormattedMessage id="device.console_conf" />,
            key: "console_conf",
            render: (record: any) => record.test_server.console_conf || '-'
        },
        {
            title: <FormattedMessage id="device.channel_type" />,
            width: 100,
            key: 'channel_type',
            render: (_: any, record: any) => (record.test_server.channel_type || '-')
        },
        {
            title: <FormattedMessage id="device.local.server" />,
            dataIndex: 'role',
            width: 120,
            align: 'center',
            render: (text: number, row: any) => (
                row.role === "local" ?
                    <CheckCircleFilled style={{ width: 17.5, height: 17.5, color: '#1890ff' }} />
                    : <CheckCircleOutlined
                        onClick={() => handleSetDefault(row, 'role')}
                        style={{ cursor: 'pointer', width: 17.5, height: 17.5, color: 'rgba(0,0,0,.1)' }}
                    />
            )
        },
        {
            title: <FormattedMessage id="device.baseline_server" />,
            dataIndex: 'baseline_server',
            width: enLocale ? 150 : 120,
            align: 'center',
            render: (text: number, row: any) => {
                return (
                    text ?
                        <CheckCircleFilled style={{ width: 17.5, height: 17.5, color: '#1890ff' }} /> :
                        <CheckCircleOutlined
                            onClick={() => handleSetDefault(row, 'baseline_server')}
                            style={{ cursor: 'pointer', width: 17.5, height: 17.5, color: 'rgba(0,0,0,.1)' }}
                        />
                )
            }
        },
        {
            title: <FormattedMessage id="device.kernel_install" />,
            dataIndex: 'kernel_install',
            width: 130,
            render: (record: any) => (record ? <FormattedMessage id="operation.yes" /> : <FormattedMessage id="operation.no" />)
        },
        {
            title: <FormattedMessage id="device.var_name" />,
            dataIndex: 'var_name',
            width: enLocale ? 160 : 120,
            render: (record: any) => (record || '-')
        },
        {
            title: <FormattedMessage id="device.usage.state" />,
            width: 120,
            key: "state",
            render: (record: any) => StateBadge(record.test_server.state, record.test_server, ws_id)
        },
        {
            title: <FormattedMessage id="device.real_state" />,
            width: 160,
            key: "real_state",
            render: (record: any) => StateBadge(record.test_server.real_state, record.test_server, ws_id)
        },
        {
            title: <FormattedMessage id="Table.columns.operation" />,
            fixed: 'right',
            width: enLocale ? 260 : 230,
            align: 'center',
            key: "operation",
            render: (_: any, row: any) => (
                <Space>
                    <Typography.Link onClick={() => detailsDrawerRef.current.show(_.test_server.id)}>
                        <FormattedMessage id="operation.detail" />
                    </Typography.Link>
                    <Access
                        accessible={access.WsMemberOperateSelf(row.test_server.owner)}
                        fallback={
                            <Space onClick={() => AccessTootip()}>
                                {
                                    BUILD_APP_ENV &&
                                    <Typography.Link >
                                        <FormattedMessage id="device.synchronization.state" />
                                    </Typography.Link>
                                }
                                <Typography.Link >
                                    <FormattedMessage id="operation.edit" />
                                </Typography.Link>
                                <Typography.Link >
                                    <FormattedMessage id="operation.delete" />
                                </Typography.Link>
                                {
                                    !BUILD_APP_ENV &&
                                    <Typography.Link >
                                        <FormattedMessage id="device.synchronization" />
                                    </Typography.Link>
                                }
                            </Space>
                        }
                    >
                        <Space>
                            {
                                BUILD_APP_ENV &&
                                <Typography.Link onClick={() => handleRefresh(_)}>
                                    <FormattedMessage id="device.synchronization.state" />
                                </Typography.Link>
                            }
                            <Typography.Link onClick={() => handleOpenEditDrawer(_)}>
                                <FormattedMessage id="operation.edit" /></Typography.Link>
                            <Popconfirm
                                title={formatMessage({ id: "delete.prompt", }, { data: row.test_server.ip })}
                                okText={<FormattedMessage id="operation.ok" />}
                                cancelText={<FormattedMessage id="operation.cancel" />}
                                onConfirm={() => handleDeleteServer(_.id)}
                            >
                                <Typography.Link >
                                    <FormattedMessage id="operation.delete" />
                                </Typography.Link>
                            </Popconfirm>
                            {
                                !BUILD_APP_ENV &&
                                <Typography.Link onClick={() => handleUpdateServer(_.id)}>
                                    <FormattedMessage id="operation.synchronize" />
                                </Typography.Link>
                            }
                        </Space>
                    </Access>
                    {/* 删掉打开log的disabled */}
                    <Typography.Link onClick={() => handleOpenLogDrawer(_.id)}>
                        <FormattedMessage id="operation.log" />
                    </Typography.Link>
                </Space>
            )
        }
    ]

    // 刷新页面
    useEffect(() => {
        getClusterServer()
    }, [refrush])

    useEffect(() => {
        if (props.refreshChild === props.id) {
            getClusterServer()
            setTimeout(() => props.resetRefresh(null), 300)
        }
    }, [props.refreshChild])

    return (
        <>
            <div style={{ width: '100%', display: 'flex' }}>
                <div style={{ width: 47, background: '#fff' }}>
                    <div style={{ height: tree.first, background: firstBackground }} />
                    {
                        dataSource.length > 0 &&
                        dataSource.map(
                            (item: any, index: any) => (
                                <div
                                    // eslint-disable-next-line react/no-array-index-key
                                    key={index}
                                    style={{ height: tree.next, background }}
                                />
                            )
                        )
                    }
                </div>
                <div
                    style={{ width: "calc(100% - 47px)" }}
                >
                    <ResizeHooksTable
                        rowKey="id"
                        columns={columns}
                        name="ws-server-group-cluster-child"
                        refreshDeps={[access, ws_id, enLocale]}
                        loading={loading}
                        dataSource={dataSource}
                        size="small"
                        pagination={false}
                        rowClassName={() => styles.row_class}
                    />
                </div>
            </div>
            <OperationLog ref={logDrawer} operation_object="machine_cluster_aligroup_server" />
            <DeviceDetail ref={detailsDrawerRef} />
            <ClusterEditServer handleOk={handleEditOk} ref={editServerRef} />
        </>
    )
}