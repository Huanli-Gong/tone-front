/* eslint-disable react/jsx-key */
import React from "react"

import { itemLayout } from './untils'
import type { FormInstance } from 'antd'
import { Form, Input, Row, Col } from 'antd'
import { FormattedMessage } from 'umi'
import { CopyLinkSpan } from "@/pages/WorkSpace/TestJob/components/untils"

type PackageProps = {
    name: string;
    disabled: boolean;
    form?: FormInstance;
    [k: string]: any;
}

export const PackageFormItem: React.FC<PackageProps> = (props) => {
    const { name, disabled = false, form } = props

    const needCopyLink = window.location.pathname.indexOf('/test_result/') > -1
    const disabledStyles = disabled ? { backgroundColor: '#f5f5f5' } : {}

    return (
        <Row style={{ position: 'relative' }}>
            <Col span={24}>
                <Form.Item
                    // rules={[{ required: true, message: `请输入${name}包` }]}
                    {...itemLayout}
                    label={<FormattedMessage id={`kernel.form.${name}.package`} />}
                    name={name}
                >
                    <Input autoComplete="off" style={disabledStyles} readOnly={disabled} />
                </Form.Item>
            </Col>
            {
                needCopyLink &&
                <CopyLinkSpan onCopy={() => form?.getFieldValue(name)} />
            }
        </Row>
    )
}

type PackageListProps = {
    disabled: boolean;
    form: FormInstance;
    [k: string]: any;
}

export const PackageList: React.FC<PackageListProps> = (props) => {
    return (
        <>
            {
                ["kernel", "devel", "headers"].map((i: string) => (
                    <PackageFormItem {...props} name={i} />
                ))
            }
        </>
    )
}