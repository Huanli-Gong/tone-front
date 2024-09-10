/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import React, { useState, forwardRef, useImperativeHandle, useMemo } from 'react';
import { Drawer, Button, Form, Col, Row, Select, Input, Radio, Typography } from 'antd';
import styles from '../style.less';
import Owner from '@/components/Owner/index';
import { useLocation, useIntl, FormattedMessage } from 'umi';
import { useSuiteProvider } from '../../hooks';
import { QusetionIconTootip } from '@/components/Product';
import { requestCodeMessage } from '@/utils/utils';
import { addSuite, editSuite } from '../../service';
import { queryConfirm } from '@/pages/WorkSpace/JobTypeManage/services';
import DeleteTips from './DeleteTips';

const RadioForYesNoeGrop: React.FC<any> = ({ label, name, rules, disabled }) => {
    const { formatMessage } = useIntl();

    return (
        <Form.Item label={label} name={name} rules={rules}>
            <Radio.Group
                disabled={disabled}
                options={[
                    [1, 'yes'],
                    [0, 'no'],
                ].map((ctx: any) => {
                    const [value, key] = ctx;
                    return {
                        label: formatMessage({ id: `operation.${key}` }),
                        value,
                    };
                })}
            />
        </Form.Item>
    );
};

const LableForCallbackUrl: React.FC = () => {
    const form = Form.useFormInstance();
    const name = Form.useWatch('name', form);

    const [callbackUrl, setCallbackUrl] = React.useState('');

    React.useEffect(() => {
        setCallbackUrl(`${window.location.origin}/api/callback/updatecase/?testsuite=${name}`);
    }, [name]);

    if (!name) return <></>;

    return (
        <Col span={24}>
            <Form.Item label="回调地址">
                <Typography.Text copyable type="secondary">
                    {callbackUrl}
                </Typography.Text>
            </Form.Item>
        </Col>
    );
};

/**
 * @module 系统级
 * @description 新增、编辑suite级
 */
export default forwardRef(({ onOk, wsList }: any, ref: any) => {
    const { formatMessage } = useIntl();
    const { query }: any = useLocation();
    const testType = query.test_type || 'functional';

    const [form] = Form.useForm();
    const visibleRange = Form.useWatch('visible_range', form);
    const auto_update = Form.useWatch('auto_update', form);
    const has_conf = Form.useWatch('has_conf', form);

    const { domainList, runList, viewType } = useSuiteProvider();

    const [visible, setVisible] = useState(false);
    const [disable, setDisable] = useState(false);
    const [dataSource, setDataSource] = useState<any>({});

    const delTip = React.useRef<any>();

    const handleCancel = () => {
        setVisible(false);
        setDisable(false);
        form.resetFields();
        setDataSource({});
    };

    useImperativeHandle(ref, () => ({
        show: (t: any, d: any = {}) => {
            setVisible(true);
            setDisable(false);
            if (d && JSON.stringify(d) !== '{}') {
                setDataSource(d);
                const { visible_range, has_conf, auto_update } = d;
                const $params = {
                    ...d,
                    test_type: testType,
                    owner: d.owner_name,
                    certificated: d.certificated ? 1 : 0,
                    auto_update: auto_update ? 1 : 0,
                };

                if (!BUILD_APP_ENV) {
                    $params.visible_range = visible_range ? visible_range?.split(',') : undefined;
                }

                if (testType === 'functional') {
                    $params.has_conf = has_conf ? 1 : 0;
                }

                form.setFieldsValue($params);
            }
        },
        hide: handleCancel,
    }));

    const handleEditOK = async (val: any) => {
        if (!val.name || val.name.replace(/\s+/g, '') == '') {
            form.setFields([{ name: 'name', errors: [formatMessage({ id: 'please.enter' })] }]);
            return;
        }
        val.name = val.name.replace(/\s+/g, '');
        if (val.owner === dataSource.owner_name) val.owner = dataSource.owner;
        val.domain_list_str = val.domain_list_str.join();

        if (!BUILD_APP_ENV) {
            const { visible_range } = val;
            val.visible_range = visible_range?.toString();
        }

        setDisable(true);
        const { code, msg } = dataSource?.id
            ? await editSuite(dataSource?.id, val)
            : await addSuite(val);
        setDisable(false);

        if (code !== 200) return requestCodeMessage(code, msg);

        handleCancel();
        onOk?.();
    };

    const handleOk = async () => {
        if (disable) return;
        form.validateFields()
            .then(async (val) => {
                if (JSON.stringify(dataSource) !== '{}' && !BUILD_APP_ENV) {
                    const keys = form.getFieldValue('visible_range');
                    const nKeys = dataSource.visible_range || '';
                    const s = keys?.sort((a: string, b: string) => a.localeCompare(b)).toString();
                    const t = nKeys
                        .split(',')
                        .sort((a: string, b: string) => a.localeCompare(b))
                        .toString();

                    if (s !== t) {
                        setDisable(true);
                        const { code } = await queryConfirm({
                            flag: 'pass',
                            suite_id: dataSource.id,
                            visible_range: s,
                        });
                        if (code === 200)
                            return delTip.current?.show({
                                ...dataSource,
                                path: 'visible_range',
                                visible_range: s,
                            });
                    }
                }
                handleEditOK(val);
            })
            .catch((err) => {
                setDisable(false);
            });
    };

    const hanldFocus = () => {
        setDisable(false);
    };

    const title = useMemo(() => {
        const cur = JSON.stringify(dataSource) !== '{}' ? 'edit' : 'new';
        return formatMessage({ id: `TestSuite.${testType}.${cur}` });
    }, [testType, dataSource]);

    const buttonText = useMemo(() => {
        const cur = JSON.stringify(dataSource) !== '{}' ? 'update' : 'ok';
        return formatMessage({ id: `operation.${cur}` });
    }, []);

    return (
        <Drawer
            maskClosable={false}
            keyboard={false}
            className={styles.warp}
            forceRender
            destroyOnClose
            title={title}
            width={376}
            onClose={handleCancel}
            open={visible}
            bodyStyle={{ paddingBottom: 80 }}
            footer={
                <div style={{ textAlign: 'right' }}>
                    <Button onClick={handleCancel} style={{ marginRight: 8 }}>
                        <FormattedMessage id="operation.cancel" />
                    </Button>
                    <Button onClick={handleOk} loading={disable} type="primary" htmlType="submit">
                        {buttonText}
                    </Button>
                </div>
            }
        >
            <Form
                layout="vertical"
                form={form}
                /*hideRequiredMark*/
                initialValues={{
                    is_default: 1,
                    view_type: 'Type1',
                    visible_range: '*',
                    auto_update: 0,
                    has_conf: 1,
                    certificated: 0,
                    test_type: testType,
                }}
            >
                <Row gutter={16}>
                    <Col span={24}>
                        <Form.Item
                            name="name"
                            label="Test Suite"
                            rules={[
                                {
                                    required: true,
                                    validator(rule, value, callback) {
                                        if (value && value.replace(/\s+/g, '') !== '') {
                                            // 测试套件名称不能为空格
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(
                                            formatMessage({ id: 'please.enter' }),
                                        );
                                    },
                                },
                            ]}
                        >
                            <Input
                                autoComplete="off"
                                placeholder={formatMessage({ id: 'please.enter' })}
                                // onBlur={handleBlur} 配合debug需求，临时注释
                                onFocus={hanldFocus}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item
                            name="test_type"
                            label={<FormattedMessage id="TestSuite.test_type" />}
                            rules={[
                                { required: true, message: formatMessage({ id: 'please.select' }) },
                            ]}
                        >
                            <Select
                                placeholder={formatMessage({ id: 'please.select' })}
                                disabled
                                getPopupContainer={(node) => node.parentNode}
                            >
                                <Select.Option value="functional">
                                    <FormattedMessage id="functional.test" />
                                </Select.Option>
                                <Select.Option value="performance">
                                    <FormattedMessage id="performance.test" />
                                </Select.Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    {!BUILD_APP_ENV && (
                        <Col span={24}>
                            <Form.Item
                                name="visible_range"
                                label={
                                    <FormattedMessage id={`TestSuite.workspace_visible_range`} />
                                }
                                rules={[
                                    {
                                        required: true,
                                        validator(rule, value, callback) {
                                            if (!value)
                                                return Promise.reject(
                                                    formatMessage({
                                                        id: `TestSuite.workspace_visible_range.required`,
                                                    }),
                                                );
                                            return Promise.resolve();
                                        },
                                    },
                                ]}
                            >
                                <Select
                                    allowClear
                                    mode="multiple"
                                    placeholder={formatMessage({
                                        id: 'TestSuite.workspace_visible_range.placeholder',
                                    })}
                                    filterOption={(input, option: any) => {
                                        return (
                                            option?.show_name
                                                ?.toLowerCase()
                                                .indexOf(input?.toLowerCase()) >= 0
                                        );
                                    }}
                                    maxTagCount={'responsive'}
                                    onSelect={(val) => {
                                        if (val === '*')
                                            form.setFieldsValue({ visible_range: ['*'] });
                                    }}
                                    options={[
                                        {
                                            label: (
                                                <span>
                                                    *
                                                    <FormattedMessage
                                                        id={`TestSuite.workspace_visible_range_all`}
                                                    />
                                                </span>
                                            ),
                                            value: '*',
                                            show_name: '*',
                                        },
                                        ...(wsList || []).map((item: any) => ({
                                            show_name: item.show_name,
                                            disabled: visibleRange?.includes('*'),
                                            label: item.show_name,
                                            value: item.id,
                                        })),
                                    ]}
                                />
                            </Form.Item>
                        </Col>
                    )}

                    <Col span={24}>
                        <Form.Item
                            name="run_mode"
                            label={<FormattedMessage id="TestSuite.run_mode" />}
                            rules={[
                                { required: true, message: formatMessage({ id: 'please.select' }) },
                            ]}
                        >
                            <Select
                                placeholder={formatMessage({ id: 'please.select' })}
                                getPopupContainer={(node) => node.parentNode}
                                options={runList || []}
                                fieldNames={{ label: 'name', value: 'id' }}
                            />
                        </Form.Item>
                    </Col>
                    {query.test_type === 'performance' && (
                        <Col span={24}>
                            <Form.Item
                                name="view_type"
                                label={<FormattedMessage id="TestSuite.view_type" />}
                            >
                                <Select
                                    placeholder={formatMessage({ id: 'please.select' })}
                                    options={viewType || []}
                                    fieldNames={{ label: 'name', value: 'id' }}
                                />
                            </Form.Item>
                        </Col>
                    )}
                    <Col span={24}>
                        <Form.Item
                            name="domain_list_str"
                            label={<FormattedMessage id="TestSuite.domain" />}
                            rules={[
                                { required: true, message: formatMessage({ id: 'please.select' }) },
                            ]}
                        >
                            <Select
                                placeholder={formatMessage({ id: 'please.select' })}
                                mode="multiple"
                                getPopupContainer={(node) => node.parentNode}
                                filterOption={(input, option: any) => {
                                    return (
                                        option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                    );
                                }}
                                allowClear
                                fieldNames={{ label: 'name', value: 'id' }}
                                options={domainList || []}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Owner />
                    </Col>
                    <Col span={24}>
                        <RadioForYesNoeGrop
                            name="is_default"
                            label={
                                <QusetionIconTootip
                                    title={formatMessage({ id: 'TestSuite.default.case' })}
                                    desc={formatMessage({ id: 'TestSuite.auto.join.workspace' })}
                                />
                            }
                            rules={[
                                { required: true, message: formatMessage({ id: 'please.select' }) },
                            ]}
                        />
                    </Col>
                    <Col span={24}>
                        <RadioForYesNoeGrop
                            name="certificated"
                            label={
                                <QusetionIconTootip
                                    title={formatMessage({ id: 'TestSuite.is_certified' })}
                                    desc={formatMessage({ id: 'TestSuite.is_certified.ps' })}
                                />
                            }
                            rules={[
                                { required: true, message: formatMessage({ id: 'please.select' }) },
                            ]}
                        />
                    </Col>

                    {/* 是否有test Conf */}
                    {testType === 'functional' && (
                        <Col span={24}>
                            <RadioForYesNoeGrop
                                name="has_conf"
                                label={formatMessage({ id: 'TestSuite.has_conf' })}
                                /* label={
                                    <QusetionIconTootip
                                        title={formatMessage({ id: 'TestSuite.has_conf' })}
                                        desc={formatMessage({ id: 'TestSuite.has_conf.ps' })}
                                    />
                                } */
                                disabled={JSON.stringify(dataSource) !== '{}'}
                                rules={[
                                    {
                                        required: true,
                                        message: formatMessage({ id: 'please.select' }),
                                    },
                                ]}
                            />
                        </Col>
                    )}

                    <Col span={24}>
                        <Form.Item name="doc" label={<FormattedMessage id="TestSuite.desc" />}>
                            <Input.TextArea
                                rows={3}
                                placeholder={formatMessage({ id: 'TestSuite.please.enter.desc' })}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item
                            name="description"
                            label={<FormattedMessage id="TestSuite.remarks" />}
                        >
                            <Input.TextArea
                                rows={3}
                                placeholder={formatMessage({ id: 'please.enter' })}
                            />
                        </Form.Item>
                    </Col>
                    {testType === 'functional' && !has_conf && (
                        <>
                            <Col span={24}>
                                <RadioForYesNoeGrop
                                    name="auto_update"
                                    label={formatMessage({ id: 'TestSuite.auto_update' })}
                                    /* label={
                                <QusetionIconTootip
                                    title={formatMessage({ id: 'TestSuite.auto_update' })}
                                    desc={formatMessage({ id: 'TestSuite.auto_update.ps' })}
                                />
                            } */
                                    rules={[
                                        {
                                            required: true,
                                            message: formatMessage({ id: 'please.select' }),
                                        },
                                    ]}
                                />
                            </Col>
                            {/* 不区分测试类型 */}
                            {!!auto_update && <LableForCallbackUrl />}
                        </>
                    )}
                </Row>
            </Form>
            <DeleteTips
                ref={delTip}
                onOk={handleEditOK}
                onCancel={() => {
                    setDisable(false);
                }}
                okText={<FormattedMessage id="TestSuite.tips.okText" />}
            />
        </Drawer>
    );
});
