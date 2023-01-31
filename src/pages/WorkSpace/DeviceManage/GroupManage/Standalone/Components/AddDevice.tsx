import React, { useState, useEffect, useCallback, useRef, forwardRef, useImperativeHandle, useMemo } from 'react'
import { Drawer, Space, Button, Form, Select, Input, Badge, message, Spin, Tooltip } from 'antd'
import { checkTestServerIps, addTestServer, putTestServer, batchPutTestServer } from '../../services'
import _ from 'lodash'
import Owner from '@/components/Owner/index';
import DeployServer from '../../Components/DeployServer'
import DeployModal from './DeployModal'
import styles from './AddDevice.less'
import { useParams, useIntl, FormattedMessage } from 'umi'
import { AgentSelect } from '@/components/utils';
import MachineTags from '@/components/MachineTags';

const AddDeviceDrawer = (props: any, ref: any) => {
    const { formatMessage } = useIntl()
    const { ws_id }: any = useParams()
    const { onFinish } = props

    const [visible, setVisible] = useState(false)
    const [modifyProps, setModifyProps] = useState<any>(null)
    const deployServerRef: any = useRef(null)
    // 部署Agent对话框
    const deployModal: any = useRef(null)
    const [form] = Form.useForm()
    /* const [ members , setMembers ] = useState([]) */
    const [ips, setIps] = useState<any>({ success: [], errors: [] })
    const [validateMsg, setValidateMsg] = useState<any>('');
    const [padding, setPadding] = useState(false)
    const [loading, setLoading] = useState(false)
    const [selectIpsValue, setSelectIpsValue] = useState('')
    const [vals, setVals] = useState([])
    const [validateResult, setValidateResult] = useState<any>({});
    const [isMoreEdit, setIsMoreEdit] = useState<boolean>(false)
    const SELECT_IPS_PLACEHOLDER_STRING = formatMessage({ id: BUILD_APP_ENV ? 'device.machine.IP.placeholder1' : 'device.machine.IP.placeholder2' })
    const [tagFlag, setTagFlag] = useState({
        list: [],
        isQuery: '',
    })

    // 机器状态是occupied--编辑时：控制通道、机器、使用状态不能编辑。
    useImperativeHandle(ref, () => ({
        show: (data: any) => {
            handleClose()
            setVisible(true)
            data && setModifyProps(_)
            if (data) {
                setModifyProps(data)
                setIsMoreEdit(_.get(data, 'opreateType') === 'moreEdit')
                data.ip && form.setFieldsValue({ ips: [data.ip] })
                let list = []
                if (data.tag_list) {
                    list = data.tag_list.map((item: any) => item.id)
                }
                setTagFlag({ ...tagFlag, isQuery: 'edit', list })
            } else {
                setTagFlag({ ...tagFlag, isQuery: 'add', list: [] })
            }

        }
    }))

    const disabledState = useMemo(() => {
        return modifyProps && modifyProps.state === 'Occupied'
    }, [modifyProps])

    // 提交
    const handleFinish = () => {
        setPadding(true)
        form.validateFields().then(async (values: any) => {
            let data: any;
            values.owner = ""
            if (!modifyProps) {
                data = await addTestServer({ ...values, ws_id });
            }
            else {
                if (values.owner === modifyProps.owner_name) values.owner = modifyProps.owner
                if (disabledState) {
                    // 过滤掉请求参数中三个字段：控制通道、机器、使用状态。
                    delete values.channel_type;
                    delete values.ip;
                    // delete values.state;
                }
                values.ws_id = ws_id
                data = await putTestServer(modifyProps.id, values)
            }

            if (data.code === 200) {
                message.success(formatMessage({ id: 'operation.success' }))
                onFinish()
                handleClose()
            }
            else {
                message.error(data.msg || formatMessage({ id: 'operation.failed' }))
            }
            setPadding(false)
        })
            .catch((err: any) => {
                setPadding(false)
            })
    }

    // 提交
    const handleMoreEditFinish = () => {
        setPadding(true)
        form.validateFields().then(async (values: any) => {
            let data: any;
            values.ws_id = ws_id
            values.server_ids = modifyProps.selectRowKeys
            values.description = values.description || ''
            data = await batchPutTestServer(values)

            if (data.code === 200) {
                message.success(formatMessage({ id: 'operation.success' }))
                onFinish()
                handleClose()
            }
            else {
                message.error(data.msg || formatMessage({ id: 'operation.failed' }))
            }
            setPadding(false)
        })
            .catch((err: any) => {
                setPadding(false)
                console.log(err)
            })
    }

    // 部署Agent
    const deployClick = (selectedRow: any) => {
        deployModal.current?.show({ ...selectedRow, detailData: selectedRow.errors || [] });
    }
    // 部署回调
    const deployCallback = (info: any) => {
        // step1.Agent部署结果信息
        const { success_servers = [], } = info;
        const successIps = success_servers?.map((item: any) => item.ip);
        // step2.数据回填
        if (successIps?.length) {
            setIps({ success: successIps, errors: [] })
            form.setFieldsValue({ ips: successIps })
        }
    }

    const ValidateDisplayMessage: React.FC<any> = ({ data }) => (
        <Space>
            <span>{data.msg[0]}</span>
            <Tooltip title={data.msg[1]}><span style={{ color: '#1890ff' }}><FormattedMessage id="device.detail.info" /></span></Tooltip>
        </Space>
    )

    // 机器字段 校验失败内容提示。
    const ValidateIps: React.FC<any> = ({ data, channelType }) => (
        <Space>
            <span>{data.msg[0]}</span>
            <Tooltip title={data.msg[1]}><span style={{ color: '#1890ff' }}><FormattedMessage id="device.detail.info" /></span></Tooltip>
            {BUILD_APP_ENV ? <></> : channelType === 'toneagent' && <span className={styles.btn_style} onClick={() => deployClick(data.data)}>
                <FormattedMessage id="device.deploy.toneagent" />
            </span>}
        </Space>
    )

    // 校验函数
    const handleIpsCheck = async (value: any) => {
        if (loading) return
        if (validateResult.error) {
            setValidateResult({})
        }
        setLoading(true)
        const ips = form.getFieldValue('ips') || []
        const ip = form.getFieldValue('ip')
        const channel_type = value // form.getFieldValue('channel_type')
        // 添加
        if (channel_type && ips && ips.length > 0) {
            const data = await checkTestServerIps({ ips, channel_type, ws_id }) || {}
            if (data.code === 200) {
                setIps({ ...data.data })
                setValidateMsg(<ValidateIps data={data} channelType={channel_type} />)
                form.setFieldsValue({ ips: data.data.success })

                setVals(data.data.success)
                setSelectIpsValue('')
            }
        }
        else if (channel_type && ip && ip.length > 0) {
            /**
             * 编辑, 需要把机器id也传给后端。
             * @author jpt 校验通道失败
             */
            const data = await checkTestServerIps({ ws_id, ips: ip, channel_type, server_id: modifyProps.id }) || {}
            if (data.code === 200 && data.data && data.data.errors && data.data.errors.length) {
                setValidateResult({ ...data, error: true })
            }
        }
        setLoading(false)
    }

    // 机器输入框onChange
    const handleIpsChange = (value: any) => {
        handleIpsCheck(value);
    }

    const handleDeployOk = useCallback(
        () => {

        }, []
    )

    useEffect(() => {
        if (!modifyProps || isMoreEdit) {
            form.resetFields()
        }
        else {
            if ('id' in modifyProps) {
                const { ip, private_ip, description, tag_list, state, name, channel_type, emp_id, sn } = modifyProps
                form.setFieldsValue({
                    ip,
                    private_ip,
                    description,
                    tags: tag_list.map(({ id }: any) => id),
                    state,
                    emp_id,
                    name: name || 'SN',
                    channel_type,
                    sn,
                })
            }
        }
    }, [props.visible, modifyProps])

    const handleChangeIps = (value: any) => {
        setSelectIpsValue(value)
    }

    // 失焦校验
    const handleBlurIps = () => {
        if (selectIpsValue.length > 0) {
            if (selectIpsValue.indexOf('，') > 1) {
                message.error('机器ip参数格式不正确')
                return
            }
            const matchResult: any = selectIpsValue.trim().split(/,|\s/) || []
            const resultIp: any = Array.from(
                new Set(matchResult.concat(vals))
            )
            setVals(resultIp)
            form.setFieldsValue({ ips: resultIp })
            const channel_type = form.getFieldValue('channel_type')
            if (channel_type && !BUILD_APP_ENV) {
                handleIpsCheck(channel_type)
            }
        }
    }

    const handleFocusIps = () => {
        setIps({ success: [], errors: [] })
        setValidateMsg('')
    }

    const handleMultipIpChange = (values: any) => {
        setVals(values)
        setSelectIpsValue(values.toString())
    }

    const handleClose = () => {
        form.resetFields()
        setVisible(false)
        setModifyProps(null)
        setValidateResult({})
        setValidateMsg('')
        setVals([])
        setSelectIpsValue('')
        setIps({ success: [], errors: [] })
    }

    return (
        <Drawer
            keyboard={false}
            maskClosable={false}
            forceRender={true}
            title={!modifyProps ? <FormattedMessage id="device.add.btn" /> : <FormattedMessage id="device.device.edit" />}
            width="376"
            visible={visible}
            destroyOnClose={true}
            onClose={!padding ? handleClose : () => { }}
            className={styles.form_wrapper_body}
            footer={
                <div style={{ textAlign: 'right' }}>
                    <Space>
                        <Button onClick={handleClose} disabled={padding}><FormattedMessage id="operation.cancel" /></Button>
                        <Button onClick={isMoreEdit ? handleMoreEditFinish : handleFinish} type="primary" loading={padding}>
                            {!modifyProps ? <FormattedMessage id="operation.ok" /> : <FormattedMessage id="operation.update" />}
                        </Button>
                    </Space>
                </div>
            }
        >
            <Spin spinning={loading}>
                <Form layout="vertical"
                    form={form}
                    className={styles.form_styles}
                    initialValues={{
                        channel_type: BUILD_APP_ENV ? open_agent : self_agent
                    }}
                >
                    {!isMoreEdit && <Form.Item label={<FormattedMessage id="device.channel_type" />}
                        name="channel_type"
                        rules={[{
                            required: true,
                            message: formatMessage({ id: 'device.channel_type.message' }),
                        }]}
                        // 表单提交后校验该通道是否可用
                        validateStatus={validateResult.error ? 'error' : ''}
                        help={
                            (validateResult.msg && validateResult.msg.length) &&
                            <ValidateDisplayMessage data={validateResult} />
                        }
                    >
                        <AgentSelect
                            onChange={handleIpsChange}
                            disabled={BUILD_APP_ENV ? true : disabledState}
                            placeholder={formatMessage({ id: 'device.channel_type.message' })}
                        />
                    </Form.Item>}


                    {/** 添加 */}
                    {!isMoreEdit && !modifyProps &&
                        <Form.Item
                            label={BUILD_APP_ENV ? <FormattedMessage id="device.machine.IP" /> : <FormattedMessage id="device.machine" />}
                            name="ips"
                            validateStatus={ips.errors.length > 0 ? 'error' : undefined}
                            help={ips.errors.length > 0 ? validateMsg : undefined}
                            rules={[{
                                required: true,
                                // pattern:/^((((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})(\.((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})){3})( |,))*((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})(\.((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})){3}$/,
                                message: formatMessage({ id: BUILD_APP_ENV ? 'device.please.enter.correct.server.IP' : 'device.please.enter.correct.server' })
                            }]}
                        >
                            <Select
                                mode="multiple"
                                placeholder={SELECT_IPS_PLACEHOLDER_STRING}
                                onBlur={handleBlurIps}
                                onFocus={handleFocusIps}
                                onSearch={handleChangeIps}
                                onChange={handleMultipIpChange}
                                notFoundContent={null}
                                className={styles.select_ips}
                            >
                                {
                                    ips.success.map((item: any, index: number) => (
                                        <Select.Option key={index} value={item}>
                                            {item}
                                        </Select.Option>
                                    ))
                                }
                            </Select>
                        </Form.Item>
                    }
                    {/** 编辑 */}
                    {!isMoreEdit && modifyProps &&
                        <>
                            <Form.Item name="ip" label={<FormattedMessage id="device.machine" />}>
                                <Input disabled />
                            </Form.Item>
                            <Form.Item
                                name="name"
                                label={<FormattedMessage id="device.machine.name" />}
                                rules={[{ required: true, message: formatMessage({ id: 'device.machine.message' }) }]}
                                initialValue="SN"
                            >
                                <Input autoComplete="off" />
                            </Form.Item>
                            <Form.Item
                                name="sn"
                                label="SN"
                                style={{ display: 'none' }}
                            >
                                <Input autoComplete="off" type="hidden" />
                            </Form.Item>
                        </>
                    }

                    {!isMoreEdit && <Form.Item
                        label={<FormattedMessage id="device.usage.state" />}
                        name="state"
                        rules={[{ required: true, message: formatMessage({ id: 'device.usage.state.message' }) }]}
                        initialValue={'Available'}
                    >
                        <Select placeholder={formatMessage({ id: 'device.usage.state.message' })} disabled={disabledState}>
                            <Select.Option value="Available"><Badge status="success" text={"Available"} /></Select.Option>
                            <Select.Option value="Reserved"><Badge status="success" text={"Reserved"} /></Select.Option>
                            <Select.Option value="Unusable"><Badge status="default" text={"Unusable"} /></Select.Option>
                        </Select>
                    </Form.Item>}
                    {!isMoreEdit && <Owner />}
                    {!isMoreEdit && <MachineTags {...tagFlag} />}
                    <Form.Item label={<FormattedMessage id="device.description" />} name="description">
                        <Input.TextArea placeholder={formatMessage({ id: 'device.description.placeholder' })} />
                    </Form.Item>
                </Form>
            </Spin>
            <DeployServer ref={deployServerRef} handleOk={handleDeployOk} />
            <DeployModal ref={deployModal} callback={deployCallback} />
        </Drawer>
    )
}

export default forwardRef(AddDeviceDrawer)