/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, forwardRef, useImperativeHandle } from 'react';
import { message, Space, Popover, Popconfirm } from 'antd';
import type { TableColumnsType } from "antd"
import { useIntl, FormattedMessage, Access, useAccess, useRequest, useParams } from 'umi';
import { QuestionCircleOutlined } from '@ant-design/icons'
import CommonTable from '@/components/Public/CommonTable';
import { test_type_enum, AccessTootip } from '@/utils/utils';
import ModalForm from '../ModalForm';
import { queryTableData, queryDelete } from '../../services';
import { ColumnEllipsisText } from '@/components/ColumnComponents';
import { getUserFilter, getCheckboxFilter, getRangeDatePickerFilter } from "@/components/TableFilters"
import Highlighter from 'react-highlight-words';
import { queryProjectList, queryProductList } from '@/pages/WorkSpace/Product/services';
import { queryBaselineList } from '@/pages/WorkSpace/BaselineManage/services';

export default forwardRef((props: any, ref: any) => {
    const { formatMessage } = useIntl();
    const { ws_id } = useParams() as any;
    const [source, setSource] = React.useState<any>({ data: [], total: 0, page_num: 1, page_size: 20 });
    const [visible, setVisible] = React.useState(false);
    const access = useAccess();
    const DEFAULT_QUERY_PARAMS = { page_num: 1, page_size: 20, ws_id }
    const [listParams, setListParams] = React.useState<any>(DEFAULT_QUERY_PARAMS)

    const { data: projects } = useRequest(() => queryProjectList({ ws_id, page_size: 999 }), { initialData: [] })
    const { data: products } = useRequest(() => queryProductList({ ws_id, page_size: 999 }), { initialData: [] })
    const { data: baselines } = useRequest(() => queryBaselineList({ ws_id }), { initialData: [] })

    // 1.请求数据
    const getTableData = async (query: any = listParams) => {
        props.loadingCallback({ loading: true })
        try {
            const { code, msg, total, ...rest } = await queryTableData(query) || {}
            if (code === 200) {
                setSource({ ...rest, total })
                // 将total回传给父级组件
                props.refreshCallback(total)
            } else {
                message.error(msg || formatMessage({ id: 'request.failed' }))
            }
            props.loadingCallback({ loading: false })
        } catch (e) {
            props.loadingCallback({ loading: false })
        }
    }
    // 2.删除
    const deleteClick = (record: any) => {
        queryDelete({ pk: record.id }).then((res) => {
            if (res.code === 200) {
                message.success(formatMessage({ id: 'request.delete.success' }));
                const { page_num, page_size, total = 0 } = source
                const remainNum = total % page_size === 1
                const totalPage: number = Math.floor(total / page_size)
                if (remainNum && totalPage && totalPage + 1 <= page_num) {
                    setListParams((p: any) => ({ ...p, page_num: totalPage }))
                } else {
                    // setListParams(DEFAULT_QUERY_PARAMS)
                    getTableData()
                }
            } else {
                message.error(res.msg || formatMessage({ id: 'request.delete.failed' }));
            }
        })
            .catch((e) => {
                console.log(e);
            });
    };

    useEffect(() => {
        getTableData()
    }, [listParams]);

    useImperativeHandle(
        ref,
        () => ({
            showModal: () => {
                setVisible(true);
            },
        })
    )

    const hiddenModalCallback = (info: any) => {
        const { title } = info;
        if (title === 'ok') {
            setListParams(DEFAULT_QUERY_PARAMS)
        }
        setVisible(false);
    };

    const onChange = (page_num: number, page_size: number) => {
        setListParams((p: any) => ({ ...p, page_num, page_size }))
    }

    const Question = ({ content = '' }) => (
        <Popover placement="top" content={<><FormattedMessage id="upload.list.table.state.question" />{content}</>}>
            <QuestionCircleOutlined style={{ color: 'rgba(0, 0, 0, 0.55)' }} />
        </Popover>
    )

    /**
     * 状态state：
     *    ('file', '文件上传中'),
     *    ('running', '文件解析中'),
     *    ('success', '成功'), 
     *    ('fail', '失败'),
     */
    const StateFlag = ({ title = '', content = '' }) => {
        switch (title) {
            case 'file': return <span style={{ color: '#649FF6', fontFamily: 'PingFangSC-Semibold' }}>Upload</span>
            case 'running': return <span style={{ color: '#649FF6', fontFamily: 'PingFangSC-Semibold' }}>Upload</span>
            case 'success': return <span style={{ color: '#81BF84', fontFamily: 'PingFangSC-Semibold' }}>Success</span>
            case 'fail': return <span style={{ color: '#C84C5A', fontFamily: 'PingFangSC-Semibold' }}>Fail <Question content={content} /></span>
            default: return <>-</>
        }
    }

    /* 
    @params
    product_id    @string
    project_id      @number[]
    state           @string[]       ['file', 'running', 'fail','success']
    test_type       @string[]       ['functional','performance']
    baseline_id     @number[]
    uploader        @number
    */

    const columns: TableColumnsType<AnyType> = [
        {
            title: <FormattedMessage id="upload.list.table.product" />,
            dataIndex: 'product_name',
            ellipsis: {
                showTitle: false
            },
            ...getCheckboxFilter(
                listParams,
                setListParams,
                products?.map((i: any) => ({ name: i.name, value: i.id })),
                "product_id"
            ),
            render: (_, row) => (
                <ColumnEllipsisText ellipsis={{ tooltip: row?.product_name }}  >
                    <Highlighter
                        highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                        searchWords={[listParams?.product_name || '']}
                        autoEscape
                        textToHighlight={row?.product_name}
                    />
                </ColumnEllipsisText>
            )
        },
        {
            title: <FormattedMessage id="upload.list.table.project" />,
            dataIndex: 'project_name',
            ellipsis: {
                showTitle: false
            },
            ...getCheckboxFilter(
                listParams,
                setListParams,
                projects?.map((i: any) => ({ name: i.name, value: i.id })),
                "project_id"
            ),
            render: (text: any) => <ColumnEllipsisText ellipsis={{ tooltip: true }} >{text}</ColumnEllipsisText>,
        },
        {
            title: <FormattedMessage id="upload.list.table.state" />,
            dataIndex: 'state',
            ...getCheckboxFilter(
                listParams,
                setListParams,
                [
                    { name: "Upload", value: "running" },
                    { name: "Success", value: "success" },
                    { name: "Fail", value: "fail" },
                ],
                "state"
            ),
            render: (text: any, record: any) => <StateFlag title={text} content={record.state_desc} />,
        },
        {
            title: <FormattedMessage id="upload.list.table.testType" />,
            dataIndex: 'test_type',
            ...getCheckboxFilter(
                listParams,
                setListParams,
                test_type_enum.map((item: any) => ({
                    name: formatMessage({ id: item.value }),
                    value: item.value
                })),
                "test_type"
            ),
            render: (text: any) => <span>{test_type_enum.filter((item: any) => item.value == text).map((item: any) => formatMessage({ id: item.value }))}</span>,
        },
        {
            title: <FormattedMessage id="upload.list.table.baseline" />,
            dataIndex: 'baseline_name',
            ellipsis: {
                showTitle: false
            },
            ...getCheckboxFilter(
                listParams,
                setListParams,
                baselines?.map((i: any) => ({ name: i.name, value: i.id })),
                "baseline_id"
            ),
            render: (text: any) => <ColumnEllipsisText ellipsis={{ tooltip: true }} >{text}</ColumnEllipsisText>,
        },
        {
            title: <FormattedMessage id="upload.list.table.uploader" />,
            dataIndex: 'uploader',
            ...getUserFilter(listParams, setListParams, 'uploader'),
            ellipsis: true,
            render: (text: any) => <span>{text || '-'}</span>,
        },
        {
            title: <FormattedMessage id="upload.list.table.date" />,
            dataIndex: 'gmt_created',
            ellipsis: {
                showTitle: false
            },
            ...getRangeDatePickerFilter(
                [listParams?.start_time, listParams?.end_time],
                (date: any) => {
                    setListParams((p: any) => ({
                        ...p,
                        page_num: 1,
                        ...date
                    }))
                }
            ),
            render: (text: any) => <span>{text || '-'}</span>,
        },
        {
            title: <FormattedMessage id="Table.columns.operation" />,
            ellipsis: {
                showTitle: false
            },
            width: 180,
            fixed: "right",
            key: "operation",
            render: (text: any, record: any) => (
                <Space>
                    {
                        /* , 'fail' */
                        ['file', 'running'].includes(record.state) ?
                            <>
                                <span style={{ opacity: 0.25 }}><FormattedMessage id="operation.view" /></span>
                                <span style={{ opacity: 0.25 }}><FormattedMessage id="operation.download" /></span>
                            </> :
                            <>
                                {
                                    'fail' !== record.state ?
                                        <a
                                            href={record.job_link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <FormattedMessage id="operation.view" />
                                        </a> :
                                        <span style={{ opacity: 0.25 }}><FormattedMessage id="operation.view" /></span>
                                }
                                <Access accessible={access.WsTourist()}>
                                    <Access
                                        accessible={access.WsMemberOperateSelf(record.creator)}
                                        fallback={
                                            <Space>
                                                <a onClick={() => AccessTootip()}><FormattedMessage id="operation.download" /></a>
                                                <a onClick={() => AccessTootip()}><FormattedMessage id="operation.delete" /></a>
                                            </Space>
                                        }
                                    >
                                        <Space>
                                            {
                                                'fail' !== record.state ?
                                                    <a
                                                        href={record.file_link}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                    >
                                                        <FormattedMessage id="operation.download" />
                                                    </a> :
                                                    <span style={{ opacity: 0.25 }}><FormattedMessage id="operation.download" /></span>
                                            }
                                            <Popconfirm
                                                placement="topRight"
                                                title={<FormattedMessage id="delete.prompt" />}
                                                onConfirm={() => deleteClick(record)}
                                                okText={<FormattedMessage id="operation.confirm" />}
                                                cancelText={<FormattedMessage id="operation.cancel" />}
                                            >
                                                <a><FormattedMessage id="operation.delete" /></a>
                                            </Popconfirm>
                                        </Space>
                                    </Access>
                                </Access>
                            </>
                    }
                </Space>
            ),
        },
    ];

    return (
        <div>
            <CommonTable
                loading={false}
                columns={columns}
                name="ws-offline-upload"
                refreshDeps={[access, listParams, projects, baselines]}
                total={source?.total || 0}
                page={source?.page_num || DEFAULT_QUERY_PARAMS.page_num}
                pageSize={source?.page_size || DEFAULT_QUERY_PARAMS.page_size}
                dataSource={source?.data || []}
                handlePage={onChange}
            />

            <ModalForm
                visible={visible}
                callback={hiddenModalCallback}
                baselines={baselines}
                products={products}
                projects={projects}
            />
        </div>
    )
});

