import React, { useContext, useEffect, useState, memo, useMemo } from 'react';
import { ReportContext } from '../../Provider';
import { Button, Space, Select, Typography, Popconfirm, Empty, Row, Col } from 'antd';
import { ReactComponent as DelDefault } from '@/assets/svg/Report/delDefault.svg';
import { ReactComponent as DelHover } from '@/assets/svg/Report/delHover.svg';
import { ReactComponent as IconArrow } from '@/assets/svg/icon_arrow.svg';
import { ReactComponent as IconArrowBlue } from '@/assets/svg/icon_arrow_blue.svg';
import { ReactComponent as TestItemIcon } from '@/assets/svg/Report/TestItem.svg';
import { toShowNum, handleCaseColor } from '@/components/AnalysisMethods/index';
import { GroupItemText } from '../EditPerfText';
import EllipsisPulic from '@/components/Public/EllipsisPulic';
import { DiffTootip } from '@/pages/WorkSpace/TestAnalysis/AnalysisResult/components/DiffTootip';
import { deleteSuite, deleteConf } from './DelMethod.js';
import { JumpResult } from '@/utils/hooks';
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
    TestSubCase,
    SubCaseTitle,
    CaseText,
    SubCaseText,
    ExpandIcon,
    CloseBtn,
    PrefDataDel,
} from '../../ReportUI';
import _ from 'lodash';
const { Option } = Select;

const FuncDataIndex: React.FC<any> = (props) => {
    const { child, name, id, onDelete, dataSource, setDataSource } = props
    const { btnState, allGroupData, baselineGroupIndex, groupLen, wsId, isOldReport } = useContext(ReportContext)
    const [expandKeys, setExpandKeys] = useState<any>([])
    const [filterName, setFilterName] = useState('All')
    const [arrowStyle, setArrowStyle] = useState('')
    const [btnName, setBtnName] = useState<string>('')
    const [num, setNum] = useState(0)
    const [btn, setBtn] = useState<boolean>(false)
    const [funcData, setFuncData] = useState<any>({})

    useEffect(() => {
        setFuncData(child)
    }, [child])

    const baseIndex = useMemo(() => {
        if (baselineGroupIndex === -1) return 0
        return baselineGroupIndex
    }, [baselineGroupIndex])

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
        let ExpandObj:any = []
        dataSource?.map((item: any) => {
            if (item.is_group) {
                item.list.map((child: any) => {
                    ExpandObj.push(child.list)
                })
            } else {
                ExpandObj.push(item.list)
            }
        })
        setExpandKeys(
            btn ?
                ExpandObj?.reduce(
                    (p: any, c: any) => p.concat(c.conf_list.map((item: any) => item.conf_id))
                    , [])
                :
                []
        )
    }, [btn,dataSource])

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
                            <Option value="Warn">警告</Option>
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
        let subCaseList =  _.cloneDeep(sub_case_list) 
        return (
            <>
                {
                    expand && subCaseList?.map((item: any, idx: number) => {
                        if(isOldReport){
                            item.compare_data.splice(baseIndex, 0, item.result)
                        }
                        return (
                            <TestSubCase key={idx}>
                                <DelBtnEmpty />
                                <SubCaseTitle gLen={groupLen}>
                                    <Typography.Text><EllipsisPulic title={item.sub_case_name} /></Typography.Text>
                                </SubCaseTitle>
                                {
                                        !!item.compare_data.length ?
                                            item.compare_data.map((cur: any, idx: number) => {
                                                return (
                                                    <SubCaseText gLen={groupLen} btnState={btnState} key={idx}>
                                                        <Typography.Text style={{ color: handleCaseColor(cur) }}>{cur || '-'}</Typography.Text>
                                                    </SubCaseText>
                                                )
                                            })
                                            :
                                            <SubCaseText gLen={groupLen} btnState={btnState}>
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
    
    let functionTable = Array.isArray(funcData.list) && !!funcData.list.length ?
        funcData.list.map((suite: any, idx: number) => (
            <TestSuite key={idx}>
                <SuiteName>
                    {suite.suite_name}
                    <Popconfirm
                        title='确认要删除吗！'
                        onConfirm={() => handleDelete('suite', suite, idx)}
                        cancelText="取消"
                        okText="删除"
                    >
                        {btnState && <CloseBtn />}
                    </Popconfirm>
                </SuiteName>
                <TestConf>
                    <ConfTitle gLen={groupLen} style={{ marginLeft: btnState ? 39 : 0 }}>Conf</ConfTitle>
                    {
                        allGroupData?.map((cont: any, i: number) => (
                            <ConfData gLen={groupLen} btnState={btnState} key={i}>
                                <Row>
                                    <Col span={12}>
                                        总计/通过/失败
                                    </Col>
                                    {
                                        i !== baseIndex && <Col span={12} style={{ textAlign: 'right', paddingRight: 10 }}>
                                            对比结果
                                            <span onClick={() => handleArrow(suite, i)} style={{ margin: '0 5px 0 3px', verticalAlign: 'middle', cursor: 'pointer' }}>
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
                            let metricList: any = []
                            if(isOldReport){
                                const { all_case, success_case, fail_case, obj_id } = conf.conf_source || conf
                                let conf_data = conf.conf_compare_data || conf.compare_conf_list
                                for (let i = 0; i < allGroupData.length; i++) {
                                    if (i === baseIndex)
                                        metricList.push({
                                            all_case,
                                            success_case,
                                            fail_case,
                                            obj_id,
                                        })
                                    !!conf_data.length ?
                                        conf_data.map((item: any, idx: number) => {
                                            if (item) {
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
                            }
                            let dataList = isOldReport ? metricList : (conf.conf_compare_data || conf.compare_conf_list)
                            return (
                                <div key={cid}>
                                    <TestCase expand={expand}>
                                        <DelBtn conf={conf} cid={cid} />
                                        <CaseTitle gLen={groupLen}>
                                            <EllipsisPulic title={conf.conf_name}>
                                                <ExpandIcon
                                                    rotate={expand ? 90 : 0}
                                                    onClick={() => hanldeExpand(conf.conf_id)}
                                                />
                                                <Typography.Text>{conf.conf_name}</Typography.Text>
                                            </EllipsisPulic>
                                        </CaseTitle>
                                        {
                                            dataList?.map((item: any, idx: number) => {
                                                return (
                                                    <CaseText gLen={groupLen} btnState={btnState} key={idx}>
                                                        <Space size={16}>
                                                            <Typography.Text style={{ color: '#649FF6' }}>{toShowNum(item.all_case)}</Typography.Text>
                                                            <Typography.Text style={{ color: '#81BF84' }}>{toShowNum(item.success_case)}</Typography.Text>
                                                            <Typography.Text style={{ color: '#C84C5A' }}>{toShowNum(item.fail_case)}</Typography.Text>
                                                        </Space>
                                                        {item &&
                                                            <JumpResult ws_id={wsId} job_id={item.obj_id} style={{ paddingLeft: 10 }}/>
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
                                </div>
                            )
                        })
                    }
                </TestConfWarpper>
            </TestSuite>
        )) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
    // suite遍历

    return (
        <>
            <TestGroupItem id={`func_item-${id}`} className="tree_mark" isGroup={name === 'group'}>
                <TestItemIcon style={{ marginLeft: 12, verticalAlign: 'middle' }} />
                <TestItemText>
                    <GroupItemText
                        name={funcData.name}
                        rowKey={funcData.rowKey}
                        btn={btnState}
                        dataSource={dataSource}
                        setDataSource={setDataSource}
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
        </>
    )
}
export default memo(FuncDataIndex);