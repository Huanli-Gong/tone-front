import { Table, Layout, Spin, Row } from 'antd'
import React, { useState, useRef, useEffect, useMemo } from 'react'
import BaselineFailDetail from './BaselineFailDetail'
import { useLocation, FormattedMessage, useIntl } from 'umi'

import { queryBaselineDetail } from '../services'
import BaselineMetricDetail from './BaselineMetricDetail'
import styles from './index.less'
import _ from 'lodash'
import treeSvg from '@/assets/svg/tree.svg'

// 性能三级
export default (props: any) => {
    const { formatMessage } = useIntl()
    const { isOpen, setIsOpen } = props
    const { query }: any = useLocation()

    const background = `url(${treeSvg}) center center / 38.6px 32px `
    const { server_provider, test_type, id } = props.currentBaseline
    const PAGE_DEFAULT_PARAMS: any = { server_provider, test_type, baseline_id: id, test_suite_id: props.test_suite_id, server_sn: props.server_sn }  // 有用
    // 性能基线

    const hasQuery = useMemo(() => JSON.stringify(query) !== '{}', [query])

    const [expand, setExpand] = useState(!hasQuery)
    const [current, setCurrent] = useState({})
    const [data, setData] = useState<[]>([])
    const [loading, setLoading] = useState(true)

    const addScript: any = useRef(null)

    const columns = [{
        dataIndex: 'test_case_name',
        title: 'Test Conf',
        key: 'test_case_name',
        render: (text: any) => {
            return (
                <a className={styles.test_conf_href}>
                    {text}
                </a>
            )
        }
    }]

    const getThirdDetail = async (params: any) => {
        setLoading(true)
        let { data, code } = await queryBaselineDetail(params)
        if (code === 200) {
            setData(data)
            if (!isOpen && hasQuery) {
                for (let x = 0; x < data.length; x++) {
                    const testCase = data[x]
                    if (+ testCase.test_case_id === + query.test_case_id) {
                        setCurrent(testCase)
                        addScript.current?.show(
                            test_type === 'functional' ? formatMessage({id: 'pages.workspace.baseline.failDetail'}): formatMessage({id: 'pages.workspace.baseline.mertricDetail'}),
                            testCase
                        )
                        setLoading(false)
                        setExpand(true);
                        setIsOpen(true)
                        return
                    }
                }
            }
        }
        setLoading(false)
    }

    useEffect(() => {
        //props.test_suite_id, props.server_sn, server_provider, test_type, id
        getThirdDetail(PAGE_DEFAULT_PARAMS)
    }, [hasQuery])

    const twoLevelDetailData = data && Array.isArray(data) ? data : [];
    // const twoLevelDetailData = dataDetail && Array.isArray(dataDetail.data) ? dataDetail.data : [];

    return (
        <Layout.Content>
            <Spin spinning={loading}>
                <Row justify="start">
                    {
                        !loading &&
                        <div style={{ width: 32, background }} />
                    }
                    <div className={styles.baseline_detail_children}>
                        <Table
                            columns={columns}
                            dataSource={twoLevelDetailData} //  youyong
                            rowKey={'test_case_id'}
                            pagination={false}
                            size="small"
                            scroll={{ x: '100%' }}
                            onHeaderRow={column => {
                                return {
                                    onClick: () => { }, // 点击表头行
                                };
                            }}
                            onRow={(record: any) => {
                                return {
                                    onClick: () => {
                                        setExpand(!expand);
                                        setCurrent(record);
                                        addScript.current?.show(
                                            test_type === 'functional'? formatMessage({id: 'pages.workspace.baseline.failDetail'}): formatMessage({id: 'pages.workspace.baseline.mertricDetail'}), 
                                            record,
                                        )
                                    }, // 点击行
                                };
                            }}
                        />
                    </div>
                </Row>
                {
                    test_type === 'functional' &&
                    <BaselineFailDetail
                        {...props}
                        ref={addScript}
                        current={current}
                        secondRefresh={_.partial(getThirdDetail, PAGE_DEFAULT_PARAMS)}
                    />
                }
                {
                    test_type === 'performance' &&
                    <BaselineMetricDetail
                        {...props}
                        ref={addScript}
                        current={current}
                        secondRefresh={_.partial(getThirdDetail, PAGE_DEFAULT_PARAMS)}
                    />
                }
            </Spin>
        </Layout.Content>

    )
}
