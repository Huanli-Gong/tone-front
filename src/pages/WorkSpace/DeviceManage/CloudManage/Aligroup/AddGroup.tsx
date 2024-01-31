/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { Button, Drawer, Row, Col, Form, Input, message } from 'antd';
import Owner from '@/components/Owner/index';
import MachineTags from '@/components/MachineTags';
import { addGroup, editGroup } from '../service';
import { useParams, useIntl, FormattedMessage } from 'umi';

const AddCluster = (props: any) => {
    const { outParam, tagFlag, is_instance, params, setParams } = props;
    const { formatMessage } = useIntl()
    const { ws_id }: any = useParams()
    const [form] = Form.useForm();
    const [visible, setVisible] = useState<boolean>(false)
    const [validateResult, setValidateResult] = useState<any>({});

    useEffect(() => {
        form.resetFields()
        if (JSON.stringify(outParam) !== '{}') {
            setTimeout(function () {
                const tags = outParam.tag_list?.map((item: any) => { return item.id }) || []
                form.setFieldsValue({ ...outParam, tags })
            }, 1)
        }
    }, [outParam])

    useEffect(() => {
        if (JSON.stringify(tagFlag) !== '{}' && !!tagFlag.isQuery.length) {
            setVisible(true)
        }
    }, [tagFlag])

    const submit = async (param: any) => {
        if (JSON.stringify(outParam) !== '{}') {
            const obj: any = {
                description: param.description || '',
                tags: param.tags,
                emp_id: param.emp_id,
                name: param.name,
                ws_id
            }
            const res = await editGroup(outParam.id, obj) || {}
            if (res.code === 200) {
                // 成功
                setVisible(false)
                message.success(formatMessage({ id: 'operation.success' }));
                setParams({ ...params, refresh: !params.refresh })
                return
            }
            // 失败
            setValidateResult({ ...res, error: true })
            return
        }

        const obj = { ...param, ws_id, is_instance: String(is_instance) }
        obj.description = param.description || ''
        obj.cluster_type = 'aliyun'

        const res = await addGroup({ ...obj })
        if (res.code === 200) {
            // 成功
            setVisible(false)
            message.success(formatMessage({ id: 'operation.success' }));
            setParams({ ...params, page: 1, refresh: !params.refresh })
            return
        }
        // 失败
        setValidateResult({ ...res, error: true })
    }

    const onSubmit = () => {
        // 云上: cluster_type字段传"aliyun"
        form.validateFields().then(val => submit(val))
    }

    const title = React.useMemo(() => {
        const isEdit = JSON.stringify(outParam) !== '{}'
        const $instance = !!is_instance

        if ($instance) {
            return isEdit ? "device.cluster.edit" : "device.cluster.btn"
        }
        return isEdit ? "device.edit.cluster.config" : "device.add.cluster.config"
    }, [outParam, is_instance])

    return (
        <Drawer
            maskClosable={false}
            keyboard={false}
            title={<FormattedMessage id={title} />}
            width={376}
            onClose={() => setVisible(false)}
            open={visible}
            bodyStyle={{ paddingBottom: 80 }}
            footer={
                <div style={{ textAlign: 'right' }}>
                    <Button onClick={() => setVisible(false)} style={{ marginRight: 8 }}>
                        <FormattedMessage id="operation.cancel" />
                    </Button>
                    <Button type="primary" onClick={() => onSubmit()}>
                        {JSON.stringify(outParam) !== '{}' ? <FormattedMessage id="operation.update" /> : <FormattedMessage id="operation.ok" />}
                    </Button>
                </div>
            }
        >
            <Form
                layout="vertical"
                form={form}
            >
                <Row gutter={16}>
                    <Col span={24}>
                        <Form.Item label={<FormattedMessage id="device.cluster.name.s" />}
                            name="name"
                            rules={[{ required: true, message: formatMessage({ id: 'device.cluster.name.s.message' }) }]}
                            validateStatus={validateResult.error ? 'error' : undefined}
                            help={validateResult.msg === 'cluster existed' ? formatMessage({ id: 'device.cluster.name.s.existed' }) : validateResult.msg}
                        >
                            <Input autoComplete="off" placeholder={formatMessage({ id: 'please.enter' })} onChange={(e: any) => setValidateResult({})} />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Owner />
                    </Col>
                    <Col span={24}>
                        <MachineTags {...tagFlag} />
                    </Col>
                    <Col span={24}>
                        <Form.Item
                            name="description"
                            label={<FormattedMessage id="device.description" />}
                        >
                            <Input.TextArea rows={3} placeholder={formatMessage({ id: 'please.enter' })} />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Drawer>
    )
}
export default AddCluster;