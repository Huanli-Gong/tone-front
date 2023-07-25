import React, { useState, useCallback, useRef } from 'react'
import { FormattedMessage, useLocation, history, useParams } from 'umi'
import Standalone from './Standalone'
import Cluster from './Cluster'
import { TabCard } from '@/components/UpgradeUI'
import { Tabs, Button } from 'antd'
import styled from "styled-components"

const CardStyles = styled(TabCard)`
    margin-bottom: 20px !important;
    .ant-card-body {
        padding: 0;
    }
`

/**
 * 机器管理 - 内网机器
 */

const GroupManagement: React.FC = (props) => {
    // 单机:'standalone'; 集群:'cluster';
    const { ws_id } = useParams() as any
    const { query: { t }, search } = useLocation() as any

    const [tab, setTab] = useState(t ?? 'standalone') // 默认单机
    const [timeStr, setTimeStr] = useState(new Date().getTime())

    const handleTabClick = ($tab: string) => {
        setTab($tab)
        history.push(`/ws/${ws_id}/device/group?t=${$tab}`)
        setTimeStr(new Date().getTime())
    }

    const standaloneRef: any = useRef(null)
    const clusterRef: any = useRef()

    const handleAddTestServer = useCallback(() => {
        standaloneRef.current.open()
    }, [])

    const handleCreateServer = useCallback(() => {
        clusterRef.current.open()
    }, [])

    React.useEffect(() => {
        if (!search)
            setTimeStr(new Date().getTime())
    }, [search])

    return (
        <>
            <CardStyles
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
            />
            <div
                style={{ paddingLeft: 20, paddingRight: 20 }}
                key={timeStr}
            >
                {
                    tab === 'standalone' ?
                        <Standalone ref={standaloneRef} {...props} onTabClick={handleTabClick} /> :
                        <Cluster ref={clusterRef} {...props} onTabClick={handleTabClick} />
                }
            </div>
        </>
    )
}

export default GroupManagement