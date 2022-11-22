import React, { useCallback, useState } from 'react'
import { Tabs } from 'antd';
import { FormattedMessage } from 'umi'
import Standalone from './Standalone'
// import Aligroup from './AligroupOld'
import Aligroup from './Aligroup'
import { TabCard } from '@/components/UpgradeUI';
/**
 * 机器管理 - 云上机器
 */
export default (props: any) => {
    const { TabPane } = Tabs;
    const [tab, setTab] = useState('1')

    const handleTabClick = useCallback((t) => {
        setTab(t)
    }, [])

    return (
        <TabCard
            title={
                <Tabs defaultActiveKey="1" onTabClick={handleTabClick}>
                    <TabPane tab={<FormattedMessage id="standalone"/>} key={'1'} />
                    <TabPane tab={<FormattedMessage id="cluster"/>} key={'2'} />
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