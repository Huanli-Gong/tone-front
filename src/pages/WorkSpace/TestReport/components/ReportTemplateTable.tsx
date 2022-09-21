import React, { memo, useEffect, useState, useRef, useMemo } from 'react'
import { Space, Popconfirm, message, Spin } from 'antd'
import { OptBtn, ClsResizeTable } from './styled'
import { useRequest, useAccess, Access, useIntl, FormattedMessage  } from 'umi'
import { queryReportTemplateList, delReportTemplateList } from '../services'
import { FilterFilled } from '@ant-design/icons';
import PopoverEllipsis from '@/components/Public/PopoverEllipsis'
import Highlighter from 'react-highlight-words'
import SearchInput from '@/components/Public/SearchInput'
import SelectUser from '@/components/Public/SelectUser'
import CopyTemplateDrawer from './CopyComplate'
import CommonPagination from '@/components/CommonPagination'
import _ from 'lodash'
import { requestCodeMessage, targetJump, AccessTootip } from '@/utils/utils';

const ReportTemplateTable: React.FC<any> = (props) => {
    const { formatMessage } = useIntl()
    const { ws_id, tab } = props
    const access = useAccess()
    const [autoFocus, setFocus] = useState(true)
    const defaultParmas = {
        name: '',
        creator: '',  //创建人id
        update_user: '',
        page_num: 1,
        page_size: 10,
        ws_id,
    }
    // const access = useAccess()
    const [fetchParams, setFetchParams] = useState<any>()
    const fetchParamsData = fetchParams || defaultParmas
    const copyTemplate: any = useRef(null)
    const { data, loading, run, refresh, params } = useRequest(
        (data: any) => queryReportTemplateList(data),
        {
            formatResult: (response: any) => response,
            initialData: { data: [], total: 0 },
            defaultParams: [{ ws_id: ws_id }]
        }
    )

    const updateFetchParams = (obj = {}) => {
        setFetchParams({ ...fetchParamsData, ...obj })
        run({ ...fetchParamsData, ...obj })
    }

    useEffect(() => {
        setFetchParams(defaultParmas)
    }, [tab])

    const handleTemplateDel = async (id: any) => {
        try {
            const { code, msg } = await delReportTemplateList({ id })
            if (code === 200) {
                message.success(formatMessage({id: 'request.delete.success'}) )
                const num = data.total % data.page_size
                if (Math.ceil(data.total / data.page_size) === data.page_num && num === 1) // 删除的是最后一页的最后一条且最后一页只有一条
                {
                    updateFetchParams({ page_num: data.page_num - 1 > 1 ? data.page_num - 1 : 1 })
                }

                else {
                    refresh()
                }

            } else {
                requestCodeMessage(code, msg)
            }
        } catch (e) {
            console.log(e)
            message.error(formatMessage({id: 'request.delete.failed'}) )
        }
    }
    const handleAddScript = (currentRow: any) => {
        copyTemplate.current?.show(currentRow)
    }
    const handleMemberFilter = (val: [], name: string) => {
        let searchVal: any = val || ''
        if (_.isArray(searchVal)) searchVal = searchVal.join(',')
        const obj = {}
        obj[name] = searchVal;
        updateFetchParams({ ...obj })
    }

    const dataSource = useMemo(() => {
        return data && _.isArray(data.data) ? data.data : []
    }, [data])

    const styleObj = {
        container: 180,
        button_width: 90
    }
    let columns: any = [
        {
            dataIndex: 'name',
            title: <FormattedMessage id="report.columns.template" />,
            ellipsis: {
                shwoTitle: false,
            },
            width: 200,
            // className: 'no_tourist',
            filterDropdown: ({ confirm }: any) => (
                <SearchInput
                    confirm={confirm}
                    autoFocus={autoFocus}
                    styleObj={styleObj}
                    onConfirm={(val: any) => updateFetchParams({ name: val })}
                    currentData={{ tab }}
                    placeholder={formatMessage({id: 'report.columns.template.placeholder'}) }
                />
            ),
            onFilterDropdownVisibleChange: (visible: any) => {
                if (visible) setFocus(!autoFocus)
            },
            filterIcon: () => <FilterFilled style={{ color: fetchParamsData.name ? '#1890ff' : undefined }} />,
            render: (_: any, row: any) => {
                return (
                    <PopoverEllipsis title={_ || '-'} >
                        <Highlighter
                            highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                            searchWords={[fetchParamsData.name || '']}
                            autoEscape
                            textToHighlight={_ || '-'}
                        // onClick={() => history.push(`/ws/${ws_id}/test_report/template/${row.id}${row.is_default ? '/preview' : ''}`)}
                        />
                    </PopoverEllipsis>
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
            filterDropdown: ({ confirm }: any) => <SelectUser autoFocus={autoFocus} confirm={confirm} onConfirm={(val: []) => handleMemberFilter(val, 'creator')} page_size={9999} />,
            onFilterDropdownVisibleChange: (visible: any) => {
                if (visible) {
                    setFocus(!autoFocus)
                }
            },
            filterIcon: () => <FilterFilled style={{ color: fetchParamsData.creator ? '#1890ff' : undefined }} />,
            render: (_: any) => <PopoverEllipsis title={_ || '-'} />
        },
        {
            dataIndex: 'update_user_name',
            width: 180,
            ellipsis: {
                shwoTitle: false,
            },
            title: <FormattedMessage id="report.columns.update_user_name" />,
            filterDropdown: ({ confirm }: any) => <SelectUser autoFocus={autoFocus} confirm={confirm} onConfirm={(val: []) => handleMemberFilter(val, 'update_user')} page_size={9999} />,
            onFilterDropdownVisibleChange: (visible: any) => {
                if (visible) {
                    setFocus(!autoFocus)
                }
            },
            filterIcon: () => <FilterFilled style={{ color: fetchParamsData.update_user ? '#1890ff' : undefined }} />,
            render: (_: any) => <PopoverEllipsis title={_ || '-'} />

        }, {
            dataIndex: 'description',
            width: 200,
            ellipsis: {
                shwoTitle: false,
            },
            title: <FormattedMessage id="report.columns.description" />,
            render: (_: any) => <PopoverEllipsis title={_ || '-'} />
        }, {
            dataIndex: 'gmt_created',
            width: 200,
            ellipsis: {
                shwoTitle: false,
            },
            title: <FormattedMessage id="report.columns.gmt_created" />,
            render: (_: any) => <PopoverEllipsis title={_ || '-'} />
        }, {
            dataIndex: 'gmt_modified',
            width: 200,
            ellipsis: {
                shwoTitle: false,
            },
            title: <FormattedMessage id="report.columns.gmt_modified.s" />,
            render: (_: any) => <PopoverEllipsis title={_ || '-'} />
        }, {
            title: <FormattedMessage id="Table.columns.operation" />,
            fixed: 'right',
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
                                <Space>
                                    {
                                        !isDefault &&
                                        <span
                                            style={{ color: '#1890FF', cursor: 'pointer' }}
                                            onClick={() => AccessTootip()}
                                        >
                                            <FormattedMessage id="operation.edit" />
                                        </span>
                                    }
                                    <OptBtn onClick={() => AccessTootip()}><FormattedMessage id="operation.copy" /></OptBtn>
                                    { !isDefault && <OptBtn onClick={() => AccessTootip()}><FormattedMessage id="operation.delete" /></OptBtn>}
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
            <ClsResizeTable
                size="small"
                rowKey="id"
                columns={columns}
                dataSource={dataSource}
                pagination={false}
                scroll={{
                    x: '100%'
                }}
            />
            <CommonPagination
                total={data.total}
                currentPage={params[0] && params[0].page_num}
                pageSize={params[0] && params[0].page_size}
                onPageChange={
                    (page_num, page_size) => updateFetchParams({ page_num, page_size })
                }
            />
            <CopyTemplateDrawer ref={copyTemplate} onOk={refresh} ws_id={ws_id} />
        </Spin>
    )
}

export default memo(ReportTemplateTable)
