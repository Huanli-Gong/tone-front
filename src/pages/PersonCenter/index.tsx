import React, { useState, useCallback, useEffect } from 'react'
import { Layout, Tabs, message, Space, Avatar, Tag, Spin } from 'antd'
import PersonWorkspace from './PersonWorkspace'
import PersonApprove from './PersonApprove'
import TokenConfig from './TokenConfig'
import styles from './index.less'
import { queryWorkspace, queryApprove, queryGetToken } from './services'
import _ from 'lodash'
import { history, useModel, useLocation, useAccess, Access, useIntl, FormattedMessage, getLocale } from 'umi'
import { Scrollbars } from 'react-custom-scrollbars';
import { useClientSize } from '@/utils/hooks'
import { requestCodeMessage, switchUserRole2 } from '@/utils/utils'
import AvatarCover from '@/components/AvatarCover'

const reqUrlMap = new Map([
    ['workspace', queryWorkspace],
    ['approve', queryApprove],
    ['tokenConfig', queryGetToken],
]) as any

export default (props: any) => {
    const { formatMessage } = useIntl()
    const enLocale = getLocale() === 'en-US'

    const { initialState } = useModel('@@initialState')
    const { authList } = initialState
    const access = useAccess();
    const { query } = useLocation() as any
    const {height: layoutHeight} = useClientSize()

    const [tab, setTab] = useState(query.person ?? 'workspace')
    const [data, setData] = useState<any>([])
    const [loading, setLoading] = useState(true)

    const handleTabClick = async (t: string) => {
        setTab(t)
        history.replace(`/personCenter?person=${t}`)
        setLoading(true)
        setData([])
        const { data, code, msg } = await reqUrlMap.get(t)()
        if (code !== 200) requestCodeMessage(code, msg)
        data && setData(data)
        setLoading(false)
    }

    const init = async () => {
        setLoading(true)
        const { data, code } = await reqUrlMap.get(tab)()
        if (code === 200)
            setData(data)
        setLoading(false)
    }

    useEffect(() => {
        init()
    }, [])

    // const handleSys_Role = (title_type: any) => {
    //     const dict = {
    //         user: '普通用户',
    //         sys_test_admin: '测试管理员',
    //         sys_admin: '系统管理员',
    //         super_admin: '超级管理员'
    //     }
    //     return dict[title_type]
    // }

    const scroll = {
        // 最大高度，内容超出该高度会出现滚动条
        height: layoutHeight - 50
        // width: 2000
    }
    return (
        <Scrollbars style={scroll}>
            <Layout.Content className={styles.content}>

                <div className={styles.current_user}>
                    <Space>
                        <div className={styles.avatar}>
                            {
                                authList.avatar ?
                                    <Avatar size="small" src={authList.avatar || ''} alt="avatar" className={styles.avatar} /> :
                                    <AvatarCover shape="circle" size={ 56 } fontSize={ 28 } theme_color={authList.avatar_color} show_name={authList.last_name} />
                            }
                        </div>
                        <div>
                            <div className={styles.name}>{authList.first_name || authList.last_name} <Tag className={styles.role} style={{ opacity: authList.sys_role_title === 'user' ? 0 : 1 }}>{switchUserRole2(authList.sys_role_title, formatMessage)}</Tag></div>
                            <div className={styles.email}>{authList.email || ''} </div>
                        </div>
                    </Space>
                </div>

                <Tabs
                    defaultActiveKey={tab}
                    onTabClick={handleTabClick}
                    className={styles.tab_title}
                    activeKey={tab}
                >
                    <Tabs.TabPane tab="Workspace" key="workspace" className={styles.tab_item}>
                        {tab === 'workspace' && <PersonWorkspace loading={loading} workspaceList={data} userId={Number(authList.id)} />}
                    </Tabs.TabPane>
                    <Tabs.TabPane tab={<FormattedMessage id="person.center.approve"/>} key="approve">
                        {tab === 'approve' && <PersonApprove loading={loading} approveData={data} handleTabClick={handleTabClick} userId={Number(authList.id)}/>}
                    </Tabs.TabPane>
                    <Tabs.TabPane tab={<FormattedMessage id="person.center.tokenConfig"/>} key="tokenConfig">
                        {tab === 'tokenConfig' && <TokenConfig loading={loading} tokenData={data} />}
                    </Tabs.TabPane>
                </Tabs>
            </Layout.Content>
        </Scrollbars >
    )
}