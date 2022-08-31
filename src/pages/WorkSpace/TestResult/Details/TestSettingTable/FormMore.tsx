import React, { useImperativeHandle, useEffect, useState } from 'react'
import { Form, Input, Card, Row, Col, Popover, Select } from 'antd'
import styles from './index.less'
import { tagList } from '@/pages/WorkSpace/TagManage/service'
import { TagSelect } from '@/pages/WorkSpace/DeviceManage/GroupManage/Components/index'
import { QuestionCircleOutlined } from '@ant-design/icons'
import { queryReportTemplateList } from '@/pages/WorkSpace/TestJob/services'
import _ from 'lodash'
import { useParams, useIntl, FormattedMessage } from "umi"

const { Option } = Select;

export default ({ contrl, disabled = false, onRef = null, template = {} }: any) => {
    const { ws_id } = useParams() as any
    if (JSON.stringify(contrl) === '{}') return <></>

    const { formatMessage } = useIntl()
    const [form] = Form.useForm()
    const [tags, setTags] = useState<Array<any>>([])
    const [checkedList, setCheckedList] = React.useState<any>();
    const [reportTemplate, setReportTemplate] = useState<any>([])
    const [defaultTemplate, setDefaultTemplate] = useState({})

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
        const { data } = await tagList({ ws_id })
        setTags(data)
    }

    const getReportTemplate = async () => {
        try {
            const { code, data } = await queryReportTemplateList({ ws_id, page_size: 99999 })
            if (code === 200) {
                let dataSource = _.isArray(data) ? data : []

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
            const { cleanup_info, tags, notice_info, report_name, callback_api } = template
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
                cleanup_info,
                tags,
                notice_subject,
                email,
                ding_token,
                report_template_id,
                report_name,
                callback_api
            })
            setCheckedList(report_name)
        }
    }, [defaultTemplate, reportTemplate, template])

    const onReportChange = (e: any) => {
        const reportSelectVal = e.target.value
        const values = _.cloneDeep(form.getFieldsValue())
        form.setFieldsValue({ ...values, report_name: reportSelectVal })
        setCheckedList(reportSelectVal)
    }
    // console.log(contrl, 'contrl')
    return (
        <Card
            title={<FormattedMessage id="ws.result.details.more.configurations"/>}
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
                /*hideRequiredMark*/
                style={{ width: '100%' }}
                name="more"
                form={form}

                className={`${styles.job_test_form} ${styles.label_style_form}`}
            >
                <Row>
                    <Col span={10}>
                        {
                            'cleanup' in contrl &&
                            <Form.Item
                                name="cleanup_info"
                                // label="清理脚本"
                                label={contrl.cleanup.alias || <FormattedMessage id={`ws.result.details.${contrl.cleanup.name}`}/> }
                            >
                                <Input.TextArea disabled={disabled} placeholder={formatMessage({id: 'ws.result.details.cleanup.placeholder'})} />
                            </Form.Item>
                        }
                        {
                            'job_tag' in contrl &&
                            <TagSelect
                                tags={tags}
                                // label="Job标签"
                                label={contrl.job_tag.alias || <FormattedMessage id={`ws.result.details.${contrl.job_tag.name}`}/> }
                                disabled={disabled}
                            />
                        }
                        {
                            'notice_subject' in contrl &&
                            <Form.Item
                                name="notice_subject"
                                // label="通知主题"
                                label={contrl.notice_subject.alias || <FormattedMessage id={`ws.result.details.${contrl.notice_subject.name}`}/> }
                            >
                                <Input autoComplete="off" disabled={disabled} placeholder={formatMessage({id: 'ws.result.details.notice_subject.placeholder'})} />
                            </Form.Item>
                        }
                        {
                            'email_notice' in contrl &&
                            <Form.Item
                                name="email"
                                // label="邮件通知"
                                label={contrl.email_notice.alias || <FormattedMessage id={`ws.result.details.${contrl.email_notice.name}`}/> }
                                rules={[{
                                    pattern: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                                    message: formatMessage({id: 'ws.result.details.email.message'})
                                }]}
                            >
                                <Input autoComplete="off" disabled={disabled} placeholder={formatMessage({id: 'ws.result.details.email.placeholder'})} />
                            </Form.Item>
                        }
                        {
                            'ding_notice' in contrl &&
                            <Form.Item
                                name="ding_token"
                                // label="钉钉通知"
                                label={contrl.ding_notice.alias || <FormattedMessage id={`ws.result.details.${contrl.ding_notice.name}`}/> }
                            >
                                <Input autoComplete="off" disabled={disabled} placeholder={formatMessage({id: 'ws.result.details.ding_notice.placeholder'})} />
                            </Form.Item>
                        }
                        {
                            'report' in contrl &&
                            <Form.Item label={<FormattedMessage id="ws.result.details.report"/>}
                                name="report_name">
                                <Input
                                    value={checkedList || undefined}
                                    onChange={onReportChange}
                                    autoComplete="off"
                                    disabled={disabled}
                                    placeholder={formatMessage({id: 'ws.result.details.report.placeholder'})} />
                                <Popover
                                    content={
                                        <div>
                                            {formatMessage({id: 'ws.result.details.report.Popover'})}
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
                                label={<FormattedMessage id="ws.result.details.report_template"/>}
                            >
                                <Select
                                    showSearch
                                    disabled={disabled}
                                    placeholder={formatMessage({id: 'ws.result.details.report_template.placeholder'})}
                                    defaultValue={defaultTemplate.name}
                                    optionFilterProp="children"
                                    filterOption={(input, option) =>
                                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                    }
                                >
                                    {
                                        reportTemplate.map((obj: any) => <Option value={obj.id}>{obj.name}</Option>)
                                    }

                                </Select>
                            </Form.Item>
                        }
                        {
                            'callback_api' in contrl &&
                            <Form.Item
                                name="callback_api"
                                label={<FormattedMessage id="ws.result.details.callback_api"/>}
                            >
                                <Input
                                    autoComplete="off"
                                    disabled={disabled}
                                    placeholder={formatMessage({id: 'ws.result.details.callback_api.placeholder'})} />
                            </Form.Item>
                        }

                    </Col>
                </Row>
            </Form>
        </Card>
    )
}