import React, { useCallback, useState } from 'react'
import { Tabs } from 'antd';
import { FormattedMessage, useLocation, history } from 'umi'
import Standalone from './Standalone'
// import Aligroup from './AligroupOld'
import Aligroup from './Aligroup'
import { TabCard } from '@/components/UpgradeUI';
/**
 * 机器管理 - 云上机器
 */
export default () => {
    const { pathname, query: { t } } = useLocation() as any

    const { TabPane } = Tabs;
    const [tab, setTab] = useState(t ?? '1')

    const handleTabClick = useCallback(($t) => {
        setTab($t)
        history.replace(`${pathname}?t=${$t}`)
    }, [pathname])

    return (
        <TabCard
            title={
                <Tabs
                    defaultActiveKey="1"
                    onTabClick={handleTabClick}
                    activeKey={tab}
                >
                    <TabPane tab={<FormattedMessage id="standalone" />} key={'1'} />
                    <TabPane tab={<FormattedMessage id="cluster" />} key={'2'} />
                </Tabs>
            }
        >
            {
                tab === '1' ?
                    <Standalone /> :
                    <Aligroup />
            }
        </TabCard>
    )
}