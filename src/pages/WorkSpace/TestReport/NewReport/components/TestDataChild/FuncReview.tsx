/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable react/no-array-index-key */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable prefer-const */
import React, { useContext, useEffect, useState, memo, useMemo } from 'react';
import { ReportContext } from '../../Provider';
import { Button, Space, Select, Typography, Popconfirm, Empty, Row, Col, Pagination } from 'antd';
import { useIntl, FormattedMessage, useLocation } from 'umi';
import { ReactComponent as DelDefault } from '@/assets/svg/Report/delDefault.svg';
import { ReactComponent as DelHover } from '@/assets/svg/Report/delHover.svg';
// import { ReactComponent as IconLink } from '@/assets/svg/Report/IconLink.svg';
import { ReactComponent as IconArrow } from '@/assets/svg/icon_arrow.svg';
import { ReactComponent as IconArrowBlue } from '@/assets/svg/icon_arrow_blue.svg';
import { ReactComponent as TestItemIcon } from '@/assets/svg/Report/TestItem.svg';
import { toShowNum, handleCaseColor } from '@/components/AnalysisMethods/index';
import { GroupItemText, PerfTextArea } from '../EditPerfText';
import EllipsisPulic from '@/components/Public/EllipsisPulic';
import { DiffTootip } from '@/pages/WorkSpace/TestAnalysis/AnalysisResult/components/DiffTootip';
import { reportDelete } from '../ReportFunction';
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

    Configuration,
    SigleWrapper,
    TestTitle,
    TestContent,
} from '../../ReportUI';
import _ from 'lodash';
import { getCompareType } from '@/utils/utils';
const { Option } = Select;


const DelBtnEmpty: React.FC<any> = ({ btnState }) => {
    return btnState && <PrefDataDel empty={true} />
}

// 单个展开
const ExpandSubcases: React.FC<any> = (props) => {
    const { sub_case_list, conf_id, expandKeys, isOldReport, baseIndex, groupLen, btnState } = props
    const expand = expandKeys.includes(conf_id)
    const [page, setPage] = React.useState({ size: 100, num: 1 })
    const total = (sub_case_list || []).length

    React.useEffect(() => {
        return () => {
            setPage({ size: 100, num: 1 })
        }
    }, [expand])

    const { size, num } = page
    const currentPage = num - 1
    const result = sub_case_list.slice(currentPage * size, currentPage * size + size)

    if (!expand)
        return <></>

    return (
        <>
            {
                result?.map((item: any) => {
                    if (isOldReport) {
                        item.compare_data.splice(baseIndex, 0, item.result)
                    }
                    return (
                        <TestSubCase key={item?.sub_case_name} >
                            <DelBtnEmpty btnState={btnState} />
                            <SubCaseTitle gLen={groupLen}>
                                <Typography.Text><EllipsisPulic title={item.sub_case_name} /></Typography.Text>
                            </SubCaseTitle>
                            {
                                !!item.compare_data.length ?
                                    item.compare_data?.slice(0, groupLen).map((cur: any, idx: number) => {
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
            <Row justify={'end'}>
                <Pagination
                    style={{ marginTop: 12, marginBottom: 12 }}
                    total={total}
                    size="small"
                    current={page.num}
                    pageSize={size}
                    showQuickJumper
                    showSizeChanger
                    onChange={(num, size) => setPage({ num, size })}
                    showTotal={(total) => `共（${total}）条`}
                />
            </Row>
        </>
    )
}

const FuncDataIndex: React.FC<any> = (props) => {
    const { pathname } = useLocation()

    const isEditPage = !!~pathname?.indexOf('/edit')
    const { formatMessage } = useIntl()
    const { child, name, id, onDelete, dataSource, setDataSource } = props
    const { btnState, allGroupData, baselineGroupIndex, groupLen, wsId, isOldReport, domainResult } = useContext(ReportContext)
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
                    let sub_case_list = isOldReport
                        ? conf.sub_case_list.filter((i: any) => i.result == value)
                        : conf.sub_case_list.filter((i: any) => i.compare_data.includes(value))
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
        console.log("func review handleArrow")
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
        const expand = formatMessage({ id: 'report.btn.expand.all' })
        const collapse = formatMessage({ id: 'report.btn.collapse.all' })
        setBtnName(btn ? expand : collapse)
        setExpandKeys([])
        let ExpandObj: any = []
        dataSource?.map((item: any) => {
            if (item.is_group) {
                item.list.map((child: any) => {
                    ExpandObj = ExpandObj.concat(child.list)
                })
            } else {
                ExpandObj = ExpandObj.concat(item.list)
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
    }, [btn, dataSource])

    const handleDelete = (name: string, row: any, rowKey: any) => {
        setDataSource(reportDelete(dataSource, name, row, rowKey))
    }

    // 右侧功能按钮
    const ItemFunc: React.FC<any> = () => {
        return (
            <TestItemFunc>
                <Space>
                    <Button onClick={OpenSubCase}>{btnName}</Button>
                    <Space>
                        <Typography.Text><FormattedMessage id="report.filter" />: </Typography.Text>
                        <Select defaultValue="All" style={{ width: 200 }} value={filterName} onSelect={handleConditions}>
                            <Option value="All"><FormattedMessage id="report.all.s" /></Option>
                            <Option value="Pass"><FormattedMessage id="report.pass" /></Option>
                            <Option value="Fail"><FormattedMessage id="report.fail" /></Option>
                            <Option value="Warn"><FormattedMessage id="ws.result.details.warn" /></Option>
                            <Option value="Skip"><FormattedMessage id="report.skip" /></Option>
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
                title={<FormattedMessage id="delete.prompt" />}
                onConfirm={() => handleDelete('conf', conf, cid)}
                cancelText={<FormattedMessage id="operation.cancel" />}
                okText={<FormattedMessage id="operation.delete" />}
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

    const hanldeExpand = (id: any) => {
        const expand = expandKeys.includes(id)
        if (expand)
            setExpandKeys(expandKeys.filter((i: any) => i !== id))
        else
            setExpandKeys(expandKeys.concat(id))
    }

    const functionTable = Array.isArray(funcData.list) && !!funcData.list.length ?
        funcData?.list?.map((suite: any, idx: number) => {
            const hasDesc = ['test_env', 'test_description', 'test_conclusion'].map((i: string) => suite[i]).filter(Boolean).length > 0
            console.log(hasDesc)
            return (
                <TestSuite key={suite?.suite_id}>
                    {(hasDesc && !domainResult.is_default) &&
                        <Configuration style={{ marginBottom: 16, backgroundColor: 'rgba(0,0,0,0.03)' }}>
                            {
                                [
                                    ["need_test_env", "test_env", "env"],
                                    ["need_test_description", "test_description", "description"],
                                    ["need_test_conclusion", "test_conclusion", "conclusion"],
                                ].map(($item: any) => {
                                    const [$var, name, $locale] = $item
                                    if (!domainResult.func_conf) return
                                    if (!domainResult.func_conf[$var]) return
                                    if (!suite[name]) return
                                    return (
                                        <SigleWrapper
                                            key={$var}
                                        >
                                            <TestTitle>
                                                <FormattedMessage id={`report.test.${$locale}`} />
                                            </TestTitle>
                                            <TestContent>
                                                {/* need_test_description  need_test_conclusion edit button*/}
                                                <PerfTextArea
                                                    name={suite[name]}
                                                    field={name}
                                                    suite={suite}
                                                    creator={domainResult?.creator}
                                                />
                                            </TestContent>
                                        </SigleWrapper>
                                    )
                                }).filter(Boolean)
                            }
                        </Configuration>
                    }
                    <SuiteName>
                        {suite.suite_name}
                        <Popconfirm
                            title={<FormattedMessage id="delete.prompt" />}
                            onConfirm={() => handleDelete('suite', suite, idx)}
                            cancelText={<FormattedMessage id="operation.cancel" />}
                            okText={<FormattedMessage id="operation.delete" />}
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
                                            <FormattedMessage id="report.total/pass/fail" />
                                        </Col>
                                        {
                                            i !== baseIndex && <Col span={12} style={{ textAlign: 'right', paddingRight: 10 }}>
                                                <FormattedMessage id="report.comparison.results" />
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
                            suite?.conf_list?.map((conf: any, cid: number) => {
                                const expand = expandKeys.includes(conf.conf_id)
                                let metricList: any = []
                                if (isOldReport) {
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
                                    <React.Fragment key={conf.conf_id}>
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
                                                                {
                                                                    !getCompareType(item) &&
                                                                    <JumpResult ws_id={wsId} job_id={item.obj_id} style={{ paddingLeft: 10 }} />
                                                                }
                                                            </Space>
                                                        </CaseText>
                                                    )
                                                })
                                            }
                                        </TestCase>
                                        <ExpandSubcases
                                            {...conf}
                                            expandKeys={expandKeys}
                                            isOldReport={isOldReport}
                                            baseIndex={baseIndex}
                                            groupLen={groupLen}
                                            btnState={btnState}
                                            btn={btnState}
                                        />
                                    </React.Fragment>
                                )
                            })
                        }
                    </TestConfWarpper>
                </TestSuite>
            )
        }) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
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
                        title={<FormattedMessage id="delete.prompt" />}
                        onConfirm={() => onDelete(name, funcData.name, funcData.rowKey)}
                        cancelText={<FormattedMessage id="operation.cancel" />}
                        okText={<FormattedMessage id="operation.delete" />}
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