/* eslint-disable @typescript-eslint/no-unused-expressions */
import { forwardRef, useImperativeHandle, useState, useCallback, useMemo, useEffect } from 'react'
import { Modal, Row, Space, Button, Col, Spin, Select, Table } from 'antd'

import { useRequest, useLocation, useParams, useIntl, FormattedMessage } from 'umi'
import { queryTestSuiteCases, queryPerfomanceMetrics, queryFunctionalSubcases } from '../services'
import _ from 'lodash'
import styles from './index.less'

export default forwardRef(
    (props: any, ref: any) => {
        const { formatMessage } = useIntl()
        const { ws_id } = useParams() as any
        const { query }: any = useLocation()
        const { test_type, projectId, onOk, show_type } = props

        const [visible, setVisible] = useState(false)
        const [activeSuite, setActiveSuite] = useState<any>(undefined)
        const [activeConf, setActiveConf] = useState<any>(undefined)
        const [selectMetric, setSelectMetric] = useState<any>([])
        const [selectSubcase, setSelectSubcase] = useState<any>(undefined)
        const [metricList, setMetricList] = useState<any>([])

        const [fetch, setFetch] = useState(false)

        const { data: suiteList, loading, run: requestSuiteList } = useRequest(
            () => queryTestSuiteCases({ test_type, ws_id, page_num: 1, page_size: 200 }),
            { initialData: [], manual: true }
        )

        useEffect(() => {
            requestSuiteList()
        }, [ws_id, test_type, requestSuiteList])

        const requestMetricList = _.debounce(
            async (params: any) => {
                setFetch(true)
                params.project_id = projectId || query.project_id
                const { data: list } = await queryPerfomanceMetrics(params)
                setMetricList(list || [])
                setFetch(false)
            },
            500,
            { trailing: true }
        )

        /**
         * 项目切换后，需要重新发起请求
         */
        useEffect(() => {
            if (projectId && activeSuite && activeConf) {
                requestMetricList({ test_suite_id: activeSuite, test_case_id: activeConf })
            }
        }, [activeConf, activeSuite, projectId, requestMetricList])

        const { data: subcaseList, run: requestSubcaseList, loading: subcaseFetching } = useRequest(
            queryFunctionalSubcases,
            { manual: true, initialData: [] }
        )

        const isFetching = useMemo(() => {
            return loading || fetch || subcaseFetching
        }, [loading, fetch, subcaseFetching])

        const handleReset = () => {
            setSelectMetric([])
            setSelectSubcase([])
            setMetricList([])
            setActiveSuite(undefined)
            setActiveConf(undefined)
        }

        useImperativeHandle(ref, () => ({
            show: async () => {
                setVisible(true)

                if (!activeSuite && suiteList.length > 0) {
                    setActiveSuite(suiteList[0].id)
                }
            },
            reset: handleReset
        }))

        useEffect(() => {
            if (query && JSON.stringify(query) !== '{}' && suiteList.length > 0) {
                const { test_suite_id, test_case_id, metric, test_type: testType } = query
                if (test_type === testType) {
                    if (test_suite_id)
                        setActiveSuite(+test_suite_id || null)
                    if (test_case_id) {
                        setActiveConf(+test_case_id || null)
                        // requestMetricList({ test_suite_id, test_case_id }) //请求metriclist
                        setSelectMetric(_.isArray(metric) ? metric : [metric])
                    }
                }
            }
        }, [query, suiteList, test_type])

        const confList = useMemo(() => {
            for (let len = suiteList.length, i = 0; i < len; i++)
                if (suiteList[i].id === activeSuite) {
                    if (suiteList[i].test_case_list.length > 0) {
                        const test_case_id = activeConf || suiteList[i].test_case_list[0].id
                        if (test_type === 'performance')
                            requestMetricList({ test_suite_id: suiteList[i].id, test_case_id })
                        if (test_type !== 'performance' && show_type !== 'pass_rate')
                            requestSubcaseList({ test_case_id, test_suite_id: activeSuite })
                        !activeConf && setActiveConf(test_case_id)
                        return suiteList[i].test_case_list
                    }
                    return []
                }
            return []
        }, [activeConf, activeSuite, requestMetricList, requestSubcaseList, show_type, suiteList, test_type])

        const selectSuiteName = useMemo(() => {
            for (let len = suiteList.length, i = 0; i < len; i++)
                if (suiteList[i].id === activeSuite)
                    return suiteList[i].name
            return
        }, [suiteList, activeSuite])

        const selectConfName = useMemo(() => {
            for (let len = confList.length, i = 0; i < len; i++)
                if (confList[i].id === activeConf)
                    return confList[i].name
            return
        }, [confList, activeConf])

        const title = useMemo(() => {
            if (test_type === 'performance')
                return `Metric${selectMetric.length ? `(${selectMetric.length})` : ''}`
            return show_type === 'pass_rate' ? 'Test Conf' : 'Test Case'
        }, [test_type, show_type, selectMetric])

        const handleClose = useCallback(() => {
            setVisible(false)
        }, [])

        const handleOk = (): any => {
            const params: any = { test_suite_id: activeSuite }
            if (test_type === 'performance') {
                params.test_case_id = activeConf
                params.metric = selectMetric
                params.title = `${selectSuiteName}/${selectConfName}`///${ selectMetric.toString() }
            }

            if (test_type === 'functional') {
                params.test_case_id = activeConf
                params.title = `${selectSuiteName}/${selectConfName}`
                if (show_type !== 'pass_rate') {
                    params.sub_case_name = selectSubcase[0]
                    params.test_case_id = activeConf
                    params.title = `${selectSuiteName}/${selectConfName}` ///${ selectSubcase.toString() }
                }
            }

            onOk(params)
            handleClose()
        }

        const canSubmit = useMemo(() => {
            if (test_type === 'performance')
                return selectMetric.length > 0
            if (show_type !== 'pass_rate')
                return selectSubcase && selectSubcase.length > 0
            return activeConf || false
        }, [selectMetric, selectSubcase, test_type, activeConf, show_type])

        return (
            <Modal
                title={title}
                width={940}
                open={visible}
                onCancel={handleClose}
                footer={
                    <Space>
                        <Button onClick={handleClose}><FormattedMessage id="operation.cancel" /></Button>
                        <Button type="primary" onClick={handleOk} disabled={!canSubmit}><FormattedMessage id="operation.ok" /></Button>
                    </Space>
                }
            >
                <Spin spinning={loading}>
                    <Row style={{ height: 400 }}>
                        <Col span={24} style={{ marginBottom: 10 }}>
                            {
                                (test_type === 'performance' || show_type !== 'pass_rate') &&
                                <Row>
                                    <Col span={12}>
                                        <Row align="middle">
                                            <span style={{ width: 76, display: 'inline-block' }} >Test Suite:</span>
                                            <Select
                                                style={{ width: 'calc(100% - 91px - 8px)' }}
                                                onChange={(v) => {
                                                    setMetricList([])
                                                    setActiveSuite(v)
                                                    setActiveConf(null)
                                                    setSelectMetric([])
                                                    setSelectSubcase([])
                                                }}
                                                placeholder="请选择Test Suite"
                                                value={activeSuite}
                                                filterOption={(input, option: any) =>
                                                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                                }
                                                showSearch
                                                options={
                                                    suiteList.map((i: any) => ({
                                                        value: i.id,
                                                        label: i.name
                                                    }))
                                                }
                                            />
                                        </Row>
                                    </Col>
                                    <Col span={12}>
                                        <Row align="middle">
                                            <span style={{ width: 76, display: 'inline-block' }} >Test Conf:</span>
                                            <Select
                                                style={{ width: 'calc(100% - 91px - 8px)' }}
                                                onChange={(test_case_id) => {
                                                    setActiveConf(test_case_id)
                                                    setSelectMetric([])
                                                    if (test_type === 'performance')
                                                        requestMetricList({ test_suite_id: activeSuite, test_case_id })
                                                    if (test_type !== 'performance' && show_type !== 'pass_rate')
                                                        requestSubcaseList({ test_case_id, test_suite_id: activeSuite })
                                                    setSelectSubcase([])
                                                }}
                                                filterOption={(input, option: any) =>
                                                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                                }
                                                showSearch
                                                placeholder="请选择Test Conf"
                                                value={activeConf}
                                            >
                                                {
                                                    confList.map((i: any) => (
                                                        <Select.Option
                                                            key={i.id}
                                                            value={i.id}
                                                        >
                                                            {i.name}
                                                        </Select.Option>
                                                    ))
                                                }
                                            </Select>
                                        </Row>
                                    </Col>
                                </Row>
                            }
                            {
                                (test_type === 'functional' && show_type === 'pass_rate') &&
                                <Row align="middle">
                                    <span style={{ width: 76, display: 'inline-block' }} >Test Suite:</span>
                                    <Select
                                        style={{ width: 'calc(100% - 91px - 8px)' }}
                                        onChange={(v) => {
                                            setActiveSuite(v)
                                            setActiveConf(null)
                                        }}
                                        filterOption={(input, option: any) =>
                                            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                        }
                                        showSearch
                                        placeholder="请选择Test Suite"
                                        value={activeSuite}
                                    >
                                        {
                                            suiteList.map((i: any) => (
                                                <Select.Option
                                                    key={i.id}
                                                    value={i.id}
                                                >
                                                    {i.name}
                                                </Select.Option>
                                            ))
                                        }
                                    </Select>
                                </Row>
                            }
                        </Col>
                        <Col span={24} style={{ height: 350 }}>
                            {
                                test_type === 'performance' &&
                                <Table
                                    dataSource={metricList}
                                    columns={[{ dataIndex: '', title: formatMessage({ id: 'analysis.metric' }) }]}
                                    rowKey={record => record}
                                    size="small"
                                    scroll={{ y: 320 }}
                                    loading={isFetching}
                                    rowSelection={{
                                        selectedRowKeys: selectMetric,
                                        onChange: (list: any) => {
                                            setSelectMetric(list)
                                        }
                                    }}
                                    onRow={
                                        record => ({
                                            onClick: () => {
                                                if (selectMetric.includes(record)) {
                                                    setSelectMetric(selectMetric.filter((i: any) => i !== record))
                                                }
                                                else
                                                    setSelectMetric(selectMetric.concat(record))
                                            }
                                        })
                                    }
                                    className={styles.selectTable}
                                    pagination={false}
                                />
                            }
                            {
                                (test_type === 'functional' && show_type === 'pass_rate') &&
                                <Table
                                    dataSource={confList}
                                    columns={[{ dataIndex: 'name', title: 'Test Conf' }]}
                                    rowKey={'id'}
                                    size="small"
                                    loading={isFetching}
                                    scroll={{ y: 320 }}
                                    className={styles.selectTable}
                                    rowSelection={{
                                        type: 'radio',
                                        selectedRowKeys: [activeConf],
                                        onChange: (list: any) => setActiveConf(list[0])
                                    }}
                                    onRow={
                                        record => ({
                                            onClick: () => {
                                                setActiveConf(record.id)
                                            }
                                        })
                                    }
                                    pagination={false}
                                />
                            }
                            {
                                (test_type === 'functional' && show_type !== 'pass_rate') &&
                                <Table
                                    dataSource={subcaseList}
                                    columns={[{ dataIndex: '', title: 'Test Case' }]}
                                    rowKey={record => record}
                                    size="small"
                                    loading={isFetching}
                                    scroll={{ y: 320 }}
                                    className={styles.selectTable}
                                    rowSelection={{
                                        type: 'radio',
                                        selectedRowKeys: selectSubcase,
                                        onChange: (list: any) => setSelectSubcase(list)
                                    }}
                                    onRow={
                                        record => ({
                                            onClick: () => {
                                                setSelectSubcase([record])
                                            }
                                        })
                                    }
                                    pagination={false}
                                />
                            }
                        </Col>
                    </Row>
                </Spin>
            </Modal>
        )
    }
)