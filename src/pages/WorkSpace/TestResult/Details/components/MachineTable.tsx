import React, { useState, useEffect } from 'react';
import { Col, Row, Space, Typography, Table, Spin } from 'antd';
import { ExclamationCircleOutlined, DownOutlined, UpOutlined } from '@ant-design/icons';
import styles from './index.less';
import { queryMachineData } from '../service';
import { StateBadge } from '@/pages/WorkSpace/DeviceManage/GroupManage/Components/index'
const RenderMachineItem = (props: any) => {
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
                if(row.device_type){
                    return(
                        <span>{row.ip || '-'}</span>
                    )
                }else{
                    return <span>{row.pub_ip}</span>
                }
            },
        },
        {
            title: 'SN',
            dataIndex: 'sn',
        },
        {
            title: '机器类型',
            dataIndex: 'device_type',
            render:(_:any) => <>{_ || '-'}</>
        },
        {
            title: '控制通道',
            dataIndex: 'channel_type',
            render:(_:any) => <>{_ || '-'}</>
        },
        {
            title: '使用状态',
            dataIndex: 'state',
            render: StateBadge,
        },
        {
            title: '实际状态',
            dataIndex: 'real_state',
            render: StateBadge,
        }
    ]
    return (
        !!dataSource.length ? <Spin spinning={loading}>
            <div style={{ background: '#FFFBE6', border: '1px solid #FFE58F', marginBottom: 10 }}>
                <Row style={{ marginBottom: 16 }}>
                    <Col span={22}>
                        <ExclamationCircleOutlined style={{ color: '#FAAD14', padding: '16px 18px 0 26px' }} />
                        <Typography.Text style={{ paddingTop: 16, fontFamily: 'PingFangSC-Medium', color: 'rgba(0,0,0,0.85)' }}>测试机器故障，请及时处理！</Typography.Text>
                        <Row style={{ padding: '4px 0 0 60px' }}>
                            <Typography.Text style={{ fontFamily: 'PingFangSC-Medium', color: 'rgba(0,0,0,0.65)', marginRight: 8 }}>故障机器</Typography.Text>
                            {
                                Array.isArray(dataSource) && dataSource.map((item:any)=>{
                                    if(item.device_type){
                                        return (
                                            <span style={{ marginRight: 20 }}>
                                                {item.ip}/{item.sn}
                                            </span>
                                        )
                                    }else{
                                        return(
                                            <span style={{ marginRight: 20 }}>
                                                {item.pub_ip}/{item.sn}
                                            </span>
                                        )
                                    }
                                })
                            }
                        </Row>
                    </Col>
                    <Col span={2} style={{ textAlign: 'right', paddingRight: 18 }}>
                        <div style={{ paddingTop: 38, cursor: 'pointer' }} onClick={handleChange}>
                            <Space>
                                <Typography.Text style={{ fontFamily: 'PingFangSC-Medium', color: '#1890FF' }}>{flag ? '展开' : '收起'}详情</Typography.Text>
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