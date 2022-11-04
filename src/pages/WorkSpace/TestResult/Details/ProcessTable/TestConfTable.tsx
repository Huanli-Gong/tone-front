import React, { useEffect, useState } from 'react'
import { Button, message } from 'antd'
import ConfPopoverTable from './ConfPopoverTable'
import { evnPrepareState, tooltipTd, copyTooltipColumn } from '../components'
// import PermissionTootip from '@/components/Public/Permission/index';
import ServerLink from '@/components/MachineWebLink/index';
import { updateSuiteCaseOption, queryProcessCaseList } from '../service'
import { useAccess, Access, useModel, useIntl, FormattedMessage, getLocale } from 'umi'
import { requestCodeMessage, AccessTootip } from '@/utils/utils'
import CommonPagination from '@/components/CommonPagination';
import ResizeTable from '@/components/ResizeTable'
import TidDetail from './QueryTidList';
import EllipsisPulic from '@/components/Public/EllipsisPulic'

export default ({ test_suite_name, test_suite_id, job_id, testType, provider_name }: any) => {
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
    const [dataSource, setDataSource] = useState<any>([])
    const { initialState } = useModel('@@initialState');
    const access = useAccess();

    const queryTestListTableData = async (params:any) => {
        setLoading(true)
        const { data, code, msg, total } = await queryProcessCaseList(params)
        if (code === 200) {
            setDataSource(data)
            setTotal(total)
            setLoading(false)
        } else {
            requestCodeMessage(code, msg)
        }
    }
   
    useEffect(() => {
        queryTestListTableData(pageParams)
    }, [pageParams])


    const columns = React.useMemo(() => [
        {
            dataIndex: 'test_case_name',
            title: 'Test Conf',
            width: 160,
            ...tooltipTd(),
        },
        {
            dataIndex: 'server',
            title: ['business_business'].includes(testType) ? <FormattedMessage id="ws.result.details.the.server"/> : <FormattedMessage id="ws.result.details.test.server"/>,
            width: 100,
            ellipsis: {
                showTitle: false
            },
            render: (_: any, row: any) => (
                <ServerLink 
                    val={_} 
                    param={row.server_id}
                    provider={provider_name} 
                    description={row.server_description}
                />
            )
            
        },
        {
            title: <FormattedMessage id="ws.result.details.env.preparation"/>,
            width: locale ? 200: 80,
            ellipsis: {
                showTitle: false
            },
            render: (_: any) => {
                const strLocals = formatMessage({id: 'ws.result.details.env.preparation.details'})
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
            title: <FormattedMessage id="ws.result.details.state"/>,
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
            render:(_:any) => _ && _.length ? _.indexOf('API_v2_0_') > -1 ? <EllipsisPulic title={_} /> : <TidDetail tid={_} /> : '-'
        },
        {
            dataIndex: 'result',
            title: <FormattedMessage id="ws.result.details.output.results"/>,
            width: 150,
            ...tooltipTd('Nothing to do'),
        },
        {
            dataIndex: 'start_time',
            width: 160,
            title: <FormattedMessage id="ws.result.details.start_time"/>,
            ...tooltipTd('-'),
        },
        {
            dataIndex: 'end_time',
            width: 160,
            title: <FormattedMessage id="ws.result.details.end_time"/>,
            ...tooltipTd('-'),
        }, {
            title: <FormattedMessage id="ws.result.details.view.log"/>,
            width: 80,
            ellipsis: {
                showTitle: false
            },
            render: (_: any) => {
                const strLocals = formatMessage({id: 'ws.result.details.log'})
                // success,fail,stop 可看日志
                if (_.state === 'success' || _.state === 'fail' || _.state === 'stop') {
                    if (_.log_file)
                        // return <PermissionTootip>
                        //     <Button type="link" disabled={true} style={{ padding: 0 }} onClick={() => window.open(_.log_file)}>日志</Button>
                        // </PermissionTootip>
                        return  <Button size="small" type="link" style={{ padding: 0 }} onClick={() => window.open(_.log_file)}>{strLocals}</Button>
                }
                // return <PermissionTootip><Button type="link" style={{ padding: 0 }} disabled={true}>日志</Button></PermissionTootip>
                return <Button size="small" type="link" style={{ padding: 0 }} disabled={true}>{strLocals}</Button>
            }
        }, {
            title: <FormattedMessage id="Table.columns.operation"/>,
            width: 80,
            ellipsis: {
                showTitle: false
            },
            render: (_: any) => (
                <Access accessible={access.WsTourist()}>
                    <Access 
                        accessible={access.WsMemberOperateSelf(_.creator)} 
                        fallback={
                            <span>
                                { _.state === 'running' && <Button size="small" type="link" style={{ padding: 0 }} onClick={() => AccessTootip()} ><FormattedMessage id="ws.result.details.suspension"/></Button> }
                                { _.state === 'pending' && <Button size="small" type="link" style={{ padding: 0 }} onClick={() => AccessTootip()} ><FormattedMessage id="ws.result.details.skip"/></Button> }
                            </span>
                        }
                    >
                        { _.state === 'running' && <Button size="small" type="link" style={{ padding: 0 }} onClick={() => doConfServer(_, 'stop', pageParams)} ><FormattedMessage id="ws.result.details.suspension"/></Button> }
                        { _.state === 'pending' && <Button size="small" type="link" style={{ padding: 0 }} onClick={() => doConfServer(_, 'skip', pageParams)} ><FormattedMessage id="ws.result.details.skip"/></Button> }
                    </Access>
                </Access>
            )
        },
    ], [testType, locale, pageParams])

    const doConfServer = async (_: any, state: any, params:any) => {
        // 添加用户id
        const { user_id } = initialState?.authList
        const q = user_id ? { user_id } : {}
        const { code, msg } = await updateSuiteCaseOption({
            ...q,
            editor_obj: 'test_job_conf',
            test_job_conf_id: _.id,
            state
        })
        if (code === 200) {
            queryTestListTableData(params)
            message.success(formatMessage({id: 'operation.success'}))
        } else {
            requestCodeMessage(code, msg)
        }
    }

    return (
        <>
            <ResizeTable
                columns={columns}
                dataSource={dataSource}
                loading={loading}
                rowKey='id'
                size="small"
                pagination={false}
                scroll={{ x: 1350 }}
            />
            <CommonPagination
                style={{ marginTop: 8, marginBottom: 0 }}
                total={total}
                currentPage={pageParams.page_num}
                pageSize={pageParams.page_size}
                onPageChange={
                    (page_num, page_size) => {
                        setPageParams({ ...pageParams, page_num, page_size })
                    }
                }
            />
        </>
    )
}