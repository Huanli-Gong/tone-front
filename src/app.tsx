import React from 'react';
import { BasicLayoutProps, Settings as ProSettings } from '@ant-design/pro-layout';

import { notification } from 'antd';
import { history, RequestConfig } from 'umi';
import Headers from '@/components/Header'
import { person_auth , goldmineAnalysis } from './services/user';
import { workspaceHistroy } from './services/Workspace'
import defaultSettings from '../config/defaultSettings';

export async function getInitialState(): Promise<any> {
    let authList : any ;
    if (history.location.pathname !== '/user/login') {
        const ws_id = window.location.pathname.replace(/\/ws\/([a-zA-Z0-9]{8})\/.*/, '$1')
        try {
            if (window.location.pathname.indexOf('ws') === -1) {
                const data = await person_auth({})
                if (data.code === 200) {
                    authList = Object.assign(data.data,{})
                }
            } else {
                const data = await person_auth({ ws_id })
                if (data.code === 200) {
                    
                    authList = Object.assign(data.data,{})
                    if(data.data.ws_is_exist){  //这个ws是否存在
                        if(data.data.ws_is_public){
                            await workspaceHistroy({ ws_id }) 
                        }else{
                            if(data.data.sys_role_title == 'sys_test_admin' || data.data.sys_role_title == 'user'){
                                if(data.data.ws_role_title === null)
                                    history.push({ pathname:'/401',state: ws_id })
                            }
                        }
                    }else{
                        history.push('/404')
                    }
                }
            }
        }
        catch (error) {
            history.push('/user/login')
        }
    }
    
    return {
        settings: defaultSettings,
        refreshMenu: false,
        refreshWorkspaceList: false,
        jobTypeList: [],
        authList
    };
}
export const layout = ({
    initialState,
}: {
    initialState: { settings?: ProSettings };
}): BasicLayoutProps => {
    const origin = window.location.origin
    const { authList } : any = initialState
    return {
        disableContentMargin: false,
        footerRender: false,
        menuHeaderRender: false,
        menuRender: false,
        headerRender: props => <Headers {...props} />,
        onMenuHeaderClick: () => false ,
        onPageChange : ( location ) => {
            goldmineAnalysis({
                request_url : origin + location?.pathname,
                emp_id : authList?.emp_id
            })
        },
        ...initialState?.settings,
    };
};

const codeMessage = {
    200: '服务器成功返回请求的数据。',
    201: '新建或修改数据成功。',
    202: '一个请求已经进入后台排队（异步任务）。',
    204: '删除数据成功。',
    400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
    401: '用户没有权限（令牌、用户名、密码错误）。',
    403: '用户得到授权，但是访问是被禁止的。',
    404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
    406: '请求的格式不可得。',
    410: '请求的资源被永久删除，且不会再得到的。',
    422: '当创建一个对象时，发生一个验证错误。',
    500: '服务器发生错误，请检查服务器。',
    502: '网关错误。',
    503: '服务不可用，服务器暂时过载或维护。',
    504: '网关超时。',
};

/**
 * 异常处理程序
 */
const errorHandler = (error: { response: Response }): Response => {
    const { response } = error;
    notification.config({ top: 88 })
    // 网络状态码500报错优化
    if (response && response.status === 500) {
        notification.error({
            message: '系统异常，请联系系统管理员',
        });
    } else if (response && response.status) {
        const errorText = codeMessage[response.status] || response.statusText;
        const { status, url } = response;

        notification.error({
            message: `请求错误 ${status}: ${url}`,
            description: errorText,
        });
    } else if (!response) {
        notification.error({
            description: '您的网络发生异常，无法连接服务器',
            message: '网络异常',
        });
    }
    return response;
};

export const request: RequestConfig = {
    errorHandler,
}



    // responseInterceptors: [
    //     (async response => {
    //         const data = await response.clone().json();
    //         const urlParams = new URL(window.location.href) || {};
    //         // 用于: Test suite页面数据已不存在的情况下跳404页面。
    //         if ((data && data.code === 404 ) && urlParams.pathname !== '/404') {
    //             window.location.href = '/404';
    //         }
    //         return response;
    //     }),
    // ],
    // 默认错误处理
    // credentials: 'include', // 默认请求是否带上cookie
    // requestInterceptors: [
    //     ( url, options ) => {
    //         if ( process.env.NODE_ENV === 'development' ) {
    //             const headers = {
    //                 'Cookie': 'csrftoken=M9TLciNFFl9DQGQDJgd4tWNn1OtgG24aY72uSfC0ZU4NAoGWVxRGnypvxS0IdMU3;sessionid=mfv3l0t2nqdy5881wi6ss15tsoa00jiq;'
    //             }
    //             return {
    //                 url , 
    //                 options : {
    //                     ...options ,
    //                     headers
    //                 }
    //             }
    //         }
    //         return { url ,options }
    //     }
    // ]

// export function onRouteChange({ matchedRoutes } : any ) {
//     if (matchedRoutes.length) {
//         const matchRoute = matchedRoutes[matchedRoutes.length - 1].route
//         console.log( matchRoute )
//         console.log( <FormattedMessage id={`menu.${ matchRoute.name }`} />)
//         const metaTitle = ''
//         document.title = metaTitle || '';
//     }
// }
    // 如果是登录页面，不执行
    // if ( history.location.pathname !== '/user/login' ) {
    //     try {
    //         const currentUser = await queryCurrent()
    //         return {
    //             currentUser,
    //             settings: defaultSettings,
    //         }
    //     } 
    //     catch (error) {
    //         history.push('/user/login');
    //     }
    // }
    //如果是登录页面，不执行


// import { queryCurrent } from './services/user';
// import 'default-passive-events'

// {
//     //currentUser?: API.CurrentUser;
//     settings?: ProSettings;
//     refreshMenu?: boolean,
//     refreshWorkspaceList?: boolean,
//     jobTypeList: any,
// }
// window.localStorage.setItem('role_title', data.data.role_title)
                    // window.localStorage.setItem('role_title', data.data.sys_role_title)
                    // window.localStorage.setItem('role_ws_title', data.data.role_title)