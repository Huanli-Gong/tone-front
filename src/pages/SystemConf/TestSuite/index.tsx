import React, { useEffect, useMemo, useRef, useState } from 'react'

import { TabCard } from '@/components/UpgradeUI'
import { Tabs, Button } from 'antd'
import { history, useLocation } from 'umi'

import BasicTest from './BasicTest'
import SetDomain from './SetDomain'
import { BusinessList } from './BusinessTest'

import { useDomain } from './hooks'
import { ContainerContext } from './Provider'

const runList = [{ id: 'standalone', name: '单机' }, { id: 'cluster', name: '集群' }]
const viewType = [{ id: 'Type1', name: '所有指标拆分展示(Type1)' }, { id: 'Type2', name: '多Conf同指标合并(Type2)' }, { id: 'Type3', name: '单Conf多指标合并(Type3)' }]

const TestSuite = (props: any) => {
    const { query }: any = useLocation()

    const testType = useMemo(() => {
        return !query.test_type ? 'functional' : query.test_type
    }, [query])

    const domainList = useDomain()

    const handleTab = (tab: string) => {
        history.push(`${location.pathname}?test_type=${tab}`)
    }

    const basicTestAddRef = useRef<any>()
    const businessTestAddRef = useRef<any>()
    const domainConfAddRef = useRef<any>()

    const addClick = () => {
        if (testType === 'functional' || testType === 'performance') basicTestAddRef.current.openCreateDrawer()
        if (testType === 'business') businessTestAddRef.current.openCreateDrawer()
        if (testType === 'domainconf') domainConfAddRef.current.openCreateDrawer()
    }

    const buttonText = useMemo(() => {
        if (testType === 'functional') return `新增功能Test Suite`
        if (testType === 'performance') return '新增性能Test Suite'
        if (testType === 'business') return '新增业务Test Suite'
        if (testType === 'domainconf') return '新增领域'
        return '新增功能Test Suite'
    }, [testType])

    return (
        <ContainerContext.Provider
            value={{
                domainList,
                runList,
                viewType
            }}
        >
            <TabCard
                title={
                    <Tabs defaultActiveKey={ query.test_type || 'functional' } onChange={handleTab} activeKey={testType} >
                        <Tabs.TabPane tab="功能测试" key="functional" />
                        <Tabs.TabPane tab="性能测试" key="performance" />
                        <Tabs.TabPane tab="业务测试" key="business" />
                        <Tabs.TabPane tab="领域配置" key="domainconf" />
                    </Tabs>
                }
                extra={
                    <Button type="primary" onClick={addClick} >
                        {buttonText}
                    </Button>
                }
            // className={styles.warp}
            >
                {
                    (testType !== 'business' && testType !== 'domainconf') &&
                    <BasicTest
                        ref={basicTestAddRef}
                    />
                }
                {
                    testType === 'business' &&
                    <BusinessList
                        ref={businessTestAddRef}
                    />
                }
                {
                    testType === 'domainconf' &&
                    <SetDomain
                        ref={domainConfAddRef}
                    />
                }
            </TabCard>
        </ContainerContext.Provider>
    )
}

export default TestSuite