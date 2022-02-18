import React , { useRef } from 'react'
import { Avatar, Spin, Space, message } from 'antd'
import styles from './index.less'
import { ReactComponent as PublicIcon } from '@/assets/svg/public.svg'
import { ReactComponent as NPublicIcon } from '@/assets/svg/no_public.svg'
import { useClientSize } from '@/utils/hooks'
import _ from 'lodash'
import EmptyData from './EmptyData'
import EllipsisRect from './EllipsisRect'
import { enterWorkspaceHistroy } from '@/services/Workspace'
import { history } from 'umi'
import { requestCodeMessage } from '@/utils/utils'
export default (props: any) => {
    const {workspaceList,loading, userId} = props
    const {height: layoutHeight} = useClientSize()
    const workspaceDataList = _.isArray(workspaceList.workspace_list) ? workspaceList.workspace_list : []
    const wsNameEllipsis = useRef<any>(null)
    const desEllipsis = useRef<any>(null)
    const ellipsisText = (name: string) => {
        if(!name) return ''
        return name.slice(0, 1)
    }
    const wsInfoFn = (wsInfo: any) => {
        let logo = wsInfo.logo
        // if (logo) logo = `window.location.origin${logo}`
        return (
            <>
                <span className={styles.first_colum}>
                    {
                        logo ?
                        <Avatar size="small" className={styles.avatar} src={logo} alt="avatar" shape="square"/>
                            : <Avatar size="small" shape="square" className={styles.avatar} style={{  backgroundColor: wsInfo.theme_color, fontSize: 14, fontWeight: 'bold' }} >{ellipsisText(wsInfo.show_name)}</Avatar>
                    }
                </span>
                <EllipsisRect
                    text={ wsInfo.show_name || wsInfo.name }
                    ellipsis={wsNameEllipsis}
                    // placement="topLeft"
                    children={<span ref={wsNameEllipsis} className={styles.name}>
                        { wsInfo.show_name || wsInfo.name }
                    </span>} />
               
            </>
        )
    }
    const handleEnterWs = async (id: any, creator:number) => {
        const { code, msg, first_entry } = await enterWorkspaceHistroy({ ws_id: id })
        if (code === 200) {
            if(first_entry && creator === userId) {
                history.push(`/ws/${id}/workspace/initSuccess`)
            }else {
                history.push(`/ws/${id}/dashboard`)
            }
        }
        else requestCodeMessage( code , msg )
    }
    
    const handleWs_Role = (title_type:any) => {
        const dict = {
            ws_member:'workspace成员',
            ws_tester_admin:'测试管理员',
            ws_admin:'管理员',
            ws_tester:'测试人员',
            ws_owner:'所有者'
        }
        return dict[title_type]
    }
    const wsList = (item: any) => (
        <div className={styles.ws_info} key={item.id} onClick={_.partial(handleEnterWs, item.id, item.creator)}>
            <div className={styles.ws_info_colum}>{wsInfoFn(item)}</div>
            <div className={styles.ws_info_colum}>
                <EllipsisRect
                    text={item.description}
                    ellipsis={desEllipsis}
                    children={<span className={styles.ws_description} ref={desEllipsis}><span className={`${styles.text_label}`} style={{fontWeight: 600,color:'rgba(0,0,0,0.85)'}}> 简介： </span>{item.description}</span>} />
            </div>
            <div className={styles.ws_info_colum}>
                <Space>
                    <span className={styles.is_public}>{item.is_public ? <PublicIcon /> : <NPublicIcon />}</span>
                    <span className={styles.second_part}>{item.is_public ? '公开' : '私密'}</span>
                </Space>
                <Space>
                    <span style={{fontWeight: 600,color:'rgba(0,0,0,0.85)'}}>角色：</span>
                    <span className={styles.second_part}>{handleWs_Role(item.ws_role)}</span>
                </Space>
                <Space>
                    <span style={{fontWeight: 600,color:'rgba(0,0,0,0.85)'}}>人数：</span>
                    <span className={styles.second_part}>{`${item.member_count}人`}</span>
                </Space>
            </div>
        </div>
    )

    return (
        <Spin spinning={loading}>
            <div className={styles.ws_content} id="content" style={{ minHeight: layoutHeight - 270 - 40 }}>
                {workspaceDataList.length ? workspaceDataList.map((item: any) => wsList(item)) : <EmptyData layoutHeight={layoutHeight} />}
            </div>
        </Spin>
    )
}