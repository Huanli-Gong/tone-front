/* eslint-disable no-param-reassign */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable react-hooks/exhaustive-deps */
import { Drawer, Form, Spin, Space, Input, Button, Alert, Radio, InputNumber, Row } from 'antd'
import React, { forwardRef, useImperativeHandle, useState, useMemo, useCallback, memo, useEffect } from 'react'
import { useIntl, FormattedMessage } from 'umi';
import styled from 'styled-components'
import { DrawerProvider } from './Provider'
import { QusetionIconTootip, getHasMuiltip, formatter } from '../untils'
import lodash from 'lodash'
import ServerFormItem from './ServerFormItem'
import { DeleteOutlined } from '@ant-design/icons';
// import MonitorItem from './MonitorItem'

const DrawerWrapper = styled(Drawer)`
    .ant-form-item {
        margin-bottom: 8px;
    }
    .ant-drawer-body {
        padding: 0;
    }
    .ant-form {
        padding: 13px 0;
    }
    .ant-drawer-header {
        padding: 16px 14px 8px;
    }
    .drawer_padding {
        padding-left: 20px;
        padding-right: 20px;
    }
`

const NameContent = styled.div`
    font-size: 12px;
    color: rgba(0,0,0,.65);
    margin-top: 4px;
    margin-right: 14px;
    word-wrap: break-word;
    word-break: break-all;
    overflow: hidden;
`

const getType = (v: any) => Object.prototype.toString.call(v)

const compact = (val: any) => {
    const c = getType(val)
    if (c === '[object Array]' && JSON.stringify(val) !== '[]') {
        const x = val.reduce((pre: any, cur: any) => {
            const t = getType(cur)
            if (JSON.stringify(cur) !== '{}' && t === '[object Object]') {
                const r = Object.keys(cur).reduce(
                    (p: any, c: any) => {
                        const i = cur[c]
                        if (i !== null && i !== undefined && i !== '') p[c] = i
                        return p
                    }, {}
                )
                return JSON.stringify(r) !== '{}' ? pre.concat(r) : pre
            }
            return pre
        }, [])
        return x.length > 0 ? x : undefined
    }

    return undefined
}

const getMultipResultFields = (arr: any) => (
    Object.keys(arr).reduce(
        (pre: any, cur: any) => {
            if (cur === 'server_tag_id' && JSON.stringify(arr[cur]) !== '[]') {
                const s = arr[cur].reduce((p: any, c: any) => JSON.stringify(c) !== '[]' ? p.concat(c.toString()) : p, [])
                let r = s;
                if (s.length > 0)
                    r = lodash.uniq(s).map((i: any) => i.split(',').map((i: any) => Number(i)))
                pre[cur] = r
            }
            else
                pre[cur] = lodash.uniq(arr[cur])
                    .reduce(
                        (p: any, c: any) => {
                            if (lodash.isArray(c)) {
                                if (JSON.stringify(c) === '[]') return p
                                p.push(c)
                                return p
                            }
                            return (c !== undefined && c !== null && c !== '') ? p.concat(c) : p
                        }, []
                    )
            return pre
        }, {}
    )
)

const getRealParams = (multip: any) => {
    const params = Object.keys(multip).reduce((pre: any, cur: any) => {
        const item = multip[cur]
        if (cur === 'env_info') {
            pre[cur] = [{ val: '', name: '' }]
            return pre
        }
        if (item && item.length === 0) return pre
        if (item && item.length > 1) return pre
        pre[cur] = item && item[0]
        return pre
    }, {})
    if (params.custom_ip && params.custom_channel) return params
    return { ...params, custom_ip: null, custom_channel: null }
}

const getMultipFields = (source: any[], isSuite: boolean = false) => {
    let caseMultipFields: any = {}

    const filterSourceMultip = (_: any, initial = {}) => _.reduce(
        (pre: any, cur: any) => {
            Object.keys(cur).forEach(
                key => {
                    const _item = cur[key]

                    if (key === 'test_case_list')
                        caseMultipFields = filterSourceMultip(_item, caseMultipFields)
                    else {
                        if (key in pre) {
                            if (lodash.isArray(_item))
                                pre[key].push(_item)
                            else
                                pre[key] = pre[key].concat(_item)
                        }
                        else pre[key] = [_item]
                    }
                }
            )
            return pre
        }, initial
    )

    const multipList = filterSourceMultip(source)
    const suiteMultip = getMultipResultFields(multipList)

    if (isSuite) {
        const caseMultip = getMultipResultFields(caseMultipFields)
        return { suiteMultip, caseMultip }
    }

    return { suiteMultip }
}

const SuiteDrawer: React.ForwardRefRenderFunction<any, any> = (props, ref) => {
    const { formatMessage } = useIntl()
    const { contrl, checked, server_type, test_type, run_mode, onDataSourceChange, testSuiteData, onOk } = props

    const [serverType, setServerType] = useState('pool') //pool custom
    const [serverObjectType, setServerObjectType] = useState<any>('ip') //'' , server_tag_id , tag_id

    const [settingType, setSettingType] = useState<any>(null)
    const [form] = Form.useForm();
    const [dataSource, setDataSource] = useState<any>(undefined)
    const [batch, setBatch] = useState(false)
    const [loading, setLoading] = useState(true)
    const [visible, setVisible] = useState(false)
    const [mask, setMask] = useState(false)

    const [serverList, setServerList] = useState<any>([])
    const [tagList, setTagList] = useState<any>([])

    const [caseFrom, setCaseForm] = useState<any>(null)
    const [suiteForm, setSuiteForm] = useState<any>(null)

    const caseHasMultip = useMemo(() => getHasMuiltip(caseFrom), [caseFrom])
    const suiteHasMultip = useMemo(() => getHasMuiltip(suiteForm), [suiteForm, caseFrom])

    const changeServerSelect = (params: any) => {
        const { server_object_id, server_tag_id, ip, is_instance, customer_server } = params
        const flag = location.search.indexOf('inheriting_machine') !== -1

        if (lodash.isNull(ip)) {
            setServerObjectType('ip')
            return
        }

        if (customer_server && JSON.stringify(customer_server) !== '{}') {
            const { custom_ip, custom_channel } = customer_server
            if (custom_ip && custom_channel) {
                setServerObjectType('ip')
                setServerType('custom')
            }
            return
        }

        if (flag && ip) {
            if (server_type === 'aliyun' && run_mode === 'standalone') {
                if (is_instance === 0) setServerObjectType('setting')
                if (is_instance === 1) setServerObjectType('instance')
            } else {
                setServerObjectType('server_object_id')
            }
            return
        }

        if ((Array.isArray(server_tag_id) && server_tag_id.length) || server_object_id) {
            setServerType('pool')
            if (server_object_id) {
                if (server_type === 'aliyun' && run_mode === 'standalone') {
                    if (is_instance === 0) setServerObjectType('setting')
                    if (is_instance === 1) setServerObjectType('instance')
                }
                else
                    setServerObjectType('server_object_id')
            }
            if (!lodash.isEmpty(server_tag_id)) setServerObjectType('server_tag_id')
            return
        }

        // if (ip === '随机' || ip === '') setServerObjectType('ip')
        setServerObjectType('ip')
    }

    useEffect(() => {
        if (dataSource) {
            const initialValues = {
                repeat: test_type === 'performance' ? 3 : 1,
                need_reboot: false,
                setup_info: '',
                cleanup_info: '',
                console: true,
                priority: 10,
                timeout: 3600,
            }
            if (batch) {
                if (settingType === 'suite') {
                    const { suiteMultip, caseMultip } = getMultipFields(dataSource, true)
                    setCaseForm(caseMultip)
                    setSuiteForm(suiteMultip)
                    const caseParams = getRealParams(caseMultip)
                    const suiteParams = getRealParams(suiteMultip)
                    const { custom_channel, custom_ip, ip, server_object_id, server_tag_id, repeat, timeout } = caseParams
                    const params = { custom_channel, custom_ip, ip, server_object_id, server_tag_id, repeat, timeout }
                    changeServerSelect(params)
                    form.setFieldsValue({ ...suiteParams, ...params })
                }
                else {
                    const { suiteMultip } = getMultipFields(dataSource)
                    setCaseForm(suiteMultip)
                    const resultParams = getRealParams(suiteMultip)
                    const { env_info } = resultParams
                    resultParams.env_info = !env_info || env_info.length === 0 ? [{ val: '', name: '' }] : env_info
                    form.setFieldsValue(resultParams)
                }
            }
            else {
                const params: any = { ...initialValues, ...dataSource }
                if (dataSource.console == undefined) params.console = true
                const { env_info } = dataSource
                if (env_info && env_info.length === 0) {
                    params.env_info = new Array(1).fill({ val: '', name: '' })
                }
                changeServerSelect(params)
                form.setFieldsValue(params)
            }
        }
    }, [batch, dataSource, server_type, settingType])

    useImperativeHandle(ref, () => ({
        show: (drawerType: string, _: any) => {
            setSettingType(drawerType)
            const isBatch = lodash.isArray(_)
            setVisible(true)
            setDataSource(_)
            setBatch(isBatch)
            setLoading(false)
        }
    }))

    const handleClose = useCallback(
        () => {
            form.resetFields()
            setVisible(false)
            setDataSource(null)
            setBatch(false)
            setLoading(true)
            setCaseForm(null)
            setSuiteForm(null)
            setServerList([])
            setTagList([])
            setMask(false)
            setServerType('pool')
            setServerObjectType('ip')
            setSettingType('case')
        }, []
    )

    const filterIp = (id: any) => {
        let ip = ''
        for (let x = 0, len = serverList.length; x < len; x++) {
            const item: any = serverList[x]
            if (item.id === id) {
                if (serverObjectType === 'server_object_id')
                    ip = run_mode === 'cluster' ? item.name : item.ip || item.sn
                if (serverObjectType === 'instance')
                    ip = item.private_ip ? item.private_ip : item.instance_name
                if (serverObjectType === 'setting')
                    ip = item.template_name
                break;
            }
        }
        return ip
    }

    const filterTags = (server_tag_id: any) => (
        server_tag_id.reduce((pre: any, cur: any, index: number) => {
            for (let len = tagList.length, i = 0; i < len; i++)
                if (tagList[i].id === cur) {
                    return pre += `${tagList[i].name}${index + 1 < server_tag_id.length ? ',' : ''}`
                }
            return ''
        }, '')
    )

    const isCustom = () => serverType === 'custom'
    const isTagId = () => !isCustom() && serverObjectType === 'server_tag_id'
    const isObjectId = () => !isCustom() && (serverObjectType && serverObjectType !== 'server_tag_id' && serverObjectType !== 'ip')
    const isRandom = () => !isCustom() && serverObjectType === 'ip'

    const rerenderParams = (params: any, values: any) => {
        const { custom_channel, custom_ip, server_object_id, server_tag_id } = values
        let ip = null
        if (!isCustom()) {
            if (isRandom()) ip = '随机' // formatMessage({id: 'select.suite.random'})
            if (isObjectId()) ip = filterIp(server_object_id)
            if (isTagId()) ip = filterTags(server_tag_id)
        }
        else
            if (custom_channel && custom_ip) ip = custom_ip

        let is_instance = undefined
        if (serverObjectType === 'instance') is_instance = 1
        if (serverObjectType === 'setting') is_instance = 0

        const resultValues = { ...values, ip, is_instance }

        const firstFilterParams = {
            ...params,
            ...Object.keys(resultValues).reduce((p: any, key: any) => {
                const v = resultValues[key]
                if (key === 'env_info') {
                    const r = compact(v)
                    p[key] = r // params[key]
                    return p
                }
                p[key] = v !== undefined && v !== null ? v : params[key]
                return p
            }, {}),
        }

        const DEFAULT_SERVER_SETTING = {
            ...firstFilterParams,
            custom_channel: null, custom_ip: null,
            customer_server: null, server_object_id: null,
            server_tag_id: [],
        }

        if (mask) return firstFilterParams

        if (isCustom())
            return {
                ...DEFAULT_SERVER_SETTING,
                customer_server: {
                    custom_channel,
                    custom_ip
                },
                custom_channel,
                custom_ip,
            }

        if (isTagId())
            return {
                ...DEFAULT_SERVER_SETTING,
                server_tag_id
            }
        if (isObjectId())
            return {
                ...DEFAULT_SERVER_SETTING,
                server_object_id
            }

        return DEFAULT_SERVER_SETTING
    }

    const hanldeOk = () => {
        form.validateFields()
            .then((values: any) => {
                const { custom_channel, custom_ip, server_object_id, server_tag_id, repeat, timeout, ...rest } = values

                const caseParam = { custom_channel, custom_ip, server_object_id, server_tag_id, repeat, timeout }

                const selectIds = batch ? dataSource.map((item: any) => item.id) : [dataSource.id]
                let resultSuiteList = []

                if (settingType === 'suite') {
                    if (batch) {
                        resultSuiteList = testSuiteData.reduce(
                            (pre: any, cur: any) => (
                                pre.concat(
                                    selectIds.includes(cur.id) ?
                                        {
                                            ...cur,
                                            ...rest,
                                            test_case_list: cur.test_case_list.reduce(
                                                (p: any, c: any) => (
                                                    p.concat(rerenderParams(c, caseParam))
                                                ), []
                                            )
                                        } :
                                        cur
                                )
                            ), []
                        )
                    }
                    else {
                        resultSuiteList = testSuiteData.map(
                            (item: any) => item.id === dataSource.id ? { ...item, ...rest } : item
                        )
                    }
                }
                else {
                    resultSuiteList = testSuiteData.reduce((pre: any, cur: any) => pre.concat({
                        ...cur,
                        test_case_list: cur.test_case_list.reduce(
                            (p: any, c: any) => {
                                if (selectIds.includes(c.id)) {
                                    const newVal = rerenderParams(c, values)
                                    return p.concat(newVal)
                                }
                                return p.concat(c)
                            }
                            , []
                        )
                    }), [])
                }

                onDataSourceChange(resultSuiteList, run_mode)
                handleClose()
                onOk()
            })
            .catch((error) => console.log(error))
    }

    const multipInfo = useMemo(() => {
        if (batch && caseFrom) {
            const { ip, custom_ip, repeat, server_tag_id, server_object_id, is_instance, timeout } = caseFrom
            const objectLen = server_object_id ? server_object_id.length : 0
            const tagLen = server_tag_id ? server_tag_id.length : 0
            const customLen = custom_ip ? custom_ip.length : 0

            const random = Array.isArray(ip) ? ip.filter((i: any) => i === '随机') : []
            // const hasRandom = random.length > 0
            let multipPool = (objectLen + tagLen + random.length) > 1
            let multipServer = customLen > 1

            if (multipServer || multipPool) setMask(true)

            if (!multipPool && !multipServer) {
                setServerType('pool')
                if (objectLen === 1) {
                    setServerObjectType('server_object_id')
                    if (server_type === 'aliyun') {
                        if (is_instance && is_instance.length === 1 && run_mode === 'standalone')
                            setServerObjectType(is_instance[0] === 1 ? 'instance' : 'setting')
                        else
                            setServerObjectType('server_object_id')
                    }
                }
                if (tagLen === 1) setServerObjectType('server_tag_id')
                if (customLen === 1) setServerType('custom')
                if (random.length === 1) setServerObjectType('ip')
            }

            // if (hasRandom) setServerObjectType('ip')

            if (!multipPool && multipServer) setServerType('custom')

            if ((objectLen + tagLen + random.length >= 1) && customLen >= 1) {
                setMask(true)
                setServerType('pool')
                setServerObjectType('ip')
                multipServer = true
                multipPool = true
            }
            if (multipPool) setServerObjectType(null)
            return {
                serverPool: multipPool,
                selfServer: multipServer,
                repeat: repeat.length > 1,
                server_tag_id: tagLen > 1,
                server_object_id: objectLen > 1,
                random: random.length > 1,
                timeout: timeout.length > 1,
                setup_info: settingType === 'suite' ? suiteForm.setup_info.length > 1 : caseFrom.setup_info.length > 1,
                cleanup_info: settingType === 'suite' ? suiteForm.cleanup_info.length > 1 : caseFrom.cleanup_info.length > 1
            }
        }
        return { serverPool: false, selfServer: false, repeat: false, cleanup_info: false, setup_info: false, timeout: false }
    }, [caseFrom, batch, server_type, settingType, suiteForm, run_mode])

    const env_info_data = Form.useWatch('env_info', form)

    const validator = ($name: string, field: any) => {
        const name = form.getFieldValue(['env_info', field.name, 'name'])
        const val = form.getFieldValue(['env_info', field.name, 'val'])

        if ($name === 'name') {
            for (const x in env_info_data)
                if (+ x !== field.name && env_info_data[x].name?.trim() === name?.trim())
                    return Promise.reject(formatMessage({ id: 'ws.test.job.variable.name.repeat' }))
        }

        if ($name === 'name' && name) return Promise.resolve()
        if ($name === 'val' && val) return Promise.resolve()

        if (!name && val) {
            return Promise.reject(formatMessage({ id: 'ws.test.job.variable.name.empty' }))
        }

        if (name && !val)
            return Promise.reject(formatMessage({ id: 'ws.test.job.variable.value.empty' }))

        form.setFields([
            { name: ['env_info', field.name, 'name'], errors: [] },
            { name: ['env_info', field.name, 'val'], errors: [] }
        ])
        return Promise.resolve()
    }

    return (
        <DrawerWrapper
            maskClosable={false}
            keyboard={false}
            title={
                <div>
                    <div>{`${batch ? formatMessage({ id: 'select.suite.batch.config' }) : formatMessage({ id: 'select.suite.config' })} ${settingType === 'suite' ? 'Suite' : 'Conf'}`}</div>
                    {
                        !batch &&
                        <NameContent>
                            {dataSource?.title}
                        </NameContent>
                    }
                </div>
            }
            width={376}
            forceRender
            destroyOnClose
            onClose={handleClose}
            open={visible}
            bodyStyle={{ paddingBottom: 80, overflowX: "hidden" }}
            footer={
                <div style={{ textAlign: 'right', padding: '0 8px' }} >
                    <Button onClick={handleClose} style={{ marginRight: 8 }}>
                        <FormattedMessage id="operation.cancel" />
                    </Button>
                    <Button onClick={hanldeOk} type="primary">
                        <FormattedMessage id="operation.ok" />
                    </Button>
                </div>
            }
        >

            <Spin spinning={loading} >
                <DrawerProvider.Provider
                    value={{
                        setLoading,
                        setServerList,
                        setTagList,
                        setServerType,
                        setServerObjectType,
                        setMask,
                        settingType
                    }}
                >
                    <Form
                        layout="vertical"
                        form={form}
                        /*hideRequiredMark*/
                        scrollToFirstError
                    >
                        {
                            ((settingType === 'suite' && suiteHasMultip) || caseHasMultip) && (
                                <div style={{ padding: '0 20px 8px' }}>
                                    <Alert
                                        message={<FormattedMessage id="select.suite.vertical.message" />}
                                        type="warning"
                                        showIcon
                                        style={{ fontSize: 12, padding: '5px 10px' }}
                                    />
                                </div>
                            )
                        }
                        {
                            (batch || settingType === 'case') &&
                            <ServerFormItem
                                {...props}
                                form={form}
                                dataSource={dataSource}
                                visible={visible}
                                multipInfo={multipInfo}
                                loading={loading}
                                serverList={serverList}
                                tagList={tagList}
                                serverType={serverType}
                                serverObjectType={serverObjectType}
                                mask={mask}
                                batch={batch}
                            />
                        }

                        {
                            (contrl.includes('variable') && checked && settingType === 'case') &&
                            <Form.Item
                                label={<FormattedMessage id="select.suite.variable" />}
                                className={'drawer_padding'}>
                                <Form.List
                                    name="env_info"
                                >
                                    {
                                        (fields, { add, remove }) => (
                                            <Row>
                                                {
                                                    fields.map((field, index) => {
                                                        return (
                                                            <Row key={field.key}>
                                                                <div style={{ width: '90%', marginRight: 8 }}>
                                                                    <Space
                                                                        style={{ marginBottom: 8 }}
                                                                        align="start"
                                                                    >
                                                                        <Form.Item
                                                                            name={[field.name, 'name']}
                                                                            rules={[{
                                                                                validator: () => validator('name', field),
                                                                            }]}
                                                                        >
                                                                            <Input
                                                                                autoComplete="off"
                                                                                placeholder={formatMessage({ id: 'ws.test.job.variable.name' })}
                                                                                allowClear
                                                                            />
                                                                        </Form.Item>
                                                                        <span style={{ marginTop: 5, display: 'block' }}>=</span>
                                                                        <Form.Item
                                                                            name={[field.name, 'val']}
                                                                            rules={[{
                                                                                validator: () => validator('val', field),
                                                                            }]}
                                                                        >
                                                                            <Input
                                                                                autoComplete="off"
                                                                                placeholder={formatMessage({ id: 'ws.test.job.variable.value' })}
                                                                                allowClear
                                                                            />
                                                                        </Form.Item>
                                                                    </Space>
                                                                </div>
                                                                {
                                                                    fields.length > 1 &&
                                                                    <DeleteOutlined onClick={() => remove(index)} style={{ marginTop: 10 }} />
                                                                }
                                                            </Row>
                                                        )
                                                    })
                                                }
                                                <Button
                                                    type="link"
                                                    onClick={() => add({ name: '' })}
                                                    size="small"
                                                    style={{ padding: 0, fontSize: 12 }}
                                                >
                                                    {`+ 添加变量`}
                                                </Button>
                                            </Row>
                                        )
                                    }
                                </Form.List>
                            </Form.Item>
                        }

                        {
                            (contrl.includes('reboot') && checked) && (
                                <Form.Item
                                    label={<FormattedMessage id="select.suite.need_reboot" />}
                                    name="need_reboot"
                                    className={'drawer_padding'}
                                >
                                    <Radio.Group>
                                        <Radio value={true}><FormattedMessage id="operation.yes" /></Radio>
                                        <Radio value={false}><FormattedMessage id="operation.no" /></Radio>
                                    </Radio.Group>
                                </Form.Item>
                            )
                        }

                        {
                            (contrl.includes('script') && checked) &&
                            <>
                                <Form.Item
                                    name="setup_info"
                                    label={<FormattedMessage id="select.suite.setup_info" />}
                                    className={'drawer_padding'}
                                >
                                    <Input.TextArea
                                        rows={4}
                                        placeholder={
                                            multipInfo.setup_info ? formatMessage({ id: 'select.suite.setup_info.placeholder' }) : formatMessage({ id: 'select.suite.please.enter' })
                                        }
                                    />
                                </Form.Item>
                                <Form.Item
                                    name="cleanup_info"
                                    label={<FormattedMessage id="select.suite.cleanup_info" />}
                                    className={'drawer_padding'}
                                >
                                    <Input.TextArea
                                        rows={4}
                                        placeholder={
                                            multipInfo.cleanup_info ? formatMessage({ id: 'select.suite.cleanup_info.placeholder' }) : formatMessage({ id: 'select.suite.please.enter' })
                                        }
                                    />
                                </Form.Item>
                            </>
                        }
                        {/* 
                        {
                            // 注释监控配置
                            (contrl.includes('monitor') && checked) &&
                            <MonitorItem />
                        }
                        */}
                        <Form.Item
                            name="priority"
                            label={<QusetionIconTootip title={formatMessage({ id: 'select.suite.priority' })} desc={formatMessage({ id: 'select.suite.priority.desc' })} />}
                            className={'drawer_padding'}
                        >
                            <InputNumber
                                formatter={formatter}
                                style={{ width: '100%' }} min={0} step={1} max={20}
                                placeholder={caseFrom?.priority?.length > 1 ? formatMessage({ id: 'select.suite.multiple.values' }) : formatMessage({ id: 'select.suite.please.enter' })}
                            />
                        </Form.Item>
                    </Form>
                </DrawerProvider.Provider >
            </Spin>
        </DrawerWrapper >
    )
}

export default memo(forwardRef(SuiteDrawer))