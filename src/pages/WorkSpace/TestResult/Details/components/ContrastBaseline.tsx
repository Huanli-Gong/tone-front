import { queryBaselineList } from '@/pages/WorkSpace/TestJob/services'
import { requestCodeMessage } from '@/utils/utils'
import { Drawer, Form, Select, Space, Button, Row } from 'antd'
import React, { forwardRef, useImperativeHandle, useState } from 'react'
import { useRequest, useParams } from 'umi'
import { contrastBaseline } from '../service'

const ContrastBaseline: React.ForwardRefRenderFunction<any, any> = (props, ref) => {
    const { ws_id } = useParams() as any
    const { server_provider, onOk } = props
    const [visible, setVisible] = useState(false)
    const [pedding, setPedding] = useState(false)
    const [form] = Form.useForm()
    const [drawerData, setDrawerData] = useState<any>()

    const { data: baselineList } = useRequest(
        () => queryBaselineList({ ws_id, test_type: 'performance', server_provider }),
        { initialData: [] }
    )

    useImperativeHandle(ref, () => ({
        show: (_: any) => {
            setDrawerData(_)
            setVisible(true)
        }
    }), [])

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
            visible={visible}
            title="对比基线"
            onClose={handleClose}
            width="376"
            footer={
                <Row justify="end" >
                    <Space align="end">
                        <Button onClick={handleClose}>取消</Button>
                        <Button type="primary" onClick={handleOk} disabled={pedding}>确定</Button>
                    </Space>
                </Row>
            }
        >
            <Form form={form} requiredMark={false} layout="vertical">
                <Form.Item label="对比基线" name="baseline_id" rules={[{ required: true, message: '未选择对比基线' }]}>
                    <Select placeholder="选择对比基线">
                        {
                            baselineList.map(
                                (item: any) => (
                                    <Select.Option key={item.id} value={item.id}>{item.name}</Select.Option>
                                )
                            )
                        }
                    </Select>
                </Form.Item>
            </Form>
        </Drawer>
    )
}

export default forwardRef(ContrastBaseline)