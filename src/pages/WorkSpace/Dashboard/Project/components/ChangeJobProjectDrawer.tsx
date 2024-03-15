import { Drawer, Select, Space, Form, Row, Button, Spin, Empty, Typography } from 'antd'
import React from 'react'
import { useRequest } from 'ahooks'
import { useParams } from 'umi'
import { queryProjectList } from '@/pages/WorkSpace/Product/services'
import { postChangeJobProject } from '../../services'
import lodash from "lodash"

import styled from 'styled-components'

const FormLayout = styled(Form)`
    .ant-form-item {
        margin-bottom: 0px;
    }
`

const SelectionRowBar: React.ForwardRefRenderFunction<any, any> = (props, ref) => {
    const { onOk } = props;
    const { ws_id, project_id } = useParams() as any

    const [open, setOpen] = React.useState(false)
    const [form] = Form.useForm()
    const [loading, setLoading] = React.useState(false)
    const DEFAULT_LIST_PARAMS = { ws_id, page_num: 1, page_size: 20 }
    const [params, setParams] = React.useState(DEFAULT_LIST_PARAMS)
    const [rows, setRows] = React.useState<any[]>([])
    const [dataSource, setDateSource] = React.useState<any>(undefined)

    const { data, loading: fetching, run, mutate } = useRequest((q = params) => queryProjectList(q), {
        debounceInterval: 300,
        manual: true
    })

    React.useEffect(() => {
        setDateSource(data)
    }, [data])

    const handleTagePopupScroll = async ({ target }: any) => { //tag
        const { clientHeight, scrollHeight, scrollTop } = target
        if (clientHeight + scrollTop === scrollHeight) {
            const totalPage = params.page_num + 1
            if (totalPage <= data?.total_page) {
                const t = { ...params, page_num: params.page_num + 1 }
                setParams(t)
                const list = await queryProjectList(t)
                setDateSource(({ ...list, data: dataSource?.data?.concat(list.data) }))
            }
        }
    }

    const handleSearch = (name: any) => {
        run({ ...DEFAULT_LIST_PARAMS, name })
    }

    React.useImperativeHandle(ref, () => ({
        show(row: any[]) {
            setRows(row)
            setOpen(true)
            form.resetFields()
            run()
        }
    }))

    const handleCancel = () => {
        setOpen(false)
        setRows([])
        setDateSource(undefined)
        mutate(undefined)
        setParams(DEFAULT_LIST_PARAMS)
        form.resetFields()
    }

    const handleAdd = async () => {
        const values = await form.validateFields()
        if (loading) return
        setLoading(true)
        const { code, msg } = await postChangeJobProject({ ...values, ws_id, job_list: rows.map((i: any) => i.id) })
        setLoading(false)

        if (code !== 200) {
            form.setFields([{ name: 'project_id', errors: [msg] }])
            return
        }

        onOk?.()
        handleCancel()
    }

    return (
        <Drawer
            open={open}
            onClose={handleCancel}
            width={480}
            destroyOnClose
            title={'更改项目'}
            maskClosable={false}
            bodyStyle={{ padding: 0 }}
            footer={
                <Row justify={"end"}>
                    <Space>
                        <Button type="primary" onClick={handleAdd} loading={loading}>
                            确定
                        </Button>
                        <Button onClick={handleCancel}>
                            取消
                        </Button>
                    </Space>
                </Row>
            }
        >
            <Space style={{ width: '100%' }} direction='vertical'>
                <FormLayout
                    form={form}
                    layout='vertical'
                    style={{ padding: 16 }}
                >
                    <Form.Item
                        name='project_id'
                        label="选择项目"
                        required
                    >
                        <Select
                            onPopupScroll={handleTagePopupScroll}
                            filterOption={false}
                            defaultActiveFirstOption={false}
                            onSearch={lodash.debounce(handleSearch, 300)}
                            showSearch
                            allowClear
                            notFoundContent={
                                fetching ? <Spin /> :
                                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                            }
                            options={
                                dataSource?.data?.map((l: any) => ({
                                    label: l.name,
                                    value: l.id,
                                    disabled: l.id === + project_id
                                }))
                            }
                        />
                    </Form.Item>
                </FormLayout>

                <div style={{ width: '100%', height: 8, background: '#d9d9d9' }} />

                <Space style={{ padding: 16 }} direction='vertical'>
                    <Typography.Text strong>
                        已选Job
                    </Typography.Text>
                    <Space direction='vertical' size={0} style={{ width: '100%' }}>
                        {
                            rows.map((i: any) => (
                                <Typography.Text key={i.id} ellipsis={{ tooltip: true }}>
                                    {`#${i.id}  ${i.name}`}
                                </Typography.Text>
                            ))
                        }
                    </Space>
                </Space>
            </Space>
        </Drawer>
    )
}

export default React.forwardRef(SelectionRowBar)