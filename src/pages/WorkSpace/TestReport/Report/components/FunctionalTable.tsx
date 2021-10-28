import React, { useState, useEffect } from 'react';
import { Table, Tooltip, Row, Col, Popconfirm, Space, Select, Button, } from 'antd';

import EditSpan from '../../EditReport/components/EditSpan'
import { ReactComponent as IconArrow } from '@/assets/svg/icon_arrow.svg'
import { ReactComponent as IconArrowBlue } from '@/assets/svg/icon_arrow_blue.svg'
import { ReactComponent as IconLink } from '@/assets/svg/icon_openlink.svg';
import { QuestionCircleOutlined, MinusCircleOutlined, CaretRightOutlined } from '@ant-design/icons'

import produce from 'immer'

const { Option } = Select
// 单个展开
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
                    <div key={idx} className="function_warp">
                        <Tooltip placement="top" title={item.sub_case_name}>
                            <span className="sub_case_name">{item.sub_case_name}</span>
                        </Tooltip>
                    </div>
                ))
            }
        </div>
    )
}

const FunctionalTable = (props: any) => {
    const ws_id = location.pathname.replace(/\/ws\/([a-zA-Z0-9]{8})\/.*/, '$1')
    const { baseIndex, groupData, group, index, onChange, onDelete, btn, setTestItem } = props
    const [bntName, setBntName] = useState('展开所有')
    const [arrowStyle,setArrowStyle] = useState('')
    const [filterName,setFilterName] = useState('All')
    const [num,setNum] = useState(0)
    const [funcData, setFuncData] = useState(props.data)
    const [bnt, setBnt] = useState(false)
    const [expandKeys, setExpandKeys] = useState<any>([])

    const switchAll = () => {
        setBnt(!bnt)
    }

    useEffect(() => {
        setBntName(bnt ? '收起所有' : '展开所有')
        setExpandKeys([])
        setExpandKeys(
            bnt ?
                funcData.list.reduce(
                    (p: any, c: any) => p.concat(c.conf_list.map((item: any) => item.conf_id))
                    , [])
                :
                []
        )
    }, [bnt])

    useEffect(() => {
        setFuncData(props.data)
    }, [props.data])
    // 表格字体颜色渲染
    const handleColor = (result: any) => {
        if (result === 'Fail') {
            return "sub_case_red"
        } else if (result === 'Pass') {
            return "sub_case_green"
        } else {
            return "sub_case_normal"
        }
    }
    // 筛选操作
    const handleConditions = (value: any) => {
        setFilterName(value)
        let data = props.data
        let newData: any = []
        if (value == 'All') {
            setFuncData(data)
        } else {
            data.list.map((item: any) => {
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
            let obj = {
                ...data,
                list: newData
            }
            setFuncData(obj)
        }
    }
    // 差异化排序
    const handleArrow = (conf: any, i: any) => {
        setNum(i)
        setArrowStyle(conf.suite_id)
        let newData: any = []
        const conf_list = conf.conf_list.map((item: any) => {
            let pre: any = []
            for (let x = 0; x < 5; x++) pre.push([])
            item.sub_case_list.forEach((element: any) => {
                if (element.result === 'Pass' && element.compare_data[i] === 'Fail') {
                    pre[0].push(element)
                } else if (element.result === 'Fail' && element.compare_data[i] === 'Pass') {
                    pre[1].push(element)
                } else if (element.result === 'Fail' && element.compare_data[i] === 'Fail') {
                    pre[2].push(element)
                } else if (element.result === 'Pass' && element.compare_data[i] === 'Pass') {
                    pre[3].push(element)
                } else {
                    pre[4].push(element)
                }
            });
            return {
                ...item,
                sub_case_list: [].concat(...pre)
            }
        })
        setFuncData(funcData.list.map((item: any) => {
            let obj = {
                ...item,
                conf_list
            }
            newData.push(obj)
            if (item.suite_id === conf.suite_id)
                return {
                    ...funcData,
                    list: newData
                }
            return {
                ...funcData,
            }
        })[0])
    }
    // 删除suite及conf
    const handleDelete = (name: string, row: any, rowKey: any) => {
        let test: any = window.sessionStorage.getItem('test_item')
        let arr = JSON.parse(test)
        if (name == 'suite') {
            //更新页面table数据
            let ret: any =
                funcData.list.reduce(
                    (pre: any, suite: any) => {
                        if (Number(suite.suite_id) === Number(row.suite_id)) return pre
                        return pre.concat(suite)
                    },
                    []
                )
            setFuncData({
                ...funcData,
                list: ret,
            })

            let func_data = arr.func_data.map((item: any) => {
                let ret = item.suite_list.reduce((pre: any, suite: any) => {
                    if (Number(suite.suite_id) === Number(row.suite_id)) return pre
                    return pre.concat(suite)
                }, [])
                return {
                    ...item,
                    suite_list: ret,
                }

            })
            let obj = {
                perf_data: arr?.perf_data,
                func_data
            }
            window.sessionStorage.setItem('test_item', JSON.stringify(obj))

        } else {
            //更新页面table数据
            let ret: any = produce(funcData, (draftState: any) => {
                draftState.list = funcData.list.map(
                    (suite: any) => {
                        let conf_list = suite.conf_list.reduce(
                            (pre: any, conf: any) => {
                                if (Number(conf.conf_id) === Number(row.conf_id)) return pre
                                return pre.concat(conf)
                            },
                            []
                        )

                        return {
                            ...suite,
                            conf_list
                        }
                    }
                )
            })
            setFuncData({ ...ret })

            let func_data: any = []
            arr.func_data.map((item: any) => {
                let newArr: any = produce(item, (draft: any) => {
                    draft.suite_list = item.suite_list.map(
                        (suite: any) => {
                            let conf_list = suite.conf_list.reduce(
                                (pre: any, conf: any) => {
                                    if (Number(conf.conf_id) === Number(row.conf_id)) return pre
                                    return pre.concat(conf)
                                },
                                []
                            )
                            return {
                                ...suite,
                                conf_list
                            }
                        })
                })
                func_data.push(newArr)
            })
            let obj = {
                perf_data: arr?.perf_data,
                func_data
            }
            window.sessionStorage.setItem('test_item', JSON.stringify(obj))
        }
        setTestItem(true)
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
    // 数据遍历渲染
    let scrollLenght: number = 0
    let functionTables: any;
    functionTables = funcData.list?.map((conf: any, suiteIndex: number) => {
        let tableLsit: any = []
        let column: any = [{
            title:
                <div className="suite_name">
                    <span>{conf.suite_name}</span>
                    <span style={{ float: 'right', marginRight: 20 }}>
                        <Popconfirm
                            title='确认要删除吗！'
                            onConfirm={() => handleDelete('suite', conf, suiteIndex)}
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
            render: (row: any) => (
                <ExpandSubcases
                    {...row}
                    btn={btn}
                    onDel={() => handleDelete(funcData, null, `${suiteIndex}-${index}`)}
                    onExpand={setExpandKeys}
                    expandKeys={expandKeys}
                />
            )
        }]
        let metricList: any = []
        for (let confData = groupData, i = 0; i < (confData.length < 4 ? 4 : confData.length); i++) {
            if (baseIndex === i)
                metricList.push({
                    title: '',
                    width: 248,
                    render: (text: any, row: any, index: number) => (
                        <div className="right_border">
                            <div className="function_name" key={index}>
                                <span className="all_case">
                                    {(row?.all_case || row?.conf_source?.all_case) === 0 ? 0 : (row?.all_case || row.conf_source?.all_case) || '-'}
                                </span>
                                <span className="success_case">
                                    {(row?.success_case || row?.conf_source?.success_case) === 0 ? 0 : (row?.success_case || row.conf_source?.success_case) || '-'}
                                </span>
                                <span className="fail_case">
                                    {(row?.fail_case || row?.conf_source?.fail_case) === 0 ? 0 : (row?.fail_case || row.conf_source?.fail_case) || '-'}
                                </span>
                                <a style={{ paddingLeft: 11 }}
                                    href={`/ws/${ws_id}/test_result/${(row?.obj_id || row?.conf_source?.obj_id)}`} target="_blank">
                                    {(row?.obj_id || row?.conf_source?.obj_id) && <IconLink style={{ width: 12, height: 12 }} />}
                                </a>
                            </div>
                            {
                                expandKeys.includes(row.conf_id) && row.sub_case_list.map((item: any, idx: number) => {
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
                title:
                    groupData.length - 1 > i &&
                    <div style={{ cursor:'pointer' }}>
                        <span style={{ paddingLeft: 21 }} onClick={() => handleArrow(conf, i)}>
                            { arrowStyle == conf.suite_id && num == i ? <IconArrowBlue /> : <IconArrow/> }
                            <span style={{ margin: '0 5px',color: arrowStyle == conf.suite_id && num == i ? '#1890FF' : 'rgba(0,0,0,0.9)' }}>差异化排序</span>
                        </span>
                    <Different />
                    </div>
                    
                ,
                width: 248,
                render: (row: any) => {
                    let conf_data = row.conf_compare_data || row.compare_conf_list
                    return (
                        <div className="right_border">
                            {
                                conf_data?.map((item: any, idx: number) => {
                                    return (
                                        idx === i &&
                                        <div className="function_name" key={idx} >
                                            <span className="all_case">
                                                {(item?.all_case || item?.conf_source?.all_case) === 0 ? 0 : (item?.all_case || item?.conf_source?.all_case) || '-'}
                                            </span>
                                            <span className="success_case">
                                                {(item?.success_case || item?.conf_source?.success_case) === 0 ? 0 : (item?.success_case || item?.conf_source?.success_case) || '-'}
                                            </span>
                                            <span className="fail_case">
                                                {(item?.fail_case || item?.conf_source?.fail_case) === 0 ? 0 : (item?.fail_case || item?.conf_source?.fail_case) || '-'}
                                            </span>
                                            <a style={{ paddingLeft: 11 }}
                                                href={`/ws/${ws_id}/test_result/${(item?.obj_id || item?.conf_source?.obj_id)}`} target="_blank">
                                                {(item?.obj_id || item?.conf_source?.obj_id) && <IconLink style={{ width: 12, height: 12 }} />}
                                            </a>
                                        </div>
                                    )
                                })
                            }
                            {
                                expandKeys.includes(row.conf_id) && row.sub_case_list?.map((sub: any) => (
                                    sub.compare_data?.map((item: any, idx: number) => (
                                        idx === i && 
                                        <div className="function_warp">
                                            <span className={handleColor(item)}>{item || '-'}</span>
                                        </div>
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
            />
        )
        return tableLsit

    })

    const RenderItem: React.FC<any> = () => {
        return <div className="test_item" id={`func_item-${index}`}>
            <Row>
                <Col span={18} className="item_style">
                    <span className="point"></span>
                    <EditSpan
                        btn={btn}
                        title={funcData.name}
                        style={{ color: 'rgb(250,100,0)' }}
                        onOk={(val: any) => onChange(val, funcData.name, index)}
                    />
                    <span style={{ float: 'right' }}>
                        <Popconfirm
                            title='确认要删除吗！'
                            onConfirm={() => onDelete(group, funcData.name, index)}
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
                        筛选: <Select defaultValue="All" style={{ width: 200 }} value={filterName} onSelect={handleConditions}>
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
    }
    return (
        <>
            <RenderItem />
            <div className="table_margin">
                {functionTables}
            </div>
        </>
    )
}
export default FunctionalTable;