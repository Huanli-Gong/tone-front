import React from "react"

import Clipboard from 'clipboard'
import { ReactComponent as CopyLink } from '@/assets/svg/TestResult/icon_link.svg'
import { itemLayout } from './untils'
import type { FormInstance } from 'antd'
import { Form, Input, Row, Col, message } from 'antd'
import { useIntl, FormattedMessage } from 'umi'

type PackageProps = {
    name: string;
    disabled: boolean;
    form?: FormInstance;
    [k: string]: any;
}

export const PackageFormItem: React.FC<PackageProps> = (props) => {
    const { name, disabled = false, form } = props

    const { formatMessage } = useIntl()
    const needCopyLink = window.location.pathname.indexOf('test_result') > -1
    const copyLinkIconStyles = { cursor: 'pointer', position: 'absolute', right: 0, top: 5 }

    const disabledStyles = disabled ? { backgroundColor: '#f5f5f5' } : {}

    const handleCopy = (name: string) => {
        const ele = document.createElement("a")
        ele.style.height = "0px"
        ele.style.width = "0px"
        ele.innerHTML = ""
        ele.id = "currentCopyLinkEle"
        document.body.appendChild(ele)
        const cb = new Clipboard(ele, {
            text: () => form?.getFieldValue(name)
        })

        cb.on('success', function (e) {
            message.success(formatMessage({ id: 'request.copy.success' }))
        })
        ele.click()
        cb.destroy()
    }

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
                <CopyLink
                    onClick={() => handleCopy(name)}
                    style={copyLinkIconStyles}
                />
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