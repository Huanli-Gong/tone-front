import React from 'react';
import { Select, message } from 'antd';
import { updateWorkspaceMember } from '@/services/Workspace'
import styles from './index.less';
import { requestCodeMessage, switchUserRole2 } from '@/utils/utils';
import { useParams, useIntl, FormattedMessage  } from 'umi';

export const EditableCell: React.FC<any> = (props) => {
    const { formatMessage } = useIntl()
    const { ws_id } = useParams() as any
    const { user_info, select } = props

    const { role_list, id, can_update } = user_info
    const defaultName = role_list.map((item: any) => item.name)

    const onSelect = async (value: any) => {
        const data = await updateWorkspaceMember({
            ws_id,
            role_id: value,
            user_id: id,
        })
        if (data.code === 200) {
            message.success(formatMessage({id: 'member.role.modified.success'}) )
            props.handleOk()
            props.onOk()
        } else {
            requestCodeMessage(data.code, data.msg)
        }
    }

    if(can_update){
        return (
            <div className={styles.roleStyle}>
                <Select
                    size='small'
                    value={switchUserRole2(defaultName[0], formatMessage)}
                    showSearch={false}
                    bordered={false}
                    dropdownMatchSelectWidth={false}
                    style={{ fontSize: 14, marginLeft: - 10 }}
                    onSelect={onSelect}
                >
                    {select?.map((item: any) => {
                        return <Select.Option value={item.id} key={item.id}>{switchUserRole2(item.name, formatMessage)}</Select.Option>
                    })}
                </Select>
            </div>
        )
    }
    return <span>{switchUserRole2(role_list[0].name, formatMessage)}</span>
}