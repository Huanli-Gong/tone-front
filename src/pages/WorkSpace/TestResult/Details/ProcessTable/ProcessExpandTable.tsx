import { Table } from 'antd'
import React from 'react'
import { useIntl, FormattedMessage } from 'umi'
import { copyTooltipColumn , tooltipTd , evnPrepareState } from '../components'
import styles from './index.less'
import ResizeTable from '@/components/ResizeTable'
import { ReactComponent as ColumnStateLine } from '@/assets/svg/TestResult/line.svg'

export default ({ items , mode } : any ) => {
    const { formatMessage } = useIntl()
    const columns : any = [{
        dataIndex : 'mode',
        title : <FormattedMessage id="ws.result.details.mode"/>,
        ellipsis: {
            showTitle: false
        },
    },
    {
        dataIndex : 'ip',
        title : <FormattedMessage id="ws.result.details.test.server"/>,
        align : 'center',
        ellipsis: {
            showTitle: false
        },
        render : () => <div><ColumnStateLine /></div>
    },
    {
        dataIndex : 'stage',
        title : <FormattedMessage id="ws.result.details.stage"/>,
        ellipsis: {
            showTitle: false
        },
    },
    {
        dataIndex : 'state',
        title : <FormattedMessage id="ws.result.details.state"/>,
        render : evnPrepareState
    },
    {
        dataIndex : 'result',
        title : <FormattedMessage id="ws.result.details.output.results"/>,
        ...copyTooltipColumn( 'Nothing to do' ),
    },
    {
        dataIndex : 'tid',
        title : 'TID',
        ...tooltipTd()
    },
    {
        dataIndex : 'gmt_created',
        title : <FormattedMessage id="ws.result.details.start_time"/>,
        ellipsis: {
            showTitle: false
        },
    },
    {
        dataIndex : 'gmt_modified',
        title : <FormattedMessage id="ws.result.details.finish_time"/>,
        ellipsis: {
            showTitle: false
        },
    },]

    return (
        <ResizeTable 
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