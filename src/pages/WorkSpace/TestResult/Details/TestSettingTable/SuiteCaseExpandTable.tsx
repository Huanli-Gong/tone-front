import React from 'react'
import { Table, Tooltip } from 'antd'
import PopoverEllipsis from '@/components/Public/PopoverEllipsis';
import { ServerTooltip } from './ServerTooltip'
import ResizeTable from '@/components/ResizeTable'
//测试用例及机器配置 expand table
export default ({ data = [], testType, provider_name }: any) => {
    const columns: any = [
        {
            title: 'Test Conf',
            dataIndex: 'test_case_name',
            ellipsis: {
                showTitle: false
            },
            width: 200,
            render: (_: any) => <Tooltip title={_}>{_}</Tooltip>
        }, {
            title: '运行模式',
            ellipsis: {
                showTitle: false
            },
            dataIndex: 'run_mode',
        }, {
            title: '机器',
            dataIndex: 'server_ip',
            ellipsis: {
                showTitle: false
            },
            width: 150,
            render: (text: string, row: any) => <ServerTooltip provider_name={provider_name} {...row} />
        }, {
            title: 'Repeat',
            dataIndex: 'repeat',
        }, {
            title: '变量',
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
                    <Tooltip title={envStr}>
                        {envStr}
                    </Tooltip>
                )
            }
        }, {
            title: '重启',
            dataIndex: 'need_reboot',
            render: (_: any) => (_ ? '是' : '否')
        }, {
            title: '脚本',
            dataIndex: 'setup_info',
            ellipsis: {
                showTitle: false
            },
            width: 150,
            render: (_: any, row: any) => {
                const node = <span>[重启前]: {_ || '-'},  [重启后]: {row.cleanup_info || '-'}</span>
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
            title: '监控',
            render: (_: any) => ('-')
        }, {
            title: '执行优先级',
            dataIndex: 'priority',
        }
    ].filter(Boolean);

    return (
        <ResizeTable
            dataSource={data}
            columns={columns}
            rowKey="test_case_id"
            pagination={false}
            size="small"
        />
    )
}