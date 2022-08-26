import React, { useContext, memo } from 'react';
import { ReportContext } from '../Provider';
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

    // 获取最多行展示
    const len = Array.from(Array(environmentResult?.count)).map(val => ({}))
    return (
        <ModuleWrapper id="need_test_env">
            <SubTitle><span className="line"></span>测试环境</SubTitle>
            <EnvGroup>
                <EnvGroupL>对比组名称</EnvGroupL>
                <Identify envData={envData} group={group} />
            </EnvGroup>
            {/* 机器信息 */}
            <TestEnv len={len} envData={envData} environmentResult={environmentResult} group={group}/>
        </ModuleWrapper>
    )
}
export default memo(ReportTestEnv)