import React, { useContext, memo } from 'react';
import { SettingTextArea } from './EditPublic';
import { ReportContext } from '../Provider';
import _ from 'lodash';
import Identify from '@/pages/WorkSpace/TestAnalysis/AnalysisResult/components/Identify';
import {
    ModuleWrapper,
    EditTitle,
    SubTitle,
    EnvGroup,
    EnvGroupL,
} from '../ReportUI';
import { TestEnv } from '@/components/ReportAnalysis/TestEnv';

const ReportTestEnv = () => {
    const {
        btnState,
        saveReportData,
        obj,
        setObj,
        envData,
        compareGroupData,
        baselineGroupIndex,
        environmentResult,
        routeName,
        btnConfirm,
        groupLen,
        domainResult,
    } = useContext(ReportContext)


    const handleChangeVal = (val: any, text: string) => {
        if (environmentResult && JSON.stringify(environmentResult) !== '{}') {
            if (_.isUndefined(compareGroupData)) {
                obj.test_env = {
                    text: val
                }
            } else {
                let env = _.cloneDeep(environmentResult)
                env[text] = val
                env.base_group = compareGroupData.base_group
                env.compare_groups = compareGroupData.compare_groups
                if (routeName !== 'Report') env.base_index = baselineGroupIndex
                obj.test_env = env
            }
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
                name={saveReportData?.test_env?.text || domainResult?.env_description_desc}
                btnConfirm={btnConfirm}
                defaultHolder="请输入环境描述"
                btn={btnState}
                onOk={(val: any) => handleChangeVal(val, 'text')}
            />
            <EditTitle style={{ margin: '17px 0 14px 0' }}>机器环境</EditTitle>
            <EnvGroup>
                <EnvGroupL>对比组名称</EnvGroupL>
                <Identify envData={envData} group={groupLen} />
            </EnvGroup>
            {/* 机器信息 */}
            <TestEnv len={len} envData={envData} environmentResult={environmentResult} group={groupLen} />
        </ModuleWrapper>
    )
}
export default memo(ReportTestEnv)

