/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import React, { useState, useEffect, useRef, useImperativeHandle, useCallback } from 'react';
import { Space, Popconfirm, message, Typography } from 'antd';
import { CheckCircleOutlined, CheckCircleFilled } from '@ant-design/icons'
import { queryClusterMachine, delGroupMachine, editGroupMachine, stateRefresh, cloudManageSyncName } from '../../service';
import DataSetPulic from '../../DataSetPulic';
import { StateBadge } from '@/pages/WorkSpace/DeviceManage/GroupManage/Components'
import { ExclamationCircleOutlined } from '@ant-design/icons';
import styles from './style.less';
import { requestCodeMessage, AccessTootip } from '@/utils/utils';
import { Access, useAccess, useParams, useIntl, FormattedMessage, getLocale } from 'umi'
import ServerLink from '@/components/MachineWebLink/index';
import GroupMachine from '../../AddMachinePubilc/index';
import Log from '@/components/Public/Log';
import { ResizeHooksTable } from '@/utils/table.hooks';
import { ColumnEllipsisText } from '@/components/ColumnComponents';

const GroupTree: React.FC<any> = (props) => {
    const { formatMessage } = useIntl()
    const enLocale = getLocale() === 'en-US'
    const { ws_id } = useParams() as any
    const { cluster_id, width, onRef, size, top, is_instance } = props
    const [loading, setLoading] = useState<boolean>(false)
    const [source, setSource] = useState<any>([]);
    const aloneMachine = useRef<any>(null)
    const access = useAccess();
    const logDrawer: any = useRef();

    // step1.请求列表数据
    const getList = async () => {
        setLoading(true)
        const data: any = await queryClusterMachine({ cluster_id: cluster_id }) || {};
        setLoading(false)
        data.data = data.data?.map((item: any) => {
            item.machineId = item.id
            return { ...item, ...item.test_server }
        })
        if (Array.isArray(data.data)) {
            setSource(data.data)
        } else {
            setSource([])
        }
        setLoading(false)
    };

    const handleSyncName = async (id: number) => {
        try {
            const { code, msg } = await cloudManageSyncName({ id, })
            if (code === 200) {
                message.success(formatMessage({ id: 'operation.success' }));
            } else {
                requestCodeMessage(code, msg)
            }
        } catch (err) {
            console.log(err)
        }
    }

    const handleOpenLogDrawer = useCallback(
        (id) => {
            logDrawer.current.show(id)
        },
        []
    )
    // 切换
    const handleSetDefault = async (row: any, fieldName: string) => {
        if (!row.machineId) return
        const { test_server, ...rest } = row
        const query = fieldName === 'role' ? { ...test_server, ...rest, role: 'local' } : { ...test_server, ...rest, baseline_server: 1 }
        const res = await editGroupMachine(row.machineId, query);
        if (res.code === 200) {
            message.success(formatMessage({ id: 'operation.success' }));
            getList();
        } else {
            requestCodeMessage(res.code, res.msg)
        }
    }

    const paramTransform = (val: any) => {
        const dict = {
            0: formatMessage({ id: 'operation.not.release' }),
            1: formatMessage({ id: 'operation.release' }),
            2: formatMessage({ id: 'device.failed.save' })
        }
        return dict[val] || ''
    }

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

    useImperativeHandle(onRef, () => ({
        reload: () => {
            // 刷新列表数据
            getList()
        }
    }));

    const columns: any = [
        {
            title: (
                !!is_instance ?
                    <FormattedMessage id="device.server.instance" /> :
                    <FormattedMessage id="device.server.config" />
            ),
            dataIndex: 'name',
            width: 160,
            fixed: 'left',
            ellipsis: {
                showTitle: false,
            },
            render: (_: any, row: any) => (
                !!is_instance ?
                    <ServerLink
                        exists
                        val={_}
                        param={row.id}
                        provider={"aliyun"}
                        machine_pool={true}
                    /> :
                    <ColumnEllipsisText ellipsis={{ tooltip: true }} >{row.name}</ColumnEllipsisText>
            )
        },
        !!is_instance &&
        {
            title: 'SN',
            dataIndex: 'sn',
            width: 150,
            ellipsis: {
                showTitle: false,
            },
            render: (_: number, row: any) => <ColumnEllipsisText ellipsis={{ tooltip: true }} >{row.sn}</ColumnEllipsisText>
        },
        BUILD_APP_ENV && !!is_instance &&
        {
            title: 'TSN',
            dataIndex: 'tsn',
            width: 150,
            ellipsis: {
                showTitle: false,
            },
            render: (_: number, row: any) => <ColumnEllipsisText ellipsis={{ tooltip: true }} >{row.tsn}</ColumnEllipsisText>
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
            title: <FormattedMessage id="device.type/manufacturer/ak" />,
            dataIndex: 'manufacturer',
            width: 120,
            ellipsis: {
                showTitle: false,
            },
            render: (_: number, row: any) => <ColumnEllipsisText ellipsis={{ tooltip: true }} >{`${row.manufacturer}/${row.ak_name}`}</ColumnEllipsisText>
        },
        {
            title: 'Region/Zone',
            width: 120,
            ellipsis: {
                showTitle: false,
            },
            dataIndex: 'region',
            render: (_: number, row: any) => <ColumnEllipsisText ellipsis={{ tooltip: true }} >{`${row.region}/${row.zone}`}</ColumnEllipsisText>
        },
        {
            title: <FormattedMessage id="device.instance_type" />,
            dataIndex: 'instance_type',
            width: 120,
            ellipsis: {
                showTitle: false,
            },
            render: (_: number, row: any) => <ColumnEllipsisText ellipsis={{ tooltip: true }} >{row.instance_type}</ColumnEllipsisText>
        },
        {
            title: <FormattedMessage id="device.image" />,
            width: 120,
            ellipsis: {
                showTitle: false,
            },
            dataIndex: 'image',
            render: (_: number, row: any) => <ColumnEllipsisText ellipsis={{ tooltip: row.image }} >{row.image_name}</ColumnEllipsisText>
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
        {
            title: <FormattedMessage id="device.console_conf" />,
            width: enLocale ? 170 : 100,
            ellipsis: {
                showTitle: false,
            },
            dataIndex: 'console_conf',
            render: (_: number, row: any) => <ColumnEllipsisText ellipsis={{ tooltip: true }} >{row.console_conf}</ColumnEllipsisText>
        },
        {
            title: <FormattedMessage id="device.release_rule" />,
            dataIndex: 'release_rule',
            width: enLocale ? 150 : 110,
            ellipsis: {
                showTitle: false
            },
            render: (_: any, row: any) => paramTransform(row.release_rule)
        },
        {
            title: <FormattedMessage id="device.private_ip" />,
            width: 160,
            ellipsis: {
                showTitle: false,
            },
            dataIndex: 'private_ip',
            render: (_: number, row: any) => <ColumnEllipsisText ellipsis={{ tooltip: true }} >{row.private_ip}</ColumnEllipsisText>
        },
        {
            title: <FormattedMessage id="device.channel_type" />,
            dataIndex: 'channel_type',
            width: 100,
            ellipsis: {
                showTitle: false,
            },
            render: (_: number, row: any) => <ColumnEllipsisText ellipsis={{ tooltip: true }} >{row.channel_type}</ColumnEllipsisText>
        },
        {
            title: 'Owner',
            width: 100,
            ellipsis: {
                showTitle: false,
            },
            dataIndex: 'owner_name',
            render: (_: any, row: any) => <ColumnEllipsisText ellipsis={{ tooltip: true }} >{row.owner_name}</ColumnEllipsisText>
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
            width: 140, // enLocale ? 170: 120,
            align: 'center',
            render: (text: number, row: any) => (
                text ?
                    <CheckCircleFilled style={{ width: 17.5, height: 17.5, color: '#1890ff' }} />
                    : <CheckCircleOutlined
                        onClick={() => handleSetDefault(row, 'baseline_server')}
                        style={{ cursor: 'pointer', width: 17.5, height: 17.5, color: 'rgba(0,0,0,.1)' }}
                    />
            )
        },
        {
            title: <FormattedMessage id="device.install.kernel" />,
            dataIndex: 'kernel_install',
            width: 120,
            render: (text: number) => text ? <FormattedMessage id="operation.yes" /> : <FormattedMessage id="operation.no" />
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
            dataIndex: "state",
            ellipsis: {
                showTitle: false,
            },
            render: (_: any, record: any) => StateBadge(record.test_server.state, record.test_server, ws_id)
        },
        !!is_instance &&
        {
            title: <FormattedMessage id="device.real_state" />,
            width: 160,
            dataIndex: "real_state",
            ellipsis: {
                showTitle: false,
            },
            render: (_: any, record: any) => StateBadge(record.test_server.real_state, record.test_server, ws_id)
        },
        {
            title: <FormattedMessage id="device.description" />,
            width: 120,
            ellipsis: {
                showTitle: false,
            },
            dataIndex: 'description',
            render: (_: number, row: any) => <ColumnEllipsisText ellipsis={{ tooltip: true }} width={100} >{row.description}</ColumnEllipsisText>
        },
        {
            title: <FormattedMessage id="Table.columns.operation" />,
            fixed: 'right',
            valueType: 'option',
            key: 'operation',
            width: BUILD_APP_ENV ? (enLocale ? 300 : 260) : 220,
            render: (_: number, row: any) => (
                <Space>
                    <Access
                        accessible={access.WsMemberOperateSelf(row.test_server.owner)}
                        fallback={
                            <Space>
                                {
                                    (BUILD_APP_ENV && !!is_instance) &&
                                    <Typography.Link onClick={() => AccessTootip()}>
                                        <FormattedMessage id="device.synchronization.state" />
                                    </Typography.Link>
                                }
                                <Typography.Link onClick={() => AccessTootip()}>
                                    <FormattedMessage id="operation.edit" />
                                </Typography.Link>
                                <Typography.Link onClick={() => AccessTootip()}>
                                    <FormattedMessage id="operation.delete" />
                                </Typography.Link>
                            </Space>
                        }
                    >
                        <Space>
                            {
                                (BUILD_APP_ENV && !!is_instance) &&
                                <Typography.Link onClick={() => handleRefresh(row)}>
                                    <FormattedMessage id="device.synchronization.state" />
                                </Typography.Link>
                            }
                            <Typography.Link onClick={() => { editMachine(row) }}>
                                <FormattedMessage id="operation.edit" />
                            </Typography.Link>
                            <Popconfirm
                                title={
                                    <Typography.Text type="danger">
                                        {formatMessage({ id: "delete.prompt" }, { data: `(${row.name})` })}
                                    </Typography.Text>
                                }
                                placement="topRight"
                                okText={<FormattedMessage id="operation.cancel" />}
                                cancelText={<FormattedMessage id="operation.confirm.delete" />}
                                onCancel={() => { remMachine(row) }}
                                overlayStyle={{ width: '280px' }}
                                icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
                            >
                                <Typography.Link><FormattedMessage id="operation.delete" /></Typography.Link>
                            </Popconfirm>
                        </Space>
                    </Access>
                    {
                        !!is_instance &&
                        <Typography.Link onClick={() => handleSyncName(row.server_id)}>
                            <FormattedMessage id="operation.sync.name" />
                        </Typography.Link>
                    }
                    <Typography.Link onClick={() => handleOpenLogDrawer(row.id)}>
                        <FormattedMessage id="operation.log" />
                    </Typography.Link>
                </Space>
            )
        }
    ]

    useEffect(() => {
        getList()
    }, [])

    // 刷新列表数据
    const onSuccess = () => {
        getList()
    }

    return (
        <div className={styles.warp}>
            <div
                className={styles.tree}
                style={{ backgroundSize: `40px ${size}px`, height: top, backgroundPosition: 'left center' }}
            />
            {
                !!source.length &&
                <div
                    className={styles.tree}
                    style={{ backgroundSize: `40px ${size}px`, height: size * source.length + 30, top: top }}
                />
            }
            <ResizeHooksTable
                style={{ width: width - 79 }}
                loading={loading}
                scroll={{ x: '100%' }}
                columns={columns as any}
                refreshDeps={[is_instance, ws_id, enLocale]}
                name="ws-cloud-device-group"
                showHeader={!!source.length}
                dataSource={source}
                rowKey={'id'}
                pagination={false}
            />
            <Log ref={logDrawer} operation_object={'machine_cloud_server'} />
            <GroupMachine onRef={aloneMachine} is_instance={is_instance} onSuccess={onSuccess} type='cluster' cluster_id={cluster_id} />
        </div>
    )
}

export default GroupTree