import React, { useState, useEffect, memo } from 'react';
import { Table, Popover, Tooltip, Popconfirm, Row, Col, Select, Space, Button, Empty } from 'antd';
import { ReactComponent as IconArrow } from '@/assets/svg/icon_arrow.svg'
import { ReactComponent as IconArrowBlue } from '@/assets/svg/icon_arrow_blue.svg'
import ChartsIndex from '../../../AnalysisResult/components/ChartIndex';
import { SettingEdit } from '@/components/ReportEidt/index'
import EditSpan from '../../EditReport/components/EditSpan'
import { ReactComponent as IconLink } from '@/assets/svg/icon_openlink.svg';
import { QuestionCircleOutlined, MinusCircleOutlined } from '@ant-design/icons'
import { handleColor, handleIcon, toPercentage } from '@/components/AnalysisMethods/index';
import produce from 'immer'
const { Option } = Select
const PerformanceTable = (props: any) => {
    const ws_id = location.pathname.replace(/\/ws\/([a-zA-Z0-9]{8})\/.*/, '$1')
    const { switchReport, btn, groupData, baseIndex, describe, index, group, identify, setTestItem, onDelete, onChange } = props
    const [perData, setPerData] = useState<any>({})
    const [arrowStyle, setArrowStyle] = useState('')
    const [filterName, setFilterName] = useState('all')
    const [num, setNum] = useState(0)
    const [layoutWidth, setLayoutWidth] = useState(innerWidth)
    const [modelVisible, setModelVisible] = useState(!switchReport ? true : describe?.show_type == 'list' ? true : false)

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
    // 筛选过滤
    const handleConditions = (value: any) => {
        setFilterName(value)
        let dataSource = props.perData
        let newArr: any = []
        let newData: any = []
        dataSource.list.map((item: any) => {
            item.conf_list.map((conf: any) => {
                conf.metric_list.map((metric: any) => {
                    metric.compare_data.map((compare: any) => {
                        if (compare.compare_result === value)
                            newData.push(conf.conf_id)
                    })
                })
            })
        })
        if (value === 'all') {
            setPerData(dataSource)
        } else if (value === 'volatility') {
            let newData: any = []
            dataSource.list.map((item: any) => {
                item.conf_list.map((conf: any) => {
                    conf.metric_list.map((metric: any) => {
                        metric.compare_data.map((compare: any) => {
                            if (compare.compare_result === 'increase' || compare.compare_result === 'decline')
                                newData.push(conf.conf_id)
                        })
                    })
                })
            })
            dataSource.list.map((item: any) => {
                let conf_list = item.conf_list.filter((conf: any) => newData.includes(conf.conf_id));
                newArr.push({
                    ...item,
                    conf_list
                })
            })
            let obj = {
                ...dataSource,
                list: newArr
            }
            setPerData(obj)
        } else {
            dataSource.list.map((item: any) => {
                let conf_list = item.conf_list.filter((conf: any) => newData.includes(conf.conf_id));
                newArr.push({
                    ...item,
                    conf_list
                })
            })
            let obj = {
                ...dataSource,
                list: newArr
            }
            setPerData(obj)
        }
    }
    const handleDelete = (name: string, row: any, rowKey: any) => {
        let test: any = window.sessionStorage.getItem('test_item')
        let arr = JSON.parse(test)
        // 更新保存报告接口数据
        if (name == 'suite') {
            //更新页面table数据
            let ret: any =
                perData.list.reduce(
                    (pre: any, suite: any) => {
                        if (Number(suite.suite_id) === Number(row.suite_id)) return pre
                        return pre.concat(suite)
                    },
                    []
                )
            setPerData({
                ...perData,
                list: ret,
            })

            let perf_data = arr.perf_data.map((item: any) => {
                let ret = item.suite_list.reduce((pre: any, suite: any) => {
                    if (suite.suite_id == row.suite_id) return pre
                    return pre.concat(suite)
                }, [])
                return {
                    ...item,
                    suite_list: ret,
                }

            })
            let obj = {
                perf_data,
                func_data: arr.func_data
            }
            window.sessionStorage.setItem('test_item', JSON.stringify(obj))

        } else {
            //更新页面table数据
            let ret: any = produce(perData, (draftState: any) => {
                draftState.list = perData.list.map(
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
            setPerData({ ...ret })

            let perf_data: any = []
            arr.perf_data.map((item: any) => {
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
                perf_data.push(newArr)
            })
            let obj = {
                perf_data,
                func_data: arr.func_data
            }
            window.sessionStorage.setItem('test_item', JSON.stringify(obj))
        }
        setTestItem(true)
    }


    const handleFieldChange = (field: any, data: any, name: string, suite: any, rowkey: string) => {
        let test: any = window.sessionStorage.getItem('test_item')
        let arr = JSON.parse(test)
        let perf_data = arr.perf_data.map((item: any) => {
            let suite_list = item.suite_list.map((i: any) => {
                if (i.suite_id == suite.suite_id && i.rowKey == suite.rowKey) {
                    return produce(i, (draft: any) => {
                        draft[name] = field
                    })

                }
                return { ...i }
            })
            return {
                ...item,
                suite_list
            }
        })
        let obj = {
            perf_data,
            func_data: arr.func_data
        }
        window.sessionStorage.setItem('test_item', JSON.stringify(obj))
        setTestItem(true)
    }
    const handleArrow = (suite: any, i: any) => {
        setNum(i)
        setArrowStyle(suite.suite_id)
        let dataSource = props.perData
        let newArr: any = []
        let newData: any = []
        suite.conf_list.map((conf: any, index: number) => {
            let metric_list: any = []
            conf.metric_list.map((metric: any) => {
                let result = metric.compare_data[i]
                if (result?.compare_result == 'decline') {
                    metric.sortNum = 0
                } else if (result?.compare_result == 'increase') {
                    metric.sortNum = 1
                } else if (result?.compare_result == 'normal') {
                    metric.sortNum = 2
                } else if (result?.compare_result == 'invalid') {
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
        dataSource.list.map((item: any) => {
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
            list: newData
        }
        setPerData(obj)
    }
    let scrollLenght = 361 + 248 * groupData.length - 1
    // let suiteNum = 0
    //表格渲染
    let functionTables = perData.list?.map((suite: any, suiteIndex: number) => {
        if (suite.conf_list && suite.conf_list.length) {
            let tableLsit: any = []
            let column: any = [{
                title:
                    <div style={{ width: layoutWidth - 41 }}>
                        <div className="suite_name">
                            <span>{suite.suite_name}</span>
                            <span style={{ float: 'right', marginRight: 20 }}>
                                <Popconfirm
                                    title='确认要删除吗！'
                                    onConfirm={() => handleDelete('suite', suite, suiteIndex)}
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
                                switchReport &&
                                <>
                                    <div style={{ paddingTop: 20 }}></div>
                                    {describe.need_test_suite_description &&
                                        <div>
                                            <div>测试工具:</div>
                                            <div>{suite.tool || suite.test_suite_description}</div>
                                        </div>
                                    }
                                    {describe.need_test_env &&
                                        <SettingEdit
                                            name={suite.test_env || '-'}
                                            position="bottom"
                                            text="测试环境"
                                            btn={btn}
                                            onOk={(val: any) => handleFieldChange(val, perData, 'test_env', suite, suiteIndex + '')} />
                                    }
                                    {describe.need_test_description &&
                                        <SettingEdit
                                            name={suite.test_description || '-'}
                                            position="bottom"
                                            text="测试说明"
                                            btn={btn}
                                            onOk={(val: any) => handleFieldChange(val, perData, 'test_description', suite, suiteIndex + '')} />}
                                    {describe.need_test_conclusion &&
                                        <SettingEdit
                                            name={suite.test_conclusion || '-'}
                                            position="bottom"
                                            text="测试结论"
                                            btn={btn}
                                            onOk={(val: any) => handleFieldChange(val, perData, 'test_conclusion', suite, suiteIndex + '')} />}
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
                                <span className="conf_name_text">{row.conf_name}
                                    <span style={{ float: 'right' }}>
                                        <Popconfirm
                                            title='确认要删除吗！'
                                            onConfirm={() => handleDelete('conf', row, index,)}
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
                                row.metric_list?.map((metric: any, index: number) => (
                                    <div key={index}>
                                        <div className="metric_warp">
                                            <Tooltip placement="top" title={metric.metric}>
                                                <span className="metric_name">{metric.metric}{metric.unit && <span>({metric.unit})</span>}</span>
                                            </Tooltip>
                                            <span className="cv_name">({`${toPercentage(metric.cv_threshold)}/${toPercentage(metric.cmp_threshold)}`})</span>
                                        </div>
                                        <div style={{ height: 8 }}></div>
                                    </div>
                                ))
                            }
                        </div>
                    )
                }
            }]
            let metricList: any = []
            for (let i = 0; i < (groupData.length < 4 ? 4 : groupData.length); i++) {
                if (baseIndex === i)
                    metricList.push({
                        width: 248,
                        title: '',
                        render: (row: any, index: number) => {
                            let obj_id = (row?.conf_source || row).obj_id
                            return (
                                <div className="right_border">
                                    <div className="conf_name" >
                                        <a style={{ paddingLeft: 21 }}
                                            href={`/ws/${ws_id}/test_result/${obj_id}`}
                                            target="_blank">
                                            {obj_id ? <IconLink style={{ width: 12, height: 12 }} /> : <></>}
                                        </a>
                                    </div>
                                    {
                                        row.metric_list?.map((metric: any, index: number) => {
                                            if (JSON.stringify(metric) === '{}') {
                                                return <div key={index}>
                                                    <div className="metric_warp"><span className="job_base_cv">-</span></div>
                                                    <div style={{ height: 8 }}></div>
                                                </div>
                                            } else {
                                                return <div key={index}>
                                                    <div className="metric_warp">
                                                        <Tooltip placement="top" title={`${metric.test_value}±${metric.cv_value}`}>
                                                            <span className="job_base_cv">{`${metric.test_value}±${metric.cv_value}`}</span>
                                                        </Tooltip>
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
                                        <div style={{ cursor: 'pointer' }}>
                                            <span onClick={() => handleArrow(suite, i)}>
                                                {arrowStyle == suite.suite_id && num == i ? <IconArrowBlue /> : <IconArrow />}
                                                <span style={{ margin: '0 5px', color: arrowStyle == suite.suite_id && num == i ? '#1890FF' : 'rgba(0,0,0,0.9)' }}>差异化排序</span>
                                            </span>
                                            <Tooltip color="#fff" overlayStyle={{ minWidth: 350 }} title={<span style={{ color: 'rgba(0,0,0,0.65)' }}>性能测试与BaseGroup差值比例越大差异化越大。<br />规则如下：<br />下降&gt;上升&gt;波动不大&gt;无效</span>}><QuestionCircleOutlined /></Tooltip>
                                        </div>
                                    )
                                }
                            </div>,
                        width: 248,
                        render: (text: any, row: any, index: any) => {
                            let obj_id = (row.conf_compare_data || row.compare_conf_list)[i]?.obj_id
                            return (
                                <div className="right_border">
                                    { groupData.length - 1 > i &&
                                        <>
                                            <div className="conf_name">
                                                <a style={{ paddingLeft: 21 }} href={`/ws/${ws_id}/test_result/${obj_id}`} target="_blank">
                                                    {obj_id ? <IconLink style={{ width: 12, height: 12 }} /> : <></>}
                                                </a>
                                            </div>
                                        </>
                                    }
                                    {
                                        row.metric_list?.map((metric: any, c: number) => (
                                            metric.compare_data?.map((item: any, idx: any) => {
                                                if (JSON.stringify(item) === '{}') {
                                                    return idx === i && <div key={index}>
                                                        <div className="metric_warp">
                                                            <span className="job_cv">-</span>
                                                            <div className="job_common">
                                                                <span>-</span>
                                                                <span>-</span>
                                                            </div>
                                                        </div>
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
                                                                    <span className="prover_title">Max:</span> <span className="prover_content">{item.max_value}</span>
                                                                </div>
                                                                <div>
                                                                    <span className="prover_title">Min:</span> <span className="prover_content">{item.min_value}</span>
                                                                </div>
                                                                <div>
                                                                    <span className="prover_title">期望方向:</span> <span className="prover_content">{metric.direction}</span>
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
        // suiteNum =  1
    })
    const RenderChartItem: React.FC<any> = () => {
        return <div className="test_item" key={index} id={`perf_item-${index}`}>
            <Row>
                <Col span={18} className="item_style">
                    <span className="point"></span>
                    <EditSpan
                        btn={btn}
                        title={perData.name}
                        style={{ color: 'rgb(250,100,0)' }}
                        onOk={(val: any) => onChange(val, perData.name, index)}
                    />
                    <span style={{ float: 'right' }}>
                        <Popconfirm
                            title='确认要删除吗！'
                            onConfirm={() => onDelete(group, perData.name, index)}
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
                        筛选: <Select defaultValue="all" style={{ width: 200 }} value={filterName} onSelect={handleConditions}>
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
    }
    const RenderListItem: React.FC<any> = () => {
        return <div className="test_item" >
            <Row>
                <Col span={22} className="item_style">
                    <span className="point"></span>
                    <EditSpan
                        btn={btn}
                        title={perData.name}
                        style={{ color: 'rgb(250,100,0)' }}
                        onOk={(val: any) => onChange(val, perData.name, index)}
                    />
                    <span style={{ float: 'right' }}>
                        <Popconfirm
                            title='确认要删除吗！'
                            onConfirm={() => onDelete(group, perData.name, index)}
                            cancelText="取消"
                            okText="删除"
                        >
                            {btn && <MinusCircleOutlined
                                className="remove_active"
                            />}
                        </Popconfirm>
                    </span>
                </Col>
                <Col span={2}>
                    <Space style={{ float: 'right' }}>
                        <Button onClick={() => switchMode('list')}>列表模式</Button>
                    </Space>
                </Col>
            </Row>
        </div>
    }
    return (
        <>
            {
                modelVisible ?
                    <>
                        {  JSON.stringify(perData) !== '{}' &&
                            <>
                                <RenderChartItem />
                                <div className="table_margin">
                                    {/* { suiteNum == 1 
                                    ? <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                                    : functionTables
                                } */}
                                    {functionTables}
                                </div>
                            </>
                        }
                    </>
                    :
                    <>
                        <RenderListItem />
                        <div style={{ padding: '0 20px' }}>
                            {
                                perData.list?.map((item: any, index: number) => (
                                    <ChartsIndex {...item} identify={identify} index={index} />
                                ))
                            }
                        </div>
                    </>
            }
        </>
    )
}
export default memo(PerformanceTable);