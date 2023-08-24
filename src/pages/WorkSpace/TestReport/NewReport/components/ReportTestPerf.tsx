/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/no-array-index-key */
/* eslint-disable prefer-const */
import React, { useContext, useState, useEffect, useRef, memo, useMemo } from 'react';
import { Popconfirm, Empty, Row, Button } from 'antd';
import { FormattedMessage, useIntl, useParams } from 'umi';
import { ReportContext } from '../Provider';
import ReportTestFunc from './ReportTestFunc';
import { ReactComponent as TestGroupIcon } from '@/assets/svg/Report/TestGroup.svg';
import { GroupItemText } from './EditPerfText';
import Performance from './TestDataChild/PrefReview'
import { useScroll } from 'ahooks';
import Identify from '@/pages/WorkSpace/TestAnalysis/AnalysisResult/components/Identify';
import { simplify, deleteMethod } from './ReportFunction'
import styled from 'styled-components';
import {
    ModuleWrapper,
    TestDataTitle,
    SubTitle,
    Summary,
    Group,
    TestGroup,
    TestWrapper,
    TestItemText,
    PerfGroupTitle,
    CloseBtn,
} from '../ReportUI';
import { TextAreaEditBlock } from './EditPublic';

const GroupBar = styled.div<{ width?: number, y?: number, top?: any }>`
    background: #fff;
    position: fixed;
    /* top: 57px; */
    top: ${({ top }) => top || 0}px;
    height: 50px;
    border: 1px solid rgba(0,0,0,0.10);
    z-index: 5;
    width:${({ width }) => width || 0}px;
    transform:translateY(${({ y }) => y || 0}px);
`

const GroupBarWrapper: React.FC<any> = (props) => {
    const { groupRowRef, parentDom, groupLen, envData } = props
    const { top } = useScroll(document.querySelector('#report-body-container') as any)
    const floatRow = groupRowRef.current
    const testDataEle = parentDom.current

    if (!floatRow && !testDataEle) return <></>
    const testOffset = (testDataEle as any).offsetTop || 0
    const width = floatRow?.offsetWidth
    const visible = top > (testOffset + floatRow.offsetTop)

    if (visible) {
        return (
            <GroupBar
                width={width}
                top={50}
            // y={top - testOffset - floatRow.offsetTop}
            >
                <Summary style={{ border: 'none', paddingLeft: 34, paddingRight: 31 }}>
                    <Group>
                        <PerfGroupTitle gLen={groupLen}><FormattedMessage id="report.comparison.group.name" /></PerfGroupTitle>
                        <Identify envData={envData} group={groupLen} isData={true} />
                    </Group>
                </Summary>
            </GroupBar>
        )
    } else {
        return <></>
    }
}

const ReportTestPref: React.FC<AnyType> = (props) => {
    const { btnState, obj, setObj, envData, domainResult, groupLen, isOldReport, routeName, saveReportData } = useContext(ReportContext)
    const { report_id } = useParams() as any
    const intl = useIntl()
    const testDataRef = useRef(null)
    const groupRowRef = useRef<any>(null)
    const [btnName, setBtnName] = useState<string>('')
    const [btn, setBtn] = useState<boolean>(false)
    const [dataSource, setDataSource] = useState<any>([])

    const data = useMemo(() => {
        setBtn(domainResult.perf_conf?.show_type === 'list')
        if (Array.isArray(domainResult.perf_item)) {
            return domainResult.perf_item
        }
        return []
    }, [domainResult])

    const switchMode = () => {
        setBtn(!btn)
    }

    useEffect(() => {
        setBtnName(btn ? 'chart' : 'table')
    }, [btn])

    useEffect(() => {
        setDataSource(data)
    }, [data])

    /* 
        ** 删除测试项 测试组
    */
    const handleDelete = (name: string, domain: any, rowKey: any) => {
        setDataSource(deleteMethod(dataSource, name, domain, rowKey))
    }

    useEffect(() => {
        if (dataSource && !!dataSource.length) {
            const new_pref_data: any = []
            dataSource.map((item: any, idx: number) => {
                if (item.is_group) {
                    item.list?.map((child: any, listId: number) => {
                        let suite_list = simplify(child, idx, listId, 'group', isOldReport)
                        new_pref_data.push({
                            name: `${item.name}:${child.name}`,
                            suite_list,
                        })
                    })
                } else {
                    let suite_list = simplify(item, idx, 0, 'item', isOldReport)
                    new_pref_data.push({
                        name: item.name,
                        suite_list,
                    })
                }
            })
            setObj((draft: any) => {
                draft.test_item.perf_data = new_pref_data
                return draft
            })
        }
    }, [dataSource])

    const getGroupDesc = (group_name: string) => {
        const list = saveReportData.perf_desc || []
        const ret = list.filter((i: { name: string; value: string; }) => i.name === group_name).filter(Boolean).at(0)
        return ret
    }

    return (
        <ModuleWrapper
            id="test_data"
            className="position_mark"
            style={{
                width: groupLen > 3 ? groupLen * 390 : 1200,
                position: 'relative'
            }}
            ref={testDataRef}
        >
            <SubTitle><span className="line" /><FormattedMessage id="report.test.data" /></SubTitle>
            <Summary ref={groupRowRef} style={{ paddingLeft: 34, paddingRight: 31 }}>
                <Group>
                    <PerfGroupTitle gLen={groupLen}><FormattedMessage id="report.comparison.group.name" /></PerfGroupTitle>
                    <Identify envData={envData} group={groupLen} isData={true} />
                </Group>
            </Summary>
            <GroupBarWrapper
                groupRowRef={groupRowRef}
                parentDom={testDataRef}
                envData={envData}
                groupLen={groupLen}
            />
            {
                (domainResult.is_default || (!domainResult.is_default && domainResult.need_perf_data)) &&
                <>
                    <Row justify='space-between'>
                        <TestDataTitle id="perf_item" className="position_mark"><FormattedMessage id="performance.test" /></TestDataTitle>
                        <Button onClick={switchMode} style={{ marginTop: 12 }}>
                            {btnName === 'chart' ? <FormattedMessage id="report.chart.btn" /> : <FormattedMessage id="report.table.btn" />}
                        </Button>
                    </Row>
                    <TestWrapper>
                        {
                            Array.isArray(dataSource) && !!dataSource.length ?
                                dataSource?.map((item: any, idx: number) => {
                                    const groupDesc = getGroupDesc(item.name)
                                    return (
                                        <div key={item?.rowKey}>
                                            {
                                                item.is_group ?
                                                    <>
                                                        <TestGroup id={`pref_item-${item.rowKey}`} className="position_mark">
                                                            <TestGroupIcon style={{ marginLeft: 12, verticalAlign: 'middle' }} />
                                                            <TestItemText>
                                                                <GroupItemText
                                                                    name={item.name}
                                                                    rowKey={item.rowKey}
                                                                    btn={btnState}
                                                                    dataSource={dataSource}
                                                                    setDataSource={setDataSource}
                                                                />
                                                            </TestItemText>
                                                            <Popconfirm
                                                                title={<FormattedMessage id="delete.prompt" />}
                                                                onConfirm={() => handleDelete('item', item.name, item.rowKey)}
                                                                cancelText={<FormattedMessage id="operation.cancel" />}
                                                                okText={<FormattedMessage id="operation.delete" />}
                                                            >
                                                                {btnState && <CloseBtn />}
                                                            </Popconfirm>
                                                        </TestGroup>
                                                        {
                                                            (groupDesc?.desc || 'EditReport' === routeName) &&
                                                            <TextAreaEditBlock
                                                                default_state={'EditReport' === routeName}
                                                                title={item.name}
                                                                value={groupDesc?.desc}
                                                                report_id={report_id}
                                                                item_id={groupDesc?.item_id}
                                                                item_name={item.name}
                                                                placeholder={intl.formatMessage({ id: 'report.group.desc.placeholder' })}
                                                            />
                                                        }
                                                        {
                                                            item.list?.map((child: any, id: number) => {
                                                                return (
                                                                    <div key={child?.rowKey}>
                                                                        <Performance
                                                                            child={child}
                                                                            name="group"
                                                                            btn={btn}
                                                                            id={child.rowKey}
                                                                            dataSource={dataSource}
                                                                            setDataSource={setDataSource}
                                                                            onDelete={handleDelete}
                                                                        />
                                                                    </div>

                                                                )
                                                            })
                                                        }
                                                    </>
                                                    :
                                                    <Performance
                                                        child={item}
                                                        name="item"
                                                        btn={btn}
                                                        id={item.rowKey}
                                                        dataSource={dataSource}
                                                        setDataSource={setDataSource}
                                                        onDelete={handleDelete}
                                                    />
                                            }
                                        </div>
                                    )
                                })
                                :
                                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                        }
                    </TestWrapper>
                </>
            }
            {domainResult.is_default && <ReportTestFunc />}
            {(!domainResult.is_default && domainResult.need_func_data) && <ReportTestFunc />}
        </ModuleWrapper>
    )
}
export default memo(ReportTestPref);