import { Card, Table, Tooltip } from 'antd'
import React, { useEffect } from 'react'
import PopoverEllipsis from '@/components/Public/PopoverEllipsis'
import { tooltipTd } from '../components'
import { evnPrepareState } from '../components'
import { queryMonitorList } from '../service'
import { useRequest } from 'umi';
import ResizeTable from '@/components/ResizeTable'
import ServerLink from '@/components/MachineWebLink/index';

export default ({ job_id , refresh = false, provider_name } : any ) => {
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
            title: `IP${!BUILD_APP_ENV ? "/SN" : ""}`,
            ellipsis: {
                showTitle: false
            },
            render: (_: string | number | undefined) => (
                _ ?
                    <ServerLink val={_} provider={provider_name} />
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
            title: '失败信息',
            ...tooltipTd(),
        },
        {
            dataIndex: 'gmt_created',
            title : '开始时间',
            ellipsis: {
                showTitle: false
            },
            render : ( _ : any ) => <PopoverEllipsis title={_ || '-'} />
        },
    ]

    if(data && !data.monitor_control) return <></>
    /* 
        *** 后端字段调整
    */
    let dataCopy = data && Array.isArray(data.result_list) ? data.result_list : []

    return (
        <Card
            title="监控"
            bodyStyle={{ paddingTop : 0 }}
            headStyle={{ borderBottom : 'none' }}
            style={{ marginBottom : 10 , borderTop : 'none' }}
        >
            <ResizeTable
                dataSource={ dataCopy }
                columns={ columns as any }
                rowKey="id"
                loading={ loading }
                size="small"
                pagination={ false }
            />
        </Card>
    )
}
