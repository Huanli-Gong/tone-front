import React, { memo, useRef, } from 'react'
import { Table, Card } from 'antd'
import { useModel, useAccess, Access, useParams } from 'umi'
import EditMarks from './EditMarks'
import { ellipsisEditColumn } from '@/pages/WorkSpace/TestResult/Details/components'
import { matchRoleEnum } from '@/utils/utils';

export default memo(
    (props: any) => {
        const { ws_id } = useParams() as any
        const { refresh, dataSource, testType, showType } = props
        const editMarks: any = useRef(null)
        const access = useAccess()
        // 权限
        const { currentRole } = matchRoleEnum();
        const limitAuthority = ['ws_tester', 'ws_tester_admin', 'sys_admin'].includes(currentRole);

        let columns = [
            {
                title: 'JobID',
                dataIndex: 'job_id'
            }, {
                title: 'Job名称',
                dataIndex: 'job_name',
                render: (_: any, row: any) => (
                    <a target="_blank" href={`${location.origin}/ws/${ws_id}/test_result/${row.job_id}`}>{_}</a>
                )
            }, {
                title: '测试机器（TestConf）',
                dataIndex: 'server',
                render: (_: any) => (
                    <span>{_}</span>
                )
            }, {
                title: '创建人',
                dataIndex: 'creator'
            }, {
                title: '开始时间',
                dataIndex: 'start_time'
            }, {
                title: '完成时间',
                dataIndex: 'end_time'
            },
        ];
        // if (limitAuthority) {
        //     columns = columns.concat([
        //         {
        //             title : '标注',
        //             dataIndex : 'note',
        //             render : ( _ : any , row : any ) => ellipsisEditColumn( _ , row , 135 + 28 - 20 , () => handleEditMarks( row ) )
        //         }
        //     ]);
        // }
        if (access.wsRoleContrl()) {
            columns = columns.concat([
                {
                    title: '标注',
                    dataIndex: 'note',
                    render: (_: any, row: any) => ellipsisEditColumn(_, row, 135 + 28 - 20, () => handleEditMarks(row))
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