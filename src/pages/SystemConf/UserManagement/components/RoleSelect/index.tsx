import React, { useState, useMemo, useEffect } from 'react';
import { message, Select, Spin, Tag } from 'antd';
import { useIntl, FormattedMessage, getLocale } from 'umi';
import { roleChange } from '../../service'
import styles from './index.less';
import { requestCodeMessage, switchUserRole2 } from '@/utils/utils';
// import { useAccess } from 'umi'

const RoleSelect: React.FC<{ row: any, select: any[], handleChange: (val: number[], row: any) => void }> = ({ row, select, handleChange }: any) => {
    const { formatMessage } = useIntl()
    const locale = getLocale()

    const defaultName = row.role_list.map((item: any) => (item.name))
    //const [ roleName, setRoleName ] = useState<string>(handleRole(defaultName))
    const [loading, setLoading] = useState<boolean>(false)
    const { Option } = Select;
    const handleValueBlur = async (value:any) => {
        setLoading(true)
        const data = await roleChange({ user_id: row.id, role_id: value })
        setLoading(false)
        if (data.code === 200) {
            message.success(formatMessage({id: 'user.role.edit.successfully'}) )
            setSelectValue(value)
        } else {
            requestCodeMessage(data.code, data.msg)
        }
    }

    const [selectValue, setSelectValue] = useState<any>(undefined)
    useEffect(()=> {
        setSelectValue( row.role_list.map((item: any) => (item.id))[0] )
    }, [row.role_list])

	// console.log('selectValue:', selectValue)
   
    return (
        <Spin spinning={loading} >
        <div className={styles.roleStyle}>
            {/* {row.role_list.map(
                (item: any, index: number) => {
                    let name = ''
                    switch (item.name) {
                        case 'user':
                            name = '普通用户'
                            break;
                        case 'sys_admin':
                            name = '系统管理员'
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
                            { name}
                        </Tag>
                    )
                }
            )} */}
            
            <Select
                size='small'
                placeholder={<FormattedMessage id="user.please.select.role"/>}
                // defaultValue={defaultName}
                value={selectValue}
                style={{ marginLeft: -10 }}
                dropdownMatchSelectWidth={false}
                bordered={false}
                showArrow
                onSelect={handleValueBlur}
            >
                {select.map((item: any) => {
                    return <Option key={item.id} value={item.id}>{switchUserRole2(item.name, formatMessage)}</Option>
                })}
            </Select>
        </div>
    </Spin>
    )
};
export default RoleSelect;