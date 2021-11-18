import React, { useCallback } from 'react';
import { LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Menu, Spin, Dropdown } from 'antd';
import ClickParam from 'antd/es/menu';
import { useModel } from 'umi';

// import { outLogin, queryOutLogin } from '@/services/login';

import styles from './index.less';

// import request from 'umi-request';

/**
 * 退出登录，并且将当前的 url 保存
 */
const logout = async (login_info:any) => {
    window.location.href = login_info.logout_url
    // //const url = origin
    // let exp:any = new Date();
    // exp.setTime(exp.getTime() - 10000);
    // document.cookie = `name=_oc_ut;value=del;path=/;`
    // await request
    //     .get('/api/auth/logout/')
    //     .then(function (response) {
    //         console.log(response);
    //     })
    //     .catch(function (error) {
    //         console.log(error);
    //     });
    // window.location.reload()
    //window.location.href = `https://login-test.alibaba-inc.com/ssoLogout.htm?APP_NAME=tone&BACK_URL=${url}`
}

const PersonCenter = () => {
    const { initialState } = useModel('@@initialState')
    const { authList } = initialState
    const onMenuClick = useCallback((event: ClickParam) => {
        const { key }:any = event;
        if (key === 'name') return;
        if (key === 'page') {
            window.open(`${window.location.origin}/personCenter`)
        }
        if (key === 'logout') {
            logout(authList.logout_url)
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
        <Menu className={`${styles.menu} ${styles.person_menu}`} selectedKeys={[]} onClick={onMenuClick}>
            <Menu.Item className={styles.person_name} key="name">
                <Avatar size="small" className={styles.avatar} src={authList.avatar} alt="avatar" />
                {authList.first_name || authList.last_name}
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
            overlay={JSON.stringify(authList) === '{}' ? noDataMenuHeaderDropdown : menuHeaderDropdown}
            placement="bottomRight"
            arrow={true}
            overlayClassName={styles.dropdownArrowHide}
        >
            <span className={`${styles.action} ${styles.account}`}>
                <Avatar size="small" className={`${styles.avatar} ${styles.avatar_icon}`} src={authList.avatar} alt="avatar" />
            </span>
        </Dropdown>
    );
};

export default PersonCenter;
