import React, { useState, useImperativeHandle, forwardRef, useEffect } from 'react';
import { Tooltip, Drawer, Col, Row, Space, Typography, Table, message, Spin, Popconfirm, Form, Popover, Divider } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import styles from './index.less'
import { queryBaselineDetail, deletePerfsDetail } from '../services'
import _ from 'lodash'
import Clipboard from 'clipboard'
import { AccessTootip, requestCodeMessage } from '@/utils/utils';
import { useParams, Access, useAccess } from 'umi';

export default forwardRef(
    (props: any, ref: any) => {
        const { ws_id }: any = useParams()
        const access = useAccess();
        let { test_suite_name, test_case_name } = props;
        const { server_provider, test_type, id } = props.currentBaseline
        const { test_suite_id, test_case_id, server_sn } = props;
        const PAGE_DEFAULT_PARAMS: any = {
            server_provider,
            test_type,
            test_suite_id,
            test_case_id,
            server_sn,
            baseline_id: id,
        }  // 有用
        const [visible, setVisible] = useState(false) // 控制弹框的显示与隐藏
        const [title, setTitle] = useState('FailCase详情') // 弹框顶部title
        const [data, setData] = useState<[]>([])
        const [loading, setLoading] = useState(true)
        const [testCaseName, setTestCaseName] = useState(test_case_name)
        const [testCaseId, setTestCaseId] = useState('')

        // const { data, loading, run, refresh } = useRequest(
        //     (data) => queryBaselineDetail(data),
        //     {
        //         formatResult: response => response,
        //         initialData: { data: [], total: 0 },
        //         defaultParams: [PAGE_DEFAULT_PARAMS]
        //     }
        // )
        const getLastDetail = async (params: any) => {
            if (params && params.test_case_id === undefined) return
            let { data, code } = await queryBaselineDetail(params)
            if (code === 200) {
                setData(data)
            }
            setLoading(false)
        }
        // useEffect(() => {
        //     // run(PAGE_DEFAULT_PARAMS)
        //     getLastDetail(PAGE_DEFAULT_PARAMS)
        // }, [server_provider,test_type,id,test_case_id,test_suite_id, threeLevelId])

        useEffect(() => {
            data.forEach((record: any) => {
                const clipboard = new Clipboard(`#copy_link_${record.id}`)
                clipboard.on('success', function (e) {
                    message.success('复制成功', 1)
                    e.clearSelection();
                })
                return () => {
                    clipboard.destroy()
                }
            })

        }, [data])

        let threeLevelDetailData: any = data && _.isArray(data) ? data : []; // 有用
        threeLevelDetailData = threeLevelDetailData.map((item: any) => {
            if (!item) return item;
            const baseline_value: any = {
                Avg: _.isNaN(Number(item.test_value)) ? item.test_value : Number(item.test_value).toFixed(2),
                CV: _.isNaN(Number(item.cv_value)) ? item.cv_value : Number(item.cv_value).toFixed(2),
                Max: _.isNaN(Number(item.max_value)) ? item.max_value : Number(item.max_value).toFixed(2),
                Min: _.isNaN(Number(item.min_value)) ? item.min_value : Number(item.min_value).toFixed(2),
            }
            item.baseline_value = baseline_value;
            item.baseline_data = `${baseline_value.Avg}${baseline_value.CV}`;
            return item

        })

        const onClose = () => {
            setVisible(false);
        };

        useImperativeHandle(
            ref,
            () => ({
                show: (title: string = "Metric详情", data: any = {}) => {
                    setVisible(true)
                    setTitle(title)
                    PAGE_DEFAULT_PARAMS.test_case_id = data.test_case_id
                    setTestCaseName(data.test_case_name)
                    setTestCaseId(data && data.test_case_id)
                    getLastDetail(PAGE_DEFAULT_PARAMS)
                }
            })
        )

        const defaultOption = (code: number, msg: string) => {
            if (code === 200) {
                message.success('操作成功')
                if (threeLevelDetailData.length < 2) {
                    props.secondRefresh()
                    props.oneRefresh()
                    props.twePersRefresh()
                }
                if (threeLevelDetailData.length === 1) {
                    setLoading(false)
                    setVisible(false)
                    return;
                }
                // refresh()
                PAGE_DEFAULT_PARAMS.test_case_id = testCaseId
                getLastDetail(PAGE_DEFAULT_PARAMS)
            }
            else {
                requestCodeMessage(code, msg)
            }
        }
        const handleDelete = function* (current: any) {
            const currentObject = threeLevelDetailData.filter((item: any) => item && current && item.id === current.id)[0] || {};
            yield deletePerfsDetail({ id: currentObject.id, ws_id });
        }

        const reactNode = (record: any) => {
            const { baseline_value, value_list, metric } = record;
            const copy_dom_id = `copy_link_${record.id}`;
            const copy_container = `foo_${record.id}`;
            return (
                <div className={styles.metric_value_detail}>
                    <Row justify="space-between" className={styles.left_title}>
                        <Col span={24} className={styles.filter_search_box}>
                            <Typography.Text strong={true}>基线数据</Typography.Text>
                            <span className={styles.copy_link} id={copy_dom_id} data-clipboard-target={`#${copy_container}`}>复制</span>
                        </Col>
                    </Row>
                    <div id={copy_container} className={styles.copy_container}>
                        <div style={{ opacity: 0, height: 0, position: 'absolute' }}>{`${metric}基线数据`}</div>
                        <div className={styles.line}><Divider /></div>
                        <div className={styles.copy_content}>
                            <Row justify="space-between" className={styles.left_title}>
                                <ul>
                                    {
                                        Object.keys(baseline_value).map((key: string) => (
                                            <li key={key}>
                                                <Typography.Text strong={true} className={styles.metric_option_key}>{`${key}:`}</Typography.Text>
                                                <Typography.Text ellipsis={true} className={styles.metric_option_value}>{baseline_value[key]}</Typography.Text>
                                            </li>
                                        ))
                                    }
                                </ul>
                            </Row>
                            <div className={styles.test_record}>
                                <Typography.Text strong={true}>Test Record</Typography.Text>
                            </div>
                            <Row justify="space-between" className={styles.left_title}>
                                <ul>
                                    {
                                        JSON.parse(value_list).map((item: any, index: number) => (
                                            <li key={index}>
                                                <Typography.Text strong={true} className={styles.metric_option_key}>{`(${index + 1})`}</Typography.Text>
                                                <Typography.Text ellipsis={true} className={styles.metric_option_value}>{_.isNaN(Number(item)) ? item : Number(item).toFixed(2)}</Typography.Text>
                                            </li>
                                        ))
                                    }
                                </ul>
                            </Row>
                        </div>
                    </div>
                </div>
            )
        }

        const columns = [
            {
                dataIndex: 'metric',
                title: 'Metric',
                key: 'metric',
                ellipsis: {
                    showTitle: false
                },
                textWrap: 'word-break',
                render: (text:any) => {
                    return (
                        <Tooltip placement="topLeft" title={text} overlayStyle={{ wordBreak: 'break-all' }}>
                            {text}
                        </Tooltip>
                    )
                }

            },
            {
                dataIndex: 'baseline_data',
                title: '基线值',
                key: 'baseline_data',
                render: (text: any, record: any) =>
                    <Popover content={reactNode(record)} title={''} trigger="hover">
                        <span className={styles.baseline_data}>{text}</span>
                    </Popover>
            },
            {
                title: '操作',
                key: 'id',
                render: (record: any) => {
                    return (
                        <Access 
                            accessible={access.WsMemberOperateSelf(record.creator)}
                            fallback={
                                <Space size='small'>
                                    <span className={styles.fail_detail_operation} onClick={()=> AccessTootip()}>删除</span>
                                </Space>
                            }
                        >
                            <Space size='small'>
                                {/* 删除的弹框 */}
                                <Popconfirm
                                    title="你确定要删除吗？"
                                    onConfirm={() => {
                                        const generObj = handleDelete(record);
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
                            </Space>
                        </Access>
                    )
                }
            }
        ]

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
                    width={500}
                >
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
                                <Typography.Text>{testCaseName}</Typography.Text>
                            </Space>
                        </Col>
                    </Row>
                    <div className={styles.line}>
                        <Divider style={{
                            borderTop: '10px solid #f0f0f0',
                        }} />
                    </div>
                    <div className={styles.detal_drawer_text}>{'Metric详情'}</div>
                    <Spin spinning={loading}>
                        <Table
                            columns={columns}
                            dataSource={threeLevelDetailData}
                            pagination={false}
                            size="small"
                        />
                    </Spin>
                </Drawer>
            </>
        );
    }
)