import React,{ useContext , memo } from 'react';
import { Row, Space } from 'antd';
import { SettingTextArea, SettingRegUpdate } from './EditPublic';
import styled from 'styled-components';
import { ReportContext } from '../Provider';
import {  ModuleWrapper } from '../ReportUI';
const CreateMsg = styled.span`
    color:rgba(0,0,0,0.45);
    font-size:14px;
`
const ReportHeader = () => {
    const { btnState, obj, setObj, saveReportData, btnConfirm } = useContext(ReportContext)
    const handleChangeVal = (val: any, text: string) => {
        obj[text] = val
        setObj({
            ...obj,
        })
    }
    return(
        <ModuleWrapper>
            <SettingTextArea 
                name={saveReportData?.name}
                btn={btnState}
                btnConfirm={btnConfirm}
                defaultHolder="请输入报告名称"
                space="14px"
                style={{ 
                    lineHeight:'40px',
                    marginBottom:8,
                }} 
                fontStyle={{
                    fontSize:32,
                    color:'rgba(0,0,0,0.85)',
                    fontFamily:'PingFangSC-Semibold',
                    whiteSpace: 'pre-wrap',
                }}
                onOk={(val: any) => handleChangeVal(val, 'name')}
            />
            {
                saveReportData?.id ?
                <SettingRegUpdate
                    saveData={saveReportData}
                    field='description'
                    style={{ marginBottom:8 }}
                    defaultHolder="请输入报告描述"
                />
                : 
                <SettingTextArea 
                    name={saveReportData?.description} 
                    btn={btnState} 
                    defaultHolder="请输入报告描述"
                    btnConfirm={btnConfirm}
                    style={{ marginBottom:8 }}
                    onOk={(val: any) => handleChangeVal(val, 'description')}
                />
            }
            
            { !btnState && <Row>
                <Space>
                    <CreateMsg>创建人&nbsp;{saveReportData?.creator_name}</CreateMsg>
                    <CreateMsg>创建时间&nbsp;{saveReportData?.gmt_created}</CreateMsg>
                </Space>
            </Row> }
        </ModuleWrapper>
    )
}
export default memo(ReportHeader);