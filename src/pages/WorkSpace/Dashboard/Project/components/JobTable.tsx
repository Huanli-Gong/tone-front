import React, { useState, useRef, useEffect } from 'react';
import { JobListStateTag } from '@/pages/WorkSpace/TestResult/Details/components/index';
import lodash from 'lodash';
import CommonPagination from '@/components/CommonPagination';
import { deleteJobTest } from '@/pages/WorkSpace/TestResult/services';
import { message, Space, Typography, Tooltip, Popconfirm, Row, Spin, Button } from 'antd';
import ViewReports from './ViewReports';
import { queryTestResultList } from '@/pages/WorkSpace/TestResult/services';
import styled from 'styled-components';
import { useParams, Access, useAccess, useIntl, FormattedMessage, getLocale } from 'umi';
import RerunModal from '@/pages/WorkSpace/TestResult/Details/components/ReRunModal';
import styles from './index.less';
import { requestCodeMessage, AccessTootip } from '@/utils/utils';
import { ResizeHooksTable } from '@/utils/table.hooks';
import { ColumnEllipsisText } from '@/components/ColumnComponents';
import ChangeJobProjectDrawer from './ChangeJobProjectDrawer';

const TableBody = styled(Row)`
    width: 100%;
    // max-height: calc( 100% - 65px - 72px );
`;

const ColumnCircleText = styled.span`
    display: inline-block;
    min-width: 33px;
    padding-left: 5px;
    padding-right: 5px;
    height: 18px;
    border-radius: 9px;
    text-align: center;
    color: #ffffff;
    line-height: 18px;
    cursor: pointer;
`;

const JobTable: React.FC = () => {
    const { formatMessage } = useIntl();
    const enLocale = getLocale() === 'en-US';

    const { ws_id, project_id }: any = useParams();
    const DEFAULT_TABLE_PARAMS = { page_num: 1, page_size: 10, ws_id, project_id };

    const [pageParams, setPageParams] = useState(DEFAULT_TABLE_PARAMS);
    const changeJobProjectDrawer = useRef() as any;

    const [jobs, setJobs] = useState<any>({
        data: [],
        total: 0,
    });
    const access = useAccess();
    const [loading, setLoading] = useState(true);
    const [selectedRows, setSelectedRows] = useState<any>([]);

    useEffect(() => {
        getProjectJobs();
    }, []);

    const rerunModal: any = useRef();

    const getProjectJobs = async (params: any = DEFAULT_TABLE_PARAMS) => {
        setLoading(true);
        const { code, msg, ...data } = await queryTestResultList(params);
        if (code !== 200) return requestCodeMessage(code, msg);
        // console.log(data)
        setJobs(data);
        setPageParams(params);
        setLoading(false);
    };

    const handleDelete = async (_: any) => {
        const { code, msg } = await deleteJobTest({ job_id: _.id });
        if (code !== 200) {
            requestCodeMessage(code, msg);
            return;
        }
        const { page_num, page_size } = pageParams;
        await getProjectJobs({ ws_id, project_id, page_num, page_size });
        message.success(formatMessage({ id: 'operation.success' }));
    };

    const handleTestReRun = (_: any) => rerunModal.current.show(_);

    const columns: any = [
        {
            title: <FormattedMessage id="ws.dashboard.job.id" />,
            dataIndex: 'id',
            fixed: 'left',
            className: 'dashboard_job_list_hover_name',
            width: 80,
            render: (_: any) => (
                <Typography.Link target={'_blank'} href={`/ws/${ws_id}/test_result/${_}`}>
                    {_}
                </Typography.Link>
            ),
        },
        {
            title: <FormattedMessage id="ws.dashboard.job.name" />,
            dataIndex: 'name',
            width: 200,
            ellipsis: {
                showTitle: false,
            },
            className: 'dashboard_job_list_hover_name',
            render: (_: any, row: any) => (
                <ColumnEllipsisText ellipsis={{ tooltip: _ }}>
                    <Typography.Link href={`/ws/${ws_id}/test_result/${row.id}`} target="_blank">
                        {_}
                    </Typography.Link>
                </ColumnEllipsisText>
            ),
        },
        {
            title: <FormattedMessage id="ws.dashboard.job.state" />,
            width: 120,
            dataIndex: 'state',
            render: (_: any, row: any) => <JobListStateTag {...row} />,
        },
        {
            title: <FormattedMessage id="ws.dashboard.job.test_type" />, //'测试类型',
            width: 100,
            dataIndex: 'test_type',
        },
        {
            title: <FormattedMessage id="ws.dashboard.job.test_result" />, //'总计/成功/失败',
            dataIndex: 'test_result',
            width: 160,
            render: (_: any) => {
                const result = JSON.parse(_);
                if (lodash.isNull(result)) {
                    return (
                        <Space>
                            <ColumnCircleText style={{ background: '#649FF6' }}>-</ColumnCircleText>
                            <ColumnCircleText style={{ background: '#81BF84' }}>-</ColumnCircleText>
                            <ColumnCircleText style={{ background: '#C84C5A' }}>-</ColumnCircleText>
                        </Space>
                    );
                } else {
                    return (
                        <Space>
                            <ColumnCircleText style={{ background: '#649FF6' }}>
                                {result.total}
                            </ColumnCircleText>
                            <ColumnCircleText style={{ background: '#81BF84' }}>
                                {result.pass}
                            </ColumnCircleText>
                            <ColumnCircleText style={{ background: '#C84C5A' }}>
                                {result.fail}
                            </ColumnCircleText>
                        </Space>
                    );
                }
            },
        },
        {
            title: <FormattedMessage id="ws.dashboard.job.project_name" />, //'所属项目',
            width: 120,
            dataIndex: 'project_name',
            ellipsis: {
                showTitle: false,
            },
            render: (_: any) => _ && <Tooltip title={_}>{_}</Tooltip>,
        },
        {
            title: <FormattedMessage id="ws.dashboard.job.creator_name" />, //'创建人',
            width: 80,
            ellipsis: true,
            dataIndex: 'creator_name',
        },
        {
            title: <FormattedMessage id="ws.dashboard.job.start_time" />, //'开始时间',
            width: 180,
            dataIndex: 'start_time',
            ellipsis: true,
        },
        {
            title: <FormattedMessage id="ws.dashboard.job.end_time" />, //'完成时间',
            width: 180,
            ellipsis: true,
            dataIndex: 'end_time',
        },
        {
            title: <FormattedMessage id="Table.columns.operation" />,
            width: enLocale ? 220 : 160,
            fixed: 'right',
            key: 'operation',
            render: (_: any) => {
                return (
                    <Space>
                        <Access accessible={access.WsTourist()}>
                            <Access
                                accessible={access.WsMemberOperateSelf(_.creator)}
                                fallback={
                                    <Space>
                                        {_.created_from === 'offline' ? (
                                            <Typography.Text
                                                style={{ color: '#ccc', cursor: 'no-drop' }}
                                            >
                                                <FormattedMessage id="ws.dashboard.operation.rerun" />
                                            </Typography.Text>
                                        ) : (
                                            <span onClick={() => AccessTootip()}>
                                                <Typography.Text
                                                    style={{ color: '#1890FF', cursor: 'pointer' }}
                                                >
                                                    <FormattedMessage id="ws.dashboard.operation.rerun" />
                                                </Typography.Text>
                                            </span>
                                        )}
                                        <span onClick={() => AccessTootip()}>
                                            <Typography.Text
                                                style={{ color: '#1890FF', cursor: 'pointer' }}
                                            >
                                                <FormattedMessage id="operation.delete" />
                                            </Typography.Text>
                                        </span>
                                    </Space>
                                }
                            >
                                <Space>
                                    {/** case.离线任务上传后，不能重跑。 */}
                                    {_.created_from === 'offline' ? (
                                        <Typography.Text
                                            style={{ color: '#ccc', cursor: 'no-drop' }}
                                        >
                                            <FormattedMessage id="ws.dashboard.operation.rerun" />
                                        </Typography.Text>
                                    ) : (
                                        <span onClick={() => handleTestReRun(_)}>
                                            <Typography.Text
                                                style={{ color: '#1890FF', cursor: 'pointer' }}
                                            >
                                                <FormattedMessage id="ws.dashboard.operation.rerun" />
                                            </Typography.Text>
                                        </span>
                                    )}
                                    <Popconfirm
                                        title={<FormattedMessage id="delete.prompt" />}
                                        onConfirm={() => handleDelete(_)}
                                        okText={<FormattedMessage id="operation.confirm" />}
                                        cancelText={<FormattedMessage id="operation.cancel" />}
                                    >
                                        <Typography.Text
                                            style={{ color: '#1890FF', cursor: 'pointer' }}
                                        >
                                            <FormattedMessage id="operation.delete" />
                                        </Typography.Text>
                                    </Popconfirm>
                                </Space>
                            </Access>
                        </Access>
                        <ViewReports {..._} />
                    </Space>
                );
            },
        },
    ];

    const handleChangeProjectOk = () => {
        message.success('操作成功！');
        const page_num =
            Math.ceil((jobs?.total - selectedRows?.length) / pageParams.page_size) || 1;
        const params = { ...pageParams, page_num };

        if (page_num < pageParams.page_num) getProjectJobs(params);
        else getProjectJobs(pageParams);
        setSelectedRows([]);
    };

    return (
        <Spin spinning={loading}>
            <TableBody>
                <Access accessible={access.WsMemberNoPermission()}>
                    <Button
                        style={{ marginBottom: 10 }}
                        type="primary"
                        disabled={selectedRows.length === 0}
                        onClick={() => changeJobProjectDrawer.current.show(selectedRows)}
                    >
                        更改项目
                    </Button>
                </Access>
                <ResizeHooksTable
                    rowKey="id"
                    name="ws-dashboard-project-job-list"
                    columns={columns}
                    refreshDeps={[enLocale, ws_id, access]}
                    rowClassName={styles.result_table_row}
                    dataSource={jobs.data}
                    pagination={false}
                    style={{ width: '100%' }}
                    size="small"
                    rowSelection={{
                        selectedRowKeys: selectedRows.map((i: any) => i.id),
                        onChange: (rowkeys: any, selectedRows: any) => {
                            setSelectedRows(selectedRows);
                        },
                    }}
                />
                <CommonPagination
                    total={jobs?.total}
                    currentPage={pageParams?.page_num}
                    pageSize={pageParams?.page_size}
                    onPageChange={(page_num, page_size) =>
                        getProjectJobs({ ws_id, project_id, page_num, page_size })
                    }
                />
            </TableBody>

            <RerunModal ref={rerunModal} />

            <ChangeJobProjectDrawer ref={changeJobProjectDrawer} onOk={handleChangeProjectOk} />
        </Spin>
    );
};

export default JobTable;
