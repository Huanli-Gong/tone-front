import { Layout, Row, Spin, Table, Tooltip, Typography } from 'antd'
import React, { useState, useEffect, useMemo } from 'react'
import styles from './index.less'
import { CaretRightFilled, CaretDownFilled } from '@ant-design/icons'
import { useLocation, useParams, useIntl, FormattedMessage } from 'umi'
import { queryBaselineDetail } from '../services'
import ExpandTable from './ExpandTable'
import { partial } from 'lodash'
import treeSvg from '@/assets/svg/tree.svg'

// 二级详情
export default (props: any) => {
    const { query }: any = useLocation()
    const { ws_id }: any = useParams()
    const background = `url(${treeSvg}) center center / 38.6px 32px `
    const { server_provider = 'aligroup', test_type, id = '' } = props.currentBaseline

    const hasQuery = useMemo(() => JSON.stringify(query) !== '{}', [query])

    const PAGE_DEFAULT_PARAMS = { server_provider, test_type, baseline_id: id, test_suite_id: props.test_suite_id }
    const isGroup = server_provider === 'aligroup';

    const [expandKey, setExpandKey] = useState<string[]>(hasQuery && query.server_sn ? [query.server_sn] : [])
    const [data, setData] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const getTwoDetail = async (params: any) => {
        let { data, code } = await queryBaselineDetail(params)
        if (code === 200) setData(data)
        setLoading(false)
    }

    useEffect(() => {
        if (!hasQuery) setExpandKey([])

        getTwoDetail(PAGE_DEFAULT_PARAMS)
    }, [props.test_suite_id, server_provider, test_type, id, props.searchName])


    const twoLevelPersData = data && Array.isArray(data) ? data : [];

    const onExpand = async (record: any) => {
        setExpandKey([record.server_sn + '']);
    }

    const fn = (job_id: any) => {
        let job_name = ''
        twoLevelPersData.forEach((item: any) => {
            if (item.source_job_id === job_id) job_name = item.job_name
        })
        return job_name
    }

    const columnsGroup = [
        {
            dataIndex: 'server_sn',
            title: 'SN',
            key: 'server_sn',
            ellipsis: {
                showTitle: false
            },
            textWrap: 'word-break',
            render: (text: any) => (
                <Tooltip title={text} overlayStyle={{ wordBreak: 'break-all' }} placement="topLeft">
                    <span className={styles.sub_case_name}>
                        {text}
                    </span>
                </Tooltip>
            ),
        },
        {
            dataIndex: 'server_ip',
            title: 'IP',
            key: 'server_ip',
        },
        {
            dataIndex: 'server_sm_name',
            title: <FormattedMessage id="pages.workspace.baseline.expandPerf.server_sm_name" />,
            key: 'server_sm_name',
        },
        {
            dataIndex: 'run_mode',
            title: 'RunMode',
            key: 'run_mode',
        },
        {
            dataIndex: 'source_job_id',
            title: <FormattedMessage id="pages.workspace.baseline.expandPerf.source_job_id" />,
            key: 'source_job_id',
            ellipsis: {
                showTitle: false
            },
            textWrap: 'word-break',
            render: (text: any) => {
                return (
                    <Tooltip placement="top" title={fn(text)} overlayStyle={{ wordBreak: 'break-all' }}>
                        <Typography.Link className={styles.hrefUrl} target="__blank" href={`/ws/${ws_id}/test_result/${text}`}>
                            {fn(text)}
                        </Typography.Link>
                    </Tooltip>
                )
            }
        },
    ]
    const columnsCluster = [
        {
            dataIndex: 'server_instance_type',
            title: <FormattedMessage id="pages.workspace.baseline.expandPerf.server_instance_type" />,
            ellipsis: {
                showTitle: false,
            },
            render: (_) => <Tooltip title={_} placement="topLeft">{_ || "-"}</Tooltip>,
            key: 'server_instance_type',
        },
        {
            dataIndex: 'server_image',
            title: 'Image',
            ellipsis: {
                showTitle: false,
            },
            render: (_) => <Tooltip title={_} placement="topLeft">{_ || "-"}</Tooltip>,
            key: 'server_image',
        },
        {
            dataIndex: 'server_bandwidth',
            title: 'Bandwidth',
            ellipsis: {
                showTitle: false,
            },
            render: (_) => <Tooltip title={_} placement="topLeft">{_ || "-"}</Tooltip>,
            key: 'server_bandwidth',
        },
        {
            dataIndex: 'server_sn',
            title: 'SN',
            ellipsis: {
                showTitle: false,
            },
            render: (_) => <Tooltip title={_} placement="topLeft">{_ || "-"}</Tooltip>,
            key: 'server_sn',
        },
        {
            dataIndex: 'server_ip',
            title: 'IP',
            ellipsis: {
                showTitle: false,
            },
            render: (_) => <Tooltip title={_} placement="topLeft">{_ || "-"}</Tooltip>,
            key: 'server_ip',
        },
        {
            dataIndex: 'run_mode',
            title: 'RunMode',
            ellipsis: {
                showTitle: false,
            },
            render: (_) => <Tooltip title={_} placement="topLeft">{_ || "-"}</Tooltip>,
            key: 'run_mode',
        },
        {
            dataIndex: 'source_job_id',
            title: <FormattedMessage id="pages.workspace.baseline.expandPerf.source_job_id" />,
            key: 'source_job_id',
            ellipsis: {
                showTitle: false
            },
            textWrap: 'word-break',
            render: (text: any) => {
                return (
                    <Tooltip placement="top" title={fn(text)} overlayStyle={{ wordBreak: 'break-all' }}>
                        <Typography.Link
                            className={styles.hrefUrl}
                            target="__blank"
                            href={`/ws/${ws_id}/test_result/${text}`}
                        >
                            {fn(text)}
                        </Typography.Link>
                    </Tooltip>
                )
            }
        },
    ]

    return (
        <Layout.Content>
            <Spin spinning={loading}>
                <Row justify="space-between">
                    {
                        !loading &&
                        <div style={{ width: 32, background }} />
                    }
                    <div className={styles.baseline_detail_children}>
                        <Table
                            dataSource={twoLevelPersData}
                            columns={isGroup ? columnsGroup : columnsCluster}
                            rowKey={record => record.server_sn + ''}
                            loading={loading}
                            pagination={false}
                            scroll={{ x: '100%' }}
                            size="small"
                            expandable={{
                                expandedRowRender: (record: any) => (
                                    <ExpandTable
                                        {...props}
                                        {...record}
                                        currentBaseline={props.currentBaseline}
                                        oneRefresh={props.oneRefresh}
                                        twePersRefresh={partial(getTwoDetail, PAGE_DEFAULT_PARAMS)}
                                    />
                                ),
                                onExpand: (_, record) => {
                                    _ ? onExpand(record) : setExpandKey([])
                                },
                                expandedRowKeys: expandKey,
                                expandIcon: ({ expanded, onExpand, record }: any) => (
                                    expanded ?
                                        (<CaretDownFilled onClick={e => onExpand(record, e)} />) :
                                        (<CaretRightFilled onClick={e => onExpand(record, e)} />)
                                )
                            }}
                        />
                    </div>
                </Row>
            </Spin>
        </Layout.Content>
    )
}
