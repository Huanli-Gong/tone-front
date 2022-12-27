import { Layout, Spin, Table } from 'antd'
import React, { useState, useEffect, useMemo } from 'react'
import styles from './index.less'
import { CaretRightFilled, CaretDownFilled, FilterFilled } from '@ant-design/icons'
import { useRequest, useLocation, useParams, useIntl, FormattedMessage } from 'umi'
import { queryBaselineDetail } from '../services'
import ExpandTable from './ExpandTable'
import SearchInput from '@/components/Public/SearchInput'
import PopoverEllipsis from '@/components/Public/PopoverEllipsis'
import Highlighter from 'react-highlight-words'
import ExpandPerfsTable from './ExpandPerfsTable'
import { partial } from 'lodash'

// 一级详情
let timeout: any = null;
export default (props: any) => {
    const { layoutHeight } = props
    const { query }: any = useLocation()
    const { ws_id }: any = useParams()
    const { formatMessage } = useIntl()

    const { server_provider, test_type, id } = props.currentBaseline || {}
    const PAGE_DEFAULT_PARAMS: any = { server_provider, test_type, baseline_id: id, search_suite: '' }  // 有用

    const [name, setName] = useState<string>('')
    const [autoFocus, setFocus] = useState(true)
    const [expandKey, setExpandKey] = useState<string[]>(query.test_suite_id ? [query.test_suite_id] : [])

    const { data, loading, run, refresh } = useRequest(
        (data) => queryBaselineDetail(data),
        {
            formatResult: response => response,
            initialData: { data: [], total: 0 },
            defaultLoading: true,
            defaultParams: [PAGE_DEFAULT_PARAMS]
        }
    )

    const debounced = (fn: any, wait: any) => {
        if (timeout !== null) clearTimeout(timeout);  //清除这个定时器			
        timeout = setTimeout(partial(fn, { ...PAGE_DEFAULT_PARAMS }), wait);
    }

    useEffect(() => {
        if (JSON.stringify(query) === '{}') setExpandKey([])
        PAGE_DEFAULT_PARAMS.search_suite = ''
        debounced(run, 200)

        return () => {
            clearTimeout(timeout)
        }
    }, [server_provider, test_type, id, query])


    useEffect(() => {
        if (JSON.stringify(query) === '{}') setExpandKey([]);
        PAGE_DEFAULT_PARAMS.search_suite = name
        debounced(run, 200)
    }, [name, query])

    useEffect(() => {
        setName('')
    }, [id])

    const onExpand = async (record: any) => {
        setExpandKey([record.test_suite_id + ''])
    }

    const oneLevelDetailData = useMemo(() => {
        const listData = data && data.data;
        return Array.isArray(listData) ? listData : [];
    }, [data])

    const styleObj = { container: 280, button_width: 140 }
    const columns = [
        {
            dataIndex: 'test_suite_name',
            title: 'Test Suite',
            key: 'Test Conf',
            filterDropdown: ({ confirm }: any) => <SearchInput
                confirm={confirm}
                autoFocus={autoFocus}
                onConfirm={(val: any) => { setName(val) }}
                currentData={{ server_provider, test_type, id }}
                placeholder={formatMessage({ id: 'pages.workspace.baseline.detail.table.test_suite_name' })} // "支持搜索Test Suite名称"
                styleObj={styleObj}
            />,
            onFilterDropdownVisibleChange: (visible: any) => {
                if (visible) {
                    setFocus(!autoFocus)
                }
            },
            filterIcon: () => <FilterFilled style={{ color: name ? '#1890ff' : undefined }} />,
            render: (_: any, row: any) => {
                return (
                    <PopoverEllipsis title={row.test_suite_name} >
                        <Highlighter
                            highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                            searchWords={[name || '']}
                            autoEscape
                            textToHighlight={row.test_suite_name.toString()}
                        />
                    </PopoverEllipsis>
                )
            }
        }
    ]
    return (
        <Layout.Content>
            <Spin spinning={loading}>
                <div className={styles.baseline_detail}>
                    <Table
                        dataSource={oneLevelDetailData}
                        columns={columns}
                        rowKey={(record: any) => record.test_suite_id + ''}
                        pagination={false}
                        size="small"
                        scroll={{ y: layoutHeight - 74 - 60 }}
                        expandable={{
                            expandedRowRender: record => {
                                if (test_type === 'functional')
                                    return (
                                        <ExpandTable
                                            {...props}
                                            {...record}
                                            currentBaseline={props.currentBaseline}
                                            oneRefresh={refresh}
                                        />
                                    )
                                if (test_type === 'performance')
                                    return (
                                        <ExpandPerfsTable
                                            {...props}
                                            {...record}
                                            currentBaseline={props.currentBaseline}
                                            searchName={name}
                                            oneRefresh={refresh}
                                        />
                                    )
                                return <></>
                            },
                            onExpand: (_, record: any) => {
                                _ ? onExpand(record) : setExpandKey([])
                            },
                            expandedRowKeys: expandKey,
                            expandIcon: ({ expanded, onExpand, record }: any) => (
                                expanded ?
                                    (<CaretDownFilled onClick={e => onExpand(record, e)} />) :
                                    (<CaretRightFilled onClick={e => onExpand(record, e)} />)
                            )
                        }}
                    />
                </div>
            </Spin>
        </Layout.Content>
    )
}