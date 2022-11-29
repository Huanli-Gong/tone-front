import React, { useEffect, useState } from 'react'
import { CaretDownFilled, CaretRightFilled } from '@ant-design/icons'
import { Table, Card, Button } from 'antd'
import { evnPrepareState, tooltipTd } from '../components/index'
import ProcessExpandTable from './ProcessExpandTable'
import ServerLink from '@/components/MachineWebLink/index';
import { queryProcessPrepareList } from '../service'
import { useRequest, useIntl, FormattedMessage } from 'umi'
import styles from './index.less'
import { requestCodeMessage, matchMode } from '@/utils/utils'
import ResizeTable from '@/components/ResizeTable'
import EllipsisPulic from '@/components/Public/EllipsisPulic'
import TidDetail from './QueryTidList';
//测试准备 ==== Table
export default ({ job_id, refresh = false, provider_name }: any) => {
    const { formatMessage } = useIntl()
    // 表格展开的行
    const [expandedKeys, setExpandedKeys] = useState<any>([])

    const { data, loading, run } = useRequest(
        () => queryProcessPrepareList({ job_id }),
        {
            formatResult: res => {
                if (res.code !== 200) {
                    requestCodeMessage(res.code, res.msg)
                    return []
                }

                const [{ test_prepare }] = res.data
                const { cluster, standalone, data } = test_prepare

                if (cluster || standalone) {
                    const tableData = transPrepareData(cluster, '集群', data).concat(transPrepareData(standalone, '单机', {}))
                    return tableData
                }
                return []
            },
            manual: true
        }
    )

    useEffect(() => {
        run()
    }, [refresh])

    const transPrepareData = (datas: any, mode: string, data: any) => {
        let source: any = []
        if (JSON.stringify(datas) !== '{}') {
            if (mode === '单机') {
                let list: any = []
                Object.keys(datas).forEach((key, index) => {
                    const items = datas[key];
                    let column: any = {}
                    for (let i = 0; i < items.length; i++) {
                        const item = items[i]
                        if (column[item.server]) {
                            column[item.server].items.push({ ...item, rowKey: `${index}${i}`, })
                        } else {
                            column[item.server] = {
                                ...item, mode, key, rowKey: `${index}${i}`,
                                items: [{ ...item, rowKey: `${index}${i}`, }]
                            }
                        }
                    }
                    list.push(column)
                }
                )
                list.forEach((i: any, index: any) => {
                    const keyNameList = Object.keys(i)

                    keyNameList.forEach((key: any) => {
                        let column = i[key]
                        const server = i[key]
                        for (let t = 0, len = server.items.length; t < len; t++) {
                            let ctx = server.items[t]
                            column = { ...ctx, mode, items: server.items }
                            if (ctx.state === 'fail') break;
                        }
                        source.push(column)
                    })
                })
            }
            else {
                let list: any = []
                Object.keys(datas).forEach((key: any) => {
                    const item = datas[key]
                    let items: any = []
                    let column = {}
                    Object.keys(item).forEach((server, idx) => {
                        if (idx === 0) {
                            for (let x = 0; x < item[server].length; x++) {
                                const r = item[server][x]
                                column = { ...data, server: key }
                                if (r.state === 'fail') break;
                            }
                        }
                        return items.push({ server, items: item[server] })
                    })
                    list.push({ ...column, rowKey: key, mode, items })
                })
                source = source.concat(list)
            }

            return source
        }
        return source
    }

    const columns = [
        {
            dataIndex: 'mode',
            title: <FormattedMessage id="ws.result.details.mode" />,
            ellipsis: {
                showTitle: false
            },
            width: 80,
            render: (_: any) => {
                return <FormattedMessage id={matchMode(_)} defaultMessage={_ || '-'} />
            },
        },
        {
            dataIndex: 'server',
            width: 120,
            title: <FormattedMessage id="ws.result.details.test.server" />,
            ellipsis: {
                showTitle: false
            },
            render: (_: any, row: any) => {
                if (row.mode === '集群') {
                    return <EllipsisPulic title={_} />
                } else {
                    return <ServerLink
                        val={_}
                        param={row.server_id}
                        provider={provider_name}
                        description={row.server_description}
                    />
                }
            }
        },
        {
            dataIndex: 'stage',
            title: <FormattedMessage id="ws.result.details.stage" />,
            ellipsis: {
                showTitle: false
            },
            width: 80,
            render: (_: any) => _ || '-'
        },
        {
            dataIndex: 'state',
            title: <FormattedMessage id="ws.result.details.state" />,
            ellipsis: {
                showTitle: false
            },
            render: evnPrepareState
        },
    ]
    const childColumns = [
        ...columns,
        {
            dataIndex: 'result',
            title: <FormattedMessage id="ws.result.details.output.results" />,
            width: 100,
            ...tooltipTd('Nothing to do'),
        },
        {
            dataIndex: 'tid',
            title: 'TID',
            ellipsis: {
                showTitle: false
            },
            width: 80,
            render: (_: any) => _ && _.length ? _.indexOf('API_v2_0_') > -1 ? <EllipsisPulic title={_} /> : <TidDetail tid={_} /> : '-'
        },
        {
            dataIndex: 'gmt_created',
            title: <FormattedMessage id="ws.result.details.start_time" />,
            ...tooltipTd(),
        },
        {
            dataIndex: 'gmt_modified',
            title: <FormattedMessage id="ws.result.details.finish_time" />,
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
        {},
        {
            dataIndex: 'server',
            title: <FormattedMessage id="ws.result.details.test.server" />,
            width: 120,
            render: (_: any, row: any) => (
                _ ?
                    <ServerLink
                        val={_}
                        param={row.items[0]?.server_id}
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
                dataSource={data}
                columns={columns}
                rowKey="rowKey"
                loading={loading}
                size="small"
                className={styles.prepTable}
                pagination={false}
                scroll={{ x: '100%' }}
                expandable={{
                    columnWidth: 47,
                    expandedRowClassName: () => 'expanded-row-padding-no',
                    expandedRowKeys: expandedKeys,
                    onExpand: (expanded: any, record) => {
                        return expanded ? setExpandedKeys(expandedKeys.concat(record.rowKey)) :
                            setExpandedKeys(expandedKeys.filter((i: any) => i !== record.rowKey))
                    },
                    expandedRowRender: (record: any) => {
                        if (record.mode === '集群') {
                            return record.items.map((item: any) => (
                                <Table
                                    dataSource={[item]}
                                    columns={clusterColumns}
                                    size={'small'}
                                    rowKey="rowKey"
                                    showHeader={false}
                                    pagination={false}
                                    expandable={{
                                        expandIcon: () => false,
                                        defaultExpandAllRows: true,
                                        expandedRowRender: (record: any) => {
                                            return (
                                                <ProcessExpandTable {...record} />
                                            )
                                        }
                                    }}
                                />
                            ))
                        }
                        if (record.hasChildren) {
                            return (
                                <ResizeTable
                                    dataSource={record.items}
                                    columns={childColumns}
                                    rowKey="rowKey"
                                    size="small"
                                    showHeader={false}
                                    pagination={false}
                                    expandable={{
                                        expandIcon: () => false,
                                        defaultExpandAllRows: true,
                                        expandedRowRender: (record: any) => {
                                            return (
                                                <ProcessExpandTable {...record} />
                                            )
                                        },
                                    }}
                                />
                            )
                        }
                        return (
                            <ProcessExpandTable {...record} />
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

