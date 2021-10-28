import React, { memo } from 'react'
import { PreviewTableTr, FullRow, CustomRow } from '../styled'
import { Typography , Space } from 'antd'

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
        <PreviewTableTr><Typography.Text strong>对比组</Typography.Text></PreviewTableTr>
        <PreviewTableTr>
            <Space>
                <BaseGroupIcon style={{ transform: 'translateY(2px)'}}/>
                <Typography.Text strong>基准组</Typography.Text>
            </Space>
        </PreviewTableTr>
        <PreviewTableTr><Typography.Text strong>对比组1</Typography.Text></PreviewTableTr>
        <PreviewTableTr><Typography.Text strong>对比组2</Typography.Text></PreviewTableTr>
    </FullRow>
)

const TestEnv = (props: any) => {
    const {
        need_test_env,
        need_env_description
    } = props

    if (need_test_env || need_env_description)
        return (
            <CustomRow id={'need_test_env'}>
                <div><Typography.Title level={5} >测试环境</Typography.Title></div>
                {
                    need_env_description &&
                    <>
                        <EnvTitle><Typography.Text strong>环境描述</Typography.Text></EnvTitle>
                        <div><Typography.Text >此处内容需生成报告后手动填写</Typography.Text></div>
                    </>
                }
                {
                    (need_test_env && need_env_description) && <br />
                }
                {
                    need_test_env &&
                    <>
                        <EnvTitle><Typography.Text strong>机器环境</Typography.Text></EnvTitle>
                        <GroupTableRow />
                        <EnvTableHeaderRow title={'IP/SN'} />
                        <EnvTableRow title={'机型'} />
                        <EnvTableRow title={'RPM'} />
                        <EnvTableRow title={'GCC'} />
                    </>
                }
            </CustomRow>
        )

    return <></>
}

export default memo(TestEnv)