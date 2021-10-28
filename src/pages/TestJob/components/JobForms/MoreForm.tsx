import React, { useImperativeHandle, useEffect, useState } from 'react'
import { Form, Input, Select, Popover } from 'antd'
import styles from './index.less'
import { FormProps } from './index'
import { tagList } from '@/pages/WorkSpace/TagManage/service'
import { TagSelect } from '@/pages/WorkSpace/DeviceManage/GroupManage/Components/index'
import QuestionCircleComponent from '@/components/Public/QuestionCircle'
import { queryReportTemplateList } from '@/pages/TestJob/services'
import { useParams } from 'umi'
import _ from 'lodash'

const { Option } = Select;
export default ({ contrl, disabled = false, onRef = null, template = {}, isReset,tagsDataRef,reportTemplateDataRef }: FormProps) => {
    const { ws_id }: any = useParams()
    const [form] = Form.useForm()
    const [tags, setTags] = useState<Array<any>>([])
    const [checkedList, setCheckedList] = React.useState<any>();
    const [reportTemplate, setReportTemplate] = useState<any>([])
    const [defaultTemplate, setDefaultTemplate] = useState({})
    const [callbackUrl, setCallbackUrl] = useState('')
    const [regCallbackUrl, setRegCallbackUrl] = useState(false)
    useImperativeHandle(
        onRef,
        () => ({
            form: form,
            reset: () => {
                form.resetFields()
            },
            setVal: (data:Object) =>{
                let reg = /^https?:\/\/(([a-zA-Z0-9_-])+(\.)?)*(:\d+)?(\/((\.)?(\?)?=?&?[a-zA-Z0-9_-](\?)?)*)*$/i
                const callbackApi = _.get(data,'callback_api')
                const flag = reg.test(callbackApi)
                setRegCallbackUrl(callbackApi && !flag)
                setCheckedList(_.get(data,'report_name') || '')
                setCallbackUrl(callbackApi)
                form.setFieldsValue(data)
            }
        })
    )

    const queryTagList = async () => {
        const { data } = await tagList({ ws_id })
        if(tagsDataRef) tagsDataRef.current = data
        setTags(data)
    }

    const getReportTemplate = async () => {
        try {
            const { code, data } = await queryReportTemplateList({ ws_id, page_size: 99999 })
            if (code === 200) {
                let dataSource = _.isArray(data) ? data : []
                const defaultTem = _.find(dataSource, { is_default: true })
                if(reportTemplateDataRef) reportTemplateDataRef.current = dataSource
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

        // const values: any = _.cloneDeep(form.getFieldsValue())
        // if (JSON.stringify(template) === '{}' && JSON.stringify(defaultTemplate) !== '{}') {
        //     form.setFieldsValue({
        //         ...values,
        //         report_template: _.get(defaultTemplate, 'id')
        //     })
        // }
        if (JSON.stringify(template) !== '{}') {
            let notice_subject, email, ding_token
            const { cleanup_info, tags, notice_info, report_name, callback_api } = template
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
                callback_api
            })
            setCheckedList(report_name)
            setCallbackUrl(callback_api)
        }
    }, [defaultTemplate, reportTemplate, template])

    const onReportChange = (e: any) => {
        const reportSelectVal = e.target.value
        const values = _.cloneDeep(form.getFieldsValue())
        const reportTemplate = _.get(values,'report_template') || _.get(defaultTemplate, 'id')
        form.setFieldsValue({ ...values, report_name: reportSelectVal, report_template: reportTemplate })
        setCheckedList(reportSelectVal)
    }
    const handleCallbackURLChange = (evt: any) => {
        const value = evt.target.value
        setCallbackUrl(value)
        const values = _.cloneDeep(form.getFieldsValue())
        form.setFieldsValue({ ...values, callback_api: value })
        let reg = /^https?:\/\/(([a-zA-Z0-9_-])+(\.)?)*(:\d+)?(\/((\.)?(\?)?=?&?[a-zA-Z0-9_-](\?)?)*)*$/i
        const flag = reg.test(value)
        setRegCallbackUrl(value && !flag)
    }
    const callbackTips = () => {
        return (
            <>
                <span>详细信息请查看</span>
                <span className={styles.create_doc} onClick={() => window.open(`https://tone.aliyun-inc.com/help_doc/17`)}>回调接口帮助文档</span>
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
                    rules={[() => ({
                        validator(rule, value) {
                            const reg = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
                            if (value) {
                                const valArr = value.split(/,|，|\n|\s/g)
                                let warry = valArr.filter((str: any) => !reg.test(str))
                                return warry.length === 0 ? Promise.resolve() : Promise.reject('格式错误：多个邮箱用空格或英文逗号分隔');
                            }
                            else
                                return Promise.resolve()
                        },
                    })]}
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
                    <QuestionCircleComponent contextNode={<div>
                        {"报告名称可用占位符："}
                        <p style={{ marginBottom: 0 }}>{"{date} {job_name} {job_id} {product_version}"}</p>
                    </div>} />
                </Form.Item>
            }
            {
                checkedList && 'report' in contrl &&
                <Form.Item
                    name="report_template"
                    label="报告模板"
                >
                    <Select
                        showSearch
                        disabled={disabled}
                        placeholder="请选择报告模板"
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
                    label="回调接口"
                    validateStatus={regCallbackUrl && 'error'}
                    help={regCallbackUrl && '请输入正确的回调接口URL'}
                >
                    <Input
                        value={callbackUrl}
                        onChange={handleCallbackURLChange}
                        autoComplete="off"
                        disabled={disabled}
                        placeholder="请输入回调接口的URL" />
                    <QuestionCircleComponent contextNode={<div>
                        {"T-one平台会在Job状态发生变化时携带该Job信息并以POST方式主动请求该API。"}
                        <p style={{ marginBottom: 0 }}>{callbackTips()}</p>
                    </div>} />
                </Form.Item>
            }
        </Form>
    )
}