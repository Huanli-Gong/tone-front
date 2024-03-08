import { Button, Form, Input, InputNumber, Popconfirm, Row, Space, Table, Tag, Typography, message } from "antd"
import React from "react"
import { deleteProblem, getKnowlegeProblems, putProblem } from "./services"
import { FormattedMessage, useIntl } from "umi"
import ExpandedRow from "./ExpandedRow"
import AddProblem from "./AddProblem"
import { SelectEnable, SelectProblemAttribution, SelectProblemType } from "./FieldsSet"
import { CaretDownFilled, CaretRightFilled } from "@ant-design/icons"
import { getPageNumOnDel } from "@/utils/utils"
import OverflowList from "@/components/TagOverflow"

export const locales_zh = {
    'knowlege.column.problem': '标准问题',
    'knowlege.column.keyword': '相似问题',
    'knowlege.column.level': '推荐值',

    'knowlege.form.problem.placeholder': '搜索问题',
    'knowlege.row.button.add': '新建问题',

    'knowlege.anwser.add': '新建原因',
    'knowlege.anwser.reason': '原因描述',
    'knowlege.anwser.anwser': '答案',
    'knowlege.anwser.problem_type': '分类',
    'knowlege.anwser.problem_attribution': '归属',
    'knowlege.anwser.right_number': '满意度',
    'knowlege.anwser.enable': '状态',
}

export const locales_en = {

}

const DEFAULT_PARAMS = {
    page_num: 1,
    page_size: 20,
}

const EditLevelColumn: React.FC<any> = (props) => {
    const [val, setVal] = React.useState(props?.level)
    const [show, setShow] = React.useState(false)

    const handleLevelBlur = async () => {
        const { code, msg } = await putProblem({ ...props, problem_id: props.id, level: val })
        if (code !== 200) return console.log(msg)
        props?.refresh()
    }

    return (
        <div
            onClick={() => setShow(true)}
        >
            {
                !show ?
                    <Typography.Text >{props?.level}</Typography.Text> :
                    <InputNumber
                        size={'small'}
                        value={val}
                        onChange={(level: any) => setVal(level)}
                        onBlur={handleLevelBlur}
                    />
            }
        </div>
    )
}

const KnowledgePage: React.FC = () => {
    const { formatMessage } = useIntl()

    const addRef = React.useRef<any>(null)

    const [source, setSource] = React.useState<any>()
    const [params, setParams] = React.useState<any>(DEFAULT_PARAMS)
    const [loading, setLoading] = React.useState(true)
    const [expandedRowKeys, setExpandedRowKeys] = React.useState<any>([])

    const [form] = Form.useForm()

    const enable = Form.useWatch('enable', form)
    const problem_type = Form.useWatch('problem_type', form)
    const problem_attribution = Form.useWatch('problem_attribution', form)

    const init = async () => {
        setLoading(true)
        const { code, msg, ...rest } = await getKnowlegeProblems(params)
        setLoading(false)
        if (code !== 200) return console.log(msg)
        setSource(rest)
    }

    const handleAdd = () => addRef.current?.show()

    const handleEdit = (row: any) => addRef.current?.show(row)

    const handleDelete = async (row: any) => {
        const problem_id_list = [row.id]
        const { code, msg } = await deleteProblem({ problem_id_list })
        if (code !== 200) {
            message.error(msg)
            return
        }
        message.success(formatMessage({ id: `operation.success` }))

        setParams((p: any) => ({ ...p, page_num: getPageNumOnDel(params, source) }))
    }

    const columns: any[] = [{
        title: formatMessage({ id: 'knowlege.column.problem' }),
        dataIndex: 'problem',
    }, {
        title: formatMessage({ id: 'knowlege.column.keyword' }),
        dataIndex: 'keyword',
        width: 480,
        ellipsis: {
            showTitle: false
        },
        render(row: any) {
            return (
                <OverflowList
                    list={row.map((i: any) => <Tag key={i}>{i}</Tag>)}
                />
            )
        }
    }, {
        title: formatMessage({ id: 'knowlege.column.level' }),
        dataIndex: 'level',
        width: 180,
        render(_: any, row: any) {
            return (
                <EditLevelColumn {...row} refresh={init} />
            )
        }
    }, {
        title: formatMessage({ id: 'Table.columns.operation' }),
        width: 142,
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
                    initialValues={{
                        problem_type: '',
                        problem_attribution: '',
                        enable: '',
                    }}
                >
                    <Form.Item label={''} name='problem'>
                        <Input
                            style={{ width: 240 }}
                            placeholder={formatMessage({ id: 'knowlege.form.problem.placeholder' })}
                            allowClear
                        />
                    </Form.Item>
                    <Form.Item label={''} name='problem_type'>
                        <SelectProblemType
                            style={{ width: 160 }}
                        />
                    </Form.Item>
                    <Form.Item label={''} name='problem_attribution'>
                        <SelectProblemAttribution
                            style={{ width: 160 }}
                        />
                    </Form.Item>
                    <Form.Item label={''} name='enable'>
                        <SelectEnable
                            style={{ width: 160 }}
                        />
                    </Form.Item>
                </Form>
                <Button type='primary' onClick={handleAdd}>
                    <FormattedMessage id='knowlege.row.button.add' />
                </Button>
            </Row>
            <Table
                rowKey={'id'}
                size='small'
                dataSource={loading ? [] : source?.data}
                loading={loading}
                columns={columns}
                expandable={{
                    indentSize: 0,
                    onExpand: (_, record) => _ ? setExpandedRowKeys([record.id]) : setExpandedRowKeys([]),
                    expandIcon: ({ expanded, onExpand, record }) => (
                        expanded ?
                            (<CaretDownFilled onClick={e => onExpand(record, e)} />) :
                            (<CaretRightFilled onClick={e => onExpand(record, e)} />)
                    ),
                    expandedRowKeys,
                    expandedRowRender: (record, index, indent, expanded) => (
                        <ExpandedRow
                            {...{ record, index, indent, expanded }}
                            {...{ enable, problem_attribution, problem_type }}
                        />
                    )
                }}
                pagination={{
                    total: source?.total || 0,
                    current: params?.page_num || 1,
                    onChange(page_num, page_size) {
                        setParams((p: any) => ({ ...p, page_num, page_size }))
                    },
                }}
            />

            <AddProblem
                ref={addRef}
                onOk={init}
            />
        </Space>
    )
}

export default KnowledgePage