import React, { useState, useCallback, useRef } from 'react'

import Standalone from './Standalone'
import Cluster from './Cluster'
import { TabCard } from '@/components/UpgradeUI'
import { Tabs, Button } from 'antd'

/**
 * 机器管理 - 内网机器
 */
export default (props: any) => {
    // 单机:'standalone'; 集群:'cluster';
    const [tab, setTab] = useState('standalone') // 默认单机

    const handleTabClick = useCallback((tab) => {
        setTab(tab)
    }, [])

    const standaloneRef: any = useRef(null)
    const clusterRef: any = useRef()

    const handleAddTestServer = useCallback(() => {
        standaloneRef.current.open()
    }, [])

    const handleCreateServer = useCallback(() => {
        clusterRef.current.open()
    }, [])

    return (
        <TabCard
            title={
                <Tabs defaultActiveKey='standalone' onTabClick={ handleTabClick }>
                    {/* <Tabs.TabPane key="standalone" tab={`内网单机`} />
                    <Tabs.TabPane key="cluster" tab={`内网集群`} /> */}
                    <Tabs.TabPane key="standalone" tab={`单机`} />
                    <Tabs.TabPane key="cluster" tab={`集群`} />
                </Tabs>
            }
            extra={
                tab === 'standalone' ?
                    <Button key="1" type="primary" onClick={handleAddTestServer}>添加机器</Button>
                    :
                    <Button key="2" type="primary" onClick={handleCreateServer}>创建集群</Button>
            }
        >
            {
                tab === 'standalone' ?
                    <Standalone ref={standaloneRef} {...props} onTabClick={handleTabClick} /> :
                    <Cluster ref={clusterRef} {...props} onTabClick={handleTabClick} />
            }
        </TabCard>

    )
}