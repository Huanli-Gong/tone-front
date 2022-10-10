import React, { useState, useImperativeHandle, forwardRef, useEffect } from 'react'
import { Form, Input, Radio, Switch, Cascader, Select, Row, Typography } from 'antd'
import { queryReportTemplateList } from '@/pages/WorkSpace/TestJob/services'
import { QusetionIconTootip } from '@/pages/WorkSpace/TestResult/Details/components'
import styles from './index.less'
import _ from 'lodash'
import { useParams } from 'umi'

export default forwardRef((props: any, ref: any) => {
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
                let dataSource = _.isArray(data) ? data : []
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
                <Form.Item label="自动生成报告"
                    name="auto_report">
                    <Switch onChange={setTrigger} checked={trigger}
                        size="default" checkedChildren="开" unCheckedChildren="关" />
                </Form.Item>
                {trigger && (
                    <>
                        <Form.Item label="报告名称">
                            <div style={{ position: 'relative' }}>
                                <Form.Item name="report_name">
                                    <Input autoComplete="off" placeholder="请输入报告名称，例如：{Job_name}_report-{report_seq_id}" />
                                </Form.Item>
                                <div style={{ position: 'absolute', right: -22, top: -4 }}>
                                    <QusetionIconTootip
                                        title=""
                                        placement="bottomRight"
                                        desc={
                                            <>
                                                <Row><Typography.Text>报告名称可用占位符： </Typography.Text></Row>
                                                <Row><Typography.Text>{`{date} {plan_name} {plan_id} {product_version}`}</Typography.Text></Row>
                                            </>
                                        }
                                    />
                                </div>
                            </div>
                        </Form.Item>
                        <Form.Item
                            label="选择报告模板"
                            name="report_template_id"
                        >
                            <Select
                                placeholder={'请选择报告模板'}
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

                        <Form.Item label="分组方式"
                            name="group_method"
                        >
                            <Radio.Group onChange={(e) => { setGroupMethod(e.target.value) }}>
                                <Radio value={"no"}>不分组</Radio>
                                <Radio value={'job'}>以Job维度分组</Radio>
                                <Radio value={'stage'}>以阶段维度分组</Radio>
                            </Radio.Group>
                        </Form.Item>
                        {groupMethod === 'job' && (
                            <Form.Item
                                label="选择基准组"
                                name="base_group_job"
                                rules={[{
                                    required: true,
                                    message: "基准组不能为空"
                                }]}
                            >
                                <Cascader placeholder="请选择基准组" options={envPrep || []} expandTrigger="hover" className={styles.cascaderStyle} />
                            </Form.Item>
                        )}
                        {groupMethod === 'stage' && (
                            <Form.Item
                                label="选择基准组"
                                name="base_group_stage"
                                rules={[{
                                    required: true,
                                    message: "基准组不能为空"
                                }]}
                            >
                                <Select placeholder="请选择基准组" getPopupContainer={node => node.parentNode}>
                                    {testConfig.map((item: any, index: number) =>
                                        <Select.Option key={index + 1} value={index + 1}>{item.name}</Select.Option>
                                    )}
                                </Select>
                            </Form.Item>
                        )}

                        <Form.Item label="报告描述"
                            name="report_description"
                            rules={[
                                { required: false },
                                { max: 500, message: '限制最长500个字符' },
                            ]}>
                            <Input.TextArea placeholder="请输入报告描述" />
                        </Form.Item>
                    </>
                )}
            </Form>
        </div>
    )
})