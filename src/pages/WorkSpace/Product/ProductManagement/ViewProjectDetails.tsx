import React, { forwardRef, useState, useImperativeHandle, useRef, useEffect } from 'react';
import { useRequest, useParams, useIntl, FormattedMessage, getLocale  } from 'umi'
import { isUndefined } from 'lodash'
import { Drawer, Space, Typography, Table, Button, message, Popconfirm, Row, Col, Dropdown, Menu, Modal } from 'antd';
import { CheckCircleOutlined, CheckCircleFilled, MoreOutlined } from '@ant-design/icons'
import { deleteProject, updateBranchAndRelation, queryProjectBranch, deleteBranchAndRelation } from '../services'
import { QusetionIconTootip } from '@/components/Product/index'
import UpdateProjectModal from './UpdateProject'
import EllipsisPopover from '@/components/Public/EllipsisPopover'
import EllipsisPulic from '@/components/Public/EllipsisPulic';
import AddCodeModal from './NewCodeModal'
import { requestCodeMessage } from '@/utils/utils';
import styles from './index.less'
export default forwardRef(
    (props: any, ref: any) => {
        const { formatMessage } = useIntl()
        const enLocale = getLocale() === 'en-US'

        const { ws_id } = useParams<any>()
        // const ws_id = window.location.pathname.replace(/\/ws\/([a-zA-Z0-9]{8})\/.*/, '$1')
        const [visible, setVisible] = useState(false)
        const [title, setTitle] = useState('detail')
        const [projectItem, setProject] = useState<any>({})
        const projectModal: any = useRef(null)
        const addCodeModal: any = useRef(null)
        const [deleteVisible, setDeleteVisible] = useState(false);

        useImperativeHandle(
            ref,
            () => ({
                show: (title: string, data: any = {}) => {
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
                message.success(formatMessage({id: 'operation.success'}) )
            }
            else
                requestCodeMessage(ret.code, ret.msg)
        }
        const handleDelete = async (_: any) => {
            const { code, msg } = await deleteBranchAndRelation({ relation_id: _.id })
            if (code === 200) {
                refresh()
                message.success(formatMessage({id: 'operation.success'}) )
            }
            else {
                requestCodeMessage(code, msg)
            }
        }

        const columns = [{
            title: <EllipsisPopover title={formatMessage({id: "product.repositories"})} placement={'top'} />,
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
            title: <QusetionIconTootip title={formatMessage({id: 'product.is_master'})} desc={formatMessage({id: 'product.is_master.desc'})} />,
            width: enLocale? 160: 90,
            dataIndex: 'is_master',
            render: (_: any, data: any) => (
                data.is_master ? <CheckCircleFilled style={{ width: 17.5, height: 17.5, color: '#1890ff' }} /> : <CheckCircleOutlined style={{ cursor: 'pointer', width: 17.5, height: 17.5, color: 'rgba(0,0,0,.1)' }} onClick={() => handleSetDefault(_, data)} />
            )

        },
        {
            title: <FormattedMessage id="Table.columns.operation"/>,
            width: enLocale? 100: 80,
            render: (_: any) => (
                <div>
                    {
                        _.is_master
                            ? <Space>
                                <Popconfirm
                                    title={<FormattedMessage id="product.is_master.cannot.be.deleted"/>}
                                    placement="bottomLeft"
                                    cancelText={<FormattedMessage id="operation.cancel"/>}
                                    okText={<FormattedMessage id="operation.delete"/>}
                                    okType="default"
                                    okButtonProps={{
                                        disabled: true,
                                    }}
                                >
                                    <Typography.Text
                                        style={{ color: '#1890FF', cursor: 'pointer' }}
                                    >
                                        <FormattedMessage id="operation.delete"/>
                                    </Typography.Text>
                                </Popconfirm>
                            </Space>
                            : 
                            <Space>
                                <Popconfirm
                                    title={<FormattedMessage id="delete.prompt"/>}
                                    onConfirm={() => handleDelete(_)}
                                    placement="bottomLeft"
                                    cancelText={<FormattedMessage id="operation.cancel"/>}
                                    okText={<FormattedMessage id="operation.confirm"/>}
                                >
                                    <Typography.Text
                                        style={{ color: '#1890FF', cursor: 'pointer' }}
                                    >
                                        <FormattedMessage id="operation.delete"/>
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
                    message.success(formatMessage({id: 'request.delete.success'}) );
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
                title={title ==='detail'? <FormattedMessage id="product.detail.product"/>: title}
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
                            <Menu.Item onClick={() => hanldeEdit(projectItem)}><FormattedMessage id="product.edit.project"/></Menu.Item>
                            <Menu.Item onClick={() => setDeleteVisible(true)}><i className={styles.menu_font_color}><FormattedMessage id="product.delete.project"/></i></Menu.Item>
                        </Menu>
                    }
                >
                    <MoreOutlined style={{ cursor: 'pointer', position: 'absolute', right: 55, top: 21 }} />
                </Dropdown>
                <div className={styles.content_warpper}>
                    <Space className={styles.title_detail_items}>
                        <Typography.Text className={styles.product_right_name}><FormattedMessage id="product.project.name"/>：</Typography.Text>
                        <EllipsisPulic title={projectItem.name} width={450} />
                    </Space>
                    <Space className={styles.title_detail_items}>
                        <Typography.Text className={styles.product_right_name}><FormattedMessage id="product.version"/>：</Typography.Text>
                        <EllipsisPulic title={projectItem.product_version} width={450} />
                    </Space>
                    <Space className={styles.title_detail_items}>
                        <Typography.Text className={styles.product_right_name}><FormattedMessage id="product.project.desc"/>：</Typography.Text>
                        <EllipsisPulic title={projectItem.description} width={500} />
                    </Space>
                    <Space className={styles.title_detail_items}>
                        <Typography.Text className={styles.product_right_name}><FormattedMessage id="product.dashboard.count"/>：</Typography.Text>
                        <EllipsisPulic title={projectItem.is_show == 1 ? formatMessage({id: "operation.yes"}): formatMessage({id: "operation.no"}) }/>
                    </Space>
                </div>

                <div style={{ height: 10, backgroundColor: '#f5f5f5' }}></div>
                <div className={styles.content_warpper}>
                    <Row style={{ height: 60, lineHeight: '60px' }}>
                        <Col span={19} style={{ color: '#000', fontWeight: 'bold' }}>
                            <FormattedMessage id="code.manage"/>
                        </Col>
                        <Col span={5} style={{ textAlign: 'right' }}>
                            <Button type="primary" onClick={() => hanldeCodeModal(projectItem)}>
                                <FormattedMessage id="code.add.code"/>
                            </Button>
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
                            title={<FormattedMessage id="delete.tips"/>}
                            cancelText={<FormattedMessage id="operation.cancel"/>}
                            //okType="danger"
                            className={styles.modalChange}
                            okText={<FormattedMessage id="operation.delete"/>}
                            okButtonProps={{ disabled: true }}
                            getContainer={false}
                            visible={deleteVisible}
                            onOk={() => handleOk()}
                            onCancel={() => setDeleteVisible(false)}
                            width={390}
                            centered={true}
                            maskClosable={false}
                        >
                            <p><FormattedMessage id="product.the.default.item.cannot.be.deleted"/></p>
                        </Modal>
                        : 
                        <Modal
                            title={<FormattedMessage id="delete.tips"/>}
                            cancelText={<FormattedMessage id="operation.cancel"/>}
                            className={styles.modalChange}
                            okType="danger"
                            okText={<FormattedMessage id="operation.delete"/>}
                            getContainer={false}
                            visible={deleteVisible}
                            onOk={() => handleOk()}
                            onCancel={() => setDeleteVisible(false)}
                            width={390}
                            centered={true}
                            maskClosable={false}
                        >
                            <p>{formatMessage({id: "product.are.you.sure.you.delete.project"}, {data: projectItem.name})}</p>
                        </Modal>
                }
                <UpdateProjectModal ref={projectModal} onOk={hanldeSubmit} setVisible={setVisible}/>
                <AddCodeModal ref={addCodeModal} onOk={handleRefresh} />
            </Drawer>
        )
    }
)