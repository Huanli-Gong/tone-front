/* eslint-disable react-hooks/exhaustive-deps */
import React from "react"
import { Table, Row, Select, Col } from "antd"
import styles from '../index.less'

const FunctionalPassRate: React.FC<AnyType> = (props) => {
    const { suiteList = [], test_type, isFetching, onChange, basicValues } = props

    const [activeSuite, setActiveSuite] = React.useState<any>(undefined)
    const [activeConf, setActiveConf] = React.useState<any>(undefined)

    React.useEffect(() => {
        if (suiteList?.length > 0) {
            if (basicValues) {
                const { test_suite_id, test_case_id } = basicValues
                if (test_suite_id && test_case_id) {
                    setActiveSuite(+ test_suite_id)
                    setActiveConf(+ test_case_id)
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
            setActiveSuite(undefined)
            setActiveConf(undefined)
        }
    }, [suiteList, basicValues])

    React.useEffect(() => {
        onChange?.({ activeSuite, activeConf })
    }, [activeSuite, activeConf])

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
        <Row style={{ height: 400 }}>
            <Col span={24} style={{ marginBottom: 10 }}>
                <Row align="middle">
                    <span style={{ width: 76, display: 'inline-block' }} >Test Suite:</span>
                    <Select
                        style={{ width: 'calc(100% - 91px - 8px)' }}
                        onChange={(v) => {
                            setActiveSuite(v)
                            setActiveConf(null)
                        }}
                        filterOption={(input, option: any) =>
                            option.label?.toLowerCase().indexOf(input?.toLowerCase()) >= 0
                        }
                        showSearch
                        placeholder="请选择Test Suite"
                        value={activeSuite}
                        options={
                            suiteList?.map((i: any) => ({
                                value: i.test_suite_id,
                                label: i.test_suite_name
                            }))
                        }
                    />
                </Row>
            </Col>
            <Col span={24} style={{ height: 350 }}>
                <Table
                    dataSource={confList}
                    columns={[{ dataIndex: 'test_case_name', title: 'Test Conf' }]}
                    rowKey={'test_case_id'}
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
                                setActiveConf(record.test_case_id)
                            }
                        })
                    }
                    pagination={false}
                />
            </Col>
        </Row>
    )
}

export default FunctionalPassRate