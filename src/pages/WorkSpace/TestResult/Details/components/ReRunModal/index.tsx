/* eslint-disable @typescript-eslint/no-unused-expressions */
import React, { forwardRef, useImperativeHandle, useState } from 'react';

import { Modal, Row, Form, Checkbox, Typography, Input } from 'antd';
import styled from 'styled-components';
import { useParams, FormattedMessage } from 'umi';
import { stringify } from 'querystring';
import { targetJump } from '@/utils/utils';
import SuiteTable from './SuiteTable';
import { getRerunTypeSuites } from '../../../services';

export const TablesCardBody = styled.div`
    width: 100%;
    background-color: #ffffff;
    border-radius: 4px;

    .card-body-nav {
        width: 100%;
        height: 40px;
        display: flex;
        align-items: center;
        padding: 0 24px;
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

const Content = styled(Modal)`
    .ant-modal-body {
        background-color: #f0f2f5;
        padding: 0;
    }

    .ant-form-item {
        margin-bottom: 0;
    }
`;

const ReRunModal: React.ForwardRefRenderFunction<any, any> = (props, ref) => {
    const { ws_id } = useParams<any>();

    const [form] = Form.useForm();
    const fail_case = Form.useWatch('fail_case', form);
    const suite = Form.useWatch('suite', form);

    const [visible, setVisible] = useState(false);
    const [source, setSource] = useState<any>(null);
    // 重跑选项之一
    const [reRunChecked, setReRunChecked] = useState(false);
    const [okLink, setOkLink] = React.useState<string | null>(null);

    const [selectedRowKeys, setSelectedRowKeys] = React.useState<any>({});
    const [showSelectedOnly, setShowSelectedOnly] = React.useState(false);
    const [suiteCaseSearchKey, setSuiCaseSearchKey] = React.useState('');
    const [suiteList, setSuiteList] = React.useState([]);
    const [loading, setLoading] = useState(false);

    const hanldeCancle = () => {
        setVisible(false);
        setReRunChecked(false);
        setSource(null);
        form.resetFields();
        setLoading(false);
        setSelectedRowKeys({});
        setSuiteList([]);
        setShowSelectedOnly(false);
        setSuiCaseSearchKey('');
    };

    const { suite_show_type } = source || {};

    const handelOk = async () => {
        try {
            const values = await form.validateFields();
            const obj: any = {
                suite_show_type,
            };

            Object.keys(values).forEach((key) => {
                if (values[key]) {
                    obj[key === 'fail_case' ? 'suite' : key] = key === 'fail_case' ? 'fail' : 1;
                }
            });

            if (['case', 'conf'].includes(suite_show_type)) {
                const case_ids = Object.entries(selectedRowKeys).reduce((pre: any, cur: any) => {
                    const [, case_list] = cur;
                    return pre.concat(case_list);
                }, []);
                if (case_ids?.length) {
                    obj.case_ids = case_ids.toString();
                }
            }

            const search = JSON.stringify(obj) !== '{}' ? `?${stringify(obj)}` : '';

            setOkLink(`/ws/${ws_id}/test_job/${source.id}/import${search}`);
            hanldeCancle();
        } catch (err) {
            console.log(err);
        }
    };

    const afterClose = () => {
        if (okLink) targetJump(okLink);
    };

    useImperativeHandle(ref, () => ({
        async show(_: any) {
            if (_) setSource(_);
            setVisible(true);
            setOkLink(null);

            const { id } = _;

            if (['case', 'conf'].includes(_.suite_show_type)) {
                setLoading(true);
                const { data, code } = await getRerunTypeSuites({
                    job_id: id,
                });
                setLoading(false);
                if (code !== 200) return;
                setSuiteList(data);
                setReRunChecked(true);
            }
        },
    }));

    const isCaseConfType = ['case', 'conf'].includes(suite_show_type);

    React.useEffect(() => {
        if (!isCaseConfType) {
            setReRunChecked(suite || fail_case);
            if (fail_case) form.setFieldsValue({ suite: false });
            else form.setFieldsValue({ inheriting_machine: false });

            if (suite) form.setFieldsValue({ fail_case: false });
            else form.setFieldsValue({ inheriting_machine: false });
        }
    }, [fail_case, suite]);

    const slelectedCasesLength = React.useMemo(() => {
        if (!selectedRowKeys) return;
        if (JSON.stringify(selectedRowKeys) === '{}') return;
        return Object.entries(selectedRowKeys).reduce((pre: any, cur: any) => {
            const [, case_list] = cur;
            return (pre += case_list?.length);
        }, 0);
    }, [selectedRowKeys]);

    return (
        <Content
            open={visible}
            destroyOnClose
            width={1000}
            title={<FormattedMessage id="operation.rerun" />}
            okText={<FormattedMessage id="operation.confirm" />}
            cancelText={<FormattedMessage id="operation.cancel" />}
            onOk={handelOk}
            onCancel={hanldeCancle}
            maskClosable={false}
            afterClose={afterClose}
        >
            <div
                style={{
                    backgroundColor: '#fff',
                    height: 66,
                    marginBottom: 10,
                    paddingLeft: 20,
                    gap: 32,
                    display: 'flex',
                    alignItems: 'center',
                }}
            >
                <span style={{ color: 'rgba(0,0,0,0.85)', fontWeight: 600, flexShrink: 0 }}>
                    <FormattedMessage id="ws.result.list.name" />
                </span>
                <div style={{ width: '100%' }}>{source?.name}</div>
            </div>

            <Row
                style={{
                    backgroundColor: '#fff',
                    flexDirection: 'column',
                    gap: 16,
                    padding: 16,
                }}
                justify={'start'}
                align={'top'}
            >
                {isCaseConfType && (
                    <TablesCardBody className="">
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
                                            <span>
                                                {Object.entries(selectedRowKeys)?.length || 0}
                                            </span>
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
                                        onChange={(e) => {
                                            const { checked } = e.target;
                                            setShowSelectedOnly(checked);
                                            if (checked) {
                                                setSelectedRowKeys(
                                                    suiteList?.reduce((pre: any, cur: any) => {
                                                        const { case_list, id: test_suite_id } =
                                                            cur;
                                                        const failCases = case_list?.filter(
                                                            (ctx: any) => ctx.state === 'fail',
                                                        );
                                                        if (failCases?.length) {
                                                            pre[test_suite_id] = failCases?.map(
                                                                (ctx: any) => ctx.id,
                                                            );
                                                            return pre;
                                                        }
                                                        return pre;
                                                    }, {}),
                                                );
                                            } else {
                                                setSelectedRowKeys({});
                                            }
                                        }}
                                    >
                                        全选失败用例
                                    </Checkbox>
                                </div>
                            </div>
                            <div className="card-suite-body">
                                <SuiteTable
                                    {...{
                                        suiteCaseSearchKey,
                                        selectedRowKeys,
                                        setSelectedRowKeys,
                                        suiteList: suiteList,
                                        suite_show_type,
                                        loading,
                                    }}
                                />
                            </div>
                        </div>
                    </TablesCardBody>
                )}

                <Form form={form} style={{ width: '100%' }}>
                    {!isCaseConfType && (
                        <Form.Item>
                            <Typography.Text strong>
                                <FormattedMessage id="ws.result.list.reRun.Modal.title" />
                            </Typography.Text>
                        </Form.Item>
                    )}
                    {!isCaseConfType && (
                        <Form.Item valuePropName="checked" name="suite">
                            <Checkbox>
                                <FormattedMessage id="ws.result.list.reRun.checked.suite" />
                            </Checkbox>
                        </Form.Item>
                    )}
                    {!isCaseConfType && source?.test_type === '功能测试' && (
                        <Form.Item valuePropName="checked" name="fail_case">
                            <Checkbox>
                                <FormattedMessage id="ws.result.list.reRun.checked.fail_case" />
                            </Checkbox>
                        </Form.Item>
                    )}
                    {!['pending', 'pending_q'].includes(source?.state) && (
                        <Form.Item valuePropName="checked" name="inheriting_machine">
                            <Checkbox disabled={!reRunChecked}>
                                <FormattedMessage
                                    id={`ws.result.list.reRun.checked.inheriting_machine`}
                                />
                            </Checkbox>
                        </Form.Item>
                    )}
                    <Form.Item valuePropName="checked" name="notice">
                        <Checkbox>
                            <FormattedMessage id="ws.result.list.reRun.checked.notice" />
                        </Checkbox>
                    </Form.Item>
                </Form>
            </Row>
        </Content>
    );
};

export default forwardRef(ReRunModal);
