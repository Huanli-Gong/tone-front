import { Card, Table, Tooltip } from 'antd'
import React, { useEffect } from 'react'
import PopoverEllipsis from '@/components/Public/PopoverEllipsis'
import { tooltipTd } from '../components'
import { evnPrepareState } from '../components'
import { queryMonitorList } from '../service'
import { useRequest } from 'umi';

export default ({ job_id , refresh = false } : any ) => {
    const { data , loading , run } = useRequest(
        () => queryMonitorList({ job_id }),
        {
            manual : true
        }
    )
    useEffect(() => {
        run()
    },[ refresh ])

    const columns = [
        {
            dataIndex : 'index',
            title : ' ',
            width: 48,
            render : ( _ : undefined) => _
        },

        {
            dataIndex: 'server',
            title: 'ip/sn',
            render: (_: number | string | undefined) => (
                _ ?
                    <PopoverEllipsis title={_}>
                        <a
                            href={`https://sa.alibaba-inc.com/ops/terminal.html?&source=tone&ip=${_}`}
                            target="_blank"
                        >
                            {_}
                        </a>
                    </PopoverEllipsis>
                    : '-'
            )
        },
        {
            dataIndex : 'state',
            title : '状态',
            render: evnPrepareState
        },
        {
            dataIndex: 'monitor_link',
            title: '链接',
            ellipsis: true,
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
            title: '失败信息',
            ...tooltipTd(),
        },
        {
            dataIndex: 'gmt_created',
            title : '开始时间',
            render : ( _ : any ) => <PopoverEllipsis title={_ || '-'} />
        },
    ]

    if(data && !data.monitor_control) return <></>
    /* 
        *** 后端字段调整
    */
    let dataCopy = data && Array.isArray(data.result_list) ? data.result_list : []

    // dataCopy = dataCopy.map((item:any) => {
    //     if(item && item.monitor_type === 'case_machine') item.server_input = item.server
    //     return item
    // })
    return (
        <Card
            title="监控"
            bodyStyle={{ paddingTop : 0 }}
            headStyle={{ borderBottom : 'none' }}
            style={{ marginBottom : 10 , borderTop : 'none' }}
        >
            <Table
                dataSource={ dataCopy }
                columns={ columns }
                rowKey="id"
                loading={ loading }
                size="small"
                pagination={ false }
            />
        </Card>
    )
}
