import React, { useEffect, useState, memo } from 'react';
import {  Popconfirm } from 'antd';
import PerformanceTable from './PerformanceTable'
import { MinusCircleOutlined } from '@ant-design/icons'
import EditSpan from './EditSpan'
import { isArray } from 'lodash';
import produce from 'immer'
import { transItem } from './utils'

const Performance = (props: any) => {
    const { groupData, baseIndex, switchReport, btn, perf_data, identify , source, template } = props
    const type:any = Object.keys(perf_data).map((i:any)=> { isArray(perf_data[i]) && perf_data[i][0]?.show_type})
    const [dataSource, setDataSource] = useState<any>([])
    const [ modifySource , setModifySource ] = useState<any>( null )

    useEffect(()=>{
        if(JSON.stringify(perf_data) !== '{}'){
            let newObj = {
                func_data : transItem( source?.test_item.func_data ),
                perf_data : transItem( source?.test_item.perf_data , 'perf' )
            }
            window.sessionStorage.setItem('test_item',JSON.stringify(newObj))
            setModifySource( newObj )
        }
        setDataSource(perf_data)
    },[perf_data])
    
  
    const filterRow = ( data:any , index : any , rowkey:any ) => {
        let obj:any = {}
        Object.keys( data ).forEach(( key , idx ) => {
            const itemKey = index ? `${ index }-${ idx }` : idx + ''
            const item = data[key]
            if ( itemKey == rowkey ){
                return 
            } else{
                obj[key] = item 
            }
            if ( !isArray(item)) {
                const result = filterRow(item,itemKey,rowkey)
                Object.keys(obj).map((keys:any,index:number)=>{
                    if(itemKey == index + ''){
                        return obj[keys] = result
                    } else{
                        return obj[keys] = item
                    }
                })
           }
        })
        return obj
    }
   
    const handleDelete = ( domain:any , index : any ,rowKey: any ) => {
        const res = filterRow( dataSource , null , rowKey )
        setDataSource(res) 
        setModifySource(produce( modifySource , ( draftState : any ) => {
            draftState.perf_data.delete_item = modifySource.perf_data.delete_item.concat(domain)
        }))
        let test:any = window.sessionStorage.getItem('test_item')
        const test_item : any = JSON.parse(test)
        window.sessionStorage.setItem('test_item' , JSON.stringify(produce( test_item , ( draftState : any ) => {
            draftState.perf_data.delete_item = test_item.perf_data.delete_item.concat(domain)
        })) )
    }
    
    const handleGroupTitleChange = (field: any, name: string) => {
        let test : any = window.sessionStorage.getItem('test_item')
        const test_item : any = JSON.parse(test)
        let update_item = test_item.perf_data.update_item

        let result = {}
        Object.keys(update_item).forEach((i:any)=>{
            if(i.indexOf(name) > -1 ){
                let obj = { ...update_item[i] }
                if ( obj.name ) {
                    let arr = obj.name.split(':')
                    arr[0] = field
                    obj.name = arr.join(':')
                }
                else {
                    obj.name = i.replace(name , field)
                }
                result[i] = obj
            }
            else result[i] = update_item[i]
        })
        const modifyData = produce( test_item , ( draftState : any ) => {
            draftState.perf_data.update_item = result
        })
        setModifySource( modifyData )
        window.sessionStorage.setItem('test_item' , JSON.stringify(modifyData))
    }

    const handleFieldChange = (field: any, name: string, rowKey: string) => {
        let test:any = window.sessionStorage.getItem('test_item')
        const test_item : any = JSON.parse(test)
        let update_item = test_item.perf_data.update_item
        let result = {}
        Object.keys(update_item).map((i:any)=>{
            if(update_item[i].rowKey == rowKey){
                let obj = { ...update_item[i] }
                if ( obj.name ) {
                    let arr = obj.name.split(':')
                    arr[1] = field
                    obj.name = arr.join(':')
                }
                else {
                    obj.name = i.replace(name , field)
                }
                result[i] = obj
            }
            else result[i] = update_item[i]
        })
        const modifyData = produce( test_item , ( draftState : any ) => {
            draftState.perf_data.update_item = result
        })
        setModifySource( modifyData )

        window.sessionStorage.setItem('test_item' , JSON.stringify(modifyData))
    }

    return (
        <>
            {
                Object.keys(dataSource).map((i: any, index: number) => {
                    if (isArray(dataSource[i])) {
                        return <PerformanceTable 
                                perData={dataSource[i]} 
                                domain={i} 
                                rowkey={index + ''} 
                                group="item"
                                template={template} 
                                editData={modifySource} 
                                groupData={groupData} 
                                baseIndex={baseIndex} 
                                identify={identify}
                                btn={btn}
                                onChange={handleFieldChange}
                                onDelete={handleDelete}
                            />
                    } else {
                        return (
                            <>
                                <div className="test_group" >
                                    <span className="line"></span>
                                    <EditSpan
                                        btn={btn}
                                        title={i}
                                        style={{ color: 'rgb(0,0,0,0.85)' }}
                                        onOk={(val: any) => handleGroupTitleChange(val, i)}
                                    />
                                   
                                    <span style={{ float: 'right', marginRight: 20 }}>
                                        <Popconfirm
                                            title='确认要删除吗！'
                                            onConfirm={() => handleDelete(i,null,index)}
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
                                    Object.keys(dataSource[i]).map((key: any,idx:number) => (
                                        <PerformanceTable 
                                            perData={dataSource[i][key]} 
                                            domain={key} 
                                            rowkey={`${index}-${idx}`} 
                                            group="group" 
                                            template={template} 
                                            editData={modifySource} 
                                            groupData={groupData} 
                                            baseIndex={baseIndex} 
                                            btn={btn}
                                            identify={identify}
                                            parent={i}
                                            onChange={handleFieldChange}
                                            onDelete={handleDelete}
                                        />
                                    ))
                                }
                            </>
                        )
                    }
                })
            }
        </>
    )
}
export default memo(Performance);


 // 渲染测试项以及表格数据
//  const RenderItem = (props: any) => {
//     const { item, domain, rowkey, group, parent } = props
    // let name = ""
    // let title = domain

    // if( modifySource && modifySource.perf_data && !isArray( modifySource.perf_data.update_item ) ) {
    //     const update_item = modifySource.perf_data?.update_item
    //     Object.keys(update_item).forEach(( ctx ) => {
    //         const updateTitle = `${ parent ? `${ parent }:` : '' }${ domain }`
    //         if ( ctx === updateTitle && update_item[ctx].name ) {
    //             title = update_item[ctx].name.indexOf(':') > -1 ? update_item[ctx].name.split(':')[1] : update_item[ctx].name 
    //         }
    //     })
    // }

    // if(group == 'group')  {
    //     name = `${parent}:${domain}`
    // }else{
    //     name = domain
    // }
//     return (
//         <>
//             {
//                 modelVisible || item[0]?.show_type == 0 ?
//                     <>
//                         <div className="test_item" key={rowkey}>
//                             <Row>
//                                 <Col span={17} >
//                                     <span className="point"></span>
//                                     <EditSpan
//                                         btn={btn}
//                                         title={title}
//                                         style={{ color: 'rgb(250,100,0)' }}
//                                         onOk={(val: any) => handleFieldChange(val, dataSource, domain, rowkey)}
//                                     />
//                                     <span style={{ float: 'right' }}>
//                                         <Popconfirm
//                                             title='确认要删除吗！'
//                                             onConfirm={() => handleDelete(name,dataSource,null,rowkey)}
//                                             cancelText="取消"
//                                             okText="删除"
//                                         >
//                                             { btn && <MinusCircleOutlined
//                                                 className={styles.remove_active }
//                                             /> }
//                                         </Popconfirm>
//                                     </span>
//                                 </Col>
//                                 <Col span={7}>
//                                     <Space style={{ float: 'right' }}>
//                                         筛选: <Select defaultValue="all" style={{ width: 200 }} onSelect={handleConditions}>
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
//                             <PerformanceTable perData={item} template={template} editData={modifySource} domain={name} groupData={groupData} baseIndex={baseIndex} switchReport={switchReport} btn={btn}></PerformanceTable>
//                         </div>
//                     </>
//                     :
//                     <>
//                         <div className="test_item">
//                             <Row>
//                                 <Col span={17} >
//                                     <span className="point"></span>
//                                     <EditSpan
//                                         btn={btn}
//                                         title={domain}
//                                         style={{ color: 'rgb(250,100,0)' }}
//                                         onOk={(val: any) => handleFieldChange(val, dataSource, name, rowkey)}
//                                     />
//                                     <span style={{ float: 'right' }}>
//                                         <Popconfirm
//                                             title='确认要删除吗！'
//                                             onConfirm={() => handleDelete(name,dataSource,null,rowkey)}
//                                             cancelText="取消"
//                                             okText="删除"
//                                         >
//                                             { btn && <MinusCircleOutlined
//                                                 className={styles.remove_active }
//                                             />}
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
//                         <div >
//                             {
//                                 item?.map((item: any, index: number) => (
//                                     <ChartsIndex {...item} compareData={props.compareData} identify={identify} key={index} />
//                                 ))
//                             }
//                         </div>
//                     </>
//             }
//         </>
//     )
// }