/* eslint-disable react-hooks/exhaustive-deps */
import React from "react"
import { useLocation } from "umi"
import { Table, Row, Col, Select } from "antd"
import styles from '../index.less'

const FunctionalPassRate: React.FC<AnyType> = (props) => {
    const { suiteList = [], test_type, isFetching, show_type, onChange, basicValues, metrics = [], runGetMetrics } = props
    const { query }: any = useLocation()

    const getQueryValue = (queryName: any) => {
        if (JSON.stringify(query) !== '{}' && (query?.test_type !== "functional")) return undefined
        if (basicValues) return basicValues[queryName]
        if (query[queryName]) return query[queryName]
        return undefined
    }

    const [activeSuite, setActiveSuite] = React.useState<any>(+ getQueryValue("test_suite_id") || undefined)
    const [activeConf, setActiveConf] = React.useState<any>(+ getQueryValue("test_case_id") || undefined)
    const [selectSubcase, setSelectSubcase] = React.useState<any>(getQueryValue("sub_case_name") || undefined)

    React.useEffect(() => {
        if (suiteList.length > 0)
            setActiveSuite(+ getQueryValue("test_suite_id") || suiteList?.[0].test_suite_id)
    }, [suiteList, query])

    React.useEffect(() => {
        onChange?.({ activeSuite, activeConf, selectSubcase })
    }, [activeSuite, activeConf, selectSubcase])

    React.useEffect(() => {
        if (activeConf && activeSuite) {
            runGetMetrics({ test_suite_id: activeSuite, test_case_id: activeConf })
        }
    }, [activeConf, activeSuite])

    const confList = React.useMemo(() => {
        if (!suiteList) return []
        for (let len = suiteList.length, i = 0; i < len; i++)
            if (suiteList[i].test_suite_id === activeSuite) {
                if (suiteList[i].test_case_list.length > 0) {
                    const test_case_id = activeConf || suiteList[i].test_case_list[0].test_case_id
                    if (!activeConf)
                        setActiveConf(test_case_id)
                    return suiteList[i].test_case_list
                }
                return []
            }
        return []
    }, [activeSuite, suiteList, test_type])

    return (
        <Row >
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
                                    setSelectSubcase([])
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
                                    if (test_type !== 'performance' && show_type !== 'pass_rate')
                                        /* requestSubcaseList({ test_case_id, test_suite_id: activeSuite }) */
                                        setSelectSubcase([])
                                }}
                                filterOption={(input, option: any) =>
                                    option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                }
                                showSearch
                                placeholder="请选择Test Conf"
                                value={activeConf}
                                options={
                                    confList?.map((i: any) => (
                                        {
                                            value: i.test_case_id,
                                            label: i.test_case_name
                                        }
                                    ))
                                }
                            />
                        </Row>
                    </Col>
                </Row>
            </Col >
            <Col span={24}>
                <Table
                    dataSource={metrics}
                    columns={[{
                        dataIndex: '', title: 'Test Case',
                    }]}
                    /* @ts-ignore */
                    rowKey={record => record}
                    size="small"
                    loading={isFetching}
                    scroll={{ y: 320 }}
                    className={styles.selectTable}
                    rowSelection={{
                        type: 'radio',
                        selectedRowKeys: [selectSubcase],
                        onChange: (list: any) => {
                            setSelectSubcase(list?.[0])
                        }
                    }}
                    onRow={
                        record => ({
                            onClick: () => {
                                setSelectSubcase(record)
                            }
                        })
                    }
                    pagination={{
                        hideOnSinglePage: true,
                        pageSize: 2000,
                        style: { marginBottom: 0 }
                    }}
                />
            </Col>
        </Row >
    )
}

export default FunctionalPassRate