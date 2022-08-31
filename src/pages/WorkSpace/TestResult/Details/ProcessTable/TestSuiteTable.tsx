import { Card, message, Table, Button } from 'antd'
import React, { useEffect, useMemo, useState } from 'react'
import { CaretRightFilled, CaretDownFilled } from '@ant-design/icons';
import PopoverEllipsis from '@/components/Public/PopoverEllipsis';
import TestConfTable from './TestConfTable'
import { evnPrepareState } from '../components'
import ConfPopoverTable from './ConfPopoverTable'
import _ from 'lodash';
import { updateSuiteCaseOption, queryProcessSuiteList } from '../service'
import { useRequest, useAccess, Access, useModel, useIntl, FormattedMessage } from 'umi';
import { requestCodeMessage, AccessTootip } from '@/utils/utils';
import ResizeTable from '@/components/ResizeTable'

export default ({ job_id, refresh = false, testType, provider_name }: any) => {
    const { formatMessage } = useIntl()
    const { initialState } = useModel('@@initialState');
    const access = useAccess()
    const [skipBtn, setSkipBtn] = useState<Boolean>(false)
    const [suiteId, setSuiteId] = useState<number>(0)
    const { data, loading, run } = useRequest(
        () => queryProcessSuiteList({ job_id }),
        {
            manual: true,
            initialData: []
        }
    )

    useEffect(() => {
        run()
    }, [refresh])

    let columns: any = [
        {
            dataIndex: 'test_suite_name',
            title: 'Test Suite',
            width: 160,
            ellipsis: {
                showTitle: false
            },
        }
    ];
    if (['business_business'].includes(testType)) {
        columns = columns.concat([{
            title: <FormattedMessage id="ws.result.details.business_name"/>,
            dataIndex: 'business_name',
            width: 160,
            ellipsis: {
                showTitle: false
            },
            render: (text: any) => <PopoverEllipsis title={text} />,
        }])
    }

    columns = columns.concat([
        {
            title: <FormattedMessage id="ws.result.details.env.preparation"/>,
            ellipsis: {
                showTitle: false
            },
            render: (_: any) => {
                const strLocals = formatMessage({id: 'ws.result.details.env.preparation.details'})
                return (
                    <ConfPopoverTable
                        {..._}
                        title={`${_.test_suite_name}${strLocals}`}
                    />
                )
            }
        },
        {
            dataIndex: 'state',
            title: <FormattedMessage id="ws.result.details.state"/>,
            render: (_: any) => evnPrepareState(_)
        },
        {
            dataIndex: 'start_time',
            title: <FormattedMessage id="ws.result.details.start_time"/>,
            ellipsis: {
                showTitle: false
            },
        },
        {
            dataIndex: 'end_time',
            title: <FormattedMessage id="ws.result.details.end_time"/>,
            ellipsis: {
                showTitle: false
            },
        }, {
            title: <FormattedMessage id="Table.columns.operation"/>,
            ellipsis: {
                showTitle: false
            },
            render: (_: any) => {
                const state = _.state
                const style = {
                    color: state !== 'running' ? 'rgba(0,0,0,.25)' : '#1890FF',
                    cursor: state !== 'running' ? 'not-allowed' : 'pointer',
                }
                const pointerStyle = { color: '#1890FF', cursor: 'pointer', marginLeft: 12 };
                const disablePointer = { color: 'rgba(0,0,0,.25)', marginLeft: 12 };
                const stopLocals = formatMessage({id: 'ws.result.details.stop.suite'})
                const skipLocals = formatMessage({id: 'ws.result.details.skip.suite'})

                if (state === 'running')
                    return (
                        <>
                            <Access accessible={access.WsTourist()}>
                                <Access
                                    accessible={access.WsMemberOperateSelf(_.creator)}
                                    fallback={
                                        <span>
                                            <span style={style} onClick={() => AccessTootip()}>{stopLocals}</span>
                                            {
                                                skipBtn && suiteId === _.id
                                                    ? <span style={disablePointer} >{skipLocals}</span>
                                                    : <span style={pointerStyle} onClick={() => AccessTootip()}>{skipLocals}</span>
                                            }
                                        </span>
                                    }
                                >
                                    <span style={style} onClick={() => handleStopSuite(_)}>{stopLocals}</span>
                                    {
                                        skipBtn && suiteId === _.id
                                            ? <span style={disablePointer} >{skipLocals}</span>
                                            : <span style={pointerStyle} onClick={() => handleSkipSuite(_)}>{skipLocals}</span>
                                    }
                                </Access>
                            </Access>
                        </>
                    )
                else if (state === 'pending')
                    return (
                        <div>
                            <span style={style}>{stopLocals}</span>
                            <Access accessible={access.WsTourist()}>
                                <Access
                                    accessible={access.WsMemberOperateSelf(_.creator)}
                                    fallback={
                                        skipBtn && suiteId === _.id
                                            ? <span style={disablePointer} >{skipLocals}</span>
                                            : <span style={pointerStyle} onClick={() => AccessTootip()}>{skipLocals}</span>
                                    }
                                >
                                    {
                                        skipBtn && suiteId === _.id
                                            ? <span style={disablePointer} >{skipLocals}</span>
                                            : <span style={pointerStyle} onClick={() => handleSkipSuite(_)}>{skipLocals}</span>
                                    }
                                </Access>
                            </Access>
                        </div>
                    )
                else
                    return <span style={style}>{stopLocals}</span>
            }
        }
    ]);

    const handleStopSuite = async (_: any) => {
        // 添加用户id
        const { user_id } = initialState?.authList
        const q = user_id ? { user_id } : {}

        const { code, msg } = await updateSuiteCaseOption({
            ...q,
            editor_obj: 'test_job_suite',
            test_job_suite_id: _.id,
            state: 'stop'
        })
        if (code !== 200) {
            requestCodeMessage(code, msg)
            return
        }
        run()
        message.success(formatMessage({id: 'operation.success'}) )
    }

    const [expandedKeys, setExpandedKeys] = useState<any>([])

    const handleSkipSuite = async (_: any) => {
        // 添加用户id
        const { user_id } = initialState?.authList
        const q = user_id ? { user_id } : {}
        const { code, msg } = await updateSuiteCaseOption({
            ...q,
            editor_obj: 'test_job_suite',
            state: 'skip',
            test_job_suite_id: _.id,
        })
        if (code === 200) {
            setSuiteId(_.id)
            setSkipBtn(true)
            message.success(formatMessage({id: 'operation.success'}) )
            run()
        } else {
            setSkipBtn(false)
            requestCodeMessage(code, msg)
            return
        }
    }

    return (
        <Card
            title={<FormattedMessage id="ws.result.details.test.case"/>}
            bodyStyle={{ paddingTop: 0 }}
            headStyle={{ borderBottom: 'none' }}
            style={{ marginBottom: 10, borderTop: 'none' }}
            extra={
                expandedKeys.length === data.length ?
                    <Button onClick={() => setExpandedKeys([])}><FormattedMessage id="ws.result.details.put.away.all"/></Button> :
                    <Button onClick={() => setExpandedKeys(data.map((item: any) => item.id))}><FormattedMessage id="ws.result.details.expanded.all"/></Button>
            }
        >
            <ResizeTable
                dataSource={data}
                columns={columns}
                rowKey="id"
                loading={loading}
                size="small"
                pagination={false}
                expandable={{
                    expandedRowKeys: expandedKeys,
                    onExpand: (expanded: any, record) => {
                        return !expanded ?
                            setExpandedKeys(expandedKeys.filter((i: any) => i !== record.id)) :
                            setExpandedKeys(expandedKeys.concat(record.id))
                    },
                    expandedRowRender: (record) => {
                        return (
                            <TestConfTable {...record} job_id={job_id} testType={testType} provider_name={provider_name} />
                        )
                    },
                    expandIcon: ({ expanded, onExpand, record }: any) => (
                        expanded ?
                            (<CaretDownFilled onClick={e => onExpand(record, e)} />) :
                            (<CaretRightFilled onClick={e => onExpand(record, e)} />)
                    )
                }}
            />
        </Card>
    )
}