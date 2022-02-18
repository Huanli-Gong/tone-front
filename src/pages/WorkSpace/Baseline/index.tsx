import React, { useState, useCallback } from 'react'
import { Tabs } from 'antd'
import Group from './Group'
import styles from './Group/index.less'
import { TabCard } from '@/components/UpgradeUI'
import { useLocation } from 'umi'

export default (props: any) => {
    const { query }: any = useLocation()
    const [tab, setTab] = useState(query.test_type || 'functional')

    const handleTabClick = useCallback((tab: string) => {
        setTab(tab)
    }, [])

    return (
        <TabCard
            title={
                <Tabs
                    defaultActiveKey={tab}
                    onTabClick={handleTabClick}
                    className={styles.tab_title}
                    activeKey={tab}
                >
                    <Tabs.TabPane tab="功能基线" key="functional" />
                    <Tabs.TabPane tab="性能基线" key="performance" />
                </Tabs>
            }
        >
            <Group baselineType={tab} />
        </TabCard>
    )
}