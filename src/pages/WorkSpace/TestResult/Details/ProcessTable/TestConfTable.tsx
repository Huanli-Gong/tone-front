import React, { useEffect, useState } from 'react'
import { Button, Table, message, Tooltip } from 'antd'
import ConfPopoverTable from './ConfPopoverTable'
import { evnPrepareState, tooltipTd, copyTooltipColumn } from '../components'
// import PermissionTootip from '@/components/Public/Permission/index';
import ServerLink from '@/components/MachineWebLink/index';
import { updateSuiteCaseOption, queryProcessCaseList } from '../service'
import { useAccess, Access, useModel } from 'umi'
import { requestCodeMessage, AccessTootip } from '@/utils/utils'
import CommonPagination from '@/components/CommonPagination';
import ResizeTable from '@/components/ResizeTable'
export default ({ test_suite_name, test_suite_id, job_id, testType, provider_name }: any) => {
    const PAGE_DEFAULT_PARAMS: any = {
        page_num: 1,
        page_size: 10,
        job_id,
        test_suite_id,
    }
    const [pageParams, setPageParams] = useState<any>(PAGE_DEFAULT_PARAMS)
    const [loading, setLoading] = useState<boolean>(false)
    const [total, setTotal] = useState<number>(0)
    const [dataSource, setDataSource] = useState<any>([])
    const { initialState } = useModel('@@initialState');
    const access = useAccess();

    const queryTestListTableData = async () => {
        setLoading(true)
        const { data, code, msg, total } = await queryProcessCaseList(pageParams)
        if (code === 200) {
            setDataSource(data)
            setTotal(total)
            setLoading(false)
        } else {
            requestCodeMessage(code, msg)
        }
    }

    useEffect(() => {
        queryTestListTableData()
    }, [pageParams])

    const columns = [
        {
            dataIndex: 'test_case_name',
            title: 'Test Conf',
            ...tooltipTd(),
        },
        {
            dataIndex: 'server',
            title: ['business_business'].includes(testType) ? '机器' : '测试机器',
            ellipsis: {
                showTitle: false
            },
            render: (_: any, row: any) => (
                <ServerLink 
                    val={_} 
                    param={row.server_id}
                    provider={provider_name} 
                />
            )
                
        },
        {
            title: '环境准备',
            ellipsis: {
                showTitle: false
            },
            render: (_: any) => {
                return (
                    <ConfPopoverTable
                        {..._}
                        title={`${test_suite_name}/${_.name || _.test_case_name}环境准备详情`}
                    />
                )
            }
        },
        {
            dataIndex: 'state',
            title: '状态',
            width: 80,
            render: evnPrepareState
        },
        {
            dataIndex: 'tid',
            title: 'TID',
            width: 120,
            ...copyTooltipColumn(),
        },
        {
            dataIndex: 'result',
            title: '输出结果',
            width: 150,
            ...tooltipTd('Nothing to do'),
        },
        {
            dataIndex: 'start_time',
            width: 160,
            title: '开始时间',
            ...tooltipTd('-'),
        },
        {
            dataIndex: 'end_time',
            width: 160,
            title: '结束时间',
            ...tooltipTd('-'),
        }, {
            title: '查看日志',
            width: 80,
            ellipsis: {
                showTitle: false
            },
            render: (_: any) => {
                // success,fail,stop 可看日志
                if (_.state === 'success' || _.state === 'fail' || _.state === 'stop') {
                    if (_.log_file)
                        // return <PermissionTootip>
                        //     <Button type="link" disabled={true} style={{ padding: 0 }} onClick={() => window.open(_.log_file)}>日志</Button>
                        // </PermissionTootip>
                        return  <Button type="link" style={{ padding: 0 }} onClick={() => window.open(_.log_file)}>日志</Button>
                }
                // return <PermissionTootip><Button type="link" style={{ padding: 0 }} disabled={true}>日志</Button></PermissionTootip>
                return <Button type="link" style={{ padding: 0 }} disabled={true}>日志</Button>
            }
        }, {
            title: '操作',
            width: 70,
            ellipsis: {
                showTitle: false
            },
            render: (_: any) => (
                <Access accessible={access.WsTourist()}>
                    <Access 
                        accessible={access.WsMemberOperateSelf(_.creator)} 
                        fallback={
                            <span>
                                { _.state === 'running' && <Button type="link" style={{ padding: 0 }} onClick={() => AccessTootip()} >中止</Button> }
                                { _.state === 'pending' && <Button type="link" style={{ padding: 0 }} onClick={() => AccessTootip()} >跳过</Button> }
                            </span>
                        }
                    >
                        { _.state === 'running' && <Button type="link" style={{ padding: 0 }} onClick={() => doConfServer(_, 'stop')} >中止</Button> }
                        { _.state === 'pending' && <Button type="link" style={{ padding: 0 }} onClick={() => doConfServer(_, 'skip')} >跳过</Button> }
                    </Access>
                </Access>
            )
        },
    ]

    const doConfServer = async (_: any, state: any) => {
        // 添加用户id
        const { user_id } = initialState?.authList
        const q = user_id ? { user_id } : {}
        const { code, msg } = await updateSuiteCaseOption({
            ...q,
            editor_obj: 'test_job_conf',
            test_job_conf_id: _.id,
            state
        })
        if (code !== 200) {
            requestCodeMessage(code, msg)
            return
        }
        message.success('操作成功')
        queryTestListTableData()
    }

    return (
        <>
            <ResizeTable
                columns={columns}
                dataSource={dataSource}
                loading={loading}
                rowKey='id'
                size="small"
                pagination={false}
            />
            <CommonPagination
                total={total}
                currentPage={pageParams.page_num}
                pageSize={pageParams.page_size}
                onPageChange={
                    (page_num, page_size) => {
                        setPageParams({ ...pageParams, page_num, page_size })
                    }
                }
            />
        </>
    )
}