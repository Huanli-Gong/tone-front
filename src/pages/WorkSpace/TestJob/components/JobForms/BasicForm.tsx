import React, { useImperativeHandle, useEffect } from 'react'
import { Form, Input, Select } from 'antd'
import styles from './index.less'

import { FormProps } from './index'
import { useRequest, useParams } from 'umi'
import { queryProjectList, queryBaselineList } from '../../services'

/**
 * 基础配置
 */
 export default ({ contrl, disabled = false, callBackProjectId, onRef = null, template = {}, test_type = '', business_type = '', server_provider, baselineListDataRef, projectListDataRef, basicFormData, isYamlFormat }: FormProps) => {
    const [form] = Form.useForm()
    const { ws_id }: any = useParams()

    const { data: projectList, run: getProjectList } = useRequest(
        () => queryProjectList({ ws_id, page_size: 500 }),
        { manual: true, initialData: [] }
    )
    const { data: baselineList, run: getBaselineList } = useRequest(
        () => queryBaselineList({ ws_id, test_type, server_provider, page_size: 500 }),
        { manual: true, initialData: [] }
    )

    useEffect(() => {
        if ('baseline' in contrl) getBaselineList()
        if ('project' in contrl) getProjectList()
    }, [contrl, disabled])

    useImperativeHandle(
        onRef,
        () => ({
            form,
            reset: () => {
                form.resetFields()
            },
            setVal: (data: Object) => {
                form.setFieldsValue(data)
            }
        }),
    )

    useEffect(() => {
        if (projectListDataRef) projectListDataRef.current = projectList
        if (baselineListDataRef) baselineListDataRef.current = baselineList
        if (JSON.stringify(template) !== '{}') {
            const { name, project, baseline, project_id, baseline_id } = template
            const projectId = project || project_id
            const baselineId = baseline || baseline_id
            let obj: any = {}
            if (name) obj.name = name
            if (projectId) {
                const idx = projectList.findIndex((i: any) => i.id === projectId)
                if (idx > -1)
                    obj.project = projectId
            }
            if (baselineId) {
                const idx = baselineList.findIndex((i: any) => i.id === baselineId)
                if (idx > -1)
                    obj.baseline = baselineId
            }
            form.setFieldsValue(obj)
        }
    }, [template, baselineList, projectList])

    useEffect(() => {
        if (projectList.length > 0) {
            if (!form.getFieldValue('project')) {
                const projectObj = projectList.filter((i: any) => i.is_default)[0]
                if (projectObj)
                    form.setFieldsValue({ project: projectObj.id })
            }
            callBackProjectId(projectList[0].id)
        }
    }, [projectList])

    const handleSelect = (val:any) => {
        callBackProjectId(val)
    }

    return (
        <Form
            colon={false}
            layout="horizontal"
            size="small"
            /*hideRequiredMark*/
            labelCol={{ span: 5 }}
            wrapperCol={{ span: 14 }}
            style={{ width: '100%' }}
            name="basic"
            form={form}
            className={styles.job_test_form}
        >
            {
                'job_name' in contrl &&
                <Form.Item
                    name="name"
                    label={contrl.job_name.alias || contrl.job_name.show_name}
                    rules={[{
                        pattern: /^[A-Za-z0-9\._-]+$/g,
                        // pattern : /[^\u4e00-\u9fa5]+/,
                        message: '允许字母、数字、下划线、中划线，“.”，不允许中文'
                    }, {
                        max: 64,
                        message: "Job名称最长不超出64字符"
                    }]}
                >
                    <Input autoComplete="off" placeholder="允许字母、数字、下划线、中划线，“.”，不允许中文" disabled={disabled} />
                </Form.Item>
            }
            {
                'project' in contrl &&
                <Form.Item
                    name="project"
                    label={contrl.project.alias || contrl.project.show_name}
                >
                    <Select allowClear getPopupContainer={node => node.parentNode} disabled={disabled} placeholder="请选择Project" onSelect={handleSelect}>
                        {
                            projectList.map(
                                (item: any) => (
                                    <Select.Option key={item.id} value={item.id} >
                                        {`${item.name}(${item.product_name})`}
                                    </Select.Option>
                                )
                            )
                        }
                    </Select>
                </Form.Item>
            }

            {/** 功能，性能，业务功能，业务性能时，才有测试基线。 */}
            {(['functional', 'performance'].includes(test_type) || ['functional', 'performance'].includes(business_type)) && (
                <>{
                    'baseline' in contrl &&
                    <Form.Item
                        name="baseline"
                        label={contrl.baseline.alias || contrl.baseline.show_name}
                    >
                        <Select allowClear getPopupContainer={node => node.parentNode} disabled={disabled} placeholder="请选择需要对比的测试基线">
                            {
                                baselineList.map(
                                    (item: any) => (
                                        <Select.Option key={item.id} value={item.id} >{item.name}</Select.Option>
                                    )
                                )
                            }
                        </Select>
                    </Form.Item>
                }
                </>
            )}
        </Form>
    )
}