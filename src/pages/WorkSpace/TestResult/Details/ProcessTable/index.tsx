import React , { useImperativeHandle, useState } from 'react'
import { matchTestType } from '@/utils/utils'
import { useIntl, FormattedMessage } from 'umi'
import TestBuildTable from './TestBuildTable'
import TestPrepTable from './TestPrepTable'
import TestSuiteTable from './TestSuiteTable'
import MonitorConfigTable from './MonitorConfigTable'

// 结果详情 - 执行过程
export default ({ job_id , onRef, test_type, provider_name } : any ) => {
    const [ refresh , setRefresh ] = useState( false )
    const testType = matchTestType(test_type)

    useImperativeHandle(
        onRef,
        () => ({
            refresh : () => {
                setRefresh( !refresh )
            }
        })
    )

    return (
        <div style={{ background: '#fff' }}>
            <div style={{ background: '#F5F5F5' }}>
                <TestBuildTable job_id={job_id} refresh={refresh} />
                <TestPrepTable job_id={job_id} refresh={refresh} provider_name={provider_name}/>
                <MonitorConfigTable job_id={job_id} refresh={refresh} provider_name={provider_name}/>
		        <TestSuiteTable job_id={job_id} refresh={refresh} testType={testType} provider_name={provider_name}/>
            </div>
        </div>
    )
}
