/* eslint-disable react/no-array-index-key */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useImperativeHandle, forwardRef, useEffect } from 'react'
import { Form, Input, Radio, Switch, Cascader, Select, Row, Typography } from 'antd'
import { queryReportTemplateList } from '@/pages/WorkSpace/TestJob/services'
import { QusetionIconTootip } from '@/pages/WorkSpace/TestResult/Details/components'
import styles from './index.less'
import _ from 'lodash'
import { useParams, useIntl, FormattedMessage } from 'umi'

export default forwardRef((props: any, ref: any) => {
    const { formatMessage } = useIntl()
    const { show, template } = props

    const { route } = props
    const { ws_id } = useParams() as any
    const [form] = Form.useForm()
    // 触发开关
    const [trigger, setTrigger] = useState(false)
    // 报告模板数据源
    const [reportTemplate, setReportTemplate] = useState<any>([])

    // 选择分组
    const [groupMethod, setGroupMethod] = useState("no")
    // 根据选择分组，选择基准组数据源。
    const [testConfig, setTestConfig] = useState<any>([]) // 阶段数据
    const [envPrep, setEnvPrep] = useState<any>([]) // 所有阶段数据中的模板数据集合

    // 1.请求数据
    const getReportTemplate = async () => {
        try {
            const { code, data } = await queryReportTemplateList({ ws_id, page_size: 99999 })
            if (code === 200) {
                const dataSource = _.isArray(data) ? data : []
                const defaultTem = _.find(dataSource, { is_default: true })
                setReportTemplate(dataSource)
                if (route.name === "Create")
                    form.setFieldsValue({ report_template_id: defaultTem.id })
            }
        } catch (e) {
            console.log(e)
        }
    }

    useEffect(() => {
        getReportTemplate()
    }, [])

    // 编辑
    useEffect(() => {
        if (template && Object.keys(template).length) {
            const { auto_report, group_method = "no", base_group, base_group_info, report_template_id, test_config, } = template
            const { stage_id, } = base_group_info || {}
            setTrigger(auto_report)
            // 表单数据回填
            if (auto_report) {
                const defaultTem = _.find(reportTemplate, { is_default: true })
                // *根据“分组方式”区分base_group字段回填数据

                let baseGroupObj = {}
                if (group_method === "job")
                    baseGroupObj = { base_group_job: stage_id ? [stage_id, base_group] : [] }
                if (group_method === "stage")
                    baseGroupObj = { base_group_stage: base_group || undefined }

                form.setFieldsValue({
                    ...template,
                    group_method,
                    // base_group字段数据回填
                    ...baseGroupObj,
                    report_template_id: report_template_id || _.get(defaultTem, 'id')
                })
                setGroupMethod(group_method)

                // 根据后端返回数据，重组基准组的数据源
                if (test_config) {
                    const modules = test_config?.map((item: any, index: any) => {
                        return {
                            value: index + 1,
                            label: item.name,
                            children: item?.template?.map((key: any) => ({
                                value: key.id,
                                label: key.name,
                            })) || [],
                        }
                    }) || []
                    setTestConfig(test_config)
                    setEnvPrep(modules)
                }
            }
        }
    }, [template, reportTemplate])

    useImperativeHandle(ref, () => ({
        validate: async () => {
            return form.validateFields()
        },
        refreshData: (test_config: any) => {
            // 步骤2的基准组数据改变时。
            if (test_config) {
                // step3.重新设置数据源。
                const modules = test_config?.map((item: any, index: any) => {
                    return {
                        value: index + 1,
                        label: item.name,
                        key: index,
                        children: item?.template?.map((key: any) => ({
                            value: key.id,
                            label: key.name,
                        })) || [],
                    }
                }) || [];
                setTestConfig(test_config)
                setEnvPrep(modules)

                // step2. 根据数据源，判断是否要重置选项值
                if (groupMethod === 'stage') {
                    const baseGroup: number = form.getFieldValue('base_group_stage');
                    // 如果之前已选的“基准组阶段值”不在当前数据源中，则重置表单
                    (baseGroup > test_config?.length) && form.setFieldsValue({ base_group_stage: undefined });
                } else if (groupMethod === 'job') {
                    const baseGroup: any = form.getFieldValue('base_group_job');
                    if (Array.isArray(baseGroup)) {
                        const step = baseGroup[0]
                        // 如果之前已选的“基准组值”不在当前数据源中，则重置表单
                        if (step && !modules[step - 1]?.children?.map((key: any) => key.value).includes(baseGroup[1])) {
                            form.setFieldsValue({ base_group_job: undefined });
                        }
                    }
                }
            }
        }
    }))

    return (
        <div style={{ width: '100%', height: '100%', paddingTop: 50, display: show }}>
            <Form
                form={form}
                layout="horizontal"
                size="small"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 12 }}
                style={{ width: '100%' }}
                colon={false}
                className={styles.job_plan_form}
                initialValues={{ group_method: "no" }}
            >
                <Form.Item label={<FormattedMessage id="plan.generate.reports" />}
                    name="auto_report">
                    <Switch onChange={setTrigger} checked={trigger}
                        size="default"
                        checkedChildren={<FormattedMessage id="plan.checked" />}
                        unCheckedChildren={<FormattedMessage id="plan.unChecked" />}
                    />
                </Form.Item>
                {trigger && (
                    <>
                        <Form.Item label={<FormattedMessage id="plan.report_name" />}>
                            <div style={{ position: 'relative' }}>
                                <Form.Item name="report_name">
                                    <Input autoComplete="off" placeholder={formatMessage({ id: 'plan.report_name.placeholder' }, { Job_name: '{Job_name}', report_seq_id: '{report_seq_id}' })} />
                                </Form.Item>
                                <div style={{ position: 'absolute', right: -22, top: -4 }}>
                                    <QusetionIconTootip
                                        title=""
                                        placement="bottomRight"
                                        desc={
                                            <>
                                                <Row><Typography.Text><FormattedMessage id="plan.available.placeholders" /></Typography.Text></Row>
                                                <Row><Typography.Text>{`{date} {plan_name} {plan_id} {product_version}`}</Typography.Text></Row>
                                            </>
                                        }
                                    />
                                </div>
                            </div>
                        </Form.Item>
                        <Form.Item
                            label={<FormattedMessage id="plan.select.report.template" />}
                            name="report_template_id"
                        >
                            <Select
                                placeholder={formatMessage({ id: 'please.select' })}
                                getPopupContainer={node => node.parentNode}
                                showSearch
                                optionFilterProp="children"
                                filterOption={
                                    (input: any, option: any) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                }
                            >
                                {reportTemplate.map((item: any) => (
                                    <Select.Option key={item.id} value={item.id}>{item.name}</Select.Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item label={<FormattedMessage id="plan.group_method" />}
                            name="group_method"
                        >
                            <Radio.Group onChange={(e) => { setGroupMethod(e.target.value) }}>
                                <Radio value={"no"}><FormattedMessage id="plan.group_method.not" /></Radio>
                                <Radio value={'job'}><FormattedMessage id="plan.group_method.job" /></Radio>
                                <Radio value={'stage'}><FormattedMessage id="plan.group_method.stage" /></Radio>
                            </Radio.Group>
                        </Form.Item>
                        {groupMethod === 'job' && (
                            <Form.Item
                                label={<FormattedMessage id="plan.select.base_group" />}
                                name="base_group_job"
                                rules={[
                                    { required: true, message: formatMessage({ id: 'plan.select.base_group.message' }) }
                                ]}>
                                <Cascader placeholder={formatMessage({ id: 'plan.select.base_group.message' })} options={envPrep || []} expandTrigger="hover" className={styles.cascaderStyle} />
                            </Form.Item>
                        )}
                        {groupMethod === 'stage' && (
                            <Form.Item
                                label={<FormattedMessage id="plan.select.base_group" />}
                                name="base_group_stage"
                                rules={[
                                    { required: true, message: formatMessage({ id: 'plan.select.base_group.message' }) }
                                ]}>
                                <Select placeholder={formatMessage({ id: 'plan.select.base_group.message' })} getPopupContainer={node => node.parentNode}>
                                    {testConfig.map((item: any, index: number) =>
                                        <Select.Option key={index + 1} value={index + 1}>{item.name}</Select.Option>
                                    )}
                                </Select>
                            </Form.Item>
                        )}

                        <Form.Item label={<FormattedMessage id="plan.report_description" />}
                            name="report_description"
                            rules={[
                                { required: false },
                                { max: 500, message: formatMessage({ id: 'plan.limit.characters' }) },
                            ]}>
                            <Input.TextArea placeholder={formatMessage({ id: 'plan.report_description.placeholder' })} />
                        </Form.Item>
                    </>
                )}
            </Form>
        </div>
    )
})