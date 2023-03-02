import React, { useState, useEffect, useRef } from 'react'
import { Row, Col, Form, Radio, Input, Select, Button, Space, message, Spin, Breadcrumb } from 'antd'

import { queryBasicJobItms, createJobType, queryJobTypeDetail, updateJobType, queryJobTypeItems } from './services'
import { history, FormattedMessage, useIntl, useModel, useParams } from 'umi'

import CheckBoxSelect from './components/CheckBoxSelect'
import { RectSelect } from './components/RectSelect'
import PreviewComponent from './components/Preview'
import { SingleTabCard } from '@/components/UpgradeUI'
import { requestCodeMessage } from '@/utils/utils'

const { document }: any = window

const CreateJobType: React.FC<Record<string, any>> = (props) => {
    const { ws_id, jt_id } = useParams() as any

    const { setInitialState } = useModel("@@initialState")

    const intl = useIntl()
    const { formatMessage } = useIntl()
    document.title = intl.messages[`Workspace.JobConfig.${props.route.name}`]
    const { route } = props
    const isUpdatePage = props.route.name === 'JobTypeUpdate'

    const [form] = Form.useForm()

    const previewDrawer: React.RefObject<any> = useRef()

    const [source, setSource] = useState({ basic: [], env: [], server: [], more: [] })
    const [loading, setLoading] = useState(true)
    const [padding, setPadding] = useState(false)

    const [editPagedata, setEditPageData] = useState<any>(false)

    const [previewData, setPreviewData] = useState<any>({})
    const [defaultSelect, setDefaultSelect] = useState<any>({ more: [], server: [] })
    const [enabel, setEnabel] = useState(true)
    const [testType, setTestType] = useState(null)

    const getJobItems = async () => {
        setLoading(true)
        const { data = {} } = await queryBasicJobItms({ ws_id })
        if (isUpdatePage) {
            // 数据回填
            const { data: [jobTypeData] } = await queryJobTypeDetail({ jt_id })
            setEditPageData(jobTypeData)
            const { server_type, test_type, name, description, enable: temlEnable, business_type } = jobTypeData
            setTestType(test_type)
            if (test_type === 'business' && business_type) {
                form.setFieldsValue({ business_type })
            }
            form.setFieldsValue({ server_type, test_type, name, description, enable: temlEnable })
            setEnabel(temlEnable)
            const { data: typeItems } = await queryJobTypeItems({ jt_id })
            let more: Array<number> = []
            let server: Array<number> = []
            Object.keys(data).forEach((key) => {
                data[key] = data[key].map((item: any) => {
                    const idx = typeItems.findIndex(
                        ({ config_index, name }: any) => name === item.name && config_index === item.config_index
                    )
                    if (idx > -1) {
                        if (key === 'more') more.push(item.id)
                        if (key === 'server') server.push(item.id)
                        // ...
                        if (item.name === 'baseline' && test_type === 'business' && business_type === 'business') {
                            return { ...item, disable: true, select: false }
                        }
                        // ...
                        return { ...item, select: true, isTouch: true, alias: typeItems[idx].alias }
                    }
                    return item
                })
            })
            setDefaultSelect({ server, more })
        }

        setSource(data)
        setLoading(false)
    }

    useEffect(() => {
        getJobItems()
    }, [])

    const handleSelect = (name: string, id: any, select: boolean) => {
        let data: any = {}
        Object.keys(source).forEach(
            (key) => {
                data[key] = key === name ?
                    source[key].map(
                        (ctx: any, idx: number) => ctx.id === id ? { ...ctx, select, isTouch: select } : ctx
                    ) :
                    source[key]
            }
        )
        setSource(data)
    }

    const hanldeEditName = (name: string, id: number, alias: string) => {
        let data: any = {}
        Object.keys(source).forEach(
            (key) => {
                data[key] = key === name ?
                    source[key].map(
                        (ctx: any) => ctx.id === id ? { ...ctx, alias } : ctx
                    ) :
                    source[key]
            }
        )
        setSource(data)
    }

    const handleCheckBoxSelect = (vals: Array<number>, name: string) => {
        let data: any = {}
        Object.keys(source).forEach(
            key => {
                data[key] = key === name ?
                    source[key].map(
                        (ctx: any) => {
                            const idx = vals.findIndex(id => id === ctx.id)
                            const select = idx > -1 ? true : false
                            let obj = Object.assign({}, defaultSelect)
                            obj[name] = vals
                            setDefaultSelect(obj)
                            return { ...ctx, select }
                        }
                    ) :
                    source[key]
            }
        )
        setSource(data)
    }

    const handleFinish = async (saveType: string = '') => {
        let item_dict = {}
        setPadding(true)
        if (padding) return
        form.validateFields()
            .then(async (values: any) => {
                Object.keys(source).forEach(key => {
                    source[key].forEach(
                        (ctx: any) => {
                            if (ctx.select) item_dict[ctx.id] = ctx.alias || null
                        }
                    )
                })

                const params: any = {
                    ...values,
                    ws_id,
                    is_default: false,
                    item_dict
                }

                const { code, msg, id } = isUpdatePage ? await updateJobType({ ...params, jt_id }) : await createJobType(params)

                if (code === 200) {
                    setInitialState((state: any) => ({
                        ...state,
                        refreshMenu: !state?.refreshMenu
                    }))
                    message.success(formatMessage({ id: 'operation.success' }))
                    if (saveType === 'job')
                        history.push(`/ws/${ws_id}/test_job/${id}`)
                    else
                        history.push(`/ws/${ws_id}/job/types`)
                }
                else
                    requestCodeMessage(code, msg)
                setPadding(false)
            })
            .catch((err: any) => {
                setPadding(false)
                console.log(err)
                const { errorFields } = err
                const { name } = errorFields[0]
                form.scrollToField(name)
                document.querySelector('.create_job_type_content').parentNode.scrollTop = 239
            })
    }

    /**
     * 【 互斥原则 】：
     * 机器类型 云上 aliyun 重装机 （ 不显示 ） reclone
     * 测试类型 稳定性 stability 基线 （ 不显示 ） baseline
     * 【 约束原则 】
     * 测试类型 性能 performance 基线 （默认选择） baseline
     */
    const handleServerChange = ({ target }: any) => {
        let data: any = {}

        Object.keys(source).forEach(
            (key) => {
                data[key] = source[key].map(
                    (ctx: any) => {
                        if (ctx.name === 'reclone')
                            return target.value === 'aliyun' ?
                                { ...ctx, disable: true, select: false } :
                                { ...ctx, disable: false }
                        return ctx
                    }
                )
            }
        )

        setSource(data)
    }

    const handleEnabelChange = ({ target }: any) => {
        setEnabel(target.value)
    }

    const handleTestTypeChange = (value: any) => {
        setTestType(value)

        let data: any = {}
        Object.keys(source).forEach(
            (key) => {
                data[key] = source[key].map((ctx: any) => {
                    if (ctx.name === 'baseline') {
                        if (value === 'stability')
                            return { ...ctx, disable: true, select: false }
                        if (value === 'performance')
                            return { ...ctx, disable: false, select: true }
                        if (value === 'functional') {
                            if (ctx.isTouch) return { ...ctx, disable: false }
                            return { ...ctx, disable: false, select: false }
                        }
                        if (value === 'business') {
                            const aa = form.getFieldValue('business_type')
                            if (['business', undefined].includes(aa)) return { ...ctx, disable: true, select: false }
                            return { ...ctx, disable: false, select: true }
                        }
                    }
                    return ctx
                }
                )
            }
        )

        setSource(data)
    }

    const handleBusinessTypeChange = ({ target }: any) => {
        const value = target.value

        let data: any = {}
        Object.keys(source).forEach((key) => {
            data[key] = source[key].map((ctx: any) => {
                if (ctx.name === 'baseline') {
                    if (testType === 'stability')
                        return { ...ctx, disable: true, select: false }
                    if (testType === 'performance')
                        return { ...ctx, disable: false, select: true }
                    if (testType === 'functional') {
                        if (ctx.isTouch) return { ...ctx, disable: false }
                        return { ...ctx, disable: false, select: false }
                    }
                    if (testType === 'business') {
                        if (value === 'business') return { ...ctx, disable: true, select: false }
                        return { ...ctx, disable: false, select: true }
                    }
                }
                return ctx
            }
            )
        }
        )
        setSource(data)
    }

    const handlePriview = () => {
        const params = {
            ...form.getFieldsValue(),
            item_dict: source,
        }

        setPreviewData(params)
        previewDrawer.current.show()
    }

    return (
        <SingleTabCard
            className="create_job_type_content"
            title={
                <Breadcrumb >
                    <Breadcrumb.Item >
                        <span
                            style={{ cursor: 'pointer' }}
                            onClick={() => history.push(`/ws/${ws_id}/job/types`)}
                        >
                            <FormattedMessage id={"Workspace.JobConfig.JobTypeManage"} />
                        </span>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>
                        <FormattedMessage id={`Workspace.JobConfig.${route.name}`} />
                    </Breadcrumb.Item>
                </Breadcrumb>
            }
        >
            <Spin spinning={loading} >

                <h3><FormattedMessage id="job.types.type.configuration" /></h3>
                <Form
                    form={form}
                    layout="horizontal"
                    labelCol={{ span: 3 }}
                    wrapperCol={{ span: 21 }}
                >
                    <Form.Item
                        label={<FormattedMessage id="job.types.job.name" />}
                        name="name"
                        required
                        rules={[
                            { required: true, message: formatMessage({ id: 'job.types.job.name.rules1' }) },
                            { max: 20, message: formatMessage({ id: 'job.types.job.name.rules2' }) }
                        ]}
                    >
                        <Input autoComplete="off" placeholder={formatMessage({ id: 'job.types.job.name.placeholder' })} style={{ width: 500 }} />
                    </Form.Item>
                    <Form.Item label={<FormattedMessage id="job.types.server_type" />} initialValue={"aliyun"} name="server_type">
                        <Radio.Group onChange={handleServerChange}>
                            <Radio value="aligroup">
                                {formatMessage({ id: 'aligroupServer' })}
                            </Radio>
                            <Radio value="aliyun">
                                {formatMessage({ id: 'aliyunServer' })}
                            </Radio>
                        </Radio.Group>
                    </Form.Item>

                    <Form.Item
                        label={<FormattedMessage id="job.types.test_type" />}
                        initialValue={"functional"} name="test_type">
                        <Select allowClear onChange={handleTestTypeChange} style={{ width: 500 }}>
                            <Select.Option value="functional"><FormattedMessage id="functional.test" /></Select.Option>
                            <Select.Option value="performance"><FormattedMessage id="performance.test" /></Select.Option>
                            <Select.Option value="stability"><FormattedMessage id="stability.test" /></Select.Option>
                            <Select.Option value="business"><FormattedMessage id="business.test" /></Select.Option>
                        </Select>
                    </Form.Item>
                    {testType === 'business' && (
                        <Row>
                            <Col span={3} />
                            <Col span={21}>
                                <Form.Item label=""
                                    initialValue={"business"}
                                    name="business_type"
                                    rules={[{ required: true, message: formatMessage({ id: 'job.types.business.message' }) }]}
                                >
                                    <Radio.Group onChange={handleBusinessTypeChange}>
                                        <Radio value="functional"><FormattedMessage id="functional.test" /></Radio>
                                        <Radio value="performance"><FormattedMessage id="performance.test" /></Radio>
                                        <Radio value="business"><FormattedMessage id="access.test" /></Radio>
                                    </Radio.Group>
                                </Form.Item>
                            </Col>
                        </Row>
                    )}

                    <Form.Item
                        label={<FormattedMessage id="job.types.desc.option" />}
                        name="description"
                        rules={[{
                            max: 20,
                            message: formatMessage({ id: 'job.types.desc.message' }),
                        }]} >
                        <Input.TextArea placeholder={formatMessage({ id: 'job.types.desc.placeholder' })}
                            style={{ width: 500 }} />
                    </Form.Item>
                    <Form.Item
                        label={<FormattedMessage id="job.types.enable" />}
                        initialValue={true} name="enable" >
                        <Radio.Group onChange={handleEnabelChange}>
                            <Radio value={true}><FormattedMessage id="job.types.enable" /></Radio>
                            <Radio disabled={editPagedata.is_first} value={false}><FormattedMessage id="job.types.stop" /></Radio>
                        </Radio.Group>
                    </Form.Item>

                    <h3><FormattedMessage id="job.types.env.configuration" /></h3>
                    <RectSelect
                        title={formatMessage({ id: 'job.types.base.config' })}
                        desc={formatMessage({ id: 'job.types.base.config.ps' })}
                        data={source.basic}
                        name="basic"
                        onSelect={handleSelect}
                        onEdit={hanldeEditName}
                    />
                    <RectSelect
                        title={formatMessage({ id: 'job.types.env.config' })}
                        desc={formatMessage({ id: 'job.types.env.config.ps' })}
                        data={source.env}
                        name="env"
                        onSelect={handleSelect}
                        onEdit={hanldeEditName}
                    />
                    <CheckBoxSelect
                        title={formatMessage({ id: 'job.types.case.and.server' })}
                        desc={formatMessage({ id: 'job.types.case.and.server.ps' })}
                        defaultValue={defaultSelect.server}
                        data={source.server}
                        name="server"
                        onSelect={handleCheckBoxSelect}
                        onEdit={hanldeEditName}
                    />
                    <CheckBoxSelect
                        title={formatMessage({ id: 'job.types.more.config' })}
                        desc={formatMessage({ id: 'job.types.more.config.ps' })}
                        data={source.more}
                        defaultValue={defaultSelect.more}
                        name="more"
                        onSelect={handleCheckBoxSelect}
                        onEdit={hanldeEditName}
                    />
                    <Row style={{ marginTop: 24 }}>
                        <Space>
                            {
                                enabel &&
                                <Button type="primary" disabled={padding} onClick={() => handleFinish('job')}>
                                    <FormattedMessage id="job.types.save.and.create.job" />
                                </Button>
                            }
                            <Button onClick={() => handleFinish()}><FormattedMessage id="job.types.only.save" /></Button>
                            <Button type="link" onClick={handlePriview}><FormattedMessage id="operation.preview" /></Button>
                        </Space>
                    </Row>
                </Form>
            </Spin>
            <PreviewComponent
                {...previewData}
                ref={previewDrawer}
                onOk={handleFinish}
            />
        </SingleTabCard>
    )
}

export default CreateJobType