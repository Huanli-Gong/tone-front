import React, { useMemo, useRef } from 'react'

import { TabCard } from '@/components/UpgradeUI'
import { Tabs, Button } from 'antd'
import { history, useLocation, useIntl, FormattedMessage } from 'umi'

import BasicTest from './BasicTest'
import SetDomain from './SetDomain'
import { BusinessList } from './BusinessTest'
import { useDomain } from './hooks'
import { ContainerContext } from './Provider'
import { runList } from '@/utils/utils';

const TestSuite: React.FC = () => {
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

    return (
        <ContainerContext.Provider
            value={{
                domainList,
                runList: runList.map((item) => ({ ...item, name: formatMessage({ id: item.id }) })),
                viewType: [
                    { id: 'Type1', name: formatMessage({ id: 'TestSuite.view_type.type1' }) },
                    { id: 'Type2', name: formatMessage({ id: 'TestSuite.view_type.type2' }) },
                    { id: 'Type3', name: formatMessage({ id: 'TestSuite.view_type.type3' }) },
                ]
            }}
        >
            <TabCard
                title={
                    <Tabs defaultActiveKey={query.test_type || 'functional'} onChange={handleTab} activeKey={testType} >
                        <Tabs.TabPane tab={<FormattedMessage id="functional.test" />} key="functional" />
                        <Tabs.TabPane tab={<FormattedMessage id="performance.test" />} key="performance" />
                        {!BUILD_APP_ENV ? <Tabs.TabPane tab={<FormattedMessage id="business.test" />} key="business" /> : null}
                        <Tabs.TabPane tab={<FormattedMessage id="TestSuite.domain.conf" />} key="domainconf" />
                    </Tabs>
                }
                extra={
                    <Button type="primary" onClick={addClick} >
                        <FormattedMessage id={`TestSuite.create.${testType}`} />
                    </Button>
                }
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