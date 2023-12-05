import { useImperativeHandle, useState } from 'react'
import { matchTestType } from '@/utils/utils'
import TestBuildTable from './TestBuildTable'
import TestPrepTable from './TestPrepTable'
import TestSuiteTable from './TestSuiteTable'
import MonitorConfigTable from './MonitorConfigTable'
import styled from 'styled-components'

const Wrapper = styled.div`
    background-color: #f5f5f5;
    & .ant-card:first-child {
        .ant-card-head-title {
            padding-top: 0;
        }
    }
`
// 结果详情 - 执行过程
export default ({ onRef, test_type, provider_name }: any) => {
    const [refresh, setRefresh] = useState<any>(new Date().getTime())
    const testType = matchTestType(test_type)

    useImperativeHandle(
        onRef,
        () => ({
            refresh: () => {
                setRefresh(new Date().getTime())
            }
        })
    )

    return (
        <div style={{ background: '#fff' }}>
            <Wrapper >
                <TestBuildTable refresh={refresh} />
                <TestPrepTable refresh={refresh} provider_name={provider_name} />
                <MonitorConfigTable refresh={refresh} provider_name={provider_name} />
                <TestSuiteTable refresh={refresh} testType={testType} provider_name={provider_name} />
            </Wrapper>
        </div>
    )
}
