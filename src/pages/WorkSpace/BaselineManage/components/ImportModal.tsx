import { Form, Modal, Row, Space, Button, Input, Upload, message } from "antd";
import React from "react";
import { InboxOutlined } from "@ant-design/icons"
import { useIntl, useParams, useRouteMatch } from "umi";
import { baselineNameCheck, importBaseline } from "../services";
import type { UploadChangeParam, UploadFile } from "antd/lib/upload";

export const zhCN_locales = {
    "baseline.import.modal.title": "导入{test_type}",
    "baseline.import.modal.form.file": "文件",
    "baseline.import.modal.form.file.text": "单击或拖动文件到此区域进行上传",
    "baseline.import.modal.form.file.hint": "支持单次上传，仅可上传.tar后缀文件",
    "baseline.import.modal.form.rule.empty": "上传文件不能为空！",

    "baseline.import.modal.form.name": "基线名称",
    "baseline.import.modal.form.name.rule.exists": "基线名称已存在，请重新输入",
    "baseline.import.modal.form.name.placeholder": "输入基线名称，默认读取上传文件名",
}

export const enUS_locales = {
    "baseline.import.modal.title": 'Import {test_type}',
    "baseline.import.modal.form.file": 'File',
    "baseline.import.modal.form.file.text": 'Click or drag files to this aera to upload',
    "baseline.import.modal.form.file.hint": 'Only one file can be updated at a time,with .tar as the suffix. ',
    "baseline.import.modal.form.rule.empty": 'The file attachment cannot be empty.',

    "baseline.import.modal.form.name": 'Baseline Name',
    "baseline.import.modal.form.name.rule.exists": 'The baseline name already exists, please re-enter it.',
    "baseline.import.modal.form.name.placeholder": 'Please enter the baseline name, which displays the uploaded file name by default.',
}

const ImportModal: React.ForwardRefRenderFunction<AnyType, AnyType> = (props, ref) => {
    const intl = useIntl()
    const { ws_id } = useParams() as any
    const { onOk } = props
    const match = useRouteMatch()
    const l = match.path.split("/")
    const test_type = l[l.length - 1]

    const [open, setOpen] = React.useState(false)
    const [fetching, setFetching] = React.useState(false)

    const [form] = Form.useForm()

    const fileField = Form.useWatch("file", form)
    const newName = Form.useWatch("name", form)

    React.useEffect(() => {
        if (Object.prototype.toString.call(newName) === "[object String]") return
        if (!fileField) return
        const [f] = fileField
        const { name } = f
        if (!name) return
        form.setFieldsValue({ name: name.split(".")[0] })
    }, [fileField, newName, form])

    React.useImperativeHandle(ref, () => ({
        show() {
            setOpen(true)
        }
    }))

    const handleClose = () => {
        form.resetFields()
        setOpen(false)
    }

    const handleCheckName = async (name: string) => {
        if (!name) return false
        const { data, code } = await baselineNameCheck({ ws_id, name, test_type })
        if (code !== 200) {
            message.warn("发生错误，请重试！")
            return true
        }
        if (code === 200 && data) {
            if (data.length > 0) {
                return true
            }
            if (data && data.length === 0) {
                return false
            }
        }
        return true
    }

    const handleSubmit = () => {
        if (fetching) return
        form.validateFields()
            .then(async (values: any) => {
                setFetching(true)
                const { name } = values
                const hasName = await handleCheckName(name)

                if (hasName) {
                    form.setFields([{
                        name: "name",
                        errors: [intl.formatMessage({ id: "baseline.import.modal.form.name.rule.exists" })]
                    }])
                    setFetching(false)
                    return
                }

                if (!hasName) {
                    const formData = new FormData();
                    const params = {
                        ...values, ws_id,
                        file: values.file[0].originFileObj,
                        test_type
                    }
                    Object.keys(params).forEach(key => {
                        if (params[key]) { // 过滤掉无效参数
                            formData.append(key, params[key]);
                        }
                    })
                    const { data, code, msg } = await importBaseline(formData)
                    setFetching(false)
                    if (code !== 200) {
                        form.setFields([{
                            name: "file",
                            errors: [msg]
                        }])
                        return
                    }
                    if (code === 200) {
                        onOk()
                        message.success(intl.formatMessage({ id: "operation.success" }))
                        handleClose()
                    }
                }
            })
    }

    const normFile = (e: any) => Array.isArray(e) ? e : e?.fileList;

    return (
        <Modal
            title={
                intl.formatMessage({
                    defaultMessage: "导入",
                    id: "baseline.import.modal.title"
                }, {
                    test_type: intl.formatMessage({ id: `baseline.${test_type}` })
                })
            }
            open={open}
            onCancel={handleClose}
            footer={
                <Row justify={"end"}>
                    <Space>
                        <Button
                            onClick={handleClose}
                        >
                            {intl.formatMessage({ id: "operation.cancel" })}
                        </Button>
                        <Button
                            type="primary"
                            onClick={handleSubmit}
                            disabled={fetching}
                        >
                            {intl.formatMessage({ id: "operation.ok" })}
                        </Button>
                    </Space>
                </Row>
            }
            destroyOnClose
            width={"35%"}
        >
            <Form
                layout="vertical"
                form={form}
            >
                <Form.Item label={intl.formatMessage({ defaultMessage: "文件", id: "baseline.import.modal.form.file" })}>
                    <Form.Item
                        name="file"
                        valuePropName="fileList"
                        getValueFromEvent={normFile}
                        noStyle
                        rules={[{ required: true, message: intl.formatMessage({ id: `baseline.import.modal.form.rule.empty` }) }]}
                    >
                        <Upload.Dragger
                            name="files"
                            action=""
                            accept=".tar"
                            multiple={false}
                            beforeUpload={() => false}
                            onChange={(info: UploadChangeParam<UploadFile<any>>) => {
                                const { file } = info
                                form.setFieldsValue({ name: file.name.split(".")[0] })
                            }}
                            maxCount={1}
                        >
                            <p className="ant-upload-drag-icon">
                                <InboxOutlined />
                            </p>
                            <p className="ant-upload-text">
                                {
                                    intl.formatMessage({
                                        id: "baseline.import.modal.form.file.text",
                                        defaultMessage: "单击或拖动文件到此区域进行上传"
                                    })
                                }
                            </p>
                            <p className="ant-upload-hint">
                                {
                                    intl.formatMessage({
                                        id: "baseline.import.modal.form.file.text",
                                        defaultMessage: "支持单次上传，仅可上传.tar后缀文件"
                                    })
                                }
                            </p>
                        </Upload.Dragger>
                    </Form.Item>
                </Form.Item>

                <Form.Item
                    label={intl.formatMessage({ defaultMessage: "基线名称", id: "baseline.import.modal.form.name" })}
                    name="name"
                >
                    <Input
                        allowClear
                        placeholder={intl.formatMessage({
                            defaultMessage: "输入基线名称，默认读取上传文件名",
                            id: "baseline.import.modal.form.name.placeholder"
                        })}
                    />
                </Form.Item>
            </Form>
        </Modal>
    )
}

export default React.forwardRef(ImportModal)