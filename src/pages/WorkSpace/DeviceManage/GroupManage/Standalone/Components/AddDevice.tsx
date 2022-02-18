import React, { useState, useEffect, useCallback, useRef, forwardRef, useImperativeHandle, useMemo } from 'react'
import { Drawer, Space, Button, Form, Select, Input, Badge, message, Alert, Spin, Tooltip } from 'antd'
import { queryServerTagList, checkTestServerIps, addTestServer, putTestServer, batchPutTestServer } from '../../services'
import _ from 'lodash'
import Owner from '@/components/Owner/index';
import { TagSelect } from '../../Components'
import DeployServer from '../../Components/DeployServer'
import DeployModal from './DeployModal'
import styles from './AddDevice.less'
import { useParams } from 'umi'
import { AgentSelect } from '@/components/utils';

const AddDeviceDrawer = (props: any, ref: any) => {
    const { ws_id }: any = useParams()
    const { onFinish } = props

    const [visible, setVisible] = useState(false)
    const [modifyProps, setModifyProps] = useState<any>(null)
    const deployServerRef: any = useRef(null)
    // 部署Agent对话框
    const deployModal: any = useRef(null)

    const [tagList, setTagList] = useState([])
    const [form] = Form.useForm()
    /* const [ members , setMembers ] = useState([]) */
    const [ips, setIps] = useState({ success: [], errors: [] })
    const [validateMsg, setValidateMsg] = useState<any>('');
    const [padding, setPadding] = useState(false)
    const [loading, setLoading] = useState(true)
    const [selectIpsValue, setSelectIpsValue] = useState('')
    const [vals, setVals] = useState([])
    const [validateResult, setValidateResult] = useState<any>({});
    const [isMoreEdit, setIsMoreEdit] = useState<boolean>(false)
    const SELECT_IPS_PLACEHOLDER_STRING = `输入${BUILD_APP_ENV ? '机器IP' : 'IP/SN'},多个以空格或英文逗号分隔`

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
            }
        }
    }))

    const disabledState = useMemo(() => {
        return modifyProps && modifyProps.state === 'Occupied'
    }, [modifyProps])


    const queryTagList = async () => {
        setLoading(true)
        const { data } = await queryServerTagList({ ws_id, page_size: 500 }) //run_mode, run_environment, 
        setTagList(data || [])
        /*  let memberList = await getMembers()
         setMembers( memberList ) */
        setLoading(false)
    }

    useEffect(() => {
        queryTagList()
    }, [])

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
                message.success('操作成功')
                onFinish()
                handleClose()
            }
            else {
                message.error(data.msg || '操作失败')
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
                message.success('操作成功')
                onFinish()
                handleClose()
            }
            else {
                message.error(data.msg || '操作失败')
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
            <Tooltip title={data.msg[1]}><span style={{ color: '#1890ff' }}>详细信息</span></Tooltip>
        </Space>
    )

    // 机器字段 校验失败内容提示。
    const ValidateIps: React.FC<any> = ({ data, channelType }) => (
        <Space>
            <span>{data.msg[0]}</span>
            <Tooltip title={data.msg[1]}><span style={{ color: '#1890ff' }}>详细信息</span></Tooltip>
            {BUILD_APP_ENV ? <></> : channelType === 'toneagent' && <span className={styles.btn_style} onClick={() => deployClick(data.data)}>部署ToneAgent</span>}
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
        else if (channel_type && ip) {
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
        const matchResult: any = selectIpsValue.match(/[a-z0-9A-Z.-_]+(\s|,|)/g) || []
        const resultIp: any = Array.from(
            new Set(matchResult.map((i: any) => i.replace(/(\s|,|)/g, '')).concat(vals))
        )
        setVals(resultIp)
        form.setFieldsValue({ ips: resultIp })

        const channel_type = form.getFieldValue('channel_type')
        if (channel_type) {
            handleIpsCheck(channel_type)
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
            title={!modifyProps ? '添加机器' : '编辑机器'}
            width="376"
            visible={visible}
            destroyOnClose={true}
            onClose={!padding ? handleClose : () => { }}
            className={styles.form_wrapper_body}
            footer={
                <div style={{ textAlign: 'right' }}>
                    <Space>
                        <Button onClick={handleClose} disabled={padding}>取消</Button>
                        <Button onClick={isMoreEdit ? handleMoreEditFinish : handleFinish} type="primary" loading={padding}>
                            {!modifyProps ? '确定' : '更新'}
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
                    {!isMoreEdit && <Form.Item label="控制通道"
                        name="channel_type"
                        rules={[{
                            required: true,
                            message: '请选择控制通道',
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
                            placeholder="请选择控制通道"
                        />
                    </Form.Item>}


                    {/** 添加 */}
                    {!isMoreEdit && !modifyProps &&
                        <Form.Item
                            label={BUILD_APP_ENV ? "机器IP" : '机器'}
                            name="ips"
                            validateStatus={ips.errors.length > 0 ? 'error' : ''}
                            help={ips.errors.length > 0 && validateMsg}
                            rules={[{ required: true }]}
                        // validateTrigger={ 'onBlur' }
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
                            <Form.Item name="ip" label="机器">
                                <Input disabled />
                            </Form.Item>
                            <Form.Item
                                name="name"
                                label="机器名称"
                                rules={[{ required: true, message: '请输入机器名称' }]}
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

                    {/*                     <Form.Item name="add_parent" label="添加物理机" initialValue={ true }>
                        <Radio.Group>
                            <Radio value={ true }>是</Radio>
                            <Radio value={ false }>否</Radio>
                        </Radio.Group>
                    </Form.Item> */}

                    {!isMoreEdit && <Form.Item
                        label="使用状态"
                        name="state"
                        // hasFeedback
                        rules={[{ required: true, message: '请选择机器状态!' }]}
                        initialValue={'Available'}
                    >
                        <Select placeholder="请选择机器状态" disabled={disabledState}>
                            <Select.Option value="Available"><Badge status="success" />Available</Select.Option>
                            <Select.Option value="Reserved"><Badge status="default" />Reserved</Select.Option>
                        </Select>
                    </Form.Item>}
                    {!isMoreEdit && <Owner />}
                    {!isMoreEdit && tagList && <TagSelect initialValue={[]} tags={tagList} />}
                    <Form.Item label="备注" name="description">
                        <Input.TextArea placeholder="请输入备注信息" />
                    </Form.Item>
                </Form>
            </Spin>
            <DeployServer ref={deployServerRef} handleOk={handleDeployOk} />
            <DeployModal ref={deployModal} callback={deployCallback} />
        </Drawer>
    )
}

export default forwardRef(AddDeviceDrawer)




    // const checkServerIp = async () => {
    //     if ( loading ) return
    //     const ips = form.getFieldValue('ips') || []
    //     const ip = form.getFieldValue('ip')
    //     const channel_type = form.getFieldValue('channel_type')

    //     let data : any = null
    //     if ( channel_type ) {
    //         data = await checkTestServerIps({ ips, channel_type, ws_id }) || {}
    //         if (data.code === 200) {
    //             form.setFieldsValue({ ips: data.data.success })
    //             setVals(data.data.success)
    //             setSelectIpsValue('')
    //         }
    //     }

    //     if ( channel_type && ip && modifyProps ) {
    //         /**
    //          * 编辑, 需要把机器id也传给后端。
    //          * @author jpt 校验通道失败
    //          */
    //         data = await checkTestServerIps({ ws_id, ips: ip, channel_type, server_id: modifyProps.id })
    //         if (data.code === 200 && data.data && data.data.errors && data.data.errors.length) {
    //             setValidateResult({ ...data, error: true })
    //         }
    //     }

    //     console.log( data )

    //     if ( data.data.errors.length > 0 ) {
    //         return data
    //     }
    // }