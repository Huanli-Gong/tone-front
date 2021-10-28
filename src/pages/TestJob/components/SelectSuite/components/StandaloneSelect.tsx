import { Select } from 'antd'
import React , { useEffect, useState } from 'react'
import {  standloneServerList } from '../service'
import { useParams } from 'umi'
import { RenderSelectStateItems } from '../../untils'

const StandaloneSelect = ( props : any ) => {
    const { ws_id } : any = useParams()

    const [serverList, setServerList] = useState([])
    const standaloneServerRequest = async (page_num = 1) => {
        const { data, code } = await standloneServerList({ ws_id, state: ['Available', 'Occupied', 'Reserved'], page_num })
        if (code === 200) setServerList(serverList.concat(data))
    }

    const handlePopupScroll = ({ target }:any) => {
        const { clientHeight, scrollHeight, scrollTop } = target 
        if(  clientHeight + scrollTop === scrollHeight  ) {
            standaloneServerRequest()
        }
    }

    useEffect(() => {
        standaloneServerRequest()
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
                RenderSelectStateItems(serverList, 'ip')
            }
        </Select>
    )
}

export default StandaloneSelect