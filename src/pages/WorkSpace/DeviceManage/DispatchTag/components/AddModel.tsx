import React from 'react'
import { Drawer, Button, Form, Input, message } from 'antd'
import ColorPicker from './ColorPicker';
import { addTag, editTag } from '../service';
import { useParams } from 'umi'

const nameReg = /^[A-Za-z0-9\._-]{0,32}$/

const AddModel: React.ForwardRefRenderFunction<{}, { callback: () => void }> = ({ callback }, ref) => {
    const { ws_id } = useParams() as any

    const [form] = Form.useForm();

    const [visible, setVisible] = React.useState<boolean>(false)
    const [fetching, setFetching] = React.useState<boolean>(false)
    const [dataSet, setDataSet] = React.useState<any>({})

    React.useImperativeHandle(ref, () => ({
        show(data: any) {
            if (data) {
                setDataSet(data ? data : {})
                form.setFieldsValue(data)
            }
            setVisible(true)
        }
    }))

    React.useEffect(() => {
        () => {
            handleClose()
        }
    }, [])

    const handleClose = () => {
        setDataSet({})
        setVisible(false)
        setFetching(false)
        form.resetFields()
    }

    const onSuiteSubmit = () => {
        if (fetching) {
            return
        }
        setFetching(true)
        form
            .validateFields()
            .then(
                async (values) => {
                    const params = { ws_id, ...values }
                    const { code, msg }: any = dataSet.id ? await editTag(dataSet.id, params) : await addTag(params)
                    if (code !== 200) {
                        setFetching(false)
                        message.error(msg)
                        return
                    }
                    message.success('操作成功');
                    callback()
                    handleClose()
                }
            ).catch(err => {
                setFetching(false)
            })
    }

    return (
        <Drawer
            maskClosable={false}
            keyboard={false}
            title={(dataSet.id ? '编辑' : "创建") + "标签"}
            width={376}
            onClose={handleClose}
            visible={visible}
            bodyStyle={{ paddingBottom: 80 }}
            footer={
                <div style={{ textAlign: 'right', }} >
                    <Button onClick={handleClose} style={{ marginRight: 8 }}>
                        取消
                    </Button>
                    <Button onClick={onSuiteSubmit} type="primary" htmlType="submit" >
                        {dataSet.id ? '更新' : '确定'}
                    </Button>
                </div>
            }
        >
            <Form
                layout="vertical"
                form={form}
                initialValues={{
                    tag_color: 'rgb(255,157,78,1)'
                }}
            >
                <Form.Item
                    name="tag_color"
                    label="标签颜色"
                    rules={[{ required: true, message: '请选择' }]}
                >
                    <ColorPicker />
                </Form.Item>
                <Form.Item
                    name="name"
                    label="标签名称"
                    rules={[
                        {
                            validator(rule, value) {
                                if (!value) return Promise.reject('标签名称不能为空')
                                if (!value.replace(/\s+/g, "")) return Promise.reject('标签名称不能为空')
                                if (!nameReg.test(value)) return Promise.reject('仅允许包含字母、数字、下划线、中划线、点，最长32个字符')
                                return Promise.resolve()
                            }
                        }
                    ]}
                >
                    <Input
                        placeholder="请输入"
                        autoComplete="off"
                    />
                </Form.Item>
                <Form.Item
                    name="description"
                    label="备注"
                >
                    <Input.TextArea rows={3} placeholder="请输入备注信息" />
                </Form.Item>
            </Form>
        </Drawer>
    )
}

export default React.forwardRef(AddModel)