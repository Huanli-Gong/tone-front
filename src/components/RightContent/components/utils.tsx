import React from 'react';
import { Typography, Tooltip } from 'antd';
import { useIntl, FormattedMessage } from 'umi';
import styles from './index.less'
import { switchUserRole2 } from '@/utils/utils';

//枚举
const handleTypeWait = (name: string) => {
    const { formatMessage } = useIntl()
    const dict = {
        create: formatMessage({ id: 'right.content.wait.create'}), // '创建',
        delete: formatMessage({ id: 'right.content.wait.delete'}), // '注销',
        join: formatMessage({ id: 'right.content.wait.join'}), //'加入',
    }
    return dict[name]
}
const handleTypePassed = (name: string) => {
    const { formatMessage } = useIntl()
    const dict = {
        create: formatMessage({ id: 'right.content.passed.create'}), //'创建申请',
        delete: formatMessage({ id: 'right.content.passed.delete'}), //'注销申请',
        join: formatMessage({ id: 'right.content.passed.join'}), //'申请'
    }
    return dict[name]
}
const handleTypeRefused = (name: string) => {
    const { formatMessage } = useIntl()
    const dict = {
        create: formatMessage({ id: 'right.content.refused.create'}), //'创建申请',
        delete: formatMessage({ id: 'right.content.refused.delete'}), //'注销申请',
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
    const { formatMessage } = useIntl()
    const obj = JSON.parse(item.content)
    const username = <Typography.Text className={styles.list_user} >{obj.operator_info.user_name}</Typography.Text>

    if (obj.status === 'waiting') {
        return (
            <>
                {username}
                <TitleText>
                    <FormattedMessage id="right.content.passed.join" />{handleTypeWait(obj.action)}Workspace
                </TitleText>
                <NameText>{obj.ws_info.ws_show_name}</NameText>
            </>
        )
    } else if (obj.status === 'passed') {
        return (
            <>
                {username}
                <TitleText>{obj.action === 'join' ? <FormattedMessage id="right.content.join.through.you" /> : <FormattedMessage id="right.content.pass" />}</TitleText>
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
                <TitleText>{obj.action === 'join' ? <FormattedMessage id="right.content.refuse.you.to.join" /> : <FormattedMessage id="right.content.refuse" />}</TitleText>
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
                        {obj.operator_info.action === 'add' ? <FormattedMessage id="right.content.add.you.as" /> : <FormattedMessage id="right.content.set.you.to" />}
                    </TitleText>
                    <NameText>{obj.ws_info.ws_show_name}</NameText>
                    <TitleText>{switchUserRole2(obj.role_title, formatMessage)}</TitleText>
                </>
            )
        } else if (obj.action === 'set_sys_role') {
            return (
                <>
                    {username}
                    <TitleText><FormattedMessage id="right.content.add.you.as.t-one" />{switchUserRole2(obj.role_title, formatMessage)}</TitleText>
                </>
            )
        } else if (obj.action === 'remove') {
            return (
                <>
                    {username}
                    <TitleText><FormattedMessage id="right.content.remove.you" /></TitleText>
                    <TitleText>{obj.ws_info.ws_show_name}</TitleText>
                </>
            )
        } else {
            return (
                <>
                    {username}
                    <TitleText>
                        {/* 把 */}
                        <FormattedMessage id="right.content.put" />
                    </TitleText>
                    <NameText>{obj.ws_info.ws_show_name}</NameText>
                    <TitleText>
                        {/* owner转让给你 */}
                        <FormattedMessage id="right.content.transfer.to.you" />
                    </TitleText>
                </>
            )
        }
    }
}

export { handleTypeWait, handleTypePassed, handleTypeRefused, jumpPage };
