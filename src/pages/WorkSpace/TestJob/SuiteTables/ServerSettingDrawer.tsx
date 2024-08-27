import { Button, Col, Drawer, Form, Input, Radio, Row, Select, Space } from 'antd';
import React from 'react';
import { AgentSelect } from '@/components/utils';
import { useIntl } from 'umi';
import { DispathTagSelect } from './FieldSet';
import { useTestJobContext } from '../provider';
import styled from 'styled-components';
import { useSuiteTableContext } from './provider';
import { checkIpAndSn } from '../components/SelectSuite/service';
import DeployModal from '@/pages/WorkSpace/DeviceManage/GroupManage/Standalone/Components/DeployModal';
import styles from '../components/SelectSuite/style.less';
import CaseConfServerSelect from './CaseConfServerSelect';

const BaseFormLayout = styled(Form)`
    .ant-form-item {
        margin-bottom: 8px;
    }
`;
const transData = ({
    server_radio_type,
    server_select_type,
    ip,
    server_tag_id,
    server_object_id,
    custom_ip,
    custom_channel,
    is_instance,
    ...rest
}: any) => rest;

const transValues = (values: any) => {
    const {
        ip,
        server_radio_type,
        server_select_type,
        server_tag_id,
        server_object_id,
        custom_ip,
        custom_channel,
        is_instance,
    } = values;

    if (server_radio_type !== 'pool') {
        return {
            server_radio_type,
            server_select_type,
            ip: custom_ip,
            custom_channel,
            custom_ip,
        };
    }
    if (server_select_type === 'server_tag_id') {
        return {
            server_radio_type,
            server_select_type,
            server_tag_id,
        };
    }
    if (server_select_type === 'random') {
        return { ip: undefined, server_radio_type, server_select_type };
    }

    const query: any = {
        server_object_id,
        ip,
        server_radio_type,
        server_select_type,
        is_instance,
    };

    if (server_select_type === 'instance') {
        query.is_instance = 1;
    }
    if (server_select_type === 'setting') {
        query.is_instance = 0;
    }

    return query;
};
const ServerSettingDrawer: React.ForwardRefRenderFunction<any, any> = (props, ref) => {
    const { formatMessage } = useIntl();
    const { jobTypeDetails } = useTestJobContext();
    const { suite_show_type, server_type } = jobTypeDetails;
    const { setDataSource, run_mode } = useSuiteTableContext();

    const [open, setOpen] = React.useState(false);
    const [record, setRecord] = React.useState<any>(undefined);
    const [loading, setLoading] = React.useState(false);

    const [form] = Form.useForm();

    const server_radio_type = Form.useWatch('server_radio_type', form);
    const server_select_type = Form.useWatch('server_select_type', form);
    const channel_type = Form.useWatch('custom_channel', form);

    const deployModal: any = React.useRef(null);

    // 部署回调
    const deployCallback = (info: any) => {
        // step1.Agent部署结果信息
        const { success_servers = [] } = info;
        const successIps = success_servers?.map((item: any) => item.ip);
        // step2.数据回填
        if (successIps?.length) {
            form.setFieldsValue({ custom_ip: successIps[0] });
        }
    };
    // 部署Agent
    const deployClick = (selectedRow: any) => {
        deployModal.current?.show({ ...selectedRow, detailData: selectedRow?.errors || [] });
    };

    // toneAgent校验失败的内容提示
    const ValidateIps: React.FC<any> = ({ data }) => (
        <span>
            <span>{data.msg?.join('')}</span>
            {!BUILD_APP_ENV && channel_type == 'toneagent' && (
                <span className={styles.btn_style} onClick={() => deployClick(data)}>
                    {formatMessage({ id: 'select.suite.deploy.toneagent' })}
                </span>
            )}
        </span>
    );

    React.useImperativeHandle(ref, () => ({
        show(row: any) {
            setOpen(true);
            setRecord(row);
            form.setFieldsValue(row);
        },
    }));

    const handleCancel = () => {
        setOpen(false);
        setRecord(undefined);
        form.resetFields();
    };

    const handleOk = async () => {
        if (loading) return;
        setLoading(true);
        const values = await form.validateFields();
        setLoading(false);
        const params = transValues(values);

        if (Object.prototype.toString.call(record) === '[object Array]') {
            // 批量操作
            setDataSource((source: any) => {
                return {
                    ...source,
                    [run_mode]: source[run_mode].reduce((pre: any, cur: any) => {
                        const { id } = cur;
                        const suiteObj = record.find((item: any) => item.id === id);

                        if (suiteObj) {
                            const { test_case_list } = suiteObj;
                            if (suite_show_type === 'conf') {
                                return pre.concat({
                                    ...cur,
                                    test_case_list: cur.test_case_list.reduce((p: any, c: any) => {
                                        const caseObj = test_case_list.find(
                                            (item: any) => item.id === c.id,
                                        );
                                        if (caseObj)
                                            return p.concat({ ...transData(c), ...params });
                                        return p.concat(c);
                                    }, []),
                                });
                            } else {
                                return pre.concat({ ...transData(cur), ...params });
                            }
                        }
                        return pre.concat(cur);
                    }, []),
                };
            });
        } else {
            if ('test_case_list' in record) {
                // suite 操作
                setDataSource((source: any) => {
                    return {
                        ...source,
                        [run_mode]: source[run_mode].reduce((pre: any, cur: any) => {
                            if (cur.id === record.id) {
                                if (suite_show_type === 'conf') {
                                    return pre.concat({
                                        ...cur,
                                        test_case_list: cur.test_case_list.map((ctx: any) => ({
                                            ...transData(ctx),
                                            ...params,
                                        })),
                                    });
                                } else {
                                    return pre.concat({ ...transData(cur), ...params });
                                }
                            }

                            return pre.concat(cur);
                        }, []),
                    };
                });
            } else {
                // case 操作
                setDataSource((source: any) => {
                    return {
                        ...source,
                        [run_mode]: source[run_mode].reduce((pre: any, cur: any) => {
                            const { id, test_case_list } = cur;
                            return pre.concat({
                                ...cur,
                                test_case_list: test_case_list.reduce((p: any, c: any) => {
                                    if (c.id === record.id) {
                                        return p.concat({
                                            ...transData(c),
                                            ...params,
                                        });
                                    }
                                    return p.concat(c);
                                }, []),
                            });
                        }, []),
                    };
                });
            }
        }
        handleCancel();
    };

    return (
        <Drawer
            title={'配置机器'}
            open={open}
            onClose={handleCancel}
            destroyOnClose
            width={480}
            footer={
                <Row justify={'end'} align={'middle'}>
                    <Space>
                        <Button onClick={handleCancel}>取消</Button>
                        <Button type="primary" onClick={handleOk}>
                            确定
                        </Button>
                    </Space>
                </Row>
            }
        >
            <BaseFormLayout
                form={form}
                layout="vertical"
                initialValues={{ server_radio_type: 'pool', server_select_type: 'random' }}
            >
                <Form.Item name="server_radio_type">
                    <Radio.Group
                        options={
                            [
                                { value: 'pool', label: '机器池' },
                                server_type !== 'aliyun' && {
                                    value: 'custom',
                                    label: '自持有机器',
                                },
                            ].filter(Boolean) as any
                        }
                    />
                </Form.Item>

                {server_radio_type === 'pool' ? (
                    <Row gutter={8}>
                        <Col span={8}>
                            <Form.Item name="server_select_type" noStyle>
                                <Select
                                    style={{ width: '100%' }}
                                    options={
                                        [
                                            {
                                                value: 'random',
                                                label: formatMessage({ id: 'select.suite.random' }),
                                            },
                                            server_type === 'aliyun' &&
                                                run_mode === 'standalone' && {
                                                    value: 'instance',
                                                    label: formatMessage({
                                                        id: 'select.suite.instance',
                                                    }),
                                                },
                                            server_type === 'aliyun' &&
                                                run_mode === 'standalone' && {
                                                    value: 'setting',
                                                    label: formatMessage({
                                                        id: 'select.suite.setting',
                                                    }),
                                                },
                                            !(
                                                server_type == 'aliyun' && run_mode === 'standalone'
                                            ) && {
                                                value: 'server_object_id',
                                                label: formatMessage({
                                                    id: 'select.suite.server_object_id',
                                                }),
                                            },
                                            {
                                                value: 'server_tag_id',
                                                label: formatMessage({
                                                    id: 'select.suite.server_tag_id',
                                                }),
                                            },
                                        ].filter(Boolean) as any
                                    }
                                />
                            </Form.Item>
                        </Col>
                        <Col span={16}>
                            {['server_object_id', 'instance', 'setting'].includes(
                                server_select_type,
                            ) && <CaseConfServerSelect />}
                            {server_select_type === 'random' && (
                                <Input
                                    title={formatMessage({
                                        id: 'select.suite.randomly.schedule',
                                    })}
                                    style={{ width: '100%' }}
                                    autoComplete="off"
                                    disabled={true}
                                    placeholder={formatMessage({
                                        id: 'select.suite.randomly.schedule',
                                    })}
                                />
                            )}

                            {server_select_type === 'server_tag_id' && <DispathTagSelect />}
                        </Col>
                    </Row>
                ) : (
                    <Space direction="vertical" size={8} style={{ width: '100%' }}>
                        <Form.Item
                            name="custom_channel"
                            rules={[
                                {
                                    required: true,
                                    message: formatMessage({ id: 'select.suite.custom_channel' }),
                                },
                            ]}
                        >
                            <AgentSelect
                                placeholder={formatMessage({ id: 'select.suite.agent.select' })}
                            />
                        </Form.Item>

                        <Form.Item
                            name="custom_ip"
                            style={{ width: '100%' }}
                            rules={[
                                {
                                    required: true,
                                    message: formatMessage({ id: 'select.suite.custom_ip' }),
                                },
                                {
                                    async validator(rule, value) {
                                        if (!value)
                                            return Promise.resolve(
                                                formatMessage({ id: 'select.suite.custom_ip' }),
                                            );
                                        if (!channel_type)
                                            return Promise.reject(
                                                formatMessage({
                                                    id: 'select.suite.custom_channel',
                                                }),
                                            );
                                        setLoading(true);
                                        // 接口校验
                                        const { code, msg } =
                                            (await checkIpAndSn({ ip: value, channel_type })) || {};
                                        setLoading(false);
                                        if (code !== 200) {
                                            return Promise.reject(
                                                <ValidateIps data={{ msg, errors: [value] }} />,
                                            );
                                        }
                                        Promise.resolve();
                                        return;
                                    },
                                },
                            ]}
                        >
                            <Input
                                allowClear
                                placeholder={`${formatMessage({ id: 'select.suite.enter.ip' })}${
                                    !BUILD_APP_ENV ? '/SN' : ''
                                }`}
                                autoComplete="off"
                            />
                        </Form.Item>
                    </Space>
                )}
                <DeployModal ref={deployModal} callback={deployCallback} />
            </BaseFormLayout>
        </Drawer>
    );
};

export default React.forwardRef(ServerSettingDrawer);
