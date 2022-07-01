import { Card, message, Table, Button } from 'antd'
import React, { useEffect, useMemo, useState } from 'react'
import { CaretRightFilled, CaretDownFilled } from '@ant-design/icons';
import PopoverEllipsis from '@/components/Public/PopoverEllipsis';
import TestConfTable from './TestConfTable'
import { evnPrepareState } from '../components'
import ConfPopoverTable from './ConfPopoverTable'
import _ from 'lodash';
import { updateSuiteCaseOption, queryProcessSuiteList } from '../service'
import { useRequest, useAccess, Access, useModel } from 'umi';
import { requestCodeMessage, AccessTootip } from '@/utils/utils';
import ResizeTable from '@/components/ResizeTable'
export default ({ job_id, refresh = false, testType, provider_name }: any) => {
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
            ellipsis: {
                showTitle: false
            },
        }
    ];
    if (['business_business'].includes(testType)) {
        columns = columns.concat([{
            title: '业务名称',
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
            title: '环境准备',
            ellipsis: {
                showTitle: false
            },
            render: (_: any) => {
                return (
                    <ConfPopoverTable
                        {..._}
                        title={`${_.test_suite_name}环境准备详情`}
                    />
                )
            }
        },
        {
            dataIndex: 'state',
            title: '状态',
            render: (_: any) => evnPrepareState(_)
        },
        {
            dataIndex: 'start_time',
            title: '开始时间',
            ellipsis: {
                showTitle: false
            },
        },
        {
            dataIndex: 'end_time',
            title: '结束时间',
            ellipsis: {
                showTitle: false
            },
        }, {
            title: '操作',
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

                if (state === 'running')
                    return (
                        <>
                            <Access accessible={access.WsTourist()}>
                                <Access
                                    accessible={access.WsMemberOperateSelf(_.creator)}
                                    fallback={
                                        <span>
                                            <span style={style} onClick={() => AccessTootip()}>停止Suite</span>
                                            {
                                                skipBtn && suiteId === _.id
                                                    ? <span style={disablePointer} >跳过suite</span>
                                                    : <span style={pointerStyle} onClick={() => AccessTootip()}>跳过suite</span>
                                            }
                                        </span>
                                    }
                                >
                                    <span style={style} onClick={() => handleStopSuite(_)}>停止Suite</span>
                                    {
                                        skipBtn && suiteId === _.id
                                            ? <span style={disablePointer} >跳过suite</span>
                                            : <span style={pointerStyle} onClick={() => handleSkipSuite(_)}>跳过suite</span>
                                    }
                                </Access>
                            </Access>
                        </>
                    )
                else if (state === 'pending')
                    return (
                        <div>
                            <span style={style}>停止Suite</span>
                            <Access accessible={access.WsTourist()}>
                                <Access
                                    accessible={access.WsMemberOperateSelf(_.creator)}
                                    fallback={
                                        skipBtn && suiteId === _.id
                                            ? <span style={disablePointer} >跳过suite</span>
                                            : <span style={pointerStyle} onClick={() => AccessTootip()}>跳过suite</span>
                                    }
                                >
                                    {
                                        skipBtn && suiteId === _.id
                                            ? <span style={disablePointer} >跳过suite</span>
                                            : <span style={pointerStyle} onClick={() => handleSkipSuite(_)}>跳过suite</span>
                                    }
                                </Access>
                            </Access>
                        </div>
                    )
                else
                    return <span style={style}>停止Suite</span>
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
        message.success('操作成功')
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
            message.success('操作成功')
            run()
        } else {
            setSkipBtn(false)
            requestCodeMessage(code, msg)
            return
        }
    }

    return (
        <Card
            title="测试用例"
            bodyStyle={{ paddingTop: 0 }}
            headStyle={{ borderBottom: 'none' }}
            style={{ marginBottom: 10, borderTop: 'none' }}
            extra={
                expandedKeys.length === data.length ?
                    <Button onClick={() => setExpandedKeys([])}>全部收起</Button> :
                    <Button onClick={() => setExpandedKeys(data.map((item: any) => item.id))}>全部展开</Button>
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