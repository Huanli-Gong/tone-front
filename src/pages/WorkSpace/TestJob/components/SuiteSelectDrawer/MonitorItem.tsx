import { Form, Radio, Select, Button, Space } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
import React from 'react'
import { useIntl, FormattedMessage } from 'umi';

const MonitorItem: React.FC<AnyType> = (props) => {
    const { formatMessage } = useIntl()
    const { suiteForm } = props
    return (
        <>
            <Form.Item
                name="console"
                label={<FormattedMessage id="select.suite.monitor.console" />}
                className={"drawer_padding"}
            >
                <Radio.Group >
                    <Radio value={true}><FormattedMessage id="operation.yes" /></Radio>
                    <Radio value={false}><FormattedMessage id="operation.no" /></Radio>
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
                                        <Select style={{ width: 140 }}
                                            placeholder={suiteForm?.console?.length > 1 ?
                                                formatMessage({ id: 'select.suite.multiple.values' }) : formatMessage({ id: 'select.suite.monitor.item' })
                                            }>
                                            <Select.Option value="1"><FormattedMessage id="select.suite.monitor.data" /></Select.Option>
                                        </Select>
                                    </Form.Item>
                                    <Form.Item
                                        label={null}
                                        {...field}
                                        name={[field.name, 'servers']}
                                        fieldKey={[field.fieldKey, 'servers']}
                                    >
                                        <Select style={{ width: 140 }}
                                            placeholder={suiteForm?.console?.length > 1 ?
                                                formatMessage({ id: 'select.suite.multiple.values' }) : formatMessage({ id: 'select.suite.monitor.the.server' })
                                            }>
                                            <Select.Option value="1"><FormattedMessage id="select.suite.the.server.one" /></Select.Option>
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
                                <FormattedMessage id="select.suite.add.group.monitor" />
                            </Button>
                        </div>
                    );
                }}
            </Form.List>
        </>
    )
}

export default MonitorItem