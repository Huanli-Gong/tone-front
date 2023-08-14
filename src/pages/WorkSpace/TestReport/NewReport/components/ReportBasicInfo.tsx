/* eslint-disable prefer-const */
import { useContext, memo } from 'react';
import { useIntl, FormattedMessage } from 'umi';
import { SettingTextArea, SettingRegUpdate } from './EditPublic';
import { ReportContext } from '../Provider';
import { ModuleWrapper, SubTitle } from '../ReportUI';
import _ from 'lodash';

const ReportBasicInfo = () => {
    const { formatMessage } = useIntl()
    const { btnState, obj, setObj, saveReportData, summaryData, btnConfirm, domainResult, creator } = useContext(ReportContext)

    const handleChangeVal = (val: any, text: string) => {
        if (text == 'custom') {
            if (summaryData && summaryData !== undefined) {
                let summary = _.cloneDeep(summaryData)
                summary[text] = val
                obj.test_conclusion = summary
            }
        } else {
            obj[text] = val
        }
        setObj({
            ...obj,
        })
    }

    return (
        <>
            {(domainResult?.is_default || (!domainResult?.is_default && domainResult?.need_test_background)) &&
                <ModuleWrapper id="need_test_background" className="position_mark">
                    <SubTitle><span className="line" /><FormattedMessage id="report.test.background" /></SubTitle>
                    {
                        saveReportData?.id ?
                            <SettingRegUpdate
                                saveData={saveReportData}
                                field='test_background'
                                defaultHolder={formatMessage({ id: 'report.please.enter.background' })}
                                creator={creator}
                            />
                            :
                            <SettingTextArea
                                name={saveReportData?.test_background || domainResult?.background_desc}
                                btnConfirm={btnConfirm}
                                defaultHolder={formatMessage({ id: 'report.please.enter.background' })}
                                btn={btnState}
                                onOk={(val: any) => handleChangeVal(val, 'test_background')}
                            />
                    }
                </ModuleWrapper>
            }
            {(domainResult?.is_default || (!domainResult?.is_default && domainResult?.need_test_method)) &&
                <ModuleWrapper id="need_test_method" className="position_mark">
                    <SubTitle><span className="line" /><FormattedMessage id="report.test.method" /></SubTitle>
                    {
                        saveReportData?.id ?
                            <SettingRegUpdate
                                saveData={saveReportData}
                                field='test_method'
                                defaultHolder={formatMessage({ id: 'report.please.enter.method' })}
                                creator={creator}
                            />
                            :
                            <SettingTextArea
                                name={saveReportData?.test_method || domainResult?.test_method_desc}
                                defaultHolder={formatMessage({ id: 'report.please.enter.method' })}
                                btn={btnState}
                                btnConfirm={btnConfirm}
                                onOk={(val: any) => handleChangeVal(val, 'test_method')}
                            />
                    }
                </ModuleWrapper>
            }
            {(domainResult?.is_default || (!domainResult?.is_default && domainResult?.need_test_conclusion)) &&
                <ModuleWrapper id="need_test_conclusion" className="position_mark">
                    <SubTitle><span className="line" /><FormattedMessage id="report.test.conclusion" /></SubTitle>
                    {
                        saveReportData?.id ?
                            <SettingRegUpdate
                                saveData={saveReportData}
                                field='custom'
                                defaultHolder={formatMessage({ id: 'report.please.enter.conclusion' })}
                                creator={creator}
                            />
                            :
                            <SettingTextArea
                                name={saveReportData?.test_conclusion?.custom || domainResult?.test_conclusion_desc}
                                btn={btnState}
                                defaultHolder={formatMessage({ id: 'report.please.enter.conclusion' })}
                                btnConfirm={btnConfirm}
                                onOk={(val: any) => handleChangeVal(val, 'custom')}
                            />
                    }
                </ModuleWrapper>
            }
        </>
    )
}
export default memo(ReportBasicInfo);