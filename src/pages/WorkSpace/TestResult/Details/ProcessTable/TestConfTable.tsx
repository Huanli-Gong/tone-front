/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react'
import { message, Space, Typography } from 'antd'
import ConfPopoverTable from './ConfPopoverTable'
import { evnPrepareState, tooltipTd } from '../components'
import ServerLink from '@/components/MachineWebLink/index';
import { updateSuiteCaseOption, queryProcessCaseList } from '../service'
import { useAccess, Access, useModel, useIntl, FormattedMessage, getLocale, useParams } from 'umi'
import { requestCodeMessage, AccessTootip, handlePageNum, useStateRef } from '@/utils/utils'
import CommonPagination from '@/components/CommonPagination';
import TidDetail from './QueryTidList';
import { ResizeHooksTable } from '@/utils/table.hooks';
import { ColumnEllipsisText } from '@/components/ColumnComponents';

const TestConfTable: React.FC<Record<string, any>> = (props) => {
    const { test_suite_name, test_suite_id, testType, provider_name, creator, columnsRefresh, setColumnsRefresh } = props
    const { id: job_id } = useParams() as any
    const { formatMessage } = useIntl()
    const locale = getLocale() === 'en-US';
    const PAGE_DEFAULT_PARAMS: any = {
        page_num: 1,
        page_size: 10,
        job_id,
        test_suite_id,
    }
    const [pageParams, setPageParams] = useState<any>(PAGE_DEFAULT_PARAMS)
    const [loading, setLoading] = useState<boolean>(false)
    const [total, setTotal] = useState<number>(0)
    const [dataSource, setDataSource] = useState<any>({ data: [], total: 0 })
    const { initialState } = useModel('@@initialState');
    const access = useAccess();

    const queryTestListTableData = async (params: any) => {
        setLoading(true)
        const data = await queryProcessCaseList(params)
        const { code, msg } = data
        if (code === 200) {
            setDataSource(data)
            setTotal(total)
            setLoading(false)
        } else {
            requestCodeMessage(code, msg)
        }
    }

    const pageCurrent = useStateRef(pageParams)
    const totalCurrent = useStateRef(dataSource)

    const doConfServer = async (_: any, state: any) => {
        // 添加用户id
        const { user_id } = initialState?.authList
        const q = user_id ? { user_id } : {}
        const { code, msg } = await updateSuiteCaseOption({
            ...q,
            editor_obj: 'test_job_conf',
            test_job_conf_id: _.id,
            state
        })
        const { page_size } = pageCurrent.current
        if (code === 200) {
            setPageParams({ ...pageParams, page_num: handlePageNum(pageCurrent, totalCurrent), page_size })
            message.success(formatMessage({ id: 'operation.success' }))
        } else {
            requestCodeMessage(code, msg)
        }
    }

    useEffect(() => {
        queryTestListTableData(pageParams)
    }, [pageParams])

    const columns: any = [
        {
            dataIndex: 'test_case_name',
            title: 'Test Conf',
            width: 160,
            ...tooltipTd(),
        },
        {
            dataIndex: 'server',
            title: ['business_business'].includes(testType) ?
                <FormattedMessage id="ws.result.details.the.server" /> :
                <FormattedMessage id="ws.result.details.test.server" />,
            width: 100,
            ellipsis: {
                showTitle: false
            },
            render: (_: any, row: any) => (
                <ServerLink
                    {...row}
                    val={_}
                    param={row.server_id}
                    provider={provider_name}
                    description={row.server_description}
                />
            )
        },
        {
            title: <FormattedMessage id="ws.result.details.env.preparation" />,
            width: locale ? 200 : 80,
            ellipsis: {
                showTitle: false
            },
            key: "preparation",
            render: (_: any) => {
                const strLocals = formatMessage({ id: 'ws.result.details.env.preparation.details' })
                return (
                    <ConfPopoverTable
                        {..._}
                        title={`${test_suite_name}/${_.name || _.test_case_name}${strLocals}`}
                    />
                )
            }
        },
        {
            dataIndex: 'state',
            title: <FormattedMessage id="ws.result.details.state" />,
            ellipsis: true,
            width: 80,
            render: evnPrepareState
        },
        {
            dataIndex: 'tid',
            title: 'TID',
            width: 120,
            ellipsis: {
                showTitle: false
            },
            render: (_: any) => _ && _.length ? _.indexOf('API_v2_0_') > -1 ? <ColumnEllipsisText ellipsis={{ tooltip: true }} >{_}</ColumnEllipsisText> : <TidDetail tid={_} /> : '-'
        },
        {
            dataIndex: 'result',
            title: <FormattedMessage id="ws.result.details.output.results" />,
            width: 150,
            ...tooltipTd('Nothing to do'),
        },
        {
            dataIndex: 'start_time',
            width: 160,
            title: <FormattedMessage id="ws.result.details.start_time" />,
            ...tooltipTd('-'),
        },
        {
            dataIndex: 'end_time',
            width: 160,
            title: <FormattedMessage id="ws.result.details.end_time" />,
            ...tooltipTd('-'),
        },
        {
            title: <FormattedMessage id="ws.result.details.view.log" />,
            width: 80,
            ellipsis: {
                showTitle: false
            },
            fixed: "right",
            key: "log",
            render: (_: any) => {
                const strLocals = formatMessage({ id: 'ws.result.details.log' })
                // success,fail,stop 可看日志
                if (["success", "fail", "stop"].includes(_.state)) {
                    if (_.log_file)
                        return (
                            <Typography.Link
                                target={"_blank"}
                                href={_.log_file}
                            >
                                {strLocals}
                            </Typography.Link>
                        )
                }
                return <Typography.Text disabled>{strLocals}</Typography.Text >
            }
        },
        {
            title: <FormattedMessage id="Table.columns.operation" />,
            width: 80,
            ellipsis: {
                showTitle: false
            },
            fixed: "right",
            key: "operation",
            render: (_: any) => (
                <Access accessible={access.WsTourist()}>
                    <Access
                        accessible={access.WsMemberOperateSelf(creator)}
                        fallback={
                            <Typography.Link
                                onClick={() => AccessTootip()}
                            >
                                {
                                    _.state === 'running' &&
                                    <FormattedMessage id="ws.result.details.suspension" />
                                }
                                {
                                    _.state === 'pending' &&
                                    <FormattedMessage id="ws.result.details.skip" />
                                }
                            </Typography.Link>
                        }
                    >
                        {
                            _.state === 'running' &&
                            <Typography.Link
                                onClick={() => doConfServer(_, 'stop')}
                            >
                                <FormattedMessage id="ws.result.details.suspension" />
                            </Typography.Link>
                        }
                        {
                            _.state === 'pending' &&
                            <Typography.Link
                                onClick={() => doConfServer(_, 'skip')}
                            >
                                <FormattedMessage id="ws.result.details.skip" />
                            </Typography.Link>
                        }
                    </Access>
                </Access>
            )
        },
    ]

    return (
        <Space style={{ width: "100%", paddingLeft: 40, paddingBottom: 8 }} direction={"vertical"}>
            <ResizeHooksTable
                columns={columns}
                name="ws-job-result-process-testconf"
                dataSource={dataSource?.data || []}
                refreshDeps={[provider_name, access, testType, test_suite_name, creator, columnsRefresh]}
                loading={loading}
                rowKey='id'
                size="small"
                pagination={false}
                onColumnsChange={setColumnsRefresh}
            />
            <CommonPagination
                style={{ marginTop: 0, marginBottom: 0 }}
                total={dataSource.total}
                currentPage={pageParams.page_num}
                pageSize={pageParams.page_size}
                onPageChange={
                    (page_num, page_size) => {
                        setPageParams({ ...pageParams, page_num, page_size })
                    }
                }
            />
        </Space>
    )
}

export default TestConfTable