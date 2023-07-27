import { Popover, Table } from 'antd'
import { useIntl, FormattedMessage } from 'umi'
import { evnPrepareState, tooltipTd } from '../components/index'
import styles from './index.less';
import TidDetail from './QueryTidList';
import { ColumnEllipsisText } from '@/components/ColumnComponents';

export default ({ title = '', need_reboot, setup_info, cleanup_info, step }: any) => {
    const { formatMessage } = useIntl()
    const columns = [
        {
            title: <FormattedMessage id="ws.result.details.stage" />,
            dataIndex: 'stage',
            ...tooltipTd(),
        },
        {
            title: <FormattedMessage id="ws.result.details.state" />,
            dataIndex: 'state',
            render: evnPrepareState
        },
        {
            title: <FormattedMessage id="ws.result.details.output.results" />,
            dataIndex: 'result',
            ...tooltipTd(),
        },
        {
            title: 'TID',
            dataIndex: 'tid',
            ellipsis: {
                showTitle: false
            },
            render: (_: any) => _ && _.length ? _.indexOf('API_v2_0_') > -1 ? <ColumnEllipsisText ellipsis={{ tooltip: true }} >{_}</ColumnEllipsisText> : <TidDetail tid={_} /> : '-'
        },
        {
            title: <FormattedMessage id="ws.result.details.gmt_created" />,
            dataIndex: 'gmt_created',
            ...tooltipTd(),
        },
        {
            title: <FormattedMessage id="ws.result.details.gmt_modified" />,
            dataIndex: 'gmt_modified',
            ...tooltipTd(),
        }
    ]

    const needReboot = need_reboot ? formatMessage({ id: 'ws.result.details.restart.server' }) : ''
    const hasScript = setup_info || cleanup_info ? formatMessage({ id: 'ws.result.details.execute.script' }) : ''

    if (needReboot || hasScript)
        return (
            <Popover
                // placement={ 'leftTop' }
                overlayStyle={{
                    width: 850
                }}
                arrowPointAtCenter
                className={styles.step_table_popover}
                title={title}
                content={
                    <Table
                        size="small"
                        rowKey="uid"
                        columns={columns}
                        style={{ width: 810 }}
                        dataSource={step}
                        pagination={false}
                    />
                }
            >
                <span className={styles.popover_text_span}>
                    {`${needReboot}${(needReboot && hasScript) && '、'}${hasScript}`}
                </span>
            </Popover>
        )
    return <>-</>
}