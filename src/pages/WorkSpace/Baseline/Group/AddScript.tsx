import { Drawer, Space, Button, Form, Input, Typography, message, Divider } from 'antd'
import React, { forwardRef, useState, useImperativeHandle } from 'react'
import { createBaseline, updateBaseline } from '../services'
import styles from './index.less'
import { useParams, useIntl, FormattedMessage } from 'umi'
import { aligroupServer, aliyunServer } from '@/utils/utils'

export default forwardRef(
    (props: any, ref: any) => {
        const { formatMessage } = useIntl()
        const intl = useIntl()
        const { ws_id }: any = useParams()
        const [form] = Form.useForm()
        const [padding, setPadding] = useState(false) // 确定按钮是否置灰
        const [visible, setVisible] = useState(false) // 控制弹框的显示与隐藏
        const [title, setTitle] = useState('add') // 弹框顶部title
        const [editer, setEditer] = useState<any>({}) // 编辑的数据
        const [queryStatus, setQueryStatus] = useState(true)
        const [nameStatus, setNameStatus] = useState(true)
        useImperativeHandle(
            ref,
            () => ({
                show: (title: string = 'add', data: any = {}) => {
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
                message.success(formatMessage({id: 'operation.success'}) )
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
        // const manageType = `${routeName === "group" ? aligroupServer : aliyunServer}环境`
        const manageType = intl.formatMessage({ id: routeName === "group" ? 'aligroupServer' : 'aliyunServer' }) + formatMessage({ id: 'baseline.addScript.env'}) ;
        const baselineType = intl.formatMessage({ id: `baseline.${props.baselineType}` });
        // const baselineType = intl.formatMessage({ id: `pages.workspace.baseline.type.${props.baselineType}` });

        const serverProvider = routeName === 'group' ? 'aligroup' : 'aliyun';
        const testType = props.baselineType === 'functional' ? 'functional' : 'performance';

        const NAME_EXISTS = intl.formatMessage({ id: 'pages.workspace.baseline.addScript.error.name_exists' })
        const NAME_NULL = intl.formatMessage({ id: 'pages.workspace.baseline.addScript.error.name_null' })

        const handleOk = () => {
            if (!form.getFieldValue('name')) {
                setNameStatus(false)
                return
            }
            setPadding(true)
            form.validateFields() // 触发表单验证，返回Promise
                .then(async (values) => {
                    const params = { server_provider: serverProvider, test_type: testType, ws_id, ...values }
                    const isNew = JSON.stringify(editer) === '{}'

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
                title={<FormattedMessage id={`baseline.addScript.${title}`}/>}
                width="375"
                onClose={handleClose}
                visible={visible}
                className={styles.add_baseline_drawer}
                footer={
                    <div style={{ textAlign: 'right', }} >
                        <Space>
                            <Button onClick={handleClose}><FormattedMessage id="operation.cancel"/></Button>
                            <Button type="primary" disabled={padding} onClick={handleOk}>
                                {editer && editer.name ? <FormattedMessage id="operation.update"/>: <FormattedMessage id="operation.ok"/>}
                            </Button>
                        </Space>
                    </div>
                }
            >
                <div className={styles.server_provider}>
                    <Space>
                        <Typography.Text className={styles.script_right_name} strong={true}>
                            <FormattedMessage id={`pages.workspace.baseline.addScript.text.manageType`} />
                        </Typography.Text>
                        <Typography.Text>{manageType}</Typography.Text>
                    </Space>
                </div>
                <div className={styles.server_provider}>
                    <Space>
                        <Typography.Text className={styles.script_right_name} strong={true}>
                            <FormattedMessage id={`pages.workspace.baseline.addScript.text.baselineType`} />
                        </Typography.Text>
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
                        label={<FormattedMessage id={`pages.workspace.baseline.addScript.label.name`} />}
                        name="name"
                        validateStatus={(!nameStatus || !queryStatus) && 'error' || ''}
                        help={(!nameStatus ? NAME_NULL : undefined) || (!queryStatus ? NAME_EXISTS : undefined)}
                        rules={[{ required: true }]}
                    >
                        <Input
                            autoComplete="off"
                            placeholder={intl.formatMessage({ id: 'pages.workspace.baseline.addScript.label.name.placeholder' })}
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
                    <Form.Item label={<FormattedMessage id={`pages.workspace.baseline.addScript.label.description`} />}
                        name="description">
                        <Input.TextArea placeholder={intl.formatMessage({ id: 'pages.workspace.baseline.addScript.label.description.placeholder' })} />
                    </Form.Item>
                </Form>
            </Drawer>
        )
    }
)