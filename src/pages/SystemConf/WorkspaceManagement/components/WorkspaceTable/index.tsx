import React, { useState, useEffect, useImperativeHandle } from 'react';
import styles from './style.less';
import { WorkspaceTable, WorkspaceList, TableListParams } from '../../data.d';
import { Modal, Row, Col, Avatar, Space, Button, Popover, Popconfirm, message, Spin } from 'antd';
import { workspaceList, workspaceRemove, info, authPersonal } from '../../service';
import { workspaceHistroy } from '@/services/Workspace'
import CommonTable from '@/components/Public/CommonTable';
import { history } from 'umi'
import PopoverEllipsis from '@/components/Public/PopoverEllipsis';
import { ReactComponent as PublicIcon } from '@/assets/svg/public.svg'
import { ReactComponent as UnPublicIcon } from '@/assets/svg/no_public.svg'
import AvatarCover from '@/components/AvatarCover'

const UserTable: React.FC<WorkspaceList> = ({ is_public, onRef }) => {
    const [keyword, setKeyword] = useState<string>('')
    const [visible, setVisible] = useState<boolean>(false);
    const [show, setShow] = useState<boolean>(false)
    const initialData = {
        apply_reason: '',
        creator_name: '',
        creator: 0,
        description: '',
        gmt_created: '',
        gmt_modified: '',
        id: 0,
        is_approved: true,
        is_public: true,
        logo: '',
        member_count: 0,
        name: '',
        owner: 0,
        owner_name: '',
        owner_avatar: '',
        show_name: '',
        status: '',
        proposer_dep: '',
        creator_avatar: ''
    };

    const [modal, setModal] = useState<WorkspaceTable>(initialData);
    const [data, setData] = useState<any>({});
    const [authData, setAuthData] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [modalLoading, setModalLoading] = useState(true);
    const [page, setPage] = useState<number>(1);
    const [size, setSize] = useState<number>(10);
    const initParams = { page_num: 1, page_size: 10, is_approved: 1, is_public: is_public }
    const getList = async (initParams: TableListParams) => {
        setLoading(true)
        const data = await workspaceList(initParams)
        setData(data)
        setLoading(false)
    };

    useEffect(() => {
        getList(initParams)
    }, []);

    const onChange = (page_num: any, page_size: any) => {
        const initParams = { page_num: page_num, page_size: page_size, is_approved: 1, is_public: is_public, keyword: keyword }
        getList(initParams)
        setPage(page_num)
        setSize(page_size)
    }

    const handleOk = () => {
        setVisible(false)
    };

    const handleCancel = () => {
        setVisible(false)
    };

    const ellipsisText = (name: string) => {
        return name.slice(0, 1)
    }

    const refresh = () => {
        let params = { page_num: page, page_size: size, is_approved: 1, is_public: is_public, keyword: keyword }
        getList(params)
    }

    useImperativeHandle(onRef, () => ({
        search: (keyword: string) => {
            getList({ ...initParams, ...{ page_size: size, keyword: keyword } })
            setKeyword(keyword)
        },
        handleTab: refresh
    }));

    const getInfo = async (id: number) => {
        setVisible(true)
        setModalLoading(true)
        const data = await info(id)
        const authData = await authPersonal({ ws_id: id })
        if (authData.code === 200) {
            setAuthData(authData.data)
        }
        data && setModal(data.data)
        setModalLoading(false)
    }

    const columns: any[] = [{
        title: '封面',
        dataIndex: 'logo',
        className: 'row_cursor',
        width: 70,
        render: (_: number, row: WorkspaceTable) => <AvatarCover size="small" {...row} />,
        // <img className={styles.img} src={row.logo}  />,
    }, {
        title: '名称',
        dataIndex: 'show_name',
        className: 'row_cursor',
        width: 85,
        render: (_: number, row: WorkspaceTable) => <PopoverEllipsis title={row.show_name || ''}></PopoverEllipsis>,
    }, {
        title: '所有者',
        dataIndex: 'owner_name',
        className: 'row_cursor',
        width: 124,
        render: (_: number, row: WorkspaceTable) => <Space style={{ width: '124px' }}><Avatar size={25} src={row.owner_avatar} alt={row.owner_name} /><span>{row.owner_name}</span></Space>,
    }, {
        title: '简介',
        dataIndex: 'description',
        className: 'row_cursor',
        ellipsis: true,
        width: 210,
        render: (_: number, row: WorkspaceTable) => <PopoverEllipsis title={row.description || ''}></PopoverEllipsis>,
    }, {
        title: '人数',
        dataIndex: 'member_count',
        className: 'row_cursor',
        width: 85,
    }, {
        title: '是否公开',
        dataIndex: 'is_public',
        className: 'row_cursor',
        width: 106,
        render: (_: number, row: WorkspaceTable) =>
            <div>{row.is_public ?
                <div className={styles.bar}>
                    <PublicIcon />
                    <span style={{ paddingLeft: '6px' }}>公开</span>
                </div> :
                <div className={styles.bar}>
                    <UnPublicIcon />
                    <span style={{ paddingLeft: '6px' }}>私密</span>
                </div>
            }
            </div>
    }]

    const list: WorkspaceTable[] = data.data;

    const showConfirm = () => {
        setShow(true)
    }

    const toWS = async () => {
        await workspaceHistroy({ ws_id: modal.id, system_entry: true })
        history.push(`/ws/${modal.id}/dashboard`)
    }

    const confirm = async () => {
        setShow(false)
        setVisible(false)
        await workspaceRemove({ id: modal.id })
        message.success('操作成功');
        refresh()
    }

    const cancel = (e: any) => {
        setShow(false)
    }
    const judge = () => {
        if (modal.is_public) {
            return <span className={styles.link} onClick={toWS} >进入</span>
        } else {
            if (JSON.stringify(authData) !== '{}') {
                if (authData.sys_role_title === 'super_admin' || authData.sys_role_title === 'sys_admin' || authData.role_title !== '') {
                    return <span className={styles.link} onClick={toWS} >进入</span>
                } else {
                    return <span className={styles.link} style={{ display: 'none' }} onClick={toWS} >进入</span>
                }
            } else {
                return <span className={styles.link} style={{ display: 'none' }} onClick={toWS} >进入</span>
            }
        }

    }
    const Content = <span onClick={showConfirm} >注销workspace</span>

    const Footer = (
        !show ?
            <Popover
                title={null}
                placement="topRight"
                content={Content}
            >
                <Button type="text" style={{ padding: '0 10px', border: 'none' }} >...</Button>
            </Popover> :
            <Popconfirm
                title="确定要注销该workspace吗？注销后数据删除，成员解散。请慎重考虑"
                placement="topRight"
                defaultVisible={true}
                overlayStyle={{ width: '312px' }}
                onConfirm={confirm}
                onCancel={cancel}
                okText="确定"
                cancelText="取消"
            >
                <Button type="text" style={{ padding: '0 10px', border: 'none' }} >...</Button>
            </Popconfirm>
    )

    return (
        <div>
            <Modal
                title="Workspace详情"
                visible={visible}
                onOk={handleOk}
                onCancel={handleCancel}
                width='53.3%'
                centered
                footer={modal && modal.is_common ? '' : Footer}
                maskClosable={false}
            >
                <Spin spinning={modalLoading} >
                    <Row gutter={12}>
                        <Col className={styles.title} span={4}>
                            封面
                        </Col>
                        <Col className={styles.content} span={20}>
                            <AvatarCover size="large" {...modal} />
                        </Col>
                    </Row>
                    <Row gutter={12}>
                        <Col className={styles.title} span={4}>
                            名称
                        </Col>
                        <Col className={styles.company} span={20}>
                            {/* <span onClick={toWS} style={{ cursor: 'pointer' }}>{modal.show_name}</span> */}
                            <span style={{ cursor: 'pointer' }}>{modal.show_name}</span>
                            {judge()}
                        </Col>
                    </Row>
                    <Row gutter={12}>
                        <Col className={styles.title} span={4}>
                            简介
                        </Col>
                        <Col className={styles.content} span={20}>
                            {modal.description}
                        </Col>
                    </Row>
                    <Row gutter={12}>
                        <Col className={styles.title} span={4}>
                            申请理由
                        </Col>
                        <Col className={styles.content} span={20}>
                            {modal.apply_reason || '无'}
                        </Col>
                    </Row>
                    <Row gutter={12}>
                        <Col className={styles.title} span={4}>
                            权限
                        </Col>
                        <Col className={styles.content} span={20}>
                            {modal.is_public ?
                                <div className={styles.bar}>
                                    <PublicIcon />
                                    <span style={{ paddingLeft: '6px' }}>公开</span>
                                </div> :
                                <div className={styles.bar}>
                                    <UnPublicIcon />
                                    <span style={{ paddingLeft: '6px' }}>私密</span>
                                </div>
                            }
                        </Col>
                    </Row>
                    <Row gutter={12}>
                        <Col className={styles.title} span={4}>
                            申请人
                        </Col>
                        <Col className={styles.content} span={20}>
                            <div>
                                <Space>
                                    <Avatar size={25} src={modal.owner_avatar} />
                                    <span>{modal.owner_name}</span>
                                </Space>
                            </div>
                            <div className={styles.department} >
                                {modal.proposer_dep}
                            </div>
                        </Col>
                    </Row>
                    <Row gutter={12}>
                        <Col className={styles.title} span={4} style={{ paddingBottom: 0 }} >
                            创建时间
                        </Col>
                        <Col className={styles.content} span={20} style={{ paddingBottom: 0 }} >
                            {modal.gmt_created}
                        </Col>
                    </Row>
                </Spin>
            </Modal>
            <CommonTable
                size="small"
                columns={columns}
                list={list}
                loading={loading}
                page={data.page_num}
                pageSize={data.page_size}
                totalPage={data.total_page}
                total={data.total}
                handlePage={onChange}
                onRow={(record: any) => getInfo(record.id)}
            />
        </div>
    );

};

export default UserTable;