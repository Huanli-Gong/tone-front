import React, { useState, useImperativeHandle, forwardRef, useEffect } from 'react'
import styles from './index.less'
import { useIntl, FormattedMessage } from 'umi'
import { Form, Input, Radio, Switch, Row, Space, Typography } from 'antd'
import { checkCronExpression } from '@/pages/WorkSpace/TestPlan/services'
import { QusetionIconTootip } from '@/pages/WorkSpace/TestResult/Details/components'
import styled from 'styled-components'

const EmRow = styled(Row)`
    text-indent:2em;
    color: #333;
`

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
            if (cron_schedule) {
                form.setFieldsValue(template)
            }
            else {
                const { cron_schedule, blocking_strategy } = template
                form.setFieldsValue({ cron_schedule, blocking_strategy })
            }
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
            >
                <Form.Item name="cron_schedule" 
                    label={<FormattedMessage id="plan.timed.trigger" />}
                    valuePropName="checked">
                    <Switch onChange={setTigger} size="default" checked checkedChildren={<FormattedMessage id="operation.open" />} unCheckedChildren={<FormattedMessage id="operation.close" />} />
                </Form.Item>
                {
                    tigger &&
                    <>
                        <Form.Item label={<FormattedMessage id="plan.trigger.rule" />}>
                            <div style={{ position: 'relative' }}>
                                <Form.Item
                                    name="cron_info"
                                    validateTrigger={'onBlur'}
                                    rules={[
                                        () => ({
                                            async validator(rule, value) {
                                                const { code, data = [] } = await checkCronExpression({ cron_express: value }) || {}
                                                if (code === 200) {
                                                    setExpression(data)
                                                    return Promise.resolve()
                                                }
                                                setExpression([])
                                                return Promise.reject(formatMessage({id: 'plan.cron_info.reject'}))
                                            }
                                        }),
                                    ]}
                                >
                                    <Input autoComplete="off" placeholder={formatMessage({id: 'plan.trigger.rule'})} />
                                </Form.Item>
                                <div style={{ position: 'absolute', right: -22, top: -4 }}>
                                    <QusetionIconTootip
                                        title=""
                                        placement="rightBottom"
                                        desc={
                                            <>
                                                <Row><Typography.Text strong><FormattedMessage id="plan.trigger.rule.format" />：</Typography.Text></Row>
                                                <br />
                                                <Row><Typography.Text strong><FormattedMessage id="plan.trigger.for.example" /></Typography.Text></Row>
                                                <EmRow><FormattedMessage id="plan.trigger.rule1" /></EmRow>
                                                <EmRow><FormattedMessage id="plan.trigger.rule2" /></EmRow>
                                                <EmRow><FormattedMessage id="plan.trigger.rule3" /></EmRow>
                                                <EmRow><FormattedMessage id="plan.trigger.rule4" /></EmRow>
                                                <EmRow><FormattedMessage id="plan.trigger.rule5" /></EmRow>
                                                <br />
                                                <Row><Typography.Text strong><FormattedMessage id="plan.special.symbols" />：</Typography.Text></Row>
                                                <EmRow><FormattedMessage id="plan.symbols1" /></EmRow>
                                                <EmRow><FormattedMessage id="plan.symbols2" /></EmRow>
                                                <EmRow><FormattedMessage id="plan.symbols3" /></EmRow>
                                                <EmRow><FormattedMessage id="plan.symbols4" /></EmRow>
                                                <br />
                                                <Row><Typography.Text strong><FormattedMessage id="plan.for.example" />：</Typography.Text></Row>
                                                <EmRow>
                                                    <FormattedMessage id="plan.example1" />
                                                </EmRow>
                                            </>
                                        }
                                    />
                                </div>
                            </div>
                        </Form.Item>
                        {!!expression?.length && (
                            <Form.Item label=" ">
                                <span><FormattedMessage id="plan.next.three.trigger.times" />：</span>
                                {expression.map((item, index) =>
                                    <div key={index} style={{ marginLeft: 20 }}>{index + 1}. {item}</div>
                                )}
                            </Form.Item>
                        )}
                        {/* {
                            template?.next_time && 
                            <Form.Item label=" ">
                                <span>下次触发时间：{ template.next_time }</span>
                            </Form.Item>
                        } */}
                        <Form.Item name="blocking_strategy" 
                            label={<FormattedMessage id="plan.blocking_strategy" />}
                            initialValue={1}>
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