import React, { useState, useCallback, useRef } from 'react'
import { FormattedMessage, useLocation, history } from 'umi'
import Standalone from './Standalone'
import Cluster from './Cluster'
import { TabCard } from '@/components/UpgradeUI'
import { Tabs, Button } from 'antd'

/**
 * 机器管理 - 内网机器
 */

const GroupManagement: React.FC = (props) => {
    // 单机:'standalone'; 集群:'cluster';
    const { pathname, query: { t } } = useLocation() as any

    const [tab, setTab] = useState(t ?? 'standalone') // 默认单机

    const handleTabClick = useCallback(($tab) => {
        setTab($tab)
        history.replace(`${pathname}?t=${$tab}`)
    }, [pathname])

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
                <Tabs defaultActiveKey='standalone' activeKey={tab} onTabClick={handleTabClick}>
                    {/* <Tabs.TabPane key="standalone" tab={`内网单机`} />
                    <Tabs.TabPane key="cluster" tab={`内网集群`} /> */}
                    <Tabs.TabPane key="standalone" tab={<FormattedMessage id="standalone" />} />
                    <Tabs.TabPane key="cluster" tab={<FormattedMessage id="cluster" />} />
                </Tabs>
            }
            extra={
                tab === 'standalone' ?
                    <Button key="1" type="primary" onClick={handleAddTestServer}>
                        <FormattedMessage id="device.add.btn" />
                    </Button>
                    : <Button key="2" type="primary" onClick={handleCreateServer}>
                        <FormattedMessage id="device.cluster.btn" />
                    </Button>
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

export default GroupManagement