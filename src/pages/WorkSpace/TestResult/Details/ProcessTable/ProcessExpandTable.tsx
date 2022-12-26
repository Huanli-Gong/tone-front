import React from 'react'
import { useIntl, FormattedMessage } from 'umi';
import { Button } from 'antd';
import { copyTooltipColumn, evnPrepareState } from '../components'
import TidDetail from './QueryTidList';
import styles from './index.less'
import ResizeTable from '@/components/ResizeTable'
import { ReactComponent as ColumnStateLine } from '@/assets/svg/TestResult/line.svg'
import EllipsisPulic from '@/components/Public/EllipsisPulic'
import { Typography } from "antd"

export default ({ dataSource }: any) => {
    const { formatMessage } = useIntl()
    const [columns, setColumns] = React.useState([
        {
            dataIndex: 'mode',
            title: <FormattedMessage id="ws.result.details.mode" />,
            width: 127,
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
            width: 220,
            render: () => <ColumnStateLine />
        },
        {
            dataIndex: 'stage',
            title: <FormattedMessage id="ws.result.details.stage" />,
            ellipsis: {
                showTitle: false
            },
            width: 150,
            render(_) {
                return <Typography.Text ellipsis={{ tooltip: true }}>{_ || "-"}</Typography.Text>
            }
        },
        {
            dataIndex: 'state',
            title: <FormattedMessage id="ws.result.details.state" />,
            ellipsis: {
                showTitle: false
            },
            width: 80,
            render: evnPrepareState
        },
        {
            dataIndex: 'result',
            title: <FormattedMessage id="ws.result.details.output.results" />,
            ...copyTooltipColumn('Nothing to do'),
        },
        {
            dataIndex: 'tid',
            title: 'TID',
            ellipsis: {
                showTitle: false
            },
            render: (_: any) => _ && _.length ? _.indexOf('API_v2_0_') > -1 ? <EllipsisPulic title={_} /> : <TidDetail tid={_} /> : '-'
        },
        {
            dataIndex: 'gmt_created',
            title: <FormattedMessage id="ws.result.details.start_time" />,
            ellipsis: {
                showTitle: false
            },
            width: 170,
        },
        {
            dataIndex: 'gmt_modified',
            title: <FormattedMessage id="ws.result.details.finish_time" />,
            ellipsis: {
                showTitle: false
            },
            width: 170,
        },
        {
            title: <FormattedMessage id="ws.result.details.view.log" />,
            ellipsis: {
                showTitle: false
            },
            width: 80,
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
    ])

    return (
        <ResizeTable
            columns={columns}
            setColumns={setColumns}
            dataSource={dataSource}
            showHeader={false}
            rowKey="rowKey" // "id"
            size="small"
            rowClassName={styles.prep_test_conf_row}
            pagination={false}
        />
    )
}