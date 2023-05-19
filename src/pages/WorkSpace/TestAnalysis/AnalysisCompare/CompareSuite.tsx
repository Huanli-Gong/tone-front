/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable react/no-array-index-key */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-shadow */

import { Drawer, Space, Button, Spin, Table, Typography, Divider, Tabs } from 'antd'
import { CaretRightFilled, CaretDownFilled } from '@ant-design/icons'
import { forwardRef, useState, useImperativeHandle, useEffect, useRef } from 'react'
import { useIntl, FormattedMessage } from 'umi'
import { querySuiteList } from './services'
import styles from './index.less'
import _ from 'lodash'
import { requestCodeMessage } from '@/utils/utils'
export default forwardRef(
    (props: any, ref: any) => {
        const { formatMessage } = useIntl()
        const [padding, setPadding] = useState(false) // 确定按钮是否置灰
        const [visible, setVisible] = useState(false) // 控制弹框的显示与隐藏
        const [title, setTitle] = useState('') // 弹框顶部title
        const [editer, setEditer] = useState<any>({}) // 编辑的数据
        const [suitData, setSuitData] = useState<any>({})
        const [loading, setLoading] = useState(true)
        const [tab, setTab] = useState('functional')
        const [selectedFunRowKeys, setSelectedFunRowKeys] = useState<any>([])
        const [selectedPersRowKeys, setSelectedPersRowKeys] = useState<any>([])

        const [allObjKeyFun, setAllObjKeyFun] = useState<any>([])
        const [allObjKeyPerf, setAllObjKeyPerf] = useState<any>([])

        const [expandKeyFun, setExpandKeyFun] = useState<string[]>([])
        const [expandKeyPerf, setExpandKeyPerf] = useState<string[]>([])
        const allFunRowKeys: any = useRef(null)
        const allPersRowKeys: any = useRef(null)

        const handleTabClick = ($tab: string) => {
            setTab($tab)
        }
        useEffect(() => {
            try {
                const otr = document.querySelectorAll('tr[class = "ant-table-row ant-table-row-level-1 ant-table-row-selected"]')
                Array.from(otr).forEach((ele: any) => ele.style.transform = 'translateX(43px)')

                const aspan = document.querySelectorAll('tr[class = "ant-table-row ant-table-row-level-1 ant-table-row-selected"] span[class = "ant-table-row-indent indent-level-1"]')
                Array.from(aspan).forEach((ele: any) => {
                    ele.style.padding = 0
                    ele.parentNode.style.paddingLeft = 0
                })

                const ohead = document.querySelectorAll('tr[data-row-key = "test_conf"]>td')
                Array.from(ohead).forEach((ele: any) => (ele.style.background = 'rgba(0,0,0,0.02)'))

                const checkTr = document.querySelectorAll('tr[data-row-key = "test_conf"]>td[class = "ant-table-cell ant-table-selection-column"]>label')
                Array.from(checkTr).forEach((ele: any) => ele.style.opacity = 0)

                const firstLevelTr = document.querySelectorAll('tr[class = "ant-table-row ant-table-row-level-0 ant-table-row-selected"] span[role = "img"]')
                Array.from(firstLevelTr).forEach((ele: any) => ele.style.transform = 'translateX(-10px)')
            } catch (error) {
                console.log(error)
            }

        }, [suitData, tab])

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
                    allObjKeyFun[id] = allObjKeyFun[id].map((keys: any) => String(keys))

                })
                arrVal2.forEach((obj: any) => {
                    const objConf = obj.conf_dic || {}
                    secondPersKeys = [...secondPersKeys, ...Object.keys(objConf)]
                    const id = obj.suite_id
                    allObjKeyPerf[id] = Object.keys(objConf)
                    allObjKeyPerf[id] = allObjKeyPerf[id].map((keys: any) => String(keys))
                })

                secondFunKeys = secondFunKeys.map((keys: any) => String(keys))
                secondPersKeys = secondPersKeys.map((keys: any) => String(keys))

                allFunRowKeys.current = [...secondFunKeys, ...arrKey1]
                allPersRowKeys.current = [...secondPersKeys, ...arrKey2]

                setSelectedFunRowKeys([...secondFunKeys, ...arrKey1])
                setSelectedPersRowKeys([...secondPersKeys, ...arrKey2])

                setAllObjKeyFun(allObjKeyFun)
                setAllObjKeyPerf(allObjKeyPerf)

                setExpandKeyFun(arrKey1)
                setExpandKeyPerf(arrKey2)
                setSuitData(data)
                setLoading(false)
            } else {
                requestCodeMessage(code, msg)
                setLoading(false)
            }
        }

        useImperativeHandle(
            ref,
            () => ({
                show: (title: string = formatMessage({ id: 'analysis.select.benchmark.group' }), data: any = {}) => {
                    setVisible(true)
                    setTitle(title)
                    setEditer(data)
                    let arr = _.get(data, 'members')
                    const paramData: any = {
                        func_data: [],
                        perf_data: []
                    }
                    if (_.isArray(arr)) {
                        const flag = data.type === 'baseline'
                        arr.forEach((item: any) => {
                            if (!flag && item.test_type === '功能测试') {
                                paramData.func_data.push({ is_job: 1, obj_id: item.id })
                            }
                            if (!flag && item.test_type === '性能测试') {
                                paramData.perf_data.push({ is_job: 1, obj_id: item.id })
                            }
                            if (flag && item.test_type === 'functional') {
                                paramData.func_data.push({ is_job: 0, obj_id: item.id })
                            }
                            if (flag && item.test_type === 'performance') {
                                paramData.perf_data.push({ is_job: 0, obj_id: item.id })
                            }
                        })
                    }

                    getSuitDetail(paramData)
                }
            })
        )
        const handleClose = () => {
            setPadding(false)
            setVisible(false)
        }

        const getSelectedDataFn = (data: any) => {
            const suite = _.cloneDeep(data)
            Object.values(suite).forEach((obj: any) => {
                if (selectedFunRowKeys.includes(String(obj.suite_id))) {
                    const conf_dic = Object.keys(obj.conf_dic)
                    conf_dic.forEach(keys => {
                        if (!selectedFunRowKeys.includes(keys)) {
                            delete obj.conf_dic[keys]
                        }
                    })

                } else {
                    delete suite[obj.suite_id]
                }
            })
            return suite

        }

        const handleOk = () => {
            let func_suite = suitData.func_suite_dic || {}
            let perf_suite = suitData.perf_suite_dic || {}
            let newSuiteData = {
                func_suite_dic: getSelectedDataFn(func_suite),
                perf_suite_dic: getSelectedDataFn(perf_suite)
            }
            props.onOk(newSuiteData)
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

        /* @ts-ignore */
        const selectedChange = (record, selected, selectedRows) => {
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
                    /* @ts-ignore */
                    const flag = childKeys.every(val => arrKeys.includes(val))
                    if (flag) arrKeys = [...arrKeys, ...childKeys, record.level_id]
                }

                /* @ts-ignore */
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

        oneLevelDetailData = oneLevelDetailData.map((item: any) => {
            const aa = {
                key: 2234,
                suite_id: 'test_conf',
                suite_name: 'test1111',
                title: 'Test conf',
                level: 2
            }
            const obj = item.conf_dic
            item.children = Object.values(obj)
            item.children = item.children.map((value: any) => {
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

        return (
            <Drawer
                maskClosable={false}
                keyboard={false}
                title={title}
                width="375"
                onClose={handleClose}
                visible={visible}
                className={styles.add_baseline_drawer}
                footer={
                    <div style={{ textAlign: 'right', }} >
                        <Space>
                            <Button onClick={handleClose}><FormattedMessage id="operation.cancel" /></Button>
                            <Button type="primary" disabled={padding} onClick={handleOk}><FormattedMessage id="operation.ok" /></Button>
                        </Space>
                    </div>
                }
            >
                <div className={styles.server_provider}>
                    <Typography.Text className={styles.script_right_name} strong={true}>
                        <FormattedMessage id="analysis.identification.name" />
                    </Typography.Text>
                </div>
                <div className={styles.server_provider}>
                    <Typography.Text className={styles.script_right_name} strong={true}>{editer && editer.product_version}</Typography.Text>
                </div>
                <div className={styles.line}>
                    <Divider style={{
                        borderTop: '10px solid #F5F5F5',
                    }} />
                </div>
                <Spin spinning={loading}>
                    <div className={styles.suit_detail}>
                        <Tabs
                            defaultActiveKey={tab}
                            onTabClick={handleTabClick}
                            className={styles.tab_title}
                            activeKey={tab}
                        >
                            <Tabs.TabPane tab={<FormattedMessage id="functional.test" />} key="functional" />
                            <Tabs.TabPane tab={<FormattedMessage id="performance.test" />} key="performance" />

                        </Tabs>
                        <Table
                            rowSelection={rowSelection}
                            dataSource={oneLevelDetailData}
                            columns={columns}
                            rowKey={(record: any) => record.suite_id + ''}
                            loading={loading}
                            pagination={false}
                            size="small"
                            expandable={{
                                // expandedRowRender: expandedRowRender,
                                onExpand: (_, record: any) => {
                                    onExpand(_, record)
                                },

                                expandedRowKeys: tab === 'functional' ? expandKeyFun : expandKeyPerf,
                                //expandedRowKeys: tab === 'functional' ? selectedFunRowKeys : selectedPersRowKeys,

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
                    </div>
                </Spin>

            </Drawer>
        )
    }
)