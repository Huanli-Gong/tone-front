import React, { useEffect, useMemo, useRef, useState } from 'react'

import { TabCard } from '@/components/UpgradeUI'
import { Tabs, Button } from 'antd'
import { history, useLocation, useIntl, FormattedMessage } from 'umi'

import BasicTest from './BasicTest'
import SetDomain from './SetDomain'
import { BusinessList } from './BusinessTest'
import { useDomain } from './hooks'
import { ContainerContext } from './Provider'
import { runList } from '@/utils/utils';

const TestSuite = (props: any) => {
    const { formatMessage } = useIntl()
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
        if (testType === 'functional') return <FormattedMessage id='TestSuite.create.functional'/>
        if (testType === 'performance') return <FormattedMessage id='TestSuite.create.performance'/>
        if (testType === 'business')   return <FormattedMessage id='TestSuite.create.business'/>
        if (testType === 'domainconf') return <FormattedMessage id='TestSuite.create.domainconf'/>
        return <FormattedMessage id='TestSuite.create.functional'/>
    }, [testType])

    return (
        <ContainerContext.Provider
            value={{
                domainList,
                runList: runList.map((item)=> ({...item, name: formatMessage({id: item.id}) }) ),
                viewType: [
                    { id: 'Type1', name: formatMessage({id: 'TestSuite.view_type.type1'}) }, 
                    { id: 'Type2', name: formatMessage({id: 'TestSuite.view_type.type2'}) }, 
                    { id: 'Type3', name: formatMessage({id: 'TestSuite.view_type.type3'}) },
                ]
            }}
        >
            <TabCard
                title={
                    <Tabs defaultActiveKey={ query.test_type || 'functional' } onChange={handleTab} activeKey={testType} >
                        <Tabs.TabPane tab={<FormattedMessage id="functional.test"/>} key="functional" />
                        <Tabs.TabPane tab={<FormattedMessage id="performance.test"/>} key="performance" />
                        <Tabs.TabPane tab={<FormattedMessage id="TestSuite.domain.conf"/>} key="domainconf" />
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