import React, { useState, useEffect } from 'react'
import { EditableCell } from './EditCell'
import { queryWorkspaceMember, deleteWorkspaceMember } from '@/services/Workspace'
import { Table, Space, Avatar, Typography, Popconfirm, Button, message, Tag } from 'antd'
import CommonPagination from '@/components/CommonPagination'
import { useAccess, useIntl, FormattedMessage } from 'umi'
import { requestCodeMessage } from '@/utils/utils'

const ComplateUsername: React.FC<{ user_info: any }> = ({ user_info }) => {
    const { formatMessage } = useIntl()
    const { first_name, last_name } = user_info

    if (first_name && last_name)
        return (
            <Typography.Text>{first_name + `(${last_name})`}</Typography.Text>
        )
    else
        return (
            <Typography.Text>{first_name || last_name}</Typography.Text>
        )
}

export default (props: any) => {
    const { formatMessage } = useIntl()
    const { role, keyword, refresh, onOk, roleData } = props
    const { ws_id } = props.match.params
    const access = useAccess();
    const [tableData, setTableData] = useState<any>({})
    const [loading, setLoading] = useState(true)
    const [pagenat, setPagenat] = useState<any>({
        page_num: 1,
        page_size: 10,
    })

    const init = async () => {
        setLoading(true)
        const data = await queryWorkspaceMember({
            ...pagenat,
            ws_id,
            role,
            keyword
        })
        setTableData(data)
        setLoading(false)
    }

    useEffect(() => {
        init()
    }, [pagenat, keyword, refresh])

    const columns: any = [
        {
            title: <FormattedMessage id="member.member" />,
            render: (_: any) => (
                <Space>
                    <Avatar src={_.user_info.avatar} />
                    <ComplateUsername user_info={_.user_info} />
                    {
                        _.user_info.is_admin
                            ? <div style={{ backgroundColor: '#F9AD10', borderRadius: 2, fontSize: 12, padding: '0 4px' }}>
                                <span style={{ color: '#fff' }}>
                                    <FormattedMessage id="member.manage.tag" />
                                </span>
                            </div>
                            : null
                    }
                    {
                        _.user_info.is_self
                            ? <Tag color="rgba(140,140,140,0.1)" style={{ color: 'rgba(0,0,0,0.65)', marginRight: 0 }}>
                                <FormattedMessage id="member.oneself" />
                            </Tag>
                            : null
                    }
                </Space>
            )
        },
        {
            title: <FormattedMessage id="member.account" />,
            render: (_: any) => (
                <Typography.Text>
                    {BUILD_APP_ENV === "opensource" ? _.user_info.username : _.user_info.email}
                </Typography.Text>
            )
        },

        {
            title: <FormattedMessage id="member.role" />,
            render: (_: any) => (
                <EditableCell {..._} select={roleData} handleOk={init} onOk={onOk} />
            ),
        },
        {
            title: <FormattedMessage id="member.join_date" />,
            dataIndex: 'join_date'
        },
        access.WsBtnPermission() &&
        {
            title: <FormattedMessage id="Table.columns.operation" />,
            align: 'center',
            render: (_: any) => (
                _.user_info.is_self || !_.user_info.can_update
                    ? <Button type="link" disabled={true}><FormattedMessage id="member.remove" /></Button>
                    :
                    <Popconfirm
                        title={<FormattedMessage id="member.Are.you.sure.remove.user" />}
                        okText={<FormattedMessage id="operation.ok" />}
                        cancelText={<FormattedMessage id="operation.cancel" />}
                        onConfirm={() => handleDeleteUser(_.user_info.id)}
                    >
                        <Button type="link"><FormattedMessage id="member.remove" /></Button>
                    </Popconfirm>
            )
        }
    ].filter(Boolean)


    const handleDeleteUser = async (user_id: number) => {
        try {
            const data = await deleteWorkspaceMember({ ws_id, user_id })
            if (data.code === 200) {
                message.success(formatMessage({ id: 'operation.success' }))
                onOk();
            } else {
                requestCodeMessage(data.code, data.msg)
            }
            init()
        }
        catch (err) {
            console.log(err)
            message.error(formatMessage({ id: 'member.an.error.occurred,please.try.again' }))
        }
    }

    return (
        <>
            <Table
                size="small"
                loading={loading}
                rowKey={(reocrd: any) => reocrd.user_info.id}
                rowClassName={() => 'editable-row'}
                columns={columns}
                dataSource={tableData.data}
                pagination={false}
            />
            <CommonPagination
                pageSize={pagenat.page_size}
                total={tableData.total}
                currentPage={pagenat.page_num}
                onPageChange={(page_num, page_size) => setPagenat({ page_num, page_size })}
            />
        </>
    )
}
