import React, { useState } from 'react'
import { CaretDownFilled, CaretRightFilled } from '@ant-design/icons'
import { Table, Card, Typography, Empty } from 'antd'
import type { TableColumnsType } from "antd"
import { evnPrepareState, tooltipTd } from '../components/index'
import ProcessExpandTable from './ProcessExpandTable'
import ServerLink from '@/components/MachineWebLink/index';
import { queryProcessPrepareList } from '../service'
import { useRequest, useIntl, FormattedMessage, useParams } from 'umi'
import styles from './index.less'
import { v4 as uuidv4 } from 'uuid';
import { ResizeHooksTable } from '@/utils/table.hooks'
import { ColumnEllipsisText } from '@/components/ColumnComponents'

//测试准备 ==== Table
const TestPrepTable: React.FC<AnyType> = (props) => {
    const { refresh = false, provider_name } = props
    const { id: job_id, ws_id, share_id } = useParams() as any
    const { formatMessage } = useIntl()
    // 表格展开的行
    const [expandedKeys, setExpandedKeys] = useState<any>([])
    const [columnsChange, setColumnsChange] = React.useState(uuidv4())

    const { data, loading } = useRequest(
        () => queryProcessPrepareList({ job_id, ws_id, share_id }),
        {
            refreshDeps: [refresh]
        }
    )

    if (!data) return <></>

    const columns: TableColumnsType<AnyType> = [
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
                    return <ColumnEllipsisText ellipsis={{ tooltip: true }} >{_}</ColumnEllipsisText>
                }
                return (
                    <ServerLink
                        {...row}
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
                return <ColumnEllipsisText ellipsis={{ tooltip: true }}>{_ || "-"}</ColumnEllipsisText>
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
            ellipsis: {
                showTitle: false,
            },
            title: <FormattedMessage id="ws.result.details.output.results" />,
            render(_) {
                return <ColumnEllipsisText ellipsis={{ tooltip: true }}>{_ || "-"}</ColumnEllipsisText>
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
            key: "log",
            fixed: "right",
            ellipsis: {
                showTitle: false
            },
            render: (_: any) => {
                const strLocals = formatMessage({ id: 'ws.result.details.log' })
                // success,fail,stop 可看日志
                if (!share_id && ["success", "fail", "stop"].includes(_.state)) {
                    if (_.log_file)
                        return <Typography.Link href={_.log_file} target="_blank">{strLocals}</Typography.Link>
                }
                return <Typography.Link disabled={true}>{strLocals}</Typography.Link>
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
                        {...row}
                        val={_}
                        param={row.server_id}
                        provider={provider_name}
                    />
                    : '-'
            )
        },
        {}, {}, {}, {}, {}
    ]
    const TABLE_NAME = "ws-job-result-process-parent"

    const dataSource = data?.map((i: any, idx: number) => (
        {
            ...i,
            rowKey: `${i.server_id || i.server}-${idx}`,
            exists: i?.server_list_exists?.[i?.server]
        })
    )

    return (
        <Card
            title={<FormattedMessage id="ws.result.details.test.preparation" />}
            bodyStyle={{ paddingTop: 0 }}
            headStyle={{ borderBottom: 'none', borderTop: 'none' }}
            style={{ marginBottom: 10, borderTop: 'none' }}
        >
            <ResizeHooksTable
                dataSource={dataSource}
                columns={columns}
                name={TABLE_NAME}
                onColumnsChange={() => setColumnsChange(uuidv4())}
                rowKey="rowKey"
                loading={loading}
                size="small"
                className={styles.prepTable}
                pagination={false}
                expandable={{
                    columnWidth: 47,
                    expandedRowClassName: () => 'expanded-row-padding-no',
                    expandedRowKeys: expandedKeys,
                    onExpand: (expanded: any, record) => {
                        return expanded ? setExpandedKeys(expandedKeys.concat(record.rowKey)) :
                            setExpandedKeys(expandedKeys.filter((i: any) => i !== record.rowKey))
                    },
                    expandedRowRender: (record: any) => {
                        if (record?.server_type === 'cluster') {
                            if (!record?.server_list) return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                            return Object.keys(record.server_list).map((item: any) => {
                                const source = record.server_list[item]
                                const getServerId = source?.[0]?.server_id

                                return (
                                    <div
                                        style={{ width: "100%", display: "flex", flexDirection: "column" }}
                                        key={item}
                                    >
                                        <Table
                                            dataSource={[
                                                {
                                                    server: item,
                                                    id: getServerId,
                                                    server_id: getServerId,
                                                    exists: record?.server_list_exists?.[item]
                                                }
                                            ]}
                                            columns={clusterColumns}
                                            size={'small'}
                                            rowKey="id"
                                            showHeader={false}
                                            pagination={false}
                                        />
                                        <ProcessExpandTable
                                            {...record}
                                            columnsChange={columnsChange}
                                            parentTableName={TABLE_NAME}
                                            dataSource={
                                                source.map((i: any, dx: number) => ({ ...i, id: `${item}-${dx}` }))
                                            }
                                        />
                                    </div>
                                )
                            })
                        }
                        return (
                            <ProcessExpandTable
                                {...record}
                                parentTableName={TABLE_NAME}
                                columnsChange={columnsChange}
                                dataSource={record?.server_list?.map((i: any, dx: number) => ({ ...i, id: `${i?.server_id}-${dx}` }))}
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
export default TestPrepTable

