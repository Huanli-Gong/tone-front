import { queryBaselineList } from '@/pages/WorkSpace/TestJob/services'
import { requestCodeMessage } from '@/utils/utils'
import { Drawer, Form, Select, Space, Button, Row, Typography } from 'antd'
import React, { forwardRef, useImperativeHandle, useState } from 'react'
import { useRequest, useParams, useIntl, FormattedMessage } from 'umi'
import { contrastBaseline } from '../service'
import { renderTitle } from "."

const ContrastBaseline: React.ForwardRefRenderFunction<any, any> = (props, ref) => {
    const { formatMessage } = useIntl()
    const { ws_id } = useParams() as any
    const { test_type, onOk } = props
    const [visible, setVisible] = useState(false)
    const [pedding, setPedding] = useState(false)
    const [form] = Form.useForm()
    const [drawerData, setDrawerData] = useState<any>()

    const { data: baselineList, loading, run } = useRequest(
        () => queryBaselineList({ ws_id, test_type, page_size: 999 }),
        { initialData: [], manual: true }
    )

    useImperativeHandle(ref, () => ({
        show: (_: any) => {
            run()
            setDrawerData(_)
            setVisible(true)
        }
    }))

    const handleClose = () => {
        setVisible(false)
        setPedding(false)
        setDrawerData(null)
        form.resetFields()
    }

    const handleOk = () => {
        if (pedding) return
        setPedding(true)
        form.validateFields()
            .then(async (values: any) => {
                console.log(drawerData)
                const { job_id, suite_id, test_case_id: case_id, suite_data, suite_list } = drawerData
                let params = {}

                if (suite_id && case_id) params = { suite_data: [{ suite_id, case_list: [case_id] }] }
                if (suite_id && !case_id) params = { suite_list: [suite_id] }
                if (suite_data && suite_data.length > 0) params = { suite_data }
                if (suite_list && suite_list.length > 0) params = { suite_list }

                const { code, msg } = await contrastBaseline({ ws_id, job_id, ...params, ...values })
                if (code !== 200) {
                    requestCodeMessage(code, msg)
                    setPedding(false)
                    return
                }
                handleClose()
                onOk()
                setPedding(false)
            })
            .catch((err: any) => {
                console.log(err)
                setPedding(false)
            })
    }

    return (
        <Drawer
            maskClosable={false}
            keyboard={false}
            open={visible}
            destroyOnClose
            title={<FormattedMessage id="ws.result.details.baseline" />}
            onClose={handleClose}
            bodyStyle={{ padding: 0 }}
            width="376"
            footer={
                <Row justify="end" >
                    <Space align="end">
                        <Button onClick={handleClose}><FormattedMessage id="operation.cancel" /></Button>
                        <Button type="primary" onClick={handleOk} disabled={pedding}><FormattedMessage id="operation.ok" /></Button>
                    </Space>
                </Row>
            }
        >
            {
                (drawerData?.suite_name || drawerData?.conf_name) &&
                <Row style={{ marginBottom: 10, background: '#fff', padding: 20, borderBottom: '10px solid #f0f2f5' }}>
                    {renderTitle('Test Suite', drawerData?.suite_name)}
                    {renderTitle('Test Conf', drawerData?.conf_name)}
                    {renderTitle('Test Case', drawerData?.case_name)}
                </Row>
            }
            <Form
                form={form}
                requiredMark={false}
                layout="vertical"
                style={{ background: '#fff', padding: '10px 20px' }}
            >
                <Form.Item
                    label={<FormattedMessage id="ws.result.details.baseline" />}
                    name="baseline_id"
                    rules={[{
                        required: true,
                        message: formatMessage({ id: `ws.result.details.baseline.message` })
                    }]}
                >
                    <Select
                        placeholder={formatMessage({ id: `ws.result.details.baseline.placeholder` })}
                        showSearch
                        allowClear
                        /* @ts-ignore */
                        loading={loading}
                        filterOption={(input, option) => (option?.name ?? '')?.toLowerCase().includes(input.toLowerCase())}
                        options={baselineList?.map((item: any) => ({
                            value: item.id,
                            name: item.name,
                            label: (
                                <Typography.Text ellipsis={{ tooltip: true }}>
                                    {item.name}
                                </Typography.Text>
                            )
                        }))}
                    />
                </Form.Item>
            </Form>
        </Drawer>
    )
}

export default forwardRef(ContrastBaseline)