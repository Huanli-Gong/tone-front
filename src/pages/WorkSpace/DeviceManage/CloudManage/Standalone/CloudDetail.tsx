import React, { useEffect, useState, useCallback, forwardRef, useImperativeHandle, useRef } from 'react'
import { Drawer, Typography, Row, Col, Layout, Spin, Tag } from 'antd'
import styles from './style.less'
import DeployModal from '@/pages/WorkSpace/DeviceManage/GroupManage/Standalone/Components/DeployModal';
import { dataSetMethod } from '../DataSetPulic';
import { queryTestServerDetail, queryChannelState } from '../../GroupManage/services'
// import { StateBadge } from './index'

// import DeployServer from './DeployServer'

const ViewDetailDrawer = forwardRef(
    (props, ref) => {
        const [details, setDetails] = useState<any>()
        const [type, setType] = useState<any>()
        const [channelState, setChannelState] = useState(false)
        const [loading, setLoading] = useState(true)
        const [visible, setVisible] = useState(false)
        // 部署Agent对话框
        const deployModal: any = useRef(null)
        // const deployServerRef: any = useRef(null)

        useImperativeHandle(ref, () => ({
            show: (_: any, type: any) => {
                setVisible(true)
                setType(type)
                setDetails(_)
                initDetails(_)
            }
        }))
        const initDetails = async (row: any) => {
            setLoading(true)
            // const { data = {} } = await queryTestServerDetail(id)
            // setDetails(data)
            const { code, data: detailData } = await queryChannelState({ ip: row.private_ip, channel_type: row.channel_type })
            if (code === 200) {
                setChannelState(detailData)
            } else {
                setChannelState(row.channel_state)
            }

            setLoading(false)
        }

        const handleOnClose = () => {
            setVisible(false)
            setDetails(null)
        }

        // 部署Agent
        const deployClick = (selectedRow: any) => {
            deployModal.current?.show({ ...selectedRow, detailData: [selectedRow?.private_ip], radio_type: 'cloudManage' });
        }
        // 部署回调
        const deployCallback = (info: any) => {
            // case1. 部署结果信息
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
                        {type !== '0' &&
                            <Row gutter={20} className={styles.row} >
                                <Col span={6}>实例ID:</Col>
                                <Col span={18}>{details?.instance_id}</Col>
                            </Row>
                        }
                        {type !== '0' &&
                            <Row gutter={20} className={styles.row} >
                                <Col span={6}>IP地址:</Col>
                                <Col span={18}>{details?.private_ip}</Col>
                            </Row>
                        }
                        {/* <Row gutter={20} className={styles.row} >
                            <Col span={6}>SN:</Col>
                            <Col span={18}>{details?.sn}</Col>
                        </Row> */}
                        <Row gutter={20} className={styles.row}>
                            <Col span={6}>Region/Zone:</Col>
                            <Col span={18}>{details?.region_zone}</Col>
                        </Row>
                        <Row gutter={20} className={styles.row}>
                            <Col span={6}>规格:</Col>
                            <Col span={18}>{details?.instance_type}</Col>
                        </Row>
                        <Row gutter={20} className={styles.row}>
                            <Col span={6}>带宽:</Col>
                            <Col span={18}>{details?.bandwidth}</Col>
                        </Row>
                        {
                            details?.manufacturer !== 'aliyun_eci' &&
                            <>
                                <Row gutter={20} className={styles.row}>
                                    <Col span={6}>系统盘:</Col>
                                    <Col span={18}>{dataSetMethod(details?.system_disk_category)}/{details?.system_disk_size}G</Col>
                                </Row>
                                <Row gutter={20} className={styles.row}>
                                    <Col span={6}>数据盘:</Col>
                                    <Col span={18}>{dataSetMethod(details?.storage_type)}/{details?.storage_size}G/{details?.storage_number}个</Col>
                                </Row>
                            </>
                        }
                    </Layout.Content>
                    <Layout.Content style={{ marginBottom: 30 }}>
                        <Typography.Text strong>软件</Typography.Text>
                        <Row gutter={20} className={styles.row}>
                            <Col span={6}>镜像:</Col>
                            <Col span={18}>{details?.image_name}</Col>
                        </Row>
                    </Layout.Content>
                    {
                        type !== '0' && <Layout.Content style={{ marginBottom: 30 }}>
                            <Typography.Text strong>使用状态</Typography.Text>
                            <Row gutter={20} className={styles.row}>
                                <Col span={6}>机器状态:</Col>
                                <Col span={18}>{details?.real_state}</Col>
                            </Row>
                            {/* <Row gutter={ 20 }>
                            <Col offset={ 5 }><Button type="link" onClick={ handleOpenDeployServerDrawer }>部署</Button></Col>
                        </Row>  */}
                        </Layout.Content>
                    }
                    {
                        type !== '0' && <Layout.Content style={{ marginBottom: 30 }}>
                            <Typography.Text strong>控制通道</Typography.Text>
                            <Row gutter={20} className={styles.row}>
                                <Col span={6}>Channel:</Col>
                                <Col span={18}>
                                    <span>{details?.channel_type}</span>
                                    <span className={styles.btn_style} onClick={() => deployClick(details)}>重新部署</span>
                                </Col>
                            </Row>
                            <Row gutter={20} className={styles.row}>
                                <Col span={6}>状态:</Col>
                                <Col span={18}>{channelState?.toString()}</Col>
                            </Row>
                            {/* <Row gutter={ 20 }>
                                <Col offset={ 5 }><Button type="link" onClick={ handleOpenDeployServerDrawer }>部署</Button></Col>
                            </Row>  */}
                        </Layout.Content>
                    }
                    {
                        JSON.stringify(details?.extra_param) !== '{}' && <Layout.Content style={{ marginBottom: 30 }}>
                            <Typography.Text strong>扩展字段</Typography.Text>
                            {
                                details?.extra_param?.map(
                                    (item: any) => (
                                        (item.param_key && item.param_value !== '') &&
                                        <Row gutter={20} className={styles.row}>
                                            <Col span={6}></Col>
                                            <Col span={18}>{item.param_key}:{item.param_value}</Col>
                                        </Row>
                                    )
                                )
                            }
                        </Layout.Content>
                    }
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
                    {/* <Layout.Content style={{ marginBottom: 30 }}>
                        <Typography.Text strong>其他信息</Typography.Text>
                        <Row gutter={20} className={styles.row}>
                            <Col span={6}>Channel:</Col>
                            <Col span={18}>
                                <span>{details?.channel_type}</span>
                                {details?.channel_type === 'toneagent' && <span className={styles.btn_style} onClick={()=> deployClick([details?.ip])}>重新部署</span> }
                            </Col>
                        </Row>
                        <Row gutter={20} className={styles.row}>
                            <Col span={6}>状态:</Col>
                            <Col span={18}>{channelState?.toString()}</Col>
                        </Row>
                        <Row gutter={ 20 }>
                            <Col offset={ 5 }><Button type="link" onClick={ handleOpenDeployServerDrawer }>部署</Button></Col>
                        </Row> 
                    </Layout.Content> */}

                    <Layout.Content>
                        <Typography.Text strong>其它信息</Typography.Text>
                        <Row gutter={20} className={styles.row}>
                            <Col span={6}>配置名称:</Col>
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
export default ViewDetailDrawer;