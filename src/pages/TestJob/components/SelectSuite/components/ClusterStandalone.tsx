import { Select } from 'antd'
import React , { useEffect, useState } from 'react'
import {  queryClusterStandaloneServer } from '../service'
import { useParams } from 'umi'
import { RenderSelectItems } from '../../untils'

const StandaloneSelect = ( props : any ) => {
    const { ws_id } : any = useParams()

    const [clusterStandalone, setClusterStandlone] = useState<any>([])
    const clusterStandaloneRequest = async (page_num = 1) => {
        const { data, code } = await queryClusterStandaloneServer({ ws_id, page_num })
        if (code === 200) setClusterStandlone(clusterStandalone.concat(data))
    }

    const handlePopupScroll = ({ target }:any) => {
        const { clientHeight, scrollHeight, scrollTop } = target 
        if(  clientHeight + scrollTop === scrollHeight  ) {
            clusterStandaloneRequest()
        }
    }

    useEffect(() => {
        clusterStandaloneRequest()
    } , [])

    return (
        <Select
            allowClear
            style={{ width: '100%' }}
            placeholder="请选择机器"
            showSearch
            optionFilterProp="children"
            onPopupScroll={ handlePopupScroll }
            filterOption={(input, option: any) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            { ...props }
        >
            {
                RenderSelectItems(clusterStandalone, 'instance_name')
            }
        </Select>
    )
}

export default StandaloneSelect