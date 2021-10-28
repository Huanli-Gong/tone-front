import React, { useState, useEffect } from 'react'
import { EditableCell } from './EditCell'
import { queryWorkspaceMember, deleteWorkspaceMember } from '@/services/Workspace'
import { Table, Space, Avatar, Typography, Popconfirm, Button, message, Tag } from 'antd'
import CommonPagination from '@/components/CommonPagination'
import { Access, useAccess } from 'umi'
import { roleList } from '@/pages/SystemConf/UserManagement/service'
import { requestCodeMessage } from '@/utils/utils'
const ComplateUsername: React.FC<{ user_info: any }> = ({ user_info }) => {
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
    const { role, keyword, refresh, onOk, roleData } = props
    const { ws_id } = props.match.params
    const access = useAccess()
    const [tableData, setTableData] = useState<any>({})
    const [loading, setLoading] = useState(true)
    const [pagenat, setPagenat] = useState<any>({
        page_num: 1,
        page_size: 10,
    })

    const init = async () => {
        setLoading(true)
        let data = await queryWorkspaceMember({
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
            title: '成员',
            render: (_: any) => (
                <Space>
                    <Avatar src={_.user_info.avatar} />
                    <ComplateUsername user_info={_.user_info} />
                    {
                        _.user_info.is_admin
                            ? <div style={{ width: 16, height: 16, backgroundColor: '#F9AD10', borderRadius: 2, fontSize: 12, position: 'relative' }}>
                                <span style={{ color: '#fff', position: 'absolute', top: 0, left: 2 }}>管</span>
                            </div>
                            : null


                    }
                    {
                        _.user_info.is_self
                            ? <Tag color="rgba(140,140,140,0.1)" style={{ color: 'rgba(0,0,0,0.65)', marginRight: 0 }}>本人</Tag>
                            : null
                    }
                </Space>
            )
        },
        {
            title: '账号',
            render: (_: any) => (<Typography.Text>{_.user_info.email}</Typography.Text>)
        },
        {
            title: '角色',
            render: (_: any) => (
                <EditableCell ws_id={ws_id} user_info={_.user_info} select={roleData} handleOk={init} onOk={onOk} is_owner={_.is_owner} />
            ),
        },
        {
            title: '加入时间',
            dataIndex: 'join_date'
            // render : ( _ : any ) => <Typography.Text>{ _.user_info.gmt_created }</Typography.Text>
        },
        {

            title: <Access accessible={access.wsRemoveFilter()}> <>操作</></Access>,
            align: 'center',
            render: (_: any) => (
                <Access accessible={access.wsRemoveFilter()}>
                    {
                        _.is_owner
                            ? <Button type="link" disabled={true}>移除</Button>
                            : <Popconfirm
                                title="确定要移除该用户吗？"
                                okText="确定"
                                cancelText="取消"
                                onConfirm={() => handleDeleteUser(_.user_info.id)}
                            >
                                <Button type="link">移除</Button>
                            </Popconfirm>
                    }
                </Access>
            )
        }
    ]


    const handleDeleteUser = async (user_id: number) => {
        try {
            const data = await deleteWorkspaceMember({ ws_id, user_id })
            if (data.code === 200) {
                message.success('操作成功')
                onOk();
            } else {
                requestCodeMessage( data.code , data.msg )
            }
            init()
        }
        catch (err) {
            console.log(err)
            message.error('发生错误，请稍后再试!')
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
