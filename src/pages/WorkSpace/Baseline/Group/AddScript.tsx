import { Drawer, Space, Button, Form, Input, Typography, message, Divider } from 'antd'
import React, { forwardRef, useState, useImperativeHandle } from 'react'
import { createBaseline, updateBaseline } from '../services'
import styles from './index.less'
import { useParams } from 'umi'

export default forwardRef(
    (props: any, ref: any) => {
        const { ws_id }: any = useParams()
        const [form] = Form.useForm()
        const [padding, setPadding] = useState(false) // 确定按钮是否置灰
        const [visible, setVisible] = useState(false) // 控制弹框的显示与隐藏
        const [title, setTitle] = useState('新增基线信息') // 弹框顶部title
        const [editer, setEditer] = useState<any>({}) // 编辑的数据
        const [queryStatus, setQueryStatus] = useState(true)
        const [nameStatus, setNameStatus] = useState(true)
        useImperativeHandle(
            ref,
            () => ({
                show: (title: string = "新增基线信息", data: any = {}) => {
                    setVisible(true)
                    setTitle(title)
                    setEditer(data)
                    setQueryStatus(true)
                    form.setFieldsValue(data) // 动态改变表单值
                }
            })
        )
        const handleClose = () => {
            form.resetFields() // 重置一组字段到 initialValues
            setPadding(false)
            setVisible(false)
            setQueryStatus(true)
        }

        const defaultOption = (code: number, msg: string, type: string) => {
            if (code === 200) {
                if (type === 'new') props.setCurrent({})
                props.onOk()
                message.success('操作成功')
                setQueryStatus(true)
                setVisible(false)
                form.resetFields() //重置一组字段到 initialValues
            }
            else {
                if (code === 201) {
                    setQueryStatus(false)
                } else {
                    message.error(msg)
                }

            }
            setPadding(false)
        }

        const routeName = window.location.pathname.split('baseline/')[1];
        const manageType = routeName === 'group' ? '内网环境' : '云上环境';
        const baselineType = props.baselineType === 'functional' ? '功能' : ' 性能';
        const serverProvider = routeName === 'group' ? 'aligroup' : 'aliyun';
        const testType = props.baselineType === 'functional' ? 'functional' : 'performance';

        const handleOk = () => {
            if (!form.getFieldValue('name')) {
                setNameStatus(false)
                return
            }
            setPadding(true)
            form.validateFields() // 触发表单验证，返回Promise
                .then(async (values) => {
                    const params = { server_provider: serverProvider, test_type: testType, ws_id, ...values }
                    const isNew = title === '新增基线'

                    const { code, msg } = isNew ?
                        await createBaseline({ version: '', ...params }) :
                        await updateBaseline({ baseline_id: editer.id, ...params })

                    defaultOption(code, msg, isNew ? 'new' : 'edit')
                })
                .catch(err => console.log(err))
        }

        return (
            <Drawer
                maskClosable={false}
                keyboard={false}
                title={title}
                width="375"
                onClose={handleClose}
                visible={visible}
                className={styles.add_baseline_drawer}
                footer={
                    <div style={{ textAlign: 'right', }} >
                        <Space>
                            <Button onClick={handleClose}>取消</Button>
                            <Button type="primary" disabled={padding} onClick={handleOk}>{editer && editer.name ? '更新' : '确定'}</Button>
                        </Space>
                    </div>
                }
            >
                <div className={styles.server_provider}>
                    <Space>
                        <Typography.Text className={styles.script_right_name} strong={true}>ServerProvider</Typography.Text>
                        <Typography.Text>{manageType}</Typography.Text>
                    </Space>
                </div>
                <div className={styles.server_provider}>
                    <Space>
                        <Typography.Text className={styles.script_right_name} strong={true}>基线类型</Typography.Text>
                        <Typography.Text>{baselineType}</Typography.Text>
                    </Space>
                </div>
                <div className={styles.line}>
                    <Divider style={{
                        borderTop: '10px solid #F5F5F5',
                    }} />
                </div>
                <Form
                    form={form}
                    layout="vertical" // 表单布局 ，垂直
                >
                    <Form.Item
                        label="基线名称"
                        name="name"
                        validateStatus={(!nameStatus || !queryStatus) && 'error' || ''}
                        help={(!nameStatus && `基线名称不能为空`) || (!queryStatus && `基线名称已存在`)}
                        rules={[{ required: true }]}
                    >
                        <Input
                            autoComplete="auto"
                            placeholder="请输入基线名称"
                            onChange={(e) => {
                                setQueryStatus(true)
                                if (!e.target.value) {
                                    setNameStatus(false)
                                    return
                                }
                                setNameStatus(true)
                            }}
                        />
                    </Form.Item>
                    <Form.Item label="基线描述（选填）" name="description">
                        <Input.TextArea placeholder="请输入基线描述信息" />
                    </Form.Item>
                </Form>
            </Drawer>
        )
    }
)