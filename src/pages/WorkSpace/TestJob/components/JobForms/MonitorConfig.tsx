import React from 'react'
import { Form, Row, Select, Col, Input, Popover, Descriptions } from 'antd'
import { useIntl, FormattedMessage } from 'umi'
import { DeleteFormListItem } from '../DeleteFormListItem'
import { QuestionCircleOutlined } from '@ant-design/icons'
import _ from 'lodash'
import styles from './index.less'
export default ({ field, index, disabled, remove, setFormsValueFn, typeDisabled,form }: any) => {
    const { formatMessage } = useIntl()

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
                        <Select.Option value="case_machine" disabled={typeDisabled}>
                            <FormattedMessage id="job.form.case.machine" />
                        </Select.Option>
                        <Select.Option value="custom_machine">
                            <FormattedMessage id="job.form.custom.machine" />
                        </Select.Option>
                    </Select>
                </Form.Item>
            </Col>

            <Col span={18} style={{ position: 'relative' }}>
                {machineType === 'custom_machine' &&
                    <Form.Item name={[field.name, "server"]} 
                    rules={[
                        { 
                            required: true,pattern: /^[A-Za-z0-9\._-]+$/, 
                            message: formatMessage({id: 'job.form.custom.machine.message'}),
                        }
                    ]}>
                        <Input placeholder={`${formatMessage({id: 'job.form.input.machine.ip'})}${!BUILD_APP_ENV ? "/SN" : ""}${formatMessage({id: 'job.form.address'})}`} allowClear disabled={disabled} />
                    </Form.Item>
                }
                {
                    (index === 0) &&
                    <Popover
                        overlayStyle={{ zIndex: 10000 }}
                        content={
                            <Descriptions title={<FormattedMessage id="job.form.monitor.instructions" />}
                                bordered column={1} size="small" className={styles.monitorDes}>
                                <Descriptions.Item label={<FormattedMessage id="job.form.case.machine" />} labelStyle={{paddingTop: '5px',paddingBottom: '5px'}}>
                                    <FormattedMessage id="job.form.only.monitor.all.use.cases.machine" />
                                </Descriptions.Item>
                                <Descriptions.Item label={<FormattedMessage id="job.form.custom.machine" />} labelStyle={{paddingTop: '5px',paddingBottom: '5px'}}>
                                    <FormattedMessage id="job.form.users.can.enter.IP" />{`${!BUILD_APP_ENV ? "/SN" : ""}`}<FormattedMessage id="job.form.add.machine.monitoring" />
                                </Descriptions.Item>
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
