/* eslint-disable react/no-array-index-key */
import React from 'react'
import { Form, Row, Col, Input, Radio, Button } from 'antd'
import { FormattedMessage, useLocation } from 'umi';
import { DeleteFormListItem } from './DeleteFormListItem'
import { CopyLinkSpan } from './untils';
import type { FormInstance } from "antd"

type IProps = {
    form?: FormInstance
} & Record<string, any>

const FormList: React.FC<IProps> = (props) => {
    const { form, label, listName, textName, disabled, radioName, buttonShow, buttonText, placeholder } = props
    const disabledStyles = disabled ? { backgroundColor: '#f5f5f5' } : {}

    const { pathname } = useLocation()

    return (
        <Form.Item label={label}>
            <Form.List name={listName}>
                {
                    (fields, { add, remove }) => {
                        return (
                            <>
                                {
                                    fields.map(
                                        (field, index) => (
                                            <Row
                                                key={index}
                                                style={
                                                    (!disabled && buttonShow) ?
                                                        { marginBottom: 8 } :
                                                        { marginBottom: index !== fields.length - 1 ? 8 : 0 }
                                                }
                                            >
                                                <Col span={24} style={{ position: 'relative' }}>
                                                    <Form.Item noStyle name={[field.name, textName]} >
                                                        <Input.TextArea
                                                            style={disabledStyles}
                                                            readOnly={disabled}
                                                            placeholder={placeholder}
                                                            autoSize={{
                                                                minRows: 3,
                                                                maxRows: 10
                                                            }}
                                                        />
                                                    </Form.Item>
                                                    {
                                                        !!~pathname.indexOf("/test_result/") &&
                                                        <CopyLinkSpan
                                                            style={{ right: -20 }}
                                                            onCopy={() => form?.getFieldValue(listName)?.[index][textName]}
                                                        />
                                                    }
                                                    {
                                                        (!disabled && index > 0) &&
                                                        <DeleteFormListItem
                                                            remove={remove}
                                                            field={field}
                                                            position={{ right: -20, top: 0 }}
                                                        />
                                                    }
                                                </Col>
                                                {
                                                    buttonShow &&
                                                    <Form.Item
                                                        label={<FormattedMessage id="job.form.execution.time" />}
                                                        style={{ marginBottom: fields.length - 1 === index ? 0 : 8 }}
                                                        name={[field.name, radioName]}
                                                    >
                                                        <Radio.Group disabled={disabled}>
                                                            <Radio value="before"><FormattedMessage id="job.form.restart.before" /></Radio>
                                                            <Radio value="after"><FormattedMessage id="job.form.restart.after" /></Radio>
                                                        </Radio.Group>
                                                    </Form.Item>
                                                }
                                            </Row>
                                        )
                                    )
                                }
                                {
                                    (!disabled && buttonShow) &&
                                    <Button
                                        type="link"
                                        onClick={() => add({ pos: 'before' })}
                                        style={{ padding: 0, fontSize: 12 }}
                                        size="small"
                                    >
                                        {buttonText}
                                    </Button>
                                }
                            </>
                        )
                    }
                }
            </Form.List>
        </Form.Item>
    )
}

export default FormList