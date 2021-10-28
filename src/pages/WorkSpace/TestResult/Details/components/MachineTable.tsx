import React, { useState } from 'react';
import { Col, Row, Space, Typography, Table } from 'antd';
import { ExclamationCircleOutlined, DownOutlined, UpOutlined } from '@ant-design/icons'
import styles from './index.less'
const RenderMachineItem = () => {
    const [flag, setFlag] = useState<boolean>(true)
    const handleChange = () => {
        setFlag(!flag)
    }
    const column = [
        {
            title: 'IP',
            dataIndex: 'ip',
        },
        {
            title: 'SN',
            dataIndex: 'sn',
        },
        {
            title: '机器类型',
            dataIndex: 'machineType',
        },
        {
            title: '控制通道',
            dataIndex: 'ip',
        },
        {
            title: '使用状态',
            dataIndex: 'ip',
        },
        {
            title: '实际状态',
            dataIndex: 'ip',
        }
    ]
    const data = [
        {
            ip: '11.158.230.96', sn: '2193003', machineType: '物理机',
        },
        {
            ip: '11.158.230.96', sn: '2193003', machineType: '物理机',
        },
        {
            ip: '11.158.230.96', sn: '2193003', machineType: '物理机',
        }
    ]
    return (
        <div style={{ background: '#FFFBE6', border: '1px solid #FFE58F' }}>
            <Row>
                <Col span={20}>
                    <ExclamationCircleOutlined style={{ color: '#FAAD14', padding: '16px 18px 0 26px' }} />
                    <Typography.Text style={{ paddingTop: 16, fontFamily: 'PingFangSC-Medium', color: 'rgba(0,0,0,0.85)' }}>测试机器故障，请及时处理！</Typography.Text>
                    <Row>
                        <div style={{ padding: '4px 0 0 60px' }}>
                            <Space>
                                <Typography.Text style={{ fontFamily: 'PingFangSC-Medium', color: 'rgba(0,0,0,0.65)' }}>故障机器</Typography.Text>
                                <a href="#" target="_blank">11.164.65.13/VM20201228-0</a>
                                <a href="#" target="_blank">11.164.65.13/VM20201228-0</a>
                                <a href="#" target="_blank">11.164.65.13/VM20201228-0</a>
                            </Space>
                        </div>
                    </Row>
                </Col>
                <Col span={4} style={{ textAlign: 'right', paddingRight: 18 }}>
                    <div style={{ paddingTop: 38, cursor: 'pointer' }} onClick={handleChange}>
                        <Space>
                            <Typography.Text style={{ fontFamily: 'PingFangSC-Medium', color: '#1890FF' }}>{flag ? '展开' : '收起'}详情</Typography.Text>
                            {flag ? <DownOutlined style={{ color: '#1890FF' }} /> : <UpOutlined style={{ color: '#1890FF' }} />}
                        </Space>
                    </div>
                </Col>
            </Row>
            <Row style={{ padding:'16px 20px'}}>
                <Col span={24} className={styles.machineTable}>
                    <Table
                        columns={column}
                        dataSource={data}
                        pagination={false}
                        size="small"
                    />
                </Col>

            </Row>
        </div>
    )
}
export default RenderMachineItem;