/* eslint-disable react-hooks/exhaustive-deps */
import React from "react"
import { Row, Col, Space, Typography, Popconfirm, message } from "antd"
import { useAccess, Access, useParams, useIntl, FormattedMessage, getLocale } from 'umi'
import { requestCodeMessage, targetJump, AccessTootip, matchTestType } from '@/utils/utils'
import { StarOutlined, StarFilled } from '@ant-design/icons'
import { JobListStateTag } from '../Details/components'
import { QusetionIconTootip } from '@/components/Product';
import lodash from 'lodash'
import CommonPagination from '@/components/CommonPagination';
import DelBar from "./DelBar"
import { deleteJobTest, addMyCollection, deleteMyCollection } from '../services'
import styled from "styled-components"
import CompareBar from '../CompareBar'
import ReRunModal from '@/pages/WorkSpace/TestResult/Details/components/ReRunModal'
import ViewReport from '../CompareBar/ViewReport'
import styles from "../index.less"
import { ResizeHooksTable } from "@/utils/table.hooks"
import { ColumnEllipsisText } from "@/components/ColumnComponents"
import { useProvider } from "./provider"

const Offline = styled.div`
    background: #1890FF;
    color: #fff;
    padding: 0px 4px;
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

type IProps = Record<string, any>

const DEFAULT_PAGE_QUERY = { page_num: 1, page_size: 20 }

const ListTable: React.FC<IProps> = (props) => {
    const { initialColumns } = useProvider()
    const { formatMessage } = useIntl()
    const locale = getLocale() === 'en-US';
    const { pageQuery, setPageQuery, radioValue = 1, setRadioValue, countRefresh, dataSource, setDataSource, listRefresh, loading } = props
    const { ws_id } = useParams() as any
    const access = useAccess()
    const [selectedRowKeys, setSelectedRowKeys] = React.useState<any[]>([])
    const [selectRowData, setSelectRowData] = React.useState<any[]>([])
    const rerunRef = React.useRef(null) as any

    const [sortOrder, setSortOrder] = React.useState<any>({})

    React.useEffect(() => {
        setSortOrder({})
    }, [pageQuery])

    React.useEffect(() => {
        return () => {
            setSelectRowData([])
            setSelectedRowKeys([])
            setRadioValue(1)
        }
    }, [pageQuery.tab])

    /* 重置 */
    React.useEffect(() => {
        return () => {
            setPageQuery((p: any) => ({ ...p, ...DEFAULT_PAGE_QUERY, ws_id }))
            setSortOrder({})
        }
    }, [setPageQuery, ws_id])

    const handleClickStar = async ({ collection, id }: any) => {
        const { msg, code } = !collection ?
            await addMyCollection({ job_id: id }) :
            await deleteMyCollection({ job_id: id })

        if (code !== 200) return requestCodeMessage(code, msg)

        setDataSource((p: any) => ({
            ...p,
            data: p.data.map((i: any) => {
                if (id !== i.id) return i
                return {
                    ...i,
                    collection: !collection
                }
            })
        }))
        countRefresh()
    }

    const handleDelete = async ({ id }: any) => {
        const { code, msg } = await deleteJobTest({ job_id: id })
        if (code !== 200) return requestCodeMessage(code, msg)
        const selectedKeys = selectedRowKeys.filter((keys: any) => Number(keys) !== Number(id))
        const selectRows = selectRowData.filter((obj: any) => obj && Number(obj.id) !== Number(id))
        setSelectedRowKeys(selectedKeys);
        setSelectRowData(selectRows);
        message.success(formatMessage({ id: 'operation.success' }))
        const $page_num = Math.ceil((dataSource?.total - 1) / pageQuery.page_size)
        if ($page_num < pageQuery.page_num)
            setPageQuery({ ...pageQuery, page_num: $page_num || 1 })
        else
            listRefresh()
        countRefresh()
    }

    const columns: any = [
        /* @ts-ignore */
        access.IsWsSetting() &&
        {
            title: '',
            key: "collection",
            width: 30,
            align: 'center',
            fixed: 'left',
            className: 'collection_star result_job_hover_span',
            render: (_: any) => (
                <div onClick={() => handleClickStar(_)}>
                    {
                        _.collection ?
                            <StarFilled className="is_collection_star" style={{ color: '#F7B500' }} /> :
                            <StarOutlined className="no_collection_star" />
                    }
                </div>
            )
        },
        {
            title: 'Job ID',
            key: 'id',
            fixed: 'left',
            width: 80,
            ellipsis: {
                showTitle: false,
            },
            className: 'result_job_hover_span',
            render: (_: any, row: any) => <span onClick={() => targetJump(`/ws/${ws_id}/test_result/${row.id}`)}>{row.id}</span>
        },
        {
            title: <FormattedMessage id="ws.result.list.name" />,
            dataIndex: 'name',
            width: 200,
            ellipsis: {
                showTitle: false,
            },
            className: "result_job_hover_span",
            render: (_: any, row: any) => {
                return (
                    <ColumnEllipsisText ellipsis={{ tooltip: <span>{_ || "-"}</span> }}>
                        {
                            row.created_from === 'offline' &&
                            <Offline>
                                <FormattedMessage id="ws.result.list.offline" />
                            </Offline>
                        }
                        <Typography.Link
                            className="result_job_hover_span"
                            target="_blank"
                            href={`/ws/${ws_id}/test_result/${row.id}`}
                        >
                            {_}
                        </Typography.Link>
                    </ColumnEllipsisText>
                )
            }
        },
        {
            title: <FormattedMessage id="ws.result.list.state" />,
            dataIndex: 'state',
            width: 120,
            render: (_: any, row: any) => <JobListStateTag {...row} />
        },
        {
            title: <FormattedMessage id="ws.result.list.test_type" />,
            width: locale ? 140 : 80,
            dataIndex: 'test_type',
            ellipsis: {
                showTitle: false,
            },
            render: (_: any) => {
                const strLocale = matchTestType(_)
                return <FormattedMessage id={`${strLocale}.test`} defaultMessage={_} />
            }
        },
        {
            title: (
                <QusetionIconTootip
                    placement="bottomLeft"
                    title={<FormattedMessage id="ws.result.list.test_type.Tootip" />}
                    desc={
                        <ul style={{ paddingInlineStart: 'inherit', paddingTop: 4, marginBottom: 4, paddingLeft: 0 }}>
                            <li><FormattedMessage id="ws.result.list.test_type.desc1" /></li>
                            <li><FormattedMessage id="ws.result.list.test_type.desc2" /></li>
                        </ul>
                    }
                />
            ),
            dataIndex: 'test_result',
            width: 140,
            render: (_: any, record: any) => {
                let result = {}
                try {
                    result = JSON.parse(_)
                } catch {
                   console.log('JSON格式不对')
                }
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
            title: <FormattedMessage id="ws.result.list.project_id" />,
            width: 120,
            dataIndex: 'project_name',
            ellipsis: {
                showTitle: false,
            },
            render: (_: any) => (
                <ColumnEllipsisText ellipsis={{ tooltip: true }}>
                    {_ || '-'}
                </ColumnEllipsisText>
            )
        },
        {
            title: <FormattedMessage id="ws.result.list.product_version" />,
            width: 120,
            dataIndex: 'product_version',
            ellipsis: {
                showTitle: false,
            },
            render: (_: any) => (
                <ColumnEllipsisText ellipsis={{ tooltip: true }}>
                    {_ || '-'}
                </ColumnEllipsisText>
            )
        },
        {
            title: <FormattedMessage id="ws.result.list.creators" />,
            width: 80,
            ellipsis: {
                showTitle: false,
            },
            dataIndex: 'creator_name',
            render: (_: any) => (
                <ColumnEllipsisText ellipsis={{ tooltip: true }}>
                    {_ || '-'}
                </ColumnEllipsisText>
            )
        },
        {
            title: <FormattedMessage id="ws.result.list.start_time" />,
            width: 180,
            dataIndex: 'start_time',
            ellipsis: {
                showTitle: false,
            },
            sorter: true,
            sortOrder: sortOrder?.start_time,
            render: (_: any) => (
                <ColumnEllipsisText ellipsis={{ tooltip: true }}>
                    {_ || '-'}
                </ColumnEllipsisText>
            )
        },
        {
            title: <FormattedMessage id="ws.result.list.completion_time" />,
            width: 180,
            ellipsis: {
                showTitle: false,
            },
            dataIndex: 'end_time',
            render: (_: any) => (
                <ColumnEllipsisText ellipsis={{ tooltip: true }}>
                    {_ || '-'}
                </ColumnEllipsisText>
            )
        },
        {
            title: <FormattedMessage id="Table.columns.operation" />,
            width: locale ? 170 : 170,
            ellipsis: {
                showTitle: false,
            },
            key: "operation",
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
                                <Typography.Text style={_.created_from === 'offline' ? disableStyle : commonStyle}><FormattedMessage id="operation.rerun" /></Typography.Text>
                            </span>
                        </Access>
                        <Access accessible={access.WsTourist()}>
                            <Access
                                accessible={access.WsMemberOperateSelf(_.creator)}
                                fallback={
                                    <span onClick={() => AccessTootip()}><Typography.Text style={commonStyle}><FormattedMessage id="operation.delete" /></Typography.Text></span>
                                }
                            >
                                <Popconfirm
                                    title={<FormattedMessage id="delete.prompt" />}
                                    onConfirm={() => handleDelete(_)}
                                    okText={<FormattedMessage id="operation.ok" />}
                                    cancelText={<FormattedMessage id="operation.cancel" />}
                                >
                                    <Typography.Text style={commonStyle}>
                                        <FormattedMessage id="operation.delete" />
                                    </Typography.Text>
                                </Popconfirm>
                            </Access>
                        </Access>
                        <ViewReport dreType="left" ws_id={ws_id} jobInfo={_} origin={'jobList'} />
                    </Space>
                )
            }
        }
    ]

    const handleResetSelectedKeys = React.useCallback(() => {
        setSelectedRowKeys([])
        setSelectRowData([])
        setRadioValue(1)
    }, [])

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

    const handleMoreDeleOk = async () => {
        if (!selectedRowKeys.length) return
        const { code, msg } = await deleteJobTest({ job_id_li: selectedRowKeys })
        if (code !== 200) {
            requestCodeMessage(code, msg)
            return
        }
        handleResetSelectedKeys()
        message.success(formatMessage({ id: 'operation.success' }))
        setPageQuery((p: any) => ({ ...p, page_num: Math.ceil((dataSource?.total - selectedRowKeys.length) / p.page_size) || 1 }))
        countRefresh()
        // listRefresh()
    }

    let basePadding = { padding: "0 16px" }
    if (selectedRowKeys.length) {
        // if (radioValue === 2) basePadding = { padding: "0 16px 56px" }
        /* if (radioValue === 1)  */
        basePadding = { padding: "0 16px 106px" }
    }

    const sortStartTime = (sorter: any) => {
        switch (sorter.order) {
            case 'descend':
                setDataSource((res: any) => ({
                    ...res,
                    data: res?.data.sort(function (a: any, b: any) {
                        return a.start_time < b.start_time ? 1 : -1
                    })
                }))
                break;
            case 'ascend':
                setDataSource((res: any) => ({
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

    const filterColumns = columns.filter((col: any) => {
        const { dataIndex, key } = col
        if (key) return col
        if (initialColumns[dataIndex]) {
            if (!initialColumns[dataIndex]?.disabled)
                return col
        }
    })

    return (
        <Row style={basePadding}>
            <ResizeHooksTable
                rowKey="id"
                columns={filterColumns}
                refreshDeps={[
                    access, ws_id, locale, sortOrder, initialColumns, dataSource
                ]}
                name="test-job-list"
                loading={loading}
                dataSource={dataSource?.data}
                pagination={false}
                rowClassName={styles.result_table_row}
                rowSelection={rowSelection}
                onChange={(pagination: any, filters: any, sorter: any) => {
                    const { field, order } = sorter
                    setSortOrder((p: any) => ({ ...p, [field]: order }))
                    sortStartTime(sorter)
                }}
            />
            {
                !loading &&
                <CommonPagination
                    total={dataSource?.total}
                    largePage={true}
                    currentPage={pageQuery?.page_num}
                    pageSize={pageQuery?.page_size}
                    onPageChange={
                        (page_num, page_size) => setPageQuery((p: any) => ({ ...p, page_num, page_size }))
                    }
                />
            }

            {
                (radioValue === 2 && !!selectedRowKeys.length) &&
                <DelBar
                    selectedRowKeys={selectedRowKeys}
                    setSelectedRowKeys={setSelectedRowKeys}
                    onOk={handleMoreDeleOk}
                />
            }

            {
                (radioValue === 1 && !!selectedRowKeys.length) &&
                <SelectionRow >
                    <CompareBar
                        radioType={radioValue}
                        selectedChange={selectedChange}
                        allSelectedRowKeys={selectedRowKeys}
                        allSelectRowData={selectRowData}
                    />
                </SelectionRow>
            }

            <ReRunModal ref={rerunRef} />
        </Row>
    )
}

export default ListTable