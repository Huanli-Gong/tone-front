import { message } from 'antd';
import React from 'react';
import { useModel } from 'umi';
/**
    权限管理 逻辑处理  超级管理员和系统管理员优先于ws级角色 可操作ws任何东西
 */
//  逻辑：如果系统级角色不是超级管理员和系统管理员 或 ws级角色可以操作的逻辑  
export const AuthCommon = (props: any) => {
    const { isAuth, children } = props
    const { initialState } = useModel('@@initialState');
    const sysAuth = initialState?.authList
    const { sys_role_title, ws_role_title } = sysAuth
    //公共方法
    
    if (isAuth.includes( sys_role_title)) {
        return <span onClick={() => props.onClick()} >{children}</span>;
    }else{
        if (isAuth.includes(ws_role_title)) {
            return <span onClick={() => props.onClick()} >{children}</span>;
        }
        return <span onClick={() => message.error('没有权限操作')} >{children}</span>
    }
    
}
 
export const AuthForm = (props: any) => {
    const { isAuth, children, onFirm } = props
    const { initialState } = useModel('@@initialState');
    const sysAuth = initialState?.authList
    const { sys_role_title,ws_role_title } = sysAuth
    //公共方法
    if (isAuth.includes(sys_role_title )) {
        return <span>{onFirm}</span>;
    }else{
        if (isAuth.includes(ws_role_title )) {
            return <span>{onFirm}</span>;
        }
        return <span onClick={() => message.error('没有权限操作')} >{children}</span>
    } 
}











// interface AuthProps {
//     isAuth?: 'member' | 'admin' | 'visiter'
// }

// import StopImg from '@/assets/svg/stop.svg'

// const content = (
//     <div>
//         <img src={StopImg}></img><span style={{ marginLeft: 6 }}>无权限</span>
//     </div>
// )