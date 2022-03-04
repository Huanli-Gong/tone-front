import React from 'react';
import { Select, message } from 'antd';
import { updateWorkspaceMember } from '@/services/Workspace'
import styles from './index.less';
import { requestCodeMessage, switchUserRole } from '@/utils/utils';
import { useParams } from 'umi';

export const EditableCell: React.FC<any> = (props) => {
    const { ws_id } = useParams() as any
    const { user_info, select, is_owner } = props

    const { role_list, id } = user_info
    const defaultName = role_list.map((item: any) => item.name)

    const onSelect = async (value: any) => {
        const data = await updateWorkspaceMember({
            ws_id,
            role_id: value,
            user_id: id,
        })
        if (data.code === 200) {
            message.success('角色修改成功')
            props.handleOk()
            props.onOk()
        } else {
            requestCodeMessage(data.code, data.msg)
        }
    }

    return (
        <div className={styles.roleStyle}>
            {/** */}
            <Select
                size='small'
                value={switchUserRole(defaultName[0])}
                showSearch={false}
                bordered={false}
                showArrow={!is_owner}
                dropdownMatchSelectWidth={false}
                style={{ fontSize: 14, marginLeft: -10 }}
                onSelect={onSelect}
            >
                {select?.map((item: any) => {
                    return <Select.Option value={item.id} key={item.id}>{switchUserRole(item.name)}</Select.Option>
                })}
            </Select>
        </div>
    )
}