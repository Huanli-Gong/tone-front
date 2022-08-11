import React from "react";
import { Tooltip } from 'antd';
import {
    MachineGroup,
    MachineGroupL,
    MachineGroupR,
} from './TestEnvUI';

interface EnvType {
    len: Array<{}>,
    envData: Array<{}>,
    environmentResult: any,
    group: number,
}

export const TestEnv: React.FC<EnvType> = ({ len, envData, environmentResult, group }) => {
    return (
        <>
            {
                len.map((item: any, i: number) => (
                    <MachineGroup key={i}>
                        <MachineGroupL style={{ background: '#fafafa' }}>IP</MachineGroupL>
                        {
                            Array.isArray(envData) && !!envData.length && envData.map((server: any, index: number) => {
                                const len = Array.from(Array(environmentResult?.count - server.server_info.length)).map(val => ({}))
                                return server.server_info.concat(len).map((item: any, idx: number) => (
                                    i === idx && <MachineGroupR style={{ background: '#fafafa' }} gLen={group} key={idx}>
                                        <span>{item['ip/sn'] || '-'}</span>
                                    </MachineGroupR>
                                ))
                            })
                        }
                        <MachineGroupL>机型</MachineGroupL>
                        {
                            Array.isArray(envData) && !!envData.length && envData.map((server: any, index: number) => {
                                const len = Array.from(Array(environmentResult?.count - server.server_info.length)).map(val => ({}))
                                return server.server_info.concat(len).map((item: any, idx: number) => (
                                    i === idx && <MachineGroupR gLen={group} key={idx}>
                                        <span>{item.distro || '-'}</span>
                                    </MachineGroupR>
                                ))
                            })
                        }
                        <MachineGroupL>OS</MachineGroupL>
                        {
                            Array.isArray(envData) && !!envData.length && envData.map((server: any, index: number) => {
                                const len = Array.from(Array(environmentResult?.count - server.server_info.length)).map(val => ({}))
                                return server.server_info.concat(len).map((item: any, idx: number) => (
                                    i === idx && <MachineGroupR gLen={group} key={idx}>
                                        <span>{item.os || '-'}</span>
                                    </MachineGroupR>
                                ))
                            })
                        }
                        <MachineGroupL>Kernel</MachineGroupL>
                        {
                            Array.isArray(envData) && !!envData.length && envData.map((server: any, index: number) => {
                                const len = Array.from(Array(environmentResult?.count - server.server_info.length)).map(val => ({}))
                                return server.server_info.concat(len).map((item: any, idx: number) => (
                                    i === idx && <MachineGroupR gLen={group} key={idx}>
                                        <span>{item.kernel || '-'}</span>
                                    </MachineGroupR>
                                ))
                            })
                        }
                        <MachineGroupL>GCC</MachineGroupL>
                        {
                            Array.isArray(envData) && !!envData.length && envData.map((server: any, index: number) => {
                                const len = Array.from(Array(environmentResult?.count - server.server_info.length)).map(val => ({}))
                                return server.server_info.concat(len).map((item: any, idx: number) => (
                                    i === idx && <MachineGroupR gLen={group} key={idx}>
                                        <Tooltip
                                            placement="bottomLeft"
                                            autoAdjustOverflow={false}
                                            overlayStyle={{ maxWidth: 540, maxHeight: 360, overflowY: 'auto' }}
                                            title={item.gcc}>
                                            <span className="enviroment_child">{item.gcc || '-'}</span>
                                        </Tooltip>
                                    </MachineGroupR>
                                ))
                            })
                        }
                        <MachineGroupL>RPM</MachineGroupL>
                        {
                            Array.isArray(envData) && !!envData.length && envData.map((server: any, index: number) => {
                                const len = Array.from(Array(environmentResult?.count - server.server_info.length)).map(val => ({}))
                                return server.server_info.concat(len).map((item: any, idx: number) => (
                                    i === idx && <MachineGroupR gLen={group} key={idx}>
                                        <Tooltip
                                            placement="bottomLeft"
                                            autoAdjustOverflow={false}
                                            title={<div>{item.rpm?.map((i: any, idx: number) => (<span key={idx}>{i}<br /></span>))}</div>}
                                            overlayStyle={{ maxWidth: 540, maxHeight: 360, overflowY: 'auto' }}
                                        >
                                            <span className="enviroment_child">{item.rpm || '-'}</span>
                                        </Tooltip>
                                    </MachineGroupR>
                                ))
                            })
                        }
                    </MachineGroup>
                ))
            }
        </>
    )
}