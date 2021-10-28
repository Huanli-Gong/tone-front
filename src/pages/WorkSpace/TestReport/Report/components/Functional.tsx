import React, { useEffect, useState } from 'react';
import { Popconfirm, Spin } from 'antd';
import FunctionalTable from './FunctionalTable'
import EditSpan from '../../EditReport/components/EditSpan'
import {  MinusCircleOutlined } from '@ant-design/icons';
import produce from 'immer'

const Performance = (props: any) => {
    const { data = [] , groupData, baseIndex, btn, setTestItem } = props
    const [loading, setLoading] = useState(false)
    const [dataSource, setDataSource] = useState<any>([])
   
    // 整理数据
    useEffect(() => {
        setLoading(true)
        setDataSource(data)
        setLoading(false)
    }, [data])
    // 保存报告数据整理
    useEffect(()=>{
        let test:any = window.sessionStorage.getItem('test_item')
        let parse_arr = JSON.parse(test)
        let new_func_data : any = []
        if(dataSource.length>0){
            dataSource.map((item:any,idx:number)=>{
                if(item.is_group){
                    let suite_list : any = []
                    item.list.map((child:any,index:number)=>{
                        child.list.map((suite:any,suiteId: number)=>{
                            let conf_list: any = []
                            suite.conf_list.map((conf: any, index: number) => {
                                conf_list.push({
                                    conf_id: conf.conf_id,
                                    conf_name: conf.conf_name,
                                    conf_source: {
                                        all_case:conf.all_case,
                                        success_case:conf.success_case,
                                        fail_case:conf.fail_case,
                                        is_job: conf.is_job,
                                        obj_id: conf.obj_id,
                                    },
                                    compare_conf_list: conf.conf_compare_data,
                                    sub_case_list:conf.sub_case_list
                                })
                            })
                            suite_list.push({
                                suite_id:suite.suite_id,
                                suite_name: suite.suite_name,
                                conf_list
                            })
                        })
                        new_func_data.push({
                            name:`${item.name}:${child.name}`,
                            suite_list
                        })
                    })
                }else{
                    let suite_list : any = []
                    item.list.map((suite:any)=>{
                        let conf_list: any = []
                        suite.conf_list.map((conf: any, index: number) => {
                            conf_list.push({
                                conf_id: conf.conf_id,
                                conf_name: conf.conf_name,
                                conf_source: {
                                    all_case:conf.all_case,
                                    success_case:conf.success_case,
                                    fail_case:conf.fail_case,
                                    is_job: conf.is_job,
                                    obj_id: conf.obj_id,
                                },
                                compare_conf_list: conf.conf_compare_data,
                                sub_case_list:conf.sub_case_list
                            })
                        })
                        suite_list.push({
                            suite_id:suite.suite_id,
                            suite_name: suite.suite_name,
                            conf_list
                        })
                    })
                    new_func_data.push({
                        name:item.name,
                        suite_list
                    })
                }
            })
        }
        if(parse_arr && JSON.stringify(parse_arr) !== '{}'){
            let obj = {
                perf_data:parse_arr.perf_data,
                func_data:new_func_data
            }
            window.sessionStorage.setItem('test_item',JSON.stringify(obj))
        }else{
            let obj = {
                perf_data:[],
                func_data:new_func_data
            }
            window.sessionStorage.setItem('test_item',JSON.stringify(obj))
        }
    },[dataSource])
    // 删除测试项及测试组
    const handleDelete = (name: string,domain:any,rowKey:any) => {
        if(name === 'group'){
            let data:any = dataSource.map((i:any,idx:number)=>{
                let ret: any = []
                if (i.is_group) {
                    i.list.map((b: any) => {
                        if (b.rowKey === rowKey) {
                            ret = i.list.filter((c: any) => c.name !== domain)
                        }
                    })
                }
                return {
                    ...i,
                    list: ret
                }
            })
             setDataSource(data)
         }else{
             let ret: any = dataSource.filter((item: any) => item.name !== domain && item.rowKey !== rowKey)
             setDataSource(ret)
         }
         setTestItem(true)
    }
    //编辑测试项或测试组
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
    
    return (
        <Spin spinning={loading}>
        {
            dataSource?.map((item: any, index: number) => {
                if (item.is_group) {
                    return (
                        <>
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
                                        onConfirm={() => handleDelete('item',item.name,index)}
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
                                item.list.map((suite: any) => (
                                    <FunctionalTable 
                                        index={suite.rowKey} 
                                        group="group" 
                                        btn={btn}
                                        setTestItem={setTestItem}
                                        data={suite} 
                                        groupData={groupData} 
                                        baseIndex={baseIndex} 
                                        onDelete={handleDelete}
                                        onChange={handleFieldChange}
                                    />
                                ))
                            }
                        </>
                    )
                } else {
                    return <FunctionalTable 
                        index={item.rowKey} 
                        group="item"
                        btn={btn}
                        setTestItem={setTestItem}
                        data={item} 
                        groupData={groupData} 
                        baseIndex={baseIndex} 
                        onDelete={handleDelete}
                        onChange={handleFieldChange}
                    />
                }
            })
        }
        </Spin>
    )
}
export default Performance;




// const RenderItem = (props:any) => {
    //     const { item,index,group } = props
    //     return (
    //         <>
    //             <div className="test_item">
    //                         <Row>
    //                             <Col span={17}>
    //                                 <span className="point"></span>
    //                                 <EditSpan
    //                                     title={item.name}
    //                                     style={{ color: 'rgb(250,100,0)' }}
    //                                     onOk={(val: any) => handleFieldChange(val, item.name, index)}
    //                                 />
    //                                 <span style={{ float:'right' }}>
    //                                 <Popconfirm
    //                                     title='确认要删除吗！'
    //                                     onConfirm={() => handleDelete(group,item.name,index)}
    //                                     cancelText="取消"
    //                                     okText="删除"
    //                                 >
    //                                 <MinusCircleOutlined
    //                                     className={styles.remove_active }
    //                                 />
    //                                 </Popconfirm>
    //                             </span>
    //                             </Col>
    //                             <Col span={7}>
    //                                 <Space style={{ float: 'right' }}>
    //                                     筛选: <Select defaultValue="All" style={{ width: 200 }} onSelect={handleConditions}>
    //                                         <Option value="All">全部</Option>
    //                                         <Option value="Pass">成功</Option>
    //                                         <Option value="Fail">失败</Option>
    //                                         <Option value="Skip">跳过</Option>
    //                                     </Select>
    //                                     <Button onClick={switchAll}>{bntName}</Button>
    //                                 </Space>
    //                             </Col>
    //                         </Row>
    //                     </div>
    //                     <div className="table_margin">
                            
    //                     </div>
    //         </>
    //     )
    // }