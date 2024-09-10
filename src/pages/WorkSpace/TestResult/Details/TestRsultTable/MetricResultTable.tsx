/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react'
import { Tooltip, Typography, Divider } from 'antd'
import { FilterFilled } from '@ant-design/icons'
import { QusetionIconTootip, ResultTdPopver, compareResultFontColor, compareResultSpan } from '../components'
import { queryCaseResultPerformance } from '../service'
import { useRequest, useAccess, Access, useParams, useIntl, FormattedMessage } from 'umi'
import qs from 'querystring'
import styles from './index.less'
import { ResizeHooksTable } from '@/utils/table.hooks';
import SearchInput from '@/components/Public/SearchInput';
import EllipsisPulic from '@/components/Public/EllipsisPulic';
import { ColumnEllipsisText } from '@/components/ColumnComponents'
import { MetricSelectProvider } from '.'

export default (props: any) => {
    const { formatMessage } = useIntl()
    const { test_case_id, suite_id, state: compare_result, refreshId, setRefreshId, testType, lookPathCallback = () => { }, } = props
    const { id: job_id, ws_id, share_id } = useParams() as any
    const { setOSuite, oSuite } = React.useContext(MetricSelectProvider)
    const defaultKeys = {
        ws_id,
        job_id,
        case_id: test_case_id,
        suite_id,
        sub_case_name: undefined,
        page_size: 100,
        page_num: 1,
        compare_result,
        share_id
    }
    const [interfaceSearchKeys, setInterfaceSearchKeys] = useState<any>(defaultKeys)
    const { data, run, loading } = useRequest(
        (params = interfaceSearchKeys) => queryCaseResultPerformance(params),
        {
            initialData: { data: [] },
            refreshDeps: [interfaceSearchKeys],
            /* 解决请求重复的问题 */
            debounceInterval: 200,
            formatResult(res) {
                return res
            },
        }
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
            title: <FormattedMessage id="ws.result.details.metric" />,
            dataIndex: 'metric',
            ellipsis: {
                showTitle: false,
            },
            filterIcon: (filtered: any) => {
                return <FilterFilled style={{ color: interfaceSearchKeys.metric ? '#1890ff' : undefined }} />
            },
            filterDropdown: ({ confirm }: any) => (
                <SearchInput
                    autoFocus={false}
                    value={interfaceSearchKeys.metric}
                    confirm={confirm}
                    onConfirm={(val: string) => setInterfaceSearchKeys({ ...interfaceSearchKeys, metric: val || undefined, page_num: 1 })}
                />
            ),
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
                showTitle: false,
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
                showTitle: false,
            },
            render: (_: any, row: any) => {
                return (
                    (_ && row.baseline_cv_value) ?
                        <Access accessible={!share_id && access.IsWsSetting()} fallback={`${_}±${row.baseline_cv_value}` || '-'}>
                            {
                                row.skip_baseline_info ?
                                    <Typography.Link
                                        target='_blank'
                                        href={`/ws/${ws_id}/baseline/${$test_type}?${qs.stringify(row.skip_baseline_info)}`}
                                    >
                                        <EllipsisPulic title={`${_}±${row.baseline_cv_value}`} />
                                    </Typography.Link> :
                                    `${_}±${row.baseline_cv_value}`
                            }
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
                if (!share_id && access.IsWsSetting())
                    return (
                        <Tooltip placement="topLeft" title={context}>
                            {
                                row.skip_baseline_info ?
                                    <Typography.Link
                                        target='_blank'
                                        href={`/ws/${ws_id}/baseline/${$test_type}?${qs.stringify(row.skip_baseline_info)}`}
                                    >
                                        {context}
                                    </Typography.Link> :
                                    context
                            }
                        </Tooltip >
                    )
                return (<ColumnEllipsisText ellipsis={{ tooltip: true }}>{context}</ColumnEllipsisText>)
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
                showTitle: false,
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

    const rowSelection: any = !share_id && testType === 'performance' ? {
        columnWidth: 40,
        selectedRowKeys: oSuite?.[suite_id]?.[test_case_id],
        onChange: (keys: React.Key[]) => {
            setOSuite({
                ...oSuite,
                [suite_id]: keys.length > 0 ?
                    {
                        ...(oSuite?.[suite_id] || {}),
                        [test_case_id]: keys
                    } :
                    Object.keys(oSuite?.[suite_id]).reduce((p: any, c: any) => {
                        if (+ c === test_case_id)
                            return p
                        p[c] = oSuite?.[suite_id]?.[c]
                        return p
                    }, {})
            })
        }
    } : undefined

    React.useEffect(() => {
        if (data && Object.prototype.toString.call(oSuite?.[suite_id]?.[test_case_id]) === '[object Null]') {
            setOSuite({
                ...oSuite,
                [suite_id]: {
                    ...(oSuite?.[suite_id] || {}),
                    [test_case_id]: data.data.map((i: any) => i.id)
                }
            })
        }
    }, [oSuite, data.data])

    return (
        <ResizeHooksTable
            name="ws-result-metric-list"
            rowKey="id"
            size="small"
            loading={loading}
            rowSelection={rowSelection}
            className={`${styles.result_info_table_head} ${data.data?.length ? '' : styles.result_info_table_head_line}`}
            pagination={{
                pageSize: data.page_size || 100,
                current: data.page_num || 1,
                total: data.total || 0,
                showQuickJumper: true,
                showSizeChanger: true,
                onChange(page_num, page_size) {
                    /* 解决page_size切换，page_num不变的问题 */
                    setInterfaceSearchKeys((p: any) => ({
                        ...p,
                        page_num: p.page_size === page_size ? page_num : 1,
                        page_size
                    }))
                },
                showTotal(total) {
                    return formatMessage({ id: 'pagination.total.strip' }, { data: total })
                },
                pageSizeOptions: [100, 200, 500],
            }}
            rowClassName={styles.result_info_table_row}
            dataSource={data.data}
            columns={columns}
            scroll={{ x: '100%' }}
            refreshDeps={[interfaceSearchKeys, ws_id, strLocals, access]}
        />
    )
}