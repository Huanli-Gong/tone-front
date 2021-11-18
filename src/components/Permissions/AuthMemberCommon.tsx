import { message } from 'antd';
import React from 'react';
import { useModel } from 'umi';
/**
    权限：是ws成员只能查看不能操作系列 
 */

// 逻辑：如果系统级角色不是超级管理员和系统管理员并且ws级角色是成员的话  
// export const AuthMember = (props: any) => {   // 按钮
//     const { initialState } = useModel('@@initialState');
//     const sysAuth = initialState?.authList
//     const { sys_role_title, ws_role_title, user_id } = sysAuth
//     const { isAuth, children, creator_id } = props
//     //公共方法
//     if (!isAuth.includes(sys_role_title)) {
//         return <span onClick={() => props.onClick()} >{children}</span>;
//     }else{
//         if (!isAuth.includes(ws_role_title)){
//             return <span onClick={() => props.onClick()} >{children}</span>;
//         } else if(ws_role_title === 'ws_member'){
//             if(Number(user_id) === Number(creator_id)){
//                 return <span onClick={() => props.onClick()} >{children}</span>;
//             }
//         }
//         return <span onClick={() => message.error('没有权限操作')} >{children}</span>
//     }
// }

// export const AuthMemberForm = (props: any) => {  // 组件
//     const { initialState } = useModel('@@initialState');
//     const sysAuth = initialState?.authList
//     const { sys_role_title, ws_role_title, user_id } = sysAuth
//     const { isAuth, children, onFirm, creator_id } = props
//     //公共方法
//     if (!isAuth.includes(sys_role_title)) {
//         return <span>{onFirm}</span>;
//     } else {
//         if (!isAuth.includes(ws_role_title)) {
//             return <span>{onFirm}</span>;
//         } else if (ws_role_title === 'ws_member') {
//             if (Number(user_id) === Number(creator_id)) {
//                 return <span>{onFirm}</span>;
//             }
//         }
//         return <span onClick={() => message.error('没有权限操作')} >{children}</span>
//     }
// }

