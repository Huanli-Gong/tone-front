import React, { useState , useImperativeHandle , forwardRef , useEffect } from 'react'
import styles from './index.less'
import { Form , Input , Radio, Switch , Row, Space, Typography } from 'antd'
import { checkCronExpression } from '@/pages/WorkSpace/TestPlan/services'
import { QusetionIconTootip } from '@/pages/WorkSpace/TestResult/Details/components'
import styled from 'styled-components'

const EmRow = styled(Row)`
    text-indent:2em;
`

const TouchSetting = ( props : any , ref : any ) => {
    const { show , template } = props
    const [ form ] = Form.useForm()

    const [ tigger , setTigger ] = useState( false )
    const [ expression , setExpression ] = useState( [] )

    useImperativeHandle( ref , () => ({
        validate : async () => {
            return form.validateFields()
        }
    }))

    useEffect(() => {
        if ( template && JSON.stringify( template ) !== '{}') {
            const { cron_schedule } = template
            setTigger( cron_schedule )
            if ( cron_schedule ) {
                form.setFieldsValue( template )
            }
            else {
                const { cron_schedule , blocking_strategy } = template
                form.setFieldsValue({ cron_schedule , blocking_strategy })
            }
        }
    } , [ template ])

    return (
        <div style={{ width : '100%' , height : '100%' , paddingTop : 50 , display : show }}>
            <Form 
                form={ form }
                layout="horizontal"
                size="small"
                /*hideRequiredMark*/
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 12 }}
                style={{ width : '100%' }}
                colon={ false }
                className={ styles.job_plan_form }
                // onFieldsChange={ onChange }
            >
                <Form.Item name="cron_schedule" label="定时触发" valuePropName="checked">
                    <Switch onChange={ setTigger } size="default" checked checkedChildren="开启" unCheckedChildren="关闭" />
                </Form.Item>
                {
                    tigger &&
                    <>
                        <Form.Item label="触发规则"  >
                            <div style={{ position : 'relative' }}>
                                <Form.Item 
                                    name="cron_info" 
                                    validateTrigger={ 'onBlur' }
                                    rules={[
                                        () => ({
                                            async validator ( rule , value ) {
                                                const { code, data = [] } = await checkCronExpression({ cron_express : value }) || {}
                                                if ( code === 200 ) {
                                                    setExpression(data)
                                                    return Promise.resolve()
                                                }
                                                setExpression([])
                                                return Promise.reject('规则错误，请核对触发规则是否正确')
                                            }    
                                        }),
                                    ]}
                                >
                                    <Input autoComplete="off" placeholder="触发规则"/>
                                </Form.Item>
                                <div style={{ position : 'absolute' , right : -22 , top : -4 }}>
                                    <QusetionIconTootip 
                                        title="" 
                                        placement="rightBottom"
                                        desc={
                                            <>
                                                <Row><Typography.Text strong>CronTab表达式格式：</Typography.Text></Row>
                                                <br />
                                                <Row><Typography.Text strong>如：* * * * *</Typography.Text></Row>
                                                <EmRow>1. minute:分</EmRow>
                                                <EmRow>2. hour:时</EmRow>
                                                <EmRow>3. day:日</EmRow>
                                                <EmRow>4. month:月</EmRow>
                                                <EmRow>5. day_of_week:星期几  0-6</EmRow>
                                                <br />
                                                <Row><Typography.Text strong>特殊符号：</Typography.Text></Row>
                                                <EmRow>1. *  任何时间</EmRow>
                                                <EmRow>2. ，不连续的时间</EmRow>
                                                <EmRow>3. -  连续的时间</EmRow>
                                                <EmRow>4. /  每隔多久执行一次</EmRow>
                                                <br />
                                                <Row><Typography.Text strong>举例：</Typography.Text></Row>
                                                <EmRow><Space><span>0 21 * * 1-5</span><span>每周1到5的21点执行任务</span></Space></EmRow>
                                            </>
                                        } 
                                    />
                                </div>
                            </div>
                        </Form.Item>
                        {!!expression?.length && (
                           <Form.Item label=" ">
                               <span>下三次触发时间：</span>
                               {expression.map((item, index)=>
                                    <div key={ index } style={{ marginLeft: 20 }}>{index+1}. { item }</div>
                                )}
                           </Form.Item>
                        )}
                        {/* {
                            template?.next_time && 
                            <Form.Item label=" ">
                                <span>下次触发时间：{ template.next_time }</span>
                            </Form.Item>
                        } */}
                        <Form.Item name="blocking_strategy" label="阻塞处理策略" initialValue={ 1 }>
                            <Radio.Group>
                                <Radio value={ 1 }>忽略前序计划，直接同时执行</Radio><br/>
                                <Radio value={ 2 }>中止前序运行中计划，再执行</Radio><br/>
                                <Radio value={ 3 }>有前序运行中计划，忽略本次执行</Radio><br/>
                            </Radio.Group>
                        </Form.Item>
                    </>
                }
            </Form>
        </div>
    )
}

export default forwardRef( TouchSetting )