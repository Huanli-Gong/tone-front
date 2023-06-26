import React, { useState, useImperativeHandle, useEffect } from 'react';
import type { UserTable, UserList, RoleChangeParams, TableListParams } from '../../data.d';
import { Avatar, Space, message, Popconfirm, Typography } from 'antd';
import { userManagementList, roleChange, requestResetPassword } from '../../service';
import CommonTable from '@/components/Public/CommonTable';
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

const UserManagementTable: React.FC<UserList> = ({ onRef, select, RoleChange, onSearch, rolelist }: any) => {
    const { formatMessage } = useIntl()
    const [data, setData] = useState<any>({});
    const [loading, setLoading] = useState<boolean>(true);
    const [page, setPage] = useState<number>(1);
    const [size, setSize] = useState<number>(10);
    const [keyword, setKeyword] = useState<string>()
    const [autoFocus, setFocus] = useState<boolean>(true)
    const [role_id, setRole] = useState<number>();
    const [lastName, setLastName] = useState<string>()    
    const initParams = { page_num: 1, page_size: 10, role_id: role_id }
    const resetRef = useRef<{ show: (p: { password: string, username: string }) => void }>(null)

    const getManagementList = async ($initParams: TableListParams) => {
        // setLoading(true)
        // setData({ data: [] })
        // const dataSource = await userManagementList($initParams)
        // setData(dataSource)
        // setLoading(false)
    };

    const refresh = () => {
        const params = { role_id: role_id, page_num: page, page_size: size, keyword: keyword }
        getManagementList(params)
    }

    console.log('role_id:', role_id)
    useEffect(() => {
        refresh()
    }, [page, size]);

    const onChange = (page_num: any, page_size: any) => {
        setPage(page_num)
        setSize(page_size)
    }

    useImperativeHandle(onRef, () => ({
        search: ($keyword: string) => {
            getManagementList({ ...initParams, ...{ page_size: size, keyword: $keyword, role_id: role_id } })
            setKeyword(keyword)
        },
        select: ($role_id: number) => {
            getManagementList({ ...initParams, ...{ page_size: size, keyword: keyword, role_id: $role_id } })
            setRole(role_id)
        },
        handleTab: refresh
    }));

    const handleChange = async (val: number[], row: UserTable) => {
        const params: RoleChangeParams = {
            user_id: row.id,
            role_id: val
        }
        const result = await roleChange(params)
        if (result.code === 200) {
            message.success(formatMessage({ id: 'operation.success' }));
            refresh()
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
            filterDropdown: ({ confirm }: any) => <SearchInput
                confirm={confirm}
                autoFocus={autoFocus}
                onConfirm={(val: string) => {
                    setLastName(val)
                    onSearch(val)
                }} />,
            onFilterDropdownVisibleChange: (visible: any) => {
                if (visible) {
                    setFocus(!autoFocus)
                }
            },
            filterIcon: () => <FilterFilled style={{ color: lastName ? '#1890ff' : undefined }} />,
            render: (_: number, row: any) => (
                <Space>
                    {
                        row.avatar ?
                            <Avatar size={25} src={row.avatar} alt={row.last_name} /> :
                            <AvatarCover size={25} show_name={row.last_name || row.username} theme_color={row.avatar_color} shape="circle" />
                    }
                    <Highlighter
                        highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                        searchWords={[lastName || '']}
                        autoEscape
                        textToHighlight={row.last_name.toString()}
                    />
                </Space>
            ),
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
            filterIcon: () => <FilterFilled style={{ color: role_id ? '#1890ff' : undefined }} />,
            filterDropdown: ({ confirm }: any) => 
              <SelectRadio list={rolelist} confirm={confirm} 
                onConfirm={(val: any) => {
                    setRole(val)
                    RoleChange(val)
                }} 
                roleType="role" />,
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
    ];

    const list: UserTable[] = data.data

    return (
        <div>
            <CommonTable
                key={rolelist}
                size="small"
                name="sys-user-manage-list"
                columns={columns as any}
                dataSource={list}
                loading={loading}
                page={data.page_num}
                pageSize={data.page_size}
                totalPage={data.total_page}
                total={data.total}
                handlePage={onChange}
            />
            {
                BUILD_APP_ENV === 'opensource' &&
                <ResetModal ref={resetRef} />
            }
        </div>
    );

};

export default UserManagementTable;