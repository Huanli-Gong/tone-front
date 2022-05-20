import React, { useContext , memo } from 'react';
import { SettingTextArea } from './EditPublic';
import { ReportContext } from '../Provider';
import { Tooltip } from 'antd';
import _ from 'lodash'; 
import Identify from '@/pages/WorkSpace/TestAnalysis/AnalysisResult/components/Identify';
import {
    ModuleWrapper,
    EditTitle,
    SubTitle,
    EnvGroup,
    EnvGroupL,
    MachineGroup,
    MachineGroupL,
    MachineGroupR,
} from '../ReportUI';

const ReportTestEnv = () => {
    const { 
        btnState, 
        saveReportData,
        obj, 
        setObj, 
        envData, 
        baselineGroupIndex, 
        environmentResult,
        routeName,
        btnConfirm,
        groupLen,
    } = useContext(ReportContext)
    const handleChangeVal = (val: any, text: string) => {
        if(environmentResult && environmentResult !== undefined){
            let env = _.cloneDeep(environmentResult) 
            env[text] = val
            if( routeName !== 'Report') env.base_index = baselineGroupIndex
            obj.test_env = env
            setObj({
                ...obj,
            })
        }
    }
    // 获取最多行展示
    const len = Array.from(Array(environmentResult?.count)).map(val => ({}))
    return (
        <ModuleWrapper style={{ width: groupLen > 3 ? groupLen * 390 : 1200 }} id="need_test_env" className="position_mark">
            <SubTitle><span className="line"></span>测试环境</SubTitle>
            <EditTitle>环境描述</EditTitle>
            <SettingTextArea
                name={saveReportData?.test_env?.text}
                btnConfirm={btnConfirm}
                defaultHolder="请输入环境描述"
                btn={btnState}
                fontStyle={{
                    fontSize:14,
                    fontFamily:'PingFangSC-Regular',
                    color:'rgba(0,0,0,0.65)',
                    whiteSpace: 'pre-line',
                }}
                onOk={(val: any) => handleChangeVal(val, 'text')}
            />
            <EditTitle style={{ margin: '17px 0 14px 0' }}>机器环境</EditTitle>
            <EnvGroup>
                <EnvGroupL>对比组名称</EnvGroupL>
                <Identify envData={envData} group={groupLen}/>
            </EnvGroup>
            {/* 机器信息 */}
            {
                len.map((item: any, i: number) => (
                    <MachineGroup key={i}>
                        <MachineGroupL style={{ background: '#fafafa' }}>IP{`${!BUILD_APP_ENV ? "/SN" : ""}`}</MachineGroupL>
                        {
                            Array.isArray(envData) && !!envData.length && envData.map((server: any, index: number) => {
                                const len = Array.from(Array(environmentResult?.count - server.server_info.length)).map(val => ({}))
                                return server.server_info.concat(len).map((item: any, idx: number) => (
                                    i === idx && <MachineGroupR style={{ background: '#fafafa', color: '#1890FF' }} gLen={groupLen} key={idx}>
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
                                    i === idx && <MachineGroupR gLen={groupLen} key={idx}>
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
                                    i === idx && <MachineGroupR gLen={groupLen} key={idx}>
                                        <span>{item.os || '-'}</span>
                                    </MachineGroupR>
                                ))
                            })
                        }
                        <MachineGroupL>RPM</MachineGroupL>
                        {
                            Array.isArray(envData) && !!envData.length && envData.map((server: any, index: number) => {
                                const len = Array.from(Array(environmentResult?.count - server.server_info.length)).map(val => ({}))
                                return  server.server_info.concat(len).map((item: any, idx: number) => (
                                    i === idx && <MachineGroupR gLen={groupLen} key={idx}>
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
                            Array.isArray(envData) && !!envData.length && envData.map((server: any, index: number) => {
                                const len = Array.from(Array(environmentResult?.count - server.server_info.length)).map(val => ({}))
                                return  server.server_info.concat(len).map((item: any, idx: number) => (
                                    i === idx &&  <MachineGroupR gLen={groupLen} key={idx}>
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

