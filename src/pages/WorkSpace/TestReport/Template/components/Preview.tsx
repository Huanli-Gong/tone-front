import React, { memo, forwardRef, useImperativeHandle, useState } from 'react'
import styled from 'styled-components'
import { Button, Row, Space, Typography, Table, Card, List, Col, Select } from 'antd'
import { ArrowLeftOutlined , CaretRightOutlined } from '@ant-design/icons'
import { history, useParams , useRequest } from 'umi'
import { queryFunctionalSubcases } from '@/pages/WorkSpace/TestAnalysis/AnalysisTime/services'

import produce from 'immer'

const TableWrapper = styled(Table)`
    & tr.ant-table-row:nth-child(even) {
        background:#FAFAFA;
        &:hover {
            td {
                background:#FAFAFA;
            }
        }
    }

    & tr.ant-table-row:nth-child(odd) {
        background:#FDFEFF;
        &:hover {
            td {
                background:#FDFEFF;
            }
        }
    }

    & .ant-table-row:nth-child(even) td {
        border-right:1px solid transparent !important;
    }

    & .ant-table-row td:last-child {
        border-right:1px solid #f0f0f0 !important;
    }

    tr td {
        padding : 0 !important;
    }

    .ant-table-container {
        border-right: 1px solid #f0f0f0!important;
        overflow: hidden;
    }
`

const PreviewContainer = styled.div`
    overflow : auto;
    // overflow:hidden;
    width:100%;
    overflow-x:hidden;
    position : fixed;
    left : 0;
    right : 0;
    top : 0 ;
    bottom : 0 ;
    background:#fff;
    z-index:999;
    padding-top:50px;
`

const PreviewHeader = styled.div`
    padding:20px;
`

const GrayLine = styled.div`
    height:10px;
    background:#f5f5f5;
    width:100%;
`

const ProjectTitle = styled.div`
    font-weigth:600;
    font-size: 16px;
    line-height: 26px;
    font-weight: 600;
    color: rgba(0,0,0,0.85);
    &::before {
        content: '';
        width: 2px;
        height: 16px;
        background: #1890FF;
        margin-right:10px;
        border-left: 2px solid #1890FF;
        margin-left: 10px;
    }
`

const ProjectWrapper = styled.div`
    background:#fff;
    padding:20px 0;
    ${ProjectTitle} {
        font-size: 16px;
        // color: #FA6400 
        margin-bottom:20px;
    }
    .ant-typography.preview-project-name strong {
        color: #FA6400 
    }
`

const ProjectRow = styled(Row)`
    padding:0 20px;
`

const CardWrapper = styled(Card)`
    width : 100%;
    .ant-card-head {
        min-height:40px;
        padding:0 20px;
        height:40px;
        background:#fafafa;
        border-bottom:none;
        .ant-card-head-title {
            padding:0;
            height : 40px;
            line-height:40px;
        }
    }

    .ant-card-body {
        padding:0;
    }
`

const TestItemRow = styled(Row)`
    margin : 20px 0;
`

const Bar = styled(Row)`
    width: 100%;
    height: 50px;
    line-height: 50px;
    background-color: #fff;
    border-bottom: 1px solid rgba(0,0,0,.08);
    padding-left: 20px;
    padding-right: 20px;
    position:fixed;
    top:0;
    left:0;
    right:0;
    z-index:3;
`

const PerfContrlRow = styled(Row)`
    padding:20px 20px 0;
    border-bottom: 1px solid rgba(0,0,0,0.10);
    background:#FDFEFF;
    p{
        width : 100%;
    }
`

const TitleRoundIcon = styled.div`
    width:16px;
    height:16px;
    display:flex;
    justify-content:center;
    align-items:center;
    span {
        display:inline-block;
        width:4px;
        height:4px;
        border-radius:50%;
        background:rgb(255,100,0);
    }
`

const TABLE_COLUMN_COUNT = 5

const RenderTestRow: React.FC<any> = ({ show, testType, dataSource, config , isDefault , onSourceChange , source }) => {
    if ( !show ) return <></>
    return (
        <ProjectRow style={{ marginTop: 20 }}>
            <Col span={24} id={`view-${ testType ==='performance' ? 'perf_item' : 'func_item' }`}>
                <Typography.Text strong>{testType === 'performance' ? '性能数据' : '功能数据'}</Typography.Text>
            </Col>
            <Col span={24}>
                {
                    dataSource.map((item: any) => (
                        <RenderTestItem 
                            testType={testType} 
                            data={item} 
                            key={item.rowkey} 
                            config={config} 
                            isDefault={ isDefault }
                            onSourceChange={ onSourceChange }
                            source={ source }
                        />
                    ))
                }
            </Col>
        </ProjectRow>
    )
}

const TestGroupTitle = styled(Row)`
    // margin-bottom:10px;
    height:40px;
    margin-top:10px;
    background: rgba(24,144,255,0.10);
    box-shadow: inset 4px 0 0 0 #1890FF;
    width:100%;
    line-height:40px;
    padding-left:20px;
`

const SubcaseRow = styled.div`
    display : flex ;
    flex-direction:column ;
    padding-left : 44px ;
    margin-bottom : 10px ;
    color : rgba(0,0,0,.65) ;
    overflow : hidden ;
    text-overflow : ellipsis ;
    white-space : nowrap;
`

const changeSuiteConf = ( data : any , conf_id : any , suite_id : any , subcases : any ) => {
    return data.map(( item : any ) => {
        if ('test_suite_id' in item && item.test_suite_id === suite_id ) {
            return { 
                ...item , 
                case_source : item.case_source.map(( i : any ) => {
                    return i.test_conf_id === conf_id ? { ...i , subcases } : i
                })
            }
        }
        if ( item.list && item.list.length > 0 ) 
            return {
                ...item,
                list : changeSuiteConf( item.list , conf_id , suite_id , subcases )
            }
        return item
    })
}

const RenderTestItem: React.FC<any> = ({ data, testType, config , isDefault , source , onSourceChange }) => {
    const field = testType === 'functional' ? 'func_item' : 'perf_item'
    const { run } = useRequest(queryFunctionalSubcases , { manual : true })

    const handleExpand = async ( conf : any , test_suite_id : any ) => {
        const { test_conf_id : test_case_id , subcases } = conf
        let list : any = undefined
        if ( !subcases ) 
            list = await run({ test_case_id , test_suite_id })

        onSourceChange(
            produce( source , ( draftState : any ) => {
                draftState[ field ] = changeSuiteConf( source[ field ] , test_case_id , test_suite_id , list )
            })
        )
    }

    return data.is_group ?
        <>
            <TestGroupTitle >{ data.name }</TestGroupTitle>
            {
                data.list.map(
                    (item: any) => <RenderTestItem 
                                        isDefault={ isDefault } 
                                        testType={testType} 
                                        config={ config } 
                                        data={item} 
                                        key={item.rowkey} 
                                        source={ source }
                                        onSourceChange={ onSourceChange }
                                    />
                )
            }
        </> :
        <Col span={24}>
            <TestItemRow justify="space-between" align="middle" id={`view-${ field }-${data.rowkey}`}>
                <Row align="middle">
                    <TitleRoundIcon ><span /></TitleRoundIcon>
                    <Typography.Text strong style={{ color : 'rgba(255,100,0)'}}>{data.name}</Typography.Text>
                </Row>
                {
                    testType !== 'functional' &&
                    <Space>
                        <span>筛选：</span>
                        <Select style={{ width: 200 }} disabled={true} defaultValue={''}>
                            <Select.Option value="">全部</Select.Option>
                        </Select>
                        <Button disabled={ true }>图表模式</Button>
                    </Space>
                }
            </TestItemRow>
            {
                data.list.map(
                    (item: any) => (
                        <CardWrapper title={item.suite_show_name} key={item.rowkey}>
                            {
                                (!isDefault && config && ( config.need_test_suite_description || config.need_test_env || config.need_test_description || config.need_test_conclusion ) && testType !== 'functional') &&
                                <PerfContrlRow wrap={true}>
                                    {
                                        config.need_test_suite_description &&
                                        <>
                                            <p>测试工具：</p>
                                            <p>-</p>
                                        </>
                                    }
                                    {
                                        config.need_test_env &&
                                        <>
                                            <p>测试环境：</p>
                                            <p>-</p>
                                        </>
                                    }
                                    {
                                        config.need_test_description &&
                                        <>
                                            <p>测试说明：</p>
                                            <p>-</p>
                                        </>
                                    }
                                    {
                                        config.need_test_conclusion &&
                                        <>
                                            <p>测试结论：</p>
                                            <p>-</p>
                                        </>
                                    }
                                </PerfContrlRow>
                            }
                            <List
                                dataSource={[{}]}
                                style={{ padding: 0, overflow: 'hidden' , background : '#FDFEFF'}}
                                renderItem={
                                    () => (
                                        <List.Item style={{ padding: 0, width: TABLE_COLUMN_COUNT * 240 + 360 }}>
                                            <div style={{ width: 360, borderRight: '1px solid #f0f0f0', padding: '8px 20px' }}>
                                                {
                                                    item.case_source.map(
                                                        (conf: any, index: number) => (
                                                            <>
                                                                <Row key={index} style={{ height: 38, lineHeight: '38px' }}>
                                                                    <Space>
                                                                        {
                                                                            ( !isDefault && testType === 'functional' ) &&
                                                                            <CaretRightOutlined 
                                                                                style={{ cursor : 'pointer' }} 
                                                                                rotate={conf.subcases && conf.subcases.length > 0 ? 90 : 0} 
                                                                                onClick={() => handleExpand( conf , item.test_suite_id )}
                                                                            />
                                                                        }
                                                                        <Typography.Text strong >{conf.test_conf_name}</Typography.Text>
                                                                    </Space>
                                                                </Row>
                                                                {
                                                                    ( conf.subcases && conf.subcases.length > 0 ) &&
                                                                    conf.subcases.map(( i : any ) => (
                                                                        <SubcaseRow 
                                                                            key={ i } 
                                                                        >
                                                                            <Typography.Text ellipsis>
                                                                                { i }
                                                                            </Typography.Text>
                                                                        </SubcaseRow>
                                                                    ))
                                                                }
                                                                {
                                                                    ( isDefault && testType === 'performance' ) &&
                                                                    <>
                                                                        <div style={{ display : 'flex' , flexDirection:'column' , paddingLeft : 20 , marginBottom : 10 }}>
                                                                            <Typography.Text>指标</Typography.Text>
                                                                            <Typography.Text>指标</Typography.Text>
                                                                        </div>
                                                                    </>
                                                                }
                                                            </>
                                                        )
                                                    )
                                                }
                                            </div>
                                            {
                                                new Array(TABLE_COLUMN_COUNT).fill('').map(
                                                    (i: void, n: number) => (
                                                        <div
                                                            key={n}
                                                            style={{
                                                                width: 240,
                                                                borderRight: '1px solid #f0f0f0',
                                                                height: item.case_source.length * 38 + 16 + ( ( isDefault&& testType === 'performance' ) ? 54 * item.case_source.length : item.case_source.reduce(( p : any , c : any ) => p += c.subcases ? c.subcases.length * 32 : 0 , 0 ) )
                                                            }}
                                                        />
                                                    )
                                                )
                                            }
                                        </List.Item>
                                    )
                                }
                            />
                        </CardWrapper>
                    )
                )
            }
        </Col>
}

const PreviewPage = (props: any, ref: any) => {
    // const { onOk } = props
    const { ws_id } : any = useParams()

    const [dataSource, setDataSource] = useState<any>({
        is_default: false,
        perf_item: [],
        func_item: [],
        perf_conf: null,
        func_conf:null,
        need_test_background: false,
        need_test_method: false,
        need_test_summary: false,
        need_test_conclusion: false,
        need_test_env: false,
    })

    const [visible, setVisible] = useState(false)

    useImperativeHandle(ref, () => ({
        show(_: any) {
            setVisible(true)
            _ && setDataSource(_)
        }
    }))

    const summary = [{ name: '对比标识', }, { name: '性能测试', }, { name: '', }, { name: '功能测试' }, {}]

    const handleBackPage = () => {
        if (dataSource.is_default) history.push(`/ws/${ws_id}/test_report?t=template`)
        else setVisible(false)
    }

    // console.log( dataSource )

    if (!visible) return <></>
    return (
        <PreviewContainer>
            <Bar justify="space-between" align="middle">
                <Space>
                    <ArrowLeftOutlined style={{ fontSize: 20, cursor: 'pointer' }} onClick={handleBackPage} />
                    <Typography.Title level={4} style={{ marginBottom: 0 }} >报告模版预览</Typography.Title>
                </Space>
                {/* {
                    !dataSource?.is_default && <Button type="primary" onClick={onOk}>保存</Button>
                } */}
            </Bar>
            <PreviewHeader >
                <Row>
                    <Typography.Title level={2} style={{ margin: 0 }}>{dataSource.name || '报告名称'}</Typography.Title>
                </Row>
                <Row>
                    <Space>
                        <Typography.Text strong>描述</Typography.Text>
                        <Typography.Text>{dataSource.description || '-'}</Typography.Text>
                    </Space>
                </Row>
                <Row>
                    <Space>
                        <Typography.Text>报告创建时间</Typography.Text>
                        <Typography.Text>{dataSource.gmt_created || ''}</Typography.Text>
                    </Space>
                </Row>
            </PreviewHeader>
            <GrayLine />
            <ProjectWrapper >
                <ProjectTitle id="view-summary">概述</ProjectTitle>
                {
                    dataSource.need_test_background &&
                    <>
                        <ProjectRow id="view-need_test_background"><Typography.Text strong >测试背景</Typography.Text></ProjectRow>
                        <ProjectRow>-</ProjectRow>
                    </>
                }
                {
                    ( dataSource.is_default && dataSource.need_test_method ) &&
                    <>
                        <ProjectRow id="view-need_test_method"><Typography.Text strong >测试方法</Typography.Text></ProjectRow>
                        <ProjectRow>-</ProjectRow>
                    </>
                }
                {
                    dataSource.need_test_conclusion &&
                    <>
                        <ProjectRow id="view-need_test_conclusion"><Typography.Text strong >测试结论</Typography.Text></ProjectRow>
                        <ProjectRow>-</ProjectRow>
                    </>
                }
                {
                    dataSource.need_test_summary &&
                    <>
                        <ProjectRow id="view-need_test_summary"><Typography.Text  >-Summary</Typography.Text></ProjectRow>
                        {/* <ProjectRow>-</ProjectRow> */}
                        <ProjectRow>
                            <TableWrapper
                                style={{ width: '100%', marginTop: 8 }}
                                dataSource={summary.map((i: any, index: number) => ({ ...i, index }))}
                                bordered
                                // scroll={{ x: TABLE_COLUMN_COUNT * 240 + 360 }}
                                columns={
                                    new Array(TABLE_COLUMN_COUNT + 1).fill('').map((i: any, index: number) => {
                                        return {
                                            width: index === 0 ? 360 : 240,
                                            render(row, record, i) {
                                                return index === 0 ?
                                                    <div
                                                        style={{
                                                            width: 360,
                                                            height: i === 0 ? 72 : 40,
                                                            display: 'flex',
                                                            alignItems: "center",
                                                            paddingLeft: 20,
                                                        }}
                                                    >
                                                        <Typography.Text strong>{row.name}</Typography.Text>
                                                    </div> :
                                                    <div style={{ width: 240 }} />
                                            }
                                        }
                                    })
                                }
                                rowKey={'index'}
                                pagination={false}
                                showHeader={false}
                                size="small"
                            />
                        </ProjectRow>
                    </>
                }
            </ProjectWrapper>
            {
                dataSource.need_test_env &&
                <>
                    <GrayLine />
                    <ProjectWrapper >
                        <ProjectTitle id="view-need_test_env">测试环境</ProjectTitle>
                        {
                            dataSource.is_default ? 
                                <ProjectRow>
                                    <CardWrapper title="IP/SN" >
                                        <List
                                            dataSource={[{}]}
                                            style={{ padding: 0, overflow: 'hidden' , background : '#FDFEFF' }}
                                            renderItem={
                                                item => (
                                                    <List.Item style={{ padding: 0, width: TABLE_COLUMN_COUNT * 240 + 360 }}>
                                                        <div style={{ width: 360, borderRight: '1px solid #f0f0f0', height: 128, padding: '8px 20px' }}>
                                                            <Row style={{ marginBottom: 8 }}>
                                                                <Typography.Text strong>机型</Typography.Text>
                                                            </Row>
                                                            <Row style={{ marginBottom: 8 }}>
                                                                <Typography.Text strong>RPM</Typography.Text>
                                                            </Row>
                                                            <Row style={{ marginBottom: 8 }}>
                                                                <Typography.Text strong>GCC</Typography.Text>
                                                            </Row>
                                                            <Row>
                                                                <Typography.Text strong>IP/SN</Typography.Text>
                                                            </Row>
                                                        </div>
                                                        {
                                                            new Array(TABLE_COLUMN_COUNT).fill('').map(
                                                                (i: any, idx: number) => (
                                                                    <div key={idx} style={{ width: 240, borderRight: '1px solid #f0f0f0', height: 128 }} />
                                                                )
                                                            )
                                                        }
                                                    </List.Item>
                                                )
                                            }
                                        />
                                    </CardWrapper>
                                </ProjectRow> :
                                <>
                                    <ProjectRow id="view-need_test_env">
                                        <Typography.Text strong>测试环境</Typography.Text>
                                    </ProjectRow>
                                    <ProjectRow>
                                        <Typography.Text>-</Typography.Text>
                                    </ProjectRow>
                                </>
                        }
                    </ProjectWrapper>
                </>
            }
            <GrayLine />
            <ProjectWrapper >
                <ProjectTitle id="view-need_test_data">测试数据</ProjectTitle>
                <RenderTestRow 
                    show={ dataSource.need_perf_data } 
                    testType={'performance'} 
                    isDefault={ dataSource.is_default } 
                    dataSource={dataSource.perf_item} 
                    config={dataSource.perf_conf} 
                    onSourceChange={ setDataSource }
                    source={ dataSource }
                />
                <RenderTestRow 
                    show={ dataSource.need_func_data } 
                    testType={'functional'} 
                    config={ dataSource.func_conf }
                    isDefault={ dataSource.is_default } 
                    dataSource={dataSource.func_item} 
                    onSourceChange={ setDataSource }
                    source={ dataSource }
                />
            </ProjectWrapper>
        </PreviewContainer>
    )
}

export default memo(forwardRef(PreviewPage))

