import React, { useState, useImperativeHandle, useEffect } from 'react';
import { UserTable, UserList, RoleChangeParams, TableListParams } from '../../data.d';
import { Avatar, Space, message, Popconfirm, Typography } from 'antd';
import { userManagementList, roleChange, requestResetPassword } from '../../service';
import CommonTable from '@/components/Public/CommonTable';
import RoleSelect from '../RoleSelect';
import PopoverEllipsis from '@/components/Public/PopoverEllipsis';
import SelectRadio from '@/components/Public/SelectRadio';
import Highlighter from 'react-highlight-words';
import SearchInput from '@/components/Public/SearchInput';
import { FilterFilled } from '@ant-design/icons';
import ResetModal from '../ResetModal';
import { useRef } from 'react';
import AvatarCover from '@/components/AvatarCover';

const UserManagementTable: React.FC<UserList> = ({ onRef, select, RoleChange, onSearch, rolelist }: any) => {
    const [data, setData] = useState<any>({});
    const [loading, setLoading] = useState<boolean>(true);
    const [page, setPage] = useState<number>(1);
    const [size, setSize] = useState<number>(10);
    const [keyword, setKeyword] = useState<string>()
    const [role_id, setRole] = useState<number>();
    const initParams = { page_num: 1, page_size: 10, role_id: role_id }
    const [autoFocus, setFocus] = useState<boolean>(true)
    const [lastName, setLastName] = useState<string>()

    const getManagementList = async (initParams: TableListParams) => {
        setLoading(true)
        setData({ data: [] })
        const dataSource = await userManagementList(initParams)
        setData(dataSource)
        setLoading(false)
    };


    useEffect(() => {
        refresh()
    }, []);

    const onChange = (page_num: any, page_size: any) => {
        let params = { role_id: role_id, page_num: page_num, page_size: page_size, keyword: keyword }
        getManagementList(params)
        setPage(page_num)
        setSize(page_size)
    }

    const refresh = () => {
        let params = { role_id: role_id, page_num: page, page_size: size, keyword: keyword }
        getManagementList(params)
    }

    useImperativeHandle(onRef, () => ({
        search: (keyword: string) => {
            getManagementList({ ...initParams, ...{ page_size: size, keyword: keyword, role_id: role_id } })
            setKeyword(keyword)
        },
        select: (role_id: number) => {
            getManagementList({ ...initParams, ...{ page_size: size, keyword: keyword, role_id: role_id } })
            setRole(role_id)
        },
        handleTab: refresh
    }));

    const handleChange = async (val: number[], row: UserTable) => {
        const params: RoleChangeParams = {
            user_id: row.id,
            role_id: val
        }
        const data = await roleChange(params)
        if (data.code === 200) {
            message.success('修改成功');
            refresh()
        } else {
            message.error(data.msg);
        }
        // 

    }

    const columns: any[] = [{
        title: '成员',
        dataIndex: 'last_name',
        width: 200,
        ellipsis: true,
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
        render: (_: number, row: any) => <Space>
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
        </Space>,
    }, {
        title: '账号',
        dataIndex: 'email',
        ellipsis: true,
        width: 200,
        render: (_: number, row: UserTable) => <PopoverEllipsis title={row.email}></PopoverEllipsis>,
    }, {
        title: '角色',
        dataIndex: 'role_list',
        render: (_: number, row: any) => (
            (select && select.length > 0) &&
            <RoleSelect row={row} select={select} handleChange={handleChange} />
        ),
        width: 170,
        filterIcon: () => <FilterFilled style={{ color: role_id ? '#1890ff' : undefined }} />,
        filterDropdown: ({ confirm }: any) => <SelectRadio list={rolelist} confirm={confirm} onConfirm={(val: any) => RoleChange(val)} roleType="role" />,
    }, {
        title: 'Workspace',
        dataIndex: 'ws_list',
        render: (_: number, row: UserTable) => (
            (row.ws_list && row.ws_list.length > 0) &&
            <PopoverEllipsis title={row.ws_list.join('、')}></PopoverEllipsis>
        ),
        ellipsis: true,
        width: 245,
    }, {
        title: '加入时间',
        dataIndex: 'gmt_created',
        width: 145,
    },
    BUILD_APP_ENV === 'opensource' &&
    {
        title: '操作',
        render: (_: any, row: any) => (
            <Popconfirm
                title="该操作会使原密码失效，且不可逆，请谨慎操作"
                onConfirm={() => resetPasswordConfirm(row)}
                okButtonProps={{ type: "primary", danger: true }}
                okText="重置密码"
                onVisibleChange={() => console.log('visible change')}
            >
                <Typography.Link>重置密码</Typography.Link>
            </Popconfirm>
        )
    }].filter(Boolean);

    const resetPasswordConfirm = async (row: any) => {
        const { code, data, msg } = await requestResetPassword({ user_id: row.id })
        if (code !== 200) {
            message.error(msg ?? data)
            return
        }
        resetRef.current?.show({ password: data, username: row.username })
    }

    const list: UserTable[] = data.data

    const resetRef = useRef<{ show: (p: { password: string, username: string }) => void }>(null)

    return (
        <div>
            <CommonTable
                size="small"
                columns={columns}
                list={list}
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