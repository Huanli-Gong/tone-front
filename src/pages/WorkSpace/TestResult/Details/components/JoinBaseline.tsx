/* eslint-disable @typescript-eslint/no-unused-expressions */
import { Drawer, Space, Button, Form, Input, Select, Radio, Spin, message, Divider, Typography } from 'antd'
import React, { useState, forwardRef, useImperativeHandle, useRef } from 'react'
import { useParams, useIntl, FormattedMessage } from 'umi'
import { queryBaselineList, perfJoinBaseline, perfJoinBaselineBatch, createFuncsDetail } from '../service'
import styles from './index.less'
import { PlusOutlined } from '@ant-design/icons'
import BaselineCreate from './BaselineCreate'
import Highlighter from 'react-highlight-words'
import { createBaseline } from '@/pages/WorkSpace/BaselineManage/services'
import { requestCodeMessage } from '@/utils/utils'

const JoinBaseline: React.ForwardRefRenderFunction<any, any> = (props, ref) => {
    const { formatMessage } = useIntl()
    const { ws_id } = useParams() as any
    const { test_type, onOk, accessible } = props

    const [form] = Form.useForm()
    const [visible, setVisible] = useState(false)
    const [source, setSource] = useState<any>({ suite_list: [], suite_data: [] })
    const [padding, setPadding] = useState(false)
    const [loading, setLoading] = useState(false)
    const [baselineFuncList, setBaselineFuncList] = useState([])
    const [baselinePerfList, setBaselinePerfList] = useState([])

    const [funcsSelectVal, setFuncsSelectVal] = useState<any>()
    const [perfChangeVal, setPerfChangeVal] = useState<any>()
    const baselineCreateModal: any = useRef(null)
    const funcsBaselineSelect: any = useRef(null)
    const perBaselineSelect: any = useRef(null)

    const getBaselinePerfData = async () => {
        setLoading(true)
        const { data, code } = await queryBaselineList({
            ws_id,
            test_type,
            // server_provider  不区分环境
        })
        if (code === 200) {
            const list = data.map((item: any) => ({ label: item.name, key: item.id, value: item.id }))
            test_type === 'functional' ? setBaselineFuncList(list) : setBaselinePerfList(list)
            setLoading(false)
        }
    }

    const requestJoinBaseline = async (name: any) => {
        if (!name) return
        const { code, msg, data } = await createBaseline({
            name,
            test_type,
            version: '',
            page_size: 999,
            ws_id,
        })

        if (code === 200) {
            message.success('添加基线成功!!!')
            getBaselinePerfData()
            setFuncsSelectVal(undefined)
            setPerfChangeVal(undefined)
        } else {
            requestCodeMessage(code, msg)
        }

        return data
    }

    useImperativeHandle(
        ref, () => ({
            show: (_: any = false) => {
                setVisible(true)
                getBaselinePerfData()
                if (_) {
                    console.log(_)
                    setSource(_)
                }
                setPerfChangeVal(undefined)
                setFuncsSelectVal(undefined)
            }
        }),
    )

    const handleClose = () => {
        setVisible(false)
        form.resetFields()
        setPadding(false)
        setSource({})
        setFuncsSelectVal(undefined)
    }

    const defaultOption = (code: any, msg: any): void => {
        if (code !== 200) {
            setPadding(false)
            requestCodeMessage(code, msg)
            return
        }
        onOk()
        message.success(formatMessage({ id: 'operation.success' }))
        handleClose()
    }

    const handleOk = () => {
        setPadding(true)
        form
            .validateFields()
            .then(
                async (values: any) => {
                    const { bug } = values
                    const baseParams = { ...values, ws_id, test_type, bug: bug?.trim() }
                    if (source?.suite_list || source?.suite_data) {
                        if (source?.suite_list.length || source?.suite_data.length) {
                            const { suite_list, suite_data, job_id } = source
                            const { code, msg } = await perfJoinBaselineBatch({ ...baseParams, suite_list, suite_data, job_id })
                            defaultOption(code, msg)
                            return
                        }
                    }

                    if (test_type === 'functional') {
                        const { suite_id: test_suite_id, test_case_id, job_id: test_job_id, id } = source
                        const { code, msg } = await createFuncsDetail({ ...baseParams, test_job_id, test_suite_id, test_case_id, result_id: id })
                        defaultOption(code, msg)
                    }
                    else {
                        const { suite_id, test_case_id: case_id, job_id } = source
                        const { code, msg } = case_id ? await perfJoinBaseline({ ...baseParams, job_id, suite_id, case_id }) :
                            await perfJoinBaselineBatch({ ...baseParams, job_id, suite_list: [suite_id] })
                        defaultOption(code, msg)
                    }
                }
            )
            .catch(err => {
                console.log(err)
                setPadding(false)
            })
    }

    const handleFuncsBaselineSelectSearch = (val: any) => {
        setFuncsSelectVal(val)
    }

    const handlePerfBaselineVal = (val: any) => {
        setPerfChangeVal(val)
    }

    const handleFuncsBaselineSelectBlur = async () => {
        if (funcsSelectVal) {
            const data = await requestJoinBaseline(funcsSelectVal)
            if (!data) return
            const { id: baseline_id } = data
            if (baseline_id) {
                const baselineNames = form.getFieldValue('baseline_id') || []
                form.setFieldsValue({ baseline_id: baselineNames.concat([baseline_id]) })
            }
            setFuncsSelectVal('')
            funcsBaselineSelect.current.blur()
        }
    }

    const handlePerfBaselineSelectBlur = async () => {
        if (perfChangeVal) {
            const data = await requestJoinBaseline(perfChangeVal)
            if (!data) return
            const { id: baseline_id } = data
            if (baseline_id) {
                form.setFieldsValue({ baseline_id })
            }
            // setCheckedList([])
            perBaselineSelect.current.blur()
        }
    }

    return (
        <Drawer
            maskClosable={false}
            keyboard={false}
            width="376"
            title={<FormattedMessage id="ws.result.details.join.baseline" />}
            open={visible}
            onClose={handleClose}
            footer={
                <div style={{ textAlign: 'right', }} >
                    <Space>
                        <Button onClick={handleClose}><FormattedMessage id="operation.cancel" /></Button>
                        <Button
                            type="primary"
                            onClick={handleOk}
                            disabled={padding}
                        >
                            <FormattedMessage id="operation.ok" />
                        </Button>
                    </Space>
                </div>
            }
        >
            <Spin spinning={loading} >
                <Form
                    form={form}
                    layout="vertical"
                >
                    {
                        test_type === 'functional' &&
                        <Form.Item label={<FormattedMessage id="ws.result.details.bug" />}
                            name="bug"
                            rules={[{
                                required: true,
                            }]}
                        >
                            <Input placeholder={formatMessage({ id: 'ws.result.details.bug.placeholder' })}
                                autoComplete="off" />
                        </Form.Item>
                    }
                    {
                        test_type === 'performance' &&
                        <div onMouseDown={(e) => e.preventDefault()}>
                            <Form.Item
                                label={<FormattedMessage id="ws.result.details.baseline_id" />}
                                name="baseline_id"
                            >
                                <Select
                                    listHeight={160}
                                    mode="multiple"
                                    getPopupContainer={node => node.parentNode}
                                    onSearch={handlePerfBaselineVal}
                                    ref={perBaselineSelect}
                                    defaultActiveFirstOption={false}
                                    filterOption={
                                        (input, option: any) => option.name.indexOf(input) >= 0
                                    }
                                    loading={loading}
                                    placeholder={formatMessage({ id: 'ws.result.details.baseline_id.placeholder' })}
                                    dropdownStyle={{ padding: 0, margin: 0 }}
                                    onSelect={val => form.setFieldsValue({ baseline_id: val })}
                                    dropdownRender={
                                        menu => (
                                            <>
                                                {menu}
                                                {
                                                    perfChangeVal && !!perfChangeVal.length &&
                                                    <>
                                                        <Divider style={{ margin: '8px 0' }} />
                                                        {
                                                            accessible &&
                                                            <div
                                                                style={{ display: 'inline-block', flexWrap: 'nowrap', width: '100%', padding: '0 0 8px 8px' }}
                                                                onClick={handlePerfBaselineSelectBlur}
                                                            >
                                                                <Space>
                                                                    <PlusOutlined style={{ color: '#1890FF' }} />
                                                                    <span style={{ color: 'rgba(0, 0, 0, 0.85)' }}>
                                                                        <FormattedMessage id="ws.result.details.create.baseline" />
                                                                    </span>
                                                                </Space>
                                                            </div>
                                                        }
                                                    </>
                                                }
                                            </>
                                        )
                                    }
                                    options={
                                        baselinePerfList.map((item: any) => ({
                                            value: item.value,
                                            name: item.label,
                                            label: (
                                                <Typography.Text ellipsis={{ tooltip: item.label }}>
                                                    <Highlighter
                                                        highlightStyle={{ color: '#1890FF', padding: 0, background: 'unset' }}
                                                        searchWords={[funcsSelectVal]}
                                                        autoEscape
                                                        textToHighlight={item.label}
                                                    />
                                                </Typography.Text>
                                            )
                                        }))
                                    }
                                />
                            </Form.Item>
                        </div>
                    }
                    {
                        test_type === 'functional' &&
                        <div onMouseDown={(e) => e.preventDefault()}>
                            <Form.Item
                                label={<FormattedMessage id="ws.result.details.baseline_id" />}
                                name="baseline_id"
                            >
                                <Select
                                    placeholder={formatMessage({ id: 'ws.result.details.baseline_id.placeholder' })}
                                    mode="multiple"
                                    className={styles.select_baseline}
                                    allowClear
                                    optionLabelProp="label"
                                    ref={funcsBaselineSelect}
                                    listHeight={160}
                                    loading={loading}
                                    getPopupContainer={node => node.parentNode}
                                    onSearch={handleFuncsBaselineSelectSearch}
                                    filterOption={
                                        (input, option: any) => option.name.indexOf(input) >= 0
                                    }
                                    dropdownRender={menu => (
                                        <>
                                            {menu}
                                            {
                                                funcsSelectVal && !!funcsSelectVal.length && <>
                                                    <Divider style={{ margin: '8px 0' }} />
                                                    {
                                                        accessible &&
                                                        <div
                                                            style={{ display: 'inline-block', flexWrap: 'nowrap', width: '100%', padding: '0 0 8px 8px' }}
                                                            onClick={handleFuncsBaselineSelectBlur}
                                                        >
                                                            <Space>
                                                                <PlusOutlined style={{ color: '#1890FF' }} />
                                                                <span style={{ color: 'rgba(0, 0, 0, 0.85)' }}>
                                                                    <FormattedMessage id="ws.result.details.create.baseline" />
                                                                </span>
                                                            </Space>
                                                        </div>
                                                    }
                                                </>
                                            }
                                        </>
                                    )}
                                    options={
                                        baselineFuncList.map((item: any) => ({
                                            value: item.value,
                                            name: item.label,
                                            label: (
                                                <Typography.Text ellipsis={{ tooltip: item.label }}>
                                                    <Highlighter
                                                        highlightStyle={{ color: '#1890FF', padding: 0, background: 'unset' }}
                                                        searchWords={[funcsSelectVal]}
                                                        autoEscape
                                                        textToHighlight={item.label}
                                                    />
                                                </Typography.Text>
                                            )
                                        }))
                                    }
                                />
                            </Form.Item>
                        </div>
                    }
                    {
                        test_type === 'functional' &&
                        <>
                            <Form.Item label={<FormattedMessage id="ws.result.details.impact_result" />}
                                name="impact_result"
                                initialValue={true}>
                                <Radio.Group>
                                    <Radio value={true}><FormattedMessage id="operation.yes" /></Radio>
                                    <Radio value={false}><FormattedMessage id="operation.no" /></Radio>
                                </Radio.Group>
                            </Form.Item>
                            <Form.Item label={<FormattedMessage id="ws.result.details.description" />}
                                name="description">
                                <Input.TextArea rows={4} placeholder={formatMessage({ id: 'ws.result.details.description.placeholder' })} />
                            </Form.Item>
                        </>
                    }
                </Form>
            </Spin>
            <BaselineCreate ref={baselineCreateModal} />
        </Drawer>
    )
}

export default forwardRef(JoinBaseline)