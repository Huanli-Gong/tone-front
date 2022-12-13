import React from "react";
import {
    MachineGroup,
    MachineGroupL,
    MachineGroupR,
} from './TestEnvUI';
import EllipsisPulic from '@/components/Public/EllipsisPulic';
import { Row } from "antd";
interface EnvType {
    len?: any[],
    envData?: any[],
    environmentResult?: any,
    group?: number,
}

export const TestEnv: React.FC<EnvType> = ({ envData, environmentResult, group }) => {
    const { count } = environmentResult
    if (!envData) return <></>
    return (
        <>
            {
                new Array(count).fill("").map((ctx: any, idx: number) => {
                    return <MachineGroup key={idx}>
                        {
                            [
                                ["IP", "ip/sn"],
                                ["OS", "os"],
                                ["Kernel", "kernel"],
                                ["Glibc", "glibc"],
                                ["GCC", "gcc"],
                                // ["机型", "distro"],
                                // ["RPM", "rpm"],
                                // ["内存", "memory_info"],
                                // ["CPU", "cpu_info"],
                                // ["磁盘", "disk"],
                                // ["网卡信息", "ether"],
                            ].map((tm: any, i: number) => {
                                const [title, field] = tm
                                return (
                                    <Row key={i}>
                                        <MachineGroupL style={{ background: '#fafafa' }}>
                                            {title}
                                        </MachineGroupL>
                                        {
                                            new Array(group).fill("").map((item: any, index: number) => {
                                                const title = envData[index]?.server_info?.[idx][field] || "-"
                                                return (
                                                    <MachineGroupR
                                                        gLen={group}
                                                        key={index}
                                                    >
                                                        <EllipsisPulic
                                                            title={title}
                                                        >
                                                            {title}
                                                        </EllipsisPulic>
                                                    </MachineGroupR>
                                                )
                                            })
                                        }
                                    </Row>
                                )
                            })
                        }
                    </MachineGroup>
                })
            }
        </>
    )
}