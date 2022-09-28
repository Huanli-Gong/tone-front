import React, { useState } from 'react'
import { Tabs } from 'antd'

import JobModal from './JobModal'
import JobType from './JobType'
import { history, useAccess, Access, useIntl, FormattedMessage } from 'umi'
import { PlusOutlined } from '@ant-design/icons'
import styles from './index.less'
import { useHeaderContext } from '../Provider'

const JobTypeTab: React.FC<Record<string, any>> = ({ onOk }) => {
    const { formatMessage } = useIntl()
    const { ws_id } = useHeaderContext()
    const [tab, setTab] = useState('1')
    const [testType, setTestType] = useState('全部')
    const handleTabClick = (tab: string) => {
        setTab(tab)
        setTestType('全部')
    }
    const access = useAccess()
    const handleCreateJobType = () => {
        onOk()
        history.push({ pathname: `/ws/${ws_id}/job/create` })
    }
    const renderChild = (
        <>
            <PlusOutlined style={{ fontSize: 9, color: '#1890FF', marginRight: 6, transform: 'translateY(-1px)' }} />
            <span className={styles.create_job_type_text}><FormattedMessage id={`header.create_job_type_text`} /></span>
        </>
    )
    const operations = (
        <Access accessible={access.WsMemberNoPermission()}>
            <div onClick={handleCreateJobType}>{renderChild}</div>
        </Access>
    );
    const typeName = (type: string) => {
        switch (type) {
            case '功能测试': return 'functional'
            case '性能测试': return 'performance'
            case '业务测试': return 'business'
            case '稳定性测试': return 'stability'
            default: return 'all'
        }
    }
    // 匹配类型进行数据过滤
    const handleJobTypeData = (dataSource: []): any[] => {
        if (['全部'].includes(testType)) return dataSource
        // tab1后端返回英文；tab2后端返回中文
        const type = tab === '1' ? typeName(testType) : testType
        return dataSource.filter((item: any) => item && item.test_type === type)
    }

    const testTypeDom = () => {
        const type = [{ key: '全部', name: 'all' }, { key: '功能测试', name: 'functional' }, { key: '性能测试', name: 'performance' }]
        return (
            <ul className={styles.test_type}>
                {
                    type.map((value, index) => (
                        <li
                            key={index}
                            onClick={() => setTestType(value.key)}
                            style={{ color: testType === value.key ? '#1890ff' : 'rgba(0,0,0,0.85)' }}
                        >
                            {
                                value.name &&
                                <FormattedMessage id={`header.${value.name}`} />
                            }
                        </li>
                    ))
                }
            </ul>
        )
    }

    React.useEffect(() => {
        setTestType('全部')
    }, [ws_id])
    return (
        <Tabs
            defaultActiveKey={tab}
            tabBarExtraContent={tab == '1' ? operations : <></>}
            className={styles.job_drop_menu}
            onTabClick={handleTabClick}
            style={{ minWidth: 468, maxWidth: 912, width: 912 }}
        >
            <Tabs.TabPane tab={<FormattedMessage id="header.create.by.job" />} key="1">
                {testTypeDom()}
                <JobType onOk={onOk} getData={handleJobTypeData} />
            </Tabs.TabPane>
            {access.IsWsSetting() &&
                <Tabs.TabPane tab={<FormattedMessage id="header.create.by.template" />} key="2">
                    {testTypeDom()}
                    <JobModal onOk={onOk} getData={handleJobTypeData} testType={testType} />
                </Tabs.TabPane>
            }
        </Tabs>
    )
}

export default JobTypeTab