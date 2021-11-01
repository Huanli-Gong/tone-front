import React, { useState } from 'react';
import { message, Select, Spin, Tag } from 'antd';
import { roleChange } from '../../service'
import styles from './index.less';
import { requestCodeMessage, switchUserRole } from '@/utils/utils';
import { useAccess } from 'umi'

const RoleSelect: React.FC<{ row: any, select: any[], handleChange: (val: number[], row: any) => void }> = ({ row, select, handleChange }: any) => {
    const defaultName = row.role_list.map((item: any) => (item.name))
    const [loading, setLoading] = useState<boolean>(false)
    const { Option } = Select;
    const access = useAccess()
    const handleValueBlur = async (value: any) => {
        setLoading(true)
        const data = await roleChange({ user_id: row.id, role_id: value })
        setLoading(false)
        if (data.code === 200) {
            message.success('角色修改成功')
        } else {
            requestCodeMessage(data.code, data.msg)
        }
    }
    
    return (
        <Spin spinning={loading} >
            <div className={styles.roleStyle}>
                {
                    access.memberSysManageRole(Number(row.role_list[0].id)) ?

                        row.role_list.map(
                            (item: any, index: number) => {
                                let name = ''
                                switch (item.name) {
                                    case 'user':
                                        name = '普通用户'
                                        break;
                                    case 'sys_test_admin':
                                        name = '测试管理员'
                                        break;
                                    case 'sys_admin':
                                        name = '系统管理员'
                                        break;
                                    case 'super_admin':
                                        name = '超级管理员'
                                        break;
                                    default:
                                        break;
                                }
                                return (
                                    <Tag
                                        key={index}
                                        color="rgba(140,140,140,0.1)"
                                        style={{ color: 'rgba(0,0,0,0.65)' }}
                                    >
                                        {name}
                                    </Tag>
                                )
                            }
                        )
                        :
                        <Select
                            size='small'
                            placeholder="请选择角色"
                            defaultValue={switchUserRole(defaultName[0])}
                            style={{ marginLeft: -10 }}
                            dropdownMatchSelectWidth={false}
                            bordered={false}
                            showArrow
                            onSelect={handleValueBlur}
                        >
                            {select.map((item: any) => {
                                return <Option key={item.id} value={item.id} >{switchUserRole(item.name)}</Option>
                            })}
                        </Select>
                }

            </div>
        </Spin>
    )
};
export default RoleSelect;