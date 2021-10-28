import { Drawer, Space, Button, Spin, Table, Typography, message, Divider, Tabs } from 'antd'
import { CaretRightFilled, CaretDownFilled } from '@ant-design/icons'
import React, { forwardRef, useState, useImperativeHandle } from 'react'

import { querySuiteList } from './services'
import styles from './index.less'
import _ from 'lodash'
import { requestCodeMessage } from '@/utils/utils'
export default forwardRef(
    (props: any, ref: any) => {
        const [padding, setPadding] = useState(false) // 确定按钮是否置灰
        const [visible, setVisible] = useState(false) // 控制弹框的显示与隐藏
        const [title, setTitle] = useState('') // 弹框顶部title
        const [editer, setEditer] = useState<any>({}) // 编辑的数据
        const [ suitData , setSuitData ] = useState<any>({})
        const [loading,setLoading] = useState(true)
        const [ tab , setTab ] = useState('functional')
        let [selectedFunRowKeys, setSelectedFunRowKeys] = useState<any>([])
        let [selectedPersRowKeys, setSelectedPersRowKeys] = useState<any>([])
        // let [selectRowData, setSelectRowData] = useState<any>([])
        let [allObjKeyFun, setAllObjKeyFun] = useState<any>([])
        let [allObjKeyPerf, setAllObjKeyPerf] = useState<any>([])

        const [expandKeyFun, setExpandKeyFun] = useState<string[]>([])
        const [expandKeyPerf, setExpandKeyPerf] = useState<string[]>([])
        const handleTabClick = (tab : string) => {
            setTab( tab )
        }
        
        const getSuitDetail = async (params:any) => {
            let { data,code,msg } = await querySuiteList(params)
            
            if (code === 200) {
                
                let obj1 = data.func_suite_dic || {}
                let obj2 = data.perf_suite_dic || {}
                const arrKey1 = Object.keys(obj1)
                const arrKey2 = Object.keys(obj2)
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
                    allObjKeyFun[id]  = allObjKeyFun[id].map(keys => String(keys))
                    
                })
                arrVal2.forEach((obj: any) => {
                    const objConf = obj.conf_dic || {}
                    secondPersKeys = [...secondPersKeys, ...Object.keys(objConf)]
                    const id = obj.suite_id
                    allObjKeyPerf[id] = Object.keys(objConf)
                    allObjKeyPerf[id]  = allObjKeyPerf[id].map(keys => String(keys))
                })

                secondFunKeys = secondFunKeys.map((keys:any) => String(keys))
                secondPersKeys = secondPersKeys.map((keys:any) => String(keys))
      
                setSelectedFunRowKeys(secondFunKeys)
                setSelectedPersRowKeys(secondPersKeys)

                setAllObjKeyFun(allObjKeyFun)
                setAllObjKeyPerf(allObjKeyPerf)

                setExpandKeyFun(arrKey1)
                setExpandKeyPerf(arrKey2)
                setSuitData(data)
            } else {
                message.error(msg)
            }
            setLoading(false)
        }
        
        useImperativeHandle(
            ref,
            () => ({
                show: (title: string = "选择BaseGroup对比的内容", data: any = {}) => {
                    setVisible(true)
                    setTitle(title)
                    setEditer(data)
                    let arr = _.get(data,'members')
                    const paramData = {
                        func_data: [],
                        perf_data: []
                    }
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
                    getSuitDetail(paramData)
                }
            })
        )
        const handleClose = () => {
            setPadding(false)
            setVisible(false)
        }

        const defaultOption = (code: number, msg: string, type: string) => {
            if (code === 200) {
                if(type === 'new') props.setCurrent({})
                props.onOk()
                message.success('操作成功')
                setVisible(false)
            }
            else {
               requestCodeMessage( code , msg )
            }
            setPadding(false)
        }

        const handleOk = () => {
            //const { code, msg } = await createBaseline({ server_provider: serverProvider.trim(), test_type: testType.trim(), ws_id: props.ws_id, version: '', ...values })
            //defaultOption(code, msg, 'new')
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
            console.log(record, selected, selectedRows,11111111111111111);
            console.log(selectedFunRowKeys,22222222222222)
            // 去掉未选组的job 开始
            let arrKeys = tab === 'functional' ? _.cloneDeep(selectedFunRowKeys) : _.cloneDeep(selectedPersRowKeys)
            const objKeys =  tab === 'functional' ? allObjKeyFun : allObjKeyPerf
            if(selected) {
                let childKeys = []
                if(!record.level) {
                    childKeys = objKeys[record.suite_id]
                }
                arrKeys = [...arrKeys,record.suite_id + '',...childKeys]
                arrKeys = arrKeys.map(keys => String(keys))
                arrKeys = Array.from(new Set(arrKeys))
            } else {
                let childKeys:any = []
                if(!record.level) {
                    childKeys = objKeys[record.suite_id]
                    arrKeys = arrKeys.filter((keys:any) => !childKeys.includes(keys))
                }
                arrKeys = arrKeys.filter((keys:any) => String(keys) !== String(record.suite_id))
            }

            tab === 'functional' ? setSelectedFunRowKeys(arrKeys) : setSelectedPersRowKeys(arrKeys)

          }
        const rowSelection = {
            selectedRowKeys: tab === 'functional' ? selectedFunRowKeys : selectedPersRowKeys,
            // onChange: (selectedRowKeys, selectedRows) => {
            //     console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
            //     setSelectedFunRowKeys(selectedRowKeys)
            //   },
            preserveSelectedRowKeys: false,
            onSelect: selectedChange,
            checkStrictly: false,
            onSelectAll: (selected, selectedRows, changeRows) => {
                console.log(selected, selectedRows, changeRows,44444444444444);
              },
        };


        const columns = [
            {
                dataIndex: 'suite_name',
                title: 'Test Suite',
                key: 'Test Suite',
            }
        ]
 
        let oneLevelFunData:any = []
        let oneLevelPerslData:any = []
        let obj1 = _.cloneDeep(suitData).func_suite_dic || {}
        let obj2 = _.cloneDeep(suitData).perf_suite_dic || {}
        const arrKey1 = Object.keys(obj1)
        const arrKey2 = Object.keys(obj2)
        const arrVal1 = Object.values(obj1)
        const arrVal2 = Object.values(obj2)
        oneLevelFunData = arrVal1.map((obj:any,index:number) => ({...obj,suite_id: arrKey1[index]}))
        oneLevelPerslData = arrVal2.map((obj: any, index: number) => ({ ...obj, suite_id: arrKey2[index] }))
        let oneLevelDetailData = tab === 'functional' ? oneLevelFunData : oneLevelPerslData
        const aa =  {
            key: 2234,
            suite_id: '2234',
            suite_name: 'test1111',
            title: 'Test conf',
            level: 2
        }
        oneLevelDetailData = oneLevelDetailData.map((item: any) => {
            const obj = item.conf_dic
            item.children = Object.values(obj)
            item.children = item.children.map((value: any, index: number) => {
                return (
                    {
                        key: value.conf_id,
                        suite_id: value.conf_id,
                        suite_name: value.conf_name,
                        title: 'Test conf',
                        level: 2
                    }
                )

            })
            item.children.push(aa)
            return item
        })

        return (
            <Drawer 
                maskClosable={ false }
                keyboard={ false }
                title={title}
                width="375"
                onClose={handleClose}
                visible={visible}
                className={styles.add_baseline_drawer}
                footer={
                    <div style={{ textAlign: 'right', }} >
                        <Space>
                            <Button onClick={handleClose}>取消</Button>
                            <Button type="primary" disabled={padding} onClick={handleOk}>确定</Button>
                        </Space>
                    </div>
                }
            >
                <div className={styles.server_provider}>
                    <Typography.Text className={styles.script_right_name} strong={true}>对比标识名称</Typography.Text>
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
                            <Tabs.TabPane tab="功能测试" key="functional" />
                            <Tabs.TabPane tab="性能测试" key="performance" />

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
                                    onExpand(_,record)
                                },

                                expandedRowKeys: tab === 'functional' ? expandKeyFun : expandKeyPerf,
                                //expandedRowKeys: tab === 'functional' ? selectedFunRowKeys : selectedPersRowKeys,
                                
                                expandIcon: ({ expanded, onExpand, record }: any) => (
                                    expanded ?
                                        (<CaretDownFilled onClick={e => onExpand(record, e)} />) :
                                        (<CaretRightFilled onClick={e => onExpand(record, e)} />)
                                ),
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