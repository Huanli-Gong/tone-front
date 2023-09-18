/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from 'react'
import { Tooltip } from 'antd'
import { QusetionIconTootip, ResultTdPopver, compareResultFontColor, compareResultSpan } from '../components'
import { queryCaseResultPerformance } from '../service'
import { useRequest, useAccess, Access, useParams, useIntl, FormattedMessage } from 'umi'
import qs from 'querystring'
import styles from './index.less'
import { targetJump } from '@/utils/utils'
import { ResizeHooksTable } from '@/utils/table.hooks';
import EllipsisPulic from '@/components/Public/EllipsisPulic';

export default ({ test_case_id, suite_id, state: compare_result, refreshId, setRefreshId, testType }: any) => {
    const { formatMessage } = useIntl()
    const { id: job_id, ws_id } = useParams() as any

    const { data = [], run, loading } = useRequest(
        () => queryCaseResultPerformance({ ws_id, job_id, case_id: test_case_id, suite_id, compare_result }),
        { manual: true }
    )

    const access = useAccess()

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
            width: 120,
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
                            <span
                                className={styles.hrefUrl}
                                onClick={() => {
                                    if (row.skip_baseline_info) {
                                        const $test_type = ["performance", "性能测试"].includes(testType) ? "performance" : "functional"
                                        targetJump(`/ws/${ws_id}/baseline/${$test_type}?${qs.stringify(row.skip_baseline_info)}`)
                                    }
                                }}
                            >
                                <EllipsisPulic title={`${_}±${row.baseline_cv_value}`}/>
                            </span>
                        </Access> :
                        '-'
                )
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
                _ ? <EllipsisPulic title={_}/> : '-'
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

    return (
        <ResizeHooksTable
            name="ws-result-metric-list"
            rowKey="id"
            loading={loading}
            pagination={false}
            size="small"
            className={`${styles.result_info_table_head} ${data?.length ? '' : styles.result_info_table_head_line}`}
            rowClassName={styles.result_info_table_row}
            dataSource={data}
            columns={columns}
            refreshDeps={[ws_id, strLocals, access]}
        />
    )
}