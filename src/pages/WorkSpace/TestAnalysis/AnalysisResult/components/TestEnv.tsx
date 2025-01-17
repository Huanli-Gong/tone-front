/* eslint-disable @typescript-eslint/dot-notation */
/* eslint-disable no-param-reassign */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable react/no-array-index-key */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-shadow */

import { useContext, memo } from 'react';
import { ReportContext } from '../Provider';
import { FormattedMessage, getLocale } from 'umi'
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

    return (
        <ModuleWrapper id="need_test_env">
            <SubTitle><span className="line" />
                <FormattedMessage id="analysis.test.env" />
            </SubTitle>
            <EnvGroup>
                <EnvGroupL enLocale={locale}><FormattedMessage id="analysis.comparison.group.name" /></EnvGroupL>
                <Identify enLocale={locale} envData={envData} group={group} />
            </EnvGroup>
            {/* 机器信息 */}
            <TestEnv envData={envData} environmentResult={environmentResult} group={group} />
        </ModuleWrapper>
    )
}
export default memo(ReportTestEnv)