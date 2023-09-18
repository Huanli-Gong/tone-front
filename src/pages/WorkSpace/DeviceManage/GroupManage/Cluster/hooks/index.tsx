/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react'

import { queryServerGroupList } from '../../services'
import { useParams, useLocation, history } from 'umi'
import { stringify } from 'querystring'

export const usePageInit = () => {
    const { query } = useLocation() as any
    const { ws_id } = useParams() as any

    const DEFAULT_PAGE_PARAMS = {
        ws_id,
        page_num: 1,
        page_size: 10,
        cluster_type: 'aligroup',
    }

    const [loading, setLoading] = useState(true)
    const [params, setParams] = useState<any>({ ...DEFAULT_PAGE_PARAMS, ...query })
    const [refresh, setRefresh] = useState<any>()
    const [dataSource, setDataSource] = useState<any>()

    const init = async () => {
        setLoading(true)
        const data = await queryServerGroupList(params)
        setLoading(false)
        setDataSource(data)
        history.replace(`/ws/${ws_id}/device/group?${stringify(params)}`)
    }

    useEffect(() => {
        init()
    }, [refresh, params])

    return {
        loading,
        params,
        dataSource,
        refresh,
        setRefresh,
        setParams,
    }
}