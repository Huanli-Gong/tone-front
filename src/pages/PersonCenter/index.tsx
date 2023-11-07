import React, { useState, useEffect } from 'react'
import { Layout, Tabs, Space, Avatar, Tag } from 'antd'
import PersonWorkspace from './PersonWorkspace'
import PersonApprove from './PersonApprove'
import TokenConfig from './TokenConfig'
import styles from './index.less'
import { queryWorkspace, queryApprove, queryGetToken } from './services'
import { history, useModel, useLocation, useIntl, FormattedMessage } from 'umi'
import { Scrollbars } from 'react-custom-scrollbars';
import { useClientSize } from '@/utils/hooks'
import { requestCodeMessage, switchUserRole2 } from '@/utils/utils'
import AvatarCover from '@/components/AvatarCover'
import styled from 'styled-components'

const reqUrlMap = new Map([
    ['workspace', queryWorkspace],
    ['approve', queryApprove],
    ['tokenConfig', queryGetToken],
]) as any

const PersonCenterPage: React.FC = () => {
    const { formatMessage } = useIntl()
    const { pathname } = useLocation()

    const { initialState } = useModel('@@initialState')
    const { authList } = initialState
    const { query } = useLocation() as any
    const { height: layoutHeight } = useClientSize()

    const [tab, setTab] = useState(query.person ?? 'workspace')
    const [data, setData] = useState<any>([])
    const [loading, setLoading] = useState(true)

    const handleTabClick = async (t: string) => {
        setTab(t)
        history.replace(`${pathname}?person=${t}`)
        setData([])
    }

    const init = async () => {
        setLoading(true)
        const { data, code, msg } = await reqUrlMap.get(tab)()
        setLoading(false)
        if (code !== 200) {
            requestCodeMessage(code, msg)
        }
        if (code === 200)
            setData(data)
    }

    useEffect(() => {
        init()
    }, [tab])

    const scroll = {
        // 最大高度，内容超出该高度会出现滚动条
        height: layoutHeight - 50
        // width: 2000
    }

    return (
        <Scrollbars style={scroll}>
            <div className={styles.container}>
                <Layout.Content className={styles.content}>

                    <div className={styles.current_user}>
                        <Space>
                            <div className={styles.avatar}>
                                {
                                    authList.avatar ?
                                        <Avatar size="small" src={authList.avatar || ''} alt="avatar" className={styles.avatar} /> :
                                        <AvatarCover shape="circle" size={56} fontSize={28} theme_color={authList.avatar_color} show_name={authList.last_name} />
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
                        <Tabs.TabPane tab={<FormattedMessage id="person.center.approve" />} key="approve">
                            {tab === 'approve' && <PersonApprove loading={loading} approveData={data} handleTabClick={handleTabClick} userId={Number(authList.id)} />}
                        </Tabs.TabPane>
                        <Tabs.TabPane tab={<FormattedMessage id="person.center.tokenConfig" />} key="tokenConfig">
                            {tab === 'tokenConfig' && <TokenConfig loading={loading} tokenData={data} />}
                        </Tabs.TabPane>
                    </Tabs>
                </Layout.Content>
            </div>
        </Scrollbars >
    )
}

export default PersonCenterPage