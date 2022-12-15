import React, { useState, useEffect, useRef, useImperativeHandle, useMemo, useCallback } from 'react';
import { Button, Space, Popconfirm, message } from 'antd';
import { CheckCircleOutlined, CheckCircleFilled } from '@ant-design/icons'
import { queryClusterMachine, delGroupMachine, editGroupMachine, stateRefresh } from '../../service';
import EllipsisPulic from '@/components/Public/EllipsisPulic';
import DataSetPulic from '../../DataSetPulic';
import { StateBadge } from '@/pages/WorkSpace/DeviceManage/GroupManage/Components'
import { ExclamationCircleOutlined } from '@ant-design/icons';
import styles from './style.less';
import ResizeTable from '@/components/ResizeTable'
import { requestCodeMessage, AccessTootip } from '@/utils/utils';
import { Access, useAccess, useParams, useIntl, FormattedMessage, getLocale } from 'umi'
import ServerLink from '@/components/MachineWebLink/index';
import GroupMachine from '../../AddMachinePubilc/index';
import Log from '@/components/Public/Log';
const GroupTree: React.FC<any> = (props) => {
    const { formatMessage } = useIntl()
    const enLocale = getLocale() === 'en-US'
    const { ws_id } = useParams() as any
    const { cluster_id, width, onRef, size, top, is_instance } = props
    const [loading, setLoading] = useState<boolean>(false)
    const [data, setData] = useState<any>([]);
    const [refresh, setRefresh] = useState<boolean>(true)
    const aloneMachine = useRef<any>(null)
    const access = useAccess();
    const logDrawer: any = useRef();

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

    const handleOpenLogDrawer = useCallback(
        (id) => {
            logDrawer.current.show(id)
        },
        []
    )
    // 切换
    const handleSetDefault = async (row: any, fieldName: string) => {
        if (!row.machineId) return
        const query = fieldName === 'role' ? { ...row, role: 'local' } : { ...row, baseline_server: 1 }
        const res = await editGroupMachine(row.machineId, query);
        if (res.code === 200) {
            message.success(formatMessage({ id: 'operation.success' }));
            getList();
        } else {
            requestCodeMessage(res.code, res.msg)
        }
    }

    const columns = useMemo(() => {
        return [{
            title: !!is_instance ? <FormattedMessage id="device.server.instance" /> : <FormattedMessage id="device.server.config" />,
            dataIndex: 'name',
            width: 160,
            fixed: 'left',
            ellipsis: {
                showTitle: false,
            },
            render: (_: any, row: any) => (
                !!is_instance ?
                    <ServerLink
                        val={_}
                        param={row.id}
                        provider={"aliyun"}
                        machine_pool={true}
                    />
                    : <EllipsisPulic title={row.name} />
            )
        },
        !!is_instance && {
            title: 'SN',
            dataIndex: 'sn',
            width: 150,
            ellipsis: {
                showTitle: false,
            },
            render: (_: number, row: any) => <EllipsisPulic title={row.sn} />
        },
        BUILD_APP_ENV && !!is_instance && {
            title: 'TSN',
            dataIndex: 'tsn',
            width: 150,
            ellipsis: {
                showTitle: false,
            },
            render: (_: number, row: any) => <EllipsisPulic title={row.tsn} />
        },
        !BUILD_APP_ENV && !!is_instance &&
        {
            title: <FormattedMessage id="device.pub_ip" />,
            width: 130,
            ellipsis: {
                showTitle: false,
            },
            dataIndex: 'pub_ip',
        },
        {
            title: <FormattedMessage id="device.manufacturer/ak" />,
            dataIndex: 'manufacturer',
            width: 120,
            ellipsis: {
                showTitle: false,
            },
            render: (_: number, row: any) => <EllipsisPulic title={`${row.manufacturer}/${row.ak_name}`} />
        },
        {
            title: 'Region/Zone',
            width: 120,
            ellipsis: {
                showTitle: false,
            },
            dataIndex: 'region',
            render: (_: number, row: any) => <EllipsisPulic title={`${row.region}/${row.zone}`} />
        },
        {
            title: <FormattedMessage id="device.instance_type" />,
            dataIndex: 'instance_type',
            width: 120,
            ellipsis: {
                showTitle: false,
            },
            render: (_: number, row: any) => <EllipsisPulic title={row.instance_type} />
        },
        {
            title: <FormattedMessage id="device.image" />,
            width: 120,
            ellipsis: {
                showTitle: false,
            },
            dataIndex: 'image',
            render: (_: number, row: any) => <EllipsisPulic title={row.image}>{row.image_name}</EllipsisPulic>
        },
        {
            title: <FormattedMessage id="device.bandwidth" />,
            width: 100,
            dataIndex: 'bandwidth',
        },
        {
            title: <FormattedMessage id="device.storage_type" />,
            dataIndex: 'storage_type',
            ellipsis: {
                showTitle: false,
            },
            width: 100,
            render: (_: number, row: any) => <DataSetPulic name={row.storage_type} formatMessage={formatMessage} />
        },
        // {
        //     title: '用完释放',
        //     dataIndex: 'release_rule',
        //     width: 100,
        //     render: (_: number, row: any) => <div style={{ width: 100 }}>{row.release_rule ? '是' : '否'}</div>
        // },
        {
            title: <FormattedMessage id="device.console_conf" />,
            width: enLocale ? 170 : 100,
            ellipsis: {
                showTitle: false,
            },
            dataIndex: 'console_conf',
            render: (_: number, row: any) => <EllipsisPulic title={row.console_conf} />
        },
        {
            title: <FormattedMessage id="device.private_ip" />,
            width: 160,
            ellipsis: {
                showTitle: false,
            },
            dataIndex: 'private_ip',
            render: (_: number, row: any) => <EllipsisPulic title={row.private_ip} />
        },
        {
            title: <FormattedMessage id="device.channel_type" />,
            dataIndex: 'channel_type',
            width: 100,
            ellipsis: {
                showTitle: false,
            },
            render: (_: number, row: any) => <EllipsisPulic title={row.channel_type} />
        },
        {
            title: 'Owner',
            width: 100,
            ellipsis: {
                showTitle: false,
            },
            dataIndex: 'owner_name',
            render: (_: any, row: any) => <EllipsisPulic title={row.owner_name} />
        },
        {
            title: <FormattedMessage id="device.local.server" />,
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
            title: <FormattedMessage id="device.baseline_server" />,
            dataIndex: 'baseline_server',
            width: 140, // enLocale ? 170: 120,
            align: 'center',
            render: (text: number, row: any) => <span>
                {text ?
                    <CheckCircleFilled style={{ width: 17.5, height: 17.5, color: '#1890ff' }} />
                    : <CheckCircleOutlined onClick={() => handleSetDefault(row, 'baseline_server')} style={{ cursor: 'pointer', width: 17.5, height: 17.5, color: 'rgba(0,0,0,.1)' }} />
                }
            </span>
        },
        {
            title: <FormattedMessage id="device.install.kernel" />,
            dataIndex: 'kernel_install',
            width: 120,
            render: (text: number, row: any) => <span>{text ? <FormattedMessage id="operation.yes" /> : <FormattedMessage id="operation.no" />}</span>
        },
        {
            title: <FormattedMessage id="device.var_name" />,
            dataIndex: 'var_name',
            width: enLocale ? 170 : 110,
            ellipsis: {
                showTitle: false,
            },
        },
        !!is_instance &&
        {
            title: <FormattedMessage id="device.server.state" />,
            width: 120,
            ellipsis: {
                showTitle: false,
            },
            render: (record: any) => StateBadge(record.test_server.state, record.test_server, ws_id)
        },
        !!is_instance &&
        {
            title: <FormattedMessage id="device.real_state" />,
            width: 160,
            ellipsis: {
                showTitle: false,
            },
            render: (record: any) => StateBadge(record.test_server.real_state, record.test_server, ws_id)
        },
        {
            title: <FormattedMessage id="device.description" />,
            width: 120,
            ellipsis: {
                showTitle: false,
            },
            dataIndex: 'description',
            render: (_: number, row: any) => <EllipsisPulic title={row.description} width={100} />
        },
        {
            title: <FormattedMessage id="Table.columns.operation" />,
            fixed: 'right',
            valueType: 'option',
            dataIndex: 'id',
            width: BUILD_APP_ENV ? 222 : 182,
            render: (_: number, row: any) => (
                <Space>
                    <Access
                        accessible={access.WsMemberOperateSelf(row.test_server.owner)}
                        fallback={
                            <Space>
                                {(BUILD_APP_ENV && !!is_instance) && <Button type="link" style={{ padding: 0, height: 'auto' }} onClick={() => AccessTootip()}><FormattedMessage id="device.synchronization.state" /></Button>}
                                <Button type="link" style={{ padding: 0, height: 'auto' }} onClick={() => AccessTootip()}><FormattedMessage id="operation.edit" /></Button>
                                <Button type="link" style={{ padding: 0, height: 'auto' }} onClick={() => AccessTootip()}><FormattedMessage id="operation.delete" /></Button>
                            </Space>
                        }
                    >
                        <Space>
                            {(BUILD_APP_ENV && !!is_instance) && <Button type="link" style={{ padding: 0, height: 'auto' }} onClick={() => handleRefresh(row)}><FormattedMessage id="device.synchronization.state" /></Button>}
                            <Button type="link" style={{ padding: 0, height: 'auto' }} onClick={() => { editMachine(row) }}><FormattedMessage id="operation.edit" /></Button>
                            <Popconfirm
                                title={<div style={{ color: 'red' }}><FormattedMessage id="delete.prompt" /></div>}
                                placement="topRight"
                                okText={<FormattedMessage id="operation.cancel" />}
                                cancelText={<FormattedMessage id="operation.confirm.delete" />}
                                onCancel={() => { remMachine(row) }}
                                overlayStyle={{ width: '280px' }}
                                icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
                            >
                                <Button type="link" style={{ padding: 0, height: 'auto' }}><FormattedMessage id="operation.delete" /></Button>
                            </Popconfirm>
                        </Space>
                    </Access>
                    <Button type="link" style={{ padding: 0, height: 'auto' }} onClick={() => handleOpenLogDrawer(row.id)}>
                        <FormattedMessage id="operation.log" />
                    </Button>
                </Space>
            )
        }
        ].filter(Boolean)
    }, [data, is_instance, enLocale])

    const handleRefresh = async (row: any) => {
        const { code, msg } = await stateRefresh({ server_id: row.server_id, server_provider: 'aliyun' })
        if (code === 200) {
            message.success(formatMessage({ id: 'device.synchronization.state.success' }))
            getList()
        }
        else requestCodeMessage(code, msg)
    }

    const editMachine = (row: any) => {
        aloneMachine.current && aloneMachine.current.editMachine({ ...row, cluster_id })
    }
    const remMachine = async (row: any) => {
        const { code, msg } = await delGroupMachine(row.machineId)
        if (code === 200) {
            getList()
            message.success(formatMessage({ id: 'request.delete.success' }));
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
                !!data.length &&
                <div
                    className={styles.tree}
                    style={{ backgroundSize: `40px ${size}px`, height: size * data.length + 30, top: top }}
                />
            }
            <ResizeTable
                style={{ width: width - 79 }}
                loading={loading}
                scroll={{ x: '100%' }}
                columns={columns as any}
                showHeader={!!data.length}
                dataSource={data}
                rowKey={'id'}
                pagination={false}
            />
            <Log ref={logDrawer} operation_object={'machine_cloud_server'} />
            <GroupMachine onRef={aloneMachine} is_instance={is_instance} onSuccess={onSuccess} type='cluster' cluster_id={cluster_id} />
        </div>
    )
}

export default GroupTree