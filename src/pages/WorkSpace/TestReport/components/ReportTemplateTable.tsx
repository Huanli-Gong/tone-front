import React, { memo, useEffect, useState, useRef, useMemo } from 'react'
import { Space, Popconfirm, message, Spin } from 'antd'
import { OptBtn, ClsResizeTable } from './styled'
import { useRequest } from 'umi'
import { queryReportTemplateList, delReportTemplateList } from '../services'
import { FilterFilled } from '@ant-design/icons';
import PopoverEllipsis from '@/components/Public/PopoverEllipsis'
import Highlighter from 'react-highlight-words'
import SearchInput from '@/components/Public/SearchInput'
import SelectUser from '@/components/Public/SelectUser'
import CopyTemplateDrawer from './CopyComplate'
import CommonPagination from '@/components/CommonPagination'
import _ from 'lodash'
import { requestCodeMessage, targetJump } from '@/utils/utils'

const ReportTemplateTable: React.FC<any> = (props) => {
    const { ws_id, tab } = props
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
                message.success('删除成功')
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
            message.error('删除失败')
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
    let columns:any = [
        {
            dataIndex: 'name',
            title: '模版名称',
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
                    placeholder="支持报告名称"
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
            title: '创建者',
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
            title: '修改者',
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
            title: '描述',
            render: (_: any) => <PopoverEllipsis title={_ || '-'} />
        }, {
            dataIndex: 'gmt_created',
            width: 200,
            ellipsis: {
                shwoTitle: false,
            },
            title: '创建时间',
            render: (_: any) => <PopoverEllipsis title={_ || '-'} />
        }, {
            dataIndex: 'gmt_modified',
            width: 200,
            ellipsis: {
                shwoTitle: false,
            },
            title: '修改时间',
            render: (_: any) => <PopoverEllipsis title={_ || '-'} />
        }, {
            title: '操作',
            fixed: 'right',
            width: 200,
            render(row: any) {
                const isDefault = _.get(row, 'is_default')
                return (
                    <Space>
                        {
                            !isDefault &&
                            <span style={{ color: '#1890FF', cursor: 'pointer' }} onClick={() => targetJump(`/ws/${ws_id}/test_report/template/${row.id}`)}>
                                编辑
                            </span>
                        }
                        <OptBtn onClick={_.partial(handleAddScript, row)}>复制</OptBtn>
                        <span
                            style={{ color: '#1890FF', cursor: 'pointer' }}
                            onClick={() => targetJump(`/ws/${ws_id}/test_report/template/${row.id}/preview`)}
                        >
                            预览
                        </span>
                        {
                            !isDefault &&
                            <Popconfirm
                                title="确认删除该模板吗？"
                                okText="确认"
                                cancelText="取消"
                                onConfirm={_.partial(handleTemplateDel, _.get(row, 'id') || '')}
                            >
                                <OptBtn>删除</OptBtn>
                            </Popconfirm>
                        }
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
                    x: 'max-content'
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
