import { Button, Checkbox, Input, Tooltip } from 'antd';
import React from 'react';
import styled from 'styled-components';
import JobTableForSuite from './TableForSuite';
import { useIntl } from 'umi';
import { useTestJobContext } from '../provider';
import { SuiteTableProvider } from './provider';
import ServerSettingDrawer from './ServerSettingDrawer';

export const TablesCardBody = styled.div`
    width: 100%;
    background-color: #ffffff;
    border-radius: 4px;

    .card-body-nav {
        width: 100%;
        height: 40px;
        display: flex;
        align-items: center;
        font-weight: 500;
        font-size: 14px;
        color: rgba(0, 0, 0, 0.85);
    }

    .card-body-container {
        display: flex;
        flex-direction: column;
        gap: 16px;
    }

    .select-setting-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .setting-bar-left {
            display: flex;
            gap: 16px;
            height: 32px;
            align-items: center;
        }

        .search-inp {
            width: 360px;
        }

        .suite-table-nav {
            height: 48px;
            padding: 0 16px;
            display: flex;
            align-items: center;
            gap: 16px;

            .table-select-count {
                display: flex;
                gap: 8px;
                align-items: center;
                font-size: 14px;
                color: #8c8c8c;

                span {
                    font-weight: 500;
                    font-size: 14px;
                    color: rgba(0, 0, 0, 0.85);
                }
            }
        }
    }
    .card-suite-body {
        background-color: #ffffff;
        border: 1px solid #d9d9d9;
        border-radius: 4px;
        display: flex;
        flex-direction: column;

        .card-suite-body-nav {
            height: 64px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
    }

    .show_left_border td:first-child {
        border-left: 2px solid #243cb6;
    }

    .ant-table-expanded-row.ant-table-expanded-row-level-1 > td {
        border-left: 2px solid #243cb6;
    }
`;

const SuiteTables: React.ForwardRefRenderFunction<any, any> = (props, ref) => {
    const { dataSource, run_mode, templSelectedRows, setDataSource, loading } = props;
    const intl = useIntl();

    const { jobTypeDetails, suiteSelectedKeys, setSuiteSelectedKeys } = useTestJobContext();
    const { suite_show_type } = jobTypeDetails;

    const [hasCases, setHasCases] = React.useState(true);
    const [selectedRowKeys, setSelectedRowKeys] = React.useState<any>([]);
    const [showSelectedOnly, setShowSelectedOnly] = React.useState(false);
    const [suiteCaseSearchKey, setSuiCaseSearchKey] = React.useState('');
    const [expandedRowKeys, setExpandedRowKeys] = React.useState<any>([]);

    const drawerRef = React.useRef<any>(null);

    React.useImperativeHandle(ref, () => ({
        rest() {
            setSelectedRowKeys([]);
            setShowSelectedOnly(false);
            setSuiteSelectedKeys('');
            setExpandedRowKeys([]);
        },
    }));

    React.useEffect(() => {
        if (!dataSource?.length) {
            return;
        }
        const params = {
            ...suiteSelectedKeys,
            [run_mode]: dataSource?.reduce((pre: any, cur: any) => {
                const suiteObj = selectedRowKeys.find((ctx: any) => ctx.id === cur.id);
                if (suiteObj) {
                    const { test_case_list } = suiteObj;
                    const caseIds = test_case_list.map((ctx: any) => ctx.id);
                    return pre.concat({
                        ...cur,
                        test_case_list: cur.test_case_list.filter((ctx: any) =>
                            caseIds.includes(ctx.id),
                        ),
                    });
                }

                return pre;
            }, []),
        };
        setSuiteSelectedKeys(params);
    }, [selectedRowKeys, dataSource, run_mode]);

    React.useEffect(() => {
        if (!templSelectedRows?.length) return;
        setSelectedRowKeys(templSelectedRows);
    }, [templSelectedRows]);

    const slelectedCasesLength = React.useMemo(() => {
        return selectedRowKeys.reduce((pre: any, cur: any) => {
            const { test_case_list } = cur;
            return (pre += test_case_list?.length);
        }, 0);
    }, [selectedRowKeys]);

    React.useEffect(() => {
        setHasCases(!selectedRowKeys?.length);
    }, [selectedRowKeys]);

    const handleClickSettingBtn = () => {
        if (selectedRowKeys.length) drawerRef.current.show(selectedRowKeys);
    };

    return (
        <SuiteTableProvider.Provider
            value={{
                selectedRowKeys,
                setSelectedRowKeys,
                expandedRowKeys,
                setExpandedRowKeys,
                showSelectedOnly,
                suiteCaseSearchKey,
                settingDrawerRef: drawerRef,
                run_mode,
                setDataSource,
                loading,
            }}
        >
            <TablesCardBody className="">
                {run_mode && (
                    <div className="card-body-nav">
                        {intl.formatMessage({ id: `select.suite.${run_mode}` })}
                    </div>
                )}

                <div className="card-body-container">
                    <div className="select-setting-bar">
                        <div className="setting-bar-left">
                            <Input
                                className="search-inp"
                                placeholder={`支持搜索Test Suite/Test ${
                                    suite_show_type === 'case' ? 'Case' : 'Conf'
                                }`}
                                allowClear
                                value={suiteCaseSearchKey}
                                onChange={(e) => setSuiCaseSearchKey(e.target.value)}
                            />
                            <div className="suite-table-nav">
                                <div className="table-select-count">已选用例</div>
                                <div className="table-select-count">
                                    Test Suite数
                                    <span>{selectedRowKeys?.length || 0}</span>
                                </div>
                                {suite_show_type === 'conf' && (
                                    <div className="table-select-count">
                                        Test Conf数
                                        <span>{slelectedCasesLength || 0}</span>
                                    </div>
                                )}
                                {suite_show_type === 'case' && (
                                    <div className="table-select-count">
                                        Test Case数
                                        <span>{slelectedCasesLength || 0}</span>
                                    </div>
                                )}
                            </div>
                            <Checkbox
                                checked={showSelectedOnly}
                                onChange={(e) => setShowSelectedOnly(e.target.checked)}
                            >
                                仅显示已选用例
                            </Checkbox>
                        </div>
                        <Tooltip
                            title={
                                hasCases && (
                                    <span
                                        onClick={() => setHasCases(true)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        {intl.formatMessage({
                                            id: 'select.suite.select.suite/conf',
                                        })}
                                    </span>
                                )
                            }
                        >
                            <Button
                                type="primary"
                                onMouseLeave={() => setHasCases(true)}
                                onClick={handleClickSettingBtn}
                            >
                                批量配置 ({slelectedCasesLength || 0})
                            </Button>
                        </Tooltip>
                    </div>
                    <div className="card-suite-body">
                        <JobTableForSuite suiteList={dataSource} />
                    </div>
                </div>
            </TablesCardBody>
            <ServerSettingDrawer ref={drawerRef} />
        </SuiteTableProvider.Provider>
    );
};

export default React.forwardRef(SuiteTables);
