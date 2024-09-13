import React from 'react';
import { Table, Typography } from 'antd';
import JobTableForCase from './TableForCase';
import { CaretDownFilled, CaretRightFilled } from '@ant-design/icons';
import styles from './index.less';
import { useTestJobContext } from '../provider';
import { getServerColumn, getSuiteNameColumn } from './FieldSet';
import { useSuiteTableContext } from './provider';
import clsx from 'classnames';

const JobTableForSuite: React.FC<any> = ({ suiteList }) => {
    const { jobTypeDetails } = useTestJobContext();
    const { suite_show_type } = jobTypeDetails;
    const {
        loading,
        selectedRowKeys,
        setSelectedRowKeys,
        expandedRowKeys,
        setExpandedRowKeys,
        settingDrawerRef,
        showSelectedOnly,
        suiteCaseSearchKey,
    } = useSuiteTableContext();

    const columns = [
        getSuiteNameColumn(selectedRowKeys),
        suite_show_type === 'case' && getServerColumn(),
        {
            title: '操作',
            width: 100,
            render(record: any) {
                const obj = selectedRowKeys.find((ctx: any) => ctx.id === record.id);
                if (!obj) return <></>;
                return (
                    <Typography.Link onClick={() => settingDrawerRef.current.show(record)}>
                        配置
                    </Typography.Link>
                );
            },
        },
    ].filter(Boolean);

    const handleExpand = (expanded: any, record: any, e: any, onExpand: any) => {
        const id: any = record.id + '';
        if (expanded) setExpandedRowKeys(expandedRowKeys.filter((i: any) => i !== id));
        else setExpandedRowKeys(expandedRowKeys.concat([id]));
        onExpand(record, e);
    };

    const filterIds = React.useMemo(() => {
        const searchWord = suiteCaseSearchKey.toLowerCase();
        const selectedIds = selectedRowKeys.map((ctx: any) => ctx.id);
        const filters = suiteList?.reduce((pre: any, cur: any) => {
            const { name, test_case_list, id: test_suite_id } = cur;
            const lists = test_case_list.filter((ctx: any) =>
                ctx.name.toLowerCase().includes(searchWord),
            );

            if (name.toLowerCase().includes(searchWord) || lists.length) {
                if (showSelectedOnly) {
                    if (selectedIds.includes(test_suite_id)) return pre.concat(cur);
                    return pre;
                }
                return pre.concat(cur);
            }
            return pre;
        }, []);
        return filters.map((ctx: any) => ctx.id);
    }, [showSelectedOnly, suiteCaseSearchKey, suiteList]);

    if (filterIds?.length === 0) return <Table loading={loading} dataSource={[]} />;

    return (
        <Table
            rowKey={'id'}
            size="small"
            className={styles.table_for_suite}
            rowClassName={(record) => {
                return clsx(
                    'active-suite-table-row',
                    !filterIds.includes(record.id) && 'row-hidden-cls',
                    expandedRowKeys.includes(record.id) && 'show_left_border',
                );
            }}
            columns={columns}
            dataSource={suiteList || []}
            pagination={false}
            rowSelection={{
                selectedRowKeys: selectedRowKeys.map((ctx: any) => ctx.id),
                getCheckboxProps: (record: any) => {
                    const allCasesLength = record.test_case_list.length;
                    const selectedRow = selectedRowKeys?.find((ctx: any) => ctx.id === record.id);

                    const selectedCasesLength = selectedRow?.test_case_list?.length;

                    return {
                        checked: allCasesLength === selectedCasesLength,
                        indeterminate:
                            selectedCasesLength > 0 && selectedCasesLength < allCasesLength,
                    };
                },
                onChange: ($xx: any, keys: any) => {
                    setSelectedRowKeys(keys?.reduce((pre: any, cur: any) => pre.concat(cur), []));
                },
            }}
            expandable={{
                expandedRowKeys,
                // expandedRowClassName(record) {
                //     const { test_suite_id } = record;
                //     const hasSuite = filterIds.includes(test_suite_id);
                //     return !hasSuite ? 'row-hidden-cls' : '';
                // },
                onExpandedRowsChange(keys: any) {
                    setExpandedRowKeys(keys);
                },
                expandedRowRender(record: any) {
                    return <JobTableForCase {...record} />;
                },

                expandIcon: ({ expanded, onExpand, record }) =>
                    expanded ? (
                        <CaretDownFilled
                            onClick={(e) => handleExpand(expanded, record, e, onExpand)}
                        />
                    ) : (
                        <CaretRightFilled
                            onClick={(e) => handleExpand(expanded, record, e, onExpand)}
                        />
                    ),
            }}
        />
    );
};

export default JobTableForSuite;
