import React, { useState, useRef } from 'react'
import { Button, Tabs } from 'antd'
import SystemScript from './SystemScript'
import SystemParameter from './SystemParameter'
import { useIntl, FormattedMessage } from 'umi'
import styles from '@/pages/SystemConf/MenuLayout/style.less'
import { TabCard } from '@/components/UpgradeUI'

export default (props: any) => {
    const { formatMessage } = useIntl()
    const { location } = props

    const [tab, setTab] = useState(location.query.t || 'script')
    const addConfigDrawer: any = useRef()

    const handleTabClick = (tab: string) => {
        setTab(tab)
        //history.push(`/system/basic?t=${ tab }`)
    }

    return (
        <TabCard
            title={
                <Tabs
                    defaultActiveKey={'script'}
                    onTabClick={handleTabClick}
                    className={styles.tab_style}
                >
                    <Tabs.TabPane tab={<FormattedMessage id="basic.script"/>} key="script" />
                    <Tabs.TabPane tab={<FormattedMessage id="basic.sys"/>} key="sys" />
                </Tabs>
            }
            extra={
                tab === 'sys' &&
                <Button type="primary" onClick={() => addConfigDrawer.current.openSetting()}>
                    <FormattedMessage id="basic.new.config"/>
                </Button>
            }
        >
            {
                tab === 'sys' ? 
                    <SystemParameter ref={ addConfigDrawer }/> :
                    <SystemScript/>
            }
        </TabCard>
    )
}