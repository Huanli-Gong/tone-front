import React from 'react';
import { Card, Typography, Row, Col, Input } from 'antd';
import { CaretDownFilled, CaretRightFilled } from '@ant-design/icons';
import SuiteCaseExpandTable from './SuiteCaseExpandTable';
import { useIntl, FormattedMessage } from 'umi';
import { ResizeHooksTable } from '@/utils/table.hooks';
import { v4 as uuid } from 'uuid';
import styles from './index.less';
import { ColumnEllipsisText } from '@/components/ColumnComponents';

export default ({ data = [], testType, provider_name, server_schedule_rule }: any) => {
    const { formatMessage } = useIntl();
    const [columnsRefresh, setColumnsRefresh] = React.useState(uuid());

    const columns: any = [
        {
            title: 'Test Suite',
            dataIndex: 'test_suite_name',
            width: 160,
            ellipsis: {
                showTitle: false,
            },
        },
        ['business_business'].includes(testType)
            ? {
                  title: <FormattedMessage id="ws.result.details.business_name" />,
                  dataIndex: 'business_name',
                  width: 160,
                  ellipsis: {
                      showTitle: false,
                  },
                  render: (text: any) => (
                      <ColumnEllipsisText ellipsis={{ tooltip: true }}>{text}</ColumnEllipsisText>
                  ),
              }
            : {
                  title: <FormattedMessage id="ws.result.details.mode" />,
                  dataIndex: 'run_mode',
                  width: 160,
                  ellipsis: {
                      showTitle: false,
                  },
              },
        {
            title: <FormattedMessage id="ws.result.details.restart" />,
            dataIndex: 'need_reboot',
            ellipsis: {
                showTitle: false,
            },
            width: 100,
            render: (_: any) =>
                _ ? (
                    <FormattedMessage id="operation.yes" />
                ) : (
                    <FormattedMessage id="operation.no" />
                ),
        },
        {
            title: <FormattedMessage id="ws.result.details.setup_info" />,
            dataIndex: 'setup_info',
            ellipsis: {
                showTitle: false,
            },
            width: 150,
            render: (_: any, row: any) => {
                if (!row?.need_reboot) return '-';
                const before = formatMessage({ id: 'ws.result.details.restart.before' });
                const after = formatMessage({ id: 'ws.result.details.restart.after' });
                return _ || row.cleanup_info ? (
                    <Typography.Text ellipsis={{ tooltip: true }}>
                        [{before}]: {_ || '-'}, [{after}]: {row.cleanup_info || '-'}
                    </Typography.Text>
                ) : (
                    '-'
                );
            },
        },
        {
            title: 'Console',
            dataIndex: 'console',
            ellipsis: {
                showTitle: false,
            },
            width: 100,
            render: (_: any) => _ || '-',
        },
        {
            title: <FormattedMessage id="ws.result.details.monitor" />,
            dataIndex: 'monitor_info',
            ellipsis: {
                showTitle: false,
            },
            width: 100,
            render: () => '-',
        },
        {
            title: <FormattedMessage id="ws.result.details.priority" />,
            dataIndex: 'priority',
            ellipsis: {
                showTitle: false,
            },
            width: 100,
            render: (_: any) => _ || '-',
        },
    ];

    return (
        <Card
            title={<FormattedMessage id="ws.result.details.test.cases.and.config" />}
            style={{ marginBottom: 10 }}
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <ResizeHooksTable
                    dataSource={data}
                    columns={columns}
                    name="ws-job-result-setting-suite-server"
                    rowKey="test_suite_id"
                    size="small"
                    pagination={false}
                    className={styles.test_suite_server_table}
                    refreshDeps={[testType]}
                    expandable={{
                        columnWidth: 30,
                        expandedRowRender: (record: any) => (
                            <SuiteCaseExpandTable
                                onColumnsChange={() => setColumnsRefresh(uuid())}
                                columnsRefresh={columnsRefresh}
                                data={record.cases}
                                testType={testType}
                                provider_name={provider_name}
                            />
                        ),
                        expandIcon: ({ expanded, onExpand, record }: any) =>
                            expanded ? (
                                <CaretDownFilled onClick={(e) => onExpand(record, e)} />
                            ) : (
                                <CaretRightFilled onClick={(e) => onExpand(record, e)} />
                            ),
                    }}
                />
                <Row>
                    <Col span={15}>
                        <Row gutter={8}>
                            <Col
                                span={2}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'end',
                                }}
                            >
                                <Typography.Text style={{ flexShrink: 0 }}>
                                    机器调度策略
                                </Typography.Text>
                            </Col>
                            <Col span={22}>
                                <Input
                                    disabled
                                    value={
                                        [
                                            {
                                                label: '按Job级分配',
                                                value: 'by_test_job',
                                            },
                                            {
                                                label: '按Test Suite分配',
                                                value: 'by_test_suite',
                                            },
                                            {
                                                label: '按Test Conf分配',
                                                value: 'by_test_conf',
                                            },
                                        ].find((ctx: any) => ctx.value === server_schedule_rule)
                                            ?.label
                                    }
                                />
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </div>
        </Card>
    );
};
