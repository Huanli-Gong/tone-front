import React, { useEffect } from 'react'
import { Tooltip } from 'antd'
import { QusetionIconTootip, ResultTdPopver, compareResultFontColor, compareResultSpan } from '../components'
import { queryCaseResultPerformance } from '../service'
import { useRequest, useAccess, Access, useParams, useIntl, FormattedMessage } from 'umi'
import qs from 'querystring'
import styles from './index.less'
import { targetJump } from '@/utils/utils'
import ResizeTable from '@/components/ResizeTable'

export default ({ test_case_id, suite_id, state: compare_result, refreshId, setRefreshId }: any) => {
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
    const [columns, setColumns] = React.useState([
        {
            // title : 'Metric',
            title: <FormattedMessage id="ws.result.details.metric" />,
            dataIndex: 'metric',
            width: 200,
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
            // render: (_: any) => <span style={{ paddingLeft: 8, paddingRight: 8 }}>{_ || '-'}</span>
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
            width: 120,
            render: (_: any, row: any, index: number) => (
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
            render: (_: any, row: any) => {
                return (
                    (_ && row.baseline_cv_value) ?
                        <Access
                            accessible={access.IsWsSetting()}
                        >
                            <span
                                className={styles.hrefUrl}
                                onClick={() => {
                                    if (row.skip_baseline_info) {
                                        const baseline_type = row.skip_baseline_info.server_provider === 'aligroup' ? 'group' : 'cluster'
                                        targetJump(`/ws/${ws_id}/baseline/${baseline_type}?${qs.stringify(row.skip_baseline_info)}`)
                                    }
                                }}
                            >
                                {`${_}±${row.baseline_cv_value}`}
                            </span>
                        </Access>
                        :
                        '-'
                )
            }
        },
        {
            title: <FormattedMessage id="ws.result.details.compared.results" />,
            dataIndex: 'compare_result',
            width: 120,
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
            render: (_: any) => (
                _ ? _ : '-'
            )
            // render : ( _ : any , row : any) => <span>{ `${ row.test_value } / ${ row.cv_value }` }</span>
        },
        {
            title: <FormattedMessage id="ws.result.details.track_result" />,
            width: 120,
            render: (_: any, row: any) => compareResultSpan(row.track_result, row.result, formatMessage)
        },
    ])

    return (
        <ResizeTable
            // style={{ marginBottom: 20 }}
            rowKey="id"
            loading={loading}
            pagination={false}
            size="small"
            // scroll={{ x: '100%' }}
            className={`${styles.result_info_table_head} ${data?.length ? '' : styles.result_info_table_head_line}`}
            rowClassName={styles.result_info_table_row}
            dataSource={data}
            columns={columns}
            setColumns={setColumns}
        />
    )
}