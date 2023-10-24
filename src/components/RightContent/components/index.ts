import { useIntl } from 'umi';

//枚举
const handleTypeWait = (name: any) => {
    const { formatMessage } = useIntl()
    const dict: any = {
        create: formatMessage({ id: 'right.content.wait.create' }), // '创建',
        delete: formatMessage({ id: 'right.content.wait.delete' }), // '注销',
        join: formatMessage({ id: 'right.content.wait.join' }), //'加入',
    }
    return dict[name]
}
const handleTypePassed = (name: any) => {
    const { formatMessage } = useIntl()
    const dict: any = {
        create: formatMessage({ id: 'right.content.passed.create' }), //'创建申请',
        delete: formatMessage({ id: 'right.content.passed.delete' }), //'注销申请',
        join: formatMessage({ id: 'right.content.passed.join' }), //'申请'
    }
    return dict[name]
}
const handleTypeRefused = (name: any) => {
    const { formatMessage } = useIntl()
    const dict: any = {
        create: formatMessage({ id: 'right.content.refused.create' }), //'创建申请',
        delete: formatMessage({ id: 'right.content.refused.delete' }), //'注销申请',
        join: '',
    }
    return dict[name]
}

const jumpPage = (name: any, action: any, ws_id: any) => {
    if (name === 'waiting' && action === 'create' || action === 'delete') {  // 创建/注销WS申请
        return window.open('/system/approve')
    } else if (name === 'passed' && (action === 'create' || action === 'delete' || action === 'join')) { // 创建/注销WS审批结果 通过
        return window.open(`/ws/${ws_id}/dashboard`)
    } else if (name === 'refused' && action === 'create' || action === 'delete') { // 创建/注销WS审批结果 拒绝
        return window.open(`/personCenter?person=approve`)
    } else if (name === 'waiting' && action === 'join') { // 申请加入WS申请
        return window.open(`/ws/${ws_id}/config/join`)
    } else if (action === 'transfer' || action === 'set_ws_role') { // 被加入/设置ws角色 || owner转让
        return window.open(`/ws/${ws_id}/dashboard`)
    } else {
        return false
    }
}

export { handleTypeWait, handleTypePassed, handleTypeRefused, jumpPage };