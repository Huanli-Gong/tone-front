import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Button, Space, Tag, message, Tooltip, Tabs, Modal, Row } from 'antd';
import { FilterFilled, QuestionCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import EllipsisPulic from '@/components/Public/EllipsisPulic';
import DataSetPulic from '../DataSetPulic';
import Highlighter from 'react-highlight-words';
import DeployModal from '../../GroupManage/Standalone/Components/DeployModal'
import ServerLink from '@/components/MachineWebLink/index';
import SearchInput from '@/components/Public/SearchInput';
import SelectUser from '@/components/Public/SelectUser';
import SelectTags from '@/components/Public/SelectTags';
import Log from '@/components/Public/Log';
import AloneMachine from '../AddMachinePubilc/index'
import { StateBadge } from '../../GroupManage/Components'
import { cloudList, delCloud, stateRefresh } from '../service';
import { queryServerDel } from '../../GroupManage/services'
import CloudDetail from './CloudDetail'
import styles from './style.less';
import ResizeTable from '@/components/ResizeTable';
import { useParams, useIntl, FormattedMessage, getLocale } from 'umi'
import _ from 'lodash'
import { requestCodeMessage, AccessTootip, handlePageNum, useStateRef } from '@/utils/utils';
import SelectDropSync from '@/components/Public/SelectDropSync';
import { Access, useAccess } from 'umi'
import SelectCheck from '@/pages/WorkSpace/TestSuiteManage/components/SelectCheck'
import SelectRadio from '@/components/Public/SelectRadio';
import OverflowList from '@/components/TagOverflow/index';
import CommonPagination from '@/components/CommonPagination'

/**
 * 云上单机
 *
 */

interface MachineParams {
    type?: any,
    page_num: number,
    page_size: number,
    description?: string,
    name?: string,
    owner?: any,
    tags?: any,
    state?: string | undefined,
    real_state?: string | undefined;
    [k: string]: any;
}

const channelTypeList = agent_list.map((i: any) => ({ id: i.value, name: i.label }))

const isEmpty = (d: any) => {
    const t = Object.prototype.toString.call(d)
    return ['[object Null]', '[object Undefined]'].includes(t)
}

export default (props: any) => {
    const { formatMessage } = useIntl()
    const enLocale = getLocale() === 'en-US'
    const { ws_id }: any = useParams()
    const access = useAccess();
    const aloneMachine = useRef<any>(null)
    const [isInstance, setIsInstance] = useState<number>(0)
    const [loading, setLoading] = useState<boolean>(false)
    const [btnLoad, setBtnLoad] = useState<boolean>(false)
    const [data, setData] = useState<any>({});
    const [params, setParams] = useState<MachineParams>({ page_num: 1, page_size: 10 })
    const [deleteVisible, setDeleteVisible] = useState(false);
    const [deleteDefault, setDeleteDefault] = useState(false);
    const [deleteObj, setDeleteObj] = useState<any>({});
    const [autoFocus, setFocus] = useState<boolean>(true)
    const logDrawer: any = useRef()
    const deployModal: any = useRef(null);
    const viewDetailRef: any = useRef(null)
    const pageCurrent = useStateRef(params)

    const inputFilterCommonFields = (dataIndex: string) => ({
        filterDropdown: ({ confirm }: any) => (
            <SearchInput
                confirm={confirm}
                onConfirm={(val: string) => setParams({ ...params, [dataIndex]: dataIndex === 'private_ip' ? val.trim() : val })}
            />
        ),
        onFilterDropdownVisibleChange: (visible: any) => {
            if (visible) {
                setFocus(!autoFocus)
            }
        },
        filterIcon: () => <FilterFilled style={{ color: params[dataIndex] ? '#1890ff' : undefined }} />,
    })

    const selectFilterCommonFields = (dataIndex: string, list: any[]) => ({
        filterIcon: () => <FilterFilled style={{ color: params[dataIndex] ? '#1890ff' : undefined }} />,
        filterDropdown: ({ confirm }: any) => (
            <SelectCheck
                list={list}
                confirm={confirm}
                onConfirm={(val: any) => setParams({ ...params, [dataIndex]: val })}
            />
        ),
    })

    const radioFilterCommonFields = (dataIndex: string, list: any[]) => ({
        filterIcon: () => <FilterFilled style={{ color: !isEmpty(params[dataIndex]) ? '#1890ff' : undefined }} />,
        filterDropdown: ({ confirm }: any) => (
            <SelectRadio
                list={list}
                confirm={confirm}
                onConfirm={(val: any) => setParams({ ...params, [dataIndex]: val })}
            />
        ),
    })

    const getList = async () => {
        const { name } = params
        const obj = {
            ...params,
            is_instance: Boolean(+ isInstance),
            server_conf: name,
        }
        setLoading(true)
        const data: any = await cloudList({ ...obj, ws_id })
        data && setData(data)
        setLoading(false)
    };
    const totalCurrent = useStateRef(data)

    const paramTransform = (val: any) => {
        const dict = {
            0: formatMessage({ id: 'operation.not.release' }),
            1: formatMessage({ id: 'operation.release' }),
            2: formatMessage({ id: 'device.failed.save' })
        }
        return dict[val] || ''
    }

    const $insdance = + isInstance

    const tableColumns: any = useMemo(() => {
        return [{
            title: !$insdance ? <FormattedMessage id="device.config.name" /> : <FormattedMessage id="device.instance.name" />,
            dataIndex: 'name',
            width: 140,
            fixed: 'left',
            ellipsis: {
                showTitle: false
            },
            ...inputFilterCommonFields("name"),
            render: (_: any, row: any) => (
                <EllipsisPulic title={row.name}>
                    <Highlighter
                        highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                        searchWords={[params.name || '']}
                        autoEscape
                        textToHighlight={row.name.toString()}
                    />
                </EllipsisPulic>
            )
        },
        !!$insdance &&
        {
            title: 'IP',
            dataIndex: BUILD_APP_ENV ? 'private_ip' : "pub_ip", // private_ip
            width: 140,
            ...inputFilterCommonFields(BUILD_APP_ENV ? 'private_ip' : "pub_ip"),
            ellipsis: {
                showTitle: false
            },
            render: (text: any, row: any) => (
                <ServerLink
                    val={text}
                    param={row.id}
                    provider={"aliyun"}
                    machine_pool={true}
                />
            )
        },
        !!$insdance &&
        {
            title: 'SN',
            dataIndex: 'sn',
            ...inputFilterCommonFields("sn"),
            width: 140,
            ellipsis: {
                showTitle: false
            },
            render: (_: any, row: any) => <EllipsisPulic title={row.sn} />
        },
        (BUILD_APP_ENV && !!$insdance) && {
            title: 'TSN',
            dataIndex: 'tsn',
            width: 140,
            ellipsis: {
                showTitle: false
            },
            render: (_: any, row: any) => <EllipsisPulic title={row.tsn} />
        },
        !!$insdance &&
        {
            title: 'InstanceId',
            dataIndex: 'instance_id',
            ...inputFilterCommonFields("instance_id"),
            width: 140,
            ellipsis: {
                showTitle: false
            },
            render: (_: any, row: any) => <EllipsisPulic title={row.instance_id} />
        },
        {
            title: <FormattedMessage id="device.manufacturer/ak" />,
            dataIndex: 'manufacturer',
            ...inputFilterCommonFields("manufacturer_ak_name"),
            width: 160,
            ellipsis: {
                showTitle: false
            },
            render: (_: any, row: any) => <EllipsisPulic title={`${row.manufacturer}/${row.ak_name}`} />
        },
        {
            title: 'Region/Zone',
            width: 160,
            dataIndex: 'region',
            ...inputFilterCommonFields("region_zone"),
            ellipsis: {
                showTitle: false
            },
            render: (_: any, row: any) => <EllipsisPulic title={`${row.region}/${row.zone}`} />
        },
        {
            title: <FormattedMessage id="device.instance_type" />,
            width: enLocale ? 160 : 110,
            dataIndex: 'instance_type',
            ...inputFilterCommonFields("instance_type"),
            ellipsis: {
                showTitle: false
            },
            render: (_: any, row: any) => <EllipsisPulic title={row.instance_type} />
        },
        {
            title: <FormattedMessage id="device.image" />,
            dataIndex: 'image',
            ...inputFilterCommonFields("image"),
            width: 160,
            ellipsis: {
                showTitle: false
            },
            render: (_: any, row: any) => <EllipsisPulic title={row.image} />
        },
        {
            title: <FormattedMessage id="device.bandwidth" />,
            width: enLocale ? 120 : 70,
            ...inputFilterCommonFields("bandwidth"),
            dataIndex: 'bandwidth',
            ellipsis: {
                showTitle: false
            },
        },
        {
            title: <FormattedMessage id="device.storage_type" />,
            ...selectFilterCommonFields(
                "storage_type",
                [
                    ["cloud", formatMessage({ id: 'device.cloud' })],
                    ["cloud_efficiency", formatMessage({ id: 'device.cloud_efficiency' })],
                    ["cloud_ssd", formatMessage({ id: 'device.cloud_ssd' })],
                    ["cloud_essd", formatMessage({ id: 'device.cloud_essd' })],
                ].map(i => ({ id: i[0], name: i[1] }))
            ),
            dataIndex: 'storage_type',
            width: enLocale ? 130 : 90,
            ellipsis: {
                showTitle: false
            },
            render: (_: any, row: any) => <DataSetPulic name={row.storage_type} formatMessage={formatMessage} />
        },
        {
            title: <FormattedMessage id="device.release_rule" />,
            align: 'center',
            ...radioFilterCommonFields("release_rule", [{ id: 0, name: formatMessage({ id: 'operation.not.release' }) }, { id: 1, name: formatMessage({ id: 'operation.release' }) }, { id: 2, name: formatMessage({ id: 'device.failed.save' }) }]),
            dataIndex: 'release_rule',
            width: enLocale ? 150 : 110,
            ellipsis: {
                showTitle: false
            },
            render: (_: any, row: any) => <div>{paramTransform(row.release_rule)}</div>
        },
        {
            title: <FormattedMessage id="device.console_conf" />,
            width: enLocale ? 170 : 100,
            dataIndex: 'console_conf',
            ellipsis: {
                showTitle: false
            },
            render: (_: any, row: any) => <EllipsisPulic title={_} />
        },
        {
            title: <FormattedMessage id="device.channel_type" />,
            width: 100,
            ellipsis: {
                showTitle: false
            },
            dataIndex: 'channel_type',
            filterIcon: () => <FilterFilled style={{ color: params.channel_type ? '#1890ff' : undefined }} />,
            filterDropdown: ({ confirm }: any) => (
                <SelectCheck
                    list={channelTypeList}
                    confirm={confirm}
                    onConfirm={(channel_type: any) => setParams({ ...params, channel_type })}
                />
            ),
        },
        !!$insdance &&
        {
            title: <><FormattedMessage id="device.usage.state" /> <Tooltip title={formatMessage({ id: 'device.usage.state.Tooltip' })}><QuestionCircleOutlined /></Tooltip></>,
            dataIndex: 'state',
            width: (enLocale ? 150 : 120),
            ellipsis: {
                showTitle: false
            },
            render: (_: any, row: any) => StateBadge(_, row, ws_id),
            filterIcon: () => <FilterFilled style={{ color: params.state ? '#1890ff' : undefined }} />,
            filterDropdown: ({ confirm }: any) => (
                <SelectDropSync
                    confirm={confirm}
                    onConfirm={(val: string) =>
                        setParams({ ...params, state: val })}
                    stateVal={params.state}
                    tabType={$insdance}
                    dataArr={['Available', 'Occupied', 'Broken', 'Reserved']}
                />
            )
        },
        !!$insdance &&
        {
            title: <><FormattedMessage id="device.real_state" /> <Tooltip title={formatMessage({ id: 'device.real_state.Tooltip' })}><QuestionCircleOutlined /></Tooltip></>,
            width: (enLocale ? 150 : 120),
            ellipsis: {
                showTitle: false
            },
            dataIndex: 'real_state',
            render: (_: any, row: any) => StateBadge(_, row, ws_id),
            filterIcon: () => <FilterFilled style={{ color: params.real_state ? '#1890ff' : undefined }} />,
            filterDropdown: ({ confirm }: any) => (
                <SelectDropSync
                    confirm={confirm}
                    onConfirm={(val: string) =>
                        setParams({ ...params, real_state: val })}
                    stateVal={params.real_state}
                    tabType={$insdance}
                    dataArr={['Available', 'Broken']}
                />
            )
        },
        {
            title: 'Owner',
            width: 120,
            dataIndex: 'owner_name',
            ellipsis: {
                showTitle: false
            },
            filterIcon: () => <FilterFilled style={{ color: params.owner ? '#1890ff' : undefined }} />,
            filterDropdown: ({ confirm }: any) =>
                <SelectUser
                    confirm={confirm}
                    onConfirm={(val: number) => { setParams({ ...params, owner: val }) }}
                />,
        },
        {
            title: <FormattedMessage id="device.tag" />,
            dataIndex: 'tags',
            width: 140,
            ellipsis: {
                showTitle: false
            },
            filterIcon: () => <FilterFilled style={{ color: params.tags && params.tags?.length > 0 ? '#1890ff' : undefined }} />,
            filterDropdown: ({ confirm }: any) =>
                <SelectTags
                    ws_id={ws_id}
                    run_mode={'standalone'}
                    autoFocus={autoFocus}
                    confirm={confirm}
                    onConfirm={(val: number) => { setParams({ ...params, tags: val }) }}
                />,
            render: (_: any, row: any) => (
                <OverflowList list={row.tag_list.map((item: any, index: number) => {
                    return <Tag color={item.tag_color} key={index}>{item.name}</Tag>
                })} />
            )
        },
        {
            title: <FormattedMessage id="device.description" />,
            width: 140,
            dataIndex: 'description',
            ...inputFilterCommonFields("description"),
            ellipsis: {
                showTitle: false
            },
            render: (_: any, row: any) => (
                <EllipsisPulic title={row.description} >
                    <Highlighter
                        highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                        searchWords={[params.description || '']}
                        autoEscape
                        textToHighlight={row.description ? row.description.toString() : '-'}
                    />
                </EllipsisPulic>
            )
        },
        {
            title: <FormattedMessage id="Table.columns.operation" />,
            fixed: 'right',
            valueType: 'option',
            dataIndex: 'id',
            width: !$insdance ? 180 : (enLocale ? 380 : 310),
            ellipsis: {
                showTitle: false
            },
            render: (_: any, row: any) =>
                <Space>
                    <Button type="link" style={{ padding: 0, height: 'auto' }} onClick={() => viewDetailRef.current.show(row, $insdance)}><FormattedMessage id="operation.detail" /></Button>
                    <Access
                        accessible={access.WsMemberOperateSelf(row.owner)}
                        fallback={
                            <Space>
                                {BUILD_APP_ENV && !!$insdance && <Button type="link" style={{ padding: 0, height: 'auto' }} onClick={() => AccessTootip()}><FormattedMessage id="device.synchronization.state" /></Button>}
                                <Button type="link" style={{ padding: 0, height: 'auto' }} onClick={() => AccessTootip()} ><FormattedMessage id="operation.edit" /></Button>
                                {(!!$insdance) && <Button type="link" style={{ padding: 0, height: 'auto' }} onClick={() => AccessTootip()}><FormattedMessage id="device.deploy" /></Button>}
                                {(!!$insdance) && <Button type="link" style={{ padding: 0, height: 'auto' }} onClick={() => AccessTootip()}><FormattedMessage id="operation.delete" /></Button>}
                                <Button type="link" style={{ padding: 0, height: 'auto' }} onClick={() => AccessTootip()}>
                                    {(!$insdance) ? <FormattedMessage id="operation.delete" /> : <FormattedMessage id="operation.release" />}
                                </Button>
                            </Space>
                        }
                    >
                        <Space>
                            {(BUILD_APP_ENV && !!$insdance) && <Button type="link" style={{ padding: 0, height: 'auto' }} onClick={() => handleRefresh(row)}><FormattedMessage id="device.synchronization.state" /></Button>}
                            <Button type="link" style={{ padding: 0, height: 'auto' }} onClick={() => { editMachine(row) }} ><FormattedMessage id="operation.edit" /></Button>
                            {(!!$insdance) && <Button type="link" style={{ padding: 0, height: 'auto' }} onClick={() => deployClick(row)}><FormattedMessage id="device.deploy" /></Button>}
                            {(!!$insdance) && <Button type="link" style={{ padding: 0, height: 'auto' }} onClick={() => handleDelServer({ ...row }, false)}><FormattedMessage id="operation.delete" /></Button>}
                            <Button type="link" style={{ padding: 0, height: 'auto' }} onClick={() => handleDelServer({ ...row }, !!$insdance)}>
                                {(!$insdance) ? <FormattedMessage id="operation.delete" /> : <FormattedMessage id="operation.release" />}
                            </Button>
                        </Space>
                    </Access>
                    <Button type="link" style={{ padding: 0, height: 'auto' }} onClick={() => handleOpenLogDrawer(row.id)}><FormattedMessage id="operation.log" /></Button>
                </Space>,
        },
        ].filter(Boolean)
    }, [params, $insdance, enLocale])

    // 部署Agent
    const deployClick = (row: any) => {
        deployModal.current?.show({ ...row, detailData: [row.private_ip] || [], radio_type: 'cloudManage' });
    }
   
    const handleOpenLogDrawer = useCallback(
        (id) => {
            logDrawer.current.show(id)
        }, []
    )
   
    const removeCloud = _.debounce(
        async (id: number, is_release: boolean) => {
            setBtnLoad(true)
            const { page_size } = pageCurrent.current
            let obj = { ws_id, is_release }
            const res = await delCloud(id, obj)
            if (res.code == 200) {
                setParams({ ...params, page_num: handlePageNum(pageCurrent, totalCurrent), page_size})
                message.success(formatMessage({ id: 'operation.success' }));
                setDeleteVisible(false)
                setDeleteDefault(false)
            } else {
                requestCodeMessage(res.code, res.msg)
                setTimeout(() => {
                    setDeleteVisible(false)
                    setDeleteDefault(false)
                }, 300);
            }
            setBtnLoad(false)
        }, 300
    )

    const handleDelServer = async (row: any, type: boolean) => {
        setDeleteObj({ ...row, is_release: type })
        const data = await queryServerDel({ server_id: row.id, run_mode: 'standalone', server_provider: 'aliyun' })
        if (data.data.length > 0) {
            setDeleteVisible(true)
        } else {
            setDeleteDefault(true)
        }
    }

    const handleRefresh = async (row: any) => {
        const { code, msg } = await stateRefresh({ server_id: row.id, server_provider: 'aliyun' })
        if (code === 200) {
            message.success(formatMessage({ id: 'device.synchronization.state.success' }))
            getList()
        }
        else requestCodeMessage(code, msg)
    }

    const handleDetail = () => {
        window.open(`/ws/${ws_id}/refenerce/6/?name=${deleteObj.name}&id=${deleteObj.id}`)
    }
    useEffect(() => {
        getList()
    }, [params, isInstance]);

    const RadioChange = (val: any) => {
        setIsInstance(val)
        setParams({ ...params, page_num: 1 })
    }
    const addMachine = () => {
        aloneMachine.current?.newMachine(undefined)
    }

    const editMachine = (row: any) => {
        aloneMachine.current?.editMachine(row)
    }
    const onSuccess = (is_instance: any, id: number) => {
        if ($insdance == is_instance) {
            getList()
        } else {
            setParams({ ...params, is_instance })
        }
    }

    const localeStr = deleteObj[!$insdance ? "name" : !BUILD_APP_ENV ? "pub_ip" : "private_ip"]
    
    return (
        <div className={styles.warp}>
            <Tabs
                type="card"
                onTabClick={RadioChange}
                tabBarExtraContent={
                    <Button type="primary" onClick={addMachine}>
                        {(!$insdance) ? <FormattedMessage id="device.add.server.config" /> : <FormattedMessage id="device.add.server.instance" />}
                    </Button>
                }
            >
                <Tabs.TabPane tab={<FormattedMessage id="device.server.config" />} key={0} />
                <Tabs.TabPane tab={<FormattedMessage id="device.server.instance" />} key={1} />
            </Tabs>
            <ResizeTable
                size={'small'}
                key={tableColumns}
                loading={loading}
                scroll={{ x: "100%" }}
                columns={tableColumns}
                dataSource={data.data}
                rowKey={'id'}
                pagination={false}
            />
            {
                <CommonPagination
                    total={data.total}
                    pageSize={params.page_size}
                    currentPage={params.page_num}
                    onPageChange={
                        (page_num:any, page_size:any) => {
                            setParams({ ...params, page_num, page_size })
                        }
                    }
                />
            }
            <Log ref={logDrawer} operation_object="machine_cloud_server" />
            <AloneMachine
                onRef={aloneMachine}
                is_instance={$insdance}
                onSuccess={onSuccess}
                type='standalone'
            />
            <DeployModal ref={deployModal} />
            <CloudDetail ref={viewDetailRef} />
            <Modal
                title={<div><FormattedMessage id={!$insdance ? 'device.tips' : 'delete.tips'} /></div>}
                centered={true}
                visible={deleteVisible}
                onCancel={() => setDeleteVisible(false)}
                footer={[
                    <Button key="submit" onClick={() => removeCloud(deleteObj.id, deleteObj.is_release)} loading={btnLoad}>
                        {!$insdance && <FormattedMessage id={deleteObj.is_release ? 'operation.release' : 'operation.confirm.delete'} />}
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
                <div style={{ color: '#1890FF', cursor: 'pointer' }} onClick={handleDetail}><FormattedMessage id="view.quote.details" /></div>
            </Modal>
            <Modal
                title={<div><FormattedMessage id={!$insdance ? 'delete.tips' : 'device.tips'} /></div>}
                centered={true}
                visible={deleteDefault}
                onCancel={() => setDeleteDefault(false)}
                footer={[
                    <Button key="submit" type={"danger" as any} onClick={() => removeCloud(deleteObj.id, deleteObj.is_release)} loading={btnLoad} >
                        {!$insdance || !deleteObj.is_release ? <FormattedMessage id="operation.confirm.delete" /> : <FormattedMessage id="operation.release" />}
                    </Button>,
                    <Button key="back" onClick={() => setDeleteDefault(false)}>
                        <FormattedMessage id="operation.cancel" />
                    </Button>
                ]}
                width={"30%"}
            >
                <div style={{ color: 'red', marginBottom: 5 }}>
                    <Row align="middle">
                        <ExclamationCircleOutlined style={{ marginRight: 4, verticalAlign: 'middle' }} />
                        <div>
                            {((!$insdance || !deleteObj.is_release) && !$insdance) ?
                                formatMessage({ id: 'device.delete.config' }, { data: localeStr }) : null
                            }
                            {((!$insdance || !deleteObj.is_release) && !!$insdance) ?
                                formatMessage({ id: 'device.delete.instance' }, { data: localeStr }) : null
                            }
                            {(!(!$insdance || !deleteObj.is_release) && !$insdance) ?
                                formatMessage({ id: 'device.release.config' }, { data: localeStr }) : null
                            }
                            {(!(!$insdance || !deleteObj.is_release) && !!$insdance) ?
                                formatMessage({ id: 'device.release.instance' }, { data: localeStr }) : null
                            }
                        </div>
                    </Row>
                </div>
            </Modal>
        </div>
    )
}