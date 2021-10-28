import React, { useEffect, useState } from 'react';
import { Row, Col, Select, Space, Button, Table, Tooltip, Popover } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons'
import { ReactComponent as IconArrow } from '@/assets/svg/icon_arrow.svg'
import { ReactComponent as IconArrowBlue } from '@/assets/svg/icon_arrow_blue.svg'
import { ReactComponent as IconLink } from '@/assets/svg/icon_openlink.svg';
import styles from './index.less';
import ChartsIndex from './ChartIndex';
import { handleColor, handleIcon } from './common.js'
import _ from 'lodash'
const { Option } = Select

const PerformanceTest = (props: any) => {
    const ws_id = location.pathname.replace(/\/ws\/([a-zA-Z0-9]{8})\/.*/, '$1')
    const [modelVisible, setModelVisible] = useState(true)
    const [arrowStyle, setArrowStyle] = useState('')
    const [num, setNum] = useState(0)
    const [dataSource, setDataSource] = useState(props.data.perf_data_result)
    //const data = props.data.perf_data_result === null ? [] : props.data
    const { baseIndex, groupData, changeScroll } = props
    // 筛选过滤
    const handleConditions = (value: any) => {
        let dataSource = props.data.perf_data_result
        let newData: any = []
        dataSource.map((item: any) => {
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
            setDataSource(dataSource)
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
            setDataSource(dataSource.map((item: any) => {
                let conf_list = item.conf_list.filter((conf: any) => newData.includes(conf.conf_id));
                return {
                    ...item,
                    conf_list
                }
            }))
        } else {
            setDataSource(dataSource.map((item: any) => {
                let conf_list = item.conf_list.filter((conf: any) => newData.includes(conf.conf_id));
                return {
                    ...item,
                    conf_list
                }
            }))
        }
    }
    // 图表列表模式切换
    const switchMode = async (name: string) => {
        if (name === 'list') {
            setModelVisible(true)
        }
        else {
            setModelVisible(false)
        }
    }
    // const changeMetric = (suite:any) => {

    // }

    const handleArrow = (suite: any, i: any) => {
        setNum(i)
        setArrowStyle(suite.suite_id)
        let newArr: any = []
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
                // if (result.compare_result == 'decline' ) {
                //     conf.sortNum = 0
                // }else if (result.compare_result == 'increase' || result.compare_value == 0) {
                //     conf.sortNum = 1
                // }else if (result.compare_value == 0) {
                //     conf.sortNum = 2
                // }else{
                //     conf.sortNum = 3
                // }
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

        setDataSource(
            dataSource.map((item: any) => {
                if (item.suite_id === suite.suite_id) {
                    return {
                        ...item,
                        conf_list: endList
                    }
                } else {
                    return item
                }
            })
        )
    }
    const toPercentage = (point: any) => {
        var str = Number(point * 100).toFixed(1);
        str += "%";
        return str;
    }
    // 绘制table表格
    let scrollLenght: number = 0
    let functionTables = dataSource?.map((suite: any, suiteIndex: number) => {
        if (suite.conf_list && suite.conf_list.length) {
            let tableLsit: any = []
            let column: any = [{
                title: suite.suite_name,
                width: 361,
                key: 'metric',
                fixed: 'left',
                render(row: any) {
                    return (
                        <div className={styles.right_border}>
                            <div className={styles.conf_name}><span className={styles.conf_name_text}>{row.conf_name}</span></div>
                            {
                                row.metric_list?.map((metric: any, index: number) => (
                                    <div key={index}>
                                        <div className={styles.metric_warp}>
                                            <Tooltip placement="top" title={metric.metric}>
                                                <span className={styles.metric_name}>{metric.metric}{metric.unit && <span>({metric.unit})</span>}</span>
                                            </Tooltip>
                                            <span className={styles.cv_name}>({`${toPercentage(metric.cv_threshold)}/${toPercentage(metric.cmp_threshold)}`})</span>
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
                        render: (row: any) => (
                            <div className={styles.right_border}>
                                <div className={styles.conf_name} >
                                    <a style={{ paddingLeft: 16 }}
                                        href={`/ws/${ws_id}/test_result/${row.obj_id}`}
                                        target="_blank">
                                        {row.obj_id ? <IconLink style={{ width: 12, height: 12 }} /> : <></>}
                                    </a>
                                </div>
                                {
                                    row.metric_list?.map((metric: any, index: number) => {
                                        return (
                                            <div key={index}>
                                                {
                                                    JSON.stringify(metric) === '{}' ?
                                                        <>
                                                            <div className={styles.metric_warp}><span className={styles.job_cv}>-</span></div>
                                                            <div style={{ height: 8 }}></div>
                                                        </> :
                                                        <>
                                                            <div className={styles.metric_warp}>
                                                                <span className={styles.job_cv}>{`${metric.test_value}±${metric.cv_value}`}</span>
                                                            </div>
                                                            <div style={{ height: 8 }}></div>
                                                        </>
                                                }
                                            </div>
                                        )
                                    })
                                }
                            </div>
                        )
                    })
                metricList.push(
                    {
                        title: (
                            groupData.length - 1 > i &&
                            <div style={{ cursor: 'pointer' }} >
                                <span onClick={() => handleArrow(suite, i)}>
                                    {arrowStyle == suite.suite_id && num == i ? <IconArrowBlue /> : <IconArrow />}
                                    <span style={{ margin: '0 5px', color: arrowStyle == suite.suite_id && num == i ? '#1890FF' : 'rgba(0,0,0,0.9)' }} >差异化排序</span>
                                </span>
                                <Tooltip color="#fff"
                                    overlayStyle={{ minWidth: 350 }}
                                    title={<span style={{ color: 'rgba(0,0,0,0.65)' }}>性能测试与BaseGroup差值比例越大差异化越大。<br />规则如下：<br />下降&gt;上升&gt;波动不大&gt;无效</span>}>
                                    <QuestionCircleOutlined />
                                </Tooltip>
                            </div>
                        ),
                        width: 248,
                        render: (row: any, record: any, index: number) => {
                            return (
                                <div className={styles.right_border}>
                                    { groupData.length - 1 > i &&
                                        <>
                                            <div className={styles.conf_name} >
                                                <a style={{ paddingLeft: 16 }} href={`/ws/${ws_id}/test_result/${row.conf_compare_data[i]?.obj_id}`} target="_blank">
                                                    { row.conf_compare_data[i]?.obj_id ? <IconLink style={{ width: 12, height: 12 }} /> : <></> }
                                                </a>
                                            </div>
                                        </>
                                    }
                                    {
                                        row.metric_list?.map((metric: any, c: number) => (
                                            metric.compare_data?.map((item: any, idx: any) => {
                                                if (JSON.stringify(item) === '{}') {
                                                    return idx === i && <div key={index}>
                                                        <div className={styles.metric_warp}>
                                                            <span className={styles.job_cv}>-</span>
                                                            <div className={styles.job_common}>
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
                                                            <div className={styles.metric_warp}>
                                                                <span className={styles.job_cv}>{`${item.test_value}±${item.cv_value}` || '-'} </span>
                                                                <div className={styles.job_common}>
                                                                    <span className={styles[handleColor(item.compare_result)]}>{item.compare_value || '-'}</span>
                                                                    <span className={styles[handleColor(item.compare_result)]}>{handleIcon(item.compare_result) || '-'}</span>
                                                                </div>
                                                            </div>
                                                            <div style={{ height: 8 }}></div>
                                                        </div>
                                                    )
                                                    return <Popover
                                                        content={
                                                            <div style={{ width: 200 }} key={idx}>
                                                                <div>
                                                                    <span className={styles.prover_title}>Max:</span> <span className={styles.prover_content}>{item.max_value}</span>
                                                                </div>
                                                                <div>
                                                                    <span className={styles.prover_title}>Min:</span> <span className={styles.prover_content}>{item.min_value}</span>
                                                                </div>
                                                                <div>
                                                                    <span className={styles.prover_title}>期望方向:</span> <span className={styles.prover_content}>{metric.direction}</span>
                                                                </div>
                                                                <div style={{ marginTop: 15 }}>
                                                                    <span className={styles.prover_title}>Test Record</span>
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
                        }
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
                    rowKey="conf_id"
                />
            )
            return tableLsit
        }
    })
    return (
        <>
            {
                dataSource && dataSource.length && <div className={styles.data_warp} >

                    {
                        modelVisible ?
                            <div>
                                <Row style={{ padding: '14px 0' }}>
                                    <Col span={4}>
                                        性能测试
                                </Col>
                                    <Col span={20}>
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
                                <div className="table_boxshaw">
                                    {functionTables}
                                </div>
                            </div>
                            :
                            <div>
                                <Row style={{ padding: '14px 0' }}>
                                    <Col span={4}>
                                        性能对比分析图 (Test Suite Num:{dataSource.length})
                            </Col>
                                    <Col span={20}>
                                        <Space style={{ float: 'right' }}>
                                            <Button onClick={() => switchMode('list')}>列表模式</Button>
                                        </Space>
                                    </Col>
                                </Row>
                                <div>
                                    {
                                        dataSource?.map((item: any, index: number) => (
                                            <ChartsIndex {...item} compareData={props.compareData} identify={props.identify} index={index} />
                                        ))
                                    }
                                </div>
                            </div>
                    }
                </div>
            }
        </>
    )
}
export default PerformanceTest;


// const handleArrow = (suite: any, i: any) => {
//     console.log('iii',i)
//     setBright(true)
//     //const metric_res = changeMetric(suite)
//     const list = suite.conf_list.map((conf: any, index: number) => {
//         let metric_list: any = []
//         let newConf: any = []
//         for (let x = 0; x < 5; x++) newConf.push([])
//         conf.metric_list.forEach((metric: any) => {
//             let result = metric.compare_data[i]
//             if (result.compare_result === 'decline') {
//                 //result.sortNum = 0
//             }else if (result.compare_result === 'increase') {
//                 //result.sortNum = 1
//             }else if (result.compare_result === 'normal') {
//                // result.sortNum = 2
//             }else if (result.compare_result === 'invalid') {
//                // result.sortNum = 3
//             }else{
//                 //result.sortNum = 4
//             }
//             newConf.push(metric)
//         })
//         metric_list = newConf.reduce((pre: any, cur: any) => pre.concat(cur), [])
//         return {
//             ...conf,
//             metric_list
//         }
//     })
//     console.log('list',list)

//     const sortMetric = (metric_list: any) => Number(metric_list.sort((a: any, b: any) => {
//         return Number(a.compare_data[i].compare_value?.replace("%", "")) - Number(b.compare_data[i].compare_value?.replace("%", "")) 
//     })[0].compare_data[i].compare_value?.replace("%", ""))

//     const newList = list.sort((a: any, b: any) => {
//         return sortMetric(a.metric_list) - sortMetric(b.metric_list)
//     })
//     console.log('newList',newList)
//     const compare = (metric_list:any) => metric_list.sort((a:any,b:any) => {
//         return (a.compare_data[i].sortNum) - (b.compare_data[i].sortNum)
//     })[0].compare_data[i].sortNum

//     const endList = newList.sort((a: any, b: any) => {
//         return compare(a.metric_list) - compare(b.metric_list)
//     })

//     console.log('end',endList)
//     setDataSource(
//         dataSource.map((item: any) => {
//             if (item.suite_id === suite.suite_id) {
//                 return {
//                     ...item,
//                     conf_list:endList
//                 }
//             } else {
//                 return item
//             }
//         })
//     )
// }


                                                            // if (screen === 'all') {
                                                            //     return popoverCommon
                                                            // } else if (screen === 'volatility' && (item.compare_result.indexOf("increase") != -1 || item.compare_result.indexOf("decline") != -1)) {
                                                            //     return popoverCommon
                                                            // } else if (screen === item.compare_result) {
                                                            //     return popoverCommon
                                                            // }else{
                                                            //     return idx === i && <div key={index}>
                                                            //     <div className={styles.metric_warp}><span className={styles.job_cv}>-</span></div>
                                                            //         <div style={{ height: 8 }}></div>
                                                            //     </div>
                                                            // }