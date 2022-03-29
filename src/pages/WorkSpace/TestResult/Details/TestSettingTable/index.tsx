import { Spin } from 'antd'
import React, { useMemo } from 'react'
import { useRequest, useParams } from 'umi'
import { matchTestType } from '@/utils/utils'
import { querySettingConfig } from '../service'

import TestSuiteServerTable from './TestSuiteServerTable'

import EnvForm from './FormEnv'
import MoreForm from './FormMore'
import { queryJobTypeItems } from '@/pages/WorkSpace/JobTypeManage/CreateJobType/services'

//测试配置 index
export default ({ jt_id, test_type, provider_name }: any) => {
    const { id: job_id, ws_id } = useParams() as any
    const testType = matchTestType(test_type)
    const { data, loading } = useRequest(
        () => querySettingConfig({ job_id }),
        {
            initialData: {
                test_config: []
            },
            formatResult: r => {
                if (r.code === 200)
                    return r.data[0]
                return {
                    test_config: []
                }
            }
        }
    )

    const { data: items } = useRequest(() => queryJobTypeItems({ jt_id }), { initialData: [] })

    const contrl = useMemo(() => {
        const basic = {}, env = {}, suite = {}, more = {}
        items.forEach((i: any) => {
            if (i.config_index === 1) basic[i.name] = i
            if (i.config_index === 2) env[i.name] = i
            if (i.config_index === 3) suite[i.name] = i
            if (i.config_index === 4) more[i.name] = i
        })

        return { basic, env, suite, more }
    }, [items])

    return (
        <div style={{ background: '#fff' }}>
            <Spin spinning={loading} >
                <div style={{ background: '#F5F5F5' }}>
                    <EnvForm contrl={contrl.env} disabled={true} template={data} />
                    {/* <EnvPrepTable  { ...data } /> */}
                    <TestSuiteServerTable data={data?.test_config} testType={testType} provider_name={provider_name} />
                    <MoreForm contrl={contrl.more} disabled={true} template={data} />
                    {/* <EnvMoreTable  { ...data } /> */}
                </div>
            </Spin>
        </div>
    )
}