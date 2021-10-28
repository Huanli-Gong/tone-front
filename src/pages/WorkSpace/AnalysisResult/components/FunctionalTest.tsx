import React, { useState, useEffect } from 'react';
import { Row, Col, Select, Space, Button, Table, Tooltip } from 'antd';
import { QuestionCircleOutlined, CaretRightOutlined } from '@ant-design/icons'
import { ReactComponent as IconArrow } from '@/assets/svg/icon_arrow.svg'
import { ReactComponent as IconArrowBlue } from '@/assets/svg/icon_arrow_blue.svg'
import { ReactComponent as IconLink } from '@/assets/svg/icon_openlink.svg';
import styles from './index.less';
const { Option } = Select
// 单个展开
const ExpandSubcases = ( props:any ) => {
    const { sub_case_list , conf_name , conf_id  , onExpand , expandKeys  } = props
    const expand = expandKeys.includes( conf_id )
    const hanldeExpand = ( id : any ) => {
        if ( expand ) 
            onExpand( expandKeys.filter(( i : any ) => i!== id ))
        else 
            onExpand( expandKeys.concat( id ))
    }

    return (
        <div className={styles.right_border}>
            <div className={styles.function_name} >
                <Space>
                    <CaretRightOutlined 
                        style={{ cursor : 'pointer' }} 
                        rotate={ expand ? 90 : 0 } 
                        onClick={ () => hanldeExpand( conf_id ) }
                    />
                    <span className={styles.conf_name_text}>{ conf_name }</span>
                </Space>
            </div>
            {
                expand &&  sub_case_list?.map((item: any, idx: number) => (
                     <Tooltip placement="top" title={item.sub_case_name} overlayClassName={styles.tootip_subCase} key={idx}>
                        <div key={idx} className={styles.function_warp}>
                            <span className={styles.sub_case_name}>{item.sub_case_name}</span>
                        </div>
                    </Tooltip>
                ))
            }
        </div>
    )
}

const FunctionalTest = (props: any) => {
    const ws_id = location.pathname.replace(/\/ws\/([a-zA-Z0-9]{8})\/.*/, '$1')
    const { baseIndex } = props
    const [bntName, setBntName] = useState('展开所有')
    const [bnt, setBnt] = useState(false)
    const [arrowStyle,setArrowStyle] = useState('')
    const [num,setNum] = useState(0)
    const [expandKeys, setExpandKeys] = useState<any>([])
    const [ dataSource , setDataSource ] = useState( props.data.func_data_result )
    
    const switchAll = () => {
        setBnt(!bnt)
        
    }
    useEffect(() => {
        setBntName(bnt ? '收起所有' : '展开所有')
        setExpandKeys([])
        setExpandKeys(
            bnt ?
            dataSource.reduce(
                    (p: any, c: any) => p.concat(c.conf_list.map((item: any) => item.conf_id))
                    , [])
                :
                []
        )
    }, [bnt])
   
    const handleColor = (result: any) => {
        if(result == 'Fail'){
            return styles.sub_case_red
        }else if(result == 'Pass'){
            return styles.sub_case_green
        }else{
            return styles.sub_case_normal
        }
    }
    const handleConditions = (value: any) => {
        let data = props.data.func_data_result
        let newData:any = []
        if(value == 'All'){
            setDataSource(data)
        }else{
            data.map((item:any)=>{
                let conf_list : any = []
                item.conf_list.map((conf:any)=>{
                    let sub_case_list = conf.sub_case_list.filter((i:any)=>i.result == value)
                    conf_list.push({
                        ...conf,
                        sub_case_list
                    })
                })
                newData.push({
                    ...item,
                    conf_list
                })
            })
            setDataSource(newData)
        }
    }
    const handleArrow = (conf:any,i:any) => {
        setNum(i)
        setArrowStyle(conf.suite_id)
        const conf_list = conf.conf_list.map((item:any)=>{
            let pre : any = []
            for( let x = 0 ; x < 5 ; x ++ ) pre.push([])
            item.sub_case_list.forEach((element:any) => {
                if(element.result === 'Pass' && element.compare_data[i] === 'Fail'){
                    pre[0].push(element)
                }else if(element.result === 'Fail' && element.compare_data[i] === 'Pass'){
                    pre[1].push(element)
                }else if(element.result === 'Fail' && element.compare_data[i] === 'Fail'){
                    pre[2].push(element)
                }else if(element.result === 'Pass' && element.compare_data[i] === 'Pass'){
                    pre[3].push(element)
                }else{
                    pre[4].push(element) 
                }
            });
            return {
                ...item ,
                sub_case_list : [].concat( ...pre )
            }
        })

        setDataSource(
            dataSource.map(( item : any ) => {
                if ( item.suite_id === conf.suite_id ) 
                    return {
                        ...item , 
                        conf_list
                    }
                return item
            })
        )
    }
    let scrollLenght: number = 0
    let functionTables = dataSource?.map((conf: any,dataIdx:number) => {
        let tableLsit: any = []
        let column: any = [{
            title: conf.suite_name,
            width: 361,
            fixed: 'left',
            render: (row: any) => (
                <ExpandSubcases 
                    { ...row }
                    onExpand={ setExpandKeys }
                    expandKeys={ expandKeys }
                />
                
            )
        }]
        
        scrollLenght = 361  + 248 * props.groupData.length - 1 
        let metricList: any = []
        for (let confData = props.groupData, i = 0; i < ( confData.length < 4 ? 4 : confData.length ); i++) {
            if ( baseIndex === i ) 
                metricList.push({
                    title: '',
                    width: 248,
                    render: (row: any, index: number) => (
                        <div className={styles.right_border}>
                            <div className={styles.function_name} key={index}>
                                <span className={styles.all_case}>{row.all_case === 0 ? 0 : row.all_case || '-'}</span>
                                <span className={styles.success_case}>{row.success_case === 0 ? 0 : row.success_case || '-'}</span>
                                <span className={styles.fail_case}>{row.fail_case === 0 ? 0 : row.fail_case || '-'}</span>
                                <a style={{ paddingLeft:11 }} href={`/ws/${ws_id}/test_result/${row?.obj_id}`} target="_blank">
                                   { row?.obj_id ? <IconLink style={{ width: 12, height: 12 }}/> : <></> } 
                                </a>
                            </div>
                            {
                                 expandKeys.includes( row.conf_id ) && row.sub_case_list.map((item: any, idx: number) => {
                                    return (
                                        <div key={idx} className={styles.function_warp}>
                                            <span className={handleColor(item.result)}>{item.result}</span>
                                        </div>
                                    )
                                })
                            }
                        </div>
                    )
                })
            metricList.push({
                title: (
                    props.groupData.length - 1 > i &&
                    <div style={{ cursor:'pointer' }}>
                        <span onClick={()=>handleArrow(conf,i)}>
                            { arrowStyle == conf.suite_id && num == i ? <IconArrowBlue /> : <IconArrow/>   }
                            <span style={{ margin:'0 5px',color: arrowStyle == conf.suite_id && num == i ? '#1890FF' : 'rgba(0,0,0,0.9)' }}>差异化排序</span>
                        </span>
                        <Tooltip color="#fff" overlayStyle={{ minWidth:350 }} 
                          title={
                            <span style={{ color:'rgba(0,0,0,0.65)'}}>功能测试与BaseGroup结果不一致越多差异化越大。
                            <br/>规则如下：由上到下<br/>
                            <div style={{ width:320,height:200,border:'1px solid #ccc'}}>
                                <Row>
                                    <Col span={16}><div style={{ height:40,lineHeight:'20px' }}><span style={{ height: 22,width:88,background:'#0089FF',borderRadius:4,paddingLeft:8,color:'#fff',float:'right',margin:'8px 8px 0 0'}}>BaseGroup</span></div></Col>
                                </Row>
                                <Row>
                                    <Col span={8}><div style={{ borderRight:'1px solid #ccc',height:150,textAlign:'center'}}><span style={{ paddingTop:60,display:'block' }}>由上到下</span></div></Col>
                                    <Col span={8}><div style={{ borderRight:'1px solid #ccc',height:150,paddingLeft:12}}><p>pass</p><p>fail</p><p>fail</p><p>pass</p></div></Col>
                                    <Col span={8}><div style={{ height:150,paddingLeft:12}}><p>fail</p><p>pass</p><p>fail</p><p>pass</p></div></Col>
                                </Row>
                            </div>
                            </span>
                          }><QuestionCircleOutlined /></Tooltip>
                    </div>
                ),
                
                width: 248,
                render: (row: any) => {
                    return (
                        <div className={styles.right_border}>
                            {
                                row.conf_compare_data?.map((item: any, idx: number) => (
                                    idx === i &&
                                    <div className={styles.function_name} key={idx}>
                                        <span className={styles.all_case}>{item === null ? '-' : item.all_case }</span>
                                        <span className={styles.success_case}>{item === null ? '-' : item.success_case }</span>
                                        <span className={styles.fail_case}>{item === null ? '-' : item.fail_case }</span>
                                        { item !== null && <a style={{ paddingLeft:11 }} href={`/ws/${ws_id}/test_result/${item.obj_id}`} target="_blank">
                                                { item.obj_id ? <IconLink style={{ width: 12, height: 12 }}/> : <></> }
                                            </a> }
                                    </div>
                                ))
                            }
                            {
                                expandKeys.includes( row.conf_id ) && row.sub_case_list?.map((sub: any,index:any) => (
                                    sub.compare_data?.map((item: any, idx: number) => (
                                        idx === i && 
                                        <>
                                            <div className={styles.function_warp} key={index}>
                                                <span className={handleColor(item)} key={idx}>{item || '-'}</span>
                                            </div>
                                        </>
                                    ))
                                ))
                            }
                        </div>
                    )
                }
            })
        }

        column = column.concat(metricList)
        tableLsit.push(
            <Table
                className="table_bar"
                size="small"
                columns={column}
                dataSource={conf.conf_list}
                scroll={{ x: scrollLenght }}
                pagination={false}
                rowKey="conf_id"
            />
        )
        return tableLsit
    })
    return (
        <div>
            {
                dataSource && dataSource.length &&
                <div className={styles.data_warp} >
                    <Row style={{ padding: '20px 0' }}>
                        <Col span={4}>
                            功能测试
                        </Col>
                        <Col span={20}>
                            <Space style={{ float: 'right' }}>
                                筛选: <Select defaultValue="All" style={{ width: 200 }} onSelect={handleConditions}>
                                    <Option value="All">全部</Option>
                                    <Option value="Pass">成功</Option>
                                    <Option value="Fail">失败</Option>
                                    <Option value="Skip">跳过</Option>
                                </Select>
                                <Button onClick={switchAll}>{bntName}</Button>
                            </Space>
                        </Col>
                    </Row>
                    {functionTables}
                </div>
            }
        </div>
    )
}
export default FunctionalTest; 