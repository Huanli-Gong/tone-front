import React from 'react';
import { Table } from 'antd';
import CaseTable from './CaseTable';
import { CaretDownFilled, CaretRightFilled } from '@ant-design/icons';
import clsx from 'classnames';
import styled from 'styled-components';

const SuiteTableCls = styled(Table)`
    .ant-table-expanded-row-fixed {
        padding: 0 !important;
        margin: 0 !important;
    }

    .ant-table-expanded-row.ant-table-expanded-row-level-1 > .ant-table-cell {
        padding: 0 !important;
    }

    .row-hidden-cls {
        display: none;
    }

    .ant-table-row-selected {
        td {
            background: #fff !important;
        }
    }
`;

const SuiteName = styled.div`
    display: flex;
    width: 100%;
    flex-direction: row;
    gap: 8px;

    .suite-name-div {
        max-width: 100%;
    }

    .case-selected-count {
        flex-shrink: 0;
        padding: 2px 6px;
        background-color: #f0f0f0;
        border-radius: 10px;
        font-size: 12px;
        color: #595959;
    }
`;
const getSuiteNameColumn: any = (selectedkeys: any) => ({
    title: 'Test Suite名称',
    ellipsis: true,
    render(row: any) {
        const selectedRow = selectedkeys[row.id];

        return (
            <SuiteName>
                <div className="suite-name-div">{row.name}</div>
                <div className="case-selected-count">{`${selectedRow?.length || 0}/${
                    row.case_list?.length || 0
                }`}</div>
            </SuiteName>
        );
    },
});

const JobTableForSuite: React.FC<any> = (props) => {
    const {
        selectedRowKeys,
        setSelectedRowKeys,
        suiteList,
        suite_show_type,
        loading,
        suiteCaseSearchKey,
    } = props;

    const [expandedRowKeys, setExpandedRowKeys] = React.useState<any>([]);

    const columns = [getSuiteNameColumn(selectedRowKeys)];

    const handleExpand = (expanded: any, record: any, e: any, onExpand: any) => {
        const id: any = record.id + '';
        if (expanded) setExpandedRowKeys(expandedRowKeys.filter((i: any) => i !== id));
        else setExpandedRowKeys(expandedRowKeys.concat([id]));
        onExpand(record, e);
    };

    const filterIds = React.useMemo(() => {
        const searchWord = suiteCaseSearchKey.toLowerCase();
        const filters = suiteList?.reduce((pre: any, cur: any) => {
            const { name, case_list } = cur;

            const lists = case_list.filter((ctx: any) =>
                ctx.name.toLowerCase().includes(searchWord),
            );

            if (name.toLowerCase().includes(searchWord) || lists.length) {
                return pre.concat(cur);
            }
            return pre;
        }, []);
        return filters.map((ctx: any) => ctx.id);
    }, [suiteCaseSearchKey, suiteList]);

    if (filterIds?.length === 0) return <Table loading={loading} dataSource={[]} />;

    return (
        <SuiteTableCls
            rowKey={'id'}
            size="small"
            rowClassName={(record: any) => {
                return clsx(
                    'active-suite-table-row',
                    expandedRowKeys.includes(record.id) && 'show_left_border',
                    !filterIds.includes(record.id) && 'row-hidden-cls',
                );
            }}
            loading={loading}
            columns={columns}
            dataSource={loading ? [] : suiteList || []}
            pagination={false}
            scroll={{ y: 440 }}
            rowSelection={{
                selectedRowKeys: Object.keys(selectedRowKeys).map((ctx: any) => +ctx),
                getCheckboxProps: (record: any) => {
                    const allCasesLength = record.case_list.length;
                    const selectedRow = selectedRowKeys?.[record.id];
                    const selectedCasesLength = selectedRow?.length;

                    return {
                        checked: allCasesLength === selectedCasesLength,
                        indeterminate:
                            selectedCasesLength > 0 && selectedCasesLength < allCasesLength,
                    };
                },
                onChange: ($xx: any, keys: any) => {
                    setSelectedRowKeys(
                        keys?.reduce((pre: any, cur: any) => {
                            const { id: test_suite_id, case_list } = cur;
                            pre[test_suite_id] = case_list?.map((ctx: any) => ctx.id) || [];
                            return pre;
                        }, {}),
                    );
                },
            }}
            expandable={{
                expandedRowKeys,
                onExpandedRowsChange(keys: any) {
                    setExpandedRowKeys(keys);
                },
                expandedRowClassName(record) {
                    const { id: test_suite_id } = record as any;
                    const hasSuite = filterIds.includes(test_suite_id);
                    return !hasSuite ? 'row-hidden-cls' : '';
                },
                expandedRowRender(record: any) {
                    return (
                        <CaseTable
                            suite_show_type={suite_show_type}
                            setSelectedRowKeys={setSelectedRowKeys}
                            selectedRowKeys={selectedRowKeys}
                            suiteCaseSearchKey={suiteCaseSearchKey}
                            {...record}
                        />
                    );
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
