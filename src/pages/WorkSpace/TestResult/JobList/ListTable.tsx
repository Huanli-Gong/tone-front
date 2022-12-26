import React from "react"
import { Tooltip, Row, Col, Space, Typography, Popconfirm, message, Button } from "antd"
import { useAccess, Access, useParams, useIntl, FormattedMessage, getLocale } from 'umi'
import { requestCodeMessage, targetJump, AccessTootip, matchTestType } from '@/utils/utils'
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
// import { transQuery } from "./utils"
import CompareBar from '../CompareBar'
import ReRunModal from '@/pages/WorkSpace/TestResult/Details/components/ReRunModal'
import ViewReport from '../CompareBar/ViewReport'
import styles from "../index.less"

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

type IProps = {
    [k: string]: any
}

const DEFAULT_PAGE_QUERY = { page_num: 1, page_size: 20 }

const ListTable: React.FC<IProps> = (props) => {
    const { formatMessage } = useIntl()
    const locale = getLocale() === 'en-US';
    const { pageQuery, setPageQuery, radioValue = 1, countRefresh } = props
    const { ws_id } = useParams() as any
    const access = useAccess()
    const [selectedRowKeys, setSelectedRowKeys] = React.useState<any[]>([])
    const [selectRowData, setSelectRowData] = React.useState<any[]>([])
    const rerunRef = React.useRef(null) as any

    const [loading, setLoading] = React.useState(true)
    const [source, setSource] = React.useState<Record<string, any>>({})

    const queryTestList = async () => {
        setLoading(true)
        const { code, msg, ...rest } = await queryTestResultList(pageQuery)
        setLoading(false)
        if (code !== 200) return
        setSource(rest)
    }

    React.useEffect(() => {
        queryTestList()
    }, [pageQuery])

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

        setSource((p: any) => ({
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
        queryTestList()
        countRefresh()
    }

    const [columns, setColumns] = React.useState([
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
            title: 'Job ID',
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
            title: <FormattedMessage id="ws.result.list.name" />,
            dataIndex: 'name',
            width: 200,
            ellipsis: {
                showTitle: false,
            },
            render: (_: any, row: any) => {
                return (
                    <span>
                        {
                            row.created_from === 'offline' &&
                            <Offline>
                                <FormattedMessage id="ws.result.list.offline" />
                            </Offline>
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
                    </span>
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
            render: (_: any, row: any) => {
                const strLocale = matchTestType(_)
                return <span><FormattedMessage id={`${strLocale}.test`} defaultMessage={_} /></span>
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
            title: <FormattedMessage id="ws.result.list.project_id" />,
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
            title: <FormattedMessage id="ws.result.list.creators" />,
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
            title: <FormattedMessage id="ws.result.list.start_time" />,
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
        },
        {
            title: <FormattedMessage id="ws.result.list.completion_time" />,
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
            title: <FormattedMessage id="Table.columns.operation" />,
            width: locale ? 170 : 170,
            ellipsis: {
                showTitle: false,
            },
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
    ])

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
        message.success(formatMessage({ id: 'operation.success' }))
        countRefresh()
        queryTestList()
    }

    let basePadding = { padding: "0 16px" }
    if (selectedRowKeys.length) {
        if (radioValue === 2) basePadding = { padding: "0 16px 56px" }
        if (radioValue === 1) basePadding = { padding: "0 16px 106px" }
    }

    const sortStartTime = (sorter: any) => {
        switch (sorter.order) {
            case 'descend':
                setSource((res: any) => ({
                    ...res,
                    data: res?.data.sort(function (a: any, b: any) {
                        return a.start_time < b.start_time ? 1 : -1
                    })
                }))
                break;
            case 'ascend':
                setSource((res: any) => ({
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
                dataSource={source?.data}
                columns={columns}
                setColumns={setColumns}
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
                    total={source?.total}
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
                            <span>{formatMessage({ id: 'selected.item' }, { data: selectRowData.length })}</span>
                        </Space>
                        <Space>
                            <Button onClick={handleResetSelectedKeys}><FormattedMessage id="operation.cancel" /></Button>
                            <Button
                                type="primary"
                                onClick={handleMoreDeleOk}
                                disabled={!selectedRowKeys.length}
                            >
                                <FormattedMessage id="ws.result.list.batch.delete" />
                            </Button>
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

export default ListTable