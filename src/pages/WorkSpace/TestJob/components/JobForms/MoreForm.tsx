/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-shadow */
import React, { useImperativeHandle, useEffect, useState } from 'react'
import { Form, Input, Select, InputNumber } from 'antd'
import styles from './index.less'
import type { FormProps } from './index'
import { tagList } from '@/pages/WorkSpace/TagManage/service'
import { TagSelect } from '@/pages/WorkSpace/DeviceManage/GroupManage/Components/index'
import QuestionCircleComponent from '@/components/Public/QuestionCircle'
import { queryReportTemplateList } from '@/pages/WorkSpace/TestJob/services'
import { useParams, useIntl, FormattedMessage } from 'umi'
import _ from 'lodash'

const { Option } = Select;
export default ({ contrl, disabled = false, onRef = null, template = {}, isReset, tagsDataRef, reportTemplateDataRef }: FormProps) => {
    const { formatMessage } = useIntl()
    const { ws_id }: any = useParams()
    const [form] = Form.useForm()
    const [tags, setTags] = useState<any[]>([])
    const [checkedList, setCheckedList] = React.useState<any>();
    const [reportTemplate, setReportTemplate] = useState<any>([])
    const [defaultTemplate, setDefaultTemplate] = useState({})
    const [callbackUrl, setCallbackUrl] = useState('')
    const [regCallbackUrl, setRegCallbackUrl] = useState<any>(false)

    useImperativeHandle(
        onRef,
        () => ({
            form: form,
            reset: () => {
                form.resetFields()
            },
            setVal: (data: any) => {
                const reg = /^https?:\/\/(([a-zA-Z0-9_-])+(\.)?)*(:\d+)?(\/((\.)?(\?)?=?&?[a-zA-Z0-9_-](\?)?)*)*$/i
                const callbackApi = _.get(data, 'callback_api') || ""
                const flag = reg.test(callbackApi)
                setRegCallbackUrl(callbackApi && !flag)
                setCheckedList(_.get(data, 'report_name') || '')
                setCallbackUrl(callbackApi)
                form.setFieldsValue(data)
            }
        })
    )

    const queryTagList = async () => {
        const { data } = await tagList({ ws_id, page_size: 500 })
        if (tagsDataRef) tagsDataRef.current = data
        setTags(data)
    }

    const getReportTemplate = async () => {
        try {
            const { code, data } = await queryReportTemplateList({ ws_id, page_size: 99999 })
            if (code === 200) {
                const dataSource = _.isArray(data) ? data : []
                const defaultTem = _.find(dataSource, { is_default: true })
                if (reportTemplateDataRef) reportTemplateDataRef.current = dataSource
                setReportTemplate(dataSource)
                setDefaultTemplate(defaultTem)
                // form.setFieldsValue({ report_template: defaultTem.name })
            }
        } catch (e) {
            console.log(e)
        }
    }

    useEffect(() => {
        getReportTemplate()
        queryTagList()
    }, [])

    useEffect(() => {
        if (isReset) {
            setCheckedList('')
            setCallbackUrl('')
        }
    }, [isReset])
    useEffect(() => {
        if (JSON.stringify(template) !== '{}') {
            let notice_subject, email, ding_token
            const { cleanup_info, tags, notice_info, report_name, callback_api, job_timeout } = template
            // debugger
            let report_template = template.report_template || template.report_template_id
            if (_.isArray(notice_info)) {
                notice_info.forEach(
                    (i: any) => {
                        notice_subject = i.subject
                        if (i.type === 'email') email = i.to
                        if (i.type === 'ding') ding_token = i.to
                    }
                )
            }
            if (_.isArray(reportTemplate)) {
                const currentTemplate = _.find(reportTemplate, ['id', report_template])
                report_template = _.get(currentTemplate, 'id')
            }
            form.setFieldsValue({
                cleanup_info,
                tags,
                notice_subject,
                email,
                ding_token,
                report_template,
                report_name,
                callback_api,
                job_timeout
            })
            setCheckedList(report_name)
            setCallbackUrl(callback_api)
        }
    }, [defaultTemplate, reportTemplate, template])

    const onReportChange = (e: any) => {
        const reportSelectVal = e.target.value
        const values = _.cloneDeep(form.getFieldsValue())
        const reportTemplate = _.get(values, 'report_template') || _.get(defaultTemplate, 'id')
        form.setFieldsValue({ ...values, report_name: reportSelectVal, report_template: reportTemplate })
        setCheckedList(reportSelectVal)
    }

    const handleCallbackURLChange = (evt: any) => {
        const value = evt.target.value
        setCallbackUrl(value)
        const values = _.cloneDeep(form.getFieldsValue())
        form.setFieldsValue({ ...values, callback_api: value })
        const reg = /^https?:\/\/(([a-zA-Z0-9_-])+(\.)?)*(:\d+)?(\/((\.)?(\?)?=?&?[a-zA-Z0-9_-](\?)?)*)*$/i
        const flag = reg.test(value)
        setRegCallbackUrl(value && !flag)
    }

    const callbackTips = () => {
        return (
            <>
                <span>
                    <FormattedMessage id="job.form.callback_api.tips" />
                </span>
                <span className={styles.create_doc} onClick={() => window.open(`/help_doc/17`)}>
                    <FormattedMessage id="job.form.callback_api.help.document" />
                </span>
            </>
        )
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
            name="more"
            form={form}
            className={styles.job_test_form}
        >
            {
                'cleanup' in contrl &&
                <Form.Item
                    name="cleanup_info"
                    label={contrl.cleanup.alias || <FormattedMessage id={`job.form.${contrl.cleanup.name}`} />}
                >
                    <Input.TextArea disabled={disabled}
                        placeholder={formatMessage({ id: 'job.form.cleanup_info.placeholder' })}
                    />
                </Form.Item>
            }
            {
                'job_tag' in contrl &&
                <TagSelect
                    tags={tags}
                    // label="Job标签"
                    label={contrl.job_tag.alias || <FormattedMessage id={`job.form.${contrl.job_tag.name}`} />}
                    disabled={disabled}
                />
            }
            {
                'notice_subject' in contrl &&
                <Form.Item
                    name="notice_subject"
                    // label="通知主题"
                    label={contrl.notice_subject.alias || <FormattedMessage id={`job.form.${contrl.notice_subject.name}`} />}
                >
                    <Input autoComplete="off" disabled={disabled}
                        placeholder={formatMessage({ id: 'job.form.notice_subject.placeholder' }, { date: '{date}' },)}
                    />
                </Form.Item>
            }
            {
                'email_notice' in contrl &&
                <Form.Item
                    name="email"
                    // label="邮件通知"
                    label={contrl.email_notice.alias || <FormattedMessage id={`job.form.${contrl.email_notice.name}`} />}
                    rules={[() => ({
                        validator(rule, value) {
                            const reg = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
                            if (value) {
                                const valArr = value.split(/,|，|\n|\s/g)
                                const warry = valArr.filter((str: any) => !reg.test(str))
                                return warry.length === 0 ? Promise.resolve() : Promise.reject(formatMessage({ id: 'job.form.email.validator' }));
                            }
                            else
                                return Promise.resolve()
                        },
                    })]}
                >
                    <Input autoComplete="off" disabled={disabled} placeholder={formatMessage({ id: 'job.form.email.placeholder' })} />
                </Form.Item>
            }
            {
                'ding_notice' in contrl &&
                <Form.Item
                    name="ding_token"
                    // label="钉钉通知"
                    label={contrl.ding_notice.alias || <FormattedMessage id={`job.form.${contrl.ding_notice.name}`} />}
                >
                    <Input autoComplete="off" disabled={disabled}
                        placeholder={formatMessage({ id: 'job.form.ding_token.placeholder' })}
                    />
                </Form.Item>
            }
            {
                'report' in contrl &&
                <Form.Item label={contrl.report.alias || formatMessage({ id: 'job.form.report.label' })} name="report_name">
                    <Input
                        value={checkedList || undefined}
                        onChange={onReportChange}
                        autoComplete="off"
                        disabled={disabled}
                        placeholder={formatMessage({ id: 'job.form.report.placeholder' }, { job_name: '{job_name}', report_seq_id: '{report_seq_id}' },)} />
                    <QuestionCircleComponent contextNode={<div>
                        <FormattedMessage id="job.form.report.tips" />
                        <p style={{ marginBottom: 0 }}>{"{date} {job_name} {job_id} {product_version}"}</p>
                    </div>} />
                </Form.Item>
            }
            {
                checkedList && 'report' in contrl &&
                <Form.Item
                    name="report_template"
                    label={contrl.report.alias || formatMessage({ id: 'job.form.report_template.label' })}
                >
                    <Select
                        showSearch
                        disabled={disabled}
                        placeholder={formatMessage({ id: 'job.form.report_template.placeholder' })}
                        // defaultValue={defaultTemplate.name}
                        optionFilterProp="children"
                        filterOption={
                            (input: any, option: any) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                    >
                        {
                            reportTemplate.map((obj: any) => <Option value={obj.id} key={obj.id}>{obj.name}</Option>)
                        }
                    </Select>
                </Form.Item>
            }
            {
                'callback_api' in contrl &&
                <Form.Item
                    name="callback_api"
                    label={contrl.callback_api.alias || formatMessage({ id: 'job.form.callback_api.label' })}
                    validateStatus={regCallbackUrl && 'error' || undefined}
                    help={regCallbackUrl && formatMessage({ id: 'job.form.callback_api.help' })}
                >
                    <Input
                        value={callbackUrl}
                        onChange={handleCallbackURLChange}
                        autoComplete="off"
                        disabled={disabled}
                        placeholder={formatMessage({ id: 'job.form.callback_api.placeholder' })} />
                    <QuestionCircleComponent
                        contextNode={
                            <div>
                                <FormattedMessage id="job.form.callback_api.icons" />
                                <p style={{ marginBottom: 0 }}>{callbackTips()}</p>
                            </div>
                        }
                    />
                </Form.Item>
            }
            {/* 先在内网环境使用 **/}
            {
                !BUILD_APP_ENV && 'job_timeout' in contrl &&
                <Form.Item
                    name="job_timeout"
                    label={contrl.job_timeout.alias || formatMessage({ id: 'job.form.job_timeout.label' })}
                >
                    <InputNumber
                        autoComplete="off"
                        style={{ width: '100%' }}
                        addonAfter="h"
                        min={0}
                        placeholder={formatMessage({ id: 'job.form.job_timeout.placeholder' })} />
                </Form.Item>
            }
        </Form>
    )
}