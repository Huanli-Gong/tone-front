import React from 'react';
import { BasicLayoutProps, Settings as ProSettings } from '@ant-design/pro-layout';

import { notification } from 'antd';
import { history, RequestConfig } from 'umi';
import Headers from '@/components/Header'
import { person_auth } from '@/services/user';
import defaultSettings from '../config/defaultSettings';
import { enterWorkspaceHistroy } from '@/services/Workspace'
import { deepObject } from '@/utils/utils';

const ignoreRoutePath = ['/500', '/401', '/404', BUILD_APP_ENV === 'opensource' && '/login'].filter(Boolean)

const wsReg = /^\/ws\/([a-zA-Z0-9]{8})\/.*/

export async function getInitialState(): Promise<any> {
    const initialState = {
        settings: defaultSettings,
        refreshMenu: false,
        refreshWorkspaceList: undefined,
        jobTypeList: [],
        authList: {}
    };
    const { pathname } = window.location
    if (!ignoreRoutePath.includes(history.location.pathname)) {
        const isWs = wsReg.test(pathname)
        const matchArr = pathname.match(wsReg)
        const ws_id = matchArr ? matchArr[1] : undefined

        const { data } = await person_auth({ ws_id })
        const accessList: any = deepObject(data)
        const { ws_is_exist, ws_role_title } = accessList

        if (!accessList) {
            history.push('/500')
            return initialState
        }
        if (isWs) {
            //这个ws是否存在
            if (!ws_is_exist) {
                history.push('/404')
                return initialState
            }
            if (!ws_role_title) {
                history.push({ pathname: '/401', state: ws_id })
                return initialState
            }
            enterWorkspaceHistroy({ ws_id })  //
        }

        return {
            ...initialState,
            authList: {
                ws_id,
                ...accessList,
            },
        }
    }

    return initialState
}

export const layout = ({
    initialState,
}: {
    initialState: { settings?: ProSettings };
}): BasicLayoutProps => {
    return {
        disableContentMargin: false,
        footerRender: false,
        menuHeaderRender: false,
        menuRender: false,
        headerRender: props => <Headers {...props} />,
        onMenuHeaderClick: () => false,
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
const errorHandler = (error: { response: Response }): Response | undefined => {
    const { response } = error;
    notification.config({ top: 88 })
    // 网络状态码500报错优化
    if (response) {
        const { status, statusText, url } = response
        if (status >= 500) {
            // notification.error({ message: '系统异常，请联系系统管理员' });
            history.push(`/500`)
        }
        else {
            const errorText = codeMessage[status] || statusText;
            notification.error({
                message: `请求错误 ${status}: ${url}`,
                description: errorText,
            });
        }
    }
    if (!response) {
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
