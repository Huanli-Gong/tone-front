import React, { memo, useEffect } from "react"
import { Tooltip, Row, Col, Space, Typography, Popconfirm, message, Button } from "antd"
import { useAccess, Access, useParams, useRequest } from 'umi'
import { requestCodeMessage, targetJump, AccessTootip } from '@/utils/utils'
import { StarOutlined, StarFilled } from '@ant-design/icons'
import { JobListStateTag } from '../Details/components'
import { QusetionIconTootip } from '@/components/Product';
import lodash from 'lodash'
import CommonPagination from '@/components/CommonPagination';
import {
    queryTestResultList,
    deleteJobTest,
    addMyCollection,
    deleteMyCollection,
} from '../services'
import styled from "styled-components"
import ResizeColumnTable from "@/components/ResizeTable"
import { transQuery } from "./utils"
import CompareBar from '../CompareBar'
import ReRunModal from '@/pages/WorkSpace/TestResult/Details/components/ReRunModal'
import ViewReport from '../CompareBar/ViewReport'
import styles from "../index.less"

const Offline = styled.div`
    background: #1890FF;
    color: #fff;
    width: 20px;
    height: 20px;
    margin-right: 6px;
    font-size: 12px;
    display: inline-block;
    line-height: 20px;
    text-align: center;
    border-radius: 2px;
`

const SelectionRow = styled.div`
    border-top: 1px solid rgba(0,0,0, 0.06);
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    box-shadow: 0 -1px 2px 0 rgba(0,0,0,0.03);
    background-color: #fff;
    z-index: 99;
`

type IProps = {
    [k: string]: any
}

const DEFAULT_PAGE_QUERY = { page_num: 1, page_size: 20 }

const ListTable: React.FC<IProps> = (props) => {
    const { pageQuery, setPageQuery, radioValue = 1, countRefresh } = props
    const { ws_id } = useParams() as any
    const access = useAccess()

    const [selectedRowKeys, setSelectedRowKeys] = React.useState<any[]>([])
    const [selectRowData, setSelectRowData] = React.useState<any[]>([])

    const rerunRef = React.useRef(null) as any

    const { data, refresh, loading, mutate } = useRequest(
        () => queryTestResultList(transQuery(pageQuery)),
        {
            formatResult(response) {
                return response
            },
            refreshDeps: [pageQuery]
        }
    )

    /* 重置 */
    React.useEffect(() => {
        return () => {
            setPageQuery((p: any) => ({ ...p, ...DEFAULT_PAGE_QUERY, ws_id }))
        }
    }, [ws_id])

    const handleClickStar = async ({ collection, id }: any, flag: any) => {
        const { msg, code } = !collection ?
            await addMyCollection({ job_id: id }) :
            await deleteMyCollection({ job_id: id })

        if (code !== 200) return requestCodeMessage(code, msg)

        mutate((source: any) => {
            const { data } = source

            return {
                ...source,
                data: data.map((i: any) => {
                    if (id !== i.id) return i
                    return {
                        ...i,
                        collection: !collection
                    }
                })
            }
        })
        countRefresh()
    }

    const handleDelete = async ({ id }: any) => {
        const { code, msg } = await deleteJobTest({ job_id: id })
        if (code !== 200) return requestCodeMessage(code, msg)
        const selectedKeys = selectedRowKeys.filter((keys: any) => Number(keys) !== Number(id))
        const selectRows = selectRowData.filter((obj: any) => obj && Number(obj.id) !== Number(id))
        setSelectedRowKeys(selectedKeys);
        setSelectRowData(selectRows);
        message.success('操作成功！')
        refresh()
        countRefresh()
    }

    const columns: any = React.useMemo(() => [
        /* @ts-ignore */
        access.IsWsSetting() &&
        {
            title: '',
            width: 30,
            align: 'center',
            fixed: 'left',
            className: 'collection_star result_job_hover_span',
            render: (_: any) => (
                <div onClick={() => handleClickStar(_, !_.collection)}>
                    {
                        _.collection ?
                            <StarFilled className="is_collection_star" style={{ color: '#F7B500' }} /> :
                            <StarOutlined className="no_collection_star" />
                    }
                </div>
            )
        },
        {
            title: 'JobID',
            dataIndex: 'id',
            fixed: 'left',
            width: 80,
            ellipsis: {
                showTitle: false,
            },
            className: 'result_job_hover_span',
            render: (_: any) => <span onClick={() => targetJump(`/ws/${ws_id}/test_result/${_}`)}>{_}</span>
        },
        {
            title: 'Job名称',
            dataIndex: 'name',
            width: 200,
            ellipsis: {
                showTitle: false,
            },
            render: (_: any, row: any) => {
                return (
                    <Typography.Text ellipsis>
                        {
                            row.created_from === 'offline' &&
                            <Offline >离</Offline>
                        }
                        <Tooltip placement="topLeft" title={_}>
                            <Typography.Text
                                className="result_job_hover_span"
                                onClick={() => targetJump(`/ws/${ws_id}/test_result/${row.id}`)}
                                style={{
                                    cursor: 'pointer',
                                }}
                            >
                                {_}
                            </Typography.Text>
                        </Tooltip>
                    </Typography.Text>
                )
            }
        },
        {
            title: '状态',
            dataIndex: 'state',
            width: 120,
            render: (_: any, row: any) => <JobListStateTag {...row} />
        },
        {
            title: '测试类型',
            width: 80,
            dataIndex: 'test_type',
            ellipsis: true,
        },
        {
            title: (
                <QusetionIconTootip
                    placement="bottomLeft"
                    title={'总计/成功/失败'}
                    desc={
                        <ul style={{ paddingInlineStart: 'inherit', paddingTop: 15 }}>
                            <li>功能测试：测试结果中TestConf结果状态统计。</li>
                            <li>性能测试：执行结果中TestConf执行状态统计。</li>
                        </ul>
                    }
                />
            ),
            dataIndex: 'test_result',
            width: 140,
            render: (_: any) => {
                const result = JSON.parse(_)
                if (lodash.isNull(result)) {
                    return (
                        <Row>
                            <Col span={8} style={{ color: "#1890FF" }} >-</Col>
                            <Col span={8} style={{ color: "#52C41A" }} >-</Col>
                            <Col span={8} style={{ color: "#FF4D4F" }} >-</Col>
                        </Row>
                    )
                } else {
                    return (
                        <Row>
                            <Col span={8} style={{ color: "#1890FF" }} >{result.total}</Col>
                            <Col span={8} style={{ color: "#52C41A" }} >{result.pass}</Col>
                            <Col span={8} style={{ color: "#FF4D4F" }} >{result.fail}</Col>
                        </Row>
                    )
                }
            }
        },
        {
            title: '所属项目',
            width: 120,
            dataIndex: 'project_name',
            ellipsis: {
                showTitle: false,
            },
            render: (_: any) => (
                <Tooltip title={_ || '-'} placement="topLeft">
                    {_ || '-'}
                </Tooltip>
            )
        },
        {
            title: '创建人',
            width: 80,
            ellipsis: {
                showTitle: false,
            },
            dataIndex: 'creator_name',
            render: (_: any) => (
                <Tooltip title={_ || '-'} placement="topLeft">
                    {_ || '-'}
                </Tooltip>
            )
        },
        {
            title: '开始时间',
            width: 180,
            dataIndex: 'start_time',
            ellipsis: {
                showTitle: false,
            },
            sorter: true,
            render: (_: any) => (
                <Tooltip title={_ || '-'} placement="topLeft">
                    {_ || '-'}
                </Tooltip>
            )
        }, {
            title: '完成时间',
            width: 180,
            ellipsis: {
                showTitle: false,
            },
            dataIndex: 'end_time',
            render: (_: any) => (
                <Tooltip title={_ || '-'} placement="topLeft">
                    {_ || '-'}
                </Tooltip>
            )
        },
        {
            title: '操作',
            width: 160,
            fixed: 'right',
            render: (_: any) => {
                const disableStyle = { color: '#ccc', cursor: 'no-drop' }
                const commonStyle = { color: '#1890FF', cursor: 'pointer' }
                return (
                    <Space>
                        <Access accessible={access.IsWsSetting()}>
                            <span
                                onClick={_.created_from === 'offline' ? undefined : () => rerunRef.current?.show(_)}
                            >
                                <Typography.Text style={_.created_from === 'offline' ? disableStyle : commonStyle}>重跑</Typography.Text>
                            </span>
                        </Access>
                        <Access accessible={access.WsTourist()}>
                            <Access
                                accessible={access.WsMemberOperateSelf(_.creator)}
                                fallback={
                                    <span onClick={() => AccessTootip()}><Typography.Text style={commonStyle}>删除</Typography.Text></span>
                                }
                            >
                                <Popconfirm
                                    title="确定要删除吗？"
                                    onConfirm={() => handleDelete(_)}
                                    okText="确认"
                                    cancelText="取消"
                                >
                                    <Typography.Text style={commonStyle}>
                                        删除
                                    </Typography.Text>
                                </Popconfirm>
                            </Access>
                        </Access>
                        <ViewReport dreType="left" ws_id={ws_id} jobInfo={_} origin={'jobList'} />
                    </Space>
                )
            }
        }
    ].filter(Boolean), [access, ws_id])

    const selectedChange = (record: any, selected: any) => {
        if (!record) {
            handleResetSelectedKeys()
            return;
        }
        // 去掉未选组的job 开始
        let arrKeys = lodash.cloneDeep(selectedRowKeys)
        let arrData = lodash.cloneDeep(selectRowData)

        if (selected) {
            arrKeys = [...arrKeys, record.id]
            arrData = [...arrData, record]
        } else {
            arrKeys = arrKeys.filter((keys: any) => Number(keys) !== Number(record.id))
            arrData = arrData.filter((obj: any) => obj && Number(obj.id) !== Number(record.id))
        }
        setSelectedRowKeys(arrKeys);
        setSelectRowData(arrData);
    }

    // useEffect(()=> {
    //     if(radioValue === 2){
    //         refresh()
    //     }
    // }, [ radioValue ])
    const allSelectFn = (allData: any) => {
        const arr = lodash.isArray(allData) ? allData : []
        const keysArr: any = []
        arr.forEach((item: any) => keysArr.push(item.id))
        setSelectedRowKeys([...selectedRowKeys, ...keysArr])
        setSelectRowData([...selectRowData, ...arr])
    }

    const cancleAllSelectFn = (allData: any) => {
        const arr = lodash.isArray(allData) ? allData : []
        const keysArr: any = []
        arr.forEach((item: any) => keysArr.push(item.id))
        setSelectedRowKeys(lodash.difference(selectedRowKeys, keysArr))
        setSelectRowData(lodash.differenceBy(selectRowData, arr, 'id'))
    }

    const rowSelection: any = {
        selectedRowKeys,
        onSelect: selectedChange,
        preserveSelectedRowKeys: false,
        hideSelectAll: radioValue === 1 ? true : false,
        onSelectAll: (selected: boolean, selectedRows: [], changeRows: []) => {
            if (selected) {
                allSelectFn(changeRows)
            } else {
                cancleAllSelectFn(changeRows)
            }
        },
    }

    const handleResetSelectedKeys = React.useCallback(() => {
        setSelectedRowKeys([])
        setSelectRowData([])
    }, [])

    const handleMoreDeleOk = async () => {
        if (!selectedRowKeys.length) return
        const { code, msg } = await deleteJobTest({ job_id_li: selectedRowKeys })
        if (code !== 200) {
            requestCodeMessage(code, msg)
            return
        }
        handleResetSelectedKeys()
        message.success('操作成功！')
        countRefresh()
        refresh()
    }

    let basePadding = { padding: "0 16px" }
    if (selectedRowKeys.length) {
        if (radioValue === 2) basePadding = { padding: "0 16px 56px" }
        if (radioValue === 1) basePadding = { padding: "0 16px 106px" }
    }

    const sortStartTime = (sorter: any) => {
        switch (sorter.order) {
            case 'descend':
                mutate((res: any) => ({
                    ...res,
                    data: res?.data.sort(function (a: any, b: any) {
                        return a.start_time < b.start_time ? 1 : -1
                    })
                }))
                break;
            case 'ascend':
                mutate((res: any) => ({
                    ...res,
                    data: res?.data.sort(function (a: any, b: any) {
                        return a.start_time > b.start_time ? 1 : -1
                    })
                }))
                break;
            default:
                break;
        }
    }

    return (
        <Row style={basePadding}>
            <ResizeColumnTable
                size="small"
                rowKey="id"
                loading={loading}
                dataSource={data?.data}
                columns={columns}
                pagination={false}
                rowClassName={styles.result_table_row}
                rowSelection={rowSelection}
                onChange={(pagination: any, filters: any, sorter: any) => {
                    sortStartTime(sorter)
                }}
                scroll={{
                    x: "100%"
                }}
            />
            {
                !loading &&
                <CommonPagination
                    total={data?.total}
                    largePage={true}
                    currentPage={pageQuery?.page_num}
                    pageSize={pageQuery?.page_size}
                    onPageChange={
                        (page_num, page_size) => setPageQuery((p: any) => ({ ...p, page_num, page_size }))
                    }
                />
            }
            {
                (radioValue === 2) &&
                <SelectionRow >
                    <Row justify="space-between" style={{ height: 56, paddingLeft: 24, paddingRight: 24 }} align="middle">
                        <Space>
                            <span>已选择</span>
                            <Typography.Link>{`${selectRowData.length}`}</Typography.Link>
                            <span>项</span>
                        </Space>
                        <Space>
                            <Button onClick={handleResetSelectedKeys}>取消</Button>
                            <Popconfirm
                                title={<div style={{ color:'red' }}>确定要删除吗？</div>}
                                okText="确定"
								cancelText="取消"
								onConfirm={() => handleMoreDeleOk()}
                            >
                                <Button type="primary" disabled={!selectedRowKeys.length}>
                                    批量删除
                                </Button>
                            </Popconfirm>
                            
                        </Space>
                    </Row>
                </SelectionRow>
            }
            {
                (radioValue === 1 && !!selectedRowKeys.length) &&
                <SelectionRow >
                    <CompareBar
                        selectedChange={selectedChange}
                        allSelectedRowKeys={selectedRowKeys}
                        allSelectRowData={selectRowData}
                        wsId={ws_id}
                    />
                </SelectionRow>
            }
            <ReRunModal ref={rerunRef} />
        </Row>
    )
}

export default memo(ListTable)