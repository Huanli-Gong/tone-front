import React, { useState, useCallback, useImperativeHandle, forwardRef } from 'react'
import { Drawer, Form, Radio, Input, Select, Space, Button, message, Spin, Badge, Row, Col, Tooltip } from 'antd'

import { queryTestServerAppGroup, queryTestServerNewList, addServerGroup, checkTestServerIps } from '../../services'
import Owner from '@/components/Owner/index';
import styles from './index.less'
import { requestCodeMessage } from '@/utils/utils';
import { AgentSelect } from '@/components/utils';

const CreateClusterDrawer = (props: any, ref: any) => {
    const { onFinish, ws_id } = props
    const [form] = Form.useForm()
    const [single, setSingle] = useState('1')
    const [ips, setIps] = useState({ success: [], errors: [] })
    const [validateMsg, setValidateMsg] = useState<any>('');
    // const [vals, setVals] = useState([])
    const [appGroup, setAppGroup] = useState<any>(undefined)
    const [groupList, setGroupList] = useState([])
    const [testServerList, setTestServerList] = useState([])
    // const [selectIpsValue, setSelectIpsValue] = useState('')
    const [loading, setLoading] = useState(true)

    const [testServerLoading, setTestServerLoading] = useState(false)
    const [visible, setVisible] = useState(false)

    const [source, setSource] = useState<any>(null)

    useImperativeHandle(ref, () => ({
        show(_: any) {
            setVisible(true)
            getAppGroupList()
            if (_) {
                setSource(_)
            }
        }
    }))

    const getAppGroupList = useCallback(
        async () => {
            setLoading(true)
            const { data } = await queryTestServerAppGroup({ ws_id })
            setGroupList(data)
            setLoading(false)
        }, []
    )

    const getTestServerList = useCallback(
        async (app_group) => {
            form.resetFields(['ip'])
            setTestServerLoading(true)
            setAppGroup(app_group)
            let params = BUILD_APP_ENV ? undefined : app_group
            const { data } = await queryTestServerNewList({ ws_id, app_group : params })
            setTestServerList(data)
            setTestServerLoading(false)
        },
        [appGroup]
    )

    const setIpStyle = useCallback(
        (evt) => {
            form.resetFields(['ip'])
            setSingle(evt.target.value)
        }, []
    )

    const handleOk = () => {
        form
            .validateFields()
            .then(
                async (values) => {
                    const data: any = await addServerGroup({ ...values, ws_id, cluster_id: source.id, cluster_type: 'aligroup' })
                    if (data.code === 200) {
                        onFinish(source.id)
                        message.success('操作成功')
                        handleCancel()
                    }
                    else {
                        requestCodeMessage(data.code, data.msg)
                    }
                }
            )
            .catch(
                (err: any) => {
                    console.log(err)
                }
            )
    }

    const handleCancel = () => {
        form.resetFields()
        setVisible(false)
        setAppGroup('')
        setSource(null)
    }

    const ValidateDisplayMessage: React.FC<any> = ({ data }) => (
        <Space>
            <span>{data.msg[0]}</span>
            <Tooltip title={data.msg[1]}><span style={{ color: '#1890ff' }}>详细信息</span></Tooltip>
        </Space>
    )

    // 接口校验是否为有效ip
    const handleIpsCheck = async () => {
        if (loading) return
        setLoading(true)
        const ip = form.getFieldValue('ip')
        const channel_type = form.getFieldValue('channel_type')
        if (channel_type && ip && ip.length > 0) {
            try {
                const data = await checkTestServerIps({ ips: [ip], channel_type, ws_id }) || {}
                if (data.code === 200) {
                    setIps({ ...data.data })
                    setValidateMsg(<ValidateDisplayMessage data={data} />)
                    // setVals(data.data.success)
                    // setSelectIpsValue('')
                }
            } catch (err) {
                setLoading(false)
            }
        }
        setLoading(false)
    }

    // -----------------------
    // 失焦校验
    const handleBlurIp = (e: any) => {
        // const ipValue =  e.target.value
        if (form.getFieldValue('channel_type') && !BUILD_APP_ENV) {
            handleIpsCheck()
        }
    }

    return (
        <Drawer
            maskClosable={false}
            keyboard={false}
            title="添加机器"
            forceRender={true}
            visible={visible}
            width="376"
            onClose={handleCancel}
            footer={
                <div style={{ textAlign: 'right' }} >
                    <Space>
                        <Button onClick={handleCancel}>取消</Button>
                        <Button type="primary" onClick={handleOk}>确定</Button>
                    </Space>
                </div>
            }
        >
            <Spin spinning={loading}>
                <Form
                    layout="vertical"
                    /*hideRequiredMark*/
                    form={form}
                    className={styles.add_server_form}
                >
                    <Form.Item name="is_single" label="是否是单机池" initialValue="1">
                        <Radio.Group onChange={setIpStyle}>
                            <Radio value="1">是</Radio>
                            <Radio value="0">否</Radio>
                        </Radio.Group>
                    </Form.Item>
                    {
                        single === '1' ?
                            BUILD_APP_ENV ?
                                <Form.Item 
                                    name="ip"
                                    label="机器"
                                    rules={[{ required: true, message: '请选择机器' }]}>
                                        <Select
                                            placeholder="请选择机器"
                                            loading={testServerLoading}
                                            getPopupContainer={node => node.parentNode}
                                            showSearch
                                        >
                                            {
                                                testServerList.map(
                                                    (item: any) => (
                                                        <Select.Option key={item.id} value={item.ip}>{item.ip}</Select.Option>
                                                    )
                                                )
                                            }
                                        </Select>
                                </Form.Item>
                                :
                                <Form.Item label="机器">
                                    <Form.Item noStyle>
                                        <Row gutter={10}>
                                            <Col span={12}>
                                                <Form.Item noStyle rules={[{ required: true, message: '请选择分组' }]}>
                                                    <Select
                                                        placeholder="请选择分组"
                                                        onChange={getTestServerList}
                                                        value={appGroup}
                                                        getPopupContainer={node => node.parentNode}
                                                    >
                                                        {
                                                            Array.isArray(groupList) && groupList.map(
                                                                (item: any) => (
                                                                    <Select.Option key={item} value={item}>{item}</Select.Option>
                                                                )
                                                            )
                                                        }
                                                    </Select>
                                                </Form.Item>
                                            </Col>
                                            <Col span={12}>
                                                <Form.Item name="ip" noStyle rules={[{ required: true, message: '请选择机器' }]}>
                                                    <Select
                                                        placeholder="请选择机器"
                                                        loading={testServerLoading}
                                                        getPopupContainer={node => node.parentNode}
                                                        showSearch
                                                    >
                                                        {
                                                            testServerList.map(
                                                                (item: any) => (
                                                                    <Select.Option key={item.id} value={item.ip || item.sn}>{item.ip || item.sn}</Select.Option>
                                                                )
                                                            )
                                                        }
                                                    </Select>
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                    </Form.Item>
                                </Form.Item> :
                            <Row>
                                <Col span={24}>
                                    <Form.Item 
                                        name="channel_type" 
                                        initialValue={'toneagent'}
                                        label="控制通道" 
                                        rules={[{ required: true, message: '请选择控制通道' }]}
                                    >
                                        <AgentSelect disabled={BUILD_APP_ENV}/>
                                    </Form.Item>
                                </Col>
                                <Col span={24}>
                                    <Form.Item label="机器"
                                        name="ip"
                                        validateStatus={ips.errors.length > 0 ? 'error' : ''}
                                        help={ips.errors.length > 0 ? validateMsg : undefined}
                                        rules={[{ 
                                            required: true, 
                                            // pattern:/^((((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})(\.((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})){3})( |,))*((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})(\.((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})){3}$/,
                                            message:`请输入IP${!BUILD_APP_ENV ? "/SN" : ""}`
                                        }]}>
                                            <Input allowClear
                                                onBlur={(e: any) => handleBlurIp(e)}
                                                autoComplete="off"
                                                placeholder={`请输入IP${!BUILD_APP_ENV ? "/SN" : ""}`} />
                                    </Form.Item>
                                </Col>
                                <Col span={24}>
                                    <Form.Item label="使用状态"
                                        name="state"
                                        hasFeedback
                                        rules={[{ required: true, message: '请选择机器状态!' }]}
                                        initialValue={'Available'}
                                    >
                                        <Select placeholder="请选择机器状态" >
                                            <Select.Option value="Available"><Badge status="success" />Available</Select.Option>
                                            <Select.Option value="Reserved"><Badge status="success" />Reserved</Select.Option>
                                            <Select.Option value="Unusable"><Badge status="default" />Unusable</Select.Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>
                    }
                    <Form.Item name="private_ip" label="私网IP" >
                        <Input autoComplete="off" placeholder="请输入私网IP" />
                    </Form.Item>
                    <Form.Item name="role" label="角色" rules={[{ required: true }]}>
                        <Select getPopupContainer={node => node.parentNode} placeholder="请选择角色">
                            <Select.Option value="local">local</Select.Option>
                            <Select.Option value="remote">remote</Select.Option>
                        </Select>
                    </Form.Item>
                    <Owner />
                    <Form.Item name="baseline_server" label="是否基线机器" initialValue={false}>
                        <Radio.Group>
                            <Radio value={true}>是</Radio>
                            <Radio value={false}>否</Radio>
                        </Radio.Group>
                    </Form.Item>
                    <Form.Item name="kernel_install" label="是否安装内核" initialValue={false}>
                        <Radio.Group>
                            <Radio value={true}>是</Radio>
                            <Radio value={false}>否</Radio>
                        </Radio.Group>
                    </Form.Item>
                    <Form.Item
                        name="var_name"
                        label="运行变量名"
                        rules={[{
                            required: true,
                            // pattern: /^[A-Za-z0-9]+$/g,
                            // message: '仅允许包含字母、数字'
                        }]}
                    >
                        <Input autoComplete="off" placeholder="请输入" />
                    </Form.Item>
                </Form>
            </Spin>
        </Drawer>
    )
}

export default forwardRef(CreateClusterDrawer)

