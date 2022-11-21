import React from "react"
import { Button, Col, Divider, Row, Space, Typography } from "antd"
import styled, { keyframes, css } from "styled-components";
import { getLocale, useIntl } from "umi";

import { DownOutlined, UpOutlined } from "@ant-design/icons"

import { ReactComponent as CheckOutlined } from '@/assets/svg/home/CheckOutlined.svg';
import { ReactComponent as QualityCollaboration } from '@/assets/svg/anolis_home/quality_collaboration.svg';
import { ReactComponent as DataAnalysis } from '@/assets/svg/anolis_home/data_analysis.svg';
import { ReactComponent as ProcessSupport } from '@/assets/svg/anolis_home/process_support.svg';

import bannerBg from "@/assets/anolis_banner.gif"

import cls from "classnames"
import { useSize } from "ahooks";

const classIconMap = new Map([
    ["quality_collaboration", <QualityCollaboration key={"quality_collaboration"} />],
    ["data_analysis", <DataAnalysis key={"data_analysis"} />],
    ["process_support", <ProcessSupport key={"process_support"} />],
])

type BannerProps = {
    collapsed?: boolean;
}

const collapsedAnimate = keyframes`
    from {
        height: 0;
    }

    to {
        height: 280px;
    }
`;

const expandedAnimate = keyframes`
    from {
        height: 280px;
    }
    to {
        height: 0px;
    }
`

const expandedCss = css`
    animation: ${expandedAnimate} .3s ease;
`

const collapsedCss = css`
    animation: ${collapsedAnimate} .5s ease;
`

const CollapsedWrapper = styled.div<BannerProps>`
    overflow: hidden;
    height: ${({ collapsed }) => collapsed ? "280px" : `0px`};
    ${({ collapsed }) => collapsed === true && collapsedCss}
    ${({ collapsed }) => collapsed === false && expandedCss}
    background-image: linear-gradient(180deg, #EFF0F9 0%, #E8E9F4 99%);
    
    .animate_delay_300ms {
        animation-delay: 0.3s;
    }
`

const CollapsedButton = styled(Button)`
    position: absolute;
    left: 50%;
    bottom: 8px;
    transform: translateX(-50%);
    border: 1px solid rgba(0,0,0,0.15);
    color: rgba(0,0,0,0.65);
    z-index: 88;

    &:hover ,
    &:active,
    &:focus {
        color: rgba(0,0,0,0.65);
        border-color: rgba(0,0,0,0.15) !important;
    }
`

const BannerWrapper = styled.div`
    height: 220px;
    position: absolute;
    top: 0;
    right: 0;
    display: flex;
    align-items: center;
    overflow: hidden;
    img { height: 100%;}
`

const Banner = styled.div<BannerProps>`
    width: 100%;
    background-image: linear-gradient(180deg, #EFF0F9 0%, #E8E9F4 99%);
    border-radius: 4px;
    position: relative;
`

const project_features = ["quality_collaboration", "data_analysis", "process_support"]

const HomeBanner: React.FC<Record<string, any>> = () => {
    const [collapsed, setCollapsed] = React.useState<any>(undefined)

    const locale = getLocale()
    const intl = useIntl()

    const ref = React.useRef(null)
    const size = useSize(ref)

    const boxSize = size.width ?? innerWidth

    const percent = locale === "en-US" ? .6 : .7
    const textPercent = locale === "en-US" ? .43 : .7

    const textWidth = boxSize < 1400 ? boxSize * .55 - (1400 - boxSize) : boxSize * textPercent
    const subTextWidth = boxSize < 1400 ? boxSize * .75 - (1400 - boxSize) : boxSize * percent

    return (
        <Banner collapsed={collapsed}>
            <div style={{ padding: 20, minHeight: 220 }} ref={ref} >
                <Space
                    direction="vertical"
                    style={{
                        zIndex: 20, position: "absolute", left: 0,
                        top: 0, paddingLeft: 20, paddingTop: 20,
                        width: subTextWidth
                    }}
                    size={0}
                >
                    <Typography.Title level={3}
                        style={{ fontSize: 24, fontWeight: 400, marginBottom: 12 }}
                    >
                        {intl.formatMessage({ id: "pages.home.title" })}
                    </Typography.Title>
                    <Typography.Text style={{ color: "rgba(0,0,0,.5)", fontWeight: 400 }}>
                        {intl.formatMessage({ id: "pages.home.subTitle" })}
                    </Typography.Text>
                    <Space direction="vertical" style={{ marginTop: 10 }} size={2}>
                        {
                            new Array(3).fill("").map((n, i) => (
                                <Space key={i} align="start">
                                    <CheckOutlined style={{ transform: "translateY(3px)" }} />
                                    <Typography.Text
                                        style={{ color: "rgba(0,0,0,.5)", fontWeight: 400, width: textWidth }}
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

            <CollapsedWrapper collapsed={collapsed}>
                <Typography.Title
                    level={3}
                    style={{
                        fontSize: 24, fontWeight: 400, paddingLeft: 20, paddingTop: 40,
                        marginBottom: 0
                    }}
                >
                    {
                        intl.formatMessage({ id: "pages.anolis_home.project_features" })
                    }
                </Typography.Title>
                <Row style={{ padding: "20px 40px" }} gutter={40}>
                    {
                        project_features.map((n, $num) => (
                            <Col
                                key={n}
                                span={24 / 3}
                                className={cls(
                                    "animate__animated",
                                    collapsed === true && "animate__fadeIn animate_delay",
                                    collapsed === false && "animate__fadeOut"
                                )}
                                style={{
                                    borderRight: project_features.length - 1 !== $num ? "1px solid rgba(0,0,0,.1)" : ""
                                }}
                            >
                                <Space style={{ width: "100%" }} size={16} direction="vertical">
                                    <Typography.Text
                                        style={{ fontSize: 16, fontWeight: 500, color: "rgba(0,0,0,.85)" }}
                                        ellipsis={{ tooltip: true }}
                                    >
                                        {
                                            intl.formatMessage({ id: `pages.anolis_home.${n}` })
                                        }
                                    </Typography.Text>
                                    <Row justify="space-between" align="middle" >
                                        <Space direction="vertical" size={6} style={{ maxWidth: 280 }}>
                                            {
                                                new Array(3).fill("").map((x, i) => (
                                                    <Space align="start" key={i}
                                                        className={cls(
                                                            "animate__animated",
                                                            collapsed === true && "animate__fadeIn animate_delay",
                                                            collapsed === false && "animate__fadeOut"
                                                        )}
                                                    >
                                                        <CheckOutlined style={{ transform: "translateY(3px)" }} />
                                                        <Typography.Text
                                                            style={{ color: "rgba(0,0,0,.5)", fontWeight: 400, maxWidth: 260 }}
                                                            ellipsis={{ tooltip: true }}
                                                        >
                                                            {intl.formatMessage({ id: `pages.anolis_home.${n}.child.${i + 1}` })}
                                                        </Typography.Text>
                                                    </Space>
                                                ))
                                            }
                                        </Space>
                                        <Typography.Text
                                            style={{ width: "calc(100% - 280px)", textAlign: "center" }}
                                            className={cls(
                                                "animate__animated",
                                                collapsed === true && "animate__fadeInUp animate_delay",
                                                collapsed === false && "animate__fadeOut"
                                            )}
                                        >
                                            {classIconMap.get(n)}
                                        </Typography.Text>
                                    </Row>
                                </Space>
                            </Col>
                        ))
                    }
                </Row>
            </CollapsedWrapper>
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