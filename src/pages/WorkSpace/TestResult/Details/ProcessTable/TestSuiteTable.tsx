import { Card, message, Button } from 'antd'
import React, { useEffect, useState } from 'react'
import { CaretRightFilled, CaretDownFilled } from '@ant-design/icons';
import PopoverEllipsis from '@/components/Public/PopoverEllipsis';
import TestConfTable from './TestConfTable'
import { evnPrepareState } from '../components'
import ConfPopoverTable from './ConfPopoverTable'
import _ from 'lodash';
import { updateSuiteCaseOption, queryProcessSuiteList } from '../service'
import { useRequest, useAccess, Access, useModel, useIntl, FormattedMessage, useParams } from 'umi';
import { requestCodeMessage, AccessTootip } from '@/utils/utils';
import ResizeTable from '@/components/ResizeTable'

const pointerStyle = { color: '#1890FF', cursor: 'pointer', marginLeft: 12 };
const disablePointer = { color: 'rgba(0,0,0,.25)', marginLeft: 12 };

const TestSuiteTable: React.FC<Record<string, any>> = (props) => {
    const { refresh = false, testType, provider_name } = props

    const { id: job_id } = useParams() as any
    const { formatMessage } = useIntl()
    const { initialState } = useModel('@@initialState');
    const access = useAccess()
    const [skipBtn, setSkipBtn] = useState<Boolean>(false)
    const [suiteId, setSuiteId] = useState<number>(0)

    const stopLocals = formatMessage({ id: 'ws.result.details.stop.suite' })
    const skipLocals = formatMessage({ id: 'ws.result.details.skip.suite' })

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

    const [columns, setColumns] = React.useState([
        {
            dataIndex: 'test_suite_name',
            title: 'Test Suite',
            width: 160,
            ellipsis: {
                showTitle: false
            },
        },
        ['business_business'].includes(testType) &&
        {
            title: <FormattedMessage id="ws.result.details.business_name" />,
            dataIndex: 'business_name',
            width: 160,
            ellipsis: {
                showTitle: false
            },
            render: (text: any) => <PopoverEllipsis title={text} />,
        },
        {
            title: <FormattedMessage id="ws.result.details.env.preparation" />,
            ellipsis: {
                showTitle: false
            },
            render: (_: any) => {
                const strLocals = formatMessage({ id: 'ws.result.details.env.preparation.details' })
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
            title: <FormattedMessage id="ws.result.details.state" />,
            render: (_: any) => evnPrepareState(_)
        },
        {
            dataIndex: 'start_time',
            title: <FormattedMessage id="ws.result.details.start_time" />,
            ellipsis: {
                showTitle: false
            },
            render: (_: any) => <>{_ || '-'}</>,
        },
        {
            dataIndex: 'end_time',
            title: <FormattedMessage id="ws.result.details.end_time" />,
            ellipsis: {
                showTitle: false
            },
            render: (_: any) => <>{_ || '-'}</>,
        },
        {
            title: <FormattedMessage id="Table.columns.operation" />,
            render: (_: any) => {
                const state = _.state

                const style = {
                    color: state !== 'running' ? 'rgba(0,0,0,.25)' : '#1890FF',
                    cursor: state !== 'running' ? 'not-allowed' : 'pointer',
                }

                const isSkip = skipBtn && suiteId === _.id

                if (state === 'running')
                    return (
                        <Access accessible={access.WsTourist()}>
                            <Access
                                accessible={access.WsMemberOperateSelf(_.creator)}
                                fallback={
                                    <span>
                                        <span style={style} onClick={() => AccessTootip()}>{stopLocals}</span>
                                        {
                                            isSkip
                                                ? <span style={disablePointer} >{skipLocals}</span>
                                                : <span style={pointerStyle} onClick={() => AccessTootip()}>{skipLocals}</span>
                                        }
                                    </span>
                                }
                            >
                                <span style={style} onClick={() => handleStopSuite(_)}>{stopLocals}</span>
                                {
                                    isSkip
                                        ? <span style={disablePointer} >{skipLocals}</span>
                                        : <span style={pointerStyle} onClick={() => handleSkipSuite(_)}>{skipLocals}</span>
                                }
                            </Access>
                        </Access>
                    )
                if (state === 'pending')
                    return (
                        <>
                            <span style={style}>{stopLocals}</span>
                            <Access accessible={access.WsTourist()}>
                                <Access
                                    accessible={access.WsMemberOperateSelf(_.creator)}
                                    fallback={
                                        isSkip
                                            ? <span style={disablePointer} >{skipLocals}</span>
                                            : <span style={pointerStyle} onClick={() => AccessTootip()}>{skipLocals}</span>
                                    }
                                >
                                    {
                                        isSkip
                                            ? <span style={disablePointer} >{skipLocals}</span>
                                            : <span style={pointerStyle} onClick={() => handleSkipSuite(_)}>{skipLocals}</span>
                                    }
                                </Access>
                            </Access>
                        </>
                    )
                return <span style={style}>{stopLocals}</span>
            }
        }
    ])

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
        message.success(formatMessage({ id: 'operation.success' }))
    }

    const [expandedKeys, setExpandedKeys] = useState<any>([])

    const handleSkipSuite = async (_: any) => {
        // 添加用户id
        const { user_id } = initialState?.authList

        const { code, msg } = await updateSuiteCaseOption({
            editor_obj: 'test_job_suite',
            state: 'skip',
            test_job_suite_id: _.id,
            user_id
        })
        if (code === 200) {
            setSuiteId(_.id)
            setSkipBtn(true)
            message.success(formatMessage({ id: 'operation.success' }))
            run()
        } else {
            setSkipBtn(false)
            requestCodeMessage(code, msg)
            return
        }
    }

    return (
        <Card
            title={<FormattedMessage id="ws.result.details.test.case" />}
            bodyStyle={{ paddingTop: 0 }}
            headStyle={{ borderBottom: 'none' }}
            style={{ marginBottom: 10, borderTop: 'none' }}
            extra={
                expandedKeys.length === data.length ?
                    <Button onClick={() => setExpandedKeys([])}>
                        <FormattedMessage id="ws.result.details.put.away.all" />
                    </Button> :
                    <Button onClick={() => setExpandedKeys(data.map((item: any) => item.id))}>
                        <FormattedMessage id="ws.result.details.expanded.all" />
                    </Button>
            }
        >
            <ResizeTable
                dataSource={data}
                columns={columns}
                setColumns={setColumns}
                rowKey="id"
                loading={loading}
                size="small"
                pagination={false}
                expandable={{
                    indentSize: 60,
                    expandedRowKeys: expandedKeys,
                    onExpand: (expanded: any, record) => {
                        setExpandedKeys(!expanded ? expandedKeys.filter((i: any) => i !== record.id) : expandedKeys.concat(record.id))
                    },
                    expandedRowRender: (record) => {
                        return (
                            <TestConfTable
                                {...record}
                                testType={testType}
                                provider_name={provider_name}
                            />
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

export default TestSuiteTable