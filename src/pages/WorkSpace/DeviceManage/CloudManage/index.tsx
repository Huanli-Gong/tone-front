import React, { useState } from 'react'
import { Tabs } from 'antd';
import { FormattedMessage, useLocation, history, useParams } from 'umi'
import Standalone from './Standalone'
// import Aligroup from './AligroupOld'
import Aligroup from './Aligroup'
import { TabCard } from '@/components/UpgradeUI';
/**
 * 机器管理 - 云上机器
 */
export default () => {
    const { ws_id } = useParams() as any
    const { query: { t } } = useLocation() as any

    const { TabPane } = Tabs;
    const [tab, setTab] = useState(t ?? 'standalone')
    const [timeStr, setTimeStr] = useState(new Date().getTime())

    const handleTabClick = ($t: string) => {
        setTab($t)
        setTimeStr(new Date().getTime())
        history.push(`/ws/${ws_id}/device/cloud?t=${$t}`)
    }

    return (
        <TabCard
            title={
                <Tabs
                    defaultActiveKey="1"
                    onTabClick={handleTabClick}
                    activeKey={tab}
                >
                    <TabPane tab={<FormattedMessage id="standalone" />} key={'standalone'} />
                    <TabPane tab={<FormattedMessage id="cluster" />} key={'cluster'} />
                </Tabs>
            }
        >
            {
                tab === 'standalone' ?
                    <Standalone
                        key={timeStr}
                        tab={tab}
                    /> :
                    <Aligroup
                        key={timeStr}
                        tab={tab}
                    />
            }
        </TabCard>
    )
}