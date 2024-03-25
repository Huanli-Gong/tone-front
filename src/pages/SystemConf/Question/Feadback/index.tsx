
import { Badge, Form, Input, Popconfirm, Row, Space, Table, Tag, Typography, message } from "antd"
import React from "react"
import { deleteFeedback, getFeedback } from "./services"
import { FormattedMessage, useIntl } from "umi"
import AddFeedbackDrawer from "./AddFeedbackDrawer"
import lodash from 'lodash'
import { FEEDBACK_ENABLE, SelectEnable, SelectType, feedbackTypeMap } from "./FieldsSet"
import { getPageNumOnDel } from "@/utils/utils"
import { ColumnEllipsisText } from "@/components/ColumnComponents"

export const locales_zh = {
    'feedback.column.contents': '问题描述',
    'feedback.column.is_answered': '是否匹配',
    'feedback.column.contents_sources': '分类',
    'feedback.column.status': '状态',
    'feedback.column.gmt_created': '创建时间',
    'feedback.column.creator_name': '创建人',

    'feedback.form.problem.placeholder': '搜索问题描述',
}

export const locales_en = {

}

const DEFAULT_PARAMS = {
    page_num: 1,
    page_size: 20,
}

const FeedbackPage: React.FC = () => {
    const { formatMessage } = useIntl()

    const addRef = React.useRef<any>(null)

    const [source, setSource] = React.useState<any>()
    const [params, setParams] = React.useState<any>(DEFAULT_PARAMS)
    const [loading, setLoading] = React.useState(true)

    const [form] = Form.useForm()

    const init = async () => {
        setLoading(true)
        const { code, msg, ...rest } = await getFeedback(params)
        setLoading(false)
        if (code !== 200) return console.log(msg)
        setSource(rest)
    }

    const handleEdit = (row: any) => addRef.current?.show(row)

    const handleDelete = async (row: any) => {
        const { code, msg } = await deleteFeedback({ contents_id: [row.id] })
        if (code !== 200) {
            message.error(msg)
            return
        }
        message.success(formatMessage({ id: `operation.success` }))
        setParams((p: any) => ({ ...p, page_num: getPageNumOnDel(params, source) }))
    }

    const handleFieldsChange = lodash.debounce(() => {
        const values = form.getFieldsValue()
        setParams((p: any) => ({ ...p, ...values, page_num: 1 }))
    }, 500)

    const columns: any[] = [{
        title: formatMessage({ id: 'feedback.column.contents' }),
        dataIndex: 'contents',
        ellipsis: {
            showTitle: false,
        },
        width: 560,
        render(_: any) {
            return (
                <ColumnEllipsisText ellipsis={{ tooltip: true }} placement="topLeft" title={_}>
                    {_}
                </ColumnEllipsisText>
            )
        }
    },  {
        title: formatMessage({ id: 'feedback.column.contents_sources' }),
        dataIndex: 'contents_sources',
        render(_: any) {
            return <Tag >{feedbackTypeMap.get(_) || '-'}</Tag>
        }
    }, {
        title: formatMessage({ id: 'feedback.column.status' }),
        dataIndex: 'status',
        render(_: any) {
            const { label, status } = FEEDBACK_ENABLE.filter((o: any) => o.value === _)?.[0]
            return (
                <Badge
                    status={status as any}
                    text={label}
                />
            )
        }
    }, {
        title: formatMessage({ id: 'feedback.column.is_answered' }),
        dataIndex: 'is_answered',
        render(_: any) {
            return _?'是': '否'
        }
    },{
        title: formatMessage({ id: 'feedback.column.creator_name' }),
        dataIndex: 'creator_name',
    }, {
        title: formatMessage({ id: 'feedback.column.gmt_created' }),
        dataIndex: 'gmt_created',
    }, {
        title: formatMessage({ id: 'Table.columns.operation' }),
        render(row: any) {
            return (
                <Space>
                    <Typography.Link onClick={() => handleEdit(row)}>
                        <FormattedMessage id='operation.edit' />
                    </Typography.Link>

                    <Popconfirm
                        placement="left"
                        overlayStyle={{ width: 280 }}
                        title={formatMessage(
                            { id: 'operation.confirm.delete.content' },
                            { data: <Typography.Text type='danger' >{row.problem}</Typography.Text> }
                        )}
                        onConfirm={() => handleDelete(row)}
                        okText={formatMessage({ id: 'operation.ok' })}
                        cancelText={formatMessage({ id: 'operation.close' })}
                    >
                        <Typography.Link>
                            <FormattedMessage id='operation.delete' />
                        </Typography.Link>
                    </Popconfirm>
                </Space>
            )
        }
    }]

    React.useEffect(() => {
        init()
    }, [params])

    return (
        <Space style={{ width: '100%' }} direction='vertical'>
            <Row justify={'space-between'} align={'middle'}>
                <Form
                    form={form}
                    layout='inline'
                    onFieldsChange={handleFieldsChange}
                    initialValues={{
                        contents: '',
                        contents_sources: '',
                        status: '',
                    }}
                >
                    <Form.Item label={''} name='contents'>
                        <Input
                            style={{ width: 240 }}
                            placeholder={formatMessage({ id: 'feedback.form.problem.placeholder' })}
                            allowClear
                        />
                    </Form.Item>
                    <Form.Item label={''} name='contents_sources'>
                        <SelectType
                            style={{ width: 160 }}
                        />
                    </Form.Item>
                    <Form.Item label={''} name='status'>
                        <SelectEnable
                            style={{ width: 160 }}
                        />
                    </Form.Item>
                </Form>
            </Row>
            <Table
                rowKey={'id'}
                size='small'
                dataSource={loading ? [] : source?.data}
                loading={loading}
                columns={columns}
                pagination={{
                    total: source?.total || 0,
                    current: params?.page_num || 1,
                    onChange(page_num, page_size) {
                        setParams((p: any) => ({ ...p, page_num, page_size }))
                    },
                }}
            />

            <AddFeedbackDrawer
                ref={addRef}
                onOk={init}
            />
        </Space>
    )
}

export default FeedbackPage
