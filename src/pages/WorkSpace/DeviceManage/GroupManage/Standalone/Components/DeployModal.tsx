
import React, { useMemo, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Modal, message, Form, Select, Input, Radio, Popover, Spin, Alert, Tooltip } from 'antd'
import { QuestionCircleOutlined } from '@ant-design/icons'
import { FormattedMessage, useIntl } from 'umi';
import ShowDeployIPList from './DeployShowIPList';
import { queryVersionList, agentDeploy } from '../../services'
import styles from './index.less'

/**
 * 部署Agent
 */
export default forwardRef((props: any, ref: any) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState<any>(false)
    const [tip, setTip] = useState<any>('')
    const [radioType, setRadioType] = useState<any>('')
    const [visible, setVisible] = useState(false);
    // 版本数据
    const [data, setData] = useState<any>([]);
    const [selectedRow, setSelectedRow] = useState<any>([]);
    const [deployType, setDeployType] = useState<any>('common');
    // Agent部署的结果提示
    const [deployResult, setDeployResult] = useState<any>({});
    const [arch, setArch] = useState('x86_64')
    // console.log('deployType:', deployType) 

    /**
     * 初始化状态数据
     * */
    const resetInitialState = () => {
        setSelectedRow([]);
        setDeployType('common');
        setDeployResult({})
        setVisible(false);
    }

    // 1.请求数据
    const getVersionData = async () => {
        try {
            const res: any = await queryVersionList({ arch }); // { page_num: 1, page_size: 100000  }
            const { code, msg, data = [] } = res || {}
            if (code === 200) {
                setData(data)
            } else {
                message.error(msg || '请求版本数据失败');
            }
        } catch (e) {
            // setLoading(false)
        }
    }

    useEffect(() => {
        // 请求版本数据
        if (useBuildEnv || selectedRow.length)
            getVersionData()
    }, [selectedRow, arch])

    useImperativeHandle(
        ref,
        () => ({
            show: (_: any) => {
                const { detailData, radio_type, instance_id } = _
                setVisible(true)
                setRadioType(radio_type)
                if (useBuildEnv) {
                    form.setFieldsValue({
                        instance_id
                    })
                    return
                }

                const restList = detailData.map((item: any) => ({ ip: item, id: item }))
                setSelectedRow(restList)
                form.setFieldsValue({ ips: detailData })
            }
        })
    )

    const delIP = (info: any) => {
        setSelectedRow(info)
    }

    const onChangeChannel = (e: any) => {
        setDeployType(e.target.value)
    };

    const handleOk = () => {
        form
            .validateFields()
            .then(async (values) => {
                setLoading(true);
                setTip('正在部署中...')
                // Agent部署接口
                const { code, msg, data = {} } = await agentDeploy(values);
                if (code === 200) {
                    if (data.fail_servers?.length) {
                        setDeployResult(data);
                    } else {
                        message.success('部署完成');
                        // case1.重置状态数据&&重置表单数据
                        form.resetFields();
                        resetInitialState();
                        // case2.回调父级函数
                        props.callback(data);
                    }
                }
                else {
                    message.error(msg || '部署失败');
                }
                setLoading(false);
                setTip('')
            }).catch(() => {
                // 接口报错
                setLoading(false);
                setTip('')
            });
    };

    const handleCancel = () => {
        if (!loading) {
            // case1.重置表单数据&&重置状态数据
            form.resetFields();
            resetInitialState();
        }
    };

    // Alert的提示内容
    const deployReactNode = () => {
        const { success_servers = [], fail_servers = [] } = deployResult
        const successIps = success_servers?.map((item: any) => item.ip).join(' / ')
        // const failIps = fail_servers.map((item: any)=> item.ip).join(' / ')
        // const failMsg = (<div>{fail_servers.map((item: any)=> <div>{}</div>)}</div>)
        return (
            <div>
                {success_servers?.length ? (<><span style={{ color: '#1890FF' }}>{successIps}</span>&nbsp;部署成功；&nbsp;</>) : null}
                {fail_servers?.map((item: any) =>
                    <div>
                        <span style={{ color: '#F5222D' }} >{item && item.ip}</span>&nbsp;部署失败&nbsp;
                        <Tooltip placement="bottomLeft" title={item && item.msg}><a>查看详情</a></Tooltip>
                    </div>
                )}
            </div>
        )
    }
    // 关闭Alert
    const closeAlert = () => {
        // case1.重置部署失败状态数据
        setDeployResult({})
    }

    const { formatMessage } = useIntl();
    const placeholder = formatMessage({ id: "Form.select.placeholder" });
    const requiredMessage = formatMessage({ id: 'Form.select.message' });

    const useBuildEnv = useMemo(() => BUILD_APP_ENV && ['openanolis', 'opensource'].includes(BUILD_APP_ENV), [])

    const getDeployMode = () => {
        if (useBuildEnv) return 'active'
        return radioType === 'cloudManage' ? 'passive' : 'active'
    }

    return (
        <div>
            <Modal className={styles.DeployModal_root}
                title={formatMessage({ id: 'agent.deploy.btn' })}
                visible={visible}
                maskClosable={false}
                width={460}
                confirmLoading={loading}
                closable={!loading}
                onOk={handleOk}
                onCancel={handleCancel}
            >
                <Spin tip={tip} spinning={loading}>
                    {((deployResult.success_servers?.length) || (deployResult.fail_servers?.length)) ?
                        <div className={styles.Alert}>
                            <Alert message={deployReactNode()} type="info" showIcon closable onClose={closeAlert} />
                        </div>
                        : null
                    }

                    <Form form={form} layout="vertical"
                        initialValues={{
                            channel: 'common',
                            mode: getDeployMode(),
                            user: 'root',
                            arch
                        }}
                    >
                        {
                            !useBuildEnv &&
                            <Form.Item label="IP"
                                name="ips"
                                rules={[{
                                    required: true,
                                    message: formatMessage({ id: "DeployModal.ids.message" }),
                                }]}>
                                <ShowDeployIPList dataSource={selectedRow} delCallback={delIP} />
                            </Form.Item>
                        }

                        {
                            useBuildEnv &&
                            <Form.Item
                                label="InstanceID"
                                name="instance_id"
                            >
                                <Input disabled />
                            </Form.Item>
                        }

                        {
                            !useBuildEnv &&
                            <Form.Item label="部署方式"
                                name="channel"
                            >
                                <Radio.Group onChange={onChangeChannel}>
                                    <Radio value="common">通过用户名/密码部署</Radio>
                                    {
                                        (!useBuildEnv && radioType !== 'cloudManage') &&
                                        <Radio value="staragent">通过StarAgent部署</Radio>
                                    }
                                </Radio.Group>
                            </Form.Item>
                        }

                        <Form.Item
                            label="Mode"
                            name="mode"
                        >
                            <Radio.Group>
                                <Radio value="active">
                                    active
                                    <Popover placement="topLeft" content={'主动模式(active)指的是agent主动连server进行通信的方式(类似push模式)'}>
                                        <QuestionCircleOutlined style={{ opacity: 0.65, marginLeft: 2 }} /></Popover>
                                </Radio>
                                <Radio value="passive">
                                    passive
                                    <Popover placement="topLeft" content={'被动模式(passive)指的是server主动连agent进行通信的模式(类似pull模式)'}>
                                        <QuestionCircleOutlined style={{ opacity: 0.65, marginLeft: 2 }} /></Popover>
                                </Radio>
                            </Radio.Group>
                        </Form.Item>


                        <Form.Item
                            label="arch"
                            name="arch"
                            required
                        >
                            <Select onChange={(val: string) => setArch(val)}>
                                <Select.Option value="x86_64">x86_64</Select.Option>
                                <Select.Option value="aarch64">aarch64</Select.Option>
                            </Select>
                        </Form.Item>

                        <Form.Item label={<FormattedMessage id="agent.modal.Version" />}
                            name="version"
                            rules={[{
                                required: true,
                                message: requiredMessage,
                            }]}>
                            <Select placeholder={placeholder}
                                showSearch
                                optionFilterProp="children"
                                filterOption={(input, option: any) =>
                                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                }>
                                {data.map((item: any) => (
                                    <Select.Option key={item.id} value={item.version}>{item.version}</Select.Option>
                                ))}
                            </Select>
                        </Form.Item>

                        {(!useBuildEnv && deployType === 'common') && (
                            <>
                                <Form.Item label="User"
                                    name="user"
                                    rules={[{
                                        required: false,
                                        max: 20,
                                        message: '允许输入长度为20个字符',
                                    }]}>
                                    <Input placeholder={formatMessage({ id: "Form.input.placeholder" })} autoComplete="off" />
                                </Form.Item>
                                <Form.Item
                                    label="Password"
                                    name="password"
                                >
                                    <Input.Password placeholder={formatMessage({ id: "Form.input.placeholder" })} />
                                </Form.Item>
                            </>
                        )}

                    </Form>
                </Spin>


            </Modal>
        </div>
    );
});