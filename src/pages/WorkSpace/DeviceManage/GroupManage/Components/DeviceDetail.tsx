import React, { useState, forwardRef, useImperativeHandle, useRef } from 'react'
import { Drawer, Typography, Row, Col, Layout, Spin, Tag } from 'antd'
import { useIntl, FormattedMessage } from 'umi'
import styles from './index.less'
import DeployModal from '../Standalone/Components/DeployModal'
import { queryTestServerDetail, queryChannelState } from '../services'
import { StateBadge } from './index'
import { useParams } from "umi"

const ViewDetailDrawer = forwardRef(
    (props, ref) => {
        const { formatMessage } = useIntl()
        const { ws_id } = useParams() as any
        const [details, setDetails] = useState<any>()
        const [channelState, setChannelState] = useState(false)
        const [loading, setLoading] = useState(true)
        const [visible, setVisible] = useState(false)
        // 部署Agent对话框
        const deployModal: any = useRef(null)
        // const deployServerRef: any = useRef(null)

        useImperativeHandle(ref, () => ({
            show: (_: any) => {
                setVisible(true)
                initDetails(_)
            }
        }))

        const initDetails = async (id: number) => {
            setLoading(true)
            const { data = {} } = await queryTestServerDetail(id)
            setDetails(data)
            const { code, data: detailData } = await queryChannelState({ ip: data.ip, channel_type: data.channel_type })
            if (code === 200) {
                setChannelState(detailData)
            } else {
                setChannelState(data.channel_state)
            }

            setLoading(false)
        }

        const handleOnClose = () => {
            setVisible(false)
            setDetails(null)
        }

        // 部署Agent
        const deployClick = () => {
            deployModal.current?.show({ ...details, detailData: [details?.ip] });
        }
        // 部署回调
        const deployCallback = (info: any) => {
            // case1. 部署结果信息
            // const { success_servers = [], fail_servers = [] } = info;
            // case2. 刷新数据
        }

        return (
            <Drawer
                maskClosable={false}
                keyboard={false}
                forceRender={true}
                title={<FormattedMessage id="device.details" />}
                width="510"
                visible={visible}
                onClose={handleOnClose}
            >
                <Spin spinning={loading}>
                    <Layout.Content style={{ marginBottom: 30 }}>
                        <Typography.Text strong><FormattedMessage id="device.hardware" /></Typography.Text>
                        <Row gutter={20} className={styles.row} >
                            <Col span={6}>SN:</Col>
                            <Col span={18}>{details?.sn}</Col>
                        </Row>
                        <Row gutter={20} className={styles.row}>
                            <Col span={6}><FormattedMessage id="device.host.name" />:</Col>
                            <Col span={18}>{details?.hostname}</Col>
                        </Row>
                        <Row gutter={20} className={styles.row}>
                            <Col span={6}><FormattedMessage id="device.ip.address" />:</Col>
                            <Col span={18}>{details?.ip}</Col>
                        </Row>
                        <Row gutter={20} className={styles.row}>
                            <Col span={6}><FormattedMessage id="device.test.server.type" />:</Col>
                            <Col span={18}>{details?.device_type}</Col>
                        </Row>
                        <Row gutter={20} className={styles.row}>
                            <Col span={6}>IDC:</Col>
                            <Col span={18}>{details?.idc}</Col>
                        </Row>
                        <Row gutter={20} className={styles.row}>
                            <Col span={6}><FormattedMessage id="device.manufacturer" />:</Col>
                            <Col span={18}>{details?.manufacturer}</Col>
                        </Row>
                        <Row gutter={20} className={styles.row}>
                            <Col span={6}><FormattedMessage id="device.model" />:</Col>
                            <Col span={18}>{details?.device_mode}</Col>
                        </Row>
                        <Row gutter={20} className={styles.row}>
                            <Col span={6}><FormattedMessage id="device.model.type" />:</Col>
                            <Col span={18}>{details?.sm_name}</Col>
                        </Row>
                        <Row gutter={20} className={styles.row}>
                            <Col span={6}><FormattedMessage id="device.security.domain" />:</Col>
                            <Col span={18}>{details?.security_domain}</Col>
                        </Row>
                        <Row gutter={20} className={styles.row}>
                            <Col span={6}>CPU:</Col>
                            <Col span={18}>{details?.cpu}</Col>
                        </Row>
                        <Row gutter={20} className={styles.row}>
                            <Col span={6}><FormattedMessage id="device.CPU.device" />:</Col>
                            <Col span={18}>{details?.cpu_device}</Col>
                        </Row>
                        <Row gutter={20} className={styles.row}>
                            <Col span={6}><FormattedMessage id="device.memory" />:</Col>
                            <Col span={18}>{details?.memory}</Col>
                        </Row>
                        <Row gutter={20} className={styles.row}>
                            <Col span={6}><FormattedMessage id="device.memory.device" />:</Col>
                            <Col span={18}>{details?.memory_device}</Col>
                        </Row>
                        <Row gutter={20} className={styles.row}>
                            <Col span={6}><FormattedMessage id="device.storage" />:</Col>
                            <Col span={18}>{details?.storage}</Col>
                        </Row>
                        <Row gutter={20} className={styles.row}>
                            <Col span={6}><FormattedMessage id="device.network" />:</Col>
                            <Col span={18}>{details?.network}</Col>
                        </Row>
                        <Row gutter={20} className={styles.row}>
                            <Col span={6}><FormattedMessage id="device.network.device" />:</Col>
                            <Col span={18}>{details?.net_device}</Col>
                        </Row>
                    </Layout.Content>
                    <Layout.Content style={{ marginBottom: 30 }}>
                        <Typography.Text strong><FormattedMessage id="device.software" /></Typography.Text>
                        <Row gutter={20} className={styles.row}>
                            <Col span={6}><FormattedMessage id="device.operating.system" />:</Col>
                            <Col span={18}>{details?.platform}</Col>
                        </Row>
                        <Row gutter={20} className={styles.row}>
                            <Col span={6}><FormattedMessage id="device.kernel_version" />:</Col>
                            <Col span={18}>{details?.kernel}</Col>
                        </Row>
                    </Layout.Content>
                    <Layout.Content style={{ marginBottom: 30 }}>
                        <Typography.Text strong><FormattedMessage id="device.application.group" /></Typography.Text>
                        <Row gutter={20} className={styles.row}>
                            <Col span={6}><FormattedMessage id="device.application.group" />:</Col>
                            <Col span={18}>{details?.app_group}</Col>
                        </Row>
                        <Row gutter={20} className={styles.row}>
                            <Col span={6}><FormattedMessage id="device.application.state" />:</Col>
                            <Col span={18}>{details?.app_state}</Col>
                        </Row>
                    </Layout.Content>
                    <Layout.Content style={{ marginBottom: 30 }}>
                        <Typography.Text strong><FormattedMessage id="device.usage.state" /></Typography.Text>
                        <Row gutter={20} className={styles.row}>
                            <Col span={6}><FormattedMessage id="device.server.state" />:</Col>
                            <Col span={18}>{StateBadge(details?.state, details, ws_id)}</Col>
                        </Row>
                    </Layout.Content>
                    <Layout.Content style={{ marginBottom: 30 }}>
                        <Typography.Text strong><FormattedMessage id="device.channel_type" /></Typography.Text>
                        <Row gutter={20} className={styles.row}>
                            <Col span={6}>Channel:</Col>
                            <Col span={18}>
                                <span>{details?.channel_type}</span>

                                {
                                    !BUILD_APP_ENV && details?.channel_type === 'toneagent' &&
                                    <span className={styles.btn_style} onClick={() => deployClick()}>
                                        <FormattedMessage id="device.redeploy" />
                                    </span>
                                }
                            </Col>
                        </Row>
                        <Row gutter={20} className={styles.row}>
                            <Col span={6}><FormattedMessage id="device.state" />:</Col>
                            <Col span={18}>{channelState?.toString()}</Col>
                        </Row>
                        {/* <Row gutter={ 20 }>
                            <Col offset={ 5 }><Button type="link" onClick={ handleOpenDeployServerDrawer }>部署</Button></Col>
                        </Row> */}
                    </Layout.Content>
                    <Layout.Content style={{ marginBottom: 30 }}>
                        <Typography.Text strong><FormattedMessage id="device.scheduling.label" /></Typography.Text>
                        <Row style={{ marginTop: 10 }}>
                            {
                                details?.tag_list && details?.tag_list.map(
                                    (item: any) => (
                                        <Tag color={item.tag_color} key={item.id} >{item.name}</Tag>
                                    )
                                )
                            }
                        </Row>
                    </Layout.Content>
                    <Layout.Content>
                        <Typography.Text strong><FormattedMessage id="device.others.info" /></Typography.Text>
                        <Row gutter={20} className={styles.row}>
                            <Col span={6}><FormattedMessage id="device.machine.name" />:</Col>
                            <Col span={18}>{details?.name}</Col>
                        </Row>
                        <Row gutter={20} className={styles.row}>
                            <Col span={6}>Owner:</Col>
                            <Col span={18}>{details?.owner_name}</Col>
                        </Row>
                        <Row gutter={20} className={styles.row}>
                            <Col span={6}><FormattedMessage id="device.creation_time" />:</Col>
                            <Col span={18}>{details?.gmt_created}</Col>
                        </Row>
                        <Row gutter={20} className={styles.row}>
                            <Col span={6}><FormattedMessage id="device.modify_time" />:</Col>
                            <Col span={18}>{details?.gmt_modified}</Col>
                        </Row>
                        <Row gutter={20} className={styles.row}>
                            <Col span={6}><FormattedMessage id="device.description" />:</Col>
                            <Col span={18}>{details?.description}</Col>
                        </Row>
                    </Layout.Content>
                </Spin>
                <DeployModal ref={deployModal} callback={deployCallback} />
            </Drawer>
        )
    }
)
export default ViewDetailDrawer