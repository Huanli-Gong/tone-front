import React, { useContext, memo } from 'react';
import { SettingTextArea, SettingRegUpdate } from './EditPublic';
import { ReportContext } from '../Provider';
import { ModuleWrapper, SubTitle } from '../ReportUI';
import _ from 'lodash';
const ReportBasicInfo = (props: any) => {
    const { btnState, obj, setObj, saveReportData, summaryData, btnConfirm, domainResult } = useContext(ReportContext)
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
            {domainResult?.is_default ?
                <>
                    <ModuleWrapper id="need_test_background" className="position_mark">
                        <SubTitle><span className="line"></span>测试背景</SubTitle>
                        {
                            saveReportData?.id ?
                            <SettingRegUpdate
                                saveData={saveReportData}
                                field='test_background'
                                defaultHolder="请输入测试背景"
                            />
                            :
                            <SettingTextArea
                                name={saveReportData?.test_background}
                                btnConfirm={btnConfirm}
                                defaultHolder="请输入测试背景"
                                btn={btnState}
                                onOk={(val: any) => handleChangeVal(val, 'test_background')}
                            />
                        }
                    </ModuleWrapper>
                    <ModuleWrapper id="need_test_method" className="position_mark">
                        <SubTitle><span className="line"></span>测试方法</SubTitle>
                        {
                            saveReportData?.id ?
                            <SettingRegUpdate
                                saveData={saveReportData}
                                field='test_method'
                                defaultHolder="请输入测试方法"
                            />
                            :
                            <SettingTextArea
                                name={saveReportData?.test_method}
                                defaultHolder="请输入测试方法"
                                btn={btnState}
                                btnConfirm={btnConfirm}
                                onOk={(val: any) => handleChangeVal(val, 'test_method')}
                            />
                        }
                    </ModuleWrapper>
                    <ModuleWrapper id="need_test_conclusion" className="position_mark">
                        <SubTitle><span className="line"></span>测试结论</SubTitle>
                        {
                            saveReportData?.id ?
                            <SettingRegUpdate
                                saveData={saveReportData}
                                field='custom'
                                defaultHolder="请输入测试结论"
                            />
                            :
                            <SettingTextArea
                                name={saveReportData?.test_conclusion?.custom}
                                btn={btnState}
                                defaultHolder="请输入测试结论"
                                btnConfirm={btnConfirm}
                                onOk={(val: any) => handleChangeVal(val, 'custom')}
                            />
                        }
                    </ModuleWrapper>
                </>
                :
                <>
                    {domainResult?.need_test_background && 
                    <ModuleWrapper id="need_test_background" className="position_mark">
                        <SubTitle><span className="line"></span>测试背景</SubTitle>
                        {
                            saveReportData?.id ?
                            <SettingRegUpdate
                                saveData={saveReportData}
                                field='test_background'
                                defaultHolder="请输入测试背景"
                            />
                            :
                            <SettingTextArea
                                name={saveReportData?.test_background || domainResult?.background_desc}
                                btnConfirm={btnConfirm}
                                defaultHolder="请输入测试背景"
                                btn={btnState}
                                onOk={(val: any) => handleChangeVal(val, 'test_background')}
                            />
                        }
                    </ModuleWrapper>
                    }
                    {domainResult?.need_test_method &&
                        <ModuleWrapper id="need_test_method" className="position_mark">
                            <SubTitle><span className="line"></span>测试方法</SubTitle>
                            {
                                 saveReportData?.id ?
                                 <SettingRegUpdate
                                     saveData={saveReportData}
                                     field='test_method'
                                     defaultHolder="请输入测试方法"
                                 />
                                 :
                                <SettingTextArea
                                    name={saveReportData?.test_method || domainResult?.test_method_desc}
                                    defaultHolder="请输入测试方法"
                                    btn={btnState}
                                    btnConfirm={btnConfirm}
                                    onOk={(val: any) => handleChangeVal(val, 'test_method')}
                                />
                            }
                            
                        </ModuleWrapper>}
                    {domainResult?.need_test_conclusion && 
                        <ModuleWrapper id="need_test_conclusion" className="position_mark">
                            <SubTitle><span className="line"></span>测试结论</SubTitle>
                            {
                                saveReportData?.id ?
                                <SettingRegUpdate
                                    saveData={saveReportData}
                                    field='custom'
                                    defaultHolder="请输入测试结论"
                                />
                                :
                                <SettingTextArea
                                    name={saveReportData?.test_conclusion?.custom || domainResult?.test_conclusion_desc}
                                    btn={btnState}
                                    defaultHolder="请输入测试结论"
                                    btnConfirm={btnConfirm}
                                    onOk={(val: any) => handleChangeVal(val, 'custom')}
                                />
                            }
                        </ModuleWrapper>
                    }
                </>
            }
        </>
    )
}
export default memo(ReportBasicInfo);