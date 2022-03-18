import React, { useState, useRef, useEffect } from 'react'
import { Row, Col, Form, Select, DatePicker, Card, Button, Empty, Tooltip, message, Descriptions } from 'antd'
import moment from 'moment'
import { useRequest, useLocation } from 'umi'
import styled from 'styled-components'
import AnalysisTable from './Table'

import ChartRender from './RenderChart'
import { queryProjectList, queryTagList, queryPerfAnalysisList, queryFuncAnalysisList } from '../services';
import SelectMertric from './MetricSelectDrawer'
import styles from './index.less'
import _ from 'lodash'
import { QuestionCircleOutlined } from '@ant-design/icons'
// import { sourceData } from './SelectMertric_old'

const TootipTipRow = styled(Row)`
    position:relative;
    width:300px;
    .tootip_pos {
        position:absolute;
        left:300px;
        top:4px;
    }
`
const SuiteConfMetric = ( props:any ) => {
    let str = props.title.split('/')
    return(
        <div style={{ color: '#000' }}>
            <Descriptions column={1}>
                <Descriptions.Item label="Suite" labelStyle={{ paddingLeft:10,fontWeight:'bold' }}>{str[0]}</Descriptions.Item>
                <Descriptions.Item label="Conf" labelStyle={{ paddingLeft:12,fontWeight:'bold' }}>{str[1]}</Descriptions.Item>
                <Descriptions.Item label="Metric" contentStyle={{ display:'inline-block' }} labelStyle={{ fontWeight:'bold' }}>
                    { props.metric.map(
                        (item:any,i:number) => 
                            <div key={i}>{item}</div>)
                    }
                </Descriptions.Item>
            </Descriptions>
        </div>
    ) 
}
export default (props: any) => {
    const { query }: any = useLocation()
    const { ws_id, provider, testType, showType, onChange, setLoading, loading } = props
    // console.log( location )
    // const [ chartData , setChartData ] = useState<any>( sourceData.data.case_map )
    const [chartData, setChartData] = useState<any>({})
    const [tableData, setTableData] = useState<any>([])
    const [metricData, setMetricData] = useState<any>(null)
    const [projectId,setProjectId] = useState('')
    const selectMetricRef: any = useRef()
    const [form] = Form.useForm()

    const { data: tagList, run } = useRequest(queryTagList, { initialData: [], manual: true })
    const { data: projectList } = useRequest(() => queryProjectList({ ws_id }), { initialData: [] })

    const requestAnalysisData = async (params: any) => {
        onChange(params)
        setLoading(true)
        if (loading) return
        const { data, code } = testType === 'performance' ?
            await queryPerfAnalysisList(params) :
            await queryFuncAnalysisList(params)

        if (code === 200) {
            const { job_list, metric_map, case_map } = data
            if (job_list.length > 0) {
                setChartData(testType === 'performance' ? metric_map : case_map)
                setTableData(job_list)
            }
            else {
                setTableData([])
                setChartData({})
            }
        }
        else {
            setTableData([])
            setChartData({})
        }

        setLoading(false)
    }

    const handleSelectMertric = () => {
        if(form.getFieldValue('project_id')){
            selectMetricRef.current.show()
        } else {
            message.error('请先选择项目!!!')
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
        form.resetFields()
        setMetricData(null)
    }, [provider, showType, testType])

    useEffect(() => {
        if (query && JSON.stringify(query) !== '{}') {
            const {
                test_type, project_id, tag, start_time, end_time, provider_env,
                metric, title, test_suite_id, test_case_id, sub_case_name
            } = query

            if (test_type === testType) {
                project_id && run({ project_id })

                form.setFieldsValue({
                    project_id: + project_id || '',
                    tag: + tag || '',
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
        run({ project_id: val })
        setProjectId(val)
    }

    return (
        <>
            <Row style={{ padding: '0 20px 10px', background: '#fff' }}>
                <Col span={24}>
                    <Form
                        layout="inline"
                        form={form}
                        /*hideRequiredMark*/
                        colon
                        onFieldsChange={handleFormChange}
                        className={styles.formInlineStyles}
                    >
                        <Form.Item label="项目" name="project_id" >
                            <Select
                                style={{ width: 300 }}
                                placeholder="请选择项目"
                                onChange={handleProductChange}
                                showSearch
                                filterOption={(input, option: any) =>
                                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                }
                            >
                                {
                                    projectList.map((i: any) => (
                                        <Select.Option key={i.id} value={i.id}>{i.name}</Select.Option>
                                    ))
                                }
                            </Select>
                        </Form.Item>
                        <Form.Item label="标签" >
                            <TootipTipRow>
                                <Form.Item name="tag" initialValue="">
                                    <Select
                                        style={{ width: 300 }}
                                        allowClear
                                        placeholder="不按标签区分"
                                        showSearch
                                        filterOption={(input, option: any) =>
                                            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                        }
                                    >
                                        <Select.Option value="">不区分</Select.Option>
                                        {
                                            tagList.map((i: any) => (
                                                <Select.Option key={i.tag_id} value={i.tag_id}>{i.tag_name}</Select.Option>
                                            ))
                                        }
                                    </Select>
                                </Form.Item>
                                <div className="tootip_pos">
                                    <Tooltip
                                        overlayClassName={styles.table_question_tooltip}
                                        placement="top"
                                        arrowPointAtCenter
                                        title={'仅分析含有所选标签的Job数据，不区分标签。'}
                                    >
                                        <QuestionCircleOutlined style={{ color: 'rgba(0, 0, 0, 0.65)', marginLeft: 5 }} />
                                    </Tooltip>
                                </div>
                            </TootipTipRow>
                        </Form.Item>
                        <Form.Item
                            label="日期"
                            name="time"
                            initialValue={[moment().subtract(29, 'days'), moment().startOf('day')]}
                        >
                            <DatePicker.RangePicker
                                style={{ width: 240 }}
                                ranges={{
                                    '近7天': [moment().subtract(6, 'days'), moment().startOf('day')],
                                    '近30天': [moment().subtract(29, 'days'), moment().startOf('day')],
                                    '近60天': [moment().subtract(59, 'days'), moment().startOf('day')],
                                    '近90天': [moment().subtract(89, 'days'), moment().startOf('day')],
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
                            <span className={styles.select_left_title}>指标：</span>
                        }
                        {
                            metricData &&
                            <Tooltip
                                title={
                                    showType === 'result_trend' ?
                                        metricData.sub_case_name : <SuiteConfMetric {...metricData}/>
                                }
                                autoAdjustOverflow={true}
                                placement="bottomLeft"
                                color='rgb(252,252,252)'
                                overlayStyle={{ minWidth: 260 , maxHeight: 300, overflowY:'auto' }}
                            >
                                <span className={styles.select_inner_span}>
                                    {metricData.title}
                                </span>
                            </Tooltip>
                        }
                        <Button style={{ padding: 0, marginLeft: 8 }} type="link" onClick={handleSelectMertric}>选择</Button>
                    </Row>
                </Col>
            </Row>
            <Row style={{ height: 10, background: 'rgba(0, 0, 0, 0.04)' }} />
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
                <Card style={{ marginTop: 10, width: '100%' }}>
                    <Row style={{ height: innerHeight - 176 - 50 - 120 }} justify="center" align="middle">
                        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                    </Row>
                </Card>
            }
            {
                tableData?.length > 0 &&
                <AnalysisTable
                    ws_id={ws_id}
                    refresh={() => fetchAnalysis(metricData)}
                    dataSource={tableData}
                    testType={testType}
                    showType={showType}
                />
            }
            <SelectMertric
                ref={selectMetricRef}
                projectId={projectId}
                ws_id={ws_id}
                showType={showType}
                test_type={testType}
                query={query}
                onOk={handleMerticSelectOk}
            />
        </>
    )
}