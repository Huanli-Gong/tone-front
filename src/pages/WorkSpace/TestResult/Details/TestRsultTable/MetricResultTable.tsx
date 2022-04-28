import React, { useEffect } from 'react'
import { Tooltip } from 'antd'
import { QusetionIconTootip, ResultTdPopver, compareResultFontColor, compareResultSpan } from '../components'
import { queryCaseResultPerformance } from '../service'
import { useRequest, useAccess, Access, useParams } from 'umi'
import qs from 'querystring'
import styles from './index.less'
import { targetJump } from '@/utils/utils'
import ResizeTable from '@/components/ResizeTable'

export default ({ test_case_id, suite_id, state: compare_result, refreshId, setRefreshId }: any) => {
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

    const columns:any = [{
        // title : 'Metric',
        title: '指标',
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
    }, {
        title: <QusetionIconTootip title="测试结果" desc="AVG ± CV" />,
        dataIndex: 'test_value',
        width: 120,
        render: (_: any, row: any, index: number) => (
            <ResultTdPopver
                {...row}
                rowkey={`${test_case_id}${test_case_id}${index}`}
                title="对比结果"
            />
        )
    }, {
        title: <QusetionIconTootip title="基线" desc="AVG ± CV" />,
        dataIndex: 'baseline_value',
        width: 120,
        render: (_: any, row: any) => {
            return (
                (_ && row.baseline_cv_value) ?
                    <Access
                        accessible={access.canWsAdmin()}
                        fallback={<span>{`${_}±${row.baseline_cv_value}`}</span>}
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
    }, {
        title: '对比结果',
        dataIndex: 'compare_result',
        width: 120,
        render: (_: any, row: any) => (
            _ ?
                <span style={{ color: compareResultFontColor(row.compare_result) }}>{_}</span> :
                '-'
        )
    }, {
        title: <QusetionIconTootip title="阈值" desc="AVG 阈值 / CV 阈值" />,
        dataIndex: 'threshold',
        width: 120,
        render: (_: any) => (
            _ ? _ : '-'
        )
        // render : ( _ : any , row : any) => <span>{ `${ row.test_value } / ${ row.cv_value }` }</span>
    }, {
        title: '跟踪结果',
        width: 120,
        render: (_: any, row: any) => compareResultSpan(row.track_result, row.result)
    },]

    return (
        <ResizeTable
            style={{ marginBottom: 20 }}
            rowKey="id"
            loading={loading}
            pagination={false}
            size="small"
            scroll={{ x: '100%' }}
            className={styles.result_info_table_head}
            rowClassName={styles.result_info_table_row}
            dataSource={data}
            columns={columns}
        />
    )
}