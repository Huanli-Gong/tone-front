/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useCallback, useRef, forwardRef, useImperativeHandle } from 'react'
import { Space, Button, Tag, message, Typography, Row, Checkbox, Modal, Spin, Tooltip, Menu, Dropdown } from 'antd'
import { useIntl, FormattedMessage, getLocale, useParams, history, useLocation } from 'umi'
import { FilterFilled, QuestionCircleOutlined, ExclamationCircleOutlined, DownOutlined } from '@ant-design/icons'
import DeviceDetail from '../Components/DeviceDetail'
import AddDevice from './Components/AddDevice'
import { StateBadge } from '../Components'
import SearchInput from '@/components/Public/SearchInput';
import SelectTags from '@/components/Public/SelectTags';
import SelectCheck from '@/pages/WorkSpace/TestSuiteManage/components/SelectCheck'
import CommonPagination from '@/components/CommonPagination'
import OperationLog from '@/components/Public/Log'
import EllipsisPulic from '@/components/Public/EllipsisPulic';
import SelectDropSync from '@/components/Public/SelectDropSync';
import { queryTestServerList, updateTestServer, deleteTestServer, batchUpdateTestServer, queryServerDel, stateRefresh } from '../services'
import { ReactComponent as TreeSvg } from '@/assets/svg/tree.svg'
import styles from './index.less'
import { requestCodeMessage, AccessTootip, saveRefenerceData } from '@/utils/utils';
import ServerLink from '@/components/MachineWebLink/index';
import SelectVmServer from './Components/SelectVmServer';
import { Access, useAccess } from 'umi';
import SelectUser from '@/components/Public/SelectUser';
import OverflowList from '@/components/TagOverflow/index'
import { ResizeHooksTable } from '@/utils/table.hooks'
import { ColumnEllipsisText } from '@/components/ColumnComponents'
import DelConfirmModal from "@/pages/WorkSpace/DeviceManage/components/DelConfirmModal"
import { stringify } from 'querystring';

/**
 * 内网单机
 */

const Standalone = (props: any, ref: any) => {
    const { formatMessage } = useIntl()
    const enLocale = getLocale() === 'en-US'
    const { ws_id } = useParams() as any
    const { query } = useLocation() as any
    const access = useAccess();
    const [dataSource, setDataSource] = useState<any>([])
    const [loading, setLoading] = useState(true)
    const [defaultExpandRowKeys, setDefaultExpandRowKeys] = useState([])
    const [syncLoading, setSyncLoading] = useState(false)
    const [total, setTotal] = useState(0)
    // const [page, setPage] = useState(0)
    const [selectRowKeys, setSelectRowKeys] = useState([])
    const [deleteVisible, setDeleteVisible] = useState(false);
    const [deleteObj, setDeleteObj] = useState<any>({});
    const viewDetailRef: any = useRef(null)
    const addDeviceRef: any = useRef(null)
    const delConfirm: any = React.useRef(null)

    useImperativeHandle(ref, () => ({
        open: addDeviceRef.current.show
    }))

    const [urlParmas, setUrlParams] = useState<any>({
        ws_id,
        page_size: 10,
        page_num: 1,
        ...query
    })

    const selectVmServerList: any = useRef()
    const logDrawer: any = useRef()

    const deviceTypeList = [
        { id: 'phy_server', name: formatMessage({ id: 'device.standalone.phy_server' }) },
        { id: 'vm', name: formatMessage({ id: 'device.standalone.vm' }) }
    ]
    const channelTypeList = agent_list.map((i: any) => ({ id: i.value, name: i.label }))
    const getTestServerList = async () => {
        setLoading(true)
        const res = await queryTestServerList(urlParmas) || {}
        setLoading(false)
        history.replace(`/ws/${ws_id}/device/group?${stringify(urlParmas)}`)
        const { data = [] } = res
        setDataSource(data)
        setTotal(res.total)
        //setPage(res.total_page)
        setDefaultExpandRowKeys(data.map((item: any) => item.id))
    }

    const handleTablePageChange = (page: number, size: number = 10) => {
        setUrlParams({ ...urlParmas, page_size: size, page_num: page })
    }

    const handleUpdateTestServer = useCallback(async (id: number) => {
        setSyncLoading(true)
        const data = await updateTestServer(id)
        if (data.code === 200) {
            message.success(formatMessage({ id: 'operation.success' }))
            setDeleteVisible(false)
        }
        else requestCodeMessage(data.code, data.msg)
        setSyncLoading(false)
    }, [])

    const handleDelServer = async (row: any) => {
        setDeleteObj(row)
        const { data, code, msg } = await queryServerDel({ server_id: row.id, run_mode: 'standalone', server_provider: 'aligroup' })
        if (code === 200) {
            if (data.length > 0) {
                setDeleteVisible(true)
            } else {
                delConfirm.current?.show(row, `(${row.ip})`)
            }
        } else {
            requestCodeMessage(code, msg)
        }
    }

    const calcPageNo = ($total: number, page_num: number, pageSize = 10) => {
        const totalPage = Math.ceil(Number($total - 1) / pageSize)
        return page_num > totalPage && totalPage > 0 ? totalPage : page_num
    }

    const handleDeleteTestServer = async (id: number) => {
        const param = { ws_id }
        const data = await deleteTestServer(id, param)
        //let totalPage = Math.ceil(Number(total) / urlParmas?.page_size )
        const pageNo = calcPageNo(total, urlParmas?.page_num, urlParmas?.page_size)
        if (data.code === 200) {
            message.success(formatMessage({ id: 'operation.success' }))
            setSelectRowKeys(selectRowKeys.filter((i: any) => i !== id))
            setDeleteVisible(false)
            setUrlParams({ ...urlParmas, page_num: pageNo })
        }
        else requestCodeMessage(data.code, data.msg)
    }

    useEffect(() => {
        getTestServerList()
    }, [urlParmas])

    const handleDetail = async () => {
        const pk = await saveRefenerceData({ name: deleteObj.name, id: deleteObj.id })
        if (pk)
            window.open(`/ws/${ws_id}/refenerce/4/?pk=${pk}`)
        // window.open(`/ws/${ws_id}/refenerce/4/?name=${deleteObj.ip}&id=${deleteObj.id}`)
    }
    // 编辑
    const handleEdit = useCallback((scope: any) => {
        addDeviceRef.current.show(scope)
    }, [])

    const handleBatchOption = async () => {
        setSyncLoading(true)
        const data = await batchUpdateTestServer({ pks: selectRowKeys })
        setSyncLoading(false)
        if (data.code === 200) {
            getTestServerList()
            message.success(formatMessage({ id: 'synchronization.success' }))
        }
        else {
            message.warning(data.msg)
        }
    }

    const handleRefresh = async (row: any) => {
        const { code, msg } = await stateRefresh({ server_id: row.id, server_provider: 'aligroup' })
        if (code === 200) {
            message.success(formatMessage({ id: 'device.synchronization.state.success' }))
            getTestServerList()
        }
        else requestCodeMessage(code, msg)
    }

    const handleSelectedRowKeys = useCallback(
        (selectedRowKeys) => {
            setSelectRowKeys(selectedRowKeys)
        }, []
    )

    const hanldeClickMenu = (item: any, row: any) => {
        switch (item.key) {
            case 'data': return handleUpdateTestServer(row.id)
            case 'vm': return selectVmServerList.current.show(row.id)
            default: return false
        }
    }

    const handleOpenLogDrawer = useCallback(
        (id) => {
            logDrawer.current.show(id)
        }, []
    )

    const columns: any = [
        {
            title: 'IP',
            width: 176,
            fixed: 'left',
            dataIndex: 'ip',
            className: styles.ip_td,
            ellipsis: {
                showTitle: false,
            },
            render: (_: any, row: any) => {
                if (row.sub_server_list)
                    return (
                        <ServerLink
                            val={_}
                            provider={"aligroup"}
                        />
                    )
                return (
                    <Row justify="start" align="middle">
                        <TreeSvg style={{ marginRight: 8, height: 40 }} />
                        <ServerLink
                            val={_}
                            provider={"aligroup"}
                        />
                    </Row>
                )
            },
            filterIcon: () => <FilterFilled style={{ color: urlParmas?.ip ? '#1890ff' : undefined }} />,
            filterDropdown: ({ confirm }: any) => (
                <SearchInput
                    value={urlParmas?.ip}
                    confirm={confirm}
                    onConfirm={(ip: string) => setUrlParams({ ...urlParmas, ip, page_num: 1 })}
                />
            )
        },
        {
            title: 'SN',
            dataIndex: 'sn',
            width: 130,
            ellipsis: {
                shwoTitle: false,
            },
            render: (_: any) => (
                <ServerLink
                    val={_}
                    provider={"aligroup"}
                />
            ),
            filterIcon: () => <FilterFilled style={{ color: urlParmas?.sn ? '#1890ff' : undefined }} />,
            filterDropdown: ({ confirm }: any) => (
                <SearchInput
                    value={urlParmas.sn}
                    confirm={confirm}
                    onConfirm={(sn: string) => setUrlParams({ ...urlParmas, sn, page_num: 1 })}
                />
            )
        },
        BUILD_APP_ENV &&
        {
            title: 'TSN',
            dataIndex: 'tsn',
            width: 130,
            ellipsis: {
                shwoTitle: false,
            },
            render: (_: any) => <ColumnEllipsisText ellipsis={{ tooltip: true }} >{_}</ColumnEllipsisText>,
        },
        !BUILD_APP_ENV &&
        {
            title: <FormattedMessage id="device.standalone.name" />,
            dataIndex: 'name',
            width: 130,
            ellipsis: {
                shwoTitle: false,
            },
            render: (text: any) => <ColumnEllipsisText ellipsis={{ tooltip: true }} >{text}</ColumnEllipsisText>,
            filterIcon: () => <FilterFilled style={{ color: urlParmas?.name ? '#1890ff' : undefined }} />,
            filterDropdown: ({ confirm }: any) => (
                <SearchInput
                    value={urlParmas?.name}
                    confirm={confirm}
                    onConfirm={(name: any) => setUrlParams({ ...urlParmas, name, page_num: 1 })}
                />
            )
        },
        !BUILD_APP_ENV &&
        {
            title: <FormattedMessage id="device.device_type" />,
            dataIndex: 'device_type',
            width: 100,
            ellipsis: {
                showTitle: false,
            },
            filterIcon: () => <FilterFilled style={{ color: urlParmas?.device_type ? '#1890ff' : undefined }} />,
            filterDropdown: ({ confirm }: any) => (
                <SelectCheck
                    value={urlParmas?.device_type}
                    list={deviceTypeList}
                    confirm={confirm}
                    onConfirm={(device_type: any) => setUrlParams({ ...urlParmas, device_type, page_num: 1 })}
                />
            ),
        },
        !BUILD_APP_ENV &&
        {
            title: <FormattedMessage id="device.sm_name" />,
            dataIndex: 'sm_name',
            width: 100,
            ellipsis: {
                showTitle: false,
            },
            filterIcon: () => <FilterFilled style={{ color: urlParmas?.sm_name ? '#1890ff' : undefined }} />,
            filterDropdown: ({ confirm }: any) => (
                <SearchInput
                    value={urlParmas?.sm_name}
                    confirm={confirm}
                    onConfirm={(sm_name: string) => setUrlParams({ ...urlParmas, sm_name, page_num: 1 })}
                />
            ),
            render(_: any) {
                return <EllipsisPulic title={_} />
            }
        },
        !BUILD_APP_ENV &&
        {
            title: 'IDC',
            width: 100,
            ellipsis: {
                showTitle: false,
            },
            dataIndex: 'idc',
            filterIcon: () => <FilterFilled style={{ color: urlParmas?.idc ? '#1890ff' : undefined }} />,
            filterDropdown: ({ confirm }: any) => (
                <SearchInput
                    value={urlParmas?.idc}
                    confirm={confirm}
                    onConfirm={(idc: string) => setUrlParams({ ...urlParmas, idc, page_num: 1 })}
                />
            )
        },
        !BUILD_APP_ENV &&
        {
            title: <FormattedMessage id="device.console_conf" />,
            ellipsis: {
                showTitle: false,
            },
            width: 100,
            dataIndex: 'console_conf',
            render: (text: string) => <>{text || '-'}</>
        },
        {
            title: <FormattedMessage id="device.channel_type" />,
            dataIndex: 'channel_type',
            width: 100,
            ellipsis: {
                showTitle: false,
            },
            filterIcon: () => <FilterFilled style={{ color: urlParmas?.channel_type ? '#1890ff' : undefined }} />,
            filterDropdown: ({ confirm }: any) => (
                <SelectCheck
                    value={urlParmas?.channel_type}
                    list={channelTypeList}
                    confirm={confirm}
                    onConfirm={(channel_type: any) => setUrlParams({ ...urlParmas, channel_type, page_num: 1 })}
                />
            ),
        },
        !BUILD_APP_ENV &&
        {
            title: <FormattedMessage id="device.app_group" />,
            dataIndex: 'app_group',
            ellipsis: {
                showTitle: false,
            },
            filterIcon: () => <FilterFilled style={{ color: urlParmas?.app_group ? '#1890ff' : undefined }} />,
            filterDropdown: ({ confirm }: any) => (
                <SearchInput
                    value={urlParmas?.app_group}
                    confirm={confirm}
                    onConfirm={(app_group: string) => setUrlParams({ ...urlParmas, app_group, page_num: 1 })}
                />
            )
        },
        {
            title: (
                <Space>
                    <FormattedMessage id="device.usage.state" />
                    <Tooltip title={formatMessage({ id: 'device.usage.state.Tooltip' })}>
                        <QuestionCircleOutlined />
                    </Tooltip>
                </Space>
            ),
            dataIndex: 'state',
            width: 120 + 30,
            ellipsis: {
                showTitle: false,
            },
            render: (_: any, row: any) => StateBadge(_, row, ws_id),
            filterIcon: () => <FilterFilled style={{ color: urlParmas?.state ? '#1890ff' : undefined }} />,
            filterDropdown: ({ confirm }: any) => (
                <SelectDropSync
                    value={urlParmas?.state}
                    confirm={confirm}
                    onConfirm={(val: string) => setUrlParams({ ...urlParmas, state: val, page_num: 1 })}
                    dataArr={['Available', 'Occupied', 'Broken', 'Reserved', "Unusable"]}
                />
            )
        },
        {
            title: (
                <Space>
                    <FormattedMessage id="device.real_state" />
                    <Tooltip title={formatMessage({ id: 'device.real_state.Tooltip' })}>
                        <QuestionCircleOutlined />
                    </Tooltip>
                </Space>
            ),
            width: 120 + 30,
            dataIndex: 'real_state',
            ellipsis: {
                showTitle: false,
            },
            render: (_: any, row: any) => StateBadge(_, row, ws_id),
            filterIcon: () => <FilterFilled style={{ color: urlParmas?.real_state ? '#1890ff' : undefined }} />,
            filterDropdown: ({ confirm }: any) => (
                <SelectDropSync
                    value={urlParmas?.real_state}
                    confirm={confirm}
                    onConfirm={(val: string) => setUrlParams({ ...urlParmas, real_state: val, page_num: 1 })}
                    dataArr={['Online', 'Offline']}
                />
            )
        },
        {
            title: 'Owner',
            width: 100,
            dataIndex: 'owner_name',
            ellipsis: {
                showTitle: false,
            },
            filterIcon: () => <FilterFilled style={{ color: urlParmas?.owner ? '#1890ff' : undefined }} />,
            filterDropdown: ({ confirm }: any) => (
                <SelectUser
                    value={urlParmas?.owner}
                    confirm={confirm}
                    onConfirm={(val: number) => setUrlParams({ ...urlParmas, page_num: 1, owner: val })}
                />
            ),
        },
        {
            title: <FormattedMessage id="device.description" />,
            dataIndex: 'description',
            filterIcon: () => <FilterFilled style={{ color: urlParmas?.description ? '#1890ff' : undefined }} />,
            filterDropdown: ({ confirm }: any) => (
                <SearchInput
                    value={urlParmas?.description}
                    confirm={confirm}
                    onConfirm={(description: string) => setUrlParams({ ...urlParmas, description, page_num: 1 })}
                />
            ),
            width: 160,
            ellipsis: {
                showTitle: false,
            },
            render(_: any) {
                return <EllipsisPulic title={_} />
            }
        },
        {
            title: <FormattedMessage id="device.tag" />,
            // align: 'center',
            dataIndex: 'tag_list',
            width: 240,
            ellipsis: {
                showTitle: false,
            },
            filterIcon: () => <FilterFilled style={{ color: urlParmas?.tags && urlParmas?.tags.length > 0 ? '#1890ff' : undefined }} />,
            filterDropdown: ({ confirm }: any) => (
                <SelectTags
                    value={urlParmas?.tags}
                    ws_id={ws_id}
                    run_mode={'standalone'}
                    confirm={confirm}
                    onConfirm={(val: number) => { setUrlParams({ ...urlParmas, page_num: 1, tags: val }) }}
                />
            ),
            render: (record: any) => (
                <OverflowList
                    list={
                        record.map((item: any) => {
                            return <Tag color={item.tag_color} key={item.name}>{item.name}</Tag>
                        })
                    }
                />
            ),
        },
        {
            title: <FormattedMessage id="Table.columns.operation" />,
            fixed: 'right',
            width: !BUILD_APP_ENV ? (enLocale ? 380 : 240) : (enLocale ? 320 : 260),
            // align: 'center',
            key: "operation",
            ellipsis: {
                showTitle: false,
            },
            render: (_: any, row: any) => (
                <Space>
                    <Typography.Link onClick={() => viewDetailRef.current.show(_.id)}>
                        <FormattedMessage id="operation.detail" />
                    </Typography.Link>
                    <Access
                        accessible={access.WsMemberOperateSelf(row.owner)}
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
                                <Typography.Link
                                    onClick={row.sub_server_list && row.device_type === '物理机' ? () => false : () => AccessTootip()}
                                >
                                    <FormattedMessage id="device.synchronization" />
                                </Typography.Link>
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
                            <Typography.Link onClick={() => handleEdit(_)}>
                                <FormattedMessage id="operation.edit" />
                            </Typography.Link>
                            <Typography.Link onClick={() => handleDelServer({ ...row })}>
                                <FormattedMessage id="operation.delete" />
                            </Typography.Link>
                            {
                                !BUILD_APP_ENV &&
                                (
                                    row.sub_server_list && row.device_type === '物理机' ?
                                        <Dropdown
                                            placement="bottomRight"
                                            overlay={
                                                <Menu
                                                    onClick={(item) => hanldeClickMenu(item, _)}
                                                >
                                                    <Menu.Item key={'data'}><FormattedMessage id="device.synchronization.data" /></Menu.Item>
                                                    <Menu.Item key={'vm'}><FormattedMessage id="device.synchronization.vm" /></Menu.Item>
                                                </Menu>
                                            }
                                            trigger={['click', 'hover']}
                                        >
                                            <a className="ant-dropdown-link" onClick={e => e.preventDefault()}>
                                                <FormattedMessage id="device.synchronization" /> <DownOutlined />
                                            </a>
                                        </Dropdown> :
                                        <Typography.Link
                                            onClick={row.sub_server_list && row.device_type === '物理机' ? () => false : () => handleUpdateTestServer(_.id)}
                                        >
                                            <FormattedMessage id="device.synchronization" />
                                        </Typography.Link>
                                )
                            }
                        </Space>
                    </Access>
                    <Typography.Link onClick={() => handleOpenLogDrawer(_.id)}>
                        <FormattedMessage id="operation.log" />
                    </Typography.Link>
                </Space>
            )
        }
    ]

    return (
        <Spin spinning={syncLoading} tip={formatMessage({ id: 'device.Synchronizing' })}>
            <ResizeHooksTable
                loading={loading}
                rowKey="id"
                columns={columns}
                name="ws-server-group-standalone-list"
                refreshDeps={[urlParmas, ws_id, access, enLocale]}
                pagination={false}
                size={'small'}
                className={styles.pro_table_card}
                dataSource={dataSource}
                rowSelection={{
                    selectedRowKeys: selectRowKeys,
                    onChange: handleSelectedRowKeys
                }}
                expandable={{
                    childrenColumnName: 'sub_server_list',
                    defaultExpandAllRows: true,
                    expandedRowKeys: defaultExpandRowKeys,
                    expandIcon: () => false,
                }}
                scroll={{ x: '100%', y: innerHeight - 50 - 66 - 30 - 20 }}
            />
            <CommonPagination
                pageSize={urlParmas?.page_size}
                currentPage={urlParmas?.page_num}
                total={total}
                onPageChange={handleTablePageChange}
            />
            {/* 集团单机 —— 日志 */}
            <OperationLog ref={logDrawer} operation_object="machine_test_server" />
            {
                (Array.isArray(selectRowKeys) && !!selectRowKeys.length) ?
                    (
                        <Row justify="space-between"
                            style={{
                                paddingRight: 20,
                                height: 64,
                                position: 'absolute',
                                left: 0,
                                bottom: -24,
                                width: '100%',
                                background: '#fff',
                                paddingLeft: 24,
                                boxShadow: '0 -9px 28px 8px rgba(0,0,0,0.05), 0 -6px 16px 0 rgba(0,0,0,0.08), 0 -3px 6px -4px rgba(0,0,0,0.12)'
                            }}
                        >
                            <Space>
                                <Checkbox indeterminate={true} />
                                <Typography.Text>{formatMessage({ id: 'device.selected.item' }, { data: selectRowKeys.length })}</Typography.Text>
                                <Button type="link" onClick={() => setSelectRowKeys([])}><FormattedMessage id="operation.cancel" /></Button>
                            </Space>
                            <Space>
                                <Button onClick={() => handleEdit({ selectRowKeys, opreateType: 'moreEdit' })}><FormattedMessage id="batch.edit" /></Button>
                                {!BUILD_APP_ENV && <Button onClick={handleBatchOption}><FormattedMessage id="batch.synchronization" /></Button>}
                            </Space>
                        </Row>
                    ) : null
            }
            {/* 添加|编辑机器 */}
            <AddDevice
                onFinish={getTestServerList}
                run_environment="aligroup"
                run_mode="standalone"
                ref={addDeviceRef}
            />
            {/* 详情 */}
            <DeviceDetail ref={viewDetailRef} />
            <Modal
                title={<FormattedMessage id="delete.tips" />}
                centered={true}
                open={deleteVisible}
                onCancel={() => setDeleteVisible(false)}
                footer={[
                    <Button key="submit" onClick={() => handleDeleteTestServer(deleteObj.id)}>
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
                    <FormattedMessage id="device.delete.tips" />
                </div>
                <div style={{ color: '#1890FF', cursor: 'pointer' }} onClick={handleDetail}>
                    <FormattedMessage id="view.quote.details" />
                </div>
            </Modal>
            <DelConfirmModal
                ref={delConfirm}
                onOk={(row: any) => handleDeleteTestServer(row.id)}
            />
            <SelectVmServer ref={selectVmServerList} onOk={getTestServerList} />
        </Spin>
    )
}


export default forwardRef(Standalone)