/* eslint-disable react-hooks/exhaustive-deps */
import React from "react"
import { useIntl, useLocation } from "umi"
import { Table, Row, Col, Select } from "antd"
import lodash from 'lodash'
import { queryPerfomanceMetrics } from '../../services'
import styles from '../index.less'
import { useAnalysisProvider } from "../../provider"

const transMetric = (query: any) => {
    if (Object.prototype.toString.call(query?.metric) === "[object Array]") return query?.metric
    if (Object.prototype.toString.call(query?.metric) === "[object String]") return query?.metric?.split(",")
    return []
}

const Performance: React.FC<AnyType> = (props) => {
    const { suiteList, projectId, test_type, provider_env, onChange } = props
    const { query }: any = useLocation()
    const { formatMessage } = useIntl()

    const getQueryValue = (queryName: any) => {
        if (test_type === "performance" && provider_env === query?.provider_env && query[queryName]) {
            return query[queryName]
        }
        return undefined
    }

    const { setMetrics } = useAnalysisProvider()

    const [activeSuite, setActiveSuite] = React.useState<any>(+ getQueryValue("test_suite_id") || undefined)
    const [activeConf, setActiveConf] = React.useState<any>(+ getQueryValue("test_case_id") || undefined)
    const [metricList, setMetricList] = React.useState<any>([])
    const [selectMetric, setSelectMetric] = React.useState<any>(transMetric(query))
    const [fetch, setFetch] = React.useState(false)

    React.useEffect(() => {
        if (suiteList.length > 0)
            setActiveSuite(+ getQueryValue("test_suite_id") || suiteList?.[0].id)
    }, [suiteList, query])

    const requestMetricList = lodash.debounce(
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

    React.useEffect(() => {
        setMetrics(metricList)
    }, [metricList])

    const confList = React.useMemo(() => {
        for (let len = suiteList.length, i = 0; i < len; i++)
            if (suiteList[i].id === activeSuite) {
                if (suiteList[i].test_case_list.length > 0) {
                    const test_case_id = activeConf || suiteList[i].test_case_list[0].id
                    requestMetricList({ test_suite_id: suiteList[i].id, test_case_id })

                    if (!activeConf)
                        setActiveConf(test_case_id)
                    return suiteList[i].test_case_list
                }
                return []
            }
        return []
    }, [activeSuite, suiteList, test_type])

    React.useEffect(() => {
        onChange?.({ activeSuite, activeConf, metricList, selectMetric })
    }, [activeSuite, activeConf, metricList, selectMetric])

    return (
        <Row style={{ height: 400 }}>
            <Col span={24} style={{ marginBottom: 10 }}>
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
                                }}
                                placeholder="请选择Test Suite"
                                value={activeSuite}
                                filterOption={(input, option: any) =>
                                    option.label?.toLowerCase().indexOf(input.toLowerCase()) >= 0
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
                                    requestMetricList({ test_suite_id: activeSuite, test_case_id })
                                }}
                                filterOption={(input, option: any) =>
                                    option.label?.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                }
                                showSearch
                                placeholder="请选择Test Conf"
                                value={activeConf}
                                options={
                                    confList.map((i: any) => ({
                                        value: i.id,
                                        label: i.name
                                    }))
                                }
                            />
                        </Row>
                    </Col>
                </Row>
            </Col>
            <Col span={24} style={{ height: 350 }}>
                <Table
                    dataSource={metricList}
                    columns={[{ dataIndex: '', title: formatMessage({ id: 'analysis.metric' }) }]}
                    rowKey={record => record}
                    size="small"
                    scroll={{ y: 320 }}
                    loading={fetch}
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
            </Col>
        </Row>
    )
}

export default Performance