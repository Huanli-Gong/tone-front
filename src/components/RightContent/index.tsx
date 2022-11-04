import { Row, Dropdown, Menu, Tabs, Badge, message, Button, Space } from 'antd';
import React, { useEffect, useState, useMemo } from 'react';
import { useModel, history, useAccess, Access, useIntl, FormattedMessage } from 'umi';
import SelectLang from './SelectLang'
import styles from './index.less';
import { ReactComponent as MessageIcon } from '@/assets/svg/Nav/icon_notice.svg'
import { ReactComponent as SettingIcon } from '@/assets/svg/Nav/icon_ws_setting.svg'
import PersonCenter from './PersonCenter';
import TaskInform from './components/TaskInform'
import SystemInform from './components/SystemInform';
import { allTagRead, allTagApplyRead } from '@/services/Workspace';
import { requestCodeMessage } from '@/utils/utils';
import ApplyJoinWorkspace from '@/components/ApplyJoinPopover'
import { applyWorkspaceRole } from './services'
import { isNull } from 'lodash';

import { person_auth } from '@/services/user';
import { deepObject } from '@/utils/utils';

import cls from "classnames"

export type SiderTheme = 'light' | 'dark';

const GlobalHeaderRight: React.FC<{ isWs: boolean, wsId: string, routes: any }> = (props) => {
    const { isWs, wsId, routes } = props;
    const { initialState, setInitialState } = useModel('@@initialState');
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
    const { login_url, register_url, ws_need_need_approval, ws_is_public, ws_role_title } = initialState?.authList || {};

    useEffect(() => {
        setDropVisible(false)
    }, [window.location.pathname])

    useEffect(() => {
        if (!wsId) increment()
    }, [wsId])

    const routeRight = useMemo(() => {
        return routes.filter(
            (cur: any) => !cur.inNav && !cur.unaccessible
        )
    }, [routes])

    const jumpPage = () => {
        if(!!routeRight.length){
            const path = routeRight[0].children[0].path
            const realPath = path.replace(':ws_id', wsId)
            if (path && !!realPath.length) {
                history.push(realPath)
            } else {
                history.push({ pathname: '/401', state: wsId })
            }
        }
    }

    const handleAllRead = async () => {
        const data = tab == '1' ? await allTagRead() : await allTagApplyRead()
        if (data.code === 200) {
            setTab(tab)
            increment()
        } else {
            requestCodeMessage(data.code, data.msg)
        }
    }
    const handleVisibleChange = (flag: any) => {
        setDropVisible(flag);
    };
    
    const NoReasonJoinWorkspace: React.FC<any> = () => {
        const handleSubmit = async () => {
            const ws_id = wsId
            const { code, msg } = await applyWorkspaceRole({ ws_id })
            requestCodeMessage(code, msg)
            if (code === 200) {
                const { data } = await person_auth({ ws_id })
                const accessData = deepObject(data)
                setInitialState({ ...initialState, authList: { ...accessData, ws_id } })
            }
        }
        return <Button type="primary" onClick={() => handleSubmit()}>申请加入</Button>
    }

    const needJoinWorkspace = React.useMemo(() => {
        // const isBoolean = Object.prototype.toString.call(ws_is_common) === "[object Boolean]"
        const isBoolean = Object.prototype.toString.call(ws_role_title )=== "[object String]"
        const isTourist = ws_role_title === 'ws_tourist' || ''
        return isWs && access.loginBtn() && ws_is_public && (isBoolean && isTourist)
    }, [isWs, access, ws_is_public, ws_role_title])

    React.useEffect(() => {
        if (!initialState.shakeBtn) return
        const timer = setTimeout(() => {
            setTimeout(() => setInitialState(
                (p: any) => ({ ...p, shakeBtn: undefined })
            ))
        }, 800)
        return () => {
            clearTimeout(timer)
        }
    }, [initialState.shakeBtn])

    return (
        <Row style={{ width: '100%', position: "relative" }} align="middle" justify="end" className={styles.header_warp}>
            {/* {isWs && <ApplyJoinWorkspace ws_id={ wsId }/> } */}
            {
                needJoinWorkspace ?
                <span className={cls("animate__animated", initialState.shakeBtn && "animate__shakeX animate__fast")}>
                    {
                        ws_need_need_approval ?
                            <ApplyJoinWorkspace ws_id={wsId} style={{ margin: 0 }} /> :
                            <NoReasonJoinWorkspace />
                    }
                </span>
                :
                <></>
            }
            {
                isWs &&
                <Access accessible={access.IsWsSetting()}>
                    <SettingIcon
                        onClick={() => jumpPage()}
                        style={{ /* marginRight : 24 , */ cursor: 'pointer' }}
                    />
                </Access>
            }
            {/* <Input prefix={ <SearchOutlined /> } size="large" style={{ width : 192 , marginRight : 34 , borderRadius : 2 }} placeholder="搜索" />  */}
            <Access accessible={access.loginBtn()}>
                <Dropdown
                    arrow={true}
                    overlayClassName={styles.messageDropdownArrowHide}
                    overlay={
                        <Menu>
                            <div className={styles.msg_warp}>
                                <Tabs
                                    defaultActiveKey={tab}
                                    onTabClick={handleTabClick}
                                    style={{ width: 384, height: 'auto' }}
                                    tabBarExtraContent={
                                        <Button type="link"
                                            onClick={handleAllRead}
                                            disabled={tab == '1' ? msgNum.task_msg_unread_num === 0 : msgNum.apply_msg_unread_num === 0}
                                        >
                                            <FormattedMessage id="right.content.all.read" />
                                        </Button>
                                    }
                                >
                                    <Tabs.TabPane key="1" tab={
                                        <Badge dot={msgNum.task_msg_state}><FormattedMessage id="right.content.task.notification" /></Badge>
                                    }>
                                        <TaskInform tab={tab} />
                                    </Tabs.TabPane>
                                    <Tabs.TabPane key="2" tab={
                                        <Badge count={msgNum.apply_msg_unread_num} size="small" offset={[msgNum.apply_msg_unread_num < 10 ? 6 : 12, 0]}>
                                            {/* 系统通知 */}
                                            <FormattedMessage id="right.content.system.notification" />
                                        </Badge>
                                    }>
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
                                <MessageIcon />
                            </Badge> :
                            <Badge className={styles.badge_item} count={msgNum?.apply_msg_unread_num} style={{ cursor: 'pointer' }} overflowCount={99}>
                                <MessageIcon />
                            </Badge>
                    }
                </Dropdown>
            </Access>
            {/* <AvatarDropdown /> */}
            <SelectLang />
            {
                BUILD_APP_ENV ?
                    <Access
                        accessible={access.loginBtn()}
                        fallback={
                            BUILD_APP_ENV === 'openanolis' ?
                                <Space>
                                    <Button type="text" size="small" style={{ color: '#fff', fontWeight: 500 }} onClick={() => location.replace(login_url)}>
                                        <FormattedMessage id="right.content.login" />
                                    </Button>
                                    <Button type="primary" onClick={() => location.replace(register_url)}>
                                        <FormattedMessage id="right.content.register" />
                                    </Button>
                                </Space> :
                                <Space>
                                    <Button
                                        type="text"
                                        style={{ color: '#fff', fontWeight: 500 }}
                                        size="small"
                                        onClick={() => history.push(`/login?redirect_url=${window.location.pathname}`)}
                                    >
                                        <FormattedMessage id="right.content.login" />
                                    </Button>
                                </Space>
                        }
                    >
                        <PersonCenter />
                    </Access> :
                    <PersonCenter />
            }
        </Row >
    );
};
export default GlobalHeaderRight;