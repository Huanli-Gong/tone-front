import React, { useCallback, useState, useEffect, useImperativeHandle, useMemo, useRef } from 'react'
import { Form, Col, Radio, Row, Select, Input, Tag, InputNumber, Space, Badge, Typography, Tooltip  } from 'antd'
import { standloneServerList, queryDispatchTags, checkIpAndSn, queryClusterServer, queryClusterStandaloneServer, queryClusterGroupServer } from './service';
import DeployModal from '@/pages/WorkSpace/DeviceManage/GroupManage/Standalone/Components/DeployModal'
import { tagRender, QusetionIconTootip, RenderSelectItems, filtersServerIp, filtersServerIp2, RenderSelectStateItems } from '../untils'
import styles from './style.less';
import _ from 'lodash'
import { useParams } from 'umi'

export default (props: any) => {
    const { ws_id } = useParams<any>()
    const {
        server_type, form, onChange, show, batch,
        run_mode, onRef, loading, setLoading, dataSource = {}, itemType, caseFrom
    } = props

    const [serverType, setServerType] = useState(1)
    const [serverObjectType, setServerObjectType] = useState<any>(null)
    const [hasChange, setHasChange] = useState(false)
    // 校验成功/失败的标识
    const [validate, setValidate] = useState<any>(undefined)
    const [mask, setMask] = useState(false)

    const [pageNum, setPageNum] = useState(1)
    const [tagPageNum, setTagPageNum] = useState(1)

    const [serverList, setServerList] = useState([])
    const PAGE_SIZE = 100
    const standaloneServerRequest = async (page_num = 1) => {
        const { data, code } = await standloneServerList({ ws_id, state: ['Available', 'Occupied', 'Reserved'], page_num, page_size: PAGE_SIZE }) //, page_size : 2
        if (code === 200 && data) setServerList(serverList.concat(data))
    }

    const [clusterServer, setClusterServer] = useState<any>([])
    const clusterServerRequest = async (page_num = 1) => {
        const { data, code } = await queryClusterServer({ cluster_type: 'aligroup', ws_id, page_num, page_size: PAGE_SIZE })
        if (code === 200 && data) setClusterServer(clusterServer.concat(data))
    }

    const [clusterStandalone, setClusterStandlone] = useState<any>([])
    const clusterStandaloneRequest = async (page_num = 1) => {
        const { data, code } = await queryClusterStandaloneServer({ ws_id, page_num, page_size: PAGE_SIZE })
        if (code === 200 && data) setClusterStandlone(clusterStandalone.concat(data))
    }

    const [clusterGroup, setCLusterGroup] = useState<any>([])
    const clusterGroupRequest = async (page_num = 1) => {
        const { data, code } = await queryClusterGroupServer({ cluster_type: 'aliyun', ws_id, page_num, page_size: PAGE_SIZE })
        if (code === 200 && data) setCLusterGroup(clusterGroup.concat(data))
    }

    const [dispathTags, setDispathTags] = useState<any>([])
    const dispatchRequest = async (page_num = 1) => {
        const { data, code } = await queryDispatchTags({ ws_id, run_mode, run_environment: server_type, page_num, page_size: PAGE_SIZE })
        if (code === 200 && data) setDispathTags(dispathTags.concat(data))
    }

    /**
     * @author jpt 部署Agent对话框
     * @description 机器类型为：自持有机器、且channelType为'toneagent'选项，校验失败时，则可以进行部署Agent。
     **/ 
    const [validateMsg, setValidateMsg] = useState<any>('');
    const deployModal: any = useRef(null);
    // 部署Agent
    const deployClick = (selectedRow: any) => {
        deployModal?.current?.show({ detailData: selectedRow });
    }
    // 部署回调
    const deployCallback = (info: any) => {
        // step1.Agent部署结果信息
        const { success_servers= [], } = info;
        const successIps = success_servers?.map((item: any)=> item.ip);
        // step2.数据回填
        if (successIps?.length) {
            form.setFieldsValue({ custom_ip: successIps[0] })
            // 重置错误信息提示
            setValidate('success')
            setValidateMsg('')
        }
    }
    // toneAgent校验失败的内容提示
    const ValidateIps: React.FC<any> = ({ data, channelType }) => (
        <span>
            <span>{data.msg?.join(' ')}</span>
            {channelType == 'toneagent' && <span className={styles.btn_style} onClick={()=> deployClick(data?.errors || [])}>部署ToneAgent</span> }
        </span>
    )
    // 校验函数
    const handleCustomChannel = async (value: any) => {
        if (loading) return
        setLoading(true)
        const custom_ip = form.getFieldValue('custom_ip')
        const channel_type = value
        if (channel_type && custom_ip) {
            // 接口校验
            const { code, msg } = await checkIpAndSn({ ip: custom_ip, channel_type }) || {}
            if ( code === 200) {
                setValidate('success')
                setValidateMsg('')
            } else {
                setValidate('error')
                setValidateMsg(<ValidateIps data={{ msg, errors: [custom_ip] }} channelType={channel_type} />)
            }
        } else {
            setValidate('error')
            setValidateMsg(<ValidateIps data={{ msg: ['请输入IP/SN'] }} channelType={undefined} />)
        }
        setLoading(false)
    }
    // 失焦触发
    const handleCustomBlur = () => {
      const channel_type = form.getFieldValue('custom_channel')
      handleCustomChannel(channel_type)
    }



    useImperativeHandle(
        onRef, () => ({
            validataStatus: form.validateFields
        })
    )

    const queryServerList = async (page_num = 1) => {
        if (server_type === 'aligroup') {
            run_mode === 'cluster' ?
                await clusterServerRequest(page_num) :
                await standaloneServerRequest(page_num)
        }
        else { //aliyun
            run_mode === 'cluster' ?
                await clusterGroupRequest() :
                await clusterStandaloneRequest(page_num)
        }
    }

    const initialServerStatus = async () => {
        setLoading(true)
        await dispatchRequest()
        await queryServerList()
        setLoading(false)
    }

    useEffect(() => {
        if (!batch) {
            const { server_object_id, server_tag_id, customer_server, ip, is_instance } = dataSource
            if (customer_server) {
                const { custom_channel, custom_ip } = customer_server
                if (custom_ip && custom_channel) {
                    setServerType(2)
                    setServerObjectType(1)
                    form.setFieldsValue({ custom_ip, custom_channel })
                }
            }

            if (server_tag_id) {
                setServerType(1)
                setServerObjectType(3)
            }
            if (server_object_id) {
                setServerType(1)
                if (server_object_id === -1) {
                    setServerObjectType(1)
                }
                else {
                    setServerObjectType(2)
                }

                if (server_type === 'aliyun') {
                    if (is_instance === 0) setServerObjectType(5)
                    if (is_instance === 1) setServerObjectType(4)
                }
            }
            if (ip === '随机' || ip === '') setServerObjectType(1)
        }
    }, [batch, dataSource])

    const handleCloseInit = () => {
        setServerType(1)
        setServerObjectType(null)
        setValidate(undefined)
    }


    useEffect(() => {
        !show ? handleCloseInit() : initialServerStatus()
    }, [show])

    const handleServerTypeChange = useCallback(
        ({ target }) => {
            setServerType(target.value)
        },
        [ws_id],
    )

    const handleServerObjectTypeChange = useCallback(
        (value) => {
            setServerObjectType(value)
            setMask(false)
            form.setFieldsValue({ server_object_id: undefined })
        },
        [ws_id],
    )

    useEffect(() => {
        const server_object_id = form.getFieldValue('server_object_id')
        const server_tag_id = form.getFieldValue('server_tag_id')

        let is_instance = undefined
        if (serverObjectType === 4) is_instance = 1
        if (serverObjectType === 5) is_instance = 0
        let ip = '', tags = ''

        if (server_object_id)
            if (server_type === 'aligroup') {
                if (run_mode === 'cluster') {
                    ip = filtersServerIp(clusterServer, server_object_id, 'name')
                }
                else {
                    ip = filtersServerIp(serverList, server_object_id, 'ip')
                }
            }
            else {
                if (run_mode === 'cluster') {
                    ip = filtersServerIp(clusterGroup, server_object_id, 'name')
                }
                else {
                    // 机器名上没有拼接ip的，把ip拼接上
                    ip = filtersServerIp2(clusterStandalone, server_object_id, serverObjectType === 4 ? 'instance_name' : 'template_name')
                }
            }
        if (server_tag_id) {
            tags = server_tag_id.reduce((pre: any, cur: any, index: number) => {
                for (let len = dispathTags.length, i = 0; i < len; i++)
                    if (dispathTags[i].id === cur) {
                        return pre += `${dispathTags[i].name}${index + 1 < server_tag_id.length ? ',' : ''}`
                    }
                return ''
            }, '')
        }

        onChange({ serverType, serverObjectType, ip, tags, validate, is_instance })//
    }, [serverType, serverObjectType, hasChange, validate])//

    useEffect(() => {
        const { ip, is_instace } = dataSource
        if (ip) {
            onChange({
                serverType,
                serverObjectType,
                ip,
                tags: serverType === 1 && serverObjectType === 3 ? ip : null,
                validate,
                is_instace
            })
        }
    }, [serverType, serverObjectType])

    const handleValidataCustomIp = async (custom_ip: any) => {
        if (loading) return
        setLoading(true)
        const custom_channel = form.getFieldValue('custom_channel')
        if (custom_ip) {
            if (custom_channel) {
                const { code, msg } = await checkIpAndSn({ ws_id, ip: custom_ip, channel_type: custom_channel })
                setLoading(false)
                setValidate(code === 200 ? 'success' : 'error')
                return code === 200 ? '' : msg
            }
            setLoading(false)
            return ''
        } else {
            setLoading(false)
            setValidate('error')
            return '请输入IP/SN'
        }
    }

    const muiltipInfo = useMemo(() => {
        if (batch && caseFrom) {
            const { ip, custom_ip, repeat, server_tag_id, server_object_id, custom_channel, is_instance } = caseFrom
            const objectLen = server_object_id.length
            const tagLen = server_tag_id.length
            const customLen = custom_ip.length

            const random = ip.filter((i: any) => i === '随机')
            let mutiPool = (objectLen + tagLen + random.length) > 1
            let mutiServer = customLen > 1

            if (mutiServer || mutiPool) setMask(true)

            if (!mutiPool && !mutiServer) {
                setServerType(1)
                if (objectLen === 1) setServerObjectType(2)
                if (tagLen === 1) setServerObjectType(3)
                if (customLen === 1) {
                    custom_channel.length === 1 && form.setFieldsValue({ custom_channel: custom_channel[0] })
                    setServerType(2)
                }
                if (random.length === 1) setServerObjectType(1)
                if (is_instance.length === 1) {
                    if (is_instance[0] === 1) setServerObjectType(4)
                    if (is_instance[0] === 0) setServerObjectType(5)
                }
            }

            if (!mutiPool && mutiServer) setServerType(2)

            if (objectLen + tagLen + random.length >= 1 && customLen >= 1) {
                setMask(true)
                setServerType(1)
                setServerObjectType(null)
                mutiServer = true
                mutiPool = true
            }

            return {
                serverPool: mutiPool,
                selfServer: mutiServer,
                repeat: repeat.length > 1
            }
        }
        return { serverPool: false, selfServer: false, repeat: false }
    }, [caseFrom, batch])

    const handleHideMask = (s: string) => {
        setMask(false)
        if (s === 'pool') {
            setServerType(1)
            setServerObjectType(1)
        }
        else setServerType(2)
    }

    const handleServerPopupScroll = ({ target }: any) => { //server
        const { clientHeight, scrollHeight, scrollTop } = target
        if (clientHeight + scrollTop === scrollHeight) {
            setPageNum(pageNum + 1)
            queryServerList(pageNum + 1)
        }
    }

    const handleTagePopupScroll = ({ target }: any) => { //tag
        const { clientHeight, scrollHeight, scrollTop } = target
        if (clientHeight + scrollTop === scrollHeight) {
            setTagPageNum(tagPageNum + 1)
            dispatchRequest(tagPageNum + 1)
        }
    }

    return (
        <>
            {
                (server_type !== 'aliyun' && !mask) &&
                <Form.Item
                    label={
                        itemType === 'suite' ?
                            <QusetionIconTootip title="机器" desc="对选中Suite下所有Conf生效" /> :
                            '机器'
                    }
                    className={styles.drawer_padding}
                >
                    <Radio.Group value={serverType} onChange={handleServerTypeChange} >
                        <Radio value={1}>机器池</Radio>
                        <Radio value={2}>自持有机器</Radio>
                    </Radio.Group>
                </Form.Item>
            }
             
            {
                (mask && batch) &&
                <Form.Item className={styles.drawer_padding} label="机器" >
                    <label className="ant-radio-wrapper" onClick={() => handleHideMask('pool')}>
                        <span className="ant-radio ant-radio-checked">
                            <span className={`ant-radio-inner ${!muiltipInfo.serverPool ? styles.serverItemUnchecked : ''}`} style={{ borderColor: '#d9d9d9' }} />
                        </span>
                        <span>机器池</span>
                    </label>
                    <label className="ant-radio-wrapper" onClick={() => handleHideMask('self')}>
                        <span className="ant-radio ant-radio-checked">
                            <span className={`ant-radio-inner ${!muiltipInfo.selfServer ? styles.serverItemUnchecked : ''}`} style={{ borderColor: '#d9d9d9' }} />
                        </span>
                        <span>自持有机器</span>
                    </label>
                </Form.Item>
            }
            <Row
                style={{ marginBottom: 8 }}
                className={styles.drawer_padding}
                gutter={8}
            >
                {
                    serverType === 1 ?
                        <>
                            <Col span={10}>
                                <Select
                                    style={{ width: '100%' }}
                                    value={serverObjectType}
                                    onChange={handleServerObjectTypeChange}
                                    placeholder={muiltipInfo.serverPool ? '多个数值' : ''}
                                >
                                    <Select.Option value={1}>随机</Select.Option>
                                    {
                                        (server_type === 'aliyun' && run_mode === 'standalone') ?
                                            <>
                                                <Select.Option value={4}>指定机器实例</Select.Option>
                                                <Select.Option value={5}>指定机器配置</Select.Option>
                                            </> :
                                            <Select.Option value={2}>指定</Select.Option>
                                    }
                                    <Select.Option value={3}>标签</Select.Option>
                                </Select>
                            </Col>
                            <Col span={14}>
                                <Form.Item noStyle>
                                    {(serverObjectType === 1 || !serverObjectType) &&
                                        <Input
                                            style={{ width: '100%' }}
                                            autoComplete="off"
                                            disabled={true}
                                            placeholder="随机从机器池调度机器"
                                        />
                                    }
                                    {serverObjectType === 2 &&
                                        <>
                                            <Form.Item name="server_object_id" rules={[{ required: true, message: '请选择机器' }]}>
                                                <Select
                                                    allowClear
                                                    style={{ width: '100%' }}
                                                    placeholder="请选择机器"
                                                    onChange={() => setHasChange(!hasChange)}
                                                    showSearch
                                                    optionFilterProp="children"
                                                    // listHeight={ 50 }
                                                    onPopupScroll={handleServerPopupScroll}
                                                    filterOption={(input, option: any) =>
                                                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                                    }
                                                >
                                                    {server_type === 'aliyun' ?
                                                        <>
                                                            {
                                                                run_mode === 'standalone' &&
                                                                RenderSelectItems(clusterStandalone, 'instance_name')
                                                            }
                                                            {
                                                                run_mode !== 'standalone' &&
                                                                RenderSelectItems(clusterGroup, 'name')
                                                            }
                                                        </>
                                                        :
                                                        <>
                                                            {
                                                                run_mode === 'standalone' &&
                                                                serverList.map(
                                                                    (item: any) => (
                                                                        <Select.Option key={item.id} value={item.id}>
                                                                            <Space>
                                                                                {
                                                                                    item.state === "Available" &&  <Badge status="success" />
                                                                                }
                                                                                {
                                                                                    item.state === 'Reserved' && <Badge status="error" />
                                                                                }
                                                                                {
                                                                                    item.state === 'Occupied' && <Badge status="warning" />
                                                                                }
                                                                                <Tooltip placement="top" title={item.state}>
                                                                                    <Typography.Text ellipsis>{item.ip}</Typography.Text>
                                                                                </Tooltip>
                                                                            </Space>
                                                                        </Select.Option>
                                                                    )
                                                                )
                                                            }
                                                            {
                                                                run_mode === 'cluster' &&
                                                                RenderSelectItems(clusterServer, 'name')
                                                            }
                                                        </>
                                                    }
                                                </Select>
                                            </Form.Item>
                                        </>
                                    }
                                    {
                                        serverObjectType === 3 &&
                                        <Form.Item name="server_tag_id" rules={[{ required: true, message: '请选择调度标签' }]}>
                                            <Select
                                                placeholder="请选择调度标签"  //
                                                style={{ width: '100%' }}
                                                allowClear
                                                filterOption={false}
                                                tagRender={tagRender}
                                                mode="multiple"
                                                onPopupScroll={handleTagePopupScroll}
                                                onChange={() => setHasChange(!hasChange)}
                                            >
                                                {
                                                    dispathTags.map((item: any) => (
                                                        <Select.Option key={item.id} value={item.id}>
                                                            <Tag color={item.tag_color}>{item.name}</Tag>
                                                        </Select.Option>
                                                    ))
                                                }
                                            </Select>
                                        </Form.Item>
                                    }
                                    {
                                        serverObjectType === 4 &&
                                        <Form.Item name="server_object_id" rules={[{ required: true, message: '请选择机器实例' }]}>
                                            <Select
                                                allowClear
                                                style={{ width: '100%' }}
                                                placeholder="请选择机器实例"
                                                onChange={() => setHasChange(!hasChange)}
                                                showSearch
                                                // onPopupScroll={ handleClusterPopupScroll }
                                                optionFilterProp="children"
                                                filterOption={(input, option: any) =>
                                                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                                }
                                            >{/* {RenderSelectItems(clusterStandaloneServers.filter((i: any) => i.is_instance), 'instance_name')} */}
                                                {clusterStandalone.filter((i: any) => i.is_instance).map((item: any) => {
                                                    return (
                                                        <Select.Option value={item.id} key={item.id}>
                                                            {item.pub_ip ? (
                                                                item.instance_name.indexOf(' / ') < 0 ? `${item.pub_ip} / ${item.instance_name}` : item.instance_name
                                                            ) : item.instance_name}
                                                        </Select.Option>
                                                    )
                                                })}
                                            </Select>
                                        </Form.Item>
                                    }
                                    {
                                        serverObjectType === 5 &&
                                        <Form.Item name="server_object_id" rules={[{ required: true, message: '请选择机器配置' }]}>
                                            <Select
                                                allowClear
                                                style={{ width: '100%' }}
                                                placeholder="请选择机器配置"
                                                onChange={() => setHasChange(!hasChange)}
                                                showSearch
                                                optionFilterProp="children"
                                                filterOption={(input, option: any) =>
                                                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                                }
                                            >
                                                {RenderSelectItems(clusterStandalone.filter((i: any) => !i.is_instance), 'template_name')}
                                            </Select>
                                        </Form.Item>
                                    }
                                </Form.Item>
                            </Col>
                        </> :
                        <>
                            {/* { muiltipInfo.selfServer ? '多个数值' : '请选择机器类型(agent)' } */}
                            <Form.Item
                                name="custom_channel"
                                style={{ width: '100%' }}
                                rules={!mask ? [{ required: true, message: '请选择机器类型' }] : []}
                            >
                                <Select
                                    style={{ width: '100%' }}
                                    placeholder={muiltipInfo.selfServer ? '多个数值' : '请选择机器类型(agent)'}
                                    onChange={(value) => {
                                        setMask(false)
                                        value && handleCustomChannel(value)
                                        // form.validateFields(['custom_ip'])
                                    }}
                                >
                                    <Select.Option value="staragent">StarAgent</Select.Option>
                                    <Select.Option value="toneagent">ToneAgent</Select.Option>
                                </Select>
                            </Form.Item>
                            <Form.Item
                                name="custom_ip" //11.159.157.229
                                style={{ width: '100%' }}
                                validateStatus={validate}
                                help={validate === 'error' && validateMsg}
                                // validateTrigger='onBlur'
                                // rules={!mask ? [
                                //     () => ({
                                //         async validator(rule, value) {
                                //             if (value) {
                                //                 let msg = await handleValidataCustomIp(value)
                                //                 return msg ? Promise.reject(msg.toString()) : Promise.resolve()
                                //             }
                                //             return Promise.reject('请输入IP/SN')
                                //         },
                                //     })
                                // ] : []}
                            >
                                <Input placeholder={muiltipInfo.selfServer ? '多个数值' : '请输入IP/SN'} autoComplete="off"
                                   onBlur={handleCustomBlur}
                                />
                            </Form.Item>
                        </>
                }
            </Row>
            <Form.Item
                name="repeat"
                label={
                    <QusetionIconTootip
                        title="Repeat"
                        desc={`${itemType === 'suite' ? '对选中Suite下所有Conf生效，' : ''}范围1-10000`}
                    />
                }
                // rules={[{ required: true, message: '请输入' }]}
                className={styles.drawer_padding}
            >
                <InputNumber style={{ width: '100%' }} min={1} step={1} max={10000} placeholder={caseFrom?.repeat?.length > 1 ? '多个数值' : '请输入'} />
            </Form.Item>
            {
                itemType === 'suite' &&
                <div style={{ height: 8, background: 'rgba(0,0,0,0.03)', width: '100%', marginBottom: 8 }} />
            }

            {/**失败时部署Agent对话框 */}
            <DeployModal ref={deployModal} callback={deployCallback} />
        </>
    )
}