import React from 'react'
import { message, Space, Avatar, Spin, Button, Tag } from 'antd'
import { enterWorkspaceHistroy } from '@/services/Workspace'
import { history } from 'umi'
import styles from './index.less'
import JoinPopover from './JoinPopover'
import { ReactComponent as PublicIcon } from '@/assets/svg/public.svg'
import { ReactComponent as NPublicIcon } from '@/assets/svg/no_public.svg'
import { useClientSize } from '@/utils/hooks'
import _ from 'lodash'
import EmptyData from './EmptyData'
import EllipsisRect from './EllipsisRect'
import { jumpWorkspace, requestCodeMessage } from '@/utils/utils'

export default (props: any) => {
    const { approveData, loading, handleTabClick, userId } = props
    const { height: layoutHeight } = useClientSize()
    let approveDataList = _.isArray(approveData) ? approveData : []
    approveDataList = approveDataList.filter(item => _.get(item, 'ws_info'))
    const statusColorFn = (status: any) => {
        switch (status) {
            case 'waiting': return <Tag className={styles.stateColorFn} color='#FF9D4E'  >审核中</Tag>
            case 'passed': return <Tag color='#52C41A' className={styles.stateColorFn}>通过</Tag>
            case 'refused': return <Tag color='#F5222D' className={styles.stateColorFn}>拒绝</Tag>
            default: return <></>
        }
    }
    const firstRowFn = (item: any) => {
        let actionType = ''
        if (item.action === 'create') actionType = '创建'
        if (item.action === 'delete') actionType = '注销'
        if (item.action === 'join') actionType = '加入'
        return (
            <Space>
                <span className={styles.action}> {`${actionType}Workspace`} </span>
                <span className={styles.show_name}> {item.ws_info.show_name}</span>
                <span className={styles.approv}>申请</span>
                <span className={styles.status}> {statusColorFn(item.status)}</span>
                <span className={styles.create_time}> {item.gmt_created}</span>
            </Space>
        )
    }
    const ellipsisText = (name: string) => {
        if (!name) return ''
        return name.slice(0, 1)
    }
    const valueFn = (obj: any) => {
        if (obj.id === 'logo') {
            // return (<Avatar size="small" src={obj.value || ''} alt="avatar" className={styles.avatar} />)
            const logo = obj.value
            if (logo) {
                return (<Avatar size="small" src={logo} alt="avatar" className={styles.avatar} shape="square" />)
            }
            return <Avatar size="small" shape="square" className={styles.avatar} style={{ backgroundColor: obj.theme_color, fontSize: 14, fontWeight: 'bold' }} >{ellipsisText(obj.show_name)}</Avatar>
        }
        if (obj.id === 'is_public') {
            const text = obj.value ? '公开' : '不公开'
            return (
                <>
                    <span className={styles.is_public}>{obj.value ? <PublicIcon /> : <NPublicIcon />} </span>
                    {text}
                </>
            )
        }
        return <EllipsisRect text={obj.value} />
    }
    const secondRowFn = (item: any) => {
        const obj = { value: item.ws_info.logo, id: 'logo', theme_color: item.ws_info.theme_color, show_name: item.ws_info.show_name }
        return (
            <div className={styles.second_row}>

                {valueFn(obj)}
                <span className={styles.text_label}> {obj.show_name} </span>
            </div>
        )
    }
    const descriptionFn = (lable: any, value: any) => {
        return (

            <div className={styles.description_box}>
                <span className={`${styles.text_label}  ${styles.description_label}`}> {lable}: </span>
                <div className={`${styles.description_value}`} style={{ marginLeft: lable === '简介' ? '44px' : '72px' }}>{value || '-'} </div>
            </div>

        )
    }
    const approveUsersFn = (text: string, users: any) => {
        let arr = _.isArray(users) ? users : []
        arr = arr.map((item: any) => {
            return (
                <li>
                    <Space>
                        <Avatar size="small" className={styles.avatar} src={item.avatar} alt="avatar" />
                        <span>{item.user_name || ''}</span>
                    </Space>
                </li>
            )
        })
        if (arr.length) arr.unshift(<li> {text}: </li>)
        return (
            <ul className={`${styles.approve_users}`}>
                {arr}
            </ul>
        )
    }
    const thirdRowFn = (item: any) => {
        return (
            <>
                <Space>
                    <span className={styles.is_public}>{item.ws_info.is_public ? <PublicIcon /> : <NPublicIcon />}</span>
                    <span className={styles.second_part}>{item.ws_info.is_public ? '公开' : '私密'}</span>
                </Space>
                <Space>
                    <span className={styles.text_label}>workspace显示名：</span>
                    <span className={styles.second_part}>{item.ws_info.show_name || '-'}</span>
                </Space>
            </>
        )
    }
    
    const handleClick = async (id: any, creator: number) => {
        const { code, msg, first_entry } = await enterWorkspaceHistroy({ ws_id: id })
        if (code === 200) {
            if (first_entry && creator === userId) {
                history.push(`/ws/${id}/workspace/initSuccess`, { fetchWorkspaceHistoryRecord: true })
            } else {
                // history.push(`/ws/${id}/dashboard`)
                history.push(jumpWorkspace(id), { fetchWorkspaceHistoryRecord: true })
            }
        }
        else requestCodeMessage(code, msg)
    }

    const approveList = (item: any) => {
        const type = item.action !== 'join'
        let approveTime = false
        let refuseReason = false

        if ((item.action === 'create' || item.action === 'delete') && item.status === 'refused') {
            approveTime = true
            refuseReason = true
        }
        if (item.action === 'join' && (item.status === 'refused' || item.status === 'passed')) approveTime = true
        // 申请理由  所有情况都有
        return (
            <div className={styles.approve_info} key={item.id}>
                <div>{firstRowFn(item)}</div>
                <div style={{ display: type ? 'block' : 'none' }}>{secondRowFn(item)}</div>
                <div style={{ display: type ? 'block' : 'none' }}>{descriptionFn('简介', item.ws_info.description)}</div>
                <div style={{ display: type ? 'block' : 'none' }}>{thirdRowFn(item)}</div>
                <div>{descriptionFn('申请理由', item.reason)}</div>
                <div className={`${styles.approve_info_colum} ${styles.approve_refuse_reason}`} style={{ display: refuseReason ? 'block' : 'none' }}>{descriptionFn('拒绝理由', item.refuse_reason)}</div>
                <div style={{ display: approveTime ? 'block' : 'none' }}>{descriptionFn('审批时间', item.gmt_modified)}</div>
                <div>{approveUsersFn('审批人员', item.approve_users)}</div>
                {item.status === 'refused' && <JoinPopover handleTabClick={handleTabClick} wsInfo={item} />}
                {item.status === 'passed' && item.action !== 'delete' && <Button onClick={_.partial(handleClick, item.ws_info.id, item.ws_info.creator)}>进入Workspace</Button>}
            </div >
        )
    }

    return (
        <Spin spinning={loading}>
            <div className={styles.approve_content} id="content" style={{ minHeight: layoutHeight - 270 - 40 }}>
                {approveDataList.length ? approveDataList.map((item: any) => approveList(item)) : <EmptyData layoutHeight={layoutHeight} />}
            </div>
        </Spin>
    )
}