import React, { useEffect, useState, memo } from 'react';
import { Popconfirm, Spin } from 'antd';
import PerformanceTable from './PerformanceTable'

import { MinusCircleOutlined } from '@ant-design/icons'
import EditSpan from '../../EditReport/components/EditSpan'
import produce from 'immer'


const Performance = (props: any) => {
    const { data = [] , groupData, baseIndex, switchReport, btn, describe, identify, setTestItem } = props
    const [dataSource, setDataSource] = useState<any>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        setLoading(true)
        setDataSource(data)
        setLoading(false)
    }, [data])
    useEffect(() => {
        let test:any = window.sessionStorage.getItem('test_item')
        let parse_arr = JSON.parse(test)
        let new_pref_data: any = []
        
        if (dataSource.length > 0) {
            dataSource.map((item: any, idx: number) => {
                if (item.is_group) {
                    item.list.map((child: any,listId:number) => {
                        let suite_list: any = []
                        child.list.map((suite: any, suiteId: number) => {
                            let conf_list: any = []
                            suite.conf_list.map((conf: any, index: number) => {
                                conf_list.push({
                                    conf_id: conf.conf_id,
                                    conf_name: conf.conf_name,
                                    conf_source: {
                                        is_job: conf.is_job,
                                        obj_id: conf.obj_id,
                                    },
                                    compare_conf_list: conf.conf_compare_data,
                                    metric_list: conf.metric_list
                                })
                            })
                            suite_list.push({
                                suite_id: suite.suite_id,
                                suite_name: suite.suite_name,
                                show_type: !switchReport ? 0 : describe?.show_type == 'list' ? 0 : 1,
                                test_suite_description : suite.test_suite_description || '-' ,
                                test_env: '-' || suite.test_env,
                                test_description: '-' || suite.test_description,
                                test_conclusion: '-' || suite.test_conclusion,
                                conf_list: conf_list,
                                rowKey: `${idx}-${listId}-${suiteId}`
                            })
                        })
                        new_pref_data.push({
                            name: `${item.name}:${child.name}`,
                            suite_list
                        })
                    })
                } else {
                    let suite_list: any = []
                    item.list.map((suite: any, suiteId: number) => {
                        let conf_list: any = []
                        suite.conf_list.map((conf: any, index: number) => {
                            conf_list.push({
                                conf_id: conf.conf_id,
                                conf_name: conf.conf_name,
                                conf_source: {
                                    is_job: conf.is_job,
                                    obj_id: conf.obj_id,
                                },
                                compare_conf_list: conf.conf_compare_data,
                                metric_list: conf.metric_list
                            })
                        })
                        suite_list.push({
                            suite_id: suite.suite_id,
                            suite_name: suite.suite_name,
                            show_type: !switchReport ? 0 : describe?.show_type == 'list' ? 0 : 1,
                            test_suite_description: suite.test_suite_description || '-',
                            test_env: '-' || suite.test_env,
                            test_description: '-' || suite.test_description,
                            test_conclusion: '-' || suite.test_conclusion,
                            conf_list: conf_list,
                            rowKey: `${idx}-${suiteId}`
                        })
                    })
                    new_pref_data.push({
                        name: item.name,
                        suite_list
                    })
                }
            })
        }
        if(parse_arr && JSON.stringify(parse_arr) !== '{}'){
            let obj = {
                perf_data:new_pref_data,
                func_data:parse_arr.func_data
            }
            window.sessionStorage.setItem('test_item',JSON.stringify(obj))
        }else{
            let obj = {
                perf_data:new_pref_data,
                func_data:[]
            }
            window.sessionStorage.setItem('test_item',JSON.stringify(obj))
        }
    }, [dataSource])
    
    const filterFieldData = (data: any, name: string, field: any, rowKey: string) => {
        return produce(
            data,
            (draftState: any) => {
                draftState.list = data.list.map((i: any) => {
                    if (!i.is_group && i.rowKey == rowKey) {
                        return produce(i, (draft: any) => {
                            draft.name = field
                        })
                    }
                    return i
                })
            }
        )
    }

    const filterData = (item: any, name: string, field: any, rowKey: string) => {
        if (item.rowKey == rowKey)
            return produce(item, (draft: any) => {
                draft.name = field
            })
        if (item.is_group)
            return filterFieldData(item, name, field, rowKey)
        return item
    }

    const handleFieldChange = (field: any, name: string, rowKey: string) => {
        setDataSource(dataSource.map((item: any) => filterData(item, name, field, rowKey)))
        setTestItem(true)
    }
    const handleDelete = (name: string, domain: any, rowKey: any) => {
        if (name === 'group') {
            let data: any = dataSource.map((i: any, idx: number) => {
                let ret: any = []
                if (i.is_group) {
                    i.list.map((b: any) => {
                        if (b.rowKey === rowKey) {
                            ret = i.list.filter((c: any) => c.name !== domain)
                        }
                    })
                    return {
                        ...i,
                        list: ret,
                    }
                }
                return {
                    ...i,
                }
            })
            setDataSource(data)
        } else {
            let ret: any = dataSource.filter((item: any) => item.name !== domain && item.rowKey !== rowKey)
            setDataSource(ret)
        }
        setTestItem(true)
    }
    return (
        <Spin spinning={loading}>
            {
                dataSource.map((item: any, index: number) => {
                    if (item.is_group) {
                        return (
                            <span key={index}>
                                <div className="test_group" id={`perf_item-${item.rowKey}`}>
                                    <span className="line"></span>
                                    <EditSpan
                                        btn={btn}
                                        title={item.name}
                                        style={{ color: 'rgb(0,0,0,0.85)' }}
                                        onOk={(val: any) => handleFieldChange(val, item.name, item.rowKey)}
                                    />
                                    <span style={{ float: 'right', marginRight: 20 }}>
                                        <Popconfirm
                                            title='确认要删除吗！'
                                            onConfirm={() => handleDelete('item', item.name, item.rowKey)}
                                            cancelText="取消"
                                            okText="删除"
                                        >
                                            { btn && <MinusCircleOutlined
                                                className="remove_active"
                                            /> }
                                        </Popconfirm>
                                    </span>
                                </div>
                                {
                                    item.list.map((suite: any, idx: number) => (
                                        <PerformanceTable 
                                            index={suite.rowKey} 
                                            identify={identify} 
                                            group="group" 
                                            perData={suite} 
                                            describe={describe} 
                                            groupData={groupData} 
                                            baseIndex={baseIndex} 
                                            switchReport={switchReport} 
                                            btn={btn}
                                            setTestItem={setTestItem}
                                            onDelete={handleDelete}
                                            onChange={handleFieldChange}
                                        />
                                    ))
                                }
                            </span>
                        )
                    }
                    return <PerformanceTable 
                        index={item.rowKey} 
                        group="item" 
                        identify={identify} 
                        perData={item} 
                        describe={describe} 
                        groupData={groupData} 
                        baseIndex={baseIndex} 
                        switchReport={switchReport} 
                        btn={btn}
                        setTestItem={setTestItem}
                        onDelete={handleDelete}
                        onChange={handleFieldChange}
                    />
                    
                })
            }
        </Spin>
    )
}
export default memo(Performance);


  // const RenderItem = (props: any) => {
    //     const { item, index, group } = props
    //     return (
    //         <>
    //             {
    //                 modelVisible ?
    //                     <>
    //                         <div className="test_item" key={index} >
    //                             <Row>
    //                                 <Col span={17} >
    //                                     <span className="point"></span>
    //                                     <EditSpan
    //                                         title={item.name}
    //                                         style={{ color: 'rgb(250,100,0)' }}
    //                                         onOk={(val: any) => handleFieldChange(val, item.name, index)}
    //                                     />
    //                                     <span style={{ float: 'right' }}>
    //                                         <Popconfirm
    //                                             title='确认要删除吗！'
    //                                             onConfirm={() => handleDelete(group, item.name, index)}
    //                                             cancelText="取消"
    //                                             okText="删除"
    //                                         >
    //                                             <MinusCircleOutlined
    //                                                 className={styles.remove_active}
    //                                             />
    //                                         </Popconfirm>
    //                                     </span>
    //                                 </Col>
    //                                 <Col span={7}>
    //                                     <Space style={{ float: 'right' }}>
    //                                         筛选: <Select defaultValue="all" style={{ width: 200 }} value={selectVal} onSelect={(value)=>handleConditions(value,index,group)}>
    //                                             <Option value="all">全部</Option>
    //                                             <Option value="invalid">无效</Option>
    //                                             <Option value="volatility">波动大（包括上升、下降）</Option>
    //                                             <Option value="increase">上升</Option>
    //                                             <Option value="decline">下降</Option>
    //                                             <Option value="normal">正常</Option>
    //                                         </Select>
    //                                         <Button onClick={() => switchMode('chart')}>图表模式</Button>
    //                                     </Space>
    //                                 </Col>
    //                             </Row>
    //                         </div>
    //                         <div className="table_margin">
    //                             <PerformanceTable perData={item} describe={describe} index={ index } groupData={groupData} baseIndex={baseIndex} switchReport={switchReport} btn={btn}></PerformanceTable>
    //                         </div>
    //                     </>
    //                     :
    //                     <>
    //                         <div className="test_item" >
    //                             <Row>
    //                                 <Col span={17} >
    //                                     <span className="point"></span>
    //                                     <EditSpan
    //                                         title={item.name}
    //                                         style={{ color: 'rgb(250,100,0)' }}
    //                                         onOk={(val: any) => handleFieldChange(val, item.name, index)}
    //                                     />
    //                                     <span style={{ float: 'right' }}>
    //                                         <Popconfirm
    //                                             title='确认要删除吗！'
    //                                             onConfirm={() => handleDelete(group, item.name, index)}
    //                                             cancelText="取消"
    //                                             okText="删除"
    //                                         >
    //                                             <MinusCircleOutlined
    //                                                 className={styles.remove_active}
    //                                             />
    //                                         </Popconfirm>
    //                                     </span>
    //                                 </Col>
    //                                 <Col span={7}>
    //                                     <Space style={{ float: 'right' }}>
    //                                         <Button onClick={() => switchMode('list')}>列表模式</Button>
    //                                     </Space>
    //                                 </Col>
    //                             </Row>
    //                         </div>
    //                         <div style={{ padding:'0 20px'}}>
    //                             {
    //                                 item.list?.map((item: any, index: number) => (
    //                                     <ChartsIndex {...item}  identify={identify} key={index} />
    //                                 ))
    //                             }
    //                         </div>
    //                     </>
    //             }
    //         </>
    //     )
    // }
