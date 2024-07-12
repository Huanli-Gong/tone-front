import React, { useState, useImperativeHandle, forwardRef, useRef, useEffect } from 'react';
import { Tooltip, Col, Space, Typography, Table, message, Popconfirm } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { queryFunctionalBaseline, deletefuncsDetail } from '../services'
import { AccessTootip, requestCodeMessage } from '@/utils/utils';
import { useParams, useIntl, useAccess, Access } from 'umi';
import CommonPagination from '@/components/CommonPagination';
import { DrawerCls, DrawerLayout, InfoRow, TableRow } from "./styled"
import EditCaseInfo from './EditCaseInfo';
import { ColumnEllipsisText } from '@/components/ColumnComponents';

type IProps = Record<string, any>
type IRefs = IProps

const FailCaseDrawer: React.ForwardRefRenderFunction<IProps, IRefs> = (props, ref) => {
    const { test_type, baseline_id, test_suite_id, test_suite_name } = props
    const { formatMessage } = useIntl()
    const { ws_id }: any = useParams()
    const access = useAccess();
    const PAGE_DEFAULT_PARAMS = {
        test_type,
        baseline_id,
        test_suite_id,
        page_num: 1,
        page_size: 20
    }  // 有用
    const [visible, setVisible] = useState(false) // 控制弹框的显示与隐藏
    const [source, setSource] = useState<any>()
    const [listParams, setListParams] = useState<any>(PAGE_DEFAULT_PARAMS)
    const [loading, setLoading] = useState(false)
    const editInfo: any = useRef(null)

    const getLastDetail = async (params: any = listParams) => {
        if (params && params.test_case_id === undefined) return
        setLoading(true)
        const { code, msg, ...rest } = await queryFunctionalBaseline(params)
        setLoading(false)
        if (code !== 200)
            return requestCodeMessage(code, msg)

        setSource(rest)
    }

    useEffect(() => {
        getLastDetail()
    }, [listParams])

    const onClose = () => {
        setVisible(false);
        setListParams(PAGE_DEFAULT_PARAMS)
        setSource({})
    };

    useImperativeHandle(
        ref,
        () => ({
            show: (data: any = {}) => {
                setVisible(true)
                setListParams((p: any) => ({ ...p, ...data }))
            }
        })
    )

    const handleSubmit = async () => {
        message.success(formatMessage({ id: 'operation.success' }))
        getLastDetail()
    }

    const handleDelete = async (record: any) => {
        const { code, msg } = await deletefuncsDetail({ id: record.id, ws_id });
        defaultOption(code, msg);
    }

    const columns = [
        {
            dataIndex: 'sub_case_name',
            title: 'Case',
            key: 'sub_case_name',
            render: (sub_case_name: any) => (
                <Typography.Text ellipsis={{ tooltip: true }}>
                    {sub_case_name || "-"}
                </Typography.Text>
            ),
            ellipsis: {
                showTitle: false
            },
            textWrap: 'word-break',
        },
        {
            dataIndex: 'bug',
            title: formatMessage({ id: `pages.workspace.baseline.failDetail.table.bug` }),
            key: 'bug',
            ellipsis: {
                showTitle: false
            },
            textWrap: 'word-break',
            render: (text: any) => {
                return (
                    <ColumnEllipsisText
                        ellipsis={{ tooltip: true }}
                    >
                        {text || "-"}
                    </ColumnEllipsisText>
                )
            }
        },
        {
            dataIndex: 'source_job_id',
            title: formatMessage({ id: `pages.workspace.baseline.failDetail.table.source_job_id` }),
            key: 'source_job_id',
            ellipsis: {
                showTitle: false
            },
            textWrap: 'word-break',
            render: (text: any, row: any) => {
                const urlHref = `/ws/${ws_id}/test_result/${text}`
                const { job_name } = row
                if (job_name)
                    return (
                        <Typography.Text ellipsis={{ tooltip: job_name }}>
                            <Typography.Link href={urlHref} target="_blank">
                                {job_name}
                            </Typography.Link>
                        </Typography.Text>
                    )

                return <Typography.Text>-</Typography.Text>
            }
        },
        {
            dataIndex: 'impact_result',
            title: formatMessage({ id: `pages.workspace.baseline.failDetail.table.impact_result` }),
            key: 'impact_result',
            render(_: any, row: any) {
                const { impact_result } = row
                return (
                    <Typography.Text ellipsis={{ tooltip: true }}>
                        {formatMessage({ id: `operation.${impact_result ? "yes" : "no"}` })}
                    </Typography.Text>
                )
            }
        },
        {
            dataIndex: 'sub_case_result',
            title: formatMessage({ id: `pages.workspace.baseline.failDetail.table.sub_case_result` }),
            ellipsis: {
                showTitle: false
            },
            textWrap: 'word-break',
            render: (text: any) => {
                let color = ''
                if (text === 'Fail') color = '#C84C5A'
                if (text === 'Pass') color = '#81BF84'
                if (text === 'Warning') color = '#dcc506'
                if (text === 'Stop') color = '#1D1D1D'
                return (
                    <Typography.Text ellipsis={{ tooltip: true }}>
                        <span style={{ color }}>{text || '-'}</span>   
                    </Typography.Text>
                )
            }
        },
        {
            dataIndex: 'description',
            title: formatMessage({ id: `pages.workspace.baseline.failDetail.table.description` }),
            key: 'description',
            ellipsis: {
                showTitle: false
            },
            textWrap: 'word-break',
            render: (text: any) => {
                return (
                    <Typography.Text ellipsis={{ tooltip: true }}>
                        {text || "-"}
                    </Typography.Text>
                )
            }
        },
        {
            title: formatMessage({ id: `pages.workspace.baseline.failDetail.table.action` }),
            key: 'sub_case_name',
            render: (text: any, record: any) => {
                return (
                    <Access
                        accessible={access.WsMemberOperateSelf(record.creator)}
                        fallback={
                            <Space>
                                {
                                    ["edit", "delete"].map((i: string) => (
                                        <Typography.Link onClick={AccessTootip} key={i}>
                                            {formatMessage({ id: `operation.${i}` })}
                                        </Typography.Link>
                                    ))
                                }
                            </Space>
                        }
                    >
                        <Space size='small'>
                            <Typography.Link onClick={() => editInfo.current.show(record)}>
                                {formatMessage({ id: `operation.edit` })}
                            </Typography.Link>
                            {/* 删除的弹框 */}
                            <Popconfirm
                                title={formatMessage({ id: "delete.prompt" })}
                                onConfirm={() => handleDelete(record)}
                                okText={formatMessage({ id: "operation.confirm" })}
                                cancelText={formatMessage({ id: "operation.cancel" })}
                                icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
                            >
                                <Typography.Link >
                                    {formatMessage({ id: `operation.delete` })}
                                </Typography.Link>
                            </Popconfirm>
                        </Space>
                    </Access>
                )
            }
        }
    ]

    const defaultOption = (code: number, msg: string) => {
        if (code !== 200) {
            requestCodeMessage(code, msg)
            return
        }
        message.success(formatMessage({ id: 'operation.success' }))
        const { total, page_size, page_num } = source
        const totalPage = Math.ceil((total - 1) / page_size)
        const currentPage = page_num > totalPage ? totalPage : page_num
        setListParams((p: any) => ({ ...p, page_num: currentPage < 1 ? 1 : currentPage }))
    }

    return (
        <>
            <DrawerCls
                maskClosable={false}
                keyboard={false}
                title={
                    formatMessage({ id: 'pages.workspace.baseline.failDetail' })
                }
                placement="right"
                closable={true}
                onClose={onClose}
                open={visible}
                width={860}
            >
                <DrawerLayout >
                    <InfoRow>
                        <Col span={24}>
                            <Space>
                                <Typography.Text strong={true}>Test Suite</Typography.Text>
                                <Typography.Text>{test_suite_name || "-"}</Typography.Text>
                            </Space>
                        </Col>
                        <Col span={24}>
                            <Space>
                                <Typography.Text strong={true}>Test Conf</Typography.Text>
                                <Typography.Text >{listParams?.test_case_name || "-"}</Typography.Text>
                            </Space>
                        </Col>
                    </InfoRow>
                    <TableRow style={{ paddingTop: 20 }}>
                        <Table
                            columns={columns}
                            loading={loading}
                            dataSource={source?.data || []}
                            pagination={false}
                            size="small"
                        />
                        <CommonPagination
                            pageSize={source?.page_size}
                            total={source?.total}
                            currentPage={source?.page_num}
                            onPageChange={
                                (page_num, page_size) => { setListParams((p: any) => ({ ...p, page_num, page_size })) }
                            }
                        />
                    </TableRow>
                </DrawerLayout>
            </DrawerCls>
            <EditCaseInfo
                ref={editInfo}
                onOk={handleSubmit}
            />
        </>
    );
}

export default forwardRef(FailCaseDrawer)