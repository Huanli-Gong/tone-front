import { Card, message, Table, Button } from 'antd'
import React, { useEffect, useMemo, useState } from 'react'
import { CaretRightFilled, CaretDownFilled } from '@ant-design/icons';
import { AuthMember } from '@/components/Permissions/AuthMemberCommon';
import PopoverEllipsis from '@/components/Public/PopoverEllipsis';
import TestConfTable from './TestConfTable'
import { evnPrepareState } from '../components'
import ConfPopoverTable from './ConfPopoverTable'

import { updateSuiteCaseOption, queryProcessSuiteList } from '../service'
import { useRequest } from 'umi';
import { requestCodeMessage } from '@/utils/utils';

export default ({ job_id, refresh = false, testType }: any) => {
    const { data, loading, run } = useRequest(
        () => queryProcessSuiteList({ job_id }),
        {
            manual: true,
            initialData: []
        }
    )

    useEffect(() => {
        run()
    }, [refresh])

    let columns: any = [
        {
            dataIndex: 'test_suite_name',
            title: 'Test Suite',
        }
    ];
    if (['business_business'].includes(testType)) {
        columns = columns.concat([{
            title: '业务名称',
            dataIndex: 'business_name',
            width: 160,
            render: (text: any) => <PopoverEllipsis title={text} />,
        }])
    }

    columns = columns.concat([
        {
            title: '环境准备',
            render: (_: any) => {
                return (
                    <ConfPopoverTable
                        {..._}
                        title={`${_.test_suite_name}环境准备详情`}
                    />
                )
            }
        },
        {
            dataIndex: 'state',
            title: '状态',
            render: (_: any) => evnPrepareState(_)
        },
        {
            dataIndex: 'start_time',
            title: '开始时间',
        },
        {
            dataIndex: 'end_time',
            title: '结束时间',
        }, {
            title: '操作',
            render: (_: any) => {
                const state = _.state
                const style = {
                    color: state !== 'running' ? 'rgba(0,0,0,.25)' : '#1890FF',
                    cursor: state !== 'running' ? 'not-allowed' : 'pointer',
                }

                if (state === 'running')
                    return (
                        <AuthMember
                            isAuth={['sys_test_admin', 'user', 'ws_member']}
                            children={<span style={style} >停止Suite</span>}
                            onClick={() => handleStopSuite(_)}
                            creator_id={_.creator}
                        />
                    )
                // else if (state === 'pending')
                //     return <span style={{ color:'#1890FF',cursor:'pointer'}} onClick={ () => handleStopSuite( _ ) }>停止Suite</span>
                else
                    return <span style={style}>停止Suite</span>
            }
        }
    ]);

    const handleStopSuite = async (_: any) => {
        const { code, msg } = await updateSuiteCaseOption({
            editor_obj: 'test_job_suite',
            test_job_suite_id: _.id,
            state: 'stop'
        })
        if (code !== 200) {
            requestCodeMessage(code, msg)
            return
        }
        message.success('操作成功')
        run()
    }

    const [expandedKeys, setExpandedKeys] = useState<any>([])

    /* useEffect(() => {
        setExpandedKeys(data.map((item: any) => item.id))
    }, [data]) */

    console.log(expandedKeys)

    return (
        <Card
            title="测试用例"
            bodyStyle={{ paddingTop: 0 }}
            headStyle={{ borderBottom: 'none' }}
            style={{ marginBottom: 10, borderTop: 'none' }}
            extra={
                expandedKeys.length === data.length ?
                    <Button onClick={() => setExpandedKeys([])}>全部收起</Button> :
                    <Button onClick={() => setExpandedKeys(data.map((item: any) => item.id))}>全部展开</Button>
            }
        >
            <Table
                dataSource={data}
                columns={columns}
                rowKey="id"
                loading={loading}
                size="small"
                pagination={false}
                expandable={{
                    expandedRowKeys: expandedKeys,
                    onExpand: (expanded: any, record) => {
                        return !expanded ?
                            setExpandedKeys(expandedKeys.filter((i: any) => i !== record.id)) :
                            setExpandedKeys(expandedKeys.concat(record.id))
                    },
                    expandedRowRender: (record) => {
                        return (
                            <TestConfTable {...record} job_id={job_id} testType={testType} />
                        )
                    },
                    expandIcon: ({ expanded, onExpand, record }: any) => (
                        expanded ?
                            (<CaretDownFilled onClick={e => onExpand(record, e)} />) :
                            (<CaretRightFilled onClick={e => onExpand(record, e)} />)
                    )
                }}
            />
        </Card>
    )
}

// const { test_case_detail } = record;
// console.log( test_case_detail )
// let detail : any = []
// if ( JSON.stringify( test_case_detail) !== '{}' ) {
//     detail = Object.keys( test_case_detail ).map(
//         ( i : any ) => ({
//             name : i,
//             ...test_case_detail[ i ]
//         })
//     )
// }
// const expandTableSrouce = {
//     ...record ,
//     test_case_detail : detail
// }