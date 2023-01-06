import React from "react"
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons"
import { Form, Input, Row, Space, Typography } from "antd"
import type { FormInstance } from "antd"
import { useIntl, useLocation } from "umi"
import { CopyLinkSpan } from '@/pages/WorkSpace/TestJob/components/untils'

type IProps = {
    form?: FormInstance;
    disabled?: boolean;
}

const PackagesFormItem: React.FC<IProps> = (props) => {
    const intl = useIntl()
    const { disabled, form } = props

    const { pathname } = useLocation()

    return (
        <Form.Item
            label={intl.formatMessage({ id: "kernel.kernel_packages.label" })}
            required={true}
            {...props}
        >
            <Form.List
                name="kernel_packages"
                initialValue={[""]}
                rules={[
                    {
                        validator: async (_, names) => {
                            return Promise.resolve()
                        },
                    },
                ]}
            >
                {(fields, { add, remove }, { errors }) => {
                    return (
                        <Row style={{ flexDirection: "column", gap: 8, width: "100%" }}>
                            {fields.map((field, index) => (
                                <div style={{ position: "relative" }} >
                                    <Form.Item
                                        {...field}
                                        rules={[{
                                            required: true,
                                            message: intl.formatMessage({ id: `kernel.kernel_packages${index !== 0 ? ".other" : ""}.rules.empty` })
                                        }]}
                                    >
                                        <Input
                                            disabled={disabled}
                                            style={{ width: "100%" }}
                                            allowClear
                                            placeholder={intl.formatMessage({ id: `kernel.kernel_packages${index !== 0 ? ".other" : ""}.placeholder` })}
                                        />
                                    </Form.Item>
                                    {!disabled && index !== 0 && fields.length > 1 ? (
                                        <DeleteOutlined
                                            style={{
                                                position: "absolute",
                                                right: 0, top: 0,
                                                transform: "translate(150%,60%)"
                                            }}
                                            onClick={() => remove(field.name)}
                                        />
                                    ) : null}
                                    {
                                        !!~pathname.indexOf("/test_result/") &&
                                        <CopyLinkSpan
                                            style={{ right: -20 }}
                                            onCopy={() => form?.getFieldValue("kernel_packages")?.[index]}
                                        />
                                    }
                                </div>
                            ))}
                            {
                                !disabled &&
                                <Typography.Link onClick={() => add()} >
                                    <Space>
                                        <PlusOutlined />
                                        <Typography.Link>
                                            {
                                                intl.formatMessage({ id: "kernel.kernel_packages.add" })
                                            }
                                        </Typography.Link>
                                    </Space>
                                </Typography.Link>
                            }
                        </Row>
                    )
                }}
            </Form.List>
        </Form.Item>
    )
}

export default PackagesFormItem