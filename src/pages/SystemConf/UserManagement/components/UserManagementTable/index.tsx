import React, { useState, useImperativeHandle, useEffect } from 'react';
import type { UserTable, UserList, RoleChangeParams, TableListParams } from '../../data';
import { Avatar, Space, message, Popconfirm, Typography, Table } from 'antd';
import { userManagementList, roleChange, requestResetPassword } from '../../service';
import CommonPagination from '@/components/CommonPagination'
import RoleSelect from '../RoleSelect';
import SelectRadio from '@/components/Public/SelectRadio';
import Highlighter from 'react-highlight-words';
import SearchInput from '@/components/Public/SearchInput';
import { FilterFilled } from '@ant-design/icons';
import ResetModal from '../ResetModal';
import { useRef } from 'react';
import AvatarCover from '@/components/AvatarCover';
import { useIntl, FormattedMessage } from 'umi';
import { ColumnEllipsisText } from '@/components/ColumnComponents';

const validatorParams = (params: any) => {
    const row: any = {};
    if (params) {
        Object.keys(params).forEach((item) => {
         if (params[item] || [0, false].includes(params[item]))  {
          row[item] = params[item];
         }
        });
    }
    return row;
}

const UserManagementTable: React.FC<UserList> = ({ onRef, select, rolelist, callbackTotal }: any) => {
    const { formatMessage } = useIntl()
    const [loading, setLoading] = useState<boolean>(true);
    const [listPage, setListPage] = useState<any>({ data: [], total: 0, total_page: 0, page_num: 1, page_size: 10 });
    const [filterQuery, setFilterQuery] = useState<any>({ last_name: '',  role_id: '' })
    const [autoFocus, setFocus] = useState<boolean>(true)
    //
    const resetRef = useRef<{ show: (p: { password: string, username: string }) => void }>(null)

    // 1.请求数据
    const getManagementList = async (params: TableListParams) => {
       const q = { ...filterQuery, ...params }
       const query = validatorParams(q);
       //
        setLoading(true)
        try {
            const res = await userManagementList(query)
            if (res.code === 200) {
                setListPage(res)
                callbackTotal(res.total)
            } else {
                setListPage({ data: [], total: 0, total_page: 0, page_num: 1, page_size: 10 })
                callbackTotal(0)
            }
            setLoading(false)
        } catch (err) { setLoading(false) }
    };

    // 条件筛选
    useEffect(() => {
      getManagementList({ page_num: 1, page_size: listPage.page_size })
    }, [filterQuery.last_name, filterQuery.role_id]);

    const onChange = (page_num: any, page_size: any) => {
      getManagementList({ page_num, page_size })
    }

    // 修改角色
    const handleChange = async (val: number[], row: UserTable) => {
        const params: RoleChangeParams = {
            user_id: row.id,
            role_id: val
        }
        const result = await roleChange(params)
        if (result.code === 200) {
            message.success(formatMessage({ id: 'operation.success' }));
            getManagementList({ page_num: listPage.page_num, page_size: listPage.page_size })
        } else {
            message.error(result.msg);
        }
    }

    const resetPasswordConfirm = async (row: any) => {
        const { code, data: $data, msg } = await requestResetPassword({ user_id: row.id })
        if (code !== 200) {
            message.error(msg ?? $data)
            return
        }
        resetRef.current?.show({ password: $data, username: row.username })
    }

    const columns = [
        {
            title: <FormattedMessage id="user.last_name" />,
            dataIndex: 'last_name',
            width: 200,
            ellipsis: {
                showTitle: false
            },
            render: (_: number, row: any) => (
                <Space>
                    {
                        row.avatar ?
                            <Avatar size={25} src={row.avatar} alt={row.last_name} /> :
                            <AvatarCover size={25} show_name={row.last_name || row.username} theme_color={row.avatar_color} shape="circle" />
                    }
                    <Highlighter
                        highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                        searchWords={[filterQuery.last_name || '']}
                        autoEscape
                        textToHighlight={row.last_name.toString()}
                    />
                </Space>
            ),
            filterIcon: () => <FilterFilled style={{ color: filterQuery.last_name ? '#1890ff' : undefined }} />,
            filterDropdown: ({ confirm }: any) => <SearchInput confirm={confirm} autoFocus={autoFocus} onConfirm={(val: string) => setFilterQuery({ ...filterQuery, last_name: val }) } />,
            onFilterDropdownVisibleChange: (visible: any) => {
                if (visible) {
                  setFocus(!autoFocus)
                }
            },
        },
        {
            title: <FormattedMessage id="user.email" />,
            dataIndex: 'email',
            ellipsis: {
                showTitle: false
            },
            render: (_: number, row: UserTable) => (
                <ColumnEllipsisText ellipsis={{ tooltip: true }} >
                    {BUILD_APP_ENV === "opensource" ? row.username : row.email}
                </ColumnEllipsisText>
            ),
        },
        {
            title: <FormattedMessage id="user.role_list" />,
            dataIndex: 'role_list',
            render: (_: number, row: any) => (
                (select && select.length > 0) &&
                <RoleSelect row={row} select={select} handleChange={handleChange} />
            ),
            width: 170,
            filterIcon: () => <FilterFilled style={{ color: filterQuery.role_id ? '#1890ff' : undefined }} />,
            filterDropdown: ({ confirm }: any) => <SelectRadio list={rolelist} confirm={confirm} onConfirm={(val: any) => setFilterQuery({ ...filterQuery, role_id: val })} roleType="role" />,
            onFilterDropdownVisibleChange: (visible: any) => {
                if (visible) {
                  setFocus(!autoFocus)
                }
            },
        },
        {
            title: 'Workspace',
            dataIndex: 'ws_list',
            render: (_: number, row: UserTable) => (
                (row.ws_list && row.ws_list.length > 0) &&
                <ColumnEllipsisText ellipsis={{ tooltip: true }} >{row.ws_list.join('、')}</ColumnEllipsisText>
            ),
            ellipsis: {
                showTitle: false
            },
            width: 200,
        },
        {
            title: <FormattedMessage id="user.gmt_created" />,
            dataIndex: 'gmt_created',
            width: 145,
        },
        BUILD_APP_ENV === 'opensource' &&
        {
            title: <FormattedMessage id="Table.columns.operation" />,
            key: "operation",
            fixed: "right",
            width: 200,
            render: (_: any, row: any) => (
                <Popconfirm
                    title={<FormattedMessage id="user.Popconfirm.title" />}
                    onConfirm={() => resetPasswordConfirm(row)}
                    okButtonProps={{ type: "primary", danger: true }}
                    okText={<FormattedMessage id="operation.confirm.reset" />}
                    onVisibleChange={() => console.log('visible change')}
                >
                    <Typography.Link><FormattedMessage id="operation.reset.password" /></Typography.Link>
                </Popconfirm>
            )
        }
    ].filter((item)=> item);

    return (
        <div>
            <Table
                loading={loading}
                rowKey="id"
                size="small"
                columns={columns as any}
                dataSource={listPage.data}
                pagination={false}
            />
            <CommonPagination
                size="default"
                pageSize={listPage.page_size}
                currentPage={listPage.page_num}
                total={listPage?.total || 0}
                onPageChange={onChange}
            />

            {
                BUILD_APP_ENV === 'opensource' &&
                <ResetModal ref={resetRef} />
            }
        </div>
    );

};

export default UserManagementTable;