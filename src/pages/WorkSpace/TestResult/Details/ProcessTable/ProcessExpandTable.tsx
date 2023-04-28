/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react'
import { useIntl, FormattedMessage } from 'umi';
import { Button, Table } from 'antd';
import type { TableColumnsType } from "antd"
import { copyTooltipColumn, evnPrepareState } from '../components'
import TidDetail from './QueryTidList';
import styles from './index.less'
import { ReactComponent as ColumnStateLine } from '@/assets/svg/TestResult/line.svg'
import { getStorageState } from '@/utils/table.hooks';
import { ColumnEllipsisText } from '@/components/ColumnComponents';

const ProcessExpandTable: React.FC<AnyType> = (props) => {
    const { dataSource, parentTableName, columnsChange } = props
    const { formatMessage } = useIntl()

    const columns: TableColumnsType<AnyType> = React.useMemo(() => [
        {
            dataIndex: 'mode',
            title: <FormattedMessage id="ws.result.details.mode" />,
            width: getStorageState(parentTableName, "server_type") + 47 || 127,
            ellipsis: {
                showTitle: false
            },
        },
        {
            dataIndex: 'ip',
            title: <FormattedMessage id="ws.result.details.test.server" />,
            align: 'center',
            ellipsis: {
                showTitle: false
            },
            width: getStorageState(parentTableName, "server") || 220,
            render: () => {
                return (
                    <div style={{ display: "flex", justifyContent: "start" }}>
                        <ColumnStateLine />
                    </div>
                )
            }
        },
        {
            dataIndex: 'stage',
            title: <FormattedMessage id="ws.result.details.stage" />,
            ellipsis: {
                showTitle: false
            },
            width: getStorageState(parentTableName, "stage") || 150,
            render(_) {
                return <ColumnEllipsisText ellipsis={{ tooltip: true }}>{_ || "-"}</ColumnEllipsisText>
            }
        },
        {
            dataIndex: 'state',
            title: <FormattedMessage id="ws.result.details.state" />,
            ellipsis: {
                showTitle: false
            },
            width: getStorageState(parentTableName, "state") || 80,
            render: evnPrepareState
        },
        {
            dataIndex: 'result',
            title: <FormattedMessage id="ws.result.details.output.results" />,
            width: getStorageState(parentTableName, "result"),
            ...copyTooltipColumn('Nothing to do'),
        },
        {
            dataIndex: 'tid',
            title: 'TID',
            width: getStorageState(parentTableName, "tid"),
            ellipsis: {
                showTitle: false
            },
            render: (_: any) => _ && _.length ? _.indexOf('API_v2_0_') > -1 ? <ColumnEllipsisText ellipsis={{ tooltip: true }} >{_}</ColumnEllipsisText> : <TidDetail tid={_} /> : '-'
        },
        {
            dataIndex: 'gmt_created',
            title: <FormattedMessage id="ws.result.details.start_time" />,
            ellipsis: {
                showTitle: false
            },
            width: getStorageState(parentTableName, "gmt_created") || 170,
        },
        {
            dataIndex: 'gmt_modified',
            title: <FormattedMessage id="ws.result.details.finish_time" />,
            ellipsis: {
                showTitle: false
            },
            width: getStorageState(parentTableName, "gmt_modified") || 170,
        },
        {
            title: <FormattedMessage id="ws.result.details.view.log" />,
            ellipsis: {
                showTitle: false
            },
            key: "log",
            fixed: "right",
            width: getStorageState(parentTableName, "log") || 80,
            render: (_: any) => {
                const strLocals = formatMessage({ id: 'ws.result.details.log' })
                // success,fail,stop 可看日志
                if (_.state === 'success' || _.state === 'fail' || _.state === 'stop') {
                    if (_.log_file)
                        return <Button size="small" type="link" style={{ padding: 0 }} onClick={() => window.open(_.log_file)}>{strLocals}</Button>
                }
                return <Button size="small" type="link" style={{ padding: 0 }} disabled={true}>{strLocals}</Button>
            }
        }
    ], [columnsChange])

    return (
        <Table
            columns={columns as any}
            dataSource={dataSource}
            showHeader={false}
            rowKey="rowKey" // "id"
            size="small"
            scroll={{
                x: columns.reduce((p: any, c: any) => {
                    // eslint-disable-next-line no-param-reassign
                    if (c?.width) return p += +c.width
                    return p
                }, 0)
            }}
            rowClassName={styles.prep_test_conf_row}
            pagination={false}
        />
    )
}
export default ProcessExpandTable