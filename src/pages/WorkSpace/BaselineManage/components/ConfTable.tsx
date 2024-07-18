import { Table, Layout, Spin, Row, Typography, Space, Popconfirm, message } from 'antd'
import React, { useRef } from 'react'
import { useParams, useLocation, useIntl, useAccess, Access } from 'umi'
import { QuestionCircleOutlined } from '@ant-design/icons';
import { queryFunctionalBaseline, queryPerformanceBaseline } from '@/pages/WorkSpace/BaselineManage/services'
import _ from 'lodash'
import treeSvg from '@/assets/svg/tree.svg'

import FailCase from './FailCase'
import MetricList from "./Metric"
import { deletefuncsDetail } from '../services'
import { ColumnEllipsisText } from '@/components/ColumnComponents'
import { AccessTootip } from '@/utils/utils';

// 性能三级
type Iprops = Record<string, any>

const ConfTable: React.FC<Iprops> = (props) => {
    const { formatMessage } = useIntl()
    const { test_type, baseline_id, test_suite_id, server_sn } = props
    const { query }: any = useLocation()
    const { ws_id }: any = useParams()

    const background = `url(${treeSvg}) center center / 38.6px 32px `  // 有用
    // 性能基线

    const [data, setData] = React.useState<[]>([])
    const [loading, setLoading] = React.useState(true)

    const failCase: any = useRef(null)
    const metric: any = React.useRef(null)
    const access = useAccess();

    const handleDelete = async (record: any) => {
        const { test_case_id } = record
        const { code, msg } = await deletefuncsDetail({ baseline_id, test_suite_id, test_case_id, ws_id });
        if (code === 200) {
            message.success(formatMessage({ id: 'operation.success' }))
            getThirdDetail()
        } else {
            message.error(msg || formatMessage({ id: 'request.delete.failed' }))
        }
    }

    const columns = [{
        dataIndex: 'test_case_name',
        title: 'Test Conf',
        width: '30%',
        key: 'test_case_name',
        render: (text: any, record: any) => {
            return (
                <span onClick={()=> openDrawer(record)}>
                    <Typography.Link ellipsis>
                        {text}
                    </Typography.Link>
                </span>
            )
        },
    },
    {
        dataIndex: 'desc',
        title: '说明',
        ellipsis: {
            showTitle: false,
        },
        render: (row: any) => (
            <ColumnEllipsisText ellipsis={{ tooltip: true }}>
                {row}
            </ColumnEllipsisText>
        )
    },
    {
        title: formatMessage({ id: `pages.workspace.baseline.failDetail.table.action` }),
        dataIndex: 'option',
        width: 120,
        fixed: 'right',
        render: (text: any, record: any) => {
            return (
                <Access
                    accessible={access.WsMemberOperateSelf(record.creator)}
                    fallback={
                        <Space>
                            <Typography.Link onClick={AccessTootip}>
                               {formatMessage({ id: `operation.delete` })}
                            </Typography.Link>
                        </Space>
                    }
                >
                    <Space size='small'>
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

    const openDrawer = (record: any) => {
        if (test_type === 'functional') {
            failCase.current?.show(record)
            return
        }
        metric.current?.show(record)
    }

    const getThirdDetail = async () => {
        setLoading(true)
        const params = { test_type, baseline_id, test_suite_id, server_sn }
        const { data, code } = test_type === "performance" ?
            await queryPerformanceBaseline(params) :
            await queryFunctionalBaseline(params)
        setLoading(false)

        if (code !== 200) return
        setData(data || [])
    }

    React.useEffect(() => {
        if (data && query?.test_case_id) {
            const idx = data.findIndex((p: any) => p.test_case_id === + query?.test_case_id)
            if (~idx)
                openDrawer(data?.[idx])
        }
    }, [query, data])

    React.useEffect(() => {
        if (!baseline_id) return
        getThirdDetail()
    }, [baseline_id])

    return (
        <Layout.Content>
            <Spin spinning={loading}>
                <Row justify="start">
                    {
                        !loading &&
                        <div style={{ width: 32 }}>
                            <div style={{ height: 30, width: 32, background }} />
                            <div style={{ width: 32, background, height: "calc(100% - 30px)" }} />
                        </div>
                    }
                    <div style={{ width: "calc(100% - 32px)" }}>
                        <Table
                            columns={columns}
                            dataSource={data} //  youyong
                            rowKey={'test_case_id'}
                            pagination={false}
                            size="small"
                            // onRow={(record: any) => {
                            //     return {
                            //         onClick: () => {
                            //             openDrawer(record)
                            //         }, // 点击行
                            //     };
                            // }}
                        />
                    </div>
                </Row>
                <FailCase
                    ref={failCase}
                    {...props}
                />
                <MetricList
                    ref={metric}
                    {...props}
                />
            </Spin>
        </Layout.Content>
    )
}

export default ConfTable

