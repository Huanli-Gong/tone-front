/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
// import { ResizeHooksTable } from '@/utils/table.hooks';
import { Table } from 'antd';
import clsx from 'classnames';
import { CaseTableWrapper } from '../../SuiteTables/FieldSet';

export default (props: any) => {
    const {
        record,
        disabled,
        columnsInner,
        selectedSuiteKeys,
        setSelectedCaseKeysFn,
        selectedCaseObj,
        onColumnsChange,
        columnsChange,
        refreshDeps,
    } = props;
    const [selectedKeys, setSelectedKeys] = useState<number[]>([]);

    const rowSelectionCase = {
        selectedRowKeys: selectedKeys,
        onChange: (selectedRowKeys: any) => {
            setSelectedKeys(selectedRowKeys);
            setSelectedCaseKeysFn({ [record.id]: selectedRowKeys });
        },
        getCheckboxProps: () => ({
            disabled: selectedSuiteKeys.length > 0,
        }),
    };

    useEffect(() => {
        if (selectedCaseObj[record.id] !== selectedKeys)
            setSelectedKeys(selectedCaseObj[record.id] || []);
    }, [selectedCaseObj]);

    return (
        <CaseTableWrapper list={record?.test_case_list}>
            <Table
                // hasChange={columnsChange}
                scroll={{}}
                rowKey={($record: any) => $record.id + ''}
                // refreshDeps={refreshDeps}
                className={clsx('case-right-table')}
                rowSelection={!disabled ? rowSelectionCase : undefined}
                columns={columnsInner}
                // onColumnsChange={onColumnsChange}
                rowClassName="active-case-table-row"
                // name="ws-test-job-suite-inner"
                dataSource={record?.test_case_list || []}
                pagination={false}
            />
        </CaseTableWrapper>
    );
};
