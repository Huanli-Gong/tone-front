import React, { useState, useEffect, useCallback, useRef, forwardRef, useImperativeHandle, memo } from 'react'
import { Space, Button, Tag, message, Typography, Row, Checkbox, Modal, Spin, Tooltip, Menu, Dropdown } from 'antd'

import { FilterFilled, QuestionCircleOutlined, ExclamationCircleOutlined, DownOutlined } from '@ant-design/icons'
import DeviceDetail from '../Components/DeviceDetail'
import AddDevice from './Components/AddDevice'
import { StateBadge } from '../Components'
import SearchInput from '@/pages/WorkSpace/TestSuiteManage/components/SearchInput'
import SelectTags from '@/components/Public/SelectTags';
import SelectCheck from '@/pages/WorkSpace/TestSuiteManage/components/SelectCheck'
import CommonPagination from '@/components/CommonPagination'
import OperationLog from '@/components/Public/Log'
import EllipsisPulic from '@/components/Public/EllipsisPulic';
import SelectDropSync from '@/components/Public/SelectDropSync';
import { queryTestServerList, updateTestServer, deleteTestServer, batchUpdateTestServer, queryServerDel, stateRefresh } from '../services'
import { ReactComponent as TreeSvg } from '@/assets/svg/tree.svg'
import styles from './index.less'
import { useClientSize } from '@/utils/hooks'
import ResizeTable from '@/components/ResizeTable';
import { requestCodeMessage, AccessTootip } from '@/utils/utils';
import ServerLink from '@/components/MachineWebLink/index';
import SelectVmServer from './Components/SelectVmServer';
import { Access, useAccess } from 'umi';
import SelectUser from '@/components/Public/SelectUser';
import OverflowList from '@/components/TagOverflow/index'
/**
 * 内网单机
 */

const Standalone = (props: any, ref: any) => {
    const { ws_id } = props.match.params
    const access = useAccess();
    const [dataSource, setDataSource] = useState<any>([])
    const [loading, setLoading] = useState(true)
    const [defaultExpandRowKeys, setDefaultExpandRowKeys] = useState([])
    const [syncLoading, setSyncLoading] = useState(false)
    const [total, setTotal] = useState(0)
    // const [page, setPage] = useState(0)
    const [selectRowKeys, setSelectRowKeys] = useState([])
    const [deleteVisible, setDeleteVisible] = useState(false);
    const [deleteDefault, setDeleteDefault] = useState(false);
    const [deleteObj, setDeleteObj] = useState<any>({});
    const viewDetailRef: any = useRef(null)
    const addDeviceRef: any = useRef(null)

    useImperativeHandle(ref, () => ({
        open: addDeviceRef.current.show
    }))

    const { height: layoutHeight } = useClientSize()

    const [urlParmas, setUrlParams] = useState<any>({
        ws_id,
        sn: '',
        description: '',
        name: '',
        device_type: '',
        device_mode: '',
        channel_type: '',
        app_group: '',
        ip: '',
        state: '',
        tags: [],
        page_size: 10,
        page_num: 1
    })

    const selectVmServerList: any = useRef()
    const logDrawer: any = useRef()

    const deviceTypeList = [{ id: 'phy_server', name: '物理机' }, { id: 'vm', name: '虚拟机' }]
    const channelTypeList = agent_list.map((i: any) => ({ id: i.value, name: i.label }))

    const getTestServerList = async () => {
        setLoading(true)
        const res = await queryTestServerList(urlParmas) || {}
        setLoading(false)
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
            message.success('操作成功！')
            setDeleteVisible(false)
            setDeleteDefault(false)
        }
        else requestCodeMessage(data.code, data.msg)
        setSyncLoading(false)
    }, [])
    // const defaultFetchOption = useCallback(async (ret: any) => {
    //     console.log('urlParmas',urlParmas)
    //     if (ret.code === 200) {
    //         message.success('操作成功！')
    //         setDeleteVisible(false)
    //         setDeleteDefault(false)
    //     }
    //     else requestCodeMessage(ret.code, ret.msg)
    // }, [])
    const handleDelServer = async (row: any) => {
        setDeleteObj(row)
        const data = await queryServerDel({ server_id: row.id, run_mode: 'standalone', server_provider: 'aligroup' })
        if (data.data.length > 0) {
            setDeleteVisible(true)
        } else {
            setDeleteDefault(true)
        }
    }
    // const calcPageNo = (total = 0, pageNo = 1, pageSize = 10, delNum = 1) => {
    //     console.log(total,pageNo)
    //     const restNum = total - pageSize * (pageNo - 1)
    //     let pageNoDiff = Math.floor((delNum - restNum) / pageSize) + 1
    //     pageNoDiff < 0 && (pageNoDiff = 0)
    //     pageNo = pageNo - pageNoDiff
    //     pageNo < 1 && (pageNo = 1)
    //     return pageNo
    // }
    const calcPageNo = (total: number, page_num: number, pageSize = 10) => {
        let totalPage = Math.ceil(Number(total - 1) / pageSize)
        page_num = page_num > totalPage && totalPage > 0 ? totalPage : page_num
        return page_num
    }
    // const handleDeleteTestServer = useCallback(async (id: number) => {
    //     let param = { ws_id: ws_id }
    //     const data = await deleteTestServer(id, param)
    //     //let totalPage = Math.ceil(Number(total) / urlParmas.page_size )
    //     let pageNo = calcPageNo(total,urlParmas.page_num,urlParmas.page_size)
    //     console.log('page',pageNo)
    //     if (data.code === 200) {
    //         message.success('操作成功！')
    //         setDeleteVisible(false)
    //         setDeleteDefault(false)
    //         setUrlParams({ ...urlParmas, page_num: pageNo })
    //     }
    //     else requestCodeMessage(data.code, data.msg)
    // }, [])
    const handleDeleteTestServer = async (id: number) => {
        let param = { ws_id: ws_id }
        const data = await deleteTestServer(id, param)
        //let totalPage = Math.ceil(Number(total) / urlParmas.page_size )
        let pageNo = calcPageNo(total, urlParmas.page_num, urlParmas.page_size)
        if (data.code === 200) {
            message.success('操作成功！')
            setDeleteVisible(false)
            setDeleteDefault(false)
            setUrlParams({ ...urlParmas, page_num: pageNo })
        }
        else requestCodeMessage(data.code, data.msg)
    }
    useEffect(() => {
        getTestServerList()
    }, [urlParmas])

    const handleDetail = () => {
        window.open(`/ws/${ws_id}/refenerce/4/?name=${deleteObj.ip}&id=${deleteObj.id}`)
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
            message.success('同步成功')
        }
        else {
            message.warning(data.msg)
        }
    }

    const handleRefresh = async (row: any) => {
        const { code, msg } = await stateRefresh({ server_id: row.id, server_provider: 'aligroup' })
        if (code === 200) {
            message.success('同步状态成功')
            getTestServerList()
        }
        else requestCodeMessage(code, msg)
    }

    const handleSelectedRowKeys = useCallback(
        (selectedRowKeys) => {
            setSelectRowKeys(selectedRowKeys)
        }, []
    )

    const handleOpenLogDrawer = useCallback(
        (id) => {
            logDrawer.current.show(id)
        }, []
    )
    let totalParam = 1
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
                else
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
            filterIcon: () => <FilterFilled style={{ color: urlParmas.ip ? '#1890ff' : undefined }} />,
            filterDropdown: ({ confirm }: any) => (
                <SearchInput confirm={confirm} onConfirm={(ip: string) => setUrlParams({ ...urlParmas, ip, page_num: totalParam })} />
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
                    // provider={'内网机器'}
                    provider={"aligroup"}
                />
            ),
            filterIcon: () => <FilterFilled style={{ color: urlParmas.sn ? '#1890ff' : undefined }} />,
            filterDropdown: ({ confirm }: any) => (
                <SearchInput confirm={confirm} onConfirm={(sn: string) => setUrlParams({ ...urlParmas, sn, page_num: totalParam })} />
            )
        },
        BUILD_APP_ENV && {
            title: 'TSN',
            dataIndex: 'tsn',
            width: 130,
            ellipsis: {
                shwoTitle: false,
            },
            render: (_: any) => <EllipsisPulic title={_} />,
        },
        !BUILD_APP_ENV && {
            title: '机器名称',
            dataIndex: 'name',
            width: 130,
            ellipsis: {
                shwoTitle: false,
            },
            render: (text: any) => <EllipsisPulic title={text} />,
            filterIcon: () => <FilterFilled style={{ color: urlParmas.name ? '#1890ff' : undefined }} />,
            filterDropdown: ({ confirm }: any) => (
                <SearchInput confirm={confirm} onConfirm={(name: any) => setUrlParams({ ...urlParmas, name, page_num: totalParam })} />
            )
        },
        !BUILD_APP_ENV && {
            title: '机器类型',
            dataIndex: 'device_type',
            width: 100,
            ellipsis: {
                showTitle: false,
            },
            filterIcon: () => <FilterFilled style={{ color: urlParmas.device_type ? '#1890ff' : undefined }} />,
            filterDropdown: ({ confirm }: any) => (
                <SelectCheck
                    list={deviceTypeList}
                    confirm={confirm}
                    onConfirm={(device_type: any) => setUrlParams({ ...urlParmas, device_type, page_num: totalParam })}
                />
            ),
        },
        !BUILD_APP_ENV && {
            title: '机型',
            dataIndex: 'sm_name',
            width: 100,
            ellipsis: {
                showTitle: false,
            },
            filterIcon: () => <FilterFilled style={{ color: urlParmas.sm_name ? '#1890ff' : undefined }} />,
            filterDropdown: ({ confirm }: any) => (
                <SearchInput confirm={confirm} onConfirm={(sm_name: string) => setUrlParams({ ...urlParmas, sm_name, page_num: totalParam })} />
            ),
            render(_: any) {
                return <EllipsisPulic title={_} />
            }
        },
        !BUILD_APP_ENV && {
            title: 'IDC',
            width: 100,
            ellipsis: {
                showTitle: false,
            },
            dataIndex: 'idc',
            filterIcon: () => <FilterFilled style={{ color: urlParmas.idc ? '#1890ff' : undefined }} />,
            filterDropdown: ({ confirm }: any) => (
                <SearchInput confirm={confirm} onConfirm={(idc: string) => setUrlParams({ ...urlParmas, idc, page_num: totalParam })} />
            )
        },
        !BUILD_APP_ENV && {
            title: 'Console配置',
            ellipsis: {
                showTitle: false,
            },
            width: 100,
            dataIndex: 'console_conf',
            render: (text: string) => <>{text || '-'}</>
        },
        {
            title: '控制通道',
            dataIndex: 'channel_type',
            width: 100,
            ellipsis: {
                showTitle: false,
            },
            filterIcon: () => <FilterFilled style={{ color: urlParmas.channel_type ? '#1890ff' : undefined }} />,
            filterDropdown: ({ confirm }: any) => (
                <SelectCheck
                    list={channelTypeList}
                    confirm={confirm}
                    onConfirm={(channel_type: any) => setUrlParams({ ...urlParmas, channel_type, page_num: totalParam })}
                />
            ),
        },
        !BUILD_APP_ENV && {
            title: '分组',
            dataIndex: 'app_group',
            ellipsis: {
                showTitle: false,
            },
            filterIcon: () => <FilterFilled style={{ color: urlParmas.app_group ? '#1890ff' : undefined }} />,
            filterDropdown: ({ confirm }: any) => (
                <SearchInput confirm={confirm} onConfirm={(app_group: string) => setUrlParams({ ...urlParmas, app_group, page_num: totalParam })} />
            )
        },
        {
            title: <>使用状态 <Tooltip title={"代表T-One的管理状态"}><QuestionCircleOutlined /></Tooltip></>,
            dataIndex: 'state',
            width: 120,
            ellipsis: {
                showTitle: false,
            },
            render: StateBadge,
            filterIcon: () => <FilterFilled style={{ color: urlParmas.state ? '#1890ff' : undefined }} />,
            filterDropdown: ({ confirm }: any) => (
                <SelectDropSync confirm={confirm} onConfirm={(val: string) => setUrlParams({ ...urlParmas, state: val, page_num: totalParam })} stateVal={urlParmas.state} dataArr={['Available', 'Occupied', 'Broken', 'Reserved']} />
            )

        },
        {
            title: <>实际状态 <Tooltip title={"是机器当前的真实状态"}><QuestionCircleOutlined /></Tooltip></>,
            width: 120,
            dataIndex: 'real_state',
            ellipsis: {
                showTitle: false,
            },
            render: StateBadge,
            filterIcon: () => <FilterFilled style={{ color: urlParmas.real_state ? '#1890ff' : undefined }} />,
            filterDropdown: ({ confirm }: any) => (
                <SelectDropSync confirm={confirm} onConfirm={(val: string) => setUrlParams({ ...urlParmas, real_state: val, page_num: totalParam })} stateVal={urlParmas.real_state} dataArr={['Available', 'Broken']} />
            )
        },
        {
            title: 'Owner',
            width: 100,
            dataIndex: 'owner_name',
            ellipsis: {
                showTitle: false,
            },
            filterIcon: () => <FilterFilled style={{ color: urlParmas.owner ? '#1890ff' : undefined }} />,
            filterDropdown: ({ confirm }: any) => <SelectUser confirm={confirm} onConfirm={(val: number) => { setUrlParams({ ...urlParmas, page: 1, owner: val }) }} />,
        },
        {
            title: '备注',
            dataIndex: 'description',
            filterIcon: () => <FilterFilled style={{ color: urlParmas.description ? '#1890ff' : undefined }} />,
            filterDropdown: ({ confirm }: any) => (
                <SearchInput confirm={confirm} onConfirm={(description: string) => setUrlParams({ ...urlParmas, description, page_num: totalParam })} />
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
            title: '标签',
            // align: 'center',
            dataIndex: 'tag_list',
            width: 160,
            ellipsis: {
                showTitle: false,
            },
            filterIcon: () => <FilterFilled style={{ color: urlParmas.tags && urlParmas.tags.length > 0 ? '#1890ff' : undefined }} />,
            filterDropdown: ({ confirm }: any) =>
                <SelectTags
                    ws_id={ws_id}
                    run_mode={'standalone'}
                    confirm={confirm}
                    onConfirm={(val: number) => { setUrlParams({ ...urlParmas, page: 1, tags: val }) }}
                />,
            render: (record: any) => (
                <OverflowList list={
                    record.map((item: any, index: number) => {
                        return <Tag color={item.tag_color} key={index}>{item.name}</Tag>
                    })
                } />
            ),
        },
        {
            title: '操作',
            fixed: 'right',
            width: !BUILD_APP_ENV ? 280 : 240,
            // align: 'center',
            ellipsis: {
                showTitle: false,
            },
            render: (_: any, row: any) => (
                <Space>
                    <Button style={{ padding: 0 }} type="link" size="small" onClick={() => viewDetailRef.current.show(_.id)}>详情</Button>
                    <Access
                        accessible={access.WsMemberOperateSelf(row.owner)}
                        fallback={
                            <Space>
                                <Button style={{ padding: 0 }} type="link" size="small" onClick={() => AccessTootip()}>同步状态</Button>
                                <Button style={{ padding: 0 }} type="link" size="small" onClick={() => AccessTootip()}>编辑</Button>
                                <Button style={{ padding: 0 }} size="small" type="link" onClick={() => AccessTootip()}>删除</Button>
                                <Button style={{ padding: 0 }} size="small" type="link"
                                    onClick={row.sub_server_list && row.device_type === '物理机' ? () => false : () => AccessTootip()}>
                                    同步
                                </Button>
                            </Space>
                        }
                    >
                        <Space>
                            <Button style={{ padding: 0 }} type="link" size="small" onClick={() => handleRefresh(_)}>同步状态</Button>
                            <Button style={{ padding: 0 }} type="link" size="small" onClick={() => handleEdit(_)}>编辑</Button>
                            <Button style={{ padding: 0 }} size="small" type="link" onClick={() => handleDelServer({ ...row })}>删除</Button>
                            {
                                !BUILD_APP_ENV ?
                                    row.sub_server_list && row.device_type === '物理机' ?
                                        <Dropdown
                                            placement="bottomRight"
                                            overlay={
                                                <Menu
                                                    onClick={(item) => hanldeClickMenu(item, _)}
                                                >
                                                    <Menu.Item key={'data'}>同步数据</Menu.Item>
                                                    <Menu.Item key={'vm'}>同步机器</Menu.Item>
                                                </Menu>
                                            }
                                            trigger={['click', 'hover']}
                                        >
                                            <a className="ant-dropdown-link" onClick={e => e.preventDefault()}>
                                                同步 <DownOutlined />
                                            </a>
                                        </Dropdown> :
                                        <Button
                                            style={{ padding: 0 }}
                                            size="small"
                                            type="link"
                                            onClick={row.sub_server_list && row.device_type === '物理机' ? () => false : () => handleUpdateTestServer(_.id)}>
                                            同步
                                        </Button>
                                    : null
                            }
                        </Space>
                    </Access>
                    <Button style={{ padding: 0 }} size="small" type="link" onClick={() => handleOpenLogDrawer(_.id)}>日志</Button>
                </Space>
            )
        }
    ].filter(Boolean);

    const hanldeClickMenu = (item: any, row: any) => {
        switch (item.key) {
            case 'data': return handleUpdateTestServer(row.id)
            case 'vm': return selectVmServerList.current.show(row.id)
            default: return false
        }
    }

    return (
        <Spin spinning={syncLoading} tip="同步中">
            <ResizeTable
                loading={loading}
                rowKey="id"
                columns={columns}
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
                scroll={{ x: '100%', y: layoutHeight - 50 - 66 - 30 - 20 }}
            />
            <CommonPagination
                pageSize={urlParmas.page_size}
                currentPage={urlParmas.page_num}
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
                                <Typography.Text>已选择{selectRowKeys.length}项</Typography.Text>
                                <Button type="link" onClick={() => setSelectRowKeys([])}>取消</Button>
                            </Space>
                            <Space>
                                <Button onClick={() => handleEdit({ selectRowKeys, opreateType: 'moreEdit' })}>批量编辑</Button>
                                {!BUILD_APP_ENV && <Button onClick={handleBatchOption}>批量同步</Button>}
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
                title="删除提示"
                centered={true}
                visible={deleteVisible}
                onCancel={() => setDeleteVisible(false)}
                footer={[
                    <Button key="submit" onClick={() => handleDeleteTestServer(deleteObj.id)}>
                        确定删除
                    </Button>,
                    <Button key="back" type="primary" onClick={() => setDeleteVisible(false)}>
                        取消
                    </Button>
                ]}
                width={600}
                maskClosable={false}
            >
                <div style={{ color: 'red', marginBottom: 5 }}>
                    <ExclamationCircleOutlined style={{ marginRight: 4 }} />
                    已有模板配置了该机器，删除机器后对应的测试机配置会自动改为随机，请谨慎删除！！
                </div>
                <div style={{ color: '#1890FF', cursor: 'pointer' }} onClick={handleDetail}>查看引用详情</div>
            </Modal>
            <Modal
                title="删除提示"
                centered={true}
                visible={deleteDefault}
                onCancel={() => setDeleteDefault(false)}
                footer={[
                    <Button key="submit" onClick={() => handleDeleteTestServer(deleteObj.id)}>
                        确定删除
                    </Button>,
                    <Button key="back" type="primary" onClick={() => setDeleteDefault(false)}>
                        取消
                    </Button>
                ]}
                width={300}
            >
                <div style={{ color: 'red', marginBottom: 5 }}>
                    <ExclamationCircleOutlined style={{ marginRight: 4, verticalAlign: 'middle' }} />
                    确定要删除吗？
                </div>
            </Modal>
            <SelectVmServer ref={selectVmServerList} onOk={getTestServerList} />
        </Spin>
    )
}


export default memo(forwardRef(Standalone))