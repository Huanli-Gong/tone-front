import React from 'react'
import { Table, Tooltip } from 'antd'
import PopoverEllipsis from '@/components/Public/PopoverEllipsis';
import { ServerTooltip } from './ServerTooltip'
import ResizeTable from '@/components/ResizeTable'
import EllipsisPulic from '@/components/Public/EllipsisPulic';
import { useIntl, FormattedMessage } from 'umi'

//测试用例及机器配置 expand table
export default ({ data = [], testType, provider_name }: any) => {
    const { formatMessage } = useIntl()
    const [columns, setColumns] = React.useState([
        {
            title: 'Test Conf',
            dataIndex: 'test_case_name',
            ellipsis: {
                showTitle: false
            },
            width: 200,
            render: (_: any) => <Tooltip title={_}>{_}</Tooltip>
        },
        {
            title: <FormattedMessage id="ws.result.details.mode" />,
            ellipsis: {
                showTitle: false
            },
            width: 150,
            dataIndex: 'run_mode',
        },
        {
            title: <FormattedMessage id="ws.result.details.the.server" />,
            dataIndex: 'server_ip',
            ellipsis: {
                showTitle: false
            },
            width: 150,
            render: (text: string, row: any) => <ServerTooltip provider_name={provider_name} {...row} />
        },
        {
            title: 'Repeat',
            dataIndex: 'repeat',
            width: 100,
            ellipsis: {
                showTitle: false
            },
        },
        {
            title: <FormattedMessage id="ws.result.details.variable" />,
            ellipsis: {
                showTitle: false
            },
            width: 150,
            render: (_: any) => {
                const envStr = _.env_info && JSON.stringify(_.env_info) !== '{}' ?
                    Object.keys(_.env_info).reduce(
                        (r, k, i) => r += `${i === 0 ? '' : ';'}${k}=${_.env_info[k]}`,
                        ''
                    ) : '-'

                return (
                    <EllipsisPulic title={envStr} width={150} />
                )
            }
        },
        {
            title: <FormattedMessage id="ws.result.details.restart" />,
            dataIndex: 'need_reboot',
            width: 100,
            ellipsis: {
                showTitle: false
            },
            render: (_: any) => (_ ? <FormattedMessage id="operation.yes" /> : <FormattedMessage id="operation.no" />)
        },
        {
            title: <FormattedMessage id="ws.result.details.setup_info" />,
            dataIndex: 'setup_info',
            ellipsis: {
                showTitle: false
            },
            width: 150,
            render: (_: any, row: any) => {
                const before = formatMessage({ id: 'ws.result.details.restart.before' })
                const after = formatMessage({ id: 'ws.result.details.restart.after' })

                const node = <span>[{before}]: {_ || '-'},  [{after}]: {row.cleanup_info || '-'}</span>
                return (_ || row.cleanup_info) ?
                    <Tooltip placement="topLeft" title={node} >
                        {node}
                    </Tooltip> : '-'
            }
        },
        ['business_business'].includes(testType) && {
            title: 'Console',
            dataIndex: 'console',
            width: 100,
            ellipsis: {
                showTitle: false
            },
            render: (text: any) => <PopoverEllipsis title={text} />,
        },
        {
            title: <FormattedMessage id="ws.result.details.monitor" />,
            width: 100,
            ellipsis: {
                showTitle: false
            },
            render: (_: any) => ('-')
        },
        {
            title: <FormattedMessage id="ws.result.details.priority" />,
            dataIndex: 'priority',
            width: 100,
            ellipsis: {
                showTitle: false
            },
        }
    ])

    return (
        <ResizeTable
            dataSource={data}
            columns={columns}
            setColumns={setColumns}
            rowKey="test_case_id"
            pagination={false}
            size="small"
            scroll={{ x: '100%' }}
        />
    )
}