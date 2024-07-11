/* eslint-disable react-hooks/exhaustive-deps */
import { Space, Tooltip, Input, Button, Typography } from 'antd'
import { FilterFilled } from '@ant-design/icons'

import React, { useRef, useEffect, useState } from 'react'
import { useRequest, Access, useAccess, useParams, useIntl, FormattedMessage } from 'umi'
import { queryCaseResult } from '../service'
import EditRemarks from '../components/EditRemarks'
import JoinBaseline from '../components/JoinBaseline'
import { QusetionIconTootip } from '@/components/Product';
import qs from 'querystring'

import Highlighter from 'react-highlight-words'

import { tooltipTd } from '../components'
import styles from './index.less'
import { AccessTootip } from '@/utils/utils'
import { ResizeHooksTable } from '@/utils/table.hooks'
import { ColumnEllipsisText } from '@/components/ColumnComponents'
import { MetricSelectProvider } from '.'

const stateWordMap = (st: string) => new Map([
    ["success", 1],
    ["fail", 2],
    ["skip", 5],
    ["warn", 6],
]).get(st) || undefined

export default (props: any) => {
    const { formatMessage } = useIntl()
    const { ws_id, id: job_id, share_id } = useParams() as any
    const access = useAccess()
    const {
        test_case_id, suite_id, testType, creator,
        server_provider, state = '', suite_name, conf_name,
        refreshId, setRefreshId
    } = props
    const { setFuncCase, funcCase } = React.useContext(MetricSelectProvider)
    const editRemark: any = useRef(null)
    const joinBaseline: any = useRef(null)
    const searchInput: any = useRef(null)

    const $test_type = ["performance", "性能测试"].includes(testType) ? "performance" : "functional"

    const defaultKeys = {
        job_id,
        case_id: test_case_id,
        suite_id,
        ws_id,
        sub_case_name: undefined,
        sub_case_result: undefined,
        page_size: 100,
        page_num: 1,
        share_id
    }

    const [interfaceSearchKeys, setInterfaceSearchKeys] = React.useState(defaultKeys)
    const [selectedRows, setSelectedRows] = useState<any>([])

    const { data, refresh, loading } = useRequest(
        (params = interfaceSearchKeys) => queryCaseResult(params),
        {
            initialData: [],
            refreshDeps: [interfaceSearchKeys],
            /* 解决请求重复的问题 */
            debounceInterval: 200,
            formatResult(res) {
                return res
            },
        }
    )

    const handleSearch = (selectedKeys: any, confirm: any) => {
        confirm?.();
        setInterfaceSearchKeys((p: any) => ({ ...p, sub_case_name: selectedKeys, page_num: 1, page_size: 100 }))
    };

    const getColumnSearchProps = (name: any) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: any) => (
            <div style={{ padding: 8 }}>
                <Input
                    ref={searchInput}
                    placeholder={`${formatMessage({ id: 'operation.search' })} ${name}`}
                    value={selectedKeys}
                    onChange={e => setSelectedKeys(e.target.value)}
                    onPressEnter={() => handleSearch(selectedKeys, confirm)}
                    style={{ width: 150, marginBottom: 8, display: 'block' }}
                />
                <Space>
                    <Button
                        onClick={() => handleSearch(selectedKeys, confirm)}
                        type="link"
                        size="small"
                        style={{ width: 75 }}
                    >
                        <FormattedMessage id="operation.search" />
                    </Button>
                    <Button 
                        onClick={() => {
                            setSelectedKeys(undefined)
                            handleSearch(undefined, confirm)
                        }}
                        type="text"
                        size="small" 
                        style={{ width: 75, border: 'none' }}
                    >
                        <FormattedMessage id="operation.reset" />
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered: any) => <FilterFilled style={{ color: filtered ? '#1890ff' : undefined }} />,
        onFilterDropdownVisibleChange: (visible: any) => {
            if (visible) {
                setTimeout(() => searchInput.current.select(), 100);
            }
        },
        render: (text: any,) => (
            <ColumnEllipsisText ellipsis={{ tooltip: text }}>
                <Highlighter
                    highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                    searchWords={[interfaceSearchKeys?.sub_case_name as any]}
                    autoEscape
                    textToHighlight={text ? text.toString() : ''}
                />
            </ColumnEllipsisText>
        )
    });

    useEffect(() => {
        if (refreshId === test_case_id) {
            setInterfaceSearchKeys((p: any) => ({ ...p, page_num: 1, page_size: 10, sub_case_result: stateWordMap(state) }))
            setTimeout(() => {
                setRefreshId(null)
            }, 300)
        }
        if (!refreshId) {
            setInterfaceSearchKeys((p: any) => ({ ...p, page_num: 1, page_size: 10, sub_case_result: stateWordMap(state) }))
        }
    }, [state])

    const handleOpenEditRemark = (item: any) => {
        editRemark.current.show({
            ...item,
            editor_obj: 'test_job_case',
            case_name: item.sub_case_name,
            suite_name,
            conf_name
        })
    }

    const handleOpenJoinBaseline = (item: any) => {
        joinBaseline.current.show({ ...item, suite_id, test_case_id })
    }

    const columns: any[] = [
        {
            dataIndex: 'sub_case_name',
            title: 'Test Case',
            fixed: "left",
            width: 400,
            ...tooltipTd(),
            ...getColumnSearchProps('Test Case'),
        },
        {
            dataIndex: 'result',
            title: (
                <span>
                    <QusetionIconTootip
                        placement="bottomLeft"
                        title={formatMessage({ id: 'ws.result.details.test.result' })}
                        desc={formatMessage({ id: 'ws.result.details.test.result.view.log.file' })}
                    /> 
                    &emsp;/&emsp;基线结果状态
                </span>
            ),
            width: 150,
            ellipsis: true,
            align: 'center',
            render: (_: any) => {
                let color = ''
                if (_ === 'Fail') color = '#C84C5A'
                if (_ === 'Pass') color = '#81BF84'
                if (_ === 'Warning') color = '#dcc506'
                if (_ === 'Stop') color = '#1D1D1D'
                return <div>
                    <span style={{ color }}>{_}</span>&emsp;/&emsp;<span style={{ color }}>{'-'}</span>
                </div>
            }
        },
        {
            title: (
                <QusetionIconTootip
                    placement="bottomLeft"
                    title={formatMessage({ id: 'ws.result.details.baseline.description' })}
                    desc={formatMessage({ id: 'ws.result.details.baseline.description.ps' })}
                />
            ),
            dataIndex: 'description',
            width: 180,
            ellipsis: true,
            render: (_: any, row: any) => {
                let context = row.description
                const localeStr = formatMessage({ id: 'ws.result.details.match.baseline' })
                if (row.match_baseline && row.result === 'Fail')
                    context = _ ? `${_}(${localeStr})` : localeStr
                if (!context) return "-"
                if (!share_id && access.IsWsSetting())
                    return (
                        <Tooltip placement="topLeft" title={context}>
                            {
                                row.skip_baseline_info ?
                                    <Typography.Link
                                        target='_blank'
                                        href={`/ws/${ws_id}/baseline/${$test_type}?${qs.stringify(row.skip_baseline_info)}`}
                                    >
                                        {context}
                                    </Typography.Link> :
                                    context
                            }
                        </Tooltip >
                    )
                return (<ColumnEllipsisText ellipsis={{ tooltip: true }}>{context}</ColumnEllipsisText>)
            }
        },
        {
            dataIndex: 'bug',
            title: ['business_functional'].includes(testType) ? <FormattedMessage id="ws.result.details.aone.bug" /> : <FormattedMessage id="ws.result.details.bug" />,
            width: 180,
            ellipsis: true,
            render: (_: any, row: any) => {
                const context = row.bug
                let urlHref = ''
                if (context) {
                    urlHref = context
                    // const reg = /^((ht|f)tps?):\/\/[\w\-]+(\.[\w\-]+)+([\w\-.,@?^=%&:\/~+#]*[\w\-@?^=%&\/~+#])?$/;
                    const reg = /^((http|https|ftps):(?:\/\/))/;
                    if (!reg.test(context)) urlHref = `${window.origin}/ws/${ws_id}404?page=${location.href}`
                }

                return (
                    context ?
                        <Tooltip placement="topLeft" title={_}>
                            {
                                !share_id ?
                                    <Typography.Link href={urlHref} target='_blank'>
                                        {context}
                                    </Typography.Link> :
                                    context
                            }
                        </Tooltip >
                        : '-'
                )
            }
        },
        {
            dataIndex: 'note',
            width: 180,
            title: (
                <QusetionIconTootip
                    placement="bottomLeft"
                    title={formatMessage({ id: 'ws.result.details.result.remarks' })}
                    desc={formatMessage({ id: 'ws.result.details.result.remarks.ps' })}
                />
            ),
            ...tooltipTd()
        },
        !share_id &&
        {
            title: <FormattedMessage id="Table.columns.operation" />,
            fixed: "right",
            width: 200,
            render: (_: any, row: any) => {
                // 没有关联关系的行数据才能“添加/修改”基线
                const failFlag = !row.skip_baseline_info
                const buttonText = _.bug ? <FormattedMessage id="ws.result.details.edit.baseline" /> : <FormattedMessage id="ws.result.details.join.baseline" />
                return (
                    <Access accessible={access.WsTourist()}>
                        <Access
                            accessible={access.WsMemberOperateSelf(creator)}
                            fallback={
                                <Space>
                                    <span style={{ color: '#1890FF', cursor: 'pointer' }} onClick={() => AccessTootip()}><FormattedMessage id="operation.edit" /></span>
                                    {failFlag && <span style={{ color: '#1890FF', cursor: 'pointer' }} onClick={() => AccessTootip()}>{buttonText}</span> }
                                </Space>
                            }
                        >
                            <Space>
                                <span style={{ color: '#1890FF', cursor: 'pointer' }} onClick={() => handleOpenEditRemark(_)}><FormattedMessage id="operation.edit" /></span>
                                {failFlag && <span style={{ color: '#1890FF', cursor: 'pointer' }} onClick={() => handleOpenJoinBaseline(_)}>{buttonText}</span>}
                            </Space>
                        </Access>
                    </Access>
                )
            }
        }
    ].filter(Boolean)

    const match_sub_case_result = (str: string)=> {
        if (str === 'Pass') return 1
        if (str === 'Fail') return 2
        if (str === 'Stop') return 4
        if (str === 'Skip') return 5
        if (str === 'Warning') return 6
        return str
    }

    const filterSelectedAllData = (params: any[]) => {
        const currTableSelectedRows = params.map((item: any)=> ({
            ...item,
            // "ws_id": ws_id,
            // "test_type": "functional",
            // "test_job_id": job_id,
            "test_suite_id": suite_id,
            "test_case_id": test_case_id,
            "result_id": item.id,
            "sub_case_result": match_sub_case_result(item.result)
        }))
        // 从所有级别suite、case、result表格中选的数据中，根据test_case_id 去除同一表格数据 && 再重新添加数据
        const temp = funcCase.filter((item: any, i: number) => item.test_case_id !== test_case_id) || []
        const list = temp.concat(currTableSelectedRows)
        console.log('list:', list)
        
        setFuncCase(list)
    }

    const rowSelection: any = !share_id && testType === 'functional' ? {
        columnWidth: 40,
        selectedRowKeys: selectedRows.map((item: any)=> item.id),
        onSelect: (record: any, selected: boolean) => {
           let list = []
           if (selected) {
               list = [...selectedRows].concat([record])
           } else {
               list = [...selectedRows].filter((item)=> item.id !== record.id)
           }
           setSelectedRows(list)
           filterSelectedAllData(list)
        },
        onSelectAll: (selected: boolean, rows: any[], changeRows: []) => {
            // console.log('selected:', selected, changeRows )
            let list = []
            if (selected) {
                const all = [...selectedRows].concat(changeRows)
                // 去重
                const temp = all.map((item: any)=> item.id)
                list = all.filter((item, i) => i === temp.indexOf(item.id))
            } else {
                // 过滤
                const temp = changeRows.map((item: any)=> item.id)
                list = selectedRows.filter((item: any) => temp.indexOf(item.id) === -1)
            }
            setSelectedRows(list)
            filterSelectedAllData(list)
        },
    } : undefined

    return (
        <>
            <ResizeHooksTable
                name="wsResultTableCaseList"
                refreshDeps={[access, testType]}
                rowKey="id"
                size="small"
                loading={loading}
                rowSelection={rowSelection}
                className={`${styles.result_info_table_head} ${data?.length ? '' : styles.result_info_table_head_line}`}
                pagination={{
                    pageSize: data.page_size || 100,
                    current: data.page_num || 1,
                    total: data.total || 0,
                    showQuickJumper: true,
                    showSizeChanger: true,
                    onChange(page_num, page_size) {
                        /* 解决page_size切换，page_num不变的问题 */
                        setInterfaceSearchKeys((p: any) => ({
                            ...p,
                            page_num: p.page_size === page_size ? page_num : 1,
                            page_size
                        }))
                    },
                    showTotal(total) {
                        return formatMessage({ id: 'pagination.total.strip' }, { data: total })
                    },
                    pageSizeOptions: [10, 100, 200, 500],
                }}
                columns={columns}
                rowClassName={styles.result_info_table_row}
                dataSource={data.data || []}
            />
            <EditRemarks ref={editRemark} onOk={refresh} />
            <JoinBaseline
                ref={joinBaseline}
                onOk={refresh}
                test_type={testType}
                server_provider={server_provider}
            />
        </>
    )
}