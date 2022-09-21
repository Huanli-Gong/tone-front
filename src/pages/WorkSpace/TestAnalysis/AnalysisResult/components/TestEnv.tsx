import React, { useContext , memo } from 'react';
import { ReportContext } from '../Provider';
import { useIntl, FormattedMessage, getLocale } from 'umi'
import _ from 'lodash'; 
import Identify from '@/pages/WorkSpace/TestAnalysis/AnalysisResult/components/Identify';
import {
    ModuleWrapper,
    SubTitle,
    EnvGroup,
    EnvGroupL,
} from '../AnalysisUI';
import { TestEnv } from '@/components/ReportAnalysis/TestEnv';

const ReportTestEnv = () => {
    const {
        envData,
        environmentResult,
        group,
    } = useContext(ReportContext)

    const locale = getLocale() === 'en-US'

    // 获取最多行展示
    const len = Array.from(Array(environmentResult?.count)).map(val => ({}))
    return (
        <ModuleWrapper id="need_test_env">
            <SubTitle><span className="line"></span>
                <FormattedMessage id="analysis.test.env" />
            </SubTitle>
            <EnvGroup>
                <EnvGroupL enLocale={locale}><FormattedMessage id="analysis.comparison.group.name" /></EnvGroupL>
                <Identify enLocale={locale} envData={envData} group={group}/>
            </EnvGroup>
            {/* 机器信息 */}
            <TestEnv len={len} envData={envData} environmentResult={environmentResult} group={group}/>
            {/*
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
                        <MachineGroupL><FormattedMessage id="analysis.model" /></MachineGroupL>
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
                        <MachineGroupL>RPM</MachineGroupL>
                        {
                            Array.isArray(envData) && !!envData.length && envData.map((server: any, index: number) => {
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
                    </MachineGroup>
                ))
                    */}
        </ModuleWrapper>
    )
}
export default memo(ReportTestEnv)