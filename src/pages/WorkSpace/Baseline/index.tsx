import React, { useState, useCallback } from 'react'
import { Tabs } from 'antd'
import Group from './Group'
import styles from './Group/index.less'
import { TabCard } from '@/components/UpgradeUI'
import { useLocation, FormattedMessage, useIntl } from 'umi'

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
                    <Tabs.TabPane tab={<FormattedMessage id="baseline.functional"/>} key="functional" />
                    <Tabs.TabPane tab={<FormattedMessage id="baseline.performance"/>} key="performance" />
                </Tabs>
            }
        >
            <Group baselineType={tab} />
        </TabCard>
    )
}