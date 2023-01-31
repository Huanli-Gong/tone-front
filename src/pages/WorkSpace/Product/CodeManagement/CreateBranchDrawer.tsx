import { Drawer, Space, Typography, Form, Button, message, Menu, Modal, Dropdown, Input } from 'antd'
import React, { forwardRef, useState, useImperativeHandle } from 'react'
import { useIntl, FormattedMessage } from 'umi'
import { createBranch, updateBranch, deleteBranch, checkGitlab } from '../services'
import { MoreOutlined } from '@ant-design/icons'
import EllipsisPulic from '@/components/Public/EllipsisPulic';
import styles from './index.less'

export default forwardRef(
    (props: any, ref: any) => {
        const { formatMessage } = useIntl()
        const [form] = Form.useForm()
        const [visible, setVisible] = useState(false)
        const [title, setTitle] = useState('new')
        const [msg, setMsg] = useState<string>()
        const [deleteVisible, setDeleteVisible] = useState(false);
        const [validateStatus, setValidateStatus] = useState<any>(undefined)
        const [hasFeedback, setHasFeedback] = useState(false)
        const [padding, setPadding] = useState(false)
        const [warehouse, setWarehouse] = useState({})
        useImperativeHandle(
            ref,
            () => ({
                show: (title: string = "new", data: any = {}) => {
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
                setMsg(formatMessage({ id: 'product.please.check.whether.exists' }))
                setHasFeedback(false)
            }
            if (branchValue.replace(/(^\s*)|(\s*$)/g, '') === '') {
                setValidateStatus('warning')
                setMsg(formatMessage({ id: 'please.enter' }))
                setHasFeedback(true)
            }
        }
        const defaultOption = (code: number, msg: string) => {
            if (code === 200) {
                props.onOk()
                message.success(formatMessage({ id: 'operation.success' }))
                handleClose();
            } else if (code === 1376) {
                setMsg(formatMessage({ id: 'product.branch.already.exists' }))
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
                message.success(formatMessage({ id: 'operation.success' }))
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
                title={title === 'new' ? <FormattedMessage id="product.new.branch" /> : <FormattedMessage id="product.edit.branch" />}
                width="380"
                onClose={handleClose}
                visible={visible}
                className={styles.drawer_warpper}
                footer={
                    <div style={{ textAlign: 'right', }} >
                        <Space>
                            <Button onClick={handleClose}><FormattedMessage id="operation.cancel" /></Button>
                            <Button type="primary" disabled={padding} onClick={handleOk}>
                                {title === 'new' ? <FormattedMessage id="operation.ok" /> : <FormattedMessage id="operation.update" />}
                            </Button>
                        </Space>
                    </div>
                }
            >
                {
                    title !== 'new' &&
                    <Dropdown
                        placement="topLeft"
                        overlayStyle={{ cursor: 'pointer' }}
                        overlay={
                            <Menu>
                                <Menu.Item onClick={() => setDeleteVisible(true)}>
                                    <i className={styles.menu_font_color}>
                                        <FormattedMessage id="product.delete.branch" />
                                    </i>
                                </Menu.Item>
                            </Menu>
                        }
                    >
                        <MoreOutlined style={{ cursor: 'pointer', position: 'absolute', right: 55, top: 21 }} />
                    </Dropdown>
                }

                <div className={styles.content_warpper}>
                    <Space style={{ display: 'revert', marginBottom: 5 }}>
                        <Typography.Text style={{ color: '#000', opacity: 0.85, fontSize: 14, fontWeight: 'bold' }}><FormattedMessage id="product.repositories" /></Typography.Text>
                    </Space>

                    <Space className={styles.title_detail_branch}>
                        <EllipsisPulic title={props.current.name} width={320} />
                    </Space>
                </div>
                <div style={{ height: 10, backgroundColor: '#f5f5f5' }} />
                <div className={styles.content_warpper}>
                    <Form
                        form={form}
                        layout="vertical"
                        /*hideRequiredMark*/
                        className={styles.product_form}
                    >
                        <Form.Item
                            label="Branch"
                            rules={[{
                                required: true,
                                message: formatMessage({ id: 'product.please.enter.branch' }),
                            }]}
                            name="name"
                            help={msg} validateStatus={validateStatus} hasFeedback={hasFeedback}>
                            <Input
                                autoComplete="auto"
                                placeholder={formatMessage({ id: 'product.please.enter.branch' })}
                                onBlur={(e: any) => UrlBlur(e)} />
                        </Form.Item>
                        <Form.Item
                            label={<FormattedMessage id="product.branch.desc" />}
                            name="description">
                            <Input.TextArea
                                placeholder={formatMessage({ id: 'product.please.enter.desc' })}
                                rows={4}
                            />
                        </Form.Item>

                    </Form>
                </div>
                <Modal
                    title={<FormattedMessage id="delete.tips" />}
                    cancelText={<FormattedMessage id="operation.cancel" />}
                    okType="danger"
                    centered={true}
                    className={styles.modalChange}
                    okText={<FormattedMessage id="operation.delete" />}
                    open={deleteVisible}
                    onOk={() => setDeleteBranch()}
                    onCancel={() => setDeleteVisible(false)}
                    width={390}
                    maskClosable={false}
                >
                    <p>{formatMessage({ id: 'product.are.you.sure.you.delete.branch' }, { data: warehouse['name'] })}</p>
                </Modal>
            </Drawer>
        )
    }
)