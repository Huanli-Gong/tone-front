import React, { forwardRef, useImperativeHandle, useState, useEffect } from 'react'
import { Modal, Spin, Row, Col, Space, Avatar, Popconfirm, Button, Popover, message } from 'antd'
import { workspaceRemove, info, authPersonal } from '@/pages/SystemConf/WorkspaceManagement/service';

import AvatarCover from '@/components/AvatarCover'
import { history } from 'umi'
import { enterWorkspaceHistroy } from '@/services/Workspace'
import styles from './style.less';

import { ReactComponent as PublicIcon } from '@/assets/svg/public.svg'
import { ReactComponent as UnPublicIcon } from '@/assets/svg/no_public.svg'
import { jumpWorkspace } from '@/utils/utils';

const DetailModal: React.ForwardRefRenderFunction<any, any> = (props, ref) => {
    const { refresh } = props

    const [visible, setVisible] = useState(false)
    const [show, setShow] = useState<boolean>(false)
    const [authData, setAuthData] = useState<any>(null);
    const [source, setSource] = useState<any>({})
    const [ws_id, setWs] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    useImperativeHandle(ref, () => ({
        async show(ws_id: string) {
            setWs(ws_id)
            setVisible(true)
        }
    }), [])

    const queryUserWsAccess = async () => {
        const { data, code } = await authPersonal({ ws_id })
        code === 200 && setAuthData(data)
    }

    const queryWsInto = async () => {
        const { code, data } = await info(ws_id)
        code === 200 && setSource(data)
    }

    const init = async () => {
        setLoading(true)
        await queryWsInto()
        await queryUserWsAccess()
        setLoading(false)
    }

    useEffect(() => {
        ws_id && init()
    }, [ws_id])

    const toWS = async () => {
        await enterWorkspaceHistroy({ ws_id, system_entry: true })
        // history.push(`/ws/${ws_id}/dashboard`)
        ws_id && history.push(jumpWorkspace(ws_id))
    }

    const confirm = async () => {
        await workspaceRemove({ id: ws_id })
        message.success('操作成功');
        handleCancel()
        refresh()
    }

    const showConfirm = () => setShow(true)
    const cancel = () => setShow(false)

    const handleOk = () => setVisible(false);

    const handleCancel = () => {
        setVisible(false)
        setAuthData(null)
        setSource(null)
        setLoading(true)
        setShow(false)
        setWs(null)
    };

    const judge = () => {
        if (!authData) return
        const { sys_role_title, role_title } = authData
        if (source?.is_public || authData && (['super_admin', 'sys_admin'].includes(sys_role_title) || role_title))
            return <span className={styles.link} onClick={toWS} >进入</span>
        return <span className={styles.link} style={{ display: 'none' }} onClick={toWS} >进入</span>
    }

    const Footer: React.FC = () => (
        !show ?
            <Popover
                title={null}
                placement="topRight"
                content={
                    <span onClick={showConfirm} >注销workspace</span>
                }
            >
                <Button type="text" style={{ padding: '0 10px', border: 'none' }} >...</Button>
            </Popover> :
            <Popconfirm
                title="确定要注销该workspace吗？注销后数据删除，成员解散。请慎重考虑"
                placement="topRight"
                defaultVisible={true}
                overlayStyle={{ width: 312 }}
                onConfirm={confirm}
                onCancel={cancel}
                okText="确定"
                cancelText="取消"
            >
                <Button type="text" style={{ padding: '0 10px', border: 'none' }} >...</Button>
            </Popconfirm>
    )

    return (
        <Modal
            title="Workspace详情"
            visible={visible}
            onOk={handleOk}
            onCancel={handleCancel}
            width='53.3%'
            centered
            destroyOnClose
            footer={
                !source?.is_common && <Footer />
            }
            maskClosable={false}
        >
            <Spin spinning={loading} >
                <Row gutter={12}>
                    <Col className={styles.title} span={4}>
                        封面
                    </Col>
                    <Col className={styles.content} span={20}>
                        <AvatarCover size="large" {...source} />
                    </Col>
                </Row>
                <Row gutter={12}>
                    <Col className={styles.title} span={4}>
                        名称
                    </Col>
                    <Col className={styles.company} span={20}>
                        {/* <span onClick={toWS} style={{ cursor: 'pointer' }}>{source?.show_name}</span> */}
                        <span style={{ cursor: 'pointer' }}>{source?.show_name}</span>
                        {judge()}
                    </Col>
                </Row>
                <Row gutter={12}>
                    <Col className={styles.title} span={4}>
                        简介
                    </Col>
                    <Col className={styles.content} span={20}>
                        {source?.description}
                    </Col>
                </Row>
                <Row gutter={12}>
                    <Col className={styles.title} span={4}>
                        申请理由
                    </Col>
                    <Col className={styles.content} span={20}>
                        {source?.apply_reason || '无'}
                    </Col>
                </Row>
                <Row gutter={12}>
                    <Col className={styles.title} span={4}>
                        权限
                    </Col>
                    <Col className={styles.content} span={20}>
                        {source?.is_public ?
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
                                <Avatar size={25} src={source?.owner_avatar} />
                                <span>{source?.owner_name}</span>
                            </Space>
                        </div>
                        <div className={styles.department} >
                            {source?.proposer_dep}
                        </div>
                    </Col>
                </Row>
                <Row gutter={12}>
                    <Col className={styles.title} span={4} style={{ paddingBottom: 0 }} >
                        创建时间
                    </Col>
                    <Col className={styles.content} span={20} style={{ paddingBottom: 0 }} >
                        {source?.gmt_created}
                    </Col>
                </Row>
            </Spin>
        </Modal>
    )
}

export default forwardRef(DetailModal)