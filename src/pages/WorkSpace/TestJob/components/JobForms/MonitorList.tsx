import React,{useEffect, useState,} from 'react'
import { Form , Button } from 'antd'
import MonitorConfig from './MonitorConfig'
import _ from 'lodash'
type monitorInfoType = {
    monitor_type: string,
    server?: string
}
export default ({ disabled, template, formComponent }: any) => {
    const [typeDisabled, setTypeDisabled] = useState<boolean>(true)
    useEffect(() => {
        
        if (template && JSON.stringify(template) !== '{}') {
            const { monitor_info } = template
            const arr = Array.isArray(monitor_info) ? monitor_info : []
            const flag = arr.some((item: monitorInfoType) => item && item.monitor_type === 'case_machine')
            setTypeDisabled(flag)
        }
    }, [template])
    const setFormsValueFn = (index:number, value: string,) => {
        const formValues = _.cloneDeep(formComponent.getFieldsValue())
        let monitorInfo = _.isArray(_.get(formValues,'monitor_info')) ? _.get(formValues,'monitor_info') : []
        if(value) {
            monitorInfo[index] = {...formValues.monitor_info[index],monitor_type: value}
            if(value === 'case_machine') monitorInfo[index] = {...formValues.monitor_info[index],server: ''}
            formValues.monitor_info = monitorInfo
            formComponent.setFieldsValue(formValues)
        }
        const flag = monitorInfo.some((item:monitorInfoType) => item && item.monitor_type === 'case_machine')
        setTypeDisabled(flag)
    }
    return (
        <>
            <Form.Item label="监控配置" className={'monitor'}>
                    <Form.List name="monitor_info">
                        {
                            (fields, { add, remove }) => {
                                return (
                                    <>
                                        {
                                            fields.map(
                                                (field, index) => (
                                                    <MonitorConfig 
                                                    setFormsValueFn={setFormsValueFn}
                                                    field={field} 
                                                    index={index}
                                                    disabled={disabled}
                                                    typeDisabled={typeDisabled}
                                                    form={formComponent}
                                                    remove={remove}/>
                                     
                                                )
                                            )
                                        }
                                        {
                                            !disabled &&
                                            <Button
                                                type="link"
                                                onClick={() => add({monitor_type: 'custom_machine',server: ''})}
                                                style={{ padding: 0 }}
                                            >
                                                + 添加一组监控
                                    </Button>
                                        }
                                    </>
                                )
                            }
                        }
                    </Form.List>
            </Form.Item>
        </>
    )
}
