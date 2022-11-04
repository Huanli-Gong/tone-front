import React from 'react'
import { useIntl, FormattedMessage } from 'umi';
import { Button } from 'antd';
import { copyTooltipColumn , evnPrepareState } from '../components'
import TidDetail from './QueryTidList';
import styles from './index.less'
import ResizeTable from '@/components/ResizeTable'
import { ReactComponent as ColumnStateLine } from '@/assets/svg/TestResult/line.svg'
import EllipsisPulic from '@/components/Public/EllipsisPulic'

export default ({ items , mode } : any ) => {
    const { formatMessage } = useIntl()
    const columns : any = [{
        dataIndex : 'mode',
        title : <FormattedMessage id="ws.result.details.mode"/>,
        width: 80,
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
        width: 120,
        render : () => <div><ColumnStateLine /></div>
    },
    {
        dataIndex : 'stage',
        title : <FormattedMessage id="ws.result.details.stage"/>,
        ellipsis: {
            showTitle: false
        },
        width: 80,
    },
    {
        dataIndex : 'state',
        title : <FormattedMessage id="ws.result.details.state"/>,
        ellipsis: {
            showTitle: false
        },
        width: 80,
        render : evnPrepareState
    },
    {
        dataIndex : 'result',
        title : <FormattedMessage id="ws.result.details.output.results"/>,
        width: 130,
        ...copyTooltipColumn('Nothing to do', formatMessage),
    },
    {
        dataIndex : 'tid',
        title : 'TID',
        ellipsis: {
            showTitle: false
        },
        width: 80,
        render:(_:any) => _.indexOf('API_v2_0_') > -1 ? <EllipsisPulic title={_} /> : <TidDetail tid={_} />
    },
    {
        dataIndex : 'gmt_created',
        title : <FormattedMessage id="ws.result.details.start_time"/>,
        ellipsis: {
            showTitle: false
        },
        width: 130,
    },
    {
        dataIndex : 'gmt_modified',
        title : <FormattedMessage id="ws.result.details.finish_time"/>,
        ellipsis: {
            showTitle: false
        },
        width: 130,
    },
    {
        title: <FormattedMessage id="ws.result.details.view.log"/>,
        ellipsis: {
            showTitle: false
        },
        width: 80,
        render: (_: any) => {
            const strLocals = formatMessage({id: 'ws.result.details.log'})
            // success,fail,stop 可看日志
            if (_.state === 'success' || _.state === 'fail' || _.state === 'stop') {
                if (_.log_file)
                    return  <Button size="small" type="link" style={{ padding: 0 }} onClick={() => window.open(_.log_file)}>{strLocals}</Button>
            }
            return <Button size="small" type="link" style={{ padding: 0 }} disabled={true}>{strLocals}</Button>
        }
    }]

    return (
        <ResizeTable 
            columns={ columns }
            dataSource={ items }
            showHeader={ false }
            rowKey="rowKey" // "id"
            size="small"
            rowClassName={ styles.prep_test_conf_row }
            scroll={{ x: '100%' }}
            pagination={ false }
        />
    )
}