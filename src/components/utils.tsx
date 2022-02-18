import React from 'react'

import { Select } from 'antd'
import { agent_list } from '@/utils/utils'

export const AgentSelect: React.FC<any> = (props) => {
    return (
        <Select {...props}>
            {
                agent_list.map((i: any) => (
                    <Select.Option key={i.value} value={i.value}>{i.label}</Select.Option>
                ))
            }
        </Select>
    )
} 