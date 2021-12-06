import React, { useEffect, useState, useCallback, forwardRef, useImperativeHandle, useRef } from 'react'
import { Drawer, Typography, Row, Col, Layout, Spin, Tag } from 'antd'
import styles from './index.less'
import DeployModal from '../Standalone/Components/DeployModal'
import { queryTestServerDetail, queryChannelState } from '../services'
import { StateBadge } from './index'

import DeployServer from './DeployServer'

const ViewDetailDrawer = forwardRef(
    (props, ref) => {
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
                title="详情"
                width="510"
                visible={visible}
                onClose={handleOnClose}
            >
                <Spin spinning={loading}>
                    <Layout.Content style={{ marginBottom: 30 }}>
                        <Typography.Text strong>硬件</Typography.Text>
                        <Row gutter={20} className={styles.row} >
                            <Col span={6}>SN:</Col>
                            <Col span={18}>{details?.sn}</Col>
                        </Row>
                        <Row gutter={20} className={styles.row}>
                            <Col span={6}>主机名:</Col>
                            <Col span={18}>{details?.hostname}</Col>
                        </Row>
                        <Row gutter={20} className={styles.row}>
                            <Col span={6}>IP地址:</Col>
                            <Col span={18}>{details?.ip}</Col>
                        </Row>
                        <Row gutter={20} className={styles.row}>
                            <Col span={6}>测试机类型:</Col>
                            <Col span={18}>{details?.device_type}</Col>
                        </Row>
                        <Row gutter={20} className={styles.row}>
                            <Col span={6}>IDC:</Col>
                            <Col span={18}>{details?.idc}</Col>
                        </Row>
                        <Row gutter={20} className={styles.row}>
                            <Col span={6}>制造商:</Col>
                            <Col span={18}>{details?.manufacturer}</Col>
                        </Row>
                        <Row gutter={20} className={styles.row}>
                            <Col span={6}>型号:</Col>
                            <Col span={18}>{details?.device_mode}</Col>
                        </Row>
                        <Row gutter={20} className={styles.row}>
                            <Col span={6}>机型:</Col>
                            <Col span={18}>{details?.sm_name}</Col>
                        </Row>
                        <Row gutter={20} className={styles.row}>
                            <Col span={6}>安全域:</Col>
                            <Col span={18}>{details?.security_domain}</Col>
                        </Row>
                        <Row gutter={20} className={styles.row}>
                            <Col span={6}>CPU:</Col>
                            <Col span={18}>{details?.cpu}</Col>
                        </Row>
                        <Row gutter={20} className={styles.row}>
                            <Col span={6}>CPU设备:</Col>
                            <Col span={18}>{details?.cpu_device}</Col>
                        </Row>
                        <Row gutter={20} className={styles.row}>
                            <Col span={6}>内存:</Col>
                            <Col span={18}>{details?.memory}</Col>
                        </Row>
                        <Row gutter={20} className={styles.row}>
                            <Col span={6}>内存设备:</Col>
                            <Col span={18}>{details?.memory_device}</Col>
                        </Row>
                        <Row gutter={20} className={styles.row}>
                            <Col span={6}>存储:</Col>
                            <Col span={18}>{details?.storage}</Col>
                        </Row>
                        <Row gutter={20} className={styles.row}>
                            <Col span={6}>网络:</Col>
                            <Col span={18}>{details?.network}</Col>
                        </Row>
                        <Row gutter={20} className={styles.row}>
                            <Col span={6}>网络设备:</Col>
                            <Col span={18}>{details?.net_device}</Col>
                        </Row>
                    </Layout.Content>
                    <Layout.Content style={{ marginBottom: 30 }}>
                        <Typography.Text strong>软件</Typography.Text>
                        <Row gutter={20} className={styles.row}>
                            <Col span={6}>操作系统:</Col>
                            <Col span={18}>{details?.platform}</Col>
                        </Row>
                        <Row gutter={20} className={styles.row}>
                            <Col span={6}>内核版本:</Col>
                            <Col span={18}>{details?.kernel}</Col>
                        </Row>
                    </Layout.Content>
                    <Layout.Content style={{ marginBottom: 30 }}>
                        <Typography.Text strong>应用分组</Typography.Text>
                        <Row gutter={20} className={styles.row}>
                            <Col span={6}>应用分组:</Col>
                            <Col span={18}>{details?.app_group}</Col>
                        </Row>
                        <Row gutter={20} className={styles.row}>
                            <Col span={6}>应用状态:</Col>
                            <Col span={18}>{details?.app_state}</Col>
                        </Row>
                    </Layout.Content>
                    <Layout.Content style={{ marginBottom: 30 }}>
                        <Typography.Text strong>使用状态</Typography.Text>
                        <Row gutter={20} className={styles.row}>
                            <Col span={6}>机器状态:</Col>
                            <Col span={18}>{StateBadge(details?.state, details)}</Col>
                        </Row>
                    </Layout.Content>
                    <Layout.Content style={{ marginBottom: 30 }}>
                        <Typography.Text strong>控制通道</Typography.Text>
                        <Row gutter={20} className={styles.row}>
                            <Col span={6}>Channel:</Col>
                            <Col span={18}>
                                <span>{details?.channel_type}</span>
                                {
                                    details?.channel_type === 'toneagent' &&
                                    <span className={styles.btn_style} onClick={() => deployClick()}>重新部署</span>
                                }
                            </Col>
                        </Row>
                        <Row gutter={20} className={styles.row}>
                            <Col span={6}>状态:</Col>
                            <Col span={18}>{channelState?.toString()}</Col>
                        </Row>
                        {/* <Row gutter={ 20 }>
                            <Col offset={ 5 }><Button type="link" onClick={ handleOpenDeployServerDrawer }>部署</Button></Col>
                        </Row> */}
                    </Layout.Content>
                    <Layout.Content style={{ marginBottom: 30 }}>
                        <Typography.Text strong>调度标签</Typography.Text>
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
                        <Typography.Text strong>其它信息</Typography.Text>
                        <Row gutter={20} className={styles.row}>
                            <Col span={6}>机器名称:</Col>
                            <Col span={18}>{details?.name}</Col>
                        </Row>
                        <Row gutter={20} className={styles.row}>
                            <Col span={6}>Owner:</Col>
                            <Col span={18}>{details?.owner_name}</Col>
                        </Row>
                        <Row gutter={20} className={styles.row}>
                            <Col span={6}>创建时间:</Col>
                            <Col span={18}>{details?.gmt_created}</Col>
                        </Row>
                        <Row gutter={20} className={styles.row}>
                            <Col span={6}>修改时间:</Col>
                            <Col span={18}>{details?.gmt_modified}</Col>
                        </Row>
                        <Row gutter={20} className={styles.row}>
                            <Col span={6}>备注:</Col>
                            <Col span={18}>{details?.description}</Col>
                        </Row>
                    </Layout.Content>
                </Spin>
                {/* <DeployServer
                    handleOk={handleDeployOk}
                    ref={deployServerRef}
                /> */}
                <DeployModal ref={deployModal} callback={deployCallback} />
            </Drawer>
        )
    }
)
export default ViewDetailDrawer