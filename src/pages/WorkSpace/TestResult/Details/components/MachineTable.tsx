import React, { useState, useEffect } from 'react';
import { Col, Row, Space, Typography, Table, Spin } from 'antd';
import { ExclamationCircleOutlined, DownOutlined, UpOutlined } from '@ant-design/icons';
import { useIntl, FormattedMessage, useParams } from 'umi'
import styles from './index.less';
import { queryMachineData } from '../service';
import { StateBadge } from '@/pages/WorkSpace/DeviceManage/GroupManage/Components/index'

const RenderMachineItem = (props: any) => {
    const { ws_id } = useParams() as any
    const [flag, setFlag] = useState<boolean>(true)
    const [loading, setLoading] = useState<boolean>(true)
    const [dataSource, setDataSource] = useState<Array<{}>>([])
    const handleChange = () => {
        setFlag(!flag)
    }
    const { job_id } = props;

    const queryMachine = async () => {
        setLoading(true)
        // 810测试数据
        const { data } = await queryMachineData({ job_id })
        setDataSource(data || [])
        setLoading(false)
    }

    useEffect(() => {
        queryMachine()
    }, [job_id])

    const columns = [
        {
            title: 'IP',
            render: (_: any, row: any) => {
                if (row.device_type) {
                    return <span>{row.ip || '-'}</span>
                }
                return <span>{row.pub_ip || '-'}</span>
            },
        },
        {
            title: 'SN',
            dataIndex: 'sn',
        },
        {
            title: <FormattedMessage id="ws.result.details.provider_name" />,
            dataIndex: 'device_type',
            render: (_: any) => <>{_ || '-'}</>
        },
        {
            title: <FormattedMessage id="ws.result.details.channel_type" />,
            dataIndex: 'channel_type',
            render: (_: any) => <>{_ || '-'}</>
        },
        {
            title: <FormattedMessage id="ws.result.details.use_state" />,
            dataIndex: 'state',
            render: (_: any, row: any) => StateBadge(_, row, ws_id),
        },
        {
            title: <FormattedMessage id="ws.result.details.real_state" />,
            dataIndex: 'real_state',
            render: (_: any, row: any) => StateBadge(_, row, ws_id),
        }
    ]
    return (
        !!dataSource.length ? <Spin spinning={loading}>
            <div style={{ background: '#FFFBE6', border: '1px solid #FFE58F', marginBottom: 10 }}>
                <Row style={{ marginBottom: 16 }}>
                    <Col span={22}>
                        <ExclamationCircleOutlined style={{ color: '#FAAD14', padding: '16px 18px 0 26px' }} />
                        <Typography.Text style={{ paddingTop: 16, fontFamily: 'PingFangSC-Medium', color: 'rgba(0,0,0,0.85)' }}><FormattedMessage id="ws.result.details.test.machine.failure" /></Typography.Text>
                        <Row style={{ padding: '4px 0 0 60px' }}>
                            <Typography.Text style={{ fontFamily: 'PingFangSC-Medium', color: 'rgba(0,0,0,0.65)', marginRight: 8 }}><FormattedMessage id="ws.result.details.failed.server" /></Typography.Text>
                            {
                                Array.isArray(dataSource) && dataSource.map((item: any, index: number) => {
                                    const { ip, sn, pub_ip, device_type } = item
                                    const $ip = device_type ? ip : pub_ip

                                    const l = $ip && sn ? $ip + "/" + sn : $ip || sn

                                    return (
                                        <span style={{ marginRight: 20 }} key={index}>
                                            {l}
                                        </span>
                                    )
                                })
                            }
                        </Row>
                    </Col>
                    <Col span={2} style={{ textAlign: 'right', paddingRight: 18 }}>
                        <div style={{ paddingTop: 38, cursor: 'pointer' }} onClick={handleChange}>
                            <Space>
                                <Typography.Text style={{ fontFamily: 'PingFangSC-Medium', color: '#1890FF' }}>{flag ? <FormattedMessage id="operation.expand" /> : <FormattedMessage id="operation.collapse" />}</Typography.Text>
                                {flag ? <DownOutlined style={{ color: '#1890FF' }} /> : <UpOutlined style={{ color: '#1890FF' }} />}
                            </Space>
                        </div>
                    </Col>
                </Row>
                {
                    !flag &&
                    <Row style={{ padding: '0 20px 16px 20px' }}>
                        <Col span={24} className={styles.machineTable}>
                            <Table
                                columns={columns}
                                dataSource={dataSource}
                                pagination={false}
                                size="small"
                            />
                        </Col>
                    </Row>
                }
            </div>
        </Spin>
            : <></>
    )
}
export default RenderMachineItem;