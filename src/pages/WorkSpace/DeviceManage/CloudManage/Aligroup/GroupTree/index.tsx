import React, { useState, useEffect, useRef, useImperativeHandle } from 'react';
import { Button, Space, Popconfirm, message } from 'antd';
import { CheckCircleOutlined, CheckCircleFilled } from '@ant-design/icons'
import { queryClusterMachine, delGroupMachine, editGroupMachine } from '../../service';
import GroupMachine from '../GroupMachine'
import EllipsisPulic from '@/components/Public/EllipsisPulic';
import DataSetPulic from '../../DataSetPulic';
import { StateBadge } from '@/pages/WorkSpace/DeviceManage/GroupManage/Components'
import { ExclamationCircleOutlined } from '@ant-design/icons';
import styles from './style.less';
// import PermissionTootip from '@/components/Public/Permission/index';
import ResizeTable from '@/components/ResizeTable'
import { requestCodeMessage, AccessTootip } from '@/utils/utils';
import { Access, useAccess } from 'umi'
import ServerLink from '@/components/MachineWebLink/index';

const GroupTree: React.FC<any> = (props) => {
    const { cluster_id, width, onRef, size, top, handleOpenLogDrawer } = props
    const [loading, setLoading] = useState<boolean>(false)
    const [data, setData] = useState<any>([]);
    const [refresh, setRefresh] = useState<boolean>(true)
    const [columns, setColumns] = useState<any>([]);
    const aloneMachine = useRef<any>(null)
    const access = useAccess();

    // step1.请求列表数据
    const getList = async () => {
        setLoading(true)
        const data: any = await queryClusterMachine({ cluster_id: cluster_id }) || {};
        data.data = data.data?.map((item: any) => {
            item.machineId = item.id
            return { ...item, ...item.test_server }
        })
        if (Array.isArray(data.data)) {
            setData(data.data)
        } else {
            setData([])
        }
        setLoading(false)
    };

    // 切换
    const handleSetDefault = async (row: any, fieldName: string) => {
        if (!row.machineId) return
        const query = fieldName === 'role' ? { ...row, role: 'local' } : { ...row, baseline_server: 1 }
        const res = await editGroupMachine(row.machineId, query);
        if (res.code === 200) {
            message.success('操作成功');
            getList();
        } else {
            requestCodeMessage(res.code, res.msg)
        }
    }

    useEffect(() => {
        const instance = !!data.length && data[0].is_instance
        let dataSource: any = [{
            title: instance ? '机器实例' : '机器配置',
            dataIndex: 'name',
            width: 160,
            fixed: 'left',
            render: (_: any, row: any) => (
                instance ?
                <ServerLink
                    val={_}
                    param={row.id}
                    provider={"aliyun"}
                />
                : <EllipsisPulic title={row.name} />
            )
        },
        instance && {
            title: 'SN',
            dataIndex: 'sn',
            width: 150,
            render: (_: number, row: any) => <EllipsisPulic title={row.sn} />
        },
        instance && {
            title: 'TSN',
            dataIndex: 'tsn',
            width: 150,
            render: (_: number, row: any) => <EllipsisPulic title={row.tsn} />
        },
        !BUILD_APP_ENV &&
        {
            title: '公网IP',
            width: 130,
            dataIndex: 'pub_ip',
        },
        {
            title: '云厂商/Ak',
            dataIndex: 'manufacturer',
            width: 120,
            render: (_: number, row: any) => <EllipsisPulic title={`${row.manufacturer}/${row.ak_name}`} />
        },
        {
            title: 'Region/Zone',
            width: 120,
            dataIndex: 'region',
            render: (_: number, row: any) => <EllipsisPulic title={`${row.region}/${row.zone}`} />
        },
        {
            title: '规格',
            dataIndex: 'instance_type',
            width: 120,
            render: (_: number, row: any) => <EllipsisPulic title={row.instance_type} />
        },
        {
            title: '镜像',
            width: 120,
            dataIndex: 'image',
            render: (_: number, row: any) => <EllipsisPulic title={row.image}>{row.image_name}</EllipsisPulic>
        },
        {
            title: '带宽',
            width: 80,
            dataIndex: 'bandwidth',
        },
        {
            title: '数据盘',
            dataIndex: 'storage_type',
            width: 100,
            render: (_: number, row: any) => <DataSetPulic name={row.storage_type} />
        },
        // {
        //     title: '用完释放',
        //     dataIndex: 'release_rule',
        //     width: 100,
        //     render: (_: number, row: any) => <div style={{ width: 100 }}>{row.release_rule ? '是' : '否'}</div>
        // },
        {
            title: 'Console配置',
            width: 100,
            dataIndex: 'console_conf',
            render: (_: number, row: any) => <EllipsisPulic title={row.console_conf} />
        },
        {
            title: '私网IP',
            width: 100,
            dataIndex: 'private_ip',
            render: (_: number, row: any) => <EllipsisPulic title={row.private_ip} />
        },
        {
            title: '控制通道',
            dataIndex: 'channel_type',
            width: 100,
            render: (_: number, row: any) => <EllipsisPulic title={row.channel_type} />
        },
        {
            title: 'Owner',
            width: 100,
            dataIndex: 'owner_name',
            render: (_: any, row: any) => <EllipsisPulic title={row.owner_name} />
        },
        {
            title: '是否Local机器',
            dataIndex: 'role',
            width: 140,
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
            title: '安装内核',
            dataIndex: 'kernel_install',
            width: 120,
            render: (text: number, row: any) => <span>{text ? '是' : '否'}</span>
        },
        {
            title: '运行变量名',
            dataIndex: 'var_name',
            width: 110,
        },
        instance &&
        {
            title: '机器状态',
            width: 120,
            render: (record: any) => StateBadge(record.test_server.state, record.test_server)
        },
        instance &&
        {
            title: '实际状态',
            width: 120,
            render: (record: any) => StateBadge(record.test_server.real_state, record.test_server)
        },
        {
            title: '备注',
            width: 120,
            dataIndex: 'description',
            render: (_: number, row: any) => <EllipsisPulic title={row.description} width={100} />
        },
        {
            title: '操作',
            fixed: 'right',
            valueType: 'option',
            dataIndex: 'id',
            width: 140,
            render: (_: number, row: any) => (
                <Space>
                    <Access 
                        accessible={access.WsMemberOperateSelf(row.test_server.owner)}
                        fallback={
                            <Space>
                                <Button type="link" style={{ padding: 0, height: 'auto' }} onClick={() => AccessTootip()}>编辑</Button>
                                <Button type="link" style={{ padding: 0, height: 'auto' }} onClick={() => AccessTootip()}>删除</Button>
                            </Space>
                        }
                    >
                        <Space>
                            <Button type="link" style={{ padding: 0, height: 'auto' }} onClick={() => { editMachine(row) }} >编辑</Button>
                            <Popconfirm
                                title={<div style={{ color: 'red' }}>确认要删除吗？</div>}
                                placement="topRight"
                                okText="取消"
                                cancelText="确认删除"
                                onCancel={() => { remMachine(row) }}
                                overlayStyle={{ width: '224px' }}
                                icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
                            >
                                <Button type="link" style={{ padding: 0, height: 'auto' }}>删除</Button>
                            </Popconfirm>
                        </Space>
                    </Access>
                    <Button type="link" style={{ padding: 0, height: 'auto' }} onClick={() => handleOpenLogDrawer(row.id, 'machine_cloud_server')}>日志</Button>
                </Space>


            )
        }
        ].filter(Boolean)
        setColumns(dataSource)
    }, [data])

    const editMachine = (row: any) => {
        aloneMachine.current && aloneMachine.current.editMachine({ ...row, cluster_id })
    }
    const remMachine = async (row: any) => {
        const { code, msg } = await delGroupMachine(row.machineId)
        if (code === 200) {
            getList()
            message.success('删除成功');
        } else {
            message.success(msg);
        }
    }

    useEffect(() => {
        // 1.请求列表;
        getList()
    }, [refresh]);

    useImperativeHandle(onRef, () => ({
        reload: (title: string, data: any = {}) => {
            setRefresh(!refresh)
        }
    }));

    const onSuccess = () => {
        setRefresh(!refresh)
    }

    return (
        <div className={styles.warp}>
            <div
                className={styles.tree}
                style={{ backgroundSize: `40px ${size}px`, height: top, backgroundPosition: 'left center' }}
            />
            {
                data.length > 0 &&
                <div
                    className={styles.tree}
                    style={{ backgroundSize: `40px ${size}px`, height: size * data.length + 30, top: top }}
                />
            }
            <ResizeTable
                style={{ width: width - 79 }}
                loading={loading}
                scroll={{ x: 2160 }}
                columns={columns}
                showHeader={data.length > 0 ? true : false}
                dataSource={data}
                rowKey={'id'}
                pagination={false}
            />
            <GroupMachine onRef={aloneMachine} run_mode={'standalone'} onSuccess={onSuccess} />
        </div>
    )
}

export default GroupTree