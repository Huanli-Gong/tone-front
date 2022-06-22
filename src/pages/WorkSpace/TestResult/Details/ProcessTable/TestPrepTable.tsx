import React, { useEffect, useState } from 'react'
import { CaretDownFilled, CaretRightFilled } from '@ant-design/icons'
import { Table, Card, message, Tooltip } from 'antd'
import { evnPrepareState, tooltipTd } from '../components/index'
import ProcessExpandTable from './ProcessExpandTable'
import Clipboard from 'clipboard'
import { handleIpHerf } from '@/components/MachineWebLink/index';
import { queryProcessPrepareList } from '../service'
import { useRequest } from 'umi'
import styles from './index.less'
import { requestCodeMessage } from '@/utils/utils'

//测试准备 ==== Table
export default ({ job_id, refresh = false, provider_name }: any) => {
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
                const { cluster, standalone } = test_prepare

                if (cluster || standalone) {
                    const tableData = transPrepareData(cluster, '集群').concat(transPrepareData(standalone, '单机'))
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

    const transPrepareData = (datas: any, mode: string) => {
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
                                column = { ...r, server }
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

    useEffect(() => {
        const clipboard = new Clipboard('.test_result_tooptip_btn')
        clipboard.on('success', function (e) {
            message.success('复制成功')
            e.clearSelection();
        })
        return () => {
            clipboard.destroy()
        }
    }, [])

    const columns = [
        {
            dataIndex: 'mode',
            title: '运行模式',
            render: (_: any) => _ || '-'
        },
        {
            dataIndex: 'server',
            title: '测试机器',
            render: (_: any, row: any) => {
                if(_){
                    return <Tooltip placement="topLeft" title={_}>
                        <div onClick={()=> handleIpHerf(_,provider_name)} style={{ color: '#1890ff', cursor: 'pointer' }}>{_}</div>
                    </Tooltip>
                }
                return '-'
            }
        },
        {
            dataIndex: 'stage',
            title: '步骤',
            render: (_: any) => _ || '-'
        },
        {
            dataIndex: 'state',
            title: '状态',
            render: evnPrepareState
        },
        {
            dataIndex: 'result',
            title: '输出结果',
            ...tooltipTd('Nothing to do'),
        },
        {
            dataIndex: 'tid',
            title: 'TID',
            ...tooltipTd(),
        },
        {
            dataIndex: 'gmt_created',
            title: '开始时间',
            ...tooltipTd(),
        },
        {
            dataIndex: 'gmt_modified',
            title: '完成时间',
            ...tooltipTd(),
        },
    ]

    const clusterColumns = [
        {},
        {
            dataIndex: 'server',
            title: '测试机器',
            render: (_: any, row: any) => (
                _ ?
                    <span>{_}</span>
                    : '-'
            )
        },
        {}, {}, {}, {}, {}
    ]

    return (
        <Card
            title="测试准备"
            bodyStyle={{ paddingTop: 0 }}
            headStyle={{ borderBottom: 'none', borderTop: 'none' }}
            style={{ marginBottom: 10, borderTop: 'none' }}
        >
            <Table
                dataSource={data}
                columns={columns}
                rowKey="rowKey"
                loading={loading}
                size="small"
                className={styles.prepTable}
                pagination={false}
                expandable={{
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
                                <Table
                                    dataSource={record.items}
                                    columns={columns}
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

