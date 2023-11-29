/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react'
import { message, Spin } from 'antd'
import { FormattedMessage, useParams } from 'umi'

import { queryDevOpsConfig, updateDevOpsConfig } from './service'
import { OperationTabCard } from '@/components/UpgradeUI'

import ResultStatusType from './components/ResultStatusType'
import MatrixBranch from './components/Matrix'
import JobPeddingCount from './components/PendingJobNum'

import { DevOps } from './Provider'
import AutomaticRecovery from './components/AutomaticRecovery'

const DevOpsPage: React.FC<AnyType> = (props) => {
    const { ws_id } = useParams() as any
    const [loading, setLoading] = useState<boolean>(false)
    const [dataSource, setDataSource] = useState<any>({})

    const initConfig = async () => {
        setLoading(true)
        const { data, code, msg } = await queryDevOpsConfig({ ws_id })
        setLoading(false)
        if (code !== 200) return message.warning(msg)
        setDataSource(data)
    }

    const update = async (params: any) => {
        setLoading(true)
        const { code, msg } = await updateDevOpsConfig({ ws_id, ...dataSource, ...params })
        setLoading(false)
        if (code !== 200) {
            return message.warning(msg)
        }
        initConfig()
    }

    useEffect(() => {
        initConfig()
    }, [])

    return (
        <DevOps.Provider value={{ update, dataSource }}>
            <Spin spinning={loading}>
                <OperationTabCard title={<FormattedMessage id={`menu.Workspace.${props.route.name}`} />} >
                    <AutomaticRecovery field='auto_recover_server' />

                    <ResultStatusType field="func_result_view_type" />

                    {
                        !BUILD_APP_ENV &&
                        <>
                            <MatrixBranch
                                iType="aligroup"
                                field="matrix_repo_aligroup"
                            />

                            <MatrixBranch
                                iType="aliyun"
                                field="matrix_repo_aliyun"
                            />
                            <JobPeddingCount field='pending_job_num' />
                        </>
                    }
                </OperationTabCard>
            </Spin>
        </DevOps.Provider>
    )
}

export default DevOpsPage
