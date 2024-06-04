/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useCallback, useRef } from 'react'
import { Breadcrumb, Typography, Row, Tag, Button, Spin, Popover } from 'antd'
import { QuestionCircleOutlined } from '@ant-design/icons';
import styled from 'styled-components'
import { FormattedMessage, history } from 'umi'
import { useClientSize, writeDocumentTitle } from '@/utils/hooks'
import BasicInfoDrawer from './components/BasicInfoDrawer'
import PipLine from './components/PipLine'
import ConsoleDrawer from './components/ConsoleDrawer'
import { queryPlanResultDetail } from './services'
import { requestCodeMessage } from '@/utils/utils'
import ViewReport from '@/pages/WorkSpace/TestResult/CompareBar/ViewReport'
interface ContainerProps {
    width: number;
    height: number;
}

const SummaryContainer = styled.div<ContainerProps>`
    width:${props => props.width}px;
    height:${props => props.height}px;
    /* overflow:auto; */
    background: #f5f5f5;
`

const SummaryHeader = styled.div`
    height: 150px;
    width:100%;
    background:#fff;
    padding: 20px 20px 12px;
`

const SummaryBody = styled.div`
    margin-top: 10px;
    width: 100%;
    height: calc( 100% - 100px - 20px - 40px);
    background:#fff;
    overflow: auto;
    padding: 29px 20px 20px 20px;
    display: flex;
`

const LinkSpan = styled.span`
    cursor:pointer;
    &:hover {
        color : #1890FF;
    }
`

const ViewDetail = (props: any) => {
    const { ws_id, plan_id } = props.match.params
    const { route } = props

    writeDocumentTitle(`Workspace.TestPlan.${route.name}`)

    const { height: layoutHeight, width: layoutWidth } = useClientSize()

    const [loading, setLoading] = useState(false)
    const [dataSet, setDataSet] = useState<any>({})
    //
    const basicInfoRef: any = useRef(null)
    const consoleRef: any = useRef(null)


    // 1.查询step数据
    const getDetailData = async (query: any) => {
        try {
            setLoading(true)
            const res = await queryPlanResultDetail(query) || {}
            const { data = {} } = res
            // mock
            // setDataSet(mockData2.data)

            if (res.code === 200) {
                setDataSet(data)
            } else {
                requestCodeMessage(res.code, res.msg)
            }
            setLoading(false)
        } catch (e) {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (plan_id) {
            getDetailData({ ws_id, plan_instance_id: plan_id })
        }
    }, [plan_id])

    const TagInfo = ({ data }: any) => {
        const { state, start_time, end_time, error_info } = data
        const rowStyle = { display: 'flex', alignItems: 'center' }
        const normalStyle = { background: '#F2F4F6', border: '1px solid #F2F4F6' }
        return (
            <div style={rowStyle}>
                {state === 'pending' && (
                    <Tag color='#D9D9D9' style={{ fontWeight: 500, textAlign: 'center' }}>Pending</Tag>
                )}
                {state === 'running' && (
                    <Tag color='#649FF6' style={{ fontWeight: 500, textAlign: 'center' }}>Running</Tag>
                )}
                {state === 'fail' && (
                    <div style={{ marginRight: 10 }}>
                      <Tag color='#C84C5A' style={{ fontWeight: 500, textAlign: 'center' }}>Fail</Tag>
                      <Popover
                        placement="topLeft"
                        content={error_info}
                        arrowPointAtCenter
                        >
                            <QuestionCircleOutlined style={{ marginLeft: -5 }}/>
                        </Popover>
                    </div>
                )}
                {state === 'success' && (
                    <Tag color='#81BF84' style={{ fontWeight: 500, textAlign: 'center' }}>Complete</Tag>
                )}
                {!!start_time && (
                    <Tag style={normalStyle}><FormattedMessage id="plan.start_time" />：{start_time}</Tag>
                )}
                {!!end_time && (
                    <Tag style={normalStyle}><FormattedMessage id="plan.end_time" />：{end_time}</Tag>
                )}
            </div>
        )
    }


    // 基础配置
    const BasicSettingClick = useCallback((data) => {
        basicInfoRef.current?.show('add', data)
    }, [])

    // 回调函数
    function prepareCallback(info: any) {
        const { data } = info
        consoleRef.current?.show('show', data)
    }
    function basicInfoCallback(info: any) {
        const { data, editFn } = info
        editFn({ ws_id, plan_instance_id: plan_id, note: data })
    }

    return (
        <Spin spinning={loading} >
            <SummaryContainer height={layoutHeight - 50} width={layoutWidth}>
                <SummaryHeader>
                    <Row style={{ marginBottom: 14 }}>
                        <Breadcrumb>
                            <Breadcrumb.Item>
                                <LinkSpan onClick={() => history.push(`/ws/${ws_id}/test_plan/view`)}>
                                    <FormattedMessage id={`Workspace.TestPlan.View`} />
                                </LinkSpan>
                            </Breadcrumb.Item>
                            <Breadcrumb.Item>
                                <FormattedMessage id={`Workspace.TestPlan.${route.name}`} />
                            </Breadcrumb.Item>
                        </Breadcrumb>
                    </Row>
                    <Typography.Title level={2} style={{ marginBottom: 8 }}>{dataSet.name}</Typography.Title>
                    <Row justify="space-between" align="bottom">
                        <TagInfo data={dataSet} />
                        <div style={{ display: 'flex' }}>
                            <Button onClick={() => BasicSettingClick(dataSet)} disabled={!Object.keys(dataSet).length}><FormattedMessage id="plan.configuration" /></Button>
                            <ViewReport dreType="bottomRight" ws_id={ws_id} jobInfo={dataSet} origin={'jobDetail'} buttonStyle={{ marginRight: 0, marginLeft: 10 }} />
                        </div>
                    </Row>
                </SummaryHeader>
                <SummaryBody>
                    <PipLine data={dataSet} prepareCallback={prepareCallback} ws_id={ws_id} />
                </SummaryBody>
            </SummaryContainer>

            <BasicInfoDrawer ref={basicInfoRef} callback={basicInfoCallback} />
            <ConsoleDrawer ref={consoleRef} />
        </Spin>
    )
}

export default ViewDetail
