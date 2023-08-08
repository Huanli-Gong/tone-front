/* eslint-disable react-hooks/exhaustive-deps */
import React from "react"
import { useIntl, useLocation } from "umi"
import { Table, Row, Col, Select } from "antd"
import styles from '../index.less'
import { useAnalysisProvider } from "../../provider"

const transMetric = (query: any) => {
    if (Object.prototype.toString.call(query?.metric) === "[object Array]") return query?.metric
    if (Object.prototype.toString.call(query?.metric) === "[object String]") return query?.metric?.split(",")
    return []
}

const Performance: React.FC<AnyType> = (props) => {
    const { suiteList, provider_env, onChange, basicValues, metrics, runGetMetrics } = props
    const { query }: any = useLocation()
    const { formatMessage } = useIntl()

    const getQueryValue = (queryName: any) => {
        if (JSON.stringify(query) !== '{}' && (query?.test_type !== "performance")) return undefined
        if (basicValues) return basicValues[queryName]
        if (provider_env === query?.provider_env && query[queryName]) return query[queryName]
        return undefined
    }

    const { setMetrics } = useAnalysisProvider()

    React.useEffect(() => {
        setMetrics(metrics)
    }, [metrics])

    const [activeSuite, setActiveSuite] = React.useState<any>(+ getQueryValue("test_suite_id") || undefined)
    const [activeConf, setActiveConf] = React.useState<any>(+ getQueryValue("test_case_id") || undefined)
    const [selectMetric, setSelectMetric] = React.useState<any>(getQueryValue("metric") || transMetric(query))

    React.useEffect(() => {
        if (suiteList?.length > 0) {
            const tsi = getQueryValue("test_suite_id")
            const tci = getQueryValue("test_case_id")
            setActiveSuite(tsi ? + tsi : suiteList[0].test_suite_id)
            setActiveConf(tci ? + tci : undefined)
        }
    }, [suiteList, query])

    const currentSuite = React.useMemo(() => {
        if (!suiteList) return
        return suiteList.filter((i: any) => (i.test_suite_id === activeSuite))[0]
    }, [suiteList, activeSuite])

    React.useEffect(() => {
        if (activeConf && activeSuite) {
            runGetMetrics({ test_suite_id: activeSuite, test_case_id: activeConf })
        }
    }, [activeConf, activeSuite])

    React.useMemo(() => {
        if (!currentSuite) return
        const { test_case_list } = currentSuite

        const rl = activeConf ? test_case_list.filter((i: any) => (i.test_case_id === activeConf))[0] : test_case_list[0]
        if (rl && !activeConf)
            setActiveConf(rl.test_case_id)
        return rl
    }, [currentSuite, activeConf])

    React.useEffect(() => {
        onChange?.({ activeSuite, activeConf, selectMetric })
    }, [activeSuite, activeConf, selectMetric])

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
                                    suiteList?.map((i: any) => ({
                                        value: i.test_suite_id,
                                        label: i.test_suite_name
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
                                    // requestMetricList({ test_suite_id: activeSuite, test_case_id })
                                }}
                                filterOption={(input, option: any) =>
                                    option.label?.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                }
                                showSearch
                                placeholder="请选择Test Conf"
                                value={activeConf}
                                options={
                                    currentSuite?.test_case_list?.map((i: any) => ({
                                        value: i.test_case_id,
                                        label: i.test_case_name
                                    }))
                                }
                            />
                        </Row>
                    </Col>
                </Row>
            </Col>
            <Col span={24} style={{ height: 350 }}>
                <Table
                    dataSource={metrics}
                    columns={[{ dataIndex: '', title: formatMessage({ id: 'analysis.metric' }) }]}
                    rowKey={record => record}
                    size="small"
                    scroll={{ y: 320 }}
                    // loading={fetch}
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