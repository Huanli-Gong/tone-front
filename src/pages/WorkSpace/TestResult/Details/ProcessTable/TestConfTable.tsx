import React from 'react'
import { Button, Table , message, Tooltip } from 'antd'

import ConfPopoverTable from './ConfPopoverTable'
import { evnPrepareState , tooltipTd , copyTooltipColumn } from '../components'

import { updateSuiteCaseOption , queryProcessCaseList } from '../service'
import { useRequest } from 'umi'
import { requestCodeMessage } from '@/utils/utils'
import { ServerJumpBlock } from '@/components/Public'

export default ( { test_suite_name , test_suite_id , job_id, testType } : any ) => {
    const { data , loading , refresh } = useRequest(
        () => queryProcessCaseList({ job_id , test_suite_id })
    )

    const columns = [
        {
            dataIndex : 'test_case_name',
            title : 'Test Conf',
            ...tooltipTd(),
        },
        {
            dataIndex : 'server',
            title: ['business_business'].includes(testType) ? '机器' : '测试机器',
            ellipsis: true,
            render: (_: any, row: any) => (
                _ ?
                    <Tooltip placement="topLeft" title={_}>
                        <ServerJumpBlock
                        >
                            {_}
                        </ServerJumpBlock>
                    </Tooltip> :
                    '-'
            )
        },
        {
            title : '环境准备',
            render : ( _ : any ) => {
                return (
                    <ConfPopoverTable 
                        { ..._ }
                        title={ `${ test_suite_name }/${ _.name }环境准备详情` }
                    />
                )
            }
        },
        {
            dataIndex : 'state',
            title : '状态',
            width : 80,
            render : evnPrepareState
        },        
        {
            dataIndex : 'tid',
            title : 'TID',
            width : 120,
            ...copyTooltipColumn(),
        },
        {
            dataIndex : 'result',
            title : '输出结果',
            width : 150,
            ...tooltipTd('Nothing to do'),
        },
        {
            dataIndex : 'start_time',
            width : 160,
            title : '开始时间',
            ...tooltipTd('-'),
        },
        {
            dataIndex : 'end_time',
            width : 160,
            title : '结束时间',
            ...tooltipTd('-'),
        },{
            title : '查看日志',
            width : 80,
            render : ( _ : any ) => {
                // success,fail,stop 可看日志
                if ( _.state === 'success' || _.state === 'fail' || _.state === 'stop' )
                {
                    if ( _.log_file ) 
                        return <Button type="link" style={{ padding : 0 }} onClick={( ) => window.open( _.log_file )}>日志</Button>
                }
                return <Button type="link" style={{ padding : 0 }} disabled={ true }>日志</Button>
            }
        },{
            title : '操作',
            width : 70,
            render : ( _ : any ) => (
                <>
                    {
                        _.state === 'running' &&
                        <Button type="link" style={{ padding : 0 }} onClick={ () => doConfServer( _ , 'stop')} >中止</Button>
                    }
                    {
                        _.state === 'pending' &&
                        <Button type="link" style={{ padding : 0 }} onClick={ () => doConfServer( _ , 'skip' )} >跳过</Button>
                    }
                </>
            )
        },
    ]

    const doConfServer = async ( _ : any , state : any ) => {
        const { code , msg } = await updateSuiteCaseOption({ 
            editor_obj : 'test_job_conf' , 
            test_job_conf_id : _.id , 
            state 
        })
        if ( code !== 200 ) {
            requestCodeMessage( code , msg )
            return 
        }
        message.success('操作成功')
        refresh()
    }

    return (
        <Table 
            columns={ columns }
            dataSource={ data }
            loading={ loading }
            rowKey='id'
            size="small"
            // pagination={ false }
        />
    )
}