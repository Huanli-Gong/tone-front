/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react'

import { queryServerGroupList } from '../../services'
import { useParams, useLocation, history } from 'umi'
import { parse, stringify } from 'querystring'

export const usePageInit = () => {
    const { pathname, query, search } = useLocation() as any
    const { ws_id } = useParams() as any

    const [loading, setLoading] = useState(true)
    const [params, setParams] = useState<any>({
        ws_id,
        page_num: 1,
        page_size: 10,
        cluster_type: 'aligroup',
        ...query
    })

    const [refresh, setRefresh] = useState<any>()
    const [total, setTotal] = useState(0)
    const [dataSource, setDataSource] = useState([])

    const init = async () => {
        setLoading(true)
        const { data, total: $total } = await queryServerGroupList(params)
        setLoading(false)
        history.replace(`${pathname}?${stringify(params)}`)
        setDataSource(data)
        setTotal($total)
    }

    useEffect(() => {
        init()
    }, [params, refresh])

    React.useEffect(() => {
        if (!search || Object.keys(parse(search?.split('?').at(1))).length <= 1)
            setParams({
                ws_id,
                page_num: 1,
                page_size: 10,
                cluster_type: 'aligroup',
                ...query
            })
    }, [search])

    return {
        loading,
        params,
        total,
        dataSource,
        refresh,
        setRefresh,
        setParams,
        setTotal
    }
}