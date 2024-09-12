import React from 'react';
import { Empty, Table, Typography } from 'antd';
import clsx from 'classnames';
import { useTestJobContext } from '../provider';
import { CaseTableWrapper, getServerColumn } from './FieldSet';
import { useSuiteTableContext } from './provider';

const JobTableForCase: React.FC<any> = (props) => {
    const { test_case_list, id: test_suite_id } = props;

    const {
        selectedRowKeys,
        setSelectedRowKeys,
        settingDrawerRef,
        showSelectedOnly,
        suiteCaseSearchKey,
    } = useSuiteTableContext();
    const { jobTypeDetails } = useTestJobContext();
    const { suite_show_type } = jobTypeDetails;

    const columns: any = [
        {
            title: suite_show_type === 'case' ? 'Test Case名称' : 'Test Conf名称',
            dataIndex: 'name',
            render: (text: any, record: any, index: number) => `${text}`,
        },

        suite_show_type === 'conf' && getServerColumn(),
        suite_show_type === 'conf' && {
            title: '操作',
            width: 100,
            render(row: any) {
                const suiteObj = selectedRowKeys.find((ctx: any) => ctx.id === test_suite_id);
                const caseObj = suiteObj?.test_case_list?.find((ctx: any) => ctx.id === row.id);

                if (!caseObj) return <></>;
                return (
                    <Typography.Link onClick={() => settingDrawerRef.current.show(row)}>
                        配置
                    </Typography.Link>
                );
            },
        },
    ].filter(Boolean);

    const filterIds = React.useMemo(() => {
        const baseIds = test_case_list?.filter((ctx: any) =>
            ctx.name.toLowerCase().includes(suiteCaseSearchKey.toLowerCase()),
        );
        let filters = baseIds;
        if (showSelectedOnly) {
            const suiteObj = selectedRowKeys.find((ctx: any) => ctx.id === test_suite_id);
            if (suiteObj) {
                const selectedCaseIds = suiteObj?.test_case_list?.map((ctx: any) => ctx.id);
                filters = baseIds.filter((ctx: any) => selectedCaseIds.includes(ctx.id));
            }
        }
        return filters.map((ctx: any) => ctx.id);
    }, [suiteCaseSearchKey, showSelectedOnly]);

    return (
        <CaseTableWrapper list={test_case_list} filterIds={filterIds}>
            {
                filterIds.length === 0 ? <Table dataSource={[]}
                    className={clsx('case-right-table')}
                    size="small"
                    columns={columns}
                /> :
                    <Table
                        rowKey={'id'}
                        size="small"
                        className={clsx('case-right-table')}
                        columns={columns}
                        dataSource={test_case_list || []}
                        pagination={false}
                        rowClassName={(record) => {
                            return clsx(
                                'active-case-table-row',
                                !filterIds.includes(record.id) && 'row-hidden-cls',
                            );
                        }}
                        rowSelection={{
                            selectedRowKeys: selectedRowKeys
                                ?.find((item: any) => item.id === test_suite_id)
                                ?.test_case_list?.map((ctx: any) => ctx.id),
                            hideSelectAll: true,
                            onChange: (keys, selectedKeys: any) => {
                                const baseProps = {
                                    ...props,
                                    test_case_list: selectedKeys,
                                };
                                if (selectedRowKeys.length === 0) {
                                    setSelectedRowKeys(selectedRowKeys.concat(baseProps));
                                } else {
                                    const hasKey = selectedRowKeys.find(
                                        (item: any) => item.id === test_suite_id,
                                    );
                                    if (hasKey) {
                                        setSelectedRowKeys(
                                            selectedRowKeys.reduce((pre: any, cur: any) => {
                                                if (cur.id === test_suite_id) {
                                                    if (selectedKeys.length === 0) return pre;
                                                    return pre.concat({
                                                        ...baseProps,
                                                        test_case_list: selectedKeys,
                                                    });
                                                }
                                                return pre.concat(cur);
                                            }, []),
                                        );
                                    } else {
                                        setSelectedRowKeys(selectedRowKeys.concat(baseProps));
                                    }
                                }
                            },
                        }}
                    />
            }

        </CaseTableWrapper>
    );
};

export default JobTableForCase;
