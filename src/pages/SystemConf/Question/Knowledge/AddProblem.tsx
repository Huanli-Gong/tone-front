import { DeleteOutlined } from '@ant-design/icons';
import {
    Drawer,
    Form,
    Space,
    Button,
    Input,
    Row,
    Col,
    Typography,
    message,
    InputNumber,
} from 'antd';
import React from 'react';
import { FormattedMessage, useIntl } from 'umi';
import { postProblem, putProblem } from './services';

import styled from 'styled-components';

const FormListRow = styled(Row)`
    .ant-form-item {
        margin-bottom: 8px;
    }
`;

const AddReasonDrawer: React.ForwardRefRenderFunction<AnyType, AnyType> = (props, ref) => {
    const { onOk } = props;

    const { formatMessage } = useIntl();

    const [open, setOpen] = React.useState(false);
    const [fetching, setFetching] = React.useState(false);
    const [source, setSource] = React.useState<any>();

    const [keywordInput, setKeywordInput] = React.useState<string>();
    const [form] = Form.useForm();

    React.useImperativeHandle(ref, () => ({
        show(row: any) {
            setOpen(true);
            if (row) {
                setSource(row);
                form.setFieldsValue(row);
            }
        },
    }));

    const handleCancel = () => {
        form.resetFields();
        setOpen(false);
        setSource(undefined);
        setKeywordInput(undefined);
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            if (fetching) return;
            setFetching(true);
            const { code, msg } = !source
                ? await postProblem(values)
                : await putProblem({ problem_id: source?.id, ...values });
            setFetching(false);

            if (code !== 200) {
                form.setFields([{ name: 'problem', errors: [msg] }]);
                return;
            }

            message.success(formatMessage({ id: 'operation.success' }));
            onOk?.();
            handleCancel();
        } catch (err) {}
    };

    const handleAddKeyword = () => {
        keywordInput &&
            form.setFields([
                {
                    name: 'keyword',
                    value: (form.getFieldValue('keyword') || []).concat(keywordInput),
                },
            ]);
        setKeywordInput(undefined);
    };

    return (
        <Drawer
            open={open}
            maskClosable={false}
            forceRender={true}
            keyboard={false}
            destroyOnClose
            onClose={handleCancel}
            title={!!source ? `编辑问题` : '新建问题'}
            width={600}
            footer={
                <div style={{ textAlign: 'right' }}>
                    <Space>
                        <Button onClick={handleCancel}>
                            <FormattedMessage id="operation.cancel" />
                        </Button>
                        <Button type="primary" disabled={fetching} onClick={handleOk}>
                            {!!source ? (
                                <FormattedMessage id="operation.update" />
                            ) : (
                                <FormattedMessage id="operation.ok" />
                            )}
                        </Button>
                    </Space>
                </div>
            }
        >
            <Form form={form} layout="vertical" initialValues={{ level: 1 }}>
                <Form.Item
                    name="problem"
                    label="标准问题"
                    required
                    extra={'请输入用户最常见的问法'}
                >
                    <Input.TextArea
                        autoComplete="off"
                        allowClear
                        autoSize={{ minRows: 1 }}
                        placeholder={'请输入标准问题'}
                    />
                </Form.Item>

                <Form.Item
                    name="level"
                    label="推荐值"
                    rules={[
                        {
                            required: true,
                            message: '请输入推荐值',
                        },
                    ]}
                >
                    <InputNumber style={{ width: '100%' }} min={0} placeholder={'请输入推荐值'} />
                </Form.Item>

                <Form.Item label="问题关键字">
                    <Row gutter={16}>
                        <Col span={20}>
                            <Space direction="vertical" style={{ width: '100%' }} size={0}>
                                <Input
                                    value={keywordInput}
                                    onPressEnter={handleAddKeyword}
                                    onChange={(evt: React.ChangeEvent<HTMLInputElement>) =>
                                        setKeywordInput(evt.target?.value)
                                    }
                                    allowClear
                                />
                                <Typography.Text style={{ color: '#8C8C8C' }}>
                                    请输入标准问题的相似问法，点击“添加”或按回车确认
                                </Typography.Text>
                            </Space>
                        </Col>
                        <Col span={4}>
                            <Button onClick={handleAddKeyword}>
                                {`+ ${formatMessage({ id: 'operation.add' })}`}
                            </Button>
                        </Col>
                    </Row>
                </Form.Item>
                <Form.List name="keyword">
                    {(fields, { add, remove }, {}) => {
                        return fields.map((field, index) => (
                            <FormListRow gutter={16} key={index}>
                                <Col span={20}>
                                    <Form.Item {...field}>
                                        <Input />
                                    </Form.Item>
                                </Col>
                                <Col span={4}>
                                    <DeleteOutlined
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => remove(field.name)}
                                    />
                                </Col>
                            </FormListRow>
                        ));
                    }}
                </Form.List>
            </Form>
        </Drawer>
    );
};

export default React.forwardRef(AddReasonDrawer);
