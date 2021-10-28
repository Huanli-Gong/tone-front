import { Select } from 'antd'
import React , { useEffect, useState } from 'react'
import {  queryClusterServer } from '../service'
import { useParams } from 'umi'
import { RenderSelectItems } from '../../untils'

const StandaloneSelect = ( props : any ) => {
    const { ws_id } : any = useParams()

    const [clusterServer, setClusterServer] = useState<any>([])
    const clusterServerRequest = async (page_num = 1) => {
        const { data, code } = await queryClusterServer({ cluster_type: 'aligroup', ws_id, page_num })
        if (code === 200) setClusterServer(clusterServer.concat(data))
    }

    const handlePopupScroll = ({ target }:any) => {
        const { clientHeight, scrollHeight, scrollTop } = target 
        if(  clientHeight + scrollTop === scrollHeight  ) {
            clusterServerRequest()
        }
    }

    useEffect(() => {
        clusterServerRequest()
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
                RenderSelectItems(clusterServer, 'name')
            }
        </Select>
    )
}

export default StandaloneSelect