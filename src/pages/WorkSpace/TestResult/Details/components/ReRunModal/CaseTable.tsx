import React from 'react';
import { Table } from 'antd';
import clsx from 'classnames';
import { CaseTableWrapper } from '@/pages/WorkSpace/TestJob/SuiteTables/FieldSet';
import { JobListStateTag } from '..';

const JobTableForCase: React.FC<any> = (props) => {
    const {
        suite_show_type,
        id: test_suite_id,
        case_list,
        selectedRowKeys,
        setSelectedRowKeys,
        suiteCaseSearchKey,
    } = props;

    const columns: any = [
        {
            title: suite_show_type === 'case' ? 'Test Case名称' : 'Test Conf名称',
            dataIndex: 'name',
            ellipsis: true,
            render: (text: any, record: any, index: number) => `${text}`,
        },
        {
            title: '状态',
            width: 180,
            render(record: any) {
                if (!record?.state) return '-';
                return <JobListStateTag {...record} />;
            },
        },
    ].filter(Boolean);

    const filterIds = React.useMemo(() => {
        const baseIds = case_list?.filter((ctx: any) =>
            ctx.name.toLowerCase().includes(suiteCaseSearchKey.toLowerCase()),
        );
        return baseIds.map((ctx: any) => ctx.id);
    }, [suiteCaseSearchKey]);

    if (filterIds.length === 0) return <></>;

    return (
        <CaseTableWrapper list={case_list} filterIds={filterIds}>
            <Table
                rowKey={'id'}
                size="small"
                className={clsx('case-right-table')}
                columns={columns}
                dataSource={case_list || []}
                pagination={false}
                rowClassName={(record) => {
                    return clsx(
                        'active-case-table-row',
                        !filterIds.includes(record.id) && 'row-hidden-cls',
                    );
                }}
                rowSelection={{
                    selectedRowKeys: selectedRowKeys?.[test_suite_id] || [],
                    hideSelectAll: true,
                    onChange: (keys, selectedKeys: any) => {
                        if (!!selectedKeys?.length) {
                            setSelectedRowKeys({
                                ...selectedRowKeys,
                                [test_suite_id]: selectedKeys?.map((ctx: any) => ctx?.id),
                            });
                        } else {
                            setSelectedRowKeys(
                                Object.entries(selectedRowKeys).reduce((pre: any, cur: any) => {
                                    const [suite_id, ids] = cur;
                                    if (+suite_id !== +test_suite_id) {
                                        pre[suite_id] = ids;
                                    }
                                    return pre;
                                }, {}),
                            );
                        }
                    },
                }}
            />
        </CaseTableWrapper>
    );
};

export default JobTableForCase;
