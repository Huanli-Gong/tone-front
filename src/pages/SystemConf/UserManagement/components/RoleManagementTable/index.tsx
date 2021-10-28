import React,{ useState, useEffect } from 'react'
import CommonTable from '@/components/Public/CommonTable';
import { roleList } from '../../service';
import { handleRole } from '@/components/Role/index.js';
const RoleManagementTable: React.FC<any> = () => {
    const [data, setData] = useState<any>([]);
    const [loading, setLoading] = useState<boolean>(false)
    const getRoleList = async () => {
        setLoading(true)
        const { data } = await roleList({ role_type: '' })
        setLoading(false)
		data && setData(data)
    };

    useEffect(()=>{
        getRoleList();
    },[])
  
    const columns:any[] = [
        { title:'角色名称',dataIndex:'title',
        render:(_:any) => handleRole(_)
        },
        { title:'角色描述',dataIndex:'description' }
    ]
    //const list:any[] = data
    return(
        <div>
            <CommonTable 
                size="small"
                columns={columns}
                list={data.list}
                loading={loading}
                page={data.page_num}
                pageSize={data.page_size}
                totalPage={data.total_page}
                total={data.total}
                //handlePage={onChange}
            />
        </div>
    )
}
export default RoleManagementTable;