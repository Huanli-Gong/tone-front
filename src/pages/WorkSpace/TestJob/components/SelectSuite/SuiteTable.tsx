/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from 'react';
import { Button, Table, Card, Space, Checkbox, Row, Tag, Tooltip, Typography } from 'antd';

import SettingDrawer from '@/pages/WorkSpace/TestJob/components/SuiteSelectDrawer';
import { CaretDownFilled, CaretRightFilled } from '@ant-design/icons';
import { useIntl, FormattedMessage } from 'umi';
import styles from './style.less';

import CaseTable from './CaseTable';
import lodash from 'lodash';
import { v4 as uuid } from 'uuid';
import { ColumnEllipsisText } from '@/components/ColumnComponents';

import { ScriptColumn, VarColumn, getServerColumn } from './FieldsSet';
import clsx from 'classnames';
const optionWidth = 100;

const TestJobSuiteTable: React.FC<Record<string, any>> = (props) => {
    const {
        dataSource,
        onDataSourceChange,
        width,
        disabled,
        run_mode,
        contrl,
        control,
        server_type,
        test_type,
        checked,
    } = props;
    const { formatMessage } = useIntl();

    const settingDrawerRef: any = useRef(null);
    const [hasCases, setHasCases] = useState(true);

    const priorityTitle = formatMessage({ id: 'select.suite.priority' });

    const [selectedSuiteKeys, setSelectedSuiteKeys] = useState<any[]>([]);
    const [selectedCaseKeys, setSelectedCaseKeys] = useState<any[]>([]);
    const [selectedCaseObj, setSelectedCaseObj] = useState<any>({});

    const [caseKeyList, setCaseKeyList] = useState<any>([]);
    const [caseKeyListObj, setCaseKeyListObj] = useState<any>({});
    const [indeterminateSuite, setIndeterminateSuite] = useState<boolean>(false);
    const [suiteAll, setSuiteAll] = useState<boolean>(false);

    const [expandedRowKeys, setExpandedRowKeys] = useState<any>([]);
    const [caseAll, setCaseAll] = useState<boolean>(false);
    const [indeterminateCase, setIndeterminateCase] = useState<boolean>(false);

    const onSelectSuite = (e: any) => {
        const check = e.target.checked;
        setSuiteAll(check);
        setCaseAll(false);
        setIndeterminateSuite(false);
        setSelectedCaseObj({});
        if (check) {
            const checkSuites = dataSource.map((i: any) => i.id + '');
            setSelectedSuiteKeys(checkSuites);
            setExpandedRowKeys(checkSuites);
        } else {
            setSelectedSuiteKeys([]);
        }
    };

    const onRemoveSuite = (key: string) => {
        onDataSourceChange(
            dataSource.filter((item: any) => item.id !== key),
            run_mode,
        );
    };

    const onRemove = (key: string) => {
        const list = dataSource.filter((item: any) => {
            const test_case_list = item.test_case_list.filter((el: any) => {
                if (key !== el.id) return el;
            });
            if (test_case_list.length > 0) {
                const obj = item;
                obj.test_case_list = test_case_list;
                return obj;
            }
        });
        onDataSourceChange(list, run_mode);
    };

    const openSuite = (index: number, row: any) => settingDrawerRef.current?.show('suite', row);

    const openCase = (index: number, row: any) => settingDrawerRef.current?.show('case', row);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const columnsInner = [
        {
            title: 'Test Conf',
            dataIndex: 'title',
            ellipsis: {
                shwoTitle: false,
            },
            // fixed: 'left',
            render: (_: any) => (
                <ColumnEllipsisText ellipsis={{ tooltip: true }}>{_ || '-'}</ColumnEllipsisText>
            ),
        },
        getServerColumn({
            key: 'server',
            width: 200,
            title: <FormattedMessage id="select.suite.the.server" />,
            run_mode,
        }),

        {
            title: <FormattedMessage id="select.suite.table.timeout" />,
            dataIndex: 'timeout',
            width: 120,
        },
        {
            title: 'Repeat',
            dataIndex: 'repeat',
            width: 80,
        },
        checked &&
            'reboot' in contrl && {
                title: <FormattedMessage id="select.suite.restart" />,
                dataIndex: 'reboot',
                render: (_: any, row: any) =>
                    formatMessage({ id: `operation.${row.need_reboot ? 'yes' : 'no'}` }),
                width: 80,
            },
        checked &&
            'script' in contrl && {
                title: <FormattedMessage id="select.suite.script" />,
                width: 80,
                dataIndex: 'script',
                render: (_: any, row: any) => {
                    return <ScriptColumn {...row} />;
                },
            },
        checked &&
            'variable' in contrl && {
                title: <FormattedMessage id="select.suite.variable" />,
                dataIndex: 'variable',
                width: 80,
                render(_: any, row: any) {
                    return <VarColumn {...row} />;
                },
            },
        {
            title: <FormattedMessage id="select.suite.priority" />,
            dataIndex: 'priority',
            width: 120,
        },
        {
            title: <FormattedMessage id="Table.columns.operation" />,
            dataIndex: 'operation',
            width: optionWidth,
            // fixed: 'right',
            render: (_: any, row: any, index: number) => {
                return (
                    !disabled && (
                        <Space>
                            <Typography.Link onClick={() => openCase(index, row)}>
                                <FormattedMessage id="select.suite.config" />
                            </Typography.Link>
                            <Typography.Link onClick={() => onRemove(row.id)}>移除</Typography.Link>
                        </Space>
                    )
                );
            },
        },
    ];
    const columnsOutter = [
        {
            title: 'Test Suite',
            dataIndex: 'title',
            // fixed: 'left',
            ellipsis: {
                shwoTitle: false,
            },
            render: (_: any) => (
                <ColumnEllipsisText ellipsis={{ tooltip: true }}>{_ || '-'}</ColumnEllipsisText>
            ),
        },
        checked && {
            title: '参数',
            width: 280,
            ellipsis: {
                showTitle: false,
            },
            render(record: any) {
                const { need_reboot, priority } = record;

                return [
                    'reboot' in contrl && (
                        <Tag style={{ border: 'none', backgroundColor: '#F5F5F5' }}>
                            重启：
                            {formatMessage({
                                id: `operation.${need_reboot ? 'yes' : 'no'}`,
                            })}
                        </Tag>
                    ),
                    'script' in contrl && <ScriptColumn {...record} />,
                    <Tag style={{ border: 'none', backgroundColor: '#F5F5F5' }}>
                        {priorityTitle}：{priority}
                    </Tag>,
                ];
            },
        },
        {
            title: formatMessage({ id: 'Table.columns.operation' }),
            width: optionWidth,
            dataIndex: 'operation',
            // fixed: 'right',
            render: (_: any, row: any, index: number) => {
                return (
                    !disabled && (
                        <Space>
                            {checked && (
                                <Typography.Link onClick={() => openSuite(index, row)}>
                                    <FormattedMessage id="select.suite.config" />
                                </Typography.Link>
                            )}
                            <Typography.Link onClick={() => onRemoveSuite(row.id)}>
                                移除
                            </Typography.Link>
                        </Space>
                    )
                );
            },
        },
    ];

    const rowSelectionSuite = {
        selectedRowKeys: selectedSuiteKeys,
        onChange: (selectedRowKeys: any) => {
            setSelectedSuiteKeys(selectedRowKeys);
            setIndeterminateSuite(
                !!selectedRowKeys.length && selectedRowKeys.length < dataSource.length,
            );
            setSuiteAll(selectedRowKeys.length == dataSource.length);
        },
        getCheckboxProps: () => ({
            disabled: selectedCaseKeys.length > 0,
        }),
    };

    const setSelectedCaseKeysFn = (obj: any) => {
        let selectedCaseObjCopy = lodash.cloneDeep(selectedCaseObj) || {};
        selectedCaseObjCopy = { ...selectedCaseObjCopy, ...obj };
        setSelectedCaseObj(selectedCaseObjCopy);
    };

    useEffect(() => {
        let selectedRowKeys: number[] = [];
        Object.values(selectedCaseObj).forEach((itemArr: any) => {
            selectedRowKeys = selectedRowKeys.concat(itemArr);
        });
        const len = caseKeyList.length;
        setIndeterminateCase(!!selectedRowKeys.length && selectedRowKeys.length < len);
        setCaseAll(selectedRowKeys.length == len);
        setSelectedCaseKeys(selectedRowKeys);
    }, [selectedCaseObj]);

    useEffect(() => {
        const newSelectCaseObj: any = {};
        Object.keys(selectedCaseObj).forEach((key: any) => {
            if (caseKeyListObj[key]) {
                const list = selectedCaseObj[key].filter((item: any) => {
                    if (caseKeyList.indexOf(item) > -1) return item;
                });
                newSelectCaseObj[key] = list;
            }
        });
        setSelectedCaseObj(newSelectCaseObj);
    }, [caseKeyList]);

    const onSelectCase = (e: any) => {
        const check = e.target.checked;
        setSuiteAll(false);
        setSelectedSuiteKeys([]);
        if (check) {
            setSelectedCaseObj(caseKeyListObj);
            setExpandedRowKeys(dataSource.map((i: any) => i.id + ''));
        } else {
            setSelectedCaseObj({});
        }
    };

    const caseBentch = () => {
        let list: any = [];
        dataSource.map((el: any) => {
            selectedCaseKeys.map((item: any) => {
                list = list.concat(el.test_case_list.filter((c: any) => c.id == item));
            });
        });
        settingDrawerRef.current?.show('case', list);
    };

    const suiteBentch = () => {
        const dataList: any = [];
        dataSource.forEach((el: any) => {
            selectedSuiteKeys.map((item: any) => {
                if (el.id == item) dataList.push(el);
            });
        });
        settingDrawerRef.current?.show('suite', dataList);
    };

    useEffect(() => {
        let caseKeysList: any = [];
        const caseKeysListObj: any = {};
        dataSource.forEach((item: any) => {
            caseKeysList = caseKeysList.concat(item.test_case_list.map((el: any) => el.id + ''));
            caseKeysListObj[item.id] = item.test_case_list.map((el: any) => el.id + '');
        });
        setCaseKeyList(caseKeysList);
        setCaseKeyListObj(caseKeysListObj);
    }, [width, disabled, dataSource]);

    const handleBatchSetting = () => {
        if (selectedSuiteKeys.length === 0 && selectedCaseKeys.length === 0) {
            setHasCases(false);
            return;
        }

        if (selectedSuiteKeys.length > 0) suiteBentch();
        if (selectedCaseKeys.length > 0) caseBentch();

        return setHasCases(true);
    };

    const handleOnExpand = (expanded: any, record: any, e: any, onExpand: any) => {
        const id: any = record.id + '';
        if (expanded) setExpandedRowKeys(expandedRowKeys.filter((i: any) => i !== id));
        else setExpandedRowKeys(expandedRowKeys.concat([id]));
        onExpand(record, e);
    };

    const handleLeaveSettingBtn = () => {
        setHasCases(true);
    };

    const hanldeSettingOk = () => {
        setSelectedCaseObj({});
        setSelectedSuiteKeys([]);
        setSuiteAll(false);
        setCaseAll(false);
        setIndeterminateSuite(false);
    };

    const [columnsChange, setColumnsChange] = React.useState(uuid());

    return (
        <div
            style={
                run_mode === 'standalone'
                    ? { marginBottom: 10, position: 'relative' }
                    : { position: 'relative' }
            }
        >
            <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
                <span className={styles.title}>
                    {formatMessage({ id: `select.suite.${run_mode}` })}
                </span>
            </Row>
            {!disabled && (
                <Row
                    justify="space-between"
                    align="middle"
                    className={styles.batch_setting_table_bar}
                >
                    <Space>
                        <Checkbox
                            indeterminate={indeterminateSuite}
                            checked={suiteAll}
                            onChange={onSelectSuite}
                            disabled={!checked}
                        >
                            <FormattedMessage id="select.suite.selectAll.suites" />
                        </Checkbox>
                        <Checkbox
                            indeterminate={indeterminateCase}
                            checked={caseAll}
                            onChange={onSelectCase}
                        >
                            <FormattedMessage id="select.suite.selectAll.conf" />
                        </Checkbox>
                    </Space>
                    <Tooltip
                        title={
                            <span onClick={() => setHasCases(true)} style={{ cursor: 'pointer' }}>
                                <FormattedMessage id="select.suite.select.suite/conf" />
                            </span>
                        }
                        open={!hasCases}
                    >
                        <Button
                            type="primary"
                            onClick={handleBatchSetting}
                            onMouseLeave={handleLeaveSettingBtn}
                        >
                            <FormattedMessage id="select.suite.batch.config" />
                        </Button>
                    </Tooltip>
                </Row>
            )}
            <Card bodyStyle={{ width: '100%', padding: 0 }}>
                <Table
                    style={{ width: width - 2 }}
                    rowSelection={checked ? rowSelectionSuite : undefined}
                    // showHeader={checked}
                    columns={columnsOutter.filter(Boolean) as any}
                    pagination={false}
                    className={styles.suite_table_loading}
                    rowClassName={(record) => {
                        return clsx(
                            'active-suite-table-row',
                            expandedRowKeys.includes(record.id) && 'show_left_border',
                        );
                    }}
                    // scroll={checked ? { x: innerScrollX } : undefined}
                    size="small"
                    rowKey={(record) => record.id + ''}
                    dataSource={dataSource}
                    expandable={{
                        expandedRowKeys,
                        expandedRowRender: (record: any) => (
                            <CaseTable
                                // scroll={checked ? { x: innerScrollX } : undefined}
                                record={record}
                                refreshDeps={[checked, contrl, disabled, columnsChange, dataSource]}
                                disabled={disabled}
                                selectedCaseObj={selectedCaseObj}
                                columnsInner={columnsInner.filter(Boolean)}
                                checked={checked}
                                contrl={contrl}
                                columnsChange={columnsChange}
                                onColumnsChange={() => setColumnsChange(uuid())}
                                selectedSuiteKeys={selectedSuiteKeys}
                                setSelectedCaseKeysFn={setSelectedCaseKeysFn}
                            />
                        ),
                        /* columnTitle: (
                            <Row style={{ width: '100%' }} justify={'center'} align={'middle'}>
                                {expandedRowKeys?.length ? (
                                    <CaretDownFilled onClick={(e) => setExpandedRowKeys([])} />
                                ) : (
                                    <CaretRightFilled
                                        onClick={(e) =>
                                            setExpandedRowKeys(
                                                dataSource?.map((item: any) => `${item.id}`),
                                            )
                                        }
                                    />
                                )}
                            </Row>
                        ), */
                        expandIcon: ({ expanded, onExpand, record }) =>
                            expanded ? (
                                <CaretDownFilled
                                    onClick={(e) => handleOnExpand(expanded, record, e, onExpand)}
                                />
                            ) : (
                                <CaretRightFilled
                                    onClick={(e) => handleOnExpand(expanded, record, e, onExpand)}
                                />
                            ),
                    }}
                />
            </Card>

            <SettingDrawer
                ref={settingDrawerRef}
                test_type={test_type}
                server_type={server_type}
                run_mode={run_mode}
                contrl={control}
                checked={checked}
                onDataSourceChange={onDataSourceChange}
                testSuiteData={dataSource}
                onOk={hanldeSettingOk}
            />
        </div>
    );
};

export default TestJobSuiteTable;
