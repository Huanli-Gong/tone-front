import React from 'react'
import { Form, Row, Select, Col, Input, Popover, Descriptions } from 'antd'
import { DeleteFormListItem } from '../DeleteFormListItem'
import { QuestionCircleOutlined } from '@ant-design/icons'
import _ from 'lodash'
import styles from './index.less'
export default ({ field, index, disabled, remove, setFormsValueFn, typeDisabled,form }: any) => {

    const handleMachineType = (value: string) => {
        setFormsValueFn(index, value)
    }
    const formValue = form.getFieldsValue()
    const monitorInfo = _.isArray(_.get(formValue, 'monitor_info')) ? _.get(formValue, 'monitor_info') : []
    const machineType = monitorInfo[index] && monitorInfo[index]['monitor_type'] || 'case_machine'
    const styleObj = {
        color: 'rgba(0, 0, 0, 0.45)',
        cursor: 'pointer',
        transform: 'translateY(0)',
        position:'initial',
    }

    return (
        <Row key={index} gutter={10} style={{ position: 'relative' }}>
            <Col span={6}>
                <Form.Item name={[field.name, "monitor_type"]}>
                    <Select onChange={handleMachineType} defaultValue='case_machine' disabled={disabled}>
                        <Select.Option value="case_machine" disabled={typeDisabled}>本机</Select.Option>
                        <Select.Option value="custom_machine">自定义</Select.Option>
                    </Select>
                </Form.Item>
            </Col>

            <Col span={18} style={{ position: 'relative' }}>
                {machineType === 'custom_machine' &&
                    <Form.Item name={[field.name, "server"]} rules={[{ required: true,pattern: /^[A-Za-z0-9\._-]+$/, message: '请输入英文大小写、数字、特殊字符下划线、中划线和点' }]}>
                        <Input placeholder={`请输入监控机器的IP${!BUILD_APP_ENV ? "/SN" : ""}地址`} allowClear disabled={disabled} />
                    </Form.Item>
                }
                {
                    (index === 0) &&
                    <Popover
                        overlayStyle={{ zIndex: 10000 }}
                        content={
                            <Descriptions title="监控说明" bordered column={1} size="small" className={styles.monitorDes}>
                                <Descriptions.Item label="本机" labelStyle={{paddingTop: '5px',paddingBottom: '5px'}}>仅对当前Job的所有用例分配到的机器进行数据监控。</Descriptions.Item>
                                <Descriptions.Item label="自定义" labelStyle={{paddingTop: '5px',paddingBottom: '5px'}}>用户可通过手动输入IP{`${!BUILD_APP_ENV ? "/SN" : ""}`}的方式，添加机器进行监控。</Descriptions.Item>
                            </Descriptions>
                        }
                    >
                        <QuestionCircleOutlined style={machineType === 'custom_machine' ?
                            { ...styleObj, position: 'absolute', right: -20, transform: 'translateY(-11px)' } : styleObj} />
                    </Popover>
                }
                {
                    (!disabled && index > 0) &&
                    <DeleteFormListItem
                        position={machineType === 'custom_machine' ? { right: -20, top: 0 } : {}}
                        remove={remove}
                        field={field}
                        deleteCallback={setFormsValueFn}
                    />
                }
            </Col>
        </Row>
    )
}
