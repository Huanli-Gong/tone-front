import React from "react"

import logoPng from '@/assets/img/logo.png'
import { ReactComponent as CheckOutlined } from '@/assets/svg/home/CheckOutlined.svg';
import { ReactComponent as Introduce } from '@/assets/svg/home/first_introduce.svg';
import { Col, Row, Space, Typography, Avatar } from "antd"

const introList = [
    '支持多CPU混合架构（x86、arm、loogarch、risc-v）',
    '支持多操作系统类型（龙蜥OS、centos、debian、ubuntu、统信、麒麟）',
    '支持复杂环境测试（企业内网、网络隔离环境、弹性云虚拟机/容器、应用集群及多种混合环境）',
]

const FirstPage: React.FC = () => {
    return (
        <Space direction="vertical" size={48}>
            <Row justify="center">
                <Typography.Title level={2} style={{ fontWeight: "normal", marginBottom: 0 }}>T-One系统介绍</Typography.Title>
            </Row>
            <Row gutter={24}>
                <Col span={15}>
                    <Space direction="vertical" size={12}>
                        <Space align="center">
                            <Avatar shape="square" src={logoPng} size={64} style={{ marginRight: 9 }} />
                            <Typography.Title level={2} style={{ marginBottom: 0, fontWeight: "normal", fontSize: 48 }} >T-One</Typography.Title>
                        </Space>
                        <Typography.Text>
                            测试类型众多，测试环境异常复杂，怎么能轻松自动化起来？业内首个一站式、全场景质量协作平台 T-One 能满足你的一切自动化测试需求：
                        </Typography.Text>
                        <Space direction="vertical">
                            {
                                introList.map(
                                    (i: any) => (
                                        <Space key={i} align="start">
                                            <CheckOutlined style={{ marginTop: 3 }} />
                                            <Typography.Text>{i}</Typography.Text>
                                        </Space>
                                    )
                                )
                            }
                        </Space>
                    </Space>
                </Col>
                <Col span={9}>
                    <Introduce style={{ width: "100%", height: "100%" }} />
                </Col>
            </Row>
        </Space>
    )
}

export default FirstPage