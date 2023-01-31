import React, { memo, useEffect, useState } from 'react'
import { Space, Popconfirm, message, Spin, DatePicker, Divider, Button } from 'antd'
import { OptBtn, ClsResizeTable } from './styled'
import { Access, useAccess, useIntl, FormattedMessage } from 'umi'
import { FilterFilled } from '@ant-design/icons';
import Highlighter from 'react-highlight-words'
import SelectProject from '@/components/Public/SelectProject'
import SelectProductVersion from '@/components/Public/SelectProductVersion'
import CommonPagination from '@/components/CommonPagination'
import { queryReportList, delReportList, } from '../services'
import _ from 'lodash'
import { requestCodeMessage, AccessTootip, handlePageNum, useStateRef } from '@/utils/utils';
import { getSearchFilter, getUserFilter } from '@/components/TableFilters'
import { ResizeHooksTable } from '@/utils/table.hooks';
import { ColumnEllipsisText } from '@/components/ColumnComponents';

const { RangePicker } = DatePicker
const ReportListTable = (props: any) => {
    const { formatMessage } = useIntl()
    const access = useAccess()
    const { ws_id } = props
    const [pageParam, setPageParam] = useState<any>({
        page_num: 1,
        page_size: 10,
        ws_id,
    })
    const [loading, setLoading] = useState<boolean>(false)
    const [dataSource, setDataSource] = useState<any>({})
    const pageCurrent = useStateRef(pageParam)

    const queryReport = async () => {
        setLoading(true)
        const data = await queryReportList(pageParam)
        if (data.code === 200) {
            setDataSource(data || {})
        } else {
            requestCodeMessage(data.code, data.msg)
        }
        setLoading(false)
    }

    useEffect(() => {
        queryReport()
    }, [pageParam])

    const totalCurrent = useStateRef(dataSource)
    const handleReportDel = async (id: any) => {
        const { page_size } = pageCurrent.current
        const { code, msg } = await delReportList({ report_id: id })
        if (code === 200) {
            setPageParam({ ...pageParam, page_num: handlePageNum(pageCurrent, totalCurrent), page_size })
            message.success(formatMessage({ id: 'request.delete.success' }))
        } else {
            requestCodeMessage(code, msg)
        }
    }
    const styleObj = {
        container: 180,
        button_width: 90
    }

    const handleSelectTime = (date: any, dateStrings: any, confirm: any) => {
        const start_time = dateStrings[0]
        const end_time = dateStrings[1]
        if (!start_time && !end_time) setPageParam({ ...pageParam, gmt_modified: null })
        if (start_time && end_time) setPageParam({ ...pageParam, gmt_modified: JSON.stringify({ start_time, end_time }) })
        confirm()
    }

    const columns: any = [{
        dataIndex: 'name',
        title: <FormattedMessage id="report.columns.name" />,
        width: 200,
        ellipsis: {
            shwoTitle: false,
        },
        className: 'no_tourist',
        ...getSearchFilter(
            pageParam,
            setPageParam,
            'name',
            formatMessage({ id: 'report.columns.name.placeholder' }),
            styleObj,
        ),
        render: (_: any, row: any) => {
            return (
                <ColumnEllipsisText ellipsis={{ tooltip: _ }}>
                    <Highlighter
                        highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                        searchWords={[pageParam.name || '']}
                        autoEscape
                        textToHighlight={_ || '-'}
                        onClick={() => window.open(`/ws/${ws_id}/test_report/${row.id}/`)}
                    />
                </ColumnEllipsisText>
            )
        }
    },
    {
        title: <FormattedMessage id="report.columns.project" />,
        ellipsis: {
            shwoTitle: false,
        },
        width: 150,
        dataIndex: 'project',
        filterDropdown: ({ confirm }: any) => <SelectProject
            confirm={confirm}
            onConfirm={(val: any) => setPageParam({ ...pageParam, project_id: val, page_num: 1 })}
            page_size={9999}
            ws_id={ws_id}
        />,
        filterIcon: () => <FilterFilled style={{ color: pageParam.project_id ? '#1890ff' : undefined }} />,
        render: (_: any) => <ColumnEllipsisText ellipsis={{ tooltip: true }} children={_ || '-'} />
    },
    {
        dataIndex: 'product_version',
        ellipsis: {
            shwoTitle: false,
        },
        width: 150,
        title: <FormattedMessage id="report.columns.product_version" />,
        filterDropdown: ({ confirm }: any) => <SelectProductVersion
            confirm={confirm}
            onConfirm={(val: any) => setPageParam({ ...pageParam, product_version: val, page_num: 1 })}
            page_size={9999}
            ws_id={ws_id}
        />,
        filterIcon: () => <FilterFilled style={{ color: pageParam.product_version ? '#1890ff' : undefined }} />,
        render: (_: any) => <ColumnEllipsisText ellipsis={{ tooltip: true }} children={_ || '-'} />
    },
    {
        dataIndex: 'creator',
        width: 150,
        title: <FormattedMessage id="report.columns.creator" />,
        ...getUserFilter(pageParam, setPageParam, 'creator'),
        render: (_: any) => <ColumnEllipsisText ellipsis={{ tooltip: true }} children={_ || '-'} />
    },
    {
        dataIndex: 'description',
        width: 200,
        title: <FormattedMessage id="report.columns.description" />,
        ellipsis: {
            shwoTitle: false,
        },
        render: (_: any) => <ColumnEllipsisText ellipsis={{ tooltip: true }} children={_ || '-'} />
    },
    {
        dataIndex: 'gmt_modified',
        width: 200,
        title: <FormattedMessage id="report.columns.gmt_modified" />,
        filterDropdown: ({ confirm }: any) => (
            <>
                <RangePicker
                    size="middle"
                    showTime={{ format: 'HH:mm:ss' }}
                    format="YYYY-MM-DD HH:mm:ss"
                    onChange={_.partial(handleSelectTime, _, _, confirm)}
                />,
                <Divider style={{ marginTop: '10px', marginBottom: '4px' }} />
                <Button
                    type="text"
                    onClick={() => setPageParam({ ...pageParam, gmt_modified: undefined })}
                    size="small"
                    style={{ width: 75, border: 'none' }}
                >
                    <FormattedMessage id="operation.reset" />
                </Button>
            </>
        ),

        filterIcon: () => <FilterFilled style={{ color: pageParam.gmt_modified ? '#1890ff' : undefined }} />,
        ellipsis: true,
        render: (record: any) => {
            return record || '-'
        }
    },
    access.WsTourist() &&
    {
        title: <FormattedMessage id="Table.columns.operation" />,
        width: 200,
        fixed: 'right',
        render(row: any) {
            const id = _.get(row, 'id')
            return (
                <Access
                    accessible={access.WsMemberOperateSelf(row.creator_id)}
                    fallback={
                        <Space>
                            <OptBtn onClick={() => AccessTootip()}><FormattedMessage id="operation.edit" /></OptBtn>
                            <OptBtn onClick={() => AccessTootip()}><FormattedMessage id="operation.delete" /></OptBtn>
                        </Space>
                    }
                >
                    <Space>
                        <OptBtn onClick={() => window.open(`/ws/${ws_id}/test_report/${id}/edit`)}><FormattedMessage id="operation.edit" /></OptBtn>
                        <Popconfirm
                            title={<FormattedMessage id="report.report.delete.prompt" />}
                            okText={<FormattedMessage id="operation.confirm" />}
                            cancelText={<FormattedMessage id="operation.cancel" />}
                            onConfirm={_.partial(handleReportDel, id || '')}
                        >
                            <OptBtn><FormattedMessage id="operation.delete" /></OptBtn>
                        </Popconfirm>
                    </Space>
                </Access>
            )
        }
    }].filter(Boolean);

    return (
        <Spin spinning={loading}>
            <ClsResizeTable>
                <ResizeHooksTable
                    size="small"
                    name="ws-test-report-list"
                    refreshDeps={[access, ws_id, pageParam]}
                    rowKey={"id"}
                    columns={columns}
                    pagination={false}
                    dataSource={dataSource.data || []}
                />
            </ClsResizeTable>
            <CommonPagination
                total={dataSource.total}
                pageSize={pageParam.page_size}
                currentPage={pageParam.page_num}
                onPageChange={
                    (page_num, page_size) => {
                        setPageParam({ ...pageParam, page_num, page_size })
                    }
                }
            />
        </Spin>
    )
}

export default memo(ReportListTable)
