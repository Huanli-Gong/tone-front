import React, { memo, useEffect, useState, useRef, useMemo } from 'react'
import { Space, Popconfirm, message, Spin } from 'antd'
import { OptBtn, ClsResizeTable } from './styled'
import { useAccess, Access, useIntl, FormattedMessage } from 'umi'
import { queryReportTemplateList, delReportTemplateList } from '../services'
import Highlighter from 'react-highlight-words'
import CopyTemplateDrawer from './CopyComplate'
import CommonPagination from '@/components/CommonPagination'
import _ from 'lodash'
import { requestCodeMessage, targetJump, AccessTootip, handlePageNum, useStateRef } from '@/utils/utils';
import { getSearchFilter, getUserFilter } from '@/components/TableFilters'
import { ResizeHooksTable } from '@/utils/table.hooks'
import { ColumnEllipsisText } from '@/components/ColumnComponents'

const ReportTemplateTable: React.FC<any> = (props) => {
    const { formatMessage } = useIntl()
    const { ws_id, tab } = props
    const access = useAccess()
    const defaultParmas = {
        name: '',
        creator: '',  //创建人id
        update_user: '',
        page_num: 1,
        page_size: 10,
        ws_id,
    }
    const [params, setParams] = useState<any>(defaultParmas)
    const [data, setData] = useState<any>({})
    const [loading, setLoading] = useState<boolean>(false)
    const copyTemplate: any = useRef(null)
    const pageCurrent = useStateRef(params)
    const queryList = async () => {
        setLoading(true)
        const res = await queryReportTemplateList(params)
        const { code, msg } = res
        if (code === 200) {
            setData(res)
            setLoading(false)
        } else {
            requestCodeMessage(code, msg)
        }
    }
    const totalCurrent = useStateRef(data)
    useEffect(() => {
        queryList()
    }, [params])

    useEffect(() => {
        setParams(defaultParmas)
    }, [tab])

    const handleTemplateDel = async (id: any) => {
        const { page_size } = pageCurrent.current
        try {
            const { code, msg } = await delReportTemplateList({ id })
            if (code === 200) {
                setParams({ ...params, page_num: handlePageNum(pageCurrent, totalCurrent), page_size })
                message.success(formatMessage({ id: 'request.delete.success' }))
            } else {
                requestCodeMessage(code, msg)
            }
        } catch (e) {
            console.log(e)
            message.error(formatMessage({ id: 'request.delete.failed' }))
        }
    }
    const handleAddScript = (currentRow: any) => {
        copyTemplate.current?.show(currentRow)
    }

    const dataSource = useMemo(() => {
        return data && _.isArray(data.data) ? data.data : []
    }, [data])

    const styleObj = {
        container: 180,
        button_width: 90
    }

    const columns: any = [
        {
            dataIndex: 'name',
            title: <FormattedMessage id="report.columns.template" />,
            ellipsis: {
                shwoTitle: false,
            },
            width: 200,
            ...getSearchFilter(
                params,
                setParams,
                'name',
                formatMessage({ id: 'report.columns.template.placeholder' }),
                styleObj,
            ),
            render: (_: any, row: any) => {
                return (
                    <ColumnEllipsisText ellipsis={{ tooltip: _ }} >
                        <Highlighter
                            highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                            searchWords={[params.name || '']}
                            autoEscape
                            textToHighlight={_ || '-'}
                        />
                    </ColumnEllipsisText>
                )
            }
        },
        {
            dataIndex: 'creator_name',
            ellipsis: {
                shwoTitle: false,
            },
            width: 180,
            title: <FormattedMessage id="report.columns.creator_name" />,
            ...getUserFilter(params, setParams, 'creator'),
            render: (_: any) => <ColumnEllipsisText ellipsis={{ tooltip: true }} children={_ || '-'} />
        },
        {
            dataIndex: 'update_user_name',
            width: 180,
            ellipsis: {
                shwoTitle: false,
            },
            title: <FormattedMessage id="report.columns.update_user_name" />,
            ...getUserFilter(params, setParams, 'update_user'),
            render: (_: any) => <ColumnEllipsisText ellipsis={{ tooltip: true }} children={_ || '-'} />
        },
        {
            dataIndex: 'description',
            width: 200,
            ellipsis: {
                shwoTitle: false,
            },
            title: <FormattedMessage id="report.columns.description" />,
            render: (_: any) => <ColumnEllipsisText ellipsis={{ tooltip: true }} children={_ || '-'} />
        },
        {
            dataIndex: 'gmt_created',
            width: 200,
            ellipsis: {
                shwoTitle: false,
            },
            title: <FormattedMessage id="report.columns.gmt_created" />,
            render: (_: any) => <ColumnEllipsisText ellipsis={{ tooltip: true }} children={_ || '-'} />
        },
        {
            dataIndex: 'gmt_modified',
            width: 200,
            ellipsis: {
                shwoTitle: false,
            },
            title: <FormattedMessage id="report.columns.gmt_modified.s" />,
            render: (_: any) => <ColumnEllipsisText ellipsis={{ tooltip: true }} children={_ || '-'} />
        },
        {
            title: <FormattedMessage id="Table.columns.operation" />,
            fixed: 'right',
            key: "operation",
            width: 200,
            render(row: any) {
                const isDefault = _.get(row, 'is_default')
                return (
                    <Space>
                        <span
                            style={{ color: '#1890FF', cursor: 'pointer' }}
                            onClick={() => targetJump(`/ws/${ws_id}/test_report/template/${row.id}/preview`)}
                        >
                            <FormattedMessage id="operation.preview" />
                        </span>
                        <Access
                            accessible={access.WsMemberOperateSelf(row.creator)}
                            fallback={
                                <Space onClick={() => AccessTootip()}>
                                    {
                                        !isDefault &&
                                        <span
                                            style={{ color: '#1890FF', cursor: 'pointer' }}
                                        >
                                            <FormattedMessage id="operation.edit" />
                                        </span>
                                    }
                                    <OptBtn ><FormattedMessage id="operation.copy" /></OptBtn>
                                    {!isDefault && <OptBtn ><FormattedMessage id="operation.delete" /></OptBtn>}
                                </Space>
                            }
                        >
                            <Space>
                                {
                                    !isDefault &&
                                    <span
                                        style={{ color: '#1890FF', cursor: 'pointer' }}
                                        onClick={() => targetJump(`/ws/${ws_id}/test_report/template/${row.id}`)}
                                    >
                                        <FormattedMessage id="operation.edit" />
                                    </span>
                                }
                                <OptBtn onClick={_.partial(handleAddScript, row)}><FormattedMessage id="operation.copy" /></OptBtn>
                                {
                                    !isDefault &&
                                    <Popconfirm
                                        title={<FormattedMessage id="report.template.delete.prompt" />}
                                        okText={<FormattedMessage id="operation.confirm" />}
                                        cancelText={<FormattedMessage id="operation.cancel" />}
                                        onConfirm={_.partial(handleTemplateDel, _.get(row, 'id') || '')}
                                    >
                                        <OptBtn><FormattedMessage id="operation.delete" /></OptBtn>
                                    </Popconfirm>
                                }
                            </Space>
                        </Access>
                    </Space>
                )
            }
        }
    ]

    return (
        <Spin spinning={loading}>
            <ClsResizeTable >
                <ResizeHooksTable
                    size="small"
                    rowKey={"id"}
                    columns={columns}
                    name="ws-report-template-table"
                    loading={loading}
                    dataSource={dataSource}
                    pagination={false}
                />
            </ClsResizeTable>
            <CommonPagination
                total={data.total}
                currentPage={params.page_num}
                pageSize={params.page_size}
                onPageChange={
                    (page_num, page_size) => setParams({ ...params, page_num, page_size })
                }
            />
            <CopyTemplateDrawer ref={copyTemplate} onOk={queryList} ws_id={ws_id} />
        </Spin>
    )
}

export default memo(ReportTemplateTable)
