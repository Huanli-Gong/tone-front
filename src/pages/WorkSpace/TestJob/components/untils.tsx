import React from 'react'

import { Tag, Space, Tooltip, Select } from 'antd'
import { QuestionCircleOutlined } from '@ant-design/icons'
import cls from 'classnames'
import styles from './index.less'

export const tagRender = ({ label, closable, onClose, value }: any) => {
    return (
        <Tag
            color={label.props?.color}
            closable={closable}
            onClose={onClose}
            style={{ marginRight: 3 }}
        >
            {label.props?.children || value}
        </Tag>
    )
}

export const QusetionIconTootip: React.FC<any> = ({ title, desc, className }: any) => (
    <Space>
        <span style={{ color: 'rgba(0, 0, 0, 0.85)' }}>{title}</span>
        <Tooltip
            overlayClassName={cls(styles.table_question_tooltip, className)}
            placement="bottom"
            arrowPointAtCenter
            title={desc}
            color="#fff"
        >
            <QuestionCircleOutlined style={{ color: 'rgba(0, 0, 0, 0.65)' }} />
        </Tooltip>
    </Space>
)

export const RenderSelectItems: React.FC<any> = (list: any, name: string) => (
    list.map(
        (item: any) => (
            <Select.Option
                value={item.id}
                key={item.id}
            >
                {item[name]}
            </Select.Option>
        )
    )
)

export const RenderSelectStateItems: React.FC<any> = (list: any, name: string) => (
    list.map(
        (item: any) => (
            <Select.Option
                value={item.id}
                key={item.id}
            >
                {`${item[name]}（${item.state}）`}
            </Select.Option>
        )
    )
)

export const filtersServerIp = (list: any, id: number, name: string) => {
    let result = ''
    for (let len = list.length, i = 0; i < len; i++)
        if (list[i].id === id) {
            result = list[i][name]
            break
        }
    return result
}

// 拼接ip
export const filtersServerIp2 = (list: any, id: number, name: string) => {
    let result = ''
    for (let len = list.length, i = 0; i < len; i++)
        if (list[i].id === id) {
            result = list[i][name].indexOf(' / ') > -1 ? list[i][name] : (`${list[i].pub_ip} / ${list[i][name]}`)
            break
        }
    return result
}


export const getHasMuiltip = (d: any) => {
    if (d && JSON.stringify(d) !== '{}') {
        const keys = Object.keys(d)
        for (let i = 0, len = keys.length; i < len; i++) {
            if (d[keys[i]].length > 1) return true
        }
    }
    return false
}

export const formatter = (val: any) => val && typeof +val === "number" ? parseInt(val as any) + "" : ""
