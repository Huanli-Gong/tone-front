/* eslint-disable @typescript-eslint/no-unused-expressions */
import React, { useState, useEffect } from 'react'
import CommonTable from '@/components/Public/CommonTable';
import { useIntl, FormattedMessage } from 'umi';
import { roleList } from '../../service';
import { switchUserRole2 } from '@/utils/utils';

const RoleManagementTable: React.FC<any> = () => {
    const { formatMessage } = useIntl()
    const [source, setSource] = useState<any>();
    const [loading, setLoading] = useState<boolean>(false)
    const getRoleList = async () => {
        setLoading(true)
        const { data } = await roleList({ role_type: '' })
        setLoading(false)
        data && setSource(data)
    };

    useEffect(() => {
        getRoleList();
    }, [])

    const columns = [
        {
            title: <FormattedMessage id="user.role_name" />,
            dataIndex: 'title',
            render: (_: any) => switchUserRole2(_, formatMessage)
        },
        { title: <FormattedMessage id="user.role_desc" />, dataIndex: 'description' }
    ]
    //const list:any[] = data
    return (
        <div>
            <CommonTable
                size="small"
                columns={columns}
                name="sys-user-manage"
                dataSource={source?.list || []}
                loading={loading}
                page={source?.page_num}
                pageSize={source?.page_size}
                totalPage={source?.total_page}
                total={source?.total}
                scroll={{ x: '100%' }}
            />
        </div>
    )
}
export default RoleManagementTable;