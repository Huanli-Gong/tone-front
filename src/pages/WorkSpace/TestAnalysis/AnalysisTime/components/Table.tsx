import React, { memo, useRef, } from 'react'
import { Table, Card } from 'antd'
import { useModel, useAccess, Access, useParams, useIntl, FormattedMessage } from 'umi'
import EditMarks from './EditMarks'
import { EllipsisEditColumn } from '@/pages/WorkSpace/TestResult/Details/components'
import ServerLink from '@/components/MachineWebLink/index';

export default memo(
    (props: any) => {
        const { ws_id } = useParams() as any
        const { refresh, dataSource, testType, showType } = props
        const editMarks: any = useRef(null)
        const access = useAccess()

        let columns = [
            {
                title: <FormattedMessage id="analysis.table.column.id"/>,
                dataIndex: 'job_id'
            }, {
                title: <FormattedMessage id="analysis.table.column.name"/>,
                dataIndex: 'job_name',
                render: (_: any, row: any) => (
                    <a target="_blank" href={`${location.origin}/ws/${ws_id}/test_result/${row.job_id}`}>{_}</a>
                )
            }, {
                title: <FormattedMessage id="analysis.table.column.server"/>,
                dataIndex: 'server',
                render: (_: any, row:any) => (
                    <ServerLink
                        val={_}
                        param={row.server_id}
                        provider={row.server_provider}
                    />
                )
            }, {
                title: <FormattedMessage id="analysis.table.column.creator"/>,
                dataIndex: 'creator'
            }, {
                title: <FormattedMessage id="analysis.table.column.startTime"/>,
                dataIndex: 'start_time'
            }, {
                title: <FormattedMessage id="analysis.table.column.emdTime"/>,
                dataIndex: 'end_time'
            },
        ];
        
        if (access.WsTourist()) {
            columns = columns.concat([
                {
                    title: <FormattedMessage id="analysis.table.column.note"/>,
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
            ]);
        }

        const handleEditMarks = (_: any) => {
            editMarks.current.show(_)
        }

        return (
            <>
                <Card style={{ marginTop: 10, width: '100%' }}>
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
                    showType={showType}
                    testType={testType}
                    onOk={refresh}
                />
            </>
        )
    }
)