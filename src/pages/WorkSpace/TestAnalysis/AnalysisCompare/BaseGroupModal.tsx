import { Space, Button, Spin, Table, Typography, Divider, Tabs, Steps, Collapse, Empty } from 'antd'
import { CaretRightFilled, CaretDownFilled, CaretRightOutlined } from '@ant-design/icons'
import React, { useState, useEffect, useRef } from 'react'
import { useClientSize } from '@/utils/hooks';
import { querySuiteList, queryConfList, queryDuplicate } from './services'
import styles from './index.less'
import _ from 'lodash'
import { Scrollbars } from 'react-custom-scrollbars';
import { ReactComponent as BaseIcon } from '@/assets/svg/BaseIcon.svg'
import ExpandTable from './ExpandTable'
import { getSelectedDataFn } from './CommonMethod';
import { requestCodeMessage } from '@/utils/utils';
import { Access, useAccess, useIntl, FormattedMessage, getLocale } from 'umi';
const { Panel } = Collapse;
const { Step } = Steps;
export default (props: any) => {
    const { formatMessage } = useIntl()
    const locale = getLocale() === 'en-US'

    const { height: layoutHeight } = useClientSize()
    const maxHeight = layoutHeight >= 728 ? layoutHeight - 128 : 600
    const access = useAccess()
    const { baselineGroup, handleCancle, onOk, baselineGroupIndex, creatReportOk } = props
    const groupAll = _.cloneDeep(props.allGroupData)
    groupAll.splice(baselineGroupIndex === -1 ? 0 : baselineGroupIndex, 1)
    const allGroupData = groupAll.filter((item: any) => _.get(item, 'members') && _.get(item, 'members').length) // 去掉空组但基线组除外
    const [suitData, setSuitData] = useState<any>({}) // 全量数据
    // const [copySuitData, setCopySuitData] = useState<any>({}) 
    const [duplicateData, setDuplicateData] = useState<any>([]) // 复制得全量数据
    const [oneLevelFunc, setOneLevelFunc] = useState<any>([])
    const [oneLevelPref, setOneLevelPref] = useState<any>([])
    const [confDataFunc, setConfDataFunc] = useState<any>([])
    const [confDataPref, setConfDataPref] = useState<any>([])
    const [loading, setLoading] = useState(true)
    const [duplicateLoading, setDuplicateLoading] = useState(false)
    const [tab, setTab] = useState('functional')
    const [selectedFuncRowKeys, setSelectedFuncRowKeys] = useState<any>([])
    const [selectedPerfRowKeys, setSelectedPerfRowKeys] = useState<any>([])
    const [currentStep, setCurrentStep] = useState(0)
    const [expandRepeatTableKey, setExpandRepeatTableKey] = useState<string[]>([])
    const [selSuiteData, setSelSuiteData] = useState<any>([])
    const [currentJobIndex, setCurrentJobIndex] = useState()
    const allFunRowKeys: any = useRef(null)
    const allPersRowKeys: any = useRef(null)

    const handleTabClick = (tab: string) => {
        setTab(tab)
    }

    const getemptyTableDom = () => {
        const emptyDom: any = document.querySelector('#list_container table .ant-empty-normal')
        if (emptyDom) {
            const scollHeight = maxHeight - 330 > 430 ? 430 : maxHeight - 330
            const number = (scollHeight - 70 - 55) / 2
            emptyDom.style.margin = `${number}px 0`
        }
    }

    useEffect(() => {
        getemptyTableDom()
    }, [suitData, tab, layoutHeight])

    const getSuitDetail = async (params: any) => {
        let { data, code, msg } = await querySuiteList(params)
        if (code === 200) {
            let obj1 = data.func_suite_dic || {}
            let obj2 = data.perf_suite_dic || {}
            const arrKey1 = Object.keys(obj1).map((keys: any) => String(keys))
            const arrKey2 = Object.keys(obj2).map((keys: any) => String(keys))
            allFunRowKeys.current = [...arrKey1]
            allPersRowKeys.current = [...arrKey2]
            let tabValue = !allFunRowKeys.current.length && allPersRowKeys.current.length
            if (tabValue) setTab('performance')
            setSelectedFuncRowKeys([...arrKey1 ])
            setSelectedPerfRowKeys([...arrKey2 ])
            setOneLevelFunc(Object.values(obj1))
            setOneLevelPref(Object.values(obj2))
            setSuitData(data)
            setConfDataFunc(obj1)
            setConfDataPref(obj2)
            setLoading(false)
        } else {
            requestCodeMessage(code, msg)
            setLoading(false)
        }
    }

    useEffect(() => {
        let flag = JSON.stringify(suitData.func_suite_dic) !== '{}' ? 'functional' : 'performance'
        if (currentStep === 0) setTab(flag)
        if (currentStep === 1) setTab('group0')
    }, [currentStep])

    useEffect(() => {
        let arr = _.get(baselineGroup, 'members')
        const paramData: any = {
            func_data: {
                base_job: [],
                compare_job: []
            },
            perf_data: {
                base_job: [],
                compare_job: []
            }
        }
        if (_.isArray(arr)) {
            const flag = baselineGroup.type === 'baseline'
            arr.forEach((item: any) => {
                if (!flag && item.test_type === '功能测试') {
                    paramData.func_data.is_baseline = 0
                    paramData.func_data.base_job.push(item.id)
                }
                if (!flag && item.test_type === '性能测试') {
                    paramData.perf_data.is_baseline = 0
                    paramData.perf_data.base_job.push(item.id)
                }
                if (flag && item.test_type === 'functional') {
                    paramData.func_data.is_baseline = 1
                    paramData.func_data.base_job.push(item.id)
                }
                if (flag && item.test_type === 'performance') {
                    paramData.perf_data.is_baseline = 1
                    paramData.perf_data.base_job.push(item.id)
                }
            })
        }
        let brrFun: any = []
        let brrFers: any = []
        allGroupData.forEach((item: any, index: number) => {
            let membersArr = _.get(item, 'members')
            if (_.isArray(membersArr)) {
                const flag = baselineGroup.type === 'baseline'
                membersArr.forEach((item: any) => {
                    if (!flag && item.test_type === '功能测试') {
                        brrFun.push(item.id)
                    }
                    if (!flag && item.test_type === '性能测试') {
                        brrFers.push(item.id)
                    }
                    if (flag && item.test_type === 'functional') {
                        brrFun.push(item.id)
                    }
                    if (flag && item.test_type === 'performance') {
                        brrFers.push(item.id)
                    }
                })
            }
        })
        paramData.func_data.compare_job = brrFun
        paramData.perf_data.compare_job = brrFers
        getSuitDetail(paramData)
    }, [])

    const handleClose = () => {
        handleCancle()
    }
    useEffect(() => {
        let obj1 = _.cloneDeep(suitData).func_suite_dic || {}
        let obj2 = _.cloneDeep(suitData).perf_suite_dic || {}
        if (tab === 'functional') {
            setOneLevelFunc(Object.values(obj1))
        } else {
            setOneLevelPref(Object.values(obj2))
        }
    }, [suitData, tab])

    const onExpand = async (expanded: boolean, record: any) => {
        const { test_job_id, suite_id } = record
        if (expanded) {
            const data = await queryConfList({ test_job_id, suite_id })
            if (data.code === 200) {
                const { conf_dic } = data.data
                if (tab === 'functional') {
                    confDataFunc[suite_id].conf_dic = conf_dic
                    setConfDataFunc({ ...confDataFunc })
                } else {
                    confDataPref[suite_id].conf_dic = conf_dic
                    setConfDataPref({ ...confDataPref })
                }
                setSelectedFuncRowKeys([...selectedFuncRowKeys, ...Object.keys(conf_dic).map((k: any) => Number(k))])
                setSelectedPerfRowKeys([...selectedPerfRowKeys, ...Object.keys(conf_dic).map((k: any) => Number(k))])
            }
        }
    }

    useEffect(() => {
        const confData = tab === 'functional' ? confDataFunc : confDataPref
        if (confData) {
            let id: any = Object.keys(confData).map((keys: any) => String(keys))
            let result = []
            let selectedKeys: any = []
            result = Object.values(confData).map((item: any, index: number) => {
                if (item.conf_dic && JSON.stringify(item.conf_dic) !== '{}') {
                    selectedKeys = [ ...Object.keys(item.conf_dic).map((i:any) => + i)]
                    item.conf_list = Object.values(item.conf_dic).map((value: any, index: number) => {
                        return (
                            {
                                key: value.conf_id,
                                suite_id: item.suite_id,
                                conf_id: value.conf_id,
                                conf_list: selectedKeys,
                                conf_name: value.conf_name,
                                title: 'Test conf',
                                level: 2,
                            }
                        )
                    })
                }
                return item
            })
            setOneLevelFunc(result)
            setOneLevelPref(result)
            allFunRowKeys.current = [...id, ...selectedKeys]
            allPersRowKeys.current = [...id, ...selectedKeys]
        }
    }, [tab, confDataFunc, confDataPref])

    const handleStepChange = async (current: number) => {
        setDuplicateLoading(true)
        let suite_data = tab === 'functional' ? _.cloneDeep(oneLevelFunc) : _.cloneDeep(oneLevelPref)
        if (current === 1) {
            let group_jobs: any = []
            const groupAll = _.cloneDeep(props.allGroupData)
            groupAll.map((item: any) => {
                group_jobs.push({
                    group_name: item.product_version,
                    is_baseline: item.type === 'baseline' ? 1 : 0,
                    test_job_id: [].concat(item.members.map((i: any) => i.id))
                })
            })
            let rowKeys = tab === 'functional' ? selectedFuncRowKeys : selectedPerfRowKeys
            let selectdRows = suite_data.filter((i: any) => rowKeys.includes(String(i.suite_id)))
            let suite_list: any = []
            selectdRows.forEach((item: any) => {
                let conf_list = item.conf_dic ? Object.keys(item.conf_dic).filter((i: any) => rowKeys.includes(+i)) : []
                conf_list = item.conf_dic && Object.keys(item.conf_dic).length === conf_list.length ? [] : conf_list
                let is_all = !!conf_list.length ? 0 : 1
                if (item.test_job_id.length > 1) {
                    suite_list.push({
                        suite_id: item.suite_id,
                        is_all,
                        conf_list,
                        test_job_id: item.test_job_id
                    })
                }
            })
            const params = {
                group_jobs,
                base_index:baselineGroupIndex === -1 ? 0 : baselineGroupIndex,
                suite_list
            }
            const { data, code, msg } = await queryDuplicate(params)
            if (code === 200) {
                if (JSON.stringify(data) === '{}') {
                    setSelSuiteData([])
                } else {
                    let arr = data.duplicate_data
                    let brr: any = []
                    arr = arr.map((item: any, groupIndex:number) => {
                        let suite_list = item.suite_list.map((i: any) => {
                            let conf_list = i.conf_list.map((conf: any, num: number) => {
                                let job_list = conf.job_list.map((child: any, idx: number) => {
                                    return {
                                        ...child,
                                        isSelect: idx === 0
                                    }
                                })
                                brr.push({
                                    conf_id: conf.conf_id,
                                    job_id: conf.job_list[0]?.job_id || '',
                                    key: groupIndex
                                })
                                return {
                                    ...conf,
                                    job_list
                                }
                            })
                            return {
                                ...i,
                                conf_list
                            }
                        })
                        return {
                            ...item,
                            suite_list,
                        }
                    })
                    setSelSuiteData(arr)
                    setDuplicateData(brr)
                }
                setDuplicateLoading(false)
            } else {
                requestCodeMessage(code, msg)
                setDuplicateLoading(false)
            }
        }
        setDuplicateLoading(false)
        setCurrentStep(current)
    }

    const handleOk = (sureOkFn: any) => {
        // let data = JSON.stringify(copySuitData) === '{}' ? suitData : copySuitData
        let func_suite = suitData.func_suite_dic || {}
        let perf_suite = suitData.perf_suite_dic || {}
        let allGroupData = props.allGroupData || []
        const baseIndex = baselineGroupIndex === -1 ? 0 : baselineGroupIndex
        let newSuiteData = {
            func_suite_dic: getSelectedDataFn(
                func_suite,
                allGroupData,
                baseIndex,
                selectedFuncRowKeys,
                duplicateData
            ),
            perf_suite_dic: getSelectedDataFn(
                perf_suite,
                allGroupData,
                baseIndex,
                selectedPerfRowKeys,
                duplicateData
            )
        }
        sureOkFn(newSuiteData)
    }

    const selectedChange = (record: any, selected: any) => {
        // 去掉未选组的job 开始
        let arrKeys = tab === 'functional' ? _.cloneDeep(selectedFuncRowKeys) : _.cloneDeep(selectedPerfRowKeys)
        if (selected) {
            if (!record.level) {
                let conf_list = []
                if(record.conf_list){
                    conf_list = record.conf_list.map((i:any) => i.conf_id)
                }
                arrKeys = [...arrKeys, record.suite_id + '', ...conf_list ]
            } else {
                arrKeys = [...arrKeys, record.conf_id, record.suite_id + '' ]
            }
        } else {
            if (!record.level) {
                if(record.conf_list){
                    let conf_list = record.conf_list.map((i:any) => i.conf_id)
                    arrKeys = arrKeys.filter((keys: any) => !conf_list.includes(keys))
                }
                arrKeys = arrKeys.filter((keys: any) => String(record.suite_id) !== keys )
            } else {
                arrKeys = arrKeys.filter((keys: any) => keys !== record.conf_id)
                let conf_list = record.conf_list.splice(0)
                conf_list = conf_list.filter((i:number) => i !== record.conf_id)
                if(conf_list.length === 0){
                    arrKeys = arrKeys.filter((keys: any) => keys !== String(record.suite_id))
                }
            }
        }
        arrKeys = Array.from(new Set(arrKeys))
        tab === 'functional' ? setSelectedFuncRowKeys(arrKeys) : setSelectedPerfRowKeys(arrKeys)
    }

    const rowSelection = {
        selectedRowKeys: tab === 'functional' ? selectedFuncRowKeys : selectedPerfRowKeys,
        preserveSelectedRowKeys: false,
        onSelect: selectedChange,
        checkStrictly: false,
        onSelectAll: (selected: boolean) => {
            if (!selected) tab === 'functional' ? setSelectedFuncRowKeys([]) : setSelectedPerfRowKeys([])
            if (selected) tab === 'functional' ? setSelectedFuncRowKeys(allFunRowKeys.current) : setSelectedPerfRowKeys(allPersRowKeys.current)
        },
    };
    const confRowSelection = {
        ...rowSelection,
        hideSelectAll: true,
    }

    const columns = [
        {
            dataIndex: 'suite_name',
            title: 'Test Suite',
            key: 'Test Suite',
        }
    ]
    const ConfColumns = [
        {
            dataIndex: 'conf_name',
            title: 'Test Conf',
            key: 'Test Conf',
        }
    ]


    let obj1 = _.cloneDeep(suitData).func_suite_dic || {}
    let obj2 = _.cloneDeep(suitData).perf_suite_dic || {}
    let dataSource: any = []
    if (tab === 'functional' && JSON.stringify(obj1) !== '{}') {
        dataSource = oneLevelFunc
    }
    if (tab === 'performance' && JSON.stringify(obj2) !== '{}') {
        dataSource = oneLevelPref
    }
    // 滚动条参数
    const tempHeight = maxHeight - 330 > 430 ? 430 : maxHeight - 330 + 14
    const scroll = {
        // 最大高度，内容超出该高度会出现滚动条
        height: currentStep === 1 ? (tempHeight - 44) : tempHeight,
        // width: 2000
    }

    const colCallback = (key: any) => {
        setExpandRepeatTableKey(key)
    }
    const handleChangeDefaultJob = (itemSuit: any, current: any, groupIndex: number | string) => {
        let arr = duplicateData.slice(0)
        const selectd = itemSuit[current].job_list
        arr = arr.map((item: any) => {
            if (item.conf_id === itemSuit[current].conf_id && item.key == groupIndex) {
                let job_id = selectd.filter((item:any) => item.isSelect)[0].job_id || ''
                return {
                    ...item,
                    job_id
                }
            }
            return {
                ...item,
            }
        })
        setDuplicateData(arr)
    }

    const selectRepeatData = () => {
        let currentGroupIndex = Number(tab.replace('group', ''))
        const flag = isNaN(currentGroupIndex)
        let cId = flag ? 0 : currentGroupIndex
        if (_.isUndefined(selSuiteData) || !selSuiteData.length) {
            return <Empty
                description={<FormattedMessage id="analysis.no.duplicate.data"/>}
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', margin: '0' }} />
        }
        return (
            <Collapse
                onChange={colCallback}
                activeKey={expandRepeatTableKey}
                expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
            >
                {
                    selSuiteData[cId].suite_list.map((item: any, idx: number) => {
                        return (
                            <Panel header={_.get(item, 'suite_name')} key={idx} className={styles.Panel}>
                                <ExpandTable
                                    setCurrentJobIndex={setCurrentJobIndex}
                                    currentJobIndex={currentJobIndex}
                                    currentTab={tab}
                                    itemSuitData={item}
                                    handleChangeDefaultJob={handleChangeDefaultJob} />
                            </Panel>
                        )
                    })
                }
            </Collapse>
        )
    }

    const selectCompareData = () => {
        return (
            <Table
                rowSelection={rowSelection}
                dataSource={dataSource}
                columns={columns}
                rowKey={(record: any) => record.suite_id + ''}
                loading={loading}
                pagination={false}
                size="small"
                expandable={{
                    onExpand: (_, record: any) => {
                        onExpand(_, record)
                    },
                    indentSize: 20,
                    expandedRowRender(record) {
                        return <Table
                            className={styles.ConfColum}
                            columns={ConfColumns}
                            dataSource={record.conf_list}
                            pagination={false}
                            rowKey={(record: any) => +record.conf_id}
                            rowSelection={confRowSelection}
                        />
                    },
                    // defaultExpandedRowKeys:selectedPerfRowKeys,

                    expandIcon: ({ expanded, onExpand, record }: any) => {
                        if (!record.level) {
                            return (
                                expanded ?
                                    (<CaretDownFilled onClick={e => onExpand(record, e)} />) :
                                    (<CaretRightFilled onClick={e => onExpand(record, e)} />)
                            )
                        }
                        return
                    },
                }}
            />
        )
    }

    const tabsReact = () => {
        return (
            <Tabs
                defaultActiveKey={tab}
                onTabClick={handleTabClick}
                className={styles.tab_title}
                activeKey={tab}
            >
                <Tabs.TabPane tab={<FormattedMessage id="functional.test"/>} key="functional" />
                <Tabs.TabPane tab={<FormattedMessage id="performance.test"/>} key="performance" />
            </Tabs>
        )
    }

    // “对比组”转换国际化方式显示
    const groupToLocale = (str: string) => {
        const temp =  str?.match(/^对比组[0-9]+$/) ? (formatMessage({id: 'analysis.comparison.group'}) + str.slice(3)) : str
        return temp
    }

    const allGroupReact = () => {
        const num = /^group[0-9]+$/.test(tab) ? tab.replace('group', '') : 0
        return (
            !!selSuiteData.length && <>
                <Tabs
                    defaultActiveKey={tab}
                    onTabClick={handleTabClick}
                    className={styles.tab_title}
                    activeKey={tab}
                >
                    {
                        selSuiteData.map((item: any, index: number) => {
                            return <Tabs.TabPane
                                tab={<>
                                    {baselineGroupIndex === index && <span style={{ marginRight: 5 }}><BaseIcon /></span>}
                                    {groupToLocale(item.group_name)}
                                </>}
                                key={`group${index}`} />
                        })
                    }
                </Tabs>
                <Typography.Text style={{ display: 'inline-block', height: '44px', lineHeight: '44px' }}>
                    {selSuiteData[num].desc}
                </Typography.Text>
            </>
        )
    }

    return (
        <div className={styles.compare_suite} id="list_container">
            <div className={styles.server_provider}>
                <Space>
                    <Typography.Text className={styles.script_right_name} strong={true}>
                        <FormattedMessage id="analysis.comparison.group" />
                    </Typography.Text>
                    <Typography.Text className={styles.script_right_name} >{baselineGroup && baselineGroup.product_version}</Typography.Text>
                </Space>
            </div>
            <div className={styles.line}>
                <Divider style={{
                    borderTop: '10px solid #F5F5F5',
                    width: 'calc(100% + 48px)',
                    transform: `translateX(-24px)`
                }} />
            </div>

            <Steps size="small" current={currentStep} onChange={handleStepChange} className={locale? styles.steps_en: styles.steps}>
                <Step title={<FormattedMessage id="analysis.select.comparison.data" />} />
                <Step title={<FormattedMessage id="analysis.select.duplicate.data" />} disabled={duplicateLoading} />
            </Steps>

            <Spin spinning={loading}>
                <div className={styles.suit_detail}>
                    {currentStep === 1 && allGroupReact()}
                    {currentStep === 0 && tabsReact()}
                    <Scrollbars style={scroll}>
                        {currentStep === 1 && selectRepeatData()}
                        {currentStep === 0 && selectCompareData()}
                    </Scrollbars>
                </div>
            </Spin>

            <div className={styles.bottom_button}>
                <Divider style={{ margin: '38px 0 12px 0', width: 'calc(100% + 48px)', transform: 'translateX(-24px)' }} />
                {
                    currentStep === 0 && <Space>
                        <Button onClick={handleClose}><FormattedMessage id="operation.cancel" /></Button>
                        {/* <Access accessible={access.IsWsSetting()}>
                            <Button disabled={loading} onClick={_.partial(handleOk, creatReportOk)}><FormattedMessage id="analysis.create.report" /></Button>
                        </Access>
                        <Button disabled={loading} onClick={_.partial(handleOk, onOk)}><FormattedMessage id="analysis.start.analysis" /></Button> */}
                        <Button type="primary" disabled={loading} onClick={_.partial(handleStepChange, 1)} loading={duplicateLoading}><FormattedMessage id="operation.next" /></Button>
                    </Space>
                }
                {
                    currentStep === 1 &&
                    <div>
                        <Button onClick={_.partial(handleStepChange, 0)} style={{ float: 'left' }}><FormattedMessage id="operation.previous" /></Button>
                        <Space>
                            <Button onClick={handleClose}><FormattedMessage id="operation.cancel" /></Button>
                            {/* <Access accessible={access.IsWsSetting()}>
                                <Button type="primary" disabled={loading} onClick={_.partial(handleOk, creatReportOk)}><FormattedMessage id="analysis.create.report" /></Button>
                            </Access> */}
                            <Button type="primary" disabled={loading} onClick={_.partial(handleOk, onOk)}><FormattedMessage id="analysis.start.analysis" /></Button>
                        </Space>
                    </div>
                }
            </div>
        </div>
    )
}
