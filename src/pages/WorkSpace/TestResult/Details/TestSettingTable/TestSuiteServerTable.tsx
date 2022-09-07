import React from 'react'
import { Card, Table, Tooltip } from 'antd'
import { CaretDownFilled, CaretRightFilled } from '@ant-design/icons'
import PopoverEllipsis from '@/components/Public/PopoverEllipsis';
import SuiteCaseExpandTable from './SuiteCaseExpandTable'
import ResizeTable from '@/components/ResizeTable'
import { useIntl, FormattedMessage } from 'umi'

export default ({ data = [], testType, provider_name }: any) => {
    const { formatMessage } = useIntl()
    let columns: any = [
        {
            title: 'Test Suite',
            dataIndex: 'test_suite_name',
            width: 160,
            ellipsis: {
                showTitle: false
            },
        }
    ];
    if (['business_business'].includes(testType)) {
        columns = columns.concat([{
            title: <FormattedMessage id="ws.result.details.business_name"/>,
            dataIndex: 'business_name',
            width: 160,
            ellipsis: {
                showTitle: false
            },
            render: (text: any) => <PopoverEllipsis title={text} />,
        }])
    } else {
        columns = columns.concat([{
            title: <FormattedMessage id="ws.result.details.mode"/>,
            dataIndex: 'run_mode',
            width: 160,
            ellipsis: {
                showTitle: false
            },
        }])
    }

    columns = columns.concat([
        {
            title: <FormattedMessage id="ws.result.details.restart"/>,
            dataIndex: 'need_reboot',
            ellipsis: {
                showTitle: false
            },
            width: 100,
            render: (_: any) => (
                _ ? <FormattedMessage id="operation.yes"/>: <FormattedMessage id="operation.no"/>
            )
        },
        {
            title: <FormattedMessage id="ws.result.details.setup_info"/>,
            dataIndex: 'setup_info',
            ellipsis: {
                showTitle: false
            },
            width: 150,
            render: (_: any, row: any) => {
                const before = formatMessage({id: 'ws.result.details.restart.before'})
                const after = formatMessage({id: 'ws.result.details.restart.after'})
                return (
                    <>
                        {(_ || row.cleanup_info) ?
                            <Tooltip placement="topLeft" title={
                                <span>[{before}]: {_ || '-'},  [{after}]: {row.cleanup_info || '-'}</span>}
                            >
                                <span>[{before}]: {_ || '-'},  [{after}]: {row.cleanup_info || '-'}</span>
                            </Tooltip> : '-'
                        }
                    </>
                )
            }
        },
        {
            title: 'Console',
            dataIndex: 'console',
            ellipsis: {
                showTitle: false
            },
            width: 100,
            render: (_: any) => (_ || '-')
        },
        {
            title: <FormattedMessage id="ws.result.details.monitor"/>,
            // dataIndex : 'monitor_info',
            ellipsis: {
                showTitle: false
            },
            width: 100,
            render: (_: any) => ('-')
        },
        {
            title: <FormattedMessage id="ws.result.details.priority"/>,
            dataIndex: 'priority',
            ellipsis: {
                showTitle: false
            },
            width: 100,
            render: (_: any) => (_ || '-')
        }
    ]);

    return (
        <Card
            title={<FormattedMessage id="ws.result.details.test.cases.and.config"/>}
            style={{ marginBottom: 10 }}
        >
            <ResizeTable
                dataSource={data}
                columns={columns}
                rowKey="test_suite_id"
                size="small"
                pagination={false}
                scroll={{ x: '100%' }}
                expandable={{
                    expandedRowRender: (record: any) => (
                        <SuiteCaseExpandTable data={record.cases} testType={testType} provider_name={provider_name} />
                    ),
                    expandIcon: ({ expanded, onExpand, record }: any) => (
                        expanded ?
                            (<CaretDownFilled onClick={e => onExpand(record, e)} />) :
                            (<CaretRightFilled onClick={e => onExpand(record, e)} />)
                    )
                }}
            />
        </Card>
    )
}