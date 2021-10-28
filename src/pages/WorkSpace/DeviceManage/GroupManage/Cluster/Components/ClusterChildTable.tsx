import React, { useState, useEffect, useCallback, useRef } from 'react'

import { Space, Button, message, Typography, Popconfirm, Tooltip } from 'antd'
import { CheckCircleOutlined, CheckCircleFilled } from '@ant-design/icons'
import { updateTestServer, deleteClusterServer, queryClusterServer, editGroupMachine } from '../../services'
import { AuthCommon, AuthForm } from '@/components/Permissions/AuthCommon';
import DeviceDetail from '../../Components/DeviceDetail'
import { StateBadge } from '../../Components'
import ClusterEditServer from './ClusterEditServer'
import OperationLog from '@/components/Public/Log'
import styles from './index.less'
import EllipsisPulic from '@/components/Public/EllipsisPulic';

import ResizeTable from '@/components/ResizeTable'
import { requestCodeMessage } from '@/utils/utils';
import treeSvg from '@/assets/svg/tree.svg'
// const treeSvg = require('@/assets/svg/tree.svg')

export default (props: any) => {
    const ws_id = window.location.pathname.replace(/\/ws\/([a-zA-Z0-9]{8})\/.*/, '$1')

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
            requestCodeMessage( res.code , res.msg )
        }
    }
    const columns: any = [
        {
            title: 'IP',
            width: 170,
            fixed: 'left',//TreeIcon
            render: (record: any) => (
                <a href={`https://sa.alibaba-inc.com/ops/terminal.html?&source=tone&ip=${record.test_server.ip}`} target="_blank">{record.test_server.ip || '-'}</a>
            )
        },
        {
            title: 'SN',
            width: 150,
            ellipsis: true,
            render: (record: any) => <EllipsisPulic title={record.test_server.sn} color={'#1890ff'}/>
        },
        {
            title: '机器名称',
            width: 150,
            ellipsis: true,
            render: (record: any) => <EllipsisPulic title={record.test_server.name} color={'#1890ff'}/>
        },
        {
            title: '私网地址',
            width  :100,
            render: (record: any) => record.test_server.private_ip || '-'
        },
        {
            width  :100,
            title: 'Console配置',
            render: (record: any) => record.test_server.console_conf || '-'
        },
        {
            title: '控制通道',
            width  :100,
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
            width : 130,
            render: (record: any) => (record ? '是' : '否')
        },
        {
            title: '运行变量名',
            dataIndex: 'var_name',
            width  :120,
            render: (record: any) => (record || '-')
        },
        {
            title: '机器状态',
            width:120,
            render: (record: any) => StateBadge(record.test_server.state, record.test_server)
        },
        {
            title: '实际状态',
            width  :120,
            render: (record: any) => StateBadge(record.test_server.real_state, record.test_server)
        },
        {
            title: '操作',
            fixed: 'right',
            width: 220,
            align: 'center',
            render: (_: any) => (
                <Space>
                    {<AuthCommon
                        isAuth={['super_admin', 'sys_admin', 'ws_owner', 'ws_admin', 'ws_test_admin']}
                        children={<Button style={{ padding: 0 }} type="link" size="small" >详情</Button>}
                        onClick={() => detailsDrawerRef.current.show(_.test_server.id)} />
                    }
                    {<AuthCommon
                        isAuth={['super_admin', 'sys_admin', 'ws_owner', 'ws_admin', 'ws_test_admin']}
                        children={<Button style={{ padding: 0 }} type="link" size="small" >编辑</Button>}
                        onClick={() => handleOpenEditDrawer(_)} />
                    }
                    {<AuthForm
                        isAuth={['super_admin', 'sys_admin', 'ws_owner', 'ws_admin', 'ws_test_admin']}
                        children={<Button style={{ padding: 0 }} size="small" type="link" >删除</Button>}
                        onFirm={
                            <Popconfirm
                                title="确定要删除吗？"
                                okText="确定"
                                cancelText="取消"
                                onConfirm={() => handleDeleteServer(_.id)}
                            >
                                <Button style={{ padding: 0 }} size="small" type="link" >删除</Button>
                            </Popconfirm>
                        } />
                    }
                    {<AuthCommon
                        isAuth={['super_admin', 'sys_admin', 'ws_owner', 'ws_admin', 'ws_test_admin']}
                        children={<Button style={{ padding: 0 }} type="link" size="small" >日志</Button>}
                        onClick={() => handleOpenLogDrawer(_.id)} />
                    }
                    {<AuthCommon
                        isAuth={['super_admin', 'sys_admin', 'ws_owner', 'ws_admin', 'ws_test_admin']}
                        children={<Button style={{ padding: 0 }} type="link" size="small" >同步</Button>}
                        onClick={() => handleUpdateServer(_.id)} />
                    }
                    {/* <Dropdown
                        overlay={
                            <Menu>
                                <Menu.Item><Button style={{ padding : 0 }} type="link" size="small" onClick={ () => handleOpenLogDrawer( _.id ) }>日志</Button></Menu.Item>
                                <Menu.Item><Button style={{ padding : 0 }} type="link" size="small" onClick={ () => handleUpdateServer( _.id ) }>同步</Button></Menu.Item>
                            </Menu>
                        }
                    >
                        <Button style={{ padding : 0 }} type="link" size="small" className={ styles.dorp_button }>...</Button>
                    </Dropdown> */}
                </Space>
            )
        }
    ]

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
            <div style={{ width: '100%' , display : 'flex'}}>
                <div style={{ width: 47, background: '#fff' }}>
                    <div style={{ height: tree.first, background : firstBackground }}></div>
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
                        scroll={{ x: 1720 }}
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