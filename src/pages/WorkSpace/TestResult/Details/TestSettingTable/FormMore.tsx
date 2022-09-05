import React, { useImperativeHandle, useEffect, useState } from 'react'
import { Form, Input, Card, Row, Col, Popover, Select } from 'antd'
import styles from './index.less'
import { tagList } from '@/pages/WorkSpace/TagManage/service'
import { TagSelect } from '@/pages/WorkSpace/DeviceManage/GroupManage/Components/index'
import { QuestionCircleOutlined } from '@ant-design/icons'
import { queryReportTemplateList } from '@/pages/WorkSpace/TestJob/services'
import _ from 'lodash'
import { useParams } from "umi"

const { Option } = Select;

export default ({ contrl, disabled = false, onRef = null, template = {} }: any) => {
    const { ws_id } = useParams() as any
    if (JSON.stringify(contrl) === '{}') return <></>

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
    
    return (
        <Card
            title="更多配置"
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
                                label={contrl.cleanup.alias || contrl.cleanup.show_name}
                            >
                                <Input.TextArea disabled={disabled} placeholder="请输入Job的清理脚本" />
                            </Form.Item>
                        }
                        {
                            'job_tag' in contrl &&
                            <TagSelect
                                tags={tags}
                                // label="Job标签"
                                label={contrl.job_tag.alias || contrl.job_tag.show_name}
                                disabled={disabled}
                            />
                        }
                        {
                            'notice_subject' in contrl &&
                            <Form.Item
                                name="notice_subject"
                                // label="通知主题"
                                label={contrl.notice_subject.alias || contrl.notice_subject.show_name}
                            >
                                <Input autoComplete="off" disabled={disabled} placeholder="[T-One] 你的测试已完成{date}" />
                            </Form.Item>
                        }
                        {
                            'email_notice' in contrl &&
                            <Form.Item
                                name="email"
                                // label="邮件通知"
                                label={contrl.email_notice.alias || contrl.email_notice.show_name}
                                rules={[{
                                    pattern: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                                    message: '请输入正确的邮箱地址'
                                }]}
                            >
                                <Input autoComplete="off" disabled={disabled} placeholder="默认通知Job创建人，多个邮箱用空格或英文逗号分隔" />
                            </Form.Item>
                        }
                        {
                            'ding_notice' in contrl &&
                            <Form.Item
                                name="ding_token"
                                // label="钉钉通知"
                                label={contrl.ding_notice.alias || contrl.ding_notice.show_name}
                            >
                                <Input autoComplete="off" disabled={disabled} placeholder="请输入钉钉token，多个token用空格或英文逗号分隔" />
                            </Form.Item>
                        }
                        {
                            'report' in contrl &&
                            <Form.Item label="测试报告" name="report_name">
                                <Input
                                    value={checkedList || undefined}
                                    onChange={onReportChange}
                                    autoComplete="off"
                                    disabled={disabled}
                                    placeholder="请输入报告名称，例如：{job_name}_report-{report_seq_id}" />
                                <Popover
                                    content={
                                        <div>
                                            {"报告名称可用占位符："}
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
                                label="报告模板"
                            >
                                <Select
                                    showSearch
                                    disabled={disabled}
                                    placeholder="请选择报告模板"
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
                                label="回调接口"
                            >
                                <Input
                                    autoComplete="off"
                                    disabled={disabled}
                                    placeholder="请输入回调接口的URL" />
                            </Form.Item>
                        }

                    </Col>
                </Row>
            </Form>
        </Card>
    )
}