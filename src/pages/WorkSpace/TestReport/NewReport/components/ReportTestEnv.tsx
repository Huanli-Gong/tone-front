import { useContext, memo } from 'react';
import { useIntl, FormattedMessage } from 'umi';
import { SettingTextArea, SettingRegUpdate } from './EditPublic';
import { ReportContext } from '../Provider';
import _ from 'lodash';
import Identify from '@/pages/WorkSpace/TestAnalysis/AnalysisResult/components/Identify';
import { TestEnv } from '@/components/ReportAnalysis/TestEnv';
import {
    ModuleWrapper,
    EditTitle,
    SubTitle,
    EnvGroup,
    EnvGroupL,
} from '../ReportUI';

const ReportTestEnv = () => {
    const { formatMessage } = useIntl()
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
        creator
    } = useContext(ReportContext)

    const handleChangeVal = (val: any, text: string) => {
        if (environmentResult && JSON.stringify(environmentResult) !== '{}') {
            if (_.isUndefined(compareGroupData)) {
                obj.test_env = {
                    text: val
                }
            } else {
                const env = _.cloneDeep(environmentResult)
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

    return (
        <ModuleWrapper style={{ width: groupLen > 3 ? groupLen * 390 : 1200 }} id="need_test_env" className="position_mark">
            <SubTitle><span className="line" /><FormattedMessage id="report.test.env" /></SubTitle>
            {
                (domainResult?.is_default || (!domainResult?.is_default && domainResult?.need_env_description)) &&
                <>
                    <EditTitle><FormattedMessage id="report.env.description" /></EditTitle>
                    {
                        saveReportData?.id ?
                            <SettingRegUpdate
                                saveData={saveReportData}
                                field='text'
                                defaultHolder={formatMessage({ id: 'report.please.enter.description' })}
                                creator={creator}
                            />
                            :
                            <SettingTextArea
                                name={saveReportData?.test_env?.text || domainResult?.env_description_desc}
                                btnConfirm={btnConfirm}
                                defaultHolder={formatMessage({ id: 'report.please.enter.description' })}
                                btn={btnState}
                                onOk={(val: any) => handleChangeVal(val, 'text')}
                            />
                    }
                </>
            }

            <EditTitle style={{ margin: '17px 0 14px 0' }}><FormattedMessage id="report.server.env" /></EditTitle>
            <EnvGroup>
                <EnvGroupL><FormattedMessage id="report.comparison.group.name" /></EnvGroupL>
                <Identify envData={envData} group={groupLen} />
            </EnvGroup>
            {/* 机器信息 */}
            <TestEnv envData={envData} environmentResult={environmentResult} group={groupLen} />
        </ModuleWrapper>
    )
}
export default memo(ReportTestEnv)

