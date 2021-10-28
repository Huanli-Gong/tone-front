import React, { useState, useImperativeHandle, forwardRef, useRef, useEffect, useMemo } from 'react';
import { Tooltip, Drawer, Col, Row, Space, Typography, Table, message, Spin, Popconfirm, Divider } from 'antd';
import { AuthCommon, AuthForm } from '@/components/Permissions/AuthCommon';
import { QuestionCircleOutlined } from '@ant-design/icons';
import styles from './index.less'
import CommentModal from './CommentModal'
import { queryBaselineDetail, deletefuncsDetail } from '../services'
import _ from 'lodash'
import { requestCodeMessage } from '@/utils/utils';
import { useParams } from 'umi';

export default forwardRef(
    (props: any, ref: any) => {
        const { ws_id }: any = useParams()
        const { server_provider, test_type, id } = props.currentBaseline
        const PAGE_DEFAULT_PARAMS = {
            server_provider,
            test_type,
            baseline_id: id,
            test_suite_id: props.test_suite_id,
            test_case_id: props.current.test_case_id,
        }  // 有用
        const [visible, setVisible] = useState(false) // 控制弹框的显示与隐藏
        const [title, setTitle] = useState('FailCase详情') // 弹框顶部title
        const [currentObj, setCurrentObj] = useState<any>({});

        const commentModal: any = useRef(null)

        const { current = {}, test_suite_name } = props;

        const [source, setSource] = useState<{ data: any[]; total: number }>({ data: [], total: 0 })
        const [pageParams, setPageParams] = useState<{ page_num: number; page_size: number }>({ page_num: 1, page_size: 20 })
        const [loading, setLoading] = useState(true)

        const getLastDetail = async (params: any) => {
            if (params && params.test_case_id === undefined) return
            setLoading(true)
            const { data, code, total } = await queryBaselineDetail(params)
            if (code === 200)
                setSource({ data, total })
            setLoading(false)
        }

        useEffect(() => {
            getLastDetail({ ...PAGE_DEFAULT_PARAMS, ...pageParams })
        }, [currentObj, pageParams])

        const handlePageChange = (page_num: number, page_size: number | undefined = 20) => {
            setPageParams({ page_num, page_size })
        }

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
                show: (title: string = "FailCase详情", data: any = {}) => {
                    setVisible(true)
                    setTitle(title)
                    // const params = 
                    PAGE_DEFAULT_PARAMS.test_case_id = data.test_case_id
                    getLastDetail({ ...PAGE_DEFAULT_PARAMS, test_case_id: data.test_case_id, ...pageParams })
                }
            })
        )

        const handleSubmit = async () => {
            message.success('操作成功！')
        }

        const handleOpenComment = (record: any) => {
            let currentObj = {};
            currentObj = threeLevelDetailData.filter((item: any) => item && record && item.id === record.id)[0] || {}
            commentModal.current.show(currentObj)
        }

        const handleDelete = function* () {
            const currentObject = threeLevelDetailData.filter((item: any) => item && item.test_case_id === current.test_case_id)[0] || {};
            yield deletefuncsDetail({ id: currentObject.id, ws_id });

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
                ellipsis: true,
                textWrap: 'word-break',
            },
            {
                dataIndex: 'bug',
                title: '缺陷记录',
                key: 'bug',
                ellipsis: true,
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
                title: '来源Job',
                key: 'source_job_id',
                ellipsis: true,
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
                title: '影响结果',
                key: 'impact_result',
            },
            {
                dataIndex: 'description',
                title: '问题描述',
                key: 'description',
                ellipsis: true,
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
                title: '操作',
                key: 'sub_case_name',
                render: (text: any, record: any) => {
                    return (
                        <Space size='small'>
                            {
                                <AuthCommon
                                    isAuth={['super_admin', 'sys_admin', 'ws_owner', 'ws_admin', 'ws_test_admin']}
                                    children={<span className={styles.fail_detail_operation} >编辑</span>}
                                    onClick={() => handleOpenComment(record)}
                                />
                            }
                            {/* 删除的弹框 */}
                            {
                                <AuthForm
                                    isAuth={['super_admin', 'sys_admin', 'ws_owner', 'ws_admin', 'ws_test_admin']}
                                    children={<span className={styles.fail_detail_operation}>删除</span>}
                                    onFirm={
                                        <Popconfirm
                                            title="你确定要删除吗？"
                                            onConfirm={() => {
                                                const generObj = handleDelete();
                                                const excuteResult: any = generObj.next();
                                                excuteResult.value.then((result: any) => {
                                                    const { code, msg } = result;
                                                    defaultOption(code, msg);
                                                })
                                            }}
                                            okText="确认"
                                            cancelText="取消"
                                            icon={<QuestionCircleOutlined style={{ color: 'red' }} />}>
                                            <span className={styles.fail_detail_operation}>删除</span>
                                        </Popconfirm>
                                    }
                                />
                            }
                        </Space>
                    )
                }
            }
        ]

        const threeLevelDetailDataCopy = useMemo(() => {
            return _.cloneDeep(threeLevelDetailData).map((item: any) => {
                item.impact_result = item.impact_result ? '是' : '否';
                return item;
            })
        }, [threeLevelDetailData])

        const defaultOption = (code: number, msg: string) => {
            if (code === 200) {
                message.success('操作成功')
                if (threeLevelDetailDataCopy.length < 2) {
                    props.secondRefresh()
                    props.oneRefresh()
                }
                // refresh()
                getLastDetail(PAGE_DEFAULT_PARAMS)
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
                            pagination={{
                                total: source.total,
                                pageSize: pageParams.page_size,
                                current: pageParams.page_num,
                                // hideOnSinglePage: true,
                                onChange: handlePageChange,
                                showTotal: (total) => total ? `共${total}条` : ``,
                            }}
                            size="small"
                        />
                    </Spin>
                </Drawer>
                <CommentModal ref={commentModal} onOk={handleSubmit} setCurrentObj={setCurrentObj} />
            </>
        );
    }
)