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

    const RenderItem: React.FC<any> = ({ i, name, style = {} }) => {
        return (
            <>
                {
                    Array.isArray(envData) && !!envData.length && envData.map((server: any) => {
                        const len = Array.from(Array(environmentResult?.count - server.server_info.length)).map(val => ({}))
                        return server.server_info.concat(len).map((item: any, idx: number) => (
                            i === idx && <MachineGroupR style={style} gLen={group} key={idx}>
                                <span>{item[name] || '-'}</span>
                            </MachineGroupR>
                        ))
                    })
                }
            </>
        )
    }

    return (
        <>
            {
                len.map((item: any, i: number) => (
                    <MachineGroup key={i}>
                        {/* <MachineGroupL style={{ background: '#fafafa' }}>IP</MachineGroupL>
                        <RenderItem i={i} name='ip/sn' style={{ background: '#fafafa' }} /> */}
                        {/* <MachineGroupL>机型</MachineGroupL>
                        <RenderItem i={i} name='distro' /> */}
                        <MachineGroupL>OS</MachineGroupL>
                        <RenderItem i={i} name='os' />
                        <MachineGroupL>Kernel</MachineGroupL>
                        <RenderItem i={i} name='kernel' />
                        <MachineGroupL>Glibc</MachineGroupL>
                        <RenderItem i={i} name='glibc' />
                        {/* <MachineGroupL>内存</MachineGroupL>
                        <RenderItem i={i} name='memory_info' />
                        <MachineGroupL>CPU</MachineGroupL>
                        <RenderItem i={i} name='cpu_info' />
                        <MachineGroupL>磁盘</MachineGroupL>
                        <RenderItem i={i} name='disk' />
                        <MachineGroupL>网卡信息</MachineGroupL>
                        <RenderItem i={i} name='ether' /> */}
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
                        {/* <MachineGroupL>RPM</MachineGroupL>
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
                        } */}
                    </MachineGroup>
                ))
            }
        </>
    )
}