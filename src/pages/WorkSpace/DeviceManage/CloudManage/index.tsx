import React, { useCallback, useRef, useState } from 'react'
import { Tabs, Button } from 'antd';
import { useIntl, FormattedMessage } from 'umi'
import Standalone from './Standalone'
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

    const AligroupRef: any = useRef()

    return (
        <TabCard
            title={
                <Tabs defaultActiveKey="1" onTabClick={handleTabClick}>
                    <TabPane tab={<FormattedMessage id="standalone"/>} key={'1'} />
                    <TabPane tab={<FormattedMessage id="cluster"/>} key={'2'} />
                    {/* <TabPane tab="云上单机" key={'1'} />
                    <TabPane tab="云上集群" key={'2'} /> */}
                </Tabs>
            }
            extra={
                tab === '2' &&
                <Button type="primary" onClick={() => AligroupRef.current.open()}>
                    <FormattedMessage id="device.cluster.btn"/>
                </Button>
            }
        >
            {
                tab === '1' ?
                    <Standalone /> :
                    <Aligroup ref={AligroupRef} />
            }
        </TabCard>
    )
}