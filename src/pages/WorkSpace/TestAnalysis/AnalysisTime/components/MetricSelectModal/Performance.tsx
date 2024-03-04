/* eslint-disable react-hooks/exhaustive-deps */
import React from "react"
import { useIntl } from "umi"
import { Table, Row, Col, Select } from "antd"
import styles from '../index.less'
import { useAnalysisProvider } from "../../provider"

const Performance: React.FC<AnyType> = (props) => {
    const { suiteList, onChange, runGetMetrics, visible, basicValues } = props
    const { formatMessage } = useIntl()
    const { metrics = [] } = useAnalysisProvider()

    const [activeSuite, setActiveSuite] = React.useState<any>()
    const [activeConf, setActiveConf] = React.useState<any>()
    const [selectMetric, setSelectMetric] = React.useState<any>()

    React.useEffect(() => {
        if (suiteList?.length > 0) {
            if (basicValues) {
                const { test_suite_id, test_case_id } = basicValues
                if (test_suite_id && test_case_id) {
                    setActiveSuite(+ test_suite_id)
                    setActiveConf(+ test_case_id)
                    setSelectMetric(basicValues?.metric)
                }
            }
            else {
                const firstSuite = suiteList?.[0]
                if (firstSuite) {
                    setActiveSuite(firstSuite?.test_suite_id)
                    setActiveConf(firstSuite?.test_case_list?.[0]?.test_case_id)
                }
            }
        }

        return () => {
            setActiveConf(undefined)
            setActiveSuite(undefined)
            setSelectMetric([])
        }
    }, [basicValues, suiteList])

    React.useEffect(() => {
        if (!visible) {
            setSelectMetric([])
        }
    }, [visible])

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