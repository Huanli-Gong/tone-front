import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button, Pagination, Space, Popconfirm, Tag, message, Tooltip, Tabs, Modal, Row } from 'antd';
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
import AloneMachine from './AloneMachine'
import { StateBadge } from '../../GroupManage/Components'
import { cloudList, delCloud, stateRefresh } from '../service';
import { queryServerDel } from '../../GroupManage/services'
import CloudDetail from './CloudDetail'
import styles from './style.less';
import ResizeTable from '@/components/ResizeTable';
import { useParams, useIntl, FormattedMessage, getLocale } from 'umi'
import _ from 'lodash'
import { requestCodeMessage, AccessTootip } from '@/utils/utils';
import SelectDropSync from '@/components/Public/SelectDropSync';
import { Access, useAccess } from 'umi'
import SelectCheck from '@/pages/WorkSpace/TestSuiteManage/components/SelectCheck'
import SelectRadio from '@/components/Public/SelectRadio';
import OverflowList from '@/components/TagOverflow/index'

// import PermissionTootip from '@/components/Public/Permission/index';
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
    const [loading, setLoading] = useState<boolean>(false)
    const [btnLoad, setBtnLoad] = useState<boolean>(false)
    const [data, setData] = useState<any>({ data: [] });
    const [params, setParams] = useState<MachineParams>({
        type: '0',
        page_num: 1,
        page_size: 10,
    })
    const [total, setTotal] = useState(0)
    const [deleteVisible, setDeleteVisible] = useState(false);
    const [deleteDefault, setDeleteDefault] = useState(false);
    const [deleteObj, setDeleteObj] = useState<any>({});
    const [autoFocus, setFocus] = useState<boolean>(true)
    const [tableColumns, setTableColumns] = useState<any>([])
    const logDrawer: any = useRef()
    const deployModal: any = useRef(null);
    const viewDetailRef: any = useRef(null)

    const inputFilterCommonFields = (dataIndex: string) => ({
        filterDropdown: ({ confirm }: any) => (
            <SearchInput
                confirm={confirm}
                onConfirm={(val: string) => setParams({ ...params, page_num: 1, [dataIndex]: dataIndex === 'private_ip' ? val.trim() : val })}
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
                onConfirm={(val: any) => setParams({ ...params, [dataIndex]: val, page_num: 1 })}
            />
        ),
    })

    const radioFilterCommonFields = (dataIndex: string, list: any[]) => ({
        filterIcon: () => <FilterFilled style={{ color: !isEmpty(params[dataIndex]) ? '#1890ff' : undefined }} />,
        filterDropdown: ({ confirm }: any) => (
            <SelectRadio
                list={list}
                confirm={confirm}
                onConfirm={(val: any) => setParams({ ...params, [dataIndex]: val, page_num: 1 })}
            />
        ),
    })
    const paramTransform = (val:any) => {
        const dict = {
            0: formatMessage({id: 'operation.not.release'}),
            1: formatMessage({id: 'operation.release'}),
            2: formatMessage({id: 'device.failed.save'})
        }
        return dict[val] || ''
    }
    useEffect(() => {
        let columns: any = [
            {
                title: params.type == '0' ? <FormattedMessage id="device.config.name"/>: <FormattedMessage id="device.instance.name"/>,
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
            {
                title: 'IP',
                dataIndex: 'private_ip', // private_ip
                width: params.type == '0' ? 0 : 140,
                ...inputFilterCommonFields("private_ip"),
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
            {
                title: 'SN',
                dataIndex: 'sn',
                ...inputFilterCommonFields("sn"),
                width: params.type == '0' ? 0 : 140,
                ellipsis: {
                    showTitle: false
                },
                render: (_: any, row: any) => <EllipsisPulic title={row.sn} />
            },
            BUILD_APP_ENV && {
                title: 'TSN',
                dataIndex: 'tsn',
                width: params.type == '0' ? 0 : 140,
                ellipsis: {
                    showTitle: false
                },
                render: (_: any, row: any) => <EllipsisPulic title={row.tsn} />
            },
            {
                title: 'InstanceId',
                dataIndex: 'instance_id',
                ...inputFilterCommonFields("instance_id"),
                width: params.type == '0' ? 0 : 140,
                ellipsis: {
                    showTitle: false
                },
                render: (_: any, row: any) => <EllipsisPulic title={row.instance_id} />
            },
            {
                title: <FormattedMessage id="device.manufacturer/ak"/>,
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
                title: <FormattedMessage id="device.instance_type"/>,
                width: enLocale ? 160: 110,
                dataIndex: 'instance_type',
                ...inputFilterCommonFields("instance_type"),
                ellipsis: {
                    showTitle: false
                },
                render: (_: any, row: any) => <EllipsisPulic title={row.instance_type} />
            },
            {
                title: <FormattedMessage id="device.image"/>,
                dataIndex: 'image',
                ...inputFilterCommonFields("image"),
                width: 160,
                ellipsis: {
                    showTitle: false
                },
                render: (_: any, row: any) => <EllipsisPulic title={row.image} />
            },
            {
                title: <FormattedMessage id="device.bandwidth"/>,
                width: enLocale ? 120: 70,
                ...inputFilterCommonFields("bandwidth"),
                dataIndex: 'bandwidth',
                ellipsis: {
                    showTitle: false
                },
            },
            {
                title: <FormattedMessage id="device.storage_type"/>,
                ...selectFilterCommonFields(
                    "storage_type",
                    [
                        ["cloud", formatMessage({id: 'device.cloud'})],
                        ["cloud_efficiency", formatMessage({id: 'device.cloud_efficiency'})],
                        ["cloud_ssd", formatMessage({id: 'device.cloud_ssd'})],
                        ["cloud_essd", formatMessage({id: 'device.cloud_essd'})],
                    ].map(i => ({ id: i[0], name: i[1] }))
                ),
                dataIndex: 'storage_type',
                width: enLocale ? 130: 90,
                ellipsis: {
                    showTitle: false
                },
                render: (_: any, row: any) => <DataSetPulic name={row.storage_type} formatMessage={formatMessage}/>
            },
            {
                title: <FormattedMessage id="device.release_rule"/>,
                align: 'center',
                ...radioFilterCommonFields("release_rule", [{ id: 0, name: formatMessage({id: 'operation.not.release'}) }, { id: 1, name: formatMessage({id: 'operation.release'}) }, { id: 2, name: formatMessage({id: 'device.failed.save'}) }]),
                dataIndex: 'release_rule',
                width: enLocale ? 150: 110,
                ellipsis: {
                    showTitle: false
                },
                render: (_: any, row: any) => <div>{paramTransform(row.release_rule)}</div>
            },
            {
                title: <FormattedMessage id="device.console_conf"/>,
                width: enLocale ? 170: 100,
                dataIndex: 'console_conf',
                ellipsis: {
                    showTitle: false
                },
                render: (_: any, row: any) => <EllipsisPulic title={_} />
            },
            {
                title: <FormattedMessage id="device.channel_type"/>,
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
                        onConfirm={(channel_type: any) => setParams({ ...params, channel_type, page_num: 1 })}
                    />
                ),
            },
            {
                title: <><FormattedMessage id="device.usage.state"/> <Tooltip title={formatMessage({id: 'device.usage.state.Tooltip'})}><QuestionCircleOutlined /></Tooltip></>,
                dataIndex: 'state',
                width: params.type == '0' ? 0 : (enLocale ? 150: 120),
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
                        tabType={params.type}
                        dataArr={['Available', 'Occupied', 'Broken', 'Reserved']}
                    />
                )
            },
            {
                title: <><FormattedMessage id="device.real_state"/> <Tooltip title={formatMessage({id: 'device.real_state.Tooltip'})}><QuestionCircleOutlined /></Tooltip></>,
                width: params.type == '0' ? 0 : (enLocale ? 150: 120),
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
                        tabType={params.type}
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
                        onConfirm={(val: number) => { setParams({ ...params, page_num: 1, owner: val }) }}
                    />,
            },
            {
                title: <FormattedMessage id="device.tag"/>,
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
                        onConfirm={(val: number) => { setParams({ ...params, page_num: 1, tags: val }) }}
                    />,
                render: (_: any, row: any) => (
                    <OverflowList list={row.tag_list.map((item: any, index: number) => {
                        return <Tag color={item.tag_color} key={index}>{item.name}</Tag>
                    })} />
                )
            },
            {
                title: <FormattedMessage id="device.description"/>,
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
                title: <FormattedMessage id="Table.columns.operation"/>,
                fixed: 'right',
                valueType: 'option',
                dataIndex: 'id',
                width: params.type == '0' ? 180 : (enLocale ? 380: 310),
                ellipsis: {
                    showTitle: false
                },
                render: (_: any, row: any) =>
                    <Space>
                        <Button type="link" style={{ padding: 0, height: 'auto' }} onClick={() => viewDetailRef.current.show(row, params.type)}><FormattedMessage id="operation.detail"/></Button>
                        <Access
                            accessible={access.WsMemberOperateSelf(row.owner)}
                            fallback={
                                <Space>
                                    {BUILD_APP_ENV && String(params.type) !== '0' && <Button type="link" style={{ padding: 0, height: 'auto' }} onClick={() => AccessTootip()}><FormattedMessage id="device.synchronization.state"/></Button>}
                                    <Button type="link" style={{ padding: 0, height: 'auto' }} onClick={() => AccessTootip()} ><FormattedMessage id="operation.edit"/></Button>
                                    {String(params.type) !== '0' && <Button type="link" style={{ padding: 0, height: 'auto' }} onClick={() => AccessTootip()}><FormattedMessage id="device.deploy"/></Button>}
                                    {String(params.type) !== '0' && <Button type="link" style={{ padding: 0, height: 'auto' }} onClick={() => AccessTootip()}><FormattedMessage id="operation.delete"/></Button>}
                                    <Button type="link" style={{ padding: 0, height: 'auto' }} onClick={() => AccessTootip()}>{params.type === '0' ? <FormattedMessage id="operation.delete"/>: <FormattedMessage id="operation.release"/>}</Button>
                                </Space>
                            }
                        >
                            <Space>
                                {BUILD_APP_ENV && String(params.type) !== '0' && <Button type="link" style={{ padding: 0, height: 'auto' }} onClick={() => handleRefresh(row)}><FormattedMessage id="device.synchronization.state"/></Button> }
                                <Button type="link" style={{ padding: 0, height: 'auto' }} onClick={() => { editMachine(row) }} ><FormattedMessage id="operation.edit"/></Button>
                                {String(params.type) !== '0' && <Button type="link" style={{ padding: 0, height: 'auto' }} onClick={() => deployClick(row)}><FormattedMessage id="device.deploy"/></Button>}
                                {String(params.type) !== '0' && <Button type="link" style={{ padding: 0, height: 'auto' }} onClick={() => handleDelServer({ ...row }, false)}><FormattedMessage id="operation.delete"/></Button>}
                                <Button type="link" style={{ padding: 0, height: 'auto' }} onClick={() => handleDelServer({ ...row }, String(params.type) !== '0')}>{params.type === '0' ? <FormattedMessage id="operation.delete"/>: <FormattedMessage id="operation.release"/>}</Button>
                            </Space>
                        </Access>
                        <Button type="link" style={{ padding: 0, height: 'auto' }} onClick={() => handleOpenLogDrawer(row.id)}><FormattedMessage id="operation.log"/></Button>
                    </Space>,
            },
        ].filter(Boolean)
        setTableColumns(columns.reduce((p: any, c: any) => c.width ? p.concat(c) : p, []))
    }, [params, enLocale])

    // 部署Agent
    const deployClick = (row: any) => {
        deployModal.current?.show({ ...row, detailData: [row.private_ip] || [], radio_type: 'cloudManage' });
    }
    // 部署回调
    const deployCallback = (info: any) => {
        // case1. 部署结果信息
    }
    // console.log('columns',columns)
    const handleOpenLogDrawer = useCallback(
        (id) => {
            logDrawer.current.show(id)
        }, []
    )
    const handlePage = (page_num: number, page_size: any) => {
        setParams({ ...params, page_num: page_num, page_size: page_size })
    }
    const getList = async () => {
        const { type, name } = params
        const obj = {
            ...params,
            is_instance: !!(type - 0),
            server_conf: name,
        }
        setLoading(true)
        setData({ data: [] })
        const data: any = await cloudList({ ...obj, ws_id })
        data && setData(data)
        setTotal(data.total)
        setLoading(false)
    };
    const removeCloud = _.debounce(
        async (id: number, is_release: boolean) => {
            setBtnLoad(true)
            let data = { ws_id, is_release }
            const res = await delCloud(id, data)
            setBtnLoad(false)
            if (res.code == 200) {
                setParams({ ...params, page_num: Math.round((total - 1) / params.page_size) || 1 })
                message.success(formatMessage({id: 'operation.success'}) );
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
            //setRefresh(!refresh)
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
            message.success(formatMessage({id: 'device.synchronization.state.success'}) )
            getList()
        }
        else requestCodeMessage(code, msg)
    }

    const handleDetail = () => {
        window.open(`/ws/${ws_id}/refenerce/6/?name=${deleteObj.name}&id=${deleteObj.id}`)
    }
    useEffect(() => {
        getList()
    }, [params]);

    const RadioChange = (val: any) => {
        setParams({
            type: val,
            page_num: 1,
            page_size: 10,
        })
    }
    const addMachine = () => {
        aloneMachine.current?.newMachine()
    }

    const editMachine = (row: any) => {
        aloneMachine.current?.editMachine(row)
    }
    const onSuccess = (is_instance: any, id: number) => {
        if (params.type == is_instance) {
            getList()
        } else {
            setParams({ ...params, type: is_instance ? '1' : '0' })
        }
    }

    const localeStr = deleteObj[params.type == '0' ? "name" : !BUILD_APP_ENV ? "pub_ip" : "private_ip"]

    return (
        <div className={styles.warp}>
            <Tabs
                type="card"
                //tab={type}
                onTabClick={RadioChange}
                tabBarExtraContent={
                    <Button type="primary" onClick={addMachine}>
                        {params.type == '0' ? <FormattedMessage id="device.add.server.config"/>: <FormattedMessage id="device.add.server.instance"/>}
                    </Button>
                }
            >
                <Tabs.TabPane tab={<FormattedMessage id="device.server.config"/>} key={'0'} />
                <Tabs.TabPane tab={<FormattedMessage id="device.server.instance"/>} key={'1'} />
            </Tabs>

            {!!data.data.length && <ResizeTable
                loading={loading}
                size={'small'}
                scroll={{
                    // x: tableColumns.reduce((p: any, c: any) => p += c.width, 0),///type - 0 === 0 ? 1910 : 2190,
                    // y: windowHeight - 50 - 66 - 30 - 20
                    x: "100%",
                }}
                columns={tableColumns}
                dataSource={data.data}
                rowKey={'id'}
                pagination={false}
            />}

            <div className={!loading ? styles.pagination : styles.hidden} >
                <div className={data.total == 0 ? styles.hidden : ''} >
                    {formatMessage({id: 'pagination.total.strip'}, {data: data.total})}
                </div>
                <Pagination
                    className={data.total == 0 ? styles.hidden : ''}
                    showQuickJumper
                    showSizeChanger
                    current={params.page_num}
                    defaultCurrent={1}
                    onChange={(page_num: number, page_size: any) => handlePage(page_num, page_size)}
                    onShowSizeChange={(page_num: number, page_size: any) => handlePage(page_num, page_size)}
                    total={data.total}
                />
            </div>
            <Log ref={logDrawer} operation_object="machine_cloud_server" />
            <AloneMachine
                onRef={aloneMachine}
                run_mode={'standalone'}
                type={params.type}
                onSuccess={onSuccess}
            />
            <DeployModal ref={deployModal} callback={deployCallback} />
            <CloudDetail ref={viewDetailRef} />
            <Modal
                title={<div><FormattedMessage id={params.type ? 'device.tips': 'delete.tips'}/></div>}
                centered={true}
                visible={deleteVisible}
                onCancel={() => setDeleteVisible(false)}
                footer={[
                    <Button key="submit" onClick={() => removeCloud(deleteObj.id, deleteObj.is_release)} loading={btnLoad}>
                        {params.type && <FormattedMessage id={deleteObj.is_release ? 'operation.release' : 'operation.confirm.delete'}/> }
                    </Button>,
                    <Button key="back" type="primary" onClick={() => setDeleteVisible(false)}>
                        <FormattedMessage id="operation.cancel"/>
                    </Button>
                ]}
                width={600}
                maskClosable={false}
            >
                <div style={{ color: 'red', marginBottom: 5 }}>
                    <ExclamationCircleOutlined style={{ marginRight: 4 }} />
                    <FormattedMessage id="device.delete.tips"/>
                </div>
                <div style={{ color: '#1890FF', cursor: 'pointer' }} onClick={handleDetail}><FormattedMessage id="view.quote.details"/></div>
            </Modal>
            <Modal
                title={<div><FormattedMessage id={params.type === '0' ? 'delete.tips': 'device.tips'}/></div> }
                centered={true}
                visible={deleteDefault}
                onCancel={() => setDeleteDefault(false)}
                footer={[
                    <Button key="submit" type={"danger" as any} onClick={() => removeCloud(deleteObj.id, deleteObj.is_release)} loading={btnLoad} >
                        {params.type == '0' || !deleteObj.is_release ? <FormattedMessage id="operation.confirm.delete"/> : <FormattedMessage id="operation.release"/>}
                    </Button>,
                    <Button key="back" onClick={() => setDeleteDefault(false)}>
                        <FormattedMessage id="operation.cancel"/>
                    </Button>
                ]}
                width={"30%"}
            >
                <div style={{ color: 'red', marginBottom: 5 }}>
                    <Row align="middle">
                        <ExclamationCircleOutlined style={{ marginRight: 4, verticalAlign: 'middle' }} />
                        <div> 
                            {((params.type === '0' || !deleteObj.is_release) && params.type === '0') ? 
                                formatMessage({id: 'device.delete.config'}, {data: localeStr}) : null
                            }
                            {((params.type === '0' || !deleteObj.is_release) && params.type !== '0') ? 
                                formatMessage({id: 'device.delete.instance'}, {data: localeStr}) : null
                            }
                            {(!(params.type === '0' || !deleteObj.is_release) && params.type === '0') ? 
                                formatMessage({id: 'device.release.config'}, {data: localeStr}) : null
                            }
                            {(!(params.type === '0' || !deleteObj.is_release) && params.type !== '0') ? 
                                formatMessage({id: 'device.release.instance'}, {data: localeStr}) : null
                            }
                        </div>
                    </Row>
                </div>
            </Modal>
        </div>
    )
}