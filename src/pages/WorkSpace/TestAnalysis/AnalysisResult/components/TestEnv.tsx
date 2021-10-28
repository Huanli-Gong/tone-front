import React, { useContext , memo } from 'react';
import { ReportContext } from '../Provider';
import { Tooltip, Space } from 'antd';
import _ from 'lodash'; 
import { ReactComponent as BaseIcon } from '@/assets/svg/Report/BaseIcon.svg';
import EllipsisPulic from '@/components/Public/EllipsisPulic';
import {
    ModuleWrapper,
    SubTitle,
    EnvGroup,
    EnvGroupL,
    EnvGroupR,
    MachineGroup,
    MachineGroupL,
    MachineGroupR,
} from '../AnalysisUI';

const ReportTestEnv = () => {
    const { 
        allGroupData, 
        envData, 
        baselineGroupIndex, 
        environmentResult,
    } = useContext(ReportContext)

    let group = allGroupData?.length
    
    // 获取最多行展示
    const len = Array.from(Array(environmentResult?.count)).map(val => ({}))
    return (
        <ModuleWrapper id="need_test_env">
            <SubTitle><span className="line"></span>测试环境</SubTitle>
            {/* <EditTitle style={{ margin: '17px 0 14px 0' }}>机器环境</EditTitle> */}
            <EnvGroup>
                <EnvGroupL>对比组名称</EnvGroupL>
                {
                    Array.isArray(envData) && envData.length > 0 && envData.map((item: any, idx: number) => {
                        return (
                            <EnvGroupR gLen={group} key={idx}>
                                <Space>
                                    {item.is_base && <BaseIcon style={{ marginRight: 4, marginTop: 17 }} title="基准组"/> }
                                </Space>
                                <EllipsisPulic title={item.tag} />
                            </EnvGroupR>
                        )
                    })
                }
            </EnvGroup>
            {/* 机器信息 */}
            {
                len.map((item: any, i: number) => (
                    <MachineGroup key={i}>
                        <MachineGroupL style={{ background: '#fafafa' }}>IP/SN</MachineGroupL>
                        {
                            Array.isArray(envData) && envData.length > 0 && envData.map((server: any, index: number) => {
                                const len = Array.from(Array(environmentResult?.count - server.server_info.length)).map(val => ({}))
                                return server.server_info.concat(len).map((item: any, idx: number) => (
                                    i === idx && <MachineGroupR style={{ background: '#fafafa', color: '#1890FF' }} gLen={group} key={idx}>
                                        <span onClick={() => window.open(`https://sa.alibaba-inc.com/ops/terminal.html?&source=tone&ip=${item['ip/sn']}`)} style={{ cursor: 'pointer' }}>
                                            <span>{item['ip/sn'] || '-'}</span>
                                        </span>
                                    </MachineGroupR>
                                ))
                            })
                        }
                        <MachineGroupL>机型</MachineGroupL>
                        {
                            Array.isArray(envData) && envData.length > 0 && envData.map((server: any, index: number) => {
                                const len = Array.from(Array(environmentResult?.count - server.server_info.length)).map(val => ({}))
                                return server.server_info.concat(len).map((item: any, idx: number) => (
                                    i === idx && <MachineGroupR gLen={group} key={idx}>
                                        <span>{item.distro || '-'}</span>
                                    </MachineGroupR>
                                ))
                            })
                        }
                        <MachineGroupL>RPM</MachineGroupL>
                        {
                            Array.isArray(envData) && envData.length > 0 && envData.map((server: any, index: number) => {
                                const len = Array.from(Array(environmentResult?.count - server.server_info.length)).map(val => ({}))
                                return  server.server_info.concat(len).map((item: any, idx: number) => (
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
                        <MachineGroupL>GCC</MachineGroupL>
                        {
                            Array.isArray(envData) && envData.length > 0 && envData.map((server: any, index: number) => {
                                const len = Array.from(Array(environmentResult?.count - server.server_info.length)).map(val => ({}))
                                return  server.server_info.concat(len).map((item: any, idx: number) => (
                                    i === idx &&  <MachineGroupR gLen={group} key={idx}>
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
                    </MachineGroup>
                ))
            }
        </ModuleWrapper>
    )
}
export default memo(ReportTestEnv)