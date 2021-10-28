import React, { useState, useEffect } from 'react';
import { Table, Popover, Tooltip, Popconfirm, Row, Col, Space, Select, Button, } from 'antd';
import { SettingEdit } from '@/components/ReportEidt/index';
import ChartsIndex from '../../../AnalysisResult/components/ChartIndex';
import EditSpan from './EditSpan'
import { ReactComponent as IconArrow } from '@/assets/svg/icon_arrow.svg'
import { ReactComponent as IconLink } from '@/assets/svg/icon_openlink.svg';
import { QuestionCircleOutlined, MinusCircleOutlined } from '@ant-design/icons'
import { handleColor, handleIcon, toPercentage } from '@/components/AnalysisMethods/index';
import { isArray } from 'lodash';
import produce from 'immer'
const { Option } = Select
const PerformanceTable = (props: any) => {
    const ws_id = location.pathname.replace(/\/ws\/([a-zA-Z0-9]{8})\/.*/, '$1')
    const { btn, groupData, baseIndex, editData, domain, template, rowkey, identify, group, onChange, onDelete, parent } = props
    const [perData, setPerData] = useState(props.perData)
    const [layoutWidth, setLayoutWidth] = useState(innerWidth)
    const [modifySource, setModifySource] = useState(editData)
    // const [modelVisible, setModelVisible] = useState(type == 0 ? true : false)
    const [modelVisible, setModelVisible] = useState(false)
    useEffect(() => {
        setPerData(props.perData)
    }, [props.perData])

    const windowWidth = () => setLayoutWidth(innerWidth)
    useEffect(() => {
        window.addEventListener('resize', windowWidth)
        return () => {
            window.removeEventListener('resize', windowWidth)
        }
    }, [])

    const switchMode = async (name: string) => {
        if (name === 'list') {
            setModelVisible(true)
        }
        else {
            setModelVisible(false)
        }
    }
    const handleConditions = (value: any) => {
        let dataSource = props.perData
        let newArr: any = []
        let newData: any = []
        dataSource.map((item: any) => {
            item.conf_list.map((conf: any) => {
                conf.metric_list.map((metric: any) => {
                    metric.compare_data.map((compare: any) => {
                        if (compare.compare_result == value)
                            newData.push(conf.conf_id)
                    })
                })
            })
        })
        if (value === 'all') {
            setPerData(dataSource)
        } else if (value === 'volatility') {
            let newData: any = []
            dataSource.map((item: any) => {
                item.conf_list.map((conf: any) => {
                    conf.metric_list.map((metric: any) => {
                        metric.compare_data.map((compare: any) => {
                            if (compare.compare_result === 'increase' || compare.compare_result === 'decline')
                                newData.push(conf.conf_id)
                        })
                    })
                })
            })
            dataSource.map((item: any) => {
                let conf_list = item.conf_list.filter((conf: any) => newData.includes(conf.conf_id));
                newArr.push({
                    ...item,
                    conf_list
                })
            })

            setPerData(newArr)
        } else {
            dataSource.map((item: any) => {
                let conf_list = item.conf_list.filter((conf: any) => newData.includes(conf.conf_id));
                newArr.push({
                    ...item,
                    conf_list
                })
            })
            setPerData(newArr)
        }
    }
    let scrollLenght: number = 0
    const handleDelete = (data: any, index: any, rowKey: any) => {
        if (data.length > 0) {
            if (rowKey.length > 1) {
                let newData: any = data.map((item: any, idx: number) => {
                    let conf_list: any = []
                    item.conf_list.map((conf: any, conf_idx: number) => {
                        const itemKey = `${idx}-${conf_idx}`
                        if (itemKey == rowKey) {
                            setModifySource(produce(modifySource, (draftState: any) => {
                                draftState.perf_data.update_item[domain].update_suite[item.item_suite_id].delete_conf
                                    =
                                    modifySource.perf_data.update_item[domain].update_suite[item.item_suite_id].delete_conf.concat(conf.item_conf_id)
                            }))
                            let test: any = window.sessionStorage.getItem('test_item')
                            const test_item: any = JSON.parse(test)
                            window.sessionStorage.setItem('test_item', JSON.stringify(produce(test_item, (draftState: any) => {
                                draftState.perf_data.update_item[domain].update_suite[item.item_suite_id].delete_conf
                                    =
                                    test_item.perf_data.update_item[domain].update_suite[item.item_suite_id].delete_conf.concat(conf.item_conf_id)
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
                setPerData(newData)

            } else {
                let arr: any = []
                data.map((item: any, idx: number) => {
                    const itemKey = index ? `${index}-${idx}` : idx + ''
                    if (itemKey == rowKey) {
                        setModifySource(produce(modifySource, (draftState: any) => {
                            draftState.perf_data.update_item[domain].delete_suite =
                                modifySource.perf_data.update_item[domain].delete_suite.concat(item.item_suite_id)
                        }))
                        let test: any = window.sessionStorage.getItem('test_item')
                        const test_item: any = JSON.parse(test)
                        window.sessionStorage.setItem('test_item', JSON.stringify(produce(test_item, (draftState: any) => {
                            draftState.perf_data.update_item[domain].delete_suite =
                                test_item.perf_data.update_item[domain].delete_suite.concat(item.item_suite_id)
                        })))
                        return
                    } else {
                        arr.push(item)
                    }
                })
                setPerData(arr)
            }
        }
    }
    const handleFieldChange = (field: any, name: string, suite: any) => {
        setModifySource(produce(modifySource, (draftState: any) => {
            draftState.perf_data.update_item[domain].update_suite[suite.item_suite_id][name] = field
        }))
        let test: any = window.sessionStorage.getItem('test_item')
        const test_item = JSON.parse(test)
        window.sessionStorage.setItem('test_item', JSON.stringify(produce(test_item, (draftState: any) => {
            draftState.perf_data.update_item[domain].update_suite[suite.item_suite_id][name] = field
        })))

    }

    const handleArrow = (suite: any, i: any) => {
        let dataSource = props.perData
        let newArr: any = []
        let newData: any = []
        suite.conf_list.map((conf: any, index: number) => {
            let metric_list: any = []
            conf.metric_list.map((metric: any) => {
                let result = metric.compare_data[i]
                if (result.compare_result == 'decline') {
                    metric.sortNum = 0
                } else if (result.compare_result == 'increase') {
                    metric.sortNum = 1
                } else if (result.compare_result == 'normal') {
                    metric.sortNum = 2
                } else if (result.compare_result == 'invalid') {
                    metric.sortNum = 3
                } else {
                    metric.sortNum = 4
                }

                metric_list.push({
                    ...metric
                })
            })
            newArr.push({
                ...conf,
                metric_list
            })
        })
        const compare = (prop: any) => {
            return function (a: any, b: any) {
                return a[prop] - b[prop]
            }
        }

        const endList = newArr.map((item: any) => {
            let result = item.metric_list.sort(compare('sortNum'))
            return {
                ...item,
                metric_list: result
            }
        })
        dataSource.suiteArr.map((item: any) => {
            if (item.suite_id == suite.suite_id) {
                newData.push({
                    ...item,
                    conf_list: endList
                })
            } else {
                newData.push({
                    ...item
                })
            }

        })
        let obj = {
            ...dataSource,
            suiteArr: newData
        }
        setPerData(obj)
    }
    //表格渲染
    let functionTables: any;

    const checkUpdate = (name: any, item_suite_id: any, key: any) => {
        const { update_item } = modifySource.perf_data
        let title = name
        Object.keys(update_item).forEach((item: any) => {
            const { update_suite } = update_item[item]
            Object.keys(update_suite).forEach((id: any) => {
                if (id - 0 === item_suite_id) {
                    title = update_suite[id][key]
                }
            })
        })
        return title
    }
    functionTables = perData?.map((suite: any, suiteIndex: number) => {

        if (suite.conf_list && suite.conf_list.length) {
            let tableLsit: any = []
            let column: any = [{
                title: <div style={{ width: layoutWidth - 41 }}>
                    <div className="suite_name">
                        <span>{suite.suite_name}</span>
                        <span style={{ float: 'right', marginRight: 20 }}>
                            <Popconfirm
                                title='确认要删除吗！'
                                onConfirm={() => handleDelete(perData, null, suiteIndex + '')}
                                cancelText="取消"
                                okText="删除"
                            >
                                {btn && <MinusCircleOutlined
                                    className="remove_active"
                                />}
                            </Popconfirm>
                        </span>
                    </div>
                    <div style={{ background: '#fff', paddingLeft: 21 }}>
                        {
                            template.is_default ?
                                <></>
                                :
                                <>
                                    <div style={{ paddingTop: 20 }}></div>
                                    {template.need_test_suite_description &&
                                        <div>
                                            <div>测试工具:</div>
                                            <div>{suite.test_suite_description || '-'}</div>
                                        </div>
                                    }
                                    {
                                        template.need_test_env &&
                                        <SettingEdit
                                            name={checkUpdate(suite.test_env, suite.item_suite_id, 'test_env')}
                                            position="bottom"
                                            text="测试环境"
                                            btn={btn}
                                            onOk={(val: any) => handleFieldChange(val, 'test_env', suite)}
                                        />
                                    }
                                    {
                                        template.need_test_description &&
                                        <SettingEdit
                                            name={checkUpdate(suite.test_description, suite.item_suite_id, 'test_description')}
                                            position="bottom"
                                            text="测试说明"
                                            btn={btn}
                                            onOk={(val: any) => handleFieldChange(val, 'test_description', suite)}
                                        />
                                    }
                                    {
                                        template.need_test_conclusion &&
                                        <SettingEdit
                                            name={checkUpdate(suite.test_conclusion, suite.item_suite_id, 'test_conclusion')}
                                            position="bottom"
                                            text="测试结论"
                                            btn={btn}
                                            onOk={(val: any) => handleFieldChange(val, 'test_conclusion', suite)}
                                        />
                                    }
                                    <div style={{ paddingBottom: 10 }}></div>
                                </>
                        }
                    </div>
                </div>,
                width: 361,
                key: 'metric',
                fixed: 'left',
                render: (text: any, row: any, index: number) => {
                    return (
                        <div className="right_border">
                            <div className="conf_name" >
                                <span className="conf_name_text">
                                    {row?.conf_name}
                                    <span style={{ float: 'right' }}>
                                        <Popconfirm
                                            title='确认要删除吗！'
                                            onConfirm={() => handleDelete(perData, null, `${suiteIndex}-${index}`)}
                                            cancelText="取消"
                                            okText="删除"
                                        >
                                            {btn && <MinusCircleOutlined
                                                className="remove_active"
                                            />}
                                        </Popconfirm>
                                    </span>
                                </span>
                            </div>
                            {
                                row?.metric_list?.map((metric: any, index: number) => (
                                    <div key={index}>
                                        <div className="metric_warp">
                                            <Tooltip placement="topLeft" title={metric.metric}>
                                                <span className="metric_name">{metric.metric}{metric.unit && <span>({metric.unit})</span>}</span>
                                            </Tooltip>
                                            <span className="cv_name">
                                                ({`${toPercentage(metric.cv_threshold)}/${toPercentage(metric.cmp_threshold)}`})
                                            </span>
                                        </div>
                                        <div style={{ height: 8 }}></div>
                                    </div>
                                ))
                            }
                        </div>
                    )
                }
            }]

            scrollLenght = 361 + 248 * groupData.length - 1
            let metricList: any = []
            for (let i = 0; i < (groupData.length < 4 ? 4 : groupData.length); i++) {
                if (baseIndex === i)
                    metricList.push({
                        width: 248,
                        title: '',
                        render: (row: any, index: number) => {
                            return (
                                <div className="right_border">
                                    <div className="conf_name" >
                                        <a style={{ paddingLeft: 21 }}
                                            href={`/ws/${ws_id}/test_result/${row?.conf_source.obj_id}`}
                                            target="_blank">
                                            <IconLink style={{ width: 12, height: 12 }} />
                                        </a>
                                    </div>
                                    {
                                        row?.metric_list?.map((metric: any, index: number) => {
                                            if (JSON.stringify(metric) === '{}') {
                                                return <div key={index}>
                                                    <div className="metric_warp"><span className="job_cv">-</span></div>
                                                    <div style={{ height: 8 }}></div>
                                                </div>
                                            } else {
                                                return <div key={index}>
                                                    <div className="metric_warp">
                                                        <span className="job_cv">{`${metric.test_value}±${metric.cv_value}`}</span>
                                                    </div>
                                                    <div style={{ height: 8 }}></div>
                                                </div>
                                            }
                                        })
                                    }
                                </div>
                            )
                        },
                    })
                metricList.push(
                    {
                        title:
                            <div style={{ position: 'absolute', top: 10, left: 21, zIndex: 999 }}>
                                {
                                    (
                                        groupData.length - 1 > i &&
                                        <>
                                            <span onClick={() => handleArrow(suite, i)}><IconArrow /> </span>
                                            <span style={{ margin: '0 5px' }}>差异化排序</span>
                                            <Tooltip color="#fff" overlayStyle={{ minWidth: 350 }} title={<span style={{ color: 'rgba(0,0,0,0.65)' }}>性能测试与BaseGroup差值比例越大差异化越大。<br />规则如下：<br />下降&gt;上升&gt;波动不大&gt;无效</span>}><QuestionCircleOutlined /></Tooltip>
                                        </>
                                    )
                                }
                            </div>,
                        width: 248,
                        render: (text: any, row: any, index: any) => {
                            return (
                                <div className="right_border">
                                    { groupData.length - 1 > i &&
                                        <div className="conf_name">
                                            <a
                                                style={{ paddingLeft: 21 }}
                                                href={`/ws/${ws_id}/test_result/${row.compare_conf_list[i]?.obj_id}`}
                                                target="_blank"
                                            >
                                                {row.compare_conf_list[i] && <IconLink style={{ width: 12, height: 12 }} />}
                                            </a>
                                        </div>
                                    }
                                    {
                                        row?.metric_list?.map((metric: any, c: number) => (
                                            metric.compare_data?.map((item: any, idx: any) => {
                                                if (JSON.stringify(item) === '{}') {
                                                    return idx === i && <div key={index}>
                                                        <div className="metric_warp"><span className="job_cv">-</span></div>
                                                        <div style={{ height: 8 }}></div>
                                                    </div>
                                                } else {
                                                    const common = (
                                                        idx === i &&
                                                        <div key={idx}>
                                                            <div className="metric_warp">
                                                                <span className="job_cv">{`${item.test_value}±${item.cv_value}` || '-'} </span>
                                                                <div className="job_common">
                                                                    <span className={handleColor(item.compare_result)}>{item.compare_value || '-'}</span>
                                                                    <span className={handleColor(item.compare_result)}>{handleIcon(item.compare_result) || '-'}</span>
                                                                </div>

                                                            </div>
                                                            <div style={{ height: 8 }}></div>
                                                        </div>
                                                    )
                                                    return <Popover
                                                        content={
                                                            <div style={{ width: 200 }} key={idx}>
                                                                <div>
                                                                    <span className="prover_title">Max:</span>
                                                                    <span className="prover_content">{item.max_value}</span>
                                                                </div>
                                                                <div>
                                                                    <span className="prover_title">Min:</span>
                                                                    <span className="prover_content">{item.min_value}</span>
                                                                </div>
                                                                <div>
                                                                    <span className="prover_title">期望方向:</span>
                                                                    <span className="prover_content">{metric.direction}</span>
                                                                </div>
                                                                <div style={{ marginTop: 15 }}>
                                                                    <span className="prover_title">Test Record</span>
                                                                    {
                                                                        item.value_list?.map((item: any, index: number) => (
                                                                            <div key={index}>({index + 1}){item}</div>
                                                                        ))
                                                                    }
                                                                </div>
                                                            </div>
                                                        }
                                                        trigger="hover"
                                                        placement='topLeft'
                                                    >
                                                        {common}
                                                    </Popover>
                                                }
                                            })

                                        ))
                                    }
                                </div>
                            )
                        },
                    }
                )
            }
            column = column.concat(metricList)
            tableLsit.push(
                <Table
                    className="table_bar"
                    size="small"
                    key={suiteIndex}
                    columns={column}
                    dataSource={suite.conf_list}
                    scroll={{ x: scrollLenght }}
                    pagination={false}
                />
            )
            return tableLsit
        }
    })
    let name = ""
    let title = domain

    if (modifySource && modifySource.perf_data && !isArray(modifySource.perf_data.update_item)) {
        const update_item = modifySource.perf_data?.update_item
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
            <>
                {
                    modelVisible ?
                        <>
                            <div className="test_item" key={rowkey}>
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
                                            筛选: <Select defaultValue="all" style={{ width: 200 }} onSelect={handleConditions}>
                                                <Option value="all">全部</Option>
                                                <Option value="invalid">无效</Option>
                                                <Option value="volatility">波动大（包括上升、下降）</Option>
                                                <Option value="increase">上升</Option>
                                                <Option value="decline">下降</Option>
                                                <Option value="normal">正常</Option>
                                            </Select>
                                            <Button onClick={() => switchMode('chart')}>图表模式</Button>
                                        </Space>
                                    </Col>
                                </Row>
                            </div>
                            <div className="table_margin">
                                {functionTables}
                            </div>
                        </>
                        :
                        <>
                            <div className="test_item">
                                <Row>
                                    <Col span={18} className="item_style">
                                        <span className="point"></span>
                                        <EditSpan
                                            btn={btn}
                                            title={domain}
                                            style={{ color: 'rgb(250,100,0)' }}
                                            onOk={(val: any) => onChange(val, name, rowkey)}
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
                                            <Button onClick={() => switchMode('list')}>列表模式</Button>
                                        </Space>
                                    </Col>
                                </Row>
                            </div>
                            <div style={{ padding: '0 20px' }}>
                                {
                                    props.perData?.map((item: any, index: number) => (
                                        <ChartsIndex {...item} compareData={props.compareData} identify={identify} key={index} />
                                    ))
                                }
                            </div>
                        </>
                }
            </>
        </div>
    )
}
export default PerformanceTable;