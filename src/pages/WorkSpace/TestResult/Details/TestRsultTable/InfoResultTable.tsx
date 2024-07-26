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
import lodash from "lodash"

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
        refreshId, setRefreshId,
    } = props
    // console.log(  suiteRowInfo, confRowInfo, )

    const { compareData, batchType,
        setOSuite, oSuite,
        setCancelSuite, cancelSuite,
     } = React.useContext(MetricSelectProvider)
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
    const [interfaceSearchKeys, setInterfaceSearchKeys] = React.useState({}) // defaultKeys
    const [selectedRows, setSelectedRows] = useState<any>([])

    // 1.请求/刷新表格数据
    // const { data, refresh, loading } = useRequest(
    //     (params = interfaceSearchKeys) => queryCaseResult(params),
    //     {
    //         initialData: [],
    //         refreshDeps: [interfaceSearchKeys],
    //         /* 解决请求重复的问题 */
    //         debounceInterval: 200,
    //         formatResult(res) {
    //             return res
    //         },
    //     }
    // )

    const [loading, setLoading] = useState<any>(false)
    const [paginateData, setPaginateData] = useState<any>({ data: [] })
    const refresh = lodash.debounce(
      async (params?: any)=> {
        try {
            setLoading(true)
            const q = params ? { ...interfaceSearchKeys, ...params }: interfaceSearchKeys
            const res = await queryCaseResult(q)
            if (res.code === 200) {
                // 判断是批量对比
                if (batchType === 'compare' && compareData.length) {
                    // “对比数据” 临时替换 “id相匹配的行数据”
                    const suiteItem = compareData.filter((s: any)=> s.suite_id === suite_id)[0]
                    if (suiteItem) {
                        const confItem = suiteItem.children.filter((s: any)=> s.test_case_id === test_case_id)[0]
                        if (confItem) {
                            const caseList = confItem.children
                            // 用id去匹配选中的行id，替换行数据
                            const { data = [] } = res
                            const tempDataSet = data.map((item: any)=> {
                                const row = caseList?.filter((s: any)=> item.id === s.id)[0]
                                return row || item
                            })
                            setPaginateData({ ...res, data: tempDataSet })
                        } else {
                            setPaginateData(res)
                        }
                    } else {
                        setPaginateData(res)
                    }
                } else {
                    setPaginateData(res)
                }
            }
            setLoading(false)
        } catch {
            setLoading(false)
        }
    }, 200)

    useEffect(()=> {
        if (Object.keys(interfaceSearchKeys).length) {
            refresh()
        } 
    }, [interfaceSearchKeys])


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
            setInterfaceSearchKeys({ ...defaultKeys, ...interfaceSearchKeys, page_num: 1, page_size: 10, sub_case_result: stateWordMap(state) })
            setTimeout(() => {
                setRefreshId(null)
            }, 300)
        }
        if (!refreshId) {
            setInterfaceSearchKeys({ ...defaultKeys, ...interfaceSearchKeys, page_num: 1, page_size: 10, sub_case_result: stateWordMap(state) })
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
            dataIndex: 'result',  // 测试结果状态
            title: (
                <span>
                    <QusetionIconTootip
                        placement="bottomLeft"
                        title={formatMessage({ id: 'ws.result.details.test.result' })}
                        desc={formatMessage({ id: 'ws.result.details.test.result.view.log.file' })}
                    />
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
                return <span style={{ color }}>{_}</span>
            }
        },
        {
            dataIndex: 'sub_case_result', // 基线结果状态
            title: '基线结果',
            width: 100,
            ellipsis: true,
            align: 'center',
            render: (_: any) => {
                let color = ''
                if (_ === 'Fail') color = '#C84C5A'
                if (_ === 'Pass') color = '#81BF84'
                if (_ === 'Warning') color = '#dcc506'
                if (_ === 'Stop') color = '#1D1D1D'
                return <span style={{ color }}>{_ || '-'}</span>
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
            title: ['business_functional'].includes(testType) ? <FormattedMessage id="ws.result.details.aone.bug" /> : <FormattedMessage id="ws.result.details.baseline.bug" />,
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

    // const match_sub_case_result = (str: string)=> {
    //     if (str === 'Pass') return 1
    //     if (str === 'Fail') return 2
    //     if (str === 'Stop') return 4
    //     if (str === 'Skip') return 5
    //     if (str === 'Warning') return 6
    //     return str
    // }

    // console.log('oSuite---3:', oSuite)
    // console.log('cSuite---3:', cancelSuite)

    const filterSelectedRow = () => {
        return oSuite?.[suite_id]?.[test_case_id]?.map((item: any)=> item.id) || []
    }
    const filterCancelRow = () => {
        const paginateDataIds = paginateData.data.map((item: any)=> item.id)
        /** 把"取消行"过滤掉 */
        const precCancelList = cancelSuite?.[suite_id]?.[test_case_id] || []
        // console.log('case---取消行:', precCancelList)
        return paginateDataIds.filter((id: any)=> !precCancelList.includes(id))
    }
    /** 1.是否是全选 */
    const selectedAll = oSuite?.[suite_id]?.[test_case_id] === null ? filterCancelRow() : filterSelectedRow()
    // console.log('selectedAll:', selectedAll,  oSuite?.[suite_id]?.[test_case_id] === null )

    const rowSelection: any = !share_id && testType === 'functional' ? {
        columnWidth: 40,
        selectedRowKeys: selectedAll,
        onChange: (keys: React.Key[], rows: any[]) => {
            // console.log('oSuite---3--onChange--keys:', keys)
            // 当前页ids
            const paginateDataIds = paginateData.data.map((item: any)=> item.id)

            if (oSuite?.[suite_id]?.[test_case_id] === null) {
                console.log('上级结节批量操作了')
                // 当前页面：取消的行
                const currCancelPageIds = paginateDataIds.filter((id: any)=> !keys.includes(id))
                // 
                const precCancelList = cancelSuite?.[suite_id]?.[test_case_id] || []
                const totalCancelList = precCancelList.filter((id: any)=> !paginateDataIds.includes(+id)).concat(currCancelPageIds)
                // console.log('在case取消行---totalCancelList:', totalCancelList)

                setCancelSuite({
                    ...cancelSuite,
                    [suite_id]: totalCancelList.length > 0 ?
                        {
                            ...(cancelSuite?.[suite_id] || {}),
                            [test_case_id]: totalCancelList,
                        }
                        :
                        Object.keys(cancelSuite?.[suite_id]).reduce((p: any, c: any) => {
                            if (+ c === test_case_id) {
                                return p
                            }
                            p[c] = cancelSuite?.[suite_id]?.[c]
                            return p
                        }, {})
                })

            } else {
                console.log('上级结节没批量操作，在case级操作')
                const precList = oSuite?.[suite_id]?.[test_case_id] || []
                // console.log('前一次选中的行---precListIds:', precListIds)

                setOSuite({
                    ...oSuite,
                    [suite_id]: keys.length > 0 ?
                        {
                            ...(oSuite?.[suite_id] || {}),
                            [test_case_id]: precList.filter((item: any)=> !paginateDataIds.includes(item.id)).concat(rows)
                        }
                        :
                        Object.keys(oSuite?.[suite_id]).reduce((p: any, c: any) => {
                            if (+ c === test_case_id) {
                                // 当前页哪些数据要被过滤掉
                                const selectRow = precList.filter((item: any)=> !paginateDataIds.includes(item.id))
                                console.log('在case选中的行---selectRow:', selectRow)
                                if (selectRow.length) {
                                    p[c] = selectRow
                                    return p
                                }
                                return p
                            }
                            p[c] = oSuite?.[suite_id]?.[c]
                            return p
                        }, {})
                })
            }
            
        },

    } : undefined

    useEffect(() => {
        // 父级被选中时
        if (paginateData.total && Object.prototype.toString.call(oSuite?.[suite_id]?.[test_case_id]) === '[object Null]') {
            // 分页数据全被取消
            const precCancelList = cancelSuite?.[suite_id]?.[test_case_id] || []
            if (precCancelList.length && precCancelList.length === paginateData.total) {
                // step1.去除掉conf
                const filterSuite = {
                    ...oSuite,
                    [suite_id]: Object.keys(oSuite?.[suite_id]).reduce((p: any, c: any) => {
                                if (+ c === test_case_id) {
                                    return p
                                }
                                p[c] = oSuite?.[suite_id]?.[c]
                                return p
                            }, {})
                }
                const filterCancelSuite = {
                    ...cancelSuite,
                    [suite_id]: Object.keys(cancelSuite?.[suite_id]).reduce((p: any, c: any) => {
                        if (+ c === test_case_id) {
                            return p
                        }
                        p[c] = cancelSuite?.[suite_id]?.[c]
                        return p
                    }, {})
                }

                // step2. 过滤值为{} 的 suite
                setOSuite(
                    Object.keys(filterSuite).reduce((p: any, c: any) => {
                        if (filterSuite[c] && JSON.stringify(filterSuite[c]) === "{}" ) {
                            return p
                        }
                        p[c] = filterSuite?.[c]
                        return p
                    }, {})
                )
                // 
                setCancelSuite(
                    Object.keys(filterCancelSuite).reduce((p: any, c: any) => {
                        if (filterCancelSuite[c] && JSON.stringify(filterCancelSuite[c]) === "{}" ) {
                            return p
                        }
                        p[c] = filterCancelSuite?.[c]
                        return p
                    }, {})
                )

            }

        }
    }, [cancelSuite])

    useEffect(() => {
        // 批量 && 有选中行的表格刷新
        // console.log('batchType:', batchType)
        if (paginateData.total && batchType === 'join_baseline' && !Object.keys(oSuite).length) {
            refresh()
        }
    }, [batchType, oSuite])
    /** end 批量操作 */

    return (
        <>
            <ResizeHooksTable
                name="wsResultTableCaseList"
                refreshDeps={[access, testType]}
                rowKey="id"
                size="small"
                loading={loading}
                rowSelection={rowSelection}
                className={`${styles.result_info_table_head} ${paginateData.data?.length ? '' : styles.result_info_table_head_line}`}
                pagination={{
                    pageSize: paginateData.page_size || 100,
                    current: paginateData.page_num || 1,
                    total: paginateData.total || 0,
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
                dataSource={paginateData.data || []}
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