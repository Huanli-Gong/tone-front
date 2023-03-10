import React, { useImperativeHandle, forwardRef, useEffect } from 'react';
import { Col, Space, Typography, Table, Popconfirm, Tooltip, } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { queryPerformanceBaseline, deletePerfsDetail } from '../services'
import _ from 'lodash'
import { AccessTootip, requestCodeMessage } from '@/utils/utils';
import { useParams, useIntl, useAccess, Access, FormattedMessage } from 'umi';
import CommonPagination from '@/components/CommonPagination';
import { DrawerCls, DrawerLayout, InfoRow, TableRow } from './styled';
import IntroRow from './IntrRow';
import { BaselineTooltipContent, toFixed } from './BaselineTooltipContent';

const MetricInfo: React.ForwardRefRenderFunction<any, any> = (props, ref) => {
    const { ws_id }: any = useParams()
    const { baseline_id, test_suite_id, test_suite_name, test_type } = props;

    const access = useAccess();
    const { formatMessage } = useIntl()
    const PAGE_DEFAULT_PARAMS: any = {
        test_type,
        test_suite_id,
        baseline_id,
        page_num: 1,
        page_size: 10
    }  // 有用
    const [params, setParams] = React.useState<any>(PAGE_DEFAULT_PARAMS)
    const [visible, setVisible] = React.useState(false) // 控制弹框的显示与隐藏
    const [list, setList] = React.useState<any>()
    const [loading, setLoading] = React.useState(false)
    const [expandedRowKeys, setExpandedRowKeys] = React.useState<React.Key[]>([])

    const getLastDetail = async () => {
        setLoading(true)
        if (params && params.test_case_id === undefined) return
        const { code, msg, ...rest } = await queryPerformanceBaseline(params)
        setLoading(false)
        if (code !== 200) {
            requestCodeMessage(code, msg)
            return
        }
        setList(rest)
    }

    useEffect(() => {
        getLastDetail()
    }, [params])

    const onClose = () => {
        setVisible(false);
    };

    useImperativeHandle(
        ref,
        () => ({
            show: (data: any = {}) => {
                setVisible(true)
                const { test_case_id, test_job_id, test_case_name, server_sn } = data
                setParams((p: any) => ({ ...p, test_case_id, test_job_id, test_case_name, server_sn }))
            }
        })
    )

    const handleDelete = async (current: any) => {
        const { code } = await deletePerfsDetail({ id: current.id, ws_id });
        if (code !== 200) return
        const { page_size, page_num } = params
        const { total } = list
        const remainNum = total % page_size === 1
        const totalPage: number = Math.floor(total / page_size)
        if (remainNum && totalPage && totalPage + 1 <= page_num)
            setParams((p: any) => ({ ...p, page_num: totalPage }))
        else
            getLastDetail()
    }

    const columns = [
        {
            dataIndex: 'metric',
            title: 'Metric',
            key: 'metric',
            width: 140,
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
            dataIndex: 'baseline_data',
            title: <FormattedMessage id={'pages.workspace.baseline.metricDetail.table.baseline_data'} />, // '基线值',
            key: 'baseline_data',
            render: (text: any, row: any) => {
                const { test_value, cv_value, max_value, min_value } = row;

                const Avg = toFixed(test_value);
                const CV = cv_value;
                const Max = toFixed(max_value);
                const Min = toFixed(min_value);
                const obj = {
                    Max,
                    Min,
                    Avg,
                    CV,
                }

                const baseline_data = `${Avg}${CV}`
                return (
                    <Tooltip
                        color="#fff"
                        overlayInnerStyle={{ padding: 0 }}
                        title={
                            <BaselineTooltipContent
                                {...row}
                                baseline_value={obj}
                                baseline_data={baseline_data}
                            />
                        }
                    >
                        <Typography.Text ellipsis>
                            {baseline_data || "-"}
                        </Typography.Text>
                    </Tooltip>
                )
            }
        },
        {
            dataIndex: 'source_job_id',
            title: formatMessage({ id: `pages.workspace.baseline.failDetail.table.source_job_id` }),
            render: (text: any, row: any) => {
                const { source_job_id, job_name } = row
                if (!job_name) return "-"
                const href = `/ws/${ws_id}/test_result/${source_job_id}`
                return (
                    <Typography.Text ellipsis={{ tooltip: job_name }}>
                        <Typography.Link target={"_blank"} href={href}>
                            {job_name}
                        </Typography.Link>
                    </Typography.Text>
                )
            }
        },
        {
            title: <FormattedMessage id={'pages.workspace.baseline.metricDetail.table.action'} />, // '操作',
            key: 'id',
            render: (record: any) => {
                const viewInfo = formatMessage({
                    id: "pages.workspace.baseline.metric.table.view",
                    defaultMessage: "查看信息"
                })
                const expandInfo = formatMessage({
                    id: "pages.workspace.baseline.metric.table.expand",
                    defaultMessage: "收起信息"
                })
                return (
                    <Space>
                        <Typography.Link
                            onClick={() => {
                                setExpandedRowKeys(expandedRowKeys.includes(record.id) ? [] : [record.id])
                            }}
                            style={{ userSelect: "none" }}
                        >
                            {
                                expandedRowKeys.includes(record.id) ?
                                    expandInfo :
                                    viewInfo
                            }
                        </Typography.Link>
                        <Access
                            accessible={access.WsMemberOperateSelf(record.creator)}
                            fallback={
                                <Typography.Link onClick={() => AccessTootip()}>
                                    <FormattedMessage id="operation.delete" />
                                </Typography.Link>
                            }
                        >
                            <Space size='small'>
                                {/* 删除的弹框 */}
                                <Popconfirm
                                    title={<FormattedMessage id="delete.prompt" />}
                                    onConfirm={() => {
                                        handleDelete(record)
                                    }}
                                    okText={<FormattedMessage id="operation.confirm" />}
                                    cancelText={<FormattedMessage id="operation.cancel" />}
                                    icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
                                >
                                    <Typography.Link>
                                        <FormattedMessage id="operation.delete" />
                                    </Typography.Link>
                                </Popconfirm>
                            </Space>
                        </Access>
                    </Space>
                )
            }
        }
    ]

    return (
        <DrawerCls
            maskClosable={false}
            keyboard={false}
            title={
                formatMessage({ id: 'pages.workspace.baseline.mertricDetail' })
            }
            placement="right"
            closable={true}
            onClose={onClose}
            open={visible}
            width={700}
        >
            <DrawerLayout>
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
                            <Typography.Text>{params?.test_case_name || "-"}</Typography.Text>
                        </Space>
                    </Col>
                </InfoRow>
                <TableRow style={{ paddingTop: 20 }}>
                    <Table
                        columns={columns}
                        loading={loading}
                        dataSource={list?.data}
                        pagination={false}
                        rowKey="id"
                        size="small"
                        expandable={{
                            expandedRowRender(record) {
                                return <IntroRow {...record} />
                            },
                            expandedRowKeys: expandedRowKeys,
                            expandIcon: () => undefined,
                            columnWidth: 0
                        }}
                    />
                    <CommonPagination
                        pageSize={params.page_size}
                        total={list?.total || 0}
                        currentPage={list?.page_num}
                        onPageChange={
                            (page_num, page_size) => setParams((p: any) => ({ ...p, page_num, page_size }))
                        }
                    />
                </TableRow>
            </DrawerLayout>
        </DrawerCls >
    );
}

export default forwardRef(MetricInfo)