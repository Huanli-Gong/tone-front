import React, { useCallback } from 'react';
import { LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Menu, Spin, Dropdown } from 'antd';
import ClickParam from 'antd/es/menu';
import { useModel, useIntl, FormattedMessage, request } from 'umi';
import styles from './index.less';
import AvatarCover from '../AvatarCover';
import { OPENANOLIS_LOGOUT_URL } from '@/utils/utils';

/**
 * 退出登录，并且将当前的 url 保存
 */

const PersonCenter = () => {
    const { initialState } = useModel('@@initialState')
    const { authList } = initialState

    const onMenuClick = useCallback(async (event: ClickParam) => {
        const { key }: any = event;
        if (key === 'name') return;
        if (key === 'page') {
            window.open(`${window.location.origin}/personCenter`)
        }
        if (key === 'logout') {
            if (BUILD_APP_ENV) {
                if (BUILD_APP_ENV === 'opensource') {
                    window.location.href = `/api/auth/logout/`
                    return
                }
                if (BUILD_APP_ENV === 'openanolis') {
                    return window.location.href = OPENANOLIS_LOGOUT_URL
                }
            }

            await request('/api/auth/logout/')

            window.location.href = '/'
        }
    }, []);

    const loading = (
        <span className={`${styles.action} ${styles.account}`}>
            <Spin
                size="small"
                style={{
                    marginLeft: 8,
                    marginRight: 8,
                }}
            />
        </span>
    );

    if (!authList || !(authList.first_name || authList.last_name)) {
        return loading;
    }
    const menuHeaderDropdown = (
        <Menu className={`${styles.menu} ${styles.person_menu}`} selectedKeys={[]} onClick={onMenuClick as any}>
            <Menu.Item className={styles.person_name} key="name">
                <Avatar size="small"
                    className={styles.avatar}
                    style={{ background: authList.avatar_color }}
                    src={authList.avatar}
                    alt="avatar"
                >
                    {authList.first_name || authList.last_name?.slice(0, 1)}
                </Avatar>
                {authList.first_name || authList.last_name}
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item key="page">
                <UserOutlined />
                {/* 个人主页 */}
                <FormattedMessage id="right.content.home.page" />
            </Menu.Item>
            <Menu.Item key="logout">
                <LogoutOutlined rotate={-90} />
                {/* 退出登录 */}
                <FormattedMessage id="right.content.logout" />
            </Menu.Item>
        </Menu>
    );
    const noDataMenuHeaderDropdown = (
        <Menu className={styles.menu} />
    );

    return (
        <Dropdown
            overlay={JSON.stringify(authList) === '{}' ? noDataMenuHeaderDropdown : menuHeaderDropdown}
            placement="bottomRight"
            arrow={true}
            overlayClassName={styles.dropdownArrowHide}
        >
            <span className={`${styles.action} ${styles.account}`}>
                {
                    authList.avatar ?
                        <Avatar size="small" className={styles.avatar} src={authList.avatar} alt="avatar" /> :
                        <AvatarCover style={{ display: 'inline-block', marginRight: 8 }} shape="circle" size="small" theme_color={authList.avatar_color} show_name={authList.last_name} />
                }
            </span>
        </Dropdown>
    );
};

export default PersonCenter;
