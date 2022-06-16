import React, { useEffect, useState } from 'react'
import { Button, Table, message, Tooltip } from 'antd'
import ConfPopoverTable from './ConfPopoverTable'
import { evnPrepareState, tooltipTd, copyTooltipColumn } from '../components'
import PermissionTootip from '@/components/Public/Permission/index';
import { updateSuiteCaseOption, queryProcessCaseList, querySeverLink } from '../service'
import { useAccess, Access, useModel } from 'umi'
import { requestCodeMessage } from '@/utils/utils'
import CommonPagination from '@/components/CommonPagination';

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

    const handleIpHerf = async (ip: string) => {
        const { data, code, msg } = await querySeverLink({ ip })
        if (code === 200) {
            if (provider_name === '云上机器') {
                const win: any = window.open("");
                setTimeout(function () { win.location.href = data.link })
            }
        }
        requestCodeMessage(code, msg)
    }

    const columns = [
        {
            dataIndex: 'test_case_name',
            title: 'Test Conf',
            ...tooltipTd(),
        },
        {
            dataIndex: 'server',
            title: ['business_business'].includes(testType) ? '机器' : '测试机器',
            ellipsis: true,
            render: (_: any, row: any) => {
                if(_){
                    return <Tooltip placement="topLeft" title={_}>
                        <div onClick={()=> handleIpHerf(_)} style={{ color: '#1890ff', cursor: 'pointer' }}>{_}</div>
                    </Tooltip>
                }
                return '-'
            }
        },
        {
            title: '环境准备',
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
                return <Button type="link" style={{ padding: 0 }}>日志</Button>
            }
        }, {
            title: '操作',
            width: 70,
            render: (_: any) => (
                <Access accessible={access.wsRoleContrl(_.creator)} >
                    {
                        _.state === 'running' && <Button type="link" style={{ padding: 0 }} onClick={() => doConfServer(_, 'stop')} >中止</Button>
                    }
                    {
                        _.state === 'pending' && <Button type="link" style={{ padding: 0 }} onClick={() => doConfServer(_, 'skip')} >跳过</Button>
                    }
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
            <Table
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