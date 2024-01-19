/* eslint-disable react-hooks/exhaustive-deps */
import { Card, Typography } from 'antd'
import { useEffect } from 'react'
import { tooltipTd } from '../components'
import { evnPrepareState } from '../components'
import { queryMonitorList } from '../service'
import { useRequest, FormattedMessage, useParams } from 'umi';
import ServerLink from '@/components/MachineWebLink/index';
import { ResizeHooksTable } from '@/utils/table.hooks'
import { ColumnEllipsisText } from '@/components/ColumnComponents'

export default ({ refresh = false, provider_name }: any) => {
    const { id: job_id, share_id } = useParams() as any

    const { data, loading, run } = useRequest(
        () => queryMonitorList({ job_id, share_id }),
        {
            manual: true
        }
    )

    useEffect(() => {
        run()
    }, [refresh])

    const columns = [
        {
            dataIndex: 'index',
            title: ' ',
            width: 48,
            render: (_: undefined) => _
        },
        {
            dataIndex: 'server',
            title: `IP${!BUILD_APP_ENV ? "/SN" : ""}`,
            ellipsis: {
                showTitle: false
            },
            render: (_: string | number | undefined, row: any) => (
                _ ?
                    <ServerLink {...row} val={_} param={row.server_id} provider={provider_name} description={row.server_description} />
                    : '-'
            )
        },
        {
            dataIndex: 'state',
            title: <FormattedMessage id="ws.result.details.state" />,
            render: evnPrepareState
        },
        {
            dataIndex: 'monitor_link',
            title: <FormattedMessage id="ws.result.details.monitor_link" />,
            ellipsis: {
                shwoTitle: false,
            },
            render: (_: any) => (
                !_ ? "-" :
                    <ColumnEllipsisText ellipsis={{ tooltip: true }} style={{ color: "#1890FF" }}>
                        <Typography.Link
                            target="_blank"
                            href={_}
                            ellipsis
                        >
                            {_}
                        </Typography.Link>
                    </ColumnEllipsisText>
            )
        },
        {
            dataIndex: 'remark',
            title: <FormattedMessage id="ws.result.details.failed.info" />,
            ...tooltipTd(),
        },
        {
            dataIndex: 'gmt_created',
            title: <FormattedMessage id="ws.result.details.start_time" />,
            ellipsis: {
                showTitle: false
            },
            render: (_: any) => <ColumnEllipsisText ellipsis={{ tooltip: true }} >{_ || '-'}</ColumnEllipsisText>
        },
    ]

    if (data && !data.monitor_control) return <></>
    /* 
     *** 后端字段调整
    */
    const dataCopy = data && Array.isArray(data.result_list) ? data.result_list : []

    return (
        <Card
            title={<FormattedMessage id="ws.result.details.monitor" />}
            bodyStyle={{ paddingTop: 0 }}
            headStyle={{ borderBottom: 'none' }}
            style={{ marginBottom: 10, borderTop: 'none' }}
        >
            <ResizeHooksTable
                dataSource={dataCopy}
                columns={columns as any}
                refreshDeps={[]}
                name="ws-job-result-process-monitor-conf-table"
                rowKey="id"
                loading={loading}
                size="small"
                pagination={false}
            />
        </Card>
    )
}
