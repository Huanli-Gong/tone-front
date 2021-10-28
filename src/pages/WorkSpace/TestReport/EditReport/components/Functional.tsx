import React, { useEffect, useState } from 'react';
import { Popconfirm } from 'antd';
import FunctionalTable from './FunctionalTable'
import EditSpan from './EditSpan'
import { MinusCircleOutlined } from '@ant-design/icons';
import { isArray } from 'lodash';
import { transItem } from './utils'
import produce from 'immer'

const Performance = (props: any) => {
    const { groupData, baseIndex, btn, func_data , source } = props
    const [dataSource, setDataSource] = useState([])
    const [ modifySource , setModifySource ] = useState<any>( null )

    useEffect(()=>{
        if(JSON.stringify(func_data) !== '{}'){
            let newObj = {
                func_data : transItem( source?.test_item.func_data ),
                perf_data : transItem( source?.test_item.perf_data , 'perf' )
            }
            window.sessionStorage.setItem('test_item',JSON.stringify(newObj))
            setModifySource( newObj )
        }
        setDataSource(func_data)
    },[func_data])
    
    const filterRow = ( data:any , index : any , rowkey:any ) => {
        let obj:any = {}
        let arr : any = []
        Object.keys( data ).forEach(( key , idx ) => {
            const itemKey = index ? `${ index }-${ idx }` : idx + ''
            const item = data[key]
            if ( itemKey == rowkey ){
                arr.push(key)
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
    const handleFieldChange = (field: any, name: string, rowKey: string) => {
        let test:any = window.sessionStorage.getItem('test_item')
        const test_item : any = JSON.parse(test)
        let update_item = test_item.func_data.update_item
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
            draftState.func_data.update_item = result
        })
        setModifySource( modifyData )

        window.sessionStorage.setItem('test_item' , JSON.stringify(modifyData))
    }

    const handleGroupTitleChange = (field: any, name: string) => {
        let test:any = window.sessionStorage.getItem('test_item')
        const test_item : any = JSON.parse(test)
        let update_item = test_item.func_data.update_item

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
            draftState.func_data.update_item = result
        })
        setModifySource( modifyData )
        window.sessionStorage.setItem('test_item' , JSON.stringify(modifyData))
    }

    const handleDelete = (domain:any, index : any ,rowKey: any) => {
        const res = filterRow( dataSource , null , rowKey )
        setDataSource(res) 
        setModifySource(produce( modifySource , ( draftState : any ) => {
            draftState.func_data.delete_item = modifySource.func_data.delete_item.concat(domain)
        }))
        let test:any = window.sessionStorage.getItem('test_item')
        const test_item : any = JSON.parse(test)
        window.sessionStorage.setItem('test_item' , JSON.stringify(produce( test_item , ( draftState : any ) => {
            draftState.func_data.delete_item = test_item.func_data.delete_item.concat(domain)
        })) )
    }
    return (
        <>
            {
                Object.keys(dataSource).map((i: any, index: number) => {
                    if (isArray(dataSource[i])) {
                        return <FunctionalTable 
                                    data={dataSource[i]} 
                                    domain={i} 
                                    editData={modifySource}
                                    btn={btn} 
                                    groupData={groupData} 
                                    baseIndex={baseIndex} 
                                    group="item" 
                                    rowkey={index + ''} 
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
                                        <FunctionalTable 
                                            data={dataSource[i][key]} 
                                            editData={modifySource}
                                            domain={key} 
                                            btn={btn} 
                                            group="group" 
                                            groupData={groupData} 
                                            baseIndex={baseIndex} 
                                            parent={i} 
                                            rowkey={`${index}-${idx}`} 
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
export default Performance;



// const RenderItem = (props: any) => {
//     const { item, domain, rowkey, group, parent } = props
    // let name = ""
    // let title = domain
    // if( modifySource && modifySource.func_data && !isArray( modifySource.func_data.update_item ) ) {
    //     const update_item = modifySource.func_data?.update_item
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
//                 <>
//                     <div className="test_item" key={rowkey} >
//                         <Row>
//                             <Col span={17} >
//                                 <span className="point"></span>
//                                 <EditSpan
//                                         btn={btn}
//                                         title={title}
//                                         style={{ color: 'rgb(250,100,0)' }}
//                                         onOk={(val: any) => handleFieldChange(val, dataSource, domain, rowkey)}
//                                     />
//                                 <span style={{ float: 'right' }}>
//                                     <Popconfirm
//                                         title='确认要删除吗！'
//                                         onConfirm={() => handleDelete(name,dataSource,null,rowkey)}
//                                         cancelText="取消"
//                                         okText="删除"
//                                     >
//                                         { btn && <MinusCircleOutlined
//                                             className={ styles.remove_active }
//                                         /> }
//                                     </Popconfirm>
//                                 </span>
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
//                         <FunctionalTable 
//                             editData={modifySource}
//                             data={item} 
//                             bnt={bnt} 
//                             domain={name}
//                             groupData={groupData} 
//                             baseIndex={baseIndex} 
//                             btn={btn} 
//                             btnName={bnt} 
//                             expandKeys={expandKeys} 
//                             onExpand={ setExpandKeys }
//                         />
//                     </div>
//                 </>

//             }
//         </>
//     )
// }