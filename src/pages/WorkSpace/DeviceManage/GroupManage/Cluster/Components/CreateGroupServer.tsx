import React, { useState, useImperativeHandle, forwardRef } from 'react'

import { Drawer, Form, Input, Space, Button, message, Spin } from 'antd'
import { createServerGroup, updateServerGroup } from '../../services'
import Owner from '@/components/Owner/index'
import { requestCodeMessage } from '@/utils/utils'
import MachineTags from '@/components/MachineTags';

const CreateGroupDrawer = (props: any, ref: any) => {
    const { ws_id, run_mode, run_environment, onFinish } = props
    const [tagFlag, setTagFlag] = useState({
        list: [],
        isQuery: '',
    })
    const [padding, setPadding] = useState(false)
    const [visible, setVisible] = useState(false)
    const [source, setSource] = useState<any>(null)

    const [form] = Form.useForm()

    useImperativeHandle(ref, () => ({
        show(_: any) {
            setVisible(true)
            if (_) {
                setSource(_)
                let params = _
                const list = params.tag_list.map((i:any) => i.id)
                params.tags = list
                setTagFlag({ ...tagFlag, isQuery: 'edit', list })
                form.setFieldsValue(params)
            }else{
                setTagFlag({ ...tagFlag, isQuery: 'add', list: [] })
            }
        }
    }))

    const handleFinish = () => {
        setPadding(true)
        form
            .validateFields()
            .then(async (values: any) => {
                let data: any;
                if (!source)
                    data = await createServerGroup({
                        ...values,
                        cluster_type: 'aligroup',
                        ws_id
                    })
                else
                    data = await updateServerGroup(source.id, { ...values, ws_id })

                if (data.code === 200) {
                    message.success('操作成功')
                    onFinish()
                    handleCancel()
                }
                else
                    requestCodeMessage(data.code, data.msg)
                setPadding(false)
            })
            .catch((err: any) => {
                console.log(err)
                setPadding(false)
            })
    }

    const handleCancel = () => {
        form.resetFields()
        setVisible(false)
        setSource(null)
    }

    return (
        <Drawer
            maskClosable={false}
            keyboard={false}
            title={!source ? '创建集群' : '编辑集群'}
            forceRender={true}
            visible={visible}
            onClose={handleCancel}
            width="376"
            footer={
                <div style={{ textAlign: 'right', }} >
                    <Space>
                        <Button onClick={handleCancel}>取消</Button>
                        <Button type="primary" disabled={padding} onClick={handleFinish}>
                            {!source ? '确定' : '更新'}
                        </Button>
                    </Space>
                </div>
            }
        >
            <Form
                layout="vertical"
                /*hideRequiredMark*/
                form={form}
                name="createGroup"
            >
                <Form.Item name="name" label="集群名称" rules={[{ message: '名称不能为空', required: true }]}>
                    <Input autoComplete="off" placeholder="请输入" />
                </Form.Item>
                <Owner />
                <MachineTags {...tagFlag}/>
                <Form.Item name="description" label="备注">
                    <Input.TextArea
                        placeholder="请输入备注信息"
                    />
                </Form.Item>
            </Form>
        </Drawer>
    )
}

export default forwardRef(CreateGroupDrawer)