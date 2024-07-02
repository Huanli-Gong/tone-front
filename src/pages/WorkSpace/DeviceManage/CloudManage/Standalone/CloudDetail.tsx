import { useState, forwardRef, useImperativeHandle, useRef } from 'react'
import { Drawer, Typography, Row, Col, Layout, Spin, Tag } from 'antd'
import { useIntl, FormattedMessage } from 'umi'
import styles from './style.less'
import DeployModal from '@/pages/WorkSpace/DeviceManage/GroupManage/Standalone/Components/DeployModal';
import { dataSetMethod } from '../DataSetPulic';
import { queryChannelState } from '../../GroupManage/services'

const ViewDetailDrawer = forwardRef(
    (props, ref) => {
        const { formatMessage } = useIntl()
        const [details, setDetails] = useState<any>()
        const [type, setType] = useState<any>()
        const [channelState, setChannelState] = useState(false)
        const [loading, setLoading] = useState(true)
        const [visible, setVisible] = useState(false)
        // 部署Agent对话框
        const deployModal: any = useRef(null)
        // const deployServerRef: any = useRef(null)

        const initDetails = async (row: any) => {
            setLoading(true)
            const { code, data: detailData } = await queryChannelState({ ip: row.private_ip, channel_type: row.channel_type })
            if (code === 200) {
                setChannelState(detailData)
            } else {
                setChannelState(row.channel_state)
            }
            setLoading(false)
        }

        useImperativeHandle(ref, () => ({
            show: (_: any, $type: any) => {
                setVisible(true)
                setType($type)
                setDetails(_)
                initDetails(_)
            }
        }))

        const handleOnClose = () => {
            setVisible(false)
            setDetails(null)
        }

        // 部署Agent
        const deployClick = (selectedRow: any) => {
            deployModal.current?.show({ ...selectedRow, detailData: [selectedRow?.private_ip], radio_type: 'cloudManage' });
        }
        // 部署回调
        const deployCallback = () => {
            // case1. 部署结果信息
            // case2. 刷新数据
        }
        return (
            <Drawer
                maskClosable={false}
                keyboard={false}
                forceRender={true}
                title={<FormattedMessage id="device.details" />}
                width="510"
                open={visible}
                onClose={handleOnClose}
            >
                <Spin spinning={loading}>
                    <Layout.Content style={{ marginBottom: 30 }}>
                        <Typography.Text strong><FormattedMessage id="device.hardware" /></Typography.Text>
                        {!!type &&
                            <Row gutter={20} className={styles.row} >
                                <Col span={6}><FormattedMessage id="device.instance.id" />:</Col>
                                <Col span={18}>{details?.instance_id}</Col>
                            </Row>
                        }
                        {!!type &&
                            <Row gutter={20} className={styles.row} >
                                <Col span={6}><FormattedMessage id="device.ip.address" />:</Col>
                                <Col span={18}>{details?.private_ip}</Col>
                            </Row>
                        }
                        <Row gutter={20} className={styles.row}>
                            <Col span={6}>Region/Zone:</Col>
                            <Col span={18}>{details?.region_zone}</Col>
                        </Row>
                        <Row gutter={20} className={styles.row}>
                            <Col span={6}><FormattedMessage id="device.instance_type" />:</Col>
                            <Col span={18}>{details?.instance_type}</Col>
                        </Row>
                        <Row gutter={20} className={styles.row}>
                            <Col span={6}><FormattedMessage id="device.bandwidth" />:</Col>
                            <Col span={18}>{details?.bandwidth}</Col>
                        </Row>
                        {
                            details?.manufacturer !== 'aliyun_eci' &&
                            <>
                                <Row gutter={20} className={styles.row}>
                                    <Col span={6}><FormattedMessage id="device.system.disk" />:</Col>
                                    <Col span={18}>{dataSetMethod(details?.system_disk_category, formatMessage)}/{details?.system_disk_size}G</Col>
                                </Row>
                                <Row gutter={20} className={styles.row}>
                                    <Col span={6}><FormattedMessage id="device.storage_type" />:</Col>
                                    <Col span={18}>{dataSetMethod(details?.storage_type, formatMessage)}/{details?.storage_size}G/{details?.storage_number}个</Col>
                                </Row>
                            </>
                        }
                    </Layout.Content>
                    <Layout.Content style={{ marginBottom: 30 }}>
                        <Typography.Text strong><FormattedMessage id="device.software" /></Typography.Text>
                        <Row gutter={20} className={styles.row}>
                            <Col span={6}><FormattedMessage id="device.image" />:</Col>
                            <Col span={18}>{details?.image_name}</Col>
                        </Row>
                    </Layout.Content>
                    {
                        !!type && <Layout.Content style={{ marginBottom: 30 }}>
                            <Typography.Text strong><FormattedMessage id="device.usage.state" /></Typography.Text>
                            <Row gutter={20} className={styles.row}>
                                <Col span={6}><FormattedMessage id="device.server.state" />:</Col>
                                <Col span={18}>{details?.real_state}</Col>
                            </Row>
                        </Layout.Content>
                    }
                    {
                        !!type && <Layout.Content style={{ marginBottom: 30 }}>
                            <Typography.Text strong><FormattedMessage id="device.channel_type" /></Typography.Text>
                            <Row gutter={20} className={styles.row}>
                                <Col span={6}>Channel:</Col>
                                <Col span={18}>
                                    <span>{details?.channel_type}</span>
                                    <span className={styles.btn_style} onClick={() => deployClick(details)}><FormattedMessage id="device.redeploy" /></span>
                                </Col>
                            </Row>
                            <Row gutter={20} className={styles.row}>
                                <Col span={6}><FormattedMessage id="device.state" />:</Col>
                                <Col span={18}>{channelState?.toString()}</Col>
                            </Row>
                        </Layout.Content>
                    }
                    {
                        JSON.stringify(details?.extra_param) !== '{}' && <Layout.Content style={{ marginBottom: 30 }}>
                            <Typography.Text strong><FormattedMessage id="device.extended.fields" /></Typography.Text>
                            {
                                details?.extra_param?.map(
                                    (item: any, idx: number) => (
                                        (item.param_key && item.param_value !== '') &&
                                        // eslint-disable-next-line react/no-array-index-key
                                        <Row gutter={20} className={styles.row} key={idx}>
                                            <Col span={6} />
                                            <Col span={18}>{item.param_key}:{item.param_value}</Col>
                                        </Row>
                                    )
                                )
                            }
                        </Layout.Content>
                    }
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
export default ViewDetailDrawer;