import React, { useState, useImperativeHandle, forwardRef, useRef, useEffect, useMemo } from 'react';
import { Tooltip, Drawer, Col, Row, Space, Typography, Table, message, Spin, Popconfirm, Form, Divider } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import styles from './index.less'
import CommentModal from './CommentModal'
import { queryBaselineDetail, deletefuncsDetail } from '../services'
import _ from 'lodash'
import { AccessTootip, requestCodeMessage, handlePageNum, useStateRef } from '@/utils/utils';
import { useParams, useIntl, useAccess, FormattedMessage, Access } from 'umi';
import CommonPagination from '@/components/CommonPagination';

export default forwardRef(
    (props: any, ref: any) => {
        const { formatMessage } = useIntl()

        const { ws_id }: any = useParams()
        const access = useAccess();
        const { server_provider, test_type, id } = props.currentBaseline
        const PAGE_DEFAULT_PARAMS = {
            server_provider,
            test_type,
            baseline_id: id,
            test_suite_id: props.test_suite_id,
            test_case_id: props.current.test_case_id,
        }  // 有用
        const [visible, setVisible] = useState(false) // 控制弹框的显示与隐藏
        const [title, setTitle] = useState(formatMessage({id: 'pages.workspace.baseline.failDetail'}) ) // 弹框顶部title
        const [currentObj, setCurrentObj] = useState<any>({});

        const commentModal: any = useRef(null)

        const { current = {}, test_suite_name } = props;

        const [source, setSource] = useState<{ data: any[]; total: number }>({ data: [], total: 0 })
        const [pageParams, setPageParams] = useState<any>({ page_num: 1, page_size: 20 })
        const [loading, setLoading] = useState(true)

        const getLastDetail = async (params: any) => {
            if (params && params.test_case_id === undefined) return
            setLoading(true)
            const { data, code, total } = await queryBaselineDetail(params)
            if (code === 200)
                setSource({ data, total })
            setLoading(false)
        }

        const pageCurrent = useStateRef(pageParams)
        const totalCurrent = useStateRef(source)

        useEffect(() => {
            getLastDetail({ ...PAGE_DEFAULT_PARAMS, ...pageParams })
        }, [currentObj, pageParams])

        const threeLevelDetailData = useMemo(() => {
            return source.data.map((item: any) => {
                if (item && item.id === currentObj.id) return currentObj
                return item
            })
        }, [source.data, currentObj])

        const onClose = () => {
            setVisible(false);
            setPageParams({ page_size: 20, page_num: 1 })
            setSource({ data: [], total: 0 })
        };

        useImperativeHandle(
            ref,
            () => ({
                show: (title: string = "", data: any = {}) => {
                    setVisible(true)
                    setTitle(title)
                    // const params = 
                    PAGE_DEFAULT_PARAMS.test_case_id = data.test_case_id
                    getLastDetail({ ...PAGE_DEFAULT_PARAMS, test_case_id: data.test_case_id, ...pageParams })
                }
            })
        )

        const handleSubmit = async () => {
            message.success(formatMessage({id: 'operation.success'}) )
        }

        const handleOpenComment = (record: any) => {
            let currentObj = {};
            currentObj = threeLevelDetailData.filter((item: any) => item && record && item.id === record.id)[0] || {}
            commentModal.current.show(currentObj)
        }

        const handleDelete = async(record:any) => {
            // const currentObject = threeLevelDetailData.filter((item: any) => item && item.test_case_id === current.test_case_id)[0] || {};
            const { code, msg } = await deletefuncsDetail({ id: record.id, ws_id });
            defaultOption(code, msg);
        }

        const fn = (job_id: any) => {
            let job_name = ''
            threeLevelDetailData.forEach((item: any) => {
                if (item.source_job_id === job_id) job_name = item.job_name
            })
            return job_name
        }

        const columns = [
            {
                dataIndex: 'sub_case_name',
                title: 'FailCase',
                key: 'sub_case_name',
                render: (sub_case_name: any) => (
                    <Tooltip title={sub_case_name} overlayStyle={{ wordBreak: 'break-all' }} placement="topLeft">
                        <span className={styles.sub_case_name}>
                            {sub_case_name}
                        </span>
                    </Tooltip>
                ),
                ellipsis: {
                    showTitle: false
                },
                textWrap: 'word-break',
            },
            {
                dataIndex: 'bug',
                title: <FormattedMessage id={`pages.workspace.baseline.failDetail.table.bug`} />,
                key: 'bug',
                ellipsis: {
                    showTitle: false
                },
                textWrap: 'word-break',
                render: (text: any) => {
                    return (
                        <Tooltip placement="topLeft" title={text} overlayStyle={{ wordBreak: 'break-all' }}>
                            <span className={styles.sub_case_name}>
                                {text}
                            </span>
                        </Tooltip >
                    )
                }
            },
            {
                dataIndex: 'source_job_id',
                title: <FormattedMessage id={`pages.workspace.baseline.failDetail.table.source_job_id`} />,
                key: 'source_job_id',
                ellipsis: {
                    showTitle: false
                },
                textWrap: 'word-break',
                render: (text: any) => {
                    const urlHref = `/ws/${ws_id}/test_result/${text}`
                    return (
                        <Tooltip placement="topLeft" title={fn(text)} overlayStyle={{ wordBreak: 'break-all' }}>
                            <a href={urlHref} className={styles.hrefUrl} target="_blank">
                                {fn(text)}
                            </a>
                        </Tooltip >
                    )
                }
            },
            {
                dataIndex: 'impact_result',
                title: <FormattedMessage id={`pages.workspace.baseline.failDetail.table.impact_result`} />,
                key: 'impact_result',
            },
            {
                dataIndex: 'description',
                title: <FormattedMessage id={`pages.workspace.baseline.failDetail.table.description`} />,
                key: 'description',
                ellipsis: {
                    showTitle: false
                },
                textWrap: 'word-break',
                render: (text: any) => {
                    return (
                        <Tooltip placement="topLeft" title={text} overlayStyle={{ wordBreak: 'break-all' }}>
                            <span className={styles.sub_case_name}>
                                {text}
                            </span>
                        </Tooltip >
                    )
                }
            },
            {
                title: <FormattedMessage id={`pages.workspace.baseline.failDetail.table.action`} />,
                key: 'sub_case_name',
                render: (text: any, record: any) => {
                    return (
                        <Access
                            accessible={access.WsMemberOperateSelf(record.creator)}
                            fallback={
                                <Space>
                                    <span className={styles.fail_detail_operation} onClick={() => AccessTootip()}><FormattedMessage id="operation.edit"/></span>
                                    <span className={styles.fail_detail_operation} onClick={() => AccessTootip()}><FormattedMessage id="operation.delete"/></span>
                                </Space>
                            }
                        >
                            <Space size='small'>
                                <span className={styles.fail_detail_operation} onClick={() => handleOpenComment(record)}><FormattedMessage id="operation.edit"/></span>
                                {/* 删除的弹框 */}
                                <Popconfirm
                                    title={<FormattedMessage id="delete.prompt"/>}
                                    onConfirm={() => handleDelete(record)}
                                    okText={<FormattedMessage id="operation.confirm"/>}
                                    cancelText={<FormattedMessage id="operation.cancel"/>}
                                    icon={<QuestionCircleOutlined style={{ color: 'red' }} />}>
                                    <span className={styles.fail_detail_operation}><FormattedMessage id="operation.delete"/></span>
                                </Popconfirm>
                            </Space>
                        </Access>
                    )
                }
            }
        ]

        const threeLevelDetailDataCopy = useMemo(() => {
            return _.cloneDeep(threeLevelDetailData).map((item: any) => {
                item.impact_result = item.impact_result ? formatMessage({id: 'operation.yes'}): formatMessage({id: 'operation.no'});
                return item;
            })
        }, [threeLevelDetailData])

        const defaultOption = (code: number, msg: string) => {
            const { page_size } = pageCurrent.current
            if (code === 200) {
                message.success(formatMessage({id: 'operation.success'}) )
                if (threeLevelDetailDataCopy.length < 2) {
                    props.secondRefresh()
                    props.oneRefresh()
                }
                setPageParams({ ...pageParams, page_num: handlePageNum(pageCurrent, totalCurrent), page_size })
            }
            else {
                requestCodeMessage(code, msg)
            }
        }

        return (
            <>
                <Drawer
                    maskClosable={false}
                    keyboard={false}
                    title={title}
                    placement="right"
                    closable={true}
                    onClose={onClose}
                    visible={visible}
                    width={860}>
                    <Row>
                        <Col span={24}>
                            <Space>
                                <Typography.Text className={styles.script_right_name} strong={true}>Test Suite</Typography.Text>
                                <Typography.Text>{test_suite_name}</Typography.Text>
                            </Space>
                        </Col>
                        <Col span={24}>
                            <Space>
                                <Typography.Text className={styles.script_right_name} strong={true}>Test Conf</Typography.Text>
                                <Typography.Text className={styles.failcase_test_case_name}>{current.test_case_name}</Typography.Text>
                            </Space>
                        </Col>
                    </Row>
                    <div className={styles.line}>
                        <Divider style={{
                            borderTop: '10px solid #f0f0f0',
                        }} />
                    </div>
                    <div className={styles.detal_drawer_text}>{'FailCase'}</div>
                    <Spin spinning={loading}>
                        <Table
                            columns={columns}
                            dataSource={threeLevelDetailDataCopy}
                            pagination={false}
                            size="small"
                        />
                        <CommonPagination
                            total={source.total}
                            pageSize={pageParams.page_size}
                            currentPage={pageParams.page_num}
                            onPageChange={
                                (page_num, page_size) => {
                                    setPageParams({ ...pageParams, page_num, page_size })
                                }
                            }
                        />
                    </Spin>
                </Drawer>
                <CommentModal ref={commentModal} onOk={handleSubmit} setCurrentObj={setCurrentObj} />
            </>
        );
    }
)