import { Select } from 'antd'
import React , { useEffect, useState } from 'react'
import {  queryClusterStandaloneServer } from '../service'
import { useParams } from 'umi'
import { RenderSelectItems } from '../../untils'

const StandaloneSelect = ( props : any ) => {
    const { ws_id } : any = useParams()

    const [clusterGroup, setCLusterGroup] = useState<any>([])
    const clusterGroupRequest = async (page_num = 1) => {
        const { data, code } = await queryClusterStandaloneServer({ cluster_type: 'aliyun', ws_id, page_num })
        if (code === 200) setCLusterGroup(clusterGroup.concat(data))
    }

    const handlePopupScroll = ({ target }:any) => {
        const { clientHeight, scrollHeight, scrollTop } = target 
        if(  clientHeight + scrollTop === scrollHeight  ) {
            clusterGroupRequest()
        }
    }

    useEffect(() => {
        clusterGroupRequest()
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
                RenderSelectItems(clusterGroup, 'name')
            }
        </Select>
    )
}

export default StandaloneSelect