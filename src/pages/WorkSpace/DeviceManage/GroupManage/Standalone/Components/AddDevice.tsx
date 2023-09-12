/* eslint-disable react/no-array-index-key */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { useState, useEffect, useCallback, useRef, forwardRef, useImperativeHandle, useMemo } from 'react'
import { Drawer, Space, Button, Form, Select, Input, Badge, message, Spin, Tooltip } from 'antd'
import { checkTestServerIps, addTestServer, putTestServer, batchPutTestServer } from '../../services'
import _ from 'lodash'
import Owner from '@/components/Owner/index';
import DeployServer from '../../Components/DeployServer'
import DeployModal from './DeployModal'
import styles from './AddDevice.less'
import { useParams, useIntl, FormattedMessage, useModel } from 'umi'
import { AgentSelect } from '@/components/utils';
import MachineTags from '@/components/MachineTags';
import Disclaimer from '@/components/Disclaimer';

const AddDeviceDrawer = (props: any, ref: any) => {
    const { formatMessage } = useIntl()
    const { ws_id }: any = useParams()
    const { onFinish } = props
    const { openModal, handleDisclaimerOpen } = useModel('disclaimer');
    const [visible, setVisible] = useState(false)
    const [modifyProps, setModifyProps] = useState<any>(null)
    const deployServerRef: any = useRef(null)
    // 部署Agent对话框
    const deployModal: any = useRef(null)
    const [form] = Form.useForm()
    const [ips, setIps] = useState<any>({ success: [], errors: [] })
    const [padding, setPadding] = useState(false)
    const [loading, setLoading] = useState(false)
    const [selectIpsValue, setSelectIpsValue] = useState('')
    const [vals, setVals] = useState([])
    const [isMoreEdit, setIsMoreEdit] = useState<boolean>(false)
    const SELECT_IPS_PLACEHOLDER_STRING = formatMessage({
        id: BUILD_APP_ENV ?
            'device.machine.IP.placeholder1' :
            'device.machine.IP.placeholder2'
    })
    const [tagFlag, setTagFlag] = useState({
        list: [],
        isQuery: '',
    })

    const handleClose = () => {
        form.resetFields()
        setVisible(false)
        setModifyProps(null)
        setVals([])
        setSelectIpsValue('')
        setIps({ success: [], errors: [] })
    }

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

    const handleFormFinish = () => {
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
            values.ws_id = ws_id
            values.server_ids = modifyProps.selectRowKeys
            values.description = values.description || ''
            const { code, msg } = await batchPutTestServer(values)

            if (code === 200) {
                message.success(formatMessage({ id: 'operation.success' }))
                onFinish()
                handleClose()
            }
            else {
                message.error(msg || formatMessage({ id: 'operation.failed' }))
            }
            setPadding(false)
        })
            .catch((err: any) => {
                setPadding(false)
                console.log(err)
            })
    }

    const handleModalState = useCallback((flag: any) => {
        if (flag) handleFormFinish()
        setPadding(false)
    }, [])

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

    // 校验函数
    const handleIpsChange = async (value: any) => {
        if (loading) return

        setLoading(true)
        const $ips = form.getFieldValue('ips') || []
        const ip = form.getFieldValue('ip')
        const channel_type = value // form.getFieldValue('channel_type')
        // 添加
        if (channel_type && $ips && $ips.length > 0) {
            const { code, data, msg } = await checkTestServerIps({ ips: $ips, channel_type, ws_id }) || {}
            if (code === 200) {
                setIps(data)
                form.setFields([{
                    name: 'ips',
                    value: data?.success,
                    /* @ts-ignore */
                    errors: [
                        data?.errors?.length > 0 &&
                        <Space>
                            {
                                msg?.filter(Boolean).length > 0 &&
                                <>
                                    <span>{msg?.[0]}</span>
                                    <Tooltip title={msg?.[1]}>
                                        <span style={{ color: '#1890ff' }}>
                                            <FormattedMessage id="device.detail.info" />
                                        </span>
                                    </Tooltip>
                                </>
                            }

                            {
                                !BUILD_APP_ENV && channel_type === 'toneagent' &&
                                <span className={styles.btn_style} onClick={() => deployClick(data)}>
                                    <FormattedMessage id="device.deploy.toneagent" />
                                </span>
                            }
                        </Space>
                    ].filter(Boolean)
                }])
                setVals(data?.success)
                setSelectIpsValue('')
            }
        }
        else if (channel_type && ip?.length > 0) {
            /**
             * 编辑, 需要把机器id也传给后端。
             * @author jpt 校验通道失败
             */
            const { data, code, msg } = await checkTestServerIps({ ws_id, ips: ip, channel_type, server_id: modifyProps?.id }) || {}
            if (code === 200 && data?.errors?.length) {
                form.setFields([{
                    name: 'ips',
                    errors: [
                        /* @ts-ignore */
                        <Space>
                            <span>{msg?.[0]}</span>
                            <Tooltip title={msg?.[1]}>
                                <span style={{ color: '#1890ff' }}>
                                    <FormattedMessage id="device.detail.info" />
                                </span>
                            </Tooltip>
                        </Space>
                    ]
                }])
            }
        }
        setLoading(false)
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
                const { tag_list, name } = modifyProps
                form.setFieldsValue({
                    ...modifyProps,
                    tags: tag_list.map(({ id }: any) => id),
                    name: name || 'SN',
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
                handleIpsChange(channel_type)
            }
        }
    }

    const handleFocusIps = () => {
        form.setFields([{ name: "ips", errors: [] }])
    }

    const handleMultipIpChange = (values: any) => {
        setVals(values)
        setSelectIpsValue(values.toString())
    }

    return (
        <Drawer
            keyboard={false}
            maskClosable={false}
            forceRender={true}
            title={
                !modifyProps ?
                    <FormattedMessage id="device.add.btn" /> :
                    <FormattedMessage id="device.device.edit" />
            }
            width="376"
            open={visible}
            destroyOnClose={true}
            onClose={!padding ? handleClose : () => { }}
            className={styles.form_wrapper_body}
            footer={
                <div style={{ textAlign: 'right' }}>
                    <Space>
                        <Button
                            onClick={handleClose}
                            disabled={padding}
                        >
                            <FormattedMessage id="operation.cancel" />
                        </Button>
                        <Button
                            onClick={isMoreEdit ? handleMoreEditFinish : !modifyProps ? handleDisclaimerOpen : handleFormFinish}
                            type="primary"
                            loading={padding}
                        >
                            {
                                !modifyProps ?
                                    <FormattedMessage id="operation.ok" /> :
                                    <FormattedMessage id="operation.update" />
                            }
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
                    {/** 编辑 */}
                    {
                        !isMoreEdit &&
                        <>
                            <Form.Item
                                label={<FormattedMessage id="device.channel_type" />}
                                name="channel_type"
                                rules={[{
                                    required: true,
                                    message: formatMessage({ id: 'device.channel_type.message' }),
                                }]}
                            >
                                <AgentSelect
                                    onChange={handleIpsChange}
                                    disabled={BUILD_APP_ENV ? true : disabledState}
                                    placeholder={formatMessage({ id: 'device.channel_type.message' })}
                                />
                            </Form.Item>
                            {
                                !modifyProps &&
                                <Form.Item
                                    label={
                                        BUILD_APP_ENV ?
                                            <FormattedMessage id="device.machine.IP" /> :
                                            <FormattedMessage id="device.machine" />
                                    }
                                    name="ips"
                                    rules={[{
                                        required: true,
                                        // pattern:/^((((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})(\.((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})){3})( |,))*((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})(\.((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})){3}$/,
                                        message: formatMessage({
                                            id: BUILD_APP_ENV ?
                                                'device.please.enter.correct.server.IP' :
                                                'device.please.enter.correct.server'
                                        })
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
                                        options={
                                            ips?.success?.map((item: any) => ({
                                                label: item,
                                                value: item
                                            }))
                                        }
                                    />
                                </Form.Item>
                            }
                            {
                                modifyProps &&
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
                            <Form.Item
                                label={<FormattedMessage id="device.usage.state" />}
                                name="state"
                                rules={[{ required: true, message: formatMessage({ id: 'device.usage.state.message' }) }]}
                                initialValue={'Available'}
                            >
                                <Select
                                    placeholder={formatMessage({ id: 'device.usage.state.message' })}
                                    disabled={disabledState}
                                    options={
                                        ['Available', 'Reserved', 'Unusable'].map((i: any) => ({
                                            label: <Badge status={['Unusable'].includes(i) ? 'default' : 'success'} text={i} />,
                                            value: i
                                        }))
                                    }
                                />
                            </Form.Item>
                            <Owner />
                            <MachineTags {...tagFlag} />
                        </>
                    }
                    <Form.Item label={<FormattedMessage id="device.description" />} name="description">
                        <Input.TextArea placeholder={formatMessage({ id: 'device.description.placeholder' })} />
                    </Form.Item>
                </Form>
            </Spin>
            <DeployServer ref={deployServerRef} handleOk={handleDeployOk} />
            <DeployModal ref={deployModal} callback={deployCallback} />
            {openModal && <Disclaimer onOk={handleModalState} />}
        </Drawer>
    )
}

export default forwardRef(AddDeviceDrawer)