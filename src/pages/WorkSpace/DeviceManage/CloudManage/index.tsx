import React, { useCallback, useRef, useState } from 'react'
import { Tabs, Button } from 'antd';
import Standalone from './Standalone'
import Aligroup from './Aligroup'
import { TabCard } from '@/components/UpgradeUI';
import { AuthCommon } from '@/components/Permissions/AuthCommon';

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
                    <TabPane tab="云上单机" key={'1'} />
                    <TabPane tab="云上集群" key={'2'} />
                </Tabs>
            }
            extra={
                tab === '2' &&
                <AuthCommon
                    key="add_group"
                    isAuth={['super_admin', 'sys_admin', 'ws_owner', 'ws_admin', 'ws_test_admin']}
                    children={<Button type="primary" > 创建集群 </Button>}
                    onClick={() => AligroupRef.current.open()}
                />
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