import React, { useState } from 'react'
import { CaretDownFilled, CaretRightFilled } from '@ant-design/icons'
import { Table, Card, Button, Typography } from 'antd'
import { evnPrepareState, tooltipTd } from '../components/index'
import ProcessExpandTable from './ProcessExpandTable'
import ServerLink from '@/components/MachineWebLink/index';
import { queryProcessPrepareList } from '../service'
import { useRequest, useIntl, FormattedMessage, useParams } from 'umi'
import styles from './index.less'
import ResizeTable from '@/components/ResizeTable'
import EllipsisPulic from '@/components/Public/EllipsisPulic'
import { v4 as uuidv4 } from 'uuid';

//测试准备 ==== Table
export default ({ refresh = false, provider_name }: any) => {
    const { id: job_id, ws_id } = useParams() as any
    const { formatMessage } = useIntl()
    // 表格展开的行
    const [expandedKeys, setExpandedKeys] = useState<any>([])

    const { data, loading } = useRequest(
        () => queryProcessPrepareList({ job_id, ws_id }),
        {
            refreshDeps: [refresh]
        }
    )

    if (!data) return <></>

    const columns = [
        {
            dataIndex: 'server_type',
            title: <FormattedMessage id="ws.result.details.mode" />,
            ellipsis: {
                showTitle: false
            },
            width: 80,
            render: (_: any) => {
                return formatMessage({ id: _ })
            },
        },
        {
            dataIndex: 'server',
            width: 220,
            title: <FormattedMessage id="ws.result.details.test.server" />,
            ellipsis: {
                showTitle: false
            },
            render: (_: any, row: any) => {
                if (row.server_type === "cluster") {
                    return <EllipsisPulic title={_} />
                }
                return (
                    <ServerLink
                        val={_}
                        param={row.server_id}
                        provider={provider_name}
                        description={row.server_description}
                    />
                )
            }
        },
        {
            dataIndex: 'stage',
            title: <FormattedMessage id="ws.result.details.stage" />,
            ellipsis: {
                showTitle: false
            },
            width: 150,
            render(_) {
                return <Typography.Text ellipsis={{ tooltip: true }}>{_ || "-"}</Typography.Text>
            }
        },
        {
            dataIndex: 'state',
            title: <FormattedMessage id="ws.result.details.state" />,
            ellipsis: {
                showTitle: false
            },
            width: 80,
            render: evnPrepareState
        },
        {
            dataIndex: 'result',
            title: <FormattedMessage id="ws.result.details.output.results" />,
            render(_, row) {
                return <Typography.Text ellipsis={{ tooltip: true }}>{_ || "-"}</Typography.Text>
            }
        },
        {
            dataIndex: 'tid',
            title: 'TID',
            ellipsis: {
                showTitle: false
            },
            render() {
                return "-"
            }
        },
        {
            dataIndex: 'gmt_created',
            title: <FormattedMessage id="ws.result.details.start_time" />,
            width: 170,
            ...tooltipTd(),
        },
        {
            dataIndex: 'gmt_modified',
            title: <FormattedMessage id="ws.result.details.finish_time" />,
            width: 170,
            ...tooltipTd(),
        },
        {
            title: <FormattedMessage id="ws.result.details.view.log" />,
            width: 80,
            ellipsis: {
                showTitle: false
            },
            render: (_: any) => {
                const strLocals = formatMessage({ id: 'ws.result.details.log' })
                // success,fail,stop 可看日志
                if (_.state === 'success' || _.state === 'fail' || _.state === 'stop') {
                    if (_.log_file)
                        return <Button size="small" type="link" style={{ padding: 0 }} onClick={() => window.open(_.log_file)}>{strLocals}</Button>
                }
                return <Button size="small" type="link" style={{ padding: 0 }} disabled={true}>{strLocals}</Button>
            }
        }
    ]

    const clusterColumns = [
        { width: 150 },
        {
            dataIndex: 'server',
            title: <FormattedMessage id="ws.result.details.test.server" />,
            width: 300,
            render: (_: any, row: any) => (
                _ ?
                    <ServerLink
                        val={_}
                        param={row.server_id}
                        provider={provider_name}
                    />
                    : '-'
            )
        },
        {}, {}, {}, {}, {}
    ]

    return (
        <Card
            title={<FormattedMessage id="ws.result.details.test.preparation" />}
            bodyStyle={{ paddingTop: 0 }}
            headStyle={{ borderBottom: 'none', borderTop: 'none' }}
            style={{ marginBottom: 10, borderTop: 'none' }}
        >
            <ResizeTable
                dataSource={data || []}
                columns={columns}
                rowKey="server_id"
                loading={loading}
                size="small"
                className={styles.prepTable}
                pagination={false}
                scroll={{ x: "100%" }}
                expandable={{
                    columnWidth: 47,
                    expandedRowClassName: () => 'expanded-row-padding-no',
                    expandedRowKeys: expandedKeys,
                    onExpand: (expanded: any, record) => {
                        return expanded ? setExpandedKeys(expandedKeys.concat(record.server_id)) :
                            setExpandedKeys(expandedKeys.filter((i: any) => i !== record.server_id))
                    },
                    expandedRowRender: (record: any) => {
                        if (record.server_type === 'cluster') {
                            return Object.keys(record.server_list).map((item: any) => {
                                const source = record.server_list[item]
                                return (
                                    <div style={{ width: "100%", display: "flex", flexDirection: "column" }} >
                                        <Table
                                            key={item}
                                            dataSource={[{ server: item, id: uuidv4(), server_id: item }]}
                                            columns={clusterColumns}
                                            size={'small'}
                                            rowKey="id"
                                            showHeader={false}
                                            pagination={false}
                                        />
                                        <ProcessExpandTable
                                            {...record}
                                            dataSource={
                                                source.map((i: any) => ({ id: uuidv4(), ...i }))
                                            }
                                        />
                                    </div>
                                )
                            })
                        }
                        return (
                            <ProcessExpandTable
                                {...record}
                                dataSource={record.server_list.map((i: any) => ({ id: uuidv4(), ...i }))}
                            />
                        )
                    },
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

