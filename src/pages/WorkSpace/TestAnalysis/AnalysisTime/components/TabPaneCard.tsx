/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useRef, useEffect } from 'react'
import { Row, Col, Form, Select, DatePicker, Button, Tooltip, message, Descriptions, Space } from 'antd'
import moment from 'moment'
import { useRequest, useLocation, useParams, useIntl, FormattedMessage } from 'umi'
import styled from 'styled-components'
import AnalysisTable from './Table'

import ChartRender from './RenderChart'
import { queryProjectList, queryPerfAnalysisList, queryFuncAnalysisList } from '../services';
import { tagList as queryJobTagList } from "@/pages/WorkSpace/TagManage/service"
import SelectMertric from "./MetricSelectModal/layouts"
import styles from './index.less'
import { QuestionCircleOutlined } from '@ant-design/icons'

import ClusterChart from './PerformanceCharts/Cluster'
import StandaloneChart from './PerformanceCharts/Standalone'
import EmptyComp from "./EmptyComp"
import LoadingComp from './Loading'
import { v4 as uuid } from 'uuid'

const TootipTipRow = styled(Row)`
    position:relative;
    width:100%;
    .tootip_pos {
        position:absolute;
        left:330px;
        top:4px;
    }
`
const fontStyle = {
    fontWeight: 'bold'
}

const SuiteConfMetric = (props: any) => {
    const str = props.title?.split('/')

    return (
        <div style={{ color: '#000' }}>
            <Descriptions column={1}>
                <Descriptions.Item
                    label="Suite"
                    labelStyle={{ ...fontStyle, paddingLeft: 10 }}
                >
                    {str?.[0]}
                </Descriptions.Item>
                <Descriptions.Item
                    label="Conf"
                    labelStyle={{ ...fontStyle, paddingLeft: 12 }}
                >
                    {str?.[1]}
                </Descriptions.Item>
                <Descriptions.Item
                    label="Metric"
                    contentStyle={{ display: 'inline-block', paddingBottom: 8 }}
                    labelStyle={{ ...fontStyle }}
                >
                    {
                        props?.metric?.map(
                            (item: any) => (
                                <div key={item}>{item}</div>
                            )
                        )
                    }
                </Descriptions.Item>
            </Descriptions>
        </div>
    )
}

const TabPaneCard: React.ForwardRefRenderFunction<AnyType, AnyType> = (props, ref) => {
    const { formatMessage } = useIntl()
    const { ws_id } = useParams() as any
    const { query }: any = useLocation()
    const { info, setInfo } = props
    const { show_type, provider_env, test_type } = info
    const [chartData, setChartData] = useState<any>({})
    const [tableData, setTableData] = useState<any>([])
    const [metricData, setMetricData] = useState<any>(null)
    const [loading, setLoading] = useState(JSON.stringify(query) !== "{}")
    const [fetchData, setFetchData] = React.useState<any[]>([])

    const selectMetricRef: any = useRef()
    const [form] = Form.useForm()

    const project_id = Form.useWatch("project_id", form)
    const tag_id = Form.useWatch("tag", form)
    const form_time = Form.useWatch("time", form)

    React.useImperativeHandle(ref, () => ({
        reset() {
            form.resetFields()
            setMetricData(undefined)
        }
    }))

    const { data: tagList } = useRequest(
        (params = { ws_id, page_size: 999 }) => queryJobTagList(params),
        { initialData: [] } /* , manual: true */
    )
    const { data: projectList } = useRequest(() => queryProjectList({ ws_id, page_size: 500 }), { initialData: [] })

    const requestAnalysisData = async (params: any) => {
        setInfo(params)
        setLoading(true)
        setTableData([])
        setChartData({})

        const { data, code } = test_type === 'performance' ?
            await queryPerfAnalysisList(params) :
            await queryFuncAnalysisList(params)
        setLoading(false)

        if (code !== 200) return
        if (!data) return

        const { job_list, metric_map, case_map } = data
        if (job_list && job_list.length > 0) {
            setChartData(test_type === 'performance' ? metric_map : case_map)
            setTableData(job_list)
            return
        }
    }

    const handleSelectMertric = () => {
        if (form.getFieldValue('project_id')) {
            selectMetricRef.current.show(metricData)
        } else {
            message.error(formatMessage({ id: 'analysis.selected.error' }))
        }
    }

    const getAnalysisFormData = () => {
        const params: any = test_type === 'functional' ? { show_type } : { provider_env }
        const values = form.getFieldsValue()
        const { time, ...rest } = values

        if (time && time.length > 0) {
            const [start_time, end_time] = time
            params.start_time = moment(start_time).format('YYYY-MM-DD')
            params.end_time = moment(end_time).format('YYYY-MM-DD')
        }

        return {
            ...params,
            ...rest
        }
    }

    const fetchAnalysis = (data: any) => {
        const { test_suite_id, test_case_id } = data
        const params = getAnalysisFormData()
        const { project_id } = params
        if (project_id && test_suite_id && test_case_id) {
            requestAnalysisData({
                ...params,
                ...data,
            })
        }
    }

    React.useEffect(() => {
        const baseFormData = getAnalysisFormData()
        const obj = { ...baseFormData, ...metricData, metric: metricData?.metric?.toString() }
        if (fetchData?.length !== 0) {
            fetchData?.forEach(({ metric }: any) => {
                const $name = metric.at(0)
                obj[$name] = metric.toString()
            })
        }
        setInfo(obj)
    }, [fetchData, metricData])

    const handleMerticSelectOk = (data: any) => {
        setMetricData(data)
        if (test_type !== "performance")
            fetchAnalysis(data)
        else {
            const { metric } = data
            const params = getAnalysisFormData()
            const metrics = metric.map((i: any) => ({ ...params, ...data, metric: [i], key: uuid() }))
            setTableData([])
            setFetchData(metrics)
        }
    }

    const handleFormChange = (_: any) => {
        if (_?.[0].name?.[0] === 'project_id') {
            setMetricData(null)
            setTableData([])
            setChartData(null)
            setFetchData([])
            return
        }
        const params = getAnalysisFormData()
        setTableData([])
        setChartData(null)
        // setMetricData(null)
        setFetchData([])
        if (metricData) {
            const { test_suite_id, test_case_id, metric } = metricData
            const { project_id } = params
            if (test_suite_id && test_case_id && project_id) {
                if (test_type === "performance") {
                    const metrics = metric.map((i: any) => ({ ...params, ...metricData, metric: [i], key: uuid() }))
                    setFetchData(metrics)
                    return
                }
                requestAnalysisData({
                    ...params,
                    ...metricData
                })
            }
        }
    }

    useEffect(() => {
        return () => {
            setChartData(null)
            setTableData([])
            setFetchData([])
        }
    }, [provider_env, show_type, test_type])

    useEffect(() => {
        if (query && JSON.stringify(query) !== '{}') {
            const {
                test_type: $test_type, project_id, tag, start_time, end_time, provider_env: $provider_env,
                metric, title, test_suite_id, test_case_id, sub_case_name, days
            } = query

            const $metric = Object.prototype.toString.call(metric) === "[object Array]" ? metric : metric?.split(",")

            if (test_type === $test_type) {
                const params: any = {
                    metric: $metric,
                    project_id, tag,
                    test_suite_id, test_case_id, sub_case_name,
                    show_type,
                    provider_env: $provider_env
                }

                let start = start_time
                let end = end_time || moment().format("YYYY-MM-DD")

                const hasNearDay = !isNaN(+ days) && Object.prototype.toString.call(+ days) === "[object Number]"

                if (hasNearDay) {
                    start = moment().subtract(days - 1, "days")
                    end = moment()
                }

                params.start_time = moment(start).format("YYYY-MM-DD")
                params.end_time = moment(end).format("YYYY-MM-DD")

                if (title) {
                    if (test_type !== "performance") {
                        setLoading(false)
                        requestAnalysisData(params)
                    }
                    else {
                        const metrics = $metric?.map((i: any) => ({
                            ...params,
                            metric: query[i] ? query[i]?.split(",") : [i],
                            key: uuid()
                        }))
                        setTableData([])
                        setFetchData(metrics)
                    }
                }
                if (!title) {
                    setLoading(false)
                }

                setMetricData({
                    title,
                    metric: $metric,
                    sub_case_name,
                    test_suite_id,
                    test_case_id
                })

                if (hasNearDay) {
                    form.setFieldsValue({ time: [moment(start), moment()] })
                }
                else if (start_time)
                    form.setFieldsValue({ time: [moment(start_time), end_time ? moment(end_time) : moment()] })

                form.setFieldsValue({
                    project_id: + project_id || undefined,
                    tag: + tag || '',
                })
            }
        }
    }, [])

    const handleListChange = (list: any[]) => {
        setTableData((p: any) => {
            const ids = list.map(((i: any) => i.id))
            return p.filter((i: any) => !ids.includes(i.id)).concat(list).sort((a: any, b: any) => b.id - a.id)
        })
    }

    return (
        <div style={{ width: "100%", background: "rgba(0, 0, 0, 0.04)", position: "relative" }} >
            {
                loading &&
                <LoadingComp />
            }

            <Row style={{ padding: '0 20px 10px', background: '#fff', marginBottom: 10 }}>
                <Col span={24}>
                    <Form
                        layout="inline"
                        form={form}
                        colon
                        onFieldsChange={handleFormChange}
                        className={styles.formInlineStyles}
                        wrapperCol={{ span: 20 }}
                        initialValues={{
                            time: [moment().subtract(29, 'days'), moment().startOf('day')],
                            tag: ''
                        }}
                    >
                        <Form.Item
                            label={<FormattedMessage id="analysis.project" />}
                            name="project_id"
                        >
                            <Select
                                placeholder={formatMessage({ id: 'analysis.project.placeholder' })}
                                showSearch
                                filterOption={(input, option: any) => option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                options={
                                    projectList.map((i: any) => ({
                                        value: i.id,
                                        label: i.name
                                    }))
                                }
                            />
                        </Form.Item>
                        <Form.Item label={<FormattedMessage id="analysis.tag" />}>
                            <TootipTipRow>
                                <Form.Item name="tag">
                                    <Select
                                        allowClear
                                        style={{ width: 330 }}
                                        placeholder={formatMessage({ id: 'analysis.tag.placeholder' })}
                                        showSearch
                                        filterOption={(input, option: any) => option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                        options={
                                            [{ value: "", label: formatMessage({ id: "analysis.indistinguishable" }) }].concat(
                                                tagList
                                                    .filter(({ creator }: any) => Object.prototype.toString.call(creator) === "[object Number]")
                                                    .map(
                                                        (i: any) => ({
                                                            value: i.id,
                                                            label: i.name
                                                        })
                                                    )
                                            )
                                        }
                                    />
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
                            (test_type === 'functional' && show_type === 'pass_rate') &&
                            <span className={styles.select_left_title}>Test Conf：</span>
                        }
                        {
                            (test_type === 'functional' && show_type === 'result_trend') &&
                            <span className={styles.select_left_title}>Test Case：</span>
                        }
                        {
                            test_type !== 'functional' &&
                            <span className={styles.select_left_title}>
                                <FormattedMessage id="analysis.metric" />：
                            </span>
                        }
                        {
                            metricData &&
                            <Tooltip
                                title={
                                    show_type === 'result_trend' ?
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

            {
                test_type === 'performance' &&
                <Row>
                    <Space style={{ width: "100%", background: "rgba(0, 0, 0, 0.04)" }} direction="vertical">
                        {
                            fetchData?.map((i: any) => {
                                const _props = {
                                    fetchData: i,
                                    key: i.key,
                                    provider_env,
                                    valueChange: handleListChange,
                                    setFetchData,
                                    setLoading
                                }

                                return (
                                    provider_env === "aliyun" ?
                                        <ClusterChart
                                            {..._props}
                                        /> :
                                        <StandaloneChart
                                            {..._props}
                                        />
                                )
                            })
                        }
                    </Space>
                </Row>
            }

            <Row>
                <Space style={{ width: "100%", background: "rgba(0, 0, 0, 0.04)" }} direction="vertical">
                    {
                        (test_type !== 'performance' && tableData?.length > 0) &&
                        <ChartRender
                            test_type={test_type}
                            provider_env={provider_env}
                            show_type={show_type}
                            dataSource={chartData}
                        />
                    }

                    {
                        tableData?.length === 0 &&
                        <EmptyComp />
                    }

                    {
                        tableData?.length > 0 &&
                        <AnalysisTable
                            refresh={() => {
                                if (test_type === "performance") {
                                    setFetchData((p: any) => p.map((i: any) => ({ ...i, key: uuid() })))
                                    return
                                }
                                fetchAnalysis(metricData)
                            }}
                            dataSource={tableData}
                            test_type={test_type}
                            show_type={show_type}
                        />
                    }
                </Space>
            </Row>

            <SelectMertric
                ref={selectMetricRef}
                project_id={project_id}
                start_time={form_time && moment(form_time[0]).format("YYYY-MM-DD")}
                end_time={form_time && moment(form_time[1]).format("YYYY-MM-DD")}
                tag={tag_id}
                show_type={show_type}
                provider_env={provider_env}
                test_type={test_type}
                onOk={handleMerticSelectOk}
            />

        </div>
    )
}

export default React.forwardRef(TabPaneCard)