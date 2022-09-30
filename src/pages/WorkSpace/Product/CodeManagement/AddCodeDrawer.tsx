import { Drawer, Space, Button, Form, Input, message } from 'antd'
import React, { forwardRef, useState, useImperativeHandle } from 'react'
import { useIntl, FormattedMessage } from 'umi'
import { createRepository, updateRepository, checkGitlab } from '../services'
import styles from './index.less'

export default forwardRef(
    (props: any, ref: any) => {
        const { formatMessage } = useIntl()
        const [form] = Form.useForm()

        const [visible, setVisible] = useState(false)
        const [padding, setPadding] = useState(false)
        const [title, setTitle] = useState('new')
        const [msg, setMsg] = useState<string>()
        const [urlMsg, setUrlMsg] = useState<string>()
        const [validateStatus, setValidateStatus] = useState<any>('')
        const [validateStatusName, setValidateStatusName] = useState<any>(undefined)
        const [hasFeedback, setHasFeedback] = useState(false)
        const ws_id = window.location.pathname.replace(/\/ws\/([a-zA-Z0-9]{8})\/.*/, '$1')

        useImperativeHandle(
            ref,
            () => ({
                show: (title: string = "new", data: any = {}) => {
                    setVisible(true)
                    setTitle(title)
                    setHasFeedback(false)
                    setPadding(false)
                    setValidateStatus(undefined)
                    setValidateStatusName(undefined)
                    setMsg(undefined)
                    setUrlMsg(undefined)
                    form.setFieldsValue(data)
                }
            })
        )

        const handleClose = () => {
            form.resetFields()
            setPadding(false)
            setVisible(false)

        }
        const UrlBlur = async (e: any) => {
            const urlValue = e.target.value
            const reg = /^.*\.git$/
            const { code } = await checkGitlab({ check_name: 'repo', repo: urlValue })
            if (code == 200) {
                setValidateStatus('success')
                setHasFeedback(true)
                setUrlMsg(undefined)
            } else if (!reg.test(urlValue)) {
                setValidateStatus('warning')
                setUrlMsg(formatMessage({id:'product.please.enter.right.gitUrl'}) )
                setHasFeedback(true)
            } else {
                setPadding(false)
                setValidateStatus('error')
                setUrlMsg(formatMessage({id:'product.please.check.permission'}) )
                setHasFeedback(true)
            }
        }
        
        const defaultOption = (code: number, msg: string,title:string) => {
            if (code === 200) {
                props.onOk(title)
                message.success(formatMessage({id:'operation.success'}) )
                setVisible(false)
                form.resetFields()
            } else if (code === 1371) {
                setMsg(formatMessage({id:'product.repositories.already.exists'}) )
                setValidateStatusName("error")
                setPadding(false)
            }
            else {
                message.error(msg)
                setPadding(false)
            }
        }

        const handleOk = () => {
            setPadding(true)
            form.validateFields()
            .then(async (values) => {
                if (title === 'new') {
                    const { code, msg } = await createRepository({ ws_id, ...values })
                    defaultOption(code, msg, title)
                } else {
                    const { code, msg } = await updateRepository({ ws_id, repo_id: form.getFieldValue('id'), ...values })
                    defaultOption(code, msg,title)
                }
                //message.error(msg)
            })
            .catch(err => setPadding(false))
        }

        return (
            <Drawer 
                maskClosable={ false }
                keyboard={ false }
                title={title === 'new' ? <FormattedMessage id="product.new.repositories"/>: <FormattedMessage id="product.edit.repositories"/>}
                width="380"
                onClose={handleClose}
                visible={visible}
                footer={
                    <div style={{ textAlign: 'right', }} >
                        <Space>
                            <Button onClick={handleClose}><FormattedMessage id="operation.cancel"/></Button>
                            <Button type="primary" disabled={padding} onClick={handleOk}>
                                {title === 'new' ? <FormattedMessage id="operation.ok"/>: <FormattedMessage id="operation.update"/>}
                            </Button>
                        </Space>
                    </div>
                }
            >

                <Form
                    form={form}
                    layout="vertical"
                    /*hideRequiredMark*/
                    className={styles.product_form}
                >
                    <Form.Item label={<FormattedMessage id="product.repositories"/>}
                        name="name" 
                        rules={[{ 
                            required : true, 
                            message : formatMessage({id:'product.please.enter.repositories'}),
                        }]} 
                        help={msg} validateStatus={validateStatusName}>
                        <Input autoComplete="auto" 
                            placeholder={formatMessage({id:'product.please.enter.repositories'})}
                        />
                    </Form.Item>

                    <Form.Item label="GitUrl" 
                        name="git_url" 
                        rules={[{ 
                            required : true , 
                            message: formatMessage({id:'product.please.enter.gitUrl'}),
                        }]}  
                        help={urlMsg} 
                        validateStatus={validateStatus} 
                        hasFeedback={hasFeedback}>
                        <Input autoComplete="auto" 
                            placeholder={formatMessage({id:'product.please.enter.gitUrl'}) }
                            onBlur={(e: any) => UrlBlur(e)} />
                    </Form.Item>

                    <Form.Item 
                        label={<FormattedMessage id="product.repositories.desc"/>}
                        name="description">
                        <Input.TextArea 
                            placeholder={formatMessage({id:'product.please.enter.desc'}) }
                            rows={4} />
                    </Form.Item>
                </Form>
            </Drawer>
        )
    }
)