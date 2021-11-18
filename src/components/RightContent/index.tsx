import { Row, Dropdown, Menu, Tabs, Badge, message, Button, Space } from 'antd';
//import { SearchOutlined , SettingOutlined , MessageOutlined } from '@ant-design/icons';
import React, { useEffect, useState } from 'react';
import { useModel, history, useAccess, Access } from 'umi';
import SelectLang from './SelectLang'
// import { ReactComponent as HeaderSetting } from '@/assets/svg/header_setting.svg'
import styles from './index.less';
import { ReactComponent as MessageIcon } from '@/assets/svg/Nav/icon_notice.svg'
import { ReactComponent as SettingIcon } from '@/assets/svg/Nav/icon_ws_setting.svg'
import PersonCenter from './PersonCenter';
import TaskInform from './components/TaskInform'
import SystemInform from './components/SystemInform'
// import Avatar from 'antd/es/avatar/avatar';
// import ApplyJoinWorkspace from '@/components/ApplyJoinPopover'
// import { requestCodeMessage } from '@/utils/utils';
// import { loginAnolis, registerAnolis } from '../../services/Workspace';
export type SiderTheme = 'light' | 'dark';

const GlobalHeaderRight: React.FC<{ isWs: boolean, wsId: string }> = ({ isWs, wsId }) => {
    const { initialState } = useModel('@@initialState');
    const [tab, setTab] = useState('1')
    const [dropVisible, setDropVisible] = useState(false)
    const access = useAccess()
    const handleTabClick = (tab: string) => {
        setTab(tab)
    }
    if (!initialState || !initialState.settings) {
        return null;
    }
    const { msgNum, increment } = useModel('msg', (ret) => ({
        msgNum: ret.msgNum,
        increment: ret.increment,
    }));
    const { navTheme, layout } = initialState.settings;
    let className = styles.right;
    if ((navTheme === 'dark' && layout === 'top') || layout === 'mix') {
        className = `${styles.right}`;
    }
    const { login_url , register_url } = initialState?.authList || {};
    // const queryTask = async () => {
    //     setLoading(true)
    //     const data = await queryTaskMsg({ is_read: '0', page_num: 1, page_size: 4 })
    //     if (data.code === 200) {
    //         setTaskMsgList(data.data)
    //         setLoading(false)
    //     } else {
    //         requestCodeMessage( data.code , data.msg )
    //     }
    // }
    // const querySysMsg = async () => {
    //     setLoading(true)
    //     const data = await queryApplyMsg({ is_read: '0', page_num: 1, page_size: 4 })
    //     if (data.code === 200) {
    //         setSysMsgList(data.data)
    //         setLoading(false)
    //     } else {
    //         requestCodeMessage( data.code , data.msg )
    //     }
    // }
    // useEffect(() => {
    //     if (tab === '1') {
    //         queryTask()
    //     } else {
    //         querySysMsg()
    //     }
    // }, [tab])

    useEffect(() => {
        setDropVisible(false)
    }, [window.location.pathname])

    useEffect(() => {
        if (!wsId) increment()
    }, [wsId])

    const jumpPage = async () => {
        history.push(`/ws/${wsId}/config`)
    }
    const handleVisibleChange = (flag: any) => {
        setDropVisible(flag);
    };
    return (
        <Row style={{ width: '100%' }} align="middle" justify="end" className={styles.header_warp}>
            {/* {isWs && <ApplyJoinWorkspace ws_id={ wsId }/> } */}
            {
                isWs &&
                <Access accessible={access.canWsAdmin()}>
                    <SettingIcon
                        onClick={() => jumpPage()}
                        style={{ /* marginRight : 24 , */ cursor: 'pointer' }}
                    />
                </Access>
            }
            {/* <Input prefix={ <SearchOutlined /> } size="large" style={{ width : 192 , marginRight : 34 , borderRadius : 2 }} placeholder="搜索" />  */}
            <Access accessible={access.loginAndMsgAccess()}>
                <Dropdown
                    arrow={true}
                    overlayClassName={styles.messageDropdownArrowHide}
                    overlay={
                        <Menu>
                            <div className={styles.msg_warp}>
                                <Tabs defaultActiveKey={tab} onTabClick={handleTabClick} style={{ width: 384, height: 'auto' }} >
                                    <Tabs.TabPane key="1" tab={<Badge dot={msgNum.task_msg_state}>任务通知</Badge>}>
                                        <TaskInform tab={tab} />
                                    </Tabs.TabPane>
                                    <Tabs.TabPane key="2" tab={<Badge count={msgNum.apply_msg_unread_num} size="small" offset={[msgNum.apply_msg_unread_num < 10 ? 6 : 12, 0]}>系统通知</Badge>}>
                                        <SystemInform tab={tab} />
                                    </Tabs.TabPane>
                                </Tabs>
                            </div>
                        </Menu>
                    }
                    visible={dropVisible}
                    onVisibleChange={handleVisibleChange}
                    placement="bottomLeft"
                >
                    {
                        msgNum?.apply_msg_unread_num === 0 ?
                            <Badge dot={msgNum?.task_msg_state} style={{ cursor: 'pointer' }}>
                                <MessageIcon style={{ marginLeft: 20 }} />
                            </Badge> :
                            <Badge className={styles.badge_item} count={msgNum?.apply_msg_unread_num} style={{ cursor: 'pointer' }} overflowCount={99}>
                                <MessageIcon style={{ marginLeft: 20 }} />
                            </Badge>
                    }
                </Dropdown>
            </Access>
            {/* <AvatarDropdown /> */}
            <SelectLang />
            <Access accessible={access.loginBtn()}>
                <PersonCenter />
            </Access>
            {
                !access.loginBtn() &&
                <Space>
                    <Button type="text" style={{ color: '#fff', fontWeight: 500 }} onClick={() => location.replace(login_url)}>登录</Button>
                    <Button type="primary" onClick={() => location.replace(register_url)}>注册</Button>
                </Space>
            }
        </Row>
    );
};
export default GlobalHeaderRight;


{/* {
                !access.loginAndMsgAccess() && <Space>
                    <Button type="text" style={{ color:'#fff',fontWeight:500 }} onClick={()=>loginAnolis()}>登录</Button>
                    <Button type="primary" onClick={()=>registerAnolis()}>注册</Button>
                </Space>
            } */}
