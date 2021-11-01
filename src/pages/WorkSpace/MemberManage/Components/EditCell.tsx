import React from 'react';
import { Space, Tag, Select, message } from 'antd';
import { updateWorkspaceMember } from '@/services/Workspace'
import styles from './index.less';
import { requestCodeMessage, switchUserRole } from '@/utils/utils';

export const EditableCell: React.FC<any> = (props) => {
    const { ws_id, user_info, select, is_owner } = props
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

    if (is_owner) {
        return (
            <div className={styles.roleStyle}>
                <span style={{ fontSize: 12 }}>所有者</span>
            </div>
        )
    }
    //1.owner 2.admin（管理员）3.member(普通成员)
    if (!user_info.is_self && user_info.can_update) {
        return (
            <div className={styles.roleStyle}>
                <Select
                    size='small'
                    value={switchUserRole(defaultName[0])}
                    showSearch={false}
                    bordered={false}
                    dropdownMatchSelectWidth={false}
                    style={{ fontSize: 12, marginLeft: -10 }}
                    onSelect={onSelect}
                >
                    {
                        select?.map((item: any) => {
                            return <Select.Option value={item.id} key={item.id}>{switchUserRole(item.name)}</Select.Option>
                        })
                    }
                </Select>
            </div>
        )
    }
    return (
        <Space>
            {
                role_list.map(
                    (item: any, index: number) => {
                        let name = ''
                        switch (item.name) {
                            case 'ws_member':
                                name = 'workspace成员'
                                break;
                            case 'ws_test_admin':
                                name = '测试管理员'
                                break;
                            case 'ws_admin':
                                name = '管理员'
                                break;
                            case 'ws_owner':
                                name = '所有者'
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
            }
        </Space>
    )
}