import React, { useState, useRef, useEffect } from 'react'
import { Row, Col, Form, Select, DatePicker, Card, Button, Empty, Tooltip, message, Descriptions, Spin } from 'antd'
import moment from 'moment'
import { useRequest, useLocation, useParams, useIntl, FormattedMessage } from 'umi'
import styled from 'styled-components'
import AnalysisTable from './Table'

import ChartRender from './RenderChart'
import { queryProjectList, queryPerfAnalysisList, queryFuncAnalysisList } from '../services';
import { tagList as queryJobTagList } from "@/pages/WorkSpace/TagManage/service"
import SelectMertric from './MetricSelectDrawer'
import styles from './index.less'
import _ from 'lodash'
import { QuestionCircleOutlined } from '@ant-design/icons'
// import { sourceData } from './SelectMertric_old'

const CardWrapper = styled(Card)`
    border: none;
`

const TootipTipRow = styled(Row)`
    position:relative;
    width:300px;
    .tootip_pos {
        position:absolute;
        left:300px;
        top:4px;
    }
`
const fontStyle = {
    fontWeight: 'bold'
}

const SuiteConfMetric = (props: any) => {
    let str = props.title?.split('/')
    return (
        <div style={{ color: '#000' }}>
            <Descriptions column={1}>
                <Descriptions.Item
                    label="Suite"
                    labelStyle={{ ...fontStyle, paddingLeft: 10 }}
                >
                    {str[0]}
                </Descriptions.Item>
                <Descriptions.Item
                    label="Conf"
                    labelStyle={{ ...fontStyle, paddingLeft: 12 }}
                >
                    {str[1]}
                </Descriptions.Item>
                <Descriptions.Item
                    label="Metric"
                    contentStyle={{ display: 'inline-block', paddingBottom: 8 }}
                    labelStyle={{ ...fontStyle }}
                >
                    {props?.metric?.map(
                        (item: any, i: number) =>
                            <div key={i}>{item}</div>)
                    }
                </Descriptions.Item>
            </Descriptions>
        </div>
    )
}

const TabPaneCard: React.FC<any> = (props) => {
    const { formatMessage } = useIntl()
    const { ws_id } = useParams() as any
    const { query }: any = useLocation()
    const { provider, testType, showType, onChange } = props
    const [chartData, setChartData] = useState<any>({})
    const [tableData, setTableData] = useState<any>([])
    const [metricData, setMetricData] = useState<any>(null)
    const [projectId, setProjectId] = useState('')
    const [loading, setLoading] = useState(false)

    const selectMetricRef: any = useRef()
    const [form] = Form.useForm()

    const { data: tagList } = useRequest(
        (params = { ws_id, page_size: 999 }) => queryJobTagList(params),
        { initialData: [] } /* , manual: true */
    )
    const { data: projectList } = useRequest(() => queryProjectList({ ws_id, page_size: 500 }), { initialData: [] })

    const requestAnalysisData = async (params: any) => {
        onChange(params)
        setLoading(true)

        if (loading) return
        const { data, code } = testType === 'performance' ?
            await queryPerfAnalysisList(params) :
            await queryFuncAnalysisList(params)
        setLoading(false)

        if (code === 200) {
            const { job_list, metric_map, case_map } = data
            if (job_list.length > 0) {
                setChartData(testType === 'performance' ? metric_map : case_map)
                setTableData(job_list)
                return
            }
        }
        setTableData([])
        setChartData({})
    }

    const handleSelectMertric = () => {
        if (form.getFieldValue('project_id')) {
            selectMetricRef.current.show()
        } else {
            message.error(formatMessage({ id: 'analysis.selected.error' }))
        }
    }

    const handleMerticSelectOk = (data: any) => {
        setMetricData(data)
        fetchAnalysis(data)
    }

    const fetchAnalysis = (data: any) => {
        let params: any = testType === 'functional' ? { show_type: showType } : { provider_env: provider }
        const values = form.getFieldsValue()
        const { project_id, tag, time } = values

        const { test_suite_id, test_case_id } = data

        if (time && time.length > 0) {
            const [start_time, end_time] = time
            params.start_time = moment(start_time).format('YYYY-MM-DD')
            params.end_time = moment(end_time).format('YYYY-MM-DD')
        }

        params.tag = tag
        params.project_id = project_id
        if (project_id && test_suite_id && test_case_id) {
            requestAnalysisData({
                ...params,
                ...data,
            })
        }
    }

    const handleFormChange = (changedFields: any, allFields: any) => {
        let params: any = { provider_env: provider, show_type: showType }
        allFields.forEach((i: any) => {
            if (i.name.toString() === 'project_id' && i.value) params.project_id = i.value
            if (i.name.toString() === 'tag' && i.value) params.tag = i.value
            if (i.name.toString() === 'time' && i.value) {
                const [start_time, end_time] = i.value
                params.start_time = moment(start_time).format('YYYY-MM-DD')
                params.end_time = moment(end_time).format('YYYY-MM-DD')
            }
        })

        if (metricData) {
            const { test_suite_id, test_case_id } = metricData
            const { project_id } = params
            if (test_suite_id && test_case_id && project_id) {
                requestAnalysisData({
                    ...params,
                    ...metricData
                })
            }
        }
    }

    useEffect(() => {
        selectMetricRef.current.reset()
        setChartData(null)
        setTableData([])
        // form.resetFields()
        setMetricData(null)
    }, [provider, showType, testType])

    useEffect(() => {
        if (query && JSON.stringify(query) !== '{}') {
            const {
                test_type, project_id, tag, start_time, end_time, provider_env,
                metric, title, test_suite_id, test_case_id, sub_case_name
            } = query

            if (test_type === testType) {
                /* project_id && run({ project_id, page_size: 999 }) */

                form.setFieldsValue({
                    project_id: project_id ? + project_id : undefined,
                    tag: tag ? + tag : undefined,
                })
                const params = {
                    metric: _.isArray(metric) ? metric : [metric],
                    project_id, tag, start_time, end_time,
                    test_suite_id, test_case_id, sub_case_name,
                    show_type: showType, provider_env
                }
                setMetricData({
                    title,
                    metric: _.isArray(metric) ? metric : [metric],
                    sub_case_name,
                    test_suite_id,
                    test_case_id
                })
                if (title) requestAnalysisData(params)

                if (start_time || end_time)
                    form.setFieldsValue({ time: [moment(start_time), moment(end_time)] })
            }
        }
    }, [query])

    const handleProductChange = (val: any) => {
        /* run({ project_id: val, page_size: 999 }) */
        setProjectId(val)
    }

    return (
        <>
            <Row style={{ padding: '0 20px 10px', background: '#fff' }}>
                <Col span={24}>
                    <Form
                        layout="inline"
                        form={form}
                        colon
                        onFieldsChange={handleFormChange}
                        className={styles.formInlineStyles}
                    >
                        <Form.Item label={<FormattedMessage id="analysis.project" />}
                            name="project_id" >
                            <Select
                                placeholder={formatMessage({ id: 'analysis.project.placeholder' })}
                                onChange={handleProductChange}
                                showSearch
                                filterOption={(input, option: any) => {
                                    return option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                }}
                            >
                                {
                                    projectList.map((i: any) => (
                                        <Select.Option key={i.id} value={i.id}>{i.name}</Select.Option>
                                    ))
                                }
                            </Select>
                        </Form.Item>
                        <Form.Item label={<FormattedMessage id="analysis.tag" />}>
                            <TootipTipRow>
                                <Form.Item name="tag" initialValue="">
                                    <Select
                                        allowClear
                                        placeholder={formatMessage({ id: 'analysis.tag.placeholder' })}
                                        showSearch
                                        style={{ width: 300 }}
                                        filterOption={(input, option: any) => {
                                            if (typeof option.children === "string")
                                                return option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                            return false
                                        }}
                                    >
                                        <Select.Option value=""><FormattedMessage id="analysis.indistinguishable" /></Select.Option>
                                        {
                                            tagList
                                                .filter(({ creator }: any) => Object.prototype.toString.call(creator) === "[object Number]")
                                                .map((i: any) => (
                                                    <Select.Option
                                                        key={i.id}
                                                        value={i.id}
                                                    >
                                                        {i.name}
                                                    </Select.Option>
                                                ))
                                        }
                                    </Select>
                                </Form.Item>
                                <div className="tootip_pos">
                                    <Tooltip
                                        overlayClassName={styles.table_question_tooltip}
                                        color="#fff"
                                        placement="top"
                                        arrowPointAtCenter
                                        title={formatMessage({ id: 'analysis.only.the.job.data' })}
                                    >
                                        <QuestionCircleOutlined style={{ color: 'rgba(0, 0, 0, 0.65)', marginLeft: 5 }} />
                                    </Tooltip>
                                </div>
                            </TootipTipRow>
                        </Form.Item>
                        <Form.Item
                            label={<FormattedMessage id="analysis.date" />}
                            name="time"
                            initialValue={[moment().subtract(29, 'days'), moment().startOf('day')]}
                        >
                            <DatePicker.RangePicker
                                /* @ts-ignore */
                                ranges={{
                                    [formatMessage({ id: 'analysis.7days' })]: [moment().subtract(6, 'days'), moment().startOf('day')],
                                    [formatMessage({ id: 'analysis.30days' })]: [moment().subtract(29, 'days'), moment().startOf('day')],
                                    [formatMessage({ id: 'analysis.60days' })]: [moment().subtract(59, 'days'), moment().startOf('day')],
                                    [formatMessage({ id: 'analysis.90days' })]: [moment().subtract(89, 'days'), moment().startOf('day')],
                                }}
                            />
                        </Form.Item>
                    </Form>
                </Col>
                <Col span={24}>
                    <Row style={{ marginTop: 12 }} align="middle">
                        {
                            (testType === 'functional' && showType === 'pass_rate') &&
                            <span className={styles.select_left_title}>Test Conf：</span>
                        }
                        {
                            (testType === 'functional' && showType === 'result_trend') &&
                            <span className={styles.select_left_title}>Test Case：</span>
                        }
                        {
                            testType !== 'functional' &&
                            <span className={styles.select_left_title}>
                                <FormattedMessage id="analysis.metric" />：
                            </span>
                        }
                        {
                            metricData &&
                            <Tooltip
                                title={
                                    showType === 'result_trend' ?
                                        metricData.sub_case_name : <SuiteConfMetric {...metricData} />
                                }
                                autoAdjustOverflow={true}
                                placement="bottomLeft"
                                color='#fff'
                                overlayInnerStyle={{ minWidth: 300, maxHeight: 300, overflowY: 'auto', color: "#333" }}
                            >
                                <span className={styles.select_inner_span}>
                                    {metricData.title}
                                </span>
                            </Tooltip>
                        }
                        <Button style={{ padding: 0, marginLeft: 8 }} type="link" onClick={handleSelectMertric}>
                            <FormattedMessage id="analysis.select" />
                        </Button>
                    </Row>
                </Col>
            </Row>
            <Row style={{ height: 10, background: 'rgba(0, 0, 0, 0.04)' }} />

            <Spin spinning={loading}>
                {
                    (testType === 'performance' && tableData?.length > 0) &&
                    Object.keys(chartData).map(
                        (i: any, idx: any) => {
                            return (
                                <ChartRender
                                    key={idx}
                                    testType={testType}
                                    provider={provider}
                                    title={i}
                                    dataSource={chartData[i]}
                                    showType={showType}
                                />
                            )
                        }
                    )
                }
                {
                    (testType !== 'performance' && tableData?.length > 0) &&
                    <ChartRender
                        testType={testType}
                        provider={provider}
                        showType={showType}
                        dataSource={chartData}
                    />
                }
                {
                    tableData?.length === 0 &&
                    <CardWrapper style={{ marginTop: 10, width: '100%' }} bordered={false}>
                        <Row style={{ height: innerHeight - 176 - 50 - 120 }} justify="center" align="middle">
                            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                        </Row>
                    </CardWrapper>
                }
                {
                    tableData?.length > 0 &&
                    <AnalysisTable
                        refresh={() => fetchAnalysis(metricData)}
                        dataSource={tableData}
                        testType={testType}
                        showType={showType}
                    />
                }
            </Spin>

            <SelectMertric
                ref={selectMetricRef}
                projectId={projectId}
                showType={showType}
                test_type={testType}
                onOk={handleMerticSelectOk}
            />
        </>
    )
}

export default TabPaneCard