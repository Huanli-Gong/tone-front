/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react'
import { Tooltip, Typography } from 'antd'
import { QusetionIconTootip, ResultTdPopver, compareResultFontColor, compareResultSpan } from '../components'
import { queryCaseResultPerformance } from '../service'
import { useRequest, useAccess, Access, useParams, useIntl, FormattedMessage } from 'umi'
import qs from 'querystring'
import styles from './index.less'
import { targetJump } from '@/utils/utils'
import { ResizeHooksTable } from '@/utils/table.hooks';
import EllipsisPulic from '@/components/Public/EllipsisPulic';
import { ColumnEllipsisText } from '@/components/ColumnComponents'
import { MetricSelectProvider } from '.'

export default (props: any) => {
    const { formatMessage } = useIntl()
    const { test_case_id, suite_id, state: compare_result, refreshId, setRefreshId, testType } = props
    const { id: job_id, ws_id } = useParams() as any
    const { setOSuite, oSuite } = React.useContext(MetricSelectProvider)
    const { data = [], run, loading } = useRequest(
        () => queryCaseResultPerformance({ ws_id, job_id, case_id: test_case_id, suite_id, compare_result }),
        { manual: true }
    )

    const access = useAccess()
    const $test_type = ["performance", "性能测试"].includes(testType) ? "performance" : "functional"

    useEffect(() => {
        if (refreshId && refreshId === test_case_id) {
            run()
            setTimeout(() => {
                setRefreshId(null)
            }, 300)
        }
        if (!refreshId)
            run()
    }, [compare_result])

    const strLocals = formatMessage({ id: 'ws.result.details.threshold' })
    const columns: any = [
        {
            // title : 'Metric',
            title: <FormattedMessage id="ws.result.details.metric" />,
            dataIndex: 'metric',
            ellipsis: {
                shwoTitle: false,
            },
            render: (_: any) => (
                _ ?
                    <Tooltip placement="topLeft" title={_}>
                        {_}
                    </Tooltip> :
                    '-'
            ),
        },
        {
            title: (
                <QusetionIconTootip
                    placement="bottomLeft"
                    title={<FormattedMessage id="ws.result.details.test.result" />}
                    desc={<FormattedMessage id="ws.result.details.test.result.view.log.file" />}
                />
            ),
            dataIndex: 'test_value',
            ellipsis: {
                shwoTitle: false,
            },
            width: 200,
            render: (_: any, row: any) => (
                <ResultTdPopver
                    {...row}
                    title={formatMessage({ id: 'ws.result.details.compared.results' })}
                />
            )
        },
        {
            title: <QusetionIconTootip title={<FormattedMessage id="ws.result.details.baseline_value" />} desc="AVG ± CV" />,
            dataIndex: 'baseline_value',
            width: 120,
            ellipsis: {
                shwoTitle: false,
            },
            render: (_: any, row: any) => {
                return (
                    (_ && row.baseline_cv_value) ?
                        <Access accessible={access.IsWsSetting()} >
                            <Typography.Link
                                onClick={() => {
                                    if (row.skip_baseline_info) {
                                        const $test_type = ["performance", "性能测试"].includes(testType) ? "performance" : "functional"
                                        targetJump(`/ws/${ws_id}/baseline/${$test_type}?${qs.stringify(row.skip_baseline_info)}`)
                                    }
                                }}
                            >
                                <EllipsisPulic title={`${_}±${row.baseline_cv_value}`} />
                            </Typography.Link>
                        </Access> :
                        '-'
                )
            }
        },
        {
            dataIndex: 'description',
            width: 130,
            title: (
                <QusetionIconTootip
                    placement="bottomLeft"
                    title={formatMessage({ id: 'ws.result.details.baseline.description' })}
                    desc={formatMessage({ id: 'ws.result.details.baseline.description.ps' })}
                />
            ),
            ellipsis: true,
            render: (_: any, row: any) => {
                let context = row.description
                const localeStr = formatMessage({ id: 'ws.result.details.match.baseline' })
                if (row.match_baseline && row.result === 'Fail')
                    context = _ ? `${_}(${localeStr})` : localeStr
                if (!context) return "-"
                if (access.IsWsSetting())
                    return (
                        <Tooltip placement="topLeft" title={context}>
                            {
                                row.skip_baseline_info ?
                                    <Typography.Link
                                        href={`/ws/${ws_id}/baseline/${$test_type}?${qs.stringify(row.skip_baseline_info)}`}
                                    >
                                        {context || '-'}
                                    </Typography.Link> :
                                    context || '-'
                            }
                        </Tooltip >
                    )
                return (<ColumnEllipsisText ellipsis={{ tooltip: true }}>{context || '-'}</ColumnEllipsisText>)
            }
        },
        {
            title: <FormattedMessage id="ws.result.details.compared.results" />,
            dataIndex: 'compare_result',
            width: 120,
            ellipsis: true,
            render: (_: any, row: any) => (
                _ ?
                    <span style={{ color: compareResultFontColor(row.compare_result) }}>{_}</span> :
                    '-'
            )
        },
        {
            title: <QusetionIconTootip title={strLocals} desc={`AVG ${strLocals} / CV ${strLocals}`} />,
            dataIndex: 'threshold',
            width: 120,
            ellipsis: {
                shwoTitle: false,
            },
            render: (_: any) => (
                _ ? <EllipsisPulic title={_} /> : '-'
            )
        },
        {
            title: <FormattedMessage id="ws.result.details.track_result" />,
            width: 120,
            dataIndex: "track_result",
            ellipsis: true,
            render: (_: any, row: any) => compareResultSpan(row.track_result, row.result, formatMessage)
        },
    ]

    const rowSelection: any = testType === 'performance' ? {
        columnWidth: 40,
        selectedRowKeys: oSuite?.[suite_id]?.[test_case_id],
        onChange: (keys: React.Key[]) => {
            setOSuite({
                ...oSuite,
                [suite_id]: {
                    ...(oSuite?.[suite_id] || {}),
                    [test_case_id]: keys
                }
            })
        }
    } : undefined

    React.useEffect(() => {
        if (data && Object.prototype.toString.call(oSuite?.[suite_id]?.[test_case_id]) === '[object Null]') {
            setOSuite({
                ...oSuite,
                [suite_id]: {
                    ...(oSuite?.[suite_id] || {}),
                    [test_case_id]: data.map((i: any) => i.id)
                }
            })
        }
    }, [oSuite, data])

    return (
        <ResizeHooksTable
            name="ws-result-metric-list"
            rowKey="id"
            loading={loading}
            pagination={false}
            rowSelection={rowSelection}
            size="small"
            className={`${styles.result_info_table_head} ${data?.length ? '' : styles.result_info_table_head_line}`}
            rowClassName={styles.result_info_table_row}
            dataSource={data}
            columns={columns}
            refreshDeps={[ws_id, strLocals, access]}
        />
    )
}