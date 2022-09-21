import React, { useState, useImperativeHandle, forwardRef, useEffect } from 'react'
import { Drawer, Form, Radio, Input, Select, Space, Button, message, Spin, Badge, Row, Col, Tooltip, AutoComplete } from 'antd'

import { addServerGroup, checkTestServerIps, queryTestServerList } from '../../services'
import Owner from '@/components/Owner/index';
import styles from './index.less'
import { requestCodeMessage } from '@/utils/utils';
import { AgentSelect } from '@/components/utils';

const CreateClusterDrawer = (props: any, ref: any) => {
    const { onFinish, ws_id } = props
    const [form] = Form.useForm()
    const [options, setOptions] = useState<{ value: string }[]>([]);
    const [ips, setIps] = useState({ success: [], errors: [] })
    const [validateMsg, setValidateMsg] = useState<any>('');
    const [loading, setLoading] = useState(true)
    const [poolFlag, setPoolFlag] = useState<boolean>(false)
    const [visible, setVisible] = useState(false)
    const defaultParam = { ws_id, page_num: 1, page_size: 20 }
    const [source, setSource] = useState<any>(null)

    const queryServerList = async (params: any) => {
        return await queryTestServerList(params)
    }

    useImperativeHandle(ref, () => ({
        show(_: any) {
            setVisible(true)
            setLoading(true)
            queryServerList(defaultParam).then((res: any) => {
                if (res.code === 200) {
                    let arr: any = []
                    !!res.data.length && res.data.map((item: any) => {
                        arr.push({ value: item.ip })
                    })
                    setOptions(arr)
                } else {
                    requestCodeMessage(res.code, res.msg)
                }
                setLoading(false)
            })
            if (_) {
                setSource(_)
            }
        }
    }))

    const searchServerList = (val: string) => {
        let reg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/
        const text = reg.test(val)
        if (text) {
            queryServerList({ ...defaultParam, ip: val })
                .then((res: any) => {
                    if (res.code === 200 && !!res.data.length) {
                        let data = res.data[0]
                        if (data.in_pool) {
                            setIps({ success: [], errors: [] })
                            form.setFieldsValue({ channel_type: data.channel_type })
                            setPoolFlag(true)
                        } else {
                            setPoolFlag(false)
                        }
                    } else {
                        setPoolFlag(false)
                    }
                })
        } 
    }

    const onSelect = (val: string) => {
        searchServerList(val)
    };

    const onSearch = (searchText: string) => {
        searchServerList(searchText)
    };

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
        setPoolFlag(false)
        setVisible(false)
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
                }
            } catch (err) {
                setLoading(false)
            }
        }
        setLoading(false)
    }

    // 失焦校验
    const handleBlurIp = (e: any) => {
        if (form.getFieldValue('channel_type') && !BUILD_APP_ENV && !poolFlag) {
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
                    {
                        poolFlag &&
                        <Row style={{ marginBottom: 10 }}>
                            <Col>
                                <span style={{ color: 'red', marginRight: 10 }}>*</span>
                                机器已存在于单机池，修改【控制通道】、【使用状态】信息请前往单机池管理页面。
                            </Col>
                        </Row>
                    }
                    <Form.Item
                        name="ip"
                        label="机器"
                        validateStatus={ips.errors.length > 0 ? 'error' : ''}
                        help={ips.errors.length > 0 ? validateMsg : undefined}
                        rules={[{
                            required: true,
                            message:`请输入或选择IP${!BUILD_APP_ENV ? "/SN" : ""}`
                        }]}>
                        <AutoComplete
                            options={options}
                            style={{ width: '100%' }}
                            onSelect={onSelect}
                            onSearch={onSearch}
                            onBlur={(e: any) => handleBlurIp(e)}
                            placeholder="输入或选择机器"
                        />
                    </Form.Item>
                    <Form.Item
                        name="channel_type"
                        initialValue={'toneagent'}
                        label="控制通道"
                        rules={[{ required: true, message: '请选择控制通道' }]}
                    >
                        <AgentSelect disabled={(BUILD_APP_ENV) || (!BUILD_APP_ENV && poolFlag)} />
                    </Form.Item>
                    <Form.Item label="使用状态"
                        name="state"
                        hasFeedback
                        rules={[{ required: true, message: '请选择机器状态!' }]}
                        initialValue={'Available'}
                    >
                        <Select placeholder="请选择机器状态" disabled={poolFlag}>
                            <Select.Option value="Available"><Badge status="success" />Available</Select.Option>
                            <Select.Option value="Reserved"><Badge status="success" />Reserved</Select.Option>
                            <Select.Option value="Unusable"><Badge status="default" />Unusable</Select.Option>
                        </Select>
                    </Form.Item>
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


