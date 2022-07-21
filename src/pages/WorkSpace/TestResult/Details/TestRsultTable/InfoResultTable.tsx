import { Space, Table, Tooltip, Input, Button, Typography, message } from 'antd'
import { SearchOutlined } from '@ant-design/icons'

import React, { useRef, useEffect, useState } from 'react'
import { useRequest, Access, useAccess, useParams } from 'umi'
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
    const [searchText, setSearchText] = useState('')

    const [searchedColumn, setSearchedColumn] = useState('')

    const { data, refresh, loading, run } = useRequest(
        (sub_case_result = '') => queryCaseResult({ job_id, case_id: test_case_id, suite_id, ws_id, sub_case_result }),
        { initialData: [], manual: true }
    )

    const handleSearch = (selectedKeys: any, confirm: any, dataIndex: any) => {
        confirm();
        setSearchText(selectedKeys[0])
        setSearchedColumn(dataIndex)
    };

    const handleReset = (clearFilters: any) => {
        clearFilters();
        setSearchText('')
    };

    const getColumnSearchProps = (dataIndex: any, name: any) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: any) => (
            <div style={{ padding: 8 }}>
                <Input
                    ref={searchInput}
                    placeholder={`搜索 ${name}`}
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
                        搜索
                    </Button>
                    <Button onClick={() => handleReset(clearFilters)} size="small" style={{ width: 90 }}>
                        重置
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered: any) => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
        onFilter: (value: any, record: any) =>
            record[dataIndex]
                ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
                : '',
        onFilterDropdownVisibleChange: (visible: any) => {
            if (visible) {
                setTimeout(() => searchInput.current.select(), 100);
            }
        },
        render: (text: any) =>
            searchedColumn === dataIndex ? (
                <Highlighter
                    highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                    searchWords={[searchText]}
                    autoEscape
                    textToHighlight={text ? text.toString() : ''}
                />
            ) : (
                text
            ),
    });

    const handleNeedRun = () => {
        if (state === 'success') run(1)
        if (state === 'fail') run(2)
        if (state === 'skip') run(5)
        if (state === '') run()
    }

    useEffect(() => {
        if (refreshId === test_case_id) {
            handleNeedRun()
            setTimeout(() => {
                setRefreshId(null)
            }, 300)
        }
        if (!refreshId) {
            handleNeedRun()
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
        title: 'TestCase',
        width: 400,
        ...tooltipTd(),
        ...getColumnSearchProps('sub_case_name', 'TestCase'),
    }, {
        dataIndex: 'result',
        title: (
            <QusetionIconTootip
                placement="bottomLeft"
                title='测试结果'
                desc='测试结果详情请查看日志文件'
            />
        ),
        render: (_: any) => {
            let color = ''
            if (_ === 'Fail') color = '#C84C5A'
            if (_ === 'Pass') color = '#81BF84'
            if (_ === 'Stop') color = '#1D1D1D'
            return <span style={{ color }}>{_}</span>
        }
    }, {
        dataIndex: 'description',
        title: (
            <QusetionIconTootip
                placement="bottomLeft"
                title='基线说明'
                desc='在这里可以记录对问题的一些官方的比较正式的分析说明，基线说明和基线关联'
            />
        ),
        ellipsis: true,
        render: (_: any, row: any) => {
            let context = row.description
            if (row.match_baseline && row.result === 'Fail')
                context = _ ? `${_}(匹配基线)` : '匹配基线'
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
                            {context}
                        </Typography.Link>
                    </Tooltip >
                )
            return (
                <Tooltip placement="topLeft" title={context}>
                    <Typography>{context}</Typography>
                </Tooltip>
            )
        }
    }, {
        dataIndex: 'bug',
        title: ['business_functional'].includes(testType) ? 'Aone记录' : '缺陷记录',
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
        title:  (
            <QusetionIconTootip
                placement="bottomLeft"
                title='结果备注'
                desc='在这里可以记录对此次结果的说明，和对基线问题一些修正意见，结果备注和当前结果关联'
            />
        ),
        ...tooltipTd()
    }, {
        title: '操作',
        render: (_: any) => {
            let flag = _.result === 'Fail' && !_.bug
            return (
                <Access accessible={access.WsTourist()}>
                    <Access
                        accessible={access.WsMemberOperateSelf(creator)}
                        fallback={
                            <Space>
                                <span style={{ color: '#1890FF', cursor: 'pointer' }} onClick={() => AccessTootip()}>编辑</span>
                                {flag && <span style={{ color: '#1890FF', cursor: 'pointer' }} onClick={() => AccessTootip()}>加入基线</span>}
                            </Space>
                        }
                    >
                        <Space>
                            <span style={{ color: '#1890FF', cursor: 'pointer' }} onClick={() => handleOpenEditRemark(_)}>编辑</span>
                            {flag && <span style={{ color: '#1890FF', cursor: 'pointer' }} onClick={() => handleOpenJoinBaseline(_)}>加入基线</span>}
                        </Space>
                    </Access>
                </Access>
            )
        }
    },]

    return (
        <>
            {
                // data.length > 9 ?
                // <VirtualTable
                //     rowKey="id"
                //     size="small"
                //     loading={loading}
                //     className={styles.result_info_table_head}
                //     pagination={false}
                //     columns={columns}
                //     scroll={{ y: 300 }}
                //     rowClassName={styles.result_info_table_row}
                //     dataSource={data}
                // /> :
                <Table
                    rowKey="id"
                    size="small"
                    loading={loading}
                    className={styles.result_info_table_head}
                    // pagination={ true }
                    columns={columns}
                    rowClassName={styles.result_info_table_row}
                    dataSource={data}
                />
            }
            <EditRemarks ref={editRemark} onOk={refresh} />
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
