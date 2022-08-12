import React, { useState, useEffect, useCallback, useRef } from 'react'

import { Space, Button, message, Typography, Popconfirm, Tooltip } from 'antd'
import { CheckCircleOutlined, CheckCircleFilled } from '@ant-design/icons'
import { updateTestServer, deleteClusterServer, queryClusterServer, editGroupMachine } from '../../services'
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
import { Access, useAccess } from 'umi'
// const treeSvg = require('@/assets/svg/tree.svg')

export default (props: any) => {
    const ws_id = window.location.pathname.replace(/\/ws\/([a-zA-Z0-9]{8})\/.*/, '$1')
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

    const handleOpenLogDrawer = useCallback(
        (id) => {
            logDrawer.current.show(id)
        }, []
    )

    const defaultFetchOption = (ret: any) => {
        if (ret.code === 200) {
            setRefrush(!refrush)
            message.success('操作成功！')
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
            message.success('操作成功');
            setRefrush(!refrush)
        } else {
            requestCodeMessage(res.code, res.msg)
        }
    }

    const columns: any = [
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
            title: '机器名称',
            width: 150,
            ellipsis: {
                showTitle: false
            },
            render: (record: any) => <EllipsisPulic title={record.test_server.name} color={'#1890ff'} />
        },
        {
            title: '私网地址',
            width: 100,
            render: (record: any) => record.test_server.private_ip || '-'
        },
        !BUILD_APP_ENV && {
            width: 100,
            title: 'Console配置',
            render: (record: any) => record.test_server.console_conf || '-'
        },
        {
            title: '控制通道',
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
            title: '是否Local机器',
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
            title: '是否基线机器',
            dataIndex: 'baseline_server',
            width: 120,
            align: 'center',
            render: (text: number, row: any) => <span>
                {text ?
                    <CheckCircleFilled style={{ width: 17.5, height: 17.5, color: '#1890ff' }} />
                    : <CheckCircleOutlined onClick={() => handleSetDefault(row, 'baseline_server')} style={{ cursor: 'pointer', width: 17.5, height: 17.5, color: 'rgba(0,0,0,.1)' }} />
                }
            </span>
        },
        {
            title: '是否安装内核',
            dataIndex: 'kernel_install',
            width: 130,
            render: (record: any) => (record ? '是' : '否')
        },
        {
            title: '运行变量名',
            dataIndex: 'var_name',
            width: 120,
            render: (record: any) => (record || '-')
        },
        {
            title: '使用状态',
            width: 120,
            render: (record: any) => StateBadge(record.test_server.state, record.test_server)
        },
        {
            title: '实际状态',
            width: 120,
            render: (record: any) => StateBadge(record.test_server.real_state, record.test_server)
        },
        {
            title: '操作',
            fixed: 'right',
            width: 220,
            align: 'center',
            render: (_: any, row: any) => (
                <Space>
                    <Button style={{ padding: 0 }} type="link" size="small" onClick={() => detailsDrawerRef.current.show(_.test_server.id)}>详情</Button>
                    <Access
                        accessible={access.WsMemberOperateSelf(row.test_server.owner)}
                        fallback={
                            <Space>
                                <Button style={{ padding: 0 }} type="link" size="small" onClick={() => AccessTootip()}>编辑</Button>
                                <Button style={{ padding: 0 }} size="small" type="link" onClick={() => AccessTootip()}>删除</Button>
                                <Button style={{ padding: 0 }} type="link" size="small" onClick={() => AccessTootip()}>同步</Button>
                            </Space>
                        }
                    >
                        <Space>
                            <Button style={{ padding: 0 }} type="link" size="small" onClick={() => handleOpenEditDrawer(_)}>编辑</Button>
                            <Popconfirm
                                title="确定要删除吗？"
                                okText="确定"
                                cancelText="取消"
                                onConfirm={() => handleDeleteServer(_.id)}
                            >
                                <Button style={{ padding: 0 }} size="small" type="link" >删除</Button>
                            </Popconfirm>
                            <Button style={{ padding: 0 }} type="link" size="small" onClick={() => handleUpdateServer(_.id)}>同步</Button>
                        </Space>
                    </Access>
                    <PermissionTootip>
                        <Button style={{ padding: 0 }} disabled={true} type="link" size="small" onClick={() => handleOpenLogDrawer(_.id)}>日志</Button>
                    </PermissionTootip>
                </Space>
            )
        }
    ].filter(Boolean)

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