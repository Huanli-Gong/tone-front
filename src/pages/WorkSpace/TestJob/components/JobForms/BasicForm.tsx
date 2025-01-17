/* eslint-disable react-hooks/exhaustive-deps */
import React, { useImperativeHandle, useEffect } from 'react'
import { Form, Input, Select } from 'antd'
import styles from './index.less'

import type { FormProps } from './index'
import { useRequest, useParams, useIntl, FormattedMessage } from 'umi'
import { queryProjectList, queryBaselineList, queryWsJobTest } from '../../services'
import { debounce } from 'lodash'

/**
 * 基础配置
 */
export default (props: FormProps) => {
    const { contrl, disabled = false, callBackProjectId, onRef = null, template = {}, test_type = '', business_type = '', baselineListDataRef, projectListDataRef } = props

    const { formatMessage } = useIntl()
    const [form] = Form.useForm()
    const { ws_id }: any = useParams()
    const [jobList, setJobList] = React.useState<any>([])

    const defaultParams = {
        page_num: 1,
        page_size: 20,
        ws_id,
        search: '',
        tab: 'all',
        test_type
    }

    const { data: projectList, run: getProjectList } = useRequest(
        () => queryProjectList({ ws_id, page_size: 500 }),
        { manual: true, initialData: [] }
    )

    const { data: baselineList, run: getBaselineList } = useRequest(
        () => queryBaselineList({ ws_id, test_type, page_size: 500 }),
        { manual: true, initialData: [] }
    )

    const getJobList = async (params: any) => {
        const { data } = await queryWsJobTest(params)
        setJobList(data)
    }

    useEffect(() => {
        if ('baseline' in contrl) getBaselineList()
        if ('project' in contrl) getProjectList()
        if ('baseline_job' in contrl) getJobList(defaultParams)
    }, [contrl, disabled])

    useImperativeHandle(
        onRef,
        () => ({
            form,
            reset: () => {
                form.resetFields()
            },
            setVal: (data: any) => {
                form.setFieldsValue(data)
            }
        }),
    )

    React.useEffect(() => {
        if (projectListDataRef) projectListDataRef.current = projectList
        if (baselineListDataRef) baselineListDataRef.current = baselineList
        if (JSON.stringify(template) !== '{}') {
            const { project, baseline, project_id, baseline_id, baseline_job, baseline_job_id } = template
            const projectId = project || project_id
            const baselineId = baseline || baseline_id
            const baselineJobId = baseline_job || baseline_job_id
            if (projectId && projectList.length > 0) {
                const idx = projectList.findIndex((i: any) => i.id === projectId)
                form.setFieldsValue({ project: ~idx ? projectId : undefined })
            }
            if (baselineId && baselineList.length > 0) {
                const idx = baselineList.findIndex((i: any) => i.id === baselineId)
                form.setFieldsValue({ baseline: ~idx ? baselineId : undefined })
            }
            if (baselineJobId && jobList.length > 0) {
                const idx = jobList.findIndex((i: any) => i.id === baselineJobId)
                form.setFieldsValue({ baseline_job_id: ~idx ? baselineJobId : undefined })
            }
        }
    }, [projectList, baselineList, jobList, template])

    useEffect(() => {
        if (JSON.stringify(template) !== '{}') {
            const { baseline_id } = template
            form.setFieldsValue({ ...template, baseline_id })
        }
        return () => {
            form.resetFields()
        }
    }, [template])

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

    const handleSelect = (val: any) => {
        callBackProjectId(val)
    }

    const handleBaselineJobSelect = debounce((val: string) => {
        getJobList({ ...defaultParams, search: val })
    }, 500)

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
                    label={contrl.job_name.alias || <FormattedMessage id={`job.form.${contrl.job_name.name}`} />}
                    rules={[{
                        // pattern: /^[A-Za-z0-9\{}\._-]+$/g,
                        message: formatMessage({ id: 'job.form.job_name.message' }, { date: '{date}' },)
                    }, {
                        max: 128,
                        message: formatMessage({ id: 'job.form.job_name.limit.message' })
                    }]}
                >
                    <Input
                        autoComplete="off"
                        title={formatMessage({ id: 'job.form.job_name.message' }, { date: '{date}' },)}
                        placeholder={formatMessage({ id: 'job.form.job_name.message' }, { date: '{date}' },)}
                        disabled={disabled}
                    />
                </Form.Item>
            }
            {
                'project' in contrl &&
                <Form.Item
                    name="project"
                    label={contrl.project.alias || <FormattedMessage id={`job.form.${contrl.project.name}`} />}
                >
                    <Select
                        allowClear
                        getPopupContainer={node => node.parentNode}
                        showSearch
                        disabled={disabled}
                        placeholder={formatMessage({ id: 'job.form.project.placeholder' })}
                        onSelect={handleSelect}
                        filterOption={(inputValue, option: any) => option.label.indexOf(inputValue) >= 0}
                        options={
                            projectList.map(
                                (item: any) => ({
                                    label: `${item.name}(${item.product_name})`,
                                    value: item.id
                                })
                            )
                        }
                    />
                </Form.Item>
            }

            {/** 功能，性能，业务功能，业务性能时，才有测试基线。 */}
            {(['functional', 'performance'].includes(test_type) || ['functional', 'performance'].includes(business_type)) && (
                'baseline' in contrl &&
                <Form.Item
                    name="baseline"
                    label={contrl.baseline.alias || <FormattedMessage id={`job.form.${contrl.baseline.name}`} />}
                >
                    <Select
                        allowClear
                        getPopupContainer={node => node.parentNode}
                        showSearch
                        disabled={disabled}
                        placeholder={formatMessage({ id: 'job.form.baseline.placeholder' })}
                        filterOption={(inputValue, option: any) => option.label.indexOf(inputValue) >= 0}
                        options={
                            baselineList.map(
                                (item: any) => ({
                                    label: item.name,
                                    value: item.id
                                })
                            )
                        }
                    />
                </Form.Item>
            )}
            {
                'baseline_job' in contrl &&
                <Form.Item
                    name="baseline_job_id"
                    label={contrl.baseline_job.alias || <FormattedMessage id={`job.form.${contrl.baseline_job.name}`} />}
                >
                    <Select
                        allowClear
                        showSearch
                        getPopupContainer={node => node.parentNode}
                        placeholder={formatMessage({ id: 'job.form.baseline_job_id.placeholder' })}
                        onSearch={handleBaselineJobSelect}
                        disabled={disabled}
                        filterOption={false}
                        options={
                            jobList.map((item: any) => ({
                                label: `#${item.id} ${item.name}`,
                                value: item.id
                            }))
                        }
                    />
                </Form.Item>
            }
        </Form>
    )
}