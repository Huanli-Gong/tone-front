import React, { memo } from 'react'
import { PreviewTableTr, FullRow, CustomRow } from '../styled'
import { Typography, Space } from 'antd'
import { useIntl, FormattedMessage } from 'umi'
import styled from 'styled-components'
import { ReactComponent as BaseGroupIcon } from '@/assets/svg/TestReport/BaseIcon.svg'
import { useServerConfigArray } from '@/utils/utils'

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
    <FullRow style={{ marginBottom: 8, borderBottom: '1px solid rgba(0,0,0,0.10)' }} height={48}>
        <PreviewTableTr><Typography.Text strong><FormattedMessage id="report.comparison.group" /></Typography.Text></PreviewTableTr>
        <PreviewTableTr>
            <Space>
                <BaseGroupIcon style={{ transform: 'translateY(2px)' }} />
                <Typography.Text strong><FormattedMessage id="report.benchmark.group" /></Typography.Text>
            </Space>
        </PreviewTableTr>
        <PreviewTableTr><Typography.Text strong><FormattedMessage id="report.comparison.group1" /></Typography.Text></PreviewTableTr>
        <PreviewTableTr><Typography.Text strong><FormattedMessage id="report.comparison.group2" /></Typography.Text></PreviewTableTr>
    </FullRow>
)

const TestEnv: React.FC<any> = (props) => {
    const { formatMessage } = useIntl()
    const {
        env_description_desc,
        need_test_env,
        need_env_description,
        server_info_config
    } = props

    const serverConfig = useServerConfigArray()
    const serverConfMap = new Map(serverConfig.map(([n, val]) => ([val, n])))

    if (need_test_env || need_env_description)
        return (
            <CustomRow id={'need_test_env'}>
                <div>
                    <Typography.Title level={5} >
                        <FormattedMessage id="report.test.env" />
                    </Typography.Title>
                </div>
                {
                    need_env_description &&
                    <>
                        <EnvTitle>
                            <Typography.Text strong>
                                <FormattedMessage id="report.env.description" />
                            </Typography.Text>
                        </EnvTitle>
                        <div>
                            <Typography.Text>
                                {env_description_desc || formatMessage({ id: 'report.not.filled.in' })}
                            </Typography.Text>
                        </div>
                    </>
                }
                {
                    (need_test_env && need_env_description) && <br />
                }
                {
                    need_test_env &&
                    <>
                        <EnvTitle><Typography.Text strong><FormattedMessage id="report.server.env" /></Typography.Text></EnvTitle>
                        <GroupTableRow />
                        {
                            server_info_config.map((w: string) => (
                                <EnvTableRow
                                    title={serverConfMap.get(w)}
                                    key={w}
                                />
                            ))
                        }
                    </>
                }
            </CustomRow>
        )

    return <></>
}

export default memo(TestEnv)