import React, { memo, useState, useRef, useEffect } from 'react'
import { Row, Typography, Space, Button, Select } from 'antd'
import styled from 'styled-components'
import { QuestionCircleOutlined } from '@ant-design/icons'
import ChartModal from './Chart'
import { useRefWidth } from '../../hooks'
import { ReactComponent as GroupIcon } from '@/assets/svg/TestReport/TestGroup.svg'
import { ReactComponent as TermIcon } from '@/assets/svg/TestReport/TestItem.svg'

import { ReactComponent as IconLink } from '@/assets/svg/icon_openlink.svg';
import { ReactComponent as IconArrow } from '@/assets/svg/icon_arrow.svg'

const Wrapper = styled(Row)`
    
`
const FullRow = styled(Row)`width:100%`

const CaseTable = styled(FullRow)`
    border-radius: 2px;
    border-top:1px solid rgba(0,0,0,0.1);
    border-left:1px solid rgba(0,0,0,0.1);
    margin-bottom:16px;
`

const TestItemStyles = `
    border: 1px solid rgba(0,0,0,0.10);
    border-top:2px solid #1890FF;
    border-radius: 2px;
`

const Term = styled(FullRow)`
    margin-bottom:24px;
    ${TestItemStyles}
`

const TermTitle = styled(FullRow)`
    min-height:48px;
    padding:8px 20px;
    background: rgba(0,0,0,0.02);
    & .ant-typography>strong>div{
        padding-top:6px;
    }
`

const TermBody = styled(FullRow)`
    padding:11px 16px;
    & ${CaseTable}:last-child{
        margin-bottom:0;
    }
`

const Group = styled(FullRow)`
    margin-bottom:24px;
    ${TestItemStyles}
    ${Term} { 
        border:none;
        margin-bottom:0px;
    }
    ${TermTitle} {
        background:#fff;
        padding:0;
        padding-top:8px;
        
    }
    ${TermBody} {
        padding:0;
    }
`

const GroupTitle = styled(FullRow)`
    height:48px;
    padding:0 20px;
    background: rgba(0,0,0,0.02);
    align-items:center;
`

const GroupBody = styled(FullRow)`
    padding:0 16px;
`

const Suite = styled(FullRow)`
    background: rgba(0,0,0,0.03);
    border-radius: 2px;
    margin-bottom:8px;
`
const SuiteTitle = styled(FullRow)`
    min-height: 32px;
    // padding-top:8px;
    background: rgba(0,0,0,0.04);
    padding:0 20px;
`
const SuiteBody = styled(FullRow)`
    padding:0 16px 16px;
`

const ToolsIssue = styled(FullRow)`
    width:100%;
    background:#fff;
    margin-top:20px;
    border-top:1px solid rgba(0,0,0,0.1);
    border-left:1px solid rgba(0,0,0,.1)
`

const IssueRow = styled(FullRow)`
    height:38px;
    &>div{ 
        height:38px;line-height:38px;
        padding-left:8px;
        border-right:1px solid rgba(0,0,0,0.1);
        border-bottom:1px solid rgba(0,0,0,0.1);
    }
    &>div:first-child{
        width:75px;
        color:rgba(0,0,0,.85);
    }
    &>div:last-child{
        color:rgba(0,0,0,.65);
        width:calc(100% - 75px);
    }
`

const CaseTableRow = `
    &>div{
        height:38px;
        // line-height:38px;
        padding:0 8px;
        display:flex;
        align-items:center;
    }
    &>div:first-child {
        width:359px;
    }
    &>div:nth-child(n+2){
        width:calc( ( 100% - 359px ) / 3 );
    }
`

const TableBorder = `
    &>div {
        border-right:1px solid rgba(0,0,0,0.1);
        border-bottom:1px solid rgba(0,0,0,0.1);
    }
`

const SuiteCaseOption = styled(FullRow)`
    ${CaseTableRow}

    &>div {
        font-size:12px;
        color: rgba(0,0,0,0.45);
        align-items:flex-end;
        span {
            color:rgba(0,0,0,0.45);
        }
    }
`
const CaseHeader = styled(FullRow)`
    border-bottom:1px solid rgba(0,0,0,0.1);
    border-right:1px solid rgba(0,0,0,0.1);
    ${CaseTableRow}
    background:rgba(0,0,0,.02);
    &>div svg {
        color:rgba(0,0,0,.65);
        width:12px;
    }
`

const CaseTr = styled(FullRow)`
    ${CaseTableRow}
    ${TableBorder}
    &>div{ background:#fff;}
    &>div:first-child{
        padding-left:36px;
    }
`

const TableHeaderOptionRow = () => (
    <SuiteCaseOption >
        <Row align="bottom">Test Conf / 指标 </Row>
        {
            new Array(3).fill('').map((i: any, idx: number) => (
                <Row justify="space-between" key={idx}>
                    <Typography.Text>结果</Typography.Text>
                    { idx !== 0 && <Space>
                        <Typography.Text>对比结果/跟踪结果</Typography.Text>
                        <IconArrow />
                        <QuestionCircleOutlined />
                    </Space>}
                </Row>
            ))
        }
    </SuiteCaseOption>
)

const ConfTable: React.FC<any> = memo(
    ({ test_conf_name, metric_list = [] }) => {
        return (
            <CaseTable>
                <CaseHeader>
                    <div><Typography.Text strong>{test_conf_name}</Typography.Text></div>
                    <div></div>
                    <div><IconLink /></div>
                    <div><IconLink /></div>
                </CaseHeader>
                {
                    metric_list.map((metric: any) => (
                        <CaseTr key={metric}>
                            <div>{metric}</div>
                            <div>-</div>
                            <div>-</div>
                            <div>-</div>
                        </CaseTr>
                    ))
                }
            </CaseTable>
        )
    }
)

interface SuiteConfToolsProps {
    perf_conf: {
        need_test_conclusion: boolean
        need_test_description: boolean
        need_test_env: boolean
        need_test_suite_description: boolean
    }
}

const ToolRow: React.FC<any> = ({ data, title }) => (
    data &&
    <IssueRow>
        <div><Typography.Text strong>{title}</Typography.Text></div>
        <div>此处内容需生成报告后手动填写</div>
    </IssueRow>
)

const ToolHeaderRow: React.FC<any> = ({ data, title }) => (
    data &&
    <IssueRow>
        <div><Typography.Text strong>{title}</Typography.Text></div>
        <div>此处内容将会自动从Test Suite中获取</div>
    </IssueRow>
)

const SuiteConfTools: React.FC<SuiteConfToolsProps> = ({ perf_conf }) => (
    perf_conf ?
        <ToolsIssue>
            <ToolHeaderRow title={'测试工具'} data={perf_conf.need_test_suite_description} />
            <ToolRow title={'测试环境'} data={perf_conf.need_test_env} />
            <ToolRow title={'测试说明'} data={perf_conf.need_test_description} />
            <ToolRow title={'测试结论'} data={perf_conf.need_test_conclusion} />
        </ToolsIssue> :
        <></>
)

const TermItem: React.FC<any> = ({ name, list, perf_conf, rowkey, field, is_default }) => {
    const [modalType, setModalType] = useState(perf_conf.show_type === 'list')
    const [chartType, setChartType] = useState('1')

    useEffect(() => {
        setModalType(perf_conf.show_type === 'list')
    }, [perf_conf.show_type])

    const title = useRef<any>()
    const titleWidth = useRefWidth(title)

    const hanldeChangeChartType = (val: string) => setChartType(val)

    const handleChangeModal = () => {
        setModalType(!modalType)
        setChartType('1')
    }

    return (
        <Term >
            <TermTitle justify="space-between" id={`${field}-${rowkey}`} ref={title}>
                <Typography.Text strong>
                    <Space align="start">
                        <TermIcon style={{ transform: 'translate(0px, 2px)' }} />
                        <Typography.Text strong style={{ width: titleWidth - 410, display: 'inline-block' }}>
                            {name}
                        </Typography.Text>
                    </Space>
                </Typography.Text>
                <Space align="start">
                    <Space>
                        <Typography.Text>筛选：</Typography.Text>
                        <Select value={''} style={{ width: 200 }}>
                            <Select.Option value="">全部</Select.Option>
                        </Select>
                    </Space>
                    <Button onClick={handleChangeModal}>
                        {!modalType ? '列表视图' : '图表视图'}
                    </Button>
                </Space>
            </TermTitle>
            <TermBody>
                {
                    list.map(
                        (suite: any, index: number) => (
                            <Suite key={index}>
                                <SuiteTitle justify="space-between" style={{ paddingTop: 8 , paddingBottom : 8 }}>
                                    <Typography.Text strong style={{ width: titleWidth - (!modalType ? 410 : 60) }}>
                                        {suite.suite_show_name}
                                    </Typography.Text>
                                    {
                                        !modalType &&
                                        <Space style={{ height: 32 }}>
                                            <Typography.Text>视图：</Typography.Text>
                                            <Select value={chartType} style={{ width: 230 }} onChange={hanldeChangeChartType}>
                                                <Select.Option value="1">所有指标拆分展示(type1)</Select.Option>
                                                <Select.Option value="2">多Conf同指标合并(type2)</Select.Option>
                                                <Select.Option value="3">单Conf多指标合并(type3)</Select.Option>
                                            </Select>
                                        </Space>
                                    }
                                </SuiteTitle>
                                <SuiteBody >
                                    {(!is_default && perf_conf) && <SuiteConfTools perf_conf={perf_conf} />}
                                    {
                                        !modalType ?
                                            <ChartModal {...suite} chartType={chartType} /> :
                                            <>
                                                <TableHeaderOptionRow />
                                                {
                                                    suite.case_source.map(
                                                        (conf: any, idx: any) => (
                                                            <ConfTable
                                                                key={idx}
                                                                test_suite_id={suite.test_suite_id}
                                                                {...conf}
                                                            />
                                                        )
                                                    )
                                                }
                                            </>
                                    }
                                </SuiteBody>
                            </Suite>
                        )
                    )
                }
            </TermBody>
        </Term>
    )
}

const PerformanceTest: React.FC<any> = ({ perf_item, perf_conf, field, is_default }) => {
    const title = useRef<any>()
    const titleWidth = useRefWidth(title)

    return (
        <Wrapper>
            {
                perf_item.map(
                    (item: any) => (
                        item.is_group ?
                            <Group id={`${field}-${item.rowkey}`} key={item.rowkey} ref={title}>
                                <GroupTitle >
                                    <Space align="center">
                                        <GroupIcon style={{ transform: 'translate(0px, 1px)' }} />
                                        <Typography.Text strong style={{ width: titleWidth - 70, display: 'inline-block' }}>{item.name}</Typography.Text>
                                    </Space>
                                </GroupTitle>
                                <GroupBody>
                                    {
                                        item.list.map((i: any) => (
                                            <TermItem is_default={is_default} field={field} key={i.rowkey} {...i} perf_conf={perf_conf} />
                                        ))
                                    }
                                </GroupBody>
                            </Group> :
                            <TermItem is_default={is_default} field={field} key={item.rowkey} {...item} perf_conf={perf_conf} />
                    )
                )
            }
        </Wrapper>
    )
}

export default memo(PerformanceTest)