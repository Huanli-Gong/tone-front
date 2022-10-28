import React from "react"
import { Button, Col, Divider, Row, Space, Typography } from "antd"
import styled from "styled-components";
import { useIntl } from "umi";

import { DownOutlined, UpOutlined } from "@ant-design/icons"

import { ReactComponent as CheckOutlined } from '@/assets/svg/home/CheckOutlined.svg';
import { ReactComponent as QualityCollaboration } from '@/assets/svg/anolis_home/quality_collaboration.svg';
import { ReactComponent as DataAnalysis } from '@/assets/svg/anolis_home/data_analysis.svg';
import { ReactComponent as ProcessSupport } from '@/assets/svg/anolis_home/process_support.svg';

import bannerBg from "@/assets/img/anolis_banner.png"

const classIconMap = new Map([
    ["quality_collaboration", <QualityCollaboration key={"quality_collaboration"} />],
    ["data_analysis", <DataAnalysis key={"data_analysis"} />],
    ["process_support", <ProcessSupport key={"process_support"} />],
])

type BannerProps = {
    collapsed?: boolean;
}

const CollapsedButton = styled(Button)`
    position: absolute;
    left: 50%;
    bottom: 8px;
    transform: translateX(-50%);
    border: 1px solid rgba(0,0,0,0.15);
    color: rgba(0,0,0,0.65);

    &:hover ,
    &:active,
    &:focus {
        color: rgba(0,0,0,0.65);
        border-color: rgba(0,0,0,0.15) !important;
    }
`

const BannerWrapper = styled.div`
    height: 546px;
    position: absolute;
    top: -87px;
    right: 0;
    display: flex;
    align-items: center;
    img { height: 100%;}
`

const Banner = styled.div<BannerProps>`
    width: 100%;
    height: ${({ collapsed }) => collapsed ? "500px" : "220px"};
    background-image: linear-gradient(224deg, #E1E1F2 0%, #C0C6EF 91%);
    border-radius: 4px;
    position: relative;
`

const HomeBanner: React.FC<Record<string, any>> = () => {
    const [collapsed, setCollapsed] = React.useState(false)

    const intl = useIntl()

    return (
        <Banner collapsed={collapsed}>
            <div style={{ padding: 20, height: 220 }}>
                <Space direction="vertical" style={{ width: "60%", }} size={0}>
                    <Typography.Title level={3} style={{ fontSize: 24, fontWeight: 400, marginBottom: 12 }}>
                        {intl.formatMessage({ id: "pages.home.title" })}
                    </Typography.Title>
                    <Typography.Text style={{ color: "rgba(0,0,0,.5)", fontWeight: 400 }}>
                        {intl.formatMessage({ id: "pages.home.subTitle" })}
                    </Typography.Text>
                    <Space direction="vertical" style={{ width: "78%", marginTop: 10 }} size={2}>
                        {
                            new Array(3).fill("").map((n, i) => (
                                <Space key={i} align="start">
                                    <CheckOutlined style={{ transform: "translateY(3px)" }} />
                                    <Typography.Text
                                        style={{ color: "rgba(0,0,0,.5)", fontWeight: 400, maxWidth: 600 }}
                                        ellipsis={{ tooltip: true }}
                                    >
                                        {intl.formatMessage({ id: `pages.home.push.li.use${i + 1}` })}
                                    </Typography.Text>
                                </Space>
                            ))
                        }
                    </Space>
                </Space>
                <BannerWrapper >
                    <img src={bannerBg} />
                </BannerWrapper>
            </div>

            {
                collapsed &&
                <div style={{ padding: "0 20px" }}>
                    <Divider style={{ margin: 0 }} />
                </div>
            }

            {
                collapsed &&
                <div style={{ padding: 20 }}>
                    <Typography.Title level={3} style={{ fontSize: 24, fontWeight: 400 }}>
                        T-One特色
                    </Typography.Title>
                    <Row style={{ padding: 20 }}>
                        {
                            ["quality_collaboration", "data_analysis", "process_support"].map((n) => (
                                <Col key={n} span={24 / 3} >
                                    <Space style={{ width: "100%" }} size={16} direction="vertical">
                                        <Typography.Text style={{ fontSize: 16, fontWeight: 500, color: "rgba(0,0,0,.85)" }}>
                                            {
                                                intl.formatMessage({ id: `pages.anolis_home.${n}` })
                                            }
                                        </Typography.Text>
                                        <Row justify="space-between" align="middle">
                                            <Space direction="vertical" size={6}>
                                                {
                                                    new Array(3).fill("").map((x, i) => (
                                                        <Space align="center" key={i}>
                                                            <CheckOutlined style={{ transform: "translateY(3px)" }} />
                                                            <Typography.Text style={{ color: "rgba(0,0,0,.5)", fontWeight: 400 }}>
                                                                {intl.formatMessage({ id: `pages.anolis_home.${n}.child.${i + 1}` })}
                                                            </Typography.Text>
                                                        </Space>
                                                    ))
                                                }
                                            </Space>
                                            <Typography.Text style={{ marginRight: 60 }}>
                                                {classIconMap.get(n)}
                                            </Typography.Text>
                                        </Row>
                                    </Space>
                                </Col>
                            ))
                        }
                    </Row>
                </div>
            }
            <CollapsedButton
                onClick={() => setCollapsed(!collapsed)}
            >
                <Space>
                    <Typography.Text>
                        {
                            intl.formatMessage({ id: `pages.anolis_home.${collapsed ? "expand" : "open"}` })
                        }
                    </Typography.Text>
                    {
                        collapsed ?
                            <UpOutlined /> :
                            <DownOutlined />
                    }
                </Space>
            </CollapsedButton>
        </Banner>
    )
}

export default HomeBanner