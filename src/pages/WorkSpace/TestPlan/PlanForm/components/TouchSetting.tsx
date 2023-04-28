/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useImperativeHandle, forwardRef, useEffect } from 'react'
import styles from './index.less'
import { useIntl, FormattedMessage } from 'umi'
import { Form, Input, Radio, Switch } from 'antd'
import { checkCronExpression } from '@/pages/WorkSpace/TestPlan/services'
import RuleQusetionContent from './RuleQusetionContent'

const TouchSetting = (props: any, ref: any) => {
    const { formatMessage } = useIntl()
    const { show, template } = props
    const [form] = Form.useForm()

    const [tigger, setTigger] = useState(false)
    const [expression, setExpression] = useState([])

    useImperativeHandle(ref, () => ({
        validate: async () => {
            return form.validateFields()
        }
    }))

    useEffect(() => {
        if (template && JSON.stringify(template) !== '{}') {
            const { cron_schedule } = template
            setTigger(cron_schedule)
            form.setFieldsValue(template)
        }
    }, [template])

    return (
        <div style={{ width: '100%', height: '100%', paddingTop: 50, display: show }}>
            <Form
                form={form}
                layout="horizontal"
                size="small"
                /*hideRequiredMark*/
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 12 }}
                style={{ width: '100%' }}
                colon={false}
                className={styles.job_plan_form}
                initialValues={{
                    blocking_strategy: 1
                }}
            >
                <Form.Item name="cron_schedule"
                    label={<FormattedMessage id="plan.timed.trigger" />}
                    valuePropName="checked">
                    <Switch onChange={setTigger} size="default" checked checkedChildren={<FormattedMessage id="operation.open" />} unCheckedChildren={<FormattedMessage id="operation.close" />} />
                </Form.Item>
                {
                    tigger &&
                    <>
                        <Form.Item label={<FormattedMessage id="plan.trigger.rule" />} required>
                            <div style={{ position: 'relative' }}>
                                <Form.Item
                                    name="cron_info"
                                    validateTrigger={'onBlur'}
                                    rules={[
                                        () => ({
                                            async validator(rule, value) {
                                                setExpression([])
                                                if (!value) return Promise.reject(formatMessage({ id: "plan.cron_info.empty" }))
                                                const { code, data = [] } = await checkCronExpression({ cron_express: value }) || {}
                                                if (code === 200) {
                                                    setExpression(data)
                                                    return Promise.resolve()
                                                }
                                                return Promise.reject(formatMessage({ id: 'plan.cron_info.reject' }))
                                            }
                                        }),
                                    ]}
                                >
                                    <Input autoComplete="off" placeholder={formatMessage({ id: 'plan.trigger.rule' })} />
                                </Form.Item>
                                <RuleQusetionContent />
                            </div>
                        </Form.Item>

                        {
                            !!expression?.length && (
                                <Form.Item label=" ">
                                    <span><FormattedMessage id="plan.next.three.trigger.times" />：</span>
                                    {expression.map((item, index) =>
                                        <div key={item} style={{ marginLeft: 20 }}>{index + 1}. {item}</div>
                                    )}
                                </Form.Item>
                            )
                        }

                        <Form.Item
                            name="blocking_strategy"
                            label={<FormattedMessage id="plan.blocking_strategy" />}
                        >
                            <Radio.Group>
                                <Radio value={1}><FormattedMessage id="plan.blocking_strategy1" /></Radio><br />
                                <Radio value={2}><FormattedMessage id="plan.blocking_strategy2" /></Radio><br />
                                <Radio value={3}><FormattedMessage id="plan.blocking_strategy3" /></Radio><br />
                            </Radio.Group>
                        </Form.Item>
                    </>
                }
            </Form>
        </div>
    )
}

export default forwardRef(TouchSetting)