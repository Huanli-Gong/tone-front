import { Drawer, Space, Button, Form, Input, Select, Radio, Spin, message, Checkbox, Divider, Popover } from 'antd'
import React, { useState, forwardRef, useImperativeHandle, useRef, useEffect } from 'react'
import { useRequest, useParams, useIntl, FormattedMessage } from 'umi'
import { queryBaselineList, perfJoinBaseline, perfJoinBaselineBatch, createFuncsDetail } from '../service'
import styles from './index.less'
import { PlusOutlined } from '@ant-design/icons'
import BaselineCreate from './BaselineCreate'
import _ from 'lodash'
import Highlighter from 'react-highlight-words'
import { createBaseline } from '@/pages/WorkSpace/Baseline/services'
import { requestCodeMessage } from '@/utils/utils'

const JoinBaseline: React.ForwardRefRenderFunction<any, any> = (props, ref) => {
    const { formatMessage } = useIntl()
    const { ws_id } = useParams() as any
    const { test_type, server_provider, onOk, accessible } = props

    const [form] = Form.useForm()
    const [visible, setVisible] = useState(false)
    const [data, setData] = useState<any>({ suite_list: [], suite_data: [] })
    const [padding, setPadding] = useState(false)

    const [checkedList, setCheckedList] = React.useState<any>([]);
    const [indeterminate, setIndeterminate] = React.useState(false);
    const [checkAll, setCheckAll] = React.useState(false);

    const [baselinePerfList, setBaselinePerfList] = useState([])

    const [funcsSelectVal, setFuncsSelectVal] = useState<any>('')
    const baselineCreateModal: any = useRef(null)
    const funcsBaselineSelect: any = useRef(null)
    const perBaselineSelect: any = useRef(null)

    const { data: baselineList, loading, run: getRequestRun } = useRequest(
        () => queryBaselineList({
            ws_id,
            test_type,
            server_provider
        }),
        {
            formatResult: (response: any) => response.data.map((item: any) => item.name),
            initialData: [],
            manual: true,
        },
    )

    const requestJoinBaseline = async (name: any) => {
        if (!name) return
        const { code } = await createBaseline({
            name,
            server_provider,
            test_type,
            version: '',
            ws_id,
        })

        if (code === 200) getBaselinePerfData()
    }

    const getBaselinePerfData = async () => {
        const { data, code } = await queryBaselineList({
            ws_id,
            test_type,
            server_provider
        })

        if (code === 200) setBaselinePerfList(data.map((item: any) => item.name))
    }

    useImperativeHandle(
        ref, () => ({
            show: (_: any = false) => {
                setVisible(true)
                setCheckAll(false)
                setIndeterminate(false)
                getRequestRun()
                getBaselinePerfData()
                if (_) {
                    setData(_)
                }
            }
        }),
    )

    const handleClose = () => {
        setVisible(false)
        form.resetFields()
        setPadding(false)
        setData({})
        setFuncsSelectVal('')
        setCheckedList([])
    }

    const defaultOption = (code: any, msg: any): void => {
        if (code !== 200) {
            setPadding(false)
            requestCodeMessage(code, msg)
            return
        }
        onOk()
        message.success('操作成功')
        handleClose()
    }

    const handleOk = () => {
        setPadding(true)
        form
            .validateFields()
            .then(
                async (values: any) => {
                    console.log(values)
                    // const { baseline_id } = values
                    if (data.suite_list || data.suite_data) {
                        if (data.suite_list.length || data.suite_data.length) {
                            const baseline_id = values.baseline_id[0] || ''
                            const { suite_list, suite_data, job_id } = data
                            const { code, msg } = await perfJoinBaselineBatch({ server_provider, ws_id, suite_list, suite_data, job_id, baseline_name: baseline_id, test_type })
                            defaultOption(code, msg)
                            return
                        }
                    }

                    if (test_type === 'functional') {
                        const { suite_id: test_suite_id, test_case_id, job_id: test_job_id, id } = data
                        const { code, msg } = await createFuncsDetail({ ...values, server_provider, ws_id, test_job_id, test_suite_id, test_case_id, result_id: id, test_type })
                        defaultOption(code, msg)
                    }
                    else {
                        const { suite_id, test_case_id: case_id, job_id } = data
                        const baseline_id = values.baseline_id[0] || ''
                        const { code, msg } = case_id ? await perfJoinBaseline({ server_provider, ws_id, job_id, suite_id, case_id, baseline_name: baseline_id, test_type }) :
                            await perfJoinBaselineBatch({ server_provider, ws_id, job_id, suite_list: [suite_id], baseline_name: baseline_id, test_type })
                        defaultOption(code, msg)
                    }
                }
            )
            .catch(err => {
                console.log(err)
                setPadding(false)
            })
    }

    const onCheckAllChange = (e: any) => {
        setCheckedList(e.target.checked ? baselineList : []);
        //setIndeterminate(false);
        setCheckAll(e.target.checked);
        if (e.target.checked) {
            let selectValues = _.cloneDeep(form.getFieldValue('baseline_name_list'))
            selectValues = _.isArray(selectValues) ? selectValues : []

            const list = baselineList.map((item: any) => item)
            form.setFieldsValue({ baseline_name_list: [... new Set(list.concat(selectValues))] })
        } else {
            form.setFieldsValue({ baseline_name_list: undefined })
        }
    }

    const onChange = (list: any) => {
        let selectValues = _.cloneDeep(form.getFieldValue('baseline_name_list'))
        selectValues = _.isArray(selectValues) ? selectValues : []
        const customValuArr = _.difference(selectValues, baselineList);
        setCheckedList(list);
        setIndeterminate(!!list.length && list.length < baselineList.length);
        setCheckAll(list.length === baselineList.length);
        form.setFieldsValue({ baseline_name_list: [... new Set(list.concat(customValuArr))] })
    }
    const onPersChange = (list: any) => {
        setCheckedList([])
        if (!list.length) {
            form.setFieldsValue({ baseline_id: [] })
            return
        }
        const length = list.length
        form.setFieldsValue({ baseline_id: [list[length - 1]] })
        setCheckedList(list[length - 1]);
    }

    const handleFuncsBaselineSelectSearch = (val: any) => {
        setFuncsSelectVal(val)
    }

    const handleFuncsBaselineSelectBlur = () => {
        const baselineNames = form.getFieldValue('baseline_name_list') || []
        if (funcsSelectVal) {
            form.setFieldsValue({ baseline_name_list: baselineNames.concat([funcsSelectVal]) })
            setFuncsSelectVal('')
            funcsBaselineSelect.current.blur()
        }
    }

    const handlePerfBaselineSelectBlur = () => {
        if (funcsSelectVal) {
            const baseline_id = form.getFieldValue('baseline_id') || []
            requestJoinBaseline(funcsSelectVal)
            form.setFieldsValue({ baseline_id: baseline_id.concat(funcsSelectVal) })
            setFuncsSelectVal('')
            setCheckedList([])
            perBaselineSelect.current.blur()
        }
    }

    const handleFuncsBaselineSelectChange = (value: any) => {
        setCheckedList(value);
        setIndeterminate(!!value.length && value.length < baselineList.length);
    }

    return (
        <Drawer
            maskClosable={false}
            keyboard={false}
            width="376"
            title={<FormattedMessage id="ws.result.details.join.baseline"/>}
            visible={visible}
            onClose={handleClose}
            footer={
                <div style={{ textAlign: 'right', }} >
                    <Space>
                        <Button onClick={handleClose}><FormattedMessage id="operation.cancel"/></Button>
                        <Button type="primary" onClick={handleOk} disabled={padding}><FormattedMessage id="operation.ok"/></Button>
                    </Space>
                </div>
            }
        >
            <Spin spinning={loading} >
                <Form
                    form={form}
                    layout="vertical"
                /*hideRequiredMark*/
                >
                    {test_type === 'functional' &&
                        <Form.Item label={<FormattedMessage id="ws.result.details.bug"/>}
                            name="bug" 
                            rules={[{
                                required: true,
                            }]}
                        >
                            <Input placeholder={formatMessage({id: 'ws.result.details.bug.placeholder'})}
                                autoComplete="off" />
                        </Form.Item>
                    }
                    {test_type === 'performance' &&
                        <Form.Item label={<FormattedMessage id="ws.result.details.baseline_id"/>}
                            name="baseline_id">
                            <Select
                                mode="multiple"
                                className={styles.pers_select}
                                listHeight={160}
                                getPopupContainer={node => node.parentNode}
                                onSearch={handleFuncsBaselineSelectSearch}
                                // onBlur={handlePerfBaselineSelectBlur}
                                ref={perBaselineSelect}
                                defaultActiveFirstOption={false}
                                filterOption={
                                    (input, option: any) => option.value.indexOf(input) >= 0
                                }
                                placeholder={formatMessage({id: 'ws.result.details.baseline_id.placeholder'})}
                                dropdownStyle={{ padding: 0, margin: 0 }}
                                notFoundContent={
                                    funcsSelectVal && accessible &&
                                    <div
                                        style={{ display: 'inline-block', flexWrap: 'nowrap', width: '100%' }}
                                        onClick={handlePerfBaselineSelectBlur}
                                    >
                                        <span className={styles.join_base_line}>
                                            <PlusOutlined style={{ marginRight: 6, color: '#1890FF' }} />
                                            <FormattedMessage id="ws.result.details.create.baseline" />
                                        </span>
                                    </div>
                                }
                            >
                                {
                                    baselinePerfList.map(
                                        (item: any, index: number) => (
                                            <Select.Option key={index} value={item} >
                                                <Highlighter
                                                    highlightStyle={{ color: '#1890FF', padding: 0, background: 'unset' }}
                                                    searchWords={[funcsSelectVal]}
                                                    autoEscape
                                                    textToHighlight={item}
                                                />
                                            </Select.Option>
                                        )
                                    )
                                }
                            </Select>
                        </Form.Item>
                    }
                    {test_type === 'functional' &&
                        <Form.Item label={<FormattedMessage id="ws.result.details.baseline_id"/>}
                            name="baseline_name_list" >
                            <Select
                                placeholder={formatMessage({id: 'ws.result.details.baseline_id.placeholder'})}
                                mode="multiple"
                                className={styles.select_baseline}
                                allowClear
                                optionLabelProp="label"
                                ref={funcsBaselineSelect}
                                listHeight={160}
                                getPopupContainer={node => node.parentNode}
                                onSearch={handleFuncsBaselineSelectSearch}
                                // onBlur={handleFuncsBaselineSelectBlur}
                                onChange={handleFuncsBaselineSelectChange}
                                filterOption={
                                    (input, option: any) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                }
                                dropdownRender={() => (
                                    <div style={{ maxHeight: 300, overflow: 'auto' }}>
                                        <Checkbox indeterminate={indeterminate} onChange={onCheckAllChange} checked={checkAll} style={{ paddingLeft: 10, height: 32, lineHeight: '32px' }}>全选</Checkbox>
                                        <Checkbox.Group options={baselineList} value={checkedList} onChange={onChange} className={styles.join_baseline} />
                                        <Divider style={{ margin: '2px 0' }} />
                                        {accessible && <div
                                            style={{ display: 'inline-block', flexWrap: 'nowrap', paddingLeft: 10, width: '100%' }}
                                            onClick={handleFuncsBaselineSelectBlur}
                                        >
                                            <span className={styles.join_base_line}>
                                                <PlusOutlined style={{ marginRight: 8, color: '#1890FF' }} />
                                                <FormattedMessage id="ws.result.details.create.baseline" />
                                            </span>
                                        </div>
                                        }
                                    </div>
                                )}
                            />
                        </Form.Item>
                    }
                    {test_type === 'functional' &&
                        <>
                            <Form.Item label={<FormattedMessage id="ws.result.details.impact_result"/>}
                                name="impact_result"
                                initialValue={true}>
                                <Radio.Group>
                                    <Radio value={true}><FormattedMessage id="operation.yes"/></Radio>
                                    <Radio value={false}><FormattedMessage id="operation.no"/></Radio>
                                </Radio.Group>
                            </Form.Item>
                            <Form.Item label={<FormattedMessage id="ws.result.details.description"/>}
                                name="description">
                                <Input.TextArea rows={4} placeholder={formatMessage({id: 'ws.result.details.description.placeholder'})} />
                            </Form.Item>
                            {/* <Form.Item label="备注" name="note">
                                <Input.TextArea rows={4} placeholder="请输入备注信息" />
                            </Form.Item> */}
                        </>
                    }
                </Form>
            </Spin>
            <BaselineCreate ref={baselineCreateModal} />
        </Drawer>
    )
}

export default forwardRef(JoinBaseline)