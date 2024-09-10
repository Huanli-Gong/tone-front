import { Table } from 'antd';
import React from 'react';
import { useRequest } from 'umi';
import { querySubcaseList } from '../../service';
import { ColumnEllipsisText } from '@/components/ColumnComponents';

const TableForSubcase: React.FC<any> = (props) => {
    const { id: test_suite_id } = props;

    const [params, setParams] = React.useState({ page_num: 1, page_size: 20, test_suite_id });

    const { data, loading } = useRequest(() => querySubcaseList(params), {
        manual: true,
        refreshDeps: [params],
        formatResult(res) {
            return res;
        },
    });

    const columns: any = [
        {
            dataIndex: 'sub_case_name',
            elleipsis: true,
            title: 'Test Case',
            render(_: any, row: any) {
                return <ColumnEllipsisText ellipsis={{ tooltip: true }}>{_}</ColumnEllipsisText>;
            },
        },
    ];

    return (
        <Table
            rowKey={'id'}
            columns={columns}
            dataSource={loading ? [] : data?.data}
            loading={loading}
            size="small"
            pagination={{
                current: params?.page_num,
                pageSize: params?.page_size,
                total: data?.total || 0,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal(total, range) {
                    return `共${total}条`;
                },
                onChange: (page, pageSize) => {
                    setParams({ ...params, page_num: page, page_size: pageSize });
                },
            }}
        />
    );
};

export default TableForSubcase;
