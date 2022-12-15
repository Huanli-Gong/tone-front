import { Row, Form, Checkbox, Radio, Select, Typography, Divider, Breadcrumb } from 'antd'
import React, { useState, useImperativeHandle, forwardRef } from 'react'
import { Link, useParams } from 'umi'
import styled from 'styled-components'
import { RadioChangeEvent } from 'antd/lib/radio'
import type { FormInstance } from 'antd/lib/form'

const Wrapper = styled(Row)`
    background-color: #fff;
    position: absolute;
    left: 20px;
    top: 60px;
    width:240px;
    .ant-form-item {
        margin-bottom: 8px;
    }
`

const help_doc = [{ id: 'mustRead', name: '必看' }, { id: 'course', name: '教程' }, { id: 'docs', name: '文档' }]
const notice = [{ id: 'maintain', name: '维护' }, { id: 'notice', name: '通知' }, { id: 'upgrade', name: '升级' }, { id: 'stop', name: '暂停' }]

const obj = { help_doc, notice }

const Setting: React.ForwardRefRenderFunction<FormInstance | undefined, {}> = (props, ref) => {
    const [form] = Form.useForm()
    const { doc_type, doc_id } = useParams() as any

    const [isActive, setIsActive] = useState(true)

    useImperativeHandle(ref, () => ({ ...form }))

    const handleActiveChange = (e: RadioChangeEvent) => {
        setIsActive(e.target.value)
    }

    return (
        <Wrapper>
            <Row style={{ flexDirection: 'column', width: '100%' }}>
                <Row align="middle" style={{ padding: '8px 20px', gap: 6 }}>
                    <Breadcrumb>
                        <Breadcrumb.Item>
                            <Link to={`/${doc_type}`}>
                                <Typography.Link style={{ cursor: 'pointer' }} >
                                    {doc_type === 'help_doc' ? '帮助文档' : '公告'}
                                </Typography.Link>
                            </Link>
                        </Breadcrumb.Item>
                        <Breadcrumb.Item>
                            <Typography.Text>
                                {doc_id ? '编辑' : '新建'}
                            </Typography.Text>
                        </Breadcrumb.Item>
                    </Breadcrumb>
                </Row>
                <Divider style={{ margin: 0 }} />
                <Form
                    form={form}
                    style={{ width: '100%', padding: 20 }}
                    layout="vertical"
                    initialValues={{
                        active: 1,
                        is_top: false,
                        tags: obj[doc_type][0].id
                    }}
                >
                    <Form.Item label="是否生效" name="active" required >
                        <Radio.Group onChange={handleActiveChange}>
                            <Radio value={1}>是</Radio>
                            <Radio value={0}>否</Radio>
                        </Radio.Group>
                    </Form.Item>
                    <Form.Item label="类型" name="tags" required>
                        <Select>
                            {
                                obj[doc_type].map((item: any) => (
                                    <Select.Option key={item.id} value={item.id} >
                                        {item.name}
                                    </Select.Option>
                                ))
                            }
                        </Select>
                    </Form.Item>
                    <Form.Item noStyle name="is_top" valuePropName="checked">
                        <Checkbox disabled={!isActive}>置顶该文档</Checkbox>
                    </Form.Item>
                </Form>
            </Row>
        </Wrapper>
    )
}

export default forwardRef(Setting)