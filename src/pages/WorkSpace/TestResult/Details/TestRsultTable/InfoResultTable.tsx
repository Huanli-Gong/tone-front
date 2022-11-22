import { Space, Table, Tooltip, Input, Button, Typography, message } from 'antd'
import { SearchOutlined } from '@ant-design/icons'

import React, { useRef, useEffect, useState } from 'react'
import { useRequest, Access, useAccess, useParams, useIntl, FormattedMessage } from 'umi'
import { queryCaseResult } from '../service'
import EditRemarks from '../components/EditRemarks'
import JoinBaseline from '../components/JoinBaseline'
import { QusetionIconTootip } from '@/components/Product';
import qs from 'querystring'

import Highlighter from 'react-highlight-words'
// import VirtualTable from '@/components/VirtualTable'

import { tooltipTd } from '../components'
import styles from './index.less'
import { targetJump, AccessTootip } from '@/utils/utils'

export default (props: any) => {
    const { formatMessage } = useIntl()
    const { ws_id, id: job_id } = useParams() as any
    const access = useAccess()
    const {
        test_case_id, suite_id, testType, creator,
        server_provider, state = '', suite_name, conf_name,
        refreshId, setRefreshId
    } = props
    const editRemark: any = useRef(null)
    const joinBaseline: any = useRef(null)

    const searchInput: any = useRef(null)
    // const [searchText, setSearchText] = useState('')
    // const [searchedColumn, setSearchedColumn] = useState('')

    const defaultKeys = {
        job_id,
        case_id: test_case_id,
        suite_id,
        ws_id,
        sub_case_name: undefined,
        sub_case_result: undefined,
        page_size: 10,
        page_num: 1
    }
    const [interfaceSearchKeys, setInterfaceSearchKeys] = React.useState(defaultKeys)

    const { data, refresh, loading } = useRequest(
        (params = interfaceSearchKeys) => queryCaseResult(params),
        {
            initialData: [], formatResult(res) {
                return res
            },
        }
    )

    const handleSearch = (selectedKeys: any, confirm: any, dataIndex: any) => {
        confirm();
        setInterfaceSearchKeys((p: any) => ({ ...p, sub_case_name: selectedKeys[0], page_num: 1, page_size: 10 }))
    };

    const handleReset = (clearFilters: any) => {
        clearFilters();
    };

    const getColumnSearchProps = (dataIndex: any, name: any) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: any) => (
            <div style={{ padding: 8 }}>
                <Input
                    ref={searchInput}
                    placeholder={`${formatMessage({ id: 'operation.search' })} ${name}`}
                    value={selectedKeys[0]}
                    onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
                    style={{ width: 188, marginBottom: 8, display: 'block' }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
                        icon={<SearchOutlined />}
                        size="small"
                        style={{ width: 90 }}
                    >
                        <FormattedMessage id="operation.search" />
                    </Button>
                    <Button onClick={() => handleReset(clearFilters)} size="small" style={{ width: 90 }}>
                        <FormattedMessage id="operation.reset" />
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered: any) => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
        onFilterDropdownVisibleChange: (visible: any) => {
            if (visible) {
                setTimeout(() => searchInput.current.select(), 100);
            }
        },
        render: (text: any,) => (
            <Highlighter
                highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                searchWords={[interfaceSearchKeys?.sub_case_name as any]}
                autoEscape
                textToHighlight={text ? text.toString() : ''}
            />
        )
    });

    const stateWordMap = (st: string) => new Map([
        ["success", 1],
        ["fail", 2],
        ["skip", 5],
        ["warn", 6],
    ]).get(st) || undefined

    useEffect(() => {
        if (refreshId === test_case_id) {
            setInterfaceSearchKeys((p: any) => ({ ...p, sub_case_result: stateWordMap(state) }))
            setTimeout(() => {
                setRefreshId(null)
            }, 300)
        }
        if (!refreshId) {
            setInterfaceSearchKeys((p: any) => ({ ...p, sub_case_result: stateWordMap(state) }))
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
        joinBaseline.current.show({ ...item, suite_id, job_id, test_case_id })
    }

    const columns = [{
        dataIndex: 'sub_case_name',
        title: 'Test Case',
        width: 400,
        ...tooltipTd(),
        ...getColumnSearchProps('sub_case_name', 'Test Case'),
    }, {
        dataIndex: 'result',
        title: (
            <QusetionIconTootip
                placement="bottomLeft"
                title={formatMessage({ id: 'ws.result.details.test.result' })}
                desc={formatMessage({ id: 'ws.result.details.test.result.view.log.file' })}
            />
        ),
        render: (_: any) => {
            let color = ''
            if (_ === 'Fail') color = '#C84C5A'
            if (_ === 'Pass') color = '#81BF84'
            if (_ === 'Warning') color = '#dcc506'
            if (_ === 'Stop') color = '#1D1D1D'
            return <span style={{ color }}>{_}</span>
        }
    }, {
        dataIndex: 'description',
        title: (
            <QusetionIconTootip
                placement="bottomLeft"
                title={formatMessage({ id: 'ws.result.details.baseline.description' })}
                desc={formatMessage({ id: 'ws.result.details.baseline.description.ps' })}
            />
        ),
        ellipsis: true,
        render: (_: any, row: any) => {
            let context = row.description
            const localeStr = formatMessage({ id: 'ws.result.details.match.baseline' })
            if (row.match_baseline && row.result === 'Fail')
                context = _ ? `${_}(${localeStr})` : localeStr
            if (access.IsWsSetting())
                return (
                    <Tooltip placement="topLeft" title={context}>
                        <Typography.Link
                            className={styles.hrefUrl}
                            onClick={
                                () => {
                                    if (row.skip_baseline_info) {
                                        const baselineProvider = row.skip_baseline_info.server_provider === 'aligroup' ? 'group' : 'cluster'
                                        targetJump(`/ws/${ws_id}/baseline/${baselineProvider}?${qs.stringify(row.skip_baseline_info)}`)
                                    }
                                }
                            }
                        >
                            {context || '-'}
                        </Typography.Link>
                    </Tooltip >
                )
            return (
                <Tooltip placement="topLeft" title={context}>
                    <Typography>{context || '-'}</Typography>
                </Tooltip>
            )
        }
    }, {
        dataIndex: 'bug',
        title: ['business_functional'].includes(testType) ? <FormattedMessage id="ws.result.details.aone.bug" /> : <FormattedMessage id="ws.result.details.bug" />,
        ellipsis: true,
        render: (_: any, row: any) => {
            let context = row.bug
            let urlHref = ''
            if (context) {
                urlHref = context
                let reg = /^((ht|f)tps?):\/\/[\w\-]+(\.[\w\-]+)+([\w\-.,@?^=%&:\/~+#]*[\w\-@?^=%&\/~+#])?$/;
                if (!reg.test(context)) urlHref = `${window.origin}/404`
            }

            return (
                context ?
                    <Tooltip placement="topLeft" title={_}>
                        < a href={urlHref} className={styles.hrefUrl} target='_blank'>
                            {context}
                        </a >
                    </Tooltip >
                    : '-'
            )
        }
    }, {
        dataIndex: 'note',
        title: (
            <QusetionIconTootip
                placement="bottomLeft"
                title={formatMessage({ id: 'ws.result.details.result.remarks' })}
                desc={formatMessage({ id: 'ws.result.details.result.remarks.ps' })}
            />
        ),
        ...tooltipTd()
    }, {
        title: <FormattedMessage id="Table.columns.operation" />,
        render: (_: any) => {
            let flag = _.result === 'Fail' && !_.bug
            return (
                <Access accessible={access.WsTourist()}>
                    <Access
                        accessible={access.WsMemberOperateSelf(creator)}
                        fallback={
                            <Space>
                                <span style={{ color: '#1890FF', cursor: 'pointer' }} onClick={() => AccessTootip()}><FormattedMessage id="operation.edit" /></span>
                                {flag && <span style={{ color: '#1890FF', cursor: 'pointer' }} onClick={() => AccessTootip()}><FormattedMessage id="ws.result.details.join.baseline" /></span>}
                            </Space>
                        }
                    >
                        <Space>
                            <span style={{ color: '#1890FF', cursor: 'pointer' }} onClick={() => handleOpenEditRemark(_)}><FormattedMessage id="operation.edit" /></span>
                            {flag && <span style={{ color: '#1890FF', cursor: 'pointer' }} onClick={() => handleOpenJoinBaseline(_)}><FormattedMessage id="ws.result.details.join.baseline" /></span>}
                        </Space>
                    </Access>
                </Access>
            )
        }
    },]

    return (
        <>
            {
                <Table
                    rowKey="id"
                    size="small"
                    loading={loading}
                    className={`${styles.result_info_table_head} ${data?.length ? '' : styles.result_info_table_head_line}`}
                    pagination={{
                        pageSize: data.page_size || 10,
                        current: data.page_num || 1,
                        total: data.total || 0,
                        showQuickJumper: true,
                        showSizeChanger: true,
                        onChange(page_num, page_size) {
                            setInterfaceSearchKeys((p: any) => ({ ...p, page_num, page_size }))
                        },
                        showTotal(total, range) {
                            return `共 ${total} 条`
                        },
                    }}
                    columns={columns}
                    rowClassName={styles.result_info_table_row}
                    dataSource={data.data || []}
                />
            } 
            <EditRemarks ref={editRemark} onOk={refresh}/>
            <JoinBaseline
                ref={joinBaseline}
                onOk={refresh}
                test_type={testType}
                ws_id={ws_id}
                server_provider={server_provider}
                accessible={access.IsWsSetting()}
            />
        </>
    )
}