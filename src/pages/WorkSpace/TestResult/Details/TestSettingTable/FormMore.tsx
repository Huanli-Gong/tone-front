/* eslint-disable react-hooks/exhaustive-deps */
import React, { useImperativeHandle, useEffect, useState, useMemo } from 'react'
import { Form, Input, Card, Row, Col, Popover, Select, InputNumber } from 'antd'
import styles from './index.less'
import { tagList } from '@/pages/WorkSpace/TagManage/service'
import { TagSelect } from '@/pages/WorkSpace/DeviceManage/GroupManage/Components/index'
import { QuestionCircleOutlined } from '@ant-design/icons'
import { queryReportTemplateList } from '@/pages/WorkSpace/TestJob/services'
import _ from 'lodash'
import { useParams, useIntl, FormattedMessage, getLocale } from "umi"

const { Option } = Select;

export default ({ contrl, disabled = false, onRef = null, template = {} }: any) => {
    const { ws_id, share_id } = useParams() as any
    if (JSON.stringify(contrl) === '{}') return <></>

    const { formatMessage } = useIntl()
    const locale = getLocale() === 'en-US';
    const [form] = Form.useForm()
    const [tags, setTags] = useState<any[]>([])
    const [tagsSelected, setTagsSelected] = useState<any[]>([])
    const [checkedList, setCheckedList] = React.useState<any>();
    const [reportTemplate, setReportTemplate] = useState<any>([])
    const [defaultTemplate, setDefaultTemplate] = useState<any>({})

    useImperativeHandle(
        onRef,
        () => ({
            form: form,
            reset: () => {
                form.resetFields()
            }
        })
    )

    const queryTagList = async () => {
        const { data } = await tagList({ ws_id, share_id })
        setTags(data)
    }

    const getReportTemplate = async () => {
        try {
            const { code, data } = await queryReportTemplateList({ ws_id, page_size: 99999, share_id })
            if (code === 200) {
                const dataSource = _.isArray(data) ? data : []

                const defaultTem = _.find(dataSource, { is_default: true })
                setReportTemplate(dataSource)
                setDefaultTemplate(defaultTem)
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
        const values = _.cloneDeep(form.getFieldsValue())
        if (JSON.stringify(template) === '{}' && JSON.stringify(defaultTemplate) !== '{}') {

            form.setFieldsValue({
                ...values,
                report_template_id: _.get(defaultTemplate, 'id')
            })
        }
        if (JSON.stringify(template) !== '{}') {
            let notice_subject, email, ding_token
            const { cleanup_info, tags: $tags, notice_info, report_name, callback_api } = template
            let report_template_id = template.report_template_id
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
                const currentTemplate = _.find(reportTemplate, ['id', template.report_template_id])
                report_template_id = _.get(currentTemplate, 'id')
            }

            form.setFieldsValue({
                ...template,
                cleanup_info,
                tags: $tags,
                notice_subject,
                email,
                ding_token,
                report_template_id,
                report_name,
                callback_api
            })
            setTagsSelected($tags)
            setCheckedList(report_name)
        }
    }, [defaultTemplate, reportTemplate, template])

    const onReportChange = (e: any) => {
        const reportSelectVal = e.target.value
        const values = _.cloneDeep(form.getFieldsValue())
        form.setFieldsValue({ ...values, report_name: reportSelectVal })
        setCheckedList(reportSelectVal)
    }

    const tagsObj = useMemo(() => tags?.filter((item: any)=> tagsSelected?.includes(item.id)), [tagsSelected, tags])

    return (
        <Card
            title={<FormattedMessage id="ws.result.details.more.configurations" />}
            bodyStyle={{ paddingTop: 0 }}
            headStyle={{ borderBottom: 'none' }}
        >
            {/* {
                && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
            } */}
            <Form
                colon={false}
                layout="horizontal"
                size="small"
                labelCol={{
                    span: 4
                }}
                /*hideRequiredMark*/
                style={{ width: '100%' }}
                name="more"
                form={form}
                className={`${styles.job_test_form} ${styles[locale ? 'label_style_form_en' : 'label_style_form']}`}
            >
                <Row>
                    <Col span={15}>
                        {
                            'cleanup' in contrl &&
                            <Form.Item
                                name="cleanup_info"
                                // label="清理脚本"
                                label={contrl.cleanup.alias || <FormattedMessage id={`ws.result.details.${contrl.cleanup.name}`} />}
                            >
                                <Input.TextArea disabled={disabled} placeholder={formatMessage({ id: 'ws.result.details.cleanup.placeholder' })} />
                            </Form.Item>
                        }
                        {
                            'job_tag' in contrl &&
                            <TagSelect
                                tags={tags}
                                initialValue={tagsObj}
                                // label="Job标签"
                                label={contrl.job_tag.alias || <FormattedMessage id={`ws.result.details.${contrl.job_tag.name}`} />}
                                disabled={disabled}
                            />
                        }
                        {
                            'notice_subject' in contrl &&
                            <Form.Item
                                name="notice_subject"
                                // label="通知主题"
                                label={contrl.notice_subject.alias || <FormattedMessage id={`ws.result.details.${contrl.notice_subject.name}`} />}
                            >
                                <Input autoComplete="off" disabled={disabled} placeholder={formatMessage({ id: 'ws.result.details.notice_subject.placeholder' }, { date: '{date}' })} />
                            </Form.Item>
                        }
                        {
                            'email_notice' in contrl &&
                            <Form.Item
                                name="email"
                                // label="邮件通知"
                                label={contrl.email_notice.alias || <FormattedMessage id={`ws.result.details.${contrl.email_notice.name}`} />}
                                rules={[{
                                    pattern: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                                    message: formatMessage({ id: 'ws.result.details.email.message' })
                                }]}
                            >
                                <Input autoComplete="off" disabled={disabled} placeholder={formatMessage({ id: 'ws.result.details.email.placeholder' })} />
                            </Form.Item>
                        }
                        {
                            'ding_notice' in contrl &&
                            <Form.Item
                                name="ding_token"
                                // label="钉钉通知"
                                label={contrl.ding_notice.alias || <FormattedMessage id={`ws.result.details.${contrl.ding_notice.name}`} />}
                            >
                                <Input autoComplete="off" disabled={disabled} placeholder={formatMessage({ id: 'ws.result.details.ding_notice.placeholder' })} />
                            </Form.Item>
                        }
                        {
                            'report' in contrl &&
                            <Form.Item label={contrl?.report?.alias || <FormattedMessage id="ws.result.details.report" />}
                                name="report_name">
                                <Input
                                    value={checkedList || undefined}
                                    onChange={onReportChange}
                                    autoComplete="off"
                                    disabled={disabled}
                                    placeholder={formatMessage({ id: 'ws.result.details.report.placeholder' }, { job_name: '{job_name}', report_seq_id: '{report_seq_id}' })} />
                                <Popover
                                    content={
                                        <div>
                                            {formatMessage({ id: 'ws.result.details.report.Popover' })}
                                            <p>{"{date} {job_name} {job_id} {product_version}"}</p>
                                        </div>
                                    }
                                >
                                    <QuestionCircleOutlined
                                        className={styles.question_icon}
                                    />
                                </Popover>
                            </Form.Item>
                        }
                        {
                            checkedList && 'report' in contrl &&
                            <Form.Item
                                name="report_template_id"
                                label={contrl?.report?.alias || <FormattedMessage id="ws.result.details.report_template" />}
                            >
                                <Select
                                    showSearch
                                    disabled={disabled}
                                    placeholder={formatMessage({ id: 'ws.result.details.report_template.placeholder' })}
                                    defaultValue={defaultTemplate?.name}
                                    optionFilterProp="children"
                                    filterOption={(input, option) =>
                                        option?.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                    }
                                >
                                    {
                                        reportTemplate.map((obj: any) => <Option key={obj.id} value={obj.id}>{obj.name}</Option>)
                                    }
                                </Select>
                            </Form.Item>
                        }
                        {
                            'callback_api' in contrl &&
                            <Form.Item
                                name="callback_api"
                                label={contrl?.callback_api?.alias || <FormattedMessage id="ws.result.details.callback_api" />}
                            >
                                <Input
                                    autoComplete="off"
                                    disabled={disabled}
                                    placeholder={formatMessage({ id: 'ws.result.details.callback_api.placeholder' })} />
                            </Form.Item>
                        }

                        {/* 先在内网环境使用 **/}
                        {
                            !BUILD_APP_ENV && 'job_timeout' in contrl &&
                            <Form.Item
                                name="job_timeout"
                                label={contrl?.job_timeout?.alias || formatMessage({ id: 'job.form.job_timeout.label' })}
                            >
                                <InputNumber
                                    autoComplete="off"
                                    disabled={disabled}
                                    style={{ width: '100%' }}
                                    addonAfter="h"
                                    min={0}
                                    placeholder={formatMessage({ id: 'job.form.job_timeout.placeholder' })}
                                />
                            </Form.Item>
                        }
                    </Col>
                </Row>
            </Form>
        </Card>
    )
}