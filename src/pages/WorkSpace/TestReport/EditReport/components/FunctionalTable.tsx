import React, { useState, useEffect } from 'react';
import { Table, Tooltip, Row, Col, Popconfirm, Select, Button, Space } from 'antd';
import EditSpan from './EditSpan'
import { ReactComponent as IconArrow } from '@/assets/svg/icon_arrow.svg'
import { ReactComponent as IconLink } from '@/assets/svg/icon_openlink.svg';
import { QuestionCircleOutlined, MinusCircleOutlined, CaretRightOutlined } from '@ant-design/icons'
import produce from 'immer'
import { isArray } from 'lodash';
const { Option } = Select

const ExpandSubcases = (props: any) => {
    const { sub_case_list, conf_name, conf_id, onDel, onExpand, expandKeys, btn } = props
    const expand = expandKeys.includes(conf_id)
    const hanldeExpand = (id: any) => {
        if (expand)
            onExpand(expandKeys.filter((i: any) => i !== id))
        else
            onExpand(expandKeys.concat(id))
    }

    return (
        <div className="right_border">
            <div className="function_name" >
                <Space>
                    <CaretRightOutlined
                        style={{ cursor: 'pointer' }}
                        rotate={expand ? 90 : 0}
                        onClick={() => hanldeExpand(conf_id)}
                    />
                    <span className="conf_name_text">{conf_name}</span>
                </Space>
                <span style={{ float: 'right' }}>
                    <Popconfirm
                        title='确认要删除吗！'
                        onConfirm={onDel}
                        cancelText="取消"
                        okText="删除"
                    >
                        {btn && <MinusCircleOutlined
                            className="remove_active"
                        />}
                    </Popconfirm>
                </span>
            </div>
            {
                expand && sub_case_list?.map((item: any, idx: number) => (
                    <Tooltip placement="topLeft" title={item.sub_case_name}>
                        <div key={idx} className="function_warp"><span className="sub_case_name">
                            {item.sub_case_name}</span></div>
                    </Tooltip>
                    
                ))
            }
        </div>
    )
}

const FunctionalTable = (props: any) => {
    const { baseIndex, groupData, btn, editData, domain, rowkey, group, onChange, onDelete, parent } = props
    const ws_id = location.pathname.replace(/\/ws\/([a-zA-Z0-9]{8})\/.*/, '$1')
    const [bntName, setBntName] = useState('展开所有')
    const [bnt, setBnt] = useState(false)
    const [funcData, setFuncData] = useState(props.data)
    const [modifySource, setModifySource] = useState(editData)
    const [expandKeys, setExpandKeys] = useState<any>([])

    useEffect(() => {
        setFuncData(props.data)
    }, [props.data])

    const switchAll = () => {
        setBnt(!bnt)
    }

    useEffect(() => {
        setBntName(bnt ? '收起所有' : '展开所有')
        setExpandKeys([])
        setExpandKeys(
            bnt ?
                funcData.reduce(
                    (p: any, c: any) => p.concat(c.conf_list.map((item: any) => item.conf_id))
                    , [])
                :
                []
        )
    }, [bnt])

    const handleColor = (result: any) => {
        if (result === 'Fail') {
            return "sub_case_red"
        } else if (result === 'Pass') {
            return "sub_case_green"
        } else {
            return "sub_case_normal"
        }
    }
    const handleConditions = (value: any) => {
        let data = props.data
        let newData: any = []
        if (value == 'All') {
            setFuncData(data)
        } else {
            data.map((item: any) => {
                let conf_list: any = []
                item.conf_list.map((conf: any) => {
                    let sub_case_list = conf.sub_case_list.filter((i: any) => i.result == value)
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
            setFuncData(newData)
        }
    }
    const handleArrow = (conf:any,i:any) => {
        let newData: any = []
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
        setFuncData(funcData.suiteArr.map(( item : any ) => {
            let obj = {
                ...item,
                conf_list
            }
            newData.push(obj)
            if ( item.suite_id === conf.suite_id ) 
            return {
                ...funcData,
                suiteArr:newData
            }
            return {
                ...funcData,
            }
        })[0])
    }

    const handleDelete = (data: any, index: any, rowKey: any) => {
        if (rowKey.length > 1) {
            let newData: any = data.map((item: any, idx: number) => {
                let conf_list: any = []
                item.conf_list.map((conf: any, conf_idx: number) => {
                    const itemKey = `${idx}-${conf_idx}`
                    if (String(itemKey) === String(rowKey)) {
                        setModifySource(produce(modifySource, (draftState: any) => {
                            draftState.func_data.update_item[domain].update_suite[item.item_suite_id].delete_conf
                            =
                            modifySource.func_data.update_item[domain].update_suite[item.item_suite_id].delete_conf.concat(conf.item_conf_id)
                        }))
                        let test: any = window.sessionStorage.getItem('test_item')
                        const test_item: any = JSON.parse(test)
                        window.sessionStorage.setItem('test_item', JSON.stringify(produce(test_item, (draftState: any) => {
                            draftState.func_data.update_item[domain].update_suite[item.item_suite_id].delete_conf
                            =
                            test_item.func_data.update_item[domain].update_suite[item.item_suite_id].delete_conf.concat(conf.item_conf_id)
                        })))
                        return conf_list
                    } else {
                        conf_list.push(conf)
                    }
                })

                return {
                    ...item,
                    conf_list
                }
            })
            setFuncData(newData)
        } else {
            let arr: any = []
            data.map((item: any, idx: number) => {
                const itemKey = index ? `${index}-${idx}` : idx + ''
                if (String(itemKey) === String(rowKey)) {
                    setModifySource(produce(modifySource, (draftState: any) => {
                        draftState.func_data.update_item[domain].delete_suite =
                            modifySource.func_data.update_item[domain].delete_suite.concat(item.item_suite_id)
                    }))
                    let test: any = window.sessionStorage.getItem('test_item')
                    const test_item: any = JSON.parse(test)
                    window.sessionStorage.setItem('test_item', JSON.stringify(produce(test_item, (draftState: any) => {
                        draftState.func_data.update_item[domain].delete_suite =
                            test_item.func_data.update_item[domain].delete_suite.concat(item.item_suite_id)
                    })))
                    return
                } else {
                    arr.push(item)
                }
            })
            setFuncData(arr)
        }
    }
    const Different: React.FC<any> = (props) => {
        return (
            <Tooltip color="#fff" overlayStyle={{ minWidth: 350 }}
                title={
                    <span style={{ color: 'rgba(0,0,0,0.65)' }}>功能测试与BaseGroup结果不一致越多差异化越大。
                        <br />规则如下：由上到下<br />
                        <div style={{ width: 320, height: 200, border: '1px solid #ccc' }}>
                            <Row>
                                <Col span={16}><div style={{ height: 40, lineHeight: '20px' }}><span style={{ height: 22, width: 88, background: '#0089FF', borderRadius: 4, paddingLeft: 8, color: '#fff', float: 'right', margin: '8px 8px 0 0' }}>BaseGroup</span></div></Col>
                            </Row>
                            <Row>
                                <Col span={8}><div style={{ borderRight: '1px solid #ccc', height: 150, textAlign: 'center' }}><span style={{ paddingTop: 60, display: 'block' }}>由上到下</span></div></Col>
                                <Col span={8}><div style={{ borderRight: '1px solid #ccc', height: 150, paddingLeft: 12 }}><p>pass</p><p>fail</p><p>fail</p><p>pass</p></div></Col>
                                <Col span={8}><div style={{ height: 150, paddingLeft: 12 }}><p>fail</p><p>pass</p><p>fail</p><p>pass</p></div></Col>
                            </Row>
                        </div>
                    </span>
                }>
                <QuestionCircleOutlined />
            </Tooltip>
        )
    }

    let scrollLenght: number = 0
    let functionTables: any;

    functionTables = funcData?.map((conf: any, suiteIndex: number) => {
        let tableLsit: any = []
        let column: any = [{
            title:
                <div className="suite_name">
                    <span>{conf.suite_name}</span>
                    <span style={{ float: 'right', marginRight: 20 }}>
                        <Popconfirm
                            title='确认要删除吗！'
                            onConfirm={() => handleDelete(funcData, null, suiteIndex)}
                            cancelText="取消"
                            okText="删除"
                        >
                            {btn && <MinusCircleOutlined
                                className="remove_active"
                            />}
                        </Popconfirm>
                    </span>
                </div>,
            width: 361,
            fixed: 'left',
            render: (text: any, row: any, index: number) => (
                <ExpandSubcases
                    {...row}
                    btn={btn}
                    onDel={() => handleDelete(funcData, null, `${suiteIndex}-${index}`)}
                    onExpand={setExpandKeys}
                    expandKeys={expandKeys}
                />
            )
        }]

        scrollLenght = 361 + 248 * groupData.length - 1
        let metricList: any = []

        for (let confData = groupData, i = 0; i < (confData.length < 4 ? 4 : confData.length); i++) {
            if (baseIndex === i)
                metricList.push({
                    title: '',
                    width: 248,
                    render: (text: any, row: any, index: number) => (
                        <div className="right_border">
                            <div className="function_name">
                                <span className="all_case">
                                    {row.conf_source.all_case === 0 ? 0 : row.conf_source.all_case || '-'}
                                </span>
                                <span className="success_case">
                                    {row.conf_source.success_case === 0 ? 0 : row.conf_source.success_case || '-'}
                                </span>
                                <span className="fail_case">
                                    {row.conf_source.fail_case === 0 ? 0 : row.conf_source.fail_case || '-'}
                                </span>
                                <a style={{ paddingLeft: 11 }}
                                    href={`/ws/${ws_id}/test_result/${row.conf_source.obj_id}`}
                                    target="_blank">
                                    <IconLink style={{ width: 12, height: 12 }} />
                                </a>
                            </div>
                            {
                                (expandKeys.includes(row.conf_id)) && row.sub_case_list.map((item: any, idx: number) => {
                                    return (
                                        <div key={idx} className="function_warp">
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
                    groupData.length - 1 > i &&
                    <>
                        <span onClick={() => handleArrow(conf, i)}><IconArrow /></span>
                        <span style={{ margin: '0 5px' }}>差异化排序</span>
                        <Different />
                    </>
                ),
                width: 248,
                render: (row: any) => {
                    return (
                        <div className="right_border">
                            {
                                row.compare_conf_list?.map((item: any, idx: number) => (
                                    idx === i && item &&
                                    <div className="function_name" key={idx} >
                                        <span className="all_case">
                                            {item.all_case === 0 ? 0 : item.all_case || '-'}
                                        </span>
                                        <span className="success_case">
                                            {item.success_case === 0 ? 0 : item.success_case || '-'}
                                        </span>
                                        <span className="fail_case">
                                            {item.fail_case === 0 ? 0 : item.fail_case || '-'}
                                        </span>
                                        {item &&
                                            <a style={{ paddingLeft: 11 }}
                                                href={`/ws/${ws_id}/test_result/${item.obj_id}`}
                                                target="_blank">
                                                <IconLink style={{ width: 12, height: 12 }} />
                                            </a>
                                        }
                                    </div>
                                ))
                            }
                            {
                                expandKeys.includes(row.conf_id) && row.sub_case_list?.map((sub: any) => (
                                    <div className="function_warp">
                                        {
                                            sub.compare_data?.map((item: any, idx: number) => {
                                                return (
                                                    idx === i && <span className={handleColor(item)}>{item || '-'}</span>
                                                )
                                            })
                                        }
                                    </div>
                                ))
                            }
                            {
                                !row.conf_compare_data && <div />
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
                rowClassName={() => "func_table_row_no_padding"}
                scroll={{ x: scrollLenght }}
                pagination={false}
            />
        )
        return tableLsit
    })
    let name = ""
    let title = domain

    if (modifySource && modifySource.func_data && !isArray(modifySource.func_data.update_item)) {
        const update_item = modifySource.func_data?.update_item
        Object.keys(update_item).forEach((ctx) => {
            const updateTitle = `${parent ? `${parent}:` : ''}${domain}`
            if (ctx === updateTitle && update_item[ctx].name) {
                title = update_item[ctx].name.indexOf(':') > -1 ? update_item[ctx].name.split(':')[1] : update_item[ctx].name
            }
        })
    }
    if (group == 'group') {
        name = `${parent}:${domain}`
    } else {
        name = domain
    }

    return (
        <div>
            {
                <>
                    <div className="test_item" key="rowkey" >
                        <Row>
                            <Col span={18} className="item_style">
                                <span className="point"></span>
                                <EditSpan
                                    btn={btn}
                                    title={title}
                                    style={{ color: 'rgb(250,100,0)' }}
                                    onOk={(val: any) => onChange(val, domain, rowkey)}
                                />
                                <span style={{ float: 'right' }}>
                                    <Popconfirm
                                        title='确认要删除吗！'
                                        onConfirm={() => onDelete(name, null, rowkey)}
                                        cancelText="取消"
                                        okText="删除"
                                    >
                                        {btn && <MinusCircleOutlined
                                            className="remove_active"
                                        />}
                                    </Popconfirm>
                                </span>
                            </Col>
                            <Col span={6}>
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
                    </div>
                    <div className="table_margin">
                        {functionTables}
                    </div>
                </>
            }
        </div>
    )
}
export default FunctionalTable;




