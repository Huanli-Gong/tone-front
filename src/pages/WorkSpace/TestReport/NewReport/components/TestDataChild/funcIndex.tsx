import React, { useContext, useEffect, useState, memo, useMemo } from 'react';
import { ReportContext } from '../../Provider';
import { Button, Space, Select, Typography, Popconfirm, Empty, Row, Col } from 'antd';
import { ReactComponent as DelDefault } from '@/assets/svg/Report/delDefault.svg';
import { ReactComponent as DelHover } from '@/assets/svg/Report/delHover.svg';
import { ReactComponent as IconLink } from '@/assets/svg/Report/IconLink.svg';
import { ReactComponent as IconArrow } from '@/assets/svg/icon_arrow.svg';
import { ReactComponent as IconArrowBlue } from '@/assets/svg/icon_arrow_blue.svg';
import { SettingTextArea } from '../EditPublic';
import { ReactComponent as TestItemIcon } from '@/assets/svg/Report/TestItem.svg';
import { toShowNum, handleCaseColor } from '@/components/AnalysisMethods/index';
import EllipsisPulic from '@/components/Public/EllipsisPulic';
import { DiffTootip } from '@/pages/WorkSpace/TestAnalysis/AnalysisResult/components/DiffTootip';
import { deleteSuite, deleteConf } from './methodPulic.js';
import {
    TestItemText,
    TestSuite,
    TestGroupItem,
    TestItemFunc,
    SuiteName,
    TestConf,
    ConfTitle,
    ConfData,
    TestConfWarpper,
    TestCase,
    CaseTitle,
    TestItem,
    TestSubCase,
    SubCaseTitle,
    CaseText,
    SubCaseText,
    ExpandIcon,
    CloseBtn,
    PrefDataDel,
} from '../../ReportUI';
// import produce from 'immer';
import _ from 'lodash';
const { Option } = Select;

const FuncDataIndex: React.FC<any> = (props) => {
    const { child, name, id, subObj, onChange, onDelete, dataSource, setDataSource } = props
    const ws_id = location.pathname.replace(/\/ws\/([a-zA-Z0-9]{8})\/.*/, '$1')
    const { btnState, btnConfirm, allGroupData, baselineGroupIndex, } = useContext(ReportContext)
    const [expandKeys, setExpandKeys] = useState<any>([])
    const [filterName, setFilterName] = useState('All')
    const [arrowStyle, setArrowStyle] = useState('')
    const [btnName, setBtnName] = useState<string>('')
    const [num, setNum] = useState(0)
    const [btn, setBtn] = useState<boolean>(false)
    const [funcData, setFuncData] = useState<any>({})
    let group = allGroupData?.length

    useEffect(() => {
        setFuncData(child)
    }, [child])

    const baseIndex = useMemo(()=>{
        if(baselineGroupIndex === -1) return 0
        return baselineGroupIndex
    },[ baselineGroupIndex ])

    // 筛选操作
    const handleConditions = (value: any) => {
        setFilterName(value)
        let data = child
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
    const OpenSubCase = () => {
        setBtn(!btn)
    }
    const handleArrow = (conf: any, i: any) => {
        setNum(i)
        setArrowStyle(conf.suite_id)
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

        let list = child.list.map((item: any) => {
            if (item.suite_id === conf.suite_id)
                return {
                    ...item,
                    conf_list
                }
            return item
        })
        let obj = {
            ...child,
            list,
        }
        setFuncData(obj)
    }
    useEffect(() => {
        setBtnName(btn ? '收起所有' : '展开所有')
        setExpandKeys([])
        setExpandKeys(
            btn ?
                subObj?.reduce(
                    (p: any, c: any) => p.concat(c.conf_list.map((item: any) => item.conf_id))
                    , [])
                :
                []
        )
    }, [btn])
    // const deleteSuite = (item:any, row:any) => {
    //     let ret = item.list.reduce((pre: any, suite: any) => {
    //          if (suite.suite_id == row.suite_id) return pre
    //          return pre.concat(suite)
    //      }, [])
    //      return {
    //          ...item,
    //          list:ret,
    //      }
    // }
    // const deleteConf = (item:any, row:any) => {
    //     return produce(item, (draft: any) => {
    //         draft.list = item.list.map(
    //             (suite: any) => {
    //                 let conf_list = suite.conf_list.reduce(
    //                     (pre: any, conf: any) => {
    //                         if (conf.conf_id == row.conf_id) return pre
    //                         return pre.concat(conf)
    //                     },
    //                     []
    //                 )
    //                 return {
    //                     ...suite,
    //                     conf_list
    //                 }
    //             })
    //     })
    // }
    const handleDelete = (name: string, row: any, rowKey: any) => {
        if (name == 'suite') {
            setDataSource(dataSource.map((item: any) => {
                if (item.is_group) {
                    let list = item.list.map((l: any) => deleteSuite(l, row))
                    return {
                        ...item,
                        list,
                    }
                } else {
                    return deleteSuite(item, row)
                }
            }))
        } else {
            setDataSource(dataSource.map((item: any) => {
                if (item.is_group) {
                    let list = item.list.map((l: any) => deleteConf(l, row))
                    return {
                        ...item,
                        list,
                    }
                } else {
                    return deleteConf(item, row)
                }
            }))
        }
    }
    // 右侧功能按钮
    const ItemFunc: React.FC<any> = () => {
        return (
            <TestItemFunc>
                <Space>
                    <Button onClick={OpenSubCase}>{btnName}</Button>
                    <Space>
                        <Typography.Text>筛选: </Typography.Text>
                        <Select defaultValue="All" style={{ width: 200 }} value={filterName} onSelect={handleConditions}>
                            <Option value="All">全部</Option>
                            <Option value="Pass">成功</Option>
                            <Option value="Fail">失败</Option>
                            <Option value="Skip">跳过</Option>
                        </Select>
                    </Space>
                </Space>
            </TestItemFunc>
        )
    }
    const DelBtn: React.FC<any> = (props: any) => {
        const { conf, cid } = props;
        return (
            <Popconfirm
                title='确认要删除吗!'
                onConfirm={() => handleDelete('conf', conf, cid)}
                cancelText="取消"
                okText="删除"
            >
                {
                    btnState && <PrefDataDel empty={false}>
                        <DelDefault className="remove" />
                        <DelHover className="remove_active" />
                    </PrefDataDel>
                }
            </Popconfirm>
        )
    }
    const DelBtnEmpty: React.FC<any> = (props: any) => {
        return btnState && <PrefDataDel empty={true} />
    }

    const hanldeExpand = (id: any) => {
        const expand = expandKeys.includes(id)
        if (expand)
            setExpandKeys(expandKeys.filter((i: any) => i !== id))
        else
            setExpandKeys(expandKeys.concat(id))
    }

    // 单个展开
    const ExpandSubcases = (props: any) => {
        const { sub_case_list, conf_id } = props
        const expand = expandKeys.includes(conf_id)
        let subCaseList = _.cloneDeep(sub_case_list)
        return (
            <>
                {
                    expand && subCaseList?.map((item: any, idx: number) => {
                        item.compare_data.splice(baseIndex, 0, item.result)
                        const len = Array.from(Array(allGroupData.length - item.compare_data.length)).map(val => ({}))
                        len.forEach((i) => item.compare_data.push('-'))
                        return (
                            <TestSubCase key={idx}>
                                <DelBtnEmpty />
                                <SubCaseTitle gLen={group}>
                                    <Typography.Text><EllipsisPulic title={item.sub_case_name} /></Typography.Text>
                                </SubCaseTitle>
                                {
                                    item.compare_data.length > 0 ?
                                        item.compare_data.map((cur: any) => {
                                            return (
                                                <SubCaseText gLen={group} btnState={btnState}>
                                                    <Typography.Text style={{ color: handleCaseColor(cur) }}>{cur || '-'}</Typography.Text>
                                                </SubCaseText>
                                            )
                                        })
                                        :
                                        <SubCaseText gLen={group} btnState={btnState}>
                                            <Typography.Text style={{ color: handleCaseColor(item.result) }}>{item.result || '-'}</Typography.Text>
                                        </SubCaseText>

                                }
                            </TestSubCase>
                        )
                    })
                }
            </>
        )
    }
    let functionTable = Array.isArray(funcData.list) && funcData.list.length > 0 ?
        funcData.list.map((suite: any, id: number) => (
            <TestSuite key={id}>
                <SuiteName>
                    {suite.suite_name}
                    <Popconfirm
                        title='确认要删除吗！'
                        onConfirm={() => handleDelete('suite', suite, id)}
                        cancelText="取消"
                        okText="删除"
                    >
                        {btnState && <CloseBtn />}
                    </Popconfirm>
                </SuiteName>
                <TestConf>
                    <ConfTitle gLen={group} style={{ marginLeft: btnState ? 39 : 0 }}>Conf</ConfTitle>
                    {
                        allGroupData?.map((cont: any, i: number) => (
                            <ConfData gLen={group} btnState={btnState} key={i}>
                                <Row>
                                    <Col span={12}>
                                        总计/通过/失败
                                    </Col>
                                    {
                                        i !== baseIndex && <Col span={12} style={{ textAlign: 'right', paddingRight: 10 }}>
                                            对比结果
                                            <span onClick={() => handleArrow(suite, i)} style={{ margin: '0 5px 0 3px', verticalAlign: 'middle' }}>
                                                {arrowStyle == suite.suite_id && num == i ? <IconArrowBlue /> : <IconArrow />}
                                            </span>
                                            <DiffTootip />
                                        </Col>
                                    }
                                </Row>
                            </ConfData>
                        ))
                    }
                </TestConf>
                <TestConfWarpper>
                    {
                        suite.conf_list.map((conf: any, cid: number) => {
                            const expand = expandKeys.includes(conf.conf_id)
                            const { all_case, success_case, fail_case, obj_id } = conf.conf_source || conf
                            let conf_data = conf.conf_compare_data || conf.compare_conf_list
                            let metricList: any = []
                            for (let i = 0; i < allGroupData.length; i++) {
                                if (i === baseIndex)
                                    metricList.push({
                                        all_case,
                                        success_case,
                                        fail_case,
                                        obj_id,
                                    })
                                conf_data.length > 0 ?
                                    conf_data?.map((item: any, idx: number) => {
                                        if (item !== null) {
                                            const { all_case, success_case, fail_case, obj_id } = item || item.conf_source
                                            idx === i && metricList.push({
                                                all_case,
                                                success_case,
                                                fail_case,
                                                obj_id
                                            })
                                        } else {
                                            idx === i && metricList.push({
                                                all_case: '-',
                                                success_case: '-',
                                                fail_case: '-'
                                            })
                                        }
                                    })
                                    :
                                    (allGroupData.length > 1) && (i - 1) && metricList.push({
                                        all_case: '-',
                                        success_case: '-',
                                        fail_case: '-'
                                    })

                            }
                            return (
                                <>
                                    <TestCase expand={expand}>
                                        <DelBtn conf={conf} cid={cid} />
                                        <CaseTitle gLen={group}>
                                            <EllipsisPulic title={conf.conf_name}>
                                                <ExpandIcon
                                                    rotate={expand ? 90 : 0}
                                                    onClick={() => hanldeExpand(conf.conf_id)}
                                                />
                                                <Typography.Text>{conf.conf_name}</Typography.Text>
                                            </EllipsisPulic>
                                        </CaseTitle>
                                        {
                                            metricList?.map((item: any) => {
                                                return (
                                                    <CaseText gLen={group} btnState={btnState}>
                                                        <Space size={16}>
                                                            <Typography.Text style={{ color: '#649FF6' }}>{toShowNum(item.all_case)}</Typography.Text>
                                                            <Typography.Text style={{ color: '#81BF84' }}>{toShowNum(item.success_case)}</Typography.Text>
                                                            <Typography.Text style={{ color: '#C84C5A' }}>{toShowNum(item.fail_case)}</Typography.Text>
                                                        </Space>
                                                        {item !== null &&
                                                            <a style={{ cursor: 'pointer', paddingLeft: 10 }} href={`/ws/${ws_id}/test_result/${item.obj_id}`} target="_blank">
                                                                {item.obj_id ? <IconLink style={{ width: 9, height: 9 }} /> : <></>}
                                                            </a>
                                                        }
                                                    </CaseText>
                                                )
                                            })
                                        }
                                    </TestCase>
                                    <ExpandSubcases
                                        {...conf}
                                        btn={btnState}
                                    />
                                </>
                            )
                        })
                    }
                </TestConfWarpper>
            </TestSuite>
        )) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
    // suite遍历

    return (
        name === 'group' ?
            <div key={id}>
                <TestGroupItem >
                    <TestItemIcon style={{ marginLeft: 12, verticalAlign: 'middle' }} />
                    <TestItemText>
                        <SettingTextArea
                            name={funcData.name}
                            isInput={true}
                            fontStyle={{
                                fontSize: 14,
                                fontFamily: 'PingFangSC-Medium',
                                color: 'rgba(0,0,0,0.85)'
                            }}
                            btn={btnState}
                            btnConfirm={btnConfirm}
                            onOk={(val: any) => onChange(val, funcData.name, id)}
                        />
                    </TestItemText>
                    {
                        btnState &&
                        <Popconfirm
                            title='确认要删除吗！'
                            onConfirm={() => onDelete(name, funcData.name, funcData.rowKey)}
                            cancelText="取消"
                            okText="删除"
                        >
                            <CloseBtn />
                        </Popconfirm>
                    }
                    {!btnState && <ItemFunc />}
                </TestGroupItem>
                {functionTable}
                {/* {
                    funcData?.list?.map((suite: any, idx: number) => (
                        <RenderSuite suite={suite} id={idx} />
                    ))
                } */}
            </div>
            :
            <div key={id}>
                <TestItem >
                    <TestItemIcon style={{ marginLeft: 12, verticalAlign: 'middle' }} />
                    <TestItemText>
                        <SettingTextArea
                            name={funcData.name}
                            isInput={true}
                            fontStyle={{
                                fontSize: 14,
                                fontFamily: 'PingFangSC-Medium',
                                color: 'rgba(0,0,0,0.85)'
                            }}
                            btn={btnState}
                            btnConfirm={btnConfirm}
                            onOk={(val: any) => onChange(val, funcData.name, id)}
                        />
                    </TestItemText>
                    {
                        btnState &&
                        <Popconfirm
                            title='确认要删除吗！'
                            onConfirm={() => onDelete(name, funcData.name, funcData.rowKey)}
                            cancelText="取消"
                            okText="删除"
                        >
                            <CloseBtn />
                        </Popconfirm>
                    }
                    {!btnState && <ItemFunc />}
                </TestItem>
                {functionTable}
                {/* {
                    funcData?.list?.map((suite: any, idx: number) => (
                        <RenderSuite suite={suite} id={idx} />
                    ))
                } */}
            </div>
    )
}
export default memo(FuncDataIndex);