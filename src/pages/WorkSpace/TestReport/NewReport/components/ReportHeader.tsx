import { useContext, memo } from 'react';
import { Row, Space } from 'antd';
import { useIntl, FormattedMessage } from 'umi';
import { SettingTextArea, SettingRegUpdate } from './EditPublic';
import styled from 'styled-components';
import { ReportContext } from '../Provider';
import { ModuleWrapper } from '../ReportUI';
const CreateMsg = styled.span`
    color:rgba(0,0,0,0.45);
    font-size:14px;
`
const ReportHeader = () => {
    const { formatMessage } = useIntl()
    const { btnState, obj, setObj, saveReportData, btnConfirm, creator } = useContext(ReportContext)
    const handleChangeVal = (val: any, text: string) => {
        obj[text] = val
        setObj({
            ...obj,
        })
    }
    return (
        <ModuleWrapper>
            <SettingTextArea
                name={saveReportData?.name}
                btn={btnState}
                btnConfirm={btnConfirm}
                defaultHolder={formatMessage({ id: 'report.please.enter.name' })}
                space="14px"
                style={{
                    lineHeight: '40px',
                    marginBottom: 8,
                }}
                fontStyle={{
                    fontSize: 32,
                    color: 'rgba(0,0,0,0.85)',
                    fontFamily: 'PingFangSC-Semibold',
                    whiteSpace: 'pre-wrap',
                }}
                onOk={(val: any) => handleChangeVal(val, 'name')}
            />
            {
                saveReportData?.id ?
                    <SettingRegUpdate
                        saveData={saveReportData}
                        field='description'
                        style={{ marginBottom: 8 }}
                        defaultHolder={formatMessage({ id: 'report.please.enter.desc' })}
                        creator={creator}
                    />
                    :
                    <SettingTextArea
                        name={saveReportData?.description}
                        btn={btnState}
                        defaultHolder={formatMessage({ id: 'report.please.enter.desc' })}
                        btnConfirm={btnConfirm}
                        style={{ marginBottom: 8 }}
                        fontStyle={{
                            fontSize: 14,
                            color: 'rgba(0,0,0,0.85)',
                            fontFamily: 'PingFangSC-Regular',
                            whiteSpace: 'pre-line',
                        }}
                        onOk={(val: any) => handleChangeVal(val, 'description')}
                    />
            }

            {!btnState && <Row>
                <Space>
                    <CreateMsg><FormattedMessage id="report.columns.creator" />&nbsp;{saveReportData?.creator_name}</CreateMsg>
                    <CreateMsg><FormattedMessage id="report.columns.gmt_created" />&nbsp;{saveReportData?.gmt_created}</CreateMsg>
                </Space>
            </Row>}
        </ModuleWrapper>
    )
}
export default memo(ReportHeader);