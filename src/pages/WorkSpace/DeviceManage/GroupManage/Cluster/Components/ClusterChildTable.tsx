import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useIntl, FormattedMessage, getLocale } from 'umi'
import { Space, Button, message, Typography, Popconfirm, Tooltip } from 'antd'
import { CheckCircleOutlined, CheckCircleFilled } from '@ant-design/icons'
import { updateTestServer, deleteClusterServer, queryClusterServer, editGroupMachine, stateRefresh } from '../../services'
import DeviceDetail from '../../Components/DeviceDetail'
import { StateBadge } from '../../Components'
import ClusterEditServer from './ClusterEditServer'
import OperationLog from '@/components/Public/Log'
import styles from './index.less'
import EllipsisPulic from '@/components/Public/EllipsisPulic';
import PermissionTootip from '@/components/Public/Permission/index';
import ResizeTable from '@/components/ResizeTable'
import { requestCodeMessage, AccessTootip } from '@/utils/utils';
import ServerLink from '@/components/MachineWebLink/index';
import treeSvg from '@/assets/svg/tree.svg'
import { Access, useAccess, useParams } from 'umi'
// const treeSvg = require('@/assets/svg/tree.svg')

export default (props: any) => {
    const { formatMessage } = useIntl()
    const enLocale = getLocale() === 'en-US'
    const { ws_id } = useParams() as any
    const access = useAccess();
    const [loading, setLoading] = useState(true)
    const [dataSource, setDataSoure] = useState<any>([])
    const [refrush, setRefrush] = useState(false)
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

    const handleRefresh = async (row: any) => {
        const { code, msg } = await stateRefresh({ server_id: row.server_id, server_provider: 'aligroup' })
        if (code === 200) {
            message.success(formatMessage({id: 'device.synchronization.state.success'}) )
            setRefrush(!refrush)
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
            setRefrush(!refrush)
            message.success(formatMessage({id: 'operation.success'}) )
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
        let params = { ws_id: ws_id }
        const data = await deleteClusterServer(id, params)
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
        const query = fieldName === 'role' ? { ...row, role: 'local' } : { ...row, baseline_server: 1 }
        const res = await editGroupMachine(row.id, query);
        if (res.code === 200) {
            message.success(formatMessage({id: 'operation.success'}) );
            setRefrush(!refrush)
        } else {
            requestCodeMessage(res.code, res.msg)
        }
    }

    const columns: any = useMemo(() => [
        {
            title: 'IP',
            width: 170,
            fixed: 'left',//TreeIcon
            render: (record: any) => (
                <ServerLink
                    provider={"aligroup"}
                    val={record.test_server.ip}
                // provider={'内网机器'}
                />
            )
        },
        {
            title: 'SN',
            width: 150,
            ellipsis: {
                showTitle: false
            },
            render: (record: any) => (
                <ServerLink
                    provider={"aligroup"}
                    val={record.test_server.sn}
                // provider={'内网机器'} 
                />
            )
        },
        BUILD_APP_ENV && {
            title: 'TSN',
            width: 150,
            ellipsis: {
                showTitle: false
            },
            render: (record: any) => <EllipsisPulic title={record.test_server.tsn} />
        },
        !BUILD_APP_ENV && {
            title: <FormattedMessage id="device.machine.name"/>,
            width: 150,
            ellipsis: {
                showTitle: false
            },
            render: (record: any) => <EllipsisPulic title={record.test_server.name} color={'#1890ff'} />
        },
        {
            title: <FormattedMessage id="device.private_ip.s"/>,
            width: 100,
            render: (record: any) => record.test_server.private_ip || '-'
        },
        !BUILD_APP_ENV && {
            width: 100,
            title: <FormattedMessage id="device.console_conf"/>,
            render: (record: any) => record.test_server.console_conf || '-'
        },
        {
            title: <FormattedMessage id="device.channel_type"/>,
            width: 100,
            //dataIndex: 'channel_type',
            render: (record: any) => (record.test_server.channel_type || '-')
        },
        // {
        //     title: '角色',
        //     dataIndex: 'role',
        //     render: (record: any) => (record || '-')
        // },
        {
            title: <FormattedMessage id="device.local.server"/>,
            dataIndex: 'role',
            width: 120,
            align: 'center',
            render: (text: number, row: any) => <span>
                {row.role === "local" ?
                    <CheckCircleFilled style={{ width: 17.5, height: 17.5, color: '#1890ff' }} />
                    : <CheckCircleOutlined onClick={() => handleSetDefault(row, 'role')} style={{ cursor: 'pointer', width: 17.5, height: 17.5, color: 'rgba(0,0,0,.1)' }} />
                }
            </span>
        },
        {
            title: <FormattedMessage id="device.baseline_server"/>,
            dataIndex: 'baseline_server',
            width: enLocale ? 150: 120,
            align: 'center',
            render: (text: number, row: any) => <span>
                {text ?
                    <CheckCircleFilled style={{ width: 17.5, height: 17.5, color: '#1890ff' }} />
                    : <CheckCircleOutlined onClick={() => handleSetDefault(row, 'baseline_server')} style={{ cursor: 'pointer', width: 17.5, height: 17.5, color: 'rgba(0,0,0,.1)' }} />
                }
            </span>
        },
        {
            title: <FormattedMessage id="device.kernel_install"/>,
            dataIndex: 'kernel_install',
            width: 130,
            render: (record: any) => (record ? <FormattedMessage id="operation.yes"/>: <FormattedMessage id="operation.no"/>)
        },
        {
            title: <FormattedMessage id="device.var_name"/>,
            dataIndex: 'var_name',
            width: enLocale ? 160: 120,
            render: (record: any) => (record || '-')
        },
        {
            title: <FormattedMessage id="device.usage.state"/>,
            width: 120,
            render: (record: any) => StateBadge(record.test_server.state, record.test_server, ws_id,'not_real')
        },
        {
            title: <FormattedMessage id="device.real_state"/>,
            width: 120,
            render: (record: any) => StateBadge(record.test_server.real_state, record.test_server, ws_id,'real')
        },
        {
            title: <FormattedMessage id="Table.columns.operation"/>,
            fixed: 'right',
            width: BUILD_APP_ENV ? (enLocale ? 260: 185) : (enLocale ? 200: 120),
            align: 'center',
            render: (_: any, row: any) => (
                <Space>
                    <Button style={{ padding: 0 }} type="link" size="small" onClick={() => detailsDrawerRef.current.show(_.test_server.id)}>
                        <FormattedMessage id="operation.detail"/>
                    </Button>
                    <Access
                        accessible={access.WsMemberOperateSelf(row.test_server.owner)}
                        fallback={
                            <Space>
                                {BUILD_APP_ENV && <Button style={{ padding: 0 }} type="link" size="small" onClick={() => AccessTootip()}><FormattedMessage id="device.synchronization.state"/></Button>}
                                <Button style={{ padding: 0 }} type="link" size="small" onClick={() => AccessTootip()}><FormattedMessage id="operation.edit"/></Button>
                                <Button style={{ padding: 0 }} size="small" type="link" onClick={() => AccessTootip()}><FormattedMessage id="operation.delete"/></Button>
                                {!BUILD_APP_ENV && <Button style={{ padding: 0 }} type="link" size="small" onClick={() => AccessTootip()}><FormattedMessage id="device.synchronization"/></Button>}
                            </Space>
                        }
                    >
                        <Space>
                            {BUILD_APP_ENV && <Button style={{ padding: 0 }} type="link" size="small" onClick={() => handleRefresh(_)}><FormattedMessage id="device.synchronization.state"/></Button>}
                            <Button style={{ padding: 0 }} type="link" size="small" onClick={() => handleOpenEditDrawer(_)}><FormattedMessage id="operation.edit"/></Button>
                            <Popconfirm
                                title={<FormattedMessage id="delete.prompt"/>}
                                okText={<FormattedMessage id="operation.ok"/>}
                                cancelText={<FormattedMessage id="operation.cancel"/>}
                                onConfirm={() => handleDeleteServer(_.id)}
                            >
                                <Button style={{ padding: 0 }} size="small" type="link"><FormattedMessage id="operation.delete"/></Button>
                            </Popconfirm>
                            {!BUILD_APP_ENV && <Button style={{ padding: 0 }} type="link" size="small" onClick={() => handleUpdateServer(_.id)}>同步</Button>}
                        </Space>
                    </Access>
                    <Button style={{ padding: 0 }} disabled={true} type="link" size="small" onClick={() => handleOpenLogDrawer(_.id)}><FormattedMessage id="operation.log"/></Button>
                </Space>
            )
        }
    ].filter(Boolean), [enLocale])

    // 请求页面数据
    const getClusterServer = async () => {
        setLoading(true)
        const { data } = await queryClusterServer(props.id)
        setDataSoure(data)
        setLoading(false)
    }

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
                    <div style={{ height: tree.first, background: firstBackground }}></div>
                    {
                        dataSource.length > 0 &&
                        dataSource.map(
                            (item: any, index: any) => (
                                <div
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
                   <ResizeTable
                        rowKey="id"
                        columns={columns}
                        loading={loading}
                        dataSource={dataSource}
                        size="small"
                        pagination={false}
                        scroll={{ x: '100%' }}
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