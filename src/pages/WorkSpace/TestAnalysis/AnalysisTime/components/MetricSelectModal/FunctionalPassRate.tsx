/* eslint-disable react-hooks/exhaustive-deps */
import React from "react"
import { Table, Row, Select, Col } from "antd"
import styles from '../index.less'
import { useLocation } from "umi"

const FunctionalPassRate: React.FC<AnyType> = (props) => {
    const { suiteList, test_type, isFetching, onChange, basicValues } = props
    const { query }: any = useLocation()

    const getQueryValue = (queryName: any) => {
        if (query?.test_type !== "functional") return undefined
        if (basicValues) return basicValues[queryName]
        if (query[queryName]) return query[queryName]
        return undefined
    }

    const [activeSuite, setActiveSuite] = React.useState<any>(+ getQueryValue("test_suite_id") || undefined)
    const [activeConf, setActiveConf] = React.useState<any>(+ getQueryValue("test_case_id") || undefined)

    React.useEffect(() => {
        if (suiteList.length > 0)
            setActiveSuite(+ getQueryValue("test_suite_id") || suiteList?.[0].id)
    }, [suiteList, query])

    React.useEffect(() => {
        onChange?.({ activeSuite, activeConf })
    }, [activeSuite, activeConf])

    const confList = React.useMemo(() => {
        for (let len = suiteList.length, i = 0; i < len; i++)
            if (suiteList[i].id === activeSuite) {
                if (suiteList[i].test_case_list.length > 0) {
                    const test_case_id = activeConf || suiteList[i].test_case_list[0].id
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
                            suiteList.map((i: any) => (
                                {
                                    value: i.id,
                                    label: i.name
                                }
                            ))
                        }
                    />
                </Row>
            </Col>
            <Col span={24} style={{ height: 350 }}>
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
            </Col>
        </Row>
    )
}

export default FunctionalPassRate