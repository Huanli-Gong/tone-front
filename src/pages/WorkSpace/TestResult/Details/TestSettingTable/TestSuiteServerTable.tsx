import React from 'react'
import { Card, Table, Tooltip } from 'antd'
import { CaretDownFilled, CaretRightFilled } from '@ant-design/icons'
import PopoverEllipsis from '@/components/Public/PopoverEllipsis';
import SuiteCaseExpandTable from './SuiteCaseExpandTable'
import ResizeTable from '@/components/ResizeTable'
export default ({ data = [], testType, provider_name }: any) => {
    let columns: any = [
        {
            title: 'Test Suite',
            dataIndex: 'test_suite_name',
            ellipsis: {
                showTitle: false
            },
        }
    ];
    if (['business_business'].includes(testType)) {
        columns = columns.concat([{
            title: '业务名称',
            dataIndex: 'business_name',
            width: 160,
            ellipsis: {
                showTitle: false
            },
            render: (text: any) => <PopoverEllipsis title={text} />,
        }])
    } else {
        columns = columns.concat([{
            title: '运行模式',
            dataIndex: 'run_mode',
            ellipsis: {
                showTitle: false
            },
        }])
    }

    columns = columns.concat([
        {
            title: '重启',
            dataIndex: 'need_reboot',
            ellipsis: {
                showTitle: false
            },
            render: (_: any) => (
                _ ? '是' : '否'
            )
        },
        {
            title: '脚本',
            dataIndex: 'setup_info',
            ellipsis: {
                showTitle: false
            },
            width: 150,
            render: (_: any, row: any) => (
                <>
                    {(_ || row.cleanup_info) ?
                        <Tooltip placement="topLeft" title={
                            <span>[重启前]: {_ || '-'},  [重启后]: {row.cleanup_info || '-'}</span>}
                        >
                            <span>[重启前]: {_ || '-'},  [重启后]: {row.cleanup_info || '-'}</span>
                        </Tooltip> : '-'
                    }
                </>
            )
        },
        {
            title: 'Console',
            dataIndex: 'console',
            ellipsis: {
                showTitle: false
            },
            render: (_: any) => (_ || '-')
        },
        {
            title: '监控',
            // dataIndex : 'monitor_info',
            ellipsis: {
                showTitle: false
            },
            render: (_: any) => ('-')
        },
        {
            title: '执行优先级',
            dataIndex: 'priority',
            ellipsis: {
                showTitle: false
            },
            render: (_: any) => (_ || '-')
        }
    ]);

    return (
        <Card
            title="测试用例及机器配置"
            style={{ marginBottom: 10 }}
        >
            <ResizeTable
                dataSource={data}
                columns={columns}
                rowKey="test_suite_id"
                size="small"
                pagination={false}
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