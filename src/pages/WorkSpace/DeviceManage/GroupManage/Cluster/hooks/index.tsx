import { useState , useEffect } from 'react'

import { queryServerGroupList } from '../../services'

export const usePageInit = ( ws_id : string ) => {
    const [ loading , setLoading ] = useState( true )
    const [ params , setParams ] = useState<any>({
        ws_id,
        page_num : 1,
        page_size : 10,
        cluster_type : 'aligroup',
    })
    const [ refresh , setRefresh ] = useState( false )
    const [ total , setTotal ] = useState( 0 )

    const [ dataSource , setDataSource ] = useState([])

    const init = async () => {
        setLoading( true )
        const { data , total } = await queryServerGroupList( params )
        setDataSource( data )
        setTotal( total )
        setLoading( false )
    }
    
    useEffect(() => {
        init()
    },[ params , refresh ])

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