import React, { memo } from 'react'
import { PreviewTableTr, FullRow, CustomRow } from '../styled'
import { Typography , Space } from 'antd'
import { useIntl, FormattedMessage } from 'umi'
import styled from 'styled-components'
import { ReactComponent as BaseGroupIcon } from '@/assets/svg/TestReport/BaseIcon.svg'

const EnvTableHeader = styled(PreviewTableTr)`
    background: #FAFAFA;
`

const EnvTitle = styled.div`
    margin-bottom:8px;
`

const EnvTableHeaderRow: React.FC<any> = ({ title }) => (
    <FullRow>
        <EnvTableHeader><Typography.Text strong>{title}</Typography.Text></EnvTableHeader>
        <EnvTableHeader>-</EnvTableHeader>
        <EnvTableHeader>-</EnvTableHeader>
        <EnvTableHeader>-</EnvTableHeader>
    </FullRow>
)

const EnvTableRow: React.FC<any> = ({ title }) => (
    <FullRow>
        <PreviewTableTr><Typography.Text strong>{title}</Typography.Text></PreviewTableTr>
        <PreviewTableTr>-</PreviewTableTr>
        <PreviewTableTr>-</PreviewTableTr>
        <PreviewTableTr>-</PreviewTableTr>
    </FullRow>
)

const GroupTableRow = () => (
    <FullRow style={{ marginBottom: 8, borderBottom: '1px solid rgba(0,0,0,0.10)' }}>
        <PreviewTableTr><Typography.Text strong><FormattedMessage id="report.comparison.group"/></Typography.Text></PreviewTableTr>
        <PreviewTableTr>
            <Space>
                <BaseGroupIcon style={{ transform: 'translateY(2px)'}}/>
                <Typography.Text strong><FormattedMessage id="report.benchmark.group"/></Typography.Text>
            </Space>
        </PreviewTableTr>
        <PreviewTableTr><Typography.Text strong><FormattedMessage id="report.comparison.group1"/></Typography.Text></PreviewTableTr>
        <PreviewTableTr><Typography.Text strong><FormattedMessage id="report.comparison.group2"/></Typography.Text></PreviewTableTr>
    </FullRow>
)

const TestEnv = (props: any) => {
    const { formatMessage } = useIntl()
    const {
        need_test_env,
        need_env_description
    } = props

    if (need_test_env || need_env_description)
        return (
            <CustomRow id={'need_test_env'}>
                <div><Typography.Title level={5} ><FormattedMessage id="report.test.env"/></Typography.Title></div>
                {
                    need_env_description &&
                    <>
                        <EnvTitle><Typography.Text strong><FormattedMessage id="report.env.description"/></Typography.Text></EnvTitle>
                        <div><Typography.Text ><FormattedMessage id="report.content.needs.to.generate"/></Typography.Text></div>
                    </>
                }
                {
                    (need_test_env && need_env_description) && <br />
                }
                {
                    need_test_env &&
                    <>
                        <EnvTitle><Typography.Text strong><FormattedMessage id="report.server.env"/></Typography.Text></EnvTitle>
                        <GroupTableRow />
                        <EnvTableHeaderRow title={`IP${!BUILD_APP_ENV ? "/SN" : ""}`} />
                        <EnvTableRow title={formatMessage({id: 'report.model'})} />
                        <EnvTableRow title={'RPM'} />
                        <EnvTableRow title={'GCC'} />
                    </>
                }
            </CustomRow>
        )

    return <></>
}

export default memo(TestEnv)