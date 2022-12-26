import { Card } from 'antd'
import React, { useEffect } from 'react'
import PopoverEllipsis from '@/components/Public/PopoverEllipsis'
import { tooltipTd } from '../components'
import { evnPrepareState } from '../components'
import { queryMonitorList } from '../service'
import { useRequest, FormattedMessage } from 'umi';
import ResizeTable from '@/components/ResizeTable'
import ServerLink from '@/components/MachineWebLink/index';

export default ({ job_id, refresh = false, provider_name }: any) => {
    const { data, loading, run } = useRequest(
        () => queryMonitorList({ job_id }),
        {
            manual: true
        }
    )
    useEffect(() => {
        run()
    }, [refresh])

    const [columns, setColumns] = React.useState([
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
                    <ServerLink val={_} param={row.server_id} provider={provider_name} description={row.server_description} />
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
            render: (_: any) => _ ?
                <PopoverEllipsis title={_}>

                    {<a
                        href={_}
                        target="_blank"
                    >

                        {_}
                    </a>}
                </PopoverEllipsis>

                : '-'
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
            render: (_: any) => <PopoverEllipsis title={_ || '-'} />
        },
    ])

    if (data && !data.monitor_control) return <></>
    /* 
     *** 后端字段调整
    */
    let dataCopy = data && Array.isArray(data.result_list) ? data.result_list : []

    return (
        <Card
            title={<FormattedMessage id="ws.result.details.monitor" />}
            bodyStyle={{ paddingTop: 0 }}
            headStyle={{ borderBottom: 'none' }}
            style={{ marginBottom: 10, borderTop: 'none' }}
        >
            <ResizeTable
                dataSource={dataCopy}
                columns={columns as any}
                setColumns={setColumns}
                rowKey="id"
                loading={loading}
                size="small"
                pagination={false}
            />
        </Card>
    )
}
