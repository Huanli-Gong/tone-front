import { Table } from 'antd'
import React from 'react'
import { copyTooltipColumn , tooltipTd , evnPrepareState } from '../components'
import styles from './index.less'

import { ReactComponent as ColumnStateLine } from '@/assets/svg/TestResult/line.svg'

export default ({ items , mode } : any ) => {

    const columns : any = [{
        dataIndex : 'mode',
        title : '运行模式',
    },
    {
        dataIndex : 'ip',
        title : '测试机器',
        align : 'center',
        render : () => <div><ColumnStateLine /></div>
    },
    {
        dataIndex : 'stage',
        title : '步骤',
    },
    {
        dataIndex : 'state',
        title : '状态',
        render : evnPrepareState
    },
    {
        dataIndex : 'result',
        title : '输出结果',
        ...copyTooltipColumn( 'Nothing to do' ),
    },
    {
        dataIndex : 'tid',
        title : 'TID',
        ...tooltipTd()
    },
    {
        dataIndex : 'gmt_created',
        title : '开始时间',
    },
    {
        dataIndex : 'gmt_modified',
        title : '完成时间',
    },]

    return (
        <Table 
            columns={ columns }
            dataSource={ items }
            showHeader={ false }
            rowKey="rowKey" // "id"
            size="small"
            rowClassName={ styles.prep_test_conf_row }
            pagination={ false }
        />
    )
}