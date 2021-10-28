import { Drawer, Space, Typography, Form, Tooltip, Button, message, Menu, Modal, Dropdown, Input } from 'antd'
import React, { forwardRef, useState, useImperativeHandle } from 'react'
import { createBranch, updateBranch, deleteBranch, checkGitlab } from '../services'
import { MoreOutlined } from '@ant-design/icons'
import EllipsisPulic from '@/components/Public/EllipsisPulic';
import styles from './index.less'

export default forwardRef(
    (props: any, ref: any) => {
        const [form] = Form.useForm()
        const [visible, setVisible] = useState(false)
        const [title, setTitle] = useState('新增Branch')
        const [msg, setMsg] = useState<string>()
        const [deleteVisible, setDeleteVisible] = useState(false);
        const [validateStatus, setValidateStatus] = useState<any>(undefined)
        const [hasFeedback, setHasFeedback] = useState(false)
        const [padding, setPadding] = useState(false)
        const [warehouse, setWarehouse] = useState({})
        useImperativeHandle(
            ref,
            () => ({
                show: (title: string = "新增Branch", data: any = {}) => {
                    setVisible(true)
                    setTitle(title)
                    setWarehouse(data)
                    setPadding(false)
                    setHasFeedback(false)
                    setValidateStatus(undefined)
                    setMsg(undefined)
                    form.setFieldsValue(data)
                }
            })
        )
        const handleClose = () => {
            form.resetFields()
            setVisible(false)
        }
        const UrlBlur = async (e: any) => {
            const branchValue = e.target.value
            const { code } = await checkGitlab({ check_name: 'branch', repo: props.current.git_url, branch: branchValue })
            if (code === 200) {
                setValidateStatus('success')
                setHasFeedback(true)
                setMsg(undefined)
            } else {
                setPadding(false)
                setValidateStatus('error')
                setMsg('请检查是否存在!')
                setHasFeedback(false)
            }
            if (branchValue.replace(/(^\s*)|(\s*$)/g, '') === '') {
                setValidateStatus('warning')
                setMsg('请输入!')
                setHasFeedback(true)
            }
        }
        const defaultOption = (code: number, msg: string) => {
            if (code === 200) {
                props.onOk()
                message.success('操作成功')
                handleClose();
            } else if (code === 1376) {
                setMsg('Branch名称已存在')
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
                    if (title === '新增Branch') {
                        const { code, msg } = await createBranch({ repo_id: props.current.id, ...values })
                        defaultOption(code, msg)
                    }
                    else {
                        const { code, msg } = await updateBranch({ branch_id: warehouse['id'], ...values })
                        defaultOption(code, msg)
                    }
                })
                .catch(err => {
                    console.log(err)
                    setPadding(false)
                })
        }
        const setDeleteBranch = async () => {
            const { code, msg } = await deleteBranch({ branch_id: warehouse['id'] })
            fetchFinally(code, msg)
        }
        const fetchFinally = (code: number, msg: string) => {
            if (code === 200) {
                message.success('操作成功!')
                props.onOk()
                handleClose()
                setDeleteVisible(false)
            }
            else message.error(msg)
        }
        return (
            <Drawer
                maskClosable={false}
                keyboard={false}
                title={title}
                width="380"
                onClose={handleClose}
                visible={visible}
                className={styles.drawer_warpper}
                footer={
                    <div style={{ textAlign: 'right', }} >
                        <Space>
                            <Button onClick={handleClose}>取消</Button>
                            <Button type="primary" disabled={padding} onClick={handleOk}>{title === '新增Branch' ? '确定' : '更新'}</Button>
                        </Space>
                    </div>
                }
            >
                <Dropdown
                    placement="topLeft"
                    overlayStyle={{ cursor: 'pointer' }}
                    overlay={
                        <Menu>
                            <Menu.Item onClick={() => setDeleteVisible(true)}><i className={styles.menu_font_color}>删除Branch</i></Menu.Item>
                        </Menu>
                    }
                >
                    <MoreOutlined style={{ cursor: 'pointer', position: 'absolute', right: 55, top: 21 }} />
                </Dropdown>
                <div className={styles.content_warpper}>
                    <Space style={{ display: 'revert', marginBottom: 5 }}>
                        <Typography.Text style={{ color: '#000', opacity: 0.85, fontSize: 14, fontWeight: 'bold' }}>仓库名称</Typography.Text>
                    </Space>

                    <Space className={styles.title_detail_branch}>
                        <EllipsisPulic title={props.current.name} width={320}/>
                        {/* <Tooltip title={props.current.name} placement="topLeft" overlayStyle={{ wordBreak: 'break-all' }}>
                            <Typography.Text className={styles.create_branch_name}>{props.current.name}</Typography.Text>
                        </Tooltip> */}
                    </Space>
                </div>
                <div style={{ height: 10, backgroundColor: '#f5f5f5' }}></div>
                <div className={styles.content_warpper}>
                    <Form
                        form={form}
                        layout="vertical"
                        /*hideRequiredMark*/
                        className={styles.product_form}
                    >
                        <Form.Item label="Branch" rules={[{ required : true , message : '请输入Branch' }]} name="name" help={msg} validateStatus={validateStatus} hasFeedback={hasFeedback}>
                            <Input autoComplete="auto" placeholder="请输入Branch" onBlur={(e: any) => UrlBlur(e)} />
                        </Form.Item>
                        <Form.Item label="Branch描述" name="description">
                            <Input.TextArea placeholder="请输入描述信息" rows={4} />
                        </Form.Item>

                    </Form>
                </div>
                <Modal
                    title="删除提示"
                    cancelText="取消"
                    okType="danger"
                    centered={true}
                    className={styles.modalChange}
                    okText="删除"
                    visible={deleteVisible}
                    onOk={() => setDeleteBranch()}
                    onCancel={() => setDeleteVisible(false)}
                    width={390}
                    maskClosable={false}
                >
                    <p>你确定要删除【{warehouse['name']}】Branch吗？</p>
                </Modal>
            </Drawer>
        )
    }
)