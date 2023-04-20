/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react'
import { Table, message, Row, Space, Button, Checkbox, Typography, Avatar, Tag, Badge } from 'antd'
import { useIntl, FormattedMessage } from "umi"
import { queryWorkspaceApproveList, optWorkspaceApprove } from '@/services/Workspace'
import { requestCodeMessage } from '@/utils/utils'

export default (props: any) => {
    const { formatMessage } = useIntl()
    const { onChange } = props
    const { ws_id } = props.match.params
    const status = props.status

    const [dataSource, setDataSource] = useState<any>([])
    const [loading, setLoading] = useState(true)
    const [selectedRowKeys, setSelectedRowKeys] = useState<any[]>([])

    const [pedding, setPedding] = useState(false)

    const [total, setTotal] = useState(0)
    const [pagenat, setPagenat] = useState<any>({
        page_num: 1,
        page_size: 20
    })


    const initData = async () => {
        setLoading(true)
        const { total: pageTotal, data, code, msg } = await queryWorkspaceApproveList({
            status: props.status,
            object_id: ws_id,
            ws_id,
            action: 'join',
            ...pagenat
        })

        if (code === 200) {
            setDataSource(data)
            setTotal(pageTotal)
        }
        else requestCodeMessage(code, msg)
        setLoading(false)
    }

    const rowSelection = + status === 0 ? {
        selectedRowKeys,
        onChange: (keys: any[]) => {
            setSelectedRowKeys(keys)
        }
    } : undefined

    const SwitchApproveClass = (_: any) => {
        // return (<JoinWorkspace />)
        switch (_.object_type) {
            case 'workspace': return (
                <div>
                    <Tag color="#1890FF"><FormattedMessage id="add" /></Tag>
                    <Typography.Text><FormattedMessage id="join.workspace" /></Typography.Text>
                </div>
            )
            default: return (<Space />)
        }
    }

    const hanldeOption = async (action: {
        id: number,
        name: string,
    }) => {
        if (pedding) return
        setPedding(true)
        const { code, msg } = await optWorkspaceApprove({ action: action.name, id: action.id, ws_id })

        if (code === 200) {
            initData()
            message.success(formatMessage({ id: 'operation.success' }))
            onChange()
        }
        else requestCodeMessage(code, msg)
        setPedding(false)
    }

    let columns: any[] = [
        {
            title: <FormattedMessage id="application.type" />,
            dataIndex: 'name',
            render: (_: any, record: any) => (
                <SwitchApproveClass {...record} />
            )
        },
        {
            title: <FormattedMessage id="proposer_name" />,
            dataIndex: 'name',
            render: (_: any, record: any) => (
                <Space>
                    <Avatar size={25} src={record.proposer_avatar} />
                    <Typography.Text>{record.proposer_name}</Typography.Text>
                </Space>
            )
        },
        {
            title: <FormattedMessage id="application.reason" />,
            dataIndex: 'reason'
        },
        {
            title: <FormattedMessage id="application.time" />,
            dataIndex: 'gmt_created'
        },
    ]

    if (status === '1') {
        columns = [
            ...columns,
            {
                title: <FormattedMessage id="approval.time" />,
                dataIndex: 'gmt_modified'
            },
            {
                title: <FormattedMessage id="approval.result" />,
                render: (_: any) => (
                    <Space>
                        <Badge status={_.status === 'passed' ? 'success' : 'warning'} />
                        <Typography.Text>
                            {
                                _.status === 'passed' ? <FormattedMessage id="passed" /> : <FormattedMessage id="rejected" />
                            }
                        </Typography.Text>
                    </Space>
                )
            }
        ]
    }
    else {
        columns = [
            ...columns,
            {
                title: <FormattedMessage id="Table.columns.operation" />,
                render: (_: any) => (
                    <Space>
                        <Button
                            style={{ padding: 0 }}
                            type="link"
                            onClick={() => hanldeOption({ id: _.id, name: 'pass' })}
                        >
                            <FormattedMessage id="operation.pass" />
                        </Button>
                        <Button
                            style={{ padding: 0 }}
                            type="link"
                            onClick={() => hanldeOption({ id: _.id, name: 'refuse' })}
                        >
                            <FormattedMessage id="operation.refuse" />
                        </Button>
                    </Space>
                )
            }
        ]
    }

    const handleBatchOption = async (action: string) => {
        const { code, msg } = await optWorkspaceApprove({
            ws_id,
            id_list: selectedRowKeys,
            action
        })

        if (code === 200) {
            setSelectedRowKeys([])
            initData()
            message.success(formatMessage({ id: 'operation.success' }))
        }
        else requestCodeMessage(code, msg)
    }

    useEffect(() => {
        initData()
    }, [pagenat])

    return (
        <>
            <Table
                size="small"
                columns={columns}
                rowKey="id"
                rowSelection={rowSelection}
                loading={loading}
                dataSource={dataSource}
                // onHeaderRow={( column, index ) => {
                //     return {
                //         onClick: event => { 
                //             console.log( event.target.innerHTML )
                //         }, // 点击行
                //     };
                // }}
                pagination={{
                    //hideOnSinglePage: true,
                    showQuickJumper: true,
                    defaultCurrent: 1,
                    showTotal: t => formatMessage({ id: 'pagination.total.strip' }, { data: t }),
                    total: total,
                    pageSize: pagenat.page_size,
                    onChange: (page_num, page_size) => setPagenat({
                        ...pagenat,
                        page_num,
                        page_size
                    })
                }}
            />
            {
                selectedRowKeys.length > 0 &&
                <Row
                    justify="space-between"
                    style={{
                        paddingRight: 20,
                        height: 64,
                        position: 'absolute',
                        left: 0,
                        bottom: -64,
                        width: '100%',
                        background: '#fff',
                        paddingLeft: 24,
                        boxShadow: '0 -9px 28px 8px rgba(0,0,0,0.05), 0 -6px 16px 0 rgba(0,0,0,0.08), 0 -3px 6px -4px rgba(0,0,0,0.12)'
                    }}
                >
                    <Space>
                        <Checkbox indeterminate={true} />
                        <Typography.Text>{formatMessage({ id: 'selected.item' }, { data: selectedRowKeys.length })}</Typography.Text>
                        <Button type="link" onClick={() => setSelectedRowKeys([])}><FormattedMessage id="operation.cancel" /></Button>
                    </Space>
                    <Space>
                        <Button onClick={() => handleBatchOption('refuse')}><FormattedMessage id="batch.reject" /></Button>
                        <Button onClick={() => handleBatchOption('pass')} type="primary"><FormattedMessage id="batch.pass" /></Button>
                    </Space>
                </Row>
            }
        </>
    )
}