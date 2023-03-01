import React from "react";
import {
    MachineGroup,
    MachineGroupL,
    MachineGroupR,
} from './TestEnvUI';
import { Row, Tooltip, Typography } from "antd";
import { DoubleRightOutlined } from "@ant-design/icons"
import styled, { keyframes } from "styled-components"
import { useIntl } from "umi";

const collapsedAnimate = keyframes`
    from {
        transform: translateY(0);
    }

    to {
        transform: translateY(3px);
    }
`;

const CollapsedSpan = styled.div`
    align-items: center;
    justify-content: center;
    height: 40px;
    line-height: 40px;
    display: inline-flex;
    width: 100px;
    margin: 0 auto;
    cursor: pointer;
    color: #1890FF;
    animation: ${collapsedAnimate} .5s ease-in-out .5s infinite alternate;
`
interface EnvType {
    len?: any[],
    envData?: any[],
    environmentResult?: any,
    group?: number,
}

export const TestEnv: React.FC<EnvType> = ({ envData, environmentResult, group }) => {
    const { count } = environmentResult
    const intl = useIntl()
    const [collapsed, setCollapsed] = React.useState(false);

    React.useEffect(() => {
        return () => {
            setCollapsed(false)
        }
    }, [])

    if (!envData)
        return <></>

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {
                new Array(collapsed ? count : 1).fill("").map((ctx: any, idx: number) => {
                    return (
                        <MachineGroup key={idx}>
                            {
                                [
                                    ["IP", "ip/sn"],
                                    [
                                        intl.formatMessage({ id: "report.server.distro", defaultMessage: "机型" }),
                                        "distro"
                                    ],
                                    ["CPU", "cpu_info"],
                                    [
                                        intl.formatMessage({ id: "report.server.memory_info", defaultMessage: "内存" }),
                                        "memory_info"
                                    ],
                                    [
                                        intl.formatMessage({ id: "report.server.disk", defaultMessage: "磁盘" }),
                                        "disk"
                                    ],
                                    [
                                        intl.formatMessage({ id: "report.server.ether", defaultMessage: "网络" }),
                                        "ether"
                                    ],
                                    ["OS", "os"],
                                    ["Kernel", "kernel"],
                                    ["GCC", "gcc"],
                                    ["Glibc", "glibc"],
                                    // ["RPM", "rpm"],
                                ].map((tm: any, i: number) => {
                                    const [title, field] = tm
                                    return (
                                        <Row key={i}>
                                            <MachineGroupL style={{ background: '#fafafa' }}>
                                                {title}
                                            </MachineGroupL>
                                            {
                                                new Array(group).fill("").map((item: any, index: number) => {
                                                    const title = envData[index]?.server_info?.[idx]?.[field] || "-"
                                                    return (
                                                        <MachineGroupR
                                                            gLen={group}
                                                            key={index}
                                                        >
                                                            <Typography.Text
                                                                ellipsis={{
                                                                    tooltip: {
                                                                        title: (
                                                                            <span
                                                                                dangerouslySetInnerHTML={{
                                                                                    __html: title.replace(/\n/g, "<br />")
                                                                                }}
                                                                            />
                                                                        )
                                                                    }
                                                                }}
                                                            >
                                                                {title}
                                                            </Typography.Text>
                                                        </MachineGroupR>
                                                    )
                                                })
                                            }
                                        </Row>
                                    )
                                })
                            }
                        </MachineGroup>
                    )
                })
            }
            {
                (count > 1 && !collapsed) &&
                <CollapsedSpan
                    onClick={() => setCollapsed(true)}
                >
                    <Tooltip
                        title={
                            intl.formatMessage({
                                id: "report.server.collapsed.tooltip.title",
                                defaultMessage: "展开查看更多机器信息"
                            })
                        }
                    >
                        <span>
                            <DoubleRightOutlined style={{ transform: "rotate(90deg)", transformOrigin: "center" }} />
                        </span>
                    </Tooltip>
                </CollapsedSpan>
            }
        </div>
    )
}