import { memo, useRef } from 'react'
import { Table, Card } from 'antd'
import { useAccess, useParams, FormattedMessage } from 'umi'
import EditMarks from './EditMarks'
import { EllipsisEditColumn } from '@/pages/WorkSpace/TestResult/Details/components'
import ServerLink from '@/components/MachineWebLink/index';

export default memo(
    (props: any) => {
        const { ws_id } = useParams() as any
        const { refresh, dataSource, test_type, show_type } = props
        const editMarks: any = useRef(null)
        const access = useAccess()

        const handleEditMarks = (_: any) => {
            editMarks.current.show(_)
        }

        const columns = [
            {
                title: <FormattedMessage id="analysis.table.column.id" />,
                dataIndex: 'job_id'
            },
            {
                title: <FormattedMessage id="analysis.table.column.name" />,
                dataIndex: 'job_name',
                render: (_: any, row: any) => (
                    <a
                        target="_blank"
                        rel="noreferrer"
                        href={`${location.origin}/ws/${ws_id}/test_result/${row.job_id}`}
                    >
                        {_}
                    </a>
                )
            },
            {
                title: <FormattedMessage id="analysis.table.column.server" />,
                dataIndex: 'server',
                render: (_: any, row: any) => (
                    <ServerLink
                        val={_}
                        param={row.server_id}
                        provider={row.server_provider}
                    />
                )
            },
            {
                title: <FormattedMessage id="analysis.table.column.creator" />,
                dataIndex: 'creator'
            },
            {
                title: <FormattedMessage id="analysis.table.column.startTime" />,
                dataIndex: 'start_time'
            },
            {
                title: <FormattedMessage id="analysis.table.column.emdTime" />,
                dataIndex: 'end_time'
            },
            access.WsTourist() &&
            {
                title: <FormattedMessage id="analysis.table.column.note" />,
                dataIndex: 'note',
                render: (_: any, row: any) => (
                    <EllipsisEditColumn
                        title={_}
                        width={135 + 28 - 20}
                        access={access.WsMemberOperateSelf(row.creator_id)}
                        onEdit={
                            () => handleEditMarks(row)
                        }
                    />
                )
            }
        ].filter(Boolean) as any;

        return (
            <>
                <Card style={{ width: '100%', marginTop: 10 }}>
                    <Table
                        rowKey="job_id"
                        columns={columns}
                        pagination={false}
                        dataSource={dataSource}
                        size="small"
                    />
                </Card>
                <EditMarks
                    ref={editMarks}
                    ws_id={ws_id}
                    show_type={show_type}
                    test_type={test_type}
                    onOk={refresh}
                />
            </>
        )
    }
)