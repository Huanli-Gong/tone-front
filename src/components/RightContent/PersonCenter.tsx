import React, { useCallback, useState } from 'react';
import { LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Menu, Spin, Dropdown } from 'antd';
import { ClickParam } from 'antd/es/menu';
import { history, useModel, useRequest } from 'umi';

import { outLogin, queryOutLogin } from '@/services/login';

import styles from './index.less';

import { person_auth_info } from '@/services/user'
import request from 'umi-request';

/**
 * 退出登录，并且将当前的 url 保存
 */
const logout = async () => {
    const url = origin
    await request
        .get('/api/auth/logout/')
        .then(function (response) {
            console.log(response);
        })
        .catch(function (error) {
            console.log(error);
        });
    window.location.href = `https://login-test.alibaba-inc.com/ssoLogout.htm?APP_NAME=tone&BACK_URL=${url}`
}
const PersonCenter = () => {
    const [currentUser, setCurrentUser] = useState<any>(null)
    useRequest(
        person_auth_info,
        {
            formatResult: (response: any) => {
                if (response.code === 200) {
                    setCurrentUser(response.data)
                } else {
                    setCurrentUser({ first_name: 'noData' })
                }
                return { data: {}, total: 0 }
            },
            initialData: { data: {}, total: 0 },
            defaultParams: []
        }
    )
    const onMenuClick = useCallback((event: ClickParam) => {
        const { key } = event;
        if (key === 'name') return;
        if (key === 'page') {
            window.open(`${window.location.origin}/personCenter`)
        }
        if (key === 'logout') {
            logout()
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

    if (!currentUser || !(currentUser.first_name || currentUser.last_name)) {
        return loading;
    }

    const menuHeaderDropdown = (
        <Menu className={`${styles.menu} ${styles.person_menu}`} selectedKeys={[]} onClick={onMenuClick}>

            <Menu.Item className={styles.person_name} key="name">
                <Avatar size="small" className={styles.avatar} src={currentUser.avatar} alt="avatar" />
                {currentUser.first_name || currentUser.last_name}
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item key="page">
                <UserOutlined />
                    个人主页
                </Menu.Item>
            <Menu.Item key="logout">
                <LogoutOutlined rotate={-90} />
                退出登录
            </Menu.Item>
        </Menu>
    );
    const noDataMenuHeaderDropdown = (
        <Menu className={styles.menu} />
    );
    return (
        <Dropdown
            overlay={currentUser.first_name === 'noData' ? noDataMenuHeaderDropdown : menuHeaderDropdown}
            placement="bottomRight"
            arrow={true}
            overlayClassName={styles.dropdownArrowHide}
        >
            <span className={`${styles.action} ${styles.account}`}>
                <Avatar size="small" className={`${styles.avatar} ${styles.avatar_icon}`} src={currentUser.avatar} alt="avatar" />
            </span>
        </Dropdown>
    );
};

export default PersonCenter;
