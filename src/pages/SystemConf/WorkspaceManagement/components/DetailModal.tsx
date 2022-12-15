import React, { forwardRef, useImperativeHandle, useState, useEffect } from 'react'
import { Modal, Spin, Row, Col, Space, Avatar, Popconfirm, Button, Popover, message } from 'antd'
import { workspaceRemove, info } from '@/pages/SystemConf/WorkspaceManagement/service';

import AvatarCover from '@/components/AvatarCover'
import { history, useAccess, useIntl, FormattedMessage } from 'umi'
import styles from './style.less';

import { ReactComponent as PublicIcon } from '@/assets/svg/public.svg'
import { ReactComponent as UnPublicIcon } from '@/assets/svg/no_public.svg'
import { jumpWorkspace } from '@/utils/utils';

const DetailModal: React.ForwardRefRenderFunction<any, any> = (props, ref) => {
    const { formatMessage } = useIntl()
    const { refresh } = props
    const access = useAccess();
    const [visible, setVisible] = useState(false)
    const [show, setShow] = useState<boolean>(false)
    const [source, setSource] = useState<any>({})
    const [ws_id, setWs] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    useImperativeHandle(ref, () => ({
        async show(ws_id: string) {
            setWs(ws_id)
            setVisible(true)
        }
    }), [])

    const queryWsInto = async () => {
        const { code, data } = await info(ws_id)
        code === 200 && setSource(data)
    }

    const init = async () => {
        setLoading(true)
        await queryWsInto()
        setLoading(false)
    }

    useEffect(() => {
        ws_id && init()
    }, [ws_id])

    const toWS = async () => {
        ws_id && history.push(jumpWorkspace(ws_id))
    }

    const confirm = async () => {
        await workspaceRemove({ id: ws_id })
        message.success(formatMessage({ id: 'operation.success' }));
        handleCancel()
        refresh()
    }

    const showConfirm = () => setShow(true)
    const cancel = () => setShow(false)

    const handleOk = () => setVisible(false);

    const handleCancel = () => {
        setVisible(false)
        setSource(null)
        setLoading(true)
        setShow(false)
        setWs(null)
    };

    const judge = () => {
        if (source?.is_public || access.IsAdmin())
            return <span className={styles.link} onClick={toWS}><FormattedMessage id="workspace.enter" /></span>
        return <span className={styles.link} style={{ display: 'none' }} onClick={toWS}><FormattedMessage id="workspace.enter" /></span>
    }

    const Footer: React.FC = () => (
        !show ?
            <Popover
                title={null}
                placement="topRight"
                content={
                    <span onClick={showConfirm}><FormattedMessage id="workspace.ws.log.out" /></span>
                }
            >
                <Button type="text" style={{ padding: '0 10px', border: 'none' }} >...</Button>
            </Popover> :
            <Popconfirm
                title={<FormattedMessage id="workspace.Popconfirm.title" />}
                placement="topRight"
                defaultVisible={true}
                overlayStyle={{ width: 312 }}
                onConfirm={confirm}
                onCancel={cancel}
                okText={<FormattedMessage id="operation.ok" />}
                cancelText={<FormattedMessage id="operation.cancel" />}
            >
                <Button type="text" style={{ padding: '0 10px', border: 'none' }} >...</Button>
            </Popconfirm>
    )

    return (
        <Modal
            title={<FormattedMessage id="workspace.ws.details" />}
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
                        <FormattedMessage id="workspace.cover" />
                    </Col>
                    <Col className={styles.content} span={20}>
                        <AvatarCover size="large" {...source} />
                    </Col>
                </Row>
                <Row gutter={12}>
                    <Col className={styles.title} span={4}>
                        <FormattedMessage id="workspace.show_name" />
                    </Col>
                    <Col className={styles.company} span={20}>
                        {/* <span onClick={toWS} style={{ cursor: 'pointer' }}>{source?.show_name}</span> */}
                        <span style={{ cursor: 'pointer' }}>{source?.show_name}</span>
                        {judge()}
                    </Col>
                </Row>
                <Row gutter={12}>
                    <Col className={styles.title} span={4}>
                        <FormattedMessage id="workspace.brief.introduction" />
                    </Col>
                    <Col className={styles.content} span={20}>
                        {source?.description}
                    </Col>
                </Row>
                <Row gutter={12}>
                    <Col className={styles.title} span={4}>
                        <FormattedMessage id="workspace.apply_reason" />
                    </Col>
                    <Col className={styles.content} span={20}>
                        {source?.apply_reason || <FormattedMessage id="nothing" />}
                    </Col>
                </Row>
                <Row gutter={12}>
                    <Col className={styles.title} span={4}>
                        <FormattedMessage id="workspace.authority" />
                    </Col>
                    <Col className={styles.content} span={20}>
                        {source?.is_public ?
                            <div className={styles.bar}>
                                <PublicIcon />
                                <span style={{ paddingLeft: '6px' }}><FormattedMessage id="workspace.public" /></span>
                            </div> :
                            <div className={styles.bar}>
                                <UnPublicIcon />
                                <span style={{ paddingLeft: '6px' }}><FormattedMessage id="workspace.private" /></span>
                            </div>
                        }
                    </Col>
                </Row>
                <Row gutter={12}>
                    <Col className={styles.title} span={4}>
                        <FormattedMessage id="workspace.applicant" />
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
                        <FormattedMessage id="workspace.creation_time" />
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