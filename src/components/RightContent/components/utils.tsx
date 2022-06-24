import React from 'react';
import { Typography, Tooltip } from 'antd';
import styles from './index.less'
import { switchUserRole } from '@/utils/utils';

//枚举
const handleTypeWait = (name: string) => {
    const dict = {
        create: '创建',
        delete: '注销',
        join: '加入',
    }
    return dict[name]
}
const handleTypePassed = (name: string) => {
    const dict = {
        create: '创建申请',
        delete: '注销申请',
        join: '申请'
    }
    return dict[name]
}
const handleTypeRefused = (name: string) => {
    const dict = {
        create: '创建申请',
        delete: '注销申请',
        join: '',
    }
    return dict[name]
}

const PASS_LOGOFF = ['create', 'delete', 'join']
const REFUSED_LOGOFF = ['create', 'delete']

const jumpPage = (name: string, action: string, ws_id: string) => {
    if (name === 'waiting' && REFUSED_LOGOFF.includes(action)) // 创建/注销WS申请
        return window.open('/system/approve')
    if (name === 'passed' && PASS_LOGOFF.includes(action))      // 创建/注销WS审批结果 通过
        return window.open(`/ws/${ws_id}/dashboard`)
    if (name === 'refused' && REFUSED_LOGOFF.includes(action))  // 创建/注销WS审批结果 拒绝
        return window.open(`/personCenter?person=approve`)
    if (name === 'waiting' && action === 'join')                // 申请加入WS申请
        return window.open(`/ws/${ws_id}/config/join`)
    if (action === 'transfer')                                  //被加入/设置ws角色 || owner转让
        return window.open(`/ws/${ws_id}/dashboard`)

    return false
}

export const NoticeItem: React.FC<any> = ({ item, children, onClick }) => (
    <div onClick={onClick}>
        <Typography.Text ellipsis={true}>
            {children}
        </Typography.Text>
    </div>
)

export const TitleText: React.FC = ({ children }) => (
    <Typography.Text className={styles.list_title}>{children}</Typography.Text>
)

export const NameText: React.FC = ({ children }) => (
    <Typography.Text className={styles.list_ws_name}>{children}</Typography.Text>
)

export const handleMsgType = (item: any) => {
    const obj = JSON.parse(item.content)
    const username = <Typography.Text className={styles.list_user} >{obj.operator_info.user_name}</Typography.Text>

    if (obj.status === 'waiting') {
        return (
            <>
                {username}
                <TitleText >申请{handleTypeWait(obj.action)}Workspace</TitleText>
                <NameText >{obj.ws_info.ws_show_name}</NameText>
            </>
        )
    } else if (obj.status === 'passed') {
        return (
            <>
                {username}
                <TitleText>{obj.action === 'join' ? '通过你加入' : '通过'}</TitleText>
                <NameText>{obj.ws_info.ws_show_name}</NameText>
                <Tooltip placement="topLeft" title={handleTypePassed(obj.action)}>
                    <TitleText>{handleTypePassed(obj.action)}</TitleText>
                </Tooltip>
            </>
        )
    } else if (obj.status === 'refused') {
        return (
            <>
                {username}
                <TitleText>{obj.action === 'join' ? '拒绝你加入' : '拒绝'}</TitleText>
                <Tooltip placement="topLeft" title={obj.ws_info.ws_show_name}>
                    <TitleText>{obj.ws_info.ws_show_name}</TitleText>
                </Tooltip>
                <Tooltip placement="topLeft" title={handleTypeRefused(obj.action)}>
                    <TitleText>{handleTypeRefused(obj.action)}</TitleText>
                </Tooltip>
            </>
        )
    } else {
        if (obj.action === 'set_ws_role') {
            return (
                <>
                    {username}
                    <TitleText>
                        {obj.operator_info.action === 'add' ? '把你添加为' : '把你设置为'}
                    </TitleText>
                    <NameText>{obj.ws_info.ws_show_name}</NameText>
                    <TitleText>{switchUserRole(obj.role_title)}</TitleText>
                </>
            )
        } else if (obj.action === 'set_sys_role') {
            return (
                <>
                    {username}
                    <TitleText>把你添加为T-One{switchUserRole(obj.role_title)}</TitleText>
                </>
            )
        } else if (obj.action === 'remove') {
            return (
                <>
                    {username}
                    <TitleText>把你移除</TitleText>
                    <TitleText>{obj.ws_info.ws_show_name}</TitleText>
                </>
            )
        } else {
            return (
                <>
                    {username}
                    <TitleText>把</TitleText>
                    <NameText>{obj.ws_info.ws_show_name}</NameText>
                    <TitleText>owner转让给你</TitleText>
                </>
            )
        }
    }
}

export { handleTypeWait, handleTypePassed, handleTypeRefused, jumpPage };
