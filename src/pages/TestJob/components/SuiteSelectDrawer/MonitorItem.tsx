import { Form, Radio, Select, Button, Space } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
import React from 'react'

const MonitorItem = (props: any) => {
    const { suiteForm } = props
    return (
        <>
            <Form.Item
                name="console"
                label="监控配置"
                className={"drawer_padding"}
            >
                <Radio.Group >
                    <Radio value={true}>是</Radio>
                    <Radio value={false}>否</Radio>
                </Radio.Group>
            </Form.Item>
            <Form.List name="monitor_info" >
                {(fields, { add, remove }) => {
                    return (
                        <div
                            className={"drawer_padding"}
                        >
                            {fields.map((field, index) => (
                                <Space key={field.key} style={{ display: 'flex', marginBottom: 8 }} align="start">
                                    <Form.Item
                                        label={null}
                                        {...field}
                                        name={[field.name, 'items']}
                                        fieldKey={[field.fieldKey, 'items']}
                                    >
                                        <Select style={{ width: 140 }} placeholder={suiteForm?.console?.length > 1 ? '多个数值' : '请选择监控项'} >
                                            <Select.Option value="1" >数据监控</Select.Option>
                                        </Select>
                                    </Form.Item>
                                    <Form.Item
                                        label={null}
                                        {...field}
                                        name={[field.name, 'servers']}
                                        fieldKey={[field.fieldKey, 'servers']}
                                    >
                                        <Select style={{ width: 140 }} placeholder={suiteForm?.console?.length > 1 ? '多个数值' : '请选择监控机器'} >
                                            <Select.Option value="1" >机器一</Select.Option>
                                        </Select>
                                    </Form.Item>
                                    {
                                        (index !== 0 && fields.length > 1) ?
                                            <DeleteOutlined
                                                className="dynamic-delete-button"
                                                style={{ margin: '8px 0' }}
                                                onClick={() => {
                                                    remove(field.name);
                                                }}
                                            /> :
                                            <div style={{ width: '14px' }}> </div>
                                    }
                                </Space>
                            ))}
                            <Button
                                style={{ width: 100, padding: 0, textAlign: 'left', marginBottom: 8 }}
                                type="link"
                                size="small"
                                block
                                onClick={() => {
                                    add();
                                }}
                            >
                                + 添加一组监控
                                        </Button>
                        </div>
                    );
                }}
            </Form.List>
        </>
    )
}

export default MonitorItem