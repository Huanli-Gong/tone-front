import { Drawer, Space, Button, Form, Input, message } from 'antd'
import React, { forwardRef, useState, useImperativeHandle } from 'react'
import { createRepository, updateRepository, checkGitlab } from '../services'
import styles from './index.less'
export default forwardRef(
    (props: any, ref: any) => {
        const [form] = Form.useForm()

        const [visible, setVisible] = useState(false)
        const [padding, setPadding] = useState(false)
        const [title, setTitle] = useState('新增仓库')
        const [msg, setMsg] = useState<string>()
        const [urlMsg, setUrlMsg] = useState<string>()
        const [validateStatus, setValidateStatus] = useState<any>('')
        const [validateStatusName, setValidateStatusName] = useState<any>(undefined)
        const [hasFeedback, setHasFeedback] = useState(false)
        const ws_id = window.location.pathname.replace(/\/ws\/([a-zA-Z0-9]{8})\/.*/, '$1')

        useImperativeHandle(
            ref,
            () => ({
                show: (title: string = "新增仓库", data: any = {}) => {
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
                setUrlMsg('请输入正确的gitUrl地址!')
                setHasFeedback(true)
            } else {
                setPadding(false)
                setValidateStatus('error')
                setUrlMsg('请检查是否有权限!')
                setHasFeedback(true)
            }
        }
        
        const defaultOption = (code: number, msg: string,title:string) => {
            if (code === 200) {
                props.onOk(title)
                message.success('操作成功')
                setVisible(false)
                form.resetFields()
            } else if (code === 1371) {
                setMsg('仓库名称已存在')
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
                if (title === '新增仓库') {
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
                title={title}
                width="380"
                onClose={handleClose}
                visible={visible}
                footer={
                    <div style={{ textAlign: 'right', }} >
                        <Space>
                            <Button onClick={handleClose}>取消</Button>
                            <Button type="primary" disabled={padding} onClick={handleOk}>{title === '新增仓库' ? '确定' : '更新'}</Button>
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
                    <Form.Item label="仓库名称" name="name" rules={[{ required : true , message : '请输入仓库名称'}]} help={msg} validateStatus={validateStatusName}>
                        <Input autoComplete="auto" placeholder="请输入仓库名称" />
                    </Form.Item>

                    <Form.Item label="GitUrl" name="git_url" rules={[{ required : true , message : '请输入GitUrl'}]}  help={urlMsg} validateStatus={validateStatus} hasFeedback={hasFeedback} >
                        <Input autoComplete="auto" placeholder="请输入GitUrl" onBlur={(e: any) => UrlBlur(e)} />
                    </Form.Item>

                    <Form.Item label="仓库描述" name="description">
                        <Input.TextArea placeholder="请输入描述信息" rows={4} />
                    </Form.Item>
                </Form>
            </Drawer>
        )
    }
)