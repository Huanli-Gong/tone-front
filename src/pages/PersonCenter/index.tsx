import React , { useState , useCallback, useEffect } from 'react'
import { Layout, Tabs, message, Space, Avatar, Tag, Spin } from 'antd'
import PersonWorkspace from './PersonWorkspace'
import PersonApprove from './PersonApprove'
import TokenConfig from './TokenConfig'
import styles from './index.less'
import { queryWorkspace,queryApprove, queryGetToken } from './services'
import { person_auth_info } from '@/services/user'
import _ from 'lodash'
import { history } from 'umi'
import { Scrollbars } from 'react-custom-scrollbars';
import { resizeDocumentHeightHook } from '@/utils/hooks'
import { requestCodeMessage } from '@/utils/utils'
const initTabFn = (tab:any) => {
    if(tab === 'approve') return 'approve'
    if(tab === 'tokenConfig') return 'tokenConfig'
    return 'workspace'
}
export default ( props : any ) => {
    const layoutHeight = resizeDocumentHeightHook()
    let search = props.location.query.person
    const [ tab , setTab ] = useState(initTabFn(search))
    const [authInfo,setAuthInfo] = useState<any>({avatar: '',first_name: '', last_name: '',sys_role: '',email: ''})
    const [data,setData] = useState<any>([])
    const [loading,setLoading] = useState(true)

    const getAuthInfo = async () => {
        let { data } = await person_auth_info()
        return data 
    }
    const getWorkspace = async () => {
        let { data, code } = await queryWorkspace()
        return {data,code}  
    }
    const getApprove = async () => {
        let { data, code } = await queryApprove()
        return {data,code}  
    }
    const getGetToken = async () => {
        let { data, code } = await queryGetToken()
        return { data, code }
    }
    const handleTabClick = async (tab: string) => {
        setTab(tab)
        history.push(`/personCenter?person=${tab}`)
        setLoading(true)
        setData([])
        let result: any = []
        let dataRes: any = []
        if (tab === 'workspace') {
            dataRes = await getWorkspace()
        }
        if (tab === 'approve') {
            dataRes = await getApprove()
        }
        if (tab === 'tokenConfig') {
            dataRes = await getGetToken()
        }
        if (dataRes.code === 200) {
            result = dataRes.data
            if (tab === 'workspace') result = dataRes.data && dataRes.data.workspace_list
        }
        if (dataRes.code !== 200) requestCodeMessage( dataRes.code , dataRes.msg )
        setData(result)
        setLoading(false)
        
    }
    useEffect(()=>{
        let qyeryTabTypeFn = getWorkspace
        if(search === 'approve') qyeryTabTypeFn = getApprove
        if(search === 'tokenConfig') qyeryTabTypeFn = getGetToken
        Promise.all([getAuthInfo(),qyeryTabTypeFn()])
        .then((result) => {
            setAuthInfo(result[0])
            if(search === 'tokenConfig'){
                const tokenList:any = _.get(result[1], 'data')
                setData(tokenList)
            } else if(search === 'approve'){
                const poverList:any = _.get(result[1], 'data')
                if(poverList && _.isArray(poverList)) setData(poverList)
            } else {
                const workspaceList:any = _.get(result[1], 'data.workspace_list')
                if(workspaceList && _.isArray(workspaceList)) setData(workspaceList)
            }
            setLoading(false)
        })
        .catch((e) => {
            setLoading(false)
            message.error('请求失败')
            console.log(e)
        })
    }, [])
    
    const handleSys_Role = (title_type: any) => {
        const dict = {
            user: '普通用户',
            sys_test_admin: '测试管理员',
            sys_admin: '系统管理员',
            super_admin: '超级管理员'
        }
        return dict[title_type]
    }
    const scroll = {
        // 最大高度，内容超出该高度会出现滚动条
        height: layoutHeight - 50
        // width: 2000
    }
    const currentUser = Object.prototype.toString.call(authInfo) === '[object Object]' ? authInfo : {}
    return (
        <Scrollbars style={scroll}>
            <Layout.Content className={styles.content}>

                <div className={styles.current_user}>
                    <Space>
                        <div className={styles.avatar}>
                            <Avatar size="small" src={currentUser.avatar || ''} alt="avatar" className={styles.avatar} />
                        </div>
                        <div >
                            <div className={styles.name}>{currentUser.first_name || currentUser.last_name} <Tag className={styles.role} style={{ opacity: currentUser.sys_role === 'user' ? 0 : 1 }}>{handleSys_Role(currentUser.sys_role)}</Tag></div>
                            <div className={styles.email}>{currentUser.email || ''} </div>
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
                        {tab === 'workspace' && <PersonWorkspace loading={loading} workspaceList={data} userId={Number(currentUser.id)}/>}
                    </Tabs.TabPane>
                    <Tabs.TabPane tab="我的申请" key="approve">
                        {tab === 'approve' && <PersonApprove loading={loading} approveData={data} handleTabClick={handleTabClick} userId={Number(currentUser.id)}/>}
                    </Tabs.TabPane>
                    <Tabs.TabPane tab="Token配置" key="tokenConfig">
                        {tab === 'tokenConfig' && <TokenConfig loading={loading} tokenData={data} />}
                    </Tabs.TabPane>
                </Tabs>
            </Layout.Content>
        </Scrollbars >
    )
}