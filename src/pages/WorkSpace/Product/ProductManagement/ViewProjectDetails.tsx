import { Drawer, Space, Typography, Tooltip, Table, Button, message, Popconfirm, Row, Col, Dropdown, Menu, Modal, Popover } from 'antd'
import React, { forwardRef, useState, useImperativeHandle, useRef, useEffect } from 'react'
import { QusetionIconTootip } from '@/components/Product/index'
import styles from './index.less'
import { deleteProject, updateBranchAndRelation, queryProjectBranch, deleteBranchAndRelation } from '../services'
import { CheckCircleOutlined, CheckCircleFilled, MoreOutlined } from '@ant-design/icons'
import UpdateProjectModal from './UpdateProject'
import EllipsisPulic from '@/components/Public/EllipsisPulic';
import AddCodeModal from './NewCodeModal'
import { useRequest } from 'umi'
import { isUndefined } from 'lodash'
import { requestCodeMessage } from '@/utils/utils'
export default forwardRef(
    (props: any, ref: any) => {
        const ws_id = window.location.pathname.replace(/\/ws\/([a-zA-Z0-9]{8})\/.*/, '$1')
        const [visible, setVisible] = useState(false)
        const [title, setTitle] = useState('项目详情')
        const [projectItem, setProject] = useState<any>({})
        //const [current, setCurrent] = useState<any>({})
        const projectModal: any = useRef(null)
        const addCodeModal: any = useRef(null)
        const [deleteVisible, setDeleteVisible] = useState(false);

        useImperativeHandle(
            ref,
            () => ({
                show: (title: string = "项目详情", data: any = {}) => {
                    setVisible(true)
                    setTitle(title)
                    setProject(data)
                    if ('id' in data)
                        run({ project_id: data.id })
                }
            })
        )
        const { data, loading, refresh, run } = useRequest(
            (data: any) => queryProjectBranch(data),
            {
                formatResult: response => response,
                initialData: { data: [] },
                manual: true
            }
        )

        useEffect(() => {
            const { data: dataSource } = props.projectData || {};
            const dataList = dataSource || []
            const newData = dataList.find((item: any) => item.id === projectItem.id)
            if (!isUndefined(newData)) {
                setProject(newData)
            }
        }, [props.projectData])
        const handleClose = () => {
            setVisible(false)
        }
        const handleSetDefault = async (_: any, data: any) => {
            const result = await updateBranchAndRelation({ is_master: 1, relation_id: data.id })
            defaultOption(result)
        }
        const handleRefresh = () => {
            run({ project_id: projectItem.id })
        }
        const defaultOption = (ret: any) => {
            if (ret.code === 200) {
                refresh()
                message.success('操作成功!')
            }
            else
                requestCodeMessage(ret.code, ret.msg)
        }
        const handleDelete = async (_: any) => {
            const { code, msg } = await deleteBranchAndRelation({ relation_id: _.id })
            if (code === 200) {
                refresh()
                message.success('操作成功!')
            }
            else {
                requestCodeMessage(code, msg)
            }
        }

        const columns = [{
            title: '仓库名称',
            dataIndex: 'branch_name',
            ellipsis: true,
            render: (text: string) => <EllipsisPulic title={text} />,
        },
        {
            title: 'GitUrl',
            dataIndex: 'git_url',
            ellipsis: true,
            render: (text: string) => <EllipsisPulic title={text} />,
        },
        {
            title: 'Branch',
            dataIndex: 'branch_name',
            ellipsis: true,
            render: (text: any) => <EllipsisPulic title={text} />,
        },
        {
            title: <QusetionIconTootip title="主仓库" desc="通过设置主仓库可以建立代码与job之间的关系。" />,
            width: 90,
            dataIndex: 'is_master',
            render: (_: any, data: any) => (
                data.is_master ? <CheckCircleFilled style={{ width: 17.5, height: 17.5, color: '#1890ff' }} /> : <CheckCircleOutlined style={{ cursor: 'pointer', width: 17.5, height: 17.5, color: 'rgba(0,0,0,.1)' }} onClick={() => handleSetDefault(_, data)} />
            )

        },
        {
            title: '操作',
            width: 80,
            render: (_: any) => (
                <div>
                    {
                        _.is_master
                            ? <Space>
                                <Popconfirm
                                    title="不可删除主仓库，请切换主仓库后再删除！"
                                    placement="bottomLeft"
                                    cancelText="取消"
                                    okText="删除"
                                    okType="default"
                                    okButtonProps={{
                                        disabled: true,
                                    }}
                                >
                                    <Typography.Text
                                        style={{ color: '#1890FF', cursor: 'pointer' }}
                                    >
                                        删除
                                    </Typography.Text>
                                </Popconfirm>
                            </Space>
                            : <Space>
                                <Popconfirm
                                    title="确定要删除吗？"
                                    onConfirm={() => handleDelete(_)}
                                    placement="bottomLeft"
                                    cancelText="取消"
                                    okText="确认"
                                >
                                    <Typography.Text
                                        style={{ color: '#1890FF', cursor: 'pointer' }}
                                    >
                                        删除
                                    </Typography.Text>
                                </Popconfirm>
                            </Space>
                    }
                </div>
            )
        }]
        const handleOk = async () => {
            await deleteProject({ project_id: projectItem.id, ws_id: ws_id }).then(res => {
                if (res.code === 200) {
                    message.success('删除成功');
                    setDeleteVisible(false)
                    // 关闭抽屉
                    setVisible(false)
                    hanldeSubmit();
                }
            })

        }
        const hanldeSubmit = () => {
            props.onOk();
            //handleClose();
        }
        const hanldeEdit = (projectItem: any) => {
            projectModal.current.show(projectItem)
        }
        const hanldeCodeModal = (projectItem: any) => {
            addCodeModal.current.show(projectItem, data)
        }

        return (
            <Drawer
                maskClosable={false}
                keyboard={false}
                title={title}
                width="680"
                onClose={handleClose}
                visible={visible}
                className={styles.drawer_warpper}
            >
                <Dropdown
                    placement="topLeft"
                    overlayStyle={{ cursor: 'pointer' }}
                    overlay={
                        <Menu>
                            <Menu.Item onClick={() => hanldeEdit(projectItem)}>编辑项目</Menu.Item>
                            <Menu.Item onClick={() => setDeleteVisible(true)}><i className={styles.menu_font_color}>删除项目</i></Menu.Item>
                        </Menu>
                    }
                >
                    <MoreOutlined style={{ cursor: 'pointer', position: 'absolute', right: 55, top: 21 }} />
                </Dropdown>
                <div className={styles.content_warpper}>
                    <Space className={styles.title_detail_items}>
                        <Typography.Text className={styles.product_right_name}>项目名称：</Typography.Text>
                        <EllipsisPulic title={projectItem.name} width={540} />
                    </Space>
                    <Space className={styles.title_detail_items}>
                        <Typography.Text className={styles.product_right_name}>产品版本：</Typography.Text>
                        <EllipsisPulic title={projectItem.product_version} width={540} />
                    </Space>
                    <Space className={styles.title_detail_items}>
                        <Typography.Text className={styles.product_right_name}>项目描述：</Typography.Text>
                        <EllipsisPulic title={projectItem.description} width={540} />
                    </Space>
                </div>

                <div style={{ height: 10, backgroundColor: '#f5f5f5' }}></div>
                <div className={styles.content_warpper}>
                    <Row style={{ height: 60, lineHeight: '60px' }}>
                        <Col span={19} style={{ color: '#000', fontWeight: 'bold' }}>
                            代码管理
                        </Col>
                        <Col span={5} style={{ textAlign: 'right' }}>
                            <Button type="primary" onClick={() => hanldeCodeModal(projectItem)}>添加代码</Button>
                        </Col>
                    </Row>
                    <Table
                        size="small"
                        rowKey="id"
                        loading={loading}
                        columns={columns}
                        dataSource={data.data}
                        pagination={false}
                    />
                </div>
                {
                    projectItem.is_default ?
                        <Modal
                            title="删除提示"
                            cancelText="取消"
                            //okType="danger"
                            className={styles.modalChange}
                            okText="删除"
                            okButtonProps={{ disabled: true }}
                            getContainer={false}
                            visible={deleteVisible}
                            onOk={() => handleOk()}
                            onCancel={() => setDeleteVisible(false)}
                            width={390}
                            centered={true}
                            maskClosable={false}
                        >
                            <p>不可删除默认项目，请切换默认项目后删除？</p>
                        </Modal>
                        : <Modal
                            title="删除提示"
                            cancelText="取消"
                            className={styles.modalChange}
                            okType="danger"
                            okText="删除"
                            getContainer={false}
                            visible={deleteVisible}
                            onOk={() => handleOk()}
                            onCancel={() => setDeleteVisible(false)}
                            width={390}
                            centered={true}
                            maskClosable={false}
                        >
                            <p>你确定要删除【{projectItem.name}】项目吗？</p>
                        </Modal>
                }
                <UpdateProjectModal ref={projectModal} onOk={hanldeSubmit} />
                <AddCodeModal ref={addCodeModal} /* current={current} */ onOk={handleRefresh} />
            </Drawer>
        )
    }
)