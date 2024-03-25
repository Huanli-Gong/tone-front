import React from 'react'
import { useIntl, FormattedMessage } from 'umi'
import { Table, Row, Space, Button, Typography, Popconfirm, Badge, message, Tooltip } from 'antd'
import AddReasonDrawer from "./AddReasonDrawer"
import { deleteKnowlegeAnswers, getKnowlegeAnswers } from './services'
import styled from 'styled-components'
import { getPageNumOnDel } from '@/utils/utils'
import RichEditor from '@/components/RichEditor'

const TableWhiteTh = styled(Table)`
    th {
        background: #fff !important;
    }

    .ant-table-has-fix-right,
    .ant-table.ant-table-empty {
        margin-left: 0 !important;
    }
`

const Container = styled.div`
    padding: 12px 12px 0;
`

type FlexRowProps = {
    gap?: string;
    direction?: string;
    justify?: string;
    align?: string;
    wrap?: string;
}

const FlexRow = styled.div<FlexRowProps>`
    display: flex;
    flex-direction: ${({ direction }) => direction || 'row'};
    gap: ${({ gap }) => gap || '8px'};
    justify-content: ${({ justify }) => justify || 'flex-start'};
    align-items: ${({ align }) => align || 'center'};
    wrap: ${({ wrap }) => wrap || 'nowrap'};
`

const ExpandedRow: React.FC<any> = (props) => {
    const { record, problem_type, problem_attribution, enable } = props
    const { formatMessage } = useIntl()

    const problem_id = record?.id

    const DEFAULT_PARAMS = {
        page_num: 1,
        page_size: 20,
        problem_id,
        problem_type,
        problem_attribution,
        enable
    }

    const [loading, setLoading] = React.useState(true)
    const [params, setParams] = React.useState<any>(DEFAULT_PARAMS)
    const [source, setSource] = React.useState<any>()

    const addRef = React.useRef<any>(null)

    const init = async (query = params) => {
        setLoading(true)
        const { code, msg, ...rest } = await getKnowlegeAnswers(query)
        setLoading(false)
        setSource(rest)
    }

    const changeParamsAndInit = (objs: any) => {
        const newParams = { ...params, ...objs }
        setParams(newParams)
        init(newParams)
    }

    const handleEdit = (row: any) => addRef.current?.show(row)

    const handleDelete = async (row: any) => {
        const { code, msg } = await deleteKnowlegeAnswers({ problem_id, answer_id_list: [row.id] })

        if (code !== 200) {
            message.error(msg)
            return
        }
        message.success(formatMessage({ id: 'operation.success' }))
        changeParamsAndInit({ page_num: getPageNumOnDel(params, source) })
    }

    const handleAdd = () => addRef.current?.show()

    React.useEffect(() => {
        changeParamsAndInit({
            problem_type,
            problem_attribution,
            enable,
            page_num: 1
        })
    }, [problem_type, problem_attribution, enable])

    const columns: any = [{
        dataIndex: 'reason',
        title: formatMessage({ id: 'knowlege.anwser.reason' }),
    }, {
        dataIndex: 'answer',
        title: formatMessage({ id: 'knowlege.anwser.anwser' }),
        ellipsis: {
            showTitle: false,
        },
        render(_: any) {
            return (
                <Tooltip
                    title={
                        <RichEditor
                            content={_}
                            editable={false}
                            contentStyle={{
                                maxWidth: 520,
                            }}
                            styledCss={
                                `
                                    img {
                                        max-width: 100% !important;
                                    }
                                `
                            }
                        />
                    }
                    color='#fff'
                    overlayInnerStyle={{
                        color: '#333',
                        maxWidth: 540
                    }}
                >
                    <Typography.Text ellipsis>
                        {_?.replace(/<\/?[^>]+>/g, ' ')?.trim() || '-'}
                    </Typography.Text>
                </Tooltip>
            )
        }
    }, {
        dataIndex: 'problem_type',
        title: formatMessage({ id: 'knowlege.anwser.problem_type' }),
    }, {
        dataIndex: 'problem_attribution',
        title: formatMessage({ id: 'knowlege.anwser.problem_attribution' }),
    }, {
        dataIndex: 'right_number',
        title: formatMessage({ id: 'knowlege.anwser.right_number' }),
    }, {
        dataIndex: 'enable',
        width: 130,
        title: formatMessage({ id: 'knowlege.anwser.enable' }),
        render(_: any) {
            return (
                _ ?
                    <Badge status="success" text="生效中" /> :
                    <Badge status="error" text="已失效" />
            )
        }
    }, {
        title: formatMessage({ id: 'Table.columns.operation' }),
        width: 130,
        fixed: 'right',
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
                            { data: <Typography.Text type='danger' >{row?.reason}</Typography.Text> }
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
    },]

    return (
        <Container>
            <FlexRow gap={'16px'} direction={'column'}>
                <Row justify={'end'} align={'middle'} style={{ width: '100%' }}>
                    <Button
                        size='small'
                        type='primary'
                        onClick={handleAdd}
                    >
                        <FormattedMessage id='knowlege.anwser.add' />
                    </Button>
                </Row>
                <TableWhiteTh
                    rowKey={'id'}
                    loading={loading}
                    dataSource={loading ? [] : source?.data}
                    columns={columns}
                    pagination={{
                        size: 'small',
                        style: { marginBottom: 0 },
                        total: source?.total || 0,
                        current: params?.page_num || 1,
                        pageSize: params?.page_size || 20,
                        onChange(page_num, page_size) {
                            console.log(page_num, page_size)
                            changeParamsAndInit({ page_num, page_size })
                        },
                    }}
                />
            </FlexRow>

            <AddReasonDrawer
                problem_id={problem_id}
                ref={addRef}
                onOk={init}
            />
        </Container>
    )
}

export default ExpandedRow