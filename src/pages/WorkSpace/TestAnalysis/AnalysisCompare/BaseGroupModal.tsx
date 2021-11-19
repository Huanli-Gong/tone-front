import { Space, Button, Spin, Table, Typography, message, Divider, Tabs, Steps, Collapse, Empty } from 'antd'
import { CaretRightFilled, CaretDownFilled, CaretRightOutlined } from '@ant-design/icons'
import React, { useState, useEffect, useRef } from 'react'
import { resizeDocumentHeightHook } from '@/utils/hooks';
import { querySuiteList } from './services'
import styles from './index.less'
import _ from 'lodash'
import { Scrollbars } from 'react-custom-scrollbars';
import { ReactComponent as BaseIcon } from '@/assets/svg/BaseIcon.svg'
import ExpandTable from './ExpandTable'
import { requestCodeMessage } from '@/utils/utils';
import { Access, useAccess } from 'umi';
const { Panel } = Collapse;
const { Step } = Steps;
export default (props: any) => {
    const layoutHeight = resizeDocumentHeightHook()
    const maxHeight = layoutHeight >= 728 ? layoutHeight - 128 : 600
    const access = useAccess()
    const { baselineGroup, handleCancle, onOk, baselineGroupIndex, creatReportOk } = props
    const groupAll = _.cloneDeep(props.allGroupData)
    groupAll.splice(baselineGroupIndex === -1 ? 0 : baselineGroupIndex, 1)
    const allGroupData = groupAll.filter((item: any) => _.get(item, 'members') && _.get(item, 'members').length) // 去掉空组但基线组除外
    const [suitData, setSuitData] = useState<any>({}) // 全量数据
    const [copySuitData, setCopySuitData] = useState<any>({}) // 复制得全量数据
    const [loading, setLoading] = useState(true)
    const [tab, setTab] = useState('functional')

    let [selectedFunRowKeys, setSelectedFunRowKeys] = useState<any>([])
    let [selectedPersRowKeys, setSelectedPersRowKeys] = useState<any>([])

    let [allObjKeyFun, setAllObjKeyFun] = useState<any>([])
    let [allObjKeyPerf, setAllObjKeyPerf] = useState<any>([])

    const [expandKeyFun, setExpandKeyFun] = useState<string[]>([])
    const [expandKeyPerf, setExpandKeyPerf] = useState<string[]>([])

    const [currentStep, setCurrentStep] = useState(0)
    const [expandRepeatTableKey, setExpandRepeatTableKey] = useState<string[]>([])
    const [selSuiteData, setSelSuiteData] = useState<any>()
    const [groupRelConf,setGroupRelConf] = useState(_.fill(Array(allGroupData.length + 1), 0))
    const [currentJobIndex,setCurrentJobIndex] = useState()

    const allFunRowKeys: any = useRef(null)
    const allPersRowKeys: any = useRef(null)

    const handleStepChange = (current: number) => {
        if (current === 1) {
            let func_suite = suitData.func_suite_dic || {}
            let perf_suite = suitData.perf_suite_dic || {}
            let newSuiteData = {
                func_suite_dic: getSelectedDataFn(func_suite, selectedFunRowKeys),
                perf_suite_dic: getSelectedDataFn(perf_suite, selectedPersRowKeys)
            }
            let func_suite_dic = _.cloneDeep(newSuiteData).func_suite_dic || {}
            let perf_suite_dic = _.cloneDeep(newSuiteData).perf_suite_dic || {}

            const selData = [...Object.values(func_suite_dic), ...Object.values(perf_suite_dic)]
            let selKeys = [...Object.keys(func_suite_dic), ...Object.keys(perf_suite_dic)]
            selKeys = selKeys.map(key => String(key))
            // 统计每个组下conf关联的job大于等于2的conf有多少条，空组除外
            const arr:any = _.fill(Array(allGroupData.length + 1), 0);
            selData.forEach((suite:any) => {
                const confDic = suite.conf_dic
                Object.values(confDic).forEach((conf: any) => {
                    const groupArr = conf['compare_groups']
                    const baseGroup = conf['base_obj_li']
                    if(_.isArray(baseGroup) && baseGroup.length > 1) arr[0] = ++arr[0] 
                    if(_.isArray(groupArr)) {
                        groupArr.forEach((item:any,index:number) => {
                            if(_.isArray(item) && item.length >1) arr[index + 1] = ++arr[index + 1]
                        })
                    }
                })
            })
            setGroupRelConf(arr)
            setSelSuiteData(selData)
            setExpandRepeatTableKey(selKeys)
        }

        setCurrentStep(current)

    }
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
    useEffect(() => {
        if (currentStep === 0) setTab('functional')
        if (currentStep === 1) {
            const index = _.findIndex(groupRelConf, function(o) { return o });
            setTab(`group${index}`)
        }
    }, [currentStep])

    const getSuitDetail = async (params: any) => {
        let { data, code, msg } = await querySuiteList(params)

        if (code === 200) {
            let obj1 = data.func_suite_dic || {}
            let obj2 = data.perf_suite_dic || {}
            const arrKey1 = Object.keys(obj1).map((keys: any) => String(keys))
            const arrKey2 = Object.keys(obj2).map((keys: any) => String(keys))
            const arrVal1 = Object.values(obj1)
            const arrVal2 = Object.values(obj2)
            let secondFunKeys: any = []
            let secondPersKeys: any = []
            let allObjKeyFun = {}
            let allObjKeyPerf = {}
            arrVal1.forEach((obj: any) => {
                const objConf = obj.conf_dic || {}
                secondFunKeys = [...secondFunKeys, ...Object.keys(objConf)]
                const id = obj.suite_id
                allObjKeyFun[id] = Object.keys(objConf)
                allObjKeyFun[id] = allObjKeyFun[id].map(keys => String(keys))

            })
            arrVal2.forEach((obj: any) => {
                const objConf = obj.conf_dic || {}
                secondPersKeys = [...secondPersKeys, ...Object.keys(objConf)]
                const id = obj.suite_id
                allObjKeyPerf[id] = Object.keys(objConf)
                allObjKeyPerf[id] = allObjKeyPerf[id].map(keys => String(keys))
            })

            secondFunKeys = secondFunKeys.map((keys: any) => String(keys))
            secondPersKeys = secondPersKeys.map((keys: any) => String(keys))

            allFunRowKeys.current = [...secondFunKeys, ...arrKey1]
            allPersRowKeys.current = [...secondPersKeys, ...arrKey2]
            if( !allFunRowKeys.current.length && allPersRowKeys.current.length) setTab('performance')
            setSelectedFunRowKeys([...secondFunKeys, ...arrKey1])
            setSelectedPersRowKeys([...secondPersKeys, ...arrKey2])

            setAllObjKeyFun(allObjKeyFun)
            setAllObjKeyPerf(allObjKeyPerf)

            setExpandKeyFun(arrKey1)
            setExpandKeyPerf(arrKey2)
            setSuitData(data)
            setCopySuitData(data)
            setLoading(false)
        } else {
            requestCodeMessage( code , msg )
            setLoading(false)
        }
    }
    useEffect(() => {
        let arr = _.get(baselineGroup, 'members')

        const paramData: any = {
            func_data: {
                base_obj_li: [],
                compare_groups: []
            },
            perf_data: {
                base_obj_li: [],
                compare_groups: []
            }
        }
        if (_.isArray(arr)) {
            const flag = baselineGroup.type === 'baseline'
            arr.forEach((item: any) => {
                if (!flag && item.test_type === '功能测试') {
                    paramData.func_data.base_obj_li.push({ is_job: 1, obj_id: item.id })
                }
                if (!flag && item.test_type === '性能测试') {
                    paramData.perf_data.base_obj_li.push({ is_job: 1, obj_id: item.id })
                }
                if (flag && item.test_type === 'functional') {
                    paramData.func_data.base_obj_li.push({ is_job: 0, obj_id: item.id, baseline_type: 'func' })
                }
                if (flag && item.test_type === 'performance') {
                    paramData.perf_data.base_obj_li.push({ is_job: 0, obj_id: item.id, baseline_type: 'perf' })
                }
            })
        }
         allGroupData.forEach((item: any, index: number) => {
            let membersArr = _.get(item, 'members')
            let brrFun: any = []
            let brrFers: any = []
            if (_.isArray(membersArr)) {
                const flag = baselineGroup.type === 'baseline'
                membersArr.forEach((item: any) => {
                    if (!flag && item.test_type === '功能测试') {
                        brrFun.push({ is_job: 1, obj_id: item.id })
                    }
                    if (!flag && item.test_type === '性能测试') {
                        brrFers.push({ is_job: 1, obj_id: item.id })
                    }
                    if (flag && item.test_type === 'functional') {
                        brrFun.push({ is_job: 0, obj_id: item.id, baseline_type: 'func' })
                    }
                    if (flag && item.test_type === 'performance') {
                        brrFers.push({ is_job: 0, obj_id: item.id, baseline_type: 'perf' })
                    }
                })
            }
            paramData.func_data.compare_groups[index] = brrFun
            paramData.perf_data.compare_groups[index] = brrFers

        })
        paramData.group_num = allGroupData.length + 1
        getSuitDetail(paramData)

    }, [])


    const handleClose = () => {
        // setPadding(false)
        handleCancle()
    }

    const getSelectedDataFn = (data: any, selectedKeys: any) => {
        const objKeys = tab === 'functional' ? allObjKeyFun : allObjKeyPerf
        // 二级
        
        const suite = _.cloneDeep(data)
        Object.values(suite).forEach((obj: any) => {
            const childKeys:any = objKeys[obj.suite_id + '']
            // 取交集
            const arr = _.intersection(selectedKeys,childKeys)
            if (selectedKeys.includes(String(obj.suite_id)) || arr.length) {
                const conf_dic = Object.keys(obj.conf_dic)
                conf_dic.forEach(keys => {
                    if (!selectedKeys.includes(keys)) {
                        delete obj.conf_dic[keys]
                    }
                })

            } else {
                delete suite[obj.suite_id]
            }
        })
        return suite

    }

    const handleOk = (sureOkFn:any) => {
        let func_suite = suitData.func_suite_dic || {}
        let perf_suite = suitData.perf_suite_dic || {}

        let newSuiteData = {
            func_suite_dic: getSelectedDataFn(func_suite, selectedFunRowKeys),
            perf_suite_dic: getSelectedDataFn(perf_suite, selectedPersRowKeys)
        }
        sureOkFn(newSuiteData)
    }

    const onExpand = async (expanded: boolean, record: any) => {
        const setFn = tab === 'functional' ? setExpandKeyFun : setExpandKeyPerf
        const arr = tab === 'functional' ? expandKeyFun : expandKeyPerf
        if (expanded) setFn([...arr, record.suite_id + ''])
        if (!expanded) {
            const brr = arr.filter(key => Number(key) !== Number(record.suite_id))
            setFn(brr)
        }
    }


    const selectedChange = (record, selected, selectedRows) => {
        if (String(record.suite_id).startsWith('test_conf')) return
        // 去掉未选组的job 开始
        let arrKeys = tab === 'functional' ? _.cloneDeep(selectedFunRowKeys) : _.cloneDeep(selectedPersRowKeys)
        const objKeys = tab === 'functional' ? allObjKeyFun : allObjKeyPerf
        if (selected) {
            let childKeys = []
            // 一级
            if (!record.level) {
                childKeys = objKeys[record.suite_id]
                arrKeys = [...arrKeys, record.suite_id + '', ...childKeys]
            } else {
                // 二级
                childKeys = objKeys[record.level_id]
                arrKeys = [...arrKeys, record.suite_id + '']
                const flag = childKeys.every(val => arrKeys.includes(val))
                if (flag) arrKeys = [...arrKeys, ...childKeys, record.level_id]
            }

            arrKeys = arrKeys.map(keys => String(keys))
            arrKeys = Array.from(new Set(arrKeys))
        } else {
            let childKeys: any = []
            // 一级
            if (!record.level) {
                childKeys = objKeys[record.suite_id + '']
                arrKeys = arrKeys.filter((keys: any) => !childKeys.includes(keys))
                arrKeys = arrKeys.filter((keys: any) => String(keys) !== String(record.suite_id))
            } else {
                // 二级
                arrKeys = arrKeys.filter((keys: any) => {
                    if (String(keys) !== String(record.suite_id) && String(keys) !== String(record.level_id)) {
                        return true
                    }
                    return false
                })
            }
        }

        tab === 'functional' ? setSelectedFunRowKeys(arrKeys) : setSelectedPersRowKeys(arrKeys)

    }
    const rowSelection = {
        selectedRowKeys: tab === 'functional' ? selectedFunRowKeys : selectedPersRowKeys,
        preserveSelectedRowKeys: false,
        onSelect: selectedChange,
        checkStrictly: false,
        onSelectAll: (selected: boolean) => {
            if (!selected) tab === 'functional' ? setSelectedFunRowKeys([]) : setSelectedPersRowKeys([])
            if (selected) tab === 'functional' ? setSelectedFunRowKeys(allFunRowKeys.current) : setSelectedPersRowKeys(allPersRowKeys.current)
        },
    };

    const columns = [
        {
            dataIndex: 'suite_name',
            title: 'Test Suite',
            key: 'Test Suite',
        }
    ]

    let oneLevelFunData: any = []
    let oneLevelPerslData: any = []
    let obj1 = _.cloneDeep(suitData).func_suite_dic || {}
    let obj2 = _.cloneDeep(suitData).perf_suite_dic || {}
    const arrKey1 = Object.keys(obj1)
    const arrKey2 = Object.keys(obj2)
    const arrVal1 = Object.values(obj1)
    const arrVal2 = Object.values(obj2)
    oneLevelFunData = arrVal1.map((obj: any, index: number) => ({ ...obj, suite_id: arrKey1[index] }))
    oneLevelPerslData = arrVal2.map((obj: any, index: number) => ({ ...obj, suite_id: arrKey2[index] }))
    let oneLevelDetailData = tab === 'functional' ? oneLevelFunData : oneLevelPerslData

    oneLevelDetailData = oneLevelDetailData.map((item: any, index: number) => {
        const aa = {
            key: 2234,
            suite_id: `test_conf_${index}`,
            suite_name: 'Test conf',
            title: 'Test conf',
            level: 2
        }
        const obj = item.conf_dic
        item.children = Object.values(obj)
        item.children = item.children.map((value: any, index: number) => {
            return (
                {
                    key: value.conf_id,
                    suite_id: value.conf_id,
                    suite_name: value.conf_name,
                    title: 'Test conf',
                    level: 2,
                    level_id: item.suite_id
                }
            )
        })
        item.children.unshift(aa)
        return item
    })
    // 滚动条参数
    const scroll = {
        // 最大高度，内容超出该高度会出现滚动条
        height: maxHeight - 330 > 430 ? 430 : maxHeight - 330 + 14,
        // width: 2000
    }
    const colCallback = (key: any) => {
        setExpandRepeatTableKey(key)
    }
    const handleChangeDefaultJob = (itemSuitId: any, itemSuit: any) => {
        let suiteCopy = _.cloneDeep(suitData)
        let func_suite_dic = suitData.func_suite_dic || {}
        let perf_suite_dic = suitData.perf_suite_dic || {}
        let flag = true
        for (let key in func_suite_dic) {
            if (String(key) === String(itemSuitId) && flag) {
                func_suite_dic[key] = itemSuit
                flag = false
            }
        }
        if (flag) {
            for (let key in perf_suite_dic) {
                if (String(key) === String(itemSuitId) && flag) {
                    perf_suite_dic[key] = itemSuit
                    flag = false
                }
            }
        }
        suiteCopy = { ...suiteCopy, func_suite_dic, perf_suite_dic }

        let selSuiteDataCopy = _.cloneDeep(selSuiteData)
        selSuiteDataCopy = selSuiteDataCopy.map((item: any) => {
            if (String(_.get(item, 'suite_id')) === String(itemSuitId)) return itemSuit
            return item
        })
        setSelSuiteData(selSuiteDataCopy)
        setCopySuitData(suiteCopy)
        setSuitData(suiteCopy)
    }
    const selectRepeatData = () => {
        // if(!selSuiteData.length) return ''
        let currentGroupIndex = Number(tab.replace('group', ''))
        const flag = isNaN(currentGroupIndex)
        const blag = groupRelConf.every(val => val === 0)
        if(!selSuiteData.length || blag) {
            return <Empty 
            description="暂无重复数据"
            image={Empty.PRESENTED_IMAGE_SIMPLE} 
            style={{position: 'absolute',top: '50%',left: '50%',transform: 'translate(-50%, -50%)', margin: '0'}}/>
        }
        return (
            <Collapse
                onChange={colCallback}
                activeKey={expandRepeatTableKey}
                expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
            >
                {
                    selSuiteData.map((item: any) => {
                        const confDic = item.conf_dic
                        let arr: any = []
                        Object.values(confDic).forEach((obj: any) => {
                            const isFlag = !flag && currentGroupIndex > 0
                            const groupArr = isFlag ? obj['compare_groups'][currentGroupIndex - 1] : obj['base_obj_li']
                            if (groupArr.length > 1) arr = [...arr, ...groupArr]
                        })
                        if(!arr.length) return ''
                        return (
                            <Panel header={_.get(item, 'suite_name')} key={_.get(item, 'suite_id')} className={styles.Panel}>
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
                dataSource={oneLevelDetailData}
                columns={columns}
                rowKey={(record: any) => record.suite_id + ''}
                loading={loading}
                pagination={false}
                size="small"
                expandable={{
                    onExpand: (_, record: any) => {
                        onExpand(_, record)
                    },

                    expandedRowKeys: tab === 'functional' ? expandKeyFun : expandKeyPerf,
                    expandIcon: ({ expanded, onExpand, record }: any) => {
                        if (!record.children) return
                        return (
                            expanded ?
                                (<CaretDownFilled onClick={e => onExpand(record, e)} />) :
                                (<CaretRightFilled onClick={e => onExpand(record, e)} />)
                        )
                    },
                    defaultExpandedRowKeys: tab === 'functional' ? expandKeyFun : expandKeyPerf,
                    defaultExpandAllRows: true,
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
                <Tabs.TabPane tab="功能测试" key="functional" />
                <Tabs.TabPane tab="性能测试" key="performance" />
            </Tabs>
        )
    }
    const allGroupReact = () => {
        let groupAll = _.cloneDeep(allGroupData)
        const baseGroup = _.cloneDeep(baselineGroup)
        if (JSON.stringify(baseGroup) === '{}' && !groupAll.length) return ''
        groupAll = [baseGroup, ...groupAll]// 去掉空组
        const num = /^group[0-9]+$/.test(tab) ? tab.replace('group', '') : 0
        const blag = groupRelConf.every(val => val === 0)

        return (
            <>
                <Tabs
                    defaultActiveKey={tab}
                    onTabClick={handleTabClick}
                    className={styles.tab_title}
                    activeKey={tab}
                >
                    {
                        groupAll.map((groupItem: any, index: number) => {
                            if (!groupRelConf[index]) return ''
                            const version = _.get(groupItem, 'product_version')
                            return <Tabs.TabPane
                                tab={<>
                                    {index === 0 && <span style={{ marginRight: 5 }}><BaseIcon /></span>}
                                    {version}
                                </>}
                                key={`group${index}`} />
                        })
                    }
                </Tabs>
                {!blag && <Typography.Text style={{display: 'inline-block',height: '44px',lineHeight: '44px'}}>注：{groupRelConf[num]}个conf有重复job数据</Typography.Text>}
            </>
        )
    }
    return (
        <div className={styles.compare_suite} id="list_container">
            <div className={styles.server_provider}>
                <Space>
                    <Typography.Text className={styles.script_right_name} strong={true}>对比组</Typography.Text>
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

            <Steps size="small" current={currentStep} onChange={handleStepChange} className={styles.steps}>
                <Step title="选择对比数据" />
                <Step title="选择重复数据" disabled={loading}/>
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
                        <Button onClick={handleClose}>取消</Button>
                        <Access accessible={access.wsRoleContrl()}>
                            <Button disabled={loading} onClick={_.partial(handleOk, creatReportOk)}>生成报告</Button>
                        </Access>
                        <Button disabled={loading} onClick={_.partial(handleOk, onOk)}>开始分析</Button>
                        <Button type="primary" disabled={loading} onClick={_.partial(handleStepChange, 1)}>下一步</Button>
                    </Space>
                }
                {/* {
                    currentStep === 1 &&
                    <Button onClick={handleClose}>上一步</Button>
                } */}

                {
                    currentStep === 1 &&
                    <div>
                        <Button onClick={_.partial(handleStepChange, 0)} style={{float:'left'}}>上一步</Button>
                        <Space>
                            <Button onClick={handleClose}>取消</Button>
                            <Access accessible={access.wsRoleContrl()}>
                                <Button type="primary" disabled={loading} onClick={_.partial(handleOk, creatReportOk)}>生成报告</Button>
                            </Access>
                            <Button type="primary" disabled={loading} onClick={_.partial(handleOk, onOk)}>开始分析</Button>
                        </Space>
                    </div>
                }
            </div>
        </div>

    )
}
