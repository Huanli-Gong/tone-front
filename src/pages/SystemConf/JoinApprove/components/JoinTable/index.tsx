import React, { useState, useEffect, useImperativeHandle, useRef } from 'react';
import { UserTable, TableListParams, ApproveParams, UserList } from '../../data';
import { Modal, Row, Col, Avatar, Space, Button, message, Spin, Badge } from 'antd';
import { joinList, approve, info } from '../../service';
import styles from './style.less';
import CommonTable from '@/components/Public/CommonTable';
import { FormattedMessage } from 'umi';
import { ReactComponent as PublicIcon } from '@/assets/svg/public.svg'
import { ReactComponent as UnPublicIcon } from '@/assets/svg/no_public.svg'
import { ReactComponent as WScancel } from '@/assets/svg/ws_cancel.svg'
import { ReactComponent as WScreate } from '@/assets/svg/ws_create.svg'
import PopoverEllipsis from '@/components/Public/PopoverEllipsis';
import AvatarCover from '@/components/AvatarCover'

import RefusePopover from './RefusePopover'
import { requestCodeMessage } from '@/utils/utils';

const JoinTable: React.FC<UserList> = ({ status, onRef, getNum }) => {
    const [data, setData] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [modalLoading, setModalLoading] = useState(true);
    const [page, setPage] = useState<number>(1);
    const [size, setSize] = useState<number>(10);
    const [visible, setVisible] = useState<boolean>(false);

    const refusePop: any = useRef(null)
    const initialState = {
        id: null,
        object_type: '',
        action: '',
        approver: '',
        approver_name: '',
        description: '',
        gmt_created: '',
        gmt_modified: '',
        object_id: 1,
        proposer: 1,
        proposer_avatar: '',
        proposer_dep: '',
        proposer_name: '',
        reason: '',
        status: '',
        title: '',
        is_public: true,
        ws_logo: '',
    };
    const [modal, setModal] = useState<any>(initialState);

    const handleCancel = () => {
        setVisible(false)
    };
    const getList = async (initParams: TableListParams) => {
        setLoading(true)
        setData([])
        const data = await joinList(initParams)
        setData(data)
        setLoading(false)
    };

    const initParams = { page_num: 1, page_size: 10, status: status }

    useEffect(() => {
        getList(initParams)
    }, [status]);

    const onChange = (page_num: any, page_size: any) => {
        const initParams = { page_num: page_num, page_size: page_size, status: status }
        getList(initParams)
        setPage(page_num)
        setSize(page_size)
    }

    const refresh = () => {
        let params = { page_num: page, page_size: size, status: status }
        getList(params)
    }

    useImperativeHandle(onRef, () => ({
        handleTab: refresh
    }));

    const [actionLoading, setActionLoading] = useState(false)

    const getInfo = async (row: UserTable) => {
        setVisible(true)
        setModalLoading(true)
        const data = await info(row.id)
        data && setModal(data.data)
        setModalLoading(false)
    }

    const check = async (action: string, reason?: string) => {
        if (actionLoading) return
        setActionLoading(true)
        const params: ApproveParams = {
            action: action,
            id: modal.id,
            reason: action == 'refuse' ? reason : undefined,
        }
        const data = await approve(params)
        refusePop.current.hide()
        if (data.code !== 200) {
            requestCodeMessage( data.code , data.msg )
            setActionLoading(false)
            return
        }
        setActionLoading(false)
        setVisible(false)
        await getNum()
        await refresh()
        message.success('操作成功');
    }
    const ellipsisText = (name: string) => {
        return name.slice(0, 1)
    }
    let columns: any[] = [{
        title: <FormattedMessage id={"JoinApprove.table.category"} />,
        dataIndex: 'name',
        width: 120,
        ellipsis: true,
        render: (_: number, row: UserTable) => <div style={{ display: 'flex', alignItems: 'center' }}>
            {row.object_type == 'workspace' && row.action == 'create' ?
                <>
                    <WScreate style={{ float: 'left', marginRight: '5px', height: 20 }} />
                    <PopoverEllipsis title={row.title}></PopoverEllipsis>
                </> :
                <>
                    <WScancel style={{ float: 'left', marginRight: '5px', height: 20 }} />
                    <PopoverEllipsis title={row.title}></PopoverEllipsis>
                </>
            }
        </div>,
    }, {
        title: <FormattedMessage id={"JoinApprove.table.applicant"} />,
        dataIndex: 'name',
        width: 150,
        ellipsis: true,
        render: (_: number, row: UserTable) => <Space><Avatar size={25} src={row.proposer_avatar} />{row.proposer_name}</Space>,
    }, {
        title: <FormattedMessage id={"JoinApprove.table.reason"} />,
        dataIndex: 'reason',
        width: 200,
        ellipsis: true,
        render: (_: number, row: UserTable) => <PopoverEllipsis title={row.reason}></PopoverEllipsis>,
    }, {
        title: <FormattedMessage id={"JoinApprove.table.start"} />,
        dataIndex: 'gmt_created',
        width: 150,
    }];

    columns = status == 1 ? [...columns, ...[{
        title: <FormattedMessage id={"JoinApprove.table.end"} />,
        dataIndex: 'gmt_modified',
        width: 150
    }, {
        title: <FormattedMessage id={"JoinApprove.table.result"} />,
        render: (_: number, row: UserTable) => <Space>
            {row.status == 'passed' && row.action == 'create' && <Badge status="success" text='通过创建' />}
            {row.status != 'passed' && row.action == 'create' && <Badge status="default" text='拒绝创建' />}
            {row.status == 'passed' && row.action == 'delete' && <Badge status="success" text='通过注销' />}
            {row.status != 'passed' && row.action == 'delete' && <Badge status="default" text='拒绝注销' />}
            <Button style={{ padding: 0, height: 'auto' }} type="link" onClick={() => getInfo(row)} >详情</Button>
        </Space>,
        width: 150
    }]] :

        [...columns, ...[{
            title: <FormattedMessage id={"JoinApprove.table.operation"} />,
            width: 120,
            render: (_: number, row: UserTable) => <Space>
                {/* <Button style={{padding:0, height: 'auto'}} onClick={()=>check('pass',row.id)} type="link" >通过</Button>
                                                                <Button style={{padding:0, height: 'auto'}} onClick={()=>check('refuse',row.id)} type="link" >拒绝</Button> */}
                <Button style={{ padding: 0, height: 'auto' }} type="link" onClick={() => getInfo(row)} >详情</Button>
            </Space>

        }]]

    const list: UserTable[] = data.data;

    const Footer = status == 0 ?
        <Space>
            <RefusePopover ref={refusePop} onOk={(data: any) => check('refuse', data)} />
            <Button loading={actionLoading} onClick={() => check('pass')} type="primary" >通过</Button>
        </Space> :
        null

    console.log( modal )

    return (
        <div>
            <Modal
                title="Workspace详情"
                visible={visible}
                width='53.3%'
                centered
                onCancel={handleCancel}
                footer={Footer}
                maskClosable={false}
            >
                <Spin spinning={modalLoading}>

                    <Row gutter={12}>
                        <Col className={styles.title} span={4}>
                            封面
                        </Col>
                        <Col className={styles.content} span={20}>
                            <AvatarCover {...{ ...modal , show_name : modal.title , logo : modal.ws_logo }} size="large" />
                        </Col>
                    </Row>
                    <Row gutter={12}>
                        <Col className={styles.title} span={4}>
                            名称
                        </Col>
                        <Col className={styles.company} span={20}>
                            {modal.title}
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
                            {modal.reason || '无'}
                        </Col>
                    </Row>
                    <Row gutter={12}>
                        <Col className={styles.title} span={4}>
                            权限
                        </Col>
                        <Col className={styles.content} span={20}>
                            {modal.is_public ?
                                <div>
                                    <PublicIcon />
                                    <span style={{ paddingLeft: '6px' }}>公开</span>
                                </div> :
                                <div>
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
                                    <Avatar size={25} src={modal.proposer_avatar} />
                                    <span>{modal.proposer_name}</span>
                                </Space>
                            </div>
                            <div className={styles.department} >
                                {modal.proposer_dep}
                            </div>
                        </Col>
                    </Row>
                    <Row gutter={12}>
                        <Col className={styles.title} span={4}>
                            申请类别
                        </Col>
                        <Col className={styles.content} span={20}>
                            {modal.object_type == 'workspace' && modal.action == 'create' ?
                                <span>
                                    <WScreate style={{ float: 'left', marginRight: '5px', height: 20 }} />
                                Workspace创建
                            </span> :
                                <span>
                                    <WScancel style={{ float: 'left', marginRight: '5px', height: 20 }} />
                                Workspace注销
                            </span>
                            }
                        </Col>
                    </Row>
                    <Row gutter={12}>
                        <Col className={styles.title} span={4}>
                            申请时间
                        </Col>
                        <Col className={styles.content} span={20}>
                            {modal.gmt_created}
                        </Col>
                    </Row>
                    {status == 1 &&
                        <Row gutter={12}>
                            <Col className={styles.title} span={4}>
                                审批结果
                        </Col>
                            <Col className={styles.content} span={20}>
                                {modal.status == 'passed' && modal.action == 'create' && <Badge status="success" text='通过创建' />}
                                {modal.status != 'passed' && modal.action == 'create' && <Badge status="default" text='拒绝创建' />}
                                {modal.status == 'passed' && modal.action == 'delete' && <Badge status="success" text='通过注销' />}
                                {modal.status != 'passed' && modal.action == 'delete' && <Badge status="default" text='拒绝注销' />}
                            </Col>
                        </Row>
                    }
                    {status == 1 &&
                        <Row gutter={12}>
                            <Col className={styles.title} span={4} style={{ paddingBottom: 0 }}>
                                审批时间
                        </Col>
                            <Col className={styles.content} span={20} style={{ paddingBottom: 0 }}>
                                {modal.gmt_modified}
                            </Col>
                        </Row>
                    }
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
            />
        </div>
    );

};

export default JoinTable;