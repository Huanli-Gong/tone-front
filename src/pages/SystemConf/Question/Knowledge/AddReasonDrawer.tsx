import { Drawer, Form, Space, Button, Input, Radio } from "antd"
import React from "react"
import styled from "styled-components"
import { FormattedMessage } from "umi"
import RichEditor from "@/components/RichEditor"
import { useFieldsSet } from "./FieldsSet"
import { postKnowlegeAnswers, putKnowlegeAnswers } from "./services"
import { replaceEmoji, tarnsformEmoji } from '@/components/RichEditor/components/Emoji/emojiReplacer';

const FormCls = styled(Form)`
    .ant-form-item {
        margin-bottom: 8px
    }
`

const AddReasonDrawer: React.ForwardRefRenderFunction<AnyType, AnyType> = (props, ref) => {
    const { onOk, problem_id } = props;

    const { SelectProblemAttribution, SelectProblemType } = useFieldsSet()

    const [open, setOpen] = React.useState(false)
    const [fetching, setFetching] = React.useState(false)
    const [source, setSource] = React.useState<any>()
    const [form] = Form.useForm()
    const [vm, setVm] = React.useState<any>()
    const [text, setText] = React.useState("")

    React.useImperativeHandle(ref, () => ({
        show(row: any) {
            setOpen(true)
            if (row) {
                setSource(row)
                form.setFieldsValue(row)
                setText(tarnsformEmoji(row.answer))
            }
        }
    }))

    const handleCancel = () => {
        form.resetFields()
        setOpen(false)
        setSource(undefined)
        setFetching(false)
        setText('')
        setVm(undefined)
    }

    const handleOk = async () => {
        try {
            const answer = replaceEmoji(vm?.getHTML() || '')

            if (!vm?.getText()) {
                form.setFields([{ name: 'answer', errors: ['答案不能为空，不能以纯图片的形式作为答案！'] }])
                return
            }
            const values = await form.validateFields()
            if (fetching) return
            setFetching(true)
            const { code, msg } = source ? await putKnowlegeAnswers({ ...values, answer, problem_id, answer_id: source.id }) :
                await postKnowlegeAnswers({ ...values, answer, problem_id })
            setFetching(false)

            if (code !== 200) {
                form.setFields([{ name: 'reason', errors: [msg] }])
                return
            }

            onOk?.()
            handleCancel()
        }
        catch (err) {

        }
    }

    return (
        <Drawer
            open={open}
            maskClosable={false}
            forceRender={true}
            keyboard={false}
            destroyOnClose
            onClose={handleCancel}
            width={860}
            title={!!source ? `编辑原因` : '新建原因'}
            footer={
                <div style={{ textAlign: 'right', }} >
                    <Space>
                        <Button onClick={handleCancel}><FormattedMessage id="operation.cancel" /></Button>
                        <Button type="primary" disabled={fetching} onClick={handleOk}>
                            {
                                !!source ?
                                    <FormattedMessage id="operation.update" /> :
                                    <FormattedMessage id="operation.ok" />
                            }
                        </Button>
                    </Space>
                </div>
            }
        >
            <FormCls
                form={form}
                layout='vertical'
                initialValues={{
                    enable: true,
                    problem_type: '',
                    problem_attribution: '',
                }}
            >
                <Form.Item
                    name="reason"
                    label="原因描述"
                    required
                >
                    <Input.TextArea
                        autoComplete="off"
                        allowClear
                        autoSize={{ minRows: 1 }}
                        placeholder={"请输原因描述"}
                    />
                </Form.Item>
                <Form.Item
                    name="problem_type"
                    label="问题分类"
                    required
                >
                    <SelectProblemType />
                </Form.Item>
                <Form.Item
                    name="problem_attribution"
                    label="分类归属"
                    required
                >
                    <SelectProblemAttribution />
                </Form.Item>
                <Form.Item
                    name="answer"
                    label="答案"
                >
                    <RichEditor
                        content={text}
                        editable={true}
                        placeholder={"请输原因描述"}
                        contentStyle={{ height: 320 }}
                        onCreate={({ editor }) => {
                            setVm(editor)
                        }}
                        onUpdate={({ editor }) => {
                            setVm(editor)
                        }}
                    />
                </Form.Item>
                <Form.Item
                    name="right_number"
                    label="满意度"
                >
                    <Input.TextArea
                        autoComplete="off"
                        allowClear
                        autoSize={{ minRows: 1 }}
                        placeholder={"请输满意度"}
                    />
                </Form.Item>
                <Form.Item
                    name="enable"
                    label="是否启用"
                    required
                >
                    <Radio.Group>
                        <Radio value={true}><FormattedMessage id="operation.yes" /></Radio>
                        <Radio value={false}><FormattedMessage id="operation.no" /></Radio>
                    </Radio.Group>
                </Form.Item>
            </FormCls>
        </Drawer>
    )

}

export default React.forwardRef(AddReasonDrawer)